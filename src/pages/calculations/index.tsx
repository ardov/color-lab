import { useState } from 'react'
import { algos } from './algorithms'
import { analyzeFunction } from './tests/qualityCheck'
import { measurePerformance } from './tests/performanceCheck'

const iterations = 20_000

const functions = [
  { name: 'Binary search', fn: algos.binary, color: 'blue' },
  { name: 'Clamp chroma', fn: algos.culoriClamp, color: 'blue' },
  { name: 'LUT', fn: algos.lut, color: 'red' },
  { name: 'LUT hybrid', fn: algos.lutHybrid, color: 'pink' },
  { name: 'OKHSL', fn: algos.okhsl, color: 'lime' },
]

const data = functions.map(({ name, fn }) => {
  return {
    name,
    time: measurePerformance(fn, 'srgb', iterations),
    ...analyzeFunction(fn, 'srgb', 1 / 1000, 280),
  }
})

function Table() {
  return (
    <table className="table-auto rounded-md border border-stone-500 text-left font-mono">
      <thead>
        <tr>
          <th className="px-4 py-1 text-left text-stone-500">Algorithm</th>
          <th className="px-4 py-1 text-right text-stone-500">Time</th>
          <th className="px-4 py-1 text-right text-stone-500">Err (all)</th>
          <th className="px-4 py-1 text-right text-stone-500">Err (top)</th>
          <th className="px-4 py-1 text-right text-stone-500">Err (mid)</th>
          <th className="px-4 py-1 text-right text-stone-500">Err (bottom)</th>
          <th className="px-4 py-1 text-right text-stone-500">Max C diff</th>
          <th className="px-4 py-1 text-right text-stone-500">Main err</th>
        </tr>
      </thead>
      <tbody>
        {data.map(row => {
          const {
            name,
            time,
            all,
            top,
            middle,
            bottom,
            maxChromaDiff,
            mostFailedColor,
          } = row

          const prcnt = (v: number) => (v * 100).toFixed(2) + '%'

          return (
            <tr key={name}>
              <th className="px-4 py-1 text-left">{name}</th>
              <td className="px-4 py-1 text-right">{Math.round(time)} ms</td>
              <td className="px-4 py-1 text-right">{prcnt(all)}</td>
              <td className="px-4 py-1 text-right">{prcnt(top)}</td>
              <td className="px-4 py-1 text-right">{prcnt(middle)}</td>
              <td className="px-4 py-1 text-right">{prcnt(bottom)}</td>
              <td className="px-4 py-1 text-right">
                {maxChromaDiff.toFixed(4)}
              </td>
              <td className="px-4 py-1 text-right">
                {
                  <div>
                    <div>
                      Orig: {mostFailedColor.hex}{' '}
                      <span
                        className="inline-block h-8 w-8"
                        style={{ background: mostFailedColor.hex }}
                      />
                      <span
                        className="inline-block h-8 w-8"
                        style={{ background: mostFailedColor.calculatedHex }}
                      />
                    </div>
                    <div>Calc: {mostFailedColor.calculatedHex}</div>
                    <div>C diff: {mostFailedColor.diff.toFixed(4)}</div>
                  </div>
                }
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default function AlgoTests() {
  return (
    <div className="flex min-h-screen flex-col items-start justify-start gap-2 bg-stone-100 p-16 text-stone-900">
      <h1 className="text-xl font-bold">Testing Algos</h1>
      <div>
        <WorkPreview />
      </div>
      <Table />
    </div>
  )
}

function WorkPreview() {
  const [hue, setHue] = useState(264.05)
  return (
    <div className="flex h-screen flex-col items-start justify-start gap-2 bg-stone-100 p-16 text-stone-900">
      <h1 className="text-xl font-bold">Testing Algos</h1>
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
  funcs: { fn: typeof algos.lut; color: string }[]
}) {
  const { hue, funcs } = props
  const width = 800
  const height = 300
  const points = (fn: typeof algos.lut) => {
    const values = new Array(width)
      .fill(0)
      .map((_, i) => fn(i / (width - 1), hue, 'srgb'))
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
