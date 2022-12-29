import { ButtonHTMLAttributes, FC } from 'react'
import { clsx } from 'clsx'
import classes from './Button.module.scss'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'l' | 'm'
  use?: 'primary' | 'secondary' | 'tetriary'
}

export const Button: FC<ButtonProps> = props => {
  const { children, className, size, use = 'primary', ...delegated } = props
  return (
    <button
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
    </button>
  )
}
