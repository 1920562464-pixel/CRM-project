<template>
  <Teleport to="body">
    <div v-if="modelValue" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="flex justify-between items-center p-5 border-b border-slate-100">
          <h3 class="font-bold text-lg text-slate-800">添加餐食记录</h3>
          <button @click="close" class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
            <X :size="20" />
          </button>
        </div>

        <div class="p-6 space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-2">餐食照片 <span class="text-red-500">*</span></label>
            <input type="file" ref="fileInputRef" class="hidden" accept="image/*" @change="handleFileUpload" />
            <div
              @click="fileInputRef?.click()"
              :class="['w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors', form.img ? 'border-transparent' : 'border-slate-300 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300']"
            >
              <img v-if="form.img" :src="form.img" alt="Preview" class="w-full h-full object-cover" />
              <template v-else>
                <div class="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-400 mb-2">
                  <ImageIcon :size="20" />
                </div>
                <span class="text-sm text-slate-500 font-medium">点击上传照片</span>
              </template>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">餐食类型 <span class="text-red-500">*</span></label>
              <div class="flex gap-2">
                <button
                  v-for="type in mealTypes"
                  :key="type"
                  @click="selectMealType(type)"
                  :class="[
                    'flex-1 py-2.5 text-sm font-medium rounded-xl transition-all',
                    form.mealType === type
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  ]"
                >
                  {{ type }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">餐食时间 <span class="text-red-500">*</span></label>
              <input
                type="time"
                v-model="form.mealTime"
                class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p class="text-[10px] text-slate-400 mt-1">选择用餐时间，可自动填充或手动修改</p>
            </div>
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">内容描述 <span class="text-red-500">*</span></label>
              <textarea
                v-model="form.desc"
                placeholder="例：无糖酸奶一杯，每日坚果一包..."
                class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-20"
              ></textarea>
            </div>
          </div>
        </div>

        <div class="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button @click="close" class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
            取消
          </button>
          <button @click="save" class="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-colors">
            保存记录
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { X, Image as ImageIcon } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  showToast: (msg: string) => void
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [meal: any]
}>()

const mealTypes = ['早餐', '午餐', '晚餐', '加餐']

const fileInputRef = ref<HTMLInputElement>()
const form = reactive({
  img: null as string | null,
  mealType: '加餐',
  mealTime: '',
  desc: ''
})

const close = () => {
  emit('update:modelValue', false)
}

const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    form.img = URL.createObjectURL(target.files[0])
  }
}

const selectMealType = (type: string) => {
  form.mealType = type
  if (!form.mealTime) {
    const defaultTimes: Record<string, string> = {
      '早餐': '07:30', '午餐': '12:00', '晚餐': '18:00', '加餐': '15:30'
    }
    form.mealTime = defaultTimes[type] || ''
  }
}

const save = () => {
  if (!form.img || !form.desc || !form.mealTime) {
    props.showToast('请上传照片、填写描述和选择时间哦')
    return
  }
  emit('save', {
    id: Date.now(),
    time: form.mealType,
    mealTime: form.mealTime,
    cal: 0,
    desc: form.desc,
    img: form.img,
    macros: { carbs: 0, protein: 0, fat: 0, fiber: 0 },
    lastCalculatedDate: null
  })
  Object.assign(form, { img: null, mealType: '加餐', mealTime: '', desc: '' })
  close()
}
</script>
