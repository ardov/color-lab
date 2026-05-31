import { cmf1931_gauss } from '@/shared/lib/huelab/spectral/wavelengthToXYZ'
import { Xyz65 } from 'culori'
import { SVGProps } from 'react'

export type SpdValues = number[]

type Props = {
  value: SpdValues
  onChange: (value: SpdValues) => void
} & Omit<SVGProps<SVGSVGElement>, 'onChange' | 'value'>

export function SpdChart(props: Props) {
  const minWavelength = 360
  const maxWavelength = 740
  const samples = maxWavelength - minWavelength
  const { value, onChange, height = 100, width = samples } = props
  const boxHeight = 100
  const values = [] as SpdValues
  for (let i = 0; i <= samples; i++) {
    values.push((value[i] || 0) * boxHeight)
  }
  console.log(values)
  return (
    <svg
      viewBox={`0 0 ${samples} ${boxHeight}`}
      width={width}
      height={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      {values.map((v, idx) => {
        return (
          <rect x={idx} y={boxHeight - v} width={1} height={v} fill="black" />
        )
      })}
    </svg>
  )
}
