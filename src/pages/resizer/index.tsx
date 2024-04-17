import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Stack } from '@/shared/ui/Stack'
import { useImageData } from './useImageData'

type Spec = {
  minAR: number
  maxAR: number
  minWidth: number
  maxWidth: number
  minHeight: number
  maxHeight: number
}

const round = Math.round

function calcSizes(width: number, height: number, spec: Spec) {
  const sourceAR = width / height
  const { minAR, maxAR, minWidth, maxWidth, minHeight, maxHeight } = spec

  // The image has correct aspect ratio
  if (sourceAR >= minAR && sourceAR <= maxAR) {
    let scale = 1
    if (width < minWidth) scale = minWidth / width
    if (width > maxWidth) scale = maxWidth / width

    const scaledHeight = round(height * scale)
    if (scaledHeight < minHeight) scale = minHeight / height
    if (scaledHeight > maxHeight) scale = maxHeight / height

    // Double check the width is within bounds
    const scaledWidth = round(width * scale)
    if (scaledWidth < minWidth || scaledWidth > maxWidth) {
      throw new Error('Invalid width')
    }

    return {
      frameWidth: round(width * scale),
      frameHeight: round(height * scale),
      imgWidth: round(width * scale),
      imgHeight: round(height * scale),
      offsetX: 0,
      offsetY: 0,
    }
  }

  // The image is too tall
  if (sourceAR < minAR) {
    let frameHeight = height
    if (height < minHeight) frameHeight = minHeight
    if (height > maxHeight) frameHeight = maxHeight

    let frameWidth = round(frameHeight * minAR)
    if (frameWidth < minWidth) {
      frameWidth = minWidth
      frameHeight = round(frameWidth / minAR)
    }
    if (frameWidth > maxWidth) {
      frameWidth = maxWidth
      frameHeight = round(frameWidth / minAR)
    }

    // Double check the height is within bounds
    if (frameHeight < minHeight || frameHeight > maxHeight) {
      throw new Error('Invalid height')
    }

    const scale = frameHeight / height
    const scaledWidth = round(width * scale)
    const offsetX = round((frameWidth - scaledWidth) / 2)
    const offsetY = 0

    return {
      frameWidth: frameWidth,
      frameHeight: frameHeight,
      imgWidth: round(width * scale),
      imgHeight: round(height * scale),
      offsetX,
      offsetY,
    }
  }

  // The image is too wide
  if (sourceAR > maxAR) {
    let frameWidth = width
    if (width < minWidth) frameWidth = minWidth
    if (width > maxWidth) frameWidth = maxWidth

    let frameHeight = round(frameWidth / maxAR)
    if (frameHeight < minHeight) {
      frameHeight = minHeight
      frameWidth = round(frameHeight * maxAR)
    }
    if (frameHeight > maxHeight) {
      frameHeight = maxHeight
      frameWidth = round(frameHeight * maxAR)
    }

    // Double check the width is within bounds
    if (frameWidth < minWidth || frameWidth > maxWidth) {
      throw new Error('Invalid width')
    }

    const scale = frameWidth / width
    const scaledHeight = round(height * scale)
    const offsetX = 0
    const offsetY = round((frameHeight - scaledHeight) / 2)

    return {
      frameWidth: frameWidth,
      frameHeight: frameHeight,
      imgWidth: round(width * scale),
      imgHeight: round(height * scale),
      offsetX,
      offsetY,
    }
  }

  throw new Error('Invalid aspect ratio')
}

function calcSizes2(width: number, height: number, spec: Spec) {
  try {
    return calcSizes(width, height, spec)
  } catch (e) {
    // console.error('Failed to resize image', width, height, spec)
    // debugger
    // calcSizes(width, height, spec)
    return {
      frameWidth: width,
      frameHeight: height,
      imgWidth: width,
      imgHeight: height,
      offsetX: 0,
      offsetY: 0,
    }
  }
}

// Resizes the image to fit the given spec. If the image is too small stretches it to minimal size.  Adds black borders if necessary.
function resizeImage(source: ImageData, spec: Spec): ImageData {
  const { width, height } = source
  const calculatedSizes = calcSizes2(width, height, spec)
  const { frameWidth, frameHeight, imgWidth, imgHeight, offsetX, offsetY } =
    calculatedSizes

  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = source.width
  tempCanvas.height = source.height
  const tempCtx = tempCanvas.getContext('2d')!
  tempCtx.putImageData(source, 0, 0)

  const targetCanvas = document.createElement('canvas')
  targetCanvas.width = frameWidth
  targetCanvas.height = frameHeight
  const targetCtx = targetCanvas.getContext('2d')!
  targetCtx.fillStyle = 'black'
  targetCtx.fillRect(0, 0, frameWidth, frameHeight)
  targetCtx.drawImage(
    tempCanvas,
    0,
    0,
    source.width,
    source.height,
    offsetX,
    offsetY,
    imgWidth,
    imgHeight
  )

  return targetCtx.getImageData(0, 0, frameWidth, frameHeight)
}

export default function Resizer() {
  const { imgData, loadFile } = useImageData()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [minAR, setMinAR] = useState(9 / 16)
  const [maxAR, setMaxAR] = useState(16 / 9)
  const [minWidth, setMinWidth] = useState(10)
  const [maxWidth, setMaxWidth] = useState(250)
  const [minHeight, setMinHeight] = useState(10)
  const [maxHeight, setMaxHeight] = useState(4000)
  const [fps, setFps] = useState(0)

  useEffect(() => {
    if (!imgData) return
    const spec = { minAR, maxAR, minWidth, maxWidth, minHeight, maxHeight }
    const t0 = performance.now()
    const adjusted = resizeImage(imgData, spec)
    const t1 = performance.now()
    setFps(1000 / (t1 - t0))
    const canvas = canvasRef.current!
    canvas.width = adjusted.width
    canvas.height = adjusted.height
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.putImageData(adjusted, 0, 0)
  }, [imgData, maxAR, maxHeight, maxWidth, minAR, minHeight, minWidth])

  return (
    <Stack gap={2} p={3} axis="x" style={{ minHeight: '100vh' }}>
      <Stack gap={2} axis="y">
        <Button tag="label">
          Choose image
          <input
            autoFocus
            style={{ position: 'absolute', visibility: 'hidden' }}
            type="file"
            accept="image/*,video/*"
            // accept="image/*"
            onChange={e => loadFile(e.target.files![0])}
          />
        </Button>
        <label style={{ color: 'black' }}>
          Min AR
          <input
            type="range"
            min={1 / 3}
            max={3 / 1}
            step={0.01}
            value={minAR}
            onChange={e => {
              let value = parseFloat(e.target.value)
              setMinAR(value)
              if (value > maxAR) setMaxAR(value)
            }}
          />
        </label>
        <label style={{ color: 'black' }}>
          Max AR
          <input
            type="range"
            min={1 / 3}
            max={3 / 1}
            step={0.01}
            value={maxAR}
            onChange={e => {
              let value = parseFloat(e.target.value)
              setMaxAR(value)
              if (value < minAR) setMinAR(value)
            }}
          />
        </label>
        <label style={{ color: 'black' }}>
          Min width
          <input
            type="range"
            min={10}
            max={4000}
            step={10}
            value={minWidth}
            onChange={e => {
              let value = parseInt(e.target.value)
              setMinWidth(value)
              if (value > maxWidth) setMaxWidth(value)
            }}
          />
        </label>
        <label style={{ color: 'black' }}>
          Max width
          <input
            type="range"
            min={10}
            max={4000}
            step={10}
            value={maxWidth}
            onChange={e => {
              let value = parseInt(e.target.value)
              setMaxWidth(value)
              if (value < minWidth) setMinWidth(value)
            }}
          />
        </label>
        <label style={{ color: 'black' }}>
          Min height
          <input
            type="range"
            min={10}
            max={4000}
            step={10}
            value={minHeight}
            onChange={e => {
              let value = parseInt(e.target.value)
              setMinHeight(value)
              if (value > maxHeight) setMaxHeight(value)
            }}
          />
        </label>
        <label style={{ color: 'black' }}>
          Max height
          <input
            type="range"
            min={10}
            max={4000}
            step={10}
            value={maxHeight}
            onChange={e => {
              let value = parseInt(e.target.value)
              setMaxHeight(value)
              if (value < minHeight) setMinHeight(value)
            }}
          />
        </label>
        <label style={{ color: 'black' }}>FPS: {fps.toFixed(2)}</label>
      </Stack>

      <div>
        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          style={{
            maxHeight: '100vh',
          }}
        />
      </div>
    </Stack>
  )
}
