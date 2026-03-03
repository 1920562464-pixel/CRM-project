// 佣金管理相关类型定义

export type CommissionType = 'new_user' | 'renewal' | 'product_sale' | 'referral' | 'bonus'
export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'cancelled'
export type CommissionCategory = 'performance' | 'innovation' | 'teamwork' | 'extra' | 'other'

// 佣金规则
export interface CommissionRule {
  type: CommissionType
  role: string | 'all'
  rate: number
  rateType: 'fixed' | 'percentage'
  conditions?: {
    minAmount?: number
    maxAmount?: number
    requireApproval?: boolean
  }
}

// 佣金记录
export interface Commission {
  id: string
  employeeId: string
  employeeName: string
  employeeRole: 'coach' | 'doctor' | 'consultant' | 'operations' | 'admin'
  type: CommissionType
  category: string

  // 关联信息
  relatedUserId?: string
  relatedUserName?: string
  relatedProductId?: string
  relatedProductName?: string

  // 金额
  amount: number
  rate?: number
  baseAmount?: number

  // 状态
  status: CommissionStatus

  // 时间
  occurredAt: Date
  month: string

  // 审批
  approvedBy?: string
  approvedAt?: Date
  paidBy?: string
  paidAt?: Date

  // 备注
  note?: string
}

// 佣金统计
export interface CommissionStats {
  totalAmount: number
  totalCount: number
  newUserAmount: number
  newUserCount: number
  renewalAmount: number
  renewalCount: number
  productAmount: number
  productRate: number
  byRole: Array<{
    role: string
    roleName: string
    amount: number
    count: number
  }>
}

// 富贵饼
export interface RichBiscuit {
  id: string
  employeeId: string
  employeeName: string
  amount: number
  value: number
  reason: string
  category: CommissionCategory
  issuerId: string
  issuerName: string
  issuedAt: Date
  month: string
  note?: string
}

// 富贵饼统计
export interface RichBiscuitStats {
  totalIssued: number
  totalValue: number
  top1?: {
    id: string
    name: string
    amount: number
  }
  top2?: {
    id: string
    name: string
    amount: number
  }
  top3?: {
    id: string
    name: string
    amount: number
  }
  categoryDistribution: Record<string, number>
}

// 上线服务
export interface OnlineService {
  id: string
  employeeId: string
  userId: string
  userName: string
  date: Date
  type: 'normal' | 'night' | 'weekend' | 'urgent'
  duration: number
  amount: number
}

// 上线服务统计
export interface OnlineServiceStats {
  employeeId: string
  month: string
  services: {
    normal: number
    night: number
    weekend: number
    urgent: number
    total: number
  }
  amounts: {
    normal: number
    night: number
    weekend: number
    urgent: number
    total: number
  }
  details: OnlineService[]
}
