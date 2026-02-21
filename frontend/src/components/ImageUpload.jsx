import React, { useRef } from 'react'

export default function ImageUpload({
  previewUrl,
  file,
  onFileSelect,
  onAnalyze,
  onClear,
  isLoading,
  stagingText,
}) {
  const inputRef = useRef()

  function handleChoose() {
    inputRef.current?.click()
  }

  function handleFileInput(e) {
    const f = e.target.files?.[0]
    if (f) onFileSelect(f)
  }

  function handleDrop(e) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) onFileSelect(f)
  }

  return (
    <div className="upload-card">
      <h2 className="section-title">Patient X-ray Image</h2>

      {/* Upload Area */}
      <div
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={handleChoose}
        role="button"
        tabIndex={0}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="Uploaded X-ray" className="preview-image" />
        ) : (
          <div className="placeholder-content">
            <svg className="icon-upload" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="placeholder-text">Drag & drop X-ray image</p>
            <p className="placeholder-subtext">or click to browse</p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />

      {/* File info */}
      {file && (
        <div className="file-info">
          <p className="file-name">{file.name}</p>
          <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
        </div>
      )}

      {/* Staging text during analysis */}
      {isLoading && stagingText && (
        <div className="staging-text">
          <div className="staging-spinner" />
          <span>{stagingText}</span>
        </div>
      )}

      {/* Action Buttons */}
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
            'Analyze Image'
          )}
        </button>

        {file && (
          <button className="btn btn-secondary" onClick={onClear} disabled={isLoading}>
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
