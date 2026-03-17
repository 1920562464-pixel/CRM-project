import { ref, computed } from 'vue'
import type { Commission, CommissionRule, CommissionStats, CommissionType, DealType, EmployeeRole, ProductKey } from '../types/commission'
import { useHRManagement } from './useHRManagement'

// 销转提成配置
const SALES_COMMISSION_CONFIG = {
  offline: {
    doctor: 0.05,      // 医生5%
    sales: 0.05,       // 销售5%（包括教练作为销售）
    serviceFee: 200    // 市场人员服务费200元
  },
  online: {
    sales1: 0.05,      // 销售主要提成5%（包括教练作为销售）
    doctor: 0.03,      // 医生提成3%
    sales2: 0.02       // 销售辅助提成2%（包括教练作为销售）
  }
}

// 产品/服务价格配置（规范化佣金添加）
export const PRODUCT_PRICE_CONFIG = {
  // 线下产品/服务
  offline: {
    'L1基础管理': { price: 4980, name: 'L1基础管理' },
    'L1进阶管理': { price: 7980, name: 'L1进阶管理' },
    'L2标准管理': { price: 12800, name: 'L2标准管理' },
    'L2高级管理': { price: 19800, name: 'L2高级管理' },
    'L3尊享管理': { price: 29800, name: 'L3尊享管理' },
    '年度VIP管理': { price: 39800, name: '年度VIP管理' },
    '家庭套餐': { price: 49800, name: '家庭套餐' },
  },
  // 线上产品/服务
  online: {
    '线上基础版': { price: 2980, name: '线上基础版' },
    '线上标准版': { price: 4980, name: '线上标准版' },
    '线上高级版': { price: 7980, name: '线上高级版' },
    '线上年度版': { price: 12800, name: '线上年度版' },
    '线上家庭版': { price: 19800, name: '线上家庭版' },
  }
} as const

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
      admin: '管理员',
      sales: '销售',
      market_staff: '市场人员'
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

  // ========== 销转提成功能 ==========

  // 添加销转提成记录（基于产品类型 - 推荐使用）
  const addSalesCommissionByProduct = (
    transactionId: string,
    clientId: string,
    clientName: string,
    dealType: DealType,
    productKey: ProductKey,
    transactionDate: string,
    doctorId?: string,
    salesId?: string
  ): Commission[] => {
    // 根据成交类型获取产品价格
    const productConfig = PRODUCT_PRICE_CONFIG[dealType][productKey as keyof typeof PRODUCT_PRICE_CONFIG[typeof dealType]]
    const transactionAmount = productConfig.price

    // 调用原有的佣金添加函数
    return addSalesCommission(
      transactionId,
      clientId,
      clientName,
      dealType,
      transactionAmount,
      transactionDate,
      doctorId,
      salesId
    )
  }

  // 添加销转提成记录（基于自定义金额）
  const addSalesCommission = (
    transactionId: string,
    clientId: string,
    clientName: string,
    dealType: DealType,
    transactionAmount: number,
    transactionDate: string,
    doctorId?: string,
    salesId?: string
  ): Commission[] => {
    const { getEmployeeById } = useHRManagement()
    const records: Commission[] = []
    const now = new Date()
    const currentPeriod = transactionDate.substring(0, 7)

    if (dealType === 'offline') {
      // 线下成交提成10%：医生5%，销售5%，服务费200元

      // 医生提成5%
      if (doctorId) {
        const doctor = getEmployeeById(doctorId)
        if (doctor) {
          const doctorCommission = transactionAmount * SALES_COMMISSION_CONFIG.offline.doctor
          const doctorRecord: Commission = {
            id: `commission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            employeeId: doctorId,
            employeeName: doctor.name,
            employeeRole: 'doctor',
            type: 'offline_deal',
            category: '销转提成',
            relatedUserId: clientId,
            relatedUserName: clientName,
            amount: Math.round(doctorCommission),
            rate: SALES_COMMISSION_CONFIG.offline.doctor,
            baseAmount: transactionAmount,
            status: 'pending',
            occurredAt: now,
            month: currentPeriod,
            dealType: 'offline',
            transactionId,
            transactionAmount,
            note: `线下成交提成（5%）- 金额：${transactionAmount}元`
          }
          records.push(doctorRecord)
          commissions.value.unshift(doctorRecord)
        }
      }

      // 销售提成5%（支持教练或销售角色）
      if (salesId) {
        const sales = getEmployeeById(salesId)
        if (sales) {
          const salesCommission = transactionAmount * SALES_COMMISSION_CONFIG.offline.sales
          // 确定销售角色：如果是教练，角色为coach；否则为sales
          const salesRole: EmployeeRole = sales.role === 'coach' ? 'coach' : 'sales'
          const salesRecord: Commission = {
            id: `commission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            employeeId: salesId,
            employeeName: sales.name,
            employeeRole: salesRole,
            type: 'offline_deal',
            category: '销转提成',
            relatedUserId: clientId,
            relatedUserName: clientName,
            amount: Math.round(salesCommission),
            rate: SALES_COMMISSION_CONFIG.offline.sales,
            baseAmount: transactionAmount,
            status: 'pending',
            occurredAt: now,
            month: currentPeriod,
            dealType: 'offline',
            transactionId,
            transactionAmount,
            note: `线下成交提成（5%）- 金额：${transactionAmount}元`
          }
          records.push(salesRecord)
          commissions.value.unshift(salesRecord)
        }
      }

      // 市场人员服务费200元
      const serviceFeeRecord: Commission = {
        id: `commission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        employeeId: 'market_staff',
        employeeName: '市场人员',
        employeeRole: 'market_staff',
        type: 'service_fee',
        category: '销转提成',
        relatedUserId: clientId,
        relatedUserName: clientName,
        amount: SALES_COMMISSION_CONFIG.offline.serviceFee,
        status: 'pending',
        occurredAt: now,
        month: currentPeriod,
        dealType: 'offline',
        transactionId,
        transactionAmount,
        note: `成交客户市场人员服务费`
      }
      records.push(serviceFeeRecord)
      commissions.value.unshift(serviceFeeRecord)

    } else if (dealType === 'online') {
      // 线上成交提成10%：销售5%，医生3%，销售2%

      // 销售主要提成5%（支持教练或销售角色）
      if (salesId) {
        const sales = getEmployeeById(salesId)
        if (sales) {
          const salesCommission1 = transactionAmount * SALES_COMMISSION_CONFIG.online.sales1
          // 确定销售角色：如果是教练，角色为coach；否则为sales
          const salesRole: EmployeeRole = sales.role === 'coach' ? 'coach' : 'sales'
          const salesRecord1: Commission = {
            id: `commission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            employeeId: salesId,
            employeeName: sales.name,
            employeeRole: salesRole,
            type: 'online_deal',
            category: '销转提成',
            relatedUserId: clientId,
            relatedUserName: clientName,
            amount: Math.round(salesCommission1),
            rate: SALES_COMMISSION_CONFIG.online.sales1,
            baseAmount: transactionAmount,
            status: 'pending',
            occurredAt: now,
            month: currentPeriod,
            dealType: 'online',
            transactionId,
            transactionAmount,
            note: `线上成交提成-销售主要（5%）- 金额：${transactionAmount}元`
          }
          records.push(salesRecord1)
          commissions.value.unshift(salesRecord1)
        }
      }

      // 医生提成3%
      if (doctorId) {
        const doctor = getEmployeeById(doctorId)
        if (doctor) {
          const doctorCommission = transactionAmount * SALES_COMMISSION_CONFIG.online.doctor
          const doctorRecord: Commission = {
            id: `commission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            employeeId: doctorId,
            employeeName: doctor.name,
            employeeRole: 'doctor',
            type: 'online_deal',
            category: '销转提成',
            relatedUserId: clientId,
            relatedUserName: clientName,
            amount: Math.round(doctorCommission),
            rate: SALES_COMMISSION_CONFIG.online.doctor,
            baseAmount: transactionAmount,
            status: 'pending',
            occurredAt: now,
            month: currentPeriod,
            dealType: 'online',
            transactionId,
            transactionAmount,
            note: `线上成交提成（3%）- 金额：${transactionAmount}元`
          }
          records.push(doctorRecord)
          commissions.value.unshift(doctorRecord)
        }
      }

      // 销售辅助提成2%（支持教练或销售角色）
      if (salesId) {
        const sales = getEmployeeById(salesId)
        if (sales) {
          const salesCommission2 = transactionAmount * SALES_COMMISSION_CONFIG.online.sales2
          // 确定销售角色：如果是教练，角色为coach；否则为sales
          const salesRole: EmployeeRole = sales.role === 'coach' ? 'coach' : 'sales'
          const salesRecord2: Commission = {
            id: `commission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            employeeId: salesId,
            employeeName: sales.name,
            employeeRole: salesRole,
            type: 'online_deal',
            category: '销转提成',
            relatedUserId: clientId,
            relatedUserName: clientName,
            amount: Math.round(salesCommission2),
            rate: SALES_COMMISSION_CONFIG.online.sales2,
            baseAmount: transactionAmount,
            status: 'pending',
            occurredAt: now,
            month: currentPeriod,
            dealType: 'online',
            transactionId,
            transactionAmount,
            note: `线上成交提成-销售辅助（2%）- 金额：${transactionAmount}元`
          }
          records.push(salesRecord2)
          commissions.value.unshift(salesRecord2)
        }
      }
    }

    return records
  }

  // 获取销转提成配置
  const getSalesCommissionConfig = () => SALES_COMMISSION_CONFIG

  // 获取产品价格配置
  const getProductPriceConfig = () => PRODUCT_PRICE_CONFIG

  // 获取指定产品的价格
  const getProductPrice = (dealType: DealType, productKey: ProductKey): number => {
    return PRODUCT_PRICE_CONFIG[dealType][productKey as keyof typeof PRODUCT_PRICE_CONFIG[typeof dealType]].price
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
    deleteCommission,

    // 销转提成
    addSalesCommission,          // 基于自定义金额（灵活性）
    addSalesCommissionByProduct, // 基于产品类型（推荐使用，规范化）
    getSalesCommissionConfig,
    getProductPriceConfig,
    getProductPrice
  }
}
