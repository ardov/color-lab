import type { Color, Oklch, P3, Rgb } from 'culori'
import type { FC } from 'react'
import type { RGBA } from './Pixels'

import { useEffect, useRef } from 'react'
import { oklch, p3, rgb } from 'culori'
import { betterToeInv, clampChroma } from '@/shared/lib/huelab'

import './polyfill.js'
import { Pixels } from './Pixels'
import { Gamut, getMaxChroma } from './shared'

export const Canvas: FC<{
  hue: number
  width: number
  height: number
  gamut?: Gamut
  className?: string
}> = props => {
  const { width, height, hue, gamut = Gamut.SRGB, className } = props

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cbRef = useRef<number>()

  useEffect(() => {
    const previewWidth = width / 10
    const previewHeight = height / 2
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

// ————————————————————————————————————————————————————————————————————————
// HELPERS
// ————————————————————————————————————————————————————————————————————————

function getHueSlice(props: {
  width: number
  height: number
  gamut: Gamut
  hue: number
}) {
  const { width, height, hue, gamut } = props
  const getColor = (x: number, y: number): Oklch => ({
    mode: 'oklch',
    l: betterToeInv(y),
    c: x * getMaxChroma(gamut),
    h: hue,
  })
  const pixels = new Pixels(width, height)
  for (let y = 0; y < height; y++) {
    let cuspColor = null as RGBA | null

    for (let x = 0; x < width; x++) {
      if (cuspColor) {
        pixels.set(x, y, cuspColor)
        continue
      }
      const color = getColor(x / (width - 1), y / (height - 1))
      const pix = toRGBA(toRGB(color, gamut))
      if (displayableRGBA(pix)) {
        pixels.set(x, y, pix)
      } else {
        if (!cuspColor) {
          const ok = clampChroma(oklch(color), gamut)
          cuspColor = toRGBA(toRGB(ok, gamut))
        }
        pixels.set(x, y, cuspColor)
      }
    }
  }
  return pixels.toImageBitmap({ colorSpace: gamut })
}

function toRGB(color: Color, gamut: Gamut) {
  return gamut === Gamut.P3 ? p3(color) : rgb(color)
}

const toRGBA = (c: P3 | Rgb): RGBA => [
  Math.round(c.r * 255),
  Math.round(c.g * 255),
  Math.round(c.b * 255),
  255,
]

function displayableRGBA(c: RGBA) {
  return c.every(val => val >= 0 && val <= 255.00001)
}