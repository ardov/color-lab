/**
 * Find the closest index of a color in the array
 * @param h value to search for
 * @param lut array of colors in OKLCH sorted by hue
 */
export function findClosest<T extends { h: number }>(
  h: number,
  lut: T[]
): {
  min: T
  max: T
  t: number
} {
  let start = 0
  let end = lut.length - 1
  let mid = Math.floor((start + end) / 2)

  while (start <= end) {
    if (lut[mid].h === h) {
      return { min: lut[mid], max: lut[mid], t: 0 }
    } else if (lut[mid].h < h) {
      start = mid + 1
    } else {
      end = mid - 1
    }
    mid = Math.floor((start + end) / 2)
  }

  const min = lut[mid]
  const max = lut[mid + 1]
  const t = (h - min.h) / (max.h - min.h)
  return { min, max, t }
}
