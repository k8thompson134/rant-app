/**
 * VoiceInput Component
 * Microphone button for voice-to-text input
 */

import React, { useState, useMemo } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from '@jamsch/expo-speech-recognition';
import { useTheme, useTouchTargetSize } from '../contexts/AccessibilityContext';

interface VoiceInputProps {
  onResult: (text: string) => void;
  onInterimResult?: (text: string) => void;
  disabled?: boolean;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export function VoiceInput({ onResult, onInterimResult, disabled, onRecordingStateChange }: VoiceInputProps) {
  const colors = useTheme();
  const touchTargetSize = useTouchTargetSize();
  const styles = useMemo(() => createStyles(colors, touchTargetSize), [colors, touchTargetSize]);
  const [isRecording, setIsRecording] = useState(false);

  // Handle speech recognition events
  useSpeechRecognitionEvent('start', () => {
    console.log('Speech started');
    setIsRecording(true);
    onRecordingStateChange?.(true);
  });

  useSpeechRecognitionEvent('end', () => {
    console.log('Speech ended');
    setIsRecording(false);
    onRecordingStateChange?.(false);
  });

  useSpeechRecognitionEvent('result', (event) => {
    console.log('Speech result:', event);

    if (event.results && event.results.length > 0) {
      const transcript = event.results[0]?.transcript;
      if (transcript && transcript.trim()) {
        // Emit interim results as user speaks (for real-time feedback)
        if (!event.isFinal && onInterimResult) {
          onInterimResult(transcript);
        }
        // Emit final results when speech segment is complete
        if (event.isFinal) {
          onResult(transcript);
        }
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.log('Speech error:', event);
    setIsRecording(false);
    onRecordingStateChange?.(false);

    // Handle different error types
    if (event.error === 'not-allowed') {
      Alert.alert(
        'Permission Denied',
        'Microphone permission is required for voice input.'
      );
    } else if (event.error !== 'no-speech') {
      // Don't show alert for no-speech, user just needs to try again
      Alert.alert(
        'Voice Input Error',
        'Voice recognition encountered an error. Please try again.'
      );
    }
  });

  const startRecording = async () => {
    try {
      // Request permissions
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!result.granted) {
        Alert.alert(
          'Permission Required',
          'Microphone permission is needed for voice input. You can still type your rant manually!',
          [{ text: 'OK' }]
        );
        return;
      }

      setIsRecording(true);
      onRecordingStateChange?.(true);

      // Add small delay to allow native module initialization
      await new Promise(resolve => setTimeout(resolve, 150));

      // Start speech recognition with extended settings
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: false,
        maxAlternatives: 1,
        continuous: true, // Keep listening continuously
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      onRecordingStateChange?.(false);
      Alert.alert('Error', 'Failed to start voice recording');
    }
  };

  const stopRecording = async () => {
    try {
      ExpoSpeechRecognitionModule.stop();
      setIsRecording(false);
      onRecordingStateChange?.(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      onRecordingStateChange?.(false);
    }
  };

  const handlePress = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isRecording && styles.buttonRecording,
        disabled && styles.buttonDisabled,
      ]}
      onPress={handlePress}
      disabled={disabled}
      accessible={true}
      accessibilityLabel={isRecording ? 'Stop recording' : 'Start voice input'}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Ionicons
        name={isRecording ? 'stop-circle' : 'mic'}
        size={24}
        color={isRecording ? colors.accentPrimary : colors.textSecondary}
      />
    </TouchableOpacity>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>, touchTargetSize: number) => StyleSheet.create({
  button: {
    width: touchTargetSize,
    height: touchTargetSize,
    backgroundColor: colors.bgElevated,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRecording: {
    backgroundColor: colors.accentLight,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
