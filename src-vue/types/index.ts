/**
 * 可在 React 和 Vue 之间共用的类型定义
 */

// ============ 任务相关 ============

export interface Task {
  id: string
  title: string
  time: string
  tag: string
  tagColor: string
  desc: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
}

export type TaskFilterStatus = 'all' | 'pending' | 'completed'
export type TaskPriority = 'all' | 'high' | 'medium' | 'low'

// ============ 统计相关 ============

export interface StatItem {
  id: string
  label: string
  value: string
  trend?: string
  trendUp?: boolean
  subLabel?: string
  icon: any
  bg: string
  onClick?: () => void
}

export interface StatCardProps {
  label: string
  value: string
  trend?: string
  trendUp?: boolean
  subLabel?: string
  icon: any
  bg: string
  isActive: boolean
}

// ============ 用户相关 ============

export interface User {
  id: string
  name: string
  phone: string
  email?: string
  avatar?: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
}

// ============ 会员相关 ============

export interface Member {
  id: string
  name: string
  phone: string
  membershipLevel: 'basic' | 'standard' | 'premium'
  balance: number
  points: number
  status: 'active' | 'inactive'
  registerDate: string
  lastVisitDate?: string
}

// ============ 财务相关 ============

export interface IncomeItem {
  id: string
  type: 'recharge' | 'course' | 'service' | 'product' | 'card' | 'other'
  typeLabel: string
  amount: number
  memberId: string
  memberName: string
  memberPhone: string
  paymentMethod: 'wechat' | 'alipay' | 'bank' | 'cash' | 'pos'
  paymentMethodLabel: string
  status: 'pending' | 'confirmed' | 'refunded'
  statusLabel: string
  category: string
  salesman?: string
  remark?: string
  createdAt: string
  confirmedAt?: string
}

export interface ExpenseItem {
  id: string
  type: 'inventory' | 'operation' | 'salary' | 'rent' | 'utility' | 'other'
  typeLabel: string
  amount: number
  category: string
  applicant: string
  department: string
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  statusLabel: string
  paymentMethod?: string
  paymentAccount?: string
  remark?: string
  createdAt: string
  approvedAt?: string
  paidAt?: string
}

// ============ 课程相关 ============

export interface Course {
  id: string
  name: string
  type: 'private' | 'group' | 'online'
  description: string
  duration: number
  price: number
  maxParticipants?: number
  instructor: string
  status: 'active' | 'inactive' | 'archived'
}

// ============ 预约相关 ============

export interface Appointment {
  id: string
  memberId: string
  memberName: string
  courseId: string
  courseName: string
  instructor: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
}

// ============ 人力结算相关 ============

export interface SettlementItem {
  id: string
  type: 'coach' | 'doctor' | 'consultant'
  typeLabel: string
  staffId: string
  staffName: string
  amount: number
  period: string
  status: 'pending' | 'calculating' | 'completed'
  statusLabel: string
  details?: any[]
  createdAt: string
  completedAt?: string
}

// ============ 通用类型 ============

export type View = 'dashboard' | 'members' | 'courses' | 'appointments' | 'finance' | 'hr' | 'inventory' | 'reports'

export interface Pagination {
  page: number
  pageSize: number
  total: number
}

export interface TableColumn {
  key: string
  title: string
  width?: number
  sortable?: boolean
  filterable?: boolean
}

export interface FilterOption {
  label: string
  value: string
}

// ============ API 响应类型 ============

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// ============ 表单相关 ============

export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'select' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: FilterOption[]
  rules?: ValidationRule[]
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'min' | 'max' | 'pattern'
  message: string
  value?: any
}

// ============ 通知相关 ============

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
}
