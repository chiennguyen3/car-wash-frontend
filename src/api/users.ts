import { apiRequest } from './client'
import type { StaffUser, UserCreatePayload, UserStatus } from '../types'

export function fetchUsers() {
  return apiRequest<StaffUser[]>('/users')
}

export function createUser(payload: UserCreatePayload) {
  return apiRequest<StaffUser>('/users', { method: 'POST', body: payload })
}

export function updateUserStatus(id: number, status: UserStatus) {
  return apiRequest<StaffUser>(`/users/${id}/status`, { method: 'PATCH', body: { status } })
}