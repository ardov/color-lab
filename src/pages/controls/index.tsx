import './styles.scss'
import { FC, useMemo, useState } from 'react'
import { interpolateValues } from './shared/interpolateValues'
import { Knob } from './Knob'

type TValue = number | null

const initialValues: TValue[] = [null, 10, null, null, 40, null, null]

export default function Sliders() {
  const [values, setValues] = useState<TValue[]>(initialValues)
  const calculated = useMemo(() => interpolateValues(values), [values])

  // Range props
  const min = 0
  const max = 100
  const step = 1
  const isCycle = false

  // Area props
  const width = 600
  const height = 300

  const length = calculated.length
  const padding = width / length / 2
  const points = calculated.map((value, index) => {
    const x = index * (width / length) + padding
    const y = height - (value / max) * height
    return `${x},${y}`
  })

  return (
    <div
      className="area"
      style={{
        width: width + 'px',
        height: height + 'px',
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
      >
        <polyline
          fill="none"
          stroke="black"
          points={points.join(' ')}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
        />
      </svg>
      <Controls
        values={calculated}
        originalValues={values}
        min={min}
        max={max}
        step={1}
        onChange={setValues}
      />
    </div>
  )
}

type Props = {
  values: number[]
  originalValues: TValue[]
  min: number
  max: number
  step: number
  onChange: (values: TValue[]) => void
}

const Controls: FC<Props> = props => {
  const { values, originalValues, min, max, step, onChange } = props

  return (
    <div className="sliders">
      {values.map((value, index) => (
        <Knob
          value={value}
          min={min}
          max={max}
          step={step}
          isLocked={originalValues[index] !== null}
          onChange={value => {
            const nextState = [...originalValues]
            nextState[index] = value
            onChange(nextState)
          }}
          onLockToggle={() => {
            const nextState = [...originalValues]
            nextState[index] = null
            onChange(nextState)
          }}
        />
      ))}
    </div>
  )
}
