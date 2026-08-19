import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, ArrowRight, ClipboardList, UserPlus } from 'lucide-react'
import { fetchOrders, createOrder } from '../api/orders'
import { fetchCustomers } from '../api/customers'
import { fetchVehiclesByCustomer, createVehicle } from '../api/vehicles'
import { fetchWashServices } from '../api/services'
import type { Order, Customer, Vehicle, WashService, VehicleType } from '../types'
import { ORDER_STATUS_LABEL, VEHICLE_TYPE_LABEL } from '../types'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Combobox from '../components/ui/Combobox'
import { PageHeader, ErrorBanner, EmptyState, LoadingBlock } from '../components/ui/Misc'
import { ORDER_STATUS_TONE } from '../components/ui/statusTone'
import { inputClass, tableWrapClass, tableClass, thClass, tdClass, trHoverClass } from '../components/ui/styles'

const VEHICLE_TYPE_OPTIONS: { value: VehicleType; label: string }[] = (
  Object.keys(VEHICLE_TYPE_LABEL) as VehicleType[]
).map((v) => ({ value: v, label: VEHICLE_TYPE_LABEL[v] }))

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null)

  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)

  const [services, setServices] = useState<WashService[]>([])
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([])

  const [submitting, setSubmitting] = useState(false)

  // ===== Thêm xe mới ngay trong modal, không cần thoát ra trang Khách hàng =====
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [newLicensePlate, setNewLicensePlate] = useState('')
  const [newVehicleType, setNewVehicleType] = useState<VehicleType | null>(null)
  const [newBrand, setNewBrand] = useState('')
  const [newModelName, setNewModelName] = useState('')
  const [submittingVehicle, setSubmittingVehicle] = useState(false)

  function load() {
    setLoading(true)
    fetchOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreateForm() {
    setShowCreateForm(true)
    setError(null)
    fetchCustomers().then(setCustomers).catch((err) => setError(err.message))
    fetchWashServices().then(setServices).catch((err) => setError(err.message))
  }

  function handleSelectCustomer(customerId: number) {
    setSelectedCustomerId(customerId)
    setSelectedVehicleId(null)
    setShowAddVehicle(false)
    fetchVehiclesByCustomer(customerId).then(setVehicles).catch((err) => setError(err.message))
  }

  function resetAddVehicleForm() {
    setNewLicensePlate('')
    setNewVehicleType(null)
    setNewBrand('')
    setNewModelName('')
  }

  async function handleCreateVehicleInline(e: FormEvent) {
    e.preventDefault()
    if (!selectedCustomerId) return
    setError(null)

    if (!newLicensePlate.trim() || !newVehicleType) {
      setError('Vui lòng nhập biển số và chọn loại xe')
      return
    }

    setSubmittingVehicle(true)
    try {
      const created = await createVehicle({
        licensePlate: newLicensePlate.trim(),
        vehicleType: newVehicleType,
        brand: newBrand.trim() || undefined,
        modelName: newModelName.trim() || undefined,
        customerId: selectedCustomerId,
      })
      // Thêm ngay vào danh sách hiện có và tự động chọn luôn, không cần
      // gọi lại API - tiết kiệm 1 lượt round-trip cho quầy tiếp đón.
      setVehicles((prev) => [...prev, created])
      setSelectedVehicleId(created.id)
      setSelectedServiceIds([])
      setShowAddVehicle(false)
      resetAddVehicleForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thêm xe thất bại')
    } finally {
      setSubmittingVehicle(false)
    }
  }

  function toggleService(id: number) {
    setSelectedServiceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!selectedCustomerId || !selectedVehicleId || selectedServiceIds.length === 0) {
      setError('Vui lòng chọn đủ khách hàng, xe và ít nhất 1 dịch vụ')
      return
    }

    setSubmitting(true)
    try {
      await createOrder({
        customerId: selectedCustomerId,
        vehicleId: selectedVehicleId,
        serviceIds: selectedServiceIds,
      })
      resetForm()
      setShowCreateForm(false)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo đơn hàng thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setSelectedCustomerId(null)
    setSelectedVehicleId(null)
    setSelectedServiceIds([])
    setCustomerSearch('')
    setVehicles([])
    setShowAddVehicle(false)
    resetAddVehicleForm()
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.phoneNumber.includes(customerSearch.trim()) ||
      c.fullName.toLowerCase().includes(customerSearch.trim().toLowerCase())
  )

  // Chỉ hiện dịch vụ có giá cho đúng loại xe đã chọn - tránh chọn nhầm dịch vụ
  // BE sẽ báo lỗi ServicePriceNotFoundException.
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId)
  const availableServices = selectedVehicle
    ? services.filter((s) => s.prices.some((p) => p.vehicleType === selectedVehicle.vehicleType))
    : []

  return (
    <section>
      <PageHeader
        title="Đơn hàng"
        action={
          <Button variant="primary" onClick={openCreateForm}>
            <Plus className="h-4 w-4" />
            Tạo đơn mới
          </Button>
        }
      />

      {error && !showCreateForm && <ErrorBanner>{error}</ErrorBanner>}

      {loading ? (
        <LoadingBlock />
      ) : orders.length === 0 ? (
        <EmptyState>Chưa có đơn hàng nào.</EmptyState>
      ) : (
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Mã đơn</th>
                <th className={thClass}>Khách hàng</th>
                <th className={thClass}>Biển số</th>
                <th className={thClass}>Tổng tiền</th>
                <th className={thClass}>Trạng thái</th>
                <th className={thClass}>Thời gian tạo</th>
                <th className={thClass}></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className={trHoverClass}>
                  <td className={`${tdClass} tabular font-medium text-suds-700`}>#{o.id}</td>
                  <td className={tdClass}>{o.customerName}</td>
                  <td className={`${tdClass} tabular`}>{o.licensePlate}</td>
                  <td className={`${tdClass} tabular font-medium`}>{o.totalAmount.toLocaleString('vi-VN')}đ</td>
                  <td className={tdClass}>
                    <Badge tone={ORDER_STATUS_TONE[o.status]}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                  </td>
                  <td className={`${tdClass} tabular text-ink-muted`}>{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
                  <td className={tdClass}>
                    <Link
                      to={`/orders/${o.id}`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-suds-600 hover:text-suds-700"
                    >
                      Xem chi tiết
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateForm && (
        <Modal title="Tạo đơn hàng mới" onClose={() => setShowCreateForm(false)} size="lg">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-suds-100 text-[11px] text-suds-700">1</span>
                Chọn khách hàng
              </p>
              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <input
                  className={`${inputClass} pl-9`}
                  placeholder="Tìm theo SĐT hoặc tên..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
              </div>
              <ul className="scrollbar-thin max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-1.5">
                {filteredCustomers.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectCustomer(c.id)}
                      className={`w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                        selectedCustomerId === c.id ? 'bg-suds-50 text-suds-700' : 'hover:bg-surface-sunken'
                      }`}
                    >
                      {c.fullName} — {c.phoneNumber}
                    </button>
                  </li>
                ))}
                {filteredCustomers.length === 0 && (
                  <li className="px-2.5 py-2 text-sm text-ink-faint">Không tìm thấy khách hàng.</li>
                )}
              </ul>
            </div>

            {selectedCustomerId && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-suds-100 text-[11px] text-suds-700">2</span>
                    Chọn xe
                  </p>
                  {!showAddVehicle && (
                    <button
                      type="button"
                      onClick={() => setShowAddVehicle(true)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-suds-600 hover:text-suds-700"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Thêm xe mới
                    </button>
                  )}
                </div>

                {!showAddVehicle && (
                  <ul className="scrollbar-thin max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border p-1.5">
                    {vehicles.map((v) => (
                      <li key={v.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVehicleId(v.id)
                            setSelectedServiceIds([])
                          }}
                          className={`w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                            selectedVehicleId === v.id ? 'bg-suds-50 text-suds-700' : 'hover:bg-surface-sunken'
                          }`}
                        >
                          {v.licensePlate} ({v.brand} {v.modelName})
                        </button>
                      </li>
                    ))}
                    {vehicles.length === 0 && (
                      <li className="px-2.5 py-2 text-sm text-ink-faint">
                        Khách hàng chưa có xe nào — bấm "Thêm xe mới" ở trên.
                      </li>
                    )}
                  </ul>
                )}

                {showAddVehicle && (
                  <div className="space-y-3 rounded-lg border border-border p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="mb-1 block text-xs font-medium text-ink-muted">Biển số</label>
                        <input
                          className={inputClass}
                          placeholder="VD: 51A-123.45"
                          value={newLicensePlate}
                          onChange={(e) => setNewLicensePlate(e.target.value)}
                          autoFocus
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="mb-1 block text-xs font-medium text-ink-muted">Loại xe</label>
                        <Combobox
                          options={VEHICLE_TYPE_OPTIONS}
                          value={newVehicleType}
                          onChange={setNewVehicleType}
                          placeholder="Chọn loại xe..."
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-ink-muted">Hãng xe</label>
                        <input className={inputClass} value={newBrand} onChange={(e) => setNewBrand(e.target.value)} />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-ink-muted">Dòng xe</label>
                        <input className={inputClass} value={newModelName} onChange={(e) => setNewModelName(e.target.value)} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        loading={submittingVehicle}
                        onClick={handleCreateVehicleInline}
                      >
                        {submittingVehicle ? 'Đang thêm...' : 'Lưu xe & chọn'}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setShowAddVehicle(false)
                          resetAddVehicleForm()
                        }}
                      >
                        Huỷ
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedVehicleId && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-suds-100 text-[11px] text-suds-700">3</span>
                  Chọn dịch vụ
                </p>
                <div className="space-y-1 rounded-lg border border-border p-1.5">
                  {availableServices.map((s) => {
                    const price = s.prices.find((p) => p.vehicleType === selectedVehicle?.vehicleType)
                    return (
                      <label
                        key={s.id}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-surface-sunken"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border-strong text-suds-600 focus:ring-suds-300"
                          checked={selectedServiceIds.includes(s.id)}
                          onChange={() => toggleService(s.id)}
                        />
                        <span className="flex-1">{s.name}</span>
                        <span className="tabular font-medium text-ink">{price?.price.toLocaleString('vi-VN')}đ</span>
                      </label>
                    )
                  })}
                  {availableServices.length === 0 && (
                    <p className="px-2.5 py-2 text-sm text-ink-faint">Không có dịch vụ nào áp dụng cho loại xe này.</p>
                  )}
                </div>
              </div>
            )}

            {error && <ErrorBanner>{error}</ErrorBanner>}
            <div className="flex gap-2">
              <Button type="submit" variant="primary" loading={submitting} className="flex-1">
                <ClipboardList className="h-4 w-4" />
                {submitting ? 'Đang tạo...' : 'Tạo đơn hàng'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>
                Huỷ
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  )
}