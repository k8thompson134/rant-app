/**
 * GuideScreen
 * User documentation and how-to guide for RantTrack
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useTypography } from '../contexts/AccessibilityContext';

export function GuideScreen() {
  const colors = useTheme();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(typography, colors), [typography, colors]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Guide</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.heading}>Quick Start</Text>
          <Text style={styles.paragraph}>
            RantTrack helps you track symptoms using your voice or typing - no forms, no checkboxes.
          </Text>

          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={24} color={colors.accentPrimary} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Just talk naturally</Text>
              <Text style={styles.tipText}>
                Say things like "bad headache today" or "exhausted, brain fog, knee pain"
              </Text>
            </View>
          </View>

          <Text style={styles.subheading}>How It Works</Text>

          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.stepNumberText, { color: colors.accentPrimary }]}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Record or Type</Text>
              <Text style={styles.stepText}>
                Use the microphone button or type how you're feeling
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.stepNumberText, { color: colors.accentPrimary }]}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Review Symptoms</Text>
              <Text style={styles.stepText}>
                The app detects symptoms, severity, and details automatically
              </Text>
            </View>
          </View>

          <View style={styles.step}>
            <View style={[styles.stepNumber, { backgroundColor: colors.accentLight }]}>
              <Text style={[styles.stepNumberText, { color: colors.accentPrimary }]}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Save & Track</Text>
              <Text style={styles.stepText}>
                Your entry is saved locally on your device - no cloud, no tracking
              </Text>
            </View>
          </View>

          <Text style={styles.subheading}>Tips for Better Recognition</Text>

          <View style={styles.bulletList}>
            <View style={styles.bullet}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Mention severity: "mild headache" or "severe pain"
              </Text>
            </View>
            <View style={styles.bullet}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Include body parts: "left knee pain" or "pain in my lower back"
              </Text>
            </View>
            <View style={styles.bullet}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Describe pain: "sharp stabbing pain" or "dull ache"
              </Text>
            </View>
            <View style={styles.bullet}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Use your own words - add custom words in the Dictionary tab
              </Text>
            </View>
          </View>

          <View style={styles.tipBox}>
            <Ionicons name="phone-portrait-outline" size={24} color={colors.accentPrimary} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>iOS: Allow explicit words</Text>
              <Text style={styles.tipText}>
                If voice input censors your words (like s***), go to Settings → General → Keyboard → Enable Dictation, then turn off "Enable Profanity Filter" (or re-enable Dictation to reset it).
              </Text>
            </View>
          </View>

          <Text style={styles.subheading}>Examples</Text>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleInput}>
              "Really bad headache behind my eyes, nauseous, exhausted"
            </Text>
            <Ionicons name="arrow-down" size={16} color={colors.textMuted} style={styles.exampleArrow} />
            <Text style={styles.exampleOutput}>
              Severe headache (behind eyes){'\n'}
              Nausea{'\n'}
              Fatigue
            </Text>
          </View>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleInput}>
              "Crashed yesterday after grocery shopping, 2/10 spoons today"
            </Text>
            <Ionicons name="arrow-down" size={16} color={colors.textMuted} style={styles.exampleArrow} />
            <Text style={styles.exampleOutput}>
              PEM (triggered by shopping){'\n'}
              Energy: 2/10 spoons
            </Text>
          </View>

          <Text style={styles.subheading}>Privacy & Data</Text>
          <Text style={styles.paragraph}>
            Everything stays on your device. RantTrack never sends your symptoms or entries to the cloud.
            No tracking, no ads, no analytics.
          </Text>

          <Text style={styles.subheading}>Download Your Data</Text>
          <Text style={styles.paragraph}>
            You can download all your symptom entries anytime from Settings → Your Data → Download Data.
          </Text>

          <View style={styles.bulletList}>
            <View style={styles.bullet}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: '600' }}>Plain Text:</Text> Easy to read format, great for sharing with your doctor
              </Text>
            </View>
            <View style={styles.bullet}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: '600' }}>CSV:</Text> Opens in Excel or Google Sheets for analysis
              </Text>
            </View>
            <View style={styles.bullet}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={{ fontWeight: '600' }}>JSON:</Text> Full data backup with all symptom details
              </Text>
            </View>
          </View>

          <View style={styles.tipBox}>
            <Ionicons name="download-outline" size={24} color={colors.accentPrimary} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Your data, your control</Text>
              <Text style={styles.tipText}>
                Files are saved to your device. You can then share them however you like - email, cloud storage, or just keep them locally.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (typography: any, colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgElevated,
  },
  title: {
    ...typography.largeDisplay,
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  heading: {
    ...typography.largeHeader,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  subheading: {
    ...typography.header,
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 24,
  },
  tipBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    marginBottom: 24,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    ...typography.bodyMedium,
    color: colors.accentPrimary,
    marginBottom: 4,
  },
  tipText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...typography.bodyMedium,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  stepText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  bulletList: {
    gap: 12,
    marginBottom: 16,
  },
  bullet: {
    flexDirection: 'row',
    gap: 12,
  },
  bulletDot: {
    ...typography.body,
    color: colors.accentPrimary,
    width: 20,
  },
  bulletText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  exampleBox: {
    padding: 16,
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    marginBottom: 16,
  },
  exampleInput: {
    ...typography.body,
    color: colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  exampleArrow: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  exampleOutput: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
