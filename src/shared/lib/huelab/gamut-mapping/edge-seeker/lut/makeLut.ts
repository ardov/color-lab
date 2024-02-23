import type { OKLCH, LutItem } from '../utils'
import { getColor } from '../utils'
import { makeColorList } from './makeColorList'
import { calculateCurvatureFromColors } from './calculateCurvature'

/**
 * Generates a lookup table with the most colorful colors and curvatures of a top section.
 * @param gamut target gamut
 * @param steps defines how precise the lookup table will be
 */
export function makeLut(
  rgbToOklch: (r: number, g: number, b: number) => OKLCH,
  steps: number
): LutItem[] {
  // A list of the most colorful colors (the peaks in OKLCH)
  const edgeColors = makeColorList(rgbToOklch, 0.5, steps)
  // Colors in the top section of the OKLCH space needed to calculate curvature
  const curveColors = makeColorList(rgbToOklch, 0.762, steps)

  return edgeColors.map(peakColor => {
    const curveColor = getColor(peakColor.h, curveColors)
    const curvature = calculateCurvatureFromColors(peakColor, curveColor)
    return { ...peakColor, curvature }
  })
}
