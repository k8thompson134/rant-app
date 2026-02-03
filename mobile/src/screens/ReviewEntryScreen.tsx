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
import {
  EditableSymptom,
  ExtractedSymptom,
  SYMPTOM_DISPLAY_NAMES,
  formatActivityTrigger,
  formatSymptomDuration,
  formatTimeOfDay,
  getSeverityColor,
} from '../types';
import { saveRantEntry } from '../database/operations';
import { SymptomChip } from '../components/SymptomChip';
import { SymptomDetailEditor } from '../components/SymptomDetailEditor';
import { AddSymptomModal } from '../components/AddSymptomModal';
import { SpoonCountDisplay } from '../components/SpoonCountDisplay';
import { useTouchTargetSize, useTheme, useTypography } from '../contexts/AccessibilityContext';
import { TOUCH_TARGET_SPACING } from '../constants/accessibility';

type Props = NativeStackScreenProps<HomeStackParamList, 'ReviewEntry'>;

export function ReviewEntryScreen({ route, navigation }: Props) {
  const { rantText, extractionResult } = route.params;
  const touchTargetSize = useTouchTargetSize();
  const colors = useTheme();
  const typography = useTypography();

  // Create dynamic styles based on current typography and theme
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

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

  const handleEditSymptom = (symptomId: string) => {
    setEditingSymptomId(symptomId);
  };

  const handleSymptomUpdate = (updates: Partial<EditableSymptom>) => {
    if (editingSymptomId) {
      setSymptoms((prev) =>
        prev.map((s) => (s.id === editingSymptomId ? { ...s, ...updates } : s))
      );
    }
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

        {/* Spoon Count Display */}
        {extractionResult.spoonCount && (
          <SpoonCountDisplay spoonCount={extractionResult.spoonCount} />
        )}

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
                const severityColor = getSeverityColor(symptom.severity, colors);

                // Build context info (trigger, duration, recovery, timeOfDay)
                const contextParts: string[] = [];
                if (symptom.trigger) contextParts.push(formatActivityTrigger(symptom.trigger));
                if (symptom.duration) contextParts.push(formatSymptomDuration(symptom.duration));
                // Add recovery time if available
                if (symptom.duration?.recoveryTime) {
                  const recoveryText = formatSymptomDuration(symptom.duration.recoveryTime);
                  if (recoveryText) {
                    contextParts.push(`recovers ${recoveryText}`);
                  }
                }
                if (symptom.timeOfDay) contextParts.push(formatTimeOfDay(symptom.timeOfDay));
                const contextText = contextParts.join(' · ');

                return (
                  <View key={symptom.id} style={styles.topSymptomItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={symptom.severity ? severityColor : colors.accentPrimary}
                    />
                    <View style={styles.topSymptomTextContainer}>
                      <Text style={styles.topSymptomText}>
                        {displayName}
                        {painLocation && <Text style={styles.painDetailText}> ({painLocation})</Text>}
                        {painQualifiers && <Text style={styles.painDetailText}> - {painQualifiers}</Text>}
                        {symptom.severity && (
                          <Text style={[styles.severityText, { color: severityColor }]}> · {symptom.severity}</Text>
                        )}
                      </Text>
                      {contextText.length > 0 && (
                        <Text style={styles.contextText}>{contextText}</Text>
                      )}
                    </View>
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
          accessibilityLabel={
            extractionResult.spoonCount
              ? `Looks good - Save entry with ${extractionResult.spoonCount.current} spoons, ${extractionResult.spoonCount.energyLevel} out of 10 energy`
              : 'Looks good - Save entry'
          }
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
                      onEdit={() => handleEditSymptom(symptom.id!)}
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
        <SymptomDetailEditor
          visible={editingSymptomId !== null}
          symptom={editingSymptom}
          onUpdate={handleSymptomUpdate}
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

const createStyles = (colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
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
    color: colors.textPrimary,
  },
  date: {
    ...typography.sectionHeader,
    color: colors.textSecondary,
  },
  // Quick Summary Card
  summaryCard: {
    backgroundColor: colors.accentLight,
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.accentPrimary + '20',
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
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topSymptomsContainer: {
    gap: 10,
    marginBottom: 12,
  },
  tapToEditHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  topSymptomItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  topSymptomTextContainer: {
    flex: 1,
  },
  topSymptomText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  contextText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  severityText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  painDetailText: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  moreSymptoms: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Quick Save Button - Large and Prominent
  quickSaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentPrimary,
    padding: 18,
    borderRadius: 16,
    gap: 10,
  },
  quickSaveButtonText: {
    ...typography.largeHeader,
    color: colors.bgPrimary,
  },
  // Edit Details Toggle
  editToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSecondary,
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  editToggleText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  // Collapsible Edit Section
  card: {
    backgroundColor: colors.bgSecondary,
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
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    backgroundColor: colors.bgElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textPrimary,
    fontFamily: 'DMSans_500Medium',
  },
  textInput: {
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    padding: 14,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  symptomChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'flex-start',
  },
  emptyText: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.textMuted,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
    gap: 6,
  },
  addButtonIcon: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  addButtonText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  reRecordButton: {
    backgroundColor: colors.bgElevated,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reRecordButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
