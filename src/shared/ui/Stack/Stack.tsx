import { forwardRef, ReactNode } from 'react'
import { clsx } from 'clsx'
import classes from './Stack.module.scss'

export type StackProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode
  className?: string
  axis?: 'x' | 'y'
  gap?: number
  p?: number
  px?: number
  py?: number
  pt?: number
  pr?: number
  pb?: number
  pl?: number
  m?: number
  mx?: number
  my?: number
  mt?: number
  mr?: number
  mb?: number
  ml?: number
}

export const Stack = forwardRef<HTMLDivElement, StackProps>((props, ref) => {
  const {
    axis,
    gap,
    className,
    children,
    p,
    px,
    py,
    pt,
    pr,
    pb,
    pl,
    m,
    mx,
    my,
    mt,
    mr,
    mb,
    ml,
    style,
    ...delegated
  } = props
  return (
    <div
      style={
        {
          ...style,
          '--gap': gap,
          '--pt': p || py || pt || 0,
          '--pr': p || px || pr || 0,
          '--pb': p || py || pb || 0,
          '--pl': p || px || pl || 0,
          '--mt': m || my || mt || 0,
          '--mr': m || mx || mr || 0,
          '--mb': m || my || mb || 0,
          '--ml': m || mx || ml || 0,
        } as React.CSSProperties
      }
      className={clsx(
        classes.root,
        { [classes.horizontal]: axis === 'x' },
        className
      )}
      ref={ref}
      {...delegated}
    >
      {children}
    </div>
  )
})
