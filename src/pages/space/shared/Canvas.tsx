import { FC, useEffect, useRef } from 'react'

function scaleValue(
  value: number,
  from: [number, number],
  to: [number, number]
) {
  let scale = (to[1] - to[0]) / (from[1] - from[0])
  let capped = Math.min(from[1], Math.max(from[0], value)) - from[0]
  return capped * scale + to[0]
}

type axisOption = number | 'x' | 'y' | '-x' | '-y'

type RgbCanvasProps = React.DetailedHTMLProps<
  React.CanvasHTMLAttributes<HTMLCanvasElement>,
  HTMLCanvasElement
> & {
  width: number
  height: number
  opacity: number
  bits: number
  r: axisOption
  g: axisOption
  b: axisOption
}

export const Canvas: FC<RgbCanvasProps> = props => {
  const { width, height, r, g, b, opacity, bits, ...rest } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const paint = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const size = width * height * 4
    const pixels = new Uint8ClampedArray(size)

    function getValue(axis: axisOption, x: number, y: number) {
      if (axis === 'x') return scaleValue(x, [0, width], [255, 0])
      if (axis === '-x') return scaleValue(x, [0, width], [0, 255])
      if (axis === 'y') return scaleValue(y, [0, width], [255, 0])
      if (axis === '-y') return scaleValue(y, [0, width], [0, 255])
      return axis
    }
    function round(value: number) {
      const segmentLength = 256 / (Math.pow(2, bits) - 1)
      const segment = Math.round(value / segmentLength)
      return Math.round(segment * segmentLength)
    }

    const border = 4

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const displacement = y * width * 4 + x * 4
        let alpha = Math.floor(opacity * 255)
        if (
          y < border ||
          x < border ||
          y > height - border - 1 ||
          x > width - border - 1
        )
          alpha = 255
        pixels[displacement] = round(getValue(r, x, y))
        pixels[displacement + 1] = round(getValue(g, x, y))
        pixels[displacement + 2] = round(getValue(b, x, y))
        pixels[displacement + 3] = alpha
      }
    }

    const imageData = new ImageData(pixels, width, height)
    ctx?.putImageData(imageData, 0, 0)
  }

  useEffect(paint, [width, height, r, g, b, opacity, bits])
  return <canvas ref={canvasRef} width={width} height={height} {...rest} />
}
