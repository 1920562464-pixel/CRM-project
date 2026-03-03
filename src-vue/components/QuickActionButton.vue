<template>
  <button
    @click="handleClick"
    :class="`w-full px-4 py-3 ${colorClasses[color]} rounded-lg text-sm font-medium text-left transition-all flex items-center justify-between group ${
      isClicked ? 'scale-95' : 'scale-100'
    }`"
  >
    <div class="flex items-center gap-2">
      <component :is="icon" />
      <span>{{ label }}</span>
    </div>
    <ArrowRight :size="16" class="opacity-0 group-hover:opacity-100 transition-opacity" />
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'

interface Props {
  icon: any
  label: string
  color: 'indigo' | 'emerald' | 'orange' | 'purple'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

const colorClasses = {
  indigo: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700',
  emerald: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700',
  orange: 'bg-orange-50 hover:bg-orange-100 text-orange-700',
  purple: 'bg-purple-50 hover:bg-purple-100 text-purple-700'
}

const isClicked = ref(false)

const handleClick = () => {
  isClicked.value = true
  emit('click')
  setTimeout(() => {
    isClicked.value = false
  }, 300)
}
</script>
