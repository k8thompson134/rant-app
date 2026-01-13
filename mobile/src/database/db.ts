/**
 * Database initialization and connection
 */

import { Platform } from 'react-native';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

// Only initialize SQLite on native platforms (iOS/Android)
// Web doesn't support SQLite without special headers
const expoDb = Platform.OS !== 'web' ? SQLite.openDatabaseSync('ranttrack.db') : null;

export const db = expoDb ? drizzle(expoDb, { schema }) : null;

const DB_VERSION = 3; // Increment when schema changes

/**
 * Get current database version
 */
async function getDbVersion(): Promise<number> {
  if (!expoDb) return 0;

  try {
    // Create version table if it doesn't exist
    await expoDb.execAsync(`
      CREATE TABLE IF NOT EXISTS db_version (
        version INTEGER PRIMARY KEY
      );
    `);

    const result = await expoDb.getAllAsync<{ version: number }>('SELECT version FROM db_version LIMIT 1');
    return result.length > 0 ? result[0].version : 0;
  } catch (error) {
    console.error('Failed to get database version:', error);
    return 0;
  }
}

/**
 * Set database version
 */
async function setDbVersion(version: number): Promise<void> {
  if (!expoDb) return;

  try {
    await expoDb.execAsync(`
      DELETE FROM db_version;
      INSERT INTO db_version (version) VALUES (${version});
    `);
  } catch (error) {
    console.error('Failed to set database version:', error);
    throw error;
  }
}

/**
 * Initialize database tables and handle migrations
 */
export async function initDatabase() {
  // Skip database initialization on web
  if (Platform.OS === 'web' || !expoDb) {
    console.log('Database not available on web platform');
    return;
  }

  try {
    const currentVersion = await getDbVersion();
    console.log(`Current database version: ${currentVersion}`);

    // Create tables if they don't exist (version 1)
    if (currentVersion === 0) {
      await expoDb.execAsync(`
        CREATE TABLE IF NOT EXISTS rants (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          timestamp INTEGER NOT NULL,
          symptoms TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch())
        );
      `);
      await setDbVersion(1);
      console.log('Database created at version 1');
    }

    // Migration to version 2: Add isDraft column
    if (currentVersion < 2) {
      console.log('Migrating database to version 2...');

      // Check if column already exists (for safety)
      const tableInfo = await expoDb.getAllAsync<{ name: string }>(
        "PRAGMA table_info(rants);"
      );
      const hasIsDraft = tableInfo.some(col => col.name === 'is_draft');

      if (!hasIsDraft) {
        await expoDb.execAsync(`
          ALTER TABLE rants ADD COLUMN is_draft INTEGER NOT NULL DEFAULT 0;
        `);
        console.log('Added is_draft column');
      }

      await setDbVersion(2);
      console.log('Database migrated to version 2');
    }

    // Migration to version 3: Add custom_lemmas table
    if (currentVersion < 3) {
      console.log('Migrating database to version 3...');

      await expoDb.execAsync(`
        CREATE TABLE IF NOT EXISTS custom_lemmas (
          id TEXT PRIMARY KEY,
          word TEXT NOT NULL UNIQUE,
          symptom TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch())
        );
      `);

      await setDbVersion(3);
      console.log('Database migrated to version 3 - added custom_lemmas table');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}
