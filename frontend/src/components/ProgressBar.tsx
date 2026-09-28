import React from 'react';

interface ProgressBarProps {
  label: string;
  current: number;
  max: number;
  unit?: string;
  color?: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'rose';
  showPercentage?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  current,
  max,
  unit = '',
  color = 'indigo',
  showPercentage = true
}) => {
  const percent = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0;

  const fillColors = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    cyan: 'bg-cyan-500',
    rose: 'bg-rose-500'
  };

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-slate-300">{label}</span>
        <span className="font-mono text-slate-300">
          {current} / {max} {unit} {showPercentage && `(${percent.toFixed(1)}%)`}
        </span>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
        <div
          className={`h-full transition-all duration-300 rounded-full ${fillColors[color]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
