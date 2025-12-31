/**
 * Accessibility constants
 * Touch target sizes, spacing, and other accessibility-related values
 */

import type { TouchTargetSize } from '../types/accessibility';

/**
 * Touch target sizes (in points)
 * Based on WCAG 2.1 AAA and mobile accessibility best practices
 */
export const TOUCH_TARGET_SIZES: Record<TouchTargetSize, number> = {
  minimum: 48, // WCAG 2.1 AAA minimum
  comfortable: 56, // Recommended for general use
  large: 64, // ME/CFS friendly, easier for low dexterity
};

/**
 * Minimum spacing between interactive elements
 */
export const TOUCH_TARGET_SPACING = 16; // pixels

/**
 * Hit slop for smaller touch targets
 * Extends the touchable area without changing visual size
 */
export const HIT_SLOP = {
  top: 12,
  bottom: 12,
  left: 12,
  right: 12,
};

/**
 * Animation durations
 */
export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  none: 0, // For reduced motion
};

/**
 * Recommended minimum font sizes (accessibility)
 */
export const MIN_FONT_SIZES = {
  body: 14,
  caption: 12,
  button: 15,
  header: 18,
};
