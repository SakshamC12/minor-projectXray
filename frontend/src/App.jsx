import React, { useState } from 'react'
import ImageUpload from './components/ImageUpload'
import ResultPanel from './components/ResultPanel'

export default function App() {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [stagingText, setStagingText] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const stagingMessages = [
    'Analyzing structures…',
    'Detecting anomalies…',
    'Generating heatmap…',
  ]

  function handleFileSelect(file) {
    setUploadedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setResult(null)
    setError(null)
  }

  function handleClear() {
    setUploadedFile(null)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
    setStagingText('')
  }

  async function handleAnalyze() {
    if (!uploadedFile) return
    setLoading(true)
    setResult(null)
    setError(null)
    setStagingText('')

    // Simulate staged text messaging
    let msgIdx = 0
    const interval = setInterval(() => {
      if (msgIdx < stagingMessages.length) {
        setStagingText(stagingMessages[msgIdx])
        msgIdx++
      }
    }, 800)

    const formData = new FormData()
    formData.append('image', uploadedFile)

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      console.log('API RESPONSE', data)
      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed')
      }
      setResult(data)
    } catch (err) {
      setError(err.message)
      setStagingText('')
    } finally {
      clearInterval(interval)
      setLoading(false)
      setStagingText('')
    }
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1 className="logo">AI Chest X-ray Diagnostic</h1>
          <p className="tagline">Advanced Medical Imaging Analysis</p>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Left Column: Upload */}
          <div className="column column-left">
            <ImageUpload
              previewUrl={previewUrl}
              file={uploadedFile}
              onFileSelect={handleFileSelect}
              onAnalyze={handleAnalyze}
              onClear={handleClear}
              isLoading={loading}
              stagingText={stagingText}
            />
          </div>

          {/* Right Column: Results */}
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
        <p>Not intended for clinical decision-making.</p>
      </footer>
    </div>
  )
}
