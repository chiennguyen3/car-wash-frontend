import { apiRequest } from './client'
import type { Branch, BranchCreatePayload, BranchUpdatePayload, BranchStatus } from '../types'

export function fetchBranches() {
  return apiRequest<Branch[]>('/branches')
}

export function createBranch(payload: BranchCreatePayload) {
  return apiRequest<Branch>('/branches', { method: 'POST', body: payload })
}

export function updateBranch(id: number, payload: BranchUpdatePayload) {
  return apiRequest<Branch>(`/branches/${id}`, { method: 'PUT', body: payload })
}

export function deleteBranch(id: number) {
  return apiRequest<void>(`/branches/${id}`, { method: 'DELETE' })
}

export function updateBranchStatus(id: number, status: BranchStatus) {
  return apiRequest<Branch>(`/branches/${id}/status`, { method: 'PATCH', body: { status } })
}
