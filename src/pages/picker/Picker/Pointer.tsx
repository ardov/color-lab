import type { FC } from 'react'

export const Pointer: FC<{
  className?: string
  left: number
  top?: number | null
  color?: string | null
  ring?: string | null
}> = props => {
  const { className, color, left, top = 0.5, ring } = props
  const nodeClassName = ['pckr__pointer', className].join(' ')

  const style = {
    '--top': top,
    '--left': left,
    '--color': color,
    '--ring': ring,
  } as React.CSSProperties

  return <div className={nodeClassName} style={style} />
}
