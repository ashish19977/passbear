import { describe, expect, it } from 'vitest'
import { DEFAULT_ADVANCED, applyAdvanced, isAdvancedActive } from './advanced'
import type { AdvancedOptions, GeneratedPassword } from '../types/generator'

const base: GeneratedPassword = { value: 'River7Moon', entropyBits: 64 }

function opts(patch: Partial<AdvancedOptions> = {}): AdvancedOptions {
  return { ...DEFAULT_ADVANCED, ...patch }
}

describe('advanced post-processing', () => {
  it('is inactive by default', () => {
    expect(isAdvancedActive(DEFAULT_ADVANCED)).toBe(false)
  })

  it('detects active tweaks', () => {
    expect(isAdvancedActive(opts({ prefix: 'My' }))).toBe(true)
    expect(isAdvancedActive(opts({ suffix: '!' }))).toBe(true)
    expect(isAdvancedActive(opts({ fixedEnabled: true, fixedChar: '#' }))).toBe(true)
    // Enabled but no char is not active.
    expect(isAdvancedActive(opts({ fixedEnabled: true, fixedChar: '' }))).toBe(false)
  })

  it('applies prefix and suffix without changing entropy', () => {
    const r = applyAdvanced(base, opts({ prefix: 'My', suffix: '!' }))
    expect(r.value).toBe('MyRiver7Moon!')
    expect(r.entropyBits).toBe(64) // fixed chars add 0 bits
  })

  it('inserts a fixed character at the given index', () => {
    const r = applyAdvanced(base, opts({ fixedEnabled: true, fixedChar: '#', fixedIndex: 5 }))
    expect(r.value).toBe('River#7Moon')
    expect(r.entropyBits).toBe(64)
  })

  it('clamps the fixed index into range', () => {
    const r = applyAdvanced(base, opts({ fixedEnabled: true, fixedChar: '#', fixedIndex: 999 }))
    expect(r.value).toBe('River7Moon#')
  })

  it('returns the base value untouched when inactive', () => {
    expect(applyAdvanced(base, DEFAULT_ADVANCED).value).toBe('River7Moon')
  })
})
