<template>
  <div class="space-y-6">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Coffee :size="24" class="text-amber-600" />
          津贴补贴管理
        </h2>
        <p class="text-sm text-slate-500 mt-1">交通、通讯、餐补、房补等津贴管理</p>
      </div>
      <div class="flex items-center gap-3">
        <div v-if="!isConfirmed" class="text-sm text-yellow-700 bg-yellow-100 px-4 py-2 rounded-lg">
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
          :class="isConfirmed
            ? 'border border-yellow-600 text-yellow-600 hover:bg-yellow-50'
            : 'bg-green-600 text-white hover:bg-green-700'"
        >
          <CheckCircle :size="16" />
          {{ isConfirmed ? '取消确认' : '确认本月数据' }}
        </button>
        <button
          @click="showEditDialog = true"
          class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
        >
          <Edit3 :size="16" />
          调整补贴
        </button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">交通补贴</span>
          <Car :size="20" />
        </div>
        <div class="text-3xl font-bold">¥{{ allowances.traffic.toLocaleString() }}</div>
        <div class="text-xs opacity-75 mt-2">固定金额</div>
      </div>

      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg shadow-green-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">通讯补贴</span>
          <Phone :size="20" />
        </div>
        <div class="text-3xl font-bold">¥{{ allowances.communication.toLocaleString() }}</div>
        <div class="text-xs opacity-75 mt-2">固定金额</div>
      </div>

      <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg shadow-amber-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">餐补</span>
          <Coffee :size="20" />
        </div>
        <div class="text-3xl font-bold">¥{{ mealAllowance.amount.toLocaleString() }}</div>
        <div class="text-xs opacity-75 mt-2">{{ workdays }}天 × ¥{{ mealAllowance.dailyRate }}/天</div>
      </div>

      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg shadow-purple-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">房补</span>
          <Home :size="20" />
        </div>
        <div class="text-3xl font-bold">¥{{ allowances.housing.toLocaleString() }}</div>
        <div class="text-xs opacity-75 mt-2">固定金额</div>
      </div>
    </div>

    <!-- 工作日说明 -->
    <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
      <h3 class="font-semibold text-amber-900 mb-3 flex items-center gap-2">
        <Calendar :size="18" class="text-amber-600" />
        工作日计算说明
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div class="flex items-start gap-3">
          <div class="p-2 bg-white rounded-lg">
            <Calendar :size="18" class="text-amber-600" />
          </div>
          <div>
            <div class="font-medium text-amber-900">计算月份</div>
            <div class="text-amber-700">{{ selectedMonth }}</div>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="p-2 bg-white rounded-lg">
            <Clock :size="18" class="text-amber-600" />
          </div>
          <div>
            <div class="font-medium text-amber-900">工作日天数</div>
            <div class="text-amber-700">{{ workdays }}天（排除周六日）</div>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="p-2 bg-white rounded-lg">
            <DollarSign :size="18" class="text-amber-600" />
          </div>
          <div>
            <div class="font-medium text-amber-900">餐补标准</div>
            <div class="text-amber-700">¥{{ mealAllowance.dailyRate }}/工作日</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 补贴明细列表 -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 class="text-lg font-semibold">补贴明细</h3>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">补贴类型</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">计算方式</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">金额</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">说明</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr class="hover:bg-blue-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-blue-100 rounded-lg">
                    <Car :size="18" class="text-blue-600" />
                  </div>
                  <span class="font-medium text-slate-900">交通补贴</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">固定金额</td>
              <td class="px-6 py-4 text-right">
                <span class="text-lg font-bold text-blue-600">¥{{ allowances.traffic.toLocaleString() }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">交通通勤补助</td>
            </tr>
            <tr class="hover:bg-green-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-green-100 rounded-lg">
                    <Phone :size="18" class="text-green-600" />
                  </div>
                  <span class="font-medium text-slate-900">通讯补贴</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">固定金额</td>
              <td class="px-6 py-4 text-right">
                <span class="text-lg font-bold text-green-600">¥{{ allowances.communication.toLocaleString() }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">手机话费补助</td>
            </tr>
            <tr class="hover:bg-amber-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-amber-100 rounded-lg">
                    <Coffee :size="18" class="text-amber-600" />
                  </div>
                  <span class="font-medium text-slate-900">餐补</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">
                工作日 × 日标准
              </td>
              <td class="px-6 py-4 text-right">
                <span class="text-lg font-bold text-amber-600">¥{{ mealAllowance.amount.toLocaleString() }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">
                {{ workdays }}天 × ¥{{ mealAllowance.dailyRate }}/天
              </td>
            </tr>
            <tr class="hover:bg-purple-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-purple-100 rounded-lg">
                    <Home :size="18" class="text-purple-600" />
                  </div>
                  <span class="font-medium text-slate-900">房补</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">固定金额</td>
              <td class="px-6 py-4 text-right">
                <span class="text-lg font-bold text-purple-600">¥{{ allowances.housing.toLocaleString() }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-500">住宿补助</td>
            </tr>
            <tr class="bg-slate-50 font-semibold">
              <td class="px-6 py-4" colspan="2">
                <div class="flex items-center gap-2">
                  <Equal :size="18" class="text-slate-700" />
                  <span class="text-slate-900">补贴合计</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <span class="text-xl font-bold text-slate-900">¥{{ totalAllowances.toLocaleString() }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">月度津贴总额</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 编辑补贴弹窗 -->
    <Modal v-model:show="showEditDialog" title="调整津贴补贴" size="lg">
      <form @submit.prevent="handleSave" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">交通补贴</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-slate-400">¥</span>
              <input
                v-model.number="editForm.traffic"
                type="number"
                class="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg"
                placeholder="0"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">通讯补贴</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-slate-400">¥</span>
              <input
                v-model.number="editForm.communication"
                type="number"
                class="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg"
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">餐补标准/天</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-slate-400">¥</span>
              <input
                v-model.number="editForm.mealDailyRate"
                type="number"
                class="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg"
                placeholder="40"
              />
            </div>
            <p class="text-xs text-slate-500 mt-1">当前月：{{ workdays }}个工作日，总计 ¥{{ (workdays * editForm.mealDailyRate).toLocaleString() }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">房补</label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-slate-400">¥</span>
              <input
                v-model.number="editForm.housing"
                type="number"
                class="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg"
                placeholder="0"
              />
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">备注</label>
          <textarea
            v-model="editForm.note"
            placeholder="输入调整原因..."
            rows="3"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"
          ></textarea>
        </div>
      </form>
      <template #footer>
        <button @click="closeDialog" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">取消</button>
        <button @click="handleSave" class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">保存调整</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Coffee,
  Calendar,
  Edit3,
  Car,
  Phone,
  Home,
  Clock,
  DollarSign,
  Equal,
  CheckCircle,
  AlertCircle
} from 'lucide-vue-next'
import Toast from './shared/Toast.vue'
import Modal from './shared/Modal.vue'
import { useToast } from '../composables/useToast'

interface Props {
  selectedMonth: string
}

const props = defineProps<Props>()

const toast = useToast()

// 确认状态
const isConfirmed = ref(false)

// 切换确认状态
const toggleConfirm = () => {
  isConfirmed.value = !isConfirmed.value
  if (isConfirmed.value) {
    toast.success('确认成功', '津贴补贴数据已确认')
  } else {
    toast.success('已取消', '津贴补贴确认状态已取消')
  }
}

// 津贴补贴配置
const allowances = ref({
  traffic: 500,
  communication: 200,
  housing: 0
})

// 餐补配置
const MEAL_DAILY_RATE = 40

// 计算工作日
const calculateWorkdays = (year: number, month: number): number => {
  let workdays = 0
  const daysInMonth = new Date(year, month, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const dayOfWeek = date.getDay()
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      workdays++
    }
  }

  return workdays
}

// 计算当月工作日
const workdays = computed(() => {
  const [year, month] = props.selectedMonth.split('-').map(Number)
  return calculateWorkdays(year, month)
})

// 餐补金额
const mealAllowance = computed(() => ({
  amount: workdays.value * MEAL_DAILY_RATE,
  workdays: workdays.value,
  dailyRate: MEAL_DAILY_RATE
}))

// 总津贴
const totalAllowances = computed(() => {
  return allowances.value.traffic +
         allowances.value.communication +
         mealAllowance.value.amount +
         allowances.value.housing
})

// 编辑表单
const showEditDialog = ref(false)
const editForm = ref({
  traffic: allowances.value.traffic,
  communication: allowances.value.communication,
  mealDailyRate: MEAL_DAILY_RATE,
  housing: allowances.value.housing,
  note: ''
})

const handleSave = () => {
  allowances.value = {
    traffic: editForm.value.traffic || 0,
    communication: editForm.value.communication || 0,
    housing: editForm.value.housing || 0
  }

  toast.success('保存成功', '津贴补贴已更新')
  closeDialog()
}

const closeDialog = () => {
  showEditDialog.value = false
  editForm.value = {
    traffic: allowances.value.traffic,
    communication: allowances.value.communication,
    mealDailyRate: MEAL_DAILY_RATE,
    housing: allowances.value.housing,
    note: ''
  }
}
</script>
