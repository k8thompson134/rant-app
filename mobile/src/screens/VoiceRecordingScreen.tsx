/**
 * VoiceRecordingScreen
 * Dedicated full-screen voice recording interface
 * Used by HomeScreen and QuickAddEntry for voice input
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from '@jamsch/expo-speech-recognition';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecordingOverlay } from '../components/RecordingOverlay';
import { useTheme, useTypography } from '../contexts/AccessibilityContext';
import { darkTheme } from '../theme/colors';
import { extractSymptoms } from '../nlp/extractor';

type RootStackParamList = {
  VoiceRecording: {
    returnScreen: string;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'VoiceRecording'>;

export function VoiceRecordingScreen({ route, navigation }: Props) {
  const colors = useTheme();
  const typography = useTypography();
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldKeepListening, setShouldKeepListening] = useState(true);
  const [accumulatedText, setAccumulatedText] = useState('');
  const shouldNavigateAfterEndRef = useRef(false);
  const accumulatedTextRef = useRef('');

  // Handle speech recognition events
  useSpeechRecognitionEvent('start', () => {
    console.log('Speech started');
    setIsRecording(true);
  });

  useSpeechRecognitionEvent('end', () => {
    console.log('Speech ended');

    // If we should navigate after end, do it now with all accumulated text
    if (shouldNavigateAfterEndRef.current) {
      const finalText = accumulatedTextRef.current || transcribedText;
      console.log('Navigating with accumulated text:', finalText);
      if (finalText) {
        handleComplete(finalText);
      } else {
        // No text captured, just go back
        navigation.goBack();
      }
      return;
    }

    // If we should keep listening and haven't manually stopped, restart
    if (shouldKeepListening && isRecording) {
      console.log('Auto-restarting speech recognition for extended session');
      setTimeout(() => {
        if (shouldKeepListening) {
          startRecording();
        }
      }, 300);
    } else {
      setIsRecording(false);
    }
  });

  useSpeechRecognitionEvent('result', (event) => {
    console.log('Speech result:', event);

    if (event.results && event.results.length > 0) {
      const transcript = event.results[0]?.transcript;
      if (transcript && transcript.trim()) {
        // Accumulate text from multiple recognition sessions
        if (event.isFinal) {
          const newText = accumulatedTextRef.current
            ? `${accumulatedTextRef.current} ${transcript}`
            : transcript;
          accumulatedTextRef.current = newText;
          setAccumulatedText(newText);
          setTranscribedText(newText);
          console.log('Accumulated (final):', newText);
        } else {
          // Show interim results combined with accumulated text
          const displayText = accumulatedTextRef.current
            ? `${accumulatedTextRef.current} ${transcript}`
            : transcript;
          setTranscribedText(displayText);
        }
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.log('Speech error:', event);
    setIsRecording(false);
    setIsProcessing(false);

    // Handle different error types
    if (event.error === 'not-allowed') {
      Alert.alert(
        'Permission Denied',
        'Microphone permission is required for voice input.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else if (event.error === 'no-speech') {
      Alert.alert(
        'No Speech Detected',
        'Please try again and speak clearly.',
        [
          { text: 'Cancel', onPress: () => navigation.goBack() },
          { text: 'Retry', onPress: startRecording },
        ]
      );
    } else {
      Alert.alert(
        'Voice Error',
        'Could not recognize speech. Please try again.',
        [
          { text: 'Cancel', onPress: () => navigation.goBack() },
          { text: 'Retry', onPress: startRecording },
        ]
      );
    }
  });

  useEffect(() => {
    // Auto-start recording when screen opens
    startRecording();

    return () => {
      // Cleanup - stop recognition if still running
      try {
        ExpoSpeechRecognitionModule.abort();
      } catch (error) {
        console.log('Cleanup error:', error);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Request permissions
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!result.granted) {
        Alert.alert(
          'Permission Required',
          'Microphone permission is needed for voice input.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
        return;
      }

      setShouldKeepListening(true);
      setIsRecording(true);
      setIsProcessing(false);

      // Start speech recognition with extended settings for low-energy users
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        maxAlternatives: 1,
        continuous: true, // Keep listening continuously
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
        contextualStrings: ['symptom', 'pain', 'fatigue', 'nausea', 'headache'],
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      Alert.alert('Error', 'Failed to start voice recording');
    }
  };

  const handleStopRecording = async () => {
    try {
      console.log('Stopping recording. Current accumulated text:', accumulatedTextRef.current);
      setShouldKeepListening(false); // Stop auto-restart
      shouldNavigateAfterEndRef.current = true; // Navigate when 'end' event fires
      setIsProcessing(true);
      ExpoSpeechRecognitionModule.stop();
      // Navigation will happen in the 'end' event handler
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      setIsProcessing(false);
    }
  };

  const handleComplete = (text: string) => {
    // If coming from HomeInput, go directly to ReviewEntry
    if (route.params.returnScreen === 'HomeInput') {
      const extractionResult = extractSymptoms(text);
      navigation.navigate('ReviewEntry' as any, {
        rantText: text,
        extractionResult,
      });
    } else {
      // For other screens (like QuickAddEntry), navigate back with voice text
      if (navigation.canGoBack()) {
        navigation.navigate(route.params.returnScreen as any, {
          voiceText: text,
        });
      }
    }
  };

  const handleCancel = () => {
    try {
      setShouldKeepListening(false); // Stop auto-restart
      ExpoSpeechRecognitionModule.abort();
    } catch (error) {
      console.error('Failed to cancel:', error);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {isRecording ? (
        <RecordingOverlay onTap={handleStopRecording} />
      ) : isProcessing ? (
        <View style={styles.processingContainer}>
          <Text style={[styles.processingText, { ...typography.largeHeader }]}>
            Processing...
          </Text>
          {transcribedText && (
            <Text style={[styles.transcribedText, { ...typography.body }]}>
              "{transcribedText}"
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.readyContainer}>
          <Ionicons name="mic" size={80} color={colors.accentPrimary} />
          <Text style={[styles.readyText, { ...typography.largeHeader }]}>
            Ready to record
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={startRecording}>
            <Ionicons name="mic" size={24} color={darkTheme.bgPrimary} />
            <Text style={[styles.startButtonText, { ...typography.button }]}>
              Start Recording
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cancel button always visible */}
      <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
        <Ionicons name="close" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.bgPrimary,
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  processingText: {
    color: darkTheme.textPrimary,
    marginBottom: 20,
  },
  transcribedText: {
    color: darkTheme.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  readyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  readyText: {
    color: darkTheme.textPrimary,
    marginTop: 20,
    marginBottom: 40,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.accentPrimary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  startButtonText: {
    color: darkTheme.bgPrimary,
  },
  cancelButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: darkTheme.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
