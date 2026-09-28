#include "DynamicProgramming.hpp"
#include "RelevanceScorer.hpp"
#include <chrono>
#include <vector>
#include <algorithm>
#include <cmath>

namespace llm_opt {

OptimizationResult DynamicProgramming::optimize(const std::vector<Chunk>& chunks,
                                               const OptimizationParams& params) {
    auto startTime = std::chrono::high_resolution_clock::now();

    OptimizationResult result;
    result.algorithmName = "0-1 Knapsack Dynamic Programming";

    if (chunks.empty() || params.tokenBudget <= 0) {
        return result;
    }

    size_t n = chunks.size();
    int W = params.tokenBudget;

    // Scale floating relevance scores to integers (multiplier 100 for precision)
    constexpr int SCALE = 100;
    std::vector<int64_t> values(n);
    std::vector<int> weights(n);

    for (size_t i = 0; i < n; ++i) {
        values[i] = static_cast<int64_t>(std::round(chunks[i].relevanceScore * SCALE));
        weights[i] = std::max(1, chunks[i].tokenCost);
    }

    // 2D DP matrix for exact backtracking: dp[i][w]
    // DP state: maximum scaled relevance achievable using first i items within weight w
    std::vector<std::vector<int64_t>> dp(n + 1, std::vector<int64_t>(W + 1, 0));

    for (size_t i = 1; i <= n; ++i) {
        int w_i = weights[i - 1];
        int64_t v_i = values[i - 1];

        for (int w = 0; w <= W; ++w) {
            if (w_i <= w) {
                dp[i][w] = std::max(dp[i - 1][w], dp[i - 1][w - w_i] + v_i);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }

    // Backtrack to extract selected item indices
    std::vector<Chunk> selected;
    std::string assembledContext = "";
    int w = W;

    for (size_t i = n; i > 0; --i) {
        if (dp[i][w] != dp[i - 1][w]) {
            const auto& chunk = chunks[i - 1];
            selected.push_back(chunk);
            result.selectedChunkIds.push_back(chunk.id);
            result.totalTokens += chunk.tokenCost;
            result.totalRelevance += chunk.relevanceScore;
            w -= weights[i - 1];
        }
    }

    // Reverse selected list so order matches original
    std::reverse(selected.begin(), selected.end());
    std::reverse(result.selectedChunkIds.begin(), result.selectedChunkIds.end());

    for (const auto& chunk : selected) {
        if (!assembledContext.empty()) assembledContext += "\n\n";
        assembledContext += "[" + chunk.id + "]\n" + chunk.text;
    }

    result.selectedChunkCount = static_cast<int>(result.selectedChunkIds.size());
    result.optimizedContext = assembledContext;
    result.topicCoverage = RelevanceScorer::calculateTopicCoverage(selected, chunks);
    result.averageSimilarity = RelevanceScorer::calculateAverageSimilarity(selected);

    auto endTime = std::chrono::high_resolution_clock::now();
    result.executionTimeMs = std::chrono::duration<double, std::milli>(endTime - startTime).count();

    return result;
}

} // namespace llm_opt
