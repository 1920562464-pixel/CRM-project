<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900">数据概览</h2>
        <p class="text-sm text-slate-500 mt-1">实时统计核心业务指标</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-white/20 rounded-xl">
            <Users :size="24" />
          </div>
        </div>
        <div class="text-3xl font-bold mb-1">{{ stats.activeEmployees }}</div>
        <div class="text-blue-100 text-sm">在职员工</div>
      </div>

      <div class="group bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-white/20 rounded-xl">
            <Users :size="24" />
          </div>
        </div>
        <div class="text-3xl font-bold mb-1">{{ stats.totalUsers }}</div>
        <div class="text-purple-100 text-sm">服务用户总数</div>
      </div>

      <div class="group bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-white/20 rounded-xl">
            <Clock :size="24" />
          </div>
        </div>
        <div class="text-3xl font-bold mb-1">¥{{ stats.pendingAmount.toLocaleString() }}</div>
        <div class="text-amber-100 text-sm">待发放金额</div>
      </div>

      <div class="group bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <div class="flex items-center justify-between mb-4">
          <div class="p-3 bg-white/20 rounded-xl">
            <DollarSign :size="24" />
          </div>
        </div>
        <div class="text-3xl font-bold mb-1">¥{{ stats.paidAmount.toLocaleString() }}</div>
        <div class="text-green-100 text-sm">已发放金额</div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 class="text-lg font-semibold text-slate-900 mb-4">月度结算趋势</h3>
      <div class="h-64 flex items-center justify-center text-slate-400">
        <div class="text-center">
          <BarChart3 :size="48" class="mx-auto mb-2" />
          <p>图表组件（可集成 ECharts）</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Award class="text-amber-500" :size="20" />
          员工绩效排行
        </h3>
        <span class="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">本月TOP5</span>
      </div>
      <div class="space-y-3">
        <div
          v-for="(emp, index) in topEmployees"
          :key="emp.id"
          :class="`group flex items-center justify-between p-4 rounded-xl transition-all ${
            index === 0 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200' :
            index === 1 ? 'bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200' :
            index === 2 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200' :
            'bg-slate-50 border border-slate-100'
          }`"
        >
          <div class="flex items-center gap-3">
            <div :class="`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${
              index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white' :
              index === 1 ? 'bg-gradient-to-br from-slate-400 to-gray-500 text-white' :
              index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600 text-white' :
              'bg-slate-200 text-slate-600'
            }`">
              {{ index + 1 }}
            </div>
            <img :src="emp.avatar" :alt="emp.name" class="w-10 h-10 rounded-full ring-2 ring-white shadow-sm" />
            <div>
              <span class="font-semibold text-slate-900">{{ emp.name }}</span>
              <div class="text-xs text-slate-500 mt-0.5">{{ emp.department }}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="flex items-center justify-end gap-1">
              <span class="text-xl font-bold text-indigo-600">{{ emp.totalUsers }}</span>
              <span class="text-sm text-slate-600">人</span>
            </div>
            <div class="text-xs text-slate-500 mt-1">累计 ¥{{ emp.totalSettled.toLocaleString() }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Users, Clock, DollarSign, BarChart3, Award } from 'lucide-vue-next'

interface Employee {
  id: string
  name: string
  phone: string
  department: string
  totalUsers: number
  totalSettled: number
  avatar?: string
  status: string
}

const props = defineProps<{
  stats: {
    activeEmployees: number
    totalUsers: number
    pendingAmount: number
    paidAmount: number
  }
  employees: Employee[]
}>()

const topEmployees = computed(() => {
  return props.employees
    .filter(e => e.status === 'active')
    .sort((a, b) => b.totalUsers - a.totalUsers)
    .slice(0, 5)
})
</script>
