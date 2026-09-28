#include "SubmodularOptimizer.hpp"
#include "RelevanceScorer.hpp"
#include <chrono>
#include <unordered_set>
#include <algorithm>
#include <cmath>

namespace llm_opt {

double SubmodularOptimizer::computeSubmodularValue(const std::vector<Chunk>& selected,
                                                   const OptimizationParams& params,
                                                   const std::vector<Chunk>& allChunks) {
    if (selected.empty()) return 0.0;

    double relevanceSum = 0.0;
    for (const auto& c : selected) {
        relevanceSum += c.relevanceScore;
    }

    std::unordered_set<std::string> uniqueTopics;
    for (const auto& c : selected) {
        for (const auto& t : c.topics) {
            uniqueTopics.insert(t);
        }
    }
    double diversityGain = uniqueTopics.size() * 15.0 * params.lambdaDiversity;

    // Pairwise Redundancy penalty using lexical similarity (default redundancy penalty 0.5)
    double redundancyPenalty = 0.0;
    double redWeight = (params.redundancyPenalty > 0.0) ? params.redundancyPenalty : 0.5;

    if (selected.size() > 1) {
        double totalSim = 0.0;
        for (size_t i = 0; i < selected.size(); ++i) {
            for (size_t j = i + 1; j < selected.size(); ++j) {
                totalSim += RelevanceScorer::calculatePairwiseSimilarity(selected[i], selected[j]);
            }
        }
        redundancyPenalty = totalSim * 20.0 * redWeight;
    }

    return relevanceSum + diversityGain - redundancyPenalty;
}

OptimizationResult SubmodularOptimizer::optimize(const std::vector<Chunk>& chunks,
                                                const OptimizationParams& params) {
    auto startTime = std::chrono::high_resolution_clock::now();

    OptimizationResult result;
    result.algorithmName = "Submodular Lazy Greedy Maximizer";

    if (chunks.empty() || params.tokenBudget <= 0) {
        return result;
    }

    size_t n = chunks.size();
    std::vector<bool> inSelected(n, false);
    std::vector<Chunk> selected;
    int remainingBudget = params.tokenBudget;

    while (true) {
        size_t bestIdx = std::numeric_limits<size_t>::max();
        double bestMarginalRatio = -1e9;
        double currentVal = computeSubmodularValue(selected, params, chunks);

        for (size_t i = 0; i < n; ++i) {
            if (inSelected[i]) continue;
            const auto& candidate = chunks[i];

            if (candidate.tokenCost <= remainingBudget) {
                selected.push_back(candidate);
                double newVal = computeSubmodularValue(selected, params, chunks);
                selected.pop_back();

                double marginalGain = newVal - currentVal;
                double cost = std::max(1, candidate.tokenCost);
                double marginalRatio = marginalGain / cost;

                if (marginalRatio > bestMarginalRatio && marginalGain > 0.001) {
                    bestMarginalRatio = marginalRatio;
                    bestIdx = i;
                }
            }
        }

        if (bestIdx == std::numeric_limits<size_t>::max()) {
            break;
        }

        inSelected[bestIdx] = true;
        const auto& bestChunk = chunks[bestIdx];
        selected.push_back(bestChunk);
        result.selectedChunkIds.push_back(bestChunk.id);
        result.totalTokens += bestChunk.tokenCost;
        result.totalRelevance += bestChunk.relevanceScore;
        remainingBudget -= bestChunk.tokenCost;
    }

    std::string assembledContext = "";
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
