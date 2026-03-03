<template>
  <div
    :class="`flex items-start gap-4 p-4 rounded-xl border bg-white hover:shadow-sm transition-all group cursor-pointer border-l-4 ${
      priorityColors[priority] || 'border-l-slate-300'
    } ${completed ? 'opacity-60' : ''}`"
  >
    <div class="mt-1">
      <button
        @click="$emit('toggleComplete')"
        :class="`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          completed
            ? 'bg-green-500 border-green-500'
            : 'border-slate-300 group-hover:border-indigo-500'
        }`"
      >
        <Check v-if="completed" :size="12" class="text-white" />
      </button>
    </div>
    <div class="flex-1">
      <div class="flex justify-between items-start">
        <h4 :class="`font-bold group-hover:text-indigo-700 transition-colors ${
          completed ? 'text-slate-400 line-through' : 'text-slate-800'
        }`">
          {{ title }}
        </h4>
        <div class="relative">
          <button
            @click.stop="$emit('toggleMenu')"
            class="text-slate-300 hover:text-slate-500 p-1"
          >
            <MoreHorizontal :size="18" />
          </button>
          <div v-if="showMenu" class="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
            <button
              @click.stop="handleToggleComplete"
              class="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
            >
              <Check :size="14" />
              {{ completed ? '标记未完成' : '标记完成' }}
            </button>
            <button
              @click.stop="handleDelete"
              class="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <X :size="14" />
              删除
            </button>
          </div>
        </div>
      </div>
      <p :class="`text-sm mt-1 line-clamp-1 ${completed ? 'text-slate-400' : 'text-slate-500'}`">
        {{ desc }}
      </p>
      <div class="flex items-center gap-3 mt-3">
        <span class="flex items-center gap-1 text-xs text-slate-400">
          <Clock :size="12" /> {{ time }}
        </span>
        <span :class="`text-[10px] px-2 py-0.5 rounded font-medium ${tagColor}`">
          {{ tag }}
        </span>
        <span v-if="priority === 'high'" class="text-[10px] px-2 py-0.5 rounded font-medium bg-red-50 text-red-600">
          紧急
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Clock, MoreHorizontal, X } from 'lucide-vue-next'

interface Props {
  id: string
  title: string
  time: string
  tag: string
  tagColor: string
  desc: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  showMenu: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggleComplete: []
  delete: []
  toggleMenu: []
  closeMenu: []
}>()

const priorityColors = {
  high: 'border-l-red-500',
  medium: 'border-l-orange-500',
  low: 'border-l-green-500'
}

const handleToggleComplete = () => {
  emit('toggleComplete')
  emit('closeMenu')
}

const handleDelete = () => {
  emit('delete')
}
</script>
