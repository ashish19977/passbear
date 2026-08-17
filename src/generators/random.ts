import type { GeneratedPassword, RandomOptions } from '../types/generator'
import { randomInt, randomString } from '../utils/crypto'
import { bitsForCharset } from '../utils/entropy'
import { CHARSETS } from './charsets'

/**
 * Random — a fully random string over the selected character classes,
 * e.g. `vQ7$xP2!mL9@Z4#k`.
 *
 * Each character is drawn uniformly from the combined charset, so the output
 * only ever contains enabled classes and entropy is simply
 * `length * log2(charsetSize)`.
 */
export function generateRandomPassword(
  options: RandomOptions,
): GeneratedPassword {
  let charset = ''
  if (options.lowercase) charset += CHARSETS.lowercase
  if (options.uppercase) charset += CHARSETS.uppercase
  if (options.numbers) charset += CHARSETS.numbers
  if (options.symbols) charset += CHARSETS.symbols

  // Never produce an empty password: fall back to lowercase if nothing is on.
  if (charset === '') charset = CHARSETS.lowercase

  const length = Math.max(1, Math.floor(options.length))
  let value = randomString(charset, length)

  // Best-effort: ensure every enabled class is represented for site rules,
  // without lowering the honest entropy floor of length * log2(size).
  value = ensureClassesPresent(value, options)

  return { value, entropyBits: bitsForCharset(charset.length, length) }
}

function ensureClassesPresent(value: string, options: RandomOptions): string {
  const required: string[] = []
  if (options.lowercase) required.push(CHARSETS.lowercase)
  if (options.uppercase) required.push(CHARSETS.uppercase)
  if (options.numbers) required.push(CHARSETS.numbers)
  if (options.symbols) required.push(CHARSETS.symbols)
  if (required.length <= 1 || required.length > value.length) return value

  const chars = value.split('')
  const usedPositions = new Set<number>()
  for (const set of required) {
    if (chars.some((c) => set.includes(c))) continue
    let pos = randomInt(chars.length)
    while (usedPositions.has(pos)) pos = randomInt(chars.length)
    usedPositions.add(pos)
    chars[pos] = set[randomInt(set.length)]
  }
  return chars.join('')
}
