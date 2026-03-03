<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
          <input
            type="text"
            placeholder="搜索顾问..."
            class="w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <input
          type="month"
          :value="selectedPeriod"
          class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>
      <button
        @click="$emit('generate')"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
      >
        <Plus :size="16" />
        生成结算单
      </button>
      <button
        @click="$emit('export')"
        class="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm"
      >
        <Download :size="16" />
        导出
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">顾问</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">结算周期</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">订单总额</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">佣金总额</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">记录数</th>
            <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">状态</th>
            <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="settlement in settlements" :key="settlement.id" class="hover:bg-slate-50">
            <td class="px-6 py-4 font-medium text-slate-900">{{ settlement.consultantName }}</td>
            <td class="px-6 py-4 text-sm text-slate-600">{{ settlement.period }}</td>
            <td class="px-6 py-4 text-right text-sm text-slate-900">¥{{ settlement.totalAmount.toLocaleString() }}</td>
            <td class="px-6 py-4 text-right font-bold text-indigo-600">¥{{ settlement.totalCommission.toLocaleString() }}</td>
            <td class="px-6 py-4 text-right text-sm text-slate-900">{{ settlement.recordCount }}笔</td>
            <td class="px-6 py-4 text-center">
              <span :class="`px-2 py-1 rounded-full text-xs font-medium ${
                settlement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                settlement.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`">
                {{ settlement.status === 'pending' ? '待审批' : settlement.status === 'approved' ? '已审批' : '已发放' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-center gap-2">
                <template v-if="settlement.status === 'pending'">
                  <button
                    @click="$emit('approve', settlement.id)"
                    class="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    title="审批通过"
                  >
                    <CheckCircle :size="14" />
                  </button>
                  <button
                    @click="$emit('reject', settlement.id)"
                    class="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="驳回"
                  >
                    <XCircle :size="14" />
                  </button>
                </template>
                <button
                  v-if="settlement.status === 'approved'"
                  @click="$emit('pay', settlement.id)"
                  class="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1 text-xs"
                >
                  <CreditCard :size="12" />
                  发放
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Plus, CheckCircle, XCircle, CreditCard, Download } from 'lucide-vue-next'

interface CommissionSettlement {
  id: string
  consultantId: string
  consultantName: string
  period: string
  totalAmount: number
  totalCommission: number
  recordCount: number
  status: 'pending' | 'approved' | 'paid'
  createdAt: string
  approvedAt?: string
  paidAt?: string
  remark?: string
}

defineProps<{
  settlements: CommissionSettlement[]
  selectedPeriod: string
}>()

defineEmits<{
  'generate': []
  'approve': [id: string]
  'reject': [id: string]
  'pay': [id: string]
  'export': []
}>()
</script>
