import { extractSymptoms } from './extractor';
import { BODY_PARTS, JOINT_LOCATIONS, MUSCLE_LOCATIONS } from './dictionaries/symptoms/pain';
import { ExtractedSymptom, ExtractionResult } from '../types';

const METRIC_LEMMAS: Record<string, string> = {
  'moderate energy': 'energy_level', 'low energy': 'energy_level', 'good energy': 'energy_level',
  'decent energy': 'energy_level', 'some energy': 'energy_level',
  'no energy': 'fatigue', 'zero energy': 'fatigue', 'little energy': 'fatigue',
  'feeling sad': 'mood_low', 'feeling happy': 'mood_high', 'feeling anxious': 'mood_anxious',
  'feeling okay': 'mood_neutral',
  'very stressed': 'stress_high', 'not stressed': 'stress_low',
};

const INVALID_SYMPTOMS = new Set(['mild', 'moderate', 'severe', 'intense', 'bad', 'general']);
const INVALID_LOCATIONS = new Set(['bottom_of_foot', 'general', 'entire_body', 'whole_body']);
const HEAD_LOCATIONS = new Set(['head', 'temple', 'forehead', 'migraine']);

const LOCATION_FREE = new Set([
  'fever', 'fatigue', 'malaise', 'nausea', 'vomiting', 'dizziness', 'vertigo', 'brain_fog',
  'insomnia', 'hypersomnolence', 'hypersomnia', 'anxiety', 'panic', 'depression', 'overwhelm',
  'overwhelmed', 'dissociation', 'stress', 'sweating', 'chills', 'appetite_change', 'appetite_loss',
  'racing_thoughts', 'memory_issues', 'concentration_issues', 'emotional_numbing', 'mood_low',
  'mood_high', 'mood_anxious', 'mood_neutral', 'sensory_overload', 'sensory_load',
  'light_sensitivity', 'sound_sensitivity', 'tactile_sensitivity', 'hypersensitivity',
  'cognitive_dysfunction', 'executive_dysfunction', 'temperature_dysregulation',
  'post_exertional_malaise', 'pem', 'pem_crash', 'sleep_disorder', 'tachycardia', 'palpitations',
  'arrhythmia', 'syncope', 'presyncope', 'orthostatic_intolerance', 'oi', 'vasovagal_syncope',
  'mast_cell_activation', 'mcas', 'histamine_intolerance', 'dysautonomia', 'pots', 'long_covid',
  'me_cfs', 'chronic_fatigue', 'energy_level', 'low_energy',
]);

const LOCATIONS: Record<string, string> = { ...JOINT_LOCATIONS, ...MUSCLE_LOCATIONS, ...BODY_PARTS };
const LOCATION_KEYS = Object.keys(LOCATIONS);

const norm = (s: string) => s.replace(/[-_]/g, ' ').trim();

function withinOneEdit(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
  return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
}

function findNearbyLocation(matched: string, text: string): string | null {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(matched.toLowerCase());
  if (idx === -1) return null;
  const context = lower.slice(Math.max(0, idx - 90), Math.min(lower.length, idx + matched.length + 120));
  const words = context.trim().split(/\W+/).filter(Boolean).slice(0, 20);

  for (let len = 4; len >= 1; len--) {
    for (let i = 0; i <= words.length - len; i++) {
      const phrase = words.slice(i, i + len).join(' ');
      if (LOCATIONS[phrase]) return LOCATIONS[phrase];
      const p = norm(phrase);
      if (p.length < 4) continue;
      for (const key of LOCATION_KEYS) {
        const k = norm(key);
        if (k.length < 4 || k[0] !== p[0]) continue;
        if (withinOneEdit(k, p)) return LOCATIONS[key];
      }
    }
  }
  return null;
}

function refine(symptoms: ExtractedSymptom[], text: string): ExtractedSymptom[] {
  const cleaned: ExtractedSymptom[] = [];
  for (const raw of symptoms) {
    const name = raw.symptom.toLowerCase().trim();
    if (!name || INVALID_SYMPTOMS.has(name)) continue;
    const s: ExtractedSymptom = { ...raw, painDetails: raw.painDetails ? { ...raw.painDetails } : undefined };

    if (LOCATION_FREE.has(name)) {
      if (s.painDetails) s.painDetails.location = null;
    } else {
      const loc = s.painDetails?.location;
      if (loc && INVALID_LOCATIONS.has(loc.toLowerCase())) s.painDetails!.location = null;
      if (!s.painDetails?.location && s.matched) {
        const found = findNearbyLocation(s.matched, text);
        if (found) s.painDetails = { ...(s.painDetails ?? { qualifiers: [] }), location: found };
      }
      if (name === 'headache' && s.painDetails?.location && !HEAD_LOCATIONS.has(s.painDetails.location.toLowerCase())) {
        s.painDetails.location = null;
      }
    }
    cleaned.push(s);
  }

  const withoutSubsumed = cleaned.filter((s) => {
    const m = s.matched?.toLowerCase();
    if (!m) return true;
    return !cleaned.some((o) => {
      const om = o.matched?.toLowerCase();
      return o !== s && o.symptom !== s.symptom && om && om.length > m.length && new RegExp(`\\b${m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(om);
    });
  });

  const specificLocations = new Set(
    withoutSubsumed.filter((s) => s.symptom !== 'pain').map((s) => s.painDetails?.location).filter(Boolean)
  );
  return withoutSubsumed.filter((s) => s.symptom !== 'pain' || !s.painDetails?.location || !specificLocations.has(s.painDetails.location));
}

export interface HealthMetrics {
  mood?: number;
  energy?: number;
  stress?: number;
  capacity?: number;
  medication?: 'taken' | 'skipped';
}

export function extractHealthMetrics(text: string): HealthMetrics {
  const metrics: HealthMetrics = {};
  for (const key of ['mood', 'energy', 'stress', 'capacity'] as const) {
    const m = text.match(new RegExp(`${key}(?:\\s+level)?[:\\s]+(\\d+)`, 'i'));
    if (m) metrics[key] = parseInt(m[1], 10);
  }
  if (/took\s+(?:my\s+)?(?:meds?|medication)/i.test(text)) metrics.medication = 'taken';
  else if (/(?:skipped|forgot)\s+(?:my\s+)?(?:meds?|medication)/i.test(text)) metrics.medication = 'skipped';
  return metrics;
}

const ACTIVITY_SIGNALS = [
  'walked', 'went to', 'drove', 'cooked', 'cleaned', 'showered', 'grocery', 'errand', 'appointment',
  'stood', 'carried', 'climbed', 'gym', 'exercise', 'physical therapy', 'laundry', 'dishes',
  'studied', 'reading', 'worked', 'meeting', 'phone call', 'zoom', 'wrote', 'researched',
  'concentrated', 'focused', 'visited', 'dinner', 'party', 'event', 'conflict', 'argument',
  'emotional conversation', 'stressful',
];

export interface ActivityDetected {
  signals: string[];
  intensity: 'low' | 'medium' | 'high' | null;
}

export function detectActivities(text: string): ActivityDetected {
  const lower = text.toLowerCase();
  const signals = ACTIVITY_SIGNALS.filter((s) => lower.includes(s));
  if (!signals.length) return { signals, intensity: null };
  if (signals.length >= 3 || /long|all day|hours|exhausted|couldn't|can't/i.test(lower)) return { signals, intensity: 'high' };
  if (/quiet|rest|light/.test(lower)) return { signals, intensity: 'low' };
  return { signals, intensity: 'medium' };
}

export interface Analysis extends ExtractionResult {
  metrics: HealthMetrics;
  activity: ActivityDetected;
}

export function analyze(text: string): Analysis {
  const result = extractSymptoms(text, METRIC_LEMMAS);
  return {
    ...result,
    symptoms: refine(result.symptoms, text),
    metrics: extractHealthMetrics(text),
    activity: detectActivities(text),
  };
}
