import { apiRequest } from './client'
import type { Service } from '../types'

export function fetchServices() {
  return apiRequest<Service[]>('/services', { auth: false })
}

export function fetchServiceById(id: number) {
  return apiRequest<Service>(`/services/${id}`, { auth: false })
}
