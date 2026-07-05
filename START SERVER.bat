@echo off
title PhotoAI Server — SB Studio
color 0A

echo.
echo  ╔══════════════════════════════════════════╗
echo  ║   🎨  PhotoAI v3.1 — SB Studio           ║
echo  ║   Starting server on port 3000...        ║
echo  ╚══════════════════════════════════════════╝
echo.

:: Kill any old process using port 3000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)

:: Change to the script directory
cd /d "%~dp0"

:: Start server — auto-restart on crash using a loop
:start
echo  [%time%] Starting PhotoAI server...
node server.js
echo.
echo  [%time%] Server crashed or stopped. Restarting in 3 seconds...
timeout /t 3 /nobreak >nul
goto start
