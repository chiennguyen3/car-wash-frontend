import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { fetchOrders, createOrder } from '../api/orders'
import { fetchCustomers } from '../api/customers'
import { fetchVehiclesByCustomer } from '../api/vehicles'
import { fetchWashServices } from '../api/services'
import type { Order, Customer, Vehicle, WashService } from '../types'
import { ORDER_STATUS_LABEL } from '../types'

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
    fetchVehiclesByCustomer(customerId).then(setVehicles).catch((err) => setError(err.message))
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
      <div className="page-header">
        <h2>Đơn hàng</h2>
        <button type="button" className="btn-primary" onClick={openCreateForm}>
          + Tạo đơn mới
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="loading">Đang tải...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Biển số</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thời gian tạo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{o.customerName}</td>
                <td>{o.licensePlate}</td>
                <td>{o.totalAmount.toLocaleString('vi-VN')}đ</td>
                <td>
                  <span className={`badge order-status-${o.status}`}>{ORDER_STATUS_LABEL[o.status]}</span>
                </td>
                <td>{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
                <td>
                  <Link to={`/orders/${o.id}`}>Xem chi tiết</Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="muted">Chưa có đơn hàng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <h3>Tạo đơn hàng mới</h3>
            <form onSubmit={handleSubmit} className="form">
              <div className="wizard-step">
                <p className="field-label">1. Chọn khách hàng</p>
                <input
                  className="search-box"
                  placeholder="Tìm theo SĐT hoặc tên..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                />
                <ul className="list-select list-select-compact">
                  {filteredCustomers.map((c) => (
                    <li
                      key={c.id}
                      className={selectedCustomerId === c.id ? 'selected' : ''}
                      onClick={() => handleSelectCustomer(c.id)}
                    >
                      {c.fullName} — {c.phoneNumber}
                    </li>
                  ))}
                </ul>
              </div>

              {selectedCustomerId && (
                <div className="wizard-step">
                  <p className="field-label">2. Chọn xe</p>
                  <ul className="list-select list-select-compact">
                    {vehicles.map((v) => (
                      <li
                        key={v.id}
                        className={selectedVehicleId === v.id ? 'selected' : ''}
                        onClick={() => {
                          setSelectedVehicleId(v.id)
                          setSelectedServiceIds([])
                        }}
                      >
                        {v.licensePlate} ({v.brand} {v.modelName})
                      </li>
                    ))}
                    {vehicles.length === 0 && <p className="muted">Khách hàng chưa có xe nào.</p>}
                  </ul>
                </div>
              )}

              {selectedVehicleId && (
                <div className="wizard-step">
                  <p className="field-label">3. Chọn dịch vụ</p>
                  {availableServices.map((s) => {
                    const price = s.prices.find((p) => p.vehicleType === selectedVehicle?.vehicleType)
                    return (
                      <label key={s.id} className="checkbox-row">
                        <input
                          type="checkbox"
                          checked={selectedServiceIds.includes(s.id)}
                          onChange={() => toggleService(s.id)}
                        />
                        {s.name} — {price?.price.toLocaleString('vi-VN')}đ
                      </label>
                    )
                  })}
                  {availableServices.length === 0 && (
                    <p className="muted">Không có dịch vụ nào áp dụng cho loại xe này.</p>
                  )}
                </div>
              )}

              {error && <p className="error">{error}</p>}
              <div className="form-row">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Đang tạo...' : 'Tạo đơn hàng'}
                </button>
                <button type="button" onClick={() => setShowCreateForm(false)}>Huỷ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}