import { useEffect, useRef } from 'react'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import type { Transition, Variants } from 'framer-motion'

export type BearState =
  | 'idle'
  | 'generating'
  | 'success'
  | 'copied'
  | 'strong'
  | 'weak'

interface BearProps {
  state?: BearState
  size?: number
  className?: string
}

// Whole-body float + reaction for each state.
const bodyVariants: Variants = {
  idle: { y: [0, -3, 0], rotate: 0 },
  generating: { rotate: [0, -7, 7, -5, 0], y: [0, -2, 0] },
  success: { y: [0, -12, 0], rotate: [0, -2, 2, 0] },
  strong: { y: [0, -10, 0], rotate: [0, 2, -2, 0] },
  copied: { rotate: [0, -5, 5, 0], y: [0, -4, 0] },
  weak: { rotate: [0, -2, 2, -1, 0], y: 0 },
}

const bodyTransition: Record<BearState, Transition> = {
  idle: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' },
  generating: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
  success: { duration: 0.8, ease: 'easeOut' },
  strong: { duration: 0.9, repeat: 1, ease: 'easeInOut' },
  copied: { duration: 0.55, ease: 'easeInOut' },
  weak: { duration: 0.5, ease: 'easeInOut' },
}

// Ears perk/wiggle depending on mood.
const earVariants: Variants = {
  idle: { rotate: 0 },
  generating: { rotate: [0, -8, 8, 0] },
  success: { rotate: [0, -12, 0] },
  strong: { rotate: [0, -12, 0] },
  copied: { rotate: [0, 6, 0] },
  weak: { rotate: [0, 3, 0] },
}

// Arms wave on happy states.
const armVariants: Variants = {
  idle: { rotate: [0, 4, 0] },
  generating: { rotate: [0, -10, 10, 0] },
  success: { rotate: [0, -35, -20, -35, 0] },
  strong: { rotate: [0, -30, -15, -30, 0] },
  copied: { rotate: [0, -25, 0] },
  weak: { rotate: 0 },
}

const SPARKLES = [
  { cx: 18, cy: 30, d: 0 },
  { cx: 104, cy: 26, d: 0.12 },
  { cx: 12, cy: 66, d: 0.24 },
  { cx: 110, cy: 62, d: 0.32 },
  { cx: 92, cy: 96, d: 0.18 },
]

const BLINK: Transition = {
  duration: 4,
  times: [0, 0.92, 0.96, 1],
  repeat: Infinity,
}

/**
 * PassBear mascot — an inline SVG bear with layered, subtle Framer Motion
 * reactions (float, blink, ear wiggle, waving arms, sparkles). No external or
 * copyrighted artwork is used. Purely decorative, so hidden from AT.
 */
export function Bear({ state = 'idle', size = 96, className }: BearProps) {
  const reduceMotion = useReducedMotion()
  const happy = state === 'success' || state === 'strong' || state === 'copied'
  const celebrating = state === 'success' || state === 'strong'
  const winking = state === 'copied'
  const concerned = state === 'weak'
  const animate = reduceMotion ? undefined : state

  // Eyes gently follow the pointer.
  const svgRef = useRef<SVGSVGElement>(null)
  const eyeX = useSpring(0, { stiffness: 140, damping: 15 })
  const eyeY = useSpring(0, { stiffness: 140, damping: 15 })

  useEffect(() => {
    if (reduceMotion) return
    const onMove = (e: MouseEvent) => {
      const el = svgRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const dist = Math.hypot(dx, dy) || 1
      const reach = Math.min(3.2, dist / 45)
      eyeX.set((dx / dist) * reach)
      eyeY.set((dy / dist) * reach)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [reduceMotion, eyeX, eyeY])

  return (
    <motion.svg
      ref={svgRef}
      className={className}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-hidden="true"
      focusable="false"
      initial={false}
      animate={animate}
      variants={reduceMotion ? undefined : bodyVariants}
      transition={reduceMotion ? undefined : bodyTransition[state]}
      style={{ overflow: 'visible' }}
    >
      {/* Celebration sparkles */}
      <AnimatePresence>
        {celebrating && !reduceMotion && (
          <g>
            {SPARKLES.map((s, i) => (
              <motion.path
                key={i}
                d={sparklePath(s.cx, s.cy)}
                className="fill-honey-400"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.4] }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.9, delay: s.d, ease: 'easeOut' }}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
            ))}
          </g>
        )}
      </AnimatePresence>

      {/* Arms (behind body) */}
      <motion.ellipse
        cx="24"
        cy="86"
        rx="9"
        ry="13"
        className="fill-honey-400"
        variants={reduceMotion ? undefined : armVariants}
        animate={animate}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        style={{ transformBox: 'fill-box', transformOrigin: '70% 20%' }}
      />
      <motion.ellipse
        cx="96"
        cy="86"
        rx="9"
        ry="13"
        className="fill-honey-400"
        variants={reduceMotion ? undefined : armVariants}
        animate={animate}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        style={{ transformBox: 'fill-box', transformOrigin: '30% 20%' }}
      />

      {/* Ears */}
      <motion.g
        variants={reduceMotion ? undefined : earVariants}
        animate={animate}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
      >
        <circle cx="34" cy="30" r="15" className="fill-honey-300" />
        <circle cx="86" cy="30" r="15" className="fill-honey-300" />
        <circle cx="34" cy="30" r="7" className="fill-honey-500" />
        <circle cx="86" cy="30" r="7" className="fill-honey-500" />
      </motion.g>

      {/* Head */}
      <circle cx="60" cy="62" r="40" className="fill-honey-300" />

      {/* Cheeks (blush) appear on happy states */}
      <AnimatePresence>
        {happy && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <circle cx="38" cy="70" r="6" className="fill-honey-400" />
            <circle cx="82" cy="70" r="6" className="fill-honey-400" />
          </motion.g>
        )}
      </AnimatePresence>

      {/* Snout */}
      <ellipse cx="60" cy="76" rx="22" ry="17" className="fill-honey-100" />

      {/* Eyes — follow the pointer, blink periodically unless winking */}
      <motion.g style={reduceMotion ? undefined : { x: eyeX, y: eyeY }}>
        {winking ? (
          <path
            d="M40 58 q6 5 12 0"
            className="stroke-honey-900"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <motion.circle
            cx="46"
            cy="58"
            r="4.5"
            className="fill-honey-900"
            animate={reduceMotion ? undefined : { scaleY: [1, 1, 0.1, 1] }}
            transition={reduceMotion ? undefined : BLINK}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          />
        )}
        <motion.circle
          cx="74"
          cy="58"
          r="4.5"
          className="fill-honey-900"
          animate={reduceMotion ? undefined : { scaleY: [1, 1, 0.1, 1] }}
          transition={reduceMotion ? undefined : BLINK}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        />
      </motion.g>

      {/* Nose */}
      <ellipse cx="60" cy="70" rx="6" ry="4.5" className="fill-honey-900" />

      {/* Mouth */}
      {happy ? (
        <path
          d="M50 80 q10 10 20 0"
          className="stroke-honey-900"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      ) : concerned ? (
        <path
          d="M52 84 q8 -6 16 0"
          className="stroke-honey-900"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <path
          d="M60 74 v6 M52 82 q8 5 16 0"
          className="stroke-honey-900"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </motion.svg>
  )
}

/** Four-point star centred on (cx, cy). */
function sparklePath(cx: number, cy: number): string {
  const o = 5 // outer radius
  const i = 1.6 // inner radius
  return [
    `M${cx} ${cy - o}`,
    `L${cx + i} ${cy - i}`,
    `L${cx + o} ${cy}`,
    `L${cx + i} ${cy + i}`,
    `L${cx} ${cy + o}`,
    `L${cx - i} ${cy + i}`,
    `L${cx - o} ${cy}`,
    `L${cx - i} ${cy - i}`,
    'Z',
  ].join(' ')
}
