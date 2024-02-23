import { fixColorSection } from '../lut/fixColorSection'
import { test, expect } from 'vitest'

test('fixColorSection positive', () => {
  expect(
    fixColorSection([
      { h: 0, c: 0, l: 0 },
      { h: 1, c: 0, l: 0 },
      { h: 2, c: 0, l: 0 },
    ])
  ).toEqual([
    { h: 0, c: 0, l: 0 },
    { h: 1, c: 0, l: 0 },
    { h: 2, c: 0, l: 0 },
  ])
  expect(
    fixColorSection([
      { h: 0, c: 0, l: 0 },
      { h: 1, c: 0, l: 0 },
    ])
  ).toEqual([
    { h: 0, c: 0, l: 0 },
    { h: 1, c: 0, l: 0 },
  ])
})

test('fixColorSection negative', () => {
  expect(
    fixColorSection([
      { h: 0, c: 0, l: 0 },
      { h: 2, c: 0, l: 0 },
      { h: 3, c: 0, l: 0 },
      { h: 1, c: 0, l: 0 },
    ])
  ).toEqual([
    { h: 0, c: 0, l: 0 },
    { h: 1 - 0.0001, c: 0, l: 0 },
    { h: 1, c: 0, l: 0 },
  ])
})
