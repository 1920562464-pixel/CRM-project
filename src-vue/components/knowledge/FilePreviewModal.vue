<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- 遮罩层 -->
    <div
      class="absolute inset-0 bg-black/60 backdrop-blur-sm"
      @click="$emit('close')"
    ></div>

    <!-- 预览容器 -->
    <div class="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <!-- 头部 -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <component :is="getFileIcon(file.type)" :size="20" :class="getFileIconColor(file.type)" />
          <h3 class="font-semibold text-slate-800 truncate">{{ file.name }}</h3>
          <span class="text-xs text-slate-500">{{ file.size }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="canDownload"
            @click="handleDownload"
            class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="下载"
          >
            <Download :size="18" class="text-slate-600" />
          </button>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="关闭"
          >
            <X :size="18" class="text-slate-600" />
          </button>
        </div>
      </div>

      <!-- 内容区 -->
      <div class="flex-1 overflow-auto bg-slate-50 flex items-center justify-center p-4">
        <!-- 加载中 -->
        <div v-if="loading" class="flex flex-col items-center gap-3">
          <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-slate-600">加载中...</p>
        </div>

        <!-- 加载失败 -->
        <div v-else-if="error" class="flex flex-col items-center gap-3">
          <AlertCircle :size="48" class="text-red-500" />
          <p class="text-slate-600">{{ error }}</p>
          <button
            @click="loadPreview"
            class="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            重试
          </button>
        </div>

        <!-- PDF 预览 -->
        <iframe
          v-else-if="file.type === 'pdf' && previewUrl"
          :src="previewUrl"
          class="w-full h-full rounded-lg border-0"
          frameborder="0"
        ></iframe>

        <!-- 图片预览 -->
        <div v-else-if="file.type === 'image' && previewUrl" class="relative">
          <img
            :src="previewUrl"
            :alt="file.name"
            class="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
          />
        </div>

        <!-- 视频预览 -->
        <div v-else-if="file.type === 'video' && previewUrl" class="w-full max-w-4xl">
          <video
            :src="previewUrl"
            controls
            class="w-full rounded-lg shadow-lg"
            @loadstart="loading = false"
          >
            您的浏览器不支持视频播放
          </video>
        </div>

        <!-- 文本预览 -->
        <div
          v-else-if="file.type === 'text' && textContent"
          class="w-full max-w-4xl max-h-[70vh] overflow-auto bg-white rounded-lg shadow-lg p-6"
        >
          <pre class="whitespace-pre-wrap text-sm text-slate-700 font-mono">{{ textContent }}</pre>
        </div>

        <!-- 不支持预览 -->
        <div v-else class="flex flex-col items-center gap-3">
          <File :size="48" class="text-slate-400" />
          <p class="text-slate-600">此文件类型不支持预览</p>
          <button
            v-if="canDownload"
            @click="handleDownload"
            class="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
          >
            <Download :size="16" />
            下载文件
          </button>
        </div>
      </div>

      <!-- 底部工具栏 -->
      <div v-if="!loading && !error" class="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-white">
        <div class="flex items-center gap-4 text-xs text-slate-500">
          <span v-if="file.createdAt">
            创建时间：{{ formatDate(file.createdAt) }}
          </span>
          <span v-if="file.updatedAt">
            修改时间：{{ formatDate(file.updatedAt) }}
          </span>
          <span v-if="file.views">
            浏览次数：{{ file.views }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="file.type === 'image' && previewUrl"
            @click="handleRotate"
            class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="旋转"
          >
            <RotateCw :size="16" class="text-slate-600" />
          </button>
          <button
            v-if="file.type === 'image' && previewUrl"
            @click="handleZoomIn"
            class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="放大"
          >
            <ZoomIn :size="16" class="text-slate-600" />
          </button>
          <button
            v-if="file.type === 'image' && previewUrl"
            @click="handleZoomOut"
            class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            title="缩小"
          >
            <ZoomOut :size="16" class="text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  FileText, Video, Image as ImageIcon, File, Download, X,
  AlertCircle, RotateCw, ZoomIn, ZoomOut
} from 'lucide-vue-next'

type FileType = 'pdf' | 'doc' | 'video' | 'image' | 'text' | 'other'

interface KnowledgeFile {
  id: string
  name: string
  type: FileType
  url?: string
  size?: string
  views?: number
  downloads?: number
  createdAt?: string
  updatedAt?: string
  isLocked?: boolean
}

const props = defineProps<{
  show: boolean
  file: KnowledgeFile
}>()

const emit = defineEmits<{
  close: []
}>()

const loading = ref(true)
const error = ref<string | null>(null)
const previewUrl = ref<string | null>(null)
const textContent = ref<string | null>(null)
const rotation = ref(0)
const scale = ref(1)

// 是否允许下载（锁定文件不可下载）
const canDownload = computed(() => !props.file.isLocked)

// 加载预览
const loadPreview = async () => {
  loading.value = true
  error.value = null
  previewUrl.value = null
  textContent.value = null

  try {
    // 根据文件类型加载预览
    if (props.file.type === 'text') {
      // 文本文件需要读取内容
      if (props.file.url) {
        const response = await fetch(props.file.url)
        textContent.value = await response.text()
      }
    } else {
      // 其他类型直接使用 URL
      previewUrl.value = props.file.url || null
    }
  } catch (err: any) {
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
  }
}

// 监听文件变化
watch(() => props.file, () => {
  if (props.show) {
    loadPreview()
  }
}, { immediate: true })

// 监听显示状态
watch(() => props.show, (newShow) => {
  if (newShow) {
    loadPreview()
  } else {
    // 关闭时重置状态
    rotation.value = 0
    scale.value = 1
  }
})

// 下载文件
const handleDownload = () => {
  if (props.file.url) {
    const link = document.createElement('a')
    link.href = props.file.url
    link.download = props.file.name
    link.click()
  }
}

// 旋转图片
const handleRotate = () => {
  rotation.value = (rotation.value + 90) % 360
}

// 放大
const handleZoomIn = () => {
  scale.value = Math.min(scale.value + 0.25, 3)
}

// 缩小
const handleZoomOut = () => {
  scale.value = Math.max(scale.value - 0.25, 0.5)
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取文件图标
const getFileIcon = (type: FileType) => {
  switch (type) {
    case 'pdf': return FileText
    case 'doc': return FileText
    case 'video': return Video
    case 'image': return ImageIcon
    default: return File
  }
}

// 获取文件图标颜色
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

<style scoped>
/* 图片旋转和缩放 */
img {
  transition: transform 0.3s ease;
  transform: scale(v-bind(scale)) rotate(v-bind(rotation + 'deg'));
}
</style>
