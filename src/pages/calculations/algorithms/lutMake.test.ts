import { isClockwise } from './lutMake'
import { test, expect } from 'vitest'

test('isClockwise', () => {
  expect(isClockwise(0, 0)).toBe(true)
  expect(isClockwise(0, 360)).toBe(true)
  expect(isClockwise(0, 720)).toBe(true)
  expect(isClockwise(0, 1)).toBe(true)
  expect(isClockwise(350, 1)).toBe(true)
  expect(isClockwise(0, 180)).toBe(true)
  expect(isClockwise(0, 181)).toBe(false)
  expect(isClockwise(0, 359)).toBe(false)
  expect(isClockwise(0, 360)).toBe(true)
  expect(isClockwise(0, 361)).toBe(true)
  expect(isClockwise(0, 540)).toBe(true)
  expect(isClockwise(0, 541)).toBe(false)
  expect(isClockwise(0, 721)).toBe(true)
  expect(isClockwise(0, 719)).toBe(false)
})
