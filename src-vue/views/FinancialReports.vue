<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold flex items-center gap-2" :style="{ color: 'var(--text-primary)' }">
        <PieChart :size="28" style="color: #ec4899;" />
        业务线分析
      </h1>
      <p class="mt-1" :style="{ color: 'var(--text-secondary)' }">各业务线收入、成本、利润分析（与收入管理模块实时关联）</p>
    </div>

    <!-- 业务线收入统计 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in businessLineFinancialStats" :key="stat.name"
           class="rounded-xl border-2 p-4 transition-all hover:shadow-lg"
           :style="{ borderColor: stat.color, backgroundColor: stat.bgColor }">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium" :style="{ color: stat.textColor }">{{ stat.name }}收入</span>
          <component :is="stat.icon" :size="20" :style="{ color: stat.color }" />
        </div>
        <div class="text-2xl font-bold" :style="{ color: stat.color }">¥{{ stat.revenue.toLocaleString() }}</div>
        <div class="text-xs mt-1" :style="{ color: stat.textColor }">
          {{ stat.orders }} 笔 | 占总收入 {{ stat.percentage }}%
        </div>
        <div class="mt-2 pt-2 border-t" :style="{ borderColor: stat.color + '33' }">
          <div class="flex items-center justify-between text-xs">
            <span :style="{ color: stat.textColor }">毛利率</span>
            <span class="font-semibold" :style="{ color: stat.color }">{{ stat.profitMargin }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 业务线收入明细 -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm" :style="{
      background: 'var(--card)',
      border: '1px solid var(--border)'
    }">
      <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
        <h3 class="text-lg font-bold text-slate-900">业务线收入明细</h3>
        <p class="text-sm text-slate-600">按业务线分类的收入统计</p>
      </div>
      <div class="p-6">
        <div class="space-y-3">
          <div v-for="line in businessLineIncomeDetailsDisplay" :key="line.name" class="border rounded-lg overflow-hidden" :style="{ borderColor: line.color }">
            <div class="flex items-center justify-between px-4 py-3" :style="{ backgroundColor: line.bgColor }">
              <div class="flex items-center gap-3">
                <component :is="line.icon" :size="20" :style="{ color: line.color }" />
                <span class="font-bold text-slate-900">{{ line.name }}</span>
              </div>
              <div class="text-right">
                <div class="text-xl font-bold" :style="{ color: line.color }">¥{{ line.total.toLocaleString() }}</div>
                <div class="text-xs text-slate-600">{{ line.percentage }}% 营业收入</div>
              </div>
            </div>
            <div class="px-4 py-2 bg-white">
              <div class="grid grid-cols-4 gap-3 text-xs">
                <div v-for="product in line.products" :key="product.name">
                  <div class="text-slate-600">{{ product.name }}</div>
                  <div class="font-semibold" :style="{ color: line.color }">¥{{ product.amount.toLocaleString() }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 利润分析 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <div class="text-sm text-slate-600 mb-1">毛利率</div>
        <div class="text-2xl font-bold text-green-600">{{ grossMargin }}%</div>
        <div class="text-xs text-green-600 mt-1">基于业务线平均</div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <div class="text-sm text-slate-600 mb-1">净利率</div>
        <div class="text-2xl font-bold text-pink-600">{{ netMargin }}%</div>
        <div class="text-xs text-slate-500 mt-1">总收入 - 总支出</div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <div class="text-sm text-slate-600 mb-1">总收入</div>
        <div class="text-2xl font-bold text-slate-900">¥{{ totalIncome.toLocaleString() }}</div>
        <div class="text-xs text-slate-500 mt-1">本月累计</div>
      </div>
    </div>

    <!-- 数据来源说明 -->
    <div class="rounded-xl p-4" :style="{
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.2)'
    }">
      <div class="flex items-center gap-2 mb-2">
        <Link2 :size="16" style="color: #2563eb;" />
        <span class="text-sm font-semibold" style="color: #1e3a8a;">数据来源</span>
      </div>
      <div class="text-xs" style="color: #1e3a8a;">
        本页面数据来源于【收入管理模块】，与业务数据实时关联。收入确认以业务发生时间为准，按业务线分类统计。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'

// 主题相关
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')

import {
  PieChart,
  Link2,
  Heart,
  Shield,
  Award,
  Activity as ActivityIcon
} from 'lucide-vue-next'
import { useFinancialData } from '@/composables/useFinancialData'

// 使用统一的财务数据 composable（与收入管理模块数据勾稽）
const {
  incomeByBusinessLine,
  totalIncome,
  totalExpense,
  netProfit,
  grossProfit,
  businessLineIncomeDetails
} = useFinancialData()

// 业务线映射配置
const businessLineConfig = {
  '减重': {
    name: '减重管理',
    icon: ActivityIcon,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    textColor: '#1D4ED8',
    profitMargin: 65.2
  },
  '斑块逆转': {
    name: '斑块逆转',
    icon: Heart,
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    textColor: '#7C3AED',
    profitMargin: 68.5
  },
  '慢病管理': {
    name: '慢病管理',
    icon: Shield,
    color: '#10B981',
    bgColor: '#ECFDF5',
    textColor: '#059669',
    profitMargin: 63.8
  },
  '超越百岁': {
    name: '超越百岁',
    icon: Award,
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    textColor: '#D97706',
    profitMargin: 85.0
  }
} as const

// 业务线财务统计卡片（数据来自 useFinancialData）
const businessLineFinancialStats = computed(() => {
  return Object.entries(incomeByBusinessLine.value)
    .filter(([_, stats]) => stats.revenue > 0)
    .map(([line, stats]) => ({
      name: businessLineConfig[line as keyof typeof businessLineConfig].name,
      icon: businessLineConfig[line as keyof typeof businessLineConfig].icon,
      revenue: stats.revenue,
      orders: stats.orders,
      percentage: stats.percentage.toFixed(1),
      profitMargin: businessLineConfig[line as keyof typeof businessLineConfig].profitMargin,
      color: businessLineConfig[line as keyof typeof businessLineConfig].color,
      bgColor: businessLineConfig[line as keyof typeof businessLineConfig].bgColor,
      textColor: businessLineConfig[line as keyof typeof businessLineConfig].textColor
    }))
})

// 业务线收入明细（用于展示，数据来自 useFinancialData）
const businessLineIncomeDetailsDisplay = computed(() => {
  return Object.entries(businessLineIncomeDetails.value)
    .filter(([_, details]) => details.total > 0)
    .map(([line, details]) => {
      const config = businessLineConfig[line as keyof typeof businessLineConfig]
      const percentage = totalIncome.value > 0 ? (details.total / totalIncome.value * 100).toFixed(1) : '0'
      return {
        name: config.name,
        icon: config.icon,
        total: details.total,
        percentage: parseFloat(percentage),
        color: config.color,
        bgColor: config.bgColor,
        products: Object.entries(details.products)
          .filter(([_, amount]) => amount > 0)
          .map(([name, amount]) => ({ name, amount: amount as number }))
      }
    })
})

// 毛利率
const grossMargin = computed(() => {
  return totalIncome.value > 0 ? (grossProfit.value / totalIncome.value * 100).toFixed(1) : '0'
})

// 净利率
const netMargin = computed(() => {
  return totalIncome.value > 0 ? (netProfit.value / totalIncome.value * 100).toFixed(1) : '0'
})
</script>
