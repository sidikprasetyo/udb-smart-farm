# Chili Disease Detection AI Model

This directory contains the AI model and related components for detecting diseases in chili plants.

## Structure

```
ai-model/
├── src/                    # Source code
│   ├── model.py           # Main AI model class
│   ├── camera_manager.py  # Camera management and real-time detection
│   ├── disease_solutions.py # Disease solutions and treatments
│   └── api_server.py      # Flask API server
├── scripts/               # Executable scripts
│   ├── train_model.py     # Training script
│   ├── run_camera.py      # Camera detection script
│   └── start_api.py       # API server startup script
├── models/                # Trained models storage
├── data/                  # Additional data files
├── utils/                 # Utility functions
├── requirements.txt       # Python dependencies
└── .env                   # Environment configuration
```

## Features

### 1. Disease Detection

- **Supported diseases**: Healthy, Leaf Curl, Leaf Spot, Whitefly, Yellowish
- **AI Model**: Transfer learning with MobileNetV2
- **Input**: Images (224x224 pixels)
- **Output**: Disease prediction with confidence score

### 2. Real-time Detection Modes

- **Real-time Camera**: Live detection from webcam/USB camera
- **Capture & Analyze**: Single image capture and analysis
- **Batch Processing**: Multiple images analysis

### 3. Treatment Solutions

- Comprehensive disease information
- Treatment recommendations
- Prevention measures
- Cost estimation
- Urgency levels

### 4. API Endpoints

- `/predict` - Image upload prediction
- `/predict/esp32` - ESP32 image prediction
- `/camera/capture` - Camera capture and analysis
- `/camera/stream` - Real-time video stream
- `/diseases` - Disease information
- `/batch/predict` - Batch processing

## Installation

1. Install Python dependencies:

```bash
cd ai-model
pip install -r requirements.txt
```

2. Configure environment:

```bash
cp .env.example .env
# Edit .env with your settings
```

## Usage

### Training the Model

```bash
# Basic training
python scripts/train_model.py

# Advanced training with fine-tuning
python scripts/train_model.py --epochs 100 --fine-tune --fine-tune-epochs 30

# Custom data paths
python scripts/train_model.py --train-path custom/train --val-path custom/val
```

### Real-time Detection

```bash
# Real-time camera detection
python scripts/run_camera.py --mode realtime

# Single capture mode
python scripts/run_camera.py --mode capture

# Custom camera
python scripts/run_camera.py --camera-index 1
```

### API Server

```bash
# Start API server
python scripts/start_api.py

# Custom host and port
python scripts/start_api.py --host 0.0.0.0 --port 8000

# Debug mode
python scripts/start_api.py --debug
```

### Command Line Prediction

```bash
# Basic prediction
python ../predict_esp32_enhanced.py path/to/image.jpg

# Verbose output with solutions
python ../predict_esp32_enhanced.py path/to/image.jpg --verbose

# Save results to file
python ../predict_esp32_enhanced.py path/to/image.jpg --output results.json
```

## Disease Information

### Supported Diseases

1. **Healthy** - Normal, healthy plants
2. **Leaf Curl** - Viral disease causing leaf curling
3. **Leaf Spot** - Fungal disease causing spots on leaves
4. **Whitefly** - Insect pest infestation
5. **Yellowish** - Nutrient deficiency or environmental stress

### Treatment Solutions

Each disease includes:

- **Symptoms**: Visual indicators
- **Causes**: Root causes and triggers
- **Treatment**: Immediate action steps
- **Prevention**: Long-term prevention measures
- **Organic alternatives**: Eco-friendly treatments
- **Cost estimation**: Treatment costs and potential losses

## Model Performance

- **Architecture**: MobileNetV2 + Custom Classification Head
- **Input Size**: 224x224x3
- **Classes**: 5 disease categories
- **Training Features**:
  - Data augmentation
  - Transfer learning
  - Fine-tuning capability
  - Early stopping
  - Learning rate scheduling

## Integration with Next.js

The AI model integrates with the main Next.js application through:

1. **API Routes**: `/api/predict/route.ts` calls the Python scripts
2. **Real-time Updates**: WebSocket connections for live detection
3. **Image Management**: Shared image storage in `public/images/`
4. **ESP32 Integration**: Direct processing of ESP32 captured images

## Configuration

### Environment Variables (.env)

```env
# Model Configuration
MODEL_PATH=models/chili_disease_model.h5
CONFIDENCE_THRESHOLD=0.7
IMAGE_SIZE=224

# Camera Settings
CAMERA_INDEX=0
FRAME_WIDTH=640
FRAME_HEIGHT=480
FPS=30

# API Settings
API_HOST=localhost
API_PORT=5000

# Data Paths
TRAIN_PATH=../datasetImage/train
VAL_PATH=../datasetImage/val
TEST_PATH=../datasetImage/test
```

## Troubleshooting

### Common Issues

1. **Model not found**: Train the model first using `train_model.py`
2. **Camera not detected**: Check camera index and permissions
3. **Import errors**: Ensure all dependencies are installed
4. **Memory issues**: Reduce batch size or image resolution

### Performance Optimization

1. **GPU Support**: Install TensorFlow-GPU for faster training
2. **Model Size**: Use quantization for deployment
3. **Inference Speed**: Optimize image preprocessing
4. **Memory Usage**: Implement batch processing for multiple images

## Development

### Adding New Diseases

1. Add training data to `datasetImage/train/new_disease/`
2. Update `DISEASE_CLASSES` in `.env`
3. Add solution information in `disease_solutions.py`
4. Retrain the model

### Custom Model Architecture

Modify `model.py` to use different base models:

- ResNet50
- EfficientNet
- Custom CNN architectures

### API Extensions

Add new endpoints in `api_server.py` for:

- Model management
- Training status
- Performance metrics
- Data management

## License

This AI model is part of the UDB Smart Farm project.
