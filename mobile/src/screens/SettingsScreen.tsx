/**
 * SettingsScreen
 * Accessibility and app customization settings
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import * as Device from 'expo-device';
import { useAccessibilitySettings, useTheme, useTypography, useTouchTargetSize } from '../contexts/AccessibilityContext';
import type { FontSize, TouchTargetSize, ThemeMode } from '../types/accessibility';

export function SettingsScreen() {
  const { settings, updateSetting, resetSettings } = useAccessibilitySettings();
  const colors = useTheme();
  const typography = useTypography();
  const touchTargetSize = useTouchTargetSize();

  // Create dynamic styles based on current typography and theme
  const styles = useMemo(() => createStyles(typography, colors), [typography, colors]);

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to their defaults. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetSettings();
            Alert.alert('Done', 'Settings have been reset');
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://k8thompson134.github.io/rant-app/PRIVACY_POLICY');
  };

  const getDeviceInfo = () => {
    const buildNumber = Platform.OS === 'ios'
      ? Constants.expoConfig?.ios?.buildNumber
      : Constants.expoConfig?.android?.versionCode;

    return `
App Version: ${Constants.expoConfig?.version} (${buildNumber})
Platform: ${Platform.OS} ${Platform.Version}
Device: ${Device.modelName || 'Unknown'}

Accessibility Settings:
  - Theme: ${settings.themeMode}
  - Font Size: ${settings.fontSize}
  - Touch Targets: ${settings.touchTargetSize}
  - High Contrast: ${settings.highContrastMode ? 'ON' : 'OFF'}
  - Reduced Motion: ${settings.reducedMotion ? 'ON' : 'OFF'}
  - Auto-Save: ${settings.autoSaveEnabled ? 'ON' : 'OFF'}
    `.trim();
  };

  const handleSendFeedback = () => {
    const feedbackUrl = 'https://forms.gle/jrYCwFx74atWKvSa9';

    Alert.alert(
      'Send Feedback',
      'Would you like to copy your device info to paste in the feedback form?',
      [
        {
          text: 'Copy Device Info',
          onPress: async () => {
            const deviceInfo = getDeviceInfo();
            await Clipboard.setStringAsync(deviceInfo);
            Alert.alert('Copied!', 'Device info copied. Opening feedback form...', [
              {
                text: 'OK',
                onPress: () => Linking.openURL(feedbackUrl),
              },
            ]);
          },
        },
        {
          text: 'Open Form',
          onPress: () => Linking.openURL(feedbackUrl),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Get version and build number
  const appVersion = Constants.expoConfig?.version || '0.9.0';
  const buildNumber = Platform.OS === 'ios'
    ? Constants.expoConfig?.ios?.buildNumber
    : Constants.expoConfig?.android?.versionCode;
  const versionString = buildNumber
    ? `${appVersion} (${buildNumber}) - Beta`
    : `${appVersion} - Beta`;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize RantTrack for your needs</Text>
        </View>

        {/* ME/CFS Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ME/CFS Features</Text>
          <Text style={styles.sectionDescription}>
            Features designed for low-energy and brain fog days
          </Text>

          <SettingRow
            icon="save-outline"
            label="Auto-Save"
            description="Automatically save drafts every 5 seconds"
            value={settings.autoSaveEnabled}
            onValueChange={(value) => updateSetting('autoSaveEnabled', value)}
            touchTargetSize={touchTargetSize}
          />

          <SettingRow
            icon="flash-outline"
            label="Bypass Review Screen"
            description="Save entries directly without reviewing symptoms"
            value={settings.bypassReviewScreen}
            onValueChange={(value) => updateSetting('bypassReviewScreen', value)}
            touchTargetSize={touchTargetSize}
          />

          <SettingRow
            icon="hand-left-outline"
            label="Show Quick Actions"
            description="Display 'Same as yesterday' and 'Quick check-in' buttons"
            value={settings.showQuickActions}
            onValueChange={(value) => updateSetting('showQuickActions', value)}
            touchTargetSize={touchTargetSize}
          />
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <Text style={styles.sectionDescription}>
            Customize the look and feel of RantTrack
          </Text>

          {/* Theme Mode Picker */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Ionicons name="color-palette-outline" size={20} color={colors.accentPrimary} />
                <Text style={styles.settingLabel}>Theme</Text>
              </View>
              <Text style={styles.settingDescription}>Choose your preferred color theme</Text>
            </View>
          </View>
          <View style={styles.pickerRow}>
            {(['dark', 'light'] as ThemeMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.pickerOption,
                  { minHeight: touchTargetSize },
                  settings.themeMode === mode && styles.pickerOptionSelected,
                ]}
                onPress={() => updateSetting('themeMode', mode)}
              >
                <Ionicons
                  name={mode === 'dark' ? 'moon' : 'sunny'}
                  size={20}
                  color={settings.themeMode === mode ? colors.accentPrimary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.pickerOptionText,
                    settings.themeMode === mode && styles.pickerOptionTextSelected,
                  ]}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Visual Accessibility Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visual Accessibility</Text>
          <Text style={styles.sectionDescription}>
            Adjust visual settings for better readability
          </Text>

          <SettingRow
            icon="contrast-outline"
            label="High Contrast Mode"
            description="Increase contrast for better visibility (WCAG AAA)"
            value={settings.highContrastMode}
            onValueChange={(value) => updateSetting('highContrastMode', value)}
            touchTargetSize={touchTargetSize}
          />

          <SettingRow
            icon="pause-outline"
            label="Reduced Motion"
            description="Disable animations and transitions"
            value={settings.reducedMotion}
            onValueChange={(value) => updateSetting('reducedMotion', value)}
            touchTargetSize={touchTargetSize}
          />

          {/* Font Size Picker */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Ionicons name="text-outline" size={20} color={colors.accentPrimary} />
                <Text style={styles.settingLabel}>Font Size</Text>
              </View>
              <Text style={styles.settingDescription}>Adjust text size throughout the app</Text>
            </View>
          </View>
          <View style={styles.pickerRow}>
            {(['small', 'medium', 'large', 'extraLarge'] as FontSize[]).map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.pickerOption,
                  { minHeight: touchTargetSize },
                  settings.fontSize === size && styles.pickerOptionSelected,
                ]}
                onPress={() => updateSetting('fontSize', size)}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    settings.fontSize === size && styles.pickerOptionTextSelected,
                  ]}
                >
                  {size === 'extraLarge' ? 'XL' : size.charAt(0).toUpperCase() + size.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Touch Target Size Picker */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <Ionicons name="hand-right-outline" size={20} color={colors.accentPrimary} />
                <Text style={styles.settingLabel}>Touch Target Size</Text>
              </View>
              <Text style={styles.settingDescription}>
                Size of buttons and interactive elements
              </Text>
            </View>
          </View>
          <View style={styles.pickerRow}>
            {(['minimum', 'comfortable', 'large'] as TouchTargetSize[]).map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.pickerOption,
                  { minHeight: touchTargetSize },
                  settings.touchTargetSize === size && styles.pickerOptionSelected,
                ]}
                onPress={() => updateSetting('touchTargetSize', size)}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    settings.touchTargetSize === size && styles.pickerOptionTextSelected,
                  ]}
                >
                  {size === 'minimum'
                    ? '48pt'
                    : size === 'comfortable'
                    ? '56pt'
                    : '64pt'}
                </Text>
                <Text
                  style={[
                    styles.pickerOptionSubtext,
                    settings.touchTargetSize === size && styles.pickerOptionTextSelected,
                  ]}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity
            style={[styles.aboutRow, { minHeight: touchTargetSize }]}
            accessible={false}
          >
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>{versionString}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.aboutRow, { minHeight: touchTargetSize }]}
            onPress={handlePrivacyPolicy}
            accessible={true}
            accessibilityLabel="View Privacy Policy"
            accessibilityRole="button"
            accessibilityHint="Opens privacy policy in browser"
          >
            <Text style={styles.aboutLabel}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.aboutRow, { minHeight: touchTargetSize }]}
            onPress={handleSendFeedback}
            accessible={true}
            accessibilityLabel="Send feedback about RantTrack"
            accessibilityRole="button"
            accessibilityHint="Opens feedback form with option to copy device info"
          >
            <Text style={styles.aboutLabel}>Send Feedback</Text>
            <Ionicons name="chatbox-outline" size={20} color={colors.accentPrimary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.aboutRow, { minHeight: touchTargetSize }]} onPress={handleResetSettings}>
            <Text style={[styles.aboutLabel, styles.destructive]}>Reset All Settings</Text>
            <Ionicons name="refresh-outline" size={20} color={colors.severityRough} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            RantTrack is designed for disabled and chronically ill people.
          </Text>
          <Text style={styles.footerText}>
            Your data stays on your device. No tracking, no ads.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

interface SettingRowProps {
  icon: string;
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  touchTargetSize: number;
}

function SettingRow({ icon, label, description, value, onValueChange, touchTargetSize }: SettingRowProps) {
  const colors = useTheme();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(typography, colors), [typography, colors]);

  return (
    <View style={[styles.settingRow, { minHeight: touchTargetSize }]}>
      <View style={styles.settingInfo}>
        <View style={styles.settingHeader}>
          <Ionicons name={icon as any} size={20} color={colors.accentPrimary} />
          <Text style={styles.settingLabel}>{label}</Text>
        </View>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.bgElevated, true: colors.accentLight }}
        thumbColor={value ? colors.accentPrimary : colors.textMuted}
      />
    </View>
  );
}

const createStyles = (typography: ReturnType<typeof useTypography>, colors: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    ...typography.largeDisplay,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...typography.largeHeader,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionDescription: {
    ...typography.small,
    color: colors.textMuted,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgElevated,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  settingLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  settingDescription: {
    ...typography.small,
    color: colors.textMuted,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  pickerOption: {
    flex: 1,
    backgroundColor: colors.bgElevated,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.bgElevated,
  },
  pickerOptionSelected: {
    backgroundColor: colors.accentLight,
    borderColor: colors.accentPrimary,
  },
  pickerOptionText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  pickerOptionTextSelected: {
    color: colors.accentPrimary,
  },
  pickerOptionSubtext: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgElevated,
  },
  aboutLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  aboutValue: {
    ...typography.body,
    color: colors.textMuted,
  },
  destructive: {
    color: colors.severityRough,
  },
  footer: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.bgElevated,
    gap: 8,
  },
  footerText: {
    ...typography.small,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
