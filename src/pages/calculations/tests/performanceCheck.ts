type Gamut = 'srgb' | 'display-p3'
type SearchFunc = (l: number, h: number, gamut?: Gamut) => number

export function measurePerformance(
  fn: SearchFunc,
  gamut: Gamut,
  iterations: number
) {
  const lArr = new Array(iterations).fill(0).map(() => Math.random())
  const hArr = new Array(iterations).fill(0).map(() => Math.random() * 360)
  const t0 = performance.now()
  for (let i = 0; i < iterations; i++) {
    fn(lArr[i], hArr[i], gamut)
  }
  const t1 = performance.now()
  return t1 - t0
}
