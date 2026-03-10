<template>
  <div class="space-y-6">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Activity :size="28" class="text-indigo-600" />
          风险预测中心
        </h1>
        <p class="text-sm text-slate-500 mt-2">基于多维度数据的用户健康风险评估与预测</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="refreshData"
          :disabled="loading"
          class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw :size="16" :class="{ 'animate-spin': loading }" />
          刷新数据
        </button>
        <button
          @click="exportReport"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Download :size="16" />
          导出报告
        </button>
      </div>
    </div>

    <!-- 风险统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg shadow-red-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">高风险用户</span>
          <AlertOctagon :size="20" />
        </div>
        <div class="text-3xl font-bold">{{ riskStats.high }}</div>
        <div class="text-xs opacity-75 mt-2">需立即干预</div>
      </div>

      <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg shadow-orange-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">中风险用户</span>
          <AlertTriangle :size="20" />
        </div>
        <div class="text-3xl font-bold">{{ riskStats.medium }}</div>
        <div class="text-xs opacity-75 mt-2">需关注跟进</div>
      </div>

      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg shadow-green-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">低风险用户</span>
          <ShieldCheck :size="20" />
        </div>
        <div class="text-3xl font-bold">{{ riskStats.low }}</div>
        <div class="text-xs opacity-75 mt-2">状态良好</div>
      </div>

      <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg shadow-indigo-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">监测总人数</span>
          <Users :size="20" />
        </div>
        <div class="text-3xl font-bold">{{ riskStats.total }}</div>
        <div class="text-xs opacity-75 mt-2">全部在册用户</div>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div class="flex items-center gap-4 flex-wrap">
        <!-- 风险等级筛选 -->
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-slate-700">风险等级:</span>
          <div class="flex items-center gap-1">
            <button
              v-for="level in riskLevels"
              :key="level.id"
              @click="selectedLevel = level.id"
              class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
              :class="selectedLevel === level.id
                ? level.color + ' text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            >
              {{ level.label }}
              <span v-if="level.count > 0" class="ml-1 opacity-80">({{ level.count }})</span>
            </button>
          </div>
        </div>

        <!-- 搜索框 -->
        <div class="flex-1 min-w-[200px]">
          <div class="relative">
            <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索用户姓名或ID..."
              class="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
          </div>
        </div>

        <!-- 排序 -->
        <div class="flex items-center gap-2">
          <span class="text-sm font-medium text-slate-700">排序:</span>
          <select
            v-model="sortBy"
            class="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="score-desc">风险评分 (高→低)</option>
            <option value="score-asc">风险评分 (低→高)</option>
            <option value="time-desc">预测时间 (新→旧)</option>
            <option value="age-desc">年龄 (大→小)</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 风险用户列表 -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 class="text-lg font-semibold">风险预测列表</h3>
        <div class="text-sm text-slate-500">
          共 {{ filteredPredictions.length }} 位用户
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredPredictions.length === 0" class="p-12 text-center text-slate-400">
        <ShieldCheck :size="48" class="mx-auto mb-4 opacity-50" />
        <p class="font-medium">暂无风险预测数据</p>
        <p class="text-sm mt-1">点击"刷新数据"获取最新预测</p>
      </div>

      <!-- 风险用户列表 -->
      <div v-else class="divide-y divide-slate-200">
        <div
          v-for="prediction in filteredPredictions"
          :key="prediction.id"
          class="p-5 hover:bg-slate-50 transition-colors cursor-pointer"
          @click="viewDetail(prediction)"
        >
          <div class="flex items-start gap-4">
            <!-- 风险等级图标 -->
            <div
              class="p-2 rounded-lg flex-shrink-0"
              :class="getRiskLevelBgClass(prediction.riskLevel)"
            >
              <component :is="getRiskLevelIcon(prediction.riskLevel)" :size="20" :class="getRiskLevelTextClass(prediction.riskLevel)" />
            </div>

            <!-- 用户信息和风险因子 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded"
                    :class="getRiskLevelBadgeClass(prediction.riskLevel)"
                  >
                    {{ getRiskLevelLabel(prediction.riskLevel) }}
                  </span>
                  <h4 class="font-semibold text-slate-900">{{ prediction.userName }}</h4>
                  <span class="text-sm text-slate-500">({{ prediction.userAge }}岁)</span>
                  <span class="text-xs text-slate-400">ID: {{ prediction.userId }}</span>
                </div>
                <span class="text-xs text-slate-500">{{ formatTime(prediction.predictedAt) }}</span>
              </div>

              <!-- 风险因子标签 -->
              <div class="flex items-center gap-2 mb-2 flex-wrap">
                <span v-if="prediction.triggeredFactors.length === 0" class="text-sm text-slate-500">
                  暂无明显风险因子
                </span>
                <template v-else>
                  <span
                    v-for="(factor, index) in prediction.triggeredFactors.slice(0, 4)"
                    :key="index"
                    class="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded"
                    :class="getFactorBadgeClass(factor.severity)"
                  >
                    <span>{{ factor.name }}</span>
                  </span>
                  <span v-if="prediction.triggeredFactors.length > 4" class="text-xs text-slate-400">
                    +{{ prediction.triggeredFactors.length - 4 }}项
                  </span>
                </template>
              </div>

              <!-- 风险指标 -->
              <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-1">
                  <TrendingUp :size="14" />
                  <span class="text-slate-500">风险评分:</span>
                  <span class="font-medium" :class="getRiskScoreColorClass(prediction.riskLevel)">
                    {{ prediction.riskScore }}/100
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  <AlertCircle :size="14" />
                  <span class="text-slate-500">触发因子:</span>
                  <span class="font-medium text-slate-700">{{ prediction.triggeredFactors.length }}项</span>
                </div>
                <div class="flex items-center gap-1">
                  <Lightbulb :size="14" />
                  <span class="text-slate-500">干预建议:</span>
                  <span class="font-medium text-slate-700">{{ prediction.interventions.length }}条</span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <button
                v-if="prediction.riskLevel === 'high'"
                @click.stop="handleEmergencyContact(prediction)"
                class="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              >
                <Phone :size="14" class="inline mr-1" />
                紧急联系
              </button>
              <button
                @click.stop="handleScheduleCheck(prediction)"
                class="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Calendar :size="14" class="inline mr-1" />
                安排检查
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 风险预测详情弹窗 -->
    <Modal v-model:show="showDetailModal" title="风险预测详情" size="xl">
      <RiskPredictionPanel
        v-if="selectedPrediction"
        :prediction="selectedPrediction"
        @emergency-contact="handleEmergencyContact"
        @schedule-check="handleScheduleCheck"
        @view-details="handleViewDetails"
      />
      <template #footer>
        <button @click="showDetailModal = false" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">关闭</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Activity,
  RefreshCw,
  Download,
  AlertOctagon,
  AlertTriangle,
  ShieldCheck,
  Users,
  Search,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Phone,
  Calendar,
  FileText
} from 'lucide-vue-next'
import Toast from '../components/shared/Toast.vue'
import Modal from '../components/shared/Modal.vue'
import RiskPredictionPanel from '../components/RiskPredictionPanel.vue'
import { useToast } from '../composables/useToast'
import { useRiskPrediction } from '../composables/useRiskPrediction'
import type { RiskPrediction, RiskLevel } from '../types/risk'

const toast = useToast()
const {
  riskPredictions,
  loading,
  getRiskStats,
  getPredictionsByLevel,
  refreshPredictions
} = useRiskPrediction()

// 筛选和排序状态
const selectedLevel = ref<RiskLevel | 'all'>('all')
const searchKeyword = ref('')
const sortBy = ref<'score-desc' | 'score-asc' | 'time-desc' | 'age-desc'>('score-desc')
const showDetailModal = ref(false)
const selectedPrediction = ref<RiskPrediction | null>(null)

// 风险等级选项
const riskLevels = computed(() => {
  const stats = getRiskStats.value
  return [
    { id: 'all' as const, label: '全部', color: 'bg-slate-600', count: stats.total },
    { id: 'high' as const, label: '高风险', color: 'bg-red-600', count: stats.high },
    { id: 'medium' as const, label: '中风险', color: 'bg-orange-600', count: stats.medium },
    { id: 'low' as const, label: '低风险', color: 'bg-green-600', count: stats.low }
  ]
})

// 风险统计
const riskStats = computed(() => getRiskStats.value)

// 过滤和排序后的预测列表
const filteredPredictions = computed(() => {
  let predictions = getPredictionsByLevel(selectedLevel.value)

  // 搜索过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    predictions = predictions.filter(p =>
      p.userName.toLowerCase().includes(keyword) ||
      p.userId.toLowerCase().includes(keyword)
    )
  }

  // 排序
  predictions = [...predictions].sort((a, b) => {
    switch (sortBy.value) {
      case 'score-desc':
        return b.riskScore - a.riskScore
      case 'score-asc':
        return a.riskScore - b.riskScore
      case 'time-desc':
        return new Date(b.predictedAt).getTime() - new Date(a.predictedAt).getTime()
      case 'age-desc':
        return b.userAge - a.userAge
      default:
        return 0
    }
  })

  return predictions
})

// 获取风险等级相关样式和标签
const getRiskLevelIcon = (level: RiskLevel) => {
  const icons = {
    high: AlertOctagon,
    medium: AlertTriangle,
    low: ShieldCheck
  }
  return icons[level]
}

const getRiskLevelLabel = (level: RiskLevel) => {
  const labels = {
    high: '高风险',
    medium: '中风险',
    low: '低风险'
  }
  return labels[level]
}

const getRiskLevelBgClass = (level: RiskLevel) => {
  const classes = {
    high: 'bg-red-100',
    medium: 'bg-orange-100',
    low: 'bg-green-100'
  }
  return classes[level]
}

const getRiskLevelTextClass = (level: RiskLevel) => {
  const classes = {
    high: 'text-red-600',
    medium: 'text-orange-600',
    low: 'text-green-600'
  }
  return classes[level]
}

const getRiskLevelBadgeClass = (level: RiskLevel) => {
  const classes = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-orange-100 text-orange-800',
    low: 'bg-green-100 text-green-800'
  }
  return classes[level]
}

const getRiskScoreColorClass = (level: RiskLevel) => {
  const classes = {
    high: 'text-red-600',
    medium: 'text-orange-600',
    low: 'text-green-600'
  }
  return classes[level]
}

const getFactorBadgeClass = (severity: string) => {
  const classes = {
    critical: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-slate-100 text-slate-800'
  }
  return classes[severity as keyof typeof classes] || 'bg-slate-100 text-slate-800'
}

// 格式化时间
const formatTime = (isoString: string) => {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) {
    return `${diffMins}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 查看详情
const viewDetail = (prediction: RiskPrediction) => {
  selectedPrediction.value = prediction
  showDetailModal.value = true
}

// 刷新数据
const refreshData = async () => {
  await refreshPredictions()
  toast.success('刷新成功', '风险预测数据已更新')
}

// 导出报告
const exportReport = () => {
  toast.info('导出报告', '正在生成风险预测报告...')
  // TODO: 实现导出功能
}

// 处理操作
const handleEmergencyContact = (userId: string) => {
  const prediction = riskPredictions.value.find(p => p.userId === userId)
  if (prediction) {
    toast.success('已发起紧急联系', `正在联系 ${prediction.userName} 的紧急联系人`)
  }
  showDetailModal.value = false
}

const handleScheduleCheck = (userId: string) => {
  const prediction = riskPredictions.value.find(p => p.userId === userId)
  if (prediction) {
    toast.success('已安排检查', `已为 ${prediction.userName} 创建健康检查任务`)
  }
  showDetailModal.value = false
}

const handleViewDetails = (userId: string) => {
  toast.info('查看详情', `跳转到用户 ${userId} 的详细档案`)
  showDetailModal.value = false
}

// 初始化
onMounted(async () => {
  await refreshPredictions()
})
</script>
