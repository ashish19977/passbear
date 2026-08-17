import { describe, expect, it, vi } from 'vitest'
import {
  generateFriendlyPassword,
  generateMemorablePassword,
  generatePassphrase,
  generatePin,
  generateRandomPassword,
  generatePassword,
  DEFAULT_OPTIONS,
} from './index'
import { CHARSETS } from './charsets'
import { WORDS } from '../data/words'

const wordSet = new Set(WORDS)

describe('generators — no Math.random', () => {
  it('does not use Math.random anywhere in the engine', () => {
    const spy = vi.spyOn(Math, 'random')
    generateFriendlyPassword(DEFAULT_OPTIONS.friendly)
    generateMemorablePassword(DEFAULT_OPTIONS.memorable)
    generatePassphrase(DEFAULT_OPTIONS.passphrase)
    generateRandomPassword(DEFAULT_OPTIONS.random)
    generatePin(DEFAULT_OPTIONS.pin)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe('generatePin', () => {
  it('contains only digits', () => {
    for (let i = 0; i < 50; i++) {
      const { value } = generatePin({ length: 6 })
      expect(value).toMatch(/^[0-9]+$/)
    }
  })

  it('respects the requested length', () => {
    for (const length of [4, 6, 8, 10, 12]) {
      expect(generatePin({ length }).value).toHaveLength(length)
    }
  })

  it('is not empty and reports positive entropy', () => {
    const r = generatePin({ length: 6 })
    expect(r.value.length).toBeGreaterThan(0)
    expect(r.entropyBits).toBeCloseTo(6 * Math.log2(10))
  })
})

describe('generateRandomPassword', () => {
  it('respects the requested length', () => {
    for (const length of [6, 12, 24, 48]) {
      expect(
        generateRandomPassword({
          length,
          uppercase: true,
          lowercase: true,
          numbers: true,
          symbols: true,
        }).value,
      ).toHaveLength(length)
    }
  })

  it('only uses enabled character sets (lowercase only)', () => {
    for (let i = 0; i < 30; i++) {
      const { value } = generateRandomPassword({
        length: 20,
        uppercase: false,
        lowercase: true,
        numbers: false,
        symbols: false,
      })
      expect(value).toMatch(/^[a-z]+$/)
    }
  })

  it('only uses enabled character sets (digits only)', () => {
    const { value } = generateRandomPassword({
      length: 20,
      uppercase: false,
      lowercase: false,
      numbers: true,
      symbols: false,
    })
    expect(value).toMatch(/^[0-9]+$/)
  })

  it('includes every enabled class in a sufficiently long password', () => {
    const { value } = generateRandomPassword({
      length: 40,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    })
    expect(value).toMatch(/[a-z]/)
    expect(value).toMatch(/[A-Z]/)
    expect(value).toMatch(/[0-9]/)
    expect([...value].some((c) => CHARSETS.symbols.includes(c))).toBe(true)
  })

  it('never produces an empty password when no class is enabled', () => {
    const { value } = generateRandomPassword({
      length: 10,
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: false,
    })
    expect(value).toHaveLength(10)
    expect(value).toMatch(/^[a-z]+$/)
  })
})

describe('generatePassphrase', () => {
  it('produces the requested number of words', () => {
    const { value } = generatePassphrase({
      words: 5,
      separator: ' ',
      capitalization: 'lowercase',
    })
    const parts = value.split(' ')
    expect(parts).toHaveLength(5)
    for (const p of parts) expect(wordSet.has(p)).toBe(true)
  })

  it('applies capitalization', () => {
    const { value } = generatePassphrase({
      words: 4,
      separator: '-',
      capitalization: 'capitalize',
    })
    for (const p of value.split('-')) {
      expect(p[0]).toBe(p[0].toUpperCase())
    }
  })

  it('entropy tracks the word count and list size', () => {
    const r = generatePassphrase({
      words: 5,
      separator: ' ',
      capitalization: 'lowercase',
    })
    expect(r.entropyBits).toBeCloseTo(5 * Math.log2(WORDS.length))
  })
})

describe('generateMemorablePassword', () => {
  it('contains the requested words and requested components', () => {
    const { value } = generateMemorablePassword({
      words: 3,
      numbers: true,
      symbols: true,
      separator: '-',
      capitalization: 'capitalize',
    })
    expect(value.length).toBeGreaterThan(0)
    expect(value).toMatch(/[0-9]/) // numbers requested
    expect(value).toMatch(/[!@#$%&*?-]/) // symbol requested
    // At least one dictionary word (capitalized) appears.
    const hasWord = WORDS.some((w) =>
      value.toLowerCase().includes(w.toLowerCase()),
    )
    expect(hasWord).toBe(true)
  })

  it('omits numbers and symbols when disabled', () => {
    const { value } = generateMemorablePassword({
      words: 3,
      numbers: false,
      symbols: false,
      separator: '-',
      capitalization: 'lowercase',
    })
    expect(value).not.toMatch(/[0-9]/)
    expect(value).toMatch(/^[a-z-]+$/)
  })
})

describe('generateFriendlyPassword', () => {
  it('includes numbers and a symbol when requested', () => {
    const { value } = generateFriendlyPassword(DEFAULT_OPTIONS.friendly)
    expect(value).toMatch(/[0-9]/)
    expect(value).toMatch(/[!@#$%&*?-]/)
  })

  it('meets the requested minimum length', () => {
    for (let i = 0; i < 20; i++) {
      const { value } = generateFriendlyPassword({
        ...DEFAULT_OPTIONS.friendly,
        minLength: 20,
      })
      expect(value.length).toBeGreaterThanOrEqual(20)
    }
  })

  it('contains at least one dictionary word', () => {
    const { value } = generateFriendlyPassword(DEFAULT_OPTIONS.friendly)
    const hasWord = WORDS.some((w) =>
      value.toLowerCase().includes(w.toLowerCase()),
    )
    expect(hasWord).toBe(true)
  })

  it('reports positive entropy', () => {
    const r = generateFriendlyPassword(DEFAULT_OPTIONS.friendly)
    expect(r.entropyBits).toBeGreaterThan(0)
  })
})

describe('generators — non-empty & variability', () => {
  const types = [
    'friendly',
    'memorable',
    'passphrase',
    'random',
    'pin',
  ] as const

  it('never returns an empty password with defaults', () => {
    for (const t of types) {
      const r = generatePassword(t, DEFAULT_OPTIONS[t])
      expect(r.value.length).toBeGreaterThan(0)
    }
  })

  it('produces different results across multiple generations', () => {
    for (const t of types) {
      const results = new Set<string>()
      for (let i = 0; i < 20; i++) {
        results.add(generatePassword(t, DEFAULT_OPTIONS[t]).value)
      }
      // With cryptographic randomness, collisions across 20 runs are
      // vanishingly unlikely; require substantial variety.
      expect(results.size).toBeGreaterThan(10)
    }
  })
})
