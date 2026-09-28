#include "DocumentProcessor.hpp"
#include <sstream>
#include <algorithm>
#include <cctype>
#include <unordered_set>
#include <cmath>

namespace llm_opt {

int DocumentProcessor::estimateTokenCount(const std::string& text) {
    if (text.empty()) return 0;

    int wordCount = 0;
    bool inWord = false;
    for (char c : text) {
        if (std::isspace(static_cast<unsigned char>(c))) {
            inWord = false;
        } else {
            if (!inWord) {
                wordCount++;
                inWord = true;
            }
        }
    }
    // Context-cost metric based on word count
    return std::max(1, wordCount);
}

std::vector<std::string> DocumentProcessor::extractTopics(const std::string& text) {
    std::unordered_set<std::string> stopWords = {
        "the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "to", "of",
        "in", "on", "for", "with", "by", "at", "from", "as", "that", "this", "it", "be"
    };

    std::vector<std::string> topics;
    std::unordered_set<std::string> seen;
    std::string word;
    std::istringstream stream(text);

    while (stream >> word) {
        std::string cleaned;
        for (char c : word) {
            if (std::isalnum(static_cast<unsigned char>(c))) {
                cleaned += std::tolower(static_cast<unsigned char>(c));
            }
        }
        if (cleaned.length() >= 4 && stopWords.find(cleaned) == stopWords.end()) {
            if (seen.find(cleaned) == seen.end()) {
                seen.insert(cleaned);
                topics.push_back(cleaned);
                if (topics.size() >= 5) break;
            }
        }
    }
    if (topics.empty()) {
        topics.push_back("general");
    }
    return topics;
}

Document DocumentProcessor::processDocument(const std::string& id,
                                           const std::string& title,
                                           const std::string& category,
                                           const std::string& content,
                                           int targetTokenSize) {
    Document doc;
    doc.id = id;
    doc.title = title;
    doc.category = category;
    doc.content = content;

    // Clean excessive blank lines and normalize whitespace
    std::string cleanedContent;
    std::istringstream rawStream(content);
    std::string line;
    bool prevEmpty = false;

    while (std::getline(rawStream, line)) {
        // Trim line
        size_t start = line.find_first_not_of(" \t\r\n");
        if (start == std::string::npos) {
            if (!prevEmpty && !cleanedContent.empty()) {
                cleanedContent += "\n";
                prevEmpty = true;
            }
        } else {
            size_t end = line.find_last_not_of(" \t\r\n");
            std::string trimmed = line.substr(start, end - start + 1);
            if (!cleanedContent.empty()) cleanedContent += "\n";
            cleanedContent += trimmed;
            prevEmpty = false;
        }
    }

    doc.totalWords = estimateTokenCount(cleanedContent);
    doc.totalTokens = doc.totalWords;

    // Split text into chunks by word boundaries (approx 100 - 150 words per chunk default)
    std::istringstream wordStream(cleanedContent);
    std::string word;
    std::vector<std::string> words;
    while (wordStream >> word) {
        words.push_back(word);
    }

    if (words.empty() && !cleanedContent.empty()) {
        words.push_back(cleanedContent);
    }

    int pos = 1;
    size_t i = 0;
    int chunkSize = (targetTokenSize > 0) ? targetTokenSize : 120;

    while (i < words.size()) {
        std::string chunkText;
        int wordCountInChunk = 0;

        while (i < words.size() && wordCountInChunk < chunkSize) {
            if (!chunkText.empty()) chunkText += " ";
            chunkText += words[i];
            wordCountInChunk++;
            i++;
        }

        if (!chunkText.empty()) {
            std::string chunkId = id + "-c" + std::to_string(pos);
            auto topics = extractTopics(chunkText);
            doc.chunks.emplace_back(chunkId, id, pos, chunkText, wordCountInChunk, 0.0, topics);
            pos++;
        }
    }

    return doc;
}

std::vector<Document> DocumentProcessor::createSampleDataset() {
    std::vector<Document> dataset;

    std::string docDBMSContent = 
        "Database Normalization is the process of structuring a relational database in accordance with a series of normal forms to reduce data redundancy and improve data integrity.\n\n"
        "First Normal Form (1NF) requires that the domain of each attribute must contain only atomic (indivisible) values, and the value of each attribute is a single value from that domain. It eliminates repeating groups of columns.\n\n"
        "Second Normal Form (2NF) builds upon 1NF and requires that all non-key attributes are fully functionally dependent on the primary key. If a table has a composite primary key, no non-key attribute can depend on only a subset of the primary key columns, eliminating partial dependencies.\n\n"
        "Third Normal Form (3NF) requires that the table is in 2NF and that all non-key attributes are non-transitively dependent on the primary key. That is, no non-key attribute should depend on another non-key attribute (X -> Y and Y -> Z is forbidden).\n\n"
        "Boyce-Codd Normal Form (BCNF) is a stricter version of 3NF where for every non-trivial functional dependency X -> Y, X must be a superkey. BCNF resolves anomalies caused by overlapping candidate keys.\n\n"
        "Fourth Normal Form (4NF) handles multi-valued dependencies, ensuring that independent multi-valued facts are not stored in a single relation. Fifth Normal Form (5NF) deals with join dependencies.\n\n"
        "In LLM retrieval-augmented generation, normalizing relational knowledge structures helps split complex database queries into clear, modular text chunks for prompt synthesis.";

    std::string docDAAContent = 
        "Dynamic Programming (DP) and Greedy Algorithms are foundational concepts in Design and Analysis of Algorithms (DAA).\n\n"
        "The 0-1 Knapsack problem demonstrates optimal substructure: an optimal solution contains optimal sub-solutions to subproblems. The recurrence DP state is dp[i][w] = max(dp[i-1][w], dp[i-1][w-w_i] + v_i).\n\n"
        "The Greedy choice property states that a globally optimal solution can be arrived at by making locally optimal (greedy) choices. For fractional knapsack, greedy by ratio v_i / w_i is optimal. For 0-1 knapsack, greedy provides an O(n log n) baseline.\n\n"
        "FPTAS (Fully Polynomial Time Approximation Scheme) scales item values by factor K = epsilon * v_max / n, giving a 1 - epsilon approximation bound in polynomial time.\n\n"
        "Submodular Set Function Maximization models diminishing marginal returns: f(A U {e}) - f(A) >= f(B U {e}) - f(B) for A subset B. Lazy greedy search achieves a 1 - 1/e (~63.2%) approximation ratio.";

    dataset.push_back(processDocument("doc-dbms", "Database Normalization & Normal Forms (1NF, 2NF, 3NF, BCNF)", "Database Systems", docDBMSContent, 60));
    dataset.push_back(processDocument("doc-daa", "DAA Knapsack & Submodular Optimization Theory", "Algorithmic Analysis", docDAAContent, 65));

    return dataset;
}

} // namespace llm_opt
