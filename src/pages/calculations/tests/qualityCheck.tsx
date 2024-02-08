import { Color, Oklch, P3, Rgb, formatHex, p3, rgb } from 'culori'
import { TestData, makeTestSet } from './makeTestData'

type Gamut = 'srgb' | 'display-p3'
type SearchFunc = (l: number, h: number, gamut?: Gamut) => number

/**
 *
 * @param fn function to analyze
 * @param gamut "srgb" | "display-p3"
 * @param prescision prescision for the deviation check to calculate the error rate for sRGB it would be 1/255
 * @param testDataSlices number of slices for the test data. E.g. 256 means all dots on the surgace of a cube with 256 slices per side
 */
export function analyzeFunction(
  fn: SearchFunc,
  gamut: Gamut,
  prescision: number,
  testDataSlices: number = 256
) {
  // Get test data
  const testData = getCachedTestSet(testDataSlices, gamut)
    // Modifiers
    .filter(({ h }) => h < 264.01 || h > 264.21)
  // .filter(({ h }) => h < 108 || h > 111)
  // .filter(({ h }) => h >= 264.01 && h <= 264.21)

  let stats = {
    all: { checks: 0, errors: 0 },
    top: { checks: 0, errors: 0 },
    middle: { checks: 0, errors: 0 },
    bottom: { checks: 0, errors: 0 },
  }
  let maxChromaDiff = 0
  let mostFailedColor = { hex: '', diff: 0, hue: 0, calculatedHex: '' }

  // Run the tests
  testData.forEach(checkColor)

  return {
    all: stats.all.errors / stats.all.checks,
    top: stats.top.errors / stats.top.checks,
    middle: stats.middle.errors / stats.middle.checks,
    bottom: stats.bottom.errors / stats.bottom.checks,
    maxChromaDiff,
    mostFailedColor,
  }

  function checkColor(data: TestData) {
    const { r, g, b, l, c, h, mode } = data
    const calculatedC = fn(l, h, gamut)
    const chromaDiff = Math.abs(c - calculatedC)
    const calculatedRgb = toRgb({ mode: 'oklch', l, c: calculatedC, h }, gamut)
    const rgbGroup = getRgbGroup(r, g, b)
    const isDifferent = isDifferentEnough(
      { r, g, b },
      calculatedRgb,
      prescision
    )
    // All
    stats.all.checks++
    if (isDifferent) stats.all.errors++
    // Group
    stats[rgbGroup].checks++
    if (isDifferent) stats[rgbGroup].errors++
    // Max diff
    if (chromaDiff > maxChromaDiff) {
      maxChromaDiff = chromaDiff
      mostFailedColor = {
        hex: formatHex({ r, g, b, mode }),
        diff: chromaDiff,
        hue: h,
        calculatedHex: formatHex(calculatedRgb),
      }
    }
  }
}

let cachedTestSet = {
  gamut: 'srgb' as Gamut,
  slices: 256,
  data: makeTestSet('rgb', 256),
}
/** Creates a test set and caches it */
function getCachedTestSet(slices: number, gamut: Gamut) {
  if (cachedTestSet.slices !== slices || cachedTestSet.gamut !== gamut) {
    cachedTestSet = {
      slices,
      gamut,
      data: makeTestSet(gamut === 'display-p3' ? 'p3' : 'rgb', slices),
    }
  }
  return cachedTestSet.data
}

/** Determines the position of the color on the RGB cube */
function getRgbGroup(
  r: number,
  g: number,
  b: number
): 'top' | 'middle' | 'bottom' {
  const haveMin = r === 0 || g === 0 || b === 0
  const haveMax = r === 1 || g === 1 || b === 1
  if (haveMin && haveMax) return 'middle'
  if (haveMin) return 'bottom'
  if (haveMax) return 'top'
  throw new Error('Invalid color')
}

/** Checks if the colors are different enough */
function isDifferentEnough(
  c0: { r: number; g: number; b: number },
  c1: { r: number; g: number; b: number },
  prescision: number
) {
  return (
    Math.abs(c0.r - c1.r) > prescision ||
    Math.abs(c0.g - c1.g) > prescision ||
    Math.abs(c0.b - c1.b) > prescision
  )
}

function toRgb(color: Color, gamut: Gamut) {
  return gamut === 'srgb' ? rgb(color) : p3(color)
}

/** Checks if the conversion is reversible with the given prescision */
function checkReversibility(
  rgbColor: Rgb | P3,
  lchColor: Oklch,
  prescision: number
) {
  const reconverted = rgbColor.mode === 'rgb' ? rgb(lchColor) : p3(lchColor)
  return (
    Math.abs(rgbColor.r - reconverted.r) < prescision &&
    Math.abs(rgbColor.g - reconverted.g) < prescision &&
    Math.abs(rgbColor.b - reconverted.b) < prescision
  )
}
