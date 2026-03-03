<template>
  <div class="space-y-4">
    <!-- 筛选和操作栏 -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-3 flex-wrap">
          <!-- 月份选择 -->
          <div class="flex items-center gap-2">
            <Calendar :size="16" class="text-slate-400" />
            <select
              :model-value="selectedPeriod"
              @change="$emit('update:period', ($event.target as HTMLSelectElement).value)"
              class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white min-w-[120px]"
            >
              <option value="2026-02">2026年2月</option>
              <option value="2026-01">2026年1月</option>
              <option value="2025-12">2025年12月</option>
              <option value="2025-11">2025年11月</option>
              <option value="2025-10">2025年10月</option>
            </select>
          </div>

          <!-- 状态筛选 -->
          <select
            :model-value="statusFilter"
            @change="$emit('update:statusFilter', ($event.target as HTMLSelectElement).value)"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
          >
            <option value="">全部状态</option>
            <option value="pending">待审批</option>
            <option value="approved">已审批</option>
            <option value="paid">已发放</option>
            <option value="rejected">已驳回</option>
          </select>

          <!-- 科室筛选 -->
          <select
            :model-value="departmentFilter"
            @change="$emit('update:departmentFilter', ($event.target as HTMLSelectElement).value)"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
          >
            <option value="">全部科室</option>
            <option value="康复医学科">康复医学科</option>
            <option value="运动医学科">运动医学科</option>
            <option value="中医科">中医科</option>
          </select>

          <!-- 搜索框 -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
            <input
              type="text"
              placeholder="搜索医生姓名..."
              :value="searchText"
              @input="$emit('update:searchText', ($event.target as HTMLInputElement).value)"
              class="w-56 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- 批量操作按钮 -->
          <button
            v-if="selectedSettlements.length > 0"
            @click="batchApprove"
            class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
          >
            <CheckCircle :size="14" />
            批量审批 ({{ selectedSettlements.length }})
          </button>

          <!-- 导出按钮 -->
          <button
            @click="$emit('export')"
            class="px-3 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1 text-sm"
          >
            <Download :size="14" />
            导出
          </button>

          <!-- 生成结算单按钮 -->
          <button
            @click="$emit('generate')"
            class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <Plus :size="16" />
            生成结算单
          </button>
        </div>
      </div>
    </div>

    <!-- 批量选择栏 -->
    <div
      v-if="selectedSettlements.length > 0"
      class="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2 flex items-center justify-between"
    >
      <span class="text-sm text-emerald-700">
        已选择 <strong>{{ selectedSettlements.length }}</strong> 条结算记录
      </span>
      <button @click="$emit('clearSelection')" class="text-emerald-600 hover:text-emerald-800 text-sm">取消选择</button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs opacity-90">本月结算金额</div>
            <div class="text-2xl font-bold">¥{{ statistics.totalAmount.toLocaleString() }}</div>
          </div>
          <Users :size="24" class="opacity-80" />
        </div>
      </div>
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs opacity-90">待审批金额</div>
            <div class="text-2xl font-bold">¥{{ statistics.pendingAmount.toLocaleString() }}</div>
          </div>
          <Clock :size="24" class="opacity-80" />
        </div>
      </div>
      <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs opacity-90">已发放金额</div>
            <div class="text-2xl font-bold">¥{{ statistics.paidAmount.toLocaleString() }}</div>
          </div>
          <CheckCircle :size="24" class="opacity-80" />
        </div>
      </div>
      <div class="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs opacity-90">上线服务数</div>
            <div class="text-2xl font-bold">{{ statistics.totalOnlineServices }}</div>
          </div>
          <Activity :size="24" class="opacity-80" />
        </div>
      </div>
    </div>

    <!-- 结算列表 -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-4 py-3 text-center w-10">
              <input
                type="checkbox"
                :checked="selectAll"
                @change="toggleSelectAll"
                class="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">医生</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">用户数</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">新用户</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">上线服务</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">上线费</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">合计</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">状态</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr
            v-for="settlement in settlements"
            :key="settlement.id"
            :class="['hover:bg-slate-50', selectedSettlements.includes(settlement.id) ? 'bg-emerald-50' : '']"
          >
            <td class="px-4 py-4 text-center">
              <input
                type="checkbox"
                :checked="selectedSettlements.includes(settlement.id)"
                @change="toggleSelect(settlement.id)"
                class="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Stethoscope :size="20" class="text-emerald-600" />
                </div>
                <div>
                  <div class="font-medium text-slate-900">{{ settlement.employeeName }}</div>
                  <div class="text-xs text-slate-500">{{ settlement.department || '康复医学科' }} · {{ settlement.specialty }}</div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-right text-sm">
              <div class="text-slate-900">{{ settlement.totalUsers }}</div>
              <div class="text-xs text-slate-500">总服务</div>
            </td>
            <td class="px-4 py-3 text-right text-sm">
              <div class="text-green-600 font-medium">{{ settlement.newUserAmount }}</div>
              <div class="text-xs text-slate-500">({{ settlement.newUsers }}人)</div>
            </td>
            <td class="px-4 py-3 text-right text-sm">
              <div class="text-purple-600 font-medium">{{ settlement.onlineCount }}次</div>
            </td>
            <td class="px-4 py-3 text-right text-sm text-slate-600">{{ settlement.onlineAmount }}</td>
            <td class="px-4 py-3 text-right font-bold text-emerald-600 text-base">
              ¥{{ settlement.totalAmount.toLocaleString() }}
            </td>
            <td class="px-4 py-3 text-center">
              <span :class="`px-2 py-1 rounded-full text-xs font-semibold ${
                settlement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                settlement.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                settlement.status === 'paid' ? 'bg-green-100 text-green-800' :
                settlement.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-slate-100 text-slate-800'
              }`">
                {{ settlement.status === 'pending' ? '待审批' :
                   settlement.status === 'approved' ? '已审批' :
                   settlement.status === 'paid' ? '已发放' :
                   settlement.status === 'rejected' ? '已驳回' : '未知' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1">
                <button
                  @click="$emit('view', settlement)"
                  class="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="查看详情"
                >
                  <Eye :size="14" />
                </button>
                <button
                  v-if="settlement.status === 'pending'"
                  @click="$emit('approve', settlement.id)"
                  class="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="审批通过"
                >
                  <CheckCircle :size="14" />
                </button>
                <button
                  v-if="settlement.status === 'pending'"
                  @click="$emit('reject', settlement.id)"
                  class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="驳回"
                >
                  <XCircle :size="14" />
                </button>
                <button
                  v-if="settlement.status === 'approved'"
                  @click="$emit('pay', settlement.id)"
                  class="px-2.5 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1 text-xs font-medium transition-colors"
                >
                  <CreditCard :size="12" />
                  发放
                </button>
                <button
                  @click="$emit('viewHistory', settlement)"
                  class="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  title="历史记录"
                >
                  <History :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 空状态 -->
      <div v-if="settlements.length === 0" class="p-16 text-center text-slate-400">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-3">
          <FileText :size="32" />
        </div>
        <p class="font-medium">暂无结算记录</p>
        <p class="text-sm mt-1">选择其他月份查看历史记录，或点击"生成结算单"创建本月结算</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Plus, Eye, CheckCircle, XCircle, CreditCard, FileText, Users, Clock, Activity, Calendar, Download, History, Stethoscope } from 'lucide-vue-next'

interface DoctorSettlementRecord {
  id: string
  employeeId: string
  employeeName: string
  period: string
  totalUsers: number
  newUsers: number
  oldUsers: number
  newUserAmount: number
  onlineCount: number
  onlineAmount: number
  totalAmount: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  createdAt: string
  approvedAt?: string
  paidAt?: string
  department?: string
  specialty?: string
  newUserRate?: number
  onlineRate?: number
  serviceCount?: number
  averageRating?: number
  orderCount?: number
}

interface DoctorSettlementStatistics {
  totalAmount: number
  pendingAmount: number
  paidAmount: number
  totalOnlineServices: number
}

const props = defineProps<{
  settlements: DoctorSettlementRecord[]
  selectedPeriod: string
  employees: any[]
}>()

const emit = defineEmits<{
  'generate': []
  'approve': [id: string]
  'reject': [id: string]
  'pay': [id: string]
  'view': [settlement: DoctorSettlementRecord]
  'viewHistory': [settlement: DoctorSettlementRecord]
  'update:period': [period: string]
  'update:statusFilter': [filter: string]
  'update:departmentFilter': [filter: string]
  'update:searchText': [text: string]
  'export': []
  'batchApprove': [ids: string[]]
  'clearSelection': []
}>()

const selectedSettlements = ref<string[]>([])
const statusFilter = ref('')
const departmentFilter = ref('')
const searchText = ref('')

const selectAll = computed(() => {
  return props.settlements.length > 0 && selectedSettlements.value.length === props.settlements.length
})

const toggleSelect = (id: string) => {
  if (selectedSettlements.value.includes(id)) {
    selectedSettlements.value = selectedSettlements.value.filter(sid => sid !== id)
  } else {
    selectedSettlements.value.push(id)
  }
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedSettlements.value = []
  } else {
    selectedSettlements.value = props.settlements.map(s => s.id)
  }
}

const statistics = computed((): DoctorSettlementStatistics => {
  const totalAmount = props.settlements.reduce((sum, s) => sum + s.totalAmount, 0)
  const pendingAmount = props.settlements.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.totalAmount, 0)
  const paidAmount = props.settlements.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.totalAmount, 0)
  const totalOnlineServices = props.settlements.reduce((sum, s) => sum + (s.onlineCount || 0), 0)

  return { totalAmount, pendingAmount, paidAmount, totalOnlineServices }
})

const batchApprove = () => {
  emit('batchApprove', selectedSettlements.value)
}
</script>
