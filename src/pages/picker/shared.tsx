import { oklch } from 'culori'

const maxRgbChroma = Math.max(
  oklch({ mode: 'rgb', r: 0, g: 0, b: 1 }).c,
  oklch({ mode: 'rgb', r: 1, g: 0, b: 1 }).c
)
const maxP3Chroma = Math.max(
  oklch({ mode: 'p3', r: 0, g: 0, b: 1 }).c,
  oklch({ mode: 'p3', r: 1, g: 0, b: 1 }).c
)

export const getMaxChroma = (mode: 'srgb' | 'display-p3') => {
  return mode === 'srgb' ? maxRgbChroma : maxP3Chroma
}
