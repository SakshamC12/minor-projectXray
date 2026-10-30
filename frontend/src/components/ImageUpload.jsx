import React, { useRef, useState } from 'react'

export default function ImageUpload({
  previewUrl,
  file,
  onFileSelect,
  onAnalyze,
  onClear,
  isLoading,
}) {
  const inputRef = useRef()
  const [isDragging, setIsDragging] = useState(false)

  function handleChoose() {
    if (!isLoading) inputRef.current?.click()
  }

  function handleFileInput(e) {
    const f = e.target.files?.[0]
    if (f) onFileSelect(f)
    e.target.value = ''
  }

  function handleDrop(e) {
    e.preventDefault()
    setIsDragging(false)
    if (isLoading) return
    const f = e.dataTransfer.files?.[0]
    if (f) onFileSelect(f)
  }

  return (
    <div className="upload-card">
      <div className="panel-heading">
        <span className="step-number">01</span>
        <div>
          <h2 className="panel-title">Upload image</h2>
          <p className="panel-description">Select a chest X-ray to begin.</p>
        </div>
      </div>

      <div
        className={`upload-area${isDragging ? ' is-dragging' : ''}${isLoading ? ' is-disabled' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          if (!isLoading) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={handleChoose}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleChoose()
          }
        }}
        role="button"
        tabIndex={isLoading ? -1 : 0}
        aria-label="Choose a chest X-ray image or drag and drop it here"
        aria-disabled={isLoading}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Uploaded patient X-ray preview" className="preview-image" />
        ) : (
          <div className="placeholder-content">
            <span className="upload-icon" aria-hidden="true">↑</span>
            <p className="placeholder-text">Drop an image here</p>
            <p className="placeholder-subtext">or click to browse · JPG, PNG and other images</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="visually-hidden"
        tabIndex={-1}
        aria-hidden="true"
        disabled={isLoading}
      />

      {file && (
        <div className="file-info">
          <span className="file-status" aria-hidden="true">✓</span>
          <div className="file-details">
            <p className="file-name">{file.name}</p>
            <p className="file-size">{(file.size / 1024).toFixed(1)} KB · Image ready</p>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="staging-text" role="status" aria-live="polite">
          <span className="staging-spinner" />
          <span>Waiting for the analysis service…</span>
        </div>
      )}

      <div className="action-buttons">
        <button
          className="btn btn-primary"
          onClick={onAnalyze}
          disabled={!file || isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-inline" />
              Analyzing...
            </>
          ) : (
            'Run analysis'
          )}
        </button>

        {file && (
          <button className="btn btn-secondary" onClick={onClear} disabled={isLoading}>
            Remove
          </button>
        )}
      </div>
      <p className="upload-note">Images are sent to the configured Flask service for processing.</p>
    </div>
  )
}
