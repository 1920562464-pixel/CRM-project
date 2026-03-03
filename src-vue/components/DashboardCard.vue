<template>
  <div
    @click="$emit('click')"
    class="bg-white rounded-xl border-2 border-slate-200 p-5 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group"
    :class="hoverBorderClass"
  >
    <div class="flex items-start justify-between mb-3">
      <div
        class="p-3 rounded-xl"
        :class="bgColor"
      >
        <component :is="icon" :size="24" :class="color" />
      </div>
      <div
        v-if="change"
        class="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
        :class="changeType === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
      >
        <TrendingUp v-if="changeType === 'up'" :size="14" />
        <TrendingDown v-else :size="14" />
        {{ change }}
      </div>
    </div>
    <div class="mb-1">
      <p class="text-sm text-slate-600 mb-1">{{ title }}</p>
      <p class="text-2xl font-bold text-slate-900 group-hover:scale-105 transition-transform origin-left">
        {{ value }}
      </p>
    </div>
    <p v-if="subtitle" class="text-xs text-slate-500">
      {{ subtitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'

interface Props {
  title: string
  value: string | number
  change?: string
  changeType?: 'up' | 'down'
  subtitle?: string
  icon: any
  color: string
  bgColor: string
}

const props = defineProps<Props>()

defineEmits<{
  click: []
}>()

const hoverBorderClass = computed(() => {
  const colorMap: Record<string, string> = {
    'text-indigo-600': 'hover:border-indigo-500',
    'text-green-600': 'hover:border-green-500',
    'text-orange-600': 'hover:border-orange-500',
    'text-emerald-600': 'hover:border-emerald-500',
    'text-purple-600': 'hover:border-purple-500',
    'text-red-600': 'hover:border-red-500',
    'text-blue-600': 'hover:border-blue-500',
    'text-amber-600': 'hover:border-amber-500',
    'text-cyan-600': 'hover:border-cyan-500',
    'text-pink-600': 'hover:border-pink-500',
    'text-teal-600': 'hover:border-teal-500',
    'text-slate-600': 'hover:border-slate-500'
  }
  return colorMap[props.color] || 'hover:border-slate-300'
})
</script>
