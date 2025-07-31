# Import libraries yang diperlukan
import tensorflow as tf

# Cek versi TensorFlow
print(f"TensorFlow version: {tf.__version__}")

# Import dengan error handling
try:
    from tensorflow import keras
    from tensorflow.keras import layers
    from tensorflow.keras.preprocessing.image import ImageDataGenerator
    from tensorflow.keras.applications import MobileNetV2
    from tensorflow.keras.optimizers import Adam
    from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
    print("TensorFlow imports successful!")
except ImportError as e:
    print(f"Import error: {e}")
    print("Trying alternative imports...")
    try:
        import keras
        from keras import layers
        from keras.preprocessing.image import ImageDataGenerator
        from keras.applications import MobileNetV2
        from keras.optimizers import Adam
        from keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
        print("Keras standalone imports successful!")
    except ImportError as e2:
        print(f"Alternative import also failed: {e2}")
        print("Please install TensorFlow properly: pip install tensorflow")
        exit()
import matplotlib.pyplot as plt
import numpy as np
import os
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix
import pandas as pd
from PIL import Image
import warnings
warnings.filterwarnings('ignore')

# Konfigurasi dataset
BASE_DIR = r'D:\7. UDB-Smart-Farming\smartfarming-ai\dataset'
TRAIN_DIR = os.path.join(BASE_DIR, 'train')
VAL_DIR = os.path.join(BASE_DIR, 'val')
TEST_DIR = os.path.join(BASE_DIR, 'test')

# Parameter model
IMG_HEIGHT = 224
IMG_WIDTH = 224
BATCH_SIZE = 32
NUM_CLASSES = 5
EPOCHS = 50

# Nama kelas penyakit
CLASS_NAMES = ['healthy', 'leaf_curl', 'leaf_spot', 'whitefly', 'yellowfish']

print("=== DETEKSI PENYAKIT CABAI MENGGUNAKAN DEEP LEARNING ===")
print(f"Jumlah kelas: {NUM_CLASSES}")
print(f"Kelas: {CLASS_NAMES}")

# Fungsi untuk menghitung jumlah gambar di setiap direktori
def count_images_in_dir(directory):
    """Menghitung jumlah gambar di setiap kelas dalam direktori"""
    if not os.path.exists(directory):
        print(f"Direktori {directory} tidak ditemukan!")
        return {}
    
    class_counts = {}
    for class_name in CLASS_NAMES:
        class_dir = os.path.join(directory, class_name)
        if os.path.exists(class_dir):
            count = len([f for f in os.listdir(class_dir) 
                        if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
            class_counts[class_name] = count
        else:
            class_counts[class_name] = 0
    return class_counts

# Menampilkan informasi dataset
print("\n=== INFORMASI DATASET ===")
train_counts = count_images_in_dir(TRAIN_DIR)
val_counts = count_images_in_dir(VAL_DIR)
test_counts = count_images_in_dir(TEST_DIR)

print("Training set:")
for class_name, count in train_counts.items():
    print(f"  {class_name}: {count} gambar")

print("Validation set:")
for class_name, count in val_counts.items():
    print(f"  {class_name}: {count} gambar")

print("Test set:")
for class_name, count in test_counts.items():
    print(f"  {class_name}: {count} gambar")

# Data Augmentation untuk training
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    vertical_flip=True,
    zoom_range=0.2,
    shear_range=0.2,
    brightness_range=[0.8, 1.2],
    fill_mode='nearest'
)

# Untuk validation dan test hanya rescaling
val_test_datagen = ImageDataGenerator(rescale=1./255)

# Load dan preprocess data
print("\n=== LOADING DATA ===")
train_generator = train_datagen.flow_from_directory(
    TRAIN_DIR,
    target_size=(IMG_HEIGHT, IMG_WIDTH),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=True
)

validation_generator = val_test_datagen.flow_from_directory(
    VAL_DIR,
    target_size=(IMG_HEIGHT, IMG_WIDTH),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False
)

test_generator = val_test_datagen.flow_from_directory(
    TEST_DIR,
    target_size=(IMG_HEIGHT, IMG_WIDTH),
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    shuffle=False
)

print(f"Training batches: {len(train_generator)}")
print(f"Validation batches: {len(validation_generator)}")
print(f"Test batches: {len(test_generator)}")

# Fungsi untuk menampilkan sample gambar
def display_sample_images(generator, class_names, num_samples=8):
    """Menampilkan sample gambar dari generator"""
    plt.figure(figsize=(15, 8))
    
    # Ambil satu batch data
    images, labels = next(generator)
    
    for i in range(min(num_samples, len(images))):
        plt.subplot(2, 4, i + 1)
        plt.imshow(images[i])
        plt.title(f'Class: {class_names[np.argmax(labels[i])]}')
        plt.axis('off')
    
    plt.tight_layout()
    plt.show()

print("\n=== SAMPLE GAMBAR TRAINING ===")
display_sample_images(train_generator, CLASS_NAMES)

# Reset generator setelah display
train_generator.reset()

# Membangun model menggunakan Transfer Learning (MobileNetV2)
def create_model():
    """Membuat model CNN dengan transfer learning"""
    # Base model dari MobileNetV2
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(IMG_HEIGHT, IMG_WIDTH, 3)
    )
    
    # Freeze base model layers
    base_model.trainable = False
    
    # Tambahkan custom layers
    model = keras.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dropout(0.5),
        layers.Dense(256, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.3),
        layers.Dense(128, activation='relu'),
        layers.BatchNormalization(),
        layers.Dropout(0.2),
        layers.Dense(NUM_CLASSES, activation='softmax')
    ])
    
    return model

# Membuat model
print("\n=== MEMBUAT MODEL ===")
model = create_model()

# Compile model
model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy', 'precision', 'recall']
)

# Menampilkan arsitektur model
print("Arsitektur Model:")
model.summary()

# Callbacks untuk training
callbacks = [
    EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True,
        verbose=1
    ),
    ReduceLROnPlateau(
        monitor='val_loss',
        factor=0.5,
        patience=5,
        min_lr=1e-7,
        verbose=1
    ),
    ModelCheckpoint(
        'best_chili_disease_model.h5',
        monitor='val_accuracy',
        save_best_only=True,
        verbose=1
    )
]

# Training model
print("\n=== TRAINING MODEL ===")
print("Memulai training...")

history = model.fit(
    train_generator,
    epochs=EPOCHS,
    validation_data=validation_generator,
    callbacks=callbacks,
    verbose=1
)

print("Training selesai!")

# Fungsi untuk plot training history
def plot_training_history(history):
    """Plot training dan validation metrics"""
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    # Accuracy
    axes[0,0].plot(history.history['accuracy'], label='Training Accuracy')
    axes[0,0].plot(history.history['val_accuracy'], label='Validation Accuracy')
    axes[0,0].set_title('Model Accuracy')
    axes[0,0].set_xlabel('Epoch')
    axes[0,0].set_ylabel('Accuracy')
    axes[0,0].legend()
    
    # Loss
    axes[0,1].plot(history.history['loss'], label='Training Loss')
    axes[0,1].plot(history.history['val_loss'], label='Validation Loss')
    axes[0,1].set_title('Model Loss')
    axes[0,1].set_xlabel('Epoch')
    axes[0,1].set_ylabel('Loss')
    axes[0,1].legend()
    
    # Precision
    axes[1,0].plot(history.history['precision'], label='Training Precision')
    axes[1,0].plot(history.history['val_precision'], label='Validation Precision')
    axes[1,0].set_title('Model Precision')
    axes[1,0].set_xlabel('Epoch')
    axes[1,0].set_ylabel('Precision')
    axes[1,0].legend()
    
    # Recall
    axes[1,1].plot(history.history['recall'], label='Training Recall')
    axes[1,1].plot(history.history['val_recall'], label='Validation Recall')
    axes[1,1].set_title('Model Recall')
    axes[1,1].set_xlabel('Epoch')
    axes[1,1].set_ylabel('Recall')
    axes[1,1].legend()
    
    plt.tight_layout()
    plt.show()

# Plot training history
print("\n=== VISUALISASI TRAINING ===")
plot_training_history(history)

# Evaluasi pada test set
print("\n=== EVALUASI MODEL ===")
print("Evaluasi pada test set...")

# Load best model
model.load_weights('best_chili_disease_model.h5')

# Evaluasi
test_loss, test_accuracy, test_precision, test_recall = model.evaluate(
    test_generator, 
    verbose=1
)

print(f"\nHasil Evaluasi Test Set:")
print(f"Loss: {test_loss:.4f}")
print(f"Accuracy: {test_accuracy:.4f}")
print(f"Precision: {test_precision:.4f}")
print(f"Recall: {test_recall:.4f}")

# Prediksi untuk confusion matrix dan classification report
print("\nMembuat prediksi untuk analisis lebih detail...")

# Reset test generator
test_generator.reset()

# Prediksi
y_pred_proba = model.predict(test_generator)
y_pred = np.argmax(y_pred_proba, axis=1)

# True labels
y_true = test_generator.classes

# Classification Report
print("\n=== CLASSIFICATION REPORT ===")
report = classification_report(
    y_true, 
    y_pred, 
    target_names=CLASS_NAMES, 
    output_dict=True
)
print(classification_report(y_true, y_pred, target_names=CLASS_NAMES))

# Confusion Matrix
def plot_confusion_matrix(y_true, y_pred, class_names):
    """Plot confusion matrix"""
    cm = confusion_matrix(y_true, y_pred)
    
    plt.figure(figsize=(10, 8))
    sns.heatmap(
        cm, 
        annot=True, 
        fmt='d', 
        cmap='Blues',
        xticklabels=class_names,
        yticklabels=class_names
    )
    plt.title('Confusion Matrix')
    plt.xlabel('Predicted Label')
    plt.ylabel('True Label')
    plt.show()
    
    return cm

print("\n=== CONFUSION MATRIX ===")
cm = plot_confusion_matrix(y_true, y_pred, CLASS_NAMES)

# Fungsi untuk prediksi gambar individual
def predict_single_image(model, image_path, class_names):
    """Prediksi penyakit pada satu gambar"""
    try:
        # Load dan preprocess gambar
        img = Image.open(image_path).convert('RGB')
        img = img.resize((IMG_WIDTH, IMG_HEIGHT))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        # Prediksi
        predictions = model.predict(img_array)
        predicted_class_idx = np.argmax(predictions[0])
        predicted_class = class_names[predicted_class_idx]
        confidence = predictions[0][predicted_class_idx]
        
        # Tampilkan hasil
        plt.figure(figsize=(10, 6))
        
        # Gambar
        plt.subplot(1, 2, 1)
        plt.imshow(img)
        plt.title(f'Input Image')
        plt.axis('off')
        
        # Probabilitas
        plt.subplot(1, 2, 2)
        plt.bar(class_names, predictions[0])
        plt.title(f'Prediction: {predicted_class}\nConfidence: {confidence:.2%}')
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.show()
        
        return predicted_class, confidence
        
    except Exception as e:
        print(f"Error dalam prediksi: {e}")
        return None, None

# Contoh penggunaan prediksi
print("\n=== FUNGSI PREDIKSI SIAP DIGUNAKAN ===")
print("Untuk memprediksi gambar baru, gunakan:")
print("predicted_class, confidence = predict_single_image(model, 'path/to/image.jpg', CLASS_NAMES)")

# Fine-tuning (opsional untuk performa lebih baik)
def fine_tune_model(model, train_gen, val_gen):
    """Fine-tune model dengan unfreeze beberapa layer"""
    print("\n=== FINE TUNING ===")
    
    # Unfreeze top layers dari base model
    base_model = model.layers[0]
    base_model.trainable = True
    
    # Freeze layer awal, hanya fine-tune layer akhir
    for layer in base_model.layers[:-20]:
        layer.trainable = False
    
    # Compile dengan learning rate lebih kecil
    model.compile(
        optimizer=Adam(learning_rate=0.0001),
        loss='categorical_crossentropy',
        metrics=['accuracy', 'precision', 'recall']
    )
    
    # Fine-tune training
    fine_tune_epochs = 10
    history_fine = model.fit(
        train_gen,
        epochs=fine_tune_epochs,
        validation_data=val_gen,
        callbacks=[
            EarlyStopping(patience=5, restore_best_weights=True),
            ReduceLROnPlateau(factor=0.5, patience=3)
        ]
    )
    
    return history_fine

# Uncomment baris di bawah untuk melakukan fine-tuning
# history_fine = fine_tune_model(model, train_generator, validation_generator)

# Simpan model final
print("\n=== MENYIMPAN MODEL ===")
model.save('chili_disease_detector_final.h5')
print("Model berhasil disimpan sebagai 'chili_disease_detector_final.h5'")

# Rangkuman hasil
print("\n" + "="*50)
print("RANGKUMAN HASIL TRAINING")
print("="*50)
print(f"Test Accuracy: {test_accuracy:.2%}")
print(f"Test Precision: {test_precision:.4f}")
print(f"Test Recall: {test_recall:.4f}")

# Per-class accuracy
for i, class_name in enumerate(CLASS_NAMES):
    class_acc = report[class_name]['precision']
    print(f"{class_name}: {class_acc:.2%}")

print("\nModel siap digunakan untuk deteksi penyakit cabai!")
print("File yang dihasilkan:")
print("- best_chili_disease_model.h5 (model terbaik saat training)")
print("- chili_disease_detector_final.h5 (model final)")

# Fungsi untuk load model yang sudah tersimpan
def load_saved_model(model_path):
    """Load model yang sudah disimpan"""
    try:
        model = keras.models.load_model(model_path)
        print(f"Model berhasil dimuat dari {model_path}")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

print("\nUntuk menggunakan model di masa depan:")
print("loaded_model = load_saved_model('chili_disease_detector_final.h5')")