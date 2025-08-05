# Implementasi AI Model untuk Analisis Penyakit Tanaman Cabai

## Ringkasan

Saya telah berhasil mengimplementasikan sistem AI model yang komprehensif untuk mengelola dan menganalisis gambar tanaman cabai, dengan dua mode utama: **realtime detection** dan **capture analysis**. Sistem ini dibangun dengan arsitektur yang rapi di folder `ai-model` dan terintegrasi penuh dengan aplikasi Next.js.

## Struktur yang Dibangun

### 1. Folder AI Model (`ai-model/`)

```
ai-model/
├── src/
│   ├── model.py              # Model AI utama (MobileNetV2 + Transfer Learning)
│   ├── camera_manager.py     # Manajemen kamera dan deteksi real-time
│   ├── disease_solutions.py  # Database solusi penyakit lengkap
│   └── api_server.py         # Flask API server
├── scripts/
│   ├── train_model.py        # Script untuk training model
│   ├── run_camera.py         # Script untuk menjalankan kamera
│   └── start_api.py          # Script untuk memulai API server
├── models/                   # Folder untuk menyimpan trained models
├── requirements.txt          # Dependencies Python
├── .env                      # Konfigurasi environment
└── README.md                 # Dokumentasi lengkap
```

### 2. Enhanced Python Scripts

- **`predict_esp32_enhanced.py`** - Script prediksi yang enhanced dengan solusi penyakit
- **API Integration** - Terintegrasi dengan Flask API untuk performa yang lebih baik

### 3. Next.js API Routes

- **`/api/predict`** - Endpoint untuk prediksi dengan multi-mode (ESP32, Camera, Upload)
- **`/api/camera`** - Endpoint khusus untuk operasi kamera
- **`/api/diseases`** - Endpoint untuk informasi penyakit
- **`/api/diseases/[disease]`** - Endpoint detail solusi penyakit

### 4. React Components

- **`DiseasePrediction.tsx`** - Interface utama untuk analisis penyakit
- **`DiseaseDetail.tsx`** - Komponen detail penyakit dengan solusi lengkap

## Fitur Utama

### 🤖 AI Model Features

1. **Transfer Learning dengan MobileNetV2** - Model yang efisien dan akurat
2. **5 Kategori Penyakit**:

   - Healthy (Sehat)
   - Leaf Curl (Keriting Daun)
   - Leaf Spot (Bercak Daun)
   - Whitefly (Kutu Kebul)
   - Yellowish (Menguning)

3. **Data Augmentation** - Rotasi, zoom, flip untuk training yang robust
4. **Fine-tuning Capability** - Kemampuan fine-tuning untuk akurasi lebih tinggi

### 📸 Detection Modes

1. **Real-time Detection**:

   - Live streaming dari kamera
   - Prediksi otomatis setiap 2 detik
   - Visualisasi hasil langsung di video
   - Hotkey: 'q' untuk quit, 's' untuk save

2. **Capture & Analyze**:

   - Capture single image dengan countdown
   - Analisis mendalam dengan confidence score
   - Penyimpanan hasil otomatis

3. **ESP32 Integration**:

   - Analisis langsung dari gambar ESP32
   - Compatible dengan setup existing

4. **Upload Mode**:
   - Upload gambar dari device
   - Batch processing support
   - Validasi file dan size

### 💊 Disease Solutions System

Setiap penyakit dilengkapi dengan:

1. **Informasi Komprehensif**:

   - Penyebab (causes)
   - Gejala (symptoms)
   - Tingkat urgency
   - Estimasi kerugian

2. **Solusi Treatment**:

   - Treatment konvensional
   - Treatment organik
   - Langkah pencegahan
   - Jadwal treatment (immediate, daily, weekly, monthly)

3. **Analisis Biaya**:
   - Biaya treatment per hektar
   - Biaya pencegahan
   - Potensi kerugian jika tidak diobati
   - ROI analysis

### 🌐 API Server Features

Flask API server dengan endpoints:

- `/predict` - Prediksi dari uploaded image
- `/predict/esp32` - Prediksi dari ESP32 image
- `/camera/capture` - Capture dan analisis dari kamera
- `/camera/stream` - Real-time video stream
- `/diseases` - List semua penyakit
- `/diseases/{disease}/solution` - Detail solusi penyakit
- `/batch/predict` - Batch processing
- `/health` - Health check

## Cara Penggunaan

### 1. Setup AI Model

```bash
# Install dependencies
cd ai-model
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env sesuai kebutuhan

# Train model (jika belum ada trained model)
python scripts/train_model.py --epochs 50 --fine-tune
```

### 2. Mode Real-time Detection

```bash
# Real-time detection
python scripts/run_camera.py --mode realtime

# Capture mode
python scripts/run_camera.py --mode capture
```

### 3. Start API Server

```bash
# Start Flask API server
python scripts/start_api.py --host 0.0.0.0 --port 5000
```

### 4. Integration dengan Next.js

API routes sudah terintegrasi, komponen React siap digunakan:

```typescript
// Prediksi ESP32
const response = await fetch("/api/predict", {
  method: "POST",
  body: JSON.stringify({ mode: "esp32" }),
});

// Capture dari kamera
const response = await fetch("/api/camera", {
  method: "POST",
  body: JSON.stringify({ action: "capture" }),
});
```

## Teknologi yang Digunakan

### Backend AI:

- **TensorFlow/Keras** - Deep learning framework
- **OpenCV** - Computer vision
- **Flask** - API server
- **NumPy/Pandas** - Data processing

### Frontend Integration:

- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Model Architecture:

- **Base Model**: MobileNetV2 (pre-trained ImageNet)
- **Input Size**: 224x224x3
- **Output**: 5 classes (softmax)
- **Optimization**: Adam optimizer
- **Callbacks**: Early stopping, model checkpoint, learning rate scheduling

## Kelebihan Sistem

1. **Modular Architecture** - Setiap komponen terpisah dan dapat dikembangkan independen
2. **Scalable** - Mudah ditambah penyakit baru atau model baru
3. **Multiple Interfaces** - CLI, API, Web interface
4. **Comprehensive Solutions** - Tidak hanya deteksi, tapi juga solusi lengkap
5. **Cost Analysis** - Analisis ekonomi untuk decision making
6. **Real-time Capability** - Deteksi langsung dari kamera
7. **Fallback System** - Jika AI API tidak tersedia, fallback ke script lokal

## Next Steps

1. **Training dengan Data Real** - Training model dengan dataset yang sudah ada
2. **Model Optimization** - Quantization untuk deployment yang lebih efisien
3. **Mobile App Integration** - Integrasi dengan mobile app
4. **IoT Integration** - Integrasi dengan sensor IoT untuk monitoring lingkungan
5. **Notification System** - Alert system untuk penyakit yang terdeteksi
6. **Historical Analysis** - Tracking perkembangan penyakit dari waktu ke waktu

Sistem ini memberikan foundation yang solid untuk smart farming dengan AI, dengan fokus pada user experience yang baik dan actionable insights untuk petani cabai.
