import { Xyz50 } from 'culori'

// Source: https://www.wikiwand.com/en/CIE_1931_color_space

export function wavelengthToXYZ(wavelength: number) {
  const g = (wavelength: number, μ: number, σ1: number, σ2: number) => {
    const div = wavelength < μ ? σ1 : σ2
    return Math.exp(-0.5 * Math.pow((wavelength - μ) / div, 2))
  }
  const x =
    1.056 * g(wavelength, 599.8, 37.9, 31) +
    0.362 * g(wavelength, 442.0, 16.0, 26.7) -
    0.065 * g(wavelength, 501.1, 20.4, 26.2)
  const y =
    0.821 * g(wavelength, 568.8, 46.9, 40.5) +
    0.286 * g(wavelength, 530.9, 16.3, 31.1)
  const z =
    1.217 * g(wavelength, 437.0, 11.8, 36.0) +
    0.681 * g(wavelength, 459.0, 26.0, 13.8)

  return { mode: 'xyz50', x, y, z } as Xyz50
}
