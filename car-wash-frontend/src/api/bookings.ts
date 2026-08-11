import { apiRequest } from './client'
import type { Booking, CreateBookingPayload } from '../types'

export function createBooking(payload: CreateBookingPayload) {
  return apiRequest<Booking>('/bookings', {
    method: 'POST',
    body: payload,
  })
}

export function fetchMyBookings() {
  return apiRequest<Booking[]>('/bookings/me')
}

export function cancelBooking(id: number) {
  return apiRequest<void>(`/bookings/${id}`, { method: 'DELETE' })
}
