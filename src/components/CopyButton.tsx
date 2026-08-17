import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { copyToClipboard } from '../utils/clipboard'

interface CopyButtonProps {
  value: string
  onCopied?: () => void
  className?: string
}

/** Accessible copy-to-clipboard button with a transient "Copied" state. */
export function CopyButton({ value, onCopied, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(value)
    if (!ok) return
    setCopied(true)
    onCopied?.()
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCopied(false), 1800)
  }, [value, onCopied])

  return (
    <motion.button
      type="button"
      onClick={handleCopy}
      disabled={!value}
      aria-label={copied ? 'Password copied to clipboard' : 'Copy password'}
      whileHover={reduceMotion || !value ? undefined : { scale: 1.02 }}
      whileTap={reduceMotion || !value ? undefined : { scale: 0.96 }}
      className={
        'inline-flex items-center justify-center gap-2 rounded-xl border border-honey-200 bg-white px-4 py-3 font-medium text-honey-900 shadow-sm transition hover:bg-honey-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:cursor-not-allowed disabled:opacity-50 ' +
        (className ?? '')
      }
    >
      <span className="relative inline-flex h-[18px] w-[18px] items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.svg
              key="check"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              initial={{ scale: 0, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="absolute text-teal-600"
            >
              <motion.path
                d="M20 6L9 17l-5-5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduceMotion ? undefined : { pathLength: 0 }}
                animate={reduceMotion ? undefined : { pathLength: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </motion.svg>
          ) : (
            <motion.svg
              key="copy"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute"
            >
              <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
              <path
                d="M5 15V5a2 2 0 012-2h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </motion.button>
  )
}
