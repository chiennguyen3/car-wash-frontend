import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Clock3, SprayCan } from 'lucide-react'
import { fetchWashServices, createWashService } from '../api/services'
import type { WashService, VehicleType, ServicePriceItem } from '../types'
import { VEHICLE_TYPE_LABEL } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import { PageHeader, ErrorBanner, EmptyState, LoadingBlock } from '../components/ui/Misc'
import { inputClass } from '../components/ui/styles'

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
      <PageHeader title="Danh mục dịch vụ" />

      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-4">
            <Field label="Tên dịch vụ" className="min-w-[220px] flex-1">
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label="Thời gian ước lượng (phút)" className="min-w-[180px]">
              <input
                type="number"
                min={1}
                className={inputClass}
                value={estTimeMinutes}
                onChange={(e) => setEstTimeMinutes(e.target.value)}
                required
              />
            </Field>
          </div>
          <Field label="Mô tả">
            <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>

          <div>
            <p className="mb-2 text-xs font-medium text-ink-muted">Giá theo loại xe (bỏ trống nếu không áp dụng):</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {VEHICLE_TYPE_OPTIONS.map((t) => (
                <Field key={t} label={VEHICLE_TYPE_LABEL[t]}>
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={prices[t]}
                    onChange={(e) => setPrices((p) => ({ ...p, [t]: e.target.value }))}
                    placeholder="VD: 50000"
                  />
                </Field>
              ))}
            </div>
          </div>

          {error && <ErrorBanner>{error}</ErrorBanner>}
          <Button type="submit" variant="primary" loading={submitting} className="self-start">
            <Plus className="h-4 w-4" />
            {submitting ? 'Đang tạo...' : 'Thêm dịch vụ'}
          </Button>
        </form>
      </Card>

      {loading ? (
        <LoadingBlock />
      ) : services.length === 0 ? (
        <EmptyState>Chưa có dịch vụ nào.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Card key={s.id} className="flex flex-col">
              <div className="mb-2 flex items-start gap-2.5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-suds-50 text-suds-600">
                  <SprayCan className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h4 className="font-display text-sm font-semibold text-ink">{s.name}</h4>
                  {s.description && <p className="mt-0.5 text-xs text-ink-muted">{s.description}</p>}
                </div>
              </div>
              <p className="mb-3 flex items-center gap-1.5 text-xs text-ink-faint">
                <Clock3 className="h-3.5 w-3.5" />
                Thời gian ước lượng: {s.estTimeMinutes} phút
              </p>
              <ul className="mt-auto space-y-1 border-t border-border pt-3 text-sm">
                {s.prices.map((p) => (
                  <li key={p.vehicleType} className="flex items-center justify-between">
                    <span className="text-ink-muted">{VEHICLE_TYPE_LABEL[p.vehicleType]}</span>
                    <span className="tabular font-semibold text-ink">{p.price.toLocaleString('vi-VN')}đ</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
