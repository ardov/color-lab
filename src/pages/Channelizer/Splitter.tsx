import { clampChroma } from '@/shared/lib/colors'
import { applyTheme, makeTheme } from '@/shared/lib/theme'
import { Button } from '@/shared/ui/Button'
import { Stack } from '@/shared/ui/Stack'
import { oklch, rgb, Rgb } from 'culori'
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

const shaders = {
  source,
  lightnessOnly,
  hueOnly,
  chromaOnly,
  noLightness,
  noHue,
}

type TKey = keyof typeof shaders

// —————————————————————————————————————————————————————————————————————————————
// Component

const theme = makeTheme({ cr: 200 })
const ThemeProvider: React.FC<{ children: React.ReactNode }> = props => {
  applyTheme(document.body, theme)
  return <>{props.children}</>
}

export const Channelizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [sourceImage, setSourceImage] = useState<ImageData>()
  const [cache, setCache] = useState<Record<string, ImageData>>({})
  const [currKey, setCurrKey] = useState<TKey>('source')

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

  const updateImg = (key: TKey) => {
    setCurrKey(key)
    if (!sourceImage) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    if (cache[key]) {
      ctx.putImageData(cache[key], 0, 0)
      return
    }
    const newImageData = runShader(sourceImage, shaders[key])
    setCache(c => ({ ...c, [key]: newImageData }))
    ctx.putImageData(newImageData, 0, 0)
  }

  const modes: { key: TKey; name: string }[] = [
    { key: 'source', name: 'Source' },
    { key: 'lightnessOnly', name: 'Lightness' },
    { key: 'chromaOnly', name: 'Chroma' },
    { key: 'hueOnly', name: 'Hue' },
    { key: 'noLightness', name: 'Hue + chroma' },
    { key: 'noHue', name: 'Lightness + chroma' },
  ]

  return (
    <ThemeProvider>
      <Stack gap={2} p={3} axis="y" style={{ minHeight: '100vh' }}>
        <div>
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
        </div>

        <Stack gap={1} axis="x" style={{ flexWrap: 'wrap' }}>
          {modes.map(({ key, name }) => (
            <Button
              key={key}
              use={currKey === key ? 'primary' : 'secondary'}
              onClick={() => updateImg(key)}
              children={name}
            />
          ))}
        </Stack>

        <div>
          <canvas
            ref={canvasRef}
            width={500}
            height={500}
            style={{ borderRadius: 12 }}
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
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = shader([
      data[i],
      data[i + 1],
      data[i + 2],
      data[i + 3],
    ])
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
