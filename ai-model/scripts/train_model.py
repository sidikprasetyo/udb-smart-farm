#!/usr/bin/env python3
"""
Training script for Chili Disease Detection Model
"""

import os
import sys
import argparse
from pathlib import Path

# Add the ai-model src directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ai-model', 'src'))

from model import ChiliDiseaseModel
from dotenv import load_dotenv

load_dotenv('ai-model/.env')

def train_model(train_path, val_path, epochs=50, fine_tune=False, fine_tune_epochs=20):
    """
    Train the chili disease detection model
    
    Args:
        train_path (str): Path to training data
        val_path (str): Path to validation data
        epochs (int): Number of training epochs
        fine_tune (bool): Whether to perform fine-tuning
        fine_tune_epochs (int): Number of fine-tuning epochs
    """
    
    print("Initializing Chili Disease Detection Model...")
    model = ChiliDiseaseModel()
    
    # Create models directory
    os.makedirs('ai-model/models', exist_ok=True)
    
    print(f"Training data: {train_path}")
    print(f"Validation data: {val_path}")
    print(f"Epochs: {epochs}")
    print(f"Image size: {model.img_size}")
    print(f"Classes: {model.classes}")
    
    # Train model
    print("\nStarting training...")
    history = model.train(train_path, val_path, epochs=epochs)
    
    # Plot training history
    print("Plotting training history...")
    model.plot_training_history(history)
    
    # Fine-tuning if requested
    if fine_tune:
        print(f"\nStarting fine-tuning for {fine_tune_epochs} epochs...")
        fine_tune_history = model.fine_tune(train_path, val_path, epochs=fine_tune_epochs)
        
        # Plot fine-tuning history
        print("Plotting fine-tuning history...")
        model.plot_training_history(fine_tune_history)
    
    print("Training completed!")
    
    # Test prediction on a sample
    print("\nTesting model...")
    test_image = None
    
    # Find a test image
    for class_name in os.listdir(train_path):
        class_path = os.path.join(train_path, class_name)
        if os.path.isdir(class_path):
            images = [f for f in os.listdir(class_path) 
                     if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            if images:
                test_image = os.path.join(class_path, images[0])
                break
    
    if test_image:
        result = model.predict(test_image)
        print(f"Test prediction:")
        print(f"  Image: {test_image}")
        print(f"  Predicted: {result['prediction']}")
        print(f"  Confidence: {result['confidence']:.2f}")
    
    return model

def main():
    parser = argparse.ArgumentParser(description='Train Chili Disease Detection Model')
    parser.add_argument('--train-path', default='datasetImage/train', 
                       help='Path to training data directory')
    parser.add_argument('--val-path', default='datasetImage/val',
                       help='Path to validation data directory')
    parser.add_argument('--epochs', type=int, default=50,
                       help='Number of training epochs')
    parser.add_argument('--fine-tune', action='store_true',
                       help='Perform fine-tuning after initial training')
    parser.add_argument('--fine-tune-epochs', type=int, default=20,
                       help='Number of fine-tuning epochs')
    
    args = parser.parse_args()
    
    # Check if data directories exist
    if not os.path.exists(args.train_path):
        print(f"Error: Training data directory not found: {args.train_path}")
        sys.exit(1)
    
    if not os.path.exists(args.val_path):
        print(f"Error: Validation data directory not found: {args.val_path}")
        sys.exit(1)
    
    # Check if data has the required structure
    train_classes = [d for d in os.listdir(args.train_path) 
                    if os.path.isdir(os.path.join(args.train_path, d))]
    val_classes = [d for d in os.listdir(args.val_path) 
                  if os.path.isdir(os.path.join(args.val_path, d))]
    
    if not train_classes:
        print(f"Error: No class directories found in {args.train_path}")
        sys.exit(1)
    
    if not val_classes:
        print(f"Error: No class directories found in {args.val_path}")
        sys.exit(1)
    
    print(f"Found {len(train_classes)} training classes: {train_classes}")
    print(f"Found {len(val_classes)} validation classes: {val_classes}")
    
    # Train model
    model = train_model(
        train_path=args.train_path,
        val_path=args.val_path,
        epochs=args.epochs,
        fine_tune=args.fine_tune,
        fine_tune_epochs=args.fine_tune_epochs
    )
    
    print(f"\nModel saved to: ai-model/models/chili_disease_model.h5")
    if args.fine_tune:
        print(f"Fine-tuned model saved to: ai-model/models/chili_disease_model_finetuned.h5")

if __name__ == "__main__":
    main()
