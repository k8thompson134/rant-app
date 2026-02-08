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

      // Search forward for body parts (within 7 tokens)
      const lookforwardEnd = Math.min(tokens.length, i + 8);
      for (let j = i; j < lookforwardEnd; j++) {
        const nextToken = tokens[j];

        // Check for 3-word phrases first (most specific)
        if (j < tokens.length - 2) {
          const threeWordPhrase = `${nextToken} ${tokens[j + 1]} ${tokens[j + 2]}`;
          const foundLocation = findLocationInDictionaries(threeWordPhrase);
          if (foundLocation) {
            location = foundLocation;
            endIndex = j + 2;
            break;
          }
        }

        // Check for 2-word phrases (e.g., "upper back", "lower back")
        if (j < tokens.length - 1) {
          const twoWordPhrase = `${nextToken} ${tokens[j + 1]}`;
          const foundLocation = findLocationInDictionaries(twoWordPhrase);
          if (foundLocation) {
            location = foundLocation;
            endIndex = j + 1;
            break;
          }
        }

        // Check for single-word body parts (least specific)
        const foundLocation = findLocationInDictionaries(nextToken);
        if (foundLocation) {
          location = foundLocation;
          endIndex = j;
          break;
        }
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
