import React, { useState, useEffect } from 'react';
import {
  Flame,
  Zap,
  Trophy,
  Compass,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Shield,
  Activity,
  Heart,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Dashboard({ setActiveTab, onStartWorkout }) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [missions, setMissions] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [analyticsRes, missionsRes, historyRes] = await Promise.all([
          api.getAnalytics().catch(() => null),
          api.getMissions().catch(() => null),
          api.getHistory().catch(() => null)
        ]);

        if (analyticsRes && analyticsRes.success) {
          setAnalytics(analyticsRes);
        }
        if (missionsRes && missionsRes.success) {
          setMissions(missionsRes.missions || []);
        }
        if (historyRes && historyRes.success) {
          setHistory(historyRes.workouts || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const activeDailyMission = missions.find(m => m.status === 'in_progress' || m.status === 'available') || missions[0];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Hero Character Ascension Banner */}
      <div className="relative glass-panel rounded-3xl p-6 lg:p-8 border border-purple-500/30 overflow-hidden shadow-2xl">
        {/* Glow backdrop effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-gradient-to-br from-purple-600/30 via-indigo-600/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar and Level details */}
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-1 shadow-xl shadow-purple-600/30">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  <div className="text-3xl lg:text-4xl">⚔️</div>
                  <div className="absolute bottom-0 inset-x-0 bg-purple-600/70 text-center text-[10px] font-black uppercase text-white py-0.5">
                    Lvl {user?.level || 3}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                  {user?.title || 'Aura Knight'}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  {user?.streak || 3} Day Streak
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-black text-white mt-1.5 tracking-tight">
                Welcome back, {user?.name || 'Alex Vance'}!
              </h1>

              <p className="text-xs lg:text-sm text-slate-300 max-w-xl mt-1">
                Your next physical milestone awaits in the <strong className="text-purple-300">Titan's Forge</strong>. Maintain form precision to claim bonus XP.
              </p>
            </div>
          </div>

          {/* XP Progress Bar & Quick Start */}
          <div className="w-full lg:w-80 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-slate-400">Level Progression</span>
              <span className="text-cyan-400 font-mono">{user?.xp || 420} / {user?.xpToNextLevel || 600} XP</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-700 shadow-sm"
                style={{
                  width: `${Math.min(100, Math.round(((user?.xp || 420) / (user?.xpToNextLevel || 600)) * 100))}%`
                }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>Current: Lvl {user?.level || 3}</span>
              <span className="text-purple-300 font-medium">Next: Lvl {(user?.level || 3) + 1}</span>
            </div>

            <button
              onClick={() => onStartWorkout ? onStartWorkout({ exercise: 'squat', reps: 15 }) : setActiveTab('workout')}
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4 text-cyan-300" />
              <span>Launch Live CV Camera Workout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Recommended Daily Quest & Readiness Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recommended Daily Quest Card */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-white">Recommended Daily Mission</h3>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              +{activeDailyMission?.xpReward || 60} XP Reward
            </span>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-lg font-bold text-white">{activeDailyMission?.title || 'Highland Deep Squat Challenge'}</h4>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                {activeDailyMission?.type || 'Strength Quest'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {activeDailyMission?.description || 'Perform 20 controlled bodyweight squats focusing on parallel hip depth and upright chest posture.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{activeDailyMission?.estimatedMinutes || 10} Mins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeDailyMission?.difficulty || 'Beginner'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                <span>{activeDailyMission?.cvSupported ? 'Computer Vision Enabled' : 'Guided Timer'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setActiveTab('map')}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View Adventure Map</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onStartWorkout ? onStartWorkout({ exercise: 'squat', reps: 20 }) : setActiveTab('workout')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/20 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Begin Quest</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Readiness & Recovery Score Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-400" /> Readiness Score
              </h3>
              <span className="text-xs font-mono text-emerald-400 font-bold">Optimal</span>
            </div>

            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border-4 border-slate-800 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-emerald-500/80 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/20">
                    <span className="text-3xl font-black text-white font-mono">{analytics?.readinessScore || 88}%</span>
                    <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Ready</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 text-center leading-relaxed">
              Muscular recovery is balanced. Your central nervous system is primed for hypertrophy or high-cadence cardio today.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('coach')}
            className="mt-4 w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700/60 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult Coach Nova for Advice</span>
          </button>
        </div>
      </div>

      {/* Weekly Activity & Consistency Metrics */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="font-bold text-lg text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span>Weekly Movement Consistency</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Active workout duration across the last 7 calendar days
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-purple-500"></span>
              <span className="text-slate-300">Active Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-cyan-400"></span>
              <span className="text-slate-300">XP Surge</span>
            </div>
          </div>
        </div>

        {/* Responsive Bar Chart Visualization */}
        <div className="grid grid-cols-7 gap-2 lg:gap-4 h-48 items-end pt-6 pb-2 px-2 border-b border-slate-800">
          {(analytics?.weeklyData || [
            { day: 'Thu', minutes: 15, xp: 50 },
            { day: 'Fri', minutes: 25, xp: 90 },
            { day: 'Sat', minutes: 0, xp: 0 },
            { day: 'Sun', minutes: 30, xp: 110 },
            { day: 'Mon', minutes: 20, xp: 75 },
            { day: 'Tue', minutes: 25, xp: 110 },
            { day: 'Wed', minutes: 20, xp: 85 }
          ]).map((d, index) => {
            const heightPercent = Math.min(100, Math.max(10, Math.round((d.minutes / 35) * 100)));
            return (
              <div key={index} className="flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                  {d.minutes}m
                </div>
                <div className="w-full max-w-[40px] bg-slate-800/80 rounded-t-lg overflow-hidden flex flex-col justify-end p-0.5 h-full">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600 to-cyan-400 rounded-t-md transition-all duration-500 group-hover:brightness-125"
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                </div>
                <span className="text-xs font-semibold text-slate-300">{d.day}</span>
              </div>
            );
          })}
        </div>

        {/* Stats summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-center">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400">Total Sessions</span>
            <div className="text-xl font-bold text-white font-mono mt-0.5">
              {analytics?.stats?.totalWorkouts || 8}
            </div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400">Total Minutes</span>
            <div className="text-xl font-bold text-cyan-400 font-mono mt-0.5">
              {analytics?.stats?.totalMinutes || 145}m
            </div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400">Total Reps Counted</span>
            <div className="text-xl font-bold text-purple-400 font-mono mt-0.5">
              {analytics?.stats?.totalReps || 210}
            </div>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400">CV Verified Reps</span>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
              {analytics?.stats?.cvVerifiedReps || 45}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Workout History */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-white">Recent Workout Activity</h3>
          <button
            onClick={() => setActiveTab('generator')}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>Generate New Workout</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {history.length > 0 ? (
          <div className="space-y-3">
            {history.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400">
                      {new Date(item.completedAt).toLocaleDateString()} • {item.durationMinutes} mins • {item.caloriesBurned} kcal
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    +{item.xpEarned} XP
                  </span>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-slate-800 text-slate-300">
                    RPE {item.rpe || 6}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No workout sessions logged yet. Embark on your first quest above!</p>
        )}
      </div>
    </div>
  );
}
