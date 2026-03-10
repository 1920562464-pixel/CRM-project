<template>
  <div class="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
    <!-- Top Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- 总活跃线索 -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
          <div class="text-xs text-slate-500 font-medium mb-1">总活跃线索</div>
          <div class="text-2xl font-bold text-slate-800 mb-1">{{ MOCK_LEADS.length }}</div>
          <div class="text-xs font-medium text-emerald-500">+{{ MOCK_LEADS.filter(l => l.progress > 7).length }} 本周新增</div>
        </div>
        <div class="p-2.5 rounded-lg bg-indigo-500 shadow-sm">
          <Target :size="20" class="text-white" />
        </div>
      </div>

      <!-- 今日需跟进 -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
          <div class="text-xs text-slate-500 font-medium mb-1">今日需跟进</div>
          <div class="text-2xl font-bold text-slate-800 mb-1">{{ MOCK_LEADS.filter(l => l.progress % 7 === 0 && l.progress > 0).length }}</div>
          <div class="text-xs font-medium text-red-500">{{ MOCK_LEADS.filter(l => l.compliance === '差').length }} 依从度差</div>
        </div>
        <div class="p-2.5 rounded-lg bg-orange-500 shadow-sm">
          <AlertCircle :size="20" class="text-white" />
        </div>
      </div>

      <!-- 本周转化率 -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
          <div class="text-xs text-slate-500 font-medium mb-1">付费用户</div>
          <div class="text-2xl font-bold text-slate-800 mb-1">{{ MOCK_LEADS.filter(l => l.isPaid).length }}</div>
          <div class="text-xs font-medium text-blue-500">{{ Math.round((MOCK_LEADS.filter(l => l.isPaid).length / MOCK_LEADS.length) * 100) }}% 付费率</div>
        </div>
        <div class="p-2.5 rounded-lg bg-blue-500 shadow-sm">
          <Trophy :size="20" class="text-white" />
        </div>
      </div>

      <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 text-white shadow-lg flex flex-col justify-between relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all">
        <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/10 transition-colors"></div>
        <div class="flex items-center justify-between z-10">
          <span class="font-bold text-sm text-slate-300">团队龙虎榜</span>
          <Trophy :size="16" class="text-yellow-400" />
        </div>
        <div class="space-y-2 mt-2 z-10">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 bg-yellow-400 text-slate-900 rounded-full flex items-center justify-center font-bold">1</div>
              <span>郝佳乐</span>
            </div>
            <span class="font-mono font-bold text-yellow-400">¥12k</span>
          </div>
          <div class="flex items-center justify-between text-xs opacity-80">
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 bg-slate-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <span>张华灿</span>
            </div>
            <span class="font-mono">¥8k</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="h-[600px]">
      <!-- Main Content (Table) -->
      <div class="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full">
        <!-- Toolbar -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              v-for="tab in TABS"
              :key="tab"
              @click="activeTab = tab"
              class="px-4 py-1.5 text-sm font-medium rounded-md transition-all"
              :class="activeTab === tab
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'"
            >
              {{ tab }}
            </button>
          </div>
          <div class="flex items-center gap-3">
            <div class="text-sm text-slate-500">
              共 <span class="font-bold text-slate-900">{{ filteredLeads.length }}</span> 位用户
            </div>
            <div class="relative group">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" :size="16" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索姓名/手机号"
                class="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 w-64 transition-all"
              />
            </div>
            <button class="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-medium transition-colors">
              <Filter :size="16" />
              筛选
            </button>
            <button class="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors">
              <Download :size="16" />
              导出
            </button>
          </div>
        </div>

        <!-- Table Header -->
        <div class="grid gap-2 items-center px-6 py-3 bg-slate-50/50 text-xs font-bold text-slate-500 border-b border-slate-100 uppercase tracking-wider"
             :class="activeTab === '全部' ? 'grid-cols-[120px_50px_50px_4fr_100px_80px_80px_100px_100px]' : activeTab === '已付费' ? 'grid-cols-[120px_50px_50px_90px_3fr_100px_100px_100px_80px_100px_100px]' : 'grid-cols-[120px_50px_50px_90px_3fr_100px_80px_80px_100px_100px_100px]'">
          <div>姓名</div>
          <div class="text-center">性别</div>
          <div class="text-center">年龄</div>
          <div v-if="activeTab !== '全部'">开始日期</div>
          <div>目标</div>
          <div v-if="activeTab === '14天' || activeTab === '已暂停'" class="text-center">进度</div>
          <div>销转等级</div>
          <div v-if="activeTab !== '全部'" class="text-center">预约</div>
          <div class="text-center">依从度</div>
          <div v-if="activeTab === '已付费'">成单金额</div>
          <div v-if="activeTab === '全部'">状态</div>
          <div>支持团队</div>
          <div class="text-center">操作</div>
        </div>

        <!-- Table Body -->
        <div class="flex-1 overflow-y-auto divide-y divide-slate-50">
          <div
            v-for="lead in filteredLeads"
            :key="lead.id"
            class="grid gap-2 items-center px-6 py-3 hover:bg-slate-50 transition-colors text-sm group cursor-pointer"
            :class="activeTab === '全部' ? 'grid-cols-[120px_50px_50px_4fr_100px_80px_80px_100px_100px]' : activeTab === '已付费' ? 'grid-cols-[120px_50px_50px_90px_3fr_100px_100px_100px_80px_100px_100px]' : 'grid-cols-[120px_50px_50px_90px_3fr_100px_80px_80px_100px_100px_100px]'"
            @click="navigateToProfile(lead.id)"
          >
            <!-- Name -->
            <div class="min-w-0">
              <div class="font-bold text-slate-800 truncate">{{ lead.name }}</div>
              <div v-if="lead.tags && lead.tags.length > 0" class="flex gap-1 mt-1 flex-wrap">
                <span
                  v-for="(tag, i) in lead.tags"
                  :key="i"
                  class="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200 whitespace-nowrap"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Gender -->
            <div class="flex justify-center">
              <span
                class="px-2 py-0.5 text-xs border rounded font-medium"
                :class="lead.gender === 'F'
                  ? 'text-pink-600 border-pink-200 bg-pink-50'
                  : 'text-blue-600 border-blue-200 bg-blue-50'"
              >
                {{ lead.gender === 'F' ? '女' : '男' }}
              </span>
            </div>

            <!-- Age -->
            <div class="text-center text-slate-600 font-medium">{{ lead.age }}岁</div>

            <!-- Start Date (非全部状态显示) -->
            <div v-if="activeTab !== '全部'" class="text-slate-500 text-xs font-mono whitespace-nowrap">{{ lead.startDate.slice(5).replace('-', '/') }}</div>

            <!-- Goal -->
            <div class="text-xs text-slate-500 truncate pr-2 cursor-help relative group/tooltip">
              {{ lead.goal }}
              <div class="absolute left-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs p-2 rounded shadow-xl hidden group-hover/tooltip:block z-10">
                {{ lead.goal }}
              </div>
            </div>

            <!-- Progress (仅在14天和已暂停状态显示) -->
            <div v-if="activeTab === '14天' || activeTab === '已暂停'" class="flex flex-col gap-1">
              <div class="flex gap-[2px]">
                <div
                  v-for="i in 14"
                  :key="i"
                  class="h-3 w-1.5 rounded-sm transition-all"
                  :class="i < lead.progress ? 'bg-orange-500' : 'bg-slate-200'"
                />
              </div>
              <div class="text-[10px] text-slate-400 font-medium text-right">{{ Math.round((lead.progress / 14) * 100) }}%</div>
            </div>

            <!-- Sales Level -->
            <div class="text-center" @click.stop>
              <div class="relative inline-block">
                <select
                  :value="lead.level"
                  @change="updateLevel(lead.id, $event)"
                  class="w-full appearance-none border text-xs py-1 pl-2 pr-5 rounded focus:outline-none focus:border-indigo-500 shadow-sm font-medium cursor-pointer"
                  :class="getLevelClass(lead.level)"
                >
                  <option value="L1">L1</option>
                  <option value="L2">L2</option>
                  <option value="L3">L3</option>
                </select>
                <ChevronDown :size="12" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <!-- Appointment (非全部状态显示) -->
            <div v-if="activeTab !== '全部'" class="flex justify-center" @click.stop>
              <div class="relative inline-block">
                <select
                  :value="lead.appointment"
                  @change="updateAppointment(lead, $event)"
                  class="appearance-none border text-xs py-1 px-2 pr-6 rounded focus:outline-none focus:border-indigo-500 shadow-sm font-medium cursor-pointer transition-colors whitespace-nowrap"
                  :class="getAppointmentClass(lead.appointment)"
                >
                  <option value="未预约">未预约</option>
                  <option value="已预约">已预约</option>
                  <option value="无需预约">无需预约</option>
                </select>
                <ChevronDown :size="12" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <!-- Compliance -->
            <div class="text-center" @click.stop>
              <div class="relative inline-block">
                <select
                  :value="lead.compliance"
                  @change="updateCompliance(lead, $event)"
                  class="appearance-none border text-xs py-1 pl-2 pr-5 rounded focus:outline-none focus:border-indigo-500 shadow-sm font-medium cursor-pointer transition-colors"
                  :class="getComplianceClass(lead.compliance)"
                >
                  <option value="优">优</option>
                  <option value="良">良</option>
                  <option value="差">差</option>
                </select>
                <ChevronDown :size="12" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <!-- Amount (只在已付费tab显示) -->
            <div v-if="activeTab === '已付费'" class="text-center">
              <span class="text-sm font-bold text-emerald-600">¥{{ (lead.amount || 0).toLocaleString() }}</span>
            </div>

            <!-- Status (只在全部tab显示) -->
            <div v-if="activeTab === '全部'" class="text-center" @click.stop>
              <div class="relative inline-block">
                <select
                  :value="getStatusValue(lead)"
                  @change="updateLeadStatus(lead, $event)"
                  class="w-full appearance-none border text-xs py-1 pl-2 pr-5 rounded focus:outline-none focus:border-indigo-500 shadow-sm font-medium cursor-pointer transition-colors"
                  :class="getStatusClass(lead)"
                >
                  <option value="active">14天</option>
                  <option value="paid">已付费</option>
                  <option value="paused">已暂停</option>
                </select>
                <ChevronDown :size="12" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <!-- Team -->
            <div class="text-xs text-slate-600 flex items-center justify-center gap-1.5">
              <div class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                {{ lead.coach.charAt(0) }}
              </div>
              <span class="truncate">{{ lead.coach }}</span>
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-center gap-1" @click.stop>
              <button
                @click="handleViewPlan(lead)"
                class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="查看计划"
              >
                <ExternalLink :size="14" />
              </button>
              <button
                @click="toggleActionMenu(lead.id)"
                class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors relative"
                title="更多操作"
              >
                <MoreHorizontal :size="14" />
              </button>
            </div>
          </div>

          <!-- 空状态 -->
          <div
            v-if="filteredLeads.length === 0"
            class="flex flex-col items-center justify-center py-20 text-slate-400"
          >
            <Users :size="64" class="mb-4 opacity-30" />
            <p class="text-lg font-medium mb-2">暂无用户数据</p>
            <p class="text-sm">
              {{ activeTab === '全部' ? '当前没有用户数据' : activeTab === '14天' ? '当前没有14天用户' : activeTab === '已付费' ? '当前没有已付费用户' : '当前没有已暂停用户' }}
            </p>
            <p v-if="searchQuery" class="text-xs mt-2">尝试清除搜索条件</p>
          </div>
        </div>

        <!-- Pagination Footer -->
        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span class="text-xs text-slate-500">显示 1-{{ filteredLeads.length }} 共 {{ filteredLeads.length }} 条</span>
          <div class="flex gap-2">
            <button class="px-3 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50" disabled>
              上一页
            </button>
            <button class="px-3 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 hover:bg-slate-50">
              下一页
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  MoreHorizontal,
  ChevronDown,
  ExternalLink,
  Target,
  Trophy,
  AlertCircle,
  Clock,
  Filter,
  Download,
  Search,
  Users
} from 'lucide-vue-next'

interface Lead {
  id: number
  name: string
  gender: 'M' | 'F'
  age: number
  startDate: string
  goal: string
  progress: number
  level: 'L1' | 'L2' | 'L3'
  appointment: string
  compliance: string
  coach: string
  avatarColor: string
  tags: string[]
  amount?: number  // 成单金额
  isPaid?: boolean
  isPaused?: boolean
}

const router = useRouter()
const activeTab = ref('14天')
const searchQuery = ref('')

// 过滤后的线索列表
const filteredLeads = computed(() => {
  let leads = MOCK_LEADS

  // 根据标签页过滤
  if (activeTab.value === '已付费') {
    leads = leads.filter(lead => lead.isPaid)
  } else if (activeTab.value === '已暂停') {
    leads = leads.filter(lead => lead.isPaused)
  } else if (activeTab.value === '14天') {
    // 14天显示未付费且未暂停的用户
    leads = leads.filter(lead => !lead.isPaid && !lead.isPaused)
  }
  // '全部' 显示所有用户

  // 根据搜索关键词过滤
  if (searchQuery.value.trim()) {
    const keyword = searchQuery.value.toLowerCase().trim()
    leads = leads.filter(lead =>
      lead.name.toLowerCase().includes(keyword) ||
      lead.coach.toLowerCase().includes(keyword) ||
      lead.goal.toLowerCase().includes(keyword) ||
      lead.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }

  return leads
})

const MOCK_LEADS: Lead[] = [
  {
    id: 1,
    name: '郭道云',
    gender: 'F',
    age: 83,
    startDate: '2026-01-31',
    goal: '控制血糖',
    progress: 4,
    level: 'L3',
    appointment: '未预约',
    compliance: '良',
    coach: '泰敏',
    avatarColor: 'bg-orange-400',
    tags: ['高风险', '老年'],
    isPaid: false,
    isPaused: false
  },
  {
    id: 2,
    name: '孙晓东',
    gender: 'F',
    age: 45,
    startDate: '2026-01-29',
    goal: '14天您想要收获的是 血糖平稳、减重、健康生活方式、健康餐食、提高睡眠质量',
    progress: 6,
    level: 'L2',
    appointment: '未预约',
    compliance: '优',
    coach: '郝佳乐',
    avatarColor: 'bg-yellow-400',
    tags: ['减重'],
    amount: 12800,
    isPaid: true,
    isPaused: false
  },
  {
    id: 3,
    name: '秦勇',
    gender: 'M',
    age: 50,
    startDate: '2026-01-29',
    goal: '14天您想要收获的是 血糖平稳 健康生活方式 提高睡眠质量',
    progress: 6,
    level: 'L1',
    appointment: '未预约',
    compliance: '中',
    coach: '郝佳乐',
    avatarColor: 'bg-orange-400',
    tags: ['睡眠'],
    isPaid: false,
    isPaused: false
  },
  {
    id: 4,
    name: '刘静波',
    gender: 'M',
    age: 48,
    startDate: '2026-01-29',
    goal: '14天最想收获: 减重 养成健康生活方式 学会健康餐食',
    progress: 6,
    level: 'L2',
    appointment: '未预约',
    compliance: '优',
    coach: '张华灿',
    avatarColor: 'bg-yellow-400',
    tags: ['痛风'],
    amount: 12800,
    isPaid: true,
    isPaused: false
  },
  {
    id: 5,
    name: '郑诗雨',
    gender: 'F',
    age: 32,
    startDate: '2026-01-27',
    goal: '14天最想收获的是: 血糖平稳 健康生活方式',
    progress: 8,
    level: 'L3',
    appointment: '未预约',
    compliance: '良',
    coach: '冯瑞',
    avatarColor: 'bg-yellow-500',
    tags: ['备孕'],
    amount: 25800,
    isPaid: true,
    isPaused: false
  },
  {
    id: 6,
    name: '刘雯',
    gender: 'F',
    age: 29,
    startDate: '2026-01-26',
    goal: '14天您想要收获的是: 提高睡眠质量',
    progress: 9,
    level: 'L1',
    appointment: '未预约',
    compliance: '差',
    coach: '张书允',
    avatarColor: 'bg-yellow-600',
    tags: ['职场压力'],
    isPaid: false,
    isPaused: false
  },
  {
    id: 7,
    name: '王芳',
    gender: 'F',
    age: 38,
    startDate: '2026-02-01',
    goal: '产后恢复、塑形、增强体质',
    progress: 5,
    level: 'L2',
    appointment: '已预约',
    compliance: '优',
    coach: '李教练',
    avatarColor: 'bg-pink-400',
    tags: ['产后', '塑形'],
    amount: 12800,
    isPaid: true,
    isPaused: false
  },
  {
    id: 8,
    name: '张伟',
    gender: 'M',
    age: 42,
    startDate: '2026-02-02',
    goal: '增肌训练、提高体能',
    progress: 3,
    level: 'L1',
    appointment: '未预约',
    compliance: '良',
    coach: '王教练',
    avatarColor: 'bg-blue-400',
    tags: ['增肌'],
    isPaid: false,
    isPaused: false
  },
  {
    id: 9,
    name: '李娜',
    gender: 'F',
    age: 35,
    startDate: '2026-02-03',
    goal: '瑜伽冥想、缓解压力',
    progress: 7,
    level: 'L3',
    appointment: '未预约',
    compliance: '中',
    coach: '陈教练',
    avatarColor: 'bg-purple-400',
    tags: ['瑜伽', '减压'],
    amount: 25800,
    isPaid: true,
    isPaused: false
  },
  {
    id: 10,
    name: '赵强',
    gender: 'M',
    age: 55,
    startDate: '2026-01-25',
    goal: '控制血压、改善睡眠',
    progress: 11,
    level: 'L2',
    appointment: '未预约',
    compliance: '优',
    coach: '刘教练',
    avatarColor: 'bg-green-400',
    tags: ['高血压'],
    isPaid: false,
    isPaused: false
  },
  {
    id: 11,
    name: '周梅',
    gender: 'F',
    age: 41,
    startDate: '2026-02-04',
    goal: '减脂塑形、健康饮食',
    progress: 2,
    level: 'L1',
    appointment: '未预约',
    compliance: '差',
    coach: '杨教练',
    avatarColor: 'bg-red-400',
    tags: ['减脂'],
    isPaid: false,
    isPaused: false
  },
  {
    id: 12,
    name: '吴婷',
    gender: 'F',
    age: 28,
    startDate: '2026-02-05',
    goal: '普拉提、核心训练',
    progress: 4,
    level: 'L3',
    appointment: '已预约',
    compliance: '良',
    coach: '周教练',
    avatarColor: 'bg-indigo-400',
    tags: ['普拉提'],
    amount: 25800,
    isPaid: true,
    isPaused: false
  },
  {
    id: 13,
    name: '孙丽',
    gender: 'F',
    age: 33,
    startDate: '2026-01-28',
    goal: '产后修复、盆底肌训练',
    progress: 6,
    level: 'L2',
    appointment: '未预约',
    compliance: '优',
    coach: '吴教练',
    avatarColor: 'bg-teal-400',
    tags: ['产后', 'VIP'],
    amount: 25800,
    isPaid: true,
    isPaused: false
  },
  {
    id: 14,
    name: '黄勇',
    gender: 'M',
    age: 47,
    startDate: '2026-01-24',
    goal: '康复训练、关节保护',
    progress: 10,
    level: 'L3',
    appointment: '未预约',
    compliance: '中',
    coach: '郑教练',
    avatarColor: 'bg-orange-500',
    tags: ['康复'],
    isPaid: false,
    isPaused: true
  },
  {
    id: 15,
    name: '林敏',
    gender: 'F',
    age: 39,
    startDate: '2026-02-06',
    goal: '力量训练、体能提升',
    progress: 1,
    level: 'L1',
    appointment: '未预约',
    compliance: '良',
    coach: '王教练',
    avatarColor: 'bg-cyan-400',
    tags: ['力量'],
    isPaid: false,
    isPaused: false
  },
  {
    id: 16,
    name: '徐芳',
    gender: 'F',
    age: 44,
    startDate: '2026-01-23',
    goal: '健康管理、预防保健',
    progress: 12,
    level: 'L2',
    appointment: '未预约',
    compliance: '优',
    coach: '李教练',
    avatarColor: 'bg-lime-400',
    tags: ['健康'],
    amount: 12800,
    isPaid: true,
    isPaused: false
  },
  {
    id: 17,
    name: '马强',
    gender: 'M',
    age: 52,
    startDate: '2026-01-22',
    goal: '心血管健康、有氧训练',
    progress: 13,
    level: 'L3',
    appointment: '未预约',
    compliance: '良',
    coach: '张教练',
    avatarColor: 'bg-rose-400',
    tags: ['心血管'],
    amount: 25800,
    isPaid: true,
    isPaused: false
  },
  {
    id: 18,
    name: '郭娜',
    gender: 'F',
    age: 31,
    startDate: '2026-02-07',
    goal: '舞蹈健身、形体塑造',
    progress: 2,
    level: 'L1',
    appointment: '未预约',
    compliance: '中',
    coach: '陈教练',
    avatarColor: 'bg-fuchsia-400',
    tags: ['舞蹈'],
    isPaid: false,
    isPaused: false
  },
  {
    id: 19,
    name: '梁杰',
    gender: 'M',
    age: 36,
    startDate: '2026-02-08',
    goal: '拳击训练、反应速度',
    progress: 3,
    level: 'L2',
    appointment: '未预约',
    compliance: '优',
    coach: '刘教练',
    avatarColor: 'bg-sky-400',
    tags: ['拳击'],
    amount: 25800,
    isPaid: true,
    isPaused: false
  },
  {
    id: 20,
    name: '高丽',
    gender: 'F',
    age: 27,
    startDate: '2026-02-09',
    goal: '芭蕾形体、优雅仪态',
    progress: 1,
    level: 'L1',
    appointment: '未预约',
    compliance: '良',
    coach: '杨教练',
    avatarColor: 'bg-violet-400',
    tags: ['芭蕾', 'VIP'],
    amount: 39800,
    isPaid: true,
    isPaused: false
  }
]

const TABS = ['全部', '14天', '已付费', '已暂停']

const getLevelClass = (level: string) => {
  switch (level) {
    case 'L3':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'L2':
      return 'bg-orange-50 text-orange-700 border-orange-200'
    default:
      return 'bg-white text-slate-700 border-slate-200'
  }
}

const getComplianceClass = (compliance: string) => {
  switch (compliance) {
    case '优':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case '差':
      return 'bg-red-50 text-red-700 border-red-200'
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200'
  }
}

const getComplianceDotClass = (compliance: string) => {
  switch (compliance) {
    case '优':
      return 'bg-emerald-500'
    case '差':
      return 'bg-red-500'
    default:
      return 'bg-slate-400'
  }
}

const navigateToProfile = (leadId: number) => {
  console.log('导航到客户详情:', leadId)
  // router.push(`/client-profile/${leadId}`)
}

const updateLevel = (leadId: number, event: Event) => {
  const target = event.target as HTMLSelectElement
  console.log('更新等级:', leadId, target.value)

  // 更新数据中的等级
  const lead = MOCK_LEADS.find(l => l.id === leadId)
  if (lead) {
    lead.level = target.value as 'L1' | 'L2' | 'L3'
  }
}

// 获取预约状态样式
const getAppointmentClass = (appointment: string) => {
  if (appointment === '已预约') {
    return 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
  }
  if (appointment === '无需预约') {
    return 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
  }
  return 'border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
}

// 更新预约状态
const updateAppointment = (lead: Lead, event: Event) => {
  const target = event.target as HTMLSelectElement
  const newAppointment = target.value
  console.log('更新预约状态:', lead.name, '从', lead.appointment, '到', newAppointment)
  lead.appointment = newAppointment
}

// 查看计划按钮处理
const handleViewPlan = (lead: Lead) => {
  console.log('查看计划:', lead.name)
  navigateToProfile(lead.id)
  // 可以打开计划详情模态框或导航到详情页
}

// 更多操作菜单状态
const actionMenuOpen = ref<number | null>(null)

// 切换操作菜单显示
const toggleActionMenu = (leadId: number) => {
  actionMenuOpen.value = actionMenuOpen.value === leadId ? null : leadId
}

// 关闭操作菜单（点击外部时使用）
const closeActionMenu = () => {
  actionMenuOpen.value = null
}

// 获取状态文本
const getStatusText = (lead: Lead) => {
  if (lead.isPaused) return '已暂停'
  if (lead.isPaid) return '已付费'
  return '14天'
}

// 获取状态值（用于 select 绑定）
const getStatusValue = (lead: Lead) => {
  if (lead.isPaused) return 'paused'
  if (lead.isPaid) return 'paid'
  return 'active'
}

// 获取状态样式
const getStatusClass = (lead: Lead) => {
  if (lead.isPaused) {
    return 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
  }
  if (lead.isPaid) {
    return 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
  }
  return 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
}

// 更新用户状态
const updateLeadStatus = (lead: Lead, event: Event) => {
  const target = event.target as HTMLSelectElement
  const newStatus = target.value

  console.log('更新状态:', lead.name, '从', getStatusValue(lead), '到', newStatus)

  // 根据选择更新状态
  if (newStatus === 'paid') {
    lead.isPaid = true
    lead.isPaused = false
  } else if (newStatus === 'paused') {
    lead.isPaid = false
    lead.isPaused = true
  } else {
    lead.isPaid = false
    lead.isPaused = false
  }

  console.log('更新后状态:', getStatusText(lead))
}

// 更新依从度
const updateCompliance = (lead: Lead, event: Event) => {
  const target = event.target as HTMLSelectElement
  const newCompliance = target.value
  console.log('更新依从度:', lead.name, '从', lead.compliance, '到', newCompliance)
  lead.compliance = newCompliance
}
</script>
