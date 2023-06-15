interface Props {
  className?: string
  top?: number
  left: number
  color: string
}

export const Pointer = ({
  className,
  color,
  left,
  top = 0.5,
}: Props): JSX.Element => {
  const nodeClassName = ['pointer', className].join(' ')

  const style = {
    '--top': top,
    '--left': left,
    '--color': color,
  } as React.CSSProperties

  return <div className={nodeClassName} style={style} />
}
