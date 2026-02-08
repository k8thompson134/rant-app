/**
 * Pain-related symptom dictionaries
 *
 * Maps pain descriptions, locations, patterns, and qualities to standardized categories
 * Used for tracking pain characteristics in chronic illness contexts
 *
 * Dictionaries:
 * - PAIN_QUALIFIERS: Types and qualities of pain (sharp, burning, etc.)
 * - BODY_PARTS: Anatomical locations where pain occurs
 * - RADIATION_PATTERNS: Referred pain and pain radiation patterns
 * - MULTI_LOCATION_PATTERNS: Multi-location and bilateral pain patterns
 * - JOINT_LOCATIONS: Joint-specific pain tracking
 * - MUSCLE_LOCATIONS: Muscle-specific pain tracking (fibro-related)
 * - PAIN_CONSISTENCY: Pain patterns and consistency (constant, intermittent, etc.)
 * - PAIN_ONSET: Pain onset and temporal descriptors
 */

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

  // Nerve/Tingling pain
  'tingling': 'tingling',
  'prickling': 'prickling',
  'pins and needles': 'paresthesia',
  'needle-like': 'tingling',
  'pricking': 'prickling',

  // Intensity Modifiers
  'grinding': 'grinding',
  'gnawing': 'gnawing',
  'nagging': 'nagging',
  'relentless': 'relentless',
  'constant': 'constant',
  'unrelenting': 'unrelenting',
  'persistent': 'persistent',
  'ongoing': 'persistent',

  // Depth/Scope Descriptors
  'deep': 'deep',
  'superficial': 'superficial',
  'surface': 'superficial',
  'skin-level': 'superficial',
  'widespread': 'widespread',
  'diffuse': 'diffuse',
  'localized': 'localized',
  'focal': 'localized',
  'all-over': 'widespread',

  // Movement/Pattern Descriptors
  'migrating': 'migrating',
  'moving': 'moving',
  'traveling': 'traveling',
  'shifting': 'shifting',
  'traveling down': 'radiating',

  // Specific Sensations/Metaphors
  'ice pick': 'ice_pick',
  'hot poker': 'hot_poker',
  'vice grip': 'vice_like',
  'vice-like': 'vice_like',
  'band-like': 'band_like',
  'tightening band': 'band_like',
  'tearing': 'tearing',
  'ripping': 'tearing',
  'stretching': 'stretching',
  'pulling': 'pulling',
  'tugging': 'pulling',
  'sharp stab': 'stabbing',
  'stinging': 'stinging',
  'burning stab': 'burning_sharp',

  // Intensity descriptors
  'excruciating': 'excruciating',
  'unbearable': 'unbearable',
  'intense': 'intense',
  'severe': 'severe',
  'brutal': 'severe',
  'wretched': 'severe',
  'agonizing': 'severe',
  'torturous': 'severe',
};

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

  // Pelvis - Specific locations
  'pelvis': 'pelvis',
  'pelvic': 'pelvis',
  'pelvic floor': 'pelvic_floor',
  'pelvic floor muscles': 'pelvic_floor',
  'pubic bone': 'pubic_bone',
  'pubis': 'pubic_bone',
  'sit bones': 'ischial_tuberosities',
  'sitting bones': 'ischial_tuberosities',
  'ischial': 'ischial_tuberosities',
  'ischial tuberosities': 'ischial_tuberosities',
  'ischium': 'ischial_tuberosities',
  'sacroiliac': 'sacroiliac',
  'si joint area': 'sacroiliac',

  // Spine - Specific segments
  'cervical spine': 'cervical_spine',
  'c1': 'cervical_1',
  'c2': 'cervical_2',
  'c3': 'cervical_3',
  'c4': 'cervical_4',
  'c5': 'cervical_5',
  'c6': 'cervical_6',
  'c7': 'cervical_7',
  'neck vertebra': 'cervical_spine',

  'thoracic spine': 'thoracic_spine',
  't1': 'thoracic_1',
  't2': 'thoracic_2',
  't3': 'thoracic_3',
  't4': 'thoracic_4',
  't5': 'thoracic_5',
  't6': 'thoracic_6',
  't7': 'thoracic_7',
  't8': 'thoracic_8',
  't9': 'thoracic_9',
  't10': 'thoracic_10',
  't11': 'thoracic_11',
  't12': 'thoracic_12',
  'mid spine': 'thoracic_spine',
  'mid back spine': 'thoracic_spine',

  'lumbar spine': 'lumbar_spine',
  'l1': 'lumbar_1',
  'l2': 'lumbar_2',
  'l3': 'lumbar_3',
  'l4': 'lumbar_4',
  'l5': 'lumbar_5',
  'lower lumbar': 'lumbar_spine',

  'lumbosacral': 'lumbosacral',
  'l5-s1': 'lumbosacral',
  'ls joint': 'lumbosacral',

  'sacral spine': 'sacral_spine',
  's1': 's1',
  's2': 's2',
  's3': 's3',
  's4': 's4',
  's5': 's5',

  // Lymph nodes
  'lymph node': 'lymph_node',
  'lymph nodes': 'lymph_node',
  'swollen lymph node': 'swollen_lymph_node',
  'lymph': 'lymph_node',
  'cervical nodes': 'cervical_lymph_node',
  'neck nodes': 'cervical_lymph_node',
  'neck lymph': 'cervical_lymph_node',
  'under jaw': 'submandibular_lymph_node',
  'under chin': 'submandibular_lymph_node',
  'submandibular': 'submandibular_lymph_node',
  'armpit': 'axillary_lymph_node',
  'armpits': 'axillary_lymph_node',
  'axillary': 'axillary_lymph_node',
  'axilla': 'axillary_lymph_node',
  'groin nodes': 'inguinal_lymph_node',
  'groin lymph': 'inguinal_lymph_node',
  'inguinal': 'inguinal_lymph_node',
  'inner thigh nodes': 'inguinal_lymph_node',

  // Whole body
  'body': 'whole_body',
  'everywhere': 'whole_body',
  'all over': 'whole_body',
  'whole body': 'whole_body',
  'entire body': 'whole_body',
};

export const RADIATION_PATTERNS: Record<string, string> = {
  // Neck radiation patterns
  'radiating down arm': 'neck_to_arm_radiation',
  'radiating down arms': 'neck_to_arm_radiation',
  'shooting down arm': 'neck_to_arm_radiation',
  'shooting down arms': 'neck_to_arm_radiation',
  'radiating from neck': 'neck_radiation',
  'pain down arm': 'neck_to_arm_radiation',
  'pain down arms': 'neck_to_arm_radiation',
  'neck pain to arm': 'neck_to_arm_radiation',
  'from neck down': 'neck_to_arm_radiation',

  // Low back/leg radiation
  'radiating down leg': 'back_to_leg_radiation',
  'radiating down legs': 'back_to_leg_radiation',
  'shooting down leg': 'back_to_leg_radiation',
  'shooting down legs': 'back_to_leg_radiation',
  'sciatica': 'sciatic_radiation',
  'sciatic pain': 'sciatic_radiation',
  'pain down leg': 'back_to_leg_radiation',
  'pain down legs': 'back_to_leg_radiation',
  'lower back to leg': 'back_to_leg_radiation',
  'radiating to foot': 'radiation_to_extremity',
  'pain shooting to foot': 'radiation_to_extremity',

  // Upper back radiation
  'radiating to shoulder': 'back_to_shoulder_radiation',
  'radiating between shoulder blades': 'interscapular_radiation',
  'radiating to arm': 'back_to_arm_radiation',

  // Hip/groin radiation
  'radiating to groin': 'hip_to_groin_radiation',
  'radiating down inner thigh': 'groin_to_thigh_radiation',
  'pain to inner thigh': 'groin_to_thigh_radiation',

  // Referred pain (non-directional)
  'referred pain': 'referred_pain',
  'referred to': 'referred_pain',
  'projects to': 'referred_pain',
  'feels like its in': 'referred_pain',
  'feels like pain in': 'referred_pain',
};

export const MULTI_LOCATION_PATTERNS: Record<string, string> = {
  // Bilateral patterns (both sides)
  'both sides': 'bilateral',
  'both legs': 'bilateral_legs',
  'both arms': 'bilateral_arms',
  'both hands': 'bilateral_hands',
  'both feet': 'bilateral_feet',
  'both knees': 'bilateral_knees',
  'both shoulders': 'bilateral_shoulders',
  'both hips': 'bilateral_hips',
  'both elbows': 'bilateral_elbows',
  'both ankles': 'bilateral_ankles',
  'both sides of neck': 'bilateral_neck',
  'both sides of body': 'bilateral_body',
  'entire body': 'whole_body_pain',
  'symmetrical': 'bilateral',

  // Multiple location combinations
  'neck and shoulders': 'neck_shoulder_combo',
  'neck and arms': 'neck_arm_combo',
  'head and neck': 'head_neck_combo',
  'shoulders and back': 'shoulder_back_combo',
  'shoulders and arms': 'shoulder_arm_combo',
  'back and hips': 'back_hip_combo',
  'back and legs': 'back_leg_combo',
  'hips and knees': 'hip_knee_combo',
  'knees and ankles': 'knee_ankle_combo',
  'lower back and pelvis': 'lumbar_pelvic_combo',

  // Migratory patterns
  'travels around': 'migrating_pattern',
  'jumps around': 'migrating_pattern',
  'moves from place to place': 'migrating_pattern',
  'different spot each day': 'migrating_pattern',
  'never in same place': 'migrating_pattern',
  'all over body': 'widespread_pattern',
  'pain all over': 'widespread_pattern',
  'pain everywhere': 'widespread_pattern',

  // Distributed patterns
  'left side': 'left_side_distributed',
  'right side': 'right_side_distributed',
  'one side': 'unilateral',
  'down one side': 'hemibody_pattern',
  'whole left side': 'left_hemibody',
  'whole right side': 'right_hemibody',
};

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

export const PAIN_CONSISTENCY: Record<string, string> = {
  // Constant vs Intermittent
  'constant': 'constant_pain',
  'all the time': 'constant_pain',
  '24/7': 'constant_pain',
  'always hurts': 'constant_pain',
  'never stops': 'constant_pain',
  'continuous': 'constant_pain',
  'nonstop': 'constant_pain',

  'intermittent': 'intermittent_pain',
  'comes and goes': 'intermittent_pain',
  'on and off': 'intermittent_pain',
  'flares up': 'flare_pattern',
  'flares': 'flare_pattern',
  'flaring': 'flare_pattern',
  'sporadic': 'intermittent_pain',
  'random': 'intermittent_pain',
  'unpredictable': 'unpredictable_pain',
  'unpredictably': 'unpredictable_pain',

  // Waxing and waning patterns
  'waxing and waning': 'waxing_waning',
  'waxes and wanes': 'waxing_waning',
  'gets better and worse': 'waxing_waning',
  'fluctuating': 'waxing_waning',
  'fluctuates': 'waxing_waning',
  'up and down': 'fluctuating_pain',
  'varies': 'fluctuating_pain',
  'variable': 'fluctuating_pain',

  // Cycling patterns
  'cycles': 'cycling_pain',
  'cyclic': 'cycling_pain',
  'cyclical': 'cycling_pain',
  'rhythmic': 'rhythmic_pain',
  'pulsing': 'pulsing_pain',
  'throbbing': 'pulsing_pain',
  'pulses': 'pulsing_pain',

  // Predictability
  'predictable': 'predictable_pain',
  'predictably': 'predictable_pain',
  'same time every day': 'predictable_pain',
  'happens at same time': 'predictable_pain',
  'reliable': 'predictable_pain',
  'consistent timing': 'predictable_pain',
};

export const PAIN_ONSET: Record<string, string> = {
  // Sudden vs gradual onset
  'sudden': 'sudden_onset',
  'suddenly': 'sudden_onset',
  'all of a sudden': 'sudden_onset',
  'out of nowhere': 'sudden_onset',
  'out of the blue': 'sudden_onset',
  'acute onset': 'sudden_onset',
  'sharp start': 'sudden_onset',

  'gradual': 'gradual_onset',
  'gradually': 'gradual_onset',
  'slowly': 'gradual_onset',
  'slow': 'gradual_onset',
  'builds up': 'gradual_onset',
  'starts slow': 'gradual_onset',
  'creeps in': 'gradual_onset',
  'sneaks in': 'gradual_onset',
  'insidious': 'gradual_onset',
  'insidiously': 'gradual_onset',

  // Quick onset/build patterns
  'quick': 'quick_onset',
  'quickly': 'quick_onset',
  'fast': 'quick_onset',
  'immediate': 'quick_onset',
  'instantly': 'quick_onset',
  'comes on fast': 'quick_onset',
  'hits suddenly': 'quick_onset',
  'flashes': 'quick_onset',

  'slow build': 'slow_build',
  'slow to build': 'slow_build',
  'builds slowly': 'slow_build',
  'takes time': 'slow_build',
  'escalates': 'escalating_pain',
  'escalating': 'escalating_pain',
  'gets progressively worse': 'escalating_pain',

  // Duration/Permanence
  'acute': 'acute_pain',
  'chronic': 'chronic_pain',
  'long-standing': 'chronic_pain',
  'longstanding': 'chronic_pain',
  'long term': 'chronic_pain',
  'long-term': 'chronic_pain',
  'for years': 'chronic_pain',
  'for months': 'chronic_pain',
  'persistent': 'persistent_pain',
  'persistent for': 'persistent_pain',

  // Recovery patterns
  'resolves quickly': 'quick_resolution',
  'goes away quickly': 'quick_resolution',
  'temporary': 'temporary_pain',
  'temporarily': 'temporary_pain',
  'passes': 'temporary_pain',
  'goes away': 'temporary_pain',
  'takes ages to go away': 'prolonged_pain',
  'lingers': 'prolonged_pain',
  'sticks around': 'prolonged_pain',
  'won\'t go away': 'prolonged_pain',
  'wont go away': 'prolonged_pain',
  'doesn\'t go away': 'prolonged_pain',
  'doesnt go away': 'prolonged_pain',
};
