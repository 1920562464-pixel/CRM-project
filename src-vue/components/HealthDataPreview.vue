<template>
  <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3">
      <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
        <Activity :size="16" class="text-indigo-600" />
        健康数据
      </h3>
      <div class="flex items-center gap-1">
        <span
          v-if="hasRecentData"
          class="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
          :class="getSyncStatusClass(lastDataTime)"
        >
          {{ getSyncStatusText() }}
        </span>
        <span
          v-else
          class="text-[9px] px-1.5 py-0.5 rounded-full font-medium bg-red-100 text-red-700"
        >
          无数据
        </span>
      </div>
    </div>

    <!-- No Data State -->
    <div
      v-if="!hasRecentData"
      class="text-center py-6"
    >
      <Activity :size="32" class="text-slate-300 mx-auto mb-2" />
      <p class="text-xs text-slate-500">暂无健康数据</p>
      <p class="text-[10px] text-slate-400 mt-1">超过3天未同步穿戴设备</p>
    </div>

    <!-- Health Metrics Grid -->
    <div v-else class="grid grid-cols-2 gap-2">
      <!-- Heart Rate -->
      <div class="p-2 rounded-lg" style="background-color: 'var(--fill-light)';">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-1">
            <Heart :size="12" class="text-rose-500" />
            <span class="text-[10px] text-slate-600">心率</span>
          </div>
          <span
            class="text-[9px] px-1 rounded"
            :class="healthData.heartRate > 100 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'"
          >
            {{ healthData.heartRate > 100 ? '偏高' : '正常' }}
          </span>
        </div>
        <p class="text-lg font-bold" :style="{ color: 'var(--text-primary)' }">
          {{ healthData.heartRate }}
          <span class="text-[10px] font-normal text-slate-400 ml-0.5">bpm</span>
        </p>
      </div>

      <!-- Blood Pressure -->
      <div class="p-2 rounded-lg" style="background-color: 'var(--fill-light)';">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-1">
            <Activity :size="12" class="text-blue-500" />
            <span class="text-[10px] text-slate-600">血压</span>
          </div>
        </div>
        <p class="text-base font-bold" :style="{ color: 'var(--text-primary)' }">
          {{ healthData.bloodPressure }}
        </p>
        <p class="text-[9px]" :class="getBPStatusClass()">
          {{ getBPStatusText() }}
        </p>
      </div>

      <!-- Blood Sugar -->
      <div
        class="p-2 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
        style="background-color: 'var(--fill-light)';"
        @click="router.push({ path: '/blood-glucose-detail', query: { from: 'health-preview', clientId: props.userId } })"
      >
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-1">
            <Droplets :size="12" class="text-amber-500" />
            <span class="text-[10px] text-slate-600">血糖</span>
          </div>
          <span
            class="text-[9px] px-1 rounded"
            :class="getSugarStatusClass()"
          >
            {{ getSugarStatusText() }}
          </span>
        </div>
        <p class="text-lg font-bold" :style="{ color: 'var(--text-primary)' }">
          {{ healthData.bloodSugar }}
          <span class="text-[10px] font-normal text-slate-400 ml-0.5">mmol/L</span>
        </p>
      </div>

      <!-- Sleep -->
      <div class="p-2 rounded-lg" style="background-color: 'var(--fill-light)';">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-1">
            <Moon :size="12" class="text-purple-500" />
            <span class="text-[10px] text-slate-600">睡眠</span>
          </div>
        </div>
        <p class="text-base font-bold" :style="{ color: 'var(--text-primary)' }">
          {{ healthData.sleep }}
          <span class="text-[10px] font-normal text-slate-400 ml-0.5">小时</span>
        </p>
        <p class="text-[9px]" :class="getSleepStatusClass()">
          {{ getSleepStatusText() }}
        </p>
      </div>

      <!-- Blood Oxygen -->
      <div class="p-2 rounded-lg" style="background-color: 'var(--fill-light)';">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-1">
            <Flame :size="12" class="text-orange-500" />
            <span class="text-[10px] text-slate-600">血氧</span>
          </div>
          <span
            class="text-[9px] px-1 rounded"
            :class="healthData.bloodOxygen >= 95 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'"
          >
            {{ healthData.bloodOxygen >= 95 ? '正常' : '偏低' }}
          </span>
        </div>
        <p class="text-lg font-bold" :style="{ color: 'var(--text-primary)' }">
          {{ healthData.bloodOxygen }}
          <span class="text-[10px] font-normal text-slate-400 ml-0.5">%</span>
        </p>
      </div>

      <!-- Weight -->
      <div class="p-2 rounded-lg" style="background-color: 'var(--fill-light)';">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-1">
            <Scale :size="12" class="text-teal-500" />
            <span class="text-[10px] text-slate-600">体重</span>
          </div>
        </div>
        <p class="text-lg font-bold" :style="{ color: 'var(--text-primary)' }">
          {{ healthData.weight }}
          <span class="text-[10px] font-normal text-slate-400 ml-0.5">kg</span>
        </p>
        <p class="text-[9px]" :class="getWeightStatusClass()">
          {{ getWeightStatusText() }}
        </p>
      </div>
    </div>

    <!-- Last Sync Time -->
    <div
      v-if="hasRecentData"
      class="mt-2 pt-2 border-t flex items-center justify-between text-[9px]"
      :style="{
        borderColor: 'var(--border-light)',
        color: 'var(--text-secondary)'
      }"
    >
      <span>最后同步：{{ formatTime(lastDataTime) }}</span>
      <span class="flex items-center gap-1">
        <Clock :size="10" />
        {{ getDaysAgo() }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Activity,
  Heart,
  Droplets,
  Moon,
  Flame,
  Scale,
  Clock
} from 'lucide-vue-next'

interface HealthData {
  heartRate: number
  bloodPressure: string
  bloodSugar: number
  sleep: number
  bloodOxygen: number
  weight: number
  lastSync: Date
}

const props = defineProps<{
  userId?: string
}>()

const router = useRouter()

// Mock health data (in real app, fetch from API based on userId)
const healthData = ref<HealthData>({
  heartRate: 78,
  bloodPressure: '125/82',
  bloodSugar: 6.2,
  sleep: 7.5,
  bloodOxygen: 98,
  weight: 68.5,
  lastSync: new Date()
})

// Simulate different data for different users
const mockUserData: Record<string, HealthData> = {
  '1': { heartRate: 78, bloodPressure: '125/82', bloodSugar: 6.2, sleep: 7.5, bloodOxygen: 98, weight: 68.5, lastSync: new Date() },
  '2': { heartRate: 72, bloodPressure: '118/75', bloodSugar: 5.8, sleep: 8.0, bloodOxygen: 99, weight: 62.3, lastSync: new Date(Date.now() - 86400000) },
  '3': { heartRate: 85, bloodPressure: '145/92', bloodSugar: 9.5, sleep: 6.0, bloodOxygen: 94, weight: 92.1, lastSync: new Date(Date.now() - 86400000 * 4) }, // 4 days ago - triggers warning
  '4': { heartRate: 75, bloodPressure: '112/70', bloodSugar: 5.5, sleep: 7.8, bloodOxygen: 97, weight: 58.3, lastSync: new Date() },
  '5': { heartRate: 80, bloodPressure: '130/85', bloodSugar: 7.0, sleep: 6.5, bloodOxygen: 96, weight: 75.0, lastSync: new Date(Date.now() - 86400000 * 6) }, // 6 days ago - triggers warning
  '6': { heartRate: 70, bloodPressure: '108/68', bloodSugar: 5.6, sleep: 8.2, bloodOxygen: 99, weight: 62.5, lastSync: new Date() },
  '7': { heartRate: 88, bloodPressure: '135/88', bloodSugar: 8.3, sleep: 5.5, bloodOxygen: 93, weight: 88.7, lastSync: new Date(Date.now() - 86400000 * 8) }, // 8 days ago - triggers warning
  '8': { heartRate: 74, bloodPressure: '115/72', bloodSugar: 6.0, sleep: 7.6, bloodOxygen: 98, weight: 55.8, lastSync: new Date() }
}

// Get data for selected user
const getUserHealthData = () => {
  if (props.userId && mockUserData[props.userId]) {
    healthData.value = mockUserData[props.userId]
  }
}

// Watch for userId changes
if (props.userId) {
  getUserHealthData()
}

const lastDataTime = computed(() => healthData.value.lastSync)

// Check if data is recent (within 3 days)
const hasRecentData = computed(() => {
  const now = new Date()
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  return healthData.value.lastSync >= threeDaysAgo
})

// Get sync status
const getSyncStatusText = () => {
  const daysAgo = getDaysNumber()
  if (daysAgo === 0) return '今日'
  if (daysAgo === 1) return '昨日'
  return `${daysAgo}天前`
}

const getSyncStatusClass = (time: Date) => {
  const daysAgo = getDaysNumber()
  if (daysAgo === 0) return 'bg-green-100 text-green-600'
  if (daysAgo <= 2) return 'bg-blue-100 text-blue-600'
  return 'bg-orange-100 text-orange-600'
}

const getDaysNumber = () => {
  const now = new Date()
  const diff = now.getTime() - healthData.value.lastSync.getTime()
  return Math.floor(diff / (24 * 60 * 60 * 1000))
}

const getDaysAgo = () => {
  const daysAgo = getDaysNumber()
  if (daysAgo === 0) return '今天'
  if (daysAgo === 1) return '昨天'
  if (daysAgo < 7) return `${daysAgo}天前`
  return '一周前'
}

const formatTime = (date: Date) => {
  const d = new Date(date)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Status helpers
const getBPStatusClass = () => {
  const [systolic] = healthData.value.bloodPressure.split('/').map(Number)
  if (systolic >= 140) return 'text-red-600'
  if (systolic >= 120) return 'text-orange-600'
  return 'text-green-600'
}

const getBPStatusText = () => {
  const [systolic] = healthData.value.bloodPressure.split('/').map(Number)
  if (systolic >= 140) return '偏高'
  if (systolic >= 120) return '正常高值'
  return '正常'
}

const getSugarStatusClass = () => {
  const sugar = healthData.value.bloodSugar
  if (sugar >= 7.0) return 'bg-red-100 text-red-600'
  if (sugar >= 6.1) return 'bg-orange-100 text-orange-600'
  if (sugar <= 3.9) return 'bg-red-100 text-red-600'
  return 'bg-green-100 text-green-600'
}

const getSugarStatusText = () => {
  const sugar = healthData.value.bloodSugar
  if (sugar >= 7.0) return '偏高'
  if (sugar >= 6.1) return '稍高'
  if (sugar <= 3.9) return '偏低'
  return '正常'
}

const getSleepStatusClass = () => {
  const sleep = healthData.value.sleep
  if (sleep < 6) return 'text-orange-600'
  if (sleep > 9) return 'text-blue-600'
  return 'text-green-600'
}

const getSleepStatusText = () => {
  const sleep = healthData.value.sleep
  if (sleep < 6) return '不足'
  if (sleep > 9) return '充足'
  return '正常'
}

const getWeightStatusClass = () => {
  const weight = healthData.value.weight
  if (weight > 80) return 'text-orange-600'
  if (weight < 50) return 'text-blue-600'
  return 'text-green-600'
}

const getWeightStatusText = () => {
  const weight = healthData.value.weight
  if (weight > 80) return '偏高'
  if (weight < 50) return '偏低'
  return '正常'
}
</script>
