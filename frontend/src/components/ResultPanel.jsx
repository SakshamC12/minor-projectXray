import React, { useEffect, useState } from 'react'
import ProgressBar from './ProgressBar'
import HeatmapBlend from './HeatmapBlend'
import ReferenceHeatmapTransfer from './ReferenceHeatmapTransfer'
import ReasoningPanel from './ReasoningPanel'

const CLASS_LABELS = ['COVID', 'Normal', 'Pneumonia', 'Tuberculosis']

export default function ResultPanel({ result, loading, error, originalSrc }) {
  const [intensity, setIntensity] = useState(50)
  const [comparisonMode, setComparisonMode] = useState('panels')

  useEffect(() => {
    setIntensity(50)
  }, [originalSrc])

  const confidence = result?.confidence
  const prediction = result?.prediction
  const probabilities = result?.probabilities

  return (
    <div className="result-card">
      <div className="panel-heading">
        <span className="step-number">02</span>
        <div>
          <h2 className="panel-title">Analysis &amp; comparison</h2>
          <p className="panel-description">Model output and image visualisation.</p>
        </div>
      </div>

      {error && (
        <div className="error-box" role="alert">
          <span className="error-mark" aria-hidden="true">!</span>
          <div>
            <h3>Analysis could not be completed</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-banner" role="status" aria-live="polite">
          <span className="staging-spinner" />
          <span>Waiting for the Flask analysis service…</span>
        </div>
      )}

      {result ? (
        <section className="prediction-section" aria-labelledby="prediction-title">
          <div className="prediction-heading">
            <div>
              <span className="eyebrow">Predicted category</span>
              <h3 id="prediction-title" className="prediction-value">{prediction}</h3>
            </div>
            <span className="prediction-badge">Model output</span>
          </div>

          <div className="probabilities-section" aria-label="Class probabilities">
            {CLASS_LABELS.map((label) => {
              const value = probabilities[label]
              const isPredicted = label === prediction

              return (
                <div
                  key={label}
                  className={`prob-row${isPredicted ? ' is-predicted' : ''}`}
                  aria-label={`${label}${isPredicted ? ', predicted category' : ''}: ${(value * 100).toFixed(1)} percent`}
                >
                  <span className="prob-label">
                    {label}
                    {isPredicted && <span className="predicted-indicator">Predicted</span>}
                  </span>
                  <ProgressBar value={value} />
                  <span className="prob-value">{(value * 100).toFixed(1)}%</span>
                </div>
              )
            })}
          </div>

          <div className="confidence-section">
            <div className="confidence-header">
              <span className="confidence-label">Model confidence score</span>
              <span className="confidence-value">{(confidence * 100).toFixed(1)}%</span>
            </div>
            <ProgressBar value={confidence} />
            <p className="confidence-note">A model score is not a measure of diagnostic certainty.</p>
          </div>

        </section>
      ) : (
        !error && !loading && (
          <div className="empty-state">
            <span className="empty-mark" aria-hidden="true">↗</span>
            <p>Upload an image and run analysis to see model output.</p>
          </div>
        )
      )}

      {originalSrc && (
        <section className="comparison-section" aria-labelledby="comparison-title">
          <div className="comparison-heading">
            <div>
              <span className="eyebrow">Visual review</span>
              <h3 id="comparison-title" className="comparison-title">Image comparison</h3>
            </div>
            <div className="comparison-modes" role="group" aria-label="Image comparison mode">
              <button
                type="button"
                className={`comparison-mode-button${comparisonMode === 'panels' ? ' active' : ''}`}
                aria-pressed={comparisonMode === 'panels'}
                onClick={() => setComparisonMode('panels')}
              >
                Three panels
              </button>
              <button
                type="button"
                className={`comparison-mode-button${comparisonMode === 'reference' ? ' active' : ''}`}
                aria-pressed={comparisonMode === 'reference'}
                onClick={() => setComparisonMode('reference')}
              >
                Reference comparison
              </button>
            </div>
          </div>

          {comparisonMode === 'reference' ? (
            <figure className="comparison-card reference-transfer-card">
              <figcaption className="image-caption">
                <span className="caption-dot heatmap-dot" />
                <span>Normal reference + transferred patient heatmap</span>
              </figcaption>
              <div className="comparison-image-frame reference-transfer-frame">
                {result?.heatmap ? (
                  <ReferenceHeatmapTransfer
                    referenceSrc={`${import.meta.env.BASE_URL}normal-reference.jpeg`}
                    heatmapSrc={result.heatmap}
                    opacity={intensity}
                  />
                ) : (
                  <>
                    <img
                      src={`${import.meta.env.BASE_URL}normal-reference.jpeg`}
                      alt="Normal reference chest X-ray"
                      className="comparison-image"
                    />
                    <p className="reference-transfer-placeholder">
                      Run analysis to create the illustrative heatmap transfer.
                    </p>
                  </>
                )}
              </div>
            </figure>
          ) : (
            <div className="comparison-grid">
              {['reference', 'patient', 'heatmap'].map((panel) => (
                <figure className="comparison-card" key={panel}>
                  <figcaption className="image-caption">
                    <span className={`caption-dot ${panel === 'reference' ? 'reference-dot' : panel === 'patient' ? 'patient-dot' : 'heatmap-dot'}`} />
                    <span>
                      {panel === 'reference'
                        ? 'Normal reference example'
                        : panel === 'patient'
                          ? 'Uploaded patient image'
                          : 'Patient image + heatmap'}
                    </span>
                  </figcaption>
                  <div className={`comparison-image-frame${panel === 'heatmap' ? ' blend-frame' : ''}`}>
                    {panel === 'reference' ? (
                      <img
                        src={`${import.meta.env.BASE_URL}normal-reference.jpeg`}
                        alt="Illustrative normal chest X-ray"
                        className="comparison-image"
                      />
                    ) : panel === 'patient' ? (
                      <img src={originalSrc} alt="Uploaded patient chest X-ray" className="comparison-image" />
                    ) : result?.heatmap ? (
                      <HeatmapBlend
                        originalSrc={originalSrc}
                        heatmapSrc={result.heatmap}
                        intensity={intensity}
                      />
                    ) : (
                      <div className="blend-placeholder">
                        {loading ? 'Heatmap will appear when analysis completes.' : 'Run analysis to view the returned heatmap.'}
                      </div>
                    )}
                  </div>
                </figure>
              ))}
            </div>
          )}

          {result?.heatmap && (
            <div className="intensity-control">
              <div className="intensity-label-row">
                <label htmlFor="heatmap-intensity">
                  {comparisonMode === 'reference' ? 'Transferred heatmap opacity' : 'Heatmap intensity'}
                </label>
                <output htmlFor="heatmap-intensity" aria-live="polite">{intensity}%</output>
              </div>
              <input
                id="heatmap-intensity"
                className="intensity-slider"
                type="range"
                min="0"
                max="100"
                step="1"
                value={intensity}
                onChange={(event) => setIntensity(Number(event.target.value))}
              />
              <div className="slider-endpoints" aria-hidden="true">
                <span>{comparisonMode === 'reference' ? 'Normal reference' : 'Original image'}</span>
                <span>{comparisonMode === 'reference' ? 'Full transferred layer' : 'Full heatmap'}</span>
              </div>
              {comparisonMode === 'reference' ? (
                <p className="visualization-note">
                  Experimental color transfer from the backend’s handcrafted OpenCV visualization. Color transparency
                  reflects saturation, not disease localization; no anatomical registration is performed.
                </p>
              ) : (
                <p className="visualization-note">
                  This is a handcrafted OpenCV visualisation, not Grad-CAM or a clinically validated localisation.
                </p>
              )}
            </div>
          )}

          <p className="comparison-disclaimer">
            {comparisonMode === 'reference'
              ? 'Illustrative overlay only: transferred colors do not identify abnormalities in the normal reference and have no reliable anatomical correspondence.'
              : 'The normal reference is illustrative only and is not a patient-specific diagnostic comparison. The heatmap remains paired with the uploaded patient image; no image registration or difference map is applied.'}
          </p>
        </section>
      )}

      <ReasoningPanel result={result} />
    </div>
  )
}
