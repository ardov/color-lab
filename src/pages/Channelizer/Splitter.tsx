import { clampChroma } from '@/shared/lib/colors'
import { applyTheme, makeTheme } from '@/shared/lib/theme'
import { Button } from '@/shared/ui/Button'
import { Stack } from '@/shared/ui/Stack'
import { oklch, rgb, Rgb, p3, Color } from 'culori'
import React, { useCallback, useEffect, useRef, useState } from 'react'

// —————————————————————————————————————————————————————————————————————————————
// Shaders

const source: TShader = color => color
const lightnessOnly: TShader = color => {
  const okColor = oklch(RGBAtoRgb(color))
  okColor.c = 0
  okColor.h = 0
  return RgbToRGBA(rgb(clampChroma(okColor)))
}
const hueOnly: TShader = color => {
  const okColor = oklch(RGBAtoRgb(color))
  okColor.l = 0.75
  okColor.c = 0.125
  return RgbToRGBA(rgb(clampChroma(okColor)))
}
const chromaOnly: TShader = color => {
  const okColor = oklch(RGBAtoRgb(color))
  okColor.l = 0.728
  okColor.h = 327
  return RgbToRGBA(rgb(clampChroma(okColor)))
}
const noLightness: TShader = color => {
  const okColor = oklch(RGBAtoRgb(color))
  okColor.l = 0.75
  return RgbToRGBA(rgb(clampChroma(okColor)))
}
const noHue: TShader = color => {
  const okColor = oklch(RGBAtoRgb(color))
  okColor.h = 327
  return RgbToRGBA(rgb(clampChroma(okColor)))
}
const maxChroma: TShader = color => {
  const okColor = oklch(RGBAtoRgb(color))
  return RgbToRGBA(rgb(clampChroma({ ...okColor, c: okColor.c + 1 })))
}
const edgy: TShader = color => {
  const black = [0, 0, 0, 255] as RGBA

  // The most saturated colors are on edges of RGB cube
  if (isOnEdge(color)) return color
  return black

  function isOnEdge(color: RGBA) {
    const [r, g, b] = color
    const tolerance = 1
    return (
      r <= 0 + tolerance ||
      r >= 255 - tolerance ||
      g <= 0 + tolerance ||
      g >= 255 - tolerance ||
      b <= 0 + tolerance ||
      b >= 255 - tolerance
    )
  }
}
const p3Improvable: TShader = color => {
  const black = [0, 0, 0, 255] as RGBA

  // Cut out nearly black and nearly white colors
  const [r, g, b] = color
  if (r < 5 && g < 5 && b < 5) return black
  if (r > 250 && g > 250 && b > 250) return black

  // The most saturated colors are on edges of RGB cube
  if (!isOnEdge(color)) return black

  //  minimal chroma improvement that will be counted
  const minImprovement = 0.02
  const okColor = oklch(RGBAtoRgb(color))
  const canBeImproved = displayableP3({
    ...okColor,
    c: okColor.c + minImprovement,
  })

  return canBeImproved ? color : black

  function isOnEdge(color: RGBA) {
    const [r, g, b] = color
    const tolerance = 1
    return (
      r <= 0 + tolerance ||
      r >= 255 - tolerance ||
      g <= 0 + tolerance ||
      g >= 255 - tolerance ||
      b <= 0 + tolerance ||
      b >= 255 - tolerance
    )
  }
}

const shdrs: { key: string; shader: TShader; name: string }[] = [
  { key: 'source', shader: source, name: 'Source' },
  { key: 'lightnessOnly', shader: lightnessOnly, name: 'Lightness' },
  { key: 'chromaOnly', shader: chromaOnly, name: 'Chroma' },
  { key: 'hueOnly', shader: hueOnly, name: 'Hue' },
  { key: 'noLightness', shader: noLightness, name: 'Hue + chroma' },
  { key: 'noHue', shader: noHue, name: 'Lightness + chroma' },
  { key: 'edgy', shader: edgy, name: 'sRGB edge' },
  { key: 'p3Improvable', shader: p3Improvable, name: 'P3 improvable' },
  { key: 'moreChroma', shader: maxChroma, name: 'Max chroma' },
]

// —————————————————————————————————————————————————————————————————————————————
// Component

const theme = makeTheme({ cr: 200 })
const ThemeProvider: React.FC<{ children: React.ReactNode }> = props => {
  applyTheme(document.body, theme)
  return <>{props.children}</>
}

export const Splitter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [curColor, setCurColor] = useState<string>('')
  const [color, setColor] = useState<string>('')
  const [sourceImage, setSourceImage] = useState<ImageData>()
  const [cache, setCache] = useState<Record<string, ImageData>>({})
  const [currKey, setCurrKey] = useState<string>('source')

  const setSource = useCallback((data: ImageData) => {
    setCurrKey('source')
    setSourceImage(data)
    const canvas = canvasRef.current!
    canvas.width = data.width
    canvas.height = data.height
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.putImageData(data, 0, 0)
    setCache({})
  }, [])

  const loadFile = useCallback(
    (file?: File | null) => {
      if (!file) return
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const img = new Image()
        img.src = URL.createObjectURL(file)
        img.onload = () => {
          canvas.height = img.height
          canvas.width = img.width
          ctx.drawImage(img, 0, 0)
          setSource(ctx.getImageData(0, 0, img.width, img.height))
        }
      }
    },
    [setSource]
  )

  const loadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    loadFile(e.target.files![0])
  }

  useEffect(() => {
    document.body.addEventListener('paste', handlePaste)
    document.body.addEventListener('drop', handleDrop)
    document.body.addEventListener('dragover', handleDragOver)
    return () => {
      document.body.removeEventListener('paste', handlePaste)
      document.body.removeEventListener('drop', handleDrop)
      document.body.removeEventListener('dragover', handleDragOver)
    }

    function handleDragOver(this: HTMLElement, e: DragEvent) {
      e.preventDefault()
    }

    function handleDrop(this: HTMLElement, e: DragEvent) {
      e.preventDefault()
      if (!e.dataTransfer) return
      const file = e.dataTransfer.files[0]
      loadFile(file)
    }

    function handlePaste(this: HTMLElement, e: ClipboardEvent) {
      if (!e.clipboardData) return
      for (const item of e.clipboardData.items) {
        if (item.type.startsWith('image')) {
          loadFile(item.getAsFile())
          return
        }
      }
    }
  }, [loadFile])

  const updateImg = (key: string, shader: TShader) => {
    setCurrKey(key)
    if (!sourceImage) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    if (cache[key]) {
      ctx.putImageData(cache[key], 0, 0)
      return
    }
    const newImageData = runShader(sourceImage, shader)
    setCache(c => ({ ...c, [key]: newImageData }))
    ctx.putImageData(newImageData, 0, 0)
  }

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      const [r, g, b] = getEventColor(event)
      setCurColor(`rgb(${r}, ${g}, ${b})`)
    },
    []
  )
  const onMouseClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      const [r, g, b] = getEventColor(event)
      setColor(`rgb(${r}, ${g}, ${b})`)
    },
    []
  )

  return (
    <ThemeProvider>
      <Stack gap={2} p={3} axis="y" style={{ minHeight: '100vh' }}>
        <Stack gap={2} axis="x">
          <Button tag="label">
            Choose image
            <input
              autoFocus
              style={{ position: 'absolute', visibility: 'hidden' }}
              type="file"
              accept="image/*"
              onChange={loadImage}
            />
          </Button>
          {!!curColor && (
            <Button
              use="tetriary"
              onClick={() => navigator.clipboard.writeText(curColor)}
            >
              <span style={{ color: curColor }}>◉</span>
              <span>{curColor}</span>
            </Button>
          )}
          {!!color && (
            <Button
              use="tetriary"
              onClick={() => navigator.clipboard.writeText(color)}
            >
              <span style={{ color }}>◉</span>
              <span>{color}</span>
            </Button>
          )}
        </Stack>

        <Stack gap={1} axis="x" style={{ flexWrap: 'wrap' }}>
          {shdrs.map(({ key, name, shader }) => (
            <Button
              key={key}
              use={currKey === key ? 'primary' : 'secondary'}
              onClick={() => updateImg(key, shader)}
              children={name}
            />
          ))}
        </Stack>

        <div>
          <canvas
            onMouseMove={onMouseMove}
            onClick={onMouseClick}
            ref={canvasRef}
            width={500}
            height={500}
            style={{ borderRadius: 12, cursor: 'crosshair' }}
          />
        </div>
      </Stack>
    </ThemeProvider>
  )
}

// —————————————————————————————————————————————————————————————————————————————
// Helpers

type RGBA = [number, number, number, number]
type TShader = (color: RGBA) => RGBA

function runShader(source: ImageData, shader: TShader): ImageData {
  const imageData = duplicateImageData(source)
  const data = imageData.data
  const cache: Record<string, RGBA> = {}
  for (let i = 0; i < data.length; i += 4) {
    const color = [data[i], data[i + 1], data[i + 2], data[i + 3]] as RGBA
    const key = color.join(',')
    let [r, g, b, a] = (cache[key] ??= shader(color))

    // const [r, g, b, a] = shader([
    //   data[i],
    //   data[i + 1],
    //   data[i + 2],
    //   data[i + 3],
    // ])
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
    data[i + 3] = a
  }
  return imageData
}

function RGBAtoRgb([r, g, b, a]: RGBA) {
  return {
    mode: 'rgb',
    alpha: a / 255,
    r: r / 255,
    g: g / 255,
    b: b / 255,
  } as Rgb
}

function RgbToRGBA({ r, g, b, alpha }: Rgb) {
  return [r * 255, g * 255, b * 255, alpha ? alpha * 255 : 255] as RGBA
}

function duplicateImageData(imageData: ImageData): ImageData {
  const newImageData = new ImageData(imageData.width, imageData.height)
  newImageData.data.set(imageData.data)
  return newImageData
}

function displayableP3(color: Color): boolean {
  const colorP3 = p3(color)
  return (
    colorP3.r >= 0 &&
    colorP3.r <= 1 &&
    colorP3.g >= 0 &&
    colorP3.g <= 1 &&
    colorP3.b >= 0 &&
    colorP3.b <= 1
  )
}

function getEventColor(
  event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
): RGBA {
  const canvas = event.currentTarget
  const ctx = canvas.getContext('2d')
  if (!ctx) return [0, 0, 0, 0]
  const rect = canvas.getBoundingClientRect()
  const x =
    ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width
  const y =
    ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height
  return ctx.getImageData(x, y, 1, 1).data as unknown as RGBA
}
