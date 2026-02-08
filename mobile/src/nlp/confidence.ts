/**
 * Confidence Scoring
 * Calculates confidence scores for extracted symptoms based on
 * extraction method, match specificity, and contextual evidence.
 */

import { ExtractedSymptom } from '../types';

/**
 * Calculate confidence score for an extracted symptom
 * Factors considered:
 * - Extraction method (phrase > pattern > lemma)
 * - Match specificity (length, detail level)
 * - Contextual evidence (triggers, temporal info, severity)
 * - Presence of supporting details (location, qualifiers)
 *
 * Score interpretation:
 * 0.9-1.0: Very high confidence - explicit, detailed mention
 * 0.7-0.9: High confidence - clear indication with context
 * 0.5-0.7: Moderate confidence - reasonable indication
 * 0.3-0.5: Low confidence - single word or minimal context
 * <0.3:   Very low confidence - should be reviewed
 */
export function calculateConfidence(
  symptom: ExtractedSymptom,
  text: string,
  matchIndex: number
): number {
  let confidence = 0.5; // Base confidence

  // ============================================================================
  // METHOD SCORING
  // ============================================================================
  // Phrases are more explicit than lemmas
  if (symptom.method === 'phrase') {
    confidence += 0.2;  // Phrases are very specific
  } else if (symptom.method === 'quick_checkin') {
    confidence += 0.15; // Quick check-in selections are fairly specific
  } else if (symptom.method === 'lemma') {
    confidence += 0.08; // Lemmas are general word forms
  }

  // ============================================================================
  // MATCH SPECIFICITY SCORING
  // ============================================================================
  const matchLength = symptom.matched.split(' ').length;
  if (matchLength >= 4) {
    confidence += 0.15; // Very specific multi-word phrases
  } else if (matchLength === 3) {
    confidence += 0.12; // Specific three-word phrases
  } else if (matchLength === 2) {
    confidence += 0.08; // Two-word combinations
  } else if (matchLength === 1 && symptom.method === 'phrase') {
    confidence += 0.03; // Single-word phrases are less specific
  }

  // ============================================================================
  // SEVERITY/INTENSITY SCORING
  // ============================================================================
  // Explicit severity keywords boost confidence
  if (symptom.severity === 'severe') {
    confidence += 0.08;
  } else if (symptom.severity === 'moderate') {
    confidence += 0.04;
  } else if (symptom.severity === 'mild') {
    confidence += 0.02;
  }

  // ============================================================================
  // PAIN DETAILS SCORING (Highest impact on confidence)
  // ============================================================================
  if (symptom.painDetails) {
    // Location is highly specific
    if (symptom.painDetails.location) {
      confidence += 0.15;
    }

    // Multiple qualifiers increase confidence
    const qualifierCount = symptom.painDetails.qualifiers?.length || 0;
    if (qualifierCount >= 2) {
      confidence += 0.1;  // Multiple descriptors = very specific
    } else if (qualifierCount === 1) {
      confidence += 0.06; // Single descriptor
    }
  }

  // ============================================================================
  // CONTEXTUAL FACTORS SCORING
  // ============================================================================
  // Having a trigger/activity context adds confidence
  if (symptom.trigger) {
    const triggerCount = Array.isArray(symptom.trigger)
      ? symptom.trigger.length
      : 1;

    if (triggerCount >= 2) {
      confidence += 0.08; // Multiple triggers = strong context
    } else if (triggerCount === 1) {
      confidence += 0.05; // Single trigger adds context
    }
  }

  // Having temporal information (duration, time of day) adds confidence
  if (symptom.duration) {
    if (symptom.duration.value && symptom.duration.unit) {
      confidence += 0.08; // Specific duration (e.g., "3 hours")
    } else if (symptom.duration.qualifier) {
      confidence += 0.05; // Qualifier like "all day"
    }

    if (symptom.duration.ongoing) {
      confidence += 0.03; // Ongoing indicator adds context
    }
  }

  // Having time of day information
  if (symptom.timeOfDay && symptom.timeOfDay.length > 0) {
    confidence += 0.05; // Specific time context
  }

  // ============================================================================
  // CONTEXT DENSITY BONUS
  // ============================================================================
  // If symptom is mentioned with other contextual keywords nearby,
  // it's more likely to be accurate
  const contextWindow = text.substring(
    Math.max(0, matchIndex - 50),
    Math.min(text.length, matchIndex + 50)
  ).toLowerCase();

  const contextKeywords = [
    'severe', 'mild', 'moderate', 'sharp', 'dull', 'constant',
    'intermittent', 'sudden', 'gradual', 'worse', 'better',
    'affects', 'triggered', 'caused', 'related',
  ];

  const contextMatches = contextKeywords.filter(kw => contextWindow.includes(kw)).length;
  if (contextMatches >= 3) {
    confidence += 0.05; // Rich context around the symptom
  } else if (contextMatches >= 1) {
    confidence += 0.02; // Some context present
  }

  // ============================================================================
  // RARITY ADJUSTMENT
  // ============================================================================
  // Rare/specific symptoms with explicit mention get higher confidence
  const rareSymptomsIndicators = [
    'paresthesia', 'dysgeusia', 'parosmia', 'brain_zaps', 'postprandial',
    'orthostatic', 'pem', 'air_hunger', 'internal_vibrations',
  ];

  if (rareSymptomsIndicators.includes(symptom.symptom)) {
    // Rare symptoms: if explicitly mentioned with method, high confidence
    if (symptom.method === 'phrase' || symptom.method === 'quick_checkin') {
      confidence += 0.1; // Rare symptoms explicitly mentioned = high confidence
    }
  }

  // ============================================================================
  // FINAL ADJUSTMENTS
  // ============================================================================
  // Ensure confidence stays within valid range
  confidence = Math.min(1, Math.max(0, confidence));

  // Round to 2 decimal places
  return Math.round(confidence * 100) / 100;
}

/**
 * Add confidence scores to all extracted symptoms
 */
export function addConfidenceScores(
  symptoms: ExtractedSymptom[],
  text: string
): ExtractedSymptom[] {
  const textLower = text.toLowerCase();

  return symptoms.map(symptom => {
    // Find the match position in text
    const matchIndex = textLower.indexOf(symptom.matched.toLowerCase());

    return {
      ...symptom,
      confidence: calculateConfidence(symptom, text, matchIndex),
    };
  });
}
