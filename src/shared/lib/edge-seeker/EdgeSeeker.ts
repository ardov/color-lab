import { makeLut } from './makeLut'
import { getLutItem, intersectWithArc, normalizeHue } from './EdgeSeeker-utils'

/**
 * The EdgeSeeker class takes a converter from `RGB` to `OKLCH` and uses it to create a lookup table.
 * The lookup table is created on the first call.
 * Provides 2 methods:
 * - `getPeakColor` — returns LCH coordinates of the most saturated color for a given hue.
 * - `getMaxChroma` — returns the maximum chroma for a given lightness and hue. Used to clamp chroma.
 */
export class EdgeSeeker {
  /** The lookup table will be initialized on the first call of getEdgeInfo */
  private _lut: Float32Array | null = null

  /** The number of steps per edge */
  private _stepsPerEdge: number = 100

  /** Cache the last item for faster repeated calls with the same hue. */
  private _cached: ReturnType<typeof getLutItem> | null = null

  constructor(
    private _rgbToOklch: (rgb: { r: number; g: number; b: number }) => {
      l: number
      c: number
      h: number
    },
    /** The number of steps per edge for the lookup table */
    stepsPerEdge?: number,
  ) {
    if (stepsPerEdge) this._stepsPerEdge = stepsPerEdge
  }

  /** Initialize the lookup table and cache the first item. */
  private initialize() {
    this._lut = makeLut(this._rgbToOklch, this._stepsPerEdge)
    this._cached = getLutItem(0, this._lut)
  }

  /** Get the parameters of the edge for a given hue. */
  private getEdge(hue: number) {
    if (!this._lut) this.initialize()
    if (!this._cached || hue !== this._cached.h) {
      this._cached = getLutItem(hue, this._lut!)
    }
    return this._cached
  }

  /** Returns the most saturated color for a given hue */
  getPeakColor(hue: number): { l: number; c: number; h: number } {
    const { l, c, h } = this.getEdge(normalizeHue(hue))
    return { l, c, h }
  }

  /** Returns the maximum chroma for a given lightness and hue */
  getMaxChroma(l: number, h: number): number {
    if (l <= 0 || l >= 1) return 0
    const lutItem = this.getEdge(normalizeHue(h))
    if (l <= lutItem.l) {
      // The bottom (dark) part is always a straight line in OKLAB
      return (l / lutItem.l) * lutItem.c
    } else {
      // The top (bright) part is approximated by an arc
      const x = (1 - l) / (1 - lutItem.l) // Normalize l to 0-1 in arc space
      return lutItem.c * intersectWithArc(x, lutItem.curvature)
    }
  }
}
