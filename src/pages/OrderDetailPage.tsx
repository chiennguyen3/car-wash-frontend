import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchOrderById,
  updateOrderStatus,
  assignTechnician,
  updateItemStatus,
} from '../api/orders'
import { fetchTechnicians } from '../api/technicians'
import type { OrderItemStatus, Technician } from '../types'
import { ORDER_STATUS_LABEL, ORDER_ITEM_STATUS_LABEL } from '../types'

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

  if (isLoading) return <p className="loading">Đang tải...</p>
  if (!order) return <p className="error">Không tìm thấy đơn hàng.</p>

  const allItemsDone = order.details.every((d) => d.status === 'COMPLETED')

  return (
    <section>
      <button type="button" onClick={() => navigate('/orders')} className="link-back">
        ← Quay lại danh sách
      </button>

      <div className="page-header">
        <h2>Đơn hàng #{order.id}</h2>
        <span className={`badge order-status-${order.status}`}>{ORDER_STATUS_LABEL[order.status]}</span>
      </div>

      <div className="info-row">
        <p><strong>Khách hàng:</strong> {order.customerName}</p>
        <p><strong>Biển số:</strong> {order.licensePlate}</p>
        <p><strong>Tổng tiền:</strong> {order.totalAmount.toLocaleString('vi-VN')}đ</p>
      </div>

      {error && <p className="error">{error}</p>}

      <h3>Chi tiết dịch vụ</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Dịch vụ</th>
            <th>Giá</th>
            <th>Thợ phụ trách</th>
            <th>Trạng thái</th>
            <th>Dự kiến xong</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {order.details.map((d) => (
            <tr key={d.id}>
              <td>{d.serviceName}</td>
              <td>{d.price.toLocaleString('vi-VN')}đ</td>
              <td>{d.technicianName ?? '—'}</td>
              <td>
                <span className={`badge item-status-${d.status}`}>{ORDER_ITEM_STATUS_LABEL[d.status]}</span>
              </td>
              <td>
                {d.estimatedEndAt
                  ? new Date(d.estimatedEndAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </td>
              <td className="actions">
                {!d.technicianId && (
                  <>
                    <button type="button" onClick={() => handleAssign(d.id)}>Gán thợ tự động</button>
                    <button type="button" onClick={() => setAssigningItemId(d.id)}>Chọn thợ</button>
                  </>
                )}
                {d.technicianId && d.status === 'IN_PROGRESS' && (
                  <button type="button" onClick={() => handleItemStatus(d.id, 'COMPLETED')}>
                    Đánh dấu xong
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {order.status === 'IN_PROGRESS' && allItemsDone && (
        <button type="button" className="btn-primary" style={{ marginTop: 16 }} onClick={handleMarkWaitingPayment}>
          Đánh dấu xong việc, chuyển sang chờ thanh toán
        </button>
      )}

      {assigningItemId !== null && (
        <div className="modal-overlay" onClick={() => setAssigningItemId(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Chọn thợ cụ thể</h3>
            <ul className="list-select">
              {technicians
                .filter((t) => t.status === 'ON_DUTY')
                .map((t) => (
                  <li key={t.id} onClick={() => handleAssign(assigningItemId, t.id)}>
                    {t.name}
                  </li>
                ))}
              {technicians.filter((t) => t.status === 'ON_DUTY').length === 0 && (
                <p className="muted">Không có thợ nào đang trong ca làm.</p>
              )}
            </ul>
            <button type="button" onClick={() => setAssigningItemId(null)}>Đóng</button>
          </div>
        </div>
      )}
    </section>
  )
}