import { FC, useEffect, useRef } from 'react'
import { clsx } from 'clsx'
import classes from './Showcase.module.scss'
import { TTheme } from '@/shared/lib/theme'
import { Button } from '@/shared/ui/Button'
import { Notice } from '@/shared/ui/Notice'
import { Stack } from '@/shared/ui/Stack'
import { applyTheme } from '@/shared/lib/theme/applyTheme'

export type ShowcaseProps = {
  theme?: TTheme
}

export const Showcase: FC<ShowcaseProps> = props => {
  const { theme } = props
  const themeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (themeRef.current && theme) applyTheme(themeRef.current, theme)
  }, [theme])

  return (
    <div className={classes.container} ref={themeRef}>
      <Stack
        p={3}
        gap={2}
        axis="y"
        style={{
          maxWidth: 600,
        }}
      >
        <Stack gap={1} axis="x">
          <Button use="primary">Primary</Button>
          <Button use="secondary">Secondary</Button>
          <Button use="tetriary">Tetriary</Button>
        </Stack>

        <Notice title={'Notice on app background'} />

        <Stack p={2} gap={2} className={classes.card}>
          <Notice
            title={<b>Notice on card</b>}
            body={
              <Stack gap={1} axis="x">
                <Button use="primary">Primary</Button>
                <Button use="secondary">Secondary</Button>
                <Button use="tetriary">Tetriary</Button>
              </Stack>
            }
          />

          <Stack gap={1} axis="x">
            <span>
              This text contains <a href="/#">a preview link</a>. And here is
              some more text just to test its behavior.
            </span>
          </Stack>
          <hr />
          <Stack gap={1} axis="x">
            Another chunk of text.
          </Stack>
          <hr />
          <Stack gap={1} axis="x">
            <Button use="primary">Primary</Button>
            <Button use="secondary">Secondary</Button>
            <Button use="tetriary">Tetriary</Button>
          </Stack>
        </Stack>
        <div className={classes.list}>
          <div className={classes.listItem}>Some first item</div>
          <div className={classes.listItem + ' ' + classes.selected}>
            Selected item
          </div>
          <div className={classes.listItem}>I'm just sitting here</div>
          <div className={classes.listItem}>May the 4th be with you</div>
        </div>
      </Stack>
    </div>
  )
}
