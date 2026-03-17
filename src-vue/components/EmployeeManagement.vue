<template>
  <div class="space-y-6">
    <!-- 标签切换 -->
    <div class="border-b border-slate-200">
      <nav class="flex gap-4 -mb-px">
        <button
          @click="activeTab = 'employees'"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'employees'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          ]"
        >
          员工列表
        </button>
        <button
          @click="activeTab = 'groups'"
          :class="[
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            activeTab === 'groups'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          ]"
        >
          师徒分组
        </button>
      </nav>
    </div>

    <!-- 员工列表标签页 -->
    <div v-if="activeTab === 'employees'" class="space-y-6">
      <!-- 统计卡片 -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">总员工数</div>
            <div class="text-2xl font-bold">{{ statistics.totalEmployees }}</div>
          </div>
          <Users :size="24" class="opacity-80" />
        </div>
      </div>

      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">在职员工</div>
            <div class="text-2xl font-bold">{{ statistics.activeEmployees }}</div>
          </div>
          <UserCheck :size="24" class="opacity-80" />
        </div>
      </div>

      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">试用期</div>
            <div class="text-2xl font-bold">{{ statistics.probationEmployees }}</div>
          </div>
          <Clock :size="24" class="opacity-80" />
        </div>
      </div>

      <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-4 text-white shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">师傅</div>
            <div class="text-2xl font-bold">{{ statistics.mentorCount }}</div>
          </div>
          <Briefcase :size="24" class="opacity-80" />
        </div>
      </div>

      <div class="bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg p-4 text-white shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">徒弟</div>
            <div class="text-2xl font-bold">{{ statistics.apprenticeCount }}</div>
          </div>
          <Users :size="24" class="opacity-80" />
        </div>
      </div>

      <div class="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg p-4 text-white shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm opacity-90">普通教练</div>
            <div class="text-2xl font-bold">{{ statistics.coachCount }}</div>
          </div>
          <HeartHandshake :size="24" class="opacity-80" />
        </div>
      </div>
    </div>

    <!-- 筛选和操作栏 -->
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-3 flex-wrap">
          <!-- 搜索框 -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索姓名、手机号..."
              class="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 text-sm"
            />
          </div>

          <!-- 聘用类型筛选 -->
          <select
            v-model="employmentTypeFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="">全部聘用类型</option>
            <option value="full_time">全职</option>
            <option value="part_time">兼职</option>
            <option value="contract">合同工</option>
            <option value="intern">实习生</option>
          </select>

          <!-- 角色筛选 -->
          <select
            v-model="roleFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="">全部角色</option>
            <option value="mentor">师傅</option>
            <option value="apprentice">徒弟</option>
            <option value="coach">普通教练</option>
          </select>

          <!-- 状态筛选 -->
          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="">全部状态</option>
            <option value="probation">试用期</option>
            <option value="regular">正式员工</option>
            <option value="resigned">已离职</option>
            <option value="on_leave">休假中</option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <!-- 导出按钮 -->
          <button
            @click="handleExport"
            class="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm"
          >
            <Download :size="16" />
            导出
          </button>

          <!-- 添加员工按钮 -->
          <button
            @click="openAddModal"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium"
          >
            <Plus :size="16" />
            添加员工
          </button>
        </div>
      </div>
    </div>

    <!-- 员工列表 -->
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">姓名/电话</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">员工类型</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">负载情况</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">师徒角色</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr
            v-for="employee in filteredEmployees"
            :key="employee.id"
            v-show="employee.id"
            class="hover:bg-slate-50 transition-colors"
          >
            <!-- 姓名/电话 -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center font-bold text-indigo-600 text-sm">
                  {{ employee.name.charAt(0) }}
                </div>
                <div>
                  <div class="font-medium text-slate-900">{{ employee.name }}</div>
                  <div class="text-xs text-slate-500">{{ employee.phone }}</div>
                </div>
              </div>
            </td>

            <!-- 员工类型 -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    'text-xs px-2 py-0.5 rounded',
                    employee.employmentType === 'full_time' ? 'bg-blue-100 text-blue-700' :
                    employee.employmentType === 'part_time' ? 'bg-green-100 text-green-700' :
                    employee.employmentType === 'contract' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  ]"
                >
                  {{ employee.employmentType === 'full_time' ? '全职' :
                     employee.employmentType === 'part_time' ? '兼职' :
                     employee.employmentType === 'contract' ? '合同工' : '实习生' }}
                </span>
                <span
                  :class="[
                    'text-xs px-2 py-0.5 rounded',
                    employee.status === 'regular' ? 'bg-green-100 text-green-700' :
                    employee.status === 'probation' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  ]"
                >
                  {{ employee.status === 'probation' ? '试用期' : '正式员工' }}
                </span>
              </div>
            </td>

            <!-- 负载情况 -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-2">
                <div class="flex-1 max-w-[100px]">
                  <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      :class="[
                        'h-full rounded-full transition-all',
                        ((employee.currentLoad ?? 0) / (employee.maxLoad ?? 1)) >= 1 ? 'bg-red-500' :
                        ((employee.currentLoad ?? 0) / (employee.maxLoad ?? 1)) >= 0.8 ? 'bg-amber-500' : 'bg-green-500'
                      ]"
                      :style="{ width: `${Math.min(100, ((employee.currentLoad ?? 0) / (employee.maxLoad ?? 1)) * 100)}%` }"
                    ></div>
                  </div>
                </div>
                <div class="text-xs text-slate-600">
                  {{ employee.currentLoad ?? 0 }}/{{ employee.maxLoad ?? 0 }}
                </div>
              </div>
            </td>

            <!-- 师徒角色 -->
            <td class="px-4 py-3">
              <div v-if="employee.role === 'mentor'" class="flex items-center gap-2">
                <span class="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">师傅</span>
                <span v-if="employee.apprentices && employee.apprentices.length > 0" class="text-xs text-slate-600">
                  带{{ employee.apprentices.length }}个徒弟
                </span>
              </div>
              <div v-else-if="employee.role === 'apprentice'" class="flex items-center gap-2">
                <span class="text-xs px-2 py-0.5 rounded bg-pink-100 text-pink-700">徒弟</span>
              </div>
              <div v-else>
                <span class="text-xs text-slate-400">暂无</span>
              </div>
            </td>

            <!-- 操作 -->
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-1">
                <button
                  @click="viewEmployee(employee)"
                  class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="查看详情"
                >
                  <Eye :size="14" />
                </button>
                <button
                  @click="editEmployee(employee)"
                  class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="编辑"
                >
                  <Edit3 :size="14" />
                </button>
                <button
                  v-if="employee.status !== 'resigned' && employee.status !== 'terminated'"
                  @click="confirmResignation(employee)"
                  class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  title="离职处理"
                >
                  <UserMinus :size="14" />
                </button>
                <button
                  @click="confirmDelete(employee)"
                  class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="删除"
                >
                  <Trash2 :size="14" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 空状态 -->
      <div v-if="filteredEmployees.length === 0" class="p-8 text-center text-slate-400">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-3">
          <Users :size="32" />
        </div>
        <p class="text-lg font-medium">暂无员工数据</p>
        <p class="text-sm mt-1">点击"添加员工"按钮添加第一个员工</p>
      </div>
    </div>
  </div>

  <!-- 师徒分组标签页 -->
  <div v-else-if="activeTab === 'groups'">
    <MentorshipGroups />
  </div>

  <!-- 员工详情模态框 -->
    <EmployeeProfileModal
      v-model:show="showProfileModal"
      :employee="selectedEmployee"
      @save="handleEmployeeSave"
    />

    <!-- 离职处理模态框 -->
    <Modal v-model:show="showResignationModal" title="离职处理" size="lg">
      <div v-if="resignationEmployee" class="space-y-4">
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <AlertTriangle class="text-amber-600 flex-shrink-0 mt-0.5" :size="20" />
            <div>
              <h4 class="font-semibold text-amber-900">确认离职</h4>
              <p class="text-sm text-amber-700 mt-1">
                确定要为 {{ resignationEmployee.name }} 办理离职手续吗？
              </p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">离职日期 *</label>
            <input
              v-model="resignationForm.resignationDate"
              type="date"
              required
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">最后工作日 *</label>
            <input
              v-model="resignationForm.lastWorkDate"
              type="date"
              required
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">离职原因类型 *</label>
          <select
            v-model="resignationForm.reasonType"
            required
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="voluntary">自愿离职</option>
            <option value="involuntary">非自愿离职</option>
            <option value="retirement">退休</option>
            <option value="other">其他</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">离职原因 *</label>
          <textarea
            v-model="resignationForm.reason"
            required
            rows="3"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          ></textarea>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          @click="showResignationModal = false"
          class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
        >
          取消
        </button>
        <button
          type="button"
          @click="handleResignation"
          class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          确认离职
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Users, UserCheck, Clock, Briefcase, HeartHandshake,
  Search, Plus, Download, Eye, Edit3, Trash2, UserMinus, AlertTriangle
} from 'lucide-vue-next'
import { useHRManagement } from '../composables/useHRManagement'
import { useToast } from '../composables/useToast'
import EmployeeProfileModal from './EmployeeProfileModal.vue'
import MentorshipGroups from './MentorshipGroups.vue'
import Modal from './shared/Modal.vue'
import type { HREmployee, EmployeeStatus, EmploymentType, CoachRole } from '../types'

const toast = useToast()
const activeTab = ref<'employees' | 'groups'>('employees')
const {
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
  createOffboardingRecord,
  getHRStatistics,
  exportEmployees
} = useHRManagement()

// 筛选条件
const searchQuery = ref('')
const employmentTypeFilter = ref<EmploymentType | ''>('')
const roleFilter = ref<CoachRole | ''>('')
const statusFilter = ref<EmployeeStatus | ''>('')

// 模态框状态
const showProfileModal = ref(false)
const showResignationModal = ref(false)
const selectedEmployee = ref<HREmployee | undefined>()
const resignationEmployee = ref<HREmployee | undefined>()

// 离职表单
const resignationForm = ref({
  resignationDate: new Date().toISOString().split('T')[0],
  lastWorkDate: new Date().toISOString().split('T')[0],
  reasonType: 'voluntary' as const,
  reason: ''
})

// 统计数据（初始化为默认值，避免undefined错误）
const statistics = ref<ReturnType<typeof getHRStatistics>>({
  totalEmployees: 0,
  activeEmployees: 0,
  probationEmployees: 0,
  resignedEmployees: 0,
  fullTimeCount: 0,
  partTimeCount: 0,
  contractCount: 0,
  internCount: 0,
  mentorCount: 0,
  apprenticeCount: 0,
  coachCount: 0,
  activeCoachingRelationships: 0,
  mentorshipGroups: 0,
  newHiresThisMonth: 0,
  resignationsThisMonth: 0,
  pendingRegularizations: 0,
  averageLoadRate: 0
})

// 过滤后的员工列表
const filteredEmployees = computed(() => {
  let employees = getAllEmployees() || []

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    employees = employees.filter(emp =>
      emp.name?.toLowerCase().includes(query) ||
      emp.phone?.includes(query)
    )
  }

  // 聘用类型过滤
  if (employmentTypeFilter.value) {
    employees = employees.filter(emp => emp.employmentType === employmentTypeFilter.value)
  }

  // 角色过滤
  if (roleFilter.value) {
    employees = employees.filter(emp => emp.role === roleFilter.value)
  }

  // 状态过滤
  if (statusFilter.value) {
    employees = employees.filter(emp => emp.status === statusFilter.value)
  }

  return employees || []
})

// 打开添加模态框
const openAddModal = () => {
  selectedEmployee.value = undefined
  showProfileModal.value = true
}

// 查看员工
const viewEmployee = (employee: HREmployee) => {
  selectedEmployee.value = employee
  showProfileModal.value = true
}

// 编辑员工
const editEmployee = (employee: HREmployee) => {
  selectedEmployee.value = employee
  showProfileModal.value = true
}

// 处理员工保存
const handleEmployeeSave = (employee: HREmployee) => {
  toast.success('保存成功', `员工 ${employee.name} 的信息已保存`)
  statistics.value = getHRStatistics()
}

// 确认删除
const confirmDelete = (employee: HREmployee) => {
  if (confirm(`确定要删除员工 ${employee.name} 吗？此操作不可恢复。`)) {
    deleteEmployee(employee.id)
    toast.success('删除成功', `员工 ${employee.name} 已删除`)
    statistics.value = getHRStatistics()
  }
}

// 确认离职
const confirmResignation = (employee: HREmployee) => {
  resignationEmployee.value = employee
  resignationForm.value = {
    resignationDate: new Date().toISOString().split('T')[0],
    lastWorkDate: new Date().toISOString().split('T')[0],
    reasonType: 'voluntary',
    reason: ''
  }
  showResignationModal.value = true
}

// 处理离职
const handleResignation = () => {
  if (!resignationEmployee.value) return

  try {
    createOffboardingRecord(
      resignationEmployee.value.id,
      resignationForm.value.resignationDate,
      resignationForm.value.lastWorkDate,
      resignationForm.value.reason,
      resignationForm.value.reasonType
    )

    toast.success('离职流程已启动', `员工 ${resignationEmployee.value.name} 的离职手续已创建`)
    showResignationModal.value = false
    statistics.value = getHRStatistics()
  } catch (error) {
    toast.error('操作失败', '创建离职记录失败')
  }
}

// 导出员工数据
const handleExport = () => {
  const data = exportEmployees()
  const csv = [
    Object.keys(data[0]).join(','),
    ...data.map(row => Object.values(row).join(','))
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)

  toast.success('导出成功', '员工数据已导出')
}

onMounted(() => {
  statistics.value = getHRStatistics()
})
</script>
