import { useState } from 'react'
import { algos } from './algorithms'
import { analyzeFunction } from './qualityCheck/qualityCheck'
import { measurePerformance } from './qualityCheck/performanceCheck'

const iterations = 30_000
// const GAMUT = 'display-p3'
const GAMUT = 'srgb'

const functions = [
  { name: 'OKHSL', fn: algos.okhsl, color: 'lime' },
  { name: 'Edge-seeker LUT', fn: algos.wrappedAlgorithm, color: 'red' },
  // { name: 'Binary search', fn: algos.binary, color: 'blue' },
  { name: 'Clamp chroma', fn: algos.culoriClamp, color: 'blue' },
  // { name: 'LUT', fn: algos.lut, color: 'red' },
  // { name: 'LUT Curvature', fn: algos.algoCurvLUT, color: 'green' },
]

const data = functions.map(({ name, fn }) => {
  return {
    name,
    time: measurePerformance(fn, GAMUT, iterations),
    ...analyzeFunction(fn, {
      gamut: GAMUT,
      testDataSlices: 256,
      jnd: 0.02,
    }),
  }
})
type DataPoint = (typeof data)[0]

function Table2() {
  const prcnt = (v: number) => (v === 0 ? '—' : (v * 100).toFixed(3) + '%')
  const rows: [string, (d: DataPoint) => string | JSX.Element][] = [
    ['Algorithm', d => d.name],
    ['Time', d => Math.round(d.time) + ' ms'],
    ['Err (all)', d => prcnt(d.all)],
    ['Err (L >50)', d => prcnt(d.top)],
    ['Err (L =50)', d => prcnt(d.middle)],
    ['Err (L <50)', d => prcnt(d.bottom)],
    ['Max deltaEOK', d => d.maxDeltaEDiff.toFixed(4)],
    [
      'Main err',
      d => {
        const { mostFailedColor } = d
        return (
          <div>
            <span
              className="inline-block h-8 w-8"
              style={{ background: mostFailedColor.hex }}
            />
            <span
              className="inline-block h-8 w-8"
              style={{ background: mostFailedColor.calculatedHex }}
            />
          </div>
        )
      },
    ],
    ['Expected', d => d.mostFailedColor.hex],
    ['Calculated', d => d.mostFailedColor.calculatedHex],
  ]
  return (
    <table className="table-auto rounded-md border border-stone-500 text-left font-mono">
      <tbody>
        {rows.map(([label, fn]) => (
          <tr key={label} className=" hover:bg-stone-200 ">
            <th className="px-4 py-1 text-left text-stone-500">{label}</th>
            {data.map(row => (
              <td key={row.name} className="px-4 py-1 text-center">
                {fn(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function AlgoTests() {
  return (
    <div className="flex flex-col items-start justify-start gap-8 bg-stone-100 p-16 text-stone-900">
      <h1 className="text-xl font-bold">Gamut Mapping Playground</h1>

      <WorkPreview />

      <Table2 />
    </div>
  )
}

function WorkPreview() {
  const [hue, setHue] = useState(264.05)
  return (
    <div className="flex flex-col items-start justify-start gap-2 bg-stone-100  text-stone-900">
      <div>
        <Chart
          hue={hue}
          funcs={functions.map(({ fn, color }) => ({ fn, color }))}
        />
      </div>
      <input
        className="w-full"
        type="number"
        min="0"
        max="360"
        step="0.01"
        value={hue}
        onChange={e => setHue(+e.target.value)}
      />
      <input
        className="w-full"
        type="range"
        min="0"
        max="360"
        step="0.01"
        value={hue}
        onChange={e => setHue(+e.target.value)}
      />
    </div>
  )
}

// SVG chart of chroma
function Chart(props: {
  hue: number
  funcs: { fn: typeof algos.wrappedAlgorithm; color: string }[]
}) {
  const { hue, funcs } = props
  const width = 800
  const height = 500
  const points = (fn: typeof algos.wrappedAlgorithm) => {
    const values = new Array(width)
      .fill(0)
      .map((_, i) => fn(i / (width - 1), hue, GAMUT))
    return values.map((c, i) => `${width - i},${height - (c * height) / 0.4}`)
  }

  return (
    <svg
      className="border border-stone-500"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {funcs.map(({ fn, color }, i) => {
        return (
          <polyline
            key={i}
            points={points(fn).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="1"
            opacity={0.6}
          />
        )
      })}
    </svg>
  )
}
