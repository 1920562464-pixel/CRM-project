<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
          <input
            type="text"
            placeholder="搜索顾问或客户..."
            class="w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <select
          class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        >
          <option value="">全部状态</option>
          <option value="pending">待确认</option>
          <option value="calculated">已计算</option>
          <option value="approved">已审批</option>
          <option value="paid">已发放</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">顾问</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">客户</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">产品</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">订单金额</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">佣金比例</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">佣金金额</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">订单日期</th>
            <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">状态</th>
            <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="record in records" :key="record.id" class="hover:bg-slate-50">
            <td class="px-6 py-4 font-medium text-slate-900">{{ record.consultantName }}</td>
            <td class="px-6 py-4 text-sm text-slate-700">{{ record.userName }}</td>
            <td class="px-6 py-4 text-sm text-slate-600">{{ record.productName }}</td>
            <td class="px-6 py-4 text-right text-sm text-slate-900">¥{{ record.amount.toLocaleString() }}</td>
            <td class="px-6 py-4 text-right text-sm text-purple-700">{{ record.commissionRate }}%</td>
            <td class="px-6 py-4 text-right font-bold text-indigo-600">¥{{ record.commissionAmount.toLocaleString() }}</td>
            <td class="px-6 py-4 text-sm text-slate-600">{{ record.orderDate }}</td>
            <td class="px-6 py-4 text-center">
              <span :class="`px-2 py-1 rounded-full text-xs font-medium ${
                record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                record.status === 'calculated' ? 'bg-blue-100 text-blue-800' :
                record.status === 'approved' ? 'bg-green-100 text-green-800' :
                'bg-indigo-100 text-indigo-800'
              }`">
                {{ record.status === 'pending' ? '待确认' : record.status === 'calculated' ? '已计算' : record.status === 'approved' ? '已审批' : '已发放' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-center gap-2">
                <template v-if="record.status === 'calculated'">
                  <button
                    @click="$emit('approve', record.id)"
                    class="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    title="审批通过"
                  >
                    <CheckCircle :size="14" />
                  </button>
                  <button
                    @click="$emit('reject', record.id)"
                    class="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="驳回"
                  >
                    <XCircle :size="14" />
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, CheckCircle, XCircle } from 'lucide-vue-next'

interface CommissionRecord {
  id: string
  consultantId: string
  consultantName: string
  userId: string
  userName: string
  amount: number
  commissionRate: number
  commissionAmount: number
  orderDate: string
  productName: string
  status: 'pending' | 'calculated' | 'approved' | 'paid'
  createdAt: string
  paidAt?: string
  remark?: string
}

defineProps<{
  records: CommissionRecord[]
}>()

defineEmits<{
  'approve': [id: string]
  'reject': [id: string]
}>()
</script>
