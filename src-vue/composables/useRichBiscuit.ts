import { ref, computed } from 'vue'
import type { RichBiscuit, RichBiscuitStats, RichBiscuitCategory } from '../types/commission'

// 模拟富贵饼数据
const richBiscuits = ref<RichBiscuit[]>([
  {
    id: 'rb001',
    employeeId: '1',
    employeeName: '张教练',
    amount: 2.5,
    value: 250,
    reason: '服务创新，用户满意度高',
    category: 'innovation',
    issuerId: 'admin',
    issuerName: '管理员',
    issuedAt: new Date('2025-02-25T14:30:00'),
    month: '2025-02'
  },
  {
    id: 'rb002',
    employeeId: '2',
    employeeName: '李教练',
    amount: 1.0,
    value: 100,
    reason: '团队协作优秀',
    category: 'teamwork',
    issuerId: 'admin',
    issuerName: '管理员',
    issuedAt: new Date('2025-02-25T11:20:00'),
    month: '2025-02'
  },
  {
    id: 'rb003',
    employeeId: '1',
    employeeName: '张教练',
    amount: 1.5,
    value: 150,
    reason: '本月绩效优秀',
    category: 'performance',
    issuerId: 'admin',
    issuerName: '管理员',
    issuedAt: new Date('2025-02-24T16:45:00'),
    month: '2025-02'
  }
])

export function useRichBiscuit() {
  // 发放富贵饼
  const issueRichBiscuit = (data: Omit<RichBiscuit, 'id' | 'value' | 'month' | 'issuedAt'>): RichBiscuit => {
    const value = data.amount * 100 // 每个饼100元

    const newBiscuit: RichBiscuit = {
      ...data,
      id: `rb${Date.now()}`,
      value,
      month: new Date().toISOString().slice(0, 7),
      issuedAt: new Date()
    }

    richBiscuits.value.unshift(newBiscuit)
    return newBiscuit
  }

  // 获取员工富贵饼
  const getEmployeeRichBiscuits = (employeeId: string, month?: string): RichBiscuit[] => {
    return richBiscuits.value.filter(
      rb => rb.employeeId === employeeId && (!month || rb.month === month)
    )
  }

  // 获取月份富贵饼
  const getMonthRichBiscuits = (month: string): RichBiscuit[] => {
    return richBiscuits.value.filter(rb => rb.month === month)
  }

  // 富贵饼统计
  const getRichBiscuitStats = (month: string): RichBiscuitStats => {
    const monthBiscuits = getMonthRichBiscuits(month)

    // 按员工统计
    const employeeTotals = new Map<string, number>()
    monthBiscuits.forEach(rb => {
      employeeTotals.set(
        rb.employeeId,
        (employeeTotals.get(rb.employeeId) || 0) + rb.amount
      )
    })

    // 排序获取前三名
    const sorted = Array.from(employeeTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    // 分类统计
    const categoryDistribution: Record<string, number> = {
      performance: 0,
      innovation: 0,
      teamwork: 0,
      extra: 0,
      other: 0
    }

    monthBiscuits.forEach(rb => {
      categoryDistribution[rb.category] += rb.amount
    })

    return {
      totalIssued: monthBiscuits.reduce((sum, rb) => sum + rb.amount, 0),
      totalValue: monthBiscuits.reduce((sum, rb) => sum + rb.value, 0),
      top1: sorted[0] ? { id: sorted[0][0], name: sorted[0][0], amount: sorted[0][1] } : undefined,
      top2: sorted[1] ? { id: sorted[1][0], name: sorted[1][0], amount: sorted[1][1] } : undefined,
      top3: sorted[2] ? { id: sorted[2][0], name: sorted[2][0], amount: sorted[2][1] } : undefined,
      categoryDistribution
    }
  }

  // 删除富贵饼记录
  const deleteRichBiscuit = (id: string): boolean => {
    const index = richBiscuits.value.findIndex(rb => rb.id === id)
    if (index === -1) return false

    richBiscuits.value.splice(index, 1)
    return true
  }

  // 获取分类标签
  const getCategoryLabel = (category: RichBiscuitCategory): string => {
    const labels: Record<RichBiscuitCategory, string> = {
      performance: '🏆 绩效',
      innovation: '💡 创新',
      teamwork: '🤝 协作',
      extra: '⭐ 额外',
      other: '📝 其他'
    }
    return labels[category] || '其他'
  }

  // 获取分类样式
  const getCategoryClass = (category: RichBiscuitCategory): string => {
    const classes: Record<RichBiscuitCategory, string> = {
      performance: 'bg-yellow-100 text-yellow-800',
      innovation: 'bg-purple-100 text-purple-800',
      teamwork: 'bg-blue-100 text-blue-800',
      extra: 'bg-green-100 text-green-800',
      other: 'bg-slate-100 text-slate-800'
    }
    return classes[category] || classes.other
  }

  return {
    // 数据
    richBiscuits,

    // 方法
    issueRichBiscuit,
    getEmployeeRichBiscuits,
    getMonthRichBiscuits,
    getRichBiscuitStats,
    deleteRichBiscuit,
    getCategoryLabel,
    getCategoryClass
  }
}
