import { lerp } from './interpolation'

type RGBA = [number, number, number, number]

export const colorLerp = (start: RGBA, end: RGBA, t: number) => {
  if (t <= 0) return start
  if (t >= 1) return end
  return start.map((v, i) => lerp(start[i], end[i], t)) as RGBA
}

export const colorScale = (stops: RGBA[]): ((t: number) => RGBA) => {
  const n = stops.length
  if (n === 1) return () => stops[0]
  const sectionWidth = 1 / (n - 1)

  return (t: number) => {
    if (t <= 0) return stops[0]
    if (t >= 1) return stops[n - 1]
    const i0 = Math.floor((n - 1) * t)
    const i1 = i0 + 1
    const c0 = stops[i0]
    const c1 = stops[i1]
    const tNormalized = (t % sectionWidth) / sectionWidth
    return colorLerp(c0, c1, tNormalized)
  }
}
