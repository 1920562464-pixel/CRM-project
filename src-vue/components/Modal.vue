<template>
  <Teleport to="body">
    <div>
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        @click="$emit('close')"
      ></div>

      <!-- Modal Content -->
      <div
        :class="`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${width || 'w-[480px]'} bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-200`"
      >
        <!-- Header -->
        <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 class="text-lg font-bold text-slate-800">{{ title }}</h3>
          <button
            @click="$emit('close')"
            class="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X :size="24" />
          </button>
        </div>

        <!-- Content -->
        <slot></slot>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface ModalProps {
  title: string
  width?: string
}

withDefaults(defineProps<ModalProps>(), {
  width: 'w-[480px]'
})

defineEmits<{
  close: []
}>()
</script>

<style scoped>
@keyframes zoom-in-95 {
  from {
    opacity: 0;
    transform: scale(0.95) translate(-50%, -50%);
  }
  to {
    opacity: 1;
    transform: scale(1) translate(-50%, -50%);
  }
}

.animate-in.zoom-in-95 {
  animation: zoom-in-95 0.2s ease-out;
}
</style>
