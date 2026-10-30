# Backend Documentation

## Technology stack

The backend is a single-file Flask application located at [backend/app.py](backend/app.py). It uses:

- Flask
- Flask-CORS
- TensorFlow Keras
- OpenCV
- NumPy
- Pillow

## Runtime entry point

The backend starts with:

```bash
python backend/app.py
```

The app is configured to run on:

- Host: `127.0.0.1`
- Port: `5000`
- Mode: `debug=True`

## Application bootstrap

At startup, [backend/app.py](backend/app.py) does the following:

1. Creates a Flask app instance.
2. Enables CORS with `CORS(app)`.
3. Resolves a model path at the repository root: `../model_multiclass_v1.h5`.
4. Calls `tf.keras.models.load_model(MODEL_PATH)`.
5. Tests the model by running a dummy prediction on a `(1, 224, 224, 1)` array.
6. Stores an error message in `load_error` if loading fails.

## Model loading status

The repository currently does not include any `.h5` file. This means the backend can load no model in the current workspace. The `/predict` route returns an error if `model` is `None`.

## Label definition

The backend defines the class list as:

```python
CLASS_LABELS = [
    "COVID",
    "Normal",
    "Pneumonia",
    "Tuberculosis"
]
```

## Heatmap function

The backend includes a custom function named `make_cv2_heatmap(gray_img)`.

It creates a heatmap-like visualization by:

- Gaussian blur of the grayscale image
- Canny edge detection
- Weighted combination of blur and edges
- Normalization to pixel range 0..255
- Contrast scaling
- OpenCV color map `COLORMAP_INFERNO`
- Additional Gaussian blur for smoothing

This is not Grad-CAM and not derived from the model’s gradients. It is a handcrafted image attention visualization.

## API routes

### POST /predict

This is the only visible API route in the backend.

#### Method

- `POST`

#### Input

The route expects a multipart upload with a file field named `image`.

Example:

```http
Content-Type: multipart/form-data
```

Form field:

- `image`: uploaded image file

#### Validation

The route performs the following checks:

- If no model is loaded, returns `500` with the exception string from loading.
- If the `image` field is missing, returns `400` with `{"error": "No image provided"}`.
- If PIL cannot open the uploaded image, returns `400` with the underlying exception string.

#### Preprocessing steps

Inside the route:

1. Open file as grayscale with PIL.
2. Resize to 224 x 224.
3. Convert to NumPy array.
4. Normalize pixel values with `/ 255.0`.
5. Add a channel dimension.
6. Add a batch dimension.
7. Call `model.predict(...)`.

#### Prediction output

The backend returns a JSON object containing:

- `prediction`: class label
- `confidence`: probability for the winning class
- `heatmap`: base64-encoded PNG data URL
- `probabilities`: dictionary of all classes with rounded probabilities
- `summary`: rule-based text summary for the predicted class

Example structure:

```json
{
  "prediction": "COVID",
  "confidence": 0.9342,
  "heatmap": "data:image/png;base64,...",
  "probabilities": {
    "COVID": 0.9342,
    "Normal": 0.0123,
    "Pneumonia": 0.0211,
    "Tuberculosis": 0.0324
  },
  "summary": "Findings suggest bilateral ground-glass opacities. This system is intended for research and educational use only."
}
```

#### Summary rules

The code assigns a fixed explanatory summary based on the predicted label:

- `Pneumonia`: suggests opacity or consolidation patterns
- `Tuberculosis`: suggests upper-lobe involvement and cavitary lesions
- `COVID`: suggests bilateral ground-glass opacities
- `Normal`: indicates no abnormal findings

These are not model-derived explanations; they are static text templates.

## Error behavior

The backend does not include structured logging, a health endpoint, or a metrics endpoint. Error responses are minimal JSON responses with either:

- `{"error": ...}`
- `500` for model loading issues
- `400` for missing or unreadable image input

## Security and deployment notes

- No authentication is implemented.
- No database is used.
- No environment variables are read from the repository.
- CORS is enabled for local development only.
- The app binds to a loopback address, not a public network interface.

## Architecture notes

The backend is intentionally simple:

- one entry file
- one inference route
- one custom visualization function
- no service layer separation
- no training pipeline
- no persistence layer

## Risks and issues

- Missing model file prevents actual prediction.
- Model mismatch with README naming (`xray_model.h5` vs `model_multiclass_v1.h5`).
- The app assumes grayscale input and does not validate image dimensions beyond resizing.
- The route returns a heatmap only for the uploaded image, with no per-class saliency map or explanation object.
- The code appears to be designed as a prototype, not a production-grade backend.

## Mermaid flow

```mermaid
flowchart LR
    A[Client upload] --> B[Flask /predict]
    B --> C[Open and grayscale image]
    C --> D[Resize to 224x224]
    D --> E[Normalize and expand dims]
    E --> F[TensorFlow model inference]
    F --> G[Argmax + confidence]
    G --> H[OpenCV heatmap generation]
    H --> I[JSON response]
    I --> J[Frontend render]
```
