/**
 * Tokenizer & Negation Detection
 * Core text processing utilities for the symptom extraction pipeline.
 */

// ============================================================================
// NEGATION WORDS
// ============================================================================

export const NEGATION_WORDS = new Set([
  'not',
  'no',
  "n't",
  'never',
  'without',
  'dont',
  "don't",
  'doesnt',
  "doesn't",
  'didnt',
  "didn't",
  'havent',
  "haven't",
  'hasnt',
  "hasn't",
  'isnt',
  "isn't",
  'arent',
  "aren't",
  'wont',
  "won't",
  'cant',
  "can't",
  'none',
  'neither',
  'nothing',
  'nowhere',
  'hardly',
  'barely',
  'scarcely',
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()\[\]{}]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 0);
}

/**
 * Check if a token at a given index is negated by looking at surrounding context
 * Enhanced to handle:
 * - Sentence boundaries (stops at . ! ?)
 * - Longer range negations (up to 10 tokens back)
 * - Prepositional phrases (no signs of, without any, lack of)
 */
export function isNegated(tokens: string[], index: number): boolean {
  // Look back up to 10 tokens, but stop at sentence boundaries
  const maxLookback = 10;
  const start = Math.max(0, index - maxLookback);

  // Check for sentence boundaries first - don't cross them
  for (let i = index - 1; i >= start; i--) {
    const token = tokens[i];

    // Stop at sentence boundaries
    if (token === '.' || token === '!' || token === '?' || token === '') {
      return false;
    }

    // Check for explicit negation words
    if (NEGATION_WORDS.has(token) || token.includes("n't")) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a phrase at a given position is negated (works with text position)
 * Enhanced to handle:
 * - Prepositional phrases (no signs of, without any, lack of)
 * - Sentence boundaries (stops at . ! ?)
 * - Longer range context
 */
export function isPhraseNegated(text: string, phraseIndex: number, lookbackDistance: number = 50): boolean {
  // Look back but stop at sentence boundaries
  const lookbackStart = Math.max(0, phraseIndex - lookbackDistance);

  // Find sentence boundary going backwards
  let actualLookbackStart = lookbackStart;
  for (let i = phraseIndex - 1; i >= lookbackStart; i--) {
    if (text[i] === '.' || text[i] === '!' || text[i] === '?') {
      // Found sentence boundary, only check from here
      actualLookbackStart = Math.max(0, i + 1);
      break;
    }
  }

  const lookbackText = text.substring(actualLookbackStart, phraseIndex).toLowerCase();

  // Comprehensive negation patterns
  const negationPatterns = [
    // Basic negations
    /\b(no|not|never|none|without|lack of|hardly|barely|scarcely)\b/,

    // Contractions
    /n't\b/,

    // Prepositional phrases - these are critical for accuracy
    /\b(no|without|lack of|lacking)\s+\w+\s+of\b/,  // "no signs of", "without any of", "lack of"
    /\b(no|without|lacking)\s+(\w+\s+)*\w+\b/,      // "no pain", "without symptoms"

    // Compound negations
    /\b(not|never|none)\s+(any|a|some|all|much)\b/,
    /\b(hardly|barely|scarcely)\s+(any|a|some|all)\b/,

    // Explicit negation phrases
    /\b(don't|doesn't|didn't|won't|wouldn't|can't|couldn't|shouldn't|mightn't)\s+(have|get|feel|have|experience)/,
    /\b(haven't|hasn't|hadn't)\s+(had|got)/,

    // "I don't" pattern - common in speech
    /\b(i\s+don't|i\s+didn't|i\s+don't|i\s+haven't|i\s+haven't)\b/,
  ];

  for (const pattern of negationPatterns) {
    if (pattern.test(lookbackText)) {
      return true;
    }
  }

  return false;
}
