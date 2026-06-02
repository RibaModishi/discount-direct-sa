@echo off
cd /d "%~dp0"
set "NODE=%LOCALAPPDATA%\Programs\cursor\resources\app\resources\helpers\node.exe"
if not exist "%NODE%" (
  where node >nul 2>&1
  if errorlevel 1 (
    echo Node.js was not found.
    echo Install from https://nodejs.org/ or run the site from Cursor with F5.
    pause
    exit /b 1
  )
  set "NODE=node"
)
echo Starting Discount Direct SA at http://localhost:8080
echo Press Ctrl+C to stop the server.
echo.
start "" "http://localhost:8080"
"%NODE%" scripts\serve.js
