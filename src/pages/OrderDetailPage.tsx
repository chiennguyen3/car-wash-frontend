import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Wand2, UserCog, CheckCircle2, FlagTriangleRight } from 'lucide-react'
import {
  fetchOrderById,
  updateOrderStatus,
  assignTechnician,
  updateItemStatus,
} from '../api/orders'
import { fetchTechnicians } from '../api/technicians'
import type { OrderItemStatus, Technician } from '../types'
import { ORDER_STATUS_LABEL, ORDER_ITEM_STATUS_LABEL } from '../types'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { ErrorBanner, LoadingBlock } from '../components/ui/Misc'
import { ORDER_STATUS_TONE, ITEM_STATUS_TONE } from '../components/ui/statusTone'
import { tableWrapClass, tableClass, thClass, tdClass, trHoverClass } from '../components/ui/styles'

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const orderId = Number(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [error, setError] = useState<string | null>(null)
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [assigningItemId, setAssigningItemId] = useState<number | null>(null)

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId),
    // Refetch định kỳ để theo dõi tiến độ order_details thay đổi liên tục
    // (thợ đang làm, đánh dấu hoàn thành...) mà không cần websocket.
    refetchInterval: 5000,
  })

  useEffect(() => {
    fetchTechnicians().then(setTechnicians).catch(() => {})
  }, [])

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['order', orderId] })
  }

  async function handleAssign(itemId: number, technicianId?: number) {
    setError(null)
    try {
      await assignTechnician(orderId, itemId, technicianId)
      setAssigningItemId(null)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gán thợ thất bại')
    }
  }

  async function handleItemStatus(itemId: number, status: OrderItemStatus) {
    setError(null)
    try {
      await updateItemStatus(orderId, itemId, status)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại')
    }
  }

  async function handleMarkWaitingPayment() {
    setError(null)
    try {
      await updateOrderStatus(orderId, 'WAITING_PAYMENT')
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cập nhật trạng thái thất bại')
    }
  }

  if (isLoading) return <LoadingBlock />
  if (!order) return <ErrorBanner>Không tìm thấy đơn hàng.</ErrorBanner>

  const allItemsDone = order.details.every((d) => d.status === 'COMPLETED')

  return (
    <section>
      <button
        type="button"
        onClick={() => navigate('/orders')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách
      </button>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold text-ink">Đơn hàng #{order.id}</h2>
        <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium text-ink-faint">Khách hàng</p>
          <p className="mt-0.5 font-medium text-ink">{order.customerName}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-faint">Biển số</p>
          <p className="tabular mt-0.5 font-medium text-ink">{order.licensePlate}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-ink-faint">Tổng tiền</p>
          <p className="tabular mt-0.5 font-semibold text-suds-700">{order.totalAmount.toLocaleString('vi-VN')}đ</p>
        </div>
      </div>

      {error && <ErrorBanner>{error}</ErrorBanner>}

      <h3 className="mb-3 font-display text-base font-semibold text-ink">Chi tiết dịch vụ</h3>
      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Dịch vụ</th>
              <th className={thClass}>Giá</th>
              <th className={thClass}>Thợ phụ trách</th>
              <th className={thClass}>Trạng thái</th>
              <th className={thClass}>Dự kiến xong</th>
              <th className={thClass}></th>
            </tr>
          </thead>
          <tbody>
            {order.details.map((d) => (
              <tr key={d.id} className={trHoverClass}>
                <td className={`${tdClass} font-medium`}>{d.serviceName}</td>
                <td className={`${tdClass} tabular`}>{d.price.toLocaleString('vi-VN')}đ</td>
                <td className={tdClass}>{d.technicianName ?? '—'}</td>
                <td className={tdClass}>
                  <Badge tone={ITEM_STATUS_TONE[d.status]}>{ORDER_ITEM_STATUS_LABEL[d.status]}</Badge>
                </td>
                <td className={`${tdClass} tabular`}>
                  {d.estimatedEndAt
                    ? new Date(d.estimatedEndAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    : '—'}
                </td>
                <td className={tdClass}>
                  <div className="flex gap-2">
                    {!d.technicianId && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => handleAssign(d.id)}>
                          <Wand2 className="h-3.5 w-3.5" />
                          Gán tự động
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setAssigningItemId(d.id)}>
                          <UserCog className="h-3.5 w-3.5" />
                          Chọn thợ
                        </Button>
                      </>
                    )}
                    {d.technicianId && d.status === 'IN_PROGRESS' && (
                      <Button size="sm" variant="secondary" onClick={() => handleItemStatus(d.id, 'COMPLETED')}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Đánh dấu xong
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {order.status === 'IN_PROGRESS' && allItemsDone && (
        <Button variant="primary" className="mt-4" onClick={handleMarkWaitingPayment}>
          <FlagTriangleRight className="h-4 w-4" />
          Đánh dấu xong việc, chuyển sang chờ thanh toán
        </Button>
      )}

      {assigningItemId !== null && (
        <Modal title="Chọn thợ cụ thể" onClose={() => setAssigningItemId(null)}>
          <ul className="space-y-1">
            {technicians
              .filter((t) => t.status === 'ON_DUTY')
              .map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => handleAssign(assigningItemId, t.id)}
                    className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-suds-50 hover:text-suds-700"
                  >
                    {t.name}
                  </button>
                </li>
              ))}
            {technicians.filter((t) => t.status === 'ON_DUTY').length === 0 && (
              <p className="px-1 py-2 text-sm text-ink-faint">Không có thợ nào đang trong ca làm.</p>
            )}
          </ul>
          <Button variant="secondary" className="mt-3 w-full" onClick={() => setAssigningItemId(null)}>
            Đóng
          </Button>
        </Modal>
      )}
    </section>
  )
}
