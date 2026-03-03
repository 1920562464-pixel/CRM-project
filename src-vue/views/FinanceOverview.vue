<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--text-primary)' }">财务总览</h1>
      <p class="text-sm mt-1" :style="{ color: 'var(--text-secondary)' }">月度财务数据概览</p>
    </div>

    <!-- 关键指标卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div
        v-for="metric in metrics"
        :key="metric.label"
        class="p-4 rounded-xl border shadow-sm"
        :style="metric.highlight ? {
          background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5',
          border: isBlackGold.value ? '#B8860B' : '#4338ca'
        } : {
          background: 'var(--card)',
          border: '1px solid var(--border)'
        }"
      >
        <div class="text-xs font-medium mb-1" :style="{ color: metric.highlight ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }">
          {{ metric.label }}
        </div>
        <div class="text-2xl font-bold mb-2" :style="{ color: metric.highlight ? 'white' : 'var(--text-primary)' }">
          {{ metric.value }}
        </div>
        <div class="text-xs flex items-center gap-1" :style="{ color: metric.highlight ? 'rgba(255,255,255,0.8)' : metric.trendColor }">
          <ArrowUpRight v-if="metric.positive" :size="12" />
          <ArrowDownLeft v-else :size="12" />
          {{ metric.trend }}
          <span class="opacity-60" :style="{ color: metric.highlight ? 'white' : 'var(--text-disabled)' }">较上月</span>
        </div>
      </div>
    </div>

    <!-- 图表区 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 p-6 rounded-xl shadow-sm" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <h3 class="font-bold mb-6" :style="{ color: 'var(--text-primary)' }">收入 vs 成本趋势</h3>
        <div class="h-72">
          <div class="w-full h-full flex items-center justify-center" :style="{ color: 'var(--text-secondary)' }">
            <div class="text-center">
              <BarChart3 :size="48" class="mx-auto mb-2 opacity-50" />
              <p>图表功能开发中...</p>
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 rounded-xl shadow-sm" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <h3 class="font-bold mb-6" :style="{ color: 'var(--text-primary)' }">成本结构分析</h3>
        <div class="h-72">
          <div class="w-full h-full flex items-center justify-center" :style="{ color: 'var(--text-secondary)' }">
            <div class="text-center">
              <PieChartIcon :size="48" class="mx-auto mb-2 opacity-50" />
              <p>图表功能开发中...</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 月度对比表 -->
    <div class="rounded-xl shadow-sm overflow-hidden" :style="{
      background: 'var(--card)',
      border: '1px solid var(--border)'
    }">
      <div class="px-6 py-4" :style="{
        background: 'var(--fill-light)',
        borderBottom: '1px solid var(--border)'
      }">
        <h3 class="text-lg font-semibold" :style="{ color: 'var(--text-primary)' }">月度数据对比</h3>
      </div>
      <table class="w-full">
        <thead class="font-semibold text-xs uppercase" :style="{
          background: 'var(--fill-light)',
          borderBottom: '1px solid var(--border)',
          color: 'var(--text-secondary)'
        }">
          <tr>
            <th class="px-6 py-3 text-left">月份</th>
            <th class="px-6 py-3 text-right">收入</th>
            <th class="px-6 py-3 text-right">总成本</th>
            <th class="px-6 py-3 text-right">毛利</th>
            <th class="px-6 py-3 text-right">毛利率</th>
            <th class="px-6 py-3 text-right">用户数</th>
            <th class="px-6 py-3 text-right">人均毛利</th>
          </tr>
        </thead>
        <tbody :style="{ borderTop: '1px solid var(--border)' }">
          <tr v-for="(data, index) in INCOME_DATA" :key="index" class="hover:bg-slate-50/50" :style="{
            borderBottom: '1px solid var(--border-lighter)'
          }">
            <td class="px-6 py-4" :style="{ color: 'var(--text-primary)' }">{{ data.month }}</td>
            <td class="px-6 py-4 text-right font-semibold" style="color: #16a34a;">
              ¥{{ data.income.toLocaleString() }}
            </td>
            <td class="px-6 py-4 text-right font-semibold" style="color: #ef4444;">
              ¥{{ data.cost.toLocaleString() }}
            </td>
            <td class="px-6 py-4 text-right font-semibold" :style="{ color: 'var(--text-primary)' }">
              ¥{{ (data.income - data.cost).toLocaleString() }}
            </td>
            <td class="px-6 py-4 text-right" :style="{ color: 'var(--text-regular)' }">
              {{ ((data.income - data.cost) / data.income * 100).toFixed(1) }}%
            </td>
            <td class="px-6 py-4 text-right" :style="{ color: 'var(--text-regular)' }">
              {{ Math.floor(data.income / 300) }}
            </td>
            <td class="px-6 py-4 text-right" :style="{ color: 'var(--text-primary)' }">
              ¥{{ Math.floor((data.income - data.cost) / Math.floor(data.income / 300)).toLocaleString() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowUpRight, ArrowDownLeft, BarChart3, PieChart as PieChartIcon } from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'

// 主题相关
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')

interface Metric {
  label: string
  value: string
  trend: string
  positive?: boolean
  negative?: boolean
  highlight?: boolean
  trendColor?: string
}

const INCOME_DATA = [
  { month: '9月', income: 45000, cost: 28000 },
  { month: '10月', income: 52000, cost: 31000 },
  { month: '11月', income: 48000, cost: 29000 },
  { month: '12月', income: 61000, cost: 35000 },
  { month: '1月', income: 55000, cost: 32000 },
  { month: '2月', income: 67000, cost: 38000 }
]

const COST_STRUCTURE = [
  { name: '库存成本', value: 35 },
  { name: '教练人力', value: 30 },
  { name: '医生人力', value: 20 },
  { name: '运营杂项', value: 15 }
]

const COLORS = ['#4f46e5', '#06b6d4', '#8b5cf6', '#64748b']

const metrics = computed<Metric[]>(() => [
  {
    label: '本月总收入',
    value: '¥67,000',
    trend: '+12%',
    positive: true,
    trendColor: 'text-green-600'
  },
  {
    label: '本月总成本',
    value: '¥38,000',
    trend: '+5%',
    negative: true,
    trendColor: 'text-red-600'
  },
  {
    label: '库存采购',
    value: '¥12,400',
    trend: '-2%',
    positive: true,
    trendColor: 'text-green-600'
  },
  {
    label: '人力成本',
    value: '¥22,500',
    trend: '+8%',
    negative: true,
    trendColor: 'text-red-600'
  },
  {
    label: '本月毛利',
    value: '¥29,000',
    trend: '+15%',
    positive: true,
    highlight: true,
    trendColor: 'text-indigo-100'
  },
  {
    label: '单客平均毛利',
    value: '¥245',
    trend: '+3%',
    positive: true,
    trendColor: 'text-green-600'
  }
])
</script>
