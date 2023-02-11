import { Oklch } from 'culori'
import { clampChroma, getContrastColor } from './huevo'

type TLRule =
  | number
  | { type: 'luminance'; index: number; change: number }
  | { type: 'contrast'; index: number; value: number }

export function resolveRow(hue: number, chroma: number, row: TLRule[]) {
  let lRow: number[] = []

  row.forEach((rule, i) => {
    if (typeof rule === 'number') {
      lRow.push(rule)
    } else if (rule.type === 'luminance') {
      if (rule.index >= i) throw new Error('link to future')
      lRow.push(lRow[rule.index] + rule.change)
    } else if (rule.type === 'contrast') {
      if (rule.index >= i) throw new Error('link to future')
      const resultingColor = getContrastColor(
        clampChroma({ mode: 'oklch', l: lRow[rule.index], c: chroma, h: hue }),
        rule.value
      )
      lRow.push(resultingColor.l)
    }
  })

  return lRow.map(l => {
    return clampChroma({ mode: 'oklch', l, c: chroma, h: hue } as Oklch)
  })
}
