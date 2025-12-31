/**
 * QuickAddEntryScreen - Add symptoms for a specific date
 * Used when tapping a day in the calendar view
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useTypography, useTouchTargetSize } from '../contexts/AccessibilityContext';
import { EditableSymptom, Severity } from '../types';
import { saveRantEntry } from '../database/operations';
import { SymptomChip } from '../components/SymptomChip';
import { SeverityPicker } from '../components/SeverityPicker';
import { AddSymptomModal } from '../components/AddSymptomModal';
import { darkTheme } from '../theme/colors';

type RootStackParamList = {
  QuickAddEntry: {
    date: Date;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'QuickAddEntry'>;

export function QuickAddEntryScreen({ route, navigation }: Props) {
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();
  const styles = useMemo(() => createStyles(typography), [typography]);
  const { date } = route.params;
  const [symptoms, setSymptoms] = useState<EditableSymptom[]>([]);
  const [notes, setNotes] = useState('');
  const [showAddSymptom, setShowAddSymptom] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState<EditableSymptom | null>(null);
  const [showSeverityPicker, setShowSeverityPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const formatDate = () => {
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) return 'Today';

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleAddSymptom = (symptom: EditableSymptom) => {
    setSymptoms([...symptoms, symptom]);
    setShowAddSymptom(false);
  };

  const handleEditSymptom = (symptom: EditableSymptom) => {
    setEditingSymptom(symptom);
    setShowSeverityPicker(true);
  };

  const handleUpdateSeverity = (severity: Severity | null) => {
    if (editingSymptom) {
      setSymptoms(
        symptoms.map((s) =>
          s === editingSymptom ? { ...s, severity } : s
        )
      );
    }
    setShowSeverityPicker(false);
    setEditingSymptom(null);
  };

  const handleDeleteSymptom = (symptom: EditableSymptom) => {
    setSymptoms(symptoms.filter((s) => s !== symptom));
  };

  const handleSave = async () => {
    if (symptoms.length === 0) {
      Alert.alert('No symptoms', 'Please add at least one symptom');
      return;
    }

    setIsSaving(true);
    try {
      // Create timestamp for the selected date at noon
      const timestamp = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12,
        0,
        0
      ).getTime();

      const entryText = notes || `Entry for ${formatDate()}`;
      await saveRantEntry(entryText, symptoms, timestamp);

      Alert.alert('Success', 'Entry saved!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Failed to save entry:', error);
      Alert.alert('Error', 'Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { minHeight: touchTargetSize, minWidth: touchTargetSize }]}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>Quick entry</Text>
            <Text style={styles.date}>{formatDate()}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Symptoms Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Symptoms</Text>
            {symptoms.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{symptoms.length}</Text>
              </View>
            )}
          </View>

          {symptoms.length > 0 && (
            <View style={styles.symptomChipsContainer}>
              {symptoms.map((symptom, index) => (
                <SymptomChip
                  key={index}
                  symptom={symptom}
                  editable
                  onEdit={() => handleEditSymptom(symptom)}
                  onDelete={() => handleDeleteSymptom(symptom)}
                />
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.addButton, { minHeight: touchTargetSize }]}
            onPress={() => setShowAddSymptom(true)}
          >
            <Ionicons name="add" size={18} color={colors.accentPrimary} />
            <Text style={styles.addButtonText}>Add symptom</Text>
          </TouchableOpacity>
        </View>

        {/* Quick note (optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notes (optional)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional context about this day..."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.secondaryButton, { minHeight: touchTargetSize }]} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, { minHeight: touchTargetSize }, (symptoms.length === 0 || isSaving) && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={symptoms.length === 0 || isSaving}
        >
          <Text style={styles.primaryButtonText}>
            {isSaving ? 'Saving...' : 'Save entry'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <AddSymptomModal
        visible={showAddSymptom}
        existingSymptoms={symptoms.map(s => s.symptom)}
        onAdd={handleAddSymptom}
        onDismiss={() => setShowAddSymptom(false)}
      />

      {editingSymptom && (
        <SeverityPicker
          visible={showSeverityPicker}
          symptomName={editingSymptom.symptom}
          currentSeverity={editingSymptom.severity || null}
          onSelect={handleUpdateSeverity}
          onDismiss={() => {
            setShowSeverityPicker(false);
            setEditingSymptom(null);
          }}
        />
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: darkTheme.bgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...typography.largeDisplay,
    color: darkTheme.textPrimary,
  },
  date: {
    ...typography.small,
    color: darkTheme.textSecondary,
    marginTop: 4,
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionLabel: {
    ...typography.caption,
    fontFamily: 'DMSans_500Medium',
    color: darkTheme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: darkTheme.bgElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    ...typography.caption,
    color: darkTheme.textPrimary,
    fontFamily: 'DMSans_500Medium',
  },
  symptomChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkTheme.bgSecondary,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  addButtonText: {
    ...typography.small,
    color: darkTheme.accentPrimary,
    fontFamily: 'DMSans_500Medium',
  },
  notesInput: {
    backgroundColor: darkTheme.bgElevated,
    borderRadius: 12,
    padding: 14,
    ...typography.small,
    color: darkTheme.textPrimary,
    minHeight: 100,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: darkTheme.bgElevated,
  },
  primaryButton: {
    flex: 2,
    backgroundColor: darkTheme.accentPrimary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.button,
    color: darkTheme.bgPrimary,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: darkTheme.bgElevated,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...typography.button,
    color: darkTheme.textPrimary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
