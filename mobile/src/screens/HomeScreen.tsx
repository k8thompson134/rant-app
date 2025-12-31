/**
 * HomeScreen - Main rant input (redesigned per RantTrack UI Design System)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../types/navigation';
import { RantInput } from '../components/RantInput';
import { QuickActionChips } from '../components/QuickActionChips';
import { QuickCheckInModal } from '../components/QuickCheckInModal';
import { extractSymptoms } from '../nlp/extractor';
import { getAllRantEntries, getDraftEntry, clearDraftEntry, saveRantEntry } from '../database/operations';
import { RantEntry } from '../types';
import { useAccessibilitySettings, useTheme, useTypography } from '../contexts/AccessibilityContext';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeInput'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
  route: { params?: { voiceText?: string } };
}

export function HomeScreen({ navigation, route }: HomeScreenProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [yesterdayEntry, setYesterdayEntry] = useState<RantEntry | null>(null);
  const [draftText, setDraftText] = useState<string | undefined>(undefined);
  const [showQuickCheckIn, setShowQuickCheckIn] = useState(false);
  const { settings } = useAccessibilitySettings();
  const colors = useTheme();
  const typography = useTypography();

  // Create dynamic styles based on current theme and typography
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  useEffect(() => {
    loadYesterdayEntry();
    checkForDraft();
  }, []);

  // Handle voice input result from VoiceRecordingScreen
  useEffect(() => {
    if (route.params?.voiceText) {
      const voiceText = route.params.voiceText;
      // Append voice text to draft
      setDraftText((prev) => (prev ? `${prev} ${voiceText}` : voiceText));
    }
  }, [route.params?.voiceText]);

  const loadYesterdayEntry = async () => {
    try {
      const entries = await getAllRantEntries();
      if (entries.length > 0) {
        setYesterdayEntry(entries[0]); // Most recent entry
      }
    } catch (error) {
      console.error('Failed to load yesterday entry:', error);
    }
  };

  const checkForDraft = async () => {
    try {
      const draft = await getDraftEntry();
      if (draft && draft.text.trim()) {
        // Show alert asking if user wants to restore draft
        Alert.alert(
          'Restore Draft?',
          'You have an unsaved entry from earlier. Would you like to continue?',
          [
            {
              text: 'Discard',
              onPress: async () => {
                await clearDraftEntry();
              },
              style: 'destructive',
            },
            {
              text: 'Restore',
              onPress: () => {
                setDraftText(draft.text);
              },
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error('Failed to check for draft:', error);
    }
  };

  const handleRantSubmit = async (text: string) => {
    try {
      setIsSaving(true);

      // Extract symptoms
      const extractionResult = extractSymptoms(text);

      // Navigate to review screen
      navigation.navigate('ReviewEntry', {
        rantText: text,
        extractionResult,
      });
    } catch (error) {
      console.error('Extraction failed:', error);
      Alert.alert('Error', 'Failed to analyze your entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSameAsYesterday = async () => {
    if (!yesterdayEntry) return;

    Alert.alert(
      'Copy Yesterday\'s Entry',
      'This will copy your most recent entry. What would you like to do?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Edit First',
          onPress: () => {
            // Pre-fill with yesterday's text for editing
            setDraftText(yesterdayEntry.text);
          },
        },
        {
          text: 'Save Now',
          onPress: async () => {
            // Save directly if bypass review is enabled, otherwise go to review
            if (settings.bypassReviewScreen) {
              try {
                await saveRantEntry(yesterdayEntry.text, yesterdayEntry.symptoms);
                Alert.alert('Success', 'Entry copied from yesterday!');
                loadYesterdayEntry(); // Refresh
              } catch (error) {
                console.error('Failed to save entry:', error);
                Alert.alert('Error', 'Failed to save entry');
              }
            } else {
              // Navigate to review screen with yesterday's data
              const extractionResult = {
                text: yesterdayEntry.text,
                symptoms: yesterdayEntry.symptoms,
              };
              navigation.navigate('ReviewEntry', {
                rantText: yesterdayEntry.text,
                extractionResult,
              });
            }
          },
        },
      ]
    );
  };

  const handleQuickCheckIn = () => {
    setShowQuickCheckIn(true);
  };

  const handleQuickCheckInSaved = () => {
    loadYesterdayEntry(); // Refresh entries
  };

  const formatDate = (): string => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleVoicePress = () => {
    navigation.navigate('VoiceRecording', { returnScreen: 'HomeInput' });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>How's it going?</Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </View>

        {settings.showQuickActions && (
          <QuickActionChips
            onSameAsYesterday={handleSameAsYesterday}
            onQuickCheckIn={handleQuickCheckIn}
            hasYesterdayEntry={yesterdayEntry !== null}
          />
        )}

        <View style={styles.rantCard}>
          <Text style={styles.rantCardTitle}>Let it out...</Text>
          <RantInput
            onSubmit={handleRantSubmit}
            isLoading={isSaving}
            placeholder="Type or speak about how you're feeling..."
            initialText={draftText}
            onVoicePress={handleVoicePress}
          />
        </View>
      </ScrollView>

      <QuickCheckInModal
        visible={showQuickCheckIn}
        onClose={() => setShowQuickCheckIn(false)}
        onSave={handleQuickCheckInSaved}
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    paddingTop: 17,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 12,
    flexGrow: 1,
  },
  header: {
    gap: 4,
    marginBottom: 8,
  },
  title: {
    ...typography.largeDisplay,
    color: colors.textPrimary,
  },
  date: {
    ...typography.sectionHeader,
    color: colors.textSecondary,
  },
  rantCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 24,
    padding: 20,
    flex: 1,
    minHeight: 320,
  },
  rantCardTitle: {
    ...typography.largeHeader,
    color: colors.accentPrimary,
    marginBottom: 16,
  },
});
