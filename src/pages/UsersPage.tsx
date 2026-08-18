import { useEffect, useState, type FormEvent } from 'react'
import { UserPlus } from 'lucide-react'
import { fetchUsers, createUser, updateUserStatus } from '../api/users'
import { fetchBranches } from '../api/branches'
import type { StaffUser, Branch, RoleName } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import Badge from '../components/ui/Badge'
import { PageHeader, ErrorBanner, EmptyState, LoadingBlock } from '../components/ui/Misc'
import { ACTIVE_STATUS_TONE } from '../components/ui/statusTone'
import { inputClass, selectClass, tableWrapClass, tableClass, thClass, tdClass, trHoverClass } from '../components/ui/styles'

const ROLE_OPTIONS: { value: RoleName; label: string }[] = [
  { value: 'TIEP_DON', label: 'Tiếp đón' },
  { value: 'THU_NGAN', label: 'Thu ngân' },
  { value: 'ADMIN_CO_SO', label: 'Admin cơ sở' },
  { value: 'ADMIN_TONG', label: 'Admin tổng' },
]

export default function UsersPage() {
  const [users, setUsers] = useState<StaffUser[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<RoleName>('TIEP_DON')
  const [branchId, setBranchId] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  function load() {
    setLoading(true)
    Promise.all([fetchUsers(), fetchBranches()])
      .then(([u, b]) => {
        setUsers(u)
        setBranches(b)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await createUser({
        name,
        email,
        password,
        role,
        // Admin Tổng không được gắn chi nhánh - BE sẽ báo lỗi nếu gửi kèm.
        branchId: role === 'ADMIN_TONG' ? null : Number(branchId),
      })
      setName('')
      setEmail('')
      setPassword('')
      setBranchId('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo tài khoản thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleStatus(user: StaffUser) {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await updateUserStatus(user.id, newStatus)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại')
    }
  }

  return (
    <section>
      <PageHeader title="Quản lý nhân viên" />

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
          <Field label="Họ tên" className="min-w-[160px] flex-1">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Email" className="min-w-[180px] flex-1">
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Mật khẩu" className="min-w-[160px]">
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </Field>
          <Field label="Vai trò" className="min-w-[160px]">
            <select className={selectClass} value={role} onChange={(e) => setRole(e.target.value as RoleName)}>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          {role !== 'ADMIN_TONG' && (
            <Field label="Chi nhánh" className="min-w-[180px]">
              <select className={selectClass} value={branchId} onChange={(e) => setBranchId(e.target.value)} required>
                <option value="">-- Chọn chi nhánh --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Button type="submit" variant="primary" loading={submitting}>
            <UserPlus className="h-4 w-4" />
            {submitting ? 'Đang tạo...' : 'Thêm nhân viên'}
          </Button>
        </form>
      </Card>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {loading ? (
        <LoadingBlock />
      ) : users.length === 0 ? (
        <EmptyState>Chưa có nhân viên nào.</EmptyState>
      ) : (
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>ID</th>
                <th className={thClass}>Họ tên</th>
                <th className={thClass}>Email</th>
                <th className={thClass}>Vai trò</th>
                <th className={thClass}>Chi nhánh</th>
                <th className={thClass}>Trạng thái</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={trHoverClass}>
                  <td className={`${tdClass} tabular text-ink-faint`}>{u.id}</td>
                  <td className={`${tdClass} font-medium`}>{u.name}</td>
                  <td className={tdClass}>{u.email}</td>
                  <td className={tdClass}>{ROLE_OPTIONS.find((r) => r.value === u.role)?.label}</td>
                  <td className={tdClass}>{u.branchName ?? '—'}</td>
                  <td className={tdClass}>
                    <Badge tone={ACTIVE_STATUS_TONE[u.status]}>
                      {u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khoá'}
                    </Badge>
                  </td>
                  <td className={tdClass}>
                    <Button size="sm" variant="secondary" onClick={() => handleToggleStatus(u)}>
                      {u.status === 'ACTIVE' ? 'Khoá' : 'Mở khoá'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
