import { applyTheme, makeTheme } from '@/shared/lib/theme'
import { pointTo, useDragRotation } from './shared/useDragRotation'
import { useMemo, useState } from 'react'
import { useControls } from 'leva'
import './styles.css'
import { add, multiplyNum, position2matrix, substract } from './shared/vectors'
import { formatCss, lab, oklab, oklch } from 'culori'
import { betterToe } from '@/shared/lib/huevo'

const theme = makeTheme({})

export function Spaces() {
  applyTheme(document.body, theme)
  const { sceneRef, matrix, setMatrix } = useDragRotation()
  const [transition, setTransition] = useState(0)
  const { divs, mode, size } = useControls('divs', {
    divs: { value: 2, min: 1, max: 8, step: 1 },
    mode: { value: 0, min: 0, max: 3, step: 1 },
    size: { value: 256, min: 100, max: 2000, step: 64 },
  })

  const transforms = useMemo(
    () => [
      {
        name: 'RGB',
        fn: (pos: Pos) => {
          let initialRgb = pos.map(pos => {
            const [x, y, z] = pointTo(pos)
            return [x + 0.5, y, z + 0.5]
          }) as Pos
          return position2matrix(initialRgb, size)
        },
      },
      {
        name: 'OKLAB',
        fn: (pos: Pos) => position2matrix(toOklabPos(pos), size),
      },
      {
        name: 'OKLrAB',
        fn: (pos: Pos) => position2matrix(toOklrabPos(pos), size),
      },
      {
        name: 'CIELAB',
        fn: (pos: Pos) => position2matrix(toLabPos(pos), size),
      },
      {
        name: 'OKLCH',
        fn: (pos: Pos) => position2matrix(toOklchPos(pos), size),
      },
    ],
    [size]
  )

  const currentMode = transforms[mode]

  const elements = useMemo(
    () => makeNodes(currentMode.fn, divs),
    [currentMode.fn, divs]
  )

  return (
    <div
      className="scene"
      ref={sceneRef}
      // style={{
      //   transform: `scale(3)`,
      // }}
    >
      <div style={{ color: 'white' }}>{currentMode.name}</div>
      <div
        className="cube"
        style={{
          // @ts-expect-error
          '--size': size + 'px',
          '--divs': divs,
          transform: `matrix3d(${matrix})`,
          transition: `transform ${transition}ms`,
        }}
      >
        {elements}
        {/* {objects.map(pos => (
          <Polygon position={pos} size={SIZE} />
        ))} */}

        {/* <Polygon position={[obj.a, obj.b, obj.c]} size={SIZE} /> */}

        {/* <div className="boundary xy" />
        <div className="boundary xz" />
        <div className="boundary zy" /> */}
      </div>
    </div>
  )
}

/*
  A
   |\
   | \
   |__\
  B    C
*/

type Vec3 = [number, number, number]
type Pos = [Vec3, Vec3, Vec3]
type PolygonProps = {
  //         ↑     ↙     ↘
  position: [Vec3, Vec3, Vec3]
  size: number // world size
}
function Polygon(props: PolygonProps) {
  const { position, size } = props
  const objMatrix = position2matrix(position, size)
  return <div className="obj" style={{ transform: `matrix3d(${objMatrix})` }} />
}

function makeNodes(posToMx: (p: Pos) => number[], divs = 1) {
  const cubeNodes = makeCubeNodes(divs)

  return cubeNodes.map(pos => {
    const id = JSON.stringify(pos)
    let initialRgb = pos.map(pos => {
      const [x, y, z] = pointTo(pos)
      return [x + 0.5, y, z + 0.5]
    }) as Pos

    const color = formatCss({
      mode: 'rgb',
      r: pos[1][0],
      g: pos[1][1],
      b: pos[1][2],
    })
    const color2 = formatCss({
      mode: 'rgb',
      r: pos[1][0],
      g: pos[1][1],
      b: pos[1][2],
      // r: pos[0][0],
      // g: pos[0][1],
      // b: pos[0][2],
    })
    return (
      <div
        key={id}
        className="obj"
        style={{
          transform: `matrix3d(${posToMx(pos)})`,
          // @ts-expect-error
          '--color': color,
          '--color-2': color2,
        }}
      />
    )
  })
}

function makeCubeNodes(divs = 1) {
  const makeSide = (a: Vec3, b: Vec3, c: Vec3) =>
    makeSubdividedRect([a, b, c], divs)
  return [
    ...makeSide([0, 1, 0], [0, 0, 0], [1, 0, 0]), //back
    ...makeSide([0, 1, 0], [0, 0, 0], [0, 0, 1]), //left
    ...makeSide([0, 0, 1], [0, 0, 0], [1, 0, 0]), //bottom
    ...makeSide([1, 1, 0], [1, 0, 0], [1, 0, 1]), //right
    ...makeSide([0, 1, 1], [0, 1, 0], [1, 1, 0]), //top
    ...makeSide([0, 1, 1], [0, 0, 1], [1, 0, 1]), //front
  ]

  function makeSubdividedRect(position: Pos, divs = 1) {
    let nodes = [] as Pos[]
    const [a, b, c] = position
    const origin = b
    const xVec = substract(c, origin)
    const yVec = substract(a, origin)

    const divSize = 1 / divs
    const xIncrement = multiplyNum(xVec, divSize)
    const yIncrement = multiplyNum(yVec, divSize)

    for (let xDiv = 0; xDiv < divs; xDiv++) {
      for (let yDiv = 0; yDiv < divs; yDiv++) {
        const shiftVec = add(
          multiplyNum(xVec, xDiv / divs),
          multiplyNum(yVec, yDiv / divs)
        )
        const newOrigin = add(origin, shiftVec)
        const rectNodes = makeRect([
          add(newOrigin, yIncrement),
          newOrigin,
          add(newOrigin, xIncrement),
        ])
        nodes = [...nodes, ...rectNodes]
      }
    }

    return nodes
  }

  function makeRect(position: Pos) {
    const [a, b, c] = position
    const d = add(c, substract(a, b))
    return [position, [c, d, a]] as Pos[]
  }
}

function toLabPos(pos: Pos): Pos {
  return [convert(pos[0]), convert(pos[1]), convert(pos[2])]

  function convert(vec: Vec3) {
    const { l, a, b } = lab({ mode: 'rgb', r: vec[0], g: vec[1], b: vec[2] })
    return [a / 100 + 0.5, l / 100, b / 100 + 0.5] as Vec3
  }
}

function toOklrabPos(pos: Pos): Pos {
  return [convert(pos[0]), convert(pos[1]), convert(pos[2])]

  function convert(vec: Vec3) {
    const { l, a, b } = oklab({ mode: 'rgb', r: vec[0], g: vec[1], b: vec[2] })
    return [a + 0.5, betterToe(l), b + 0.5] as Vec3
  }
}
function toOklabPos(pos: Pos): Pos {
  return [toOkLab(pos[0]), toOkLab(pos[1]), toOkLab(pos[2])]

  function toOkLab(vec: Vec3) {
    const { l, a, b } = oklab({ mode: 'rgb', r: vec[0], g: vec[1], b: vec[2] })
    return [a + 0.5, l, b + 0.5] as Vec3
  }
}

function toOklchPos(pos: Pos): Pos {
  return [convert(pos[0]), convert(pos[1]), convert(pos[2])]

  function convert(vec: Vec3) {
    const { l, c, h } = oklch({ mode: 'rgb', r: vec[0], g: vec[1], b: vec[2] })
    return [c, l, (h || 0) / 360] as Vec3
  }
}
