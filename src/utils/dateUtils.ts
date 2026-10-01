/**
 * Date utility functions for trend analysis
 */

import { DateRange, TimePeriod } from '../types/insights';

/**
 * Get start of day (00:00:00)
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day (23:59:59.999)
 */
export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get start of week (Monday 00:00:00)
 */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of week (Sunday 23:59:59.999)
 */
export function endOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
  d.setDate(diff);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Get start of month
 */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

/**
 * Get end of month
 */
export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Check if two dates are in the same month
 */
export function isSameMonth(date1: Date | number, date2: Date | number): boolean {
  const d1 = typeof date1 === 'number' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'number' ? new Date(date2) : date2;
  return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
}

/**
 * Get date range for a time period
 */
export function getDateRangeForPeriod(period: TimePeriod, referenceDate: Date = new Date()): DateRange {
  const end = endOfDay(referenceDate);
  let start: Date;

  switch (period) {
    case '7d':
      start = new Date(end);
      start.setDate(start.getDate() - 6);
      start = startOfDay(start);
      break;
    case '30d':
      start = new Date(end);
      start.setDate(start.getDate() - 29);
      start = startOfDay(start);
      break;
    case '90d':
      start = new Date(end);
      start.setDate(start.getDate() - 89);
      start = startOfDay(start);
      break;
    case 'all':
      start = new Date(0); // Unix epoch
      break;
    default:
      start = new Date(end);
      start.setDate(start.getDate() - 29);
      start = startOfDay(start);
  }

  return { start, end };
}

/**
 * Get array of dates for a week (7 days starting from Monday)
 */
export function getWeekDates(weekStart: Date): Date[] {
  const dates: Date[] = [];
  const start = startOfWeek(weekStart);

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    dates.push(date);
  }

  return dates;
}

/**
 * Get day of week name
 */
export function getDayName(date: Date, short: boolean = false): string {
  const days = short
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Get month name
 */
export function getMonthName(date: Date, short: boolean = false): string {
  const months = short
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[date.getMonth()];
}

/**
 * Format date range as readable string
 */
export function formatDateRange(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();

  if (sameMonth && sameYear) {
    return `${getMonthName(start, true)} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
  } else if (sameYear) {
    return `${getMonthName(start, true)} ${start.getDate()} - ${getMonthName(end, true)} ${end.getDate()}, ${start.getFullYear()}`;
  } else {
    return `${getMonthName(start, true)} ${start.getDate()}, ${start.getFullYear()} - ${getMonthName(end, true)} ${end.getDate()}, ${end.getFullYear()}`;
  }
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Subtract days from a date
 */
export function subtractDays(date: Date, days: number): Date {
  return addDays(date, -days);
}

/**
 * Get number of days between two dates
 */
export function daysBetween(start: Date, end: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((end.getTime() - start.getTime()) / oneDay));
}
