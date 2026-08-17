import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface PasswordDisplayProps {
  value: string
  /** Colourise digits and symbols to aid readability. */
  colorize?: boolean
  /** When true, render an editable input instead of read-only text. */
  editable?: boolean
  onChange?: (value: string) => void
}

function charClass(ch: string): string {
  if (/[0-9]/.test(ch)) return 'text-teal-600'
  if (/[a-zA-Z]/.test(ch)) return 'text-slate-800'
  if (ch === ' ') return ''
  return 'text-honey-600' // symbols
}

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz0123456789!@#$%&*?-'
const STAGGER = 22 // ms between each character locking in
const LEAD = 140 // ms of scramble before the first character locks

function randomGlyph(): string {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
}

/**
 * Slot-machine reveal: on each new password the characters scramble through
 * random glyphs and lock in left-to-right. Compares the previous value so the
 * effect only scrambles on genuine changes (and never on the initial value,
 * even under React StrictMode's double-invoked effects).
 */
function useScrambledText(value: string, enabled: boolean): string {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef<string | null>(null)

  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = value
    if (!enabled || prev === null || prev === value) {
      setDisplay(value)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      let out = ''
      let done = true
      for (let i = 0; i < value.length; i++) {
        if (elapsed >= LEAD + i * STAGGER) {
          out += value[i]
        } else {
          out += value[i] === ' ' ? ' ' : randomGlyph()
          done = false
        }
      }
      setDisplay(out)
      if (done) setDisplay(value)
      else raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, enabled])

  return display
}

/**
 * Read-only display of the generated password.
 *
 * Privacy: the value lives only in React state for the current session. It is
 * never written to storage, cookies, or the console, and never leaves the
 * device.
 */
export function PasswordDisplay({
  value,
  colorize = true,
  editable = false,
  onChange,
}: PasswordDisplayProps) {
  const reduceMotion = useReducedMotion()
  const animate = !reduceMotion
  const display = useScrambledText(value, animate && !editable)

  if (editable) {
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          aria-label="Edit password"
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          className="min-h-[64px] w-full rounded-2xl border-2 border-teal-400 bg-white px-5 py-4 text-left font-mono text-xl leading-relaxed shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 sm:text-2xl"
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <motion.div
        animate={
          !animate || !value
            ? undefined
            : { scale: [1, 1.012, 1], transition: { duration: 0.35 } }
        }
        tabIndex={0}
        role="textbox"
        aria-readonly="true"
        aria-label="Generated password"
        className="min-h-[64px] w-full break-all rounded-2xl border border-honey-200 bg-white px-5 py-4 text-left font-mono text-xl leading-relaxed shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 sm:text-2xl"
      >
        {value ? (
          colorize ? (
            <span>
              {display.split('').map((ch, i) => (
                <span key={i} className={charClass(ch)}>
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              ))}
            </span>
          ) : (
            <span>{display}</span>
          )
        ) : (
          <span className="text-slate-400">Your password will appear here</span>
        )}
      </motion.div>
    </div>
  )
}
