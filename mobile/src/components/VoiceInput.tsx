/**
 * VoiceInput Component
 * Microphone button for voice-to-text input
 */

import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Voice from '@react-native-voice/voice';
import { useTheme, useTouchTargetSize } from '../contexts/AccessibilityContext';
import { darkTheme } from '../theme/colors';

interface VoiceInputProps {
  onResult: (text: string) => void;
  disabled?: boolean;
  onRecordingStateChange?: (isRecording: boolean) => void;
}

export function VoiceInput({ onResult, disabled, onRecordingStateChange }: VoiceInputProps) {
  const colors = useTheme();
  const touchTargetSize = useTouchTargetSize();
  const [isRecording, setIsRecording] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    const initVoice = async () => {
      // Request microphone permission on Android
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Microphone Permission',
              message: 'RantTrack needs access to your microphone for voice input.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          console.log('Microphone permission:', granted);
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Microphone permission denied');
            setIsAvailable(false);
            return;
          }
        } catch (err) {
          console.error('Permission request error:', err);
          setIsAvailable(false);
          return;
        }
      }

      // Check if voice recognition is available
      Voice.isAvailable()
        .then((available) => {
          console.log('Voice.isAvailable() result:', available);
          setIsAvailable(!!available);
        })
        .catch((error) => {
          console.error('Voice.isAvailable() error:', error);
          setIsAvailable(false);
        });

      // Set up voice event handlers
      Voice.onSpeechStart = onSpeechStart;
      Voice.onSpeechEnd = onSpeechEnd;
      Voice.onSpeechResults = onSpeechResults;
      Voice.onSpeechError = onSpeechError;
    };

    initVoice();

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechStart = () => {
    console.log('Speech started');
  };

  const onSpeechEnd = () => {
    console.log('Speech ended');
    setIsRecording(false);
    onRecordingStateChange?.(false);
  };

  const onSpeechResults = (event: any) => {
    console.log('Speech results:', event.value);
    if (event.value && event.value.length > 0) {
      const recognizedText = event.value[0];
      onResult(recognizedText);
    }
  };

  const onSpeechError = (event: any) => {
    console.log('Speech error:', event.error);

    // Ignore common non-critical errors that happen during normal usage
    const errorCode = event.error?.code;
    const errorMessage = event.error?.message || '';

    // These are normal - user stopped speaking or paused
    const ignorableErrors = [
      'No speech input',
      'no-speech',
      '7', // ERROR_NO_MATCH - no recognition result
      '6', // ERROR_SPEECH_TIMEOUT
    ];

    const shouldIgnore = ignorableErrors.some(err =>
      errorMessage.includes(err) || errorCode === err || String(errorCode) === err
    );

    // Don't stop recording for ignorable errors - let user keep talking
    if (!shouldIgnore) {
      setIsRecording(false);
      onRecordingStateChange?.(false);

      Alert.alert(
        'Voice Input Error',
        'Failed to start voice recognition. Please try again.'
      );
    }
  };

  const startRecording = async () => {
    if (!isAvailable) {
      Alert.alert(
        'Voice Input Not Available',
        'Voice recognition is not available on this device. Please check that microphone permissions are granted.\n\nYou can still type your rant manually!',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsRecording(true);
      onRecordingStateChange?.(true);
      await Voice.start(Platform.OS === 'ios' ? 'en-US' : 'en-US');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      onRecordingStateChange?.(false);
      Alert.alert('Error', 'Failed to start voice recording');
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
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

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    backgroundColor: darkTheme.bgElevated,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRecording: {
    backgroundColor: darkTheme.accentLight,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
