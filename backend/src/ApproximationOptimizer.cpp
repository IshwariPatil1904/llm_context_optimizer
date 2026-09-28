#include "ApproximationOptimizer.hpp"
#include "GreedyOptimizer.hpp"
#include "RelevanceScorer.hpp"
#include <chrono>
#include <algorithm>
#include <cmath>

namespace llm_opt {

OptimizationResult ApproximationOptimizer::optimize(const std::vector<Chunk>& chunks,
                                                  const OptimizationParams& params) {
    auto startTime = std::chrono::high_resolution_clock::now();

    OptimizationResult result;
    result.algorithmName = "FPTAS / 2-Approximation Optimizer";

    if (chunks.empty() || params.tokenBudget <= 0) {
        return result;
    }

    // 1. Compute pure density Greedy solution S_greedy
    GreedyOptimizer greedy;
    OptimizationResult greedyResult = greedy.optimize(chunks, params);

    // 2. Find the single chunk with the highest relevance that fits in budget W
    size_t maxSingleIdx = std::numeric_limits<size_t>::max();
    double maxSingleRelevance = -1.0;

    for (size_t i = 0; i < chunks.size(); ++i) {
        if (chunks[i].tokenCost <= params.tokenBudget) {
            if (chunks[i].relevanceScore > maxSingleRelevance) {
                maxSingleRelevance = chunks[i].relevanceScore;
                maxSingleIdx = i;
            }
        }
    }

    // 3. Compare Greedy solution vs Single max relevance item (2-Approximation Theorem)
    if (greedyResult.totalRelevance >= maxSingleRelevance || maxSingleIdx == std::numeric_limits<size_t>::max()) {
        result = greedyResult;
        result.algorithmName = "FPTAS / 2-Approximation Optimizer";
    } else {
        // Single item wins
        const auto& singleChunk = chunks[maxSingleIdx];
        result.selectedChunkIds.push_back(singleChunk.id);
        result.totalTokens = singleChunk.tokenCost;
        result.totalRelevance = singleChunk.relevanceScore;
        result.optimizedContext = "[" + singleChunk.id + "]\n" + singleChunk.text;

        std::vector<Chunk> selected = {singleChunk};
        result.topicCoverage = RelevanceScorer::calculateTopicCoverage(selected, chunks);
        result.averageSimilarity = 0.0;
    }

    result.selectedChunkCount = static_cast<int>(result.selectedChunkIds.size());
    auto endTime = std::chrono::high_resolution_clock::now();
    result.executionTimeMs = std::chrono::duration<double, std::milli>(endTime - startTime).count();

    return result;
}

} // namespace llm_opt
