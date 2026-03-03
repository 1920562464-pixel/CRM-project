<template>
  <div
    :class="`bg-white border rounded-lg p-3 hover:shadow-sm transition-all ${
      isSelected ? 'ring-2 ring-indigo-600' : 'border-slate-200'
    }`"
  >
    <div class="flex items-center gap-3">
      <input
        type="checkbox"
        :checked="isSelected"
        @change="$emit('select')"
        class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      <component :is="getFileIcon(file.type)" :size="24" :class="getFileIconColor(file.type)" />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <h4 class="font-medium text-sm truncate">{{ file.name }}</h4>
          <Lock v-if="file.isLocked" :size="12" class="text-slate-400" />
          <Users v-if="file.isShared" :size="12" class="text-blue-500" />
          <Star v-if="file.isStarred" :size="12" class="text-yellow-500 fill-yellow-500" />
        </div>
        <div class="flex items-center gap-4 mt-1 text-xs text-slate-500">
          <span>{{ file.size }}</span>
          <span class="flex items-center gap-1">
            <Eye :size="12" />
            {{ file.views }}
          </span>
          <span>{{ file.updatedAt }}</span>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <button
          @click="$emit('toggleStar')"
          class="p-1.5 hover:bg-slate-100 rounded"
          title="收藏"
        >
          <Star :size="14" :class="file.isStarred ? 'text-yellow-500 fill-yellow-500' : 'text-slate-500'" />
        </button>
        <button
          @click="$emit('share')"
          class="p-1.5 hover:bg-slate-100 rounded"
          title="分享"
        >
          <Share2 :size="14" class="text-slate-500" />
        </button>
        <button
          class="p-1.5 hover:bg-slate-100 rounded"
          title="下载"
        >
          <Download :size="14" class="text-slate-500" />
        </button>
        <button
          @click="$emit('delete')"
          class="p-1.5 hover:bg-slate-100 rounded"
          title="删除"
        >
          <Trash2 :size="14" class="text-red-600" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  FileText, Video, Image as ImageIcon, File, Star, Share2, Download,
  Trash2, Eye, Lock, Users
} from 'lucide-vue-next'

type FileType = 'pdf' | 'doc' | 'video' | 'image' | 'text' | 'other'

interface KnowledgeFile {
  id: string
  name: string
  type: FileType
  size?: string
  views: number
  downloads: number
  updatedAt: string
  isLocked: boolean
  isShared: boolean
  isStarred: boolean
}

defineProps<{
  file: KnowledgeFile
  isSelected: boolean
}>()

defineEmits<{
  select: []
  toggleStar: []
  share: []
  delete: []
}>()

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
