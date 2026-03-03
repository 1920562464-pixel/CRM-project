<template>
  <div class="min-h-screen bg-slate-50">
    <!-- 页面标题 -->
    <div class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">我的报销</h1>
            <p class="text-sm text-slate-500 mt-1">管理和查看我的报销申请</p>
          </div>
          <button
            @click="createNew"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          >
            <Plus :size="18" />
            发起报销
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-5xl mx-auto px-6 py-6">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-slate-500">待审批</p>
              <p class="text-xl font-bold text-slate-900 mt-1">{{ statistics.pendingCount }}</p>
            </div>
            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock :size="20" class="text-amber-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-slate-500">本月总额</p>
              <p class="text-xl font-bold text-slate-900 mt-1">¥{{ statistics.monthlyTotal.toLocaleString() }}</p>
            </div>
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign :size="20" class="text-blue-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-slate-500">已支付</p>
              <p class="text-xl font-bold text-slate-900 mt-1">¥{{ statistics.paidTotal.toLocaleString() }}</p>
            </div>
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle :size="20" class="text-green-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs text-slate-500">总笔数</p>
              <p class="text-xl font-bold text-slate-900 mt-1">{{ statistics.totalCount }}</p>
            </div>
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText :size="20" class="text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选和搜索 -->
      <div class="bg-white rounded-lg border border-slate-200 px-4 py-3 shadow-sm mb-6">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="relative flex-1 min-w-[240px]">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
            <input
              v-model="searchText"
              type="text"
              placeholder="搜索编号、标题..."
              class="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <select
            v-model="typeFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            <option value="">所有类型</option>
            <option value="purchase">采购报销</option>
            <option value="transport">交通费</option>
            <option value="meal">餐费</option>
            <option value="training">培训费</option>
            <option value="other">其他</option>
          </select>

          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
          >
            <option value="">所有状态</option>
            <option value="draft">草稿</option>
            <option value="submitted">已提交</option>
            <option value="approved">已审批</option>
            <option value="paid">已支付</option>
            <option value="rejected">已拒绝</option>
          </select>

          <button
            @click="exportData"
            class="px-3 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm transition-colors"
          >
            <Download :size="14" />
            导出
          </button>
        </div>
      </div>

      <!-- 报销列表 - 卡片式布局 -->
      <div v-if="filteredReimbursements.length > 0" class="space-y-3">
        <div
          v-for="item in filteredReimbursements"
          :key="item.id"
          @click="viewDetail(item)"
          class="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <!-- 状态标签 -->
              <span
                :class="`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                  item.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                  item.status === 'submitted' ? 'bg-amber-100 text-amber-700' :
                  item.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                  item.status === 'paid' ? 'bg-green-100 text-green-700' :
                  item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-600'
                }`"
              >
                {{ getStatusName(item.status) }}
              </span>

              <!-- 标题和编号 -->
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-semibold text-slate-900 truncate">{{ item.title }}</h3>
                <p class="text-xs text-slate-400 mt-0.5">{{ item.code }}</p>
              </div>

              <!-- 标签信息 -->
              <div class="flex items-center gap-4 flex-shrink-0 text-xs text-slate-500">
                <div class="flex items-center gap-1">
                  <Calendar :size="12" />
                  {{ item.date }}
                </div>
                <div class="flex items-center gap-1">
                  <Tag :size="12" />
                  {{ getTypeName(item.type) }}
                </div>
                <div v-if="item.details" class="flex items-center gap-1">
                  <FileText :size="12" />
                  {{ item.details.length }}项
                </div>
              </div>
            </div>

            <!-- 金额 -->
            <div class="text-right flex-shrink-0 ml-4">
              <p class="text-lg font-bold text-blue-600">¥{{ item.amount.toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="bg-white rounded-lg border border-slate-200 p-16 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <Receipt :size="32" class="text-slate-300" />
        </div>
        <h3 class="text-lg font-semibold text-slate-900 mb-2">暂无报销记录</h3>
        <p class="text-slate-500 mb-6">点击"发起报销"按钮创建您的第一笔报销申请</p>
        <button
          @click="createNew"
          class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 font-medium"
        >
          <Plus :size="18" />
          发起报销
        </button>
      </div>
    </div>

    <!-- 详情抽屉 -->
    <Teleport to="body">
      <Transition name="drawer">
        <div v-if="showDetailDrawer && selectedItem" class="fixed inset-0 z-50 flex">
          <!-- 遮罩 -->
          <div
            class="absolute inset-0 bg-black/50"
            @click="closeDetailDrawer"
          ></div>

          <!-- 抽屉内容 -->
          <div class="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl flex flex-col">
            <!-- 头部 -->
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 class="text-xl font-bold text-slate-900">报销详情</h2>
                <p class="text-sm text-slate-500 mt-0.5">{{ selectedItem.code }}</p>
              </div>
              <button @click="closeDetailDrawer" class="p-2 hover:bg-slate-100 rounded-lg">
                <X :size="20" class="text-slate-500" />
              </button>
            </div>

            <!-- 内容 -->
            <div class="flex-1 overflow-y-auto p-6">
              <!-- 状态标签 -->
              <div class="mb-6">
                <span
                  :class="`px-3 py-1.5 rounded-full text-sm font-semibold ${
                    selectedItem.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                    selectedItem.status === 'submitted' ? 'bg-amber-100 text-amber-700' :
                    selectedItem.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                    selectedItem.status === 'paid' ? 'bg-green-100 text-green-700' :
                    selectedItem.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-600'
                  }`"
                >
                  {{ getStatusName(selectedItem.status) }}
                </span>
              </div>

              <!-- 基本信息 -->
              <div class="space-y-4 mb-6">
                <h3 class="text-sm font-semibold text-slate-900">基本信息</h3>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-slate-500">报销类型</p>
                    <p class="font-medium text-slate-900 mt-1">{{ getTypeName(selectedItem.type) }}</p>
                  </div>
                  <div>
                    <p class="text-slate-500">申请日期</p>
                    <p class="font-medium text-slate-900 mt-1">{{ selectedItem.date }}</p>
                  </div>
                  <div>
                    <p class="text-slate-500">报销主题</p>
                    <p class="font-medium text-slate-900 mt-1">{{ selectedItem.title }}</p>
                  </div>
                  <div v-if="selectedItem.approver">
                    <p class="text-slate-500">审批人</p>
                    <p class="font-medium text-slate-900 mt-1">{{ selectedItem.approver }}</p>
                  </div>
                </div>
              </div>

              <!-- 报销明细 -->
              <div v-if="selectedItem.details && selectedItem.details.length > 0" class="mb-6">
                <h3 class="text-sm font-semibold text-slate-900 mb-3">报销明细 ({{ selectedItem.details.length }}项)</h3>
                <div class="space-y-3">
                  <div
                    v-for="(detail, index) in selectedItem.details"
                    :key="index"
                    class="p-4 bg-slate-50 rounded-lg"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div class="flex-1">
                        <p class="font-medium text-slate-900">{{ detail.name }}</p>
                        <p class="text-sm text-slate-500 mt-0.5">{{ detail.description }}</p>
                      </div>
                      <p class="text-lg font-semibold text-blue-600 ml-4">¥{{ detail.amount.toFixed(2) }}</p>
                    </div>
                    <div v-if="detail.attachments && detail.attachments.length > 0" class="flex items-center gap-2 mt-3">
                      <div class="flex -space-x-2">
                        <div
                          v-for="(file, fIndex) in detail.attachments.slice(0, 3)"
                          :key="fIndex"
                          class="w-8 h-8 rounded-full bg-white border-2 border-white flex items-center justify-center"
                          :title="file.name"
                        >
                          <FileImage :size="14" class="text-blue-600" />
                        </div>
                      </div>
                      <span class="text-xs text-slate-500">{{ detail.attachments.length }} 个附件</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 金额汇总 -->
              <div class="bg-blue-50 rounded-xl p-4 border border-blue-200 mb-6">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-blue-900">报销总额</span>
                  <span class="text-2xl font-bold text-blue-600">¥{{ selectedItem.amount.toLocaleString() }}</span>
                </div>
              </div>

              <!-- 备注 -->
              <div v-if="selectedItem.remark">
                <h3 class="text-sm font-semibold text-slate-900 mb-2">备注说明</h3>
                <p class="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{{ selectedItem.remark }}</p>
              </div>
            </div>

            <!-- 底部操作 -->
            <div class="px-6 py-4 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <button
                v-if="selectedItem.status === 'draft'"
                @click.stop="editItem(selectedItem)"
                class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium"
              >
                编辑
              </button>
              <button
                v-else-if="selectedItem.status === 'draft' || selectedItem.status === 'submitted'"
                @click.stop="deleteItem(selectedItem.id)"
                class="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 font-medium"
              >
                撤销申请
              </button>
              <div v-else></div>
              <button
                @click="closeDetailDrawer"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast'
import {
  Receipt,
  Plus,
  Search,
  Download,
  Clock,
  DollarSign,
  CheckCircle,
  FileText,
  Calendar,
  Tag,
  X,
  FileImage
} from 'lucide-vue-next'
import * as XLSX from 'xlsx'

const router = useRouter()
const toast = useToast()

interface ReimbursementDetail {
  name: string
  amount: number
  description?: string
  attachments?: Array<{
    name: string
    url: string
  }>
}

interface ReimbursementItem {
  id: string
  code: string
  title: string
  description: string
  type: 'purchase' | 'transport' | 'meal' | 'training' | 'other'
  amount: number
  date: string
  status: 'draft' | 'submitted' | 'approved' | 'paid' | 'rejected'
  approver?: string
  approvalDate?: string
  remark?: string
  details?: ReimbursementDetail[]
}

const searchText = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const showDetailDrawer = ref(false)
const selectedItem = ref<ReimbursementItem | null>(null)

const reimbursements = ref<ReimbursementItem[]>([
  {
    id: '1',
    code: 'RE2025012001',
    title: '乳清蛋白粉采购报销',
    description: '为会员采购训练用蛋白粉',
    type: 'purchase',
    amount: 6400,
    date: '2025-01-20',
    status: 'approved',
    approver: '财务-张经理',
    approvalDate: '2025-01-21',
    details: [
      { name: '乳清蛋白粉 5kg', amount: 6400, description: 'x 20桶', attachments: [{ name: '发票.pdf', url: '' }] }
    ]
  },
  {
    id: '2',
    code: 'RE2025011902',
    title: '外出培训交通费',
    description: '参加专业教练培训往返高铁票',
    type: 'transport',
    amount: 520,
    date: '2025-01-19',
    status: 'paid',
    details: [
      { name: '高铁票', amount: 520, description: '往返', attachments: [{ name: '票据.jpg', url: '' }] }
    ]
  },
  {
    id: '3',
    code: 'RE2025011803',
    title: '客户洽谈餐费',
    description: '与潜在客户洽谈合作费用',
    type: 'meal',
    amount: 380,
    date: '2025-01-18',
    status: 'submitted',
    details: [
      { name: '商务餐费', amount: 380, description: '2人', attachments: [{ name: '消费单.png', url: '' }] }
    ]
  },
  {
    id: '4',
    code: 'RE2025011704',
    title: '训练器械采购',
    description: '采购弹力带、瑜伽垫等训练用品',
    type: 'purchase',
    amount: 1200,
    date: '2025-01-17',
    status: 'draft',
    details: [
      { name: '弹力带套装', amount: 600, description: 'x 15套', attachments: [] },
      { name: '瑜伽垫', amount: 600, description: 'x 30个', attachments: [] }
    ]
  }
])

const filteredReimbursements = computed(() => {
  return reimbursements.value.filter(item => {
    const matchSearch = !searchText.value ||
      item.code.toLowerCase().includes(searchText.value.toLowerCase()) ||
      item.title.toLowerCase().includes(searchText.value.toLowerCase())

    const matchType = !typeFilter.value || item.type === typeFilter.value
    const matchStatus = !statusFilter.value || item.status === statusFilter.value

    return matchSearch && matchType && matchStatus
  })
})

const statistics = computed(() => {
  const pendingCount = reimbursements.value.filter(r => r.status === 'submitted').length
  const monthlyTotal = reimbursements.value
    .filter(r => r.date.startsWith('2025-01'))
    .reduce((sum, r) => sum + r.amount, 0)
  const paidTotal = reimbursements.value
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0)
  const totalCount = reimbursements.value.length

  return { pendingCount, monthlyTotal, paidTotal, totalCount }
})

const getTypeName = (type: string) => {
  const types: Record<string, string> = {
    purchase: '采购报销',
    transport: '交通费',
    meal: '餐费',
    training: '培训费',
    other: '其他'
  }
  return types[type] || type
}

const getStatusName = (status: string) => {
  const statuses: Record<string, string> = {
    draft: '草稿',
    submitted: '已提交',
    approved: '已审批',
    paid: '已支付',
    rejected: '已拒绝'
  }
  return statuses[status] || status
}

const createNew = () => {
  router.push('/reimbursement/create')
}

const viewDetail = (item: ReimbursementItem) => {
  selectedItem.value = item
  showDetailDrawer.value = true
}

const closeDetailDrawer = () => {
  showDetailDrawer.value = false
  selectedItem.value = null
}

const editItem = (item: ReimbursementItem) => {
  router.push(`/reimbursement/edit/${item.id}`)
}

const deleteItem = (id: string) => {
  reimbursements.value = reimbursements.value.filter(r => r.id !== id)
  toast.success('删除成功', '报销申请已删除')
  closeDetailDrawer()
}

const exportData = () => {
  const data = reimbursements.value.map(item => ({
    '编号': item.code,
    '报销主题': item.title,
    '类型': getTypeName(item.type),
    '金额': item.amount,
    '申请日期': item.date,
    '状态': getStatusName(item.status)
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '报销记录')
  XLSX.writeFile(wb, `我的报销_${new Date().toISOString().split('T')[0]}.xlsx`)

  toast.success('导出成功', '数据已导出')
}
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: all 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .absolute.right-0,
.drawer-leave-to .absolute.right-0 {
  transform: translateX(100%);
}
</style>
