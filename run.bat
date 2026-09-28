@echo off
echo =========================================================
echo   Starting LLM Context Optimizer Platform (Backend + Frontend)
echo =========================================================
start "C++ Backend Server (Port 8080)" cmd /k "%~dp0run-backend.bat"
start "React Frontend (Port 5173)" cmd /k "%~dp0run-frontend.bat"
echo Services launched!
echo Access the application at: http://localhost:5173/
pause
