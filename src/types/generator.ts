/**
 * Shared types for the PassBear generator engine.
 *
 * The engine is intentionally decoupled from any React/UI concern: every
 * generator is a pure function that takes an options object and returns a
 * plain result, making the whole engine trivial to unit-test.
 */

export type GeneratorType =
  | 'friendly'
  | 'memorable'
  | 'passphrase'
  | 'random'
  | 'pin'

export type Capitalization = 'lowercase' | 'capitalize' | 'uppercase'

/** Human-readable separators the user can pick between words. */
export type Separator = '-' | '.' | '_' | ' ' | '' | ',' | '/'

export interface FriendlyOptions {
  /** How many dictionary words to include (2–5 recommended). */
  words: number
  /** Include random digits between/after words. */
  numbers: boolean
  /** Include a random symbol. */
  symbols: boolean
  /** Character placed between components. */
  separator: Separator
  capitalization: Capitalization
  /** Pad with extra random digits until this length is reached. */
  minLength: number
}

export interface MemorableOptions {
  words: number
  numbers: boolean
  symbols: boolean
  separator: Separator
  capitalization: Capitalization
}

export interface PassphraseOptions {
  words: number
  separator: Separator
  capitalization: Capitalization
}

export interface RandomOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

export interface PinOptions {
  length: number
}

/**
 * Cross-generator "advanced" tweaks applied as post-processing. These insert
 * fixed, user-known characters, so they contribute NO entropy (the random core
 * keeps its bits). Hidden behind a disclosure in the UI.
 */
export interface AdvancedOptions {
  prefix: string
  suffix: string
  fixedEnabled: boolean
  fixedIndex: number
  fixedChar: string
}

export interface GeneratorOptionsMap {
  friendly: FriendlyOptions
  memorable: MemorableOptions
  passphrase: PassphraseOptions
  random: RandomOptions
  pin: PinOptions
}

export type StrengthLabel = 'Weak' | 'Fair' | 'Strong' | 'Excellent'

export interface StrengthResult {
  /** Estimated entropy of the *configuration*, in bits. */
  entropyBits: number
  label: StrengthLabel
  /** 0–1 value useful for progress bars. */
  score: number
}

/**
 * Result returned by every generator. `entropyBits` is accumulated from the
 * actual independent random choices made during generation, so it reflects the
 * real generation process rather than the look of the string.
 */
export interface GeneratedPassword {
  value: string
  entropyBits: number
}
