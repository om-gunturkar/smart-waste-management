from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import os
from utils.preprocessing import preprocess_image

app = Flask(__name__)
CORS(app)

MODEL_PATH = "model/waste_classifier.h5"
model = tf.keras.models.load_model(MODEL_PATH)
labels = ['Organic', 'Recyclable']  # O = Organic, R = Recyclable


UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    img_array = preprocess_image(file.stream)
    prediction = model.predict(img_array)
    predicted_label = labels[np.argmax(prediction)]

    return jsonify({
        'waste_type': predicted_label,
        'confidence': f"{np.max(prediction) * 100:.2f}%"
    })

if __name__ == '__main__':
    app.run(debug=True)
