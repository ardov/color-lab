import { betterToeInv, clampChroma, RGBA } from '@/shared/lib/huelab'
import { Color, oklch, Oklch, P3, p3, Rgb, rgb } from 'culori'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Pixels } from './Pixels'
import { getMaxChroma } from './shared'

export const CanvasComparison: FC<{
  hue: number
  width: number
  height: number
  mode?: 'srgb' | 'display-p3'
}> = props => {
  const { hue, width, height, mode = 'srgb' } = props
  const maxChroma = getMaxChroma(mode)

  const getColor = useCallback(
    (x: number, y: number) => {
      return {
        mode: 'oklch',
        l: betterToeInv(y),
        c: x * maxChroma,
        h: hue,
      } as Oklch
    },
    [hue, maxChroma]
  )

  const functions = useMemo(() => {
    return {
      naive: (width: number, height: number) =>
        renderEveryPixel({ width, height, getColor, gamut: mode }),
    }
  }, [mode, getColor])

  return (
    <FuncPreview
      width={width}
      height={height}
      fn={functions.naive}
      name={'naive'}
    />
  )
}

type RenderOpts = {
  width: number
  height: number
  gamut: 'display-p3' | 'srgb'
  getColor: (x: number, y: number) => Color
}

const FuncPreview: FC<{
  width: number
  height: number
  name: string
  fn: (width: number, height: number) => Promise<ImageBitmap>
}> = props => {
  const { width, height, fn, name } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [time, setTime] = useState(0)
  const [timeHalf, setTimeHalf] = useState(0)
  const cbRef = useRef<number>()

  useEffect(() => {
    if (cbRef.current) cancelIdleCallback(cbRef.current)

    const drawImage = (img: ImageBitmap) => {
      const canvas = canvasRef.current!
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
    }
    const renderFull = async () => {
      const img = await fn(width, height)
      drawImage(img)
    }
    const renderPreview = async () => {
      const img = await fn(width / 20, height)
      drawImage(img)
    }

    withPerformance(renderPreview, setTimeHalf)
    cbRef.current = requestIdleCallback(() =>
      withPerformance(renderFull, setTime)
    )
  }, [fn, height, width])

  return (
    // <div>
    //   {Math.round(1000 / timeHalf)} fps — {Math.round(1000 / time)} fps — {name}
    <canvas ref={canvasRef} width={width} height={height} className="canvas" />
    // </div>
  )
}

function renderEveryPixel(props: RenderOpts) {
  const { width, height, getColor, gamut } = props
  const pixels = new Pixels(width, height)
  for (let y = 0; y <= height; y++) {
    let cuspColor = null as RGBA | null

    for (let x = 0; x < width; x++) {
      if (cuspColor) {
        pixels.set(x, y, cuspColor)
        continue
      }
      const color = getColor(x / width, y / height)
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

//
//
//
// HELPERS

function toRGB(color: Color, gamut: 'display-p3' | 'srgb') {
  return gamut === 'display-p3' ? p3(color) : rgb(color)
}

const toRGBA = (c: P3 | Rgb) => [c.r * 255, c.g * 255, c.b * 255, 255] as RGBA

function displayableRGBA(c: RGBA) {
  return c.every(val => val >= 0 && val <= 255.00001)
}

function withPerformance<T>(fn: () => T, cb: (time: number) => void) {
  const t0 = performance.now()
  const res = fn()
  const t1 = performance.now()
  cb(t1 - t0)
  return res
}
