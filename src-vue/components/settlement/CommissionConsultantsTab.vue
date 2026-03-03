<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4 flex-1">
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
          <input
            type="text"
            placeholder="搜索顾问姓名或手机号..."
            class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <select
          class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        >
          <option value="all">全部状态</option>
          <option value="active">合作中</option>
          <option value="inactive">已终止</option>
          <option value="suspended">暂停</option>
        </select>
      </div>
      <button
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
      >
        <UserPlus :size="16" />
        添加顾问
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">顾问信息</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">所属公司</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">客户数</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">佣金比例</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">累计佣金</th>
            <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">状态</th>
            <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="consultant in consultants" :key="consultant.id" class="hover:bg-slate-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <img :src="consultant.avatar" :alt="consultant.name" class="w-10 h-10 rounded-full bg-slate-100 ring-2 ring-white shadow-sm" />
                <div>
                  <div class="font-medium text-slate-900">{{ consultant.name }}</div>
                  <div class="text-xs text-slate-500">{{ consultant.phone }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-slate-700">{{ consultant.company }}</div>
              <div class="text-xs text-slate-500">{{ consultant.email }}</div>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="text-sm font-semibold text-slate-900">{{ consultant.totalUsers }}</div>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
                <span class="text-lg font-bold text-purple-600">{{ consultant.commissionRate }}</span>
                <span class="text-xs text-purple-600">%</span>
              </div>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="inline-flex items-baseline gap-1 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                <span class="text-sm text-slate-600">¥</span>
                <span class="text-lg font-bold text-indigo-600">{{ consultant.totalCommission.toLocaleString() }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-center">
              <span :class="`px-2 py-1 rounded-full text-xs font-medium ${
                consultant.status === 'active' ? 'bg-green-100 text-green-800' :
                consultant.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`">
                {{ consultant.status === 'active' ? '合作中' : consultant.status === 'inactive' ? '已终止' : '暂停' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-center gap-1.5">
                <button
                  @click="$emit('edit', consultant)"
                  class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                  title="编辑"
                >
                  <Edit :size="14" />
                </button>
                <button
                  @click="$emit('delete', consultant.id)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="删除"
                >
                  <Trash2 :size="14" />
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
import { Search, UserPlus, Edit, Trash2 } from 'lucide-vue-next'

interface Consultant {
  id: string
  name: string
  phone: string
  email?: string
  company: string
  bankName: string
  bankAccount: string
  status: 'active' | 'inactive' | 'suspended'
  cooperationDate: string
  commissionRate: number
  totalUsers: number
  totalCommission: number
  lastSettleDate?: string
  avatar?: string
  remark?: string
}

defineProps<{
  consultants: Consultant[]
}>()

defineEmits<{
  'edit': [consultant: Consultant]
  'delete': [id: string]
}>()
</script>
