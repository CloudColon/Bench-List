@echo off
REM BenchList - Start All Servers Script (Windows)
REM This script starts PostgreSQL, Django backend, and Next.js frontend

color 0A
echo ==========================================
echo   Starting BenchList Application
echo ==========================================
echo.

REM Check if PostgreSQL is running
echo [1/3] Starting PostgreSQL Server...
netstat -ano | findstr ":5432" | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] PostgreSQL is already running on port 5432
) else (
    echo Starting PostgreSQL...
    "C:\Program Files\PostgreSQL\17\bin\pg_ctl" -D "C:\PostgresData" start >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] PostgreSQL started successfully
    ) else (
        echo [ERROR] Failed to start PostgreSQL
        echo Trying to start PostgreSQL in new window...
        start "PostgreSQL Server" cmd /k "cd /d C:\Program Files\PostgreSQL\17\bin && pg_ctl -D C:\PostgresData start"
    )
)
echo.

REM Wait for PostgreSQL to fully start
echo Waiting for PostgreSQL to initialize...
timeout /t 3 /nobreak >nul

REM Start Django Backend Server
echo [2/3] Starting Django Backend Server...
start "BenchList - Django Backend (Port 8000)" cmd /k "cd /d %~dp0backend && uv run manage.py runserver"
echo [OK] Django backend starting on http://localhost:8000
echo.

REM Wait for Django to start
echo Waiting for Django to initialize...
timeout /t 3 /nobreak >nul

REM Start Next.js Frontend Server
echo [3/3] Starting Next.js Frontend Server...
start "BenchList - Next.js Frontend (Port 3000)" cmd /k "cd /d %~dp0frontend && npm run dev"
echo [OK] Next.js frontend starting on http://localhost:3000
echo.

echo ==========================================
echo   All Servers Started Successfully!
echo ==========================================
echo.
echo Services:
echo   [OK] PostgreSQL:  localhost:5432
echo   [OK] Backend API: http://localhost:8000
echo   [OK] Frontend:    http://localhost:3000
echo.
echo Three terminal windows have been opened:
echo   1. Django Backend Server
echo   2. Next.js Frontend Server
echo.
echo To stop all servers:
echo   - Close each terminal window, OR
echo   - Press Ctrl+C in each window
echo.
echo You can now close this window.
echo The servers will continue running in the background.
echo.
pause
