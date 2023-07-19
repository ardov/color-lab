import { useCallback, useMemo, useState } from 'react'
import { buttonGroup, useControls } from 'leva'
import './styles.scss'
import { Matrix } from '@/shared/lib/vectorMath/classes'
import { useDragRotation2 } from './shared/useDragRotation'
import { makeRgbCube, polygon2matrix } from './Polygon'
import { Dot } from './Dot'

// prettier-ignore
const invertedY = new Matrix(
  1, 0,  0, 0,
  0, -1, 0, 0,
  0, 0,  1, 0,
  0, 0,  0, 1
)

type Mode = keyof Dot['position']

const modes: Mode[] = [
  'RGB',
  'OKLAB',
  'OKLrAB',
  'LAB',
  'HSL',
  'HSV',
  'OKHSL',
  'OKHSV',
  'LRGB',
]

export default function Spaces() {
  // applyTheme(document.body, theme)
  const { sceneRef, matrix, setMatrix } = useDragRotation2(invertedY)
  const [transition, setTransition] = useState(0)
  const [mode, setMode] = useState<Mode>('RGB')

  const { cuts, size, perspective } = useControls('', {
    cuts: { value: 3, min: 1, max: 8, step: 1 },
    perspective: { value: 3000, min: 500, max: 4000, step: 100 },
    size: { value: 256, min: 100, max: 640, step: 64 },
  })

  const transform = useCallback(
    (matrix: Matrix, transition = 500) => {
      setTransition(transition)
      setTimeout(() => setTransition(0), transition)
      setMatrix(matrix)
    },
    [setMatrix]
  )

  useControls('View', {
    Views: buttonGroup({
      Default: () => transform(invertedY),
      Top: () => transform(invertedY.rotateX(-90)),
      Bottom: () => transform(invertedY.rotateX(90)),
    }),
    Rotate: buttonGroup({
      '← 30°': () => {
        const transition = 500
        setTransition(transition)
        setTimeout(() => setTransition(0), transition)
        setMatrix(m => m.rotateY(-30))
      },
      '→ 30°': () => {
        const transition = 500
        setTransition(transition)
        setTimeout(() => setTransition(0), transition)
        setMatrix(m => m.rotateY(30))
      },
    }),
  })

  const polygons = useMemo(() => makeRgbCube(cuts), [cuts])

  const elements = useMemo(() => {
    return polygons.map(polygon => {
      const id = polygon[0].id + polygon[1].id + polygon[2].id
      const style = {
        '--transform': polygon2matrix(polygon, mode, size),
        '--color-a': polygon[0].cssColor,
        '--color-b': polygon[1].cssColor,
        '--color-c': polygon[2].cssColor,
      } as React.CSSProperties
      return <div key={id} className="polygon" style={style} />
    })
  }, [mode, polygons, size])

  return (
    <main>
      <div className="scene" ref={sceneRef}>
        <div className="controls">
          {modes.map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                color: mode === m ? 'white' : 'gray',
                background: mode === m ? 'black' : 'transparent',
              }}
            >
              {m}
            </button>
          ))}
        </div>
        <div style={{ transform: 'translateX(50%)', perspective }}>
          <div
            className="cube"
            style={{
              // @ts-expect-error
              '--size': size + 'px',
              transform: matrix.toCssMatrix(),
              transition: `transform ${transition}ms`,
              pointerEvents: 'none',
            }}
          >
            {elements}
            {/* <div
          className="polygon"
          style={{
            // transform: matrix,
            // @ts-expect-error
            '--color': '#ffff0028',
            '--color-2': '#ffff0028',
            '--size': size + 'px',
          }}
          />
          <div
        className="polygon"
        style={{
          transform: 'rotateX(90deg)',
          // @ts-expect-error
          '--color': '#ff00ff28',
          '--color-2': '#ff00ff28',
          '--size': size + 'px',
        }}
      /> */}
          </div>
        </div>
      </div>
    </main>
  )
}
