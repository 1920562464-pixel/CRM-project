import { ref, computed, watch } from 'vue'
import type {
  HREmployee,
  EmployeeStatus,
  EmploymentType,
  CoachRole,
  CoachingRelationship,
  OnboardingRecord,
  OffboardingRecord,
  RegularizationRecord,
  SalaryAdjustmentRecord,
  HRStatistics,
  MentorshipGroup
} from '../types'

const STORAGE_KEYS = {
  EMPLOYEES: 'crm_hr_employees',
  RELATIONSHIPS: 'crm_hr_coaching_relationships',
  GROUPS: 'crm_hr_mentorship_groups',
  ONBOARDING: 'crm_hr_onboarding',
  OFFBOARDING: 'crm_hr_offboarding',
  REGULARIZATIONS: 'crm_hr_regularizations',
  SALARY_ADJUSTMENTS: 'crm_hr_salary_adjustments'
}

// ============ 数据初始化 ============

const employees = ref<HREmployee[]>([])
const coachingRelationships = ref<CoachingRelationship[]>([])
const mentorshipGroups = ref<MentorshipGroup[]>([])
const onboardingRecords = ref<OnboardingRecord[]>([])
const offboardingRecords = ref<OffboardingRecord[]>([])
const regularizationRecords = ref<RegularizationRecord[]>([])
const salaryAdjustmentRecords = ref<SalaryAdjustmentRecord[]>([])

// 从localStorage加载数据
const loadFromStorage = <T>(key: string, defaultValue: T[]): T[] => {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error(`Failed to load ${key} from storage:`, error)
  }
  return defaultValue
}

// 保存到localStorage
const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Failed to save ${key} to storage:`, error)
  }
}

// 初始化数据
const initializeData = () => {
  employees.value = loadFromStorage<HREmployee>(STORAGE_KEYS.EMPLOYEES, [])
  coachingRelationships.value = loadFromStorage<CoachingRelationship>(STORAGE_KEYS.RELATIONSHIPS, [])
  mentorshipGroups.value = loadFromStorage<MentorshipGroup>(STORAGE_KEYS.GROUPS, [])
  onboardingRecords.value = loadFromStorage<OnboardingRecord>(STORAGE_KEYS.ONBOARDING, [])
  offboardingRecords.value = loadFromStorage<OffboardingRecord>(STORAGE_KEYS.OFFBOARDING, [])
  regularizationRecords.value = loadFromStorage<RegularizationRecord>(STORAGE_KEYS.REGULARIZATIONS, [])
  salaryAdjustmentRecords.value = loadFromStorage<SalaryAdjustmentRecord>(STORAGE_KEYS.SALARY_ADJUSTMENTS, [])

  // 如果没有员工数据，创建一些示例数据
  if (employees.value.length === 0) {
    createSampleData()
  }

  // 计算师徒组统计
  updateMentorshipGroups()
}

// 创建示例数据
const createSampleData = () => {
  const sampleEmployees: HREmployee[] = [
    {
      id: 'emp_001',
      name: '李明',
      phone: '13800138001',
      email: 'liming@company.com',
      position: '高级教练',
      department: '运动康复部',
      role: 'coach',
      employmentType: 'full_time',
      status: 'regular',
      hireDate: '2023-01-15',
      contractStartDate: '2023-01-15',
      probationEndDate: '2023-04-15',
      currentLoad: 12,
      maxLoad: 20,
      performanceScore: 85,
      baseSalary: 8000,
      commissionRate: 0.15,
      createdAt: '2023-01-15T09:00:00',
      updatedAt: '2023-01-15T09:00:00'
    },
    {
      id: 'emp_002',
      name: '王芳',
      phone: '13800138002',
      email: 'wangfang@company.com',
      position: '兼职教练',
      department: '运动康复部',
      role: 'coach',
      employmentType: 'part_time',
      status: 'regular',
      hireDate: '2023-03-20',
      contractStartDate: '2023-03-20',
      currentLoad: 8,
      maxLoad: 15,
      performanceScore: 78,
      baseSalary: 3000,
      commissionRate: 0.12,
      createdAt: '2023-03-20T10:00:00',
      updatedAt: '2023-03-20T10:00:00'
    },
    {
      id: 'emp_003',
      name: '张伟',
      phone: '13800138003',
      email: 'zhangwei@company.com',
      position: '总教练',
      department: '运动康复部',
      role: 'mentor',
      employmentType: 'full_time',
      status: 'regular',
      hireDate: '2022-06-01',
      contractStartDate: '2022-06-01',
      groupName: '冠军战队',
      apprentices: ['emp_004', 'emp_005'],
      currentLoad: 15,
      maxLoad: 25,
      performanceScore: 92,
      baseSalary: 12000,
      commissionRate: 0.2,
      createdAt: '2022-06-01T08:30:00',
      updatedAt: '2022-06-01T08:30:00'
    },
    {
      id: 'emp_004',
      name: '刘洋',
      phone: '13800138004',
      email: 'liuyang@company.com',
      position: '实习教练',
      department: '运动康复部',
      role: 'apprentice',
      employmentType: 'intern',
      status: 'probation',
      hireDate: '2024-01-10',
      contractStartDate: '2024-01-10',
      probationEndDate: '2024-04-10',
      mentorId: 'emp_003',
      currentLoad: 5,
      maxLoad: 10,
      performanceScore: 70,
      baseSalary: 3000,
      commissionRate: 0.08,
      createdAt: '2024-01-10T09:00:00',
      updatedAt: '2024-01-10T09:00:00'
    },
    {
      id: 'emp_005',
      name: '陈静',
      phone: '13800138005',
      email: 'chenjing@company.com',
      position: '实习教练',
      department: '运动康复部',
      role: 'apprentice',
      employmentType: 'intern',
      status: 'probation',
      hireDate: '2024-02-01',
      contractStartDate: '2024-02-01',
      probationEndDate: '2024-05-01',
      mentorId: 'emp_003',
      currentLoad: 3,
      maxLoad: 10,
      performanceScore: 75,
      baseSalary: 3000,
      commissionRate: 0.08,
      createdAt: '2024-02-01T09:00:00',
      updatedAt: '2024-02-01T09:00:00'
    }
  ]

  const sampleRelationships: CoachingRelationship[] = [
    {
      id: 'rel_001',
      mentorId: 'emp_003',
      mentorName: '张伟',
      apprenticeId: 'emp_004',
      apprenticeName: '刘洋',
      startDate: '2024-01-10',
      status: 'active',
      trainingGoals: '掌握基础康复训练技巧',
      progress: 35,
      notes: '学习态度良好，进步较快'
    },
    {
      id: 'rel_002',
      mentorId: 'emp_003',
      mentorName: '张伟',
      apprenticeId: 'emp_005',
      apprenticeName: '陈静',
      startDate: '2024-02-01',
      status: 'active',
      trainingGoals: '掌握客户服务流程',
      progress: 20,
      notes: '需要加强沟通技巧'
    }
  ]

  employees.value = sampleEmployees
  coachingRelationships.value = sampleRelationships
  saveAllData()
}

// 保存所有数据
const saveAllData = () => {
  saveToStorage(STORAGE_KEYS.EMPLOYEES, employees.value)
  saveToStorage(STORAGE_KEYS.RELATIONSHIPS, coachingRelationships.value)
  saveToStorage(STORAGE_KEYS.GROUPS, mentorshipGroups.value)
  saveToStorage(STORAGE_KEYS.ONBOARDING, onboardingRecords.value)
  saveToStorage(STORAGE_KEYS.OFFBOARDING, offboardingRecords.value)
  saveToStorage(STORAGE_KEYS.REGULARIZATIONS, regularizationRecords.value)
  saveToStorage(STORAGE_KEYS.SALARY_ADJUSTMENTS, salaryAdjustmentRecords.value)
}

// ============ 师徒组管理 ============

// 更新师徒组统计
const updateMentorshipGroups = () => {
  const mentors = employees.value.filter(emp => emp.role === 'mentor')
  const groups: MentorshipGroup[] = []

  mentors.forEach(mentor => {
    const apprenticeIds = mentor.apprentices || []
    const apprentices = apprenticeIds
      .map(id => employees.value.find(e => e.id === id))
      .filter(e => e) as HREmployee[]

    const allMembers = [mentor, ...apprentices]
    const totalLoad = allMembers.reduce((sum, e) => sum + e.currentLoad, 0)
    const totalMaxLoad = allMembers.reduce((sum, e) => sum + e.maxLoad, 0)
    const loadRate = totalMaxLoad > 0 ? totalLoad / totalMaxLoad : 0
    const avgPerformance = allMembers.length > 0
      ? allMembers.reduce((sum, e) => sum + (e.performanceScore || 0), 0) / allMembers.length
      : 0

    // 计算总分：负载率(30%) + 平均绩效(70%)
    const totalScore = (loadRate * 30) + (avgPerformance * 0.7)

    // 查找或创建组
    let group = mentorshipGroups.value.find(g => g.mentorId === mentor.id)
    if (!group) {
      group = {
        id: `group_${mentor.id}`,
        name: mentor.groupName || `${mentor.name}的战队`,
        mentorId: mentor.id,
        mentorName: mentor.name,
        memberCount: allMembers.length,
        totalLoad,
        totalMaxLoad,
        loadRate,
        avgPerformance,
        totalScore,
        createdAt: new Date().toISOString()
      }
      groups.push(group)
    } else {
      // 更新现有组
      group.name = mentor.groupName || group.name
      group.mentorName = mentor.name
      group.memberCount = allMembers.length
      group.totalLoad = totalLoad
      group.totalMaxLoad = totalMaxLoad
      group.loadRate = loadRate
      group.avgPerformance = avgPerformance
      group.totalScore = totalScore
      groups.push(group)
    }
  })

  mentorshipGroups.value = groups
  saveToStorage(STORAGE_KEYS.GROUPS, mentorshipGroups.value)
}

// 获取所有师徒组（按总分排序）
const getAllMentorshipGroups = (): MentorshipGroup[] => {
  return [...mentorshipGroups.value].sort((a, b) => b.totalScore - a.totalScore)
}

// 获取师徒组排行榜
const getGroupRankings = () => {
  return getAllMentorshipGroups().map((group, index) => ({
    rank: index + 1,
    ...group
  }))
}

// 更新组名
const updateGroupName = (mentorId: string, groupName: string): boolean => {
  const mentor = getEmployeeById(mentorId)
  if (!mentor || mentor.role !== 'mentor') return false

  mentor.groupName = groupName
  saveToStorage(STORAGE_KEYS.EMPLOYEES, employees.value)
  updateMentorshipGroups()
  return true
}

// ============ 员工管理 ============

// 获取所有员工
const getAllEmployees = (): HREmployee[] => {
  return employees.value
}

// 按ID获取员工
const getEmployeeById = (id: string): HREmployee | undefined => {
  return employees.value.find(emp => emp.id === id)
}

// 按状态获取员工
const getEmployeesByStatus = (status: EmployeeStatus): HREmployee[] => {
  return employees.value.filter(emp => emp.status === status)
}

// 按聘用类型获取员工
const getEmployeesByEmploymentType = (type: EmploymentType): HREmployee[] => {
  return employees.value.filter(emp => emp.employmentType === type)
}

// 按角色获取员工
const getEmployeesByRole = (role: CoachRole): HREmployee[] => {
  return employees.value.filter(emp => emp.role === role)
}

// 获取所有师傅
const getAllMentors = (): HREmployee[] => {
  return employees.value.filter(emp => emp.role === 'mentor')
}

// 获取所有徒弟
const getAllApprentices = (): HREmployee[] => {
  return employees.value.filter(emp => emp.role === 'apprentice')
}

// 获取所有普通教练
const getAllCoaches = (): HREmployee[] => {
  return employees.value.filter(emp => emp.role === 'coach')
}

// 添加员工
const addEmployee = (employee: Omit<HREmployee, 'id' | 'createdAt' | 'updatedAt'>): HREmployee => {
  const newEmployee: HREmployee = {
    ...employee,
    id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  employees.value.push(newEmployee)
  saveToStorage(STORAGE_KEYS.EMPLOYEES, employees.value)

  // 创建入职记录
  createOnboardingRecord(newEmployee)

  // 更新师徒组统计
  updateMentorshipGroups()

  return newEmployee
}

// 更新员工
const updateEmployee = (id: string, updates: Partial<HREmployee>): boolean => {
  const index = employees.value.findIndex(emp => emp.id === id)
  if (index === -1) return false

  employees.value[index] = {
    ...employees.value[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }

  saveToStorage(STORAGE_KEYS.EMPLOYEES, employees.value)

  // 如果修改了角色或师徒关系，更新组统计
  if (updates.role || updates.mentorId || updates.apprentices || updates.groupName) {
    updateMentorshipGroups()
  }

  return true
}

// 删除员工
const deleteEmployee = (id: string): boolean => {
  const index = employees.value.findIndex(emp => emp.id === id)
  if (index === -1) return false

  employees.value.splice(index, 1)
  saveToStorage(STORAGE_KEYS.EMPLOYEES, employees.value)
  return true
}

// 更新员工负载
const updateEmployeeLoad = (employeeId: string, delta: number): boolean => {
  const employee = getEmployeeById(employeeId)
  if (!employee) return false

  const newLoad = employee.currentLoad + delta
  if (newLoad < 0 || newLoad > employee.maxLoad) {
    return false
  }

  employee.currentLoad = newLoad
  saveToStorage(STORAGE_KEYS.EMPLOYEES, employees.value)
  return true
}

// ============ 师徒关系管理 ============

// 获取所有师徒关系
const getAllCoachingRelationships = (): CoachingRelationship[] => {
  return coachingRelationships.value
}

// 获取活跃的师徒关系
const getActiveRelationships = (): CoachingRelationship[] => {
  return coachingRelationships.value.filter(rel => rel.status === 'active')
}

// 获取师傅的所有徒弟
const getApprenticesByMentor = (mentorId: string): HREmployee[] => {
  const relationship = coachingRelationships.value.filter(
    rel => rel.mentorId === mentorId && rel.status === 'active'
  )
  const apprenticeIds = relationship.map(rel => rel.apprenticeId)
  return employees.value.filter(emp => apprenticeIds.includes(emp.id))
}

// 获取徒弟的师傅
const getMentorByApprentice = (apprenticeId: string): HREmployee | undefined => {
  const relationship = coachingRelationships.value.find(
    rel => rel.apprenticeId === apprenticeId && rel.status === 'active'
  )
  if (!relationship) return undefined
  return getEmployeeById(relationship.mentorId)
}

// 建立师徒关系
const createCoachingRelationship = (
  mentorId: string,
  apprenticeId: string,
  trainingGoals?: string
): CoachingRelationship | null => {
  const mentor = getEmployeeById(mentorId)
  const apprentice = getEmployeeById(apprenticeId)

  if (!mentor || !apprentice) return null

  // 检查是否已经存在关系
  const existing = coachingRelationships.value.find(
    rel => rel.mentorId === mentorId && rel.apprenticeId === apprenticeId && rel.status === 'active'
  )
  if (existing) return null

  const relationship: CoachingRelationship = {
    id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    mentorId,
    mentorName: mentor.name,
    apprenticeId,
    apprenticeName: apprentice.name,
    startDate: new Date().toISOString().split('T')[0],
    status: 'active',
    trainingGoals,
    progress: 0
  }

  coachingRelationships.value.push(relationship)
  saveToStorage(STORAGE_KEYS.RELATIONSHIPS, coachingRelationships.value)

  // 更新员工信息
  if (!mentor.apprentices) {
    mentor.apprentices = []
  }
  mentor.apprentices.push(apprenticeId)
  apprentice.mentorId = mentorId

  saveToStorage(STORAGE_KEYS.EMPLOYEES, employees.value)

  return relationship
}

// 结束师徒关系
const endCoachingRelationship = (relationshipId: string, reason?: string): boolean => {
  const index = coachingRelationships.value.findIndex(rel => rel.id === relationshipId)
  if (index === -1) return false

  const relationship = coachingRelationships.value[index]
  relationship.status = 'inactive'
  relationship.endDate = new Date().toISOString().split('T')[0]
  if (reason) {
    relationship.notes = reason
  }

  saveToStorage(STORAGE_KEYS.RELATIONSHIPS, coachingRelationships.value)

  // 更新员工信息
  const apprentice = getEmployeeById(relationship.apprenticeId)
  if (apprentice) {
    apprentice.mentorId = undefined
  }

  const mentor = getEmployeeById(relationship.mentorId)
  if (mentor && mentor.apprentices) {
    mentor.apprentices = mentor.apprentices.filter(id => id !== relationship.apprenticeId)
  }

  saveToStorage(STORAGE_KEYS.EMPLOYEES, employees.value)

  return true
}

// 更新培训进度
const updateTrainingProgress = (relationshipId: string, progress: number): boolean => {
  const relationship = coachingRelationships.value.find(rel => rel.id === relationshipId)
  if (!relationship) return false

  relationship.progress = Math.max(0, Math.min(100, progress))
  saveToStorage(STORAGE_KEYS.RELATIONSHIPS, coachingRelationships.value)
  return true
}

// ============ 入职管理 ============

// 创建入职记录
const createOnboardingRecord = (employee: HREmployee): OnboardingRecord => {
  const record: OnboardingRecord = {
    id: `onb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    employeeId: employee.id,
    employeeName: employee.name,
    hireDate: employee.hireDate,
    employmentType: employee.employmentType,
    department: employee.department,
    position: employee.position,
    recruiter: '系统管理员',
    onboardingTasks: [
      {
        id: 'task_1',
        name: '签订劳动合同',
        description: '完成劳动合同签订与归档',
        completed: false
      },
      {
        id: 'task_2',
        name: '系统账号开通',
        description: '创建系统登录账号和权限配置',
        completed: false
      },
      {
        id: 'task_3',
        name: '入职培训',
        description: '完成公司文化和业务流程培训',
        completed: false
      },
      {
        id: 'task_4',
        name: '办公设备配置',
        description: '领取办公设备和工牌',
        completed: false
      }
    ],
    status: 'pending',
    createdAt: new Date().toISOString()
  }

  onboardingRecords.value.push(record)
  saveToStorage(STORAGE_KEYS.ONBOARDING, onboardingRecords.value)

  return record
}

// 更新入职任务状态
const updateOnboardingTask = (
  recordId: string,
  taskId: string,
  completed: boolean
): boolean => {
  const record = onboardingRecords.value.find(r => r.id === recordId)
  if (!record) return false

  const task = record.onboardingTasks.find(t => t.id === taskId)
  if (!task) return false

  task.completed = completed
  if (completed) {
    task.completedAt = new Date().toISOString()
  }

  // 检查是否所有任务都完成
  const allCompleted = record.onboardingTasks.every(t => t.completed)
  if (allCompleted && record.status !== 'completed') {
    record.status = 'completed'
  } else if (record.status === 'pending' && record.onboardingTasks.some(t => t.completed)) {
    record.status = 'in_progress'
  }

  saveToStorage(STORAGE_KEYS.ONBOARDING, onboardingRecords.value)
  return true
}

// ============ 离职管理 ============

// 创建离职记录
const createOffboardingRecord = (
  employeeId: string,
  resignationDate: string,
  lastWorkDate: string,
  reason: string,
  reasonType: OffboardingRecord['reasonType']
): OffboardingRecord => {
  const employee = getEmployeeById(employeeId)
  if (!employee) throw new Error('员工不存在')

  const record: OffboardingRecord = {
    id: 'off_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    employeeId,
    employeeName: employee.name,
    resignationDate,
    lastWorkDate,
    reason,
    reasonType,
    status: 'pending',
    handoverTasks: [
      {
        id: 'htask_1',
        name: '工作交接',
        description: '与接手人完成工作交接',
        completed: false
      },
      {
        id: 'htask_2',
        name: '资产归还',
        description: '归还公司资产和设备',
        completed: false
      },
      {
        id: 'htask_3',
        name: '账号权限清理',
        description: '清理系统账号和权限',
        completed: false
      },
      {
        id: 'htask_4',
        name: '离职手续',
        description: '完成离职证明和相关手续',
        completed: false
      }
    ],
    createdAt: new Date().toISOString()
  }

  offboardingRecords.value.push(record)
  saveToStorage(STORAGE_KEYS.OFFBOARDING, offboardingRecords.value)

  // 更新员工状态
  updateEmployee(employeeId, { status: 'resigned' })

  return record
}

// 完成离职流程
const completeOffboarding = (
  recordId: string,
  exitInterview?: Omit<OffboardingRecord['exitInterview'], 'date' | 'interviewer'>
): boolean => {
  const record = offboardingRecords.value.find(r => r.id === recordId)
  if (!record) return false

  record.status = 'completed'
  if (exitInterview) {
    record.exitInterview = {
      ...exitInterview,
      date: new Date().toISOString().split('T')[0],
      interviewer: '系统管理员'
    }
  }

  saveToStorage(STORAGE_KEYS.OFFBOARDING, offboardingRecords.value)
  return true
}

// ============ 转正管理 ============

// 申请转正
const applyForRegularization = (
  employeeId: string,
  performanceScore: number,
  attitudeScore: number,
  abilityScore: number,
  comments: string
): RegularizationRecord => {
  const employee = getEmployeeById(employeeId)
  if (!employee) throw new Error('员工不存在')

  if (employee.status !== 'probation') {
    throw new Error('员工不在试用期')
  }

  const record: RegularizationRecord = {
    id: 'reg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    employeeId,
    employeeName: employee.name,
    hireDate: employee.hireDate,
    probationEndDate: employee.probationEndDate || employee.hireDate,
    actualRegularizationDate: new Date().toISOString().split('T')[0],
    result: 'approved',
    evaluator: '系统管理员',
    performanceScore,
    attitudeScore,
    abilityScore: comments,
    approvedAt: new Date().toISOString()
  }

  regularizationRecords.value.push(record)
  saveToStorage(STORAGE_KEYS.REGULARIZATIONS, regularizationRecords.value)

  // 如果批准，更新员工状态
  if (record.result === 'approved') {
    updateEmployee(employeeId, { status: 'regular' })
  }

  return record
}

// ============ 调薪管理 ============

// 申请调薪
const applyForSalaryAdjustment = (
  employeeId: string,
  adjustmentType: SalaryAdjustmentRecord['adjustmentType'],
  newSalary: number,
  reason: string,
  approvedBy: string
): SalaryAdjustmentRecord => {
  const employee = getEmployeeById(employeeId)
  if (!employee) throw new Error('员工不存在')

  const record: SalaryAdjustmentRecord = {
    id: 'sal_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    employeeId,
    employeeName: employee.name,
    adjustmentType,
    previousSalary: employee.baseSalary || 0,
    newSalary,
    effectiveDate: new Date().toISOString().split('T')[0],
    reason,
    approvedBy,
    approvedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }

  salaryAdjustmentRecords.value.push(record)
  saveToStorage(STORAGE_KEYS.SALARY_ADJUSTMENTS, salaryAdjustmentRecords.value)

  // 更新员工薪资
  updateEmployee(employeeId, { baseSalary: newSalary })

  return record
}

// ============ 统计数据 ============

const getHRStatistics = (): HRStatistics => {
  const now = new Date()
  const currentMonth = now.toISOString().slice(0, 7)

  return {
    totalEmployees: employees.value.length,
    activeEmployees: employees.value.filter(e => e.status === 'regular' || e.status === 'probation').length,
    probationEmployees: employees.value.filter(e => e.status === 'probation').length,
    resignedEmployees: employees.value.filter(e => e.status === 'resigned' || e.status === 'terminated').length,

    fullTimeCount: employees.value.filter(e => e.employmentType === 'full_time').length,
    partTimeCount: employees.value.filter(e => e.employmentType === 'part_time').length,
    contractCount: employees.value.filter(e => e.employmentType === 'contract').length,
    internCount: employees.value.filter(e => e.employmentType === 'intern').length,

    mentorCount: employees.value.filter(e => e.role === 'mentor').length,
    apprenticeCount: employees.value.filter(e => e.role === 'apprentice').length,
    coachCount: employees.value.filter(e => e.role === 'coach').length,

    activeCoachingRelationships: getActiveRelationships().length,
    mentorshipGroups: employees.value.filter(e => e.role === 'mentor').length,

    newHiresThisMonth: employees.value.filter(e => e.hireDate.startsWith(currentMonth)).length,
    resignationsThisMonth: offboardingRecords.value.filter(r => r.lastWorkDate.startsWith(currentMonth)).length,
    pendingRegularizations: regularizationRecords.value.filter(r => r.result === 'approved').length,

    averageLoadRate: employees.value.length > 0
      ? employees.value.reduce((sum, e) => sum + (e.currentLoad / e.maxLoad), 0) / employees.value.length
      : 0
  }
}

// ============ 导出功能 ============

const exportEmployees = () => {
  return employees.value.map(emp => ({
    '姓名': emp.name,
    '手机': emp.phone,
    '邮箱': emp.email || '-',
    '部门': emp.department,
    '职位': emp.position,
    '聘用类型': emp.employmentType === 'full_time' ? '全职' : emp.employmentType === 'part_time' ? '兼职' : emp.employmentType === 'contract' ? '合同工' : '实习生',
    '角色': emp.role === 'mentor' ? '师傅' : emp.role === 'apprentice' ? '徒弟' : '普通教练',
    '状态': emp.status === 'probation' ? '试用期' : emp.status === 'regular' ? '正式员工' : emp.status === 'resigned' ? '已离职' : '休假中',
    '入职日期': emp.hireDate,
    '当前负载': `${emp.currentLoad}/${emp.maxLoad}`,
    '绩效分数': emp.performanceScore || '-',
    '基本薪资': emp.baseSalary || '-'
  }))
}

// ============ useHRManagement Composable ============

export const useHRManagement = () => {
  // 立即初始化数据（确保在组件使用前数据已准备好）
  initializeData()

  return {
    // 数据
    employees,
    coachingRelationships,
    mentorshipGroups,
    onboardingRecords,
    offboardingRecords,
    regularizationRecords,
    salaryAdjustmentRecords,

    // 员工管理
    getAllEmployees,
    getEmployeeById,
    getEmployeesByStatus,
    getEmployeesByEmploymentType,
    getEmployeesByRole,
    getAllMentors,
    getAllApprentices,
    getAllCoaches,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    updateEmployeeLoad,

    // 师徒组管理
    getAllMentorshipGroups,
    getGroupRankings,
    updateGroupName,
    updateMentorshipGroups,

    // 师徒关系管理
    getAllCoachingRelationships,
    getActiveRelationships,
    getApprenticesByMentor,
    getMentorByApprentice,
    createCoachingRelationship,
    endCoachingRelationship,
    updateTrainingProgress,

    // 入职管理
    createOnboardingRecord,
    updateOnboardingTask,

    // 离职管理
    createOffboardingRecord,
    completeOffboarding,

    // 转正管理
    applyForRegularization,

    // 调薪管理
    applyForSalaryAdjustment,

    // 统计
    getHRStatistics,

    // 导出
    exportEmployees,

    // 数据管理
    saveAllData,
    initializeData
  }
}
