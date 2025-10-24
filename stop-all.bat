@echo off
REM BenchList - Stop All Servers Script (Windows)

color 0C
echo ==========================================
echo   Stopping BenchList Application
echo ==========================================
echo.

REM Stop Next.js (port 3000)
echo [1/3] Stopping Next.js Frontend Server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    echo Stopping process %%a on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)
echo [OK] Frontend server stopped
echo.

REM Stop Django (port 8000)
echo [2/3] Stopping Django Backend Server...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
    echo Stopping process %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)
echo [OK] Backend server stopped
echo.

REM Stop PostgreSQL
echo [3/3] Stopping PostgreSQL Server...
"C:\Program Files\PostgreSQL\17\bin\pg_ctl" -D "C:\PostgresData" stop
if %ERRORLEVEL% EQU 0 (
    echo [OK] PostgreSQL stopped successfully
) else (
    echo [WARNING] PostgreSQL may not be running or failed to stop
)
echo.

echo ==========================================
echo   All Servers Stopped
echo ==========================================
echo.
pause
