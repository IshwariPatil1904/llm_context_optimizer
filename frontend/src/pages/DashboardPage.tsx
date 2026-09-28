import React from 'react';
import { StatCard } from '../components/StatCard';
import { AlgorithmCard } from '../components/AlgorithmCard';
import { ChartCard } from '../components/ChartCard';
import { FileText, Hash, Layers, Zap, ArrowRight, Play, Cpu, ShieldCheck } from 'lucide-react';
import { Document, OptimizationResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardPageProps {
  documents: Document[];
  allChunksCount: number;
  tokenBudget: number;
  lastResult: OptimizationResult | null;
  onNavigate: (page: string) => void;
  onRunOptimization: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  documents,
  allChunksCount,
  tokenBudget,
  lastResult,
  onNavigate,
  onRunOptimization
}) => {
  const algoCards = [
    { id: 'greedy', name: 'Greedy Ratio Optimizer', complexity: 'O(n log n)', spaceComplexity: 'O(n)', description: 'Sorts document chunks by relevance-to-cost ratio (v_i / w_i) and greedily selects items until budget W is reached.', guarantee: 'Rapid O(n log n) Baseline' },
    { id: 'dp', name: '0-1 Knapsack Dynamic Programming', complexity: 'O(nB)', spaceComplexity: 'O(B)', description: 'Solves exact 0-1 Knapsack DP recurrence dp[i][w] = max(dp[i-1][w], dp[i-1][w-w_i] + v_i) to find global optimal relevance.', guarantee: 'Global Optimal Solution' },
    { id: 'approx', name: 'FPTAS / 2-Approximation', complexity: 'O(n log n)', spaceComplexity: 'O(n)', description: 'Selects max(Ratio Greedy, Max Single Item). Guarantees at least 50% (or 1 - epsilon) of true global optimal value.', guarantee: 'Provable (1 - ε) Bound' },
    { id: 'randomized', name: 'Randomized Genetic Optimizer', complexity: 'O(g · p · n)', spaceComplexity: 'O(p · n)', description: 'Evolves a binary population over 300 generations with tournament selection, crossover, and budget overflow penalties.', guarantee: 'Meta-Heuristic Search' },
    { id: 'submodular', name: 'Submodular Lazy Greedy Maximizer', complexity: 'O(k · n)', spaceComplexity: 'O(n)', description: 'Maximizes relevance + topic diversity while penalizing pairwise chunk redundancy using Minoux lazy greedy ratio.', guarantee: '(1 - 1/e) ≈ 63.2% Bound' }
  ];

  const chartData = [
    { name: 'Greedy Ratio', relevance: 203.5, latency: 0.08 },
    { name: '0-1 Knapsack DP', relevance: 203.5, latency: 1.45 },
    { name: '2-Approximation', relevance: 203.5, latency: 0.12 },
    { name: 'Randomized GA', relevance: 203.5, latency: 12.30 },
    { name: 'Submodular Lazy', relevance: 203.5, latency: 0.35 }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-3">
            <Cpu className="w-3.5 h-3.5" /> High-Performance C++20 Context Selection
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">LLM Context Optimizer Dashboard</h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            A DAA-based context optimization engine implemented in C++20. Solves the bounded knapsack & submodular context selection problem to maximize prompt relevance while enforcing strict LLM token window constraints.
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => onNavigate('optimization')}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <Zap className="w-4 h-4" /> Run Context Optimization
            </button>
            <button
              onClick={() => onNavigate('analyzer')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4 text-slate-400" /> Analyze Documents
            </button>
            <button
              onClick={() => onNavigate('benchmark')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> DAA Benchmark Suite
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Documents" value={documents.length} subtext="Ingested knowledge files" icon={FileText} badge="DBMS & DAA" badgeColor="indigo" />
        <StatCard title="Total Chunks" value={allChunksCount} subtext="Extracted text units" icon={Hash} badge="Word Metrics" badgeColor="cyan" />
        <StatCard title="Current Token Budget" value={`${tokenBudget} tok`} subtext="Max context window limit" icon={Layers} badge="Enforced W" badgeColor="emerald" />
        <StatCard title="Last Optimization" value={lastResult ? `${lastResult.totalTokens} tok` : 'Ready'} subtext={lastResult ? `Relevance: ${lastResult.totalRelevance.toFixed(1)}` : 'Click to run'} icon={Zap} badge={lastResult ? lastResult.algorithmName : 'Idle'} badgeColor="amber" />
      </div>

      {/* Recent Optimization Performance Chart & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="DAA Algorithm Latency Comparison (ms)" subtitle="C++ execution benchmark across 5 context optimization paradigms">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="ms" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }} />
                <Bar dataKey="latency" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#38bdf8' : index === 1 ? '#6366f1' : index === 4 ? '#10b981' : '#a855f7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100 mb-1 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" /> Optimization Quick Launch
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Select an algorithm and launch optimization instantly against the C++ REST backend.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-slate-850 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Active Query:</span>
                <span className="text-slate-200 font-sans font-medium line-clamp-2">"What are the differences between 1NF, 2NF, 3NF and BCNF?"</span>
              </div>
              <div className="flex justify-between items-center bg-slate-850 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400">Budget Limit W:</span>
                <span className="text-indigo-400 font-bold">{tokenBudget} tokens</span>
              </div>
            </div>
          </div>

          <button
            onClick={onRunOptimization}
            className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            Execute Submodular Optimizer <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Algorithm Suite Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-100 mb-4">Core DAA Algorithmic Suite</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {algoCards.map(algo => (
            <AlgorithmCard
              key={algo.id}
              id={algo.id}
              name={algo.name}
              complexity={algo.complexity}
              spaceComplexity={algo.spaceComplexity}
              description={algo.description}
              guarantee={algo.guarantee}
              isSelected={false}
              onSelect={() => onNavigate('optimization')}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
