/**
 * Context-Aware Symptom Filtering
 *
 * Validates extracted symptoms by checking surrounding context for supporting evidence.
 * Reduces false positives from ambiguous single-word lemmas like "crash", "head",
 * "sharp", "race", "beat", "back", "chest", "neck", etc.
 *
 * Approach:
 * - Define which lemmas are "context-sensitive" (need supporting evidence)
 * - Specify what evidence validates each lemma (pain words, body parts, etc.)
 * - Specify what evidence invalidates each lemma (non-medical context words)
 * - Check surrounding tokens and adjust confidence or filter accordingly
 */

import { ExtractedSymptom } from '../types';
import { tokenize } from './tokenizer';

// ============================================================================
// CONTEXT VALIDATION RULES
// ============================================================================

/**
 * Context rule for a sensitive lemma.
 * If a lemma has a rule, it needs supporting evidence to be considered valid.
 */
interface ContextRule {
  /** Words that support this being a valid symptom extraction */
  supportingTokens: Set<string>;
  /** Words that indicate this is NOT a symptom (invalidating context) */
  invalidatingTokens: Set<string>;
  /** How many tokens to look around the matched word */
  windowSize: number;
  /** Minimum confidence if no supporting evidence found (below this = filter out) */
  minConfidenceWithoutContext: number;
}

// Shared token sets for reuse across rules
const PAIN_CONTEXT_WORDS = new Set([
  'pain', 'painful', 'ache', 'aching', 'achy', 'hurts', 'hurt', 'hurting',
  'sore', 'soreness', 'tender', 'tenderness', 'cramping', 'cramp',
  'throbbing', 'stabbing', 'shooting', 'burning', 'stinging',
]);

const BODY_FEELING_WORDS = new Set([
  'feeling', 'feel', 'felt', 'feels', 'am', 'been', 'being', 'was',
  'completely', 'totally', 'absolutely', 'really', 'so', 'very',
  'quite', 'pretty', 'super', 'extremely', 'incredibly',
]);

const EXERTION_CONTEXT_WORDS = new Set([
  'walking', 'walked', 'standing', 'exercise', 'exercised', 'shower',
  'showered', 'shopping', 'cleaning', 'cooking', 'working', 'activity',
  'exertion', 'overdid', 'overexerted', 'tired', 'exhausted', 'fatigue',
  'wiped', 'drained', 'spent',
]);

const SYMPTOM_CONTEXT_WORDS = new Set([
  'symptom', 'symptoms', 'flare', 'worse', 'bad', 'terrible',
  'awful', 'horrible', 'severe', 'mild', 'moderate', 'chronic',
]);

/**
 * Context validation rules for ambiguous lemmas.
 * Only lemmas listed here require context checking - all others pass through.
 */
const CONTEXT_RULES: Record<string, ContextRule> = {
  // === PEM/CRASH - High risk of false positives ===
  crash: {
    supportingTokens: new Set([
      ...EXERTION_CONTEXT_WORDS, ...SYMPTOM_CONTEXT_WORDS,
      'pem', 'energy', 'today', 'yesterday', 'after', 'from',
      'hard', 'badly', 'completely', 'total', 'massive', 'big',
    ]),
    invalidatingTokens: new Set([
      'server', 'computer', 'car', 'plane', 'stock', 'market', 'app',
      'software', 'program', 'system', 'browser', 'game', 'party',
      'wedding', 'site', 'website', 'database',
    ]),
    windowSize: 6,
    minConfidenceWithoutContext: 0.35,
  },
  crashed: {
    supportingTokens: new Set([
      ...EXERTION_CONTEXT_WORDS, ...SYMPTOM_CONTEXT_WORDS,
      'pem', 'energy', 'today', 'yesterday', 'after', 'from',
      'hard', 'badly', 'completely', 'total', 'massive', 'big',
    ]),
    invalidatingTokens: new Set([
      'server', 'computer', 'car', 'plane', 'stock', 'market', 'app',
      'software', 'program', 'system', 'browser', 'game', 'party',
      'wedding', 'site', 'website', 'database',
    ]),
    windowSize: 6,
    minConfidenceWithoutContext: 0.35,
  },

  // === BODY PARTS that map to pain symptoms ===
  head: {
    supportingTokens: new Set([
      ...PAIN_CONTEXT_WORDS, 'pounding', 'splitting', 'migraine',
      'pressure', 'throbbing', 'aching', 'killing', 'banging',
    ]),
    invalidatingTokens: new Set([
      'office', 'manager', 'chef', 'count', 'start', 'above', 'direction',
      'top', 'first', 'use', 'keep', 'lost',
    ]),
    windowSize: 4,
    minConfidenceWithoutContext: 0.3,
  },
  back: {
    supportingTokens: new Set([
      ...PAIN_CONTEXT_WORDS, 'spasm', 'spasms', 'stiff', 'stiffness',
      'lower', 'upper', 'middle', 'killing', 'thrown',
    ]),
    invalidatingTokens: new Set([
      'come', 'came', 'coming', 'get', 'go', 'going', 'went',
      'bring', 'brought', 'give', 'gave', 'put', 'look', 'step',
      'hold', 'call', 'bounce', 'fight', 'talk', 'set',
    ]),
    windowSize: 4,
    minConfidenceWithoutContext: 0.3,
  },
  neck: {
    supportingTokens: new Set([
      ...PAIN_CONTEXT_WORDS, 'stiff', 'stiffness', 'tension',
      'tight', 'tightness', 'spasm', 'cricked', 'crick',
    ]),
    invalidatingTokens: new Set([
      'woods', 'bottle', 'guitar', 'necklace', 'red',
    ]),
    windowSize: 4,
    minConfidenceWithoutContext: 0.35,
  },
  chest: {
    supportingTokens: new Set([
      ...PAIN_CONTEXT_WORDS, 'tight', 'tightness', 'pressure',
      'heavy', 'heaviness', 'squeezing', 'palpitations',
    ]),
    invalidatingTokens: new Set([
      'drawer', 'drawers', 'treasure', 'toy', 'ice', 'medicine',
      'tool', 'storage',
    ]),
    windowSize: 4,
    minConfidenceWithoutContext: 0.35,
  },
  joint: {
    supportingTokens: new Set([
      ...PAIN_CONTEXT_WORDS, 'stiff', 'swollen', 'swelling',
      'inflamed', 'locked', 'clicking', 'popping', 'grinding',
    ]),
    invalidatingTokens: new Set([
      'effort', 'venture', 'account', 'operation', 'statement',
      'custody', 'bank',
    ]),
    windowSize: 4,
    minConfidenceWithoutContext: 0.3,
  },
  joints: {
    supportingTokens: new Set([
      ...PAIN_CONTEXT_WORDS, 'stiff', 'swollen', 'swelling',
      'inflamed', 'locked', 'clicking', 'popping', 'grinding',
    ]),
    invalidatingTokens: new Set([
      'effort', 'venture', 'account', 'operation',
    ]),
    windowSize: 4,
    minConfidenceWithoutContext: 0.3,
  },
  muscle: {
    supportingTokens: new Set([
      ...PAIN_CONTEXT_WORDS, 'spasm', 'spasms', 'twitching',
      'weak', 'weakness', 'fatigue', 'tension', 'tense',
    ]),
    invalidatingTokens: new Set([
      'car', 'memory', 'shirt', 'tee',
    ]),
    windowSize: 4,
    minConfidenceWithoutContext: 0.4,
  },
  muscles: {
    supportingTokens: new Set([
      ...PAIN_CONTEXT_WORDS, 'spasm', 'spasms', 'twitching',
      'weak', 'weakness', 'fatigue', 'tension', 'tense',
    ]),
    invalidatingTokens: new Set([
      'car', 'memory',
    ]),
    windowSize: 4,
    minConfidenceWithoutContext: 0.4,
  },

  // === PAIN QUALIFIERS used as standalone ===
  sharp: {
    supportingTokens: new Set([
      ...PAIN_CONTEXT_WORDS, ...new Set([
        'chest', 'head', 'back', 'neck', 'shoulder', 'arm', 'leg',
        'knee', 'stomach', 'abdomen', 'side', 'ribs',
      ]),
    ]),
    invalidatingTokens: new Set([
      'mind', 'wit', 'knife', 'blade', 'turn', 'dressed', 'look',
      'eye', 'tongue', 'contrast', 'increase', 'decline',
    ]),
    windowSize: 5,
    minConfidenceWithoutContext: 0.25,
  },
  burning: {
    supportingTokens: new Set([
      ...PAIN_CONTEXT_WORDS, ...new Set([
        'chest', 'head', 'back', 'neck', 'shoulder', 'arm', 'leg',
        'stomach', 'skin', 'eyes', 'throat', 'feet', 'hands',
        'sensation', 'feeling',
      ]),
    ]),
    invalidatingTokens: new Set([
      'calories', 'candle', 'fire', 'wood', 'fuel', 'money', 'sun',
      'building', 'house', 'midnight', 'bridges', 'rubber',
    ]),
    windowSize: 5,
    minConfidenceWithoutContext: 0.25,
  },

  // === CARDIAC - ambiguous words ===
  race: {
    supportingTokens: new Set([
      'heart', 'pulse', 'chest', 'palpitations', 'pounding',
      'bpm', 'tachycardia', 'tachy', 'fast', 'beats',
    ]),
    invalidatingTokens: new Set([
      'car', 'horse', 'human', 'obstacle', 'marathon', 'track',
      'running', 'competition', 'won', 'lost', 'finished',
    ]),
    windowSize: 5,
    minConfidenceWithoutContext: 0.2,
  },
  racing: {
    supportingTokens: new Set([
      'heart', 'pulse', 'chest', 'palpitations', 'pounding',
      'bpm', 'tachycardia', 'thoughts', 'mind', 'brain',
    ]),
    invalidatingTokens: new Set([
      'car', 'horse', 'game', 'track', 'driver',
    ]),
    windowSize: 5,
    minConfidenceWithoutContext: 0.3,
  },

  // === FATIGUE - ambiguous slang ===
  beat: {
    supportingTokens: new Set([
      ...BODY_FEELING_WORDS, ...SYMPTOM_CONTEXT_WORDS,
      'dead', 'exhausted', 'tired', 'wiped',
    ]),
    invalidatingTokens: new Set([
      'drum', 'drums', 'music', 'song', 'rhythm', 'game', 'opponent',
      'record', 'score', 'egg', 'eggs', 'time', 'clock', 'him', 'her',
      'them', 'it', 'us', 'team',
    ]),
    windowSize: 4,
    minConfidenceWithoutContext: 0.3,
  },
  shattered: {
    supportingTokens: new Set([
      ...BODY_FEELING_WORDS, ...SYMPTOM_CONTEXT_WORDS,
      'exhausted', 'tired', 'wiped', 'drained',
    ]),
    invalidatingTokens: new Set([
      'glass', 'window', 'mirror', 'plate', 'screen', 'phone',
      'vase', 'dreams', 'illusion', 'record',
    ]),
    windowSize: 4,
    minConfidenceWithoutContext: 0.35,
  },
  wrecked: {
    supportingTokens: new Set([
      ...BODY_FEELING_WORDS, ...SYMPTOM_CONTEXT_WORDS,
      'exhausted', 'tired', 'wiped', 'drained',
    ]),
    invalidatingTokens: new Set([
      'car', 'ship', 'building', 'house', 'truck', 'vehicle',
    ]),
    windowSize: 4,
    minConfidenceWithoutContext: 0.35,
  },
  destroyed: {
    supportingTokens: new Set([
      ...BODY_FEELING_WORDS, ...SYMPTOM_CONTEXT_WORDS,
      'exhausted', 'tired', 'wiped', 'drained',
    ]),
    invalidatingTokens: new Set([
      'building', 'house', 'city', 'bridge', 'evidence', 'document',
      'record', 'file',
    ]),
    windowSize: 4,
    minConfidenceWithoutContext: 0.35,
  },
  toast: {
    supportingTokens: new Set([
      ...BODY_FEELING_WORDS, ...SYMPTOM_CONTEXT_WORDS,
      'absolutely', 'totally', 'completely',
    ]),
    invalidatingTokens: new Set([
      'bread', 'butter', 'jam', 'avocado', 'breakfast', 'french',
      'peanut', 'cheese', 'burnt', 'slice',
    ]),
    windowSize: 4,
    minConfidenceWithoutContext: 0.25,
  },
  cooked: {
    supportingTokens: new Set([
      ...BODY_FEELING_WORDS, ...SYMPTOM_CONTEXT_WORDS,
      'absolutely', 'totally', 'completely',
    ]),
    invalidatingTokens: new Set([
      'food', 'dinner', 'lunch', 'meal', 'chicken', 'rice', 'pasta',
      'steak', 'fish', 'breakfast', 'recipe',
    ]),
    windowSize: 4,
    minConfidenceWithoutContext: 0.25,
  },

  // === VERTIGO - ambiguous ===
  spinning: {
    supportingTokens: new Set([
      'room', 'world', 'head', 'dizzy', 'dizziness', 'vertigo',
      'nausea', 'nauseous', 'balance', 'unsteady',
    ]),
    invalidatingTokens: new Set([
      'wheel', 'top', 'yarn', 'class', 'bike', 'record', 'tale',
      'plates', 'web', 'silk',
    ]),
    windowSize: 5,
    minConfidenceWithoutContext: 0.3,
  },

  // === EATING DISORDER - very ambiguous ===
  eating: {
    supportingTokens: new Set([
      'disorder', 'problem', 'issues', 'struggle', 'binge', 'purge',
      'restrict', 'anorexia', 'bulimia', 'trigger', 'fear', 'anxiety',
      'control', 'guilty', 'shame', 'avoiding',
    ]),
    invalidatingTokens: new Set([
      'lunch', 'dinner', 'breakfast', 'snack', 'pizza', 'food',
      'restaurant', 'out', 'together', 'healthy',
    ]),
    windowSize: 5,
    minConfidenceWithoutContext: 0.2,
  },

  // === PEM - "pushed" is very ambiguous ===
  pushed: {
    supportingTokens: new Set([
      ...EXERTION_CONTEXT_WORDS, ...SYMPTOM_CONTEXT_WORDS,
      'myself', 'too', 'hard', 'far', 'through', 'limits', 'beyond',
      'past', 'envelope',
    ]),
    invalidatingTokens: new Set([
      'button', 'door', 'cart', 'stroller', 'chair', 'away', 'aside',
      'back', 'forward', 'him', 'her', 'them',
    ]),
    windowSize: 4,
    minConfidenceWithoutContext: 0.3,
  },
};

// ============================================================================
// SYMPTOM CONFLICT RULES
// ============================================================================

/**
 * Pairs of symptoms that are mutually exclusive or highly unlikely together.
 * If both are detected, the one with lower confidence is flagged.
 */
const CONFLICTING_SYMPTOM_PAIRS: Array<[string, string]> = [
  ['insomnia', 'hypersomnia'],  // Can't have both simultaneously
];

// ============================================================================
// MAIN FILTERING FUNCTIONS
// ============================================================================

/**
 * Check if a lemma has supporting context in surrounding tokens.
 *
 * Returns:
 * - 'valid': Supporting evidence found, extraction is reliable
 * - 'invalid': Invalidating evidence found, extraction is likely false positive
 * - 'uncertain': No strong evidence either way
 */
export function validateLemmaContext(
  token: string,
  tokens: string[],
  tokenIndex: number
): 'valid' | 'invalid' | 'uncertain' {
  const rule = CONTEXT_RULES[token.toLowerCase()];
  if (!rule) {
    // No rule means this lemma doesn't need context validation
    return 'valid';
  }

  const windowStart = Math.max(0, tokenIndex - rule.windowSize);
  const windowEnd = Math.min(tokens.length, tokenIndex + rule.windowSize + 1);

  let hasSupportingEvidence = false;
  let hasInvalidatingEvidence = false;

  for (let i = windowStart; i < windowEnd; i++) {
    if (i === tokenIndex) continue; // Skip the token itself
    const neighborToken = tokens[i].toLowerCase();

    if (rule.supportingTokens.has(neighborToken)) {
      hasSupportingEvidence = true;
    }
    if (rule.invalidatingTokens.has(neighborToken)) {
      hasInvalidatingEvidence = true;
    }
  }

  // Invalidating evidence takes precedence
  if (hasInvalidatingEvidence && !hasSupportingEvidence) {
    return 'invalid';
  }

  if (hasSupportingEvidence) {
    return 'valid';
  }

  return 'uncertain';
}

/**
 * Apply context-aware filtering to extracted symptoms.
 *
 * For each symptom extracted via lemma matching:
 * 1. Check if the lemma has a context rule
 * 2. If so, validate against surrounding context
 * 3. Filter out 'invalid' extractions (likely false positives)
 * 4. Adjust confidence for 'uncertain' extractions
 *
 * Phrase-based extractions are not filtered (already high confidence).
 */
export function applyContextFilter(
  symptoms: ExtractedSymptom[],
  text: string
): ExtractedSymptom[] {
  const tokens = tokenize(text);

  const filtered = symptoms.filter(symptom => {
    // Only filter lemma-based extractions (phrases are inherently more specific)
    if (symptom.method !== 'lemma') return true;

    const matchedToken = symptom.matched.toLowerCase();
    const rule = CONTEXT_RULES[matchedToken];

    // No rule = no filtering needed
    if (!rule) return true;

    // Find the token index
    const tokenIndex = tokens.indexOf(matchedToken);
    if (tokenIndex === -1) return true; // Can't find token, keep it

    const validation = validateLemmaContext(matchedToken, tokens, tokenIndex);

    if (validation === 'invalid') {
      // Strong invalidating evidence - remove this symptom
      return false;
    }

    return true;
  });

  // Adjust confidence for uncertain extractions
  const withAdjustedConfidence = filtered.map(symptom => {
    if (symptom.method !== 'lemma') return symptom;

    const matchedToken = symptom.matched.toLowerCase();
    const rule = CONTEXT_RULES[matchedToken];
    if (!rule) return symptom;

    const tokenIndex = tokens.indexOf(matchedToken);
    if (tokenIndex === -1) return symptom;

    const validation = validateLemmaContext(matchedToken, tokens, tokenIndex);

    if (validation === 'uncertain') {
      // No supporting evidence - cap confidence at rule's minimum
      const currentConfidence = symptom.confidence ?? 0.5;
      const adjustedConfidence = Math.min(currentConfidence, rule.minConfidenceWithoutContext);

      return {
        ...symptom,
        confidence: adjustedConfidence,
      };
    }

    return symptom;
  });

  return withAdjustedConfidence;
}

/**
 * Detect conflicting symptom pairs and resolve by keeping the higher confidence one.
 * Returns the filtered list with conflicts resolved.
 */
export function resolveSymptomConflicts(
  symptoms: ExtractedSymptom[]
): ExtractedSymptom[] {
  const toRemove = new Set<number>();

  for (const [symptomA, symptomB] of CONFLICTING_SYMPTOM_PAIRS) {
    const indexA = symptoms.findIndex(s => s.symptom === symptomA);
    const indexB = symptoms.findIndex(s => s.symptom === symptomB);

    if (indexA !== -1 && indexB !== -1) {
      // Both conflicting symptoms found - keep the one with higher confidence
      const confA = symptoms[indexA].confidence ?? 0.5;
      const confB = symptoms[indexB].confidence ?? 0.5;

      if (confA >= confB) {
        toRemove.add(indexB);
      } else {
        toRemove.add(indexA);
      }
    }
  }

  return symptoms.filter((_, index) => !toRemove.has(index));
}

/**
 * Check if a lemma requires context validation.
 * Useful for the extraction pipeline to know if extra validation is needed.
 */
export function isContextSensitiveLemma(token: string): boolean {
  return token.toLowerCase() in CONTEXT_RULES;
}

/**
 * Get the minimum confidence for a context-sensitive lemma without supporting evidence.
 */
export function getMinConfidenceWithoutContext(token: string): number {
  const rule = CONTEXT_RULES[token.toLowerCase()];
  return rule?.minConfidenceWithoutContext ?? 0.5;
}
