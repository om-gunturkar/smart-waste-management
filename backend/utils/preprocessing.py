import cv2
import numpy as np
from PIL import Image

def preprocess_image(image_bytes):
    image = Image.open(image_bytes).convert('RGB')
    image = image.resize((224, 224))
    img_array = np.array(image) / 255.0
    return np.expand_dims(img_array, axis=0)
