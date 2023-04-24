import { test, expect } from 'vitest'
import { RGBA } from '../huelab'
import { colorScale } from './colorScale'

test('colorScale', () => {
  const stops = [
    [0, 0, 0, 0],
    [100, 100, 100, 100],
    [255, 255, 255, 255],
  ] as RGBA[]

  expect(colorScale(stops)(1)).toEqual([255, 255, 255, 255])
  expect(colorScale(stops)(1.5)).toEqual([255, 255, 255, 255])
  expect(colorScale(stops)(0.5)).toEqual([100, 100, 100, 100])
  expect(colorScale(stops)(0.25)).toEqual([50, 50, 50, 50])
  expect(colorScale(stops)(0)).toEqual([0, 0, 0, 0])
})
