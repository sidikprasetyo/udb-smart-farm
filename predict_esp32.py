#!/usr/bin/env python3
# predict_esp32.py - Script untuk prediksi yang dipanggil dari Next.js

import sys
import json
import tensorflow as tf
import numpy as np
from PIL import Image
import os
from datetime import datetime

# Konfigurasi
IMG_HEIGHT = 224
IMG_WIDTH = 224
CLASS_NAMES = ['healthy', 'leaf_curl', 'leaf_spot', 'whitefly', 'yellowfish']

# Mapping ke bahasa Indonesia
CLASS_NAMES_ID = {
    'healthy': 'Sehat',
    'leaf_curl': 'Keriting Daun',
    'leaf_spot': 'Bercak Daun', 
    'whitefly': 'Kutu Putih',
    'yellowfish': 'Virus Kekuningan'
}

# Rekomendasi treatment
TREATMENT_RECOMMENDATIONS = {
    'healthy': {
        'status': 'Sehat',
        'action': 'Lanjutkan perawatan rutin',
        'description': 'Tanaman dalam kondisi baik. Pertahankan penyiraman dan pemupukan yang teratur.',
        'severity': 'low'
    },
    'leaf_curl': {
        'status': 'Keriting Daun', 
        'action': 'Periksa kelembaban dan hama',
        'description': 'Kemungkinan serangan virus atau kondisi lingkungan yang tidak optimal. Periksa kelembaban tanah dan keberadaan serangga vektor.',
        'severity': 'medium'
    },
    'leaf_spot': {
        'status': 'Bercak Daun',
        'action': 'Aplikasi fungisida dan perbaiki drainase', 
        'description': 'Infeksi jamur pada daun. Semprotkan fungisida dan pastikan drainase baik untuk mengurangi kelembaban berlebih.',
        'severity': 'medium'
    },
    'whitefly': {
        'status': 'Kutu Putih',
        'action': 'Semprot insektisida atau gunakan perangkap kuning',
        'description': 'Serangan kutu putih yang dapat menyebarkan virus. Gunakan insektisida kontak atau perangkap kuning untuk mengendalikan populasi.',
        'severity': 'high'
    },
    'yellowfish': {
        'status': 'Virus Kekuningan', 
        'action': 'Isolasi tanaman dan kendalikan vektor',
        'description': 'Infeksi virus yang menyebabkan menguningnya daun. Isolasi tanaman yang terinfeksi dan kendalikan serangga vektor seperti kutu daun.',
        'severity': 'high'
    }
}

def load_model(model_path):
    """Load model TensorFlow"""
    try:
        model = tf.keras.models.load_model(model_path)
        return model
    except Exception as e:
        raise Exception(f"Failed to load model: {str(e)}")

def preprocess_image(image_path):
    """Preprocess gambar untuk prediksi"""
    try:
        # Load dan convert gambar
        img = Image.open(image_path).convert('RGB')
        
        # Resize ke ukuran yang dibutuhkan
        img = img.resize((IMG_WIDTH, IMG_HEIGHT))
        
        # Convert ke array dan normalize
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
        
    except Exception as e:
        raise Exception(f"Failed to preprocess image: {str(e)}")

def predict_disease(model, image_path):
    """Prediksi penyakit dari gambar"""
    try:
        # Preprocess gambar
        img_array = preprocess_image(image_path)
        
        # Prediksi
        predictions = model.predict(img_array, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        predicted_class = CLASS_NAMES[predicted_class_idx]
        confidence = float(predictions[0][predicted_class_idx])
        
        # Semua probabilitas
        all_probabilities = {
            class_name: float(prob) 
            for class_name, prob in zip(CLASS_NAMES, predictions[0])
        }
        
        # Treatment recommendation
        treatment = TREATMENT_RECOMMENDATIONS.get(predicted_class, {})
        
        # Hasil prediksi
        result = {
            'predicted_class': predicted_class,
            'predicted_class_id': CLASS_NAMES_ID.get(predicted_class, predicted_class),
            'confidence': confidence,
            'confidence_percentage': f"{confidence:.2%}",
            'all_probabilities': all_probabilities,
            'treatment': treatment,
            'timestamp': datetime.now().isoformat(),
            'image_path': image_path,
            'model_classes': CLASS_NAMES
        }
        
        return result
        
    except Exception as e:
        raise Exception(f"Prediction failed: {str(e)}")

def main():
    """Main function yang dipanggil dari command line"""
    try:
        # Cek arguments
        if len(sys.argv) < 2:
            raise Exception("Image path required as argument")
        
        image_path = sys.argv[1]
        
        # Cek apakah gambar ada
        if not os.path.exists(image_path):
            raise Exception(f"Image not found: {image_path}")
        
        # Path model (sesuaikan dengan lokasi model Anda)
        model_path = 'chili_disease_detector_final.h5'
        
        # Cek alternatif path model
        possible_model_paths = [
            'chili_disease_detector_final.h5',
            'best_chili_disease_model.h5',
            './models/chili_disease_detector_final.h5',
            os.path.join(os.path.dirname(__file__), 'chili_disease_detector_final.h5')
        ]
        
        model = None
        for path in possible_model_paths:
            if os.path.exists(path):
                model_path = path
                break
        
        if not os.path.exists(model_path):
            raise Exception(f"Model not found. Checked paths: {possible_model_paths}")
        
        # Load model
        model = load_model(model_path)
        
        # Prediksi
        result = predict_disease(model, image_path)
        
        # Output hasil sebagai JSON
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        # Output error sebagai JSON
        error_result = {
            'error': True,
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)

if __name__ == "__main__":
    main()