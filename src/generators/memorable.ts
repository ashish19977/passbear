import type { GeneratedPassword, MemorableOptions } from '../types/generator'
import { randomInt } from '../utils/crypto'
import { bitsForChoices } from '../utils/entropy'
import { FRIENDLY_SYMBOLS } from './charsets'
import { applyCapitalization, pickWords, randomTwoDigits } from './wordUtils'

/**
 * Memorable — several random words plus an optional number and symbol,
 * e.g. `Coffee-River-82!Tiger`.
 */
export function generateMemorablePassword(
  options: MemorableOptions,
): GeneratedPassword {
  const count = Math.max(1, Math.floor(options.words))
  let entropyBits = 0

  const picked = pickWords(count)
  entropyBits += picked.entropyBits
  const tokens = picked.words.map((w) =>
    applyCapitalization(w, options.capitalization),
  )

  // Insert a two-digit number as its own token at a random position.
  if (options.numbers) {
    const index = randomInt(tokens.length) + 1 // after one of the words
    tokens.splice(index, 0, randomTwoDigits())
    entropyBits += bitsForChoices(100)
  }

  // Join, optionally swapping one separator gap for a symbol.
  let value: string
  if (options.symbols && tokens.length >= 2) {
    const symbol = FRIENDLY_SYMBOLS[randomInt(FRIENDLY_SYMBOLS.length)]
    entropyBits += bitsForChoices(FRIENDLY_SYMBOLS.length)
    const gap = randomInt(tokens.length - 1)
    const parts: string[] = []
    for (let i = 0; i < tokens.length; i++) {
      parts.push(tokens[i])
      if (i < tokens.length - 1) {
        parts.push(i === gap ? symbol : options.separator)
      }
    }
    value = parts.join('')
  } else {
    value = tokens.join(options.separator)
    if (options.symbols) {
      const symbol = FRIENDLY_SYMBOLS[randomInt(FRIENDLY_SYMBOLS.length)]
      entropyBits += bitsForChoices(FRIENDLY_SYMBOLS.length)
      value += symbol
    }
  }

  return { value, entropyBits }
}
