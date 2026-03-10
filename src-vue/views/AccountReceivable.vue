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
            <span class="text-sm font-medium opacity-90">应收总数</span>
            <DollarSign :size="20" />
          </div>
          <div class="text-3xl font-bold">{{ statistics.totalCount }}</div>
          <div class="text-xs opacity-75 mt-2">待跟进</div>
        </div>

        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg shadow-orange-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">特殊标记</span>
            <AlertCircle :size="20" />
          </div>
          <div class="text-3xl font-bold">{{ statistics.specialMarkCount }}</div>
          <div class="text-xs opacity-75 mt-2">需关注</div>
        </div>

        <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg shadow-red-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">紧急催收</span>
            <Bell :size="20" />
          </div>
          <div class="text-3xl font-bold">{{ statistics.urgentCount }}</div>
          <div class="text-xs opacity-75 mt-2">高优先级</div>
        </div>

        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg shadow-green-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">本月新增</span>
            <TrendingUp :size="20" />
          </div>
          <div class="text-3xl font-bold">{{ statistics.thisMonthCount }}</div>
          <div class="text-xs opacity-75 mt-2">笔新增</div>
        </div>
      </div>

      <!-- 筛选工具栏 -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div class="flex items-center gap-3 flex-wrap">
          <button
            @click="openAddModal"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          >
            <Plus :size="16" />
            新增应收
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
              placeholder="搜索会员姓名、手机号、订单号..."
              class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <select
            v-model="markFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="all">全部标记</option>
            <option value="marked">有特殊标记</option>
            <option value="unmarked">无特殊标记</option>
          </select>
        </div>
      </div>

      <!-- 应收账款列表 -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">会员信息</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase">来源单据</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase">业务线</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase">特殊催收标记</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">催收备注</th>
              <th class="px-4 py-4 text-center text-xs font-semibold text-slate-700 uppercase">特殊记录</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">创建时间</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase w-36">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="item in filteredItems"
              :key="item.id"
              class="hover:bg-gradient-to-r hover:from-slate-50 hover:to-purple-50/50 transition-colors"
              :class="{ 'bg-orange-50/30': item.collectionMark }"
            >
              <td class="px-6 py-4">
                <div>
                  <div class="font-bold text-slate-900">{{ item.memberName }}</div>
                  <div class="text-xs text-slate-500 mt-0.5">{{ item.memberPhone }}</div>
                  <div class="text-xs text-slate-400">ID: {{ item.memberId }}</div>
                </div>
              </td>
              <td class="px-4 py-4">
                <span class="inline-flex items-center px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium">
                  {{ item.sourceOrderId }}
                </span>
              </td>
              <td class="px-4 py-4 text-sm text-slate-600">
                {{ item.businessLine || '-' }}
              </td>
              <td class="px-4 py-4">
                <span
                  v-if="item.collectionMark"
                  class="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium"
                >
                  {{ item.collectionMark }}
                </span>
                <span v-else class="text-slate-400 text-sm">-</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">
                {{ item.collectionRemark || '-' }}
              </td>
              <td class="px-4 py-4 text-center">
                <span
                  v-if="item.specialRecords && item.specialRecords.length > 0"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium"
                >
                  <AlertCircle :size="12" />
                  {{ item.specialRecords.length }}
                </span>
                <span v-else class="text-slate-400 text-sm">-</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">
                {{ item.createdAt }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-1">
                  <button
                    @click="openEditModal(item)"
                    class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit3 :size="14" />
                  </button>
                  <button
                    @click="openSpecialRecordModal(item)"
                    class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="特殊记录"
                  >
                    <AlertCircle :size="14" />
                  </button>
                  <button
                    @click="deleteItem(item.id)"
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
                  <div class="font-semibold text-slate-900">{{ task.memberName }}</div>
                  <div class="text-xs text-slate-500">{{ task.memberPhone }}</div>
                </div>
              </div>
              <span class="text-xs px-2 py-1 rounded-full" :class="getPriorityBadgeClass(task.priority)">
                {{ task.priorityLabel }}
              </span>
            </div>
            <div class="text-sm text-slate-600 mb-3">{{ task.description }}</div>
            <div v-if="task.specialMark" class="mb-3">
              <span class="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                {{ task.specialMark }}
              </span>
            </div>
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

    <!-- 新增/编辑模态框 -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">{{ editingItem ? '编辑应收' : '新增应收' }}</h3>
            <button @click="showAddModal = false" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" class="text-slate-500" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">会员ID *</label>
                <input
                  v-model="formData.memberId"
                  type="text"
                  placeholder="请输入会员ID"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">会员姓名 *</label>
                <input
                  v-model="formData.memberName"
                  type="text"
                  placeholder="请输入会员姓名"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">会员手机 *</label>
              <input
                v-model="formData.memberPhone"
                type="text"
                placeholder="请输入会员手机号"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">来源单据（订单号） *</label>
              <input
                v-model="formData.sourceOrderId"
                type="text"
                placeholder="请输入CRM订单号"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">业务线</label>
              <select
                v-model="formData.businessLine"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">请选择业务线</option>
                <option value="减重">减重</option>
                <option value="斑块逆转">斑块逆转</option>
                <option value="慢病管理">慢病管理</option>
                <option value="超越百岁">超越百岁</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">特殊催收标记</label>
              <select
                v-model="formData.collectionMark"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">无特殊标记</option>
                <option value="高优先级">高优先级</option>
                <option value="需重点关注">需重点关注</option>
                <option value="已联系">已联系</option>
                <option value="暂时失联">暂时失联</option>
                <option value="法律程序">法律程序</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">催收备注</label>
              <textarea
                v-model="formData.collectionRemark"
                placeholder="请输入催收备注信息"
                rows="3"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="showAddModal = false" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="saveItem" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
              保存
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 特殊项目记录模态框 -->
    <Teleport to="body">
      <div v-if="showSpecialRecordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div class="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div>
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle :size="20" />
                特殊项目记录
              </h3>
              <p class="text-sm text-amber-100 mt-0.5">记录异常、特殊安排等</p>
            </div>
            <button @click="showSpecialRecordModal = false" class="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X :size="20" class="text-white" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">记录类型 *</label>
              <select
                v-model="specialRecordForm.type"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">请选择类型</option>
                <option value="催收异常">催收异常</option>
                <option value="特殊承诺">特殊承诺</option>
                <option value="争议处理">争议处理</option>
                <option value="分期安排">分期安排</option>
                <option value="其他特殊">其他特殊</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">特殊说明 *</label>
              <textarea
                v-model="specialRecordForm.description"
                placeholder="请详细描述特殊情况..."
                rows="4"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div class="flex items-start gap-2">
                <AlertCircle :size="16" class="text-amber-600 mt-0.5" />
                <div class="text-xs text-amber-800">
                  该记录将永久保存，用于追溯特殊情况的处理过程
                </div>
              </div>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="showSpecialRecordModal = false" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="saveSpecialRecord" class="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium transition-colors">
              保存记录
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
  AlertCircle,
  CheckCircle,
  FileText,
  Bell,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Download,
  TrendingUp
} from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import { useToast } from '../composables/useToast'

interface ReceivableItem {
  id: string
  memberId: string
  memberName: string
  memberPhone: string
  sourceOrderId: string // 来源单据（CRM订单号）
  businessLine?: string // 业务线（关联收入类型）
  collectionMark?: string // 特殊催收/异常标记
  collectionRemark?: string // 催收备注说明
  createdAt: string
  // 特殊项目记录
  specialRecords?: SpecialRecord[]
}

interface SpecialRecord {
  id: string
  type: string // 特殊项目类型
  description: string // 特殊说明
  operator: string // 操作人
  createdAt: string // 操作时间
}

interface CollectionTask {
  id: string
  memberId: string
  memberName: string
  memberPhone: string
  priority: 'high' | 'medium' | 'low'
  priorityLabel: string
  description: string
  overdueDays: number
  specialMark?: string // 特殊标记
}

type TabType = 'list' | 'collection'

const activeTab = ref<TabType>('list')
const searchText = ref('')
const markFilter = ref<string>('all')
const showAddModal = ref(false)
const showSpecialRecordModal = ref(false)
const editingItem = ref<ReceivableItem | null>(null)
const selectedReceivable = ref<ReceivableItem | null>(null)
const { toast: toastFunc } = useToast()

const formData = ref({
  memberId: '',
  memberName: '',
  memberPhone: '',
  sourceOrderId: '',
  businessLine: '',
  collectionMark: '',
  collectionRemark: ''
})

const specialRecordForm = ref({
  type: '',
  description: ''
})

const receivables = ref<ReceivableItem[]>([
  {
    id: 'AR001',
    memberId: 'M001',
    memberName: '王芳',
    memberPhone: '138****1234',
    sourceOrderId: 'ORD20240115001',
    businessLine: '减重',
    collectionMark: '高优先级',
    collectionRemark: '客户承诺本周内支付',
    createdAt: '2024-01-15',
    specialRecords: [
      {
        id: 'SR001',
        type: '催收异常',
        description: '客户电话暂时无法接通',
        operator: '张经理',
        createdAt: '2024-02-01'
      }
    ]
  },
  {
    id: 'AR002',
    memberId: 'M002',
    memberName: '李明',
    memberPhone: '139****5678',
    sourceOrderId: 'ORD20240210001',
    businessLine: '斑块逆转',
    collectionMark: '',
    collectionRemark: '',
    createdAt: '2024-02-10'
  },
  {
    id: 'AR003',
    memberId: 'M003',
    memberName: '张伟',
    memberPhone: '136****9012',
    sourceOrderId: 'ORD20240220001',
    businessLine: '慢病管理',
    collectionMark: '已联系',
    collectionRemark: '已约定下月支付',
    createdAt: '2024-02-20'
  },
  {
    id: 'AR004',
    memberId: 'M004',
    memberName: '刘洋',
    memberPhone: '137****3456',
    sourceOrderId: 'ORD20240218001',
    businessLine: '超越百岁',
    collectionMark: '',
    collectionRemark: '',
    createdAt: '2024-02-18'
  },
  {
    id: 'AR005',
    memberId: 'M005',
    memberName: '陈静',
    memberPhone: '135****7890',
    sourceOrderId: 'ORD20231120001',
    businessLine: '减重',
    collectionMark: '法律程序',
    collectionRemark: '已启动法律程序',
    createdAt: '2023-11-20',
    specialRecords: [
      {
        id: 'SR002',
        type: '法律程序',
        description: '严重逾期，已委托律师处理',
        operator: '法务部',
        createdAt: '2024-01-15'
      }
    ]
  }
])

const collectionTasks = ref<CollectionTask[]>([
  {
    id: 'CT001',
    memberId: 'M001',
    memberName: '王芳',
    memberPhone: '138****1234',
    priority: 'high',
    priorityLabel: '紧急',
    description: '多次催收无果，需采取进一步措施',
    overdueDays: 45,
    specialMark: '高优先级'
  },
  {
    id: 'CT002',
    memberId: 'M005',
    memberName: '陈静',
    memberPhone: '135****7890',
    priority: 'high',
    priorityLabel: '紧急',
    description: '严重逾期，已启动法律程序',
    overdueDays: 95,
    specialMark: '法律程序'
  },
  {
    id: 'CT003',
    memberId: 'M003',
    memberName: '张伟',
    memberPhone: '136****9012',
    priority: 'medium',
    priorityLabel: '一般',
    description: '已约定还款时间，需跟进确认',
    overdueDays: 15,
    specialMark: '已联系'
  }
])

const statistics = computed(() => {
  const totalCount = receivables.value.length
  const specialMarkCount = receivables.value.filter(item => item.collectionMark).length
  const urgentCount = receivables.value.filter(item =>
    item.collectionMark && ['高优先级', '法律程序'].includes(item.collectionMark)
  ).length

  const thisMonth = new Date()
  const thisMonthCount = receivables.value.filter(item => {
    const itemDate = new Date(item.createdAt)
    return itemDate.getMonth() === thisMonth.getMonth() &&
           itemDate.getFullYear() === thisMonth.getFullYear()
  }).length

  return {
    totalCount,
    specialMarkCount,
    urgentCount,
    thisMonthCount
  }
})

const filteredItems = computed(() => {
  return receivables.value.filter(item => {
    const matchSearch = !searchText.value ||
      item.memberName.includes(searchText.value) ||
      item.memberPhone.includes(searchText.value) ||
      item.sourceOrderId.includes(searchText.value)

    let matchMark = true
    if (markFilter.value !== 'all') {
      if (markFilter.value === 'marked') {
        matchMark = !!item.collectionMark
      } else if (markFilter.value === 'unmarked') {
        matchMark = !item.collectionMark
      }
    }

    return matchSearch && matchMark
  })
})

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

const openAddModal = () => {
  editingItem.value = null
  formData.value = {
    memberId: '',
    memberName: '',
    memberPhone: '',
    sourceOrderId: '',
    businessLine: '',
    collectionMark: '',
    collectionRemark: ''
  }
  showAddModal.value = true
}

const saveItem = () => {
  if (!formData.value.memberId || !formData.value.memberName ||
      !formData.value.memberPhone || !formData.value.sourceOrderId) {
    toastFunc.error('请填写必填项')
    return
  }

  if (editingItem.value) {
    // 编辑模式
    receivables.value = receivables.value.map(item =>
      item.id === editingItem.value!.id
        ? {
            ...item,
            memberId: formData.value.memberId,
            memberName: formData.value.memberName,
            memberPhone: formData.value.memberPhone,
            sourceOrderId: formData.value.sourceOrderId,
            businessLine: formData.value.businessLine || undefined,
            collectionMark: formData.value.collectionMark || undefined,
            collectionRemark: formData.value.collectionRemark || undefined
          }
        : item
    )
    toastFunc.success('应收已更新')
  } else {
    // 新增模式
    const newItem: ReceivableItem = {
      id: `AR${String(receivables.value.length + 1).padStart(3, '0')}`,
      memberId: formData.value.memberId,
      memberName: formData.value.memberName,
      memberPhone: formData.value.memberPhone,
      sourceOrderId: formData.value.sourceOrderId,
      businessLine: formData.value.businessLine || undefined,
      collectionMark: formData.value.collectionMark || undefined,
      collectionRemark: formData.value.collectionRemark || undefined,
      createdAt: new Date().toISOString().split('T')[0]
    }

    receivables.value.unshift(newItem)
    toastFunc.success('应收已添加')
  }

  showAddModal.value = false
}

const openEditModal = (item: ReceivableItem) => {
  editingItem.value = item
  formData.value = {
    memberId: item.memberId,
    memberName: item.memberName,
    memberPhone: item.memberPhone,
    sourceOrderId: item.sourceOrderId,
    businessLine: item.businessLine || '',
    collectionMark: item.collectionMark || '',
    collectionRemark: item.collectionRemark || ''
  }
  showAddModal.value = true
}

const deleteItem = (id: string) => {
  if (confirm('确定要删除这条应收记录吗？')) {
    receivables.value = receivables.value.filter(item => item.id !== id)
    toastFunc.success('已删除')
  }
}

const openSpecialRecordModal = (item: ReceivableItem) => {
  selectedReceivable.value = item
  specialRecordForm.value = {
    type: '',
    description: ''
  }
  showSpecialRecordModal.value = true
}

const saveSpecialRecord = () => {
  if (!specialRecordForm.value.type || !specialRecordForm.value.description) {
    toastFunc.error('请填写必填项')
    return
  }

  if (!selectedReceivable.value) return

  const newRecord: SpecialRecord = {
    id: `SR${Date.now()}`,
    type: specialRecordForm.value.type,
    description: specialRecordForm.value.description,
    operator: '当前用户',
    createdAt: new Date().toISOString().split('T')[0]
  }

  receivables.value = receivables.value.map(item =>
    item.id === selectedReceivable.value!.id
      ? {
          ...item,
          specialRecords: [...(item.specialRecords || []), newRecord]
        }
      : item
  )

  showSpecialRecordModal.value = false
  selectedReceivable.value = null
  toastFunc.success('特殊记录已添加')
}

const executeCollection = (task: CollectionTask) => {
  toastFunc.info('催收任务', `已创建 ${task.memberName} 的催收提醒，逾期 ${task.overdueDays} 天`)
}

// 导出数据
const exportData = () => {
  toastFunc.info('导出中', '正在导出应收账款数据...')

  try {
    const exportData = filteredItems.value.map(item => ({
      '应收单号': item.id,
      '会员ID': item.memberId,
      '会员姓名': item.memberName,
      '会员手机': item.memberPhone,
      '来源单据': item.sourceOrderId,
      '业务线': item.businessLine || '-',
      '特殊催收标记': item.collectionMark || '-',
      '催收备注': item.collectionRemark || '-',
      '特殊项目数': item.specialRecords?.length || 0,
      '创建时间': item.createdAt
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    ws['!cols'] = [
      { wch: 15 }, // 应收单号
      { wch: 12 }, // 会员ID
      { wch: 12 }, // 会员姓名
      { wch: 15 }, // 会员手机
      { wch: 18 }, // 来源单据
      { wch: 12 }, // 业务线
      { wch: 15 }, // 特殊催收标记
      { wch: 30 }, // 催收备注
      { wch: 12 }, // 特殊项目数
      { wch: 12 }  // 创建时间
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
