#!/bin/bash

# Setup script for Chili Disease Detection AI Model
echo "🌶️ Setting up Chili Disease Detection AI Model..."

# Create virtual environment
echo "📦 Creating Python virtual environment..."
python -m venv ai-model/venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source ai-model/venv/Scripts/activate
else
    source ai-model/venv/bin/activate
fi

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r ai-model/requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p ai-model/models
mkdir -p ai-model/data
mkdir -p ai-model/temp_images
mkdir -p captures
mkdir -p temp_uploads

# Copy environment file if not exists
if [ ! -f ai-model/.env ]; then
    echo "⚙️ Setting up environment configuration..."
    cp ai-model/.env ai-model/.env.backup 2>/dev/null || true
fi

# Check if training data exists
if [ -d "datasetImage" ]; then
    echo "✅ Training data found in datasetImage/"
    echo "📊 Data structure:"
    find datasetImage -type d -name "*" | head -20
else
    echo "⚠️ Training data not found. Please ensure datasetImage/ folder exists with:"
    echo "   - datasetImage/train/{healthy,leaf_curl,leaf_spot,whitefly,yellowish}/"
    echo "   - datasetImage/val/{healthy,leaf_curl,leaf_spot,whitefly,yellowish}/"
    echo "   - datasetImage/test/{healthy,leaf_curl,leaf_spot,whitefly,yellowish}/"
fi

# Check for pre-trained model
if [ -f "ai-model/models/chili_disease_model.h5" ]; then
    echo "✅ Pre-trained model found"
else
    echo "⚠️ No pre-trained model found. You'll need to train the model first:"
    echo "   python ai-model/scripts/train_model.py"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "🚀 Quick Start Commands:"
echo "   # Train the model (if needed):"
echo "   python ai-model/scripts/train_model.py"
echo ""
echo "   # Start API server:"
echo "   python ai-model/scripts/start_api.py"
echo ""
echo "   # Real-time camera detection:"
echo "   python ai-model/scripts/run_camera.py --mode realtime"
echo ""
echo "   # Single capture analysis:"
echo "   python ai-model/scripts/run_camera.py --mode capture"
echo ""
echo "   # Start Next.js development server:"
echo "   npm run dev"
echo ""
echo "📖 For detailed documentation, see ai-model/README.md"
