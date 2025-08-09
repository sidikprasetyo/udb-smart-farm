from flask import Flask, request, jsonify, send_file
import os
import cv2
import numpy as np
import json
from datetime import datetime
import threading
import time
from dotenv import load_dotenv
from werkzeug.utils import secure_filename

# Use absolute imports when available, fallback to relative
try:
    from model import ChiliDiseaseModel
    from disease_solutions import DiseaseSolutionProvider
    from camera_manager import CameraManager
except ImportError:
    from .model import ChiliDiseaseModel
    from .disease_solutions import DiseaseSolutionProvider
    from .camera_manager import CameraManager

load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize components
model = ChiliDiseaseModel()
solution_provider = DiseaseSolutionProvider()
camera_manager = CameraManager()

# Load model
MODEL_PATH = os.getenv('MODEL_PATH', 'models/chili_disease_model.h5')
if os.path.exists(MODEL_PATH):
    model.load_model(MODEL_PATH)
    print(f"Model loaded: {MODEL_PATH}")
else:
    print("Warning: Model not found")

# Configuration
UPLOAD_FOLDER = 'temp_images'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': model.model is not None,
        'camera_status': camera_manager.get_camera_status()
    })

@app.route('/predict', methods=['POST'])
def predict_disease():
    """Predict disease from uploaded image"""
    try:
        # Check if image file is provided
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Predict
        prediction = model.predict(filepath)
        
        # Get solution if disease detected
        if prediction['prediction'] != 'healthy':
            solution = solution_provider.get_solution(prediction['prediction'])
            prediction['solution'] = solution
            prediction['cost_estimation'] = solution_provider.get_cost_estimation(prediction['prediction'])
        
        # Clean up uploaded file
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/predict/esp32', methods=['POST'])
def predict_esp32_image():
    """Predict disease from ESP32 captured image"""
    try:
        # Path to ESP32 image (from your existing setup)
        esp32_image_path = os.path.join(os.getcwd(), '..', 'public', 'images', 'esp32.jpg')
        
        if not os.path.exists(esp32_image_path):
            return jsonify({'error': 'ESP32 image not found'}), 404
        
        # Predict
        prediction = model.predict(esp32_image_path)
        
        # Get solution if disease detected
        if prediction['prediction'] != 'healthy':
            solution = solution_provider.get_solution(prediction['prediction'])
            prediction['solution'] = solution
            prediction['cost_estimation'] = solution_provider.get_cost_estimation(prediction['prediction'])
        
        return jsonify({
            'success': True,
            'prediction': prediction,
            'image_path': '/images/esp32.jpg',
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/camera/capture', methods=['POST'])
def capture_and_analyze():
    """Capture image from camera and analyze"""
    try:
        result = camera_manager.capture_and_analyze()
        
        if result:
            return jsonify({
                'success': True,
                'image_path': result['image_path'],
                'prediction': result['prediction'],
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify({'error': 'Failed to capture or analyze image'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/camera/status', methods=['GET'])
def camera_status():
    """Get camera status"""
    try:
        status = camera_manager.get_camera_status()
        return jsonify(status)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/camera/stream')
def camera_stream():
    """Camera stream endpoint (for real-time detection)"""
    from flask import Response
    def generate():
        try:
            camera_manager.initialize_camera()
        except Exception as e:
            yield (b'--frame\r\nContent-Type: text/plain\r\n\r\nCamera initialization failed: ' + str(e).encode() + b'\r\n')
            return

        try:
            while True:
                frame = camera_manager.capture_frame()
                if frame is None:
                    yield (b'--frame\r\nContent-Type: text/plain\r\n\r\nCamera frame not available.\r\n')
                    break
                # Encode frame as JPEG
                ret, buffer = cv2.imencode('.jpg', frame)
                if not ret:
                    yield (b'--frame\r\nContent-Type: text/plain\r\n\r\nFrame encoding failed.\r\n')
                    break
                frame_bytes = buffer.tobytes()
                yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
                time.sleep(0.1)  # Control frame rate
        finally:
            try:
                camera_manager.release_camera()
            except Exception:
                pass
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/diseases', methods=['GET'])
def get_diseases():
    """Get list of all diseases and their information"""
    try:
        diseases = {}
        for disease_name in solution_provider.get_all_diseases():
            diseases[disease_name] = solution_provider.get_solution(disease_name)
        
        return jsonify({
            'success': True,
            'diseases': diseases
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/diseases/<disease_name>/solution', methods=['GET'])
def get_disease_solution(disease_name):
    """Get detailed solution for specific disease"""
    try:
        solution = solution_provider.get_solution(disease_name)
        schedule = solution_provider.get_treatment_schedule(disease_name)
        cost = solution_provider.get_cost_estimation(disease_name)
        
        return jsonify({
            'success': True,
            'disease': disease_name,
            'solution': solution,
            'treatment_schedule': schedule,
            'cost_estimation': cost
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/batch/predict', methods=['POST'])
def batch_predict():
    """Batch prediction for multiple images"""
    try:
        if 'images' not in request.files:
            return jsonify({'error': 'No image files provided'}), 400
        
        files = request.files.getlist('images')
        results = []
        
        for file in files:
            if file and allowed_file(file.filename):
                # Save file
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
                filename = f"{timestamp}_{filename}"
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                
                # Predict
                prediction = model.predict(filepath)
                
                # Get solution if needed
                if prediction['prediction'] != 'healthy':
                    solution = solution_provider.get_solution(prediction['prediction'])
                    prediction['solution'] = solution
                
                results.append({
                    'filename': file.filename,
                    'prediction': prediction
                })
                
                # Clean up
                os.remove(filepath)
        
        return jsonify({
            'success': True,
            'results': results,
            'total_processed': len(results),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/model/info', methods=['GET'])
def model_info():
    """Get model information"""
    try:
        return jsonify({
            'model_loaded': model.model is not None,
            'model_path': MODEL_PATH,
            'classes': model.classes,
            'image_size': model.img_size,
            'confidence_threshold': float(os.getenv('CONFIDENCE_THRESHOLD', 0.7))
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/training/data', methods=['GET'])
def training_data_info():
    """Get information about training data"""
    try:
        train_path = os.getenv('TRAIN_PATH', '../datasetImage/train')
        val_path = os.getenv('VAL_PATH', '../datasetImage/val')
        test_path = os.getenv('TEST_PATH', '../datasetImage/test')
        
        def count_images_in_path(path):
            if not os.path.exists(path):
                return {}
            
            counts = {}
            for class_name in os.listdir(path):
                class_path = os.path.join(path, class_name)
                if os.path.isdir(class_path):
                    counts[class_name] = len([f for f in os.listdir(class_path) 
                                            if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
            return counts
        
        return jsonify({
            'train_data': count_images_in_path(train_path),
            'validation_data': count_images_in_path(val_path),
            'test_data': count_images_in_path(test_path),
            'total_classes': len(model.classes)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    host = os.getenv('API_HOST', 'localhost')
    port = int(os.getenv('API_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    print(f"Starting Chili Disease Detection API on {host}:{port}")
    print(f"Model loaded: {model.model is not None}")
    print(f"Available endpoints:")
    print(f"  POST /predict - Predict from uploaded image")
    print(f"  POST /predict/esp32 - Predict from ESP32 image")
    print(f"  POST /camera/capture - Capture and analyze from camera")
    print(f"  GET  /camera/status - Get camera status")
    print(f"  GET  /camera/stream - Real-time camera stream")
    print(f"  GET  /diseases - List all diseases")
    print(f"  POST /batch/predict - Batch prediction")
    
    app.run(host=host, port=port, debug=debug)
