import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearPreferences,
  loadPreferences,
  sanitizeLike,
  savePreferences,
} from './preferences'
import { DEFAULT_ADVANCED } from '../generators/advanced'
import { DEFAULT_OPTIONS } from '../generators'

beforeEach(() => {
  window.localStorage.clear()
})

describe('preferences storage', () => {
  it('returns null when nothing is stored', () => {
    expect(loadPreferences()).toBeNull()
  })

  it('round-trips saved preferences', () => {
    savePreferences({
      type: 'pin',
      optionsMap: DEFAULT_OPTIONS,
      advanced: DEFAULT_ADVANCED,
    })
    const loaded = loadPreferences()
    expect(loaded?.type).toBe('pin')
    expect(loaded?.optionsMap.pin.length).toBe(DEFAULT_OPTIONS.pin.length)
  })

  it('never contains a password-shaped value key', () => {
    savePreferences({
      type: 'friendly',
      optionsMap: DEFAULT_OPTIONS,
      advanced: DEFAULT_ADVANCED,
    })
    const raw = window.localStorage.getItem('passbear:preferences:v1')
    expect(raw).not.toBeNull()
    expect(raw).not.toContain('"value"')
  })

  it('clears stored preferences', () => {
    savePreferences({
      type: 'random',
      optionsMap: DEFAULT_OPTIONS,
      advanced: DEFAULT_ADVANCED,
    })
    clearPreferences()
    expect(loadPreferences()).toBeNull()
  })

  it('ignores malformed stored data', () => {
    window.localStorage.setItem('passbear:preferences:v1', '{not json')
    expect(loadPreferences()).toBeNull()
  })
})

describe('sanitizeLike — resilience to schema drift', () => {
  const defaults = { words: 3, symbols: true, separator: '-' as const }

  it('returns a clone of defaults when nothing is stored', () => {
    expect(sanitizeLike(defaults, undefined)).toEqual(defaults)
    expect(sanitizeLike(defaults, null)).toEqual(defaults)
  })

  it('fills in newly introduced fields with their default', () => {
    // Simulates an older save missing a field added in a later release.
    const stored = { words: 5 }
    expect(sanitizeLike(defaults, stored)).toEqual({
      words: 5,
      symbols: true,
      separator: '-',
    })
  })

  it('drops renamed/removed fields instead of leaking them into state', () => {
    // "wordCount" used to be "words"; the old key must not survive.
    const stored = { wordCount: 99, symbols: false }
    const result = sanitizeLike(defaults, stored)
    expect(result).toEqual({ words: 3, symbols: false, separator: '-' })
    expect(result).not.toHaveProperty('wordCount')
  })

  it('rejects wrong-typed (corrupted) values and keeps the default', () => {
    const stored = { words: 'a lot', symbols: true }
    expect(sanitizeLike(defaults, stored)).toEqual({
      words: 3, // falls back — stored value was a string, not a number
      symbols: true,
      separator: '-',
    })
  })

  it('ignores unknown stray keys entirely', () => {
    const stored = { words: 4, extraLegacyField: 'whatever' }
    const result = sanitizeLike(defaults, stored) as Record<string, unknown>
    expect(result).not.toHaveProperty('extraLegacyField')
  })

  it('never throws on completely unexpected stored shapes', () => {
    expect(() => sanitizeLike(defaults, 'a string')).not.toThrow()
    expect(() => sanitizeLike(defaults, 42)).not.toThrow()
    expect(() => sanitizeLike(defaults, [])).not.toThrow()
    expect(sanitizeLike(defaults, 'a string')).toEqual(defaults)
  })
})
