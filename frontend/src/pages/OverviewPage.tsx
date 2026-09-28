import React from 'react';
import {
  Zap,
  FileText,
  CheckCircle2,
  Sliders,
  Layers,
  BarChart3,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  FileSearch,
  Database,
  Search
} from 'lucide-react';

interface OverviewPageProps {
  onNavigate: (page: string) => void;
  documentCount: number;
  totalChunks: number;
  tokenBudget: number;
  lastOptimizationTime?: number;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  onNavigate,
  documentCount,
  totalChunks,
  tokenBudget
}) => {
  const workflowSteps = [
    {
      step: '01',
      title: 'Document Ingestion',
      description: 'Ingest and normalize plain text documents into clean context streams.',
      icon: FileText
    },
    {
      step: '02',
      title: 'Analyzer & Chunking',
      description: 'Extract 100–150 word token chunks and generate term relevance scores.',
      icon: FileSearch
    },
    {
      step: '03',
      title: 'Context Optimization',
      description: 'Filter and pack optimal chunk subsets under strict token budget constraints.',
      icon: Sliders
    },
    {
      step: '04',
      title: 'Performance Comparison',
      description: 'Analyze latency, token utilization, relevance, and topic coverage.',
      icon: BarChart3
    },
    {
      step: '05',
      title: 'Context Export',
      description: 'Review, copy, or export the assembled high-density LLM prompt payload.',
      icon: Sparkles
    }
  ];

  const features = [
    {
      title: 'Context-Aware Document Processing',
      description: 'Parses unstructured text documents into structured chunk units with weighted lexical term frequency scores.',
      icon: Database
    },
    {
      title: 'Budget-Constrained Selection',
      description: 'Enforces hard context window token bounds (W) to prevent prompt overflow and reduce LLM API inference costs.',
      icon: Layers
    },
    {
      title: 'Multiple Optimization Strategies',
      description: 'Includes Ratio Greedy, 0-1 Knapsack DP, FPTAS, Genetic Meta-Heuristics, and Submodular Maximization.',
      icon: Zap
    },
    {
      title: 'Performance Analysis',
      description: 'Provides side-by-side factual metric comparisons of execution latency, similarity, and topic coverage.',
      icon: BarChart3
    },
    {
      title: 'Redundancy-Aware Selection',
      description: 'Submodular lazy greedy search penalizes pairwise chunk similarity to eliminate duplicate information.',
      icon: Search
    },
    {
      title: 'Benchmarking & Scalability',
      description: 'Evaluates algorithm scaling performance across 10 to 500 document chunk datasets in native memory.',
      icon: Cpu
    },
    {
      title: 'Optimized Context Preview',
      description: 'Inspect exact selected chunk order, copy payload to clipboard, or download directly as formatted TXT.',
      icon: Sparkles
    }
  ];

  const metrics = [
    { label: 'Ingested Documents', value: documentCount.toString(), unit: 'files' },
    { label: 'Extracted Chunks', value: totalChunks.toString(), unit: 'units' },
    { label: 'Default Token Budget', value: tokenBudget.toString(), unit: 'tokens' },
    { label: 'C++ Engine Latency', value: '< 1', unit: 'ms' }
  ];

  return (
    <div className="p-6 space-y-10 max-w-7xl mx-auto text-slate-100">
      {/* HERO SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Native C++20 Context Selection Engine
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Optimize the context. <br />
            <span className="text-indigo-400">Use the budget intelligently.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-sans">
            Select the most relevant document content within a fixed context budget using multiple optimization strategies. Eliminate prompt context overflow, reduce API inference costs, and maximize prompt relevance.
          </p>

          <div className="flex items-center gap-4 flex-wrap pt-2">
            <button
              onClick={() => onNavigate('workspace')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md"
            >
              Start Optimizing <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('optimization')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4 text-indigo-400" /> Optimization Engine
            </button>
            <button
              onClick={() => onNavigate('guide')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Technical Reference
            </button>
          </div>
        </div>
      </div>

      {/* METRICS SECTION */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-1">
            <span className="text-xs font-medium text-slate-400 font-sans block">{m.label}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-100">{m.value}</span>
              <span className="text-xs font-mono text-indigo-400 font-semibold">{m.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* WORKFLOW SECTION */}
      <div className="space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" /> Context Optimization Processing Pipeline
          </h2>
          <p className="text-xs text-slate-400">
            End-to-end workflow from raw document stream ingestion to optimized LLM prompt assembly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {workflowSteps.map((ws, i) => {
            const Icon = ws.icon;
            return (
              <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 relative group hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Step {ws.step}
                  </span>
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                </div>
                <h3 className="text-xs font-bold text-slate-100 font-sans">{ws.title}</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">{ws.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FEATURES GRID SECTION */}
      <div className="space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Platform Features & Capabilities
          </h2>
          <p className="text-xs text-slate-400">
            Enterprise-grade algorithm engine built for high-throughput LLM prompt engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-2.5 hover:border-slate-700 transition-all">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-1">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-100 font-sans">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
