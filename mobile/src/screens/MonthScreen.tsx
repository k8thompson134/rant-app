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
import {
  RantEntry,
  EditableSymptom,
  SYMPTOM_DISPLAY_NAMES,
  getSeverityColor,
  getSeverityBackgroundColor,
  formatActivityTrigger,
  formatSymptomDuration,
  formatTimeOfDay,
} from '../types';
import { updateRantEntry } from '../database/operations';
import { SymptomDetailEditor } from '../components/SymptomDetailEditor';
import { AddSymptomModal } from '../components/AddSymptomModal';
import type { MonthStackParamList } from '../types/navigation';

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
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<RantEntry[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [selectedDayEntries, setSelectedDayEntries] = useState<RantEntry[]>([]);

  // Editing state
  const [editingEntry, setEditingEntry] = useState<RantEntry | null>(null);
  const [editingSymptomId, setEditingSymptomId] = useState<string | null>(null);
  const [showAddSymptomModal, setShowAddSymptomModal] = useState(false);

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

    // Pass timestamp instead of Date object for serialization
    navigation.navigate('QuickAddEntry', { dateTimestamp: selectedDate.getTime() });
  };

  // Handle symptom editing
  const handleSymptomPress = (entry: RantEntry, symptomId: string) => {
    setEditingEntry(entry);
    setEditingSymptomId(symptomId);
  };

  const handleSymptomUpdate = async (updates: Partial<EditableSymptom>) => {
    if (!editingEntry || !editingSymptomId) return;

    try {
      // Update the symptom in the entry
      const updatedSymptoms = editingEntry.symptoms.map(s =>
        s.id === editingSymptomId ? { ...s, ...updates } : s
      );

      // Save to database
      await updateRantEntry(editingEntry.id, editingEntry.text, updatedSymptoms);

      // Reload entries
      await loadEntries();
    } catch (error) {
      console.error('Failed to update symptom:', error);
    }
  };

  const handleAddSymptom = async (symptom: EditableSymptom) => {
    if (!editingEntry) return;

    try {
      // Add the new symptom to the entry
      const updatedSymptoms = [...editingEntry.symptoms, symptom];

      // Save to database
      await updateRantEntry(editingEntry.id, editingEntry.text, updatedSymptoms);

      // Reload entries
      await loadEntries();
      setShowAddSymptomModal(false);
    } catch (error) {
      console.error('Failed to add symptom:', error);
    }
  };

  const handleAddSymptomToEntry = (entry: RantEntry) => {
    setEditingEntry(entry);
    setShowAddSymptomModal(true);
  };

  const editingSymptom = editingEntry?.symptoms.find(s => s.id === editingSymptomId) as EditableSymptom | undefined;

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

  const getEntrySeverityColor = (severity: 'mild' | 'moderate' | 'severe') => {
    return getSeverityColor(severity, colors);
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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
            selectedDayEntries.map((entry) => {
              const entrySeverity = getEntrySeverity(entry);
              const severityColor = getEntrySeverityColor(entrySeverity);

              return (
                <View
                  key={entry.id}
                  style={[
                    styles.entryCard,
                    { borderLeftColor: severityColor }
                  ]}
                >
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryTime}>{formatTime(entry.timestamp)}</Text>
                    <Text style={[styles.entrySeverity, { color: severityColor }]}>
                      {entrySeverity}
                    </Text>
                  </View>
                  <Text style={styles.entryText} numberOfLines={2}>
                    "{entry.text}"
                  </Text>
                  {entry.symptoms.length > 0 ? (
                    <View style={styles.symptomsList}>
                      {entry.symptoms.map((symptom, index) => {
                        const symptomSeverityColor = getSeverityColor(symptom.severity, colors);
                        const symptomBgColor = getSeverityBackgroundColor(symptom.severity, colors);
                        const displayName = SYMPTOM_DISPLAY_NAMES[symptom.symptom] || symptom.symptom;

                        // Build context parts
                        const contextParts: string[] = [];
                        if (symptom.trigger) contextParts.push(formatActivityTrigger(symptom.trigger));
                        if (symptom.duration) contextParts.push(formatSymptomDuration(symptom.duration));
                        if (symptom.timeOfDay) contextParts.push(formatTimeOfDay(symptom.timeOfDay));
                        const contextText = contextParts.join(' · ');

                        // Pain location
                        const painLocation = symptom.painDetails?.location;

                        return (
                          <TouchableOpacity
                            key={`${entry.id}-${index}`}
                            style={[
                              styles.symptomItem,
                              { backgroundColor: symptomBgColor }
                            ]}
                            onPress={() => handleSymptomPress(entry, symptom.id!)}
                            accessible={true}
                            accessibilityLabel={`Edit ${displayName}${painLocation ? ` in ${painLocation}` : ''}`}
                            accessibilityRole="button"
                            accessibilityHint="Tap to edit symptom details"
                          >
                            <View style={styles.symptomMainRow}>
                              <Text style={[styles.symptomName, { color: symptomSeverityColor }]}>
                                {displayName}
                                {painLocation && (
                                  <Text style={styles.symptomLocation}> ({painLocation})</Text>
                                )}
                              </Text>
                              {symptom.severity && (
                                <Text style={[styles.symptomSeverityBadge, { color: symptomSeverityColor }]}>
                                  {symptom.severity}
                                </Text>
                              )}
                            </View>
                            {contextText.length > 0 && (
                              <Text style={styles.symptomContext}>{contextText}</Text>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : null}

                  {/* Add Symptom Button */}
                  <TouchableOpacity
                    style={[styles.addSymptomButton, { minHeight: touchTargetSize }]}
                    onPress={() => handleAddSymptomToEntry(entry)}
                    accessible={true}
                    accessibilityLabel="Add symptom to this entry"
                    accessibilityRole="button"
                  >
                    <Ionicons name="add-circle-outline" size={18} color={colors.accentPrimary} />
                    <Text style={styles.addSymptomText}>Add Symptom</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Modals */}
      {editingSymptom && (
        <SymptomDetailEditor
          visible={editingSymptomId !== null}
          symptom={editingSymptom}
          onUpdate={handleSymptomUpdate}
          onDismiss={() => setEditingSymptomId(null)}
        />
      )}

      <AddSymptomModal
        visible={showAddSymptomModal}
        existingSymptoms={editingEntry?.symptoms.map(s => s.symptom) || []}
        onAdd={handleAddSymptom}
        onDismiss={() => setShowAddSymptomModal(false)}
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    paddingTop: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 20,
  },
  navArrow: {
    padding: 8,
  },
  monthTitle: {
    ...typography.largeDisplay,
    color: colors.textPrimary,
  },
  calendarContainer: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
    ...typography.caption,
    color: colors.textMuted,
    fontFamily: 'DMSans_500Medium',
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
    backgroundColor: colors.bgElevated,
    borderWidth: 2,
    borderColor: colors.accentPrimary,
  },
  dayCircleSelected: {
    backgroundColor: colors.accentPrimary,
  },
  dayNumber: {
    ...typography.small,
    color: colors.textPrimary,
  },
  dayNumberSelected: {
    color: colors.bgPrimary,
    fontFamily: 'DMSans_700Bold',
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 3,
  },
  entriesSection: {
    marginTop: 0,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    ...typography.sectionHeader,
    color: colors.textPrimary,
    textTransform: 'none',
    marginBottom: 0,
    fontFamily: 'DMSans_500Medium',
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
    color: colors.accentPrimary,
    fontFamily: 'DMSans_500Medium',
  },
  emptyAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginTop: 8,
  },
  emptyAddText: {
    ...typography.small,
    color: colors.accentPrimary,
    fontFamily: 'DMSans_500Medium',
  },
  entryCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryTime: {
    ...typography.small,
    color: colors.textSecondary,
    fontFamily: 'DMSans_500Medium',
  },
  entrySeverity: {
    ...typography.small,
    fontFamily: 'DMSans_700Bold',
    textTransform: 'capitalize',
  },
  entryText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 14,
    fontStyle: 'italic',
  },
  symptomsList: {
    gap: 8,
    marginTop: 4,
  },
  symptomItem: {
    borderRadius: 10,
    padding: 10,
  },
  symptomMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symptomName: {
    ...typography.small,
    fontFamily: 'DMSans_500Medium',
    flex: 1,
  },
  symptomLocation: {
    ...typography.small,
    fontStyle: 'italic',
  },
  symptomSeverityBadge: {
    ...typography.caption,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'capitalize',
    marginLeft: 8,
  },
  symptomContext: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  addSymptomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.accentPrimary + '40',
    borderStyle: 'dashed',
  },
  addSymptomText: {
    ...typography.small,
    color: colors.accentPrimary,
    fontFamily: 'DMSans_500Medium',
  },
});
