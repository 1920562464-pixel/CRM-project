<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- 欢迎区域 -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">{{ greetingText }}，{{ currentUserName }}</h2>
        <p class="text-slate-500 mt-1">{{ currentDateText }}，您有 {{ priorityTasksCount }} 项重点待办事项。</p>
      </div>
      <div class="flex gap-3">
        <button
          @click="handleQuickAction('calendar')"
          class="px-4 py-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 shadow-sm flex items-center gap-2"
        >
          <Calendar :size="18" />
          日程安排
        </button>
        <button
          @click="handleQuickAction('new-task')"
          class="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus :size="18" />
          新建任务
        </button>
      </div>
    </div>

    <!-- 角色专属统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardCard
        v-for="card in roleStats"
        :key="card.id"
        v-bind="card"
        @click="handleCardClick(card)"
      />
    </div>

    <!-- 主要内容区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 待办任务列表 -->
      <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div class="p-6 border-b border-slate-100">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle :size="20" class="text-indigo-600" />
              {{ taskListTitle }}
            </h3>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500">
                已完成 {{ completedTasksCount }}/{{ totalTasksCount }}
              </span>
              <button
                class="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                @click="viewAllTasks"
              >
                查看全部 <ArrowRight :size="16" />
              </button>
            </div>
          </div>

          <!-- 搜索和筛选 -->
          <div class="flex gap-3">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索任务..."
                class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              v-model="taskFilter"
              class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">全部</option>
              <option value="pending">待完成</option>
              <option value="completed">已完成</option>
            </select>
          </div>
        </div>

        <!-- 任务列表 -->
        <div class="p-6 space-y-3 max-h-[500px] overflow-y-auto">
          <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="flex items-start gap-3 p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md"
            :class="task.completed ? 'bg-slate-50 border-slate-200 opacity-75' : 'bg-white border-slate-200'"
          >
            <button
              @click="toggleTask(task.id)"
              class="mt-0.5 flex-shrink-0"
            >
              <CheckCircle
                :size="20"
                :class="task.completed ? 'text-green-500' : 'text-slate-300 hover:text-green-500'"
              />
            </button>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h4
                  class="font-medium text-slate-900 truncate"
                  :class="{ 'line-through text-slate-500': task.completed }"
                >
                  {{ task.title }}
                </h4>
                <span
                  v-if="task.priority === 'high'"
                  class="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full flex-shrink-0"
                >
                  紧急
                </span>
              </div>
              <p
                v-if="task.description"
                class="text-sm text-slate-600 mb-2 line-clamp-2"
                :class="{ 'line-through': task.completed }"
              >
                {{ task.description }}
              </p>
              <div class="flex items-center gap-3 text-xs text-slate-500">
                <span class="flex items-center gap-1">
                  <Clock :size="12" />
                  {{ task.time }}
                </span>
                <span
                  v-if="task.tag"
                  class="px-2 py-0.5 rounded-full"
                  :class="getTagColor(task.tag)"
                >
                  {{ task.tag }}
                </span>
              </div>
            </div>
            <button
              @click="deleteTask(task.id)"
              class="p-1 text-slate-400 hover:text-red-600 transition-colors"
            >
              <Trash2 :size="16" />
            </button>
          </div>

          <div
            v-if="filteredTasks.length === 0"
            class="text-center py-12 text-slate-500"
          >
            <CheckCircle :size="48" class="text-slate-300 mx-auto mb-4" />
            <p>暂无任务</p>
          </div>
        </div>
      </div>

      <!-- 右侧信息面板 -->
      <div class="space-y-6">
        <!-- 快捷操作 -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Zap :size="18" class="text-amber-500" />
            快捷操作
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="action in quickActions"
              :key="action.id"
              @click="handleQuickAction(action.action)"
              class="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
            >
              <component :is="action.icon" :size="24" class="text-slate-600 group-hover:text-indigo-600 mb-2" />
              <span class="text-xs font-medium text-slate-700 group-hover:text-indigo-700 text-center">
                {{ action.label }}
              </span>
            </button>
          </div>
        </div>

        <!-- 最新动态 -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div class="p-6 border-b border-slate-100">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
              <Bell :size="18" class="text-indigo-600" />
              最新动态
            </h3>
          </div>
          <div class="p-6 space-y-4 max-h-[300px] overflow-y-auto">
            <div
              v-for="activity in recentActivities"
              :key="activity.id"
              class="flex items-start gap-3"
            >
              <div
                class="p-2 rounded-lg flex-shrink-0"
                :class="activity.iconBg"
              >
                <component :is="activity.icon" :size="16" :class="activity.iconColor" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-slate-900 font-medium">{{ activity.title }}</p>
                <p class="text-xs text-slate-500 mt-0.5">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据概览 -->
        <div
          v-if="dataOverview"
          class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
        >
          <h3 class="font-bold mb-4 flex items-center gap-2">
            <BarChart3 :size="18" />
            {{ dataOverview.title }}
          </h3>
          <div class="space-y-3">
            <div
              v-for="item in dataOverview.items"
              :key="item.label"
              class="flex justify-between items-center"
            >
              <span class="text-sm opacity-90">{{ item.label }}</span>
              <span class="font-bold">{{ item.value }}</span>
            </div>
          </div>
          <div
            v-if="dataOverview.progress !== undefined"
            class="mt-4"
          >
            <div class="flex justify-between text-xs mb-1">
              <span>目标完成度</span>
              <span>{{ dataOverview.progress }}%</span>
            </div>
            <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                class="h-full bg-white rounded-full transition-all"
                :style="{ width: dataOverview.progress + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 角色专属功能模块 -->
    <div
      v-if="roleModules.length > 0"
      class="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
    >
      <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Grid3x3 :size="18" class="text-indigo-600" />
        功能模块
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <button
          v-for="module in roleModules"
          :key="module.id"
          @click="navigateToModule(module.path)"
          class="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
        >
          <div
            class="p-3 rounded-xl mb-2"
            :class="module.iconBg"
          >
            <component :is="module.icon" :size="24" :class="module.iconColor" />
          </div>
          <span class="text-sm font-medium text-slate-700 group-hover:text-indigo-700">
            {{ module.name }}
          </span>
          <span class="text-xs text-slate-500 mt-1">
            {{ module.description }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { useRole } from '../composables/useRole'
import {
  CheckCircle,
  Clock,
  Calendar,
  Plus,
  Search,
  ArrowRight,
  Trash2,
  Zap,
  Bell,
  BarChart3,
  Grid3x3,
  Users,
  DollarSign,
  FileText,
  Package,
  Wallet,
  TrendingUp,
  Activity,
  Phone,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Receipt,
  Calculator,
  Settings,
  ListTodo
} from 'lucide-vue-next'
import DashboardCard from './DashboardCard.vue'

// Types
interface Task {
  id: string
  title: string
  description?: string
  time: string
  tag?: string
  priority?: 'high' | 'medium' | 'low'
  completed: boolean
}

interface DashboardStats {
  id: string
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down'
  subtitle?: string
  icon: any
  color: string
  bgColor: string
}

interface QuickAction {
  id: string
  label: string
  icon: any
  action: string
}

interface ActivityItem {
  id: string
  title: string
  time: string
  icon: any
  iconBg: string
  iconColor: string
}

interface RoleModule {
  id: string
  name: string
  description: string
  icon: any
  iconBg: string
  iconColor: string
  path: string
}

const router = useRouter()
const { currentRole, currentRoleConfig } = useRole()

// State
const searchQuery = ref('')
const taskFilter = ref<'all' | 'pending' | 'completed'>('all')
const currentUserName = ref('用户')
const greetingText = ref('早上好')

// 角色专属统计数据 - 使用 markRaw 包装图标组件
const roleStats = computed<DashboardStats[]>(() => {
  const statsMap: Record<string, DashboardStats[]> = {
    admin: [
      {
        id: 'total-users',
        title: '系统用户总数',
        value: '1,248',
        change: '+12',
        changeType: 'up',
        subtitle: '较上月',
        icon: markRaw(Users),
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
      },
      {
        id: 'monthly-revenue',
        title: '本月收入',
        value: '¥128,500',
        change: '+8.5%',
        changeType: 'up',
        subtitle: '较上月',
        icon: markRaw(DollarSign),
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        id: 'pending-tasks',
        title: '待办事项',
        value: priorityTasksCount.value,
        subtitle: '需处理',
        icon: markRaw(CheckCircle2),
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      },
      {
        id: 'system-health',
        title: '系统状态',
        value: '98%',
        subtitle: '运行正常',
        icon: markRaw(Activity),
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50'
      }
    ],
    coach: [
      {
        id: 'my-users',
        title: '管理用户',
        value: '48',
        change: '+3',
        changeType: 'up',
        subtitle: '本月新增',
        icon: markRaw(Users),
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
      },
      {
        id: 'followups',
        title: '今日跟进',
        value: '8',
        subtitle: '待完成',
        icon: markRaw(Phone),
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      },
      {
        id: 'completion-rate',
        title: '依从率',
        value: '85%',
        change: '+2%',
        changeType: 'up',
        subtitle: '本周平均',
        icon: markRaw(TrendingUp),
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        id: 'monthly-performance',
        title: '本月绩效',
        value: '82%',
        subtitle: '目标完成度',
        icon: markRaw(BarChart3),
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      }
    ],
    doctor: [
      {
        id: 'patients',
        title: '服务患者',
        value: '86',
        change: '+5',
        changeType: 'up',
        subtitle: '本月新增',
        icon: markRaw(UserCheck),
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
      },
      {
        id: 'consultations',
        title: '今日咨询',
        value: '12',
        subtitle: '待处理',
        icon: markRaw(Phone),
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      },
      {
        id: 'prescriptions',
        title: '处方审核',
        value: '3',
        subtitle: '待审核',
        icon: markRaw(FileText),
        color: 'text-amber-600',
        bgColor: 'bg-amber-50'
      },
      {
        id: 'effectiveness',
        title: '有效率',
        value: '92%',
        subtitle: '综合评估',
        icon: markRaw(Activity),
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      }
    ],
    consultant: [
      {
        id: 'clients',
        title: '服务客户',
        value: '124',
        change: '+8',
        changeType: 'up',
        subtitle: '本月新增',
        icon: markRaw(Users),
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
      },
      {
        id: 'first-calls',
        title: '首通电话',
        value: '6',
        subtitle: '今日待完成',
        icon: markRaw(Phone),
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      },
      {
        id: 'commission',
        title: '本月佣金',
        value: '¥4,800',
        change: '+12%',
        changeType: 'up',
        subtitle: '较上月',
        icon: markRaw(DollarSign),
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        id: 'conversion-rate',
        title: '转化率',
        value: '68%',
        subtitle: '付费转化',
        icon: markRaw(TrendingUp),
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      }
    ],
    finance: [
      {
        id: 'monthly-income',
        title: '本月收入',
        value: '¥128,500',
        change: '+12.5%',
        changeType: 'up',
        subtitle: '较上月',
        icon: markRaw(DollarSign),
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        id: 'monthly-expense',
        title: '本月支出',
        value: '¥86,200',
        change: '+8.3%',
        changeType: 'up',
        subtitle: '较上月',
        icon: markRaw(Wallet),
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      },
      {
        id: 'accounts-receivable',
        title: '应收账款',
        value: '¥45,600',
        subtitle: '32笔待收款',
        icon: markRaw(Receipt),
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      },
      {
        id: 'accounts-payable',
        title: '应付账款',
        value: '¥32,400',
        subtitle: '18笔待付',
        icon: markRaw(AlertTriangle),
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      }
    ]
  }

  return statsMap[currentRole.value] || statsMap.admin
})

// 角色专属快捷操作
const quickActions = computed<QuickAction[]>(() => {
  const actionsMap: Record<string, QuickAction[]> = {
    admin: [
      { id: '1', label: '用户管理', icon: markRaw(Users), action: 'user-management' },
      { id: '2', label: '系统设置', icon: markRaw(Settings), action: 'settings' },
      { id: '3', label: '数据报表', icon: markRaw(BarChart3), action: 'reports' },
      { id: '4', label: '审核中心', icon: markRaw(CheckCircle2), action: 'reviews' }
    ],
    coach: [
      { id: '1', label: '发起回访', icon: markRaw(Phone), action: 'call' },
      { id: '2', label: '查看档案', icon: markRaw(FileText), action: 'profile' },
      { id: '3', label: '批量任务', icon: markRaw(ListTodo), action: 'batch-tasks' },
      { id: '4', label: '异常预警', icon: markRaw(AlertTriangle), action: 'alerts' },
      { id: '5', label: '运动打卡', icon: markRaw(Activity), action: 'activity' }
    ],
    doctor: [
      { id: '1', label: '在线咨询', icon: markRaw(Phone), action: 'consultation' },
      { id: '2', label: '处方审核', icon: markRaw(FileText), action: 'review' },
      { id: '3', label: '患者列表', icon: markRaw(Users), action: 'patients' },
      { id: '4', label: '健康评估', icon: markRaw(Activity), action: 'assessment' }
    ],
    consultant: [
      { id: '1', label: '首通电话', icon: markRaw(Phone), action: 'first-call' },
      { id: '2', label: '客户跟进', icon: markRaw(UserCheck), action: 'followup' },
      { id: '3', label: '订单查询', icon: markRaw(Package), action: 'orders' },
      { id: '4', label: '业绩统计', icon: markRaw(TrendingUp), action: 'performance' }
    ],
    finance: [
      { id: '1', label: '收入录入', icon: markRaw(DollarSign), action: 'income' },
      { id: '2', label: '应付审核', icon: markRaw(Receipt), action: 'payable' },
      { id: '3', label: '资金流水', icon: markRaw(Wallet), action: 'funds' },
      { id: '4', label: '成本核算', icon: markRaw(Calculator), action: 'cost' }
    ]
  }

  return actionsMap[currentRole.value] || []
})

// 角色专属功能模块
const roleModules = computed<RoleModule[]>(() => {
  const modulesMap: Record<string, RoleModule[]> = {
    admin: [
      { id: '1', name: '客户管理', description: '会员信息管理', icon: markRaw(Users), iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', path: '/client-list' },
      { id: '2', name: '库存管理', description: '商品库存管理', icon: markRaw(Package), iconBg: 'bg-cyan-50', iconColor: 'text-cyan-600', path: '/inventory-management' },
      { id: '3', name: '资产管理', description: '固定资产管理', icon: markRaw(Grid3x3), iconBg: 'bg-purple-50', iconColor: 'text-purple-600', path: '/asset-management' },
      { id: '4', name: '财务中心', description: '财务数据管理', icon: markRaw(Wallet), iconBg: 'bg-green-50', iconColor: 'text-green-600', path: '/finance-center' },
      { id: '5', name: '报销管理', description: '费用报销审批', icon: markRaw(Receipt), iconBg: 'bg-orange-50', iconColor: 'text-orange-600', path: '/coach-reimbursement' },
      { id: '6', name: '系统管理', description: '系统配置管理', icon: markRaw(Settings), iconBg: 'bg-slate-50', iconColor: 'text-slate-600', path: '/system-management' }
    ],
    coach: [
      { id: '1', name: '我的客户', description: '查看负责客户', icon: markRaw(Users), iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', path: '/client-list' },
      { id: '2', name: '客情概览', description: '客户跟进情况', icon: markRaw(Activity), iconBg: 'bg-green-50', iconColor: 'text-green-600', path: '/lead-management' },
      { id: '3', name: '批量任务', description: '批量化任务处理', icon: markRaw(ListTodo), iconBg: 'bg-rose-50', iconColor: 'text-rose-600', path: '/batch-task-processor' },
      { id: '4', name: '大屏监控', description: '实时数据监控', icon: markRaw(BarChart3), iconBg: 'bg-purple-50', iconColor: 'text-purple-600', path: '/sales-monitor' },
      { id: '5', name: '报销管理', description: '费用报销申请', icon: markRaw(Receipt), iconBg: 'bg-orange-50', iconColor: 'text-orange-600', path: '/coach-reimbursement' }
    ],
    doctor: [
      { id: '1', name: '患者管理', description: '患者信息管理', icon: markRaw(UserCheck), iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', path: '/client-list' },
      { id: '2', name: '在线咨询', description: '在线问诊服务', icon: markRaw(Phone), iconBg: 'bg-green-50', iconColor: 'text-green-600', path: '/ai-chat' },
      { id: '3', name: '知识库', description: '医学知识查询', icon: markRaw(FileText), iconBg: 'bg-purple-50', iconColor: 'text-purple-600', path: '/knowledge-base' },
      { id: '4', name: '报销管理', description: '费用报销申请', icon: markRaw(Receipt), iconBg: 'bg-orange-50', iconColor: 'text-orange-600', path: '/coach-reimbursement' }
    ],
    consultant: [
      { id: '1', name: '客户列表', description: '客户信息管理', icon: markRaw(Users), iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600', path: '/client-list' },
      { id: '2', name: '客情概览', description: '跟进情况概览', icon: markRaw(Activity), iconBg: 'bg-green-50', iconColor: 'text-green-600', path: '/lead-management' },
      { id: '3', name: '大屏监控', description: '实时数据监控', icon: markRaw(BarChart3), iconBg: 'bg-purple-50', iconColor: 'text-purple-600', path: '/sales-monitor' },
      { id: '4', name: '报销管理', description: '费用报销申请', icon: markRaw(Receipt), iconBg: 'bg-orange-50', iconColor: 'text-orange-600', path: '/coach-reimbursement' }
    ],
    finance: [
      { id: '1', name: '收入管理', description: '收入数据管理', icon: markRaw(DollarSign), iconBg: 'bg-green-50', iconColor: 'text-green-600', path: '/finance-center' },
      { id: '2', name: '应收账款', description: '应收款管理', icon: markRaw(Receipt), iconBg: 'bg-purple-50', iconColor: 'text-purple-600', path: '/finance-center' },
      { id: '3', name: '资金管理', description: '资金流水管理', icon: markRaw(Wallet), iconBg: 'bg-blue-50', iconColor: 'text-blue-600', path: '/finance-center' },
      { id: '4', name: '财务报表', description: '财务数据报表', icon: markRaw(BarChart3), iconBg: 'bg-pink-50', iconColor: 'text-pink-600', path: '/finance-center' },
      { id: '5', name: '成本核算', description: '成本数据分析', icon: markRaw(Calculator), iconBg: 'bg-amber-50', iconColor: 'text-amber-600', path: '/finance-center' },
      { id: '6', name: '预算管理', description: '预算编制控制', icon: markRaw(FileText), iconBg: 'bg-teal-50', iconColor: 'text-teal-600', path: '/finance-center' }
    ]
  }

  return modulesMap[currentRole.value] || []
})

// 数据概览
const dataOverview = computed(() => {
  const overviewMap: Record<string, any> = {
    admin: {
      title: '系统运行概览',
      progress: 92,
      items: [
        { label: '日活跃用户', value: '856' },
        { label: '数据同步率', value: '99.8%' },
        { label: '系统负载', value: '正常' }
      ]
    },
    coach: {
      title: '本周绩效概览',
      progress: 82,
      items: [
        { label: '完成回访', value: '28次' },
        { label: '新增用户', value: '3人' },
        { label: '依从率提升', value: '+5%' }
      ]
    },
    doctor: {
      title: '诊疗数据概览',
      progress: 88,
      items: [
        { label: '今日问诊', value: '15人' },
        { label: '处方开具', value: '12份' },
        { label: '有效率', value: '93%' }
      ]
    },
    consultant: {
      title: '销售业绩概览',
      progress: 75,
      items: [
        { label: '今日首通', value: '8次' },
        { label: '跟进客户', value: '12人' },
        { label: '意向客户', value: '5人' }
      ]
    },
    finance: {
      title: '财务数据概览',
      progress: 68,
      items: [
        { label: '今日收入', value: '¥8,520' },
        { label: '今日支出', value: '¥3,240' },
        { label: '待审核', value: '6笔' }
      ]
    }
  }

  return overviewMap[currentRole.value]
})

// 模拟任务数据
const tasks = ref<Task[]>([])

// 根据角色获取任务
const getRoleTasks = (): Task[] => {
  const taskMap: Record<string, Task[]> = {
    admin: [
      { id: '1', title: '审核新用户注册申请', description: '3位用户待审核', time: '10:00', tag: '审核', priority: 'high', completed: false },
      { id: '2', title: '查看系统运行报告', description: '生成月度报告', time: '14:00', tag: '报告', priority: 'medium', completed: false },
      { id: '3', title: '处理用户投诉', description: '2起投诉待处理', time: '16:00', tag: '客服', priority: 'high', completed: false }
    ],
    coach: [
      { id: '1', title: '回访王磊 - 血糖异常', description: '昨日晚餐后血糖14.2', time: '10:00', tag: '高风险', priority: 'high', completed: false },
      { id: '2', title: '首通电话 - 李淑芬', description: '新分配客户建档', time: '14:30', tag: '首通', priority: 'medium', completed: false },
      { id: '3', title: '完成本周用户周报', description: '生成本周健康数据报告', time: '17:00', tag: '报告', priority: 'low', completed: false }
    ],
    doctor: [
      { id: '1', title: '在线咨询 - 张建国', description: '高血压用药调整', time: '09:30', tag: '咨询', priority: 'high', completed: false },
      { id: '2', title: '审核AI生活方式处方', description: '3份处方待审核', time: '11:00', tag: '审核', priority: 'medium', completed: false },
      { id: '3', title: '参与团队会诊', description: '代谢综合征病例讨论', time: '15:00', tag: '会议', priority: 'medium', completed: false }
    ],
    consultant: [
      { id: '1', title: '首通电话 - 王芳', description: '新客户初次沟通', time: '10:00', tag: '首通', priority: 'high', completed: false },
      { id: '2', title: '跟进客户 - 陈静', description: '产品使用情况回访', time: '14:00', tag: '跟进', priority: 'medium', completed: false },
      { id: '3', title: '发送产品资料', description: '向5位意向客户发送资料', time: '16:00', tag: '推广', priority: 'low', completed: false }
    ],
    finance: [
      { id: '1', title: '审核报销申请', description: '3笔报销待审核', time: '10:00', tag: '报销', priority: 'high', completed: false },
      { id: '2', title: '应付账款确认', description: '供应商货款确认', time: '14:00', tag: '应付', priority: 'high', completed: false },
      { id: '3', title: '生成财务报表', description: '本月损益表', time: '16:00', tag: '报表', priority: 'medium', completed: false }
    ]
  }

  return taskMap[currentRole.value] || []
}

// 最新动态
const recentActivities = computed<ActivityItem[]>(() => {
  const activityMap: Record<string, ActivityItem[]> = {
    admin: [
      { id: '1', title: '新增5位用户注册', time: '10分钟前', icon: markRaw(Users), iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
      { id: '2', title: '系统数据同步完成', time: '30分钟前', icon: markRaw(CheckCircle2), iconBg: 'bg-green-100', iconColor: 'text-green-600' },
      { id: '3', title: '收到2条用户反馈', time: '1小时前', icon: markRaw(Bell), iconBg: 'bg-orange-100', iconColor: 'text-orange-600' }
    ],
    coach: [
      { id: '1', title: '王磊上传了血糖数据', time: '10分钟前', icon: markRaw(Activity), iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
      { id: '2', title: '系统生成3份生活方式处方', time: '30分钟前', icon: markRaw(FileText), iconBg: 'bg-green-100', iconColor: 'text-green-600' },
      { id: '3', title: '张建国未按时上传午餐', time: '1小时前', icon: markRaw(AlertTriangle), iconBg: 'bg-orange-100', iconColor: 'text-orange-600' }
    ],
    doctor: [
      { id: '1', title: '完成张建国在线问诊', time: '15分钟前', icon: markRaw(Phone), iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
      { id: '2', title: '审核通过2份生活方式处方', time: '45分钟前', icon: markRaw(CheckCircle2), iconBg: 'bg-green-100', iconColor: 'text-green-600' },
      { id: '3', title: '新患者李淑芬待接诊', time: '1小时前', icon: markRaw(UserCheck), iconBg: 'bg-purple-100', iconColor: 'text-purple-600' }
    ],
    consultant: [
      { id: '1', title: '王芳完成首次购买', time: '20分钟前', icon: markRaw(DollarSign), iconBg: 'bg-green-100', iconColor: 'text-green-600' },
      { id: '2', title: '5位客户浏览产品资料', time: '1小时前', icon: markRaw(Activity), iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
      { id: '3', title: '陈静询问产品详情', time: '2小时前', icon: markRaw(Phone), iconBg: 'bg-orange-100', iconColor: 'text-orange-600' }
    ],
    finance: [
      { id: '1', title: '收到会员充值¥8,500', time: '10分钟前', icon: markRaw(DollarSign), iconBg: 'bg-green-100', iconColor: 'text-green-600' },
      { id: '2', title: '3笔报销申请待审核', time: '30分钟前', icon: markRaw(Receipt), iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
      { id: '3', title: '工资条已生成', time: '1小时前', icon: markRaw(FileText), iconBg: 'bg-purple-100', iconColor: 'text-purple-600' }
    ]
  }

  return activityMap[currentRole.value] || []
})

// Computed
const taskListTitle = computed(() => {
  const titles: Record<string, string> = {
    admin: '待办事项',
    coach: '今日跟进任务',
    doctor: '诊疗任务',
    consultant: '销售任务',
    finance: '财务待办'
  }
  return titles[currentRole.value] || '待办任务'
})

const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         (task.description?.toLowerCase().includes(searchQuery.value.toLowerCase()))
    const matchesFilter = taskFilter.value === 'all' ||
                         (taskFilter.value === 'completed' && task.completed) ||
                         (taskFilter.value === 'pending' && !task.completed)
    return matchesSearch && matchesFilter
  })
})

const completedTasksCount = computed(() => tasks.value.filter(t => t.completed).length)
const totalTasksCount = computed(() => tasks.value.length)
const priorityTasksCount = computed(() => tasks.value.filter(t => !t.completed && t.priority === 'high').length)

const currentDateText = computed(() => {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
  return now.toLocaleDateString('zh-CN', options)
})

// Methods
const toggleTask = (taskId: string) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.completed = !task.completed
  }
}

const deleteTask = (taskId: string) => {
  tasks.value = tasks.value.filter(t => t.id !== taskId)
}

const handleCardClick = (card: DashboardStats) => {
  console.log('Card clicked:', card.title)
}

const handleQuickAction = (action: string) => {
  console.log('Quick action:', action)
  if (action === 'batch-tasks') {
    router.push('/batch-task-processor')
  }
}

const viewAllTasks = () => {
  taskFilter.value = 'all'
  searchQuery.value = ''
}

const navigateToModule = (path: string) => {
  router.push(path)
}

const getTagColor = (tag: string) => {
  const colors: Record<string, string> = {
    '高风险': 'bg-red-100 text-red-700',
    '首通': 'bg-indigo-100 text-indigo-700',
    '审核': 'bg-purple-100 text-purple-700',
    '跟进': 'bg-green-100 text-green-700',
    '推广': 'bg-cyan-100 text-cyan-700',
    '报销': 'bg-orange-100 text-orange-700',
    '应付': 'bg-red-100 text-red-700',
    '报表': 'bg-slate-100 text-slate-700',
    '咨询': 'bg-blue-100 text-blue-700',
    '会议': 'bg-amber-100 text-amber-700'
  }
  return colors[tag] || 'bg-slate-100 text-slate-700'
}

const updateGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 6) {
    greetingText.value = '凌晨好'
  } else if (hour < 9) {
    greetingText.value = '早上好'
  } else if (hour < 12) {
    greetingText.value = '上午好'
  } else if (hour < 14) {
    greetingText.value = '中午好'
  } else if (hour < 18) {
    greetingText.value = '下午好'
  } else if (hour < 22) {
    greetingText.value = '晚上好'
  } else {
    greetingText.value = '夜深了'
  }
}

// Lifecycle
onMounted(() => {
  tasks.value = getRoleTasks()
  updateGreeting()
  currentUserName.value = currentRoleConfig.value?.name || '用户'
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
