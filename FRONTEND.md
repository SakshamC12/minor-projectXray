# Frontend documentation

## Technology and entry points

The frontend is a React 18 single-page application built with Vite. Its dependencies remain React, React DOM, and Vite.

- HTML shell: [frontend/index.html](frontend/index.html)
- Application bootstrap: [frontend/src/main.jsx](frontend/src/main.jsx)
- App state and API request: [frontend/src/App.jsx](frontend/src/App.jsx)
- Upload panel: [frontend/src/components/ImageUpload.jsx](frontend/src/components/ImageUpload.jsx)
- Result and comparison panel: [frontend/src/components/ResultPanel.jsx](frontend/src/components/ResultPanel.jsx)
- Interpretation and reasoning prototype: [frontend/src/components/ReasoningPanel.jsx](frontend/src/components/ReasoningPanel.jsx)
- Demonstration copy and planned capabilities: [frontend/src/data/reasoningPrototype.js](frontend/src/data/reasoningPrototype.js)
- Client-side heatmap blending: [frontend/src/components/HeatmapBlend.jsx](frontend/src/components/HeatmapBlend.jsx)
- Probability bar: [frontend/src/components/ProgressBar.jsx](frontend/src/components/ProgressBar.jsx)
- Dashboard styles: [frontend/src/styles.css](frontend/src/styles.css)
- Vite-served reference image: [frontend/public/normal-reference.jpeg](frontend/public/normal-reference.jpeg)

## User flow

1. Select an image by browsing or dragging and dropping it into the upload area. The image is previewed locally.
2. Select **Run analysis** to send the image as multipart field `image` to `POST http://localhost:5000/predict`.
3. The app displays the returned prediction, all four class probabilities, model confidence, and any backend-provided summary.
4. After a successful prediction, the interpretation prototype appears below the image comparison. It separates live backend prediction output from static demonstration text and planned reasoning capabilities. The persistent notice identifies that no reasoning engine is implemented; the section is collapsed by default and can be expanded.
5. Supporting evidence identifies what is available, pending, or unavailable. The limitations area calls out uncalibrated confidence, missing model clinical context, the handcrafted heatmap, and absent clinical validation.
6. Additional clinical information fields are local UI demonstrations only; they are not included in the existing Flask request and do not influence prediction.
7. The comparison area defaults to three panels: the normal reference, the uploaded patient image, and a client-side blend of the patient image with the backend's returned heatmap. Reference Comparison instead shows a single illustrative composite with the normal reference as its base and chromatic information transferred from the patient's returned visualization. It is not anatomically registered.
8. The 0–100 heatmap slider is shared between modes. In Reference Comparison it is labelled **Transferred heatmap opacity**; 0% shows only the reference and 100% draws the extracted chromatic layer at full opacity. Moving the slider makes no API request. Selecting a different image clears the prior result and resets the slider.

The reference asset is served by Vite from the configured base path as `normal-reference.jpeg`. No image registration or difference map is applied.

## Backend compatibility

The frontend retains the existing Flask endpoint, multipart field, and response names. It expects a JSON object with `prediction`, `confidence`, `probabilities`, `summary`, and `heatmap`. Probability and confidence values are displayed as percentages from the backend's 0–1 values; no classification calculation is performed in the frontend.

The current heatmap is a handcrafted OpenCV visualisation returned by the existing backend, not Grad-CAM or a clinically validated localisation. The API returns an image after applying an Inferno colormap and blending it with the patient image; it does not return a raw spatial mask. `ReferenceHeatmapTransfer.jsx` extracts chromatic information from that composite image and derives transparency from saturation. This experimental transfer has no reliable anatomical correspondence to the reference and must not be interpreted as a finding on the reference image. The canvas compositor is isolated so a genuine heatmap source can replace it later without changing the comparison component.

The backend's existing `summary` field contains rule-based narrative text, not model reasoning. The frontend does not show that text because it can read as specific radiological findings despite not being independently verified.

The frontend prototype does not call a reasoning endpoint. Static copy is kept separately in `reasoningPrototype.js`; live classification remains sourced from the existing prediction response. Clinical information inputs remain local to `ReasoningPanel.jsx`. The entire interpretation section is hidden until a successful result exists and is removed when a new image is selected or analysis fails.

## Status and limitations

- The frontend retains the existing local backend URL at `http://localhost:5000/predict`; no backend URL or API configuration was changed.
- Backend-unavailable, unreadable-response, and HTTP error states are shown in the result panel.
- The backend's generated summary is displayed as unverified, automatically generated text and is explicitly not presented as a radiology report.
- The reference image and transferred colors are illustrative only and are not a patient-specific diagnostic comparison.
- The API does not include schema versioning or explainability metadata. The visualization is not evidence that the highlighted pixels are medically meaningful.
