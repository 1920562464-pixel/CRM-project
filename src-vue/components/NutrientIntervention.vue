<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h3 class="text-lg font-bold text-slate-800">营养素干预配置</h3>
        <p class="text-sm text-slate-500">为用户配置个性化的营养素干预方案</p>
      </div>
      <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
        <Plus :size="16" /> 添加干预
      </button>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
        <div class="relative flex-1 max-w-sm">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
          <input type="text" placeholder="搜索营养素..." class="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg" />
        </div>
        <select class="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option>全部类型</option>
          <option>蛋白质</option>
          <option>维生素</option>
          <option>矿物质</option>
        </select>
      </div>

      <table class="w-full text-left text-sm">
        <thead class="text-slate-500 font-medium border-b border-slate-200">
          <tr>
            <th class="px-6 py-3">营养素名称</th>
            <th class="px-6 py-3">品牌 / 规格</th>
            <th class="px-6 py-3">每日剂量</th>
            <th class="px-6 py-3">服用时间</th>
            <th class="px-6 py-3">状态</th>
            <th class="px-6 py-3">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in nutrients" :key="item.id" class="hover:bg-slate-50">
            <td class="px-6 py-4 font-bold text-slate-800">{{ item.name }}</td>
            <td class="px-6 py-4 text-slate-600">{{ item.brand }}</td>
            <td class="px-6 py-4 text-slate-600">{{ item.dosage }}</td>
            <td class="px-6 py-4 text-slate-600">{{ item.timing }}</td>
            <td class="px-6 py-4">
              <span :class="`px-2 py-1 rounded-full text-xs font-medium ${
                item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
              }`">
                {{ item.status === 'active' ? '使用中' : '已暂停' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <button class="text-indigo-600 hover:text-indigo-800 text-sm font-medium">编辑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 干预说明 -->
    <div class="bg-blue-50 border border-blue-100 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <Bot :size="20" class="text-blue-600 mt-0.5" />
        <div>
          <h4 class="font-bold text-blue-900 text-sm mb-1">Agent 智能推荐</h4>
          <p class="text-blue-700/80 text-xs">根据用户的体检数据和健康目标，AI 推荐优先补充蛋白质和 Omega-3 脂肪酸。当前配置已与用户档案同步。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, Plus, Bot } from 'lucide-vue-next'

const nutrients = ref([
  { id: 1, name: '乳清蛋白粉', brand: 'Optimum Nutrition (5lbs)', dosage: '30g/天', timing: '运动后30分钟', status: 'active' },
  { id: 2, name: '深海鱼油', brand: 'Blackmores (400粒)', dosage: '2粒/天', timing: '随餐服用', status: 'active' },
  { id: 3, name: '维生素D3', brand: 'Nature Made (2000IU)', dosage: '1粒/天', timing: '早餐后', status: 'paused' },
  { id: 4, name: '镁补充剂', brand: 'Natural Calm (225g)', dosage: '300mg/天', timing: '睡前1小时', status: 'active' }
])
</script>
