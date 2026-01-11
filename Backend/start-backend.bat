@echo off
title FarmSync Backend Server
color 0A
echo ========================================
echo   FARM SYNC - BACKEND SERVER
echo   Running on http://localhost:5000
echo ========================================
echo.
echo IMPORTANT: Keep this window open!
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
npm run dev
pause
