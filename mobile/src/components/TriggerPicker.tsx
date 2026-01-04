/**
 * TriggerPicker Component
 * Accessible modal for selecting activity triggers that caused symptoms
 * WCAG AAA compliant with common activities for quick selection
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityTrigger } from '../types';
import { useTheme, useTypography, useTouchTargetSize, useAccessibilitySettings } from '../contexts/AccessibilityContext';
import { TOUCH_TARGET_SPACING } from '../constants/accessibility';
import { typography as baseTypography } from '../theme/typography';

interface TriggerPickerProps {
  visible: boolean;
  symptomName: string;
  currentTrigger: ActivityTrigger | null;
  onSelect: (trigger: ActivityTrigger | null) => void;
  onDismiss: () => void;
}

interface ActivityOption {
  activity: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const COMMON_ACTIVITIES: ActivityOption[] = [
  { activity: 'walking', label: 'Walking', icon: 'walk-outline' },
  { activity: 'standing', label: 'Standing', icon: 'body-outline' },
  { activity: 'showering', label: 'Showering', icon: 'water-outline' },
  { activity: 'cooking', label: 'Cooking', icon: 'restaurant-outline' },
  { activity: 'cleaning', label: 'Cleaning', icon: 'sparkles-outline' },
  { activity: 'sitting', label: 'Sitting', icon: 'accessibility-outline' },
  { activity: 'exercise', label: 'Exercise', icon: 'fitness-outline' },
  { activity: 'working', label: 'Working', icon: 'briefcase-outline' },
  { activity: 'eating', label: 'Eating', icon: 'nutrition-outline' },
  { activity: 'sleeping', label: 'Sleeping', icon: 'bed-outline' },
  { activity: 'reading', label: 'Reading', icon: 'book-outline' },
  { activity: 'driving', label: 'Driving', icon: 'car-outline' },
];

const TIMEFRAMES: Array<{ value: string; label: string; description: string }> = [
  { value: 'after', label: 'After', description: 'Symptom started after the activity' },
  { value: 'during', label: 'During', description: 'Symptom happened during the activity' },
  { value: 'from', label: 'From', description: 'Symptom caused by the activity' },
];

export function TriggerPicker({
  visible,
  symptomName,
  currentTrigger,
  onSelect,
  onDismiss,
}: TriggerPickerProps) {
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  // State
  const [selectedActivity, setSelectedActivity] = useState<string>(
    currentTrigger?.activity || ''
  );
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(
    currentTrigger?.timeframe || 'after'
  );
  const [customActivity, setCustomActivity] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleActivitySelect = (activity: string) => {
    setSelectedActivity(activity);
    setShowCustomInput(false);
    setCustomActivity('');
  };

  const handleCustomActivityChange = (text: string) => {
    setCustomActivity(text);
    setSelectedActivity(text);
  };

  const handleApply = () => {
    if (selectedActivity.trim()) {
      onSelect({
        activity: selectedActivity.trim(),
        timeframe: selectedTimeframe,
      });
    }
    onDismiss();
  };

  const handleClear = () => {
    onSelect(null);
    onDismiss();
  };

  const isActivitySelected = (activity: string): boolean => {
    return selectedActivity.toLowerCase() === activity.toLowerCase();
  };

  return (
    <Modal
      visible={visible}
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
        accessibilityLabel="Close trigger picker"
        accessibilityHint="Tap outside to cancel"
      >
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
          accessible={true}
          accessibilityLabel={`Select activity trigger for ${symptomName}`}
        >
          <Text style={styles.title} accessibilityRole="header">
            What triggered this?
          </Text>
          <Text style={styles.subtitle}>{symptomName}</Text>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {/* Timeframe Selection */}
            <Text style={styles.sectionLabel}>When did it happen?</Text>
            <View style={styles.timeframeContainer}>
              {TIMEFRAMES.map((tf) => (
                <TouchableOpacity
                  key={tf.value}
                  style={[
                    styles.timeframeButton,
                    { minHeight: Math.max(touchTargetSize - 8, 48) },
                    selectedTimeframe === tf.value && styles.timeframeButtonActive,
                  ]}
                  onPress={() => setSelectedTimeframe(tf.value)}
                  accessible={true}
                  accessibilityLabel={`${tf.label}, ${tf.description}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selectedTimeframe === tf.value }}
                >
                  <Text
                    style={[
                      styles.timeframeText,
                      selectedTimeframe === tf.value && styles.timeframeTextActive,
                    ]}
                  >
                    {tf.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Common Activities */}
            <Text style={styles.sectionLabel}>Common activities</Text>
            <View style={styles.activitiesGrid}>
              {COMMON_ACTIVITIES.map((act) => (
                <TouchableOpacity
                  key={act.activity}
                  style={[
                    styles.activityButton,
                    { minHeight: touchTargetSize },
                    isActivitySelected(act.activity) && styles.activityButtonActive,
                  ]}
                  onPress={() => handleActivitySelect(act.activity)}
                  accessible={true}
                  accessibilityLabel={act.label}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActivitySelected(act.activity) }}
                >
                  <Ionicons
                    name={act.icon}
                    size={22}
                    color={
                      isActivitySelected(act.activity)
                        ? colors.accentPrimary
                        : colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.activityText,
                      isActivitySelected(act.activity) && styles.activityTextActive,
                    ]}
                  >
                    {act.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom Activity */}
            <TouchableOpacity
              style={[
                styles.customButton,
                { minHeight: touchTargetSize },
                showCustomInput && styles.customButtonActive,
              ]}
              onPress={() => {
                setShowCustomInput(!showCustomInput);
                if (!showCustomInput) {
                  setSelectedActivity('');
                }
              }}
              accessible={true}
              accessibilityLabel="Enter custom activity"
              accessibilityRole="button"
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={showCustomInput ? colors.accentPrimary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.customButtonText,
                  showCustomInput && styles.customButtonTextActive,
                ]}
              >
                Something else...
              </Text>
            </TouchableOpacity>

            {showCustomInput && (
              <View style={styles.customInputContainer}>
                <TextInput
                  style={styles.customInput}
                  value={customActivity}
                  onChangeText={handleCustomActivityChange}
                  placeholder="Type activity (e.g., gardening)"
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                  accessible={true}
                  accessibilityLabel="Custom activity input"
                  accessibilityHint="Type the activity that triggered your symptom"
                />
              </View>
            )}

            {/* Preview */}
            {selectedActivity.trim() && (
              <View style={styles.preview}>
                <Ionicons name="flash-outline" size={20} color={colors.accentPrimary} />
                <Text style={styles.previewText}>
                  {selectedTimeframe} {selectedActivity}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Apply Button */}
          <TouchableOpacity
            style={[
              styles.applyButton,
              { minHeight: touchTargetSize },
              !selectedActivity.trim() && styles.applyButtonDisabled,
            ]}
            onPress={handleApply}
            disabled={!selectedActivity.trim()}
            accessible={true}
            accessibilityLabel={
              selectedActivity.trim()
                ? `Set trigger to ${selectedTimeframe} ${selectedActivity}`
                : 'Select an activity first'
            }
            accessibilityRole="button"
            accessibilityState={{ disabled: !selectedActivity.trim() }}
          >
            <Ionicons name="checkmark" size={20} color={colors.bgPrimary} />
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.clearButton, { minHeight: touchTargetSize }]}
            onPress={handleClear}
            accessible={true}
            accessibilityLabel="Clear trigger"
            accessibilityRole="button"
          >
            <Ionicons name="close-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.clearButtonText}>Clear Trigger</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { minHeight: touchTargetSize }]}
            onPress={onDismiss}
            accessible={true}
            accessibilityLabel="Cancel and close"
            accessibilityRole="button"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
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
      maxHeight: '90%',
    },
    title: {
      ...baseTypography.largeHeader,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 4,
    },
    subtitle: {
      ...baseTypography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    scrollView: {
      maxHeight: 380,
    },
    sectionLabel: {
      ...baseTypography.caption,
      fontFamily: 'DMSans_500Medium',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 10,
      marginTop: 8,
    },
    timeframeContainer: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
    },
    timeframeButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: colors.bgElevated,
      alignItems: 'center',
    },
    timeframeButtonActive: {
      backgroundColor: colors.accentLight,
      borderWidth: 2,
      borderColor: colors.accentPrimary,
    },
    timeframeText: {
      ...baseTypography.small,
      color: colors.textPrimary,
    },
    timeframeTextActive: {
      color: colors.accentPrimary,
      fontFamily: 'DMSans_500Medium',
    },
    activitiesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 12,
    },
    activityButton: {
      width: '30%',
      flexGrow: 1,
      minWidth: 90,
      maxWidth: 110,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 12,
      backgroundColor: colors.bgElevated,
      alignItems: 'center',
      gap: 6,
    },
    activityButtonActive: {
      backgroundColor: colors.accentLight,
      borderWidth: 2,
      borderColor: colors.accentPrimary,
    },
    activityText: {
      ...baseTypography.caption,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    activityTextActive: {
      color: colors.accentPrimary,
      fontFamily: 'DMSans_500Medium',
    },
    customButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.bgElevated,
      gap: 8,
      marginBottom: 12,
    },
    customButtonActive: {
      backgroundColor: colors.accentLight,
      borderWidth: 2,
      borderColor: colors.accentPrimary,
    },
    customButtonText: {
      ...baseTypography.small,
      color: colors.textSecondary,
    },
    customButtonTextActive: {
      color: colors.accentPrimary,
    },
    customInputContainer: {
      marginBottom: 12,
    },
    customInput: {
      backgroundColor: colors.bgElevated,
      borderRadius: 12,
      padding: 14,
      minHeight: 48,
      ...baseTypography.body,
      color: colors.textPrimary,
      borderWidth: 2,
      borderColor: colors.accentPrimary,
    },
    preview: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentLight,
      padding: 14,
      borderRadius: 12,
      gap: 8,
      marginBottom: 8,
    },
    previewText: {
      ...baseTypography.bodyMedium,
      color: colors.accentPrimary,
    },
    applyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accentPrimary,
      padding: 14,
      borderRadius: 12,
      gap: 8,
      marginTop: 8,
    },
    applyButtonDisabled: {
      opacity: 0.5,
    },
    applyButtonText: {
      ...baseTypography.bodyMedium,
      color: colors.bgPrimary,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.bgElevated,
      marginTop: 10,
      gap: 8,
    },
    clearButtonText: {
      ...baseTypography.small,
      color: colors.textSecondary,
    },
    cancelButton: {
      padding: 14,
      marginTop: 8,
      alignItems: 'center',
    },
    cancelButtonText: {
      ...baseTypography.small,
      color: colors.textMuted,
    },
  });
