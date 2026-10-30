# Chest X-ray Diagnostic System

This repository contains a compact prototype for a chest X-ray classification dashboard built with a Flask backend and a Vite/React frontend. The codebase is small, local-only, and intended for a demonstration/inference workflow.

## Current repository status

This workspace does not contain the trained model file required for inference. The backend expects a file named `model_multiclass_v1.h5` at the project root, but no `.h5` model artifact is present in the repository. The code also does not include training scripts, dataset loaders, or evaluation notebooks. Because the model file is missing, the project has not been fully validated end-to-end in this workspace.

## Repository map

- Backend: [backend/app.py](backend/app.py)
- Backend deps: [backend/requirements.txt](backend/requirements.txt)
- Frontend app: [frontend/index.html](frontend/index.html)
- Frontend entry: [frontend/src/main.jsx](frontend/src/main.jsx)
- Frontend app state: [frontend/src/App.jsx](frontend/src/App.jsx)
- UI components: [frontend/src/components](frontend/src/components)
- Frontend package manifest: [frontend/package.json](frontend/package.json)
- Project docs: [ML_MODEL.md](ML_MODEL.md), [BACKEND.md](BACKEND.md), [FRONTEND.md](FRONTEND.md), [PROJECT_AUDIT.md](PROJECT_AUDIT.md)

## Verified implementation facts

- The backend is a single Flask app using `POST /predict`.
- The model is loaded dynamically from `backend/../model_multiclass_v1.h5`.
- The app accepts a single uploaded image, converts it to grayscale, resizes it to 224 x 224, normalizes it to `0..1`, and predicts across four classes.
- The frontend is a single-page React application that posts a multipart form to `http://localhost:5000/predict`.
- The backend generates a heatmap image with OpenCV, returns it as a base64-encoded PNG data URL, and the frontend renders it in tabs.
- There is no database, no authentication, no `.env` configuration, and no external service integration in the repository.

## Major evidence gaps

- Missing trained model file (`*.h5`).
- Missing dataset folder or preprocessing scripts.
- Missing training pipeline or evaluation scripts.
- README references a different model name than the backend code (`xray_model.h5` vs `model_multiclass_v1.h5`).
- The project includes a backup file, [frontend/src/components/ResultPanel.jsx.bak](frontend/src/components/ResultPanel.jsx.bak), which appears to be an abandoned duplicate artifact.

## Important note for future work

This repository is best treated as an inference prototype and documentation archive, not as a fully reproducible training project. The next major step is to recover or regenerate the missing model artifact and verify the environment before any major-project extension is attempted.

## Documentation set

- [ML_MODEL.md](ML_MODEL.md) — model and training evidence audit.
- [BACKEND.md](BACKEND.md) — Flask API and server behavior.
- [FRONTEND.md](FRONTEND.md) — frontend structure and user flow.
- [PROJECT_AUDIT.md](PROJECT_AUDIT.md) — repository-wide technical audit and recommendations.
