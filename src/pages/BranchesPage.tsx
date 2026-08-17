import { useEffect, useState, type FormEvent } from 'react'
import { fetchBranches, createBranch, updateBranchStatus } from '../api/branches'
import type { Branch } from '../types'

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function load() {
    setLoading(true)
    fetchBranches()
      .then(setBranches)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await createBranch({ name, address: address || undefined, phone: phone || undefined })
      setName('')
      setAddress('')
      setPhone('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo chi nhánh thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleStatus(branch: Branch) {
    const newStatus = branch.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    try {
      await updateBranchStatus(branch.id, newStatus)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại')
    }
  }

  return (
    <section>
      <h2>Quản lý chi nhánh</h2>

      <form onSubmit={handleSubmit} className="form form-inline">
        <label>
          Tên chi nhánh
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Địa chỉ
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <label>
          Điện thoại
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Đang tạo...' : 'Thêm chi nhánh'}
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
              <th>Tên</th>
              <th>Địa chỉ</th>
              <th>Điện thoại</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.id}>
                <td>{b.id}</td>
                <td>{b.name}</td>
                <td>{b.address}</td>
                <td>{b.phone}</td>
                <td>
                  <span className={`badge ${b.status === 'ACTIVE' ? 'badge-success' : 'badge-muted'}`}>
                    {b.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động'}
                  </span>
                </td>
                <td>
                  <button type="button" onClick={() => handleToggleStatus(b)}>
                    {b.status === 'ACTIVE' ? 'Ngừng hoạt động' : 'Kích hoạt lại'}
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