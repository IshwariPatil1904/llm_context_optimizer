import React, { useState } from 'react';
import type { OptimizationResult, Chunk } from '../types';
import { StatCard } from '../components/StatCard';
import { TokenBudgetBar } from '../components/TokenBudgetBar';
import { FileCode, Copy, Check, Download, Trash2, Layers, Hash, Zap, Cpu } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface SelectedContextPageProps {
  lastResult: OptimizationResult | null;
  allChunks: Chunk[];
  tokenBudget: number;
  onClearSelection?: () => void;
}

export const SelectedContextPage: React.FC<SelectedContextPageProps> = ({
  lastResult,
  allChunks,
  tokenBudget,
  onClearSelection
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [cleared, setCleared] = useState<boolean>(false);

  const selectedChunks = cleared ? [] : allChunks.filter(c => lastResult?.selectedChunkIds?.includes(c.id));
  const activeResult = cleared ? null : lastResult;
  const totalTokens = activeResult?.totalTokens || 0;

  const llmPrices = [
    { model: 'GPT-4o (OpenAI)', pricePer1M: 2.50, cost: (totalTokens / 1_000_000) * 2.50 },
    { model: 'Claude 3.5 Sonnet (Anthropic)', pricePer1M: 3.00, cost: (totalTokens / 1_000_000) * 3.00 },
    { model: 'Llama 3.3 70B (Groq/Self-Host)', pricePer1M: 0.50, cost: (totalTokens / 1_000_000) * 0.50 },
    { model: 'Gemini 1.5 Pro (Google)', pricePer1M: 1.25, cost: (totalTokens / 1_000_000) * 1.25 }
  ];

  const handleCopy = () => {
    if (!activeResult?.optimizedContext) return;
    navigator.clipboard.writeText(activeResult.optimizedContext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!activeResult?.optimizedContext) return;
    const blob = new Blob([activeResult.optimizedContext], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimized_context_${activeResult.algorithmName.replace(/\s+/g, '_').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleClear = () => {
    setCleared(true);
    if (onClearSelection) onClearSelection();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-400" /> Selected Context Inspector
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dedicated view of the currently selected optimized prompt context payload, chunk order, and export options.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!activeResult?.optimizedContext}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Context'}
          </button>
          <button
            onClick={handleDownloadTxt}
            disabled={!activeResult?.optimizedContext}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            {downloaded ? 'Downloaded!' : 'Download as TXT'}
          </button>
          <button
            onClick={handleClear}
            disabled={!activeResult}
            className="px-3 py-2 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 disabled:opacity-50 rounded-lg text-xs font-semibold border border-slate-700 hover:border-rose-800 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Selection
          </button>
        </div>
      </div>

      {activeResult && selectedChunks.length > 0 ? (
        <div className="space-y-6">
          {/* Token Budget Meter & High Level Stats */}
          <TokenBudgetBar usedTokens={activeResult.totalTokens} maxBudget={tokenBudget} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Tokens" value={`${activeResult.totalTokens} tok`} subtext="Enforced budget limit" icon={Layers} badge="Enforced" badgeColor="indigo" />
            <StatCard title="Selected Chunks" value={selectedChunks.length} subtext="Optimal subset" icon={Hash} badge="Subset S" badgeColor="cyan" />
            <StatCard title="Total Relevance" value={activeResult.totalRelevance.toFixed(1)} subtext="Sum of relevance scores" icon={Zap} badge="Utility" badgeColor="emerald" />
            <StatCard title="Topic Coverage" value={`${(activeResult.topicCoverage || 90).toFixed(0)}%`} subtext="Spanned knowledge domains" icon={Cpu} badge="Coverage" badgeColor="amber" />
          </div>

          {/* Assembled Context Raw Code Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                Full Assembled Prompt Payload Text
              </h3>
              <span className="text-xs font-mono text-indigo-400">{activeResult.algorithmName || activeResult.algorithm} Output</span>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
              {activeResult.optimizedContext || 'No context assembled.'}
            </pre>
          </div>

          {/* Selected Chunks Detail List with Selection Order */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-100">
              Selected Chunk Inspector ({selectedChunks.length} chunks included)
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {selectedChunks.map((c, idx) => (
                <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="font-bold text-indigo-400 font-sans flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-xs font-mono">
                        {idx + 1}
                      </span>
                      Selection Order #{idx + 1} — Chunk {c.id}
                    </span>
                    <div className="flex items-center gap-4 text-slate-400">
                      <span>Token Cost: <strong className="text-amber-400">{c.tokenCost} tokens</strong></span>
                      <span>Relevance: <strong className="text-emerald-400">{c.relevanceScore.toFixed(1)}</strong></span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-400 font-mono">
          {cleared ? 'Selection cleared. Select an algorithm on the Optimization page to view context.' : 'No optimization result available yet. Run optimization from the Optimization page to inspect the context payload.'}
        </div>
      )}
    </div>
  );
};
