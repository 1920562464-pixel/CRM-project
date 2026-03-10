<template>
  <div class="space-y-4">
    <!-- 用户基本信息 + 风险等级 -->
    <div class="flex items-start justify-between">
      <div class="flex items-center gap-4">
        <!-- 用户头像 -->
        <div class="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-2xl font-bold text-slate-600 shadow-sm border border-slate-200">
          {{ prediction.userName.charAt(0) }}
        </div>
        <div>
          <h3 class="text-xl font-bold text-slate-900">{{ prediction.userName }}</h3>
          <p class="text-sm text-slate-500">{{ prediction.userAge }}岁 · 用户ID: {{ prediction.userId }}</p>
          <p class="text-xs text-slate-400 mt-1">
            预测时间: {{ formatTime(prediction.predictedAt) }}
          </p>
        </div>
      </div>

      <!-- 风险等级标签 -->
      <div
        class="px-4 py-2 rounded-xl font-bold text-lg shadow-sm"
        :class="riskLevelClass"
      >
        <div class="flex items-center gap-2">
          <component :is="riskLevelIcon" :size="24" />
          <span>{{ riskLevelLabel }}</span>
        </div>
        <div class="text-xs mt-1 opacity-80">风险评分: {{ prediction.riskScore }}/100</div>
      </div>
    </div>

    <!-- 风险评分进度条 -->
    <div class="bg-slate-50 rounded-xl p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-slate-700">综合风险评分</span>
        <span class="text-sm font-bold" :class="scoreTextColor">{{ prediction.riskScore }}分</span>
      </div>
      <div class="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="scoreBarColor"
          :style="{ width: `${prediction.riskScore}%` }"
        ></div>
      </div>
      <div class="flex justify-between mt-2 text-xs text-slate-500">
        <span>低风险</span>
        <span>中风险</span>
        <span>高风险</span>
      </div>
    </div>

    <!-- 关键指标异常次数 -->
    <div v-if="prediction.keyIndicators" class="bg-slate-50 rounded-xl p-4">
      <h4 class="font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <TrendingUp :size="18" class="text-indigo-500" />
        关键指标异常趋势
      </h4>
      <div class="space-y-3">
        <div class="group">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-slate-600">心率异常</span>
            <span class="font-medium text-slate-900">{{ prediction.keyIndicators.heartRateAbnormal }}次</span>
          </div>
          <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-1000 ease-out group-hover:from-red-400 group-hover:to-red-500"
              :style="{ width: `${Math.min(prediction.keyIndicators.heartRateAbnormal * 5, 100)}%` }"
            ></div>
          </div>
        </div>
        <div class="group">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-slate-600">血压异常</span>
            <span class="font-medium text-slate-900">{{ prediction.keyIndicators.bloodPressureAbnormal }}次</span>
          </div>
          <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-1000 ease-out group-hover:from-orange-400 group-hover:to-orange-500"
              :style="{ width: `${Math.min(prediction.keyIndicators.bloodPressureAbnormal * 5, 100)}%` }"
            ></div>
          </div>
        </div>
        <div class="group">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-slate-600">睡眠异常</span>
            <span class="font-medium text-slate-900">{{ prediction.keyIndicators.sleepAbnormal }}次</span>
          </div>
          <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 transition-all duration-1000 ease-out group-hover:from-yellow-400 group-hover:to-yellow-500"
              :style="{ width: `${Math.min(prediction.keyIndicators.sleepAbnormal * 5, 100)}%` }"
            ></div>
          </div>
        </div>
        <div class="group">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-slate-600">任务未完成</span>
            <span class="font-medium text-slate-900">{{ prediction.keyIndicators.taskIncomplete }}次</span>
          </div>
          <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1000 ease-out group-hover:from-green-400 group-hover:to-green-500"
              :style="{ width: `${Math.min(prediction.keyIndicators.taskIncomplete * 5, 100)}%` }"
            ></div>
          </div>
        </div>
        <div class="group">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-slate-600">活动量不足</span>
            <span class="font-medium text-slate-900">{{ prediction.keyIndicators.activityInsufficient }}次</span>
          </div>
          <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-1000 ease-out group-hover:from-indigo-400 group-hover:to-indigo-500"
              :style="{ width: `${Math.min(prediction.keyIndicators.activityInsufficient * 5, 100)}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 风险因子列表 -->
    <div v-if="prediction.triggeredFactors.length > 0" class="bg-slate-50 rounded-xl p-4">
      <h4 class="font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <AlertTriangle :size="18" class="text-orange-500" />
        触发风险因子 ({{ prediction.triggeredFactors.length }})
      </h4>
      <div class="space-y-3">
        <div
          v-for="(factor, index) in prediction.triggeredFactors"
          :key="index"
          class="bg-white rounded-lg p-3 border border-slate-200"
        >
          <div
            class="flex items-start justify-between cursor-pointer"
            @click="toggleFactorExpand(index)"
          >
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="px-2 py-0.5 text-xs font-medium rounded"
                  :class="getFactorCategoryClass(factor.category)"
                >
                  {{ getFactorCategoryLabel(factor.category) }}
                </span>
                <span
                  class="px-2 py-0.5 text-xs font-medium rounded"
                  :class="getFactorSeverityClass(factor.severity)"
                >
                  {{ getFactorSeverityLabel(factor.severity) }}
                </span>
                <span class="font-medium text-slate-800">{{ factor.name }}</span>
              </div>
              <p class="text-sm text-slate-600">{{ factor.description }}</p>
            </div>
            <ChevronDown
              :size="18"
              class="text-slate-400 transition-transform"
              :class="{ 'rotate-180': expandedFactors[index] }"
            />
          </div>

          <!-- 展开的详情 -->
          <div
            v-if="expandedFactors[index]"
            class="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-sm"
          >
            <div>
              <span class="text-slate-500">当前值:</span>
              <span class="ml-2 font-medium" :class="getFactorValueColorClass(factor.severity)">
                {{ factor.currentValue }}
              </span>
            </div>
            <div>
              <span class="text-slate-500">阈值:</span>
              <span class="ml-2 font-medium text-slate-700">{{ factor.threshold }}</span>
            </div>
            <div class="col-span-2">
              <span class="text-slate-500">权重:</span>
              <div class="mt-1 flex items-center gap-2">
                <div class="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-blue-500 rounded-full"
                    :style="{ width: `${factor.weight * 100}%` }"
                  ></div>
                </div>
                <span class="text-xs text-slate-600">{{ Math.round(factor.weight * 100) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 干预建议列表 -->
    <div v-if="prediction.interventions.length > 0" class="bg-blue-50 rounded-xl p-4">
      <h4 class="font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <Lightbulb :size="18" class="text-blue-500" />
        干预建议 ({{ prediction.interventions.length }})
      </h4>
      <div class="space-y-2">
        <div
          v-for="(intervention, index) in prediction.interventions"
          :key="index"
          class="bg-white rounded-lg p-3 border border-blue-100"
        >
          <div class="flex items-start gap-3">
            <div
              class="px-2 py-1 text-xs font-medium rounded"
              :class="getInterventionPriorityClass(intervention.priority)"
            >
              {{ getInterventionPriorityLabel(intervention.priority) }}
            </div>
            <div class="flex-1">
              <p class="font-medium text-slate-800">{{ intervention.action }}</p>
              <div class="flex items-center gap-2 mt-1 text-xs text-slate-500">
                <span class="bg-slate-100 px-1.5 py-0.5 rounded">{{ intervention.target }}</span>
                <span>{{ intervention.reason }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="flex gap-3 pt-2">
      <button
        class="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
        @click="handleEmergencyContact"
      >
        <Phone :size="18" />
        紧急联系
      </button>
      <button
        class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
        @click="handleScheduleCheck"
      >
        <Calendar :size="18" />
        安排检查
      </button>
      <button
        class="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        @click="handleViewDetails"
      >
        <FileText :size="18" />
        查看详情
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  AlertTriangle,
  ChevronDown,
  Lightbulb,
  Phone,
  Calendar,
  FileText,
  AlertCircle,
  AlertOctagon,
  ShieldCheck,
  TrendingUp
} from 'lucide-vue-next'
import type { RiskPrediction, RiskLevel } from '../types/risk'

interface Props {
  prediction: RiskPrediction
}

const props = defineProps<Props>()

const emit = defineEmits<{
  emergencyContact: [userId: string]
  scheduleCheck: [userId: string]
  viewDetails: [userId: string]
}>()

// 风险因子展开状态
const expandedFactors = ref<Record<number, boolean>>({})

/**
 * 切换风险因子展开状态
 */
function toggleFactorExpand(index: number) {
  expandedFactors.value[index] = !expandedFactors.value[index]
}

/**
 * 风险等级样式
 */
const riskLevelClass = computed(() => {
  const classes = {
    high: 'bg-red-600 text-white animate-pulse',
    medium: 'bg-orange-500 text-white',
    low: 'bg-green-500 text-white'
  }
  return classes[props.prediction.riskLevel]
})

/**
 * 风险等级图标
 */
const riskLevelIcon = computed(() => {
  const icons = {
    high: AlertOctagon,
    medium: AlertTriangle,
    low: ShieldCheck
  }
  return icons[props.prediction.riskLevel]
})

/**
 * 风险等级标签
 */
const riskLevelLabel = computed(() => {
  const labels = {
    high: '高风险',
    medium: '中风险',
    low: '低风险'
  }
  return labels[props.prediction.riskLevel]
})

/**
 * 评分文字颜色
 */
const scoreTextColor = computed(() => {
  const colors = {
    high: 'text-red-600',
    medium: 'text-orange-600',
    low: 'text-green-600'
  }
  return colors[props.prediction.riskLevel]
})

/**
 * 评分进度条颜色
 */
const scoreBarColor = computed(() => {
  const colors = {
    high: 'bg-gradient-to-r from-red-500 to-red-600',
    medium: 'bg-gradient-to-r from-orange-500 to-orange-600',
    low: 'bg-gradient-to-r from-green-500 to-green-600'
  }
  return colors[props.prediction.riskLevel]
})

/**
 * 获取风险因子类别标签
 */
function getFactorCategoryLabel(category: string): string {
  const labels = {
    physiological: '生理',
    behavioral: '行为',
    assessment: '评估'
  }
  return labels[category as keyof typeof labels] || category
}

/**
 * 获取风险因子类别样式
 */
function getFactorCategoryClass(category: string): string {
  const classes = {
    physiological: 'bg-purple-100 text-purple-700',
    behavioral: 'bg-blue-100 text-blue-700',
    assessment: 'bg-green-100 text-green-700'
  }
  return classes[category as keyof typeof classes] || 'bg-slate-100 text-slate-700'
}

/**
 * 获取风险因子严重程度标签
 */
function getFactorSeverityLabel(severity: string): string {
  const labels = {
    critical: '严重',
    warning: '警告',
    info: '提示'
  }
  return labels[severity as keyof typeof labels] || severity
}

/**
 * 获取风险因子严重程度样式
 */
function getFactorSeverityClass(severity: string): string {
  const classes = {
    critical: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-slate-100 text-slate-800'
  }
  return classes[severity as keyof typeof classes] || 'bg-slate-100 text-slate-800'
}

/**
 * 获取风险因子数值颜色样式
 */
function getFactorValueColorClass(severity: string): string {
  const classes = {
    critical: 'text-red-600',
    warning: 'text-orange-600',
    info: 'text-slate-600'
  }
  return classes[severity as keyof typeof classes] || 'text-slate-600'
}

/**
 * 获取干预优先级标签
 */
function getInterventionPriorityLabel(priority: string): string {
  const labels = {
    urgent: '紧急',
    recommended: '建议',
    optional: '可选'
  }
  return labels[priority as keyof typeof labels] || priority
}

/**
 * 获取干预优先级样式
 */
function getInterventionPriorityClass(priority: string): string {
  const classes = {
    urgent: 'bg-red-100 text-red-700',
    recommended: 'bg-blue-100 text-blue-700',
    optional: 'bg-slate-100 text-slate-700'
  }
  return classes[priority as keyof typeof classes] || 'bg-slate-100 text-slate-700'
}

/**
 * 格式化时间
 */
function formatTime(isoString: string): string {
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

/**
 * 紧急联系
 */
function handleEmergencyContact() {
  emit('emergencyContact', props.prediction.userId)
}

/**
 * 安排检查
 */
function handleScheduleCheck() {
  emit('scheduleCheck', props.prediction.userId)
}

/**
 * 查看详情
 */
function handleViewDetails() {
  emit('viewDetails', props.prediction.userId)
}
</script>
