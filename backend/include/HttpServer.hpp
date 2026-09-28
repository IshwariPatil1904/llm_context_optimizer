#ifndef HTTP_SERVER_HPP
#define HTTP_SERVER_HPP

#include "Types.hpp"
#include "DocumentProcessor.hpp"
#include "RelevanceScorer.hpp"
#include "GreedyOptimizer.hpp"
#include "DynamicProgramming.hpp"
#include "ApproximationOptimizer.hpp"
#include "RandomizedOptimizer.hpp"
#include "SubmodularOptimizer.hpp"
#include "Benchmark.hpp"
#include "JsonHelper.hpp"

#include <string>
#include <vector>
#include <iostream>
#include <fstream>
#include <sstream>
#include <atomic>
#include <chrono>

#ifdef _WIN32
  #include <winsock2.h>
  #include <ws2tcpip.h>
  #pragma comment(lib, "ws2_32.lib")
  typedef SOCKET SocketType;
  #define IS_VALIDSOCKET(s) ((s) != INVALID_SOCKET)
  #define CLOSESOCKET(s) closesocket(s)
#else
  #include <sys/socket.h>
  #include <netinet/in.h>
  #include <unistd.h>
  typedef int SocketType;
  #define IS_VALIDSOCKET(s) ((s) >= 0)
  #define CLOSESOCKET(s) close(s)
#endif

namespace llm_opt {

class HttpServer {
public:
    HttpServer(int port = 8080) : port_(port), running_(false) {
        DocumentProcessor proc;
        documents_ = proc.createSampleDataset();
        flattenChunks();
    }

    ~HttpServer() {
        stop();
    }

    bool init() {
#ifdef _WIN32
        WSADATA wsaData;
        if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
            std::cerr << "[C++ HttpServer] Failed to initialize Winsock.\n";
            return false;
        }
#endif

        serverSocket_ = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (!IS_VALIDSOCKET(serverSocket_)) {
            std::cerr << "[C++ HttpServer] Socket creation failed.\n";
            return false;
        }

        int opt = 1;
#ifdef _WIN32
        setsockopt(serverSocket_, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt));
#else
        setsockopt(serverSocket_, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
#endif

        sockaddr_in address{};
        address.sin_family = AF_INET;
        address.sin_addr.s_addr = INADDR_ANY;
        address.sin_port = htons(port_);

        if (bind(serverSocket_, (struct sockaddr*)&address, sizeof(address)) < 0) {
            std::cerr << "[C++ HttpServer] Bind failed on port " << port_ << ".\n";
            CLOSESOCKET(serverSocket_);
            return false;
        }

        if (listen(serverSocket_, 10) < 0) {
            std::cerr << "[C++ HttpServer] Listen failed.\n";
            CLOSESOCKET(serverSocket_);
            return false;
        }

        running_ = true;
        std::cout << "\n======================================================\n";
        std::cout << " [C++ Backend] REST API Server running at http://127.0.0.1:" << port_ << "\n";
        std::cout << "======================================================\n\n";

        return true;
    }

    void serveOnce(int timeoutMs = 200) {
        if (!running_) return;

        fd_set readfds;
        FD_ZERO(&readfds);
        FD_SET(serverSocket_, &readfds);

        timeval tv;
        tv.tv_sec = timeoutMs / 1000;
        tv.tv_usec = (timeoutMs % 1000) * 1000;

        int selectRes = select(static_cast<int>(serverSocket_) + 1, &readfds, NULL, NULL, &tv);
        if (selectRes > 0 && FD_ISSET(serverSocket_, &readfds)) {
            sockaddr_in clientAddr{};
            socklen_t clientLen = sizeof(clientAddr);
            SocketType clientSocket = accept(serverSocket_, (struct sockaddr*)&clientAddr, &clientLen);
            if (IS_VALIDSOCKET(clientSocket)) {
                handleClient(clientSocket);
            }
        }
    }

    void run() {
        while (running_) {
            serveOnce(500);
        }
    }

    void stop() {
        if (running_) {
            running_ = false;
            CLOSESOCKET(serverSocket_);
#ifdef _WIN32
            WSACleanup();
#endif
        }
    }

private:
    int port_;
    SocketType serverSocket_;
    bool running_;
    std::vector<Document> documents_;
    std::vector<Chunk> allChunks_;

    void flattenChunks() {
        allChunks_.clear();
        for (const auto& doc : documents_) {
            for (const auto& c : doc.chunks) {
                allChunks_.push_back(c);
            }
        }
    }

    void sendResponse(SocketType clientSocket, int statusCode, const std::string& contentType, const std::string& body) {
        std::ostringstream response;
        response << "HTTP/1.1 " << statusCode << " OK\r\n";
        response << "Content-Type: " << contentType << "\r\n";
        response << "Content-Length: " << body.length() << "\r\n";
        response << "Access-Control-Allow-Origin: *\r\n";
        response << "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n";
        response << "Access-Control-Allow-Headers: Content-Type\r\n";
        response << "Connection: close\r\n\r\n";
        response << body;

        std::string resStr = response.str();
        send(clientSocket, resStr.c_str(), static_cast<int>(resStr.length()), 0);
        CLOSESOCKET(clientSocket);
    }

    void handleClient(SocketType clientSocket) {
        char buffer[16384];
        int bytesRead = recv(clientSocket, buffer, sizeof(buffer) - 1, 0);
        if (bytesRead <= 0) {
            CLOSESOCKET(clientSocket);
            return;
        }
        buffer[bytesRead] = '\0';
        std::string req(buffer);

        std::istringstream reqStream(req);
        std::string method, path, protocol;
        reqStream >> method >> path >> protocol;

        // Handle CORS Preflight OPTIONS
        if (method == "OPTIONS") {
            sendResponse(clientSocket, 200, "text/plain", "OK");
            return;
        }

        // Parse Request Body if present
        std::string body = "";
        size_t bodyPos = req.find("\r\n\r\n");
        if (bodyPos != std::string::npos) {
            body = req.substr(bodyPos + 4);
        }

        if (path == "/api/health") {
            std::string resJson = "{\"status\":\"ok\",\"backend\":\"C++20 LLM Context Optimizer Core\",\"version\":\"1.0.0\"}";
            sendResponse(clientSocket, 200, "application/json", resJson);
        }
        else if (path == "/api/documents" && method == "GET") {
            std::ostringstream ss;
            ss << "{\"documents\":[";
            for (size_t i = 0; i < documents_.size(); ++i) {
                ss << JsonHelper::documentToJson(documents_[i]);
                if (i + 1 < documents_.size()) ss << ",";
            }
            ss << "],\"totalChunks\":" << allChunks_.size() << "}";
            sendResponse(clientSocket, 200, "application/json", ss.str());
        }
        else if (path == "/api/documents/process" && method == "POST") {
            std::string title = JsonHelper::extractString(body, "title", "Custom Document");
            std::string category = JsonHelper::extractString(body, "category", "User Input");
            std::string content = JsonHelper::extractString(body, "content", "");
            int chunkSize = JsonHelper::extractInt(body, "chunkSize", 150);

            if (content.empty()) {
                sendResponse(clientSocket, 400, "application/json", "{\"error\":\"Content cannot be empty\"}");
                return;
            }

            DocumentProcessor proc;
            std::string newId = "doc-" + std::to_string(documents_.size() + 1);
            Document newDoc = proc.processDocument(newId, title, category, content, chunkSize);
            documents_.push_back(newDoc);
            flattenChunks();

            sendResponse(clientSocket, 200, "application/json", JsonHelper::documentToJson(newDoc));
        }
        else if (path == "/api/optimize" && method == "POST") {
            std::string query = JsonHelper::extractString(body, "question", "");
            if (query.empty()) query = JsonHelper::extractString(body, "query", "knapsack submodular optimization context");

            std::string algo = JsonHelper::extractString(body, "algorithm", "greedy");
            int budget = JsonHelper::extractInt(body, "budget", 0);
            if (budget <= 0) budget = JsonHelper::extractInt(body, "tokenBudget", 500);

            OptimizationParams params;
            params.tokenBudget = budget;
            params.lambdaDiversity = JsonHelper::extractDouble(body, "lambdaDiversity", 0.3);
            params.redundancyPenalty = JsonHelper::extractDouble(body, "redundancyPenalty", 0.5);

            auto currentChunks = allChunks_;
            RelevanceScorer scorer;
            scorer.scoreChunks(query, currentChunks);

            OptimizationResult result;
            if (algo == "greedy" || algo == "Greedy") {
                GreedyOptimizer opt;
                result = opt.optimize(currentChunks, params);
            } else if (algo == "dp" || algo == "Dynamic Programming") {
                DynamicProgramming opt;
                result = opt.optimize(currentChunks, params);
            } else if (algo == "approx" || algo == "Approximation") {
                ApproximationOptimizer opt;
                result = opt.optimize(currentChunks, params);
            } else if (algo == "randomized" || algo == "Randomized") {
                RandomizedOptimizer opt;
                result = opt.optimize(currentChunks, params);
            } else if (algo == "submodular" || algo == "Submodular Greedy" || algo == "Submodular") {
                SubmodularOptimizer opt;
                result = opt.optimize(currentChunks, params);
            } else {
                GreedyOptimizer opt;
                result = opt.optimize(currentChunks, params);
            }

            sendResponse(clientSocket, 200, "application/json", JsonHelper::resultToJson(result, budget));
        }
        else if ((path == "/api/compare" || path == "/api/optimize/compare") && method == "POST") {
            std::string query = JsonHelper::extractString(body, "question", "");
            if (query.empty()) query = JsonHelper::extractString(body, "query", "knapsack submodular optimization context");

            int budget = JsonHelper::extractInt(body, "budget", 0);
            if (budget <= 0) budget = JsonHelper::extractInt(body, "tokenBudget", 500);

            OptimizationParams params;
            params.tokenBudget = budget;

            auto currentChunks = allChunks_;
            RelevanceScorer scorer;
            scorer.scoreChunks(query, currentChunks);

            int totalAvailableTokens = 0;
            for (const auto& c : currentChunks) {
                totalAvailableTokens += c.tokenCost;
            }

            GreedyOptimizer greedy;
            DynamicProgramming dp;
            ApproximationOptimizer approx;
            RandomizedOptimizer randOpt;
            SubmodularOptimizer submod;

            std::ostringstream ss;
            ss << "{";
            ss << "\"totalChunks\":" << currentChunks.size() << ",";
            ss << "\"tokenBudget\":" << budget << ",";
            ss << "\"question\":\"" << JsonHelper::escapeString(query) << "\",";
            ss << "\"totalAvailableTokens\":" << totalAvailableTokens << ",";
            ss << "\"results\":[";
            ss << JsonHelper::resultToJson(greedy.optimize(currentChunks, params), budget) << ",";
            ss << JsonHelper::resultToJson(dp.optimize(currentChunks, params), budget) << ",";
            ss << JsonHelper::resultToJson(approx.optimize(currentChunks, params), budget) << ",";
            ss << JsonHelper::resultToJson(randOpt.optimize(currentChunks, params), budget) << ",";
            ss << JsonHelper::resultToJson(submod.optimize(currentChunks, params), budget);
            ss << "]}";

            sendResponse(clientSocket, 200, "application/json", ss.str());
        }
        else if ((path == "/api/benchmark" || path == "/api/benchmark/run") && method == "POST") {
            std::string query = JsonHelper::extractString(body, "question", "");
            if (query.empty()) query = JsonHelper::extractString(body, "query", "database normalization indexing transaction join optimization");

            int budget = JsonHelper::extractInt(body, "budget", 0);
            if (budget <= 0) budget = JsonHelper::extractInt(body, "tokenBudget", 350);

            int targetSize = JsonHelper::extractInt(body, "datasetSize", 0);
            std::vector<int> sizes = {10, 25, 50, 100, 250, 500};
            if (targetSize > 0) {
                sizes = {targetSize};
            }

            Benchmark bench;
            auto records = bench.runScalingBenchmark(query, budget, sizes, "results/benchmark.csv");

            // Build JSON response with scaling records
            std::ostringstream ss;
            ss << "{";
            ss << "\"query\":\"" << JsonHelper::escapeString(query) << "\",";
            ss << "\"tokenBudget\":" << budget << ",";
            ss << "\"csvSaved\":true,";
            ss << "\"csvPath\":\"results/benchmark.csv\",";
            ss << "\"records\":[";
            for (size_t i = 0; i < records.size(); ++i) {
                const auto& r = records[i];
                ss << "{";
                ss << "\"datasetSize\":" << r.datasetSize << ",";
                ss << "\"algorithmName\":\"" << JsonHelper::escapeString(r.algorithmName) << "\",";
                ss << "\"executionTimeMs\":" << std::fixed << std::setprecision(4) << r.executionTimeMs << ",";
                ss << "\"selectedChunksCount\":" << r.selectedChunksCount << ",";
                ss << "\"totalTokens\":" << r.totalTokens << ",";
                ss << "\"totalRelevance\":" << std::fixed << std::setprecision(2) << r.totalRelevance << ",";
                ss << "\"averageSimilarity\":" << std::fixed << std::setprecision(4) << r.averageSimilarity << ",";
                ss << "\"topicCoverage\":" << std::fixed << std::setprecision(2) << r.topicCoverage << ",";
                ss << "\"tokenBudget\":" << r.tokenBudget;
                ss << "}";
                if (i + 1 < records.size()) ss << ",";
            }
            ss << "]}";

            sendResponse(clientSocket, 200, "application/json", ss.str());
        }
        else if (path == "/api/benchmark/csv" && method == "GET") {
            std::ifstream file("results/benchmark.csv");
            if (!file.is_open()) {
                sendResponse(clientSocket, 404, "text/plain", "CSV file not found");
                return;
            }
            std::ostringstream ss;
            ss << file.rdbuf();
            sendResponse(clientSocket, 200, "text/csv", ss.str());
        }
        else {
            sendResponse(clientSocket, 404, "application/json", "{\"error\":\"Endpoint not found\"}");
        }
    }
};

} // namespace llm_opt

#endif // HTTP_SERVER_HPP
