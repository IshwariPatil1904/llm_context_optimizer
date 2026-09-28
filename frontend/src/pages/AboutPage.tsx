import React from 'react';
import { Info, ArrowRight, Layers, Cpu, Shield, Zap, CheckCircle2, Code2, Server } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const pipelineSteps = [
    { name: 'Document Ingestion', desc: 'Raw document loading & whitespace cleaning' },
    { name: 'Text Chunking', desc: 'Splitting into 100-150 word token chunks' },
    { name: 'Relevance Scoring', desc: 'Deterministic TF-IDF & Cosine Similarity' },
    { name: 'Token Budget Enforcer', desc: 'Strict context window weight limit W' },
    { name: 'DAA C++ Optimizer', desc: 'Greedy, DP, Approx, Genetic, Submodular' },
    { name: 'Selected Context', desc: 'Synthesized, high-density prompt payload' }
  ];

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Info className="w-6 h-6 text-indigo-400" /> Platform Architecture & Stack
        </h1>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          High-performance LLM Context Optimization System bridging C++20 algorithmic core with modern web frontend engineering.
        </p>
      </div>

      {/* Problem & Solution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3 shadow-sm">
          <h2 className="text-base font-bold text-rose-300 flex items-center gap-2">
            <Layers className="w-5 h-5 text-rose-400" /> The Context Budget Challenge
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Enterprise Retrieval-Augmented Generation (RAG) and document search systems retrieve large volumes of text chunks. However, LLM context windows have strict token limits (token budget W) and charge per token. Naive top-k retrieval causes context window overflow, high API costs, and lost-in-the-middle degradation.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3 shadow-sm">
          <h2 className="text-base font-bold text-emerald-300 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" /> Optimization Solution
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Applies formal optimization algorithms—such as 0-1 Knapsack Dynamic Programming, FPTAS, Genetic Search, and Submodular Maximization—to select an optimal subset of document chunks S that maximizes relevance and topic diversity while enforcing budget W.
          </p>
        </div>
      </div>

      {/* Pipeline Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" /> Context Optimization Pipeline
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {pipelineSteps.map((step, idx) => (
            <div key={idx} className="bg-slate-850 p-3 rounded-xl border border-slate-800 space-y-1 relative">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-bold flex items-center justify-center mb-2">
                {idx + 1}
              </div>
              <h4 className="text-xs font-bold text-slate-100">{step.name}</h4>
              <p className="text-[10px] text-slate-400 leading-normal">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Stack Architecture Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backend Stack */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" /> C++20 Core Backend Stack
          </h3>
          <ul className="space-y-2 text-xs font-mono text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>C++20 & C++17 Standard:</strong> Zero third-party dependencies</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>CMake Build System:</strong> Native MinGW & MSVC cross-compilation</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>C++ Standard Template Library (STL):</strong> std::vector, std::unordered_map</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Winsock REST Server:</strong> Custom HTTP REST server on port 8080</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>High-Resolution Timers:</strong> Microsecond std::chrono precision</span>
            </li>
          </ul>
        </div>

        {/* Frontend Stack */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-indigo-400" /> React 18 Frontend Stack
          </h3>
          <ul className="space-y-2 text-xs font-mono text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span><strong>React 18 & TypeScript:</strong> Strict type-safe UI architecture</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span><strong>Vite 8 Build Tool:</strong> Sub-second HMR and instant bundling</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span><strong>Recharts Library:</strong> Responsive bar, scatter, and radar charts</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span><strong>Tailwind CSS & Lucide Icons:</strong> Academic dashboard theme</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span><strong>Resilient REST Client:</strong> Automatic retry and fallback state</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
