/**
 * AddSymptomModal Component
 * Modal for manually adding symptoms with search/filter
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { EditableSymptom, Severity, SYMPTOM_DISPLAY_NAMES } from '../types';
import { SeverityPicker } from './SeverityPicker';
import { useTheme, useTypography, useTouchTargetSize } from '../contexts/AccessibilityContext';
import { TOUCH_TARGET_SPACING } from '../constants/accessibility';
import { typography as baseTypography } from '../theme/typography';

interface AddSymptomModalProps {
  visible: boolean;
  existingSymptoms: string[];
  onAdd: (symptom: EditableSymptom) => void;
  onDismiss: () => void;
}

export function AddSymptomModal({
  visible,
  existingSymptoms,
  onAdd,
  onDismiss,
}: AddSymptomModalProps) {
  const colors = useTheme();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const touchTargetSize = useTouchTargetSize();
  const [searchText, setSearchText] = useState('');
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [showSeverityPicker, setShowSeverityPicker] = useState(false);

  // Get all available symptoms (not already added)
  const allSymptoms = Object.keys(SYMPTOM_DISPLAY_NAMES).filter(
    (symptom) => !existingSymptoms.includes(symptom)
  );

  // Filter symptoms by search text
  const filteredSymptoms = allSymptoms.filter((symptom) => {
    const displayName = SYMPTOM_DISPLAY_NAMES[symptom].toLowerCase();
    return displayName.includes(searchText.toLowerCase());
  });

  const handleSymptomSelect = (symptom: string) => {
    setSelectedSymptom(symptom);
    setShowSeverityPicker(true);
  };

  const handleSeveritySelect = (severity: Severity | null) => {
    if (selectedSymptom) {
      const newSymptom: EditableSymptom = {
        symptom: selectedSymptom,
        matched: SYMPTOM_DISPLAY_NAMES[selectedSymptom],
        method: 'phrase', // Manual additions are marked as phrase
        severity,
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      onAdd(newSymptom);
      handleClose();
    }
  };

  const handleClose = () => {
    setSearchText('');
    setSelectedSymptom(null);
    setShowSeverityPicker(false);
    onDismiss();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Add Symptom</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={{ minWidth: touchTargetSize, minHeight: touchTargetSize }}
                accessible={true}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Text style={styles.closeButton}>×</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search symptoms..."
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
            />

            <ScrollView style={styles.symptomList}>
              {filteredSymptoms.length === 0 ? (
                <Text style={styles.emptyText}>No symptoms found</Text>
              ) : (
                filteredSymptoms.map((symptom) => (
                  <TouchableOpacity
                    key={symptom}
                    style={[styles.symptomItem, { minHeight: touchTargetSize }]}
                    onPress={() => handleSymptomSelect(symptom)}
                    accessible={true}
                    accessibilityLabel={`Add ${SYMPTOM_DISPLAY_NAMES[symptom]}`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.symptomName}>
                      {SYMPTOM_DISPLAY_NAMES[symptom]}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {selectedSymptom && (
        <SeverityPicker
          visible={showSeverityPicker}
          symptomName={SYMPTOM_DISPLAY_NAMES[selectedSymptom]}
          currentSeverity={null}
          onSelect={handleSeveritySelect}
          onDismiss={() => setShowSeverityPicker(false)}
        />
      )}
    </>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>, typography: ReturnType<typeof useTypography>) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...baseTypography.bodyMedium,
    fontSize: 18,
    color: colors.textPrimary,
  },
  closeButton: {
    fontSize: 32,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  searchInput: {
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    padding: 12,
    ...baseTypography.body,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  symptomList: {
    maxHeight: 400,
  },
  symptomItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.bgElevated,
    marginBottom: TOUCH_TARGET_SPACING / 2,
    justifyContent: 'center',
  },
  symptomName: {
    ...baseTypography.body,
    color: colors.textPrimary,
  },
  emptyText: {
    ...baseTypography.small,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
