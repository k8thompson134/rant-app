/**
 * Database operations for rant entries
 */

import { Platform } from 'react-native';
import { db } from './db';
import { rants } from './schema';
import { desc, eq } from 'drizzle-orm';
import { RantEntry, ExtractedSymptom } from '../types';

/**
 * Generate a unique ID for a rant entry
 */
function generateId(): string {
  return `rant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if database is available (not on web)
 */
function isDatabaseAvailable(): boolean {
  if (!db || Platform.OS === 'web') {
    console.warn('Database not available on web platform');
    return false;
  }
  return true;
}

/**
 * Save a new rant entry to the database
 */
export async function saveRantEntry(
  text: string,
  symptoms: ExtractedSymptom[],
  customTimestamp?: number
): Promise<RantEntry> {
  const entry: RantEntry = {
    id: generateId(),
    text,
    timestamp: customTimestamp || Date.now(),
    symptoms,
  };

  if (!isDatabaseAvailable()) {
    console.log('Mock save (web):', entry);
    return entry;
  }

  try {
    await db!.insert(rants).values({
      id: entry.id,
      text: entry.text,
      timestamp: entry.timestamp,
      symptoms: JSON.stringify(entry.symptoms),
    });

    console.log('Rant entry saved:', entry.id);
    return entry;
  } catch (error) {
    console.error('Failed to save rant entry:', error);
    throw error;
  }
}

/**
 * Update an existing rant entry
 */
export async function updateRantEntry(
  id: string,
  text: string,
  symptoms: ExtractedSymptom[]
): Promise<void> {
  if (!isDatabaseAvailable()) {
    console.log('Mock update (web):', id);
    return;
  }

  try {
    await db!
      .update(rants)
      .set({
        text,
        symptoms: JSON.stringify(symptoms),
      })
      .where(eq(rants.id, id));

    console.log('Rant entry updated:', id);
  } catch (error) {
    console.error('Failed to update rant entry:', error);
    throw error;
  }
}

/**
 * Get all rant entries, most recent first
 * Excludes draft entries by default
 */
export async function getAllRantEntries(): Promise<RantEntry[]> {
  if (!isDatabaseAvailable()) {
    return [];
  }

  try {
    const results = await db!
      .select()
      .from(rants)
      .where(eq(rants.isDraft, false))
      .orderBy(desc(rants.timestamp));

    return results.map((row) => ({
      id: row.id,
      text: row.text,
      timestamp: row.timestamp,
      symptoms: JSON.parse(row.symptoms) as ExtractedSymptom[],
    }));
  } catch (error) {
    console.error('Failed to get rant entries:', error);
    throw error;
  }
}

/**
 * Get a single rant entry by ID
 */
export async function getRantEntryById(id: string): Promise<RantEntry | null> {
  if (!isDatabaseAvailable()) {
    return null;
  }

  try {
    const results = await db!
      .select()
      .from(rants)
      .where(eq(rants.id, id))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      id: row.id,
      text: row.text,
      timestamp: row.timestamp,
      symptoms: JSON.parse(row.symptoms) as ExtractedSymptom[],
    };
  } catch (error) {
    console.error('Failed to get rant entry:', error);
    throw error;
  }
}

/**
 * Delete a rant entry by ID
 */
export async function deleteRantEntry(id: string): Promise<void> {
  if (!isDatabaseAvailable()) {
    console.log('Mock delete (web):', id);
    return;
  }

  try {
    await db!.delete(rants).where(eq(rants.id, id));
    console.log('Rant entry deleted:', id);
  } catch (error) {
    console.error('Failed to delete rant entry:', error);
    throw error;
  }
}

/**
 * Get rant entries from the last N days
 */
export async function getRecentRantEntries(days: number = 7): Promise<RantEntry[]> {
  if (!isDatabaseAvailable()) {
    return [];
  }

  try {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;

    const results = await db!
      .select()
      .from(rants)
      .where(eq(rants.timestamp, cutoffTime))
      .orderBy(desc(rants.timestamp));

    return results.map((row) => ({
      id: row.id,
      text: row.text,
      timestamp: row.timestamp,
      symptoms: JSON.parse(row.symptoms) as ExtractedSymptom[],
    }));
  } catch (error) {
    console.error('Failed to get recent rant entries:', error);
    throw error;
  }
}

/**
 * Count total rant entries
 */
export async function getRantEntryCount(): Promise<number> {
  if (!isDatabaseAvailable()) {
    return 0;
  }

  try {
    const results = await db!.select().from(rants);
    return results.length;
  } catch (error) {
    console.error('Failed to count rant entries:', error);
    return 0;
  }
}

// ==================== Draft Operations ====================

/**
 * Save a draft entry (for auto-save functionality)
 * Replaces any existing draft
 */
export async function saveDraftEntry(
  text: string,
  symptoms: ExtractedSymptom[] = []
): Promise<string> {
  if (!isDatabaseAvailable()) {
    console.log('Mock save draft (web)');
    return 'draft_web';
  }

  try {
    // First, clear any existing draft
    await clearDraftEntry();

    // Create new draft
    const draftId = `draft_${Date.now()}`;
    await db!.insert(rants).values({
      id: draftId,
      text,
      timestamp: Date.now(),
      symptoms: JSON.stringify(symptoms),
      isDraft: true,
    });

    console.log('Draft saved:', draftId);
    return draftId;
  } catch (error) {
    console.error('Failed to save draft:', error);
    throw error;
  }
}

/**
 * Get the current draft entry (if any)
 * Returns null if no draft exists
 */
export async function getDraftEntry(): Promise<RantEntry | null> {
  if (!isDatabaseAvailable()) {
    return null;
  }

  try {
    const results = await db!
      .select()
      .from(rants)
      .where(eq(rants.isDraft, true))
      .orderBy(desc(rants.timestamp))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      id: row.id,
      text: row.text,
      timestamp: row.timestamp,
      symptoms: JSON.parse(row.symptoms) as ExtractedSymptom[],
    };
  } catch (error) {
    console.error('Failed to get draft entry:', error);
    return null;
  }
}

/**
 * Clear all draft entries
 */
export async function clearDraftEntry(): Promise<void> {
  if (!isDatabaseAvailable()) {
    console.log('Mock clear draft (web)');
    return;
  }

  try {
    await db!.delete(rants).where(eq(rants.isDraft, true));
    console.log('Draft entries cleared');
  } catch (error) {
    console.error('Failed to clear draft entries:', error);
    throw error;
  }
}

/**
 * Promote a draft to a regular entry
 * Updates isDraft flag and timestamp
 */
export async function promoteDraftToEntry(draftId: string): Promise<RantEntry> {
  if (!isDatabaseAvailable()) {
    throw new Error('Database not available');
  }

  try {
    // Get the draft
    const draft = await getRantEntryById(draftId);
    if (!draft) {
      throw new Error('Draft not found');
    }

    // Update to regular entry
    const newTimestamp = Date.now();
    await db!
      .update(rants)
      .set({
        isDraft: false,
        timestamp: newTimestamp,
      })
      .where(eq(rants.id, draftId));

    console.log('Draft promoted to entry:', draftId);

    return {
      ...draft,
      timestamp: newTimestamp,
    };
  } catch (error) {
    console.error('Failed to promote draft:', error);
    throw error;
  }
}
