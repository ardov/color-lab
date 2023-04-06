// Tests for interpolateValues.tsx using vitest

import { interpolateValues } from './interpolateValues'
import { test, expect } from 'vitest'

test('interpolateValues', () => {
  expect(interpolateValues([])).toEqual([])
  expect(interpolateValues([1])).toEqual([1])
  expect(interpolateValues([null])).toEqual([0])
  expect(interpolateValues([1, 2, 3])).toEqual([1, 2, 3])
  expect(interpolateValues([1, null, 3])).toEqual([1, 2, 3])
  expect(interpolateValues([null, 2, null])).toEqual([2, 2, 2])
  expect(interpolateValues([null, null, null])).toEqual([0, 0, 0])
  expect(interpolateValues([null, null, 3])).toEqual([3, 3, 3])
  expect(interpolateValues([1, null, null])).toEqual([1, 1, 1])
  expect(interpolateValues([1, null, null, null, 5])).toEqual([1, 2, 3, 4, 5])
  expect(interpolateValues([null, 1, null, 3, null])).toEqual([1, 1, 2, 3, 3])
})
