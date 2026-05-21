<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')"></div>

    <!-- 快捷键帮助卡片 -->
    <div class="relative bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden">
      <!-- 头部 -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <div class="flex items-center gap-3">
          <Keyboard class="text-indigo-600" :size="24" />
          <h3 class="text-lg font-semibold text-slate-900">键盘快捷键</h3>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X :size="18" class="text-slate-600" />
        </button>
      </div>

      <!-- 快捷键列表 -->
      <div class="p-6 overflow-y-auto max-h-[60vh]">
        <div class="space-y-4">
          <!-- 文件操作 -->
          <div>
            <h4 class="text-sm font-semibold text-slate-700 mb-2">文件操作</h4>
            <div class="space-y-2">
              <ShortcutItem
                key="新建文件夹"
                :shortcut="{ key: 'N', ctrl: true }"
              />
              <ShortcutItem
                key="上传文件"
                :shortcut="{ key: 'U', ctrl: true }"
              />
              <ShortcutItem
                key="删除选中"
                :shortcut="{ key: 'Delete' }"
              />
              <ShortcutItem
                key="全选"
                :shortcut="{ key: 'A', ctrl: true }"
              />
            </div>
          </div>

          <!-- 导航 -->
          <div>
            <h4 class="text-sm font-semibold text-slate-700 mb-2">导航</h4>
            <div class="space-y-2">
              <ShortcutItem
                key="搜索"
                :shortcut="{ key: 'F', ctrl: true }"
              />
              <ShortcutItem
                key="返回上级"
                :shortcut="{ key: 'Backspace', alt: true }"
              />
              <ShortcutItem
                key="刷新"
                :shortcut="{ key: 'R', ctrl: true }"
              />
            </div>
          </div>

          <!-- 视图 -->
          <div>
            <h4 class="text-sm font-semibold text-slate-700 mb-2">视图</h4>
            <div class="space-y-2">
              <ShortcutItem
                key="切换视图"
                :shortcut="{ key: 'V', ctrl: true }"
              />
            </div>
          </div>

          <!-- 通用 -->
          <div>
            <h4 class="text-sm font-semibold text-slate-700 mb-2">通用</h4>
            <div class="space-y-2">
              <ShortcutItem
                key="关闭对话框"
                :shortcut="{ key: 'Escape' }"
              />
              <ShortcutItem
                key="显示帮助"
                :shortcut="{ key: '?' }"
              />
            </div>
          </div>
        </div>

        <!-- 提示 -->
        <div class="mt-6 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p class="text-xs text-indigo-700">
            <strong>提示：</strong>在输入框中输入时，快捷键不会触发，只有 Esc 键可用于关闭对话框
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Keyboard, X } from 'lucide-vue-next'
import { h } from 'vue'

defineProps<{
  show: boolean
}>()

defineEmits<{
  close: []
}>()

// 快捷键项子组件
const ShortcutItem = (props: {
  key: string
  shortcut: { key: string; ctrl?: boolean; alt?: boolean; shift?: boolean }
}) => {
  return h('div', { class: 'flex items-center justify-between text-sm' }, [
    h('span', { class: 'text-slate-600' }, props.key),
    h('div', { class: 'flex items-center gap-1' }, [
      props.shortcut.ctrl ? h('kbd', { class: 'px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono' }, 'Ctrl') : null,
      props.shortcut.alt ? h('kbd', { class: 'px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono' }, 'Alt') : null,
      props.shortcut.shift ? h('kbd', { class: 'px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono' }, 'Shift') : null,
      h('kbd', { class: 'px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono' }, props.shortcut.key)
    ].filter(Boolean))
  ])
}
</script>

<style scoped>
kbd {
  display: inline-block;
  min-width: 24px;
  text-align: center;
  font-weight: 500;
}
</style>
