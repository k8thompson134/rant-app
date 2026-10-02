/**
 * Core Type Definitions for RantTrack mobile app
 *
 * Sub-modules:
 * - symptoms.ts: SymptomCategory, display names, and color system
 * - export.ts: Export/share types
 */

// ============================================================================
// Re-exports for backward compatibility
// All external consumers can continue importing from '../types'
// ============================================================================

export type { SymptomCategory } from './symptoms';

export {
  SYMPTOM_DISPLAY_NAMES,
  SEVERITY_COLORS,
  getSymptomColor,
  getSymptomBackgroundColor,
  getSeverityColor,
  getSeverityBackgroundColor,
  withOpacity,
} from './symptoms';

export type {
  ExportFormat,
  DateRangePreset,
  DateRangeFilter,
  ExportOptions,
  ExportResult,
  ExportDateRange,
  ResolvedDateRange,
  ShareOptions,
  ExportStats,
} from './export';

// ============================================================================
// Core Extraction Types
// ============================================================================

export type Severity = 'mild' | 'moderate' | 'severe';

// ============================================================================
// Energy & Functional Capacity Types (Dual-Axis Model)
// ============================================================================

/**
 * Physical capacity tier: what the body can sustain doing
 * Based on functional assessment, not perceived effort
 */
export type PhysicalCapacityTier =
  | 'P-2'  // Very severe: bedbound 24/7, full care required
  | 'P-1'  // Severe: bedbound most of day, basic self-care barely possible
  | 'P0'   // Mostly bedbound: can't sustain sitting, minimal self-care
  | 'P1'   // Couch-bound: upright on couch, self-care possible
  | 'P2'   // Moving around home: can get up, basic movement possible
  | 'P3'   // Light tasks: dishes, tidying, short tasks
  | 'P4'   // Short errand: quick drive, be out briefly
  | 'P5'   // Activity: went out and did something
  | 'P+'   // Pacing: could do more but chose not to;

/**
 * Cognitive capacity tier: what the brain can process
 * Based on actual engagement ability, not general tiredness
 */
export type CognitiveCapacityTier =
  | 'C-1'  // Non-verbal/minimal: can't process language, light/sound intolerable
  | 'C0'   // Minimal processing: overwhelming, no screens possible
  | 'C1'   // Passive low-demand: comfort rewatches, ambient content
  | 'C2'   // Active low-demand: familiar content, light scrolling
  | 'C3'   // Engaged consumption: new shows, reading, conversation
  | 'C4'   // Productive: writing, coding, focused work
  | 'C+'   // Social/communicative: sustained back-and-forth conversation;

/**
 * Attempt-cost classification: what happened vs the outcome
 */
export type AttemptOutcome =
  | 'completed'        // Did it without notable cost
  | 'completed_cost'   // Did it, paid a cost after
  | 'attempted'        // Tried, couldn't finish
  | 'unable';           // Wanted to, couldn't attempt

/**
 * Sensory load flag: when sensory input is taxing capacity
 * Distinct from physical/cognitive; acts as a modifier that lowers actual capacity
 */
export interface SensoryLoadFlag {
  active: boolean;
  light?: boolean;           // Light sensitivity active
  sound?: boolean;           // Sound sensitivity active
  combined?: boolean;        // Crowd overload / multi-sensory
  smell?: boolean;           // Smell sensitivity active
  touch?: boolean;           // Touch sensitivity / hyperesthesia
  temperature?: boolean;     // Temperature regulation difficulty
  severity?: 'elevated' | 'high';  // General sensory load intensity
}

/**
 * Energy tracking across both axes
 */
export interface FunctionalCapacity {
  physical: PhysicalCapacityTier;
  cognitive: CognitiveCapacityTier;
  outcome?: AttemptOutcome;      // What was attempted and whether it succeeded
  activity?: string;              // The activity in question (e.g., "shower", "work")
  sensoryLoad?: SensoryLoadFlag;  // Sensory input taxing capacity
  notes?: string;                 // Optional user notes
}

export interface PainDetails {
  qualifiers: string[];  // e.g., ["burning", "sharp"]
  location: string | null;  // e.g., "shoulder", "calf"
}

export interface ActivityTrigger {
  activity: string;  // e.g., "walking", "standing", "showering"
  timeframe?: string;  // e.g., "after", "during", "from"
  confidence?: number;  // 0-1 confidence in trigger-symptom relationship
  delayPattern?: string;  // Temporal pattern: "immediate", "hours_later", "next_day", "delayed_pem"
  sentenceDistance?: number;  // Number of sentences between trigger and symptom (0 = same sentence)
}

export interface SpoonCount {
  current: number;  // Current spoons mentioned (e.g., "I have 2 spoons")
  used?: number;  // Spoons used (e.g., "used 3 spoons")
  started?: number;  // Starting spoons (e.g., "started with 5")
  energyLevel: number;  // Normalized 0-10 scale
}

export interface SymptomDuration {
  value?: number;  // Numeric duration (e.g., 3 for "3 hours")
  unit?: 'minutes' | 'hours' | 'days' | 'weeks';  // Time unit
  qualifier?: 'all' | 'half' | 'most_of' | 'intermittent' | 'rare' | 'frequent' | 'constant';  // "all day", "sometimes", "often", etc.
  since?: string;  // Reference point (e.g., "Tuesday", "yesterday")
  ongoing?: boolean;  // "still have", "won't go away"
  progression?: 'progressive_worsening' | 'progressive_improving' | 'recurring' | 'stable' | 'fluctuating';  // How symptom evolves over time
  recoveryTime?: SymptomDuration;  // How long it takes to recover (e.g., "takes 3 days to recover")
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'all_day';

export interface ExtractedSymptom {
  symptom: string;
  matched: string;
  method: 'phrase' | 'lemma' | 'quick_checkin';
  pos?: string;
  severity?: Severity | null;
  id?: string;
  painDetails?: PainDetails;  // For pain symptoms with qualifiers/location
  trigger?: ActivityTrigger;  // Activity that triggered this symptom
  confidence?: number;  // 0-1 confidence score for extraction accuracy
  duration?: SymptomDuration;  // How long the symptom lasted
  timeOfDay?: TimeOfDay;  // When the symptom occurred
}

export interface EditableSymptom extends ExtractedSymptom {
  id: string; // Required for editing UI
}

export interface ExtractionResult {
  text: string;
  symptoms: ExtractedSymptom[];
  spoonCount?: SpoonCount;  // Spoon theory energy tracking (legacy)
  functionalCapacity?: FunctionalCapacity;  // Dual-axis energy tracking (new)
  repeatPrevious?: boolean;  // Flag for "same as yesterday" or similar catch-up phrases
}

export interface RantEntry {
  id: string;
  text: string;
  timestamp: number;
  symptoms: ExtractedSymptom[];
  functionalCapacity?: FunctionalCapacity;  // Energy tier data
  metrics?: { mood?: number; energy?: number; stress?: number; capacity?: number; medication?: 'taken' | 'skipped' };
  activity?: { signals: string[]; intensity: 'low' | 'medium' | 'high' | null };
}

// ============================================================================
// Formatting Functions
// ============================================================================

/**
 * Format activity trigger for display with delay pattern
 * @returns Readable string like "after walking (next day)" or "during standing", empty if no trigger
 */
export function formatActivityTrigger(trigger?: ActivityTrigger): string {
  if (!trigger?.activity) return '';

  const timeframe = trigger.timeframe || 'after';
  let result = `${timeframe} ${trigger.activity}`;

  // Add delay pattern if present
  if (trigger.delayPattern) {
    const delayLabels: Record<string, string> = {
      'immediate': 'immediate',
      'hours_later': 'hours later',
      'next_day': 'next day',
      'delayed_pem': 'delayed crash',
      'same_day': 'same day',
      'overnight': 'overnight',
    };

    const delayLabel = delayLabels[trigger.delayPattern];
    if (delayLabel) {
      result = `${result} (${delayLabel})`;
    }
  }

  return result;
}

/**
 * Format symptom progression for display
 * @returns Icon and label like "↑ Worsening" or "◇ Recurring", empty if no progression
 */
export function formatProgression(progression?: SymptomDuration['progression']): string {
  if (!progression) return '';

  const progressionLabels: Record<string, string> = {
    'progressive_worsening': '↑ Worsening',
    'progressive_improving': '↓ Improving',
    'recurring': '◇ Recurring',
    'stable': '= Stable',
    'fluctuating': '≈ Fluctuating',
  };

  return progressionLabels[progression] || '';
}

/**
 * Format symptom duration for display
 * @returns Readable string like "for 3 hours", "all day", "since Tuesday", empty if no duration
 */
export function formatSymptomDuration(duration?: SymptomDuration): string {
  if (!duration) return '';

  // Handle ongoing (highest priority)
  if (duration.ongoing) return 'ongoing';

  // Handle "since" reference points
  if (duration.since) return `since ${duration.since}`;

  // Handle qualifiers like "all day", "half the night"
  if (duration.qualifier && duration.unit) {
    const timeLabel = duration.unit === 'days' ? 'day' : duration.unit.slice(0, -1); // "days" -> "day"

    if (duration.qualifier === 'all') {
      return `all ${timeLabel}`;
    } else if (duration.qualifier === 'half') {
      return `half the ${timeLabel}`;
    } else if (duration.qualifier === 'most_of') {
      return `most of the ${timeLabel}`;
    }
  }

  // Handle specific value + unit
  if (duration.value !== undefined && duration.unit) {
    const unit = duration.value === 1 ? duration.unit.slice(0, -1) : duration.unit; // "hours" -> "hour" if value is 1
    return `for ${duration.value} ${unit}`;
  }

  return '';
}

/**
 * Format time of day for display
 * @returns Readable string like "morning", "all day", empty if no timeOfDay
 */
export function formatTimeOfDay(timeOfDay?: TimeOfDay): string {
  if (!timeOfDay) return '';

  // Convert snake_case to readable text
  return timeOfDay.replace('_', ' ');
}

/**
 * Format spoon count for display
 * @returns Readable string like "2 spoons (4/10 energy)" or "out of spoons (0/10)", empty if no spoons
 */
export function formatSpoonCount(spoons?: SpoonCount): string {
  if (!spoons) return '';

  // Handle "out of spoons" case (0 current)
  if (spoons.current === 0) {
    return `out of spoons (${spoons.energyLevel}/10 energy)`;
  }

  // Handle single spoon vs multiple spoons
  const spoonLabel = spoons.current === 1 ? 'spoon' : 'spoons';

  // Include started/used context if available
  if (spoons.started !== undefined && spoons.used !== undefined) {
    return `${spoons.current} ${spoonLabel} (started with ${spoons.started}, used ${spoons.used})`;
  } else if (spoons.started !== undefined) {
    return `${spoons.current} ${spoonLabel} (started with ${spoons.started})`;
  } else if (spoons.used !== undefined) {
    return `${spoons.current} ${spoonLabel} (used ${spoons.used})`;
  }

  // Basic format with energy level
  return `${spoons.current} ${spoonLabel} (${spoons.energyLevel}/10 energy)`;
}

// ============================================================================
// Custom Lemmas
// ============================================================================

/**
 * Custom symptom word entry
 * Allows users to add their own words that map to existing symptoms
 */
export interface CustomLemmaEntry {
  id: string;
  /** The user's custom word (lowercase, trimmed) */
  word: string;
  /** The symptom this word maps to */
  symptom: string;
  /** When the custom word was added (timestamp) */
  createdAt: number;
}
