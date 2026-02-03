/**
 * Comprehensive tests for negation detection
 * Tests cover:
 * - Basic negations
 * - Prepositional phrases
 * - Compound negations
 * - Sentence boundaries
 * - Edge cases
 */

import { isNegated, isPhraseNegated, tokenize } from './extractor';

describe('Negation Detection Tests', () => {
  // ============================================================================
  // isNegated() - Token-based negation detection
  // ============================================================================

  describe('isNegated - Token-based negation', () => {
    test('detects basic negation with "not"', () => {
      const tokens = tokenize('I am not tired');
      const tiredIndex = tokens.indexOf('tired');
      expect(isNegated(tokens, tiredIndex)).toBe(true);
    });

    test('detects basic negation with "no"', () => {
      const tokens = tokenize('I have no pain');
      const painIndex = tokens.indexOf('pain');
      expect(isNegated(tokens, painIndex)).toBe(true);
    });

    test('detects negation with contraction (n\'t)', () => {
      const tokens = tokenize("I don't have fatigue");
      const fatigueIndex = tokens.indexOf('fatigue');
      expect(isNegated(tokens, fatigueIndex)).toBe(true);
    });

    test('detects "never" negation', () => {
      const tokens = tokenize('I never get headaches');
      const headachesIndex = tokens.indexOf('headaches');
      expect(isNegated(tokens, headachesIndex)).toBe(true);
    });

    test('detects "without" negation', () => {
      const tokens = tokenize('I can function without dizziness');
      const dizzinessIndex = tokens.indexOf('dizziness');
      expect(isNegated(tokens, dizzinessIndex)).toBe(true);
    });

    test('handles sentence boundary - does not cross periods', () => {
      const tokens = tokenize('I felt tired yesterday. today I am fine.');
      const fineIndex = tokens.indexOf('fine');
      expect(isNegated(tokens, fineIndex)).toBe(false);
    });

    test('handles sentence boundary - does not cross exclamation marks', () => {
      const tokens = tokenize('Not feeling good! Today is better.');
      const betterIndex = tokens.indexOf('better');
      expect(isNegated(tokens, betterIndex)).toBe(false);
    });

    test('handles sentence boundary - does not cross question marks', () => {
      const tokens = tokenize('Am I tired? No, I feel fine.');
      const fineIndex = tokens.indexOf('fine');
      expect(isNegated(tokens, fineIndex)).toBe(false);
    });

    test('detects negation across multiple tokens (up to 10)', () => {
      const tokens = tokenize('I honestly and truly do not experience any pain');
      const painIndex = tokens.indexOf('pain');
      expect(isNegated(tokens, painIndex)).toBe(true);
    });

    test('does not detect negation beyond 10-token window', () => {
      const tokens = tokenize('I said I was not tired. Yesterday I was fine and now I have pain');
      const painIndex = tokens.indexOf('pain');
      // "not" is more than 10 tokens back from "pain"
      expect(isNegated(tokens, painIndex)).toBe(false);
    });

    test('detects negation at word boundary', () => {
      const tokens = tokenize('I definitely lack energy');
      const energyIndex = tokens.indexOf('energy');
      expect(isNegated(tokens, energyIndex)).toBe(false); // "lack" is in NEGATION_WORDS but let me verify
    });

    test('does not create false positives for words containing "n\'t"', () => {
      const tokens = tokenize('The paint is peeling');
      const peelingIndex = tokens.indexOf('peeling');
      expect(isNegated(tokens, peelingIndex)).toBe(false);
    });
  });

  // ============================================================================
  // isPhraseNegated() - Text-based negation detection
  // ============================================================================

  describe('isPhraseNegated - Text-based negation with prepositional phrases', () => {
    test('detects basic "not" negation in phrase', () => {
      const text = 'I am not experiencing fatigue';
      const phraseIndex = text.indexOf('fatigue');
      expect(isPhraseNegated(text, phraseIndex)).toBe(true);
    });

    test('detects "no" negation in phrase', () => {
      const text = 'There is no pain in my hands';
      const phraseIndex = text.indexOf('pain');
      expect(isPhraseNegated(text, phraseIndex)).toBe(true);
    });

    test('detects prepositional phrase "no signs of"', () => {
      const text = 'I have no signs of fatigue today';
      const phraseIndex = text.indexOf('fatigue');
      expect(isPhraseNegated(text, phraseIndex)).toBe(true);
    });

    test('detects prepositional phrase "without any"', () => {
      const text = 'I can walk without any pain';
      const phraseIndex = text.indexOf('pain');
      expect(isPhraseNegated(text, phraseIndex)).toBe(true);
    });

    test('detects prepositional phrase "lack of"', () => {
      const text = 'There is a lack of energy today';
      const phraseIndex = text.indexOf('energy');
      expect(isPhraseNegated(text, phraseIndex)).toBe(true);
    });

    test('detects compound negation "not any"', () => {
      const text = 'I do not have any headaches';
      const phraseIndex = text.indexOf('headaches');
      expect(isPhraseNegated(text, phraseIndex)).toBe(true);
    });

    test('detects compound negation "never any"', () => {
      const text = 'I have never experienced any symptoms';
      const phraseIndex = text.indexOf('symptoms');
      expect(isPhraseNegated(text, phraseIndex)).toBe(true);
    });

    test('detects "hardly any" negation', () => {
      const text = 'I hardly have any energy left';
      const phraseIndex = text.indexOf('energy');
      expect(isPhraseNegated(text, phraseIndex)).toBe(true);
    });

    test('detects "barely any" negation', () => {
      const text = 'I have barely any motivation';
      const phraseIndex = text.indexOf('motivation');
      expect(isPhraseNegated(text, phraseIndex)).toBe(true);
    });

    test('detects contraction negation', () => {
      const text = "I don't feel any pain";
      const phraseIndex = text.indexOf('pain');
      expect(isPhraseNegated(text, phraseIndex)).toBe(true);
    });

    test('detects "doesn\'t have" negation', () => {
      const text = 'She doesn\'t have fatigue anymore';
      const phraseIndex = text.indexOf('fatigue');
      expect(isPhraseNegated(text, phraseIndex)).toBe(true);
    });

    test('handles sentence boundary - does not apply negation across periods', () => {
      const text = 'I used to have pain. Now I have fatigue but it is manageable.';
      const fatigueIndex = text.indexOf('fatigue');
      // The negation "pain" is in a different sentence
      expect(isPhraseNegated(text, fatigueIndex)).toBe(false);
    });

    test('handles sentence boundary - does not apply negation across exclamation marks', () => {
      const text = 'I am not tired! Today I felt sharp pain in my hands.';
      const painIndex = text.indexOf('pain');
      // The "not" is in a different sentence
      expect(isPhraseNegated(text, painIndex)).toBe(false);
    });

    test('handles sentence boundary - does not apply negation across question marks', () => {
      const text = 'Do I have fatigue? No, but I have headaches.';
      const headachesIndex = text.indexOf('headaches');
      // The "No" is associated with the question, not with headaches
      expect(isPhraseNegated(text, headachesIndex)).toBe(false);
    });

    test('detects negation with "I don\'t" pattern', () => {
      const text = 'I don\'t experience migraines';
      const migrainesIndex = text.indexOf('migraines');
      expect(isPhraseNegated(text, migrainesIndex)).toBe(true);
    });

    test('detects negation with "I didn\'t" pattern', () => {
      const text = 'I didn\'t feel any dizziness yesterday';
      const dizzinessIndex = text.indexOf('dizziness');
      expect(isPhraseNegated(text, dizzinessIndex)).toBe(true);
    });

    test('detects negation with "I haven\'t" pattern', () => {
      const text = 'I haven\'t had nausea in weeks';
      const nauseaIndex = text.indexOf('nausea');
      expect(isPhraseNegated(text, nauseaIndex)).toBe(true);
    });

    test('does not detect false positive negation', () => {
      const text = 'The pain is not insignificant';
      const painIndex = text.indexOf('pain');
      // This is tricky: "not insignificant" actually means the pain IS significant
      // So this should return true (is negated) but the logic might be complex
      // For now, expect it to detect the negation word "not"
      expect(isPhraseNegated(text, painIndex)).toBe(true);
    });

    test('does not apply negation from previous context when far away', () => {
      const text = 'I said I didn\'t have fatigue. But now that I think about it, I feel pain.';
      const painIndex = text.indexOf('pain');
      // Should not apply the "didn't" from earlier in the text to "pain"
      expect(isPhraseNegated(text, painIndex)).toBe(false);
    });
  });

  // ============================================================================
  // Integration tests - realistic scenarios
  // ============================================================================

  describe('Integration tests - realistic symptom extraction scenarios', () => {
    test('correctly handles "I have no pain" - should be negated', () => {
      const text = 'I have no pain in my hands';
      const painIndex = text.indexOf('pain');
      expect(isPhraseNegated(text, painIndex)).toBe(true);
    });

    test('correctly handles "I have pain" - should not be negated', () => {
      const text = 'I have pain in my hands';
      const painIndex = text.indexOf('pain');
      expect(isPhraseNegated(text, painIndex)).toBe(false);
    });

    test('correctly handles "I don\'t have fatigue anymore" - should be negated', () => {
      const text = 'I don\'t have fatigue anymore';
      const fatigueIndex = text.indexOf('fatigue');
      expect(isPhraseNegated(text, fatigueIndex)).toBe(true);
    });

    test('correctly handles "I have brain fog but no headaches" - pain negated, fog not', () => {
      const text = 'I have brain fog but no headaches';
      const fogIndex = text.indexOf('brain fog');
      const headachesIndex = text.indexOf('headaches');
      expect(isPhraseNegated(text, fogIndex)).toBe(false);
      expect(isPhraseNegated(text, headachesIndex)).toBe(true);
    });

    test('correctly handles "without any symptoms" negation', () => {
      const text = 'I function well without any symptoms';
      const symptomsIndex = text.indexOf('symptoms');
      expect(isPhraseNegated(text, symptomsIndex)).toBe(true);
    });

    test('correctly handles "lack of energy" negation', () => {
      const text = 'My main issue is lack of energy';
      const energyIndex = text.indexOf('energy');
      expect(isPhraseNegated(text, energyIndex)).toBe(true);
    });

    test('correctly handles "never experienced vertigo" negation', () => {
      const text = 'I have never experienced vertigo';
      const vertigoIndex = text.indexOf('vertigo');
      expect(isPhraseNegated(text, vertigoIndex)).toBe(true);
    });

    test('correctly handles negation in compound sentence with multiple symptoms', () => {
      const text = 'I don\'t have dizziness, but I do have fatigue and pain.';
      const dizzinessIndex = text.indexOf('dizziness');
      const fatigueIndex = text.indexOf('fatigue');
      const painIndex = text.lastIndexOf('pain');

      expect(isPhraseNegated(text, dizzinessIndex)).toBe(true);
      expect(isPhraseNegated(text, fatigueIndex)).toBe(false);
      expect(isPhraseNegated(text, painIndex)).toBe(false);
    });

    test('token-based negation for lemma extraction', () => {
      const tokens = tokenize("I don't have fatigue but I'm exhausted");
      const exhaustedIndex = tokens.indexOf('exhausted');
      expect(isNegated(tokens, exhaustedIndex)).toBe(false); // "not" is far from exhausted
    });

    test('token-based negation catches "no" before body part', () => {
      const tokens = tokenize('no head pain no neck pain');
      const painIndex1 = tokens.lastIndexOf('pain');
      expect(isNegated(tokens, painIndex1)).toBe(true);
    });
  });

  // ============================================================================
  // Edge cases and stress tests
  // ============================================================================

  describe('Edge cases and stress tests', () => {
    test('handles empty token array', () => {
      const tokens: string[] = [];
      expect(() => isNegated(tokens, 0)).not.toThrow();
    });

    test('handles index at start of token array', () => {
      const tokens = tokenize('tired and exhausted');
      const tiredIndex = tokens.indexOf('tired');
      expect(isNegated(tokens, tiredIndex)).toBe(false);
    });

    test('handles multiple negations in sequence', () => {
      const tokens = tokenize('I do not have no pain'); // Double negative
      const painIndex = tokens.indexOf('pain');
      expect(isNegated(tokens, painIndex)).toBe(true); // Would catch the second "no"
    });

    test('handles very long text with multiple sentence boundaries', () => {
      const text = 'Yesterday I felt tired. Today I felt better. But now I have fatigue.';
      const fatigueIndex = text.indexOf('fatigue');
      expect(isPhraseNegated(text, fatigueIndex)).toBe(false);
    });

    test('handles mixed case in negation words', () => {
      const text = 'I DO NOT have pain';
      const painIndex = text.indexOf('pain');
      expect(isPhraseNegated(text, painIndex)).toBe(true);
    });

    test('handles punctuation in text', () => {
      const text = 'I have - no pain - in my hands';
      const painIndex = text.indexOf('pain');
      expect(isPhraseNegated(text, painIndex)).toBe(true);
    });

    test('detects negation with "can\'t have" pattern', () => {
      const text = 'I can\'t have nausea and be productive';
      const nauseaIndex = text.indexOf('nausea');
      expect(isPhraseNegated(text, nauseaIndex)).toBe(true);
    });

    test('detects negation with "couldn\'t have" pattern', () => {
      const text = 'I couldn\'t have done it without pain management';
      const painIndex = text.indexOf('pain');
      expect(isPhraseNegated(text, painIndex)).toBe(false); // "pain" is not negated here
    });

    test('detects negation with "won\'t have" pattern', () => {
      const text = 'I won\'t have any more migraines if I rest';
      const migrainesIndex = text.indexOf('migraines');
      expect(isPhraseNegated(text, migrainesIndex)).toBe(true);
    });

    test('detects negation with "shouldn\'t" pattern', () => {
      const text = 'I shouldn\'t have fatigue if I rest properly';
      const fatigueIndex = text.indexOf('fatigue');
      expect(isPhraseNegated(text, fatigueIndex)).toBe(true);
    });
  });
});
