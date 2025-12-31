/**
 * MonthScreen - Calendar month view with daily entries
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useTypography, useTouchTargetSize } from '../contexts/AccessibilityContext';
import { getAllRantEntries } from '../database/operations';
import { RantEntry, SYMPTOM_DISPLAY_NAMES, SEVERITY_COLORS } from '../types';
import type { MonthStackParamList } from '../types/navigation';
import { darkTheme } from '../theme/colors';

type Props = NativeStackScreenProps<MonthStackParamList, 'MonthView'>;

interface CalendarDay {
  day: number;
  severity?: 'good' | 'moderate' | 'rough' | 'none';
  isToday?: boolean;
}

export function MonthScreen({ navigation }: Props) {
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();
  const styles = useMemo(() => createStyles(typography), [typography]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<RantEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [selectedDayEntries, setSelectedDayEntries] = useState<RantEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, [currentDate]);

  // Reload entries when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [currentDate])
  );

  const loadEntries = async () => {
    try {
      const allEntries = await getAllRantEntries();
      setEntries(allEntries);

      // Filter entries for selected day
      updateSelectedDayEntries(allEntries, selectedDay);
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  };

  const updateSelectedDayEntries = (allEntries: RantEntry[], day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dayStart = new Date(year, month, day).getTime();
    const dayEnd = dayStart + 86400000;

    const dayEntries = allEntries.filter(entry =>
      entry.timestamp >= dayStart && entry.timestamp < dayEnd
    );
    setSelectedDayEntries(dayEntries);
  };

  const handleDayPress = (day: number) => {
    // Update selected day for visual feedback
    setSelectedDay(day);
    updateSelectedDayEntries(entries, day);
  };

  const handleAddEntryForSelectedDay = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const selectedDate = new Date(year, month, selectedDay);

    navigation.navigate('QuickAddEntry', { date: selectedDate });
  };

  const getMonthName = () => {
    return currentDate.toLocaleDateString('en-US', { month: 'long' });
  };

  const getCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Add empty days for padding
    for (let i = 0; i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1); i++) {
      days.push({ day: 0 });
    }

    // Add actual days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === today.getDate() &&
                     month === today.getMonth() &&
                     year === today.getFullYear();

      // Calculate severity from entries for this day
      const dayStart = new Date(year, month, day).getTime();
      const dayEnd = dayStart + 86400000;
      const dayEntries = entries.filter(entry =>
        entry.timestamp >= dayStart && entry.timestamp < dayEnd
      );

      let severity: 'good' | 'moderate' | 'rough' | 'none' | undefined;
      if (dayEntries.length > 0) {
        // Get worst severity from all entries on this day
        const hasSevere = dayEntries.some(entry => getEntrySeverity(entry) === 'severe');
        const hasModerate = dayEntries.some(entry => getEntrySeverity(entry) === 'moderate');

        if (hasSevere) {
          severity = 'rough';
        } else if (hasModerate) {
          severity = 'moderate';
        } else {
          severity = 'good';
        }
      }

      days.push({ day, isToday, severity });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);

    // Reset selected day to today if viewing current month, otherwise day 1
    const today = new Date();
    if (newDate.getMonth() === today.getMonth() && newDate.getFullYear() === today.getFullYear()) {
      setSelectedDay(today.getDate());
    } else {
      setSelectedDay(1);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEntrySeverity = (entry: RantEntry): 'mild' | 'moderate' | 'severe' => {
    // Calculate overall severity from symptoms
    const severities = entry.symptoms
      .map(s => s.severity)
      .filter((s): s is 'mild' | 'moderate' | 'severe' => s !== null && s !== undefined);

    if (severities.length === 0) return 'moderate';

    if (severities.includes('severe')) return 'severe';
    if (severities.includes('moderate')) return 'moderate';
    return 'mild';
  };

  const getSeverityColor = (severity: 'mild' | 'moderate' | 'severe') => {
    return SEVERITY_COLORS[severity] || colors.textMuted;
  };

  const getSeverityDotColor = (severity?: 'good' | 'moderate' | 'rough' | 'none') => {
    if (!severity) return 'transparent';
    switch (severity) {
      case 'good': return colors.severityGood;
      case 'moderate': return colors.severityModerate;
      case 'rough': return colors.severityRough;
      case 'none': return colors.severityNone;
      default: return 'transparent';
    }
  };

  const calendarDays = getCalendarDays();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Navigation Header */}
        <View style={styles.navHeader}>
          <TouchableOpacity
            onPress={() => navigateMonth('prev')}
            style={[styles.navArrow, { minHeight: touchTargetSize, minWidth: touchTargetSize }]}
          >
            <Ionicons name="chevron-back" size={24} color={colors.textMuted} />
          </TouchableOpacity>
          <Text style={styles.monthTitle}>{getMonthName()}</Text>
          <TouchableOpacity
            onPress={() => navigateMonth('next')}
            style={[styles.navArrow, { minHeight: touchTargetSize, minWidth: touchTargetSize }]}
          >
            <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          <View style={styles.weekdayRow}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <Text key={i} style={styles.weekdayLabel}>{day}</Text>
            ))}
          </View>
          <View style={styles.calendarGrid}>
            {calendarDays.map((dayData, i) => (
              <View key={i} style={styles.dayCell}>
                {dayData.day > 0 && (
                  <TouchableOpacity
                    onPress={() => handleDayPress(dayData.day)}
                    style={[
                      styles.dayCircle,
                      dayData.isToday && styles.dayCircleToday,
                      selectedDay === dayData.day && styles.dayCircleSelected
                    ]}
                  >
                    <Text style={[
                      styles.dayNumber,
                      selectedDay === dayData.day && styles.dayNumberSelected
                    ]}>{dayData.day}</Text>
                    {dayData.severity && (
                      <View style={[
                        styles.severityDot,
                        { backgroundColor: getSeverityDotColor(dayData.severity) }
                      ]} />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Selected Day's Entries */}
        <View style={styles.entriesSection}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>
              {selectedDay === new Date().getDate() &&
               currentDate.getMonth() === new Date().getMonth() &&
               currentDate.getFullYear() === new Date().getFullYear()
                ? "Today's Entries"
                : `Entries for ${currentDate.toLocaleDateString('en-US', { month: 'long' })} ${selectedDay}`}
            </Text>
            <TouchableOpacity
              style={[styles.addEntryButton, { minHeight: touchTargetSize }]}
              onPress={handleAddEntryForSelectedDay}
            >
              <Ionicons name="add" size={18} color={colors.accentPrimary} />
              <Text style={styles.addEntryText}>Add</Text>
            </TouchableOpacity>
          </View>
          {selectedDayEntries.length === 0 ? (
            <TouchableOpacity
              style={[styles.emptyAddButton, { minHeight: touchTargetSize }]}
              onPress={handleAddEntryForSelectedDay}
            >
              <Ionicons name="heart" size={18} color={colors.accentPrimary} />
              <Text style={styles.emptyAddText}>How were you feeling?</Text>
            </TouchableOpacity>
          ) : (
            selectedDayEntries.map((entry) => (
              <View
                key={entry.id}
                style={[
                  styles.entryCard,
                  { borderLeftColor: getSeverityColor(getEntrySeverity(entry)) }
                ]}
              >
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTime}>{formatTime(entry.timestamp)}</Text>
                  <Text style={[
                    styles.entrySeverity,
                    { color: getSeverityColor(getEntrySeverity(entry)) }
                  ]}>
                    {getEntrySeverity(entry)}
                  </Text>
                </View>
                <Text style={styles.entryText} numberOfLines={2}>
                  "{entry.text}"
                </Text>
                {entry.symptoms.length > 0 && (
                  <View style={styles.symptomChips}>
                    {entry.symptoms.slice(0, 3).map((symptom, index) => (
                      <View key={`${entry.id}-${index}`} style={styles.symptomChip}>
                        <Text style={styles.symptomChipText}>
                          {SYMPTOM_DISPLAY_NAMES[symptom.symptom] || symptom.symptom}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (typography: ReturnType<typeof useTypography>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.bgPrimary,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  navArrow: {
    padding: 8,
  },
  monthTitle: {
    ...typography.largeDisplay,
    color: darkTheme.textPrimary,
  },
  calendarContainer: {
    marginBottom: 20,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: darkTheme.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  dayCircle: {
    flex: 1,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleToday: {
    backgroundColor: darkTheme.bgElevated,
    borderWidth: 2,
    borderColor: darkTheme.accentPrimary,
  },
  dayCircleSelected: {
    backgroundColor: darkTheme.accentPrimary,
  },
  dayNumber: {
    ...typography.small,
    color: darkTheme.textPrimary,
  },
  dayNumberSelected: {
    color: darkTheme.bgPrimary,
    fontFamily: 'DMSans_700Bold',
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 3,
  },
  entriesSection: {
    marginTop: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    ...typography.sectionHeader,
    color: darkTheme.textPrimary,
    textTransform: 'none',
    marginBottom: 0,
  },
  addEntryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  addEntryText: {
    ...typography.small,
    color: darkTheme.accentPrimary,
    fontFamily: 'DMSans_500Medium',
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkTheme.bgSecondary,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginTop: 8,
  },
  emptyAddText: {
    ...typography.small,
    color: darkTheme.accentPrimary,
    fontFamily: 'DMSans_500Medium',
  },
  entryCard: {
    backgroundColor: darkTheme.bgSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryTime: {
    ...typography.small,
    color: darkTheme.textSecondary,
  },
  entrySeverity: {
    ...typography.small,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'capitalize',
  },
  entryText: {
    ...typography.small,
    color: darkTheme.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  symptomChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  symptomChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: darkTheme.bgElevated,
  },
  symptomChipText: {
    ...typography.caption,
    color: darkTheme.textPrimary,
    fontFamily: 'DMSans_500Medium',
  },
});
