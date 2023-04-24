/*
  This toe functions described here
  https://bottosson.github.io/posts/colorpicker/#intermission---a-new-lightness-estimate-for-oklab
*/

const k1 = 0.206
const k2 = 0.03
const k3 = (1 + k1) / (1 + k2)

/** Converts OKLAB lightnes to Lab-like */
export const betterToe = (x: number) =>
  0.5 *
  (k3 * x - k1 + Math.sqrt((k3 * x - k1) * (k3 * x - k1) + 4 * k2 * k3 * x))

/** Converts Lab-like lightness back to OKLAB */
export const betterToeInv = (x: number) => (x * x + k1 * x) / (k3 * (x + k2))
