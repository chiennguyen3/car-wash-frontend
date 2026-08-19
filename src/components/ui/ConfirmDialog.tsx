import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'
import { ErrorBanner } from './Misc'

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Xóa',
  loading = false,
  error,
  onConfirm,
  onClose,
}: {
  title: string
  description: string
  confirmLabel?: string
  loading?: boolean
  error?: string | null
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="mb-4 flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-bg text-danger">
          <AlertTriangle className="h-4.5 w-4.5" />
        </span>
        <p className="text-sm text-ink-muted">{description}</p>
      </div>
      {error && <ErrorBanner>{error}</ErrorBanner>}
      <div className="flex gap-2">
        <Button variant="danger" loading={loading} onClick={onConfirm} className="flex-1">
          {confirmLabel}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Huỷ
        </Button>
      </div>
    </Modal>
  )
}
