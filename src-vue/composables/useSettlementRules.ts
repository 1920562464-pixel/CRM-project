// 结算规则计算函数
export interface DoctorServiceRecord {
  serviceDate: string
  serviceType: 'consultation' | 'sales_support' | 'medical_qa'
  orderId?: string
  assessedBy?: string // 吴晗/糖糖评估
}

export interface CoachServiceRecord {
  userId: string
  startDate: string
  endDate?: string
  isNewUser: boolean
}

export interface ProductInfo {
  id: string
  name: string
  price: number
  participantCount?: number // 多人套餐实际人数
  isFreeService?: boolean // 是否免费赠送
}

// 医生上线服务费用计算
export function calculateDoctorServiceFee(
  serviceRecords: DoctorServiceRecord[]
): number {
  return serviceRecords.length * 200
}

// 医生销转提成计算
export function calculateDoctorSalesCommission(
  productPrice: number,
  participantCount: number = 1
): number {
  // 仅7000元以上产品有5%提成
  if (productPrice >= 7000) {
    return productPrice * 0.05 * participantCount
  }
  return 0
}

// 医生总费用计算
export function calculateDoctorTotalFee(
  serviceRecords: DoctorServiceRecord[],
  salesProduct?: ProductInfo
): number {
  const serviceFee = calculateDoctorServiceFee(serviceRecords)

  let salesCommission = 0
  if (salesProduct && salesProduct.price >= 7000) {
    salesCommission = calculateDoctorSalesCommission(
      salesProduct.price,
      salesProduct.participantCount || 1
    )
  }

  return serviceFee + salesCommission
}

// 教练/营养师费用计算
export function calculateCoachFee(
  serviceRecord: CoachServiceRecord
): number {
  if (!serviceRecord.endDate) {
    // 服务未结束，按当前时间计算到本月
    const now = new Date()
    const start = new Date(serviceRecord.startDate)
    const months = getMonthDiff(start, now)

    let totalFee = 0
    for (let i = 0; i < months; i++) {
      if (i < 3) {
        totalFee += 400 // 前3个月
      } else {
        totalFee += 100 // 3个月后
      }
    }
    return totalFee
  }

  // 服务已结束，按实际服务天数计算
  const start = new Date(serviceRecord.startDate)
  const end = new Date(serviceRecord.endDate)
  const days = getDayDiff(start, end)

  // 判断是否在前3个月内
  const threeMonthsLater = new Date(start)
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3)

  const isInFirst3Months = end <= threeMonthsLater
  const monthlyRate = isInFirst3Months ? 400 : 100

  // 按30天折算
  const fee = monthlyRate * (days / 30)
  return Math.round(fee * 10) / 10 // 四舍五入保留1位小数
}

// 教练中途换人费用计算
export function calculateCoachChangeFee(
  oldCoachEndDate: string,
  newCoachStartDate: string,
  isNewUser: boolean
): { oldCoachFee: number; newCoachFee: number } {
  const oldEnd = new Date(oldCoachEndDate)
  const newStart = new Date(newCoachStartDate)
  const oldStart = new Date(newCoachStartDate)
  oldStart.setMonth(oldStart.getMonth() - 1) // 假设旧教练服务了1个月作为起点

  const oldDays = getDayDiff(oldStart, oldEnd)
  const newDays = getDayDiff(newStart, newEnd || new Date())

  // 判断是否在前3个月
  const threeMonthsFromStart = new Date(oldStart)
  threeMonthsFromStart.setMonth(threeMonthsFromStart.getMonth() + 3)

  const isInFirst3Months = (isNewUser && newEnd <= threeMonthsFromStart)
  const monthlyRate = isInFirst3Months ? 400 : 100

  const oldCoachFee = Math.round((monthlyRate * (oldDays / 30)) * 10) / 10
  const newCoachFee = Math.round((monthlyRate * (newDays / 30)) * 10) / 10

  return { oldCoachFee, newCoachFee }
}

// 佣金计算
export function calculateCommission(productPrice: number): number {
  // 3188元提2%
  if (productPrice >= 3000 && productPrice < 7000) {
    return productPrice * 0.02
  }

  // 25800元提5%
  if (productPrice >= 7000) {
    return productPrice * 0.05
  }

  // 999元及以下无提成
  return 0
}

// 获取佣金比例
export function getCommissionRate(productPrice: number): number {
  if (productPrice >= 7000) return 5 // 25800元等高客单
  if (productPrice >= 3000) return 2 // 3188元等中客单
  return 0 // 999元及以下无提成
}

// 检查是否符合结算条件（3个月无退费）
export function checkSettlementEligibility(orderDate: string): boolean {
  const threeMonthsAgo = new Date()
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

  const orderDateTime = new Date(orderDate)
  return orderDateTime <= threeMonthsAgo
}

// 工具函数：计算月份差异
function getMonthDiff(start: Date, end: Date): number {
  const months = (end.getFullYear() - start.getFullYear()) * 12
  return months + end.getMonth() - start.getMonth()
}

// 工具函数：计算天数差异
function getDayDiff(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// 格式化费用显示
export function formatFee(fee: number): string {
  return `¥${fee.toFixed(1)}`
}

// 获取产品类型
export function getProductType(price: number): string {
  if (price >= 7000) return 'high' // 高客单
  if (price >= 3000) return 'medium' // 中客单
  return 'low' // 低客单
}

// 获取结算状态
export function getSettlementStatus(orderDate: string, hasRefund: boolean): {
  status: 'eligible' | 'pending' | 'refunded'
  message: string
} {
  if (hasRefund) {
    return {
      status: 'refunded',
      message: '已退费，不符合结算条件'
    }
  }

  const isEligible = checkSettlementEligibility(orderDate)
  if (!isEligible) {
    return {
      status: 'pending',
      message: '未满3个月无退费期，暂不可结算'
    }
  }

  return {
    status: 'eligible',
    message: '符合结算条件，可进行结算'
  }
}

// 计算结算周期
export function calculateSettlementPeriod(orderDate: string): {
  startDate: string
  endDate: string
  isEligible: boolean
} {
  const order = new Date(orderDate)
  const endDate = new Date(order)
  endDate.setMonth(endDate.getMonth() + 3)

  const now = new Date()
  const isEligible = now >= endDate

  return {
    startDate: order.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    isEligible
  }
}