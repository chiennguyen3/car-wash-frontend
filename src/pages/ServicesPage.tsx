import { useEffect, useState, type FormEvent } from 'react'
import { fetchWashServices, createWashService } from '../api/services'
import type { WashService, VehicleType, ServicePriceItem } from '../types'
import { VEHICLE_TYPE_LABEL } from '../types'

const VEHICLE_TYPE_OPTIONS: VehicleType[] = ['MOTORBIKE', 'CAR_4_SEATS', 'CAR_7_SEATS', 'TRUCK']

export default function ServicesPage() {
  const [services, setServices] = useState<WashService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [estTimeMinutes, setEstTimeMinutes] = useState('30')
  // Giá theo từng loại xe - để trống nghĩa là không bán loại xe đó.
  const [prices, setPrices] = useState<Record<VehicleType, string>>({
    MOTORBIKE: '',
    CAR_4_SEATS: '',
    CAR_7_SEATS: '',
    TRUCK: '',
  })
  const [submitting, setSubmitting] = useState(false)

  function load() {
    setLoading(true)
    fetchWashServices()
      .then(setServices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const priceList: ServicePriceItem[] = VEHICLE_TYPE_OPTIONS.filter((t) => prices[t].trim() !== '').map(
      (t) => ({ vehicleType: t, price: Number(prices[t]) })
    )

    if (priceList.length === 0) {
      setError('Phải nhập giá cho ít nhất 1 loại xe')
      return
    }

    setSubmitting(true)
    try {
      await createWashService({
        name,
        description: description || undefined,
        estTimeMinutes: Number(estTimeMinutes),
        prices: priceList,
      })
      setName('')
      setDescription('')
      setEstTimeMinutes('30')
      setPrices({ MOTORBIKE: '', CAR_4_SEATS: '', CAR_7_SEATS: '', TRUCK: '' })
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo dịch vụ thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <h2>Danh mục dịch vụ</h2>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <label>
            Tên dịch vụ
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            Thời gian ước lượng (phút)
            <input
              type="number"
              min={1}
              value={estTimeMinutes}
              onChange={(e) => setEstTimeMinutes(e.target.value)}
              required
            />
          </label>
        </div>
        <label>
          Mô tả
          <input value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <p className="field-label">Giá theo loại xe (bỏ trống nếu không áp dụng):</p>
        <div className="price-grid">
          {VEHICLE_TYPE_OPTIONS.map((t) => (
            <label key={t}>
              {VEHICLE_TYPE_LABEL[t]}
              <input
                type="number"
                min={0}
                value={prices[t]}
                onChange={(e) => setPrices((p) => ({ ...p, [t]: e.target.value }))}
                placeholder="VD: 50000"
              />
            </label>
          ))}
        </div>

        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Đang tạo...' : 'Thêm dịch vụ'}
        </button>
      </form>

      {loading ? (
        <p className="loading">Đang tải...</p>
      ) : (
        <div className="card-grid">
          {services.map((s) => (
            <div key={s.id} className="info-card">
              <h4>{s.name}</h4>
              {s.description && <p className="muted">{s.description}</p>}
              <p className="muted">Thời gian ước lượng: {s.estTimeMinutes} phút</p>
              <ul className="price-list">
                {s.prices.map((p) => (
                  <li key={p.vehicleType}>
                    {VEHICLE_TYPE_LABEL[p.vehicleType]}: <strong>{p.price.toLocaleString('vi-VN')}đ</strong>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {services.length === 0 && <p className="muted">Chưa có dịch vụ nào.</p>}
        </div>
      )}
    </section>
  )
}