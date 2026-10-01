/**
 * Export & Share Types
 * Type definitions for data export and sharing functionality.
 */

/**
 * Supported export file formats
 */
export type ExportFormat = 'csv' | 'json' | 'txt';

/**
 * Preset date range options for export filtering
 */
export type DateRangePreset =
  | 'last_7_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'all_time'
  | 'custom';

/**
 * Date range filter for export queries
 */
export interface DateRangeFilter {
  /** The preset range type */
  preset: DateRangePreset;
  /** Start date (ISO string or timestamp) - required for 'custom' preset */
  startDate?: string | number;
  /** End date (ISO string or timestamp) - required for 'custom' preset */
  endDate?: string | number;
}

/**
 * Export configuration options
 */
export interface ExportOptions {
  /** File format for the export */
  format: ExportFormat;
  /** Date range filter for entries */
  dateRange: DateRangeFilter;
  /** Include symptom details in export (default: true) */
  includeSymptoms?: boolean;
  /** Include raw text in export (default: true) */
  includeRawText?: boolean;
  /** Include timestamps in export (default: true) */
  includeTimestamps?: boolean;
  /** Pretty-print JSON output (default: false) */
  prettyJson?: boolean;
  /** CSV delimiter character (default: ',') */
  csvDelimiter?: ',' | ';' | '\t';
  /** Include header row in CSV (default: true) */
  csvIncludeHeaders?: boolean;
}

/**
 * Result of an export operation
 */
export interface ExportResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
}

/**
 * Date range for export filtering (number timestamps)
 */
export interface ExportDateRange {
  start: number;
  end: number;
}

/**
 * Preset date range to actual dates converter result
 */
export interface ResolvedDateRange {
  /** Start timestamp (milliseconds since epoch) */
  startTimestamp: number;
  /** End timestamp (milliseconds since epoch) */
  endTimestamp: number;
  /** Human-readable description */
  description: string;
}

/**
 * Share options for exported files (React Native Share API compatible)
 */
export interface ShareOptions {
  /** Title for the share dialog */
  title?: string;
  /** Message to accompany the shared file */
  message?: string;
  /** File URL to share */
  url: string;
  /** Subject line (for email) */
  subject?: string;
}

/**
 * Export statistics for UI display
 */
export interface ExportStats {
  /** Total number of entries in export */
  totalEntries: number;
  /** Total number of unique symptoms across all entries */
  uniqueSymptoms: number;
  /** Date range covered by the export */
  dateRange: {
    earliest: string; // ISO date string
    latest: string; // ISO date string
  };
  /** Average symptoms per entry */
  avgSymptomsPerEntry: number;
}
