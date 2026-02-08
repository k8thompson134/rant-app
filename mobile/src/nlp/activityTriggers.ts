/**
 * Activity Trigger Detection
 * Detects activities that trigger symptoms and links them
 * to nearby symptoms using proximity matching.
 */

import { ExtractedSymptom, ActivityTrigger } from '../types';
import { tokenize } from './tokenizer';
import { SYMPTOM_LEMMAS } from './dictionaries/symptoms';

/**
 * Activities that commonly trigger symptoms in chronic illness
 */
const TRIGGER_ACTIVITIES: Record<string, string> = {
  // Physical activities
  'walking': 'walking',
  'walked': 'walking',
  'walk': 'walking',
  'standing': 'standing',
  'stood': 'standing',
  'stand': 'standing',
  'sitting': 'sitting',
  'sat': 'sitting',
  'showering': 'showering',
  'shower': 'showering',
  'showered': 'showering',
  'bathing': 'bathing',
  'bath': 'bathing',
  'cooking': 'cooking',
  'cooked': 'cooking',
  'cleaning': 'cleaning',
  'cleaned': 'cleaning',
  'exercising': 'exercise',
  'exercise': 'exercise',
  'exercised': 'exercise',
  'workout': 'exercise',
  'working out': 'exercise',
  'running': 'running',
  'ran': 'running',
  'jogging': 'jogging',
  'climbing': 'climbing',
  'stairs': 'climbing_stairs',
  'lifting': 'lifting',
  'carrying': 'carrying',
  'bending': 'bending',
  'reaching': 'reaching',
  'stretching': 'stretching',

  // Daily activities
  'shopping': 'shopping',
  'groceries': 'shopping',
  'driving': 'driving',
  'drove': 'driving',
  'commuting': 'commuting',
  'commute': 'commuting',
  'working': 'working',
  'work': 'working',
  'worked': 'working',

  // Social/Mental
  'socializing': 'socializing',
  'social': 'socializing',
  'talking': 'talking',
  'conversation': 'talking',
  'meeting': 'meeting',
  'appointment': 'appointment',
  'doctor': 'medical_appointment',
  'visiting': 'visiting',
  'visit': 'visiting',

  // Screen/Cognitive
  'reading': 'reading',
  'screen': 'screen_time',
  'screens': 'screen_time',
  'computer': 'screen_time',
  'phone': 'screen_time',
  'typing': 'typing',
  'concentrating': 'concentrating',
  'thinking': 'thinking',

  // Food/Drink
  'eating': 'eating',
  'ate': 'eating',
  'meal': 'eating',
  'drinking': 'drinking',
  'caffeine': 'caffeine',
  'coffee': 'caffeine',
  'alcohol': 'alcohol',

  // Environmental
  'heat': 'heat_exposure',
  'sun': 'sun_exposure',
  'cold': 'cold_exposure',
  'noise': 'noise_exposure',
  'lights': 'light_exposure',
  'bright': 'light_exposure',
};

/**
 * Trigger timeframe indicators
 */
const TRIGGER_TIMEFRAMES: Record<string, string> = {
  'after': 'after',
  'from': 'from',
  'following': 'after',
  'since': 'since',
  'during': 'during',
  'while': 'during',
  'when': 'when',
  'because of': 'from',
  'due to': 'from',
  'caused by': 'from',
  'triggered by': 'from',
  'thanks to': 'from',
  'every time': 'every_time',
  'whenever': 'every_time',
};

/**
 * Symptoms commonly linked to activity triggers
 */
const TRIGGER_LINKED_SYMPTOMS = new Set([
  'pem', 'crash', 'fatigue', 'exhaustion', 'flare',
  'dizziness', 'orthostatic', 'presyncope', 'fainting',
  'pain', 'muscle_pain', 'headache',
  'brain_fog', 'nausea', 'palpitations',
  'shortness_of_breath', 'weakness',
]);

/**
 * Temporal delay patterns that indicate relationship between trigger and symptom
 * Maps pattern text to pattern type for classification
 */
const TEMPORAL_DELAY_PATTERNS: Record<string, string> = {
  // Next day patterns
  'next day': 'next_day',
  'day after': 'next_day',
  'following day': 'next_day',
  'crashed the next': 'next_day',

  // Hours later patterns
  'hours later': 'hours_later',
  'hours after': 'hours_later',
  'couple hours': 'hours_later',
  'few hours': 'hours_later',

  // Days later
  'days later': 'days_later',
  'week later': 'week_later',

  // Immediate/same time patterns
  'immediately': 'immediate',
  'right away': 'immediate',
  'right then': 'immediate',
  'instantly': 'immediate',
};

// ============================================================================
// HELPER FUNCTIONS FOR TRIGGER-SYMPTOM LINKING
// ============================================================================

/**
 * Detect temporal delay patterns in text around trigger position
 * Examples: "next day", "hours later", etc.
 */
function detectTemporalDelayPattern(text: string, triggerPos: number, symptomPos: number): string | undefined {
  const minPos = Math.min(triggerPos, symptomPos);
  const maxPos = Math.max(triggerPos, symptomPos);

  // Look in text between trigger and symptom for temporal markers
  const betweenText = text.substring(minPos, maxPos).toLowerCase();
  const lookAheadText = text.substring(triggerPos, triggerPos + 150).toLowerCase();

  // Check patterns between trigger and symptom first (more reliable)
  for (const [pattern, patternType] of Object.entries(TEMPORAL_DELAY_PATTERNS)) {
    if (betweenText.includes(pattern)) {
      return patternType;
    }
  }

  // Check patterns after trigger
  for (const [pattern, patternType] of Object.entries(TEMPORAL_DELAY_PATTERNS)) {
    if (lookAheadText.includes(pattern)) {
      return patternType;
    }
  }

  return undefined;
}

/**
 * Count sentences between two positions in text
 * Returns 0 if same sentence, 1 if adjacent sentences, etc.
 */
function getSentenceDistance(text: string, pos1: number, pos2: number): number {
  const minPos = Math.min(pos1, pos2);
  const maxPos = Math.max(pos1, pos2);

  const betweenText = text.substring(minPos, maxPos);
  // Count sentence-ending punctuation
  const sentenceEndings = (betweenText.match(/[.!?]/g) || []).length;

  return sentenceEndings;
}

/**
 * Calculate confidence score for trigger-symptom relationship
 * Factors considered:
 * - Proximity (character distance, capped at 500)
 * - Sentence distance (same sentence = highest confidence)
 * - Temporal delay pattern (explicit delays get appropriate confidence)
 * - Pattern type (some activities are more reliable triggers)
 *
 * Returns a confidence score from 0-1
 */
function calculateTriggerSymptomConfidence(
  triggerPos: number,
  symptomPos: number,
  delayPattern: string | undefined,
  sentenceDistance: number,
  activity: string
): number {
  let confidence = 0.5; // Base confidence

  const distance = Math.abs(symptomPos - triggerPos);

  // Proximity scoring (normalize by capping at 500 chars)
  const normalizedDistance = Math.min(distance, 500);
  const proximityScore = (500 - normalizedDistance) / 500; // 0-1, higher is closer
  confidence += proximityScore * 0.2; // Proximity worth up to +0.2

  // Sentence distance scoring (most important signal)
  if (sentenceDistance === 0) {
    // Same sentence = very strong signal
    confidence += 0.3;
  } else if (sentenceDistance === 1) {
    // Adjacent sentence = strong signal
    confidence += 0.2;
  } else if (sentenceDistance <= 3) {
    // A few sentences apart = moderate signal
    confidence += 0.1;
  } else {
    // Too many sentences apart = weak signal, floor at 0.4
    confidence = Math.max(confidence - 0.15, 0.4);
  }

  // Temporal delay pattern scoring
  if (delayPattern === 'immediate') {
    // Explicit immediate pattern
    confidence += 0.15;
  } else if (delayPattern === 'next_day') {
    // Next day pattern is very common in PEM (post-exertional malaise)
    confidence += 0.25;
  } else if (delayPattern === 'hours_later') {
    // Hours later pattern
    confidence += 0.15;
  } else if (delayPattern === 'days_later' || delayPattern === 'week_later') {
    // Longer delays are less direct but still valid
    confidence += 0.1;
  }

  // Activity-specific confidence adjustments
  // Some activities are more reliably triggering than others
  const reliableActivities = ['exercise', 'running', 'walking', 'standing', 'working', 'cleaning'];
  if (reliableActivities.includes(activity)) {
    confidence += 0.05; // These activities commonly trigger in ME/CFS
  }

  // Clamp to 0-1 and round to 2 decimal places
  return Math.round(Math.min(1, Math.max(0, confidence)) * 100) / 100;
}

/**
 * Extract activity triggers and link them to symptoms
 *
 * Examples:
 * - "After walking I crashed" -> PEM with trigger { activity: "walking", timeframe: "after" }
 * - "Standing too long made me dizzy" -> dizziness with trigger { activity: "standing" }
 * - "Crashed from the shower" -> PEM with trigger { activity: "showering", timeframe: "from" }
 */
export function extractActivityTriggers(text: string): Map<number, ActivityTrigger> {
  const tokens = tokenize(text);
  const triggers = new Map<number, ActivityTrigger>();
  const textLower = text.toLowerCase();

  // Find activity mentions with timeframe context
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Check if this token is an activity
    if (TRIGGER_ACTIVITIES[token]) {
      const activity = TRIGGER_ACTIVITIES[token];
      let timeframe: string | undefined;

      // Look backwards for timeframe indicators (within 4 tokens)
      for (let j = Math.max(0, i - 4); j < i; j++) {
        const prevToken = tokens[j];
        // Check single words
        if (TRIGGER_TIMEFRAMES[prevToken]) {
          timeframe = TRIGGER_TIMEFRAMES[prevToken];
          break;
        }
        // Check two-word phrases
        if (j < i - 1) {
          const twoWord = `${prevToken} ${tokens[j + 1]}`;
          if (TRIGGER_TIMEFRAMES[twoWord]) {
            timeframe = TRIGGER_TIMEFRAMES[twoWord];
            break;
          }
        }
      }

      // Look forward for symptom indicators (within 8 tokens)
      // This helps us know if this activity is mentioned as a trigger
      let hasSymptomNearby = false;
      for (let j = i + 1; j < Math.min(tokens.length, i + 8); j++) {
        const nextToken = tokens[j];
        if (SYMPTOM_LEMMAS[nextToken] || TRIGGER_LINKED_SYMPTOMS.has(nextToken)) {
          hasSymptomNearby = true;
          break;
        }
      }

      // Also check if symptom was mentioned before (for "crashed from walking" pattern)
      if (!hasSymptomNearby) {
        for (let j = Math.max(0, i - 6); j < i; j++) {
          const prevToken = tokens[j];
          if (SYMPTOM_LEMMAS[prevToken] || TRIGGER_LINKED_SYMPTOMS.has(prevToken)) {
            hasSymptomNearby = true;
            break;
          }
        }
      }

      // If there's a symptom nearby, store the trigger
      if (hasSymptomNearby || timeframe) {
        // Calculate character position for this token for later use
        let charPos = 0;
        for (let k = 0; k < i; k++) {
          charPos = textLower.indexOf(tokens[k], charPos);
          if (charPos === -1) charPos = 0;
          else charPos += tokens[k].length;
        }
        const triggerPos = textLower.indexOf(token, charPos);

        // Detect temporal delay pattern in the text following the trigger
        const delayPattern = detectTemporalDelayPattern(text, triggerPos, triggerPos + 200);

        triggers.set(i, {
          activity,
          timeframe,
          delayPattern, // Add delay pattern information
        });
      }
    }
  }

  return triggers;
}

/**
 * Link extracted symptoms to their potential triggers.
 *
 * Enhanced implementation supporting:
 * - Larger proximity distances with temporal pattern awareness
 * - Confidence scoring for trigger-symptom relationships
 * - Better sentence boundary handling
 * - Multiple trigger candidates ranked by confidence
 *
 * For backward compatibility, only the highest-confidence trigger is attached,
 * but confidence is calculated considering all factors.
 */
export function linkTriggersToSymptoms(
  symptoms: ExtractedSymptom[],
  triggers: Map<number, ActivityTrigger>,
  tokens: string[],
  text: string
): ExtractedSymptom[] {
  if (triggers.size === 0) return symptoms;

  const textLower = text.toLowerCase();

  // Convert token positions to character positions
  const triggerCharPositions: Array<{ pos: number; trigger: ActivityTrigger }> = [];
  let charPos = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (triggers.has(i)) {
      // Find actual position in text
      const tokenPos = textLower.indexOf(tokens[i], charPos);
      if (tokenPos !== -1) {
        triggerCharPositions.push({ pos: tokenPos, trigger: triggers.get(i)! });
        charPos = tokenPos + tokens[i].length;
      }
    }
  }

  if (triggerCharPositions.length === 0) return symptoms;

  // For each symptom, find the BEST matching trigger (highest confidence)
  const symptomTriggerMap = new Map<string, ActivityTrigger>();

  for (const symptom of symptoms) {
    // Only consider symptoms that can have triggers
    if (!TRIGGER_LINKED_SYMPTOMS.has(symptom.symptom)) continue;

    // Find symptom position in text
    const symptomPos = textLower.indexOf(symptom.matched.toLowerCase());
    if (symptomPos === -1) continue;

    let bestTrigger: ActivityTrigger | undefined;
    let bestConfidence = 0;

    // Evaluate all triggers for this symptom
    for (const { pos: triggerPos, trigger } of triggerCharPositions) {
      const distance = Math.abs(symptomPos - triggerPos);
      const sentenceDistance = getSentenceDistance(text, triggerPos, symptomPos);

      // Dynamic proximity threshold based on temporal patterns
      // If there's an explicit temporal pattern (next day, hours later, etc.),
      // allow much larger distances
      let maxProximity = 40; // Default strict proximity
      if (trigger.delayPattern === 'next_day') {
        // Next day patterns can be in different sentences
        maxProximity = 500; // Allow up to 500 chars (roughly a paragraph)
      } else if (trigger.delayPattern === 'hours_later' || trigger.delayPattern === 'days_later') {
        maxProximity = 300;
      } else if (sentenceDistance <= 1) {
        // Adjacent sentences get more lenient distance
        maxProximity = 200;
      }

      // Skip if distance exceeds maximum proximity
      if (distance > maxProximity) continue;

      // Calculate confidence for this specific trigger-symptom pair
      const confidence = calculateTriggerSymptomConfidence(
        triggerPos,
        symptomPos,
        trigger.delayPattern,
        sentenceDistance,
        trigger.activity
      );

      // Keep track of the best (highest confidence) trigger
      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestTrigger = {
          ...trigger,
          confidence: confidence,
          sentenceDistance: sentenceDistance,
        };
      }
    }

    // Link the best trigger if confidence is reasonable
    if (bestTrigger && bestConfidence >= 0.5) {
      const symptomKey = symptom.id || `${symptom.symptom}_${symptom.matched}`;
      symptomTriggerMap.set(symptomKey, bestTrigger);
    }
  }

  // Apply triggers to symptoms
  return symptoms.map(symptom => {
    const symptomKey = symptom.id || `${symptom.symptom}_${symptom.matched}`;
    const trigger = symptomTriggerMap.get(symptomKey);
    if (trigger) {
      return { ...symptom, trigger };
    }
    return symptom;
  });
}
