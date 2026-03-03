<template>
  <div class="space-y-6">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- 页面标题和操作栏 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Clock :size="28" class="text-indigo-600" />
          上线服务管理
        </h1>
        <p class="text-sm text-slate-500 mt-2">教练和医生上线服务激励记录</p>
      </div>
      <div class="flex items-center gap-3">
        <div v-if="!allConfirmed" class="text-sm text-yellow-700 bg-yellow-100 px-4 py-2 rounded-lg">
          <AlertCircle :size="16" class="inline mr-1" />
          待确认状态
        </div>
        <div v-else class="text-sm text-green-700 bg-green-100 px-4 py-2 rounded-lg">
          <CheckCircle :size="16" class="inline mr-1" />
          已确认
        </div>
        <button
          @click="toggleConfirm"
          class="px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium"
          :class="allConfirmed
            ? 'border border-yellow-600 text-yellow-600 hover:bg-yellow-50'
            : 'bg-green-600 text-white hover:bg-green-700'"
        >
          <CheckCircle :size="16" />
          {{ allConfirmed ? '取消确认' : '确认本月数据' }}
        </button>
      </div>
    </div>

    <!-- 月份选择和操作 -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">选择月份</label>
            <select
              v-model="selectedMonth"
              @change="updateStats"
              class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="2025-02">2025年2月</option>
              <option value="2025-01">2025年1月</option>
              <option value="2024-12">2024年12月</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">筛选员工</label>
            <select
              v-model="selectedEmployeeId"
              @change="filterRecords"
              class="px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">全部员工</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.name }} ({{ emp.role === 'coach' ? '教练' : '医生' }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">&nbsp;</label>
            <button
              @click="showAddDialog = true"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium"
            >
              <Plus :size="16" />
              添加记录
            </button>
          </div>
        </div>

        <div class="text-right">
          <button
            @click="exportReport"
            class="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm"
          >
            <Download :size="16" />
            导出报表
          </button>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">正常服务</span>
          <Clock :size="20" />
        </div>
        <div class="text-2xl font-bold">{{ stats.services.normal }}</div>
        <div class="text-xs opacity-75">¥{{ stats.amounts.normal.toLocaleString() }}</div>
      </div>

      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">夜间服务</span>
          <Moon :size="20" />
        </div>
        <div class="text-2xl font-bold">{{ stats.services.night }}</div>
        <div class="text-xs opacity-75">¥{{ stats.amounts.night.toLocaleString() }}</div>
      </div>

      <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">周末服务</span>
          <Calendar :size="20" />
        </div>
        <div class="text-2xl font-bold">{{ stats.services.weekend }}</div>
        <div class="text-xs opacity-75">¥{{ stats.amounts.weekend.toLocaleString() }}</div>
      </div>

      <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">紧急服务</span>
          <AlertCircle :size="20" />
        </div>
        <div class="text-2xl font-bold">{{ stats.services.urgent }}</div>
        <div class="text-xs opacity-75">¥{{ stats.amounts.urgent.toLocaleString() }}</div>
      </div>

      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">总计</span>
          <DollarSign :size="20" />
        </div>
        <div class="text-2xl font-bold">{{ stats.services.total }}</div>
        <div class="text-xs opacity-75">¥{{ stats.amounts.total.toLocaleString() }}</div>
      </div>
    </div>

    <!-- 服务记录列表 -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 class="text-lg font-semibold">服务记录</h3>
      </div>

      <div v-if="serviceList.length === 0" class="p-12 text-center text-slate-400">
        <Clock :size="48" class="mx-auto mb-4 opacity-50" />
        <p class="font-medium">暂无服务记录</p>
        <p class="text-sm mt-1">请点击"添加记录"按钮开始添加</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">员工</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">服务用户</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">日期时间</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">类型</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">时长</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">金额</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="record in serviceList"
              :key="record.id"
              class="hover:bg-slate-50"
            >
              <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ record.employeeName }}</td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ record.userName }}</td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ formatDateTime(record.date) }}</td>
              <td class="px-4 py-3">
                <span
                  :class="`px-2 py-1 text-xs rounded ${
                    record.type === 'normal' ? 'bg-blue-100 text-blue-800' :
                    record.type === 'night' ? 'bg-purple-100 text-purple-800' :
                    record.type === 'weekend' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`"
                >
                  {{ getTypeLabel(record.type) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ record.duration }} 分钟</td>
              <td class="px-4 py-3 text-sm font-semibold text-green-600">¥{{ record.amount }}</td>
              <td class="px-4 py-3 text-center">
                <button
                  @click="deleteRecord(record.id)"
                  class="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded border border-red-200"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加服务记录弹窗 -->
    <Modal v-model:show="showAddDialog" title="添加上线服务记录" size="lg">
      <form @submit.prevent="handleAdd" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">选择员工 *</label>
            <select v-model="addForm.employeeId" required class="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="">请选择员工</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.name }} ({{ emp.role === 'coach' ? '教练' : '医生' }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">服务用户 *</label>
            <input
              v-model="addForm.userName"
              type="text"
              required
              placeholder="输入用户姓名"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">日期时间 *</label>
            <input
              v-model="addForm.date"
              type="datetime-local"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">服务类型 *</label>
            <select v-model="addForm.type" required class="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="normal">正常服务 (¥200)</option>
              <option value="night">夜间服务 (¥250)</option>
              <option value="weekend">周末服务 (¥250)</option>
              <option value="urgent">紧急服务 (¥300)</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">服务时长（分钟）*</label>
          <input
            v-model.number="addForm.duration"
            type="number"
            min="1"
            required
            placeholder="输入服务时长"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-blue-800">预估金额：</span>
            <span class="text-xl font-bold text-blue-600">¥{{ estimatedAmount }}</span>
          </div>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <div class="font-semibold mb-2">💡 服务类型说明</div>
          <ul class="list-disc list-inside space-y-1 text-xs">
            <li><strong>正常服务</strong>：工作日正常时间的服务，200元/次</li>
            <li><strong>夜间服务</strong>：工作日20:00以后或凌晨的服务，250元/次</li>
            <li><strong>周末服务</strong>：周六周日的服务，250元/次</li>
            <li><strong>紧急服务</strong>：用户急需的加急服务，300元/次</li>
          </ul>
        </div>
      </form>

      <template #footer>
        <button @click="showAddDialog = false" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
          取消
        </button>
        <button @click="handleAdd" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          添加记录
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Clock, Plus, Download, DollarSign, Moon, Calendar,
  AlertCircle, CheckCircle
} from 'lucide-vue-next'
import Toast from './shared/Toast.vue'
import Modal from './shared/Modal.vue'
import { useToast } from '../composables/useToast'
import type { OnlineService, OnlineServiceStats } from '../types/commission'

const toast = useToast()

// 模拟上线服务数据
const onlineServices = ref<OnlineService[]>([
  {
    id: 'os001',
    employeeId: '1',
    userId: 'U001',
    userName: '王小红',
    date: new Date('2025-02-25T20:30:00'),
    type: 'night',
    duration: 30,
    amount: 250
  },
  {
    id: 'os002',
    employeeId: '1',
    userId: 'U002',
    userName: '李大明',
    date: new Date('2025-02-24T14:00:00'),
    type: 'normal',
    duration: 20,
    amount: 200
  },
  {
    id: 'os003',
    employeeId: '3',
    userId: 'U003',
    userName: '张阿姨',
    date: new Date('2025-02-23T09:00:00'),
    type: 'weekend',
    duration: 45,
    amount: 250
  }
])

// 员工列表（模拟）
const employees = ref([
  { id: '1', name: '张教练', role: 'coach' },
  { id: '2', name: '李教练', role: 'coach' },
  { id: '3', name: '王医生', role: 'doctor' },
  { id: '4', name: '赵医生', role: 'doctor' }
])

const selectedMonth = ref('2025-02')
const selectedEmployeeId = ref('')
const showAddDialog = ref(false)
const allConfirmed = ref(false)

// 添加表单
const addForm = ref({
  employeeId: '',
  userName: '',
  date: '',
  type: 'normal' as 'normal' | 'night' | 'weekend' | 'urgent',
  duration: 30
})

// 统计数据
const stats = ref<OnlineServiceStats>({
  employeeId: '',
  month: '2025-02',
  services: {
    normal: 0,
    night: 0,
    weekend: 0,
    urgent: 0,
    total: 0
  },
  amounts: {
    normal: 0,
    night: 0,
    weekend: 0,
    urgent: 0,
    total: 0
  },
  details: []
})

// 服务类型费率
const serviceRates = {
  normal: 200,
  night: 250,
  weekend: 250,
  urgent: 300
}

// 预估金额
const estimatedAmount = computed(() => {
  return serviceRates[addForm.value.type]
})

// 服务列表
const serviceList = computed(() => {
  let list = onlineServices.value.filter(record => {
    const recordMonth = record.date.toISOString().slice(0, 7)
    return recordMonth === selectedMonth.value
  })

  if (selectedEmployeeId.value) {
    list = list.filter(r => r.employeeId === selectedEmployeeId.value)
  }

  return list.sort((a, b) => b.date.getTime() - a.date.getTime())
})

// 更新统计
// 切换确认状态
const toggleConfirm = () => {
  allConfirmed.value = !allConfirmed.value
  toast.success(
    allConfirmed.value ? '确认成功' : '已取消确认',
    allConfirmed.value ? '本月上线服务数据已确认' : '上线服务数据确认已取消'
  )
}

const updateStats = () => {
  const monthServices = onlineServices.value.filter(s => {
    const serviceMonth = s.date.toISOString().slice(0, 7)
    return serviceMonth === selectedMonth.value
  })

  stats.value = {
    employeeId: '',
    month: selectedMonth.value,
    services: {
      normal: monthServices.filter(s => s.type === 'normal').length,
      night: monthServices.filter(s => s.type === 'night').length,
      weekend: monthServices.filter(s => s.type === 'weekend').length,
      urgent: monthServices.filter(s => s.type === 'urgent').length,
      total: monthServices.length
    },
    amounts: {
      normal: monthServices.filter(s => s.type === 'normal').reduce((sum, s) => sum + s.amount, 0),
      night: monthServices.filter(s => s.type === 'night').reduce((sum, s) => sum + s.amount, 0),
      weekend: monthServices.filter(s => s.type === 'weekend').reduce((sum, s) => sum + s.amount, 0),
      urgent: monthServices.filter(s => s.type === 'urgent').reduce((sum, s) => sum + s.amount, 0),
      total: monthServices.reduce((sum, s) => sum + s.amount, 0)
    },
    details: monthServices
  }
}

// 筛选记录
const filterRecords = () => {
  // 触发计算属性更新
}

// 获取类型标签
const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    normal: '正常',
    night: '夜间',
    weekend: '周末',
    urgent: '紧急'
  }
  return labels[type] || type
}

// 格式化日期时间
const formatDateTime = (date: Date): string => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 添加记录
const handleAdd = () => {
  const newService: OnlineService = {
    id: `os${Date.now()}`,
    employeeId: addForm.value.employeeId,
    userId: 'U' + Date.now(),
    userName: addForm.value.userName,
    date: new Date(addForm.value.date),
    type: addForm.value.type,
    duration: addForm.value.duration,
    amount: serviceRates[addForm.value.type]
  }

  onlineServices.value.unshift(newService)
  toast.success('添加成功', '上线服务记录已添加')
  showAddDialog.value = false

  // 重置表单
  addForm.value = {
    employeeId: '',
    userName: '',
    date: '',
    type: 'normal',
    duration: 30
  }

  updateStats()
}

// 删除记录
const deleteRecord = (id: string) => {
  if (confirm('确定要删除这条记录吗？')) {
    const index = onlineServices.value.findIndex(s => s.id === id)
    if (index !== -1) {
      onlineServices.value.splice(index, 1)
      toast.success('删除成功', '服务记录已删除')
      updateStats()
    }
  }
}

// 导出报表
const exportReport = () => {
  toast.success('导出成功', '上线服务报表已导出')
}

onMounted(() => {
  // 设置默认日期为今天
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const hours = now.getHours().toString().padStart(2, '0')
  const minutes = now.getMinutes().toString().padStart(2, '0')
  addForm.value.date = `${year}-${month}-${day}T${hours}:${minutes}`

  updateStats()
})
</script>
