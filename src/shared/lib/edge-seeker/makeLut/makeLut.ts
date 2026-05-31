import type { LCH, RGB } from './utils'
import { getColor } from './utils'
import { makeColorList } from './makeColorList'
import { calculateCurvatureFromColors } from './calculateCurvature'

/**
 * Generates a lookup table with the most colorful colors and curvatures of a top section.
 * @param rgbToOklch converter from RGB to OKLCH
 * @param stepsPerEdge defines how precise the lookup table will be
 */
export function makeLut(
  rgbToOklch: (rgb: RGB) => LCH,
  stepsPerEdge: number,
): Float32Array {
  // A list of the most colorful colors (the peaks in OKLCH)
  const edgeColors = makeColorList(rgbToOklch, 0.5, stepsPerEdge)
  // Colors in the top section of the OKLCH space needed to calculate curvature
  // 0.802 is just a hand-picked lightness that gives good curvature results
  const curveColors = makeColorList(rgbToOklch, 0.802, stepsPerEdge)

  const lut = edgeColors.map(peakColor => {
    const curveColor = getColor(peakColor.h, curveColors)
    const curvature = calculateCurvatureFromColors(peakColor, curveColor)
    return { ...peakColor, curvature }
  })

  const array = new Float32Array(lut.length * 4)
  for (let i = 0; i < lut.length; i++) {
    const item = lut[i]
    array[i * 4] = item.h
    array[i * 4 + 1] = item.c
    array[i * 4 + 2] = item.l
    array[i * 4 + 3] = item.curvature
  }
  return array
}
