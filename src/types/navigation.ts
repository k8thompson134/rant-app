/**
 * Navigation type definitions for React Navigation
 */

import { ExtractionResult, ExtractedSymptom, SpoonCount } from './index';

/**
 * Day entry for catch-up flow
 */
export interface DayEntry {
  timestamp: number;
  dateString: string;
  text: string;
  symptoms: ExtractedSymptom[];
  explicit: boolean;
  spoonCount?: SpoonCount;
}

/**
 * Home Stack Navigator - handles rant input and review flow
 */
export type HomeStackParamList = {
  HomeInput: {
    voiceText?: string;
  } | undefined;
  ReviewEntry: {
    rantText: string;
    extractionResult: ExtractionResult;
  };
  VoiceRecording: {
    returnScreen: string;
  };
  CatchUp: undefined;
  CatchUpReview: {
    dayEntries: DayEntry[];
  };
};

/**
 * Month Stack Navigator - handles month view and quick entry
 */
export type MonthStackParamList = {
  MonthView: undefined;
  QuickAddEntry: {
    dateTimestamp: number;
    voiceText?: string;
  };
  VoiceRecording: {
    returnScreen: string;
  };
};

/**
 * Root Tab Navigator - main app tabs
 */
export type RootTabParamList = {
  Home: undefined;
  Month: undefined;
  Insights: undefined;
  Dictionary: undefined;
  Guide: undefined;
  Settings: undefined;
};

/**
 * Settings Stack Navigator - handles settings screens
 */
export type SettingsStackParamList = {
  SettingsMain: undefined;
};

