/**
 * SymptomDetailEditor Component
 * Unified accessible modal for editing all symptom details
 * One tap access to severity, time, duration, and trigger editing
 * WCAG AAA compliant with clear navigation for brain fog users
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  EditableSymptom,
  Severity,
  TimeOfDay,
  SymptomDuration,
  ActivityTrigger,
  SYMPTOM_DISPLAY_NAMES,
  SEVERITY_COLORS,
  formatActivityTrigger,
  formatSymptomDuration,
  formatTimeOfDay,
  withOpacity,
} from '../types';
import { useTheme, useTypography, useTouchTargetSize, useAccessibilitySettings } from '../contexts/AccessibilityContext';
import { TOUCH_TARGET_SPACING } from '../constants/accessibility';
import { SeverityPicker } from './SeverityPicker';
import { TimeOfDayPicker } from './TimeOfDayPicker';
import { DurationPicker } from './DurationPicker';
import { TriggerPicker } from './TriggerPicker';

interface SymptomDetailEditorProps {
  visible: boolean;
  symptom: EditableSymptom;
  onUpdate: (updates: Partial<EditableSymptom>) => void;
  onDismiss: () => void;
}

type EditingField = 'severity' | 'timeOfDay' | 'duration' | 'trigger' | null;

export function SymptomDetailEditor({
  visible,
  symptom,
  onUpdate,
  onDismiss,
}: SymptomDetailEditorProps) {
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const [editingField, setEditingField] = useState<EditingField>(null);

  const displayName = SYMPTOM_DISPLAY_NAMES[symptom.symptom] || symptom.symptom;

  // Handle updates from sub-pickers
  const handleSeverityChange = (severity: Severity | null) => {
    onUpdate({ severity });
    setEditingField(null);
  };

  const handleTimeOfDayChange = (timeOfDay: TimeOfDay | null) => {
    onUpdate({ timeOfDay: timeOfDay || undefined });
    setEditingField(null);
  };

  const handleDurationChange = (duration: SymptomDuration | null) => {
    onUpdate({ duration: duration || undefined });
    setEditingField(null);
  };

  const handleTriggerChange = (trigger: ActivityTrigger | null) => {
    onUpdate({ trigger: trigger || undefined });
    setEditingField(null);
  };

  // Get display values for each field
  const severityDisplay = symptom.severity || 'Not set';
  const timeOfDayDisplay = symptom.timeOfDay
    ? formatTimeOfDay(symptom.timeOfDay)
    : 'Not set';
  const durationDisplay = symptom.duration
    ? formatSymptomDuration(symptom.duration)
    : 'Not set';
  const triggerDisplay = symptom.trigger
    ? formatActivityTrigger(symptom.trigger)
    : 'Not set';

  return (
    <>
      <Modal
        visible={visible && editingField === null}
        transparent
        animationType={reducedMotion ? 'none' : 'fade'}
        onRequestClose={onDismiss}
        accessibilityViewIsModal={true}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onDismiss}
          accessible={true}
          accessibilityLabel="Close symptom editor"
          accessibilityHint="Tap outside to close"
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
            accessible={true}
            accessibilityLabel={`Edit details for ${displayName}`}
          >
            <Text style={styles.title} accessibilityRole="header">
              Edit Symptom
            </Text>
            <Text style={styles.symptomName}>{displayName}</Text>

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {/* Severity */}
              <TouchableOpacity
                style={[styles.fieldRow, { minHeight: touchTargetSize }]}
                onPress={() => setEditingField('severity')}
                accessible={true}
                accessibilityLabel={`Severity: ${severityDisplay}. Tap to change.`}
                accessibilityRole="button"
              >
                <View style={styles.fieldInfo}>
                  <View style={styles.fieldHeader}>
                    <View
                      style={[
                        styles.fieldIcon,
                        {
                          backgroundColor: symptom.severity
                            ? withOpacity(SEVERITY_COLORS[symptom.severity], 0.2)
                            : colors.bgElevated,
                        },
                      ]}
                    >
                      <Ionicons
                        name="thermometer-outline"
                        size={18}
                        color={
                          symptom.severity
                            ? SEVERITY_COLORS[symptom.severity]
                            : colors.textMuted
                        }
                      />
                    </View>
                    <Text style={styles.fieldLabel}>Severity</Text>
                  </View>
                  <Text
                    style={[
                      styles.fieldValue,
                      !symptom.severity && styles.fieldValueEmpty,
                    ]}
                  >
                    {severityDisplay}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Time of Day */}
              <TouchableOpacity
                style={[styles.fieldRow, { minHeight: touchTargetSize }]}
                onPress={() => setEditingField('timeOfDay')}
                accessible={true}
                accessibilityLabel={`Time of day: ${timeOfDayDisplay}. Tap to change.`}
                accessibilityRole="button"
              >
                <View style={styles.fieldInfo}>
                  <View style={styles.fieldHeader}>
                    <View
                      style={[
                        styles.fieldIcon,
                        {
                          backgroundColor: symptom.timeOfDay
                            ? colors.accentLight
                            : colors.bgElevated,
                        },
                      ]}
                    >
                      <Ionicons
                        name="time-outline"
                        size={18}
                        color={symptom.timeOfDay ? colors.accentPrimary : colors.textMuted}
                      />
                    </View>
                    <Text style={styles.fieldLabel}>Time of Day</Text>
                  </View>
                  <Text
                    style={[
                      styles.fieldValue,
                      !symptom.timeOfDay && styles.fieldValueEmpty,
                    ]}
                  >
                    {timeOfDayDisplay}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Duration */}
              <TouchableOpacity
                style={[styles.fieldRow, { minHeight: touchTargetSize }]}
                onPress={() => setEditingField('duration')}
                accessible={true}
                accessibilityLabel={`Duration: ${durationDisplay}. Tap to change.`}
                accessibilityRole="button"
              >
                <View style={styles.fieldInfo}>
                  <View style={styles.fieldHeader}>
                    <View
                      style={[
                        styles.fieldIcon,
                        {
                          backgroundColor: symptom.duration
                            ? colors.accentLight
                            : colors.bgElevated,
                        },
                      ]}
                    >
                      <Ionicons
                        name="hourglass-outline"
                        size={18}
                        color={symptom.duration ? colors.accentPrimary : colors.textMuted}
                      />
                    </View>
                    <Text style={styles.fieldLabel}>Duration</Text>
                  </View>
                  <Text
                    style={[
                      styles.fieldValue,
                      !symptom.duration && styles.fieldValueEmpty,
                    ]}
                  >
                    {durationDisplay}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Trigger */}
              <TouchableOpacity
                style={[styles.fieldRow, { minHeight: touchTargetSize }]}
                onPress={() => setEditingField('trigger')}
                accessible={true}
                accessibilityLabel={`Trigger: ${triggerDisplay}. Tap to change.`}
                accessibilityRole="button"
              >
                <View style={styles.fieldInfo}>
                  <View style={styles.fieldHeader}>
                    <View
                      style={[
                        styles.fieldIcon,
                        {
                          backgroundColor: symptom.trigger
                            ? colors.accentLight
                            : colors.bgElevated,
                        },
                      ]}
                    >
                      <Ionicons
                        name="flash-outline"
                        size={18}
                        color={symptom.trigger ? colors.accentPrimary : colors.textMuted}
                      />
                    </View>
                    <Text style={styles.fieldLabel}>Trigger</Text>
                  </View>
                  <Text
                    style={[
                      styles.fieldValue,
                      !symptom.trigger && styles.fieldValueEmpty,
                    ]}
                  >
                    {triggerDisplay}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={[styles.doneButton, { minHeight: touchTargetSize }]}
              onPress={onDismiss}
              accessible={true}
              accessibilityLabel="Done editing"
              accessibilityRole="button"
            >
              <Ionicons name="checkmark" size={20} color={colors.bgPrimary} />
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sub-pickers */}
      <SeverityPicker
        visible={editingField === 'severity'}
        symptomName={displayName}
        currentSeverity={symptom.severity || null}
        onSelect={handleSeverityChange}
        onDismiss={() => setEditingField(null)}
      />

      <TimeOfDayPicker
        visible={editingField === 'timeOfDay'}
        symptomName={displayName}
        currentTimeOfDay={symptom.timeOfDay || null}
        onSelect={handleTimeOfDayChange}
        onDismiss={() => setEditingField(null)}
      />

      <DurationPicker
        visible={editingField === 'duration'}
        symptomName={displayName}
        currentDuration={symptom.duration || null}
        onSelect={handleDurationChange}
        onDismiss={() => setEditingField(null)}
      />

      <TriggerPicker
        visible={editingField === 'trigger'}
        symptomName={displayName}
        currentTrigger={symptom.trigger || null}
        onSelect={handleTriggerChange}
        onDismiss={() => setEditingField(null)}
      />
    </>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.bgSecondary,
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
    },
    title: {
      ...typography.largeHeader,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 4,
    },
    symptomName: {
      ...typography.body,
      color: colors.accentPrimary,
      textAlign: 'center',
      marginBottom: 20,
    },
    scrollView: {
      maxHeight: 350,
    },
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgElevated,
      padding: 16,
      borderRadius: 12,
      marginBottom: TOUCH_TARGET_SPACING,
    },
    fieldInfo: {
      flex: 1,
      gap: 6,
    },
    fieldHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    fieldIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fieldLabel: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
    },
    fieldValue: {
      ...typography.small,
      color: colors.textSecondary,
      marginLeft: 42,
      textTransform: 'capitalize',
    },
    fieldValueEmpty: {
      color: colors.textMuted,
      fontStyle: 'italic',
    },
    doneButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentPrimary,
      padding: 16,
      borderRadius: 12,
      gap: 8,
      marginTop: 8,
    },
    doneButtonText: {
      ...typography.bodyMedium,
      color: colors.bgPrimary,
    },
  });
