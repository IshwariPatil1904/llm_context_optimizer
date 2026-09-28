#ifndef SUBMODULAR_OPTIMIZER_HPP
#define SUBMODULAR_OPTIMIZER_HPP

#include "Types.hpp"
#include <vector>

namespace llm_opt {

class SubmodularOptimizer {
public:
    SubmodularOptimizer() = default;

    // Runs Submodular Lazy Greedy Maximization with diversity & redundancy metrics
    OptimizationResult optimize(const std::vector<Chunk>& chunks,
                                const OptimizationParams& params);

private:
    double computeSubmodularValue(const std::vector<Chunk>& selected,
                                 const OptimizationParams& params,
                                 const std::vector<Chunk>& allChunks);
};

} // namespace llm_opt

#endif // SUBMODULAR_OPTIMIZER_HPP
