import { apiRequest } from './client'
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types'

// Chỉnh lại endpoint (/auth/login, /auth/register, /auth/me) cho khớp với BE của bạn.

export function login(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: payload,
    auth: false,
  })
}

export function fetchCurrentUser() {
  return apiRequest<User>('/auth/me')
}
