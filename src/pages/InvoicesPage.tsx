import { useEffect, useState, type FormEvent } from 'react'
import { Receipt, Plus, Star, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { fetchInvoices, createInvoice } from '../api/invoices'
import { fetchOrders } from '../api/orders'
import type { Invoice, Order, PaymentMethod } from '../types'
import { PAYMENT_METHOD_LABEL } from '../types'
import { useAuth } from '../context/AuthContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Field from '../components/ui/Field'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { PageHeader, ErrorBanner, EmptyState, LoadingBlock } from '../components/ui/Misc'
import { inputClass, selectClass, tableWrapClass, tableClass, thClass, tdClass, trHoverClass } from '../components/ui/styles'

const PAYMENT_METHODS: PaymentMethod[] = ['TIEN_MAT', 'CHUYEN_KHOAN', 'THE']

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function toRangeIso(dateValue: string, endOfDay: boolean) {
  return `${dateValue}T${endOfDay ? '23:59:59' : '00:00:00'}`
}

export default function InvoicesPage() {
  const { user } = useAuth()
  // Đúng quy trình nghiệp vụ: Tiếp đón chuyển đơn sang WAITING_PAYMENT, chỉ
  // Thu ngân mới trực tiếp lập hoá đơn. Admin cơ sở chỉ xem/giám sát danh
  // sách hoá đơn để đối soát, không thao tác lập hoá đơn hàng ngày.
  const canCreateInvoice = user?.role === 'THU_NGAN'

  const today = new Date()
  const monthAgo = new Date()
  monthAgo.setDate(monthAgo.getDate() - 30)

  const [fromDate, setFromDate] = useState(toDateInputValue(monthAgo))
  const [toDate, setToDate] = useState(toDateInputValue(today))

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [waitingOrders, setWaitingOrders] = useState<Order[]>([])
  const [orderId, setOrderId] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TIEN_MAT')
  const [pointsToUse, setPointsToUse] = useState('0')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    fetchInvoices(toRangeIso(fromDate, false), toRangeIso(toDate, true))
      .then(setInvoices)
      .catch((err) => setError(err instanceof Error ? err.message : 'Tải hoá đơn thất bại'))
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [])

  function openCreateForm() {
    setShowCreateForm(true)
    setFormError(null)
    // Chỉ những đơn đã chuyển WAITING_PAYMENT mới đủ điều kiện lên hoá đơn.
    fetchOrders()
      .then((orders) => setWaitingOrders(orders.filter((o) => o.status === 'WAITING_PAYMENT')))
      .catch((err) => setFormError(err instanceof Error ? err.message : 'Tải danh sách đơn hàng thất bại'))
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!orderId) {
      setFormError('Vui lòng chọn đơn hàng')
      return
    }
    setFormError(null)
    setSubmitting(true)
    try {
      await createInvoice({
        orderId: Number(orderId),
        paymentMethod,
        pointsToUse: Number(pointsToUse) || undefined,
      })
      setShowCreateForm(false)
      setOrderId('')
      setPointsToUse('0')
      load()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Tạo hoá đơn thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section>
      <PageHeader
        title="Hoá đơn"
        action={
          canCreateInvoice ? (
            <Button variant="primary" onClick={openCreateForm}>
              <Plus className="h-4 w-4" />
              Lập hoá đơn thanh toán
            </Button>
          ) : undefined
        }
      />

      <Card className="mb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            load()
          }}
          className="flex flex-wrap items-end gap-4"
        >
          <Field label="Từ ngày" className="min-w-[160px]">
            <input type="date" className={inputClass} value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
          </Field>
          <Field label="Đến ngày" className="min-w-[160px]">
            <input type="date" className={inputClass} value={toDate} onChange={(e) => setToDate(e.target.value)} required />
          </Field>
          <Button type="submit" variant="secondary">
            Lọc
          </Button>
        </form>
      </Card>

      {error && !showCreateForm && <ErrorBanner>{error}</ErrorBanner>}

      {loading ? (
        <LoadingBlock />
      ) : invoices.length === 0 ? (
        <EmptyState>Không có hoá đơn nào trong khoảng thời gian này.</EmptyState>
      ) : (
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Mã HĐ</th>
                <th className={thClass}>Đơn hàng</th>
                <th className={thClass}>Khách hàng</th>
                <th className={thClass}>Thu ngân</th>
                <th className={thClass}>Tổng tiền</th>
                <th className={thClass}>Điểm dùng</th>
                <th className={thClass}>Điểm tích</th>
                <th className={thClass}>Thanh toán</th>
                <th className={thClass}></th>
                <th className={thClass}>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className={trHoverClass}>
                  <td className={`${tdClass} tabular font-medium text-suds-700`}>
                    <span className="flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5" />#{inv.id}
                    </span>
                  </td>
                  <td className={`${tdClass} tabular`}>#{inv.orderId}</td>
                  <td className={tdClass}>{inv.customerName}</td>
                  <td className={tdClass}>{inv.cashierName}</td>
                  <td className={`${tdClass} tabular font-medium`}>{inv.total.toLocaleString('vi-VN')}đ</td>
                  <td className={`${tdClass} tabular text-ink-muted`}>
                    {inv.pointsUsed > 0 ? `-${inv.pointsDiscount.toLocaleString('vi-VN')}đ (${inv.pointsUsed} điểm)` : '—'}
                  </td>
                  <td className={tdClass}>
                    {inv.pointsEarned > 0 ? (
                      <Badge tone="success">
                        <Star className="h-3 w-3" />+{inv.pointsEarned}
                      </Badge>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className={tdClass}>{PAYMENT_METHOD_LABEL[inv.paymentMethod]}</td>
                  <td className={tdClass}>
                    <Link
                      to={`/invoices/${inv.id}/print`}
                      className="inline-flex items-center gap-1 text-sm font-medium text-suds-600 hover:text-suds-700"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      In hoá đơn
                    </Link>
                  </td>
                  <td className={`${tdClass} tabular text-ink-muted`}>{new Date(inv.paidAt).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateForm && (
        <Modal title="Lập hoá đơn thanh toán" onClose={() => setShowCreateForm(false)}>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Field label="Đơn hàng chờ thanh toán">
              <select className={selectClass} value={orderId} onChange={(e) => setOrderId(e.target.value)} required>
                <option value="">-- Chọn đơn hàng --</option>
                {waitingOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    #{o.id} — {o.customerName} — {o.totalAmount.toLocaleString('vi-VN')}đ
                  </option>
                ))}
              </select>
              {waitingOrders.length === 0 && (
                <p className="mt-1 text-xs text-ink-faint">Không có đơn hàng nào đang chờ thanh toán.</p>
              )}
            </Field>
            <Field label="Hình thức thanh toán">
              <select className={selectClass} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {PAYMENT_METHOD_LABEL[m]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Số điểm khách muốn dùng (không bắt buộc)">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={pointsToUse}
                onChange={(e) => setPointsToUse(e.target.value)}
              />
            </Field>
            {formError && <ErrorBanner>{formError}</ErrorBanner>}
            <div className="flex gap-2">
              <Button type="submit" variant="primary" loading={submitting} className="flex-1">
                Xác nhận thanh toán
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
