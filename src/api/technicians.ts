import { apiRequest } from './client'
import type { Technician, TechnicianCreatePayload, ShiftUpdatePayload } from '../types'

export function fetchTechnicians() {
  return apiRequest<Technician[]>('/technicians')
}

export function createTechnician(payload: TechnicianCreatePayload) {
  return apiRequest<Technician>('/technicians', { method: 'POST', body: payload })
}

export function setTechnicianShift(id: number, payload: ShiftUpdatePayload) {
  return apiRequest<Technician>(`/technicians/${id}/shift`, { method: 'PATCH', body: payload })
}

export function setTechnicianOffDuty(id: number) {
  return apiRequest<Technician>(`/technicians/${id}/off-duty`, { method: 'PATCH' })
}