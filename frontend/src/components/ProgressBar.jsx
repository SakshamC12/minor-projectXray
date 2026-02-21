import React from 'react'

export default function ProgressBar({ value = 0 }) {
  const percentage = Math.min(Math.max(value * 100, 0), 100)

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
