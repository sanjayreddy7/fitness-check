import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Flame,
  Activity,
  Heart,
  ShieldCheck,
  ChevronRight,
  Zap,
  Sparkles
} from 'lucide-react';
import VisionPoseTracker from '../components/VisionPoseTracker';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { soundEngine } from '../services/audioService';

export default function LiveWorkoutSession({ sessionConfig = {}, onCompleteSession, setActiveTab }) {
  const { user, handleWorkoutCompletionRewards } = useAuth();

  const [mode, setMode] = useState('cv'); // 'cv' or 'guided'
  const [exerciseType, setExerciseType] = useState(sessionConfig.exercise || 'squat');
  const [exerciseName, setExerciseName] = useState(sessionConfig.exerciseName || 'Bodyweight Squats');
  const [targetReps, setTargetReps] = useState(sessionConfig.reps || 15);
  const [completedReps, setCompletedReps] = useState(0);
  const [cvVerifiedCount, setCvVerifiedCount] = useState(0);

  // Timer state
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Feedback state for workout logging
  const [isFinished, setIsFinished] = useState(false);
  const [rpe, setRpe] = useState(6);
  const [difficultyFeedback, setDifficultyFeedback] = useState('just_right');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loggedResult, setLoggedResult] = useState(null);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && !isFinished) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isFinished]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleRepCount = (count) => {
    setCompletedReps(count);
    setCvVerifiedCount(count);
  };

  const handleCVComplete = () => {
    setIsFinished(true);
    setIsTimerRunning(false);
  };

  const handleManualFinish = () => {
    setIsFinished(true);
    setIsTimerRunning(false);
  };

  const submitWorkoutLog = async () => {
    setIsSubmitting(true);
    try {
      const durationMins = Math.max(1, Math.round(secondsElapsed / 60));
      const res = await api.logWorkout({
        title: sessionConfig.title || `${exerciseName} Trial`,
        worldId: sessionConfig.worldId || 'world-1',
        nodeId: sessionConfig.nodeId || null,
        questId: sessionConfig.questId || null,
        durationMinutes: durationMins,
        totalReps: completedReps || targetReps,
        cvVerifiedReps: cvVerifiedCount,
        rpe: parseInt(rpe, 10),
        difficultyFeedback,
        exercises: [
          {
            name: exerciseName,
            sets: 3,
            reps: completedReps || targetReps,
            cvVerified: mode === 'cv'
          }
        ]
      });

      if (res && res.success) {
        setLoggedResult(res);
        handleWorkoutCompletionRewards(res.rewards, res.updatedUser);
      }
    } catch (err) {
      console.error('Failed to log workout session:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSession = () => {
    setCompletedReps(0);
    setCvVerifiedCount(0);
    setSecondsElapsed(0);
    setIsFinished(false);
    setIsTimerRunning(true);
    setLoggedResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Session Header HUD */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
              Live Session Active
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {sessionConfig.title || 'Adventure Training Trial'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 capitalize">
            {exerciseName}
          </h1>
        </div>

        {/* HUD Counters */}
        <div className="flex items-center gap-4">
          {/* Timer HUD */}
          <div className="bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-800 flex items-center gap-2 text-center">
            <Timer className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Duration</div>
              <div className="text-lg font-black text-white font-mono">{formatTime(secondsElapsed)}</div>
            </div>
          </div>

          {/* Reps Counted HUD */}
          <div className="bg-slate-900/80 px-4 py-2 rounded-2xl border border-slate-800 flex items-center gap-2 text-center">
            <Activity className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Completed</div>
              <div className="text-lg font-black text-cyan-400 font-mono">
                {completedReps} <span className="text-xs text-slate-500 font-normal">/ {targetReps}</span>
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setMode('cv')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'cv'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              CV Camera
            </button>
            <button
              onClick={() => setMode('guided')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'guided'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Guided Timer
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      {!isFinished ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Visualizer or Camera Area */}
          <div className="lg:col-span-2 space-y-4">
            {mode === 'cv' ? (
              <VisionPoseTracker
                exerciseType={exerciseType}
                targetReps={targetReps}
                onRepCount={handleRepCount}
                onComplete={handleCVComplete}
              />
            ) : (
              <div className="glass-panel rounded-3xl p-8 border border-slate-800 text-center space-y-6">
                <div className="w-24 h-24 rounded-full bg-purple-500/10 border-2 border-purple-500/40 mx-auto flex items-center justify-center">
                  <Activity className="w-10 h-10 text-purple-400 animate-pulse" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white capitalize">{exerciseName}</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    Guided rhythm pacing. Focus on explosive concentric drives and 2-second eccentric control.
                  </p>
                </div>

                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-mono">
                  {completedReps} <span className="text-base text-slate-500">/ {targetReps} Reps</span>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      const next = completedReps + 1;
                      setCompletedReps(next);
                      soundEngine.playRepSound();
                      if (next >= targetReps) handleCVComplete();
                    }}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-purple-600/30 transition-all hover:scale-105"
                  >
                    Count Rep (+1)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Exercise Controls & Form Guidelines */}
          <div className="space-y-6">
            {/* Quick Exercise Switcher */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Switch Movement
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'squat', name: 'Bodyweight Squats' },
                  { id: 'pushup', name: 'Standard Pushups' },
                  { id: 'jumping_jack', name: 'Jumping Jacks' },
                  { id: 'bicep_curl', name: 'Bicep Curls' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setExerciseType(item.id);
                      setExerciseName(item.name);
                      setCompletedReps(0);
                    }}
                    className={`p-2.5 rounded-xl text-left font-semibold border transition-all ${
                      exerciseType === item.id
                        ? 'bg-purple-600/30 border-purple-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Reps Selector */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
                <span>Target Repetition Goal</span>
                <span className="text-cyan-400 font-mono">{targetReps} Reps</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 15, 20, 30].map(r => (
                  <button
                    key={r}
                    onClick={() => setTargetReps(r)}
                    className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                      targetReps === r
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Finish Button */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
              <button
                onClick={handleManualFinish}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Workout & Claim Rewards</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Workout Completion & Reward Claim Screen */
        <div className="max-w-2xl mx-auto glass-panel rounded-3xl p-8 border border-purple-500/40 space-y-6 shadow-2xl animate-fade-in text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 mx-auto flex items-center justify-center p-1 shadow-xl shadow-purple-600/30">
            <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center">
              <Trophy className="w-10 h-10 text-cyan-400 animate-bounce" />
            </div>
          </div>

          <div>
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
              Mission Completed
            </span>
            <h2 className="text-3xl font-black text-white mt-2">
              Victory Claimed, Adventurer!
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              You logged {completedReps} repetitions of {exerciseName} in {formatTime(secondsElapsed)}.
            </p>
          </div>

          {/* Metrics Summary Grid */}
          <div className="grid grid-cols-3 gap-3 py-2 text-center">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Duration</span>
              <div className="text-lg font-black text-white font-mono mt-0.5">{formatTime(secondsElapsed)}</div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Total Reps</span>
              <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">{completedReps}</div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Calories</span>
              <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                ~{Math.round(Math.max(1, secondsElapsed / 60) * 7.5)} kcal
              </div>
            </div>
          </div>

          {/* Feedback & RPE Input for adaptive learning */}
          {!loggedResult ? (
            <div className="text-left bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" /> Perceived Exertion (RPE Scale)
              </h4>
              <p className="text-[11px] text-slate-400">
                Helps the AI coach adjust future volume and recommend recovery when needed.
              </p>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Effort Rating</span>
                  <span className="text-cyan-400 font-mono">{rpe} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={(e) => setRpe(e.target.value)}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>1 (Light Stretch)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Maximum Effort)</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  How did this session feel?
                </label>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {[
                    { id: 'too_easy', label: 'Too Easy' },
                    { id: 'just_right', label: 'Just Right' },
                    { id: 'too_hard', label: 'Too Hard' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDifficultyFeedback(item.id)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                        difficultyFeedback === item.id
                          ? 'bg-purple-600/30 border-purple-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={submitWorkoutLog}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Recording to Database...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Claim Experience Points & Record Session</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Success confirmation strip */
            <div className="bg-emerald-950/60 border border-emerald-500/40 p-5 rounded-2xl space-y-3">
              <div className="text-emerald-300 font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Recorded to Persistent Database!</span>
              </div>
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 font-mono">
                +{loggedResult.rewards.earnedXP} XP Earned
              </div>
              <p className="text-xs text-slate-300">
                Streak updated to <strong className="text-amber-400">{loggedResult.rewards.newStreak} days</strong>!
              </p>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={resetSession}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Start Another
                </button>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
