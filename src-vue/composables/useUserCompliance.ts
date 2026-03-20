import { ref, watch } from 'vue'

export type ComplianceScore = number // 0-10的评分

interface UserCompliance {
  [userId: string]: ComplianceScore
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
  // 获取用户依从度评分
  const getUserCompliance = (userId: string): ComplianceScore => {
    return userCompliance.value[userId] ?? 5 // 默认5分
  }

  // 设置用户依从度评分
  const setUserCompliance = (userId: string, score: ComplianceScore) => {
    userCompliance.value[userId] = Math.max(0, Math.min(10, score)) // 确保在0-10范围内
  }

  // 将百分比转换为评分（0-10）
  const percentageToScore = (percentage: number): ComplianceScore => {
    return Math.round((percentage / 100) * 10)
  }

  // 获取评分对应的颜色
  const getComplianceColor = (score: ComplianceScore) => {
    const normalizedScore = Math.max(0, Math.min(10, score))

    if (normalizedScore >= 9) {
      // 9-10分：优秀（绿色）
      return {
        bg: 'rgba(34, 197, 94, 0.1)',
        text: '#16a34a',
        border: '#86efac'
      }
    } else if (normalizedScore >= 7) {
      // 7-8分：良好（蓝色）
      return {
        bg: 'rgba(59, 130, 246, 0.1)',
        text: '#3b82f6',
        border: '#93c5fd'
      }
    } else if (normalizedScore >= 5) {
      // 5-6分：一般（黄色）
      return {
        bg: 'rgba(251, 191, 36, 0.1)',
        text: '#d97706',
        border: '#fcd34d'
      }
    } else if (normalizedScore >= 3) {
      // 3-4分：较差（橙色）
      return {
        bg: 'rgba(249, 115, 22, 0.1)',
        text: '#ea580c',
        border: '#fdba74'
      }
    } else {
      // 0-2分：很差（红色）
      return {
        bg: 'rgba(239, 68, 68, 0.1)',
        text: '#dc2626',
        border: '#fca5a5'
      }
    }
  }

  // 初始化用户默认依从度评分（如果不存在）
  const initUserCompliance = (userId: string, defaultPercentage?: number) => {
    if (userCompliance.value[userId] === undefined) {
      if (defaultPercentage !== undefined) {
        userCompliance.value[userId] = percentageToScore(defaultPercentage)
      } else {
        userCompliance.value[userId] = 5 // 默认5分
      }
    }
  }

  return {
    userCompliance,
    getUserCompliance,
    setUserCompliance,
    percentageToScore,
    getComplianceColor,
    initUserCompliance
  }
}
