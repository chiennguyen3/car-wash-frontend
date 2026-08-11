import { useEffect, useState } from 'react'
import { cancelBooking, fetchMyBookings } from '../api/bookings'
import type { Booking } from '../types'

const statusLabel: Record<Booking['status'], string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    fetchMyBookings()
      .then(setBookings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCancel(id: number) {
    try {
      await cancelBooking(id)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Huỷ lịch thất bại')
    }
  }

  if (loading) return <p className="loading">Đang tải lịch đặt...</p>

  return (
    <section>
      <h2>Lịch đặt của tôi</h2>
      {error && <p className="error">{error}</p>}
      {bookings.length === 0 ? (
        <p>Bạn chưa có lịch đặt nào.</p>
      ) : (
        <table className="bookings-table">
          <thead>
            <tr>
              <th>Dịch vụ</th>
              <th>Biển số</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.serviceName ?? `#${b.serviceId}`}</td>
                <td>{b.vehiclePlate}</td>
                <td>{new Date(b.scheduledAt).toLocaleString('vi-VN')}</td>
                <td>{statusLabel[b.status]}</td>
                <td>
                  {b.status === 'PENDING' && (
                    <button type="button" onClick={() => handleCancel(b.id)}>
                      Huỷ
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
