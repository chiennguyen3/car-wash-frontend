import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Droplet, Printer, ArrowLeft } from 'lucide-react'
import { fetchInvoiceById } from '../api/invoices'
import type { Invoice } from '../types'
import { PAYMENT_METHOD_LABEL } from '../types'
import { ErrorBanner, LoadingBlock } from '../components/ui/Misc'

function money(n: number) {
  return n.toLocaleString('vi-VN') + 'đ'
}

export default function InvoicePrintPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoiceById(Number(id))
      .then(setInvoice)
      .catch((err) => setError(err instanceof Error ? err.message : 'Tải hoá đơn thất bại'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <LoadingBlock />
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <ErrorBanner>{error ?? 'Không tìm thấy hoá đơn.'}</ErrorBanner>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-sunken">
      {/* Thanh công cụ - ẩn khi in nhờ class print:hidden */}
      <div className="print:hidden sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-4 py-3 sm:px-8">
        <button
          type="button"
          onClick={() => navigate('/invoices')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-suds-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-suds-700"
        >
          <Printer className="h-4 w-4" />
          In hoá đơn
        </button>
      </div>

      {/* Khổ A4 - căn giữa trên màn hình, full trang khi in */}
      <div className="mx-auto max-w-[210mm] bg-surface px-10 py-12 shadow-[var(--shadow-card)] print:max-w-none print:shadow-none">
        {/* Letterhead */}
        <div className="mb-8 flex items-start justify-between border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-suds-600 text-white">
              <Droplet className="h-5 w-5" fill="currentColor" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-ink">{invoice.branchName}</p>
              <p className="text-xs text-ink-muted">{invoice.branchAddress}</p>
              <p className="text-xs text-ink-muted">{invoice.branchPhone}</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="font-display text-xl font-semibold text-ink">HOÁ ĐƠN</h1>
            <p className="tabular text-sm text-ink-muted">Số #{invoice.id}</p>
            <p className="tabular text-xs text-ink-faint">
              {new Date(invoice.paidAt).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        {/* Thông tin khách hàng / xe */}
        <div className="mb-8 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Khách hàng</p>
            <p className="font-medium text-ink">{invoice.customerName}</p>
            <p className="tabular text-ink-muted">{invoice.customerPhone}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-faint">Thông tin đơn hàng</p>
            <p className="text-ink">
              Xe: <span className="tabular font-medium">{invoice.licensePlate}</span>
            </p>
            <p className="text-ink">
              Đơn hàng: <span className="tabular font-medium">#{invoice.orderId}</span>
            </p>
            <p className="text-ink">
              Thu ngân: <span className="font-medium">{invoice.cashierName}</span>
            </p>
          </div>
        </div>

        {/* Chi tiết dịch vụ */}
        <table className="mb-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink/20">
              <th className="py-2 text-left font-semibold text-ink-muted">Dịch vụ</th>
              <th className="py-2 text-right font-semibold text-ink-muted">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="border-b border-border">
                <td className="py-2.5 text-ink">{item.serviceName}</td>
                <td className="tabular py-2.5 text-right text-ink">{money(item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Tổng kết */}
        <div className="ml-auto flex max-w-xs flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-muted">Tạm tính</span>
            <span className="tabular text-ink">{money(invoice.subtotal)}</span>
          </div>
          {invoice.pointsUsed > 0 && (
            <div className="flex justify-between">
              <span className="text-ink-muted">Đổi {invoice.pointsUsed} điểm</span>
              <span className="tabular text-ink">-{money(invoice.pointsDiscount)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-ink/20 pt-2 text-base font-semibold">
            <span className="text-ink">Tổng cộng</span>
            <span className="tabular text-suds-700">{money(invoice.total)}</span>
          </div>
          <div className="flex justify-between text-xs text-ink-faint">
            <span>Hình thức thanh toán</span>
            <span>{PAYMENT_METHOD_LABEL[invoice.paymentMethod]}</span>
          </div>
          {invoice.pointsEarned > 0 && (
            <div className="flex justify-between text-xs text-ink-faint">
              <span>Điểm tích luỹ được</span>
              <span className="tabular">+{invoice.pointsEarned}</span>
            </div>
          )}
        </div>

        <p className="mt-12 text-center text-xs text-ink-faint">Cảm ơn quý khách đã sử dụng dịch vụ!</p>
      </div>
    </div>
  )
}
