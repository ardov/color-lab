import React, { FC } from 'react'
import { clsx } from 'clsx'
import classes from './Button.module.css'

export type ButtonProps = React.HTMLAttributes<HTMLOrSVGElement> & {
  size?: 'l' | 'm'
  use?: 'primary' | 'secondary' | 'tetriary'
  tag?: keyof React.JSX.IntrinsicElements
}

export const Button: FC<ButtonProps> = props => {
  const {
    tag: Wrapper = 'button',
    children,
    className,
    size,
    use = 'primary',
    ...delegated
  } = props
  const Tag = Wrapper as any
  return (
    <Tag
      className={clsx(
        classes.root,
        {
          [classes.primary]: use === 'primary',
          [classes.secondary]: use === 'secondary',
          [classes.tetriary]: use === 'tetriary',
        },
        className
      )}
      {...delegated}
    >
      {children}
    </Tag>
  )
}
