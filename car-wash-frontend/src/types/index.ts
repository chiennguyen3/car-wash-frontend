// Các kiểu dữ liệu dùng chung trong app.
// Chỉnh lại field cho khớp với response thật của BE khi bạn build API xong.

export interface User {
  id: number
  name: string
  email: string
  phone?: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Service {
  id: number
  name: string
  description: string
  price: number
  durationMinutes: number
  imageUrl?: string
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface Booking {
  id: number
  serviceId: number
  serviceName?: string
  vehiclePlate: string
  scheduledAt: string // ISO datetime
  status: BookingStatus
  note?: string
}

export interface CreateBookingPayload {
  serviceId: number
  vehiclePlate: string
  scheduledAt: string
  note?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  phone?: string
  password: string
}
