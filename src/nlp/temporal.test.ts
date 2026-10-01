/**
 * Comprehensive tests for enhanced temporal pattern extraction
 *
 * Tests cover:
 * - Duration extraction (existing patterns + enhancements)
 * - Time progression detection (improving, worsening, recurring)
 * - Multi-day patterns (3 days of fatigue, crashed for a week)
 * - Recovery duration patterns
 * - Time of day extraction
 * - Temporal marker detection
 * - Real-world scenarios
 */

import { extractDuration, extractTimeOfDay, findTemporalMarkers } from './extractor';
import { SymptomDuration, TimeOfDay } from '../types';

describe('Enhanced Temporal Pattern Extraction', () => {
  // ============================================================================
  // DURATION EXTRACTION - EXISTING PATTERNS
  // ============================================================================

  describe('extractDuration - Existing duration patterns', () => {
    test('extracts "for X hours" pattern', () => {
      const duration = extractDuration('Headache for 3 hours');
      expect(duration?.value).toBe(3);
      expect(duration?.unit).toBe('hours');
    });

    test('extracts "X hours of pain" pattern', () => {
      const duration = extractDuration('2 hours of pain');
      expect(duration?.value).toBe(2);
      expect(duration?.unit).toBe('hours');
    });

    test('extracts qualifier phrases', () => {
      const allDayDuration = extractDuration('Pain all day');
      expect(allDayDuration?.qualifier).toBe('all');

      const halfDayDuration = extractDuration('Fatigue half the day');
      expect(halfDayDuration?.qualifier).toBe('half');

      const mostDayDuration = extractDuration('Most of the day tired');
      expect(mostDayDuration?.qualifier).toBe('most_of');
    });

    test('extracts "since" patterns', () => {
      const duration = extractDuration('Nausea since yesterday');
      expect(duration?.since).toBe('yesterday');
      expect(duration?.ongoing).toBe(true);
    });

    test('extracts "lasted X hours" pattern', () => {
      const duration = extractDuration('Migraine lasted 4 hours');
      expect(duration?.value).toBe(4);
      expect(duration?.unit).toBe('hours');
    });

    test('detects ongoing indicators', () => {
      const stillDuration = extractDuration('Still have the headache');
      expect(stillDuration?.ongoing).toBe(true);

      const persistentDuration = extractDuration('Persistent dizziness');
      expect(persistentDuration?.ongoing).toBe(true);
    });
  });

  // ============================================================================
  // DURATION EXTRACTION - ENHANCED PATTERNS
  // ============================================================================

  describe('extractDuration - Enhanced multi-day patterns', () => {
    test('extracts "X days of fatigue" pattern', () => {
      const duration = extractDuration('3 days of fatigue');
      expect(duration?.value).toBe(3);
      expect(duration?.unit).toBe('days');
      expect(duration?.qualifier).toBe('all');
    });

    test('extracts "X weeks of pain" pattern', () => {
      const duration = extractDuration('2 weeks of joint pain');
      expect(duration?.value).toBe(2);
      expect(duration?.unit).toBe('weeks');
    });

    test('extracts "crashed for X days" pattern', () => {
      const duration = extractDuration('Crashed for 3 days');
      expect(duration?.value).toBe(3);
      expect(duration?.unit).toBe('days');
      expect(duration?.progression).toBe('progressive_worsening');
    });

    test('extracts "crashed for X weeks" pattern', () => {
      const duration = extractDuration('Crashed for a week');
      expect(duration?.unit).toBe('weeks');
      expect(duration?.progression).toBe('progressive_worsening');
    });

    test('extracts "out for X days" pattern', () => {
      const duration = extractDuration('Out for 5 days');
      expect(duration?.value).toBe(5);
      expect(duration?.unit).toBe('days');
      expect(duration?.ongoing).toBe(true);
    });
  });

  // ============================================================================
  // TIME PROGRESSION DETECTION
  // ============================================================================

  describe('extractDuration - Time progression patterns', () => {
    test('detects progressive worsening', () => {
      const duration = extractDuration('Pain getting worse throughout the day');
      expect(duration?.progression).toBe('progressive_worsening');
    });

    test('detects gradual worsening', () => {
      const duration = extractDuration('Gradually worse as day goes on');
      expect(duration?.progression).toBe('progressive_worsening');
    });

    test('detects progressive improving', () => {
      const duration = extractDuration('Getting better each day');
      expect(duration?.progression).toBe('progressive_improving');
    });

    test('detects improving trend', () => {
      const duration = extractDuration('Improving gradually');
      expect(duration?.progression).toBe('progressive_improving');
    });

    test('detects recurring pattern', () => {
      const duration = extractDuration('Symptoms come and go all day');
      expect(duration?.progression).toBe('recurring');
    });

    test('detects in-waves pattern', () => {
      const duration = extractDuration('Fatigue comes in waves');
      expect(duration?.progression).toBe('recurring');
    });

    test('detects flare-up pattern', () => {
      const duration = extractDuration('Pain flares up periodically');
      expect(duration?.progression).toBe('recurring');
    });

    test('detects stable/no-change pattern', () => {
      const duration = extractDuration('Symptoms unchanged from yesterday');
      expect(duration?.progression).toBe('stable');
    });

    test('detects fluctuating pattern', () => {
      const duration = extractDuration('Dizziness varies throughout the day');
      expect(duration?.progression).toBe('fluctuating');
    });
  });

  // ============================================================================
  // RECOVERY DURATION PATTERNS
  // ============================================================================

  describe('extractDuration - Recovery patterns', () => {
    test('extracts "takes X hours to recover" pattern', () => {
      const duration = extractDuration('Takes 3 hours to recover');
      expect(duration?.value).toBe(3);
      expect(duration?.unit).toBe('hours');
    });

    test('extracts "takes days to recover" pattern', () => {
      const duration = extractDuration('Takes days to recover from activities');
      expect(duration?.unit).toBe('days');
    });

    test('extracts "takes weeks to recover" pattern', () => {
      const duration = extractDuration('Takes weeks to recover');
      expect(duration?.unit).toBe('weeks');
      expect(duration?.value).toBe(1);
    });

    test('detects "recovers overnight" pattern', () => {
      const duration = extractDuration('Usually recovers overnight');
      expect(duration?.unit).toBe('hours');
      expect(duration?.value).toBe(8);
    });

    test('detects "quick recovery" pattern', () => {
      const duration = extractDuration('Seems to recover quickly');
      expect(duration?.unit).toBe('hours');
      expect(duration?.value).toBe(4);
    });

    test('detects "slow recovery" pattern', () => {
      const duration = extractDuration('Very slow recovery from exertion');
      expect(duration?.unit).toBe('days');
    });

    test('detects "not recovering" pattern', () => {
      const duration = extractDuration('Not recovering well');
      expect(duration?.ongoing).toBe(true);
    });

    test('detects "still not recovered" pattern', () => {
      const duration = extractDuration('Still not recovered from last week');
      expect(duration?.ongoing).toBe(true);
    });
  });

  // ============================================================================
  // COMBINED DURATION AND PROGRESSION
  // ============================================================================

  describe('extractDuration - Combined patterns', () => {
    test('combines duration with progression', () => {
      const duration = extractDuration('3 days of fatigue, getting worse');
      expect(duration?.value).toBe(3);
      expect(duration?.unit).toBe('days');
      expect(duration?.progression).toBe('progressive_worsening');
    });

    test('combines "all day" qualifier with progression', () => {
      const duration = extractDuration('Pain all day, comes and goes');
      expect(duration?.qualifier).toBe('all');
      expect(duration?.progression).toBe('recurring');
    });

    test('combines ongoing indicator with duration', () => {
      const duration = extractDuration('Still have fatigue for 2 weeks');
      expect(duration?.value).toBe(2);
      expect(duration?.unit).toBe('weeks');
      expect(duration?.ongoing).toBe(true);
    });

    test('combines recovery pattern with progression', () => {
      const duration = extractDuration('Takes days to recover, slowly improving');
      expect(duration?.unit).toBe('days');
      expect(duration?.progression).toBe('progressive_improving');
    });
  });

  // ============================================================================
  // TIME OF DAY EXTRACTION
  // ============================================================================

  describe('extractTimeOfDay - Basic patterns', () => {
    test('extracts morning time', () => {
      const timeOfDay = extractTimeOfDay('Morning headache');
      expect(timeOfDay).toBe('morning');
    });

    test('extracts afternoon time', () => {
      const timeOfDay = extractTimeOfDay('Energy crashes in afternoon');
      expect(timeOfDay).toBe('afternoon');
    });

    test('extracts evening time', () => {
      const timeOfDay = extractTimeOfDay('Worse in evening');
      expect(timeOfDay).toBe('evening');
    });

    test('extracts night time', () => {
      const timeOfDay = extractTimeOfDay('Middle of the night panic');
      expect(timeOfDay).toBe('night');
    });

    test('extracts all-day indicator', () => {
      const timeOfDay = extractTimeOfDay('Nausea all day');
      expect(timeOfDay).toBe('all_day');
    });

    test('prefers longer phrases', () => {
      const timeOfDay = extractTimeOfDay('Woke up with pain this morning');
      expect(timeOfDay).toBe('morning');
    });
  });

  // ============================================================================
  // TEMPORAL MARKERS
  // ============================================================================

  describe('findTemporalMarkers - Marker detection', () => {
    test('finds time-of-day markers', () => {
      const markers = findTemporalMarkers('Morning headache that lasted all day');
      const timeMarkers = markers.filter(m => m.timeOfDay);
      expect(timeMarkers.length).toBeGreaterThan(0);
    });

    test('finds duration markers', () => {
      const markers = findTemporalMarkers('Fatigue for 3 hours');
      const durationMarkers = markers.filter(m => m.duration);
      expect(durationMarkers.length).toBeGreaterThan(0);
    });

    test('finds multiple markers', () => {
      const markers = findTemporalMarkers('Morning pain for 2 hours, all day tiredness');
      expect(markers.length).toBeGreaterThan(1);
    });

    test('includes marker positions', () => {
      const markers = findTemporalMarkers('All day fatigue');
      const allDayMarker = markers.find(m => m.phrase === 'all day');
      expect(allDayMarker?.position).toBeDefined();
      expect(allDayMarker?.position).toBeGreaterThanOrEqual(0);
    });

    test('includes phrase text in markers', () => {
      const markers = findTemporalMarkers('Pain since yesterday');
      expect(markers.some(m => m.phrase.includes('since'))).toBe(true);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('extractDuration - Edge cases', () => {
    test('handles empty string', () => {
      const duration = extractDuration('');
      expect(duration).toBeNull();
    });

    test('handles text without temporal info', () => {
      const duration = extractDuration('I went to the store');
      expect(duration).toBeNull();
    });

    test('handles multiple duration mentions', () => {
      const duration = extractDuration('Was tired for 2 hours, then crashed for 3 days');
      // Should extract the first/most relevant one
      expect(duration).toBeDefined();
    });

    test('handles large numbers', () => {
      const duration = extractDuration('Out for 100 days');
      expect(duration?.value).toBe(100);
      expect(duration?.unit).toBe('days');
    });

    test('handles abbreviated units', () => {
      const duration = extractDuration('Pain for 3 hrs');
      expect(duration?.value).toBe(3);
      expect(duration?.unit).toBe('hours');
    });

    test('handles mixed case', () => {
      const duration = extractDuration('FATIGUE FOR 2 HOURS');
      expect(duration?.value).toBe(2);
      expect(duration?.unit).toBe('hours');
    });

    test('prioritizes explicit patterns over vague ones', () => {
      const duration = extractDuration('Crashed for a week, gradually worse');
      expect(duration?.value).toBe(1);
      expect(duration?.unit).toBe('weeks');
      expect(duration?.progression).toBe('progressive_worsening');
    });
  });

  // ============================================================================
  // REAL-WORLD SCENARIOS
  // ============================================================================

  describe('extractDuration - Real-world examples', () => {
    test('handles PEM crash description', () => {
      const duration = extractDuration('Crashed hard from gardening, out of commission for 4 days, still recovering');
      expect(duration?.value).toBe(4);
      expect(duration?.unit).toBe('days');
      expect(duration?.ongoing).toBe(true);
    });

    test('handles progressive deterioration pattern', () => {
      const duration = extractDuration('Started fine, gradually got worse throughout the day, by evening could barely move');
      expect(duration?.progression).toBe('progressive_worsening');
    });

    test('handles recovery timeline pattern', () => {
      const duration = extractDuration('Takes 2-3 days to fully recover from minimal activity');
      // Should extract the recovery duration
      expect(duration?.unit).toBe('days');
    });

    test('handles fluctuating symptom description', () => {
      const duration = extractDuration('Brain fog all day, varies throughout, worse in afternoon, better by evening');
      expect(duration?.qualifier).toBe('all');
      expect(duration?.progression).toBe('fluctuating');
    });

    test('handles ongoing symptom with specific duration', () => {
      const duration = extractDuration('Still experiencing migraines, have been for 2 weeks straight');
      expect(duration?.value).toBe(2);
      expect(duration?.unit).toBe('weeks');
      expect(duration?.ongoing).toBe(true);
    });

    test('handles medical-style description', () => {
      const duration = extractDuration('Patient reports symptoms lasting approximately 3 days following minimal exertion, with slow progressive improvement over the following week');
      expect(duration?.value).toBe(3);
      expect(duration?.unit).toBe('days');
      expect(duration?.progression).toBe('progressive_improving');
    });

    test('handles colloquial time expression', () => {
      const duration = extractDuration('Was wiped out for like a week after going out');
      expect(duration?.unit).toBe('weeks');
    });
  });

  // ============================================================================
  // TEMPORAL INFO INTEGRATION
  // ============================================================================

  describe('Temporal info integration with symptoms', () => {
    test('temporal info is extracted alongside symptom', () => {
      const text = 'Morning headache that lasted 2 hours';
      const timeOfDay = extractTimeOfDay(text);
      const duration = extractDuration(text);

      expect(timeOfDay).toBe('morning');
      expect(duration?.value).toBe(2);
      expect(duration?.unit).toBe('hours');
    });

    test('handles text with multiple temporal aspects', () => {
      const text = 'All day fatigue, getting worse as evening approaches, typically takes 2 days to recover';
      const timeOfDay = extractTimeOfDay(text);
      const duration = extractDuration(text);

      expect(timeOfDay).toBe('all_day');
      expect(duration?.unit).toBe('days');
    });
  });
});
