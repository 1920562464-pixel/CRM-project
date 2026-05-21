<template>
  <button
    @click="$emit('click')"
    :class="`w-full p-3 rounded-lg text-left transition-colors group ${
      active ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50 border border-transparent'
    }`"
  >
    <div class="flex items-start gap-3">
      <div :class="`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 ${
        active ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white group-hover:border-indigo-300'
      }`">
        <svg v-if="active" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" :stroke-width="3" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <p :class="`text-sm truncate ${
          active ? 'text-slate-800 font-medium' : 'text-slate-600'
        }`">{{ title }}</p>
        <p v-if="time" class="text-xs text-slate-400 mt-0.5">{{ time }}</p>
      </div>
      <button
        class="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
        title="删除"
      >
        <X :size="14" class="text-slate-400" />
      </button>
    </div>
  </button>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  title: string
  time?: string
  active?: boolean
}>()

defineEmits<{
  click: []
}>()
</script>
