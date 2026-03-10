import { ref, computed } from 'vue'
import type { SalarySlip, SalaryScheme, SalaryStatus, ServiceType } from '../types/salary'

// 工资条ID计数器（确保唯一性）
let salarySlipIdCounter = 0

// 餐补每日标准
const MEAL_ALLOWANCE_DAILY_RATE = 40

// 获取餐补金额（兼容新旧数据结构）
const getMealAllowanceAmount = (meal: any): number => {
  if (typeof meal === 'object' && meal !== null) {
    return meal.amount || 0
  }
  return meal || 0
}

// 计算月份工作日天数（排除周末）
const calculateWorkdays = (year: number, month: number): number => {
  let workdays = 0
  const daysInMonth = new Date(year, month, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dayOfWeek = date.getDay()

    // 0是周日，6是周六，只计算周一到周五（1-5）
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workdays++
    }
  }

  return workdays
}

// 薪资方案配置
const SALARY_SCHEMES: SalaryScheme[] = [
  {
    id: 'coach-a',
    name: '教练方案A - 底薪+提成',
    type: 'coach',
    baseSalary: 3000,
    commissionRules: {
      newUserRate: 400,
      oldUserRate: 100,
      doctorOnlineRate: 200,
      productCommission: 0.05
    },
    allowances: {
      traffic: 500,
      communication: 200,
      meal: 0  // 餐补按工作日动态计算
    },
    socialInsurance: {
      pension: 0.08,
      medical: 0.02,
      unemployment: 0.005,
      housingFund: 0.12
    }
  },
  {
    id: 'doctor-a',
    name: '医生方案A - 基础薪资+上线',
    type: 'doctor',
    baseSalary: 5000,
    commissionRules: {
      newUserRate: 100,
      oldUserRate: 50,
      doctorOnlineRate: 200,
      productCommission: 0.03
    },
    allowances: {
      traffic: 300,
      communication: 200,
      meal: 0  // 餐补按工作日动态计算
    },
    socialInsurance: {
      pension: 0.08,
      medical: 0.02,
      unemployment: 0.005,
      housingFund: 0.12
    }
  },
  {
    id: 'consultant-a',
    name: '顾问方案A - 底薪+提成',
    type: 'consultant',
    baseSalary: 4000,
    commissionRules: {
      newUserRate: 200,
      oldUserRate: 50,
      doctorOnlineRate: 100,
      productCommission: 0.04
    },
    allowances: {
      traffic: 400,
      communication: 200,
      meal: 300
    },
    socialInsurance: {
      pension: 0.08,
      medical: 0.02,
      unemployment: 0.005,
      housingFund: 0.12
    }
  }
]

// 模拟工资条数据
const salarySlips = ref<SalarySlip[]>([])

// 模拟富贵饼数据
const richBiscuits = ref([
  {
    id: 'rb001',
    employeeId: '1',
    amount: 2.5,
    value: 250,
    reason: '服务创新',
    category: 'innovation',
    issuedAt: new Date('2025-02-25')
  },
  {
    id: 'rb002',
    employeeId: '1',
    amount: 1.5,
    value: 150,
    reason: '绩效优秀',
    category: 'performance',
    issuedAt: new Date('2025-02-20')
  }
])

// 模拟上线服务数据
const onlineServices = ref([
  {
    id: 'os001',
    employeeId: '1',
    date: new Date('2025-02-25T20:30:00'),
    type: 'night' as const,
    duration: 30,
    amount: 250
  },
  {
    id: 'os002',
    employeeId: '1',
    date: new Date('2025-02-24T14:00:00'),
    type: 'normal' as const,
    duration: 20,
    amount: 200
  }
])

export function useSalary() {
  // 生成工资条
  const generateSalarySlip = (employeeId: string, month: string, schemeId: string): SalarySlip => {
    const scheme = SALARY_SCHEMES.find(s => s.id === schemeId)
    if (!scheme) {
      throw new Error('薪资方案不存在')
    }

    // 解析月份获取年月
    const [year, monthNum] = month.split('-').map(Number)

    // 计算工作日天数
    const workdays = calculateWorkdays(year, monthNum)
    const mealAllowanceAmount = workdays * MEAL_ALLOWANCE_DAILY_RATE

    // 获取员工绑定的用户数据
    const bindings = getEmployeeBindings(employeeId, month)
    const newUserCount = bindings.filter(b => {
      const serviceMonths = getServiceMonths(b.firstServiceDate, month)
      return serviceMonths <= 3
    }).length

    const oldUserCount = bindings.filter(b => {
      const serviceMonths = getServiceMonths(b.firstServiceDate, month)
      return serviceMonths > 3
    }).length

    // 获取上线服务数据
    const monthServices = getMonthOnlineServices(employeeId, month)
    const onlineAmount = monthServices.reduce((sum, s) => sum + s.amount, 0)

    // 获取富贵饼数据
    const monthBiscuits = getMonthRichBiscuits(employeeId, month)
    const biscuitAmount = monthBiscuits.reduce((sum, b) => sum + b.value, 0)

    // 计算收入
    const grossSalary = scheme.baseSalary || 0
      + (newUserCount * scheme.commissionRules.newUserRate)
      + (oldUserCount * scheme.commissionRules.oldUserRate)
      + onlineAmount
      + biscuitAmount

    // 计算社保公积金
    const socialInsurance = grossSalary * (
      scheme.socialInsurance.pension +
      scheme.socialInsurance.medical +
      scheme.socialInsurance.unemployment +
      scheme.socialInsurance.housingFund
    )

    // 计算个税（简化版）
    const taxableIncome = grossSalary - socialInsurance - 5000 // 5000起征点
    const tax = calculateIncomeTax(taxableIncome)

    const totalDeductions = socialInsurance + tax

    const salarySlip: SalarySlip = {
      id: `slip${Date.now()}_${++salarySlipIdCounter}`,
      employeeId,
      employeeName: '张教练', // 从员工数据获取
      department: '健康服务部',
      position: '高级教练',
      month,
      schemeId,
      income: {
        baseSalary: scheme.baseSalary || 0,
        positionSalary: 0,
        performanceSalary: 0,
        senioritySalary: 0,
        commission: {
          newUserCount,
          newUserAmount: newUserCount * scheme.commissionRules.newUserRate,
          oldUserCount,
          oldUserAmount: oldUserCount * scheme.commissionRules.oldUserRate,
          totalAmount: (newUserCount * scheme.commissionRules.newUserRate) + (oldUserCount * scheme.commissionRules.oldUserRate) + onlineAmount + biscuitAmount,
          onlineServices: {
            count: monthServices.length,
            normalRate: 200,
            nightRate: 250,
            weekendRate: 250,
            urgentRate: 300,
            totalAmount: onlineAmount
          },
          richBiscuits: {
            amount: monthBiscuits.reduce((sum, b) => sum + b.amount, 0),
            value: biscuitAmount,
            details: monthBiscuits.map(b => ({
              id: b.id,
              amount: b.amount,
              reason: b.reason,
              category: b.category,
              issuedAt: b.issuedAt
            }))
          },
          productSales: 0,
          productCommission: 0
        },
        allowances: {
          traffic: scheme.allowances.traffic || 0,
          communication: scheme.allowances.communication || 0,
          meal: {
            amount: mealAllowanceAmount,
            workdays: workdays,
            dailyRate: MEAL_ALLOWANCE_DAILY_RATE
          },
          housing: scheme.allowances.housing || 0
        },
        bonus: {
          monthly: 0,
          quarterly: 0,
          yearly: 0,
          special: 0
        }
      },
      deductions: {
        socialInsurance: {
          pension: grossSalary * scheme.socialInsurance.pension,
          medical: grossSalary * scheme.socialInsurance.medical,
          unemployment: grossSalary * scheme.socialInsurance.unemployment,
          housingFund: grossSalary * scheme.socialInsurance.housingFund
        },
        attendance: {
          late: 0,
          earlyLeave: 0,
          personalLeave: 0,
          sickLeave: 0
        },
        tax
      },
      summary: {
        grossSalary,
        totalDeductions,
        netSalary: grossSalary - totalDeductions
      },
      status: 'draft' as SalaryStatus,
      notes: '',
      attachments: [],
      createdAt: new Date()
    }

    salarySlips.value.push(salarySlip)
    return salarySlip
  }

  // 获取员工工资条
  const getEmployeeSalarySlips = (employeeId: string, month?: string): SalarySlip[] => {
    return salarySlips.value.filter(
      s => s.employeeId === employeeId && (!month || s.month === month)
    )
  }

  // 获取月份工资条
  const getMonthSalarySlips = (month: string): SalarySlip[] => {
    return salarySlips.value.filter(s => s.month === month)
  }

  // 审批工资条
  const approveSalarySlip = (id: string, approverId: string): boolean => {
    const slip = salarySlips.value.find(s => s.id === id)
    if (!slip || slip.status !== 'draft' && slip.status !== 'pending') return false

    slip.status = 'approved'
    slip.approvedBy = approverId
    slip.approvedAt = new Date()

    return true
  }

  // 支付工资
  const paySalarySlip = (id: string, payerId: string): boolean => {
    const slip = salarySlips.value.find(s => s.id === id)
    if (!slip || slip.status !== 'approved') return false

    slip.status = 'paid'
    slip.paidBy = payerId
    slip.paidAt = new Date()

    return true
  }

  // 获取薪资方案
  const getSalarySchemes = () => SALARY_SCHEMES

  // 辅助函数
  const getEmployeeBindings = (employeeId: string, month: string) => {
    // 模拟数据
    return [
      {
        id: 'ub001',
        employeeId,
        userId: 'U001',
        userName: '王小红',
        serviceType: 'basic' as ServiceType,
        firstServiceDate: '2024-12-01'
      },
      {
        id: 'ub002',
        employeeId,
        userId: 'U002',
        userName: '李大明',
        serviceType: 'deep' as ServiceType,
        firstServiceDate: '2024-06-15'
      }
    ]
  }

  const getServiceMonths = (firstServiceDate: string, targetMonth: string): number => {
    const start = new Date(firstServiceDate)
    const target = new Date(targetMonth + '-01')
    const months = (target.getFullYear() - start.getFullYear()) * 12 +
                   (target.getMonth() - start.getMonth())
    return months
  }

  const getMonthOnlineServices = (employeeId: string, month: string) => {
    return onlineServices.value.filter(s => {
      const serviceMonth = s.date.toISOString().slice(0, 7)
      return s.employeeId === employeeId && serviceMonth === month
    })
  }

  const getMonthRichBiscuits = (employeeId: string, month: string) => {
    return richBiscuits.value.filter(rb => {
      const biscuitMonth = rb.issuedAt.toISOString().slice(0, 7)
      return rb.employeeId === employeeId && biscuitMonth === month
    })
  }

  // 计算个税（简化版）
  const calculateIncomeTax = (taxableIncome: number): number => {
    if (taxableIncome <= 0) return 0

    const brackets = [
      { limit: 3000, rate: 0.03 },
      { limit: 12000, rate: 0.1 },
      { limit: 25000, rate: 0.2 },
      { limit: 35000, rate: 0.25 },
      { limit: 55000, rate: 0.3 },
      { limit: 80000, rate: 0.35 },
      { limit: Infinity, rate: 0.45 }
    ]

    let tax = 0
    let remaining = taxableIncome

    for (const bracket of brackets) {
      if (remaining <= 0) break
      const taxable = Math.min(remaining, bracket.limit === Infinity ? remaining : bracket.limit)
      tax += taxable * bracket.rate
      remaining -= taxable
    }

    return tax
  }

  // 获取工资条统计
  const getSalaryStats = (month: string) => {
    const monthSlips = getMonthSalarySlips(month)

    return {
      total: monthSlips.length,
      draft: monthSlips.filter(s => s.status === 'draft').length,
      pending: monthSlips.filter(s => s.status === 'pending').length,
      approved: monthSlips.filter(s => s.status === 'approved').length,
      paid: monthSlips.filter(s => s.status === 'paid').length,
      totalGrossSalary: monthSlips.reduce((sum, s) => sum + s.summary.grossSalary, 0),
      totalNetSalary: monthSlips.reduce((sum, s) => sum + s.summary.netSalary, 0)
    }
  }

  // 更新工资条
  const updateSalarySlip = (id: string, updates: Partial<SalarySlip>): boolean => {
    const index = salarySlips.value.findIndex(s => s.id === id)
    if (index === -1) return false

    Object.assign(salarySlips.value[index], updates)
    return true
  }

  // 删除工资条
  const deleteSalarySlip = (id: string): boolean => {
    const index = salarySlips.value.findIndex(s => s.id === id)
    if (index === -1) return false

    salarySlips.value.splice(index, 1)
    return true
  }

  // 复制工资条
  const copySalarySlip = (id: string): SalarySlip | null => {
    const original = salarySlips.value.find(s => s.id === id)
    if (!original) return null

    const copy: SalarySlip = {
      ...JSON.parse(JSON.stringify(original)),
      id: `slip${Date.now()}_${++salarySlipIdCounter}`,
      status: 'draft',
      employeeName: original.employeeName + ' (副本)',
      createdAt: new Date(),
      approvedAt: undefined,
      paidAt: undefined,
      approvedBy: undefined,
      paidBy: undefined
    }

    salarySlips.value.push(copy)
    return copy
  }

  // 批量审核
  const batchApproveSalarySlips = (ids: string[], approverId: string): number => {
    let count = 0
    ids.forEach(id => {
      if (approveSalarySlip(id, approverId)) {
        count++
      }
    })
    return count
  }

  // 批量发放
  const batchPaySalarySlips = (ids: string[], payerId: string): number => {
    let count = 0
    ids.forEach(id => {
      if (paySalarySlip(id, payerId)) {
        count++
      }
    })
    return count
  }

  // 导出工资条为Excel数据
  const exportSalarySlipsToExcel = (month: string): any[] => {
    const monthSlips = getMonthSalarySlips(month)
    return monthSlips.map(slip => ({
      '员工姓名': slip.employeeName,
      '部门': slip.department,
      '职位': slip.position,
      '月份': slip.month,
      '底薪': slip.income.baseSalary,
      '管理费': slip.income.performanceSalary,
      '新用户佣金': slip.income.commission.newUserAmount,
      '老用户佣金': slip.income.commission.oldUserAmount,
      '上线服务': slip.income.commission.onlineServices.totalAmount,
      '富贵饼': slip.income.commission.richBiscuits.value,
      '交通补贴': slip.income.allowances.traffic,
      '通讯补贴': slip.income.allowances.communication,
      '餐补': typeof slip.income.allowances.meal === 'object'
        ? slip.income.allowances.meal.amount
        : slip.income.allowances.meal,
      '餐补工作日': typeof slip.income.allowances.meal === 'object'
        ? slip.income.allowances.meal.workdays
        : '-',
      '餐补标准': typeof slip.income.allowances.meal === 'object'
        ? `¥${slip.income.allowances.meal.dailyRate}/天`
        : '-',
      '房补': slip.income.allowances.housing,
      '养老保险': slip.deductions.socialInsurance.pension,
      '医疗保险': slip.deductions.socialInsurance.medical,
      '失业保险': slip.deductions.socialInsurance.unemployment,
      '住房公积金': slip.deductions.socialInsurance.housingFund,
      '个税': slip.deductions.tax,
      '应发工资': slip.summary.grossSalary,
      '实发工资': slip.summary.netSalary,
      '状态': slip.status
    }))
  }

  return {
    // 数据
    salarySlips,

    // 方法
    generateSalarySlip,
    getEmployeeSalarySlips,
    getMonthSalarySlips,
    approveSalarySlip,
    paySalarySlip,
    getSalarySchemes,
    getSalaryStats,
    updateSalarySlip,
    deleteSalarySlip,
    copySalarySlip,
    batchApproveSalarySlips,
    batchPaySalarySlips,
    exportSalarySlipsToExcel
  }
}
