import React, { useState } from 'react'
import ProgressBar from './ProgressBar'

export default function ResultPanel({ result, loading, error, originalSrc }) {
  const [activeTab, setActiveTab] = useState('original')

  if (loading && !result) {
    return (
      <div className="result-card">
        <div className="loading-placeholder">
          <div className="pulse-circle" />
          <p>Awaiting analysis...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="result-card">
        <div className="error-box">
          <svg className="icon-error" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h3>Analysis Error</h3>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="result-card">
        <div className="empty-state">
          <svg className="icon-empty" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p>Upload an image to begin analysis</p>
        </div>
      </div>
    )
  }

  const confidence = result.confidence || 0
  const prediction = result.prediction || 'Unknown'
  const isPredictionAbnormal = prediction === 'Abnormal'

  return (
    <div className="result-card">
      {/* Prediction Header */}
      <div className="prediction-header">
        <h2 className="section-title">AI Diagnostic Output</h2>
        <div className={`prediction-badge ${isPredictionAbnormal ? 'abnormal' : 'normal'}`}>
          {prediction}
        </div>
      </div>

      {/* Summary */}
      {result.summary && (
        <div className="summary-section">
          <h3 className="section-title">AI Interpretation Summary</h3>
          <p className="summary-text">{result.summary}</p>
        </div>
      )}

      {/* Probabilities */}
      {result.probabilities && (
        <div className="probabilities-section">
          {Object.entries(result.probabilities)
            .sort((a, b) => b[1] - a[1])
            .map(([lbl, val]) => (
              <div key={lbl} className="prob-row">
                <span className="prob-label">{lbl}</span>
                <ProgressBar value={val} />
                <span className="prob-value">{(val * 100).toFixed(1)}%</span>
              </div>
            ))}
        </div>
      )}

      {/* Confidence Score */}
      <div className="confidence-section">
        <div className="confidence-header">
          <span className="confidence-label">Confidence Score</span>
          <span className="confidence-value">{(confidence * 100).toFixed(1)}%</span>
        </div>
        <ProgressBar value={confidence} />
      </div>

      {/* Tabs */}
      {result.heatmap && (
        <div className="tabs-section">
          <h3 className="section-title">Visual Attention Map</h3>

          <div className="tabs-nav">
            <button
              className={`tab-button ${activeTab === 'original' ? 'active' : ''}`}
              onClick={() => setActiveTab('original')}
            >
              Original
            </button>
            <button
              className={`tab-button ${activeTab === 'heatmap' ? 'active' : ''}`}
              onClick={() => setActiveTab('heatmap')}
            >
              Heatmap
            </button>
            <button
              className={`tab-button ${activeTab === 'overlay' ? 'active' : ''}`}
              onClick={() => setActiveTab('overlay')}
            >
              Overlay
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === 'original' && (
              originalSrc ? (
                <div className="image-container">
                  <img src={originalSrc} alt="Original X-ray" className="result-image" />
                </div>
              ) : (
                <div className="image-container">
                  <p className="placeholder-info">No original image available. Upload an image first.</p>
                </div>
              )
            )}

            {activeTab === 'heatmap' && result.heatmap && (
              <div className="image-container">
                <img src={result.heatmap} alt="Heatmap visualization" className="result-image" />
              </div>
            )}

            {activeTab === 'overlay' && (
              (originalSrc && result.heatmap) ? (
                <div className="image-container" style={{ position: 'relative' }}>
                  <img src={originalSrc} alt="Original X-ray" className="result-image" style={{ display: 'block' }} />
                  <img src={result.heatmap} alt="Heatmap overlay" className="result-image" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', opacity: 0.6, mixBlendMode: 'screen' }} />
                </div>
              ) : (
                <div className="image-container">
                  <p className="placeholder-info">Overlay requires both original image and heatmap.</p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Details */}
      <div className="details-row">
        <div className="detail-item">
          <span className="detail-label">Classification</span>
          <span className={`detail-value ${isPredictionAbnormal ? 'abnormal' : 'normal'}`}>
            {prediction}
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Model Confidence</span>
          <span className="detail-value">{(confidence * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}
