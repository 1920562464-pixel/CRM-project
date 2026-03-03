<template>
  <div class="min-h-screen bg-slate-50">
    <!-- 顶部导航 -->
    <div class="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="goBack" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft :size="20" class="text-slate-600" />
          </button>
          <div>
            <h1 class="text-xl font-bold text-slate-900">{{ editingId ? '编辑报销申请' : '新建报销申请' }}</h1>
            <p class="text-sm text-slate-500">填写报销明细并上传发票</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button
            @click="saveDraft"
            class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 font-medium"
          >
            存草稿
          </button>
          <button
            @click="submitReimbursement"
            :disabled="!isFormValid || isSubmitting"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Loader2 v-if="isSubmitting" :size="16" class="animate-spin" />
            {{ isSubmitting ? '提交中...' : '提交审批' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <div class="max-w-4xl mx-auto px-6 py-8">
      <!-- 基本信息 -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div class="px-6 py-4 border-b border-slate-200">
          <h2 class="text-base font-semibold text-slate-900 flex items-center gap-2">
            <FileText :size="18" class="text-blue-600" />
            基本信息
          </h2>
        </div>
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">报销类型 *</label>
              <select
                v-model="formData.type"
                class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">请选择</option>
                <option value="purchase">采购报销</option>
                <option value="transport">交通费</option>
                <option value="meal">餐费</option>
                <option value="training">培训费</option>
                <option value="other">其他</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">申请日期 *</label>
              <input
                v-model="formData.date"
                type="date"
                class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">报销主题 *</label>
            <input
              v-model="formData.title"
              type="text"
              placeholder="请简要描述此次报销用途"
              class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">备注说明</label>
            <textarea
              v-model="formData.remark"
              placeholder="如有特殊情况请在此说明（选填）"
              rows="3"
              class="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>

      <!-- 报销明细 -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div class="px-6 py-4 border-b border-slate-200">
          <h2 class="text-base font-semibold text-slate-900 flex items-center gap-2">
            <List :size="18" class="text-blue-600" />
            报销明细
            <span v-if="formData.items.length > 0" class="text-sm font-normal text-slate-500">({{ formData.items.length }}项)</span>
          </h2>
        </div>

        <!-- 空状态 -->
        <div v-if="formData.items.length === 0" class="p-12 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
            <List :size="32" class="text-slate-300" />
          </div>
          <p class="text-slate-500 mb-4">暂无报销明细</p>
          <button
            @click="addItem"
            type="button"
            class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 mx-auto transition-colors"
          >
            <Plus :size="16" />
            添加第一项明细
          </button>
        </div>

        <!-- 明细列表 -->
        <div v-else class="divide-y divide-slate-100">
          <div
            v-for="(item, index) in formData.items"
            :key="item.id"
            class="p-6"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <span class="flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">{{ index + 1 }}</span>
                <span class="text-sm font-semibold text-slate-900">明细 #{{ index + 1 }}</span>
              </div>
              <button
                @click="removeItem(index)"
                type="button"
                class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="删除"
              >
                <Trash2 :size="16" />
              </button>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">费用类型 *</label>
                <select
                  v-model="item.category"
                  class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">请选择</option>
                  <option value="交通费">交通费</option>
                  <option value="住宿费">住宿费</option>
                  <option value="餐费">餐费</option>
                  <option value="办公用品">办公用品</option>
                  <option value="采购费">采购费</option>
                  <option value="服务费">服务费</option>
                  <option value="其他">其他</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">金额 *</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">¥</span>
                  <input
                    v-model.number="item.amount"
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    class="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div class="mt-4">
              <label class="block text-sm font-medium text-slate-700 mb-2">费用说明 *</label>
              <input
                v-model="item.description"
                type="text"
                placeholder="简要说明此项费用用途"
                class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <!-- 添加明细按钮 -->
          <div class="p-4 bg-slate-50 border-t border-slate-200">
            <button
              @click="addItem"
              type="button"
              class="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus :size="18" />
              添加明细项
            </button>
          </div>
        </div>
      </div>

      <!-- 发票/凭证上传 -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 class="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Image :size="18" class="text-blue-600" />
            发票/凭证
            <span class="text-sm font-normal text-slate-500">({{ formData?.attachments?.length || 0 }}/20)</span>
          </h2>
          <span class="text-xs text-slate-400">支持 JPG、PNG、PDF，单个文件不超过 10MB</span>
        </div>

        <div class="p-6">
          <!-- 已上传文件网格 -->
          <div v-if="formData?.attachments?.length > 0" class="grid grid-cols-5 gap-3 mb-4">
            <div
              v-for="(file, index) in formData.attachments"
              :key="index"
              class="relative group aspect-square bg-slate-100 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-400 transition-colors"
              @click="openPreview(file)"
            >
              <!-- 图片预览 -->
              <img
                v-if="isImage(file)"
                :src="file.preview"
                class="w-full h-full object-cover"
              />
              <!-- PDF图标 -->
              <div v-else class="flex flex-col items-center justify-center w-full h-full bg-red-50">
                <FileText :size="32" class="text-red-500 mb-1" />
                <span class="text-xs text-slate-600 px-2 truncate w-full text-center">{{ file.name }}</span>
              </div>
              <!-- 悬停遮罩 -->
              <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  @click.stop="removeAttachment(index)"
                  type="button"
                  class="p-2 bg-white rounded-full hover:bg-slate-200"
                  title="删除"
                >
                  <Trash2 :size="16" class="text-red-600" />
                </button>
                <button
                  v-if="isImage(file)"
                  @click.stop="openPreview(file)"
                  type="button"
                  class="p-2 bg-white rounded-full hover:bg-slate-200"
                  title="预览"
                >
                  <Eye :size="16" class="text-slate-700" />
                </button>
              </div>
            </div>
          </div>

          <!-- 上传区域 -->
          <label
            class="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors"
            :class="(formData?.attachments?.length || 0) >= 20 ? 'border-slate-200 bg-slate-50 cursor-not-allowed' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'"
          >
            <input
              type="file"
              :multiple="(formData?.attachments?.length || 0) < 20"
              accept="image/*,.pdf"
              @change="handleFileUpload"
              :disabled="(formData?.attachments?.length || 0) >= 20"
              class="hidden"
            />
            <div class="flex flex-col items-center">
              <Upload
                :size="40"
                :class="formData.attachments.length >= 20 ? 'text-slate-400' : 'text-blue-500'"
                class="mb-3"
              />
              <p class="text-sm font-medium" :class="(formData?.attachments?.length || 0) >= 20 ? 'text-slate-400' : 'text-slate-700'">
                {{ (formData?.attachments?.length || 0) >= 20 ? '已达到最大上传数量' : '点击上传或拖拽文件到此处' }}
              </p>
              <p class="text-xs text-slate-400 mt-1">
                {{ (formData?.attachments?.length || 0) >= 20 ? '' : `还可上传 ${20 - (formData?.attachments?.length || 0)} 个文件` }}
              </p>
            </div>
          </label>
        </div>
      </div>

      <!-- 金额统计 -->
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-blue-100 text-sm">报销总额</p>
            <p class="text-blue-100 text-xs mt-1 opacity-80">共 {{ formData.items.length }} 项明细</p>
          </div>
          <div class="text-right">
            <p class="text-4xl font-bold">¥{{ totalAmount.toFixed(2) }}</p>
            <p class="text-blue-100 text-xs mt-1 opacity-80">人民币</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 图片预览模态框 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="previewingFile" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" @click="closePreview">
          <button @click="closePreview" class="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
            <X :size="24" />
          </button>
          <img
            v-if="isImage(previewingFile)"
            :src="previewingFile.preview"
            class="max-w-full max-h-full object-contain"
            @click.stop
          />
          <div v-else class="text-white text-center" @click.stop>
            <FileText :size="64" class="mx-auto mb-4" />
            <p class="text-lg">{{ previewingFile.name }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from '../composables/useToast'
import {
  ArrowLeft,
  FileText,
  List,
  Plus,
  Trash2,
  Upload,
  X,
  Loader2,
  Image,
  Eye
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const toast = useToast()

interface ReimbursementItem {
  id: string
  category: string
  amount: number
  description: string
}

interface AttachmentFile {
  name: string
  size: number
  type: string
  url: string
  preview?: string
  file?: File
}

const editingId = ref<string | null>(null)
const isSubmitting = ref(false)
const previewingFile = ref<AttachmentFile | null>(null)

const formData = ref({
  type: '',
  date: new Date().toISOString().split('T')[0],
  title: '',
  remark: '',
  items: [] as ReimbursementItem[],
  attachments: [] as AttachmentFile[]
})

// 计算总金额
const totalAmount = computed(() => {
  return formData.value.items.reduce((sum, item) => sum + (item.amount || 0), 0)
})

// 表单验证
const isFormValid = computed(() => {
  const hasBasicInfo = formData.value.type && formData.value.date && formData.value.title
  const hasValidItems = formData.value.items.length > 0 &&
    formData.value.items.every(item => item.category && item.amount > 0 && item.description)
  const hasAttachments = formData.value.attachments.length > 0

  return hasBasicInfo && hasValidItems && hasAttachments
})

// 判断是否为图片
const isImage = (file: AttachmentFile) => {
  return file.type.startsWith('image/')
}

// 添加明细项
const addItem = () => {
  formData.value.items.push({
    id: Date.now().toString(),
    category: '',
    amount: 0,
    description: ''
  })

  // 滚动到新添加的项
  setTimeout(() => {
    const items = document.querySelectorAll('[class*="divide-y"] > div')
    const lastItem = items[items.length - 2]
    lastItem?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 100)
}

// 删除明细项
const removeItem = (index: number) => {
  formData.value.items.splice(index, 1)
}

// 处理文件上传
const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files || [])

  if (!files.length) return

  // 检查剩余可上传数量
  const remainingSlots = 20 - formData.value.attachments.length
  const filesToUpload = files.slice(0, remainingSlots)

  if (files.length > remainingSlots) {
    toast.info('超出限制', `最多只能上传 20 个文件，已自动选择前 ${remainingSlots} 个`)
  }

  filesToUpload.forEach(file => {
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error('文件格式错误', `${file.name} 不是支持的格式`)
      return
    }

    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      toast.error('文件过大', `${file.name} 超过10MB限制`)
      return
    }

    // 创建预览URL
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined

    formData.value.attachments.push({
      name: file.name,
      size: file.size,
      type: file.type,
      url: preview || '',
      preview,
      file
    })
  })

  // 清空input以允许再次选择相同文件
  input.value = ''

  if (filesToUpload.length > 0) {
    toast.success('上传成功', `已添加 ${filesToUpload.length} 个文件`)
  }
}

// 删除附件
const removeAttachment = (index: number) => {
  const file = formData.value.attachments[index]

  if (file.preview) {
    URL.revokeObjectURL(file.preview)
  }

  formData.value.attachments.splice(index, 1)
}

// 打开预览
const openPreview = (file: AttachmentFile) => {
  previewingFile.value = file
}

// 关闭预览
const closePreview = () => {
  previewingFile.value = null
}

// 保存草稿
const saveDraft = () => {
  if (formData.value.items.length === 0) {
    toast.error('无法保存', '请至少添加一项报销明细')
    return
  }

  // TODO: 保存草稿到后端
  toast.success('草稿已保存', '可稍后继续编辑')
  goBack()
}

// 提交报销
const submitReimbursement = async () => {
  if (!isFormValid.value) {
    toast.error('信息不完整', '请完善所有必填项并上传发票')
    return
  }

  isSubmitting.value = true

  try {
    // TODO: 提交到后端
    await new Promise(resolve => setTimeout(resolve, 1500))

    toast.success('提交成功', '报销申请已提交，请等待审批')
    goBack()
  } catch (error) {
    toast.error('提交失败', '请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.push('/coach-reimbursement')
}

// 初始化（编辑模式）
onMounted(() => {
  const id = route.query.id as string
  if (id) {
    editingId.value = id
    // TODO: 加载报销数据
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
