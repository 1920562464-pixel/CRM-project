// 佣金管理相关类型定义

export type CommissionType =
  | 'new_user'
  | 'renewal'
  | 'product_sale'
  | 'referral'
  | 'bonus'
  | 'offline_deal'  // 线下成交提成
  | 'online_deal'   // 线上成交提成
  | 'service_fee'   // 服务费

export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'cancelled'
export type CommissionCategory = 'performance' | 'innovation' | 'teamwork' | 'extra' | 'other'

// 销转提成类型
export type DealType = 'offline' | 'online'

// 产品类型（用于规范化佣金添加）
export type ProductKey =
  // 线下产品
  | 'L1基础管理'
  | 'L1进阶管理'
  | 'L2标准管理'
  | 'L2高级管理'
  | 'L3尊享管理'
  | '年度VIP管理'
  | '家庭套餐'
  // 线上产品
  | '线上基础版'
  | '线上标准版'
  | '线上高级版'
  | '线上年度版'
  | '线上家庭版'

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

// 员工角色类型（包含销售角色）
export type EmployeeRole = 'coach' | 'doctor' | 'consultant' | 'operations' | 'admin' | 'sales' | 'market_staff'

// 佣金记录
export interface Commission {
  id: string
  employeeId: string
  employeeName: string
  employeeRole: EmployeeRole
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

  // 销转提成相关
  dealType?: DealType  // 成交类型（线上/线下）
  transactionId?: string  // 交易ID
  transactionAmount?: number  // 成交金额
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
