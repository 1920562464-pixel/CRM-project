<template>
  <div class="space-y-6">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Link2 :size="28" class="text-indigo-600" />
          用户绑定管理
        </h1>
        <p class="text-sm text-slate-500 mt-2">管理员工与用户的服务绑定关系</p>
      </div>
    </div>

    <!-- 筛选和操作 -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">筛选员工</label>
            <select
              v-model="selectedEmployeeId"
              @change="filterBindings"
              class="px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">全部员工</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.name }} ({{ emp.role === 'coach' ? '教练' : '医生' }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">服务类型</label>
            <select
              v-model="selectedServiceType"
              @change="filterBindings"
              class="px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">全部</option>
              <option value="basic">基础服务</option>
              <option value="deep">深度服务</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">&nbsp;</label>
            <button
              @click="showAddDialog = true"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium"
            >
              <Plus :size="16" />
              添加绑定
            </button>
          </div>
        </div>

        <div class="text-right">
          <button
            @click="exportData"
            class="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm"
          >
            <Download :size="16" />
            导出数据
          </button>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">总绑定数</span>
          <Link2 :size="20" />
        </div>
        <div class="text-3xl font-bold">{{ stats.total }}</div>
        <div class="text-xs opacity-75">个绑定关系</div>
      </div>

      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">新用户</span>
          <UserPlus :size="20" />
        </div>
        <div class="text-3xl font-bold">{{ stats.newUserCount }}</div>
        <div class="text-xs opacity-75">服务≤3个月</div>
      </div>

      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">老用户</span>
          <User :size="20" />
        </div>
        <div class="text-3xl font-bold">{{ stats.oldUserCount }}</div>
        <div class="text-xs opacity-75">服务>3个月</div>
      </div>

      <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">基础服务</span>
          <Activity :size="20" />
        </div>
        <div class="text-3xl font-bold">{{ stats.basicService }}</div>
        <div class="text-xs opacity-75">基础服务类型</div>
      </div>
    </div>

    <!-- 绑定列表 -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 class="text-lg font-semibold">绑定关系列表</h3>
      </div>

      <div v-if="bindingList.length === 0" class="p-12 text-center text-slate-400">
        <Link2 :size="48" class="mx-auto mb-4 opacity-50" />
        <p class="font-medium">暂无绑定关系</p>
        <p class="text-sm mt-1">请点击"添加绑定"按钮开始添加</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">员工</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">用户</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">服务类型</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">首次服务日期</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">服务月数</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">状态</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="binding in bindingList"
              :key="binding.id"
              class="hover:bg-slate-50"
            >
              <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ binding.employeeName }}</td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ binding.userName }}</td>
              <td class="px-4 py-3">
                <span
                  :class="`px-2 py-1 text-xs rounded ${
                    binding.serviceType === 'basic' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`"
                >
                  {{ binding.serviceType === 'basic' ? '基础服务' : '深度服务' }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ binding.firstServiceDate }}</td>
              <td class="px-4 py-3 text-sm text-slate-600">
                <span :class="{
                  'text-green-600 font-semibold': binding.serviceMonths <= 3,
                  'text-blue-600': binding.serviceMonths > 3
                }">
                  {{ binding.serviceMonths }} 个月
                </span>
              </td>
              <td class="px-4 py-3">
                <span
                  :class="`px-2 py-1 text-xs rounded ${
                    binding.serviceMonths <= 3 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`"
                >
                  {{ binding.serviceMonths <= 3 ? '新用户' : '老用户' }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <button
                  @click="deleteBinding(binding.id)"
                  class="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded border border-red-200"
                >
                  解除绑定
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加绑定弹窗 -->
    <Modal v-model:show="showAddDialog" title="添加用户绑定" size="lg">
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
            <label class="block text-sm font-medium text-slate-700 mb-2">用户姓名 *</label>
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
            <label class="block text-sm font-medium text-slate-700 mb-2">服务类型 *</label>
            <select v-model="addForm.serviceType" required class="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="basic">基础服务</option>
              <option value="deep">深度服务</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">首次服务日期 *</label>
            <input
              v-model="addForm.firstServiceDate"
              type="date"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <div class="font-semibold mb-2">💡 服务类型说明</div>
          <ul class="list-disc list-inside space-y-1 text-xs">
            <li><strong>基础服务</strong>：日常健康服务，定期跟进</li>
            <li><strong>深度服务</strong>：一对一深度健康管理，定制方案</li>
            <li><strong>新用户</strong>：首次服务时间≤3个月，按新用户费率计算</li>
            <li><strong>老用户</strong>：首次服务时间>3个月，按老用户费率计算</li>
          </ul>
        </div>
      </form>

      <template #footer>
        <button @click="showAddDialog = false" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
          取消
        </button>
        <button @click="handleAdd" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          添加绑定
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Link2, Plus, Download, UserPlus, User, Activity
} from 'lucide-vue-next'
import Toast from './shared/Toast.vue'
import Modal from './shared/Modal.vue'
import { useToast } from '../composables/useToast'

const toast = useToast()

// 用户绑定关系类型
interface ServiceBinding {
  id: string
  employeeId: string
  employeeName: string
  employeeRole: string
  userId: string
  userName: string
  serviceType: 'basic' | 'deep'
  firstServiceDate: string
  serviceMonths: number
  createdAt: Date
}

// 模拟数据
const bindings = ref<ServiceBinding[]>([
  {
    id: 'ub001',
    employeeId: '1',
    employeeName: '张教练',
    employeeRole: 'coach',
    userId: 'U001',
    userName: '王小红',
    serviceType: 'basic',
    firstServiceDate: '2024-12-01',
    serviceMonths: 2,
    createdAt: new Date('2024-12-01')
  },
  {
    id: 'ub002',
    employeeId: '1',
    employeeName: '张教练',
    employeeRole: 'coach',
    userId: 'U002',
    userName: '李大明',
    serviceType: 'deep',
    firstServiceDate: '2024-06-15',
    serviceMonths: 8,
    createdAt: new Date('2024-06-15')
  },
  {
    id: 'ub003',
    employeeId: '3',
    employeeName: '王医生',
    employeeRole: 'doctor',
    userId: 'U003',
    userName: '张阿姨',
    serviceType: 'basic',
    firstServiceDate: '2024-11-01',
    serviceMonths: 3,
    createdAt: new Date('2024-11-01')
  }
])

// 员工列表（模拟）
const employees = ref([
  { id: '1', name: '张教练', role: 'coach' },
  { id: '2', name: '李教练', role: 'coach' },
  { id: '3', name: '王医生', role: 'doctor' },
  { id: '4', name: '赵医生', role: 'doctor' }
])

const selectedEmployeeId = ref('')
const selectedServiceType = ref('')
const showAddDialog = ref(false)

// 添加表单
const addForm = ref({
  employeeId: '',
  userName: '',
  serviceType: 'basic' as 'basic' | 'deep',
  firstServiceDate: ''
})

// 统计数据
const stats = ref({
  total: 0,
  newUserCount: 0,
  oldUserCount: 0,
  basicService: 0
})

// 绑定列表
const bindingList = computed(() => {
  let list = bindings.value

  if (selectedEmployeeId.value) {
    list = list.filter(b => b.employeeId === selectedEmployeeId.value)
  }

  if (selectedServiceType.value) {
    list = list.filter(b => b.serviceType === selectedServiceType.value)
  }

  // 重新计算服务月数
  list = list.map(b => ({
    ...b,
    serviceMonths: calculateServiceMonths(b.firstServiceDate)
  }))

  return list
})

// 计算服务月数
const calculateServiceMonths = (firstServiceDate: string): number => {
  const start = new Date(firstServiceDate)
  const now = new Date()
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  return Math.max(0, months)
}

// 更新统计
const updateStats = () => {
  const allBindings = bindings.value.map(b => ({
    ...b,
    serviceMonths: calculateServiceMonths(b.firstServiceDate)
  }))

  stats.value = {
    total: allBindings.length,
    newUserCount: allBindings.filter(b => b.serviceMonths <= 3).length,
    oldUserCount: allBindings.filter(b => b.serviceMonths > 3).length,
    basicService: allBindings.filter(b => b.serviceType === 'basic').length
  }
}

// 筛选绑定
const filterBindings = () => {
  // 触发计算属性更新
}

// 添加绑定
const handleAdd = () => {
  const employee = employees.value.find(e => e.id === addForm.value.employeeId)
  if (!employee) return

  const newBinding: ServiceBinding = {
    id: `ub${Date.now()}`,
    employeeId: addForm.value.employeeId,
    employeeName: employee.name,
    employeeRole: employee.role,
    userId: 'U' + Date.now(),
    userName: addForm.value.userName,
    serviceType: addForm.value.serviceType,
    firstServiceDate: addForm.value.firstServiceDate,
    serviceMonths: calculateServiceMonths(addForm.value.firstServiceDate),
    createdAt: new Date()
  }

  bindings.value.unshift(newBinding)
  toast.success('添加成功', '用户绑定关系已添加')
  showAddDialog.value = false

  // 重置表单
  addForm.value = {
    employeeId: '',
    userName: '',
    serviceType: 'basic',
    firstServiceDate: ''
  }

  updateStats()
}

// 删除绑定
const deleteBinding = (id: string) => {
  if (confirm('确定要解除这个绑定关系吗？')) {
    const index = bindings.value.findIndex(b => b.id === id)
    if (index !== -1) {
      bindings.value.splice(index, 1)
      toast.success('删除成功', '绑定关系已解除')
      updateStats()
    }
  }
}

// 导出数据
const exportData = () => {
  toast.success('导出成功', '绑定关系数据已导出')
}

onMounted(() => {
  // 设置默认日期为今天
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  addForm.value.firstServiceDate = `${year}-${month}-${day}`

  updateStats()
})
</script>
