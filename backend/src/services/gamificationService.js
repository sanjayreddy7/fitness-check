const db = require('../database/db');

/**
 * Gamification Service - Experience points, streaks, level progressions, and badges
 */

function calculateLevelFromXP(xp) {
  // Level formula: level = 1 + floor(sqrt(xp / 50))
  // Level 1: 0 - 49 XP
  // Level 2: 50 - 199 XP
  // Level 3: 200 - 449 XP
  // Level 4: 450 - 799 XP
  // Level 5: 800 - 1249 XP
  const level = Math.max(1, Math.floor(1 + Math.sqrt(xp / 50)));
  const nextLevelXP = Math.pow(level, 2) * 50;
  const currentLevelBaseXP = Math.pow(level - 1, 2) * 50;
  return {
    level,
    xpToNextLevel: nextLevelXP,
    progressPercentage: Math.min(100, Math.round(((xp - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP)) * 100))
  };
}

function getCharacterTitle(level, avatarClass = 'warrior') {
  const titles = {
    warrior: ['Novice Berserker', 'Iron Vanguard', 'Aura Knight', 'Titan Conqueror', 'Apex Grandmaster'],
    scout: ['Swift Wanderer', 'Wind Runner', 'Shadow Tracker', 'Phantom Strider', 'Storm Ranger'],
    mage: ['Arcane Initiate', 'Aether Channeler', 'Elemental Weaver', 'Sanctuary Sage', 'Cosmic Archon'],
    healer: ['Acolyte of Renewal', 'Vitality Guardian', 'Serenity Keeper', 'Zen Master', 'Immortal Restorer']
  };

  const list = titles[avatarClass] || titles.warrior;
  const idx = Math.min(list.length - 1, Math.floor((level - 1) / 2));
  return list[idx];
}

function processWorkoutRewards(userId, workoutData) {
  const user = db.getUserById(userId);
  if (!user) throw new Error('User not found');

  const {
    durationMinutes = 20,
    totalReps = 0,
    cvVerifiedReps = 0,
    isRecovery = false,
    rpe = 6
  } = workoutData;

  // Base XP
  let earnedXP = isRecovery ? 50 : Math.round(durationMinutes * 3.5);
  // Rep bonus
  earnedXP += Math.round(totalReps * 0.5);
  // Computer Vision accuracy verification bonus
  earnedXP += Math.round(cvVerifiedReps * 1.5);

  // Streak calculation
  const todayStr = new Date().toISOString().split('T')[0];
  let newStreak = user.streak || 1;

  if (user.lastActiveDate) {
    const lastDate = new Date(user.lastActiveDate);
    const today = new Date(todayStr);
    const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays === 0) {
      // same day, streak unchanged
    } else if (diffDays > 2) {
      // Missed more than 2 days, reset streak gently to 1
      newStreak = 1;
    }
    // Note: diffDays === 2 allows a grace rest day without resetting streak!
  }

  // Streak Multiplier
  let streakMultiplier = 1.0;
  if (newStreak >= 7) streakMultiplier = 1.35;
  else if (newStreak >= 5) streakMultiplier = 1.25;
  else if (newStreak >= 3) streakMultiplier = 1.15;

  const totalXP = user.xp + Math.round(earnedXP * streakMultiplier);
  const { level: newLevel, xpToNextLevel } = calculateLevelFromXP(totalXP);
  const leveledUp = newLevel > user.level;

  // Update user statistics
  const currentStats = user.stats || {
    totalWorkouts: 0,
    totalMinutes: 0,
    totalReps: 0,
    totalCalories: 0,
    cvVerifiedReps: 0
  };

  const estimatedCalories = Math.round(durationMinutes * 7.2);

  const updatedStats = {
    totalWorkouts: currentStats.totalWorkouts + 1,
    totalMinutes: currentStats.totalMinutes + durationMinutes,
    totalReps: currentStats.totalReps + totalReps,
    totalCalories: currentStats.totalCalories + estimatedCalories,
    cvVerifiedReps: currentStats.cvVerifiedReps + cvVerifiedReps
  };

  const updatedUser = db.updateUser(userId, {
    xp: totalXP,
    level: newLevel,
    xpToNextLevel,
    streak: newStreak,
    title: getCharacterTitle(newLevel, user.avatarClass),
    lastActiveDate: todayStr,
    weeklyActivityMinutes: (user.weeklyActivityMinutes || 0) + durationMinutes,
    stats: updatedStats
  });

  // Evaluate any newly unlocked achievements
  const unlockedBadges = evaluateAchievements(updatedUser);

  return {
    earnedXP: Math.round(earnedXP * streakMultiplier),
    baseXP: earnedXP,
    streakMultiplier,
    newStreak,
    leveledUp,
    newLevel,
    unlockedBadges,
    updatedUser
  };
}

function evaluateAchievements(user) {
  const achievements = db.getAchievements();
  const newlyUnlocked = [];

  for (const ach of achievements) {
    if (ach.unlockedAt) continue; // Already unlocked

    let shouldUnlock = false;

    switch (ach.id) {
      case 'ach-1': // First awakening (1 workout)
        if (user.stats.totalWorkouts >= 1) shouldUnlock = true;
        break;
      case 'ach-2': // Consistent Warrior (3-day streak)
        if (user.streak >= 3) shouldUnlock = true;
        break;
      case 'ach-3': // Visionary Form (20+ CV verified reps)
        if (user.stats.cvVerifiedReps >= 20) shouldUnlock = true;
        break;
      case 'ach-4': // Iron Core (5 workouts)
        if (user.stats.totalWorkouts >= 5) shouldUnlock = true;
        break;
      case 'ach-5': // Century Reps (100 total reps)
        if (user.stats.totalReps >= 100) shouldUnlock = true;
        break;
      case 'ach-10': // Endurance Legend (120+ minutes)
        if (user.stats.totalMinutes >= 120) shouldUnlock = true;
        break;
      case 'ach-11': // Seven-Day Vanguard
        if (user.streak >= 7) shouldUnlock = true;
        break;
      case 'ach-12': // Level 10 Grandmaster
        if (user.level >= 10) shouldUnlock = true;
        break;
      default:
        break;
    }

    if (shouldUnlock) {
      const unlocked = db.unlockAchievement(ach.id);
      if (unlocked) {
        newlyUnlocked.push(unlocked);
      }
    }
  }

  return newlyUnlocked;
}

module.exports = {
  calculateLevelFromXP,
  getCharacterTitle,
  processWorkoutRewards,
  evaluateAchievements
};
