import {
  clampChroma,
  displayable,
  fromRGBA,
  RGBA,
  toRGBA,
} from '@/shared/lib/huelab'
import { clampRgb, Oklch, oklch } from 'culori'

export type TShader = (
  color: RGBA,
  inSpace: PredefinedColorSpace,
  toSpace: PredefinedColorSpace
) => RGBA
export type TLense = (data: ImageData) => ImageData

export const lenses: { name: string; lense: TLense }[] = [
  {
    name: 'Source',
    lense: data => data,
  },

  {
    name: 'Lightness',
    lense: lense(okShader(ok => ({ ...ok, c: 0, h: 0 }))),
  },

  {
    name: 'Hue',
    lense: lense(okShader(ok => ({ ...ok, l: 0.75, c: 0.125 }))),
  },

  {
    name: 'Chroma',
    lense: lense(okShader(ok => ({ ...ok, l: 0.728, h: 327 }))),
  },

  {
    name: 'Hue + chroma',
    lense: lense(okShader(ok => ({ ...ok, l: 0.75 }))),
  },

  {
    name: 'Lightness + chroma',
    lense: lense(okShader(ok => ({ ...ok, h: 327 }))),
  },

  {
    name: 'sRGB edge',
    lense: lense(color => {
      const black = [0, 0, 0, 255] as RGBA
      // The most saturated colors are on edges of RGB cube
      if (isOnEdge(color)) return color
      return black
    }),
  },

  {
    name: 'P3 improvable',
    lense: lense(color => {
      const black = [0, 0, 0, 255] as RGBA

      // Cut out nearly black and nearly white colors
      const [r, g, b] = color
      if (r < 5 && g < 5 && b < 5) return black
      if (r > 250 && g > 250 && b > 250) return black

      // The most saturated colors are on edges of RGB cube
      if (!isOnEdge(color)) return black

      //  minimal chroma improvement that will be counted
      const minImprovement = 0.02
      const okColor = oklch(fromRGBA(color, 'srgb'))
      const canBeImproved = displayable(
        {
          ...okColor,
          c: okColor.c + minImprovement,
        },
        'display-p3'
      )
      return canBeImproved ? color : black
    }),
  },

  {
    name: 'Max chroma',
    lense: lense(okShader(ok => ({ ...ok, c: 0.4 }))),
  },

  {
    name: 'Max chroma P3',
    lense: lense(
      okShader(ok => ({ ...ok, c: 0.4 })),
      'display-p3'
    ),
  },

  {
    name: 'Stretch to P3',
    lense: lense(c => c, 'display-p3'),
  },

  {
    name: 'Stretch to P3 in sRGB',
    lense: lense((rgba, inSpace, toSpace) => {
      return toRGBA(clampRgb(fromRGBA(rgba, 'display-p3')))
    }, 'srgb'),
  },

  {
    name: 'Stretch to P3 in sRGB 2',
    lense: lense((rgba, inSpace, toSpace) => {
      const afterStretch = toOklch(rgba, 'display-p3')
      if (displayable(afterStretch, 'srgb')) {
        return toRGBA(afterStretch, 'srgb')
      }
      return toRGBA(
        clampChroma({ ...toOklch(rgba, 'srgb'), c: afterStretch.c }, 'srgb')
      )
    }, 'srgb'),
  },

  {
    name: 'Stretch smart',
    lense: lense((rgba, inSpace, toSpace) => {
      const color = fromRGBA(rgba, inSpace)
      if (!isOnEdge(rgba)) return toRGBA(color, toSpace)
      const maxChroma = clampChroma({ ...oklch(color), c: 0.4 }, toSpace)
      return toRGBA(maxChroma, toSpace)
    }, 'display-p3'),
  },
]

function lense(shader: TShader, toSpace?: PredefinedColorSpace): TLense {
  return imageData => {
    const colorSpace = toSpace || imageData.colorSpace
    const newImageData = new ImageData(imageData.width, imageData.height, {
      colorSpace,
    })
    newImageData.data.set(convertData(imageData, shader, colorSpace))
    return newImageData
  }
}

function convertData(
  image: ImageData,
  shader: TShader,
  toSpace: PredefinedColorSpace
): Uint8ClampedArray {
  const { data, colorSpace } = image
  const result = new Uint8ClampedArray(data.length)
  const cache: Record<string, RGBA> = {}
  for (let i = 0; i < data.length; i += 4) {
    const color = [data[i], data[i + 1], data[i + 2], data[i + 3]] as RGBA
    const key = color.join(',')
    let [r, g, b, a] = (cache[key] ??= shader(color, colorSpace, toSpace))
    result[i] = r
    result[i + 1] = g
    result[i + 2] = b
    result[i + 3] = a
  }
  return result
}

function okShader(fn: (color: Oklch) => Oklch): TShader {
  return (color, space, toSpace) =>
    toRGBA(clampChroma(fn(toOklch(color, space)), toSpace), toSpace)
}

function toOklch(color: RGBA, colorSpace: PredefinedColorSpace) {
  return oklch(fromRGBA(color, colorSpace))
}

function isOnEdge(color: RGBA) {
  const [r, g, b] = color
  const tolerance = 1
  return (
    r <= 0 + tolerance ||
    r >= 255 - tolerance ||
    g <= 0 + tolerance ||
    g >= 255 - tolerance ||
    b <= 0 + tolerance ||
    b >= 255 - tolerance
  )
}
