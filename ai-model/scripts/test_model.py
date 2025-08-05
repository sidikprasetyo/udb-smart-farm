import os
import sys
sys.path.append('../src')
from model import ChiliDiseaseModel
import random

def test_model_predictions():
    """Test model with various samples from test dataset"""
    
    print("=" * 60)
    print("TESTING AI MODEL PREDICTIONS")
    print("=" * 60)
    
    # Initialize model
    model = ChiliDiseaseModel()
    model.load_model('../src/models/chili_disease_model.h5')
    
    # Test each disease category
    test_base_path = '../../datasetImage/test'
    disease_folders = ['healthy', 'leaf curl', 'leaf spot', 'whitefly', 'yellowish']
    
    results = []
    
    for disease in disease_folders:
        folder_path = os.path.join(test_base_path, disease)
        if os.path.exists(folder_path):
            # Get image files
            images = [f for f in os.listdir(folder_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
            
            if images:
                # Test 2 random images from each category
                test_images = random.sample(images, min(2, len(images)))
                
                print(f"\n🔍 Testing {disease.upper()} category:")
                print("-" * 40)
                
                for img_name in test_images:
                    img_path = os.path.join(folder_path, img_name)
                    
                    try:
                        result = model.predict(img_path)
                        predicted = result['prediction']
                        confidence = result['confidence']
                        
                        # Convert folder name to model format for comparison
                        actual_normalized = disease.replace(' ', '_').lower()
                        predicted_normalized = predicted.replace(' ', '_').lower()
                        
                        is_correct = actual_normalized == predicted_normalized
                        status = "✅ CORRECT" if is_correct else "❌ WRONG"
                        
                        print(f"  📷 {img_name}")
                        print(f"     Expected: {disease}")
                        print(f"     Predicted: {predicted} ({confidence:.1%})")
                        print(f"     Status: {status}")
                        print()
                        
                        results.append({
                            'actual': disease,
                            'predicted': predicted,
                            'confidence': confidence,
                            'correct': is_correct,
                            'image': img_name
                        })
                        
                    except Exception as e:
                        print(f"  ❌ Error testing {img_name}: {str(e)}")
    
    # Calculate overall accuracy
    if results:
        correct_predictions = sum(1 for r in results if r['correct'])
        total_predictions = len(results)
        accuracy = (correct_predictions / total_predictions) * 100
        
        print("=" * 60)
        print("SUMMARY RESULTS")
        print("=" * 60)
        print(f"Total Tests: {total_predictions}")
        print(f"Correct Predictions: {correct_predictions}")
        print(f"Wrong Predictions: {total_predictions - correct_predictions}")
        print(f"Overall Accuracy: {accuracy:.1f}%")
        
        # Show confidence distribution
        high_conf = sum(1 for r in results if r['confidence'] >= 0.8)
        medium_conf = sum(1 for r in results if 0.5 <= r['confidence'] < 0.8)
        low_conf = sum(1 for r in results if r['confidence'] < 0.5)
        
        print(f"\nConfidence Distribution:")
        print(f"  High (≥80%): {high_conf}/{total_predictions} ({high_conf/total_predictions*100:.1f}%)")
        print(f"  Medium (50-79%): {medium_conf}/{total_predictions} ({medium_conf/total_predictions*100:.1f}%)")
        print(f"  Low (<50%): {low_conf}/{total_predictions} ({low_conf/total_predictions*100:.1f}%)")
        
        print("\n" + "=" * 60)
        if accuracy >= 70:
            print("🎉 MODEL PERFORMANCE: EXCELLENT!")
        elif accuracy >= 50:
            print("👍 MODEL PERFORMANCE: GOOD")
        else:
            print("⚠️  MODEL PERFORMANCE: NEEDS IMPROVEMENT")
        print("=" * 60)
    
    return results

if __name__ == "__main__":
    test_model_predictions()
