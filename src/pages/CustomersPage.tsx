import { useEffect, useState, type FormEvent } from 'react'
import { Search, UserPlus, CarFront, Star, History, Receipt } from 'lucide-react'
import { fetchCustomers, createCustomer } from '../api/customers'
import { fetchVehiclesByCustomer, createVehicle } from '../api/vehicles'
import { fetchInvoices } from '../api/invoices'
import type { Customer, Vehicle, VehicleType, Invoice } from '../types'
import { VEHICLE_TYPE_LABEL, PAYMENT_METHOD_LABEL } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import Badge from '../components/ui/Badge'
import { ErrorBanner, EmptyState, LoadingBlock } from '../components/ui/Misc'
import { inputClass, selectClass, tableWrapClass, tableClass, thClass, tdClass, trHoverClass } from '../components/ui/styles'

const VEHICLE_TYPE_OPTIONS: VehicleType[] = ['MOTORBIKE', 'CAR_4_SEATS', 'CAR_7_SEATS', 'TRUCK']

// Mặc định xem lịch sử 12 tháng gần nhất - đủ dùng cho tra cứu thường ngày
// mà không phải tải toàn bộ lịch sử giao dịch của chi nhánh về máy khách.
function defaultHistoryRange() {
  const to = new Date()
  const from = new Date()
  from.setMonth(from.getMonth() - 12)
  return { from: `${from.toISOString().slice(0, 10)}T00:00:00`, to: `${to.toISOString().slice(0, 10)}T23:59:59` }
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [submittingCustomer, setSubmittingCustomer] = useState(false)

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(false)

  const [licensePlate, setLicensePlate] = useState('')
  const [vehicleType, setVehicleType] = useState<VehicleType>('CAR_4_SEATS')
  const [brand, setBrand] = useState('')
  const [modelName, setModelName] = useState('')
  const [submittingVehicle, setSubmittingVehicle] = useState(false)

  const [history, setHistory] = useState<Invoice[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  function loadCustomers() {
    setLoading(true)
    fetchCustomers()
      .then(setCustomers)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(loadCustomers, [])

  function loadVehicles(customer: Customer) {
    setSelectedCustomer(customer)
    setLoadingVehicles(true)
    fetchVehiclesByCustomer(customer.id)
      .then(setVehicles)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingVehicles(false))
    loadHistory(customer)
  }

  function loadHistory(customer: Customer) {
    setLoadingHistory(true)
    const { from, to } = defaultHistoryRange()
    // BE chưa có endpoint lọc hoá đơn theo khách hàng, nên tạm lọc phía client
    // trên danh sách hoá đơn của chi nhánh trong 12 tháng gần nhất.
    fetchInvoices(from, to)
      .then((invoices) => setHistory(invoices.filter((inv) => inv.customerId === customer.id)))
      .catch((err) => setError(err instanceof Error ? err.message : 'Tải lịch sử thất bại'))
      .finally(() => setLoadingHistory(false))
  }

  async function handleCreateCustomer(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmittingCustomer(true)
    try {
      const created = await createCustomer({ fullName, phoneNumber })
      setFullName('')
      setPhoneNumber('')
      loadCustomers()
      loadVehicles(created)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo khách hàng thất bại')
    } finally {
      setSubmittingCustomer(false)
    }
  }

  async function handleCreateVehicle(e: FormEvent) {
    e.preventDefault()
    if (!selectedCustomer) return
    setError(null)
    setSubmittingVehicle(true)
    try {
      await createVehicle({
        licensePlate,
        vehicleType,
        brand: brand || undefined,
        modelName: modelName || undefined,
        customerId: selectedCustomer.id,
      })
      setLicensePlate('')
      setBrand('')
      setModelName('')
      loadVehicles(selectedCustomer)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo xe thất bại')
    } finally {
      setSubmittingVehicle(false)
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.phoneNumber.includes(search.trim()) ||
      c.fullName.toLowerCase().includes(search.trim().toLowerCase())
  )

  const totalSpent = history.reduce((sum, inv) => sum + inv.total, 0)

  return (
    <section>
      <h2 className="mb-6 font-display text-2xl font-semibold text-ink">Khách hàng &amp; Xe</h2>
      {error && <ErrorBanner>{error}</ErrorBanner>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cột trái: danh sách khách hàng */}
        <Card>
          <h3 className="mb-3 font-display text-base font-semibold text-ink">Danh sách khách hàng</h3>

          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Tìm theo SĐT hoặc tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <form onSubmit={handleCreateCustomer} className="mb-4 flex flex-wrap items-end gap-3">
            <Field label="Họ tên" className="min-w-[140px] flex-1">
              <input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </Field>
            <Field label="Số điện thoại" className="min-w-[140px] flex-1">
              <input className={inputClass} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
            </Field>
            <Button type="submit" variant="primary" loading={submittingCustomer}>
              <UserPlus className="h-4 w-4" />
              {submittingCustomer ? 'Đang tạo...' : 'Thêm'}
            </Button>
          </form>

          {loading ? (
            <LoadingBlock />
          ) : filteredCustomers.length === 0 ? (
            <EmptyState>Không tìm thấy khách hàng nào.</EmptyState>
          ) : (
            <ul className="scrollbar-thin max-h-[420px] space-y-1 overflow-y-auto">
              {filteredCustomers.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => loadVehicles(c)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      selectedCustomer?.id === c.id
                        ? 'border border-suds-200 bg-suds-50'
                        : 'border border-transparent hover:bg-surface-sunken'
                    }`}
                  >
                    <span className="font-medium text-ink">{c.fullName}</span>
                    <span className="text-ink-muted"> — {c.phoneNumber}</span>
                    <span className="ml-1 text-xs text-ink-faint">({c.customerCode})</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Cột phải: xe + điểm thưởng + lịch sử của khách hàng đang chọn */}
        <div className="flex flex-col gap-6">
          <Card>
            <h3 className="mb-3 font-display text-base font-semibold text-ink">Xe của khách hàng</h3>

            {!selectedCustomer ? (
              <EmptyState>Chọn 1 khách hàng bên trái để xem/thêm xe.</EmptyState>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-surface-sunken px-4 py-3">
                  <div className="flex-1">
                    <p className="font-medium text-ink">{selectedCustomer.fullName}</p>
                    <p className="text-xs text-ink-muted">
                      {selectedCustomer.phoneNumber} · Mã KH {selectedCustomer.customerCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-wax-100 px-3 py-1.5 text-wax-700">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="tabular text-sm font-semibold">
                      {(selectedCustomer.totalPoints ?? 0).toLocaleString('vi-VN')} điểm
                    </span>
                  </div>
                </div>

                <form onSubmit={handleCreateVehicle} className="mb-4 flex flex-wrap items-end gap-3">
                  <Field label="Biển số" className="min-w-[140px] flex-1">
                    <input
                      className={inputClass}
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      placeholder="VD: 51A-123.45"
                      required
                    />
                  </Field>
                  <Field label="Loại xe" className="min-w-[140px]">
                    <select className={selectClass} value={vehicleType} onChange={(e) => setVehicleType(e.target.value as VehicleType)}>
                      {VEHICLE_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {VEHICLE_TYPE_LABEL[t]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Hãng xe" className="min-w-[110px]">
                    <input className={inputClass} value={brand} onChange={(e) => setBrand(e.target.value)} />
                  </Field>
                  <Field label="Dòng xe" className="min-w-[110px]">
                    <input className={inputClass} value={modelName} onChange={(e) => setModelName(e.target.value)} />
                  </Field>
                  <Button type="submit" variant="primary" loading={submittingVehicle}>
                    <CarFront className="h-4 w-4" />
                    {submittingVehicle ? 'Đang tạo...' : 'Thêm xe'}
                  </Button>
                </form>

                {loadingVehicles ? (
                  <LoadingBlock />
                ) : (
                  <div className={tableWrapClass}>
                    <table className={tableClass}>
                      <thead>
                        <tr>
                          <th className={thClass}>Biển số</th>
                          <th className={thClass}>Loại xe</th>
                          <th className={thClass}>Hãng / Dòng</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vehicles.map((v) => (
                          <tr key={v.id} className={trHoverClass}>
                            <td className={`${tdClass} tabular font-medium`}>{v.licensePlate}</td>
                            <td className={tdClass}>{VEHICLE_TYPE_LABEL[v.vehicleType]}</td>
                            <td className={tdClass}>{[v.brand, v.modelName].filter(Boolean).join(' ') || '—'}</td>
                          </tr>
                        ))}
                        {vehicles.length === 0 && (
                          <tr>
                            <td colSpan={3} className={`${tdClass} text-center text-ink-faint`}>
                              Khách hàng chưa có xe nào.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </Card>

          {selectedCustomer && (
            <Card>
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-suds-50 text-suds-600">
                    <History className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-base font-semibold text-ink">Lịch sử sử dụng dịch vụ</h3>
                </div>
                <span className="text-xs text-ink-faint">12 tháng gần nhất</span>
              </div>

              {loadingHistory ? (
                <LoadingBlock />
              ) : history.length === 0 ? (
                <EmptyState>Khách hàng chưa có giao dịch nào trong 12 tháng gần đây.</EmptyState>
              ) : (
                <>
                  <div className="mb-3 rounded-xl bg-surface-sunken px-4 py-3">
                    <p className="text-xs font-medium text-ink-faint">Tổng chi tiêu (12 tháng)</p>
                    <p className="tabular mt-0.5 text-lg font-semibold text-suds-700">{totalSpent.toLocaleString('vi-VN')}đ</p>
                  </div>
                  <div className={tableWrapClass}>
                    <table className={tableClass}>
                      <thead>
                        <tr>
                          <th className={thClass}>Ngày</th>
                          <th className={thClass}>Đơn hàng</th>
                          <th className={thClass}>Tổng tiền</th>
                          <th className={thClass}>Điểm tích</th>
                          <th className={thClass}>Thanh toán</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((inv) => (
                          <tr key={inv.id} className={trHoverClass}>
                            <td className={`${tdClass} tabular text-ink-muted`}>
                              {new Date(inv.paidAt).toLocaleDateString('vi-VN')}
                            </td>
                            <td className={tdClass}>
                              <span className="flex items-center gap-1.5">
                                <Receipt className="h-3.5 w-3.5 text-ink-faint" />#{inv.orderId}
                              </span>
                            </td>
                            <td className={`${tdClass} tabular font-medium`}>{inv.total.toLocaleString('vi-VN')}đ</td>
                            <td className={tdClass}>
                              {inv.pointsEarned > 0 ? (
                                <Badge tone="success">+{inv.pointsEarned}</Badge>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className={tdClass}>{PAYMENT_METHOD_LABEL[inv.paymentMethod]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </section>
  )
}
