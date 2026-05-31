import { p3ToOklch, srgbToOklch } from './converters'
import { EdgeSeeker } from './EdgeSeeker'

// Predefined edge seekers for sRGB and P3 gamuts
export const edgeSeeker = {
  rgb: new EdgeSeeker(srgbToOklch),
  p3: new EdgeSeeker(p3ToOklch),
}

// Export the EdgeSeeker class for custom use
export { EdgeSeeker } from './EdgeSeeker'
