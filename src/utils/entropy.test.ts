import { describe, expect, it } from 'vitest'
import {
  bitsForCharset,
  bitsForChoices,
  classifyStrength,
  estimateTextEntropy,
  formatEntropy,
} from './entropy'

describe('entropy utilities', () => {
  it('bitsForChoices computes log2', () => {
    expect(bitsForChoices(2)).toBeCloseTo(1)
    expect(bitsForChoices(256)).toBeCloseTo(8)
    expect(bitsForChoices(1)).toBe(0)
    expect(bitsForChoices(0)).toBe(0)
  })

  it('bitsForCharset multiplies by count', () => {
    expect(bitsForCharset(10, 4)).toBeCloseTo(4 * Math.log2(10))
    expect(bitsForCharset(1, 5)).toBe(0)
    expect(bitsForCharset(26, 0)).toBe(0)
  })

  it('classifyStrength maps bits to labels', () => {
    expect(classifyStrength(10).label).toBe('Weak')
    expect(classifyStrength(50).label).toBe('Fair')
    expect(classifyStrength(75).label).toBe('Strong')
    expect(classifyStrength(120).label).toBe('Excellent')
  })

  it('classifyStrength clamps score between 0 and 1', () => {
    expect(classifyStrength(-5).score).toBe(0)
    expect(classifyStrength(500).score).toBe(1)
  })

  it('formatEntropy rounds and prefixes', () => {
    expect(formatEntropy(84.6)).toBe('~85 bits')
    expect(formatEntropy(40)).toBe('~40 bits')
  })

  it('estimateTextEntropy scales with length and character pool', () => {
    expect(estimateTextEntropy('')).toBe(0)
    expect(estimateTextEntropy('abcd')).toBeCloseTo(4 * Math.log2(26))
    expect(estimateTextEntropy('Ab1!')).toBeCloseTo(4 * Math.log2(94))
    // Adding character classes increases the estimate for equal length.
    expect(estimateTextEntropy('Ab1!')).toBeGreaterThan(estimateTextEntropy('abcd'))
  })
})
