/**
 * RecordingOverlay Component
 * Full-screen sensory animation shown during voice recording
 * Helps users focus on speaking without text distraction
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { LavaLampAnimation } from './animations/LavaLampAnimation';
import { useTheme, useTypography } from '../contexts/AccessibilityContext';
import { darkTheme } from '../theme/colors';
import { typography as baseTypography } from '../theme/typography';

interface RecordingOverlayProps {
  onTap: () => void;
}

export function RecordingOverlay({ onTap }: RecordingOverlayProps) {
  const colors = useTheme();
  const typography = useTypography();
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableWithoutFeedback onPress={onTap}>
      <View style={styles.container}>
        <View style={styles.animationContainer}>
          <LavaLampAnimation />
        </View>

        <View style={styles.controls}>
          <Text style={styles.timer}>{formatDuration(duration)}</Text>
          <Text style={styles.hint}>Tap to finish</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.bgElevated,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: darkTheme.textPrimary,
  },
  animationContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    marginTop: 16,
    alignItems: 'center',
  },
  timer: {
    fontSize: 20,
    fontVariant: ['tabular-nums'],
    color: darkTheme.textSecondary,
    marginBottom: 8,
  },
  hint: {
    ...baseTypography.caption,
    color: darkTheme.textMuted,
  },
});
