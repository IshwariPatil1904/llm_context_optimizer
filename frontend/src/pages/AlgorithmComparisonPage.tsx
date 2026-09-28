import React, { useEffect, useState } from 'react';
import type { ComparisonResponse, OptimizationResult, Chunk } from '../types';
import { ChartCard } from '../components/ChartCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { StatCard } from '../components/StatCard';
import { BarChart3, HelpCircle, Layers, Hash, Zap, ArrowUpDown, ChevronDown, Columns, FileText, CheckCircle2 } from 'lucide-react';
import { formatMs } from '../utils/formatters';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface AlgorithmComparisonPageProps {
  question: string;
  tokenBudget: number;
  comparisonData: ComparisonResponse | null;
  comparisonResults: OptimizationResult[];
  allChunks: Chunk[];
  onCompareAll: () => void;
  loading: boolean;
  error: string | null;
}

type SortField = 'algorithm' | 'selectedChunkCount' | 'totalTokens' | 'tokenUtilization' | 'totalRelevance' | 'executionTimeMs' | 'averageSimilarity' | 'topicCoverage';

export const AlgorithmComparisonPage: React.FC<AlgorithmComparisonPageProps> = ({
  question,
  tokenBudget,
  comparisonData,
  comparisonResults,
  allChunks,
  onCompareAll,
  loading,
  error
}) => {
  const [selectedAlgoName, setSelectedAlgoName] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('algorithm');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  useEffect(() => {
    if (!comparisonData || comparisonResults.length === 0) {
      onCompareAll();
    }
  }, []);

  useEffect(() => {
    if (comparisonResults.length > 0 && !selectedAlgoName) {
      setSelectedAlgoName(comparisonResults[0].algorithmName || comparisonResults[0].algorithm);
    }
  }, [comparisonResults, selectedAlgoName]);

  const totalAvailableTokens = comparisonData?.totalAvailableTokens || allChunks.reduce((sum, c) => sum + c.tokenCost, 0);
  const totalChunksCount = comparisonData?.totalChunks || allChunks.length;

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedResults = [...comparisonResults].sort((a, b) => {
    let valA: any = a[sortField as keyof OptimizationResult];
    let valB: any = b[sortField as keyof OptimizationResult];

    if (sortField === 'executionTimeMs') {
      valA = a.executionTimeMs || a.executionTime || 0;
      valB = b.executionTimeMs || b.executionTime || 0;
    }

    if (typeof valA === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  // Selected Algorithm object for detailed chunk and context inspection
  const activeResult = comparisonResults.find(r => (r.algorithmName || r.algorithm) === selectedAlgoName) || comparisonResults[0] || null;

  const activeSelectedChunks = allChunks.filter(c => activeResult?.selectedChunkIds?.includes(c.id));

  // Original context text
  const originalContextText = allChunks.map(c => `[${c.id}]\n${c.text}`).join('\n\n');
  const originalTokenCount = totalAvailableTokens;
  const optimizedTokenCount = activeResult?.totalTokens || 0;
  const compressionRatio = originalTokenCount > 0 ? ((1 - optimizedTokenCount / originalTokenCount) * 100) : 0;

  // Colors for 5 algorithms
  const algoColors = ['#6366f1', '#38bdf8', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" /> Optimization Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Factual performance analysis comparing Greedy, Dynamic Programming, Approximation, Randomized Search, and Submodular Optimization.
          </p>
        </div>

        <button
          onClick={onCompareAll}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          Run Method Comparison
        </button>
      </div>

      {error && <ErrorState message={error} onRetry={onCompareAll} />}

      {/* TOP SECTION: Global Input Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="User Question" value={comparisonData?.question ? (comparisonData.question.slice(0, 24) + '...') : (question.slice(0, 24) + '...')} subtext="Input Query" icon={HelpCircle} badge="Enforced" badgeColor="indigo" />
        <StatCard title="Token Budget (W)" value={`${comparisonData?.tokenBudget || tokenBudget} tok`} subtext="Max Context Limit" icon={Layers} badge="Constraint" badgeColor="cyan" />
        <StatCard title="Total Chunks" value={totalChunksCount} subtext="Corpus Chunks" icon={Hash} badge="Full Set C" badgeColor="emerald" />
        <StatCard title="Available Tokens" value={`${totalAvailableTokens} tok`} subtext="Total Uncompressed" icon={Zap} badge="Corpus Sum" badgeColor="amber" />
      </div>

      {loading ? (
        <LoadingState message="Executing 5 C++ context optimization passes on identical chunks..." />
      ) : (
        <div className="space-y-8">
          {/* COMPARISON TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Factual Algorithmic Performance Matrix
              </h3>
              <span className="text-xs font-mono text-slate-400">Click headers to sort column</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-850 text-slate-400 uppercase border-b border-slate-800 cursor-pointer select-none">
                  <tr>
                    <th onClick={() => handleSort('algorithm')} className="py-3 px-4 hover:text-slate-200">
                      <div className="flex items-center gap-1">Algorithm <ArrowUpDown className="w-3 h-3 text-slate-500" /></div>
                    </th>
                    <th onClick={() => handleSort('selectedChunkCount')} className="py-3 px-4 text-right hover:text-slate-200">
                      <div className="flex items-center justify-end gap-1">Chunks Selected <ArrowUpDown className="w-3 h-3 text-slate-500" /></div>
                    </th>
                    <th onClick={() => handleSort('totalTokens')} className="py-3 px-4 text-right hover:text-slate-200">
                      <div className="flex items-center justify-end gap-1">Tokens Used <ArrowUpDown className="w-3 h-3 text-slate-500" /></div>
                    </th>
                    <th onClick={() => handleSort('tokenUtilization')} className="py-3 px-4 text-right hover:text-slate-200">
                      <div className="flex items-center justify-end gap-1">Token Util. (%) <ArrowUpDown className="w-3 h-3 text-slate-500" /></div>
                    </th>
                    <th onClick={() => handleSort('totalRelevance')} className="py-3 px-4 text-right hover:text-slate-200">
                      <div className="flex items-center justify-end gap-1">Relevance <ArrowUpDown className="w-3 h-3 text-slate-500" /></div>
                    </th>
                    <th onClick={() => handleSort('executionTimeMs')} className="py-3 px-4 text-right hover:text-slate-200">
                      <div className="flex items-center justify-end gap-1">Execution Time <ArrowUpDown className="w-3 h-3 text-slate-500" /></div>
                    </th>
                    <th onClick={() => handleSort('averageSimilarity')} className="py-3 px-4 text-right hover:text-slate-200">
                      <div className="flex items-center justify-end gap-1">Avg Similarity <ArrowUpDown className="w-3 h-3 text-slate-500" /></div>
                    </th>
                    <th onClick={() => handleSort('topicCoverage')} className="py-3 px-4 text-right hover:text-slate-200">
                      <div className="flex items-center justify-end gap-1">Topic Coverage <ArrowUpDown className="w-3 h-3 text-slate-500" /></div>
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {sortedResults.map((r, i) => {
                    const algoName = r.algorithmName || r.algorithm;
                    const time = r.executionTimeMs || r.executionTime || 0;
                    const util = r.tokenUtilization || ((r.totalTokens / (comparisonData?.tokenBudget || tokenBudget)) * 100);

                    return (
                      <tr key={i} className="hover:bg-slate-850/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-100 font-sans">{algoName}</td>
                        <td className="py-3.5 px-4 text-right font-mono">{r.selectedChunkCount || r.selectedChunkIds.length}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-indigo-300 font-bold">{r.totalTokens}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-300">{util.toFixed(1)}%</td>
                        <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">{r.totalRelevance.toFixed(1)}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-amber-400">{formatMs(time)}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-400">{r.averageSimilarity.toFixed(4)}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-cyan-400">{r.topicCoverage.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6 SEPARATE CHARTS */}
          <div>
            <h2 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" /> Metric-Specific Comparative Charts
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Chart 1: Total Relevance */}
              <ChartCard title="1. Total Relevance Score" subtitle="Sum of chunk relevance scores (higher = richer signal)">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={comparisonResults.map(r => ({ name: (r.algorithmName || r.algorithm).split(' ')[0], value: r.totalRelevance }))}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {comparisonResults.map((_, idx) => <Cell key={idx} fill={algoColors[idx % algoColors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Chart 2: Execution Time */}
              <ChartCard title="2. Execution Time (ms)" subtitle="High-resolution latency in milliseconds">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={comparisonResults.map(r => ({ name: (r.algorithmName || r.algorithm).split(' ')[0], value: r.executionTimeMs || r.executionTime || 0 }))}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} unit="ms" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {comparisonResults.map((_, idx) => <Cell key={idx} fill={algoColors[idx % algoColors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Chart 3: Tokens Used */}
              <ChartCard title="3. Tokens Used" subtitle="Total word tokens packed into context window">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={comparisonResults.map(r => ({ name: (r.algorithmName || r.algorithm).split(' ')[0], value: r.totalTokens }))}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} unit=" tok" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {comparisonResults.map((_, idx) => <Cell key={idx} fill={algoColors[idx % algoColors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Chart 4: Number of Chunks */}
              <ChartCard title="4. Number of Selected Chunks" subtitle="Count of document chunks included in subset S">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={comparisonResults.map(r => ({ name: (r.algorithmName || r.algorithm).split(' ')[0], value: r.selectedChunkCount || r.selectedChunkIds.length }))}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {comparisonResults.map((_, idx) => <Cell key={idx} fill={algoColors[idx % algoColors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Chart 5: Average Similarity */}
              <ChartCard title="5. Average Pairwise Similarity" subtitle="Lexical redundancy metric (lower = more diverse context)">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={comparisonResults.map(r => ({ name: (r.algorithmName || r.algorithm).split(' ')[0], value: r.averageSimilarity }))}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {comparisonResults.map((_, idx) => <Cell key={idx} fill={algoColors[idx % algoColors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Chart 6: Topic Coverage */}
              <ChartCard title="6. Topic Coverage (%)" subtitle="Percentage of unique topics spanned by selected chunks">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={comparisonResults.map(r => ({ name: (r.algorithmName || r.algorithm).split(' ')[0], value: r.topicCoverage }))}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {comparisonResults.map((_, idx) => <Cell key={idx} fill={algoColors[idx % algoColors.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>

          {/* SELECTED CHUNK COMPARISON */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Algorithm Selected Chunk Inspector
              </h3>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400">Select Algorithm:</label>
                <div className="relative">
                  <select
                    value={selectedAlgoName}
                    onChange={(e) => setSelectedAlgoName(e.target.value)}
                    className="bg-slate-850 border border-slate-750 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono outline-none pr-8 appearance-none cursor-pointer"
                  >
                    {comparisonResults.map((r, i) => {
                      const name = r.algorithmName || r.algorithm;
                      return <option key={i} value={name}>{name}</option>;
                    })}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Chunks List */}
            <div className="space-y-3">
              <div className="text-xs text-slate-400 font-mono">
                Selected {activeSelectedChunks.length} chunks for <strong className="text-indigo-300">{selectedAlgoName}</strong>:
              </div>

              <div className="grid grid-cols-1 gap-3">
                {activeSelectedChunks.map((chunk, idx) => (
                  <div key={chunk.id} className="bg-slate-850 border border-slate-750 rounded-xl p-4 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-bold text-indigo-400 flex items-center gap-1.5 font-sans">
                        <span className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-[11px] font-mono">
                          {idx + 1}
                        </span>
                        Selection Order #{idx + 1} ({chunk.id})
                      </span>
                      <div className="flex items-center gap-3 text-slate-400">
                        <span>Cost: <strong className="text-amber-400">{chunk.tokenCost} tokens</strong></span>
                        <span>Relevance: <strong className="text-emerald-400">{chunk.relevanceScore.toFixed(1)}</strong></span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap">
                      {chunk.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CONTEXT COMPARISON: TWO-COLUMN VIEW */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Columns className="w-4 h-4 text-indigo-400" />
                Context Compression View: Original Corpus vs. Optimized Context
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Comparing raw uncompressed document stream against algorithmically compressed prompt context payload for <strong className="text-indigo-300">{selectedAlgoName}</strong>.
              </p>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Original Token Count:</span>
                <span className="text-slate-200 font-bold text-sm">{originalTokenCount} tokens</span>
              </div>
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Optimized Token Count:</span>
                <span className="text-indigo-400 font-bold text-sm">{optimizedTokenCount} tokens</span>
              </div>
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Compression Ratio:</span>
                <span className="text-emerald-400 font-bold text-sm">{compressionRatio.toFixed(1)}% reduced</span>
              </div>
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Selected Chunks:</span>
                <span className="text-cyan-400 font-bold text-sm">{activeResult?.selectedChunkCount || 0} / {totalChunksCount}</span>
              </div>
            </div>

            {/* Two-Column Code Side-by-Side View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left: Original Context */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 bg-slate-850 p-2.5 rounded-t-lg border border-slate-800">
                  <span className="font-bold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> Original Uncompressed Context
                  </span>
                  <span className="text-slate-400">{originalTokenCount} tokens</span>
                </div>
                <pre className="p-4 bg-slate-950 rounded-b-lg border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap h-96 overflow-y-auto leading-relaxed shadow-inner">
                  {originalContextText || 'No original document content loaded.'}
                </pre>
              </div>

              {/* Right: Optimized Context */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-indigo-300 bg-slate-850 p-2.5 rounded-t-lg border border-slate-800">
                  <span className="font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" /> Optimized Context ({selectedAlgoName})
                  </span>
                  <span className="text-indigo-400 font-bold">{optimizedTokenCount} tokens</span>
                </div>
                <pre className="p-4 bg-slate-950 rounded-b-lg border border-indigo-500/30 font-mono text-xs text-indigo-200 whitespace-pre-wrap h-96 overflow-y-auto leading-relaxed shadow-inner">
                  {activeResult?.optimizedContext || 'No optimized context output.'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
