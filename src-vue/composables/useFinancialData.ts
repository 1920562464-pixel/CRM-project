import { ref, computed } from 'vue'

// 业务线类型
export type BusinessLine = '减重' | '斑块逆转' | '慢病管理' | '超越百岁' | '其他'
export type ProductPeriod = '14天体验' | '三个月' | '六个月' | '一年期' | '999会员'

interface IncomeRecord {
  id: string
  businessLine: BusinessLine
  productType: ProductPeriod
  amount: number
  status: 'pending' | 'confirmed' | 'refunded'
  memberName: string
  memberId: string
  createdAt: string
}

interface ExpenseRecord {
  id: string
  category: 'settlement' | 'purchase' | 'operating' | 'tax'
  amount: number
  description: string
  createdAt: string
}

interface AccountRecord {
  id: string
  accountName: string
  accountType: 'bank' | 'cash' | 'alipay' | 'wechat'
  balance: number
}

interface ReceivableRecord {
  id: string
  memberName: string
  amount: number
  dueDate: string
  status: 'pending' | 'partial' | 'paid'
}

// 全局财务数据状态
const incomeRecords = ref<IncomeRecord[]>([
  {
    id: 'INC001',
    businessLine: '减重',
    productType: '六个月',
    amount: 29800,
    status: 'confirmed',
    memberName: '王芳',
    memberId: 'M001',
    createdAt: '2024-02-15'
  },
  {
    id: 'INC002',
    businessLine: '斑块逆转',
    productType: '一年期',
    amount: 39800,
    status: 'confirmed',
    memberName: '李明',
    memberId: 'M002',
    createdAt: '2024-02-15'
  },
  {
    id: 'INC003',
    businessLine: '慢病管理',
    productType: '一年期',
    amount: 49800,
    status: 'confirmed',
    memberName: '赵丽',
    memberId: 'M003',
    createdAt: '2024-02-15'
  },
  {
    id: 'INC004',
    businessLine: '超越百岁',
    productType: '999会员',
    amount: 999,
    status: 'pending',
    memberName: '孙伟',
    memberId: 'M004',
    createdAt: '2024-02-15'
  },
  {
    id: 'INC005',
    businessLine: '减重',
    productType: '14天体验',
    amount: 1980,
    status: 'confirmed',
    memberName: '周涛',
    memberId: 'M005',
    createdAt: '2024-02-14'
  },
  {
    id: 'INC006',
    businessLine: '慢病管理',
    productType: '三个月',
    amount: 16800,
    status: 'confirmed',
    memberName: '吴秀兰',
    memberId: 'M006',
    createdAt: '2024-02-14'
  },
  {
    id: 'INC007',
    businessLine: '斑块逆转',
    productType: '三个月',
    amount: 24800,
    status: 'pending',
    memberName: '郑国强',
    memberId: 'M007',
    createdAt: '2024-02-14'
  }
])

const expenseRecords = ref<ExpenseRecord[]>([
  {
    id: 'EXP001',
    category: 'settlement',
    amount: 28500,
    description: '教练提成结算',
    createdAt: '2024-02-15'
  },
  {
    id: 'EXP002',
    category: 'purchase',
    amount: 13800,
    description: '营养品采购',
    createdAt: '2024-02-15'
  },
  {
    id: 'EXP003',
    category: 'operating',
    amount: 15600,
    description: '房租、水电等运营费用',
    createdAt: '2024-02-15'
  },
  {
    id: 'EXP004',
    category: 'tax',
    amount: 11900,
    description: '税费',
    createdAt: '2024-02-15'
  }
])

const accounts = ref<AccountRecord[]>([
  { id: 'ACC001', accountName: '工商银行', accountType: 'bank', balance: 350000 },
  { id: 'ACC002', accountName: '建设银行', accountType: 'bank', balance: 120000 },
  { id: 'ACC003', accountName: '现金', accountType: 'cash', balance: 53800 }
])

const receivables = ref<Receivable[]>([
  { id: 'REC001', memberName: '张三', amount: 28000, dueDate: '2024-03-01', status: 'pending' },
  { id: 'REC002', memberName: '李四', amount: 17600, dueDate: '2024-02-28', status: 'partial' }
])

export function useFinancialData() {
  // 收入统计（按业务线）
  const incomeByBusinessLine = computed(() => {
    const stats: Record<BusinessLine, { revenue: number; orders: number; percentage: number }> = {
      '减重': { revenue: 0, orders: 0, percentage: 0 },
      '斑块逆转': { revenue: 0, orders: 0, percentage: 0 },
      '慢病管理': { revenue: 0, orders: 0, percentage: 0 },
      '超越百岁': { revenue: 0, orders:0, percentage: 0 },
      '其他': { revenue: 0, orders: 0, percentage: 0 }
    }

    const confirmedRecords = incomeRecords.value.filter(r => r.status === 'confirmed')
    const totalRevenue = confirmedRecords.reduce((sum, r) => sum + r.amount, 0)

    confirmedRecords.forEach(record => {
      if (stats[record.businessLine]) {
        stats[record.businessLine].revenue += record.amount
        stats[record.businessLine].orders += 1
      }
    })

    // 计算百分比
    Object.keys(stats).forEach(key => {
      const line = key as BusinessLine
      stats[line].percentage = totalRevenue > 0 ? (stats[line].revenue / totalRevenue * 100) : 0
    })

    return stats
  })

  // 总收入
  const totalIncome = computed(() => {
    return incomeRecords.value
      .filter(r => r.status === 'confirmed')
      .reduce((sum, r) => sum + r.amount, 0)
  })

  // 总支出
  const totalExpense = computed(() => {
    return expenseRecords.value.reduce((sum, r) => sum + r.amount, 0)
  })

  // 货币资金
  const cashFunds = computed(() => {
    return accounts.value.reduce((sum, acc) => sum + acc.balance, 0)
  })

  // 应收账款
  const totalReceivables = computed(() => {
    return receivables.value.reduce((sum, r) => sum + r.amount, 0)
  })

  // 净利润
  const netProfit = computed(() => {
    return totalIncome.value - totalExpense.value
  })

  // 毛利润（简化计算，不考虑成本分配）
  const grossProfit = computed(() => {
    // 假设毛利率为 67%
    return totalIncome.value * 0.67
  })

  // 业务线收入明细（用于损益表）
  const businessLineIncomeDetails = computed(() => {
    const details: Record<BusinessLine, { total: number; products: Record<ProductPeriod, number> }> = {
      '减重': { total: 0, products: {} },
      '斑块逆转': { total: 0, products: {} },
      '慢病管理': { total: 0, products: {} },
      '超越百岁': { total: 0, products: {} },
      '其他': { total: 0, products: {} }
    }

    incomeRecords.value
      .filter(r => r.status === 'confirmed')
      .forEach(record => {
        if (details[record.businessLine]) {
          details[record.businessLine].total += record.amount
          if (!details[record.businessLine].products[record.productType]) {
            details[record.businessLine].products[record.productType] = 0
          }
          details[record.businessLine].products[record.productType] += record.amount
        }
      })

    return details
  })

  // 现金流量构成
  const cashFlowComposition = computed(() => {
    const operatingInflow = totalIncome.value
    const operatingOutflow = expenseRecords.value
      .filter(e => e.category !== 'tax')
      .reduce((sum, e) => sum + e.amount, 0)

    return {
      operating: {
        inflow: operatingInflow,
        outflow: operatingOutflow,
        net: operatingInflow - operatingOutflow
      },
      investing: {
        inflow: 0,
        outflow: 8600, // 固定资产采购
        net: -8600
      },
      financing: {
        inflow: 0,
        outflow: 0,
        net: 0
      }
    }
  })

  // 资产负债表数据
  const balanceSheet = computed(() => {
    return {
      assets: {
        current: {
          cash: cashFunds.value,
          receivables: totalReceivables.value,
          inventory: 76400
        },
        nonCurrent: {
          fixedAssets: 245000,
          accumulatedDepreciation: -59000
        }
      },
      liabilities: {
        current: {
          payables: 86200,
          salaries: 28500,
          other: 13700
        },
        nonCurrent: {
          total: 0
        }
      },
      equity: {
        paidInCapital: 500000,
        retainedEarnings: netProfit.value
      }
    }
  })

  // 添加收入记录
  const addIncomeRecord = (record: Omit<IncomeRecord, 'id'>) => {
    const newRecord: IncomeRecord = {
      ...record,
      id: `INC${Date.now()}`
    }
    incomeRecords.value.push(newRecord)
  }

  // 添加支出记录
  const addExpenseRecord = (record: Omit<ExpenseRecord, 'id'>) => {
    const newRecord: ExpenseRecord = {
      ...record,
      id: `EXP${Date.now()}`
    }
    expenseRecords.value.push(newRecord)
  }

  return {
    // 数据
    incomeRecords,
    expenseRecords,
    accounts,
    receivables,

    // 计算属性
    incomeByBusinessLine,
    totalIncome,
    totalExpense,
    cashFunds,
    totalReceivables,
    netProfit,
    grossProfit,
    businessLineIncomeDetails,
    cashFlowComposition,
    balanceSheet,

    // 方法
    addIncomeRecord,
    addExpenseRecord,

    // 辅助方法
    getIncomeByBusinessLine: (line: BusinessLine) => incomeByBusinessLine.value[line],
    getIncomeByProduct: (line: BusinessLine) => businessLineIncomeDetails.value[line],
    getBalanceSheet: () => balanceSheet.value,
    getCashFlow: () => cashFlowComposition.value
  }
}
