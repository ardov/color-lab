import { FC } from 'react'
import { clsx } from 'clsx'
import classes from './Button.module.scss'

export type ButtonProps = React.HTMLAttributes<HTMLOrSVGElement> & {
  size?: 'l' | 'm'
  use?: 'primary' | 'secondary' | 'tetriary'
  tag?: keyof JSX.IntrinsicElements
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
  return (
    // @ts-expect-error Some problem with three.js types
    <Wrapper
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
    </Wrapper>
  )
}
