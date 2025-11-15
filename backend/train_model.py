import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
import os

# Dataset paths
train_dir = 'dataset/TRAIN'
test_dir = 'dataset/TEST'

# Check folders exist
if not os.path.exists(train_dir) or not os.path.exists(test_dir):
    print("❌ Dataset folders not found.")
    exit()

# Data preprocessing and augmentation
datagen = ImageDataGenerator(
    rescale=1.0/255,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True
)

train_set = datagen.flow_from_directory(
    train_dir,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical'
)

test_set = datagen.flow_from_directory(
    test_dir,
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical'
)

print("✅ Detected classes:", train_set.class_indices)

# Build model using MobileNetV2
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation='relu')(x)
predictions = Dense(train_set.num_classes, activation='softmax')(x)
model = Model(inputs=base_model.input, outputs=predictions)

# Freeze base layers
for layer in base_model.layers:
    layer.trainable = False

# Compile
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Train
print("🚀 Training model...")
model.fit(train_set, epochs=10, validation_data=test_set)

# Evaluate
loss, acc = model.evaluate(test_set)
print(f"✅ Test Accuracy: {acc*100:.2f}%")

# Save
os.makedirs('model', exist_ok=True)
model.save('model/waste_classifier.h5')
print("🎉 Model saved at model/waste_classifier.h5")
