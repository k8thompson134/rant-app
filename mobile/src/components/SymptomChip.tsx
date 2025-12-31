/**
 * SymptomChip Component
 * Displays a symptom with optional severity in chip format
 * Per RantTrack UI Design System
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EditableSymptom, SYMPTOM_DISPLAY_NAMES, getSymptomColor, getSymptomBackgroundColor } from '../types';
import { useTypography, useTouchTargetSize } from '../contexts/AccessibilityContext';
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
  const displayName = SYMPTOM_DISPLAY_NAMES[symptom.symptom] || symptom.symptom;
  const severityText = symptom.severity ? ` · ${symptom.severity}` : '';
  const painDetailsText = formatPainDetails(symptom.painDetails);

  const chipColor = getSymptomColor(symptom.symptom);
  const chipBackgroundColor = getSymptomBackgroundColor(symptom.symptom);

  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: chipBackgroundColor },
        compact && styles.chipCompact,
      ]}
    >
      <Text style={[styles.chipText, { color: chipColor }]}>
        {displayName}{severityText}{painDetailsText}
      </Text>

      {editable && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: chipColor + '33',
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
                  backgroundColor: chipColor + '33',
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
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  chipCompact: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  chipText: {
    ...baseTypography.small,
    fontFamily: 'DMSans_500Medium',
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
