/**
 * Navigation type definitions for React Navigation
 */

import { ExtractionResult } from './index';

/**
 * Home Stack Navigator - handles rant input and review flow
 */
export type HomeStackParamList = {
  HomeInput: undefined;
  ReviewEntry: {
    rantText: string;
    extractionResult: ExtractionResult;
  };
};

/**
 * Month Stack Navigator - handles month view and quick entry
 */
export type MonthStackParamList = {
  MonthView: undefined;
  QuickAddEntry: {
    date: Date;
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
