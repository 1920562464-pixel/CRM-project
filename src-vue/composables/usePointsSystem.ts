import { ref, computed, watch } from 'vue'

// 单条积分记录
export interface PointRecord {
  id: string
  type: PointType
  points: number
  name: string
  date: string
  time: string
  createdAt: string
  iconClass: string
}

// 积分类型
export type PointType =
  | 'courseReading'
  | 'mealUpload'
  | 'healthCheckin'
  | 'obstacleReport'
  | 'liveWatching'
  | 'weightLossResult'
  | 'manualAdjustment'

// 积分类型定义
export interface UserPoints {
  userId: string
  userName: string
  avatarColor: string
  department?: string
  community?: string
  totalPoints: number
  weeklyPoints: number
  rank: number
  weeklyRank: number
  pointDetails: PointDetails
  pointRecords: PointRecord[] // 新增：积分记录列表
}

export interface PointDetails {
  // 系统自动统计
  courseReading: number // 课件阅读
  mealUpload: number // 饮食数据上传
  healthCheckin: number // 健康打卡
  obstacleReport: number // 阻碍需求提报

  // 人工手动补充
  liveWatching: number // 观看直播
  weightLossResult: number // 减重成效
  manualAdjustment: number // 人工调整
}

// 创建新的 PointDetails
const createPointDetails = (): PointDetails => {
  return {
    courseReading: 0,
    mealUpload: 0,
    healthCheckin: 0,
    obstacleReport: 0,
    liveWatching: 0,
    weightLossResult: 0,
    manualAdjustment: 0
  }
}

// 计算总分（从积分记录列表计算）
const getTotalPoints = (records: PointRecord[]): number => {
  return records.reduce((sum, record) => sum + record.points, 0)
}

// 根据积分记录计算pointDetails
const calculatePointDetails = (records: PointRecord[]): PointDetails => {
  const details = createPointDetails()
  records.forEach(record => {
    details[record.type] = (details[record.type] || 0) + record.points
  })
  return details
}

// 排行榜类型
export type RankingType = 'personal' | 'community' | 'department'

// 从 localStorage 加载积分数据
const loadPointsData = (): { [userId: string]: UserPoints } => {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem('userPointsData')
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

// 保存积分数据到 localStorage
const savePointsData = (data: { [userId: string]: UserPoints }) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('userPointsData', JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save points data:', error)
  }
}

// 全局积分数据存储
const pointsData = ref<{ [userId: string]: UserPoints }>(loadPointsData())

// 监听变化并自动保存
watch(pointsData, (newData) => {
  savePointsData(newData)
}, { deep: true })

// 积分规则配置
export const POINT_RULES = {
  courseReading: 10, // 课件阅读：10分/次
  mealUpload: 5, // 饮食上传：5分/次
  healthCheckin: 3, // 健康打卡：3分/次
  obstacleReport: 8, // 阻碍提报：8分/次
  liveWatching: 15, // 观看直播：15分/次
  weightLossExcellent: 50, // 减重成效优秀：50分
  weightLossGood: 30, // 减重成效良好：30分
  weightLossFair: 10, // 减重成效一般：10分
}

export function usePointsSystem() {
  // 获取用户积分数据
  const getUserPoints = (userId: string): UserPoints | null => {
    return pointsData.value[userId] || null
  }

  // 设置用户积分数据
  const setUserPoints = (userId: string, data: Partial<UserPoints>) => {
    if (!pointsData.value[userId]) {
      // 创建新用户积分记录
      const details = createPointDetails()
      pointsData.value[userId] = {
        userId,
        userName: data.userName || '',
        avatarColor: data.avatarColor || 'bg-slate-500',
        department: data.department || '',
        community: data.community || '',
        totalPoints: data.totalPoints || 0,
        weeklyPoints: data.weeklyPoints || 0,
        rank: data.rank || 0,
        weeklyRank: data.weeklyRank || 0,
        pointDetails: details
      }
    }

    // 更新数据
    Object.assign(pointsData.value[userId], data)

    // 重新计算总积分
    if (pointsData.value[userId]) {
      pointsData.value[userId].totalPoints = getTotalPoints(pointsData.value[userId].pointDetails)
    }

    // 重新计算排名
    recalculateRanks()
  }

  // 添加积分（系统自动统计）
  const addPoints = (userId: string, type: keyof PointDetails, amount: number) => {
    const userPoints = pointsData.value[userId]
    if (!userPoints) return

    userPoints.pointDetails[type] = (userPoints.pointDetails[type] || 0) + amount
    userPoints.totalPoints = getTotalPoints(userPoints.pointDetails)
    userPoints.weeklyPoints += amount

    recalculateRanks()
  }

  // 手动调整积分
  const manualAdjustPoints = (userId: string, amount: number, reason: string) => {
    const userPoints = pointsData.value[userId]
    if (!userPoints) return

    userPoints.pointDetails.manualAdjustment += amount
    userPoints.totalPoints = getTotalPoints(userPoints.pointDetails)
    userPoints.weeklyPoints += amount

    recalculateRanks()
  }

  // 重新计算排名
  const recalculateRanks = () => {
    // 按总积分排序计算总排名
    const sortedByTotal = Object.values(pointsData.value)
      .sort((a, b) => b.totalPoints - a.totalPoints)

    sortedByTotal.forEach((user, index) => {
      if (pointsData.value[user.userId]) {
        pointsData.value[user.userId].rank = index + 1
      }
    })

    // 按周积分排序计算周排名
    const sortedByWeekly = Object.values(pointsData.value)
      .sort((a, b) => b.weeklyPoints - a.weeklyPoints)

    sortedByWeekly.forEach((user, index) => {
      if (pointsData.value[user.userId]) {
        pointsData.value[user.userId].weeklyRank = index + 1
      }
    })
  }

  // 获取个人排行榜
  const getPersonalRanking = computed(() => {
    return Object.values(pointsData.value)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 50) // 取前50名
  })

  // 获取社群排行榜
  const getCommunityRanking = computed(() => {
    const communityMap = new Map<string, { totalPoints: number; members: number }>()

    Object.values(pointsData.value).forEach(user => {
      if (user.community) {
        const current = communityMap.get(user.community) || { totalPoints: 0, members: 0 }
        communityMap.set(user.community, {
          totalPoints: current.totalPoints + user.totalPoints,
          members: current.members + 1
        })
      }
    })

    return Array.from(communityMap.entries())
      .map(([community, data]) => ({
        name: community,
        totalPoints: data.totalPoints,
        averagePoints: Math.round(data.totalPoints / data.members),
        members: data.members
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }))
  })

  // 获取部门排行榜
  const getDepartmentRanking = computed(() => {
    const departmentMap = new Map<string, { totalPoints: number; members: number }>()

    Object.values(pointsData.value).forEach(user => {
      if (user.department) {
        const current = departmentMap.get(user.department) || { totalPoints: 0, members: 0 }
        departmentMap.set(user.department, {
          totalPoints: current.totalPoints + user.totalPoints,
          members: current.members + 1
        })
      }
    })

    return Array.from(departmentMap.entries())
      .map(([department, data]) => ({
        name: department,
        totalPoints: data.totalPoints,
        averagePoints: Math.round(data.totalPoints / data.members),
        members: data.members
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }))
  })

  // 获取指定类型的排行榜
  const getRanking = (type: RankingType) => {
    switch (type) {
      case 'personal':
        return getPersonalRanking.value
      case 'community':
        return getCommunityRanking.value
      case 'department':
        return getDepartmentRanking.value
    }
  }

  // 获取排名的颜色样式
  const getRankColor = (rank: number) => {
    if (rank === 1) return { bg: 'rgba(255, 215, 0, 0.1)', text: '#b8860b', border: '#ffd700', icon: '🥇' }
    if (rank === 2) return { bg: 'rgba(192, 192, 192, 0.1)', text: '#808080', border: '#c0c0c0', icon: '🥈' }
    if (rank === 3) return { bg: 'rgba(205, 127, 50, 0.1)', text: '#cd7f32', border: '#cd7f32', icon: '🥉' }
    return { bg: 'rgba(148, 163, 184, 0.1)', text: '#64748b', border: '#cbd5e1', icon: '' }
  }

  // 初始化用户积分数据
  const initUserPoints = (userId: string, userName: string, avatarColor: string) => {
    if (!pointsData.value[userId]) {
      const details = createPointDetails()
      pointsData.value[userId] = {
        userId,
        userName,
        avatarColor,
        totalPoints: 0,
        weeklyPoints: 0,
        rank: 0,
        weeklyRank: 0,
        pointDetails: details
      }
    }
  }

  // 初始化测试数据
  const initSampleData = () => {
    // 如果已经有数据，不再初始化
    if (Object.keys(pointsData.value).length > 0) {
      return
    }

    const sampleUsers = [
      // 个人榜高分用户
      { userId: 'u001', userName: '张伟', avatarColor: 'bg-blue-500', department: '销售部', community: '北京社群', courseReading: 15, mealUpload: 20, healthCheckin: 30, obstacleReport: 5, liveWatching: 8, weightLossResult: 50 },
      { userId: 'u002', userName: '李娜', avatarColor: 'bg-pink-500', department: '销售部', community: '北京社群', courseReading: 12, mealUpload: 18, healthCheckin: 28, obstacleReport: 4, liveWatching: 10, weightLossResult: 30 },
      { userId: 'u003', userName: '王芳', avatarColor: 'bg-purple-500', department: '市场部', community: '上海社群', courseReading: 10, mealUpload: 15, healthCheckin: 25, obstacleReport: 3, liveWatching: 6, weightLossResult: 10 },
      { userId: 'u004', userName: '刘洋', avatarColor: 'bg-indigo-500', department: '市场部', community: '上海社群', courseReading: 8, mealUpload: 12, healthCheckin: 22, obstacleReport: 6, liveWatching: 7, weightLossResult: 30 },
      { userId: 'u005', userName: '陈静', avatarColor: 'bg-teal-500', department: '技术部', community: '深圳社群', courseReading: 6, mealUpload: 10, healthCheckin: 20, obstacleReport: 2, liveWatching: 5, weightLossResult: 50 },
      { userId: 'u006', userName: '杨明', avatarColor: 'bg-green-500', department: '技术部', community: '深圳社群', courseReading: 5, mealUpload: 8, healthCheckin: 18, obstacleReport: 4, liveWatching: 4, weightLossResult: 10 },
      { userId: 'u007', userName: '赵敏', avatarColor: 'bg-orange-500', department: '客服部', community: '广州社群', courseReading: 4, mealUpload: 6, healthCheckin: 15, obstacleReport: 3, liveWatching: 3, weightLossResult: 0 },
      { userId: 'u008', userName: '孙强', avatarColor: 'bg-red-500', department: '客服部', community: '广州社群', courseReading: 3, mealUpload: 5, healthCheckin: 12, obstacleReport: 2, liveWatching: 2, weightLossResult: 0 },
      { userId: 'u009', userName: '周杰', avatarColor: 'bg-cyan-500', department: '运营部', community: '成都社群', courseReading: 2, mealUpload: 4, healthCheckin: 10, obstacleReport: 1, liveWatching: 1, weightLossResult: 0 },
      { userId: 'u010', userName: '吴磊', avatarColor: 'bg-lime-500', department: '运营部', community: '成都社群', courseReading: 1, mealUpload: 3, healthCheckin: 8, obstacleReport: 0, liveWatching: 0, weightLossResult: 0 },

      // 更多用户来测试分页
      { userId: 'u011', userName: '郑华', avatarColor: 'bg-emerald-500', department: '销售部', community: '北京社群', courseReading: 8, mealUpload: 12, healthCheckin: 20, obstacleReport: 3, liveWatching: 5, weightLossResult: 30 },
      { userId: 'u012', userName: '冯丽', avatarColor: 'bg-rose-500', department: '销售部', community: '北京社群', courseReading: 7, mealUpload: 11, healthCheckin: 19, obstacleReport: 2, liveWatching: 4, weightLossResult: 10 },
      { userId: 'u013', userName: '袁强', avatarColor: 'bg-violet-500', department: '市场部', community: '上海社群', courseReading: 6, mealUpload: 10, healthCheckin: 18, obstacleReport: 4, liveWatching: 6, weightLossResult: 10 },
      { userId: 'u014', userName: '邓超', avatarColor: 'bg-amber-500', department: '市场部', community: '上海社群', courseReading: 5, mealUpload: 9, healthCheckin: 17, obstacleReport: 1, liveWatching: 3, weightLossResult: 0 },
      { userId: 'u015', userName: '谢娜', avatarColor: 'bg-sky-500', department: '技术部', community: '深圳社群', courseReading: 4, mealUpload: 8, healthCheckin: 16, obstacleReport: 2, liveWatching: 2, weightLossResult: 0 },
      { userId: 'u016', userName: '唐僧', avatarColor: 'bg-yellow-500', department: '技术部', community: '深圳社群', courseReading: 3, mealUpload: 7, healthCheckin: 15, obstacleReport: 3, liveWatching: 1, weightLossResult: 10 },
      { userId: 'u017', userName: '孙悟空', avatarColor: 'bg-orange-600', department: '客服部', community: '广州社群', courseReading: 9, mealUpload: 13, healthCheckin: 21, obstacleReport: 5, liveWatching: 7, weightLossResult: 30 },
      { userId: 'u018', userName: '猪八戒', avatarColor: 'bg-pink-600', department: '客服部', community: '广州社群', courseReading: 2, mealUpload: 2, healthCheckin: 5, obstacleReport: 0, liveWatching: 0, weightLossResult: 0 },
      { userId: 'u019', userName: '沙僧', avatarColor: 'bg-stone-500', department: '运营部', community: '成都社群', courseReading: 4, mealUpload: 6, healthCheckin: 14, obstacleReport: 2, liveWatching: 3, weightLossResult: 0 },
      { userId: 'u020', userName: '白龙马', avatarColor: 'bg-slate-400', department: '运营部', community: '成都社群', courseReading: 3, mealUpload: 5, healthCheckin: 13, obstacleReport: 1, liveWatching: 2, weightLossResult: 0 },

      // 添加更多用户以支持多页显示（共60个用户）
      ...Array.from({ length: 40 }, (_, i) => ({
        userId: `u${String(i + 21).padStart(3, '0')}`,
        userName: `用户${i + 21}`,
        avatarColor: ['bg-blue-500', 'bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-teal-500'][i % 5],
        department: ['销售部', '市场部', '技术部', '客服部', '运营部'][i % 5],
        community: ['北京社群', '上海社群', '深圳社群', '广州社群', '成都社群'][i % 5],
        courseReading: Math.floor(Math.random() * 10),
        mealUpload: Math.floor(Math.random() * 15),
        healthCheckin: Math.floor(Math.random() * 20),
        obstacleReport: Math.floor(Math.random() * 5),
        liveWatching: Math.floor(Math.random() * 8),
        weightLossResult: [0, 10, 30, 50][Math.floor(Math.random() * 4)]
      }))
    ]

    // 创建用户数据
    sampleUsers.forEach(user => {
      const details: PointDetails = {
        courseReading: user.courseReading * POINT_RULES.courseReading,
        mealUpload: user.mealUpload * POINT_RULES.mealUpload,
        healthCheckin: user.healthCheckin * POINT_RULES.healthCheckin,
        obstacleReport: user.obstacleReport * POINT_RULES.obstacleReport,
        liveWatching: user.liveWatching * POINT_RULES.liveWatching,
        weightLossResult: user.weightLossResult,
        manualAdjustment: 0
      }

      const totalPoints = getTotalPoints(details)
      const weeklyPoints = Math.floor(totalPoints * (0.3 + Math.random() * 0.7)) // 周积分为总积分的30%-100%

      pointsData.value[user.userId] = {
        userId: user.userId,
        userName: user.userName,
        avatarColor: user.avatarColor,
        department: user.department,
        community: user.community,
        totalPoints,
        weeklyPoints,
        rank: 0,
        weeklyRank: 0,
        pointDetails: details
      }
    })

    // 重新计算排名
    recalculateRanks()
  }

  return {
    pointsData,
    getUserPoints,
    setUserPoints,
    addPoints,
    manualAdjustPoints,
    getRanking,
    getPersonalRanking,
    getCommunityRanking,
    getDepartmentRanking,
    getRankColor,
    initUserPoints,
    initSampleData,
    recalculateRanks,
    getTotalPoints
  }
}
