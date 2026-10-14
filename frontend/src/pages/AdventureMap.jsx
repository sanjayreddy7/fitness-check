import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Lock,
  CheckCircle2,
  Play,
  Flame,
  Award,
  RefreshCw,
  Sparkles,
  Shield,
  Compass,
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdventureMap({ onStartWorkout, setActiveTab }) {
  const { user } = useAuth();
  const [worlds, setWorlds] = useState([]);
  const [missions, setMissions] = useState([]);
  const [selectedWorldId, setSelectedWorldId] = useState('world-1');
  const [selectedNode, setSelectedNode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [swappingId, setSwappingId] = useState(null);

  useEffect(() => {
    async function loadAdventureData() {
      try {
        const [wRes, mRes] = await Promise.all([
          api.getWorlds().catch(() => null),
          api.getMissions().catch(() => null)
        ]);

        if (wRes && wRes.success) {
          setWorlds(wRes.worlds || []);
        }
        if (mRes && mRes.success) {
          setMissions(mRes.missions || []);
        }
      } catch (err) {
        console.error('Failed to load adventure data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAdventureData();
  }, []);

  const activeWorld = worlds.find(w => w.id === selectedWorldId) || worlds[0];

  const handleSwapMission = async (missionId) => {
    setSwappingId(missionId);
    try {
      const res = await api.swapMission(missionId);
      if (res && res.success) {
        setMissions(prev => prev.map(m => m.id === missionId ? res.mission : m));
      }
    } catch (e) {
      console.error('Failed to swap mission:', e);
    } finally {
      setSwappingId(null);
    }
  };

  const handleLaunchNode = (node) => {
    let exType = 'squat';
    const name = (node.targetExercise || '').toLowerCase();
    if (name.includes('pushup')) exType = 'pushup';
    else if (name.includes('jack')) exType = 'jumping_jack';
    else if (name.includes('curl')) exType = 'bicep_curl';
    else if (name.includes('plank')) exType = 'plank';

    if (onStartWorkout) {
      onStartWorkout({
        exercise: exType,
        exerciseName: node.targetExercise,
        reps: node.reps || 15,
        worldId: activeWorld.id,
        nodeId: node.id,
        title: `${activeWorld.name}: ${node.name}`
      });
    } else {
      setActiveTab('workout');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
              Realm Navigation
            </span>
            <span className="text-xs text-slate-400">Current Rank: Level {user?.level || 3}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white mt-1">
            Fitness Adventure World Map
          </h1>
          <p className="text-xs lg:text-sm text-slate-300">
            Conquer thematic training realms. Complete stages sequentially to unlock boss trials and legendary badges.
          </p>
        </div>

        {/* Global Adventure Stats */}
        <div className="flex items-center gap-3">
          <div className="glass-panel px-4 py-2 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase text-slate-400 font-semibold">Total Realms</span>
            <div className="text-lg font-black text-white font-mono">5 Worlds</div>
          </div>
          <div className="glass-panel px-4 py-2 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] uppercase text-slate-400 font-semibold">Ascension Streak</span>
            <div className="text-lg font-black text-amber-400 font-mono flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>{user?.streak || 3}d</span>
            </div>
          </div>
        </div>
      </div>

      {/* World Selection Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {worlds.map((w) => {
          const isSelected = w.id === selectedWorldId;
          const isUnlocked = w.isUnlocked;

          return (
            <button
              key={w.id}
              onClick={() => setSelectedWorldId(w.id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl text-xs font-bold shrink-0 transition-all border ${
                isSelected
                  ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              } ${!isUnlocked && 'opacity-60'}`}
            >
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                {!isUnlocked ? <Lock className="w-3.5 h-3.5 text-slate-500" /> : <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />}
              </div>
              <div className="text-left">
                <div className="leading-tight">{w.name}</div>
                <div className="text-[10px] font-mono text-slate-500 font-normal">
                  {isUnlocked ? `${w.completedNodes || 0}/${w.totalNodes || 4} Completed` : `Requires Level ${w.requiredLevel}`}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Realm Visualizer Panel */}
      {activeWorld && (
        <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-slate-800 relative overflow-hidden shadow-2xl">
          {/* Ambient Realm theme backdrop */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Active World Lore Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  {activeWorld.subtitle}
                </span>
                {!activeWorld.isUnlocked && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Locked until Level {activeWorld.requiredLevel}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-white mt-1">{activeWorld.name}</h2>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                {activeWorld.description}
              </p>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-slate-400">Realm Clearance</span>
                <div className="text-sm font-bold text-white font-mono">
                  {Math.round(((activeWorld.completedNodes || 0) / (activeWorld.totalNodes || 4)) * 100)}%
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-slate-700 flex items-center justify-center font-black text-xs text-cyan-400">
                {activeWorld.completedNodes || 0}/{activeWorld.totalNodes || 4}
              </div>
            </div>
          </div>

          {/* Interactive World Node Path Map */}
          <div className="py-8">
            <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-6">
              Expedition Waypoints
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              {activeWorld.nodes?.map((node, idx) => {
                const isCompleted = node.status === 'completed';
                const isLocked = node.status === 'locked' || !activeWorld.isUnlocked;
                const isAvailable = node.status === 'available' && activeWorld.isUnlocked;
                const isSelected = selectedNode?.id === node.id;

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-900/30 border-purple-500 ring-2 ring-purple-500/30'
                        : isCompleted
                        ? 'bg-slate-900/70 border-emerald-500/30 hover:border-emerald-500/60'
                        : isAvailable
                        ? 'bg-slate-900/90 border-cyan-500/50 hover:border-cyan-400 animate-pulse-glow shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                    }`}
                  >
                    {/* Stage number & status badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        STAGE 0{idx + 1}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-white">{node.name}</h4>
                    <p className="text-xs text-purple-300 font-medium mt-1">
                      {node.targetExercise}
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/80 text-[11px]">
                      <span className="text-slate-400">
                        {node.reps ? `${node.reps} Reps` : `${node.durationSeconds}s Hold`}
                      </span>
                      <span className="font-mono font-bold text-cyan-300">
                        +{node.xpReward} XP
                      </span>
                    </div>

                    {isAvailable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchNode(node);
                        }}
                        className="mt-3 w-full py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1 shadow"
                      >
                        <Play className="w-3 h-3 fill-slate-950" />
                        <span>Launch Stage</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Node Details Drawer */}
          {selectedNode && (
            <div className="mt-6 p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase">
                    Stage Briefing
                  </span>
                  <span className="text-xs text-slate-400">{selectedNode.name}</span>
                </div>
                <h4 className="text-lg font-bold text-white mt-1">
                  Target: {selectedNode.targetExercise} ({selectedNode.reps || 15} Reps)
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Complete with valid form to earn +{selectedNode.xpReward} XP. Repetitions can be tracked automatically via webcam pose estimation.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedNode(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => handleLaunchNode(selectedNode)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-2 transition-all hover:scale-105"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Live CV Stage</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quests & Smart Mission Generator Section */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                Active Bounties
              </span>
              <span className="text-xs text-slate-400">Daily Quests & Challenges</span>
            </div>
            <h3 className="text-xl font-bold text-white mt-1">
              Smart Mission Generator
            </h3>
          </div>

          <p className="text-xs text-slate-400 max-w-sm">
            Swap any quest if you lack equipment, feel fatigue, or prefer restorative mobility.
          </p>
        </div>

        {/* Quests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {missions.map((mission) => {
            const isSwapping = swappingId === mission.id;
            const isCompleted = mission.status === 'completed';

            return (
              <div
                key={mission.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  isCompleted
                    ? 'bg-slate-900/50 border-emerald-500/30 opacity-75'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase">
                      {mission.type}
                    </span>
                    <span className="text-xs font-bold font-mono text-cyan-400">
                      +{mission.xpReward} XP
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white">{mission.title}</h4>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {mission.description}
                  </p>

                  <div className="mt-4 space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                    <div className="font-semibold text-slate-300">Instructions:</div>
                    {mission.instructions?.map((inst, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-mono">•</span>
                        <span>{inst}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleSwapMission(mission.id)}
                    disabled={isSwapping || isCompleted}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                    title="Swap for an alternative challenge"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSwapping && 'animate-spin'}`} />
                    <span>Swap Quest</span>
                  </button>

                  <button
                    onClick={() => {
                      let ex = 'squat';
                      if ((mission.targetExercise || '').toLowerCase().includes('jack')) ex = 'jumping_jack';
                      if ((mission.targetExercise || '').toLowerCase().includes('pushup')) ex = 'pushup';
                      if (onStartWorkout) {
                        onStartWorkout({
                          exercise: ex,
                          exerciseName: mission.targetExercise,
                          reps: mission.targetReps || 20,
                          questId: mission.id,
                          title: mission.title
                        });
                      } else {
                        setActiveTab('workout');
                      }
                    }}
                    disabled={isCompleted}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5"
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Completed</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 fill-white" />
                        <span>Accept Bounty</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
