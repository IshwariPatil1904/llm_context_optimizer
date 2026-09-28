#ifndef RANDOMIZED_OPTIMIZER_HPP
#define RANDOMIZED_OPTIMIZER_HPP

#include "Types.hpp"
#include <vector>

namespace llm_opt {

class RandomizedOptimizer {
public:
    RandomizedOptimizer() = default;

    // Runs Genetic Algorithm / Randomized Search optimizer
    OptimizationResult optimize(const std::vector<Chunk>& chunks,
                                const OptimizationParams& params);
};

} // namespace llm_opt

#endif // RANDOMIZED_OPTIMIZER_HPP
