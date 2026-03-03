/**
 * 系统角色配置
 * 统一管理系统中的所有角色类型，确保全系统一致性
 */

export type RoleLevel = 'super_admin' | 'admin' | 'coach_full' | 'coach_part' | 'operations' | 'finance'

export interface SystemRole {
  id: string
  name: string
  description: string
  level: RoleLevel
  permissions: string[]
  createTime?: string
}

/**
 * 系统角色定义
 */
export const SYSTEM_ROLES: SystemRole[] = [
  {
    id: '1',
    name: '超级管理员',
    description: '拥有系统所有权限，可管理所有功能模块',
    level: 'super_admin',
    permissions: ['全部权限'],
    createTime: '2023-01-01'
  },
  {
    id: '2',
    name: '管理员',
    description: '负责系统日常管理和配置',
    level: 'admin',
    permissions: ['系统配置', '用户管理', '角色管理', '数据字典', '通知公告', '日志查看'],
    createTime: '2023-01-01'
  },
  {
    id: '3',
    name: '全职教练',
    description: '全职健康教练，可管理学员和进行结算',
    level: 'coach_full',
    permissions: ['学员管理', '训练计划', '课程安排', '结算查看', '数据录入'],
    createTime: '2023-01-01'
  },
  {
    id: '4',
    name: '兼职教练',
    description: '兼职健康教练，有限的学员管理权限',
    level: 'coach_part',
    permissions: ['查看学员', '记录训练', '提交结算'],
    createTime: '2023-01-01'
  },
  {
    id: '5',
    name: '运营',
    description: '负责客户运营、市场活动等',
    level: 'operations',
    permissions: ['客户管理', '营销活动', '数据分析', '内容管理'],
    createTime: '2023-01-01'
  },
  {
    id: '6',
    name: '财务',
    description: '财务管理、收支记录、结算审批等',
    level: 'finance',
    permissions: ['财务管理', '结算审批', '报表查看', '数据导出'],
    createTime: '2023-01-01'
  }
]

/**
 * 根据角色等级获取角色信息
 */
export function getRoleByLevel(level: RoleLevel): SystemRole | undefined {
  return SYSTEM_ROLES.find(role => role.level === level)
}

/**
 * 根据角色ID获取角色信息
 */
export function getRoleById(id: string): SystemRole | undefined {
  return SYSTEM_ROLES.find(role => role.id === id)
}

/**
 * 获取所有角色名称列表（用于下拉选择）
 */
export function getRoleNames(): string[] {
  return SYSTEM_ROLES.map(role => role.name)
}

/**
 * 获取角色下拉选项（包含等级信息）
 */
export function getRoleOptions(): Array<{ label: string; value: RoleLevel }> {
  return SYSTEM_ROLES.map(role => ({
    label: role.name,
    value: role.level
  }))
}

/**
 * 检查角色是否有指定权限
 */
export function hasPermission(roleLevel: RoleLevel, permission: string): boolean {
  const role = getRoleByLevel(roleLevel)
  if (!role) return false
  if (role.level === 'super_admin') return true
  return role.permissions.includes(permission)
}

/**
 * 角色权限映射 - 用于界面显示
 */
export const ROLE_PERMISSION_GROUPS = {
  super_admin: ['全部权限'],
  admin: ['系统配置', '用户管理', '角色管理', '数据字典', '通知公告', '日志查看'],
  coach_full: ['学员管理', '训练计划', '课程安排', '结算查看', '数据录入'],
  coach_part: ['查看学员', '记录训练', '提交结算'],
  operations: ['客户管理', '营销活动', '数据分析', '内容管理'],
  finance: ['财务管理', '结算审批', '报表查看', '数据导出']
}
