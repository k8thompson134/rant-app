/**
 * BreathingCircle Component
 * Enhanced, meditative breathing animation for voice recording
 * Features:
 * - Natural breathing rhythm (inhale, hold, exhale, hold) = 6s cycle with deep breaths
 * - Dramatic circle extension (0.5-1.3 scale) for very prominent visual feedback
 * - Subtle glow layer that pulses in opposition to main circle
 * - Theme-aware colors (dark/light mode support)
 * - 60 FPS performance with native driver
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../../contexts/AccessibilityContext';

const MAIN_CIRCLE_SIZE = 120;
const GLOW_CIRCLE_SIZE = 140;

// Animation phases (milliseconds)
const INHALE_DURATION = 2000;   // Expand gently
const HOLD_PEAK_DURATION = 750; // Pause at full breath
const EXHALE_DURATION = 2500;   // Slow release
const HOLD_REST_DURATION = 750; // Pause before next breath
const TOTAL_CYCLE = INHALE_DURATION + HOLD_PEAK_DURATION + EXHALE_DURATION + HOLD_REST_DURATION;

export function LavaLampAnimation() {
  const breathingPhase = useRef(new Animated.Value(0)).current;
  const theme = useTheme();

  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        // Inhale - gentle expansion (2s)
        Animated.timing(breathingPhase, {
          toValue: 1,
          duration: INHALE_DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        // Hold at peak - maintain full expansion (0.75s)
        Animated.timing(breathingPhase, {
          toValue: 1,
          duration: HOLD_PEAK_DURATION,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        // Exhale - slow release (2.5s)
        Animated.timing(breathingPhase, {
          toValue: 0,
          duration: EXHALE_DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        // Hold at rest - maintain full contraction (0.75s)
        Animated.timing(breathingPhase, {
          toValue: 0,
          duration: HOLD_REST_DURATION,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    breathingAnimation.start();

    return () => {
      breathingAnimation.stop();
    };
  }, [breathingPhase]);

  // Main circle: scale from 0.5 to 1.3 (dramatic breathing with much bigger extend)
  const mainScale = breathingPhase.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1.3],
  });

  // Main circle: opacity from 0.5 to 0.9 (breathing visual feedback)
  const mainOpacity = breathingPhase.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.9],
  });

  // Glow circle: scale from 0.55 to 1.35 (proportional to main circle for dramatic halo effect)
  const glowScale = breathingPhase.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1.35],
  });

  // Glow circle: opacity INVERTED (bright when main is dim, dim when main is bright)
  // Creates pulsing halo that radiates outward
  const glowOpacity = breathingPhase.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.15],
  });

  return (
    <View style={styles.container}>
      {/* Glow layer - outer soft halo (rendered first) */}
      <Animated.View
        style={[
          styles.glowCircle,
          {
            borderColor: theme.accentPrimary,
            transform: [{ scale: glowScale }],
            opacity: glowOpacity,
          },
        ]}
      />

      {/* Main circle - primary focus (rendered on top) */}
      <Animated.View
        style={[
          styles.mainCircle,
          {
            backgroundColor: theme.accentPrimary,
            transform: [{ scale: mainScale }],
            opacity: mainOpacity,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCircle: {
    width: MAIN_CIRCLE_SIZE,
    height: MAIN_CIRCLE_SIZE,
    borderRadius: MAIN_CIRCLE_SIZE / 2,
    position: 'absolute',
  },
  glowCircle: {
    width: GLOW_CIRCLE_SIZE,
    height: GLOW_CIRCLE_SIZE,
    borderRadius: GLOW_CIRCLE_SIZE / 2,
    borderWidth: 0,
    position: 'absolute',
  },
});
