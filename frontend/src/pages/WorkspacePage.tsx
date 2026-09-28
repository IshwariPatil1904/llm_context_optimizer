import React, { useState } from 'react';
import { Document, Chunk, OptimizationResult } from '../types';
import { StatCard } from '../components/StatCard';
import { TokenBudgetBar } from '../components/TokenBudgetBar';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { ChunkCard } from '../components/ChunkCard';
import {
  FileText,
  Upload,
  HelpCircle,
  Layers,
  Zap,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Database,
  Hash
} from 'lucide-react';
import { formatMs } from '../utils/formatters';

interface WorkspacePageProps {
  documents: Document[];
  selectedDocument: Document | null;
  onSelectDoc: (id: string) => void;
  onUploadDocument: (title: string, category: string, content: string, chunkSize: number) => Promise<Document>;
  question: string;
  setQuestion: (q: string) => void;
  tokenBudget: number;
  setTokenBudget: (b: number) => void;
  activeAlgorithm: string;
  setActiveAlgorithm: (algo: string) => void;
  allChunks: Chunk[];
  lastResult: OptimizationResult | null;
  onOptimize: (algo?: string, q?: string, b?: number) => void;
  loading: boolean;
  error: string | null;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  documents,
  selectedDocument,
  onSelectDoc,
  onUploadDocument,
  question,
  setQuestion,
  tokenBudget,
  setTokenBudget,
  activeAlgorithm,
  setActiveAlgorithm,
  allChunks,
  lastResult,
  onOptimize,
  loading,
  error
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [docCategory, setDocCategory] = useState<string>('Technical Knowledge');
  const [chunkSize, setChunkSize] = useState<number>(120);

  const algorithms = [
    { id: 'greedy', name: 'Greedy', desc: 'Fast ratio-based selection' },
    { id: 'dp', name: 'Dynamic Programming', desc: 'Budget-aware exact optimization' },
    { id: 'approx', name: 'Approximation', desc: 'Bounded knapsack strategy' },
    { id: 'randomized', name: 'Randomized Search', desc: 'Explores candidate selections' },
    { id: 'submodular', name: 'Submodular Optimization', desc: 'Reduces redundant context' }
  ];

  const handleCopy = () => {
    if (!lastResult?.optimizedContext) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lastResult.optimizedContext);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = lastResult.optimizedContext;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard copy failed', err);
    }
  };

  const selectedChunks = allChunks.filter(c => lastResult?.selectedChunkIds?.includes(c.id));
  const totalAvailableTokens = allChunks.reduce((sum, c) => sum + c.tokenCost, 0);
  const usedTokens = lastResult?.totalTokens || 0;
  const utilizationPct = tokenBudget > 0 ? Math.min(100, (usedTokens / tokenBudget) * 100) : 0;

  const sampleQueries = [
    "What are the differences between 1NF, 2NF, 3NF and BCNF?",
    "How does budget-aware optimization limit LLM context overflow?",
    "Explain submodular marginal gain and redundancy reduction."
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-400" /> Optimization Workspace
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Unified control center to manage documents, configure prompt queries, set context budgets, and run context selection.
        </p>
      </div>

      {error && <ErrorState message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: DOCUMENT & QUERY */}
        <div className="lg:col-span-2 space-y-6">
          {/* DOCUMENT CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" /> Document Selection & Metadata
              </h2>

              {documents.length > 0 && (
                <select
                  value={selectedDocument?.id || ''}
                  onChange={(e) => onSelectDoc(e.target.value)}
                  className="bg-slate-850 border border-slate-750 rounded-lg px-3 py-1 text-xs text-slate-200 font-mono outline-none"
                >
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>{d.title} ({d.chunks.length} chunks)</option>
                  ))}
                </select>
              )}
            </div>

            {selectedDocument ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-sans">Document Title</span>
                  <span className="text-slate-200 font-bold truncate block">{selectedDocument.title}</span>
                </div>
                <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-sans">Total Words</span>
                  <span className="text-indigo-300 font-bold block">{selectedDocument.totalWords}</span>
                </div>
                <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-sans">Chunk Count</span>
                  <span className="text-emerald-400 font-bold block">{selectedDocument.chunks.length} chunks</span>
                </div>
                <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px] font-sans">Est. Available Tokens</span>
                  <span className="text-amber-400 font-bold block">{totalAvailableTokens} tok</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-850 border border-slate-750 rounded-lg p-6 text-center text-xs text-slate-400 font-mono">
                No active document selected. Upload a document from Document Analysis.
              </div>
            )}
          </div>

          {/* QUERY CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 shadow-sm">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" /> Prompt Query / Information Need
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full bg-slate-850 border border-slate-750 rounded-xl px-4 py-3 text-sm text-slate-100 font-sans focus:border-indigo-500 outline-none shadow-inner"
              placeholder="What would you like to find or answer from this document?"
            />
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 font-mono">Sample Queries:</span>
              {sampleQueries.map((sq, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuestion(sq)}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-slate-700 transition-colors"
                >
                  {sq.slice(0, 34)}...
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BUDGET & METHOD SELECTOR */}
        <div className="space-y-6">
          {/* BUDGET & UTILIZATION CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Context Budget Specification
              </h2>
              <span className="text-xs font-mono font-bold text-indigo-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {tokenBudget} tokens
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="100"
                max="2000"
                step="25"
                value={tokenBudget}
                onChange={(e) => setTokenBudget(parseInt(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>100 tok</span>
                <span>500 tok</span>
                <span>1000 tok</span>
                <span>2000 tok</span>
              </div>
            </div>

            {/* Budget Utilization Breakdown */}
            <div className="grid grid-cols-3 gap-2 font-mono text-xs text-center pt-2">
              <div className="bg-slate-850 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans">Used</span>
                <span className="text-indigo-300 font-bold">{usedTokens} tok</span>
              </div>
              <div className="bg-slate-850 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans">Available</span>
                <span className="text-slate-200 font-bold">{Math.max(0, tokenBudget - usedTokens)} tok</span>
              </div>
              <div className="bg-slate-850 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] font-sans">Utilization</span>
                <span className="text-emerald-400 font-bold">{utilizationPct.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* METHOD SELECTOR & RUN ACTION */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-indigo-400" /> Optimization Method
            </h2>

            <div className="space-y-2">
              {algorithms.map(algo => (
                <button
                  key={algo.id}
                  onClick={() => setActiveAlgorithm(algo.id)}
                  className={`w-full p-2.5 rounded-lg text-left border transition-all ${
                    activeAlgorithm === algo.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-semibold'
                      : 'bg-slate-850 border-slate-750 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-bold font-sans">{algo.name}</div>
                  <div className="text-[11px] text-slate-400 font-sans">{algo.desc}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => onOptimize()}
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Sparkles className="w-4 h-4" /> Optimize Context
            </button>
          </div>
        </div>
      </div>

      {/* RESULTS SECTION */}
      {loading && <LoadingState message="Executing optimization strategy..." />}

      {!loading && lastResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" /> Optimization Summary
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Strategy: <strong className="text-indigo-300">{lastResult.algorithmName}</strong> | Latency: <strong className="text-amber-400">{formatMs(lastResult.executionTimeMs || lastResult.executionTime || 0)}</strong>
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-xs font-mono text-slate-200 border border-slate-700 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy Optimized Context'}
            </button>
          </div>

          {/* Key Stat Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] font-sans">Tokens Selected</span>
              <span className="text-indigo-400 font-bold text-sm">{lastResult.totalTokens} / {tokenBudget} tok</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] font-sans">Token Utilization</span>
              <span className="text-emerald-400 font-bold text-sm">{((lastResult.totalTokens / tokenBudget) * 100).toFixed(1)}%</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] font-sans">Chunks Selected</span>
              <span className="text-cyan-400 font-bold text-sm">{selectedChunks.length} / {allChunks.length}</span>
            </div>
            <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 block text-[10px] font-sans">Total Relevance</span>
              <span className="text-slate-100 font-bold text-sm">{lastResult.totalRelevance.toFixed(1)}</span>
            </div>
          </div>

          {/* Assembled Context Code Box */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 font-sans">Assembled Context Payload:</span>
            <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed shadow-inner">
              {lastResult.optimizedContext || 'No context assembled.'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
