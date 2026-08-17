import { useMemo } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

interface ConfettiProps {
  /** Increment to fire a burst. A value of 0 fires nothing (initial state). */
  fireKey: number
}

interface Piece {
  id: string
  left: number
  color: string
  size: number
  dx: number
  dy: number
  rotate: number
  duration: number
  delay: number
}

const COLORS = ['#f0961a', '#fbcd77', '#14b39a', '#75e5cc', '#f8b13f']

function makePieces(batch: number): Piece[] {
  const count = 26
  return Array.from({ length: count }, (_, i) => ({
    id: `${batch}-${i}`,
    left: 50 + (Math.random() * 40 - 20), // cluster around centre
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 6,
    dx: Math.random() * 240 - 120,
    dy: 220 + Math.random() * 180,
    rotate: Math.random() * 540 - 270,
    duration: 1.1 + Math.random() * 0.7,
    delay: Math.random() * 0.12,
  }))
}

/**
 * Lightweight celebratory confetti (Framer Motion, no dependencies). Decorative
 * and non-interactive; renders nothing under reduced motion.
 */
export function Confetti({ fireKey }: ConfettiProps) {
  const reduceMotion = useReducedMotion()
  // Deriving from fireKey means each burst mounts a fresh, self-animating set;
  // the previous batch is unmounted by AnimatePresence.
  const pieces = useMemo(
    () => (fireKey > 0 && !reduceMotion ? makePieces(fireKey) : []),
    [fireKey, reduceMotion],
  )

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      <AnimatePresence>
        {pieces.map((p) => (
          <motion.span
            key={p.id}
            className="absolute top-[22%] block rounded-[2px]"
            style={{
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.6,
              backgroundColor: p.color,
            }}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
            animate={{ opacity: [1, 1, 0], x: p.dx, y: p.dy, rotate: p.rotate }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
