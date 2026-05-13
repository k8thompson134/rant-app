/**
 * Energy Tier Inference
 * Infers physical and cognitive capacity tiers from natural language
 * Maps natural descriptions and activities to functional capacity levels
 */

import { FunctionalCapacity, PhysicalCapacityTier, CognitiveCapacityTier, AttemptOutcome, SensoryLoadFlag } from '../types';
import { tokenize } from './tokenizer';

/**
 * Physical capacity signals: what activities/states map to which P-tier
 * Key = phrase/activity, Value = { tier, confidence }
 */
const PHYSICAL_SIGNALS: Record<string, { tier: PhysicalCapacityTier; confidence: number }> = {
  // P-2 signals
  'bedbound': { tier: 'P-2', confidence: 0.95 },
  'bed bound': { tier: 'P-2', confidence: 0.95 },
  'in bed': { tier: 'P-2', confidence: 0.85 },

  // P-1 signals
  'couldn\'t get off the couch': { tier: 'P1', confidence: 0.95 },
  'couldn\'t get off couch': { tier: 'P1', confidence: 0.95 },
  'couldn\'t get up': { tier: 'P1', confidence: 0.90 },
  'couldn\'t leave bed': { tier: 'P-1', confidence: 0.95 },
  'mostly in bed': { tier: 'P-1', confidence: 0.90 },
  'mostly bedbound': { tier: 'P-1', confidence: 0.95 },

  // P0 signals
  'couch bound': { tier: 'P0', confidence: 0.95 },
  'on the couch': { tier: 'P1', confidence: 0.80 }, // Could be P1 or P0 depending on context
  'stuck on couch': { tier: 'P0', confidence: 0.90 },
  'couldn\'t stand': { tier: 'P0', confidence: 0.85 },
  'couldn\'t move': { tier: 'P0', confidence: 0.90 },

  // P1 signals
  'on the couch': { tier: 'P1', confidence: 0.75 },
  'stayed on couch': { tier: 'P1', confidence: 0.85 },
  'sat on couch': { tier: 'P1', confidence: 0.80 },
  'lying down': { tier: 'P0', confidence: 0.75 },
  'had to lie down': { tier: 'P0', confidence: 0.85 },

  // P2 signals
  'made it to the kitchen': { tier: 'P2', confidence: 0.95 },
  'got to the kitchen': { tier: 'P2', confidence: 0.95 },
  'got up': { tier: 'P2', confidence: 0.85 },
  'went to the bathroom': { tier: 'P2', confidence: 0.90 },
  'bathroom': { tier: 'P2', confidence: 0.70 }, // Ambiguous alone

  // P3 signals
  'took a shower': { tier: 'P3', confidence: 0.95 },
  'showered': { tier: 'P3', confidence: 0.95 },
  'took a bath': { tier: 'P2', confidence: 0.95 }, // Bath = lower standing tolerance
  'bathed': { tier: 'P2', confidence: 0.90 },
  'did the dishes': { tier: 'P3', confidence: 0.95 },
  'washed dishes': { tier: 'P3', confidence: 0.95 },
  'tidied': { tier: 'P3', confidence: 0.85 },
  'did some tidying': { tier: 'P3', confidence: 0.85 },
  'walked around': { tier: 'P3', confidence: 0.85 },
  'walked a bit': { tier: 'P3', confidence: 0.85 },

  // P4 signals
  'quick errand': { tier: 'P4', confidence: 0.95 },
  'ran an errand': { tier: 'P4', confidence: 0.95 },
  'went out briefly': { tier: 'P4', confidence: 0.90 },
  'short drive': { tier: 'P4', confidence: 0.90 },
  'drove myself': { tier: 'P4', confidence: 0.85 },
  'grabbed one thing': { tier: 'P4', confidence: 0.90 },
  'quick trip': { tier: 'P4', confidence: 0.90 },

  // P5 signals
  'went for a walk': { tier: 'P5', confidence: 0.95 },
  'went out and did something': { tier: 'P5', confidence: 0.95 },
  'went out': { tier: 'P4', confidence: 0.80 }, // Ambiguous, defaults lower
  'did something': { tier: 'P5', confidence: 0.70 }, // Very ambiguous

  // P+ signals
  'could have done more': { tier: 'P+', confidence: 0.95 },
  'paced myself': { tier: 'P+', confidence: 0.85 },
  'didn\'t push myself': { tier: 'P+', confidence: 0.85 },
};

/**
 * Cognitive capacity signals: what activities/states map to which C-tier
 */
const COGNITIVE_SIGNALS: Record<string, { tier: CognitiveCapacityTier; confidence: number }> = {
  // C-1 signals
  'can\'t process anything': { tier: 'C-1', confidence: 0.95 },
  'no input possible': { tier: 'C-1', confidence: 0.95 },
  'can\'t listen': { tier: 'C-1', confidence: 0.90 },

  // C0 signals
  'couldn\'t handle anything': { tier: 'C0', confidence: 0.95 },
  'couldn\'t focus': { tier: 'C1', confidence: 0.85 }, // Could be C0-C1
  'overwhelming': { tier: 'C0', confidence: 0.85 },
  'brain just shut down': { tier: 'C0', confidence: 0.95 },
  'completely fried': { tier: 'C0', confidence: 0.90 },

  // C1 signals
  'comfort rewatch': { tier: 'C1', confidence: 0.95 },
  'familiar show': { tier: 'C1', confidence: 0.95 },
  'comfort watch': { tier: 'C1', confidence: 0.95 },
  'familiar content': { tier: 'C1', confidence: 0.90 },
  'ambient content': { tier: 'C1', confidence: 0.90 },
  'just listening': { tier: 'C1', confidence: 0.85 },
  'with eyes closed': { tier: 'C1', confidence: 0.90 },

  // C2 signals
  'doom scrolling': { tier: 'C2', confidence: 0.95 },
  'just scrolling': { tier: 'C2', confidence: 0.90 },
  'light scrolling': { tier: 'C2', confidence: 0.95 },
  'reality tv': { tier: 'C2', confidence: 0.95 },
  'familiar show': { tier: 'C2', confidence: 0.85 }, // Could be C1-C2

  // C3 signals
  'watched something new': { tier: 'C3', confidence: 0.95 },
  'followed a plot': { tier: 'C3', confidence: 0.95 },
  'reading': { tier: 'C3', confidence: 0.85 },
  'read': { tier: 'C3', confidence: 0.85 },
  'conversation': { tier: 'C3', confidence: 0.85 },
  'talking': { tier: 'C3', confidence: 0.80 }, // Ambiguous

  // C4 signals
  'got some work done': { tier: 'C4', confidence: 0.95 },
  'did some work': { tier: 'C4', confidence: 0.95 },
  'deskwork': { tier: 'C4', confidence: 0.95 },
  'worked': { tier: 'C4', confidence: 0.85 },
  'studied': { tier: 'C4', confidence: 0.95 },
  'coding': { tier: 'C4', confidence: 0.95 },
  'writing': { tier: 'C4', confidence: 0.95 },
  'focused work': { tier: 'C4', confidence: 0.95 },

  // C+ signals
  'sustained conversation': { tier: 'C+', confidence: 0.95 },
  'back and forth': { tier: 'C+', confidence: 0.90 },
  'had a real conversation': { tier: 'C+', confidence: 0.95 },
  'talking for a while': { tier: 'C+', confidence: 0.85 },
};

/**
 * Outcome signals: what phrases indicate attempt success
 */
const OUTCOME_SIGNALS: Record<string, AttemptOutcome> = {
  // Completed without cost
  'took a shower': 'completed',
  'managed': 'completed',
  'was fine': 'completed',
  'okay': 'completed',

  // Completed with cost
  'wiped out': 'completed_cost',
  'exhausted after': 'completed_cost',
  'crashed after': 'completed_cost',
  'paid for it': 'completed_cost',
  'knocked me out': 'completed_cost',

  // Attempted, couldn't finish
  'tried to': 'attempted',
  'started but': 'attempted',
  'got partway': 'attempted',
  'had to stop': 'attempted',
  'couldn\'t finish': 'attempted',

  // Unable
  'wanted to but': 'unable',
  'couldn\'t even': 'unable',
  'didn\'t have': 'unable',
};

/**
 * Sensory load indicators
 */
const SENSORY_SIGNALS: Record<string, keyof SensoryLoadFlag> = {
  'lights': 'light',
  'light sensitivity': 'light',
  'bright': 'light',
  'eye mask': 'light',
  'hurt my eyes': 'light',
  'couldn\'t handle the light': 'light',
  'blackout curtains': 'light',

  'loud': 'sound',
  'noise': 'sound',
  'sound sensitivity': 'sound',
  'couldn\'t handle noise': 'sound',
  'earplugs': 'sound',
  'turned everything down': 'sound',

  'overwhelming': 'combined',
  'sensory overload': 'combined',
  'too much': 'combined',
  'restaurant': 'combined',
  'event': 'combined',
  'crowded': 'combined',

  'smell': 'smell',
  'scents': 'smell',
  'couldn\'t handle any smells': 'smell',

  'touch hurts': 'touch',
  'can\'t stand touch': 'touch',
  'sheets hurt': 'touch',
  'hyperesthesia': 'touch',

  'temperature': 'temperature',
  'can\'t regulate temperature': 'temperature',
  'too hot': 'temperature',
  'too cold': 'temperature',
};

/**
 * Extract physical capacity tier from text
 */
export function extractPhysicalCapacity(text: string): { tier: PhysicalCapacityTier; confidence: number } | null {
  const textLower = text.toLowerCase();
  let bestMatch: { tier: PhysicalCapacityTier; confidence: number } | null = null;

  // Check for multi-word phrases first (higher priority)
  const phraseMatches = Object.entries(PHYSICAL_SIGNALS).filter(
    ([phrase]) => phrase.length > 10 && textLower.includes(phrase)
  );

  if (phraseMatches.length > 0) {
    // Return highest confidence match
    return phraseMatches.reduce(
      (best, [, data]) => (data.confidence > best.confidence ? data : best),
      phraseMatches[0][1]
    );
  }

  // Check single-word activities
  const tokens = tokenize(textLower);
  for (const token of tokens) {
    if (PHYSICAL_SIGNALS[token]) {
      const match = PHYSICAL_SIGNALS[token];
      if (!bestMatch || match.confidence > bestMatch.confidence) {
        bestMatch = match;
      }
    }
  }

  return bestMatch;
}

/**
 * Extract cognitive capacity tier from text
 */
export function extractCognitiveCapacity(text: string): { tier: CognitiveCapacityTier; confidence: number } | null {
  const textLower = text.toLowerCase();
  let bestMatch: { tier: CognitiveCapacityTier; confidence: number } | null = null;

  // Check for multi-word phrases first
  const phraseMatches = Object.entries(COGNITIVE_SIGNALS).filter(
    ([phrase]) => phrase.length > 10 && textLower.includes(phrase)
  );

  if (phraseMatches.length > 0) {
    return phraseMatches.reduce(
      (best, [, data]) => (data.confidence > best.confidence ? data : best),
      phraseMatches[0][1]
    );
  }

  // Check single words
  const tokens = tokenize(textLower);
  for (const token of tokens) {
    if (COGNITIVE_SIGNALS[token]) {
      const match = COGNITIVE_SIGNALS[token];
      if (!bestMatch || match.confidence > bestMatch.confidence) {
        bestMatch = match;
      }
    }
  }

  return bestMatch;
}

/**
 * Extract attempt outcome from text
 */
export function extractOutcome(text: string): AttemptOutcome | null {
  const textLower = text.toLowerCase();

  // Check for outcome signals
  for (const [signal, outcome] of Object.entries(OUTCOME_SIGNALS)) {
    if (textLower.includes(signal)) {
      return outcome;
    }
  }

  return null;
}

/**
 * Extract sensory load flags from text
 */
export function extractSensoryLoad(text: string): SensoryLoadFlag | null {
  const textLower = text.toLowerCase();
  const flags: SensoryLoadFlag = { active: false };

  for (const [signal, flagType] of Object.entries(SENSORY_SIGNALS)) {
    if (textLower.includes(signal)) {
      flags.active = true;
      if (flagType !== 'combined') {
        (flags as any)[flagType] = true;
      } else {
        flags.combined = true;
      }
    }
  }

  // Determine overall severity
  if (flags.active) {
    const activeCount = Object.entries(flags).filter(([k, v]) => k !== 'active' && v === true).length;
    flags.severity = activeCount >= 2 ? 'high' : 'elevated';
  }

  return flags.active ? flags : null;
}

/**
 * Extract the activity being discussed (shower, work, etc)
 */
export function extractActivity(text: string): string | null {
  const activityKeywords = [
    'shower', 'bath', 'work', 'study', 'exercise', 'walk', 'errand',
    'driving', 'cooking', 'cleaning', 'socializing', 'meeting',
  ];

  const textLower = text.toLowerCase();
  for (const activity of activityKeywords) {
    if (textLower.includes(activity)) {
      return activity;
    }
  }

  return null;
}

/**
 * Infer complete functional capacity from text
 */
export function inferFunctionalCapacity(text: string): FunctionalCapacity | null {
  const physicalData = extractPhysicalCapacity(text);
  const cognitiveData = extractCognitiveCapacity(text);

  if (!physicalData && !cognitiveData) {
    return null;
  }

  const sensoryLoad = extractSensoryLoad(text);
  const outcome = extractOutcome(text);
  const activity = extractActivity(text);

  return {
    physical: physicalData?.tier || 'P3', // Default to middle tier if not detected
    cognitive: cognitiveData?.tier || 'C3',
    outcome,
    activity: activity || undefined,
    sensoryLoad: sensoryLoad || undefined,
  };
}
