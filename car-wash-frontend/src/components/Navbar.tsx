import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        🚗 Car Wash
      </Link>
      <nav className="navbar-links">
        <Link to="/services">Dịch vụ</Link>
        {user ? (
          <>
            <Link to="/my-bookings">Lịch của tôi</Link>
            <span className="navbar-user">Xin chào, {user.name}</span>
            <button type="button" onClick={handleLogout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </>
        )}
      </nav>
    </header>
  )
}
