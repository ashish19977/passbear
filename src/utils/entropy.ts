import type { StrengthLabel, StrengthResult } from '../types/generator'

/**
 * Transparent strength / entropy estimation.
 *
 * Entropy here reflects the number of *independent, uniform random choices*
 * made while generating a password (words drawn from the list, random digits,
 * symbols, characters, etc.) — NOT how visually complex the resulting string
 * looks. Every generator accumulates its entropy from the same primitives
 * exposed here so the reported figure is honest.
 *
 * IMPORTANT: An entropy estimate describes resistance to brute-force guessing
 * assuming an attacker knows the generation scheme. It is a useful signal, not
 * a guarantee of security. Reuse, phishing, and endpoint compromise are out of
 * scope of any strength meter.
 */

export const LOG2 = Math.log2

/** Bits contributed by one independent choice among `n` equally-likely items. */
export function bitsForChoices(n: number): number {
  if (n <= 1) return 0
  return LOG2(n)
}

/** Bits contributed by drawing `count` characters from a charset of `size`. */
export function bitsForCharset(size: number, count: number): number {
  if (size <= 1 || count <= 0) return 0
  return count * LOG2(size)
}

// Thresholds are deliberately conservative for a consumer product. Short PINs
// will honestly read as "Weak" because they genuinely are low-entropy.
const THRESHOLDS: { label: StrengthLabel; min: number }[] = [
  { label: 'Excellent', min: 90 },
  { label: 'Strong', min: 70 },
  { label: 'Fair', min: 45 },
  { label: 'Weak', min: 0 },
]

/** Map an entropy value (in bits) to a labelled strength result. */
export function classifyStrength(entropyBits: number): StrengthResult {
  const bits = Math.max(0, entropyBits)
  const label = THRESHOLDS.find((t) => bits >= t.min)?.label ?? 'Weak'
  // Normalise against 128 bits (a common "very strong" reference) for UI bars.
  const score = Math.min(1, bits / 128)
  return { entropyBits: bits, label, score }
}

/** Round entropy for display, e.g. "~85 bits". */
export function formatEntropy(entropyBits: number): string {
  return `~${Math.round(entropyBits)} bits`
}

/**
 * Rough entropy estimate for arbitrary, user-edited text. Assumes the text was
 * random over the character classes it uses — an OPTIMISTIC upper bound, not a
 * guarantee. Only used for the free-text edit mode, which is clearly labelled
 * as estimated.
 */
export function estimateTextEntropy(text: string): number {
  if (!text) return 0
  let pool = 0
  if (/[a-z]/.test(text)) pool += 26
  if (/[A-Z]/.test(text)) pool += 26
  if (/[0-9]/.test(text)) pool += 10
  if (/[^a-zA-Z0-9]/.test(text)) pool += 32
  return text.length * LOG2(pool || 1)
}
