import React from 'react';
import { BookOpen, Zap, Shield, Layers, Sparkles, Cpu, Table } from 'lucide-react';

export const AlgorithmGuidePage: React.FC = () => {
  const algorithms = [
    {
      id: 'greedy',
      name: 'Greedy Density Ratio Optimizer',
      icon: Zap,
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      whatItDoes: 'Ranks all candidate document chunks by their density ratio (relevance score per word token) and greedily packs items into the context window until the budget W is exhausted.',
      howItSelects: 'Sorts array of chunks in descending order of r_i = v_i / w_i. Iterates through sorted array and includes chunk c_i if w_i <= remaining_budget.',
      objective: 'Maximize sum(v_i) subject to sum(w_i) <= W using ratio density heuristics.',
      advantages: 'Extremely fast microsecond execution time. Minimal CPU overhead and memory footprint. Excellent baseline for large chunk counts.',
      limitations: 'Can be tricked by small high-density items that leave large empty gaps in the token budget, missing larger high-relevance chunks.',
      whenUseful: 'Best when real-time low-latency response (< 1ms) is required or when processing thousands of small chunks.'
    },
    {
      id: 'dp',
      name: '0-1 Knapsack Dynamic Programming',
      icon: Shield,
      timeComplexity: 'O(nB)',
      spaceComplexity: 'O(B)',
      whatItDoes: 'Solves the exact 0-1 Knapsack optimization problem using dynamic programming state matrix dp[i][w] = max(dp[i-1][w], dp[i-1][w - w_i] + v_i).',
      howItSelects: 'Constructs 2D DP matrix over n items and token weight W. Backtracks through DP table to identify exact optimal chunk subset.',
      objective: 'Maximize exact total relevance sum(v_i) subject to sum(w_i) <= W.',
      advantages: 'Guarantees provable global mathematical optimality for additive relevance. No chunk can yield a higher relevance score within budget W.',
      limitations: 'Pseudo-polynomial time complexity O(nB). Memory footprint scales linearly with token budget W (e.g. 32k or 128k context limits).',
      whenUseful: 'Best when budget W is moderate and absolute maximum relevance quality is required.'
    },
    {
      id: 'approx',
      name: 'FPTAS / 2-Approximation Scheme',
      icon: Layers,
      timeComplexity: 'O(n log n)',
      spaceComplexity: 'O(n)',
      whatItDoes: 'Runs ratio greedy selection and compares it against the single highest relevance chunk that fits within budget W, returning whichever has higher utility.',
      howItSelects: 'Candidate 1 = Ratio Greedy solution S_greedy. Candidate 2 = Single max relevance chunk c_max fitting in budget W. Returns max(S_greedy, c_max).',
      objective: 'Achieve a provable 50% (or 1 - epsilon) approximation ratio relative to global DP optimum in polynomial time.',
      advantages: 'Eliminates worst-case failures of pure greedy while maintaining fast O(n log n) execution.',
      limitations: 'Does not account for non-linear diversity metrics or pairwise topic redundancy.',
      whenUseful: 'Best when strong theoretical guarantees are required without paying DP memory costs.'
    },
    {
      id: 'randomized',
      name: 'Randomized Genetic Meta-Heuristic',
      icon: Sparkles,
      timeComplexity: 'O(iterations × candidate evaluation cost)',
      spaceComplexity: 'O(population × n)',
      whatItDoes: 'Maintains a population of candidate binary selection masks and evolves them over 300 generations using tournament selection, crossover, and mutation.',
      howItSelects: 'Evaluates fitness function F(S) = Relevance(S) - 10 * max(0, Tokens(S) - W). Evolves best chromosome across generations.',
      objective: 'Maximize relevance while penalizing budget overflow using meta-heuristic local search.',
      advantages: 'Highly flexible for complex non-linear objective functions, multi-objective trade-offs, and custom constraint structures.',
      limitations: 'Stochastic execution. Slower execution time than greedy algorithms. Can get trapped in local optima if population diversity drops.',
      whenUseful: 'Best when complex non-linear constraints or multi-objective prompt requirements are present.'
    },
    {
      id: 'submodular',
      name: 'Submodular Lazy Greedy Maximizer',
      icon: Cpu,
      timeComplexity: 'O(n²)',
      spaceComplexity: 'O(n)',
      whatItDoes: 'Maximizes a submodular utility function with diminishing marginal returns: f(S) = Relevance(S) + lambda * Diversity(S) - gamma * Redundancy(S).',
      howItSelects: 'Iteratively selects candidate c* that maximizes marginal gain ratio delta(c|S) / tokenCost(c) using Minoux lazy greedy search.',
      objective: 'Maximize submodular utility f(S) subject to knapsack budget sum(w_i) <= W.',
      advantages: 'Guarantees (1 - 1/e) ~ 63.2% approximation factor. Actively prevents duplicate or redundant chunks from cluttering context window.',
      limitations: 'Requires computing pairwise chunk similarity matrix O(n^2), incurring moderate computation time for large datasets.',
      whenUseful: 'Best for Retrieval-Augmented Generation (RAG) where retrieved chunks contain overlapping or redundant information.'
    }
  ];

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto text-slate-200">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-400" /> Technical Documentation & Reference
        </h1>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Comprehensive technical reference for document processing, chunking, relevance scoring, optimization algorithms, and FAQ.
        </p>
      </div>

      {/* Complexity Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 font-bold text-sm text-slate-100 flex items-center gap-2 font-mono">
          <Table className="w-4 h-4 text-indigo-400" /> Algorithmic Complexity & Strategy Matrix
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-850 text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Time Complexity</th>
                <th className="py-3 px-4">Space Complexity</th>
                <th className="py-3 px-4">Strategy Paradigm</th>
                <th className="py-3 px-4">Optimality / Bound</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              <tr>
                <td className="py-3 px-4 font-bold text-slate-100 font-sans">Greedy Density Ratio</td>
                <td className="py-3 px-4 text-indigo-400 font-bold">O(n log n)</td>
                <td className="py-3 px-4">O(n)</td>
                <td className="py-3 px-4 text-slate-300 font-sans">Density Ratio Sorting (v_i / w_i)</td>
                <td className="py-3 px-4 text-slate-400">Heuristic Baseline</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-100 font-sans">0-1 Knapsack DP</td>
                <td className="py-3 px-4 text-indigo-400 font-bold">O(nB)</td>
                <td className="py-3 px-4">O(B)</td>
                <td className="py-3 px-4 text-slate-300 font-sans">State Matrix DP & Backtracking</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">Exact Global Optimal (100%)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-100 font-sans">Approximation Scheme</td>
                <td className="py-3 px-4 text-indigo-400 font-bold">O(n log n)</td>
                <td className="py-3 px-4">O(n)</td>
                <td className="py-3 px-4 text-slate-300 font-sans">Max(Greedy, Best Single Item)</td>
                <td className="py-3 px-4 text-cyan-400 font-bold">50% / (1 - ε) Bound</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-100 font-sans">Randomized Genetic</td>
                <td className="py-3 px-4 text-indigo-400 font-bold">O(iterations × eval cost)</td>
                <td className="py-3 px-4">O(population × n)</td>
                <td className="py-3 px-4 text-slate-300 font-sans">Genetic Evolution & Penalty</td>
                <td className="py-3 px-4 text-slate-400">Meta-Heuristic Search</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-slate-100 font-sans">Submodular Lazy Greedy</td>
                <td className="py-3 px-4 text-indigo-400 font-bold">O(n²)</td>
                <td className="py-3 px-4">O(n)</td>
                <td className="py-3 px-4 text-slate-300 font-sans">Lazy Marginal Gain Maximization</td>
                <td className="py-3 px-4 text-emerald-400 font-bold">(1 - 1/e) ≈ 63.2% Bound</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Educational Cards for 5 Algorithms */}
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-100">Detailed Educational Breakdown</h2>

        {algorithms.map((algo) => {
          const Icon = algo.icon;
          return (
            <div key={algo.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Icon className="w-5 h-5 text-indigo-400" /> {algo.name}
                </h3>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="px-2.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">Time: {algo.timeComplexity}</span>
                  <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Space: {algo.spaceComplexity}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-300 block">What It Does:</span>
                  <p className="text-slate-300 leading-relaxed">{algo.whatItDoes}</p>
                </div>

                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-300 block">How It Selects Chunks:</span>
                  <p className="text-slate-300 leading-relaxed">{algo.howItSelects}</p>
                </div>

                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1 font-mono">
                  <span className="font-bold text-emerald-400 font-sans block">Objective Function:</span>
                  <p className="text-slate-300 leading-relaxed">{algo.objective}</p>
                </div>

                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-cyan-300 block">Advantages:</span>
                  <p className="text-slate-300 leading-relaxed">{algo.advantages}</p>
                </div>

                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-rose-300 block">Limitations:</span>
                  <p className="text-slate-300 leading-relaxed">{algo.limitations}</p>
                </div>

                <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-300 block">When Useful:</span>
                  <p className="text-slate-300 leading-relaxed">{algo.whenUseful}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Help & FAQ Section */}
      <div className="space-y-6 pt-6 border-t border-slate-800">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" /> Help & Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
            <h3 className="font-bold text-indigo-300 text-sm">What is context optimization?</h3>
            <p className="text-slate-300 leading-relaxed">
              Context optimization is the process of selecting a high-density, highly relevant subset of document chunks from a retrieved corpus so that the total token count fits strictly within an LLM's context window limit (W), avoiding lost-in-the-middle degradation and reducing API inference cost.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
            <h3 className="font-bold text-indigo-300 text-sm">How is the context budget calculated?</h3>
            <p className="text-slate-300 leading-relaxed">
              The context budget W is specified in word tokens (e.g. 500, 1000, 2000 tokens). During document chunking, each chunk is assigned a token weight equal to its word count. The algorithms select chunks such that sum(tokenCost_i) &lt;= W.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
            <h3 className="font-bold text-indigo-300 text-sm">How are document chunks selected?</h3>
            <p className="text-slate-300 leading-relaxed">
              Chunks are selected based on their relevance scores relative to the user query and their token costs. Optimization methods evaluate ratio density, dynamic programming recurrence, bounding heuristics, or submodular marginal gain.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
            <h3 className="font-bold text-indigo-300 text-sm">What is relevance scoring?</h3>
            <p className="text-slate-300 leading-relaxed">
              Relevance scoring evaluates query keyword matching and term frequency normalization against document chunk texts. In C++, a deterministic TF-IDF and normalized cosine similarity scorer scores every chunk without requiring external Python dependencies.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
            <h3 className="font-bold text-indigo-300 text-sm">How does optimization affect the final context?</h3>
            <p className="text-slate-300 leading-relaxed">
              Instead of passing an uncompressed, noisy document stream, the optimizer outputs a compact, high-relevance prompt payload containing only the informative chunks ordered logically, maximizing prompt utility.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
            <h3 className="font-bold text-indigo-300 text-sm">What happens when the budget is too small?</h3>
            <p className="text-slate-300 leading-relaxed">
              If the context budget W is smaller than every individual chunk's token cost, 0 chunks are selected. If budget W fits a subset, the algorithms select the single best fitting chunk or combination that maximizes relevance.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2 md:col-span-2">
            <h3 className="font-bold text-indigo-300 text-sm">What document formats are supported?</h3>
            <p className="text-slate-300 leading-relaxed">
              The engine accepts UTF-8 plain text (.txt) files. Unstructured text is cleaned (removing blank lines, normalizing whitespace) and chunked into 50–300 word segments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
