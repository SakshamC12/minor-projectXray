# AI Chest X-ray Diagnostic Dashboard

A polished full-stack web application for AI-assisted chest X-ray analysis. Combines a Flask backend with TensorFlow model inference and a modern React+Vite frontend.

## Features

- **Professional Medical Dashboard UI**: Two-column layout with real-time predictions
- **Advanced Visualizations**:
  - Tabbed image viewer (Original, Heatmap, Overlay)
  - Animated confidence progress bar
  - Visual attention heatmap with Gaussian blur + JET colormap
- **Loading Animations**: Staged text messages during analysis
- **Dark Theme**: Navy/cyan color scheme optimized for medical imaging
- **Drag-and-Drop**: Intuitive image upload with preview
- **Responsive Design**: Desktop-first, works on tablets

## Project Structure

```
minorproject/
 ├─ xray_model.h5                 # Pre-trained TensorFlow model (224x224 input)
 ├─ backend/
 │   ├─ app.py                    # Flask server (port 5000)
 │   └─ requirements.txt           # Python dependencies
 ├─ frontend/
 │   ├─ src/
 │   │   ├─ App.jsx               # Main app/state management
 │   │   ├─ main.jsx              # React entry point
 │   │   ├─ styles.css            # Professional dashboard styling
 │   │   └─ components/
 │   │       ├─ ImageUpload.jsx   # Upload & drag-drop area
 │   │       ├─ ResultPanel.jsx   # Prediction results & tabs
 │   │       └─ ProgressBar.jsx   # Confidence score bar
 │   ├─ index.html
 │   └─ package.json
 └─ README.md
```

## Backend Setup

### Prerequisites
- Python 3.8+
- TensorFlow model file (`xray_model.h5`)

### Installation & Run

```bash
# Navigate to project root
cd C:\minorproject

# Create and activate virtual environment
python -m venv venv
venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend/requirements.txt

# Run Flask server (localhost:5000)
python backend/app.py
```

The backend will:
1. Load your TensorFlow model from `../xray_model.h5`
2. Accept image uploads via POST `/predict`
3. Return JSON with:
   - `prediction`: "Normal" or "Abnormal"
   - `confidence`: float (0-1)
   - `heatmap`: base64-encoded PNG with overlay

### API Endpoint

**POST** `/predict`

Request:
```
Content-Type: multipart/form-data
Body: { image: <file> }
```

Response:
```json
{
  "prediction": "Normal",
  "confidence": 0.92,
  "heatmap": "data:image/png;base64,..."
}
```

## Frontend Setup

### Prerequisites
- Node.js 16+ and npm

### Installation & Run

```bash
# Navigate to frontend directory
cd C:\minorproject\frontend

# Install dependencies
npm install

# Run development server (localhost:5173)
npm run dev

# Build for production
npm run build
```

Access the dashboard at `http://localhost:5173`

## Usage

1. **Start Backend**: Run `python backend/app.py` (port 5000)
2. **Start Frontend**: Run `npm run dev` (port 5173)
3. **Upload Image**: Drag-and-drop or click the upload area
4. **Analyze**: Click "Analyze Image" button
5. **View Results**:
   - Prediction label (Normal/Abnormal)
   - Confidence percentage with progress bar
   - Tabbed viewer for heatmap visualizations

## Architecture

- **Left Column**: Image upload, drag-and-drop, preview, analyze controls
- **Right Column**: Real-time prediction results, confidence metrics, heatmap tabs
- **Staging Messages**: Animated text during analysis (0.8s intervals)
- **Progress Bar**: Smoothly animates to confidence percentage (600ms)
- **Heatmap Generation**: Backend applies Gaussian blur + JET colormap

## Styling

- **Colors**:
  - Background: Deep navy (#0b1220)
  - Cards: Dark gray (#141c2f)
  - Accents: Cyan (#1fb6ff) / Teal (#0da9a3)
  - Normal: Green (#22c55e)
  - Abnormal: Red (#ff5757)
- **Effects**: Subtle glows, smooth shadows, rounded corners
- **Animations**: Spinner, pulse, progress fill, fade-ins

## No Database

- Stateless API (no persistence)
- Results kept in frontend session memory
- Model predictions generated on-demand

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support

## Contact & Notes

- Built for local demonstration
- Requires valid TensorFlow model (H5 format)
- Optimized for desktop displays
- CORS enabled for development
