import { betterToe, betterToeInv, clampChroma, RGBA } from '@/shared/lib/huevo'
import { applyTheme, makeTheme } from '@/shared/lib/theme'
import { Slider } from '@/shared/ui/Slider'
import { Stack } from '@/shared/ui/Stack'
import { Oklch, p3 } from 'culori'
import { useEffect, useRef, useState } from 'react'

const theme = makeTheme({})

export function P3Space() {
  applyTheme(document.body, theme)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hue, setHue] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current!
    if (!canvas) return
    const d = getData(canvas.width, canvas.height, hue)
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.putImageData(d, 0, 0)
  }, [hue])

  return (
    <Stack axis="y" gap={1} p={3}>
      <label>
        <span>Hue: {hue}</span>
        <Slider
          min={0}
          max={360}
          value={[hue]}
          onValueChange={value => setHue(value[0])}
        />
      </label>

      <div>
        <canvas ref={canvasRef} width={500} height={200} />
      </div>
    </Stack>
  )
}

function getData(width: number, height: number, hue: number) {
  const imageData = new ImageData(width, height, { colorSpace: 'display-p3' })
  const data = new Uint8ClampedArray(width * height * 4)

  const setColor = (
    x: number,
    y: number,
    [r, g, b, a]: RGBA = [0, 0, 0, 0]
  ) => {
    const start = y * width * 4 + x * 4
    data[start] = r
    data[start + 1] = g
    data[start + 2] = b
    data[start + 3] = a
  }

  const MAX_C = 0.4

  for (let x = 0; x < width; x++) {
    // const l = betterToeInv(x / width)
    const l = x / width
    const color = { mode: 'oklch', l, c: MAX_C, h: hue } as Oklch
    const maxCP3 = clampChroma(color, 'display-p3').c
    const maxCRGB = clampChroma(color, 'srgb').c
    let prevC = 0
    for (let y = height; y >= 0; y--) {
      const c = ((height - y) / height) * MAX_C
      if (c > maxCP3) {
        setColor(x, y)
        continue
      }
      const rgbEdge = prevC <= maxCRGB && c > maxCRGB

      const colorP3 = p3({ mode: 'oklch', l, c, h: hue } as Oklch)
      setColor(x, y, [
        colorP3.r * 255,
        colorP3.g * 255,
        colorP3.b * 255,
        rgbEdge ? 100 : 255,
      ])
      prevC = c
    }
  }

  imageData.data.set(data)
  return imageData
}
