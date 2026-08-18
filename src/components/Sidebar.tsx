import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Droplet,
  LayoutDashboard,
  Building2,
  Users,
  Contact,
  SprayCan,
  Wrench,
  ClipboardList,
  Receipt,
  Package,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ROLE_LABEL: Record<string, string> = {
  TIEP_DON: 'Tiếp đón',
  THU_NGAN: 'Thu ngân',
  ADMIN_CO_SO: 'Admin cơ sở',
  ADMIN_TONG: 'Admin tổng',
}

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (!user) return null

  const isAdminTong = user.role === 'ADMIN_TONG'
  const isAdminCoSo = user.role === 'ADMIN_CO_SO'
  const isTiepDon = user.role === 'TIEP_DON'
  const isThuNgan = user.role === 'THU_NGAN'

  const items: NavItem[] = [
    { to: '/', label: 'Tổng quan', icon: LayoutDashboard },
    ...(isAdminTong ? [{ to: '/branches', label: 'Chi nhánh', icon: Building2 }] : []),
    ...(isAdminTong ? [{ to: '/users', label: 'Nhân viên', icon: Users }] : []),
    ...(isAdminCoSo || isTiepDon ? [{ to: '/customers', label: 'Khách hàng', icon: Contact }] : []),
    ...(isAdminCoSo ? [{ to: '/services', label: 'Dịch vụ', icon: SprayCan }] : []),
    ...(isAdminCoSo || isTiepDon ? [{ to: '/technicians', label: 'Thợ sửa xe', icon: Wrench }] : []),
    ...(isAdminCoSo || isTiepDon ? [{ to: '/orders', label: 'Đơn hàng', icon: ClipboardList }] : []),
    ...(isAdminCoSo || isThuNgan ? [{ to: '/invoices', label: 'Hoá đơn', icon: Receipt }] : []),
    ...(isAdminCoSo || isTiepDon ? [{ to: '/inventory', label: 'Kho', icon: Package }] : []),
    ...(isAdminCoSo || isAdminTong ? [{ to: '/reports', label: 'Báo cáo', icon: BarChart3 }] : []),
  ]

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-suds-50 text-suds-700'
        : 'text-ink-muted hover:bg-surface-sunken hover:text-ink'
    }`

  const sidebarInner = (
    <>
      <div className="flex items-center gap-2 px-2 py-1">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-suds-600 text-white">
          <Droplet className="h-5 w-5" fill="currentColor" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold text-ink">Car Wash</p>
          <p className="text-[11px] text-ink-faint">Quản lý vận hành</p>
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-y-auto scrollbar-thin">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navLinkClass} onClick={() => setMobileOpen(false)}>
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 border-t border-border pt-4">
        <div className="mb-2 flex items-center gap-2 rounded-lg px-2 py-1.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-suds-100 text-xs font-semibold text-suds-700">
            {user.email.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-medium text-ink">{user.email}</p>
            <p className="text-[11px] text-ink-faint">{ROLE_LABEL[user.role]}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-danger-bg hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Top bar - hiện trên mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-suds-600 text-white">
            <Droplet className="h-4 w-4" fill="currentColor" />
          </span>
          <p className="font-display text-sm font-semibold text-ink">Car Wash</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 text-ink-muted hover:bg-surface-sunken"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Sidebar cố định - desktop */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-border bg-surface px-3 py-5 md:flex">
        {sidebarInner}
      </aside>

      {/* Drawer trượt - mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-surface px-3 py-5">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 rounded-md p-1.5 text-ink-faint hover:bg-surface-sunken"
              aria-label="Đóng menu"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarInner}
          </aside>
        </div>
      )}
    </>
  )
}
