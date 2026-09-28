#include "RandomizedOptimizer.hpp"
#include "RelevanceScorer.hpp"
#include <chrono>
#include <random>
#include <algorithm>
#include <cmath>

namespace llm_opt {

OptimizationResult RandomizedOptimizer::optimize(const std::vector<Chunk>& chunks,
                                                const OptimizationParams& params) {
    auto startTime = std::chrono::high_resolution_clock::now();

    OptimizationResult result;
    result.algorithmName = "Randomized Search / Genetic Optimizer";

    if (chunks.empty() || params.tokenBudget <= 0) {
        return result;
    }

    size_t n = chunks.size();
    int popSize = std::max(10, params.populationSize);
    int maxGen = (params.maxGenerations > 0) ? params.maxGenerations : 300;
    int W = params.tokenBudget;
    unsigned int seed = (params.randomSeed > 0) ? params.randomSeed : 42;

    std::mt19937 rng(seed); // Deterministic seed
    std::uniform_real_distribution<double> dist01(0.0, 1.0);
    std::uniform_int_distribution<int> distChunk(0, static_cast<int>(n) - 1);

    using Chromosome = std::vector<uint8_t>;

    auto evaluateFitness = [&](const Chromosome& c) -> double {
        int tokens = 0;
        double relevance = 0.0;
        for (size_t i = 0; i < n; ++i) {
            if (c[i]) {
                tokens += chunks[i].tokenCost;
                relevance += chunks[i].relevanceScore;
            }
        }
        if (tokens > W) {
            // Penalty for exceeding token budget
            double overflow = tokens - W;
            return std::max(0.0, relevance - overflow * 10.0);
        }
        return relevance;
    };

    // Initialize Population
    std::vector<Chromosome> population(popSize, Chromosome(n, 0));
    for (int i = 0; i < popSize; ++i) {
        int currentTokens = 0;
        for (size_t j = 0; j < n; ++j) {
            if (dist01(rng) < 0.4) {
                if (currentTokens + chunks[j].tokenCost <= W) {
                    population[i][j] = 1;
                    currentTokens += chunks[j].tokenCost;
                }
            }
        }
    }

    Chromosome bestChromosome(n, 0);
    double bestFitness = -1.0;

    for (int gen = 0; gen < maxGen; ++gen) {
        std::vector<double> fitnesses(popSize);
        for (int i = 0; i < popSize; ++i) {
            fitnesses[i] = evaluateFitness(population[i]);
            if (fitnesses[i] > bestFitness) {
                bestFitness = fitnesses[i];
                bestChromosome = population[i];
            }
        }

        std::vector<Chromosome> nextGen;
        nextGen.reserve(popSize);
        nextGen.push_back(bestChromosome); // Elitism

        while (nextGen.size() < static_cast<size_t>(popSize)) {
            int i1 = distChunk(rng) % popSize, i2 = distChunk(rng) % popSize;
            const auto& p1 = (fitnesses[i1] > fitnesses[i2]) ? population[i1] : population[i2];

            int i3 = distChunk(rng) % popSize, i4 = distChunk(rng) % popSize;
            const auto& p2 = (fitnesses[i3] > fitnesses[i4]) ? population[i3] : population[i4];

            Chromosome child(n, 0);
            size_t crossPoint = distChunk(rng);
            for (size_t k = 0; k < n; ++k) {
                child[k] = (k < crossPoint) ? p1[k] : p2[k];
            }

            double mutRate = 1.0 / n;
            for (size_t k = 0; k < n; ++k) {
                if (dist01(rng) < mutRate) {
                    child[k] = !child[k];
                }
            }

            nextGen.push_back(child);
        }

        population = std::move(nextGen);
    }

    std::vector<Chunk> selected;
    std::string assembledContext = "";

    for (size_t i = 0; i < n; ++i) {
        if (bestChromosome[i]) {
            const auto& chunk = chunks[i];
            selected.push_back(chunk);
            result.selectedChunkIds.push_back(chunk.id);
            result.totalTokens += chunk.tokenCost;
            result.totalRelevance += chunk.relevanceScore;

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
