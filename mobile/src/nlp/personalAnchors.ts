/**
 * Personal Anchor Task Calibration
 * Learns and infers functional capacity from personal anchor tasks
 * Examples: "shower" = P3, "deskwork" = C4, etc.
 *
 * This system builds a mapping of user-specific language and activities
 * to functional capacity tiers based on actual logged entries.
 */

import { PhysicalCapacityTier, CognitiveCapacityTier, RantEntry } from '../types';

/**
 * Default anchor tasks with common tier associations
 * These are refined over time with user-specific data
 */
export interface AnchorTask {
  keyword: string;                    // The word/phrase to match
  physicalTier?: PhysicalCapacityTier; // What physical tier it indicates
  cognitiveTier?: CognitiveCapacityTier;
  confidence: number;                 // How confident we are in this mapping
  userDefined: boolean;                // Whether user explicitly set this
  frequency: number;                  // How many times we've seen this
}

/**
 * Personal anchor profile: learned from user's entries
 */
export interface AnchorProfile {
  anchors: Map<string, AnchorTask>;
  lastUpdated: number;
  totalEntries: number;  // For computing confidence over time
}

/**
 * Default anchors based on common chronic illness patterns
 */
const DEFAULT_ANCHORS: AnchorTask[] = [
  // Physical anchors
  { keyword: 'shower', physicalTier: 'P3', confidence: 0.85, userDefined: false, frequency: 0 },
  { keyword: 'bath', physicalTier: 'P2', confidence: 0.85, userDefined: false, frequency: 0 },
  { keyword: 'walk', physicalTier: 'P4', confidence: 0.75, userDefined: false, frequency: 0 },
  { keyword: 'dishes', physicalTier: 'P3', confidence: 0.80, userDefined: false, frequency: 0 },
  { keyword: 'cooking', physicalTier: 'P3', confidence: 0.70, userDefined: false, frequency: 0 },
  { keyword: 'cleaning', physicalTier: 'P3', confidence: 0.75, userDefined: false, frequency: 0 },
  { keyword: 'groceries', physicalTier: 'P4', confidence: 0.70, userDefined: false, frequency: 0 },
  { keyword: 'drove', physicalTier: 'P4', confidence: 0.80, userDefined: false, frequency: 0 },
  { keyword: 'driving', physicalTier: 'P4', confidence: 0.80, userDefined: false, frequency: 0 },

  // Cognitive anchors
  { keyword: 'work', cognitiveTier: 'C4', confidence: 0.75, userDefined: false, frequency: 0 },
  { keyword: 'study', cognitiveTier: 'C4', confidence: 0.80, userDefined: false, frequency: 0 },
  { keyword: 'coding', cognitiveTier: 'C4', confidence: 0.85, userDefined: false, frequency: 0 },
  { keyword: 'writing', cognitiveTier: 'C4', confidence: 0.80, userDefined: false, frequency: 0 },
  { keyword: 'reading', cognitiveTier: 'C3', confidence: 0.75, userDefined: false, frequency: 0 },
  { keyword: 'watching tv', cognitiveTier: 'C2', confidence: 0.70, userDefined: false, frequency: 0 },
  { keyword: 'scrolling', cognitiveTier: 'C2', confidence: 0.75, userDefined: false, frequency: 0 },
  { keyword: 'comfort rewatch', cognitiveTier: 'C1', confidence: 0.80, userDefined: false, frequency: 0 },
  { keyword: 'conversation', cognitiveTier: 'C3', confidence: 0.70, userDefined: false, frequency: 0 },
];

/**
 * Create a new anchor profile from defaults
 */
export function createAnchorProfile(): AnchorProfile {
  const anchors = new Map<string, AnchorTask>();

  for (const anchor of DEFAULT_ANCHORS) {
    anchors.set(anchor.keyword, { ...anchor });
  }

  return {
    anchors,
    lastUpdated: Date.now(),
    totalEntries: 0,
  };
}

/**
 * Update anchor profile with new entry data
 * Tracks frequency and refines confidence based on observed patterns
 */
export function updateAnchorProfile(
  profile: AnchorProfile,
  entries: RantEntry[]
): AnchorProfile {
  const updated = { ...profile };
  updated.totalEntries += entries.length;
  updated.lastUpdated = Date.now();

  for (const entry of entries) {
    if (!entry.functionalCapacity) continue;

    const textLower = entry.text.toLowerCase();

    // For each anchor, check if it appears in this entry
    for (const [keyword, anchor] of updated.anchors) {
      if (textLower.includes(keyword)) {
        // Update frequency
        anchor.frequency += 1;

        // Refine confidence based on agreement with entry data
        if (anchor.physicalTier && entry.functionalCapacity.physical === anchor.physicalTier) {
          // Observed anchor confirms tier — increase confidence slightly
          anchor.confidence = Math.min(1, anchor.confidence + 0.02);
        } else if (anchor.physicalTier && entry.functionalCapacity.physical !== anchor.physicalTier) {
          // Observed anchor contradicts tier — decrease confidence
          anchor.confidence = Math.max(0.3, anchor.confidence - 0.05);
        }

        if (anchor.cognitiveTier && entry.functionalCapacity.cognitive === anchor.cognitiveTier) {
          anchor.confidence = Math.min(1, anchor.confidence + 0.02);
        } else if (anchor.cognitiveTier && entry.functionalCapacity.cognitive !== anchor.cognitiveTier) {
          anchor.confidence = Math.max(0.3, anchor.confidence - 0.05);
        }
      }
    }
  }

  return updated;
}

/**
 * Add or update a user-defined anchor
 * User explicitly calibrates an anchor: "when I can code, I'm at C4"
 */
export function defineAnchor(
  profile: AnchorProfile,
  keyword: string,
  physicalTier?: PhysicalCapacityTier,
  cognitiveTier?: CognitiveCapacityTier
): AnchorProfile {
  const updated = { ...profile };

  updated.anchors.set(keyword, {
    keyword,
    physicalTier,
    cognitiveTier,
    confidence: 0.95, // User-defined anchors start high confidence
    userDefined: true,
    frequency: 0,
  });

  updated.lastUpdated = Date.now();
  return updated;
}

/**
 * Get suggested tier for an activity keyword
 * Returns both physical and cognitive suggestions based on anchor profile
 */
export function inferTierFromAnchor(
  profile: AnchorProfile,
  keyword: string
): { physical?: PhysicalCapacityTier; cognitive?: CognitiveCapacityTier; confidence: number } | null {
  const anchor = profile.anchors.get(keyword);

  if (!anchor) {
    return null;
  }

  return {
    physical: anchor.physicalTier,
    cognitive: anchor.cognitiveTier,
    confidence: anchor.confidence,
  };
}

/**
 * Infer capacity tiers using anchor profile
 * Looks for anchor keywords in text and uses them to suggest tiers
 */
export function inferCapacityFromAnchors(
  text: string,
  profile: AnchorProfile
): { physical?: PhysicalCapacityTier; cognitive?: CognitiveCapacityTier; confidence: number } | null {
  const textLower = text.toLowerCase();
  let bestPhysicalTier: PhysicalCapacityTier | undefined;
  let bestCognitiveTier: CognitiveCapacityTier | undefined;
  let bestConfidence = 0;

  // Find all matching anchors
  for (const [keyword, anchor] of profile.anchors) {
    if (textLower.includes(keyword)) {
      // If this is a higher-confidence match, use it
      if (anchor.confidence > bestConfidence) {
        bestConfidence = anchor.confidence;
        bestPhysicalTier = anchor.physicalTier;
        bestCognitiveTier = anchor.cognitiveTier;
      }
    }
  }

  if (bestConfidence === 0) {
    return null;
  }

  return {
    physical: bestPhysicalTier,
    cognitive: bestCognitiveTier,
    confidence: bestConfidence,
  };
}

/**
 * Suggest new anchors to user based on patterns in entries
 * Identifies frequently-mentioned activities that could be good anchors
 */
export function suggestNewAnchors(
  entries: RantEntry[],
  profile: AnchorProfile
): { keyword: string; suggestedTier: PhysicalCapacityTier | CognitiveCapacityTier; frequency: number }[] {
  const activityFrequency = new Map<string, { count: number; tiers: Set<string> }>();

  const potentialActivities = [
    'yoga', 'stretching', 'meditation', 'exercise',
    'eating', 'meal', 'cooking',
    'meeting', 'call', 'video call',
    'shopping', 'errands',
    'garden', 'plants',
    'hobby', 'gaming', 'game',
    'appointment', 'doctor',
  ];

  for (const entry of entries) {
    const textLower = entry.text.toLowerCase();

    for (const activity of potentialActivities) {
      // Skip if already in profile
      if (profile.anchors.has(activity)) continue;

      if (textLower.includes(activity)) {
        if (!activityFrequency.has(activity)) {
          activityFrequency.set(activity, { count: 0, tiers: new Set() });
        }

        const freq = activityFrequency.get(activity)!;
        freq.count += 1;

        if (entry.functionalCapacity) {
          freq.tiers.add(entry.functionalCapacity.physical);
          freq.tiers.add(entry.functionalCapacity.cognitive);
        }
      }
    }
  }

  // Filter to activities mentioned 3+ times with consistent tier
  const suggestions = Array.from(activityFrequency.entries())
    .filter(([, freq]) => freq.count >= 3 && freq.tiers.size === 1)
    .map(([keyword, freq]) => ({
      keyword,
      suggestedTier: Array.from(freq.tiers)[0] as PhysicalCapacityTier | CognitiveCapacityTier,
      frequency: freq.count,
    }))
    .sort((a, b) => b.frequency - a.frequency);

  return suggestions.slice(0, 5); // Top 5 suggestions
}

/**
 * Serialize profile for storage
 */
export function serializeProfile(profile: AnchorProfile): string {
  const data = {
    anchors: Array.from(profile.anchors.entries()).map(([keyword, anchor]) => ({
      keyword,
      physicalTier: anchor.physicalTier,
      cognitiveTier: anchor.cognitiveTier,
      confidence: anchor.confidence,
      userDefined: anchor.userDefined,
      frequency: anchor.frequency,
    })),
    lastUpdated: profile.lastUpdated,
    totalEntries: profile.totalEntries,
  };

  return JSON.stringify(data);
}

/**
 * Deserialize profile from storage
 */
export function deserializeProfile(data: string): AnchorProfile {
  const parsed = JSON.parse(data);
  const anchors = new Map<string, AnchorTask>();

  for (const anchor of parsed.anchors) {
    anchors.set(anchor.keyword, anchor);
  }

  return {
    anchors,
    lastUpdated: parsed.lastUpdated,
    totalEntries: parsed.totalEntries,
  };
}
