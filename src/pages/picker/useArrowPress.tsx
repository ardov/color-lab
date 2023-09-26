import React, { useCallback, useRef } from 'react'

export function useArrowPress(
  onChange: (value: string) => void,
  options?: {
    stepNormal?: number
    stepBig?: number
    stepSmall?: number
    min?: number
    max?: number
  }
) {
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const optionsRef = useRef(options)
  optionsRef.current = options

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const onChange = onChangeRef.current
      const options = optionsRef.current || {}
      const {
        stepNormal = 1,
        stepBig = 10,
        stepSmall = 0.1,
        min = undefined,
        max = undefined,
      } = options

      const { key, currentTarget, altKey, shiftKey } = event
      if (key !== 'ArrowUp' && key !== 'ArrowDown') return

      // ArrowUp and ArrowDown are handled here
      event.preventDefault()
      const step = altKey ? stepSmall : shiftKey ? stepBig : stepNormal
      const sign = key === 'ArrowUp' ? 1 : -1
      const change = sign * step

      const currentValue = currentTarget.value
      const caretStart = currentTarget.selectionStart || 0
      const matchingInfo = getMathchingInfo(currentValue, caretStart)

      if (!matchingInfo) return

      const { number, start, end } = matchingInfo

      function formatNumber(n: number) {
        if (min !== undefined && n < min) n = min
        if (max !== undefined && n > max) n = max
        const decimals = 1000000
        n = Math.round(n * decimals) / decimals
        return n
      }

      const newNumber = formatNumber(parseFloat(number) + change)
      const newValue =
        currentValue.slice(0, start) +
        newNumber +
        currentValue.slice(end, currentValue.length)

      onChange(newValue)
      window.requestAnimationFrame(() => {
        currentTarget.setSelectionRange(
          start,
          start + newNumber.toString().length
        )
      })

      function getMathchingInfo(value: string, caretPosition: number) {
        const numberRegex = /[-+]?(\d+(\.\d*)?|\.\d+)/g
        let match: RegExpExecArray | null = null
        while ((match = numberRegex.exec(value))) {
          const number = match[0]
          const index = match.index
          if (
            index <= caretPosition &&
            caretPosition <= index + number.length
          ) {
            return { number, start: index, end: index + number.length }
          }
        }
        return null
      }
    },
    []
  )

  return handleKeyPress
}
