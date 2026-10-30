import React, { useEffect, useRef, useState } from 'react'

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('The reference or returned heatmap image could not be loaded.'))
    image.src = src
  })
}

function fitContain(image, width, height) {
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight)
  const drawWidth = image.naturalWidth * scale
  const drawHeight = image.naturalHeight * scale

  return {
    x: (width - drawWidth) / 2,
    y: (height - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  }
}

function extractChromaticLayer(image, width, height) {
  const layer = document.createElement('canvas')
  layer.width = width
  layer.height = height

  const context = layer.getContext('2d', { willReadFrequently: true })
  if (!context) throw new Error('Canvas color extraction is not available in this browser.')

  const bounds = fitContain(image, width, height)
  context.drawImage(image, bounds.x, bounds.y, bounds.width, bounds.height)

  const pixels = context.getImageData(0, 0, width, height)
  const data = pixels.data

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index] / 255
    const green = data[index + 1] / 255
    const blue = data[index + 2] / 255
    const maximum = Math.max(red, green, blue)
    const minimum = Math.min(red, green, blue)
    const chroma = maximum - minimum

    if (chroma < 0.015 || maximum === 0) {
      data[index + 3] = 0
      continue
    }

    const saturation = chroma / maximum
    let hue

    if (maximum === red) {
      hue = ((green - blue) / chroma) % 6
    } else if (maximum === green) {
      hue = (blue - red) / chroma + 2
    } else {
      hue = (red - green) / chroma + 4
    }

    hue = ((hue * 60) % 360 + 360) % 360
    const hueSection = hue / 60
    const secondary = maximum * (1 - Math.abs((hueSection % 2) - 1))
    let pureRed = 0
    let pureGreen = 0
    let pureBlue = 0

    if (hueSection < 1) {
      pureRed = maximum
      pureGreen = secondary
    } else if (hueSection < 2) {
      pureRed = secondary
      pureGreen = maximum
    } else if (hueSection < 3) {
      pureGreen = maximum
      pureBlue = secondary
    } else if (hueSection < 4) {
      pureGreen = secondary
      pureBlue = maximum
    } else if (hueSection < 5) {
      pureRed = secondary
      pureBlue = maximum
    } else {
      pureRed = maximum
      pureBlue = secondary
    }

    data[index] = Math.round(pureRed * 255)
    data[index + 1] = Math.round(pureGreen * 255)
    data[index + 2] = Math.round(pureBlue * 255)
    data[index + 3] = Math.round(saturation * 255)
  }

  context.putImageData(pixels, 0, 0)
  return layer
}

export default function ReferenceHeatmapTransfer({
  referenceSrc,
  heatmapSrc,
  opacity,
}) {
  const canvasRef = useRef(null)
  const [images, setImages] = useState(null)
  const [transferError, setTransferError] = useState(null)

  useEffect(() => {
    let cancelled = false

    setImages(null)
    setTransferError(null)
    Promise.all([loadImage(referenceSrc), loadImage(heatmapSrc)])
      .then(([reference, heatmap]) => {
        if (cancelled) return

        const scale = Math.min(1, 1200 / Math.max(reference.naturalWidth, reference.naturalHeight))
        const width = Math.max(1, Math.round(reference.naturalWidth * scale))
        const height = Math.max(1, Math.round(reference.naturalHeight * scale))
        const colorLayer = extractChromaticLayer(heatmap, width, height)
        setImages({ reference, colorLayer, width, height })
      })
      .catch((error) => {
        if (!cancelled) setTransferError(error.message)
      })

    return () => {
      cancelled = true
    }
  }, [referenceSrc, heatmapSrc])

  useEffect(() => {
    if (!images) return

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) {
      setTransferError('Canvas compositing is not available in this browser.')
      return
    }

    canvas.width = images.width
    canvas.height = images.height
    context.globalAlpha = 1
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(images.reference, 0, 0, canvas.width, canvas.height)
    context.globalAlpha = opacity / 100
    context.drawImage(images.colorLayer, 0, 0)
    context.globalAlpha = 1
    setTransferError(null)
  }, [images, opacity])

  if (transferError) {
    return <p className="blend-error" role="alert">{transferError}</p>
  }

  return (
    <canvas
      ref={canvasRef}
      className="comparison-image reference-transfer-canvas"
      aria-label={`Normal reference image with chromatic heatmap information transferred at ${opacity}% opacity`}
      role="img"
    />
  )
}
