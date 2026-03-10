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
          <h1 class="text-2xl font-bold text-slate-900">医生结算管理</h1>
          <p class="text-sm text-slate-500 mt-1">专业服务智能结算系统</p>
        </div>
        <div v-if="isDoctor" class="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <span class="text-sm text-amber-700">仅显示我的结算数据</span>
        </div>
      </div>

      <!-- 当前规则提示 -->
      <div v-if="activeTab !== 'rules'" class="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <AlertCircle :size="18" class="text-blue-600" />
            <div>
              <span class="font-semibold text-blue-900">医生结算规则：</span>
            </div>
          </div>
          <div class="text-sm text-blue-800 space-y-1 ml-7">
            <div>• 上线服务费：¥{{ currentRule.onlineRate }}/次</div>
            <div>• 销转提成：7000元以上产品5%提成，中低客单无提成</div>
            <div>• 免费赠送服务：仍需结算¥{{ currentRule.onlineRate }}上线费</div>
            <div>• 多人套餐：按实际人数核算5%提成总额</div>
            <div>• 结算周期：3个月无退费期后结算</div>
          </div>
        </div>
      </div>

      <!-- Tab内容 -->
      <DoctorEmployeesTab
        v-if="activeTab === 'employees'"
        :employees="filteredEmployees"
        :expanded-employees="expandedEmployees"
        @toggle-expand="toggleEmployeeExpand"
        @edit="handleEditEmployee"
        @delete="confirmDeleteEmployee"
        @add="openEmployeeModal"
      />
      <DoctorSettlementsTab
        v-if="activeTab === 'settlements'"
        :settlements="filteredSettlements"
        :selected-period="selectedPeriod"
        :employees="filteredEmployees"
        @update:period="selectedPeriod = $event"
        @generate="handleGenerateSettlement"
        @approve="handleApproveSettlement"
        @reject="handleRejectSettlement"
        @pay="handleProcessPayment"
        @view="viewSettlementDetail"
        @viewHistory="viewHistory"
        @export="handleExportSettlements"
        @batchApprove="handleBatchApprove"
        @clearSelection="() => {}"
      />
      <DoctorPaymentsTab
        v-if="activeTab === 'payments'"
        :payments="payments"
        @retry="handleRetryPayment"
        @view="viewPaymentDetail"
      />
      <DoctorReportsTab
        v-if="activeTab === 'reports'"
        :stats="stats"
        :employees="filteredEmployees"
      />
      <DoctorOnlineTab
        v-if="activeTab === 'online'"
        :records="onlineRecords"
        @add="openOnlineRecordModal"
        @edit="editOnlineRecord"
        @delete="deleteOnlineRecord"
      />
      <DoctorRulesTab
        v-if="activeTab === 'rules'"
        :rules="settlementRules"
        @save="handleSaveRule"
        @delete="confirmDeleteRule"
      />
    </div>

    <!-- 员工编辑/新增模态框 -->
    <Teleport to="body">
      <div v-if="showEmployeeModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">{{ isEditMode ? '编辑医生' : '新增医生' }}</h3>
            <button @click="closeEmployeeModal" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" class="text-slate-500" />
            </button>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">姓名 *</label>
                <input v-model="employeeForm.name" type="text" placeholder="请输入姓名" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">手机号 *</label>
                <input v-model="employeeForm.phone" type="tel" placeholder="请输入手机号" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">身份证号 *</label>
                <input v-model="employeeForm.idCard" type="text" placeholder="请输入身份证号" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">所属科室 *</label>
                <select v-model="employeeForm.department" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">请选择科室</option>
                  <option value="康复医学科">康复医学科</option>
                  <option value="运动医学科">运动医学科</option>
                  <option value="中医科">中医科</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">专业特长</label>
                <input v-model="employeeForm.specialty" type="text" placeholder="如：运动康复" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">职称</label>
                <select v-model="employeeForm.title" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">请选择职称</option>
                  <option value="主任医师">主任医师</option>
                  <option value="副主任医师">副主任医师</option>
                  <option value="主治医师">主治医师</option>
                  <option value="医师">医师</option>
                </select>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">开户银行</label>
                <input v-model="employeeForm.bankName" type="text" placeholder="请输入开户银行" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">银行账号</label>
                <input v-model="employeeForm.bankAccount" type="text" placeholder="请输入银行账号" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
              <textarea v-model="employeeForm.remark" placeholder="请输入备注信息" rows="3" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
            </div>
          </div>
          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="closeEmployeeModal" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">取消</button>
            <button @click="saveEmployee" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">保存</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 结算详情弹窗 -->
    <DoctorSettlementDetailModal
      :show="showSettlementDetail"
      :settlement="currentSettlement"
      @close="showSettlementDetail = false"
      @approve="handleApproveSettlement"
      @pay="handleProcessPayment"
    />
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
  AlertCircle,
  Stethoscope,
  X
} from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import { useToast } from '@/composables/useToast'
import { useRole, type UserRole } from '../composables/useRole'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import Toast from '@/components/shared/Toast.vue'
import DoctorEmployeesTab from './settlement/DoctorEmployeesTab.vue'
import DoctorSettlementsTab from './settlement/DoctorSettlementsTab.vue'
import DoctorPaymentsTab from './settlement/DoctorPaymentsTab.vue'
import DoctorReportsTab from './settlement/DoctorReportsTab.vue'
import DoctorOnlineTab from './settlement/DoctorOnlineTab.vue'
import DoctorRulesTab from './settlement/DoctorRulesTab.vue'
import DoctorSettlementDetailModal from './settlement/DoctorSettlementDetailModal.vue'
import { MOCK_USERS, SERVICE_TYPES } from '@/data/mockUsers'

// Props
interface Props {
  currentRole?: UserRole
}
const props = withDefaults(defineProps<Props>(), {
  currentRole: undefined
})

type TabType = 'employees' | 'settlements' | 'payments' | 'reports' | 'rules' | 'online'

// 获取当前角色信息
const { currentRole: globalRole, currentRoleConfig } = useRole()
const effectiveRole = computed(() => props.currentRole || globalRole.value)

// 判断是否为管理员或财务（可以查看所有医生数据）
const canViewAll = computed(() => {
  return effectiveRole.value === 'admin' || effectiveRole.value === 'finance'
})

// 判断是否为医生角色（只能看自己的数据）
const isDoctor = computed(() => {
  return effectiveRole.value === 'doctor'
})

interface DoctorServiceRecord {
  id: string
  userId: string
  userName: string
  startDate: string
  endDate: string | null  // null 表示至今
  isNewUser: boolean
  serviceHours: number
  onlineCount: number
  managementDuration: number  // 管理时长（天）
  newUserAmount: number
  onlineAmount: number
  totalAmount: number
  avatar?: string
}

interface DoctorEmployee {
  id: string
  name: string
  phone: string
  idCard: string
  bankName: string
  bankAccount: string
  status: 'active' | 'inactive' | 'suspended'
  hireDate: string
  department: string
  specialty: string
  title: string
  totalUsers: number
  newUsers: number
  oldUsers: number
  totalSettled: number
  onlineCount: number
  lastSettleDate?: string
  avatar?: string
  remark?: string
  serviceRecords?: DoctorServiceRecord[]
}

interface DoctorSettlementRule {
  id: string
  name: string
  newUserRate: number
  onlineRate: number
  salesCommissionRate: number // 销转提成比例
  effectiveDate: string
  description: string
}

interface DoctorSettlementRecord {
  id: string
  employeeId: string
  employeeName: string
  period: string
  totalUsers: number
  newUsers: number
  oldUsers: number
  newUserAmount: number // 已废弃，保留为0
  onlineCount: number
  onlineAmount: number
  salesCommissionAmount: number // 销转提成
  totalAmount: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  createdAt: string
  approvedAt?: string
  paidAt?: string
  department?: string
  specialty?: string
  newUserRate?: number
  onlineRate?: number
  salesCommissionRate?: number
  serviceCount?: number // 服务次数 - 零工结算用
  averageRating?: number // 平均评分
  orderCount?: number // 订单数量
  serviceRecords?: Array<{
    id: string
    startDate: string
    endDate: string
    userName: string
    userId: string
    serviceType: string
    interventionDuration: number
    rating: number
    amount: number
    salesCommission?: number // 单条记录的销转提成
  }>
}

interface DoctorPaymentRecord {
  id: string
  settlementId: string
  settlementPeriod: string
  employeeId: string
  employeeName: string
  bankName: string
  bankAccount: string
  amount: number
  paymentMethod: string
  status: string
  transactionId?: string
  paidAt?: string
  operator: string
  createdAt: string
}

interface OnlineRecord {
  id: string
  employeeId: string
  employeeName: string
  userId: string
  userName: string
  date: string
  serviceType: string
  duration: number
  score: number
  remark?: string
}

const tabs = [
  { id: 'employees' as TabType, label: '医生管理', icon: Users },
  { id: 'settlements' as TabType, label: '结算明细', icon: FileText },
  { id: 'payments' as TabType, label: '发放记录', icon: CreditCard },
  { id: 'reports' as TabType, label: '统计报表', icon: BarChart3 },
  { id: 'online' as TabType, label: '上线服务', icon: Stethoscope },
  { id: 'rules' as TabType, label: '规则配置', icon: Settings }
]

const activeTab = ref<TabType>('employees')
const expandedEmployees = ref<Set<string>>(new Set())
const selectedPeriod = ref('2026-02')
const showSettlementDetail = ref(false)
const currentSettlement = ref<DoctorSettlementRecord | null>(null)

// 结算规则
const settlementRules = ref<DoctorSettlementRule[]>([{
  id: '1',
  name: '医生结算标准规则',
  newUserRate: 0, // 医生无新用户管理费
  onlineRate: 200, // 上线服务费200元/次
  salesCommissionRate: 5, // 销转提成5%
  effectiveDate: '2023-01-01',
  description: '上线服务200元/次，7000元以上产品5%销转提成'
}])

const currentRule = computed(() => settlementRules.value[0])

// 医生员工数据
const employees = ref<DoctorEmployee[]>([
  {
    id: '1',
    name: '刘医生',
    phone: '13900139001',
    idCard: '310101198001011234',
    bankName: '中国工商银行',
    bankAccount: '6212260200001234567',
    status: 'active',
    hireDate: '2023-05-10',
    department: '康复医学科',
    specialty: '运动康复',
    title: '主治医师',
    totalUsers: 28,
    newUsers: 5,
    oldUsers: 23,
    totalSettled: 62000,
    onlineCount: 8,
    lastSettleDate: '2024-01-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liu',
    remark: '擅长运动损伤康复',
    serviceRecords: [
      {
        id: 'ds1',
        userId: 'du001',
        userName: '王芳',
        startDate: '2024-01-10',
        endDate: null, // 仍在管理
        isNewUser: true,
        serviceHours: 2,
        onlineCount: 2,
        managementDuration: 45,
        newUserAmount: 0, // 医生无新用户管理费
        onlineAmount: 400, // 2次 × 200元
        salesCommission: 0, // 无销转提成
        totalAmount: 400,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangFang'
      },
      {
        id: 'ds2',
        userId: 'du002',
        userName: '李军',
        startDate: '2023-06-15',
        endDate: '2024-01-15', // 已结束管理
        isNewUser: false,
        serviceHours: 1.5,
        onlineCount: 1,
        managementDuration: 214,
        newUserAmount: 0,
        onlineAmount: 200, // 1次 × 200元
        salesCommission: 0,
        totalAmount: 200,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiJun'
      }
    ]
  },
  {
    id: '2',
    name: '陈医生',
    phone: '13900139002',
    idCard: '310101198002022345',
    bankName: '中国建设银行',
    bankAccount: '6217000030001234567',
    status: 'active',
    hireDate: '2023-07-20',
    department: '康复医学科',
    specialty: '神经康复',
    title: '副主任医师',
    totalUsers: 35,
    newUsers: 10,
    oldUsers: 25,
    totalSettled: 78000,
    onlineCount: 12,
    lastSettleDate: '2026-01-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chen',
    remark: '神经康复专家',
    serviceRecords: [
      {
        id: 'ds3',
        userId: 'du003',
        userName: '赵丽',
        startDate: '2024-01-20',
        endDate: null,
        isNewUser: true,
        serviceHours: 3,
        onlineCount: 3,
        managementDuration: 35,
        newUserAmount: 500,
        onlineAmount: 600,
        totalAmount: 1100,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhaoLi'
      }
    ]
  },
  {
    id: '3',
    name: '杨医生',
    phone: '13900139003',
    idCard: '310101198003033456',
    bankName: '招商银行',
    bankAccount: '6214830200001234567',
    status: 'active',
    hireDate: '2023-09-15',
    department: '康复医学科',
    specialty: '心肺康复',
    title: '医师',
    totalUsers: 22,
    newUsers: 7,
    oldUsers: 15,
    totalSettled: 41000,
    onlineCount: 6,
    lastSettleDate: '2026-01-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yang',
    remark: '心肺功能康复',
    serviceRecords: []
  }
])

// 根据角色过滤员工数据 - 医生只能看到自己，管理员和财务可以看到所有
const filteredEmployees = computed(() => {
  if (canViewAll.value) {
    return employees.value
  }
  // 医生角色：只显示当前登录医生的数据（模拟：假设当前医生是刘医生，id='1'）
  return employees.value.filter(e => e.id === '1')
})

// 结算记录 - 包含历史月份数据，支持零工结算查看
const settlements = ref<DoctorSettlementRecord[]>([
  // 2026年2月 - 当前月份 - 刘医生
  {
    id: '1',
    employeeId: '1',
    employeeName: '刘医生',
    period: '2026-02',
    totalUsers: 32,
    newUsers: 7,
    oldUsers: 25,
    newUserAmount: 3500,
    onlineCount: 15,
    onlineAmount: 3000,
    totalAmount: 6500,
    status: 'pending',
    createdAt: '2026-02-24',
    department: '康复医学科',
    specialty: '运动康复',
    newUserRate: 500,
    onlineRate: 200,
    serviceCount: 62,
    averageRating: 4.9,
    orderCount: 32,
    serviceRecords: [
      {
        id: 'DSR1-0',
        startDate: '2024-01-10',
        endDate: '2026-02-24',
        userName: '王芳',
        userId: 'du001',
        serviceType: '康复评估',
        interventionDuration: 776,
        rating: 5,
        amount: 500
      },
      {
        id: 'DSR1-1',
        startDate: '2024-03-20',
        endDate: '2026-02-24',
        userName: '孙敏',
        userId: 'du004',
        serviceType: '运动指导',
        interventionDuration: 707,
        rating: 5,
        amount: 0
      },
      {
        id: 'DSR1-2',
        startDate: '2024-06-15',
        endDate: '2026-02-24',
        userName: '周涛',
        userId: 'du005',
        serviceType: '康复训练',
        interventionDuration: 619,
        rating: 4,
        amount: 500
      }
    ]
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: '陈医生',
    period: '2026-02',
    totalUsers: 40,
    newUsers: 12,
    oldUsers: 28,
    newUserAmount: 6000,
    onlineCount: 18,
    onlineAmount: 3600,
    totalAmount: 9600,
    status: 'approved',
    createdAt: '2026-02-20',
    approvedAt: '2026-02-22',
    department: '康复医学科',
    specialty: '神经康复',
    newUserRate: 500,
    onlineRate: 200,
    serviceCount: 76,
    averageRating: 4.8,
    orderCount: 40,
    serviceRecords: [
      {
        id: 'DSR2-0',
        startDate: '2024-01-20',
        endDate: '2026-02-24',
        userName: '赵丽',
        userId: 'du003',
        serviceType: '神经康复',
        interventionDuration: 766,
        rating: 5,
        amount: 500
      },
      {
        id: 'DSR2-1',
        startDate: '2024-05-10',
        endDate: '2026-02-24',
        userName: '吴磊',
        userId: 'du006',
        serviceType: '健康咨询',
        interventionDuration: 655,
        rating: 5,
        amount: 0
      }
    ]
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: '杨医生',
    period: '2026-02',
    totalUsers: 26,
    newUsers: 8,
    oldUsers: 18,
    newUserAmount: 4000,
    onlineCount: 10,
    onlineAmount: 2000,
    totalAmount: 6000,
    status: 'pending',
    createdAt: '2026-02-20',
    department: '康复医学科',
    specialty: '心肺康复',
    newUserRate: 500,
    onlineRate: 200,
    serviceCount: 44,
    averageRating: 4.7,
    orderCount: 26
  },
  // 2026年1月
  {
    id: '4',
    employeeId: '1',
    employeeName: '刘医生',
    period: '2026-01',
    totalUsers: 30,
    newUsers: 6,
    oldUsers: 24,
    newUserAmount: 3000,
    onlineCount: 12,
    onlineAmount: 2400,
    totalAmount: 5400,
    status: 'paid',
    createdAt: '2026-02-01',
    approvedAt: '2026-02-03',
    paidAt: '2026-02-08',
    department: '康复医学科',
    specialty: '运动康复',
    newUserRate: 500,
    onlineRate: 200,
    serviceCount: 54,
    averageRating: 4.9,
    orderCount: 30
  },
  {
    id: '5',
    employeeId: '2',
    employeeName: '陈医生',
    period: '2026-01',
    totalUsers: 38,
    newUsers: 10,
    oldUsers: 28,
    newUserAmount: 5000,
    onlineCount: 15,
    onlineAmount: 3000,
    totalAmount: 8000,
    status: 'paid',
    createdAt: '2026-02-01',
    approvedAt: '2026-02-03',
    paidAt: '2026-02-08',
    department: '康复医学科',
    specialty: '神经康复',
    newUserRate: 500,
    onlineRate: 200,
    serviceCount: 68,
    averageRating: 4.8,
    orderCount: 38
  },
  {
    id: '6',
    employeeId: '3',
    employeeName: '杨医生',
    period: '2026-01',
    totalUsers: 24,
    newUsers: 7,
    oldUsers: 17,
    newUserAmount: 3500,
    onlineCount: 8,
    onlineAmount: 1600,
    totalAmount: 5100,
    status: 'paid',
    createdAt: '2026-02-01',
    approvedAt: '2026-02-03',
    paidAt: '2026-02-08',
    department: '康复医学科',
    specialty: '心肺康复',
    newUserRate: 500,
    onlineRate: 200,
    serviceCount: 40,
    averageRating: 4.7,
    orderCount: 24
  },
  // 2025年12月
  {
    id: '7',
    employeeId: '1',
    employeeName: '刘医生',
    period: '2025-12',
    totalUsers: 35,
    newUsers: 9,
    oldUsers: 26,
    newUserAmount: 4500,
    onlineCount: 16,
    onlineAmount: 3200,
    totalAmount: 7700,
    status: 'paid',
    createdAt: '2026-01-01',
    approvedAt: '2026-01-03',
    paidAt: '2026-01-10',
    department: '康复医学科',
    specialty: '运动康复',
    newUserRate: 500,
    onlineRate: 200,
    serviceCount: 67,
    averageRating: 4.9,
    orderCount: 35
  },
  {
    id: '8',
    employeeId: '2',
    employeeName: '陈医生',
    period: '2025-12',
    totalUsers: 42,
    newUsers: 14,
    oldUsers: 28,
    newUserAmount: 7000,
    onlineCount: 20,
    onlineAmount: 4000,
    totalAmount: 11000,
    status: 'paid',
    createdAt: '2026-01-01',
    approvedAt: '2026-01-03',
    paidAt: '2026-01-10',
    department: '康复医学科',
    specialty: '神经康复',
    newUserRate: 500,
    onlineRate: 200,
    serviceCount: 82,
    averageRating: 4.8,
    orderCount: 42
  },
  // 2025年11月
  {
    id: '9',
    employeeId: '1',
    employeeName: '刘医生',
    period: '2025-11',
    totalUsers: 28,
    newUsers: 5,
    oldUsers: 23,
    newUserAmount: 2500,
    onlineCount: 8,
    onlineAmount: 1600,
    totalAmount: 4100,
    status: 'paid',
    createdAt: '2025-12-01',
    approvedAt: '2025-12-03',
    paidAt: '2025-12-08',
    department: '康复医学科',
    specialty: '运动康复',
    newUserRate: 500,
    onlineRate: 200,
    serviceCount: 44,
    averageRating: 4.9,
    orderCount: 28
  }
])

// 支付记录
const payments = ref<DoctorPaymentRecord[]>([
  {
    id: '1',
    settlementId: '1',
    settlementPeriod: '2024-01',
    employeeId: '1',
    employeeName: '刘医生',
    bankName: '中国工商银行',
    bankAccount: '6212260200001234567',
    amount: 4100,
    paymentMethod: 'bank_transfer',
    status: 'success',
    transactionId: 'TXN2024020567890',
    paidAt: '2024-02-05 11:30:00',
    operator: '管理员',
    createdAt: '2024-02-05 11:28:00'
  },
  {
    id: '2',
    settlementId: '2',
    settlementPeriod: '2024-01',
    employeeId: '2',
    employeeName: '陈医生',
    bankName: '中国建设银行',
    bankAccount: '6217000030001234567',
    amount: 7400,
    paymentMethod: 'bank_transfer',
    status: 'success',
    transactionId: 'TXN2024020567891',
    paidAt: '2024-02-05 11:35:00',
    operator: '管理员',
    createdAt: '2024-02-05 11:32:00'
  }
])

// 上线服务记录
const onlineRecords = ref<OnlineRecord[]>([
  {
    id: '1',
    employeeId: '1',
    employeeName: '刘医生',
    userId: 'U001',
    userName: '张三',
    date: '2024-02-15',
    serviceType: '康复评估',
    duration: 30,
    score: 5,
    remark: '服务态度很好'
  },
  {
    id: '2',
    employeeId: '1',
    employeeName: '刘医生',
    userId: 'U002',
    userName: '李四',
    date: '2024-02-14',
    serviceType: '运动指导',
    duration: 45,
    score: 5,
    remark: '专业指导'
  }
])

// 计算属性
const stats = computed(() => {
  const activeEmployees = employees.value.filter(e => e.status === 'active').length
  const totalUsers = employees.value.reduce((sum, e) => sum + e.totalUsers, 0)
  const currentMonthSettlements = settlements.value.filter(s => s.period === selectedPeriod.value)
  const pendingAmount = currentMonthSettlements
    .filter(s => s.status === 'pending' || s.status === 'approved')
    .reduce((sum, s) => sum + s.totalAmount, 0)
  const paidAmount = currentMonthSettlements
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + s.totalAmount, 0)

  return { activeEmployees, totalUsers, pendingAmount, paidAmount }
})

const filteredSettlements = computed(() => {
  let result = settlements.value

  // 根据角色过滤
  if (!canViewAll.value) {
    // 医生角色：只显示当前医生的结算记录
    result = result.filter(s => s.employeeId === '1')
  }

  // 根据选定期间过滤
  if (selectedPeriod.value) {
    result = result.filter(s => s.period === selectedPeriod.value)
  }

  return result
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

const showEmployeeModal = ref(false)
const isEditMode = ref(false)
const selectedEmployee = ref<DoctorEmployee | null>(null)

const employeeForm = ref({
  name: '',
  phone: '',
  idCard: '',
  bankName: '',
  bankAccount: '',
  department: '',
  specialty: '',
  title: '',
  remark: ''
})

const toggleEmployeeExpand = (id: string) => {
  const newExpanded = new Set(expandedEmployees.value)
  if (newExpanded.has(id)) {
    newExpanded.delete(id)
  } else {
    newExpanded.add(id)
  }
  expandedEmployees.value = newExpanded
}

const openEmployeeModal = () => {
  isEditMode.value = false
  employeeForm.value = {
    name: '',
    phone: '',
    idCard: '',
    bankName: '',
    bankAccount: '',
    department: '',
    specialty: '',
    title: '',
    remark: ''
  }
  showEmployeeModal.value = true
}

const closeEmployeeModal = () => {
  showEmployeeModal.value = false
  selectedEmployee.value = null
}

const handleEditEmployee = (employee: DoctorEmployee) => {
  isEditMode.value = true
  selectedEmployee.value = employee
  employeeForm.value = {
    name: employee.name,
    phone: employee.phone,
    idCard: employee.idCard,
    bankName: employee.bankName,
    bankAccount: employee.bankAccount,
    department: employee.department,
    specialty: employee.specialty,
    title: employee.title,
    remark: employee.remark || ''
  }
  showEmployeeModal.value = true
}

const saveEmployee = () => {
  if (!employeeForm.value.name || !employeeForm.value.phone || !employeeForm.value.idCard) {
    toast.error('请填写必填项')
    return
  }

  if (isEditMode.value && selectedEmployee.value) {
    employees.value = employees.value.map(emp =>
      emp.id === selectedEmployee.value!.id
        ? {
            ...emp,
            name: employeeForm.value.name,
            phone: employeeForm.value.phone,
            idCard: employeeForm.value.idCard,
            bankName: employeeForm.value.bankName,
            bankAccount: employeeForm.value.bankAccount,
            department: employeeForm.value.department,
            specialty: employeeForm.value.specialty,
            title: employeeForm.value.title,
            remark: employeeForm.value.remark
          }
        : emp
    )
    toast.success('更新成功', `医生 "${employeeForm.value.name}" 信息已更新`)
  } else {
    const newEmployee: DoctorEmployee = {
      id: Date.now().toString(),
      name: employeeForm.value.name,
      phone: employeeForm.value.phone,
      idCard: employeeForm.value.idCard,
      bankName: employeeForm.value.bankName,
      bankAccount: employeeForm.value.bankAccount,
      status: 'active',
      hireDate: new Date().toISOString().split('T')[0],
      department: employeeForm.value.department,
      specialty: employeeForm.value.specialty,
      title: employeeForm.value.title,
      totalUsers: 0,
      newUsers: 0,
      oldUsers: 0,
      totalSettled: 0,
      onlineCount: 0,
      remark: employeeForm.value.remark
    }
    employees.value.unshift(newEmployee)
    toast.success('添加成功', `医生 "${employeeForm.value.name}" 已添加`)
  }

  showEmployeeModal.value = false
  selectedEmployee.value = null
}

const confirmDeleteEmployee = (id: string) => {
  const employee = employees.value.find(e => e.id === id)
  if (!employee) return

  confirm.value = {
    show: true,
    title: '删除医生',
    message: `确定要删除医生 "${employee.name}" 吗？此操作不可恢复。`,
    type: 'danger',
    onConfirm: () => {
      employees.value = employees.value.filter(e => e.id !== id)
      toast.success('删除成功', `医生 "${employee.name}" 已删除`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const handleGenerateSettlement = () => {
  toast.info('生成结算单', '正在计算本月结算数据...')
  setTimeout(() => {
    toast.success('生成成功', `已为 ${employees.value.filter(e => e.status === 'active').length} 位医生生成结算单`)
  }, 1500)
}

const handleApproveSettlement = (id: string) => {
  const settlement = settlements.value.find(s => s.id === id)
  if (!settlement) return

  confirm.value = {
    show: true,
    title: '审批通过',
    message: `确认审批 "${settlement.employeeName}" 的结算单 ¥${settlement.totalAmount.toLocaleString()} 吗？`,
    type: 'warning',
    onConfirm: () => {
      settlements.value = settlements.value.map(s =>
        s.id === id
          ? { ...s, status: 'approved' as const, approvedAt: new Date().toISOString().split('T')[0] }
          : s
      )
      toast.success('审批成功', `已通过 "${settlement.employeeName}" 的结算审批`)
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
    message: `确认驳回 "${settlement.employeeName}" 的结算单吗？`,
    type: 'danger',
    onConfirm: () => {
      settlements.value = settlements.value.map(s =>
        s.id === id ? { ...s, status: 'rejected' as const } : s
      )
      toast.success('驳回成功', `已驳回 "${settlement.employeeName}" 的结算单`)
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
    message: `确认发放 ¥${settlement.totalAmount.toLocaleString()} 给 "${settlement.employeeName}" 吗？`,
    type: 'warning',
    onConfirm: () => {
      toast.info('处理中', '正在处理银行转账...')
      setTimeout(() => {
        settlements.value = settlements.value.map(s =>
          s.id === id
            ? { ...s, status: 'paid' as const, paidAt: new Date().toISOString().split('T')[0] }
            : s
        )
        // 添加支付记录
        const newPayment: DoctorPaymentRecord = {
          id: Date.now().toString(),
          settlementId: settlement.id,
          settlementPeriod: settlement.period,
          employeeId: settlement.employeeId,
          employeeName: settlement.employeeName,
          bankName: employees.value.find(e => e.id === settlement.employeeId)?.bankName || '',
          bankAccount: employees.value.find(e => e.id === settlement.employeeId)?.bankAccount || '',
          amount: settlement.totalAmount,
          paymentMethod: 'bank_transfer',
          status: 'success',
          transactionId: 'TXN' + Date.now(),
          paidAt: new Date().toLocaleString('zh-CN', { hour12: false }),
          operator: '管理员',
          createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
        }
        payments.value.unshift(newPayment)
        toast.success('发放成功', `已成功发放 ¥${settlement.totalAmount.toLocaleString()}`)
        confirm.value.show = false
      }, 2000)
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const viewSettlementDetail = (settlement: DoctorSettlementRecord) => {
  currentSettlement.value = settlement
  showSettlementDetail.value = true
}

const viewHistory = (settlement: DoctorSettlementRecord) => {
  const historySettlements = settlements.value.filter(
    s => s.employeeId === settlement.employeeId && s.period <= settlement.period
  )
  toast.info('历史结算', `找到 ${historySettlements.length} 条历史结算记录`)
}

const handleExportSettlements = () => {
  toast.info('导出中', '正在导出结算数据...')

  try {
    // 准备导出数据
    const exportData = filteredSettlements.value.map(s => ({
      '结算单号': s.id,
      '医生姓名': s.employeeName,
      '科室': s.department || '内科',
      '结算期间': s.period,
      '在线时长': `${s.onlineHours}小时`,
      '咨询次数': s.consultationCount,
      '基本服务费': s.baseFee,
      '绩效奖金': s.performanceBonus,
      '结算金额': s.totalAmount,
      '状态': s.status === 'pending' ? '待审批' : s.status === 'approved' ? '已审批' : s.status === 'paid' ? '已发放' : '已驳回',
      '创建时间': s.createdAt,
      '审批时间': s.approvedAt || '-',
      '发放时间': s.paidAt || '-'
    }))

    // 创建工作簿
    const wb = XLSX.utils.book_new()

    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(exportData)

    // 设置列宽
    ws['!cols'] = [
      { wch: 15 }, // 结算单号
      { wch: 12 }, // 医生姓名
      { wch: 12 }, // 科室
      { wch: 12 }, // 结算期间
      { wch: 12 }, // 在线时长
      { wch: 10 }, // 咨询次数
      { wch: 12 }, // 基本服务费
      { wch: 12 }, // 绩效奖金
      { wch: 12 }, // 结算金额
      { wch: 10 }, // 状态
      { wch: 20 }, // 创建时间
      { wch: 20 }, // 审批时间
      { wch: 20 }  // 发放时间
    ]

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '医生结算明细')

    // 生成文件名
    const fileName = `医生结算明细_${selectedPeriod.value}_${new Date().toISOString().split('T')[0]}.xlsx`

    // 导出文件
    XLSX.writeFile(wb, fileName)

    toast.success('导出成功', `结算数据已导出为 ${fileName}`)
  } catch (error) {
    console.error('导出失败:', error)
    toast.error('导出失败', '导出结算数据时发生错误，请重试')
  }
}

const handleBatchApprove = (ids: string[]) => {
  confirm.value = {
    show: true,
    title: '批量审批',
    message: `确认批量审批 ${ids.length} 条结算单吗？`,
    type: 'warning',
    onConfirm: () => {
      ids.forEach(id => {
        const settlement = settlements.value.find(s => s.id === id)
        if (settlement && settlement.status === 'pending') {
          settlement.status = 'approved'
          settlement.approvedAt = new Date().toISOString().split('T')[0]
        }
      })
      toast.success('批量审批成功', `已通过 ${ids.length} 条结算单`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const handleRetryPayment = (id: string) => {
  const payment = payments.value.find(p => p.id === id)
  if (!payment) return

  toast.info('重试支付', `正在重试支付给 ${payment.employeeName}...`)
  setTimeout(() => {
    toast.success('重试成功', `已成功支付 ¥${payment.amount.toLocaleString()}`)
  }, 1500)
}

const viewPaymentDetail = (payment: DoctorPaymentRecord) => {
  toast.info('支付详情', `交易号: ${payment.transactionId}\n金额: ¥${payment.amount.toLocaleString()}\n时间: ${payment.paidAt}`)
}

const openOnlineRecordModal = () => {
  toast.info('添加服务记录', '上线服务记录功能开发中')
}

const editOnlineRecord = (record: OnlineRecord) => {
  toast.info('编辑服务记录', `编辑 ${record.employeeName} 的服务记录`)
}

const deleteOnlineRecord = (id: string) => {
  const record = onlineRecords.value.find(r => r.id === id)
  if (!record) return

  confirm.value = {
    show: true,
    title: '删除服务记录',
    message: `确定要删除这条服务记录吗？`,
    type: 'danger',
    onConfirm: () => {
      onlineRecords.value = onlineRecords.value.filter(r => r.id !== id)
      toast.success('删除成功', '服务记录已删除')
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const handleSaveRule = (rule: DoctorSettlementRule) => {
  toast.success('规则保存', `新用户费率: ¥${rule.newUserRate}/人\n上线费率: ¥${rule.onlineRate}/次`)
}

const confirmDeleteRule = (id: string) => {
  if (settlementRules.value.length > 1) {
    confirm.value = {
      show: true,
      title: '删除规则',
      message: '确定要删除此结算规则吗？',
      type: 'danger',
      onConfirm: () => {
        settlementRules.value = settlementRules.value.filter(r => r.id !== id)
        toast.success('删除成功', '结算规则已删除')
        confirm.value.show = false
      },
      onCancel: () => {
        confirm.value.show = false
      }
    }
  } else {
    toast.warning('无法删除', '至少需要保留一条结算规则')
  }
}
</script>
