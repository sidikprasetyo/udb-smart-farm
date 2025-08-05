@echo off
REM AI Model Test Runner for Windows

echo 🧪 AI Model Testing Suite
echo ========================

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check if virtual environment exists
if exist "ai-model\venv\Scripts\activate.bat" (
    echo 📦 Activating virtual environment...
    call ai-model\venv\Scripts\activate.bat
) else (
    echo ⚠️ Virtual environment not found. Using system Python.
)

REM Create test directories
if not exist "test_reports" mkdir test_reports

echo 🔍 Starting AI Model Tests...
echo.

REM Run the test script
python test_ai_model.py

echo.
echo ✅ Testing completed!
echo 📊 Check test_reports/ folder for detailed results
echo.

pause
