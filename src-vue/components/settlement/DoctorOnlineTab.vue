<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-4">
      <div class="flex items-center gap-4 flex-wrap">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
          <input
            v-model="searchText"
            type="text"
            placeholder="搜索用户或医生..."
            class="w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <select v-model="filterDoctor" class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
          <option value="">全部医生</option>
          <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">{{ doctor.name }}</option>
        </select>
        <select v-model="filterServiceType" class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
          <option value="">全部服务类型</option>
          <option value="new">3个月内服务 (500元/月)</option>
          <option value="online">3个月后上线 (200元/次)</option>
        </select>
        <input
          v-model="filterMonth"
          type="month"
          class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="$emit('add')"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
        >
          <Plus :size="16" /> 新增记录
        </button>
        <button class="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm">
          <Download :size="16" /> 导出记录
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs opacity-90">本月服务总收入</div>
            <div class="text-2xl font-bold">¥{{ statistics.totalAmount.toLocaleString() }}</div>
          </div>
          <DollarSign :size="24" class="opacity-80" />
        </div>
      </div>
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs opacity-90">3个月内服务</div>
            <div class="text-2xl font-bold">{{ statistics.newServiceCount }}人</div>
          </div>
          <Users :size="24" class="opacity-80" />
        </div>
      </div>
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs opacity-90">上线服务次数</div>
            <div class="text-2xl font-bold">{{ statistics.onlineServiceCount }}次</div>
          </div>
          <Clock :size="24" class="opacity-80" />
        </div>
      </div>
      <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs opacity-90">服务医生数</div>
            <div class="text-2xl font-bold">{{ statistics.activeDoctors }}</div>
          </div>
          <Stethoscope :size="24" class="opacity-80" />
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">医生</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">用户</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">服务日期</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">服务类型</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">单价</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">时长/次数</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">金额</th>
            <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">状态</th>
            <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="record in filteredRecords" :key="record.id" class="hover:bg-slate-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Stethoscope :size="20" class="text-blue-600" />
                </div>
                <div>
                  <div class="font-medium text-slate-900">{{ record.employeeName }}</div>
                  <div class="text-xs text-slate-500">{{ record.department }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="font-medium text-slate-900">{{ record.userName }}</div>
              <div class="text-xs text-slate-500">{{ record.userId }}</div>
            </td>
            <td class="px-6 py-4 text-sm text-slate-600">{{ record.date }}</td>
            <td class="px-6 py-4">
              <span
                :class="`px-2 py-1 rounded text-xs font-semibold ${
                  record.serviceType === 'new'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800'
                }`"
              >
                {{ record.serviceType === 'new' ? '3个月内服务' : '上线服务' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right text-sm font-semibold text-slate-900">
              ¥{{ record.unitPrice }}
            </td>
            <td class="px-6 py-4 text-right text-sm text-slate-700">
              {{ record.serviceType === 'new' ? '1个月' : `${record.duration}分钟` }}
            </td>
            <td class="px-6 py-4 text-right text-sm font-bold text-indigo-600">
              ¥{{ record.amount.toLocaleString() }}
            </td>
            <td class="px-6 py-4 text-center">
              <span
                :class="`px-2 py-1 rounded text-xs font-semibold ${
                  record.status === 'confirmed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`"
              >
                {{ record.status === 'confirmed' ? '已确认' : '待确认' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="$emit('edit', record)"
                  class="px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200"
                >
                  编辑
                </button>
                <button
                  @click="$emit('delete', record.id)"
                  class="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded border border-red-200"
                >
                  删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="filteredRecords.length === 0" class="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
      <Stethoscope :size="48" class="mx-auto mb-4 text-slate-300" />
      <h3 class="text-lg font-semibold text-slate-900 mb-2">暂无服务记录</h3>
      <p class="text-sm text-slate-500">点击"新增记录"添加医生服务数据</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Download, Stethoscope, Plus, DollarSign, Users, Clock } from 'lucide-vue-next'

interface OnlineRecord {
  id: string
  employeeId: string
  employeeName: string
  department?: string
  userId: string
  userName: string
  date: string
  serviceType: 'new' | 'online'  // new: 3个月内服务, online: 3个月后上线
  unitPrice: number  // new: 500元/月, online: 200元/次
  duration: number  // 服务时长（分钟）
  amount: number
  status: 'pending' | 'confirmed'
  remark?: string
}

defineProps<{
  records: OnlineRecord[]
}>()

defineEmits<{
  add: []
  edit: [record: OnlineRecord]
  delete: [id: string]
}>()

// 搜索和筛选状态
const searchText = ref('')
const filterDoctor = ref('')
const filterServiceType = ref('')
const filterMonth = ref('')

// 提取唯一医生列表用于筛选
const doctors = computed(() => {
  const uniqueMap = new Map()
  return [] // TODO: 从 props.records 中提取唯一医生
})

// 统计数据
const statistics = computed(() => {
  return {
    totalAmount: 0,
    newServiceCount: 0,
    onlineServiceCount: 0,
    activeDoctors: 0
  }
})

// 筛选后的记录
const filteredRecords = computed(() => {
  let filtered = [] // TODO: 使用 props.records

  if (searchText.value) {
    const search = searchText.value.toLowerCase()
    filtered = filtered.filter((r: OnlineRecord) =>
      r.userName.toLowerCase().includes(search) ||
      r.employeeName.toLowerCase().includes(search) ||
      r.userId.toLowerCase().includes(search)
    )
  }

  if (filterDoctor.value) {
    filtered = filtered.filter((r: OnlineRecord) => r.employeeId === filterDoctor.value)
  }

  if (filterServiceType.value) {
    filtered = filtered.filter((r: OnlineRecord) => r.serviceType === filterServiceType.value)
  }

  return filtered
})
</script>
