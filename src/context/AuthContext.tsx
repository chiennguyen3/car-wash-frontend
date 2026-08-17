import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { LoginPayload, CurrentUser } from '../types'
import * as authApi from '../api/auth'
import { clearToken, getToken, setToken } from '../api/client'
import { decodeJwt, isTokenExpired } from '../utils/jwt'

interface AuthContextValue {
  user: CurrentUser | null
  loading: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function loadUserFromStoredToken(): CurrentUser | null {
  const token = getToken()
  if (!token || isTokenExpired(token)) {
    clearToken()
    return null
  }
  return decodeJwt(token)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Không cần loading async - toàn bộ thông tin user lấy trực tiếp từ JWT
  // đã lưu trong sessionStorage, không phải gọi API /auth/me (BE không có).
  const [user, setUser] = useState<CurrentUser | null>(loadUserFromStoredToken)

  async function login(payload: LoginPayload) {
    const res = await authApi.login(payload)
    setToken(res.token)
    const decoded = decodeJwt(res.token)
    setUser(decoded)
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading: false, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>')
  return ctx
}