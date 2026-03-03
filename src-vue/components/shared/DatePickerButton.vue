<template>
  <div class="relative inline-block" style="overflow: visible;">
    <!-- Calendar Button -->
    <button
      @click="toggleCalendar"
      :class="`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
        isOpen
          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          : 'text-slate-500 hover:bg-slate-50'
      }`"
    >
      <Calendar :size="16" />
      <span class="font-medium">{{ formattedDate }}</span>
      <ChevronDown
        :size="14"
        :class="{ 'rotate-180': isOpen }"
        class="transition-transform"
      />
    </button>

    <!-- Retroactive Mode Badge -->
    <span v-if="isRetroactive" class="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full"></span>

    <!-- Dropdown Calendar -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 scale-95 translate-y-[-10px]"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-[-10px]"
    >
      <div
        v-if="isOpen"
        class="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-xl"
        style="z-index: 9999;"
      >
        <!-- Calendar Header -->
        <div class="p-4 border-b border-slate-100">
          <div class="flex items-center justify-between">
            <h3 class="font-bold text-slate-800 text-sm">选择日期</h3>
            <button
              @click="toggleCalendar"
              class="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X :size="16" class="text-slate-400" />
            </button>
          </div>
          <div v-if="isRetroactive" class="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
            <div class="flex items-center gap-2 text-xs">
              <Clock :size="12" class="text-amber-600 flex-shrink-0" />
              <span class="font-semibold text-amber-700">补打卡模式</span>
              <span class="text-amber-600 ml-auto">{{ selectedDateKey }}</span>
            </div>
          </div>
          <div v-else-if="!isToday" class="mt-2 p-2 bg-indigo-50 rounded-lg border border-indigo-200">
            <div class="flex items-center gap-2 text-xs">
              <Calendar :size="12" class="text-indigo-600 flex-shrink-0" />
              <span class="font-semibold text-indigo-700">历史数据</span>
              <span class="text-indigo-600 ml-auto">{{ selectedDateKey }}</span>
            </div>
          </div>
        </div>

        <!-- Calendar -->
        <div class="p-4">
          <!-- Month Navigation -->
          <div class="flex items-center justify-between mb-4">
            <button @click="prevMonth" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <ChevronLeft :size="18" />
            </button>
            <div class="text-center">
              <h3 class="font-bold text-slate-800 text-sm">{{ currentYear }}年{{ currentMonth + 1 }}月</h3>
            </div>
            <button @click="nextMonth" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
              <ChevronRight :size="18" />
            </button>
          </div>

          <!-- Weekday Headers -->
          <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="day in weekdays" :key="day" class="text-center text-xs font-medium text-slate-400 py-1">
              {{ day }}
            </div>
          </div>

          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-1">
            <!-- Empty cells -->
            <div v-for="i in firstDayOfWeek" :key="'empty-' + i" class="aspect-square"></div>

            <!-- Days -->
            <button
              v-for="day in daysInMonth"
              :key="day"
              @click="selectDate(day)"
              :class="`aspect-square rounded-lg text-xs font-medium transition-all relative ${
                isSelected(day)
                  ? 'bg-indigo-600 text-white shadow-md'
                  : isTodayDate(day)
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                  : isPastDay(day) && !isRecentPast(day)
                  ? 'text-slate-300 cursor-not-allowed'
                  : isPastDay(day) && isRecentPast(day)
                  ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer'
                  : isFutureDay(day)
                  ? 'text-slate-400 hover:bg-slate-50 cursor-pointer'
                  : 'text-slate-600 hover:bg-slate-50 cursor-pointer'
              }`"
              :disabled="isPastDay(day) && !isRecentPast(day)"
            >
              {{ day }}
              <span
                v-if="getDateData(day)?.hasData"
                :class="`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${
                  isSelected(day) ? 'bg-white' : 'bg-indigo-400'
                }`"
              ></span>
            </button>
          </div>

          <!-- Quick Actions -->
          <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <button @click="goToToday" class="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              回到今天
            </button>
            <div class="flex items-center gap-2 text-xs text-slate-500">
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
                有数据
              </span>
              <span class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-amber-200"></span>
                可补卡
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="showFooter" class="p-3 bg-slate-50 rounded-b-xl border-t border-slate-100">
          <div class="flex items-center justify-between text-xs">
            <span class="text-slate-500">点击日期查看或补录数据</span>
            <span class="text-indigo-600 font-medium" @click="handleApply" v-if="showApplyButton">应用</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Clock
} from 'lucide-vue-next'

interface DateData {
  date: string
  hasData: boolean
  completed: boolean
}

const props = defineProps<{
  modelValue?: Date
  dateData?: { [key: string]: DateData }
  showFooter?: boolean
  showApplyButton?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [date: Date]
  'date-select': [date: Date, isRetroactive: boolean]
  'apply': []
}>()

const isOpen = ref(false)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const selectedDate = ref(props.modelValue || new Date())
const today = new Date()

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// Watch for modelValue changes from parent
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    selectedDate.value = newVal
    currentYear.value = newVal.getFullYear()
    currentMonth.value = newVal.getMonth()
  }
})

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOfWeek = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

const formattedDate = computed(() => {
  const date = selectedDate.value
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
})

const selectedDateKey = computed(() => {
  const date = selectedDate.value
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  return `${year}年${month}月${day}日 ${weekday}`
})

const isToday = computed(() => {
  return (
    selectedDate.value.getDate() === today.getDate() &&
    selectedDate.value.getMonth() === today.getMonth() &&
    selectedDate.value.getFullYear() === today.getFullYear()
  )
})

const isRetroactive = computed(() => {
  const date = selectedDate.value
  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(today.getDate() - 3)
  return date >= threeDaysAgo && date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
})

const isSelected = (day: number) => {
  return (
    day === selectedDate.value.getDate() &&
    currentMonth.value === selectedDate.value.getMonth() &&
    currentYear.value === selectedDate.value.getFullYear()
  )
}

const isTodayDate = (day: number) => {
  return (
    day === today.getDate() &&
    currentMonth.value === today.getMonth() &&
    currentYear.value === today.getFullYear()
  )
}

const isPastDay = (day: number) => {
  const date = new Date(currentYear.value, currentMonth.value, day)
  return date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

const isRecentPast = (day: number) => {
  const date = new Date(currentYear.value, currentMonth.value, day)
  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(today.getDate() - 3)
  return date >= threeDaysAgo && date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

const isFutureDay = (day: number) => {
  const date = new Date(currentYear.value, currentMonth.value, day)
  return date > new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

const getDateData = (day: number) => {
  const dateKey = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return props.dateData?.[dateKey]
}

const toggleCalendar = () => {
  isOpen.value = !isOpen.value
}

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const selectDate = (day: number) => {
  const newDate = new Date(currentYear.value, currentMonth.value, day)
  selectedDate.value = newDate
  emit('update:modelValue', newDate)
  emit('date-select', newDate, isRecentPast(day))
  isOpen.value = false
}

const goToToday = () => {
  const now = new Date()
  currentYear.value = now.getFullYear()
  currentMonth.value = now.getMonth()
  selectedDate.value = now
  emit('update:modelValue', now)
  emit('date-select', now, false)
  isOpen.value = false
}

const handleApply = () => {
  emit('apply')
  isOpen.value = false
}

// Close on click outside
const handleClickOutside = (e: MouseEvent) => {
  if (isOpen.value && !(e.target as HTMLElement).closest('.relative')) {
    isOpen.value = false
  }
}

if (typeof window !== 'undefined') {
  document.addEventListener('click', handleClickOutside)
}
</script>
