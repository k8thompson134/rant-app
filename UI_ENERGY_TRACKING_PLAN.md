# Energy Tracking UI Features - Implementation Plan

## Current State Audit

### Screens
- **HomeScreen** - Rant input, quick check-in modal
- **ReviewEntryScreen** - Edit symptoms before save, includes SpoonCountDisplay
- **HistoryScreen** - List past entries with refresh
- **MonthScreen** - Calendar + list view, edit entries, manage symptoms
- **InsightsScreen** - Monthly stats, symptom frequency, trend analysis
- **VoiceRecordingScreen** - Voice input
- **CatchUpScreen/CatchUpReviewScreen** - Repeat previous entry
- **SettingsScreen** - Settings
- **DictionaryScreen** - Custom lemma management
- **GuideScreen** - Help content

### Key Components
- **SpoonCountDisplay** - Energy visualization (10 dots, color-coded)
- **SymptomChip** - Symptom display with severity, pain details, trigger, duration
- **SeverityPicker** - Modal for severity selection (mild/moderate/severe)
- **SymptomDetailEditor** - Full symptom editing
- **DurationPicker** - Duration/temporal info
- **TimeOfDayPicker** - When symptom occurred
- **TriggerPicker** - Activity trigger selection
- **PainLocationPicker** - Pain location selection
- **QuickCheckInModal** - Quick entry modal
- **AddSymptomModal** - Add new symptom
- **Charts** - SymptomGrid, StatCard, CapsuleChart for insights

### Design Patterns
- Modal-based pickers (severity, duration, time of day, etc.)
- Color-coded: symptom categories (pem/fatigue/brainfog/pain) have distinct colors
- Severity-based coloring: good/moderate/rough
- Chip-based symptom display with edit/delete
- Accessibility: touch targets, screen reader labels
- Theme support: dark theme with context

## UI Features to Add

### 1. **FunctionalCapacityDisplay** Component
**Purpose:** Display P/C tiers alongside SpoonCountDisplay  
**Location:** ReviewEntryScreen, MonthScreen, HistoryScreen  
**Design:**
- Horizontal row: P-tier on left, C-tier on right
- Tier visualization: 
  - Icon + label (P3 = "Light tasks", C4 = "Productive")
  - Color gradient P-2 (red) → P5 (green)
  - Optional sensory flag indicator (light bulb icon with tooltip)
- Compact mode for list views, full mode for review/edit
- Clickable to edit (opens picker modal)

```
┌─────────────────────────────────────────┐
│  Physical: P3 (Light tasks)             │  
│  Cognitive: C4 (Productive)             │
│  ⚠️ Light sensitivity active            │
└─────────────────────────────────────────┘
```

### 2. **CapacityTierPicker** Component (Modal)
**Purpose:** Select physical/cognitive tiers during entry review  
**Location:** ReviewEntryScreen → opens on FunctionalCapacityDisplay click  
**Design:**
- Two sections: Physical (P-2 to P+) and Cognitive (C-1 to C+)
- Each tier shows:
  - Tier label (P3)
  - Description ("Light tasks: dishes, tidying, short tasks")
  - Icon/color indicator
- Current selection highlighted
- "Skip" button to unset if not sure
- Done button to confirm

### 3. **OutcomeToggle** Component
**Purpose:** Select attempt-cost relationship  
**Location:** ReviewEntryScreen, MonthScreen detail view  
**Design:**
- Button group: 4 options
  - ✓ Completed (no cost indicator)
  - ✓⚠️ Completed + Cost
  - ◐ Attempted (didn't finish)
  - ✗ Unable (couldn't attempt)
- Show selected with badge/highlight
- Optional toggle directly or modal with explanations

### 4. **SensoryLoadFlag** Component
**Purpose:** Mark and display sensory overload  
**Location:** ReviewEntryScreen, alongside capacity display  
**Design:**
- Compact indicator: Light/Sound/Combined icons with toggle
- Details modal:
  - Checkboxes: Light, Sound, Combined, Smell, Touch, Temperature
  - Severity slider: Elevated → High
  - Context: "This modifies your actual capacity"
- Shows on entry summary as ⚠️ badge

### 5. **EnergyTrendChart** Component
**Purpose:** Visualize P/C tier patterns over time  
**Location:** InsightsScreen (new section)  
**Design:**
- Line chart showing P-tier and C-tier over last 30 days
- X-axis: dates, Y-axis: tiers (P-2 to P5, C-1 to C4)
- Hover/tap shows: date, both tiers, sensory load flag
- Filter buttons: Last week / 2 weeks / Month
- Annotations for sensory flag days (vertical line marker)
- Export as image

### 6. **ActivityCostMatrix** Component
**Purpose:** Show which activities have high/low cost for you  
**Location:** InsightsScreen (new section)  
**Design:**
- Table format:
  - Activity | Frequency | Outcome | Avg Cost
  - "shower" | 12x | 8 completed, 3 cost, 1 attempted | ⚠️
  - "work" | 15x | 10 completed, 5 cost | ⚠️⚠️
- Color coding: green (no cost) → red (high cost)
- Tap row to see details (date list, outcome breakdown)
- Sortable by frequency/cost

### 7. **PEMDelayAnalysis** Component
**Purpose:** Detect and display PEM crash patterns  
**Location:** InsightsScreen (new section)  
**Design:**
- Show pattern detection results:
  - "You crash 36-48 hours after P4-P5 days" 
  - "Sensory overload precedes crashes within 24h"
  - "Bath-only weeks correlate with P0 days"
- Toggle showing: data points / confidence / next risk date
- Color-coded by confidence (high/medium/low)
- Timeline showing upcoming risk dates

### 8. **PacingEffectiveness** Component
**Purpose:** Validate pacing strategy  
**Location:** InsightsScreen (new section)  
**Design:**
- Metric cards:
  - P+ days (paced) trend: ↑ increasing (good)
  - P0 days (crash) trend: ↓ decreasing (good)
  - Average capacity tier before/after change
- Graph: P+ vs P0 frequency over time
- Success indicator: "Pacing effective - P+ up 30%, P0 down 25%"

### 9. **EnergyAnnotation** on HistoryScreen
**Purpose:** Show capacity at a glance in list view  
**Location:** HistoryScreen entries  
**Design:**
- Add mini capacity indicator next to each entry:
  - P3|C2 · ⚠️ (if sensory flag)
  - Colored box background (tier color)
- Tap to expand/edit
- Helps scan history for patterns

### 10. **QuickEnergyCheckIn** Modal
**Purpose:** Fast energy logging when too fatigued for full rant  
**Location:** HomeScreen → option in QuickCheckInModal  
**Design:**
- Simple tier selection (no text required):
  - Large P-tier buttons (P-1, P0, P1, P2, P3, P4, P5, P+)
  - Large C-tier buttons (C-1, C0, C1, C2, C3, C4, C+)
  - Optional: sensory flag checkboxes
  - Optional: "painful to use buttons?" → single-tap voice mode
- One-tap save (no review needed)
- Returns to HomeScreen

### 11. **CalibrationGuide** Modal
**Purpose:** Help user learn personal tier definitions  
**Location:** SettingsScreen → "Calibrate Energy Tiers"  
**Design:**
- Step 1: Select tier
- Step 2: Show default description
- Step 3: User enters personal examples ("when I can cook dinner")
- Step 4: Saved as personal anchors
- Quick reference card shown during entry review
- Edit anchors anytime

### 12. **MonthViewUpdate**
**Purpose:** Add energy data to calendar view  
**Location:** MonthScreen calendar cells  
**Design:**
- Current: severity dots (good/moderate/rough)
- Add: P-tier + C-tier shown in cell
- Color cells based on lowest tier (P0 = darker, P5 = lighter)
- Tap cell to see: all tiers + sensory flags + activities

## Implementation Phases

### Phase 1: Core Display (High Priority)
1. FunctionalCapacityDisplay component
2. Update ReviewEntryScreen to show capacity (extracted by NLP)
3. Update HistoryScreen with capacity annotations
4. Update MonthScreen with capacity tier in cells

### Phase 2: Editing (High Priority)
1. CapacityTierPicker modal
2. OutcomeToggle component
3. SensoryLoadFlag component
4. Wire up to ReviewEntryScreen

### Phase 3: Quick Logging (Medium Priority)
1. QuickEnergyCheckIn modal
2. Add to HomeScreen
3. Voice mode option

### Phase 4: Insights (Medium Priority)
1. EnergyTrendChart
2. ActivityCostMatrix
3. Add to InsightsScreen
4. PEMDelayAnalysis (basic detection)
5. PacingEffectiveness

### Phase 5: Calibration (Low Priority)
1. CalibrationGuide modal
2. Personal anchor management UI
3. Add to SettingsScreen

### Phase 6: Polish (Low Priority)
1. Animations for tier changes
2. Export capacity data
3. Custom color schemes for tiers

## Color & Accessibility Considerations
- Physical tier colors:
  - P-2/P-1: Red (#FF6B6B) - severe
  - P0/P1: Orange (#FFA500) - limited
  - P2/P3: Yellow (#FFD700) - moderate
  - P4/P5/P+: Green (#4CAF50) - good
  
- Cognitive tier colors:
  - C-1/C0: Red (#FF6B6B) - severe
  - C1: Orange (#FFA500) - low demand
  - C2/C3: Yellow (#FFD700) - moderate
  - C4/C+: Green (#4CAF50) - productive
  
- Always include text labels + icons (not just color)
- Dark mode: maintain contrast ratios
- Sensory flag: ⚠️ + tooltip explaining what it means

## Data Flow
```
extractSymptoms() 
  → infers functionalCapacity (NLP)
  
saveRantEntry()
  → stores functionalCapacity in DB
  
ReviewEntryScreen
  → displays inferred capacity
  → user can edit via modals
  → updates before saving
  
HistoryScreen/MonthScreen
  → displays stored capacity with entry
  → editable on tap
  
InsightsScreen
  → loads all capacity data
  → analyzes patterns (PEM, pacing, costs)
  → visualizes trends
```
