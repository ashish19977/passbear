import type { ReactNode } from 'react'
import type {
  Capitalization,
  GeneratorOptionsMap,
  GeneratorType,
  Separator,
} from '../types/generator'

interface GeneratorSettingsProps {
  type: GeneratorType
  options: GeneratorOptionsMap[GeneratorType]
  onPatch: (patch: Partial<GeneratorOptionsMap[GeneratorType]>) => void
}

const SEPARATORS: { value: Separator; label: string }[] = [
  { value: '-', label: 'Dash' },
  { value: '.', label: 'Dot' },
  { value: '_', label: 'Under' },
  { value: ' ', label: 'Space' },
  { value: '', label: 'None' },
]

const CAPITALIZATIONS: { value: Capitalization; label: string }[] = [
  { value: 'lowercase', label: 'abc' },
  { value: 'capitalize', label: 'Abc' },
  { value: 'uppercase', label: 'ABC' },
]

export function GeneratorSettings({
  type,
  options,
  onPatch,
}: GeneratorSettingsProps) {
  switch (type) {
    case 'friendly': {
      const o = options as GeneratorOptionsMap['friendly']
      return (
        <Panel>
          <SliderField
            label="Words"
            value={o.words}
            min={2}
            max={6}
            onChange={(words) => onPatch({ words })}
          />
          <SliderField
            label="Minimum length"
            value={o.minLength}
            min={8}
            max={40}
            onChange={(minLength) => onPatch({ minLength })}
          />
          <SeparatorField
            value={o.separator}
            onChange={(separator) => onPatch({ separator })}
          />
          <CapitalizationField
            value={o.capitalization}
            onChange={(capitalization) => onPatch({ capitalization })}
          />
          <Toggle
            label="Numbers"
            checked={o.numbers}
            onChange={(numbers) => onPatch({ numbers })}
          />
          <Toggle
            label="Symbols"
            checked={o.symbols}
            onChange={(symbols) => onPatch({ symbols })}
          />
        </Panel>
      )
    }
    case 'memorable': {
      const o = options as GeneratorOptionsMap['memorable']
      return (
        <Panel>
          <SliderField
            label="Words"
            value={o.words}
            min={2}
            max={6}
            onChange={(words) => onPatch({ words })}
          />
          <SeparatorField
            value={o.separator}
            onChange={(separator) => onPatch({ separator })}
          />
          <CapitalizationField
            value={o.capitalization}
            onChange={(capitalization) => onPatch({ capitalization })}
          />
          <Toggle
            label="Numbers"
            checked={o.numbers}
            onChange={(numbers) => onPatch({ numbers })}
          />
          <Toggle
            label="Symbols"
            checked={o.symbols}
            onChange={(symbols) => onPatch({ symbols })}
          />
        </Panel>
      )
    }
    case 'passphrase': {
      const o = options as GeneratorOptionsMap['passphrase']
      return (
        <Panel>
          <SliderField
            label="Words"
            value={o.words}
            min={3}
            max={8}
            onChange={(words) => onPatch({ words })}
          />
          <SeparatorField
            value={o.separator}
            onChange={(separator) => onPatch({ separator })}
          />
          <CapitalizationField
            value={o.capitalization}
            onChange={(capitalization) => onPatch({ capitalization })}
          />
        </Panel>
      )
    }
    case 'random': {
      const o = options as GeneratorOptionsMap['random']
      return (
        <Panel>
          <SliderField
            label="Length"
            value={o.length}
            min={6}
            max={64}
            onChange={(length) => onPatch({ length })}
          />
          <Toggle
            label="Uppercase (A–Z)"
            checked={o.uppercase}
            onChange={(uppercase) => onPatch({ uppercase })}
          />
          <Toggle
            label="Lowercase (a–z)"
            checked={o.lowercase}
            onChange={(lowercase) => onPatch({ lowercase })}
          />
          <Toggle
            label="Numbers (0–9)"
            checked={o.numbers}
            onChange={(numbers) => onPatch({ numbers })}
          />
          <Toggle
            label="Symbols"
            checked={o.symbols}
            onChange={(symbols) => onPatch({ symbols })}
          />
        </Panel>
      )
    }
    case 'pin': {
      const o = options as GeneratorOptionsMap['pin']
      return (
        <Panel>
          <SliderField
            label="PIN length"
            value={o.length}
            min={3}
            max={12}
            onChange={(length) => onPatch({ length })}
          />
        </Panel>
      )
    }
    default:
      return null
  }
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  )
}

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}

function SliderField({ label, value, min, max, onChange }: SliderFieldProps) {
  const id = `slider-${label.replace(/\s+/g, '-').toLowerCase()}`
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="rounded-xl border border-honey-200 bg-white px-4 py-3 sm:col-span-2">
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-slate-600">
          {label}
        </label>
        <span className="rounded-md bg-honey-50 px-2.5 py-1 font-mono text-base font-semibold text-teal-700">
          {value}
        </span>
      </div>
      <div className="relative flex h-7 items-center has-[:focus-visible]:[&_.track]:ring-2 has-[:focus-visible]:[&_.track]:ring-teal-500 has-[:focus-visible]:[&_.track]:ring-offset-2">
        {/* Visible track + fill (the native track is transparent). */}
        <div className="track pointer-events-none absolute inset-x-0 h-3 rounded-full bg-honey-100" />
        <div
          className="pointer-events-none absolute left-0 h-3 rounded-full bg-teal-500"
          style={{ width: `${pct}%` }}
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={
            'relative h-7 w-full cursor-pointer appearance-none bg-transparent focus:outline-none ' +
            // WebKit / Blink
            '[&::-webkit-slider-runnable-track]:h-7 [&::-webkit-slider-runnable-track]:bg-transparent ' +
            '[&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[5px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform active:[&::-webkit-slider-thumb]:scale-110 ' +
            // Firefox
            '[&::-moz-range-track]:h-7 [&::-moz-range-track]:bg-transparent ' +
            '[&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[5px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-teal-500 [&::-moz-range-thumb]:shadow-md'
          }
        />
      </div>
    </div>
  )
}

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-honey-200 bg-white px-4 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={
          'relative h-6 w-11 shrink-0 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ' +
          (checked ? 'bg-teal-500' : 'bg-slate-300')
        }
      >
        <span
          className={
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ' +
            (checked ? 'left-[22px]' : 'left-0.5')
          }
        />
      </button>
    </label>
  )
}

interface SeparatorFieldProps {
  value: Separator
  onChange: (value: Separator) => void
}

function SeparatorField({ value, onChange }: SeparatorFieldProps) {
  return (
    <Segmented label="Separator">
      {SEPARATORS.map((s) => (
        <SegmentedButton
          key={s.label}
          active={value === s.value}
          onClick={() => onChange(s.value)}
        >
          {s.label}
        </SegmentedButton>
      ))}
    </Segmented>
  )
}

interface CapitalizationFieldProps {
  value: Capitalization
  onChange: (value: Capitalization) => void
}

function CapitalizationField({ value, onChange }: CapitalizationFieldProps) {
  return (
    <Segmented label="Capitalization">
      {CAPITALIZATIONS.map((c) => (
        <SegmentedButton
          key={c.value}
          active={value === c.value}
          onClick={() => onChange(c.value)}
        >
          {c.label}
        </SegmentedButton>
      ))}
    </Segmented>
  )
}

function Segmented({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-slate-600">
        {label}
      </span>
      <div
        role="group"
        aria-label={label}
        className="flex gap-1 rounded-xl border border-honey-200 bg-white p-1"
      >
        {children}
      </div>
    </div>
  )
}

function SegmentedButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        'flex-1 rounded-lg px-2 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 ' +
        (active
          ? 'bg-teal-500 text-white'
          : 'text-slate-600 hover:bg-honey-50')
      }
    >
      {children}
    </button>
  )
}
