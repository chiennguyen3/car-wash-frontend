import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  title,
  onClose,
  children,
  size = 'sm',
}: {
  title: string
  onClose: () => void
  children: ReactNode
  size?: 'sm' | 'lg'
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className={`scrollbar-thin max-h-[85vh] w-full ${size === 'lg' ? 'max-w-lg' : 'max-w-sm'} overflow-y-auto rounded-2xl bg-surface p-6 shadow-[var(--shadow-popover)]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-ink-faint transition hover:bg-surface-sunken hover:text-ink"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
