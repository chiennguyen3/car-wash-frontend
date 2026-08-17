import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_LABEL: Record<string, string> = {
  TIEP_DON: 'Tiếp đón',
  THU_NGAN: 'Thu ngân',
  ADMIN_CO_SO: 'Admin cơ sở',
  ADMIN_TONG: 'Admin tổng',
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  if (!user) {
    return (
      <header className="navbar">
        <Link to="/login" className="navbar-brand">🚗 Car Wash Management</Link>
      </header>
    )
  }

  const isAdminTong = user.role === 'ADMIN_TONG'
  const isAdminCoSo = user.role === 'ADMIN_CO_SO'
  const isTiepDon = user.role === 'TIEP_DON'
  const isThuNgan = user.role === 'THU_NGAN'

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">🚗 Car Wash Management</Link>
      <nav className="navbar-links">
        {isAdminTong && <Link to="/branches">Chi nhánh</Link>}
        {isAdminTong && <Link to="/users">Nhân viên</Link>}
        {(isAdminCoSo || isTiepDon) && <Link to="/customers">Khách hàng</Link>}
        {isAdminCoSo && <Link to="/services">Dịch vụ</Link>}
        {(isAdminCoSo || isTiepDon) && <Link to="/technicians">Thợ sửa xe</Link>}
        {(isAdminCoSo || isTiepDon) && <Link to="/orders">Đơn hàng</Link>}
        {(isAdminCoSo || isThuNgan) && <Link to="/invoices">Hoá đơn</Link>}
        {(isAdminCoSo || isTiepDon) && <Link to="/inventory">Kho</Link>}
        {(isAdminCoSo || isAdminTong) && <Link to="/reports">Báo cáo</Link>}
        <span className="navbar-user">
          {user.email} <em>({ROLE_LABEL[user.role]})</em>
        </span>
        <button type="button" onClick={handleLogout}>Đăng xuất</button>
      </nav>
    </header>
  )
}