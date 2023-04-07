import { Matrix } from '@/shared/lib/vectorMath/classes'
import { useEffect, useRef, useState } from 'react'

const transformMatrix = (matrix: Matrix, deltaX: number, deltaY: number) => {
  const rate = 0.5
  return matrix.rotateX(-deltaY * rate).rotateY(deltaX * rate)
}

export function useDragRotation2(initial: Matrix = Matrix.identity()) {
  const ref = useRef<HTMLDivElement>(null)
  const [matrix, setMatrix] = useState(initial)
  const [isDown, setIsDown] = useState(false)
  const [startPosition, setStartPosition] = useState([0, 0])

  useEffect(() => {
    const div = ref.current
    if (!div) return

    const handleStart = (e: MouseEvent) => {
      setIsDown(true)
      setStartPosition([e.clientX, e.clientY])
    }
    const handleMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      let deltaX = e.clientX - startPosition[0]
      let deltaY = e.clientY - startPosition[1]
      setStartPosition([e.clientX, e.clientY])
      setMatrix(transformMatrix(matrix, deltaX, deltaY))
    }
    const handleEnd = (e: MouseEvent) => {
      setIsDown(false)
    }
    const restoreInitial = () => {
      setMatrix(initial)
    }

    div.addEventListener('pointerdown', handleStart)
    div.addEventListener('dblclick', restoreInitial)
    window.addEventListener('pointermove', handleMove)
    window.addEventListener('pointerup', handleEnd)
    return () => {
      div.removeEventListener('pointerdown', handleStart)
      div.removeEventListener('dblclick', restoreInitial)
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleEnd)
    }
  }, [initial, isDown, matrix, startPosition])

  return { sceneRef: ref, matrix, setMatrix }
}
