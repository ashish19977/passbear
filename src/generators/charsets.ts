/**
 * Character sets used by the random generator and referenced by the entropy
 * estimator. Symbols are deliberately limited to a widely-accepted set that
 * is accepted by the vast majority of websites.
 */
export const CHARSETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*-_=+?',
} as const

export type CharsetKey = keyof typeof CHARSETS

/** Symbols reused by friendly/memorable generators (a friendlier subset). */
export const FRIENDLY_SYMBOLS = '!@#$%&*?-'
