import React from 'react';
import { Trophy, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AchievementPopup() {
  const { activeBadgePopup, dismissNextBadge } = useAuth();

  if (!activeBadgePopup) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce-in">
      <div className="glass-panel p-5 rounded-2xl border border-amber-500/50 shadow-2xl shadow-amber-500/20 bg-slate-900/90 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 w-full"></div>
        <button
          onClick={dismissNextBadge}
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-bold">
                Achievement Unlocked!
              </span>
              <span className="text-xs font-bold text-amber-400">+{activeBadgePopup.xpBonus || 100} XP</span>
            </div>

            <h4 className="text-sm font-bold text-white mt-1">{activeBadgePopup.title}</h4>
            <p className="text-xs text-slate-400 mt-1 leading-snug">{activeBadgePopup.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
