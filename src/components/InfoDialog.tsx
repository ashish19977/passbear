import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface InfoDialogProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * Accessible modal built on the native <dialog> element, which provides focus
 * management, Escape-to-close and an inert backdrop for free.
 */
export function InfoDialog({ open, title, onClose, children }: InfoDialogProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = `dialog-title-${title.replace(/\s+/g, '-').toLowerCase()}`

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    else if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // Close when the backdrop (the dialog element itself) is clicked.
        if (e.target === ref.current) onClose()
      }}
      className="m-auto w-[min(92vw,42rem)] rounded-2xl border border-honey-200 p-0 shadow-xl backdrop:bg-slate-900/40"
    >
      <div className="flex items-center justify-between border-b border-honey-100 px-6 py-4">
        <h2 id={titleId} className="text-lg font-semibold text-slate-900">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-honey-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="max-h-[70vh] space-y-3 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-slate-600">
        {children}
      </div>
    </dialog>
  )
}
