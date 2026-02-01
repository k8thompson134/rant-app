/**
 * DurationPicker Component
 * Accessible modal for specifying how long a symptom lasted
 * WCAG AAA compliant with clear options for brain fog users
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SymptomDuration } from '../types';
import { useTheme, useTypography, useTouchTargetSize, useAccessibilitySettings } from '../contexts/AccessibilityContext';
import { TOUCH_TARGET_SPACING } from '../constants/accessibility';
interface DurationPickerProps {
  visible: boolean;
  symptomName: string;
  currentDuration: SymptomDuration | null;
  onSelect: (duration: SymptomDuration | null) => void;
  onDismiss: () => void;
}

type DurationMode = 'quick' | 'specific';

interface QuickOption {
  label: string;
  description: string;
  duration: SymptomDuration;
}

const QUICK_OPTIONS: QuickOption[] = [
  {
    label: 'Ongoing',
    description: "Still happening, won't go away",
    duration: { ongoing: true },
  },
  {
    label: 'All Day',
    description: 'Throughout the entire day',
    duration: { qualifier: 'all', unit: 'days' },
  },
  {
    label: 'Most of the Day',
    description: 'For the majority of the day',
    duration: { qualifier: 'most_of', unit: 'days' },
  },
  {
    label: 'A Few Hours',
    description: '2-3 hours',
    duration: { value: 3, unit: 'hours' },
  },
  {
    label: 'About an Hour',
    description: 'Around 1 hour',
    duration: { value: 1, unit: 'hours' },
  },
  {
    label: 'Brief',
    description: 'Less than 30 minutes',
    duration: { value: 30, unit: 'minutes' },
  },
];

const TIME_VALUES = [1, 2, 3, 4, 5, 6, 8, 12, 24];
const TIME_UNITS: Array<{ label: string; value: SymptomDuration['unit'] }> = [
  { label: 'Minutes', value: 'minutes' },
  { label: 'Hours', value: 'hours' },
  { label: 'Days', value: 'days' },
  { label: 'Weeks', value: 'weeks' },
];

export function DurationPicker({
  visible,
  symptomName,
  currentDuration,
  onSelect,
  onDismiss,
}: DurationPickerProps) {
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  // State for specific duration selection
  const [mode, setMode] = useState<DurationMode>('quick');
  const [selectedValue, setSelectedValue] = useState<number>(
    currentDuration?.value || 1
  );
  const [selectedUnit, setSelectedUnit] = useState<SymptomDuration['unit']>(
    currentDuration?.unit || 'hours'
  );

  const handleQuickSelect = (duration: SymptomDuration) => {
    onSelect(duration);
    onDismiss();
  };

  const handleSpecificSelect = () => {
    onSelect({ value: selectedValue, unit: selectedUnit });
    onDismiss();
  };

  const handleClear = () => {
    onSelect(null);
    onDismiss();
  };

  // Check if a quick option matches current duration
  const isQuickOptionSelected = (option: QuickOption): boolean => {
    if (!currentDuration) return false;
    const d = option.duration;
    if (d.ongoing && currentDuration.ongoing) return true;
    if (
      d.qualifier === currentDuration.qualifier &&
      d.unit === currentDuration.unit
    )
      return true;
    if (d.value === currentDuration.value && d.unit === currentDuration.unit)
      return true;
    return false;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? 'none' : 'fade'}
      onRequestClose={onDismiss}
      accessibilityViewIsModal={true}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onDismiss}
        accessible={true}
        accessibilityLabel="Close duration picker"
        accessibilityHint="Tap outside to cancel"
      >
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
          accessible={true}
          accessibilityLabel={`Select duration for ${symptomName}`}
        >
          <Text style={styles.title} accessibilityRole="header">
            How long did it last?
          </Text>
          <Text style={styles.subtitle}>{symptomName}</Text>

          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                { minHeight: Math.max(touchTargetSize - 8, 48) },
                mode === 'quick' && styles.modeButtonActive,
              ]}
              onPress={() => setMode('quick')}
              accessible={true}
              accessibilityLabel="Quick options"
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === 'quick' }}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'quick' && styles.modeButtonTextActive,
                ]}
              >
                Quick Pick
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                { minHeight: Math.max(touchTargetSize - 8, 48) },
                mode === 'specific' && styles.modeButtonActive,
              ]}
              onPress={() => setMode('specific')}
              accessible={true}
              accessibilityLabel="Specific duration"
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === 'specific' }}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'specific' && styles.modeButtonTextActive,
                ]}
              >
                Specific
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {mode === 'quick' ? (
              /* Quick Options */
              <View style={styles.optionsContainer}>
                {QUICK_OPTIONS.map((option, index) => {
                  const isSelected = isQuickOptionSelected(option);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        { minHeight: touchTargetSize },
                        isSelected && styles.optionButtonActive,
                      ]}
                      onPress={() => handleQuickSelect(option.duration)}
                      accessible={true}
                      accessibilityLabel={`${option.label}, ${option.description}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                    >
                      <View style={styles.optionTextContainer}>
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.optionLabelActive,
                          ]}
                        >
                          {option.label}
                        </Text>
                        <Text style={styles.optionDescription}>
                          {option.description}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={colors.accentPrimary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              /* Specific Duration Selector */
              <View style={styles.specificContainer}>
                {/* Value Selection */}
                <Text style={styles.sectionLabel}>How many?</Text>
                <View style={styles.valueGrid}>
                  {TIME_VALUES.map((value) => (
                    <TouchableOpacity
                      key={value}
                      style={[
                        styles.valueButton,
                        { minHeight: touchTargetSize },
                        selectedValue === value && styles.valueButtonActive,
                      ]}
                      onPress={() => setSelectedValue(value)}
                      accessible={true}
                      accessibilityLabel={`${value}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedValue === value }}
                    >
                      <Text
                        style={[
                          styles.valueText,
                          selectedValue === value && styles.valueTextActive,
                        ]}
                      >
                        {value}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Unit Selection */}
                <Text style={styles.sectionLabel}>Time unit</Text>
                <View style={styles.unitGrid}>
                  {TIME_UNITS.map((unit) => (
                    <TouchableOpacity
                      key={unit.value}
                      style={[
                        styles.unitButton,
                        { minHeight: touchTargetSize },
                        selectedUnit === unit.value && styles.unitButtonActive,
                      ]}
                      onPress={() => setSelectedUnit(unit.value)}
                      accessible={true}
                      accessibilityLabel={unit.label}
                      accessibilityRole="button"
                      accessibilityState={{ selected: selectedUnit === unit.value }}
                    >
                      <Text
                        style={[
                          styles.unitText,
                          selectedUnit === unit.value && styles.unitTextActive,
                        ]}
                      >
                        {unit.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Preview */}
                <View style={styles.preview}>
                  <Ionicons name="time-outline" size={20} color={colors.accentPrimary} />
                  <Text style={styles.previewText}>
                    For {selectedValue}{' '}
                    {selectedValue === 1
                      ? selectedUnit?.slice(0, -1)
                      : selectedUnit}
                  </Text>
                </View>

                {/* Apply Button */}
                <TouchableOpacity
                  style={[styles.applyButton, { minHeight: touchTargetSize }]}
                  onPress={handleSpecificSelect}
                  accessible={true}
                  accessibilityLabel={`Set duration to ${selectedValue} ${selectedUnit}`}
                  accessibilityRole="button"
                >
                  <Ionicons name="checkmark" size={20} color={colors.bgPrimary} />
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.clearButton, { minHeight: touchTargetSize }]}
            onPress={handleClear}
            accessible={true}
            accessibilityLabel="Clear duration"
            accessibilityRole="button"
          >
            <Ionicons name="close-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.clearButtonText}>Clear Duration</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { minHeight: touchTargetSize }]}
            onPress={onDismiss}
            accessible={true}
            accessibilityLabel="Cancel and close"
            accessibilityRole="button"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.bgSecondary,
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      maxHeight: '85%',
    },
    title: {
      ...typography.largeHeader,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 4,
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    modeToggle: {
      flexDirection: 'row',
      backgroundColor: colors.bgElevated,
      borderRadius: 12,
      padding: 4,
      marginBottom: 16,
    },
    modeButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: 'center',
    },
    modeButtonActive: {
      backgroundColor: colors.accentPrimary,
    },
    modeButtonText: {
      ...typography.small,
      color: colors.textSecondary,
    },
    modeButtonTextActive: {
      color: colors.bgPrimary,
      fontFamily: 'DMSans_500Medium',
    },
    scrollView: {
      maxHeight: 320,
    },
    optionsContainer: {
      gap: TOUCH_TARGET_SPACING,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgElevated,
      padding: 16,
      borderRadius: 12,
    },
    optionButtonActive: {
      backgroundColor: colors.accentLight,
      borderWidth: 2,
      borderColor: colors.accentPrimary,
    },
    optionTextContainer: {
      flex: 1,
    },
    optionLabel: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
    },
    optionLabelActive: {
      color: colors.accentPrimary,
    },
    optionDescription: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    specificContainer: {
      gap: 16,
    },
    sectionLabel: {
      ...typography.caption,
      fontFamily: 'DMSans_500Medium',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    valueGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    valueButton: {
      width: 56,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.bgElevated,
      borderRadius: 12,
    },
    valueButtonActive: {
      backgroundColor: colors.accentLight,
      borderWidth: 2,
      borderColor: colors.accentPrimary,
    },
    valueText: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
    },
    valueTextActive: {
      color: colors.accentPrimary,
      fontFamily: 'DMSans_700Bold',
    },
    unitGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    unitButton: {
      flex: 1,
      minWidth: 80,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.bgElevated,
      borderRadius: 12,
      paddingVertical: 12,
    },
    unitButtonActive: {
      backgroundColor: colors.accentLight,
      borderWidth: 2,
      borderColor: colors.accentPrimary,
    },
    unitText: {
      ...typography.small,
      color: colors.textPrimary,
    },
    unitTextActive: {
      color: colors.accentPrimary,
      fontFamily: 'DMSans_500Medium',
    },
    preview: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentLight,
      padding: 14,
      borderRadius: 12,
      gap: 8,
    },
    previewText: {
      ...typography.bodyMedium,
      color: colors.accentPrimary,
    },
    applyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentPrimary,
      padding: 14,
      borderRadius: 12,
      gap: 8,
    },
    applyButtonText: {
      ...typography.bodyMedium,
      color: colors.bgPrimary,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.bgElevated,
      marginTop: 16,
      gap: 8,
    },
    clearButtonText: {
      ...typography.small,
      color: colors.textSecondary,
    },
    cancelButton: {
      padding: 14,
      marginTop: 8,
      alignItems: 'center',
    },
    cancelButtonText: {
      ...typography.small,
      color: colors.textMuted,
    },
  });
