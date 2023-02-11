import { FC, ReactNode } from 'react'
import { clsx } from 'clsx'
import classes from './Layout.module.scss'

export type LayoutProps = {
  leftPanel: ReactNode
  mainPanel?: ReactNode
  mainPanel2?: ReactNode
}

export const Layout: FC<LayoutProps> = props => {
  const { leftPanel, mainPanel, mainPanel2 } = props
  return (
    <main className={classes.main}>
      <section className={classes.leftPanel}>{leftPanel}</section>
      <div className={classes.panels}>
        {mainPanel && (
          <section className={classes.mainPanel}>{mainPanel}</section>
        )}
        {mainPanel2 && (
          <section className={classes.mainPanel}>{mainPanel2}</section>
        )}
      </div>
    </main>
  )
}
