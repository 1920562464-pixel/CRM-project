<template>
  <div class="space-y-6">
    <template v-if="currentView === 'dashboard'">
      <!-- 功能模块导航 -->
      <div class="mb-6">
        <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 :size="24" class="text-indigo-600" />
          财务功能模块
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <button
            v-for="module in modules"
            :key="module.id"
            @click="setCurrentView(module)"
            class="group relative p-3 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 hover:shadow-lg"
            :class="currentView === module.id ? 'bg-gradient-to-br shadow-md' : 'bg-white border-slate-200 hover:border-slate-300'"
            :style="currentView === module.id ? {
              backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))`,
              borderColor: 'transparent',
              color: 'white'
            } : undefined"
          >
            <div v-if="module.badge && currentView !== module.id" class="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 bg-amber-400 text-white text-xs font-bold rounded-full shadow-sm">
              {{ module.badge }}
            </div>

            <div class="flex items-center justify-center w-10 h-10 rounded-lg mb-2"
                 :class="currentView === module.id ? 'bg-white/20' : 'bg-slate-100'">
              <component :is="module.icon" :size="18" />
            </div>

            <div class="font-semibold mb-1"
                 :class="currentView === module.id ? 'text-white' : 'text-slate-900'">
              {{ module.name }}
            </div>

            <div class="text-sm leading-tight"
                 :class="currentView === module.id ? 'text-white/80' : 'text-slate-500'">
              {{ module.description }}
            </div>

            <div v-if="module.related" class="mt-2 text-xs"
                 :class="currentView === module.id ? 'text-white/70' : 'text-slate-400'">
              关联: {{ module.related.join('、') }}
            </div>

            <CheckCircle v-if="currentView === module.id" :size="16" class="absolute bottom-3 right-3 text-white" />
          </button>
        </div>
      </div>

      <!-- 快捷统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div class="bg-blue-500 text-white rounded-xl p-4 shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium">本月订单数</span>
            <TrendingUp :size="18" />
          </div>
          <div class="text-2xl font-bold">128</div>
          <div class="text-xs opacity-75">较上月 +12.5%</div>
        </div>

        <div class="bg-green-500 text-white rounded-xl p-4 shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium">待结算教练</span>
            <Users :size="18" />
          </div>
          <div class="text-2xl font-bold">5人</div>
          <div class="text-xs opacity-75">本月待处理</div>
        </div>

        <div class="bg-purple-500 text-white rounded-xl p-4 shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium">待催收</span>
            <DollarSign :size="18" />
          </div>
          <div class="text-2xl font-bold">12笔</div>
          <div class="text-xs opacity-75">需跟进</div>
        </div>

        <div class="bg-amber-500 text-white rounded-xl p-4 shadow-lg">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium">特殊项目</span>
            <FileText :size="18" />
          </div>
          <div class="text-2xl font-bold">8笔</div>
          <div class="text-xs opacity-75">本月记录</div>
        </div>
      </div>

      <!-- 待办事项 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div class="bg-white rounded-xl border border-orange-300 p-4">
          <h3 class="font-bold text-orange-900 mb-3 flex items-center gap-2">
            <AlertCircle :size="16" />
            待处理提醒
          </h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
              <div class="flex items-center gap-2">
                <Users :size="14" class="text-orange-600" />
                <span class="text-sm font-medium text-orange-900">教练结算</span>
              </div>
              <span class="text-xs text-orange-700">待审核</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
              <div class="flex items-center gap-2">
                <DollarSign :size="14" class="text-orange-600" />
                <span class="text-sm font-medium text-orange-900">应收催收</span>
              </div>
              <span class="text-xs text-orange-700">5笔逾期</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
              <div class="flex items-center gap-2">
                <Package :size="14" class="text-orange-600" />
                <span class="text-sm font-medium text-orange-900">特殊项目</span>
              </div>
              <span class="text-xs text-orange-700">3笔待确认</span>
            </div>
          </div>
          <button
            @click="setCurrentView({ id: 'settlement', name: '', description: '', color: '' })"
            class="mt-2 w-full py-1.5 text-xs font-medium text-orange-700 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors"
          >
            查看详情 →
          </button>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-4">
          <h3 class="font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileText :size="16" />
            特殊项目记录
          </h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <div class="flex-1">
                <div class="text-sm font-medium text-slate-900">收入 - 特殊折扣</div>
                <div class="text-xs text-slate-500">王磊 - 年度套餐优惠</div>
              </div>
              <span class="text-xs text-slate-500">今日</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <div class="flex-1">
                <div class="text-sm font-medium text-slate-900">应付 - 额外奖金</div>
                <div class="text-xs text-slate-500">教练张三 - 销售激励</div>
              </div>
              <span class="text-xs text-slate-500">昨日</span>
            </div>
            <div class="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
              <div class="flex-1">
                <div class="text-sm font-medium text-slate-900">成本 - 设备采购</div>
                <div class="text-xs text-slate-500">新增健身器材</div>
              </div>
              <span class="text-xs text-slate-500">3天前</span>
            </div>
          </div>
          <button
            class="mt-2 w-full py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            查看全部 →
          </button>
        </div>
      </div>

      <!-- 业务关联流程 -->
      <div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200 mb-6">
        <h3 class="font-bold text-indigo-900 mb-3 flex items-center gap-2">
          <ArrowUpDown :size="18" class="text-indigo-600" />
          业务流程与数据关联
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div class="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-indigo-100">
            <div class="p-1.5 bg-green-100 rounded-lg">
              <TrendingUp :size="18" class="text-green-600" />
            </div>
            <div>
              <div class="font-bold text-slate-900">收入 → 应收</div>
              <div class="text-xs text-slate-600 mt-0.5">订单录入 → 自动生成应收记录</div>
            </div>
          </div>

          <div class="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-indigo-100">
            <div class="p-1.5 bg-blue-100 rounded-lg">
              <Users :size="18" class="text-blue-600" />
            </div>
            <div>
              <div class="font-bold text-slate-900">人力结算 → 应付</div>
              <div class="text-xs text-slate-600 mt-0.5">教练/医生/顾问结算 → 关联应付账款</div>
            </div>
          </div>

          <div class="flex items-start gap-2.5 p-2.5 bg-white rounded-lg border border-indigo-100">
            <div class="p-1.5 bg-purple-100 rounded-lg">
              <FileText :size="18" class="text-purple-600" />
            </div>
            <div>
              <div class="font-bold text-slate-900">特殊项目记录</div>
              <div class="text-xs text-slate-600 mt-0.5">所有模块支持个性化留痕</div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <!-- 返回按钮 -->
      <div class="mb-3">
        <button
          @click="currentView = 'dashboard'"
          class="px-3 py-1.5 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 text-sm transition-colors"
        >
          <ArrowRight :size="14" />
          返回模块列表
        </button>
      </div>

      <!-- 模块内容 - 嵌入真实的子组件 -->
      <IncomeManagement v-if="currentView === 'income'" />
      <AccountReceivable v-else-if="currentView === 'receivable'" />
      <AccountPayable v-else-if="currentView === 'payable'" />
      <SettlementManagement v-else-if="currentView === 'settlement'" />
      <CostAccounting v-else-if="currentView === 'cost'" />
      <FinancialReports v-else-if="currentView === 'reports'" />
      <div v-else class="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <FileText :size="32" class="text-slate-400" />
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-2">{{ getModuleName(currentView) }}</h3>
        <p class="text-slate-500">{{ getModuleDescription(currentView) }}</p>
        <p class="text-sm text-slate-400 mt-4">功能开发中...</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Wallet,
  TrendingUp,
  FileText,
  DollarSign,
  Users,
  Package,
  CreditCard,
  BarChart3,
  Home,
  ArrowUpDown,
  Calculator,
  FileSpreadsheet,
  PieChart,
  Building,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-vue-next'
import IncomeManagement from './IncomeManagement.vue'
import AccountReceivable from './AccountReceivable.vue'
import AccountPayable from './AccountPayable.vue'
import FinanceOverview from './FinanceOverview.vue'
import FinancialReports from './FinancialReports.vue'
import CostAccounting from './CostAccounting.vue'
import SettlementManagement from './SettlementManagement.vue'

type FinanceView =
  | 'dashboard'
  | 'income'
  | 'receivable'
  | 'payable'
  | 'settlement'
  | 'cost'
  | 'reports'

interface FinanceModule {
  id: FinanceView
  name: string
  icon: any
  description: string
  color: string
  badge?: string
  related?: string[]
}

const currentView = ref<FinanceView>('dashboard')

const modules: FinanceModule[] = [
  {
    id: 'income',
    name: '收入管理',
    icon: TrendingUp,
    description: '业务线、会员、订单关联',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'receivable',
    name: '应收账款',
    icon: DollarSign,
    description: '会员欠款、催收标记',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'payable',
    name: '应付账款',
    icon: AlertCircle,
    description: '教练、医生、合作方结算',
    color: 'from-orange-500 to-orange-600',
    related: ['人力结算', '外部合作']
  },
  {
    id: 'cost',
    name: '成本核算',
    icon: Calculator,
    description: '人力成本、特殊项目',
    color: 'from-amber-500 to-amber-600'
  },
  {
    id: 'reports',
    name: '业务线分析',
    icon: PieChart,
    description: '收入、订单、毛利率分析',
    color: 'from-pink-500 to-pink-600'
  }
]

const setCurrentView = (module: Partial<FinanceModule>) => {
  if (module.id) {
    currentView.value = module.id
    // TODO: toastSuccess(`切换到${module.name}`)
  }
}

const getModuleName = (view: FinanceView): string => {
  const module = modules.find(m => m.id === view)
  return module?.name || ''
}

const getModuleDescription = (view: FinanceView): string => {
  const module = modules.find(m => m.id === view)
  return module?.description || ''
}
</script>
