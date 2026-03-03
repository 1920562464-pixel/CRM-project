<template>
  <div
    @click="$emit('click')"
    :class="`bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${
      isActive ? 'ring-2 ring-indigo-500' : ''
    }`"
  >
    <div v-if="isActive" class="absolute inset-0 bg-indigo-50/50 animate-pulse"></div>
    <div class="relative">
      <div class="flex justify-between items-start mb-4">
        <div :class="`p-3 rounded-xl ${bg}`">
          <component :is="icon" />
        </div>
        <span v-if="trend" :class="`text-xs font-bold px-2 py-1 rounded-full ${
          trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`">
          {{ trend }}
        </span>
      </div>
      <div>
        <div class="text-slate-500 text-sm font-medium">{{ label }}</div>
        <div class="text-2xl font-bold text-slate-800 mt-1">{{ value }}</div>
        <div v-if="subLabel" class="text-xs text-slate-400 mt-1">{{ subLabel }}</div>
      </div>
      <div v-if="isActive" class="absolute top-0 right-0 w-3 h-3 bg-indigo-500 rounded-full animate-ping"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value: string
  trend?: string
  trendUp?: boolean
  subLabel?: string
  icon: any
  bg: string
  isActive: boolean
}

defineProps<Props>()

defineEmits<{
  click: []
}>()
</script>
