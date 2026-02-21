import os
import base64
from PIL import Image
import numpy as np
import cv2
import tensorflow as tf
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ---------------- MODEL LOAD ----------------
MODEL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', 'model_multiclass_v1.h5')
)

model = None
load_error = None

try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded from:", MODEL_PATH)

    dummy = np.zeros((1,224,224,1), dtype=np.float32)
    model.predict(dummy)

except Exception as e:
    load_error = str(e)
    print("Model load failed:", load_error)


# ---------------- LABEL MAP ----------------
CLASS_LABELS = [
    "COVID",
    "Normal",
    "Pneumonia",
    "Tuberculosis"
]


# ---------------- ENHANCED HEATMAP ----------------
def make_cv2_heatmap(gray_img):
    # Smooth the original grayscale to reduce noise
    blur = cv2.GaussianBlur(gray_img, (31, 31), 0)

    # Detect structural edges for emphasis
    edges = cv2.Canny(gray_img, 40, 120)

    # Combine blurred image with edges
    combined = cv2.addWeighted(blur, 0.7, edges, 0.3, 0)

    # Stretch to full 0-255 range
    combined = cv2.normalize(combined, None, 0, 255, cv2.NORM_MINMAX)

    # Optional contrast boost
    combined = cv2.convertScaleAbs(combined, alpha=1.5, beta=0)

    # Apply an inferno colormap (more visually pleasing than JET)
    heatmap_color = cv2.applyColorMap(combined, cv2.COLORMAP_INFERNO)

    # Mild smoothing after color mapping to reduce harsh transitions
    heatmap_color = cv2.GaussianBlur(heatmap_color, (7, 7), 0)

    return heatmap_color


# ---------------- PREDICT ----------------
@app.route('/predict', methods=['POST'])
def predict():

    if model is None:
        return jsonify({'error': load_error}), 500

    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    file = request.files['image']

    try:
        img = Image.open(file.stream).convert('L')
    except Exception as e:
        return jsonify({'error': str(e)}), 400

    img_resized = img.resize((224, 224))
    gray_arr = np.array(img_resized)

    # ---------- INPUT ----------
    x = gray_arr.astype('float32') / 255.0
    x = np.expand_dims(x, axis=-1)
    x_input = np.expand_dims(x, axis=0)

    # ---------- PREDICTION ----------
    preds = model.predict(x_input)[0]

    # construct full probability dictionary
    probs = {CLASS_LABELS[i]: float(preds[i]) for i in range(len(CLASS_LABELS))}
    # round each probability to 4 decimal places for output
    rounded_probs = {k: round(v, 4) for k, v in probs.items()}

    class_index = int(np.argmax(preds))
    label = CLASS_LABELS[class_index]
    confidence = rounded_probs[label]

    # ---------- HEATMAP ----------
    heatmap_color = make_cv2_heatmap(gray_arr)

    # overlay with reduced intensity and maintain same size
    overlay = cv2.addWeighted(
        cv2.cvtColor(gray_arr, cv2.COLOR_GRAY2BGR),
        0.6,
        heatmap_color,
        0.35,
        0
    )

    # Upscale for frontend clarity
    overlay = cv2.resize(overlay, (512, 512), interpolation=cv2.INTER_CUBIC)

    success, png = cv2.imencode('.png', overlay)
    heat_b64 = 'data:image/png;base64,' + base64.b64encode(png.tobytes()).decode('utf-8')

    # rule-based summary text
    if label == 'Pneumonia':
        summary = (
            "Findings suggest opacity or consolidation patterns, "
            "typically in lower lung zones. "
            "This system is intended for research and educational use only."
        )
    elif label == 'Tuberculosis':
        summary = (
            "Findings suggest upper-lobe involvement and cavitary lesions. "
            "This system is intended for research and educational use only."
        )
    elif label == 'COVID':
        summary = (
            "Findings suggest bilateral ground-glass opacities. "
            "This system is intended for research and educational use only."
        )
    elif label == 'Normal':
        summary = (
            "No abnormal radiographic findings detected. "
            "This system is intended for research and educational use only."
        )
    else:
        summary = "This system is intended for research and educational use only."

    return jsonify({
        'prediction': label,
        'confidence': confidence,
        'heatmap': heat_b64,
        'probabilities': rounded_probs,
        'summary': summary
    })


# ---------------- RUN ----------------
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
