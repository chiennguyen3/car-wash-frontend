// BE không có endpoint /auth/me - thông tin user (role, branchId, userId)
// nằm sẵn trong payload JWT, chỉ cần giải mã phần giữa của token (base64url).

import type { CurrentUser } from '../types'

export function decodeJwt(token: string): CurrentUser | null {
  try {
    const payload = token.split('.')[1]
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    const decoded = JSON.parse(json)
    return {
      email: decoded.sub,
      userId: decoded.userId,
      role: decoded.role,
      branchId: decoded.branchId ?? null,
    }
  } catch {
    return null
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded.exp * 1000 < Date.now()
  } catch {
    return true
  }
}