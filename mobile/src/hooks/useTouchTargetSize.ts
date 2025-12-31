/**
 * Hook for getting the current touch target size
 * from accessibility settings
 */

import { useAccessibilitySettings } from '../contexts/AccessibilityContext';
import { TOUCH_TARGET_SIZES } from '../constants/accessibility';

export function useTouchTargetSize(): number {
  const { settings } = useAccessibilitySettings();
  return TOUCH_TARGET_SIZES[settings.touchTargetSize];
}
