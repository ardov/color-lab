import { clampChroma, Color, formatCss, oklch, p3, rgb, Xyz65 } from 'culori'
import { toSrgb } from '@/shared/lib/huelab/gamut-mapping'
import { oklchx } from './customModes/modeOklabx'
import { clamp } from 'three/src/math/MathUtils.js'
import {
  lambdaToXyz,
  MAX_WAVELENGTH,
  MIN_WAVELENGTH,
} from '@/shared/lib/huelab/spectral/lambdaToXyz'
import { edgeSeeker } from '@/shared/lib/edge-seeker'

const xyzValues = [] as Xyz65[]

for (let i = MIN_WAVELENGTH; i < MAX_WAVELENGTH; i++) {
  xyzValues.push(lambdaToXyz(i))
}

const a = oklchx(xyzValues[0])
console.log(a)

const methods: { name: string; mapper: (xyz: Xyz65) => Color }[] = [
  {
    name: 'oklch',
    mapper: xyz => clampChroma(rgb(xyz), 'oklch', 'rgb'),
  },
  {
    name: 'oklchx',
    // @ts-ignore
    mapper: xyz => clampChroma(rgb(xyz), 'oklchx', 'rgb'),
  },
  {
    name: 'Max chroma (bright)',
    mapper: xyz => {
      const oklchColor = oklch(xyz)
      const peakColor = edgeSeeker.rgb.getPeakColor(oklchColor.h ?? 0)
      if (oklchColor.l < peakColor.l) {
        return clampChroma(rgb(xyz), 'oklch', 'rgb')
      }
      return rgb({
        mode: 'oklch',
        l: peakColor.l,
        c: peakColor.c,
        h: peakColor.h ?? 0,
      })
    },
  },
  {
    name: 'Max chroma',
    mapper: xyz => {
      const oklchColor = oklch(xyz)
      const peakColor = edgeSeeker.p3.getPeakColor(oklchColor.h ?? 0)
      return p3({
        mode: 'oklch',
        l: peakColor.l,
        c: peakColor.c,
        h: peakColor.h ?? 0,
      })
    },
  },
  {
    name: 'lch',
    mapper: xyz => clampChroma(p3(xyz), 'lch', 'p3'),
  },
  {
    name: 'lchuv',
    mapper: xyz => clampChroma(p3(xyz), 'lchuv', 'p3'),
  },
  {
    name: 'Naive clip',
    mapper: xyz => {
      const color = p3(xyz)
      return {
        mode: 'p3',
        r: clamp(color.r, 0, 1),
        g: clamp(color.g, 0, 1),
        b: clamp(color.b, 0, 1),
      }
    },
  },
]

export function Preview() {
  return (
    <div>
      {methods.map(method => (
        <SpectrumChart
          key={method.name}
          mapper={method.mapper}
          name={method.name}
        />
      ))}
    </div>
  )
}

function SpectrumChart(props: { mapper: (xyz: Xyz65) => Color; name: string }) {
  const { mapper, name } = props
  const colors = xyzValues.map(mapper)
  const height = 100
  return (
    <div>
      <svg
        width={800}
        height={100}
        viewBox={`0 0 ${xyzValues.length} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        // preserveAspectRatio="none"
      >
        {colors.map((color, idx) => {
          const isMark = (MIN_WAVELENGTH + idx) % 50 === 0
          return (
            <rect
              key={idx}
              x={idx}
              y={0}
              width={1.2}
              height={isMark ? height : height - 2}
              fill={formatCss(color)}
            />
          )
        })}
        <text x={2} y={10} fontSize={10} fill="white">
          {name}
        </text>
      </svg>
    </div>
  )
}
