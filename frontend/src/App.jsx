import React, { useEffect, useRef, useState } from 'react'
import ImageUpload from './components/ImageUpload'
import ResultPanel from './components/ResultPanel'

const CLASS_LABELS = ['COVID', 'Normal', 'Pneumonia', 'Tuberculosis']

export default function App() {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const previewUrlRef = useRef(null)

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
  }, [])

  function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
      setError('Choose a supported image file to continue.')
      return
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    setUploadedFile(file)
    const url = URL.createObjectURL(file)
    previewUrlRef.current = url
    setPreviewUrl(url)
    setResult(null)
    setError(null)
  }

  function handleClear() {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = null
    setUploadedFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
  }

  async function handleAnalyze() {
    if (!uploadedFile) return
    setLoading(true)
    setResult(null)
    setError(null)

    const formData = new FormData()
    formData.append('image', uploadedFile)

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      })
      let data
      try {
        data = await response.json()
      } catch {
        throw new Error('The analysis service returned an unreadable response. Check that the Flask backend is running.')
      }

      if (!response.ok) {
        throw new Error(data?.error || `Analysis failed (HTTP ${response.status}).`)
      }
      if (
        !data ||
        typeof data !== 'object' ||
        !CLASS_LABELS.includes(data.prediction) ||
        !Number.isFinite(data.confidence) ||
        !data.probabilities ||
        !CLASS_LABELS.every((label) => Number.isFinite(data.probabilities[label])) ||
        typeof data.heatmap !== 'string'
      ) {
        throw new Error('The analysis service returned an incomplete response. Check that the Flask backend is up to date.')
      }
      setResult(data)
    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'Unable to reach the Flask backend. Start the backend and confirm it is available at http://localhost:5000.'
          : err.message || 'Analysis failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="brand-mark" aria-hidden="true">XR</div>
          <div>
            <h1 className="logo">Chest X-ray Review</h1>
            <p className="tagline">Machine-learning research interface</p>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          <div className="column column-left">
            <ImageUpload
              previewUrl={previewUrl}
              file={uploadedFile}
              onFileSelect={handleFileSelect}
              onAnalyze={handleAnalyze}
              onClear={handleClear}
              isLoading={loading}
            />
          </div>

          <div className="column column-right">
            <ResultPanel
              result={result}
              loading={loading}
              error={error}
              originalSrc={previewUrl}
            />
          </div>
        </div>
      </main>
      <footer className="dashboard-footer">
        <p>For research and educational use only. Not for diagnosis or treatment decisions.</p>
      </footer>
    </div>
  )
}
