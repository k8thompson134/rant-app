import { RantEntry } from '../types';
import { startOfDay } from './dateUtils';

export function calculateStreak(entries: RantEntry[]): number {
  if (entries.length === 0) return 0;
  const days = new Set<string>();
  for (const e of entries) {
    const d = startOfDay(new Date(e.timestamp));
    days.add(d.toISOString());
  }
  const today = startOfDay(new Date());
  let streak = 0;
  let check = new Date(today);
  if (!days.has(check.toISOString())) {
    check.setDate(check.getDate() - 1);
    if (!days.has(check.toISOString())) return 0;
  }
  while (days.has(check.toISOString())) {
    streak++;
    check.setDate(check.getDate() - 1);
  }
  return streak;
}
