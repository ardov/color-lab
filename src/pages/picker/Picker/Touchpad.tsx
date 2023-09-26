// Based on github.com/omgovich/react-colorful
import type { FC } from 'react'
import React, { useRef, useMemo, useEffect } from 'react'

/** Clamps a value between an upper and lower bound. */
export function clamp(number: number, min = 0, max = 1): number {
  // Ternary operators make the minified code
  // 2 times shorter then `Math.min(Math.max(a,b),c)`
  return number > max ? max : number < min ? min : number
}

/** Saves incoming handler to the ref in order to avoid "useCallback hell" */
export function useEventCallback<T>(
  handler?: (value: T) => void
): (value: T) => void {
  const callbackRef = useRef(handler)
  const fn = useRef((value: T) => {
    callbackRef.current && callbackRef.current(value)
  })
  callbackRef.current = handler
  return fn.current
}

export type Position = { left: number; top: number }

/** Finds the proper window object to fix iframe embedding issues */
function getParentWindow(node?: HTMLDivElement | null): Window {
  // eslint-disable-next-line no-restricted-globals
  return (node && node.ownerDocument.defaultView) || self
}

/** Returns a relative position of the pointer inside the node's bounding box */
function getRelativePosition(
  node: HTMLDivElement,
  event: React.PointerEvent | PointerEvent,
  unclamped: boolean = false
): Position {
  const rect = node.getBoundingClientRect()
  const left = (event.clientX - rect.left) / rect.width
  const top = (event.clientY - rect.top) / rect.height

  return {
    left: unclamped ? left : clamp(left),
    top: unclamped ? top : clamp(top),
  }
}

const TouchpadBase: FC<{
  children: React.ReactNode
  unclamped?: boolean
  onChange?: (pos: Position) => void
  onInput?: (pos: Position) => void
  onMove?: (interaction: Position) => void
  onKey?: (offset: Position) => void
}> = props => {
  const { onChange, onInput, onMove, onKey, unclamped, ...rest } = props
  const container = useRef<HTMLDivElement>(null)
  const onChangeCallback = useEventCallback<Position>(onChange)
  const onInputCallback = useEventCallback<Position>(onInput)
  const onMoveCallback = useEventCallback<Position>(onMove)
  const onKeyCallback = useEventCallback<Position>(onKey)
  const startPosition = useRef<Position>({ left: 0, top: 0 })
  const currentPosition = useRef<Position>({ left: 0, top: 0 })
  const keyStep = 0.02

  const [handleMoveStart, handleKeyDown, toggleDocumentEvents] = useMemo(() => {
    const handleMoveStart = (event: React.PointerEvent) => {
      // Only to primary pointer events
      if (!event.isPrimary) return false
      // Only to left mouse button
      if (event.pointerType === 'mouse' && event.button !== 0) return false
      event.preventDefault() // Prevent text selection
      const el = container.current
      if (!el) return
      el.focus()
      const position = getRelativePosition(el, event, unclamped)
      startPosition.current = position
      currentPosition.current = position
      onInputCallback(position)
      onMoveCallback(position)
      toggleDocumentEvents(true)
    }

    const handleMove = (event: PointerEvent) => {
      if (!event.isPrimary) return
      event.preventDefault() // Prevent text selection

      if (event.buttons > 0) {
        const position = getRelativePosition(
          container.current!,
          event,
          unclamped
        )
        if (event.shiftKey) {
          const dx = position.left - startPosition.current.left
          const dy = position.top - startPosition.current.top
          const absDx = Math.abs(dx)
          const absDy = Math.abs(dy)
          if (absDx > absDy) {
            position.top = startPosition.current.top
          } else {
            position.left = startPosition.current.left
          }
        }
        currentPosition.current = position
        onInputCallback(position)
        onMoveCallback(position)
      } else {
        toggleDocumentEvents(false)
        onChangeCallback(currentPosition.current)
      }
    }

    const handleMoveEnd = () => {
      onChangeCallback(currentPosition.current)
      toggleDocumentEvents(false)
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault() // Prevent scrolling by arrow keys
        onKeyCallback({ left: -keyStep, top: 0 })
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault() // Prevent scrolling by arrow keys
        onKeyCallback({ left: keyStep, top: 0 })
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault() // Prevent scrolling by arrow keys
        onKeyCallback({ left: 0, top: -keyStep })
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault() // Prevent scrolling by arrow keys
        onKeyCallback({ left: 0, top: keyStep })
      }
    }

    function toggleDocumentEvents(state?: boolean) {
      const parentWindow = getParentWindow(container.current)
      // Add or remove additional pointer event listeners
      const toggleEvent = state
        ? parentWindow.addEventListener
        : parentWindow.removeEventListener
      toggleEvent('pointermove', handleMove)
      toggleEvent('pointerup', handleMoveEnd)
    }

    return [handleMoveStart, handleKeyDown, toggleDocumentEvents]
  }, [
    onChangeCallback,
    onInputCallback,
    onKeyCallback,
    onMoveCallback,
    unclamped,
  ])

  // Remove window event listeners before unmounting
  useEffect(() => toggleDocumentEvents, [toggleDocumentEvents])

  return (
    <div
      {...rest}
      className="pckr__interactive"
      ref={container}
      tabIndex={0}
      role="slider"
      onKeyDown={handleKeyDown}
      onPointerDown={handleMoveStart}
    />
  )
}

export const Touchpad = React.memo(TouchpadBase)
