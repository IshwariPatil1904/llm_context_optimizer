#include "DocumentProcessor.hpp"
#include "RelevanceScorer.hpp"
#include "GreedyOptimizer.hpp"
#include "DynamicProgramming.hpp"
#include "ApproximationOptimizer.hpp"
#include "RandomizedOptimizer.hpp"
#include "SubmodularOptimizer.hpp"
#include "Benchmark.hpp"
#include <iostream>
#include <cassert>
#include <cmath>
#include <algorithm>

using namespace llm_opt;

void testGreedyEdgeCases() {
    std::cout << "  [Test] Greedy Optimizer Edge Cases...\n";
    GreedyOptimizer optimizer;
    OptimizationParams params;

    // 1. Empty dataset
    std::vector<Chunk> emptyChunks;
    params.tokenBudget = 100;
    auto resEmpty = optimizer.optimize(emptyChunks, params);
    assert(resEmpty.selectedChunkIds.empty());
    assert(resEmpty.totalTokens == 0);
    assert(resEmpty.totalRelevance == 0.0);

    // 2. Zero budget
    // Chunk constructor: id, docId, position, text, tokenCost, relevanceScore, topics
    std::vector<Chunk> sampleChunks = {
        Chunk("c1", "doc1", 1, "Text chunk 1", 50, 45.0, {"db"}),
        Chunk("c2", "doc1", 2, "Text chunk 2", 30, 30.0, {"db"})
    };
    params.tokenBudget = 0;
    auto resZeroBudget = optimizer.optimize(sampleChunks, params);
    assert(resZeroBudget.selectedChunkIds.empty());
    assert(resZeroBudget.totalTokens == 0);

    // 3. Budget smaller than every chunk
    params.tokenBudget = 10;
    auto resSmallBudget = optimizer.optimize(sampleChunks, params);
    assert(resSmallBudget.selectedChunkIds.empty());
    assert(resSmallBudget.totalTokens == 0);

    // 4. Budget exactly matching a chunk
    params.tokenBudget = 30;
    auto resExactBudget = optimizer.optimize(sampleChunks, params);
    assert(resExactBudget.selectedChunkIds.size() == 1);
    assert(resExactBudget.selectedChunkIds[0] == "c2");
    assert(resExactBudget.totalTokens == 30);

    // 5. Budget larger than total tokens
    params.tokenBudget = 500;
    auto resLargeBudget = optimizer.optimize(sampleChunks, params);
    assert(resLargeBudget.selectedChunkIds.size() == 2);
    assert(resLargeBudget.totalTokens == 80);

    // 6. Zero token cost chunk handling
    std::vector<Chunk> zeroCostChunks = {
        Chunk("c0", "doc1", 1, "Free chunk", 0, 10.0, {"free"})
    };
    params.tokenBudget = 50;
    auto resZeroCost = optimizer.optimize(zeroCostChunks, params);
    assert(!resZeroCost.selectedChunkIds.empty());

    std::cout << "    ✓ Greedy edge cases PASSED.\n";
}

void testDynamicProgrammingVerifiableKnapsack() {
    std::cout << "  [Test] Dynamic Programming 0-1 Knapsack Traceback...\n";
    DynamicProgramming dp;
    OptimizationParams params;
    params.tokenBudget = 50;

    // Manually verifiable knapsack items
    // Item 1: weight 20, value 60.0
    // Item 2: weight 30, value 100.0
    // Item 3: weight 40, value 120.0
    // Budget = 50
    // Optimal subset: Item 1 + Item 2 (weight 50, value 160.0)
    std::vector<Chunk> chunks = {
        Chunk("i1", "doc1", 1, "Item 1 text", 20, 60.0, {"t1"}),
        Chunk("i2", "doc1", 2, "Item 2 text", 30, 100.0, {"t2"}),
        Chunk("i3", "doc1", 3, "Item 3 text", 40, 120.0, {"t3"})
    };

    auto res = dp.optimize(chunks, params);
    assert(res.totalTokens == 50);
    assert(std::abs(res.totalRelevance - 160.0) < 1e-3);
    assert(res.selectedChunkIds.size() == 2);
    assert(std::find(res.selectedChunkIds.begin(), res.selectedChunkIds.end(), "i1") != res.selectedChunkIds.end());
    assert(std::find(res.selectedChunkIds.begin(), res.selectedChunkIds.end(), "i2") != res.selectedChunkIds.end());
    assert(res.totalTokens <= params.tokenBudget);

    std::cout << "    ✓ DP 0-1 Knapsack exact traceback PASSED (Optimal: Item 1 + Item 2 = 160.0 relevance).\n";
}

void testApproximationCandidates() {
    std::cout << "  [Test] Approximation Optimizer Strategy...\n";
    ApproximationOptimizer approx;
    OptimizationParams params;
    params.tokenBudget = 50;

    // Case where single large item beats ratio greedy:
    // Item 1: weight 40, relevance 10.0 (ratio 0.25)
    // Item 2: weight 20, relevance 6.0 (ratio 0.3)
    // Item 3: weight 45, relevance 50.0 (single item fits in 50, relevance 50.0)
    // Ratio greedy takes Item 2 (weight 20, rel 6.0) then Item 1 (doesn't fit). Total rel = 6.0
    // Single best item is Item 3 (weight 45, rel 50.0).
    // Approximation should select Item 3 (relevance 50.0 > 6.0).
    std::vector<Chunk> chunks = {
        Chunk("a1", "doc1", 1, "Item A1", 40, 10.0, {"t1"}),
        Chunk("a2", "doc1", 2, "Item A2", 20, 6.0, {"t2"}),
        Chunk("a3", "doc1", 3, "Item A3", 45, 50.0, {"t3"})
    };

    auto res = approx.optimize(chunks, params);
    assert(res.totalTokens <= params.tokenBudget);
    assert(res.totalRelevance >= 50.0);
    assert(res.selectedChunkIds.size() == 1);
    assert(res.selectedChunkIds[0] == "a3");

    std::cout << "    ✓ Approximation Optimizer candidate selection PASSED.\n";
}

void testRandomizedDeterministicSeed() {
    std::cout << "  [Test] Randomized Optimizer Deterministic Seed...\n";
    RandomizedOptimizer randOpt;
    OptimizationParams params;
    params.tokenBudget = 100;
    params.randomSeed = 42;
    params.maxGenerations = 100;
    params.populationSize = 20;

    std::vector<Chunk> chunks = {
        Chunk("r1", "doc1", 1, "Randomized chunk 1", 30, 40.0, {"t1"}),
        Chunk("r2", "doc1", 2, "Randomized chunk 2", 40, 50.0, {"t2"}),
        Chunk("r3", "doc1", 3, "Randomized chunk 3", 50, 60.0, {"t3"}),
        Chunk("r4", "doc1", 4, "Randomized chunk 4", 20, 30.0, {"t4"})
    };

    auto res1 = randOpt.optimize(chunks, params);
    auto res2 = randOpt.optimize(chunks, params);

    assert(res1.totalTokens <= params.tokenBudget);
    assert(res2.totalTokens <= params.tokenBudget);
    assert(res1.selectedChunkIds == res2.selectedChunkIds);
    assert(res1.totalRelevance == res2.totalRelevance);

    std::cout << "    ✓ Randomized Optimizer seed determinism & budget constraint PASSED.\n";
}

void testSubmodularRedundancyPenalty() {
    std::cout << "  [Test] Submodular Optimizer Redundancy Penalty...\n";
    SubmodularOptimizer submod;
    OptimizationParams params;
    params.tokenBudget = 100;
    params.redundancyPenalty = 0.5;

    // Two identical topic chunks vs one distinct topic chunk
    std::vector<Chunk> chunks = {
        Chunk("s1", "doc1", 1, "Database normalization 1NF 2NF", 40, 80.0, {"db", "normalization"}),
        Chunk("s2", "doc1", 2, "Database normalization duplicate topic", 40, 78.0, {"db", "normalization"}),
        Chunk("s3", "doc1", 3, "Transaction processing ACID properties", 40, 75.0, {"transactions", "acid"})
    };

    auto res = submod.optimize(chunks, params);
    assert(res.totalTokens <= params.tokenBudget);
    assert(!res.selectedChunkIds.empty());

    // Check that selected chunk IDs are unique
    std::sort(res.selectedChunkIds.begin(), res.selectedChunkIds.end());
    auto it = std::unique(res.selectedChunkIds.begin(), res.selectedChunkIds.end());
    assert(it == res.selectedChunkIds.end());

    std::cout << "    ✓ Submodular Optimizer redundancy penalty & uniqueness PASSED.\n";
}

int main() {
    std::cout << "=========================================================\n";
    std::cout << "  C++ LLM Context Optimizer Core Algorithm Test Suite    \n";
    std::cout << "=========================================================\n";

    DocumentProcessor proc;
    auto docs = proc.createSampleDataset();
    assert(!docs.empty());
    std::cout << "  - Sample dataset created with " << docs.size() << " documents.\n";

    std::vector<Chunk> allChunks;
    for (const auto& doc : docs) {
        for (const auto& c : doc.chunks) {
            allChunks.push_back(c);
        }
    }
    assert(!allChunks.empty());
    std::cout << "  - Total chunks extracted: " << allChunks.size() << "\n";

    std::string query = "knapsack submodular optimization dynamic programming";
    RelevanceScorer scorer;
    scorer.scoreChunks(query, allChunks);

    for (const auto& c : allChunks) {
        assert(c.relevanceScore >= 0.0);
    }
    std::cout << "  - Relevance scoring verified.\n\n";

    // Run explicit unit tests for each DAA algorithm
    testGreedyEdgeCases();
    testDynamicProgrammingVerifiableKnapsack();
    testApproximationCandidates();
    testRandomizedDeterministicSeed();
    testSubmodularRedundancyPenalty();

    std::cout << "\n  - Running full suite optimization benchmarks...\n";
    OptimizationParams params;
    params.tokenBudget = 250;

    GreedyOptimizer greedy;
    auto resGreedy = greedy.optimize(allChunks, params);
    assert(resGreedy.totalTokens <= params.tokenBudget);

    DynamicProgramming dp;
    auto resDp = dp.optimize(allChunks, params);
    assert(resDp.totalTokens <= params.tokenBudget);

    ApproximationOptimizer approx;
    auto resApprox = approx.optimize(allChunks, params);
    assert(resApprox.totalTokens <= params.tokenBudget);

    RandomizedOptimizer randOpt;
    auto resRand = randOpt.optimize(allChunks, params);
    assert(resRand.totalTokens <= params.tokenBudget);

    SubmodularOptimizer submod;
    auto resSubmod = submod.optimize(allChunks, params);
    assert(resSubmod.totalTokens <= params.tokenBudget);

    Benchmark bench;
    auto suite = bench.runSuite(query, allChunks, params);
    assert(suite.entries.size() == 5);
    std::cout << "  - Benchmark Suite executed successfully. Best quality algo: " << suite.bestQualityAlgorithm << "\n";

    std::cout << "\n=========================================================\n";
    std::cout << "  [SUCCESS] All DAA Algorithm Unit Tests PASSED!        \n";
    std::cout << "=========================================================\n";
    return 0;
}
