import { RGBA } from '@/shared/lib/huelab'
import { applyTheme, makeTheme } from '@/shared/lib/theme'
import { Button } from '@/shared/ui/Button'
import { Stack } from '@/shared/ui/Stack'
import { oklch, P3, rgb, Rgb } from 'culori'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { lenses, TLense } from './lenses'

type Position = [number, number]

const black: Rgb = { mode: 'rgb', r: 0, g: 0, b: 0 }

const theme = makeTheme({ cr: 200 })
const ThemeProvider: React.FC<{ children: React.ReactNode }> = props => {
  applyTheme(document.body, theme)
  return <>{props.children}</>
}

export const Splitter: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loadAsP3, setLoadAsP3] = useState(false)
  const [curColor, setCurColor] = useState<string>('')
  const [color, setColor] = useState<string>('')
  const [sourceImage, setSourceImage] = useState<ImageData>()
  const [cache, setCache] = useState<Record<string, ImageData>>({})
  const [currKey, setCurrKey] = useState<string>('Source')
  const [hoverPos, setHoverPos] = useState<Position>([0, 0])
  const [selectedColor, setSelectedColor] = useState<Rgb | P3>(black)

  const supportP3 = window.matchMedia('(color-gamut: p3)').matches

  const setSource = useCallback((data: ImageData) => {
    setCurrKey('Source')
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
      const ctx = canvas.getContext('2d', {
        colorSpace: loadAsP3 ? 'display-p3' : 'srgb',
      })
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
    [loadAsP3, setSource]
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

  const forceUpdateImg = (key: string, lense: TLense) => {
    setCurrKey(key)
    if (!sourceImage) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const newImageData = lense(sourceImage)
    setCache(c => ({ ...c, [key]: newImageData }))
    ctx.putImageData(newImageData, 0, 0)
  }

  const updateImg = (key: string, lense: TLense) => {
    setCurrKey(key)
    if (!sourceImage) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    if (cache[key]) {
      ctx.putImageData(cache[key], 0, 0)
      return
    }
    const newImageData = lense(sourceImage)
    setCache(c => ({ ...c, [key]: newImageData }))
    ctx.putImageData(newImageData, 0, 0)
  }

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      const [r, g, b] = getEventColor(event)
      setCurColor(`rgb(${r}, ${g}, ${b})`)
      setHoverPos(getPosition(event))
    },
    []
  )
  const onMouseClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      const [r, g, b] = getEventColor(event)
      setColor(`rgb(${r}, ${g}, ${b})`)
      setSelectedColor(getColor(cache[currKey], getPosition(event)))
    },
    [cache, currKey]
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
          {lenses.map(({ name, lense }) => (
            <Button
              key={name}
              use={currKey === name ? 'primary' : 'secondary'}
              onClick={() => updateImg(name, lense)}
              onDoubleClick={() => forceUpdateImg(name, lense)}
              children={name}
            />
          ))}
        </Stack>

        <ColorInfo
          color={getColor(cache[currKey], hoverPos)}
          selected={selectedColor}
        />

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

function getEventColor(
  event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
): RGBA {
  const canvas = event.currentTarget
  const ctx = canvas.getContext('2d', { colorSpace: 'display-p3' })
  if (!ctx) return [0, 0, 0, 0]
  const rect = canvas.getBoundingClientRect()
  const x =
    ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width
  const y =
    ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height
  return ctx.getImageData(x, y, 1, 1).data as unknown as RGBA
}
function getPosition(
  event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
): Position {
  const canvas = event.currentTarget
  const rect = canvas.getBoundingClientRect()
  const x = Math.round(
    ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width
  )
  const y = Math.round(
    ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height
  )
  return [x, y]
}

function getColor(imgData: ImageData, pos: Position) {
  if (!imgData) return { mode: 'rgb', r: 0, g: 0, b: 0 } as Rgb
  const [x, y] = pos
  const { data, width, colorSpace } = imgData
  const start = (y * width + x) * 4
  const color = {
    mode: colorSpace === 'srgb' ? 'rgb' : 'p3',
    r: data[start] / 255,
    g: data[start + 1] / 255,
    b: data[start + 2] / 255,
    alpha: data[start + 3] / 255,
  } as Rgb | P3
  return color
}

function ColorInfo(props: { color: Rgb | P3; selected: Rgb | P3 }) {
  const c = rgb(props.color)
  const ok = oklch(props.color)
  const sc = rgb(props.selected)
  const sok = oklch(props.selected)
  return (
    <>
      <div style={{ fontFamily: 'monospace' }}>
        {`R: ${(c.r * 255).toFixed().padEnd(4, ' ')}` +
          ' ' +
          `G: ${(c.g * 255).toFixed().padEnd(4, ' ')}` +
          ' ' +
          `B: ${(c.b * 255).toFixed().padEnd(4, ' ')}` +
          '  ' +
          `L: ${ok.l.toFixed(3).padEnd(6, ' ')}` +
          ' ' +
          `C: ${ok.c.toFixed(3).padEnd(6, ' ')}` +
          ' ' +
          `H: ${String(+(ok.h || 0).toFixed(3)).padEnd(6, ' ')}`}
      </div>
      <div style={{ fontFamily: 'monospace' }}>
        {`R: ${(sc.r * 255).toFixed().padEnd(4, ' ')}` +
          ' ' +
          `G: ${(sc.g * 255).toFixed().padEnd(4, ' ')}` +
          ' ' +
          `B: ${(sc.b * 255).toFixed().padEnd(4, ' ')}` +
          '  ' +
          `L: ${sok.l.toFixed(3).padEnd(6, ' ')}` +
          ' ' +
          `C: ${sok.c.toFixed(3).padEnd(6, ' ')}` +
          ' ' +
          `H: ${String(+(sok.h || 0).toFixed(3)).padEnd(6, ' ')}`}
      </div>
    </>
  )
}
