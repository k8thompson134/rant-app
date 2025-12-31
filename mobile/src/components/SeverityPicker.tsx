/**
 * SeverityPicker Component
 * Modal for selecting symptom severity level
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Severity, SEVERITY_COLORS } from '../types';
import { useTheme, useTypography, useTouchTargetSize } from '../contexts/AccessibilityContext';
import { TOUCH_TARGET_SPACING } from '../constants/accessibility';
import { darkTheme } from '../theme/colors';
import { typography as baseTypography } from '../theme/typography';

interface SeverityPickerProps {
  visible: boolean;
  symptomName: string;
  currentSeverity: Severity | null;
  onSelect: (severity: Severity | null) => void;
  onDismiss: () => void;
}

export function SeverityPicker({
  visible,
  symptomName,
  currentSeverity,
  onSelect,
  onDismiss,
}: SeverityPickerProps) {
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();

  const handleSelect = (severity: Severity | null) => {
    onSelect(severity);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onDismiss}
      >
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>Set Severity for {symptomName}</Text>

          <TouchableOpacity
            style={[
              styles.severityButton,
              { minHeight: touchTargetSize },
              currentSeverity === 'mild' && styles.severityButtonActive,
            ]}
            onPress={() => handleSelect('mild')}
            accessible={true}
            accessibilityLabel="Mild severity"
            accessibilityRole="button"
          >
            <View style={[styles.indicator, styles.indicatorMild]} />
            <Text style={styles.severityLabel}>Mild</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.severityButton,
              { minHeight: touchTargetSize },
              currentSeverity === 'moderate' && styles.severityButtonActive,
            ]}
            onPress={() => handleSelect('moderate')}
            accessible={true}
            accessibilityLabel="Moderate severity"
            accessibilityRole="button"
          >
            <View style={[styles.indicator, styles.indicatorModerate]} />
            <Text style={styles.severityLabel}>Moderate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.severityButton,
              { minHeight: touchTargetSize },
              currentSeverity === 'severe' && styles.severityButtonActive,
            ]}
            onPress={() => handleSelect('severe')}
            accessible={true}
            accessibilityLabel="Severe severity"
            accessibilityRole="button"
          >
            <View style={[styles.indicator, styles.indicatorSevere]} />
            <Text style={styles.severityLabel}>Severe</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.clearButton, { minHeight: touchTargetSize }]}
            onPress={() => handleSelect(null)}
            accessible={true}
            accessibilityLabel="Clear severity"
            accessibilityRole="button"
          >
            <Text style={styles.clearButtonText}>Clear Severity</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { minHeight: touchTargetSize }]}
            onPress={onDismiss}
            accessible={true}
            accessibilityLabel="Cancel"
            accessibilityRole="button"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: darkTheme.bgSecondary,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    ...baseTypography.bodyMedium,
    fontSize: 18,
    color: darkTheme.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  severityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: darkTheme.bgElevated,
    padding: 16,
    borderRadius: 12,
    marginBottom: TOUCH_TARGET_SPACING,
  },
  severityButtonActive: {
    backgroundColor: darkTheme.accentLight,
    borderWidth: 2,
    borderColor: darkTheme.accentPrimary,
  },
  indicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  indicatorMild: {
    backgroundColor: SEVERITY_COLORS.mild,
  },
  indicatorModerate: {
    backgroundColor: SEVERITY_COLORS.moderate,
  },
  indicatorSevere: {
    backgroundColor: SEVERITY_COLORS.severe,
  },
  severityLabel: {
    ...baseTypography.bodyMedium,
    color: darkTheme.textPrimary,
  },
  clearButton: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: darkTheme.bgElevated,
    marginTop: 8,
  },
  clearButtonText: {
    ...baseTypography.small,
    color: darkTheme.textSecondary,
    textAlign: 'center',
  },
  cancelButton: {
    padding: 14,
    marginTop: 8,
  },
  cancelButtonText: {
    ...baseTypography.small,
    color: darkTheme.textMuted,
    textAlign: 'center',
  },
});
