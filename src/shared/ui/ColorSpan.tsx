import { Color, formatHex8, parse, rgb, Rgb } from 'culori'
import { findTextTone } from '@/shared/lib/huevo'
import { ReactNode } from 'react'

function ColorSpan(props: {
  value: Color | string
  name?: string
  children?: ReactNode
}) {
  const { value, name, children } = props
  const bg =
    (typeof value === 'string' ? rgb(parse(value)) : rgb(value)) ||
    ({ mode: 'rgb', r: 1, g: 0, b: 0, alpha: 1 } as Rgb)
  // const textColor = getContrastText(bg)
  const textColor = findTextTone(bg, 60, 1)
  const borderColor = findTextTone(bg, 15)
  // const borderColor = adjustL(bg, -0.1)
  const border = formatHex8(borderColor)
  const bgHex = formatHex8(bg)
  const txtHex = formatHex8(textColor)

  return (
    <span
      style={{
        background: bgHex,
        padding: '2px 0',
        borderRadius: 8,
        // border: '1px solid ' + border,
      }}
    >
      <span
        style={{ color: txtHex, padding: '0px 6px' }}
        onClick={() => navigator.clipboard.writeText(bgHex)}
      >
        {name || bgHex}
      </span>
      {children}
    </span>
  )
}
