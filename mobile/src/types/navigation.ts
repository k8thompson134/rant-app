/**
 * Navigation type definitions for React Navigation
 */

import { ExtractionResult } from './index';

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
  History: undefined;
  Settings: undefined;
};
