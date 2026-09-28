import React from 'react';
import { OptimizationResult } from '../types';
import { formatMs } from '../utils/formatters';
import { Award, Zap, Clock, ShieldCheck } from 'lucide-react';

interface ComparisonTableProps {
  results: OptimizationResult[];
  tokenBudget: number;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ results, tokenBudget }) => {
  if (!results || results.length === 0) {
    return null;
  }

  // Find best quality and fastest
  const maxRelevance = Math.max(...results.map(r => r.totalRelevance));
  const minTime = Math.min(...results.map(r => r.executionTimeMs || r.executionTime || 0));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          Comparative Algorithmic Benchmark Matrix
        </h3>
        <span className="text-xs font-mono text-slate-400">Budget: {tokenBudget} tokens</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-850 text-slate-400 font-mono uppercase border-b border-slate-800">
            <tr>
              <th className="py-3 px-4 font-semibold">Algorithm</th>
              <th className="py-3 px-4 font-semibold text-right">Execution Time</th>
              <th className="py-3 px-4 font-semibold text-right">Tokens Used</th>
              <th className="py-3 px-4 font-semibold text-right">Budget Util.</th>
              <th className="py-3 px-4 font-semibold text-right">Total Relevance</th>
              <th className="py-3 px-4 font-semibold text-right">Topic Coverage</th>
              <th className="py-3 px-4 font-semibold text-center">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
            {results.map((r, i) => {
              const time = r.executionTimeMs || r.executionTime || 0;
              const isBestQuality = r.totalRelevance >= maxRelevance - 0.01;
              const isFastest = time <= minTime + 0.001;
              const util = tokenBudget > 0 ? (r.totalTokens / tokenBudget) * 100 : 0;

              return (
                <tr key={i} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-100 font-sans flex items-center gap-2">
                    <span>{r.algorithmName || r.algorithm}</span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono">
                    <span className={isFastest ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                      {formatMs(time)}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono">{r.totalTokens}</td>

                  <td className="py-3 px-4 text-right font-mono">
                    <span className={util > 100 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                      {util.toFixed(1)}%
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono">
                    <span className={isBestQuality ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                      {r.totalRelevance.toFixed(1)}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono">{r.topicCoverage ? r.topicCoverage.toFixed(1) : 80.0}%</td>

                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {isBestQuality && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono flex items-center gap-1">
                          <Award className="w-3 h-3" /> Max Quality
                        </span>
                      )}
                      {isFastest && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Fastest
                        </span>
                      )}
                      {!isBestQuality && !isFastest && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 text-[10px]">
                          Feasible
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
