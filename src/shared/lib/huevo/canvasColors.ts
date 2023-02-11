import { Color, p3, P3, rgb, Rgb } from 'culori'

export type RGBA = [number, number, number, number]

export function fromRGBA(color: RGBA, mode?: 'srgb'): Rgb
export function fromRGBA(color: RGBA, mode: 'p3'): P3
export function fromRGBA(color: RGBA, mode: 'p3' | 'srgb' = 'srgb'): P3 | Rgb {
  const [r, g, b, a] = color
  return {
    mode: mode === 'srgb' ? 'rgb' : 'p3',
    alpha: a / 255,
    r: r / 255,
    g: g / 255,
    b: b / 255,
  }
}

export function toRGBA(color: Color, mode: 'srgb' | 'p3' = 'srgb'): RGBA {
  const c = mode === 'srgb' ? rgb(color) : p3(color)
  return [
    c.r * 255,
    c.g * 255,
    c.b * 255,
    c.alpha ? c.alpha * 255 : 255,
  ] as RGBA
}
