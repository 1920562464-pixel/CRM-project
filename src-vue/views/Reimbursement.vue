<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold flex items-center gap-2" :style="{ color: 'var(--text-primary)' }">
          <Receipt :size="28" style="color: #10b981;" />
          报销管理
        </h1>
        <p class="text-sm mt-1" :style="{ color: 'var(--text-secondary)' }">按部门-人员查看和管理报销</p>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="rounded-xl p-5 shadow-lg" style="background: linear-gradient(to bottom right, #3b82f6, #2563eb); color: white;">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">待审批</span>
          <Clock :size="20" />
        </div>
        <div class="text-3xl font-bold">{{ statistics.pendingCount }}</div>
        <div class="text-xs opacity-75 mt-2">笔待审批</div>
      </div>

      <div class="rounded-xl p-5 shadow-lg" style="background: linear-gradient(to bottom right, #3b82f6, #2563eb); color: white;">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">本月总额</span>
          <DollarSign :size="20" />
        </div>
        <div class="text-3xl font-bold">¥{{ statistics.monthlyTotal.toLocaleString() }}</div>
        <div class="text-xs opacity-75 mt-2">本月报销金额</div>
      </div>

      <div class="rounded-xl p-5 shadow-lg" style="background: linear-gradient(to bottom right, #f97316, #ea580c); color: white;">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">待支付</span>
          <CreditCard :size="20" />
        </div>
        <div class="text-3xl font-bold">¥{{ statistics.pendingPayment.toLocaleString() }}</div>
        <div class="text-xs opacity-75 mt-2">{{ statistics.approvedCount }} 笔已审批</div>
      </div>

      <div class="rounded-xl p-5 shadow-lg" style="background: linear-gradient(to bottom right, #10b981, #059669); color: white;">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">已支付</span>
          <CheckCircle :size="20" />
        </div>
        <div class="text-3xl font-bold">¥{{ statistics.paidTotal.toLocaleString() }}</div>
        <div class="text-xs opacity-75 mt-2">累计已支付</div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="rounded-xl p-4 shadow-sm" :style="{
      background: 'var(--card)',
      border: '1px solid var(--border)'
    }">
      <div class="flex items-center gap-3 flex-wrap">
        <div class="relative flex-1 min-w-[200px]">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2" :size="16" :style="{ color: 'var(--text-placeholder)' }" />
          <input
            v-model="searchText"
            type="text"
            placeholder="搜索姓名、编号..."
            class="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
            :style="{
              border: '1px solid var(--border)',
              background: 'var(--background)',
              color: 'var(--text-primary)',
              '--tw-ring-color': 'rgba(16, 185, 129, 0.5)'
            }"
          />
        </div>

        <select
          v-model="statusFilter"
          class="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
          :style="{
            border: '1px solid var(--border)',
            background: 'var(--background)',
            color: 'var(--text-primary)',
            '--tw-ring-color': 'rgba(16, 185, 129, 0.5)'
          }"
        >
          <option value="">所有状态</option>
          <option value="draft">草稿</option>
          <option value="submitted">已提交</option>
          <option value="approved">已审批</option>
          <option value="paid">已支付</option>
          <option value="rejected">已拒绝</option>
        </select>

        <select
          v-model="departmentFilter"
          class="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
          :style="{
            border: '1px solid var(--border)',
            background: 'var(--background)',
            color: 'var(--text-primary)',
            '--tw-ring-color': 'rgba(16, 185, 129, 0.5)'
          }"
        >
          <option value="">所有部门</option>
          <option value="教练部">教练部</option>
          <option value="医疗部">医疗部</option>
          <option value="运营部">运营部</option>
          <option value="前台部">前台部</option>
        </select>

        <button
          @click="exportData"
          class="px-4 py-2 text-white rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          style="background: #10b981;"
        >
          <Download :size="16" />
          导出数据
        </button>
      </div>
    </div>

    <!-- 按部门-人员显示报销 -->
    <div class="space-y-6">
      <!-- 教练部 -->
      <DepartmentSection
        v-if="filteredDepartment('教练部')"
        :department="'教练部'"
        :people="filteredPeopleByDepartment('教练部')"
        :status-filter="statusFilter"
        @view-detail="viewPersonDetail"
      />

      <!-- 医疗部 -->
      <DepartmentSection
        v-if="filteredDepartment('医疗部')"
        :department="'医疗部'"
        :people="filteredPeopleByDepartment('医疗部')"
        :status-filter="statusFilter"
        @view-detail="viewPersonDetail"
      />

      <!-- 运营部 -->
      <DepartmentSection
        v-if="filteredDepartment('运营部')"
        :department="'运营部'"
        :people="filteredPeopleByDepartment('运营部')"
        :status-filter="statusFilter"
        @view-detail="viewPersonDetail"
      />

      <!-- 前台部 -->
      <DepartmentSection
        v-if="filteredDepartment('前台部')"
        :department="'前台部'"
        :people="filteredPeopleByDepartment('前台部')"
        :status-filter="statusFilter"
        @view-detail="viewPersonDetail"
      />

      <!-- 无数据提示 -->
      <div v-if="Object.keys(groupedReimbursements).length === 0" class="bg-slate-100 rounded-xl p-12 text-center">
        <Receipt :size="48" class="mx-auto mb-3 text-slate-300" />
        <h3 class="text-lg font-semibold text-slate-700 mb-2">暂无报销记录</h3>
        <p class="text-slate-500">当前筛选条件下没有找到报销记录</p>
      </div>
    </div>

    <!-- 个人报销详情弹窗 -->
    <PersonDetailModal
      :show="showPersonModal"
      :person="selectedPerson"
      @close="showPersonModal = false"
      @approve="handleApprove"
      @reject="handleReject"
      @pay="handlePay"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'

// 主题相关
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')
import { useToast } from '../composables/useToast'
import {
  Receipt,
  Clock,
  DollarSign,
  CheckCircle,
  CreditCard,
  Search,
  Download
} from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import DepartmentSection from '../components/DepartmentSection.vue'
import PersonDetailModal from '../components/PersonDetailModal.vue'

const toast = useToast()

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
  attachments?: string[]
  department: string
  personName: string
  personId: string
  avatar?: string
}

interface PersonSummary {
  id: string
  name: string
  department: string
  avatar?: string
  position?: string
  reimbursements: ReimbursementItem[]
  totalAmount: number
  pendingCount: number
  paidCount: number
  totalCount: number
}

// 状态
const searchText = ref('')
const statusFilter = ref('')
const departmentFilter = ref('')
const showPersonModal = ref(false)
const selectedPerson = ref<PersonSummary | null>(null)

// 模拟报销数据 - 按部门和人员组织
const reimbursements = ref<ReimbursementItem[]>([
  {
    id: '1',
    code: 'RE2025012001',
    title: '乳清蛋白粉采购',
    description: '为会员采购训练用蛋白粉',
    type: 'purchase',
    amount: 6400,
    date: '2025-01-20',
    status: 'approved',
    department: '教练部',
    personName: '张教练',
    personId: 'c001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
    approver: '财务-张经理',
    approvalDate: '2025-01-21'
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
    department: '教练部',
    personName: '张教练',
    personId: 'c001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang'
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
    department: '教练部',
    personName: '李教练',
    personId: 'c002',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li'
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
    department: '教练部',
    personName: '王教练',
    personId: 'c003',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang'
  },
  {
    id: '5',
    code: 'RE2025011605',
    title: '医疗设备采购',
    description: '采购康复训练设备',
    type: 'purchase',
    amount: 8500,
    date: '2025-01-16',
    status: 'approved',
    department: '医疗部',
    personName: '刘医生',
    personId: 'd001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liu'
  },
  {
    id: '6',
    code: 'RE2025011506',
    title: '学术会议差旅费',
    description: '参加康复医学学术会议',
    type: 'other',
    amount: 2300,
    date: '2025-01-15',
    status: 'paid',
    department: '医疗部',
    personName: '刘医生',
    personId: 'd001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liu'
  },
  {
    id: '7',
    code: 'RE2025011407',
    title: '市场活动费用',
    description: '线下推广活动物料采购',
    type: 'other',
    amount: 1500,
    date: '2025-01-14',
    status: 'approved',
    department: '运营部',
    personName: '陈顾问',
    personId: 'o001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chen'
  },
  {
    id: '8',
    code: 'RE2025011308',
    title: '办公用品采购',
    description: '前台办公用品采购',
    type: 'purchase',
    amount: 320,
    date: '2025-01-13',
    status: 'paid',
    department: '前台部',
    personName: '王前台',
    personId: 'r001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang'
  }
])

// 按部门分组人员
const groupedPeople = computed(() => {
  const peopleMap = new Map<string, PersonSummary>()

  reimbursements.value.forEach(item => {
    const key = `${item.department}-${item.personId}`

    if (!peopleMap.has(key)) {
      peopleMap.set(key, {
        id: item.personId,
        name: item.personName,
        department: item.department,
        avatar: item.avatar,
        position: '',
        reimbursements: [],
        totalAmount: 0,
        pendingCount: 0,
        paidCount: 0,
        totalCount: 0
      })
    }

    const person = peopleMap.get(key)!
    person.reimbursements.push(item)
    person.totalAmount += item.amount
    person.totalCount += 1

    if (item.status === 'draft' || item.status === 'submitted') {
      person.pendingCount += 1
    } else if (item.status === 'paid') {
      person.paidCount += 1
    }
  })

  return Array.from(peopleMap.values())
})

// 按部门组织数据
const groupedReimbursements = computed(() => {
  const groups: Record<string, PersonSummary[]> = {}

  groupedPeople.value.forEach(person => {
    if (!groups[person.department]) {
      groups[person.department] = []
    }
    groups[person.department].push(person)
  })

  return groups
})

// 过滤后的部门数据
const filteredPeopleByDepartment = (department: string) => {
  let people = groupedReimbursements.value[department] || []

  // 按状态筛选
  if (statusFilter.value) {
    people = people.map(person => ({
      ...person,
      reimbursements: person.reimbursements.filter(r => r.status === statusFilter.value)
    })).filter(person => person.reimbursements.length > 0)
  }

  // 搜索筛选
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase()
    people = people.filter(person =>
      person.name.toLowerCase().includes(searchLower) ||
      person.id.toLowerCase().includes(searchLower)
    )
  }

  return people
}

// 检查部门是否有数据
const filteredDepartment = (department: string) => {
  const people = filteredPeopleByDepartment(department)
  const hasData = people.length > 0

  // 如果选择了部门筛选
  if (departmentFilter.value && departmentFilter.value !== department) {
    return false
  }

  return hasData
}

// 统计数据
const statistics = computed(() => {
  const pendingCount = reimbursements.value.filter(r => r.status === 'submitted').length
  const monthlyTotal = reimbursements.value
    .filter(r => r.date.startsWith('2025-01'))
    .reduce((sum, r) => sum + r.amount, 0)
  const approvedItems = reimbursements.value.filter(r => r.status === 'approved')
  const approvedCount = approvedItems.length
  const pendingPayment = approvedItems.reduce((sum, r) => sum + r.amount, 0)
  const paidTotal = reimbursements.value
    .filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0)

  return { pendingCount, monthlyTotal, pendingPayment, paidTotal, approvedCount }
})

// 查看个人详情
const viewPersonDetail = (person: PersonSummary) => {
  selectedPerson.value = person
  showPersonModal.value = true
}

// 审批操作
const handleApprove = (id: string) => {
  const item = reimbursements.value.find(r => r.id === id)
  if (item) {
    item.status = 'approved'
    toast.success('审批通过', '报销申请已通过')
  }
}

const handleReject = (id: string) => {
  const item = reimbursements.value.find(r => r.id === id)
  if (item) {
    item.status = 'rejected'
    toast.info('已拒绝', '报销申请已拒绝')
  }
}

const handlePay = (id: string) => {
  const item = reimbursements.value.find(r => r.id === id)
  if (item) {
    item.status = 'paid'
    toast.success('支付成功', '报销款项已支付')
  }
}

// 导出数据
const exportData = () => {
  const data = reimbursements.value.map(item => ({
    '编号': item.code,
    '部门': item.department,
    '申请人': item.personName,
    '报销内容': item.title,
    '类型': getTypeName(item.type),
    '金额': item.amount,
    '申请日期': item.date,
    '状态': getStatusName(item.status)
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '报销记录')
  XLSX.writeFile(wb, `报销数据_${new Date().toISOString().split('T')[0]}.xlsx`)

  toast.success('导出成功', '数据已导出为Excel文件')
}

// 工具方法
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
</script>

<style scoped>
@import url('tailwindcss/base');
@import url('tailwindcss/components');
@import url('tailwindcss/utilities');
</style>
