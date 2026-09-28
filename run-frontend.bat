@echo off
echo Starting React Frontend Dev Server on Port 5173...
cd /d "%~dp0frontend"
if not exist node_modules (
    echo Installing npm dependencies...
    npm install
)
npm run dev
pause
