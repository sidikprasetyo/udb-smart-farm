import os
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
import matplotlib.pyplot as plt
from dotenv import load_dotenv

load_dotenv()

class ChiliDiseaseModel:
    def __init__(self):
        self.img_size = int(os.getenv('IMAGE_SIZE', 224))
        self.batch_size = int(os.getenv('BATCH_SIZE', 16))  # Reduced for better training with small dataset
        self.learning_rate = float(os.getenv('LEARNING_RATE', 0.0001))  # Lower learning rate
        self.classes = ['healthy', 'leaf_curl', 'leaf_spot', 'whitefly', 'yellowish']  # Match folder names
        self.num_classes = len(self.classes)
        self.model = None
        
    def create_model(self):
        """Membuat model menggunakan Transfer Learning dengan MobileNetV2"""
        base_model = MobileNetV2(
            weights='imagenet',
            include_top=False,
            input_shape=(self.img_size, self.img_size, 3)
        )
        
        # Freeze base model layers
        base_model.trainable = False
        
        # Add custom layers
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        x = Dropout(0.2)(x)
        predictions = Dense(self.num_classes, activation='softmax')(x)
        
        self.model = Model(inputs=base_model.input, outputs=predictions)
        
        # Compile model
        self.model.compile(
            optimizer=Adam(learning_rate=self.learning_rate),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        return self.model
    
    def prepare_data(self, train_path, val_path):
        """Mempersiapkan data untuk training"""
        train_datagen = ImageDataGenerator(
            rescale=1./255,
            rotation_range=20,
            width_shift_range=0.2,
            height_shift_range=0.2,
            horizontal_flip=True,
            zoom_range=0.2,
            fill_mode='nearest',
            brightness_range=[0.8, 1.2],
            shear_range=0.1
        )
        
        val_datagen = ImageDataGenerator(rescale=1./255)
        
        # Create class indices mapping to handle folder names with spaces
        class_indices = {
            'healthy': 0,
            'leaf curl': 1, 
            'leaf spot': 2,
            'whitefly': 3,
            'yellowish': 4
        }
        
        train_generator = train_datagen.flow_from_directory(
            train_path,
            target_size=(self.img_size, self.img_size),
            batch_size=self.batch_size,
            class_mode='categorical',
            shuffle=True,
            seed=42
        )
        
        val_generator = val_datagen.flow_from_directory(
            val_path,
            target_size=(self.img_size, self.img_size),
            batch_size=self.batch_size,
            class_mode='categorical',
            shuffle=False
        )
        
        # Update class names to match our internal representation
        self.class_names_mapping = {
            'healthy': 'healthy',
            'leaf curl': 'leaf_curl',
            'leaf spot': 'leaf_spot', 
            'whitefly': 'whitefly',
            'yellowish': 'yellowish'
        }
        
        print(f"Found {train_generator.samples} training images")
        print(f"Found {val_generator.samples} validation images")
        print(f"Classes: {list(train_generator.class_indices.keys())}")
        
        return train_generator, val_generator
    
    def train(self, train_path, val_path, epochs=30):
        """Training model"""
        if self.model is None:
            self.create_model()
        
        # Create models directory if it doesn't exist
        os.makedirs('models', exist_ok=True)
        
        train_gen, val_gen = self.prepare_data(train_path, val_path)
        
        # Callbacks
        callbacks = [
            ModelCheckpoint(
                'models/chili_disease_model.h5',
                save_best_only=True,
                monitor='val_accuracy',
                mode='max',
                verbose=1
            ),
            EarlyStopping(
                monitor='val_loss',
                patience=8,
                restore_best_weights=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.3,
                patience=4,
                min_lr=0.00001,
                verbose=1
            )
        ]
        
        print(f"Starting training for {epochs} epochs...")
        print(f"Batch size: {self.batch_size}")
        print(f"Learning rate: {self.learning_rate}")
        
        # Train model
        history = self.model.fit(
            train_gen,
            epochs=epochs,
            validation_data=val_gen,
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def fine_tune(self, train_path, val_path, epochs=20):
        """Fine-tuning model dengan unfreeze beberapa layer"""
        if self.model is None:
            self.load_model('models/chili_disease_model.h5')
        
        # Unfreeze top layers of base model
        base_model = self.model.layers[0]
        base_model.trainable = True
        
        # Fine-tune from this layer onwards
        fine_tune_at = 100
        
        for layer in base_model.layers[:fine_tune_at]:
            layer.trainable = False
        
        # Recompile with lower learning rate
        self.model.compile(
            optimizer=Adam(learning_rate=self.learning_rate/10),
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        train_gen, val_gen = self.prepare_data(train_path, val_path)
        
        history = self.model.fit(
            train_gen,
            epochs=epochs,
            validation_data=val_gen,
            callbacks=[
                ModelCheckpoint(
                    'models/chili_disease_model_finetuned.h5',
                    save_best_only=True,
                    monitor='val_accuracy',
                    mode='max'
                )
            ]
        )
        
        return history
    
    def load_model(self, model_path):
        """Load trained model"""
        self.model = tf.keras.models.load_model(model_path)
        return self.model
    
    def predict(self, image_path):
        """Prediksi single image"""
        if self.model is None:
            self.load_model(os.getenv('MODEL_PATH', 'models/chili_disease_model.h5'))
        
        img = tf.keras.preprocessing.image.load_img(
            image_path, 
            target_size=(self.img_size, self.img_size)
        )
        img_array = tf.keras.preprocessing.image.img_to_array(img)
        img_array = tf.expand_dims(img_array, 0) / 255.0
        
        predictions = self.model.predict(img_array)
        predicted_class = self.classes[np.argmax(predictions[0])]
        confidence = float(np.max(predictions[0]))
        
        return {
            'prediction': predicted_class,
            'confidence': confidence,
            'all_predictions': {
                self.classes[i]: float(predictions[0][i]) 
                for i in range(len(self.classes))
            }
        }
    
    def plot_training_history(self, history):
        """Plot training history"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
        
        ax1.plot(history.history['accuracy'])
        ax1.plot(history.history['val_accuracy'])
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend(['Train', 'Validation'])
        
        ax2.plot(history.history['loss'])
        ax2.plot(history.history['val_loss'])
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend(['Train', 'Validation'])
        
        plt.tight_layout()
        plt.savefig('models/training_history.png')
        plt.show()

if __name__ == "__main__":
    # Initialize model
    model = ChiliDiseaseModel()
    
    # Train model with correct absolute paths
    train_path = '../../datasetImage/train'
    val_path = '../../datasetImage/val'
    
    print("=" * 50)
    print("CHILI DISEASE DETECTION MODEL TRAINING")
    print("=" * 50)
    print(f"Training data path: {os.path.abspath(train_path)}")
    print(f"Validation data path: {os.path.abspath(val_path)}")
    print(f"Image size: {model.img_size}x{model.img_size}")
    print(f"Number of classes: {model.num_classes}")
    print(f"Classes: {model.classes}")
    print("=" * 50)
    
    try:
        print("Starting training...")
        history = model.train(train_path, val_path, epochs=25)
        
        # Plot results
        print("Training completed! Plotting results...")
        model.plot_training_history(history)
        
        # Test prediction with a sample image
        test_path = '../../datasetImage/test/healthy'
        test_images = [f for f in os.listdir(test_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        if test_images:
            test_image = os.path.join(test_path, test_images[0])
            print(f"\nTesting prediction with: {test_image}")
            result = model.predict(test_image)
            print(f"Prediction: {result['prediction']}")
            print(f"Confidence: {result['confidence']:.3f}")
            print("All predictions:")
            for class_name, confidence in result['all_predictions'].items():
                print(f"  {class_name}: {confidence:.3f}")
        
        print("\n" + "=" * 50)
        print("TRAINING COMPLETED SUCCESSFULLY!")
        print("Model saved as: models/chili_disease_model.h5")
        print("=" * 50)
        
    except Exception as e:
        print(f"Error during training: {str(e)}")
        import traceback
        traceback.print_exc()
