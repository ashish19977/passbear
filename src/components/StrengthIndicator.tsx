import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { StrengthResult } from '../types/generator'
import { formatEntropy } from '../utils/entropy'

interface StrengthIndicatorProps {
  strength: StrengthResult
  /** When true, present the entropy as a rough estimate (edited passwords). */
  estimated?: boolean
}

const LABEL_STYLES: Record<string, { bar: string; text: string }> = {
  Weak: { bar: 'bg-red-400', text: 'text-red-600' },
  Fair: { bar: 'bg-amber-400', text: 'text-amber-600' },
  Strong: { bar: 'bg-teal-400', text: 'text-teal-700' },
  Excellent: { bar: 'bg-teal-600', text: 'text-teal-800' },
}

/** Transparent strength meter driven by the estimated configuration entropy. */
export function StrengthIndicator({ strength, estimated = false }: StrengthIndicatorProps) {
  const reduceMotion = useReducedMotion()
  const styles = LABEL_STYLES[strength.label] ?? LABEL_STYLES.Weak
  const pct = Math.round(strength.score * 100)
  const excellent = strength.label === 'Excellent'

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-500">Strength</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={strength.label}
            initial={{ opacity: 0, y: -4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className={'text-sm font-semibold ' + styles.text}
          >
            {strength.label}
          </motion.span>
        </AnimatePresence>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-honey-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={`Password strength: ${strength.label}, approximately ${Math.round(strength.entropyBits)} bits of entropy`}
      >
        <motion.div
          className={'relative h-full overflow-hidden rounded-full ' + styles.bar}
          initial={false}
          animate={{
            width: `${Math.max(6, pct)}%`,
            boxShadow:
              excellent && !reduceMotion
                ? [
                    '0 0 0px rgba(10,145,126,0)',
                    '0 0 12px rgba(10,145,126,0.75)',
                    '0 0 0px rgba(10,145,126,0)',
                  ]
                : '0 0 0px rgba(0,0,0,0)',
          }}
          transition={{
            width: { type: 'spring', stiffness: 180, damping: 22 },
            boxShadow: { duration: 1.8, repeat: excellent ? Infinity : 0 },
          }}
        >
          {!reduceMotion && (
            <motion.span
              className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              animate={{ x: ['0%', '500%'] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </motion.div>
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {estimated ? 'Estimated entropy: ' : 'Approx. entropy: '}
        <span className="font-medium text-slate-700">{formatEntropy(strength.entropyBits)}</span>
      </p>
    </div>
  )
}
