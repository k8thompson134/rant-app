/**
 * Custom Lemma CRUD Operations
 * This file contains operations for managing custom symptom words
 */

import { db } from './db';
import { customLemmas } from './schema';
import { desc, eq } from 'drizzle-orm';
import { Platform } from 'react-native';
import type { CustomLemmaEntry } from '../types';

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
 * Generate a unique ID for a custom lemma
 */
function generateLemmaId(): string {
  return `lemma_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add a new custom symptom word
 * @param word - The user's custom word (will be lowercased and trimmed)
 * @param symptom - The symptom this word should map to
 * @returns The created custom lemma entry
 */
export async function addCustomLemma(
  word: string,
  symptom: string
): Promise<CustomLemmaEntry> {
  const normalizedWord = word.toLowerCase().trim();

  if (!normalizedWord) {
    throw new Error('Word cannot be empty');
  }

  if (!symptom) {
    throw new Error('Symptom cannot be empty');
  }

  const entry: CustomLemmaEntry = {
    id: generateLemmaId(),
    word: normalizedWord,
    symptom,
    createdAt: Date.now(),
  };

  if (!isDatabaseAvailable()) {
    console.log('Mock add custom lemma (web):', entry);
    return entry;
  }

  try {
    await db!.insert(customLemmas).values({
      id: entry.id,
      word: entry.word,
      symptom: entry.symptom,
    });

    console.log('Custom lemma added:', entry.word, '->', entry.symptom);
    return entry;
  } catch (error) {
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      throw new Error(`The word "${word}" is already added`);
    }
    console.error('Failed to add custom lemma:', error);
    throw error;
  }
}

/**
 * Get all custom symptom words
 * @returns Array of custom lemma entries, sorted by most recent first
 */
export async function getAllCustomLemmas(): Promise<CustomLemmaEntry[]> {
  if (!isDatabaseAvailable()) {
    return [];
  }

  try {
    const results = await db!
      .select()
      .from(customLemmas)
      .orderBy(desc(customLemmas.createdAt));

    return results.map((row) => ({
      id: row.id,
      word: row.word,
      symptom: row.symptom,
      createdAt: row.createdAt,
    }));
  } catch (error) {
    console.error('Failed to get custom lemmas:', error);
    throw error;
  }
}

/**
 * Get custom lemmas as a lookup map for NLP extraction
 * @returns Record mapping custom words to their symptoms
 */
export async function getCustomLemmasMap(): Promise<Record<string, string>> {
  if (!isDatabaseAvailable()) {
    return {};
  }

  try {
    const results = await db!.select().from(customLemmas);

    const map: Record<string, string> = {};
    for (const row of results) {
      map[row.word] = row.symptom;
    }
    return map;
  } catch (error) {
    console.error('Failed to get custom lemmas map:', error);
    return {};
  }
}

/**
 * Update a custom symptom word
 * @param id - The lemma ID to update
 * @param word - New word (optional)
 * @param symptom - New symptom mapping (optional)
 */
export async function updateCustomLemma(
  id: string,
  word?: string,
  symptom?: string
): Promise<void> {
  if (!isDatabaseAvailable()) {
    console.log('Mock update custom lemma (web):', id);
    return;
  }

  try {
    const updates: { word?: string; symptom?: string } = {};

    if (word !== undefined) {
      const normalizedWord = word.toLowerCase().trim();
      if (!normalizedWord) {
        throw new Error('Word cannot be empty');
      }
      updates.word = normalizedWord;
    }

    if (symptom !== undefined) {
      if (!symptom) {
        throw new Error('Symptom cannot be empty');
      }
      updates.symptom = symptom;
    }

    if (Object.keys(updates).length === 0) {
      return; // Nothing to update
    }

    await db!
      .update(customLemmas)
      .set(updates)
      .where(eq(customLemmas.id, id));

    console.log('Custom lemma updated:', id);
  } catch (error) {
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      throw new Error(`This word is already added`);
    }
    console.error('Failed to update custom lemma:', error);
    throw error;
  }
}

/**
 * Delete a custom symptom word
 * @param id - The lemma ID to delete
 */
export async function deleteCustomLemma(id: string): Promise<void> {
  if (!isDatabaseAvailable()) {
    console.log('Mock delete custom lemma (web):', id);
    return;
  }

  try {
    await db!.delete(customLemmas).where(eq(customLemmas.id, id));
    console.log('Custom lemma deleted:', id);
  } catch (error) {
    console.error('Failed to delete custom lemma:', error);
    throw error;
  }
}

/**
 * Check if a word already exists as a custom lemma
 * @param word - The word to check
 * @returns True if the word exists
 */
export async function customLemmaExists(word: string): Promise<boolean> {
  if (!isDatabaseAvailable()) {
    return false;
  }

  const normalizedWord = word.toLowerCase().trim();

  try {
    const results = await db!
      .select()
      .from(customLemmas)
      .where(eq(customLemmas.word, normalizedWord))
      .limit(1);

    return results.length > 0;
  } catch (error) {
    console.error('Failed to check custom lemma:', error);
    return false;
  }
}
