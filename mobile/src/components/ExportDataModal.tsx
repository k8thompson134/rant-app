/**
 * ExportDataModal
 * Accessible UI for exporting symptom data
 * Follows RantTrack UX principles: low energy, clear feedback, large touch targets
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useTypography, useTouchTargetSize } from '../contexts/AccessibilityContext';
import { ExportFormat, DateRangePreset, RantEntry } from '../types';
import {
  exportAndShare,
  filterEntriesByDateRange,
  getDateRangeFromPreset,
} from '../utils/exportData';

interface ExportDataModalProps {
  visible: boolean;
  onClose: () => void;
  entries: RantEntry[];
}

export function ExportDataModal({ visible, onClose, entries }: ExportDataModalProps) {
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();

  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('txt');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangePreset>('all_time');
  const [isExporting, setIsExporting] = useState(false);

  // Create dynamic styles
  const styles = useMemo(() => createStyles(typography, colors), [typography, colors]);

  // Calculate filtered entries
  const filteredEntries = useMemo(() => {
    const dateRange = getDateRangeFromPreset(selectedDateRange);
    return filterEntriesByDateRange(entries, dateRange);
  }, [entries, selectedDateRange]);

  const handleExport = async () => {
    if (filteredEntries.length === 0) {
      Alert.alert(
        'No entries to download',
        'There are no symptom entries in the selected date range.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsExporting(true);

    try {
      const result = await exportAndShare(filteredEntries, selectedFormat, selectedDateRange);

      setIsExporting(false);

      if (result.success) {
        Alert.alert(
          'Download complete',
          `Saved ${filteredEntries.length} entries to:\n${result.fileName}`,
          [
            {
              text: 'Done',
              onPress: onClose,
            },
          ]
        );
      } else {
        Alert.alert(
          'Download failed',
          result.error || 'Could not save data. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      setIsExporting(false);
      Alert.alert('Download failed', 'An unexpected error occurred. Please try again.', [
        { text: 'OK' },
      ]);
    }
  };

  const formatOptions: {
    value: ExportFormat;
    label: string;
    icon: string;
    description: string;
  }[] = [
    {
      value: 'txt',
      label: 'Plain Text',
      icon: 'document-text-outline',
      description: 'Easy to read and print',
    },
    {
      value: 'csv',
      label: 'Spreadsheet (CSV)',
      icon: 'grid-outline',
      description: 'Open in Excel or Google Sheets',
    },
    {
      value: 'json',
      label: 'JSON Data',
      icon: 'code-outline',
      description: 'Full data with all details',
    },
  ];

  const dateRangeOptions: { value: DateRangePreset; label: string; description: string }[] = [
    {
      value: 'all_time',
      label: 'All Time',
      description: `${entries.length} entries`,
    },
    {
      value: 'last_30_days',
      label: 'Last 30 Days',
      description: `${filterEntriesByDateRange(entries, getDateRangeFromPreset('last_30_days')).length} entries`,
    },
    {
      value: 'last_90_days',
      label: 'Last 90 Days',
      description: `${filterEntriesByDateRange(entries, getDateRangeFromPreset('last_90_days')).length} entries`,
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Download Your Data</Text>
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.closeButton,
              { minHeight: touchTargetSize, minWidth: touchTargetSize },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Close download screen"
          >
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <Ionicons name="lock-closed" size={20} color={colors.accentPrimary} />
            <Text style={styles.privacyText}>
              Your data stays on your device. You control where it goes.
            </Text>
          </View>

          {/* Format Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Choose Format</Text>
            {formatOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  { minHeight: touchTargetSize },
                  selectedFormat === option.value && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedFormat(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedFormat === option.value }}
                accessibilityLabel={`${option.label}, ${option.description}`}
              >
                <View style={styles.optionIcon}>
                  <Ionicons
                    name={option.icon as any}
                    size={24}
                    color={
                      selectedFormat === option.value
                        ? colors.accentPrimary
                        : colors.textSecondary
                    }
                  />
                </View>
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionLabel,
                      selectedFormat === option.value && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                {selectedFormat === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.accentPrimary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Date Range Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Choose Date Range</Text>
            {dateRangeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionCard,
                  { minHeight: touchTargetSize },
                  selectedDateRange === option.value && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedDateRange(option.value)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedDateRange === option.value }}
                accessibilityLabel={`${option.label}, ${option.description}`}
              >
                <View style={styles.optionContent}>
                  <Text
                    style={[
                      styles.optionLabel,
                      selectedDateRange === option.value && styles.optionLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                {selectedDateRange === option.value && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.accentPrimary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Download Summary */}
          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              Ready to download {filteredEntries.length}{' '}
              {filteredEntries.length === 1 ? 'entry' : 'entries'}
            </Text>
          </View>
        </ScrollView>

        {/* Download Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.exportButton,
              { minHeight: touchTargetSize },
              isExporting && styles.exportButtonDisabled,
            ]}
            onPress={handleExport}
            disabled={isExporting}
            accessibilityRole="button"
            accessibilityLabel={`Download ${filteredEntries.length} entries as ${selectedFormat}`}
            accessibilityHint="Saves your data to the device"
          >
            {isExporting ? (
              <ActivityIndicator color={colors.bgPrimary} />
            ) : (
              <>
                <Ionicons name="download-outline" size={24} color={colors.bgPrimary} />
                <Text style={styles.exportButtonText}>Download</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (
  typography: ReturnType<typeof useTypography>,
  colors: ReturnType<typeof useTheme>
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bgPrimary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.bgElevated,
    },
    title: {
      ...typography.largeDisplay,
      color: colors.textPrimary,
    },
    closeButton: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    privacyNote: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      backgroundColor: colors.accentLight,
      borderRadius: 12,
      marginBottom: 24,
    },
    privacyText: {
      ...typography.body,
      color: colors.textPrimary,
      flex: 1,
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      ...typography.largeHeader,
      color: colors.textPrimary,
      marginBottom: 12,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.bgElevated,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: colors.bgElevated,
    },
    optionCardSelected: {
      backgroundColor: colors.accentLight,
      borderColor: colors.accentPrimary,
    },
    optionIcon: {
      marginRight: 16,
    },
    optionContent: {
      flex: 1,
    },
    optionLabel: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    optionLabelSelected: {
      color: colors.accentPrimary,
    },
    optionDescription: {
      ...typography.small,
      color: colors.textMuted,
    },
    summary: {
      padding: 16,
      backgroundColor: colors.bgElevated,
      borderRadius: 12,
      alignItems: 'center',
    },
    summaryText: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
    },
    footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: colors.bgElevated,
    },
    exportButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      backgroundColor: colors.accentPrimary,
      borderRadius: 12,
      paddingVertical: 16,
    },
    exportButtonDisabled: {
      opacity: 0.6,
    },
    exportButtonText: {
      ...typography.bodyMedium,
      color: colors.bgPrimary,
      fontWeight: '600',
    },
  });
