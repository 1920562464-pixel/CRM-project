<template>
  <div class="space-y-4">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- 工资条公式说明 -->
    <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-semibold text-indigo-900 flex items-center gap-2">
          <Calculator :size="18" />
          工资条计算公式
        </h3>
        <div class="text-sm text-indigo-700 bg-white/50 px-3 py-1 rounded-full">
          实发 = 底薪 + 管理费 + 佣金 + 富贵饼 + 上线服务 + 津贴补贴 - 五险一金
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div class="flex items-center gap-2 text-slate-700">
          <div class="w-2 h-2 rounded-full bg-green-500"></div>
          <span><strong>收入项：</strong>底薪 + 管理费 + 佣金 + 富贵饼 + 上线服务 + <span class="text-amber-600 font-medium">津贴补贴(交通/通讯/餐补/房补)</span></span>
        </div>
        <div class="flex items-center gap-2 text-slate-700">
          <div class="w-2 h-2 rounded-full bg-red-500"></div>
          <span><strong>扣款项：</strong>五险一金(养老8% + 医疗2% + 失业0.5% + 公积金12%)</span>
        </div>
      </div>
    </div>

    <!-- 各模块确认状态 -->
    <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-semibold text-slate-900">📊 模块确认状态</h3>
        <div class="flex items-center gap-2 text-sm">
          <span :class="allConfirmed ? 'text-green-600' : 'text-slate-500'">
            {{ confirmedCount }} / 7 已确认
          </span>
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
        <!-- 底薪 -->
        <div
          class="p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
          :class="moduleStatus.baseSalary.confirmed ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'"
          @click="goToModule('base-salary')"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <Calculator :size="16" :class="moduleStatus.baseSalary.confirmed ? 'text-green-600' : 'text-slate-400'" />
              <span class="text-sm font-medium" :class="moduleStatus.baseSalary.confirmed ? 'text-green-900' : 'text-slate-700'">底薪</span>
            </div>
            <CheckCircle v-if="moduleStatus.baseSalary.confirmed" :size="16" class="text-green-600" />
            <Clock v-else :size="16" class="text-slate-400" />
          </div>
          <div class="text-xs" :class="moduleStatus.baseSalary.confirmed ? 'text-green-700' : 'text-slate-600'">
            {{ moduleStatus.baseSalary.confirmed ? '已确认' : '待确认' }}
          </div>
          <div class="text-xs mt-1 text-slate-500">
            ¥{{ moduleStatus.baseSalary.amount.toLocaleString() }}
          </div>
        </div>

        <!-- 管理费 -->
        <div
          class="p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
          :class="moduleStatus.managementFee.confirmed ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'"
          @click="goToModule('management-fee')"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <Briefcase :size="16" :class="moduleStatus.managementFee.confirmed ? 'text-green-600' : 'text-slate-400'" />
              <span class="text-sm font-medium" :class="moduleStatus.managementFee.confirmed ? 'text-green-900' : 'text-slate-700'">管理费</span>
            </div>
            <CheckCircle v-if="moduleStatus.managementFee.confirmed" :size="16" class="text-green-600" />
            <Clock v-else :size="16" class="text-slate-400" />
          </div>
          <div class="text-xs" :class="moduleStatus.managementFee.confirmed ? 'text-green-700' : 'text-slate-600'">
            {{ moduleStatus.managementFee.confirmed ? '已确认' : '待确认' }}
          </div>
          <div class="text-xs mt-1 text-slate-500">
            ¥{{ moduleStatus.managementFee.amount.toLocaleString() }}
          </div>
        </div>

        <!-- 佣金 -->
        <div
          class="p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
          :class="moduleStatus.commission.confirmed ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'"
          @click="goToModule('commission')"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <DollarSign :size="16" :class="moduleStatus.commission.confirmed ? 'text-green-600' : 'text-slate-400'" />
              <span class="text-sm font-medium" :class="moduleStatus.commission.confirmed ? 'text-green-900' : 'text-slate-700'">佣金</span>
            </div>
            <CheckCircle v-if="moduleStatus.commission.confirmed" :size="16" class="text-green-600" />
            <Clock v-else :size="16" class="text-slate-400" />
          </div>
          <div class="text-xs" :class="moduleStatus.commission.confirmed ? 'text-green-700' : 'text-slate-600'">
            {{ moduleStatus.commission.confirmed ? '已确认' : '待确认' }}
          </div>
          <div class="text-xs mt-1 text-slate-500">
            ¥{{ moduleStatus.commission.amount.toLocaleString() }}
          </div>
        </div>

        <!-- 富贵饼 -->
        <div
          class="p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
          :class="moduleStatus.richBiscuit.confirmed ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'"
          @click="goToModule('rich-biscuit')"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <Award :size="16" :class="moduleStatus.richBiscuit.confirmed ? 'text-green-600' : 'text-slate-400'" />
              <span class="text-sm font-medium" :class="moduleStatus.richBiscuit.confirmed ? 'text-green-900' : 'text-slate-700'">富贵饼</span>
            </div>
            <CheckCircle v-if="moduleStatus.richBiscuit.confirmed" :size="16" class="text-green-600" />
            <Clock v-else :size="16" class="text-slate-400" />
          </div>
          <div class="text-xs" :class="moduleStatus.richBiscuit.confirmed ? 'text-green-700' : 'text-slate-600'">
            {{ moduleStatus.richBiscuit.confirmed ? '已确认' : '待确认' }}
          </div>
          <div class="text-xs mt-1 text-slate-500">
            ¥{{ moduleStatus.richBiscuit.amount.toLocaleString() }}
          </div>
        </div>

        <!-- 上线服务 -->
        <div
          class="p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
          :class="moduleStatus.onlineService.confirmed ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'"
          @click="goToModule('online-service')"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <Clock :size="16" :class="moduleStatus.onlineService.confirmed ? 'text-green-600' : 'text-slate-400'" />
              <span class="text-sm font-medium" :class="moduleStatus.onlineService.confirmed ? 'text-green-900' : 'text-slate-700'">上线服务</span>
            </div>
            <CheckCircle v-if="moduleStatus.onlineService.confirmed" :size="16" class="text-green-600" />
            <Clock v-else :size="16" class="text-slate-400" />
          </div>
          <div class="text-xs" :class="moduleStatus.onlineService.confirmed ? 'text-green-700' : 'text-slate-600'">
            {{ moduleStatus.onlineService.confirmed ? '已确认' : '待确认' }}
          </div>
          <div class="text-xs mt-1 text-slate-500">
            ¥{{ moduleStatus.onlineService.amount.toLocaleString() }}
          </div>
        </div>

        <!-- 津贴补贴 -->
        <div
          class="p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
          :class="moduleStatus.allowance.confirmed ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'"
          @click="goToModule('allowance')"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <Coffee :size="16" :class="moduleStatus.allowance.confirmed ? 'text-green-600' : 'text-slate-400'" />
              <span class="text-sm font-medium" :class="moduleStatus.allowance.confirmed ? 'text-green-900' : 'text-slate-700'">津贴补贴</span>
            </div>
            <CheckCircle v-if="moduleStatus.allowance.confirmed" :size="16" class="text-green-600" />
            <Clock v-else :size="16" class="text-slate-400" />
          </div>
          <div class="text-xs" :class="moduleStatus.allowance.confirmed ? 'text-green-700' : 'text-slate-600'">
            {{ moduleStatus.allowance.confirmed ? '已确认' : '待确认' }}
          </div>
          <div class="text-xs mt-1 text-slate-500">
            ¥{{ moduleStatus.allowance.amount.toLocaleString() }}
          </div>
        </div>

        <!-- 五险一金 -->
        <div
          class="p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md"
          :class="moduleStatus.socialInsurance.confirmed ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'"
          @click="goToModule('social-insurance')"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1.5">
              <Shield :size="16" :class="moduleStatus.socialInsurance.confirmed ? 'text-green-600' : 'text-slate-400'" />
              <span class="text-sm font-medium" :class="moduleStatus.socialInsurance.confirmed ? 'text-green-900' : 'text-slate-700'">五险一金</span>
            </div>
            <CheckCircle v-if="moduleStatus.socialInsurance.confirmed" :size="16" class="text-green-600" />
            <Clock v-else :size="16" class="text-slate-400" />
          </div>
          <div class="text-xs" :class="moduleStatus.socialInsurance.confirmed ? 'text-green-700' : 'text-slate-600'">
            {{ moduleStatus.socialInsurance.confirmed ? '已确认' : '待确认' }}
          </div>
          <div class="text-xs mt-1 text-slate-500">
            ¥{{ moduleStatus.socialInsurance.amount.toLocaleString() }}
          </div>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div v-if="allConfirmed" class="flex items-center gap-2 text-green-600">
            <CheckCircle :size="20" />
            <span class="font-medium">所有模块已确认</span>
          </div>
          <div v-else class="flex items-center gap-2 text-amber-600">
            <AlertCircle :size="20" />
            <span class="font-medium">请先确认所有模块</span>
          </div>
        </div>
        <button
          @click="generateSalarySlips"
          :disabled="!allConfirmed"
          class="px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-all"
          :class="allConfirmed
            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-200'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'"
        >
          <FileText :size="16" />
          生成工资条
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  BarChart3, Calculator, Briefcase, DollarSign, Award, Clock, Shield, Coffee,
  CheckCircle, FileText, AlertCircle
} from 'lucide-vue-next'
import Toast from './shared/Toast.vue'
import { useToast } from '../composables/useToast'

const toast = useToast()

const props = defineProps<{
  selectedMonth: string
}>()

const emit = defineEmits<{
  updateMonth: [value: string]
  goToTab: [tab: string]
}>()

// 模块确认状态
const moduleStatus = ref({
  baseSalary: {
    confirmed: false,
    count: 5,
    amount: 15000
  },
  managementFee: {
    confirmed: false,
    count: 3,
    amount: 3000
  },
  commission: {
    confirmed: false,
    count: 12,
    amount: 8500
  },
  richBiscuit: {
    confirmed: false,
    count: 15,
    amount: 1500
  },
  onlineService: {
    confirmed: false,
    count: 25,
    amount: 5800
  },
  allowance: {
    confirmed: false,
    count: 4,
    amount: 1620
  },
  socialInsurance: {
    confirmed: false,
    count: 5,
    amount: 4500
  }
})

// 计算所有模块是否已确认
const allConfirmed = computed(() => {
  return Object.values(moduleStatus.value).every(m => m.confirmed)
})

// 计算已确认模块数量
const confirmedCount = computed(() => {
  return Object.values(moduleStatus.value).filter(m => m.confirmed).length
})

// 获取模块名称
const getModuleName = (key: string): string => {
  const names: Record<string, string> = {
    baseSalary: '底薪',
    managementFee: '管理费',
    commission: '佣金',
    richBiscuit: '富贵饼',
    onlineService: '上线服务',
    allowance: '津贴补贴',
    socialInsurance: '五险一金'
  }
  return names[key] || key
}

// 跳转到指定模块
const goToModule = (tab: string) => {
  emit('goToTab', tab)
}

// 一键确认所有模块
const confirmAllModules = () => {
  // 模拟确认所有模块
  Object.keys(moduleStatus.value).forEach(key => {
    moduleStatus.value[key].confirmed = true
  })
  toast.success('确认成功', '所有模块已确认，可以生成工资条')
}

// 生成工资条
const generateSalarySlips = () => {
  if (!allConfirmed.value) {
    toast.error('操作失败', '请先确认所有模块')
    return
  }

  toast.success('生成成功', '工资条已生成，请到工资条页面查看')
  goToModule('salary-slip')
}

// 监听月份变化，重新获取数据
watch(() => props.selectedMonth, () => {
  // 这里应该重新从后端获取数据
  // 模拟数据更新
  Object.keys(moduleStatus.value).forEach(key => {
    moduleStatus.value[key].confirmed = false
  })
})
</script>
