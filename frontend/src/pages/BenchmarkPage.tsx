import React, { useEffect, useState } from 'react';
import type { BenchmarkRunRecord } from '../types';
import { ChartCard } from '../components/ChartCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { StatCard } from '../components/StatCard';
import { Cpu, Download, Play, Layers, Clock, Zap, Hash, BarChart3 } from 'lucide-react';
import { formatMs } from '../utils/formatters';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface BenchmarkPageProps {
  question: string;
  tokenBudget: number;
  loading: boolean;
  error: string | null;
}

export const BenchmarkPage: React.FC<BenchmarkPageProps> = ({
  question,
  tokenBudget: initialTokenBudget
}) => {
  const [datasetSize, setDatasetSize] = useState<number>(0); // 0 = All sizes 10..500
  const [tokenBudget, setTokenBudget] = useState<number>(initialTokenBudget || 350);
  const [benchmarkRecords, setBenchmarkRecords] = useState<BenchmarkRunRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<boolean>(false);

  const runBenchmarkSuite = async (size?: number, budget?: number) => {
    setLoading(true);
    setError(null);
    const targetSize = size !== undefined ? size : datasetSize;
    const targetBudget = budget !== undefined ? budget : tokenBudget;

    try {
      const res = await fetch('http://127.0.0.1:8080/api/benchmark/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question || 'database normalization indexing transaction join optimization',
          budget: targetBudget,
          datasetSize: targetSize
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.records) {
          setBenchmarkRecords(data.records);
        }
      } else {
        throw new Error(`C++ Engine returned status ${res.status}`);
      }
    } catch (err: any) {
      setError(err.message || 'Benchmark execution failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runBenchmarkSuite(0, tokenBudget);
  }, []);

  const handleExportCsv = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8080/api/benchmark/csv');
      if (res.ok) {
        const csvText = await res.text();
        const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `benchmark.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 2000);
      }
    } catch (err) {
      console.error('CSV Export failed', err);
    }
  };

  // Group records by dataset size (10, 25, 50, 100, 250, 500) for scaling line charts
  const datasetSizesList = [10, 25, 50, 100, 250, 500];

  const buildChartDataForMetric = (metricKey: keyof BenchmarkRunRecord) => {
    return datasetSizesList.map(size => {
      const sizeRecords = benchmarkRecords.filter(r => r.datasetSize === size);
      const point: any = { size: `${size} chunks` };

      sizeRecords.forEach(r => {
        const key = r.algorithmName.split(' ')[0];
        point[key] = r[metricKey];
      });

      return point;
    });
  };

  const chartDataTime = buildChartDataForMetric('executionTimeMs');
  const chartDataTokens = buildChartDataForMetric('totalTokens');
  const chartDataRelevance = buildChartDataForMetric('totalRelevance');
  const chartDataCoverage = buildChartDataForMetric('topicCoverage');
  const chartDataSimilarity = buildChartDataForMetric('averageSimilarity');

  const algoColors: Record<string, string> = {
    'Greedy': '#38bdf8',
    '0-1': '#6366f1',
    'FPTAS': '#10b981',
    'Randomized': '#ec4899',
    'Submodular': '#f59e0b'
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" /> Performance Lab
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Scalability testing and benchmark analysis evaluating execution latency, token efficiency, relevance score, similarity, and topic coverage across 10 to 500 chunk datasets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            {downloaded ? 'CSV Downloaded!' : 'Export CSV (results/benchmark.csv)'}
          </button>

          <button
            onClick={() => runBenchmarkSuite()}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Play className="w-4 h-4" /> Run Scaling Benchmark
          </button>
        </div>
      </div>

      {error && <ErrorState message={error} onRetry={() => runBenchmarkSuite()} />}

      {/* Scaling Benchmark Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Dataset Size Filter / Sweep
          </label>
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            <button
              onClick={() => { setDatasetSize(0); runBenchmarkSuite(0); }}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                datasetSize === 0 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-850 text-slate-300 border-slate-750 hover:bg-slate-800'
              }`}
            >
              All (10-500 chunks)
            </button>
            {datasetSizesList.map(s => (
              <button
                key={s}
                onClick={() => { setDatasetSize(s); runBenchmarkSuite(s); }}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  datasetSize === s ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-850 text-slate-300 border-slate-750 hover:bg-slate-800'
                }`}
              >
                {s} Chunks
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-semibold text-slate-300">Token Budget W:</label>
            <span className="font-mono text-xs font-bold text-indigo-300">{tokenBudget} tokens</span>
          </div>
          <input
            type="range"
            min="100"
            max="1500"
            step="50"
            value={tokenBudget}
            onChange={(e) => setTokenBudget(parseInt(e.target.value))}
            onMouseUp={() => runBenchmarkSuite(datasetSize, tokenBudget)}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState message="Running scaling benchmark across 10, 25, 50, 100, 250, and 500 chunk datasets..." />
      ) : (
        <div className="space-y-8">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Dataset Sizes" value="10 to 500" subtext="6 Scaling tiers" icon={Hash} badge="Technical Corpus" badgeColor="indigo" />
            <StatCard title="Total Runs Logged" value={benchmarkRecords.length} subtext="Empirical data points" icon={BarChart3} badge="Logged" badgeColor="cyan" />
            <StatCard title="Target Budget W" value={`${tokenBudget} tok`} subtext="Enforced constraint" icon={Layers} badge="Enforced" badgeColor="emerald" />
            <StatCard title="CSV Output Path" value="benchmark.csv" subtext="results/benchmark.csv" icon={Download} badge="CSV Saved" badgeColor="amber" />
          </div>

          {/* 5 SCALING LINE CHARTS */}
          <div>
            <h2 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" /> Algorithmic Scaling Behavior Charts
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Execution Time vs Number of Chunks */}
              <ChartCard title="1. Execution Time (ms) vs. Number of Chunks" subtitle="High-resolution latency scaling across dataset sizes 10 to 500">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartDataTime} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <XAxis dataKey="size" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} unit="ms" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="Greedy" stroke={algoColors['Greedy']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="0-1" stroke={algoColors['0-1']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="FPTAS" stroke={algoColors['FPTAS']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Randomized" stroke={algoColors['Randomized']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Submodular" stroke={algoColors['Submodular']} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Chart 2: Tokens Selected vs Number of Chunks */}
              <ChartCard title="2. Tokens Selected vs. Number of Chunks" subtitle="Word token count packed into budget W across dataset sizes">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartDataTokens} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <XAxis dataKey="size" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} unit=" tok" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="Greedy" stroke={algoColors['Greedy']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="0-1" stroke={algoColors['0-1']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="FPTAS" stroke={algoColors['FPTAS']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Randomized" stroke={algoColors['Randomized']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Submodular" stroke={algoColors['Submodular']} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Chart 3: Relevance vs Number of Chunks */}
              <ChartCard title="3. Total Relevance vs. Number of Chunks" subtitle="Sum of chunk relevance scores achieved as corpus size increases">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartDataRelevance} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <XAxis dataKey="size" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="Greedy" stroke={algoColors['Greedy']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="0-1" stroke={algoColors['0-1']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="FPTAS" stroke={algoColors['FPTAS']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Randomized" stroke={algoColors['Randomized']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Submodular" stroke={algoColors['Submodular']} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Chart 4: Topic Coverage vs Number of Chunks */}
              <ChartCard title="4. Topic Coverage (%) vs. Number of Chunks" subtitle="Percentage of unique technical topics spanned by selected context">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartDataCoverage} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <XAxis dataKey="size" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="Greedy" stroke={algoColors['Greedy']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="0-1" stroke={algoColors['0-1']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="FPTAS" stroke={algoColors['FPTAS']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Randomized" stroke={algoColors['Randomized']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Submodular" stroke={algoColors['Submodular']} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Chart 5: Average Similarity vs Number of Chunks */}
              <ChartCard title="5. Average Pairwise Similarity vs. Number of Chunks" subtitle="Lexical redundancy metric as corpus size and paraphrase density expand">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartDataSimilarity} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <XAxis dataKey="size" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="Greedy" stroke={algoColors['Greedy']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="0-1" stroke={algoColors['0-1']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="FPTAS" stroke={algoColors['FPTAS']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Randomized" stroke={algoColors['Randomized']} strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="Submodular" stroke={algoColors['Submodular']} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>

          {/* BENCHMARK HISTORY SECTION */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 font-mono">
                Benchmark History Log ({benchmarkRecords.length} run records logged to results/benchmark.csv)
              </h3>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-850 text-slate-400 uppercase sticky top-0 z-10 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Dataset Size</th>
                    <th className="py-3 px-4">Algorithm</th>
                    <th className="py-3 px-4 text-right">Execution Time</th>
                    <th className="py-3 px-4 text-right">Selected Chunks</th>
                    <th className="py-3 px-4 text-right">Total Tokens</th>
                    <th className="py-3 px-4 text-right">Relevance</th>
                    <th className="py-3 px-4 text-right">Avg Similarity</th>
                    <th className="py-3 px-4 text-right">Topic Coverage</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {benchmarkRecords.map((rec, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/60 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-indigo-400">{rec.datasetSize} chunks</td>
                      <td className="py-2.5 px-4 font-bold text-slate-100 font-sans">{rec.algorithmName}</td>
                      <td className="py-2.5 px-4 text-right text-emerald-400 font-bold">{formatMs(rec.executionTimeMs)}</td>
                      <td className="py-2.5 px-4 text-right">{rec.selectedChunksCount}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-indigo-300">{rec.totalTokens}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-100">{rec.totalRelevance.toFixed(1)}</td>
                      <td className="py-2.5 px-4 text-right text-slate-400">{rec.averageSimilarity.toFixed(4)}</td>
                      <td className="py-2.5 px-4 text-right text-cyan-400">{rec.topicCoverage.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
