import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { soundEngine } from '../services/audioService';

export default function Register({ setActiveTab }) {
  const { register, demoLogin } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatarClass, setAvatarClass] = useState('warrior');
  const [fitnessLevel, setFitnessLevel] = useState('beginner');
  const [goals, setGoals] = useState(['strength']);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const heroClasses = [
    {
      id: 'warrior',
      name: 'Aura Warrior',
      icon: '⚔️',
      color: 'purple',
      focus: 'High Force & Calisthenics',
      desc: 'Excels at bodyweight squats, chest presses, and core stability.'
    },
    {
      id: 'scout',
      name: 'Wind Strider',
      icon: '🏹',
      color: 'cyan',
      focus: 'Agility & Cardio Cadence',
      desc: 'Specializes in high-cadence jumping jacks, mountain climbers, and lung capacity.'
    },
    {
      id: 'mage',
      name: 'Arcane Mage',
      icon: '✨',
      color: 'indigo',
      focus: 'Neuromuscular Balance',
      desc: 'Harnesses explosive plyometric coordination and balanced kinetic flow.'
    },
    {
      id: 'healer',
      name: 'Zen Guardian',
      icon: '🌿',
      color: 'emerald',
      focus: 'Mobility & Longevity',
      desc: 'Dedicated to spinal decompressive flows, thoracic opening, and rapid recovery.'
    }
  ];

  const handleGoalToggle = (g) => {
    if (goals.includes(g)) {
      if (goals.length > 1) setGoals(goals.filter(i => i !== g));
    } else {
      setGoals([...goals, g]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your Adventurer / Hero Name.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        avatarClass,
        fitnessGoals: goals,
        fitnessLevel
      });
      soundEngine.playLevelUpSound();
      setActiveTab('dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. A user with this email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setError(null);
    setDemoLoading(true);
    try {
      await demoLogin();
      soundEngine.playQuestCompleteSound();
      setActiveTab('dashboard');
    } catch (err) {
      setError('Demo authentication failed.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10 animate-fade-in">
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Hero Initialization Portal</span>
            </div>
            <h1 className="text-3xl font-black text-white">Create Your Adventurer</h1>
            <p className="text-xs text-slate-400 mt-1">
              Select your character class, set baseline attributes, and unlock the 5 Adventure Worlds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDemoClick}
              disabled={demoLoading}
              className="px-4 py-2.5 rounded-xl bg-slate-900 border border-purple-500/40 hover:bg-slate-800 text-purple-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{demoLoading ? 'Logging In...' : 'Instant Demo Login'}</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 6 Columns: Account Credentials */}
            <div className="lg:col-span-6 space-y-5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-400" />
                <span>1. Adventurer Credentials</span>
              </h3>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Hero Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@adventure.com"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full bg-slate-900/90 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full bg-slate-900/90 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Baseline Fitness Level */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Baseline Experience
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['beginner', 'intermediate', 'advanced'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFitnessLevel(lvl)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
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

              {/* Primary Goals */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Primary Goals
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'strength', label: 'Strength & Power' },
                    { id: 'endurance', label: 'Cardio Stamina' },
                    { id: 'mobility', label: 'Mobility & Recovery' },
                    { id: 'athleticism', label: 'Athletic Conditioning' }
                  ].map((g) => {
                    const active = goals.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleGoalToggle(g.id)}
                        className={`p-2 rounded-xl text-left font-semibold border transition-all ${
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
            </div>

            {/* Right 6 Columns: Hero Class / Archetype Selection */}
            <div className="lg:col-span-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>2. Select Hero Archetype</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {heroClasses.map((c) => {
                  const isSelected = avatarClass === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setAvatarClass(c.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-900/40 border-purple-400 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/20'
                          : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{c.icon}</span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {c.id}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-white">{c.name}</h4>
                        <div className="text-[11px] font-mono text-cyan-300 mt-0.5">{c.focus}</div>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{c.desc}</p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Starting Rank</span>
                        <span className="font-bold text-white">Level 1 (0 XP)</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Non-Medical Disclaimer reminder */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Personal data is kept strictly private. Camera tracking is processed 100% on-device.</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-400 text-center sm:text-left">
              Already have an adventurer persona?{' '}
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 ml-1"
              >
                Sign In Instead
              </button>
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 hover:scale-105 disabled:opacity-50"
            >
              <span>{loading ? 'Initializing Persona...' : 'Initialize Hero & Begin Ascension'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
