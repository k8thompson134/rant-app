/**
 * Spoon Theory Extraction
 * Extracts spoon counts and energy levels from text.
 * Spoon theory is used by chronic illness patients to describe energy levels.
 */

import { SpoonCount } from '../types';

/**
 * Common spoon theory phrases and patterns
 */
const SPOON_PHRASES: Record<string, 'current' | 'used' | 'started' | 'zero'> = {
  'out of spoons': 'zero',
  'no spoons': 'zero',
  'zero spoons': 'zero',
  'negative spoons': 'zero',
  'spoon deficit': 'zero',
  'no spoons left': 'zero',
  'completely out of spoons': 'zero',
  'ran out of spoons': 'zero',
  'spoons left': 'current',
  'spoons remaining': 'current',
  'have spoons': 'current',
  'got spoons': 'current',
  'spoons today': 'current',
  'used spoons': 'used',
  'spent spoons': 'used',
  'cost spoons': 'used',
  'took spoons': 'used',
  'started with spoons': 'started',
  'began with spoons': 'started',
  'woke up with spoons': 'started',
};

/**
 * Extract spoon count from text for energy level tracking
 *
 * Examples:
 * - "I only have 2 spoons left" -> { current: 2, energyLevel: 2 }
 * - "Started with 5 spoons, used 3" -> { started: 5, used: 3, current: 2, energyLevel: 2 }
 * - "Completely out of spoons" -> { current: 0, energyLevel: 0 }
 * - "Running on negative spoons" -> { current: 0, energyLevel: 0 }
 */
export function extractSpoonCount(text: string): SpoonCount | null {
  const textLower = text.toLowerCase();

  let current: number | undefined;
  let used: number | undefined;
  let started: number | undefined;

  // Check for zero-spoon phrases first (no numbers needed)
  for (const [phrase, type] of Object.entries(SPOON_PHRASES)) {
    if (textLower.includes(phrase) && type === 'zero') {
      return {
        current: 0,
        energyLevel: 0,
      };
    }
  }

  // Pattern: "X spoons" with context
  // Matches: "2 spoons left", "have 3 spoons", "only 1 spoon"
  const spoonPatterns = [
    // "have/got/only X spoon(s)"
    /(?:have|got|only|just)\s+(\d+)\s+spoons?/gi,
    // "X spoon(s) left/remaining/today"
    /(\d+)\s+spoons?\s+(?:left|remaining|today)/gi,
    // "started/began/woke with X spoon(s)"
    /(?:started|began|woke(?:\s+up)?)\s+(?:with\s+)?(\d+)\s+spoons?/gi,
    // "used/spent/cost X spoon(s)"
    /(?:used|spent|cost|took)\s+(\d+)\s+spoons?/gi,
    // Simple "X spoons" at word boundary
    /\b(\d+)\s+spoons?\b/gi,
  ];

  // Extract numbers with spoon context
  for (const pattern of spoonPatterns) {
    let match;
    while ((match = pattern.exec(textLower)) !== null) {
      const num = parseInt(match[1], 10);
      const context = textLower.substring(Math.max(0, match.index - 20), match.index);
      const afterContext = textLower.substring(match.index, Math.min(textLower.length, match.index + match[0].length + 20));

      // Determine type based on context
      if (context.includes('started') || context.includes('began') || context.includes('woke')) {
        started = num;
      } else if (context.includes('used') || context.includes('spent') || context.includes('cost') || context.includes('took')) {
        used = num;
      } else if (afterContext.includes('left') || afterContext.includes('remaining') ||
                 context.includes('have') || context.includes('got') || context.includes('only')) {
        current = num;
      } else if (current === undefined) {
        // Default to current if no other context
        current = num;
      }
    }
  }

  // Calculate current from started - used if we have both
  if (started !== undefined && used !== undefined && current === undefined) {
    current = Math.max(0, started - used);
  }

  // If we found any spoon data, return it
  if (current !== undefined || started !== undefined || used !== undefined) {
    // Normalize to 0-10 energy level (assuming typical spoon count is 0-12)
    // Most people describe having 5-10 spoons on a good day
    const effectiveCurrent = current ?? (started !== undefined && used !== undefined ? started - used : 5);
    const energyLevel = Math.min(10, Math.max(0, Math.round(effectiveCurrent * (10 / 12) * 10) / 10));

    return {
      current: current ?? effectiveCurrent,
      used,
      started,
      energyLevel,
    };
  }

  return null;
}
