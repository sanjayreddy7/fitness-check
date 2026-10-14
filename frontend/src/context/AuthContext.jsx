import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setToken } from '../services/api';
import { soundEngine } from '../services/audioService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(localStorage.getItem('fitness_token'));
  const [isLoading, setIsLoading] = useState(true);
  const [levelUpData, setLevelUpData] = useState(null);
  const [unlockedBadgesQueue, setUnlockedBadgesQueue] = useState([]);

  useEffect(() => {
    async function loadInitialUser() {
      const storedToken = localStorage.getItem('fitness_token');
      const explicitlyLoggedOut = localStorage.getItem('fitness_logged_out') === 'true';

      if (storedToken) {
        try {
          const res = await api.getProfile();
          if (res && res.user) {
            setUser(res.user);
          }
        } catch (err) {
          console.warn('Initial session expired, clearing token');
          localStorage.removeItem('fitness_token');
        }
      } else if (!explicitlyLoggedOut) {
        // Auto-seed with demo user on initial launch for seamless evaluation
        try {
          const demoRes = await api.demoLogin();
          if (demoRes && demoRes.token) {
            setToken(demoRes.token);
            setTokenState(demoRes.token);
            setUser(demoRes.user);
          }
        } catch (e) {}
      }
      setIsLoading(false);
    }

    loadInitialUser();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    localStorage.removeItem('fitness_logged_out');
    try {
      const res = await api.login({ email, password });
      setToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    localStorage.removeItem('fitness_logged_out');
    try {
      const res = await api.register(userData);
      setToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async () => {
    setIsLoading(true);
    localStorage.removeItem('fitness_logged_out');
    try {
      const res = await api.demoLogin();
      setToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setTokenState(null);
    setUser(null);
    localStorage.setItem('fitness_logged_out', 'true');
  };

  const refreshUser = async () => {
    try {
      const res = await api.getProfile();
      if (res && res.user) {
        setUser(res.user);
      }
    } catch (e) {}
  };

  const handleWorkoutCompletionRewards = (rewards, updatedUser) => {
    if (updatedUser) {
      setUser(updatedUser);
    }
    if (rewards && rewards.leveledUp) {
      soundEngine.playLevelUpSound();
      setLevelUpData({
        newLevel: rewards.newLevel,
        earnedXP: rewards.earnedXP,
        title: updatedUser ? updatedUser.title : 'Ascended Warrior'
      });
    } else {
      soundEngine.playQuestCompleteSound();
    }

    if (rewards && rewards.unlockedBadges && rewards.unlockedBadges.length > 0) {
      setUnlockedBadgesQueue(prev => [...prev, ...rewards.unlockedBadges]);
    }
  };

  const closeLevelUpModal = () => {
    setLevelUpData(null);
  };

  const dismissNextBadge = () => {
    setUnlockedBadgesQueue(prev => prev.slice(1));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        refreshUser,
        setUser,
        handleWorkoutCompletionRewards,
        levelUpData,
        closeLevelUpModal,
        activeBadgePopup: unlockedBadgesQueue[0] || null,
        dismissNextBadge
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
