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
 */
export const lightTheme: ThemeColors = {
  // Backgrounds
  bgApp: '#E8E2DC',
  bgPrimary: '#FFFBF8',
  bgSecondary: '#F5F0EB',
  bgElevated: '#E8E2DC',

  // Text
  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#A8A29E',

  // Accent (darker for light mode contrast)
  accentPrimary: '#A8725E',
  accentLight: 'rgba(168, 114, 94, 0.12)',

  // Symptom Colors (adjusted for light bg)
  symptomFatigue: '#C4B89E',
  symptomPem: '#A8725E',
  symptomBrainfog: '#6FA599',
  symptomPain: '#D4886E',
  symptomTeal: '#6FA599',
  symptomLavender: '#9A8DAE',
  symptomCoral: '#D4886E',

  // Light backgrounds at 12% for light mode
  symptomFatigueLight: 'rgba(196, 184, 158, 0.12)',
  symptomPemLight: 'rgba(168, 114, 94, 0.12)',
  symptomBrainfogLight: 'rgba(111, 165, 153, 0.12)',
  symptomPainLight: 'rgba(212, 136, 110, 0.12)',
  symptomTealLight: 'rgba(111, 165, 153, 0.12)',
  symptomLavenderLight: 'rgba(154, 141, 174, 0.12)',
  symptomCoralLight: 'rgba(212, 136, 110, 0.12)',

  // Severity
  severityGood: '#5A9A91',
  severityModerate: '#B8894A',
  severityRough: '#D4634B',
  severityNone: '#E8E2DC',
};

/**
 * Default theme export for backward compatibility
 * For now, we default to dark theme
 * Note: Import darkTheme or lightTheme directly to avoid bundling issues
 */
export const theme = darkTheme;
