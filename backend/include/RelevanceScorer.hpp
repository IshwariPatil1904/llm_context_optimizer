#ifndef RELEVANCE_SCORER_HPP
#define RELEVANCE_SCORER_HPP

#include "Types.hpp"
#include <string>
#include <vector>
#include <map>
#include <unordered_map>

namespace llm_opt {

class RelevanceScorer {
public:
    RelevanceScorer() = default;

    // Score all chunks based on TF-IDF cosine similarity against query
    void scoreChunks(const std::string& query, std::vector<Chunk>& chunks);

    // Calculate pairwise similarity between two text chunks (0.0 to 1.0)
    static double calculatePairwiseSimilarity(const Chunk& c1, const Chunk& c2);

    // Calculate overall average similarity of selected chunks
    static double calculateAverageSimilarity(const std::vector<Chunk>& selectedChunks);

    // Calculate topic coverage percentage of selected chunks relative to all topics
    static double calculateTopicCoverage(const std::vector<Chunk>& selectedChunks,
                                           const std::vector<Chunk>& allChunks);

private:
    std::vector<std::string> tokenize(const std::string& text);
    std::unordered_map<std::string, double> computeTF(const std::vector<std::string>& tokens);
};

} // namespace llm_opt

#endif // RELEVANCE_SCORER_HPP
