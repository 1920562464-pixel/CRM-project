<template>
  <div class="flex items-start gap-3">
    <div :class="`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`">
      <component :is="icon" />
    </div>
    <div>
      <div class="text-sm text-slate-800">
        <span class="font-bold">{{ user }}</span> {{ action }}
      </div>
      <div class="text-xs text-slate-400 mt-0.5">{{ time }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  user: string
  action: string
  time: string
  icon: any
  iconBg: string
}

defineProps<Props>()
</script>
