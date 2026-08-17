import { motion, useReducedMotion } from 'framer-motion'

/**
 * Ambient, slowly drifting gradient blobs behind the app. Purely decorative and
 * non-interactive; collapses to a static wash under reduced motion.
 */
export function AmbientBackground() {
  const reduceMotion = useReducedMotion()

  const drift = (dx: number, dy: number) =>
    reduceMotion
      ? undefined
      : {
          x: [0, dx, 0],
          y: [0, dy, 0],
          scale: [1, 1.08, 1],
        }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        className="absolute -left-24 -top-24 h-[42vmax] w-[42vmax] rounded-full bg-honey-200/50 blur-3xl"
        animate={drift(60, 40)}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-32 top-16 h-[38vmax] w-[38vmax] rounded-full bg-teal-200/40 blur-3xl"
        animate={drift(-50, 60)}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-32 left-1/3 h-[36vmax] w-[36vmax] rounded-full bg-honey-300/40 blur-3xl"
        animate={drift(40, -50)}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
