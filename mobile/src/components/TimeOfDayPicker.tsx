/**
 * TimeOfDayPicker Component
 * Accessible modal for selecting when a symptom occurred
 * WCAG AAA compliant with large touch targets and clear labels
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimeOfDay } from '../types';
import { useTheme, useTypography, useTouchTargetSize, useAccessibilitySettings } from '../contexts/AccessibilityContext';
import { TOUCH_TARGET_SPACING } from '../constants/accessibility';
interface TimeOfDayPickerProps {
  visible: boolean;
  symptomName: string;
  currentTimeOfDay: TimeOfDay | null;
  onSelect: (timeOfDay: TimeOfDay | null) => void;
  onDismiss: () => void;
}

interface TimeOption {
  value: TimeOfDay;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const TIME_OPTIONS: TimeOption[] = [
  {
    value: 'morning',
    label: 'Morning',
    icon: 'sunny-outline',
    description: 'Waking up to noon',
  },
  {
    value: 'afternoon',
    label: 'Afternoon',
    icon: 'partly-sunny-outline',
    description: 'Noon to 5pm',
  },
  {
    value: 'evening',
    label: 'Evening',
    icon: 'cloudy-night-outline',
    description: '5pm to bedtime',
  },
  {
    value: 'night',
    label: 'Night',
    icon: 'moon-outline',
    description: 'During sleep hours',
  },
  {
    value: 'all_day',
    label: 'All Day',
    icon: 'time-outline',
    description: 'Throughout the entire day',
  },
];

export function TimeOfDayPicker({
  visible,
  symptomName,
  currentTimeOfDay,
  onSelect,
  onDismiss,
}: TimeOfDayPickerProps) {
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const handleSelect = (timeOfDay: TimeOfDay | null) => {
    onSelect(timeOfDay);
    onDismiss();
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
        accessibilityLabel="Close time picker"
        accessibilityHint="Tap outside to cancel"
      >
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
          accessible={true}
          accessibilityLabel={`Select time of day for ${symptomName}`}
        >
          <Text style={styles.title} accessibilityRole="header">
            When did this happen?
          </Text>
          <Text style={styles.subtitle}>{symptomName}</Text>

          <View style={styles.optionsContainer}>
            {TIME_OPTIONS.map((option) => {
              const isSelected = currentTimeOfDay === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    { minHeight: touchTargetSize },
                    isSelected && styles.optionButtonActive,
                  ]}
                  onPress={() => handleSelect(option.value)}
                  accessible={true}
                  accessibilityLabel={`${option.label}, ${option.description}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={styles.optionContent}>
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={isSelected ? colors.accentPrimary : colors.textSecondary}
                    />
                    <View style={styles.optionTextContainer}>
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text style={styles.optionDescription}>{option.description}</Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.accentPrimary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.clearButton, { minHeight: touchTargetSize }]}
            onPress={() => handleSelect(null)}
            accessible={true}
            accessibilityLabel="Clear time selection"
            accessibilityRole="button"
          >
            <Ionicons name="close-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.clearButtonText}>Clear Time</Text>
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
      marginBottom: 20,
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
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 14,
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
