/**
 * BreathingCircle Component
 * Simple, calming breathing animation for voice recording
 * A single circle that gently pulses in and out
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const CIRCLE_SIZE = 120;
const ANIMATION_DURATION = 2500;

export function LavaLampAnimation() {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        // Breathe in - expand
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        // Breathe out - contract
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    breathingAnimation.start();

    return () => {
      breathingAnimation.stop();
    };
  }, [scaleAnim]);

  // Scale from 0.7 to 1.0
  const scale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.0],
  });

  // Opacity from 0.5 to 0.9
  const opacity = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0.9],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ scale }],
            opacity,
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
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: '#ec9175ff',
  },
});
