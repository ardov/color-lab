import { FC, ReactNode } from 'react'
import * as RadTooltip from '@radix-ui/react-tooltip'
import { clsx } from 'clsx'
import classes from './Tooltip.module.scss'

export type TooltipProps = {
  children: ReactNode
  content: ReactNode
}

export const Tooltip: FC<TooltipProps> = props => {
  const { children, content, ...delegated } = props
  return (
    <RadTooltip.Provider>
      <RadTooltip.Root>
        <RadTooltip.Trigger asChild>{children}</RadTooltip.Trigger>
        <RadTooltip.Portal>
          <RadTooltip.Content className="TooltipContent" sideOffset={5}>
            {content}
            <RadTooltip.Arrow className="TooltipArrow" />
          </RadTooltip.Content>
        </RadTooltip.Portal>
      </RadTooltip.Root>
    </RadTooltip.Provider>
  )
}
