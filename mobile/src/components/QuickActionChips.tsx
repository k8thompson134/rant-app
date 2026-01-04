/**
 * QuickActionChips Component
 * Quick action buttons for common patterns
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useTypography, useTouchTargetSize } from '../contexts/AccessibilityContext';
import { TOUCH_TARGET_SPACING } from '../constants/accessibility';
import { typography as baseTypography } from '../theme/typography';

interface QuickActionChipsProps {
  onSameAsYesterday: () => void;
  onQuickCheckIn: () => void;
  onCatchUp: () => void;
  hasYesterdayEntry: boolean;
}

export function QuickActionChips({
  onSameAsYesterday,
  onQuickCheckIn,
  onCatchUp,
  hasYesterdayEntry,
}: QuickActionChipsProps) {
  const colors = useTheme();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const touchTargetSize = useTouchTargetSize();

  // ACCESSIBILITY: Scale icon size with font size for consistency
  const iconSize = Math.max(14, typography.caption.fontSize * 1.2);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.chip,
          {
            minHeight: touchTargetSize,
            minWidth: touchTargetSize  // ACCESSIBILITY: Ensure width meets WCAG AAA (48-64pt minimum)
          },
          !hasYesterdayEntry && styles.chipDisabled
        ]}
        onPress={onSameAsYesterday}
        disabled={!hasYesterdayEntry}
        accessible={true}
        accessibilityLabel="Same as yesterday"
        accessibilityHint={
          hasYesterdayEntry
            ? "Copies your most recent entry for editing"
            : "No previous entry available to copy"
        }
        accessibilityRole="button"
        accessibilityState={{ disabled: !hasYesterdayEntry }}  // ACCESSIBILITY: Announce disabled state to screen readers
      >
        <Ionicons
          name="copy-outline"
          size={iconSize}
          color={hasYesterdayEntry ? colors.textPrimary : colors.textSecondary}
        />
        <Text style={[styles.chipText, !hasYesterdayEntry && styles.chipTextDisabled]}>
          Yesterday
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.chip,
          {
            minHeight: touchTargetSize,
            minWidth: touchTargetSize  // ACCESSIBILITY: Ensure width meets WCAG AAA (48-64pt minimum)
          }
        ]}
        onPress={onQuickCheckIn}
        accessible={true}
        accessibilityLabel="Quick check-in"
        accessibilityHint="Opens a simplified symptom entry form"  // ACCESSIBILITY: Explain action to screen reader users
        accessibilityRole="button"
      >
        <Ionicons
          name="flash-outline"
          size={iconSize}
          color={colors.textPrimary}
        />
        <Text style={styles.chipText}>
          Quick
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.chip,
          {
            minHeight: touchTargetSize,
            minWidth: touchTargetSize  // ACCESSIBILITY: Ensure width meets WCAG AAA (48-64pt minimum)
          }
        ]}
        onPress={onCatchUp}
        accessible={true}
        accessibilityLabel="Catch up on missed days"
        accessibilityHint="Log symptoms for multiple past days at once"  // ACCESSIBILITY: Explain action to screen reader users
        accessibilityRole="button"
      >
        <Ionicons
          name="calendar-number-outline"
          size={iconSize}
          color={colors.textPrimary}
        />
        <Text style={styles.chipText}>
          Catch Up
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 0,
  },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.textMuted,
    gap: 6,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    ...baseTypography.caption,
    color: colors.textPrimary,
    fontSize: 13,
  },
  chipTextDisabled: {
    color: colors.textSecondary,
  },
});
