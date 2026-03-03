import { ref, computed } from 'vue'

export type UserRole = 'admin' | 'coach' | 'doctor' | 'consultant' | 'finance' | 'operations'

export interface RoleConfig {
  id: UserRole
  name: string
  description: string
  color: string
  icon: string
  permissions: {
    // 人力结算权限
    showCoachSettlement: boolean
    showDoctorSettlement: boolean
    showCommissionSettlement: boolean

    // 财务中心权限
    showIncomeManagement: boolean
    showAccountReceivable: boolean
    showAccountPayable: boolean
    showFundsManagement: boolean
    showReimbursement: boolean

    // 会员管理权限
    showMemberList: boolean
    showPotentialMembers: boolean

    // 库存管理权限
    showInventory: boolean
    showProductLibrary: boolean

    // 资产管理权限
    showAssetManagement: boolean

    // 教练报销权限
    showCoachReimbursement: boolean

    // 系统管理权限
    showSystemManagement: boolean
  }
}

export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
  admin: {
    id: 'admin',
    name: '管理员',
    description: '拥有所有权限',
    color: 'purple',
    icon: '👑',
    permissions: {
      showCoachSettlement: true,
      showDoctorSettlement: true,
      showCommissionSettlement: true,
      showIncomeManagement: true,
      showAccountReceivable: true,
      showAccountPayable: true,
      showFundsManagement: true,
      showReimbursement: true,
      showMemberList: true,
      showPotentialMembers: true,
      showInventory: true,
      showProductLibrary: true,
      showAssetManagement: true,
      showCoachReimbursement: true,
      showSystemManagement: true
    }
  },
  coach: {
    id: 'coach',
    name: '教练',
    description: '查看个人结算和会员信息',
    color: 'blue',
    icon: '🏃',
    permissions: {
      showCoachSettlement: true,
      showDoctorSettlement: false,
      showCommissionSettlement: false,
      showIncomeManagement: false,
      showAccountReceivable: false,
      showAccountPayable: false,
      showFundsManagement: false,
      showReimbursement: false,
      showMemberList: true,
      showPotentialMembers: false,
      showInventory: false,
      showProductLibrary: false,
      showAssetManagement: false,
      showCoachReimbursement: true,
      showSystemManagement: false
    }
  },
  doctor: {
    id: 'doctor',
    name: '医生',
    description: '查看个人结算和会员信息',
    color: 'emerald',
    icon: '👨‍⚕️',
    permissions: {
      showCoachSettlement: false,
      showDoctorSettlement: true,
      showCommissionSettlement: false,
      showIncomeManagement: false,
      showAccountReceivable: false,
      showAccountPayable: false,
      showFundsManagement: false,
      showReimbursement: false,
      showMemberList: true,
      showPotentialMembers: false,
      showInventory: false,
      showProductLibrary: false,
      showAssetManagement: false,
      showSystemManagement: false
    }
  },
  consultant: {
    id: 'consultant',
    name: '顾问',
    description: '查看个人结算和会员信息',
    color: 'orange',
    icon: '💼',
    permissions: {
      showCoachSettlement: false,
      showDoctorSettlement: false,
      showCommissionSettlement: true,
      showIncomeManagement: false,
      showAccountReceivable: false,
      showAccountPayable: false,
      showFundsManagement: false,
      showReimbursement: false,
      showMemberList: true,
      showPotentialMembers: true,
      showInventory: false,
      showProductLibrary: false,
      showAssetManagement: false,
      showSystemManagement: false
    }
  },
  finance: {
    id: 'finance',
    name: '财务',
    description: '管理财务和报销',
    color: 'green',
    icon: '💰',
    permissions: {
      showCoachSettlement: true,
      showDoctorSettlement: true,
      showCommissionSettlement: true,
      showIncomeManagement: true,
      showAccountReceivable: true,
      showAccountPayable: true,
      showFundsManagement: true,
      showReimbursement: true,
      showMemberList: true,
      showPotentialMembers: false,
      showInventory: true,
      showProductLibrary: true,
      showAssetManagement: false,
      showSystemManagement: false
    }
  },
  operations: {
    id: 'operations',
    name: '运营',
    description: '查看除人力结算外的所有页面',
    color: 'amber',
    icon: '📊',
    permissions: {
      showCoachSettlement: false,
      showDoctorSettlement: false,
      showCommissionSettlement: false,
      showIncomeManagement: true,
      showAccountReceivable: true,
      showAccountPayable: true,
      showFundsManagement: true,
      showReimbursement: true,
      showMemberList: true,
      showPotentialMembers: true,
      showInventory: true,
      showProductLibrary: true,
      showAssetManagement: true,
      showCoachReimbursement: true,
      showSystemManagement: true
    }
  }
}

// 当前角色（默认为管理员）
const currentRole = ref<UserRole>('admin')

export function useRole() {
  const currentRoleConfig = computed(() => ROLE_CONFIGS[currentRole.value])

  const switchRole = (role: UserRole) => {
    currentRole.value = role
  }

  const hasPermission = (permission: keyof RoleConfig['permissions']) => {
    return currentRoleConfig.value.permissions[permission]
  }

  const getAvailableRoles = (): RoleConfig[] => {
    return Object.values(ROLE_CONFIGS)
  }

  return {
    currentRole,
    currentRoleConfig,
    switchRole,
    hasPermission,
    getAvailableRoles,
    ROLE_CONFIGS
  }
}
