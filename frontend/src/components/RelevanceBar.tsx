import React from 'react';
import { Zap } from 'lucide-react';

interface RelevanceBarProps {
  score: number;
  maxPossible?: number;
}

export const RelevanceBar: React.FC<RelevanceBarProps> = ({ score, maxPossible = 300 }) => {
  const percent = maxPossible > 0 ? Math.min(100, (score / maxPossible) * 100) : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-slate-200">Total Relevance Utility</span>
        </div>
        <div className="font-mono text-sm font-bold text-emerald-400">
          {score.toFixed(2)} pts
        </div>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/60">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
