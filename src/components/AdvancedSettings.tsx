import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { AdvancedOptions } from '../types/generator'

interface AdvancedSettingsProps {
  options: AdvancedOptions
  onChange: (patch: Partial<AdvancedOptions>) => void
  /** Length of the random core, used to bound the fixed-character position. */
  maxIndex: number
}

const inputClass =
  'w-full rounded-lg border border-honey-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500'

/**
 * Optional, collapsed-by-default "More configuration" panel. Adds fixed prefix/
 * suffix and a fixed character at a position. These are known characters, so
 * they add no entropy — the panel says so plainly.
 */
export function AdvancedSettings({
  options,
  onChange,
  maxIndex,
}: AdvancedSettingsProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const prefixId = useId()
  const suffixId = useId()
  const charId = useId()
  const posId = useId()

  return (
    <div className="rounded-xl border border-honey-200 bg-honey-50/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
      >
        Advanced settings
        <motion.svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-4 px-4 pb-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={prefixId}
                  className="mb-1 block text-sm font-medium text-slate-600"
                >
                  Starts with
                </label>
                <input
                  id={prefixId}
                  type="text"
                  value={options.prefix}
                  maxLength={8}
                  placeholder="e.g. My"
                  onChange={(e) => onChange({ prefix: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor={suffixId}
                  className="mb-1 block text-sm font-medium text-slate-600"
                >
                  Ends with
                </label>
                <input
                  id={suffixId}
                  type="text"
                  value={options.suffix}
                  maxLength={8}
                  placeholder="e.g. !"
                  onChange={(e) => onChange({ suffix: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">
                    Insert a fixed character
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={options.fixedEnabled}
                    aria-label="Insert a fixed character"
                    onClick={() => onChange({ fixedEnabled: !options.fixedEnabled })}
                    className={
                      'relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ' +
                      (options.fixedEnabled ? 'bg-teal-500' : 'bg-slate-300')
                    }
                  >
                    <span
                      className={
                        'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ' +
                        (options.fixedEnabled ? 'left-[22px]' : 'left-0.5')
                      }
                    />
                  </button>
                </label>

                {options.fixedEnabled && (
                  <div className="mt-3 flex gap-3">
                    <div className="w-24">
                      <label
                        htmlFor={charId}
                        className="mb-1 block text-xs font-medium text-slate-500"
                      >
                        Character
                      </label>
                      <input
                        id={charId}
                        type="text"
                        maxLength={1}
                        value={options.fixedChar}
                        placeholder="#"
                        onChange={(e) => onChange({ fixedChar: e.target.value })}
                        className={inputClass + ' text-center font-mono'}
                      />
                    </div>
                    <div className="flex-1">
                      <label
                        htmlFor={posId}
                        className="mb-1 block text-xs font-medium text-slate-500"
                      >
                        At position (0–{maxIndex})
                      </label>
                      <input
                        id={posId}
                        type="number"
                        min={0}
                        max={maxIndex}
                        value={options.fixedIndex}
                        onChange={(e) =>
                          onChange({ fixedIndex: Number(e.target.value) })
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
