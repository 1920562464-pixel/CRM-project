/**
 * 可在 React 和 Vue 之间共用的类型定义
 */

// ============ 任务相关 ============

export interface Task {
  id: string
  title: string
  time: string
  tag: string
  tagColor: string
  desc: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
}

export type TaskFilterStatus = 'all' | 'pending' | 'completed'
export type TaskPriority = 'all' | 'high' | 'medium' | 'low'

// ============ 统计相关 ============

export interface StatItem {
  id: string
  label: string
  value: string
  trend?: string
  trendUp?: boolean
  subLabel?: string
  icon: any
  bg: string
  onClick?: () => void
}

export interface StatCardProps {
  label: string
  value: string
  trend?: string
  trendUp?: boolean
  subLabel?: string
  icon: any
  bg: string
  isActive: boolean
}

// ============ 用户相关 ============

export interface User {
  id: string
  name: string
  phone: string
  email?: string
  avatar?: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
}

// ============ 会员相关 ============

export interface Member {
  id: string
  name: string
  phone: string
  membershipLevel: 'basic' | 'standard' | 'premium'
  balance: number
  points: number
  status: 'active' | 'inactive'
  registerDate: string
  lastVisitDate?: string
}

// ============ 财务相关 ============

export interface IncomeItem {
  id: string
  type: 'recharge' | 'course' | 'service' | 'product' | 'card' | 'other'
  typeLabel: string
  amount: number
  memberId: string
  memberName: string
  memberPhone: string
  paymentMethod: 'wechat' | 'alipay' | 'bank' | 'cash' | 'pos'
  paymentMethodLabel: string
  status: 'pending' | 'confirmed' | 'refunded'
  statusLabel: string
  category: string
  salesman?: string
  remark?: string
  createdAt: string
  confirmedAt?: string
}

export interface ExpenseItem {
  id: string
  type: 'inventory' | 'operation' | 'salary' | 'rent' | 'utility' | 'other'
  typeLabel: string
  amount: number
  category: string
  applicant: string
  department: string
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  statusLabel: string
  paymentMethod?: string
  paymentAccount?: string
  remark?: string
  createdAt: string
  approvedAt?: string
  paidAt?: string
}

// ============ 课程相关 ============

export interface Course {
  id: string
  name: string
  type: 'private' | 'group' | 'online'
  description: string
  duration: number
  price: number
  maxParticipants?: number
  instructor: string
  status: 'active' | 'inactive' | 'archived'
}

// ============ 预约相关 ============

export interface Appointment {
  id: string
  memberId: string
  memberName: string
  courseId: string
  courseName: string
  instructor: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
}

// ============ 人力结算相关 ============

export interface SettlementItem {
  id: string
  type: 'coach' | 'doctor' | 'consultant'
  typeLabel: string
  staffId: string
  staffName: string
  amount: number
  period: string
  status: 'pending' | 'calculating' | 'completed'
  statusLabel: string
  details?: any[]
  createdAt: string
  completedAt?: string
}

// ============ 通用类型 ============

export type View = 'dashboard' | 'members' | 'courses' | 'appointments' | 'finance' | 'hr' | 'inventory' | 'reports'

export interface Pagination {
  page: number
  pageSize: number
  total: number
}

export interface TableColumn {
  key: string
  title: string
  width?: number
  sortable?: boolean
  filterable?: boolean
}

export interface FilterOption {
  label: string
  value: string
}

// ============ API 响应类型 ============

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// ============ 表单相关 ============

export interface FormField {
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'tel' | 'date' | 'select' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: FilterOption[]
  rules?: ValidationRule[]
}

export interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'min' | 'max' | 'pattern'
  message: string
  value?: any
}

// ============ 通知相关 ============

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
}

// ============ 人力资源相关 ============

// 员工在职状态
export type EmployeeStatus = 'probation' | 'regular' | 'resigned' | 'terminated' | 'on_leave'

// 聘用类型
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'intern'

// 教练角色类型
export type CoachRole = 'mentor' | 'apprentice' | 'coach'

// 员工信息
export interface HREmployee {
  id: string
  name: string
  phone: string
  email?: string
  avatar?: string

  // 职位信息
  position: string // 职位名称
  department: string // 部门

  // 聘用信息
  employmentType: EmploymentType // 聘用类型
  role: CoachRole // 角色：师傅、徒弟、普通教练
  status: EmployeeStatus // 在职状态

  // 合同信息
  hireDate: string // 入职日期
  contractStartDate?: string // 合同开始日期
  contractEndDate?: string // 合同结束日期
  probationEndDate?: string // 试用期结束日期

  // 师徒关系
  mentorId?: string // 师傅ID（如果是徒弟）
  apprentices?: string[] // 徒弟ID列表（如果是师傅）
  groupName?: string // 师徒组名称（如果是师傅）

  // 负载和业绩
  currentLoad: number // 当前负载
  maxLoad: number // 最大负载
  performanceScore?: number // 绩效分数

  // 薪资信息
  baseSalary?: number
  commissionRate?: number

  // 紧急联系人
  emergencyContact?: string
  emergencyPhone?: string

  // 地址信息
  address?: string
  idCard?: string

  // 银行账户
  bankAccount?: string
  bankName?: string

  // 备注
  notes?: string

  createdAt: string
  updatedAt: string
}

// 师徒关系
export interface CoachingRelationship {
  id: string
  mentorId: string // 师傅ID
  mentorName: string // 师傅姓名
  apprenticeId: string // 徒弟ID
  apprenticeName: string // 徒弟姓名
  startDate: string // 建立关系日期
  endDate?: string // 结束关系日期
  status: 'active' | 'inactive' // 关系状态
  trainingGoals?: string // 培训目标
  progress?: number // 培训进度（0-100）
  notes?: string
}

// 师徒组
export interface MentorshipGroup {
  id: string
  name: string // 组名
  mentorId: string // 组长（师傅）ID
  mentorName: string // 组长姓名
  memberCount: number // 成员数量（包括组长）
  totalLoad: number // 总负载
  totalMaxLoad: number // 总最大负载
  loadRate: number // 负载率
  avgPerformance: number // 平均绩效分数
  totalScore: number // 总分（用于排名）
  createdAt: string // 创建时间
}

// 入职记录
export interface OnboardingRecord {
  id: string
  employeeId: string
  employeeName: string
  hireDate: string
  employmentType: EmploymentType
  department: string
  position: string
  recruiter: string // 招聘人
  onboardingTasks: OnboardingTask[]
  status: 'pending' | 'in_progress' | 'completed'
  notes?: string
  createdAt: string
}

// 入职任务
export interface OnboardingTask {
  id: string
  name: string
  description: string
  completed: boolean
  completedAt?: string
  completedBy?: string
}

// 离职记录
export interface OffboardingRecord {
  id: string
  employeeId: string
  employeeName: string
  resignationDate: string
  lastWorkDate: string
  reason: string // 离职原因
  reasonType: 'voluntary' | 'involuntary' | 'retirement' | 'other'
  status: 'pending' | 'processing' | 'completed'
  handoverTasks: OffboardingTask[]
  exitInterview?: {
    date: string
    interviewer: string
    feedback: string
    rating?: number
  }
  createdAt: string
}

// 离职交接任务
export interface OffboardingTask {
  id: string
  name: string
  description: string
  completed: boolean
  completedAt?: string
  completedBy?: string
  notes?: string
}

// 转正记录
export interface RegularizationRecord {
  id: string
  employeeId: string
  employeeName: string
  hireDate: string
  probationEndDate: string
  actualRegularizationDate: string
  result: 'approved' | 'denied' | 'extended'
  evaluator: string // 评估人
  performanceScore: number // 绩效评分
  attitudeScore: number // 态度评分
  abilityScore: number // 能力评分
  comments: string // 评价意见
  approvedBy?: string
  approvedAt?: string
  createdAt: string
}

// 调薪记录
export interface SalaryAdjustmentRecord {
  id: string
  employeeId: string
  employeeName: string
  adjustmentType: 'raise' | 'promotion' | 'demotion' | 'annual_review' | 'other'
  previousSalary: number
  newSalary: number
  effectiveDate: string
  reason: string
  approvedBy: string
  approvedAt: string
  createdAt: string
}

// HR统计数据
export interface HRStatistics {
  totalEmployees: number
  activeEmployees: number
  probationEmployees: number
  resignedEmployees: number

  // 按聘用类型统计
  fullTimeCount: number
  partTimeCount: number
  contractCount: number
  internCount: number

  // 按角色统计
  mentorCount: number // 师傅人数
  apprenticeCount: number // 徒弟人数
  coachCount: number // 普通教练人数

  // 师徒关系统计
  activeCoachingRelationships: number // 活跃的师徒关系数
  mentorshipGroups: number // 师徒组数（师傅数量）

  // 本月入职
  newHiresThisMonth: number
  // 本月离职
  resignationsThisMonth: number
  // 待审批转正
  pendingRegularizations: number

  // 平均负载率
  averageLoadRate: number
}

// ============ 员工分配相关 ============

export interface EmployeeAssignment {
  employeeId: string
  employeeName: string
  position: 'coach' | 'doctor'
  assignedAt: string
  serviceType: 'basic' | 'deep'
  firstServiceDate: string
  isNewClient: boolean
  status: 'active' | 'inactive'
  load?: number
  maxLoad?: number
}

// ============ 系统日志相关 ============

export interface SystemLog {
  id: string
  operator: string
  operatorId: string
  action: string
  module: string
  targetId: string
  targetType: string
  details: {
    clientId: string
    clientName: string
    description: string
    before?: any
    after?: any
  }
  relatedData?: {
    employeeId?: string
    employeeName?: string
    oldEmployeeId?: string
    oldEmployeeName?: string
    isNewClient?: boolean
  }
  ip: string
  timestamp: string
  status: 'success' | 'failed'
}
