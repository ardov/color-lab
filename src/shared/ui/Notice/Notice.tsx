import { FC, ReactNode } from 'react'
import { clsx } from 'clsx'
import classes from './Notice.module.scss'

export type NoticeProps = {
  title?: ReactNode
  body?: ReactNode
}

export const Notice: FC<NoticeProps> = props => {
  const { title, body, ...delegated } = props
  return (
    <div className={classes.root}>
      <p>{title}</p>
      <p>{body}</p>
    </div>
  )
}
