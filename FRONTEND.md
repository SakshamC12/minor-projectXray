# Frontend documentation

## Technology and entry points

The frontend is a React 18 single-page application built with Vite. Its dependencies remain React, React DOM, and Vite.

- HTML shell: [frontend/index.html](frontend/index.html)
- Application bootstrap: [frontend/src/main.jsx](frontend/src/main.jsx)
- App state and API request: [frontend/src/App.jsx](frontend/src/App.jsx)
- Upload panel: [frontend/src/components/ImageUpload.jsx](frontend/src/components/ImageUpload.jsx)
- Result and comparison panel: [frontend/src/components/ResultPanel.jsx](frontend/src/components/ResultPanel.jsx)
- Client-side heatmap blending: [frontend/src/components/HeatmapBlend.jsx](frontend/src/components/HeatmapBlend.jsx)
- Probability bar: [frontend/src/components/ProgressBar.jsx](frontend/src/components/ProgressBar.jsx)
- Dashboard styles: [frontend/src/styles.css](frontend/src/styles.css)
- Vite-served reference image: [frontend/public/normal-reference.jpeg](frontend/public/normal-reference.jpeg)

## User flow

1. Select an image by browsing or dragging and dropping it into the upload area. The image is previewed locally.
2. Select **Run analysis** to send the image as multipart field `image` to `POST http://localhost:5000/predict`.
3. The app displays the returned prediction, all four class probabilities, model confidence, and any backend-provided summary.
4. The comparison area defaults to three panels: the normal reference, the uploaded patient image, and a client-side blend of the patient image with the backend's returned heatmap. A comparison-mode switch instead shows one composite: the normal reference as its base with chromatic information from the patient's returned heatmap visualization transferred onto it.
5. In reference-comparison mode, the transferred heatmap layer is centred and contained within the reference image viewport without stretching. The 0–100 slider is shared between modes and labelled **Transferred heatmap opacity** in this mode. At 0% only the normal reference is shown; at 100% the extracted chromatic layer is drawn at full opacity. Moving the slider makes no API request. Selecting a different image clears the prior result and resets the slider.

The reference asset is served by Vite from the configured base path as `normal-reference.jpeg`. No image registration or difference map is applied.

## Backend compatibility

The frontend retains the existing Flask endpoint, multipart field, and response names. It expects a JSON object with `prediction`, `confidence`, `probabilities`, `summary`, and `heatmap`. Probability and confidence values are displayed as percentages from the backend's 0–1 values; no classification calculation is performed in the frontend.

The current heatmap is a handcrafted OpenCV visualisation returned by the existing backend, not Grad-CAM or a clinically validated localisation. The API returns an image after applying an Inferno colormap and blending it with the patient image; it does not return a raw spatial mask. `ReferenceHeatmapTransfer.jsx` extracts chromatic information from that composite image and derives transparency from saturation. This experimental transfer has no reliable anatomical correspondence to the reference and must not be interpreted as a finding on the reference image. The canvas compositor is isolated so a genuine heatmap source can replace it later without changing the comparison component.

## Status and limitations

- The frontend retains the existing local backend URL at `http://localhost:5000/predict`; no backend URL or API configuration was changed.
- Backend-unavailable, unreadable-response, and HTTP error states are shown in the result panel.
- The backend's generated summary is displayed as unverified, automatically generated text and is explicitly not presented as a radiology report.
- The reference image and transferred colors are illustrative only and are not a patient-specific diagnostic comparison.
- The API does not include schema versioning or explainability metadata. The visualization is not evidence that the highlighted pixels are medically meaningful.
