@echo off
REM Setup script for Chili Disease Detection AI Model (Windows)

echo 🌶️ Setting up Chili Disease Detection AI Model...

REM Create virtual environment
echo 📦 Creating Python virtual environment...
python -m venv ai-model\venv

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call ai-model\venv\Scripts\activate.bat

REM Install Python dependencies
echo 📥 Installing Python dependencies...
python -m pip install --upgrade pip
pip install -r ai-model\requirements.txt

REM Create necessary directories
echo 📁 Creating directories...
if not exist "ai-model\models" mkdir ai-model\models
if not exist "ai-model\data" mkdir ai-model\data
if not exist "ai-model\temp_images" mkdir ai-model\temp_images
if not exist "captures" mkdir captures
if not exist "temp_uploads" mkdir temp_uploads

REM Copy environment file if not exists
echo ⚙️ Setting up environment configuration...
if not exist "ai-model\.env" (
    copy ai-model\.env ai-model\.env.backup >nul 2>&1
)

REM Check if training data exists
if exist "datasetImage" (
    echo ✅ Training data found in datasetImage\
    echo 📊 Data structure:
    dir datasetImage /s /b | findstr /i "train val test" | head -20
) else (
    echo ⚠️ Training data not found. Please ensure datasetImage\ folder exists with:
    echo    - datasetImage\train\{healthy,leaf_curl,leaf_spot,whitefly,yellowish}\
    echo    - datasetImage\val\{healthy,leaf_curl,leaf_spot,whitefly,yellowish}\
    echo    - datasetImage\test\{healthy,leaf_curl,leaf_spot,whitefly,yellowish}\
)

REM Check for pre-trained model
if exist "ai-model\models\chili_disease_model.h5" (
    echo ✅ Pre-trained model found
) else (
    echo ⚠️ No pre-trained model found. You'll need to train the model first:
    echo    python ai-model\scripts\train_model.py
)

echo.
echo 🎉 Setup completed!
echo.
echo 🚀 Quick Start Commands:
echo    # Train the model (if needed):
echo    python ai-model\scripts\train_model.py
echo.
echo    # Start API server:
echo    python ai-model\scripts\start_api.py
echo.
echo    # Real-time camera detection:
echo    python ai-model\scripts\run_camera.py --mode realtime
echo.
echo    # Single capture analysis:
echo    python ai-model\scripts\run_camera.py --mode capture
echo.
echo    # Start Next.js development server:
echo    npm run dev
echo.
echo 📖 For detailed documentation, see ai-model\README.md

pause
