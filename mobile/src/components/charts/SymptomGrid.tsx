/**
 * Symptom grid component for displaying top symptoms
 * Shows symptoms in a 3-column grid with icons and frequency
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SymptomFrequency } from '../../types/insights';
import { useTheme } from '../../contexts/AccessibilityContext';
import { useTypography } from '../../contexts/AccessibilityContext';

interface SymptomGridProps {
  symptoms: SymptomFrequency[];
  maxItems?: number;
}

export default function SymptomGrid({ symptoms, maxItems = 6 }: SymptomGridProps) {
  const colors = useTheme();
  const typography = useTypography();

  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography]
  );

  const displaySymptoms = symptoms.slice(0, maxItems);

  if (displaySymptoms.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          No symptom data available yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {displaySymptoms.map((symptom) => (
        <SymptomCard key={symptom.symptom} symptom={symptom} />
      ))}
    </View>
  );
}

interface SymptomCardProps {
  symptom: SymptomFrequency;
}

function SymptomCard({ symptom }: SymptomCardProps) {
  const colors = useTheme();
  const typography = useTypography();

  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography]
  );

  // Calculate responsive icon size
  const baseUnit = typography?.body?.fontSize || 15;
  const iconSize = Math.round(baseUnit * 1.7); // ~26

  // Map symptoms to appropriate icons
  const iconName = getSymptomIcon(symptom.symptom);

  // Create semi-transparent background color
  const backgroundColor = `${symptom.color}26`; // Add 15% opacity (26 in hex)

  const accessibilityLabel = `${symptom.symptom}: ${symptom.count} ${
    symptom.count === 1 ? 'time' : 'times'
  }, ${Math.round(symptom.percentage)}% of entries`;

  return (
    <View
      style={styles.card}
      accessibilityLabel={accessibilityLabel}
      accessible={true}
    >
      <View style={[styles.iconWrap, { backgroundColor }]}>
        <Ionicons name={iconName} size={iconSize} color={symptom.color} />
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {symptom.symptom}
      </Text>
      <Text style={styles.count}>
        {symptom.count} {symptom.count === 1 ? 'time' : 'times'}
      </Text>
    </View>
  );
}

/**
 * Map symptom names to Ionicons
 */
function getSymptomIcon(symptom: string): keyof typeof Ionicons.glyphMap {
  const symptomLower = symptom.toLowerCase();

  // Fatigue-related
  if (symptomLower.includes('fatigue') || symptomLower.includes('tired')) {
    return 'battery-dead-outline';
  }

  // Brain fog / cognitive
  if (symptomLower.includes('brain fog') || symptomLower.includes('cognitive')) {
    return 'cloud-outline';
  }

  // PEM (Post-Exertional Malaise)
  if (symptomLower.includes('pem') || symptomLower.includes('crash')) {
    return 'flash-outline';
  }

  // Pain
  if (
    symptomLower.includes('pain') ||
    symptomLower.includes('ache') ||
    symptomLower.includes('headache')
  ) {
    return 'pulse-outline';
  }

  // Dizziness / vertigo
  if (symptomLower.includes('dizz') || symptomLower.includes('vertigo')) {
    return 'radio-outline';
  }

  // Nausea / digestive
  if (
    symptomLower.includes('nausea') ||
    symptomLower.includes('stomach') ||
    symptomLower.includes('digestive')
  ) {
    return 'nutrition-outline';
  }

  // Sleep issues
  if (symptomLower.includes('sleep') || symptomLower.includes('insomnia')) {
    return 'moon-outline';
  }

  // Anxiety / stress
  if (symptomLower.includes('anxiety') || symptomLower.includes('stress')) {
    return 'alert-circle-outline';
  }

  // Heart / cardiac
  if (
    symptomLower.includes('heart') ||
    symptomLower.includes('palpitation') ||
    symptomLower.includes('pots')
  ) {
    return 'heart-outline';
  }

  // Temperature / chills
  if (
    symptomLower.includes('fever') ||
    symptomLower.includes('chill') ||
    symptomLower.includes('temperature')
  ) {
    return 'thermometer-outline';
  }

  // Breathing / respiratory
  if (
    symptomLower.includes('breath') ||
    symptomLower.includes('respiratory') ||
    symptomLower.includes('shortness')
  ) {
    return 'fitness-outline';
  }

  // Muscle / joint
  if (symptomLower.includes('muscle') || symptomLower.includes('joint')) {
    return 'body-outline';
  }

  // Sensory
  if (
    symptomLower.includes('vision') ||
    symptomLower.includes('hearing') ||
    symptomLower.includes('sensory')
  ) {
    return 'eye-outline';
  }

  // Default
  return 'ellipse-outline';
}

function createStyles(colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>) {
  // Calculate responsive sizing based on font scale
  const baseUnit = typography?.body?.fontSize || 15;
  const iconSize = Math.round(baseUnit * 3.2);  // ~48
  const cardPadding = Math.round(baseUnit * 1.1); // ~16
  const gap = Math.round(baseUnit * 0.7);  // ~10

  return StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: gap,
    },
    card: {
      backgroundColor: colors.bgSecondary,
      borderRadius: 14,
      padding: cardPadding,
      alignItems: 'center',
      width: '31%', // 3 columns with gap
      minWidth: 95,
      minHeight: iconSize * 2.4,
    },
    iconWrap: {
      width: iconSize,
      height: iconSize,
      borderRadius: iconSize * 0.25,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Math.round(baseUnit * 0.5),
    },
    name: {
      fontSize: (typography?.small?.fontSize || 13),
      fontWeight: '500',
      color: colors.textPrimary,
      fontFamily: 'DMSans_500Medium',
      marginBottom: 3,
      textAlign: 'center',
      lineHeight: (typography?.small?.fontSize || 13) * 1.3,
    },
    count: {
      fontSize: (typography?.caption?.fontSize || 12) - 1,
      color: colors.textMuted,
      fontFamily: 'DMSans_400Regular',
      textAlign: 'center',
    },
    emptyContainer: {
      padding: Math.round(baseUnit * 1.6),
      backgroundColor: colors.bgSecondary,
      borderRadius: 14,
      alignItems: 'center',
    },
    emptyText: {
      ...typography?.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
