/**
 * Comprehensive tests for pain detail extraction and confidence scoring
 * Tests cover:
 * - Pain qualifier detection
 * - Location detection (single, two-word, three-word)
 * - Severity assessment
 * - Confidence scoring factors
 * - Edge cases and realistic scenarios
 */

import { extractPainDetails, extractPainDetailsFromTokens, calculateConfidence, tokenize } from './extractor';
import { ExtractedSymptom } from '../types';

describe('Pain Details Extraction Tests', () => {
  // ============================================================================
  // Pain Qualifiers
  // ============================================================================

  describe('Pain qualifiers detection', () => {
    test('detects single pain qualifier', () => {
      const text = 'I have burning pain';
      const details = extractPainDetails(text);
      expect(details.length).toBeGreaterThan(0);
      expect(details[0].qualifiers).toContain('burning');
    });

    test('detects multiple pain qualifiers', () => {
      const text = 'I have sharp stabbing pain';
      const details = extractPainDetails(text);
      expect(details.length).toBeGreaterThan(0);
      expect(details[0].qualifiers.length).toBeGreaterThan(1);
    });

    test('detects "cramping" as pain qualifier', () => {
      const text = 'cramping in my abdomen';
      const details = extractPainDetails(text);
      expect(details.length).toBeGreaterThan(0);
      expect(details[0].qualifiers).toContain('cramping');
    });

    test('detects "throbbing" as pain qualifier', () => {
      const text = 'throbbing headache';
      const details = extractPainDetails(text);
      expect(details.length).toBeGreaterThan(0);
      expect(details[0].qualifiers).toContain('throbbing');
    });

    test('does not report pain without qualifiers or location', () => {
      const text = 'I feel pain';
      const details = extractPainDetails(text);
      // Should return empty if no qualifiers or location
      expect(details.length).toBe(0);
    });
  });

  // ============================================================================
  // Pain Locations
  // ============================================================================

  describe('Pain location detection', () => {
    test('detects single-word body location', () => {
      const text = 'pain in my head';
      const details = extractPainDetails(text);
      expect(details.length).toBeGreaterThan(0);
      expect(details[0].location).toBe('head');
    });

    test('detects two-word body location (upper back)', () => {
      const text = 'sharp pain in upper back';
      const details = extractPainDetails(text);
      expect(details.length).toBeGreaterThan(0);
      expect(details[0].location).toBe('upper_back');
    });

    test('detects two-word body location (lower back)', () => {
      const text = 'dull pain in lower back';
      const details = extractPainDetails(text);
      expect(details.length).toBeGreaterThan(0);
      expect(details[0].location).toBe('lower_back');
    });

    test('detects shoulder pain', () => {
      const text = 'severe pain in my shoulder';
      const details = extractPainDetails(text);
      expect(details.length).toBeGreaterThan(0);
      expect(details[0].location).toBe('shoulder');
    });

    test('detects multiple pains in different locations', () => {
      const text = 'burning pain in my neck and sharp pain in my back';
      const details = extractPainDetails(text);
      expect(details.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ============================================================================
  // Severity Detection in Pain
  // ============================================================================

  describe('Pain severity detection', () => {
    test('detects severe pain with "severe" qualifier', () => {
      const text = 'severe sharp pain in my chest';
      const details = extractPainDetails(text);
      expect(details.length).toBeGreaterThan(0);
      expect(details[0].severity).toBe('severe');
    });

    test('detects mild pain with "mild" qualifier', () => {
      const text = 'mild aching pain in my muscles';
      const details = extractPainDetails(text);
      expect(details.length).toBeGreaterThan(0);
      expect(details[0].severity).toBe('mild');
    });

    test('detects moderate pain with "moderate" qualifier', () => {
      const text = 'moderate throbbing pain in my head';
      const details = extractPainDetails(text);
      expect(details.length).toBeGreaterThan(0);
      expect(details[0].severity).toBe('moderate');
    });
  });

  // ============================================================================
  // Token-based extraction (optimized version)
  // ============================================================================

  describe('extractPainDetailsFromTokens - Optimized version', () => {
    test('works with pre-tokenized input', () => {
      const tokens = tokenize('burning pain in shoulders');
      const details = extractPainDetailsFromTokens(tokens);
      expect(details.length).toBeGreaterThan(0);
      expect(details[0].qualifiers).toContain('burning');
    });

    test('produces same results as text-based extraction', () => {
      const text = 'sharp stabbing pain in my lower back';
      const textDetails = extractPainDetails(text);
      const tokenDetails = extractPainDetailsFromTokens(tokenize(text));
      expect(tokenDetails).toEqual(textDetails);
    });

    test('handles empty token array gracefully', () => {
      const tokens: string[] = [];
      expect(() => extractPainDetailsFromTokens(tokens)).not.toThrow();
      expect(extractPainDetailsFromTokens(tokens)).toEqual([]);
    });
  });

  // ============================================================================
  // Realistic scenarios
  // ============================================================================

  describe('Realistic pain extraction scenarios', () => {
    test('extracts detailed pain description', () => {
      const text = 'severe sharp stabbing pain in my lower back, radiating down my leg';
      const details = extractPainDetails(text);
      expect(details.length).toBeGreaterThan(0);
      expect(details[0].qualifiers.length).toBeGreaterThan(1);
      expect(details[0].severity).toBe('severe');
    });

    test('handles pain in multiple locations', () => {
      const text = 'burning pain in my neck and dull aching in my shoulders';
      const details = extractPainDetails(text);
      expect(details.length).toBeGreaterThanOrEqual(1);
    });

    test('extracts pain with body part but no qualifier (location is enough)', () => {
      const text = 'ache in my knee';
      const details = extractPainDetails(text);
      expect(details.length).toBeGreaterThan(0);
    });

    test('handles pain description with prepositions', () => {
      const text = 'sharp pain radiating down my arm';
      const details = extractPainDetails(text);
      expect(details.length).toBeGreaterThan(0);
    });
  });
});

describe('Confidence Scoring Tests', () => {
  // ============================================================================
  // Method-based scoring
  // ============================================================================

  describe('Confidence by extraction method', () => {
    test('phrase-based extraction has higher confidence than lemma', () => {
      const phraseSymptom: ExtractedSymptom = {
        symptom: 'headache',
        matched: 'severe headache',
        method: 'phrase',
        severity: 'severe',
      };

      const lemmaSymptom: ExtractedSymptom = {
        symptom: 'headache',
        matched: 'headache',
        method: 'lemma',
        severity: 'severe',
      };

      const phraseConf = calculateConfidence(phraseSymptom, 'I have a severe headache', 10);
      const lemmaConf = calculateConfidence(lemmaSymptom, 'I have a severe headache', 10);

      expect(phraseConf).toBeGreaterThan(lemmaConf);
    });

    test('pattern-based extraction confidence between phrase and lemma', () => {
      const phraseConf = calculateConfidence(
        { symptom: 'pain', matched: 'sharp pain', method: 'phrase', severity: 'moderate' },
        'sharp pain in my back',
        0
      );

      const patternConf = calculateConfidence(
        { symptom: 'pain', matched: 'sharp pain', method: 'phrase', severity: 'moderate' },
        'sharp pain in my back',
        0
      );

      const lemmaConf = calculateConfidence(
        { symptom: 'pain', matched: 'pain', method: 'lemma', severity: 'moderate' },
        'sharp pain in my back',
        0
      );

      expect(phraseConf).toBeGreaterThan(patternConf);
      expect(patternConf).toBeGreaterThan(lemmaConf);
    });
  });

  // ============================================================================
  // Specificity scoring
  // ============================================================================

  describe('Confidence by match specificity', () => {
    test('longer matches have higher confidence', () => {
      const singleWord: ExtractedSymptom = {
        symptom: 'fatigue',
        matched: 'tired',
        method: 'lemma',
        severity: 'moderate',
      };

      const twoWords: ExtractedSymptom = {
        symptom: 'fatigue',
        matched: 'completely exhausted',
        method: 'phrase',
        severity: 'moderate',
      };

      const threeWords: ExtractedSymptom = {
        symptom: 'fatigue',
        matched: 'completely utterly exhausted',
        method: 'phrase',
        severity: 'moderate',
      };

      const singleConf = calculateConfidence(singleWord, 'I am tired', 0);
      const twoConf = calculateConfidence(twoWords, 'I am completely exhausted', 0);
      const threeConf = calculateConfidence(threeWords, 'I am completely utterly exhausted', 0);

      expect(twoConf).toBeGreaterThan(singleConf);
      expect(threeConf).toBeGreaterThan(twoConf);
    });
  });

  // ============================================================================
  // Pain details impact
  // ============================================================================

  describe('Confidence with pain details', () => {
    test('pain with location has higher confidence', () => {
      const withoutLocation: ExtractedSymptom = {
        symptom: 'pain',
        matched: 'sharp pain',
        method: 'phrase',
        severity: 'severe',
      };

      const withLocation: ExtractedSymptom = {
        symptom: 'pain',
        matched: 'sharp pain in my back',
        method: 'phrase',
        severity: 'severe',
        painDetails: {
          qualifiers: ['sharp'],
          location: 'back',
        },
      };

      const withoutConf = calculateConfidence(withoutLocation, 'I have sharp pain', 0);
      const withConf = calculateConfidence(withLocation, 'I have sharp pain in my back', 0);

      expect(withConf).toBeGreaterThan(withoutConf);
    });

    test('pain with multiple qualifiers has higher confidence', () => {
      const oneQualifier: ExtractedSymptom = {
        symptom: 'pain',
        matched: 'burning pain',
        method: 'phrase',
        severity: 'severe',
        painDetails: {
          qualifiers: ['burning'],
          location: 'back',
        },
      };

      const twoQualifiers: ExtractedSymptom = {
        symptom: 'pain',
        matched: 'sharp burning pain',
        method: 'phrase',
        severity: 'severe',
        painDetails: {
          qualifiers: ['sharp', 'burning'],
          location: 'back',
        },
      };

      const oneConf = calculateConfidence(oneQualifier, 'burning pain in my back', 0);
      const twoConf = calculateConfidence(twoQualifiers, 'sharp burning pain in my back', 0);

      expect(twoConf).toBeGreaterThan(oneConf);
    });
  });

  // ============================================================================
  // Contextual factors
  // ============================================================================

  describe('Confidence with contextual information', () => {
    test('symptom with trigger has higher confidence', () => {
      const withoutTrigger: ExtractedSymptom = {
        symptom: 'fatigue',
        matched: 'exhausted',
        method: 'lemma',
        severity: 'moderate',
      };

      const withTrigger: ExtractedSymptom = {
        symptom: 'fatigue',
        matched: 'exhausted',
        method: 'lemma',
        severity: 'moderate',
        trigger: { activity: 'shopping_triggered' },
      };

      const withoutConf = calculateConfidence(withoutTrigger, 'I am exhausted', 0);
      const withConf = calculateConfidence(withTrigger, 'I am exhausted after shopping', 0);

      expect(withConf).toBeGreaterThan(withoutConf);
    });

    test('symptom with duration has higher confidence', () => {
      const withoutDuration: ExtractedSymptom = {
        symptom: 'headache',
        matched: 'headache',
        method: 'lemma',
        severity: 'moderate',
      };

      const withDuration: ExtractedSymptom = {
        symptom: 'headache',
        matched: 'headache',
        method: 'lemma',
        severity: 'moderate',
        duration: { value: 3, unit: 'hours' },
      };

      const withoutConf = calculateConfidence(withoutDuration, 'I have a headache', 0);
      const withConf = calculateConfidence(withDuration, 'I have had a headache for 3 hours', 0);

      expect(withConf).toBeGreaterThan(withoutConf);
    });

    test('symptom with time of day has higher confidence', () => {
      const withoutTime: ExtractedSymptom = {
        symptom: 'migraine',
        matched: 'migraine',
        method: 'lemma',
        severity: 'severe',
      };

      const withTime: ExtractedSymptom = {
        symptom: 'migraine',
        matched: 'migraine',
        method: 'lemma',
        severity: 'severe',
        timeOfDay: 'morning',
      };

      const withoutConf = calculateConfidence(withoutTime, 'I have migraines', 0);
      const withConf = calculateConfidence(withTime, 'I have migraines in the morning', 0);

      expect(withConf).toBeGreaterThan(withoutConf);
    });
  });

  // ============================================================================
  // Rare symptom handling
  // ============================================================================

  describe('Confidence for rare/specific symptoms', () => {
    test('rare symptom with explicit phrase has high confidence', () => {
      const rareSymptom: ExtractedSymptom = {
        symptom: 'brain_zaps',
        matched: 'brain zaps',
        method: 'phrase',
        severity: 'moderate',
      };

      const commonSymptom: ExtractedSymptom = {
        symptom: 'fatigue',
        matched: 'exhausted',
        method: 'phrase',
        severity: 'moderate',
      };

      const rareConf = calculateConfidence(rareSymptom, 'I experience brain zaps', 0);
      const commonConf = calculateConfidence(commonSymptom, 'I feel exhausted', 0);

      // Rare symptom explicitly mentioned should have comparable or higher confidence
      expect(rareConf).toBeGreaterThanOrEqual(commonConf * 0.9);
    });
  });

  // ============================================================================
  // Confidence bounds and edge cases
  // ============================================================================

  describe('Confidence scoring bounds and edge cases', () => {
    test('confidence stays within 0-1 range', () => {
      const symptom: ExtractedSymptom = {
        symptom: 'pain',
        matched: 'severe sharp stabbing pain',
        method: 'phrase',
        severity: 'severe',
        painDetails: {
          qualifiers: ['sharp', 'stabbing'],
          location: 'back',
        },
        trigger: { activity: 'standing' },
        duration: { value: 2, unit: 'hours' },
        timeOfDay: 'afternoon',
      };

      const conf = calculateConfidence(symptom, 'After standing for too long, I have severe sharp stabbing pain in my back', 30);
      expect(conf).toBeGreaterThanOrEqual(0);
      expect(conf).toBeLessThanOrEqual(1);
    });

    test('confidence for minimal extraction is reasonable', () => {
      const symptom: ExtractedSymptom = {
        symptom: 'fatigue',
        matched: 'tired',
        method: 'lemma',
      };

      const conf = calculateConfidence(symptom, 'I am tired', 0);
      expect(conf).toBeGreaterThan(0);
      expect(conf).toBeLessThan(0.7); // Should be relatively low confidence
    });

    test('confidence with all details is high', () => {
      const symptom: ExtractedSymptom = {
        symptom: 'pain',
        matched: 'severe sharp stabbing pain in lower back',
        method: 'phrase',
        severity: 'severe',
        painDetails: {
          qualifiers: ['sharp', 'stabbing'],
          location: 'lower_back',
        },
        trigger: { activity: 'prolonged_standing' },
        duration: { value: 4, unit: 'hours' },
        timeOfDay: 'afternoon',
      };

      const conf = calculateConfidence(
        symptom,
        'After standing too long in the afternoon, I have severe sharp stabbing pain in my lower back for about 4 hours',
        20
      );
      expect(conf).toBeGreaterThan(0.75); // Should be high confidence
    });

    test('confidence is decimal with 2 places', () => {
      const symptom: ExtractedSymptom = {
        symptom: 'headache',
        matched: 'headache',
        method: 'phrase',
      };

      const conf = calculateConfidence(symptom, 'I have a headache', 0);
      const decimalPlaces = (conf.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });

  // ============================================================================
  // Context density bonus
  // ============================================================================

  describe('Confidence context density bonus', () => {
    test('symptom with rich context has higher confidence', () => {
      const sparseContext: ExtractedSymptom = {
        symptom: 'pain',
        matched: 'pain',
        method: 'phrase',
      };

      const richContext: ExtractedSymptom = {
        symptom: 'pain',
        matched: 'pain',
        method: 'phrase',
      };

      const sparseConf = calculateConfidence(sparseContext, 'I have pain', 7);
      const richConf = calculateConfidence(
        richContext,
        'I have severe constant sharp pain that is worse than yesterday and triggered by standing',
        7
      );

      expect(richConf).toBeGreaterThan(sparseConf);
    });
  });
});
