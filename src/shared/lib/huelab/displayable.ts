import { Color, p3, rgb } from 'culori'

export function displayable(
  color: Color | string,
  mode: 'srgb' | 'display-p3' = 'srgb'
) {
  const c = mode === 'srgb' ? rgb(color) : p3(color)
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
