#!/usr/bin/env python3
"""
Real-time Camera Detection for Chili Disease
"""

import os
import sys
import argparse

# Add the ai-model src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from camera_manager import CameraManager

def main():
    parser = argparse.ArgumentParser(description='Chili Disease Real-time Detection')
    parser.add_argument('--mode', choices=['realtime', 'capture'], default='realtime',
                       help='Detection mode: realtime or capture')
    parser.add_argument('--camera-index', type=int, default=0,
                       help='Camera index (default: 0)')
    parser.add_argument('--model-path', 
                       help='Path to trained model')
    
    args = parser.parse_args()
    
    # Update environment variables if provided
    if args.model_path:
        os.environ['MODEL_PATH'] = args.model_path
    os.environ['CAMERA_INDEX'] = str(args.camera_index)
    
    # Initialize camera manager
    camera = CameraManager()
    
    try:
        if args.mode == 'realtime':
            print("Starting real-time detection...")
            camera.start_realtime_detection()
        elif args.mode == 'capture':
            print("Capture and analyze mode...")
            result = camera.capture_and_analyze()
            if result:
                print(f"Analysis completed. Results saved to: {result['image_path']}")
            else:
                print("Capture and analysis failed.")
    
    except KeyboardInterrupt:
        print("\nStopping detection...")
    finally:
        camera.stop_detection()

if __name__ == "__main__":
    main()
