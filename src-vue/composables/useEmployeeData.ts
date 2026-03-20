import { ref, computed } from 'vue'

// 员工数据接口
export interface Employee {
  id: string
  name: string
  position: 'coach' | 'doctor' | 'consultant'
  department?: string
  type?: string // 教练专长类型，如：减重/塑形、产后/瑜伽、康复训练
  load: number
  maxLoad: number
  status: 'active' | 'inactive' | 'on_leave'
  phone?: string
  email?: string
  color?: string // 用于UI显示的颜色
  activeUsers?: number // 活跃用户数
  reportUsers?: number // 举报用户数
}

// 员工列表数据（从现有 coachList 结构扩展）
const employees = ref<Employee[]>([
  { id: 'coach_1', name: '李教练', position: 'coach', department: '运动康复部', type: '减重/塑形', load: 12, maxLoad: 15, status: 'active', phone: '13800138001', email: 'li@company.com', color: 'bg-red-100 text-red-600', activeUsers: 8, reportUsers: 4 },
  { id: 'coach_2', name: '张教练', position: 'coach', department: '运动康复部', type: '产后/瑜伽', load: 8, maxLoad: 15, status: 'active', phone: '13800138002', email: 'zhang@company.com', color: 'bg-emerald-100 text-emerald-600', activeUsers: 5, reportUsers: 3 },
  { id: 'coach_3', name: '王教练', position: 'coach', department: '运动康复部', type: '康复训练', load: 5, maxLoad: 15, status: 'active', phone: '13800138003', email: 'wang@company.com', color: 'bg-emerald-100 text-emerald-600', activeUsers: 2, reportUsers: 3 },
  { id: 'doctor_1', name: '陈医生', position: 'doctor', department: '医疗服务部', type: '内科', load: 20, maxLoad: 25, status: 'active', phone: '13800138004', email: 'chen@company.com', color: 'bg-blue-100 text-blue-600' },
  { id: 'doctor_2', name: '刘医生', position: 'doctor', department: '医疗服务部', type: '骨科', load: 15, maxLoad: 25, status: 'active', phone: '13800138005', email: 'liu@company.com', color: 'bg-blue-100 text-blue-600' },
  { id: 'doctor_3', name: '赵医生', position: 'doctor', department: '医疗服务部', type: '神经内科', load: 22, maxLoad: 25, status: 'active', phone: '13800138006', email: 'zhao@company.com', color: 'bg-blue-100 text-blue-600' }
])

// 单个教练分配详情
export interface CoachAssignmentDetail {
  coachId: string
  coachName: string
  serviceType: 'basic' | 'deep'
  firstServiceDate: string
  isNewClient: boolean
  assignedAt: string
}

// 用户分配记录
export interface ClientAssignment {
  clientId: string
  clientName: string
  coaches: CoachAssignmentDetail[] // 支持多个教练
  doctorId?: string
  doctorName?: string
  assignedAt: string
  updatedAt: string
}

const clientAssignments = ref<ClientAssignment[]>([
  {
    clientId: 'client_001',
    clientName: '王小明',
    coaches: [
      {
        coachId: 'coach_1',
        coachName: '李教练',
        serviceType: 'deep',
        firstServiceDate: '2025-11-01',
        isNewClient: true,
        assignedAt: '2025-11-01T10:00:00'
      }
    ],
    doctorId: 'doctor_1',
    doctorName: '陈医生',
    assignedAt: '2025-11-01T10:00:00',
    updatedAt: '2025-11-01T10:00:00'
  },
  {
    clientId: 'client_002',
    clientName: '李小红',
    coaches: [
      {
        coachId: 'coach_2',
        coachName: '张教练',
        serviceType: 'basic',
        firstServiceDate: '2024-06-15',
        isNewClient: false,
        assignedAt: '2024-06-15T14:30:00'
      },
      {
        coachId: 'coach_3',
        coachName: '王教练',
        serviceType: 'basic',
        firstServiceDate: '2024-08-20',
        isNewClient: false,
        assignedAt: '2024-08-20T09:00:00'
      }
    ],
    assignedAt: '2024-06-15T14:30:00',
    updatedAt: '2024-08-20T09:00:00'
  }
])

// useEmployeeData composable
export const useEmployeeData = () => {
  // 获取所有员工
  const getAllEmployees = (): Employee[] => {
    return employees.value
  }

  // 按职位获取员工
  const getEmployeesByPosition = (position: 'coach' | 'doctor' | 'consultant'): Employee[] => {
    return employees.value.filter(emp => emp.position === position && emp.status === 'active')
  }

  // 按ID获取员工
  const getEmployeeById = (id: string): Employee | undefined => {
    return employees.value.find(emp => emp.id === id)
  }

  // 检查员工负载是否已满
  const isEmployeeAtFullCapacity = (employeeId: string): boolean => {
    const employee = getEmployeeById(employeeId)
    return employee ? employee.load >= employee.maxLoad : true
  }

  // 更新员工负载
  const updateEmployeeLoad = (employeeId: string, delta: number): boolean => {
    const employee = getEmployeeById(employeeId)
    if (!employee) return false

    const newLoad = employee.load + delta
    if (newLoad < 0 || newLoad > employee.maxLoad) {
      return false
    }

    employee.load = newLoad
    return true
  }

  // 获取用户分配信息
  const getClientAssignment = (clientId: string): ClientAssignment | undefined => {
    return clientAssignments.value.find(assignment => assignment.clientId === clientId)
  }

  // 更新用户分配
  const updateClientAssignment = (
    clientId: string,
    updates: Partial<Omit<ClientAssignment, 'clientId' | 'assignedAt' | 'updatedAt'>>
  ): ClientAssignment | undefined => {
    const index = clientAssignments.value.findIndex(a => a.clientId === clientId)
    if (index === -1) {
      // 创建新分配
      const newAssignment: ClientAssignment = {
        clientId,
        clientName: updates.clientName || '',
        coaches: updates.coaches || [],
        assignedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...updates
      }
      clientAssignments.value.push(newAssignment)
      return newAssignment
    } else {
      // 更新现有分配
      Object.assign(clientAssignments.value[index], {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      return clientAssignments.value[index]
    }
  }

  // 分配教练（添加到教练列表）
  const assignCoach = (
    clientId: string,
    clientName: string,
    coachId: string,
    serviceType: 'basic' | 'deep',
    firstServiceDate: string
  ): { success: boolean; message?: string; isNewClient?: boolean } => {
    const coach = getEmployeeById(coachId)
    if (!coach || coach.position !== 'coach') {
      return { success: false, message: '教练不存在' }
    }

    // 检查是否已经分配了该教练
    const assignment = getClientAssignment(clientId)
    if (assignment?.coaches.some(c => c.coachId === coachId)) {
      return { success: false, message: `该用户已分配了教练 ${coach.name}` }
    }

    // 检查负载
    if (isEmployeeAtFullCapacity(coachId)) {
      return { success: false, message: `教练 ${coach.name} 负载已满` }
    }

    // 计算是否为新用户（3个月内首次服务）
    const serviceStartDate = new Date(firstServiceDate)
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    const isNewClient = serviceStartDate >= threeMonthsAgo

    // 创建新的教练分配详情
    const newCoachAssignment: CoachAssignmentDetail = {
      coachId,
      coachName: coach.name,
      serviceType,
      firstServiceDate,
      isNewClient,
      assignedAt: new Date().toISOString()
    }

    // 获取现有的教练列表并添加新教练
    const currentCoaches = assignment?.coaches || []
    updateClientAssignment(clientId, {
      clientName,
      coaches: [...currentCoaches, newCoachAssignment]
    })

    // 更新负载
    updateEmployeeLoad(coachId, 1)

    return { success: true, isNewClient }
  }

  // 更换教练（移除指定教练并添加新教练）
  const changeCoach = (
    clientId: string,
    oldCoachId: string,
    newCoachId: string
  ): { success: boolean; message?: string } => {
    const assignment = getClientAssignment(clientId)
    if (!assignment || !assignment.coaches.some(c => c.coachId === oldCoachId)) {
      return { success: false, message: '该用户未分配该教练' }
    }

    const newCoach = getEmployeeById(newCoachId)
    if (!newCoach || newCoach.position !== 'coach') {
      return { success: false, message: '新教练不存在' }
    }

    // 检查是否已经分配了新教练
    if (assignment.coaches.some(c => c.coachId === newCoachId)) {
      return { success: false, message: `该用户已分配了教练 ${newCoach.name}` }
    }

    if (isEmployeeAtFullCapacity(newCoachId)) {
      return { success: false, message: `教练 ${newCoach.name} 负载已满` }
    }

    // 找到要被替换的教练分配详情
    const oldCoachDetail = assignment.coaches.find(c => c.coachId === oldCoachId)
    if (!oldCoachDetail) {
      return { success: false, message: '原教练信息不匹配' }
    }

    // 释放旧教练负载
    updateEmployeeLoad(oldCoachId, -1)

    // 创建新的教练分配详情，保留原有的服务类型和首次服务日期
    const newCoachAssignment: CoachAssignmentDetail = {
      coachId: newCoachId,
      coachName: newCoach.name,
      serviceType: oldCoachDetail.serviceType,
      firstServiceDate: oldCoachDetail.firstServiceDate,
      isNewClient: oldCoachDetail.isNewClient,
      assignedAt: new Date().toISOString()
    }

    // 更新教练列表：移除旧教练，添加新教练
    const updatedCoaches = assignment.coaches
      .filter(c => c.coachId !== oldCoachId)
      .concat(newCoachAssignment)

    updateClientAssignment(clientId, {
      coaches: updatedCoaches
    })

    // 增加新教练负载
    updateEmployeeLoad(newCoachId, 1)

    return { success: true }
  }

  // 移除教练（移除指定的教练）
  const removeCoach = (
    clientId: string,
    coachId: string
  ): { success: boolean; message?: string; coachName?: string } => {
    const assignment = getClientAssignment(clientId)
    if (!assignment || assignment.coaches.length === 0) {
      return { success: false, message: '该用户未分配教练' }
    }

    const coachDetail = assignment.coaches.find(c => c.coachId === coachId)
    if (!coachDetail) {
      return { success: false, message: '该用户未分配指定的教练' }
    }

    // 更新教练列表：移除指定的教练
    const updatedCoaches = assignment.coaches.filter(c => c.coachId !== coachId)
    updateClientAssignment(clientId, {
      coaches: updatedCoaches
    })

    // 释放负载
    updateEmployeeLoad(coachId, -1)

    return { success: true, coachName: coachDetail.coachName }
  }

  // 分配医生
  const assignDoctor = (
    clientId: string,
    clientName: string,
    doctorId: string
  ): { success: boolean; message?: string } => {
    const doctor = getEmployeeById(doctorId)
    if (!doctor || doctor.position !== 'doctor') {
      return { success: false, message: '医生不存在' }
    }

    if (isEmployeeAtFullCapacity(doctorId)) {
      return { success: false, message: `医生 ${doctor.name} 负载已满` }
    }

    // 更新分配
    updateClientAssignment(clientId, {
      clientName,
      doctorId,
      doctorName: doctor.name
    })

    // 更新负载
    updateEmployeeLoad(doctorId, 1)

    return { success: true }
  }

  // 更换医生
  const changeDoctor = (
    clientId: string,
    oldDoctorId: string,
    newDoctorId: string
  ): { success: boolean; message?: string } => {
    const assignment = getClientAssignment(clientId)
    if (!assignment || !assignment.doctorId) {
      return { success: false, message: '该用户未分配医生' }
    }

    if (assignment.doctorId !== oldDoctorId) {
      return { success: false, message: '原医生信息不匹配' }
    }

    const newDoctor = getEmployeeById(newDoctorId)
    if (!newDoctor || newDoctor.position !== 'doctor') {
      return { success: false, message: '新医生不存在' }
    }

    if (isEmployeeAtFullCapacity(newDoctorId)) {
      return { success: false, message: `医生 ${newDoctor.name} 负载已满` }
    }

    // 释放旧医生负载
    updateEmployeeLoad(oldDoctorId, -1)

    // 更新分配
    updateClientAssignment(clientId, {
      doctorId: newDoctorId,
      doctorName: newDoctor.name
    })

    // 增加新医生负载
    updateEmployeeLoad(newDoctorId, 1)

    return { success: true }
  }

  // 移除医生
  const removeDoctor = (
    clientId: string
  ): { success: boolean; message?: string; doctorName?: string } => {
    const assignment = getClientAssignment(clientId)
    if (!assignment || !assignment.doctorId) {
      return { success: false, message: '该用户未分配医生' }
    }

    const doctorId = assignment.doctorId
    const doctorName = assignment.doctorName

    // 更新分配
    updateClientAssignment(clientId, {
      doctorId: undefined,
      doctorName: undefined
    })

    // 释放负载
    updateEmployeeLoad(doctorId, -1)

    return { success: true, doctorName }
  }

  // 获取员工统计信息
  const getEmployeeStats = (employeeId: string) => {
    const employee = getEmployeeById(employeeId)
    if (!employee) return null

    const loadPercentage = (employee.load / employee.maxLoad) * 100
    const isNearCapacity = loadPercentage >= 80
    const isAtCapacity = loadPercentage >= 100

    return {
      ...employee,
      loadPercentage,
      isNearCapacity,
      isAtCapacity
    }
  }

  // 计算属性
  const activeCoaches = computed(() => getEmployeesByPosition('coach'))
  const activeDoctors = computed(() => getEmployeesByPosition('doctor'))
  const totalClients = computed(() => clientAssignments.value.length)

  return {
    // 数据
    employees,
    clientAssignments,
    activeCoaches,
    activeDoctors,
    totalClients,

    // 查询方法
    getAllEmployees,
    getEmployeesByPosition,
    getEmployeeById,
    getClientAssignment,
    getEmployeeStats,

    // 教练操作
    assignCoach,
    changeCoach,
    removeCoach,

    // 医生操作
    assignDoctor,
    changeDoctor,
    removeDoctor,

    // 负载管理
    isEmployeeAtFullCapacity,
    updateEmployeeLoad
  }
}
