import type { AdvancedOptions, GeneratedPassword } from '../types/generator'

export const DEFAULT_ADVANCED: AdvancedOptions = {
  prefix: '',
  suffix: '',
  fixedEnabled: false,
  fixedIndex: 0,
  fixedChar: '',
}

/** True when any advanced tweak is in effect. */
export function isAdvancedActive(a: AdvancedOptions): boolean {
  return (
    a.prefix !== '' || a.suffix !== '' || (a.fixedEnabled && a.fixedChar !== '')
  )
}

/**
 * Apply advanced tweaks to a generated password. Inserted/affixed characters
 * are fixed and known, so they add 0 bits — the returned entropy is unchanged
 * from the random core.
 */
export function applyAdvanced(
  base: GeneratedPassword,
  a: AdvancedOptions,
): GeneratedPassword {
  let value = base.value

  if (a.fixedEnabled && a.fixedChar) {
    const i = Math.max(0, Math.min(Math.floor(a.fixedIndex), value.length))
    value = value.slice(0, i) + a.fixedChar[0] + value.slice(i)
  }

  value = a.prefix + value + a.suffix

  return { value, entropyBits: base.entropyBits }
}
