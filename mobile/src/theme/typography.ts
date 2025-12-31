/**
 * RantTrack Typography System
 * Font families and type scale per UI Design System
 */

/**
 * Font Families
 * - Display/Headers: DM Serif Display (warm, approachable serif)
 * - Body/UI: DM Sans (clean, readable sans-serif)
 */
export const fontFamilies = {
  display: 'DMSerifDisplay_400Regular',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
};

/**
 * Type Scale
 * Follows design system specifications
 */
export const typography = {
  // Page titles - 24px DM Serif Display
  pageTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 24,
    lineHeight: 32,
  },

  // Large headers - 22px DM Serif Display
  largeHeader: {
    fontFamily: fontFamilies.display,
    fontSize: 22,
    lineHeight: 28,
  },

  // Section headers - 14px DM Sans Medium
  sectionHeader: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.5,
  },

  // Body text - 15px DM Sans Regular
  body: {
    fontFamily: fontFamilies.body,
    fontSize: 15,
    lineHeight: 22,
  },

  // Body medium - 15px DM Sans Medium
  bodyMedium: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 15,
    lineHeight: 22,
  },

  // Small text - 13px DM Sans Regular
  small: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    lineHeight: 18,
  },

  // Caption - 12px DM Sans Regular
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    lineHeight: 16,
  },

  // Button text - 15px DM Sans Medium
  button: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 15,
    lineHeight: 22,
  },

  // Large display - 28px DM Serif Display
  largeDisplay: {
    fontFamily: fontFamilies.display,
    fontSize: 28,
    lineHeight: 36,
  },
};
