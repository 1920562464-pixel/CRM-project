<template>
  <Modal :show="show" @update:show="$emit('update:show', $event)" :title="isEdit ? '编辑员工' : '添加员工'" size="xl">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- 基本信息 -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-slate-800 border-b pb-2">基本信息</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">姓名 *</label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">手机号 *</label>
            <input
              v-model="formData.phone"
              type="tel"
              required
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">邮箱</label>
            <input
              v-model="formData.email"
              type="email"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">身份证号</label>
            <input
              v-model="formData.idCard"
              type="text"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- 职位信息 -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-slate-800 border-b pb-2">职位信息</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">部门 *</label>
            <select
              v-model="formData.department"
              required
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">请选择部门</option>
              <option value="运动康复部">运动康复部</option>
              <option value="医疗服务部">医疗服务部</option>
              <option value="销售部">销售部</option>
              <option value="行政部">行政部</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">职位 *</label>
            <input
              v-model="formData.position"
              type="text"
              required
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">聘用类型 *</label>
            <select
              v-model="formData.employmentType"
              required
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="full_time">全职</option>
              <option value="part_time">兼职</option>
              <option value="contract">合同工</option>
              <option value="intern">实习生</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">角色 *</label>
            <select
              v-model="formData.role"
              required
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="coach">普通教练</option>
              <option value="mentor">师傅</option>
              <option value="apprentice">徒弟</option>
            </select>
          </div>
          <div v-if="formData.role === 'mentor'">
            <label class="block text-sm font-medium text-slate-700 mb-2">师徒组名</label>
            <input
              v-model="formData.groupName"
              type="text"
              maxlength="20"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="给您的师徒组起个名字"
            />
          </div>
          <div v-if="formData.role === 'apprentice'">
            <label class="block text-sm font-medium text-slate-700 mb-2">选择师傅 *</label>
            <select
              v-model="formData.mentorId"
              required
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">请选择师傅</option>
              <option v-for="mentor in availableMentors" :key="mentor.id" :value="mentor.id">
                {{ mentor.name }} - {{ mentor.groupName || '未命名战队' }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">在职状态 *</label>
            <select
              v-model="formData.status"
              required
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="probation">试用期</option>
              <option value="regular">正式员工</option>
              <option value="resigned">已离职</option>
              <option value="terminated">被解雇</option>
              <option value="on_leave">休假中</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 合同信息 -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-slate-800 border-b pb-2">合同信息</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">入职日期 *</label>
            <input
              v-model="formData.hireDate"
              type="date"
              required
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">合同开始日期</label>
            <input
              v-model="formData.contractStartDate"
              type="date"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">合同结束日期</label>
            <input
              v-model="formData.contractEndDate"
              type="date"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">试用期结束日期</label>
            <input
              v-model="formData.probationEndDate"
              type="date"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- 负载信息 -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-slate-800 border-b pb-2">负载信息</h3>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">当前负载 *</label>
            <input
              v-model.number="formData.currentLoad"
              type="number"
              min="0"
              required
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">最大负载 *</label>
            <input
              v-model.number="formData.maxLoad"
              type="number"
              min="1"
              required
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">绩效分数</label>
            <input
              v-model.number="formData.performanceScore"
              type="number"
              min="0"
              max="100"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- 薪资信息 -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-slate-800 border-b pb-2">薪资信息</h3>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">基本薪资</label>
            <input
              v-model.number="formData.baseSalary"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">提成比例</label>
            <input
              v-model.number="formData.commissionRate"
              type="number"
              min="0"
              max="1"
              step="0.01"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- 联系信息 -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-slate-800 border-b pb-2">联系信息</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">紧急联系人</label>
            <input
              v-model="formData.emergencyContact"
              type="text"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">紧急联系电话</label>
            <input
              v-model="formData.emergencyPhone"
              type="tel"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-2">地址</label>
            <input
              v-model="formData.address"
              type="text"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- 银行信息 -->
      <div class="space-y-4">
        <h3 class="text-lg font-semibold text-slate-800 border-b pb-2">银行信息</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">开户银行</label>
            <input
              v-model="formData.bankName"
              type="text"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">银行账号</label>
            <input
              v-model="formData.bankAccount"
              type="text"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- 备注 -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">备注</label>
        <textarea
          v-model="formData.notes"
          rows="3"
          class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        ></textarea>
      </div>
    </form>

    <template #footer>
      <button
        type="button"
        @click="closeModal"
        class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
      >
        取消
      </button>
      <button
        type="button"
        @click="handleSubmit"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        {{ isEdit ? '保存' : '添加' }}
      </button>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Modal from './shared/Modal.vue'
import { useHRManagement } from '../composables/useHRManagement'
import { useToast } from '../composables/useToast'
import type { HREmployee, CoachRole } from '../types'

const toast = useToast()

interface Props {
  show: boolean
  employee?: HREmployee
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  employee: undefined
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  'save': [employee: HREmployee]
}>()

const { addEmployee, updateEmployee, getAllMentors } = useHRManagement()

const isEdit = computed(() => {
  return props.employee !== undefined && props.employee !== null
})

// 可用的师傅列表
const availableMentors = computed(() => {
  return getAllMentors()
})

// 表单数据
const formData = ref({
  name: '',
  phone: '',
  email: '',
  idCard: '',
  department: '',
  position: '',
  employmentType: 'full_time' as const,
  role: 'coach' as CoachRole,
  groupName: '',
  mentorId: '',
  status: 'probation' as const,
  hireDate: '',
  contractStartDate: '',
  contractEndDate: '',
  probationEndDate: '',
  currentLoad: 0,
  maxLoad: 20,
  performanceScore: 80,
  baseSalary: 0,
  commissionRate: 0.1,
  emergencyContact: '',
  emergencyPhone: '',
  address: '',
  bankName: '',
  bankAccount: '',
  notes: ''
})

// 重置表单
const resetForm = () => {
  formData.value = {
    name: '',
    phone: '',
    email: '',
    idCard: '',
    department: '',
    position: '',
    employmentType: 'full_time',
    role: 'coach',
    groupName: '',
    mentorId: '',
    status: 'probation',
    hireDate: new Date().toISOString().split('T')[0],
    contractStartDate: '',
    contractEndDate: '',
    probationEndDate: '',
    currentLoad: 0,
    maxLoad: 20,
    performanceScore: 80,
    baseSalary: 0,
    commissionRate: 0.1,
    emergencyContact: '',
    emergencyPhone: '',
    address: '',
    bankName: '',
    bankAccount: '',
    notes: ''
  }
}

// 监听employee变化
watch(() => props.employee, (employee) => {
  try {
    if (employee && props.show) {
      formData.value = {
        name: employee.name || '',
        phone: employee.phone || '',
        email: employee.email || '',
        idCard: employee.idCard || '',
        department: employee.department || '',
        position: employee.position || '',
        employmentType: employee.employmentType || 'full_time',
        role: employee.role || 'coach',
        groupName: employee.groupName || '',
        mentorId: employee.mentorId || '',
        status: employee.status || 'probation',
        hireDate: employee.hireDate || '',
        contractStartDate: employee.contractStartDate || '',
        contractEndDate: employee.contractEndDate || '',
        probationEndDate: employee.probationEndDate || '',
        currentLoad: employee.currentLoad ?? 0,
        maxLoad: employee.maxLoad ?? 20,
        performanceScore: employee.performanceScore ?? 80,
        baseSalary: employee.baseSalary ?? 0,
        commissionRate: employee.commissionRate ?? 0.1,
        emergencyContact: employee.emergencyContact || '',
        emergencyPhone: employee.emergencyPhone || '',
        address: employee.address || '',
        bankName: employee.bankName || '',
        bankAccount: employee.bankAccount || '',
        notes: employee.notes || ''
      }
    } else if (!employee && props.show) {
      // Only reset form if modal is still open
      resetForm()
    }
  } catch (error) {
    console.error('Error in employee watcher:', error)
  }
}, { immediate: true })

// 关闭模态框
const closeModal = () => {
  emit('update:show', false)
  // 延迟重置表单，避免关闭动画时出现闪烁
  setTimeout(() => {
    resetForm()
  }, 100)
}

// 处理提交
const handleSubmit = () => {
  try {
    // 验证徒弟必须选择师傅
    if (formData.value.role === 'apprentice' && !formData.value.mentorId) {
      toast.error('验证失败', '徒弟必须选择师傅')
      return
    }

    if (isEdit.value && props.employee) {
      // 更新员工
      updateEmployee(props.employee.id, formData.value)
      emit('save', { ...props.employee, ...formData.value })
    } else {
      // 添加新员工
      const newEmployee = addEmployee(formData.value)
      if (newEmployee) {
        emit('save', newEmployee)
      }
    }
    closeModal()
  } catch (error) {
    console.error('保存员工失败:', error)
  }
}
</script>
