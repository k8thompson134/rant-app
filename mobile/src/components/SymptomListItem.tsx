/**
 * SymptomListItem Component
 * Full-width symptom row used in entry cards across HistoryScreen,
 * MonthScreen, and CatchUpReviewScreen.
 *
 * Supports:
 * - Read-only display (no onPress)
 * - Interactive/editable (onPress to edit)
 * - Removable (onRemove shows close button)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ExtractedSymptom,
  SYMPTOM_DISPLAY_NAMES,
  getSeverityColor,
  getSeverityBackgroundColor,
  formatActivityTrigger,
  formatSymptomDuration,
  formatTimeOfDay,
} from '../types';
import { useTheme, useTypography, useTouchTargetSize } from '../contexts/AccessibilityContext';

interface SymptomListItemProps {
  symptom: ExtractedSymptom;
  onPress?: () => void;
  onRemove?: () => void;
}

export function SymptomListItem({ symptom, onPress, onRemove }: SymptomListItemProps) {
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();

  const severityColor = getSeverityColor(symptom.severity, colors);
  const bgColor = getSeverityBackgroundColor(symptom.severity, colors);
  const displayName = SYMPTOM_DISPLAY_NAMES[symptom.symptom] || symptom.symptom;
  const painLocation = symptom.painDetails?.location;

  const contextParts: string[] = [];
  if (symptom.trigger) contextParts.push(formatActivityTrigger(symptom.trigger));
  if (symptom.duration) contextParts.push(formatSymptomDuration(symptom.duration));
  if (symptom.timeOfDay) contextParts.push(formatTimeOfDay(symptom.timeOfDay));
  const contextText = contextParts.join(' \u00b7 ');

  const accessibilityLabel = onPress
    ? `Edit ${displayName}${painLocation ? ` in ${painLocation}` : ''}`
    : `${displayName}${painLocation ? ` in ${painLocation}` : ''}${symptom.severity ? `, ${symptom.severity}` : ''}`;

  const content = (
    <>
      <View style={onRemove ? styles.contentFlex : undefined}>
        <View style={styles.mainRow}>
          <Text style={[styles.name, typography.small, { color: severityColor }]}>
            {displayName}
            {painLocation && (
              <Text style={[typography.small, styles.location]}> ({painLocation})</Text>
            )}
          </Text>
          {symptom.severity && (
            <Text style={[styles.severityBadge, typography.caption, { color: severityColor }]}>
              {symptom.severity}
            </Text>
          )}
        </View>
        {contextText.length > 0 && (
          <Text style={[styles.context, typography.caption, { color: colors.textMuted }]}>
            {contextText}
          </Text>
        )}
      </View>
      {onRemove && (
        <TouchableOpacity
          style={[styles.removeBtn, { minWidth: touchTargetSize, minHeight: touchTargetSize }]}
          onPress={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${displayName}`}
        >
          <Ionicons name="close" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: bgColor },
          onRemove && styles.containerWithRemove,
          onRemove && { minHeight: touchTargetSize },
        ]}
        onPress={onPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Tap to edit symptom details"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: bgColor }]}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
    >
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    padding: 10,
  },
  containerWithRemove: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  contentFlex: {
    flex: 1,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    fontFamily: 'DMSans_500Medium',
  },
  location: {
    fontStyle: 'italic',
  },
  severityBadge: {
    fontFamily: 'DMSans_500Medium',
    textTransform: 'capitalize',
    marginLeft: 8,
  },
  context: {
    marginTop: 4,
  },
  removeBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
