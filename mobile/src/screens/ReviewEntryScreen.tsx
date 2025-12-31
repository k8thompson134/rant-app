/**
 * ReviewEntryScreen
 * Review and edit extracted symptoms before saving
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../types/navigation';
import { EditableSymptom, ExtractedSymptom, Severity, SYMPTOM_DISPLAY_NAMES } from '../types';
import { saveRantEntry } from '../database/operations';
import { SymptomChip } from '../components/SymptomChip';
import { SeverityPicker } from '../components/SeverityPicker';
import { AddSymptomModal } from '../components/AddSymptomModal';
import { useTouchTargetSize, useTheme, useTypography } from '../contexts/AccessibilityContext';
import { TOUCH_TARGET_SPACING } from '../constants/accessibility';
import { darkTheme } from '../theme/colors';

type Props = NativeStackScreenProps<HomeStackParamList, 'ReviewEntry'>;

export function ReviewEntryScreen({ route, navigation }: Props) {
  const { rantText, extractionResult } = route.params;
  const touchTargetSize = useTouchTargetSize();
  const colors = useTheme();
  const typography = useTypography();

  // Create dynamic styles based on current typography
  const styles = useMemo(() => createStyles(typography), [typography]);

  // Convert extracted symptoms to editable format with IDs
  const [editedText, setEditedText] = useState(rantText);
  const [symptoms, setSymptoms] = useState<EditableSymptom[]>(() =>
    extractionResult.symptoms.map((s: ExtractedSymptom, idx: number) => ({
      ...s,
      id: s.id || `${s.symptom}_${idx}_${Date.now()}`,
      severity: s.severity || null,
    }))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [editingSymptomId, setEditingSymptomId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);

  const editingSymptom = symptoms.find((s) => s.id === editingSymptomId);

  const handleEditSeverity = (symptomId: string) => {
    setEditingSymptomId(symptomId);
  };

  const handleSeverityChange = (severity: Severity | null) => {
    if (editingSymptomId) {
      setSymptoms((prev) =>
        prev.map((s) => (s.id === editingSymptomId ? { ...s, severity } : s))
      );
    }
    setEditingSymptomId(null);
  };

  const handleDeleteSymptom = (symptomId: string) => {
    setSymptoms((prev) => prev.filter((s) => s.id !== symptomId));
  };

  const handleAddSymptom = (symptom: EditableSymptom) => {
    setSymptoms((prev) => [...prev, symptom]);
    setShowAddModal(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await saveRantEntry(editedText, symptoms);

      Alert.alert('Success', 'Entry saved successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('HomeInput'),
        },
      ]);
    } catch (error) {
      console.error('Failed to save entry:', error);
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReRecord = () => {
    Alert.alert(
      'Discard Changes?',
      'Are you sure you want to start over? Your current entry will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => navigation.navigate('HomeInput'),
        },
      ]
    );
  };

  const formatDate = (): string => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Review Your Entry</Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </View>

        {/* Quick Summary - All Symptoms */}
        {symptoms.length > 0 && (
          <TouchableOpacity
            style={styles.summaryCard}
            onPress={() => setShowEditDetails(true)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel={`Detected ${symptoms.length} symptoms. Tap to edit details.`}
            accessibilityRole="button"
          >
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Detected Symptoms ({symptoms.length})</Text>
              <Ionicons name="pencil" size={16} color={colors.textSecondary} />
            </View>
            <View style={styles.topSymptomsContainer}>
              {symptoms.map((symptom) => {
                const displayName = SYMPTOM_DISPLAY_NAMES[symptom.symptom] || symptom.symptom;
                const painQualifiers = symptom.painDetails?.qualifiers?.join(', ');
                const painLocation = symptom.painDetails?.location;

                return (
                  <View key={symptom.id} style={styles.topSymptomItem}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.accentPrimary} />
                    <Text style={styles.topSymptomText}>
                      {displayName}
                      {painLocation && <Text style={styles.painDetailText}> ({painLocation})</Text>}
                      {painQualifiers && <Text style={styles.painDetailText}> - {painQualifiers}</Text>}
                      {symptom.severity && <Text style={styles.severityText}> · {symptom.severity}</Text>}
                    </Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.tapToEditHint}>Tap to edit</Text>
          </TouchableOpacity>
        )}

        {/* Quick Save Button - Primary Action */}
        <TouchableOpacity
          style={[styles.quickSaveButton, { minHeight: touchTargetSize }, isSaving && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
          accessible={true}
          accessibilityLabel="Looks good - Save entry"
          accessibilityRole="button"
        >
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.bgPrimary} />
          <Text style={styles.quickSaveButtonText}>
            {isSaving ? 'Saving...' : 'Looks good - Save'}
          </Text>
        </TouchableOpacity>

        {/* Edit Details - Collapsible Section */}
        <TouchableOpacity
          style={[styles.editToggle, { minHeight: touchTargetSize }]}
          onPress={() => setShowEditDetails(!showEditDetails)}
          accessible={true}
          accessibilityLabel={showEditDetails ? 'Hide edit details' : 'Show edit details'}
          accessibilityRole="button"
        >
          <Ionicons
            name={showEditDetails ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSecondary}
          />
          <Text style={styles.editToggleText}>
            {showEditDetails ? 'Hide Details' : 'Edit Details'}
          </Text>
        </TouchableOpacity>

        {/* Expanded Edit Section */}
        {showEditDetails && (
          <>
            {/* Editable Rant Text */}
            <View style={styles.card}>
              <Text style={styles.sectionLabel}>Your Entry</Text>
              <TextInput
                style={styles.textInput}
                value={editedText}
                onChangeText={setEditedText}
                multiline
                placeholder="How are you feeling?"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* All Symptoms Section */}
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>All Symptoms</Text>
                {symptoms.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{symptoms.length}</Text>
                  </View>
                )}
              </View>

              {symptoms.length === 0 ? (
                <Text style={styles.emptyText}>
                  No symptoms detected yet. Tap "Add Symptom" to add manually.
                </Text>
              ) : (
                <View style={styles.symptomChipsContainer}>
                  {symptoms.map((symptom) => (
                    <SymptomChip
                      key={symptom.id}
                      symptom={symptom}
                      editable
                      onEdit={() => handleEditSeverity(symptom.id!)}
                      onDelete={() => handleDeleteSymptom(symptom.id!)}
                    />
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={[styles.addButton, { minHeight: touchTargetSize }]}
                onPress={() => setShowAddModal(true)}
                accessible={true}
                accessibilityLabel="Add symptom"
                accessibilityRole="button"
              >
                <Text style={styles.addButtonIcon}>+</Text>
                <Text style={styles.addButtonText}>Add Symptom</Text>
              </TouchableOpacity>
            </View>

            {/* Re-record Button */}
            <TouchableOpacity
              style={[styles.reRecordButton, { minHeight: touchTargetSize }]}
              onPress={handleReRecord}
              disabled={isSaving}
              accessible={true}
              accessibilityLabel="Discard and re-record"
              accessibilityRole="button"
            >
              <Text style={styles.reRecordButtonText}>Discard & Re-record</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Modals */}
      {editingSymptom && (
        <SeverityPicker
          visible={editingSymptomId !== null}
          symptomName={editingSymptom.symptom}
          currentSeverity={editingSymptom.severity || null}
          onSelect={handleSeverityChange}
          onDismiss={() => setEditingSymptomId(null)}
        />
      )}

      <AddSymptomModal
        visible={showAddModal}
        existingSymptoms={symptoms.map((s) => s.symptom)}
        onAdd={handleAddSymptom}
        onDismiss={() => setShowAddModal(false)}
      />
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
  },
  scrollContent: {
    padding: 20,
    gap: TOUCH_TARGET_SPACING,
  },
  header: {
    gap: 4,
    marginBottom: 8,
  },
  title: {
    ...typography.pageTitle,
    color: darkTheme.textPrimary,
  },
  date: {
    ...typography.sectionHeader,
    color: darkTheme.textSecondary,
  },
  // Quick Summary Card
  summaryCard: {
    backgroundColor: darkTheme.accentLight,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: darkTheme.accentPrimary + '20',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryTitle: {
    ...typography.caption,
    fontFamily: 'DMSans_500Medium',
    color: darkTheme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topSymptomsContainer: {
    gap: 10,
    marginBottom: 12,
  },
  tapToEditHint: {
    ...typography.caption,
    color: darkTheme.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  topSymptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topSymptomText: {
    ...typography.bodyMedium,
    color: darkTheme.textPrimary,
    flex: 1,
  },
  severityText: {
    ...typography.body,
    color: darkTheme.textSecondary,
  },
  painDetailText: {
    ...typography.caption,
    color: darkTheme.textMuted,
    fontStyle: 'italic',
  },
  moreSymptoms: {
    ...typography.small,
    color: darkTheme.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Quick Save Button - Large and Prominent
  quickSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkTheme.accentPrimary,
    padding: 18,
    borderRadius: 16,
    gap: 10,
  },
  quickSaveButtonText: {
    ...typography.largeHeader,
    color: darkTheme.bgPrimary,
  },
  // Edit Details Toggle
  editToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: darkTheme.bgSecondary,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  editToggleText: {
    ...typography.bodyMedium,
    color: darkTheme.textSecondary,
  },
  // Collapsible Edit Section
  card: {
    backgroundColor: darkTheme.bgSecondary,
    borderRadius: 16,
    padding: 16,
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
  textInput: {
    backgroundColor: darkTheme.bgElevated,
    borderRadius: 12,
    padding: 14,
    ...typography.body,
    color: darkTheme.textPrimary,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  symptomChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyText: {
    ...typography.small,
    color: darkTheme.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: darkTheme.textMuted,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 6,
  },
  addButtonIcon: {
    fontSize: 18,
    color: darkTheme.textSecondary,
  },
  addButtonText: {
    ...typography.small,
    color: darkTheme.textSecondary,
  },
  reRecordButton: {
    backgroundColor: darkTheme.bgElevated,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reRecordButtonText: {
    ...typography.button,
    color: darkTheme.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
