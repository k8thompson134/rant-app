/**
 * Capsule/bar chart component for weekly symptom visualization
 * Shows intensity bars for each symptom across 7 days
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, AccessibilityInfo } from 'react-native';
import { WeeklyCapsuleData } from '../../types/insights';
import { useTheme } from '../../contexts/AccessibilityContext';
import { useTypography } from '../../contexts/AccessibilityContext';
import { getDayName } from '../../utils/dateUtils';

interface CapsuleChartProps {
  data: WeeklyCapsuleData[];
  weekStartDate: Date;
}

export default function CapsuleChart({ data, weekStartDate }: CapsuleChartProps) {
  const colors = useTheme();
  const typography = useTypography();

  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography]
  );

  // Get day labels (M, T, W, T, F, S, S)
  const dayLabels = useMemo(() => {
    const labels: string[] = [];
    const startDate = new Date(weekStartDate);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      labels.push(getDayName(date, true).charAt(0));
    }

    return labels;
  }, [weekStartDate]);

  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Not enough data for this week. Log a few entries to see symptom trends.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Day labels header */}
      <View style={styles.headerRow}>
        <View style={styles.labelColumn} />
        <View style={styles.capsuleContainer}>
          {dayLabels.map((label, index) => (
            <View key={index} style={styles.dayLabel}>
              <Text style={styles.dayLabelText}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Capsule rows */}
      {data.map((symptomData, index) => (
        <CapsuleRow
          key={symptomData.symptom}
          symptomData={symptomData}
          colors={colors}
          typography={typography}
          isLast={index === data.length - 1}
        />
      ))}
    </View>
  );
}

interface CapsuleRowProps {
  symptomData: WeeklyCapsuleData;
  colors: any;
  typography: any;
  isLast: boolean;
}

function CapsuleRow({ symptomData, colors, typography, isLast }: CapsuleRowProps) {
  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography]
  );

  // Generate accessibility label
  const accessibilityLabel = useMemo(() => {
    const intensities = symptomData.dailyIntensities.map((intensity, index) => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      if (intensity === -1) return `${days[index]}: no data`;
      if (intensity < 4) return `${days[index]}: mild`;
      if (intensity <= 7) return `${days[index]}: moderate`;
      return `${days[index]}: severe`;
    });

    return `${symptomData.symptom} this week: ${intensities.join(', ')}`;
  }, [symptomData]);

  return (
    <View
      style={[styles.row, isLast && styles.lastRow]}
      accessibilityLabel={accessibilityLabel}
      accessible={true}
    >
      {/* Symptom label */}
      <View style={styles.labelColumn}>
        <Text style={styles.symptomLabel} numberOfLines={1}>
          {symptomData.symptom}
        </Text>
      </View>

      {/* Capsules */}
      <View style={styles.capsuleContainer}>
        {symptomData.dailyIntensities.map((intensity, index) => (
          <Capsule
            key={index}
            intensity={intensity}
            color={symptomData.color}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );
}

interface CapsuleProps {
  intensity: number; // -1 for no data, 0-10 for severity
  color: string;
  colors: any;
}

function Capsule({ intensity, color, colors }: CapsuleProps) {
  const styles = useMemo(() => createStyles(colors, null), [colors]);

  // Calculate height (20px min, 100px max)
  const height = useMemo(() => {
    if (intensity === -1) return 20; // No data
    const minHeight = 20;
    const maxHeight = 100;
    const scaledHeight = minHeight + (intensity / 10) * (maxHeight - minHeight);
    return Math.round(scaledHeight);
  }, [intensity]);

  const backgroundColor = intensity === -1 ? colors.bgElevated : color;

  return (
    <View style={styles.capsuleWrapper}>
      <View
        style={[
          styles.capsule,
          {
            height,
            backgroundColor,
          },
        ]}
      />
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>) {
  return StyleSheet.create({
    container: {
      paddingVertical: 8,
    },
    emptyContainer: {
      padding: 24,
      backgroundColor: colors.bgSecondary,
      borderRadius: 16,
      alignItems: 'center',
    },
    emptyText: {
      ...typography?.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    headerRow: {
      flexDirection: 'row',
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    lastRow: {
      marginBottom: 0,
    },
    labelColumn: {
      width: 84,
      paddingRight: 8,
      justifyContent: 'flex-end',
      paddingBottom: 4,
    },
    symptomLabel: {
      fontSize: typography?.small?.fontSize || 12,
      color: colors.textSecondary,
      fontFamily: typography?.small?.fontFamily || 'DMSans',
    },
    capsuleContainer: {
      flex: 1,
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'space-between',
    },
    capsuleWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      minHeight: 100,
    },
    capsule: {
      width: '100%',
      maxWidth: 32,
      borderRadius: 16,
      minHeight: 20,
    },
    dayLabel: {
      flex: 1,
      alignItems: 'center',
      maxWidth: 32,
    },
    dayLabelText: {
      fontSize: typography?.caption?.fontSize || 11,
      color: colors.textMuted,
      fontFamily: typography?.caption?.fontFamily || 'DMSans',
      textAlign: 'center',
    },
  });
}
