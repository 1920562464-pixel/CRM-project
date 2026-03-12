<template>
  <div v-if="showModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b border-slate-100 bg-slate-50/50">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Activity :size="24" class="text-indigo-600" />
              预约上线服务
            </h3>
            <p class="text-sm text-slate-500 mt-1">填写预约信息并上传证明材料</p>
          </div>
          <button
            @click="closeModal"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X :size="20" />
          </button>
        </div>
      </div>

      <!-- Form -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4">
        <!-- 服务类型选择 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">服务类型 <span class="text-red-500">*</span></label>
          <select
            v-model="form.serviceType"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">请选择服务类型</option>
            <option value="consultation">在线问诊</option>
            <option value="prescription">处方审核</option>
            <option value="follow-up">随访指导</option>
            <option value="emergency">紧急咨询</option>
          </select>
        </div>

        <!-- 预约日期时间 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">预约日期 <span class="text-red-500">*</span></label>
            <input
              v-model="form.date"
              type="date"
              :min="minDate"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">预约时间 <span class="text-red-500">*</span></label>
            <select
              v-model="form.time"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">请选择时间</option>
              <option value="09:00">09:00</option>
              <option value="09:30">09:30</option>
              <option value="10:00">10:00</option>
              <option value="10:30">10:30</option>
              <option value="11:00">11:00</option>
              <option value="11:30">11:30</option>
              <option value="14:00">14:00</option>
              <option value="14:30">14:30</option>
              <option value="15:00">15:00</option>
              <option value="15:30">15:30</option>
              <option value="16:00">16:00</option>
              <option value="16:30">16:30</option>
              <option value="17:00">17:00</option>
            </select>
          </div>
        </div>

        <!-- 选择医生 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">选择医生 <span class="text-red-500">*</span></label>
          <select
            v-model="form.doctorId"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">请选择医生</option>
            <option
              v-for="doctor in availableDoctors"
              :key="doctor.id"
              :value="doctor.id"
            >
              {{ doctor.name }} - {{ doctor.specialty }}
            </option>
          </select>
          <p v-if="form.doctorId" class="text-xs text-slate-500 mt-1">
            当前医生在线状态：<span :class="getDoctorStatus(getDoctorById(form.doctorId))?.isOnline ? 'text-green-600' : 'text-slate-400'">
              {{ getDoctorById(form.doctorId)?.isOnline ? '在线' : '离线' }}
            </span>
          </p>
        </div>

        <!-- 服务时长 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">预计服务时长</label>
          <div class="flex items-center gap-3">
            <input
              v-model.number="form.duration"
              type="range"
              min="15"
              max="120"
              step="15"
              class="flex-1"
            />
            <span class="text-sm font-medium text-slate-700 w-12 text-center">{{ form.duration }}分钟</span>
          </div>
        </div>

        <!-- 客户信息 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">客户姓名</label>
          <input
            v-model="form.clientName"
            type="text"
            placeholder="请输入客户姓名"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <!-- 问题描述 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">问题描述</label>
          <textarea
            v-model="form.description"
            rows="3"
            placeholder="请简要描述客户问题或需求"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          ></textarea>
        </div>

        <!-- 证明材料上传 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">证明材料 <span class="text-red-500">*</span></label>
          <p class="text-xs text-slate-500 mb-2">请上传与本次服务相关的截图或文件（如聊天记录、客户同意截图等）</p>

          <!-- 文件上传区域 -->
          <div
            class="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors"
            :class="isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'"
            @click="triggerFileInput"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop="handleDrop"
          >
            <input
              ref="fileInputRef"
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              class="hidden"
              @change="handleFileSelect"
            />
            <Upload :size="32" class="mx-auto mb-2" :class="isDragging ? 'text-indigo-600' : 'text-slate-400'" />
            <p class="text-sm text-slate-600">{{ isDragging ? '释放以上传文件' : '点击或拖拽文件到此处' }}</p>
            <p class="text-xs text-slate-400">支持图片、PDF、Word文档，最大10MB</p>
          </div>

          <!-- 已上传文件列表 -->
          <div v-if="form.files.length > 0" class="mt-3 space-y-2">
            <div
              v-for="(file, index) in form.files"
              :key="index"
              class="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <div class="flex-shrink-0 w-8 h-8 rounded bg-indigo-100 flex items-center justify-center">
                  <FileText :size="14" class="text-indigo-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-700 truncate">{{ file.name }}</p>
                  <p class="text-xs text-slate-400">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>
              <button
                @click="removeFile(index)"
                class="flex-shrink-0 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <X :size="16" />
              </button>
            </div>
          </div>
        </div>

        <!-- 备注 -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">备注</label>
          <textarea
            v-model="form.notes"
            rows="2"
            placeholder="其他需要说明的信息（选填）"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          ></textarea>
        </div>

        <!-- 费用说明 -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div class="flex items-center gap-2 text-sm">
            <Info :size="16" class="text-blue-600" />
            <span class="font-medium text-blue-800">费用说明</span>
          </div>
          <p class="text-xs text-blue-700 mt-1">上线服务费用：<span class="font-bold">200元/次</span>，服务完成后将从财务中心自动计费。</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
        <button
          @click="closeModal"
          class="flex-1 px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors"
        >
          取消
        </button>
        <button
          @click="submitAppointment"
          :disabled="!isFormValid || isSubmitting"
          class="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Loader2 v-if="isSubmitting" :size="16" class="animate-spin" />
          {{ isSubmitting ? '提交中...' : '提交预约' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Activity, X, Upload, FileText, Info, Loader2 } from 'lucide-vue-next'

interface Doctor {
  id: string
  name: string
  specialty: string
  isOnline: boolean
}

interface AppointmentForm {
  serviceType: string
  date: string
  time: string
  doctorId: string
  duration: number
  clientName: string
  description: string
  notes: string
  files: File[]
}

const props = defineProps<{
  showModal: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [appointment: any]
}>()

const form = ref<AppointmentForm>({
  serviceType: '',
  date: '',
  time: '',
  doctorId: '',
  duration: 30,
  clientName: '',
  description: '',
  notes: '',
  files: []
})

const isDragging = ref(false)
const isSubmitting = ref(false)
const fileInputRef = ref<HTMLInputElement>()

// 可用医生列表（模拟数据）
const availableDoctors = ref<Doctor[]>([
  { id: 'doc1', name: '李医生', specialty: '全科医学', isOnline: true },
  { id: 'doc2', name: '王医生', specialty: '内分泌', isOnline: false },
  { id: 'doc3', name: '张医生', specialty: '心血管', isOnline: true },
  { id: 'doc4', name: '刘医生', specialty: '营养学', isOnline: true }
])

// 最小日期为今天
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

// 表单验证
const isFormValid = computed(() => {
  return form.value.serviceType &&
         form.value.date &&
         form.value.time &&
         form.value.doctorId &&
         form.value.clientName &&
         form.value.files.length > 0
})

// 获取医生信息
const getDoctorById = (id: string) => {
  return availableDoctors.value.find(d => d.id === id)
}

// 获取医生状态样式
const getDoctorStatus = (doctor: Doctor) => {
  return {
    'bg-green-100': doctor.isOnline,
    'bg-red-100': !doctor.isOnline
  }
}

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    addFiles(Array.from(files))
  }
}

// 处理拖拽
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files) {
    addFiles(Array.from(files))
  }
}

// 添加文件
const addFiles = (newFiles: File[]) => {
  newFiles.forEach(file => {
    // 验证文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert(`文件 ${file.name} 超过10MB限制`)
      return
    }
    form.value.files.push(file)
  })
}

// 移除文件
const removeFile = (index: number) => {
  form.value.files.splice(index, 1)
}

// 格式化文件大小
const fileSizeFormat = (bytes: number) => {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

// 关闭模态框
const closeModal = () => {
  emit('close')
  // 重置表单
  form.value = {
    serviceType: '',
    date: '',
    time: '',
    doctorId: '',
    duration: 30,
    clientName: '',
    description: '',
    notes: '',
    files: []
  }
}

// 提交预约
const submitAppointment = () => {
  if (!isFormValid.value) return

  isSubmitting.value = true

  // 模拟提交延迟
  setTimeout(() => {
    const appointment = {
      id: Date.now().toString(),
      ...form.value,
      status: 'pending',
      createdAt: new Date().toISOString(),
      createdBy: currentRole.value === 'coach' ? '教练' : '顾问'
    }

    emit('submit', appointment)

    isSubmitting.value = false
    closeModal()

    // 显示成功提示
    alert('预约提交成功！等待医生确认。')
  }, 1000)
}

// 模拟当前角色（实际应该从父组件传入）
const currentRole = ref<'coach' | 'doctor'>('coach')
</script>
