<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold flex items-center gap-2" :style="{ color: 'var(--text-primary)' }">
        <DollarSign :size="28" style="color: #a855f7;" />
        应收账款管理
      </h1>
      <p class="mt-1" :style="{ color: 'var(--text-secondary)' }">会员欠款、待收费用管理</p>
    </div>

    <!-- Tab 导航 -->
    <div class="flex items-center gap-2" :style="{ borderBottom: '1px solid var(--border)' }">
      <button
        @click="activeTab = 'list'"
        class="px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
        :style="activeTab === 'list'
          ? { borderBottomColor: '#a855f7', color: '#a855f7' }
          : { borderBottomColor: 'transparent', color: 'var(--text-secondary)' }"
      >
        <FileText :size="16" />
        应收列表
      </button>
      <button
        @click="activeTab = 'aging'"
        class="px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
        :style="activeTab === 'aging'
          ? { borderBottomColor: '#a855f7', color: '#a855f7' }
          : { borderBottomColor: 'transparent', color: 'var(--text-secondary)' }"
      >
        <BarChart3 :size="16" />
        账龄分析
      </button>
      <button
        @click="activeTab = 'collection'"
        class="px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
        :style="activeTab === 'collection'
          ? { borderBottomColor: '#a855f7', color: '#a855f7' }
          : { borderBottomColor: 'transparent', color: 'var(--text-secondary)' }"
      >
        <Bell :size="16" />
        催收管理
      </button>
    </div>

    <!-- 应收列表 -->
    <div v-if="activeTab === 'list'" class="space-y-4">
      <!-- 统计概览 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg shadow-purple-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">应收总额</span>
            <DollarSign :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ statistics.totalAmount.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">{{ statistics.totalCount }} 笔应收</div>
        </div>

        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">本月到期</span>
            <Clock :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ statistics.thisMonth.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">{{ statistics.thisMonthCount }} 笔</div>
        </div>

        <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg shadow-red-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">逾期金额</span>
            <AlertCircle :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ statistics.overdueAmount.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">{{ statistics.overdueCount }} 笔逾期</div>
        </div>

        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg shadow-green-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">已收回</span>
            <CheckCircle :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ statistics.paidAmount.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">本月累计</div>
        </div>
      </div>

      <!-- 筛选工具栏 -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div class="flex items-center gap-3 flex-wrap">
          <button
            @click="openPaymentModal"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          >
            <CreditCard :size="16" />
            登记收款
          </button>

          <button
            @click="exportData"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          >
            <Download :size="16" />
            导出数据
          </button>

          <div class="relative flex-1 min-w-[200px]">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" :size="16" />
            <input
              v-model="searchText"
              type="text"
              placeholder="搜索客户姓名、手机号..."
              class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="all">所有状态</option>
            <option value="pending">待收款</option>
            <option value="partial">部分收款</option>
            <option value="paid">已结清</option>
            <option value="overdue">已逾期</option>
          </select>

          <select
            v-model="agingFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="all">所有账龄</option>
            <option value="0-30">0-30天</option>
            <option value="31-60">31-60天</option>
            <option value="61-90">61-90天</option>
            <option value="90+">90天以上</option>
          </select>

          <button
            @click="openPaymentModal"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          >
            <CreditCard :size="16" />
            登记收款
          </button>
        </div>
      </div>

      <!-- 应收账款列表 -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">客户信息</th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">应收金额</th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">已收金额</th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">应收余额</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">账龄</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">到期日</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase">状态</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase w-36">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="item in filteredItems"
              :key="item.id"
              class="hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50/50 transition-colors"
              :class="{ 'bg-red-50/30': item.status === 'overdue' }"
            >
              <td class="px-6 py-4">
                <div>
                  <div class="font-bold text-slate-900">{{ item.clientName }}</div>
                  <div class="text-xs text-slate-500 mt-0.5">{{ item.clientPhone }}</div>
                  <div class="text-xs text-slate-400">类型: {{ item.type }}</div>
                </div>
              </td>
              <td class="px-6 py-4 text-right text-sm text-slate-900">
                ¥{{ item.totalAmount.toLocaleString() }}
              </td>
              <td class="px-6 py-4 text-right text-sm text-green-600 font-medium">
                ¥{{ item.paidAmount.toLocaleString() }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-lg font-bold"
                     :class="item.balance > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'">
                  ¥{{ item.balance.toLocaleString() }}
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="getAgingClass(item.agingDays)"
                >
                  {{ item.agingLabel }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">
                {{ item.dueDate }}
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
                    @click="openRecordModal(item)"
                    class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="收款记录"
                  >
                    <Eye :size="14" />
                  </button>
                  <button
                    v-if="item.balance > 0"
                    @click="openCollectionModal(item)"
                    class="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <CreditCard :size="12" />
                    收款
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 账龄分析 -->
    <div v-else-if="activeTab === 'aging'" class="space-y-6">
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <h3 class="text-lg font-bold text-slate-900 mb-6">账龄分析</h3>

        <!-- 账龄分布图 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="text-sm font-semibold text-slate-700 mb-4">账龄分布</h4>
            <div class="space-y-3">
              <div
                v-for="bucket in agingBuckets"
                :key="bucket.range"
                class="flex items-center gap-3"
              >
                <div class="w-24 text-sm text-slate-600">{{ bucket.range }}</div>
                <div class="flex-1 h-8 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="bucket.color"
                    :style="{ width: bucket.percent + '%' }"
                  />
                </div>
                <div class="w-20 text-right text-sm font-medium" :class="bucket.textColor">
                  ¥{{ bucket.amount.toLocaleString() }}
                </div>
                <div class="w-12 text-xs text-slate-500">{{ bucket.count }}笔</div>
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-sm font-semibold text-slate-700 mb-4">账龄统计</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between py-2 border-b border-slate-100">
                <span class="text-slate-600">平均账龄</span>
                <span class="font-semibold text-slate-900">{{ averageAging }} 天</span>
              </div>
              <div class="flex justify-between py-2 border-b border-slate-100">
                <span class="text-slate-600">最长账龄</span>
                <span class="font-semibold text-red-600">{{ maxAging }} 天</span>
              </div>
              <div class="flex justify-between py-2">
                <span class="text-slate-600">逾期比例</span>
                <span class="font-semibold text-orange-600">{{ overdueRate }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 催收管理 -->
    <div v-else-if="activeTab === 'collection'" class="space-y-6">
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <h3 class="text-lg font-bold text-slate-900 mb-6">催收任务</h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="task in collectionTasks"
            :key="task.id"
            class="p-4 border rounded-xl hover:shadow-md transition-all cursor-pointer"
            :class="getTaskBorderClass(task.priority)"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="p-2 rounded-lg" :class="getTaskIconBg(task.priority)">
                  <Bell :size="18" :class="getTaskIconColor(task.priority)" />
                </div>
                <div>
                  <div class="font-semibold text-slate-900">{{ task.clientName }}</div>
                  <div class="text-xs text-slate-500">欠款: ¥{{ task.amount.toLocaleString() }}</div>
                </div>
              </div>
              <span class="text-xs px-2 py-1 rounded-full" :class="getPriorityBadgeClass(task.priority)">
                {{ task.priorityLabel }}
              </span>
            </div>
            <div class="text-sm text-slate-600 mb-3">{{ task.description }}</div>
            <div class="flex items-center justify-between">
              <span class="text-xs text-slate-400">逾期: {{ task.overdueDays }} 天</span>
              <button
                @click="executeCollection(task)"
                class="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                立即催收
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 收款模态框 -->
    <Teleport to="body">
      <div v-if="showPaymentModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">登记收款</h3>
            <button @click="showPaymentModal = false" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" class="text-slate-500" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">客户 *</label>
              <input
                v-model="paymentForm.clientName"
                type="text"
                placeholder="请输入客户姓名"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">应收金额 *</label>
                <input
                  v-model="paymentForm.amount"
                  type="number"
                  placeholder="请输入金额"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">到期日 *</label>
                <input
                  v-model="paymentForm.dueDate"
                  type="date"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
              <textarea
                v-model="paymentForm.remark"
                placeholder="请输入备注信息"
                rows="3"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="showPaymentModal = false" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="savePayment" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
              保存
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 催收模态框 -->
    <Teleport to="body">
      <div v-if="showCollectionModal && selectedReceivable" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">登记收款</h3>
            <button @click="showCollectionModal = false" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" class="text-slate-500" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div class="bg-slate-50 rounded-lg p-4">
              <div class="flex justify-between mb-2">
                <span class="text-sm text-slate-600">客户</span>
                <span class="font-semibold text-slate-900">{{ selectedReceivable.clientName }}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span class="text-sm text-slate-600">应收金额</span>
                <span class="font-semibold text-slate-900">¥{{ selectedReceivable.totalAmount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-slate-600">应收余额</span>
                <span class="font-bold text-red-600">¥{{ selectedReceivable.balance.toLocaleString() }}</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">收款金额 *</label>
              <input
                v-model="collectionForm.amount"
                type="number"
                :placeholder="`最大可收: ${selectedReceivable.balance}`"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">收款方式</label>
              <select
                v-model="collectionForm.method"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="wechat">微信支付</option>
                <option value="alipay">支付宝</option>
                <option value="bank">银行转账</option>
                <option value="cash">现金</option>
              </select>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="showCollectionModal = false" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="processCollection" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
              确认收款
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'

// 主题相关
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')
import {
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  BarChart3,
  Bell,
  CreditCard,
  Search,
  Eye,
  X,
  Download
} from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import { useToast } from '../composables/useToast'

interface ReceivableItem {
  id: string
  clientName: string
  clientPhone: string
  type: string
  totalAmount: number
  paidAmount: number
  balance: number
  agingDays: number
  agingLabel: string
  dueDate: string
  status: 'pending' | 'partial' | 'paid' | 'overdue'
  statusLabel: string
}

interface CollectionTask {
  id: string
  clientName: string
  amount: number
  priority: 'high' | 'medium' | 'low'
  priorityLabel: string
  description: string
  overdueDays: number
}

type TabType = 'list' | 'aging' | 'collection'

const activeTab = ref<TabType>('list')
const searchText = ref('')
const statusFilter = ref<string>('all')
const agingFilter = ref<string>('all')
const showPaymentModal = ref(false)
const showCollectionModal = ref(false)
const selectedReceivable = ref<ReceivableItem | null>(null)
const { toast: toastFunc } = useToast()

const paymentForm = ref({
  clientName: '',
  amount: '',
  dueDate: '',
  remark: ''
})

const collectionForm = ref({
  amount: '',
  method: 'wechat'
})

const receivables = ref<ReceivableItem[]>([
  {
    id: 'AR001',
    clientName: '王芳',
    clientPhone: '138****1234',
    type: '课程费',
    totalAmount: 6800,
    paidAmount: 0,
    balance: 6800,
    agingDays: 45,
    agingLabel: '31-60天',
    dueDate: '2024-01-15',
    status: 'overdue',
    statusLabel: '已逾期'
  },
  {
    id: 'AR002',
    clientName: '李明',
    clientPhone: '139****5678',
    type: '私教费',
    totalAmount: 12000,
    paidAmount: 4000,
    balance: 8000,
    agingDays: 20,
    agingLabel: '0-30天',
    dueDate: '2024-02-10',
    status: 'partial',
    statusLabel: '部分收款'
  },
  {
    id: 'AR003',
    clientName: '张伟',
    clientPhone: '136****9012',
    type: '产品费',
    totalAmount: 3200,
    paidAmount: 0,
    balance: 3200,
    agingDays: 15,
    agingLabel: '0-30天',
    dueDate: '2024-02-20',
    status: 'pending',
    statusLabel: '待收款'
  },
  {
    id: 'AR004',
    clientName: '刘洋',
    clientPhone: '137****3456',
    type: '会员费',
    totalAmount: 5000,
    paidAmount: 5000,
    balance: 0,
    agingDays: 0,
    agingLabel: '0-30天',
    dueDate: '2024-02-18',
    status: 'paid',
    statusLabel: '已结清'
  },
  {
    id: 'AR005',
    clientName: '陈静',
    clientPhone: '135****7890',
    type: '课程费',
    totalAmount: 9600,
    paidAmount: 0,
    balance: 9600,
    agingDays: 95,
    agingLabel: '90天以上',
    dueDate: '2023-11-20',
    status: 'overdue',
    statusLabel: '已逾期'
  }
])

const collectionTasks = ref<CollectionTask[]>([
  {
    id: 'CT001',
    clientName: '王芳',
    amount: 6800,
    priority: 'high',
    priorityLabel: '紧急',
    description: '45天未联系，需立即跟进',
    overdueDays: 45
  },
  {
    id: 'CT002',
    clientName: '陈静',
    amount: 9600,
    priority: 'high',
    priorityLabel: '紧急',
    description: '95天严重逾期，启动法律程序',
    overdueDays: 95
  },
  {
    id: 'CT003',
    clientName: '张伟',
    amount: 3200,
    priority: 'medium',
    priorityLabel: '一般',
    description: '15天即将到期，提前跟进',
    overdueDays: 15
  }
])

const statistics = computed(() => {
  const totalAmount = receivables.value.reduce((sum, item) => sum + item.totalAmount, 0)
  const paidAmount = receivables.value.reduce((sum, item) => sum + item.paidAmount, 0)
  const balance = receivables.value.reduce((sum, item) => sum + item.balance, 0)
  const thisMonthItems = receivables.value
    .filter(item => {
      const days = new Date(item.dueDate).getTime() - Date.now()
      const daysDiff = Math.ceil(days / (1000 * 60 * 60 * 24))
      return daysDiff >= 0 && daysDiff <= 30
    })
  const thisMonth = thisMonthItems.reduce((sum, item) => sum + item.balance, 0)
  const thisMonthCount = thisMonthItems.length
  const overdueItems = receivables.value.filter(item => item.status === 'overdue')
  const overdueAmount = overdueItems.reduce((sum, item) => sum + item.balance, 0)

  return {
    totalAmount,
    paidAmount,
    balance,
    thisMonth,
    thisMonthCount,
    overdueAmount,
    overdueCount: overdueItems.length,
    totalCount: receivables.value.length
  }
})

const filteredItems = computed(() => {
  return receivables.value.filter(item => {
    const matchSearch = !searchText.value ||
      item.clientName.includes(searchText.value) ||
      item.clientPhone.includes(searchText.value)

    const matchStatus = statusFilter.value === 'all' || item.status === statusFilter.value

    let matchAging = true
    if (agingFilter.value !== 'all') {
      const aging = item.agingDays
      switch (agingFilter.value) {
        case '0-30':
          matchAging = aging <= 30
          break
        case '31-60':
          matchAging = aging > 30 && aging <= 60
          break
        case '61-90':
          matchAging = aging > 60 && aging <= 90
          break
        case '90+':
          matchAging = aging > 90
          break
      }
    }

    return matchSearch && matchStatus && matchAging
  })
})

const agingBuckets = computed(() => {
  const buckets = [
    { range: '0-30天', count: 0, amount: 0, percent: 0, color: 'bg-green-500', textColor: 'text-green-600' },
    { range: '31-60天', count: 0, amount: 0, percent: 0, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    { range: '61-90天', count: 0, amount: 0, percent: 0, color: 'bg-orange-500', textColor: 'text-orange-600' },
    { range: '90天以上', count: 0, amount: 0, percent: 0, color: 'bg-red-500', textColor: 'text-red-600' }
  ]

  const totalAmount = receivables.value.reduce((sum, item) => sum + item.balance, 0)

  receivables.value.forEach(item => {
    const aging = item.agingDays
    if (aging <= 30) {
      buckets[0].count++
      buckets[0].amount += item.balance
    } else if (aging <= 60) {
      buckets[1].count++
      buckets[1].amount += item.balance
    } else if (aging <= 90) {
      buckets[2].count++
      buckets[2].amount += item.balance
    } else {
      buckets[3].count++
      buckets[3].amount += item.balance
    }
  })

  buckets.forEach(bucket => {
    bucket.percent = totalAmount > 0 ? Math.round((bucket.amount / totalAmount) * 100) : 0
  })

  return buckets
})

const averageAging = computed(() => {
  const total = receivables.value.length
  if (total === 0) return 0
  const sum = receivables.value.reduce((sum, item) => sum + item.agingDays, 0)
  return Math.round(sum / total)
})

const maxAging = computed(() => {
  return Math.max(...receivables.value.map(item => item.agingDays))
})

const overdueRate = computed(() => {
  const total = receivables.value.length
  if (total === 0) return 0
  const overdue = receivables.value.filter(item => item.status === 'overdue').length
  return Math.round((overdue / total) * 100)
})

const getAgingClass = (days: number) => {
  if (days <= 30) return 'bg-green-100 text-green-700 border-green-200'
  if (days <= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  if (days <= 90) return 'bg-orange-100 text-orange-700 border-orange-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-800 border-blue-200',
    partial: 'bg-amber-100 text-amber-800 border-amber-200',
    paid: 'bg-green-100 text-green-800 border-green-200',
    overdue: 'bg-red-100 text-red-800 border-red-200'
  }
  return classes[status] || classes.pending
}

const getTaskBorderClass = (priority: string) => {
  const classes: Record<string, string> = {
    high: 'border-red-300 bg-red-50',
    medium: 'border-yellow-300 bg-yellow-50',
    low: 'border-slate-300 bg-slate-50'
  }
  return classes[priority] || classes.low
}

const getTaskIconBg = (priority: string) => {
  const classes: Record<string, string> = {
    high: 'bg-red-100',
    medium: 'bg-yellow-100',
    low: 'bg-slate-100'
  }
  return classes[priority] || classes.low
}

const getTaskIconColor = (priority: string) => {
  const classes: Record<string, string> = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-slate-600'
  }
  return classes[priority] || classes.low
}

const getPriorityBadgeClass = (priority: string) => {
  const classes: Record<string, string> = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-slate-100 text-slate-600'
  }
  return classes[priority] || classes.low
}

const openPaymentModal = () => {
  paymentForm.value = {
    clientName: '',
    amount: '',
    dueDate: '',
    remark: ''
  }
  showPaymentModal.value = true
}

const savePayment = () => {
  if (!paymentForm.value.clientName || !paymentForm.value.amount || !paymentForm.value.dueDate) {
    toastFunc.error('请填写必填项')
    return
  }

  const newItem: ReceivableItem = {
    id: `AR${String(receivables.value.length + 1).padStart(3, '0')}`,
    clientName: paymentForm.value.clientName,
    clientPhone: '138****0000',
    type: '其他',
    totalAmount: parseFloat(paymentForm.value.amount),
    paidAmount: 0,
    balance: parseFloat(paymentForm.value.amount),
    agingDays: 0,
    agingLabel: '0-30天',
    dueDate: paymentForm.value.dueDate,
    status: 'pending',
    statusLabel: '待收款'
  }

  receivables.value.unshift(newItem)
  showPaymentModal.value = false
  toastFunc.success('应收账款已添加')
}

const openRecordModal = (item: ReceivableItem) => {
  toastFunc.info('收款记录', `${item.clientName} 的收款记录功能开发中`)
}

const openCollectionModal = (item: ReceivableItem) => {
  selectedReceivable.value = item
  collectionForm.value = {
    amount: '',
    method: 'wechat'
  }
  showCollectionModal.value = true
}

const processCollection = () => {
  if (!selectedReceivable.value || !collectionForm.value.amount) {
    toastFunc.error('请输入收款金额')
    return
  }

  const amount = parseFloat(collectionForm.value.amount)
  if (amount > selectedReceivable.value.balance) {
    toastFunc.error('收款金额不能超过应收余额')
    return
  }

  receivables.value = receivables.value.map(item =>
    item.id === selectedReceivable.value!.id
      ? {
          ...item,
          paidAmount: item.paidAmount + amount,
          balance: item.balance - amount,
          status: item.balance - amount === 0 ? 'paid' : 'partial',
          statusLabel: item.balance - amount === 0 ? '已结清' : '部分收款'
        }
      : item
  )

  showCollectionModal.value = false
  const clientName = selectedReceivable.value.clientName
  selectedReceivable.value = null
  toastFunc.success('收款已登记', `已登记 ${clientName} 的 ¥${amount.toLocaleString()} 收款`)
}

const executeCollection = (task: CollectionTask) => {
  toastFunc.info('催收任务', `已创建 ${task.clientName} 的催收任务，逾期 ${task.overdueDays} 天`)
}

// 导出数据
const exportData = () => {
  toastFunc.info('导出中', '正在导出应收账款数据...')

  try {
    const exportData = filteredItems.value.map(item => ({
      '应收单号': item.id,
      '客户姓名': item.clientName,
      '客户手机': item.clientPhone,
      '费用类型': item.type,
      '应收金额': item.totalAmount,
      '已收金额': item.paidAmount,
      '应收余额': item.balance,
      '账龄': item.agingLabel,
      '账龄天数': item.agingDays,
      '到期日': item.dueDate,
      '状态': item.statusLabel
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    ws['!cols'] = [
      { wch: 15 }, // 应收单号
      { wch: 12 }, // 客户姓名
      { wch: 15 }, // 客户手机
      { wch: 12 }, // 费用类型
      { wch: 12 }, // 应收金额
      { wch: 12 }, // 已收金额
      { wch: 12 }, // 应收余额
      { wch: 10 }, // 账龄
      { wch: 10 }, // 账龄天数
      { wch: 12 }, // 到期日
      { wch: 10 }  // 状态
    ]

    XLSX.utils.book_append_sheet(wb, ws, '应收账款')

    const fileName = `应收账款_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    toastFunc.success('导出成功', `已导出 ${filteredItems.value.length} 条应收记录`)
  } catch (error) {
    console.error('导出失败:', error)
    toastFunc.error('导出失败', '导出应收账款时发生错误')
  }
}
</script>
