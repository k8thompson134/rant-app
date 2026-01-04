/**
 * SpoonCountDisplay Component
 * Displays energy level using spoon theory - a chronic illness community concept
 * where "spoons" represent limited energy units
 * 
 * Per RantTrack UI Design System with compassionate, accessible design
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SpoonCount } from '../types';
import { useTypography, useTouchTargetSize, useTheme } from '../contexts/AccessibilityContext';
import { typography as baseTypography } from '../theme/typography';

interface SpoonCountDisplayProps {
  spoonCount: SpoonCount;
  compact?: boolean;
}

/**
 * Get severity color based on energy level (0-10 scale)
 * - 0-2: Red (severityRough) - critically low energy
 * - 3-5: Amber (severityModerate) - moderate energy
 * - 6-10: Green (severityGood) - good energy
 */
function getEnergyColor(energyLevel: number, theme: any): string {
  if (energyLevel <= 2) {
    return theme.severityRough;
  } else if (energyLevel <= 5) {
    return theme.severityModerate;
  } else {
    return theme.severityGood;
  }
}

/**
 * Get background color with subtle tint based on energy level
 */
function getEnergyBackgroundColor(energyLevel: number, theme: any): string {
  if (energyLevel <= 2) {
    // Rough: subtle red tint
    return theme.severityRough + '1A'; // 10% opacity
  } else if (energyLevel <= 5) {
    // Moderate: subtle amber tint
    return theme.severityModerate + '1A'; // 10% opacity
  } else {
    // Good: subtle green tint
    return theme.severityGood + '1A'; // 10% opacity
  }
}

/**
 * Render spoon icons (filled vs empty based on energy)
 * Shows up to 10 spoons with visual representation of energy level
 */
function renderSpoons(energyLevel: number, compact: boolean, color: string, theme: any): React.ReactNode {
  const maxSpoons = 10;
  const spoons = [];
  const iconSize = compact ? 12 : 16;
  
  for (let i = 0; i < maxSpoons; i++) {
    const isFilled = i < energyLevel;
    spoons.push(
      <Text
        key={i}
        style={{
          fontSize: iconSize,
          color: isFilled ? color : theme.textMuted,
          opacity: isFilled ? 1.0 : 0.3,
        }}
      >
        {isFilled ? '●' : '○'}
      </Text>
    );
  }
  
  return (
    <View style={styles.spoonsRow}>
      {spoons}
    </View>
  );
}

/**
 * Format energy text with compassionate language
 */
function getEnergyText(spoonCount: SpoonCount): string {
  const { current, energyLevel, started, used } = spoonCount;
  
  // Handle "out of spoons" case (critically low)
  if (current === 0 || energyLevel === 0) {
    return 'out of spoons';
  }
  
  // Handle single spoon vs multiple
  const spoonLabel = current === 1 ? 'spoon' : 'spoons';
  
  // Primary text: "2 spoons" or "2/10 energy"
  return `${current} ${spoonLabel}`;
}

/**
 * Format secondary details (started with X, used Y)
 */
function getSecondaryText(spoonCount: SpoonCount): string | null {
  const { started, used, energyLevel } = spoonCount;
  
  const parts: string[] = [];
  
  if (started !== undefined && used !== undefined) {
    parts.push(`started with ${started}, used ${used}`);
  } else if (started !== undefined) {
    parts.push(`started with ${started}`);
  } else if (used !== undefined) {
    parts.push(`used ${used}`);
  }
  
  // Always show energy level context
  parts.push(`${energyLevel}/10 energy`);
  
  return parts.join(' · ');
}

export function SpoonCountDisplay({ spoonCount, compact = false }: SpoonCountDisplayProps) {
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();
  const theme = useTheme();
  
  const energyColor = getEnergyColor(spoonCount.energyLevel, theme);
  const backgroundColor = getEnergyBackgroundColor(spoonCount.energyLevel, theme);
  const energyText = getEnergyText(spoonCount);
  const secondaryText = getSecondaryText(spoonCount);
  
  // Build full accessibility label
  const accessibilityParts = [
    `Energy level: ${spoonCount.energyLevel} out of 10 spoons`,
  ];
  if (spoonCount.started !== undefined) {
    accessibilityParts.push(`started with ${spoonCount.started}`);
  }
  if (spoonCount.used !== undefined) {
    accessibilityParts.push(`used ${spoonCount.used}`);
  }
  if (spoonCount.current === 0) {
    accessibilityParts.push('out of spoons');
  }
  const accessibilityLabel = accessibilityParts.join(', ');
  
  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        compact && styles.containerCompact,
      ]}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      {/* Spoon visual indicator */}
      {renderSpoons(spoonCount.energyLevel, compact, energyColor, theme)}
      
      {/* Text content */}
      <View style={styles.textContainer}>
        <Text
          style={[
            compact ? styles.primaryTextCompact : styles.primaryText,
            { color: energyColor },
          ]}
        >
          {energyText}
        </Text>
        
        {!compact && secondaryText && (
          <Text style={[styles.secondaryText, { color: theme.textSecondary }]}>
            {secondaryText}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
  },
  containerCompact: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    gap: 4,
  },
  spoonsRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  textContainer: {
    gap: 4,
  },
  primaryText: {
    ...baseTypography.bodyMedium,
    fontFamily: 'DMSans_500Medium',
  },
  primaryTextCompact: {
    ...baseTypography.small,
    fontFamily: 'DMSans_500Medium',
  },
  secondaryText: {
    ...baseTypography.small,
    fontFamily: 'DMSans_400Regular',
  },
});
