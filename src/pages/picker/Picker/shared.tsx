export type Gamut = 'srgb' | 'display-p3'

export const MAX_GAMUT_CHROMA = {
  /**
   * Magenta is the most saturated OKLCH color in sRGB gamut
   * Color: { mode: 'rgb', r: 1, g: 0, b: 1 }
   * Chroma: 0.32249096477516487
   */
  srgb: 0.323,

  /**
   * Green is the most saturated OKLCH color in Display P3 gamut
   * Color: { mode: 'p3', r: 0, g: 1, b: 0 }
   * Chroma: 0.36852781063661505
   */
  'display-p3': 0.369,
}
