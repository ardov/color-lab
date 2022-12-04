type RGB = [number, number, number]

declare module 'apca-w3' {
  export function APCAcontrast(txtY: number, bgY: number): number
  export function sRGBtoY(rgb: RGB): number
}
