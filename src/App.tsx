import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bear } from './components/Bear'
import type { BearState } from './components/Bear'
import { CopyButton } from './components/CopyButton'
import { GeneratorSettings } from './components/GeneratorSettings'
import { GeneratorTypeSelector } from './components/GeneratorTypeSelector'
import { AdvancedSettings } from './components/AdvancedSettings'
import { PasswordDisplay } from './components/PasswordDisplay'
import { StrengthIndicator } from './components/StrengthIndicator'
import { InfoDialog } from './components/InfoDialog'
import { AmbientBackground } from './components/AmbientBackground'
import { Confetti } from './components/Confetti'
import {
  ContactContent,
  PrivacyContent,
  TermsContent,
} from './content/legal'
import {
  DEFAULT_OPTIONS,
  GENERATOR_META,
  GENERATOR_TYPES,
  generatePassword,
} from './generators'
import {
  DEFAULT_ADVANCED,
  applyAdvanced,
  isAdvancedActive,
} from './generators/advanced'
import type {
  AdvancedOptions,
  GeneratedPassword,
  GeneratorOptionsMap,
  GeneratorType,
} from './types/generator'
import { classifyStrength, estimateTextEntropy } from './utils/entropy'
import {
  clearPreferences,
  loadPreferences,
  savePreferences,
  sanitizeLike,
} from './utils/preferences'

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
} as const

/** Merge stored preferences over the current defaults, tolerating drift from older saved shapes. */
function resolveInitialState(stored: ReturnType<typeof loadPreferences>) {
  const type: GeneratorType =
    stored && GENERATOR_TYPES.includes(stored.type) ? stored.type : 'friendly'
  const optionsMap: GeneratorOptionsMap = {
    friendly: sanitizeLike(DEFAULT_OPTIONS.friendly, stored?.optionsMap?.friendly),
    memorable: sanitizeLike(DEFAULT_OPTIONS.memorable, stored?.optionsMap?.memorable),
    passphrase: sanitizeLike(DEFAULT_OPTIONS.passphrase, stored?.optionsMap?.passphrase),
    random: sanitizeLike(DEFAULT_OPTIONS.random, stored?.optionsMap?.random),
    pin: sanitizeLike(DEFAULT_OPTIONS.pin, stored?.optionsMap?.pin),
  }
  const advanced = sanitizeLike(DEFAULT_ADVANCED, stored?.advanced)
  return { type, optionsMap, advanced }
}

function App() {
  const initial = useMemo(() => resolveInitialState(loadPreferences()), [])
  const [type, setType] = useState<GeneratorType>(initial.type)
  const [optionsMap, setOptionsMap] = useState<GeneratorOptionsMap>(
    initial.optionsMap,
  )
  const [base, setBase] = useState<GeneratedPassword>(() =>
    generatePassword(initial.type, initial.optionsMap[initial.type]),
  )
  const [advanced, setAdvanced] = useState<AdvancedOptions>(initial.advanced)
  const [remember, setRemember] = useState(() => loadPreferences() !== null)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState('')
  const [bearState, setBearState] = useState<BearState>('idle')
  const [status, setStatus] = useState('')
  const [spin, setSpin] = useState(0)
  const [confetti, setConfetti] = useState(0)
  const [dialog, setDialog] = useState<'privacy' | 'terms' | 'contact' | null>(
    null,
  )

  const bearTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Derive the shown password: edit mode wins, otherwise apply advanced tweaks.
  const advancedActive = isAdvancedActive(advanced)
  const result = useMemo<GeneratedPassword>(() => {
    if (editing) {
      return { value: editText, entropyBits: estimateTextEntropy(editText) }
    }
    return applyAdvanced(base, advanced)
  }, [editing, editText, base, advanced])
  const strength = classifyStrength(result.entropyBits)
  const estimated = editing
  const customized = editing || advancedActive

  const clearBearTimer = () => {
    if (bearTimer.current) clearTimeout(bearTimer.current)
  }

  useEffect(() => clearBearTimer, [])

  // While enabled, keep the saved preferences in sync with live changes.
  // Only configuration is persisted here — never a generated password.
  useEffect(() => {
    if (remember) savePreferences({ type, optionsMap, advanced })
  }, [remember, type, optionsMap, advanced])

  const toggleRemember = () => {
    setRemember((prev) => {
      const next = !prev
      if (next) savePreferences({ type, optionsMap, advanced })
      else clearPreferences()
      return next
    })
  }

  const settleBear = useCallback((entropyBits: number) => {
    const label = classifyStrength(entropyBits).label
    clearBearTimer()
    setBearState('generating')
    bearTimer.current = setTimeout(() => {
      if (label === 'Weak') setBearState('weak')
      else if (label === 'Excellent' || label === 'Strong')
        setBearState('strong')
      else setBearState('success')
      bearTimer.current = setTimeout(() => setBearState('idle'), 1600)
    }, 450)
  }, [])

  const regenerate = useCallback(
    <T extends GeneratorType>(
      currentType: T,
      options: GeneratorOptionsMap[T],
      animate: boolean,
    ) => {
      const next = generatePassword(currentType, options)
      setBase(next)
      const label = classifyStrength(next.entropyBits).label
      // Status text intentionally never includes the password itself.
      setStatus(
        `New ${label.toLowerCase()} ${GENERATOR_META[
          currentType
        ].short.toLowerCase()} password generated.`,
      )
      if (animate) {
        settleBear(next.entropyBits)
        if (label === 'Excellent' || label === 'Strong') {
          setConfetti((c) => c + 1)
        }
      }
    },
    [settleBear],
  )

  const handleGenerate = () => {
    setEditing(false)
    setSpin((s) => s + 1)
    regenerate(type, optionsMap[type], true)
  }

  const handleTypeChange = (nextType: GeneratorType) => {
    setEditing(false)
    setType(nextType)
    regenerate(nextType, optionsMap[nextType], false)
  }

  const handlePatch = (patch: Partial<GeneratorOptionsMap[GeneratorType]>) => {
    const nextOptions = { ...optionsMap[type], ...patch }
    setOptionsMap((prev) => ({ ...prev, [type]: nextOptions }))
    regenerate(type, nextOptions, false)
  }

  const handleAdvancedPatch = (patch: Partial<AdvancedOptions>) => {
    setAdvanced((prev) => ({ ...prev, ...patch }))
  }

  const toggleEdit = () => {
    if (editing) {
      setEditing(false)
    } else {
      setEditText(result.value) // seed the editor with the current password
      setEditing(true)
    }
  }

  const handleCopied = () => {
    setConfetti((c) => c + 1)
    clearBearTimer()
    setBearState('copied')
    bearTimer.current = setTimeout(() => setBearState('idle'), 1400)
  }

  const colorize = type !== 'passphrase'

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col px-4 py-8 sm:px-6 sm:py-12">
      <AmbientBackground />
      <Confetti fireKey={confetti} />
      <motion.header
        className="flex flex-col items-center text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Bear state={bearState} size={104} />
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
        >
          Pass<span className="text-honey-500">Bear</span>
          <span className="sr-only"> — Friendly Password Generator</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-1 text-pretty text-base font-medium sm:text-lg"
        >
          <span className="text-orange-500">Friendly passwords.</span>{' '}
          <span className="text-teal-700">Serious security,</span>{' '}
          <span className="text-honey-700">created locally.</span>
        </motion.p>
      </motion.header>

      <motion.main
        className="mt-8 flex flex-1 flex-col gap-6"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
        }}
      >
        <motion.section
          aria-label="Generated password"
          className="flex flex-col gap-3"
          variants={sectionVariants}
        >
          <PasswordDisplay
            value={editing ? editText : result.value}
            colorize={colorize}
            editable={editing}
            onChange={setEditText}
          />
          <div className="flex gap-3">
            <CopyButton
              value={result.value}
              onCopied={handleCopied}
              className="flex-1"
            />
            <motion.button
              type="button"
              onClick={handleGenerate}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-[1.4] cursor-pointer items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
            >
              <motion.svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                animate={{ rotate: spin * 360 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              >
                <path
                  d="M21 12a9 9 0 11-2.64-6.36M21 4v5h-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
              Generate
            </motion.button>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={toggleEdit}
              aria-pressed={editing}
              className="text-sm font-medium text-slate-500 underline underline-offset-2 transition hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 cursor-pointer"
            >
              {editing ? 'Done editing' : 'Edit password'}
            </button>
            <button
              type="button"
              onClick={toggleRemember}
              aria-pressed={remember}
              className={
                'cursor-pointer text-sm font-medium underline underline-offset-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ' +
                (remember
                  ? 'text-teal-700 hover:text-teal-800'
                  : 'text-slate-500 hover:text-teal-700')
              }
            >
              {remember ? 'Settings remembered' : 'Remember my settings'}
            </button>
          </div>
          <StrengthIndicator strength={strength} estimated={estimated} />
          <AnimatePresence>
            {customized && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0">
                  <path d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.7 3.9a2 2 0 00-3.4 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>
                  {editing
                    ? 'This password was edited. Strength is only an estimate and is no longer a guaranteed random password.'
                    : 'Fixed characters you added are known and contribute no randomness — the strength shown reflects the random core only.'}
                </span>
              </motion.p>
            )}
          </AnimatePresence>
        </motion.section>

        <motion.section
          aria-label="Password type"
          className="flex flex-col gap-3"
          variants={sectionVariants}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Password type
          </h2>
          <GeneratorTypeSelector value={type} onChange={handleTypeChange} />
          <p className="text-sm text-slate-500">
            {GENERATOR_META[type].description}
          </p>
        </motion.section>

        <motion.section aria-label="Settings" variants={sectionVariants}>
          <AnimatePresence mode="wait">
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
            >
              <GeneratorSettings
                type={type}
                options={optionsMap[type]}
                onPatch={handlePatch}
              />
            </motion.div>
          </AnimatePresence>
          <div className="mt-3">
            <AdvancedSettings
              options={advanced}
              onChange={handleAdvancedPatch}
              maxIndex={base.value.length}
            />
          </div>
        </motion.section>
      </motion.main>

      <footer className="mt-10 flex flex-col items-center gap-1 text-center">
        <p className="flex items-center gap-1.5 text-sm font-medium text-teal-800">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          Generated locally in your browser. Your passwords never leave your
          device.
        </p>
        <p className="text-xs text-slate-400">
          Entropy is an estimate of guessing resistance, not a guarantee of
          security.
        </p>
        <nav aria-label="Legal and contact" className="mt-3">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm">
            <li>
              <button
                type="button"
                onClick={() => setDialog('privacy')}
                className="cursor-pointer text-slate-500 underline underline-offset-2 transition hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                Privacy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setDialog('terms')}
                className="cursor-pointer text-slate-500 underline underline-offset-2 transition hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                Terms &amp; Conditions
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setDialog('contact')}
                className="cursor-pointer text-slate-500 underline underline-offset-2 transition hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
              >
                Contact
              </button>
            </li>
          </ul>
        </nav>
      </footer>

      <InfoDialog
        open={dialog === 'privacy'}
        title="Privacy Policy"
        onClose={() => setDialog(null)}
      >
        <PrivacyContent />
      </InfoDialog>
      <InfoDialog
        open={dialog === 'terms'}
        title="Terms & Conditions"
        onClose={() => setDialog(null)}
      >
        <TermsContent />
      </InfoDialog>
      <InfoDialog
        open={dialog === 'contact'}
        title="Contact"
        onClose={() => setDialog(null)}
      >
        <ContactContent />
      </InfoDialog>

      {/* Screen-reader status; never contains the password value. */}
      <div className="sr-only" role="status" aria-live="polite">
        {status}
      </div>
    </div>
  )
}

export default App
