/**
 * QuickCheckInModal
 * Fast symptom logging for low-energy days
 * Minimal taps, large touch targets, no typing required
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COMMON_SYMPTOMS, COMMON_SYMPTOM_LABELS, COMMON_SYMPTOM_ICONS, CommonSymptom } from '../constants/commonSymptoms';
import { saveRantEntry } from '../database/operations';
import type { ExtractedSymptom, Severity } from '../types';
import { useTheme, useTypography, useTouchTargetSize } from '../contexts/AccessibilityContext';
import { darkTheme } from '../theme/colors';
import { typography as baseTypography } from '../theme/typography';

interface QuickCheckInModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: () => void;
}

interface SelectedSymptom {
  symptom: CommonSymptom;
  severity: Severity;
}

export function QuickCheckInModal({ visible, onClose, onSave }: QuickCheckInModalProps) {
  const colors = useTheme();
  const typography = useTypography();
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedSymptom[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const touchTargetSize = useTouchTargetSize();

  const handleSymptomToggle = (symptom: CommonSymptom) => {
    const existingIndex = selectedSymptoms.findIndex((s) => s.symptom === symptom);

    if (existingIndex >= 0) {
      // Cycle through severities: mild → moderate → severe → remove
      const current = selectedSymptoms[existingIndex];
      const newSeverity: Severity | null =
        current.severity === 'mild'
          ? 'moderate'
          : current.severity === 'moderate'
          ? 'severe'
          : null;

      if (newSeverity) {
        const updated = [...selectedSymptoms];
        updated[existingIndex] = { symptom, severity: newSeverity };
        setSelectedSymptoms(updated);
      } else {
        // Remove symptom
        setSelectedSymptoms(selectedSymptoms.filter((s) => s.symptom !== symptom));
      }
    } else {
      // Add with mild severity
      setSelectedSymptoms([...selectedSymptoms, { symptom, severity: 'mild' }]);
    }
  };

  const handleSave = async () => {
    if (selectedSymptoms.length === 0) {
      Alert.alert('No Symptoms', 'Please select at least one symptom');
      return;
    }

    try {
      setIsSaving(true);

      // Convert to ExtractedSymptom format
      const extractedSymptoms: ExtractedSymptom[] = selectedSymptoms.map((s) => ({
        symptom: s.symptom,
        matched: COMMON_SYMPTOM_LABELS[s.symptom],
        method: 'quick_checkin' as const,
        severity: s.severity,
      }));

      // Generate simple text summary
      const text = `Quick check-in: ${selectedSymptoms.map((s) => `${COMMON_SYMPTOM_LABELS[s.symptom]} (${s.severity})`).join(', ')}`;

      await saveRantEntry(text, extractedSymptoms);

      Alert.alert('Saved!', 'Your check-in has been saved');
      setSelectedSymptoms([]);
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save quick check-in:', error);
      Alert.alert('Error', 'Failed to save check-in');
    } finally {
      setIsSaving(false);
    }
  };

  const getSelected = (symptom: CommonSymptom): SelectedSymptom | undefined => {
    return selectedSymptoms.find((s) => s.symptom === symptom);
  };

  const getSeverityColor = (severity: Severity): string => {
    switch (severity) {
      case 'mild':
        return colors.severityGood;
      case 'moderate':
        return colors.severityModerate;
      case 'severe':
        return colors.severityRough;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Quick Check-In</Text>
          <Text style={styles.subtitle}>Tap symptoms to log. Tap again to adjust severity.</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.grid}>
            {COMMON_SYMPTOMS.map((symptom) => {
              const selected = getSelected(symptom);
              const isSelected = !!selected;

              return (
                <TouchableOpacity
                  key={symptom}
                  style={[
                    styles.symptomButton,
                    { minHeight: touchTargetSize, minWidth: touchTargetSize },
                    isSelected && {
                      backgroundColor: getSeverityColor(selected.severity),
                      borderColor: getSeverityColor(selected.severity),
                    },
                  ]}
                  onPress={() => handleSymptomToggle(symptom)}
                >
                  <Ionicons
                    name={COMMON_SYMPTOM_ICONS[symptom] as any}
                    size={24}
                    color={isSelected ? colors.bgPrimary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.symptomLabel,
                      isSelected && styles.symptomLabelSelected,
                    ]}
                  >
                    {COMMON_SYMPTOM_LABELS[symptom]}
                  </Text>
                  {isSelected && (
                    <Text style={styles.severityBadge}>{selected.severity}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              { minHeight: touchTargetSize },
              selectedSymptoms.length === 0 && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSaving || selectedSymptoms.length === 0}
          >
            <Text
              style={[
                styles.saveButtonText,
                selectedSymptoms.length === 0 && styles.saveButtonTextDisabled,
              ]}
            >
              {isSaving ? 'Saving...' : `Save (${selectedSymptoms.length})`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.bgPrimary,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.bgElevated,
  },
  title: {
    ...baseTypography.largeDisplay,
    color: darkTheme.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...baseTypography.body,
    color: darkTheme.textSecondary,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  symptomButton: {
    width: '47%',
    backgroundColor: darkTheme.bgElevated,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: darkTheme.bgElevated,
  },
  symptomLabel: {
    ...baseTypography.bodyMedium,
    color: darkTheme.textPrimary,
    textAlign: 'center',
  },
  symptomLabelSelected: {
    color: darkTheme.bgPrimary,
  },
  severityBadge: {
    ...baseTypography.caption,
    color: darkTheme.bgPrimary,
    opacity: 0.8,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: darkTheme.bgElevated,
  },
  saveButton: {
    backgroundColor: darkTheme.accentPrimary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: darkTheme.bgElevated,
    opacity: 0.5,
  },
  saveButtonText: {
    ...baseTypography.button,
    color: darkTheme.bgPrimary,
  },
  saveButtonTextDisabled: {
    color: darkTheme.textMuted,
  },
});
