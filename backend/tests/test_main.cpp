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

using namespace llm_opt;

int main() {
    std::cout << "[Tests] Running C++ LLM Context Optimizer core algorithm tests...\n";

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
    std::cout << "  - Relevance scoring verified.\n";

    OptimizationParams params;
    params.tokenBudget = 250;

    GreedyOptimizer greedy;
    auto resGreedy = greedy.optimize(allChunks, params);
    assert(resGreedy.totalTokens <= params.tokenBudget);
    std::cout << "  - Greedy Optimizer: " << resGreedy.selectedChunkIds.size() << " chunks selected, "
              << resGreedy.totalTokens << " tokens, relevance " << resGreedy.totalRelevance << "\n";

    DynamicProgramming dp;
    auto resDp = dp.optimize(allChunks, params);
    assert(resDp.totalTokens <= params.tokenBudget);
    std::cout << "  - DP Optimizer: " << resDp.selectedChunkIds.size() << " chunks selected, "
              << resDp.totalTokens << " tokens, relevance " << resDp.totalRelevance << "\n";

    ApproximationOptimizer approx;
    auto resApprox = approx.optimize(allChunks, params);
    assert(resApprox.totalTokens <= params.tokenBudget);
    std::cout << "  - Approximation Optimizer: " << resApprox.totalTokens << " tokens, relevance " << resApprox.totalRelevance << "\n";

    RandomizedOptimizer randOpt;
    auto resRand = randOpt.optimize(allChunks, params);
    assert(resRand.totalTokens <= params.tokenBudget);
    std::cout << "  - Randomized Optimizer: " << resRand.totalTokens << " tokens, relevance " << resRand.totalRelevance << "\n";

    SubmodularOptimizer submod;
    auto resSubmod = submod.optimize(allChunks, params);
    assert(resSubmod.totalTokens <= params.tokenBudget);
    std::cout << "  - Submodular Optimizer: " << resSubmod.totalTokens << " tokens, relevance " << resSubmod.totalRelevance << "\n";

    Benchmark bench;
    auto suite = bench.runSuite(query, allChunks, params);
    assert(suite.entries.size() == 5);
    std::cout << "  - Benchmark Suite executed successfully. Best quality algo: " << suite.bestQualityAlgorithm << "\n";

    std::cout << "[Tests] All core C++ unit tests PASSED successfully!\n";
    return 0;
}
