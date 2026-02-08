/**
 * Seed data for testing the month view
 * Updated to reflect current extractor and symptom types
 */

import { db } from './db';
import { rants } from './schema';
import { EditableSymptom } from '../types';

// Helper to generate unique IDs for symptoms
const generateId = () => `symptom_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

export async function seedSampleData() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Helper to create timestamp for a specific day this month
  const getTimestamp = (day: number, hour: number = 10, minute: number = 0) => {
    return new Date(currentYear, currentMonth, day, hour, minute).getTime();
  };

  const sampleEntries = [
    // Today - multiple entries showing various symptom types
    {
      text: "Woke up completely exhausted. The PEM from yesterday's walk is hitting hard. Burning pain in my shoulders and neck.",
      symptoms: [
        {
          id: generateId(),
          symptom: 'fatigue',
          matched: 'exhausted',
          method: 'lemma' as const,
          severity: 'severe' as const,
          timeOfDay: 'morning' as const,
        },
        {
          id: generateId(),
          symptom: 'pem',
          matched: 'PEM',
          method: 'lemma' as const,
          severity: 'severe' as const,
          trigger: { activity: 'walking', timeframe: 'after' },
          duration: { ongoing: true },
        },
        {
          id: generateId(),
          symptom: 'pain',
          matched: 'burning pain',
          method: 'phrase' as const,
          severity: 'moderate' as const,
          painDetails: { qualifiers: ['burning'], location: 'shoulders' },
        },
        {
          id: generateId(),
          symptom: 'neck_pain',
          matched: 'neck',
          method: 'lemma' as const,
          severity: 'moderate' as const,
        },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate(), 8, 30),
    },
    {
      text: "Brain fog making it impossible to focus. Feeling really spacey and can't concentrate on anything.",
      symptoms: [
        {
          id: generateId(),
          symptom: 'brain_fog',
          matched: 'brain fog',
          method: 'phrase' as const,
          severity: 'severe' as const,
          duration: { qualifier: 'all', unit: 'days' },
        },
        {
          id: generateId(),
          symptom: 'focus',
          matched: "can't concentrate",
          method: 'phrase' as const,
          severity: 'moderate' as const,
        },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate(), 14, 15),
    },
    {
      text: "Pounding headache started this afternoon. Light sensitivity is brutal.",
      symptoms: [
        {
          id: generateId(),
          symptom: 'headache',
          matched: 'pounding headache',
          method: 'phrase' as const,
          severity: 'severe' as const,
          timeOfDay: 'afternoon' as const,
        },
        {
          id: generateId(),
          symptom: 'light_sensitivity',
          matched: 'light sensitivity',
          method: 'phrase' as const,
          severity: 'severe' as const,
        },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate(), 18, 45),
    },

    // Yesterday - POTS/dysautonomia symptoms
    {
      text: "Heart racing after standing up. Had to lie down for an hour. Dizzy and lightheaded all morning.",
      symptoms: [
        {
          id: generateId(),
          symptom: 'palpitations',
          matched: 'heart racing',
          method: 'phrase' as const,
          severity: 'moderate' as const,
          trigger: { activity: 'standing', timeframe: 'after' },
        },
        {
          id: generateId(),
          symptom: 'orthostatic',
          matched: 'standing up',
          method: 'phrase' as const,
          severity: 'moderate' as const,
        },
        {
          id: generateId(),
          symptom: 'dizziness',
          matched: 'dizzy',
          method: 'lemma' as const,
          severity: 'moderate' as const,
          timeOfDay: 'morning' as const,
          duration: { qualifier: 'all', unit: 'hours' },
        },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 1, 10, 20),
    },

    // 2 days ago - GI symptoms
    {
      text: "Nausea since breakfast. Bloated and crampy. IBS acting up again.",
      symptoms: [
        {
          id: generateId(),
          symptom: 'nausea',
          matched: 'nausea',
          method: 'lemma' as const,
          severity: 'moderate' as const,
          duration: { since: 'breakfast' },
        },
        {
          id: generateId(),
          symptom: 'bloating',
          matched: 'bloated',
          method: 'lemma' as const,
          severity: 'moderate' as const,
        },
        {
          id: generateId(),
          symptom: 'gi_cramping',
          matched: 'crampy',
          method: 'lemma' as const,
          severity: 'mild' as const,
        },
        {
          id: generateId(),
          symptom: 'ibs',
          matched: 'IBS',
          method: 'lemma' as const,
          severity: 'moderate' as const,
        },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 2, 12, 0),
    },

    // 3 days ago - Better day with spoon tracking
    {
      text: "Actually decent day! Started with 4 spoons, still have 2 left. Mild fatigue but manageable.",
      symptoms: [
        {
          id: generateId(),
          symptom: 'fatigue',
          matched: 'fatigue',
          method: 'lemma' as const,
          severity: 'mild' as const,
        },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 3, 9, 0),
    },

    // 5 days ago - Full body pain flare
    {
      text: "Terrible flare day. Sharp joint pain in my knees and hips. Muscles aching everywhere. Everything hurts.",
      symptoms: [
        {
          id: generateId(),
          symptom: 'flare',
          matched: 'flare',
          method: 'lemma' as const,
          severity: 'severe' as const,
        },
        {
          id: generateId(),
          symptom: 'joint_pain',
          matched: 'joint pain',
          method: 'phrase' as const,
          severity: 'severe' as const,
          painDetails: { qualifiers: ['sharp'], location: 'knees' },
        },
        {
          id: generateId(),
          symptom: 'muscle_pain',
          matched: 'muscles aching',
          method: 'phrase' as const,
          severity: 'severe' as const,
        },
        {
          id: generateId(),
          symptom: 'pain',
          matched: 'everything hurts',
          method: 'phrase' as const,
          severity: 'severe' as const,
        },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 5, 11, 30),
    },

    // 7 days ago - Sleep issues
    {
      text: "Insomnia last night, only got 3 hours. Woke up feeling unrefreshed. Night sweats were bad.",
      symptoms: [
        {
          id: generateId(),
          symptom: 'insomnia',
          matched: 'insomnia',
          method: 'lemma' as const,
          severity: 'severe' as const,
          timeOfDay: 'night' as const,
        },
        {
          id: generateId(),
          symptom: 'unrefreshing_sleep',
          matched: 'unrefreshed',
          method: 'lemma' as const,
          severity: 'moderate' as const,
        },
        {
          id: generateId(),
          symptom: 'night_sweats',
          matched: 'night sweats',
          method: 'phrase' as const,
          severity: 'moderate' as const,
        },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 7, 8, 0),
    },

    // 10 days ago - Neurological symptoms
    {
      text: "Numbness and tingling in my hands for hours. Internal vibrations feeling won't stop. Brain zaps when falling asleep.",
      symptoms: [
        {
          id: generateId(),
          symptom: 'numbness_tingling',
          matched: 'numbness and tingling',
          method: 'phrase' as const,
          severity: 'moderate' as const,
          painDetails: { qualifiers: [], location: 'hands' },
          duration: { value: 3, unit: 'hours' },
        },
        {
          id: generateId(),
          symptom: 'internal_vibrations',
          matched: 'internal vibrations',
          method: 'phrase' as const,
          severity: 'moderate' as const,
          duration: { ongoing: true },
        },
        {
          id: generateId(),
          symptom: 'brain_zaps',
          matched: 'brain zaps',
          method: 'phrase' as const,
          severity: 'mild' as const,
        },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 10, 21, 0),
    },

    // 12 days ago - Mental health symptoms
    {
      text: "Feeling really anxious and overwhelmed. Racing thoughts making it hard to relax. Low mood day.",
      symptoms: [
        {
          id: generateId(),
          symptom: 'anxiety',
          matched: 'anxious',
          method: 'lemma' as const,
          severity: 'moderate' as const,
        },
        {
          id: generateId(),
          symptom: 'overwhelmed',
          matched: 'overwhelmed',
          method: 'lemma' as const,
          severity: 'moderate' as const,
        },
        {
          id: generateId(),
          symptom: 'racing_thoughts',
          matched: 'racing thoughts',
          method: 'phrase' as const,
          severity: 'moderate' as const,
        },
        {
          id: generateId(),
          symptom: 'low_mood',
          matched: 'low mood',
          method: 'phrase' as const,
          severity: 'mild' as const,
        },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 12, 16, 0),
    },

    // 15 days ago - Classic PEM crash
    {
      text: "Full crash day. Overdid it at the grocery store. Can barely lift my arms. Feel flu-like all over.",
      symptoms: [
        {
          id: generateId(),
          symptom: 'pem',
          matched: 'crash',
          method: 'lemma' as const,
          severity: 'severe' as const,
          trigger: { activity: 'grocery shopping', timeframe: 'after' },
        },
        {
          id: generateId(),
          symptom: 'overexertion',
          matched: 'overdid it',
          method: 'phrase' as const,
          severity: 'severe' as const,
        },
        {
          id: generateId(),
          symptom: 'weakness',
          matched: "can barely lift",
          method: 'phrase' as const,
          severity: 'severe' as const,
        },
        {
          id: generateId(),
          symptom: 'flu_like',
          matched: 'flu-like',
          method: 'phrase' as const,
          severity: 'moderate' as const,
        },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 15, 13, 30),
    },

    // 18 days ago - Temperature regulation issues
    {
      text: "Temperature all over the place. Chills then sweating. Hands and feet freezing - Raynaud's acting up.",
      symptoms: [
        {
          id: generateId(),
          symptom: 'temperature_dysregulation',
          matched: 'temperature all over the place',
          method: 'phrase' as const,
          severity: 'moderate' as const,
        },
        {
          id: generateId(),
          symptom: 'chills',
          matched: 'chills',
          method: 'lemma' as const,
          severity: 'moderate' as const,
        },
        {
          id: generateId(),
          symptom: 'sweating',
          matched: 'sweating',
          method: 'lemma' as const,
          severity: 'mild' as const,
        },
        {
          id: generateId(),
          symptom: 'raynauds',
          matched: "Raynaud's",
          method: 'lemma' as const,
          severity: 'moderate' as const,
          painDetails: { qualifiers: ['freezing'], location: 'hands' },
        },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 18, 11, 0),
    },

    // 20 days ago - Respiratory symptoms
    {
      text: "Shortness of breath after showering. Chest tightness all morning. Had to use inhaler.",
      symptoms: [
        {
          id: generateId(),
          symptom: 'shortness_of_breath',
          matched: 'shortness of breath',
          method: 'phrase' as const,
          severity: 'moderate' as const,
          trigger: { activity: 'showering', timeframe: 'after' },
        },
        {
          id: generateId(),
          symptom: 'chest_tightness',
          matched: 'chest tightness',
          method: 'phrase' as const,
          severity: 'moderate' as const,
          timeOfDay: 'morning' as const,
        },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 20, 9, 30),
    },

    // 22 days ago - Sensory overload
    {
      text: "Sensory overload at the doctor's office. Fluorescent lights killing me. Every sound too loud.",
      symptoms: [
        {
          id: generateId(),
          symptom: 'sensory_overload',
          matched: 'sensory overload',
          method: 'phrase' as const,
          severity: 'severe' as const,
        },
        {
          id: generateId(),
          symptom: 'light_sensitivity',
          matched: 'fluorescent lights killing me',
          method: 'phrase' as const,
          severity: 'severe' as const,
        },
        {
          id: generateId(),
          symptom: 'sound_sensitivity',
          matched: 'every sound too loud',
          method: 'phrase' as const,
          severity: 'moderate' as const,
        },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 22, 14, 0),
    },

    // 25 days ago - EDS/hypermobility symptoms
    {
      text: "Shoulder subluxed putting on my shirt. Hip feeling unstable. Everything feels loosey goosey today.",
      symptoms: [
        {
          id: generateId(),
          symptom: 'subluxation',
          matched: 'subluxed',
          method: 'lemma' as const,
          severity: 'moderate' as const,
          painDetails: { qualifiers: [], location: 'shoulder' },
        },
        {
          id: generateId(),
          symptom: 'joint_instability',
          matched: 'unstable',
          method: 'lemma' as const,
          severity: 'moderate' as const,
          painDetails: { qualifiers: [], location: 'hip' },
        },
        {
          id: generateId(),
          symptom: 'hypermobility',
          matched: 'loosey goosey',
          method: 'phrase' as const,
          severity: 'mild' as const,
        },
      ] as EditableSymptom[],
      timestamp: getTimestamp(today.getDate() - 25, 8, 15),
    },
  ];

  // Save all sample entries directly to database with custom timestamps
  for (const entry of sampleEntries) {
    try {
      const id = `rant_${entry.timestamp}_${Math.random().toString(36).substring(2, 11)}`;
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
