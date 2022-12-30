import { FC, ReactNode } from 'react'
import { clsx } from 'clsx'
import classes from './Layout.module.scss'

export type LayoutProps = {
  leftPanel: ReactNode
  mainPanel: ReactNode
  mainPanel2: ReactNode
}

export const Layout: FC<LayoutProps> = props => {
  return (
    <main className={classes.main}>
      <section className={classes.leftPanel}>{props.leftPanel}</section>
      <div className={classes.panels}>
        <section className={classes.mainPanel}>{props.mainPanel}</section>
        <section className={classes.mainPanel}>{props.mainPanel2}</section>
      </div>
    </main>
  )
}
