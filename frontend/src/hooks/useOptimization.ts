import { useState, useEffect, useCallback } from 'react';
import type { Document, OptimizationResult, BenchmarkSuiteResult, Chunk, ComparisonResponse } from '../types';
import { fetchDocuments, processDocument, runOptimization, runComparison, runBenchmark, checkBackendHealth } from '../services/api';

export function useOptimization() {
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [question, setQuestion] = useState<string>('What are the differences between 1NF, 2NF, 3NF and BCNF?');
  const [tokenBudget, setTokenBudget] = useState<number>(250);
  const [activeAlgorithm, setActiveAlgorithm] = useState<string>('submodular');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [lastResult, setLastResult] = useState<OptimizationResult | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [benchmarkSuite, setBenchmarkSuite] = useState<BenchmarkSuiteResult | null>(null);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const health = await checkBackendHealth();
      setBackendOnline(!!health);

      const data = await fetchDocuments();
      setDocuments(data.documents);
      if (data.documents.length > 0 && !selectedDocId) {
        setSelectedDocId(data.documents[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize app state');
    } finally {
      setLoading(false);
    }
  }, [selectedDocId]);

  useEffect(() => {
    refreshData();
  }, []);

  const handleOptimize = async (customAlgo?: string, customQuery?: string, customBudget?: number) => {
    const algo = customAlgo || activeAlgorithm;
    const q = customQuery !== undefined ? customQuery : question;
    const b = customBudget !== undefined ? customBudget : tokenBudget;

    setLoading(true);
    setError(null);
    try {
      if (algo === 'all') {
        const comp = await runComparison(q, b);
        setComparisonData(comp);
        if (comp.results && comp.results.length > 0) {
          setLastResult(comp.results[0]);
        }
      } else {
        const result = await runOptimization(q, b, algo);
        setLastResult(result);
      }
    } catch (err: any) {
      setError(err.message || 'Optimization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCompareAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const comp = await runComparison(question, tokenBudget);
      setComparisonData(comp);
      if (comp.results && comp.results.length > 0) {
        setLastResult(comp.results[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Comparison failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRunBenchmark = async () => {
    setLoading(true);
    setError(null);
    try {
      const bench = await runBenchmark(question, tokenBudget);
      setBenchmarkSuite(bench);
    } catch (err: any) {
      setError(err.message || 'Benchmark execution failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocument = async (title: string, category: string, content: string, chunkSize: number = 120) => {
    setLoading(true);
    setError(null);
    try {
      const newDoc = await processDocument(title, category, content, chunkSize);
      setDocuments(prev => [...prev, newDoc]);
      setSelectedDocId(newDoc.id);
      return newDoc;
    } catch (err: any) {
      setError(err.message || 'Document processing failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectedDocument = documents.find(d => d.id === selectedDocId) || documents[0] || null;

  const allChunks: Chunk[] = documents.flatMap(d => d.chunks);

  return {
    backendOnline,
    documents,
    selectedDocId,
    setSelectedDocId,
    selectedDocument,
    allChunks,
    question,
    setQuestion,
    tokenBudget,
    setTokenBudget,
    activeAlgorithm,
    setActiveAlgorithm,
    loading,
    error,
    lastResult,
    comparisonData,
    comparisonResults: comparisonData?.results || [],
    benchmarkSuite,
    handleOptimize,
    handleCompareAll,
    handleRunBenchmark,
    handleUploadDocument,
    refreshData
  };
}
