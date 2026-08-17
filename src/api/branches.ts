import { apiRequest } from './client'
import type { Branch, BranchCreatePayload, BranchStatus } from '../types'

export function fetchBranches() {
  return apiRequest<Branch[]>('/branches')
}

export function createBranch(payload: BranchCreatePayload) {
  return apiRequest<Branch>('/branches', { method: 'POST', body: payload })
}

export function updateBranchStatus(id: number, status: BranchStatus) {
  return apiRequest<Branch>(`/branches/${id}/status`, { method: 'PATCH', body: { status } })
}