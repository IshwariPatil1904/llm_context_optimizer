import React from 'react';
import { Chunk } from '../types';
import { Hash, Zap, Tag } from 'lucide-react';

interface ChunkCardProps {
  chunk: Chunk;
  isSelected?: boolean;
  onToggleSelect?: (chunkId: string) => void;
  index?: number;
}

export const ChunkCard: React.FC<ChunkCardProps> = ({
  chunk,
  isSelected,
  onToggleSelect,
  index
}) => {
  return (
    <div
      className={`rounded-xl p-4 border transition-all duration-150 ${
        isSelected
          ? 'bg-slate-850 border-indigo-500/80 ring-1 ring-indigo-500/30'
          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 flex items-center gap-1">
            <Hash className="w-3 h-3 text-indigo-400" /> Chunk #{chunk.position || index || 1}
          </span>
          <span className="text-[11px] font-mono text-slate-400">{chunk.id}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            Cost: <strong className="text-amber-400">{chunk.tokenCost}</strong> tokens
          </span>
          <span className="text-xs font-mono text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-400" />
            Relevance: <strong className="text-emerald-400">{chunk.relevanceScore > 0 ? chunk.relevanceScore.toFixed(1) : 'not calculated yet'}</strong>
          </span>
        </div>
      </div>

      {/* Chunk text content */}
      <p className="text-xs text-slate-300 font-sans leading-relaxed my-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
        {chunk.text}
      </p>

      {/* Topic tags & Actions */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tag className="w-3 h-3 text-slate-400" />
          {chunk.topics && chunk.topics.length > 0 ? (
            chunk.topics.map((t, idx) => (
              <span key={idx} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-750">
                {t}
              </span>
            ))
          ) : (
            <span className="text-[10px] font-mono text-slate-400">general</span>
          )}
        </div>

        {onToggleSelect && (
          <button
            onClick={() => onToggleSelect(chunk.id)}
            className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
              isSelected
                ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {isSelected ? 'Selected' : 'Include'}
          </button>
        )}
      </div>
    </div>
  );
};
