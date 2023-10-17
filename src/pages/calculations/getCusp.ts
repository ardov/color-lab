import { Oklch, oklch, rgb } from 'culori'

type LCH = [number, number, number]
type Converter = (r: number, g: number, b: number) => LCH

// —————————————————————————————————————————————————————————————————————————————
// —————————————————————————————————————————————————————————————————————————————
// Converters

const srgbToOklch: Converter = (r, g, b) => {
  const { l, c, h } = oklch({ mode: 'rgb', r, g, b })
  return [l, c, h || 0]
}

const p3ToOklch: Converter = (r, g, b) => {
  const { l, c, h } = oklch({ mode: 'p3', r, g, b })
  return [l, c, h || 0]
}

// —————————————————————————————————————————————————————————————————————————————
// —————————————————————————————————————————————————————————————————————————————
// Helpers

/** Makes a list of steps from 0 to 1 */
function makeValueList(steps: number) {
  return new Array(steps).fill(0).map((_, i) => i / (steps - 1))
}

/**
 * In the blue peak (blue-cyan side) the hue can go backwards.
 * This function removes those glitches.
 */
function removeGlitches(section: LCH[]) {
  const minHue = section[0][2]
  const maxHue = section[section.length - 1][2]
  // Filter out hues that are outside of the section
  return section.filter(color => color[2] >= minHue && color[2] <= maxHue)
}

/** Linear interpolation */
function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** Interpolate between two colors by hue */
function interpolateByHue(h: number, start: LCH, end: LCH) {
  const t = (h - start[2]) / (end[2] - start[2])
  const l = lerp(start[0], end[0], t)
  const c = lerp(start[1], end[1], t)
  return [l, c, h] as LCH
}

/**
 * Creates a cusp at 0 hue
 * @param last LCH before 0
 * @param first LCH after 360
 */
function makeZeroCusp(first: LCH, last: LCH) {
  let [minL, minC, minH] = last
  let [maxL, maxC, maxH] = first
  minH -= 360 // will be negative
  const t = (0 - minH) / (maxH - minH)
  const l = minL + (maxL - minL) * t
  const c = minC + (maxC - minC) * t
  return {
    cusp0: [l, c, 0] as LCH,
    cusp360: [l, c, 360] as LCH,
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
      const interpolated = interpolateByHue(cusp[2], prev, next)
      const lError = Math.abs(cusp[0] - interpolated[0])
      const cError = Math.abs(cusp[1] - interpolated[1])
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

// —————————————————————————————————————————————————————————————————————————————
// —————————————————————————————————————————————————————————————————————————————
// LUT precalculation

/**
 * Precalculates the list of cusps in OKLCH space
 * @param rgb2oklch converter from RGB to OKLCH
 * @param steps number of steps in each section
 */
export function precalculateCusps(
  rgb2oklch: Converter = srgbToOklch,
  steps = 256
) {
  const valueList = makeValueList(steps)

  // Make hue segments red-yelow-green-cyan-blue-magenta-red
  // Also remove potential glitches in the blue segment
  const ryCusps = valueList.map(val => rgb2oklch(1, val, 0))
  const ygCusps = valueList.map(val => rgb2oklch(1 - val, 1, 0))
  const gcCusps = valueList.map(val => rgb2oklch(0, 1, val))
  const cbCusps = removeGlitches(valueList.map(val => rgb2oklch(0, 1 - val, 1)))
  const bmCusps = valueList.map(val => rgb2oklch(val, 0, 1))
  const mrCusps = valueList.map(val => rgb2oklch(1, 0, 1 - val))

  // Merge the segments together
  const cusps = [
    ...ryCusps.slice(0, -1), // remove last colors to avoid duplicates
    ...ygCusps.slice(0, -1),
    ...gcCusps.slice(0, -1),
    ...cbCusps.slice(0, -1),
    ...bmCusps.slice(0, -1),
    ...mrCusps.slice(0, -1),
  ].sort((a, b) => a[2] - b[2]) // ascending sort by hue

  // Add 0 and 360 cusps
  const { cusp0, cusp360 } = makeZeroCusp(cusps[0], cusps[cusps.length - 1])
  const completeCuspList = [cusp0, ...cusps, cusp360]

  // Next steps:
  // - [optional] remove cusps that are too close to each other and can be interpolated
  // - split the cusps into 360 sections for faster lookup
  const filtered = filterInterpolatableCusps(completeCuspList)
  console.log('completeCuspList', completeCuspList.length)
  console.log('filtered', filtered.length)

  return filtered
}

// —————————————————————————————————————————————————————————————————————————————
// —————————————————————————————————————————————————————————————————————————————
// Getting cusp color for a given hue

/**
 * Find the closest index of cusp color in the array
 * @param hue value to search for
 * @param cuspColors sorted array of cusp colors in OKLCH
 */
function getClosestCuspIdx(hue: number, cuspColors: LCH[]) {
  let start = 0
  let end = cuspColors.length - 1
  let mid = Math.floor((start + end) / 2)

  while (start <= end) {
    if (cuspColors[mid][2] === hue) {
      return mid
    } else if (cuspColors[mid][2] < hue) {
      start = mid + 1
    } else {
      end = mid - 1
    }
    mid = Math.floor((start + end) / 2)
  }

  return mid
}

export function getCuspByHue(hue: number, cuspColors: LCH[]) {
  const idx = getClosestCuspIdx(hue, cuspColors)
  const closest = cuspColors[idx]
  if (closest[2] === hue) {
    return closest
  }
  let start = closest
  let end = closest
  if (closest[2] < hue) {
    end = cuspColors[idx + 1]
  }
  if (closest[2] > hue) {
    start = cuspColors[idx - 1]
  }

  return interpolateByHue(hue, start, end)
}

export function getMaxChroma(h: number, l: number, cusps: LCH[]) {
  if (l >= 1) return 0
  if (l <= 0) return 0
  const [cuspL, cuspC] = getCuspByHue(h, cusps)
  if (l <= cuspL) {
    return (l / cuspL) * cuspC
  }
  // l > cuspL
  // TODO: this is rough approximation, should be improved
  return ((1 - l) / (1 - cuspL)) * cuspC
}

// —————————————————————————————————————————————————————————————————————————————
// —————————————————————————————————————————————————————————————————————————————
// Checking error rate

const checkErrorRate = () => {
  const colorsCount = 10_000
  const alertTreshold = 0.0002
  const colors = makeValueList(colorsCount).map(val =>
    rgb({ mode: 'hsl', h: val * 360, s: 1, l: 0.5 })
  )
  const start = performance.now()
  const cusps = precalculateCusps()
  const end = performance.now()
  console.log('precalculateCusps took', +(end - start).toFixed(4), 'ms')

  const errors = [] as number[]

  colors.forEach(origRgb => {
    const origOk = oklch(origRgb)
    const [l, c, h] = getCuspByHue(origOk.h || 0, cusps)
    if (h >= 264.03 && h <= 264.209) return
    const calculatedOk: Oklch = { mode: 'oklch', l, c, h }
    const calculatedRgb = rgb(calculatedOk)
    const rError = Math.abs(origRgb.r - calculatedRgb.r)
    const gError = Math.abs(origRgb.g - calculatedRgb.g)
    const bError = Math.abs(origRgb.b - calculatedRgb.b)

    errors.push(rError, gError, bError)

    if (
      rError > alertTreshold ||
      gError > alertTreshold ||
      bError > alertTreshold
    ) {
      console.log('Too big error for hue: ', +h.toFixed(3), {
        origRgb,
        origOk,
        calculatedOk,
        calculatedRgb,

        rError,
        gError,
        bError,
      })
    }
  })

  const avgError = errors.reduce((acc, val) => acc + val, 0) / errors.length
  console.log('Total cusps', cusps.length)
  console.log('Avg error', +avgError.toFixed(6))
  console.log('Max error', +Math.max(...errors).toFixed(6))
}

checkErrorRate()
