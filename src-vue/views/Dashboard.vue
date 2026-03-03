<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Welcome Section -->
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold" :style="{ color: 'var(--text-primary)' }">早安，李教练</h2>
        <p class="mt-1" style="color: var(--text-secondary);">今天是 2026年2月4日 星期三，您有 {{ tasks.length }} 项重点待办事项。</p>
      </div>
      <div class="flex gap-3">
        <button class="px-4 py-2 font-medium rounded-lg shadow-sm flex items-center gap-2" :style="{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          color: 'var(--text-regular)'
        }" @mouseenter="$event.currentTarget.style.background = 'var(--fill-light)'" @mouseleave="$event.currentTarget.style.background = 'var(--card)'">
          <Calendar :size="18" /> 日程安排
        </button>
        <button class="px-4 py-2 text-white font-bold rounded-lg shadow-lg flex items-center gap-2" :style="{
          background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
          boxShadow: isBlackGold.value ? '0 10px 15px -3px rgba(184, 134, 11, 0.3)' : '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
        }">
          <Plus :size="18" /> 新建任务
        </button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        v-for="stat in stats"
        :key="stat.id"
        :label="stat.label"
        :value="stat.value"
        :trend="stat.trend"
        :trend-up="stat.trendUp"
        :sub-label="stat.subLabel"
        :icon="stat.icon"
        :bg="stat.bg"
        :is-active="activeStatCard === stat.id"
        @click="handleStatClick(stat)"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Today's Focus Tasks -->
      <div class="lg:col-span-2 rounded-xl shadow-sm flex flex-col" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <div class="p-6" style="border-bottom: 1px solid var(--border-light);">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold flex items-center gap-2" :style="{ color: 'var(--text-primary)' }">
              <CheckCircle2 :size="20" :style="{ color: isBlackGold.value ? '#B8860B' : '#4f46e5' }" />
              今日重点待办
            </h3>
            <div class="flex items-center gap-2">
              <span class="text-xs" :style="{ color: 'var(--text-secondary)' }">
                已完成 {{ completedCount }}/{{ tasks.length }}
              </span>
              <button
                class="text-sm font-medium flex items-center gap-1"
                :style="{ color: isBlackGold.value ? '#B8860B' : '#4f46e5' }"
                @click="refreshTasks"
              >
                查看全部 <ArrowRight :size="16" />
              </button>
            </div>
          </div>

          <!-- Search and Filter -->
          <div class="flex gap-3">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2" :size="16" :style="{ color: 'var(--text-placeholder)' }" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索任务..."
                class="w-full pl-9 pr-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
                :style="{
                  border: '1px solid var(--border)',
                  background: 'var(--background)',
                  color: 'var(--text-primary)',
                  '--tw-ring-color': isBlackGold.value ? 'rgba(184, 134, 11, 0.5)' : 'rgba(79, 70, 229, 0.5)'
                }"
              />
            </div>
            <select
              v-model="filterStatus"
              class="px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
              :style="{
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--text-primary)',
                '--tw-ring-color': isBlackGold.value ? 'rgba(184, 134, 11, 0.5)' : 'rgba(79, 70, 229, 0.5)'
              }"
            >
              <option value="all">全部</option>
              <option value="pending">待完成</option>
              <option value="completed">已完成</option>
            </select>
            <select
              v-model="selectedPriority"
              class="px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
              :style="{
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--text-primary)',
                '--tw-ring-color': isBlackGold.value ? 'rgba(184, 134, 11, 0.5)' : 'rgba(79, 70, 229, 0.5)'
              }"
            >
              <option value="all">全部优先级</option>
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>
          </div>
        </div>

        <!-- Task List -->
        <div class="p-6 space-y-4">
          <template v-if="filteredTasks.length > 0">
            <TaskItem
              v-for="task in filteredTasks"
              :key="task.id"
              v-bind="task"
              :show-menu="showTaskMenu === task.id"
              @toggle-complete="toggleTaskComplete(task.id)"
              @delete="deleteTask(task.id)"
              @toggle-menu="toggleTaskMenu(task.id)"
              @close-menu="showTaskMenu = null"
            />
          </template>
          <div v-else class="text-center py-12">
            <CheckCircle2 :size="48" class="mx-auto mb-4" :style="{ color: 'var(--text-disabled)' }" />
            <p :style="{ color: 'var(--text-secondary)' }">没有找到匹配的任务</p>
            <button
              @click="clearFilters"
              class="mt-4 text-sm font-medium"
              :style="{ color: isBlackGold.value ? '#B8860B' : '#4f46e5' }"
            >
              清除筛选条件
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Activity / Notifications -->
      <div class="rounded-xl shadow-sm flex flex-col" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <div class="p-6" style="border-bottom: 1px solid var(--border-light);">
          <h3 class="font-bold" :style="{ color: 'var(--text-primary)' }">最新动态</h3>
        </div>
        <div class="p-6 space-y-6">
          <ActivityItem
            user="王磊"
            action="上传了新的血糖数据"
            time="10 分钟前"
            :icon="Activity"
            :icon-bg="isBlackGold.value ? 'bg-amber-900/30 text-amber-400' : 'bg-indigo-100 text-indigo-600'"
          />
          <ActivityItem
            user="系统"
            action="生成了 3 份新的生活方式处方"
            time="30 分钟前"
            :icon="CheckCircle2"
            :icon-bg="isBlackGold.value ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-600'"
          />
          <ActivityItem
            user="张建国"
            action="未按时上传午餐照片"
            time="1 小时前"
            :icon="AlertTriangle"
            :icon-bg="isBlackGold.value ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-600'"
          />
          <ActivityItem
            user="陶医生"
            action="更新了用户陈静的用药建议"
            time="2 小时前"
            :icon="Users"
            :icon-bg="isBlackGold.value ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600'"
          />
          <ActivityItem
            user="李淑芬"
            action="完成了今日运动打卡"
            time="3 小时前"
            :icon="Target"
            :icon-bg="isBlackGold.value ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'"
          />
        </div>
        <div class="mt-auto p-6 rounded-b-xl" :style="{
          borderTop: '1px solid var(--border-light)',
          background: 'var(--fill-light)'
        }">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-bold" :style="{ color: 'var(--text-regular)' }">本月绩效目标</span>
            <span class="text-xs font-medium" :style="{ color: isBlackGold.value ? '#D4A84A' : '#4f46e5' }">82%</span>
          </div>
          <div class="w-full h-2 rounded-full overflow-hidden" :style="{ background: 'var(--border)' }">
            <div class="h-full w-[82%] rounded-full" :style="{ background: isBlackGold.value ? '#B8860B' : '#4f46e5' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Info Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Quick Actions -->
      <div class="p-6 rounded-xl shadow-sm" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <h3 class="font-bold mb-4 flex items-center gap-2" :style="{ color: 'var(--text-primary)' }">
          <Phone :size="18" :style="{ color: isBlackGold.value ? '#B8860B' : '#4f46e5' }" />
          快捷操作
        </h3>
        <div class="space-y-3">
          <QuickActionButton
            :icon="Phone"
            label="发起首通电话"
            :color="isBlackGold.value ? 'gold' : 'indigo'"
            @click="handleQuickAction('发起首通电话')"
          />
          <QuickActionButton
            :icon="FileText"
            label="生成AI处方报告"
            color="emerald"
            @click="handleQuickAction('生成处方报告')"
          />
          <QuickActionButton
            :icon="AlertTriangle"
            label="查看异常预警"
            color="orange"
            @click="handleQuickAction('查看预警列表')"
          />
          <QuickActionButton
            :icon="Calendar"
            label="团队会议日历"
            color="purple"
            @click="handleQuickAction('打开日历')"
          />
        </div>
      </div>

      <!-- Weekly Summary -->
      <div class="p-6 rounded-xl shadow-sm" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <h3 class="font-bold mb-4 flex items-center gap-2" :style="{ color: 'var(--text-primary)' }">
          <FileText :size="18" style="color: #10b981;" />
          本周工作概览
        </h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-sm" :style="{ color: 'var(--text-regular)' }">完成首通电话</span>
            <span class="text-lg font-bold" :style="{ color: 'var(--text-primary)' }">12 <span class="text-xs font-normal" :style="{ color: 'var(--text-disabled)' }">次</span></span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm" :style="{ color: 'var(--text-regular)' }">生成处方报告</span>
            <span class="text-lg font-bold" :style="{ color: 'var(--text-primary)' }">8 <span class="text-xs font-normal" :style="{ color: 'var(--text-disabled)' }">份</span></span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm" :style="{ color: 'var(--text-regular)' }">用户跟进</span>
            <span class="text-lg font-bold" :style="{ color: 'var(--text-primary)' }">45 <span class="text-xs font-normal" :style="{ color: 'var(--text-disabled)' }">人次</span></span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm" :style="{ color: 'var(--text-regular)' }">异常处理</span>
            <span class="text-lg font-bold" :style="{ color: 'var(--text-primary)' }">6 <span class="text-xs font-normal" :style="{ color: 'var(--text-disabled)' }">次</span></span>
          </div>
          <div class="pt-3" style="border-top: 1px solid var(--border-light);">
            <div class="flex items-center gap-2 text-xs" style="color: #10b981;">
              <Award :size="14" />
              <span class="font-medium">相比上周提升 15%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- System Health -->
      <div class="p-6 rounded-xl shadow-sm" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <h3 class="font-bold mb-4 flex items-center gap-2" :style="{ color: 'var(--text-primary)' }">
          <TrendingUp :size="18" style="color: #3b82f6;" />
          系统运行状态
        </h3>
        <div class="space-y-4">
          <HealthBarItem
            label="用户活跃度"
            value="85%"
            status="优秀"
            :status-color="isBlackGold.value ? 'text-emerald-400' : 'text-emerald-600'"
            :bar-color="isBlackGold.value ? 'bg-emerald-500' : 'bg-emerald-500'"
            @click="handleHealthClick('用户活跃度')"
          />
          <HealthBarItem
            label="数据完整性"
            value="92%"
            status="良好"
            :status-color="isBlackGold.value ? 'text-blue-400' : 'text-blue-600'"
            :bar-color="isBlackGold.value ? 'bg-blue-500' : 'bg-blue-500'"
            @click="handleHealthClick('数据完整性')"
          />
          <HealthBarItem
            label="依从性达标率"
            value="78%"
            status="良好"
            :status-color="isBlackGold.value ? 'text-amber-400' : 'text-indigo-600'"
            :bar-color="isBlackGold.value ? 'bg-amber-500' : 'bg-indigo-500'"
            @click="handleHealthClick('依从性达标率')"
          />
          <HealthBarItem
            label="AI 处方生成"
            value="88%"
            status="正常"
            :status-color="isBlackGold.value ? 'text-purple-400' : 'text-purple-600'"
            :bar-color="isBlackGold.value ? 'bg-purple-500' : 'bg-purple-500'"
            @click="handleHealthClick('AI处方生成')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Users,
  Activity,
  ArrowRight,
  Plus,
  Phone,
  FileText,
  Target,
  Award,
  Search
} from 'lucide-vue-next'
import StatCard from '../components/StatCard.vue'
import TaskItem from '../components/TaskItem.vue'
import ActivityItem from '../components/ActivityItem.vue'
import QuickActionButton from '../components/QuickActionButton.vue'
import HealthBarItem from '../components/HealthBarItem.vue'
import { useTheme } from '../composables/useTheme'

// 主题相关
const { currentTheme } = useTheme()

// 主题样式计算属性
const isBlackGold = computed(() => currentTheme.value === 'black-gold')
const isWarmYellow = computed(() => currentTheme.value === 'warm-yellow')

// Types
interface Task {
  id: string
  title: string
  time: string
  tag: string
  tagColor: string
  desc: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
}

interface StatItem {
  id: string
  label: string
  value: string
  trend?: string
  trendUp?: boolean
  subLabel?: string
  icon: any
  bg: string
  onClick?: () => void
}

// State
const tasks = ref<Task[]>([
  {
    id: '1',
    title: '回访王磊 (ID: 1024) - 血糖异常',
    time: '10:00',
    tag: '高风险',
    tagColor: 'bg-red-50 text-red-600',
    desc: '昨日晚餐后血糖 14.2，需确认用药情况及饮食记录。',
    completed: false,
    priority: 'high'
  },
  {
    id: '2',
    title: '首通电话 - 李淑芬 (新分配)',
    time: '14:30',
    tag: '首通',
    tagColor: 'bg-indigo-50 text-indigo-600',
    desc: '新分配客户，需完成健康档案建档及初步干预方案沟通。',
    completed: false,
    priority: 'medium'
  },
  {
    id: '3',
    title: '周报生成与发送',
    time: '17:00',
    tag: '常规',
    tagColor: 'bg-slate-100 text-slate-600',
    desc: '生成本周负责用户的健康数据周报并推送给医生团队。',
    completed: false,
    priority: 'low'
  },
  {
    id: '4',
    title: '参与医生团队会诊',
    time: '15:00 - 16:00',
    tag: '会议',
    tagColor: 'bg-orange-50 text-orange-600',
    desc: '针对代谢综合征用户群体的干预策略调整讨论。',
    completed: false,
    priority: 'medium'
  },
  {
    id: '5',
    title: '完成 AI 生活方式处方审核',
    time: '16:30',
    tag: '审核',
    tagColor: 'bg-purple-50 text-purple-600',
    desc: '审核系统生成的 3 份生活方式处方报告，确认发送给用户。',
    completed: false,
    priority: 'medium'
  }
])

const filterStatus = ref<'all' | 'pending' | 'completed'>('all')
const searchQuery = ref('')
const selectedPriority = ref<'all' | 'high' | 'medium' | 'low'>('all')
const showTaskMenu = ref<string | null>(null)
const activeStatCard = ref<string | null>(null)

// Statistics
const stats = computed(() => [
  {
    id: 'users',
    label: '管理用户总数',
    value: '128',
    trend: '+4',
    trendUp: true,
    icon: h(Users, { size: 20, style: { color: isBlackGold.value ? '#D4A84A' : '#4f46e5' } }),
    bg: isBlackGold.value ? 'bg-amber-900/20' : 'bg-indigo-50',
    onClick: () => alert('查看用户详情列表')
  },
  {
    id: 'followup',
    label: '今日需跟进',
    value: '12',
    subLabel: '3 人逾期',
    icon: h(Clock, { size: 20, style: { color: '#f97316' } }),
    bg: isBlackGold.value ? 'bg-orange-900/20' : 'bg-orange-50',
    onClick: () => alert('查看跟进任务')
  },
  {
    id: 'alerts',
    label: '异常预警',
    value: '5',
    trend: '-2',
    trendUp: false,
    icon: h(AlertTriangle, { size: 20, style: { color: '#ef4444' } }),
    bg: isBlackGold.value ? 'bg-red-900/20' : 'bg-red-50',
    onClick: () => alert('查看异常预警详情')
  },
  {
    id: 'activity',
    label: '本周活跃度',
    value: '85%',
    trend: '+1.2%',
    trendUp: true,
    icon: h(Activity, { size: 20, style: { color: '#10b981' } }),
    bg: isBlackGold.value ? 'bg-emerald-900/20' : 'bg-emerald-50',
    onClick: () => alert('查看活跃度报告')
  }
])

// Computed
const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         task.desc.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = filterStatus.value === 'all' ||
                         (filterStatus.value === 'completed' && task.completed) ||
                         (filterStatus.value === 'pending' && !task.completed)
    const matchesPriority = selectedPriority.value === 'all' || task.priority === selectedPriority.value

    return matchesSearch && matchesStatus && matchesPriority
  })
})

const completedCount = computed(() => tasks.value.filter(t => t.completed).length)
const pendingCount = computed(() => tasks.value.filter(t => !t.completed).length)

// Methods
const toggleTaskComplete = (taskId: string) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.completed = !task.completed
  }
}

const deleteTask = (taskId: string) => {
  tasks.value = tasks.value.filter(task => task.id !== taskId)
  showTaskMenu.value = null
}

const toggleTaskMenu = (taskId: string) => {
  showTaskMenu.value = showTaskMenu.value === taskId ? null : taskId
}

const refreshTasks = () => {
  // Refresh logic
  console.log('Refreshing tasks...')
}

const clearFilters = () => {
  searchQuery.value = ''
  filterStatus.value = 'all'
  selectedPriority.value = 'all'
}

const handleStatClick = (stat: StatItem) => {
  activeStatCard.value = activeStatCard.value === stat.id ? null : stat.id
  stat.onClick?.()
}

const handleQuickAction = (action: string) => {
  alert(`打开${action}`)
}

const handleHealthClick = (item: string) => {
  alert(`查看${item}`)
}
</script>
