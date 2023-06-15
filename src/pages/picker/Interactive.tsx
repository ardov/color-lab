// Source:
// https://github.com/omgovich/react-colorful/blob/master/src/components/common/Interactive.tsx

import React, { useRef, useMemo, useEffect } from 'react'

// Clamps a value between an upper and lower bound.
// We use ternary operators because it makes the minified code
// 2 times shorter then `Math.min(Math.max(a,b),c)`
export const clamp = (number: number, min = 0, max = 1): number => {
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

export interface Interaction {
  left: number
  top: number
}

// Check if an event was triggered by touch
const isTouch = (event: MouseEvent | TouchEvent): event is TouchEvent =>
  'touches' in event

// Finds a proper touch point by its identifier
const getTouchPoint = (touches: TouchList, touchId: null | number): Touch => {
  for (let i = 0; i < touches.length; i++) {
    if (touches[i].identifier === touchId) return touches[i]
  }
  return touches[0]
}

// Finds the proper window object to fix iframe embedding issues
const getParentWindow = (node?: HTMLDivElement | null): Window => {
  // eslint-disable-next-line no-restricted-globals
  return (node && node.ownerDocument.defaultView) || self
}

// Returns a relative position of the pointer inside the node's bounding box
const getRelativePosition = (
  node: HTMLDivElement,
  event: MouseEvent | TouchEvent,
  touchId: null | number
): Interaction => {
  const rect = node.getBoundingClientRect()

  // Get user's pointer position from `touches` array if it's a `TouchEvent`
  const pointer = isTouch(event)
    ? getTouchPoint(event.touches, touchId)
    : (event as MouseEvent)

  return {
    left: clamp(
      (pointer.pageX - (rect.left + getParentWindow(node).pageXOffset)) /
        rect.width
    ),
    top: clamp(
      (pointer.pageY - (rect.top + getParentWindow(node).pageYOffset)) /
        rect.height
    ),
  }
}

// Browsers introduced an intervention, making touch events passive by default.
// This workaround removes `preventDefault` call from the touch handlers.
// https://github.com/facebook/react/issues/19651
const preventDefaultMove = (event: MouseEvent | TouchEvent): void => {
  !isTouch(event) && event.preventDefault()
}

// Prevent mobile browsers from handling mouse events (conflicting with touch ones).
// If we detected a touch interaction before, we prefer reacting to touch events only.
const isInvalid = (
  event: MouseEvent | TouchEvent,
  hasTouch: boolean
): boolean => {
  return hasTouch && !isTouch(event)
}

interface Props {
  onMove: (interaction: Interaction) => void
  onKey: (offset: Interaction) => void
  children: React.ReactNode
}

const InteractiveBase = ({ onMove, onKey, ...rest }: Props) => {
  const container = useRef<HTMLDivElement>(null)
  const onMoveCallback = useEventCallback<Interaction>(onMove)
  const onKeyCallback = useEventCallback<Interaction>(onKey)
  const touchId = useRef<null | number>(null)
  const hasTouch = useRef(false)

  const [handleMoveStart, handleKeyDown, toggleDocumentEvents] = useMemo(() => {
    const handleMoveStart = ({
      nativeEvent,
    }: React.MouseEvent | React.TouchEvent) => {
      const el = container.current
      if (!el) return

      // Prevent text selection
      preventDefaultMove(nativeEvent)

      if (isInvalid(nativeEvent, hasTouch.current) || !el) return

      if (isTouch(nativeEvent)) {
        hasTouch.current = true
        const changedTouches = nativeEvent.changedTouches || []
        if (changedTouches.length)
          touchId.current = changedTouches[0].identifier
      }

      el.focus()
      onMoveCallback(getRelativePosition(el, nativeEvent, touchId.current))
      toggleDocumentEvents(true)
    }

    const handleMove = (event: MouseEvent | TouchEvent) => {
      // Prevent text selection
      preventDefaultMove(event)

      // If user moves the pointer outside of the window or iframe bounds and release it there,
      // `mouseup`/`touchend` won't be fired. In order to stop the picker from following the cursor
      // after the user has moved the mouse/finger back to the document, we check `event.buttons`
      // and `event.touches`. It allows us to detect that the user is just moving his pointer
      // without pressing it down
      const isDown = isTouch(event)
        ? event.touches.length > 0
        : event.buttons > 0

      if (isDown && container.current) {
        onMoveCallback(
          getRelativePosition(container.current, event, touchId.current)
        )
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
      const touch = hasTouch.current
      const el = container.current
      const parentWindow = getParentWindow(el)

      // Add or remove additional pointer event listeners
      const toggleEvent = state
        ? parentWindow.addEventListener
        : parentWindow.removeEventListener
      toggleEvent(touch ? 'touchmove' : 'mousemove', handleMove)
      toggleEvent(touch ? 'touchend' : 'mouseup', handleMoveEnd)
    }

    return [handleMoveStart, handleKeyDown, toggleDocumentEvents]
  }, [onKeyCallback, onMoveCallback])

  // Remove window event listeners before unmounting
  useEffect(() => toggleDocumentEvents, [toggleDocumentEvents])

  return (
    <div
      {...rest}
      onTouchStart={handleMoveStart}
      onMouseDown={handleMoveStart}
      className="interactive"
      ref={container}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
    />
  )
}

export const Interactive = React.memo(InteractiveBase)
