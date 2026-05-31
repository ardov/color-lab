import { type LCH, lerpColorByHue, isCW } from './utils'

export function fixColorSection(section: LCH[]) {
  let result = [] as LCH[]
  let hasError = false

  section.forEach((color, idx, list) => {
    if (idx === 0) {
      result.push(color)
      return
    }

    const isLast = idx === list.length - 1
    const willGoCW = isLast || isCW(color.h, list[idx + 1].h)

    // Will go in wrong direction
    if (!willGoCW) {
      if (hasError) return
      // It is the start of faulty section
      hasError = true
      result.push(color) // in case we need this color to fix the section
      return
    }

    // Will go in right direction
    if (!hasError) {
      result.push(color)
      return
    }

    // Had error. It is the end of faulty section
    const firstFaultyIdx = result.findIndex(
      addedColor => !isCW(addedColor.h, color.h),
    )
    const replacementColor = lerpColorByHue(
      result[firstFaultyIdx - 1],
      result[firstFaultyIdx],
      color.h - 0.0001,
    )
    result = [...result.slice(0, firstFaultyIdx), replacementColor, color]
    hasError = false
    return
  })

  return result
}
