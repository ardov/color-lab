import type { FC } from 'react'

import { useEffect, useRef } from 'react'

import './polyfill.js'
import { Gamut } from './shared'
import { getHueSlice } from './getHueSlice.js'

export const Canvas: FC<{
  hue: number
  width: number
  height: number
  gamut?: Gamut
  className?: string
}> = props => {
  const { width, height, hue, gamut = 'srgb', className } = props

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cbRef = useRef<number>()

  useEffect(() => {
    const previewWidth = 16
    const previewHeight = 72
    if (cbRef.current) cancelIdleCallback(cbRef.current)

    const render = (width: number, height: number) =>
      getHueSlice({ width, height, hue, gamut })

    const drawImage = (img: ImageBitmap) => {
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
    }
    const renderFull = async () => {
      const img = await render(width, height)
      drawImage(img)
    }
    const renderPreview = async () => {
      const img = await render(previewWidth, previewHeight)
      drawImage(img)
    }

    renderPreview()
    cbRef.current = requestIdleCallback(renderFull)
  }, [height, width, gamut, hue])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
    />
  )
}
