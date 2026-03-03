/**
 * 角色相关工具函数
 * 用于在系统中统一处理角色显示和判断
 */

import type { RoleLevel } from '@/data/systemRoles'

/**
 * 获取角色徽章样式类名
 * @param roleName 角色名称
 * @returns CSS类名字符串
 */
export function getRoleBadgeClass(roleName: string): string {
  const classes: Record<string, string> = {
    '超级管理员': 'bg-gradient-to-r from-rose-500 to-pink-500 text-white',
    '管理员': 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
    '全职教练': 'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
    '兼职教练': 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white',
    '运营': 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    '财务': 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
  }
  return classes[roleName] || 'bg-slate-100 text-slate-700'
}

/**
 * 获取角色等级对应的徽章样式
 * @param roleLevel 角色等级
 * @returns CSS类名字符串
 */
export function getRoleLevelBadgeClass(roleLevel: RoleLevel): string {
  const classes: Record<RoleLevel, string> = {
    super_admin: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white',
    admin: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white',
    coach_full: 'bg-gradient-to-r from-emerald-500 to-green-500 text-white',
    coach_part: 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white',
    operations: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
    finance: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
  }
  return classes[roleLevel] || 'bg-slate-100 text-slate-700'
}

/**
 * 判断是否为管理员角色（超级管理员或管理员）
 */
export function isAdmin(roleLevel: RoleLevel): boolean {
  return roleLevel === 'super_admin' || roleLevel === 'admin'
}

/**
 * 判断是否为教练角色（全职或兼职）
 */
export function isCoach(roleLevel: RoleLevel): boolean {
  return roleLevel === 'coach_full' || roleLevel === 'coach_part'
}

/**
 * 判断是否为全职教练
 */
export function isFullTimeCoach(roleLevel: RoleLevel): boolean {
  return roleLevel === 'coach_full'
}

/**
 * 判断是否可以访问结算功能
 */
export function canAccessSettlement(roleLevel: RoleLevel): boolean {
  return isAdmin(roleLevel) || isCoach(roleLevel) || roleLevel === 'finance'
}

/**
 * 判断是否可以审批结算
 */
export function canApproveSettlement(roleLevel: RoleLevel): boolean {
  return isAdmin(roleLevel) || roleLevel === 'finance'
}

/**
 * 获取角色中文名称
 */
export function getRoleLabel(roleLevel: RoleLevel): string {
  const labels: Record<RoleLevel, string> = {
    super_admin: '超级管理员',
    admin: '管理员',
    coach_full: '全职教练',
    coach_part: '兼职教练',
    operations: '运营',
    finance: '财务'
  }
  return labels[roleLevel] || '未知角色'
}

/**
 * 角色等级排序权重（数字越大权限越高）
 */
export function getRoleWeight(roleLevel: RoleLevel): number {
  const weights: Record<RoleLevel, number> = {
    super_admin: 100,
    admin: 80,
    finance: 60,
    operations: 50,
    coach_full: 40,
    coach_part: 30
  }
  return weights[roleLevel] || 0
}

/**
 * 比较两个角色等级
 * @returns 正数表示role1>role2，负数表示role1<role2，0表示相等
 */
export function compareRoles(roleLevel1: RoleLevel, roleLevel2: RoleLevel): number {
  return getRoleWeight(roleLevel1) - getRoleWeight(roleLevel2)
}
