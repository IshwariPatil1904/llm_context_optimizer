@echo off
echo Starting C++ LLM Context Optimizer REST Server on Port 8080...
cd /d "%~dp0backend\build"
if not exist llm_context_optimizer_server.exe (
    echo Building C++ backend...
    cmake --build .
)
llm_context_optimizer_server.exe 8080
pause
