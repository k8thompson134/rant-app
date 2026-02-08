/**
 * AccessibilityContext
 * Global context for accessibility settings, computed theme, and typography
 * Provides app-wide access to ME/CFS and visual accessibility features
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { AccessibilityInfo, PixelRatio } from 'react-native';
import type { AccessibilitySettings, FontSize, FontFamily, TouchTargetSize } from '../types/accessibility';
import { DEFAULT_ACCESSIBILITY_SETTINGS } from '../types/accessibility';
import {
  getAccessibilitySettings,
  saveAccessibilitySettings,
  updateAccessibilitySetting as updateStoredSetting,
} from '../utils/storage';
import { darkTheme, lightTheme, type ThemeColors } from '../theme/colors';
import { typography } from '../theme/typography';
import {
  getComputedTheme,
  getScaledTypography,
  getAnimationConfig,
  getTouchTargetSize,
  type AnimationConfig,
} from '../theme/accessibility';

interface AccessibilityContextValue {
  // Settings
  settings: AccessibilitySettings;
  isLoading: boolean;

  // Update functions
  updateSettings: (updates: Partial<AccessibilitySettings>) => Promise<void>;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => Promise<void>;
  resetSettings: () => Promise<void>;

  // Computed values
  computedTheme: ThemeColors;
  computedTypography: typeof typography;
  animationConfig: AnimationConfig;
  touchTargetSize: number;
}

const AccessibilityContext = createContext<AccessibilityContextValue | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [systemFontScale, setSystemFontScale] = useState(1.0);

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Detect system font scale
  useEffect(() => {
    const fontScale = PixelRatio.getFontScale();
    setSystemFontScale(fontScale);
  }, []);

  // Detect system reduced motion preference
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (enabled) {
        updateSetting('reducedMotion', true);
      }
    });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      updateSetting('reducedMotion', enabled);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await getAccessibilitySettings();
      setSettings(stored);
    } catch (error) {
      console.error('Failed to load accessibility settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = useCallback(async (updates: Partial<AccessibilitySettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    await saveAccessibilitySettings(updated);
  }, [settings]);

  const updateSetting = useCallback(
    async <K extends keyof AccessibilitySettings>(
      key: K,
      value: AccessibilitySettings[K]
    ) => {
      const updated = await updateStoredSetting(key, value);
      setSettings(updated);
    },
    []
  );

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_ACCESSIBILITY_SETTINGS);
    await saveAccessibilitySettings(DEFAULT_ACCESSIBILITY_SETTINGS);
  }, []);

  // Compute theme based on settings
  const computedTheme = useMemo(() => {
    // Select base theme based on user preference
    // 'auto' mode will be implemented in the future to follow system preference
    const baseTheme = settings.themeMode === 'light' ? lightTheme : darkTheme;
    return getComputedTheme(baseTheme, settings.highContrastMode);
  }, [settings.themeMode, settings.highContrastMode]);

  // Compute typography based on settings and system font scale
  const computedTypography = useMemo(() => {
    return getScaledTypography(settings.fontSize, settings.fontFamily, systemFontScale);
  }, [settings.fontSize, settings.fontFamily, systemFontScale]);

  // Compute animation config
  const animationConfig = useMemo(() => {
    return getAnimationConfig(settings.reducedMotion);
  }, [settings.reducedMotion]);

  // Get touch target size
  const touchTargetSize = useMemo(() => {
    return getTouchTargetSize(settings.touchTargetSize);
  }, [settings.touchTargetSize]);

  const value: AccessibilityContextValue = {
    settings,
    isLoading,
    updateSettings,
    updateSetting,
    resetSettings,
    computedTheme,
    computedTypography,
    animationConfig,
    touchTargetSize,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook to access accessibility context
 * @throws Error if used outside AccessibilityProvider
 */
export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

/**
 * Convenience hooks for specific features
 */

export function useTheme() {
  const { computedTheme } = useAccessibility();
  return computedTheme;
}

export function useTypography() {
  const { computedTypography } = useAccessibility();
  return computedTypography;
}

export function useAnimationConfig() {
  const { animationConfig } = useAccessibility();
  return animationConfig;
}

export function useTouchTargetSize() {
  const { touchTargetSize } = useAccessibility();
  return touchTargetSize;
}

export function useAccessibilitySettings() {
  const { settings, updateSettings, updateSetting, resetSettings } = useAccessibility();
  return { settings, updateSettings, updateSetting, resetSettings };
}
