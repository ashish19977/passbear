import { useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { GENERATOR_META, GENERATOR_TYPES } from '../generators'
import type { GeneratorType } from '../types/generator'

interface GeneratorTypeSelectorProps {
  value: GeneratorType
  onChange: (type: GeneratorType) => void
}

/**
 * Accessible single-select for the five generator types. Implemented as an
 * ARIA radiogroup with roving focus and arrow-key navigation.
 */
export function GeneratorTypeSelector({
  value,
  onChange,
}: GeneratorTypeSelectorProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const reduceMotion = useReducedMotion()

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    let delta: number
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') delta = 1
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') delta = -1
    else return
    e.preventDefault()
    const next =
      (index + delta + GENERATOR_TYPES.length) % GENERATOR_TYPES.length
    onChange(GENERATOR_TYPES[next])
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label="Password type"
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
    >
      {GENERATOR_TYPES.map((type, index) => {
        const selected = type === value
        return (
          <motion.button
            key={type}
            ref={(el) => {
              refs.current[index] = el
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(type)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            className={
              'relative overflow-hidden rounded-xl border px-3 py-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ' +
              (selected
                ? 'border-teal-500 text-white shadow-sm'
                : 'border-honey-200 bg-white text-slate-700 hover:border-honey-300 hover:bg-honey-50')
            }
          >
            {selected && (
              <motion.span
                layoutId={reduceMotion ? undefined : 'type-pill'}
                className="absolute inset-0 -z-0 rounded-[11px] bg-teal-500"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10">{GENERATOR_META[type].label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
