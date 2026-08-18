import { Droplet } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ROLE_LABEL: Record<string, string> = {
  TIEP_DON: 'Tiếp đón',
  THU_NGAN: 'Thu ngân',
  ADMIN_CO_SO: 'Admin cơ sở',
  ADMIN_TONG: 'Admin tổng',
}

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <section>
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-8 shadow-[var(--shadow-card)] sm:flex-row sm:items-center">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-suds-50 text-suds-600">
          <Droplet className="h-6 w-6" fill="currentColor" />
        </span>
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Xin chào, {user?.email}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            Bạn đang đăng nhập với vai trò{' '}
            <span className="font-medium text-suds-700">{user ? ROLE_LABEL[user.role] : ''}</span>. Chọn 1 mục
            trên thanh điều hướng bên trái để bắt đầu.
          </p>
        </div>
      </div>
    </section>
  )
}
