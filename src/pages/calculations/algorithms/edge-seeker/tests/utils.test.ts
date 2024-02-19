import { isCW } from '../utils'
import { test, expect } from 'vitest'

test('isClockwise', () => {
  expect(isCW(0, 0)).toBe(true)
  expect(isCW(0, 360)).toBe(true)
  expect(isCW(0, 720)).toBe(true)
  expect(isCW(0, 1)).toBe(true)
  expect(isCW(350, 1)).toBe(true)
  expect(isCW(0, 180)).toBe(true)
  expect(isCW(0, 181)).toBe(false)
  expect(isCW(0, 359)).toBe(false)
  expect(isCW(0, 360)).toBe(true)
  expect(isCW(0, 361)).toBe(true)
  expect(isCW(0, 540)).toBe(true)
  expect(isCW(0, 541)).toBe(false)
  expect(isCW(0, 721)).toBe(true)
  expect(isCW(0, 719)).toBe(false)
})
