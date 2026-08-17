import type { GeneratedPassword, PassphraseOptions } from '../types/generator'
import { applyCapitalization, pickWords } from './wordUtils'

/**
 * Passphrase — several plain random words joined by a separator,
 * e.g. `purple river mountain coffee tiger`.
 *
 * Entropy comes entirely from the word draws, which makes it easy to reason
 * about: add more words to add more bits.
 */
export function generatePassphrase(
  options: PassphraseOptions,
): GeneratedPassword {
  const count = Math.max(1, Math.floor(options.words))
  const picked = pickWords(count)
  const words = picked.words.map((w) =>
    applyCapitalization(w, options.capitalization),
  )
  return {
    value: words.join(options.separator),
    entropyBits: picked.entropyBits,
  }
}
