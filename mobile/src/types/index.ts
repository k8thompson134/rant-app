/**
 * Type definitions for RantTrack mobile app
 */

import { darkTheme } from '../theme/colors';

// Use darkTheme directly to avoid bundling issues
const colors = darkTheme;

export type Severity = 'mild' | 'moderate' | 'severe';

export interface PainDetails {
  qualifiers: string[];  // e.g., ["burning", "sharp"]
  location: string | null;  // e.g., "shoulder", "calf"
}

export interface ActivityTrigger {
  activity: string;  // e.g., "walking", "standing", "showering"
  timeframe?: string;  // e.g., "after", "during", "from"
}

export interface SpoonCount {
  current: number;  // Current spoons mentioned (e.g., "I have 2 spoons")
  used?: number;  // Spoons used (e.g., "used 3 spoons")
  started?: number;  // Starting spoons (e.g., "started with 5")
  energyLevel: number;  // Normalized 0-10 scale
}

export interface SymptomDuration {
  value?: number;  // Numeric duration (e.g., 3 for "3 hours")
  unit?: 'minutes' | 'hours' | 'days' | 'weeks';  // Time unit
  qualifier?: 'all' | 'half' | 'most_of';  // "all day", "half the night"
  since?: string;  // Reference point (e.g., "Tuesday", "yesterday")
  ongoing?: boolean;  // "still have", "won't go away"
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'all_day';

export interface ExtractedSymptom {
  symptom: string;
  matched: string;
  method: 'phrase' | 'lemma' | 'quick_checkin';
  pos?: string;
  severity?: Severity | null;
  id?: string;
  painDetails?: PainDetails;  // For pain symptoms with qualifiers/location
  trigger?: ActivityTrigger;  // Activity that triggered this symptom
  confidence?: number;  // 0-1 confidence score for extraction accuracy
  duration?: SymptomDuration;  // How long the symptom lasted
  timeOfDay?: TimeOfDay;  // When the symptom occurred
}

export interface EditableSymptom extends ExtractedSymptom {
  id: string; // Required for editing UI
}

export interface ExtractionResult {
  text: string;
  symptoms: ExtractedSymptom[];
  spoonCount?: SpoonCount;  // Spoon theory energy tracking
}

export interface RantEntry {
  id: string;
  text: string;
  timestamp: number;
  symptoms: ExtractedSymptom[];
}

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

/**
 * Symptom category colors per RantTrack UI Design System
 * Maps symptom categories to their semantic colors
 */
export const SYMPTOM_CATEGORY_COLORS: Record<string, string> = {
  // PEM/Energy - Orange/Amber
  pem: colors.symptomPem,
  flare: colors.symptomPem,
  weakness: colors.symptomPem,
  burnout: colors.symptomPem,
  overexertion: colors.symptomPem,
  activity_intolerance: colors.symptomPem,
  exercise_intolerance: colors.symptomPem,
  delayed_recovery: colors.symptomPem,
  pacing_failure: colors.symptomPem,

  // Fatigue/General - Muted/Gray
  fatigue: colors.symptomFatigue,
  malaise: colors.symptomFatigue,
  flu_like: colors.symptomFatigue,

  // Cognitive - Purple/Indigo
  brain_fog: colors.symptomBrainfog,
  memory: colors.symptomBrainfog,
  focus: colors.symptomBrainfog,

  // Pain - Red/Pink
  pain: colors.symptomPain,
  headache: colors.symptomPain,
  muscle_pain: colors.symptomPain,
  joint_pain: colors.symptomPain,
  back_pain: colors.symptomPain,
  neck_pain: colors.symptomPain,
  chest_pain: colors.symptomPain,
  gi_pain: colors.symptomPain,
  skin_pain: colors.symptomPain,
  nerve_pain: colors.symptomPain,
  allodynia: colors.symptomPain,
  coat_hanger_pain: colors.symptomPain,

  // Joint & Mobility - Pain color
  subluxation: colors.symptomPain,
  dislocation: colors.symptomPain,
  hypermobility: colors.symptomPain,
  joint_instability: colors.symptomPain,
  stiffness: colors.symptomPain,
  swelling: colors.symptomPain,
  inflammation: colors.symptomPain,
  mobility: colors.symptomPain,
  balance: colors.symptomPain,

  // Cardiovascular & Autonomic - Teal/Cyan
  palpitations: colors.symptomTeal,
  bradycardia: colors.symptomTeal,
  arrhythmia: colors.symptomTeal,
  orthostatic: colors.symptomTeal,
  dysautonomia: colors.symptomTeal,
  presyncope: colors.symptomTeal,
  blood_pooling: colors.symptomTeal,
  dizziness: colors.symptomTeal,
  fainting: colors.symptomTeal,
  vertigo: colors.symptomTeal,
  high_blood_pressure: colors.symptomTeal,
  low_blood_pressure: colors.symptomTeal,
  adrenaline_surge: colors.symptomTeal,

  // Digestive - Coral/Peach
  digestive: colors.symptomCoral,
  nausea: colors.symptomCoral,
  vomiting: colors.symptomCoral,
  bloating: colors.symptomCoral,
  gi_cramping: colors.symptomCoral,
  constipation: colors.symptomCoral,
  diarrhea: colors.symptomCoral,
  ibs: colors.symptomCoral,
  reflux: colors.symptomCoral,
  gastroparesis: colors.symptomCoral,
  dysphagia: colors.symptomCoral,
  food_intolerance: colors.symptomCoral,
  appetite: colors.symptomCoral,
  appetite_change: colors.symptomCoral,
  appetite_loss: colors.symptomCoral,

  // Sleep - Lavender
  insomnia: colors.symptomLavender,
  sleep_disturbance: colors.symptomLavender,
  unrefreshing_sleep: colors.symptomLavender,
  hypersomnia: colors.symptomLavender,

  // Neurological - Lavender
  numbness_tingling: colors.symptomLavender,
  tremor: colors.symptomLavender,
  twitching: colors.symptomLavender,
  spasm: colors.symptomLavender,
  internal_vibrations: colors.symptomLavender,
  brain_zaps: colors.symptomLavender,
  tinnitus: colors.symptomLavender,

  // Respiratory - Teal
  shortness_of_breath: colors.symptomTeal,
  wheezing: colors.symptomTeal,
  cough: colors.symptomTeal,
  asthma_attack: colors.symptomTeal,
  chest_tightness: colors.symptomTeal,
  respiratory_infection: colors.symptomTeal,

  // Mental Health & Mood - Brain Fog color
  low_mood: colors.symptomBrainfog,
  anxiety: colors.symptomBrainfog,
  panic: colors.symptomBrainfog,
  stress: colors.symptomBrainfog,
  overwhelmed: colors.symptomBrainfog,
  irritability: colors.symptomBrainfog,
  mood_swings: colors.symptomBrainfog,
  mental_health: colors.symptomBrainfog,
  emotional_dysregulation: colors.symptomBrainfog,
  racing_thoughts: colors.symptomBrainfog,
  intrusive_thoughts: colors.symptomBrainfog,
  rejection_sensitivity: colors.symptomBrainfog,
  dissociation: colors.symptomBrainfog,
  depersonalization: colors.symptomBrainfog,
  derealization: colors.symptomBrainfog,
  suicidal_ideation: colors.symptomBrainfog,

  // Temperature - Teal
  temperature: colors.symptomTeal,
  temperature_dysregulation: colors.symptomTeal,
  sweating: colors.symptomTeal,
  night_sweats: colors.symptomTeal,
  chills: colors.symptomTeal,
  fever: colors.symptomTeal,
  heat_intolerance: colors.symptomTeal,
  cold_intolerance: colors.symptomTeal,
  flushing: colors.symptomTeal,
  hot_flashes: colors.symptomTeal,

  // Sensory Sensitivity - Pain color
  sensitivity_light: colors.symptomPain,
  light_sensitivity: colors.symptomPain,
  sensitivity_sound: colors.symptomPain,
  sound_sensitivity: colors.symptomPain,
  smell_sensitivity: colors.symptomPain,
  sensory_overload: colors.symptomPain,
  sound_distortion: colors.symptomPain,

  // Appetite & Weight - Coral
  weight_change: colors.symptomCoral,
  weight_gain: colors.symptomCoral,
  weight_loss: colors.symptomCoral,
  metabolic: colors.symptomCoral,

  // Skin & Autoimmune - Coral
  rash: colors.symptomCoral,
  hives: colors.symptomCoral,
  itching: colors.symptomCoral,
  bruising: colors.symptomCoral,
  easy_bruising: colors.symptomCoral,
  raynauds: colors.symptomCoral,
  photosensitivity: colors.symptomCoral,
  skin_sensitivity: colors.symptomCoral,
  lump: colors.symptomCoral,
  hair_loss: colors.symptomCoral,
  petechiae: colors.symptomCoral,
  slow_healing: colors.symptomCoral,

  // Vision & Eyes - Lavender
  vision_changes: colors.symptomLavender,
  visual_disturbances: colors.symptomLavender,
  visual_snow: colors.symptomLavender,
  aura: colors.symptomLavender,
  dry_eyes: colors.symptomLavender,
  sicca: colors.symptomLavender,

  // Hearing - Lavender
  hearing_changes: colors.symptomLavender,

  // Mouth & Throat - Coral
  dry_mouth: colors.symptomCoral,
  mouth_ulcers: colors.symptomCoral,
  sore_throat: colors.symptomCoral,

  // Urinary - Teal
  urinary_frequency: colors.symptomTeal,
  urinary_urgency: colors.symptomTeal,
  cystitis: colors.symptomTeal,

  // Lymphatic & Immune - Teal
  swollen_lymph_nodes: colors.symptomTeal,
  frequent_infections: colors.symptomTeal,

  // Hormonal & Reproductive - Coral
  hormonal: colors.symptomCoral,
  menstruation: colors.symptomCoral,
  menstrual_cramps: colors.symptomCoral,
  irregular_cycle: colors.symptomCoral,
  missed_period: colors.symptomCoral,
  late_period: colors.symptomCoral,
  heavy_bleeding: colors.symptomCoral,
  breast_tenderness: colors.symptomCoral,

  // Other - Fatigue color
  bleeding: colors.symptomFatigue,

  // Smell & Taste - Lavender
  anosmia: colors.symptomLavender,
  dysgeusia: colors.symptomLavender,
  parosmia: colors.symptomLavender,

  // Allergic & Immune - Coral
  mcas: colors.symptomCoral,
  allergic_reaction: colors.symptomCoral,
  alcohol_intolerance: colors.symptomCoral,

  // Default
  default: colors.accentPrimary,
};

/**
 * Symptom background colors (light variants)
 */
export const SYMPTOM_BACKGROUND_COLORS: Record<string, string> = {
  // PEM/Energy - Orange/Amber Light
  pem: colors.symptomPemLight,
  flare: colors.symptomPemLight,
  weakness: colors.symptomPemLight,
  burnout: colors.symptomPemLight,
  overexertion: colors.symptomPemLight,
  activity_intolerance: colors.symptomPemLight,
  exercise_intolerance: colors.symptomPemLight,
  delayed_recovery: colors.symptomPemLight,
  pacing_failure: colors.symptomPemLight,

  // Fatigue/General - Muted/Gray Light
  fatigue: colors.symptomFatigueLight,
  malaise: colors.symptomFatigueLight,
  flu_like: colors.symptomFatigueLight,

  // Cognitive - Purple/Indigo Light
  brain_fog: colors.symptomBrainfogLight,
  memory: colors.symptomBrainfogLight,
  focus: colors.symptomBrainfogLight,

  // Pain - Red/Pink Light
  pain: colors.symptomPainLight,
  headache: colors.symptomPainLight,
  muscle_pain: colors.symptomPainLight,
  joint_pain: colors.symptomPainLight,
  back_pain: colors.symptomPainLight,
  neck_pain: colors.symptomPainLight,
  chest_pain: colors.symptomPainLight,
  gi_pain: colors.symptomPainLight,
  skin_pain: colors.symptomPainLight,
  nerve_pain: colors.symptomPainLight,
  allodynia: colors.symptomPainLight,
  coat_hanger_pain: colors.symptomPainLight,

  // Joint & Mobility - Pain Light
  subluxation: colors.symptomPainLight,
  dislocation: colors.symptomPainLight,
  hypermobility: colors.symptomPainLight,
  joint_instability: colors.symptomPainLight,
  stiffness: colors.symptomPainLight,
  swelling: colors.symptomPainLight,
  inflammation: colors.symptomPainLight,
  mobility: colors.symptomPainLight,
  balance: colors.symptomPainLight,

  // Cardiovascular & Autonomic - Teal Light
  palpitations: colors.symptomTealLight,
  bradycardia: colors.symptomTealLight,
  arrhythmia: colors.symptomTealLight,
  orthostatic: colors.symptomTealLight,
  dysautonomia: colors.symptomTealLight,
  presyncope: colors.symptomTealLight,
  blood_pooling: colors.symptomTealLight,
  dizziness: colors.symptomTealLight,
  fainting: colors.symptomTealLight,
  vertigo: colors.symptomTealLight,
  high_blood_pressure: colors.symptomTealLight,
  low_blood_pressure: colors.symptomTealLight,
  adrenaline_surge: colors.symptomTealLight,

  // Digestive - Coral Light
  digestive: colors.symptomCoralLight,
  nausea: colors.symptomCoralLight,
  vomiting: colors.symptomCoralLight,
  bloating: colors.symptomCoralLight,
  gi_cramping: colors.symptomCoralLight,
  constipation: colors.symptomCoralLight,
  diarrhea: colors.symptomCoralLight,
  ibs: colors.symptomCoralLight,
  reflux: colors.symptomCoralLight,
  gastroparesis: colors.symptomCoralLight,
  dysphagia: colors.symptomCoralLight,
  food_intolerance: colors.symptomCoralLight,
  appetite: colors.symptomCoralLight,
  appetite_change: colors.symptomCoralLight,
  appetite_loss: colors.symptomCoralLight,

  // Sleep - Lavender Light
  insomnia: colors.symptomLavenderLight,
  sleep_disturbance: colors.symptomLavenderLight,
  unrefreshing_sleep: colors.symptomLavenderLight,
  hypersomnia: colors.symptomLavenderLight,

  // Neurological - Lavender Light
  numbness_tingling: colors.symptomLavenderLight,
  tremor: colors.symptomLavenderLight,
  twitching: colors.symptomLavenderLight,
  spasm: colors.symptomLavenderLight,
  internal_vibrations: colors.symptomLavenderLight,
  brain_zaps: colors.symptomLavenderLight,
  tinnitus: colors.symptomLavenderLight,

  // Respiratory - Teal Light
  shortness_of_breath: colors.symptomTealLight,
  wheezing: colors.symptomTealLight,
  cough: colors.symptomTealLight,
  asthma_attack: colors.symptomTealLight,
  chest_tightness: colors.symptomTealLight,
  respiratory_infection: colors.symptomTealLight,

  // Mental Health & Mood - Brain Fog Light
  low_mood: colors.symptomBrainfogLight,
  anxiety: colors.symptomBrainfogLight,
  panic: colors.symptomBrainfogLight,
  stress: colors.symptomBrainfogLight,
  overwhelmed: colors.symptomBrainfogLight,
  irritability: colors.symptomBrainfogLight,
  mood_swings: colors.symptomBrainfogLight,
  mental_health: colors.symptomBrainfogLight,
  emotional_dysregulation: colors.symptomBrainfogLight,
  racing_thoughts: colors.symptomBrainfogLight,
  intrusive_thoughts: colors.symptomBrainfogLight,
  rejection_sensitivity: colors.symptomBrainfogLight,
  dissociation: colors.symptomBrainfogLight,
  depersonalization: colors.symptomBrainfogLight,
  derealization: colors.symptomBrainfogLight,
  suicidal_ideation: colors.symptomBrainfogLight,

  // Temperature - Teal Light
  temperature: colors.symptomTealLight,
  temperature_dysregulation: colors.symptomTealLight,
  sweating: colors.symptomTealLight,
  night_sweats: colors.symptomTealLight,
  chills: colors.symptomTealLight,
  fever: colors.symptomTealLight,
  heat_intolerance: colors.symptomTealLight,
  cold_intolerance: colors.symptomTealLight,
  flushing: colors.symptomTealLight,
  hot_flashes: colors.symptomTealLight,

  // Sensory Sensitivity - Pain Light
  sensitivity_light: colors.symptomPainLight,
  light_sensitivity: colors.symptomPainLight,
  sensitivity_sound: colors.symptomPainLight,
  sound_sensitivity: colors.symptomPainLight,
  smell_sensitivity: colors.symptomPainLight,
  sensory_overload: colors.symptomPainLight,
  sound_distortion: colors.symptomPainLight,

  // Appetite & Weight - Coral Light
  weight_change: colors.symptomCoralLight,
  weight_gain: colors.symptomCoralLight,
  weight_loss: colors.symptomCoralLight,
  metabolic: colors.symptomCoralLight,

  // Skin & Autoimmune - Coral Light
  rash: colors.symptomCoralLight,
  hives: colors.symptomCoralLight,
  itching: colors.symptomCoralLight,
  bruising: colors.symptomCoralLight,
  easy_bruising: colors.symptomCoralLight,
  raynauds: colors.symptomCoralLight,
  photosensitivity: colors.symptomCoralLight,
  skin_sensitivity: colors.symptomCoralLight,
  lump: colors.symptomCoralLight,
  hair_loss: colors.symptomCoralLight,
  petechiae: colors.symptomCoralLight,
  slow_healing: colors.symptomCoralLight,

  // Vision & Eyes - Lavender Light
  vision_changes: colors.symptomLavenderLight,
  visual_disturbances: colors.symptomLavenderLight,
  visual_snow: colors.symptomLavenderLight,
  aura: colors.symptomLavenderLight,
  dry_eyes: colors.symptomLavenderLight,
  sicca: colors.symptomLavenderLight,

  // Hearing - Lavender Light
  hearing_changes: colors.symptomLavenderLight,

  // Mouth & Throat - Coral Light
  dry_mouth: colors.symptomCoralLight,
  mouth_ulcers: colors.symptomCoralLight,
  sore_throat: colors.symptomCoralLight,

  // Urinary - Teal Light
  urinary_frequency: colors.symptomTealLight,
  urinary_urgency: colors.symptomTealLight,
  cystitis: colors.symptomTealLight,

  // Lymphatic & Immune - Teal Light
  swollen_lymph_nodes: colors.symptomTealLight,
  frequent_infections: colors.symptomTealLight,

  // Hormonal & Reproductive - Coral Light
  hormonal: colors.symptomCoralLight,
  menstruation: colors.symptomCoralLight,
  menstrual_cramps: colors.symptomCoralLight,
  irregular_cycle: colors.symptomCoralLight,
  missed_period: colors.symptomCoralLight,
  late_period: colors.symptomCoralLight,
  heavy_bleeding: colors.symptomCoralLight,
  breast_tenderness: colors.symptomCoralLight,

  // Other - Fatigue Light
  bleeding: colors.symptomFatigueLight,

  // Smell & Taste - Lavender Light
  anosmia: colors.symptomLavenderLight,
  dysgeusia: colors.symptomLavenderLight,
  parosmia: colors.symptomLavenderLight,

  // Allergic & Immune - Coral Light
  mcas: colors.symptomCoralLight,
  allergic_reaction: colors.symptomCoralLight,
  alcohol_intolerance: colors.symptomCoralLight,

  // Default
  default: colors.accentLight,
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
 * Get symptom category color
 */
export function getSymptomColor(symptom: string): string {
  return SYMPTOM_CATEGORY_COLORS[symptom] || SYMPTOM_CATEGORY_COLORS.default;
}

/**
 * Get symptom background color with opacity per design system
 */
export function getSymptomBackgroundColor(symptom: string): string {
  return SYMPTOM_BACKGROUND_COLORS[symptom] || SYMPTOM_BACKGROUND_COLORS.default;
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
 * Get severity background color (with transparency)
 * @param severity - The severity level (mild, moderate, severe)
 * @param themeColors - Optional theme colors object for dynamic theming
 */
export function getSeverityBackgroundColor(severity: Severity | null | undefined, themeColors?: typeof darkTheme): string {
  const theme = themeColors || colors;
  if (!severity) return theme.severityNone;

  switch (severity) {
    case 'mild':
      return theme.severityGood + '20'; // 12% opacity
    case 'moderate':
      return theme.severityModerate + '25'; // 15% opacity
    case 'severe':
      return theme.severityRough + '30'; // 19% opacity
    default:
      return theme.severityNone;
  }
}

/**
 * Format activity trigger for display
 * @returns Readable string like "after walking" or "during standing", empty if no trigger
 */
export function formatActivityTrigger(trigger?: ActivityTrigger): string {
  if (!trigger?.activity) return '';

  const timeframe = trigger.timeframe || 'after';
  return `${timeframe} ${trigger.activity}`;
}

/**
 * Format symptom duration for display
 * @returns Readable string like "for 3 hours", "all day", "since Tuesday", empty if no duration
 */
export function formatSymptomDuration(duration?: SymptomDuration): string {
  if (!duration) return '';

  // Handle ongoing (highest priority)
  if (duration.ongoing) return 'ongoing';

  // Handle "since" reference points
  if (duration.since) return `since ${duration.since}`;

  // Handle qualifiers like "all day", "half the night"
  if (duration.qualifier && duration.unit) {
    const timeLabel = duration.unit === 'days' ? 'day' : duration.unit.slice(0, -1); // "days" -> "day"

    if (duration.qualifier === 'all') {
      return `all ${timeLabel}`;
    } else if (duration.qualifier === 'half') {
      return `half the ${timeLabel}`;
    } else if (duration.qualifier === 'most_of') {
      return `most of the ${timeLabel}`;
    }
  }

  // Handle specific value + unit
  if (duration.value !== undefined && duration.unit) {
    const unit = duration.value === 1 ? duration.unit.slice(0, -1) : duration.unit; // "hours" -> "hour" if value is 1
    return `for ${duration.value} ${unit}`;
  }

  return '';
}

/**
 * Format time of day for display
 * @returns Readable string like "morning", "all day", empty if no timeOfDay
 */
export function formatTimeOfDay(timeOfDay?: TimeOfDay): string {
  if (!timeOfDay) return '';

  // Convert snake_case to readable text
  return timeOfDay.replace('_', ' ');
}

/**
 * Format spoon count for display
 * @returns Readable string like "2 spoons (4/10 energy)" or "out of spoons (0/10)", empty if no spoons
 */
export function formatSpoonCount(spoons?: SpoonCount): string {
  if (!spoons) return '';

  // Handle "out of spoons" case (0 current)
  if (spoons.current === 0) {
    return `out of spoons (${spoons.energyLevel}/10 energy)`;
  }

  // Handle single spoon vs multiple spoons
  const spoonLabel = spoons.current === 1 ? 'spoon' : 'spoons';

  // Include started/used context if available
  if (spoons.started !== undefined && spoons.used !== undefined) {
    return `${spoons.current} ${spoonLabel} (started with ${spoons.started}, used ${spoons.used})`;
  } else if (spoons.started !== undefined) {
    return `${spoons.current} ${spoonLabel} (started with ${spoons.started})`;
  } else if (spoons.used !== undefined) {
    return `${spoons.current} ${spoonLabel} (used ${spoons.used})`;
  }

  // Basic format with energy level
  return `${spoons.current} ${spoonLabel} (${spoons.energyLevel}/10 energy)`;
}
