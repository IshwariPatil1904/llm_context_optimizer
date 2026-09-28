import React, { useState } from 'react';
import { OptimizationResult, Chunk } from '../types';
import { TokenBudgetBar } from '../components/TokenBudgetBar';
import { RelevanceBar } from '../components/RelevanceBar';
import { ChunkCard } from '../components/ChunkCard';
import { StatCard } from '../components/StatCard';
import { ComparisonTable } from '../components/ComparisonTable';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { Zap, HelpCircle, Layers, Clock, Copy, Check, Sparkles, Sliders, Shield } from 'lucide-react';
import { formatMs } from '../utils/formatters';

interface OptimizationPageProps {
  question: string;
  setQuestion: (q: string) => void;
  tokenBudget: number;
  setTokenBudget: (b: number) => void;
  activeAlgorithm: string;
  setActiveAlgorithm: (a: string) => void;
  allChunks: Chunk[];
  lastResult: OptimizationResult | null;
  comparisonResults: OptimizationResult[];
  onOptimize: (algo?: string, q?: string, b?: number) => void;
  loading: boolean;
  error: string | null;
}

export const OptimizationPage: React.FC<OptimizationPageProps> = ({
  question,
  setQuestion,
  tokenBudget,
  setTokenBudget,
  activeAlgorithm,
  setActiveAlgorithm,
  allChunks,
  lastResult,
  comparisonResults,
  onOptimize,
  loading,
  error
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const algorithms = [
    { id: 'greedy', name: 'Greedy', tag: 'Fast ratio-based selection' },
    { id: 'dp', name: 'Dynamic Programming', tag: 'Budget-aware exact optimization' },
    { id: 'approx', name: 'Approximation', tag: 'Lightweight bounded strategy' },
    { id: 'randomized', name: 'Randomized Search', tag: 'Explores candidate selections' },
    { id: 'submodular', name: 'Submodular Optimization', tag: 'Reduces redundant context' },
    { id: 'all', name: 'Run All Methods', tag: 'Comparative optimization' }
  ];

  const handleCopyContext = () => {
    if (!lastResult?.optimizedContext) return;
    navigator.clipboard.writeText(lastResult.optimizedContext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleQuestions = [
    "What are the differences between 1NF, 2NF, 3NF and BCNF?",
    "How does budget-aware optimization limit LLM context window overflow?",
    "Explain submodular functions and diminishing marginal returns in LLM prompts."
  ];

  const selectedChunks = allChunks.filter(c => lastResult?.selectedChunkIds?.includes(c.id));

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-400" /> Context Optimization
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Executes real-time algorithms to filter, rank, and compress retrieved document content into an optimal LLM prompt context payload.
        </p>
      </div>

      {error && <ErrorState message={error} />}

      {/* Control Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        {/* Question Input */}
        <div>
          <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" /> User Query / Information Need
          </label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-slate-850 border border-slate-750 rounded-xl px-4 py-3 text-sm text-slate-100 font-sans focus:border-indigo-500 outline-none shadow-inner"
            placeholder="Type your question or query here..."
          />
          {/* Sample Query Pills */}
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <span className="text-[11px] text-slate-400 font-mono">Quick Samples:</span>
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => setQuestion(sq)}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-slate-700 transition-colors"
              >
                {sq.slice(0, 32)}...
              </button>
            ))}
          </div>
        </div>

        {/* Settings Grid: Token Budget & Algorithm Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-800">
          {/* Token Budget Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" /> Max Token Budget (W)
              </label>
              <span className="font-mono text-sm font-bold text-indigo-300 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
                {tokenBudget} tokens
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="25"
              value={tokenBudget}
              onChange={(e) => setTokenBudget(parseInt(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>100 tok</span>
              <span>500 (Standard)</span>
              <span>1000 tok</span>
              <span>2000 tok</span>
            </div>
          </div>

          {/* Algorithm Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-2">
              <Sliders className="w-4 h-4 text-indigo-400" /> Optimization Algorithm
            </label>
            <div className="grid grid-cols-2 gap-2">
              {algorithms.map(algo => (
                <button
                  key={algo.id}
                  onClick={() => setActiveAlgorithm(algo.id)}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    activeAlgorithm === algo.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-semibold'
                      : 'bg-slate-850 border-slate-750 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs">{algo.name}</div>
                  <div className="text-[10px] font-mono text-slate-400">{algo.tag}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onOptimize()}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <Sparkles className="w-4 h-4" /> Optimize Context
        </button>
      </div>

      {/* Loading State */}
      {loading && <LoadingState message="Executing C++ context selection algorithm..." />}

      {/* Optimization Results */}
      {!loading && lastResult && (
        <div className="space-y-6">
          {/* Visual Budget Meter & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TokenBudgetBar usedTokens={lastResult.totalTokens} maxBudget={tokenBudget} />
            <RelevanceBar score={lastResult.totalRelevance} maxPossible={300} />
          </div>

          {/* Key Metric Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Algorithm Used" value={lastResult.algorithmName || lastResult.algorithm} subtext="C++ Engine" icon={Shield} badge="Active" badgeColor="indigo" />
            <StatCard title="Selected Chunks" value={`${lastResult.selectedChunkCount || lastResult.selectedChunkIds.length} / ${allChunks.length}`} subtext="Included in prompt" icon={Layers} badge="Subset S" badgeColor="cyan" />
            <StatCard title="Total Relevance" value={lastResult.totalRelevance.toFixed(1)} subtext="Sum of relevance v_i" icon={Zap} badge="Score" badgeColor="emerald" />
            <StatCard title="Execution Time" value={formatMs(lastResult.executionTimeMs || lastResult.executionTime || 0)} subtext="Microsecond precision" icon={Clock} badge="C++ STL" badgeColor="amber" />
          </div>

          {/* Comparison Table if 'All' was run */}
          {comparisonResults.length > 0 && (
            <ComparisonTable results={comparisonResults} tokenBudget={tokenBudget} />
          )}

          {/* Selected Context Text Output */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Assembled LLM Prompt Context Payload
              </h3>
              <button
                onClick={handleCopyContext}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard' : 'Copy Prompt Text'}
              </button>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed shadow-inner">
              {lastResult.optimizedContext || 'No context assembled.'}
            </pre>
          </div>

          {/* Selected Chunks Detail List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-100">
              Selected Chunk Inspector ({selectedChunks.length} chunks included)
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {selectedChunks.map((c, idx) => (
                <ChunkCard key={c.id} chunk={c} isSelected={true} index={idx + 1} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
