<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
        <input
          type="text"
          placeholder="搜索医生..."
          class="w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>
      <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm">
        <Download :size="16" />
        导出记录
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">医生</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">结算期</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">金额</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">收款账户</th>
            <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">状态</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">支付时间</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">操作人</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="payment in payments" :key="payment.id" class="hover:bg-slate-50">
            <td class="px-6 py-4 font-medium text-slate-900">{{ payment.employeeName }}</td>
            <td class="px-6 py-4 text-sm text-slate-600">{{ payment.settlementPeriod }}</td>
            <td class="px-6 py-4 text-right font-bold text-indigo-600">
              ¥{{ payment.amount.toLocaleString() }}
            </td>
            <td class="px-6 py-4 text-sm text-slate-600">
              <div>{{ payment.bankName }}</div>
              <div class="text-xs text-slate-500">{{ payment.bankAccount }}</div>
            </td>
            <td class="px-6 py-4 text-center">
              <span :class="`px-2 py-1 rounded-full text-xs font-medium ${
                payment.status === 'success' ? 'bg-green-100 text-green-800' :
                payment.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`">
                {{ payment.status === 'success' ? '成功' : payment.status === 'processing' ? '处理中' : payment.status === 'failed' ? '失败' : '待处理' }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-slate-600">{{ payment.paidAt || '-' }}</td>
            <td class="px-6 py-4 text-sm text-slate-600">{{ payment.operator }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, Download } from 'lucide-vue-next'

interface DoctorPaymentRecord {
  id: string
  settlementId: string
  settlementPeriod: string
  employeeId: string
  employeeName: string
  bankName: string
  bankAccount: string
  amount: number
  paymentMethod: string
  status: string
  transactionId?: string
  paidAt?: string
  operator: string
  createdAt: string
}

defineProps<{
  payments: DoctorPaymentRecord[]
}>()
</script>
