import React from 'react';
import { Cpu, Zap, Shield, Sparkles, Layers } from 'lucide-react';

interface AlgorithmCardProps {
  id: string;
  name: string;
  complexity: string;
  spaceComplexity: string;
  description: string;
  guarantee: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const AlgorithmCard: React.FC<AlgorithmCardProps> = ({
  id,
  name,
  complexity,
  spaceComplexity,
  description,
  guarantee,
  isSelected,
  onSelect
}) => {
  const getIcon = () => {
    switch (id) {
      case 'greedy': return Zap;
      case 'dp': return Shield;
      case 'approx': return Layers;
      case 'randomized': return Sparkles;
      case 'submodular': return Cpu;
      default: return Cpu;
    }
  };

  const Icon = getIcon();

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl p-5 border cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-slate-850 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-indigo-400 border border-slate-700'}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">{name}</h3>
            <span className="text-[11px] font-mono text-indigo-400 font-semibold">{guarantee}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Time: {complexity}
          </span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">{description}</p>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
        <span>Space: {spaceComplexity}</span>
        <span className={isSelected ? 'text-indigo-400 font-bold' : 'text-slate-400'}>
          {isSelected ? 'Active Selection' : 'Click to select'}
        </span>
      </div>
    </div>
  );
};
