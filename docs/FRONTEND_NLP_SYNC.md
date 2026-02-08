# Frontend-NLP Synchronization Tasks

## Overview
The NLP extraction system has been significantly enhanced with 4 major improvements:
1. **Temporal Pattern Enhancement** - Multi-day patterns, time progression, recovery timelines
2. **Context-Aware Filtering** - Removes false positives from ambiguous lemmas
3. **Trigger Enhancement** - Temporal delay patterns, confidence scoring
4. **Confidence Scoring** - Multi-factor weighting for extraction accuracy

However, the frontend UI is **not yet displaying** several important pieces of data that the NLP is now extracting. This document outlines what needs to be added to the frontend.

---

## What's Currently Displayed ✅

### SymptomChip Component
- ✅ Symptom name (formatted)
- ✅ Severity badge
- ✅ Pain details (qualifiers + location) - Already implemented!
- ✅ Activity trigger (formatted)
- ✅ Duration (formatted)
- ✅ Time of day (formatted)

### SymptomDisplay Component
- ✅ Symptom name
- ✅ Severity badge
- ✅ Method (phrase/lemma)
- ✅ Matched text

### ReviewEntryScreen
- ✅ Full symptom details via editors
- ✅ Rant text display
- ✅ Spoon count (when available)

---

## What's Missing from Frontend ❌

### 1. Confidence Scores
**NLP Data**: `ExtractedSymptom.confidence` (0-1 float)

**Current State**: Extracted but not displayed anywhere

**Why It Matters**:
- Users should know when extractions are uncertain
- Helps explain why an unexpected symptom was extracted
- Example: "crash" in tech context has low confidence after filtering

**Priority**: HIGH - Shows extraction quality to users

**Display Options**:
- Small confidence indicator in symptom chip (e.g., "97% confident")
- Tooltip/details view showing "This extraction has medium confidence"
- Visual indicator (color intensity, opacity) based on confidence
- In SymptomDetailEditor as read-only info

**Implementation**:
```typescript
// Add to ExtractedSymptom interface (already there - just unused)
confidence?: number;  // 0-1 scale

// Display in SymptomChip
<Text>{displayName} · {Math.round((symptom.confidence || 0.8) * 100)}%</Text>
```

---

### 2. Temporal Progression Information
**NLP Data**: `SymptomDuration.progression`
- Values: `'progressive_worsening'` | `'progressive_improving'` | `'recurring'` | `'stable'` | `'fluctuating'`

**Current State**: Extracted but not displayed

**Examples**:
- "Getting progressively worse" → `progressive_worsening`
- "Improving each day" → `progressive_improving`
- "Comes and goes" → `recurring`
- "No change" → `stable`
- "Up and down" → `fluctuating`

**Why It Matters**:
- Shows if symptoms are trending up/down/cyclical
- Critical for tracking flares vs improvements
- Helps users notice patterns they might miss

**Priority**: MEDIUM - Important for insights/trends

**Display Options**:
- Add progression indicator to SymptomChip (e.g., "↑ Worsening", "↓ Improving", "◇ Recurring")
- Show in InsightsScreen trends section
- Use in HistoryScreen to highlight symptom trajectories

**Implementation**:
```typescript
// In SymptomChip, add progression info to secondaryParts
if (symptom.duration?.progression) {
  const progressionLabel = {
    progressive_worsening: '↑ Worsening',
    progressive_improving: '↓ Improving',
    recurring: '◇ Recurring',
    stable: '= Stable',
    fluctuating: '≈ Fluctuating',
  }[symptom.duration.progression];
  secondaryParts.push(progressionLabel);
}
```

---

### 3. Recovery Time
**NLP Data**: `SymptomDuration.recoveryTime`
- Type: `SymptomDuration` (same as duration)
- Values: e.g., `{ value: 3, unit: 'days' }`, `{ ongoing: true }`

**Current State**: Extracted but not displayed

**Examples**:
- "Takes 3 days to recover" → `{ value: 3, unit: 'days' }`
- "Recovers overnight" → `{ unit: 'hours', value: 8 }`
- "Slow recovery" / "Not recovering" → flags

**Why It Matters**:
- Critical for PEM/crash tracking
- Shows impact on disability/functioning
- Essential for energy pacing decisions
- Helps pattern recognition ("crashes take 3 days each")

**Priority**: HIGH - Critical for chronic illness users (especially ME/CFS)

**Display Options**:
- Add "Recovery Time" row in SymptomDetailEditor/review
- Show in SymptomChip secondary info (e.g., "Recovers in 2 days")
- Highlight in crash/PEM entries specifically
- Track recovery trends in InsightsScreen

**Implementation**:
```typescript
// Add to SymptomChip secondary parts
if (symptom.duration?.recoveryTime) {
  secondaryParts.push(`Recovery: ${formatSymptomDuration(symptom.duration.recoveryTime)}`);
}

// Add recoveryTime editor to DurationPicker component
// Show in "Additional Details" expandable section
```

---

### 4. Trigger Temporal Patterns
**NLP Data**: `ActivityTrigger.delayPattern`
- Values: `'immediate'` | `'hours_later'` | `'next_day'` | `'delayed_pem'` | etc.

**Current State**: Extracted but not displayed

**Examples**:
- "After I walked, I crashed" → `'immediate'` (delay pattern detected)
- "Gardened yesterday, crashed today" → `'next_day'` or `'delayed_pem'`
- "Had coffee, then shaky 2 hours later" → `'hours_later'`

**Why It Matters**:
- Shows WHEN symptoms appear after triggers
- Critical for PEM patterns (delayed 12-48 hours)
- Helps identify immediate vs delayed reactions
- Pattern recognition ("activities always cause problems next day")

**Priority**: MEDIUM-HIGH - Essential for trigger-symptom linking accuracy

**Display Options**:
- Enhance trigger display in SymptomChip (e.g., "After walking (next day)")
- Show in TriggerPicker as additional detail
- Visual timeline in detailed view (show trigger at T0, symptom at T+24h)
- In HistoryScreen, group triggers by delay pattern

**Implementation**:
```typescript
// Enhance formatActivityTrigger to include delay pattern
export function formatActivityTrigger(trigger: ActivityTrigger): string {
  const delayLabels = {
    immediate: 'right after',
    hours_later: '(hours later)',
    next_day: '(next day)',
    delayed_pem: '(delayed crash)',
    // ...
  };

  const delay = trigger.delayPattern ? ` ${delayLabels[trigger.delayPattern]}` : '';
  return `${trigger.timeframe} ${trigger.activity}${delay}`;
}

// Example: "after walking (next day)" instead of just "after walking"
```

---

### 5. Trigger Sentence Distance (Minor)
**NLP Data**: `ActivityTrigger.sentenceDistance` (0-5+ sentences apart)

**Current State**: Used for internal matching but not displayed

**Why It Matters**:
- Shows how contextually related trigger/symptom are
- Low distance = more likely causation
- High distance = might be coincidental

**Priority**: LOW - Mostly internal housekeeping data

**Display**: Could show as confidence indicator in trigger linking
- "Strong trigger link" (0 sentences apart)
- "Likely trigger" (1-2 sentences)
- "Possible trigger" (3+ sentences)

---

## Implementation Priority & Effort

| Feature | Priority | Effort | Impact | Notes |
|---------|----------|--------|--------|-------|
| **Confidence Scores** | HIGH | Small | High | ~30 min - Just add display to SymptomChip |
| **Temporal Progression** | MEDIUM | Small | Medium | ~1 hour - Icons/labels, add to trends screen |
| **Recovery Time** | HIGH | Medium | High | ~1.5 hours - Needs DurationPicker update |
| **Trigger Delay Patterns** | MEDIUM | Small | High | ~45 min - Enhance formatActivityTrigger |
| **Trigger Confidence** | MEDIUM | Small | Medium | ~30 min - Show link confidence |
| **Sentence Distance** | LOW | Small | Low | ~15 min - Optional refinement |

---

## Component Update Roadmap

### Phase 1: Quick Wins (2-3 hours)
1. **Add confidence badges to SymptomChip**
   - File: `mobile/src/components/SymptomChip.tsx`
   - Add percentage confidence badge
   - Add confidence info to accessibility labels

2. **Add progression icons to SymptomChip**
   - File: `mobile/src/components/SymptomChip.tsx`
   - Add arrow icons: ↑ (worsening), ↓ (improving), ◇ (recurring)
   - Add to secondary text line

3. **Enhance trigger formatting**
   - File: `mobile/src/types/index.ts` (formatActivityTrigger function)
   - Add delay pattern labels to trigger display
   - Example: "after walking (next day)" vs just "after walking"

### Phase 2: Medium Effort (2-3 hours)
4. **Add Recovery Time display**
   - File: `mobile/src/components/DurationPicker.tsx`
   - Add "Recovery Time" section to duration editor
   - File: `mobile/src/components/SymptomChip.tsx`
   - Display recovery time in secondary info
   - File: `mobile/src/screens/ReviewEntryScreen.tsx`
   - Show recovery time in review

5. **Update SymptomDetailEditor**
   - File: `mobile/src/components/SymptomDetailEditor.tsx`
   - Add read-only display of confidence score
   - Add progression indicator display
   - Add recovery time editor access

### Phase 3: Advanced (3-4 hours)
6. **Update InsightsScreen**
   - File: `mobile/src/screens/InsightsScreen.tsx`
   - Track progression trends (% of symptoms worsening)
   - Highlight symptoms with delayed recovery patterns
   - Show trigger delay pattern distribution

7. **Update HistoryScreen**
   - File: `mobile/src/screens/HistoryScreen.tsx`
   - Show progression indicators with symptom history
   - Group/filter by delay patterns
   - Timeline view of symptom progression

---

## Key Files to Modify

```
mobile/src/
├── components/
│   ├── SymptomChip.tsx                    ← PRIORITY: Add confidence, progression
│   ├── DurationPicker.tsx                 ← PRIORITY: Add recovery time editor
│   ├── SymptomDetailEditor.tsx            ← MEDIUM: Display progression/confidence
│   └── TriggerPicker.tsx                  ← MEDIUM: Show delay patterns
├── types/
│   └── index.ts                           ← PRIORITY: Update formatActivityTrigger
├── screens/
│   ├── ReviewEntryScreen.tsx              ← MEDIUM: Show new fields
│   ├── InsightsScreen.tsx                 ← LOW: Add trend tracking
│   └── HistoryScreen.tsx                  ← LOW: Add progression display
└── contexts/
    └── AccessibilityContext.ts            ← Check if any a11y updates needed
```

---

## Type System - Already Ready ✅

The TypeScript types already support all these fields:
```typescript
export interface ExtractedSymptom {
  symptom: string;
  matched: string;
  method: 'phrase' | 'lemma' | 'quick_checkin';
  severity?: Severity | null;
  confidence?: number;  // ✅ Already here - 0-1
  duration?: SymptomDuration;  // ✅ Includes progression & recoveryTime
  painDetails?: PainDetails;
  trigger?: ActivityTrigger;  // ✅ Includes delayPattern & sentenceDistance
  timeOfDay?: TimeOfDay;
}

export interface SymptomDuration {
  value?: number;
  unit?: 'minutes' | 'hours' | 'days' | 'weeks';
  qualifier?: string;
  since?: string;
  ongoing?: boolean;
  progression?: 'progressive_worsening' | 'progressive_improving' | 'recurring' | 'stable' | 'fluctuating';
  recoveryTime?: SymptomDuration;  // ✅ Already here!
}

export interface ActivityTrigger {
  activity: string;
  timeframe?: string;
  confidence?: number;
  delayPattern?: string;  // ✅ Already here!
  sentenceDistance?: number;  // ✅ Already here!
}
```

---

## Testing Checklist

After each update, test with these scenarios:

- [ ] Symptom with high confidence (>90%) displays percentage
- [ ] Symptom with low confidence (<60%) shows uncertainty clearly
- [ ] Progression icon displays correctly (↑/↓/◇/=/≈)
- [ ] Recovery time shows as "Recovers in X days" format
- [ ] Trigger with delay pattern shows "(next day)" or "(immediate)"
- [ ] Trigger sentence distance doesn't affect user-visible display
- [ ] All accessibility labels updated with new info
- [ ] Theme colors work with new indicators
- [ ] Touch targets still meet 48pt minimum for buttons

---

## Future Enhancement Ideas

Once basics are in place:
1. **Confidence thresholds** - Dim or hide very low confidence extractions
2. **Recovery predictions** - "Based on pattern, expect 3 days to recover"
3. **Trend alerts** - "Your fatigue has been progressively worsening for 5 days"
4. **Trigger confidence matching** - "This trigger has 87% certainty based on pattern"
5. **Timeline visualization** - Show trigger → delay → symptom onset visually

