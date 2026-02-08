/**
 * Symptom Extractor - Main orchestrator
 *
 * Comprehensive symptom extraction with support for:
 * - Pain qualifiers and body parts
 * - Mental health symptoms
 * - Respiratory symptoms
 * - Casual/Gen-Z language
 * - Severity detection
 * - Spoon theory
 * - Chronic illness terminology
 *
 * Sub-modules:
 * - tokenizer.ts: Text tokenization and negation detection
 * - severity.ts: Severity keyword and numeric rating extraction
 * - painDetails.ts: Pain qualifier and body location extraction
 * - spoonCount.ts: Spoon theory energy level extraction
 * - activityTriggers.ts: Activity trigger detection and linking
 * - confidence.ts: Confidence scoring for extracted symptoms
 * - temporal.ts: Duration and time-of-day extraction
 */

import { ExtractionResult, ExtractedSymptom } from '../types';
import {
  SYMPTOM_LEMMAS,
  SYMPTOM_PHRASES,
} from './dictionaries/symptoms';
import { tokenize, isNegated, isPhraseNegated } from './tokenizer';
import { extractNumericSeverity, findSeverity, findSeverityFromTokens, assignDefaultSeverity } from './severity';
import { extractPainDetails } from './painDetails';
import { extractSpoonCount } from './spoonCount';
import { extractActivityTriggers, linkTriggersToSymptoms } from './activityTriggers';
import { addConfidenceScores } from './confidence';
import { addTemporalInfo } from './temporal';
import { applyContextFilter, resolveSymptomConflicts } from './contextFilter';

// ============================================================================
// Re-exports for backward compatibility
// All external consumers can continue importing from './extractor'
// ============================================================================

export { NEGATION_WORDS, tokenize, isNegated, isPhraseNegated } from './tokenizer';
export {
  SEVERITY_INDICATORS,
  COMPARATIVE_PATTERNS,
  DEFAULT_SEVERITY_BY_SYMPTOM,
  extractNumericSeverity,
  detectComparative,
  findSeverityFromTokens,
  findSeverity,
  assignDefaultSeverity,
} from './severity';
export { extractPainDetailsFromTokens, extractPainDetails } from './painDetails';
export { extractSpoonCount } from './spoonCount';
export { extractActivityTriggers, linkTriggersToSymptoms } from './activityTriggers';
export { calculateConfidence } from './confidence';
export { extractDuration, extractTimeOfDay, findTemporalMarkers } from './temporal';
export { applyContextFilter, resolveSymptomConflicts, validateLemmaContext, isContextSensitiveLemma } from './contextFilter';
export { SYMPTOM_LEMMAS } from './dictionaries/symptoms';

// ============================================================================
// MAIN EXTRACTION FUNCTION
// ============================================================================

/**
 * Extract symptoms from text
 * @param text - The input text to analyze
 * @param customLemmas - Optional map of custom user words to symptoms
 */
export function extractSymptoms(
  text: string,
  customLemmas?: Record<string, string>
): ExtractionResult {
  const textLower = text.toLowerCase();
  const foundSymptoms: ExtractedSymptom[] = [];
  const foundCategories = new Set<string>();

  // Merge standard lemmas with custom lemmas (custom takes precedence)
  const allLemmas = customLemmas
    ? { ...SYMPTOM_LEMMAS, ...customLemmas }
    : SYMPTOM_LEMMAS;

  // Step 1: Extract numeric severity ratings
  const numericSeverities = extractNumericSeverity(text);
  const severityMap = new Map<string, 'mild' | 'moderate' | 'severe'>();

  for (const numericSev of numericSeverities) {
    if (numericSev.symptomType) {
      severityMap.set(numericSev.symptomType, numericSev.severity);

      // Add the symptom if not already detected
      if (!foundCategories.has(numericSev.symptomType)) {
        foundSymptoms.push({
          symptom: numericSev.symptomType,
          matched: numericSev.matchedText,
          method: 'phrase',
          severity: numericSev.severity,
        });
        foundCategories.add(numericSev.symptomType);
      }
    }
  }

  // Step 1.5: Extract detailed pain information
  const painDetailsArray = extractPainDetails(text);
  const painDetailsMap = new Map<string, typeof painDetailsArray[0]>();

  // For each pain detail, create a specific symptom based on location
  for (const painDetail of painDetailsArray) {
    let painSymptom = 'pain';

    // Create more specific pain symptom based on location
    if (painDetail.location) {
      if (painDetail.location === 'head' || painDetail.location === 'temple' || painDetail.location === 'forehead') {
        painSymptom = 'headache';
      } else if (painDetail.location === 'neck') {
        painSymptom = 'neck_pain';
      } else if (painDetail.location === 'back' || painDetail.location === 'upper_back' || painDetail.location === 'lower_back') {
        painSymptom = 'back_pain';
      } else if (painDetail.location === 'shoulder' || painDetail.location === 'arm' || painDetail.location === 'hand') {
        painSymptom = 'pain';  // Keep as general pain with location details
      } else if (painDetail.location === 'leg' || painDetail.location === 'knee' || painDetail.location === 'calf' || painDetail.location === 'ankle' || painDetail.location === 'foot') {
        painSymptom = 'pain';  // Keep as general pain with location details
      } else if (painDetail.location === 'stomach' || painDetail.location === 'abdomen' || painDetail.location === 'belly') {
        painSymptom = 'gi_pain';
      } else if (painDetail.location === 'chest') {
        painSymptom = 'chest_pain';
      } else if (painDetail.location === 'whole_body') {
        painSymptom = 'pain';
      }
    }

    // Store pain details for later attachment
    painDetailsMap.set(painSymptom, painDetail);

    // Add the pain symptom if not already detected
    if (!foundCategories.has(painSymptom)) {
      foundSymptoms.push({
        symptom: painSymptom,
        matched: painDetail.matchedText,
        method: 'phrase',
        severity: painDetail.severity || assignDefaultSeverity(painSymptom, text, null),
        painDetails: {
          qualifiers: painDetail.qualifiers,
          location: painDetail.location,
        },
      });
      foundCategories.add(painSymptom);
    }
  }

  // Step 2: Extract phrase-based symptoms
  const sortedPhrases = Object.entries(SYMPTOM_PHRASES).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [phrase, symptom] of sortedPhrases) {
    if (textLower.includes(phrase) && !foundCategories.has(symptom)) {
      const phraseIndex = textLower.indexOf(phrase);

      // Skip if phrase is negated (e.g., "I don't have nausea")
      if (isPhraseNegated(text, phraseIndex)) {
        continue;
      }

      const detectedSeverity = findSeverity(textLower, phraseIndex);

      // Use numeric severity if available, otherwise use detected or default
      const finalSeverity = severityMap.get(symptom) ||
                           assignDefaultSeverity(symptom, text, detectedSeverity);

      foundSymptoms.push({
        symptom,
        matched: phrase,
        method: 'phrase',
        severity: finalSeverity,
      });
      foundCategories.add(symptom);
    }
  }

  // Step 2.5: Extract multi-word custom lemmas (phrases)
  // Custom lemmas can be multi-word phrases like "brain is shit"
  // These need to be matched as phrases before single-word tokenization
  if (customLemmas) {
    // Sort by length (longest first) to match longer phrases before shorter ones
    const sortedCustomLemmas = Object.entries(customLemmas).sort(
      (a, b) => b[0].length - a[0].length
    );

    for (const [phrase, symptom] of sortedCustomLemmas) {
      // Check if it's a multi-word phrase (contains space)
      if (phrase.includes(' ') && textLower.includes(phrase) && !foundCategories.has(symptom)) {
        const phraseIndex = textLower.indexOf(phrase);
        const detectedSeverity = findSeverity(textLower, phraseIndex);

        const finalSeverity = severityMap.get(symptom) ||
                             assignDefaultSeverity(symptom, text, detectedSeverity);

        foundSymptoms.push({
          symptom,
          matched: phrase,
          method: 'phrase',
          severity: finalSeverity,
        });
        foundCategories.add(symptom);
      }
    }
  }

  // Step 3: Extract lemma-based symptoms
  const tokens = tokenize(text);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (allLemmas[token]) {
      const symptom = allLemmas[token];

      if (!foundCategories.has(symptom) && !isNegated(tokens, i)) {
        // Use optimized token-based severity detection (avoids re-tokenization)
        const detectedSeverity = findSeverityFromTokens(tokens, i);

        // Use numeric severity if available, otherwise use detected or default
        const finalSeverity = severityMap.get(symptom) ||
                             assignDefaultSeverity(symptom, text, detectedSeverity);

        foundSymptoms.push({
          symptom,
          matched: token,
          method: 'lemma',
          severity: finalSeverity,
        });
        foundCategories.add(symptom);
      }
    }
  }

  // Step 4: Extract activity triggers and link to symptoms
  const activityTriggers = extractActivityTriggers(text);
  const symptomsWithTriggers = linkTriggersToSymptoms(foundSymptoms, activityTriggers, tokens, text);

  // Step 5: Add confidence scores to all symptoms
  const symptomsWithConfidence = addConfidenceScores(symptomsWithTriggers, text);

  // Step 5.5: Apply context-aware filtering (removes false positives from ambiguous lemmas)
  const symptomsContextFiltered = applyContextFilter(symptomsWithConfidence, text);

  // Step 5.6: Resolve conflicting symptom pairs (e.g., insomnia + hypersomnia)
  const symptomsConflictResolved = resolveSymptomConflicts(symptomsContextFiltered);

  // Step 6: Add temporal info (duration and time of day)
  const symptomsWithTemporal = addTemporalInfo(symptomsConflictResolved, text);

  // Step 7: Extract spoon count for energy tracking
  const spoonCount = extractSpoonCount(text);

  // Check for "same as yesterday" or similar catch-up patterns
  const repeatPreviousPatterns = [
    /\b(same as|similar to|like|similar|same)\s+(yesterday|last time|before|before that)\b/i,
    /\b(repeat|repeated|repeating|same as yesterday)\b/i,
    /\b(no change|still the same|nothing new|still)\b/i,
  ];

  const repeatPrevious = repeatPreviousPatterns.some(pattern => pattern.test(text));

  return {
    text,
    symptoms: symptomsWithTemporal,
    spoonCount: spoonCount ?? undefined,
    repeatPrevious: repeatPrevious || undefined,
  };
}
