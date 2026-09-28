#ifndef GREEDY_OPTIMIZER_HPP
#define GREEDY_OPTIMIZER_HPP

#include "Types.hpp"
#include <vector>

namespace llm_opt {

class GreedyOptimizer {
public:
    GreedyOptimizer() = default;

    // Runs density greedy ratio optimization (relevance / tokenCost)
    OptimizationResult optimize(const std::vector<Chunk>& chunks,
                                const OptimizationParams& params);
};

} // namespace llm_opt

#endif // GREEDY_OPTIMIZER_HPP
