<template>
  <div
    :class="`group bg-white border rounded-lg p-4 hover:shadow-md transition-all ${
      isSelected ? 'ring-2 ring-indigo-600' : 'border-slate-200'
    } ${link.isLocked ? 'opacity-60' : ''}`"
  >
    <div class="flex flex-col h-full">
      <!-- 复选框和更多菜单 -->
      <div class="flex justify-between items-start mb-3">
        <input
          type="checkbox"
          :checked="isSelected"
          @change="$emit('select')"
          class="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <div class="relative">
          <button
            @click="showMenu = !showMenu"
            class="p-1 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100"
          >
            <MoreVertical :size="12" class="text-slate-500" />
          </button>
          <div
            v-if="showMenu"
            class="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10 text-xs"
          >
            <button
              @click="$emit('toggleStar'); showMenu = false"
              class="w-full px-2 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2"
            >
              <Star :size="12" :class="link.isStarred ? 'fill-yellow-500 text-yellow-500' : ''" />
              {{ link.isStarred ? '取消收藏' : '收藏' }}
            </button>
            <button
              @click="handleVisit"
              class="w-full px-2 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2"
            >
              <ExternalLink :size="12" />
              访问链接
            </button>
            <button
              @click="handleCopy"
              class="w-full px-2 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2"
            >
              <Copy :size="12" />
              复制链接
            </button>
            <button
              @click="$emit('move', link.folderId); showMenu = false"
              class="w-full px-2 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2"
            >
              <Move :size="12" />
              移动
            </button>
            <div class="border-t border-slate-200 my-1"></div>
            <button
              @click="$emit('edit'); showMenu = false"
              class="w-full px-2 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2"
            >
              <Edit :size="12" />
              编辑
            </button>
            <button
              @click="$emit('delete'); showMenu = false"
              class="w-full px-2 py-1.5 text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
              <Trash2 :size="12" />
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- 链接图标和favicon -->
      <div class="flex items-start gap-3 mb-3">
        <div class="flex-shrink-0 w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden">
          <img
            v-if="link.favicon"
            :src="link.favicon"
            class="w-6 h-6"
            @error="link.favicon = undefined"
          />
          <component
            v-else
            :is="getLinkIcon(link.type)"
            :size="24"
            :class="getLinkIconColor(link.type)"
          />
        </div>

        <!-- 链接信息 -->
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-sm text-slate-900 truncate mb-1" :title="link.name">
            {{ link.name }}
          </h4>
          <a
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs text-indigo-600 hover:text-indigo-800 truncate block flex items-center gap-1"
            @click.stop="handleVisit"
          >
            <span class="truncate">{{ displayUrl }}</span>
            <ExternalLink :size="10" class="flex-shrink-0" />
          </a>
        </div>
      </div>

      <!-- 描述 -->
      <p v-if="link.description" class="text-xs text-slate-600 line-clamp-2 mb-3 flex-1">
        {{ link.description }}
      </p>

      <!-- 状态图标 -->
      <div class="flex items-center justify-center gap-1.5 mb-2">
        <Lock v-if="link.isLocked" :size="10" class="text-slate-400" />
        <Users v-if="link.isShared" :size="10" class="text-blue-500" />
        <Star v-if="link.isStarred" :size="10" class="text-yellow-500 fill-yellow-500" />
        <span v-if="link.type" class="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">
          {{ getLinkTypeLabel(link.type) }}
        </span>
      </div>

      <!-- 统计信息 -->
      <div class="flex items-center justify-center gap-2 text-[10px] text-slate-500 mb-2">
        <span class="flex items-center gap-0.5">
          <Eye :size="10" />
          {{ link.views }}
        </span>
        <span>{{ formatDate(link.updatedAt) }}</span>
      </div>

      <!-- 标签 -->
      <div class="flex flex-wrap gap-0.5 justify-center">
        <span
          v-for="tag in link.tags.slice(0, 2)"
          :key="tag"
          class="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Globe, FileText, Video, Image as ImageIcon, Link2, Star, ExternalLink,
  Copy, Move, Edit, Trash2, MoreVertical, Eye, Lock, Users
} from 'lucide-vue-next'
import type { KnowledgeLink, LinkType } from '../../types/knowledge'

const props = defineProps<{
  link: KnowledgeLink
  isSelected: boolean
}>()

const emit = defineEmits<{
  select: []
  toggleStar: []
  delete: []
  move: [folderId: string | null]
  edit: []
}>()

const showMenu = ref(false)

// 显示的URL（缩短显示）
const displayUrl = computed(() => {
  try {
    const url = new URL(props.link.url)
    return url.hostname + (url.pathname.length > 1 ? url.pathname : '')
  } catch {
    return props.link.url.length > 30
      ? props.link.url.substring(0, 30) + '...'
      : props.link.url
  }
})

// 获取链接图标
const getLinkIcon = (type: LinkType) => {
  switch (type) {
    case 'website': return Globe
    case 'document': return FileText
    case 'video': return Video
    case 'image': return ImageIcon
    default: return Link2
  }
}

// 获取链接图标颜色
const getLinkIconColor = (type: LinkType) => {
  switch (type) {
    case 'website': return 'text-blue-500'
    case 'document': return 'text-indigo-500'
    case 'video': return 'text-purple-500'
    case 'image': return 'text-green-500'
    default: return 'text-slate-500'
  }
}

// 获取链接类型标签
const getLinkTypeLabel = (type: LinkType) => {
  const labels = {
    website: '网页',
    document: '文档',
    video: '视频',
    image: '图片',
    other: '其他'
  }
  return labels[type] || '链接'
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

// 访问链接
const handleVisit = () => {
  window.open(props.link.url, '_blank', 'noopener,noreferrer')
  emit('select') // 触发访问统计
}

// 复制链接
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.link.url)
    // 可以添加toast提示
    console.log('链接已复制')
  } catch (err) {
    console.error('复制失败:', err)
  }
  showMenu.value = false
}
</script>
