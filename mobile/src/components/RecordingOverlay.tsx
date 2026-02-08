/**
 * RecordingOverlay Component
 * Full-screen sensory animation shown during voice recording
 * Helps users focus on speaking without text distraction
 */

import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LavaLampAnimation } from './animations/LavaLampAnimation';
import { useTheme, useTypography, useAccessibilitySettings } from '../contexts/AccessibilityContext';
import { typography as baseTypography } from '../theme/typography';

interface RecordingOverlayProps {
  onTap: () => void;
}

export function RecordingOverlay({ onTap }: RecordingOverlayProps) {
  const colors = useTheme();
  const typography = useTypography();
  const { settings } = useAccessibilitySettings();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
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
        <View style={styles.centerContent}>
          <Text style={[styles.recordingLabel, { color: colors.textSecondary }]}>Recording</Text>

          <View style={styles.animationContainer}>
            {settings.reducedMotion ? (
              <View style={styles.staticIndicator}>
                <Ionicons name="mic" size={80} color={colors.accentPrimary} />
                <Text style={styles.recordingText}>Recording</Text>
              </View>
            ) : (
              <LavaLampAnimation />
            )}
          </View>
        </View>

        <View style={styles.controls}>
          <Text style={styles.timer}>{formatDuration(duration)}</Text>
          <Text style={styles.hint}>Tap to finish</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  recordingLabel: {
    ...typography.largeHeader,
    marginBottom: 32,
    height: 32,
  },
  animationContainer: {
    height: 280,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  staticIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  recordingText: {
    ...typography.largeHeader,
    color: colors.accentPrimary,
  },
  controls: {
    marginTop: 16,
    alignItems: 'center',
  },
  timer: {
    fontSize: 20,
    fontVariant: ['tabular-nums'],
    color: colors.textSecondary,
    marginBottom: 8,
  },
  hint: {
    ...baseTypography.caption,
    color: colors.textMuted,
  },
});
