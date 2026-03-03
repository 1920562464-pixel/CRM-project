<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="$emit('cancel')"
      >
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" @click.stop>
          <div class="flex items-start gap-4">
            <div :class="`p-3 rounded-full ${iconBgClass}`">
              <component :is="icon" :size="24" :class="iconClass" />
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-slate-900 mb-2">{{ title }}</h3>
              <p class="text-sm text-slate-600">{{ message }}</p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 mt-6">
            <button
              @click="$emit('cancel')"
              class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {{ cancelText }}
            </button>
            <button
              @click="$emit('confirm')"
              :class="`px-4 py-2 rounded-lg text-sm font-medium text-white ${confirmButtonClass}`"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, AlertCircle, CheckCircle, Info } from 'lucide-vue-next'

interface Props {
  show: boolean
  title: string
  message: string
  type?: 'warning' | 'danger' | 'info' | 'success'
  confirmText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'warning',
  confirmText: '确认',
  cancelText: '取消'
})

defineEmits<{
  confirm: []
  cancel: []
}>()

const icon = computed(() => {
  const icons = {
    warning: AlertTriangle,
    danger: AlertCircle,
    info: Info,
    success: CheckCircle
  }
  return icons[props.type]
})

const iconBgClass = computed(() => {
  const classes = {
    warning: 'bg-amber-100',
    danger: 'bg-red-100',
    info: 'bg-blue-100',
    success: 'bg-green-100'
  }
  return classes[props.type]
})

const iconClass = computed(() => {
  const classes = {
    warning: 'text-amber-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
    success: 'text-green-600'
  }
  return classes[props.type]
})

const confirmButtonClass = computed(() => {
  const classes = {
    warning: 'bg-amber-600 hover:bg-amber-700',
    danger: 'bg-red-600 hover:bg-red-700',
    info: 'bg-blue-600 hover:bg-blue-700',
    success: 'bg-green-600 hover:bg-green-700'
  }
  return classes[props.type]
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active div,
.modal-leave-active div {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from div,
.modal-leave-to div {
  transform: scale(0.95);
  opacity: 0;
}
</style>
