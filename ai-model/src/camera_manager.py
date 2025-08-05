import cv2
import numpy as np
import json
import os
import time
from datetime import datetime
import threading
from queue import Queue
from dotenv import load_dotenv

# Use absolute imports when available, fallback to relative
try:
    from model import ChiliDiseaseModel
    from disease_solutions import DiseaseSolutionProvider
except ImportError:
    from .model import ChiliDiseaseModel
    from .disease_solutions import DiseaseSolutionProvider

load_dotenv()

class CameraManager:
    def __init__(self):
        self.camera_index = int(os.getenv('CAMERA_INDEX', 0))
        self.frame_width = int(os.getenv('FRAME_WIDTH', 640))
        self.frame_height = int(os.getenv('FRAME_HEIGHT', 480))
        self.fps = int(os.getenv('FPS', 30))
        self.confidence_threshold = float(os.getenv('CONFIDENCE_THRESHOLD', 0.7))
        
        self.cap = None
        self.is_running = False
        self.current_frame = None
        self.prediction_queue = Queue()
        
        # Initialize AI model and solution provider
        self.model = ChiliDiseaseModel()
        self.solution_provider = DiseaseSolutionProvider()
        
        # Load model
        model_path = os.getenv('MODEL_PATH', 'models/chili_disease_model.h5')
        if os.path.exists(model_path):
            self.model.load_model(model_path)
            print(f"Model loaded from {model_path}")
        else:
            print("Warning: Model not found. Please train the model first.")
    
    def initialize_camera(self):
        """Initialize camera connection"""
        try:
            self.cap = cv2.VideoCapture(self.camera_index)
            if not self.cap.isOpened():
                raise Exception(f"Cannot open camera {self.camera_index}")
            
            # Set camera properties
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.frame_width)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.frame_height)
            self.cap.set(cv2.CAP_PROP_FPS, self.fps)
            
            print(f"Camera initialized: {self.frame_width}x{self.frame_height} @ {self.fps}fps")
            return True
        except Exception as e:
            print(f"Camera initialization failed: {e}")
            return False
    
    def capture_frame(self):
        """Capture single frame"""
        if self.cap is None or not self.cap.isOpened():
            if not self.initialize_camera():
                return None
        
        ret, frame = self.cap.read()
        if ret:
            return frame
        return None
    
    def save_captured_image(self, frame, filename=None):
        """Save captured frame to file"""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"captured_{timestamp}.jpg"
        
        # Create directory if not exists
        capture_dir = "captures"
        os.makedirs(capture_dir, exist_ok=True)
        
        filepath = os.path.join(capture_dir, filename)
        cv2.imwrite(filepath, frame)
        return filepath
    
    def predict_frame(self, frame):
        """Predict disease from frame"""
        try:
            # Save frame temporarily
            temp_path = "temp_frame.jpg"
            cv2.imwrite(temp_path, frame)
            
            # Predict
            result = self.model.predict(temp_path)
            
            # Get solution if disease detected
            if result['prediction'] != 'healthy' and result['confidence'] >= self.confidence_threshold:
                solution = self.solution_provider.get_solution(result['prediction'])
                result['solution'] = solution
            
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            return result
        except Exception as e:
            print(f"Prediction error: {e}")
            return None
    
    def start_realtime_detection(self):
        """Start real-time detection mode"""
        if not self.initialize_camera():
            return False
        
        self.is_running = True
        print("Starting real-time detection... Press 'q' to quit, 's' to save frame")
        
        # Start prediction thread
        prediction_thread = threading.Thread(target=self._prediction_worker)
        prediction_thread.daemon = True
        prediction_thread.start()
        
        last_prediction_time = 0
        last_prediction = None
        
        while self.is_running:
            ret, frame = self.cap.read()
            if not ret:
                break
            
            # Store current frame
            self.current_frame = frame.copy()
            
            # Add prediction to queue every 2 seconds
            current_time = time.time()
            if current_time - last_prediction_time > 2.0:
                if not self.prediction_queue.empty():
                    try:
                        last_prediction = self.prediction_queue.get_nowait()
                        last_prediction_time = current_time
                    except:
                        pass
                
                # Add current frame for prediction
                self.prediction_queue.put(frame.copy())
            
            # Draw prediction results on frame
            if last_prediction:
                self._draw_prediction_on_frame(frame, last_prediction)
            
            # Display frame
            cv2.imshow('Chili Disease Detection - Real-time', frame)
            
            # Handle key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                # Save current frame and prediction
                self._save_detection_result(frame, last_prediction)
        
        self.stop_detection()
        return True
    
    def _prediction_worker(self):
        """Worker thread for predictions"""
        while self.is_running:
            if not self.prediction_queue.empty():
                try:
                    frame = self.prediction_queue.get()
                    prediction = self.predict_frame(frame)
                    if prediction:
                        # Store prediction result
                        self.prediction_queue.put(prediction)
                except Exception as e:
                    print(f"Prediction worker error: {e}")
            time.sleep(0.1)
    
    def _draw_prediction_on_frame(self, frame, prediction):
        """Draw prediction results on frame"""
        if not prediction:
            return
        
        # Prepare text
        pred_text = f"Disease: {prediction['prediction'].replace('_', ' ').title()}"
        conf_text = f"Confidence: {prediction['confidence']:.2f}"
        
        # Choose color based on prediction
        if prediction['prediction'] == 'healthy':
            color = (0, 255, 0)  # Green
        elif prediction['confidence'] >= self.confidence_threshold:
            color = (0, 0, 255)  # Red
        else:
            color = (0, 255, 255)  # Yellow
        
        # Draw background rectangle
        cv2.rectangle(frame, (10, 10), (400, 80), (0, 0, 0), -1)
        
        # Draw text
        cv2.putText(frame, pred_text, (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        cv2.putText(frame, conf_text, (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        
        # Draw status indicator
        status_color = color if prediction['confidence'] >= self.confidence_threshold else (0, 255, 255)
        cv2.circle(frame, (frame.shape[1] - 30, 30), 15, status_color, -1)
    
    def _save_detection_result(self, frame, prediction):
        """Save detection result with metadata"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Save image
        img_filename = f"detection_{timestamp}.jpg"
        img_path = self.save_captured_image(frame, img_filename)
        
        # Save metadata
        if prediction:
            metadata = {
                'timestamp': timestamp,
                'image_path': img_path,
                'prediction': prediction,
                'camera_settings': {
                    'width': self.frame_width,
                    'height': self.frame_height,
                    'fps': self.fps
                }
            }
            
            json_filename = f"detection_{timestamp}.json"
            json_path = os.path.join("captures", json_filename)
            
            with open(json_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            print(f"Detection saved: {img_path}")
            if prediction['prediction'] != 'healthy':
                print(f"Disease detected: {prediction['prediction']} ({prediction['confidence']:.2f})")
    
    def capture_and_analyze(self):
        """Capture single image and analyze"""
        if not self.initialize_camera():
            return None
        
        print("Capturing image in 3 seconds...")
        for i in range(3, 0, -1):
            print(f"{i}...")
            time.sleep(1)
        
        # Capture frame
        frame = self.capture_frame()
        if frame is None:
            print("Failed to capture image")
            return None
        
        print("Image captured! Analyzing...")
        
        # Save captured image
        img_path = self.save_captured_image(frame)
        
        # Analyze
        prediction = self.predict_frame(frame)
        
        if prediction:
            # Save analysis result
            self._save_detection_result(frame, prediction)
            
            # Display results
            print(f"\nAnalysis Results:")
            print(f"Disease: {prediction['prediction'].replace('_', ' ').title()}")
            print(f"Confidence: {prediction['confidence']:.2f}")
            
            if 'solution' in prediction:
                print(f"\nRecommended Solution:")
                solution = prediction['solution']
                print(f"Treatment: {solution['treatment']}")
                print(f"Prevention: {solution['prevention']}")
                print(f"Urgency: {solution['urgency']}")
            
            return {
                'image_path': img_path,
                'prediction': prediction
            }
        
        return None
    
    def stop_detection(self):
        """Stop detection and release resources"""
        self.is_running = False
        
        if self.cap:
            self.cap.release()
        
        cv2.destroyAllWindows()
        print("Detection stopped")
    
    def get_camera_status(self):
        """Get camera status"""
        try:
            if self.cap and self.cap.isOpened():
                return {
                    'status': 'connected',
                    'width': int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
                    'height': int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
                    'fps': int(self.cap.get(cv2.CAP_PROP_FPS))
                }
            else:
                return {'status': 'disconnected'}
        except:
            return {'status': 'error'}

if __name__ == "__main__":
    camera = CameraManager()
    
    while True:
        print("\nChili Disease Detection System")
        print("1. Real-time Detection")
        print("2. Capture and Analyze")
        print("3. Camera Status")
        print("4. Exit")
        
        choice = input("Choose option (1-4): ").strip()
        
        if choice == '1':
            camera.start_realtime_detection()
        elif choice == '2':
            result = camera.capture_and_analyze()
            if result:
                print(f"Result saved to: {result['image_path']}")
        elif choice == '3':
            status = camera.get_camera_status()
            print(f"Camera Status: {json.dumps(status, indent=2)}")
        elif choice == '4':
            camera.stop_detection()
            break
        else:
            print("Invalid option!")
