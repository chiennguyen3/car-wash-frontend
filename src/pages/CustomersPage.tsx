import { useEffect, useState, type FormEvent } from 'react'
import { fetchCustomers, createCustomer } from '../api/customers'
import { fetchVehiclesByCustomer, createVehicle } from '../api/vehicles'
import type { Customer, Vehicle, VehicleType } from '../types'
import { VEHICLE_TYPE_LABEL } from '../types'

const VEHICLE_TYPE_OPTIONS: VehicleType[] = ['MOTORBIKE', 'CAR_4_SEATS', 'CAR_7_SEATS', 'TRUCK']

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

  return (
    <section>
      <h2>Khách hàng & Xe</h2>
      {error && <p className="error">{error}</p>}

      <div className="two-column">
        <div>
          <h3>Danh sách khách hàng</h3>
          <input
            className="search-box"
            placeholder="Tìm theo SĐT hoặc tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <form onSubmit={handleCreateCustomer} className="form form-inline">
            <label>
              Họ tên
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </label>
            <label>
              Số điện thoại
              <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
            </label>
            <button type="submit" className="btn-primary" disabled={submittingCustomer}>
              {submittingCustomer ? 'Đang tạo...' : 'Thêm khách hàng'}
            </button>
          </form>

          {loading ? (
            <p className="loading">Đang tải...</p>
          ) : (
            <ul className="list-select">
              {filteredCustomers.map((c) => (
                <li
                  key={c.id}
                  className={selectedCustomer?.id === c.id ? 'selected' : ''}
                  onClick={() => loadVehicles(c)}
                >
                  <strong>{c.fullName}</strong> — {c.phoneNumber}
                  <span className="muted"> ({c.customerCode})</span>
                </li>
              ))}
              {filteredCustomers.length === 0 && <p className="muted">Không tìm thấy khách hàng nào.</p>}
            </ul>
          )}
        </div>

        <div>
          <h3>Xe của khách hàng</h3>
          {!selectedCustomer ? (
            <p className="muted">Chọn 1 khách hàng bên trái để xem/thêm xe.</p>
          ) : (
            <>
              <p>
                Đang xem xe của: <strong>{selectedCustomer.fullName}</strong> ({selectedCustomer.phoneNumber})
                {selectedCustomer.totalPoints !== undefined && (
                  <span className="badge badge-success" style={{ marginLeft: 8 }}>
                    {selectedCustomer.totalPoints} điểm
                  </span>
                )}
              </p>

              <form onSubmit={handleCreateVehicle} className="form form-inline">
                <label>
                  Biển số
                  <input
                    value={licensePlate}
                    onChange={(e) => setLicensePlate(e.target.value)}
                    placeholder="VD: 51A-123.45"
                    required
                  />
                </label>
                <label>
                  Loại xe
                  <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value as VehicleType)}>
                    {VEHICLE_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{VEHICLE_TYPE_LABEL[t]}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Hãng xe
                  <input value={brand} onChange={(e) => setBrand(e.target.value)} />
                </label>
                <label>
                  Dòng xe
                  <input value={modelName} onChange={(e) => setModelName(e.target.value)} />
                </label>
                <button type="submit" className="btn-primary" disabled={submittingVehicle}>
                  {submittingVehicle ? 'Đang tạo...' : 'Thêm xe'}
                </button>
              </form>

              {loadingVehicles ? (
                <p className="loading">Đang tải...</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Biển số</th>
                      <th>Loại xe</th>
                      <th>Hãng / Dòng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((v) => (
                      <tr key={v.id}>
                        <td>{v.licensePlate}</td>
                        <td>{VEHICLE_TYPE_LABEL[v.vehicleType]}</td>
                        <td>{[v.brand, v.modelName].filter(Boolean).join(' ')}</td>
                      </tr>
                    ))}
                    {vehicles.length === 0 && (
                      <tr>
                        <td colSpan={3} className="muted">Khách hàng chưa có xe nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}