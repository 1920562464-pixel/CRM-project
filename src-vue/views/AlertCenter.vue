<template>
  <div class="space-y-6">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle :size="28" class="text-red-600" />
          预警中心
        </h1>
        <p class="text-sm text-slate-500 mt-2">财务风险监控与异常预警</p>
      </div>
      <div class="flex items-center gap-3">
        <button
          @click="goToRiskPrediction"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Activity :size="16" />
          风险预测中心
        </button>
        <button
          @click="refreshAlerts"
          class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <RefreshCw :size="16" />
          刷新
        </button>
      </div>
    </div>

    <!-- 预警统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg shadow-red-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">紧急预警</span>
          <AlertCircle :size="20" />
        </div>
        <div class="text-3xl font-bold">{{ alertStats.critical }}</div>
        <div class="text-xs opacity-75 mt-2">需立即处理</div>
      </div>

      <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg shadow-orange-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">重要预警</span>
          <Bell :size="20" />
        </div>
        <div class="text-3xl font-bold">{{ alertStats.warning }}</div>
        <div class="text-xs opacity-75 mt-2">需关注处理</div>
      </div>

      <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-5 text-white shadow-lg shadow-yellow-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">一般提醒</span>
          <Info :size="20" />
        </div>
        <div class="text-3xl font-bold">{{ alertStats.info }}</div>
        <div class="text-xs opacity-75 mt-2">需要注意</div>
      </div>

      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg shadow-green-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">本月已处理</span>
          <CheckCircle :size="20" />
        </div>
        <div class="text-3xl font-bold">{{ alertStats.resolved }}</div>
        <div class="text-xs opacity-75 mt-2">已解决预警</div>
      </div>
    </div>

    <!-- 风险预测统计 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg shadow-red-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium opacity-90">高风险用户</span>
          <ShieldAlert :size="18" />
        </div>
        <div class="text-2xl font-bold">{{ alertStats.highRisk }}</div>
        <div class="text-xs opacity-75 mt-1">需立即干预</div>
      </div>

      <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg shadow-orange-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium opacity-90">中风险用户</span>
          <Activity :size="18" />
        </div>
        <div class="text-2xl font-bold">{{ alertStats.mediumRisk }}</div>
        <div class="text-xs opacity-75 mt-1">需关注跟进</div>
      </div>

      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg shadow-green-200">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium opacity-90">低风险用户</span>
          <CheckCircle :size="18" />
        </div>
        <div class="text-2xl font-bold">{{ alertStats.lowRisk }}</div>
        <div class="text-xs opacity-75 mt-1">状态良好</div>
      </div>
    </div>

    <!-- 预警筛选 -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex items-center gap-2">
          <button
            v-for="tab in alertTabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2"
            :class="activeTab === tab.id
              ? tab.color + ' text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            >
              <component :is="tab.icon" :size="16" />
              {{ tab.label }}
              <span v-if="tab.count > 0" class="px-1.5 py-0.5 bg-white/20 rounded text-xs">{{ tab.count }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 预警列表 -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <h3 class="text-lg font-semibold">预警详情</h3>
        <div class="text-sm text-slate-500">
          共 {{ filteredAlerts.length }} 条预警
        </div>
      </div>

      <div v-if="filteredAlerts.length === 0" class="p-12 text-center text-slate-400">
        <CheckCircle :size="48" class="mx-auto mb-4 opacity-50" />
        <p class="font-medium">暂无预警</p>
        <p class="text-sm mt-1">系统运行正常</p>
      </div>

      <div v-else-if="activeTab === 'risk-prediction'" class="divide-y divide-slate-200">
        <div
          v-for="prediction in filteredRiskPredictions"
          :key="prediction.id"
          class="p-5 hover:bg-slate-50 transition-colors cursor-pointer"
          @click="viewRiskDetail(prediction)"
        >
          <div class="flex items-start gap-4">
            <!-- 风险等级图标 -->
            <div
              class="p-2 rounded-lg"
              :class="getRiskLevelBgClass(prediction.riskLevel)"
            >
              <component :is="getRiskLevelIcon(prediction.riskLevel)" :size="20" :class="getRiskLevelTextClass(prediction.riskLevel)" />
            </div>

            <!-- 预测内容 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded"
                    :class="getRiskLevelBadgeClass(prediction.riskLevel)"
                  >
                    {{ getRiskLevelLabel(prediction.riskLevel) }}
                  </span>
                  <h4 class="font-semibold text-slate-900">{{ prediction.userName }} ({{ prediction.userAge }}岁)</h4>
                </div>
                <span class="text-xs text-slate-500">{{ formatTime(prediction.predictedAt) }}</span>
              </div>

              <p class="text-sm text-slate-600 mb-2">
                <template v-if="prediction.triggeredFactors.length > 0">
                  <span v-for="(factor, index) in prediction.triggeredFactors.slice(0, 2)" :key="index" class="inline-flex items-center gap-1 mr-2">
                    <span class="text-orange-500">⚠</span>
                    {{ factor.name }}
                  </span>
                  <span v-if="prediction.triggeredFactors.length > 2" class="text-slate-400">
                    +{{ prediction.triggeredFactors.length - 2 }}项
                  </span>
                </template>
                <template v-else>
                  暂无明显风险因子
                </template>
              </p>

              <!-- 风险指标 -->
              <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-1">
                  <TrendingUp :size="14" />
                  <span class="text-slate-500">风险评分：</span>
                  <span class="font-medium" :class="getRiskScoreColorClass(prediction.riskLevel)">
                    {{ prediction.riskScore }}/100
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  <AlertCircle :size="14" />
                  <span class="text-slate-500">触发因子：</span>
                  <span class="font-medium text-slate-700">{{ prediction.triggeredFactors.length }}项</span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center gap-2">
              <button
                v-if="prediction.riskLevel === 'high'"
                @click.stop="handleRiskEmergencyContact(prediction.userId)"
                class="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              >
                紧急联系
              </button>
              <button
                @click.stop="handleRiskScheduleCheck(prediction.userId)"
                class="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                安排检查
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="divide-y divide-slate-200">
        <div
          v-for="alert in filteredAlerts"
          :key="alert.id"
          class="p-5 hover:bg-slate-50 transition-colors cursor-pointer"
          @click="viewAlertDetail(alert)"
        >
          <div class="flex items-start gap-4">
            <!-- 预警图标 -->
            <div
              class="p-2 rounded-lg"
              :class="getSeverityBgClass(alert.severity)"
            >
              <component :is="getSeverityIcon(alert.severity)" :size="20" :class="getSeverityTextClass(alert.severity)" />
            </div>

            <!-- 预警内容 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <span
                    class="px-2 py-1 text-xs font-medium rounded"
                    :class="getSeverityBadgeClass(alert.severity)"
                  >
                    {{ getSeverityLabel(alert.severity) }}
                  </span>
                  <h4 class="font-semibold text-slate-900">{{ alert.title }}</h4>
                </div>
                <span class="text-xs text-slate-500">{{ alert.createdAt }}</span>
              </div>

              <p class="text-sm text-slate-600 mb-2">{{ alert.description }}</p>

              <!-- 预警指标 -->
              <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-1">
                  <TrendingUp :size="14" />
                  <span class="text-slate-500">当前值：</span>
                  <span class="font-medium" :class="getValueClass(alert.severity)">
                    {{ alert.currentValue }}
                  </span>
                </div>
                <div class="flex items-center gap-1">
                  <Target :size="14" />
                  <span class="text-slate-500">阈值：</span>
                  <span class="font-medium text-slate-700">{{ alert.threshold }}</span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center gap-2">
              <button
                v-if="alert.status === 'pending'"
                @click.stop="handleAlert(alert)"
                class="px-3 py-1.5 text-xs font-medium rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
              >
                处理
              </button>
              <button
                v-if="alert.status === 'pending'"
                @click.stop="dismissAlert(alert.id)"
                class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                忽略
              </button>
              <span
                v-if="alert.status === 'resolved'"
                class="px-3 py-1.5 text-xs font-medium rounded-lg bg-green-100 text-green-700"
              >
                已处理
              </span>
            </div>
          </div>
        </div>
    </div>

    <!-- 预警详情弹窗 -->
    <Modal v-model:show="showDetailModal" title="预警详情" size="lg">
      <div v-if="selectedAlert" class="space-y-4">
        <div class="flex items-center gap-3 mb-4">
          <div
            class="p-2 rounded-lg"
            :class="getSeverityBgClass(selectedAlert.severity)"
          >
            <component :is="getSeverityIcon(selectedAlert.severity)" :size="24" :class="getSeverityTextClass(selectedAlert.severity)" />
          </div>
          <div>
            <span
              class="px-2 py-1 text-xs font-medium rounded"
              :class="getSeverityBadgeClass(selectedAlert.severity)"
            >
              {{ getSeverityLabel(selectedAlert.severity) }}
            </span>
            <h3 class="text-lg font-bold text-slate-900 mt-1">{{ selectedAlert.title }}</h3>
          </div>
        </div>

        <div class="bg-slate-50 rounded-lg p-4">
          <h4 class="font-semibold text-slate-900 mb-2">预警描述</h4>
          <p class="text-sm text-slate-600">{{ selectedAlert.description }}</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="bg-slate-50 rounded-lg p-4">
            <div class="text-sm text-slate-500 mb-1">当前值</div>
            <div class="text-xl font-bold" :class="getValueClass(selectedAlert.severity)">
              {{ selectedAlert.currentValue }}
            </div>
          </div>
          <div class="bg-slate-50 rounded-lg p-4">
            <div class="text-sm text-slate-500 mb-1">预警阈值</div>
            <div class="text-xl font-bold text-slate-700">
              {{ selectedAlert.threshold }}
            </div>
          </div>
        </div>

        <div class="bg-slate-50 rounded-lg p-4">
          <h4 class="font-semibold text-slate-900 mb-2">建议措施</h4>
          <ul class="text-sm text-slate-600 space-y-1">
            <li v-for="(suggestion, index) in selectedAlert.suggestions" :key="index" class="flex items-start gap-2">
              <span class="text-blue-500">•</span>
              <span>{{ suggestion }}</span>
            </li>
          </ul>
        </div>
      </div>
      <template #footer>
        <button @click="showDetailModal = false" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">关闭</button>
        <button
          v-if="selectedAlert?.status === 'pending'"
          @click="handleAlert(selectedAlert)"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          立即处理
        </button>
      </template>
    </Modal>

    <!-- 风险预测详情弹窗 -->
    <Modal v-model:show="showRiskDetailModal" title="风险预测详情" size="xl">
      <RiskPredictionPanel
        v-if="selectedRiskPrediction"
        :prediction="selectedRiskPrediction"
        @emergency-contact="handleRiskEmergencyContact"
        @schedule-check="handleRiskScheduleCheck"
        @view-details="handleRiskViewDetails"
      />
      <template #footer>
        <button @click="showRiskDetailModal = false" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">关闭</button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  ShieldCheck,
  Bell,
  Info,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Target,
  Activity,
  ShieldAlert
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import Toast from '../components/shared/Toast.vue'
import Modal from '../components/shared/Modal.vue'
import RiskPredictionPanel from '../components/RiskPredictionPanel.vue'
import { useToast } from '../composables/useToast'
import { useRiskPrediction } from '../composables/useRiskPrediction'

const router = useRouter()
const toast = useToast()
const {
  riskPredictions,
  loading: riskLoading,
  getRiskStats,
  getPredictionsByLevel,
  refreshPredictions
} = useRiskPrediction()

interface Alert {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  currentValue: string
  threshold: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
  suggestions: string[]
}

// 预警统计
const alertStats = ref({
  critical: 3,
  warning: 7,
  info: 5,
  resolved: 12,
  highRisk: 0,
  mediumRisk: 0,
  lowRisk: 0
})

// 预警标签
const alertTabs = ref([
  { id: 'all', label: '全部', icon: AlertCircle, count: 15, color: 'bg-slate-600' },
  { id: 'critical', label: '紧急', icon: AlertTriangle, count: 3, color: 'bg-red-600' },
  { id: 'warning', label: '重要', icon: Bell, count: 7, color: 'bg-orange-600' },
  { id: 'info', label: '一般', icon: Info, count: 5, color: 'bg-yellow-600' },
  { id: 'risk-prediction', label: '风险预测', icon: Activity, count: 0, color: 'bg-indigo-600' }
])

const activeTab = ref('all')
const showDetailModal = ref(false)
const selectedAlert = ref<Alert | null>(null)
const showRiskDetailModal = ref(false)
const selectedRiskPrediction = ref<any>(null)

// 模拟预警数据
const alerts = ref<Alert[]>([
  {
    id: '1',
    severity: 'critical',
    title: '应收账款逾期严重',
    description: '有5位会员应收账款逾期超过30天，总金额达到¥45,000',
    currentValue: '¥45,000',
    threshold: '¥30,000',
    status: 'pending',
    createdAt: '2小时前',
    suggestions: [
      '立即联系逾期会员进行催收',
      '对于长期逾期客户考虑采取法律手段',
      '评估客户信用等级，调整后续服务政策'
    ]
  },
  {
    id: '2',
    severity: 'critical',
    title: '现金流预警',
    description: '本月现金流为负，预计下月资金缺口¥120,000',
    currentValue: '-¥85,000',
    threshold: '-¥50,000',
    status: 'pending',
    createdAt: '5小时前',
    suggestions: [
      '催收应收账款，加快资金回笼',
      '延迟非必要支出',
      '考虑短期融资补充流动资金'
    ]
  },
  {
    id: '3',
    severity: 'critical',
    title: '库存周转率过低',
    description: '部分产品库存积压严重，周转率低于行业平均水平',
    currentValue: '2.1次/年',
    threshold: '3.0次/年',
    status: 'pending',
    createdAt: '1天前',
    suggestions: [
      '对滞销产品进行促销清理',
      '调整采购计划，减少库存积压',
      '分析产品结构，优化库存配置'
    ]
  },
  {
    id: '4',
    severity: 'warning',
    title: '教练结算延迟',
    description: '本月有3位教练的结算尚未完成，可能影响员工积极性',
    currentValue: '3人未结算',
    threshold: '全部完成',
    status: 'pending',
    createdAt: '3小时前',
    suggestions: [
      '尽快完成教练结算审核',
      '优化结算流程，提高效率',
      '建立结算提醒机制'
    ]
  },
  {
    id: '5',
    severity: 'warning',
    title: '特殊项目支出增加',
    description: '本月特殊项目支出超出预算20%',
    currentValue: '¥12,000',
    threshold: '¥10,000',
    status: 'pending',
    createdAt: '6小时前',
    suggestions: [
      '审查特殊项目支出的合理性',
      '对超出预算的项目进行审批',
      '调整下月预算分配'
    ]
  },
  {
    id: '6',
    severity: 'info',
    title: '餐补标准调整建议',
    description: '工作日餐补标准可以适度调整以匹配市场价格',
    currentValue: '¥40/天',
    threshold: '市场均价¥45/天',
    status: 'pending',
    createdAt: '1天前',
    suggestions: [
      '调研市场餐补标准',
      '评估调整后的成本影响',
      '征求员工意见'
    ]
  }
])

// 过滤预警
const filteredAlerts = computed(() => {
  if (activeTab.value === 'risk-prediction') {
    return [] // 风险预测使用独立的列表
  }
  if (activeTab.value === 'all') {
    return alerts.value.filter(a => a.status !== 'dismissed')
  }
  return alerts.value.filter(a => a.severity === activeTab.value && a.status !== 'dismissed')
})

// 过滤风险预测
const filteredRiskPredictions = computed(() => {
  const predictions = riskPredictions.value
  if (activeTab.value === 'risk-prediction') {
    return predictions
  }
  return []
})

// 获取严重程度图标
const getSeverityIcon = (severity: string) => {
  const icons = {
    critical: AlertTriangle,
    warning: Bell,
    info: Info
  }
  return icons[severity as keyof typeof icons] || Info
}

// 获取严重程度标签
const getSeverityLabel = (severity: string) => {
  const labels = {
    critical: '紧急',
    warning: '重要',
    info: '一般'
  }
  return labels[severity as keyof typeof labels] || '一般'
}

// 获取严重程度背景样式
const getSeverityBgClass = (severity: string) => {
  const classes = {
    critical: 'bg-red-100',
    warning: 'bg-orange-100',
    info: 'bg-yellow-100'
  }
  return classes[severity as keyof typeof classes] || 'bg-slate-100'
}

// 获取严重程度文字样式
const getSeverityTextClass = (severity: string) => {
  const classes = {
    critical: 'text-red-600',
    warning: 'text-orange-600',
    info: 'text-yellow-600'
  }
  return classes[severity as keyof typeof classes] || 'text-slate-600'
}

// 获取严重程度徽章样式
const getSeverityBadgeClass = (severity: string) => {
  const classes = {
    critical: 'bg-red-100 text-red-800',
    warning: 'bg-orange-100 text-orange-800',
    info: 'bg-yellow-100 text-yellow-800'
  }
  return classes[severity as keyof typeof classes] || 'bg-slate-100 text-slate-800'
}

// 获取数值样式
const getValueClass = (severity: string) => {
  const classes = {
    critical: 'text-red-600',
    warning: 'text-orange-600',
    info: 'text-yellow-600'
  }
  return classes[severity as keyof typeof classes] || 'text-slate-600'
}

// 风险等级相关函数
const getRiskLevelIcon = (level: string) => {
  const icons = {
    high: AlertOctagon,
    medium: AlertTriangle,
    low: ShieldCheck
  }
  return icons[level as keyof typeof icons] || AlertCircle
}

const getRiskLevelLabel = (level: string) => {
  const labels = {
    high: '高风险',
    medium: '中风险',
    low: '低风险'
  }
  return labels[level as keyof typeof labels] || '未知'
}

const getRiskLevelBgClass = (level: string) => {
  const classes = {
    high: 'bg-red-100',
    medium: 'bg-orange-100',
    low: 'bg-green-100'
  }
  return classes[level as keyof typeof classes] || 'bg-slate-100'
}

const getRiskLevelTextClass = (level: string) => {
  const classes = {
    high: 'text-red-600',
    medium: 'text-orange-600',
    low: 'text-green-600'
  }
  return classes[level as keyof typeof classes] || 'text-slate-600'
}

const getRiskLevelBadgeClass = (level: string) => {
  const classes = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-orange-100 text-orange-800',
    low: 'bg-green-100 text-green-800'
  }
  return classes[level as keyof typeof classes] || 'bg-slate-100 text-slate-800'
}

const getRiskScoreColorClass = (level: string) => {
  const classes = {
    high: 'text-red-600',
    medium: 'text-orange-600',
    low: 'text-green-600'
  }
  return classes[level as keyof typeof classes] || 'text-slate-600'
}

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

// 查看预警详情
const viewAlertDetail = (alert: Alert) => {
  selectedAlert.value = alert
  showDetailModal.value = true
}

// 查看风险预测详情
const viewRiskDetail = (prediction: any) => {
  selectedRiskPrediction.value = prediction
  showRiskDetailModal.value = true
}

// 处理风险预测操作
const handleRiskEmergencyContact = (userId: string) => {
  toast.success('已发起紧急联系', `正在联系用户 ${userId} 的紧急联系人`)
  showRiskDetailModal.value = false
}

const handleRiskScheduleCheck = (userId: string) => {
  toast.success('已安排检查', `已为用户 ${userId} 创建健康检查任务`)
  showRiskDetailModal.value = false
}

const handleRiskViewDetails = (userId: string) => {
  toast.info('查看详情', `跳转到用户 ${userId} 的详细档案`)
  showRiskDetailModal.value = false
}

// 处理预警
const handleAlert = (alert: Alert) => {
  alert.status = 'resolved'
  toast.success('处理成功', '预警已标记为已处理')
  showDetailModal.value = false
  updateStats()
}

// 忽略预警
const dismissAlert = (id: string) => {
  const alert = alerts.value.find(a => a.id === id)
  if (alert) {
    alert.status = 'dismissed'
    toast.success('已忽略', '预警已被忽略')
    updateStats()
  }
}

// 刷新预警
const refreshAlerts = () => {
  toast.success('刷新成功', '预警数据已更新')
}

// 跳转到风险预测中心
const goToRiskPrediction = () => {
  router.push('/risk-prediction')
}

// 更新统计
const updateStats = () => {
  alertStats.value.critical = alerts.value.filter(a => a.severity === 'critical' && a.status === 'pending').length
  alertStats.value.warning = alerts.value.filter(a => a.severity === 'warning' && a.status === 'pending').length
  alertStats.value.info = alerts.value.filter(a => a.severity === 'info' && a.status === 'pending').length
  alertStats.value.resolved = alerts.value.filter(a => a.status === 'resolved').length

  // 更新风险统计
  const riskStats = getRiskStats.value
  alertStats.value.highRisk = riskStats.high
  alertStats.value.mediumRisk = riskStats.medium
  alertStats.value.lowRisk = riskStats.low

  alertTabs.value[0].count = alerts.value.filter(a => a.status === 'pending').length
  alertTabs.value[1].count = alertStats.value.critical
  alertTabs.value[2].count = alertStats.value.warning
  alertTabs.value[3].count = alertStats.value.info
  alertTabs.value[4].count = riskStats.total
}

// 初始化
onMounted(async () => {
  await refreshPredictions()
  updateStats()
})
</script>
