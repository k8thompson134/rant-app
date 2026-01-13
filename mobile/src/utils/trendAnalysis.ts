/**
 * Trend analysis and data aggregation utilities
 */

import { RantEntry, ExtractedSymptom } from '../types/index';
import {
  WeeklyCapsuleData,
  SymptomFrequency,
  MonthSummary,
  WeeklyStats,
  DateRange,
  DailyAggregate,
} from '../types/insights';
import { getSymptomColor } from '../types/index';
import {
  isSameDay,
  isSameMonth,
  startOfDay,
  endOfDay,
  getWeekDates,
} from './dateUtils';

/**
 * Filter entries by date range
 */
export function filterEntriesByDateRange(
  entries: RantEntry[],
  dateRange: DateRange
): RantEntry[] {
  const startTime = dateRange.start.getTime();
  const endTime = dateRange.end.getTime();

  return entries.filter((entry) => {
    const entryTime = entry.timestamp;
    return entryTime >= startTime && entryTime <= endTime;
  });
}

/**
 * Extract all symptoms from entries
 */
function extractAllSymptoms(entries: RantEntry[]): ExtractedSymptom[] {
  const allSymptoms: ExtractedSymptom[] = [];

  entries.forEach((entry) => {
    if (entry.symptoms) {
      const parsed =
        typeof entry.symptoms === 'string'
          ? JSON.parse(entry.symptoms)
          : entry.symptoms;
      allSymptoms.push(...parsed);
    }
  });

  return allSymptoms;
}

/**
 * Map severity string to numeric value (0-10 scale)
 */
function severityToNumber(severity?: 'mild' | 'moderate' | 'severe' | null): number {
  if (!severity) return 5; // Default moderate
  switch (severity) {
    case 'mild':
      return 3;
    case 'moderate':
      return 6;
    case 'severe':
      return 9;
    default:
      return 5;
  }
}

/**
 * Map numeric severity (0-10) to severity string
 */
export function numberToSeverity(numericSeverity: number): 'mild' | 'moderate' | 'severe' {
  if (numericSeverity < 4) return 'mild';
  if (numericSeverity <= 7) return 'moderate';
  return 'severe';
}

/**
 * Calculate average severity from numeric values
 */
function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Get maximum severity from an entry
 */
function getEntrySeverity(entry: RantEntry): number {
  if (!entry.symptoms) return 5;

  const parsed =
    typeof entry.symptoms === 'string'
      ? JSON.parse(entry.symptoms)
      : entry.symptoms;

  if (parsed.length === 0) return 5;

  const severities = parsed.map((s: ExtractedSymptom) =>
    severityToNumber(s.severity)
  );
  return Math.max(...severities);
}

/**
 * Group entries by day
 */
export function groupEntriesByDay(entries: RantEntry[]): DailyAggregate[] {
  const grouped = new Map<string, RantEntry[]>();

  entries.forEach((entry) => {
    const date = new Date(entry.timestamp);
    const dateKey = startOfDay(date).toISOString();

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(entry);
  });

  const aggregates: DailyAggregate[] = [];

  grouped.forEach((dayEntries, dateKey) => {
    const date = new Date(dateKey);
    const severities = dayEntries.map(getEntrySeverity);
    const maxSeverity = Math.max(...severities);
    const avgSeverity = calculateAverage(severities);

    const allSymptoms = new Set<string>();
    dayEntries.forEach((entry) => {
      if (entry.symptoms) {
        const parsed =
          typeof entry.symptoms === 'string'
            ? JSON.parse(entry.symptoms)
            : entry.symptoms;
        parsed.forEach((s: ExtractedSymptom) => allSymptoms.add(s.symptom));
      }
    });

    aggregates.push({
      date,
      entries: dayEntries,
      maxSeverity,
      avgSeverity,
      symptoms: Array.from(allSymptoms),
    });
  });

  return aggregates.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Calculate symptom frequency across entries
 */
export function calculateSymptomFrequency(
  entries: RantEntry[]
): SymptomFrequency[] {
  const symptomCounts = new Map<string, { count: number; severities: number[] }>();

  entries.forEach((entry) => {
    if (entry.symptoms) {
      const parsed =
        typeof entry.symptoms === 'string'
          ? JSON.parse(entry.symptoms)
          : entry.symptoms;

      parsed.forEach((symptom: ExtractedSymptom) => {
        const name = symptom.symptom;
        const existing = symptomCounts.get(name) || { count: 0, severities: [] };
        existing.count += 1;
        existing.severities.push(severityToNumber(symptom.severity));
        symptomCounts.set(name, existing);
      });
    }
  });

  const totalEntries = entries.length;
  const frequencies: SymptomFrequency[] = [];

  symptomCounts.forEach(({ count, severities }, symptom) => {
    frequencies.push({
      symptom,
      count,
      percentage: totalEntries > 0 ? (count / totalEntries) * 100 : 0,
      color: getSymptomColor(symptom),
      avgSeverity: calculateAverage(severities),
    });
  });

  return frequencies.sort((a, b) => b.count - a.count);
}

/**
 * Get weekly capsule data for visualization
 */
export function getWeeklyCapsuleData(
  entries: RantEntry[],
  weekStart: Date
): WeeklyCapsuleData[] {
  const weekDates = getWeekDates(weekStart);
  const dailyData = groupEntriesByDay(entries);

  // Get top symptoms for the week
  const topSymptoms = calculateSymptomFrequency(entries).slice(0, 6);

  const capsuleData: WeeklyCapsuleData[] = topSymptoms.map((symptomFreq) => {
    const dailyIntensities: number[] = weekDates.map((date) => {
      const dayData = dailyData.find((d) => isSameDay(d.date, date));

      if (!dayData) return -1; // No data for this day

      // Find this symptom in the day's entries
      let maxSeverityForSymptom = -1;

      dayData.entries.forEach((entry) => {
        if (entry.symptoms) {
          const parsed =
            typeof entry.symptoms === 'string'
              ? JSON.parse(entry.symptoms)
              : entry.symptoms;

          parsed.forEach((s: ExtractedSymptom) => {
            if (s.symptom === symptomFreq.symptom) {
              const severity = severityToNumber(s.severity);
              maxSeverityForSymptom = Math.max(maxSeverityForSymptom, severity);
            }
          });
        }
      });

      return maxSeverityForSymptom;
    });

    return {
      symptom: symptomFreq.symptom,
      dailyIntensities,
      color: symptomFreq.color,
      totalOccurrences: symptomFreq.count,
    };
  });

  return capsuleData;
}

/**
 * Calculate monthly summary statistics
 */
export function getMonthSummary(
  entries: RantEntry[],
  month: Date
): MonthSummary {
  // Filter entries for the month
  const monthEntries = entries.filter((entry) =>
    isSameMonth(entry.timestamp, month)
  );

  if (monthEntries.length === 0) {
    return {
      totalEntries: 0,
      avgSeverity: 0,
      goodDays: 0,
      moderateDays: 0,
      roughDays: 0,
      topSymptom: null,
      commonTrigger: null,
      period: {
        start: new Date(month.getFullYear(), month.getMonth(), 1),
        end: new Date(month.getFullYear(), month.getMonth() + 1, 0),
      },
    };
  }

  // Calculate average severity
  const severities = monthEntries.map(getEntrySeverity);
  const avgSeverity = calculateAverage(severities);

  // Count severity distribution
  const goodDays = severities.filter((s) => s < 4).length;
  const moderateDays = severities.filter((s) => s >= 4 && s <= 7).length;
  const roughDays = severities.filter((s) => s > 7).length;

  // Find top symptom
  const symptomFreqs = calculateSymptomFrequency(monthEntries);
  const topSymptom =
    symptomFreqs.length > 0
      ? {
          name: symptomFreqs[0].symptom,
          percentage: symptomFreqs[0].percentage,
        }
      : null;

  // Find most common trigger
  const triggers = new Map<string, number>();
  monthEntries.forEach((entry) => {
    if (entry.symptoms) {
      const parsed =
        typeof entry.symptoms === 'string'
          ? JSON.parse(entry.symptoms)
          : entry.symptoms;

      parsed.forEach((symptom: ExtractedSymptom) => {
        if (symptom.trigger?.activity) {
          const activity = symptom.trigger.activity;
          triggers.set(activity, (triggers.get(activity) || 0) + 1);
        }
      });
    }
  });

  let commonTrigger: string | null = null;
  let maxCount = 0;
  triggers.forEach((count, trigger) => {
    if (count > maxCount) {
      maxCount = count;
      commonTrigger = trigger;
    }
  });

  return {
    totalEntries: monthEntries.length,
    avgSeverity,
    goodDays,
    moderateDays,
    roughDays,
    topSymptom,
    commonTrigger,
    period: {
      start: new Date(month.getFullYear(), month.getMonth(), 1),
      end: new Date(month.getFullYear(), month.getMonth() + 1, 0),
    },
  };
}

/**
 * Calculate weekly statistics
 */
export function getWeeklyStats(
  entries: RantEntry[],
  weekStart: Date
): WeeklyStats {
  if (entries.length === 0) {
    return {
      totalEntries: 0,
      avgSeverity: 0,
      roughDays: 0,
      goodDays: 0,
      topSymptoms: [],
    };
  }

  const severities = entries.map(getEntrySeverity);
  const avgSeverity = calculateAverage(severities);
  const roughDays = severities.filter((s) => s > 7).length;
  const goodDays = severities.filter((s) => s < 4).length;
  const topSymptoms = calculateSymptomFrequency(entries).slice(0, 5);

  return {
    totalEntries: entries.length,
    avgSeverity,
    roughDays,
    goodDays,
    topSymptoms,
  };
}

/**
 * Generate month summary text (simple template-based)
 */
export function generateSummaryText(summary: MonthSummary): string {
  const { totalEntries, topSymptom, commonTrigger } = summary;

  if (totalEntries === 0) {
    return "Not enough data yet – keep logging entries and we'll show patterns soon.";
  }

  const plural = totalEntries === 1 ? 'entry' : 'entries';
  let text = `You've logged ${totalEntries} ${plural} this month. `;

  if (topSymptom) {
    // Capitalize the symptom name for display
    const symptomName = topSymptom.name.charAt(0).toUpperCase() + topSymptom.name.slice(1);
    text += `${symptomName} has been your most consistent symptom, `;
    text += `appearing in ${Math.round(topSymptom.percentage)}% of entries. `;
  }

  if (commonTrigger) {
    text += `Your roughest days tend to follow ${commonTrigger}.`;
  }

  return text;
}
