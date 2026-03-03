<template>
  <div class="space-y-6">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- Tab 导航 -->
    <div class="flex items-center gap-2 border-b border-slate-200">
      <button
        @click="activeTab = 'overview'"
        class="px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
        :class="activeTab === 'overview'
          ? 'border-orange-600 text-orange-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'"
      >
        <BarChart3 :size="16" />
        佣金概览
      </button>
      <button
        @click="activeTab = 'my-commission'"
        class="px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
        :class="activeTab === 'my-commission'
          ? 'border-orange-600 text-orange-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'"
      >
        <User :size="16" />
        我的佣金
      </button>
      <button
        @click="activeTab = 'management'"
        class="px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
        :class="activeTab === 'management'
          ? 'border-orange-600 text-orange-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'"
      >
        <Settings :size="16" />
        佣金管理
      </button>
    </div>

    <!-- 佣金概览 -->
    <div v-if="activeTab === 'overview'" class="space-y-6">
      <!-- 月份选择 -->
      <div class="flex items-center justify-between">
        <select
          v-model="selectedMonth"
          @change="updateStats"
          class="px-4 py-2 border border-slate-300 rounded-lg"
        >
          <option value="2025-02">2025年2月</option>
          <option value="2025-01">2025年1月</option>
          <option value="2024-12">2024年12月</option>
        </select>
        <button
          @click="exportReport"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
        >
          <Download :size="16" />
          导出报表
        </button>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm opacity-90">新用户签约</span>
            <User :size="20" />
          </div>
          <div class="text-2xl font-bold">¥{{ stats.newUserAmount.toLocaleString() }}</div>
          <div class="text-xs opacity-75">{{ stats.newUserCount }} 人</div>
        </div>

        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm opacity-90">用户续约</span>
            <RefreshCw :size="20" />
          </div>
          <div class="text-2xl font-bold">¥{{ stats.renewalAmount.toLocaleString() }}</div>
          <div class="text-xs opacity-75">{{ stats.renewalCount }} 人</div>
        </div>

        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm opacity-90">产品销售</span>
            <ShoppingCart :size="20" />
          </div>
          <div class="text-2xl font-bold">¥{{ stats.productAmount.toLocaleString() }}</div>
          <div class="text-xs opacity-75">提成计算</div>
        </div>

        <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm opacity-90">推荐奖励</span>
            <Award :size="20" />
          </div>
          <div class="text-2xl font-bold">¥{{ stats.referralAmount.toLocaleString() }}</div>
          <div class="text-xs opacity-75">{{ stats.referralCount }} 笔</div>
        </div>

        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm opacity-90">总计</span>
            <DollarSign :size="20" />
          </div>
          <div class="text-2xl font-bold">¥{{ stats.totalAmount.toLocaleString() }}</div>
          <div class="text-xs opacity-75">{{ stats.totalCount }} 笔</div>
        </div>
      </div>

      <!-- 按角色统计 -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 class="text-lg font-semibold mb-4">按角色统计</h3>
        <div class="space-y-3">
          <div
            v-for="role in stats.byRole"
            :key="role.role"
            class="flex items-center"
          >
            <div class="w-24 text-sm font-medium text-slate-700">{{ role.roleName }}</div>
            <div class="flex-1 mx-4">
              <div class="h-6 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all"
                  :style="{ width: (role.amount / stats.totalAmount * 100) + '%' }"
                ></div>
              </div>
            </div>
            <div class="w-32 text-right">
              <div class="font-semibold text-slate-900">¥{{ role.amount.toLocaleString() }}</div>
              <div class="text-xs text-slate-500">{{ role.count }} 笔</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 明细列表 -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 class="text-lg font-semibold">佣金明细</h3>
        </div>
        <div v-if="commissionList.length > 0" class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">员工</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">类型</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">金额</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">状态</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">时间</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr
                v-for="item in commissionList"
                :key="item.id"
                class="hover:bg-slate-50"
              >
                <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ item.employeeName }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 text-xs rounded" :class="getTypeClass(item.type)">
                    {{ getTypeLabel(item.type) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm font-semibold text-green-600">¥{{ item.amount.toFixed(2) }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-1 text-xs rounded" :class="getStatusClass(item.status)">
                    {{ getStatusLabel(item.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ formatDate(item.occurredAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="p-12 text-center text-slate-400">
          <DollarSign :size="48" class="mx-auto mb-4 opacity-50" />
          <p class="font-medium">暂无佣金记录</p>
          <p class="text-sm mt-1">请选择其他月份查看</p>
        </div>
      </div>
    </div>

    <!-- 我的佣金 -->
    <div v-if="activeTab === 'my-commission'" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <div class="text-sm text-yellow-700 mb-1">待审核</div>
          <div class="text-2xl font-bold text-yellow-600">¥{{ myStats.pending.toLocaleString() }}</div>
        </div>
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div class="text-sm text-blue-700 mb-1">已审核</div>
          <div class="text-2xl font-bold text-blue-600">¥{{ myStats.approved.toLocaleString() }}</div>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-xl p-5">
          <div class="text-sm text-green-700 mb-1">已发放</div>
          <div class="text-2xl font-bold text-green-600">¥{{ myStats.paid.toLocaleString() }}</div>
        </div>
        <div class="bg-orange-50 border border-orange-200 rounded-xl p-5">
          <div class="text-sm text-orange-700 mb-1">总计</div>
          <div class="text-2xl font-bold text-orange-600">¥{{ myStats.total.toLocaleString() }}</div>
        </div>
      </div>

      <!-- 佣金规则说明 -->
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 class="text-lg font-semibold text-blue-900 mb-4">佣金规则说明</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-medium text-blue-800 mb-2">💰 新用户签约</h4>
            <p class="text-sm text-blue-700">根据岗位获得不同佣金</p>
          </div>
          <div>
            <h4 class="font-medium text-blue-800 mb-2">🔄 用户续约</h4>
            <p class="text-sm text-blue-700">用户成功续约获得续约佣金</p>
          </div>
          <div>
            <h4 class="font-medium text-blue-800 mb-2">🛒 产品销售</h4>
            <p class="text-sm text-blue-700">根据销售金额获得提成</p>
          </div>
          <div>
            <h4 class="font-medium text-blue-800 mb-2">⭐ 推荐奖励</h4>
            <p class="text-sm text-blue-700">推荐员工或用户获得奖励</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 佣金管理 -->
    <div v-if="activeTab === 'management'" class="space-y-6">
      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 class="text-lg font-semibold mb-4">佣金规则配置</h3>
        <p class="text-sm text-slate-500">佣金规则配置功能开发中...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { BarChart3, User, Settings, Download, DollarSign, Award, ShoppingCart, RefreshCw } from 'lucide-vue-next'
import Toast from './shared/Toast.vue'
import { useCommission } from '../composables/useCommission'
import { useToast } from '../composables/useToast'
import { useRole } from '../composables/useRole'
import type { CommissionStatus, CommissionType } from '../types/commission'

const toast = useToast()
const { currentRole } = useRole()
const { getMonthCommissions, getCommissionStats } = useCommission()

const activeTab = ref('overview')
const selectedMonth = ref('2025-02')

// 统计数据
const stats = ref({
  totalAmount: 0,
  totalCount: 0,
  newUserAmount: 0,
  newUserCount: 0,
  renewalAmount: 0,
  renewalCount: 0,
  productAmount: 0,
  productRate: 0.05,
  referralAmount: 0,
  referralCount: 0,
  byRole: []
})

// 我的佣金统计
const myStats = ref({
  pending: 0,
  approved: 0,
  paid: 0,
  total: 0
})

// 佣金列表
const commissionList = computed(() => {
  return getMonthCommissions(selectedMonth.value)
})

// 更新统计
const updateStats = () => {
  stats.value = getCommissionStats(selectedMonth.value)

  // 计算我的佣金（假设当前用户ID为1）
  const myCommissions = getMonthCommissions(selectedMonth.value).filter(
    c => c.employeeId === '1'
  )

  myStats.value = {
    pending: myCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0),
    approved: myCommissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.amount, 0),
    paid: myCommissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0),
    total: myCommissions.reduce((sum, c) => sum + c.amount, 0)
  }
}

// 获取类型标签
const getTypeLabel = (type: CommissionType): string => {
  const labels: Record<CommissionType, string> = {
    new_user: '新用户签约',
    renewal: '用户续约',
    product_sale: '产品销售',
    referral: '推荐奖励',
    bonus: '业绩奖金'
  }
  return labels[type] || type
}

// 获取类型样式
const getTypeClass = (type: CommissionType): string => {
  const classes: Record<CommissionType, string> = {
    new_user: 'bg-green-100 text-green-800',
    renewal: 'bg-blue-100 text-blue-800',
    product_sale: 'bg-purple-100 text-purple-800',
    referral: 'bg-amber-100 text-amber-800',
    bonus: 'bg-orange-100 text-orange-800'
  }
  return classes[type] || 'bg-slate-100 text-slate-800'
}

// 获取状态标签
const getStatusLabel = (status: CommissionStatus): string => {
  const labels: Record<CommissionStatus, string> = {
    pending: '待审核',
    approved: '已审核',
    paid: '已发放',
    cancelled: '已取消'
  }
  return labels[status] || status
}

// 获取状态样式
const getStatusClass = (status: CommissionStatus): string => {
  const classes: Record<CommissionStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-slate-100 text-slate-800'
  }
  return classes[status] || 'bg-slate-100 text-slate-800'
}

// 格式化日期
const formatDate = (date: Date): string => {
  const d = new Date(date)
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${month}-${day}`
}

// 导出报表
const exportReport = () => {
  toast.success('导出成功', '佣金报表已导出')
}

onMounted(() => {
  updateStats()
})
</script>
