/**
 * SymptomDisplay Component
 * Shows extracted symptoms in a user-friendly format
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ExtractedSymptom, SYMPTOM_DISPLAY_NAMES, SEVERITY_COLORS } from '../types';
import { useTheme, useTypography } from '../contexts/AccessibilityContext';

interface SymptomDisplayProps {
  symptoms: ExtractedSymptom[];
  rantText?: string;
}

export function SymptomDisplay({ symptoms, rantText }: SymptomDisplayProps) {
  const colors = useTheme();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  if (symptoms.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No symptoms detected</Text>
          <Text style={styles.emptySubtitle}>
            This might be a good day, or the symptoms aren't in our vocabulary yet.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Detected Symptoms</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{symptoms.length}</Text>
        </View>
      </View>

      {rantText && (
        <View style={styles.rantTextContainer}>
          <Text style={styles.rantTextLabel}>Your rant:</Text>
          <Text style={styles.rantText}>{rantText}</Text>
        </View>
      )}

      <View style={styles.symptomsList}>
        {symptoms.map((symptom, index) => {
          const displayName =
            SYMPTOM_DISPLAY_NAMES[symptom.symptom] ||
            symptom.symptom.replace(/_/g, ' ');

          const methodColor =
            symptom.method === 'phrase' ? '#4CAF50' : '#2196F3';

          return (
            <View key={`${symptom.symptom}-${index}`} style={styles.symptomCard}>
              <View style={styles.symptomHeader}>
                <Text style={styles.symptomName}>{displayName}</Text>
                <View style={styles.badgeRow}>
                  {symptom.severity && (
                    <View
                      style={[
                        styles.severityBadge,
                        { backgroundColor: SEVERITY_COLORS[symptom.severity] },
                      ]}
                    >
                      <Text style={styles.severityBadgeText}>{symptom.severity}</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.methodBadge,
                      { backgroundColor: methodColor },
                    ]}
                  >
                    <Text style={styles.methodText}>{symptom.method}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.matchedText}>
                matched: "{symptom.matched}"
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>) => StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  title: {
    ...typography.pageTitle,
    color: colors.textPrimary,
  },
  badge: {
    backgroundColor: colors.accentPrimary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    ...typography.sectionHeader,
    color: colors.bgPrimary,
  },
  rantTextContainer: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  rantTextLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
    fontFamily: 'DMSans_500Medium',
  },
  rantText: {
    ...typography.small,
    color: colors.textPrimary,
  },
  symptomsList: {
    gap: 12,
  },
  symptomCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.bgElevated,
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  symptomName: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  severityBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  severityBadgeText: {
    ...typography.caption,
    color: colors.bgPrimary,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'capitalize',
  },
  methodBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  methodText: {
    ...typography.caption,
    color: colors.bgPrimary,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'uppercase',
  },
  matchedText: {
    ...typography.small,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    ...typography.bodyMedium,
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
