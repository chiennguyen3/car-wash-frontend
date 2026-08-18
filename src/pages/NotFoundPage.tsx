import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-surface px-6 py-20 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-sunken text-ink-faint">
        <Compass className="h-6 w-6" />
      </span>
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">404</h1>
        <p className="mt-1 text-sm text-ink-muted">Trang bạn tìm không tồn tại.</p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-lg bg-suds-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-suds-700"
      >
        Về trang chủ
      </Link>
    </div>
  )
}
