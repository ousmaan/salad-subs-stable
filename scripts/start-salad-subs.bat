@echo off
REM Salad Subscription System - Local Development Server
REM This script starts the Next.js development server

REM Change to project root directory (one level up from scripts folder)
cd /d "%~dp0.."

echo ========================================
echo   Salad Subscription Management System
echo   Starting Development Server...
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    echo This may take a few minutes on first run.
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to install dependencies!
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Dependencies installed!
    echo.
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo [WARNING] .env.local not found!
    echo Please copy .env.example to .env.local and add your Supabase credentials.
    echo.
    pause
    exit /b 1
)

echo [INFO] Starting development server...
echo Server will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the development server
call npm run dev

REM If the server stops, pause so user can see any error messages
pause
