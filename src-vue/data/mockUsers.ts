// 共享的用户数据 - 用于教练和医生的服务记录
export const MOCK_USERS = {
  // 教练的用户
  coach: {
    'u001': {
      id: 'u001',
      name: '王小红',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangXiaohong',
      phone: '13900001111',
      joinDate: '2023-12-01',
      isNewUser: true
    },
    'u002': {
      id: 'u002',
      name: '李大明',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiDaming',
      phone: '13900002222',
      joinDate: '2023-06-15',
      isNewUser: false
    },
    'u003': {
      id: 'u003',
      name: '陈美丽',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChenMeili',
      phone: '13900003333',
      joinDate: '2024-01-05',
      isNewUser: true
    },
    'u004': {
      id: 'u004',
      name: '张伟',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangWei',
      phone: '13900004444',
      joinDate: '2023-10-01',
      isNewUser: false
    },
    'u005': {
      id: 'u005',
      name: '刘洋',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiuYang',
      phone: '13900005555',
      joinDate: '2024-01-15',
      isNewUser: true
    },
    'u006': {
      id: 'u006',
      name: '孙芳',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SunFang',
      phone: '13900006666',
      joinDate: '2023-11-20',
      isNewUser: false
    },
    'u007': {
      id: 'u007',
      name: '周强',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhouQiang',
      phone: '13900007777',
      joinDate: '2024-01-20',
      isNewUser: true
    },
    'u008': {
      id: 'u008',
      name: '吴静',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WuJing',
      phone: '13900008888',
      joinDate: '2023-09-10',
      isNewUser: false
    }
  },
  // 医生的用户
  doctor: {
    'du001': {
      id: 'du001',
      name: '王芳',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangFang',
      phone: '13800001111',
      joinDate: '2024-01-10',
      isNewUser: true
    },
    'du002': {
      id: 'du002',
      name: '李军',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiJun',
      phone: '13800002222',
      joinDate: '2023-06-15',
      isNewUser: false
    },
    'du003': {
      id: 'du003',
      name: '赵丽',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhaoLi',
      phone: '13800003333',
      joinDate: '2024-01-20',
      isNewUser: true
    },
    'du004': {
      id: 'du004',
      name: '孙敏',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SunMin',
      phone: '13800004444',
      joinDate: '2023-12-05',
      isNewUser: false
    },
    'du005': {
      id: 'du005',
      name: '周涛',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhouTao',
      phone: '13800005555',
      joinDate: '2024-01-25',
      isNewUser: true
    },
    'du006': {
      id: 'du006',
      name: '吴磊',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WuLei',
      phone: '13800006666',
      joinDate: '2023-10-15',
      isNewUser: false
    }
  }
} as const

// 服务类型
export const SERVICE_TYPES = {
  coach: ['体能训练', '康复指导', '营养咨询', '运动评估', '产后康复', '脊柱矫正'],
  doctor: ['康复评估', '运动指导', '康复训练', '健康咨询', '神经康复', '心肺康复', '脊柱矫正', '产后康复']
} as const

// 根据员工ID和服务记录ID生成真实的服务记录
export function generateServiceRecords(
  employeeId: string,
  settlementId: string,
  period: string,
  userType: 'coach' | 'doctor',
  userRecords: Array<{ userId: string; startDate: string; endDate: string | null; isNewUser: boolean }>,
  count: number
) {
  const users = userType === 'coach' ? MOCK_USERS.coach : MOCK_USERS.doctor
  const serviceTypes = SERVICE_TYPES[userType]
  const records = []

  for (let i = 0; i < Math.min(count, userRecords.length); i++) {
    const userRecord = userRecords[i]
    const user = users[userRecord.userId as keyof typeof users]

    if (!user) continue

    // 计算干预时长
    const startDateObj = new Date(userRecord.startDate)
    const endDateObj = userRecord.endDate ? new Date(userRecord.endDate) : new Date()
    const interventionDuration = Math.floor((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24))

    records.push({
      id: `${userType === 'coach' ? 'SR' : 'DSR'}${settlementId}-${i}`,
      startDate: userRecord.startDate,
      endDate: userRecord.endDate || new Date().toISOString().split('T')[0],
      userName: user.name,
      userId: user.userId,
      serviceType: serviceTypes[i % serviceTypes.length],
      interventionDuration,
      rating: Math.floor(4 + Math.random() * 1.5),
      amount: userType === 'coach' ? 150 + Math.floor(Math.random() * 200) : 200
    })
  }

  return records
}
