import { apiRequest } from './client'
import type { Vehicle, VehicleCreatePayload } from '../types'

export function fetchVehiclesByCustomer(customerId: number) {
  return apiRequest<Vehicle[]>(`/vehicles/customer/${customerId}`)
}

export function createVehicle(payload: VehicleCreatePayload) {
  return apiRequest<Vehicle>('/vehicles', { method: 'POST', body: payload })
}