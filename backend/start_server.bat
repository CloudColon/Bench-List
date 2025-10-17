@echo off
echo ========================================
echo Employee Management System Backend
echo ========================================
echo.

REM Check if virtual environment is activated
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Python not found. Please activate your virtual environment.
    pause
    exit /b 1
)

REM Run migrations
echo [1/3] Running database migrations...
python manage.py migrate
echo.

REM Start the development server
echo [2/3] Starting Django development server...
echo.
echo ========================================
echo Server is starting...
echo ========================================
echo.
echo 📍 Access Points:
echo   - Swagger UI: http://localhost:8000/swagger/
echo   - ReDoc: http://localhost:8000/redoc/
echo   - Admin Panel: http://localhost:8000/admin/
echo   - API Base: http://localhost:8000/api/
echo.
echo 📖 Documentation:
echo   - SWAGGER_GUIDE.md - Interactive API testing guide
echo   - API_DOCUMENTATION.md - Complete API reference
echo   - QUICK_START.md - Quick start guide
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.
python manage.py runserver
