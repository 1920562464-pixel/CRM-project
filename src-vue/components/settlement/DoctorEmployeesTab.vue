<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4 flex-1">
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
          <input
            type="text"
            placeholder="搜索医生姓名或手机号..."
            class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <select
          class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        >
          <option value="all">全部状态</option>
          <option value="active">在职</option>
          <option value="inactive">离职</option>
          <option value="suspended">停职</option>
        </select>
      </div>
      <button
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
      >
        <UserPlus :size="16" />
        添加医生
      </button>
    </div>

    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase w-8"></th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">医生信息</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">专科/职称</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">用户数</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">上线次数</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">累计结算</th>
            <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">状态</th>
            <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <template v-for="emp in employees" :key="emp.id">
            <tr :class="`hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200 ${expandedEmployees.has(emp.id) ? 'bg-indigo-50/30' : ''}`">
              <td class="px-6 py-4">
                <button
                  @click="$emit('toggle-expand', emp.id)"
                  class="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                >
                  <ChevronUp v-if="expandedEmployees.has(emp.id)" :size="18" />
                  <ChevronDown v-else :size="18" />
                </button>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img :src="emp.avatar" :alt="emp.name" class="w-10 h-10 rounded-full bg-slate-100 ring-2 ring-white shadow-sm" />
                  <div>
                    <div class="font-medium text-slate-900">{{ emp.name }}</div>
                    <div class="text-xs text-slate-500">{{ emp.phone }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-slate-700">{{ emp.specialty }}</div>
                <div class="text-xs text-slate-500">{{ emp.title }}</div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="text-sm text-slate-900 font-semibold">{{ emp.totalUsers }}</div>
                <div class="text-xs text-slate-500 mt-0.5">
                  <span class="text-green-600">新{{ emp.newUsers }}</span>
                  <span class="text-slate-300 mx-1">|</span>
                  <span class="text-purple-600">老{{ emp.oldUsers }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200">
                  <span class="text-lg font-bold text-purple-600">{{ emp.onlineCount }}</span>
                  <span class="text-xs text-purple-600">次</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="inline-flex items-baseline gap-1 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                  <span class="text-sm text-slate-600">¥</span>
                  <span class="text-lg font-bold text-indigo-600">{{ emp.totalSettled.toLocaleString() }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-center">
                <span :class="`px-2 py-1 rounded-full text-xs font-medium ${
                  emp.status === 'active' ? 'bg-green-100 text-green-800' :
                  emp.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`">
                  {{ emp.status === 'active' ? '在职' : emp.status === 'inactive' ? '离职' : '停职' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    @click="$emit('edit', emp)"
                    class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                    title="编辑"
                  >
                    <Edit :size="14" />
                  </button>
                  <button
                    @click="$emit('delete', emp.id)"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="删除"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- 展开的详细行 -->
            <tr v-if="expandedEmployees.has(emp.id)">
              <td colspan="8" class="px-6 py-5 bg-gradient-to-br from-slate-50 to-indigo-50/30">
                <div class="space-y-5">
                  <!-- 统计概览 -->
                  <div class="grid grid-cols-4 gap-4 mb-4">
                    <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                      <div class="flex items-center justify-between mb-2">
                        <div class="text-xs text-slate-600 font-medium">本月服务用户</div>
                        <Users :size="16" class="text-slate-400" />
                      </div>
                      <div class="text-2xl font-bold text-slate-900">{{ (emp.serviceRecords || []).length }}</div>
                    </div>
                    <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
                      <div class="flex items-center justify-between mb-2">
                        <div class="text-xs text-green-700 font-medium">新用户服务</div>
                        <Sparkles :size="16" class="text-green-500" />
                      </div>
                      <div class="text-2xl font-bold text-green-700">{{ (emp.serviceRecords || []).filter(r => r.isNewUser).length }}</div>
                    </div>
                    <div class="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200 shadow-sm">
                      <div class="flex items-center justify-between mb-2">
                        <div class="text-xs text-purple-700 font-medium">总管理时长</div>
                        <Stethoscope :size="16" class="text-purple-500" />
                      </div>
                      <div class="text-2xl font-bold text-purple-700">{{ (emp.serviceRecords || []).reduce((sum, r) => sum + r.managementDuration, 0) }}天</div>
                    </div>
                    <div class="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200 shadow-sm">
                      <div class="flex items-center justify-between mb-2">
                        <div class="text-xs text-indigo-700 font-medium">本月服务费</div>
                        <DollarSign :size="16" class="text-indigo-500" />
                      </div>
                      <div class="text-2xl font-bold text-indigo-700">¥{{ (emp.serviceRecords || []).reduce((sum, r) => sum + r.totalAmount, 0) }}</div>
                    </div>
                  </div>

                  <!-- 服务明细列表 -->
                  <div v-if="(emp.serviceRecords || []).length > 0" class="bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <div class="px-4 py-3 bg-slate-50 border-b border-slate-200">
                      <h4 class="text-sm font-semibold text-slate-900">服务明细</h4>
                    </div>
                    <div class="divide-y divide-slate-100">
                      <div v-for="record in emp.serviceRecords" :key="record.id" class="px-4 py-3 hover:bg-slate-50">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-3 flex-1">
                            <img
                              :src="record.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${record.userName}`"
                              :alt="record.userName"
                              class="w-8 h-8 rounded-full bg-slate-100"
                            />
                            <div class="flex-1">
                              <div class="flex items-center gap-2">
                                <span class="font-medium text-slate-900">{{ record.userName }}</span>
                                <span v-if="record.isNewUser" class="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded">新用户</span>
                              </div>
                              <div class="flex items-center gap-4 text-xs text-slate-500 mt-1">
                                <span>管理：{{ record.startDate }} ~ {{ record.endDate || '至今' }}</span>
                              </div>
                            </div>
                          </div>
                          <div class="flex items-center gap-6 text-sm">
                            <div class="text-center">
                              <div class="text-xs text-slate-500">管理时长</div>
                              <div class="font-semibold text-slate-900">{{ record.managementDuration }}天</div>
                            </div>
                            <div class="text-center">
                              <div class="text-xs text-slate-500">上线次数</div>
                              <div class="font-semibold text-slate-900">{{ record.onlineCount }}次</div>
                            </div>
                            <div class="text-center">
                              <div class="text-xs text-slate-500">新用户费</div>
                              <div class="font-bold text-green-600">¥{{ record.newUserAmount }}</div>
                            </div>
                            <div class="text-center">
                              <div class="text-xs text-slate-500">上线费</div>
                              <div class="font-bold text-purple-600">¥{{ record.onlineAmount }}</div>
                            </div>
                            <div class="text-right">
                              <div class="text-xs text-slate-500">合计</div>
                              <div class="font-bold text-indigo-600">¥{{ record.totalAmount }}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-12 text-slate-400 bg-white rounded-lg border border-dashed border-slate-300">
                    <p class="text-sm font-medium text-slate-500">暂无服务记录</p>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, UserPlus, Edit, Trash2, ChevronDown, ChevronUp, Users, Sparkles, Stethoscope, DollarSign } from 'lucide-vue-next'

interface DoctorServiceRecord {
  id: string
  userId: string
  userName: string
  startDate: string
  endDate: string | null  // null 表示至今
  isNewUser: boolean
  serviceHours: number
  onlineCount: number
  managementDuration: number  // 管理时长（天）
  newUserAmount: number
  onlineAmount: number
  totalAmount: number
  avatar?: string
}

interface DoctorEmployee {
  id: string
  name: string
  phone: string
  idCard: string
  bankName: string
  bankAccount: string
  status: 'active' | 'inactive' | 'suspended'
  hireDate: string
  department: string
  specialty: string
  title: string
  totalUsers: number
  newUsers: number
  oldUsers: number
  totalSettled: number
  onlineCount: number
  lastSettleDate?: string
  avatar?: string
  remark?: string
  serviceRecords?: DoctorServiceRecord[]
}

defineProps<{
  employees: DoctorEmployee[]
  expandedEmployees: Set<string>
}>()

defineEmits<{
  'toggle-expand': [id: string]
  'edit': [employee: DoctorEmployee]
  'delete': [id: string]
}>()
</script>
