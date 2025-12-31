/**
 * AsyncStorage utilities for persisting settings and drafts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AccessibilitySettings } from '../types/accessibility';
import { DEFAULT_ACCESSIBILITY_SETTINGS } from '../types/accessibility';
import type { ExtractedSymptom } from '../types';

export const STORAGE_KEYS = {
  ACCESSIBILITY_SETTINGS: '@ranttrack/accessibility_settings',
  DRAFT_ENTRY: '@ranttrack/draft_entry',
  LAST_SAVE_TIMESTAMP: '@ranttrack/last_save_timestamp',
} as const;

// ==================== Accessibility Settings ====================

export async function getAccessibilitySettings(): Promise<AccessibilitySettings> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.ACCESSIBILITY_SETTINGS);
    if (!json) {
      return DEFAULT_ACCESSIBILITY_SETTINGS;
    }
    const stored = JSON.parse(json);
    // Merge with defaults in case new settings were added
    return { ...DEFAULT_ACCESSIBILITY_SETTINGS, ...stored };
  } catch (error) {
    console.error('Failed to load accessibility settings:', error);
    return DEFAULT_ACCESSIBILITY_SETTINGS;
  }
}

export async function saveAccessibilitySettings(
  settings: AccessibilitySettings
): Promise<void> {
  try {
    const json = JSON.stringify(settings);
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESSIBILITY_SETTINGS, json);
  } catch (error) {
    console.error('Failed to save accessibility settings:', error);
    throw error;
  }
}

export async function updateAccessibilitySetting<K extends keyof AccessibilitySettings>(
  key: K,
  value: AccessibilitySettings[K]
): Promise<AccessibilitySettings> {
  const settings = await getAccessibilitySettings();
  const updated = { ...settings, [key]: value };
  await saveAccessibilitySettings(updated);
  return updated;
}

// ==================== Draft Entry ====================

export interface DraftEntry {
  text: string;
  symptoms: ExtractedSymptom[];
  timestamp: number;
}

export async function saveDraft(
  text: string,
  symptoms: ExtractedSymptom[] = []
): Promise<void> {
  try {
    const draft: DraftEntry = {
      text,
      symptoms,
      timestamp: Date.now(),
    };
    const json = JSON.stringify(draft);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.DRAFT_ENTRY, json),
      AsyncStorage.setItem(STORAGE_KEYS.LAST_SAVE_TIMESTAMP, Date.now().toString()),
    ]);
  } catch (error) {
    console.error('Failed to save draft:', error);
    // Don't throw - auto-save should fail silently
  }
}

export async function getDraft(): Promise<DraftEntry | null> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.DRAFT_ENTRY);
    if (!json) {
      return null;
    }
    const draft: DraftEntry = JSON.parse(json);
    return draft;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

export async function clearDraft(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.DRAFT_ENTRY),
      AsyncStorage.removeItem(STORAGE_KEYS.LAST_SAVE_TIMESTAMP),
    ]);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}

export async function getLastSaveTimestamp(): Promise<number | null> {
  try {
    const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SAVE_TIMESTAMP);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error('Failed to get last save timestamp:', error);
    return null;
  }
}

// ==================== Batch Operations ====================

export async function clearAllData(): Promise<void> {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Failed to clear all data:', error);
    throw error;
  }
}
