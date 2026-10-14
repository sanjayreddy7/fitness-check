import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Compass,
  Trophy,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { soundEngine } from '../services/audioService';

export default function Login({ setActiveTab }) {
  const { login, demoLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      soundEngine.playQuestCompleteSound();
      setActiveTab('dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
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
      setError('Demo authentication failed. Please try again.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-10 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Visual Showcase & Engineering Highlights */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Final-Year Engineering Project</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            Resume Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400">
              Physical Ascension
            </span>
          </h1>

          <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
            Log in to access your persistent adventure save, real-time Computer Vision repetition telemetry, adaptive workout protocols, and Coach Nova.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-2">
                <Compass className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">33-Point Pose Tracking</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                100% on-device MediaPipe landmark kinematics. Zero video latency or cloud stream.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center mb-2">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">RPE Adaptive Plans</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                Dynamically tunes workout volume (0.8x to 1.2x) from perceived difficulty ratings.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Safety Guardrails</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                Automatic pain interception and non-medical advisory triggers in Coach Nova.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center mb-2">
                <Trophy className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Gamified Realms</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                5 themed worlds, waypoint clearance, streak multipliers, and 12 trophies.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Expert Login Form Card */}
        <div className="lg:col-span-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl relative overflow-hidden">
            {/* Ambient Backlight */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-white">Sign In</h2>
                <p className="text-xs text-slate-400 mt-0.5">Enter your credentials to enter the realm</p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-0.5 shadow-lg">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-300" />
                </div>
              </div>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Fast 1-Click Demo Evaluation Shortcut */}
            <div className="mb-6 p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-wider">
                  Academic Viva & Evaluation
                </span>
                <span className="text-[10px] text-amber-400 font-bold">1-Click Access</span>
              </div>
              <button
                type="button"
                onClick={handleDemoClick}
                disabled={demoLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>{demoLoading ? 'Authenticating Demo...' : 'Instant Demo Login (Alex Vance, Lvl 3)'}</span>
              </button>
            </div>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <span className="relative bg-slate-950 px-3 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                Or Sign In with Email
              </span>
            </div>

            {/* Traditional Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
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
                    placeholder="alex@adventure.com"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-purple-400 hover:text-purple-300 cursor-pointer" onClick={() => setEmail('alex@adventure.com') || setPassword('adventure123')}>
                    Reset demo credentials?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-900/90 border border-slate-800 focus:border-purple-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-800 text-purple-600 focus:ring-purple-500"
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-[11px] text-slate-500">JWT Token 7-Day Expiry</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Quest'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Switch to Register */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                New adventurer?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 ml-1"
                >
                  Create an Adventurer Account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
