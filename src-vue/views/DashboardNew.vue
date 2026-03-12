<template>
  <div class="min-h-screen bg-slate-50 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                :class="roleConfig[currentRole].bgColor">
                {{ roleConfig[currentRole].icon }}
              </div>
              <div>
                <h1 class="text-2xl font-bold text-slate-900">{{ roleConfig[currentRole].title }}</h1>
                <p class="text-sm text-slate-500">{{ greetingText }}，{{ currentUserName }}</p>
              </div>
            </div>
          </div>

          <!-- 角色切换 -->
          <div class="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              v-for="(config, role) in roleConfig"
              :key="role"
              @click="switchRole(role)"
              :class="`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                currentRole === role ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`"
            >
              {{ config.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- 核心指标卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          v-for="stat in currentStats"
          :key="stat.id"
          :title="stat.title"
          :value="stat.value"
          :unit="stat.unit"
          :trend="stat.trend"
          :trendValue="stat.trendValue"
          :icon="stat.icon"
          :bgColor="stat.bgColor"
          :textColor="stat.textColor"
          @click="handleCardClick(stat)"
        />
      </div>

      <!-- 主内容区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：任务列表 (2/3) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 快捷操作 -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Zap :size="18" class="text-indigo-600" />
              快捷操作
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                v-for="action in quickActions"
                :key="action.id"
                @click="handleQuickAction(action.id)"
                class="flex flex-col items-center gap-2 p-3 rounded-lg border transition-all hover:shadow-md"
                :class="action.disabled ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed' : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer'"
                :disabled="action.disabled"
              >
                <component :is="action.icon" :size="20" :class="action.iconColor" />
                <span class="text-xs font-medium" :class="action.disabled ? 'text-slate-400' : 'text-slate-700'">{{ action.label }}</span>
              </button>
            </div>
          </div>

          <!-- 医生预约管理 -->
          <div v-if="currentRole === 'doctor'" class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CalendarPlus :size="18" class="text-indigo-600" />
              服务预约
              <span v-if="doctorAppointments.filter(a => a.status === 'pending').length > 0"
                class="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                {{ doctorAppointments.filter(a => a.status === 'pending').length }} 待处理
              </span>
            </h3>

            <div class="space-y-2 max-h-[300px] overflow-y-auto">
              <div
                v-for="appointment in doctorAppointments"
                :key="appointment.id"
                class="p-3 rounded-lg border transition-all"
                :class="{
                  'bg-amber-50 border-amber-200': appointment.status === 'pending',
                  'bg-green-50 border-green-200': appointment.status === 'accepted',
                  'bg-red-50 border-red-200': appointment.status === 'rejected',
                  'bg-blue-50 border-blue-200': appointment.status === 'completed'
                }"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <p class="text-sm font-medium text-slate-800">{{ appointment.clientName }}</p>
                      <span
                        class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        :class="statusMap[appointment.status].class"
                      >
                        {{ statusMap[appointment.status].text }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-600">{{ serviceTypeMap[appointment.serviceType] }}</p>
                    <div class="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span class="flex items-center gap-1">
                        <Calendar :size="10" />
                        {{ appointment.date }}
                      </span>
                      <span class="flex items-center gap-1">
                        <Clock :size="10" />
                        {{ appointment.time }}
                      </span>
                    </div>
                  </div>
                </div>

                <p v-if="appointment.description" class="text-xs text-slate-600 mb-2 line-clamp-2">
                  {{ appointment.description }}
                </p>

                <!-- 操作按钮 -->
                <div v-if="appointment.status === 'pending'" class="flex gap-2">
                  <button
                    @click="acceptAppointment(appointment.id)"
                    class="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Check :size="12" />
                    接受
                  </button>
                  <button
                    @click="rejectAppointment(appointment.id)"
                    class="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <X :size="12" />
                    拒绝
                  </button>
                </div>

                <div v-else-if="appointment.status === 'accepted'" class="flex gap-2">
                  <button
                    @click="completeAppointment(appointment.id)"
                    class="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Check :size="12" />
                    完成服务
                  </button>
                </div>

                <!-- 费用提示 -->
                <div v-if="appointment.status === 'completed'" class="mt-2 p-2 bg-blue-50 rounded-lg">
                  <p class="text-[10px] text-blue-700 font-medium">
                    ✓ 已添加 200 元服务记录到财务中心
                  </p>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="doctorAppointments.length === 0" class="text-center py-4 text-slate-400">
                <CalendarPlus :size="30" class="mx-auto mb-1 opacity-50" />
                <p class="text-xs">暂无预约</p>
              </div>
            </div>
          </div>

          <!-- 教练预约记录 -->
          <div v-if="currentRole === 'coach'" class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CalendarPlus :size="18" class="text-indigo-600" />
              我的预约
              <span v-if="pendingAppointments.length > 0"
                class="ml-auto bg-amber-100 text-amber-600 text-xs px-2 py-0.5 rounded-full">
                {{ pendingAppointments.length }} 待确认
              </span>
            </h3>

            <div class="space-y-2 max-h-[250px] overflow-y-auto">
              <div
                v-for="appointment in appointments.slice().reverse().slice(0, 5)"
                :key="appointment.id"
                class="p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer"
                :class="{
                  'bg-amber-50 border-amber-200': appointment.status === 'pending',
                  'bg-green-50 border-green-200': appointment.status === 'accepted',
                  'bg-red-50 border-red-200': appointment.status === 'rejected',
                  'bg-blue-50 border-blue-200': appointment.status === 'completed'
                }"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <p class="text-sm font-medium text-slate-800">{{ appointment.clientName }}</p>
                      <span
                        class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        :class="statusMap[appointment.status].class"
                      >
                        {{ statusMap[appointment.status].text }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-600">{{ serviceTypeMap[appointment.serviceType] }} - {{ appointment.doctorName }}</p>
                    <div class="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span class="flex items-center gap-1">
                        <Calendar :size="10" />
                        {{ appointment.date }}
                      </span>
                      <span class="flex items-center gap-1">
                        <Clock :size="10" />
                        {{ appointment.time }}
                      </span>
                    </div>
                  </div>
                </div>

                <p v-if="appointment.description" class="text-xs text-slate-600 line-clamp-2">
                  {{ appointment.description }}
                </p>
              </div>

              <!-- 空状态 -->
              <div v-if="appointments.length === 0" class="text-center py-4 text-slate-400">
                <CalendarPlus :size="30" class="mx-auto mb-1 opacity-50" />
                <p class="text-xs">暂无预约记录</p>
                <p class="text-[10px] text-slate-400 mt-1">点击快捷操作中的"预约服务"开始</p>
              </div>
            </div>
          </div>

          <!-- 待办任务 -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div class="p-4 border-b border-slate-100">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle :size="18" class="text-indigo-600" />
                  待办任务
                </h3>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-500">{{ completedCount }}/{{ totalCount }} 已完成</span>
                  <button
                    @click="viewAllTasks"
                    class="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                  >
                    全部 <ChevronRight :size="14" />
                  </button>
                </div>
              </div>
            </div>

            <div class="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              <div
                v-for="task in priorityTasks"
                :key="task.id"
                @click="handleTaskClick(task)"
                class="flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md"
                :class="task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'"
              >
                <button
                  @click.stop="toggleTask(task.id)"
                  class="flex-shrink-0"
                >
                  <CheckCircle
                    :size="18"
                    :class="task.completed ? 'text-green-600' : 'text-slate-300 hover:text-green-500'"
                  />
                </button>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <p class="text-sm font-medium text-slate-800 truncate">{{ task.title }}</p>
                    <span
                      v-if="task.priority === 'high'"
                      class="px-1.5 py-0.5 text-[10px] rounded bg-red-100 text-red-600 font-medium flex-shrink-0"
                    >
                      紧急
                    </span>
                  </div>
                  <div class="flex items-center gap-2 text-xs text-slate-500">
                    <Clock :size="12" />
                    <span>{{ task.time }}</span>
                    <span v-if="task.userName" class="text-slate-400">· {{ task.userName }}</span>
                  </div>
                </div>
                <div class="flex-shrink-0">
                  <button
                    v-if="task.type === 'call'"
                    @click.stop="makeCall(task)"
                    class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="拨打电话"
                  >
                    <Phone :size="14" />
                  </button>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="priorityTasks.length === 0" class="text-center py-8 text-slate-400">
                <CheckCircle :size="40" class="mx-auto mb-2 opacity-50" />
                <p class="text-sm">暂无待办任务</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：动态 (1/3) -->
        <div class="space-y-6">
          <!-- 今日概况 -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar :size="18" class="text-indigo-600" />
              今日概况
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div class="flex items-center gap-2">
                  <UserCheck :size="16" class="text-blue-600" />
                  <span class="text-sm text-slate-700">今日打卡</span>
                </div>
                <span class="text-lg font-bold text-slate-900">{{ todayStats.checkedIn }}/{{ todayStats.total }}</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div class="flex items-center gap-2">
                  <Activity :size="16" class="text-green-600" />
                  <span class="text-sm text-slate-700">数据异常</span>
                </div>
                <span class="text-lg font-bold text-red-600">{{ todayStats.abnormal }}</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div class="flex items-center gap-2">
                  <AlertTriangle :size="16" class="text-amber-600" />
                  <span class="text-sm text-slate-700">待处理</span>
                </div>
                <span class="text-lg font-bold text-amber-600">{{ todayStats.pending }}</span>
              </div>
            </div>
          </div>

          <!-- 健康预警 -->
          <div class="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 shadow-sm p-4">
            <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle :size="18" class="text-red-600" />
              健康预警
            </h3>
            <div class="space-y-2">
              <div
                v-for="alert in healthAlerts"
                :key="alert.id"
                @click="handleAlertClick(alert)"
                class="flex items-start gap-2 p-2 rounded-lg bg-white/50 hover:bg-white transition-colors cursor-pointer"
              >
                <div class="flex-shrink-0">
                  <component :is="alert.severity === 'high' ? AlertTriangle : Activity" :size="14"
                    :class="alert.severity === 'high' ? 'text-red-600' : 'text-amber-600'" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-slate-800">{{ alert.title }}</p>
                  <p class="text-[10px] text-slate-500 truncate">{{ alert.desc }}</p>
                </div>
                <ChevronRight :size="14" class="text-slate-400 flex-shrink-0" />
              </div>

              <div v-if="healthAlerts.length === 0" class="text-center py-4 text-slate-400">
                <CheckCircle :size="30" class="mx-auto mb-1 opacity-50" />
                <p class="text-xs">暂无预警</p>
              </div>
            </div>
          </div>

          <!-- 最近活动 -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock :size="18" class="text-indigo-600" />
              最近活动
            </h3>
            <div class="space-y-3">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="flex items-start gap-2 text-sm"
              >
                <div class="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
                  :class="activity.type === 'success' ? 'bg-green-500' : activity.type === 'warning' ? 'bg-amber-500' : 'bg-slate-400'"></div>
                <div class="flex-1 min-w-0">
                  <p class="text-slate-700">{{ activity.desc }}</p>
                  <p class="text-[10px] text-slate-400">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预约模态框 -->
    <AppointmentModal
      :showModal="showAppointmentModal"
      @close="showAppointmentModal = false"
      @submit="handleAppointmentSubmit"
    />

    <!-- Toast -->
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Activity,
  UserCheck,
  Zap,
  ChevronRight,
  Phone,
  Users,
  FileText,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarPlus,
  Check,
  X
} from 'lucide-vue-next'
import Toast from '../components/shared/Toast.vue'
import DashboardCard from '../components/DashboardCard.vue'
import AppointmentModal from '../components/AppointmentModal.vue'

// 角色配置
const roleConfig: Record<string, {
  label: string
  title: string
  icon: string
  bgColor: string
}> = {
  coach: {
    label: '教练',
    title: '教练工作台',
    icon: '🏋️',
    bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-600'
  },
  doctor: {
    label: '医生',
    title: '医生工作台',
    icon: '⚕️',
    bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600'
  }
}

const router = useRouter()
const toastRef = ref<InstanceType<typeof Toast>>()
const currentRole = ref<'coach' | 'doctor'>('coach')
const currentUserName = ref('王教练')

// 预约相关状态
const showAppointmentModal = ref(false)
interface Appointment {
  id: string
  serviceType: string
  date: string
  time: string
  doctorId: string
  duration: number
  clientName: string
  description: string
  notes: string
  files: File[]
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  createdAt: string
  createdBy: string
  doctorName?: string
}

const appointments = ref<Appointment[]>([
  {
    id: '1',
    serviceType: 'consultation',
    date: '2026-03-12',
    time: '09:00',
    doctorId: 'doc1',
    duration: 30,
    clientName: '张建国',
    description: '客户咨询血糖控制方案',
    notes: '需要重点关注',
    files: [],
    status: 'pending',
    createdAt: new Date().toISOString(),
    createdBy: '教练',
    doctorName: '李医生'
  },
  {
    id: '2',
    serviceType: 'follow-up',
    date: '2026-03-12',
    time: '10:30',
    doctorId: 'doc2',
    duration: 45,
    clientName: '李淑芬',
    description: '随访指导',
    notes: '',
    files: [],
    status: 'accepted',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    createdBy: '顾问',
    doctorName: '王医生'
  }
])

// 问候语
const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 角色专属统计
const stats = {
  coach: [
    {
      id: 'total-clients',
      title: '服务客户',
      value: '128',
      unit: '人',
      trend: 'up',
      trendValue: '+5',
      icon: Users,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      clickAction: 'view-clients'
    },
    {
      id: 'completion-rate',
      title: '今日打卡率',
      value: '85.6',
      unit: '%',
      trend: 'up',
      trendValue: '+2.3%',
      icon: Activity,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      clickAction: null
    },
    {
      id: 'pending-tasks',
      title: '待处理任务',
      value: '12',
      unit: '项',
      trend: 'down',
      trendValue: '-3',
      icon: Clock,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600',
      clickAction: 'view-tasks'
    },
    {
      id: 'health-score',
      title: '健康评分',
      value: '78.5',
      unit: '分',
      trend: 'up',
      trendValue: '+1.2',
      icon: Heart,
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      clickAction: 'view-health-report'
    }
  ],
  doctor: [
    {
      id: 'total-patients',
      title: '服务患者',
      value: '45',
      unit: '人',
      trend: 'up',
      trendValue: '+2',
      icon: Users,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      clickAction: 'view-patients'
    },
    {
      id: 'consultations',
      title: '今日问诊',
      value: '8',
      unit: '次',
      trend: 'stable',
      trendValue: '0',
      icon: Activity,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      clickAction: null
    },
    {
      id: 'prescriptions',
      title: '处方审核',
      value: '3',
      unit: '份',
      trend: 'down',
      trendValue: '-2',
      icon: FileText,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      clickAction: 'view-prescriptions'
    },
    {
      id: 'critical-cases',
      title: '重点关注',
      value: '5',
      unit: '人',
      trend: 'stable',
      trendValue: '0',
      icon: AlertTriangle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      clickAction: 'view-critical'
    }
  ]
}

const currentStats = computed(() => stats[currentRole.value])

// 快捷操作
const quickActions = computed(() => {
  if (currentRole.value === 'coach') {
    return [
      { id: 'batch-task', label: '批量处理', icon: Zap, iconColor: 'text-indigo-600', disabled: false },
      { id: 'book-appointment', label: '预约服务', icon: CalendarPlus, iconColor: 'text-purple-600', disabled: false },
      { id: 'make-call', label: '发起回访', icon: Phone, iconColor: 'text-green-600', disabled: false },
      { id: 'view-report', label: '查看报告', icon: FileText, iconColor: 'text-blue-600', disabled: false }
    ]
  } else {
    return [
      { id: 'new-consult', label: '在线问诊', icon: Activity, iconColor: 'text-emerald-600', disabled: false },
      { id: 'review-rx', label: '审核处方', icon: FileText, iconColor: 'text-purple-600', disabled: false },
      { id: 'view-cases', label: '查看病例', icon: Users, iconColor: 'text-blue-600', disabled: false },
      { id: 'health-alert', label: '健康预警', icon: AlertTriangle, iconColor: 'text-red-600', disabled: false }
    ]
  }
})

// 预约数据计算属性
const pendingAppointments = computed(() => {
  return appointments.value.filter(a => a.status === 'pending')
})

const acceptedAppointments = computed(() => {
  return appointments.value.filter(a => a.status === 'accepted')
})

const doctorAppointments = computed(() => {
  // 模拟当前医生ID为 doc1
  const currentDoctorId = 'doc1'
  return appointments.value.filter(a => a.doctorId === currentDoctorId)
})

const serviceTypeMap: Record<string, string> = {
  'consultation': '在线问诊',
  'prescription': '处方审核',
  'follow-up': '随访指导',
  'emergency': '紧急咨询'
}

const statusMap: Record<string, { text: string; class: string }> = {
  'pending': { text: '待接受', class: 'bg-amber-100 text-amber-700' },
  'accepted': { text: '已接受', class: 'bg-green-100 text-green-700' },
  'rejected': { text: '已拒绝', class: 'bg-red-100 text-red-700' },
  'completed': { text: '已完成', class: 'bg-blue-100 text-blue-700' }
}

// 任务数据
const tasks = ref([
  {
    id: '1',
    title: '跟进张建国血糖异常',
    time: '10:30',
    priority: 'high',
    completed: false,
    type: 'call',
    userName: '张建国',
    roleId: 'coach'
  },
  {
    id: '2',
    title: '审核李淑芬的生活方式处方',
    time: '11:00',
    priority: 'medium',
    completed: false,
    type: 'review',
    userName: '李淑芬',
    roleId: 'doctor'
  },
  {
    id: '3',
    title: '提醒王磊上传今日数据',
    time: '12:00',
    priority: 'low',
    completed: false,
    type: 'reminder',
    userName: '王磊',
    roleId: 'coach'
  },
  {
    id: '4',
    title: '查看陈静的血压监测报告',
    time: '14:00',
    priority: 'medium',
    completed: false,
    type: 'view',
    userName: '陈静',
    roleId: 'doctor'
  }
])

const priorityTasks = computed(() => {
  return tasks.value.filter(t => t.roleId === currentRole.value || !t.roleId)
})

const completedCount = computed(() => priorityTasks.value.filter(t => t.completed).length)
const totalCount = computed(() => priorityTasks.value.length)

// 今日统计
const todayStats = ref({
  checkedIn: 42,
  total: 50,
  abnormal: 5,
  pending: 12
})

// 健康预警
const healthAlerts = ref([
  {
    id: '1',
    title: '张建国血糖偏高',
    desc: '空腹血糖 8.5 mmol/L，建议关注',
    severity: 'high',
    userId: 'user1'
  },
  {
    id: '2',
    title: '李淑芬未按时上传',
    desc: '已超过48小时未上传数据',
    severity: 'medium',
    userId: 'user2'
  },
  {
    id: '3',
    title: '王磊血压波动',
    desc: '血压 145/95 mmHg',
    severity: 'medium',
    userId: 'user3'
  }
])

// 最近活动
const recentActivities = ref([
  { id: '1', desc: '张建国完成了今日打卡', time: '5分钟前', type: 'success' },
  { id: '2', desc: '李淑芬上传了新的血压数据', time: '15分钟前', type: 'success' },
  { id: '3', desc: '王磊血糖数据异常', time: '30分钟前', type: 'warning' },
  { id: '4', desc: '陈静完成了随访任务', time: '1小时前', type: 'success' }
])

// 方法
const switchRole = (role: 'coach' | 'doctor') => {
  currentRole.value = role
  toastRef.value?.info(`已切换到${roleConfig[role].label}`)
}

const handleQuickAction = (actionId: string) => {
  const actionMap: Record<string, () => void> = {
    'batch-task': () => router.push('/batch-task-processor'),
    'book-appointment': () => { showAppointmentModal.value = true },
    'make-call': () => toastRef.value?.info('请先选择要回访的客户'),
    'add-task': () => toastRef.value?.info('添加待办功能开发中'),
    'view-report': () => toastRef.value?.info('查看报告功能开发中'),
    'new-consult': () => toastRef.value?.info('在线问诊功能开发中'),
    'review-rx': () => toastRef.value?.info('审核处方功能开发中'),
    'view-cases': () => router.push('/client-list'),
    'health-alert': () => router.push('/alert-center')
  }

  const handler = actionMap[actionId]
  if (handler) handler()
}

const handleCardClick = (stat: { id: string; clickAction?: string | null }) => {
  if (!stat.clickAction) return

  const actionMap: Record<string, () => void> = {
    'view-clients': () => router.push('/client-list'),
    'view-tasks': () => {
      // 滚动到任务列表
      document.querySelector('.lg\\:col-span-2')?.scrollIntoView({ behavior: 'smooth' })
    },
    'view-health-report': () => toastRef.value?.info('健康报告功能开发中'),
    'view-patients': () => router.push('/client-list'),
    'view-prescriptions': () => toastRef.value?.info('处方审核功能开发中'),
    'view-critical': () => router.push('/alert-center')
  }

  const handler = actionMap[stat.clickAction]
  if (handler) handler()
}

const handleTaskClick = (task: any) => {
  router.push(`/client-profile/${task.userId || '1'}`)
}

const toggleTask = (taskId: string) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.completed = !task.completed
    toastRef.value?.success(task.completed ? '任务已完成' : '任务已恢复')
  }
}

const makeCall = (task: any) => {
  toastRef.value?.info(`正在呼叫 ${task.userName}...`)
}

const handleAlertClick = (alert: any) => {
  router.push(`/client-profile/${alert.userId}?tab=health&focus=bloodSugar`)
}

const viewAllTasks = () => {
  toastRef.value?.info('全部任务功能开发中')
}

// 预约相关方法
const handleAppointmentSubmit = (appointment: any) => {
  // 添加医生名称
  const doctorMap: Record<string, string> = {
    'doc1': '李医生',
    'doc2': '王医生',
    'doc3': '张医生',
    'doc4': '刘医生'
  }
  appointment.doctorName = doctorMap[appointment.doctorId] || '未知医生'

  appointments.value.push(appointment)
  toastRef.value?.success('预约提交成功！等待医生确认')
  showAppointmentModal.value = false
}

const acceptAppointment = (appointmentId: string) => {
  const appointment = appointments.value.find(a => a.id === appointmentId)
  if (appointment) {
    appointment.status = 'accepted'
    toastRef.value?.success('已接受预约，请在预约时间提供服务')
  }
}

const rejectAppointment = (appointmentId: string) => {
  const appointment = appointments.value.find(a => a.id === appointmentId)
  if (appointment) {
    appointment.status = 'rejected'
    toastRef.value?.info('已拒绝该预约')
  }
}

const completeAppointment = (appointmentId: string) => {
  const appointment = appointments.value.find(a => a.id === appointmentId)
  if (appointment) {
    appointment.status = 'completed'
    toastRef.value?.success('服务已完成！薪酬系统已更新')

    // 模拟添加到财务中心
    const salaryRecord = {
      id: Date.now().toString(),
      type: 'online-service',
      amount: 200,
      description: `上线服务 - ${appointment.clientName} - ${serviceTypeMap[appointment.serviceType]}`,
      date: new Date().toISOString(),
      appointmentId: appointment.id
    }

    // 保存到localStorage（模拟财务系统）
    const existingRecords = JSON.parse(localStorage.getItem('salary_records') || '[]')
    existingRecords.push(salaryRecord)
    localStorage.setItem('salary_records', JSON.stringify(existingRecords))

    console.log('财务记录已添加:', salaryRecord)
  }
}

onMounted(() => {
  // 加载初始数据
  console.log(`Dashboard initialized for role: ${currentRole.value}`)
})
</script>
