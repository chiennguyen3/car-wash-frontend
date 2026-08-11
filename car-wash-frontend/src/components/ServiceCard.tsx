import { Link } from 'react-router-dom'
import type { Service } from '../types'

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="service-card">
      {service.imageUrl && <img src={service.imageUrl} alt={service.name} />}
      <h3>{service.name}</h3>
      <p>{service.description}</p>
      <div className="service-card-meta">
        <span>{service.price.toLocaleString('vi-VN')}đ</span>
        <span>{service.durationMinutes} phút</span>
      </div>
      <Link to={`/booking?serviceId=${service.id}`} className="btn-primary">
        Đặt lịch
      </Link>
    </div>
  )
}
