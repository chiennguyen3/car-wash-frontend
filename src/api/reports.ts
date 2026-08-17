import { apiRequest } from './client'
import type {
  RevenueReport,
  ServiceRevenueItem,
  TechnicianPerformanceItem,
  BranchRevenueItem,
} from '../types'

export function fetchRevenueReport(from: string, to: string) {
  return apiRequest<RevenueReport>('/reports/revenue', { params: { from, to } })
}

export function fetchServiceRevenue(from: string, to: string) {
  return apiRequest<ServiceRevenueItem[]>('/reports/services', { params: { from, to } })
}

export function fetchTechnicianPerformance(from: string, to: string) {
  return apiRequest<TechnicianPerformanceItem[]>('/reports/technicians', { params: { from, to } })
}

export function fetchBranchComparison(from: string, to: string) {
  return apiRequest<BranchRevenueItem[]>('/reports/branches', { params: { from, to } })
}