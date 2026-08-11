import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="hero-section">
      <h1>404</h1>
      <p>Trang bạn tìm không tồn tại.</p>
      <Link to="/" className="btn-primary">
        Về trang chủ
      </Link>
    </section>
  )
}
