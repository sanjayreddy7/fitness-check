const { exercises, getExercises } = require('./exerciseDatabase');

/**
 * Dynamic AI Plan Generator with Perceived Difficulty (RPE) Adaptation
 */
function generatePersonalizedPlan(options = {}) {
  const {
    fitnessLevel = 'intermediate',
    goal = 'strength',
    equipment = ['bodyweight'],
    timeMinutes = 30,
    preferredActivity = 'all',
    previousFeedback = null, // e.g. { rpe: 8, difficulty: 'too_hard', completedPercentage: 70 }
    streak = 1
  } = options;

  const all = getExercises();
  const normalizedEquip = Array.isArray(equipment) ? equipment : [equipment];

  // Filter exercises matching equipment availability or bodyweight fallback
  const available = all.filter(e => 
    normalizedEquip.includes(e.equipment) || e.equipment === 'bodyweight'
  );

  // Difficulty adjustment factor based on user feedback
  let volumeMultiplier = 1.0;
  let intensityNote = 'Standard progression based on profile.';

  if (previousFeedback) {
    const { rpe, difficulty } = previousFeedback;
    if (difficulty === 'too_hard' || rpe >= 8) {
      volumeMultiplier = 0.8;
      intensityNote = 'Workload slightly scaled down based on high fatigue report (RPE 8+). Focus on clean technique.';
    } else if (difficulty === 'too_easy' || rpe <= 4) {
      volumeMultiplier = 1.2;
      intensityNote = 'Workload scaled up with added volume due to effortless previous session.';
    }
  }

  // Determine number of main exercises based on time
  let numExercises = 3;
  if (timeMinutes >= 45) numExercises = 5;
  else if (timeMinutes >= 30) numExercises = 4;
  else numExercises = 3;

  // Warmup exercises (dynamic mobility)
  const warmups = [
    { name: 'Arm Circles & Torso Twists', durationSeconds: 60, focus: 'Shoulder & Thoracic Mobilization' },
    { name: 'Cat-Cow Spinal Flow', durationSeconds: 60, focus: 'Spinal Decompression & Core Awakening' },
    { name: 'Bodyweight Hip Hinges & Ankle Rolls', durationSeconds: 60, focus: 'Lower Kinetic Chain Priming' }
  ];

  // Cooldown exercises
  const cooldowns = [
    { name: "Balasana (Child's Pose)", durationSeconds: 90, focus: 'Parasympathetic Nervous System Activation' },
    { name: 'Seated Hamstring & Quad Reaches', durationSeconds: 90, focus: 'Tension Release & Lactic Clearance' },
    { name: 'Deep Diaphragmatic Box Breathing', durationSeconds: 60, focus: 'Heart Rate Normalization' }
  ];

  // Select main movements prioritized by goal
  let targetExercises = [];
  if (goal === 'flexibility' || goal === 'mobility') {
    targetExercises = available.filter(e => e.category === 'mobility');
  } else if (goal === 'endurance') {
    targetExercises = available.filter(e => e.category === 'cardio' || e.cvType === 'jumping_jack');
  } else {
    // strength / general fitness
    targetExercises = available.filter(e => e.category === 'strength' || e.category === 'core');
  }

  // If not enough matching, pad with other available exercises
  if (targetExercises.length < numExercises) {
    const remaining = available.filter(e => !targetExercises.includes(e));
    targetExercises = [...targetExercises, ...remaining];
  }

  // Shuffle and slice
  const selected = targetExercises.slice(0, numExercises);

  // Format main workout items with calculated sets and reps
  const baseSets = fitnessLevel === 'beginner' ? 2 : (fitnessLevel === 'advanced' ? 4 : 3);
  const adjustedSets = Math.max(2, Math.round(baseSets * (volumeMultiplier >= 1.2 ? 1.2 : (volumeMultiplier <= 0.8 ? 0.8 : 1))));

  const mainCircuits = selected.map((ex, index) => {
    let reps = 12;
    if (ex.cvType === 'squat') reps = fitnessLevel === 'beginner' ? 10 : 15;
    if (ex.cvType === 'pushup') reps = fitnessLevel === 'beginner' ? 8 : 12;
    if (ex.cvType === 'jumping_jack') reps = 30;
    if (ex.cvType === 'bicep_curl') reps = 12;

    const adjustedReps = Math.round(reps * volumeMultiplier);

    return {
      step: index + 1,
      exerciseId: ex.id,
      name: ex.name,
      category: ex.category,
      sets: adjustedSets,
      reps: adjustedReps,
      restSeconds: fitnessLevel === 'beginner' ? 60 : 45,
      cvSupported: !!ex.cvSupported,
      cvType: ex.cvType || null,
      postureTip: ex.postureTips ? ex.postureTips[0] : 'Maintain tight core and smooth breathing.',
      regression: ex.regression,
      progression: ex.progression
    };
  });

  const estimatedCalories = Math.round(timeMinutes * (goal === 'endurance' ? 8.5 : 6.5));
  const baseXP = Math.round(timeMinutes * 2.5);
  const streakMultiplier = streak >= 5 ? 1.25 : (streak >= 3 ? 1.15 : 1.0);
  const xpReward = Math.round(baseXP * streakMultiplier);

  return {
    id: `plan-${Date.now()}`,
    title: `${capitalize(goal)} Ascension Protocol`,
    goal,
    fitnessLevel,
    durationMinutes: timeMinutes,
    intensityNote,
    volumeMultiplier,
    estimatedCalories,
    xpReward,
    streakBonusApplied: streakMultiplier > 1.0,
    warmup: warmups,
    circuits: mainCircuits,
    cooldown: cooldowns,
    recoveryAdvice: {
      hydration: 'Drink 400-500ml water with electrolytes within 30 minutes post-session.',
      nutrition: 'Target 20-30g lean protein for muscle protein synthesis.',
      rest: 'Optimal recovery requires 7-8 hours sleep. If soreness persists tomorrow, engage in Active Recovery.'
    },
    safetyDisclaimer: 'Perform all movements within a pain-free range of motion. Cease exercise immediately if experiencing joint discomfort or sharp pain.'
  };
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

module.exports = {
  generatePersonalizedPlan
};
