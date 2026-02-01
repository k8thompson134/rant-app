/**
 * Data export utilities for RantTrack
 * Supports CSV, JSON, and plain text formats
 * 100% local processing - no network calls
 */

import { Paths, File, Directory } from 'expo-file-system';
import { RantEntry } from '../types';
import { ExportFormat, ExportExportDateRange, ExportResult } from '../types';

/**
 * Format date for human readability
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format date for file names (safe characters only)
 */
function formatDateForFilename(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Filter entries by date range
 */
export function filterEntriesByExportDateRange(
  entries: RantEntry[],
  range?: ExportDateRange
): RantEntry[] {
  if (!range) return entries;

  return entries.filter(
    (entry) => entry.timestamp >= range.start && entry.timestamp <= range.end
  );
}

/**
 * Export entries as CSV format
 * Columns: Date, Time, Entry Text, Symptoms (comma-separated), Severity Counts
 */
export function exportToCSV(entries: RantEntry[]): string {
  // CSV Header
  const headers = [
    'Date',
    'Time',
    'Entry Text',
    'Symptom Count',
    'Symptoms',
    'Mild Count',
    'Moderate Count',
    'Severe Count',
  ];

  // CSV Rows
  const rows = entries.map((entry) => {
    const date = new Date(entry.timestamp);
    const dateStr = date.toLocaleDateString('en-US');
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Extract symptom names and severity counts
    const symptomNames = entry.symptoms.map((s) => s.symptom).join('; ');

    const severityCounts = {
      mild: entry.symptoms.filter((s) => s.severity === 'mild').length,
      moderate: entry.symptoms.filter((s) => s.severity === 'moderate').length,
      severe: entry.symptoms.filter((s) => s.severity === 'severe').length,
    };

    // Escape text for CSV (handle quotes and commas)
    const escapeCSV = (text: string) => {
      if (text.includes('"') || text.includes(',') || text.includes('\n')) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    return [
      dateStr,
      timeStr,
      escapeCSV(entry.text),
      entry.symptoms.length.toString(),
      escapeCSV(symptomNames),
      severityCounts.mild.toString(),
      severityCounts.moderate.toString(),
      severityCounts.severe.toString(),
    ];
  });

  // Combine header and rows
  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  return csvContent;
}

/**
 * Export entries as JSON format
 * Full data export with all symptom details
 */
export function exportToJSON(entries: RantEntry[]): string {
  const exportData = {
    exportDate: new Date().toISOString(),
    appName: 'RantTrack',
    version: '0.9.0',
    entryCount: entries.length,
    entries: entries.map((entry) => ({
      id: entry.id,
      timestamp: entry.timestamp,
      date: formatDate(entry.timestamp),
      text: entry.text,
      symptoms: entry.symptoms.map((symptom) => ({
        name: symptom.symptom,
        matched: symptom.matched,
        severity: symptom.severity,
        method: symptom.method,
        painDetails: symptom.painDetails,
        trigger: symptom.trigger,
        duration: symptom.duration,
        timeOfDay: symptom.timeOfDay,
        confidence: symptom.confidence,
      })),
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export entries as plain text format
 * Human-readable format for easy reading/printing
 */
export function exportToText(entries: RantEntry[]): string {
  const lines: string[] = [
    '═══════════════════════════════════════',
    '       RantTrack Symptom Export',
    '═══════════════════════════════════════',
    '',
    `Export Date: ${formatDate(Date.now())}`,
    `Total Entries: ${entries.length}`,
    '',
    '═══════════════════════════════════════',
    '',
  ];

  entries.forEach((entry, index) => {
    lines.push(`Entry ${index + 1} of ${entries.length}`);
    lines.push(`Date: ${formatDate(entry.timestamp)}`);
    lines.push('');
    lines.push('What you wrote:');
    lines.push(`  ${entry.text}`);
    lines.push('');

    if (entry.symptoms.length > 0) {
      lines.push(`Symptoms detected (${entry.symptoms.length}):`);
      entry.symptoms.forEach((symptom) => {
        const severityStr = symptom.severity ? ` [${symptom.severity.toUpperCase()}]` : '';
        lines.push(`  • ${symptom.symptom}${severityStr}`);

        // Add pain details if available
        if (symptom.painDetails) {
          if (symptom.painDetails.qualifiers.length > 0) {
            lines.push(`    Qualifiers: ${symptom.painDetails.qualifiers.join(', ')}`);
          }
          if (symptom.painDetails.location) {
            lines.push(`    Location: ${symptom.painDetails.location}`);
          }
        }

        // Add trigger if available
        if (symptom.trigger) {
          const timeframe = symptom.trigger.timeframe || 'after';
          lines.push(`    Triggered ${timeframe} ${symptom.trigger.activity}`);
        }
      });
    } else {
      lines.push('No symptoms detected');
    }

    lines.push('');
    lines.push('───────────────────────────────────────');
    lines.push('');
  });

  lines.push('═══════════════════════════════════════');
  lines.push('         End of Export');
  lines.push('═══════════════════════════════════════');

  return lines.join('\n');
}

/**
 * Download/save exported data to the device's document directory
 */
export async function exportAndShare(
  entries: RantEntry[],
  format: ExportFormat,
  dateRangeLabel: string = 'all_time'
): Promise<ExportResult> {
  try {
    // Generate file content based on format
    let content: string;
    let extension: string;

    switch (format) {
      case 'csv':
        content = exportToCSV(entries);
        extension = 'csv';
        break;
      case 'json':
        content = exportToJSON(entries);
        extension = 'json';
        break;
      case 'txt':
        content = exportToText(entries);
        extension = 'txt';
        break;
      default:
        return {
          success: false,
          error: `Unsupported format: ${format}`,
        };
    }

    // Generate filename with date
    const dateStr = formatDateForFilename(Date.now());
    const fileName = `RantTrack_${dateRangeLabel}_${dateStr}.${extension}`;

    // Create exports directory if it doesn't exist
    const exportsDir = new Directory(Paths.document, 'exports');
    if (!exportsDir.exists) {
      exportsDir.create();
    }

    // Create file in exports directory
    const file = new File(exportsDir, fileName);

    // Write content to file
    await file.write(content);

    return {
      success: true,
      filePath: file.uri,
      fileName,
    };
  } catch (error) {
    console.error('Export failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Get date range based on preset
 */
export function getExportDateRangeFromPreset(preset: string): ExportDateRange | undefined {
  const now = Date.now();

  switch (preset) {
    case 'last_30_days':
      return {
        start: now - 30 * 24 * 60 * 60 * 1000,
        end: now,
      };
    case 'last_90_days':
      return {
        start: now - 90 * 24 * 60 * 60 * 1000,
        end: now,
      };
    case 'all_time':
      return undefined; // No filtering
    default:
      return undefined;
  }
}
