/**
 * SymptomChip Component
 * Displays a symptom with optional severity in chip format
 * Per RantTrack UI Design System
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  EditableSymptom,
  SYMPTOM_DISPLAY_NAMES,
  getSymptomColor,
  getSymptomBackgroundColor,
  getSeverityColor,
  getSeverityBackgroundColor,
  formatActivityTrigger,
  formatSymptomDuration,
  formatTimeOfDay,
  formatProgression,
  withOpacity,
} from '../types';
import { useTypography, useTouchTargetSize, useTheme } from '../contexts/AccessibilityContext';
import { TOUCH_TARGET_SPACING } from '../constants/accessibility';
import { typography as baseTypography } from '../theme/typography';

interface SymptomChipProps {
  symptom: EditableSymptom;
  onEdit?: () => void;
  onDelete?: () => void;
  editable?: boolean;
  compact?: boolean;
}

/**
 * Format pain details for display
 */
function formatPainDetails(painDetails?: { qualifiers: string[]; location: string | null }): string {
  if (!painDetails) return '';

  const parts: string[] = [];

  // Add qualifiers (e.g., "burning, sharp")
  if (painDetails.qualifiers && painDetails.qualifiers.length > 0) {
    parts.push(painDetails.qualifiers.join(', '));
  }

  // Add location (e.g., "shoulder")
  if (painDetails.location) {
    parts.push(painDetails.location.replace('_', ' '));
  }

  return parts.length > 0 ? ` (${parts.join(' in ')})` : '';
}

export function SymptomChip({
  symptom,
  onEdit,
  onDelete,
  editable = false,
  compact = false,
}: SymptomChipProps) {
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();
  const colors = useTheme();
  const displayName = SYMPTOM_DISPLAY_NAMES[symptom.symptom] || symptom.symptom;
  const severityText = symptom.severity ? ` · ${symptom.severity}` : '';
  const painDetailsText = formatPainDetails(symptom.painDetails);

  // Build secondary info parts (trigger, progression, duration, recovery, timeOfDay)
  const secondaryParts: string[] = [];
  if (symptom.trigger) {
    secondaryParts.push(formatActivityTrigger(symptom.trigger));
  }
  // Add progression indicator (visual indicator of how symptom is evolving)
  if (symptom.duration?.progression) {
    secondaryParts.push(formatProgression(symptom.duration.progression));
  }
  if (symptom.duration) {
    secondaryParts.push(formatSymptomDuration(symptom.duration));
  }
  // Add recovery time if available
  if (symptom.duration?.recoveryTime) {
    const recoveryText = formatSymptomDuration(symptom.duration.recoveryTime);
    if (recoveryText) {
      secondaryParts.push(`recovers ${recoveryText}`);
    }
  }
  if (symptom.timeOfDay) {
    secondaryParts.push(formatTimeOfDay(symptom.timeOfDay));
  }

  const secondaryText = secondaryParts.join(' · ');
  const hasSecondaryInfo = !compact && secondaryText.length > 0;

  // Build accessibility label with all info
  const accessibilityParts = [displayName];
  if (symptom.severity) accessibilityParts.push(symptom.severity);
  if (symptom.painDetails) {
    if (symptom.painDetails.qualifiers.length > 0) {
      accessibilityParts.push(symptom.painDetails.qualifiers.join(', '));
    }
    if (symptom.painDetails.location) {
      accessibilityParts.push(`in ${symptom.painDetails.location.replace('_', ' ')}`);
    }
  }
  if (symptom.trigger) {
    accessibilityParts.push(formatActivityTrigger(symptom.trigger));
  }
  // Add progression to accessibility label (without icons)
  if (symptom.duration?.progression) {
    const progressionText = formatProgression(symptom.duration.progression);
    const progressionLabel = progressionText.split(' ').slice(1).join(' ') || progressionText;
    accessibilityParts.push(progressionLabel);
  }
  if (symptom.duration) {
    accessibilityParts.push(formatSymptomDuration(symptom.duration));
  }
  // Add recovery time to accessibility label
  if (symptom.duration?.recoveryTime) {
    const recoveryText = formatSymptomDuration(symptom.duration.recoveryTime);
    if (recoveryText) {
      accessibilityParts.push(`recovers ${recoveryText}`);
    }
  }
  if (symptom.timeOfDay) {
    accessibilityParts.push(formatTimeOfDay(symptom.timeOfDay));
  }
  const accessibilityLabel = accessibilityParts.join(', ');

  // Use severity-based colors when severity is present, otherwise fall back to symptom category colors
  const hasSeverity = !!symptom.severity;
  const chipColor = hasSeverity
    ? getSeverityColor(symptom.severity, colors)
    : getSymptomColor(symptom.symptom, colors);
  const chipBackgroundColor = hasSeverity
    ? getSeverityBackgroundColor(symptom.severity, colors)
    : getSymptomBackgroundColor(symptom.symptom, colors);

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: chipBackgroundColor },
        compact && styles.chipCompact,
      ]}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      <View style={styles.textContainer}>
        <Text style={[styles.chipText, { color: chipColor }]}>
          {displayName}{severityText}{painDetailsText}
        </Text>

        {hasSecondaryInfo && (
          <Text style={[styles.secondaryText, { color: colors.textMuted }]}>
            {secondaryText}
          </Text>
        )}
      </View>

      {editable && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: withOpacity(chipColor, 0.2),
                  minWidth: touchTargetSize,
                  minHeight: touchTargetSize,
                }
              ]}
              onPress={onEdit}
              accessible={true}
              accessibilityLabel="Edit symptom"
              accessibilityRole="button"
            >
              <Text style={[styles.actionIcon, { color: chipColor }]}>✎</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: withOpacity(chipColor, 0.2),
                  minWidth: touchTargetSize,
                  minHeight: touchTargetSize,
                }
              ]}
              onPress={onDelete}
              accessible={true}
              accessibilityLabel="Delete symptom"
              accessibilityRole="button"
            >
              <Text style={[styles.actionIcon, { color: chipColor }]}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  chipCompact: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  textContainer: {
    flexShrink: 1,
  },
  chipText: {
    ...baseTypography.small,
    fontFamily: 'DMSans_500Medium',
  },
  secondaryText: {
    ...baseTypography.caption,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: TOUCH_TARGET_SPACING / 2,
    marginLeft: TOUCH_TARGET_SPACING / 2,
  },
  actionButton: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
