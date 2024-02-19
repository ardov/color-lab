import { Oklch, rgb } from 'culori'
import { algos } from '../algorithms'

type SearchFunc = (color: Oklch) => boolean

export function measurePerformance2(fn: SearchFunc, iterations: number) {
  const lArr = new Array(iterations).fill(0).map(() => Math.random())
  const hArr = new Array(iterations).fill(0).map(() => Math.random() * 360)
  const t0 = performance.now()
  for (let i = 0; i < iterations; i++) {
    fn({ l: lArr[i], c: lArr[i], h: hArr[i], mode: 'oklch' })
  }
  const t1 = performance.now()
  return t1 - t0
}

function isInGamutUsual(color: Oklch) {
  const { r, g, b } = rgb(color)
  return r >= 0 && r <= 1 && g >= 0 && g <= 1 && b >= 0 && b <= 1
}

function isInGamutCurv(color: Oklch) {
  return algos.wrappedAlgorithm(color.l, color.h || 0, 'srgb') > color.c
}

const iterations = 1000000

const usualTime = measurePerformance2(isInGamutUsual, iterations)
const curvTime = measurePerformance2(isInGamutCurv, iterations)

console.log('Usual time:', usualTime)
console.log('Curv time:', curvTime)
