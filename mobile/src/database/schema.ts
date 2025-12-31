/**
 * Database schema for RantTrack
 * Using Drizzle ORM with SQLite
 */

import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

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
    .default(sql`(unixepoch())`),
});

export type Rant = typeof rants.$inferSelect;
export type NewRant = typeof rants.$inferInsert;
