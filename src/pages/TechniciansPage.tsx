import { useEffect, useState, type FormEvent } from 'react'
import { fetchTechnicians, createTechnician, setTechnicianShift, setTechnicianOffDuty } from '../api/technicians'
import type { Technician } from '../types'

// Format datetime-local input value -> "2026-08-17T08:00" thành ISO cho BE.
function toIsoDateTime(localValue: string) {
  return localValue ? `${localValue}:00` : ''
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [submittingCreate, setSubmittingCreate] = useState(false)

  const [shiftForm, setShiftForm] = useState<{ id: number; start: string; end: string } | null>(null)
  const [submittingShift, setSubmittingShift] = useState(false)

  function load() {
    setLoading(true)
    fetchTechnicians()
      .then(setTechnicians)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmittingCreate(true)
    try {
      await createTechnician({ name })
      setName('')
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo thợ thất bại')
    } finally {
      setSubmittingCreate(false)
    }
  }

  async function handleSetShift(e: FormEvent) {
    e.preventDefault()
    if (!shiftForm) return
    setError(null)
    setSubmittingShift(true)
    try {
      await setTechnicianShift(shiftForm.id, {
        shiftStart: toIsoDateTime(shiftForm.start),
        shiftEnd: toIsoDateTime(shiftForm.end),
      })
      setShiftForm(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đặt ca làm thất bại')
    } finally {
      setSubmittingShift(false)
    }
  }

  async function handleOffDuty(id: number) {
    try {
      await setTechnicianOffDuty(id)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật thất bại')
    }
  }

  return (
    <section>
      <h2>Thợ sửa xe</h2>

      <form onSubmit={handleCreate} className="form form-inline">
        <label>
          Tên thợ
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <button type="submit" className="btn-primary" disabled={submittingCreate}>
          {submittingCreate ? 'Đang tạo...' : 'Thêm thợ'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="loading">Đang tải...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Ca làm hôm nay</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {technicians.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>
                  {t.shiftStart && t.shiftEnd
                    ? `${new Date(t.shiftStart).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(t.shiftEnd).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                    : '—'}
                </td>
                <td>
                  <span className={`badge ${t.status === 'ON_DUTY' ? 'badge-success' : 'badge-muted'}`}>
                    {t.status === 'ON_DUTY' ? 'Đang làm việc' : 'Ngoài ca'}
                  </span>
                </td>
                <td className="actions">
                  <button
                    type="button"
                    onClick={() =>
                      setShiftForm({
                        id: t.id,
                        start: t.shiftStart ? t.shiftStart.slice(0, 16) : '',
                        end: t.shiftEnd ? t.shiftEnd.slice(0, 16) : '',
                      })
                    }
                  >
                    Đặt ca làm
                  </button>
                  {t.status === 'ON_DUTY' && (
                    <button type="button" onClick={() => handleOffDuty(t.id)}>
                      Kết thúc ca
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {technicians.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">Chưa có thợ nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {shiftForm && (
        <div className="modal-overlay" onClick={() => setShiftForm(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Đặt ca làm việc</h3>
            <form onSubmit={handleSetShift} className="form">
              <label>
                Giờ bắt đầu
                <input
                  type="datetime-local"
                  value={shiftForm.start}
                  onChange={(e) => setShiftForm({ ...shiftForm, start: e.target.value })}
                  required
                />
              </label>
              <label>
                Giờ kết thúc
                <input
                  type="datetime-local"
                  value={shiftForm.end}
                  onChange={(e) => setShiftForm({ ...shiftForm, end: e.target.value })}
                  required
                />
              </label>
              <div className="form-row">
                <button type="submit" className="btn-primary" disabled={submittingShift}>
                  {submittingShift ? 'Đang lưu...' : 'Lưu'}
                </button>
                <button type="button" onClick={() => setShiftForm(null)}>Huỷ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}