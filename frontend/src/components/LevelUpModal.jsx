import React from 'react';
import { Award, Sparkles, X, ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LevelUpModal() {
  const { levelUpData, closeLevelUpModal } = useAuth();

  if (!levelUpData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-8 border border-purple-500/50 shadow-2xl shadow-purple-500/20 text-center overflow-hidden">
        {/* Glow ambient background circles */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-cyan-500/30 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={closeLevelUpModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Badge Icon */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 rounded-3xl animate-pulse-glow"></div>
          <div className="relative w-full h-full bg-slate-900 rounded-3xl flex items-center justify-center border border-white/20 shadow-inner">
            <Sparkles className="w-12 h-12 text-cyan-300 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs px-2.5 py-1 rounded-full border border-white/20 shadow">
            +{levelUpData.earnedXP} XP
          </div>
        </div>

        {/* Level Up Announcement */}
        <div className="inline-block px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider mb-2">
          Ascension Achieved!
        </div>

        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-cyan-300">
          Level {levelUpData.newLevel} Unlocked
        </h2>

        <p className="text-sm text-cyan-300 font-semibold mt-1">
          Title: {levelUpData.title}
        </p>

        <p className="text-xs text-slate-300 mt-4 leading-relaxed">
          Your physical stamina, form consistency, and resolve have upgraded your adventure rank! New adventure world nodes and quests are now accessible.
        </p>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={closeLevelUpModal}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-purple-600/30 transition-all hover:scale-105"
          >
            <span>Claim & Continue Quest</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
