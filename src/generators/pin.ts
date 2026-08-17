import type { GeneratedPassword, PinOptions } from '../types/generator'
import { randomString } from '../utils/crypto'
import { bitsForCharset } from '../utils/entropy'
import { CHARSETS } from './charsets'

/**
 * PIN — digits only, e.g. `5839271046`.
 *
 * Entropy is `length * log2(10)`. Short PINs are honestly low-entropy and the
 * strength meter will reflect that.
 */
export function generatePin(options: PinOptions): GeneratedPassword {
  const length = Math.max(1, Math.floor(options.length))
  return {
    value: randomString(CHARSETS.numbers, length),
    entropyBits: bitsForCharset(CHARSETS.numbers.length, length),
  }
}
