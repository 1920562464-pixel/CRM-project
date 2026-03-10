<template>
  <div class="space-y-6">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- 页面标题和操作栏 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <DollarSign :size="28" class="text-blue-600" />
          佣金结算管理
        </h1>
        <p class="text-sm text-slate-500 mt-2">佣金记录管理、审核与结算</p>
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

    <!-- 佣金提报横幅 -->
    <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <AlertCircle :size="20" class="text-purple-600" />
            <span class="font-semibold text-purple-900">顾问佣金数据提报</span>
          </div>
          <span class="text-sm text-purple-700">
            当前状态：<span class="text-green-600 font-semibold">开放中</span>
          </span>
        </div>
        <button
          @click="openCommissionReportDialog"
          class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium"
        >
          <Plus :size="16" /> 新增佣金提报
        </button>
      </div>
    </div>

    <!-- 产品佣金规则说明 -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <AlertCircle :size="18" class="text-blue-600" />
          <span class="font-semibold text-blue-900">产品佣金规则：</span>
        </div>
        <div class="text-sm text-blue-800 space-y-2 ml-7">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <div class="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
              <span class="font-medium">3188元基础套餐</span>
              <span class="font-semibold text-green-600">2%提成</span>
            </div>
            <div class="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
              <span class="font-medium">6800元标准套餐</span>
              <span class="font-medium text-slate-500">无提成</span>
            </div>
            <div class="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
              <span class="font-medium">7188元进阶套餐</span>
              <span class="font-semibold text-emerald-600">5%提成</span>
            </div>
            <div class="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
              <span class="font-medium">12800元高级套餐</span>
              <span class="font-semibold text-emerald-600">5%提成</span>
            </div>
            <div class="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
              <span class="font-medium">25800元尊享套餐</span>
              <span class="font-semibold text-emerald-600">5%提成</span>
            </div>
            <div class="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
              <span class="font-medium">39800元旗舰套餐</span>
              <div class="text-right">
                <span class="font-semibold text-emerald-600">5%提成</span>
                <span class="text-xs text-orange-600 block">含¥10,000补贴</span>
              </div>
            </div>
            <div class="flex items-center justify-between bg-white/60 rounded-lg px-3 py-2">
              <span class="font-medium">49800元至尊套餐</span>
              <span class="font-semibold text-emerald-600">5%提成</span>
            </div>
          </div>
          <div class="pt-2 border-t border-blue-200 mt-2 space-y-1 text-xs">
            <div>• 结算周期：3个月无退费期</div>
            <div>• 已停用产品：399/14天短期产品（原25%提成）</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 筛选和操作栏 -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4 flex-wrap">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">选择月份</label>
            <select
              v-model="selectedMonth"
              @change="updateData"
              class="px-4 py-2 border border-slate-300 rounded-lg"
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
              @change="filterCommissions"
              class="px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">全部员工</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">筛选类型</label>
            <select
              v-model="selectedType"
              @change="filterCommissions"
              class="px-4 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">全部类型</option>
              <option value="new_user">新用户签约</option>
              <option value="renewal">用户续约</option>
              <option value="product_sale">产品销售</option>
              <option value="referral">推荐奖励</option>
              <option value="bonus">业绩奖金</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">&nbsp;</label>
            <button
              @click="showAddDialog = true"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
            >
              <Plus :size="16" />
              添加佣金
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
      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">新用户签约</span>
          <User :size="20" />
        </div>
        <div class="text-2xl font-bold">¥{{ stats.newUserAmount.toLocaleString() }}</div>
        <div class="text-xs opacity-75">{{ stats.newUserCount }} 人</div>
      </div>

      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">用户续约</span>
          <RefreshCw :size="20" />
        </div>
        <div class="text-2xl font-bold">¥{{ stats.renewalAmount.toLocaleString() }}</div>
        <div class="text-xs opacity-75">{{ stats.renewalCount }} 人</div>
      </div>

      <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">产品销售</span>
          <ShoppingCart :size="20" />
        </div>
        <div class="text-2xl font-bold">¥{{ stats.productAmount.toLocaleString() }}</div>
        <div class="text-xs opacity-75">提成计算</div>
      </div>

      <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">推荐奖励</span>
          <Award :size="20" />
        </div>
        <div class="text-2xl font-bold">¥{{ stats.referralAmount.toLocaleString() }}</div>
        <div class="text-xs opacity-75">{{ stats.referralCount }} 笔</div>
      </div>

      <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">总计</span>
          <DollarSign :size="20" />
        </div>
        <div class="text-2xl font-bold">¥{{ stats.totalAmount.toLocaleString() }}</div>
        <div class="text-xs opacity-75">{{ stats.totalCount }} 笔</div>
      </div>
    </div>

    <!-- 佣金列表 -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 class="text-lg font-semibold">佣金明细列表</h3>
        <div class="flex items-center gap-2">
          <button
            @click="batchApprove"
            :disabled="!canBatchApprove"
            class="px-3 py-1.5 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-1 text-sm disabled:opacity-50"
          >
            <CheckCircle :size="14" />
            批量审核
          </button>
          <button
            @click="batchPay"
            :disabled="!canBatchPay"
            class="px-3 py-1.5 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 flex items-center gap-1 text-sm disabled:opacity-50"
          >
            <DollarSign :size="14" />
            批量发放
          </button>
        </div>
      </div>

      <div v-if="commissionList.length === 0" class="p-12 text-center text-slate-400">
        <DollarSign :size="48" class="mx-auto mb-4 opacity-50" />
        <p class="font-medium">暂无佣金记录</p>
        <p class="text-sm mt-1">请点击"添加佣金"按钮开始添加</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase w-8">
                <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" class="rounded" />
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">员工</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">类型</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">关联对象</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">金额</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">状态</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">时间</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="item in commissionList"
              :key="item.id"
              class="hover:bg-slate-50"
              :class="{ 'bg-blue-50/30': selectedItems.includes(item.id) }"
            >
              <td class="px-4 py-3">
                <input type="checkbox" v-model="selectedItems" :value="item.id" class="rounded" />
              </td>
              <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ item.employeeName }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs rounded" :class="getTypeClass(item.type)">
                  {{ getTypeLabel(item.type) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600">
                {{ item.relatedUserName || item.relatedProductName || '-' }}
              </td>
              <td class="px-4 py-3 text-sm font-semibold text-green-600">¥{{ item.amount.toFixed(2) }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs rounded" :class="getStatusClass(item.status)">
                  {{ getStatusLabel(item.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ formatDate(item.occurredAt) }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    @click="editItem(item)"
                    class="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200"
                  >
                    编辑
                  </button>
                  <button
                    v-if="item.status === 'pending'"
                    @click="approveItem(item.id)"
                    class="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded border border-green-200"
                  >
                    审核
                  </button>
                  <button
                    v-if="item.status === 'approved'"
                    @click="payItem(item.id)"
                    class="text-xs text-purple-600 hover:bg-purple-50 px-2 py-1 rounded border border-purple-200"
                  >
                    发放
                  </button>
                  <button
                    @click="deleteItem(item.id)"
                    class="text-xs text-red-600 hover:bg-red-50 px-1 py-1 rounded"
                  >
                    <Trash2 :size="12" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 佣金提报弹窗 -->
    <Modal v-model:show="showCommissionReportDialog" title="新增佣金提报" size="lg">
      <form @submit.prevent="submitCommissionReport" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">选择顾问 *</label>
          <select v-model="commissionReportForm.consultantId" required class="w-full px-3 py-2 border border-slate-300 rounded-lg">
            <option value="">请选择顾问</option>
            <option v-for="emp in employees.filter(e => e.role === 'consultant')" :key="emp.id" :value="emp.id">
              {{ emp.name }}
            </option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">基础干预人数</label>
            <input
              v-model.number="commissionReportForm.basicServiceUsers"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            <div class="text-xs text-slate-500 mt-1">¥100/人</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">深度干预人数</label>
            <input
              v-model.number="commissionReportForm.deepServiceUsers"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            <div class="text-xs text-slate-500 mt-1">¥200/人</div>
          </div>
        </div>
        <div v-if="commissionReportForm.basicServiceUsers > 0 || commissionReportForm.deepServiceUsers > 0" class="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-purple-700">预计金额：</span>
            <span class="text-lg font-bold text-purple-600">
              ¥{{ ((commissionReportForm.basicServiceUsers || 0) * 100 + (commissionReportForm.deepServiceUsers || 0) * 200).toLocaleString() }}
            </span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">备注</label>
          <textarea
            v-model="commissionReportForm.remark"
            placeholder="请输入备注信息"
            rows="2"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button @click="closeCommissionReportDialog" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
          取消
        </button>
        <button @click="submitCommissionReport" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          提交
        </button>
      </template>
    </Modal>

    <!-- 添加/编辑佣金弹窗 -->
    <Modal v-model:show="showAddDialog" :title="editingItem ? '编辑佣金' : '添加佣金'" size="lg">
      <form @submit.prevent="handleSave" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">员工 *</label>
            <select v-model="formData.employeeId" required class="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="">请选择员工</option>
              <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                {{ emp.name }} ({{ emp.role }})
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">佣金类型 *</label>
            <select v-model="formData.type" required class="w-full px-3 py-2 border border-slate-300 rounded-lg">
              <option value="new_user">新用户签约</option>
              <option value="renewal">用户续约</option>
              <option value="product_sale">产品销售</option>
              <option value="referral">推荐奖励</option>
              <option value="bonus">业绩奖金</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">金额 *</label>
            <input
              v-model.number="formData.amount"
              type="number"
              step="0.01"
              required
              placeholder="请输入金额"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">发生日期 *</label>
            <input
              v-model="formData.occurredAt"
              type="date"
              required
              class="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div v-if="formData.type === 'new_user' || formData.type === 'renewal'">
          <label class="block text-sm font-medium text-slate-700 mb-2">关联用户</label>
          <input
            v-model="formData.relatedUserName"
            type="text"
            placeholder="输入用户姓名"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>

        <div v-if="formData.type === 'product_sale'">
          <label class="block text-sm font-medium text-slate-700 mb-2">关联产品</label>
          <input
            v-model="formData.relatedProductName"
            type="text"
            placeholder="输入产品名称"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">备注</label>
          <textarea
            v-model="formData.note"
            placeholder="输入备注信息"
            rows="3"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button @click="closeDialog" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
          取消
        </button>
        <button @click="handleSave" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          {{ editingItem ? '保存' : '添加' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  DollarSign, Plus, Download, User, RefreshCw, ShoppingCart,
  Award, CheckCircle, Trash2, AlertCircle
} from 'lucide-vue-next'
import Toast from './shared/Toast.vue'
import Modal from './shared/Modal.vue'
import { useToast } from '../composables/useToast'
import { useCommission } from '../composables/useCommission'
import type { Commission, CommissionType, CommissionStatus } from '../types/commission'

const toast = useToast()
const {
  commissions,
  getMonthCommissions,
  getCommissionStats,
  createCommission,
  approveCommission,
  payCommission,
  batchApproveCommissions,
  batchPayCommissions,
  deleteCommission
} = useCommission()

const selectedMonth = ref('2025-02')
const selectedEmployeeId = ref('')
const selectedType = ref('')
const showAddDialog = ref(false)
const showCommissionReportDialog = ref(false)
const editingItem = ref<Commission | null>(null)
const selectedItems = ref<string[]>([])
const selectAll = ref(false)

// 佣金提报表单
const commissionReportForm = ref({
  consultantId: '',
  basicServiceUsers: 0,
  deepServiceUsers: 0,
  remark: ''
})

// 员工列表（模拟）
const employees = ref([
  { id: '1', name: '张教练', role: 'coach' },
  { id: '2', name: '李教练', role: 'coach' },
  { id: '3', name: '王医生', role: 'doctor' },
  { id: '4', name: '赵顾问', role: 'consultant' }
])

// 表单数据
const formData = ref({
  employeeId: '',
  type: 'new_user' as CommissionType,
  amount: 0,
  occurredAt: '',
  relatedUserName: '',
  relatedProductName: '',
  note: ''
})

// 统计数据
const stats = ref({
  totalAmount: 0,
  totalCount: 0,
  newUserAmount: 0,
  newUserCount: 0,
  renewalAmount: 0,
  renewalCount: 0,
  productAmount: 0,
  productRate: 0.05,
  referralAmount: 0,
  referralCount: 0,
  byRole: []
})

// 佣金列表
const commissionList = computed(() => {
  let list = getMonthCommissions(selectedMonth.value)

  if (selectedEmployeeId.value) {
    list = list.filter(c => c.employeeId === selectedEmployeeId.value)
  }

  if (selectedType.value) {
    list = list.filter(c => c.type === selectedType.value)
  }

  return list
})

// 批量操作权限
const canBatchApprove = computed(() => {
  return commissionList.value.some(c => c.status === 'pending' && selectedItems.value.includes(c.id))
})

const canBatchPay = computed(() => {
  return commissionList.value.some(c => c.status === 'approved' && selectedItems.value.includes(c.id))
})

// 更新数据
const updateData = () => {
  stats.value = getCommissionStats(selectedMonth.value)
  selectedItems.value = []
  selectAll.value = false
}

// 筛选佣金
const filterCommissions = () => {
  // 触发计算属性更新
}

// 确认状态
const allConfirmed = ref(false)

// 切换确认状态
const toggleConfirm = () => {
  allConfirmed.value = !allConfirmed.value
  toast.success(
    allConfirmed.value ? '确认成功' : '已取消确认',
    allConfirmed.value ? '本月佣金数据已确认' : '佣金数据确认已取消'
  )
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectAll.value) {
    selectedItems.value = commissionList.value.map(c => c.id)
  } else {
    selectedItems.value = []
  }
}

// 获取类型标签
const getTypeLabel = (type: CommissionType): string => {
  const labels: Record<CommissionType, string> = {
    new_user: '新用户签约',
    renewal: '用户续约',
    product_sale: '产品销售',
    referral: '推荐奖励',
    bonus: '业绩奖金'
  }
  return labels[type] || type
}

// 获取类型样式
const getTypeClass = (type: CommissionType): string => {
  const classes: Record<CommissionType, string> = {
    new_user: 'bg-green-100 text-green-800',
    renewal: 'bg-blue-100 text-blue-800',
    product_sale: 'bg-purple-100 text-purple-800',
    referral: 'bg-amber-100 text-amber-800',
    bonus: 'bg-orange-100 text-orange-800'
  }
  return classes[type] || 'bg-slate-100 text-slate-800'
}

// 获取状态标签
const getStatusLabel = (status: CommissionStatus): string => {
  const labels: Record<CommissionStatus, string> = {
    pending: '待审核',
    approved: '已审核',
    paid: '已发放',
    cancelled: '已取消'
  }
  return labels[status] || status
}

// 获取状态样式
const getStatusClass = (status: CommissionStatus): string => {
  const classes: Record<CommissionStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-slate-100 text-slate-800'
  }
  return classes[status] || 'bg-slate-100 text-slate-800'
}

// 格式化日期
const formatDate = (date: Date): string => {
  const d = new Date(date)
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${month}-${day}`
}

// 编辑项目
const editItem = (item: Commission) => {
  editingItem.value = item
  formData.value = {
    employeeId: item.employeeId,
    type: item.type,
    amount: item.amount,
    occurredAt: new Date(item.occurredAt).toISOString().split('T')[0],
    relatedUserName: item.relatedUserName || '',
    relatedProductName: item.relatedProductName || '',
    note: item.note || ''
  }
  showAddDialog.value = true
}

// 审核项目
const approveItem = (id: string) => {
  if (approveCommission(id, 'admin')) {
    toast.success('审核成功', '佣金已审核通过')
    updateData()
  }
}

// 发放项目
const payItem = (id: string) => {
  if (payCommission(id, 'finance')) {
    toast.success('发放成功', '佣金已发放')
    updateData()
  }
}

// 删除项目
const deleteItem = (id: string) => {
  if (confirm('确定要删除这条佣金记录吗？')) {
    if (deleteCommission(id)) {
      toast.success('删除成功', '佣金记录已删除')
      updateData()
    }
  }
}

// 批量审核
const batchApprove = () => {
  const pendingItems = selectedItems.value.filter(id => {
    const item = commissionList.value.find(c => c.id === id)
    return item && item.status === 'pending'
  })

  if (pendingItems.length === 0) {
    toast.error('操作失败', '没有可审核的佣金')
    return
  }

  const count = batchApproveCommissions(pendingItems, 'admin')
  toast.success('批量审核成功', `已审核 ${count} 条佣金`)
  selectedItems.value = []
  updateData()
}

// 批量发放
const batchPay = () => {
  const approvedItems = selectedItems.value.filter(id => {
    const item = commissionList.value.find(c => c.id === id)
    return item && item.status === 'approved'
  })

  if (approvedItems.length === 0) {
    toast.error('操作失败', '没有可发放的佣金')
    return
  }

  const count = batchPayCommissions(approvedItems, 'finance')
  toast.success('批量发放成功', `已发放 ${count} 条佣金`)
  selectedItems.value = []
  updateData()
}

// 保存
const handleSave = () => {
  if (editingItem.value) {
    // 编辑模式
    Object.assign(editingItem.value, {
      employeeId: formData.value.employeeId,
      type: formData.value.type,
      amount: formData.value.amount,
      occurredAt: new Date(formData.value.occurredAt),
      relatedUserName: formData.value.relatedUserName,
      relatedProductName: formData.value.relatedProductName,
      note: formData.value.note
    })
    toast.success('保存成功', '佣金记录已更新')
  } else {
    // 新增模式
    const employee = employees.value.find(e => e.id === formData.value.employeeId)
    createCommission({
      employeeId: formData.value.employeeId,
      employeeName: employee?.name || '',
      employeeRole: employee?.role as any || 'consultant',
      type: formData.value.type,
      category: getTypeLabel(formData.value.type),
      relatedUserName: formData.value.relatedUserName,
      relatedProductName: formData.value.relatedProductName,
      amount: formData.value.amount,
      status: 'pending',
      occurredAt: new Date(formData.value.occurredAt),
      month: selectedMonth.value,
      note: formData.value.note
    })
    toast.success('添加成功', '佣金记录已添加')
  }

  closeDialog()
  updateData()
}

// 关闭对话框
const closeDialog = () => {
  showAddDialog.value = false
  editingItem.value = null
  formData.value = {
    employeeId: '',
    type: 'new_user',
    amount: 0,
    occurredAt: '',
    relatedUserName: '',
    relatedProductName: '',
    note: ''
  }
}

// 导出报表
const exportReport = () => {
  toast.success('导出成功', '佣金报表已导出')
}

// 佣金提报相关方法
const openCommissionReportDialog = () => {
  commissionReportForm.value = {
    consultantId: '',
    basicServiceUsers: 0,
    deepServiceUsers: 0,
    remark: ''
  }
  showCommissionReportDialog.value = true
}

const closeCommissionReportDialog = () => {
  showCommissionReportDialog.value = false
}

const submitCommissionReport = () => {
  if (!commissionReportForm.value.consultantId) {
    toast.error('请选择顾问')
    return
  }

  const employee = employees.value.find(e => e.id === commissionReportForm.value.consultantId)
  if (!employee) return

  const totalAmount = commissionReportForm.value.basicServiceUsers * 100 + commissionReportForm.value.deepServiceUsers * 200

  // 创建佣金记录
  createCommission({
    employeeId: employee.id,
    employeeName: employee.name,
    employeeRole: employee.role as any,
    type: 'bonus',
    category: '佣金提报',
    relatedUserName: `${commissionReportForm.value.basicServiceUsers}人基础 + ${commissionReportForm.value.deepServiceUsers}人深度`,
    amount: totalAmount,
    status: 'pending',
    occurredAt: new Date(),
    month: selectedMonth.value,
    note: commissionReportForm.value.remark
  })

  toast.success('提报成功', `已提交 ${employee.name} 的佣金数据，等待审核`)
  closeCommissionReportDialog()
  updateData()
}

onMounted(() => {
  // 设置默认日期为今天
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  formData.value.occurredAt = `${year}-${month}-${day}`

  updateData()
})
</script>
