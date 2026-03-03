<template>
  <div class="space-y-6">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- 页面标题和操作栏 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield :size="28" class="text-red-600" />
          五险一金管理
        </h1>
        <p class="text-sm text-slate-500 mt-2">社保公积金扣款管理</p>
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

    <!-- 五险一金说明 -->
    <div class="bg-red-50 border border-red-200 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <Shield :size="20" class="text-red-600 mt-0.5" />
        <div class="flex-1">
          <div class="font-semibold text-red-900 mb-2">💡 五险一金扣缴比例</div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span class="font-medium">养老保险：</span>8%</div>
            <div><span class="font-medium">医疗保险：</span>2%</div>
            <div><span class="font-medium">失业保险：</span>0.5%</div>
            <div><span class="font-medium">住房公积金：</span>12%</div>
          </div>
          <div class="text-xs text-red-700 mt-2">总扣缴比例：22.5%（个人承担部分）</div>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">扣款总额</span>
          <DollarSign :size="20" />
        </div>
        <div class="text-3xl font-bold">¥{{ totalAmount.toLocaleString() }}</div>
        <div class="text-xs opacity-75">{{ employeeCount }} 人</div>
      </div>

      <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">养老保险</span>
          <Shield :size="20" />
        </div>
        <div class="text-3xl font-bold">¥{{ pensionAmount.toLocaleString() }}</div>
        <div class="text-xs opacity-75">8%</div>
      </div>

      <div class="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">医疗保险</span>
          <Heart :size="20" />
        </div>
        <div class="text-3xl font-bold">¥{{ medicalAmount.toLocaleString() }}</div>
        <div class="text-xs opacity-75">2%</div>
      </div>

      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">住房公积金</span>
          <Building :size="20" />
        </div>
        <div class="text-3xl font-bold">¥{{ housingAmount.toLocaleString() }}</div>
        <div class="text-xs opacity-75">12%</div>
      </div>
    </div>

    <!-- 员工社保列表 -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 class="text-lg font-semibold">员工五险一金明细</h3>
        <button
          @click="showAddDialog = true"
          class="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1 text-sm"
        >
          <Plus :size="14" />
          添加员工
        </button>
      </div>

      <div v-if="items.length === 0" class="p-12 text-center text-slate-400">
        <Shield :size="48" class="mx-auto mb-4 opacity-50" />
        <p class="font-medium">暂无社保记录</p>
        <p class="text-sm mt-1">请点击"添加员工"按钮开始添加</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">员工</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">基数</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">养老8%</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">医疗2%</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">失业0.5%</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">公积金12%</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">小计</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="item in items" :key="item.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ item.employeeName }}</td>
              <td class="px-4 py-3 text-sm text-slate-600">¥{{ item.baseAmount.toLocaleString() }}</td>
              <td class="px-4 py-3 text-sm text-red-600">¥{{ item.pension.toLocaleString() }}</td>
              <td class="px-4 py-3 text-sm text-red-600">¥{{ item.medical.toLocaleString() }}</td>
              <td class="px-4 py-3 text-sm text-red-600">¥{{ item.unemployment.toLocaleString() }}</td>
              <td class="px-4 py-3 text-sm text-red-600">¥{{ item.housing.toLocaleString() }}</td>
              <td class="px-4 py-3 text-sm font-bold text-red-700">¥{{ item.total.toLocaleString() }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button @click="editItem(item)" class="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200">编辑</button>
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
    <Modal v-model:show="showAddDialog" :title="editingItem ? '编辑社保' : '添加员工社保'" size="lg">
      <form @submit.prevent="handleSave" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">员工 *</label>
          <select v-model="formData.employeeId" required class="w-full px-3 py-2 border border-slate-300 rounded-lg">
            <option value="">请选择员工</option>
            <option v-for="emp in employees" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">缴费基数 *</label>
          <input v-model.number="formData.baseAmount" type="number" step="0.01" required placeholder="请输入缴费基数" class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
          <p class="text-xs text-slate-500 mt-1">基数将自动计算各项扣款</p>
        </div>
        <div v-if="editingItem" class="bg-slate-50 rounded-lg p-4">
          <div class="text-sm font-medium text-slate-900 mb-2">预估扣款</div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>养老保险：¥{{ (formData.baseAmount * 0.08).toFixed(2) }}</div>
            <div>医疗保险：¥{{ (formData.baseAmount * 0.02).toFixed(2) }}</div>
            <div>失业保险：¥{{ (formData.baseAmount * 0.005).toFixed(2) }}</div>
            <div>住房公积金：¥{{ (formData.baseAmount * 0.12).toFixed(2) }}</div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-200 font-semibold">
            小计：¥{{ (formData.baseAmount * 0.225).toFixed(2) }}
          </div>
        </div>
      </form>
      <template #footer>
        <button @click="closeDialog" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">取消</button>
        <button @click="handleSave" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">{{ editingItem ? '保存' : '添加' }}</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Shield, DollarSign, CheckCircle, Heart, Building, Plus, Trash2, AlertCircle } from 'lucide-vue-next'
import Toast from './shared/Toast.vue'
import Modal from './shared/Modal.vue'
import { useToast } from '../composables/useToast'

const toast = useToast()

interface SocialInsurance {
  id: string
  employeeId: string
  employeeName: string
  baseAmount: number
  pension: number
  medical: number
  unemployment: number
  housing: number
  total: number
  confirmed: boolean
}

const items = ref<SocialInsurance[]>([
  {
    id: '1',
    employeeId: 'E001',
    employeeName: '张教练',
    baseAmount: 5000,
    pension: 400,
    medical: 100,
    unemployment: 25,
    housing: 600,
    total: 1125,
    confirmed: false
  },
  {
    id: '2',
    employeeId: 'E002',
    employeeName: '李教练',
    baseAmount: 4000,
    pension: 320,
    medical: 80,
    unemployment: 20,
    housing: 480,
    total: 900,
    confirmed: false
  },
  {
    id: '3',
    employeeId: 'E003',
    employeeName: '王医生',
    baseAmount: 6000,
    pension: 480,
    medical: 120,
    unemployment: 30,
    housing: 720,
    total: 1350,
    confirmed: false
  }
])

const employees = ref([
  { id: 'E001', name: '张教练' },
  { id: 'E002', name: '李教练' },
  { id: 'E003', name: '王医生' }
])

const showAddDialog = ref(false)
const editingItem = ref<SocialInsurance | null>(null)
const formData = ref({ employeeId: '', baseAmount: 5000 })

const employeeCount = computed(() => items.value.length)
const totalAmount = computed(() => items.value.reduce((sum, item) => sum + item.total, 0))
const pensionAmount = computed(() => items.value.reduce((sum, item) => sum + item.pension, 0))
const medicalAmount = computed(() => items.value.reduce((sum, item) => sum + item.medical, 0))
const housingAmount = computed(() => items.value.reduce((sum, item) => sum + item.housing, 0))
const allConfirmed = computed(() => items.value.length > 0 && items.value.every(item => item.confirmed))

const editItem = (item: SocialInsurance) => {
  editingItem.value = item
  formData.value = { employeeId: item.employeeId, baseAmount: item.baseAmount }
  showAddDialog.value = true
}

const deleteItem = (id: string) => {
  if (confirm('确定要删除这条社保记录吗？')) {
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value.splice(index, 1)
      toast.success('删除成功', '社保记录已删除')
    }
  }
}

const toggleConfirm = () => {
  if (allConfirmed.value) {
    items.value.forEach(item => item.confirmed = false)
    toast.success('已取消', '所有社保确认状态已取消')
  } else {
    items.value.forEach(item => item.confirmed = true)
    toast.success('确认成功', '所有社保已确认')
  }
}

const handleSave = () => {
  const employee = employees.value.find(e => e.id === formData.value.employeeId)
  const base = formData.value.baseAmount
  const newItem: SocialInsurance = {
    id: Date.now().toString(),
    employeeId: formData.value.employeeId,
    employeeName: employee?.name || '',
    baseAmount: base,
    pension: base * 0.08,
    medical: base * 0.02,
    unemployment: base * 0.005,
    housing: base * 0.12,
    total: base * 0.225,
    confirmed: false
  }

  if (editingItem.value) {
    Object.assign(editingItem.value, newItem)
    toast.success('保存成功', '社保记录已更新')
  } else {
    items.value.push(newItem)
    toast.success('添加成功', '社保记录已添加')
  }
  closeDialog()
}

const closeDialog = () => {
  showAddDialog.value = false
  editingItem.value = null
  formData.value = { employeeId: '', baseAmount: 5000 }
}
</script>
