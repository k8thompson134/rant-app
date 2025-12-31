/**
 * RantInput Component
 * Text input for entering how you're feeling
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { VoiceInput } from './VoiceInput';
import { RecordingOverlay } from './RecordingOverlay';
import Voice from '@react-native-voice/voice';
import { useTheme, useTypography, useAccessibilitySettings } from '../contexts/AccessibilityContext';
import { useAutoSave } from '../hooks/useAutoSave';
import { clearDraftEntry } from '../database/operations';
import { darkTheme } from '../theme/colors';
import { typography as baseTypography } from '../theme/typography';

interface RantInputProps {
  onSubmit: (text: string) => void | Promise<void>;
  placeholder?: string;
  isLoading?: boolean;
  initialText?: string; // For draft recovery
}

export function RantInput({ onSubmit, placeholder, isLoading, initialText }: RantInputProps) {
  const colors = useTheme();
  const typography = useTypography();
  const [text, setText] = useState(initialText || '');
  const [isRecording, setIsRecording] = useState(false);
  const { settings } = useAccessibilitySettings();

  // Update text if initialText changes (draft recovery)
  React.useEffect(() => {
    if (initialText !== undefined) {
      setText(initialText);
    }
  }, [initialText]);

  // Auto-save functionality
  const { lastSaved, isSaving } = useAutoSave(text, [], {
    enabled: settings.autoSaveEnabled,
    interval: settings.autoSaveInterval,
    onSave: (draftId) => {
      console.log('Draft auto-saved:', draftId);
    },
    onError: (error) => {
      console.error('Auto-save error:', error);
    },
  });

  const handleSubmit = async () => {
    if (text.trim()) {
      await onSubmit(text);
      // Clear the draft after successful submission
      await clearDraftEntry();
      setText('');
    }
  };

  const handleVoiceResult = (voiceText: string) => {
    setText((prev) => (prev ? `${prev} ${voiceText}` : voiceText));
  };

  const handleRecordingStateChange = (recording: boolean) => {
    setIsRecording(recording);
  };

  const handleOverlayTap = async () => {
    // Stop recording when user taps the overlay
    try {
      await Voice.stop();
      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // Format last saved time
  const getLastSavedText = () => {
    if (isSaving) return 'Saving...';
    if (!lastSaved) return null;

    const now = Date.now();
    const diff = now - lastSaved.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 10) return 'Saved just now';
    if (seconds < 60) return `Saved ${seconds}s ago`;
    return 'Draft saved';
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {isRecording ? (
          <RecordingOverlay onTap={handleOverlayTap} />
        ) : (
          <>
            <TextInput
              style={styles.input}
              multiline
              value={text}
              onChangeText={setText}
              placeholder={placeholder || "Type or speak about how you're feeling..."}
              placeholderTextColor={colors.textMuted}
              textAlignVertical="top"
            />
            {settings.autoSaveEnabled && text.trim() && (
              <Text style={styles.autoSaveIndicator}>
                {getLastSavedText()}
              </Text>
            )}
          </>
        )}
      </View>
      <View style={styles.actions}>
        <VoiceInput
          onResult={handleVoiceResult}
          onRecordingStateChange={handleRecordingStateChange}
          disabled={isLoading}
        />
        <TouchableOpacity
          style={[styles.button, (!text.trim() || isLoading) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!text.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.bgPrimary} />
          ) : (
            <Text style={[styles.buttonText, (!text.trim() || isLoading) && styles.buttonTextDisabled]}>
              Save Entry
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  input: {
    flex: 1,
    backgroundColor: darkTheme.bgElevated,
    borderRadius: 16,
    padding: 16,
    ...baseTypography.body,
    color: darkTheme.textPrimary,
    minHeight: 150,
  },
  autoSaveIndicator: {
    position: 'absolute',
    bottom: 12,
    right: 16,
    ...baseTypography.caption,
    color: darkTheme.textMuted,
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    backgroundColor: darkTheme.accentPrimary,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: darkTheme.bgElevated,
    opacity: 0.8,
  },
  buttonText: {
    ...baseTypography.button,
    color: darkTheme.bgPrimary,
  },
  buttonTextDisabled: {
    color: darkTheme.textMuted,
  },
});
