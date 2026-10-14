import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  Lock,
  CheckCircle2,
  Flame,
  Shield,
  Zap,
  Star,
  Crown
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AchievementsPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'

  useEffect(() => {
    async function loadAchievements() {
      try {
        const res = await api.getAchievements();
        if (res && res.success) {
          setAchievements(res.achievements || []);
        }
      } catch (err) {
        console.error('Failed to load achievements:', err);
      }
    }
    loadAchievements();
  }, []);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  const filtered = achievements.filter(a => {
    if (filter === 'unlocked') return !!a.unlockedAt;
    if (filter === 'locked') return !a.unlockedAt;
    return true;
  });

  const getRarityBadge = (rarity) => {
    switch (rarity) {
      case 'Legendary':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Epic':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Rare':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
              Hall of Valhalla
            </span>
            <span className="text-xs text-slate-400">Character Accolades & Trophies</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white mt-1">
            Badges, Medals & Lore
          </h1>
          <p className="text-xs lg:text-sm text-slate-300">
            Every movement milestone rewards permanent accolades and character titles.
          </p>
        </div>

        {/* Global Progress */}
        <div className="glass-panel px-6 py-3 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-semibold">Trophies Claimed</div>
            <div className="text-lg font-black text-white font-mono">
              {unlockedCount} / {achievements.length} Unlocked
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['all', 'unlocked', 'locked'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
              filter === tab
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((ach) => {
          const isUnlocked = !!ach.unlockedAt;

          return (
            <div
              key={ach.id}
              className={`p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isUnlocked
                  ? 'glass-panel border-purple-500/30 shadow-xl shadow-purple-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${
                    isUnlocked
                      ? 'bg-purple-500/20 border-purple-500/40 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-600'
                  }`}>
                    {isUnlocked ? <Trophy className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase ${getRarityBadge(ach.rarity)}`}>
                    {ach.rarity}
                  </span>
                </div>

                <h3 className="font-bold text-base text-white">{ach.title}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {ach.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-cyan-400">
                  +{ach.xpBonus} XP Bonus
                </span>

                {isUnlocked ? (
                  <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Unlocked
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
