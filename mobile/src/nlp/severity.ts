/**
 * Severity Detection
 * Extracts severity levels from text using keyword matching,
 * numeric ratings, and comparative language patterns.
 */

import { tokenize } from './tokenizer';

// ============================================================================
// SEVERITY KEYWORDS
// ============================================================================

export const SEVERITY_INDICATORS: Record<string, 'mild' | 'moderate' | 'severe'> = {
  'little': 'mild',
  'slight': 'mild',
  'slightly': 'mild',
  'mild': 'mild',
  'mildly': 'mild',
  'minor': 'mild',
  'bit': 'mild',
  'a bit': 'mild',
  'touch': 'mild',
  'a touch': 'mild',
  'somewhat': 'mild',
  'kind of': 'mild',
  'kinda': 'mild',
  'sort of': 'mild',
  'sorta': 'mild',
  'manageable': 'mild',
  'tolerable': 'mild',
  'not too bad': 'mild',
  'low level': 'mild',
  'low-level': 'mild',
  'background': 'mild',
  'barely': 'mild',
  'hardly': 'mild',
  'lightly': 'mild',

  'moderate': 'moderate',
  'moderately': 'moderate',
  'pretty': 'moderate',
  'fairly': 'moderate',
  'quite': 'moderate',
  'noticeable': 'moderate',
  'noticeably': 'moderate',
  'definitely': 'moderate',
  'significant': 'moderate',
  'considerably': 'moderate',
  'reasonably': 'moderate',

  'severe': 'severe',
  'severely': 'severe',
  'extreme': 'severe',
  'extremely': 'severe',
  'very': 'severe',
  'really': 'severe',
  'super': 'severe',
  'intense': 'severe',
  'intensely': 'severe',
  'awful': 'severe',
  'terrible': 'severe',
  'horrible': 'severe',
  'unbearable': 'severe',
  'excruciating': 'severe',
  'crippling': 'severe',
  'debilitating': 'severe',
  'worst': 'severe',
  'massive': 'severe',
  'major': 'severe',
  'brutal': 'severe',
  'crushing': 'severe',
  'killer': 'severe',
  'insane': 'severe',
  'crazy': 'severe',
  'wild': 'severe',
  'absolutely': 'severe',
  'totally': 'severe',
  'completely': 'severe',
  'entirely': 'severe',
  'incredibly': 'severe',
  'unbelievably': 'severe',
  'ridiculously': 'severe',
  'impossibly': 'severe',
};

// Comparative language patterns for severity adjustment
export const COMPARATIVE_PATTERNS: Record<string, 'worse' | 'better' | 'same'> = {
  'worse': 'worse',
  'worse than': 'worse',
  'getting worse': 'worse',
  'much worse': 'worse',
  'way worse': 'worse',
  'more': 'worse',
  'increased': 'worse',
  'worsening': 'worse',
  'deteriorating': 'worse',
  'declining': 'worse',

  'better': 'better',
  'better than': 'better',
  'getting better': 'better',
  'improving': 'better',
  'improved': 'better',
  'less': 'better',
  'decreased': 'better',
  'reduced': 'better',

  'same': 'same',
  'same as': 'same',
  'no change': 'same',
  'unchanged': 'same',
  'still': 'same',
};

// Default severity by symptom type (for symptoms that are inherently severe)
export const DEFAULT_SEVERITY_BY_SYMPTOM: Record<string, 'mild' | 'moderate' | 'severe'> = {
  'pem': 'severe',
  'flare': 'severe',
  'crash': 'severe',
  'syncope': 'severe',
  'fainting': 'severe',
  'suicidal_ideation': 'severe',
  'panic': 'severe',
  'excruciating_pain': 'severe',
  'unbearable_pain': 'severe',

  'fatigue': 'moderate',
  'brain_fog': 'moderate',
  'pain': 'moderate',
  'dizziness': 'moderate',
  'nausea': 'moderate',
  'headache': 'moderate',
  'anxiety': 'moderate',
  'low_mood': 'moderate',
};

/**
 * Extract numeric severity ratings from text (e.g., "7/10", "3 out of 10", "energy at 30%")
 */
export function extractNumericSeverity(text: string): Array<{
  score: number;
  maxScore: number;
  severity: 'mild' | 'moderate' | 'severe';
  symptomType: string | null;
  matchedText: string;
}> {
  const results: Array<{
    score: number;
    maxScore: number;
    severity: 'mild' | 'moderate' | 'severe';
    symptomType: string | null;
    matchedText: string;
  }> = [];
  const textLower = text.toLowerCase();

  // Pattern 1: X out of 10, X/10, X out of Y
  const patterns = [
    /(\d+(?:\.\d+)?)\s*out\s*of\s*(\d+)/g,  // "3 out of 10"
    /(\d+(?:\.\d+)?)\/(\d+)/g,               // "7/10"
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(textLower)) !== null) {
      const score = parseFloat(match[1]);
      const maxScore = parseFloat(match[2]);
      const normalized = score / maxScore;

      let severity: 'mild' | 'moderate' | 'severe';
      if (normalized <= 0.3) {
        severity = 'mild';
      } else if (normalized <= 0.6) {
        severity = 'moderate';
      } else {
        severity = 'severe';
      }

      // Try to find what symptom this relates to
      const startPos = Math.max(0, match.index - 50);
      const context = textLower.substring(startPos, match.index);

      // Find the CLOSEST symptom keyword (rightmost match in context)
      let symptomType: string | null = null;
      let closestPos = -1;

      // Check for energy/fatigue
      for (const keyword of ['energy', 'fatigue', 'tired', 'exhaust']) {
        const pos = context.lastIndexOf(keyword);
        if (pos > closestPos) {
          closestPos = pos;
          symptomType = 'fatigue';
        }
      }

      // Check for pain (only if closer than current match)
      for (const keyword of ['pain', 'hurt', 'ache']) {
        const pos = context.lastIndexOf(keyword);
        if (pos > closestPos) {
          closestPos = pos;
          symptomType = 'pain';
        }
      }

      // Check for brain fog (only if closer than current match)
      const fogPos = context.lastIndexOf('fog');
      const brainPos = context.lastIndexOf('brain');
      if (fogPos > closestPos && brainPos >= 0 && Math.abs(fogPos - brainPos) < 10) {
        closestPos = fogPos;
        symptomType = 'brain_fog';
      }

      results.push({
        score,
        maxScore,
        severity,
        symptomType,
        matchedText: match[0],
      });
    }
  }

  // Pattern 2: Percentage (e.g., "energy at 30%")
  const percentagePattern = /(\d+)%/g;
  let match;
  while ((match = percentagePattern.exec(textLower)) !== null) {
    const percentage = parseFloat(match[1]);
    const normalized = percentage / 100;

    let severity: 'mild' | 'moderate' | 'severe';
    if (normalized <= 0.3) {
      severity = 'mild';
    } else if (normalized <= 0.6) {
      severity = 'moderate';
    } else {
      severity = 'severe';
    }

    // Look for context
    const startPos = Math.max(0, match.index - 30);
    const context = textLower.substring(startPos, match.index);

    let symptomType: string | null = null;
    for (const keyword of ['energy', 'fatigue']) {
      if (context.includes(keyword)) {
        symptomType = 'fatigue';
        break;
      }
    }

    if (symptomType) {
      results.push({
        score: percentage,
        maxScore: 100,
        severity,
        symptomType,
        matchedText: match[0],
      });
    }
  }

  return results;
}

/**
 * Detect comparative language (worse/better than yesterday, etc.)
 */
export function detectComparative(text: string): 'worse' | 'better' | 'same' | null {
  const textLower = text.toLowerCase();

  for (const [phrase, direction] of Object.entries(COMPARATIVE_PATTERNS)) {
    if (textLower.includes(phrase)) {
      return direction;
    }
  }

  return null;
}

/**
 * Find severity from context around a symptom using pre-tokenized tokens
 * This is the optimized version that avoids re-tokenization
 */
export function findSeverityFromTokens(
  tokens: string[],
  tokenIndex: number
): 'mild' | 'moderate' | 'severe' | null {
  const lookRange = 5;
  const start = Math.max(0, tokenIndex - lookRange);
  const end = Math.min(tokens.length, tokenIndex + lookRange);

  // Check individual tokens for severity indicators
  for (let i = start; i < end; i++) {
    const token = tokens[i];
    if (SEVERITY_INDICATORS[token]) {
      return SEVERITY_INDICATORS[token];
    }
  }

  // Check for multi-word severity phrases
  const surroundingText = tokens.slice(start, end).join(' ');
  for (const [phrase, severity] of Object.entries(SEVERITY_INDICATORS)) {
    if (surroundingText.includes(phrase)) {
      return severity;
    }
  }

  return null;
}

/**
 * Find severity from context around a symptom (legacy version for text-based lookups)
 * Prefer findSeverityFromTokens when tokens are already available
 */
export function findSeverity(
  text: string,
  symptomIndex: number
): 'mild' | 'moderate' | 'severe' | null {
  const tokens = tokenize(text);
  const lookRange = 5;
  const start = Math.max(0, symptomIndex - lookRange);
  const end = Math.min(tokens.length, symptomIndex + lookRange);

  for (let i = start; i < end; i++) {
    const token = tokens[i];
    if (SEVERITY_INDICATORS[token]) {
      return SEVERITY_INDICATORS[token];
    }
  }

  const surroundingText = tokens.slice(start, end).join(' ');
  for (const [phrase, severity] of Object.entries(SEVERITY_INDICATORS)) {
    if (surroundingText.includes(phrase)) {
      return severity;
    }
  }

  return null;
}

/**
 * Assign default severity to a symptom based on context and heuristics
 */
export function assignDefaultSeverity(
  symptom: string,
  text: string,
  detectedSeverity: 'mild' | 'moderate' | 'severe' | null
): 'mild' | 'moderate' | 'severe' {
  // If we already detected severity, use it
  if (detectedSeverity) {
    return detectedSeverity;
  }

  // Check if symptom has a default severity
  if (DEFAULT_SEVERITY_BY_SYMPTOM[symptom]) {
    return DEFAULT_SEVERITY_BY_SYMPTOM[symptom];
  }

  // Check for comparative language
  const comparative = detectComparative(text);
  if (comparative === 'worse') {
    return 'severe';
  } else if (comparative === 'better') {
    return 'mild';
  }

  // Default to moderate if no other information
  return 'moderate';
}
