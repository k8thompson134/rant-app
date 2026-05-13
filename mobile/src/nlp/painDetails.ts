/**
 * Pain Details Extraction
 * Extracts pain qualifiers (sharp, burning, etc.) and body locations
 * from text for detailed symptom reporting.
 */

import { tokenize } from './tokenizer';
import { SEVERITY_INDICATORS } from './severity';
import {
  PAIN_QUALIFIERS,
  BODY_PARTS,
  JOINT_LOCATIONS,
  MUSCLE_LOCATIONS,
} from './dictionaries/symptoms';

const DESCRIPTOR_SEVERITY: Record<string, 'mild' | 'moderate' | 'severe'> = {
  slight: 'mild',
  mild: 'mild',
  nagging: 'mild',
  dull: 'mild',
  tender: 'mild',
  sore: 'mild',
  throbbing: 'moderate',
  cramping: 'moderate',
  aching: 'moderate',
  stiff: 'moderate',
  tight: 'moderate',
  radiating: 'moderate',
  shooting: 'severe',
  stabbing: 'severe',
  excruciating: 'severe',
  unbearable: 'severe',
  electric: 'severe',
  burning: 'severe',
  agonizing: 'severe',
};

const COLLOQUIAL_DESCRIPTOR_MAP: Array<{ pattern: RegExp; qualifiers: string[]; severity?: 'mild' | 'moderate' | 'severe' }> = [
  { pattern: /\bpinched nerve\b/, qualifiers: ['sharp', 'localized'], severity: 'severe' },
  { pattern: /\bcharl(?:ie|ey)\s+horse\b/, qualifiers: ['cramping', 'muscular'], severity: 'moderate' },
];

/**
 * Helper function to find location in dictionaries (checks priority order)
 * Checks JOINT_LOCATIONS first (most specific), then MUSCLE_LOCATIONS, then BODY_PARTS
 */
function findLocationInDictionaries(phrase: string): string | null {
  if (JOINT_LOCATIONS[phrase]) return JOINT_LOCATIONS[phrase];
  if (MUSCLE_LOCATIONS[phrase]) return MUSCLE_LOCATIONS[phrase];
  if (BODY_PARTS[phrase]) return BODY_PARTS[phrase];
  return null;
}

function getPhrase(tokens: string[], start: number, length: number): string {
  return tokens.slice(start, start + length).join(' ');
}

function inferSeverityFromQualifiers(qualifiers: string[]): 'mild' | 'moderate' | 'severe' | null {
  let score = 0;
  for (const q of qualifiers) {
    const sev = DESCRIPTOR_SEVERITY[q];
    if (sev === 'severe') score += 3;
    if (sev === 'moderate') score += 2;
    if (sev === 'mild') score += 1;
  }
  if (score >= 3) return 'severe';
  if (score >= 2) return 'moderate';
  if (score >= 1) return 'mild';
  return null;
}

function findBestLocation(tokens: string[], anchor: number): { location: string | null; endIndex: number } {
  const lookbackStart = Math.max(0, anchor - 12);
  const lookforwardEnd = Math.min(tokens.length, anchor + 16);

  // Prefer context after the anchor, but allow before for patterns like "back pain"
  const windows: Array<{ start: number; end: number }> = [
    { start: anchor, end: lookforwardEnd },
    { start: lookbackStart, end: anchor },
  ];

  for (const w of windows) {
    for (let len = 4; len >= 1; len--) {
      for (let i = w.start; i <= w.end - len; i++) {
        const phrase = getPhrase(tokens, i, len);
        const foundLocation = findLocationInDictionaries(phrase);
        if (foundLocation) {
          return { location: foundLocation, endIndex: i + len - 1 };
        }
      }
    }
  }

  return { location: null, endIndex: anchor };
}

/**
 * Extract detailed pain information including qualifiers and body locations
 * This is the optimized version that accepts pre-tokenized tokens
 *
 * Examples:
 * - "burning pain in shoulders" -> {qualifiers: ["burning"], location: "shoulder"}
 * - "severe sharp stabbing pain in my neck" -> {qualifiers: ["sharp", "stabbing"], location: "neck", severity: "severe"}
 * - "cramping in my calves" -> {qualifiers: ["cramping"], location: "calf"}
 */
export function extractPainDetailsFromTokens(tokens: string[]): Array<{
  qualifiers: string[];
  location: string | null;
  severity: 'mild' | 'moderate' | 'severe' | null;
  matchedText: string;
}> {
  const painDetails: Array<{
    qualifiers: string[];
    location: string | null;
    severity: 'mild' | 'moderate' | 'severe' | null;
    matchedText: string;
  }> = [];

  // Pain-related words that trigger pain detail extraction
  const painWords = new Set(['pain', 'hurt', 'hurts', 'hurting', 'ache', 'aches', 'aching', 'sore', 'soreness']);
  const tokenText = tokens.join(' ');
  const phraseQualifierLens = [3, 2];

  // Find all pain mentions in the text
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Check if this is a pain word OR a pain qualifier (cramping, burning, etc.)
    const isPainWord = painWords.has(token);
    const isQualifier = PAIN_QUALIFIERS[token] !== undefined;

    if (isPainWord || isQualifier) {
      const qualifiers: string[] = [];
      let location: string | null = null;
      let severity: 'mild' | 'moderate' | 'severe' | null = null;
      let startIndex = i;
      let endIndex = i;

      // Search backwards for qualifiers and severity (within 6 tokens)
      const lookbackStart = Math.max(0, i - 6);
      for (let j = i - 1; j >= lookbackStart; j--) {
        const prevToken = tokens[j];

        // Check for pain qualifiers
        if (PAIN_QUALIFIERS[prevToken]) {
          qualifiers.unshift(PAIN_QUALIFIERS[prevToken]);
          startIndex = j;
        }

        for (const phraseLen of phraseQualifierLens) {
          if (j - phraseLen + 1 < 0) continue;
          const phrase = getPhrase(tokens, j - phraseLen + 1, phraseLen);
          const mapped = PAIN_QUALIFIERS[phrase];
          if (mapped) {
            qualifiers.unshift(mapped);
            startIndex = Math.min(startIndex, j - phraseLen + 1);
          }
        }

        // Check for severity indicators
        if (SEVERITY_INDICATORS[prevToken]) {
          severity = SEVERITY_INDICATORS[prevToken];
          startIndex = j;
        }
      }

      // If current token is a qualifier, add it
      if (isQualifier) {
        qualifiers.push(PAIN_QUALIFIERS[token]);
      }

      // Search for body parts in a wider local window (after + before anchor)
      const locationMatch = findBestLocation(tokens, i);
      location = locationMatch.location;
      endIndex = Math.max(endIndex, locationMatch.endIndex);

      // Look for multi-word qualifiers close to anchor (e.g., "sharp burning", "dull ache")
      const nearStart = Math.max(0, i - 6);
      const nearEnd = Math.min(tokens.length, i + 6);
      for (let j = nearStart; j < nearEnd; j++) {
        for (const phraseLen of phraseQualifierLens) {
          if (j + phraseLen > tokens.length) continue;
          const phrase = getPhrase(tokens, j, phraseLen);
          const mapped = PAIN_QUALIFIERS[phrase];
          if (mapped) qualifiers.push(mapped);
        }
      }

      // Colloquial mappings (pinched nerve, charlie horse)
      for (const mapping of COLLOQUIAL_DESCRIPTOR_MAP) {
        if (mapping.pattern.test(tokenText)) {
          qualifiers.push(...mapping.qualifiers);
          if (!severity && mapping.severity) severity = mapping.severity;
        }
      }

      if (!severity) {
        severity = inferSeverityFromQualifiers(qualifiers);
      }

      // Only add if we found qualifiers or location (otherwise it's just generic pain)
      if (qualifiers.length > 0 || location !== null) {
        // Remove duplicates from qualifiers
        const uniqueQualifiers = [...new Set(qualifiers)];

        // Extract the matched text
        const matchedText = tokens.slice(startIndex, endIndex + 1).join(' ');

        painDetails.push({
          qualifiers: uniqueQualifiers.length > 0 ? uniqueQualifiers : [],
          location,
          severity,
          matchedText,
        });
      }
    }
  }

  return painDetails;
}

/**
 * Legacy wrapper for extractPainDetails - for backwards compatibility
 * Automatically tokenizes the input text before calling the optimized version
 */
export function extractPainDetails(text: string): Array<{
  qualifiers: string[];
  location: string | null;
  severity: 'mild' | 'moderate' | 'severe' | null;
  matchedText: string;
}> {
  const tokens = tokenize(text);
  return extractPainDetailsFromTokens(tokens);
}
