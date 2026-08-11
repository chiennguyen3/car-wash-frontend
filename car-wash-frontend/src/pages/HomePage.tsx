import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <section className="hero-section">
      <h1>Rửa xe nhanh - sạch - tận nơi</h1>
      <p>Đặt lịch rửa xe chỉ trong vài giây, theo dõi trạng thái đơn ngay trên web.</p>
      <Link to="/services" className="btn-primary">
        Xem dịch vụ
      </Link>
    </section>
  )
}
