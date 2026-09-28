#ifndef JSON_HELPER_HPP
#define JSON_HELPER_HPP

#include "Types.hpp"
#include <string>
#include <sstream>
#include <vector>
#include <map>
#include <iomanip>
#include <iostream>

namespace llm_opt {

class JsonHelper {
public:
    static std::string escapeString(const std::string& input) {
        std::ostringstream ss;
        for (char c : input) {
            switch (c) {
                case '"': ss << "\\\""; break;
                case '\\': ss << "\\\\"; break;
                case '\b': ss << "\\b"; break;
                case '\f': ss << "\\f"; break;
                case '\n': ss << "\\n"; break;
                case '\r': ss << "\\r"; break;
                case '\t': ss << "\\t"; break;
                default:
                    if ('\x00' <= c && c <= '\x1f') {
                        ss << "\\u" << std::hex << std::setw(4) << std::setfill('0') << static_cast<int>(c);
                    } else {
                        ss << c;
                    }
            }
        }
        return ss.str();
    }

    static std::string chunkToJson(const Chunk& chunk) {
        std::ostringstream ss;
        ss << "{";
        ss << "\"id\":\"" << escapeString(chunk.id) << "\",";
        ss << "\"documentId\":\"" << escapeString(chunk.documentId) << "\",";
        ss << "\"position\":" << chunk.position << ",";
        ss << "\"text\":\"" << escapeString(chunk.text) << "\",";
        ss << "\"tokenCost\":" << chunk.tokenCost << ",";
        ss << "\"relevanceScore\":" << std::fixed << std::setprecision(2) << chunk.relevanceScore << ",";
        ss << "\"topics\":[";
        for (size_t i = 0; i < chunk.topics.size(); ++i) {
            ss << "\"" << escapeString(chunk.topics[i]) << "\"";
            if (i + 1 < chunk.topics.size()) ss << ",";
        }
        ss << "]}";
        return ss.str();
    }

    static std::string documentToJson(const Document& doc) {
        std::ostringstream ss;
        ss << "{";
        ss << "\"id\":\"" << escapeString(doc.id) << "\",";
        ss << "\"title\":\"" << escapeString(doc.title) << "\",";
        ss << "\"category\":\"" << escapeString(doc.category) << "\",";
        ss << "\"totalWords\":" << doc.totalWords << ",";
        ss << "\"totalTokens\":" << doc.totalTokens << ",";
        ss << "\"chunkCount\":" << doc.chunks.size() << ",";
        ss << "\"chunks\":[";
        for (size_t i = 0; i < doc.chunks.size(); ++i) {
            ss << chunkToJson(doc.chunks[i]);
            if (i + 1 < doc.chunks.size()) ss << ",";
        }
        ss << "]}";
        return ss.str();
    }

    static std::string resultToJson(const OptimizationResult& res, int tokenBudget = 0) {
        std::ostringstream ss;
        double util = (tokenBudget > 0) ? (static_cast<double>(res.totalTokens) / tokenBudget * 100.0) : 0.0;

        ss << "{";
        ss << "\"algorithm\":\"" << escapeString(res.algorithmName) << "\",";
        ss << "\"algorithmName\":\"" << escapeString(res.algorithmName) << "\",";
        ss << "\"selectedChunkIds\":[";
        for (size_t i = 0; i < res.selectedChunkIds.size(); ++i) {
            ss << "\"" << escapeString(res.selectedChunkIds[i]) << "\"";
            if (i + 1 < res.selectedChunkIds.size()) ss << ",";
        }
        ss << "],";
        ss << "\"selectedChunkCount\":" << res.selectedChunkIds.size() << ",";
        ss << "\"totalTokens\":" << res.totalTokens << ",";
        ss << "\"tokenUtilization\":" << std::fixed << std::setprecision(2) << util << ",";
        ss << "\"totalRelevance\":" << std::fixed << std::setprecision(2) << res.totalRelevance << ",";
        ss << "\"executionTime\":" << std::fixed << std::setprecision(3) << res.executionTimeMs << ",";
        ss << "\"executionTimeMs\":" << std::fixed << std::setprecision(3) << res.executionTimeMs << ",";
        ss << "\"topicCoverage\":" << std::fixed << std::setprecision(2) << res.topicCoverage << ",";
        ss << "\"averageSimilarity\":" << std::fixed << std::setprecision(4) << res.averageSimilarity << ",";
        ss << "\"optimizedContext\":\"" << escapeString(res.optimizedContext) << "\"";
        ss << "}";
        return ss.str();
    }

    static std::string benchmarkResultToJson(const BenchmarkSuiteResult& bench) {
        std::ostringstream ss;
        ss << "{";
        ss << "\"chunkCount\":" << bench.chunkCount << ",";
        ss << "\"tokenBudget\":" << bench.tokenBudget << ",";
        ss << "\"query\":\"" << escapeString(bench.query) << "\",";
        ss << "\"bestQualityAlgorithm\":\"" << escapeString(bench.bestQualityAlgorithm) << "\",";
        ss << "\"fastestAlgorithm\":\"" << escapeString(bench.fastestAlgorithm) << "\",";
        ss << "\"bestBalancedAlgorithm\":\"" << escapeString(bench.bestBalancedAlgorithm) << "\",";
        ss << "\"entries\":[";
        for (size_t i = 0; i < bench.entries.size(); ++i) {
            const auto& e = bench.entries[i];
            ss << "{";
            ss << "\"algorithmName\":\"" << escapeString(e.algorithmName) << "\",";
            ss << "\"executionTimeMs\":" << std::fixed << std::setprecision(3) << e.executionTimeMs << ",";
            ss << "\"totalTokens\":" << e.totalTokens << ",";
            ss << "\"totalRelevance\":" << std::fixed << std::setprecision(2) << e.totalRelevance << ",";
            ss << "\"topicCoverage\":" << std::fixed << std::setprecision(2) << e.topicCoverage << ",";
            ss << "\"efficiencyIndex\":" << std::fixed << std::setprecision(2) << e.efficiencyIndex << ",";
            ss << "\"tokenUtilization\":" << std::fixed << std::setprecision(2) << e.tokenUtilization << ",";
            ss << "\"isOptimal\":" << (e.isOptimal ? "true" : "false");
            ss << "}";
            if (i + 1 < bench.entries.size()) ss << ",";
        }
        ss << "]}";
        return ss.str();
    }

    static std::string extractString(const std::string& json, const std::string& key, const std::string& defaultVal = "") {
        std::string pattern = "\"" + key + "\"";
        size_t pos = json.find(pattern);
        if (pos == std::string::npos) return defaultVal;

        size_t colon = json.find(':', pos);
        if (colon == std::string::npos) return defaultVal;

        size_t startQuote = json.find('"', colon);
        if (startQuote == std::string::npos) return defaultVal;

        size_t endQuote = startQuote + 1;
        while (endQuote < json.length()) {
            if (json[endQuote] == '"' && json[endQuote - 1] != '\\') break;
            endQuote++;
        }
        if (endQuote >= json.length()) return defaultVal;
        return json.substr(startQuote + 1, endQuote - startQuote - 1);
    }

    static int extractInt(const std::string& json, const std::string& key, int defaultVal = 0) {
        std::string pattern = "\"" + key + "\"";
        size_t pos = json.find(pattern);
        if (pos == std::string::npos) return defaultVal;

        size_t colon = json.find(':', pos);
        if (colon == std::string::npos) return defaultVal;

        size_t start = colon + 1;
        while (start < json.length() && (json[start] == ' ' || json[start] == '\t' || json[start] == '\n' || json[start] == '\r')) {
            start++;
        }

        try {
            return std::stoi(json.substr(start));
        } catch (...) {
            return defaultVal;
        }
    }

    static double extractDouble(const std::string& json, const std::string& key, double defaultVal = 0.0) {
        std::string pattern = "\"" + key + "\"";
        size_t pos = json.find(pattern);
        if (pos == std::string::npos) return defaultVal;

        size_t colon = json.find(':', pos);
        if (colon == std::string::npos) return defaultVal;

        size_t start = colon + 1;
        while (start < json.length() && (json[start] == ' ' || json[start] == '\t' || json[start] == '\n' || json[start] == '\r')) {
            start++;
        }

        try {
            return std::stod(json.substr(start));
        } catch (...) {
            return defaultVal;
        }
    }
};

} // namespace llm_opt

#endif // JSON_HELPER_HPP
