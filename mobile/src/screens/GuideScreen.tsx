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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useTypography } from '../contexts/AccessibilityContext';
import { withOpacity } from '../types';

export function GuideScreen() {
  const colors = useTheme();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(typography, colors), [typography, colors]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Guide</Text>
        <Text style={styles.subtitle}>Learn how to use RantTrack</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Start Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Start</Text>
          <Text style={styles.cardBody}>
            RantTrack helps you track symptoms using your voice or typing - no forms, no checkboxes.
          </Text>

          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={28} color={colors.accentPrimary} />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Just talk naturally</Text>
              <Text style={styles.tipText}>
                Say things like "bad headache today" or "exhausted, brain fog, knee pain"
              </Text>
            </View>
          </View>
        </View>

        {/* How It Works Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>

          <View style={styles.card}>
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
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips for Better Recognition</Text>

          <View style={styles.card}>
            <View style={styles.bulletList}>
              <View style={styles.bullet}>
                <View style={[styles.bulletDot, { backgroundColor: colors.accentPrimary }]} />
                <Text style={styles.bulletText}>
                  Mention severity: "mild headache" or "severe pain"
                </Text>
              </View>
              <View style={styles.bullet}>
                <View style={[styles.bulletDot, { backgroundColor: colors.accentPrimary }]} />
                <Text style={styles.bulletText}>
                  Include body parts: "left knee pain" or "pain in my lower back"
                </Text>
              </View>
              <View style={styles.bullet}>
                <View style={[styles.bulletDot, { backgroundColor: colors.accentPrimary }]} />
                <Text style={styles.bulletText}>
                  Describe pain: "sharp stabbing pain" or "dull ache"
                </Text>
              </View>
              <View style={styles.bullet}>
                <View style={[styles.bulletDot, { backgroundColor: colors.accentPrimary }]} />
                <Text style={styles.bulletText}>
                  Use your own words - add custom words in the Dictionary tab
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.importantTip}>
            <View style={styles.importantTipHeader}>
              <Ionicons name="phone-portrait-outline" size={24} color={colors.accentPrimary} />
              <Text style={styles.importantTipTitle}>iOS: Allow explicit words</Text>
            </View>
            <Text style={styles.importantTipText}>
              If voice input censors your words (like s***), go to Settings → General → Keyboard → Enable Dictation, then turn off "Enable Profanity Filter" (or re-enable Dictation to reset it).
            </Text>
          </View>
        </View>

        {/* Examples Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Examples</Text>

          <View style={styles.exampleCard}>
            <View style={styles.exampleHeader}>
              <Ionicons name="chatbox-ellipses-outline" size={20} color={colors.accentPrimary} />
              <Text style={styles.exampleLabel}>You say:</Text>
            </View>
            <Text style={styles.exampleInput}>
              "Really bad headache behind my eyes, nauseous, exhausted"
            </Text>
            <View style={styles.exampleDivider}>
              <Ionicons name="arrow-down" size={20} color={colors.textMuted} />
            </View>
            <View style={styles.exampleHeader}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.severityGood} />
              <Text style={styles.exampleLabel}>RantTrack detects:</Text>
            </View>
            <View style={styles.exampleOutput}>
              <Text style={styles.exampleSymptom}>• Severe headache (behind eyes)</Text>
              <Text style={styles.exampleSymptom}>• Nausea</Text>
              <Text style={styles.exampleSymptom}>• Fatigue</Text>
            </View>
          </View>

          <View style={styles.exampleCard}>
            <View style={styles.exampleHeader}>
              <Ionicons name="chatbox-ellipses-outline" size={20} color={colors.accentPrimary} />
              <Text style={styles.exampleLabel}>You say:</Text>
            </View>
            <Text style={styles.exampleInput}>
              "Crashed yesterday after grocery shopping, 2/10 spoons today"
            </Text>
            <View style={styles.exampleDivider}>
              <Ionicons name="arrow-down" size={20} color={colors.textMuted} />
            </View>
            <View style={styles.exampleHeader}>
              <Ionicons name="checkmark-circle-outline" size={20} color={colors.severityGood} />
              <Text style={styles.exampleLabel}>RantTrack detects:</Text>
            </View>
            <View style={styles.exampleOutput}>
              <Text style={styles.exampleSymptom}>• PEM (triggered by shopping)</Text>
              <Text style={styles.exampleSymptom}>• Energy: 2/10 spoons</Text>
            </View>
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Data</Text>

          <View style={styles.card}>
            <View style={styles.privacyIconRow}>
              <View style={styles.privacyIcon}>
                <Ionicons name="shield-checkmark" size={32} color={colors.severityGood} />
              </View>
              <View style={styles.privacyIcon}>
                <Ionicons name="eye-off" size={32} color={colors.severityGood} />
              </View>
              <View style={styles.privacyIcon}>
                <Ionicons name="cloud-offline" size={32} color={colors.severityGood} />
              </View>
            </View>
            <Text style={styles.cardBody}>
              Everything stays on your device. RantTrack never sends your symptoms or entries to the cloud.
              No tracking, no ads, no analytics.
            </Text>
          </View>
        </View>

        {/* Download Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Download Your Data</Text>

          <View style={styles.card}>
            <Text style={styles.cardBody}>
              You can download all your symptom entries anytime from Settings → Your Data → Download Data.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bullet}>
                <View style={[styles.bulletDot, { backgroundColor: colors.symptomTeal }]} />
                <View style={styles.bulletContent}>
                  <Text style={styles.bulletTitle}>Plain Text</Text>
                  <Text style={styles.bulletText}>
                    Easy to read format, great for sharing with your doctor
                  </Text>
                </View>
              </View>
              <View style={styles.bullet}>
                <View style={[styles.bulletDot, { backgroundColor: colors.symptomTeal }]} />
                <View style={styles.bulletContent}>
                  <Text style={styles.bulletTitle}>CSV</Text>
                  <Text style={styles.bulletText}>
                    Opens in Excel or Google Sheets for analysis
                  </Text>
                </View>
              </View>
              <View style={styles.bullet}>
                <View style={[styles.bulletDot, { backgroundColor: colors.symptomTeal }]} />
                <View style={styles.bulletContent}>
                  <Text style={styles.bulletTitle}>JSON</Text>
                  <Text style={styles.bulletText}>
                    Full data backup with all symptom details
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footerTip}>
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
    </SafeAreaView>
  );
}

const createStyles = (typography: ReturnType<typeof useTypography>, colors: ReturnType<typeof useTheme>) => {
  // Calculate responsive spacing based on font scale
  const baseUnit = typography?.body?.fontSize || 15;
  const spacing = {
    xs: Math.round(baseUnit * 0.4),  // ~6
    sm: Math.round(baseUnit * 0.6),  // ~9
    md: Math.round(baseUnit * 1),    // ~15
    lg: Math.round(baseUnit * 1.5),  // ~22
    xl: Math.round(baseUnit * 2),    // ~30
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgPrimary,
      paddingTop: 40,
    },
    header: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
    },
    title: {
      ...typography.largeDisplay,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.sectionHeader,
      color: colors.textSecondary,
      textTransform: 'none',
      letterSpacing: 0,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl + 20,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: (typography?.caption?.fontSize || 12) + 1,
      color: colors.textSecondary,
      fontFamily: 'DMSans_500Medium',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: spacing.md,
    },
    card: {
      backgroundColor: colors.bgSecondary,
      borderRadius: 20,
      padding: spacing.lg,
      marginBottom: spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    cardTitle: {
      ...typography.largeHeader,
      color: colors.accentPrimary,
      marginBottom: spacing.md,
    },
    cardBody: {
      ...typography.body,
      color: colors.textPrimary,
      lineHeight: (typography?.body?.fontSize || 15) * 1.6,
      marginBottom: spacing.lg,
    },
    tipBox: {
      flexDirection: 'row',
      gap: spacing.md,
      padding: spacing.lg,
      backgroundColor: colors.accentLight,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: withOpacity(colors.accentPrimary, 0.12),
    },
    tipContent: {
      flex: 1,
    },
    tipTitle: {
      ...typography.bodyMedium,
      color: colors.accentPrimary,
      marginBottom: spacing.xs,
    },
    tipText: {
      ...typography.body,
      color: colors.textPrimary,
      lineHeight: (typography?.body?.fontSize || 15) * 1.5,
    },
    importantTip: {
      backgroundColor: colors.bgSecondary,
      borderRadius: 16,
      padding: spacing.lg,
      borderLeftWidth: 4,
      borderLeftColor: colors.accentPrimary,
    },
    importantTipHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    importantTipTitle: {
      ...typography.bodyMedium,
      color: colors.accentPrimary,
      flex: 1,
    },
    importantTipText: {
      ...typography.small,
      color: colors.textSecondary,
      lineHeight: (typography?.small?.fontSize || 13) * 1.6,
    },
    step: {
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    stepNumber: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: withOpacity(colors.accentPrimary, 0.19),
    },
    stepNumberText: {
      fontSize: (typography?.header?.fontSize || 18) + 2,
      fontFamily: 'DMSerifDisplay_400Regular',
      fontWeight: '600',
    },
    stepContent: {
      flex: 1,
      justifyContent: 'center',
    },
    stepTitle: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    stepText: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: (typography?.body?.fontSize || 15) * 1.5,
    },
    bulletList: {
      gap: spacing.md + 4,
    },
    bullet: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'flex-start',
    },
    bulletDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginTop: spacing.xs + 2,
    },
    bulletContent: {
      flex: 1,
    },
    bulletTitle: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    bulletText: {
      ...typography.body,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: (typography?.body?.fontSize || 15) * 1.5,
    },
    exampleCard: {
      backgroundColor: colors.bgSecondary,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1.5,
      borderColor: colors.bgElevated,
    },
    exampleHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    exampleLabel: {
      ...typography.caption,
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      fontWeight: '600',
    },
    exampleInput: {
      ...typography.body,
      color: colors.textPrimary,
      fontStyle: 'italic',
      lineHeight: (typography?.body?.fontSize || 15) * 1.5,
      paddingVertical: spacing.sm,
    },
    exampleDivider: {
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    exampleOutput: {
      backgroundColor: colors.bgPrimary,
      borderRadius: 12,
      padding: spacing.md,
      gap: spacing.xs,
    },
    exampleSymptom: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: (typography?.body?.fontSize || 15) * 1.5,
    },
    privacyIconRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: spacing.lg,
      paddingVertical: spacing.sm,
    },
    privacyIcon: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    footerTip: {
      flexDirection: 'row',
      gap: spacing.md,
      padding: spacing.lg,
      backgroundColor: colors.bgElevated,
      borderRadius: 16,
    },
  });
};
