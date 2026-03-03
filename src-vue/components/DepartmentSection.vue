<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <!-- 部门头部 -->
    <div
      @click="toggleExpand"
      class="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 cursor-pointer hover:from-slate-100 hover:to-slate-150 transition-all"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="getDepartmentBgClass(department)">
          <Building :size="20" :class="getDepartmentTextClass(department)" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-slate-900">{{ department }}</h3>
          <p class="text-sm text-slate-500">{{ people.length }} 人 · ¥{{ departmentTotalAmount.toLocaleString() }}</p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-sm text-slate-500">
          待审批: <span class="font-semibold text-amber-600">{{ departmentPendingCount }}</span> 笔
        </div>
        <ChevronDown
          :size="20"
          class="text-slate-400 transition-transform duration-300"
          :class="{ 'rotate-180': isExpanded }"
        />
      </div>
    </div>

    <!-- 人员列表 -->
    <Transition
      name="expand"
      @enter="enter"
      @leave="leave"
    >
      <div v-if="isExpanded" class="divide-y divide-slate-100">
        <div
          v-for="person in people"
          :key="person.id"
          class="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
          @click="$emit('view-detail', person)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1">
              <img
                :src="person.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + person.name"
                :alt="person.name"
                class="w-10 h-10 rounded-full bg-slate-100 ring-2 ring-white shadow-sm"
              />
              <div>
                <div class="font-medium text-slate-900">{{ person.name }}</div>
                <div class="text-sm text-slate-500">
                  {{ person.reimbursements.length }} 笔报销 · ¥{{ person.totalAmount.toLocaleString() }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <!-- 状态标签 -->
              <div class="flex items-center gap-2">
                <span v-if="person.pendingCount > 0" class="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                  {{ person.pendingCount }} 待审批
                </span>
                <span v-if="person.paidCount > 0" class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                  {{ person.paidCount }} 已支付
                </span>
              </div>
              <ChevronRight :size="18" class="text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Building, ChevronDown, ChevronRight } from 'lucide-vue-next'

interface Props {
  department: string
  people: any[]
  statusFilter: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'view-detail': [person: any]
}>()

const isExpanded = ref(true)

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const enter = (element: Element) => {
  const el = element as HTMLElement
  el.style.height = '0'
  requestAnimationFrame(() => {
    el.style.transition = 'height 0.3s ease-out'
    el.style.height = el.scrollHeight + 'px'
  })
}

const leave = (element: Element) => {
  const el = element as HTMLElement
  el.style.height = el.scrollHeight + 'px'
  requestAnimationFrame(() => {
    el.style.transition = 'height 0.2s ease-in'
    el.style.height = '0'
  })
}

// 部门统计数据
const departmentTotalAmount = computed(() => {
  return props.people.reduce((sum, person) => sum + person.totalAmount, 0)
})

const departmentPendingCount = computed(() => {
  return props.people.reduce((sum, person) => sum + person.pendingCount, 0)
})

// 部门样式
const getDepartmentBgClass = (dept: string) => {
  const classes: Record<string, string> = {
    '教练部': 'bg-blue-100',
    '医疗部': 'bg-emerald-100',
    '运营部': 'bg-orange-100',
    '前台部': 'bg-pink-100'
  }
  return classes[dept] || 'bg-slate-100'
}

const getDepartmentTextClass = (dept: string) => {
  const classes: Record<string, string> = {
    '教练部': 'text-blue-600',
    '医疗部': 'text-emerald-600',
    '运营部': 'text-orange-600',
    '前台部': 'text-pink-600'
  }
  return classes[dept] || 'text-slate-600'
}
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  height: 0;
  opacity: 0;
}
</style>
