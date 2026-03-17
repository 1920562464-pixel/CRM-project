import { ref, computed } from 'vue'
import type { SystemLog } from '../types'

const LOGS_STORAGE_KEY = 'crm_system_logs'

// 日志数据
const logs = ref<SystemLog[]>([])

// 从 localStorage 加载日志
const loadLogsFromStorage = () => {
  try {
    const stored = localStorage.getItem(LOGS_STORAGE_KEY)
    if (stored) {
      logs.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load logs from storage:', error)
  }
}

// 保存日志到 localStorage
const saveLogsToStorage = () => {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs.value))
  } catch (error) {
    console.error('Failed to save logs to storage:', error)
  }
}

// 生成唯一ID
const generateLogId = (): string => {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 获取操作人信息（从当前登录用户）
const getCurrentOperator = () => {
  // TODO: 从 auth store 或其他状态管理获取当前用户信息
  return {
    id: 'admin_001',
    name: '系统管理员'
  }
}

// 获取客户端IP
const getClientIP = (): string => {
  // TODO: 实际项目中需要从请求头获取真实IP
  return '127.0.0.1'
}

// 核心日志记录函数
const addLog = (logData: Omit<SystemLog, 'id' | 'ip' | 'timestamp'>): SystemLog => {
  const operator = getCurrentOperator()
  const log: SystemLog = {
    id: generateLogId(),
    operator: logData.operator || operator.name,
    operatorId: logData.operatorId || operator.id,
    action: logData.action,
    module: logData.module,
    targetId: logData.targetId,
    targetType: logData.targetType,
    details: logData.details,
    relatedData: logData.relatedData,
    ip: getClientIP(),
    timestamp: new Date().toISOString(),
    status: logData.status || 'success'
  }

  logs.value.unshift(log)
  saveLogsToStorage()

  return log
}

// 记录分配教练
export const logAssignCoach = (
  clientId: string,
  clientName: string,
  employeeId: string,
  employeeName: string,
  isNewClient: boolean
): SystemLog => {
  return addLog({
    operator: '',
    operatorId: '',
    action: 'assign_coach',
    module: 'client_management',
    targetId: clientId,
    targetType: 'client',
    details: {
      clientId,
      clientName,
      description: `分配教练 ${employeeName} 给用户 ${clientName}`,
      after: {
        employeeId,
        employeeName,
        isNewClient
      }
    },
    relatedData: {
      employeeId,
      employeeName,
      isNewClient
    },
    status: 'success'
  })
}

// 记录更换教练
export const logChangeCoach = (
  clientId: string,
  clientName: string,
  oldEmployeeId: string,
  oldEmployeeName: string,
  newEmployeeId: string,
  newEmployeeName: string,
  isNewClient: boolean
): SystemLog => {
  return addLog({
    operator: '',
    operatorId: '',
    action: 'change_coach',
    module: 'client_management',
    targetId: clientId,
    targetType: 'client',
    details: {
      clientId,
      clientName,
      description: `将用户 ${clientName} 的教练从 ${oldEmployeeName} 更换为 ${newEmployeeName}`,
      before: {
        employeeId: oldEmployeeId,
        employeeName: oldEmployeeName
      },
      after: {
        employeeId: newEmployeeId,
        employeeName: newEmployeeName,
        isNewClient
      }
    },
    relatedData: {
      oldEmployeeId,
      oldEmployeeName,
      employeeId: newEmployeeId,
      employeeName: newEmployeeName,
      isNewClient
    },
    status: 'success'
  })
}

// 记录移除教练
export const logRemoveCoach = (
  clientId: string,
  clientName: string,
  employeeId: string,
  employeeName: string
): SystemLog => {
  return addLog({
    operator: '',
    operatorId: '',
    action: 'remove_coach',
    module: 'client_management',
    targetId: clientId,
    targetType: 'client',
    details: {
      clientId,
      clientName,
      description: `移除用户 ${clientName} 的教练 ${employeeName}`,
      before: {
        employeeId,
        employeeName
      }
    },
    relatedData: {
      employeeId,
      employeeName
    },
    status: 'success'
  })
}

// 记录分配医生
export const logAssignDoctor = (
  clientId: string,
  clientName: string,
  employeeId: string,
  employeeName: string
): SystemLog => {
  return addLog({
    operator: '',
    operatorId: '',
    action: 'assign_doctor',
    module: 'client_management',
    targetId: clientId,
    targetType: 'client',
    details: {
      clientId,
      clientName,
      description: `分配医生 ${employeeName} 给用户 ${clientName}`,
      after: {
        employeeId,
        employeeName
      }
    },
    relatedData: {
      employeeId,
      employeeName
    },
    status: 'success'
  })
}

// 记录更换医生
export const logChangeDoctor = (
  clientId: string,
  clientName: string,
  oldEmployeeId: string,
  oldEmployeeName: string,
  newEmployeeId: string,
  newEmployeeName: string
): SystemLog => {
  return addLog({
    operator: '',
    operatorId: '',
    action: 'change_doctor',
    module: 'client_management',
    targetId: clientId,
    targetType: 'client',
    details: {
      clientId,
      clientName,
      description: `将用户 ${clientName} 的医生从 ${oldEmployeeName} 更换为 ${newEmployeeName}`,
      before: {
        employeeId: oldEmployeeId,
        employeeName: oldEmployeeName
      },
      after: {
        employeeId: newEmployeeId,
        employeeName: newEmployeeName
      }
    },
    relatedData: {
      oldEmployeeId,
      oldEmployeeName,
      employeeId: newEmployeeId,
      employeeName: newEmployeeName
    },
    status: 'success'
  })
}

// 记录移除医生
export const logRemoveDoctor = (
  clientId: string,
  clientName: string,
  employeeId: string,
  employeeName: string
): SystemLog => {
  return addLog({
    operator: '',
    operatorId: '',
    action: 'remove_doctor',
    module: 'client_management',
    targetId: clientId,
    targetType: 'client',
    details: {
      clientId,
      clientName,
      description: `移除用户 ${clientName} 的医生 ${employeeName}`,
      before: {
        employeeId,
        employeeName
      }
    },
    relatedData: {
      employeeId,
      employeeName
    },
    status: 'success'
  })
}

// 查询日志
export const getLogs = (filters?: {
  module?: string
  action?: string
  targetId?: string
  targetType?: string
  startDate?: Date
  endDate?: Date
}): SystemLog[] => {
  let filtered = logs.value

  if (filters) {
    if (filters.module) {
      filtered = filtered.filter(log => log.module === filters.module)
    }
    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action)
    }
    if (filters.targetId) {
      filtered = filtered.filter(log => log.targetId === filters.targetId)
    }
    if (filters.targetType) {
      filtered = filtered.filter(log => log.targetType === filters.targetType)
    }
    if (filters.startDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= filters.startDate!)
    }
    if (filters.endDate) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= filters.endDate!)
    }
  }

  return filtered
}

// 获取日志统计
export const getLogStatistics = () => {
  return computed(() => {
    const total = logs.value.length
    const today = new Date().toDateString()
    const todayLogs = logs.value.filter(log =>
      new Date(log.timestamp).toDateString() === today
    )

    const byAction = logs.value.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byModule = logs.value.reduce((acc, log) => {
      acc[log.module] = (acc[log.module] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      todayCount: todayLogs.length,
      byAction,
      byModule
    }
  })
}

// 清理过期日志（保留最近N天）
export const cleanOldLogs = (daysToKeep: number = 90) => {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  const beforeCount = logs.value.length
  logs.value = logs.value.filter(log => new Date(log.timestamp) >= cutoffDate)
  const deletedCount = beforeCount - logs.value.length

  saveLogsToStorage()
  return deletedCount
}

// 导出日志
export const exportLogs = (format: 'json' | 'csv' = 'json') => {
  if (format === 'json') {
    return JSON.stringify(logs.value, null, 2)
  } else {
    // CSV 导出
    const headers = ['ID', '操作人', '操作', '模块', '目标ID', '目标类型', '详情', 'IP', '时间', '状态']
    const rows = logs.value.map(log => [
      log.id,
      log.operator,
      log.action,
      log.module,
      log.targetId,
      log.targetType,
      log.details.description,
      log.ip,
      log.timestamp,
      log.status
    ])
    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }
}

// useSystemLog composable
export const useSystemLog = () => {
  // 初始化时加载日志
  if (logs.value.length === 0) {
    loadLogsFromStorage()
  }

  return {
    // 数据
    logs,

    // 核心方法
    addLog,

    // 便捷方法
    logAssignCoach,
    logChangeCoach,
    logRemoveCoach,
    logAssignDoctor,
    logChangeDoctor,
    logRemoveDoctor,

    // 查询方法
    getLogs,
    getLogStatistics,

    // 管理方法
    cleanOldLogs,
    exportLogs
  }
}
