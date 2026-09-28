import React from 'react';
import { Layers, AlertTriangle } from 'lucide-react';

interface TokenBudgetBarProps {
  usedTokens: number;
  maxBudget: number;
}

export const TokenBudgetBar: React.FC<TokenBudgetBarProps> = ({ usedTokens, maxBudget }) => {
  const percent = maxBudget > 0 ? Math.min(100, (usedTokens / maxBudget) * 100) : 0;
  const isWarning = percent > 90;
  const isOverflow = usedTokens > maxBudget;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-slate-200">Context Window Token Budget</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-sm">
          <span className={`font-bold ${isOverflow ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
            {usedTokens}
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-300 font-bold">{maxBudget} tokens</span>
          <span className="text-xs text-slate-400 font-normal">({percent.toFixed(1)}%)</span>
        </div>
      </div>

      {/* Visual meter bar */}
      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/60">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isOverflow
              ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-emerald-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {isWarning && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400 pt-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Approaching context window limit ({percent.toFixed(1)}% of budget utilized).</span>
        </div>
      )}
    </div>
  );
};
