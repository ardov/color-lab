import { Color, p3, rgb } from 'culori'

export function displayable(
  color: Color | string,
  gamut: 'srgb' | 'display-p3' = 'srgb',
  tolerance = 0
): boolean {
  const c = gamut === 'srgb' ? rgb(color) : p3(color)
  const min = 0 - tolerance
  const max = 1 + tolerance
  return (
    c !== undefined &&
    c.r >= min &&
    c.r <= max &&
    c.g >= min &&
    c.g <= max &&
    c.b >= min &&
    c.b <= max
  )
}
