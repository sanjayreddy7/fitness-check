import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';

export default function SafetyBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-cyan-500/10 border-b border-amber-500/20 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong className="text-white">Safety & Non-Medical Advisory:</strong> AI Fitness Adventure promotes sustainable movement and healthy habits. This is not medical advice. Always stop immediately if you experience joint pain, dizziness, or sharp discomfort.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          title="Dismiss advisory"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
