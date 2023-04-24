import { betterToe, betterToeInv, RGBA } from '@/shared/lib/huelab'
import { colorScale } from '@/shared/lib/math/colorScale'
import { Color, Oklch, P3, p3, Rgb, rgb } from 'culori'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pixels } from './Pixels'

export const CanvasComparison: FC<{
  hue: number
  width: number
  height: number
}> = props => {
  const { hue, width, height } = props

  const getColor = useCallback(
    (x: number, y: number) => {
      const v = hue / 360
      // return { mode: 'oklab', l: v, a: y - 0.5, b: x - 0.5 } as Color
      // return { mode: 'oklch', l: 0.75, c: v, h: y * 360 } as Oklch
      // return { mode: 'oklch', l: betterToeInv(y), c: v, h: x * 360 } as Oklch
      // return { mode: 'oklch', l: hue / 360, c: y * 0.4, h: x * 360 } as Oklch
      return { mode: 'oklch', l: x, c: y * 0.4, h: hue } as Oklch
    },
    [hue]
  )

  const gamut = 'srgb' //'display-p3'

  const functions = useMemo(() => {
    return {
      naive: (width: number, height: number) =>
        renderEveryPixel({ width, height, getColor, gamut }),
      interpolatedX: (width: number, height: number) =>
        renderInterpolatedX({ width, height, getColor, gamut }),
    }
  }, [getColor])

  return (
    <>
      {/* <FuncPreview
        width={width}
        height={height}
        fn={functions.naive}
        name={'naive'}
      /> */}
      <FuncPreview
        width={width}
        height={height}
        fn={functions.interpolatedX}
        name={'interpolatedX'}
      />
    </>
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

    const render = async () => {
      const canvas = canvasRef.current!
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const t0 = performance.now()
      const img = await fn(width, height)
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      const t1 = performance.now()
      setTime(t1 - t0)
    }
    const renderHalf = async () => {
      const canvas = canvasRef.current!
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const t0 = performance.now()
      const img = await fn(width / 2, height / 2)
      ctx.clearRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      const t1 = performance.now()
      setTimeHalf(t1 - t0)
    }
    renderHalf()
    cbRef.current = requestIdleCallback(render)
    // render()
  }, [fn, height, width])

  return (
    <div>
      {Math.round(1000 / timeHalf)} fps — {Math.round(1000 / time)} fps — {name}
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  )
}

function renderEveryPixel(props: RenderOpts) {
  const { width, height, getColor, gamut } = props
  const pixels = new Pixels(width, height)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const color = getColor(x / width, y / height)
      const pix = toRGBA(toRGB(color, gamut))
      if (displayableRGBA(pix)) pixels.set(x, y, pix)
    }
  }
  return pixels.toImageBitmap({ colorSpace: gamut })
}

function renderInterpolatedX(props: RenderOpts) {
  const { width, height, getColor, gamut } = props
  const pixels = new Pixels(width, height)

  const RESOLUTION = 4 // pixels
  const xSteps = Math.floor(width / RESOLUTION)
  const ySteps = Math.floor(height / RESOLUTION)
  // const xSteps = 60
  // const ySteps = 30
  const xStepSize = 1 / (xSteps - 1)
  const yStepSize = 1 / (ySteps - 1)

  const verticalScales = new Array(xSteps).fill(0).map((_, col) => {
    //
    // Vertical stops
    const x = col * xStepSize
    const stops = new Array(ySteps).fill(0).map((_, row) => {
      const y = row * yStepSize
      const color = getColor(x, y)
      return toRGBA(toRGB(color, gamut))
    })
    return colorScale(stops)
  })

  for (let y = 0; y < height; y++) {
    const stops = verticalScales.map(scale => scale(y / height))
    const getInterpolated = colorScale(stops)
    for (let x = 0; x < width; x++) {
      const pix = getInterpolated(x / width)
      if (displayableRGBA(pix)) pixels.set(x, y, pix.map(Math.round) as RGBA)
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
