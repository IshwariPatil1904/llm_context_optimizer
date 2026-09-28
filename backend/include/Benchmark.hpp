#ifndef BENCHMARK_HPP
#define BENCHMARK_HPP

#include "Types.hpp"
#include <vector>
#include <string>

namespace llm_opt {

class Benchmark {
public:
    Benchmark() = default;

    // Run single benchmark suite across all 5 optimizers on current chunks
    BenchmarkSuiteResult runSuite(const std::string& query,
                                   const std::vector<Chunk>& chunks,
                                   const OptimizationParams& params);

    // Generate deterministic technical synthetic dataset of specified chunk count (10, 25, 50, 100, 250, 500)
    static std::vector<Chunk> generateSyntheticDataset(int targetChunkCount);

    // Run scaling benchmark across multiple dataset sizes (e.g. 10, 25, 50, 100, 250, 500) and export CSV
    std::vector<BenchmarkRunRecord> runScalingBenchmark(const std::string& query,
                                                        int tokenBudget,
                                                        const std::vector<int>& datasetSizes = {10, 25, 50, 100, 250, 500},
                                                        const std::string& csvOutputPath = "results/benchmark.csv");

    // Write benchmark records to CSV file
    static void exportToCsv(const std::vector<BenchmarkRunRecord>& records,
                            const std::string& csvPath = "results/benchmark.csv");
};

} // namespace llm_opt

#endif // BENCHMARK_HPP
