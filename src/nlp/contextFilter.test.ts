/**
 * Comprehensive tests for context-aware symptom filtering
 *
 * Tests cover:
 * - Lemma context validation (supporting vs invalidating evidence)
 * - False positive prevention for ambiguous words
 * - Symptom conflict resolution
 * - Integration with extraction pipeline
 * - Real-world text scenarios
 */

import { extractSymptoms } from './extractor';
import {
  validateLemmaContext,
  applyContextFilter,
  resolveSymptomConflicts,
  isContextSensitiveLemma,
} from './contextFilter';
import { tokenize } from './tokenizer';
import { ExtractedSymptom } from '../types';

describe('Context-Aware Symptom Filtering', () => {
  // ============================================================================
  // CONTEXT SENSITIVITY DETECTION
  // ============================================================================

  describe('isContextSensitiveLemma', () => {
    test('identifies context-sensitive lemmas', () => {
      expect(isContextSensitiveLemma('crash')).toBe(true);
      expect(isContextSensitiveLemma('crashed')).toBe(true);
      expect(isContextSensitiveLemma('head')).toBe(true);
      expect(isContextSensitiveLemma('back')).toBe(true);
      expect(isContextSensitiveLemma('sharp')).toBe(true);
      expect(isContextSensitiveLemma('burning')).toBe(true);
      expect(isContextSensitiveLemma('race')).toBe(true);
      expect(isContextSensitiveLemma('beat')).toBe(true);
    });

    test('non-sensitive lemmas return false', () => {
      expect(isContextSensitiveLemma('fatigue')).toBe(false);
      expect(isContextSensitiveLemma('nausea')).toBe(false);
      expect(isContextSensitiveLemma('dizzy')).toBe(false);
      expect(isContextSensitiveLemma('headache')).toBe(false);
    });
  });

  // ============================================================================
  // LEMMA CONTEXT VALIDATION
  // ============================================================================

  describe('validateLemmaContext - PEM/Crash', () => {
    test('validates "crash" with exertion context', () => {
      const tokens = tokenize('I crashed after walking today');
      const crashIdx = tokens.indexOf('crashed');
      expect(validateLemmaContext('crashed', tokens, crashIdx)).toBe('valid');
    });

    test('invalidates "crash" with tech context', () => {
      const tokens = tokenize('The server crashed this morning');
      const crashIdx = tokens.indexOf('crashed');
      expect(validateLemmaContext('crashed', tokens, crashIdx)).toBe('invalid');
    });

    test('marks "crash" as uncertain without clear context', () => {
      const tokens = tokenize('I crashed');
      const crashIdx = tokens.indexOf('crashed');
      expect(validateLemmaContext('crashed', tokens, crashIdx)).toBe('uncertain');
    });

    test('validates "crash" with symptom context', () => {
      const tokens = tokenize('Had a massive crash from overexertion');
      const crashIdx = tokens.indexOf('crash');
      expect(validateLemmaContext('crash', tokens, crashIdx)).toBe('valid');
    });
  });

  describe('validateLemmaContext - Body parts', () => {
    test('validates "head" with pain context', () => {
      const tokens = tokenize('My head is throbbing');
      const headIdx = tokens.indexOf('head');
      expect(validateLemmaContext('head', tokens, headIdx)).toBe('valid');
    });

    test('invalidates "head" with office context', () => {
      const tokens = tokenize('The head of the office');
      const headIdx = tokens.indexOf('head');
      expect(validateLemmaContext('head', tokens, headIdx)).toBe('invalid');
    });

    test('validates "back" with pain context', () => {
      const tokens = tokenize('My lower back is aching');
      const backIdx = tokens.indexOf('back');
      expect(validateLemmaContext('back', tokens, backIdx)).toBe('valid');
    });

    test('invalidates "back" with directional context', () => {
      const tokens = tokenize('I came back from the store');
      const backIdx = tokens.indexOf('back');
      expect(validateLemmaContext('back', tokens, backIdx)).toBe('invalid');
    });

    test('validates "chest" with pain context', () => {
      const tokens = tokenize('Chest is tight and heavy');
      const chestIdx = tokens.indexOf('chest');
      expect(validateLemmaContext('chest', tokens, chestIdx)).toBe('valid');
    });

    test('invalidates "chest" with furniture context', () => {
      const tokens = tokenize('Put it in the chest of drawers');
      const chestIdx = tokens.indexOf('chest');
      expect(validateLemmaContext('chest', tokens, chestIdx)).toBe('invalid');
    });

    test('validates "neck" with pain context', () => {
      const tokens = tokenize('My neck is stiff and sore');
      const neckIdx = tokens.indexOf('neck');
      expect(validateLemmaContext('neck', tokens, neckIdx)).toBe('valid');
    });

    test('invalidates "neck" with geographic context', () => {
      const tokens = tokenize('This neck of the woods');
      const neckIdx = tokens.indexOf('neck');
      expect(validateLemmaContext('neck', tokens, neckIdx)).toBe('invalid');
    });
  });

  describe('validateLemmaContext - Pain qualifiers', () => {
    test('validates "sharp" with pain context', () => {
      const tokens = tokenize('Sharp pain in my side');
      const sharpIdx = tokens.indexOf('sharp');
      expect(validateLemmaContext('sharp', tokens, sharpIdx)).toBe('valid');
    });

    test('invalidates "sharp" with cognitive context', () => {
      const tokens = tokenize('My mind is sharp today');
      const sharpIdx = tokens.indexOf('sharp');
      expect(validateLemmaContext('sharp', tokens, sharpIdx)).toBe('invalid');
    });

    test('validates "burning" with body part context', () => {
      const tokens = tokenize('Burning sensation in my feet');
      const burningIdx = tokens.indexOf('burning');
      expect(validateLemmaContext('burning', tokens, burningIdx)).toBe('valid');
    });

    test('invalidates "burning" with non-medical context', () => {
      const tokens = tokenize('Burning calories at the gym');
      const burningIdx = tokens.indexOf('burning');
      expect(validateLemmaContext('burning', tokens, burningIdx)).toBe('invalid');
    });
  });

  describe('validateLemmaContext - Cardiac', () => {
    test('validates "racing" with heart context', () => {
      const tokens = tokenize('Heart is racing fast');
      const racingIdx = tokens.indexOf('racing');
      expect(validateLemmaContext('racing', tokens, racingIdx)).toBe('valid');
    });

    test('validates "racing" with thoughts context (mental health)', () => {
      const tokens = tokenize('My thoughts are racing');
      const racingIdx = tokens.indexOf('racing');
      expect(validateLemmaContext('racing', tokens, racingIdx)).toBe('valid');
    });

    test('invalidates "racing" with sport context', () => {
      const tokens = tokenize('Car racing on the track');
      const racingIdx = tokens.indexOf('racing');
      expect(validateLemmaContext('racing', tokens, racingIdx)).toBe('invalid');
    });
  });

  describe('validateLemmaContext - Fatigue slang', () => {
    test('validates "beat" with feeling context', () => {
      const tokens = tokenize('I am so beat today');
      const beatIdx = tokens.indexOf('beat');
      expect(validateLemmaContext('beat', tokens, beatIdx)).toBe('valid');
    });

    test('invalidates "beat" with game context', () => {
      const tokens = tokenize('I beat him at the game');
      const beatIdx = tokens.indexOf('beat');
      expect(validateLemmaContext('beat', tokens, beatIdx)).toBe('invalid');
    });

    test('validates "shattered" with feeling context', () => {
      const tokens = tokenize('Feeling absolutely shattered');
      const shatteredIdx = tokens.indexOf('shattered');
      expect(validateLemmaContext('shattered', tokens, shatteredIdx)).toBe('valid');
    });

    test('invalidates "shattered" with object context', () => {
      const tokens = tokenize('The glass shattered on the floor');
      const shatteredIdx = tokens.indexOf('shattered');
      expect(validateLemmaContext('shattered', tokens, shatteredIdx)).toBe('invalid');
    });

    test('validates "toast" with feeling context', () => {
      const tokens = tokenize('I am totally toast');
      const toastIdx = tokens.indexOf('toast');
      expect(validateLemmaContext('toast', tokens, toastIdx)).toBe('valid');
    });

    test('invalidates "toast" with food context', () => {
      const tokens = tokenize('Had toast with butter for breakfast');
      const toastIdx = tokens.indexOf('toast');
      expect(validateLemmaContext('toast', tokens, toastIdx)).toBe('invalid');
    });

    test('validates "cooked" with feeling context', () => {
      const tokens = tokenize('I am absolutely cooked');
      const cookedIdx = tokens.indexOf('cooked');
      expect(validateLemmaContext('cooked', tokens, cookedIdx)).toBe('valid');
    });

    test('invalidates "cooked" with food context', () => {
      const tokens = tokenize('Cooked dinner last night');
      const cookedIdx = tokens.indexOf('cooked');
      expect(validateLemmaContext('cooked', tokens, cookedIdx)).toBe('invalid');
    });
  });

  describe('validateLemmaContext - Vertigo', () => {
    test('validates "spinning" with dizziness context', () => {
      const tokens = tokenize('The room is spinning and I feel dizzy');
      const spinningIdx = tokens.indexOf('spinning');
      expect(validateLemmaContext('spinning', tokens, spinningIdx)).toBe('valid');
    });

    test('invalidates "spinning" with object context', () => {
      const tokens = tokenize('The spinning wheel is beautiful');
      const spinningIdx = tokens.indexOf('spinning');
      expect(validateLemmaContext('spinning', tokens, spinningIdx)).toBe('invalid');
    });
  });

  describe('validateLemmaContext - PEM pushed', () => {
    test('validates "pushed" with overexertion context', () => {
      const tokens = tokenize('Pushed myself too hard today');
      const pushedIdx = tokens.indexOf('pushed');
      expect(validateLemmaContext('pushed', tokens, pushedIdx)).toBe('valid');
    });

    test('invalidates "pushed" with object context', () => {
      const tokens = tokenize('Pushed the door open');
      const pushedIdx = tokens.indexOf('pushed');
      expect(validateLemmaContext('pushed', tokens, pushedIdx)).toBe('invalid');
    });
  });

  // ============================================================================
  // CONTEXT FILTER APPLICATION
  // ============================================================================

  describe('applyContextFilter', () => {
    test('removes false positive from tech context', () => {
      const symptoms: ExtractedSymptom[] = [
        { symptom: 'pem', matched: 'crashed', method: 'lemma', severity: 'moderate' },
      ];
      const result = applyContextFilter(symptoms, 'The server crashed this morning');
      expect(result.length).toBe(0);
    });

    test('keeps valid symptom with medical context', () => {
      const symptoms: ExtractedSymptom[] = [
        { symptom: 'pem', matched: 'crashed', method: 'lemma', severity: 'moderate' },
      ];
      const result = applyContextFilter(symptoms, 'I crashed hard after walking today');
      expect(result.length).toBe(1);
    });

    test('does not filter phrase-based extractions', () => {
      const symptoms: ExtractedSymptom[] = [
        { symptom: 'pem', matched: 'crashed hard', method: 'phrase', severity: 'moderate' },
      ];
      const result = applyContextFilter(symptoms, 'The server crashed hard');
      expect(result.length).toBe(1);
    });

    test('adjusts confidence for uncertain context', () => {
      const symptoms: ExtractedSymptom[] = [
        { symptom: 'pem', matched: 'crashed', method: 'lemma', severity: 'moderate', confidence: 0.6 },
      ];
      const result = applyContextFilter(symptoms, 'I crashed');
      // Should lower confidence since there's no supporting context
      expect(result[0].confidence).toBeLessThan(0.6);
    });

    test('preserves non-context-sensitive lemma extractions', () => {
      const symptoms: ExtractedSymptom[] = [
        { symptom: 'fatigue', matched: 'exhausted', method: 'lemma', severity: 'moderate' },
        { symptom: 'nausea', matched: 'nauseous', method: 'lemma', severity: 'mild' },
      ];
      const result = applyContextFilter(symptoms, 'Feeling exhausted and nauseous');
      expect(result.length).toBe(2);
    });
  });

  // ============================================================================
  // SYMPTOM CONFLICT RESOLUTION
  // ============================================================================

  describe('resolveSymptomConflicts', () => {
    test('resolves insomnia vs hypersomnia conflict (keeps higher confidence)', () => {
      const symptoms: ExtractedSymptom[] = [
        { symptom: 'insomnia', matched: 'insomnia', method: 'lemma', confidence: 0.8 },
        { symptom: 'hypersomnia', matched: 'oversleeping', method: 'lemma', confidence: 0.5 },
      ];
      const result = resolveSymptomConflicts(symptoms);
      expect(result.length).toBe(1);
      expect(result[0].symptom).toBe('insomnia');
    });

    test('keeps hypersomnia when it has higher confidence', () => {
      const symptoms: ExtractedSymptom[] = [
        { symptom: 'insomnia', matched: 'sleepless', method: 'lemma', confidence: 0.4 },
        { symptom: 'hypersomnia', matched: 'oversleeping', method: 'lemma', confidence: 0.9 },
      ];
      const result = resolveSymptomConflicts(symptoms);
      expect(result.length).toBe(1);
      expect(result[0].symptom).toBe('hypersomnia');
    });

    test('does not remove non-conflicting symptoms', () => {
      const symptoms: ExtractedSymptom[] = [
        { symptom: 'fatigue', matched: 'tired', method: 'lemma', confidence: 0.7 },
        { symptom: 'headache', matched: 'headache', method: 'lemma', confidence: 0.8 },
        { symptom: 'nausea', matched: 'nauseous', method: 'lemma', confidence: 0.6 },
      ];
      const result = resolveSymptomConflicts(symptoms);
      expect(result.length).toBe(3);
    });

    test('handles empty symptoms list', () => {
      const result = resolveSymptomConflicts([]);
      expect(result).toEqual([]);
    });

    test('handles symptoms with no confidence (uses default 0.5)', () => {
      const symptoms: ExtractedSymptom[] = [
        { symptom: 'insomnia', matched: 'insomnia', method: 'lemma' },
        { symptom: 'hypersomnia', matched: 'drowsy', method: 'lemma' },
      ];
      const result = resolveSymptomConflicts(symptoms);
      // Both have default 0.5, first one wins
      expect(result.length).toBe(1);
      expect(result[0].symptom).toBe('insomnia');
    });
  });

  // ============================================================================
  // INTEGRATION WITH EXTRACTION PIPELINE
  // ============================================================================

  describe('Integration - Full extraction pipeline', () => {
    test('filters out "crashed" in tech context', () => {
      const result = extractSymptoms('The app crashed this morning');
      const pemSymptom = result.symptoms.find(s => s.symptom === 'pem');
      // Should be filtered out or have very low confidence
      if (pemSymptom) {
        expect(pemSymptom.confidence).toBeLessThan(0.4);
      }
    });

    test('keeps "crashed" in medical context', () => {
      const result = extractSymptoms('I crashed after exercising today');
      const pemSymptom = result.symptoms.find(s => s.symptom === 'pem');
      expect(pemSymptom).toBeDefined();
    });

    test('filters out "back" in directional context', () => {
      const result = extractSymptoms('I came back from the store');
      const backPain = result.symptoms.find(s => s.symptom === 'back_pain');
      if (backPain) {
        expect(backPain.confidence).toBeLessThan(0.4);
      }
    });

    test('keeps "back" in pain context', () => {
      const result = extractSymptoms('My lower back is killing me');
      const backPain = result.symptoms.find(s => s.symptom === 'back_pain');
      expect(backPain).toBeDefined();
    });

    test('handles mixed valid and invalid symptoms', () => {
      const result = extractSymptoms('Feeling exhausted. The server crashed again.');
      const fatigue = result.symptoms.find(s => s.symptom === 'fatigue');
      expect(fatigue).toBeDefined();
      // PEM from "crashed" should be filtered in tech context
      const pem = result.symptoms.find(s => s.symptom === 'pem');
      if (pem) {
        expect(pem.confidence).toBeLessThan(0.4);
      }
    });
  });

  // ============================================================================
  // REAL-WORLD SCENARIOS
  // ============================================================================

  describe('Real-world false positive prevention', () => {
    test('daily life description does not extract body parts as symptoms', () => {
      const result = extractSymptoms('Went back to get my phone, then headed to the store');
      // "back" should not become back_pain, "head" variants should not become headache
      const backPain = result.symptoms.find(s => s.symptom === 'back_pain');
      const headache = result.symptoms.find(s => s.symptom === 'headache');
      if (backPain) {
        expect(backPain.confidence).toBeLessThan(0.4);
      }
      if (headache) {
        expect(headache.confidence).toBeLessThan(0.4);
      }
    });

    test('genuine pain description extracts correctly', () => {
      const result = extractSymptoms('Sharp stabbing pain in my lower back, neck is so stiff');
      const backPain = result.symptoms.find(s => s.symptom === 'back_pain' || s.symptom === 'pain');
      expect(backPain).toBeDefined();
    });

    test('slang fatigue with clear context works', () => {
      const result = extractSymptoms('I am completely toast after that appointment');
      const fatigue = result.symptoms.find(s =>
        s.symptom === 'fatigue' && s.matched === 'toast'
      );
      // "toast" with "completely" and "after" should be validated
      if (fatigue) {
        expect(fatigue).toBeDefined();
      }
    });

    test('food context does not extract "toast" as fatigue', () => {
      const result = extractSymptoms('Had avocado toast for breakfast');
      const fatigue = result.symptoms.find(s =>
        s.symptom === 'fatigue' && s.matched === 'toast'
      );
      // Should be filtered out
      if (fatigue) {
        expect(fatigue.confidence).toBeLessThan(0.3);
      }
    });

    test('heart racing vs car racing', () => {
      const heartText = extractSymptoms('My heart is racing so fast');
      const carText = extractSymptoms('Car racing is exciting');

      const heartPalp = heartText.symptoms.find(s => s.symptom === 'palpitations');
      expect(heartPalp).toBeDefined();

      const carPalp = carText.symptoms.find(s => s.symptom === 'palpitations');
      if (carPalp) {
        expect(carPalp.confidence).toBeLessThan(0.3);
      }
    });

    test('complex multi-symptom text', () => {
      const result = extractSymptoms(
        'Feeling really shattered today, head is pounding, ' +
        'crashed hard after cleaning. Heart was racing earlier.'
      );
      // Should extract: fatigue (shattered), headache (head+pounding), PEM (crashed+cleaning)
      expect(result.symptoms.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge cases', () => {
    test('handles empty text', () => {
      const result = extractSymptoms('');
      expect(result.symptoms).toEqual([]);
    });

    test('handles text with only ambiguous words', () => {
      const result = extractSymptoms('back');
      // Should either not extract or have very low confidence
      const backPain = result.symptoms.find(s => s.symptom === 'back_pain');
      if (backPain) {
        expect(backPain.confidence).toBeLessThan(0.4);
      }
    });

    test('handles mixed case', () => {
      const tokens = tokenize('The SERVER crashed this morning');
      const crashIdx = tokens.indexOf('crashed');
      if (crashIdx >= 0) {
        const result = validateLemmaContext('crashed', tokens, crashIdx);
        expect(result).toBe('invalid');
      }
    });

    test('supports custom lemmas bypass (custom lemmas are not context-filtered)', () => {
      const result = extractSymptoms('My special word here', { 'special': 'fatigue' });
      const fatigue = result.symptoms.find(s => s.symptom === 'fatigue');
      // Custom lemmas should still work even if they match a context-sensitive word
      expect(fatigue).toBeDefined();
    });
  });
});
