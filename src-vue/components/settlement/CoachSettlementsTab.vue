<template>
  <div class="space-y-3">
    <!-- 筛选和操作栏 -->
    <div class="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-3 flex-wrap">
          <!-- 月份选择 -->
          <div class="flex items-center gap-2">
            <Calendar :size="16" class="text-slate-400" />
            <select
              :model-value="selectedPeriod"
              @change="$emit('update:period', ($event.target as HTMLSelectElement).value)"
              class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white min-w-[120px]"
            >
              <option value="2026-02">2026年2月</option>
              <option value="2026-01">2026年1月</option>
              <option value="2025-12">2025年12月</option>
              <option value="2025-11">2025年11月</option>
              <option value="2025-10">2025年10月</option>
            </select>
          </div>

          <!-- 状态筛选 -->
          <select
            :model-value="statusFilter"
            @change="$emit('update:statusFilter', ($event.target as HTMLSelectElement).value)"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="">全部状态</option>
            <option value="pending">待审批</option>
            <option value="approved">已审批</option>
            <option value="paid">已发放</option>
            <option value="rejected">已驳回</option>
          </select>

          <!-- 搜索框 -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
            <input
              type="text"
              placeholder="搜索教练姓名..."
              :value="searchText"
              @input="$emit('update:searchText', ($event.target as HTMLInputElement).value)"
              class="w-56 pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- 批量操作按钮 -->
          <button
            v-if="selectedSettlements.length > 0"
            @click="batchApprove"
            class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
          >
            <CheckCircle :size="14" />
            批量审批 ({{ selectedSettlements.length }})
          </button>

          <!-- 导出按钮 -->
          <button
            @click="$emit('export')"
            class="px-3 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1 text-sm"
          >
            <Download :size="14" />
            导出
          </button>

          <!-- 新增结算记录按钮 -->
          <button
            @click="openAddModal"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <Plus :size="16" />
            新增结算
          </button>
        </div>
      </div>
    </div>

    <!-- 批量选择栏 -->
    <div
      v-if="selectedSettlements.length > 0"
      class="bg-indigo-50 border border-indigo-200 rounded px-3 py-1.5 flex items-center justify-between"
    >
      <span class="text-xs text-indigo-700">
        已选择 <strong>{{ selectedSettlements.length }}</strong> 条结算记录
      </span>
      <button @click="clearSelection" class="text-indigo-600 hover:text-indigo-800 text-xs">取消选择</button>
    </div>

    <!-- 统计卡片 - 紧凑布局 -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] opacity-90">本月结算金额</div>
            <div class="text-lg font-bold">¥{{ statistics.totalAmount.toLocaleString() }}</div>
          </div>
          <Users :size="20" class="opacity-80" />
        </div>
      </div>
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] opacity-90">待审批金额</div>
            <div class="text-lg font-bold">¥{{ statistics.pendingAmount.toLocaleString() }}</div>
          </div>
          <Clock :size="20" class="opacity-80" />
        </div>
      </div>
      <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-3 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] opacity-90">已发放金额</div>
            <div class="text-lg font-bold">¥{{ statistics.paidAmount.toLocaleString() }}</div>
          </div>
          <CheckCircle :size="20" class="opacity-80" />
        </div>
      </div>
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] opacity-90">服务教练数</div>
            <div class="text-lg font-bold">{{ statistics.activeCoaches }}</div>
          </div>
          <Target :size="20" class="opacity-80" />
        </div>
      </div>
      <div class="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg p-3 text-white">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-[10px] opacity-90">管理费合计</div>
            <div class="text-lg font-bold">¥{{ statistics.totalManagementFee.toLocaleString() }}</div>
          </div>
          <Briefcase :size="20" class="opacity-80" />
        </div>
      </div>
    </div>

    <!-- 结算列表 -->
    <div class="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <table class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-3 py-2 text-center w-10">
              <input
                type="checkbox"
                :checked="selectAll"
                @change="toggleSelectAll"
                class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase">教练信息</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-slate-600 uppercase">联系方式</th>
            <th class="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase">用户数</th>
            <th class="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase">新用户</th>
            <th class="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase">老用户</th>
            <th class="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase">绩效</th>
            <th class="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase">管理费</th>
            <th class="px-3 py-2 text-right text-xs font-semibold text-slate-600 uppercase">合计</th>
            <th class="px-3 py-2 text-center text-xs font-semibold text-slate-600 uppercase">状态</th>
            <th class="px-3 py-2 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr
            v-for="settlement in settlements"
            :key="settlement.id"
            :class="['hover:bg-slate-50', selectedSettlements.includes(settlement.id) ? 'bg-indigo-50' : '']"
          >
            <td class="px-3 py-2.5 text-center">
              <input
                type="checkbox"
                :checked="selectedSettlements.includes(settlement.id)"
                @change="toggleSelect(settlement.id)"
                class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </td>
            <td class="px-3 py-2.5">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User :size="16" class="text-indigo-600" />
                </div>
                <div>
                  <div class="text-sm font-medium text-slate-900">{{ settlement.employeeName }}</div>
                  <div class="text-[10px] text-slate-500">{{ settlement.position || '教练' }} · {{ settlement.department || '运动康复部' }}</div>
                </div>
              </div>
            </td>
            <td class="px-3 py-2.5 text-xs">
              <div class="text-slate-700">{{ settlement.phone || '-' }}</div>
              <div class="text-[10px] text-slate-500">{{ settlement.email || '-' }}</div>
            </td>
            <td class="px-3 py-2.5 text-right text-sm">
              <div class="text-slate-900">{{ settlement.totalUsers }}</div>
              <div class="text-[10px] text-slate-500">总服务</div>
            </td>
            <td class="px-3 py-2.5 text-right text-sm">
              <div class="text-green-600 font-medium">{{ settlement.newUserAmount }}</div>
              <div class="text-[10px] text-slate-500">({{ settlement.newUsers }}人)</div>
            </td>
            <td class="px-3 py-2.5 text-right text-sm">
              <div class="text-blue-600 font-medium">{{ settlement.oldUserAmount }}</div>
              <div class="text-[10px] text-slate-500">({{ settlement.oldUsers }}人)</div>
            </td>
            <td class="px-3 py-2.5 text-right text-sm text-slate-600">{{ settlement.performanceBonus }}</td>
            <td class="px-3 py-2.5 text-right text-sm">
              <div class="font-semibold" :class="settlement.managementFee > 0 ? 'text-purple-600' : 'text-slate-400'">{{ settlement.managementFee }}</div>
              <div class="text-[10px] text-slate-500">管理费</div>
            </td>
            <td class="px-3 py-2.5 text-right font-bold text-indigo-600 text-sm">
              ¥{{ settlement.totalAmount.toLocaleString() }}
            </td>
            <td class="px-3 py-2.5 text-center">
              <span :class="`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                settlement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                settlement.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                settlement.status === 'paid' ? 'bg-green-100 text-green-800' :
                settlement.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-slate-100 text-slate-800'
              }`">
                {{ settlement.status === 'pending' ? '待审批' :
                   settlement.status === 'approved' ? '已审批' :
                   settlement.status === 'paid' ? '已发放' :
                   settlement.status === 'rejected' ? '已驳回' : '未知' }}
              </span>
            </td>
            <td class="px-3 py-2.5">
              <div class="flex items-center justify-center gap-1">
                <button
                  @click.stop="editSettlement(settlement)"
                  class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="编辑"
                  type="button"
                >
                  <Edit3 :size="14" />
                </button>
                <button
                  @click.stop="$emit('view', settlement)"
                  @click.middle="$emit('view', settlement)"
                  class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                  title="查看详情"
                  type="button"
                >
                  <Eye :size="14" />
                </button>
                <button
                  v-if="settlement.status === 'pending'"
                  @click="$emit('approve', settlement.id)"
                  class="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="审批通过"
                >
                  <CheckCircle :size="14" />
                </button>
                <button
                  v-if="settlement.status === 'pending'"
                  @click="$emit('reject', settlement.id)"
                  class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="驳回"
                >
                  <XCircle :size="14" />
                </button>
                <button
                  v-if="settlement.status === 'approved'"
                  @click="$emit('pay', settlement.id)"
                  class="px-2.5 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1 text-xs font-medium transition-colors"
                >
                  <CreditCard :size="12" />
                  发放
                </button>
                <button
                  @click="confirmDelete(settlement)"
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
      <div v-if="settlements.length === 0" class="p-8 text-center text-slate-400">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-2">
          <FileText :size="24" />
        </div>
        <p class="text-sm font-medium">暂无结算记录</p>
        <p class="text-xs mt-1">点击"新增结算"按钮添加结算记录</p>
      </div>
    </div>

    <!-- 新增/编辑结算弹窗 -->
    <Modal v-model:show="showModal" :title="isEdit ? '编辑结算记录' : '新增结算记录'" size="lg">
      <form @submit.prevent="handleSave" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">选择教练 *</label>
            <select v-model="formData.employeeId" required :disabled="isEdit" class="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="">请选择教练</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">结算月份 *</label>
            <input v-model="formData.period" type="month" required :disabled="isEdit" class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">新用户数（3个月内）</label>
            <input v-model.number="formData.newUsers" type="number" min="0" required class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            <p class="text-xs text-slate-500 mt-1">¥400/人</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">老用户数（3个月后）</label>
            <input v-model.number="formData.oldUsers" type="number" min="0" required class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            <p class="text-xs text-slate-500 mt-1">¥100/人</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">绩效奖金</label>
          <input v-model.number="formData.performanceBonus" type="number" min="0" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">管理费</label>
          <input v-model.number="formData.managementFee" type="number" min="0" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          <p class="text-xs text-slate-500 mt-1">默认为0，可手动调整</p>
        </div>

        <!-- 计算结果预览 -->
        <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <div class="text-sm font-semibold text-indigo-900 mb-2">金额预览</div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="flex justify-between">
              <span class="text-slate-600">新用户金额：</span>
              <span class="font-semibold">¥{{ calculatedAmounts.newUserAmount.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">老用户金额：</span>
              <span class="font-semibold">¥{{ calculatedAmounts.oldUserAmount.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">绩效奖金：</span>
              <span class="font-semibold">¥{{ calculatedAmounts.performanceBonus.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">管理费：</span>
              <span class="font-semibold">¥{{ calculatedAmounts.managementFee.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between border-t border-indigo-200 pt-1 col-span-2">
              <span class="text-indigo-900 font-semibold">合计：</span>
              <span class="font-bold text-indigo-600">¥{{ calculatedAmounts.totalAmount.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">备注</label>
          <textarea v-model="formData.remark" rows="2" placeholder="填写备注信息..." class="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"></textarea>
        </div>
      </form>
      <template #footer>
        <button type="button" @click="closeModal" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">取消</button>
        <button type="button" @click="handleSave" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{{ isEdit ? '保存' : '添加' }}</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Plus, Eye, CheckCircle, XCircle, CreditCard, FileText, Users, Clock, Target, Calendar, Download, User, Edit3, Trash2, Briefcase } from 'lucide-vue-next'
import Modal from '../shared/Modal.vue'

interface SettlementRecord {
  id: string
  employeeId: string
  employeeName: string
  position?: string
  department?: string
  phone?: string
  email?: string
  period: string
  totalUsers: number
  newUsers: number
  oldUsers: number
  newUserAmount: number
  oldUserAmount: number
  performanceBonus: number
  managementFee: number
  totalAmount: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  createdAt: string
  approvedAt?: string
  paidAt?: string
  remark?: string
}

interface SettlementStatistics {
  totalAmount: number
  pendingAmount: number
  paidAmount: number
  activeCoaches: number
  totalManagementFee: number
}

const props = defineProps<{
  settlements: SettlementRecord[]
  selectedPeriod: string
  employees: any[]
}>()

const emit = defineEmits<{
  'add': [data: Omit<SettlementRecord, 'id' | 'createdAt'>]
  'update': [id: string, data: Partial<SettlementRecord>]
  'delete': [id: string]
  'approve': [id: string]
  'reject': [id: string]
  'pay': [id: string]
  'view': [settlement: SettlementRecord]
  'update:period': [period: string]
  'update:statusFilter': [filter: string]
  'update:searchText': [text: string]
  'export': []
  'batchApprove': [ids: string[]]
}>()

const selectedSettlements = ref<string[]>([])
const statusFilter = ref('')
const searchText = ref('')

// Modal state
const showModal = ref(false)
const isEdit = ref(false)
const editingId = ref<string | null>(null)

const formData = ref({
  employeeId: '',
  period: new Date().toISOString().slice(0, 7),
  newUsers: 0,
  oldUsers: 0,
  performanceBonus: 0,
  managementFee: 0,
  remark: ''
})

const calculatedAmounts = computed(() => {
  const newUserAmount = formData.value.newUsers * 400
  const oldUserAmount = formData.value.oldUsers * 100
  const performanceBonus = formData.value.performanceBonus || 0
  const managementFee = formData.value.managementFee || 0
  return {
    newUserAmount,
    oldUserAmount,
    performanceBonus,
    managementFee,
    totalAmount: newUserAmount + oldUserAmount + performanceBonus + managementFee
  }
})

const selectAll = computed(() => {
  return props.settlements.length > 0 && selectedSettlements.value.length === props.settlements.length
})

const toggleSelect = (id: string) => {
  if (selectedSettlements.value.includes(id)) {
    selectedSettlements.value = selectedSettlements.value.filter(sid => sid !== id)
  } else {
    selectedSettlements.value.push(id)
  }
}

const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedSettlements.value = []
  } else {
    selectedSettlements.value = props.settlements.map(s => s.id)
  }
}

const clearSelection = () => {
  selectedSettlements.value = []
}

const statistics = computed((): SettlementStatistics => {
  const totalAmount = props.settlements.reduce((sum, s) => sum + s.totalAmount, 0)
  const pendingAmount = props.settlements.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.totalAmount, 0)
  const paidAmount = props.settlements.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.totalAmount, 0)
  const activeCoaches = new Set(props.settlements.map(s => s.employeeId)).size
  const totalManagementFee = props.settlements.reduce((sum, s) => sum + (s.managementFee || 0), 0)

  return { totalAmount, pendingAmount, paidAmount, activeCoaches, totalManagementFee }
})

const batchApprove = () => {
  emit('batchApprove', selectedSettlements.value)
}

const openAddModal = () => {
  isEdit.value = false
  editingId.value = null
  formData.value = {
    employeeId: '',
    period: new Date().toISOString().slice(0, 7),
    newUsers: 0,
    oldUsers: 0,
    performanceBonus: 0,
    managementFee: 0,
    remark: ''
  }
  showModal.value = true
}

const editSettlement = (settlement: SettlementRecord) => {
  isEdit.value = true
  editingId.value = settlement.id
  formData.value = {
    employeeId: settlement.employeeId,
    period: settlement.period,
    newUsers: settlement.newUsers,
    oldUsers: settlement.oldUsers,
    performanceBonus: settlement.performanceBonus,
    managementFee: settlement.managementFee || 0,
    remark: settlement.remark || ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  isEdit.value = false
  editingId.value = null
}

const handleSave = () => {
  const employee = props.employees.find(e => e.id === formData.value.employeeId)
  if (!employee) return

  const settlementData = {
    employeeId: formData.value.employeeId,
    employeeName: employee.name,
    position: employee.position || '教练',
    department: employee.department || '运动康复部',
    phone: employee.phone,
    email: employee.email,
    period: formData.value.period,
    newUsers: formData.value.newUsers,
    oldUsers: formData.value.oldUsers,
    newUserAmount: formData.value.newUsers * 400,
    oldUserAmount: formData.value.oldUsers * 100,
    performanceBonus: formData.value.performanceBonus || 0,
    managementFee: formData.value.managementFee || 0,
    totalAmount: calculatedAmounts.value.totalAmount,
    totalUsers: formData.value.newUsers + formData.value.oldUsers,
    status: 'pending' as const,
    remark: formData.value.remark
  }

  if (isEdit.value && editingId.value) {
    emit('update', editingId.value, settlementData)
  } else {
    emit('add', settlementData)
  }

  closeModal()
}

const confirmDelete = (settlement: SettlementRecord) => {
  if (confirm(`确定要删除 ${settlement.employeeName} 的结算记录吗？`)) {
    emit('delete', settlement.id)
  }
}
</script>
