<template>
  <div
    @click="handleClick"
    class="relative overflow-hidden bg-white rounded-2xl p-5 transition-all duration-200 cursor-pointer group"
    :class="[clickAction ? 'hover:shadow-md' : '']"
    :style="{
      border: '1px solid',
      borderColor: isHovered ? hoverBorderColor : '#e5e7eb',
    }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- 左上角装饰色条 -->
    <div
      class="absolute top-0 left-0 w-full h-[3px] rounded-t-2xl transition-opacity duration-200"
      :style="{ background: accentColor, opacity: isHovered ? 1 : 0.5 }"
    />

    <div class="flex items-start justify-between mb-3">
      <div
        class="p-2.5 rounded-xl"
        :style="{ background: iconBg } "
      >
        <component :is="icon" :size="20" :style="{ color: accentColor }" />
      </div>
      <div
        v-if="trend && trend !== 'stable'"
        class="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
        :class="trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'"
      >
        <TrendingUp v-if="trend === 'up'" :size="12" />
        <TrendingDown v-else-if="trend === 'down'" :size="12" />
        <Minus v-else :size="12" />
        {{ trendValue }}
      </div>
    </div>
    <div class="mb-1">
      <p class="text-[13px] font-medium text-slate-500 mb-1.5 tracking-tight">{{ title }}</p>
      <p class="text-[28px] font-bold text-slate-900 tracking-tight leading-none group-hover:tracking-tighter transition-all origin-left">
        {{ value }}<span v-if="unit" class="text-sm font-medium text-slate-400 ml-1">{{ unit }}</span>
      </p>
    </div>
    <p v-if="subtitle" class="text-[11px] text-slate-400 mt-1.5 tracking-tight">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next'

interface Props {
  title: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  subtitle?: string
  icon: any
  textColor?: string
  bgColor: string
  clickAction?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  trend: 'stable',
  trendValue: '',
  subtitle: '',
  textColor: 'text-slate-600',
  clickAction: null
})

const isHovered = ref(false)

// 根据 textColor 映射强调色和图标背景
const colorMap: Record<string, { accent: string, bg: string }> = {
  'text-indigo-600': { accent: '#6366f1', bg: '#eef2ff' },
  'text-green-600': { accent: '#16a34a', bg: '#f0fdf4' },
  'text-orange-600': { accent: '#ea580c', bg: '#fff7ed' },
  'text-emerald-600': { accent: '#10b981', bg: '#ecfdf5' },
  'text-purple-600': { accent: '#9333ea', bg: '#faf5ff' },
  'text-red-600': { accent: '#dc2626', bg: '#fef2f2' },
  'text-blue-600': { accent: '#2563eb', bg: '#eff6ff' },
  'text-amber-600': { accent: '#d97706', bg: '#fffbeb' },
  'text-cyan-600': { accent: '#0891b2', bg: '#ecfeff' },
  'text-pink-600': { accent: '#db2777', bg: '#fdf2f8' },
  'text-teal-600': { accent: '#0d9488', bg: '#f0fdfa' },
  'text-slate-600': { accent: '#475569', bg: '#f8fafc' },
}

const resolved = computed(() => colorMap[props.textColor] || colorMap['text-slate-600'])
const accentColor = computed(() => resolved.value.accent)
const iconBg = computed(() => resolved.value.bg)
const hoverBorderColor = computed(() => resolved.value.accent)

const emit = defineEmits<{
  click: [action: string]
}>()

const handleClick = () => {
  if (props.clickAction) {
    emit('click', props.clickAction)
  }
}
</script>
