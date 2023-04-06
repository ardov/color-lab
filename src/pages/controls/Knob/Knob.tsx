import { FC } from 'react'
import * as Slider from '@radix-ui/react-slider'
import './Knob.scss'

type KnobProps = {
  value: number
  min: number
  max: number
  step: number
  isLocked?: boolean
  onChange: (value: number) => void
  onLockToggle?: () => void
  style?: React.CSSProperties
}

export const Knob: FC<KnobProps> = props => {
  const {
    value,
    min,
    max,
    step,
    isLocked,
    onChange,
    onLockToggle: onDoubleClick,
    style,
  } = props
  return (
    <Slider.Root
      orientation="vertical"
      className="knob knob__root"
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={vals => onChange(vals[0])}
      onDoubleClick={onDoubleClick}
      style={style}
    >
      <Slider.Track className="knob__track" />
      <Slider.Thumb
        className={'knob__thumb ' + (isLocked ? 'knob__thumb--locked' : '')}
      />
    </Slider.Root>
  )
}
