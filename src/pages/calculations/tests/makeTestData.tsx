import { oklch } from 'culori'

type RGB = [number, number, number]
export type TestData = {
  l: number
  c: number
  h: number
  r: number
  g: number
  b: number
  mode: 'rgb' | 'p3'
}

/** Generates a set of test data for the given mode */
export function makeTestSet(
  mode: 'rgb' | 'p3',
  sideSlices: number
): TestData[] {
  const t0 = performance.now() // Start measuring time
  const rgbs = makeCubeFaces(sideSlices)
  const t1 = performance.now() // Time to make faces
  const enriched = rgbs.map(([r, g, b]) => {
    const { l, c, h = 0 } = oklch({ r, g, b, mode })
    return { l, c, h, r, g, b, mode }
  })

  // Tracking performance
  const t2 = performance.now()
  const timeToMakeFaces = Math.round(t1 - t0)
  const timeToEnrich = Math.round(t2 - t1)
  const total = Math.round(t2 - t0)
  const cases = Math.round(enriched.length / 1000) + 'K'
  console.log(
    `✅ Generated ${cases} test cases in ${total}ms (${timeToMakeFaces}ms to make faces, ${timeToEnrich}ms to enrich)`
  )

  return enriched
}

/** Generates the coordinates for the faces of the RGB cube */
function makeCubeFaces(slices: number): RGB[] {
  const values = new Array(slices).fill(0).map((_, i) => i / (slices - 1))
  let result: RGB[] = []
  for (const r of values) {
    if (r === 0 || r === 1) {
      // Generating the bottom and top faces
      for (const g of values) {
        for (const b of values) {
          result.push([r, g, b])
        }
      }
    } else {
      // Generating the middle perimeters
      for (const g of values) {
        if (g === 0 || g === 1) {
          for (const b of values) {
            result.push([r, g, b])
          }
        } else {
          result.push([r, g, 0])
          result.push([r, g, 1])
        }
      }
    }
  }
  // Expected length = total volume - volume of the inner cube
  const expectedLength = slices ** 3 - (slices - 2) ** 3
  console.assert(
    result.length === expectedLength,
    'Wrong length for cube faces'
  )
  return result
}
