<template>
  <div class="flex gap-4 h-[calc(100vh-6rem)]">
    <!-- 左侧边栏 -->
    <div class="w-72 rounded-lg flex flex-col" :style="{
      background: 'var(--card)',
      border: '1px solid var(--border)'
    }">
      <!-- 新建对话按钮 -->
      <div class="p-4" :style="{ borderBottom: '1px solid var(--border)' }">
        <button
          @click="clearHistory"
          class="w-full px-4 py-2 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
          :style="{
            background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5'
          }"
        >
          <Plus :size="16" />
          新建对话
        </button>
      </div>

      <!-- 搜索框 -->
      <div class="p-4" :style="{ borderBottom: '1px solid var(--border)' }">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2" :size="16" :style="{ color: 'var(--text-placeholder)' }" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索历史对话..."
            class="w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
            :style="{
              border: '1px solid var(--border)',
              background: 'var(--background)',
              color: 'var(--text-primary)',
              '--tw-ring-color': isBlackGold.value ? 'rgba(184, 134, 11, 0.5)' : 'rgba(79, 70, 229, 0.5)'
            }"
          />
        </div>
      </div>

      <!-- 对话历史 -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-4">
          <h3 class="text-xs font-semibold uppercase tracking-wide mb-3" :style="{ color: 'var(--text-secondary)' }">今天</h3>
          <div class="space-y-2 mb-4">
            <HistoryItem
              v-for="item in todayConversations"
              :key="item.id"
              :title="item.title"
              :time="item.time"
              :active="item.id === activeConversationId"
              @click="loadConversation(item.id)"
            />
          </div>

          <h3 class="text-xs font-semibold uppercase tracking-wide mb-3" :style="{ color: 'var(--text-secondary)' }">过去 7 天</h3>
          <div class="space-y-2 mb-4">
            <HistoryItem
              v-for="item in weekConversations"
              :key="item.id"
              :title="item.title"
              :time="item.time"
              :active="item.id === activeConversationId"
              @click="loadConversation(item.id)"
            />
          </div>

          <h3 class="text-xs font-semibold uppercase tracking-wide mb-3" :style="{ color: 'var(--text-secondary)' }">更早</h3>
          <div class="space-y-2">
            <HistoryItem
              v-for="item in olderConversations"
              :key="item.id"
              :title="item.title"
              :time="item.time"
              :active="item.id === activeConversationId"
              @click="loadConversation(item.id)"
            />
          </div>
        </div>
      </div>

      <!-- 底部设置 -->
      <div class="p-4 space-y-2" :style="{ borderTop: '1px solid var(--border)' }">
        <button
          @click="showSettings = true"
          class="w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 transition-colors"
          :style="{
            color: 'var(--text-regular)'
          }"
        >
          <Settings :size="16" />
          API 设置
        </button>
        <button
          @click="exportConversation"
          class="w-full px-3 py-2 text-left text-sm rounded-lg flex items-center gap-2 transition-colors"
          :style="{
            color: 'var(--text-regular)'
          }"
        >
          <Download :size="16" />
          导出对话
        </button>
      </div>
    </div>

    <!-- 右侧聊天区域 -->
    <div class="flex-1 rounded-lg flex flex-col overflow-hidden" :style="{
      background: 'var(--card)',
      border: '1px solid var(--border)'
    }">
      <!-- 聊天头部 -->
      <div class="h-14 px-6 flex items-center justify-between" :style="{
        borderBottom: '1px solid var(--border)',
        background: 'var(--card)'
      }">
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-10 h-10 rounded-full flex items-center justify-center" :style="{
              background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #D4A84A 100%)' : 'linear-gradient(to bottom right, #6366f1, #9333ea)'
            }">
              <Bot :size="20" class="text-white" />
            </div>
            <span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h2 class="text-base font-bold" :style="{ color: 'var(--text-primary)' }">Agent 智能助手</h2>
            <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">专业健康管理顾问</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <!-- 模型选择 -->
          <select v-model="selectedModel" class="px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2" :style="{
            border: '1px solid var(--border)',
            background: 'var(--background)',
            color: 'var(--text-primary)',
            '--tw-ring-color': isBlackGold.value ? 'rgba(184, 134, 11, 0.5)' : 'rgba(79, 70, 229, 0.5)'
          }">
            <option value="gpt-3.5-turbo">GPT-3.5</option>
            <option value="gpt-4">GPT-4</option>
            <option value="claude-3">Claude-3</option>
          </select>
          <!-- 快捷操作 -->
          <button
            @click="showQuickActions = !showQuickActions"
            class="p-2 rounded-lg transition-colors relative"
            :style="{ color: isBlackGold.value ? '#D4A84A' : '#4f46e5' }"
          >
            <Sparkles :size="18" />
          </button>
          <button class="p-2 rounded-lg transition-colors" :style="{ color: 'var(--text-secondary)' }">
            <MoreVertical :size="18" />
          </button>
        </div>
      </div>

      <!-- 快捷操作面板 -->
      <div v-if="showQuickActions" class="px-6 py-4 border-b" :style="{
        background: isBlackGold.value ? 'linear-gradient(135deg, rgba(184, 134, 11, 0.08) 0%, rgba(212, 168, 74, 0.08) 100%)' : 'linear-gradient(to right, #eef2ff, #f3e8ff)',
        borderColor: isBlackGold.value ? 'rgba(184, 134, 11, 0.2)' : 'rgba(99, 102, 241, 0.2)'
      }">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">快捷操作</h3>
          <button @click="showQuickActions = false" class="p-1 rounded" :style="{ background: 'var(--card)' }">
            <X :size="16" :style="{ color: 'var(--text-secondary)' }" />
          </button>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            v-for="action in quickActions"
            :key="action.id"
            @click="executeQuickAction(action.prompt)"
            class="p-3 rounded-lg hover:shadow-md transition-all text-left"
            :style="{
              background: 'var(--card)',
              border: '1px solid var(--border)'
            }"
          >
            <component :is="action.icon" :size="20" class="mb-2" :style="{ color: isBlackGold.value ? '#D4A84A' : '#4f46e5' }" />
            <div class="text-sm font-medium" :style="{ color: 'var(--text-primary)' }">{{ action.title }}</div>
            <div class="text-xs mt-1" :style="{ color: 'var(--text-secondary)' }">{{ action.description }}</div>
          </button>
        </div>
      </div>

      <!-- 消息列表 -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-6 space-y-6" :style="{ background: 'var(--fill-light)' }">
        <!-- 欢迎界面（当没有消息时显示） -->
        <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center">
          <div class="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
            <Bot :size="40" class="text-white" />
          </div>
          <h3 class="text-xl font-bold text-slate-800 mb-2">欢迎使用 AI 智能助手</h3>
          <p class="text-sm text-slate-500 mb-8 text-center max-w-md">
            我可以帮助您查询客户信息、分析健康数据、生成干预方案，或从知识库中查找相关资料
          </p>
          <div class="grid grid-cols-2 gap-3 w-full max-w-lg">
            <button
              v-for="suggestion in suggestions"
              :key="suggestion.text"
              @click="inputValue = suggestion.text; handleSendMessage()"
              class="p-4 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all text-left"
            >
              <component :is="suggestion.icon" :size="20" class="text-indigo-600 mb-2" />
              <div class="text-sm font-medium text-slate-800">{{ suggestion.text }}</div>
            </button>
          </div>
        </div>

        <!-- 消息列表 -->
        <template v-else>
          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`"
          >
            <div :class="`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`">
              <!-- 头像 -->
              <div :class="`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-indigo-100' : 'bg-indigo-600'
              }`">
                <User v-if="msg.role === 'user'" :size="20" class="text-indigo-600" />
                <Bot v-else :size="20" class="text-white" />
              </div>

              <!-- 消息内容 -->
              <div class="space-y-2">
                <div :class="`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                }`">
                  <p class="text-sm whitespace-pre-line leading-relaxed" v-html="formatMessage(msg.content)"></p>
                </div>

                <!-- 来源标签 -->
                <div v-if="msg.role === 'assistant' && msg.sources && msg.sources.length > 0" class="flex flex-wrap gap-2">
                  <span
                    v-for="(source, idx) in msg.sources"
                    :key="idx"
                    class="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs flex items-center gap-1 cursor-pointer hover:bg-indigo-100"
                  >
                    <FileText :size="12" />
                    {{ source }}
                  </span>
                </div>

                <!-- 操作按钮和时间 -->
                <div :class="`flex items-center gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`">
                  <span class="text-xs text-slate-400">{{ msg.timestamp }}</span>
                  <template v-if="msg.role === 'assistant'">
                    <button
                      @click="copyMessage(msg.content)"
                      class="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      title="复制"
                    >
                      <Copy :size="14" />
                    </button>
                    <button
                      @click="regenerateResponse(msg.id)"
                      class="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                      title="重新生成"
                    >
                      <RefreshCw :size="14" />
                    </button>
                    <button
                      @click="likeMessage(msg.id)"
                      :class="`p-1 transition-colors ${msg.isLiked ? 'text-green-600' : 'text-slate-400 hover:text-green-600'}`"
                      title="有帮助"
                    >
                      <ThumbsUp :size="14" :fill="msg.isLiked ? 'currentColor' : 'none'" />
                    </button>
                    <button
                      @click="dislikeMessage(msg.id)"
                      :class="`p-1 transition-colors ${msg.isDisliked ? 'text-red-600' : 'text-slate-400 hover:text-red-600'}`"
                      title="没有帮助"
                    >
                      <ThumbsDown :size="14" :fill="msg.isDisliked ? 'currentColor' : 'none'" />
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- 正在输入动画 -->
          <div v-if="isTyping" class="flex justify-start">
            <div class="flex gap-3 max-w-[80%]">
              <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <Bot :size="20" class="text-white" />
              </div>
              <div class="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                <div class="flex gap-1 items-center">
                  <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                  <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                  <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                  <span class="text-xs text-slate-500 ml-2">AI 正在思考...</span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div ref="messagesEndRef"></div>
      </div>

      <!-- 输入区域 -->
      <div class="p-4 bg-white border-t border-slate-200">
        <div class="relative bg-slate-100 rounded-2xl flex items-end p-2">
          <!-- 附件按钮 -->
          <div class="flex items-center gap-1 px-2">
            <button
              @click="showAttachmentMenu = !showAttachmentMenu"
              class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Paperclip :size="20" />
            </button>
            <!-- 附件菜单 -->
            <div
              v-if="showAttachmentMenu"
              class="absolute bottom-12 left-2 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-10 min-w-[150px]"
            >
              <button
                @click="attachFile('image')"
                class="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
              >
                <ImageIcon :size="16" />
                上传图片
              </button>
              <button
                @click="attachFile('document')"
                class="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
              >
                <FileText :size="16" />
                上传文档
              </button>
              <button
                @click="attachFile('knowledge')"
                class="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center gap-2"
              >
                <Database :size="16" />
                引用知识库
              </button>
            </div>
          </div>

          <!-- 输入框 -->
          <textarea
            v-model="inputValue"
            @keydown="handleKeyDown"
            @input="adjustTextareaHeight"
            ref="textareaRef"
            placeholder="输入您的问题... (Shift + Enter 换行，Enter 发送)"
            class="flex-1 bg-transparent border-none resize-none focus:ring-0 text-sm max-h-[200px] py-2 px-2 min-h-[40px]"
            rows="1"
          />

          <!-- 右侧按钮 -->
          <div class="flex items-center gap-1 px-2">
            <!-- 语音输入 -->
            <button
              @click="toggleVoiceInput"
              :class="`p-2 rounded-lg transition-colors ${
                isRecording ? 'bg-red-100 text-red-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'
              }`"
            >
              <Mic :size="20" />
            </button>

            <!-- 发送按钮 -->
            <button
              @click="handleSendMessage"
              :disabled="!inputValue.trim() || isTyping"
              :class="`p-2 rounded-full transition-all ${
                inputValue.trim() && !isTyping
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`"
            >
              <Send :size="18" />
            </button>
          </div>

          <!-- 附件预览 -->
          <div v-if="attachments.length > 0" class="absolute top-0 left-0 right-0 -translate-y-full p-2 bg-slate-50 rounded-t-2xl border-b border-slate-200">
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(file, idx) in attachments"
                :key="idx"
                class="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-sm"
              >
                <FileText :size="14" />
                <span>{{ file.name }}</span>
                <button @click="removeAttachment(idx)" class="p-0.5 hover:bg-slate-100 rounded">
                  <X :size="14" class="text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部提示和计数器 -->
        <div class="flex items-center justify-between mt-2 px-2">
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-400">{{ inputLength }} / 4000</span>
            <span v-if="inputLength > 3500" class="text-xs text-amber-500">接近字数限制</span>
          </div>
          <div class="flex items-center gap-2">
            <label class="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input type="checkbox" v-model="autoScroll" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              自动滚动
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- API 设置对话框 -->
    <Teleport to="body">
      <div v-if="showSettings" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showSettings = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
          <div class="px-6 py-4 border-b border-slate-200">
            <h3 class="text-lg font-semibold text-slate-900">API 设置</h3>
            <p class="text-sm text-slate-500 mt-1">配置 AI 服务的 API 密钥和端点</p>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">API Key</label>
              <input
                v-model="settings.apiKey"
                type="password"
                placeholder="sk-..."
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Base URL</label>
              <input
                v-model="settings.baseURL"
                type="text"
                placeholder="https://api.example.com/v1"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">模型名称</label>
              <input
                v-model="settings.model"
                type="text"
                placeholder="gpt-3.5-turbo"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">系统提示词</label>
              <textarea
                v-model="settings.systemPrompt"
                rows="3"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="自定义系统提示词..."
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Temperature ({{ settings.temperature }})</label>
              <input
                v-model.number="settings.temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                class="w-full"
              />
            </div>
          </div>
          <div class="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              @click="showSettings = false"
              class="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              @click="saveSettings"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from 'vue'
import { useTheme } from '../composables/useTheme'

// 主题相关
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')
import {
  Send, User, Bot, Sparkles, Plus, Search, Image as ImageIcon, MessageSquare,
  Bell, Settings, X, Copy, RefreshCw, ThumbsUp, ThumbsDown, Paperclip,
  FileText, Database, Mic, Download, MoreVertical, Activity, Heart,
  BookOpen, TrendingUp, Users, Calendar, CheckCircle2
} from 'lucide-vue-next'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sources?: string[]
  isLiked?: boolean
  isDisliked?: boolean
}

interface Conversation {
  id: string
  title: string
  time: string
  date: Date
}

interface Attachment {
  name: string
  type: 'image' | 'document' | 'knowledge'
}

// API 配置
const API_CONFIG = {
  apiKey: 'sk-Zkr9a9Xvzk7OF5dmAb4942596c2f4041A6Ad1bFbEa5e02Fb',
  baseURL: 'https://api.aihubmix.com/v1',
  model: 'gpt-3.5-turbo',
}

// 状态管理
const messages = ref<Message[]>([])
const inputValue = ref('')
const isTyping = ref(false)
const showSettings = ref(false)
const showQuickActions = ref(false)
const showAttachmentMenu = ref(false)
const isRecording = ref(false)
const autoScroll = ref(true)
const selectedModel = ref('gpt-3.5-turbo')
const searchQuery = ref('')
const activeConversationId = ref<string | null>(null)
const attachments = ref<Attachment[]>([])

const settings = ref({
  apiKey: API_CONFIG.apiKey,
  baseURL: API_CONFIG.baseURL,
  model: API_CONFIG.model,
  systemPrompt: `你是一个专业的CRM系统智能助手，帮助健康管理中心的工作人员管理客户信息、分析数据、提供干预建议。

你的能力包括：
1. 查询和分析客户健康数据（血糖、血压、运动、饮食等）
2. 生成健康干预处方和生活方式建议
3. 分析任务完成情况和团队绩效
4. 检索知识库中的相关资料和话术
5. 提供客户跟进建议和风险预警

请用简洁、专业的语言回答，如果涉及具体数据查询，请在回答中说明这是基于系统数据的分析。`,
  temperature: 0.7
})

// Refs
const messagesEndRef = ref<HTMLElement | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// 模拟对话历史数据
const conversationHistory = ref<Conversation[]>([
  { id: '1', title: '查询王磊血糖数据', time: '10:30', date: new Date() },
  { id: '2', title: '本周任务完成统计', time: '09:15', date: new Date() },
  { id: '3', title: '查找糖尿病干预话术', time: '昨天', date: new Date(Date.now() - 86400000) },
  { id: '4', title: '张伟的运动处方生成', time: '周一', date: new Date(Date.now() - 172800000) },
  { id: '5', title: '关于胰岛素泵的使用说明', time: '上周', date: new Date(Date.now() - 604800000) },
])

// 快捷操作
const quickActions = [
  { id: '1', title: '分析客户', description: '查看客户健康数据', icon: Activity, prompt: '帮我分析一下最近一周的客户健康数据趋势' },
  { id: '2', title: '生成处方', description: '创建干预方案', icon: Heart, prompt: '为2型糖尿病客户生成一份运动干预处方' },
  { id: '3', title: '查询话术', description: '搜索知识库', icon: BookOpen, prompt: '在知识库中查找关于初诊沟通的话术' },
  { id: '4', title: '任务统计', description: '团队绩效', icon: TrendingUp, prompt: '本周各教练的任务完成情况如何' },
]

// 欢迎页建议
const suggestions = [
  { text: '查询王磊最近一周的血糖数据', icon: Activity },
  { text: '生成一份糖尿病饮食指导', icon: Heart },
  { text: '搜索关于运动康复的话术', icon: BookOpen },
  { text: '分析本月团队业绩趋势', icon: TrendingUp },
]

// 按时间分组对话
const todayConversations = computed(() =>
  conversationHistory.value.filter(c => {
    const diff = Date.now() - c.date.getTime()
    return diff < 86400000 && c.date.getDate() === new Date().getDate()
  })
)

const weekConversations = computed(() =>
  conversationHistory.value.filter(c => {
    const diff = Date.now() - c.date.getTime()
    return diff >= 86400000 && diff < 604800000
  })
)

const olderConversations = computed(() =>
  conversationHistory.value.filter(c => {
    const diff = Date.now() - c.date.getTime()
    return diff >= 604800000
  })
)

// 输入长度
const inputLength = computed(() => inputValue.value.length)

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (autoScroll.value) {
      messagesEndRef.value?.scrollIntoView({ behavior: 'smooth' })
    }
  })
}

// 自动调整文本框高度
const adjustTextareaHeight = () => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px'
  }
}

// 格式化消息（支持 Markdown）
const formatMessage = (content: string) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-slate-100 rounded text-xs">$1</code>')
    .replace(/\n/g, '<br>')
}

// 调用 AI API
const callAIAPI = async (userMessage: string, conversationHistory: Message[]) => {
  try {
    const apiMessages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    }))

    const response = await fetch(`${settings.value.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.value.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.value.model,
        messages: [
          { role: 'system', content: settings.value.systemPrompt },
          ...apiMessages,
        ],
        temperature: settings.value.temperature,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('API Error:', errorData)
      throw new Error(`API 请求失败: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || '抱歉，我没有收到有效的响应。'
  } catch (error) {
    console.error('AI API 调用错误:', error)
    throw error
  }
}

const handleSendMessage = async () => {
  const content = inputValue.value.trim()
  if (!content || isTyping.value) return

  const newMessage: Message = {
    id: Date.now().toString(),
    role: 'user',
    content: content,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }

  const updatedMessages = [...messages.value, newMessage]
  messages.value = updatedMessages
  inputValue.value = ''
  attachments.value = []
  isTyping.value = true
  adjustTextareaHeight()
  scrollToBottom()

  try {
    const responseText = await callAIAPI(content, updatedMessages)

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sources: extractSources(responseText),
    }
    messages.value = [...messages.value, aiMessage]
    scrollToBottom()
  } catch (error) {
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '抱歉，AI 服务暂时无法响应。请检查网络连接或 API 配置。',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    messages.value = [...messages.value, errorMessage]
    scrollToBottom()
  } finally {
    isTyping.value = false
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSendMessage()
  }
}

// 提取消息中的来源引用
const extractSources = (content: string): string[] => {
  const sources: string[] = []
  const matches = content.match(/《([^》]+)》/g)
  if (matches) {
    sources.push(...matches.map(m => m.replace(/《|》/g, '')))
  }
  return sources.slice(0, 3)
}

// 复制消息
const copyMessage = (content: string) => {
  navigator.clipboard.writeText(content)
}

// 重新生成回复
const regenerateResponse = async (messageId: string) => {
  const messageIndex = messages.value.findIndex(m => m.id === messageId)
  if (messageIndex === -1) return

  // 删除这条消息及之后的所有消息
  const previousMessages = messages.value.slice(0, messageIndex)
  messages.value = previousMessages

  // 获取最后一条用户消息
  const lastUserMessage = [...previousMessages].reverse().find(m => m.role === 'user')
  if (lastUserMessage) {
    inputValue.value = lastUserMessage.content
    await handleSendMessage()
  }
}

// 点赞/点踩
const likeMessage = (messageId: string) => {
  const msg = messages.value.find(m => m.id === messageId)
  if (msg) {
    msg.isLiked = !msg.isLiked
    msg.isDisliked = false
  }
}

const dislikeMessage = (messageId: string) => {
  const msg = messages.value.find(m => m.id === messageId)
  if (msg) {
    msg.isDisliked = !msg.isDisliked
    msg.isLiked = false
  }
}

// 快捷操作
const executeQuickAction = (prompt: string) => {
  inputValue.value = prompt
  handleSendMessage()
  showQuickActions.value = false
}

// 清除历史
const clearHistory = () => {
  messages.value = []
  activeConversationId.value = null
  showQuickActions.value = true
}

// 加载对话
const loadConversation = (id: string) => {
  activeConversationId.value = id
  // 这里可以从后端加载具体对话内容
  messages.value = [
    {
      id: '1',
      role: 'assistant',
      content: '这是历史对话的内容...',
      timestamp: '10:00',
    }
  ]
}

// 附件处理
const attachFile = (type: 'image' | 'document' | 'knowledge') => {
  const input = document.createElement('input')
  input.type = 'file'
  if (type === 'image') {
    input.accept = 'image/*'
  } else if (type === 'document') {
    input.accept = '.pdf,.doc,.docx,.txt'
  }
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      attachments.value.push({ name: file.name, type })
    }
  }
  input.click()
  showAttachmentMenu.value = false
}

const removeAttachment = (index: number) => {
  attachments.value.splice(index, 1)
}

// 语音输入（占位）
const toggleVoiceInput = () => {
  isRecording.value = !isRecording.value
  // 这里可以实现实际的语音识别功能
}

// 导出对话
const exportConversation = () => {
  const content = messages.value.map(m => `[${m.timestamp}] ${m.role === 'user' ? '用户' : 'AI'}:\n${m.content}\n`).join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `对话记录_${new Date().toLocaleDateString()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

// 保存设置
const saveSettings = () => {
  settings.value = { ...settings.value }
  showSettings.value = false
}

onMounted(() => {
  showQuickActions.value = true
  scrollToBottom()
})
</script>

<script lang="ts">
import { defineComponent, PropType } from 'vue'

// 历史记录项组件
export const HistoryItem = defineComponent({
  name: 'HistoryItem',
  props: {
    title: {
      type: String,
      required: true
    },
    time: {
      type: String,
      default: ''
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  template: `
    <button
      @click="$emit('click')"
      :class="\`w-full p-3 rounded-lg text-left transition-colors group \${
        active ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50 border border-transparent'
      }\`"
    >
      <div class="flex items-start gap-3">
        <div :class="\`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 \${
          active ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white group-hover:border-indigo-300'
        }\`">
          <svg v-if="active" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" :stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p :class="\`text-sm truncate \${
            active ? 'text-slate-800 font-medium' : 'text-slate-600'
          }\`">{{ title }}</p>
          <p v-if="time" class="text-xs text-slate-400 mt-0.5">{{ time }}</p>
        </div>
        <button
          class="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded transition-all"
          title="删除"
        >
          <X :size="14" class="text-slate-400" />
        </button>
      </div>
    </button>
  `
})
</script>
