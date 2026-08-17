import type {
  GeneratedPassword,
  GeneratorOptionsMap,
  GeneratorType,
} from '../types/generator'
import { generateFriendlyPassword } from './friendly'
import { generateMemorablePassword } from './memorable'
import { generatePassphrase } from './passphrase'
import { generateRandomPassword } from './random'
import { generatePin } from './pin'

export {
  generateFriendlyPassword,
  generateMemorablePassword,
  generatePassphrase,
  generateRandomPassword,
  generatePin,
}

/** Ordered list of generator types as shown in the UI. */
export const GENERATOR_TYPES: GeneratorType[] = [
  'friendly',
  'memorable',
  'passphrase',
  'random',
  'pin',
]

export interface GeneratorMeta {
  label: string
  short: string
  description: string
  example: string
}

export const GENERATOR_META: Record<GeneratorType, GeneratorMeta> = {
  friendly: {
    label: 'Strong & Friendly',
    short: 'Friendly',
    description: 'Readable words with a symbol and numbers at the end.',
    example: 'RiverMoon@42',
  },
  memorable: {
    label: 'Memorable',
    short: 'Memorable',
    description: 'A few random words that are easy to remember.',
    example: 'Coffee-River-82!Tiger',
  },
  passphrase: {
    label: 'Passphrase',
    short: 'Passphrase',
    description: 'Several plain words — great for typing on any device.',
    example: 'purple river mountain coffee tiger',
  },
  random: {
    label: 'Random',
    short: 'Random',
    description: 'Maximum entropy across the character classes you choose.',
    example: 'vQ7$xP2!mL9@Z4#k',
  },
  pin: {
    label: 'PIN',
    short: 'PIN',
    description: 'Digits only, for devices and cards.',
    example: '5839271046',
  },
}

/** Default options for each generator type. */
export const DEFAULT_OPTIONS: GeneratorOptionsMap = {
  friendly: {
    words: 2,
    numbers: true,
    symbols: true,
    separator: '',
    capitalization: 'capitalize',
    minLength: 10,
  },
  memorable: {
    words: 3,
    numbers: true,
    symbols: true,
    separator: '-',
    capitalization: 'capitalize',
  },
  passphrase: {
    words: 5,
    separator: ' ',
    capitalization: 'lowercase',
  },
  random: {
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  },
  pin: {
    length: 6,
  },
}

/** Type-safe dispatcher used by the UI. */
export function generatePassword<T extends GeneratorType>(
  type: T,
  options: GeneratorOptionsMap[T],
): GeneratedPassword {
  switch (type) {
    case 'friendly':
      return generateFriendlyPassword(options as GeneratorOptionsMap['friendly'])
    case 'memorable':
      return generateMemorablePassword(
        options as GeneratorOptionsMap['memorable'],
      )
    case 'passphrase':
      return generatePassphrase(options as GeneratorOptionsMap['passphrase'])
    case 'random':
      return generateRandomPassword(options as GeneratorOptionsMap['random'])
    case 'pin':
      return generatePin(options as GeneratorOptionsMap['pin'])
    default: {
      const exhaustive: never = type
      throw new Error(`Unknown generator type: ${String(exhaustive)}`)
    }
  }
}
