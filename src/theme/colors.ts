/**
 * RantTrack Design Tokens
 * Color palette for dark mode (default) and light mode support
 */

export interface ThemeColors {
  // Backgrounds
  bgApp: string;
  bgPrimary: string;
  bgSecondary: string;
  bgElevated: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Accent
  accentPrimary: string;
  accentLight: string;

  // Symptom Categories
  symptomFatigue: string;
  symptomPem: string;
  symptomBrainfog: string;
  symptomPain: string;
  symptomTeal: string;
  symptomLavender: string;
  symptomCoral: string;

  // Symptom Light Backgrounds (15% opacity)
  symptomFatigueLight: string;
  symptomPemLight: string;
  symptomBrainfogLight: string;
  symptomPainLight: string;
  symptomTealLight: string;
  symptomLavenderLight: string;
  symptomCoralLight: string;

  // Severity
  severityGood: string;
  severityModerate: string;
  severityRough: string;
  severityNone: string;
}

/**
 * Dark Mode Theme (Default)
 */
export const darkTheme: ThemeColors = {
  // Backgrounds
  bgApp: '#0D0D0D',
  bgPrimary: '#1C1917',
  bgSecondary: '#292524',
  bgElevated: '#3D3836',

  // Text
  textPrimary: '#F5F5F4',
  textSecondary: '#A8A29E',
  textMuted: '#78716C',

  // Accent
  accentPrimary: '#ec9175ff', // Terracotta per design system
  accentLight: 'rgba(201, 144, 126, 0.15)',

  // Symptom Categories
  symptomFatigue: '#E8DCC4', // Cream - general/fatigue symptoms
  symptomPem: '#C9907E', // Terracotta - PEM/energy symptoms
  symptomBrainfog: '#8FBCB5', // Teal - cognitive symptoms
  symptomPain: '#E8A090', // Coral - pain symptoms
  symptomTeal: '#8FBCB5',
  symptomLavender: '#B8A9C9',
  symptomCoral: '#E8A090',

  // Symptom Light Backgrounds (15% opacity)
  symptomFatigueLight: 'rgba(232, 220, 196, 0.15)',
  symptomPemLight: 'rgba(201, 144, 126, 0.15)',
  symptomBrainfogLight: 'rgba(143, 188, 181, 0.15)',
  symptomPainLight: 'rgba(232, 160, 144, 0.15)',
  symptomTealLight: 'rgba(143, 188, 181, 0.15)',
  symptomLavenderLight: 'rgba(184, 169, 201, 0.15)',
  symptomCoralLight: 'rgba(232, 160, 144, 0.15)',

  // Severity
  severityGood: '#9BB68E',
  severityModerate: '#D4A574',
  severityRough: '#D4836A',
  severityNone: '#3D3836',
};

/**
 * Light Mode Theme
 * Warm, cream-based palette inspired by the Review Entry screen
 */
export const lightTheme: ThemeColors = {
  // Backgrounds - warm cream tones
  bgApp: '#F5EDE6',
  bgPrimary: '#FDF9F6',
  bgSecondary: '#F8F1EA',
  bgElevated: '#EDE5DC',

  // Text
  textPrimary: '#2C2420',
  textSecondary: '#6B5D54',
  textMuted: '#A89B91',

  // Accent (warm terracotta)
  accentPrimary: '#B5715A',
  accentLight: 'rgba(181, 113, 90, 0.15)',

  // Symptom Colors (richer for light bg)
  symptomFatigue: '#B8A888',
  symptomPem: '#B5715A',
  symptomBrainfog: '#5A9E94',
  symptomPain: '#D4806A',
  symptomTeal: '#5A9E94',
  symptomLavender: '#8E7BA8',
  symptomCoral: '#D4806A',

  // Light backgrounds - warmer tints
  symptomFatigueLight: 'rgba(184, 168, 136, 0.18)',
  symptomPemLight: 'rgba(181, 113, 90, 0.18)',
  symptomBrainfogLight: 'rgba(90, 158, 148, 0.15)',
  symptomPainLight: 'rgba(212, 128, 106, 0.18)',
  symptomTealLight: 'rgba(90, 158, 148, 0.15)',
  symptomLavenderLight: 'rgba(142, 123, 168, 0.15)',
  symptomCoralLight: 'rgba(212, 128, 106, 0.18)',

  // Severity - more distinct, accessible colors
  severityGood: '#4A8F6F',
  severityModerate: '#C4873D',
  severityRough: '#C9543D',
  severityNone: '#EDE5DC',
};

/**
 * Default theme export for backward compatibility
 * For now, we default to dark theme
 * Note: Import darkTheme or lightTheme directly to avoid bundling issues
 */
export const theme = darkTheme;
