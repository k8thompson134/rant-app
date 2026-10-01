import { RantEntry } from './types';

const KEY = 'ranttrack-entries-v1';

export type StorageResult = { ok: true } | { ok: false; error: string };

export function loadEntries(): { entries: RantEntry[]; error?: string } {
  try {
    const raw = localStorage.getItem(KEY);
    return { entries: raw ? (JSON.parse(raw) as RantEntry[]) : [] };
  } catch (e) {
    return { entries: [], error: `Saved entries could not be read: ${String(e)}` };
  }
}

export function saveEntries(entries: RantEntry[]): StorageResult {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: `Entries could not be saved: ${String(e)}` };
  }
}
