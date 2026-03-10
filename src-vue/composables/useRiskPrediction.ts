/**
 * 用户健康风险预测核心算法
 * 基于多维度加权拟合的风险评分模型
 */

import { ref, computed } from 'vue'
import type {
  HealthMonitorData,
  RiskPrediction,
  RiskFactor,
  Intervention,
  RiskStats,
  RiskLevel
} from '../types/risk'

/**
 * 风险预测 Composable
 */
export function useRiskPrediction() {
  const riskPredictions = ref<RiskPrediction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 计算生理风险（权重40%）
   */
  function calculatePhysiologicalRisk(data: HealthMonitorData): number {
    let risk = 0

    // 心率异常（最高30分）
    if (data.heartRate.abnormalCount >= 5) {
      risk += 30
    } else if (data.heartRate.abnormalCount >= 3) {
      risk += 20
    } else if (data.heartRate.abnormalCount >= 1) {
      risk += 10
    }

    // 血压异常（最高25分）
    if (data.bloodPressure.systolic > 160 || data.bloodPressure.systolic < 90) {
      risk += 25
    } else if (data.bloodPressure.systolic > 140 || data.bloodPressure.systolic < 100) {
      risk += 15
    }

    // 睡眠不足（最高25分）
    if (data.sleep.duration < 5) {
      risk += 25
    } else if (data.sleep.duration < 6) {
      risk += 15
    } else if (data.sleep.duration < 7) {
      risk += 5
    }

    // 活动量不足（最高20分）
    if (data.activity.steps < 2000) {
      risk += 20
    } else if (data.activity.steps < 5000) {
      risk += 10
    }

    return Math.min(100, risk)
  }

  /**
   * 计算行为风险（权重35%）
   */
  function calculateBehavioralRisk(data: HealthMonitorData): number {
    let risk = 0

    // 任务完成率低（最高40分）
    const completionRate = data.taskCompletion.totalTasks > 0
      ? data.taskCompletion.completedTasks / data.taskCompletion.totalTasks
      : 1

    if (completionRate < 0.5) {
      risk += 40
    } else if (completionRate < 0.7) {
      risk += 25
    } else if (completionRate < 0.85) {
      risk += 10
    }

    // 任务中断频繁（最高30分）
    if (data.taskCompletion.interruptedTasks >= 5) {
      risk += 30
    } else if (data.taskCompletion.interruptedTasks >= 3) {
      risk += 15
    }

    // 完成时长异常（最高30分）
    if (data.taskCompletion.avgDuration > 120) {
      risk += 30
    } else if (data.taskCompletion.avgDuration > 90) {
      risk += 15
    }

    return Math.min(100, risk)
  }

  /**
   * 计算基础风险（权重25%）
   */
  function calculateBaselineRisk(data: HealthMonitorData): number {
    let risk = 0

    // 年龄风险（最高30分）
    if (data.healthAssessment.age >= 80) {
      risk += 30
    } else if (data.healthAssessment.age >= 70) {
      risk += 20
    } else if (data.healthAssessment.age >= 60) {
      risk += 10
    }

    // 衰老指数（最高40分）
    if (data.healthAssessment.agingIndex >= 80) {
      risk += 40
    } else if (data.healthAssessment.agingIndex >= 60) {
      risk += 25
    } else if (data.healthAssessment.agingIndex >= 40) {
      risk += 10
    }

    // 体能评分低（最高30分）
    if (data.healthAssessment.fitnessScore < 40) {
      risk += 30
    } else if (data.healthAssessment.fitnessScore < 60) {
      risk += 15
    }

    // 基础疾病（额外加分，最多20分）
    const diseaseCount = data.healthAssessment.chronicDiseases.length
    if (diseaseCount >= 3) {
      risk += 20
    } else if (diseaseCount >= 2) {
      risk += 15
    } else if (diseaseCount >= 1) {
      risk += 5
    }

    return Math.min(100, risk)
  }

  /**
   * 计算综合风险评分（0-100）
   */
  function calculateRiskScore(data: HealthMonitorData): number {
    const scores = {
      physiological: calculatePhysiologicalRisk(data) * 0.4,
      behavioral: calculateBehavioralRisk(data) * 0.35,
      baseline: calculateBaselineRisk(data) * 0.25
    }

    return Math.round(
      scores.physiological +
      scores.behavioral +
      scores.baseline
    )
  }

  /**
   * 获取风险等级
   */
  function getRiskLevel(score: number): RiskLevel {
    if (score >= 70) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  }

  /**
   * 识别风险因子
   */
  function identifyRiskFactors(data: HealthMonitorData): RiskFactor[] {
    const factors: RiskFactor[] = []

    // 心率异常
    if (data.heartRate.abnormalCount >= 3) {
      factors.push({
        category: 'physiological',
        name: '心率异常',
        severity: data.heartRate.abnormalCount >= 5 ? 'critical' : 'warning',
        description: `连续${data.heartRate.abnormalCount}次心率监测异常`,
        currentValue: `${data.heartRate.avg} bpm`,
        threshold: '60-100 bpm',
        weight: 0.3
      })
    }

    // 血压异常
    if (data.bloodPressure.systolic > 140 || data.bloodPressure.systolic < 100) {
      factors.push({
        category: 'physiological',
        name: '血压异常',
        severity: data.bloodPressure.systolic > 160 || data.bloodPressure.systolic < 90 ? 'critical' : 'warning',
        description: data.bloodPressure.trend === 'rising' ? '血压持续上升趋势' : '血压超出正常范围',
        currentValue: `${data.bloodPressure.systolic}/${data.bloodPressure.diastolic} mmHg`,
        threshold: '90-140 / 60-90 mmHg',
        weight: 0.25
      })
    }

    // 睡眠不足
    if (data.sleep.duration < 6) {
      factors.push({
        category: 'physiological',
        name: '睡眠不足',
        severity: data.sleep.duration < 5 ? 'critical' : 'warning',
        description: '连续3天平均睡眠时长不足6小时',
        currentValue: `${data.sleep.duration}小时`,
        threshold: '≥7小时',
        weight: 0.25
      })
    }

    // 活动量不足
    if (data.activity.steps < 5000) {
      factors.push({
        category: 'physiological',
        name: '活动量不足',
        severity: data.activity.steps < 2000 ? 'critical' : 'warning',
        description: '日均步数偏低，可能导致身体机能下降',
        currentValue: `${data.activity.steps}步`,
        threshold: '≥6000步',
        weight: 0.2
      })
    }

    // 任务完成率低
    const completionRate = data.taskCompletion.totalTasks > 0
      ? data.taskCompletion.completedTasks / data.taskCompletion.totalTasks
      : 1

    if (completionRate < 0.7) {
      factors.push({
        category: 'behavioral',
        name: '健康任务执行偏差',
        severity: completionRate < 0.5 ? 'critical' : 'warning',
        description: '本周健康任务完成率低于70%',
        currentValue: `${Math.round(completionRate * 100)}%`,
        threshold: '≥85%',
        weight: 0.35
      })
    }

    // 任务中断频繁
    if (data.taskCompletion.interruptedTasks >= 3) {
      factors.push({
        category: 'behavioral',
        name: '任务频繁中断',
        severity: data.taskCompletion.interruptedTasks >= 5 ? 'critical' : 'warning',
        description: `本周${data.taskCompletion.interruptedTasks}次任务中断，可能影响健康干预效果`,
        currentValue: `${data.taskCompletion.interruptedTasks}次`,
        threshold: '≤2次',
        weight: 0.3
      })
    }

    // 高龄风险
    if (data.healthAssessment.age >= 75) {
      factors.push({
        category: 'assessment',
        name: '高龄风险',
        severity: data.healthAssessment.age >= 80 ? 'critical' : 'warning',
        description: '年龄超过75岁，跌倒风险增加',
        currentValue: `${data.healthAssessment.age}岁`,
        threshold: '<75岁',
        weight: 0.2
      })
    }

    // 衰老指数高
    if (data.healthAssessment.agingIndex >= 60) {
      factors.push({
        category: 'assessment',
        name: '衰老指数偏高',
        severity: data.healthAssessment.agingIndex >= 80 ? 'critical' : 'warning',
        description: '身体机能衰老加速，需要关注健康指标',
        currentValue: `${data.healthAssessment.agingIndex}`,
        threshold: '<60',
        weight: 0.4
      })
    }

    // 体能评分低
    if (data.healthAssessment.fitnessScore < 60) {
      factors.push({
        category: 'assessment',
        name: '体能评分偏低',
        severity: data.healthAssessment.fitnessScore < 40 ? 'critical' : 'warning',
        description: '体能状况不佳，建议加强锻炼',
        currentValue: `${data.healthAssessment.fitnessScore}`,
        threshold: '≥60',
        weight: 0.3
      })
    }

    // 基础疾病风险
    if (data.healthAssessment.chronicDiseases.length > 0) {
      factors.push({
        category: 'assessment',
        name: '基础疾病风险',
        severity: data.healthAssessment.chronicDiseases.length >= 3 ? 'critical' : 'warning',
        description: `存在${data.healthAssessment.chronicDiseases.length}种基础疾病，需要定期监测`,
        currentValue: data.healthAssessment.chronicDiseases.join('、'),
        threshold: '无基础疾病',
        weight: 0.2
      })
    }

    return factors.sort((a, b) => b.weight - a.weight)
  }

  /**
   * 生成干预建议
   */
  function generateInterventions(
    data: HealthMonitorData,
    riskLevel: RiskLevel,
    factors: RiskFactor[]
  ): Intervention[] {
    const interventions: Intervention[] = []

    // 根据风险因子生成针对性建议
    factors.forEach(factor => {
      switch (factor.name) {
        case '心率异常':
          interventions.push({
            priority: 'urgent',
            action: '安排心电图检查',
            target: '用户',
            reason: '心率监测异常，需要及时医学检查'
          })
          interventions.push({
            priority: 'urgent',
            action: '联系用户家属',
            target: '家属',
            reason: '心率异常可能危及安全，建议家属关注'
          })
          break

        case '睡眠不足':
          interventions.push({
            priority: 'recommended',
            action: '调整作息时间',
            target: '用户',
            reason: '保证充足睡眠对健康恢复至关重要'
          })
          interventions.push({
            priority: 'recommended',
            action: '睡前放松训练',
            target: '用户',
            reason: '改善睡眠质量，减少夜间中断'
          })
          break

        case '健康任务执行偏差':
          interventions.push({
            priority: 'recommended',
            action: '教练跟进督促',
            target: '教练',
            reason: '提高用户健康任务执行率和依从性'
          })
          interventions.push({
            priority: 'optional',
            action: '简化任务难度',
            target: '用户',
            reason: '适当降低任务难度，提高完成率'
          })
          break

        case '高龄风险':
          interventions.push({
            priority: 'urgent',
            action: '增加防跌倒措施',
            target: '用户',
            reason: '高龄用户跌倒风险较高，需要预防'
          })
          interventions.push({
            priority: 'recommended',
            action: '每日安全确认',
            target: '教练',
            reason: '建立每日安全确认机制'
          })
          break

        case '活动量不足':
          interventions.push({
            priority: 'recommended',
            action: '制定个性化运动计划',
            target: '教练',
            reason: '逐步增加运动量，提高身体机能'
          })
          break
      }
    })

    // 根据风险等级添加通用建议
    if (riskLevel === 'high') {
      interventions.push({
        priority: 'urgent',
        action: '立即安排健康评估',
        target: '用户',
        reason: '高风险状态需要专业评估和干预'
      })
      interventions.push({
        priority: 'urgent',
        action: '通知家属关注',
        target: '家属',
        reason: '高风险状态建议家属共同关注'
      })
    } else if (riskLevel === 'medium') {
      interventions.push({
        priority: 'recommended',
        action: '增加教练沟通频率',
        target: '教练',
        reason: '中风险状态建议加强跟进'
      })
    }

    return interventions
  }

  /**
   * 预测单个用户风险
   */
  function predictRisk(data: HealthMonitorData): RiskPrediction {
    const riskScore = calculateRiskScore(data)
    const riskLevel = getRiskLevel(riskScore)
    const triggeredFactors = identifyRiskFactors(data)
    const interventions = generateInterventions(data, riskLevel, triggeredFactors)

    const now = new Date()
    const validUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24小时有效

    // 计算血压异常次数（基于收缩压偏离程度）
    const bpAbnormal = data.bloodPressure.systolic > 140 || data.bloodPressure.systolic < 90
      ? Math.min(Math.ceil(Math.abs(data.bloodPressure.systolic - 120) / 10), 20)
      : 0

    // 计算活动量不足次数（基于步数不足）
    const activityInsufficient = data.activity.steps < 5000
      ? Math.ceil((5000 - data.activity.steps) / 1000)
      : 0

    return {
      id: `risk-${data.userId}-${Date.now()}`,
      userId: data.userId,
      userName: data.userName,
      userAge: data.healthAssessment.age,
      riskLevel,
      riskScore,
      triggeredFactors,
      predictedAt: now.toISOString(),
      validUntil: validUntil.toISOString(),
      interventions,
      keyIndicators: {
        heartRateAbnormal: data.heartRate.abnormalCount,
        bloodPressureAbnormal: bpAbnormal,
        sleepAbnormal: data.sleep.disturbanceCount,
        taskIncomplete: data.taskCompletion.incompleteTasks,
        activityInsufficient: activityInsufficient
      }
    }
  }

  /**
   * 批量预测用户风险
   */
  function batchPredict(usersData: HealthMonitorData[]): RiskPrediction[] {
    return usersData.map(data => predictRisk(data))
  }

  /**
   * 刷新风险预测数据（模拟API调用）
   */
  async function refreshPredictions(usersData?: HealthMonitorData[]): Promise<void> {
    loading.value = true
    error.value = null

    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (usersData) {
        riskPredictions.value = batchPredict(usersData)
      } else {
        // 如果没有提供数据，使用模拟数据
        const mockData = generateMockHealthData()
        riskPredictions.value = batchPredict(mockData)
      }

      loading.value = false
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载风险预测数据失败'
      loading.value = false
    }
  }

  /**
   * 获取风险统计
   */
  const getRiskStats = computed((): RiskStats => {
    const predictions = riskPredictions.value
    return {
      high: predictions.filter(r => r.riskLevel === 'high').length,
      medium: predictions.filter(r => r.riskLevel === 'medium').length,
      low: predictions.filter(r => r.riskLevel === 'low').length,
      total: predictions.length
    }
  })

  /**
   * 按风险等级过滤
   */
  function getPredictionsByLevel(level: RiskLevel | 'all'): RiskPrediction[] {
    if (level === 'all') {
      return riskPredictions.value
    }
    return riskPredictions.value.filter(r => r.riskLevel === level)
  }

  /**
   * 获取高风险用户列表
   */
  const getHighRiskUsers = computed(() => {
    return riskPredictions.value
      .filter(r => r.riskLevel === 'high')
      .sort((a, b) => b.riskScore - a.riskScore)
  })

  return {
    // 状态
    riskPredictions,
    loading,
    error,

    // 方法
    predictRisk,
    batchPredict,
    refreshPredictions,
    getPredictionsByLevel,

    // 计算属性
    getRiskStats,
    getHighRiskUsers
  }
}

/**
 * 生成模拟健康监测数据
 * 用于开发和测试
 */
function generateMockHealthData(): HealthMonitorData[] {
  return [
    {
      userId: 'u001',
      userName: '张三',
      monitoredAt: new Date().toISOString(),
      heartRate: { avg: 95, max: 120, min: 65, abnormalCount: 6 },
      bloodPressure: { systolic: 165, diastolic: 95, trend: 'rising' },
      sleep: { duration: 4.5, quality: 45, disturbanceCount: 8 },
      activity: { steps: 1500, distance: 800, activeMinutes: 15 },
      taskCompletion: {
        totalTasks: 10,
        completedTasks: 4,
        incompleteTasks: 6,
        avgDuration: 135,
        interruptedTasks: 6
      },
      healthAssessment: {
        age: 82,
        agingIndex: 85,
        fitnessScore: 35,
        chronicDiseases: ['高血压', '糖尿病', '冠心病']
      }
    },
    {
      userId: 'u002',
      userName: '李四',
      monitoredAt: new Date().toISOString(),
      heartRate: { avg: 82, max: 100, min: 70, abnormalCount: 2 },
      bloodPressure: { systolic: 135, diastolic: 85, trend: 'stable' },
      sleep: { duration: 5.5, quality: 55, disturbanceCount: 4 },
      activity: { steps: 4500, distance: 2500, activeMinutes: 35 },
      taskCompletion: {
        totalTasks: 10,
        completedTasks: 6,
        incompleteTasks: 4,
        avgDuration: 85,
        interruptedTasks: 3
      },
      healthAssessment: {
        age: 72,
        agingIndex: 65,
        fitnessScore: 55,
        chronicDiseases: ['高血压']
      }
    },
    {
      userId: 'u003',
      userName: '王五',
      monitoredAt: new Date().toISOString(),
      heartRate: { avg: 75, max: 95, min: 65, abnormalCount: 0 },
      bloodPressure: { systolic: 120, diastolic: 80, trend: 'stable' },
      sleep: { duration: 7.5, quality: 80, disturbanceCount: 1 },
      activity: { steps: 8500, distance: 5000, activeMinutes: 60 },
      taskCompletion: {
        totalTasks: 10,
        completedTasks: 9,
        incompleteTasks: 1,
        avgDuration: 45,
        interruptedTasks: 1
      },
      healthAssessment: {
        age: 65,
        agingIndex: 35,
        fitnessScore: 75,
        chronicDiseases: []
      }
    },
    {
      userId: 'u004',
      userName: '赵六',
      monitoredAt: new Date().toISOString(),
      heartRate: { avg: 88, max: 110, min: 72, abnormalCount: 4 },
      bloodPressure: { systolic: 155, diastolic: 90, trend: 'rising' },
      sleep: { duration: 5.0, quality: 50, disturbanceCount: 5 },
      activity: { steps: 3000, distance: 1500, activeMinutes: 25 },
      taskCompletion: {
        totalTasks: 10,
        completedTasks: 5,
        incompleteTasks: 5,
        avgDuration: 100,
        interruptedTasks: 4
      },
      healthAssessment: {
        age: 78,
        agingIndex: 70,
        fitnessScore: 45,
        chronicDiseases: ['糖尿病', '关节炎']
      }
    },
    {
      userId: 'u005',
      userName: '孙七',
      monitoredAt: new Date().toISOString(),
      heartRate: { avg: 72, max: 90, min: 62, abnormalCount: 0 },
      bloodPressure: { systolic: 118, diastolic: 75, trend: 'stable' },
      sleep: { duration: 8.0, quality: 85, disturbanceCount: 0 },
      activity: { steps: 10000, distance: 6000, activeMinutes: 75 },
      taskCompletion: {
        totalTasks: 10,
        completedTasks: 10,
        incompleteTasks: 0,
        avgDuration: 40,
        interruptedTasks: 0
      },
      healthAssessment: {
        age: 58,
        agingIndex: 25,
        fitnessScore: 85,
        chronicDiseases: []
      }
    }
  ]
}
