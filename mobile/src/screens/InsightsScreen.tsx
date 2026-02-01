/**
 * Insights Screen - Monthly summary and statistics
 * Shows patterns, trends, and top symptoms for the selected period
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, useTypography } from '../contexts/AccessibilityContext';
import { getAllRantEntries } from '../database/operations';
import { RantEntry } from '../types/index';
import {
  getMonthSummary,
  generateSummaryText,
  calculateSymptomFrequency,
  filterEntriesByDateRange,
  numberToSeverity,
} from '../utils/trendAnalysis';
import { getDateRangeForPeriod, getMonthName, startOfMonth, endOfMonth } from '../utils/dateUtils';
import { TimePeriod, MonthSummary } from '../types/insights';
import { StatsRow } from '../components/charts/StatCard';
import SymptomGrid from '../components/charts/SymptomGrid';
import { getSeverityColor } from '../types/index';

export default function InsightsScreen() {
  const colors = useTheme();
  const typography = useTypography();

  const [entries, setEntries] = useState<RantEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<TimePeriod>('30d');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  // Load entries on mount
  useEffect(() => {
    loadEntries();
  }, []);

  // Reload entries when screen is focused (e.g. after adding an entry on another tab)
  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  const loadEntries = async () => {
    try {
      setLoading(true);
      const allEntries = await getAllRantEntries();
      setEntries(allEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary data
  const summary: MonthSummary = useMemo(() => {
    if (period === '30d' || period === 'all') {
      return getMonthSummary(entries, selectedMonth);
    } else {
      // For 7d and 90d, filter entries and create summary
      const dateRange = getDateRangeForPeriod(period);
      const filteredEntries = filterEntriesByDateRange(entries, dateRange);
      return getMonthSummary(filteredEntries, selectedMonth);
    }
  }, [entries, period, selectedMonth]);

  // Get top symptoms
  const topSymptoms = useMemo(() => {
    if (period === '30d' || period === 'all') {
      const monthEntries = entries.filter((e) =>
        e.timestamp >= startOfMonth(selectedMonth).getTime() &&
        e.timestamp <= endOfMonth(selectedMonth).getTime()
      );
      return calculateSymptomFrequency(monthEntries);
    } else {
      const dateRange = getDateRangeForPeriod(period);
      const filteredEntries = filterEntriesByDateRange(entries, dateRange);
      return calculateSymptomFrequency(filteredEntries);
    }
  }, [entries, period, selectedMonth]);

  // Generate summary text
  const summaryText = useMemo(() => {
    return generateSummaryText(summary);
  }, [summary]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.accentPrimary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Summary</Text>
          <Text style={styles.headerSubtitle}>
            {getMonthName(selectedMonth)} {selectedMonth.getFullYear()}
          </Text>
        </View>

      {/* Period selector - for future enhancement */}
      {/* <View style={styles.periodSelector}>
        <PeriodTab label="7 days" active={period === '7d'} onPress={() => setPeriod('7d')} />
        <PeriodTab label="30 days" active={period === '30d'} onPress={() => setPeriod('30d')} />
        <PeriodTab label="90 days" active={period === '90d'} onPress={() => setPeriod('90d')} />
      </View> */}

      {summary.totalEntries === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Summary Card */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>This Month</Text>
            <Text style={styles.summaryText}>{summaryText}</Text>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{summary.totalEntries}</Text>
                <Text style={styles.statLabel}>ENTRIES</Text>
              </View>
              <View style={styles.statCard}>
                <Text
                  style={[
                    styles.statValue,
                    { color: getSeverityColor(numberToSeverity(summary.avgSeverity)) },
                  ]}
                >
                  {summary.avgSeverity.toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>AVG SCORE</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: colors.severityGood }]}>
                  {summary.goodDays}
                </Text>
                <Text style={styles.statLabel}>GOOD DAYS</Text>
              </View>
            </View>
          </View>

          {/* Severity Distribution */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Severity Distribution</Text>
            <StatsRow
              stats={[
                {
                  label: 'Good Days',
                  value: summary.goodDays,
                  color: colors.severityGood,
                },
                {
                  label: 'Moderate',
                  value: summary.moderateDays,
                  color: colors.severityModerate,
                },
                {
                  label: 'Rough Days',
                  value: summary.roughDays,
                  color: colors.severityRough,
                },
              ]}
            />
          </View>

          {/* Top Symptoms */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Symptoms</Text>
            </View>
            <SymptomGrid symptoms={topSymptoms} maxItems={6} />
          </View>

          {/* Placeholder for future insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Patterns</Text>
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderText}>
                Pattern detection coming soon. We'll analyze your entries to identify
                triggers, time-of-day trends, and weekly cycles.
              </Text>
            </View>
          </View>
        </>
      )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyState() {
  const colors = useTheme();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Not enough data yet</Text>
      <Text style={styles.emptyText}>
        Keep logging entries and we'll show patterns and insights soon. Even a few entries
        per week can reveal helpful trends.
      </Text>
    </View>
  );
}

function createStyles(colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>) {
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
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.md + 5,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl + 20,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      marginBottom: spacing.lg + 4,
      marginTop: spacing.sm,
    },
    headerTitle: {
      ...typography.largeDisplay,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    headerSubtitle: {
      ...typography.sectionHeader,
      color: colors.textSecondary,
      textTransform: 'none',
      letterSpacing: 0,
    },
    summaryCard: {
      backgroundColor: colors.bgSecondary,
      borderRadius: 20,
      padding: spacing.lg,
      marginBottom: spacing.lg + 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    summaryTitle: {
      ...typography.largeHeader,
      color: colors.accentPrimary,
      marginBottom: spacing.md,
    },
    summaryText: {
      ...typography.body,
      color: colors.textPrimary,
      lineHeight: (typography?.body?.fontSize || 15) * 1.6,
      marginBottom: spacing.lg,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: spacing.sm + 2,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.bgPrimary,
      borderRadius: 16,
      paddingVertical: spacing.md + 2,
      paddingHorizontal: spacing.sm,
      alignItems: 'center',
      minHeight: spacing.xl * 3,
      justifyContent: 'center',
    },
    statValue: {
      fontFamily: 'DMSerifDisplay_400Regular',
      fontSize: (typography?.largeHeader?.fontSize || 22) + 4,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
    },
    statLabel: {
      fontSize: (typography?.caption?.fontSize || 12) - 1,
      color: colors.textMuted,
      fontFamily: 'DMSans_500Medium',
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      textAlign: 'center',
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sectionTitle: {
      fontSize: (typography?.caption?.fontSize || 12) + 1,
      color: colors.textSecondary,
      fontFamily: 'DMSans_500Medium',
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      marginBottom: spacing.md,
    },
    placeholderCard: {
      backgroundColor: colors.bgSecondary,
      borderRadius: 16,
      padding: spacing.lg,
      borderWidth: 1.5,
      borderColor: colors.bgElevated,
      borderStyle: 'dashed',
    },
    placeholderText: {
      ...typography.small,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: (typography?.small?.fontSize || 13) * 1.5,
    },
    emptyState: {
      backgroundColor: colors.bgSecondary,
      borderRadius: 24,
      padding: spacing.xl + 10,
      alignItems: 'center',
      marginTop: spacing.xl * 2,
      marginBottom: spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 2,
    },
    emptyTitle: {
      ...typography.largeHeader,
      color: colors.textPrimary,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    emptyText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: (typography?.body?.fontSize || 15) * 1.5,
      maxWidth: 300,
    },
  });
}
