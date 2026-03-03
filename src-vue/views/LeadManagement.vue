<template>
  <div class="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
    <!-- Top Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- 总活跃线索 -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
          <div class="text-xs text-slate-500 font-medium mb-1">总活跃线索</div>
          <div class="text-2xl font-bold text-slate-800 mb-1">128</div>
          <div class="text-xs font-medium text-emerald-500">+5 本周</div>
        </div>
        <div class="p-2.5 rounded-lg bg-indigo-500 shadow-sm">
          <Target :size="20" class="text-white" />
        </div>
      </div>

      <!-- 今日需跟进 -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
          <div class="text-xs text-slate-500 font-medium mb-1">今日需跟进</div>
          <div class="text-2xl font-bold text-slate-800 mb-1">15</div>
          <div class="text-xs font-medium text-red-500">3 逾期</div>
        </div>
        <div class="p-2.5 rounded-lg bg-orange-500 shadow-sm">
          <AlertCircle :size="20" class="text-white" />
        </div>
      </div>

      <!-- 本周转化率 -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
        <div>
          <div class="text-xs text-slate-500 font-medium mb-1">本周转化率</div>
          <div class="text-2xl font-bold text-slate-800 mb-1">24.5%</div>
          <div class="text-xs font-medium text-emerald-500">↑ 2.1%</div>
        </div>
        <div class="p-2.5 rounded-lg bg-emerald-500 shadow-sm">
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
    <div class="flex gap-6 h-[600px]">
      <!-- Left: Main Content (Table) -->
      <div class="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
        <div class="grid grid-cols-[60px_100px_60px_60px_100px_3fr_120px_100px_100px_100px_120px_80px] gap-2 items-center px-6 py-3 bg-slate-50/50 text-xs font-bold text-slate-500 border-b border-slate-100 uppercase tracking-wider">
          <div class="text-center">头像</div>
          <div>姓名</div>
          <div class="text-center">性别</div>
          <div class="text-center">年龄</div>
          <div>开始日期</div>
          <div>14天目标</div>
          <div>进度</div>
          <div>销转等级</div>
          <div class="text-center">预约</div>
          <div>依从度</div>
          <div>支持团队</div>
          <div class="text-center">操作</div>
        </div>

        <!-- Table Body -->
        <div class="flex-1 overflow-y-auto divide-y divide-slate-50">
          <div
            v-for="lead in MOCK_LEADS"
            :key="lead.id"
            class="grid grid-cols-[60px_100px_60px_60px_100px_3fr_120px_100px_100px_100px_120px_80px] gap-2 items-center px-6 py-4 hover:bg-slate-50 transition-colors text-sm group cursor-pointer"
            @click="navigateToProfile(lead.id)"
          >
            <!-- Avatar -->
            <div class="flex justify-center relative">
              <div :class="`w-10 h-10 rounded-full ${lead.avatarColor} text-white flex items-center justify-center font-bold shadow-sm border-2 border-white ring-1 ring-slate-100`">
                {{ lead.name.charAt(0) }}
              </div>
              <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>

            <!-- Name -->
            <div>
              <div class="font-bold text-slate-800">{{ lead.name }}</div>
              <div v-if="lead.tags && lead.tags.length > 0" class="flex gap-1 mt-1">
                <span
                  v-for="(tag, i) in lead.tags"
                  :key="i"
                  class="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200"
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
            <div class="text-center text-slate-600 font-medium">{{ lead.age }}</div>

            <!-- Start Date -->
            <div class="text-slate-500 text-xs font-mono">{{ lead.startDate.slice(5) }}</div>

            <!-- Goal -->
            <div class="text-xs text-slate-500 line-clamp-2 pr-4 leading-relaxed cursor-help relative group/tooltip">
              {{ lead.goal }}
              <div class="absolute left-0 bottom-full mb-2 w-64 bg-slate-800 text-white text-xs p-2 rounded shadow-xl hidden group-hover/tooltip:block z-10">
                {{ lead.goal }}
              </div>
            </div>

            <!-- Progress -->
            <div>
              <div class="flex gap-[2px] mb-1">
                <div
                  v-for="i in 14"
                  :key="i"
                  class="h-4 w-1.5 rounded-sm transition-all"
                  :class="i < lead.progress ? 'bg-orange-500' : 'bg-slate-200'"
                />
              </div>
              <div class="text-[10px] text-slate-400 font-medium text-right mr-2">{{ Math.round((lead.progress / 14) * 100) }}%</div>
            </div>

            <!-- Sales Level -->
            <div @click.stop>
              <div class="relative">
                <select
                  :value="lead.level"
                  @change="updateLevel(lead.id, $event)"
                  class="w-full appearance-none border text-xs py-1.5 pl-2 pr-6 rounded focus:outline-none focus:border-indigo-500 shadow-sm font-medium"
                  :class="getLevelClass(lead.level)"
                >
                  <option value="选...">选...</option>
                  <option value="L1">L1 (意向)</option>
                  <option value="L2">L2 (犹豫)</option>
                  <option value="L3">L3 (拒绝)</option>
                </select>
                <ChevronDown :size="12" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <!-- Appointment -->
            <div class="flex justify-center" @click.stop>
              <button
                class="px-2 py-1 border text-xs rounded transition-colors font-medium"
                :class="lead.appointment !== '未预约'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'border-slate-200 text-slate-400 hover:bg-slate-50'"
              >
                {{ lead.appointment }}
              </button>
            </div>

            <!-- Compliance -->
            <div>
              <span
                class="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border"
                :class="getComplianceClass(lead.compliance)"
              >
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  :class="getComplianceDotClass(lead.compliance)"
                />
                {{ lead.compliance }}
              </span>
            </div>

            <!-- Team -->
            <div class="text-xs text-slate-600 flex items-center gap-2">
              <div class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                {{ lead.coach.charAt(0) }}
              </div>
              {{ lead.coach }}
            </div>

            <!-- Actions -->
            <div class="flex items-center justify-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
              <button class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="查看计划">
                <ExternalLink :size="16" />
              </button>
              <button class="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors">
                <MoreHorizontal :size="16" />
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination Footer -->
        <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span class="text-xs text-slate-500">显示 1-{{ MOCK_LEADS.length }} 共 {{ MOCK_LEADS.length }} 条</span>
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

      <!-- Right Sidebar: Today's Focus -->
      <div class="w-80 flex flex-col gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
          <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 class="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <Calendar :size="16" class="text-indigo-600" />
              今日重点待办
            </h3>
            <span class="text-xs text-slate-400">3项</span>
          </div>

          <div class="p-4 space-y-3 overflow-y-auto flex-1">
            <div class="p-3 bg-red-50 border border-red-100 rounded-xl relative overflow-hidden group hover:shadow-md transition-all cursor-pointer">
              <div class="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full -mr-4 -mt-4"></div>
              <div class="flex items-start gap-2 mb-1 relative z-10">
                <AlertCircle :size="16" class="text-red-500 mt-0.5" />
                <span class="text-sm font-bold text-slate-800">首通电话逾期 (2人)</span>
              </div>
              <div class="text-xs text-slate-600 ml-6 mb-3 relative z-10">
                刘测试 (181...)<br/>
                张建国 (139...)
              </div>
              <button class="ml-6 text-xs text-white bg-red-500 px-3 py-1.5 rounded-lg hover:bg-red-600 shadow-sm transition-colors flex items-center gap-1 w-fit">
                立即拨打 <ArrowRight :size="12" />
              </button>
            </div>

            <div class="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">第3天问卷跟进</span>
                <span class="text-xs font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">14:00</span>
              </div>
              <div class="text-xs text-slate-500 mb-2">需确认 5 位用户的饮食记录完整性。</div>
              <div class="flex items-center justify-between">
                <div class="flex -space-x-1.5">
                  <div class="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[9px] text-slate-500 border border-white">A</div>
                  <div class="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-[9px] text-slate-500 border border-white">B</div>
                  <div class="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center text-[9px] text-slate-500 border border-white">+3</div>
                </div>
                <button class="text-xs text-indigo-600 font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity">查看详情</button>
              </div>
            </div>

            <div class="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-slate-800">L3 客户回访</span>
                <span class="text-xs font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">16:30</span>
              </div>
              <div class="text-xs text-slate-500">尝试挽回 2 位高意向流失客户。</div>
            </div>
          </div>

          <div class="p-3 border-t border-slate-100 bg-slate-50 text-center">
            <button class="text-xs text-slate-500 hover:text-indigo-600 transition-colors">查看全部日程</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  MoreHorizontal,
  ChevronDown,
  ExternalLink,
  Target,
  Trophy,
  AlertCircle,
  Clock,
  Calendar,
  Filter,
  Download,
  Search,
  ArrowRight
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
}

const router = useRouter()
const activeTab = ref('14天')
const searchQuery = ref('')

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
    tags: ['高风险', '老年']
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
    tags: ['减重']
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
    tags: ['睡眠']
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
    tags: ['痛风']
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
    tags: ['备孕']
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
    tags: ['职场压力']
  }
]

const TABS = ['14天', '已付费', '已暂停']

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
}
</script>
