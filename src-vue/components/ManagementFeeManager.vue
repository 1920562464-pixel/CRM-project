<template>
  <div class="space-y-6">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- 页面标题和操作栏 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase :size="28" class="text-purple-600" />
          管理费结算
        </h1>
        <p class="text-sm text-slate-500 mt-2">管理人员费用结算与确认</p>
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

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">管理费总额</span>
          <DollarSign :size="20" />
        </div>
        <div class="text-3xl font-bold">¥{{ totalAmount.toLocaleString() }}</div>
        <div class="text-xs opacity-75">{{ itemCount }} 笔</div>
      </div>

      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">已确认</span>
          <CheckCircle :size="20" />
        </div>
        <div class="text-3xl font-bold">{{ confirmedCount }}</div>
        <div class="text-xs opacity-75">笔</div>
      </div>

      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">平均金额</span>
          <TrendingUp :size="20" />
        </div>
        <div class="text-3xl font-bold">¥{{ averageAmount.toLocaleString() }}</div>
        <div class="text-xs opacity-75">元/笔</div>
      </div>
    </div>

    <!-- 管理费列表 -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 class="text-lg font-semibold">管理费明细</h3>
        <button
          @click="showAddDialog = true"
          class="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"
        >
          <Plus :size="14" />
          添加管理费
        </button>
      </div>

      <div v-if="items.length === 0" class="p-12 text-center text-slate-400">
        <Briefcase :size="48" class="mx-auto mb-4 opacity-50" />
        <p class="font-medium">暂无管理费记录</p>
        <p class="text-sm mt-1">请点击"添加管理费"按钮开始添加</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">员工</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">费用类型</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">金额</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">状态</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="item in items" :key="item.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ item.employeeName }}</td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ item.feeType }}</td>
              <td class="px-4 py-3 text-sm font-semibold text-purple-600">¥{{ item.amount.toLocaleString() }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-2 py-1 text-xs rounded"
                  :class="item.confirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                >
                  {{ item.confirmed ? '已确认' : '待确认' }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button @click="editItem(item)" class="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200">编辑</button>
                  <button @click="toggleItemConfirm(item)" class="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded border border-green-200">
                    {{ item.confirmed ? '取消' : '确认' }}
                  </button>
                  <button @click="deleteItem(item.id)" class="text-xs text-red-600 hover:bg-red-50 px-1 py-1 rounded">
                    <Trash2 :size="12" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 添加/编辑弹窗 -->
    <Modal v-model:show="showAddDialog" :title="editingItem ? '编辑管理费' : '添加管理费'" size="lg">
      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">员工 *</label>
          <select v-model="formData.employeeId" required class="w-full px-3 py-2 border border-slate-300 rounded-lg">
            <option value="">请选择员工</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">费用类型 *</label>
          <select v-model="formData.feeType" required class="w-full px-3 py-2 border border-slate-300 rounded-lg">
            <option value="团队管理">团队管理费</option>
            <option value="项目管理">项目管理费</option>
            <option value="培训管理">培训管理费</option>
            <option value="其他">其他管理费</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">金额 *</label>
          <input v-model.number="formData.amount" type="number" step="0.01" required placeholder="请输入金额" class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">备注</label>
          <textarea v-model="formData.note" placeholder="输入备注信息" rows="3" class="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"></textarea>
        </div>
      </form>
      <template #footer>
        <button @click="closeDialog" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">取消</button>
        <button @click="handleSave" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">{{ editingItem ? '保存' : '添加' }}</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Briefcase, DollarSign, CheckCircle, TrendingUp, Plus, Trash2, AlertCircle } from 'lucide-vue-next'
import Toast from './shared/Toast.vue'
import Modal from './shared/Modal.vue'
import { useToast } from '../composables/useToast'

const toast = useToast()

interface ManagementFee {
  id: string
  employeeId: string
  employeeName: string
  feeType: string
  amount: number
  confirmed: boolean
  note?: string
}

const items = ref<ManagementFee[]>([
  { id: '1', employeeId: 'E001', employeeName: '张教练', feeType: '团队管理费', amount: 1000, confirmed: false },
  { id: '2', employeeId: 'E001', employeeName: '张教练', feeType: '项目管理费', amount: 500, confirmed: false },
  { id: '3', employeeId: 'E003', employeeName: '王医生', feeType: '团队管理费', amount: 1500, confirmed: false }
])

const employees = ref([
  { id: 'E001', name: '张教练' },
  { id: 'E003', name: '王医生' },
  { id: 'E005', name: '孙顾问' }
])

const showAddDialog = ref(false)
const editingItem = ref<ManagementFee | null>(null)
const formData = ref({ employeeId: '', feeType: '团队管理', amount: 0, note: '' })

const itemCount = computed(() => items.value.length)
const totalAmount = computed(() => items.value.reduce((sum, item) => sum + item.amount, 0))
const confirmedCount = computed(() => items.value.filter(item => item.confirmed).length)
const averageAmount = computed(() => itemCount.value > 0 ? totalAmount.value / itemCount.value : 0)
const allConfirmed = computed(() => items.value.length > 0 && items.value.every(item => item.confirmed))

const editItem = (item: ManagementFee) => {
  editingItem.value = item
  formData.value = { employeeId: item.employeeId, feeType: item.feeType, amount: item.amount, note: item.note || '' }
  showAddDialog.value = true
}

const toggleItemConfirm = (item: ManagementFee) => {
  item.confirmed = !item.confirmed
  toast.success(item.confirmed ? '确认成功' : '已取消确认', item.confirmed ? `${item.employeeName} 的${item.feeType}已确认` : '确认已取消')
}

const toggleConfirm = () => {
  if (allConfirmed.value) {
    items.value.forEach(item => item.confirmed = false)
    toast.success('已取消', '所有管理费确认状态已取消')
  } else {
    items.value.forEach(item => item.confirmed = true)
    toast.success('确认成功', '所有管理费已确认')
  }
}

const deleteItem = (id: string) => {
  if (confirm('确定要删除这条管理费记录吗？')) {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
      toast.success('删除成功', '管理费记录已删除')
    }
  }
}

const handleSave = () => {
  const employee = employees.value.find(e => e.id === formData.value.employeeId)
  if (editingItem.value) {
    Object.assign(editingItem.value, {
      employeeId: formData.value.employeeId,
      employeeName: employee?.name || '',
      feeType: formData.value.feeType,
      amount: formData.value.amount,
      note: formData.value.note
    })
    toast.success('保存成功', '管理费记录已更新')
  } else {
    const newItem: ManagementFee = {
      id: Date.now().toString(),
      employeeId: formData.value.employeeId,
      employeeName: employee?.name || '',
      feeType: formData.value.feeType,
      amount: formData.value.amount,
      confirmed: false,
      note: formData.value.note
    }
    items.value.push(newItem)
    toast.success('添加成功', '管理费记录已添加')
  }
  closeDialog()
}

const closeDialog = () => {
  showAddDialog.value = false
  editingItem.value = null
  formData.value = { employeeId: '', feeType: '团队管理', amount: 0, note: '' }
}
</script>
