<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md ${
          toast.type === 'success' ? 'bg-green-600 text-white' :
          toast.type === 'error' ? 'bg-red-600 text-white' :
          toast.type === 'warning' ? 'bg-amber-500 text-white' :
          'bg-slate-800 text-white'
        }`"
      >
        <component :is="getIcon(toast.type)" :size="20" />
        <div class="flex-1">
          <p v-if="toast.title" class="font-semibold text-sm">{{ toast.title }}</p>
          <p class="text-sm">{{ toast.message }}</p>
        </div>
        <button
          @click="removeToast(toast.id)"
          class="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X :size="16" />
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-vue-next'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

const toasts = ref<Toast[]>([])

function getIcon(type: string) {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }
  return icons[type as keyof typeof icons] || Info
}

function addToast(toast: Omit<Toast, 'id'>) {
  const id = Date.now().toString() + Math.random()
  toasts.value.push({ ...toast, id })

  const duration = toast.duration || 3000
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }

  return id
}

function removeToast(id: string) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

function success(message: string, title?: string) {
  addToast({ type: 'success', message, title })
}

function error(message: string, title?: string) {
  addToast({ type: 'error', message, title })
}

function warning(message: string, title?: string) {
  addToast({ type: 'warning', message, title })
}

function info(message: string, title?: string) {
  addToast({ type: 'info', message, title })
}

defineExpose({
  success,
  error,
  warning,
  info,
  removeToast
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
