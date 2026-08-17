import type {
  AdvancedOptions,
  GeneratorOptionsMap,
  GeneratorType,
} from '../types/generator'

/**
 * Optional, user-controlled persistence for generator PREFERENCES only.
 *
 * IMPORTANT: this stores configuration (generator type, word count, length,
 * separators, prefix/suffix, etc.) — never a generated password. It is only
 * ever written when the user explicitly turns on "Remember my settings", and
 * is removed immediately when they turn it off.
 */

const STORAGE_KEY = 'passbear:preferences:v1'

export interface StoredPreferences {
  type: GeneratorType
  optionsMap: GeneratorOptionsMap
  advanced: AdvancedOptions
}

function getStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    // Private browsing / disabled storage — treat as unavailable.
    return null
  }
}

export function loadPreferences(): StoredPreferences | null {
  const storage = getStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredPreferences
    if (!parsed || typeof parsed !== 'object' || !parsed.type) return null
    return parsed
  } catch {
    return null
  }
}

export function savePreferences(prefs: StoredPreferences): void {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // Storage full/unavailable — remembering settings is best-effort only.
  }
}

export function clearPreferences(): void {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore.
  }
}

/**
 * Merge a stored (untrusted) settings object over known-good defaults.
 *
 * This is what makes "Remember my settings" resilient to schema drift:
 *  - New fields added later simply fall back to their default (not present
 *    in old stored data).
 *  - Renamed/removed fields are dropped — only keys that exist on `defaults`
 *    are ever copied over, so stale/renamed keys never leak into state.
 *  - Wrong-typed values (e.g. hand-edited or corrupted storage) are ignored
 *    in favour of the default, so a bad value can never crash a generator.
 *
 * NOTE: if a future change alters the *meaning* of a field without renaming
 * it (e.g. a boolean becomes an enum), bump STORAGE_KEY's version suffix so
 * old incompatible data is ignored outright instead of being merged.
 */
export function sanitizeLike<T extends object>(defaults: T, stored: unknown): T {
  if (!stored || typeof stored !== 'object') return { ...defaults }
  const result = { ...defaults }
  const source = stored as Record<string, unknown>
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const value = source[key as string]
    if (value !== undefined && typeof value === typeof defaults[key]) {
      result[key] = value as T[typeof key]
    }
  }
  return result
}
