import { oklch, rgb } from 'culori'
import { LCH } from './types'

export function makeLut(
  gamut: 'srgb' | 'display-p3' = 'srgb',
  slicesPerSection: number = 256,
  hslL: number = 0.5
): LCH[] {
  // Make hue segments red-yelow-green-cyan-blue-magenta-red
  // Also remove potential glitches in the blue segment
  const ryCusps = makeSegment([0, 60], slicesPerSection, hslL, gamut)
  const ygCusps = makeSegment([60, 120], slicesPerSection, hslL, gamut)
  const gcCusps = makeSegment([120, 180], slicesPerSection, hslL, gamut)
  const cbCusps = removeGlitches(
    makeSegment([180, 240], slicesPerSection, hslL, gamut)
  )
  const bmCusps = makeSegment([240, 300], slicesPerSection, hslL, gamut)
  const mrCusps = makeSegment([300, 360], slicesPerSection, hslL, gamut)

  // Merge the segments together
  const cusps = [
    ...ryCusps.slice(0, -1), // remove last colors to avoid duplicates
    ...ygCusps.slice(0, -1),
    ...gcCusps.slice(0, -1),
    ...cbCusps.slice(0, -1),
    ...bmCusps.slice(0, -1),
    ...mrCusps.slice(0, -1),
  ].sort((a, b) => a.h - b.h) // ascending sort by hue

  // Add 0 and 360 cusps
  const { cusp0, cusp360 } = makeZeroCusp(cusps[0], cusps[cusps.length - 1])
  const completeCuspList = [cusp0, ...cusps, cusp360]

  // Next steps:
  // - [optional] remove cusps that are too close to each other and can be interpolated
  // - split the cusps into 360 sections for faster lookup
  const filtered = filterInterpolatableCusps(completeCuspList)

  return filtered
}

// —————————————————————————————————————————————————————————————————————————————
// —————————————————————————————————————————————————————————————————————————————
// Helpers

function makeSegment(
  segment: [number, number],
  steps: number,
  hslL: number,
  gamut: 'srgb' | 'display-p3'
) {
  const mode = gamutToMode(gamut)
  const [start, end] = segment
  return makeValueList(steps)
    .map(t => {
      const h = lerp(start, end, t)
      return rgb({ h, s: 1, l: hslL, mode: 'hsl' })
    })
    .map(({ r, g, b }) => {
      const { l, c, h = 0 } = oklch({ mode, r, g, b })
      return { l, c, h } as LCH
    })
}

const gamutToMode = (gamut: 'srgb' | 'display-p3') => {
  if (gamut === 'srgb') return 'rgb'
  if (gamut === 'display-p3') return 'p3'
  throw new Error('Invalid gamut')
}

/** Makes a list of steps from 0 to 1 */
function makeValueList(steps: number) {
  return new Array(steps).fill(0).map((_, i) => i / (steps - 1))
}

/**
 * In the blue peak (blue-cyan side) the hue can go backwards.
 * This function removes those glitches.
 */
function removeGlitches(section: LCH[]) {
  const minHue = section[0].h
  const maxHue = section[section.length - 1].h
  // Filter out hues that are outside of the section
  return section.filter(color => color.h >= minHue && color.h <= maxHue)
}

/** Linear interpolation */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** Interpolate between two colors by hue */
function interpolateByHue(h: number, start: LCH, end: LCH) {
  const t = (h - start.h) / (end.h - start.h)
  const l = lerp(start.l, end.l, t)
  const c = lerp(start.c, end.c, t)
  return { l, c, h } as LCH
}

/**
 * Creates a cusp at 0 hue
 * @param last LCH before 0
 * @param first LCH after 360
 */
function makeZeroCusp(first: LCH, last: LCH) {
  let { l: minL, c: minC, h: minH } = last
  let { l: maxL, c: maxC, h: maxH } = first
  minH -= 360 // will be negative
  const t = (0 - minH) / (maxH - minH)
  const l = minL + (maxL - minL) * t
  const c = minC + (maxC - minC) * t
  return {
    cusp0: { l, c, h: 0 } as LCH,
    cusp360: { l, c, h: 360 } as LCH,
  }
}

function filterInterpolatableCusps(cusps: LCH[], treshold = 0.0001) {
  let f = cusps
  let changed = true
  let lvl = 0

  while (changed) {
    const filtered = f.filter((cusp, idx) => {
      if (idx === 0 || idx === cusps.length - 1 || idx % 2 === 0) {
        return true
      }
      const prev = cusps[idx - 1]
      const next = cusps[idx + 1]
      const interpolated = interpolateByHue(cusp.h, prev, next)
      const lError = Math.abs(cusp.l - interpolated.l)
      const cError = Math.abs(cusp.c - interpolated.c)
      return !(lError <= treshold && cError <= treshold)
    })
    if (filtered.length === f.length) {
      changed = false
    } else {
      f = filtered
      lvl++
    }
  }
  console.log('filterInterpolatableCusps lvl', lvl)
  return f
}

/**
 * Function removes sections of LUT where the hue goes backwards. The result will be a monotone increasing LCH values
 */
function makeMonotone(lut: LCH[]): LCH[] {
  const filtered = lut.filter((color, idx) => {
    if (idx === 0 || idx === lut.length - 1) {
      return true
    }
    const prev = lut[idx - 1]
    const next = lut[idx + 1]
    return prev.h <= color.h && color.h <= next.h
  })
  return filtered
}

// export function makeMonotone2(list: number[]): number[] {

// }
function fixSection(list: number[]): number[] {
  let needFix = false
  let newArray = [] as number[]

  for (let i = 0; i < list.length; i++) {
    const isLast = i === list.length - 1
    const willIncrease = isLast || isClockwise(list[i], list[i + 1])
    // Ideal scenario of monotone increasing
    if (willIncrease && !needFix) {
      newArray.push(list[i])
      continue
    }
    // Decreasing but not the last point of decrease -> need fix
    if (!willIncrease && !isLast) {
      if (!needFix) {
        newArray.push(list[i]) // add the last point before decrease
        needFix = true
      }
      continue
    }

    // We are at the last point of decrease and need to fix previous points
    // TODO: fix previous points
  }

  return newArray
}

/** Checks if hues go clockwise */
export function isClockwise(h1: number, h2: number): boolean {
  let diff = (h2 - h1) % 360
  if (diff < 0) diff += 360
  return diff <= 180
}
