#include "GreedyOptimizer.hpp"
#include "RelevanceScorer.hpp"
#include <chrono>
#include <algorithm>

namespace llm_opt {

OptimizationResult GreedyOptimizer::optimize(const std::vector<Chunk>& chunks,
                                            const OptimizationParams& params) {
    auto startTime = std::chrono::high_resolution_clock::now();

    OptimizationResult result;
    result.algorithmName = "Greedy Ratio Optimizer";

    if (chunks.empty() || params.tokenBudget <= 0) {
        return result;
    }

    // Create index structure sorted by relevance-to-cost ratio descending
    struct ChunkRatio {
        size_t index;
        double ratio;
    };

    std::vector<ChunkRatio> ratios;
    ratios.reserve(chunks.size());

    for (size_t i = 0; i < chunks.size(); ++i) {
        double cost = std::max(1, chunks[i].tokenCost);
        double r = chunks[i].relevanceScore / cost;
        ratios.push_back({i, r});
    }

    std::sort(ratios.begin(), ratios.end(), [](const ChunkRatio& a, const ChunkRatio& b) {
        return a.ratio > b.ratio;
    });

    int remainingBudget = params.tokenBudget;
    std::vector<Chunk> selected;
    std::string assembledContext = "";

    for (const auto& item : ratios) {
        const auto& chunk = chunks[item.index];
        if (chunk.tokenCost <= remainingBudget) {
            selected.push_back(chunk);
            result.selectedChunkIds.push_back(chunk.id);
            result.totalTokens += chunk.tokenCost;
            result.totalRelevance += chunk.relevanceScore;
            remainingBudget -= chunk.tokenCost;

            if (!assembledContext.empty()) assembledContext += "\n\n";
            assembledContext += "[" + chunk.id + "]\n" + chunk.text;
        }
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
