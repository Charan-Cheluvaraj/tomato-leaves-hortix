import os
import json
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# Configurations
DATA_DIR = 'data/train'
MODEL_PATH = 'models/plant_model.h5'
CLASS_NAMES_PATH = 'models/class_names.json'
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10

def main():
    # Make sure the models directory exists
    os.makedirs('models', exist_ok=True)

    if not os.path.exists(DATA_DIR):
        print(f"Error: {DATA_DIR} directory does not exist.")
        return

    # Data Generator with data augmentation
    datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        validation_split=0.2  # 80/20 split
    )

    # Check if there are any folders/images
    try:
        train_generator = datagen.flow_from_directory(
            DATA_DIR,
            target_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            class_mode='categorical',
            subset='training'
        )
        
        val_generator = datagen.flow_from_directory(
            DATA_DIR,
            target_size=IMG_SIZE,
            batch_size=BATCH_SIZE,
            class_mode='categorical',
            subset='validation'
        )
    except Exception as e:
        print(f"Error loading images: {e}")
        return

    if train_generator.samples == 0:
        print(f"No images found for training in '{DATA_DIR}'.")
        print("Please ensure you have at least 3 subfolders with images inside.")
        return

    # Save class names to a JSON file
    # train_generator.class_indices is a dict like {'Corn_Healthy': 0, 'Corn_Rust': 1, ...}
    class_indices = train_generator.class_indices
    class_names = {str(v): k for k, v in class_indices.items()}
    
    with open(CLASS_NAMES_PATH, 'w') as f:
        json.dump(class_names, f, indent=4)
    print(f"Saved class names to {CLASS_NAMES_PATH}: {class_names}")

    num_classes = len(class_indices)

    # Initialize MobileNetV2 base model
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(224, 224, 3)
    )
    
    # Freeze the base model to only train the top layers
    base_model.trainable = False

    # Build the complete model
    model = Sequential([
        base_model,
        GlobalAveragePooling2D(),
        Dense(128, activation='relu'),
        Dense(num_classes, activation='softmax')
    ])

    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    model.summary()

    # Train the model
    print("Starting training with Transfer Learning (MobileNetV2)...")
    model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=EPOCHS
    )

    # Save the final model
    model.save(MODEL_PATH)
    print(f"\nModel successfully saved to: {MODEL_PATH}")

if __name__ == '__main__':
    main()
