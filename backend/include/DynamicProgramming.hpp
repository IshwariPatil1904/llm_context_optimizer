#ifndef DYNAMIC_PROGRAMMING_HPP
#define DYNAMIC_PROGRAMMING_HPP

#include "Types.hpp"
#include <vector>

namespace llm_opt {

class DynamicProgramming {
public:
    DynamicProgramming() = default;

    // Runs exact 0-1 Knapsack Dynamic Programming optimizer
    OptimizationResult optimize(const std::vector<Chunk>& chunks,
                                const OptimizationParams& params);
};

} // namespace llm_opt

#endif // DYNAMIC_PROGRAMMING_HPP
