import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()
  return (
    <section>
      <h2>Xin chào, {user?.email}</h2>
      <p>Chọn 1 mục trên thanh điều hướng để bắt đầu.</p>
    </section>
  )
}