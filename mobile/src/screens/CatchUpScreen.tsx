/**
 * CatchUpScreen - Multi-day voice entry with date parsing
 *
 * Allows users to catch up on missed days by:
 * 1. Recording a continuous voice entry mentioning multiple days
 * 2. Automatically parsing dates and segmenting by day
 * 3. Reviewing and editing each day's entry
 * 4. Drag-and-drop symptom reassignment between days
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VoiceInput } from '../components/VoiceInput';
import { extractSymptoms } from '../nlp/extractor';
import { segmentByDate, groupSegmentsByDate, validateAndFixDates } from '../nlp/dateExtractor';
import type { HomeStackParamList, DayEntry } from '../types/navigation';
import { darkTheme } from '../theme/colors';
import { typography } from '../theme/typography';
import { useTouchTargetSize } from '../hooks/useTouchTargetSize';

type CatchUpScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'CatchUp'>;

export default function CatchUpScreen() {
  const navigation = useNavigation<CatchUpScreenNavigationProp>();
  const [accumulatedText, setAccumulatedText] = useState('');
  const [dayEntries, setDayEntries] = useState<DayEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSegmentAdded, setShowSegmentAdded] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const touchTargetSize = useTouchTargetSize();

  // Memoize styles with theme tokens
  const styles = useMemo(() => createStyles(darkTheme, touchTargetSize), [touchTargetSize]);

  const handleVoiceEnd = (text: string) => {
    if (text.trim()) {
      // Accumulate final text from completed segments using functional update
      // This prevents closure issues when called multiple times rapidly
      setAccumulatedText((prev) => prev ? `${prev} ${text}` : text);

      // Show brief confirmation that segment was added
      setShowSegmentAdded(true);
      setTimeout(() => setShowSegmentAdded(false), 2000);
    }
  };

  const handleDoneRecording = async () => {
    if (!accumulatedText.trim()) {
      Alert.alert('No Input', 'Please record your catch-up entry first.');
      return;
    }

    setIsProcessing(true);

    try {
      // Segment the text by date
      const segments = segmentByDate(accumulatedText);
      const groupedSegments = groupSegmentsByDate(segments);

      // Validate and fix dates to ensure they're all in the past
      const fixedSegments = validateAndFixDates(groupedSegments);

      // Extract symptoms for each day
      const entries: DayEntry[] = fixedSegments.map((segment) => {
        const extraction = extractSymptoms(segment.text);
        return {
          timestamp: segment.timestamp,
          dateString: segment.dateString,
          text: segment.text,
          symptoms: extraction.symptoms,
          explicit: segment.explicit,
        };
      });

      setDayEntries(entries);
    } catch (error) {
      console.error('Error processing transcript:', error);
      Alert.alert('Processing Error', 'Failed to process your entry. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAll = async () => {
    if (dayEntries.length === 0) {
      Alert.alert('No Entries', 'Please record your catch-up entry first.');
      return;
    }

    try {
      // Import saveRantEntry dynamically to avoid circular deps
      const { saveRantEntry } = await import('../database/operations');

      // Save each day's entry with its custom timestamp
      for (const entry of dayEntries) {
        await saveRantEntry(entry.text, entry.symptoms, entry.timestamp);
      }

      Alert.alert(
        'Saved!',
        `Successfully saved ${dayEntries.length} ${dayEntries.length === 1 ? 'entry' : 'entries'}.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving entries:', error);
      Alert.alert('Save Error', 'Failed to save entries. Please try again.');
    }
  };

  // Unused but kept for future use - Review screen will need to save entries
  void handleSaveAll;

  const handleRetry = () => {
    setAccumulatedText('');
    setDayEntries([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Close catch-up screen"
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title} accessibilityRole="header">Catch Up</Text>
        <View style={styles.closeButton} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* RECORDING PHASE: Voice input with transcript display */}
        {dayEntries.length === 0 && !isProcessing && (
          <>
            {/* Gentle prompt - brain fog accommodation */}
            <View style={styles.promptContainer}>
              <Text
                style={styles.promptText}
                accessibilityRole="header"
              >
                Rough few days?
              </Text>
              <Text style={styles.promptSubtext}>
                No pressure—tell me what you remember
              </Text>
              <Text style={styles.hintText}>
                Try: "Yesterday I had a headache... Friday I woke up exhausted..."
              </Text>
            </View>

            {/* Voice input - clear single purpose */}
            <View
              style={styles.voiceContainer}
              accessible={true}
              accessibilityLabel="Record your catch-up entry"
              accessibilityHint="Press the microphone button to start recording, press again to stop. You can record multiple times."
            >
              <VoiceInput
                onResult={handleVoiceEnd}
                onInterimResult={() => {}} // Ignore interim results - don't show live preview
              />

              {/* Confirmation on segment added */}
              {showSegmentAdded && (
                <View
                  style={styles.segmentAddedBanner}
                  accessible={true}
                  accessibilityRole="alert"
                  accessibilityLiveRegion="polite"
                >
                  <Text style={styles.segmentAddedText}>✓ Segment saved</Text>
                </View>
              )}
            </View>

            {/* Live transcript display - prominent when recording */}
            {accumulatedText.length > 0 && (
              <View style={styles.transcriptContainerLarge}>
                <Text
                  style={styles.transcriptLabelLarge}
                  accessibilityRole="header"
                >
                  Your transcript
                </Text>
                <View
                  style={styles.transcriptBoxLarge}
                  accessible={true}
                  accessibilityLiveRegion="polite"
                >
                  <Text style={styles.transcriptTextLarge}>
                    {accumulatedText}
                  </Text>
                </View>
              </View>
            )}
          </>
        )}

        {/* PROCESSING PHASE: Clear status message */}
        {isProcessing && (
          <View
            style={styles.processingContainer}
            accessible={true}
            accessibilityLiveRegion="polite"
          >
            <ActivityIndicator size="large" color={darkTheme.accentPrimary} />
            <Text style={styles.processingText}>
              Organizing by date...
            </Text>
          </View>
        )}

        {/* REVIEW PHASE: Show parsed days clearly */}
        {dayEntries.length > 0 && !isProcessing && (
          <View style={styles.entriesContainer}>
            <Text
              style={styles.entriesTitle}
              accessibilityRole="header"
            >
              Found {dayEntries.length} {dayEntries.length === 1 ? 'day' : 'days'}
            </Text>

            {/* Day cards without scrollable nested containers */}
            {dayEntries.map((entry, index) => (
              <View
                key={index}
                style={styles.dayCard}
                accessible={true}
                accessibilityLabel={`Day ${index + 1}: ${entry.dateString}`}
              >
                <View style={styles.dayHeader}>
                  <Text style={styles.dayDate}>{entry.dateString}</Text>
                  {!entry.explicit && (
                    <View
                      style={styles.inferredBadge}
                      accessible={true}
                      accessibilityLabel="Inferred date"
                    >
                      <Text style={styles.inferredText}>Inferred</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={styles.dayText}
                  accessibilityLiveRegion="polite"
                >
                  {entry.text}
                </Text>
                <View style={styles.symptomCount}>
                  <Text style={styles.symptomCountText}>
                    {entry.symptoms.length} {entry.symptoms.length === 1 ? 'symptom' : 'symptoms'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ACTION BUTTONS: Clear states, large targets */}
      {dayEntries.length === 0 && accumulatedText.length > 0 && !isProcessing && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleRetry}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Clear and start over"
            accessibilityHint="Deletes all recorded segments"
          >
            <Text style={styles.secondaryButtonText}>Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleDoneRecording}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Done recording"
            accessibilityHint="Process and organize by date"
          >
            <Text style={styles.primaryButtonText}>Done Recording</Text>
          </TouchableOpacity>
        </View>
      )}

      {dayEntries.length > 0 && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleRetry}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Start over"
            accessibilityHint="Clears everything and returns to recording"
          >
            <Text style={styles.secondaryButtonText}>Start Over</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              navigation.navigate('CatchUpReview', { dayEntries });
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Review and edit"
            accessibilityHint="Edit text, reorder symptoms, and save"
          >
            <Text style={styles.primaryButtonText}>Review & Edit</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

/**
 * createStyles - Generates styles using theme tokens and accessibility settings
 */
const createStyles = (theme: typeof darkTheme, touchTargetSize: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bgApp,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.bgSecondary,
  },
  closeButton: {
    minWidth: touchTargetSize,
    minHeight: touchTargetSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    ...typography.largeHeader,
    color: theme.textSecondary,
  },
  title: {
    ...typography.pageTitle,
    color: theme.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  promptContainer: {
    marginBottom: 32,
  },
  promptText: {
    ...typography.largeDisplay,
    color: theme.textPrimary,
    marginBottom: 8,
  },
  promptSubtext: {
    ...typography.body,
    color: theme.textSecondary,
    marginBottom: 8,
  },
  hintText: {
    ...typography.small,
    color: theme.textMuted,
    fontStyle: 'italic',
  },
  voiceContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  transcriptContainerLarge: {
    marginTop: 24,
    marginBottom: 16,
  },
  transcriptLabelLarge: {
    ...typography.sectionHeader,
    color: theme.textMuted,
    marginBottom: 12,
  },
  transcriptBoxLarge: {
    backgroundColor: theme.bgPrimary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.bgSecondary,
    padding: 16,
    minHeight: 120,
  },
  transcriptTextLarge: {
    ...typography.body,
    color: theme.textPrimary,
  },
  segmentAddedBanner: {
    marginTop: 12,
    padding: 16,
    backgroundColor: 'rgba(75, 181, 67, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(75, 181, 67, 0.3)',
  },
  segmentAddedText: {
    ...typography.bodyMedium,
    color: '#4ade80',
    textAlign: 'center',
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  processingText: {
    ...typography.body,
    color: theme.textSecondary,
    marginTop: 16,
  },
  entriesContainer: {
    marginTop: 16,
  },
  entriesTitle: {
    ...typography.largeHeader,
    color: theme.textPrimary,
    marginBottom: 16,
  },
  dayCard: {
    backgroundColor: theme.bgPrimary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.bgSecondary,
    padding: 16,
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayDate: {
    ...typography.bodyMedium,
    fontSize: 17,
    color: theme.accentPrimary,
  },
  inferredBadge: {
    backgroundColor: theme.bgSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inferredText: {
    ...typography.caption,
    color: theme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  dayText: {
    ...typography.body,
    color: theme.textPrimary,
    marginBottom: 12,
  },
  symptomCount: {
    flexDirection: 'row',
  },
  symptomCountText: {
    ...typography.small,
    color: theme.textMuted,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.bgSecondary,
    backgroundColor: theme.bgApp,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: theme.bgSecondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: touchTargetSize,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    ...typography.button,
    color: theme.textPrimary,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: theme.accentPrimary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: touchTargetSize,
    justifyContent: 'center',
  },
  primaryButtonText: {
    ...typography.button,
    color: theme.bgApp,
  },
});
