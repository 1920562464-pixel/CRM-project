<template>
  <div
    :class="`group bg-white border rounded-lg p-3 hover:shadow-md transition-all ${
      isSelected ? 'ring-2 ring-indigo-600' : 'border-slate-200'
    } ${file.isLocked ? 'opacity-60' : ''}`"
  >
    <div class="flex flex-col h-full">
      <!-- 复选框和更多菜单 -->
      <div class="flex justify-between items-start mb-2">
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
              <Star :size="12" :class="file.isStarred ? 'fill-yellow-500 text-yellow-500' : ''" />
              {{ file.isStarred ? '取消收藏' : '收藏' }}
            </button>
            <button
              @click="$emit('share'); showMenu = false"
              class="w-full px-2 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2"
            >
              <Share2 :size="12" />
              分享
            </button>
            <button
              @click="$emit('duplicate'); showMenu = false"
              class="w-full px-2 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2"
            >
              <Copy :size="12" />
              复制
            </button>
            <button
              @click="$emit('move', file.folderId); showMenu = false"
              class="w-full px-2 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2"
            >
              <Move :size="12" />
              移动
            </button>
            <div class="border-t border-slate-200 my-1"></div>
            <button
              @click="$emit('toggleLock'); showMenu = false"
              class="w-full px-2 py-1.5 text-left hover:bg-slate-100 flex items-center gap-2"
            >
              <Lock v-if="!file.isLocked" :size="12" />
              <Unlock v-else :size="12" />
              {{ file.isLocked ? '解锁' : '锁定' }}
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

      <!-- 文件图标 -->
      <div
        class="flex-shrink-0 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors self-center mb-2"
        @dblclick="$emit('share')"
      >
        <component :is="getFileIcon(file.type)" :size="28" :class="getFileIconColor(file.type)" />
      </div>

      <!-- 文件名 -->
      <h4 class="font-medium text-xs line-clamp-2 text-center mb-2 flex-1" :title="file.name">{{ file.name }}</h4>

      <!-- 状态图标 -->
      <div class="flex items-center justify-center gap-1.5 mb-1.5">
        <Lock v-if="file.isLocked" :size="10" class="text-slate-400" />
        <Users v-if="file.isShared" :size="10" class="text-blue-500" />
        <Star v-if="file.isStarred" :size="10" class="text-yellow-500 fill-yellow-500" />
      </div>

      <!-- 统计信息 -->
      <div class="flex items-center justify-center gap-2 text-[10px] text-slate-500 mb-1.5">
        <span class="flex items-center gap-0.5">
          <Eye :size="10" />
          {{ file.views }}
        </span>
        <span class="flex items-center gap-0.5">
          <Download :size="10" />
          {{ file.downloads }}
        </span>
        <span>{{ file.size }}</span>
      </div>

      <!-- 标签 -->
      <div class="flex flex-wrap gap-0.5 justify-center">
        <span
          v-for="tag in file.tags.slice(0, 2)"
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
import { ref } from 'vue'
import {
  FileText, Video, Image as ImageIcon, File, Star, Share2, Copy, Move,
  Lock, Unlock, Trash2, MoreVertical, Download, Eye, Users
} from 'lucide-vue-next'

type FileType = 'pdf' | 'doc' | 'video' | 'image' | 'text' | 'other'

interface KnowledgeFile {
  id: string
  name: string
  type: FileType
  folderId: string | null
  size?: string
  views: number
  downloads: number
  tags: string[]
  isStarred: boolean
  isShared: boolean
  isLocked: boolean
}

const props = defineProps<{
  file: KnowledgeFile
  isSelected: boolean
}>()

defineEmits<{
  select: []
  toggleStar: []
  share: []
  delete: []
  move: [folderId: string | null]
  duplicate: []
  toggleLock: []
}>()

const showMenu = ref(false)

const getFileIcon = (type: FileType) => {
  switch (type) {
    case 'pdf': return FileText
    case 'doc': return FileText
    case 'video': return Video
    case 'image': return ImageIcon
    default: return File
  }
}

const getFileIconColor = (type: FileType) => {
  switch (type) {
    case 'pdf': return 'text-red-500'
    case 'doc': return 'text-blue-500'
    case 'video': return 'text-purple-500'
    case 'image': return 'text-green-500'
    default: return 'text-slate-500'
  }
}
</script>
