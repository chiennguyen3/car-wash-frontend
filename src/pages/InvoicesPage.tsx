import { useEffect, useState, type FormEvent } from 'react'
import { fetchOrders } from '../api/orders'
import { createInvoice } from '../api/invoices'
import { fetchCustomers } from '../api/customers'
import type { Order, Invoice, PaymentMethod, Customer } from '../types'
import { PAYMENT_METHOD_LABEL } from '../types'

const PAYMENT_OPTIONS: PaymentMethod[] = ['TIEN_MAT', 'CHUYEN_KHOAN', 'THE']

export default function InvoicesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TIEN_MAT')
  const [pointsToUse, setPointsToUse] = useState('0')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<Invoice | null>(null)

  function load() {
    setLoading(true)
    Promise.all([fetchOrders(), fetchCustomers()])
      .then(([o, c]) => {
        setOrders(o.filter((x) => x.status === 'WAITING_PAYMENT'))
        setCustomers(c)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openInvoiceForm(order: Order) {
    setSelectedOrder(order)
    setPaymentMethod('TIEN_MAT')
    setPointsToUse('0')
    setResult(null)
    setError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!selectedOrder) return
    setError(null)
    setSubmitting(true)
    try {
      const invoice = await createInvoice({
        orderId: selectedOrder.id,
        paymentMethod,
        pointsToUse: Number(pointsToUse) || 0,
      })
      setResult(invoice)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tạo hoá đơn thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  const currentPoints = selectedOrder
    ? customers.find((c) => c.id === selectedOrder.customerId)?.totalPoints ?? 0
    : 0

  return (
    <section>
      <h2>Hoá đơn thanh toán</h2>
      <p className="muted">Danh sách đơn đang chờ thanh toán</p>

      {error && !selectedOrder && <p className="error">{error}</p>}
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
                  <button type="button" className="btn-primary" onClick={() => openInvoiceForm(o)}>
                    Thanh toán
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">Không có đơn nào đang chờ thanh toán.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {!result ? (
              <>
                <h3>Thanh toán đơn #{selectedOrder.id}</h3>
                <p><strong>Khách hàng:</strong> {selectedOrder.customerName}</p>
                <p><strong>Tổng tiền đơn:</strong> {selectedOrder.totalAmount.toLocaleString('vi-VN')}đ</p>
                <p><strong>Điểm hiện có:</strong> {currentPoints}</p>

                <form onSubmit={handleSubmit} className="form">
                  <label>
                    Hình thức thanh toán
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                      {PAYMENT_OPTIONS.map((p) => (
                        <option key={p} value={p}>{PAYMENT_METHOD_LABEL[p]}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Số điểm muốn đổi (tối đa {currentPoints})
                    <input
                      type="number"
                      min={0}
                      max={currentPoints}
                      value={pointsToUse}
                      onChange={(e) => setPointsToUse(e.target.value)}
                    />
                  </label>
                  {error && <p className="error">{error}</p>}
                  <div className="form-row">
                    <button type="submit" className="btn-primary" disabled={submitting}>
                      {submitting ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                    </button>
                    <button type="button" onClick={() => setSelectedOrder(null)}>Huỷ</button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h3>✅ Thanh toán thành công</h3>
                <div className="invoice-summary">
                  <p>Tạm tính: {result.subtotal.toLocaleString('vi-VN')}đ</p>
                  {result.pointsUsed > 0 && (
                    <p>Giảm giá ({result.pointsUsed} điểm): -{result.pointsDiscount.toLocaleString('vi-VN')}đ</p>
                  )}
                  <p className="invoice-total">Thực thu: {result.total.toLocaleString('vi-VN')}đ</p>
                  <p className="muted">Điểm tích luỹ thêm: +{result.pointsEarned}</p>
                </div>
                <button type="button" className="btn-primary" onClick={() => setSelectedOrder(null)}>
                  Đóng
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}