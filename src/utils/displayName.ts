import { SYMPTOM_DISPLAY_NAMES } from '../types';

export function displayName(symptom: string): string {
  const mapped = SYMPTOM_DISPLAY_NAMES[symptom];
  if (mapped) return mapped;
  const spaced = symptom.replace(/_/g, ' ');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
