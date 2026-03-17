import { ref, computed } from 'vue'
import { useEmployeeData } from './useEmployeeData'
import { useHRManagement } from './useHRManagement'

// 管理费配置
const MANAGEMENT_FEE_CONFIG = {
  newClient: 400, // 新用户管理费：400元/月（前三个月）
  oldClient: 100, // 老用户管理费：100元/月（三个月后）
  mentorSupervision: {
    firstThreeMonths: 80, // 前三个月师父监管费：80元/月
    lastNineMonths: 20,  // 后九个月师父监管费：20元/月
    totalYear: 420       // 全年师父监管费总计
  },
  doctor: 3000 // 医生管理费：3000元/年
}

// 管理费状态
export type ManagementFeeStatus = 'pending' | 'confirmed' | 'paid'

// 费用类型（仅包含管理费相关）
export type FeeType =
  | 'new_user_management'    // 新用户管理费
  | 'old_user_management'    // 老用户管理费
  | 'mentor_supervision'     // 师父监管费
  | 'doctor_management'      // 医生管理费

// 管理费记录
export interface ManagementFeeRecord {
  id: string
  employeeId: string
  employeeName: string
  clientId: string
  clientName: string
  period: string // YYYY-MM 格式
  feeType: FeeType
  fee: number
  details?: string  // 详细说明
  status: ManagementFeeStatus
  createdAt: string
  confirmedAt?: string
  confirmedBy?: string
  paidAt?: string
  paidBy?: string
  // 管理时间相关
  managementStartDate: string  // 管理开始日期
  isNewClient: boolean  // 是否新用户（用于判断费率）
  mentorId?: string  // 师傅ID（用于师父监管费）
  mentorName?: string  // 师傅姓名
  firstPaymentDate?: string  // 首次付费日期（医生管理费结算用）
  doctorServiceStatus?: 'pending' | 'qualified' | 'completed'  // 医生服务状态
}

const managementFees = ref<ManagementFeeRecord[]>([])
const feeChangeListeners = ref<(() => void)[]>([])

// 生成唯一ID
const generateFeeId = (): string => {
  return `fee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 获取当前月份
const getCurrentPeriod = (): string => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// 计算两个日期之间的月数
const getMonthDifference = (startDate: string, endDate: string): number => {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  return Math.max(0, months)
}

// 判断是否在管理的前3个月内
const isInFirstThreeMonths = (startDate: string, checkDate: string): boolean => {
  const months = getMonthDifference(startDate, checkDate)
  return months < 3
}

// 计算单个用户的基础管理费
const calculateBaseFee = (
  managementStartDate: string,
  checkPeriod: string,
  isNewClient: boolean
): number => {
  const inFirstThreeMonths = isInFirstThreeMonths(managementStartDate, checkPeriod)

  if (isNewClient) {
    // 新用户：前三个月400元/月，之后按实际管理天数计算
    // 这里简化处理，直接返回当月费用
    return MANAGEMENT_FEE_CONFIG.newClient
  } else {
    // 老用户：100元/月
    return MANAGEMENT_FEE_CONFIG.oldClient
  }
}

// 计算师父监管费
const calculateMentorSupervisionFee = (
  managementStartDate: string,
  checkPeriod: string
): number => {
  const inFirstThreeMonths = isInFirstThreeMonths(managementStartDate, checkPeriod)
  return inFirstThreeMonths
    ? MANAGEMENT_FEE_CONFIG.mentorSupervision.firstThreeMonths
    : MANAGEMENT_FEE_CONFIG.mentorSupervision.lastNineMonths
}

// 计算管理费（包含师父监管费）
const calculateFee = (
  managementStartDate: string,
  checkPeriod: string,
  isNewClient: boolean,
  isMentor: boolean
): { baseFee: number; mentorFee: number; total: number } => {
  const baseFee = calculateBaseFee(managementStartDate, checkPeriod, isNewClient)
  const mentorFee = isMentor ? calculateMentorSupervisionFee(managementStartDate, checkPeriod) : 0

  return {
    baseFee,
    mentorFee,
    total: baseFee + mentorFee
  }
}

// useManagementFee composable
export const useManagementFee = () => {
  const { getClientAssignment, getAllEmployees } = useEmployeeData()
  const { getEmployeeById } = useHRManagement()

  // 添加管理费记录
  const addManagementFee = (
    employeeId: string,
    employeeName: string,
    clientId: string,
    clientName: string,
    isNewClient: boolean,
    managementStartDate: string,
    period?: string,
    mentorId?: string
  ): ManagementFeeRecord => {
    const feePeriod = period || getCurrentPeriod()
    const employee = getEmployeeById(employeeId)
    const isMentor = employee?.role === 'mentor'

    // 计算管理费
    const feeCalculation = calculateFee(
      managementStartDate,
      feePeriod,
      isNewClient,
      isMentor || false
    )

    // 如果有师父监管费，需要单独记录给师傅
    const records: ManagementFeeRecord[] = []

    // 1. 基础管理费记录（给健康教练）
    const baseRecord: ManagementFeeRecord = {
      id: generateFeeId(),
      employeeId,
      employeeName,
      clientId,
      clientName,
      period: feePeriod,
      feeType: isNewClient ? 'new_user_management' : 'old_user_management',
      fee: feeCalculation.baseFee,
      details: isNewClient
        ? '新用户管理费（前三个月400元/月）'
        : '老用户管理费（100元/月）',
      status: 'pending',
      createdAt: new Date().toISOString(),
      managementStartDate,
      isNewClient
    }
    records.push(baseRecord)

    // 2. 师父监管费记录（如果有且是师傅）
    if (isMentor && feeCalculation.mentorFee > 0) {
      const mentorRecord: ManagementFeeRecord = {
        id: generateFeeId(),
        employeeId,
        employeeName,
        clientId,
        clientName,
        period: feePeriod,
        feeType: 'mentor_supervision',
        fee: feeCalculation.mentorFee,
        details: isInFirstThreeMonths(managementStartDate, feePeriod)
          ? '师父监管费（前三个月80元/月）'
          : '师父监管费（后九个月20元/月）',
        status: 'pending',
        createdAt: new Date().toISOString(),
        managementStartDate,
        mentorId,
        mentorName: employee?.name
      }
      records.push(mentorRecord)
    }

    // 添加所有记录到列表
    records.forEach(record => {
      managementFees.value.push(record)
    })

    // 通知监听器
    notifyFeeChange()

    return baseRecord  // 返回主记录
  }

  // 获取员工某月份的管理费记录
  const getEmployeeFees = (employeeId: string, period?: string): ManagementFeeRecord[] => {
    const targetPeriod = period || getCurrentPeriod()
    return managementFees.value.filter(
      fee => fee.employeeId === employeeId && fee.period === targetPeriod
    )
  }

  // 获取员工某月份的管理费总额
  const getEmployeeFeeTotal = (employeeId: string, period?: string): number => {
    const fees = getEmployeeFees(employeeId, period)
    return fees.reduce((sum, fee) => sum + fee.fee, 0)
  }

  // 获取所有待确认的管理费
  const getPendingFees = (period?: string): ManagementFeeRecord[] => {
    const targetPeriod = period || getCurrentPeriod()
    return managementFees.value.filter(
      fee => fee.period === targetPeriod && fee.status === 'pending'
    )
  }

  // 确认管理费
  const confirmFee = (
    feeId: string,
    confirmerId: string,
    confirmerName: string
  ): boolean => {
    const fee = managementFees.value.find(f => f.id === feeId)
    if (!fee || fee.status !== 'pending') {
      return false
    }

    fee.status = 'confirmed'
    fee.confirmedAt = new Date().toISOString()
    fee.confirmedBy = confirmerName

    notifyFeeChange()
    return true
  }

  // 批量确认管理费
  const batchConfirmFees = (
    feeIds: string[],
    confirmerId: string,
    confirmerName: string
  ): number => {
    let count = 0
    for (const feeId of feeIds) {
      if (confirmFee(feeId, confirmerId, confirmerName)) {
        count++
      }
    }
    return count
  }

  // 支付管理费
  const payFee = (
    feeId: string,
    payerId: string,
    payerName: string
  ): boolean => {
    const fee = managementFees.value.find(f => f.id === feeId)
    if (!fee || fee.status !== 'confirmed') {
      return false
    }

    fee.status = 'paid'
    fee.paidAt = new Date().toISOString()
    fee.paidBy = payerName

    notifyFeeChange()
    return true
  }

  // 处理用户分配变更
  const handleAssignmentChange = (
    clientId: string,
    clientName: string,
    employeeId: string,
    employeeName: string,
    isNewClient: boolean,
    action: 'assign' | 'change' | 'remove'
  ): void => {
    const period = getCurrentPeriod()

    if (action === 'assign' || action === 'change') {
      // 添加新的管理费记录
      addManagementFee(
        employeeId,
        employeeName,
        clientId,
        clientName,
        isNewClient,
        period
      )
    }
    // 如果是移除操作，不需要删除管理费记录（已产生的管理费仍需确认支付）
  }

  // 监听管理费变更事件
  const onFeeChange = (callback: () => void): (() => void) => {
    feeChangeListeners.value.push(callback)
    return () => {
      const index = feeChangeListeners.value.indexOf(callback)
      if (index > -1) {
        feeChangeListeners.value.splice(index, 1)
      }
    }
  }

  // 通知所有监听器
  const notifyFeeChange = (): void => {
    feeChangeListeners.value.forEach(callback => callback())
  }

  // 获取管理费统计
  const getFeeStatistics = (period?: string) => {
    const targetPeriod = period || getCurrentPeriod()
    const periodFees = managementFees.value.filter(fee => fee.period === targetPeriod)

    const byEmployee = periodFees.reduce((acc, fee) => {
      if (!acc[fee.employeeId]) {
        acc[fee.employeeId] = {
          employeeId: fee.employeeId,
          employeeName: fee.employeeName,
          totalFees: 0,
          newClientCount: 0,
          oldClientCount: 0,
          pendingCount: 0,
          confirmedCount: 0,
          paidCount: 0
        }
      }

      acc[fee.employeeId].totalFees += fee.fee
      if (fee.isNewClient) {
        acc[fee.employeeId].newClientCount++
      } else {
        acc[fee.employeeId].oldClientCount++
      }

      if (fee.status === 'pending') acc[fee.employeeId].pendingCount++
      else if (fee.status === 'confirmed') acc[fee.employeeId].confirmedCount++
      else if (fee.status === 'paid') acc[fee.employeeId].paidCount++

      return acc
    }, {} as Record<string, any>)

    const totalFees = periodFees.reduce((sum, fee) => sum + fee.fee, 0)
    const pendingAmount = periodFees.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.fee, 0)
    const confirmedAmount = periodFees.filter(f => f.status === 'confirmed').reduce((sum, f) => sum + f.fee, 0)
    const paidAmount = periodFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.fee, 0)

    return {
      period: targetPeriod,
      totalFees,
      pendingAmount,
      confirmedAmount,
      paidAmount,
      byEmployee: Object.values(byEmployee)
    }
  }

  // 导出管理费数据（用于薪酬结算）
  const exportForSettlement = (period?: string) => {
    const stats = getFeeStatistics(period)
    return stats.byEmployee.map((emp: any) => ({
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
      newUsers: emp.newClientCount,
      newUserAmount: emp.newClientCount * MANAGEMENT_FEE_CONFIG.newClient,
      oldUsers: emp.oldClientCount,
      oldUserAmount: emp.oldClientCount * MANAGEMENT_FEE_CONFIG.oldClient,
      managementFee: emp.totalFees,
      pendingFees: emp.pendingCount
    }))
  }

  // 计算属性
  const pendingFees = computed(() => getPendingFees())
  const totalPendingAmount = computed(() =>
    pendingFees.value.reduce((sum, fee) => sum + fee.fee, 0)
  )

  // 添加医生管理费记录
  const addDoctorManagementFee = (
    doctorId: string,
    doctorName: string,
    clientId: string,
    clientName: string,
    firstPaymentDate: string
  ): ManagementFeeRecord => {
    // 医生管理费：一年3000元，用户付费满一个月无退费后一次性结清
    const now = new Date()
    const currentPeriod = getCurrentPeriod()

    // 检查是否已满一个月
    const firstPayment = new Date(firstPaymentDate)
    const monthDiff = getMonthDifference(firstPaymentDate.toISOString().split('T')[0], now.toISOString().split('T')[0])

    if (monthDiff < 1) {
      throw new Error('用户付费未满一个月，暂不结算医生管理费')
    }

    // 检查是否已结算过
    const alreadySettled = managementFees.value.some(
      record => record.employeeId === doctorId &&
               record.clientId === clientId &&
               record.feeType === 'doctor_management'
    )

    if (alreadySettled) {
      throw new Error('该用户的医生管理费已结算')
    }

    const record: ManagementFeeRecord = {
      id: generateFeeId(),
      employeeId: doctorId,
      employeeName: doctorName,
      clientId,
      clientName,
      period: currentPeriod,
      feeType: 'doctor_management',
      fee: MANAGEMENT_FEE_CONFIG.doctor,
      details: '年度管理费（群内守护+复盘电话）',
      status: 'pending',
      createdAt: new Date().toISOString(),
      firstPaymentDate
    }

    managementFees.value.push(record)
    notifyFeeChange()

    return record
  }

  return {
    // 数据
    managementFees,
    pendingFees,
    totalPendingAmount,

    // 配置
    config: MANAGEMENT_FEE_CONFIG,

    // 核心方法
    addManagementFee,
    addDoctorManagementFee,
    getEmployeeFees,
    getEmployeeFeeTotal,
    getPendingFees,
    getFeeStatistics,

    // 确认和支付
    confirmFee,
    batchConfirmFees,
    payFee,

    // 分配变更处理
    handleAssignmentChange,

    // 事件监听
    onFeeChange,

    // 导出
    exportForSettlement
  }
}
