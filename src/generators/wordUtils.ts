import { WORDS, WORD_COUNT } from '../data/words'
import { randomChoice, randomInt } from '../utils/crypto'
import { bitsForChoices } from '../utils/entropy'
import type { Capitalization } from '../types/generator'

/** Apply the chosen capitalization style to a single word. */
export function applyCapitalization(word: string, style: Capitalization): string {
  switch (style) {
    case 'uppercase':
      return word.toUpperCase()
    case 'capitalize':
      return word.charAt(0).toUpperCase() + word.slice(1)
    case 'lowercase':
    default:
      return word.toLowerCase()
  }
}

/**
 * Pick `count` random words from the list (with replacement) and return them
 * alongside the entropy contributed by those independent draws.
 */
export function pickWords(count: number): { words: string[]; entropyBits: number } {
  const words: string[] = []
  for (let i = 0; i < count; i++) {
    words.push(randomChoice(WORDS))
  }
  return { words, entropyBits: count * bitsForChoices(WORD_COUNT) }
}

/** A random two-digit number string, "00"–"99" (always two characters). */
export function randomTwoDigits(): string {
  return String(randomInt(100)).padStart(2, '0')
}
