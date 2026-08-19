// Các kiểu dữ liệu khớp chính xác với DTO của backend.

export type RoleName = 'TIEP_DON' | 'THU_NGAN' | 'ADMIN_CO_SO' | 'ADMIN_TONG'

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  email: string
  role: RoleName
  branchId: number | null
}

// Giải mã từ payload JWT (không có endpoint /auth/me ở BE).
export interface CurrentUser {
  email: string
  userId: number
  role: RoleName
  branchId: number | null
}

// ===== Branch =====
export type BranchStatus = 'ACTIVE' | 'INACTIVE'

export interface Branch {
  id: number
  name: string
  address?: string
  phone?: string
  status: BranchStatus
  createdAt: string
}

export interface BranchCreatePayload {
  name: string
  address?: string
  phone?: string
}

export type BranchUpdatePayload = BranchCreatePayload

// ===== User (nhân viên) =====
export type UserStatus = 'ACTIVE' | 'INACTIVE'

export interface StaffUser {
  id: number
  name: string
  phone?: string
  email: string
  role: RoleName
  branchId: number | null
  branchName: string | null
  status: UserStatus
  createdAt: string
}

export interface UserCreatePayload {
  name: string
  phone?: string
  email: string
  password: string
  role: RoleName
  branchId?: number | null
}

// ===== Customer =====
export interface Customer {
  id: number
  customerCode: string
  fullName: string
  phoneNumber: string
  totalPoints?: number
  createdAt: string
}

export interface CustomerCreatePayload {
  fullName: string
  phoneNumber: string
}

// ===== Vehicle =====
export type VehicleType = 'MOTORBIKE' | 'CAR_4_SEATS' | 'CAR_7_SEATS' | 'TRUCK'

export const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  MOTORBIKE: 'Xe máy',
  CAR_4_SEATS: 'Ô tô 4-5 chỗ',
  CAR_7_SEATS: 'Ô tô 7 chỗ / SUV',
  TRUCK: 'Xe tải nhỏ / Bán tải',
}

export interface Vehicle {
  id: number
  licensePlate: string
  vehicleType: VehicleType
  brand?: string
  modelName?: string
  customerId: number
  customerName: string
  createdAt: string
}

export interface VehicleCreatePayload {
  licensePlate: string
  vehicleType: VehicleType
  brand?: string
  modelName?: string
  customerId: number
}

// ===== WashService (dịch vụ) =====
export interface ServicePriceItem {
  vehicleType: VehicleType
  price: number
}

export interface WashService {
  id: number
  name: string
  description?: string
  estTimeMinutes: number
  createdAt: string
  prices: ServicePriceItem[]
}

export interface ServiceCreatePayload {
  name: string
  description?: string
  estTimeMinutes: number
  prices: ServicePriceItem[]
}

export type ServiceUpdatePayload = ServiceCreatePayload

// ===== Technician =====
export type TechnicianStatus = 'ON_DUTY' | 'OFF_DUTY'

export interface Technician {
  id: number
  name: string
  shiftStart?: string | null
  shiftEnd?: string | null
  status: TechnicianStatus
}

export interface TechnicianCreatePayload {
  name: string
}

export type TechnicianUpdatePayload = TechnicianCreatePayload

export interface ShiftUpdatePayload {
  shiftStart: string
  shiftEnd: string
}

// ===== Order =====
export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'WAITING_PAYMENT' | 'COMPLETED' | 'CANCELLED'
export type OrderItemStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED'

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Mới tạo',
  IN_PROGRESS: 'Đang sửa',
  WAITING_PAYMENT: 'Chờ thanh toán',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
}

export const ORDER_ITEM_STATUS_LABEL: Record<OrderItemStatus, string> = {
  PENDING: 'Chờ xử lý',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  DELAYED: 'Trễ hẹn',
}

export interface OrderDetail {
  id: number
  serviceId: number
  serviceName: string
  price: number
  estTimeMinutes: number
  technicianId: number | null
  technicianName: string | null
  status: OrderItemStatus
  startedAt: string | null
  estimatedEndAt: string | null
  actualEndAt: string | null
}

export interface Order {
  id: number
  customerId: number
  customerName: string
  vehicleId: number
  licensePlate: string
  status: OrderStatus
  totalAmount: number
  createdAt: string
  details: OrderDetail[]
}

export interface OrderCreatePayload {
  customerId: number
  vehicleId: number
  serviceIds: number[]
}

// ===== Invoice =====
export type PaymentMethod = 'TIEN_MAT' | 'CHUYEN_KHOAN' | 'THE'

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  TIEN_MAT: 'Tiền mặt',
  CHUYEN_KHOAN: 'Chuyển khoản',
  THE: 'Thẻ',
}

export interface InvoiceItem {
  serviceName: string
  price: number
}

export interface Invoice {
  id: number
  orderId: number
  customerId: number
  customerName: string
  customerPhone: string
  licensePlate: string
  cashierId: number
  cashierName: string
  branchId: number
  branchName: string
  branchAddress: string
  branchPhone: string
  subtotal: number
  pointsUsed: number
  pointsDiscount: number
  total: number
  pointsEarned: number
  paymentMethod: PaymentMethod
  paidAt: string
  items: InvoiceItem[]
}

export interface InvoiceCreatePayload {
  orderId: number
  paymentMethod: PaymentMethod
  pointsToUse?: number
}

// ===== Inventory =====
export interface InventoryItem {
  id: number
  name: string
  quantity: number
  unitPrice: number
  minQuantityAlert: number
  lowStock: boolean
}

export interface InventoryCreatePayload {
  name: string
  quantity: number
  unitPrice: number
  minQuantityAlert: number
}

export interface InventoryTransaction {
  id: number
  inventoryId: number
  inventoryName: string
  orderId: number | null
  quantity: number
  type: 'NHAP' | 'XUAT'
  createdByName: string
  createdAt: string
  quantityAfter: number
}

// ===== Reports =====
export interface DailyRevenueItem {
  date: string
  revenue: number
  invoiceCount: number
}

export interface RevenueReport {
  totalRevenue: number
  totalInvoices: number
  dailyBreakdown: DailyRevenueItem[]
}

export interface ServiceRevenueItem {
  serviceId: number
  serviceName: string
  totalRevenue: number
  timesUsed: number
}

export interface TechnicianPerformanceItem {
  technicianId: number
  technicianName: string
  completedCount: number
  avgEstimatedMinutes: number
  avgActualMinutes: number
  actualVsEstimatedPercent: number
}

export interface BranchRevenueItem {
  branchId: number
  branchName: string
  totalRevenue: number
  invoiceCount: number
}