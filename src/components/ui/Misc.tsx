import type { ReactNode } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      {action}
    </div>
  )
}

export function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-bg px-3.5 py-2.5 text-sm text-danger">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-surface-sunken/60 px-4 py-10 text-center text-sm text-ink-faint">
      {children}
    </p>
  )
}

export function LoadingBlock({ label = 'Đang tải...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-8 text-sm text-ink-muted">
      <Loader2 className="h-4 w-4 animate-spin text-suds-500" />
      {label}
    </div>
  )
}
