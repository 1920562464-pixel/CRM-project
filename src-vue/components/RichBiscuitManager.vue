<template>
  <div class="space-y-6">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- 页面标题和操作栏 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Award :size="28" class="text-orange-600" />
          富贵饼管理
        </h1>
        <p class="text-sm text-slate-500 mt-2">激励饼发放与管理</p>
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

    <!-- 本月统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center gap-2 mb-2">
          <Award :size="20" />
          <span class="text-sm">本月总发放</span>
        </div>
        <div class="text-3xl font-bold">{{ monthlyStats.totalIssued.toFixed(1) }} 饼</div>
        <div class="text-sm opacity-90">价值 ¥{{ monthlyStats.totalValue.toLocaleString() }}</div>
      </div>

      <div class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div class="text-sm text-slate-600 mb-1">🥇 第一名</div>
        <div class="font-semibold text-slate-900">{{ monthlyStats.top1?.name || '-' }}</div>
        <div class="text-lg font-bold text-orange-600">
          {{ monthlyStats.top1?.amount.toFixed(1) || 0 }} 饼
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div class="text-sm text-slate-600 mb-1">🥈 第二名</div>
        <div class="font-semibold text-slate-900">{{ monthlyStats.top2?.name || '-' }}</div>
        <div class="text-lg font-bold text-orange-600">
          {{ monthlyStats.top2?.amount.toFixed(1) || 0 }} 饼
        </div>
      </div>

      <div class="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
        <div class="text-sm text-slate-600 mb-1">🥉 第三名</div>
        <div class="font-semibold text-slate-900">{{ monthlyStats.top3?.name || '-' }}</div>
        <div class="text-lg font-bold text-orange-600">
          {{ monthlyStats.top3?.amount.toFixed(1) || 0 }} 饼
        </div>
      </div>
    </div>

    <!-- 发放表单 -->
    <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Award class="text-orange-600" :size="20" />
        发放富贵饼
      </h3>
      <form @submit.prevent="handleIssue" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">选择教练 *</label>
            <select
              v-model="form.employeeId"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">请选择教练</option>
              <option v-for="coach in coaches" :key="coach.id" :value="coach.id">
                {{ coach.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">发放数量（饼）*</label>
            <input
              v-model.number="form.amount"
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="支持小数，如 1.5"
            />
            <p class="text-xs text-slate-500 mt-1">
              价值：¥{{ (form.amount * 100).toFixed(2) }}（每个饼价值100元）
            </p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">发放原因 *</label>
          <input
            v-model="form.reason"
            type="text"
            required
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="请填写发放原因，如：服务创新、绩效优秀等"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">分类 *</label>
          <div class="flex flex-wrap gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                v-model="form.category"
                value="performance"
                class="text-orange-600"
              />
              <span>🏆 绩效优秀</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                v-model="form.category"
                value="innovation"
                class="text-orange-600"
              />
              <span>💡 创新方案</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                v-model="form.category"
                value="teamwork"
                class="text-orange-600"
              />
              <span>🤝 团队协作</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                v-model="form.category"
                value="extra"
                class="text-orange-600"
              />
              <span>⭐ 额外贡献</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                v-model="form.category"
                value="other"
                class="text-orange-600"
              />
              <span>📝 其他</span>
            </label>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">备注</label>
          <textarea
            v-model="form.note"
            rows="2"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            placeholder="填写补充说明..."
          />
        </div>

        <div class="flex gap-3">
          <button
            type="submit"
            class="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium shadow-sm transition-colors"
          >
            立即发放
          </button>
          <button
            type="button"
            @click="showBatchDialog = true"
            class="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
          >
            批量发放
          </button>
        </div>
      </form>
    </div>

    <!-- 发放记录列表 -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h3 class="text-lg font-semibold text-slate-900">发放记录</h3>
        <select
          v-model="selectedMonth"
          class="px-3 py-2 border border-slate-300 rounded-lg text-sm"
        >
          <option value="2025-02">2025年2月</option>
          <option value="2025-01">2025年1月</option>
          <option value="2024-12">2024年12月</option>
        </select>
      </div>
      <div v-if="filteredRecords.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">发放时间</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">教练</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">数量</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">价值</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">原因</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">分类</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">发放人</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="record in filteredRecords"
              :key="record.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="px-4 py-3 text-sm text-slate-600">{{ formatDate(record.issuedAt) }}</td>
              <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ record.employeeName }}</td>
              <td class="px-4 py-3 text-sm font-semibold text-orange-600">{{ record.amount }} 饼</td>
              <td class="px-4 py-3 text-sm font-medium text-slate-900">¥{{ record.value.toFixed(2) }}</td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ record.reason }}</td>
              <td class="px-4 py-3">
                <span
                  :class="`px-2 py-1 text-xs rounded-full ${getCategoryClass(record.category)}`"
                >
                  {{ getCategoryLabel(record.category) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ record.issuerName }}</td>
              <td class="px-4 py-3 text-center">
                <button
                  @click="handleDelete(record)"
                  class="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded border border-red-200"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="p-12 text-center text-slate-400">
        <Award :size="48" class="mx-auto mb-4 opacity-50" />
        <p class="font-medium">暂无发放记录</p>
        <p class="text-sm mt-1">请选择月份查看或发放富贵饼</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Award, AlertCircle, CheckCircle } from 'lucide-vue-next'
import Toast from './shared/Toast.vue'
import { useRichBiscuit } from '../composables/useRichBiscuit'
import { useToast } from '../composables/useToast'
import type { RichBiscuitCategory } from '../types/commission'

const toast = useToast()
const { issueRichBiscuit, getMonthRichBiscuits, getRichBiscuitStats, deleteRichBiscuit, getCategoryLabel, getCategoryClass } = useRichBiscuit()

// 表单数据
const form = ref({
  employeeId: '',
  amount: 1,
  reason: '',
  category: 'performance' as RichBiscuitCategory,
  note: ''
})

// 确认状态
const allConfirmed = ref(false)

// 统计数据
const monthlyStats = ref({
  totalIssued: 0,
  totalValue: 0,
  top1: undefined as any,
  top2: undefined as any,
  top3: undefined as any
})

// 发放记录
const selectedMonth = ref('2025-02')
const showBatchDialog = ref(false)

// 教练列表（模拟数据）
const coaches = ref([
  { id: '1', name: '张教练' },
  { id: '2', name: '李教练' },
  { id: '3', name: '王教练' }
])

// 筛选后的记录
const filteredRecords = computed(() => {
  return getMonthRichBiscuits(selectedMonth.value)
})

// 发放富贵饼
const handleIssue = () => {
  const coach = coaches.value.find(c => c.id === form.value.employeeId)
  if (!coach) {
    toast.error('发放失败', '请选择教练')
    return
  }

  try {
    issueRichBiscuit({
      employeeId: form.value.employeeId,
      employeeName: coach.name,
      amount: form.value.amount,
      reason: form.value.reason,
      category: form.value.category,
      issuerId: 'admin',
      issuerName: '管理员',
      note: form.value.note
    })

    toast.success('发放成功', `已发放 ${form.value.amount} 饼（¥${(form.value.amount * 100).toFixed(2)}）`)

    // 重置表单
    form.value = {
      employeeId: '',
      amount: 1,
      reason: '',
      category: 'performance',
      note: ''
    }

    // 更新统计
    updateStats()
  } catch (error) {
    toast.error('发放失败', error.message)
  }
}

// 删除记录
const handleDelete = (record: any) => {
  if (confirm(`确定要删除 ${record.employeeName} 的 ${record.amount} 饼记录吗？`)) {
    deleteRichBiscuit(record.id)
    toast.success('删除成功', '富贵饼记录已删除')
    updateStats()
  }
}

// 更新统计数据
const updateStats = () => {
  monthlyStats.value = getRichBiscuitStats(selectedMonth.value)
}

// 切换确认状态
const toggleConfirm = () => {
  allConfirmed.value = !allConfirmed.value
  toast.success(
    allConfirmed.value ? '确认成功' : '已取消确认',
    allConfirmed.value ? '本月富贵饼数据已确认' : '富贵饼数据确认已取消'
  )
}

// 格式化日期
const formatDate = (date: Date) => {
  const d = new Date(date)
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

onMounted(() => {
  updateStats()
})
</script>
