import { ref, computed } from 'vue'
import type { Commission, CommissionRule, CommissionStats, CommissionType } from '../types/commission'

// 佣金规则配置
const COMMISSION_RULES: CommissionRule[] = [
  // 新用户签约佣金
  {
    type: 'new_user',
    role: 'coach',
    rate: 300,
    rateType: 'fixed'
  },
  {
    type: 'new_user',
    role: 'doctor',
    rate: 200,
    rateType: 'fixed'
  },
  {
    type: 'new_user',
    role: 'consultant',
    rate: 500,
    rateType: 'fixed'
  },
  {
    type: 'new_user',
    role: 'operations',
    rate: 200,
    rateType: 'fixed'
  },

  // 用户续约佣金
  {
    type: 'renewal',
    role: 'coach',
    rate: 80,
    rateType: 'fixed'
  },
  {
    type: 'renewal',
    role: 'doctor',
    rate: 50,
    rateType: 'fixed'
  },
  {
    type: 'renewal',
    role: 'consultant',
    rate: 200,
    rateType: 'fixed'
  },

  // 产品销售佣金
  {
    type: 'product_sale',
    role: 'coach',
    rate: 0.05,
    rateType: 'percentage'
  },
  {
    type: 'product_sale',
    role: 'doctor',
    rate: 0.03,
    rateType: 'percentage'
  },
  {
    type: 'product_sale',
    role: 'consultant',
    rate: 0.10,
    rateType: 'percentage'
  },
  {
    type: 'product_sale',
    role: 'operations',
    rate: 0.05,
    rateType: 'percentage'
  },

  // 推荐奖励
  {
    type: 'referral',
    role: 'all',
    rate: 500,
    rateType: 'fixed',
    conditions: {
      requireApproval: true
    }
  }
]

// 模拟佣金数据
const commissions = ref<Commission[]>([
  {
    id: 'c001',
    employeeId: '1',
    employeeName: '张教练',
    employeeRole: 'coach',
    type: 'new_user',
    category: '签约佣金',
    relatedUserId: 'U001',
    relatedUserName: '王小红',
    amount: 300,
    status: 'paid',
    occurredAt: new Date('2025-02-25'),
    month: '2025-02',
    approvedBy: 'admin',
    approvedAt: new Date('2025-02-25'),
    paidBy: 'finance',
    paidAt: new Date('2025-02-26')
  },
  {
    id: 'c002',
    employeeId: '1',
    employeeName: '张教练',
    employeeRole: 'coach',
    type: 'renewal',
    category: '续约佣金',
    relatedUserId: 'U002',
    relatedUserName: '李大明',
    amount: 80,
    status: 'approved',
    occurredAt: new Date('2025-02-24'),
    month: '2025-02',
    approvedBy: 'admin',
    approvedAt: new Date('2025-02-24')
  },
  {
    id: 'c003',
    employeeId: '1',
    employeeName: '张教练',
    employeeRole: 'coach',
    type: 'product_sale',
    category: '销售佣金',
    relatedProductId: 'P001',
    relatedProductName: '鱼油胶囊',
    amount: 85,
    rate: 0.05,
    baseAmount: 1700,
    status: 'pending',
    occurredAt: new Date('2025-02-23'),
    month: '2025-02'
  }
])

export function useCommission() {
  // 计算佣金
  const calculateCommission = (
    type: CommissionType,
    employeeRole: string,
    baseAmount?: number
  ): number => {
    const rule = COMMISSION_RULES.find(
      r => r.type === type && (r.role === employeeRole || r.role === 'all')
    )

    if (!rule) return 0

    if (rule.rateType === 'fixed') {
      return rule.rate
    } else {
      return (baseAmount || 0) * rule.rate
    }
  }

  // 获取佣金规则
  const getCommissionRules = () => COMMISSION_RULES

  // 创建佣金记录
  const createCommission = (data: Omit<Commission, 'id' | 'month' | 'occurredAt'>): Commission => {
    const newCommission: Commission = {
      ...data,
      id: `c${Date.now()}`,
      month: new Date().toISOString().slice(0, 7),
      occurredAt: new Date()
    }

    commissions.value.unshift(newCommission)
    return newCommission
  }

  // 审批佣金
  const approveCommission = (id: string, approverId: string): boolean => {
    const commission = commissions.value.find(c => c.id === id)
    if (!commission || commission.status !== 'pending') return false

    commission.status = 'approved'
    commission.approvedBy = approverId
    commission.approvedAt = new Date()

    return true
  }

  // 批量审批
  const batchApproveCommissions = (ids: string[], approverId: string): number => {
    let approved = 0
    ids.forEach(id => {
      if (approveCommission(id, approverId)) {
        approved++
      }
    })
    return approved
  }

  // 支付佣金
  const payCommission = (id: string, payerId: string): boolean => {
    const commission = commissions.value.find(c => c.id === id)
    if (!commission || commission.status !== 'approved') return false

    commission.status = 'paid'
    commission.paidBy = payerId
    commission.paidAt = new Date()

    return true
  }

  // 批量支付
  const batchPayCommissions = (ids: string[], payerId: string): number => {
    let paid = 0
    ids.forEach(id => {
      if (payCommission(id, payerId)) {
        paid++
      }
    })
    return paid
  }

  // 获取员工佣金
  const getEmployeeCommissions = (employeeId: string, month?: string): Commission[] => {
    return commissions.value.filter(
      c => c.employeeId === employeeId && (!month || c.month === month)
    )
  }

  // 获取月份佣金
  const getMonthCommissions = (month: string): Commission[] => {
    return commissions.value.filter(c => c.month === month)
  }

  // 佣金统计
  const getCommissionStats = (month: string): CommissionStats => {
    const monthCommissions = getMonthCommissions(month)

    const stats: CommissionStats = {
      totalAmount: 0,
      totalCount: monthCommissions.length,
      newUserAmount: 0,
      newUserCount: 0,
      renewalAmount: 0,
      renewalCount: 0,
      productAmount: 0,
      productRate: 0.05,
      referralAmount: 0,
      referralCount: 0,
      byRole: []
    }

    // 按角色统计
    const roleMap = new Map<string, { amount: number; count: number }>()

    monthCommissions.forEach(c => {
      stats.totalAmount += c.amount

      if (c.type === 'new_user') {
        stats.newUserAmount += c.amount
        stats.newUserCount++
      } else if (c.type === 'renewal') {
        stats.renewalAmount += c.amount
        stats.renewalCount++
      } else if (c.type === 'product_sale') {
        stats.productAmount += c.amount
      } else if (c.type === 'referral') {
        stats.referralAmount += c.amount
        stats.referralCount++
      }

      // 按角色统计
      if (!roleMap.has(c.employeeRole)) {
        roleMap.set(c.employeeRole, { amount: 0, count: 0 })
      }
      const roleStat = roleMap.get(c.employeeRole)!
      roleStat.amount += c.amount
      roleStat.count++
    })

    // 转换角色统计
    const roleNames: Record<string, string> = {
      coach: '教练',
      doctor: '医生',
      consultant: '顾问',
      operations: '运营',
      admin: '管理员'
    }

    stats.byRole = Array.from(roleMap.entries()).map(([role, data]) => ({
      role,
      roleName: roleNames[role] || role,
      ...data
    }))

    return stats
  }

  // 删除佣金
  const deleteCommission = (id: string): boolean => {
    const index = commissions.value.findIndex(c => c.id === id)
    if (index === -1) return false

    commissions.value.splice(index, 1)
    return true
  }

  return {
    // 数据
    commissions,

    // 方法
    calculateCommission,
    getCommissionRules,
    createCommission,
    approveCommission,
    batchApproveCommissions,
    payCommission,
    batchPayCommissions,
    getEmployeeCommissions,
    getMonthCommissions,
    getCommissionStats,
    deleteCommission
  }
}
