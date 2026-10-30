# Machine Learning Model Audit

## Scope and evidence status

This document records only information that is directly supported by repository files. Where the code does not reveal a fact, that fact is marked as unverified.

## Model file and loading path

The backend loads the model using the following path in [backend/app.py](backend/app.py):

- `MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'model_multiclass_v1.h5'))`

The repository root does not contain any `*.h5` file. The repository listing and `file_search` results found no model artifact, so the model is currently missing from the workspace.

### Inferred status

- Found in code: backend expects a saved TensorFlow Keras model in H5 format.
- Found in documentation: README mentions a file named `xray_model.h5`, which differs from the runtime path in the code.
- Not verified: the actual model architecture, training weights, and final saved checkpoint.

## Classes

The backend defines four output classes in [backend/app.py](backend/app.py):

- `COVID`
- `Normal`
- `Pneumonia`
- `Tuberculosis`

This is the only direct evidence of the output label space in the code.

## Input pipeline

The prediction code in [backend/app.py](backend/app.py) performs the following steps for each uploaded image:

1. Open the uploaded file with PIL.
2. Convert to grayscale using `Image.open(file.stream).convert('L')`.
3. Resize to `(224, 224)`.
4. Convert to a NumPy array.
5. Normalize pixel values as `gray_arr.astype('float32') / 255.0`.
6. Add a singleton channel dimension to form `(224, 224, 1)`.
7. Add the batch dimension to form `(1, 224, 224, 1)`.
8. Pass the array to `model.predict(x_input)`.

This indicates the expected model input is a single-channel grayscale image with spatial dimensions of 224 x 224.

## Architecture evidence

The exact CNN architecture cannot be recovered from the repository because the saved model file is absent and no model-building source code is present. The backend does not define the layers, optimizer, or training code directly.

The code does, however, reveal the following:

- The model is loaded via `tf.keras.models.load_model(...)`.
- The backend invokes `model.predict(dummy)` on a dummy array of shape `(1, 224, 224, 1)` during startup to verify model usability.
- The model outputs an array of size equal to the label count, then uses `np.argmax` to pick the predicted class.

## Preprocessing and normalization

The code performs only these transformations before inference:

- Grayscale conversion
- Resize to 224 x 224
- `float32` conversion
- Division by 255.0
- Channel expansion

No histogram equalization, CLAHE, lung segmentation, or intensity rescaling other than min-max normalization to `[0, 1]` is evidenced in the code.

## Activation and loss functions

These are not directly recoverable from the repository.

- Found in code: classification uses `np.argmax` on the probability vector and not a custom activation layer.
- Unverified: final activation function, loss function, optimizer, and training epochs/batch size.

The app does not include a training script or `model.compile(...)` definition for inspection.

## Dataset evidence

The repository does not contain:

- A training script
- A validation script
- A dataset loader
- A dataset directory
- A metadata file listing class counts
- A preprocessing script

There are sample images at the project root (`test.jpg`, `test1.jpeg`, `test3.png`), but these are only test inputs and not a dataset manifest.

The `.gitignore` file references dataset folders named `final_dataset/` and `datasets/`, but those folders are not present in the workspace. This indicates that dataset artifacts may have been intentionally excluded or discarded.

## Dataset size and split

Not verifiable from the repository.

No evidence is available for:

- Total image counts per class
- Train/validation/test split proportions
- Class balance
- Patient-level splitting

## Data augmentation

No augmentation is implemented in the visible codebase.

The inference path does not include augmentation. There is no training script to confirm whether augmentation was used during model development.

## Evaluation metrics

No metrics or evaluation report is included in the repository.

No scripts or outputs were found for:

- Accuracy
- Precision
- Recall
- F1-score
- ROC-AUC
- Confusion matrix
- Loss curves

## Saved model format and loading procedure

The backend does the following:

- `tf.keras.models.load_model(MODEL_PATH)`
- If loading fails, it stores the exception string in `load_error` and returns `500` on `/predict`

This confirms the saved model is expected to be a TensorFlow Keras H5 model. The exact format and compatibility version are not verifiable without the actual saved file.

## Explainability and heatmap implementation

The backend contains a custom heatmap function in [backend/app.py](backend/app.py):

- `make_cv2_heatmap(gray_img)`
- Applies Gaussian blur to the grayscale image
- Uses Canny edge detection
- Blends the blurred result and edges
- Normalizes pixel values to 0..255
- Applies `cv2.COLORMAP_INFERNO`
- Applies a second Gaussian blur for smoothing

The resulting heatmap is then overlaid onto the original grayscale image using OpenCV and returned as a base64 PNG data URL.

This is a custom visualization, not a Grad-CAM implementation. No `tf-keras-vis`, `grad-cam`, or SHAP-based explainability library is present in the repository.

## Documentation vs code

### Information found in code

- Four classes: COVID, Normal, Pneumonia, Tuberculosis
- 224 x 224 single-channel input
- grayscale-only preprocessing
- H5 model loading via TensorFlow
- OpenCV-based heatmap generation

### Information found in documentation

- README describes a UI with heatmap tabs and dashboard features.
- README says a TensorFlow model named `xray_model.h5` is required.
- README states a modern React + Vite UI and Flask backend.

### Information that cannot be verified

- Model architecture
- Training configuration
- Dataset source and size
- Train/validation/test split
- Performance metrics
- Whether the model was actually trained for the same class set described in the backend

## Overall assessment

The ML implementation is partially visible at inference time, but the training pipeline and saved weights are absent. The current repository is sufficient for understanding the frontend/backend contract and preprocessing assumptions, but it is not sufficient to reconstruct a trustworthy ML lifecycle or to reproduce training results.
