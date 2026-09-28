cmake_minimum_required(VERSION 3.14)
project(LLMContextOptimizer VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

set(CORE_SOURCES
    src/DocumentProcessor.cpp
    src/RelevanceScorer.cpp
    src/GreedyOptimizer.cpp
    src/DynamicProgramming.cpp
    src/ApproximationOptimizer.cpp
    src/RandomizedOptimizer.cpp
    src/SubmodularOptimizer.cpp
    src/Benchmark.cpp
)

# Main REST Server executable
add_executable(llm_context_optimizer_server src/main.cpp ${CORE_SOURCES})

# Test executable
add_executable(llm_context_optimizer_test tests/test_main.cpp ${CORE_SOURCES})

if(WIN32)
    target_link_libraries(llm_context_optimizer_server PRIVATE ws2_32)
    target_link_libraries(llm_context_optimizer_test PRIVATE ws2_32)
    target_compile_options(llm_context_optimizer_server PRIVATE -Wno-narrowing)
    target_compile_options(llm_context_optimizer_test PRIVATE -Wno-narrowing)
else()
    find_package(Threads REQUIRED)
    target_link_libraries(llm_context_optimizer_server PRIVATE Threads::Threads)
    target_link_libraries(llm_context_optimizer_test PRIVATE Threads::Threads)
endif()
