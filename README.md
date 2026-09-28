# LLM Context Optimizer — C++20 Context Selection Engine & Platform

[![C++20](https://img.shields.io/badge/C%2B%2B-20-blue.svg)](https://isocpp.org/)
[![CMake](https://img.shields.io/badge/CMake-3.14%2B-green.svg)](https://cmake.org/)
[![React 18](https://img.shields.io/badge/React-18-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-purple.svg)](https://vitejs.dev/)

A high-performance full-stack optimization platform designed to solve the **Bounded Context Window Selection Problem** in Retrieval-Augmented Generation (RAG) and Large Language Model (LLM) applications. The core algorithm engine is implemented in **pure C++20 STL** for high speed and deterministic execution, paired with a modern React + Vite TypeScript web platform.

---

## ⚡ QUICK START

### Option A: One-Click Windows Launch (Recommended)
Double-click `run.bat` in the root folder, or execute in PowerShell:
```cmd
run.bat
```
*This automatically starts the C++ backend on port 8080 and the React frontend on port 5173.*

### Option B: Manual Two-Terminal Launch

**Terminal 1 (Backend Server):**
```bash
cd backend/build
cmake --build .
./llm_context_optimizer_server.exe 8080
```

**Terminal 2 (Frontend Platform):**
```bash
cd frontend
npm install
npm run dev
```

**Open in Browser:** **[http://localhost:5173/](http://localhost:5173/)**

#### Quick Workflow Steps:
1. Go to **Documents** (`/analyzer`) and click **"Load Sample DBMS Document"** (or upload your `.txt` file).
2. Go to **Workspace** (`/workspace`), enter a question, set a context budget (e.g. 350 tokens).
3. Select an optimization method (e.g., **Submodular Optimization** or **Dynamic Programming**) and click **"Optimize Context"**.
4. Go to **Analytics** (`/comparison`) to view side-by-side metric comparison charts.
5. Go to **Benchmarks** (`/benchmark`), click **"Run Scaling Benchmark"**, and click **"Export CSV"**.

---

## 📌 Problem Statement

Large Language Models (LLMs) have finite context window limits (token budget $W$). When retrieving documents from knowledge bases or vector databases, naive top-k retrieval returns raw chunks that frequently exceed $W$, incur high API costs, and suffer from **"lost-in-the-middle"** reasoning degradation.

The **LLM Context Optimizer** treats context selection as a constrained discrete optimization problem, filtering, ranking, and compressing retrieved document chunks to maximize total prompt relevance and topic coverage while strictly enforcing the token budget $W$.

---

## 🧮 Mathematical Formulation

Given a set of $n$ document chunks $C = \{c_1, c_2, \dots, c_n\}$ where each chunk $c_i$ has:
- A token cost $w_i \in \mathbb{Z}^+$ (word/token length)
- A relevance score $v_i \in [0, 100]$ (computed via TF-IDF cosine similarity against query $Q$)
- A topic keyword set $T(c_i)$

We seek an optimal subset $S \subseteq C$ that solves:

$$\max_{S \subseteq C} \quad \sum_{i \in S} v_i \;+\; \lambda \cdot |\bigcup_{i \in S} T(c_i)| \;-\; \gamma \sum_{i, j \in S, i \neq j} \text{Sim}(c_i, c_j)$$

$$\text{Subject to} \quad \sum_{i \in S} w_i \le W$$

---

## 🚀 C++ DAA Algorithmic Suite

| Algorithm Paradigm | Time Complexity | Space Complexity | Optimality / Theoretical Bound | Characteristics & Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Greedy Density Ratio** | $\mathcal{O}(n \log n)$ | $\mathcal{O}(n)$ | Heuristic Baseline | Sorts chunks by density ratio $v_i / w_i$; fast microsecond execution. |
| **0-1 Knapsack DP** | $\mathcal{O}(nB)$ | $\mathcal{O}(B)$ | Exact Global Optimal (100%) | Computes $dp[i][w] = \max(dp[i-1][w], dp[i-1][w-w_i] + v_i)$ with backtracking. |
| **FPTAS / 2-Approx** | $\mathcal{O}(n \log n)$ | $\mathcal{O}(n)$ | Provable 50% / $(1-\epsilon)$ Bound | Compares ratio greedy vs single max relevance item fitting in budget $W$. |
| **Randomized Genetic** | $\mathcal{O}(g \cdot p \cdot n)$ | $\mathcal{O}(p \cdot n)$ | Meta-Heuristic Search | Evolves binary bitmask chromosomes over 300 generations with budget penalty. |
| **Submodular Lazy Greedy** | $\mathcal{O}(n^2)$ | $\mathcal{O}(n)$ | $(1 - 1/e) \approx 63.2\%$ Bound | Maximizes submodular utility with diminishing returns & redundancy penalty. |

---

## 🏗️ Architecture & Folder Structure

```
LLM-Context-Optimizer/
│
├── backend/
│   ├── CMakeLists.txt          # CMake 3.14+ C++20 build configuration
│   ├── include/
│   │   ├── Types.hpp           # Core data structures (Chunk, Document, OptimizationResult)
│   │   ├── JsonHelper.hpp      # Header-only JSON serializer & parser
│   │   ├── DocumentProcessor.hpp# Text normalization & word-token chunking
│   │   ├── RelevanceScorer.hpp # Deterministic TF-IDF & Cosine Similarity
│   │   ├── GreedyOptimizer.hpp # O(n log n) Density Ratio Greedy
│   │   ├── DynamicProgramming.hpp # O(nB) 0-1 Knapsack DP
│   │   ├── ApproximationOptimizer.hpp # FPTAS & 2-Approximation
│   │   ├── RandomizedOptimizer.hpp # Genetic Algorithm Meta-Heuristic
│   │   ├── SubmodularOptimizer.hpp # Submodular Lazy Greedy Maximization
│   │   ├── Benchmark.hpp       # Benchmark runner & synthetic dataset generator
│   │   └── HttpServer.hpp      # Lightweight Winsock REST server on port 8080
│   ├── src/                    # C++ source implementations
│   ├── tests/                  # Core algorithm unit tests
│   └── data/                   # Sample document corpus
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── components/         # UI components (Sidebar, Topbar, StatCard, etc.)
│       ├── pages/              # 9 Platform Pages (Overview, Workspace, Documents, etc.)
│       ├── services/           # REST API client
│       ├── hooks/              # useOptimization React state management
│       ├── types/              # TypeScript interfaces
│       ├── App.tsx             # App container & tab routing
│       └── main.tsx            # React entrypoint
│
├── results/
│   └── benchmark.csv           # Exported scaling benchmark CSV
├── run.bat                     # Launches both backend & frontend on Windows
├── run-backend.bat             # Starts C++ REST server on port 8080
├── run-frontend.bat            # Starts React Vite server on port 5173
├── README.md
└── .gitignore
```

---

## 🌐 C++ REST API Endpoints

- `GET /api/health` — Returns status of C++ core engine.
- `GET /api/documents` — Returns loaded document corpus and chunk metrics.
- `POST /api/documents/process` — Ingests `.txt` content and splits into target word chunks.
- `POST /api/optimize` — Executes specified optimizer (`greedy`, `dp`, `approx`, `randomized`, `submodular`).
- `POST /api/optimize/compare` — Executes all 5 algorithms on identical chunks & budget for side-by-side comparative analysis.
- `POST /api/benchmark/run` — Runs scaling benchmark suite across dataset sizes (10, 25, 50, 100, 250, 500) and exports `results/benchmark.csv`.
- `GET /api/benchmark/csv` — Serves raw `results/benchmark.csv` file for frontend download.

---

## 🛠️ Detailed Build & Run Instructions

### Prerequisites
1. **C++ Compiler**: MinGW GCC 6.3+ or MSVC supporting C++17/C++20.
2. **CMake**: Version 3.14 or higher.
3. **Node.js**: Version 18+ and `npm`.

### 1. Build and Run C++ Backend
```bash
# Navigate to backend directory
cd backend

# Create build directory and configure CMake
cmake -B build -S .

# Compile executables
cmake --build build

# Run unit test suite
./build/llm_context_optimizer_test.exe

# Start C++ REST API server on port 8080
./build/llm_context_optimizer_server.exe 8080
```

### 2. Build and Run React Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```

---

## 📊 Benchmark & Synthetic Scaling Data

The C++ backend includes a synthetic technical document generator creating dataset sizes of **10, 25, 50, 100, 250, and 500 chunks** spanning database topics:
- Relational Normalization (1NF, 2NF, 3NF, BCNF, 4NF, 5NF)
- Functional Dependencies & Armstrong's Axioms
- Indexing (B-Trees, Hash Indexes, Clustered/Non-clustered)
- Transactions & Concurrency (ACID, WAL, 2PL, MVCC)
- Relational Joins (Hash Join, Nested Loop, Sort-Merge)

All benchmark runs log empirical latency (ms), token utilization, relevance, average similarity, and topic coverage directly to `results/benchmark.csv`.

---

## ❓ Troubleshooting

### 1. Backend Server Does Not Start
- **Cause:** Port 8080 is already occupied by another application.
- **Fix:** Terminate any process using port 8080 or pass a custom port (e.g. `./llm_context_optimizer_server.exe 8085`).

### 2. Frontend Shows "STANDBY" (Backend Offline)
- **Cause:** C++ REST server is not running on port 8080 or firewall is blocking `http://127.0.0.1:8080`.
- **Fix:** Ensure `llm_context_optimizer_server.exe` is running in a terminal.

### 3. CSV Export Does Not Download
- **Cause:** No benchmark records exist yet or browser popup blocker blocked the file download.
- **Fix:** Click **"Run Scaling Benchmark"** first on the **Benchmarks** (`/benchmark`) page, then click **"Export CSV"**. The platform includes a fallback in-memory CSV generator.

### 4. CMake Build Error
- **Cause:** Missing C++20 compiler or CMake not in `PATH`.
- **Fix:** Verify CMake installation (`cmake --version`) and MinGW/MSVC compiler path.

---

## 📜 License

MIT License — Academic & Enterprise Software Engineering Demonstration Project.
