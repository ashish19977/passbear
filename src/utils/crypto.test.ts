import { describe, expect, it, vi } from 'vitest'
import {
  randomChoice,
  randomDigit,
  randomInt,
  randomString,
  shuffle,
} from '../utils/crypto'

describe('crypto utilities', () => {
  it('randomInt stays within [0, max)', () => {
    for (let i = 0; i < 1000; i++) {
      const v = randomInt(10)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(10)
      expect(Number.isInteger(v)).toBe(true)
    }
  })

  it('randomInt(1) always returns 0', () => {
    for (let i = 0; i < 10; i++) expect(randomInt(1)).toBe(0)
  })

  it('randomInt rejects invalid max', () => {
    expect(() => randomInt(0)).toThrow()
    expect(() => randomInt(-5)).toThrow()
    expect(() => randomInt(2.5)).toThrow()
  })

  it('randomChoice returns an element of the array', () => {
    const items = ['a', 'b', 'c', 'd']
    for (let i = 0; i < 100; i++) {
      expect(items).toContain(randomChoice(items))
    }
  })

  it('randomChoice throws on empty array', () => {
    expect(() => randomChoice([])).toThrow()
  })

  it('randomString only uses charset characters and respects length', () => {
    const charset = 'abc123'
    const s = randomString(charset, 50)
    expect(s).toHaveLength(50)
    for (const ch of s) expect(charset).toContain(ch)
  })

  it('randomDigit returns a single digit', () => {
    for (let i = 0; i < 50; i++) {
      const d = randomDigit()
      expect(d).toMatch(/^[0-9]$/)
    }
  })

  it('shuffle keeps the same elements without mutating input', () => {
    const input = [1, 2, 3, 4, 5]
    const copy = [...input]
    const out = shuffle(input)
    expect(input).toEqual(copy) // not mutated
    expect(out.slice().sort()).toEqual(copy.slice().sort())
  })

  it('never calls Math.random', () => {
    const spy = vi.spyOn(Math, 'random')
    randomInt(100)
    randomChoice([1, 2, 3])
    randomString('abcdef', 20)
    shuffle([1, 2, 3, 4])
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
