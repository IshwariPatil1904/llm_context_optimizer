#include "RelevanceScorer.hpp"
#include <sstream>
#include <algorithm>
#include <cctype>
#include <cmath>
#include <unordered_set>
#include <map>

namespace llm_opt {

std::vector<std::string> RelevanceScorer::tokenize(const std::string& text) {
    std::vector<std::string> tokens;
    std::string token;
    for (char c : text) {
        if (std::isalnum(static_cast<unsigned char>(c))) {
            token += std::tolower(static_cast<unsigned char>(c));
        } else {
            if (!token.empty()) {
                if (token.length() > 2) {
                    tokens.push_back(token);
                }
                token.clear();
            }
        }
    }
    if (!token.empty() && token.length() > 2) {
        tokens.push_back(token);
    }
    return tokens;
}

std::unordered_map<std::string, double> RelevanceScorer::computeTF(const std::vector<std::string>& tokens) {
    std::unordered_map<std::string, double> tf;
    if (tokens.empty()) return tf;

    for (const auto& t : tokens) {
        tf[t] += 1.0;
    }
    for (auto& pair : tf) {
        pair.second /= tokens.size();
    }
    return tf;
}

void RelevanceScorer::scoreChunks(const std::string& query, std::vector<Chunk>& chunks) {
    auto queryTokens = tokenize(query);
    if (queryTokens.empty() || chunks.empty()) {
        for (auto& chunk : chunks) chunk.relevanceScore = 10.0;
        return;
    }

    // Compute document frequency (DF) for IDF
    std::unordered_map<std::string, int> docFrequency;
    std::vector<std::unordered_map<std::string, double>> chunkTFs;

    for (const auto& chunk : chunks) {
        auto chunkTokens = tokenize(chunk.text);
        auto tf = computeTF(chunkTokens);
        chunkTFs.push_back(tf);

        std::unordered_set<std::string> uniqueWords;
        for (const auto& pair : tf) {
            uniqueWords.insert(pair.first);
        }
        for (const auto& word : uniqueWords) {
            docFrequency[word]++;
        }
    }

    // Compute IDF
    size_t N = chunks.size();
    std::unordered_map<std::string, double> idf;
    for (const auto& pair : docFrequency) {
        idf[pair.first] = std::log((N + 1.0) / (pair.second + 0.5)) + 1.0;
    }

    // Compute Query Vector
    auto queryTF = computeTF(queryTokens);
    std::unordered_map<std::string, double> queryVector;
    double queryNormSq = 0.0;
    for (const auto& pair : queryTF) {
        double weight = pair.second * (idf.count(pair.first) ? idf[pair.first] : 1.0);
        queryVector[pair.first] = weight;
        queryNormSq += weight * weight;
    }
    double queryNorm = std::sqrt(queryNormSq);
    if (queryNorm == 0.0) queryNorm = 1.0;

    // Score Chunks using Cosine Similarity + Keyword Match Bonus
    double maxScore = 0.0;
    std::vector<double> rawScores(chunks.size(), 0.0);

    for (size_t i = 0; i < chunks.size(); ++i) {
        const auto& chunkTF = chunkTFs[i];
        double dotProduct = 0.0;
        double chunkNormSq = 0.0;

        for (const auto& pair : chunkTF) {
            double weight = pair.second * (idf.count(pair.first) ? idf[pair.first] : 1.0);
            chunkNormSq += weight * weight;
            if (queryVector.count(pair.first)) {
                dotProduct += weight * queryVector[pair.first];
            }
        }
        double chunkNorm = std::sqrt(chunkNormSq);
        if (chunkNorm == 0.0) chunkNorm = 1.0;

        double cosineSim = dotProduct / (queryNorm * chunkNorm);

        // Keyword exact match bonus
        int exactMatchCount = 0;
        std::string lowerChunkText = chunks[i].text;
        std::transform(lowerChunkText.begin(), lowerChunkText.end(), lowerChunkText.begin(), ::tolower);
        for (const auto& qt : queryTokens) {
            if (lowerChunkText.find(qt) != std::string::npos) {
                exactMatchCount++;
            }
        }
        double keywordBonus = (exactMatchCount > 0) ? (0.2 * exactMatchCount / queryTokens.size()) : 0.0;

        double rawScore = cosineSim * 70.0 + keywordBonus * 30.0 + 5.0; // Base score
        rawScores[i] = rawScore;
        if (rawScore > maxScore) maxScore = rawScore;
    }

    // Normalize scores to scale [10.0, 98.0]
    for (size_t i = 0; i < chunks.size(); ++i) {
        if (maxScore > 0) {
            chunks[i].relevanceScore = std::min(99.0, std::max(10.0, (rawScores[i] / maxScore) * 95.0));
        } else {
            chunks[i].relevanceScore = 20.0;
        }
    }
}

double RelevanceScorer::calculatePairwiseSimilarity(const Chunk& c1, const Chunk& c2) {
    if (c1.id == c2.id) return 1.0;

    std::unordered_set<std::string> set1(c1.topics.begin(), c1.topics.end());
    std::unordered_set<std::string> set2(c2.topics.begin(), c2.topics.end());

    if (set1.empty() || set2.empty()) return 0.1;

    int intersection = 0;
    for (const auto& t : set1) {
        if (set2.count(t)) intersection++;
    }
    int unionSize = set1.size() + set2.size() - intersection;
    if (unionSize == 0) return 0.0;

    return static_cast<double>(intersection) / unionSize;
}

double RelevanceScorer::calculateAverageSimilarity(const std::vector<Chunk>& selectedChunks) {
    if (selectedChunks.size() <= 1) return 0.0;

    double totalSim = 0.0;
    int pairs = 0;
    for (size_t i = 0; i < selectedChunks.size(); ++i) {
        for (size_t j = i + 1; j < selectedChunks.size(); ++j) {
            totalSim += calculatePairwiseSimilarity(selectedChunks[i], selectedChunks[j]);
            pairs++;
        }
    }
    return (pairs > 0) ? (totalSim / pairs) : 0.0;
}

double RelevanceScorer::calculateTopicCoverage(const std::vector<Chunk>& selectedChunks,
                                                 const std::vector<Chunk>& allChunks) {
    std::unordered_set<std::string> allTopics;
    for (const auto& c : allChunks) {
        for (const auto& t : c.topics) allTopics.insert(t);
    }
    if (allTopics.empty()) return 100.0;

    std::unordered_set<std::string> selectedTopics;
    for (const auto& c : selectedChunks) {
        for (const auto& t : c.topics) selectedTopics.insert(t);
    }

    return (static_cast<double>(selectedTopics.size()) / allTopics.size()) * 100.0;
}

} // namespace llm_opt
