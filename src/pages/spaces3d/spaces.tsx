import * as THREE from 'three'
import {
  Rgb,
  dlab,
  hsl,
  hsv,
  jab,
  lab,
  luv,
  okhsl,
  okhsv,
  oklab,
  yiq,
} from 'culori'
import { betterToe } from '@/shared/lib/huevo'
import { getRgbMatrix, rad } from '.'

type SpaceObj = {
  name: string
  mx?: THREE.Matrix4
  fn: (color: Rgb) => [number, number, number]
}
export const spaces: SpaceObj[] = [
  {
    name: 'RGB',
    mx: getRgbMatrix(),
    fn: color => [color.r, color.g, color.b],
  },
  {
    name: 'HSL',
    mx: new THREE.Matrix4().makeRotationY(rad(-28)),
    fn: color => {
      const { h, s, l } = hsl(color)
      return [Math.cos(rad(h)) * s, l, Math.sin(rad(h)) * s]
    },
  },
  {
    name: 'OKHSL',
    mx: new THREE.Matrix4().makeRotationY(rad(20)),
    fn: color => {
      const { h, s, l } = okhsl(color)
      return [Math.cos(rad(h)) * s, l, Math.sin(rad(h)) * s]
    },
  },
  {
    name: 'HSV',
    mx: new THREE.Matrix4().makeRotationY(rad(-28)),
    fn: color => {
      const { h, s, v } = hsv(color)
      return [Math.cos(rad(h)) * s, v, Math.sin(rad(h)) * s]
    },
  },
  {
    name: 'OKHSV',
    mx: new THREE.Matrix4().makeRotationY(rad(20)),
    fn: color => {
      const { h, s, v } = okhsv(color)
      return [Math.cos(rad(h)) * s, v, Math.sin(rad(h)) * s]
    },
  },
  {
    name: 'OKLAB',
    mx: new THREE.Matrix4().makeRotationY(rad(18)),
    fn: color => {
      const { l, a, b } = oklab(color)
      return [a, l, b]
    },
  },
  {
    name: 'OKLrAB',
    mx: new THREE.Matrix4().makeRotationY(rad(18)),
    fn: color => {
      const { l, a, b } = oklab(color)
      return [a, betterToe(l), b]
    },
  },
  {
    name: 'LAB',
    mx: new THREE.Matrix4().makeRotationY(rad(9)),
    fn: color => {
      const { l, a, b } = lab(color)
      return [a / 100, l / 100, b / 100]
    },
  },
  {
    name: 'CIELuv',
    mx: new THREE.Matrix4().makeRotationY(rad(-5)),
    fn: color => {
      const { l, u, v } = luv(color)
      return [u / 100, l / 100, v / 100]
    },
  },
  {
    name: 'DIN99 Lab',
    mx: new THREE.Matrix4().makeRotationY(rad(9)),
    fn: color => {
      const { l, a, b } = dlab(color)
      return [a / 100, l / 100, b / 100]
    },
  },
  {
    name: 'Jab',
    mx: new THREE.Matrix4().makeRotationY(rad(9)),
    fn: color => {
      const { j, a, b } = jab(color)
      const m = 1 / 0.222
      return [a * m, j * m, b * m]
    },
  },
  {
    name: 'YIQ',
    mx: new THREE.Matrix4().makeRotationY(rad(45)),
    fn: color => {
      const { y, i, q } = yiq(color)
      return [q, y, i]
    },
  },
]
