import { RGBA } from '@/shared/lib/huelab'

/**
 * Set of pixels with convenient interface
 */
export class Pixels {
  data: Uint8ClampedArray
  width: number
  height: number

  constructor(width: number, height: number) {
    this.data = new Uint8ClampedArray(width * height * 4)
    this.width = width
    this.height = height
  }

  /** Set pixel value */
  set = (x: number, y: number, [r, g, b, a]: RGBA = [0, 0, 0, 0]) => {
    const start = (this.height - y) * this.width * 4 + x * 4
    this.data[start] = r
    this.data[start + 1] = g
    this.data[start + 2] = b
    this.data[start + 3] = a
  }

  /** convert to ImageData */
  toImageData = (settings?: ImageDataSettings) => {
    const imageData = new ImageData(this.width, this.height, settings)
    imageData.data.set(this.data)
    return imageData
  }

  /** convert to ImageBitmap */
  toImageBitmap = (settings?: ImageDataSettings) => {
    return createImageBitmap(this.toImageData(settings))
  }
}
