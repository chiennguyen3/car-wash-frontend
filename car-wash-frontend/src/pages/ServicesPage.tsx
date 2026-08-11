import { useEffect, useState } from 'react'
import ServiceCard from '../components/ServiceCard'
import { fetchServices } from '../api/services'
import type { Service } from '../types'

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()
      .then(setServices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="loading">Đang tải danh sách dịch vụ...</p>
  if (error) return <p className="error">{error}</p>

  return (
    <section>
      <h2>Danh sách dịch vụ</h2>
      {services.length === 0 ? (
        <p>Chưa có dịch vụ nào. Hãy thêm dữ liệu ở BE để hiển thị tại đây.</p>
      ) : (
        <div className="service-grid">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </section>
  )
}
