type HueName = string
type ToneName = string
type Rule = { l?: number; c?: number; h?: number }

export type Theme = {
  name: string
  mode: 'oklch' | 'oklchToe' | 'lch'
  tones: ToneName[]
  hues: HueName[]
  colors: string[][]
  rules: []
}

type Row = {
  name: HueName
  colors: string[]
  rules: Rule[]
}

type ResolvedColor = {
  oklchToe: { l: number; c: number; h: number }
  oklch: { l: number; c: number; h: number }
  lch: { l: number; c: number; h: number }
  rgb: { r: number; g: number; b: number }
  p3: { r: number; g: number; b: number }
  withinRGB: boolean
  withinP3: boolean
}
