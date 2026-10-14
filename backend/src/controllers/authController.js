const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { JWT_SECRET } = require('../config/env');
const { calculateLevelFromXP, getCharacterTitle } = require('../services/gamificationService');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'Adventurer' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  const levelInfo = calculateLevelFromXP(safeUser.xp || 0);
  return {
    ...safeUser,
    ...levelInfo,
    title: getCharacterTitle(levelInfo.level, safeUser.avatarClass || 'warrior')
  };
}

async function register(req, res) {
  try {
    const { name, email, password, avatarClass = 'warrior', fitnessGoals = ['strength'] } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 8);
    const userId = `user-${Date.now()}`;

    const newUser = {
      id: userId,
      name,
      email,
      passwordHash,
      role: 'Adventurer',
      avatar: avatarClass === 'warrior' ? 'Aura Warrior' : (avatarClass === 'scout' ? 'Wind Strider' : 'Arcane Mage'),
      avatarClass,
      avatarColor: avatarClass === 'warrior' ? '#8b5cf6' : (avatarClass === 'scout' ? '#06b6d4' : '#10b981'),
      title: 'Novice Adventurer',
      level: 1,
      xp: 0,
      xpToNextLevel: 50,
      streak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      fitnessGoals: Array.isArray(fitnessGoals) ? fitnessGoals : [fitnessGoals],
      fitnessLevel: 'beginner',
      availableEquipment: ['bodyweight'],
      preferredDurationMinutes: 20,
      weeklyActivityMinutes: 0,
      stats: {
        totalWorkouts: 0,
        totalMinutes: 0,
        totalReps: 0,
        totalCalories: 0,
        cvVerifiedReps: 0
      },
      preferences: {
        soundEnabled: true,
        cameraGuidance: true,
        darkTheme: true
      },
      createdAt: new Date().toISOString()
    };

    db.createUser(newUser);
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to the Fitness Adventure.',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Welcome back, Adventurer!',
      token,
      user: sanitizeUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
}

function demoLogin(req, res) {
  const demoUser = db.getUserById('user-demo-1');
  if (!demoUser) {
    return res.status(404).json({ success: false, message: 'Demo profile not found.' });
  }
  const token = generateToken(demoUser);
  res.json({
    success: true,
    message: 'Signed in as Demo Adventurer Alex Vance.',
    token,
    user: sanitizeUser(demoUser)
  });
}

function getProfile(req, res) {
  res.json({
    success: true,
    user: sanitizeUser(req.user)
  });
}

function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const allowed = [
      'name', 'avatar', 'avatarClass', 'avatarColor', 'fitnessGoals',
      'fitnessLevel', 'availableEquipment', 'preferredDurationMinutes',
      'preferences'
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const updated = db.updateUser(userId, updates);
    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: sanitizeUser(updated)
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

module.exports = {
  register,
  login,
  demoLogin,
  getProfile,
  updateProfile
};
