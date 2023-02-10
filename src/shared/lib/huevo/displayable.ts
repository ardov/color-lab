import { Color, p3, rgb } from 'culori'

export function displayable(color: Color | string, mode: 'rgb' | 'p3' = 'rgb') {
  const c = mode === 'p3' ? p3(color) : rgb(color)
  return (
    c !== undefined &&
    c.r >= 0 &&
    c.r <= 1 &&
    c.g >= 0 &&
    c.g <= 1 &&
    c.b >= 0 &&
    c.b <= 1
  )
}
