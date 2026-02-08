# Negation Detection Improvements

## Overview
Enhanced negation detection for more accurate symptom extraction, particularly for statements where users explicitly say they do NOT have symptoms.

## Changes Made

### 1. Enhanced `isNegated()` Function
**File**: `mobile/src/nlp/extractor.ts` (Lines 209-235)

**Improvements**:
- Increased lookback window from 4 to 10 tokens
- Added sentence boundary detection (stops at `.`, `!`, `?`)
- Better handling of compound negations
- More robust contraction detection

**What it now handles**:
```typescript
// Before: Could miss negation
const tokens = tokenize('I honestly and truly do not have any pain');
// Now: Correctly detects "not" even though it's 5+ tokens back

// Before: Could cross sentence boundaries
const tokens = tokenize('Not tired yesterday. pain today');
// Now: Correctly stops at periods, doesn't apply "not" to pain
```

### 2. Enhanced `isPhraseNegated()` Function
**File**: `mobile/src/nlp/extractor.ts` (Lines 238-288)

**Improvements**:
- Increased lookback distance from 30 to 50 characters
- Added proper sentence boundary detection
- Added comprehensive patterns for **prepositional phrases**
- Added support for compound negations
- Better handling of contractions and multi-word negation patterns

**Prepositional phrases now detected**:
```typescript
// Examples that now work correctly:
'I have no signs of fatigue'        // "no signs of"
'I function without any pain'       // "without any"
'My issue is lack of energy'        // "lack of"
'I hardly have any motivation'      // "hardly any"
'I never experience any symptoms'   // "never any"
```

**Regex patterns added**:
1. Basic negations: `no|not|never|none|without|lack of|hardly|barely|scarcely`
2. Prepositional phrases: `no|without|lack of ... of` patterns
3. Compound negations: `not|never ... any|all|some`
4. Contractions: Full coverage of `don't|doesn't|didn't|won't|can't|shouldn't` etc.
5. Common speech patterns: `I don't|I didn't|I haven't` phrases

## Test Coverage

### Created: `mobile/src/nlp/negation.test.ts`

Comprehensive test suite with **60+ test cases** covering:

#### Basic Negations
- ✅ "not", "no", "never", "without" detection
- ✅ Contraction handling (`don't`, `doesn't`, `didn't`, etc.)
- ✅ Edge negations (`hardly`, `barely`, `scarcely`)

#### Prepositional Phrases
- ✅ "no signs of" pattern
- ✅ "without any" pattern
- ✅ "lack of" pattern
- ✅ "lacking" pattern

#### Sentence Boundaries
- ✅ Does NOT cross periods (`.`)
- ✅ Does NOT cross exclamation marks (`!`)
- ✅ Does NOT cross question marks (`?`)

#### Compound Negations
- ✅ "not any" pattern
- ✅ "never any" pattern
- ✅ "hardly any" pattern
- ✅ "barely any" pattern

#### Integration Scenarios
- ✅ Mixed symptoms: Some negated, some not
- ✅ Multiple sentences with different sentiment
- ✅ Real-world user inputs

#### Edge Cases
- ✅ Empty input handling
- ✅ Multiple negations in sequence
- ✅ Mixed case text
- ✅ Punctuation handling
- ✅ Very long text with multiple boundaries

## Impact on Extraction Accuracy

### Before
```
User Input: "I have no pain in my hands"
Result: ❌ DETECTED AS: pain (false positive)
Reason: "pain" was matched, negation wasn't properly detected
```

### After
```
User Input: "I have no pain in my hands"
Result: ✅ CORRECTLY SKIPPED: pain (true negative)
Reason: Prepositional phrase "no pain" properly detected as negation
```

## Real-World Examples Now Working

✅ "I don't think I have fatigue" - Negation detected even across multiple tokens
✅ "Without any symptoms to report" - Prepositional phrase "without any" recognized
✅ "There is a lack of energy today" - "lack of" pattern identified
✅ "I feel fine today. Pain was yesterday." - Doesn't apply negation across sentence boundary
✅ "Hardly any nausea this week" - Compound negation "hardly any" caught
✅ "I never get migraines, just headaches" - Handles multiple symptoms correctly

## Performance Considerations

- **No performance degradation**: Regex patterns are compiled once at module load
- **Slightly more comprehensive**: Checks up to 10 tokens back instead of 4, but still bounded
- **Sentence boundary optimization**: Stops at punctuation, avoiding unnecessary pattern matching

## Migration Notes

- **Backward compatible**: No changes to function signatures
- **Drop-in replacement**: Existing code using these functions works as-is
- **Improved accuracy**: Will reduce false positives in symptom extraction

## Future Improvements

1. **Negation scope analysis**: Determine which symptoms are affected by which negations
2. **Double negatives**: Handle "I don't have no pain" (double negatives = positive)
3. **Conditional negations**: "I wouldn't have pain if..." type patterns
4. **Scope limiting**: Better handling of "none of the above" scenarios

## Testing

To run the negation tests:
```bash
cd mobile
npm test -- src/nlp/negation.test.ts
```

Or with coverage:
```bash
npm test -- src/nlp/negation.test.ts --coverage
```

## References

- Token-based detection: `isNegated(tokens, index)`
- Text-based detection: `isPhraseNegated(text, phraseIndex)`
- Used in: `extractSymptoms()` for both phrase-based and lemma-based extraction
