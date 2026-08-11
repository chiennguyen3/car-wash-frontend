import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchServices } from '../api/services'
import { createBooking } from '../api/bookings'
import type { Service } from '../types'

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [services, setServices] = useState<Service[]>([])
  const [serviceId, setServiceId] = useState(searchParams.get('serviceId') ?? '')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchServices().then(setServices).catch(() => setError('Không tải được danh sách dịch vụ'))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!serviceId || !vehiclePlate || !scheduledAt) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    setSubmitting(true)
    try {
      await createBooking({
        serviceId: Number(serviceId),
        vehiclePlate,
        scheduledAt: new Date(scheduledAt).toISOString(),
        note: note || undefined,
      })
      navigate('/my-bookings')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đặt lịch thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="form-section">
      <h2>Đặt lịch rửa xe</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Dịch vụ
          <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} required>
            <option value="">-- Chọn dịch vụ --</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.price.toLocaleString('vi-VN')}đ)
              </option>
            ))}
          </select>
        </label>

        <label>
          Biển số xe
          <input
            type="text"
            value={vehiclePlate}
            onChange={(e) => setVehiclePlate(e.target.value)}
            placeholder="VD: 30A-123.45"
            required
          />
        </label>

        <label>
          Thời gian mong muốn
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            required
          />
        </label>

        <label>
          Ghi chú (tuỳ chọn)
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Đang gửi...' : 'Xác nhận đặt lịch'}
        </button>
      </form>
    </section>
  )
}
