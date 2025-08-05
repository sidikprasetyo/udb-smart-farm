#!/usr/bin/env python3
"""
AI Model Testing Script
Comprehensive testing for chili disease detection system
"""

import os
import sys
import json
import time
import traceback
from datetime import datetime
from pathlib import Path

# Add the ai-model src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai-model', 'src'))

try:
    import cv2
    import numpy as np
    import tensorflow as tf
    from model import ChiliDiseaseModel
    from disease_solutions import DiseaseSolutionProvider
    from camera_manager import CameraManager
except ImportError as e:
    print(f"Import error: {e}")
    print("Please install required dependencies: pip install -r ai-model/requirements.txt")
    sys.exit(1)

class AIModelTester:
    def __init__(self):
        self.results = []
        self.start_time = None
        self.model = None
        self.solution_provider = None
        self.camera_manager = None
        
    def log_test(self, test_name, status, message, details=None, duration=None):
        """Log test result"""
        result = {
            'test_name': test_name,
            'status': status,  # 'success', 'error', 'warning'
            'message': message,
            'details': details,
            'duration': duration,
            'timestamp': datetime.now().isoformat()
        }
        self.results.append(result)
        
        # Print result
        status_icon = "✅" if status == 'success' else "❌" if status == 'error' else "⚠️"
        duration_str = f" ({duration:.2f}s)" if duration else ""
        print(f"{status_icon} {test_name}: {message}{duration_str}")
        
        return result
    
    def test_environment(self):
        """Test Python environment and dependencies"""
        start_time = time.time()
        
        try:
            # Test Python version
            python_version = sys.version_info
            if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
                return self.log_test(
                    "Python Environment",
                    "warning", 
                    f"Python {python_version.major}.{python_version.minor} detected. Recommended: Python 3.8+",
                    duration=time.time() - start_time
                )
            
            # Test key dependencies
            dependencies = {
                'tensorflow': tf.__version__,
                'opencv': cv2.__version__,
                'numpy': np.__version__
            }
            
            return self.log_test(
                "Python Environment",
                "success",
                f"Python {python_version.major}.{python_version.minor} with all dependencies",
                details=dependencies,
                duration=time.time() - start_time
            )
            
        except Exception as e:
            return self.log_test(
                "Python Environment",
                "error",
                f"Environment check failed: {str(e)}",
                duration=time.time() - start_time
            )
    
    def test_model_loading(self):
        """Test AI model loading"""
        start_time = time.time()
        
        try:
            self.model = ChiliDiseaseModel()
            
            # Check if model file exists
            model_path = 'ai-model/models/chili_disease_model.h5'
            if not os.path.exists(model_path):
                return self.log_test(
                    "Model Loading",
                    "warning",
                    "No trained model found. Model needs to be trained first.",
                    details={'model_path': model_path},
                    duration=time.time() - start_time
                )
            
            # Load model
            self.model.load_model(model_path)
            
            # Test model structure
            model_info = {
                'input_shape': self.model.model.input_shape if self.model.model else None,
                'output_shape': self.model.model.output_shape if self.model.model else None,
                'classes': self.model.classes,
                'image_size': self.model.img_size
            }
            
            return self.log_test(
                "Model Loading",
                "success",
                f"Model loaded successfully with {len(self.model.classes)} classes",
                details=model_info,
                duration=time.time() - start_time
            )
            
        except Exception as e:
            return self.log_test(
                "Model Loading",
                "error",
                f"Model loading failed: {str(e)}",
                details={'error': traceback.format_exc()},
                duration=time.time() - start_time
            )
    
    def test_disease_solutions(self):
        """Test disease solution provider"""
        start_time = time.time()
        
        try:
            self.solution_provider = DiseaseSolutionProvider()
            
            diseases = self.solution_provider.get_all_diseases()
            
            # Test each disease
            test_results = {}
            for disease in diseases:
                solution = self.solution_provider.get_solution(disease)
                cost = self.solution_provider.get_cost_estimation(disease)
                schedule = self.solution_provider.get_treatment_schedule(disease)
                
                test_results[disease] = {
                    'has_solution': bool(solution),
                    'has_cost': bool(cost),
                    'has_schedule': bool(schedule),
                    'urgency': solution.get('urgency', 'Unknown')
                }
            
            return self.log_test(
                "Disease Solutions",
                "success",
                f"Disease database loaded with {len(diseases)} diseases",
                details=test_results,
                duration=time.time() - start_time
            )
            
        except Exception as e:
            return self.log_test(
                "Disease Solutions",
                "error",
                f"Disease solutions test failed: {str(e)}",
                duration=time.time() - start_time
            )
    
    def test_camera_system(self):
        """Test camera system"""
        start_time = time.time()
        
        try:
            self.camera_manager = CameraManager()
            
            # Test camera initialization
            camera_available = self.camera_manager.initialize_camera()
            
            if not camera_available:
                return self.log_test(
                    "Camera System",
                    "warning",
                    "Camera not available or accessible",
                    duration=time.time() - start_time
                )
            
            # Test camera status
            status = self.camera_manager.get_camera_status()
            
            # Test frame capture
            frame = self.camera_manager.capture_frame()
            frame_captured = frame is not None
            
            self.camera_manager.stop_detection()
            
            return self.log_test(
                "Camera System",
                "success" if frame_captured else "warning",
                f"Camera {'working' if frame_captured else 'detected but frame capture failed'}",
                details={
                    'status': status,
                    'frame_captured': frame_captured,
                    'frame_shape': frame.shape if frame is not None else None
                },
                duration=time.time() - start_time
            )
            
        except Exception as e:
            return self.log_test(
                "Camera System",
                "error",
                f"Camera test failed: {str(e)}",
                duration=time.time() - start_time
            )
    
    def test_prediction_pipeline(self):
        """Test end-to-end prediction pipeline"""
        start_time = time.time()
        
        try:
            if not self.model or not self.model.model:
                return self.log_test(
                    "Prediction Pipeline",
                    "error",
                    "Model not loaded, cannot test prediction",
                    duration=time.time() - start_time
                )
            
            # Create a test image (synthetic)
            test_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
            test_image_path = 'test_image_synthetic.jpg'
            cv2.imwrite(test_image_path, test_image)
            
            try:
                # Test prediction
                prediction = self.model.predict(test_image_path)
                
                # Validate prediction structure
                expected_keys = ['prediction', 'confidence', 'all_predictions']
                has_all_keys = all(key in prediction for key in expected_keys)
                
                # Test with solution provider
                if self.solution_provider and prediction['prediction'] != 'healthy':
                    solution = self.solution_provider.get_solution(prediction['prediction'])
                    has_solution = bool(solution)
                else:
                    has_solution = True  # Healthy doesn't need solution
                
                # Clean up
                if os.path.exists(test_image_path):
                    os.remove(test_image_path)
                
                return self.log_test(
                    "Prediction Pipeline",
                    "success" if has_all_keys and has_solution else "warning",
                    f"Prediction pipeline {'working' if has_all_keys else 'has issues'}",
                    details={
                        'prediction': prediction,
                        'has_all_keys': has_all_keys,
                        'has_solution': has_solution
                    },
                    duration=time.time() - start_time
                )
                
            finally:
                # Clean up test file
                if os.path.exists(test_image_path):
                    os.remove(test_image_path)
            
        except Exception as e:
            return self.log_test(
                "Prediction Pipeline",
                "error",
                f"Prediction pipeline test failed: {str(e)}",
                duration=time.time() - start_time
            )
    
    def test_esp32_integration(self):
        """Test ESP32 image integration"""
        start_time = time.time()
        
        try:
            esp32_image_path = 'public/images/esp32.jpg'
            
            if not os.path.exists(esp32_image_path):
                return self.log_test(
                    "ESP32 Integration",
                    "warning",
                    "ESP32 image not found",
                    details={'expected_path': esp32_image_path},
                    duration=time.time() - start_time
                )
            
            # Check image properties
            img = cv2.imread(esp32_image_path)
            if img is None:
                return self.log_test(
                    "ESP32 Integration",
                    "error",
                    "ESP32 image file corrupted or invalid",
                    duration=time.time() - start_time
                )
            
            # Test prediction if model available
            if self.model and self.model.model:
                prediction = self.model.predict(esp32_image_path)
                
                return self.log_test(
                    "ESP32 Integration",
                    "success",
                    f"ESP32 image analyzed: {prediction['prediction']}",
                    details={
                        'image_shape': img.shape,
                        'prediction': prediction
                    },
                    duration=time.time() - start_time
                )
            else:
                return self.log_test(
                    "ESP32 Integration",
                    "warning",
                    "ESP32 image found but model not available for prediction",
                    details={'image_shape': img.shape},
                    duration=time.time() - start_time
                )
            
        except Exception as e:
            return self.log_test(
                "ESP32 Integration",
                "error",
                f"ESP32 integration test failed: {str(e)}",
                duration=time.time() - start_time
            )
    
    def test_performance(self):
        """Test model performance metrics"""
        start_time = time.time()
        
        try:
            if not self.model or not self.model.model:
                return self.log_test(
                    "Performance Test",
                    "warning",
                    "Model not available for performance testing",
                    duration=time.time() - start_time
                )
            
            # Create multiple test images and measure prediction time
            num_tests = 5
            prediction_times = []
            
            for i in range(num_tests):
                test_image = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
                test_path = f'test_perf_{i}.jpg'
                cv2.imwrite(test_path, test_image)
                
                pred_start = time.time()
                prediction = self.model.predict(test_path)
                pred_time = time.time() - pred_start
                prediction_times.append(pred_time)
                
                # Clean up
                os.remove(test_path)
            
            avg_time = np.mean(prediction_times)
            std_time = np.std(prediction_times)
            
            # Performance thresholds
            fast_threshold = 2.0  # seconds
            status = "success" if avg_time < fast_threshold else "warning"
            
            return self.log_test(
                "Performance Test",
                status,
                f"Average prediction time: {avg_time:.2f}s ± {std_time:.2f}s",
                details={
                    'prediction_times': prediction_times,
                    'average_time': avg_time,
                    'std_time': std_time,
                    'num_tests': num_tests
                },
                duration=time.time() - start_time
            )
            
        except Exception as e:
            return self.log_test(
                "Performance Test",
                "error",
                f"Performance test failed: {str(e)}",
                duration=time.time() - start_time
            )
    
    def run_all_tests(self):
        """Run all tests"""
        print("🌶️ Starting AI Model Testing...")
        print("=" * 50)
        
        self.start_time = time.time()
        
        # Run tests in order
        tests = [
            self.test_environment,
            self.test_model_loading,
            self.test_disease_solutions,
            self.test_camera_system,
            self.test_prediction_pipeline,
            self.test_esp32_integration,
            self.test_performance
        ]
        
        for test_func in tests:
            try:
                test_func()
            except Exception as e:
                self.log_test(
                    test_func.__name__.replace('test_', '').replace('_', ' ').title(),
                    "error",
                    f"Test execution failed: {str(e)}"
                )
            print()  # Add spacing between tests
        
        # Generate summary
        self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        total_time = time.time() - self.start_time
        
        passed = len([r for r in self.results if r['status'] == 'success'])
        failed = len([r for r in self.results if r['status'] == 'error'])
        warnings = len([r for r in self.results if r['status'] == 'warning'])
        total = len(self.results)
        
        print("=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {total}")
        print(f"✅ Passed: {passed}")
        print(f"⚠️  Warnings: {warnings}")
        print(f"❌ Failed: {failed}")
        print(f"⏱️  Total Time: {total_time:.2f}s")
        
        # Calculate health score
        health_score = (passed + warnings * 0.5) / total * 100 if total > 0 else 0
        print(f"🏥 Health Score: {health_score:.1f}%")
        
        # Recommendations
        print("\n💡 RECOMMENDATIONS:")
        if failed > 0:
            print("- Fix failed tests before using the system in production")
        if warnings > 0:
            print("- Address warnings to improve system reliability")
        if health_score >= 80:
            print("- System is in good condition for use")
        elif health_score >= 60:
            print("- System is functional but has some issues")
        else:
            print("- System needs significant fixes before use")
        
        # Save report
        self.save_report()
    
    def save_report(self):
        """Save test report to file"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total': len(self.results),
                'passed': len([r for r in self.results if r['status'] == 'success']),
                'failed': len([r for r in self.results if r['status'] == 'error']),
                'warnings': len([r for r in self.results if r['status'] == 'warning']),
                'duration': time.time() - self.start_time
            },
            'results': self.results,
            'system_info': {
                'python_version': sys.version,
                'platform': sys.platform,
                'tensorflow_version': tf.__version__,
                'opencv_version': cv2.__version__
            }
        }
        
        # Create reports directory
        os.makedirs('test_reports', exist_ok=True)
        
        # Save report
        report_filename = f"test_reports/ai_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n📄 Test report saved to: {report_filename}")

def main():
    """Main function"""
    tester = AIModelTester()
    tester.run_all_tests()

if __name__ == "__main__":
    main()
