/**
 * FunctionalCapacityDisplay Component
 * Shows physical and cognitive capacity tiers with optional sensory load flag
 * Per RantTrack UI Design System - dual-axis energy tracking
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FunctionalCapacity, withOpacity } from '../types';
import { useTypography, useTouchTargetSize, useTheme } from '../contexts/AccessibilityContext';
import {
  PHYSICAL_TIER_DESCRIPTIONS,
  COGNITIVE_TIER_DESCRIPTIONS,
  getPhysicalTierColor,
  getCognitiveTierColor,
  getPhysicalTierBackgroundColor,
  getCognitiveTierBackgroundColor,
  formatSensoryLoadFlags,
  getSensoryLoadIcon,
  isPhysicalTierSevere,
  isCognitiveTierSevere,
} from '../utils/capacityTierUtils';
import { typography as baseTypography } from '../theme/typography';
import type { ThemeColors } from '../theme/colors';

interface FunctionalCapacityDisplayProps {
  capacity: FunctionalCapacity;
  compact?: boolean;
  onEdit?: () => void;
  editable?: boolean;
}

/**
 * Render a single tier indicator (Physical or Cognitive)
 */
function TierIndicator({
  label,
  tier,
  description,
  color,
  backgroundColor,
  isSevere,
  theme,
  compact,
  onPress,
  editable,
}: {
  label: string;
  tier: string;
  description: string;
  color: string;
  backgroundColor: string;
  isSevere: boolean;
  theme: ThemeColors;
  compact: boolean;
  onPress?: () => void;
  editable: boolean;
}): React.ReactNode {
  const containerStyle = [
    styles.tierContainer,
    { backgroundColor },
    compact && styles.tierContainerCompact,
  ];

  const content = (
    <View style={containerStyle}>
      {/* Tier label and value */}
      <View style={styles.tierLabelRow}>
        <Text style={[styles.tierLabel, { color: theme.textMuted }]}>
          {label}
        </Text>
        <Text
          style={[
            compact ? styles.tierValueCompact : styles.tierValue,
            { color },
          ]}
        >
          {tier}
        </Text>
      </View>

      {/* Description */}
      {!compact && (
        <Text
          style={[
            styles.tierDescription,
            { color: theme.textSecondary },
          ]}
        >
          {description}
        </Text>
      )}

      {/* Edit indicator */}
      {editable && (
        <View style={styles.editIndicator}>
          <Ionicons name="pencil" size={12} color={color} />
        </View>
      )}
    </View>
  );

  if (onPress && editable) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.tierTouchable}
        accessible={true}
        accessibilityLabel={`Edit ${label}: ${tier}`}
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export function FunctionalCapacityDisplay({
  capacity,
  compact = false,
  onEdit,
  editable = false,
}: FunctionalCapacityDisplayProps) {
  const theme = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();

  const styles = useMemo(() => createStyles(theme, typography), [theme, typography]);

  const physicalColor = getPhysicalTierColor(capacity.physical, theme);
  const cognitiveColor = getCognitiveTierColor(capacity.cognitive, theme);

  const physicalBgColor = getPhysicalTierBackgroundColor(capacity.physical, theme);
  const cognitiveBgColor = getCognitiveTierBackgroundColor(capacity.cognitive, theme);

  const physicalDesc = PHYSICAL_TIER_DESCRIPTIONS[capacity.physical];
  const cognitiveDesc = COGNITIVE_TIER_DESCRIPTIONS[capacity.cognitive];

  const isPhysicalSevere = isPhysicalTierSevere(capacity.physical);
  const isCognitiveSevere = isCognitiveTierSevere(capacity.cognitive);

  const sensoryText = capacity.sensoryLoad ? formatSensoryLoadFlags(capacity.sensoryLoad) : '';
  const sensoryIcon = capacity.sensoryLoad ? getSensoryLoadIcon(capacity.sensoryLoad) : '';

  // Build accessibility label
  const a11yLabel = [
    `Physical capacity: ${capacity.physical}, ${physicalDesc}`,
    `Cognitive capacity: ${capacity.cognitive}, ${cognitiveDesc}`,
    sensoryText ? `Sensory load: ${sensoryText}` : '',
    capacity.outcome ? `Outcome: ${capacity.outcome}` : '',
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <View
      accessible={true}
      accessibilityLabel={a11yLabel}
      accessibilityRole="text"
    >
      {/* Physical and Cognitive tiers */}
      <View
        style={[
          styles.tiersContainer,
          compact && styles.tiersContainerCompact,
        ]}
      >
        {/* Physical Tier */}
        <View style={styles.tierWrapper}>
          <TierIndicator
            label="Physical"
            tier={capacity.physical}
            description={physicalDesc}
            color={physicalColor}
            backgroundColor={physicalBgColor}
            isSevere={isPhysicalSevere}
            theme={theme}
            compact={compact}
            onPress={onEdit}
            editable={editable}
          />
        </View>

        {/* Cognitive Tier */}
        <View style={styles.tierWrapper}>
          <TierIndicator
            label="Cognitive"
            tier={capacity.cognitive}
            description={cognitiveDesc}
            color={cognitiveColor}
            backgroundColor={cognitiveBgColor}
            isSevere={isCognitiveSevere}
            theme={theme}
            compact={compact}
            onPress={onEdit}
            editable={editable}
          />
        </View>
      </View>

      {/* Sensory Load Flag */}
      {capacity.sensoryLoad && capacity.sensoryLoad.active && (
        <View style={[styles.sensoryFlagContainer, { backgroundColor: withOpacity(theme.severityRough, 0.08) }]}>
          <Text style={styles.sensoryIcon}>{sensoryIcon}</Text>
          <Text
            style={[
              styles.sensoryText,
              { color: theme.severityRough },
            ]}
          >
            {sensoryText}
            {capacity.sensoryLoad.severity && ` (${capacity.sensoryLoad.severity})`}
          </Text>
        </View>
      )}

      {/* Activity and Outcome (if available) */}
      {!compact && (capacity.activity || capacity.outcome) && (
        <View style={styles.metadataContainer}>
          {capacity.activity && (
            <Text style={[styles.metadataText, { color: theme.textSecondary }]}>
              Activity: {capacity.activity}
            </Text>
          )}
          {capacity.outcome && (
            <Text style={[styles.metadataText, { color: theme.textSecondary }]}>
              Outcome: {capacity.outcome}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: ThemeColors, typography: any) =>
  StyleSheet.create({
    tiersContainer: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 8,
    },
    tiersContainerCompact: {
      gap: 8,
      marginBottom: 6,
    },
    tierWrapper: {
      flex: 1,
    },
    tierTouchable: {
      flex: 1,
    },
    tierContainer: {
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
      gap: 4,
    },
    tierContainerCompact: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      gap: 2,
    },
    tierLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    tierLabel: {
      ...baseTypography.small,
      fontFamily: 'DMSans_400Regular',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tierValue: {
      ...baseTypography.bodyLarge,
      fontFamily: 'DMSans_700Bold',
      letterSpacing: 0.5,
    },
    tierValueCompact: {
      ...baseTypography.bodyMedium,
      fontFamily: 'DMSans_700Bold',
      letterSpacing: 0.5,
    },
    tierDescription: {
      ...baseTypography.small,
      fontFamily: 'DMSans_400Regular',
    },
    editIndicator: {
      position: 'absolute',
      top: 8,
      right: 8,
      opacity: 0.6,
    },
    sensoryFlagContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      gap: 8,
      marginBottom: 8,
    },
    sensoryIcon: {
      fontSize: 18,
    },
    sensoryText: {
      ...baseTypography.small,
      fontFamily: 'DMSans_500Medium',
      flex: 1,
    },
    metadataContainer: {
      gap: 4,
      paddingVertical: 8,
    },
    metadataText: {
      ...baseTypography.small,
      fontFamily: 'DMSans_400Regular',
    },
  });
