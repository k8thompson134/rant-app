/**
 * Symptom Display & Color System
 * Symptom category type, display name mapping, and theme-aware color resolution.
 */

import { darkTheme } from '../theme/colors';
import type { Severity } from './index';

// Use darkTheme directly as fallback to avoid bundling issues
const colors = darkTheme;

export type SymptomCategory =
  // Energy & PEM
  | 'fatigue'
  | 'pem'
  | 'flare'
  | 'weakness'
  | 'malaise'
  | 'burnout'
  | 'overexertion'
  | 'activity_intolerance'
  | 'exercise_intolerance'
  | 'delayed_recovery'
  | 'pacing_failure'
  // Cognitive
  | 'brain_fog'
  | 'memory'
  | 'focus'
  // Pain
  | 'pain'
  | 'headache'
  | 'muscle_pain'
  | 'joint_pain'
  | 'back_pain'
  | 'neck_pain'
  | 'chest_pain'
  | 'gi_pain'
  | 'skin_pain'
  | 'nerve_pain'
  | 'allodynia'
  | 'coat_hanger_pain'
  // Joint & Mobility
  | 'subluxation'
  | 'dislocation'
  | 'hypermobility'
  | 'joint_instability'
  | 'stiffness'
  | 'swelling'
  | 'inflammation'
  | 'mobility'
  | 'balance'
  // Cardiovascular & Autonomic
  | 'palpitations'
  | 'bradycardia'
  | 'arrhythmia'
  | 'orthostatic'
  | 'dysautonomia'
  | 'presyncope'
  | 'blood_pooling'
  | 'dizziness'
  | 'fainting'
  | 'vertigo'
  | 'high_blood_pressure'
  | 'low_blood_pressure'
  | 'adrenaline_surge'
  // Gastrointestinal
  | 'digestive'
  | 'nausea'
  | 'vomiting'
  | 'bloating'
  | 'gi_cramping'
  | 'constipation'
  | 'diarrhea'
  | 'ibs'
  | 'reflux'
  | 'gastroparesis'
  | 'dysphagia'
  | 'food_intolerance'
  // Sleep
  | 'insomnia'
  | 'sleep_disturbance'
  | 'unrefreshing_sleep'
  | 'hypersomnia'
  // Neurological
  | 'numbness_tingling'
  | 'tremor'
  | 'twitching'
  | 'spasm'
  | 'internal_vibrations'
  | 'brain_zaps'
  | 'tinnitus'
  // Respiratory
  | 'shortness_of_breath'
  | 'wheezing'
  | 'cough'
  | 'asthma_attack'
  | 'chest_tightness'
  | 'respiratory_infection'
  // Mental Health & Mood
  | 'low_mood'
  | 'anxiety'
  | 'panic'
  | 'stress'
  | 'overwhelmed'
  | 'irritability'
  | 'mood_swings'
  | 'mental_health'
  | 'emotional_dysregulation'
  | 'racing_thoughts'
  | 'intrusive_thoughts'
  | 'rejection_sensitivity'
  | 'dissociation'
  | 'depersonalization'
  | 'derealization'
  | 'suicidal_ideation'
  // Temperature
  | 'temperature'
  | 'temperature_dysregulation'
  | 'sweating'
  | 'night_sweats'
  | 'chills'
  | 'fever'
  | 'heat_intolerance'
  | 'cold_intolerance'
  | 'flushing'
  | 'hot_flashes'
  // Sensory Sensitivity
  | 'sensitivity_light'
  | 'light_sensitivity'
  | 'sensitivity_sound'
  | 'sound_sensitivity'
  | 'smell_sensitivity'
  | 'sensory_overload'
  | 'sound_distortion'
  // Appetite & Weight
  | 'appetite'
  | 'appetite_change'
  | 'appetite_loss'
  | 'weight_change'
  | 'weight_gain'
  | 'weight_loss'
  | 'metabolic'
  // Skin & Autoimmune
  | 'rash'
  | 'hives'
  | 'itching'
  | 'bruising'
  | 'easy_bruising'
  | 'raynauds'
  | 'photosensitivity'
  | 'skin_sensitivity'
  | 'lump'
  | 'hair_loss'
  | 'petechiae'
  | 'slow_healing'
  // Vision & Eyes
  | 'vision_changes'
  | 'visual_disturbances'
  | 'visual_snow'
  | 'aura'
  | 'dry_eyes'
  | 'sicca'
  // Hearing
  | 'hearing_changes'
  // Mouth & Throat
  | 'dry_mouth'
  | 'mouth_ulcers'
  | 'sore_throat'
  // Urinary
  | 'urinary_frequency'
  | 'urinary_urgency'
  | 'cystitis'
  // Lymphatic & Immune
  | 'swollen_lymph_nodes'
  | 'frequent_infections'
  // Hormonal & Reproductive
  | 'hormonal'
  | 'menstruation'
  | 'menstrual_cramps'
  | 'irregular_cycle'
  | 'missed_period'
  | 'late_period'
  | 'heavy_bleeding'
  | 'breast_tenderness'
  // Other
  | 'bleeding'
  | 'flu_like'
  // Smell & Taste
  | 'anosmia'
  | 'dysgeusia'
  | 'parosmia'
  // Allergic & Immune
  | 'mcas'
  | 'allergic_reaction'
  | 'alcohol_intolerance';

export const SYMPTOM_DISPLAY_NAMES: Record<string, string> = {
  // Energy & Fatigue
  fatigue: 'Fatigue',
  pem: 'Post-Exertional Malaise (PEM)',
  flare: 'Flare-up',
  burnout: 'Burnout',
  malaise: 'General Malaise',
  weakness: 'Weakness',
  overexertion: 'Overexertion',
  activity_intolerance: 'Activity Intolerance',
  exercise_intolerance: 'Exercise Intolerance',
  delayed_recovery: 'Delayed Recovery',
  pacing_failure: 'Pacing Failure',

  // Cognitive
  brain_fog: 'Brain Fog',
  memory: 'Memory Problems',
  focus: 'Difficulty Concentrating',

  // Pain
  pain: 'Pain (general)',
  headache: 'Headache',
  muscle_pain: 'Muscle Pain',
  joint_pain: 'Joint Pain',
  back_pain: 'Back Pain',
  neck_pain: 'Neck Pain',
  chest_pain: 'Chest Pain',
  gi_pain: 'Abdominal Pain',
  skin_pain: 'Skin Pain',
  nerve_pain: 'Nerve Pain',
  allodynia: 'Allodynia (painful touch)',
  coat_hanger_pain: 'Coat Hanger Pain',

  // Joint & Mobility
  subluxation: 'Joint Subluxation',
  dislocation: 'Joint Dislocation',
  hypermobility: 'Hypermobility',
  joint_instability: 'Joint Instability',
  stiffness: 'Stiffness',
  swelling: 'Swelling',
  inflammation: 'Inflammation',
  mobility: 'Mobility Issues',
  balance: 'Balance Problems',

  // Cardiovascular & Autonomic
  palpitations: 'Heart Palpitations',
  bradycardia: 'Bradycardia (slow heart rate)',
  arrhythmia: 'Heart Arrhythmia',
  orthostatic: 'Orthostatic Intolerance',
  dysautonomia: 'Dysautonomia',
  presyncope: 'Presyncope (near fainting)',
  blood_pooling: 'Blood Pooling',
  dizziness: 'Dizziness',
  fainting: 'Fainting',
  vertigo: 'Vertigo',
  high_blood_pressure: 'High Blood Pressure',
  low_blood_pressure: 'Low Blood Pressure',
  adrenaline_surge: 'Adrenaline Surge',

  // Gastrointestinal
  digestive: 'Digestive Issues',
  nausea: 'Nausea',
  vomiting: 'Vomiting',
  bloating: 'Bloating',
  gi_cramping: 'GI Cramping',
  constipation: 'Constipation',
  diarrhea: 'Diarrhea',
  ibs: 'IBS',
  reflux: 'Acid Reflux/GERD',
  gastroparesis: 'Gastroparesis',
  dysphagia: 'Difficulty Swallowing',
  food_intolerance: 'Food Intolerance',

  // Sleep
  insomnia: 'Insomnia',
  sleep_disturbance: 'Sleep Disturbance',
  unrefreshing_sleep: 'Unrefreshing Sleep',
  hypersomnia: 'Hypersomnia',

  // Neurological
  numbness_tingling: 'Numbness/Tingling',
  tremor: 'Tremor',
  twitching: 'Twitching',
  spasm: 'Muscle Spasm',
  internal_vibrations: 'Internal Vibrations',
  brain_zaps: 'Brain Zaps',
  tinnitus: 'Tinnitus (ringing in ears)',

  // Respiratory
  shortness_of_breath: 'Shortness of Breath',
  wheezing: 'Wheezing',
  cough: 'Cough',
  asthma_attack: 'Asthma Attack',
  chest_tightness: 'Chest Tightness',
  respiratory_infection: 'Respiratory Infection',

  // Mental Health & Mood
  low_mood: 'Low Mood',
  anxiety: 'Anxiety',
  panic: 'Panic Attack',
  stress: 'Stress',
  overwhelmed: 'Overwhelmed',
  irritability: 'Irritability',
  mood_swings: 'Mood Swings',
  mental_health: 'Mental Health',
  emotional_dysregulation: 'Emotional Dysregulation',
  racing_thoughts: 'Racing Thoughts',
  intrusive_thoughts: 'Intrusive Thoughts',
  rejection_sensitivity: 'Rejection Sensitivity',
  dissociation: 'Dissociation',
  depersonalization: 'Depersonalization',
  derealization: 'Derealization',
  suicidal_ideation: 'Suicidal Ideation',

  // Temperature
  temperature: 'Temperature Dysregulation',
  temperature_dysregulation: 'Temperature Dysregulation',
  sweating: 'Sweating',
  night_sweats: 'Night Sweats',
  chills: 'Chills',
  fever: 'Fever',
  heat_intolerance: 'Heat Intolerance',
  cold_intolerance: 'Cold Intolerance',
  flushing: 'Flushing',
  hot_flashes: 'Hot Flashes',

  // Sensory Sensitivity
  sensitivity_light: 'Light Sensitivity',
  light_sensitivity: 'Light Sensitivity',
  sensitivity_sound: 'Sound Sensitivity',
  sound_sensitivity: 'Sound Sensitivity',
  smell_sensitivity: 'Smell Sensitivity',
  sensory_overload: 'Sensory Overload',
  sound_distortion: 'Sound Distortion',

  // Appetite & Weight
  appetite: 'Appetite Changes',
  appetite_change: 'Appetite Changes',
  appetite_loss: 'Loss of Appetite',
  weight_change: 'Weight Changes',
  weight_gain: 'Weight Gain',
  weight_loss: 'Weight Loss',
  metabolic: 'Metabolic Issues',

  // Skin & Autoimmune
  rash: 'Rash',
  hives: 'Hives',
  itching: 'Itching',
  bruising: 'Bruising',
  easy_bruising: 'Easy Bruising',
  raynauds: "Raynaud's Phenomenon",
  photosensitivity: 'Sun Sensitivity',
  skin_sensitivity: 'Skin Sensitivity',
  lump: 'Lump/Swelling',
  hair_loss: 'Hair Loss',
  petechiae: 'Petechiae (tiny bruises)',
  slow_healing: 'Slow Wound Healing',

  // Vision & Eyes
  vision_changes: 'Vision Changes',
  visual_disturbances: 'Visual Disturbances',
  visual_snow: 'Visual Snow',
  aura: 'Migraine Aura',
  dry_eyes: 'Dry Eyes',
  sicca: 'Sicca (dry eyes/mouth)',

  // Hearing
  hearing_changes: 'Hearing Changes',

  // Mouth & Throat
  dry_mouth: 'Dry Mouth',
  mouth_ulcers: 'Mouth Ulcers',
  sore_throat: 'Sore Throat',

  // Urinary
  urinary_frequency: 'Frequent Urination',
  urinary_urgency: 'Urgent Urination',
  cystitis: 'Bladder Inflammation',

  // Lymphatic & Immune
  swollen_lymph_nodes: 'Swollen Lymph Nodes',
  frequent_infections: 'Frequent Infections',

  // Hormonal & Reproductive
  hormonal: 'Hormonal Issues',
  menstruation: 'Menstruation',
  menstrual_cramps: 'Menstrual Cramps',
  irregular_cycle: 'Irregular Cycle',
  missed_period: 'Missed Period',
  late_period: 'Late Period',
  heavy_bleeding: 'Heavy Bleeding',
  breast_tenderness: 'Breast Tenderness',

  // Other
  bleeding: 'Bleeding',
  flu_like: 'Flu-like Symptoms',

  // Smell & Taste
  anosmia: 'Loss of Smell',
  dysgeusia: 'Distorted Taste',
  parosmia: 'Distorted Smell',

  // Allergic & Immune
  mcas: 'Mast Cell Activation (MCAS)',
  allergic_reaction: 'Allergic Reaction',
  alcohol_intolerance: 'Alcohol Intolerance',
};

// ============================================================================
// Symptom Color System
// ============================================================================

/**
 * Symptom color category mapping
 * Maps symptom names to color category keys for theme-aware rendering.
 * Each category resolves to a foreground/background theme property at runtime.
 */
type SymptomColorCategory = 'pem' | 'fatigue' | 'brainfog' | 'pain' | 'teal' | 'coral' | 'lavender';

const SYMPTOM_COLOR_CATEGORY: Record<string, SymptomColorCategory> = {
  // PEM/Energy
  pem: 'pem', flare: 'pem', weakness: 'pem', burnout: 'pem', overexertion: 'pem',
  activity_intolerance: 'pem', exercise_intolerance: 'pem', delayed_recovery: 'pem', pacing_failure: 'pem',
  // Fatigue/General
  fatigue: 'fatigue', malaise: 'fatigue', flu_like: 'fatigue', bleeding: 'fatigue',
  // Cognitive & Mental Health
  brain_fog: 'brainfog', memory: 'brainfog', focus: 'brainfog',
  low_mood: 'brainfog', anxiety: 'brainfog', panic: 'brainfog', stress: 'brainfog',
  overwhelmed: 'brainfog', irritability: 'brainfog', mood_swings: 'brainfog',
  mental_health: 'brainfog', emotional_dysregulation: 'brainfog', racing_thoughts: 'brainfog',
  intrusive_thoughts: 'brainfog', rejection_sensitivity: 'brainfog', dissociation: 'brainfog',
  depersonalization: 'brainfog', derealization: 'brainfog', suicidal_ideation: 'brainfog',
  // Pain, Mobility & Sensory
  pain: 'pain', headache: 'pain', muscle_pain: 'pain', joint_pain: 'pain',
  back_pain: 'pain', neck_pain: 'pain', chest_pain: 'pain', gi_pain: 'pain',
  skin_pain: 'pain', nerve_pain: 'pain', allodynia: 'pain', coat_hanger_pain: 'pain',
  subluxation: 'pain', dislocation: 'pain', hypermobility: 'pain', joint_instability: 'pain',
  stiffness: 'pain', swelling: 'pain', inflammation: 'pain', mobility: 'pain', balance: 'pain',
  sensitivity_light: 'pain', light_sensitivity: 'pain', sensitivity_sound: 'pain',
  sound_sensitivity: 'pain', smell_sensitivity: 'pain', sensory_overload: 'pain', sound_distortion: 'pain',
  // Cardiovascular, Respiratory, Temperature, Urinary, Lymphatic
  palpitations: 'teal', bradycardia: 'teal', arrhythmia: 'teal', orthostatic: 'teal',
  dysautonomia: 'teal', presyncope: 'teal', blood_pooling: 'teal', dizziness: 'teal',
  fainting: 'teal', vertigo: 'teal', high_blood_pressure: 'teal', low_blood_pressure: 'teal',
  adrenaline_surge: 'teal', shortness_of_breath: 'teal', wheezing: 'teal', cough: 'teal',
  asthma_attack: 'teal', chest_tightness: 'teal', respiratory_infection: 'teal',
  temperature: 'teal', temperature_dysregulation: 'teal', sweating: 'teal', night_sweats: 'teal',
  chills: 'teal', fever: 'teal', heat_intolerance: 'teal', cold_intolerance: 'teal',
  flushing: 'teal', hot_flashes: 'teal', urinary_frequency: 'teal', urinary_urgency: 'teal',
  cystitis: 'teal', swollen_lymph_nodes: 'teal', frequent_infections: 'teal',
  // Digestive, Skin, Weight, Hormonal, Allergic
  digestive: 'coral', nausea: 'coral', vomiting: 'coral', bloating: 'coral',
  gi_cramping: 'coral', constipation: 'coral', diarrhea: 'coral', ibs: 'coral',
  reflux: 'coral', gastroparesis: 'coral', dysphagia: 'coral', food_intolerance: 'coral',
  appetite: 'coral', appetite_change: 'coral', appetite_loss: 'coral',
  weight_change: 'coral', weight_gain: 'coral', weight_loss: 'coral', metabolic: 'coral',
  rash: 'coral', hives: 'coral', itching: 'coral', bruising: 'coral', easy_bruising: 'coral',
  raynauds: 'coral', photosensitivity: 'coral', skin_sensitivity: 'coral', lump: 'coral',
  hair_loss: 'coral', petechiae: 'coral', slow_healing: 'coral',
  dry_mouth: 'coral', mouth_ulcers: 'coral', sore_throat: 'coral',
  hormonal: 'coral', menstruation: 'coral', menstrual_cramps: 'coral', irregular_cycle: 'coral',
  missed_period: 'coral', late_period: 'coral', heavy_bleeding: 'coral', breast_tenderness: 'coral',
  mcas: 'coral', allergic_reaction: 'coral', alcohol_intolerance: 'coral',
  // Sleep, Neurological, Vision, Hearing, Smell/Taste
  insomnia: 'lavender', sleep_disturbance: 'lavender', unrefreshing_sleep: 'lavender', hypersomnia: 'lavender',
  numbness_tingling: 'lavender', tremor: 'lavender', twitching: 'lavender', spasm: 'lavender',
  internal_vibrations: 'lavender', brain_zaps: 'lavender', tinnitus: 'lavender',
  vision_changes: 'lavender', visual_disturbances: 'lavender', visual_snow: 'lavender',
  aura: 'lavender', dry_eyes: 'lavender', sicca: 'lavender', hearing_changes: 'lavender',
  anosmia: 'lavender', dysgeusia: 'lavender', parosmia: 'lavender',
};

/** Maps color category to theme foreground property key */
const CATEGORY_FG_KEY: Record<SymptomColorCategory, keyof typeof darkTheme> = {
  pem: 'symptomPem', fatigue: 'symptomFatigue', brainfog: 'symptomBrainfog',
  pain: 'symptomPain', teal: 'symptomTeal', coral: 'symptomCoral', lavender: 'symptomLavender',
};

/** Maps color category to theme background property key */
const CATEGORY_BG_KEY: Record<SymptomColorCategory, keyof typeof darkTheme> = {
  pem: 'symptomPemLight', fatigue: 'symptomFatigueLight', brainfog: 'symptomBrainfogLight',
  pain: 'symptomPainLight', teal: 'symptomTealLight', coral: 'symptomCoralLight', lavender: 'symptomLavenderLight',
};

/**
 * Severity level colors per RantTrack UI Design System
 */
export const SEVERITY_COLORS: Record<Severity, string> = {
  mild: colors.severityGood,
  moderate: colors.severityModerate,
  severe: colors.severityRough,
};

/**
 * Get symptom category color (theme-aware)
 * @param symptom - The symptom key
 * @param themeColors - Optional theme colors object for dynamic theming
 */
export function getSymptomColor(symptom: string, themeColors?: typeof darkTheme): string {
  const theme = themeColors || colors;
  const category = SYMPTOM_COLOR_CATEGORY[symptom];
  if (!category) return theme.accentPrimary;
  return theme[CATEGORY_FG_KEY[category]];
}

/**
 * Get symptom background color (theme-aware)
 * @param symptom - The symptom key
 * @param themeColors - Optional theme colors object for dynamic theming
 */
export function getSymptomBackgroundColor(symptom: string, themeColors?: typeof darkTheme): string {
  const theme = themeColors || colors;
  const category = SYMPTOM_COLOR_CATEGORY[symptom];
  if (!category) return theme.accentLight;
  return theme[CATEGORY_BG_KEY[category]];
}

/**
 * Get severity color for text/icons
 * @param severity - The severity level (mild, moderate, severe)
 * @param themeColors - Optional theme colors object for dynamic theming
 */
export function getSeverityColor(severity: Severity | null | undefined, themeColors?: typeof darkTheme): string {
  const theme = themeColors || colors;
  if (!severity) return theme.textSecondary;

  switch (severity) {
    case 'mild':
      return theme.severityGood;
    case 'moderate':
      return theme.severityModerate;
    case 'severe':
      return theme.severityRough;
    default:
      return theme.textSecondary;
  }
}

/**
 * Apply an opacity to a hex color, returning an rgba() string.
 * Safe regardless of hex format (#RGB, #RRGGBB, #RRGGBBAA).
 * @param hex - Hex color string (e.g. '#FF0000')
 * @param opacity - Opacity from 0 to 1
 */
export function withOpacity(hex: string, opacity: number): string {
  const cleaned = hex.replace('#', '');
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get severity background color (with transparency)
 * @param severity - The severity level (mild, moderate, severe)
 * @param themeColors - Optional theme colors object for dynamic theming
 */
export function getSeverityBackgroundColor(severity: Severity | null | undefined, themeColors?: typeof darkTheme): string {
  const theme = themeColors || colors;
  if (!severity) return theme.severityNone;

  switch (severity) {
    case 'mild':
      return withOpacity(theme.severityGood, 0.12);
    case 'moderate':
      return withOpacity(theme.severityModerate, 0.15);
    case 'severe':
      return withOpacity(theme.severityRough, 0.19);
    default:
      return theme.severityNone;
  }
}
