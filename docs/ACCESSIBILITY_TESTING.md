# RantTrack Accessibility Testing Guide

Complete guide for testing RantTrack's accessibility features, including screen readers, font scaling, and ME/CFS-specific features.

## Table of Contents
1. [Visual Accessibility Testing](#visual-accessibility-testing)
2. [Screen Reader Testing](#screen-reader-testing)
3. [Touch Target Testing](#touch-target-testing)
4. [ME/CFS Features Testing](#mecfs-features-testing)
5. [System Integration Testing](#system-integration-testing)

---

## Visual Accessibility Testing

### High Contrast Mode
**Location**: Settings → Visual Accessibility → High Contrast Mode

**Test Steps**:
1. Navigate to Settings screen
2. Toggle "High Contrast Mode" ON
3. Verify immediate color changes app-wide:
   - Background becomes pure black (#000000) or white (#FFFFFF)
   - Text becomes pure white or black for maximum contrast
   - Accent colors become brighter/darker for 7:1 contrast ratio (WCAG AAA)

**Expected Results**:
- All text should be easily readable in bright sunlight
- Color contrast should meet WCAG AAA standards (7:1)
- No visual elements should become invisible
- Theme updates instantly without app restart

### Font Size Scaling
**Location**: Settings → Visual Accessibility → Font Size

**Test Steps**:
1. Navigate to Settings screen
2. Test each font size option (Small → Medium → Large → Extra Large)
3. Navigate through all screens (Home, Month, History, Settings)
4. Verify text scales correctly without overflow or clipping

**Font Scale Multipliers**:
- Small: 0.85x
- Medium: 1.0x (default)
- Large: 1.15x
- Extra Large: 1.30x

**Expected Results**:
- Text should scale up/down smoothly
- No text should overflow containers
- Line height should increase proportionally
- Buttons should accommodate larger text

### System Font Scaling (200% Test)
**iOS**: Settings → Accessibility → Display & Text Size → Larger Text → Move slider to maximum

**Android**: Settings → Display → Font size → Largest

**Test Steps**:
1. Set system font size to maximum (200%+)
2. Open RantTrack
3. Navigate through all screens
4. Verify text is readable and doesn't clip

**Expected Results**:
- App respects system font scale (multiplies with app setting)
- Example: App "Large" (1.15x) × System 200% = 2.3x final scale
- Text should wrap correctly
- UI elements should grow to accommodate text
- No critical information should be hidden

### Reduced Motion
**Location**: Settings → Visual Accessibility → Reduced Motion

**Test Steps**:
1. Toggle "Reduced Motion" ON
2. Navigate between screens
3. Open/close modals (SeverityPicker, QuickCheckInModal, AddSymptomModal)
4. Expand/collapse "Edit Details" on Review screen

**Expected Results**:
- All animations should be disabled (duration: 0ms)
- Screen transitions should be instant
- No fading, sliding, or other motion effects
- App should still be fully functional

---

## Screen Reader Testing

### VoiceOver Testing (iOS)
**Enable**: Settings → Accessibility → VoiceOver → ON
**Or**: Triple-click side button (if configured)

**Navigation Gestures**:
- Swipe right: Next element
- Swipe left: Previous element
- Double tap: Activate element
- Three-finger swipe up/down: Scroll

**Test Checklist**:

#### Home Screen
- [ ] "How's it going?" heading is announced
- [ ] Date is announced (e.g., "Monday, December 30")
- [ ] "Same as yesterday" button: Label + state (enabled/disabled)
- [ ] "Quick check-in" button: Label + hint
- [ ] Text input: "Type or speak about how you're feeling"
- [ ] Voice input button: "Start voice input" / "Stop recording"
- [ ] Save button: "Save Entry" + disabled state when empty

#### Review Entry Screen
- [ ] "Review Your Entry" heading announced
- [ ] Top 3 symptoms announced correctly
- [ ] "Looks good - Save" button announced
- [ ] "Edit Details" button: Label + hint ("Show/Hide edit details")
- [ ] Edit/Delete buttons on symptom chips: "Edit symptom", "Delete symptom"
- [ ] "Add symptom" button announced

#### Settings Screen
- [ ] All section headings announced ("ME/CFS Features", "Visual Accessibility")
- [ ] Switch labels announced with current state (ON/OFF)
- [ ] Font size picker: Each option announced ("Small", "Medium", "Large", "Extra Large")
- [ ] Touch target picker: Values announced ("48pt Minimum", "56pt Comfortable", "64pt Large")

### TalkBack Testing (Android)
**Enable**: Settings → Accessibility → TalkBack → ON
**Or**: Hold both volume keys for 3 seconds

**Navigation Gestures**:
- Swipe right: Next element
- Swipe left: Previous element
- Double tap: Activate element
- Swipe down then up: First item in list
- Swipe up then down: Last item in list

**Test Checklist** (Same as VoiceOver):
- Run through all screens
- Verify all interactive elements are announced
- Verify button roles are correct ("Button", "Switch", "Text field")
- Verify disabled states are announced

---

## Touch Target Testing

### Minimum Touch Target Verification
**Standard**: WCAG 2.1 AAA requires minimum 48×48pt touch targets

**Test Method**:
1. Navigate to Settings → Visual Accessibility → Touch Target Size
2. Test all three sizes:
   - Minimum (48pt)
   - Comfortable (56pt - Recommended)
   - Large (64pt - ME/CFS friendly)

**Components to Test**:
- [ ] VoiceInput button (Home screen)
- [ ] Save Entry button (Home screen)
- [ ] Quick action chips ("Same as yesterday", "Quick check-in")
- [ ] Symptom chip edit/delete buttons (Review screen)
- [ ] "Looks good - Save" button (Review screen)
- [ ] "Edit Details" toggle (Review screen)
- [ ] Severity picker buttons (Mild/Moderate/Severe)
- [ ] Add Symptom modal close button
- [ ] Settings toggles

**Expected Results**:
- All buttons should be easily tappable with thumb
- Minimum 16px spacing between interactive elements
- Touch targets should grow when size setting increases
- No accidental taps on adjacent buttons

---

## ME/CFS Features Testing

### Auto-Save Functionality
**Location**: Settings → ME/CFS Features → Auto-Save

**Test Steps**:
1. Enable Auto-Save
2. Navigate to Home screen
3. Type text into rant input
4. Wait 5 seconds (watch for "Saving..." → "Saved just now")
5. Force-close app (swipe up on app switcher)
6. Reopen app
7. Verify "Restore Draft?" alert appears

**Expected Results**:
- Draft auto-saves every 5 seconds
- "Saving..." indicator appears during save
- "Saved just now" / "Saved Xs ago" / "Draft saved" appears after save
- Draft persists through app crashes
- Alert offers "Discard" or "Restore" options

### Same as Yesterday
**Test Steps**:
1. Save an entry with symptoms
2. Next day (or immediately for testing), tap "Same as yesterday"
3. Try all three options:
   - **Cancel**: Should dismiss dialog
   - **Edit First**: Should pre-fill input with yesterday's text
   - **Save Now**: Should save directly (if bypass review enabled) or navigate to review

**Expected Results**:
- Yesterday's full text is copied
- Symptoms are preserved
- Timestamp updates to current date
- If "Bypass Review Screen" is OFF: navigates to Review screen
- If "Bypass Review Screen" is ON: saves directly

### Quick Check-In
**Test Steps**:
1. Tap "Quick check-in" on Home screen
2. Modal appears with 12 common symptoms
3. Tap symptoms to cycle: Unselected → Mild → Moderate → Severe → Unselected
4. Tap "Save (X symptoms)" to save

**Expected Results**:
- Modal opens instantly
- Tap cycles through severity levels
- Visual feedback shows current severity (color intensity)
- Counter shows "Save (X symptoms)"
- Entry saves in under 5 seconds (zero typing!)

### Bypass Review Screen
**Location**: Settings → ME/CFS Features → Bypass Review Screen

**Test Steps**:
1. Enable "Bypass Review Screen"
2. Submit a rant from Home screen
3. Verify entry saves directly without showing Review screen
4. Check History to confirm entry was saved

**Expected Results**:
- Entry saves immediately after NLP extraction
- No review step required
- Success alert shows briefly
- Returns to Home screen ready for next entry

---

## System Integration Testing

### Test Matrix

| Feature | Setting | Expected Behavior |
|---------|---------|-------------------|
| System Font Scale (iOS/Android) | 150% | Text scales 1.5× base size |
| System Font Scale (iOS/Android) | 200% | Text scales 2.0× base size |
| App Font Size: Large | System: 150% | Final scale: 1.15 × 1.5 = 1.725× |
| High Contrast + Large Fonts | Both ON | Colors + fonts both apply |
| Reduced Motion (System) | ON | App detects and disables animations |
| Reduced Motion (System) | OFF | App animations work normally |

### Combined Settings Test
**Test the "Ultimate Accessibility" Profile**:
1. Enable ALL accessibility features:
   - High Contrast Mode: ON
   - Font Size: Extra Large
   - Touch Target Size: Large (64pt)
   - Reduced Motion: ON
   - Auto-Save: ON
   - Bypass Review: ON
   - Show Quick Actions: ON
2. Set system font scale to maximum (200%)
3. Navigate through entire app

**Expected Results**:
- App remains fully functional
- All features work together without conflicts
- Text is readable at 260% scale (1.3 × 2.0)
- Buttons are large (64pt) and easy to tap
- No animations or motion
- Entries auto-save every 5 seconds

---

## Regression Testing Checklist

After any code changes, verify:

### Core Functionality
- [ ] Entry submission works (type → save)
- [ ] Voice input works (tap mic → speak → text appears)
- [ ] Symptom extraction works (NLP detects symptoms)
- [ ] Draft auto-save triggers every 5 seconds
- [ ] Draft recovery on app restart
- [ ] "Same as yesterday" copies text + symptoms
- [ ] Quick check-in saves symptoms in <5 seconds

### Accessibility Features
- [ ] High contrast toggles instantly
- [ ] Font size changes apply app-wide
- [ ] System font scaling multiplies correctly
- [ ] Touch targets meet 48pt minimum
- [ ] Reduced motion disables all animations
- [ ] VoiceOver/TalkBack announces all interactive elements
- [ ] All buttons have accessibility labels
- [ ] Disabled states are announced

### Visual Regression
- [ ] No text overflow at 200% font scale
- [ ] No UI elements overlap at Large touch targets
- [ ] Colors remain WCAG AAA compliant in high contrast
- [ ] Symptom chips display correctly at all sizes
- [ ] Modals are readable at all text sizes

---

## Known Issues / Future Improvements

### Planned (Phase 7)
- [ ] Add OpenDyslexic font support (requires font files)
- [ ] Test with physical braille displays
- [ ] Test with Switch Control (iOS) / Switch Access (Android)
- [ ] Test with Voice Control (iOS) / Voice Access (Android)
- [ ] Add keyboard navigation support
- [ ] Test at 300%+ font scaling

### Not Yet Implemented
- [ ] Light mode theme
- [ ] Custom color picker
- [ ] Adjustable auto-save interval

---

## Reporting Issues

If you find accessibility issues, please report:
1. **What happened**: Description of the problem
2. **Expected behavior**: What should have happened
3. **Steps to reproduce**: Detailed steps
4. **Settings active**: List all enabled accessibility settings
5. **Device info**: iOS/Android version, device model
6. **Screen reader**: VoiceOver/TalkBack version (if applicable)

---

## Quick Reference: Accessibility Hooks

For developers updating components:

```typescript
// Import hooks
import { useTheme, useTypography, useTouchTargetSize } from '../contexts/AccessibilityContext';

// In component
const colors = useTheme();  // Computed theme (respects high contrast)
const typography = useTypography();  // Scaled typography (respects font size + system scale)
const touchTargetSize = useTouchTargetSize();  // Current touch target size in pixels

// Apply to elements
<TouchableOpacity
  style={[styles.button, { minHeight: touchTargetSize }]}
  accessible={true}
  accessibilityLabel="Clear and descriptive label"
  accessibilityRole="button"
  accessibilityState={{ disabled: isDisabled }}
>
  <Text style={{ ...typography.body, color: colors.textPrimary }}>
    Button Text
  </Text>
</TouchableOpacity>
```

---

## Success Criteria

**Accessibility is successful when**:
- ✅ All WCAG 2.1 AAA standards are met
- ✅ Users can complete all tasks with VoiceOver/TalkBack
- ✅ App is usable at 200%+ system font scaling
- ✅ All touch targets meet 48pt minimum
- ✅ Users on worst ME/CFS days can save entries in <30 seconds
- ✅ Zero lost entries (auto-save + crash recovery)
- ✅ High contrast mode works in bright sunlight
- ✅ Reduced motion eliminates all dizziness triggers

**The app is ME/CFS-friendly when**:
- ✅ Brain fog? → Quick check-in (5-second symptom logging)
- ✅ Same symptoms? → Same as yesterday (1-tap entry)
- ✅ Crash risk? → Auto-save every 5 seconds
- ✅ Low dexterity? → 64pt touch targets
- ✅ Light sensitive? → High contrast mode
- ✅ Overwhelmed? → Bypass review screen (minimal decisions)

---

**Testing Date**: _________
**Tester**: _________
**App Version**: 1.0.0 (MVP)
**Platform**: iOS ☐  Android ☐
**Pass**: ☐  Fail: ☐  Notes: _______________
