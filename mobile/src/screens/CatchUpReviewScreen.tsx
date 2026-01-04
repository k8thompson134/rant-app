/**
 * CatchUpReviewScreen - Multi-day review
 *
 * Shows symptoms organized by day in a vertical card layout.
 * Users can:
 * - Edit text for each day (tap to edit)
 * - Add new symptoms to specific days
 * - Remove symptoms from days
 * - Add new days with date picker
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  EditableSymptom,
  SpoonCount,
  SYMPTOM_DISPLAY_NAMES,
  getSeverityColor,
  getSeverityBackgroundColor,
  formatActivityTrigger,
  formatSymptomDuration,
  formatTimeOfDay,
} from '../types';
import type { HomeStackParamList, DayEntry } from '../types/navigation';
import { AddSymptomModal } from '../components/AddSymptomModal';
import { SymptomDetailEditor } from '../components/SymptomDetailEditor';
import { SpoonCountDisplay } from '../components/SpoonCountDisplay';
import { useTheme, useTypography, useTouchTargetSize } from '../contexts/AccessibilityContext';

type CatchUpReviewScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'CatchUpReview'>;
type CatchUpReviewScreenRouteProp = RouteProp<HomeStackParamList, 'CatchUpReview'>;

interface DayColumn extends DayEntry {
  id: string;
}


export default function CatchUpReviewScreen() {
  const navigation = useNavigation<CatchUpReviewScreenNavigationProp>();
  const route = useRoute<CatchUpReviewScreenRouteProp>();
  const { dayEntries: initialEntries } = route.params;
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();

  // Memoize styles with theme tokens
  const styles = useMemo(() => createStyles(colors, typography, touchTargetSize), [colors, typography, touchTargetSize]);

  // Add unique IDs to each day
  const [days, setDays] = useState<DayColumn[]>(
    initialEntries.map((entry, index) => ({
      ...entry,
      id: `day-${index}`,
    }))
  );

  const [editingText, setEditingText] = useState<{ [key: string]: string }>({});
  const [showAddSymptomModal, setShowAddSymptomModal] = useState(false);
  const [selectedSymptomDay, setSelectedSymptomDay] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickedDate, setPickedDate] = useState(new Date());
  const [editingSymptomId, setEditingSymptomId] = useState<string | null>(null);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);

  const handleRemoveSymptom = (dayId: string, symptomIndex: number) => {
    setDays((prevDays) =>
      prevDays.map((day) =>
        day.id === dayId
          ? { ...day, symptoms: day.symptoms.filter((_, i) => i !== symptomIndex) }
          : day
      )
    );
  };

  const handleTextEdit = (dayId: string, newText: string) => {
    setEditingText((prev) => ({ ...prev, [dayId]: newText }));
  };

  const handleTextSave = (dayId: string) => {
    const newText = editingText[dayId];
    if (newText !== undefined) {
      setDays((prevDays) =>
        prevDays.map((day) =>
          day.id === dayId ? { ...day, text: newText } : day
        )
      );
      setEditingText((prev) => {
        const updated = { ...prev };
        delete updated[dayId];
        return updated;
      });
    }
  };

  const handleAddSymptom = (dayId: string) => {
    setSelectedSymptomDay(dayId);
    setShowAddSymptomModal(true);
  };

  const handleSymptomAdd = (symptom: EditableSymptom) => {
    if (selectedSymptomDay) {
      setDays((prevDays) =>
        prevDays.map((day) =>
          day.id === selectedSymptomDay
            ? { ...day, symptoms: [...day.symptoms, symptom] }
            : day
        )
      );
      setShowAddSymptomModal(false);
      setSelectedSymptomDay(null);
    }
  };

  const handleSymptomPress = (dayId: string, symptomId: string) => {
    setEditingDayId(dayId);
    setEditingSymptomId(symptomId);
  };

  const handleSymptomUpdate = (updates: Partial<EditableSymptom>) => {
    if (!editingDayId || !editingSymptomId) return;

    setDays((prevDays) =>
      prevDays.map((day) =>
        day.id === editingDayId
          ? {
              ...day,
              symptoms: day.symptoms.map((s) =>
                s.id === editingSymptomId ? { ...s, ...updates } : s
              ),
            }
          : day
      )
    );
  };

  // Get list of symptoms already added to the selected day
  const selectedDaySymptoms = selectedSymptomDay
    ? days.find((d) => d.id === selectedSymptomDay)?.symptoms.map((s) => s.symptom) || []
    : [];

  // Find the editing symptom
  const editingDay = days.find((d) => d.id === editingDayId);
  const editingSymptom = editingDay?.symptoms.find((s) => s.id === editingSymptomId) as EditableSymptom | undefined;

  const handleAddNewDay = () => {
    setPickedDate(new Date());
    setShowDatePicker(true);
  };


  const handleDatePickerConfirm = () => {
    setShowDatePicker(false);
    const newDay: DayColumn = {
      id: `day-${days.length}`,
      timestamp: pickedDate.getTime(),
      dateString: pickedDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
      text: '',
      symptoms: [],
      explicit: true,
    };
    setDays([...days, newDay]);
  };

  const handleSaveAll = async () => {
    try {
      const { saveRantEntry } = await import('../database/operations');

      // Save each day's entry
      for (const day of days) {
        await saveRantEntry(day.text, day.symptoms, day.timestamp);
      }

      Alert.alert(
        'Saved!',
        `Successfully saved ${days.length} ${days.length === 1 ? 'entry' : 'entries'}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to home, clearing the stack
              navigation.navigate('HomeInput');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving entries:', error);
      Alert.alert('Save Error', 'Failed to save entries. Please try again.');
    }
  };


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Review & Edit</Text>
        <TouchableOpacity onPress={handleSaveAll} style={styles.saveHeaderButton}>
          <Text style={styles.saveHeaderButtonText}>Save All</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsText}>
          Review and edit each day's entry.
        </Text>
      </View>

        {/* Day cards - vertical scroll */}
        <ScrollView
          style={styles.verticalScroll}
          contentContainerStyle={styles.verticalScrollContent}
          showsVerticalScrollIndicator={true}
        >
          {days.map((day, dayIndex) => {
            const isEditing = editingText[day.id] !== undefined;
            const displayText = isEditing ? editingText[day.id] : day.text;

            return (
              <View key={day.id} style={styles.dayCard}>
                {/* Day header */}
                <View style={styles.dayCardHeader}>
                  <View>
                    <Text style={styles.dayCardDate}>{day.dateString}</Text>
                    <Text style={styles.dayCardIndex}>
                      Day {dayIndex + 1} of {days.length}
                    </Text>
                  </View>
                  {!day.explicit && (
                    <View style={styles.inferredBadge}>
                      <Text style={styles.inferredText}>Inferred</Text>
                    </View>
                  )}
                </View>

                {/* Text entry */}
                <View style={styles.textSection}>
                  <Text style={styles.sectionLabel}>What you said:</Text>
                  {isEditing ? (
                    <View>
                      <TextInput
                        style={styles.textInput}
                        value={displayText}
                        onChangeText={(text) => handleTextEdit(day.id, text)}
                        multiline
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.saveTextButton}
                        onPress={() => handleTextSave(day.id)}
                      >
                        <Text style={styles.saveTextButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => handleTextEdit(day.id, day.text)}>
                      <Text style={styles.textDisplay}>{displayText}</Text>
                      <Text style={styles.editHint}>Tap to edit</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Symptoms */}
                <View style={styles.symptomsSection}>
                  <View style={styles.symptomsSectionHeader}>
                    <Text style={styles.sectionLabel}>
                      Symptoms ({day.symptoms.length}):
                    </Text>
                    <TouchableOpacity
                      style={styles.addSymptomBtn}
                      onPress={() => handleAddSymptom(day.id)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Add symptom to this day"
                    >
                      <Ionicons name="add" size={20} color={colors.accentPrimary} />
                    </TouchableOpacity>
                  </View>

                  {day.symptoms.length === 0 ? (
                    <Text style={styles.emptyText}>No symptoms yet</Text>
                  ) : (
                    <View style={styles.symptomsList}>
                      {day.symptoms.map((symptom, symptomIndex) => {
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
                            key={`${day.id}-symptom-${symptomIndex}`}
                            style={[styles.symptomChip, { backgroundColor: symptomBgColor }]}
                            onPress={() => handleSymptomPress(day.id, symptom.id!)}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel={`Edit ${displayName}${painLocation ? ` in ${painLocation}` : ''}`}
                            accessibilityHint="Tap to edit symptom details"
                          >
                            <View style={styles.symptomContent}>
                              <View style={styles.symptomMainRow}>
                                <Text style={[styles.symptomText, { color: symptomSeverityColor }]}>
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
                            </View>
                            <TouchableOpacity
                              style={styles.removeSymptomBtn}
                              onPress={(e) => {
                                e.stopPropagation();
                                handleRemoveSymptom(day.id, symptomIndex);
                              }}
                              accessible={true}
                              accessibilityRole="button"
                              accessibilityLabel={`Remove ${displayName}`}
                            >
                              <Ionicons name="close" size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* Spoon Count */}
                {day.spoonCount && (
                  <View style={styles.spoonSection}>
                    <SpoonCountDisplay spoonCount={day.spoonCount} compact />
                  </View>
                )}
              </View>
            );
          })}

          {/* Add new day card */}
          <View style={styles.addNewDayCard}>
            <TouchableOpacity
              style={styles.addNewDayButton}
              onPress={handleAddNewDay}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Add a new day"
              accessibilityHint="Creates a new day entry for today"
            >
              <Ionicons name="add-circle-outline" size={48} color={colors.accentPrimary} />
              <Text style={styles.addNewDayText}>Add Day</Text>
            </TouchableOpacity>
          </View>

          {/* Spacing for bottom action */}
          <View style={styles.bottomSpacing} />
        </ScrollView>

      {/* Bottom action */}
      <View style={styles.bottomAction}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveAll}>
          <Text style={styles.saveButtonText}>Save All Entries</Text>
        </TouchableOpacity>
      </View>

      {/* Add Symptom Modal */}
      <AddSymptomModal
        visible={showAddSymptomModal}
        existingSymptoms={selectedDaySymptoms}
        onAdd={handleSymptomAdd}
        onDismiss={() => {
          setShowAddSymptomModal(false);
          setSelectedSymptomDay(null);
        }}
      />

      {/* Symptom Detail Editor */}
      {editingSymptom && (
        <SymptomDetailEditor
          visible={editingSymptomId !== null}
          symptom={editingSymptom}
          onUpdate={handleSymptomUpdate}
          onDismiss={() => {
            setEditingSymptomId(null);
            setEditingDayId(null);
          }}
        />
      )}

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <SafeAreaView style={styles.datePickerContainer}>
          <View style={styles.datePickerHeader}>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Text style={styles.datePickerButtonText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.datePickerTitle}>Select Date</Text>
            <TouchableOpacity onPress={handleDatePickerConfirm}>
              <Text style={styles.datePickerButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.datePickerContent} contentContainerStyle={styles.datePickerScrollContent}>
            <Text style={styles.datePickerInstructions}>
              Tap a date to select it:
            </Text>

            {/* Month/Year navigation */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity
                style={styles.monthNavButton}
                onPress={() => setPickedDate(new Date(pickedDate.getFullYear(), pickedDate.getMonth() - 1, 1))}
              >
                <Text style={styles.monthNavButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.monthYearText}>
                {pickedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity
                style={styles.monthNavButton}
                onPress={() => setPickedDate(new Date(pickedDate.getFullYear(), pickedDate.getMonth() + 1, 1))}
              >
                <Text style={styles.monthNavButtonText}>→</Text>
              </TouchableOpacity>
            </View>

            {/* Day names header */}
            <View style={styles.weekDaysHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <Text key={day} style={styles.weekDayName}>{day}</Text>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.calendarGrid}>
              {(() => {
                const firstDay = new Date(pickedDate.getFullYear(), pickedDate.getMonth(), 1);
                const lastDay = new Date(pickedDate.getFullYear(), pickedDate.getMonth() + 1, 0);
                const daysInMonth = lastDay.getDate();
                const startingDayOfWeek = firstDay.getDay();
                const days = [];

                // Empty cells for days before month starts
                for (let i = 0; i < startingDayOfWeek; i++) {
                  days.push(null);
                }

                // Days of the month
                for (let day = 1; day <= daysInMonth; day++) {
                  days.push(day);
                }

                return days.map((day, index) => {
                  if (day === null) {
                    return <View key={`empty-${index}`} style={styles.calendarDay} />;
                  }

                  const dateForDay = new Date(pickedDate.getFullYear(), pickedDate.getMonth(), day);
                  const isSelected =
                    day === pickedDate.getDate() &&
                    dateForDay.getMonth() === pickedDate.getMonth() &&
                    dateForDay.getFullYear() === pickedDate.getFullYear();

                  return (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.calendarDay,
                        isSelected && styles.calendarDaySelected,
                      ]}
                      onPress={() => setPickedDate(new Date(pickedDate.getFullYear(), pickedDate.getMonth(), day))}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${dateForDay.toLocaleDateString('en-US')}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Text style={[
                        styles.calendarDayText,
                        isSelected && styles.calendarDayTextSelected,
                      ]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                });
              })()}
            </View>

            <Text style={styles.datePickerHelper}>
              Selected: {pickedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/**
 * createStyles - Generates styles using theme tokens and accessibility settings
 */
const createStyles = (colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>, touchTargetSize: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSecondary,
  },
  backButton: {
    minWidth: touchTargetSize,
    minHeight: touchTargetSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    ...typography.largeDisplay,
    color: colors.textSecondary,
  },
  title: {
    ...typography.pageTitle,
    color: colors.textPrimary,
  },
  saveHeaderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: touchTargetSize,
    justifyContent: 'center',
  },
  saveHeaderButtonText: {
    ...typography.button,
    color: colors.accentPrimary,
  },
  instructions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSecondary,
  },
  instructionsText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  verticalScroll: {
    flex: 1,
  },
  verticalScrollContent: {
    padding: 20,
    gap: 16,
  },
  dayCard: {
    backgroundColor: colors.bgPrimary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.bgSecondary,
    overflow: 'hidden',
  },
  addNewDayCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  addNewDayButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: colors.accentPrimary,
    borderRadius: 16,
    borderStyle: 'dashed',
    minHeight: touchTargetSize,
  },
  addNewDayText: {
    ...typography.bodyMedium,
    color: colors.accentPrimary,
    marginTop: 12,
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSecondary,
  },
  dayCardDate: {
    ...typography.sectionHeader,
    color: colors.accentPrimary,
    marginBottom: 4,
  },
  dayCardIndex: {
    ...typography.small,
    color: colors.textMuted,
  },
  inferredBadge: {
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inferredText: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  textSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  sectionLabel: {
    ...typography.sectionHeader,
    color: colors.textMuted,
    marginBottom: 12,
  },
  textDisplay: {
    ...typography.body,
    color: colors.textPrimary,
    padding: 16,
    backgroundColor: colors.bgPrimary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.bgSecondary,
  },
  editHint: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  textInput: {
    ...typography.body,
    color: colors.textPrimary,
    padding: 16,
    backgroundColor: colors.bgPrimary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.accentPrimary,
    minHeight: 120,
  },
  saveTextButton: {
    marginTop: 12,
    backgroundColor: colors.accentPrimary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: touchTargetSize,
    justifyContent: 'center',
  },
  saveTextButtonText: {
    ...typography.button,
    color: colors.bgApp,
  },
  symptomsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: colors.bgSecondary,
  },
  symptomsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addSymptomBtn: {
    minWidth: touchTargetSize,
    minHeight: touchTargetSize,
    borderRadius: touchTargetSize / 2,
    backgroundColor: colors.bgPrimary,
    borderWidth: 1,
    borderColor: colors.accentPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  symptomsList: {
    gap: 8,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgPrimary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.bgSecondary,
    marginBottom: 8,
    minHeight: touchTargetSize,
  },
  symptomContent: {
    flex: 1,
  },
  symptomMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symptomText: {
    flex: 1,
    ...typography.body,
    fontFamily: 'DMSans_500Medium',
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
  removeSymptomBtn: {
    minWidth: touchTargetSize,
    minHeight: touchTargetSize,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  'severity-mild': {
    backgroundColor: colors.severityGood,
  },
  'severity-moderate': {
    backgroundColor: colors.severityModerate,
  },
  'severity-severe': {
    backgroundColor: colors.severityRough,
  },
  severityText: {
    ...typography.caption,
    color: colors.bgApp,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  spoonSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  bottomSpacing: {
    height: 20,
  },
  bottomAction: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.bgSecondary,
    backgroundColor: colors.bgApp,
  },
  saveButton: {
    backgroundColor: colors.accentPrimary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: touchTargetSize,
    justifyContent: 'center',
  },
  saveButtonText: {
    ...typography.button,
    color: colors.bgApp,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSecondary,
  },
  modalTitle: {
    ...typography.pageTitle,
    color: colors.textPrimary,
  },
  modalCloseText: {
    ...typography.button,
    color: colors.accentPrimary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalInstructions: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  // Date picker styles
  datePickerContainer: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgSecondary,
  },
  datePickerTitle: {
    ...typography.pageTitle,
    color: colors.textPrimary,
  },
  datePickerButtonText: {
    ...typography.button,
    color: colors.accentPrimary,
  },
  datePickerContent: {
    flex: 1,
  },
  datePickerScrollContent: {
    padding: 20,
  },
  datePickerInstructions: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  datePickerInput: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.bgPrimary,
    borderWidth: 1,
    borderColor: colors.bgSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  datePickerHelper: {
    ...typography.body,
    color: colors.accentPrimary,
    marginTop: 16,
    fontWeight: '600',
  },
  // Calendar picker styles
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  monthNavButton: {
    minWidth: touchTargetSize,
    minHeight: touchTargetSize,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bgPrimary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.bgSecondary,
  },
  monthNavButtonText: {
    ...typography.largeDisplay,
    color: colors.accentPrimary,
    fontSize: 20,
  },
  monthYearText: {
    ...typography.sectionHeader,
    color: colors.textPrimary,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  weekDayName: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
    width: '14.28%',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  calendarDaySelected: {
    backgroundColor: colors.accentPrimary,
    borderColor: colors.accentPrimary,
  },
  calendarDayText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  calendarDayTextSelected: {
    color: colors.bgApp,
    fontWeight: '700',
  },
});
