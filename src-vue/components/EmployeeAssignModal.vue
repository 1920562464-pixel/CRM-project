<template>
  <Modal
    :show="show"
    @update:show="$emit('update:show', $event)"
    :title="title"
    size="lg"
  >
    <div class="space-y-4">
      <!-- 搜索和筛选 -->
      <div class="flex items-center gap-3">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索员工姓名..."
            class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>
        <select
          v-model="filterType"
          class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
        >
          <option value="">全部专长</option>
          <option v-for="type in availableTypes" :key="type" :value="type">{{ type }}</option>
        </select>
        <select
          v-model="filterLoad"
          class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
        >
          <option value="">全部负载</option>
          <option value="available">可分配</option>
          <option value="near">接近满载</option>
          <option value="full">已满载</option>
        </select>
      </div>

      <!-- 员工列表 -->
      <div class="max-h-80 overflow-y-auto border border-slate-200 rounded-lg">
        <div
          v-for="employee in filteredEmployees"
          :key="employee.id"
          @click="selectEmployee(employee)"
          :class="[
            'p-4 border-b border-slate-100 cursor-pointer transition-colors hover:bg-indigo-50',
            selectedEmployee?.id === employee.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
          ]"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div :class="`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${employee.color || 'bg-slate-100 text-slate-600'}`">
                {{ employee.name.charAt(0) }}
              </div>
              <div>
                <div class="font-medium text-slate-900">{{ employee.name }}</div>
                <div class="text-xs text-slate-500">
                  {{ employee.position === 'coach' ? '教练' : '医生' }}
                  <span v-if="employee.type">· {{ employee.type }}</span>
                  <span v-if="employee.department">· {{ employee.department }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <!-- 负载指示器 -->
              <div class="text-right">
                <div :class="[
                  'text-sm font-medium',
                  employee.load >= employee.maxLoad ? 'text-red-600' :
                  employee.load >= employee.maxLoad * 0.8 ? 'text-amber-600' :
                  'text-green-600'
                ]">
                  {{ employee.load }}/{{ employee.maxLoad }}
                </div>
                <div class="text-xs text-slate-500">负载</div>
              </div>

              <!-- 负载进度条 -->
              <div class="w-20">
                <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    :class="[
                      'h-full rounded-full transition-all',
                      employee.load >= employee.maxLoad ? 'bg-red-500' :
                      employee.load >= employee.maxLoad * 0.8 ? 'bg-amber-500' :
                      'bg-green-500'
                    ]"
                    :style="{ width: `${(employee.load / employee.maxLoad) * 100}%` }"
                  ></div>
                </div>
              </div>

              <!-- 状态标识 -->
              <div v-if="employee.load >= employee.maxLoad" class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                满载
              </div>
              <div v-else-if="employee.load >= employee.maxLoad * 0.8" class="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded">
                紧张
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredEmployees.length === 0" class="p-8 text-center text-slate-400">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-2">
            <Search :size="24" />
          </div>
          <p class="text-sm font-medium">未找到符合条件的员工</p>
          <p class="text-xs mt-1">请尝试其他搜索条件</p>
        </div>
      </div>

      <!-- 服务类型选择（仅教练） -->
      <div v-if="position === 'coach' && !isChangeMode" class="space-y-2">
        <label class="block text-sm font-medium text-slate-700">服务类型</label>
        <div class="flex items-center gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="serviceType"
              type="radio"
              value="basic"
              class="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
            />
            <span class="text-sm text-slate-700">基础服务</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              v-model="serviceType"
              type="radio"
              value="deep"
              class="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
            />
            <span class="text-sm text-slate-700">深度服务</span>
          </label>
        </div>
      </div>

      <!-- 首次服务日期 -->
      <div v-if="!isChangeMode" class="space-y-2">
        <label class="block text-sm font-medium text-slate-700">首次服务日期</label>
        <input
          v-model="firstServiceDate"
          type="date"
          class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
        <p class="text-xs text-slate-500">
          系统将根据此日期判断是否为新用户（3个月内为新用户）
        </p>
      </div>

      <!-- 提示信息 -->
      <div v-if="selectedEmployee && selectedEmployee.load >= selectedEmployee.maxLoad" class="bg-red-50 border border-red-200 rounded-lg p-3">
        <div class="flex items-start gap-2">
          <AlertCircle class="text-red-600 flex-shrink-0 mt-0.5" :size="16" />
          <div class="text-sm text-red-700">
            该员工负载已满，暂时无法分配新用户。请选择其他员工或调整负载。
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        @click="closeModal"
        class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm"
      >
        取消
      </button>
      <button
        type="button"
        @click="confirmSelection"
        :disabled="!selectedEmployee || (selectedEmployee.load >= selectedEmployee.maxLoad)"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-sm font-medium"
      >
        {{ isChangeMode ? '确认更换' : '确认分配' }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Modal from './shared/Modal.vue'
import { Search, AlertCircle } from 'lucide-vue-next'
import { useEmployeeData, type Employee } from '../composables/useEmployeeData'

interface Props {
  show: boolean
  position: 'coach' | 'doctor'
  clientId?: string
  clientName?: string
  currentEmployeeId?: string // 更换模式时的当前员工ID
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  position: 'coach',
  clientId: '',
  clientName: '',
  currentEmployeeId: ''
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  'confirm': [employeeId: string, data: {
    serviceType?: 'basic' | 'deep'
    firstServiceDate?: string
  }]
}>()

const { getEmployeesByPosition } = useEmployeeData()

// 搜索和筛选
const searchQuery = ref('')
const filterType = ref('')
const filterLoad = ref('')

// 选中的员工
const selectedEmployee = ref<Employee | null>(null)

// 表单数据
const serviceType = ref<'basic' | 'deep'>('basic')
const firstServiceDate = ref(new Date().toISOString().split('T')[0])

// 是否为更换模式
const isChangeMode = computed(() => !!props.currentEmployeeId)

// 标题
const title = computed(() => {
  if (isChangeMode.value) {
    return props.position === 'coach' ? '更换教练' : '更换医生'
  }
  return props.position === 'coach' ? '分配教练' : '分配医生'
})

// 获取员工列表
const employees = computed(() => {
  return getEmployeesByPosition(props.position)
})

// 获取可用的专长类型
const availableTypes = computed(() => {
  const types = new Set<string>()
  employees.value.forEach(emp => {
    if (emp.type) {
      types.add(emp.type)
    }
  })
  return Array.from(types)
})

// 筛选后的员工列表
const filteredEmployees = computed(() => {
  let filtered = employees.value

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(emp =>
      emp.name.toLowerCase().includes(query) ||
      (emp.type && emp.type.toLowerCase().includes(query))
    )
  }

  // 专长类型过滤
  if (filterType.value) {
    filtered = filtered.filter(emp => emp.type === filterType.value)
  }

  // 负载状态过滤
  if (filterLoad.value === 'available') {
    filtered = filtered.filter(emp => emp.load < emp.maxLoad * 0.8)
  } else if (filterLoad.value === 'near') {
    filtered = filtered.filter(emp => emp.load >= emp.maxLoad * 0.8 && emp.load < emp.maxLoad)
  } else if (filterLoad.value === 'full') {
    filtered = filtered.filter(emp => emp.load >= emp.maxLoad)
  }

  // 排除当前员工（更换模式）
  if (isChangeMode.value && props.currentEmployeeId) {
    filtered = filtered.filter(emp => emp.id !== props.currentEmployeeId)
  }

  return filtered
})

// 选择员工
const selectEmployee = (employee: Employee) => {
  if (employee.load >= employee.maxLoad) {
    // 满载时可以选择但会禁用确认按钮
  }
  selectedEmployee.value = employee
}

// 确认选择
const confirmSelection = () => {
  if (!selectedEmployee.value) return

  emit('confirm', selectedEmployee.value.id, {
    serviceType: props.position === 'coach' ? serviceType.value : undefined,
    firstServiceDate: props.position === 'coach' ? firstServiceDate.value : undefined
  })

  closeModal()
}

// 关闭模态框
const closeModal = () => {
  emit('update:show', false)
  // 重置表单
  searchQuery.value = ''
  filterType.value = ''
  filterLoad.value = ''
  selectedEmployee.value = null
  serviceType.value = 'basic'
  firstServiceDate.value = new Date().toISOString().split('T')[0]
}

// 监听显示状态变化
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 打开时重置表单
    searchQuery.value = ''
    filterType.value = ''
    filterLoad.value = ''
    selectedEmployee.value = null
    serviceType.value = 'basic'
    firstServiceDate.value = new Date().toISOString().split('T')[0]
  }
})
</script>
