import { Color, converter, interpolate, Mode, oklab } from 'culori'
import { clampChroma } from './colors'
import { betterToe } from './okToe'

type ColorStop = [Color, number]

export function gradientToRgb(
  stops: ColorStop[],
  mode: Mode = 'rgb',
  treshold: number = 0.01
) {
  const pairs = splitIntoPairs(stops)
  const resolvedPairs = pairs.map(pair => resolvePair(pair, mode, treshold))
  return mergePairs(resolvedPairs)
}

function splitIntoPairs(stops: ColorStop[]) {
  const pairs = [] as [ColorStop, ColorStop][]
  for (let i = 0; i < stops.length - 1; i++) {
    pairs.push([stops[i], stops[i + 1]])
  }
  return pairs
}

function resolvePair(
  pair: [ColorStop, ColorStop],
  mode: Mode,
  treshold: number
): ColorStop[] {
  const [a, b] = pair
  const [rawColorA, positionA] = a
  const [rawColorB, positionB] = b
  const toMode = converter(mode)
  const colorA = toMode(rawColorA)
  const colorB = toMode(rawColorB)

  if (positionB <= positionA || okDistance(colorA, colorB) <= treshold) {
    return [
      [colorA, positionA],
      [colorB, positionB],
    ]
  }

  const middleColor = interpolate([colorA, colorB], mode)(0.5)
  const middleColorRgb = interpolate(
    [clampChroma(colorA), clampChroma(colorB)],
    'rgb'
  )(0.5)

  if (okDistance(middleColor, middleColorRgb) <= treshold) {
    return [
      [colorA, positionA],
      [colorB, positionB],
    ]
  }

  const middleStop = [middleColor, (positionA + positionB) / 2] as ColorStop

  return mergePairs([
    resolvePair([a, middleStop], mode, treshold),
    resolvePair([middleStop, b], mode, treshold),
  ])
}

function mergePairs(stops: ColorStop[][]) {
  const result = [] as ColorStop[]
  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i]
    if (i === 0) {
      result.push(...stop)
      continue
    }
    result.push(...stop.slice(1))
  }
  return result
}

/**
 * Computes color difference in Oklab color space with non-HDR transfer function applied
 */
function okDistance(colorA: Color, colorB: Color) {
  const oklabA = oklab(colorA)
  const oklabB = oklab(colorB)

  const lr = betterToe(oklabA.l) - betterToe(oklabB.l)
  const a = oklabA.a - oklabB.a
  const b = oklabA.b - oklabB.b

  return Math.sqrt(lr * lr + a * a + b * b)
}
