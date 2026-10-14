const bcrypt = require('bcryptjs');

const defaultPasswordHash = bcrypt.hashSync('adventure123', 8);

const initialWorlds = [
  {
    id: 'world-1',
    name: 'Verdant Highlands',
    subtitle: 'The Awakening Plains',
    description: 'Begin your physical ascension through lush hills and ancient stones. Focus on core stability, bodyweight foundation, and stamina.',
    theme: 'emerald',
    icon: 'Trees',
    requiredLevel: 1,
    isUnlocked: true,
    totalNodes: 4,
    completedNodes: 2,
    nodes: [
      { id: 'w1-n1', name: 'Valley of Beginnings', type: 'workout', targetExercise: 'Bodyweight Squats', reps: 15, xpReward: 50, status: 'completed' },
      { id: 'w1-n2', name: 'Mossy Ridge Path', type: 'workout', targetExercise: 'Incline Pushups', reps: 12, xpReward: 65, status: 'completed' },
      { id: 'w1-n3', name: 'Echoing Glade', type: 'workout', targetExercise: 'Plank Hold', durationSeconds: 45, xpReward: 80, status: 'available' },
      { id: 'w1-n4', name: 'Guardian of the Glen', type: 'boss', targetExercise: 'Highland Circuit', rounds: 3, xpReward: 150, status: 'locked' }
    ]
  },
  {
    id: 'world-2',
    name: "Titan's Forge",
    subtitle: 'The Core of Iron & Fire',
    description: 'Test your raw power amidst glowing magma and colossal iron anvils. Focus on progressive overload, chest presses, and explosive leg drives.',
    theme: 'amber',
    icon: 'Flame',
    requiredLevel: 2,
    isUnlocked: true,
    totalNodes: 4,
    completedNodes: 1,
    nodes: [
      { id: 'w2-n1', name: 'Molten Steps', type: 'workout', targetExercise: 'Walking Lunges', reps: 20, xpReward: 75, status: 'completed' },
      { id: 'w2-n2', name: 'Anvil Crucible', type: 'workout', targetExercise: 'Standard Pushups', reps: 15, xpReward: 90, status: 'available' },
      { id: 'w2-n3', name: 'Ember Sprint', type: 'workout', targetExercise: 'Mountain Climbers', durationSeconds: 60, xpReward: 110, status: 'locked' },
      { id: 'w2-n4', name: 'Vulcan Colossus', type: 'boss', targetExercise: 'Titan Heavy Circuit', rounds: 4, xpReward: 200, status: 'locked' }
    ]
  },
  {
    id: 'world-3',
    name: 'Aether Peaks',
    subtitle: 'Floating Spires of Wind',
    description: 'Soar through thin air where cardio endurance and lung capacity rule. High-cadence movements, jumping jacks, and agility drills.',
    theme: 'cyan',
    icon: 'Wind',
    requiredLevel: 3,
    isUnlocked: true,
    totalNodes: 4,
    completedNodes: 0,
    nodes: [
      { id: 'w3-n1', name: 'Skyway Staircase', type: 'workout', targetExercise: 'Jumping Jacks', reps: 30, xpReward: 85, status: 'available' },
      { id: 'w3-n2', name: 'Zephyr Chasm', type: 'workout', targetExercise: 'High Knees', durationSeconds: 60, xpReward: 105, status: 'locked' },
      { id: 'w3-n3', name: 'Thunder Crest', type: 'workout', targetExercise: 'Burpee Overdrive', reps: 12, xpReward: 130, status: 'locked' },
      { id: 'w3-n4', name: 'Storm Falcon', type: 'boss', targetExercise: 'Aether Aerobic Trial', rounds: 4, xpReward: 220, status: 'locked' }
    ]
  },
  {
    id: 'world-4',
    name: 'Sanctuary of Serenity',
    subtitle: 'Sacred Waterfalls of Renewal',
    description: 'Restorative yoga flows, deep thoracic opening, and hamstring mobility. Essential for muscular longevity and active recovery.',
    theme: 'teal',
    icon: 'Sparkles',
    requiredLevel: 4,
    isUnlocked: false,
    totalNodes: 4,
    completedNodes: 0,
    nodes: [
      { id: 'w4-n1', name: 'Lotus Fountain', type: 'recovery', targetExercise: "Child's Pose & Cat-Cow", durationSeconds: 180, xpReward: 70, status: 'locked' },
      { id: 'w4-n2', name: 'Pond of Reflections', type: 'recovery', targetExercise: "Hamstring & Hip Openers", durationSeconds: 240, xpReward: 90, status: 'locked' },
      { id: 'w4-n3', name: 'Waterfall Stream', type: 'recovery', targetExercise: 'Spinal Twist & Bridge', durationSeconds: 300, xpReward: 110, status: 'locked' },
      { id: 'w4-n4', name: 'Zen Master Meditation', type: 'boss', targetExercise: 'Complete Mind-Body Alignment', rounds: 1, xpReward: 180, status: 'locked' }
    ]
  },
  {
    id: 'world-5',
    name: 'Cyber Matrix',
    subtitle: 'The Neon Frontier',
    description: 'Master advanced calisthenics, plyometrics, and neuromuscular coordination inside an overclocked holographic chamber.',
    theme: 'violet',
    icon: 'Cpu',
    requiredLevel: 5,
    isUnlocked: false,
    totalNodes: 4,
    completedNodes: 0,
    nodes: [
      { id: 'w5-n1', name: 'Grid Runner', type: 'workout', targetExercise: 'Plyo Jump Squats', reps: 20, xpReward: 110, status: 'locked' },
      { id: 'w5-n2', name: 'Neural Overdrive', type: 'workout', targetExercise: 'Diamond Pushups', reps: 15, xpReward: 130, status: 'locked' },
      { id: 'w5-n3', name: 'Quantum Leap', type: 'workout', targetExercise: 'Tuck Jumps & Plank Matrix', durationSeconds: 90, xpReward: 160, status: 'locked' },
      { id: 'w5-n4', name: 'Matrix Architect', type: 'boss', targetExercise: 'Apex Holo-Trial', rounds: 5, xpReward: 300, status: 'locked' }
    ]
  }
];

const initialAchievements = [
  { id: 'ach-1', title: 'First Awakening', description: 'Completed your very first fitness mission in the adventure.', icon: 'Award', rarity: 'Common', xpBonus: 50, unlockedAt: '2026-10-12T09:00:00.000Z' },
  { id: 'ach-2', title: 'Consistent Warrior', description: 'Maintained an active workout streak of 3 consecutive days.', icon: 'Flame', rarity: 'Rare', xpBonus: 100, unlockedAt: '2026-10-14T08:30:00.000Z' },
  { id: 'ach-3', title: 'Visionary Form', description: 'Logged 20+ repetitions verified by Computer Vision Pose Estimation.', icon: 'Camera', rarity: 'Rare', xpBonus: 100, unlockedAt: '2026-10-13T16:20:00.000Z' },
  { id: 'ach-4', title: 'Iron Core', description: 'Successfully finished 5 core and abdominal conditioning missions.', icon: 'Shield', rarity: 'Rare', xpBonus: 120, unlockedAt: null },
  { id: 'ach-5', title: 'Century Reps', description: 'Accumulated 100 total exercise repetitions across all sessions.', icon: 'Zap', rarity: 'Epic', xpBonus: 150, unlockedAt: null },
  { id: 'ach-6', title: 'Zen Practitioner', description: 'Completed 3 restorative mobility or mindful recovery sessions.', icon: 'Heart', rarity: 'Common', xpBonus: 80, unlockedAt: null },
  { id: 'ach-7', title: 'Titan Defier', description: 'Conquered the Titan’s Forge crucible and defeated Vulcan.', icon: 'Target', rarity: 'Epic', xpBonus: 250, unlockedAt: null },
  { id: 'ach-8', title: 'Highland Explorer', description: 'Completed all stage nodes in the Verdant Highlands.', icon: 'Compass', rarity: 'Rare', xpBonus: 150, unlockedAt: null },
  { id: 'ach-9', title: 'Tactical Mind', description: 'Modified a workout plan using AI Perceived Difficulty (RPE) feedback.', icon: 'Cpu', rarity: 'Common', xpBonus: 60, unlockedAt: '2026-10-13T17:00:00.000Z' },
  { id: 'ach-10', title: 'Endurance Legend', description: 'Accumulated over 120 total minutes of purposeful movement.', icon: 'Clock', rarity: 'Epic', xpBonus: 200, unlockedAt: null },
  { id: 'ach-11', title: 'Seven-Day Vanguard', description: 'Sustained a full 7-day fitness streak without missing a beat.', icon: 'Trophy', rarity: 'Legendary', xpBonus: 350, unlockedAt: null },
  { id: 'ach-12', title: 'Grandmaster Ascendant', description: 'Reached Character Level 10 and unlocked the Matrix Overlord crown.', icon: 'Crown', rarity: 'Legendary', xpBonus: 500, unlockedAt: null }
];

const initialMissions = [
  {
    id: 'quest-daily-1',
    category: 'daily',
    title: 'Highland Deep Squat Challenge',
    type: 'Strength Quest',
    difficulty: 'Beginner',
    targetExercise: 'Squats',
    targetReps: 20,
    estimatedMinutes: 10,
    xpReward: 60,
    cvSupported: true,
    description: 'Perform 20 controlled bodyweight squats focusing on parallel hip depth and upright chest posture.',
    instructions: [
      'Stand with feet shoulder-width apart, toes turned outward 10-15 degrees.',
      'Hinge at hips, bend knees, and lower until thighs are parallel to the floor.',
      'Drive through your heels to return to standing position. Lock out hips.'
    ],
    status: 'in_progress',
    progress: 12
  },
  {
    id: 'quest-daily-2',
    category: 'daily',
    title: 'Aether Cardio Sprint',
    type: 'Endurance Trail',
    difficulty: 'Intermediate',
    targetExercise: 'Jumping Jacks',
    targetReps: 35,
    estimatedMinutes: 8,
    xpReward: 75,
    cvSupported: true,
    description: 'Elevate your heart rate with rapid, rhythmic jumping jacks while keeping soft knee landings.',
    instructions: [
      'Begin with feet together and arms at your sides.',
      'Jump feet outward while sweeping arms overhead until hands touch or cross.',
      'Spring back to starting stance in a fluid rhythm.'
    ],
    status: 'available',
    progress: 0
  },
  {
    id: 'quest-daily-3',
    category: 'daily',
    title: 'Thoracic & Hip Mobility Flow',
    type: 'Mobility Explorer',
    difficulty: 'All Levels',
    targetExercise: 'Dynamic Mobility',
    targetReps: 1,
    estimatedMinutes: 12,
    xpReward: 50,
    cvSupported: false,
    description: 'Gentle spinal twists, cat-cows, and 90/90 hip switches to release lumbar tension.',
    instructions: [
      'Perform 10 slow Cat-Cow breaths on all fours.',
      'Follow with 5 deep thoracic rotations on each side.',
      'Finish with gentle Child’s Pose for 60 seconds.'
    ],
    status: 'available',
    progress: 0
  },
  {
    id: 'quest-weekly-1',
    category: 'weekly',
    title: 'Weekly Vanguard Endurance Challenge',
    type: 'Weekly Movement Challenge',
    difficulty: 'Intermediate',
    targetExercise: 'Combined Movements',
    targetMinutes: 60,
    xpReward: 250,
    cvSupported: true,
    description: 'Log at least 60 active workout minutes throughout the week to claim the Vanguard Chest.',
    instructions: [
      'Complete any combination of strength, mobility, or cardio quests.',
      'Check in daily for streak multipliers.'
    ],
    status: 'in_progress',
    progress: 35
  }
];

const initialUsers = [
  {
    id: 'user-demo-1',
    name: 'Alex Vance',
    email: 'alex@adventure.com',
    passwordHash: defaultPasswordHash,
    role: 'Adventurer',
    avatar: 'Aura Warrior',
    avatarClass: 'warrior',
    avatarColor: '#8b5cf6',
    title: 'Aura Apprentice',
    level: 3,
    xp: 420,
    xpToNextLevel: 600,
    streak: 3,
    lastActiveDate: '2026-10-14',
    fitnessGoals: ['strength', 'athleticism'],
    fitnessLevel: 'intermediate',
    availableEquipment: ['bodyweight', 'dumbbells'],
    preferredDurationMinutes: 30,
    weeklyActivityMinutes: 75,
    stats: {
      totalWorkouts: 8,
      totalMinutes: 145,
      totalReps: 210,
      totalCalories: 820,
      cvVerifiedReps: 45
    },
    preferences: {
      soundEnabled: true,
      cameraGuidance: true,
      darkTheme: true
    },
    createdAt: '2026-10-01T08:00:00.000Z'
  }
];

const initialWorkouts = [
  {
    id: 'w-hist-1',
    userId: 'user-demo-1',
    title: 'Highland Core & Squat Awakening',
    worldId: 'world-1',
    durationMinutes: 20,
    caloriesBurned: 120,
    xpEarned: 85,
    rpe: 6,
    difficultyFeedback: 'just_right',
    completedAt: '2026-10-14T08:15:00.000Z',
    exercises: [
      { name: 'Bodyweight Squats', sets: 3, reps: 15, cvVerified: true },
      { name: 'Standard Pushups', sets: 3, reps: 10, cvVerified: true },
      { name: 'Plank Hold', sets: 3, durationSeconds: 40, cvVerified: false }
    ]
  },
  {
    id: 'w-hist-2',
    userId: 'user-demo-1',
    title: 'Titan Molten Power Circuit',
    worldId: 'world-2',
    durationMinutes: 25,
    caloriesBurned: 160,
    xpEarned: 110,
    rpe: 7,
    difficultyFeedback: 'slightly_challenging',
    completedAt: '2026-10-13T16:00:00.000Z',
    exercises: [
      { name: 'Walking Lunges', sets: 3, reps: 20, cvVerified: false },
      { name: 'Dumbbell Bicep Curls', sets: 3, reps: 12, cvVerified: true },
      { name: 'Mountain Climbers', sets: 3, durationSeconds: 45, cvVerified: false }
    ]
  },
  {
    id: 'w-hist-3',
    userId: 'user-demo-1',
    title: 'Gentle Mobility & Spinal Reset',
    worldId: 'world-4',
    durationMinutes: 15,
    caloriesBurned: 55,
    xpEarned: 50,
    rpe: 3,
    difficultyFeedback: 'easy_recovery',
    completedAt: '2026-10-12T09:30:00.000Z',
    exercises: [
      { name: "Child's Pose", sets: 2, durationSeconds: 60, cvVerified: false },
      { name: 'Cat-Cow Flow', sets: 3, reps: 10, cvVerified: false },
      { name: 'Thoracic Rotations', sets: 2, reps: 8, cvVerified: false }
    ]
  }
];

module.exports = {
  initialWorlds,
  initialAchievements,
  initialMissions,
  initialUsers,
  initialWorkouts
};
