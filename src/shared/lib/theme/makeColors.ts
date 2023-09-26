import { formatHsl, Oklch, p3, P3, rgb, Rgb } from 'culori'
import {
  betterToe,
  betterToeInv,
  clampChroma,
  getContrastColor,
} from '../huelab'
import { keys, entries } from '@/shared/types'

type TValue = number | { light: number; dark: number }

type TRuleLightness = {
  type: 'LIGHTNESS'
  value: TValue
  c?: number
}
type TRuleLightnessOffset = {
  type: 'LIGHTNESS_OFFSET'
  value: TValue
  ref: string // name of the color
  c?: number
}
type TRuleContrastAPCA = {
  type: 'CONTRAST_APCA'
  value: TValue
  ref: string // name of the color
  c?: number
}
type TRuleContrastWCAG = {
  type: 'CONTRAST_WCAG'
  value: TValue
  ref: string // name of the color
  c?: number
}

type TRule =
  | TRuleLightness
  | TRuleLightnessOffset
  | TRuleContrastAPCA
  | TRuleContrastWCAG

function rule(
  type: TRule['type'],
  value: TRule['value'],
  ref: string,
  c?: TRule['c']
): TRule {
  return { type, value, ref, c }
}

type TColorSolved = {
  rule: TRule
  oklch: Oklch
  rgb: Rgb
  p3: P3
}

export function makeColors(
  themeType: 'light' | 'dark',
  opts?: {
    chroma?: number
    hue?: number
    hueShift?: number
    contrast?: number
  }
) {
  const { chroma = 0, hue = 0, hueShift = 0, contrast = 60 } = opts || {}

  const cr = contrast
  const baseL = { light: 1, dark: 0.1 }
  const appBgL = { light: 0.975, dark: 0.05 }
  const step = { light: -0.04, dark: 0.04 }
  const shadowL = { light: 0.1, dark: 0.1 }
  const getHue = (l: number) => {
    return themeType === 'light'
      ? lerp(hue, hue + hueShift, l)
      : lerp(hue + hueShift, hue, l)
  }

  // console.log('Hue', themeType, getHue(0), getHue(1))

  const lowC = Math.min(chroma, 0.08)

  // prettier-ignore
  const colors = {
  // Name                   Rule type           Value   Reference color   Chroma
    'base':           rule('LIGHTNESS',         baseL,  '',               lowC),
    'app-bg':         rule('LIGHTNESS',         appBgL, '',               lowC),
    'surface-normal': rule('LIGHTNESS_OFFSET',  step,   'base',           lowC),
    'surface-hover':  rule('LIGHTNESS_OFFSET',  step,   'surface-normal', lowC),
    'surface-active': rule('LIGHTNESS_OFFSET',  step,   'surface-hover',  lowC),
    'divider':        rule('LIGHTNESS_OFFSET',  0,      'surface-hover',  lowC),
    'text-secondary': rule('CONTRAST_APCA',     60,     'surface-hover'       ),
    'text-primary':   rule('CONTRAST_APCA',     90,     'surface-hover'       ),
    'btn-normal':     rule('CONTRAST_WCAG',     cr,     'base'                ),
    'btn-hover':      rule('LIGHTNESS_OFFSET',  step,   'btn-normal'          ),
    'btn-active':     rule('LIGHTNESS_OFFSET',  step,   'btn-hover'           ),
    'btn-text':       rule('CONTRAST_APCA',     75,     'btn-normal'          ),
    'shadow':         rule('LIGHTNESS',         shadowL,''                    ),
  }

  type TThemeKey = keyof typeof colors

  const solved: Record<string, TColorSolved> = {}
  keys(colors).forEach(solveColor)

  return Object.fromEntries(
    entries(solved).map(([name, color]) => {
      return [name, formatHsl(color.rgb)]
    })
  ) as Record<TThemeKey, string>

  function solveColor(name: TThemeKey, depth: number = 0): TColorSolved {
    if (depth > 100) throw new Error("Cycled deps, can't solve " + name)

    // Check if we already solved this color
    if (solved[name]) return solved[name]

    // If not solved get raw color
    const rule = colors[name]
    if (!rule) throw new Error(`Could not find color: ${name}`)

    const c = rule.c === undefined ? chroma : rule.c
    const value =
      typeof rule.value === 'number' ? rule.value : rule.value[themeType]

    if (rule.type === 'LIGHTNESS') {
      const l = betterToeInv(value)
      solved[name] = makeSolved(rule, { mode: 'oklch', l, c, h: getHue(l) })
      return solved[name]
    }

    const ref = solveColor(rule.ref as TThemeKey, depth + 1)

    if (rule.type === 'LIGHTNESS_OFFSET') {
      const l = betterToeInv(betterToe(ref.oklch.l) + value)
      solved[name] = makeSolved(rule, { mode: 'oklch', l, c, h: getHue(l) })
      return solved[name]
    }

    if (rule.type === 'CONTRAST_APCA') {
      const okColor = getContrastColor(ref.oklch, value, 'apca', chroma, getHue)
      solved[name] = makeSolved(rule, okColor)
      return solved[name]
    }

    if (rule.type === 'CONTRAST_WCAG') {
      const okColor = getContrastColor(ref.oklch, value, 'wcag', chroma, getHue)
      solved[name] = makeSolved(rule, okColor)
      return solved[name]
    }

    throw Error('Unknown type')
  }

  function makeSolved(rule: TRule, okColor: Oklch): TColorSolved {
    return {
      rule,
      oklch: okColor,
      rgb: rgb(clampChroma(okColor, 'srgb')),
      p3: p3(clampChroma(okColor, 'display-p3')),
    }
  }
}

function clamp(x: number, min = 0, max = 1) {
  if (x >= max) return max
  if (x <= min) return min
  return x
}

function lerp(from: number, to: number, t: number) {
  return from + (to - from) * clamp(t)
}
