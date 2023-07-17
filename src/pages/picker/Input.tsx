import React, { useState, useCallback } from 'react'

export const Input: React.FC<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
> = props => {
  const [inputValue, setInputValue] = useState('Sample 123 Text')

  const onKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      const { key, currentTarget, altKey, shiftKey } = event
      if (key !== 'ArrowUp' && key !== 'ArrowDown') return

      // ArrowUp and ArrowDown are handled here
      event.preventDefault()
      const step = altKey ? 0.1 : shiftKey ? 10 : 1
      const sign = key === 'ArrowUp' ? 1 : -1
      const change = sign * step

      const currentValue = currentTarget.value
      const caretStart = currentTarget.selectionStart || 0
      const matchingInfo = getMathchingInfo(currentValue, caretStart)

      if (!matchingInfo) return

      const { number, start, end } = matchingInfo

      const decimals = 1000000
      const newNumber =
        Math.round((parseFloat(number) + change) * decimals) / decimals
      const newValue =
        currentValue.slice(0, start) +
        newNumber +
        currentValue.slice(end, currentValue.length)

      setInputValue(newValue)
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

  return (
    <input
      type="text"
      value={inputValue}
      onKeyDown={onKeyPress}
      onChange={event => setInputValue(event.target.value)}
    />
  )
}
