// Source:
// https://github.com/omgovich/react-colorful/blob/master/src/components/common/Interactive.tsx

import React, { useRef, useMemo, useEffect, FC } from 'react'

/** Clamps a value between an upper and lower bound. */
export const clamp = (number: number, min = 0, max = 1): number => {
  // Ternary operators make the minified code
  // 2 times shorter then `Math.min(Math.max(a,b),c)`
  return number > max ? max : number < min ? min : number
}

// Saves incoming handler to the ref in order to avoid "useCallback hell"
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

export type Position = {
  left: number
  top: number
}

// Finds the proper window object to fix iframe embedding issues
const getParentWindow = (node?: HTMLDivElement | null): Window => {
  // eslint-disable-next-line no-restricted-globals
  return (node && node.ownerDocument.defaultView) || self
}

// Returns a relative position of the pointer inside the node's bounding box
const getRelativePosition2 = (
  node: HTMLDivElement,
  event: React.PointerEvent | PointerEvent
): Position => {
  const rect = node.getBoundingClientRect()
  return {
    left: clamp((event.clientX - rect.left) / rect.width),
    top: clamp((event.clientY - rect.top) / rect.height),
  }
}

type InteractiveProps = {
  onChange?: (pos: Position) => void
  onInput?: (pos: Position) => void
  onMove: (interaction: Position) => void
  onKey: (offset: Position) => void
  children: React.ReactNode
}

const InteractiveBase: FC<InteractiveProps> = props => {
  const { onChange, onInput, onMove, onKey, ...rest } = props
  const container = useRef<HTMLDivElement>(null)
  const onChangeCallback = useEventCallback<Position>(onChange)
  const onInputCallback = useEventCallback<Position>(onInput)
  const onMoveCallback = useEventCallback<Position>(onMove)
  const onKeyCallback = useEventCallback<Position>(onKey)

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
      onMoveCallback(getRelativePosition2(el, event))
      toggleDocumentEvents(true)
    }

    const handleMove = (event: PointerEvent) => {
      if (!event.isPrimary) return
      event.preventDefault() // Prevent text selection

      if (event.buttons > 0) {
        onMoveCallback(getRelativePosition2(container.current!, event))
      } else {
        toggleDocumentEvents(false)
      }
    }

    const handleMoveEnd = () => toggleDocumentEvents(false)

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault() // Prevent scrolling by arrow keys
        onKeyCallback({ left: -0.05, top: 0 })
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault() // Prevent scrolling by arrow keys
        onKeyCallback({ left: 0.05, top: 0 })
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault() // Prevent scrolling by arrow keys
        onKeyCallback({ left: 0, top: -0.05 })
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault() // Prevent scrolling by arrow keys
        onKeyCallback({ left: 0, top: 0.05 })
      }
    }

    function toggleDocumentEvents(state?: boolean) {
      console.log('toggleDocumentEvents', state)

      const parentWindow = getParentWindow(container.current)
      // Add or remove additional pointer event listeners
      const toggleEvent = state
        ? parentWindow.addEventListener
        : parentWindow.removeEventListener
      toggleEvent('pointermove', handleMove)
      toggleEvent('pointerup', handleMoveEnd)
    }

    return [handleMoveStart, handleKeyDown, toggleDocumentEvents]
  }, [onKeyCallback, onMoveCallback])

  // Remove window event listeners before unmounting
  useEffect(() => toggleDocumentEvents, [toggleDocumentEvents])

  return (
    <div
      {...rest}
      className="interactive"
      ref={container}
      tabIndex={0}
      role="slider"
      onKeyDown={handleKeyDown}
      onPointerDown={handleMoveStart}
    />
  )
}

export const Interactive = React.memo(InteractiveBase)
