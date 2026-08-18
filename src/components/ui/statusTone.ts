import type { Tone } from './Badge'
import type { OrderStatus, OrderItemStatus, BranchStatus, UserStatus, TechnicianStatus } from '../../types'

export const ORDER_STATUS_TONE: Record<OrderStatus, Tone> = {
  PENDING: 'neutral',
  IN_PROGRESS: 'info',
  WAITING_PAYMENT: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
}

export const ITEM_STATUS_TONE: Record<OrderItemStatus, Tone> = {
  PENDING: 'neutral',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  DELAYED: 'danger',
}

export const ACTIVE_STATUS_TONE: Record<BranchStatus | UserStatus, Tone> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
}

export const TECHNICIAN_STATUS_TONE: Record<TechnicianStatus, Tone> = {
  ON_DUTY: 'success',
  OFF_DUTY: 'neutral',
}
