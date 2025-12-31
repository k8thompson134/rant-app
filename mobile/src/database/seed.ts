/**
 * Seed data for testing the month view
 */

import { db } from './db';
import { rants } from './schema';
import { EditableSymptom } from '../types';

export async function seedSampleData() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Helper to create timestamp for a specific day this month
  const getTimestamp = (day: number, hour: number = 10, minute: number = 0) => {
    return new Date(currentYear, currentMonth, day, hour, minute).getTime();
  };

  const sampleEntries = [
    // Today - multiple entries
    {
      text: "Woke up feeling really fatigued. The PEM from yesterday's walk is hitting hard.",
      symptoms: [
        { symptom: 'fatigue', severity: 'severe' as const },
        { symptom: 'pem', severity: 'severe' as const },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate(), 8, 30),
    },
    {
      text: "Brain fog making it hard to focus on work. Had to take a break.",
      symptoms: [
        { symptom: 'brain_fog', severity: 'moderate' as const },
        { symptom: 'fatigue', severity: 'moderate' as const },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate(), 14, 15),
    },
    {
      text: "Slight headache developing. Going to rest.",
      symptoms: [
        { symptom: 'headache', severity: 'mild' as const },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate(), 18, 45),
    },

    // Yesterday
    {
      text: "Pushed myself too hard on a short walk. Already feeling the crash coming.",
      symptoms: [
        { symptom: 'pem', severity: 'moderate' as const },
        { symptom: 'fatigue', severity: 'moderate' as const },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 1, 16, 20),
    },

    // 3 days ago
    {
      text: "Good morning! Actually feeling okay today. Pacing seems to be working.",
      symptoms: [
        { symptom: 'fatigue', severity: 'mild' as const },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 3, 9, 0),
    },

    // 5 days ago
    {
      text: "Terrible pain day. Everything hurts and I can barely move.",
      symptoms: [
        { symptom: 'pain', severity: 'severe' as const },
        { symptom: 'fatigue', severity: 'severe' as const },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 5, 11, 30),
    },

    // 7 days ago
    {
      text: "Migraine started this afternoon. Light and sound sensitivity is bad.",
      symptoms: [
        { symptom: 'headache', severity: 'severe' as const },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 7, 15, 45),
    },

    // 10 days ago
    {
      text: "Brain fog all day. Forgot what I was doing multiple times.",
      symptoms: [
        { symptom: 'brain_fog', severity: 'moderate' as const },
        { symptom: 'fatigue', severity: 'moderate' as const },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 10, 12, 0),
    },

    // 12 days ago
    {
      text: "Had a decent day! Managed to do some light activities without crashing.",
      symptoms: [
        { symptom: 'fatigue', severity: 'mild' as const },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 12, 10, 15),
    },

    // 15 days ago
    {
      text: "Crash day. Overdid it yesterday and now paying the price.",
      symptoms: [
        { symptom: 'pem', severity: 'severe' as const },
        { symptom: 'fatigue', severity: 'severe' as const },
        { symptom: 'pain', severity: 'moderate' as const },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 15, 13, 30),
    },

    // 18 days ago
    {
      text: "Moderate symptoms. Trying to pace myself better.",
      symptoms: [
        { symptom: 'fatigue', severity: 'moderate' as const },
        { symptom: 'brain_fog', severity: 'mild' as const },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 18, 11, 0),
    },

    // 20 days ago
    {
      text: "Good day overall. Sticking to my energy envelope.",
      symptoms: [
        { symptom: 'fatigue', severity: 'mild' as const },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 20, 14, 30),
    },
  ];

  // Save all sample entries directly to database with custom timestamps
  for (const entry of sampleEntries) {
    try {
      const id = `rant_${entry.timestamp}_${Math.random().toString(36).substr(2, 9)}`;
      await db!.insert(rants).values({
        id,
        text: entry.text,
        timestamp: entry.timestamp,
        symptoms: JSON.stringify(entry.symptoms),
      });
      console.log(`Seeded entry for ${new Date(entry.timestamp).toLocaleDateString()}`);
    } catch (error) {
      console.error('Failed to seed entry:', error);
    }
  }

  console.log('Sample data seeded successfully!');
}
