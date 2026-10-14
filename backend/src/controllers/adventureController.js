const db = require('../database/db');
const { processWorkoutRewards } = require('../services/gamificationService');

function getWorlds(req, res) {
  try {
    const user = req.user;
    const worlds = db.getWorlds();

    // Check level unlocks dynamically
    const dynamicWorlds = worlds.map(w => {
      const isUnlocked = user.level >= w.requiredLevel;
      return {
        ...w,
        isUnlocked
      };
    });

    res.json({
      success: true,
      worlds: dynamicWorlds
    });
  } catch (err) {
    console.error('Get worlds error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch adventure worlds.' });
  }
}

function getMissions(req, res) {
  try {
    const missions = db.getMissions();
    res.json({
      success: true,
      missions
    });
  } catch (err) {
    console.error('Get missions error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch missions.' });
  }
}

function swapMission(req, res) {
  try {
    const { missionId } = req.params;
    const existing = db.getMissionById(missionId);

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Mission not found.' });
    }

    // Pool of replacement missions
    const alternatives = [
      {
        title: 'Mobility & Thoracic Alignment',
        type: 'Mobility Explorer',
        difficulty: 'All Levels',
        targetExercise: 'Dynamic Mobility',
        targetReps: 1,
        estimatedMinutes: 10,
        xpReward: 55,
        cvSupported: false,
        description: 'Gentle spinal decompression, quad stretches, and deep hip openers.',
        instructions: ['10 slow Cat-Cow breaths', '5 Thoracic Rotations each side', 'Child’s Pose for 60s']
      },
      {
        title: 'Core Citadel Isometric Lock',
        type: 'Strength Quest',
        difficulty: 'Beginner',
        targetExercise: 'Plank Hold',
        targetReps: 3,
        estimatedMinutes: 8,
        xpReward: 65,
        cvSupported: true,
        description: 'Hold 3 sets of 30-second rigid planks to fortify your core stability.',
        instructions: ['Align elbows directly beneath shoulders', 'Brace core like anticipating a punch', 'Breathe steadily']
      },
      {
        title: 'Cardio Mountain Ascent',
        type: 'Endurance Trail',
        difficulty: 'Intermediate',
        targetExercise: 'Mountain Climbers',
        targetReps: 40,
        estimatedMinutes: 10,
        xpReward: 70,
        cvSupported: false,
        description: 'Rapid knee drives in plank stance to burn calories and build cardiovascular stamina.',
        instructions: ['Start in high pushup plank', 'Drive knees towards chest in alternating cadence', 'Keep shoulders stable']
      }
    ];

    // Pick an alternative different from current type
    const replacement = alternatives.find(a => a.type !== existing.type) || alternatives[0];

    const updated = db.updateMission(missionId, {
      ...replacement,
      status: 'available',
      progress: 0
    });

    res.json({
      success: true,
      message: 'Mission swapped successfully!',
      mission: updated
    });
  } catch (err) {
    console.error('Swap mission error:', err);
    res.status(500).json({ success: false, message: 'Failed to swap mission.' });
  }
}

function completeMission(req, res) {
  try {
    const { missionId } = req.params;
    const mission = db.getMissionById(missionId);

    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission not found.' });
    }

    const rewardResult = processWorkoutRewards(req.user.id, {
      durationMinutes: mission.estimatedMinutes || 10,
      totalReps: mission.targetReps || 15,
      cvVerifiedReps: mission.cvSupported ? Math.round(mission.targetReps * 0.8) : 0,
      isRecovery: mission.type === 'Mobility Explorer'
    });

    const updatedMission = db.updateMission(missionId, {
      status: 'completed',
      progress: 100
    });

    res.json({
      success: true,
      message: `Quest "${mission.title}" completed! You earned ${rewardResult.earnedXP} XP.`,
      mission: updatedMission,
      rewards: {
        earnedXP: rewardResult.earnedXP,
        newStreak: rewardResult.newStreak,
        leveledUp: rewardResult.leveledUp,
        newLevel: rewardResult.newLevel,
        unlockedBadges: rewardResult.unlockedBadges
      },
      user: rewardResult.updatedUser
    });
  } catch (err) {
    console.error('Complete mission error:', err);
    res.status(500).json({ success: false, message: 'Failed to complete mission.' });
  }
}

function getAchievements(req, res) {
  try {
    const achievements = db.getAchievements();
    const unlockedCount = achievements.filter(a => a.unlockedAt).length;
    res.json({
      success: true,
      total: achievements.length,
      unlockedCount,
      achievements
    });
  } catch (err) {
    console.error('Get achievements error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch achievements.' });
  }
}

module.exports = {
  getWorlds,
  getMissions,
  swapMission,
  completeMission,
  getAchievements
};
