<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-slate-900">结算规则配置</h3>
      <button
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
      >
        <Plus :size="16" />
        添加规则
      </button>
    </div>

    <div class="space-y-4">
      <div v-for="rule in rules" :key="rule.id" class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h4 class="text-lg font-semibold text-slate-900">{{ rule.name }}</h4>
            <p class="text-sm text-slate-500 mt-1">{{ rule.description }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded">
              <Edit :size="16" />
            </button>
            <button
              @click="$emit('delete', rule.id)"
              :disabled="rules.length === 1"
              :class="`p-1.5 rounded ${rules.length === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 bg-blue-50 rounded-lg">
            <div class="text-sm text-blue-600 mb-1">新用户单价</div>
            <div class="text-2xl font-bold text-blue-700">¥{{ rule.newUserRate }}</div>
            <div class="text-xs text-blue-500 mt-1">元/人/月</div>
          </div>
          <div class="p-4 bg-green-50 rounded-lg">
            <div class="text-sm text-green-600 mb-1">老用户单价</div>
            <div class="text-2xl font-bold text-green-700">¥{{ rule.oldUserRate }}</div>
            <div class="text-xs text-green-500 mt-1">元/人/月</div>
          </div>
          <div class="p-4 bg-purple-50 rounded-lg">
            <div class="text-sm text-purple-600 mb-1">绩效奖金比例</div>
            <div class="text-2xl font-bold text-purple-700">{{ rule.performanceBonus }}%</div>
            <div class="text-xs text-purple-500 mt-1">按业绩计算</div>
          </div>
          <div class="p-4 bg-slate-50 rounded-lg">
            <div class="text-sm text-slate-600 mb-1">生效日期</div>
            <div class="text-2xl font-bold text-slate-700">{{ rule.effectiveDate }}</div>
            <div class="text-xs text-slate-500 mt-1">开始执行</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Edit, Trash2 } from 'lucide-vue-next'

interface SettlementRule {
  id: string
  name: string
  newUserRate: number
  oldUserRate: number
  performanceBonus: number
  effectiveDate: string
  description: string
}

defineProps<{
  rules: SettlementRule[]
}>()

defineEmits<{
  'save': [rule: SettlementRule]
  'delete': [id: string]
}>()
</script>
