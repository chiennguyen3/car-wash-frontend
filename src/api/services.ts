import { apiRequest } from './client'
import type { WashService, ServiceCreatePayload, ServiceUpdatePayload } from '../types'

export function fetchWashServices() {
  return apiRequest<WashService[]>('/services')
}

export function createWashService(payload: ServiceCreatePayload) {
  return apiRequest<WashService>('/services', { method: 'POST', body: payload })
}

export function updateWashService(id: number, payload: ServiceUpdatePayload) {
  return apiRequest<WashService>(`/services/${id}`, { method: 'PUT', body: payload })
}

export function deleteWashService(id: number) {
  return apiRequest<void>(`/services/${id}`, { method: 'DELETE' })
}
