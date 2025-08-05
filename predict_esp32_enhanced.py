#!/usr/bin/env python3
"""
Enhanced Chili Disease Detection Script
Supports both ESP32 image prediction and command-line usage
"""

import sys
import os
import json
import argparse
from pathlib import Path

# Add the src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai-model', 'src'))

try:
    from model import ChiliDiseaseModel
    from disease_solutions import DiseaseSolutionProvider
except ImportError:
    # Try alternative import paths
    try:
        sys.path.append(os.path.join(os.path.dirname(__file__), 'ai-model', 'src'))
        from model import ChiliDiseaseModel
        from disease_solutions import DiseaseSolutionProvider
    except ImportError:
        # Final fallback
        sys.path.append('ai-model/src')
        from model import ChiliDiseaseModel
        from disease_solutions import DiseaseSolutionProvider

def predict_image(image_path, model_path=None, include_solution=True, verbose=False):
    """
    Predict disease from image path
    
    Args:
        image_path (str): Path to the image file
        model_path (str): Path to the trained model
        include_solution (bool): Whether to include treatment solutions
        verbose (bool): Whether to print detailed information
    
    Returns:
        dict: Prediction results
    """
    try:
        # Initialize model
        model = ChiliDiseaseModel()
        
        # Load model
        if model_path and os.path.exists(model_path):
            model.load_model(model_path)
        else:
            # Try multiple possible paths for the trained model
            possible_paths = [
                'ai-model/src/models/chili_disease_model.h5',
                'ai-model/models/chili_disease_model.h5', 
                os.path.join(os.path.dirname(__file__), 'ai-model', 'src', 'models', 'chili_disease_model.h5'),
                os.path.join(os.path.dirname(__file__), 'ai-model', 'models', 'chili_disease_model.h5')
            ]
            
            model_loaded = False
            for path in possible_paths:
                if os.path.exists(path):
                    model.load_model(path)
                    model_loaded = True
                    if verbose:
                        print(f"Loaded model from: {path}")
                    break
            
            if not model_loaded:
                raise FileNotFoundError("No trained model found. Please train the model first.")
        
        if verbose:
            print(f"Model loaded successfully")
            print(f"Analyzing image: {image_path}")
        
        # Check if image exists
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        # Predict
        prediction = model.predict(image_path)
        
        # Add solution if requested and disease detected
        if include_solution and prediction['prediction'] != 'healthy':
            solution_provider = DiseaseSolutionProvider()
            solution = solution_provider.get_solution(prediction['prediction'])
            prediction['solution'] = {
                'treatment': solution.get('treatment', []),
                'prevention': solution.get('prevention', []),
                'urgency': solution.get('urgency', 'Medium'),
                'estimated_loss': solution.get('estimated_loss', 'Unknown')
            }
        
        return prediction
        
    except Exception as e:
        return {
            'error': str(e),
            'prediction': 'error',
            'confidence': 0.0
        }

def main():
    """Main function for command line usage"""
    parser = argparse.ArgumentParser(description='Chili Disease Detection')
    parser.add_argument('image_path', help='Path to the image file')
    parser.add_argument('--model', '-m', help='Path to the trained model')
    parser.add_argument('--no-solution', action='store_true', help='Don\'t include treatment solutions')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    parser.add_argument('--output', '-o', help='Output file for results (JSON)')
    
    args = parser.parse_args()
    
    # Predict
    result = predict_image(
        image_path=args.image_path,
        model_path=args.model,
        include_solution=not args.no_solution,
        verbose=args.verbose
    )
    
    # Output results
    if args.verbose:
        print("\n" + "="*50)
        print("PREDICTION RESULTS")
        print("="*50)
        print(f"Disease: {result.get('prediction', 'Unknown').replace('_', ' ').title()}")
        print(f"Confidence: {result.get('confidence', 0):.2f}")
        
        if 'solution' in result:
            print(f"\nTreatment Urgency: {result['solution']['urgency']}")
            print(f"Estimated Loss: {result['solution']['estimated_loss']}")
            
            print(f"\nRecommended Treatments:")
            for i, treatment in enumerate(result['solution']['treatment'][:3], 1):
                print(f"  {i}. {treatment}")
            
            print(f"\nPrevention Measures:")
            for i, prevention in enumerate(result['solution']['prevention'][:3], 1):
                print(f"  {i}. {prevention}")
        
        if 'error' in result:
            print(f"\nError: {result['error']}")
    
    # Save to file if requested
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(result, f, indent=2)
        if args.verbose:
            print(f"\nResults saved to: {args.output}")
    
    # Print JSON for API consumption (always output JSON for compatibility)
    print(json.dumps(result))

if __name__ == "__main__":
    # Check if called with command line arguments
    if len(sys.argv) > 1:
        main()
    else:
        # Legacy mode for ESP32 compatibility
        # Look for ESP32 image in the default location
        esp32_image_path = os.path.join(os.getcwd(), "public", "images", "esp32.jpg")
        
        if os.path.exists(esp32_image_path):
            result = predict_image(esp32_image_path, verbose=False)
            print(json.dumps(result))
        else:
            error_result = {
                'error': 'ESP32 image not found',
                'prediction': 'error',
                'confidence': 0.0
            }
            print(json.dumps(error_result))
