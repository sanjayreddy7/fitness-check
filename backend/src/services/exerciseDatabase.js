const exercises = [
  // --- Computer Vision Supported Exercises ---
  {
    id: 'ex-squat',
    name: 'Bodyweight Squats',
    category: 'strength',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    cvSupported: true,
    cvType: 'squat',
    cvConfig: {
      jointAngle: 'hip-knee-ankle',
      downThreshold: 95, // degrees at bottom
      upThreshold: 160,   // degrees at top
      minHoldMs: 150
    },
    instructions: [
      'Stand with feet shoulder-width apart, toes pointing slightly outward (5-15 degrees).',
      'Engage your abdominal core and maintain an upright chest.',
      'Hinge at the hips and bend knees simultaneously, lowering your seat as if sitting onto a low chair.',
      'Lower until your hip crease is level with or below your knee joint (90-95 degree angle).',
      'Drive powerfully through your midfoot and heels to return to standing position. Lock out hips fully.'
    ],
    postureTips: [
      'Keep knees tracking in line with your second toe; do not let knees cave inward (valgus collapse).',
      'Avoid rounding the lower lumbar spine at the bottom of the movement.',
      'Maintain steady breathing: inhale during descent, exhale during ascent.'
    ],
    regression: 'Box Squat (sitting back onto a chair) or Wall Sit',
    progression: 'Jump Squat or Goblet Squat'
  },
  {
    id: 'ex-pushup',
    name: 'Standard Pushups',
    category: 'strength',
    targetMuscles: ['Chest (Pectorals)', 'Triceps', 'Anterior Deltoids', 'Core'],
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    cvSupported: true,
    cvType: 'pushup',
    cvConfig: {
      jointAngle: 'shoulder-elbow-wrist',
      downThreshold: 90,
      upThreshold: 160,
      minHoldMs: 150
    },
    instructions: [
      'Assume a high plank position with hands slightly wider than shoulder-width, fingers spread.',
      'Keep your body in a rigid straight line from head to heels by squeezing glutes and brace your core.',
      'Lower your chest towards the floor by bending elbows back at a 45-degree arrow angle (not flared 90 degrees).',
      'Lower until your chest touches or comes within 2 inches of the floor.',
      'Press the floor away firmly to extend arms back to the starting high plank.'
    ],
    postureTips: [
      'Do not allow your lower back or hips to sag towards the floor.',
      'Do not hike your hips up into a tent shape.',
      'Keep neck neutral by gazing 6 inches ahead of your fingertips.'
    ],
    regression: 'Incline Pushups (hands on table or wall) or Knee Pushups',
    progression: 'Diamond Pushups or Decline Pushups'
  },
  {
    id: 'ex-jumping-jacks',
    name: 'Jumping Jacks',
    category: 'cardio',
    targetMuscles: ['Calves', 'Shoulders', 'Cardiovascular System', 'Core'],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    cvSupported: true,
    cvType: 'jumping_jack',
    cvConfig: {
      jointAngle: 'shoulder-hip-ankle',
      armThreshold: 140, // arms raised overhead
      legThreshold: 1.3, // foot distance ratio
      minHoldMs: 100
    },
    instructions: [
      'Stand erect with feet together and arms resting comfortably alongside your thighs.',
      'Bend knees slightly and jump both feet outward laterally past shoulder width.',
      'Simultaneously swing arms upward and out in a wide arc until hands touch overhead.',
      'Immediately spring back to the initial starting position in a steady, springy cadence.'
    ],
    postureTips: [
      'Land softly on the balls of your feet with slightly bent knees to absorb impact.',
      'Maintain an upright posture and relaxed shoulders.'
    ],
    regression: 'Step Jacks (stepping side to side without jumping impact)',
    progression: 'Star Jumps or Burpees'
  },
  {
    id: 'ex-bicep-curls',
    name: 'Dumbbell Bicep Curls',
    category: 'strength',
    targetMuscles: ['Biceps Brachii', 'Brachialis', 'Forearms'],
    equipment: 'dumbbells',
    difficulty: 'beginner',
    cvSupported: true,
    cvType: 'bicep_curl',
    cvConfig: {
      jointAngle: 'shoulder-elbow-wrist',
      curlThreshold: 45,  // angle at peak contraction
      downThreshold: 155, // angle at full extension
      minHoldMs: 150
    },
    instructions: [
      'Stand tall with a dumbbell in each hand, arms extended downwards, palms facing forward or inwards.',
      'Pin elbows firmly to your sides; they should act as stationary pivots.',
      'Contract biceps to curl weights upward towards shoulder level while exhaling.',
      'Squeeze hard at the peak contraction for 1 second.',
      'Lower weights under controlled eccentric tempo back to full extension.'
    ],
    postureTips: [
      'Do not swing your torso or lean back to generate momentum.',
      'Ensure full range of motion: completely extend elbow at bottom.'
    ],
    regression: 'Resistance Band Curls or lighter dumbbells',
    progression: 'Hammer Curls with 3-second negative eccentric'
  },
  {
    id: 'ex-plank',
    name: 'Isometric Plank Hold',
    category: 'core',
    targetMuscles: ['Transverse Abdominis', 'Rectus Abdominis', 'Shoulders', 'Glutes'],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    cvSupported: true,
    cvType: 'plank',
    cvConfig: {
      jointAngle: 'shoulder-hip-ankle',
      alignmentTolerance: 15,
      minHoldMs: 1000
    },
    instructions: [
      'Place forearms on the floor with elbows aligned directly under shoulders.',
      'Extend legs straight behind you on balls of feet.',
      'Draw navel inwards toward spine, squeeze glutes, and push floor away with forearms.',
      'Hold a rock-solid, straight horizontal line.'
    ],
    postureTips: [
      'Breathe rhythmically; do not hold your breath.',
      'Prevent lower back arching by keeping glutes firmly squeezed.'
    ],
    regression: 'Kneeling Plank or Incline Forearm Plank',
    progression: 'Plank with Shoulder Taps or Single-Leg Plank'
  },

  // --- Additional Strength Exercises ---
  {
    id: 'ex-lunges',
    name: 'Walking Forward Lunges',
    category: 'strength',
    targetMuscles: ['Quadriceps', 'Glutes', 'Hamstrings', 'Calves'],
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    cvSupported: false,
    instructions: [
      'Stand upright with feet hip-width apart and hands on hips.',
      'Take a large, controlled step forward with your right leg.',
      'Lower your hips until both knees form approximately 90-degree angles.',
      'Push off the front foot to step through into the next forward lunge.'
    ],
    postureTips: ['Keep torso perpendicular to ground; do not let front knee cave inward.'],
    regression: 'Reverse Static Lunges or Assisted TRX Lunges',
    progression: 'Jumping Split Lunges'
  },
  {
    id: 'ex-glute-bridge',
    name: 'Glute Bridges',
    category: 'strength',
    targetMuscles: ['Gluteus Maximus', 'Hamstrings', 'Core'],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    cvSupported: false,
    instructions: [
      'Lie face up on the floor with knees bent and feet flat on ground hip-width apart.',
      'Press heels into ground, squeeze glutes, and lift hips toward ceiling.',
      'Form a straight diagonal line from knees through hips to shoulders.',
      'Pause at top for 2 seconds, then slowly lower back down.'
    ],
    postureTips: ['Do not overextend lumbar spine; the lift must originate from glute contraction.'],
    regression: 'Static Glute Bridge Hold',
    progression: 'Single-Leg Glute Bridge'
  },
  {
    id: 'ex-mountain-climbers',
    name: 'Mountain Climbers',
    category: 'cardio',
    targetMuscles: ['Cardio', 'Core', 'Shoulders', 'Hip Flexors'],
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    cvSupported: false,
    instructions: [
      'Start in a pushup plank position with hands under shoulders.',
      'Rapidly drive right knee forward towards your chest, then return.',
      'Immediately alternate with left knee in a running rhythm.',
      'Maintain level hips throughout the set.'
    ],
    postureTips: ['Keep shoulders directly over wrists; prevent hips from bouncing high.'],
    regression: 'Slow Marching Plank (non-jumping)',
    progression: 'Cross-Body Mountain Climbers'
  },

  // --- Mobility & Restorative Recovery Exercises ---
  {
    id: 'ex-cat-cow',
    name: 'Cat-Cow Spinal Flow',
    category: 'mobility',
    targetMuscles: ['Spine', 'Thoracic Mobility', 'Neck', 'Abdominals'],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    cvSupported: false,
    instructions: [
      'Start on hands and knees (quadruped position) with wrists under shoulders and knees under hips.',
      'Inhale (Cow): drop belly towards floor, lift chest and tailbone up towards ceiling.',
      'Exhale (Cat): round spine upward like a stretching cat, tuck chin and tailbone.'
    ],
    postureTips: ['Move smoothly with breath; feel vertebrae articulating one by one.'],
    regression: 'Seated Cat-Cow in a chair',
    progression: 'Quadruped Thoracic Rotations'
  },
  {
    id: 'ex-childs-pose',
    name: "Balasana (Child's Pose)",
    category: 'mobility',
    targetMuscles: ['Lats', 'Lower Back', 'Hips', 'Ankles'],
    equipment: 'bodyweight',
    difficulty: 'beginner',
    cvSupported: false,
    instructions: [
      'Kneel on the floor, bring big toes together, and widen knees to edges of mat.',
      'Sit hips back onto heels, fold torso forward over thighs.',
      'Extend arms long in front of you with palms on ground; rest forehead gently on floor.',
      'Take 5 to 10 slow, deep diaphragmatic breaths.'
    ],
    postureTips: ['Release all muscular tension with each slow exhale.'],
    regression: 'Supported Child’s Pose with a pillow beneath chest',
    progression: 'Extended Puppy Pose'
  },
  {
    id: 'ex-90-90-hip',
    name: '90/90 Hip Mobility Flow',
    category: 'mobility',
    targetMuscles: ['Hip Internal Rotators', 'Hip External Rotators', 'Glutes'],
    equipment: 'bodyweight',
    difficulty: 'intermediate',
    cvSupported: false,
    instructions: [
      'Sit on the ground with front leg bent at 90 degrees and back leg bent at 90 degrees.',
      'Keep tall upright spine, gently hinge chest over the front shin.',
      'Hold for 30 seconds, then lift knees and rotate over to the opposite side.'
    ],
    postureTips: ['Keep sit bones anchored; do not hunch lower back.'],
    regression: 'Seated Figure-4 Stretch',
    progression: '90/90 Transition without using hands'
  }
];

function getExercises() {
  return exercises;
}

function getExerciseById(id) {
  return exercises.find(e => e.id === id);
}

function getExercisesByCategory(cat) {
  return exercises.filter(e => e.category === cat);
}

function getCVExercises() {
  return exercises.filter(e => e.cvSupported);
}

module.exports = {
  exercises,
  getExercises,
  getExerciseById,
  getExercisesByCategory,
  getCVExercises
};
