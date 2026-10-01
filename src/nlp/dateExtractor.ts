/**
 * Date/Time Extractor - Temporal expression parsing
 *
 * Comprehensive date parsing for catch-up flow:
 * - Absolute dates: "Monday", "March 15th", "last Tuesday"
 * - Relative dates: "yesterday", "two days ago", "three days back"
 * - Temporal markers for segmentation: "Friday I woke up..."
 */

import * as chrono from 'chrono-node';

export interface DateSegment {
  /** Parsed date as Unix timestamp in milliseconds */
  timestamp: number;

  /** The original text that was matched (e.g., "yesterday", "last Monday") */
  matchedText: string;

  /** Start position of the date marker in the original text */
  startIndex: number;

  /** End position of the date marker in the original text */
  endIndex: number;

  /** Confidence level from chrono (0-1) */
  confidence: number;

  /** Human-readable date string */
  dateString: string;
}

export interface SegmentedEntry {
  /** The date this text belongs to */
  timestamp: number;

  /** Human-readable date */
  dateString: string;

  /** The text content for this date */
  text: string;

  /** Original position in the input text */
  startIndex: number;

  /** End position in the input text */
  endIndex: number;

  /** Was this date explicitly mentioned or inferred? */
  explicit: boolean;
}

/**
 * Extract all date/time references from text
 * All dates are assumed to be in the past for symptom tracking
 */
export function extractDates(text: string, referenceDate?: Date): DateSegment[] {
  const refDate = referenceDate || new Date();

  const parsed = chrono.parse(text, refDate, { forwardDate: false });

  const dateSegments: DateSegment[] = [];
  const now = refDate.getTime();

  for (const result of parsed) {
    let date = result.start.date();

    if (date.getTime() > now) {
      date = new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000));

      // Safety check: if still in future, keep subtracting weeks
      while (date.getTime() > now) {
        date = new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000));
      }
    }

    // Calculate confidence based on chrono's certainty
    const confidence = calculateConfidence(result);

    dateSegments.push({
      timestamp: date.getTime(),
      matchedText: result.text,
      startIndex: result.index,
      endIndex: result.index + result.text.length,
      confidence,
      dateString: formatDate(date),
    });
  }

  // Sort by position in text
  return dateSegments.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Segment a multi-day text entry into separate entries by date
 */
export function segmentByDate(text: string, referenceDate?: Date): SegmentedEntry[] {
  const dates = extractDates(text, referenceDate);

  // If no dates found, return single entry with current date
  if (dates.length === 0) {
    const now = referenceDate || new Date();
    return [{
      timestamp: now.getTime(),
      dateString: formatDate(now),
      text: text.trim(),
      startIndex: 0,
      endIndex: text.length,
      explicit: false,
    }];
  }

  const segments: SegmentedEntry[] = [];

  // Process each date marker and the text that follows it
  for (let i = 0; i < dates.length; i++) {
    const currentDate = dates[i];
    const nextDate = dates[i + 1];

    // Extract text from after the date marker to the next date marker (or end of text)
    const textStart = currentDate.endIndex;
    const textEnd = nextDate ? nextDate.startIndex : text.length;
    const segmentText = text.substring(textStart, textEnd).trim();

    // Skip empty segments
    if (segmentText.length === 0) {
      continue;
    }

    segments.push({
      timestamp: currentDate.timestamp,
      dateString: currentDate.dateString,
      text: segmentText,
      startIndex: textStart,
      endIndex: textEnd,
      explicit: true,
    });
  }

  // Handle text before the first date marker
  if (dates.length > 0 && dates[0].startIndex > 0) {
    const prefaceText = text.substring(0, dates[0].startIndex).trim();
    if (prefaceText.length > 0) {
      // This text doesn't have a date - use current date
      const now = referenceDate || new Date();
      segments.unshift({
        timestamp: now.getTime(),
        dateString: formatDate(now),
        text: prefaceText,
        startIndex: 0,
        endIndex: dates[0].startIndex,
        explicit: false,
      });
    }
  }

  return segments;
}

/**
 * Check if user has missed days (3+ days without entries)
 */
export function hasMissedDays(lastEntryTimestamp: number, threshold: number = 3): boolean {
  const now = Date.now();
  const daysSince = (now - lastEntryTimestamp) / (1000 * 60 * 60 * 24);
  return daysSince >= threshold;
}

/**
 * Get the number of days since last entry
 */
export function getDaysSinceLastEntry(lastEntryTimestamp: number): number {
  const now = Date.now();
  return Math.floor((now - lastEntryTimestamp) / (1000 * 60 * 60 * 24));
}

/**
 * Format a date for display
 */
export function formatDate(date: Date): string {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time components for comparison
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  } else {
    // Format as "Monday, March 15"
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }
}

/**
 * Format a short date for compact display
 */
export function formatDateShort(date: Date): string {
  const now = new Date();
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const daysDiff = Math.floor((todayOnly.getTime() - dateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    return 'Today';
  } else if (daysDiff === 1) {
    return 'Yesterday';
  } else if (daysDiff < 7) {
    // Show day of week (e.g., "Monday")
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  } else {
    // Show date (e.g., "Mar 15")
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

/**
 * Calculate confidence score for a chrono result
 */
function calculateConfidence(result: any): number {
  // chrono doesn't provide direct confidence, so we estimate based on:
  // 1. Whether it's a specific date vs vague reference
  // 2. Number of components parsed (day, month, year)

  let confidence = 0.5; // Base confidence

  // Check if day is specified
  if (result.start.get('day') !== null) {
    confidence += 0.2;
  }

  // Check if month is specified
  if (result.start.get('month') !== null) {
    confidence += 0.15;
  }

  // Check if year is specified
  if (result.start.get('year') !== null) {
    confidence += 0.15;
  }

  // Boost confidence for certain keywords
  const textLower = result.text.toLowerCase();
  if (textLower.includes('yesterday') || textLower.includes('today')) {
    confidence = Math.max(confidence, 0.9);
  }

  // Specific weekdays get high confidence
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  if (weekdays.some(day => textLower.includes(day))) {
    confidence = Math.max(confidence, 0.8);
  }

  return Math.min(confidence, 1.0);
}

/**
 * Normalize a date to start of day (00:00:00)
 */
export function normalizeToStartOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * Group segments by date (combine segments with same date)
 */
export function groupSegmentsByDate(segments: SegmentedEntry[]): SegmentedEntry[] {
  const grouped = new Map<number, SegmentedEntry>();

  for (const segment of segments) {
    const normalizedDate = normalizeToStartOfDay(segment.timestamp);

    if (grouped.has(normalizedDate)) {
      // Combine text with existing segment
      const existing = grouped.get(normalizedDate)!;
      existing.text = existing.text + ' ' + segment.text;
      existing.endIndex = segment.endIndex;
      // Keep explicit = true if either segment was explicit
      existing.explicit = existing.explicit || segment.explicit;
    } else {
      // Create new grouped segment with normalized date
      grouped.set(normalizedDate, {
        ...segment,
        timestamp: normalizedDate,
      });
    }
  }

  // Return sorted by date (oldest first)
  return Array.from(grouped.values()).sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Validate and fix dates to ensure they're in the past
 * This function modifies segments to fix any future dates
 */
export function validateAndFixDates(segments: SegmentedEntry[]): SegmentedEntry[] {
  const now = Date.now();
  const today = normalizeToStartOfDay(now);

  return segments.map(segment => {
    // If date is in the future, move it to the past
    if (segment.timestamp > today) {
      // Move back by weeks until it's in the past
      let fixedDate = new Date(segment.timestamp);
      while (fixedDate.getTime() > today) {
        fixedDate = new Date(fixedDate.getTime() - (7 * 24 * 60 * 60 * 1000));
      }

      return {
        ...segment,
        timestamp: fixedDate.getTime(),
        dateString: formatDate(fixedDate),
      };
    }

    return segment;
  });
}

/**
 * Validate that all dates are in the past or today (legacy - prefer validateAndFixDates)
 */
export function validateDates(segments: SegmentedEntry[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const now = Date.now();
  const today = normalizeToStartOfDay(now);

  for (const segment of segments) {
    if (segment.timestamp > today) {
      errors.push(`Date "${segment.dateString}" is in the future`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
