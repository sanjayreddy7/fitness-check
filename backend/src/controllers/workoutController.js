const db = require('../database/db');
const { generatePersonalizedPlan } = require('../services/planGeneratorService');
const { processWorkoutRewards } = require('../services/gamificationService');
const { getExercises, getExerciseById, getCVExercises } = require('../services/exerciseDatabase');

function generatePlan(req, res) {
  try {
    const user = req.user;
    const {
      fitnessLevel = user.fitnessLevel || 'intermediate',
      goal = (user.fitnessGoals && user.fitnessGoals[0]) || 'strength',
      equipment = user.availableEquipment || ['bodyweight'],
      timeMinutes = user.preferredDurationMinutes || 30,
      previousFeedback = null
    } = req.body;

    const plan = generatePersonalizedPlan({
      fitnessLevel,
      goal,
      equipment,
      timeMinutes: parseInt(timeMinutes, 10),
      previousFeedback,
      streak: user.streak || 1
    });

    res.json({
      success: true,
      plan
    });
  } catch (err) {
    console.error('Plan generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate personalized workout plan.' });
  }
}

function logWorkout(req, res) {
  try {
    const userId = req.user.id;
    const {
      title = 'Adventure Training Session',
      worldId = 'world-1',
      nodeId = null,
      questId = null,
      durationMinutes = 20,
      totalReps = 0,
      cvVerifiedReps = 0,
      rpe = 6,
      difficultyFeedback = 'just_right',
      exercises = [],
      isRecovery = false
    } = req.body;

    // Process rewards (XP, streaks, level progression, badges)
    const rewardResult = processWorkoutRewards(userId, {
      durationMinutes: parseInt(durationMinutes, 10) || 15,
      totalReps: parseInt(totalReps, 10) || 0,
      cvVerifiedReps: parseInt(cvVerifiedReps, 10) || 0,
      isRecovery: !!isRecovery,
      rpe: parseInt(rpe, 10) || 6
    });

    const newWorkout = {
      id: `w-${Date.now()}`,
      userId,
      title,
      worldId,
      nodeId,
      questId,
      durationMinutes: parseInt(durationMinutes, 10),
      caloriesBurned: Math.round(durationMinutes * 7.2),
      xpEarned: rewardResult.earnedXP,
      rpe: parseInt(rpe, 10),
      difficultyFeedback,
      completedAt: new Date().toISOString(),
      exercises
    };

    db.createWorkout(newWorkout);

    // If node was specified, mark node completed
    if (worldId && nodeId) {
      db.updateWorldNode(worldId, nodeId, { status: 'completed' });
    }

    // If quest was specified, update quest status
    if (questId) {
      db.updateMission(questId, { status: 'completed', progress: 100 });
    }

    res.status(201).json({
      success: true,
      message: 'Workout successfully recorded! Rewards claimed.',
      workout: newWorkout,
      rewards: {
        earnedXP: rewardResult.earnedXP,
        newStreak: rewardResult.newStreak,
        leveledUp: rewardResult.leveledUp,
        newLevel: rewardResult.newLevel,
        unlockedBadges: rewardResult.unlockedBadges
      },
      updatedUser: rewardResult.updatedUser
    });
  } catch (err) {
    console.error('Log workout error:', err);
    res.status(500).json({ success: false, message: 'Failed to record workout session.' });
  }
}

function getHistory(req, res) {
  try {
    const workouts = db.getWorkoutsByUserId(req.user.id);
    res.json({
      success: true,
      workouts
    });
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ success: false, message: 'Failed to load workout history.' });
  }
}

function getExerciseLibrary(req, res) {
  const all = getExercises();
  const cvSupported = getCVExercises();
  res.json({
    success: true,
    total: all.length,
    cvSupportedCount: cvSupported.length,
    exercises: all
  });
}

module.exports = {
  generatePlan,
  logWorkout,
  getHistory,
  getExerciseLibrary
};
