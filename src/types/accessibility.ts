/**
 * Accessibility settings and types for RantTrack
 * Supports ME/CFS-specific needs and visual accessibility
 */

export type FontSize = 'small' | 'medium' | 'large' | 'extraLarge';
export type FontFamily = 'dmSans' | 'openDyslexic' | 'system';
export type TouchTargetSize = 'minimum' | 'comfortable' | 'large';
export type ThemeMode = 'light' | 'dark' | 'auto'; // 'auto' reserved for future system preference

export interface AccessibilitySettings {
  // Visual Accessibility
  themeMode: ThemeMode;
  highContrastMode: boolean;
  fontSize: FontSize;
  fontFamily: FontFamily;
  reducedMotion: boolean;

  // ME/CFS Specific Features
  autoSaveEnabled: boolean;
  autoSaveInterval: number; // milliseconds
  bypassReviewScreen: boolean;
  showQuickActions: boolean;
  touchTargetSize: TouchTargetSize;
}

export const DEFAULT_ACCESSIBILITY_SETTINGS: AccessibilitySettings = {
  // Visual defaults
  themeMode: 'dark', // Dark mode is default per design system
  highContrastMode: false,
  fontSize: 'medium',
  fontFamily: 'dmSans',
  reducedMotion: false,

  // ME/CFS defaults
  autoSaveEnabled: true, // Auto-save by default for safety
  autoSaveInterval: 5000, // 5 seconds
  bypassReviewScreen: false, // Let users see extractions by default
  showQuickActions: true, // Show quick action buttons
  touchTargetSize: 'comfortable', // 56pt default
};

export const FONT_SCALE_MULTIPLIERS: Record<FontSize, number> = {
  small: 0.875,
  medium: 1.0,
  large: 1.25,
  extraLarge: 1.5,
};

export const TOUCH_TARGET_SIZES: Record<TouchTargetSize, number> = {
  minimum: 48, // WCAG minimum
  comfortable: 56, // Recommended
  large: 64, // ME/CFS friendly
};
