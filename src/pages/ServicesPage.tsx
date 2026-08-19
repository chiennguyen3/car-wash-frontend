import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Clock3, SprayCan, Pencil, Trash2 } from 'lucide-react'
import { fetchWashServices, createWashService, updateWashService, deleteWashService } from '../api/services'
import { ApiError } from '../api/client'
import type { WashService, VehicleType, ServicePriceItem } from '../types'
import { VEHICLE_TYPE_LABEL } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { PageHeader, ErrorBanner, EmptyState, LoadingBlock } from '../components/ui/Misc'
import { inputClass } from '../components/ui/styles'

const VEHICLE_TYPE_OPTIONS: VehicleType[] = ['MOTORBIKE', 'CAR_4_SEATS', 'CAR_7_SEATS', 'TRUCK']

type PriceForm = Record<VehicleType, string>

const emptyPrices: PriceForm = { MOTORBIKE: '', CAR_4_SEATS: '', CAR_7_SEATS: '', TRUCK: '' }

function pricesToForm(prices: ServicePriceItem[]): PriceForm {
  const form: PriceForm = { ...emptyPrices }
  for (const p of prices) form[p.vehicleType] = String(p.price)
  return form
}

function formToPrices(form: PriceForm): ServicePriceItem[] {
  return VEHICLE_TYPE_OPTIONS.filter((t) => form[t].trim() !== '').map((t) => ({
    vehicleType: t,
    price: Number(form[t]),
  }))
}

export default function ServicesPage() {
  const [services, setServices] = useState<WashService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [estTimeMinutes, setEstTimeMinutes] = useState('30')
  const [prices, setPrices] = useState<PriceForm>(emptyPrices)
  const [submitting, setSubmitting] = useState(false)

  const [editing, setEditing] = useState<WashService | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editEstTime, setEditEstTime] = useState('30')
  const [editPrices, setEditPrices] = useState<PriceForm>(emptyPrices)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  const [deleting, setDeleting] = useState<WashService | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deletingBusy, setDeletingBusy] = useState(false)

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

    const priceList = formToPrices(prices)
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
      setPrices(emptyPrices)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo dịch vụ thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  function openEdit(s: WashService) {
    setEditing(s)
    setEditName(s.name)
    setEditDescription(s.description ?? '')
    setEditEstTime(String(s.estTimeMinutes))
    setEditPrices(pricesToForm(s.prices))
    setEditError(null)
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    setEditError(null)

    const priceList = formToPrices(editPrices)
    if (priceList.length === 0) {
      setEditError('Phải nhập giá cho ít nhất 1 loại xe')
      return
    }

    setSavingEdit(true)
    try {
      await updateWashService(editing.id, {
        name: editName,
        description: editDescription || undefined,
        estTimeMinutes: Number(editEstTime),
        prices: priceList,
      })
      setEditing(null)
      load()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Cập nhật dịch vụ thất bại')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setDeleteError(null)
    setDeletingBusy(true)
    try {
      await deleteWashService(deleting.id)
      setDeleting(null)
      load()
    } catch (err) {
      // 409: dịch vụ đã được dùng trong đơn hàng trước đó - hiện lỗi ngay trong dialog xóa.
      setDeleteError(err instanceof ApiError ? err.message : 'Xóa dịch vụ thất bại')
    } finally {
      setDeletingBusy(false)
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
                <div className="min-w-0 flex-1">
                  <h4 className="font-display text-sm font-semibold text-ink">{s.name}</h4>
                  {s.description && <p className="mt-0.5 text-xs text-ink-muted">{s.description}</p>}
                </div>
              </div>
              <p className="mb-3 flex items-center gap-1.5 text-xs text-ink-faint">
                <Clock3 className="h-3.5 w-3.5" />
                Thời gian ước lượng: {s.estTimeMinutes} phút
              </p>
              <ul className="mb-3 space-y-1 border-t border-border pt-3 text-sm">
                {s.prices.map((p) => (
                  <li key={p.vehicleType} className="flex items-center justify-between">
                    <span className="text-ink-muted">{VEHICLE_TYPE_LABEL[p.vehicleType]}</span>
                    <span className="tabular font-semibold text-ink">{p.price.toLocaleString('vi-VN')}đ</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex gap-2 border-t border-border pt-3">
                <Button size="sm" variant="secondary" onClick={() => openEdit(s)} className="flex-1">
                  <Pencil className="h-3.5 w-3.5" />
                  Sửa
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-danger hover:bg-danger-bg"
                  onClick={() => {
                    setDeleting(s)
                    setDeleteError(null)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Xóa
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <Modal title="Sửa dịch vụ" onClose={() => setEditing(null)} size="lg">
          <form onSubmit={handleSaveEdit} className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              <Field label="Tên dịch vụ" className="min-w-[220px] flex-1">
                <input className={inputClass} value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </Field>
              <Field label="Thời gian ước lượng (phút)" className="min-w-[180px]">
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={editEstTime}
                  onChange={(e) => setEditEstTime(e.target.value)}
                  required
                />
              </Field>
            </div>
            <Field label="Mô tả">
              <input className={inputClass} value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </Field>

            <div>
              <p className="mb-2 text-xs font-medium text-ink-muted">Giá theo loại xe (bỏ trống nếu không áp dụng):</p>
              <div className="grid grid-cols-2 gap-3">
                {VEHICLE_TYPE_OPTIONS.map((t) => (
                  <Field key={t} label={VEHICLE_TYPE_LABEL[t]}>
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      value={editPrices[t]}
                      onChange={(e) => setEditPrices((p) => ({ ...p, [t]: e.target.value }))}
                      placeholder="VD: 50000"
                    />
                  </Field>
                ))}
              </div>
            </div>

            {editError && <ErrorBanner>{editError}</ErrorBanner>}
            <div className="flex gap-2">
              <Button type="submit" variant="primary" loading={savingEdit} className="flex-1">
                Lưu thay đổi
              </Button>
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
                Huỷ
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Xóa dịch vụ?"
          description={`Bạn sắp xóa dịch vụ "${deleting.name}". Hành động này không thể hoàn tác.`}
          loading={deletingBusy}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => setDeleting(null)}
        />
      )}
    </section>
  )
}
