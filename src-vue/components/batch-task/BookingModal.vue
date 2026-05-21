<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <!-- 弹窗头部 -->
        <div class="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
              <CalendarCheck :size="20" class="text-white" />
            </div>
            <div>
              <h3 class="font-bold text-lg text-slate-800">预约服务</h3>
              <p class="text-xs text-slate-500">为 {{ clientName }} 预约服务</p>
            </div>
          </div>
          <button @click="close" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <X :size="20" />
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="p-5 space-y-4">
          <!-- 服务类型 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">服务类型</label>
            <select v-model="form.serviceType" class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
              <option value="">请选择服务类型</option>
              <option value="health-check">健康体检</option>
              <option value="consultation">专家咨询</option>
              <option value="follow-up">随访服务</option>
              <option value="rehabilitation">康复训练</option>
            </select>
          </div>

          <!-- 选择医生 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">选择医生</label>
            <select v-model="form.doctorId" class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
              <option value="">请选择医生</option>
              <option v-for="doctor in availableDoctors" :key="doctor.id" :value="doctor.id">
                {{ doctor.name }} - {{ doctor.specialty }} | 可预约: {{ doctor.availableSlots }}
              </option>
            </select>
          </div>

          <!-- 预约日期 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">预约日期</label>
            <input
              v-model="form.preferredDate"
              type="date"
              class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>

          <!-- 预约时间 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">预约时间</label>
            <select v-model="form.preferredTime" class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
              <option value="">请选择时间段</option>
              <option value="09:00-10:00">09:00 - 10:00</option>
              <option value="10:00-11:00">10:00 - 11:00</option>
              <option value="14:00-15:00">14:00 - 15:00</option>
              <option value="15:00-16:00">15:00 - 16:00</option>
              <option value="16:00-17:00">16:00 - 17:00</option>
            </select>
          </div>

          <!-- 备注 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">备注信息</label>
            <textarea
              v-model="form.notes"
              rows="3"
              placeholder="请输入特殊需求或备注信息..."
              class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            ></textarea>
          </div>
        </div>

        <!-- 弹窗底部 -->
        <div class="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            @click="close"
            class="flex-1 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            @click="submit"
            class="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl transition-all shadow-sm"
          >
            确认预约
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CalendarCheck, X } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  clientName: string
  showToast: (message: string) => void
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const form = ref({
  serviceType: '',
  doctorId: '',
  preferredDate: '',
  preferredTime: '',
  notes: ''
})

const availableDoctors = ref([
  { id: 'doc001', name: '张医生', specialty: '心内科', availableSlots: 5 },
  { id: 'doc002', name: '李医生', specialty: '内分泌科', availableSlots: 3 },
  { id: 'doc003', name: '王医生', specialty: '神经内科', availableSlots: 4 },
  { id: 'doc004', name: '赵医生', specialty: '康复科', availableSlots: 6 },
  { id: 'doc005', name: '刘医生', specialty: '全科', availableSlots: 8 }
])

const close = () => {
  emit('update:modelValue', false)
}

const submit = () => {
  if (!form.value.serviceType || !form.value.doctorId || !form.value.preferredDate || !form.value.preferredTime) {
    props.showToast('请填写完整的预约信息')
    return
  }

  const doctor = availableDoctors.value.find(d => d.id === form.value.doctorId)
  props.showToast(`预约成功！已预约 ${doctor?.name} - ${form.value.preferredDate} ${form.value.preferredTime}`)
  close()
}
</script>
