/**
 * 用户健康风险预测相关类型定义
 * 用于健康风险评估、风险预测和干预建议
 */

// ============ 健康监测数据（输入） ============

/**
 * 心率数据
 */
export interface HeartRateData {
  /** 平均心率 */
  avg: number
  /** 最大心率 */
  max: number
  /** 最小心率 */
  min: number
  /** 异常次数 */
  abnormalCount: number
}

/**
 * 血压数据
 */
export interface BloodPressureData {
  /** 收缩压（高压） */
  systolic: number
  /** 舒张压（低压） */
  diastolic: number
  /** 趋势 */
  trend: 'stable' | 'rising' | 'falling'
}

/**
 * 睡眠数据
 */
export interface SleepData {
  /** 睡眠时长（小时） */
  duration: number
  /** 睡眠质量评分（0-100） */
  quality: number
  /** 睡眠中断次数 */
  disturbanceCount: number
}

/**
 * 活动数据
 */
export interface ActivityData {
  /** 步数 */
  steps: number
  /** 活动距离（米） */
  distance: number
  /** 活跃时长（分钟） */
  activeMinutes: number
}

/**
 * 任务完成数据
 */
export interface TaskCompletionData {
  /** 总任务数 */
  totalTasks: number
  /** 已完成任务数 */
  completedTasks: number
  /** 未完成任务数 */
  incompleteTasks: number
  /** 平均完成时长（分钟） */
  avgDuration: number
  /** 中断任务数 */
  interruptedTasks: number
}

/**
 * 健康评估数据
 */
export interface HealthAssessmentData {
  /** 年龄 */
  age: number
  /** 衰老指数（0-100） */
  agingIndex: number
  /** 体能评分（0-100） */
  fitnessScore: number
  /** 基础疾病列表 */
  chronicDiseases: string[]
}

/**
 * 健康监测数据（输入）
 */
export interface HealthMonitorData {
  /** 用户ID */
  userId: string
  /** 用户姓名 */
  userName: string
  /** 监测时间 */
  monitoredAt: string

  // 生理行为数据
  /** 心率数据 */
  heartRate: HeartRateData
  /** 血压数据 */
  bloodPressure: BloodPressureData
  /** 睡眠数据 */
  sleep: SleepData
  /** 活动数据 */
  activity: ActivityData

  // 任务行为数据
  /** 任务完成数据 */
  taskCompletion: TaskCompletionData

  // 健康评估数据
  /** 健康评估数据 */
  healthAssessment: HealthAssessmentData
}

// ============ 风险预测结果（输出） ============

/**
 * 风险等级
 */
export type RiskLevel = 'high' | 'medium' | 'low'

/**
 * 风险因子类别
 */
export type RiskFactorCategory = 'physiological' | 'behavioral' | 'assessment'

/**
 * 风险严重程度
 */
export type RiskSeverity = 'critical' | 'warning' | 'info'

/**
 * 干预优先级
 */
export type InterventionPriority = 'urgent' | 'recommended' | 'optional'

/**
 * 风险因子
 */
export interface RiskFactor {
  /** 类别 */
  category: RiskFactorCategory
  /** 风险因子名称 */
  name: string
  /** 严重程度 */
  severity: RiskSeverity
  /** 触发原因 */
  description: string
  /** 当前值 */
  currentValue: string
  /** 阈值 */
  threshold: string
  /** 权重（0-1） */
  weight: number
}

/**
 * 干预建议
 */
export interface Intervention {
  /** 优先级 */
  priority: InterventionPriority
  /** 干预措施 */
  action: string
  /** 目标对象（用户/家属/教练） */
  target: string
  /** 建议原因 */
  reason: string
}

/**
 * 关键指标异常次数
 */
export interface KeyIndicators {
  /** 心率异常次数 */
  heartRateAbnormal: number
  /** 血压异常次数 */
  bloodPressureAbnormal: number
  /** 睡眠异常次数 */
  sleepAbnormal: number
  /** 任务未完成次数 */
  taskIncomplete: number
  /** 活动量不足次数 */
  activityInsufficient: number
}

/**
 * 风险预测结果
 */
export interface RiskPrediction {
  /** 预测ID */
  id: string
  /** 用户ID */
  userId: string
  /** 用户姓名 */
  userName: string
  /** 用户年龄 */
  userAge: number

  // 风险等级
  /** 风险等级 */
  riskLevel: RiskLevel
  /** 风险评分（0-100，越高越危险） */
  riskScore: number

  // 触发的风险因子
  /** 触发的风险因子 */
  triggeredFactors: RiskFactor[]

  // 预测时间
  /** 预测时间 */
  predictedAt: string
  /** 有效期至 */
  validUntil: string

  // 干预建议
  /** 干预建议 */
  interventions: Intervention[]

  // 关键指标（新增）
  /** 关键指标异常次数 */
  keyIndicators?: KeyIndicators
}

// ============ 风险统计 ============

/**
 * 风险统计
 */
export interface RiskStats {
  /** 高风险数量 */
  high: number
  /** 中风险数量 */
  medium: number
  /** 低风险数量 */
  low: number
  /** 总数 */
  total: number
}

// ============ 预警系统集成 ============

/**
 * 扩展预警接口（兼容现有系统）
 */
export interface ExtendedAlert {
  /** 预警ID */
  id: string
  /** 预警类型 */
  type: 'financial' | 'risk-prediction'
  /** 严重程度 */
  severity: 'critical' | 'warning' | 'info'
  /** 标题 */
  title: string
  /** 描述 */
  description: string
  /** 当前值 */
  currentValue: string
  /** 阈值 */
  threshold: string
  /** 状态 */
  status: 'pending' | 'resolved' | 'dismissed'
  /** 创建时间 */
  createdAt: string
  /** 建议措施 */
  suggestions: string[]
  /** 关联风险预测ID */
  predictionId?: string
  /** 标记为预测性预警 */
  isPredictive?: boolean
  /** 用户ID（风险预测专用） */
  userId?: string
  /** 用户姓名（风险预测专用） */
  userName?: string
  /** 用户年龄（风险预测专用） */
  userAge?: number
}

// ============ 消息推送 ============

/**
 * 推送通知（风险预测专用）
 */
export interface RiskPushNotification {
  /** 通知类型 */
  type: 'risk-prediction'
  /** 风险等级 */
  level: RiskLevel
  /** 用户ID */
  userId: string
  /** 消息内容 */
  message: string
  /** 跳转链接 */
  actionUrl: string
  /** 发送时间 */
  sentAt: string
}
