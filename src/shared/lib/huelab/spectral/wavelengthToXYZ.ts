import { Xyz65 } from 'culori'

/**
 * Converts wavelength to XYZ. Uses analytical approximation (gaussian) of the CIE 1931 color matching functions.
 * Source: https://www.wikiwand.com/en/CIE_1931_color_space
 * @param wavelength - wavelength in nanometers
 * @returns XYZ values
 */
export function cmf1931_gauss(wavelength: number): Xyz65 {
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

  return { mode: 'xyz65', x, y, z }
}

/**
 * Converts spectral power distribution to XYZ. Uses analytical approximation (gaussian) of the CIE 1931 color matching functions.
 * @param startNm - start wavelength in nanometers
 * @param stepNm - step in nanometers
 * @param samples - spectral power distribution
 * @returns XYZ values
 */
export function spdToXYZ65(
  startNm: number,
  stepNm: number,
  samples: number[]
): Xyz65 {
  let X = 0,
    Y = 0,
    Z = 0
  for (let i = 0; i < samples.length; i++) {
    const λ = startNm + i * stepNm
    const S = samples[i]
    const xyzValues = cmf1931_gauss(λ)
    X += S * xyzValues.x
    Y += S * xyzValues.y
    Z += S * xyzValues.z
  }
  // multiplier of the step = discretization of the integral
  X *= stepNm
  Y *= stepNm
  Z *= stepNm

  return { mode: 'xyz65', x: X, y: Y, z: Z }
}

/**
 * Converts reflectance under illuminant to XYZ. Uses analytical approximation (gaussian) of the CIE 1931 color matching functions.
 * @param startNm - start wavelength in nanometers
 * @param stepNm - step in nanometers
 * @param reflectance - reflectance 0..1
 * @param illuminant - illuminant
 * @returns XYZ values
 */
export function reflectanceUnderIlluminantToXYZ65(
  startNm: number,
  stepNm: number,
  reflectance: number[],
  illuminant: number[]
): Xyz65 {
  if (reflectance.length !== illuminant.length) {
    throw new Error(
      'reflectance and illuminant arrays must have the same length'
    )
  }

  // k = 100 / ∑ E(λ) * ȳ(λ) dλ
  let denom = 0
  for (let i = 0; i < illuminant.length; i++) {
    const λ = startNm + i * stepNm
    const { y } = cmf1931_gauss(λ)
    denom += illuminant[i] * y
  }
  denom *= stepNm
  const k = 100 / (denom || 1e-12)

  // X,Y,Z = k * ∑ R(λ) * E(λ) * x̄,ȳ,z̄ dλ
  let X = 0,
    Y = 0,
    Z = 0
  for (let i = 0; i < reflectance.length; i++) {
    const λ = startNm + i * stepNm
    const RE = reflectance[i] * illuminant[i]
    const xyzValues = cmf1931_gauss(λ)
    X += RE * xyzValues.x
    Y += RE * xyzValues.y
    Z += RE * xyzValues.z
  }
  X = k * X * stepNm
  Y = k * Y * stepNm
  Z = k * Z * stepNm

  return { mode: 'xyz65', x: X, y: Y, z: Z }
}
