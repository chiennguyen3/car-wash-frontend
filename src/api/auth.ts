import { apiRequest } from './client'
import type { LoginPayload, LoginResponse } from '../types'

export function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: payload,
    auth: false,
  })
}