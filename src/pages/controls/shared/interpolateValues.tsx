/**
 * Generates current values for the sliders
 * if no values — all 0
 * number values stay unchanged
 * null values are replaced with interpolated values
 * @param array
 */
export function interpolateValues(array: (number | null)[]) {
  if (!array) return []
  const allNull = array.every(value => value === null)
  if (allNull) return array.map(() => 0)
  let prevValue: number | null = null
  let prevValueIndex: number | null = null

  return array.map((value, index) => {
    if (value !== null) {
      prevValue = value
      prevValueIndex = index
      return value
    }

    // Current value is null
    const nextValueIndex = array.findIndex(
      (value, i) => i > index && value !== null
    )

    if (nextValueIndex === -1) return prevValue || 0
    const nextValue = array[nextValueIndex] as number
    if (prevValueIndex === null || prevValue === null) return nextValue

    const distance = nextValueIndex - prevValueIndex
    const valueDistance = nextValue - prevValue
    const valueStep = valueDistance / distance
    return prevValue + valueStep * (index - prevValueIndex)
  })
}
