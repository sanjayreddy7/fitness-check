/**
 * Central API Client for AI Fitness Adventure
 */

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocal) {
      return 'https://fitness-check.onrender.com/api';
    }
  }
  return '/api';
};

const BASE_URL = getBaseUrl();

function getToken() {
  return localStorage.getItem('fitness_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('fitness_token', token);
  } else {
    localStorage.removeItem('fitness_token');
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.message || `Request failed with status ${res.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  demoLogin: () => request('/auth/demo-login', { method: 'POST' }),
  getProfile: () => request('/auth/profile'),
  updateProfile: (updates) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(updates) }),

  // Workouts
  generatePlan: (params) => request('/workouts/generate-plan', { method: 'POST', body: JSON.stringify(params) }),
  logWorkout: (workout) => request('/workouts/log', { method: 'POST', body: JSON.stringify(workout) }),
  getHistory: () => request('/workouts/history'),
  getExercises: () => request('/workouts/exercises'),

  // Adventure
  getWorlds: () => request('/adventure/worlds'),
  getMissions: () => request('/adventure/missions'),
  swapMission: (missionId) => request(`/adventure/missions/${missionId}/swap`, { method: 'POST' }),
  completeMission: (missionId) => request(`/adventure/missions/${missionId}/complete`, { method: 'POST' }),
  getAchievements: () => request('/adventure/achievements'),

  // AI Coach
  chatWithCoach: (message) => request('/ai-coach/chat', { method: 'POST', body: JSON.stringify({ message }) }),
  getChatHistory: () => request('/ai-coach/history'),
  getCoachTips: () => request('/ai-coach/tips'),

  // Analytics
  getAnalytics: () => request('/analytics/dashboard')
};
