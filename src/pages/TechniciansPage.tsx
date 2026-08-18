import { useEffect, useState, type FormEvent } from 'react'
import { Wrench, UserPlus, Clock } from 'lucide-react'
import { fetchTechnicians, createTechnician, setTechnicianShift, setTechnicianOffDuty } from '../api/technicians'
import type { Technician } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { PageHeader, ErrorBanner, EmptyState, LoadingBlock } from '../components/ui/Misc'
import { TECHNICIAN_STATUS_TONE } from '../components/ui/statusTone'
import { inputClass, tableWrapClass, tableClass, thClass, tdClass, trHoverClass } from '../components/ui/styles'

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
      <PageHeader title="Thợ sửa xe" />

      <Card className="mb-6">
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4">
          <Field label="Tên thợ" className="min-w-[220px] flex-1">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Button type="submit" variant="primary" loading={submittingCreate}>
            <UserPlus className="h-4 w-4" />
            {submittingCreate ? 'Đang tạo...' : 'Thêm thợ'}
          </Button>
        </form>
      </Card>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      {loading ? (
        <LoadingBlock />
      ) : technicians.length === 0 ? (
        <EmptyState>Chưa có thợ nào.</EmptyState>
      ) : (
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Tên</th>
                <th className={thClass}>Ca làm hôm nay</th>
                <th className={thClass}>Trạng thái</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {technicians.map((t) => (
                <tr key={t.id} className={trHoverClass}>
                  <td className={`${tdClass} font-medium`}>
                    <span className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-ink-faint" />
                      {t.name}
                    </span>
                  </td>
                  <td className={`${tdClass} tabular`}>
                    {t.shiftStart && t.shiftEnd
                      ? `${new Date(t.shiftStart).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${new Date(t.shiftEnd).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                      : '—'}
                  </td>
                  <td className={tdClass}>
                    <Badge tone={TECHNICIAN_STATUS_TONE[t.status]}>
                      {t.status === 'ON_DUTY' ? 'Đang làm việc' : 'Ngoài ca'}
                    </Badge>
                  </td>
                  <td className={tdClass}>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setShiftForm({
                            id: t.id,
                            start: t.shiftStart ? t.shiftStart.slice(0, 16) : '',
                            end: t.shiftEnd ? t.shiftEnd.slice(0, 16) : '',
                          })
                        }
                      >
                        <Clock className="h-3.5 w-3.5" />
                        Đặt ca làm
                      </Button>
                      {t.status === 'ON_DUTY' && (
                        <Button size="sm" variant="ghost" onClick={() => handleOffDuty(t.id)}>
                          Kết thúc ca
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {shiftForm && (
        <Modal title="Đặt ca làm việc" onClose={() => setShiftForm(null)}>
          <form onSubmit={handleSetShift} className="flex flex-col gap-4">
            <Field label="Giờ bắt đầu">
              <input
                type="datetime-local"
                className={inputClass}
                value={shiftForm.start}
                onChange={(e) => setShiftForm({ ...shiftForm, start: e.target.value })}
                required
              />
            </Field>
            <Field label="Giờ kết thúc">
              <input
                type="datetime-local"
                className={inputClass}
                value={shiftForm.end}
                onChange={(e) => setShiftForm({ ...shiftForm, end: e.target.value })}
                required
              />
            </Field>
            <div className="flex gap-2">
              <Button type="submit" variant="primary" loading={submittingShift} className="flex-1">
                {submittingShift ? 'Đang lưu...' : 'Lưu'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShiftForm(null)}>
                Huỷ
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  )
}
