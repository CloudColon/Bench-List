@echo off
echo Starting Employee Management System Backend...
echo.

REM Check if virtual environment is activated
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Python not found. Please activate your virtual environment.
    pause
    exit /b 1
)

REM Run migrations
echo Running database migrations...
python manage.py migrate

REM Start the development server
echo.
echo Starting Django development server...
echo Server will be available at http://localhost:8000
echo Admin panel: http://localhost:8000/admin/
echo API Documentation: See API_DOCUMENTATION.md
echo.
python manage.py runserver
