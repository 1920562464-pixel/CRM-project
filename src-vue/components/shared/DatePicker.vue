<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
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
      <!-- Empty cells for days before month starts -->
      <div
        v-for="i in firstDayOfWeek"
        :key="'empty-' + i"
        class="aspect-square"
      ></div>

      <!-- Days -->
      <button
        v-for="day in daysInMonth"
        :key="day"
        @click="selectDate(day)"
        :class="`aspect-square rounded-lg text-xs font-medium transition-all relative ${
          isSelected(day)
            ? 'bg-indigo-600 text-white shadow-md'
            : isToday(day)
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

    <!-- Legend for Retroactive -->
    <div v-if="showRetroactiveLegend" class="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
      <div class="flex items-start gap-2">
        <Clock :size="14" class="text-amber-600 mt-0.5 flex-shrink-0" />
        <div class="text-xs text-amber-700">
          <span class="font-semibold">补打卡提示：</span>
          三日内的历史记录可补打卡，会显示为补打卡状态。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-vue-next'

interface DateData {
  date: string
  hasData: boolean
  completed: boolean
}

const props = defineProps<{
  modelValue?: Date
  dateData?: { [key: string]: DateData }
  showRetroactiveLegend?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [date: Date]
  'date-select': [date: Date, isRetroactive: boolean]
}>()

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const selectedDate = ref(props.modelValue || new Date())
const today = new Date()

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// Get days in current month
const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

// Get first day of week (0 = Sunday)
const firstDayOfWeek = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

// Check if a date is today
const isToday = (day: number) => {
  return (
    day === today.getDate() &&
    currentMonth.value === today.getMonth() &&
    currentYear.value === today.getFullYear()
  )
}

// Check if selected
const isSelected = (day: number) => {
  return (
    day === selectedDate.value.getDate() &&
    currentMonth.value === selectedDate.value.getMonth() &&
    currentYear.value === selectedDate.value.getFullYear()
  )
}

// Check if past day
const isPastDay = (day: number) => {
  const date = new Date(currentYear.value, currentMonth.value, day)
  return date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

// Check if within 3 days (for retroactive entry)
const isRecentPast = (day: number) => {
  const date = new Date(currentYear.value, currentMonth.value, day)
  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(today.getDate() - 3)
  return date >= threeDaysAgo && date < new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

// Check if future day
const isFutureDay = (day: number) => {
  const date = new Date(currentYear.value, currentMonth.value, day)
  return date > new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

// Get date data
const getDateData = (day: number) => {
  const dateKey = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return props.dateData?.[dateKey]
}

// Navigate months
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

// Select date
const selectDate = (day: number) => {
  const newDate = new Date(currentYear.value, currentMonth.value, day)
  selectedDate.value = newDate
  emit('update:modelValue', newDate)
  emit('date-select', newDate, isRecentPast(day))
}

// Go to today
const goToToday = () => {
  const now = new Date()
  currentYear.value = now.getFullYear()
  currentMonth.value = now.getMonth()
  selectedDate.value = now
  emit('update:modelValue', now)
  emit('date-select', now, false)
}
</script>
