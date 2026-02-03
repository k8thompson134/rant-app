/**
 * Single-word symptom lemma mappings
 *
 * Maps casual language, slang, and medical terms to standardized symptom categories
 * Used for quick lemma-based symptom detection
 *
 * Examples:
 * - 'tired' -> 'fatigue'
 * - 'dizzy' -> 'dizziness'
 * - 'ptsd' -> 'ptsd'
 */

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
  // 'energy': removed - too ambiguous (e.g., "got my energy back", "energy drink")
  // Use phrases like "no energy", "low energy", "energy crash" instead
  suffering: 'fatigue',
  zombified: 'fatigue',
  zombie: 'fatigue',
  toast: 'fatigue',
  cooked: 'fatigue',
  rooted: 'fatigue',
  buggered: 'fatigue',
  gassed: 'fatigue',
  tuckered: 'fatigue',
  rundown: 'fatigue',
  haggard: 'fatigue',

  // === PEM (Post-Exertional Malaise) ===
  'crash': 'pem',
  'crashed': 'pem',
  // 'crashing': removed - see later CRASH PATTERNS section
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
  agony: 'pain',
  agonizing: 'pain',
  excruciating: 'pain',
  searing: 'pain',
  radiating: 'pain',
  gnawing: 'pain',
  pulsating: 'pain',
  pulsing: 'pain',
  shooting: 'pain',

  // === HEADACHE ===
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
  // 'fall': removed - too ambiguous ("I fell asleep", "leaf fall", "waterfall")
  // Use phrases like "falling apart", "hair falling out" instead

  // === GASTROINTESTINAL ===
  nausea: 'nausea',
  nauseous: 'nausea',
  nauseated: 'nausea',
  queasy: 'nausea',
  queasiness: 'nausea',
  gaggy: 'nausea',
  gagging: 'nausea',
  heaving: 'nausea',
  retching: 'nausea',
  bilious: 'nausea',
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
  // 'attack': removed - too ambiguous ("he attacked", "heart attack", "attack of the clones")
  // Use phrases like "panic attack", "asthma attack", "anxiety attack", "rage attack" instead

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
  // 'down': removed - too ambiguous ("sitting down", "down the street", "let down")
  // Use phrases like "feeling down", "down in the dumps" instead
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
  frustration: 'frustration',
  cranky: 'irritability',
  grumpy: 'irritability',
  annoyed: 'irritability',
  snappy: 'irritability',
  moody: 'mood_swings',

  // === EXPANDED EMOTIONAL STATES ===
  empty: 'emptiness',
  emptiness: 'emptiness',
  hollow: 'emptiness',
  void: 'emptiness',
  worthless: 'worthlessness',
  worthlessness: 'worthlessness',
  helpless: 'helplessness',
  despairing: 'despair',
  devastated: 'devastation',
  grief: 'grief',
  grieving: 'grief',
  mourning: 'grief',
  bereaved: 'grief',
  loneliness: 'loneliness',
  lonely: 'loneliness',

  // === ANGER SPECTRUM ===
  rage: 'rage',
  enraged: 'rage',
  furious: 'rage',
  fury: 'rage',
  angry: 'anger',
  anger: 'anger',
  mad: 'anger',
  livid: 'rage',
  seething: 'rage',
  resentment: 'resentment',
  resentful: 'resentment',
  bitter: 'bitterness',
  bitterness: 'bitterness',
  hostile: 'hostility',
  hostility: 'hostility',

  // === SHAME/GUILT ===
  shame: 'shame',
  ashamed: 'shame',
  shameful: 'shame',
  guilt: 'guilt',
  guilty: 'guilt',
  regret: 'regret',
  regretful: 'regret',
  humiliated: 'humiliation',
  humiliation: 'humiliation',
  embarrassed: 'embarrassment',
  embarrassment: 'embarrassment',

  // === DISSOCIATION SPECTRUM ===
  dissociate: 'dissociation',
  dissociated: 'dissociation',
  dissociating: 'dissociation',
  unreality: 'derealization',
  unreal: 'derealization',
  dreamlike: 'derealization',
  robotic: 'depersonalization',
  autopilot: 'dissociation',
  zoned: 'dissociation',

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
  // 'period': removed - too ambiguous ("period of time", "period in history")
  // Use phrases like "on my period", "period pain", "period cramps" instead
  menstrual: 'menstruation',
  menstruation: 'menstruation',
  pms: 'pms',
  pmdd: 'pmdd',
  cycle: 'menstrual_cycle',
  spotting: 'spotting',
  // 'flow': removed - too ambiguous ("cash flow", "workflow", "go with the flow")
  // Use phrase "heavy flow" for menstrual bleeding instead
  hormonal: 'hormonal',
  hormone: 'hormonal',
  estrogen: 'hormonal',
  progesterone: 'hormonal',
  ovulation: 'ovulation',

  // === DUPLICATES REMOVED - SEE LATER SECTIONS FOR QUOTED VERSIONS ===

  // === PTSD & TRAUMA ===
  ptsd: 'ptsd',
  flashback: 'flashback',
  flashbacks: 'flashback',
  triggered: 'ptsd_trigger',
  triggering: 'ptsd_trigger',
  hypervigilant: 'hypervigilance',
  hypervigilance: 'hypervigilance',
  startle: 'startle_response',
  startled: 'startle_response',

  // === OCD ===
  ocd: 'ocd',
  obsessive: 'obsessive_thoughts',
  obsessing: 'obsessive_thoughts',
  compulsive: 'compulsions',
  compulsion: 'compulsions',
  compulsions: 'compulsions',
  ritualistic: 'compulsions',
  checking: 'checking_compulsions',
  repeating: 'repetitive_behaviors',

  // === ADHD ===
  adhd: 'adhd',
  hyperfocus: 'hyperfocus',
  hyperfocused: 'hyperfocus',
  hyperfixation: 'hyperfixation',
  understimulated: 'understimulation',
  overstimulated: 'overstimulation',
  executive: 'executive_dysfunction',
  paralysis: 'task_paralysis',

  // === BIPOLAR ===
  bipolar: 'bipolar',
  manic: 'mania',
  mania: 'mania',
  hypomanic: 'hypomania',
  hypomania: 'hypomania',
  elevated: 'elevated_mood',
  grandiose: 'grandiosity',
  grandiosity: 'grandiosity',

  // === AUTISM SPECTRUM ===
  autistic: 'autistic_traits',
  autism: 'autistic_traits',
  stimming: 'stimming',
  meltdown: 'autistic_meltdown',
  shutdown: 'autistic_shutdown',
  masking: 'masking',
  scripting: 'scripting',

  // === BORDERLINE PERSONALITY ===
  bpd: 'bpd',
  splitting: 'splitting',
  abandonment: 'abandonment_fears',

  // === EATING DISORDERS ===
  eating: 'eating_disorder',
  binge: 'binge_eating',
  binged: 'binge_eating',
  bingeing: 'binge_eating',
  purge: 'purging',
  purged: 'purging',
  purging: 'purging',
  restrict: 'food_restriction',
  restricting: 'food_restriction',
  restricted: 'food_restriction',

  // === SUBSTANCE USE ===
  substance: 'substance_use',
  cravings: 'cravings',
  craving: 'cravings',
  withdrawal: 'withdrawal',

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
  // 'pacing': removed - see later ENERGY/PACING CONCEPTS section
  'recovery': 'delayed_recovery',

  // === COGNITIVE SYMPTOMS ===
  ruminating: 'rumination',
  rumination: 'rumination',
  overthinking: 'overthinking',
  overthink: 'overthinking',
  looping: 'thought_loops',
  perseverating: 'perseveration',
  perseveration: 'perseveration',
  perfection: 'perfectionism',
  perfectionism: 'perfectionism',
  perfectionist: 'perfectionism',
  indecisive: 'indecisiveness',
  indecisiveness: 'indecisiveness',

  // === BEHAVIORAL SYMPTOMS ===
  nightmare: 'nightmares',
  nightmares: 'nightmares',
  undereating: 'undereating',
  overeating: 'overeating',
  withdrawn: 'social_withdrawal',
  withdrawing: 'social_withdrawal',
  isolating: 'social_isolation',
  avoiding: 'avoidance',
  avoidance: 'avoidance',
  cancel: 'canceling_plans',
  canceled: 'canceling_plans',
  canceling: 'canceling_plans',
  flaking: 'canceling_plans',
  hiding: 'hiding',
  unmotivated: 'lack_of_motivation',
  procrastinating: 'procrastination',
  procrastination: 'procrastination',

  // === PHYSICAL MENTAL HEALTH SYMPTOMS ===
  clenching: 'jaw_clenching',
  grinding: 'teeth_grinding',
  bruxism: 'teeth_grinding',

  // === REGIONAL VARIANTS (BRITISH) ===
  dodgy: 'malaise',
  wonky: 'dizziness',
  peaky: 'malaise',
  grotty: 'malaise',
  naff: 'malaise',
  ropy: 'malaise',
  poorly: 'malaise',

  // === REGIONAL VARIANTS (AUSTRALIAN) ===
  crook: 'malaise',
  crocked: 'malaise',

  // === LONG COVID / POST-VIRAL ===
  // Long COVID terminology
  longhauler: 'long_covid',
  longcovid: 'long_covid',
  postcovid: 'long_covid',
  'long hauler': 'long_covid',
  'long covid': 'long_covid',
  'post covid': 'long_covid',
  'COVID-19': 'long_covid',
  'COVID symptoms': 'long_covid',

  // Post-viral / general post-infection
  postviral: 'post_viral',
  'post viral': 'post_viral',
  'post-viral': 'post_viral',
  postinfection: 'post_viral',
  'post infection': 'post_viral',
  aftercovid: 'post_viral',
  persistentcovid: 'long_covid',

  // Dysautonomia-related concepts
  airhunger: 'air_hunger',
  'air hunger': 'air_hunger',
  'cannot catch breath': 'air_hunger',
  'can\'t catch breath': 'air_hunger',
  'breathlessness': 'air_hunger',
  'hunger for air': 'air_hunger',

  // Sense disruptions
  'parosmia': 'parosmia',
  'dysgeusia': 'dysgeusia',
  'taste distortion': 'dysgeusia',
  'smell distortion': 'parosmia',
  'altered taste': 'dysgeusia',
  'altered smell': 'parosmia',
  'things taste off': 'dysgeusia',
  'things smell off': 'parosmia',
  'metallic taste': 'dysgeusia',
  'phantom taste': 'dysgeusia',
  'phantom smell': 'parosmia',
  'anosmia': 'anosmia',
  'loss of smell': 'anosmia',
  'lost smell': 'anosmia',
  'ageusia': 'ageusia',
  'loss of taste': 'ageusia',
  'lost taste': 'ageusia',

  // Viral reactivation
  'reactivation': 'viral_reactivation',
  'reactivations': 'viral_reactivation',
  'reactivating': 'viral_reactivation',
  'ebv': 'ebv_reactivation',
  'Epstein-Barr': 'ebv_reactivation',
  'hhv6': 'viral_reactivation',
  'HHV-6': 'viral_reactivation',
  'cmv': 'viral_reactivation',
  'cytomegalovirus': 'viral_reactivation',
  'herpesreactivation': 'viral_reactivation',
  'herpes reactivation': 'viral_reactivation',

  // ME/CFS specific terminology
  'me': 'me_cfs',
  'cfs': 'me_cfs',
  'myalgic encephalomyelitis': 'me_cfs',
  'chronic fatigue syndrome': 'me_cfs',
  'myalgic': 'me_cfs',
  'encephalomyelitis': 'me_cfs',

  // Energy/Pacing concepts
  'pacing': 'pacing',
  'energyenvelope': 'energy_envelope',
  'energy envelope': 'energy_envelope',
  'spoon management': 'pacing',
  'managing spoons': 'pacing',
  'boom bust': 'boom_bust_cycle',
  'boom-bust': 'boom_bust_cycle',
  'boom/bust': 'boom_bust_cycle',
  'push crash': 'push_crash_cycle',
  'push-crash': 'push_crash_cycle',
  'push/crash': 'push_crash_cycle',

  // Crash patterns
  'crashing': 'pem_crash',
  'crashed hard': 'pem_crash',
  'severe crash': 'pem_crash',
  'crash cycle': 'pem_crash',
  'crash pattern': 'pem_crash',
  'wiped out': 'pem_crash',
  'total crash': 'pem_crash',
  'bedbound': 'severe_pem',
  'bed-bound': 'severe_pem',
  'bedridden': 'severe_pem',
  'housebound': 'severe_pem',
  'house-bound': 'severe_pem',
  'unable to function': 'severe_pem',

  // Symptom fluctuation
  'good days bad days': 'symptom_fluctuation',
  'ups and downs': 'symptom_fluctuation',
  'high and low days': 'symptom_fluctuation',
  'variable symptoms': 'symptom_fluctuation',
  unpredictable: 'unpredictable_course',
  'good day bad day': 'good_bad_day_cycle',

  // === FIBROMYALGIA ===
  fibromyalgia: 'fibromyalgia',
  fibro: 'fibromyalgia',
  hyperalgesia: 'hyperalgesia',

  // === COMMON MISSPELLINGS ===
  naseua: 'nausea',
  nauseas: 'nausea',
  dizy: 'dizziness',
  dizzyness: 'dizziness',
  fatige: 'fatigue',
  exaustion: 'fatigue',
  mussle: 'muscle_pain',
  heachache: 'headache',
  migren: 'headache',
  migrane: 'headache',
};
