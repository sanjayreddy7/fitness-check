const fs = require('fs');
const path = require('path');
const {
  initialWorlds,
  initialAchievements,
  initialMissions,
  initialUsers,
  initialWorkouts
} = require('./seedData');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'fitness_adventure_db.json');

class Database {
  constructor() {
    this.data = {
      users: [],
      workouts: [],
      missions: [],
      worlds: [],
      achievements: [],
      chatHistory: []
    };
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure all top-level keys exist
        if (!this.data.users) this.data.users = initialUsers;
        if (!this.data.workouts) this.data.workouts = initialWorkouts;
        if (!this.data.missions) this.data.missions = initialMissions;
        if (!this.data.worlds) this.data.worlds = initialWorlds;
        if (!this.data.achievements) this.data.achievements = initialAchievements;
        if (!this.data.chatHistory) this.data.chatHistory = [];
      } else {
        this.data = {
          users: initialUsers,
          workouts: initialWorkouts,
          missions: initialMissions,
          worlds: initialWorlds,
          achievements: initialAchievements,
          chatHistory: []
        };
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database, using fresh seed:', err);
      this.data = {
        users: initialUsers,
        workouts: initialWorkouts,
        missions: initialMissions,
        worlds: initialWorlds,
        achievements: initialAchievements,
        chatHistory: []
      };
      this.save();
    }
  }

  save() {
    try {
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to atomically write DB:', err);
      // Fallback direct write
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    }
  }

  // --- Users ---
  getUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(userData) {
    this.data.users.push(userData);
    this.save();
    return userData;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }

  // --- Workouts ---
  getWorkoutsByUserId(userId) {
    return this.data.workouts
      .filter(w => w.userId === userId)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  }

  createWorkout(workout) {
    this.data.workouts.unshift(workout);
    this.save();
    return workout;
  }

  // --- Worlds ---
  getWorlds() {
    return this.data.worlds;
  }

  getWorldById(id) {
    return this.data.worlds.find(w => w.id === id);
  }

  updateWorldNode(worldId, nodeId, updates) {
    const world = this.getWorldById(worldId);
    if (world && world.nodes) {
      const node = world.nodes.find(n => n.id === nodeId);
      if (node) {
        Object.assign(node, updates);
        // Recount completed nodes
        world.completedNodes = world.nodes.filter(n => n.status === 'completed').length;
        this.save();
        return { world, node };
      }
    }
    return null;
  }

  unlockWorld(worldId) {
    const world = this.getWorldById(worldId);
    if (world) {
      world.isUnlocked = true;
      this.save();
      return world;
    }
    return null;
  }

  // --- Missions ---
  getMissions() {
    return this.data.missions;
  }

  getMissionById(id) {
    return this.data.missions.find(m => m.id === id);
  }

  updateMission(id, updates) {
    const idx = this.data.missions.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.data.missions[idx] = { ...this.data.missions[idx], ...updates };
      this.save();
      return this.data.missions[idx];
    }
    return null;
  }

  addMission(mission) {
    this.data.missions.push(mission);
    this.save();
    return mission;
  }

  // --- Achievements ---
  getAchievements() {
    return this.data.achievements;
  }

  unlockAchievement(id) {
    const ach = this.data.achievements.find(a => a.id === id);
    if (ach && !ach.unlockedAt) {
      ach.unlockedAt = new Date().toISOString();
      this.save();
      return ach;
    }
    return null;
  }

  // --- Chat History ---
  getChatHistory(userId) {
    return this.data.chatHistory
      .filter(c => c.userId === userId)
      .slice(-30);
  }

  addChatMessage(userId, message) {
    this.data.chatHistory.push({
      userId,
      ...message,
      timestamp: new Date().toISOString()
    });
    // Cap to 200 messages
    if (this.data.chatHistory.length > 200) {
      this.data.chatHistory = this.data.chatHistory.slice(-200);
    }
    this.save();
  }

  resetAll() {
    this.data = {
      users: initialUsers,
      workouts: initialWorkouts,
      missions: initialMissions,
      worlds: initialWorlds,
      achievements: initialAchievements,
      chatHistory: []
    };
    this.save();
  }
}

const db = new Database();

module.exports = db;
