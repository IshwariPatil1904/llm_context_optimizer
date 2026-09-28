import React from 'react';
import { Cpu } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Executing C++ DAA Optimization Engine...'
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center my-6">
      <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-4 animate-bounce">
        <Cpu className="w-6 h-6 animate-pulse" />
      </div>
      <h3 className="text-sm font-bold text-slate-200 mb-1">{message}</h3>
      <p className="text-xs font-mono text-indigo-400">O(n log n) | O(nB) | Submodular Lazy Greedy</p>
    </div>
  );
};
