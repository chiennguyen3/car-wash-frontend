import { apiRequest } from './client'
import type { Invoice, InvoiceCreatePayload } from '../types'

export function createInvoice(payload: InvoiceCreatePayload) {
  return apiRequest<Invoice>('/invoices', { method: 'POST', body: payload })
}

export function fetchInvoiceById(id: number) {
  return apiRequest<Invoice>(`/invoices/${id}`)
}

export function fetchInvoices(from: string, to: string) {
  return apiRequest<Invoice[]>('/invoices', { params: { from, to } })
}