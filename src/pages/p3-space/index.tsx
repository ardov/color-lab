import {
  betterToe,
  betterToeInv,
  clampChroma,
  displayable,
  RGBA,
} from '@/shared/lib/huelab'
import { remap } from '@/shared/lib/math'
import { applyTheme, makeTheme } from '@/shared/lib/theme'
import { Slider } from '@/shared/ui/Slider'
import { Stack } from '@/shared/ui/Stack'
import { Oklch, P3, p3, Rgb, rgb } from 'culori'
import { FC, useEffect, useMemo, useRef, useState } from 'react'
import { CanvasComparison } from './CanvasComparison'
import { Pixels } from './Pixels'

const theme = makeTheme({})

export default function P3Space() {
  applyTheme(document.body, theme)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hue, setHue] = useState(0)

  // useEffect(() => {
  //   const canvas = canvasRef.current!
  //   if (!canvas) return
  //   const d = getData(canvas.width, canvas.height, hue)
  //   const ctx = canvas.getContext('2d')
  //   if (ctx) ctx.putImageData(d, 0, 0)
  // }, [hue])

  return (
    <Stack axis="y" gap={1} p={3}>
      <label>
        <span>Hue: {hue}</span>
        <Slider
          min={0}
          max={360}
          value={[hue]}
          step={0.0001}
          onValueChange={value => setHue(value[0])}
        />
      </label>

      <div>
        <CanvasComparison width={500} height={200} hue={hue} />
      </div>

      <div>
        <canvas ref={canvasRef} width={500} height={200} />
      </div>
    </Stack>
  )
}

type CanvasProps = {
  width: number
  height: number
  xAxis: 'l' | 'c' | 'h'
  yAxis: 'l' | 'c' | 'h'
  zAxis: 'l' | 'c' | 'h'
  xRange: [number, number]
  yRange: [number, number]
  z: number
  gamut: 'display-p3' | 'srgb'
}
const Canvas: FC<CanvasProps> = props => {
  const { width, height } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const img = useMemo(() => getRenderData(props), [props])

  useEffect(() => {
    const canvas = canvasRef.current!
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.putImageData(img, 0, 0)
  }, [img])

  return <canvas ref={canvasRef} width={width} height={height} />
}

// function getColor(x:number, y:number) {
//   return { mode: 'oklch', l, c: MAX_C, h: hue } as Oklch
// }

function getPixelValue(
  val: { l?: number; c?: number; h?: number },
  gamut: 'display-p3' | 'srgb'
) {
  const color = {
    mode: 'oklch',
    l: val.l || 0,
    c: val.c || 0,
    h: val.h || 0,
  } as Oklch
  const rgbColor = gamut === 'display-p3' ? p3(color) : rgb(color)
  return rgbColor
  // return [rgbColor.r * 255, rgbColor.g * 255, rgbColor.b * 255, 255] as RGBA
}

const toRGBA = (c: P3 | Rgb) => [c.r * 255, c.g * 255, c.b * 255, 255] as RGBA

function getRenderData(props: CanvasProps) {
  const { width, height, xAxis, yAxis, zAxis, xRange, yRange, z, gamut } = props
  const pixels = new Pixels(width, height)

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      // Do stuff x y
      const xVal = remap(x, 0, width, xRange[0], xRange[1])
      const yVal = remap(y, 0, height, yRange[0], yRange[1])
      const pix = getPixelValue(
        { [xAxis]: xVal, [yAxis]: yVal, [zAxis]: z },
        gamut
      )
      if (displayable(pix, gamut)) pixels.set(x, y, toRGBA(pix))
    }
  }

  return pixels.toImageData({ colorSpace: gamut })
}

function getData(width: number, height: number, hue: number) {
  const pixels = new Pixels(width, height)

  const MAX_C = 0.4

  for (let x = 0; x < width; x++) {
    // const l = betterToeInv(x / width)
    const l = x / width
    const color = { mode: 'oklch', l, c: MAX_C, h: hue } as Oklch
    const maxCP3 = clampChroma(color, 'display-p3').c
    const maxCRGB = clampChroma(color, 'srgb').c
    let prevC = 0
    for (let y = 0; y < height; y++) {
      const c = (y / height) * MAX_C
      if (c > maxCP3) {
        pixels.set(x, y)
        continue
      }
      const rgbEdge = prevC <= maxCRGB && c > maxCRGB

      const colorP3 = p3({ mode: 'oklch', l, c, h: hue } as Oklch)
      pixels.set(x, y, [
        colorP3.r * 255,
        colorP3.g * 255,
        colorP3.b * 255,
        rgbEdge ? 100 : 255,
      ])
      prevC = c
    }
  }

  return pixels.toImageData({ colorSpace: 'display-p3' })
}
