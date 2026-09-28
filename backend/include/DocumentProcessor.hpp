#ifndef DOCUMENT_PROCESSOR_HPP
#define DOCUMENT_PROCESSOR_HPP

#include "Types.hpp"
#include <string>
#include <vector>

namespace llm_opt {

class DocumentProcessor {
public:
    DocumentProcessor() = default;

    // Estimate token count for a piece of text (roughly 4 characters per token average)
    static int estimateTokenCount(const std::string& text);

    // Process raw document text into structured chunks of approx targetTokenSize
    Document processDocument(const std::string& id,
                             const std::string& title,
                             const std::string& category,
                             const std::string& content,
                             int targetTokenSize = 150);

    // Extract key topics/keywords from text chunk
    static std::vector<std::string> extractTopics(const std::string& text);

    // Create a curated sample dataset of documents and chunks
    std::vector<Document> createSampleDataset();
};

} // namespace llm_opt

#endif // DOCUMENT_PROCESSOR_HPP
