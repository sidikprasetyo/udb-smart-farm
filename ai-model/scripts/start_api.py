#!/usr/bin/env python3
"""
Start API Server for Chili Disease Detection
"""

import os
import sys
import argparse

# Add the ai-model src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from api_server import app

def main():
    parser = argparse.ArgumentParser(description='Chili Disease Detection API Server')
    parser.add_argument('--host', default='localhost', help='Host address')
    parser.add_argument('--port', type=int, default=5000, help='Port number')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')
    parser.add_argument('--model-path', help='Path to trained model')
    
    args = parser.parse_args()
    
    # Update environment variables
    if args.model_path:
        os.environ['MODEL_PATH'] = args.model_path
    os.environ['API_HOST'] = args.host
    os.environ['API_PORT'] = str(args.port)
    os.environ['FLASK_DEBUG'] = str(args.debug)
    
    print(f"Starting Chili Disease Detection API Server")
    print(f"Host: {args.host}")
    print(f"Port: {args.port}")
    print(f"Debug: {args.debug}")
    
    app.run(host=args.host, port=args.port, debug=args.debug)

if __name__ == "__main__":
    main()
