<template>
  <div class="space-y-6">
    <!-- Breadcrumb with Back Button -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          @click="router.push('/procurement')"
          class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm"
          :style="{
            border: '1px solid var(--border)',
            background: 'var(--card)',
            color: 'var(--text-secondary)'
          }"
          @mouseenter="$event.currentTarget.style.backgroundColor = 'var(--fill-light)'"
          @mouseleave="$event.currentTarget.style.backgroundColor = 'var(--card)'"
        >
          <ArrowLeft :size="16" />
          返回
        </button>
        <div class="flex items-center gap-2 text-sm" :style="{ color: 'var(--text-secondary)' }">
          <span>采购管理</span>
          <ChevronRight :size="14" />
          <span :style="{ color: 'var(--text-primary)', fontWeight: 500 }">采购申请</span>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="rounded-2xl p-6 shadow-lg" :style="{
      background: isBlackGold.value ? 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)' : 'linear-gradient(to right, #1e293b, #0f172a)',
      color: 'white'
    }">
      <div class="flex items-center gap-3 mb-2">
        <div class="p-2 rounded-lg backdrop-blur-sm" :style="{ background: 'rgba(255, 255, 255, 0.2)' }">
          <FileText :size="24" />
        </div>
        <div>
          <h1 class="text-2xl font-bold">采购申请</h1>
          <p class="text-sm" :style="{ color: 'rgba(255, 255, 255, 0.7)' }">
            创建和管理采购申请单
          </p>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="rounded-xl p-4 shadow-sm" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">待审批</p>
            <p class="text-2xl font-bold mt-1 text-yellow-600">{{ stats.pending }}</p>
          </div>
          <div class="p-3 rounded-lg bg-yellow-50">
            <Clock :size="24" class="text-yellow-600" />
          </div>
        </div>
      </div>
      <div class="rounded-xl p-4 shadow-sm" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">本月已通过</p>
            <p class="text-2xl font-bold mt-1 text-green-600">{{ stats.approved }}</p>
          </div>
          <div class="p-3 rounded-lg bg-green-50">
            <CheckCircle :size="24" class="text-green-600" />
          </div>
        </div>
      </div>
      <div class="rounded-xl p-4 shadow-sm" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">本月已驳回</p>
            <p class="text-2xl font-bold mt-1 text-red-600">{{ stats.rejected }}</p>
          </div>
          <div class="p-3 rounded-lg bg-red-50">
            <XCircle :size="24" class="text-red-600" />
          </div>
        </div>
      </div>
      <div class="rounded-xl p-4 shadow-sm" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">预算总额</p>
            <p class="text-2xl font-bold mt-1" :style="{ color: 'var(--text-primary)' }">¥{{ formatNumber(stats.totalBudget) }}</p>
          </div>
          <div class="p-3 rounded-lg bg-blue-50">
            <DollarSign :size="24" class="text-blue-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Actions -->
    <div class="rounded-xl shadow-sm p-4" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2" :size="18" :style="{ color: 'var(--text-placeholder)' }" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索申请单号、申请人..."
              class="pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 w-64 text-sm"
              :style="{
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--text-primary)',
                '--tw-ring-color': isBlackGold.value ? 'rgba(184, 134, 11, 0.5)' : 'rgba(79, 70, 229, 0.5)'
              }"
            />
          </div>
          <select
            v-model="statusFilter"
            class="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
            :style="{
              border: '1px solid var(--border)',
              background: 'var(--background)',
              color: 'var(--text-primary)'
            }"
          >
            <option value="all">全部状态</option>
            <option value="draft">草稿</option>
            <option value="pending">待审批</option>
            <option value="approved">已通过</option>
            <option value="rejected">已驳回</option>
          </select>
        </div>
        <button
          @click="openCreateDialog"
          class="px-4 py-2 text-white rounded-lg flex items-center gap-2 text-sm"
          :style="{
            background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5'
          }"
        >
          <Plus :size="16" />
          新建申请
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-xl shadow-sm overflow-hidden" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
      <table class="w-full text-left">
        <thead :style="{
          background: 'var(--fill-light)',
          borderBottom: '1px solid var(--border)'
        }">
          <tr>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">申请单号</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">申请人</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">部门</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">申请金额</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">申请日期</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">状态</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase text-right" :style="{ color: 'var(--text-secondary)' }">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in filteredRequests" :key="request.id" :style="{ borderBottom: '1px solid var(--border-lighter)' }">
            <td class="px-6 py-4">
              <span class="font-mono text-sm font-medium" :style="{ color: 'var(--text-primary)' }">{{ request.requestNo }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white" :style="{ background: 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' }">
                  {{ request.requester.slice(0, 1) }}
                </div>
                <span class="text-sm" :style="{ color: 'var(--text-primary)' }">{{ request.requester }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-secondary)' }">{{ request.department }}</td>
            <td class="px-6 py-4 text-sm font-medium" :style="{ color: 'var(--text-primary)' }">¥{{ formatNumber(request.totalBudget) }}</td>
            <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-secondary)' }">{{ request.requestDate }}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 rounded-full text-xs font-medium" :style="getStatusStyle(request.status)">
                {{ REQUEST_STATUS_LABELS[request.status].label }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-1">
                <button
                  @click="viewRequest(request)"
                  class="p-2 rounded-lg transition-colors"
                  :style="{ color: 'var(--text-secondary)' }"
                  title="查看"
                >
                  <Eye :size="16" />
                </button>
                <button
                  v-if="request.status === 'draft' || request.status === 'rejected'"
                  @click="editRequest(request)"
                  class="p-2 rounded-lg transition-colors"
                  :style="{ color: 'var(--text-secondary)' }"
                  title="编辑"
                >
                  <Edit :size="16" />
                </button>
                <button
                  v-if="request.status === 'pending'"
                  @click="approveRequest(request)"
                  class="p-2 rounded-lg transition-colors"
                  :style="{ color: '#16a34a' }"
                  title="审批通过"
                >
                  <Check :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredRequests.length === 0" class="py-12 text-center" :style="{ color: 'var(--text-disabled)' }">
        <FileText :size="48" class="mx-auto mb-4 opacity-50" />
        <p>暂无采购申请</p>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <Teleport to="body">
      <div v-if="showDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" :style="{ background: 'var(--card)' }">
          <div class="px-6 py-4 sticky top-0 z-10 flex items-center justify-between" :style="{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }">
            <h3 class="text-lg font-bold" :style="{ color: 'var(--text-primary)' }">
              {{ editingRequest ? '编辑采购申请' : '新建采购申请' }}
            </h3>
            <button @click="showDialog = false" class="p-1 rounded-lg transition-colors" :style="{ color: 'var(--text-secondary)' }">
              <X :size="20" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- 基本信息 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">申请人 *</label>
                <input v-model="form.requester" type="text" class="w-full px-3 py-2 rounded-lg text-sm" :style="inputStyle" />
              </div>
              <div>
                <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">部门 *</label>
                <input v-model="form.department" type="text" class="w-full px-3 py-2 rounded-lg text-sm" :style="inputStyle" />
              </div>
              <div>
                <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">申请类型</label>
                <select v-model="form.type" class="w-full px-3 py-2 rounded-lg text-sm" :style="inputStyle">
                  <option value="normal">正常采购</option>
                  <option value="urgent">紧急采购</option>
                </select>
              </div>
              <div>
                <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">申请日期</label>
                <input v-model="form.requestDate" type="date" class="w-full px-3 py-2 rounded-lg text-sm" :style="inputStyle" />
              </div>
            </div>

            <!-- 采购用途 -->
            <div>
              <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">采购用途 *</label>
              <textarea v-model="form.purpose" placeholder="请说明采购用途" rows="2" class="w-full px-3 py-2 rounded-lg text-sm resize-none" :style="inputStyle"></textarea>
            </div>

            <!-- 采购明细 -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-sm font-medium" :style="{ color: 'var(--text-primary)' }">采购明细</label>
                <button @click="addItem" class="px-2 py-1 text-xs rounded flex items-center gap-1" :style="{ background: 'var(--fill-light)', color: 'var(--text-secondary)' }">
                  <Plus :size="12" /> 添加明细
                </button>
              </div>
              <div class="space-y-2">
                <div v-for="(item, index) in form.items" :key="index" class="flex gap-2 items-start">
                  <input v-model="item.productName" placeholder="商品名称" class="flex-1 px-2 py-1.5 rounded text-sm" :style="inputStyle" />
                  <input v-model="item.specification" placeholder="规格" class="w-24 px-2 py-1.5 rounded text-sm" :style="inputStyle" />
                  <input v-model.number="item.quantity" type="number" placeholder="数量" class="w-20 px-2 py-1.5 rounded text-sm" :style="inputStyle" />
                  <input v-model.number="item.budgetPrice" type="number" placeholder="预算单价" class="w-24 px-2 py-1.5 rounded text-sm" :style="inputStyle" />
                  <button @click="removeItem(index)" class="p-1.5 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>
              <div class="mt-2 flex justify-end">
                <span class="text-sm" :style="{ color: 'var(--text-secondary)' }">
                  预算总额: <span class="font-bold" :style="{ color: 'var(--text-primary)' }">¥{{ formatNumber(totalBudget) }}</span>
                </span>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 flex items-center justify-end gap-3" :style="{ borderTop: '1px solid var(--border)' }">
            <button v-if="!editingRequest" @click="saveAsDraft" class="px-4 py-2 rounded-lg text-sm" :style="{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }">保存草稿</button>
            <button @click="submitRequest" class="px-4 py-2 text-white rounded-lg text-sm" :style="{ background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5' }">提交审批</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Detail Dialog -->
    <Teleport to="body">
      <div v-if="showDetailDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" :style="{ background: 'var(--card)' }">
          <div class="px-6 py-4 sticky top-0 z-10 flex items-center justify-between" :style="{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }">
            <h3 class="text-lg font-bold" :style="{ color: 'var(--text-primary)' }">采购申请详情</h3>
            <button @click="showDetailDialog = false" class="p-1 rounded-lg transition-colors" :style="{ color: 'var(--text-secondary)' }">
              <X :size="20" />
            </button>
          </div>

          <div v-if="viewingRequest" class="p-6 space-y-6">
            <!-- 基本信息 -->
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="mb-1" :style="{ color: 'var(--text-secondary)' }">申请单号</p>
                <p class="font-mono font-medium" :style="{ color: 'var(--text-primary)' }">{{ viewingRequest.requestNo }}</p>
              </div>
              <div>
                <p class="mb-1" :style="{ color: 'var(--text-secondary)' }">申请日期</p>
                <p :style="{ color: 'var(--text-primary)' }">{{ viewingRequest.requestDate }}</p>
              </div>
              <div>
                <p class="mb-1" :style="{ color: 'var(--text-secondary)' }">申请人</p>
                <p :style="{ color: 'var(--text-primary)' }">{{ viewingRequest.requester }}</p>
              </div>
              <div>
                <p class="mb-1" :style="{ color: 'var(--text-secondary)' }">部门</p>
                <p :style="{ color: 'var(--text-primary)' }">{{ viewingRequest.department }}</p>
              </div>
            </div>

            <!-- 采购用途 -->
            <div>
              <p class="text-sm font-medium mb-2" :style="{ color: 'var(--text-primary)' }">采购用途</p>
              <p class="text-sm rounded-lg p-3" :style="{ background: 'var(--fill-light)', color: 'var(--text-secondary)' }">{{ viewingRequest.purpose }}</p>
            </div>

            <!-- 采购明细 -->
            <div>
              <p class="text-sm font-medium mb-2" :style="{ color: 'var(--text-primary)' }">采购明细</p>
              <div class="rounded-lg overflow-hidden" :style="{ border: '1px solid var(--border)' }">
                <table class="w-full text-sm text-left">
                  <thead :style="{ background: 'var(--fill-light)' }">
                    <tr>
                      <th class="px-4 py-2" :style="{ color: 'var(--text-secondary)' }">商品名称</th>
                      <th class="px-4 py-2" :style="{ color: 'var(--text-secondary)' }">规格</th>
                      <th class="px-4 py-2 text-right" :style="{ color: 'var(--text-secondary)' }">数量</th>
                      <th class="px-4 py-2 text-right" :style="{ color: 'var(--text-secondary)' }">预算单价</th>
                      <th class="px-4 py-2 text-right" :style="{ color: 'var(--text-secondary)' }">预算金额</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in viewingRequest.items" :key="item.id" :style="{ borderBottom: '1px solid var(--border-lighter)' }">
                      <td class="px-4 py-2" :style="{ color: 'var(--text-primary)' }">{{ item.productName }}</td>
                      <td class="px-4 py-2" :style="{ color: 'var(--text-secondary)' }">{{ item.specification }}</td>
                      <td class="px-4 py-2 text-right" :style="{ color: 'var(--text-primary)' }">{{ item.quantity }}</td>
                      <td class="px-4 py-2 text-right" :style="{ color: 'var(--text-primary)' }">¥{{ item.budgetPrice }}</td>
                      <td class="px-4 py-2 text-right font-medium" :style="{ color: 'var(--text-primary)' }">¥{{ (item.quantity * item.budgetPrice).toLocaleString() }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="mt-2 flex justify-end">
                <span class="text-sm">预算总额: <span class="font-bold" :style="{ color: isBlackGold.value ? '#D4A84A' : '#4f46e5' }">¥{{ formatNumber(viewingRequest.totalBudget) }}</span></span>
              </div>
            </div>

            <!-- 审批信息 -->
            <div v-if="viewingRequest.status !== 'draft'">
              <p class="text-sm font-medium mb-2" :style="{ color: 'var(--text-primary)' }">审批信息</p>
              <div class="space-y-2 text-sm">
                <div class="flex items-center gap-2">
                  <span :style="{ color: 'var(--text-secondary)' }">审批人:</span>
                  <span :style="{ color: 'var(--text-primary)' }">{{ viewingRequest.approver || '-' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span :style="{ color: 'var(--text-secondary)' }">审批时间:</span>
                  <span :style="{ color: 'var(--text-primary)' }">{{ viewingRequest.approveTime || '-' }}</span>
                </div>
                <div v-if="viewingRequest.approveComment" class="flex items-start gap-2">
                  <span :style="{ color: 'var(--text-secondary)' }">审批意见:</span>
                  <span :style="{ color: 'var(--text-primary)' }">{{ viewingRequest.approveComment }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../../composables/useTheme'
import { useToast } from '../../composables/useToast'
import {
  FileText,
  Search,
  Plus,
  Edit,
  Eye,
  X,
  CheckCircle,
  Clock,
  Check,
  XCircle,
  DollarSign,
  Trash2,
  ChevronRight,
  ArrowLeft
} from 'lucide-vue-next'
import type { PurchaseRequest, RequestStatus } from '../../types/procurement'
import { REQUEST_STATUS_LABELS } from '../../types/procurement'

const router = useRouter()
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')
const toast = useToast()

// Filters
const searchQuery = ref('')
const statusFilter = ref<string>('all')

// Dialog states
const showDialog = ref(false)
const showDetailDialog = ref(false)
const editingRequest = ref<PurchaseRequest | null>(null)
const viewingRequest = ref<PurchaseRequest | null>(null)

// 组件卸载前清理
onBeforeUnmount(() => {
  showDialog.value = false
  showDetailDialog.value = false
  editingRequest.value = null
  viewingRequest.value = null
})

// Form
const form = ref({
  requester: '张三',
  department: '运营部',
  type: 'normal' as 'normal' | 'urgent',
  requestDate: new Date().toISOString().split('T')[0],
  purpose: '',
  items: [
    { productName: '', specification: '', quantity: 1, budgetPrice: 0, id: '', remark: '' }
  ]
})

// Mock data
const requests = ref<PurchaseRequest[]>([
  {
    id: '1',
    requestNo: 'PR20260318001',
    requester: '张三',
    requesterId: 'U001',
    department: '运营部',
    requestDate: '2026-03-18',
    type: 'normal',
    items: [
      { id: '1', productId: 'P001', productName: '血糖仪', specification: '家用型', unit: '台', quantity: 10, budgetPrice: 150, budgetAmount: 1500, remark: '' }
    ],
    totalBudget: 1500,
    purpose: '门店销售使用',
    status: 'pending',
    createdAt: '2026-03-18'
  },
  {
    id: '2',
    requestNo: 'PR20260317001',
    requester: '李四',
    requesterId: 'U002',
    department: '市场部',
    requestDate: '2026-03-17',
    type: 'urgent',
    items: [
      { id: '1', productId: 'P002', productName: '血压计', specification: '电子上臂式', unit: '台', quantity: 5, budgetPrice: 120, budgetAmount: 600, remark: '' }
    ],
    totalBudget: 600,
    purpose: '活动促销急需',
    status: 'approved',
    approver: '王经理',
    approveTime: '2026-03-17 14:30:00',
    createdAt: '2026-03-17'
  }
])

// Stats
const stats = computed(() => ({
  pending: requests.value.filter(r => r.status === 'pending').length,
  approved: requests.value.filter(r => r.status === 'approved').length,
  rejected: requests.value.filter(r => r.status === 'rejected').length,
  totalBudget: requests.value.reduce((sum, r) => sum + r.totalBudget, 0)
}))

// Filtered requests
const filteredRequests = computed(() => {
  return requests.value.filter(r => {
    const matchesSearch = r.requestNo.includes(searchQuery.value) || r.requester.includes(searchQuery.value)
    const matchesStatus = statusFilter.value === 'all' || r.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

// Computed
const totalBudget = computed(() => {
  return form.value.items.reduce((sum, item) => sum + (item.quantity * item.budgetPrice), 0)
})

// Input style
const inputStyle = computed(() => ({
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--text-primary)'
}))

// Methods
const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN')
}

const getStatusStyle = (status: RequestStatus) => {
  const style = REQUEST_STATUS_LABELS[status]
  return {
    background: style.color === 'green' ? 'rgba(34, 197, 94, 0.1)' :
               style.color === 'red' ? 'rgba(239, 68, 68, 0.1)' :
               style.color === 'yellow' ? 'rgba(234, 179, 8, 0.1)' :
               'rgba(107, 114, 128, 0.1)',
    color: style.color === 'green' ? '#16a34a' :
           style.color === 'red' ? '#dc2626' :
           style.color === 'yellow' ? '#ca8a04' :
           '#6b7280'
  }
}

const openCreateDialog = () => {
  editingRequest.value = null
  form.value = {
    requester: '张三',
    department: '运营部',
    type: 'normal',
    requestDate: new Date().toISOString().split('T')[0],
    purpose: '',
    items: [{ productName: '', specification: '', quantity: 1, budgetPrice: 0, id: '', remark: '' }]
  }
  showDialog.value = true
}

const editRequest = (request: PurchaseRequest) => {
  editingRequest.value = request
  form.value = {
    requester: request.requester,
    department: request.department,
    type: request.type,
    requestDate: request.requestDate,
    purpose: request.purpose,
    items: [...request.items]
  }
  showDialog.value = true
}

const viewRequest = (request: PurchaseRequest) => {
  viewingRequest.value = request
  showDetailDialog.value = true
}

const addItem = () => {
  form.value.items.push({ productName: '', specification: '', quantity: 1, budgetPrice: 0, id: '', remark: '' })
}

const removeItem = (index: number) => {
  form.value.items.splice(index, 1)
}

const saveAsDraft = () => {
  if (!form.value.purpose) {
    toast.error('验证失败', '请填写采购用途')
    return
  }
  toast.success('保存成功', '草稿已保存')
  showDialog.value = false
}

const submitRequest = () => {
  if (!form.value.purpose || form.value.items.some(i => !i.productName)) {
    toast.error('验证失败', '请填写完整信息')
    return
  }

  const newRequest: PurchaseRequest = {
    id: `request-${Date.now()}`,
    requestNo: `PR${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    requester: form.value.requester,
    requesterId: 'U001',
    department: form.value.department,
    requestDate: form.value.requestDate,
    type: form.value.type,
    purpose: form.value.purpose,
    items: form.value.items.map((item, i) => ({
      id: `${Date.now()}-${i}`,
      productId: '',
      productName: item.productName,
      specification: item.specification,
      unit: '件',
      quantity: item.quantity,
      budgetPrice: item.budgetPrice,
      budgetAmount: item.quantity * item.budgetPrice,
      remark: ''
    })),
    totalBudget: totalBudget.value,
    status: 'pending',
    createdAt: new Date().toISOString()
  }

  requests.value.unshift(newRequest)
  toast.success('提交成功', '采购申请已提交审批')
  showDialog.value = false
}

const approveRequest = (request: PurchaseRequest) => {
  request.status = 'approved'
  request.approver = '当前用户'
  request.approveTime = new Date().toLocaleString('zh-CN')
  toast.success('审批通过', '采购申请已通过')
}
</script>
