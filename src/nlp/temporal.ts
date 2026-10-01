/**
 * Temporal Information Extraction
 * Handles duration, time of day, and temporal linking of symptoms.
 * Extracts when symptoms occur and how long they last.
 */

import { ExtractedSymptom, SymptomDuration, TimeOfDay } from '../types';
import { tokenize } from './tokenizer';

// ============================================================================
// SYMPTOM DURATION EXTRACTION
// ============================================================================

/**
 * Duration unit mappings
 */
const DURATION_UNITS: Record<string, SymptomDuration['unit']> = {
  'minute': 'minutes',
  'minutes': 'minutes',
  'min': 'minutes',
  'mins': 'minutes',
  'hour': 'hours',
  'hours': 'hours',
  'hr': 'hours',
  'hrs': 'hours',
  'day': 'days',
  'days': 'days',
  'week': 'weeks',
  'weeks': 'weeks',
};

/**
 * Time progression patterns - how symptoms evolve
 */
const TIME_PROGRESSION_PATTERNS: Record<string, string> = {
  // Worsening patterns
  'getting worse': 'progressive_worsening',
  'gradually worse': 'progressive_worsening',
  'got progressively worse': 'progressive_worsening',
  'worse as the day goes on': 'progressive_worsening',
  'worse as time goes on': 'progressive_worsening',
  'continues to worsen': 'progressive_worsening',

  // Improving patterns
  'getting better': 'progressive_improving',
  'gradually improved': 'progressive_improving',
  'improving each day': 'progressive_improving',
  'better each day': 'progressive_improving',
  'continues to improve': 'progressive_improving',
  'healing': 'progressive_improving',

  // Cycling/recurring patterns
  'on and off': 'recurring',
  'comes and goes': 'recurring',
  'intermittently': 'recurring',
  'in waves': 'recurring',
  'flares up': 'recurring',

  // Stable/unchanged
  'no change': 'stable',
  'same as before': 'stable',
  'unchanged': 'stable',
  'still the same': 'stable',

  // Fluctuating patterns
  'up and down': 'fluctuating',
  'varies throughout the day': 'fluctuating',
  'inconsistent': 'fluctuating',
  'unpredictable': 'fluctuating',
};

/**
 * Duration qualifier phrases
 */
const DURATION_QUALIFIERS: Record<string, SymptomDuration['qualifier']> = {
  'all day': 'all',
  'all night': 'all',
  'all morning': 'all',
  'all afternoon': 'all',
  'all evening': 'all',
  'the whole day': 'all',
  'the whole night': 'all',
  'entire day': 'all',
  'entire night': 'all',
  'half the day': 'half',
  'half the night': 'half',
  'half day': 'half',
  'most of the day': 'most_of',
  'most of the night': 'most_of',
  'most of today': 'most_of',
  'sometimes': 'intermittent',
  'occasionally': 'intermittent',
  'rarely': 'rare',
  'often': 'frequent',
  'frequently': 'frequent',
  'always': 'constant',
};

/**
 * Ongoing symptom indicators
 */
const ONGOING_INDICATORS = new Set([
  'still',
  'ongoing',
  'continuous',
  'constantly',
  'nonstop',
  'non-stop',
  'persistent',
  'persistently',
  'unrelenting',
  'relentless',
]);

/**
 * Recovery context patterns - how long recovery takes
 */
const RECOVERY_PATTERNS: Record<string, string> = {
  'takes hours to recover': 'hours_recovery',
  'takes a few hours': 'hours_recovery',
  'takes days to recover': 'days_recovery',
  'takes weeks to recover': 'weeks_recovery',
  'recovers overnight': 'overnight_recovery',
  'recovers quickly': 'quick_recovery',
  'slow recovery': 'slow_recovery',
  'not recovering': 'no_recovery',
  'still not recovered': 'prolonged_recovery',
  'takes time to recover': 'prolonged_recovery',
};

// ============================================================================
// HELPER FUNCTIONS FOR TEMPORAL PATTERN DETECTION
// ============================================================================

/**
 * Detect time progression patterns (how symptoms evolve)
 *
 * Examples:
 * - "Getting progressively worse" -> "progressive_worsening"
 * - "Improving each day" -> "progressive_improving"
 * - "Comes and goes" -> "recurring"
 */
function detectTimeProgression(text: string): SymptomDuration['progression'] | undefined {
  const textLower = text.toLowerCase();

  // Check patterns from longest to shortest
  const sortedPatterns = Object.entries(TIME_PROGRESSION_PATTERNS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [pattern, progression] of sortedPatterns) {
    if (textLower.includes(pattern)) {
      return progression as SymptomDuration['progression'];
    }
  }

  return undefined;
}

/**
 * Extract recovery duration information
 *
 * Examples:
 * - "Takes 3 days to recover" -> { value: 3, unit: "days" }
 * - "Recovers overnight" -> { unit: "hours" }
 * - "Slow recovery" -> { progression: "slow_recovery" }
 */
function extractRecoveryDuration(text: string): SymptomDuration | undefined {
  const textLower = text.toLowerCase();

  // Check for recovery context patterns first
  for (const [pattern, recoveryType] of Object.entries(RECOVERY_PATTERNS)) {
    if (textLower.includes(pattern)) {
      // Map recovery types to rough durations
      let duration: SymptomDuration | undefined;

      if (recoveryType === 'hours_recovery') {
        duration = { unit: 'hours', qualifier: 'rare' };
      } else if (recoveryType === 'overnight_recovery') {
        duration = { unit: 'hours', value: 8 };
      } else if (recoveryType === 'quick_recovery') {
        duration = { unit: 'hours', value: 4 };
      } else if (recoveryType === 'days_recovery') {
        duration = { unit: 'days', qualifier: 'few' as any };
      } else if (recoveryType === 'weeks_recovery') {
        duration = { unit: 'weeks', value: 1 };
      } else if (recoveryType === 'slow_recovery') {
        duration = { unit: 'days', qualifier: 'rare' };
      } else if (recoveryType === 'no_recovery' || recoveryType === 'prolonged_recovery') {
        duration = { ongoing: true };
      }

      return duration;
    }
  }

  // Check for "takes X hours/days to recover" pattern
  const takesPattern = /takes\s+(\d+)\s+(hours?|days?|weeks?)\s+to\s+recover/gi;
  const match = takesPattern.exec(textLower);
  if (match) {
    return {
      value: parseInt(match[1], 10),
      unit: DURATION_UNITS[match[2].toLowerCase().replace(/s$/, '')] || 'hours',
    };
  }

  return undefined;
}

/**
 * Detect multi-day patterns (e.g., "3 days of fatigue", "crashed for a week")
 * These capture extended durations that are important for PEM/disability tracking
 */
function detectMultiDayPattern(text: string): SymptomDuration | undefined {
  const textLower = text.toLowerCase();

  // "X days of [symptom]"
  const daysOfPattern = /(\d+)\s+(days?|weeks?)\s+of\s+(\w+)/gi;
  let match = daysOfPattern.exec(textLower);
  if (match) {
    return {
      value: parseInt(match[1], 10),
      unit: DURATION_UNITS[match[2].toLowerCase().replace(/s$/, '')] || 'days',
      qualifier: 'all',
    };
  }

  // "Crashed for X days"
  const crashedForPattern = /crashed\s+for\s+(\d+)\s+(days?|weeks?|hours?)/gi;
  match = crashedForPattern.exec(textLower);
  if (match) {
    return {
      value: parseInt(match[1], 10),
      unit: DURATION_UNITS[match[2].toLowerCase().replace(/s$/, '')] || 'days',
      progression: 'progressive_worsening',
    };
  }

  // "Out for X days"
  const outForPattern = /out\s+for\s+(\d+)\s+(days?|weeks?)/gi;
  match = outForPattern.exec(textLower);
  if (match) {
    return {
      value: parseInt(match[1], 10),
      unit: DURATION_UNITS[match[2].toLowerCase().replace(/s$/, '')] || 'days',
      ongoing: true,
    };
  }

  return undefined;
}

/**
 * Extract symptom duration from text
 *
 * Examples:
 * - "Headache for 3 hours" -> { value: 3, unit: "hours" }
 * - "Pain all day" -> { qualifier: "all", unit: "days" }
 * - "Nausea since Tuesday" -> { since: "Tuesday" }
 * - "Still have the headache" -> { ongoing: true }
 */
export function extractDuration(text: string): SymptomDuration | null {
  const textLower = text.toLowerCase();

  // Check for ongoing indicators
  const tokens = tokenize(text);
  const hasOngoing = tokens.some(t => ONGOING_INDICATORS.has(t));

  // Check for progression patterns first (most specific)
  const progression = detectTimeProgression(text);

  // Check for multi-day patterns ("3 days of fatigue", "crashed for a week")
  const multiDayDuration = detectMultiDayPattern(text);
  if (multiDayDuration) {
    return {
      ...multiDayDuration,
      progression: progression || multiDayDuration.progression,
      ongoing: hasOngoing || multiDayDuration.ongoing,
    };
  }

  // Check for recovery duration patterns
  const recoveryDuration = extractRecoveryDuration(text);
  if (recoveryDuration) {
    return {
      ...recoveryDuration,
      progression: progression || recoveryDuration.progression,
    };
  }

  // Check for qualifier phrases first ("all day", "half the night", etc.)
  for (const [phrase, qualifier] of Object.entries(DURATION_QUALIFIERS)) {
    if (textLower.includes(phrase)) {
      // Determine unit from phrase
      let unit: SymptomDuration['unit'] = 'days';
      if (phrase.includes('night') || phrase.includes('evening')) {
        unit = 'hours'; // Night/evening implies hours
      } else if (phrase.includes('morning') || phrase.includes('afternoon')) {
        unit = 'hours';
      }

      return {
        qualifier,
        unit,
        progression,
        ongoing: hasOngoing || undefined,
      };
    }
  }

  // Pattern: "for X hours/days/etc."
  const forPattern = /for\s+(\d+)\s+(minutes?|mins?|hours?|hrs?|days?|weeks?)/gi;
  let match = forPattern.exec(textLower);
  if (match) {
    return {
      value: parseInt(match[1], 10),
      unit: DURATION_UNITS[match[2].toLowerCase().replace(/s$/, '')] || 'hours',
      progression,
      ongoing: hasOngoing || undefined,
    };
  }

  // Pattern: "X hours/days of pain"
  const ofPattern = /(\d+)\s+(minutes?|mins?|hours?|hrs?|days?|weeks?)\s+of/gi;
  match = ofPattern.exec(textLower);
  if (match) {
    return {
      value: parseInt(match[1], 10),
      unit: DURATION_UNITS[match[2].toLowerCase().replace(/s$/, '')] || 'hours',
      progression,
      ongoing: hasOngoing || undefined,
    };
  }

  // Pattern: "since [day/time reference]"
  const sincePattern = /since\s+(yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|this morning|last night|the morning|tonight)/gi;
  match = sincePattern.exec(textLower);
  if (match) {
    return {
      since: match[1],
      progression,
      ongoing: true,
    };
  }

  // Pattern: "lasted X hours"
  const lastedPattern = /lasted\s+(\d+)\s+(minutes?|mins?|hours?|hrs?|days?|weeks?)/gi;
  match = lastedPattern.exec(textLower);
  if (match) {
    return {
      value: parseInt(match[1], 10),
      unit: DURATION_UNITS[match[2].toLowerCase().replace(/s$/, '')] || 'hours',
      progression,
    };
  }

  // Just progression pattern without specific duration
  if (progression) {
    return { progression };
  }

  // Just ongoing indicator without duration
  if (hasOngoing) {
    return { ongoing: true };
  }

  return null;
}

// ============================================================================
// TIME OF DAY EXTRACTION
// ============================================================================

/**
 * Time of day patterns
 */
const TIME_OF_DAY_PATTERNS: Record<string, TimeOfDay> = {
  // Morning
  'morning': 'morning',
  'this morning': 'morning',
  'in the morning': 'morning',
  'when i woke up': 'morning',
  'woke up with': 'morning',
  'waking up': 'morning',
  'first thing': 'morning',
  'am': 'morning',

  // Afternoon
  'afternoon': 'afternoon',
  'this afternoon': 'afternoon',
  'in the afternoon': 'afternoon',
  'midday': 'afternoon',
  'lunch': 'afternoon',
  'after lunch': 'afternoon',

  // Evening
  'evening': 'evening',
  'this evening': 'evening',
  'in the evening': 'evening',
  'dinner': 'evening',
  'after dinner': 'evening',
  'end of day': 'evening',

  // Night
  'night': 'night',
  'tonight': 'night',
  'at night': 'night',
  'during the night': 'night',
  'last night': 'night',
  'overnight': 'night',
  'nighttime': 'night',
  'middle of the night': 'night',
  'pm': 'night',
  'before bed': 'night',
  'bedtime': 'night',
  'while sleeping': 'night',

  // All day
  'all day': 'all_day',
  'the whole day': 'all_day',
  'entire day': 'all_day',
  'constantly': 'all_day',
  'nonstop': 'all_day',
  '24/7': 'all_day',
};

/**
 * Extract time of day when symptom occurred
 *
 * Examples:
 * - "Morning headache" -> "morning"
 * - "Worse at night" -> "night"
 * - "Woke up with pain" -> "morning"
 * - "Pain all day" -> "all_day"
 */
export function extractTimeOfDay(text: string): TimeOfDay | null {
  const textLower = text.toLowerCase();

  // Check phrases from longest to shortest for accuracy
  const sortedPatterns = Object.entries(TIME_OF_DAY_PATTERNS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [phrase, timeOfDay] of sortedPatterns) {
    if (textLower.includes(phrase)) {
      return timeOfDay;
    }
  }

  return null;
}

/**
 * Find all temporal markers with their positions in text
 */
export function findTemporalMarkers(text: string): Array<{
  position: number;
  timeOfDay?: TimeOfDay;
  duration?: SymptomDuration;
  phrase: string;
}> {
  const textLower = text.toLowerCase();
  const markers: Array<{
    position: number;
    timeOfDay?: TimeOfDay;
    duration?: SymptomDuration;
    phrase: string;
  }> = [];

  // Find time of day markers
  const sortedTimePatterns = Object.entries(TIME_OF_DAY_PATTERNS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [phrase, timeOfDay] of sortedTimePatterns) {
    const pos = textLower.indexOf(phrase);
    if (pos !== -1) {
      markers.push({ position: pos, timeOfDay, phrase });
    }
  }

  // Find duration markers - "all day", "since yesterday", etc.
  for (const [phrase, qualifier] of Object.entries(DURATION_QUALIFIERS)) {
    const pos = textLower.indexOf(phrase);
    if (pos !== -1) {
      let unit: SymptomDuration['unit'] = 'days';
      if (phrase.includes('night') || phrase.includes('evening')) {
        unit = 'hours';
      }
      markers.push({
        position: pos,
        duration: { qualifier, unit },
        phrase,
      });
    }
  }

  // Find "since X" patterns
  const sincePattern = /since\s+(yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|this morning|last night)/gi;
  let match;
  while ((match = sincePattern.exec(textLower)) !== null) {
    markers.push({
      position: match.index,
      duration: { since: match[1], ongoing: true },
      phrase: match[0],
    });
  }

  // Find "for X hours" patterns
  const forPattern = /for\s+(\d+)\s+(minutes?|mins?|hours?|hrs?|days?|weeks?)/gi;
  while ((match = forPattern.exec(textLower)) !== null) {
    markers.push({
      position: match.index,
      duration: {
        value: parseInt(match[1], 10),
        unit: DURATION_UNITS[match[2].toLowerCase().replace(/s$/, '')] || 'hours',
      },
      phrase: match[0],
    });
  }

  return markers;
}

/**
 * Add duration and time-of-day to symptoms based on proximity
 */
export function addTemporalInfo(
  symptoms: ExtractedSymptom[],
  text: string
): ExtractedSymptom[] {
  const markers = findTemporalMarkers(text);

  // If no temporal markers found, return as-is
  if (markers.length === 0) {
    return symptoms;
  }

  const textLower = text.toLowerCase();

  // For each symptom, find if there's a temporal marker nearby
  return symptoms.map(symptom => {
    // Find where this symptom appears in the text
    const symptomPos = textLower.indexOf(symptom.matched.toLowerCase());
    if (symptomPos === -1) {
      return symptom;
    }

    // Find the closest temporal marker within 50 characters
    let closestTimeOfDay: TimeOfDay | undefined;
    let closestDuration: SymptomDuration | undefined;
    let closestTimeDistance = 50;
    let closestDurationDistance = 50;

    for (const marker of markers) {
      const distance = Math.abs(marker.position - symptomPos);

      // Link time of day if close enough
      if (marker.timeOfDay && distance < closestTimeDistance) {
        closestTimeDistance = distance;
        closestTimeOfDay = marker.timeOfDay;
      }

      // Link duration if close enough
      if (marker.duration && distance < closestDurationDistance) {
        closestDurationDistance = distance;
        closestDuration = marker.duration;
      }
    }

    return {
      ...symptom,
      ...(closestTimeOfDay && { timeOfDay: closestTimeOfDay }),
      ...(closestDuration && { duration: closestDuration }),
    };
  });
}
