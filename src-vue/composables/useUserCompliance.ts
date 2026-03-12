import { ref, watch } from 'vue'

export type ComplianceLevel = '优秀' | '良好' | '一般' | '较差' | '未知'

interface UserCompliance {
  [userId: string]: ComplianceLevel
}

// 从localStorage加载依从度数据
const loadUserCompliance = (): UserCompliance => {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem('userCompliance')
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// 保存依从度数据到localStorage
const saveUserCompliance = (compliance: UserCompliance) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('userCompliance', JSON.stringify(compliance))
  } catch (error) {
    console.error('Failed to save user compliance:', error)
  }
}

// 全局用户依从度存储
const userCompliance = ref<UserCompliance>(loadUserCompliance())

// 监听变化并自动保存
watch(userCompliance, (newCompliance) => {
  saveUserCompliance(newCompliance)
}, { deep: true })

export function useUserCompliance() {
  // 获取用户依从度
  const getUserCompliance = (userId: string): ComplianceLevel => {
    return userCompliance.value[userId] || '未知'
  }

  // 设置用户依从度
  const setUserCompliance = (userId: string, level: ComplianceLevel) => {
    userCompliance.value[userId] = level
  }

  // 将百分比转换为依从度等级
  const percentageToLevel = (percentage: number): ComplianceLevel => {
    if (percentage >= 90) return '优秀'
    if (percentage >= 75) return '良好'
    if (percentage >= 60) return '一般'
    return '较差'
  }

  // 获取依从度对应的颜色
  const getComplianceColor = (level: ComplianceLevel) => {
    switch (level) {
      case '优秀':
        return {
          bg: 'rgba(34, 197, 94, 0.1)',
          text: '#16a34a',
          border: '#86efac'
        }
      case '良好':
        return {
          bg: 'rgba(59, 130, 246, 0.1)',
          text: '#3b82f6',
          border: '#93c5fd'
        }
      case '一般':
        return {
          bg: 'rgba(251, 191, 36, 0.1)',
          text: '#d97706',
          border: '#fcd34d'
        }
      case '较差':
        return {
          bg: 'rgba(239, 68, 68, 0.1)',
          text: '#dc2626',
          border: '#fca5a5'
        }
      case '未知':
      default:
        return {
          bg: 'rgba(148, 163, 184, 0.1)',
          text: '#64748b',
          border: '#cbd5e1'
        }
    }
  }

  // 初始化用户默认依从度（如果不存在）
  const initUserCompliance = (userId: string, defaultPercentage?: number) => {
    if (!userCompliance.value[userId]) {
      if (defaultPercentage !== undefined) {
        userCompliance.value[userId] = percentageToLevel(defaultPercentage)
      } else {
        userCompliance.value[userId] = '未知'
      }
    }
  }

  return {
    userCompliance,
    getUserCompliance,
    setUserCompliance,
    percentageToLevel,
    getComplianceColor,
    initUserCompliance
  }
}
