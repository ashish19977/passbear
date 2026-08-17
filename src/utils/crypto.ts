/**
 * Cryptographically secure randomness helpers.
 *
 * Every random decision in PassBear flows through this module so that we
 * never accidentally reach for `Math.random()` (which is NOT suitable for
 * security-sensitive values). All functions are backed by the Web Crypto
 * API's `crypto.getRandomValues()`.
 */

function getCrypto(): Crypto {
  const c = globalThis.crypto
  if (!c || typeof c.getRandomValues !== 'function') {
    throw new Error(
      'Web Crypto API is unavailable; refusing to generate insecure passwords.',
    )
  }
  return c
}

/**
 * Return a uniformly-distributed random integer in the range [0, max).
 *
 * Uses rejection sampling to avoid modulo bias: values from the raw random
 * space that fall outside the largest exact multiple of `max` are discarded
 * and re-drawn.
 */
export function randomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0) {
    throw new RangeError('randomInt(max) requires a positive integer max')
  }
  if (max === 1) return 0

  const crypto = getCrypto()
  const range = 0x100000000 // 2^32, the space of a Uint32
  // Largest multiple of `max` that fits in the range; anything at or above
  // this limit is rejected to keep the distribution uniform.
  const limit = range - (range % max)
  const buffer = new Uint32Array(1)

  let value: number
  do {
    crypto.getRandomValues(buffer)
    value = buffer[0]
  } while (value >= limit)

  return value % max
}

/** Pick a uniformly random element from a non-empty array. */
export function randomChoice<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new RangeError('randomChoice() requires a non-empty array')
  }
  return items[randomInt(items.length)]
}

/**
 * Fisher–Yates shuffle using cryptographically secure randomness.
 * Returns a new array; the input is not mutated.
 */
export function shuffle<T>(items: readonly T[]): T[] {
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Generate a random string by drawing `length` chars from `charset`. */
export function randomString(charset: string, length: number): string {
  if (charset.length === 0) {
    throw new RangeError('randomString() requires a non-empty charset')
  }
  let out = ''
  for (let i = 0; i < length; i++) {
    out += charset[randomInt(charset.length)]
  }
  return out
}

/** Random single digit 0–9 as a string. */
export function randomDigit(): string {
  return String(randomInt(10))
}
