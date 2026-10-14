import React, { useState } from 'react';
import {
  User,
  Shield,
  Sliders,
  CheckCircle2,
  Sparkles,
  Award,
  Flame,
  Save,
  Dumbbell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function ProfileSettings() {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || 'Alex Vance');
  const [avatarClass, setAvatarClass] = useState(user?.avatarClass || 'warrior');
  const [fitnessLevel, setFitnessLevel] = useState(user?.fitnessLevel || 'intermediate');
  const [goals, setGoals] = useState(user?.fitnessGoals || ['strength']);
  const [preferredDuration, setPreferredDuration] = useState(user?.preferredDurationMinutes || 30);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const classes = [
    { id: 'warrior', name: 'Aura Warrior', icon: '⚔️', desc: 'Focuses on progressive strength, barbell lifts, and high force output.' },
    { id: 'scout', name: 'Wind Strider', icon: '🏹', desc: 'Agility, rapid calisthenics, plyometrics, and lung capacity.' },
    { id: 'mage', name: 'Arcane Mage', icon: '✨', desc: 'Neuro-muscular coordination, explosive power, and balanced mobility.' },
    { id: 'healer', name: 'Zen Guardian', icon: '🌿', desc: 'Restorative mobility, spinal longevity, posture correction, and recovery.' }
  ];

  const handleGoalToggle = (g) => {
    if (goals.includes(g)) {
      if (goals.length > 1) setGoals(goals.filter(item => item !== g));
    } else {
      setGoals([...goals, g]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.updateProfile({
        name,
        avatarClass,
        avatar: classes.find(c => c.id === avatarClass)?.name || 'Adventurer',
        fitnessLevel,
        fitnessGoals: goals,
        preferredDurationMinutes: parseInt(preferredDuration, 10)
      });

      if (res && res.success) {
        setUser(res.user);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
            Adventurer Identity
          </span>
          <span className="text-xs text-slate-400">Customization & Attributes</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-white mt-1">
          Profile & Fitness Goals
        </h1>
        <p className="text-xs lg:text-sm text-slate-300">
          Personalize your hero class, fitness goals, and training preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="glass-panel rounded-3xl p-6 lg:p-8 border border-slate-800 space-y-8 shadow-2xl">
        {/* Name input */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Adventurer Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
            required
          />
        </div>

        {/* Hero Class Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Character Class
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.map((c) => (
              <div
                key={c.id}
                onClick={() => setAvatarClass(c.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  avatarClass === c.id
                    ? 'bg-purple-900/30 border-purple-500 ring-2 ring-purple-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{c.icon}</span>
                  <div>
                    <h4 className="font-bold text-sm text-white">{c.name}</h4>
                    <span className="text-[10px] font-mono text-purple-300 uppercase">{c.id}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-snug">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fitness Level */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Base Fitness Experience
          </label>
          <div className="grid grid-cols-3 gap-3">
            {['beginner', 'intermediate', 'advanced'].map(lvl => (
              <button
                key={lvl}
                type="button"
                onClick={() => setFitnessLevel(lvl)}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold capitalize transition-all border ${
                  fitnessLevel === lvl
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Fitness Goals */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Training Focus
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'strength', label: 'Strength' },
              { id: 'endurance', label: 'Endurance' },
              { id: 'mobility', label: 'Mobility' },
              { id: 'athleticism', label: 'Athleticism' }
            ].map(g => {
              const active = goals.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleGoalToggle(g.id)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    active
                      ? 'bg-purple-600/30 border-purple-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  ✓ {g.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          {isSaved ? (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Attributes Saved!
            </span>
          ) : (
            <span className="text-xs text-slate-500">Changes persist in your profile.</span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
