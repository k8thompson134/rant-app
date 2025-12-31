/**
 * QuickActionChips Component
 * Quick action buttons for common patterns
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useTypography, useTouchTargetSize } from '../contexts/AccessibilityContext';
import { TOUCH_TARGET_SPACING } from '../constants/accessibility';
import { darkTheme } from '../theme/colors';
import { typography as baseTypography } from '../theme/typography';

interface QuickActionChipsProps {
  onSameAsYesterday: () => void;
  onQuickCheckIn: () => void;
  hasYesterdayEntry: boolean;
}

export function QuickActionChips({
  onSameAsYesterday,
  onQuickCheckIn,
  hasYesterdayEntry,
}: QuickActionChipsProps) {
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <TouchableOpacity
        style={[
          styles.chip,
          { minHeight: touchTargetSize },
          !hasYesterdayEntry && styles.chipDisabled
        ]}
        onPress={onSameAsYesterday}
        disabled={!hasYesterdayEntry}
        accessible={true}
        accessibilityLabel="Same as yesterday"
        accessibilityRole="button"
      >
        <Ionicons
          name="calendar-outline"
          size={14}
          color={hasYesterdayEntry ? colors.textPrimary : colors.textSecondary}
        />
        <Text style={[styles.chipText, !hasYesterdayEntry && styles.chipTextDisabled]}>
          Same as yesterday
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.chip,
          { minHeight: touchTargetSize }
        ]}
        onPress={onQuickCheckIn}
        accessible={true}
        accessibilityLabel="Quick check-in"
        accessibilityRole="button"
      >
        <Ionicons
          name="flash-outline"
          size={14}
          color={colors.textPrimary}
        />
        <Text style={styles.chipText}>
          Quick check-in
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingHorizontal: 4,
    gap: TOUCH_TARGET_SPACING / 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: darkTheme.bgElevated,
    borderWidth: 1,
    borderColor: darkTheme.textMuted,
    gap: 6,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    ...baseTypography.caption,
    color: darkTheme.textPrimary,
  },
  chipTextDisabled: {
    color: darkTheme.textSecondary,
  },
  badge: {
    backgroundColor: darkTheme.accentPrimary,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 4,
  },
  badgeText: {
    ...baseTypography.caption,
    fontSize: 9,
    color: darkTheme.bgPrimary,
    fontFamily: 'DMSans_500Medium',
  },
});
