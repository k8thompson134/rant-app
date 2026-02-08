/**
 * PainLocationPicker Component
 * Accessible modal for selecting body location of pain
 * WCAG AAA compliant with quick-select pills and search mode
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BODY_PARTS } from '../nlp/dictionaries/symptoms/pain';
import {
  useTheme,
  useTypography,
  useTouchTargetSize,
  useAccessibilitySettings,
} from '../contexts/AccessibilityContext';
import { TOUCH_TARGET_SPACING } from '../constants/accessibility';

interface PainLocationPickerProps {
  visible: boolean;
  symptomName: string;
  currentLocation: string | null;
  onSelect: (location: string | null) => void;
  onDismiss: () => void;
}

interface LocationOption {
  value: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const COMMON_LOCATIONS: LocationOption[] = [
  { value: 'head', label: 'Head', icon: 'happy-outline' },
  { value: 'neck', label: 'Neck', icon: 'swap-vertical-outline' },
  { value: 'shoulder', label: 'Shoulder', icon: 'fitness-outline' },
  { value: 'upper_back', label: 'Upper Back', icon: 'arrow-up-outline' },
  { value: 'lower_back', label: 'Lower Back', icon: 'arrow-down-outline' },
  { value: 'hip', label: 'Hip', icon: 'body-outline' },
  { value: 'knee', label: 'Knee', icon: 'walk-outline' },
  { value: 'foot', label: 'Foot', icon: 'footsteps-outline' },
  { value: 'abdomen', label: 'Abdomen', icon: 'ellipse-outline' },
  { value: 'chest', label: 'Chest', icon: 'heart-outline' },
  { value: 'jaw', label: 'Jaw', icon: 'chatbubble-ellipses-outline' },
  { value: 'wrist', label: 'Wrist', icon: 'hand-left-outline' },
];

type PickerMode = 'quick' | 'search';

export function PainLocationPicker({
  visible,
  symptomName,
  currentLocation,
  onSelect,
  onDismiss,
}: PainLocationPickerProps) {
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();
  const { settings } = useAccessibilitySettings();
  const reducedMotion = settings.reducedMotion;
  const [mode, setMode] = useState<PickerMode>('quick');
  const [searchQuery, setSearchQuery] = useState('');

  const styles = useMemo(
    () => createStyles(colors, typography, touchTargetSize),
    [colors, typography, touchTargetSize]
  );

  // Format location display (replace underscores with spaces)
  const formatLocationDisplay = (location: string): string => {
    return location.replace(/_/g, ' ');
  };

  // Get human-readable label for current location
  const getCurrentLocationLabel = (): string => {
    if (!currentLocation) return 'Not set';
    // Find the key in BODY_PARTS that maps to currentLocation
    for (const [key, value] of Object.entries(BODY_PARTS)) {
      if (value === currentLocation) {
        return key.charAt(0).toUpperCase() + key.slice(1);
      }
    }
    return formatLocationDisplay(currentLocation);
  };

  // Filter body parts based on search query
  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    const query = searchQuery.toLowerCase();
    const filtered = Object.entries(BODY_PARTS)
      .filter(
        ([key, value]) =>
          key.includes(query) || value.includes(query)
      )
      .map(([key, value]) => ({
        key,
        value,
        label: key.charAt(0).toUpperCase() + key.slice(1),
      }))
      .slice(0, 10);
    return filtered;
  }, [searchQuery]);

  const handleSelect = (location: string | null) => {
    onSelect(location);
    // Reset picker state when closing
    setMode('quick');
    setSearchQuery('');
  };

  const handleDismiss = () => {
    setMode('quick');
    setSearchQuery('');
    onDismiss();
  };

  const renderQuickSelectMode = () => (
    <ScrollView style={styles.modeContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.modeTitle}>Common Locations</Text>

      <View style={styles.pillsContainer}>
        {COMMON_LOCATIONS.map((location) => {
          const isSelected = currentLocation === location.value;
          return (
            <TouchableOpacity
              key={location.value}
              style={[
                styles.locationPill,
                { minHeight: touchTargetSize, minWidth: '30%' },
                isSelected && styles.locationPillActive,
              ]}
              onPress={() => handleSelect(location.value)}
              accessible={true}
              accessibilityLabel={`${location.label}. Tap to select as pain location.`}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
            >
              <Ionicons
                name={location.icon}
                size={20}
                color={
                  isSelected
                    ? colors.accentPrimary
                    : colors.textSecondary
                }
                style={styles.pillIcon}
              />
              <Text
                style={[
                  styles.pillLabel,
                  isSelected && styles.pillLabelActive,
                ]}
                numberOfLines={2}
              >
                {location.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.switchModeButton, { minHeight: touchTargetSize }]}
        onPress={() => setMode('search')}
        accessible={true}
        accessibilityLabel="Search for specific location"
        accessibilityHint="Find body locations not in the quick select list"
        accessibilityRole="button"
      >
        <Ionicons
          name="search"
          size={20}
          color={colors.textSecondary}
        />
        <Text style={styles.switchModeButtonText}>
          Search for specific location
        </Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.textMuted}
        />
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSearchMode = () => (
    <View style={styles.modeContainer}>
      <View style={[styles.searchContainer, { minHeight: touchTargetSize }]}>
        <Ionicons
          name="search"
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { ...typography.body }]}
          placeholder="Type location name..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessible={true}
          accessibilityLabel="Search for specific body location"
          accessibilityHint="Type to filter from over 400 locations"
          accessibilityRole="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            accessible={true}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery.trim().length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons
            name="help-circle-outline"
            size={40}
            color={colors.textMuted}
          />
          <Text style={styles.emptyStateText}>
            Start typing to search for a body location
          </Text>
        </View>
      ) : filteredLocations.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons
            name="close-circle-outline"
            size={40}
            color={colors.textMuted}
          />
          <Text style={styles.emptyStateText}>
            No matching locations. Try a different search term.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredLocations}
          keyExtractor={(item) => item.value}
          scrollEnabled={false}
          contentContainerStyle={styles.searchResultsContainer}
          initialNumToRender={10}
          maxToRenderPerBatch={20}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          renderItem={({ item }) => {
            const isSelected = currentLocation === item.value;
            return (
              <TouchableOpacity
                style={[
                  styles.searchResultButton,
                  { minHeight: touchTargetSize },
                  isSelected && styles.searchResultButtonActive,
                ]}
                onPress={() => handleSelect(item.value)}
                accessible={true}
                accessibilityLabel={`${item.label}. Tap to select as pain location.`}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[
                    styles.searchResultLabel,
                    isSelected && styles.searchResultLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.accentPrimary}
                  />
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity
        style={[styles.backButton, { minHeight: touchTargetSize }]}
        onPress={() => {
          setMode('quick');
          setSearchQuery('');
        }}
        accessible={true}
        accessibilityLabel="Back to quick select"
        accessibilityHint="Return to common body locations"
        accessibilityRole="button"
      >
        <Ionicons
          name="chevron-back"
          size={20}
          color={colors.textSecondary}
        />
        <Text style={styles.backButtonText}>Back to quick select</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reducedMotion ? 'none' : 'fade'}
      onRequestClose={handleDismiss}
      accessibilityViewIsModal={true}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleDismiss}
        accessible={true}
        accessibilityLabel="Close location picker"
        accessibilityHint="Tap outside to cancel"
      >
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
          accessible={true}
          accessibilityLabel={`Select pain location for ${symptomName}`}
        >
          <Text style={styles.title} accessibilityRole="header">
            Where is the pain?
          </Text>
          <Text style={styles.subtitle}>{symptomName}</Text>
          {currentLocation && (
            <Text style={styles.currentSelection}>
              Currently: {getCurrentLocationLabel()}
            </Text>
          )}

          {mode === 'quick' ? renderQuickSelectMode() : renderSearchMode()}

          <TouchableOpacity
            style={[styles.clearButton, { minHeight: touchTargetSize }]}
            onPress={() => handleSelect(null)}
            accessible={true}
            accessibilityLabel="Clear pain location"
            accessibilityHint="Remove the selected location"
            accessibilityRole="button"
          >
            <Ionicons
              name="close-circle-outline"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.clearButtonText}>Clear Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { minHeight: touchTargetSize }]}
            onPress={handleDismiss}
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

const createStyles = (
  colors: ReturnType<typeof useTheme>,
  typography: ReturnType<typeof useTypography>,
  touchTargetSize: number
) =>
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
      maxHeight: '85%',
    },
    title: {
      ...typography.largeHeader,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: 4,
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    currentSelection: {
      ...typography.caption,
      color: colors.accentPrimary,
      textAlign: 'center',
      marginBottom: 16,
      fontWeight: '500',
    },
    modeContainer: {
      maxHeight: 300,
      marginBottom: 16,
    },
    modeTitle: {
      ...typography.bodyMedium,
      color: colors.textPrimary,
      marginBottom: 12,
    },
    // Quick select mode
    pillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: TOUCH_TARGET_SPACING,
      marginBottom: 16,
    },
    locationPill: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.bgElevated,
      borderRadius: 12,
      padding: 12,
      flex: 1,
    },
    locationPillActive: {
      backgroundColor: colors.accentLight,
      borderWidth: 2,
      borderColor: colors.accentPrimary,
    },
    pillIcon: {
      marginBottom: 4,
    },
    pillLabel: {
      ...typography.small,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    pillLabelActive: {
      color: colors.accentPrimary,
      fontWeight: '600',
    },
    switchModeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 12,
      backgroundColor: colors.bgElevated,
      gap: 8,
    },
    switchModeButtonText: {
      ...typography.small,
      color: colors.textSecondary,
      flex: 1,
    },
    // Search mode
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.bgElevated,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.accentLight,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      color: colors.textPrimary,
      paddingVertical: 12,
    },
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 24,
      gap: 12,
    },
    emptyStateText: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: 'center',
    },
    searchResultsContainer: {
      gap: TOUCH_TARGET_SPACING,
    },
    searchResultButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.bgElevated,
      padding: 12,
      borderRadius: 12,
    },
    searchResultButtonActive: {
      backgroundColor: colors.accentLight,
      borderWidth: 2,
      borderColor: colors.accentPrimary,
    },
    searchResultLabel: {
      ...typography.body,
      color: colors.textPrimary,
      flex: 1,
    },
    searchResultLabelActive: {
      color: colors.accentPrimary,
      fontWeight: '600',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 12,
      backgroundColor: colors.bgElevated,
      gap: 8,
      marginTop: 8,
    },
    backButtonText: {
      ...typography.small,
      color: colors.textSecondary,
    },
    // Common buttons
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 12,
      backgroundColor: colors.bgElevated,
      marginBottom: 8,
      gap: 8,
    },
    clearButtonText: {
      ...typography.small,
      color: colors.textSecondary,
    },
    cancelButton: {
      padding: 12,
      alignItems: 'center',
    },
    cancelButtonText: {
      ...typography.small,
      color: colors.textMuted,
    },
  });
