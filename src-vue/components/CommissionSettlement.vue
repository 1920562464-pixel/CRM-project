<template>
  <div class="flex gap-6">
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

    <!-- 左侧导航栏 -->
    <div class="w-56 flex-shrink-0">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-6">
        <nav class="space-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`"
          >
            <component :is="tab.icon" :size="18" />
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="flex-1 space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">佣金结算管理</h1>
          <p class="text-sm text-slate-500 mt-1">顾问佣金智能结算系统</p>
        </div>
        <div v-if="isConsultant" class="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <span class="text-sm text-amber-700">仅显示我的结算数据</span>
        </div>
      </div>

      <!-- 当前规则提示 -->
      <div v-if="activeTab !== 'rules'" class="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div class="flex items-center gap-2">
          <AlertCircle :size="18" class="text-blue-600" />
          <div>
            <span class="font-semibold text-blue-900">当前佣金规则：</span>
            <span class="text-sm text-blue-800 ml-2">
              佣金比例 {{ currentRule.minRate }}% - {{ currentRule.maxRate }}%，默认 {{ currentRule.defaultRate }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Tab内容 -->
      <!-- 佣金提报 Tab -->
      <div v-if="activeTab === 'records'" class="space-y-4">
        <!-- 顾问提报操作栏 -->
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <AlertCircle :size="20" class="text-purple-600" />
                <span class="font-semibold text-purple-900">顾问佣金数据提报</span>
              </div>
              <span class="text-sm text-purple-700">
                提报期限：每月1-7日 23:59前 | 当前状态：
                <span :class="new Date().getDate() <= 7 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
                  {{ new Date().getDate() <= 7 ? '开放中' : '已关闭' }}
                </span>
              </span>
            </div>
            <button
              @click="openCommissionReportDialog"
              :disabled="new Date().getDate() > 7"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
            >
              <Plus :size="16" /> 新增佣金提报
            </button>
          </div>
        </div>

        <!-- 佣金提报记录列表 -->
        <div v-if="commissionReports.length > 0" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 flex items-center justify-between">
            <h3 class="text-white font-semibold">顾问佣金提报记录</h3>
            <span class="text-xs text-purple-100">{{ commissionReports.length }} 条记录</span>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="report in commissionReports"
                :key="report.id"
                class="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-slate-900">{{ report.consultantName }}</span>
                    <span
                      :class="`px-2 py-0.5 rounded text-xs font-semibold ${
                        report.status === 'submitted'
                          ? 'bg-yellow-100 text-yellow-800'
                          : report.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`"
                    >
                      {{ report.status === 'submitted' ? '待审核' : report.status === 'approved' ? '已通过' : '已驳回' }}
                    </span>
                  </div>
                  <span class="text-lg font-bold text-purple-600">¥{{ report.totalAmount.toLocaleString() }}</span>
                </div>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-slate-600">基础干预</span>
                    <span class="font-semibold">{{ report.basicServiceUsers }}人 × ¥100</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-600">深度干预</span>
                    <span class="font-semibold">{{ report.deepServiceUsers }}人 × ¥200</span>
                  </div>
                  <div class="flex justify-between font-bold text-purple-600">
                    <span>合计</span>
                    <span>¥{{ report.totalAmount.toLocaleString() }}</span>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span class="text-xs text-slate-500">
                    提交时间：{{ report.submittedAt }}
                  </span>
                  <!-- 审核操作按钮 -->
                  <div v-if="report.status === 'submitted'" class="flex items-center gap-2">
                    <button
                      @click="approveCommissionReport(report.id)"
                      class="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                    >
                      <CheckCircle :size="12" /> 通过
                    </button>
                    <button
                      @click="rejectCommissionReport(report.id)"
                      class="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-1"
                    >
                      <X :size="12" /> 驳回
                    </button>
                  </div>
                  <span v-else-if="report.status === 'approved'" class="text-xs text-green-600 font-semibold">
                    ✓ 已审核通过
                  </span>
                  <span v-else class="text-xs text-red-600 font-semibold">
                    ✗ 已驳回
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 原有的佣金记录Tab内容 -->
        <CommissionRecordsTab
          :records="commissionRecords"
          @approve="handleApproveRecord"
          @reject="handleRejectRecord"
          @view="viewRecordDetail"
        />
      </div>

      <CommissionConsultantsTab
        v-if="activeTab === 'consultants'"
        :consultants="filteredConsultants"
        @edit="handleEditConsultant"
        @delete="confirmDeleteConsultant"
        @add="openConsultantModal"
      />
      <CommissionSettlementsTab
        v-if="activeTab === 'settlements'"
        :settlements="filteredSettlements"
        :selected-period="selectedPeriod"
        @generate="handleGenerateSettlement"
        @approve="handleApproveSettlement"
        @reject="handleRejectSettlement"
        @pay="handleProcessPayment"
        @view="viewSettlementDetail"
        @export="handleExportSettlements"
      />
      <CommissionPaymentsTab
        v-if="activeTab === 'payments'"
        :payments="payments"
        @retry="handleRetryPayment"
        @view="viewPaymentDetail"
      />
      <CommissionReportsTab
        v-if="activeTab === 'reports'"
        :stats="stats"
        :consultants="filteredConsultants"
      />
      <CommissionRulesTab
        v-if="activeTab === 'rules'"
        :rules="commissionRules"
        @save="handleSaveRule"
        @delete="confirmDeleteRule"
      />
    </div>

    <!-- 顾问编辑/新增模态框 -->
    <Teleport to="body">
      <div v-if="showConsultantModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">{{ isEditMode ? '编辑顾问' : '新增顾问' }}</h3>
            <button @click="closeConsultantModal" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" class="text-slate-500" />
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">姓名 *</label>
                <input v-model="consultantForm.name" type="text" placeholder="请输入姓名" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">手机号 *</label>
                <input v-model="consultantForm.phone" type="tel" placeholder="请输入手机号" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">所属公司</label>
                <input v-model="consultantForm.company" type="text" placeholder="请输入所属公司" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">佣金比例 (%)</label>
                <input v-model.number="consultantForm.commissionRate" type="number" placeholder="请输入佣金比例" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">开户银行</label>
                <input v-model="consultantForm.bankName" type="text" placeholder="请输入开户银行" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">银行账号</label>
                <input v-model="consultantForm.bankAccount" type="text" placeholder="请输入银行账号" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">邮箱</label>
              <input v-model="consultantForm.email" type="email" placeholder="请输入邮箱" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
              <textarea v-model="consultantForm.remark" placeholder="请输入备注信息" rows="3" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
            </div>
          </div>
          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="closeConsultantModal" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">取消</button>
            <button @click="saveConsultant" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">保存</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Briefcase,
  AlertCircle,
  X
} from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import { useToast } from '@/composables/useToast'
import { useRole, type UserRole } from '../composables/useRole'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import Toast from '@/components/shared/Toast.vue'
import CommissionConsultantsTab from './settlement/CommissionConsultantsTab.vue'
import CommissionRecordsTab from './settlement/CommissionRecordsTab.vue'
import CommissionSettlementsTab from './settlement/CommissionSettlementsTab.vue'
import CommissionPaymentsTab from './settlement/CommissionPaymentsTab.vue'
import CommissionReportsTab from './settlement/CommissionReportsTab.vue'
import CommissionRulesTab from './settlement/CommissionRulesTab.vue'

// Props
interface Props {
  currentRole?: UserRole
}
const props = withDefaults(defineProps<Props>(), {
  currentRole: undefined
})

type TabType = 'consultants' | 'records' | 'settlements' | 'payments' | 'reports' | 'rules'

// 获取当前角色信息
const { currentRole: globalRole, currentRoleConfig } = useRole()
const effectiveRole = computed(() => props.currentRole || globalRole.value)

// 判断是否为管理员或财务（可以查看所有顾问数据）
const canViewAll = computed(() => {
  return effectiveRole.value === 'admin' || effectiveRole.value === 'finance'
})

// 判断是否为顾问角色（只能看自己的数据）
const isConsultant = computed(() => {
  return effectiveRole.value === 'consultant'
})

interface Consultant {
  id: string
  name: string
  phone: string
  email?: string
  company: string
  bankName: string
  bankAccount: string
  status: 'active' | 'inactive' | 'suspended'
  cooperationDate: string
  commissionRate: number
  totalUsers: number
  totalCommission: number
  lastSettleDate?: string
  avatar?: string
  remark?: string
}

interface CommissionRule {
  id: string
  name: string
  minRate: number
  maxRate: number
  defaultRate: number
  description: string
  effectiveDate: string
}

interface CommissionRecord {
  id: string
  consultantId: string
  consultantName: string
  userId: string
  userName: string
  amount: number
  commissionRate: number
  commissionAmount: number
  orderDate: string
  productName: string
  status: 'pending' | 'calculated' | 'approved' | 'paid'
  createdAt: string
  paidAt?: string
  remark?: string
}

interface CommissionSettlement {
  id: string
  consultantId: string
  consultantName: string
  period: string
  totalAmount: number
  totalCommission: number
  recordCount: number
  status: 'pending' | 'approved' | 'paid'
  createdAt: string
  approvedAt?: string
  paidAt?: string
  remark?: string
}

interface CommissionPayment {
  id: string
  settlementId: string
  settlementPeriod: string
  consultantId: string
  consultantName: string
  bankName: string
  bankAccount: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  transactionId?: string
  paidAt?: string
  failedReason?: string
  operator: string
  createdAt: string
}

const tabs = [
  { id: 'consultants' as TabType, label: '顾问管理', icon: Users },
  { id: 'records' as TabType, label: '佣金记录', icon: FileText },
  { id: 'settlements' as TabType, label: '结算单', icon: CreditCard },
  { id: 'payments' as TabType, label: '发放记录', icon: BarChart3 },
  { id: 'reports' as TabType, label: '统计报表', icon: Settings },
  { id: 'rules' as TabType, label: '规则配置', icon: Settings }
]

const activeTab = ref<TabType>('consultants')
const selectedPeriod = ref('2024-02')

// 佣金规则
const commissionRules = ref<CommissionRule[]>([{
  id: '1',
  name: '标准佣金规则',
  minRate: 8,
  maxRate: 10,
  defaultRate: 8,
  description: '默认佣金比例为8%，优秀顾问可申请至10%',
  effectiveDate: '2023-01-01'
}])

const currentRule = computed(() => commissionRules.value[0])

// 顾问数据
const consultants = ref<Consultant[]>([
  {
    id: '1',
    name: '张经理',
    phone: '13800138888',
    email: 'zhang@ruicheng.com',
    company: '瑞承健康',
    bankName: '中国工商银行',
    bankAccount: '6212260200008888888',
    status: 'active',
    cooperationDate: '2023-06-01',
    commissionRate: 8,
    totalUsers: 15,
    totalCommission: 12800,
    lastSettleDate: '2024-01-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangJingli',
    remark: '负责华东地区业务'
  },
  {
    id: '2',
    name: '李主管',
    phone: '13800138889',
    email: 'li@ruicheng.com',
    company: '瑞承健康',
    bankName: '中国建设银行',
    bankAccount: '6217000030008888888',
    status: 'active',
    cooperationDate: '2023-08-15',
    commissionRate: 10,
    totalUsers: 22,
    totalCommission: 25600,
    lastSettleDate: '2024-01-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiZhuguan',
    remark: '高级顾问，10%比例'
  },
  {
    id: '3',
    name: '王专员',
    phone: '13800138887',
    email: 'wang@ruicheng.com',
    company: '瑞承健康',
    bankName: '招商银行',
    bankAccount: '6214830200008888888',
    status: 'active',
    cooperationDate: '2023-10-20',
    commissionRate: 9,
    totalUsers: 8,
    totalCommission: 7200,
    lastSettleDate: '2024-01-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangZhuanyuan',
    remark: '华北区域'
  }
])

// 根据角色过滤顾问数据 - 顾问只能看到自己，管理员和财务可以看到所有
const filteredConsultants = computed(() => {
  if (canViewAll.value) {
    return consultants.value
  }
  // 顾问角色：只显示当前登录顾问的数据（模拟：假设当前顾问是张经理，id='1'）
  return consultants.value.filter(c => c.id === '1')
})

// 佣金记录
const commissionRecords = ref<CommissionRecord[]>([
  {
    id: 'c1',
    consultantId: '1',
    consultantName: '张经理',
    userId: 'u001',
    userName: '王芳',
    amount: 5800,
    commissionRate: 8,
    commissionAmount: 464,
    orderDate: '2024-02-10',
    productName: '康复套餐A',
    status: 'paid',
    createdAt: '2024-02-10',
    paidAt: '2024-02-15'
  },
  {
    id: 'c2',
    consultantId: '1',
    consultantName: '张经理',
    userId: 'u002',
    userName: '李明',
    amount: 3200,
    commissionRate: 8,
    commissionAmount: 256,
    orderDate: '2024-02-12',
    productName: '瑜伽课程包',
    status: 'paid',
    createdAt: '2024-02-12',
    paidAt: '2024-02-18'
  },
  {
    id: 'c3',
    consultantId: '2',
    consultantName: '李主管',
    userId: 'u003',
    userName: '赵丽',
    amount: 12800,
    commissionRate: 10,
    commissionAmount: 1280,
    orderDate: '2024-02-08',
    productName: '健康管理中心会员',
    status: 'approved',
    createdAt: '2024-02-08'
  },
  {
    id: 'c4',
    consultantId: '2',
    consultantName: '李主管',
    userId: 'u004',
    userName: '孙伟',
    amount: 6800,
    commissionRate: 10,
    commissionAmount: 680,
    orderDate: '2024-02-15',
    productName: '体能训练课程',
    status: 'pending',
    createdAt: '2024-02-15'
  },
  {
    id: 'c5',
    consultantId: '3',
    consultantName: '王专员',
    userId: 'u005',
    userName: '周涛',
    amount: 4500,
    commissionRate: 9,
    commissionAmount: 405,
    orderDate: '2024-02-14',
    productName: '营养咨询套餐',
    status: 'approved',
    createdAt: '2024-02-14'
  }
])

// 结算单
const settlements = ref<CommissionSettlement[]>([
  {
    id: 's1',
    consultantId: '1',
    consultantName: '张经理',
    period: '2024-01',
    totalAmount: 45000,
    totalCommission: 3600,
    recordCount: 12,
    status: 'paid',
    createdAt: '2024-02-01',
    approvedAt: '2024-02-02',
    paidAt: '2024-02-10'
  },
  {
    id: 's2',
    consultantId: '2',
    consultantName: '李主管',
    period: '2024-01',
    totalAmount: 68000,
    totalCommission: 6800,
    recordCount: 18,
    status: 'paid',
    createdAt: '2024-02-01',
    approvedAt: '2024-02-02',
    paidAt: '2024-02-10'
  },
  {
    id: 's3',
    consultantId: '1',
    consultantName: '张经理',
    period: '2024-02',
    totalAmount: 9000,
    totalCommission: 720,
    recordCount: 2,
    status: 'approved',
    createdAt: '2024-03-01',
    approvedAt: '2024-03-02'
  }
])

// 根据角色过滤结算数据
const filteredSettlements = computed(() => {
  let result = settlements.value

  // 根据角色过滤
  if (!canViewAll.value) {
    // 顾问角色：只显示当前顾问的结算记录
    result = result.filter(s => s.consultantId === '1')
  }

  // 根据选定期间过滤
  if (selectedPeriod.value) {
    result = result.filter(s => s.period === selectedPeriod.value)
  }

  return result
})

// 支付记录
const payments = ref<CommissionPayment[]>([
  {
    id: 'p1',
    settlementId: 's1',
    settlementPeriod: '2024-01',
    consultantId: '1',
    consultantName: '张经理',
    bankName: '中国工商银行',
    bankAccount: '6212260200008888888',
    amount: 3600,
    status: 'success',
    transactionId: 'PAY2024021012345',
    paidAt: '2024-02-10 14:30:00',
    operator: '管理员',
    createdAt: '2024-02-10 14:28:00'
  },
  {
    id: 'p2',
    settlementId: 's2',
    settlementPeriod: '2024-01',
    consultantId: '2',
    consultantName: '李主管',
    bankName: '中国建设银行',
    bankAccount: '6217000030008888888',
    amount: 6800,
    status: 'success',
    transactionId: 'PAY2024021012346',
    paidAt: '2024-02-10 14:35:00',
    operator: '管理员',
    createdAt: '2024-02-10 14:32:00'
  }
])

// 计算属性
const stats = computed(() => {
  const activeConsultants = consultants.value.filter(c => c.status === 'active').length
  const totalUsers = consultants.value.reduce((sum, c) => sum + c.totalUsers, 0)
  const currentMonthSettlements = settlements.value.filter(s => s.period === selectedPeriod.value)
  const pendingAmount = currentMonthSettlements
    .filter(s => s.status === 'pending' || s.status === 'approved')
    .reduce((sum, s) => sum + s.totalCommission, 0)
  const paidAmount = currentMonthSettlements
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + s.totalCommission, 0)

  return { activeConsultants, totalUsers, pendingAmount, paidAmount }
})

// 方法
const { toast } = useToast()

const confirm = ref({
  show: false,
  title: '',
  message: '',
  type: 'warning' as 'warning' | 'danger',
  onConfirm: () => {},
  onCancel: () => {}
})

const showConsultantModal = ref(false)
const isEditMode = ref(false)
const selectedConsultant = ref<Consultant | null>(null)

const consultantForm = ref({
  name: '',
  phone: '',
  email: '',
  company: '',
  bankName: '',
  bankAccount: '',
  commissionRate: 8,
  remark: ''
})

const openConsultantModal = () => {
  isEditMode.value = false
  consultantForm.value = {
    name: '',
    phone: '',
    email: '',
    company: '瑞承健康',
    bankName: '',
    bankAccount: '',
    commissionRate: 8,
    remark: ''
  }
  showConsultantModal.value = true
}

const closeConsultantModal = () => {
  showConsultantModal.value = false
  selectedConsultant.value = null
}

const handleEditConsultant = (consultant: Consultant) => {
  isEditMode.value = true
  selectedConsultant.value = consultant
  consultantForm.value = {
    name: consultant.name,
    phone: consultant.phone,
    email: consultant.email || '',
    company: consultant.company,
    bankName: consultant.bankName,
    bankAccount: consultant.bankAccount,
    commissionRate: consultant.commissionRate,
    remark: consultant.remark || ''
  }
  showConsultantModal.value = true
}

const saveConsultant = () => {
  if (!consultantForm.value.name || !consultantForm.value.phone) {
    toast.error('请填写必填项')
    return
  }

  if (isEditMode.value && selectedConsultant.value) {
    consultants.value = consultants.value.map(c =>
      c.id === selectedConsultant.value!.id
        ? {
            ...c,
            name: consultantForm.value.name,
            phone: consultantForm.value.phone,
            email: consultantForm.value.email,
            company: consultantForm.value.company,
            bankName: consultantForm.value.bankName,
            bankAccount: consultantForm.value.bankAccount,
            commissionRate: consultantForm.value.commissionRate,
            remark: consultantForm.value.remark
          }
        : c
    )
    toast.success('更新成功', `顾问 "${consultantForm.value.name}" 信息已更新`)
  } else {
    const newConsultant: Consultant = {
      id: Date.now().toString(),
      name: consultantForm.value.name,
      phone: consultantForm.value.phone,
      email: consultantForm.value.email,
      company: consultantForm.value.company,
      bankName: consultantForm.value.bankName,
      bankAccount: consultantForm.value.bankAccount,
      status: 'active',
      cooperationDate: new Date().toISOString().split('T')[0],
      commissionRate: consultantForm.value.commissionRate,
      totalUsers: 0,
      totalCommission: 0,
      remark: consultantForm.value.remark
    }
    consultants.value.unshift(newConsultant)
    toast.success('添加成功', `顾问 "${consultantForm.value.name}" 已添加`)
  }

  showConsultantModal.value = false
  selectedConsultant.value = null
}

const confirmDeleteConsultant = (id: string) => {
  const consultant = consultants.value.find(c => c.id === id)
  if (!consultant) return

  confirm.value = {
    show: true,
    title: '删除顾问',
    message: `确定要删除顾问 "${consultant.name}" 吗？此操作不可恢复。`,
    type: 'danger',
    onConfirm: () => {
      consultants.value = consultants.value.filter(c => c.id !== id)
      toast.success('删除成功', `顾问 "${consultant.name}" 已删除`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const handleApproveRecord = (id: string) => {
  const record = commissionRecords.value.find(r => r.id === id)
  if (!record) return

  confirm.value = {
    show: true,
    title: '审批佣金记录',
    message: `确认审批这条佣金记录吗？佣金金额: ¥${record.commissionAmount}`,
    type: 'warning',
    onConfirm: () => {
      commissionRecords.value = commissionRecords.value.map(r =>
        r.id === id ? { ...r, status: 'approved' as const } : r
      )
      toast.success('审批成功', '佣金记录已审批通过')
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const handleRejectRecord = (id: string) => {
  const record = commissionRecords.value.find(r => r.id === id)
  if (!record) return

  confirm.value = {
    show: true,
    title: '驳回佣金记录',
    message: '确认驳回这条佣金记录吗？',
    type: 'danger',
    onConfirm: () => {
      commissionRecords.value = commissionRecords.value.map(r =>
        r.id === id ? { ...r, status: 'calculated' as const } : r
      )
      toast.success('驳回成功', '佣金记录已驳回，需要重新计算')
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const viewRecordDetail = (record: CommissionRecord) => {
  toast.info('佣金详情', `顾问: ${record.consultantName}\n客户: ${record.userName}\n订单金额: ¥${record.amount.toLocaleString()}\n佣金比例: ${record.commissionRate}%\n佣金金额: ¥${record.commissionAmount}`)
}

const handleGenerateSettlement = () => {
  toast.info('生成结算单', '正在计算本月佣金数据...')
  setTimeout(() => {
    toast.success('生成成功', `已为 ${consultants.value.filter(c => c.status === 'active').length} 位顾问生成本月结算单`)
  }, 1500)
}

const handleApproveSettlement = (id: string) => {
  const settlement = settlements.value.find(s => s.id === id)
  if (!settlement) return

  confirm.value = {
    show: true,
    title: '审批通过',
    message: `确认审批 "${settlement.consultantName}" 的结算单 ¥${settlement.totalCommission.toLocaleString()} 吗？`,
    type: 'warning',
    onConfirm: () => {
      settlements.value = settlements.value.map(s =>
        s.id === id
          ? { ...s, status: 'approved' as const, approvedAt: new Date().toISOString().split('T')[0] }
          : s
      )
      toast.success('审批成功', `已通过 "${settlement.consultantName}" 的结算审批`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const handleRejectSettlement = (id: string) => {
  const settlement = settlements.value.find(s => s.id === id)
  if (!settlement) return

  confirm.value = {
    show: true,
    title: '驳回结算',
    message: `确认驳回 "${settlement.consultantName}" 的结算单吗？`,
    type: 'danger',
    onConfirm: () => {
      settlements.value = settlements.value.map(s =>
        s.id === id ? { ...s, status: 'pending' as const, approvedAt: undefined } : s
      )
      toast.success('驳回成功', `已驳回 "${settlement.consultantName}" 的结算单`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const handleProcessPayment = (id: string) => {
  const settlement = settlements.value.find(s => s.id === id)
  if (!settlement) return

  confirm.value = {
    show: true,
    title: '发放结算',
    message: `确认发放 ¥${settlement.totalCommission.toLocaleString()} 给 "${settlement.consultantName}" 吗？`,
    type: 'warning',
    onConfirm: () => {
      toast.info('处理中', '正在处理银行转账...')
      setTimeout(() => {
        settlements.value = settlements.value.map(s =>
          s.id === id
            ? { ...s, status: 'paid' as const, paidAt: new Date().toISOString().split('T')[0] }
            : s
        )
        const newPayment: CommissionPayment = {
          id: Date.now().toString(),
          settlementId: settlement.id,
          settlementPeriod: settlement.period,
          consultantId: settlement.consultantId,
          consultantName: settlement.consultantName,
          bankName: consultants.value.find(c => c.id === settlement.consultantId)?.bankName || '',
          bankAccount: consultants.value.find(c => c.id === settlement.consultantId)?.bankAccount || '',
          amount: settlement.totalCommission,
          status: 'success',
          transactionId: 'PAY' + Date.now(),
          paidAt: new Date().toLocaleString('zh-CN', { hour12: false }),
          operator: '管理员',
          createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
        }
        payments.value.unshift(newPayment)
        toast.success('发放成功', `已成功发放 ¥${settlement.totalCommission.toLocaleString()}`)
        confirm.value.show = false
      }, 2000)
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const viewSettlementDetail = (settlement: CommissionSettlement) => {
  toast.info('结算详情', `${settlement.consultantName} - ${settlement.period}\n销售额: ¥${settlement.totalAmount.toLocaleString()}\n佣金: ¥${settlement.totalCommission.toLocaleString()}\n订单数: ${settlement.recordCount}`)
}

// 导出结算数据
const handleExportSettlements = () => {
  toast.info('导出中', '正在导出结算数据...')

  try {
    // 准备导出数据
    const exportData = filteredSettlements.value.map(s => ({
      '结算单号': s.id,
      '顾问姓名': s.consultantName,
      '结算期间': s.period,
      '订单总额': s.totalAmount,
      '佣金总额': s.totalCommission,
      '订单数量': s.recordCount,
      '状态': s.status === 'pending' ? '待审批' : s.status === 'approved' ? '已审批' : '已发放',
      '创建时间': s.createdAt,
      '审批时间': s.approvedAt || '-',
      '发放时间': s.paidAt || '-',
      '备注': s.remark || '-'
    }))

    // 创建工作簿
    const wb = XLSX.utils.book_new()

    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(exportData)

    // 设置列宽
    ws['!cols'] = [
      { wch: 15 }, // 结算单号
      { wch: 12 }, // 顾问姓名
      { wch: 12 }, // 结算期间
      { wch: 12 }, // 订单总额
      { wch: 12 }, // 佣金总额
      { wch: 10 }, // 订单数量
      { wch: 10 }, // 状态
      { wch: 20 }, // 创建时间
      { wch: 20 }, // 审批时间
      { wch: 20 }, // 发放时间
      { wch: 20 }  // 备注
    ]

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '佣金结算')

    // 生成文件名
    const fileName = `佣金结算明细_${selectedPeriod.value}_${new Date().toISOString().split('T')[0]}.xlsx`

    // 导出文件
    XLSX.writeFile(wb, fileName)

    toast.success('导出成功', `结算数据已导出为 ${fileName}`)
  } catch (error) {
    console.error('导出失败:', error)
    toast.error('导出失败', '导出结算数据时发生错误，请重试')
  }
}

const handleRetryPayment = (id: string) => {
  const payment = payments.value.find(p => p.id === id)
  if (!payment) return

  toast.info('重试支付', `正在重试支付给 ${payment.consultantName}...`)
  setTimeout(() => {
    toast.success('重试成功', `已成功支付 ¥${payment.amount.toLocaleString()}`)
  }, 1500)
}

const viewPaymentDetail = (payment: CommissionPayment) => {
  toast.info('支付详情', `交易号: ${payment.transactionId}\n金额: ¥${payment.amount.toLocaleString()}\n时间: ${payment.paidAt}`)
}

const handleSaveRule = (rule: CommissionRule) => {
  toast.success('规则保存', `佣金比例: ${rule.minRate}% - ${rule.maxRate}%\n默认比例: ${rule.defaultRate}%`)
}

const confirmDeleteRule = (id: string) => {
  if (commissionRules.value.length > 1) {
    confirm.value = {
      show: true,
      title: '删除规则',
      message: '确定要删除此佣金规则吗？',
      type: 'danger',
      onConfirm: () => {
        commissionRules.value = commissionRules.value.filter(r => r.id !== id)
        toast.success('删除成功', '佣金规则已删除')
        confirm.value.show = false
      },
      onCancel: () => {
        confirm.value.show = false
      }
    }
  } else {
    toast.warning('无法删除', '至少需要保留一条佣金规则')
  }
}
</script>
