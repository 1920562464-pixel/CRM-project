<template>
  <div class="space-y-6">
    <!-- 页面标题和 Tab 切换 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Banknote :size="28" class="text-indigo-600" />
          人力结算
        </h1>
        <p class="text-sm text-slate-500 mt-2">教练、医生与顾问结算管理系统</p>
      </div>

      <!-- 当前角色提示 -->
      <div v-if="settlementTypes.length > 0 && settlementTypes.length < 3" class="bg-blue-50 rounded-lg px-4 py-2 border border-blue-200">
        <span class="text-sm text-blue-700">{{ currentRoleConfig.name }}视图 · 仅显示{{ currentRoleConfig.name }}相关结算</span>
      </div>
    </div>

    <!-- Tab 切换 (只显示有权限的结算类型) -->
    <div v-if="settlementTypes.length > 0" class="flex bg-gradient-to-br from-slate-50 to-slate-100 p-1.5 rounded-xl shadow-sm border border-slate-200">
      <button
        v-for="type in settlementTypes"
        :key="type.id"
        @click="currentView = type.id"
        :class="`group relative px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 ${
          currentView === type.id
            ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md'
            : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
        }`"
      >
        <component :is="type.icon" :size="16" :class="currentView === type.id ? 'text-white' : ''" />
        {{ type.label }}
        <span v-if="currentView === type.id" class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white/50 rounded-full"></span>
      </button>
    </div>

    <!-- 无权限提示 -->
    <div v-else class="bg-slate-100 rounded-xl p-12 text-center">
      <Lock :size="48" class="mx-auto mb-4 text-slate-400" />
      <h3 class="text-lg font-semibold text-slate-700 mb-2">无访问权限</h3>
      <p class="text-slate-500">当前角色无人力结算访问权限</p>
    </div>

    <!-- 内容区域 - 传递当前角色信息 -->
    <CoachSettlement v-if="currentView === 'coach'" :current-role="currentRole" />
    <DoctorSettlement v-if="currentView === 'doctor'" :current-role="currentRole" />
    <CommissionSettlement v-if="currentView === 'commission'" :current-role="currentRole" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Users, Stethoscope, Banknote, Lock } from 'lucide-vue-next'
import CoachSettlement from '../components/CoachSettlement.vue'
import DoctorSettlement from '../components/DoctorSettlement.vue'
import CommissionSettlement from '../components/CommissionSettlement.vue'
import { useRole, type UserRole } from '../composables/useRole'

type SettlementView = 'coach' | 'doctor' | 'commission'

const { currentRole, currentRoleConfig, hasPermission } = useRole()

// 根据角色计算可用的结算类型 - 非管理员角色只能看到自己对应的结算类型
const settlementTypes = computed(() => {
  const types: Array<{ id: SettlementView; label: string; icon: any }> = []

  // 管理员可以看到所有结算类型
  const isAdmin = currentRole.value === 'admin' || currentRole.value === 'finance'

  // 教练只能看教练结算
  if (hasPermission('showCoachSettlement') && (isAdmin || currentRole.value === 'coach')) {
    types.push({ id: 'coach', label: '教练结算', icon: Users })
  }

  // 医生只能看医生结算
  if (hasPermission('showDoctorSettlement') && (isAdmin || currentRole.value === 'doctor')) {
    types.push({ id: 'doctor', label: '医生结算', icon: Stethoscope })
  }

  // 顾问只能看佣金结算
  if (hasPermission('showCommissionSettlement') && (isAdmin || currentRole.value === 'consultant')) {
    types.push({ id: 'commission', label: '佣金结算', icon: Banknote })
  }

  return types
})

// 默认选择第一个可用的类型
const currentView = ref<SettlementView>(
  settlementTypes.value.length > 0 ? settlementTypes.value[0].id : 'coach'
)
</script>
