export enum Gamut {
  SRGB = 'srgb',
  P3 = 'display-p3',
}

/**
 * Magenta is the most saturated OKLCH color in sRGB gamut
 * Color: { mode: 'rgb', r: 1, g: 0, b: 1 }
 * Chroma: 0.32249096477516487
 */
const MAX_SRGB_CHROMA = 0.323

/**
 * Green is the most saturated OKLCH color in Display P3 gamut
 * Color: { mode: 'p3', r: 0, g: 1, b: 0 }
 * Chroma: 0.36852781063661505
 */
const MAX_P3_CHROMA = 0.369

export const getMaxChroma = (mode: Gamut) => {
  return mode === Gamut.SRGB ? MAX_SRGB_CHROMA : MAX_P3_CHROMA
}
