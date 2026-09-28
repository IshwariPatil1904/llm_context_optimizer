export interface Chunk {
  id: string;
  documentId: string;
  position: number;
  text: string;
  tokenCost: number;
  relevanceScore: number;
  topics: string[];
}

export interface Document {
  id: string;
  title: string;
  category: string;
  totalWords: number;
  totalTokens: number;
  chunkCount: number;
  chunks: Chunk[];
}

export interface OptimizationParams {
  tokenBudget: number;
  lambdaDiversity: number;
  redundancyPenalty: number;
  maxGenerations?: number;
  populationSize?: number;
  randomSeed?: number;
  epsilon?: number;
}

export interface OptimizationResult {
  algorithm: string;
  algorithmName: string;
  selectedChunkIds: string[];
  selectedChunkCount: number;
  totalTokens: number;
  tokenUtilization: number;
  totalRelevance: number;
  executionTime: number;
  executionTimeMs: number;
  topicCoverage: number;
  averageSimilarity: number;
  optimizedContext: string;
}

export interface ComparisonResponse {
  totalChunks: number;
  tokenBudget: number;
  question: string;
  totalAvailableTokens: number;
  results: OptimizationResult[];
}

export interface AlgorithmBenchmarkEntry {
  algorithmName: string;
  executionTimeMs: number;
  totalTokens: number;
  totalRelevance: number;
  topicCoverage: number;
  efficiencyIndex: number;
  tokenUtilization: number;
  isOptimal: boolean;
}

export interface BenchmarkSuiteResult {
  chunkCount: number;
  tokenBudget: number;
  query: string;
  entries: AlgorithmBenchmarkEntry[];
  bestQualityAlgorithm: string;
  fastestAlgorithm: string;
  bestBalancedAlgorithm: string;
}

export interface BenchmarkRunRecord {
  datasetSize: number;
  algorithmName: string;
  executionTimeMs: number;
  selectedChunksCount: number;
  totalTokens: number;
  totalRelevance: number;
  averageSimilarity: number;
  topicCoverage: number;
  tokenBudget: number;
  timestamp?: string;
}
