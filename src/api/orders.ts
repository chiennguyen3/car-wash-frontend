import { apiRequest } from './client'
import type { Order, OrderCreatePayload, OrderStatus, OrderDetail, OrderItemStatus } from '../types'

export function fetchOrders() {
  return apiRequest<Order[]>('/orders')
}

export function fetchOrderById(id: number) {
  return apiRequest<Order>(`/orders/${id}`)
}

export function createOrder(payload: OrderCreatePayload) {
  return apiRequest<Order>('/orders', { method: 'POST', body: payload })
}

export function updateOrderStatus(id: number, status: OrderStatus) {
  return apiRequest<Order>(`/orders/${id}/status`, { method: 'PATCH', body: { status } })
}

export function assignTechnician(orderId: number, itemId: number, technicianId?: number) {
  return apiRequest<OrderDetail>(`/orders/${orderId}/items/${itemId}/assign-technician`, {
    method: 'POST',
    body: technicianId ? { technicianId } : {},
  })
}

export function updateItemStatus(orderId: number, itemId: number, status: OrderItemStatus) {
  return apiRequest<OrderDetail>(`/orders/${orderId}/items/${itemId}/status`, {
    method: 'PATCH',
    body: { status },
  })
}