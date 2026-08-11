import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { LoginPayload, RegisterPayload, User } from '../types'
import * as authApi from '../api/auth'
import { clearToken, getToken, setToken } from '../api/client'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Nếu đã có token lưu sẵn, thử lấy lại thông tin user (auto-login)
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    authApi
      .fetchCurrentUser()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  async function login(payload: LoginPayload) {
    const res = await authApi.login(payload)
    setToken(res.token)
    setUser(res.user)
  }

  async function register(payload: RegisterPayload) {
    const res = await authApi.register(payload)
    setToken(res.token)
    setUser(res.user)
  }

  function logout() {
    clearToken()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>')
  return ctx
}
