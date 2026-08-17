import { apiRequest } from './client'
import type { InventoryItem, InventoryCreatePayload, InventoryTransaction } from '../types'

export function fetchInventory() {
  return apiRequest<InventoryItem[]>('/inventory')
}

export function createInventoryItem(payload: InventoryCreatePayload) {
  return apiRequest<InventoryItem>('/inventory', { method: 'POST', body: payload })
}

export function stockIn(id: number, quantity: number) {
  return apiRequest<InventoryTransaction>(`/inventory/${id}/stock-in`, {
    method: 'POST',
    body: { quantity },
  })
}

export function stockOut(id: number, quantity: number, orderId?: number) {
  return apiRequest<InventoryTransaction>(`/inventory/${id}/stock-out`, {
    method: 'POST',
    body: { quantity, orderId },
  })
}

export function fetchInventoryTransactions(id: number) {
  return apiRequest<InventoryTransaction[]>(`/inventory/${id}/transactions`)
}