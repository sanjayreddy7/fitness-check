import React, { useState } from 'react';
import {
  Zap,
  Sliders,
  Clock,
  Dumbbell,
  Shield,
  Activity,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Heart,
  ChevronDown,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function WorkoutPlanGenerator({ onStartWorkout, setActiveTab }) {
  const { user } = useAuth();

  const [fitnessLevel, setFitnessLevel] = useState(user?.fitnessLevel || 'intermediate');
  const [goal, setGoal] = useState((user?.fitnessGoals && user.fitnessGoals[0]) || 'strength');
  const [equipment, setEquipment] = useState(['bodyweight']);
  const [timeMinutes, setTimeMinutes] = useState(30);
  const [difficultyFeedback, setDifficultyFeedback] = useState('just_right'); // 'too_hard', 'just_right', 'too_easy'
  const [rpeRating, setRpeRating] = useState(6);

  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleEquipmentToggle = (item) => {
    if (equipment.includes(item)) {
      if (equipment.length > 1) {
        setEquipment(equipment.filter(e => e !== item));
      }
    } else {
      setEquipment([...equipment, item]);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generatePlan({
        fitnessLevel,
        goal,
        equipment,
        timeMinutes: parseInt(timeMinutes, 10),
        previousFeedback: {
          difficulty: difficultyFeedback,
          rpe: parseInt(rpeRating, 10)
        }
      });

      if (res && res.success) {
        setGeneratedPlan(res.plan);
      }
    } catch (err) {
      console.error('Plan generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartWorkout = (plan) => {
    const firstCircuit = plan.circuits[0];
    let exType = 'squat';
    if (firstCircuit?.cvType) exType = firstCircuit.cvType;

    if (onStartWorkout) {
      onStartWorkout({
        exercise: exType,
        exerciseName: firstCircuit?.name || 'Adventure Protocol',
        reps: firstCircuit?.reps || 12,
        title: plan.title,
        circuits: plan.circuits,
        durationMinutes: plan.durationMinutes
      });
    } else {
      setActiveTab('workout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
            Adaptive AI Engine
          </span>
          <span className="text-xs text-slate-400">Personalized Training Generator</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-black text-white mt-1">
          Custom Workout Studio
        </h1>
        <p className="text-xs lg:text-sm text-slate-300">
          Synthesize customized workout protocols tailored to your energy level, equipment, and previous recovery feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Controls Column */}
        <div className="glass-panel rounded-3xl p-6 lg:p-7 border border-slate-800 space-y-6">
          <h3 className="font-bold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span>Parameters & Feedback</span>
          </h3>

          {/* Fitness Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Primary Goal
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'strength', label: 'Strength & Power' },
                { id: 'endurance', label: 'Cardio Endurance' },
                { id: 'mobility', label: 'Mobility & Recovery' },
                { id: 'general', label: 'General Fitness' }
              ].map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setGoal(g.id)}
                  className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all border ${
                    goal === g.id
                      ? 'bg-purple-600/30 border-purple-500 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fitness Level */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Ability Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['beginner', 'intermediate', 'advanced'].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFitnessLevel(lvl)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold capitalize transition-all border ${
                    fitnessLevel === lvl
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Available Equipment */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Available Equipment
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'bodyweight', label: 'Bodyweight' },
                { id: 'dumbbells', label: 'Dumbbells' },
                { id: 'resistance_bands', label: 'Bands' },
                { id: 'gym', label: 'Full Gym' }
              ].map(eq => {
                const active = equipment.includes(eq.id);
                return (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => handleEquipmentToggle(eq.id)}
                    className={`p-2.5 rounded-xl text-xs font-semibold text-left transition-all border ${
                      active
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    ✓ {eq.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Duration */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              <span>Time Availability</span>
              <span className="text-cyan-400 font-mono">{timeMinutes} Minutes</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setTimeMinutes(mins)}
                  className={`py-2 rounded-xl text-xs font-bold font-mono transition-all border ${
                    timeMinutes === mins
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* RPE & Difficulty Feedback Adaptation */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Previous Session Fatigue (RPE)
              </label>
            </div>
            <p className="text-[11px] text-slate-400">
              Adapts workout volume up or down based on your perceived exertion.
            </p>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[
                { id: 'too_easy', label: 'Effortless (RPE 1-4)', rpe: 3 },
                { id: 'just_right', label: 'Balanced (RPE 5-7)', rpe: 6 },
                { id: 'too_hard', label: 'Exhausting (RPE 8-10)', rpe: 9 }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setDifficultyFeedback(f.id);
                    setRpeRating(f.rpe);
                  }}
                  className={`p-2 rounded-xl text-[11px] font-semibold border transition-all ${
                    difficultyFeedback === f.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02]"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Synthesizing Workout Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Adaptive Plan</span>
              </>
            )}
          </button>
        </div>

        {/* Generated Plan Output Column */}
        <div className="lg:col-span-2 space-y-6">
          {generatedPlan ? (
            <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-purple-500/30 space-y-6 shadow-2xl animate-fade-in">
              {/* Plan Title & Badges */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                      Protocol Synthesized
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {generatedPlan.durationMinutes} Minutes • ~{generatedPlan.estimatedCalories} kcal
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1">
                    {generatedPlan.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    +{generatedPlan.xpReward} XP Reward
                  </span>
                </div>
              </div>

              {/* Intensity & Feedback Adaptation Notice */}
              {generatedPlan.intensityNote && (
                <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs text-purple-200 flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-400 shrink-0" />
                  <span><strong>AI Adaptation:</strong> {generatedPlan.intensityNote}</span>
                </div>
              )}

              {/* Dynamic Warmup Block */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Phase 1: Dynamic Warmup (3 Mins)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {generatedPlan.warmup?.map((w, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <div className="font-bold text-white">{w.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{w.durationSeconds}s • {w.focus}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Circuits Block */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                  <Dumbbell className="w-3.5 h-3.5" /> Phase 2: Main Circuit
                </h4>
                <div className="space-y-3">
                  {generatedPlan.circuits?.map((c, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                          0{c.step}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold text-white text-sm">{c.name}</h5>
                            {c.cvSupported && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                CV Verified
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-snug">
                            💡 <em>{c.postureTip}</em>
                          </p>
                          {c.regression && (
                            <p className="text-[11px] text-amber-300/80 mt-1">
                              Alternative: {c.regression}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-white font-mono">
                          {c.sets} Sets × {c.reps} Reps
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {c.restSeconds}s Rest
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cooldown Block */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> Phase 3: Cool-Down & Mobility
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {generatedPlan.cooldown?.map((cd, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <div className="font-bold text-white">{cd.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{cd.durationSeconds}s • {cd.focus}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recovery Guidance Strip */}
              {generatedPlan.recoveryAdvice && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1 text-slate-300">
                  <div className="font-bold text-white uppercase text-[11px] tracking-wider mb-1">
                    Post-Workout Recovery Prescription
                  </div>
                  <div>💧 <strong>Hydration:</strong> {generatedPlan.recoveryAdvice.hydration}</div>
                  <div>🥗 <strong>Nutrition:</strong> {generatedPlan.recoveryAdvice.nutrition}</div>
                  <div>💤 <strong>Rest:</strong> {generatedPlan.recoveryAdvice.rest}</div>
                </div>
              )}

              {/* Launch Workout Action Button */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleStartWorkout(generatedPlan)}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-cyan-500/20 transition-all flex items-center gap-2 hover:scale-105"
                >
                  <span>Launch Live Workout Session</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl p-12 border border-slate-800 text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-purple-400 mb-4 border border-slate-700 shadow-inner">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Protocol Synthesized Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                Configure your parameters on the left and click "Generate Adaptive Plan" to synthesize a custom workout with warm-ups, circuits, and CV tracking.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
