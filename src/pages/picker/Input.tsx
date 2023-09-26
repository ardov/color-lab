import {
  Color,
  formatCss,
  formatHex,
  formatHsl,
  formatRgb,
  parse,
} from 'culori'
import React, { useCallback, useState } from 'react'
import { useArrowPress } from './useArrowPress'

export const Input: React.FC<
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
> = props => {
  const [inputValue, setInputValue] = useState('Sample 123 Text')

  const onKeyPress = useArrowPress(setInputValue)

  return (
    <input
      type="text"
      value={inputValue}
      onKeyDown={onKeyPress}
      onChange={event => setInputValue(event.target.value)}
    />
  )
}

export const ColorInput: React.FC<{
  value: string
  onChange: (event: { value: string; color: Color | null }) => void
}> = props => {
  const { value, onChange } = props

  const [inputValue, setInputValue] = useState(value)
  const [parsedColor, setParsedColor] = useState(parseColor(value))

  const handleValueChange = useCallback(
    (newValue: string) => {
      setInputValue(newValue)
      if (newValue === value) return
      const parsed = parseColor(newValue)
      setParsedColor(parsed)
      onChange(
        parsed
          ? { value: newValue, color: parsed.color }
          : { value: newValue, color: null }
      )
    },
    [onChange, value]
  )

  const onKeyPress = useArrowPress(handleValueChange)

  return (
    <input
      type="text"
      value={inputValue}
      onKeyDown={onKeyPress}
      onChange={event => handleValueChange(event.target.value)}
      onBlur={() => {
        if (parsedColor) {
          setInputValue(parsedColor.value)
        }
      }}
    />
  )
}

function parseColor(value: string) {
  const parsed = parse(value)
  if (parsed === undefined) return null

  const formatter = getFormatter(value)

  return {
    color: parsed,
    value: formatter(parsed),
    formatter,
  }

  function getFormatter(value: string) {
    if (isHex(value)) return formatHex
    if (value.startsWith('rgb')) return formatRgb
    if (value.startsWith('hsl')) return formatHsl
    return formatCss
  }

  function isHex(value: string) {
    const hexValue = value.startsWith('#') ? value.slice(1) : value
    return /^([0-9A-Fa-f]{3}){1,2}$/.test(hexValue)
  }
}
