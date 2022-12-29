import { FC } from 'react'
import { clsx } from 'clsx'
import classes from './Slider.module.scss'
import * as RadixSlider from '@radix-ui/react-slider'

export type SliderProps = RadixSlider.SliderProps

export const Slider: FC<SliderProps> = props => {
  return (
    <RadixSlider.Root
      className={clsx(classes.SliderRoot, props.className)}
      defaultValue={[50]}
      max={100}
      step={1}
      aria-label="Volume"
      {...props}
    >
      <RadixSlider.Track className={classes.SliderTrack}>
        <RadixSlider.Range className={classes.SliderRange} />
      </RadixSlider.Track>
      <RadixSlider.Thumb className={classes.SliderThumb} />
    </RadixSlider.Root>
  )
}
