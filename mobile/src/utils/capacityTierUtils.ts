/**
 * Functional Capacity Tier Utilities
 * Descriptions, colors, and formatting for P and C tiers
 */

import { PhysicalCapacityTier, CognitiveCapacityTier, SensoryLoadFlag } from '../types';
import type { ThemeColors } from '../theme/colors';

/**
 * Physical tier descriptions for UI display
 */
export const PHYSICAL_TIER_DESCRIPTIONS: Record<PhysicalCapacityTier, string> = {
  'P-2': 'Bedbound 24/7',
  'P-1': 'Bedbound most of day',
  'P0': 'Mostly bedbound',
  'P1': 'Couch-bound',
  'P2': 'Moving around home',
  'P3': 'Light tasks',
  'P4': 'Short errand',
  'P5': 'Activity',
  'P+': 'Pacing (manageable)',
};

/**
 * Cognitive tier descriptions for UI display
 */
export const COGNITIVE_TIER_DESCRIPTIONS: Record<CognitiveCapacityTier, string> = {
  'C-1': 'Non-verbal',
  'C0': 'Minimal processing',
  'C1': 'Passive low-demand',
  'C2': 'Active low-demand',
  'C3': 'Engaged consumption',
  'C4': 'Productive',
  'C+': 'Social/communicative',
};

/**
 * Physical tier sort order (worst to best for color gradients)
 */
const PHYSICAL_TIER_ORDER: PhysicalCapacityTier[] = [
  'P-2', 'P-1', 'P0', 'P1', 'P2', 'P3', 'P4', 'P5', 'P+',
];

/**
 * Cognitive tier sort order (worst to best for color gradients)
 */
const COGNITIVE_TIER_ORDER: CognitiveCapacityTier[] = [
  'C-1', 'C0', 'C1', 'C2', 'C3', 'C4', 'C+',
];

/**
 * Get color for physical tier (green for good, red for severe)
 */
export function getPhysicalTierColor(tier: PhysicalCapacityTier, theme: ThemeColors): string {
  const index = PHYSICAL_TIER_ORDER.indexOf(tier);
  const ratio = index / (PHYSICAL_TIER_ORDER.length - 1); // 0 (P-2) to 1 (P+)

  // Gradient from red (#FF6B6B) → yellow (#FFD700) → green (#4CAF50)
  if (ratio < 0.33) {
    // Red to orange: P-2 to P1
    return theme.severityRough;
  } else if (ratio < 0.67) {
    // Orange to yellow: P2 to P4
    return theme.severityModerate;
  } else {
    // Yellow to green: P5 to P+
    return theme.severityGood;
  }
}

/**
 * Get color for cognitive tier (green for good, red for severe)
 */
export function getCognitiveTierColor(tier: CognitiveCapacityTier, theme: ThemeColors): string {
  const index = COGNITIVE_TIER_ORDER.indexOf(tier);
  const ratio = index / (COGNITIVE_TIER_ORDER.length - 1); // 0 (C-1) to 1 (C+)

  if (ratio < 0.33) {
    // Red: C-1, C0, C1
    return theme.severityRough;
  } else if (ratio < 0.67) {
    // Yellow: C2, C3
    return theme.severityModerate;
  } else {
    // Green: C4, C+
    return theme.severityGood;
  }
}

/**
 * Get background color (tinted) for tier
 */
export function getPhysicalTierBackgroundColor(tier: PhysicalCapacityTier, theme: ThemeColors): string {
  const color = getPhysicalTierColor(tier, theme);
  // Return with 10% opacity for subtle background
  return color + '19'; // 19 hex = ~10% opacity
}

/**
 * Get background color (tinted) for cognitive tier
 */
export function getCognitiveTierBackgroundColor(tier: CognitiveCapacityTier, theme: ThemeColors): string {
  const color = getCognitiveTierColor(tier, theme);
  return color + '19';
}

/**
 * Format sensory load flags as readable text
 */
export function formatSensoryLoadFlags(flags: SensoryLoadFlag): string {
  if (!flags.active) return '';

  const activeFlags: string[] = [];

  if (flags.light) activeFlags.push('light');
  if (flags.sound) activeFlags.push('sound');
  if (flags.smell) activeFlags.push('smell');
  if (flags.touch) activeFlags.push('touch');
  if (flags.temperature) activeFlags.push('temperature');
  if (flags.combined) activeFlags.push('environment');

  if (activeFlags.length === 0) return '';

  return activeFlags.join(', ');
}

/**
 * Get sensory load summary icon
 */
export function getSensoryLoadIcon(flags: SensoryLoadFlag): string {
  if (!flags.active) return '';

  if (flags.combined) return '⚠️'; // Combined/environment
  if (flags.light) return '💡'; // Light
  if (flags.sound) return '🔊'; // Sound
  if (flags.touch) return '✋'; // Touch
  if (flags.smell) return '👃'; // Smell
  if (flags.temperature) return '🌡️'; // Temperature

  return '⚠️';
}

/**
 * Determine if tier is severe (useful for styling decisions)
 */
export function isPhysicalTierSevere(tier: PhysicalCapacityTier): boolean {
  return ['P-2', 'P-1', 'P0'].includes(tier);
}

/**
 * Determine if cognitive tier is severe
 */
export function isCognitiveTierSevere(tier: CognitiveCapacityTier): boolean {
  return ['C-1', 'C0'].includes(tier);
}

/**
 * Get a friendly sentence describing the capacity state
 */
export function formatCapacitySummary(physical: PhysicalCapacityTier, cognitive: CognitiveCapacityTier): string {
  const physDesc = PHYSICAL_TIER_DESCRIPTIONS[physical];
  const cogDesc = COGNITIVE_TIER_DESCRIPTIONS[cognitive];

  return `${physDesc}, ${cogDesc.toLowerCase()}`;
}
