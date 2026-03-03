<template>
  <div class="space-y-3">
    <!-- 筛选和操作栏 -->
    <div class="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-3 flex-wrap">
          <!-- 月份选择 -->
          <div class="flex items-center gap-2">
            <Calendar :size="16" class="text-slate-400" />
            <select
              :model-value="selectedPeriod"
              @change="$emit('update:period', ($event.target as HTMLSelectElement).value)"
              class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white min-w-[120px]"
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
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="">全部状态</option>
            <option value="pending">待审批</option>
            <option value="approved">已审批</option>
            <option value="paid">已发放</option>
            <option value="rejected">已驳回</option>
          </select>

          <!-- 部门筛选 -->
          <select
            :model-value="departmentFilter"
            @change="$emit('update:departmentFilter', ($event.target as HTMLSelectElement).value)"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="">全部部门</option>
            <option value="运动康复部">运动康复部</option>
            <option value="体能训练部">体能训练部</option>
            <option value="营养指导部">营养指导部</option>
          </select>

          <!-- 搜索框 -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
            <input
              type="text"
              placeholder="搜索教练姓名..."
              :value="searchText"
              @input="$emit('update:searchText', ($event.target as HTMLInputElement).value)"
              class="w-56 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
            :disabled="generationStatus.generated"
            :class="`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm ${
              generationStatus.generated
                ? 'bg-slate-400 text-white cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`"
          >
            <Plus :size="16" />
            {{ generationStatus.generated ? '已生成结算单' : '生成结算单' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 生成状态提示 -->
    <div
      v-if="generationStatus.generated"
      class="bg-green-50 border border-green-200 rounded-lg px-4 py-2 flex items-center justify-between"
    >
      <span class="text-xs text-green-700">
        <CheckCircle :size="14" class="inline mr-1" />
        本月结算单已于 <strong>{{ generationStatus.generatedAt }}</strong> 生成
        | 管理费用：¥{{ generationStatus.managementFee.toLocaleString() }}
      </span>
    </div>

    <!-- 批量选择栏 -->
    <div
      v-if="selectedSettlements.length > 0"
      class="bg-indigo-50 border border-indigo-200 rounded px-3 py-1.5 flex items-center justify-between"
    >
      <span class="text-xs text-indigo-700">
        已选择 <strong>{{ selectedSettlements.length }}</strong> 条结算记录
      </span>
      <button @click="$emit('clearSelection')" class="text-indigo-600 hover:text-indigo-800 text-xs">取消选择</button>
    </div>

    <!-- 统计卡片 - 紧凑布局 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] opacity-90">本月结算金额</div>
            <div class="text-lg font-bold">¥{{ statistics.totalAmount.toLocaleString() }}</div>
          </div>
          <Users :size="20" class="opacity-80" />
        </div>
      </div>
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] opacity-90">待审批金额</div>
            <div class="text-lg font-bold">¥{{ statistics.pendingAmount.toLocaleString() }}</div>
          </div>
          <Clock :size="20" class="opacity-80" />
        </div>
      </div>
      <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-3 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] opacity-90">已发放金额</div>
            <div class="text-lg font-bold">¥{{ statistics.paidAmount.toLocaleString() }}</div>
          </div>
          <CheckCircle :size="20" class="opacity-80" />
        </div>
      </div>
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] opacity-90">服务教练数</div>
            <div class="text-lg font-bold">{{ statistics.activeCoaches }}</div>
          </div>
          <Target :size="20" class="opacity-80" />
        </div>
      </div>
    </div>

    <!-- 结算列表 -->
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-3 py-2 text-center w-10">
              <input
                type="checkbox"
                :checked="selectAll"
                @change="toggleSelectAll"
                class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase">教练</th>
            <th class="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase">用户数</th>
            <th class="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase">新用户</th>
            <th class="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase">老用户</th>
            <th class="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase">绩效</th>
            <th class="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase">合计</th>
            <th class="px-3 py-2 text-center text-xs font-semibold text-slate-600 uppercase">状态</th>
            <th class="px-3 py-2 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr
            v-for="settlement in settlements"
            :key="settlement.id"
            :class="['hover:bg-slate-50', selectedSettlements.includes(settlement.id) ? 'bg-indigo-50' : '']"
          >
            <td class="px-3 py-2.5 text-center">
              <input
                type="checkbox"
                :checked="selectedSettlements.includes(settlement.id)"
                @change="toggleSelect(settlement.id)"
                class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </td>
            <td class="px-3 py-2.5">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User :size="16" class="text-indigo-600" />
                </div>
                <div>
                  <div class="text-sm font-medium text-slate-900">{{ settlement.employeeName }}</div>
                  <div class="text-[10px] text-slate-500">{{ settlement.department || '运动康复部' }}</div>
                </div>
              </div>
            </td>
            <td class="px-3 py-2.5 text-right text-sm">
              <div class="text-slate-900">{{ settlement.totalUsers }}</div>
              <div class="text-[10px] text-slate-500">总服务</div>
            </td>
            <td class="px-3 py-2.5 text-right text-sm">
              <div class="text-green-600 font-medium">{{ settlement.newUserAmount }}</div>
              <div class="text-[10px] text-slate-500">({{ settlement.newUsers }}人)</div>
            </td>
            <td class="px-3 py-2.5 text-right text-sm">
              <div class="text-blue-600 font-medium">{{ settlement.oldUserAmount }}</div>
              <div class="text-[10px] text-slate-500">({{ settlement.oldUsers }}人)</div>
            </td>
            <td class="px-3 py-2.5 text-right text-sm text-slate-600">{{ settlement.performanceBonus }}</td>
            <td class="px-3 py-2.5 text-right font-bold text-indigo-600 text-sm">
              ¥{{ settlement.totalAmount.toLocaleString() }}
            </td>
            <td class="px-3 py-2.5 text-center">
              <span :class="`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
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
            <td class="px-3 py-2.5">
              <div class="flex items-center justify-center gap-1">
                <button
                  @click.stop="$emit('view', settlement)"
                  @click.middle="$emit('view', settlement)"
                  class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  title="查看详情"
                  type="button"
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
      <div v-if="settlements.length === 0" class="p-8 text-center text-slate-400">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-2">
          <FileText :size="24" />
        </div>
        <p class="text-sm font-medium">暂无结算记录</p>
        <p class="text-xs mt-1">选择其他月份查看历史记录，或点击"生成结算单"创建本月结算</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Plus, Eye, CheckCircle, XCircle, CreditCard, FileText, Users, Clock, Target, Calendar, Download, History, User } from 'lucide-vue-next'

interface SettlementRecord {
  id: string
  employeeId: string
  employeeName: string
  period: string
  totalUsers: number
  newUsers: number
  oldUsers: number
  newUserAmount: number
  oldUserAmount: number
  performanceBonus: number
  totalAmount: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  createdAt: string
  approvedAt?: string
  paidAt?: string
  department?: string
  newUserRate?: number
  oldUserRate?: number
  serviceCount?: number // 服务次数
  averageRating?: number // 平均评分
  orderCount?: number // 订单数量
}

interface SettlementStatistics {
  totalAmount: number
  pendingAmount: number
  paidAmount: number
  activeCoaches: number
}

interface GenerationStatus {
  generated: boolean
  generatedAt: string
  managementFee: number
}

const props = defineProps<{
  settlements: SettlementRecord[]
  selectedPeriod: string
  employees: any[]
  generationStatus: GenerationStatus
}>()

const emit = defineEmits<{
  'generate': []
  'approve': [id: string]
  'reject': [id: string]
  'pay': [id: string]
  'view': [settlement: SettlementRecord]
  'viewHistory': [settlement: SettlementRecord]
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

const statistics = computed((): SettlementStatistics => {
  const totalAmount = props.settlements.reduce((sum, s) => sum + s.totalAmount, 0)
  const pendingAmount = props.settlements.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.totalAmount, 0)
  const paidAmount = props.settlements.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.totalAmount, 0)
  const activeCoaches = new Set(props.settlements.map(s => s.employeeId)).size

  return { totalAmount, pendingAmount, paidAmount, activeCoaches }
})

const batchApprove = () => {
  emit('batchApprove', selectedSettlements.value)
}
</script>
