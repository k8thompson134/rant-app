# Context-Aware Symptom Filtering

## Overview
Implemented an intelligent context-aware filtering system that validates ambiguous single-word lemma extractions against their surrounding context. This dramatically reduces false positives from words like "crash" (server vs PEM), "head" (direction vs headache), "sharp" (mind vs pain), "beat" (game vs fatigue), and many others.

## Problem Statement
The NLP extraction system matches single-word lemmas to symptom categories. Many of these words are ambiguous:
- "crash" = PEM crash OR server crash
- "head" = headache OR "head of department"
- "back" = back pain OR "come back"
- "sharp" = sharp pain OR "sharp mind"
- "racing" = palpitations OR "car racing"
- "toast" = fatigue OR breakfast

Without context validation, these words produce false positive symptom extractions that reduce user trust and accuracy.

## Solution

### Architecture
A new `contextFilter.ts` module that:
1. Defines **context rules** for each ambiguous lemma
2. Checks **supporting evidence** (words that validate the symptom meaning)
3. Checks **invalidating evidence** (words that indicate non-medical usage)
4. Filters out or adjusts confidence for ambiguous extractions

### Integration Point
Runs after confidence scoring (Step 5) and before temporal info (Step 6):

```
Step 1:   Numeric severity extraction
Step 1.5: Pain details extraction
Step 2:   Phrase-based symptoms
Step 2.5: Custom lemma phrases
Step 3:   Lemma-based symptoms
Step 4:   Activity triggers + linking
Step 5:   Confidence scoring
Step 5.5: Context-aware filtering  ← NEW
Step 5.6: Symptom conflict resolution  ← NEW
Step 6:   Temporal info
Step 7:   Spoon count
```

---

## Files Modified/Created

### New: `mobile/src/nlp/contextFilter.ts`
Core module with:
- Context validation rules for 20+ ambiguous lemmas
- `validateLemmaContext()` - Check surrounding tokens for evidence
- `applyContextFilter()` - Filter symptoms based on context validation
- `resolveSymptomConflicts()` - Remove mutually exclusive symptom pairs
- `isContextSensitiveLemma()` - Check if a lemma needs validation

### Modified: `mobile/src/nlp/extractor.ts`
- Added import for `applyContextFilter` and `resolveSymptomConflicts`
- Added Step 5.5 (context filtering) and Step 5.6 (conflict resolution)
- Added re-exports for backward compatibility

### New: `mobile/src/nlp/contextFilter.test.ts`
- 70+ comprehensive test cases

---

## Context Rules Defined

### PEM/Crash (Highest Risk)

| Lemma | Supporting Context | Invalidating Context | Without Context |
|-------|-------------------|---------------------|-----------------|
| `crash` / `crashed` | walking, exercise, fatigue, overexerted, after, hard, pem | server, computer, car, app, software, game | conf ≤ 0.35 |

### Body Parts (High Risk)

| Lemma | Supporting Context | Invalidating Context | Without Context |
|-------|-------------------|---------------------|-----------------|
| `head` | pain, throbbing, splitting, migraine, pounding | office, manager, count, direction, use | conf ≤ 0.30 |
| `back` | pain, aching, lower, upper, spasm, stiff | come, go, bring, put, look, step, fight | conf ≤ 0.30 |
| `neck` | pain, stiff, tension, tight, spasm, crick | woods, bottle, guitar | conf ≤ 0.35 |
| `chest` | pain, tight, pressure, heavy, squeezing | drawer, treasure, toy, storage | conf ≤ 0.35 |
| `joint` / `joints` | pain, stiff, swollen, inflamed, clicking | effort, venture, account, operation | conf ≤ 0.30 |
| `muscle` / `muscles` | pain, spasm, twitching, weak, tension | car, memory | conf ≤ 0.40 |

### Pain Qualifiers (Medium Risk)

| Lemma | Supporting Context | Invalidating Context | Without Context |
|-------|-------------------|---------------------|-----------------|
| `sharp` | pain, ache, body parts | mind, knife, dressed, contrast | conf ≤ 0.25 |
| `burning` | pain, sensation, body parts | calories, candle, fire, money | conf ≤ 0.25 |

### Cardiac (Medium Risk)

| Lemma | Supporting Context | Invalidating Context | Without Context |
|-------|-------------------|---------------------|-----------------|
| `race` | heart, pulse, chest, palpitations | car, horse, marathon, competition | conf ≤ 0.20 |
| `racing` | heart, pulse, thoughts, mind | car, horse, game, driver | conf ≤ 0.30 |

### Fatigue Slang (Medium Risk)

| Lemma | Supporting Context | Invalidating Context | Without Context |
|-------|-------------------|---------------------|-----------------|
| `beat` | feeling, am, so, exhausted | drum, game, him, her, score, team | conf ≤ 0.30 |
| `shattered` | feeling, absolutely, exhausted | glass, window, mirror, screen | conf ≤ 0.35 |
| `wrecked` | feeling, exhausted, tired | car, ship, building, truck | conf ≤ 0.35 |
| `destroyed` | feeling, totally, wiped | building, city, evidence, document | conf ≤ 0.35 |
| `toast` | feeling, am, totally, completely | bread, butter, breakfast, avocado | conf ≤ 0.25 |
| `cooked` | feeling, am, absolutely | food, dinner, chicken, recipe | conf ≤ 0.25 |

### Other Ambiguous Words

| Lemma | Supporting Context | Invalidating Context | Without Context |
|-------|-------------------|---------------------|-----------------|
| `spinning` | room, dizzy, vertigo, head | wheel, yarn, class, web | conf ≤ 0.30 |
| `eating` | disorder, binge, restrict, anxiety | lunch, dinner, pizza, restaurant | conf ≤ 0.20 |
| `pushed` | myself, too hard, limits, through | button, door, cart, away | conf ≤ 0.30 |

---

## Validation Logic

### Three-Way Classification
```
validateLemmaContext() returns:
  'valid'     → Supporting evidence found (e.g., "head" + "throbbing")
  'invalid'   → Invalidating evidence found (e.g., "head" + "office")
  'uncertain' → No strong evidence either way (e.g., just "head")
```

### Filtering Behavior
- **valid**: Keep symptom as-is
- **invalid**: Remove symptom entirely (likely false positive)
- **uncertain**: Keep but cap confidence at `minConfidenceWithoutContext`

### Invalidating Evidence Takes Precedence
If both supporting AND invalidating evidence exist, `invalid` wins:
```
"I came back and my back hurts"
  → "back" (first): invalidating "came" → filtered out
  → "back" (second): supporting "hurts" → kept
```

---

## Symptom Conflict Resolution

### Mutually Exclusive Pairs
Certain symptoms cannot coexist. When both are detected, the one with lower confidence is removed:

| Symptom A | Symptom B | Resolution |
|-----------|-----------|------------|
| insomnia | hypersomnia | Keep higher confidence |

### Expansion Plan
Future conflicts to add:
- `sweating` + `chills` (possible but flag)
- `constipation` + `diarrhea` (could alternate, but unusual simultaneously)

---

## Real-World Examples

### Example 1: Tech Context (False Positive Prevented)
```
Input: "The app crashed this morning"
Before: Extracts PEM (pem) from "crashed" ❌
After:  "crashed" invalidated by "app" → filtered out ✅
```

### Example 2: Medical Context (True Positive Kept)
```
Input: "I crashed hard after walking today"
Before: Extracts PEM ✅
After:  "crashed" validated by "walking", "after" → kept ✅
```

### Example 3: Body Part Direction (False Positive Prevented)
```
Input: "I came back from the store"
Before: Extracts back_pain from "back" ❌
After:  "back" invalidated by "came" → filtered out ✅
```

### Example 4: Genuine Body Pain (True Positive Kept)
```
Input: "My lower back is aching"
Before: Extracts back_pain ✅
After:  "back" validated by "aching", "lower" → kept ✅
```

### Example 5: Slang Fatigue (Context Determines)
```
Input: "Had avocado toast for breakfast"
After:  "toast" invalidated by "avocado", "breakfast" → filtered ✅

Input: "I am completely toast after that"
After:  "toast" validated by "completely", "am" → kept ✅
```

### Example 6: Cardiac (Context Determines)
```
Input: "Car racing on the track"
After:  "racing" invalidated by "car", "track" → filtered ✅

Input: "My heart is racing fast"
After:  "racing" validated by "heart" → kept ✅
```

---

## Test Coverage

### Created: `mobile/src/nlp/contextFilter.test.ts`

**70+ test cases** organized by:

#### Context Sensitivity Detection (2 groups)
- Identifies context-sensitive lemmas correctly
- Non-sensitive lemmas pass through

#### Lemma Context Validation (30+ tests)
- PEM/Crash: valid, invalid, uncertain contexts
- Body parts: head, back, neck, chest, joint, muscle
- Pain qualifiers: sharp, burning
- Cardiac: race, racing
- Fatigue slang: beat, shattered, toast, cooked, wrecked, destroyed
- Vertigo: spinning
- PEM: pushed

#### Filter Application (5 tests)
- Removes false positives
- Keeps valid extractions
- Preserves phrase-based extractions
- Adjusts confidence for uncertain
- Preserves non-sensitive lemmas

#### Conflict Resolution (5 tests)
- Insomnia vs hypersomnia resolution
- Higher confidence wins
- Non-conflicting symptoms preserved
- Empty list handling
- Default confidence handling

#### Pipeline Integration (5 tests)
- Tech context filtering
- Medical context preservation
- Directional context filtering
- Pain context preservation
- Mixed valid/invalid handling

#### Real-World Scenarios (6 tests)
- Daily life descriptions
- Genuine pain descriptions
- Slang with clear context
- Food context prevention
- Heart vs car racing
- Complex multi-symptom text

#### Edge Cases (4 tests)
- Empty text
- Isolated ambiguous words
- Mixed case handling
- Custom lemmas bypass

---

## Performance Impact

- **Processing**: O(symptoms × window_size) per extraction - negligible overhead
- **No regex**: Pure Set-based lookups for maximum speed
- **Module load**: Context rules defined as static objects, compiled once
- **Memory**: ~2KB for all context rule dictionaries

---

## Backward Compatibility

✅ **Fully backward compatible**
- No changes to function signatures
- New filtering is additive (removes false positives, doesn't add new ones)
- Phrase-based extractions are never filtered (already high specificity)
- Non-context-sensitive lemmas pass through unchanged

---

## Key Improvements Summary

| Metric | Before | After |
|--------|--------|-------|
| **"Server crashed" → PEM** | ✅ False positive | ❌ Filtered out |
| **"Came back" → back_pain** | ✅ False positive | ❌ Filtered out |
| **"Head of office" → headache** | ✅ False positive | ❌ Filtered out |
| **"Sharp mind" → pain** | ✅ False positive | ❌ Filtered out |
| **"Car racing" → palpitations** | ✅ False positive | ❌ Filtered out |
| **"Avocado toast" → fatigue** | ✅ False positive | ❌ Filtered out |
| **"Beat the game" → fatigue** | ✅ False positive | ❌ Filtered out |
| **Valid extractions** | ✅ Kept | ✅ Still kept |
| **Phrase extractions** | ✅ Unaffected | ✅ Unaffected |

---

## Related Documentation

- [TRIGGER_LINKING_IMPROVEMENTS.md](./TRIGGER_LINKING_IMPROVEMENTS.md) - Activity trigger detection
- [TEMPORAL_PATTERN_IMPROVEMENTS.md](./TEMPORAL_PATTERN_IMPROVEMENTS.md) - Temporal pattern extraction
- [PAIN_CONFIDENCE_IMPROVEMENTS.md](./PAIN_CONFIDENCE_IMPROVEMENTS.md) - Confidence scoring
- [NEGATION_IMPROVEMENTS.md](./NEGATION_IMPROVEMENTS.md) - Negation detection
