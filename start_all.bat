@echo off
title EchoSign Unified Full-Stack Runner
color 0B
echo ========================================================
echo   EchoSign: Real-Time Multi-Modal Accessibility Platform
echo ========================================================
echo.
echo [1/3] Checking Node.js Environment...
node -v >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH.
    pause
    exit /b 1
)

echo [2/3] Starting Express Backend and Vite Frontend...
echo       - Backend Port: http://localhost:5001
echo       - Frontend UI:  http://localhost:5173
echo.

npm run dev
