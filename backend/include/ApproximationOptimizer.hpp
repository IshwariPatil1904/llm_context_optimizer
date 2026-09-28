#ifndef APPROXIMATION_OPTIMIZER_HPP
#define APPROXIMATION_OPTIMIZER_HPP

#include "Types.hpp"
#include <vector>

namespace llm_opt {

class ApproximationOptimizer {
public:
    ApproximationOptimizer() = default;

    // Runs FPTAS / Modified Greedy 2-Approximation algorithm for Knapsack
    OptimizationResult optimize(const std::vector<Chunk>& chunks,
                                const OptimizationParams& params);
};

} // namespace llm_opt

#endif // APPROXIMATION_OPTIMIZER_HPP
