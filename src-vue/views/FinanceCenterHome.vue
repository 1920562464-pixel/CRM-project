<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <DollarSign :size="28" class="text-blue-600" />
        财务中心
      </h1>
      <p class="text-slate-500 mt-1">收入、支出、资金流水管理</p>
    </div>

    <!-- 当前角色提示 -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-blue-600 rounded-lg">
          <Shield :size="20" class="text-white" />
        </div>
        <div class="flex-1">
          <div class="font-semibold text-blue-900">当前角色：{{ currentRoleConfig.name }}</div>
          <div class="text-sm text-blue-600">{{ currentRoleConfig.description }}</div>
        </div>
      </div>
    </div>

    <!-- 可用功能卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- 收入管理 -->
      <div v-if="hasPermission('showIncomeManagement')"
           @click="navigateTo('/finance-center/income')"
           class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group active:scale-95">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
            <TrendingUp :size="24" class="text-green-600" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">收入管理</h3>
            <p class="text-sm text-slate-500">会员充值、课程收入等</p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-600">管理收入记录</span>
          <ArrowRight :size="16" class="text-slate-400 group-hover:text-green-600 transition-colors" />
        </div>
      </div>

      <!-- 应收账款 -->
      <div v-if="hasPermission('showAccountReceivable')"
           @click="navigateTo('/finance-center/receivable')"
           class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group active:scale-95">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
            <Users :size="24" class="text-purple-600" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">应收账款</h3>
            <p class="text-sm text-slate-500">会员欠款、待收费用</p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-600">管理应收账款</span>
          <ArrowRight :size="16" class="text-slate-400 group-hover:text-purple-600 transition-colors" />
        </div>
      </div>

      <!-- 应付账款 -->
      <div v-if="hasPermission('showAccountPayable')"
           @click="navigateTo('/finance-center/payable')"
           class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group active:scale-95">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
            <AlertCircle :size="24" class="text-orange-600" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">应付账款</h3>
            <p class="text-sm text-slate-500">教练结算、供应商货款</p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-600">管理应付账款</span>
          <ArrowRight :size="16" class="text-slate-400 group-hover:text-orange-600 transition-colors" />
        </div>
      </div>

      <!-- 资金管理 -->
      <div v-if="hasPermission('showFundsManagement')"
           @click="navigateTo('/finance-center/funds')"
           class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group active:scale-95">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
            <Wallet :size="24" class="text-blue-600" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">资金管理</h3>
            <p class="text-sm text-slate-500">银行账户、资金流水</p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-600">管理资金账户</span>
          <ArrowRight :size="16" class="text-slate-400 group-hover:text-blue-600 transition-colors" />
        </div>
      </div>

      <!-- 报销管理 -->
      <div v-if="hasPermission('showReimbursement')"
           @click="navigateTo('/finance-center/reimbursement')"
           class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group active:scale-95">
        <div class="flex items-center gap-4 mb-4">
          <div class="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors">
            <Receipt :size="24" class="text-emerald-600" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900">报销管理</h3>
            <p class="text-sm text-slate-500">采购报销、费用管理</p>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-600">管理报销申请</span>
          <ArrowRight :size="16" class="text-slate-400 group-hover:text-emerald-600 transition-colors" />
        </div>
      </div>
    </div>

    <!-- 无权限提示 -->
    <div v-if="!hasAnyFinancePermission()" class="bg-slate-100 rounded-xl p-12 text-center">
      <Lock :size="48" class="mx-auto mb-4 text-slate-400" />
      <h3 class="text-lg font-semibold text-slate-700 mb-2">无访问权限</h3>
      <p class="text-slate-500">当前角色无财务中心访问权限</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  Wallet,
  Receipt,
  Shield,
  ArrowRight,
  Lock
} from 'lucide-vue-next'
import { useRole } from '../composables/useRole'

const router = useRouter()
const { currentRoleConfig, hasPermission } = useRole()

const hasAnyFinancePermission = () => {
  return hasPermission('showIncomeManagement') ||
         hasPermission('showAccountReceivable') ||
         hasPermission('showAccountPayable') ||
         hasPermission('showFundsManagement') ||
         hasPermission('showReimbursement')
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>
