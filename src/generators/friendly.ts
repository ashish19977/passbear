import type { FriendlyOptions, GeneratedPassword } from '../types/generator'
import { randomInt, randomString } from '../utils/crypto'
import { bitsForCharset, bitsForChoices } from '../utils/entropy'
import { CHARSETS, FRIENDLY_SYMBOLS } from './charsets'
import { applyCapitalization, pickWords } from './wordUtils'

/**
 * Strong & Friendly — readable words followed by a symbol and trailing digits,
 * e.g. `RiverMoon@42`. This shape (letters, then one symbol, then numbers at
 * the end) is widely accepted by websites, so it usually pastes without edits.
 *
 * Entropy is accumulated from the word draws, the chosen symbol, the trailing
 * digit group and any length padding.
 */
export function generateFriendlyPassword(
  options: FriendlyOptions,
): GeneratedPassword {
  const count = Math.max(1, Math.floor(options.words))
  let entropyBits = 0

  const picked = pickWords(count)
  entropyBits += picked.entropyBits
  const tokens = picked.words.map((w) =>
    applyCapitalization(w, options.capitalization),
  )

  let value = tokens.join(options.separator)

  // A single symbol sits between the words and the trailing numbers.
  if (options.symbols) {
    const symbol = FRIENDLY_SYMBOLS[randomInt(FRIENDLY_SYMBOLS.length)]
    entropyBits += bitsForChoices(FRIENDLY_SYMBOLS.length)
    value += symbol
  }

  // Numbers always go at the end.
  if (options.numbers) {
    value += String(randomInt(100)).padStart(2, '0')
    entropyBits += bitsForChoices(100)
  }

  // Pad with more trailing digits until the target length is reached.
  if (value.length < options.minLength) {
    const pad = options.minLength - value.length
    value += randomString(CHARSETS.numbers, pad)
    entropyBits += bitsForCharset(CHARSETS.numbers.length, pad)
  }

  return { value, entropyBits }
}
