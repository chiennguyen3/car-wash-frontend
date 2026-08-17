import { useEffect, useState, type FormEvent } from 'react'
import { fetchUsers, createUser, updateUserStatus } from '../api/users'
import { fetchBranches } from '../api/branches'
import type { StaffUser, Branch, RoleName } from '../types'

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
      <h2>Quản lý nhân viên</h2>

      <form onSubmit={handleSubmit} className="form form-inline">
        <label>
          Họ tên
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Mật khẩu
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>
        <label>
          Vai trò
          <select value={role} onChange={(e) => setRole(e.target.value as RoleName)}>
            {ROLE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>
        {role !== 'ADMIN_TONG' && (
          <label>
            Chi nhánh
            <select value={branchId} onChange={(e) => setBranchId(e.target.value)} required>
              <option value="">-- Chọn chi nhánh --</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
        )}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Đang tạo...' : 'Thêm nhân viên'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="loading">Đang tải...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Chi nhánh</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{ROLE_OPTIONS.find((r) => r.value === u.role)?.label}</td>
                <td>{u.branchName ?? '—'}</td>
                <td>
                  <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-muted'}`}>
                    {u.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khoá'}
                  </span>
                </td>
                <td>
                  <button type="button" onClick={() => handleToggleStatus(u)}>
                    {u.status === 'ACTIVE' ? 'Khoá' : 'Mở khoá'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}