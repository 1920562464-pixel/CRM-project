<template>
  <div class="space-y-6">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- Confirm Dialog -->
    <ConfirmDialog
      v-model:show="confirm.show"
      :title="confirm.title"
      :message="confirm.message"
      :type="confirm.type"
      @confirm="confirm.onConfirm"
      @cancel="confirm.onCancel"
    />

    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <FileSpreadsheet :size="28" class="text-teal-600" />
        预算管理
      </h1>
      <p class="text-slate-500 mt-1">预算编制、执行跟踪、差异分析</p>
    </div>

    <!-- Tab 导航 -->
    <div class="flex items-center gap-2 border-b border-slate-200">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
        :class="activeTab === tab.id
          ? 'border-teal-600 text-teal-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'"
      >
        <component :is="tab.icon" :size="16" />
        {{ tab.name }}
      </button>
    </div>

    <!-- 预算编制 -->
    <div v-if="activeTab === 'prepare'" class="space-y-4">
      <!-- 预算年度选择 -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <label class="text-sm font-medium text-slate-700">预算年度</label>
            <select
              v-model="budgetYear"
              class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm bg-white"
            >
              <option value="2024">2024年</option>
              <option value="2025">2025年</option>
            </select>
          </div>
          <button
            @click="openBudgetModal"
            class="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          >
            <Plus :size="16" />
            新增预算
          </button>
        </div>
      </div>

      <!-- 预算汇总 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 text-white shadow-lg shadow-teal-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">年度总预算</span>
            <Target :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ annualBudget.totalBudget.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">全年计划</div>
        </div>

        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">已执行预算</span>
            <Activity :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ annualBudget.executedBudget.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">{{ ((annualBudget.executedBudget / annualBudget.totalBudget) * 100).toFixed(1) }}%</div>
        </div>

        <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg shadow-amber-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">剩余预算</span>
            <Wallet :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ (annualBudget.totalBudget - annualBudget.executedBudget).toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">可用额度</div>
        </div>

        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg shadow-purple-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">预算执行率</span>
            <BarChart3 :size="20" />
          </div>
          <div class="text-3xl font-bold">{{ ((annualBudget.executedBudget / annualBudget.totalBudget) * 100).toFixed(1) }}%</div>
          <div class="text-xs opacity-75 mt-2">健康度良好</div>
        </div>
      </div>

      <!-- 预算明细 -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
          <h3 class="text-lg font-bold text-slate-900">预算明细</h3>
        </div>

        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">预算项目</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">类别</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">年度预算</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">已执行</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">剩余</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">执行进度</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase">状态</th>
              <th class="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase w-24">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="item in budgetItems"
              :key="item.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="font-medium text-slate-900">{{ item.name }}</div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="getCategoryBadgeClass(item.category)"
                >
                  {{ item.category }}
                </span>
              </td>
              <td class="px-6 py-4 text-right text-sm text-slate-900 font-medium">
                ¥{{ item.budget.toLocaleString() }}
              </td>
              <td class="px-6 py-4 text-right text-sm text-blue-600 font-medium">
                ¥{{ item.executed.toLocaleString() }}
              </td>
              <td class="px-6 py-4 text-right text-sm">
                <span :class="item.remaining >= 0 ? 'text-green-600' : 'text-red-600'">
                  ¥{{ item.remaining.toLocaleString() }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="w-full bg-slate-200 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all"
                    :class="getProgressBarClass(item.executionRate)"
                    :style="{ width: Math.min(item.executionRate, 100) + '%' }"
                  />
                </div>
                <div class="text-xs text-slate-500 mt-1 text-center">{{ item.executionRate.toFixed(1) }}%</div>
              </td>
              <td class="px-6 py-4 text-center">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
                  :class="getStatusBadgeClass(item.status)"
                >
                  {{ item.statusLabel }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-1">
                  <button
                    @click="editBudget(item)"
                    class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Pencil :size="14" />
                  </button>
                  <button
                    @click="viewBudgetDetails(item)"
                    class="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="详情"
                  >
                    <Eye :size="14" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 执行跟踪 -->
    <div v-else-if="activeTab === 'tracking'" class="space-y-4">
      <!-- 月度预算执行 -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900">月度预算执行跟踪</h3>
          <select class="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
            <option>2024年</option>
            <option>2023年</option>
          </select>
        </div>

        <div class="p-6">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-3 font-semibold text-slate-700">月份</th>
                <th class="text-right py-3 font-semibold text-slate-700">月度预算</th>
                <th class="text-right py-3 font-semibold text-slate-700">实际支出</th>
                <th class="text-right py-3 font-semibold text-slate-700">差异</th>
                <th class="text-right py-3 font-semibold text-slate-700">执行率</th>
                <th class="text-center py-3 font-semibold text-slate-700">状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="month in monthlyTracking"
                :key="month.month"
                class="hover:bg-slate-50"
              >
                <td class="py-3 font-medium text-slate-900">{{ month.month }}</td>
                <td class="text-right text-slate-700">¥{{ month.budget.toLocaleString() }}</td>
                <td class="text-right text-slate-700">¥{{ month.actual.toLocaleString() }}</td>
                <td class="text-right" :class="month.variance >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ month.variance >= 0 ? '+' : '' }}¥{{ month.variance.toLocaleString() }}
                </td>
                <td class="text-right">
                  <div class="flex items-center justify-end gap-2">
                    <div class="w-16 bg-slate-200 rounded-full h-2">
                      <div
                        class="h-2 rounded-full"
                        :class="getProgressBarClass(month.rate)"
                        :style="{ width: Math.min(month.rate, 100) + '%' }"
                      />
                    </div>
                    <span class="font-medium">{{ month.rate.toFixed(1) }}%</span>
                  </div>
                </td>
                <td class="text-center">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border"
                    :class="getStatusBadgeClass(month.status)"
                  >
                    {{ month.statusLabel }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 预警信息 -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h4 class="font-bold text-amber-900 mb-3 flex items-center gap-2">
          <AlertCircle :size="18" />
          预算预警
        </h4>
        <div class="space-y-2">
          <div class="flex items-center gap-3 text-sm">
            <div class="w-2 h-2 rounded-full bg-red-500"></div>
            <span class="text-amber-900">【超支预警】市场推广费用已超出预算 15.2%</span>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <div class="w-2 h-2 rounded-full bg-amber-500"></div>
            <span class="text-amber-900">【风险预警】办公费用执行率已达 85%，需控制支出</span>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
            <span class="text-amber-900">【建议】人力成本预算执行率偏低，可适当增加培训投入</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 差异分析 -->
    <div v-else-if="activeTab === 'analysis'" class="space-y-4">
      <!-- 差异分析表 -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
          <h3 class="text-lg font-bold text-slate-900">预算差异分析</h3>
        </div>

        <div class="p-6">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-3 font-semibold text-slate-700">项目</th>
                <th class="text-right py-3 font-semibold text-slate-700">预算</th>
                <th class="text-right py-3 font-semibold text-slate-700">实际</th>
                <th class="text-right py-3 font-semibold text-slate-700">差异额</th>
                <th class="text-right py-3 font-semibold text-slate-700">差异率</th>
                <th class="text-left py-3 font-semibold text-slate-700">原因分析</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="item in varianceAnalysis"
                :key="item.item"
                class="hover:bg-slate-50"
              >
                <td class="py-3 font-medium text-slate-900">{{ item.item }}</td>
                <td class="text-right text-slate-700">¥{{ item.budget.toLocaleString() }}</td>
                <td class="text-right text-slate-700">¥{{ item.actual.toLocaleString() }}</td>
                <td class="text-right font-medium" :class="item.varianceAmount >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ item.varianceAmount >= 0 ? '+' : '' }}¥{{ item.varianceAmount.toLocaleString() }}
                </td>
                <td class="text-right font-medium" :class="item.varianceRate >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ item.varianceRate >= 0 ? '+' : '' }}{{ item.varianceRate.toFixed(1) }}%
                </td>
                <td class="py-3 text-slate-600 text-xs">{{ item.reason }}</td>
              </tr>
            </tbody>
            <tfoot class="bg-gradient-to-r from-teal-50 to-cyan-50">
              <tr class="border-t-2 border-slate-200">
                <td class="py-3 font-bold text-slate-900">合计</td>
                <td class="text-right font-bold text-slate-900">¥{{ totalBudget }}</td>
                <td class="text-right font-bold text-slate-900">¥{{ totalActual }}</td>
                <td class="text-right font-bold" :class="totalVarianceAmount >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ totalVarianceAmount >= 0 ? '+' : '' }}¥{{ totalVarianceAmount.toLocaleString() }}
                </td>
                <td class="text-right font-bold" :class="totalVarianceRate >= 0 ? 'text-green-600' : 'text-red-600'">
                  {{ totalVarianceRate >= 0 ? '+' : '' }}{{ totalVarianceRate.toFixed(1) }}%
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- 差异分析图表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h4 class="font-bold text-slate-900 mb-4">差异额构成</h4>
          <div class="space-y-3">
            <div
              v-for="item in varianceAnalysis.slice(0, 5)"
              :key="item.item"
              class="flex items-center gap-3"
            >
              <div class="w-28 text-sm text-slate-600 truncate">{{ item.item }}</div>
              <div class="flex-1 h-6 bg-slate-100 rounded relative overflow-hidden">
                <div
                  class="h-full absolute top-0"
                  :class="item.varianceAmount >= 0 ? 'bg-green-500' : 'bg-red-500'"
                  :style="{
                    width: Math.abs(item.varianceAmount / 20000 * 100) + '%',
                    left: item.varianceAmount < 0 ? 'auto' : '0',
                    right: item.varianceAmount < 0 ? '0' : 'auto'
                  }"
                />
              </div>
              <div class="w-20 text-right text-sm font-medium" :class="item.varianceAmount >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ item.varianceAmount >= 0 ? '+' : '' }}¥{{ item.varianceAmount.toLocaleString() }}
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h4 class="font-bold text-slate-900 mb-4">改进建议</h4>
          <div class="space-y-3">
            <div class="p-3 bg-green-50 rounded-lg border border-green-200">
              <div class="font-semibold text-green-900 text-sm mb-1">保持良好</div>
              <div class="text-xs text-green-700">人力成本控制良好，建议继续优化人员结构，提升人效</div>
            </div>
            <div class="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div class="font-semibold text-amber-900 text-sm mb-1">需要关注</div>
              <div class="text-xs text-amber-700">市场推广费用超支，建议优化投放渠道，提升ROI</div>
            </div>
            <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div class="font-semibold text-blue-900 text-sm mb-1">优化建议</div>
              <div class="text-xs text-blue-700">办公用品采购建议集中采购，降低单位成本</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预算编辑模态框 -->
    <Teleport to="body">
      <div v-if="showBudgetModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">{{ isEditMode ? '编辑预算' : '新增预算' }}</h3>
            <button @click="showBudgetModal = false" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" class="text-slate-500" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">预算项目 *</label>
              <input
                v-model="budgetForm.name"
                type="text"
                placeholder="请输入预算项目名称"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">类别</label>
                <select
                  v-model="budgetForm.category"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="运营支出">运营支出</option>
                  <option value="人力成本">人力成本</option>
                  <option value="市场推广">市场推广</option>
                  <option value="办公费用">办公费用</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">年度预算 *</label>
                <input
                  v-model="budgetForm.amount"
                  type="number"
                  placeholder="请输入金额"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
              <textarea
                v-model="budgetForm.remark"
                placeholder="请输入备注信息"
                rows="3"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="showBudgetModal = false" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="saveBudget" class="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium transition-colors">
              保存
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  FileSpreadsheet,
  Plus,
  Target,
  Activity,
  Wallet,
  BarChart3,
  Pencil,
  Eye,
  AlertCircle,
  X,
  Trash2
} from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import ConfirmDialog from '../components/shared/ConfirmDialog.vue'
import Toast from '../components/shared/Toast.vue'

interface BudgetTab {
  id: string
  name: string
  icon: any
}

interface BudgetItem {
  id: string
  name: string
  category: string
  budget: number
  executed: number
  remaining: number
  executionRate: number
  status: 'normal' | 'warning' | 'over'
  statusLabel: string
}

interface MonthlyTracking {
  month: string
  budget: number
  actual: number
  variance: number
  rate: number
  status: 'normal' | 'warning' | 'over'
  statusLabel: string
}

interface VarianceAnalysis {
  item: string
  budget: number
  actual: number
  varianceAmount: number
  varianceRate: number
  reason: string
}

const tabs: BudgetTab[] = [
  { id: 'prepare', name: '预算编制', icon: FileSpreadsheet },
  { id: 'tracking', name: '执行跟踪', icon: Activity },
  { id: 'analysis', name: '差异分析', icon: BarChart3 }
]

const activeTab = ref('prepare')
const budgetYear = ref('2024')
const showBudgetModal = ref(false)
const isEditMode = ref(false)

const { toast: toastFunc } = useToast()

const confirm = ref({
  show: false,
  title: '',
  message: '',
  type: 'warning' as 'warning' | 'danger',
  onConfirm: () => {},
  onCancel: () => {}
})

const budgetForm = ref({
  name: '',
  category: '运营支出',
  amount: '',
  remark: ''
})

const annualBudget = ref({
  totalBudget: 1200000,
  executedBudget: 486000
})

const budgetItems = ref<BudgetItem[]>([
  {
    id: '1',
    name: '人力成本',
    category: '人力成本',
    budget: 350000,
    executed: 142800,
    remaining: 207200,
    executionRate: 40.8,
    status: 'normal',
    statusLabel: '正常'
  },
  {
    id: '2',
    name: '市场推广',
    category: '市场推广',
    budget: 180000,
    executed: 207360,
    remaining: -27360,
    executionRate: 115.2,
    status: 'over',
    statusLabel: '超支'
  },
  {
    id: '3',
    name: '办公费用',
    category: '办公费用',
    budget: 80000,
    executed: 68000,
    remaining: 12000,
    executionRate: 85.0,
    status: 'warning',
    statusLabel: '预警'
  },
  {
    id: '4',
    name: '库存采购',
    category: '运营支出',
    budget: 320000,
    executed: 128000,
    remaining: 192000,
    executionRate: 40.0,
    status: 'normal',
    statusLabel: '正常'
  },
  {
    id: '5',
    name: '设备维护',
    category: '运营支出',
    budget: 50000,
    executed: 18400,
    remaining: 31600,
    executionRate: 36.8,
    status: 'normal',
    statusLabel: '正常'
  },
  {
    id: '6',
    name: '场地租金',
    category: '运营支出',
    budget: 220000,
    executed: 110000,
    remaining: 110000,
    executionRate: 50.0,
    status: 'normal',
    statusLabel: '正常'
  }
])

const monthlyTracking = ref<MonthlyTracking[]>([
  { month: '1月', budget: 100000, actual: 96800, variance: 3200, rate: 96.8, status: 'normal', statusLabel: '正常' },
  { month: '2月', budget: 100000, actual: 102400, variance: -2400, rate: 102.4, status: 'warning', statusLabel: '预警' },
  { month: '3月', budget: 100000, actual: 94500, variance: 5500, rate: 94.5, status: 'normal', statusLabel: '正常' },
  { month: '4月', budget: 100000, actual: 98700, variance: 1300, rate: 98.7, status: 'normal', statusLabel: '正常' },
  { month: '5月', budget: 100000, actual: 94300, variance: 5700, rate: 94.3, status: 'normal', statusLabel: '正常' }
])

const varianceAnalysis = ref<VarianceAnalysis[]>([
  {
    item: '人力成本',
    budget: 87000,
    actual: 71400,
    varianceAmount: 15600,
    varianceRate: 17.9,
    reason: '人员优化，效率提升'
  },
  {
    item: '市场推广',
    budget: 45000,
    actual: 51840,
    varianceAmount: -6840,
    varianceRate: -15.2,
    reason: '春节活动投放增加'
  },
  {
    item: '办公费用',
    budget: 20000,
    actual: 18700,
    varianceAmount: 1300,
    varianceRate: 6.5,
    reason: '采购成本降低'
  },
  {
    item: '库存采购',
    budget: 80000,
    actual: 64000,
    varianceAmount: 16000,
    varianceRate: 20.0,
    reason: '采购节奏调整'
  },
  {
    item: '其他费用',
    budget: 8000,
    actual: 9300,
    varianceAmount: -1300,
    varianceRate: -16.3,
    reason: '临时维修支出'
  }
])

const totalBudget = computed(() => varianceAnalysis.value.reduce((sum, item) => sum + item.budget, 0).toLocaleString())
const totalActual = computed(() => varianceAnalysis.value.reduce((sum, item) => sum + item.actual, 0).toLocaleString())
const totalVarianceAmount = computed(() => varianceAnalysis.value.reduce((sum, item) => sum + item.varianceAmount, 0))
const totalVarianceRate = computed(() => {
  const total = varianceAnalysis.value.reduce((sum, item) => sum + item.budget, 0)
  const actual = varianceAnalysis.value.reduce((sum, item) => sum + item.actual, 0)
  return ((actual - total) / total) * 100
})

const getCategoryBadgeClass = (category: string) => {
  const classes: Record<string, string> = {
    '人力成本': 'bg-blue-100 text-blue-800',
    '市场推广': 'bg-pink-100 text-pink-800',
    '办公费用': 'bg-amber-100 text-amber-800',
    '运营支出': 'bg-green-100 text-green-800',
    '其他': 'bg-slate-100 text-slate-800'
  }
  return classes[category] || classes['其他']
}

const getProgressBarClass = (rate: number) => {
  if (rate > 100) return 'bg-red-500'
  if (rate > 85) return 'bg-amber-500'
  return 'bg-green-500'
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    normal: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    over: 'bg-red-100 text-red-800 border-red-200'
  }
  return classes[status] || classes.normal
}

const openBudgetModal = () => {
  isEditMode.value = false
  budgetForm.value = {
    name: '',
    category: '运营支出',
    amount: '',
    remark: ''
  }
  showBudgetModal.value = true
}

const editBudget = (item: BudgetItem) => {
  isEditMode.value = true
  budgetForm.value = {
    name: item.name,
    category: item.category,
    amount: item.budget.toString(),
    remark: ''
  }
  showBudgetModal.value = true
}

const saveBudget = () => {
  if (!budgetForm.value.name || !budgetForm.value.amount) {
    toast.error('请填写必填项')
    return
  }

  if (isEditMode.value) {
    toast.success('预算已更新', `"${budgetForm.value.name}" 预算已更新`)
  } else {
    toast.success('预算已保存', `"${budgetForm.value.name}" 预算已创建`)
  }
  showBudgetModal.value = false
}

const viewBudgetDetails = (item: BudgetItem) => {
  toast.info('预算详情', `${item.name}\n预算: ¥${item.budget.toLocaleString()}\n已执行: ¥${item.executed.toLocaleString()}\n剩余: ¥${item.remaining.toLocaleString()}`)
}

const deleteBudget = (id: string) => {
  const item = budgetItems.value.find(b => b.id === id)
  if (!item) return

  confirm.value = {
    show: true,
    title: '删除预算',
    message: `确定要删除 "${item.name}" 的预算吗？`,
    type: 'danger',
    onConfirm: () => {
      budgetItems.value = budgetItems.value.filter(b => b.id !== id)
      toast.success('删除成功', `预算 "${item.name}" 已删除`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}
</script>
