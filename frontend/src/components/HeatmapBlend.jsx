import React, { useEffect, useRef, useState } from 'react'

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('An image could not be loaded for the comparison.'))
    image.src = src
  })
}

export default function HeatmapBlend({ originalSrc, heatmapSrc, intensity }) {
  const canvasRef = useRef(null)
  const [images, setImages] = useState(null)
  const [blendError, setBlendError] = useState(null)

  useEffect(() => {
    let cancelled = false

    setImages(null)
    setBlendError(null)
    Promise.all([loadImage(originalSrc), loadImage(heatmapSrc)])
      .then(([original, heatmap]) => {
        if (!cancelled) setImages({ original, heatmap })
      })
      .catch((blendFailure) => {
        if (!cancelled) setBlendError(blendFailure.message)
      })

    return () => {
      cancelled = true
    }
  }, [originalSrc, heatmapSrc])

  useEffect(() => {
    if (!images) return

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) {
      setBlendError('Canvas blending is not available in this browser.')
      return
    }

    const { original, heatmap } = images
    const scale = Math.min(1, 1200 / Math.max(original.naturalWidth, original.naturalHeight))
    canvas.width = Math.max(1, Math.round(original.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(original.naturalHeight * scale))

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.globalAlpha = 1
    context.drawImage(original, 0, 0, canvas.width, canvas.height)
    context.globalAlpha = intensity / 100
    context.drawImage(heatmap, 0, 0, canvas.width, canvas.height)
    context.globalAlpha = 1
    setBlendError(null)
  }, [images, intensity])

  if (blendError) {
    return <p className="blend-error" role="alert">{blendError}</p>
  }

  return (
    <canvas
      ref={canvasRef}
      className="comparison-image blend-canvas"
      aria-label={`Patient image blended with returned heatmap at ${intensity}% intensity`}
      role="img"
    />
  )
}
