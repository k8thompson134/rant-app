/**
 * Type definitions for insights and trend analysis
 */

import { RantEntry } from './index';

/**
 * Time period options for filtering data
 */
export type TimePeriod = '7d' | '30d' | '90d' | 'all';

/**
 * Insight types for pattern detection
 */
export type InsightType = 'warning' | 'positive' | 'info';

/**
 * Weekly capsule data for bar chart visualization
 */
export interface WeeklyCapsuleData {
  symptom: string;
  dailyIntensities: number[]; // 7 values (0-10 scale), -1 for no data
  color: string;
  totalOccurrences: number;
}

/**
 * Symptom frequency data for rankings
 */
export interface SymptomFrequency {
  symptom: string;
  count: number;
  percentage: number; // 0-100
  color: string;
  avgSeverity?: number; // Average severity when this symptom appears
}

/**
 * Monthly summary statistics
 */
export interface MonthSummary {
  totalEntries: number;
  avgSeverity: number; // 0-10 scale
  goodDays: number; // Days with severity < 4
  moderateDays: number; // Days with severity 4-7
  roughDays: number; // Days with severity > 7
  topSymptom: {
    name: string;
    percentage: number;
  } | null;
  commonTrigger: string | null;
  period: {
    start: Date;
    end: Date;
  };
}

/**
 * Weekly statistics for trends view
 */
export interface WeeklyStats {
  totalEntries: number;
  avgSeverity: number;
  roughDays: number;
  goodDays: number;
  topSymptoms: SymptomFrequency[];
}

/**
 * Insight card data (for future pattern detection)
 */
export interface Insight {
  type: InsightType;
  title: string;
  description: string;
  confidence: number; // 0-1 (for future use)
  icon?: string; // Ionicons name
}

/**
 * Date range for filtering entries
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Daily aggregated data
 */
export interface DailyAggregate {
  date: Date;
  entries: RantEntry[];
  maxSeverity: number;
  symptoms: string[];
  avgSeverity: number;
}
