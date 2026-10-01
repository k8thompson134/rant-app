/**
 * Common symptoms for Quick Check-In
 * Top symptoms frequently reported by people with ME/CFS and chronic illness
 */

export const COMMON_SYMPTOMS = [
  'fatigue',
  'pem',
  'brain_fog',
  'pain',
  'headache',
  'nausea',
  'dizziness',
  'insomnia',
  'anxiety',
  'low_mood',
  'muscle_weakness',
  'joint_pain',
] as const;

export type CommonSymptom = typeof COMMON_SYMPTOMS[number];

/**
 * Display names for common symptoms
 */
export const COMMON_SYMPTOM_LABELS: Record<CommonSymptom, string> = {
  fatigue: 'Fatigue',
  pem: 'PEM/Crash',
  brain_fog: 'Brain Fog',
  pain: 'General Pain',
  headache: 'Headache',
  nausea: 'Nausea',
  dizziness: 'Dizziness',
  insomnia: 'Sleep Issues',
  anxiety: 'Anxiety',
  low_mood: 'Low Mood',
  muscle_weakness: 'Muscle Weakness',
  joint_pain: 'Joint Pain',
};

/**
 * Icons for common symptoms (Ionicons names)
 */
export const COMMON_SYMPTOM_ICONS: Record<CommonSymptom, string> = {
  fatigue: 'battery-dead-outline',
  pem: 'flash-off-outline',
  brain_fog: 'cloud-outline',
  pain: 'warning-outline',
  headache: 'sad-outline',
  nausea: 'restaurant-outline',
  dizziness: 'sync-outline',
  insomnia: 'moon-outline',
  anxiety: 'pulse-outline',
  low_mood: 'rain-outline',
  muscle_weakness: 'body-outline',
  joint_pain: 'fitness-outline',
};
