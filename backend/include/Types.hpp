#ifndef TYPES_HPP
#define TYPES_HPP

#include <string>
#include <vector>
#include <map>
#include <unordered_set>
#include <algorithm>

namespace llm_opt {

struct Chunk {
    std::string id;
    std::string documentId;
    int position = 0; // 1-indexed chunk position in document
    std::string text;
    int tokenCost = 0; // Word count / token cost metric
    double relevanceScore = 0.0;
    std::vector<std::string> topics;

    Chunk() = default;
    Chunk(std::string id_, std::string docId_, int pos_, std::string text_, int tokens_, double rel_, std::vector<std::string> topics_ = {})
        : id(std::move(id_)), documentId(std::move(docId_)), position(pos_), text(std::move(text_)),
          tokenCost(tokens_), relevanceScore(rel_), topics(std::move(topics_)) {}
};

struct Document {
    std::string id;
    std::string title;
    std::string category;
    std::string content;
    int totalWords = 0;
    int totalTokens = 0;
    std::vector<Chunk> chunks;
};

struct OptimizationParams {
    int tokenBudget = 1000;
    double lambdaDiversity = 0.3;    // Diversity weight
    double redundancyPenalty = 0.5;  // Redundancy penalty weight (default 0.5)
    int maxGenerations = 300;        // Default 300 iterations
    int populationSize = 50;
    int randomSeed = 42;             // Default seed 42
    double epsilon = 0.1;
};

struct OptimizationResult {
    std::string algorithmName;
    std::vector<std::string> selectedChunkIds;
    int selectedChunkCount = 0;
    int totalTokens = 0;
    double totalRelevance = 0.0;
    double executionTimeMs = 0.0;
    double topicCoverage = 0.0;     // 0 - 100%
    double averageSimilarity = 0.0; // 0 - 1.0
    std::string optimizedContext;
};

struct AlgorithmBenchmarkEntry {
    std::string algorithmName;
    double executionTimeMs = 0.0;
    int totalTokens = 0;
    double totalRelevance = 0.0;
    double topicCoverage = 0.0;
    double efficiencyIndex = 0.0; // Relevance per ms
    double tokenUtilization = 0.0; // Total tokens / budget * 100%
    bool isOptimal = false;
};

struct BenchmarkSuiteResult {
    int chunkCount = 0;
    int tokenBudget = 0;
    std::string query;
    std::vector<AlgorithmBenchmarkEntry> entries;
    std::string bestQualityAlgorithm;
    std::string fastestAlgorithm;
    std::string bestBalancedAlgorithm;
};

struct BenchmarkRunRecord {
    int datasetSize = 0;
    std::string algorithmName;
    double executionTimeMs = 0.0;
    int selectedChunksCount = 0;
    int totalTokens = 0;
    double totalRelevance = 0.0;
    double averageSimilarity = 0.0;
    double topicCoverage = 0.0;
    int tokenBudget = 0;
    std::string timestamp;
};

} // namespace llm_opt

#endif // TYPES_HPP
