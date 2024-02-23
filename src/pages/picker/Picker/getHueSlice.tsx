import type { Color, Oklch } from 'culori'
import type { RGBA } from './Pixels'
import { p3, rgb } from 'culori'
import { betterToeInv } from '@/shared/lib/huelab'
// import { getMaxChroma } from '@/shared/lib/huelab/oklch/getMaxChroma'
import { Gamut, MAX_GAMUT_CHROMA } from './shared'
import { Pixels } from './Pixels'
import { getEdge } from '@/shared/lib/huelab/gamut-mapping'

function toRGBA(color: Color, gamut: Gamut): RGBA {
  const { r, g, b } = gamut === 'display-p3' ? p3(color) : rgb(color)
  return [
    Math.round(Math.min(Math.max(0, r), 1) * 255),
    Math.round(Math.min(Math.max(0, g), 1) * 255),
    Math.round(Math.min(Math.max(0, b), 1) * 255),
    255,
  ]
}

export function getHueSlice(props: {
  width: number
  height: number
  gamut: Gamut
  hue: number
}) {
  const { width, height, hue, gamut } = props
  const pixels = new Pixels(width, height)

  for (let y = 0; y < height; y++) {
    const l = betterToeInv(y / (height - 1))
    const maxChroma = getEdge(l, hue, gamut)
    const cuspOklch: Oklch = { mode: 'oklch', l, c: maxChroma, h: hue }
    const cuspRGBA = toRGBA(cuspOklch, gamut)

    for (let x = 0; x < width; x++) {
      const c = (x / (width - 1)) * MAX_GAMUT_CHROMA[gamut]
      if (c >= maxChroma) {
        pixels.set(x, y, cuspRGBA)
        continue
      }

      const color: Oklch = { mode: 'oklch', l, c, h: hue }
      pixels.set(x, y, toRGBA(color, gamut))
    }
  }
  return pixels.toImageBitmap({ colorSpace: gamut })
}
