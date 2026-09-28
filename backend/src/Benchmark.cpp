#include "Benchmark.hpp"
#include "DocumentProcessor.hpp"
#include "RelevanceScorer.hpp"
#include "GreedyOptimizer.hpp"
#include "DynamicProgramming.hpp"
#include "ApproximationOptimizer.hpp"
#include "RandomizedOptimizer.hpp"
#include "SubmodularOptimizer.hpp"
#include <algorithm>
#include <fstream>
#include <iostream>
#include <sstream>
#include <ctime>
#include <iomanip>

namespace llm_opt {

std::vector<Chunk> Benchmark::generateSyntheticDataset(int targetChunkCount) {
    std::vector<Chunk> chunks;
    chunks.reserve(targetChunkCount);

    // Base technical topics and paraphrased variations
    struct TopicSeed {
        std::string category;
        std::vector<std::string> textVariants;
        std::vector<std::string> keywords;
    };

    std::vector<TopicSeed> seeds = {
        {
            "normalization",
            {
                "First Normal Form (1NF) requires that all attributes contain atomic indivisible values and eliminates repeating groups in relational tables.",
                "1NF atomicity rule ensures each cell in a database relation holds exactly one scalar value, preventing nested arrays or multi-valued attributes.",
                "Second Normal Form (2NF) enforces that all non-prime attributes are fully functionally dependent on the primary key, removing partial dependencies.",
                "In 2NF relations with composite primary keys, attributes cannot depend on only a subset of candidate key columns.",
                "Third Normal Form (3NF) requires 2NF status and eliminates transitive functional dependencies where a non-key attribute depends on another non-key.",
                "Boyce-Codd Normal Form (BCNF) strictly requires that for every non-trivial functional dependency X -> Y, X must be a valid superkey in relation R."
            },
            {"normalization", "1nf", "2nf", "3nf", "bcnf", "atomic"}
        },
        {
            "functional_dependencies",
            {
                "Functional Dependency X -> Y expresses a constraint where the values of attribute set X uniquely determine the values of attribute set Y.",
                "Armstrong's Axioms provide a sound and complete set of inference rules: Reflexivity, Augmentation, and Transitivity for functional dependency closures.",
                "Computing attribute closure X+ involves iteratively applying known functional dependencies to identify all attributes determined by X.",
                "Minimal cover of functional dependencies removes extraneous attributes and redundant dependencies, preparing tables for 3NF synthesis."
            },
            {"dependencies", "armstrong", "closure", "candidate", "superkey"}
        },
        {
            "indexing",
            {
                "B+ Tree indexes store data pointers exclusively at leaf nodes linked sequentially, optimizing both point lookups and range query scans.",
                "Hash indexes map keys to bucket addresses via hash functions, providing O(1) exact match performance but failing on range queries.",
                "Clustered indexing dictates the physical storage layout of data rows on disk, allowing at most one clustered index per database table.",
                "Non-clustered secondary indexes maintain a separate index structure pointing to row identifiers (RID) or clustered primary key values."
            },
            {"indexing", "btree", "hash", "clustered", "scanning"}
        },
        {
            "transactions",
            {
                "ACID properties (Atomicity, Consistency, Isolation, Durability) guarantee reliable database transaction processing despite system failures.",
                "Write-Ahead Logging (WAL) protocol dictates that log records describing data mutations must reach stable storage before actual data pages are flushed to disk.",
                "Two-Phase Locking (2PL) protocol ensures strict serializability by dividing lock acquisition (growing phase) from lock release (shrinking phase).",
                "Multi-Version Concurrency Control (MVCC) maintains concurrent read-write access by providing snapshots of historical data versions without locking read operations."
            },
            {"transactions", "acid", "wal", "concurrency", "locking", "mvcc"}
        },
        {
            "joins",
            {
                "Hash Join algorithm builds an in-memory hash table on the smaller build relation, then probes it row-by-row using the larger probe relation.",
                "Sort-Merge Join sorts both input relations on join attributes first, then performs a unified linear merge scan to produce join tuples.",
                "Nested Loop Join evaluates every pair of tuples from outer and inner relations, serving as fallback for unindexed join predicates.",
                "Query Optimizer cost models evaluate CPU and I/O costs across alternative join trees to choose left-deep or bushy execution plans."
            },
            {"joins", "hashjoin", "sortmerge", "nestedloop", "optimizer"}
        }
    };

    DocumentProcessor proc;
    int currentIdx = 1;

    while (static_cast<int>(chunks.size()) < targetChunkCount) {
        size_t topicIdx = (currentIdx - 1) % seeds.size();
        const auto& seed = seeds[topicIdx];
        size_t variantIdx = (currentIdx - 1) / seeds.size() % seed.textVariants.size();

        std::string rawText = seed.textVariants[variantIdx];
        // Add slight unique suffix to prevent exact duplicate string collisions while keeping high similarity
        if (currentIdx > static_cast<int>(seeds.size() * seed.textVariants.size())) {
            rawText += " [Technical reference instance #" + std::to_string(currentIdx) + "]";
        }

        int tokenCost = proc.estimateTokenCount(rawText);
        std::string chunkId = "syn-c" + std::to_string(currentIdx);

        chunks.emplace_back(chunkId, "syn-doc", currentIdx, rawText, tokenCost, 0.0, seed.keywords);
        currentIdx++;
    }

    return chunks;
}

BenchmarkSuiteResult Benchmark::runSuite(const std::string& query,
                                          const std::vector<Chunk>& chunks,
                                          const OptimizationParams& params) {
    BenchmarkSuiteResult suite;
    suite.query = query;
    suite.chunkCount = static_cast<int>(chunks.size());
    suite.tokenBudget = params.tokenBudget;

    if (chunks.empty()) return suite;

    GreedyOptimizer greedy;
    DynamicProgramming dp;
    ApproximationOptimizer approx;
    RandomizedOptimizer randOpt;
    SubmodularOptimizer submod;

    std::vector<OptimizationResult> results;
    results.push_back(greedy.optimize(chunks, params));
    results.push_back(dp.optimize(chunks, params));
    results.push_back(approx.optimize(chunks, params));
    results.push_back(randOpt.optimize(chunks, params));
    results.push_back(submod.optimize(chunks, params));

    double maxRelevance = 0.0;
    double minTime = 1e9;
    double maxEfficiency = -1.0;

    for (const auto& res : results) {
        AlgorithmBenchmarkEntry entry;
        entry.algorithmName = res.algorithmName;
        entry.executionTimeMs = res.executionTimeMs;
        entry.totalTokens = res.totalTokens;
        entry.totalRelevance = res.totalRelevance;
        entry.topicCoverage = res.topicCoverage;
        entry.tokenUtilization = (params.tokenBudget > 0) ? (static_cast<double>(res.totalTokens) / params.tokenBudget * 100.0) : 0.0;

        double safeTime = std::max(0.001, res.executionTimeMs);
        entry.efficiencyIndex = res.totalRelevance / safeTime;

        if (res.totalRelevance > maxRelevance) {
            maxRelevance = res.totalRelevance;
            suite.bestQualityAlgorithm = res.algorithmName;
        }
        if (res.executionTimeMs < minTime) {
            minTime = res.executionTimeMs;
            suite.fastestAlgorithm = res.algorithmName;
        }
        if (entry.efficiencyIndex > maxEfficiency) {
            maxEfficiency = entry.efficiencyIndex;
            suite.bestBalancedAlgorithm = res.algorithmName;
        }

        suite.entries.push_back(entry);
    }

    for (auto& entry : suite.entries) {
        if (maxRelevance > 0 && entry.totalRelevance >= maxRelevance - 0.01) {
            entry.isOptimal = true;
        }
    }

    return suite;
}

std::vector<BenchmarkRunRecord> Benchmark::runScalingBenchmark(const std::string& query,
                                                                int tokenBudget,
                                                                const std::vector<int>& datasetSizes,
                                                                const std::string& csvOutputPath) {
    std::vector<BenchmarkRunRecord> allRecords;

    OptimizationParams params;
    params.tokenBudget = tokenBudget;

    // Get current ISO timestamp
    std::time_t now = std::time(nullptr);
    char buf[32];
    std::strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", std::localtime(&now));
    std::string timestampStr(buf);

    for (int size : datasetSizes) {
        auto syntheticChunks = generateSyntheticDataset(size);
        RelevanceScorer scorer;
        scorer.scoreChunks(query, syntheticChunks);

        GreedyOptimizer greedy;
        DynamicProgramming dp;
        ApproximationOptimizer approx;
        RandomizedOptimizer randOpt;
        SubmodularOptimizer submod;

        std::vector<OptimizationResult> results;
        results.push_back(greedy.optimize(syntheticChunks, params));
        results.push_back(dp.optimize(syntheticChunks, params));
        results.push_back(approx.optimize(syntheticChunks, params));
        results.push_back(randOpt.optimize(syntheticChunks, params));
        results.push_back(submod.optimize(syntheticChunks, params));

        for (const auto& res : results) {
            BenchmarkRunRecord rec;
            rec.datasetSize = size;
            rec.algorithmName = res.algorithmName;
            rec.executionTimeMs = res.executionTimeMs;
            rec.selectedChunksCount = res.selectedChunkCount;
            rec.totalTokens = res.totalTokens;
            rec.totalRelevance = res.totalRelevance;
            rec.averageSimilarity = res.averageSimilarity;
            rec.topicCoverage = res.topicCoverage;
            rec.tokenBudget = tokenBudget;
            rec.timestamp = timestampStr;

            allRecords.push_back(rec);
        }
    }

    exportToCsv(allRecords, csvOutputPath);
    return allRecords;
}

void Benchmark::exportToCsv(const std::vector<BenchmarkRunRecord>& records, const std::string& csvPath) {
    std::ofstream file(csvPath, std::ios::out | std::ios::trunc);
    if (!file.is_open()) {
        std::cerr << "[Benchmark] Failed to open CSV output path: " << csvPath << "\n";
        return;
    }

    file << "DatasetSize,Algorithm,ExecutionTimeMs,SelectedChunksCount,TotalTokens,TotalRelevance,AverageSimilarity,TopicCoverage,TokenBudget,Timestamp\n";

    for (const auto& r : records) {
        file << r.datasetSize << ","
             << "\"" << r.algorithmName << "\","
             << std::fixed << std::setprecision(4) << r.executionTimeMs << ","
             << r.selectedChunksCount << ","
             << r.totalTokens << ","
             << std::fixed << std::setprecision(2) << r.totalRelevance << ","
             << std::fixed << std::setprecision(4) << r.averageSimilarity << ","
             << std::fixed << std::setprecision(2) << r.topicCoverage << ","
             << r.tokenBudget << ","
             << "\"" << r.timestamp << "\"\n";
    }

    file.close();
    std::cout << "[Benchmark] Successfully exported " << records.size() << " benchmark records to " << csvPath << "\n";
}

} // namespace llm_opt
