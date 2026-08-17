import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { RoleName } from '../types'

interface RoleRouteProps {
  allowedRoles: RoleName[]
  children: ReactNode
}

// Ẩn/chặn theo role - tương ứng phía FE với @PreAuthorize("hasAnyRole(...)") ở BE.
export default function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { user } = useAuth()
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }
  return <>{children}</>
}