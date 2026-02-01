/**
 * Database schema for RantTrack
 * Using Drizzle ORM with SQLite
 */

import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable, index } from 'drizzle-orm/sqlite-core';

/**
 * Rant entries table
 */
export const rants = sqliteTable('rants', {
  id: text('id').primaryKey(),
  text: text('text').notNull(),
  timestamp: integer('timestamp').notNull(),
  // Store symptoms as JSON array
  symptoms: text('symptoms').notNull(), // JSON stringified array of ExtractedSymptom[]
  // Draft flag for auto-save functionality
  isDraft: integer('is_draft', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
}, (table) => ({
  timestampIdx: index('rants_timestamp_idx').on(table.timestamp),
  isDraftIdx: index('rants_is_draft_idx').on(table.isDraft),
}));

export type Rant = typeof rants.$inferSelect;
export type NewRant = typeof rants.$inferInsert;

/**
 * Custom symptom words table
 * Allows users to add their own words that map to existing symptoms
 * Example: "wibbly" -> "dizziness", "zonked" -> "fatigue"
 */
export const customLemmas = sqliteTable('custom_lemmas', {
  id: text('id').primaryKey(),
  // The user's custom word (lowercase, trimmed)
  word: text('word').notNull().unique(),
  // The symptom this word maps to (must be a valid symptom from SYMPTOM_LEMMAS values)
  symptom: text('symptom').notNull(),
  // When the custom word was added
  createdAt: integer('created_at')
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export type CustomLemma = typeof customLemmas.$inferSelect;
export type NewCustomLemma = typeof customLemmas.$inferInsert;
