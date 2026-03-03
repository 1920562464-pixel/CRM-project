<template>
  <div class="space-y-6">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Calculator :size="28" class="text-indigo-600" />
          HR 结算中心
        </h1>
        <p class="text-sm text-slate-500 mt-2">统一管理人力结算、佣金激励和工资条</p>
      </div>
    </div>

    <!-- 快捷操作 -->
    <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
      <h2 class="text-lg font-semibold mb-4">快捷操作</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          @click="navigateTo('/rich-biscuit-management')"
          class="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-left transition-all"
        >
          <Award :size="24" class="mb-2" />
          <div class="font-semibold">发放富贵饼</div>
          <div class="text-xs opacity-75 mt-1">激励员工表现</div>
        </button>

        <button
          @click="navigateTo('/online-service-management')"
          class="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-left transition-all"
        >
          <Clock :size="24" class="mb-2" />
          <div class="font-semibold">记录上线服务</div>
          <div class="text-xs opacity-75 mt-1">教练医生上线</div>
        </button>

        <button
          @click="navigateTo('/service-binding-management')"
          class="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-left transition-all"
        >
          <Link2 :size="24" class="mb-2" />
          <div class="font-semibold">管理用户绑定</div>
          <div class="text-xs opacity-75 mt-1">员工用户关系</div>
        </button>

        <button
          @click="navigateTo('/salary-slip-management')"
          class="bg-white/20 hover:bg-white/30 rounded-lg p-4 text-left transition-all"
        >
          <FileText :size="24" class="mb-2" />
          <div class="font-semibold">生成工资条</div>
          <div class="text-xs opacity-75 mt-1">月度薪酬结算</div>
        </button>
      </div>
    </div>

    <!-- 本月结算概览 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 富贵饼统计 -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">🏆 富贵饼统计</h3>
          <span class="text-sm text-slate-500">{{ currentMonth }}</span>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-orange-600">{{ richBiscuitStats.totalIssued }}</div>
            <div class="text-sm text-slate-600 mt-1">发放总数</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">¥{{ richBiscuitStats.totalValue.toLocaleString() }}</div>
            <div class="text-sm text-slate-600 mt-1">总价值</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ richBiscuitStats.recipientCount }}</div>
            <div class="text-sm text-slate-600 mt-1">获奖人数</div>
          </div>
        </div>
        <button
          @click="navigateTo('/rich-biscuit-management')"
          class="w-full mt-4 px-4 py-2 border border-orange-200 text-orange-600 rounded-lg hover:bg-orange-50 text-sm font-medium"
        >
          查看详情 →
        </button>
      </div>

      <!-- 上线服务统计 -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">⏰ 上线服务统计</h3>
          <span class="text-sm text-slate-500">{{ currentMonth }}</span>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ onlineServiceStats.totalCount }}</div>
            <div class="text-sm text-slate-600 mt-1">服务次数</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-purple-600">{{ onlineServiceStats.nightCount }}</div>
            <div class="text-sm text-slate-600 mt-1">夜间服务</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">¥{{ onlineServiceStats.totalAmount.toLocaleString() }}</div>
            <div class="text-sm text-slate-600 mt-1">总金额</div>
          </div>
        </div>
        <button
          @click="navigateTo('/online-service-management')"
          class="w-full mt-4 px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
        >
          查看详情 →
        </button>
      </div>

      <!-- 用户绑定统计 -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">🔗 用户绑定统计</h3>
          <span class="text-sm text-slate-500">当前</span>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-indigo-600">{{ bindingStats.total }}</div>
            <div class="text-sm text-slate-600 mt-1">总绑定数</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">{{ bindingStats.newUserCount }}</div>
            <div class="text-sm text-slate-600 mt-1">新用户</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ bindingStats.oldUserCount }}</div>
            <div class="text-sm text-slate-600 mt-1">老用户</div>
          </div>
        </div>
        <button
          @click="navigateTo('/service-binding-management')"
          class="w-full mt-4 px-4 py-2 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 text-sm font-medium"
        >
          查看详情 →
        </button>
      </div>

      <!-- 工资条统计 -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">📋 工资条统计</h3>
          <span class="text-sm text-slate-500">{{ currentMonth }}</span>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="text-3xl font-bold text-slate-600">{{ salaryStats.total }}</div>
            <div class="text-sm text-slate-600 mt-1">工资条数</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-green-600">¥{{ salaryStats.totalNetSalary.toLocaleString() }}</div>
            <div class="text-sm text-slate-600 mt-1">实发总额</div>
          </div>
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600">{{ salaryStats.approved }}</div>
            <div class="text-sm text-slate-600 mt-1">已审核</div>
          </div>
        </div>
        <button
          @click="navigateTo('/salary-slip-management')"
          class="w-full mt-4 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-sm font-medium"
        >
          查看详情 →
        </button>
      </div>
    </div>

    <!-- 工作流程 -->
    <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 class="text-lg font-semibold mb-4">📊 HR 结算工作流程</h3>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div class="relative">
          <div class="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
              <span class="font-semibold text-indigo-900">发放激励</span>
            </div>
            <p class="text-sm text-indigo-700">发放富贵饼奖励优秀员工</p>
          </div>
          <div class="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-indigo-400">
            <ChevronRight :size="24" />
          </div>
        </div>

        <div class="relative">
          <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
              <span class="font-semibold text-blue-900">记录服务</span>
            </div>
            <p class="text-sm text-blue-700">记录教练医生上线服务</p>
          </div>
          <div class="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-blue-400">
            <ChevronRight :size="24" />
          </div>
        </div>

        <div class="relative">
          <div class="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
              <span class="font-semibold text-purple-900">管理绑定</span>
            </div>
            <p class="text-sm text-purple-700">维护员工用户绑定关系</p>
          </div>
          <div class="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-purple-400">
            <ChevronRight :size="24" />
          </div>
        </div>

        <div class="relative">
          <div class="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
              <span class="font-semibold text-orange-900">生成工资</span>
            </div>
            <p class="text-sm text-orange-700">自动计算生成月度工资条</p>
          </div>
          <div class="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-orange-400">
            <ChevronRight :size="24" />
          </div>
        </div>

        <div class="relative">
          <div class="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">5</div>
              <span class="font-semibold text-green-900">审核发放</span>
            </div>
            <p class="text-sm text-green-700">审核通过后发放工资</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 月度趋势 -->
    <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 class="text-lg font-semibold mb-4">📈 近半年薪酬趋势</h3>
      <div class="h-64 flex items-end justify-around gap-2">
        <div v-for="month in monthlyTrend" :key="month.month" class="flex flex-col items-center flex-1">
          <div class="w-full flex flex-col justify-end" style="height: 200px;">
            <div
              class="bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all hover:from-indigo-500 hover:to-indigo-300"
              :style="{ height: (month.amount / maxTrendAmount * 180) + 'px' }"
              :title="`${month.month}: ¥${month.amount.toLocaleString()}`"
            ></div>
          </div>
          <div class="text-xs text-slate-600 mt-2 font-medium">{{ month.label }}</div>
          <div class="text-xs text-slate-500">¥{{ (month.amount / 1000).toFixed(1) }}k</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Calculator, Award, Clock, Link2, FileText, ChevronRight } from 'lucide-vue-next'
import Toast from '../components/shared/Toast.vue'
import { useSalary } from '../composables/useSalary'
import { useRichBiscuit } from '../composables/useRichBiscuit'

const router = useRouter()
const { getSalaryStats } = useSalary()
const { getRichBiscuitStats } = useRichBiscuit()

// 当前月份
const currentMonth = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  return `${year}年${month}月`
})

// 富贵饼统计（模拟）
const richBiscuitStats = ref({
  totalIssued: 15,
  totalValue: 1500,
  recipientCount: 5
})

// 上线服务统计（模拟）
const onlineServiceStats = ref({
  totalCount: 25,
  nightCount: 8,
  totalAmount: 5800
})

// 用户绑定统计（模拟）
const bindingStats = ref({
  total: 42,
  newUserCount: 15,
  oldUserCount: 27
})

// 工资条统计
const salaryStats = ref({
  total: 0,
  totalNetSalary: 0,
  approved: 0
})

// 月度趋势数据（模拟）
const monthlyTrend = ref([
  { month: '2024-09', label: '9月', amount: 45000 },
  { month: '2024-10', label: '10月', amount: 47000 },
  { month: '2024-11', label: '11月', amount: 52000 },
  { month: '2024-12', label: '12月', amount: 58000 },
  { month: '2025-01', label: '1月', amount: 55000 },
  { month: '2025-02', label: '2月', amount: 62000 }
])

// 最大趋势金额（用于计算高度）
const maxTrendAmount = computed(() => {
  return Math.max(...monthlyTrend.value.map(m => m.amount))
})

// 导航方法
const navigateTo = (path: string) => {
  router.push(path)
}

// 更新统计数据
const updateStats = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const currentMonthStr = `${year}-${month}`

  const salaryData = getSalaryStats(currentMonthStr)
  salaryStats.value = {
    total: salaryData.total,
    totalNetSalary: salaryData.totalNetSalary,
    approved: salaryData.approved
  }
}

onMounted(() => {
  updateStats()
})
</script>
