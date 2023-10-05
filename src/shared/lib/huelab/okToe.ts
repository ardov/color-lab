/*
  OKLAB lightness scale is designed for HDR colors. To work nicely with non-HDR gamuts like sRGB, we need to apply a toe function to the lightness.

  This toe functions described here
  https://bottosson.github.io/posts/colorpicker/#intermission---a-new-lightness-estimate-for-oklab
*/

const k1 = 0.206
const k2 = 0.03
const k3 = (1 + k1) / (1 + k2)

/**
 * Converts OKLAB lightnes to Lab-like (to work with non-hdr gamuts like sRGB)
 * @param l OKLAB lightness 0-1
 * @returns Lab-like lightness 0-1
 */
export const betterToe = (l: number) =>
  0.5 *
  (k3 * l - k1 + Math.sqrt((k3 * l - k1) * (k3 * l - k1) + 4 * k2 * k3 * l))

/**
 * Converts Lab-like lightness back to OKLAB
 * @param l Lab-like lightness 0-1
 * @returns OKLAB lightness 0-1
 */
export const betterToeInv = (l: number) => (l * l + k1 * l) / (k3 * (l + k2))
