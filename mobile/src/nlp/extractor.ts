/**
 * Symptom Extractor - JavaScript/TypeScript port
 *
 * Comprehensive symptom extraction with support for:
 * - Pain qualifiers and body parts
 * - Mental health symptoms
 * - Respiratory symptoms
 * - Casual/Gen-Z language
 * - Severity detection
 * - Spoon theory
 * - Chronic illness terminology
 */

import { ExtractionResult, ExtractedSymptom, SpoonCount, ActivityTrigger, SymptomDuration, TimeOfDay } from '../types';

// ============================================================================
// SYMPTOM LEMMAS - Single word mappings
// ============================================================================

export const SYMPTOM_LEMMAS: Record<string, string> = {
  // === FATIGUE / ENERGY ===
  exhaust: 'fatigue',
  exhausted: 'fatigue',
  exhaustion: 'fatigue',
  tire: 'fatigue',
  tired: 'fatigue',
  tiredness: 'fatigue',
  wipe: 'fatigue',
  wiped: 'fatigue',
  fatigue: 'fatigue',
  fatigued: 'fatigue',
  drain: 'fatigue',
  drained: 'fatigue',
  spent: 'fatigue',
  depleted: 'fatigue',
  knackered: 'fatigue',
  shattered: 'fatigue',
  zonked: 'fatigue',
  pooped: 'fatigue',
  bushed: 'fatigue',
  beat: 'fatigue',
  wrecked: 'fatigue',
  destroyed: 'fatigue',
  sluggish: 'fatigue',
  lethargic: 'fatigue',
  lethargy: 'fatigue',
  listless: 'fatigue',
  weary: 'fatigue',
  weariness: 'fatigue',
  enervated: 'fatigue',
  energy: 'fatigue',
  suffering: 'fatigue',

  // === PEM (Post-Exertional Malaise) ===
  crash: 'pem',
  crashed: 'pem',
  crashing: 'pem',
  payback: 'pem',
  pem: 'pem',
  flare: 'flare',
  flaring: 'flare',
  flareup: 'flare',
  relapse: 'flare',
  relapsing: 'flare',
  overdid: 'pem',
  overexerted: 'pem',
  overexertion: 'pem',
  pushed: 'pem',
  boom: 'pem',

  // === BRAIN FOG / COGNITIVE ===
  foggy: 'brain_fog',
  fog: 'brain_fog',
  fuzzy: 'brain_fog',
  cloudy: 'brain_fog',
  scattered: 'brain_fog',
  spacey: 'brain_fog',
  spacy: 'brain_fog',
  hazy: 'brain_fog',
  muddled: 'brain_fog',
  muddy: 'brain_fog',
  confused: 'brain_fog',
  confusion: 'brain_fog',
  disoriented: 'brain_fog',
  forgetful: 'memory',
  forgetfulness: 'memory',
  forgetting: 'memory',
  distracted: 'focus',
  unfocused: 'focus',
  concentration: 'focus',
  concentrate: 'focus',
  focusing: 'focus',
  fried: 'brain_fog',
  loopy: 'brain_fog',
  braindead: 'brain_fog',
  blanking: 'brain_fog',
  drippy: 'brain_fog',
  dicey: 'brain_fog',

  // === GENERAL PAIN ===
  ache: 'pain',
  achy: 'pain',
  aching: 'pain',
  hurt: 'pain',
  hurts: 'pain',
  hurting: 'pain',
  pain: 'pain',
  painful: 'pain',
  sore: 'pain',
  soreness: 'pain',
  tender: 'pain',
  tenderness: 'pain',
  throbbing: 'pain',
  throb: 'pain',
  stabbing: 'pain',
  sharp: 'pain',
  burning: 'pain',
  stinging: 'pain',
  cutting: 'pain',
  discomfort: 'pain',

  // === HEADACHE ===
  pound: 'headache',
  pounding: 'headache',
  migraine: 'headache',
  migraines: 'headache',
  headache: 'headache',
  headaches: 'headache',
  cephalalgia: 'headache',
  head: 'headache',

  // === MUSCLE PAIN ===
  muscle: 'muscle_pain',
  muscles: 'muscle_pain',
  myalgia: 'muscle_pain',
  myalgias: 'muscle_pain',

  // === JOINT PAIN ===
  joint: 'joint_pain',
  joints: 'joint_pain',
  stiff: 'stiffness',
  stiffness: 'stiffness',
  arthralgia: 'joint_pain',
  arthralgias: 'joint_pain',
  swollen: 'swelling',
  swelling: 'swelling',

  // === BACK / NECK PAIN ===
  back: 'back_pain',
  neck: 'neck_pain',
  chest: 'chest_pain',

  // === EDS / HYPERMOBILITY ===
  subluxation: 'subluxation',
  subluxed: 'subluxation',
  subluxing: 'subluxation',
  dislocated: 'dislocation',
  dislocation: 'dislocation',
  dislocating: 'dislocation',
  hypermobile: 'hypermobility',
  hypermobility: 'hypermobility',
  loosey: 'hypermobility',
  bendy: 'hypermobility',
  unstable: 'joint_instability',
  instability: 'joint_instability',

  // === SLEEP ===
  insomnia: 'insomnia',
  sleepless: 'insomnia',
  insomniac: 'insomnia',
  restless: 'sleep_disturbance',
  unrefreshed: 'unrefreshing_sleep',
  unrefreshing: 'unrefreshing_sleep',
  wired: 'sleep_disturbance',

  // === HYPERSOMNIA ===
  oversleep: 'hypersomnia',
  oversleeping: 'hypersomnia',
  overslept: 'hypersomnia',
  hypersomnia: 'hypersomnia',
  somnolent: 'hypersomnia',
  drowsy: 'hypersomnia',
  drowsiness: 'hypersomnia',

  // === CARDIAC / POTS ===
  palpitation: 'palpitations',
  palpitations: 'palpitations',
  palpitating: 'palpitations',
  race: 'palpitations',
  racing: 'palpitations',
  flutter: 'palpitations',
  fluttering: 'palpitations',
  tachy: 'palpitations',
  tachycardia: 'palpitations',
  bradycardia: 'bradycardia',
  arrhythmia: 'arrhythmia',
  skipping: 'palpitations',

  // === ORTHOSTATIC / DYSAUTONOMIA ===
  pots: 'orthostatic',
  orthostatic: 'orthostatic',
  dysautonomia: 'dysautonomia',
  presyncope: 'presyncope',
  presyncopal: 'presyncope',
  pooling: 'blood_pooling',

  // === DIZZINESS / VERTIGO ===
  dizzy: 'dizziness',
  dizziness: 'dizziness',
  lightheaded: 'dizziness',
  lightheadedness: 'dizziness',
  faint: 'fainting',
  fainted: 'fainting',
  fainting: 'fainting',
  syncope: 'fainting',
  vertigo: 'vertigo',
  spinning: 'vertigo',
  woozy: 'dizziness',
  unsteady: 'dizziness',
  wobbly: 'dizziness',
  giddy: 'dizziness',
  swimmy: 'dizziness',
  floaty: 'dizziness',
  fall: 'dizziness',

  // === GASTROINTESTINAL ===
  nausea: 'nausea',
  nauseous: 'nausea',
  nauseated: 'nausea',
  queasy: 'nausea',
  puke: 'vomiting',
  puked: 'vomiting',
  puking: 'vomiting',
  vomit: 'vomiting',
  vomited: 'vomiting',
  vomiting: 'vomiting',
  threw: 'vomiting',
  bloat: 'bloating',
  bloated: 'bloating',
  bloating: 'bloating',
  gassy: 'bloating',
  // Note: cramp/cramping/cramps removed from GI section - now handled as PAIN_QUALIFIERS
  // When cramping occurs in stomach/abdomen, it will be detected via extractPainDetails()
  // with location=stomach/abdomen, creating gi_pain symptom with cramping qualifier
  constipated: 'constipation',
  constipation: 'constipation',
  diarrhea: 'diarrhea',
  diarrhoea: 'diarrhea',
  ibs: 'ibs',
  reflux: 'reflux',
  heartburn: 'reflux',
  gerd: 'reflux',
  gastroparesis: 'gastroparesis',

  // === NEUROLOGICAL ===
  tingle: 'numbness_tingling',
  tingling: 'numbness_tingling',
  tingles: 'numbness_tingling',
  tingly: 'numbness_tingling',
  numb: 'numbness_tingling',
  numbness: 'numbness_tingling',
  paresthesia: 'numbness_tingling',
  paresthesias: 'numbness_tingling',

  // === TREMOR ===
  tremor: 'tremor',
  tremors: 'tremor',
  shake: 'tremor',
  shaking: 'tremor',
  shaky: 'tremor',
  shakiness: 'tremor',
  tremble: 'tremor',
  trembling: 'tremor',
  vibrating: 'tremor',
  jittery: 'tremor',
  jitters: 'tremor',
  twitching: 'twitching',
  twitches: 'twitching',
  twitch: 'twitching',
  spasm: 'spasm',
  spasms: 'spasm',
  spasming: 'spasm',

  // === RESPIRATORY ===
  breathless: 'shortness_of_breath',
  breathe: 'shortness_of_breath',
  breathing: 'shortness_of_breath',
  dyspnea: 'shortness_of_breath',
  wheezy: 'wheezing',
  wheeze: 'wheezing',
  wheezing: 'wheezing',
  cough: 'cough',
  coughing: 'cough',
  attack: 'asthma_attack',

  // === MOOD / EMOTIONAL ===
  depressed: 'low_mood',
  depression: 'low_mood',
  sad: 'low_mood',
  sadness: 'low_mood',
  hopeless: 'low_mood',
  hopelessness: 'low_mood',
  crying: 'low_mood',
  tearful: 'low_mood',
  weepy: 'low_mood',
  down: 'low_mood',
  blue: 'low_mood',
  despair: 'low_mood',

  anxious: 'anxiety',
  anxiety: 'anxiety',
  worried: 'anxiety',
  worry: 'anxiety',
  worrying: 'anxiety',
  panic: 'panic',
  panicky: 'panic',
  panicking: 'panic',
  stressed: 'stress',
  stress: 'stress',
  overwhelmed: 'overwhelmed',
  overwhelming: 'overwhelmed',
  nervous: 'anxiety',
  scared: 'anxiety',
  terrified: 'anxiety',
  fear: 'anxiety',

  irritable: 'irritability',
  irritability: 'irritability',
  irritated: 'irritability',
  frustrated: 'irritability',
  frustrating: 'irritability',
  frustration: 'irritability',
  cranky: 'irritability',
  grumpy: 'irritability',
  annoyed: 'irritability',
  snappy: 'irritability',
  moody: 'mood_swings',

  // === TEMPERATURE DYSREGULATION ===
  sweating: 'sweating',
  sweaty: 'sweating',
  sweats: 'sweating',
  chills: 'chills',
  chilly: 'chills',
  feverish: 'fever',
  fever: 'fever',
  overheating: 'heat_intolerance',
  overheated: 'heat_intolerance',
  freezing: 'cold_intolerance',
  flushing: 'flushing',
  flushed: 'flushing',

  // === WEAKNESS ===
  weak: 'weakness',
  weakness: 'weakness',
  feeble: 'weakness',
  limp: 'weakness',

  // === SENSORY SENSITIVITY ===
  photophobia: 'light_sensitivity',
  photosensitive: 'light_sensitivity',
  photosensitivity: 'light_sensitivity',
  phonophobia: 'sound_sensitivity',
  hyperacusis: 'sound_sensitivity',

  // === APPETITE ===
  appetite: 'appetite_change',
  hungry: 'appetite_change',
  starving: 'appetite_change',
  anorexia: 'appetite_loss',

  // === SKIN / AUTOIMMUNE ===
  rash: 'rash',
  rashes: 'rash',
  hives: 'hives',
  itchy: 'itching',
  itching: 'itching',
  itch: 'itching',
  bruise: 'bruising',
  bruised: 'bruising',
  bruising: 'bruising',
  malar: 'rash',
  butterfly: 'rash',
  raynauds: 'raynauds',
  raynaud: 'raynauds',
  lump: 'lump',
  lumps: 'lump',

  // === HAIR / NAIL ===
  hairloss: 'hair_loss',
  alopecia: 'hair_loss',
  shedding: 'hair_loss',

  // === VISION ===
  blurry: 'vision_changes',
  blurred: 'vision_changes',
  blurriness: 'vision_changes',
  floaters: 'vision_changes',
  aura: 'aura',
  auras: 'aura',

  // === SWELLING / INFLAMMATION ===
  puffy: 'swelling',
  puffiness: 'swelling',
  edema: 'swelling',
  oedema: 'swelling',
  inflamed: 'inflammation',
  inflammation: 'inflammation',

  // === MOUTH / THROAT ===
  drymouth: 'dry_mouth',
  ulcer: 'mouth_ulcers',
  ulcers: 'mouth_ulcers',
  sorethroat: 'sore_throat',

  // === BLEEDING ===
  bleeding: 'bleeding',
  bleed: 'bleeding',

  // === GENERAL MALAISE ===
  malaise: 'malaise',
  unwell: 'malaise',
  sick: 'malaise',
  lousy: 'malaise',
  rough: 'malaise',
  awful: 'malaise',
  terrible: 'malaise',
  horrible: 'malaise',
  miserable: 'malaise',
  dreadful: 'malaise',
  rotten: 'malaise',
  crummy: 'malaise',
  crappy: 'malaise',
  rubbish: 'malaise',

  // === MENSTRUAL / HORMONAL ===
  period: 'menstruation',
  menstrual: 'menstruation',
  menstruation: 'menstruation',
  pms: 'pms',
  pmdd: 'pmdd',
  cycle: 'menstrual_cycle',
  spotting: 'spotting',
  flow: 'menstruation',
  hormonal: 'hormonal',
  hormone: 'hormonal',
  estrogen: 'hormonal',
  progesterone: 'hormonal',
  ovulation: 'ovulation',

  // === LONG COVID SPECIFIC ===
  parosmia: 'parosmia',
  dysgeusia: 'dysgeusia',
  tinnitus: 'tinnitus',
  ringing: 'tinnitus',
  sicca: 'sicca',

  // === GI EXPANSION ===
  dysphagia: 'dysphagia',
  swallowing: 'dysphagia',
  distension: 'bloating',

  // === NEUROLOGICAL EXPANSION ===
  vibration: 'internal_vibrations',
  vibrations: 'internal_vibrations',
  zap: 'brain_zaps',
  zaps: 'brain_zaps',
  nerve: 'nerve_pain',
  overload: 'sensory_overload',
  cognitive: 'cognitive_dysfunction',
  processing: 'cognitive_dysfunction',

  // === AUTONOMIC / POTS EXPANSION ===
  hypotension: 'low_blood_pressure',
  hypertension: 'high_blood_pressure',
  adrenaline: 'adrenaline_surge',

  // === MENTAL HEALTH EXPANSION ===
  intrusive: 'intrusive_thoughts',
  impulsive: 'impulsivity',
  impulsivity: 'impulsivity',
  dysregulation: 'emotional_dysregulation',
  rejection: 'rejection_sensitivity',
  apathy: 'apathy',
  apathetic: 'apathy',

  // === SENSORY EXPANSION ===
  distortion: 'sensory_distortion',
  allodynia: 'allodynia',

  // === SKIN EXPANSION ===
  petechiae: 'petechiae',
  // 'sensitivity' removed - too broad, use specific phrases instead (light sensitivity, skin sensitivity, etc.)

  // === URINARY ===
  urinary: 'urinary',
  urgency: 'urinary_urgency',
  frequency: 'urinary_frequency',
  cystitis: 'cystitis',

  // === IMMUNE ===
  infection: 'infection',
  infections: 'infections',
  healing: 'slow_healing',
  glands: 'swollen_glands',

  // === WEIGHT / METABOLISM ===
  weight: 'weight_change',
  metabolic: 'metabolic',
  metabolism: 'metabolic',

  // === ACTIVITY / EXERTION ===
  pacing: 'pacing',
  recovery: 'delayed_recovery',
};

// ============================================================================
// MULTI-WORD SYMPTOM PHRASES
// ============================================================================

export const SYMPTOM_PHRASES: Record<string, string> = {
  // === FATIGUE / ENERGY ===
  'brain fog': 'brain_fog',
  'bone tired': 'fatigue',
  'bone-tired': 'fatigue',
  'wiped out': 'fatigue',
  'worn out': 'fatigue',
  'burnt out': 'burnout',
  'burned out': 'burnout',
  'feel like death': 'fatigue',
  'like death': 'fatigue',
  'no energy': 'fatigue',
  'low energy': 'fatigue',
  'zero energy': 'fatigue',
  'energy tank empty': 'fatigue',
  'running on empty': 'fatigue',
  'running on fumes': 'fatigue',
  'hit a wall': 'fatigue',
  'hitting the wall': 'fatigue',
  'chugging along': 'fatigue',

  // === SPOON THEORY ===
  'out of spoons': 'spoon_theory',
  'no spoons': 'spoon_theory',
  'low spoons': 'spoon_theory',
  'spent all my spoons': 'spoon_theory',
  'used up spoons': 'spoon_theory',
  'negative spoons': 'spoon_theory',
  'borrowing spoons': 'spoon_theory',
  'spoon deficit': 'spoon_theory',
  'spoon count': 'spoon_theory',
  'low spoon day': 'spoon_theory',
  'no spoon day': 'spoon_theory',

  // === PEM / CRASH ===
  'post exertional': 'pem',
  'post-exertional': 'pem',
  'post exertional malaise': 'pem',
  'post-exertional malaise': 'pem',
  'energy crash': 'pem',
  'crashed hard': 'pem',
  'totally crashed': 'pem',
  'complete crash': 'pem',
  'major crash': 'pem',
  'boom and bust': 'pem',
  'boom bust': 'pem',
  'pushed through': 'pem',
  'pushed too hard': 'pem',
  'overdid it': 'pem',
  'paying for it': 'pem',
  'paying the price': 'pem',

  // === FLARE ===
  'in a flare': 'flare',
  'flare up': 'flare',
  'flare-up': 'flare',
  'flaring up': 'flare',
  'having a flare': 'flare',
  'major flare': 'flare',
  'full flare': 'flare',
  'bad flare': 'flare',

  // === COGNITIVE ===
  "can't think": 'brain_fog',
  "cant think": 'brain_fog',
  "can't concentrate": 'brain_fog',
  "cant concentrate": 'brain_fog',
  "can't focus": 'brain_fog',
  "cant focus": 'brain_fog',
  "can't remember": 'memory',
  "cant remember": 'memory',
  'word finding': 'cognitive_dysfunction',
  'word-finding': 'cognitive_dysfunction',
  "can't find words": 'cognitive_dysfunction',
  'losing words': 'cognitive_dysfunction',
  'lost my words': 'cognitive_dysfunction',
  'words not working': 'brain_fog',
  'brain not working': 'brain_fog',
  "brain isn't working": 'brain_fog',
  'brain is mush': 'brain_fog',
  'brain is soup': 'brain_fog',
  'brain soup': 'brain_fog',
  'head full of cotton': 'brain_fog',
  'cotton wool head': 'brain_fog',
  'thoughts are slow': 'brain_fog',
  'slow thinking': 'brain_fog',
  'thinking through mud': 'brain_fog',
  'mental fog': 'brain_fog',
  'cognitive dysfunction': 'brain_fog',
  'fibro fog': 'brain_fog',
  'pain fog': 'brain_fog',
  'med fog': 'brain_fog',
  'medication fog': 'brain_fog',

  // === CARDIAC / POTS ===
  'heart racing': 'palpitations',
  'heart pounding': 'palpitations',
  'heart fluttering': 'palpitations',
  'heart is racing': 'palpitations',
  'heart is pounding': 'palpitations',
  'heart skipping': 'palpitations',
  'heart skipped': 'palpitations',
  'heart rate spiked': 'palpitations',
  'hr spiked': 'palpitations',
  'heart rate high': 'palpitations',
  'resting heart rate high': 'palpitations',
  'heart rate upon standing': 'orthostatic',
  'hr on standing': 'orthostatic',
  'standing heart rate': 'orthostatic',

  // === ORTHOSTATIC / POTS ===
  'blood pooling': 'blood_pooling',
  "can't stand": 'orthostatic',
  "cant stand": 'orthostatic',
  'standing up': 'orthostatic',
  'upon standing': 'orthostatic',
  'when i stand': 'orthostatic',
  'trouble standing': 'orthostatic',
  'hard to stand': 'orthostatic',
  'stood up too fast': 'orthostatic',
  'getting up': 'orthostatic',
  'orthostatic intolerance': 'orthostatic',
  'positional changes': 'orthostatic',
  'changing position': 'orthostatic',

  // === DIZZINESS / FAINTING ===
  'head spinning': 'vertigo',
  'room spinning': 'vertigo',
  'almost fainted': 'presyncope',
  'nearly fainted': 'presyncope',
  'felt faint': 'presyncope',
  'feeling faint': 'presyncope',
  'about to pass out': 'presyncope',
  'greyed out': 'pre_syncope',
  'grayed out': 'pre_syncope',
  'blacked out': 'syncope',
  'passed out': 'syncope',
  'lost consciousness': 'syncope',

  // === NEUROLOGICAL ===
  'pins and needles': 'paresthesia',
  'pins needles': 'paresthesia',
  'static feeling': 'paresthesia',
  'electric shock': 'numbness_tingling',
  'electric shocks': 'numbness_tingling',
  'zaps': 'numbness_tingling',
  'brain zaps': 'numbness_tingling',
  'internal tremor': 'tremor',
  'internal tremors': 'tremor',
  'internal vibrations': 'tremor',
  'inner trembling': 'tremor',

  // === PAIN ===
  'killing me': 'pain',
  'full body pain': 'pain',
  'all over pain': 'pain',
  'widespread pain': 'pain',
  'chronic pain': 'pain',
  'deep and painful': 'pain',

  // === HEADACHE ===
  'splitting headache': 'headache',
  'tension headache': 'headache',
  'pressure headache': 'headache',
  'head pounding': 'headache',
  'head is killing me': 'headache',
  'head pressure': 'headache',

  // === BACK / NECK PAIN ===
  'back pain': 'back_pain',
  'back ache': 'back_pain',
  'back hurts': 'back_pain',
  'neck pain': 'neck_pain',
  'neck ache': 'neck_pain',
  'neck hurts': 'neck_pain',
  'chest pain': 'chest_pain',
  'chest ache': 'chest_pain',
  'chest hurts': 'chest_pain',

  // === MUSCLE PAIN ===
  'muscle pain': 'muscle_pain',
  'muscle aches': 'muscle_pain',
  'muscles ache': 'muscle_pain',
  'body aches': 'muscle_pain',
  'body is aching': 'muscle_pain',

  // === JOINT ISSUES ===
  'joint pain': 'joint_pain',
  'joints hurt': 'joint_pain',
  'joints ache': 'joint_pain',
  'joint stiffness': 'stiffness',
  'morning stiffness': 'stiffness',
  'joints popping': 'joint_instability',
  'joints cracking': 'joint_instability',
  'joints grinding': 'joint_instability',
  'joints slipping': 'subluxation',
  'joint slipped': 'subluxation',
  'partial dislocation': 'subluxation',
  'popped out': 'subluxation',

  // === RESPIRATORY ===
  'short of breath': 'shortness_of_breath',
  'shortness of breath': 'shortness_of_breath',
  'hard to breathe': 'shortness_of_breath',
  "can't breathe": 'shortness_of_breath',
  "cant breathe": 'shortness_of_breath',
  "can't catch my breath": 'shortness_of_breath',
  'out of breath': 'shortness_of_breath',
  'chest tight': 'chest_tightness',
  'chest is tight': 'chest_tightness',
  'tight chest': 'chest_tightness',
  'heavy chest': 'chest_tightness',
  'chest pressure': 'chest_tightness',
  'asthma attack': 'asthma_attack',
  'bad cold': 'respiratory_infection',
  'sinus infection': 'respiratory_infection',

  // === SLEEP ===
  "can't sleep": 'insomnia',
  "cant sleep": 'insomnia',
  "couldn't sleep": 'insomnia',
  'couldnt sleep': 'insomnia',
  'trouble sleeping': 'insomnia',
  'hard to sleep': 'insomnia',
  'woke up tired': 'unrefreshing_sleep',
  'woke up exhausted': 'unrefreshing_sleep',
  'still tired': 'unrefreshing_sleep',
  'never feel rested': 'unrefreshing_sleep',
  "don't feel rested": 'unrefreshing_sleep',
  'sleeping all day': 'hypersomnia',
  'slept all day': 'hypersomnia',
  'sleep too much': 'hypersomnia',
  "can't stay awake": 'hypersomnia',
  'waking up constantly': 'sleep_disturbance',
  'keep waking up': 'sleep_disturbance',
  'restless sleep': 'sleep_disturbance',
  'tossing and turning': 'sleep_disturbance',

  // === SENSITIVITY ===
  'light hurts': 'light_sensitivity',
  'lights hurt': 'light_sensitivity',
  'sensitive to light': 'light_sensitivity',
  'light sensitivity': 'light_sensitivity',
  'too bright': 'light_sensitivity',
  'sound hurts': 'sound_sensitivity',
  'sounds hurt': 'sound_sensitivity',
  'sensitive to sound': 'sound_sensitivity',
  'sound sensitivity': 'sound_sensitivity',
  'too loud': 'sound_sensitivity',
  'noise sensitivity': 'sound_sensitivity',
  'smell sensitivity': 'smell_sensitivity',
  'sensitive to smells': 'smell_sensitivity',

  // === FLU-LIKE ===
  'flu-like': 'flu_like',
  'flu like': 'flu_like',
  'like the flu': 'flu_like',
  'have the flu': 'flu_like',
  'feels like flu': 'flu_like',
  'coming down with something': 'flu_like',

  // === APPETITE ===
  "can't eat": 'appetite_loss',
  "cant eat": 'appetite_loss',
  'no appetite': 'appetite_loss',
  'not hungry': 'appetite_loss',
  'lost appetite': 'appetite_loss',
  'food aversion': 'appetite_loss',
  "can't keep food down": 'nausea',
  'stomach upset': 'nausea',

  // === GI ===
  'stomach pain': 'gi_pain',
  'abdominal pain': 'gi_pain',
  'belly pain': 'gi_pain',
  'tummy pain': 'gi_pain',
  'stomach cramps': 'gi_cramping',
  'stomach churning': 'nausea',
  'threw up': 'vomiting',
  'throw up': 'vomiting',
  'throwing up': 'vomiting',

  // === MOOD ===
  'feeling low': 'low_mood',
  'really low': 'low_mood',
  'feeling down': 'low_mood',
  'down in the dumps': 'low_mood',
  'panic attack': 'panic',
  'anxiety attack': 'panic',
  'mental breakdown': 'overwhelmed',
  'emotional rollercoaster': 'mood_swings',
  'mental health': 'mental_health',
  'taking a toll on my mental health': 'mental_health',

  // === TEMPERATURE ===
  'night sweats': 'night_sweats',
  'hot and cold': 'temperature_dysregulation',
  'hot or cold': 'temperature_dysregulation',
  "can't regulate temperature": 'temperature_dysregulation',
  'heat intolerance': 'heat_intolerance',
  "can't handle heat": 'heat_intolerance',
  'cold intolerance': 'cold_intolerance',
  "can't handle cold": 'cold_intolerance',
  "can't get warm": 'cold_intolerance',
  'hot flashes': 'hot_flashes',
  'hot flushes': 'hot_flashes',

  // === WEAKNESS / MOBILITY ===
  'jelly legs': 'weakness',
  'legs like jelly': 'weakness',
  'feel like jelly': 'weakness',
  'legs gave out': 'weakness',
  'legs buckling': 'weakness',
  'legs wobbly': 'weakness',
  "can't walk": 'mobility',
  'trouble walking': 'mobility',
  'hard to walk': 'mobility',
  'unsteady on feet': 'dizziness',
  'balance problems': 'balance',
  'balance issues': 'balance',

  // === AUTOIMMUNE / SKIN ===
  'butterfly rash': 'malar_rash',
  'sun sensitivity': 'photosensitivity',
  'sun reactive': 'photosensitivity',
  'skin burning': 'skin_pain',
  'skin on fire': 'skin_pain',
  'hair falling out': 'hair_loss',
  'losing hair': 'hair_loss',
  'hair thinning': 'hair_loss',
  'hives from allergies': 'hives',

  // === VISION ===
  'blurry vision': 'vision_changes',
  'vision blurry': 'vision_changes',
  'double vision': 'vision_changes',
  'seeing spots': 'vision_changes',
  'visual disturbance': 'vision_changes',
  'visual disturbances': 'vision_changes',

  // === SWELLING ===
  'swollen glands': 'swollen_lymph_nodes',
  'lymph nodes swollen': 'swollen_lymph_nodes',
  'swollen lymph nodes': 'swollen_lymph_nodes',
  'tender lymph nodes': 'swollen_lymph_nodes',

  // === DRY SYMPTOMS ===
  'dry mouth': 'dry_mouth',
  'dry eyes': 'dry_eyes',
  'eyes dry': 'dry_eyes',
  'gritty eyes': 'dry_eyes',
  'sore throat': 'sore_throat',

  // === SMELL/TASTE ===
  'lost smell': 'anosmia',
  'no smell': 'anosmia',
  "can't smell": 'anosmia',
  'lost taste': 'dysgeusia',
  'no taste': 'dysgeusia',
  "can't taste": 'dysgeusia',
  'taste weird': 'dysgeusia',
  'smell weird': 'parosmia',
  'distorted smell': 'parosmia',
  'distorted taste': 'dysgeusia',

  // === MAST CELL / MCAS ===
  'histamine reaction': 'mcas',
  'allergic reaction': 'allergic_reaction',
  'mast cell': 'mcas',
  'mcas': 'mcas',
  'mast cell activation': 'mcas',

  // === CASUAL/GEN-Z LANGUAGE ===
  'feels like garbage': 'malaise',
  'feel like garbage': 'malaise',
  'feeling like garbage': 'malaise',
  'feels like shit': 'malaise',
  'feel like shit': 'malaise',
  'feeling like shit': 'malaise',
  'feels like ass': 'malaise',
  'feel like ass': 'malaise',
  'feeling like ass': 'malaise',
  'feels like crap': 'malaise',
  'feel like crap': 'malaise',
  'feeling like crap': 'malaise',
  'feels like hell': 'malaise',
  'feel like hell': 'malaise',
  'feeling like hell': 'malaise',
  'feel like trash': 'malaise',
  'feeling like trash': 'malaise',

  'absolutely wrecked': 'fatigue',
  'totally wrecked': 'fatigue',
  'completely wrecked': 'fatigue',
  'absolutely destroyed': 'fatigue',
  'totally destroyed': 'fatigue',
  'literally dead': 'fatigue',
  'actually dead': 'fatigue',
  'literally dying': 'fatigue',
  'actually dying': 'fatigue',
  'dead tired': 'fatigue',
  'so dead': 'fatigue',
  'im dead': 'fatigue',
  "i'm dead": 'fatigue',

  'cant even': 'overwhelmed',
  "can't even": 'overwhelmed',
  'cannot even': 'overwhelmed',

  'hurts like hell': 'pain',
  'hurts like a bitch': 'pain',
  'hurts so bad': 'pain',
  'pain is insane': 'pain',
  'pain is crazy': 'pain',
  'pain is wild': 'pain',
  'pain is brutal': 'pain',

  'brain is broken': 'brain_fog',
  'brain is fried': 'brain_fog',
  'brain not braining': 'brain_fog',
  'head is fucked': 'brain_fog',
  "can't brain": 'brain_fog',
  'no thoughts': 'brain_fog',
  'zero thoughts': 'brain_fog',
  'brain empty': 'brain_fog',
  'head empty': 'brain_fog',
  'smooth brain': 'brain_fog',
  'thoughts are broken': 'brain_fog',

  'lowkey dying': 'fatigue',
  'highkey dying': 'fatigue',
  'lowkey exhausted': 'fatigue',
  'highkey exhausted': 'fatigue',
  "lowkey can't breathe": 'shortness_of_breath',
  "highkey can't breathe": 'shortness_of_breath',
  'lowkey panicking': 'panic',
  'highkey panicking': 'panic',
  'low key dying': 'fatigue',
  'high key dying': 'fatigue',

  'head feels like garbage': 'headache',
  'head feels like shit': 'headache',
  'body feels like garbage': 'pain',
  'body feels like shit': 'pain',
  'everything hurts': 'pain',

  'absolutely exhausted': 'fatigue',
  'literally exhausted': 'fatigue',
  'absolutely drained': 'fatigue',
  'literally drained': 'fatigue',
  'so over this': 'fatigue',
  'done with today': 'fatigue',
  'body is done': 'fatigue',
  'body gave up': 'fatigue',
  'not functioning': 'fatigue',
  'barely functioning': 'fatigue',
  'nonfunctional': 'fatigue',

  'really bad': 'severe',
  'really rough': 'severe',
  'super bad': 'severe',
  'pretty bad': 'moderate',
  'kind of bad': 'mild',
  'not too bad': 'mild',
  'worst ever': 'severe',
  'off the charts': 'severe',
  'through the roof': 'severe',
  'unbearable': 'severe',
  'debilitating': 'severe',

  // === MENSTRUAL / HORMONAL PHRASES ===
  'on my period': 'menstruation',
  'period cramps': 'menstrual_cramps',
  'menstrual cramps': 'menstrual_cramps',
  'period pain': 'menstrual_cramps',
  'heavy period': 'heavy_bleeding',
  'heavy flow': 'heavy_bleeding',
  'heavy bleeding': 'heavy_bleeding',
  'irregular period': 'irregular_cycle',
  'irregular cycle': 'irregular_cycle',
  'missed period': 'missed_period',
  'late period': 'late_period',
  'breast tenderness': 'breast_tenderness',
  'sore breasts': 'breast_tenderness',
  'hormonal imbalance': 'hormonal',
  'hormone changes': 'hormonal',
  'time of month': 'menstruation',

  // === LONG COVID SPECIFIC PHRASES ===
  'altered smell': 'parosmia',
  'smell distortion': 'parosmia',
  'altered taste': 'dysgeusia',
  'taste distortion': 'dysgeusia',
  'metallic taste': 'dysgeusia',
  'ringing in ears': 'tinnitus',
  'ears ringing': 'tinnitus',
  'hearing changes': 'hearing_changes',
  'dry eyes and mouth': 'sicca',
  'dry mouth and eyes': 'sicca',

  // === GI EXPANSION PHRASES ===
  'trouble swallowing': 'dysphagia',
  'hard to swallow': 'dysphagia',
  'difficulty swallowing': 'dysphagia',
  'food intolerance': 'food_intolerance',
  'food intolerances': 'food_intolerance',
  'food sensitivities': 'food_intolerance',
  'stomach distension': 'bloating',
  'abdominal distension': 'bloating',
  'gut issues': 'digestive',
  'digestive issues': 'digestive',

  // === NEUROLOGICAL EXPANSION PHRASES ===
  'body vibrating': 'tremor',
  'head zaps': 'brain_zaps',
  'neuropathic pain': 'nerve_pain',
  'sensory overload': 'sensory_overload',
  'overwhelmed by stimuli': 'sensory_overload',
  'too much stimulation': 'sensory_overload',
  'alcohol intolerance': 'alcohol_intolerance',
  'cant drink': 'alcohol_intolerance',
  "can't drink": 'alcohol_intolerance',
  'cant tolerate alcohol': 'alcohol_intolerance',

  // === AUTONOMIC / POTS EXPANSION PHRASES ===
  'blood pressure low': 'low_blood_pressure',
  'low blood pressure': 'low_blood_pressure',
  'bp low': 'low_blood_pressure',
  'blood pressure high': 'high_blood_pressure',
  'high blood pressure': 'high_blood_pressure',
  'bp high': 'high_blood_pressure',
  'coat hanger pain': 'coat_hanger_pain',
  'adrenaline surge': 'adrenaline_surge',
  'adrenaline rush': 'adrenaline_surge',
  'adrenaline dump': 'adrenaline_surge',

  // === MENTAL HEALTH EXPANSION PHRASES ===
  'intrusive thoughts': 'intrusive_thoughts',
  'unwanted thoughts': 'intrusive_thoughts',
  'racing thoughts': 'racing_thoughts',
  'thoughts racing': 'racing_thoughts',
  'emotional dysregulation': 'emotional_dysregulation',
  'cant regulate emotions': 'emotional_dysregulation',
  "can't regulate emotions": 'emotional_dysregulation',
  'rejection sensitive': 'rejection_sensitivity',
  'rejection sensitivity': 'rejection_sensitivity',
  'suicidal thoughts': 'suicidal_ideation',
  'thinking about death': 'suicidal_ideation',
  'feeling detached': 'dissociation',
  'out of body': 'depersonalization',
  'dont feel real': 'derealization',
  "don't feel real": 'derealization',
  'nothing feels real': 'derealization',

  // === SENSORY EXPANSION PHRASES ===
  'visual snow': 'visual_snow',
  'seeing static': 'visual_snow',
  'light flashes': 'visual_disturbances',
  'seeing flashes': 'visual_disturbances',
  'sound distortion': 'sound_distortion',
  'sounds distorted': 'sound_distortion',

  // === SKIN EXPANSION PHRASES ===
  'sensitive skin': 'skin_sensitivity',
  'skin hurts': 'allodynia',
  'skin pain': 'allodynia',
  'touch hurts': 'allodynia',
  'painful to touch': 'allodynia',
  'easy bruising': 'easy_bruising',
  'bruise easily': 'easy_bruising',
  'red spots': 'petechiae',

  // === URINARY PHRASES ===
  'need to pee': 'urinary_urgency',
  'urinary urgency': 'urinary_urgency',
  'frequent urination': 'urinary_frequency',
  'peeing a lot': 'urinary_frequency',
  'interstitial cystitis': 'cystitis',
  'bladder pain': 'cystitis',

  // === IMMUNE PHRASES ===
  'keep getting sick': 'frequent_infections',
  'always sick': 'frequent_infections',
  'frequent infections': 'frequent_infections',
  'wounds heal slowly': 'slow_healing',
  'not healing': 'slow_healing',

  // === WEIGHT / METABOLISM PHRASES ===
  'weight gain': 'weight_gain',
  'gaining weight': 'weight_gain',
  'weight loss': 'weight_loss',
  'losing weight': 'weight_loss',
  'unexplained weight': 'weight_change',
  'metabolic changes': 'metabolic',

  // === ACTIVITY / EXERTION PHRASES ===
  'exercise intolerance': 'exercise_intolerance',
  'cant exercise': 'exercise_intolerance',
  "can't exercise": 'exercise_intolerance',
  'activity intolerance': 'activity_intolerance',
  'cant do activities': 'activity_intolerance',
  'delayed recovery': 'delayed_recovery',
  'slow recovery': 'delayed_recovery',
  'not recovering': 'delayed_recovery',
  'pacing failure': 'pacing_failure',
  'failed pacing': 'pacing_failure',
  'did too much': 'overexertion',

  // === HIGH-PRIORITY ADDITIONS ===
  // Neuropathy/Paresthesia
  'static electricity': 'paresthesia',
  'electric feeling': 'paresthesia',
  'buzzing sensation': 'paresthesia',
  'tingling sensation': 'paresthesia',
  'numbness and tingling': 'paresthesia',

  // Cognitive Dysfunction
  'processing speed': 'cognitive_dysfunction',
  'finding words': 'cognitive_dysfunction',
  'cotton wool': 'brain_fog',
  'words swimming': 'brain_fog',

  // Syncope/Pre-syncope
  'tunnel vision': 'pre_syncope',
  'pre-syncope': 'pre_syncope',
  'pre syncope': 'pre_syncope',
  'vision going black': 'pre_syncope',
  'vision tunneling': 'pre_syncope',

  // Gastroparesis/GI
  'gastroparesis': 'gastroparesis',
  'early satiety': 'early_satiety',
  'feel full quickly': 'early_satiety',
  'full after few bites': 'early_satiety',
  'delayed emptying': 'gastroparesis',
  'nothing moving': 'gastroparesis',
  'feel full': 'early_satiety',

  // Lupus/Autoimmune
  'malar rash': 'malar_rash',
  'raynauds': 'raynauds',
  "raynaud's": 'raynauds',
  'fingers turn blue': 'raynauds',
  'fingers turn white': 'raynauds',
  'fingers go white': 'raynauds',
  'fingers go blue': 'raynauds',
  'low grade fever': 'fever',
  'mouth sores': 'mouth_sores',
  'oral ulcers': 'mouth_sores',
  'canker sores': 'mouth_sores',

  // Swelling
  'swollen knees': 'swelling',
  'swollen joints': 'swelling',
  'swollen ankles': 'swelling',
  'swollen fingers': 'swelling',
  'swollen hands': 'swelling',
  'swollen feet': 'swelling',
  'puffy face': 'swelling',
  'puffy hands': 'swelling',

  // Spoon Theory
  'low on spoons': 'spoon_theory',
  'no spoons left': 'spoon_theory',

  // Fatigue/Weakness
  'pushing my limits': 'fatigue',
  'hit by a truck': 'extreme_fatigue',
  'feel like a truck': 'extreme_fatigue',
  'lead limbs': 'weakness',
  'heavy limbs': 'weakness',
  'limbs feel heavy': 'weakness',
  'legs like lead': 'weakness',

  // === STILL-MISSING PHRASES (from performance analysis) ===

  // Light Sensitivity (removed duplicates: 'too bright', 'light hurts' already exist)
  'light is too bright': 'sensitivity_light',
  'hiding in the dark': 'sensitivity_light',
  'cant handle light': 'sensitivity_light',
  "can't handle light": 'sensitivity_light',
  'bright lights': 'sensitivity_light',

  // Nausea/Vomiting (removed duplicates: 'threw up', 'throwing up' already exist)
  'puked': 'vomiting',
  'puking': 'vomiting',
  'vomited': 'vomiting',
  'vomiting': 'vomiting',

  // Dizziness
  'got so dizzy': 'dizziness',
  'so dizzy': 'dizziness',
  'really dizzy': 'dizziness',
  'super dizzy': 'dizziness',

  // Palpitations (removed duplicates: heart racing/pounding already exist)
  'heart rate spiking': 'tachycardia',
  'heart rate is spiking': 'tachycardia',

  // Brain Fog Variations
  'brain is complete soup': 'brain_fog',
  'complete soup': 'brain_fog',

  // Dissociation/Depersonalization
  'floating outside my body': 'depersonalization',
  'floating outside': 'dissociation',
  'out of my body': 'depersonalization',
  'outside my body': 'depersonalization',
};

// ============================================================================
// NEGATION WORDS
// ============================================================================

export const NEGATION_WORDS = new Set([
  'not',
  'no',
  "n't",
  'never',
  'without',
  'dont',
  "don't",
  'doesnt',
  "doesn't",
  'didnt',
  "didn't",
  'havent',
  "haven't",
  'hasnt',
  "hasn't",
  'isnt',
  "isn't",
  'arent',
  "aren't",
  'wont',
  "won't",
  'cant',
  "can't",
  'none',
  'neither',
  'nothing',
  'nowhere',
  'hardly',
  'barely',
  'scarcely',
]);

// ============================================================================
// SEVERITY KEYWORDS
// ============================================================================

export const SEVERITY_INDICATORS: Record<string, 'mild' | 'moderate' | 'severe'> = {
  'little': 'mild',
  'slight': 'mild',
  'slightly': 'mild',
  'mild': 'mild',
  'mildly': 'mild',
  'minor': 'mild',
  'bit': 'mild',
  'a bit': 'mild',
  'touch': 'mild',
  'a touch': 'mild',
  'somewhat': 'mild',
  'kind of': 'mild',
  'kinda': 'mild',
  'sort of': 'mild',
  'sorta': 'mild',
  'manageable': 'mild',
  'tolerable': 'mild',
  'not too bad': 'mild',
  'low level': 'mild',
  'low-level': 'mild',
  'background': 'mild',
  'barely': 'mild',
  'hardly': 'mild',
  'lightly': 'mild',

  'moderate': 'moderate',
  'moderately': 'moderate',
  'pretty': 'moderate',
  'fairly': 'moderate',
  'quite': 'moderate',
  'noticeable': 'moderate',
  'noticeably': 'moderate',
  'definitely': 'moderate',
  'significant': 'moderate',
  'considerably': 'moderate',
  'reasonably': 'moderate',

  'severe': 'severe',
  'severely': 'severe',
  'extreme': 'severe',
  'extremely': 'severe',
  'very': 'severe',
  'really': 'severe',
  'super': 'severe',
  'intense': 'severe',
  'intensely': 'severe',
  'awful': 'severe',
  'terrible': 'severe',
  'horrible': 'severe',
  'unbearable': 'severe',
  'excruciating': 'severe',
  'crippling': 'severe',
  'debilitating': 'severe',
  'worst': 'severe',
  'massive': 'severe',
  'major': 'severe',
  'brutal': 'severe',
  'crushing': 'severe',
  'killer': 'severe',
  'insane': 'severe',
  'crazy': 'severe',
  'wild': 'severe',
  'absolutely': 'severe',
  'totally': 'severe',
  'completely': 'severe',
  'entirely': 'severe',
  'incredibly': 'severe',
  'unbelievably': 'severe',
  'ridiculously': 'severe',
  'impossibly': 'severe',
};

// Comparative language patterns for severity adjustment
export const COMPARATIVE_PATTERNS: Record<string, 'worse' | 'better' | 'same'> = {
  'worse': 'worse',
  'worse than': 'worse',
  'getting worse': 'worse',
  'much worse': 'worse',
  'way worse': 'worse',
  'more': 'worse',
  'increased': 'worse',
  'worsening': 'worse',
  'deteriorating': 'worse',
  'declining': 'worse',

  'better': 'better',
  'better than': 'better',
  'getting better': 'better',
  'improving': 'better',
  'improved': 'better',
  'less': 'better',
  'decreased': 'better',
  'reduced': 'better',

  'same': 'same',
  'same as': 'same',
  'no change': 'same',
  'unchanged': 'same',
  'still': 'same',
};

// Default severity by symptom type (for symptoms that are inherently severe)
export const DEFAULT_SEVERITY_BY_SYMPTOM: Record<string, 'mild' | 'moderate' | 'severe'> = {
  'pem': 'severe',
  'flare': 'severe',
  'crash': 'severe',
  'syncope': 'severe',
  'fainting': 'severe',
  'suicidal_ideation': 'severe',
  'panic': 'severe',
  'excruciating_pain': 'severe',
  'unbearable_pain': 'severe',

  'fatigue': 'moderate',
  'brain_fog': 'moderate',
  'pain': 'moderate',
  'dizziness': 'moderate',
  'nausea': 'moderate',
  'headache': 'moderate',
  'anxiety': 'moderate',
  'low_mood': 'moderate',
};

// Pain qualifiers - describes the type/quality of pain
export const PAIN_QUALIFIERS: Record<string, string> = {
  // Sharp/Acute pain
  'sharp': 'sharp',
  'stabbing': 'stabbing',
  'piercing': 'piercing',
  'shooting': 'shooting',
  'knife-like': 'sharp',
  'cutting': 'sharp',

  // Burning/Hot pain
  'burning': 'burning',
  'searing': 'burning',
  'scorching': 'burning',
  'hot': 'burning',
  'fire': 'burning',

  // Cramping pain
  'cramping': 'cramping',
  'cramp': 'cramping',
  'cramps': 'cramping',
  'spasm': 'cramping',
  'spasms': 'cramping',
  'spasming': 'cramping',
  'spasmodic': 'cramping',

  // Throbbing pain
  'throbbing': 'throbbing',
  'pulsing': 'throbbing',
  'pulsating': 'throbbing',
  'pounding': 'pounding',
  'beating': 'throbbing',

  // Dull/Aching pain
  'dull': 'dull',
  'aching': 'aching',
  'achy': 'aching',
  'ache': 'aching',
  'sore': 'sore',

  // Pressure pain
  'pressure': 'pressure',
  'squeezing': 'squeezing',
  'tight': 'tight',
  'tightness': 'tight',
  'constricting': 'pressure',

  // Radiating pain
  'radiating': 'radiating',
  'spreading': 'radiating',

  // Electric/Nerve pain
  'electric': 'electric',
  'electrical': 'electric',
  'shocking': 'electric',
  'zapping': 'electric',

  // Intense descriptors
  'excruciating': 'excruciating',
  'unbearable': 'unbearable',
  'intense': 'intense',
  'severe': 'severe',
  'brutal': 'severe',
};

// Body parts/locations for pain tracking (includes 1, 2, and 3-word phrases)
export const BODY_PARTS: Record<string, string> = {
  // Head/Neck - Specific
  'head': 'head',
  'temple': 'temple',
  'temples': 'temple',
  'forehead': 'forehead',
  'back of head': 'back_of_head',
  'top of head': 'top_of_head',
  'side of head': 'side_of_head',
  'base of skull': 'base_of_skull',
  'skull': 'skull',

  'neck': 'neck',
  'back of neck': 'back_of_neck',
  'side of neck': 'side_of_neck',
  'front of neck': 'front_of_neck',
  'nape': 'back_of_neck',

  'throat': 'throat',
  'jaw': 'jaw',
  'jawline': 'jaw',
  'face': 'face',
  'cheek': 'cheek',
  'cheeks': 'cheek',
  'eye': 'eye',
  'eyes': 'eye',
  'behind eyes': 'behind_eyes',
  'sinus': 'sinus',
  'sinuses': 'sinus',
  'nose': 'nose',
  'ear': 'ear',
  'ears': 'ear',

  // Mouth - Specific
  'mouth': 'mouth',
  'inside mouth': 'inside_mouth',
  'roof of mouth': 'roof_of_mouth',
  'tongue': 'tongue',
  'gums': 'gums',
  'teeth': 'teeth',
  'tooth': 'tooth',

  // Upper body - Specific
  'shoulder': 'shoulder',
  'shoulders': 'shoulder',
  'left shoulder': 'left_shoulder',
  'right shoulder': 'right_shoulder',
  'shoulder blade': 'shoulder_blade',
  'shoulder blades': 'shoulder_blade',
  'rotator cuff': 'rotator_cuff',

  'chest': 'chest',
  'upper chest': 'upper_chest',
  'lower chest': 'lower_chest',
  'center of chest': 'center_of_chest',
  'breastbone': 'breastbone',
  'sternum': 'sternum',

  'back': 'back',
  'upper back': 'upper_back',
  'mid back': 'mid_back',
  'middle back': 'mid_back',
  'lower back': 'lower_back',
  'low back': 'lower_back',
  'lumbar': 'lower_back',
  'thoracic': 'upper_back',
  'cervical': 'neck',

  'spine': 'spine',
  'tailbone': 'tailbone',
  'coccyx': 'tailbone',
  'sacrum': 'sacrum',

  'ribs': 'ribs',
  'rib': 'rib',
  'side of ribs': 'side_of_ribs',
  'rib cage': 'rib_cage',

  // Arms/Hands - Specific
  'arm': 'arm',
  'arms': 'arm',
  'left arm': 'left_arm',
  'right arm': 'right_arm',
  'upper arm': 'upper_arm',
  'lower arm': 'lower_arm',
  'bicep': 'bicep',
  'biceps': 'bicep',
  'tricep': 'tricep',
  'triceps': 'tricep',

  'elbow': 'elbow',
  'elbows': 'elbow',
  'left elbow': 'left_elbow',
  'right elbow': 'right_elbow',
  'elbow joint': 'elbow',

  'forearm': 'forearm',
  'forearms': 'forearm',

  'wrist': 'wrist',
  'wrists': 'wrist',
  'left wrist': 'left_wrist',
  'right wrist': 'right_wrist',
  'wrist joint': 'wrist',

  'hand': 'hand',
  'hands': 'hand',
  'left hand': 'left_hand',
  'right hand': 'right_hand',
  'palm': 'palm',
  'palms': 'palm',
  'back of hand': 'back_of_hand',

  'finger': 'finger',
  'fingers': 'finger',
  'fingertip': 'fingertip',
  'fingertips': 'fingertip',
  'knuckle': 'knuckle',
  'knuckles': 'knuckle',
  'thumb': 'thumb',
  'index finger': 'index_finger',
  'middle finger': 'middle_finger',
  'ring finger': 'ring_finger',
  'pinky': 'pinky',
  'pinky finger': 'pinky',

  // Lower body - Specific
  'hip': 'hip',
  'hips': 'hip',
  'left hip': 'left_hip',
  'right hip': 'right_hip',
  'hip joint': 'hip',
  'hip flexor': 'hip_flexor',
  'hip flexors': 'hip_flexor',

  'leg': 'leg',
  'legs': 'leg',
  'left leg': 'left_leg',
  'right leg': 'right_leg',
  'upper leg': 'upper_leg',
  'lower leg': 'lower_leg',

  'thigh': 'thigh',
  'thighs': 'thigh',
  'left thigh': 'left_thigh',
  'right thigh': 'right_thigh',
  'front of thigh': 'front_of_thigh',
  'back of thigh': 'back_of_thigh',
  'inner thigh': 'inner_thigh',
  'outer thigh': 'outer_thigh',
  'quad': 'quadricep',
  'quads': 'quadricep',
  'quadricep': 'quadricep',
  'quadriceps': 'quadricep',
  'hamstring': 'hamstring',
  'hamstrings': 'hamstring',

  'knee': 'knee',
  'knees': 'knee',
  'left knee': 'left_knee',
  'right knee': 'right_knee',
  'knee joint': 'knee',
  'kneecap': 'kneecap',
  'behind knee': 'behind_knee',
  'back of knee': 'back_of_knee',

  'calf': 'calf',
  'calves': 'calf',
  'left calf': 'left_calf',
  'right calf': 'right_calf',
  'calf muscle': 'calf',

  'shin': 'shin',
  'shins': 'shin',
  'shinbone': 'shin',

  'ankle': 'ankle',
  'ankles': 'ankle',
  'left ankle': 'left_ankle',
  'right ankle': 'right_ankle',
  'ankle joint': 'ankle',

  'foot': 'foot',
  'feet': 'foot',
  'left foot': 'left_foot',
  'right foot': 'right_foot',
  'top of foot': 'top_of_foot',
  'bottom of foot': 'bottom_of_foot',
  'sole': 'bottom_of_foot',
  'sole of foot': 'bottom_of_foot',
  'ball of foot': 'ball_of_foot',
  'arch': 'arch_of_foot',
  'arch of foot': 'arch_of_foot',
  'instep': 'arch_of_foot',

  'toe': 'toe',
  'toes': 'toe',
  'big toe': 'big_toe',
  'little toe': 'little_toe',

  'heel': 'heel',
  'heels': 'heel',
  'left heel': 'left_heel',
  'right heel': 'right_heel',
  'achilles': 'achilles',
  'achilles tendon': 'achilles',

  // Abdomen - Specific
  'stomach': 'stomach',
  'upper stomach': 'upper_stomach',
  'lower stomach': 'lower_stomach',
  'pit of stomach': 'pit_of_stomach',

  'abdomen': 'abdomen',
  'upper abdomen': 'upper_abdomen',
  'lower abdomen': 'lower_abdomen',
  'left abdomen': 'left_abdomen',
  'right abdomen': 'right_abdomen',

  'belly': 'belly',
  'belly button': 'belly_button',
  'navel': 'belly_button',

  'gut': 'gut',
  'intestines': 'intestines',

  'side': 'side',
  'sides': 'side',
  'left side': 'left_side',
  'right side': 'right_side',
  'flank': 'flank',

  'groin': 'groin',
  'pelvis': 'pelvis',
  'pelvic': 'pelvis',

  // Whole body
  'body': 'whole_body',
  'everywhere': 'whole_body',
  'all over': 'whole_body',
  'whole body': 'whole_body',
  'entire body': 'whole_body',
};

// Joint-specific locations (for joint pain tracking - EDS specific)
export const JOINT_LOCATIONS: Record<string, string> = {
  'jaw joint': 'tmj',
  'tmj': 'tmj',
  'shoulder joint': 'shoulder_joint',
  'elbow joint': 'elbow_joint',
  'wrist joint': 'wrist_joint',
  'finger joint': 'finger_joint',
  'finger joints': 'finger_joint',
  'knuckle': 'knuckle_joint',
  'knuckles': 'knuckle_joint',
  'hip joint': 'hip_joint',
  'knee joint': 'knee_joint',
  'ankle joint': 'ankle_joint',
  'toe joint': 'toe_joint',
  'spine joint': 'spinal_joint',
  'facet joint': 'facet_joint',
  'facet joints': 'facet_joint',
  'si joint': 'si_joint',
  'sacroiliac joint': 'si_joint',
  'all joints': 'all_joints',
  'every joint': 'all_joints',
};

// Muscle-specific locations (for muscle pain tracking - fibro specific)
export const MUSCLE_LOCATIONS: Record<string, string> = {
  'neck muscles': 'neck_muscles',
  'shoulder muscles': 'shoulder_muscles',
  'back muscles': 'back_muscles',
  'upper back muscles': 'upper_back_muscles',
  'lower back muscles': 'lower_back_muscles',
  'chest muscles': 'chest_muscles',
  'pec': 'pectoral_muscle',
  'pecs': 'pectoral_muscle',
  'pectoral': 'pectoral_muscle',
  'pectorals': 'pectoral_muscle',
  'bicep': 'bicep_muscle',
  'biceps': 'bicep_muscle',
  'tricep': 'tricep_muscle',
  'triceps': 'tricep_muscle',
  'forearm muscles': 'forearm_muscles',
  'glute': 'glute_muscle',
  'glutes': 'glute_muscle',
  'gluteal': 'glute_muscle',
  'quad': 'quadricep_muscle',
  'quads': 'quadricep_muscle',
  'quadricep': 'quadricep_muscle',
  'quadriceps': 'quadricep_muscle',
  'hamstring': 'hamstring_muscle',
  'hamstrings': 'hamstring_muscle',
  'calf muscle': 'calf_muscle',
  'calf muscles': 'calf_muscle',
  'all muscles': 'all_muscles',
  'every muscle': 'all_muscles',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()\[\]{}]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 0);
}

export function isNegated(tokens: string[], index: number): boolean {
  const lookback = 4;
  const start = Math.max(0, index - lookback);

  for (let i = start; i < index; i++) {
    if (NEGATION_WORDS.has(tokens[i]) || tokens[i].includes("n't")) {
      return true;
    }
  }

  return false;
}

/**
 * Extract numeric severity ratings from text (e.g., "7/10", "3 out of 10", "energy at 30%")
 */
export function extractNumericSeverity(text: string): Array<{
  score: number;
  maxScore: number;
  severity: 'mild' | 'moderate' | 'severe';
  symptomType: string | null;
  matchedText: string;
}> {
  const results: Array<{
    score: number;
    maxScore: number;
    severity: 'mild' | 'moderate' | 'severe';
    symptomType: string | null;
    matchedText: string;
  }> = [];
  const textLower = text.toLowerCase();

  // Pattern 1: X out of 10, X/10, X out of Y
  const patterns = [
    /(\d+(?:\.\d+)?)\s*out\s*of\s*(\d+)/g,  // "3 out of 10"
    /(\d+(?:\.\d+)?)\/(\d+)/g,               // "7/10"
    /(\d+(?:\.\d+)?)\s*(?:out|of)\s*(\d+)/g, // "5 out 10"
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(textLower)) !== null) {
      const score = parseFloat(match[1]);
      const maxScore = parseFloat(match[2]);
      const normalized = score / maxScore;

      let severity: 'mild' | 'moderate' | 'severe';
      if (normalized <= 0.3) {
        severity = 'mild';
      } else if (normalized <= 0.6) {
        severity = 'moderate';
      } else {
        severity = 'severe';
      }

      // Try to find what symptom this relates to
      const startPos = Math.max(0, match.index - 50);
      const context = textLower.substring(startPos, match.index);

      // Find the CLOSEST symptom keyword (rightmost match in context)
      let symptomType: string | null = null;
      let closestPos = -1;

      // Check for energy/fatigue
      for (const keyword of ['energy', 'fatigue', 'tired', 'exhaust']) {
        const pos = context.lastIndexOf(keyword);
        if (pos > closestPos) {
          closestPos = pos;
          symptomType = 'fatigue';
        }
      }

      // Check for pain (only if closer than current match)
      for (const keyword of ['pain', 'hurt', 'ache']) {
        const pos = context.lastIndexOf(keyword);
        if (pos > closestPos) {
          closestPos = pos;
          symptomType = 'pain';
        }
      }

      // Check for brain fog (only if closer than current match)
      const fogPos = context.lastIndexOf('fog');
      const brainPos = context.lastIndexOf('brain');
      if (fogPos > closestPos && brainPos >= 0 && Math.abs(fogPos - brainPos) < 10) {
        closestPos = fogPos;
        symptomType = 'brain_fog';
      }

      results.push({
        score,
        maxScore,
        severity,
        symptomType,
        matchedText: match[0],
      });
    }
  }

  // Pattern 2: Percentage (e.g., "energy at 30%")
  const percentagePattern = /(\d+)%/g;
  let match;
  while ((match = percentagePattern.exec(textLower)) !== null) {
    const percentage = parseFloat(match[1]);
    const normalized = percentage / 100;

    let severity: 'mild' | 'moderate' | 'severe';
    if (normalized <= 0.3) {
      severity = 'mild';
    } else if (normalized <= 0.6) {
      severity = 'moderate';
    } else {
      severity = 'severe';
    }

    // Look for context
    const startPos = Math.max(0, match.index - 30);
    const context = textLower.substring(startPos, match.index);

    let symptomType: string | null = null;
    for (const keyword of ['energy', 'fatigue']) {
      if (context.includes(keyword)) {
        symptomType = 'fatigue';
        break;
      }
    }

    if (symptomType) {
      results.push({
        score: percentage,
        maxScore: 100,
        severity,
        symptomType,
        matchedText: match[0],
      });
    }
  }

  return results;
}

/**
 * Detect comparative language (worse/better than yesterday, etc.)
 */
export function detectComparative(text: string): 'worse' | 'better' | 'same' | null {
  const textLower = text.toLowerCase();

  for (const [phrase, direction] of Object.entries(COMPARATIVE_PATTERNS)) {
    if (textLower.includes(phrase)) {
      return direction;
    }
  }

  return null;
}

/**
 * Find severity from context around a symptom
 */
export function findSeverity(
  text: string,
  symptomIndex: number
): 'mild' | 'moderate' | 'severe' | null {
  const tokens = tokenize(text);
  const lookRange = 5;
  const start = Math.max(0, symptomIndex - lookRange);
  const end = Math.min(tokens.length, symptomIndex + lookRange);

  for (let i = start; i < end; i++) {
    const token = tokens[i];
    if (SEVERITY_INDICATORS[token]) {
      return SEVERITY_INDICATORS[token];
    }
  }

  const surroundingText = tokens.slice(start, end).join(' ');
  for (const [phrase, severity] of Object.entries(SEVERITY_INDICATORS)) {
    if (surroundingText.includes(phrase)) {
      return severity;
    }
  }

  return null;
}

/**
 * Assign default severity to a symptom based on context and heuristics
 */
export function assignDefaultSeverity(
  symptom: string,
  text: string,
  detectedSeverity: 'mild' | 'moderate' | 'severe' | null
): 'mild' | 'moderate' | 'severe' {
  // If we already detected severity, use it
  if (detectedSeverity) {
    return detectedSeverity;
  }

  // Check if symptom has a default severity
  if (DEFAULT_SEVERITY_BY_SYMPTOM[symptom]) {
    return DEFAULT_SEVERITY_BY_SYMPTOM[symptom];
  }

  // Check for comparative language
  const comparative = detectComparative(text);
  if (comparative === 'worse') {
    return 'severe';
  } else if (comparative === 'better') {
    return 'mild';
  }

  // Default to moderate if no other information
  return 'moderate';
}

/**
 * Extract detailed pain information including qualifiers and body locations
 *
 * Examples:
 * - "burning pain in shoulders" -> {qualifiers: ["burning"], location: "shoulder"}
 * - "severe sharp stabbing pain in my neck" -> {qualifiers: ["sharp", "stabbing"], location: "neck", severity: "severe"}
 * - "cramping in my calves" -> {qualifiers: ["cramping"], location: "calf"}
 */
export function extractPainDetails(text: string): Array<{
  qualifiers: string[];
  location: string | null;
  severity: 'mild' | 'moderate' | 'severe' | null;
  matchedText: string;
}> {
  const tokens = tokenize(text);
  const painDetails: Array<{
    qualifiers: string[];
    location: string | null;
    severity: 'mild' | 'moderate' | 'severe' | null;
    matchedText: string;
  }> = [];

  // Pain-related words that trigger pain detail extraction
  const painWords = new Set(['pain', 'hurt', 'hurts', 'hurting', 'ache', 'aches', 'aching', 'sore', 'soreness']);

  // Find all pain mentions in the text
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Check if this is a pain word OR a pain qualifier (cramping, burning, etc.)
    const isPainWord = painWords.has(token);
    const isQualifier = PAIN_QUALIFIERS[token] !== undefined;

    if (isPainWord || isQualifier) {
      const qualifiers: string[] = [];
      let location: string | null = null;
      let severity: 'mild' | 'moderate' | 'severe' | null = null;
      let startIndex = i;
      let endIndex = i;

      // Search backwards for qualifiers and severity (within 6 tokens)
      const lookbackStart = Math.max(0, i - 6);
      for (let j = i - 1; j >= lookbackStart; j--) {
        const prevToken = tokens[j];

        // Check for pain qualifiers
        if (PAIN_QUALIFIERS[prevToken]) {
          qualifiers.unshift(PAIN_QUALIFIERS[prevToken]);
          startIndex = j;
        }

        // Check for severity indicators
        if (SEVERITY_INDICATORS[prevToken]) {
          severity = SEVERITY_INDICATORS[prevToken];
          startIndex = j;
        }
      }

      // If current token is a qualifier, add it
      if (isQualifier) {
        qualifiers.push(PAIN_QUALIFIERS[token]);
      }

      // Search forward for body parts (within 7 tokens)
      const lookforwardEnd = Math.min(tokens.length, i + 8);
      for (let j = i; j < lookforwardEnd; j++) {
        const nextToken = tokens[j];

        // Check for 3-word phrases first (most specific)
        if (j < tokens.length - 2) {
          const threeWordPhrase = `${nextToken} ${tokens[j + 1]} ${tokens[j + 2]}`;
          // Check in order of specificity: joints, muscles, then body parts
          if (JOINT_LOCATIONS[threeWordPhrase]) {
            location = JOINT_LOCATIONS[threeWordPhrase];
            endIndex = j + 2;
            break;
          } else if (MUSCLE_LOCATIONS[threeWordPhrase]) {
            location = MUSCLE_LOCATIONS[threeWordPhrase];
            endIndex = j + 2;
            break;
          } else if (BODY_PARTS[threeWordPhrase]) {
            location = BODY_PARTS[threeWordPhrase];
            endIndex = j + 2;
            break;
          }
        }

        // Check for 2-word phrases (e.g., "upper back", "lower back")
        if (j < tokens.length - 1) {
          const twoWordPhrase = `${nextToken} ${tokens[j + 1]}`;
          if (JOINT_LOCATIONS[twoWordPhrase]) {
            location = JOINT_LOCATIONS[twoWordPhrase];
            endIndex = j + 1;
            break;
          } else if (MUSCLE_LOCATIONS[twoWordPhrase]) {
            location = MUSCLE_LOCATIONS[twoWordPhrase];
            endIndex = j + 1;
            break;
          } else if (BODY_PARTS[twoWordPhrase]) {
            location = BODY_PARTS[twoWordPhrase];
            endIndex = j + 1;
            break;
          }
        }

        // Check for single-word body parts (least specific)
        if (JOINT_LOCATIONS[nextToken]) {
          location = JOINT_LOCATIONS[nextToken];
          endIndex = j;
          break;
        } else if (MUSCLE_LOCATIONS[nextToken]) {
          location = MUSCLE_LOCATIONS[nextToken];
          endIndex = j;
          break;
        } else if (BODY_PARTS[nextToken]) {
          location = BODY_PARTS[nextToken];
          endIndex = j;
          break;
        }
      }

      // Only add if we found qualifiers or location (otherwise it's just generic pain)
      if (qualifiers.length > 0 || location !== null) {
        // Remove duplicates from qualifiers
        const uniqueQualifiers = [...new Set(qualifiers)];

        // Extract the matched text
        const matchedText = tokens.slice(startIndex, endIndex + 1).join(' ');

        painDetails.push({
          qualifiers: uniqueQualifiers.length > 0 ? uniqueQualifiers : [],
          location,
          severity,
          matchedText,
        });
      }
    }
  }

  return painDetails;
}

// ============================================================================
// SPOON THEORY EXTRACTION
// ============================================================================

/**
 * Common spoon theory phrases and patterns
 * Spoon theory is used by chronic illness patients to describe energy levels
 */
const SPOON_PHRASES: Record<string, 'current' | 'used' | 'started' | 'zero'> = {
  'out of spoons': 'zero',
  'no spoons': 'zero',
  'zero spoons': 'zero',
  'negative spoons': 'zero',
  'spoon deficit': 'zero',
  'no spoons left': 'zero',
  'completely out of spoons': 'zero',
  'ran out of spoons': 'zero',
  'spoons left': 'current',
  'spoons remaining': 'current',
  'have spoons': 'current',
  'got spoons': 'current',
  'spoons today': 'current',
  'used spoons': 'used',
  'spent spoons': 'used',
  'cost spoons': 'used',
  'took spoons': 'used',
  'started with spoons': 'started',
  'began with spoons': 'started',
  'woke up with spoons': 'started',
};

/**
 * Extract spoon count from text for energy level tracking
 *
 * Examples:
 * - "I only have 2 spoons left" -> { current: 2, energyLevel: 2 }
 * - "Started with 5 spoons, used 3" -> { started: 5, used: 3, current: 2, energyLevel: 2 }
 * - "Completely out of spoons" -> { current: 0, energyLevel: 0 }
 * - "Running on negative spoons" -> { current: 0, energyLevel: 0 }
 */
export function extractSpoonCount(text: string): SpoonCount | null {
  const textLower = text.toLowerCase();

  let current: number | undefined;
  let used: number | undefined;
  let started: number | undefined;

  // Check for zero-spoon phrases first (no numbers needed)
  for (const [phrase, type] of Object.entries(SPOON_PHRASES)) {
    if (textLower.includes(phrase) && type === 'zero') {
      return {
        current: 0,
        energyLevel: 0,
      };
    }
  }

  // Pattern: "X spoons" with context
  // Matches: "2 spoons left", "have 3 spoons", "only 1 spoon"
  const spoonPatterns = [
    // "have/got/only X spoon(s)"
    /(?:have|got|only|just)\s+(\d+)\s+spoons?/gi,
    // "X spoon(s) left/remaining/today"
    /(\d+)\s+spoons?\s+(?:left|remaining|today)/gi,
    // "started/began/woke with X spoon(s)"
    /(?:started|began|woke(?:\s+up)?)\s+(?:with\s+)?(\d+)\s+spoons?/gi,
    // "used/spent/cost X spoon(s)"
    /(?:used|spent|cost|took)\s+(\d+)\s+spoons?/gi,
    // Simple "X spoons" at word boundary
    /\b(\d+)\s+spoons?\b/gi,
  ];

  // Extract numbers with spoon context
  for (const pattern of spoonPatterns) {
    let match;
    while ((match = pattern.exec(textLower)) !== null) {
      const num = parseInt(match[1], 10);
      const context = textLower.substring(Math.max(0, match.index - 20), match.index);
      const afterContext = textLower.substring(match.index, Math.min(textLower.length, match.index + match[0].length + 20));

      // Determine type based on context
      if (context.includes('started') || context.includes('began') || context.includes('woke')) {
        started = num;
      } else if (context.includes('used') || context.includes('spent') || context.includes('cost') || context.includes('took')) {
        used = num;
      } else if (afterContext.includes('left') || afterContext.includes('remaining') ||
                 context.includes('have') || context.includes('got') || context.includes('only')) {
        current = num;
      } else if (current === undefined) {
        // Default to current if no other context
        current = num;
      }
    }
  }

  // Calculate current from started - used if we have both
  if (started !== undefined && used !== undefined && current === undefined) {
    current = Math.max(0, started - used);
  }

  // If we found any spoon data, return it
  if (current !== undefined || started !== undefined || used !== undefined) {
    // Normalize to 0-10 energy level (assuming typical spoon count is 0-12)
    // Most people describe having 5-10 spoons on a good day
    const effectiveCurrent = current ?? (started !== undefined && used !== undefined ? started - used : 5);
    const energyLevel = Math.min(10, Math.max(0, Math.round(effectiveCurrent * (10 / 12) * 10) / 10));

    return {
      current: current ?? effectiveCurrent,
      used,
      started,
      energyLevel,
    };
  }

  return null;
}

// ============================================================================
// ACTIVITY TRIGGER DETECTION
// ============================================================================

/**
 * Activities that commonly trigger symptoms in chronic illness
 */
const TRIGGER_ACTIVITIES: Record<string, string> = {
  // Physical activities
  'walking': 'walking',
  'walked': 'walking',
  'walk': 'walking',
  'standing': 'standing',
  'stood': 'standing',
  'stand': 'standing',
  'sitting': 'sitting',
  'sat': 'sitting',
  'showering': 'showering',
  'shower': 'showering',
  'showered': 'showering',
  'bathing': 'bathing',
  'bath': 'bathing',
  'cooking': 'cooking',
  'cooked': 'cooking',
  'cleaning': 'cleaning',
  'cleaned': 'cleaning',
  'exercising': 'exercise',
  'exercise': 'exercise',
  'exercised': 'exercise',
  'workout': 'exercise',
  'working out': 'exercise',
  'running': 'running',
  'ran': 'running',
  'jogging': 'jogging',
  'climbing': 'climbing',
  'stairs': 'climbing_stairs',
  'lifting': 'lifting',
  'carrying': 'carrying',
  'bending': 'bending',
  'reaching': 'reaching',
  'stretching': 'stretching',

  // Daily activities
  'shopping': 'shopping',
  'groceries': 'shopping',
  'driving': 'driving',
  'drove': 'driving',
  'commuting': 'commuting',
  'commute': 'commuting',
  'working': 'working',
  'work': 'working',
  'worked': 'working',

  // Social/Mental
  'socializing': 'socializing',
  'social': 'socializing',
  'talking': 'talking',
  'conversation': 'talking',
  'meeting': 'meeting',
  'appointment': 'appointment',
  'doctor': 'medical_appointment',
  'visiting': 'visiting',
  'visit': 'visiting',

  // Screen/Cognitive
  'reading': 'reading',
  'screen': 'screen_time',
  'screens': 'screen_time',
  'computer': 'screen_time',
  'phone': 'screen_time',
  'typing': 'typing',
  'concentrating': 'concentrating',
  'thinking': 'thinking',

  // Food/Drink
  'eating': 'eating',
  'ate': 'eating',
  'meal': 'eating',
  'drinking': 'drinking',
  'caffeine': 'caffeine',
  'coffee': 'caffeine',
  'alcohol': 'alcohol',

  // Environmental
  'heat': 'heat_exposure',
  'sun': 'sun_exposure',
  'cold': 'cold_exposure',
  'noise': 'noise_exposure',
  'lights': 'light_exposure',
  'bright': 'light_exposure',
};

/**
 * Trigger timeframe indicators
 */
const TRIGGER_TIMEFRAMES: Record<string, string> = {
  'after': 'after',
  'from': 'from',
  'following': 'after',
  'since': 'since',
  'during': 'during',
  'while': 'during',
  'when': 'when',
  'because of': 'from',
  'due to': 'from',
  'caused by': 'from',
  'triggered by': 'from',
  'thanks to': 'from',
  'every time': 'every_time',
  'whenever': 'every_time',
};

/**
 * Symptoms commonly linked to activity triggers
 */
const TRIGGER_LINKED_SYMPTOMS = new Set([
  'pem', 'crash', 'fatigue', 'exhaustion', 'flare',
  'dizziness', 'orthostatic', 'presyncope', 'fainting',
  'pain', 'muscle_pain', 'headache',
  'brain_fog', 'nausea', 'palpitations',
  'shortness_of_breath', 'weakness',
]);

/**
 * Extract activity triggers and link them to symptoms
 *
 * Examples:
 * - "After walking I crashed" -> PEM with trigger { activity: "walking", timeframe: "after" }
 * - "Standing too long made me dizzy" -> dizziness with trigger { activity: "standing" }
 * - "Crashed from the shower" -> PEM with trigger { activity: "showering", timeframe: "from" }
 */
export function extractActivityTriggers(text: string): Map<number, ActivityTrigger> {
  const textLower = text.toLowerCase();
  const tokens = tokenize(text);
  const triggers = new Map<number, ActivityTrigger>();

  // Find activity mentions with timeframe context
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    // Check if this token is an activity
    if (TRIGGER_ACTIVITIES[token]) {
      const activity = TRIGGER_ACTIVITIES[token];
      let timeframe: string | undefined;

      // Look backwards for timeframe indicators (within 4 tokens)
      for (let j = Math.max(0, i - 4); j < i; j++) {
        const prevToken = tokens[j];
        // Check single words
        if (TRIGGER_TIMEFRAMES[prevToken]) {
          timeframe = TRIGGER_TIMEFRAMES[prevToken];
          break;
        }
        // Check two-word phrases
        if (j < i - 1) {
          const twoWord = `${prevToken} ${tokens[j + 1]}`;
          if (TRIGGER_TIMEFRAMES[twoWord]) {
            timeframe = TRIGGER_TIMEFRAMES[twoWord];
            break;
          }
        }
      }

      // Look forward for symptom indicators (within 8 tokens)
      // This helps us know if this activity is mentioned as a trigger
      let hasSymptomNearby = false;
      for (let j = i + 1; j < Math.min(tokens.length, i + 8); j++) {
        const nextToken = tokens[j];
        if (SYMPTOM_LEMMAS[nextToken] || TRIGGER_LINKED_SYMPTOMS.has(nextToken)) {
          hasSymptomNearby = true;
          break;
        }
      }

      // Also check if symptom was mentioned before (for "crashed from walking" pattern)
      if (!hasSymptomNearby) {
        for (let j = Math.max(0, i - 6); j < i; j++) {
          const prevToken = tokens[j];
          if (SYMPTOM_LEMMAS[prevToken] || TRIGGER_LINKED_SYMPTOMS.has(prevToken)) {
            hasSymptomNearby = true;
            break;
          }
        }
      }

      // If there's a symptom nearby, store the trigger
      if (hasSymptomNearby || timeframe) {
        triggers.set(i, {
          activity,
          timeframe,
        });
      }
    }
  }

  return triggers;
}

// ============================================================================
// CONFIDENCE SCORING
// ============================================================================

/**
 * Calculate confidence score for an extracted symptom
 *
 * Confidence is based on:
 * - Extraction method (phrase > lemma)
 * - Match specificity (longer matches = higher confidence)
 * - Context clarity (severity indicators, body parts mentioned)
 * - Negation proximity (closer negation = lower confidence)
 */
export function calculateConfidence(
  symptom: ExtractedSymptom,
  text: string,
  matchIndex: number
): number {
  let confidence = 0.5; // Base confidence

  // Method bonus: phrases are more specific than lemmas
  if (symptom.method === 'phrase') {
    confidence += 0.25;
  } else if (symptom.method === 'lemma') {
    confidence += 0.1;
  }

  // Match length bonus: longer matches are more specific
  const matchLength = symptom.matched.split(' ').length;
  if (matchLength >= 3) {
    confidence += 0.15;
  } else if (matchLength === 2) {
    confidence += 0.1;
  }

  // Severity indicator bonus: explicit severity adds confidence
  if (symptom.severity) {
    confidence += 0.05;
  }

  // Pain details bonus: having qualifiers/location adds specificity
  if (symptom.painDetails) {
    if (symptom.painDetails.qualifiers.length > 0) {
      confidence += 0.05;
    }
    if (symptom.painDetails.location) {
      confidence += 0.05;
    }
  }

  // Trigger bonus: having an activity trigger adds context
  if (symptom.trigger) {
    confidence += 0.05;
  }

  // Clamp to 0-1 range
  return Math.min(1, Math.max(0, Math.round(confidence * 100) / 100));
}

/**
 * Add confidence scores to all extracted symptoms
 */
function addConfidenceScores(
  symptoms: ExtractedSymptom[],
  text: string
): ExtractedSymptom[] {
  const textLower = text.toLowerCase();

  return symptoms.map(symptom => {
    // Find the match position in text
    const matchIndex = textLower.indexOf(symptom.matched.toLowerCase());

    return {
      ...symptom,
      confidence: calculateConfidence(symptom, text, matchIndex),
    };
  });
}

// ============================================================================
// SYMPTOM DURATION EXTRACTION
// ============================================================================

/**
 * Duration unit mappings
 */
const DURATION_UNITS: Record<string, SymptomDuration['unit']> = {
  'minute': 'minutes',
  'minutes': 'minutes',
  'min': 'minutes',
  'mins': 'minutes',
  'hour': 'hours',
  'hours': 'hours',
  'hr': 'hours',
  'hrs': 'hours',
  'day': 'days',
  'days': 'days',
  'week': 'weeks',
  'weeks': 'weeks',
};

/**
 * Duration qualifier phrases
 */
const DURATION_QUALIFIERS: Record<string, SymptomDuration['qualifier']> = {
  'all day': 'all',
  'all night': 'all',
  'all morning': 'all',
  'all afternoon': 'all',
  'all evening': 'all',
  'the whole day': 'all',
  'the whole night': 'all',
  'entire day': 'all',
  'entire night': 'all',
  'half the day': 'half',
  'half the night': 'half',
  'half day': 'half',
  'most of the day': 'most_of',
  'most of the night': 'most_of',
  'most of today': 'most_of',
};

/**
 * Ongoing symptom indicators
 */
const ONGOING_INDICATORS = new Set([
  'still',
  'ongoing',
  'continuous',
  'constantly',
  'nonstop',
  'non-stop',
  'persistent',
  'persistently',
  'unrelenting',
  'relentless',
]);

/**
 * Extract symptom duration from text
 *
 * Examples:
 * - "Headache for 3 hours" -> { value: 3, unit: "hours" }
 * - "Pain all day" -> { qualifier: "all", unit: "days" }
 * - "Nausea since Tuesday" -> { since: "Tuesday" }
 * - "Still have the headache" -> { ongoing: true }
 */
export function extractDuration(text: string): SymptomDuration | null {
  const textLower = text.toLowerCase();

  // Check for ongoing indicators
  const tokens = tokenize(text);
  const hasOngoing = tokens.some(t => ONGOING_INDICATORS.has(t));

  // Check for qualifier phrases first ("all day", "half the night", etc.)
  for (const [phrase, qualifier] of Object.entries(DURATION_QUALIFIERS)) {
    if (textLower.includes(phrase)) {
      // Determine unit from phrase
      let unit: SymptomDuration['unit'] = 'days';
      if (phrase.includes('night') || phrase.includes('evening')) {
        unit = 'hours'; // Night/evening implies hours
      } else if (phrase.includes('morning') || phrase.includes('afternoon')) {
        unit = 'hours';
      }

      return {
        qualifier,
        unit,
        ongoing: hasOngoing || undefined,
      };
    }
  }

  // Pattern: "for X hours/days/etc."
  const forPattern = /for\s+(\d+)\s+(minutes?|mins?|hours?|hrs?|days?|weeks?)/gi;
  let match = forPattern.exec(textLower);
  if (match) {
    return {
      value: parseInt(match[1], 10),
      unit: DURATION_UNITS[match[2].toLowerCase().replace(/s$/, '')] || 'hours',
      ongoing: hasOngoing || undefined,
    };
  }

  // Pattern: "X hours/days of pain"
  const ofPattern = /(\d+)\s+(minutes?|mins?|hours?|hrs?|days?|weeks?)\s+of/gi;
  match = ofPattern.exec(textLower);
  if (match) {
    return {
      value: parseInt(match[1], 10),
      unit: DURATION_UNITS[match[2].toLowerCase().replace(/s$/, '')] || 'hours',
      ongoing: hasOngoing || undefined,
    };
  }

  // Pattern: "since [day/time reference]"
  const sincePattern = /since\s+(yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|this morning|last night|the morning|tonight)/gi;
  match = sincePattern.exec(textLower);
  if (match) {
    return {
      since: match[1],
      ongoing: true,
    };
  }

  // Pattern: "lasted X hours"
  const lastedPattern = /lasted\s+(\d+)\s+(minutes?|mins?|hours?|hrs?|days?|weeks?)/gi;
  match = lastedPattern.exec(textLower);
  if (match) {
    return {
      value: parseInt(match[1], 10),
      unit: DURATION_UNITS[match[2].toLowerCase().replace(/s$/, '')] || 'hours',
    };
  }

  // Just ongoing indicator without duration
  if (hasOngoing) {
    return { ongoing: true };
  }

  return null;
}

// ============================================================================
// TIME OF DAY EXTRACTION
// ============================================================================

/**
 * Time of day patterns
 */
const TIME_OF_DAY_PATTERNS: Record<string, TimeOfDay> = {
  // Morning
  'morning': 'morning',
  'this morning': 'morning',
  'in the morning': 'morning',
  'when i woke up': 'morning',
  'woke up with': 'morning',
  'waking up': 'morning',
  'first thing': 'morning',
  'am': 'morning',

  // Afternoon
  'afternoon': 'afternoon',
  'this afternoon': 'afternoon',
  'in the afternoon': 'afternoon',
  'midday': 'afternoon',
  'lunch': 'afternoon',
  'after lunch': 'afternoon',

  // Evening
  'evening': 'evening',
  'this evening': 'evening',
  'in the evening': 'evening',
  'dinner': 'evening',
  'after dinner': 'evening',
  'end of day': 'evening',

  // Night
  'night': 'night',
  'tonight': 'night',
  'at night': 'night',
  'during the night': 'night',
  'last night': 'night',
  'overnight': 'night',
  'nighttime': 'night',
  'middle of the night': 'night',
  'pm': 'night',
  'before bed': 'night',
  'bedtime': 'night',
  'while sleeping': 'night',

  // All day
  'all day': 'all_day',
  'the whole day': 'all_day',
  'entire day': 'all_day',
  'constantly': 'all_day',
  'nonstop': 'all_day',
  '24/7': 'all_day',
};

/**
 * Extract time of day when symptom occurred
 *
 * Examples:
 * - "Morning headache" -> "morning"
 * - "Worse at night" -> "night"
 * - "Woke up with pain" -> "morning"
 * - "Pain all day" -> "all_day"
 */
export function extractTimeOfDay(text: string): TimeOfDay | null {
  const textLower = text.toLowerCase();

  // Check phrases from longest to shortest for accuracy
  const sortedPatterns = Object.entries(TIME_OF_DAY_PATTERNS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [phrase, timeOfDay] of sortedPatterns) {
    if (textLower.includes(phrase)) {
      return timeOfDay;
    }
  }

  return null;
}

/**
 * Add duration and time-of-day to symptoms
 */
/**
 * Find all temporal markers with their positions in text
 */
function findTemporalMarkers(text: string): Array<{
  position: number;
  timeOfDay?: TimeOfDay;
  duration?: SymptomDuration;
  phrase: string;
}> {
  const textLower = text.toLowerCase();
  const markers: Array<{
    position: number;
    timeOfDay?: TimeOfDay;
    duration?: SymptomDuration;
    phrase: string;
  }> = [];

  // Find time of day markers
  const sortedTimePatterns = Object.entries(TIME_OF_DAY_PATTERNS)
    .sort((a, b) => b[0].length - a[0].length);

  for (const [phrase, timeOfDay] of sortedTimePatterns) {
    const pos = textLower.indexOf(phrase);
    if (pos !== -1) {
      markers.push({ position: pos, timeOfDay, phrase });
    }
  }

  // Find duration markers - "all day", "since yesterday", etc.
  for (const [phrase, qualifier] of Object.entries(DURATION_QUALIFIERS)) {
    const pos = textLower.indexOf(phrase);
    if (pos !== -1) {
      let unit: SymptomDuration['unit'] = 'days';
      if (phrase.includes('night') || phrase.includes('evening')) {
        unit = 'hours';
      }
      markers.push({
        position: pos,
        duration: { qualifier, unit },
        phrase,
      });
    }
  }

  // Find "since X" patterns
  const sincePattern = /since\s+(yesterday|monday|tuesday|wednesday|thursday|friday|saturday|sunday|this morning|last night)/gi;
  let match;
  while ((match = sincePattern.exec(textLower)) !== null) {
    markers.push({
      position: match.index,
      duration: { since: match[1], ongoing: true },
      phrase: match[0],
    });
  }

  // Find "for X hours" patterns
  const forPattern = /for\s+(\d+)\s+(minutes?|mins?|hours?|hrs?|days?|weeks?)/gi;
  while ((match = forPattern.exec(textLower)) !== null) {
    markers.push({
      position: match.index,
      duration: {
        value: parseInt(match[1], 10),
        unit: DURATION_UNITS[match[2].toLowerCase().replace(/s$/, '')] || 'hours',
      },
      phrase: match[0],
    });
  }

  return markers;
}

function addTemporalInfo(
  symptoms: ExtractedSymptom[],
  text: string
): ExtractedSymptom[] {
  const markers = findTemporalMarkers(text);

  // If no temporal markers found, return as-is
  if (markers.length === 0) {
    return symptoms;
  }

  const textLower = text.toLowerCase();

  // For each symptom, find if there's a temporal marker nearby
  return symptoms.map(symptom => {
    // Find where this symptom appears in the text
    const symptomPos = textLower.indexOf(symptom.matched.toLowerCase());
    if (symptomPos === -1) {
      return symptom;
    }

    // Find the closest temporal marker within 50 characters
    let closestTimeOfDay: TimeOfDay | undefined;
    let closestDuration: SymptomDuration | undefined;
    let closestTimeDistance = 50;
    let closestDurationDistance = 50;

    for (const marker of markers) {
      const distance = Math.abs(marker.position - symptomPos);

      // Link time of day if close enough
      if (marker.timeOfDay && distance < closestTimeDistance) {
        closestTimeDistance = distance;
        closestTimeOfDay = marker.timeOfDay;
      }

      // Link duration if close enough
      if (marker.duration && distance < closestDurationDistance) {
        closestDurationDistance = distance;
        closestDuration = marker.duration;
      }
    }

    return {
      ...symptom,
      ...(closestTimeOfDay && { timeOfDay: closestTimeOfDay }),
      ...(closestDuration && { duration: closestDuration }),
    };
  });
}

/**
 * Link extracted symptoms to their potential triggers using character-based proximity.
 * Only links the trigger to the CLOSEST symptom, not all symptoms within range.
 */
function linkTriggersToSymptoms(
  symptoms: ExtractedSymptom[],
  triggers: Map<number, ActivityTrigger>,
  tokens: string[],
  text: string
): ExtractedSymptom[] {
  if (triggers.size === 0) return symptoms;

  const textLower = text.toLowerCase();

  // Convert token positions to character positions
  const triggerCharPositions: Array<{ pos: number; trigger: ActivityTrigger }> = [];
  let charPos = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (triggers.has(i)) {
      // Find actual position in text
      const tokenPos = textLower.indexOf(tokens[i], charPos);
      if (tokenPos !== -1) {
        triggerCharPositions.push({ pos: tokenPos, trigger: triggers.get(i)! });
        charPos = tokenPos + tokens[i].length;
      }
    }
  }

  if (triggerCharPositions.length === 0) return symptoms;

  // For each trigger, find the CLOSEST symptom and link only that one
  const symptomTriggerMap = new Map<string, ActivityTrigger>();

  for (const { pos: triggerPos, trigger } of triggerCharPositions) {
    let closestSymptomId: string | undefined;
    let closestDistance = 40; // Max 40 characters proximity

    for (const symptom of symptoms) {
      // Only consider symptoms that can have triggers
      if (!TRIGGER_LINKED_SYMPTOMS.has(symptom.symptom)) continue;

      // Find symptom position in text
      const symptomPos = textLower.indexOf(symptom.matched.toLowerCase());
      if (symptomPos === -1) continue;

      const distance = Math.abs(symptomPos - triggerPos);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSymptomId = symptom.id || `${symptom.symptom}_${symptom.matched}`;
      }
    }

    // Link trigger only to closest symptom
    if (closestSymptomId) {
      symptomTriggerMap.set(closestSymptomId, trigger);
    }
  }

  // Apply triggers to symptoms
  return symptoms.map(symptom => {
    const symptomKey = symptom.id || `${symptom.symptom}_${symptom.matched}`;
    const trigger = symptomTriggerMap.get(symptomKey);
    if (trigger) {
      return { ...symptom, trigger };
    }
    return symptom;
  });
}

/**
 * Extract symptoms from text
 * @param text - The input text to analyze
 * @param customLemmas - Optional map of custom user words to symptoms
 */
export function extractSymptoms(
  text: string,
  customLemmas?: Record<string, string>
): ExtractionResult {
  const textLower = text.toLowerCase();
  const foundSymptoms: ExtractedSymptom[] = [];
  const foundCategories = new Set<string>();

  // Merge standard lemmas with custom lemmas (custom takes precedence)
  const allLemmas = customLemmas
    ? { ...SYMPTOM_LEMMAS, ...customLemmas }
    : SYMPTOM_LEMMAS;

  // Step 1: Extract numeric severity ratings
  const numericSeverities = extractNumericSeverity(text);
  const severityMap = new Map<string, 'mild' | 'moderate' | 'severe'>();

  for (const numericSev of numericSeverities) {
    if (numericSev.symptomType) {
      severityMap.set(numericSev.symptomType, numericSev.severity);

      // Add the symptom if not already detected
      if (!foundCategories.has(numericSev.symptomType)) {
        foundSymptoms.push({
          symptom: numericSev.symptomType,
          matched: numericSev.matchedText,
          method: 'phrase',
          severity: numericSev.severity,
        });
        foundCategories.add(numericSev.symptomType);
      }
    }
  }

  // Step 1.5: Extract detailed pain information
  const painDetailsArray = extractPainDetails(text);
  const painDetailsMap = new Map<string, typeof painDetailsArray[0]>();

  // For each pain detail, create a specific symptom based on location
  for (const painDetail of painDetailsArray) {
    let painSymptom = 'pain';

    // Create more specific pain symptom based on location
    if (painDetail.location) {
      if (painDetail.location === 'head' || painDetail.location === 'temple' || painDetail.location === 'forehead') {
        painSymptom = 'headache';
      } else if (painDetail.location === 'neck') {
        painSymptom = 'neck_pain';
      } else if (painDetail.location === 'back' || painDetail.location === 'upper_back' || painDetail.location === 'lower_back') {
        painSymptom = 'back_pain';
      } else if (painDetail.location === 'shoulder' || painDetail.location === 'arm' || painDetail.location === 'hand') {
        painSymptom = 'pain';  // Keep as general pain with location details
      } else if (painDetail.location === 'leg' || painDetail.location === 'knee' || painDetail.location === 'calf' || painDetail.location === 'ankle' || painDetail.location === 'foot') {
        painSymptom = 'pain';  // Keep as general pain with location details
      } else if (painDetail.location === 'stomach' || painDetail.location === 'abdomen' || painDetail.location === 'belly') {
        painSymptom = 'gi_pain';
      } else if (painDetail.location === 'chest') {
        painSymptom = 'chest_pain';
      } else if (painDetail.location === 'whole_body') {
        painSymptom = 'pain';
      }
    }

    // Store pain details for later attachment
    painDetailsMap.set(painSymptom, painDetail);

    // Add the pain symptom if not already detected
    if (!foundCategories.has(painSymptom)) {
      foundSymptoms.push({
        symptom: painSymptom,
        matched: painDetail.matchedText,
        method: 'phrase',
        severity: painDetail.severity || assignDefaultSeverity(painSymptom, text, null),
        painDetails: {
          qualifiers: painDetail.qualifiers,
          location: painDetail.location,
        },
      });
      foundCategories.add(painSymptom);
    }
  }

  // Step 2: Extract phrase-based symptoms
  const sortedPhrases = Object.entries(SYMPTOM_PHRASES).sort(
    (a, b) => b[0].length - a[0].length
  );

  for (const [phrase, symptom] of sortedPhrases) {
    if (textLower.includes(phrase) && !foundCategories.has(symptom)) {
      const phraseIndex = textLower.indexOf(phrase);
      const detectedSeverity = findSeverity(textLower, phraseIndex);

      // Use numeric severity if available, otherwise use detected or default
      const finalSeverity = severityMap.get(symptom) ||
                           assignDefaultSeverity(symptom, text, detectedSeverity);

      foundSymptoms.push({
        symptom,
        matched: phrase,
        method: 'phrase',
        severity: finalSeverity,
      });
      foundCategories.add(symptom);
    }
  }

  // Step 2.5: Extract multi-word custom lemmas (phrases)
  // Custom lemmas can be multi-word phrases like "brain is shit"
  // These need to be matched as phrases before single-word tokenization
  if (customLemmas) {
    // Sort by length (longest first) to match longer phrases before shorter ones
    const sortedCustomLemmas = Object.entries(customLemmas).sort(
      (a, b) => b[0].length - a[0].length
    );

    for (const [phrase, symptom] of sortedCustomLemmas) {
      // Check if it's a multi-word phrase (contains space)
      if (phrase.includes(' ') && textLower.includes(phrase) && !foundCategories.has(symptom)) {
        const phraseIndex = textLower.indexOf(phrase);
        const detectedSeverity = findSeverity(textLower, phraseIndex);

        const finalSeverity = severityMap.get(symptom) ||
                             assignDefaultSeverity(symptom, text, detectedSeverity);

        foundSymptoms.push({
          symptom,
          matched: phrase,
          method: 'phrase',
          severity: finalSeverity,
        });
        foundCategories.add(symptom);
      }
    }
  }

  // Step 3: Extract lemma-based symptoms
  const tokens = tokenize(text);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (allLemmas[token]) {
      const symptom = allLemmas[token];

      if (!foundCategories.has(symptom) && !isNegated(tokens, i)) {
        const detectedSeverity = findSeverity(textLower, i);

        // Use numeric severity if available, otherwise use detected or default
        const finalSeverity = severityMap.get(symptom) ||
                             assignDefaultSeverity(symptom, text, detectedSeverity);

        foundSymptoms.push({
          symptom,
          matched: token,
          method: 'lemma',
          severity: finalSeverity,
        });
        foundCategories.add(symptom);
      }
    }
  }

  // Step 4: Extract activity triggers and link to symptoms
  const activityTriggers = extractActivityTriggers(text);
  const symptomsWithTriggers = linkTriggersToSymptoms(foundSymptoms, activityTriggers, tokens, text);

  // Step 5: Add confidence scores to all symptoms
  const symptomsWithConfidence = addConfidenceScores(symptomsWithTriggers, text);

  // Step 6: Add temporal info (duration and time of day)
  const symptomsWithTemporal = addTemporalInfo(symptomsWithConfidence, text);

  // Step 7: Extract spoon count for energy tracking
  const spoonCount = extractSpoonCount(text);

  return {
    text,
    symptoms: symptomsWithTemporal,
    spoonCount: spoonCount ?? undefined,
  };
}
