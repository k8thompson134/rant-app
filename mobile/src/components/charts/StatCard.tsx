/**
 * Stat card component for displaying metrics
 * Used in summary cards and stats rows
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/AccessibilityContext';
import { useTypography } from '../../contexts/AccessibilityContext';

interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  accessibilityLabel?: string;
}

export default function StatCard({
  label,
  value,
  color,
  size = 'medium',
  accessibilityLabel,
}: StatCardProps) {
  const colors = useTheme();
  const typography = useTypography();

  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography]
  );

  const valueColor = color || colors.textPrimary;

  const valueFontSize = useMemo(() => {
    const baseFontSize = typography?.largeHeader?.fontSize || 22;
    switch (size) {
      case 'small':
        return baseFontSize - 2;
      case 'medium':
        return baseFontSize + 2;
      case 'large':
        return baseFontSize + 6;
      default:
        return baseFontSize + 2;
    }
  }, [size, typography]);

  const defaultAccessibilityLabel = `${label}: ${value}`;

  return (
    <View
      style={styles.container}
      accessibilityLabel={accessibilityLabel || defaultAccessibilityLabel}
      accessible={true}
    >
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor, fontSize: valueFontSize }]}>
        {value}
      </Text>
    </View>
  );
}

interface StatsRowProps {
  stats: Array<{
    label: string;
    value: string | number;
    color?: string;
  }>;
}

/**
 * Stats row component - horizontal row of stat cards
 */
export function StatsRow({ stats }: StatsRowProps) {
  const colors = useTheme();
  const typography = useTypography();

  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography]
  );

  return (
    <View style={styles.statsRow}>
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          label={stat.label}
          value={stat.value}
          color={stat.color}
          size="medium"
        />
      ))}
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>) {
  // Calculate responsive sizing based on font scale
  const baseUnit = typography?.body?.fontSize || 15;
  const spacing = {
    sm: Math.round(baseUnit * 0.5),
    md: Math.round(baseUnit * 1),
    lg: Math.round(baseUnit * 1.2),
  };

  return StyleSheet.create({
    container: {
      alignItems: 'center',
      flex: 1,
      paddingVertical: spacing.sm,
    },
    label: {
      fontSize: (typography?.caption?.fontSize || 12) - 1,
      color: colors.textMuted,
      fontFamily: 'DMSans_500Medium',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    value: {
      fontFamily: 'DMSerifDisplay_400Regular',
      fontWeight: '400',
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: colors.bgSecondary,
      borderRadius: 14,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
    },
  });
}
