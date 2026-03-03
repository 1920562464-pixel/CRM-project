/**
 * 系统部门配置
 * 统一管理系统中的所有部门类型，确保全系统一致性
 */

export type DepartmentLevel = 'coach' | 'operations' | 'finance' | 'tech'

export interface SystemDepartment {
  id: string
  name: string
  code: DepartmentLevel
  description: string
}

/**
 * 系统部门定义
 */
export const SYSTEM_DEPARTMENTS: SystemDepartment[] = [
  {
    id: '1',
    name: '教练',
    code: 'coach',
    description: '健康教练部门，包含全职和兼职教练'
  },
  {
    id: '2',
    name: '运营',
    code: 'operations',
    description: '运营部门，负责客户运营、市场活动等'
  },
  {
    id: '3',
    name: '财务',
    code: 'finance',
    description: '财务部门，负责财务管理、结算审批等'
  },
  {
    id: '4',
    name: '技术',
    code: 'tech',
    description: '技术部门，负责系统开发和维护'
  }
]

/**
 * 部门名称列表（用于下拉选择）
 */
export const DEPARTMENTS: string[] = SYSTEM_DEPARTMENTS.map(d => d.name)

/**
 * 根据代码获取部门信息
 */
export function getDepartmentByCode(code: DepartmentLevel): SystemDepartment | undefined {
  return SYSTEM_DEPARTMENTS.find(d => d.code === code)
}

/**
 * 根据名称获取部门信息
 */
export function getDepartmentByName(name: string): SystemDepartment | undefined {
  return SYSTEM_DEPARTMENTS.find(d => d.name === name)
}

/**
 * 角色与部门的对应关系
 * 全职教练和兼职教练属于教练部
 */
export function getDepartmentForRole(roleLevel: string): string | null {
  const roleDeptMap: Record<string, string> = {
    'super_admin': '技术',
    'admin': '技术',
    'coach_full': '教练',
    'coach_part': '教练',
    'operations': '运营',
    'finance': '财务'
  }
  return roleDeptMap[roleLevel] || null
}

/**
 * 获取部门下拉选项
 */
export function getDepartmentOptions(): Array<{ label: string; value: DepartmentLevel }> {
  return SYSTEM_DEPARTMENTS.map(dept => ({
    label: dept.name,
    value: dept.code
  }))
}

/**
 * 获取部门徽章样式
 */
export function getDepartmentBadgeClass(deptName: string): string {
  const classes: Record<string, string> = {
    '教练': 'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
    '运营': 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    '财务': 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
    '技术': 'bg-gradient-to-r from-slate-500 to-gray-500 text-white'
  }
  return classes[deptName] || 'bg-slate-100 text-slate-700'
}
