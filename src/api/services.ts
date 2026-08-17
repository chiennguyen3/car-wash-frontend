import { apiRequest } from './client'
import type { WashService, ServiceCreatePayload } from '../types'

export function fetchWashServices() {
  return apiRequest<WashService[]>('/services')
}

export function createWashService(payload: ServiceCreatePayload) {
  return apiRequest<WashService>('/services', { method: 'POST', body: payload })
}