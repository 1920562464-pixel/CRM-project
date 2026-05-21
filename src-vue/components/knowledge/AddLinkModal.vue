<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- 遮罩层 -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="$emit('close')"
      ></div>

      <!-- 对话框 -->
      <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <!-- 头部 -->
        <div class="px-6 py-4 border-b border-slate-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Link2 :size="20" class="text-indigo-600" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-slate-900">添加链接</h3>
                <p class="text-xs text-slate-500">保存外部链接到知识库</p>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X :size="18" class="text-slate-600" />
            </button>
          </div>
        </div>

        <!-- 表单内容 -->
        <div class="p-6 space-y-4">
          <!-- 链接名称 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              链接名称 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.name"
              type="text"
              placeholder="输入链接名称"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              :class="{ 'border-red-300': errors.name }"
            />
            <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name }}</p>
          </div>

          <!-- URL -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              链接地址 <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <Globe :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="formData.url"
                type="url"
                placeholder="https://example.com"
                class="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono"
                :class="{ 'border-red-300': errors.url }"
                @blur="fetchLinkPreview"
              />
            </div>
            <p v-if="errors.url" class="text-xs text-red-500 mt-1">{{ errors.url }}</p>
          </div>

          <!-- 链接类型 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">链接类型</label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="type in linkTypes"
                :key="type.value"
                @click="formData.type = type.value"
                :class="`p-3 rounded-lg border text-center transition-all ${
                  formData.type === type.value
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'border-slate-200 hover:bg-slate-50'
                }`"
              >
                <component :is="type.icon" :size="20" class="mx-auto mb-1" />
                <span class="text-xs">{{ type.label }}</span>
              </button>
            </div>
          </div>

          <!-- 描述 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">描述（可选）</label>
            <textarea
              v-model="formData.description"
              rows="2"
              placeholder="添加链接描述..."
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
            ></textarea>
          </div>

          <!-- 标签 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">标签（可选）</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span
                v-for="(tag, index) in formData.tags"
                :key="index"
                class="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs"
              >
                {{ tag }}
                <button @click="removeTag(index)" class="hover:bg-indigo-100 rounded-full p-0.5">
                  <X :size="12" />
                </button>
              </span>
            </div>
            <div class="flex gap-2">
              <input
                v-model="newTag"
                type="text"
                placeholder="输入标签"
                class="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                @keydown.enter.prevent="addTag"
              />
              <button
                @click="addTag"
                class="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
              >
                添加
              </button>
            </div>
          </div>

          <!-- 所属文件夹 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">所属文件夹</label>
            <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
              <Folder :size="16" class="text-slate-500" />
              <span class="text-sm text-slate-700">{{ folderName }}</span>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="px-6 py-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50">
          <button
            @click="$emit('close')"
            class="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 text-sm font-medium transition-colors"
          >
            取消
          </button>
          <button
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Loader2 v-if="isSubmitting" :size="16" class="animate-spin" />
            {{ isSubmitting ? '添加中...' : '添加链接' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  Link2, X, Globe, Folder, FileText, Video, Image as ImageIcon, Link2Icon, Loader2
} from 'lucide-vue-next'
import { knowledgeApi } from '../../api/knowledge'
import type { LinkType } from '../../types/knowledge'

const props = defineProps<{
  show: boolean
  folderId: string | null
  folderName: string
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

// 链接类型选项
const linkTypes = [
  { value: 'website' as LinkType, label: '网页', icon: Globe },
  { value: 'document' as LinkType, label: '文档', icon: FileText },
  { value: 'video' as LinkType, label: '视频', icon: Video },
  { value: 'image' as LinkType, label: '图片', icon: ImageIcon },
]

// 表单数据
const formData = ref({
  name: '',
  url: '',
  type: 'website' as LinkType,
  description: '',
  tags: [] as string[]
})

const newTag = ref('')
const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

// 重置表单
const resetForm = () => {
  formData.value = {
    name: '',
    url: '',
    type: 'website',
    description: '',
    tags: []
  }
  newTag.value = ''
  errors.value = {}
}

// 监听显示状态，打开时重置表单
watch(() => props.show, (newShow) => {
  if (newShow) {
    resetForm()
  }
})

// 添加标签
const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
    newTag.value = ''
  }
}

// 删除标签
const removeTag = (index: number) => {
  formData.value.tags.splice(index, 1)
}

// 获取链接预览（自动填充名称）
const fetchLinkPreview = async () => {
  const url = formData.value.url.trim()
  if (!url || formData.value.name) return

  try {
    // 这里可以调用API获取网页标题
    // 暂时从URL提取域名作为名称
    try {
      const urlObj = new URL(url)
      if (!formData.value.name) {
        formData.value.name = urlObj.hostname
      }
    } catch {
      // URL格式无效，不做处理
    }
  } catch (err) {
    console.error('获取链接预览失败:', err)
  }
}

// 验证表单
const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.name.trim()) {
    errors.value.name = '请输入链接名称'
  }

  if (!formData.value.url.trim()) {
    errors.value.url = '请输入链接地址'
  } else {
    try {
      new URL(formData.value.url)
    } catch {
      errors.value.url = '请输入有效的URL地址'
    }
  }

  return Object.keys(errors.value).length === 0
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    await knowledgeApi.createLink({
      name: formData.value.name.trim(),
      url: formData.value.url.trim(),
      type: formData.value.type,
      folderId: props.folderId,
      description: formData.value.description.trim() || undefined,
      tags: formData.value.tags
    })

    emit('success')
    emit('close')
  } catch (err: any) {
    console.error('添加链接失败:', err)
    errors.value.url = err.message || '添加链接失败，请重试'
  } finally {
    isSubmitting.value = false
  }
}
</script>
