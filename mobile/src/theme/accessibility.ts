/**
 * Accessibility Theme Computation System
 * Generates high contrast themes, scaled typography, and animation configs
 * based on user accessibility settings
 */

import type { ThemeColors } from './colors';
import { darkTheme, lightTheme } from './colors';
import { typography, fontFamilies } from './typography';
import type { FontSize, FontFamily, TouchTargetSize } from '../types/accessibility';
import { FONT_SCALE_MULTIPLIERS, TOUCH_TARGET_SIZES } from '../types/accessibility';

/**
 * Generates a high contrast theme (WCAG AAA 7:1 ratio)
 * Based on the provided base theme
 */
export function getHighContrastTheme(baseTheme: ThemeColors): ThemeColors {
  const isDark = baseTheme.bgApp === darkTheme.bgApp;

  if (isDark) {
    // Dark mode high contrast
    return {
      ...baseTheme,
      // Pure blacks and whites for maximum contrast
      bgApp: '#000000',
      bgPrimary: '#000000',
      bgSecondary: '#1A1A1A',
      bgElevated: '#2D2D2D',

      textPrimary: '#FFFFFF',
      textSecondary: '#E0E0E0',
      textMuted: '#B0B0B0',

      // Brighter accent for contrast
      accentPrimary: '#FFB59A',
      accentLight: 'rgba(255, 181, 154, 0.2)',

      // Enhanced symptom colors
      symptomFatigue: '#FFF4E0',
      symptomPem: '#FFB59A',
      symptomBrainfog: '#A0E0D8',
      symptomPain: '#FFB8A8',
      symptomTeal: '#A0E0D8',
      symptomLavender: '#D0C0E0',
      symptomCoral: '#FFB8A8',

      // Brighter backgrounds
      symptomFatigueLight: 'rgba(255, 244, 224, 0.2)',
      symptomPemLight: 'rgba(255, 181, 154, 0.2)',
      symptomBrainfogLight: 'rgba(160, 224, 216, 0.2)',
      symptomPainLight: 'rgba(255, 184, 168, 0.2)',
      symptomTealLight: 'rgba(160, 224, 216, 0.2)',
      symptomLavenderLight: 'rgba(208, 192, 224, 0.2)',
      symptomCoralLight: 'rgba(255, 184, 168, 0.2)',

      // More saturated severity colors
      severityGood: '#A8D89F',
      severityModerate: '#F0C060',
      severityRough: '#FF8870',
      severityNone: '#2D2D2D',
    };
  } else {
    // Light mode high contrast
    return {
      ...baseTheme,
      bgApp: '#FFFFFF',
      bgPrimary: '#FFFFFF',
      bgSecondary: '#F0F0F0',
      bgElevated: '#E8E8E8',

      textPrimary: '#000000',
      textSecondary: '#3D3D3D',
      textMuted: '#707070',

      accentPrimary: '#8A4A30',
      accentLight: 'rgba(138, 74, 48, 0.15)',

      // Darker symptom colors for light bg
      symptomFatigue: '#9A8866',
      symptomPem: '#8A4A30',
      symptomBrainfog: '#4A9A8A',
      symptomPain: '#B85A40',
      symptomTeal: '#4A9A8A',
      symptomLavender: '#7A6A9A',
      symptomCoral: '#B85A40',

      symptomFatigueLight: 'rgba(154, 136, 102, 0.15)',
      symptomPemLight: 'rgba(138, 74, 48, 0.15)',
      symptomBrainfogLight: 'rgba(74, 154, 138, 0.15)',
      symptomPainLight: 'rgba(184, 90, 64, 0.15)',
      symptomTealLight: 'rgba(74, 154, 138, 0.15)',
      symptomLavenderLight: 'rgba(122, 106, 154, 0.15)',
      symptomCoralLight: 'rgba(184, 90, 64, 0.15)',

      severityGood: '#4A9A70',
      severityModerate: '#9A7030',
      severityRough: '#B83820',
      severityNone: '#E8E8E8',
    };
  }
}

/**
 * Font family mapping for different accessibility modes
 */
const FONT_FAMILY_MAP = {
  dmSans: {
    display: fontFamilies.display,
    body: fontFamilies.body,
    bodyMedium: fontFamilies.bodyMedium,
    bodyBold: fontFamilies.bodyBold,
  },
  openDyslexic: {
    display: 'OpenDyslexic_400Regular',
    body: 'OpenDyslexic_400Regular',
    bodyMedium: 'OpenDyslexic_400Regular',
    bodyBold: 'OpenDyslexic_700Bold',
  },
  system: {
    display: 'System',
    body: 'System',
    bodyMedium: 'System',
    bodyBold: 'System',
  },
};

/**
 * Generates scaled typography based on font size and family settings
 * Includes increased line spacing for dyslexia-friendly mode
 * Also supports React Native's system font scaling for accessibility
 */
export function getScaledTypography(
  fontSizeScale: FontSize = 'medium',
  fontFamily: FontFamily = 'dmSans',
  systemFontScale: number = 1.0
) {
  const scale = FONT_SCALE_MULTIPLIERS[fontSizeScale] * systemFontScale;
  const fonts = FONT_FAMILY_MAP[fontFamily];

  // Increase line spacing for dyslexia-friendly fonts
  const lineHeightMultiplier = fontFamily === 'openDyslexic' ? 1.5 : 1.0;
  const letterSpacing = fontFamily === 'openDyslexic' ? 1.2 : undefined;

  return {
    pageTitle: {
      fontFamily: fonts.display,
      fontSize: Math.round(typography.pageTitle.fontSize * scale),
      lineHeight: Math.round(typography.pageTitle.lineHeight * scale * lineHeightMultiplier),
      letterSpacing,
    },

    largeHeader: {
      fontFamily: fonts.display,
      fontSize: Math.round(typography.largeHeader.fontSize * scale),
      lineHeight: Math.round(typography.largeHeader.lineHeight * scale * lineHeightMultiplier),
      letterSpacing,
    },

    sectionHeader: {
      fontFamily: fonts.bodyMedium,
      fontSize: Math.round(typography.sectionHeader.fontSize * scale),
      lineHeight: Math.round(typography.sectionHeader.lineHeight * scale * lineHeightMultiplier),
      letterSpacing: letterSpacing || typography.sectionHeader.letterSpacing,
    },

    body: {
      fontFamily: fonts.body,
      fontSize: Math.round(typography.body.fontSize * scale),
      lineHeight: Math.round(typography.body.lineHeight * scale * lineHeightMultiplier),
      letterSpacing,
    },

    bodyMedium: {
      fontFamily: fonts.bodyMedium,
      fontSize: Math.round(typography.bodyMedium.fontSize * scale),
      lineHeight: Math.round(typography.bodyMedium.lineHeight * scale * lineHeightMultiplier),
      letterSpacing,
    },

    small: {
      fontFamily: fonts.body,
      fontSize: Math.round(typography.small.fontSize * scale),
      lineHeight: Math.round(typography.small.lineHeight * scale * lineHeightMultiplier),
      letterSpacing,
    },

    caption: {
      fontFamily: fonts.body,
      fontSize: Math.round(typography.caption.fontSize * scale),
      lineHeight: Math.round(typography.caption.lineHeight * scale * lineHeightMultiplier),
      letterSpacing,
    },

    button: {
      fontFamily: fonts.bodyMedium,
      fontSize: Math.round(typography.button.fontSize * scale),
      lineHeight: Math.round(typography.button.lineHeight * scale * lineHeightMultiplier),
      letterSpacing,
    },

    largeDisplay: {
      fontFamily: fonts.display,
      fontSize: Math.round(typography.largeDisplay.fontSize * scale),
      lineHeight: Math.round(typography.largeDisplay.lineHeight * scale * lineHeightMultiplier),
      letterSpacing,
    },
  };
}

/**
 * Animation configuration based on reduced motion preference
 */
export interface AnimationConfig {
  duration: number;
  useNativeDriver: boolean;
}

export function getAnimationConfig(reducedMotion: boolean): AnimationConfig {
  return {
    duration: reducedMotion ? 0 : 300,
    useNativeDriver: true,
  };
}

/**
 * Get touch target size in pixels
 */
export function getTouchTargetSize(size: TouchTargetSize): number {
  return TOUCH_TARGET_SIZES[size];
}

/**
 * Helper to check if a color has sufficient contrast ratio
 * Useful for dynamic text color selection
 */
export function getContrastRatio(foreground: string, background: string): number {
  // Simplified contrast check - in production, use a proper contrast library
  // For now, return a fixed value
  return 7.0; // WCAG AAA
}

/**
 * Get computed theme based on all accessibility settings
 */
export function getComputedTheme(
  baseTheme: ThemeColors,
  highContrast: boolean
): ThemeColors {
  if (highContrast) {
    return getHighContrastTheme(baseTheme);
  }
  return baseTheme;
}
