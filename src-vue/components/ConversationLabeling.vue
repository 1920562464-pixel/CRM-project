<template>
  <div class="h-[calc(100vh-140px)] flex gap-6">
    <!-- Left: Chat Session List -->
    <div class="w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col hidden md:flex">
      <div class="p-4 border-b border-slate-100">
        <h3 class="font-bold text-slate-800 mb-2">会话列表</h3>
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="14" />
          <input type="text" placeholder="搜索关键词..." class="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md" />
        </div>
      </div>
      <div class="flex-1 overflow-y-auto">
        <div
          v-for="i in 3"
          :key="i"
          :class="`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 ${i === 1 ? 'bg-indigo-50/50 border-l-4 border-l-indigo-500' : ''}`"
        >
          <div class="flex justify-between mb-1">
            <span class="font-bold text-sm text-slate-700">低血糖预警处理</span>
            <span class="text-[10px] text-slate-400">10:30</span>
          </div>
          <p class="text-xs text-slate-500 line-clamp-2">用户报告头晕症状，Agent 引导测血糖并建议补充碳水。</p>
          <div class="flex gap-2 mt-2">
            <span class="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] rounded border border-red-100">高价值</span>
            <span class="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded border border-slate-200">待复核</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Middle: Chat Interface -->
    <div class="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
      <div class="p-4 border-b border-slate-100 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">A</div>
          <div>
            <div class="text-sm font-bold text-slate-800">Agent - HealthGuard v4.2</div>
            <div class="text-xs text-slate-500">会话 ID: #SESSION-8832-241107</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors">
            完成标注
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        <div
          v-for="msg in mockChat"
          :key="msg.id"
          :class="`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`"
          @click="msg.sender === 'agent' && (selectedMsgId = msg.id)"
        >
          <div :class="`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.sender === 'agent' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`">
            <component :is="msg.sender === 'agent' ? Bot : User" :size="16" />
          </div>

          <div :class="`max-w-[70%] group relative ${msg.sender === 'agent' && selectedMsgId === msg.id ? 'ring-2 ring-indigo-400 ring-offset-2 rounded-2xl' : ''}`">
            <div :class="`p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-slate-200 text-slate-800' : 'bg-white border border-slate-200 text-slate-800 shadow-sm'}`">
              {{ msg.text }}
            </div>

            <!-- Agent Meta Info -->
            <div v-if="msg.sender === 'agent'" class="absolute -bottom-6 left-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div v-if="msg.quality === 'good'" class="bg-emerald-100 text-emerald-600 p-1 rounded-full">
                <ThumbsUp :size="12" />
              </div>
              <div v-else class="bg-red-100 text-red-600 p-1 rounded-full">
                <ThumbsDown :size="12" />
              </div>
              <div class="flex gap-1">
                <span v-for="tag in msg.tags" :key="tag" class="text-[10px] bg-slate-100 px-1.5 rounded text-slate-500 border border-slate-200">
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Bad Response Indicator -->
            <div v-if="msg.sender === 'agent' && msg.quality === 'bad'" class="absolute -right-2 -top-2 bg-red-500 text-white p-1 rounded-full shadow-md border-2 border-white">
              <AlertTriangle :size="12" />
            </div>

            <div class="text-[10px] text-slate-400 mt-1" :class="msg.sender === 'user' ? 'text-right' : ''">
              {{ msg.time }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Annotation Panel -->
    <div v-if="selectedMsgId" class="w-72 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col p-4 animate-in slide-in-from-right duration-300">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-slate-800">回复标注</h3>
        <button @click="selectedMsgId = null" class="text-slate-400 hover:text-slate-600">
          <X :size="16" />
        </button>
      </div>

      <div class="space-y-6">
        <div>
          <label class="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wide">质量评估</label>
          <div class="flex gap-2">
            <button
              @click="annotateQuality('good')"
              :class="`flex-1 flex items-center justify-center gap-2 py-2 border rounded-lg text-sm ${
                quality === 'good'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-slate-600'
              }`"
            >
              <ThumbsUp :size="16" /> 优质
            </button>
            <button
              @click="annotateQuality('bad')"
              :class="`flex-1 flex items-center justify-center gap-2 py-2 border rounded-lg text-sm ${
                quality === 'bad'
                  ? 'border-red-200 bg-red-50 text-red-700 ring-1 ring-red-500/20'
                  : 'border-slate-200 text-slate-600'
              }`"
            >
              <ThumbsDown :size="16" /> 需优化
            </button>
          </div>
        </div>

        <div>
          <label class="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wide">问题类型</label>
          <div class="space-y-2">
            <label class="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" v-model="issueTypes" value="vague" class="rounded text-indigo-600 focus:ring-indigo-500" />
              回复过于简略
            </label>
            <label class="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" v-model="issueTypes" value="incorrect" class="rounded text-indigo-600 focus:ring-indigo-500" />
              事实性错误
            </label>
            <label class="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" v-model="issueTypes" value="tone" class="rounded text-indigo-600 focus:ring-indigo-500" />
              语气不当
            </label>
          </div>
        </div>

        <div>
          <label class="text-xs font-bold text-slate-500 mb-2 block uppercase tracking-wide">修正建议 (微调数据)</label>
          <textarea
            v-model="correction"
            class="w-full h-32 p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            placeholder="输入理想的回复内容..."
          ></textarea>
        </div>

        <button
          @click="saveAnnotation"
          class="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          保存标注
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Tag,
  Search,
  Bot,
  User,
  Check,
  X,
  AlertTriangle
} from 'lucide-vue-next'

interface ChatMessage {
  id: number
  sender: 'user' | 'agent'
  text: string
  time: string
  quality?: 'good' | 'bad'
  tags?: string[]
  reason?: string
}

const selectedMsgId = ref<number | null>(null)
const quality = ref<'good' | 'bad' | null>(null)
const issueTypes = ref<string[]>([])
const correction = ref('可以吃，但对于低血糖后的正餐，建议选择低升糖指数（GI）的主食。米饭建议减半，或者替换为杂粮饭，并搭配丰富的蔬菜和蛋白质，以维持血糖平稳。')

const mockChat: ChatMessage[] = [
  { id: 1, sender: 'user', text: '这两天总感觉有点头晕，是不是低血糖了？', time: '10:30' },
  { id: 2, sender: 'agent', text: '头晕确实可能是低血糖的症状之一。请问您现在手边有血糖仪吗？建议先测一下指尖血。另外，您今天早餐吃了什么呢？', time: '10:30', quality: 'good', tags: ['RiskCheck', 'DataRequest'] },
  { id: 3, sender: 'user', text: '刚测了，4.2，感觉有点低。早上只吃了个鸡蛋。', time: '10:32' },
  { id: 4, sender: 'agent', text: '4.2mmol/L 对您来说确实偏低了。请立即补充 15-20g 快速碳水，比如半杯果汁或 3-4 块方糖。休息 15 分钟后再复测一下。', time: '10:32', quality: 'good', tags: ['EmergencyAction', 'MedicalAdvice'] },
  { id: 5, sender: 'user', text: '好的，我去喝点橙汁。', time: '10:33' },
  { id: 6, sender: 'agent', text: '好的，请务必在 10:48 左右再次测量并告诉我结果。我会持续关注您的状态。', time: '10:33', quality: 'good', tags: ['FollowUp'] },
  { id: 7, sender: 'user', text: '对了，那我中午还能吃米饭吗？', time: '10:40' },
  { id: 8, sender: 'agent', text: '可以的，但建议减量。', time: '10:40', quality: 'bad', tags: ['VagueResponse'], reason: '回复过于简单，未结合低血糖情况给出具体建议' }
]

const selectedMsg = mockChat.find(m => m.id === selectedMsgId.value)

const annotateQuality = (q: 'good' | 'bad') => {
  quality.value = q
}

const saveAnnotation = () => {
  console.log('Saving annotation:', { quality: quality.value, issueTypes: issueTypes.value, correction: correction.value })
  // Save logic here
}
</script>
