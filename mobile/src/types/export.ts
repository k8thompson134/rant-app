/**
 * Type definitions for data export functionality
 * Supports CSV, JSON, and plain text export formats
 */

export type ExportFormat = 'csv' | 'json' | 'txt';

export type DateRangePreset =
  | 'all_time'
  | 'last_30_days'
  | 'last_90_days'
  | 'custom';

export interface DateRange {
  start: number; // Unix timestamp
  end: number;   // Unix timestamp
}

export interface ExportOptions {
  format: ExportFormat;
  dateRangePreset: DateRangePreset;
  customDateRange?: DateRange;
  includeSymptomDetails?: boolean; // Include severity, pain qualifiers, etc.
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
}
