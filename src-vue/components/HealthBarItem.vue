<template>
  <div
    @click="$emit('click')"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
    class="cursor-pointer group"
  >
    <div class="flex justify-between items-center mb-2">
      <span class="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">{{ label }}</span>
      <span :class="`text-xs font-bold ${statusColor}`">{{ status }}</span>
    </div>
    <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
      <div
        :class="`h-full ${barColor} rounded-full transition-all duration-300 ${
          isHovered ? 'opacity-80' : 'opacity-100'
        }`"
        :style="{ width: value }"
      ></div>
      <div v-if="isHovered" class="absolute inset-0 flex items-center justify-center">
        <span class="text-[10px] font-bold text-slate-600 bg-white/80 px-2 rounded-full">
          {{ value }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  label: string
  value: string
  status: string
  statusColor: string
  barColor: string
}

defineProps<Props>()

defineEmits<{
  click: []
}>()

const isHovered = ref(false)
</script>
