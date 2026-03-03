// 工资条相关类型定义

export type SalaryStatus = 'draft' | 'pending' | 'approved' | 'paid' | 'cancelled'
export type ServiceType = 'basic' | 'deep'

// 工资条
export interface SalarySlip {
  id: string
  employeeId: string
  employeeName: string
  department: string
  position: string
  month: string              // YYYY-MM
  schemeId: string          // 薪资方案ID

  // 收入
  income: {
    baseSalary: number
    positionSalary: number
    performanceSalary: number
    senioritySalary: number
    commission: {
      newUserCount: number
      newUserAmount: number
      oldUserCount: number
      oldUserAmount: number
      totalAmount?: number  // 佣金总额
      onlineServices: {
        count: number
        normalRate: number
        nightRate: number
        weekendRate: number
        urgentRate: number
        totalAmount: number
      }
      richBiscuits: {
        amount: number
        value: number
        details: Array<{
          id: string
          amount: number
          reason: string
          category: string
          issuedAt: Date
        }>
      }
      productSales: number
      productCommission: number
    }
    allowances: {
      traffic: number
      communication: number
      meal: number
      housing: number
    }
    bonus: {
      monthly: number
      quarterly: number
      yearly: number
      special: number
    }
  }

  // 扣款
  deductions: {
    socialInsurance: {
      pension: number
      medical: number
      unemployment: number
      housingFund: number
    }
    attendance: {
      late: number
      earlyLeave: number
      personalLeave: number
      sickLeave: number
    }
    tax: number
  }

  // 汇总
  summary: {
    grossSalary: number
    totalDeductions: number
    netSalary: number
  }

  // 状态
  status: SalaryStatus

  // 备注
  notes: string
  attachments: string[]

  // 时间戳
  createdAt: Date
  approvedAt?: Date
  paidAt?: Date

  // 审批信息
  approvedBy?: string
  paidBy?: string
}

// 薪资方案
export interface SalaryScheme {
  id: string
  name: string
  type: 'coach' | 'doctor' | 'consultant'
  baseSalary?: number
  commissionRules: {
    newUserRate: number
    oldUserRate: number
    doctorOnlineRate: number
    productCommission: number
  }
  allowances: {
    traffic?: number
    communication?: number
    meal?: number
    housing?: number
  }
  socialInsurance: {
    pension: number
    medical: number
    unemployment: number
    housingFund: number
  }
  performanceBonus?: {
    enabled: boolean
    levels: Array<{
      name: string
      minScore: number
      maxScore: number
      bonus: number
    }>
  }
  yearEndBonus?: {
    enabled: boolean
    months: number
  }
}

// 考勤数据
export interface AttendanceRecord {
  id: string
  employeeId: string
  month: string
  lateDays: number
  lateDeduction: number
  earlyLeaveDays: number
  earlyLeaveDeduction: number
  personalLeaveDays: number
  personalLeaveDeduction: number
  sickLeaveDays: number
  sickLeaveDeduction: number
}
