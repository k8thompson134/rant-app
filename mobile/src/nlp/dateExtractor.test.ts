/**
 * Date Extractor Tests
 *
 * These tests verify that date extraction always assumes past dates
 */

import { extractDates, segmentByDate, validateAndFixDates } from './dateExtractor';

// Helper to create a reference date (Monday, Jan 6, 2025 at 2pm)
const createReferenceDate = () => new Date(2025, 0, 6, 14, 0, 0); // Monday

describe('Date Extraction - Past Dates Only', () => {
  test('should parse "Friday" as last Friday, not next Friday', () => {
    const refDate = createReferenceDate(); // Monday, Jan 6
    const text = "On Friday I had a terrible headache";

    const dates = extractDates(text, refDate);
    expect(dates.length).toBe(1);

    const extractedDate = new Date(dates[0].timestamp);
    // Should be Friday, Jan 3 (3 days before Monday, Jan 6)
    expect(extractedDate.getDate()).toBe(3);
    expect(extractedDate.getMonth()).toBe(0); // January

    // Verify it's in the past
    expect(dates[0].timestamp).toBeLessThan(refDate.getTime());
  });

  test('should parse "Wednesday" as last Wednesday, not next Wednesday', () => {
    const refDate = createReferenceDate(); // Monday, Jan 6
    const text = "Wednesday was rough";

    const dates = extractDates(text, refDate);
    expect(dates.length).toBe(1);

    const extractedDate = new Date(dates[0].timestamp);
    // Should be Wednesday, Jan 1 (5 days before Monday, Jan 6)
    expect(extractedDate.getDate()).toBe(1);

    // Verify it's in the past
    expect(dates[0].timestamp).toBeLessThan(refDate.getTime());
  });

  test('should handle multiple weekdays in past', () => {
    const refDate = createReferenceDate(); // Monday, Jan 6
    const text = "Friday I had fatigue. Saturday I rested. Sunday I felt better.";

    const dates = extractDates(text, refDate);
    expect(dates.length).toBe(3);

    // All dates should be in the past
    dates.forEach(date => {
      expect(date.timestamp).toBeLessThan(refDate.getTime());
    });
  });

  test('should parse "yesterday" correctly', () => {
    const refDate = createReferenceDate(); // Monday, Jan 6
    const text = "Yesterday I had pain";

    const dates = extractDates(text, refDate);
    expect(dates.length).toBe(1);
    expect(dates[0].matchedText.toLowerCase()).toContain('yesterday');

    // Should be Sunday, Jan 5
    const extractedDate = new Date(dates[0].timestamp);
    expect(extractedDate.getDate()).toBe(5);
  });

  test('should never return future dates', () => {
    const refDate = createReferenceDate(); // Monday, Jan 6
    const text = "Tuesday I woke up tired. Thursday I had brain fog.";

    const dates = extractDates(text, refDate);

    // Both dates should be in the past
    dates.forEach(date => {
      expect(date.timestamp).toBeLessThanOrEqual(refDate.getTime());
    });
  });
});

describe('Segment By Date - Past Dates Only', () => {
  test('should segment multi-day text with past dates', () => {
    const refDate = createReferenceDate(); // Monday, Jan 6
    const text = "Friday I had a headache. Saturday I was exhausted. Sunday I felt better.";

    const segments = segmentByDate(text, refDate);

    // Should have 3 segments, all in the past
    expect(segments.length).toBe(3);
    segments.forEach(segment => {
      expect(segment.timestamp).toBeLessThan(refDate.getTime());
    });
  });

  test('should handle text before first date marker', () => {
    const refDate = createReferenceDate(); // Monday, Jan 6
    const text = "I've been feeling terrible. Friday I had pain.";

    const segments = segmentByDate(text, refDate);

    // Should have 2 segments
    expect(segments.length).toBe(2);

    // First segment should be marked as inferred (no explicit date)
    expect(segments[0].explicit).toBe(false);
    expect(segments[0].text).toContain("I've been feeling terrible");

    // Second segment should be explicit
    expect(segments[1].explicit).toBe(true);
    expect(segments[1].text).toContain("I had pain");
  });
});

describe('Validate and Fix Dates', () => {
  test('should fix future dates to past', () => {
    const refDate = createReferenceDate(); // Monday, Jan 6

    // Manually create a segment with a future date (this shouldn't happen, but test the safety net)
    const futureDate = new Date(2025, 0, 10); // Friday, Jan 10 (future)
    const segments = [{
      timestamp: futureDate.getTime(),
      dateString: 'Friday, January 10',
      text: 'I had symptoms',
      startIndex: 0,
      endIndex: 16,
      explicit: true,
    }];

    const fixed = validateAndFixDates(segments);

    // Should be moved to the past
    expect(fixed[0].timestamp).toBeLessThan(refDate.getTime());
  });

  test('should not modify past dates', () => {
    const refDate = createReferenceDate(); // Monday, Jan 6
    const pastDate = new Date(2025, 0, 3); // Friday, Jan 3 (past)

    const segments = [{
      timestamp: pastDate.getTime(),
      dateString: 'Friday, January 3',
      text: 'I had symptoms',
      startIndex: 0,
      endIndex: 16,
      explicit: true,
    }];

    const fixed = validateAndFixDates(segments);

    // Should remain unchanged
    expect(fixed[0].timestamp).toBe(segments[0].timestamp);
  });
});
