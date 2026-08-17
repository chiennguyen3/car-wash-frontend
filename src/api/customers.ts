import { apiRequest } from './client'
import type { Customer, CustomerCreatePayload } from '../types'

export function fetchCustomers() {
  return apiRequest<Customer[]>('/customers')
}

export function createCustomer(payload: CustomerCreatePayload) {
  return apiRequest<Customer>('/customers', { method: 'POST', body: payload })
}