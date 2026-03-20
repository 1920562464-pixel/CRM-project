<template>
  <div class="flex h-full bg-slate-50">
    <!-- Toast -->
    <Toast ref="toastRef" />

    <!-- Sidebar Navigation -->
    <div class="w-48 bg-white border-r border-slate-200 py-4 flex flex-col">
      <button
        v-for="item in navItems"
        :key="item.id"
        @click="activeSection = item.id"
        :class="`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
          activeSection === item.id
            ? 'text-indigo-600 bg-indigo-50 border-r-2 border-indigo-600'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`"
      >
        <component :is="item.icon" :size="18" />
        {{ item.label }}
      </button>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 overflow-y-auto p-8">
      <!-- Learning Config -->
      <div v-if="activeSection === 'learning'" class="space-y-8 animate-in fade-in duration-300">
        <!-- Template Selection -->
        <section class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Layers :size="20" class="text-indigo-600" />
                课程模板配置
              </h3>
              <p class="text-sm text-slate-500 mt-1">
                为用户选择一套标准课程模板，支持在此基础上进行个性化调整。
              </p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-slate-700">当前模板:</span>
              <select
                v-model="selectedTemplate"
                class="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
              >
                <option value="diabetes">2型糖尿病干预标准模板</option>
                <option value="weight">减重塑形标准模板</option>
                <option value="hypertension">高血压管理模板</option>
                <option value="custom">自定义模板</option>
              </select>
            </div>
          </div>

          <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div class="text-sm font-medium text-slate-700 mb-2">模板包含内容预览:</div>
            <div class="flex flex-wrap gap-2">
              <span class="px-3 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600">低GI饮食入门指南 (PDF)</span>
              <span class="px-3 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600">七天控糖特训营 (Video)</span>
              <span class="px-3 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600">血糖监测操作规范 (Video)</span>
              <span class="px-3 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600">+5 更多</span>
            </div>
          </div>
        </section>

        <!-- Tab模式课程配置 -->
        <section class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <!-- 顶部操作栏 -->
          <div class="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <h3 class="text-base font-bold text-slate-800">课程内容配置</h3>
              <span class="text-xs text-slate-500">({{ selectedTemplate === 'diabetes' ? '2型糖尿病' : selectedTemplate === 'weight' ? '减重塑形' : '高血压' }}模板)</span>
            </div>
            <button
              @click="addCustomContent"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs hover:bg-indigo-700 transition-colors"
            >
              <Plus :size="14" />
              添加自定义内容
            </button>
          </div>

          <!-- 模块Tab切换栏 -->
          <div class="border-b border-slate-200 bg-white">
            <div class="flex overflow-x-auto">
              <button
                v-for="module in courseModules"
                :key="module.id"
                @click="activeModule = module.id"
                :class="`px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeModule === module.id
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`"
              >
                <span class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :class="module.color"></span>
                  {{ module.name }}
                  <span class="text-xs px-2 py-0.5 rounded-full" :class="activeModule === module.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'">
                    {{ module.days.length }} 天
                  </span>
                </span>
              </button>
            </div>
          </div>

          <!-- Day Tab切换栏 -->
          <div class="border-b border-slate-200 bg-slate-50">
            <div class="flex overflow-x-auto px-4">
              <button
                v-for="day in currentModuleDays"
                :key="day.id"
                @click="activeDay = day.id"
                :class="`px-4 py-2.5 text-xs font-medium rounded-lg transition-all mx-1 my-2 ${
                  activeDay === day.id
                    ? 'bg-white text-indigo-600 shadow-md border-2 border-indigo-300'
                    : 'text-slate-600 hover:bg-white hover:shadow-sm border-2 border-transparent'
                }`"
              >
                <span class="flex items-center gap-1.5">
                  {{ day.label }}
                  <span v-if="day.contentCount > 0" class="text-[10px] px-1.5 py-0.5 rounded-full" :class="activeDay === day.id ? 'bg-indigo-100' : 'bg-slate-200'">
                    {{ day.contentCount }}
                  </span>
                </span>
              </button>
            </div>
          </div>

          <!-- 课件列表内容区 -->
          <div class="p-6">
            <!-- 当前选中的Day标题 -->
            <div class="flex items-center justify-between mb-4">
              <div>
                <h4 class="text-sm font-semibold text-slate-700">
                  {{ currentDayInfo?.label }} - 课程内容
                </h4>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ currentDayContent.length }} 个课件
                </p>
              </div>
              <button
                @click="addContentToDay"
                class="flex items-center gap-1.5 px-3 py-1.5 border border-indigo-300 text-indigo-600 rounded-lg text-xs hover:bg-indigo-50 transition-colors"
              >
                <Plus :size="16" />
                添加课件
              </button>
            </div>

            <!-- 课件列表 -->
            <div v-if="currentDayContent.length > 0" class="space-y-2">
              <div
                v-for="item in currentDayContent"
                :key="item.id"
                class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-white transition-all group"
              >
                <!-- 课件图标 -->
                <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" :class="getContentTypeIcon(item.type).bgColor">
                  <component :is="getContentTypeIcon(item.type).icon" :size="18" :class="getContentTypeIcon(item.type).iconColor" />
                </div>

                <!-- 课件信息 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-sm font-medium text-slate-800 truncate">{{ item.title }}</span>
                    <span v-if="item.required" class="text-[9px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded">必学</span>
                    <span v-if="item.source === 'template'" class="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded">模板</span>
                    <span v-else class="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-600 rounded">自定义</span>
                  </div>
                  <div class="flex items-center gap-3 text-[10px] text-slate-500">
                    <span>{{ item.duration }}</span>
                    <span v-if="item.progress">• 进度 {{ item.progress }}%</span>
                  </div>
                </div>

                <!-- 操作区域 -->
                <div class="flex items-center gap-2">
                  <!-- 启用开关 -->
                  <div
                    @click="toggleContentEnabled(item.id)"
                    :class="`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors ${item.enabled ? 'bg-green-500' : 'bg-slate-300'}`"
                  >
                    <div :class="`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-0'}`"></div>
                  </div>

                  <!-- 删除按钮 -->
                  <button
                    @click="removeContent(item.id)"
                    class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="text-center py-12">
              <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <BookOpen :size="32" class="text-slate-400" />
              </div>
              <p class="text-sm text-slate-500">该天暂未配置课件</p>
              <button
                @click="addContentToDay"
                class="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
              >
                添加课件
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- Nutrient Config -->
      <div v-if="activeSection === 'nutrient'" class="space-y-6 animate-in fade-in duration-300">
        <div class="flex justify-between items-center mb-2">
          <div>
            <h3 class="text-lg font-bold text-slate-800">营养素干预白名单</h3>
            <p class="text-sm text-slate-500">配置该用户可用的营养素范围，Agent 将仅从白名单中进行推荐。</p>
          </div>
          <button class="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-2">
            <Plus :size="14" /> 从商品库添加
          </button>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
            <div class="relative flex-1 max-w-sm">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
              <input type="text" placeholder="搜索已配置营养素..." class="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg" />
            </div>
            <button class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-600">
              <Filter :size="16" /> 筛选
            </button>
          </div>

          <table class="w-full text-left text-sm">
            <thead class="text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th class="px-6 py-3">营养素名称</th>
                <th class="px-6 py-3">品牌 / 规格</th>
                <th class="px-6 py-3">Agent 权限</th>
                <th class="px-6 py-3">禁忌标签</th>
                <th class="px-6 py-3 text-right">状态</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr class="hover:bg-slate-50">
                <td class="px-6 py-4 font-bold text-slate-800">乳清蛋白粉</td>
                <td class="px-6 py-4 text-slate-600">Optimum Nutrition (5lbs)</td>
                <td class="px-6 py-4">
                  <span class="text-xs bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100">允许自动推荐</span>
                </td>
                <td class="px-6 py-4">
                  <span class="text-xs bg-red-50 text-red-600 px-2 py-1 rounded">乳糖不耐受慎用</span>
                </td>
                <td class="px-6 py-4 text-right">
                  <span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                </td>
              </tr>
              <tr class="hover:bg-slate-50">
                <td class="px-6 py-4 font-bold text-slate-800">辅酶 Q10</td>
                <td class="px-6 py-4 text-slate-600">Doctors Best (100mg)</td>
                <td class="px-6 py-4">
                  <span class="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100">需人工确认</span>
                </td>
                <td class="px-6 py-4">-</td>
                <td class="px-6 py-4 text-right">
                  <span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Habits Config -->
      <div v-if="activeSection === 'habits'" class="space-y-6 animate-in fade-in duration-300">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-800">习惯库配置</h3>
            <p class="text-sm text-slate-500">勾选用户需要养成的行为习惯</p>
          </div>
          <button
            @click="manageHabits"
            class="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1"
          >
            <Library :size="16" /> 管理习惯库
          </button>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <div
            v-for="habit in habits"
            :key="habit.id"
            @click="toggleHabit(habit.id)"
            :class="`flex items-center justify-between p-4 border rounded-xl transition-all cursor-pointer ${habit.active ? 'bg-indigo-50/30 border-indigo-200' : 'bg-white border-slate-200 opacity-60'}`"
          >
            <div class="flex items-center gap-3">
              <div
                :class="`w-10 h-10 rounded-full flex items-center justify-center ${
                  habit.type === 'sleep'
                    ? 'bg-purple-100 text-purple-600'
                    : habit.type === 'sport'
                      ? 'bg-orange-100 text-orange-600'
                      : habit.type === 'diet'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-green-100 text-green-600'
                }`"
              >
                <Clock v-if="habit.type === 'sleep'" :size="20" />
                <Calendar v-else-if="habit.type === 'sport'" :size="20" />
                <CheckSquare v-else-if="habit.type === 'diet'" :size="20" />
                <FileText v-else :size="20" />
              </div>
              <div>
                <div class="font-bold text-slate-800">{{ habit.name }}</div>
                <div class="text-xs text-slate-500">分类: {{ habit.type === 'sleep' ? '睡眠' : habit.type === 'sport' ? '运动' : '饮食' }}</div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span v-if="habit.active" class="text-xs font-bold text-indigo-600 bg-white px-2 py-1 rounded shadow-sm">已启用</span>
              <span v-else class="text-xs text-slate-400">未启用</span>
              <div
                :class="`w-12 h-6 rounded-full p-1 transition-colors ${habit.active ? 'bg-indigo-600' : 'bg-slate-300'}`"
              >
                <div :class="`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${habit.active ? 'translate-x-6' : 'translate-x-0'}`"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Todo Config -->
      <div v-if="activeSection === 'todo'" class="space-y-6 animate-in fade-in duration-300">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-bold text-slate-800">每日待办模板</h3>
            <p class="text-sm text-slate-500">配置用户每日必须完成的基础打卡任务</p>
          </div>
        </div>

        <div class="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div class="bg-slate-50 px-4 py-2 text-xs font-bold text-slate-500 border-b border-slate-200 grid grid-cols-12 gap-4">
            <div class="col-span-6">任务名称</div>
            <div class="col-span-3 text-center">触发时间</div>
            <div class="col-span-3 text-right">操作</div>
          </div>
          <div class="divide-y divide-slate-100">
            <div
              v-for="todo in todoItems"
              :key="todo.id"
              class="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 group"
            >
              <div class="col-span-6 font-medium text-slate-800">{{ todo.name }}</div>
              <div class="col-span-3 text-center text-sm text-slate-500 font-mono">{{ todo.time }}</div>
              <div class="col-span-3 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="p-1 text-slate-400 hover:text-indigo-600">
                  <CheckSquare :size="16" />
                </button>
                <button class="p-1 text-slate-400 hover:text-red-600">
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
          </div>
          <div class="p-3 bg-slate-50 border-t border-slate-200">
            <button
              @click="addTodo"
              class="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus :size="16" /> 添加每日固定任务
            </button>
          </div>
        </div>
      </div>

      <!-- Reports Config -->
      <div v-if="activeSection === 'reports'" class="space-y-6 animate-in fade-in duration-300">
        <div class="mb-6">
          <h3 class="text-lg font-bold text-slate-800">报告推送设置</h3>
          <p class="text-sm text-slate-500">管理自动生成报告的频率与内容</p>
        </div>

        <div class="space-y-4">
          <div
            v-for="report in reportConfigs"
            :key="report.id"
            class="p-5 border border-slate-200 rounded-xl bg-white flex items-start justify-between"
          >
            <div class="flex-1 mr-4">
              <div class="flex items-center gap-3 mb-1">
                <h4 class="font-bold text-slate-800">{{ report.title }}</h4>
                <span
                  v-if="report.active"
                  class="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded"
                >
                  开启中
                </span>
                <span v-else class="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">已关闭</span>
              </div>
              <p class="text-sm text-slate-500 mb-2">{{ report.desc }}</p>
              <div class="flex items-center gap-2 text-xs text-slate-400">
                <Clock :size="12" />
                发送时间: {{ report.time }}
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button class="text-slate-400 hover:text-slate-600">
                <ChevronRight :size="20" />
              </button>
              <div
                @click="toggleReport(report.id)"
                :class="`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${report.active ? 'bg-green-500' : 'bg-slate-200'}`"
              >
                <div :class="`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${report.active ? 'translate-x-6' : 'translate-x-0'}`"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  BookOpen,
  Video,
  CheckSquare,
  Calendar,
  FileText,
  Plus,
  Pill,
  Search,
  Filter,
  Layers,
  Library,
  Clock,
  ChevronRight,
  Trash2
} from 'lucide-vue-next'
import Toast from './shared/Toast.vue'

const toastRef = ref<InstanceType<typeof Toast>>()
const activeSection = ref('learning')
const selectedTemplate = ref('diabetes')

// 课程配置相关状态
const activeModule = ref('module1')
const activeDay = ref('day1')

// 课程内容类型
interface CourseContent {
  id: string
  title: string
  type: 'pdf' | 'video' | 'audio' | 'quiz'
  duration: string
  required: boolean
  enabled: boolean
  source: 'template' | 'custom'
  progress?: number
}

// Day信息
interface DayInfo {
  id: string
  label: string
  contentCount: number
}

// 模块信息
interface ModuleInfo {
  id: string
  name: string
  color: string
  days: DayInfo[]
}

// 模块数据
const courseModules = ref<ModuleInfo[]>([
  {
    id: 'module1',
    name: '模块1: 基础知识',
    color: 'bg-blue-500',
    days: [
      { id: 'day1', label: 'Day 1', contentCount: 3 },
      { id: 'day2', label: 'Day 2', contentCount: 2 },
      { id: 'day3', label: 'Day 3', contentCount: 4 }
    ]
  },
  {
    id: 'module2',
    name: '模块2: 实践训练',
    color: 'bg-green-500',
    days: [
      { id: 'day11', label: 'Day 11', contentCount: 2 },
      { id: 'day12', label: 'Day 12', contentCount: 3 },
      { id: 'day13', label: 'Day 13', contentCount: 2 }
    ]
  },
  {
    id: 'module3',
    name: '模块3: 进阶提升',
    color: 'bg-purple-500',
    days: [
      { id: 'day21', label: 'Day 21', contentCount: 1 },
      { id: 'day22', label: 'Day 22', contentCount: 2 }
    ]
  }
])

// 课程内容数据
const courseContentData = ref<Record<string, CourseContent[]>>({
  'day1': [
    { id: 'c1', title: '欢迎来到第一模块', type: 'video', duration: '15分钟', required: true, enabled: true, source: 'template', progress: 100 },
    { id: 'c2', title: '什么是2型糖尿病', type: 'pdf', duration: '12页', required: true, enabled: true, source: 'template' },
    { id: 'c3', title: '基础知识测试', type: 'quiz', duration: '10分钟', required: false, enabled: true, source: 'template' }
  ],
  'day2': [
    { id: 'c21', title: '血糖监测基础', type: 'video', duration: '20分钟', required: true, enabled: true, source: 'template' },
    { id: 'c22', title: '饮食记录入门', type: 'pdf', duration: '8页', required: true, enabled: true, source: 'template' }
  ],
  'day3': [
    { id: 'c31', title: '运动指导', type: 'video', duration: '25分钟', required: true, enabled: true, source: 'template' },
    { id: 'c32', title: '用药须知', type: 'pdf', duration: '15页', required: true, enabled: true, source: 'template' },
    { id: 'c33', title: '生活习惯调整', type: 'video', duration: '18分钟', required: false, enabled: true, source: 'template' },
    { id: 'c34', title: '第一周总结', type: 'quiz', duration: '15分钟', required: false, enabled: true, source: 'template' }
  ],
  'day11': [
    { id: 'c111', title: '血糖监测实操', type: 'video', duration: '20分钟', required: true, enabled: true, source: 'template', progress: 42 },
    { id: 'c112', title: '饮食记录指南', type: 'pdf', duration: '8页', required: true, enabled: false, source: 'custom' }
  ],
  'day12': [
    { id: 'c121', title: '运动计划入门', type: 'video', duration: '25分钟', required: true, enabled: true, source: 'template' },
    { id: 'c122', title: '用药指导', type: 'pdf', duration: '15页', required: true, enabled: true, source: 'template' },
    { id: 'c123', title: '生活习惯评估', type: 'quiz', duration: '15分钟', required: false, enabled: true, source: 'template' }
  ],
  'day13': [
    { id: 'c131', title: '进阶饮食技巧', type: 'video', duration: '30分钟', required: true, enabled: true, source: 'template' },
    { id: 'c132', title: '营养搭配方案', type: 'pdf', duration: '20页', required: true, enabled: true, source: 'template' }
  ],
  'day21': [
    { id: 'c211', title: '长期管理策略', type: 'video', duration: '35分钟', required: true, enabled: true, source: 'template' }
  ],
  'day22': [
    { id: 'c221', title: '并发症预防', type: 'pdf', duration: '18页', required: true, enabled: true, source: 'template' },
    { id: 'c222', title: '综合测评', type: 'quiz', duration: '20分钟', required: true, enabled: true, source: 'template' }
  ]
})

// 当前模块的Days
const currentModuleDays = computed(() => {
  const module = courseModules.value.find(m => m.id === activeModule.value)
  return module?.days || []
})

// 当前Day的信息
const currentDayInfo = computed(() => {
  return currentModuleDays.value.find(d => d.id === activeDay.value)
})

// 当前Day的内容
const currentDayContent = computed(() => {
  return courseContentData.value[activeDay.value] || []
})

// 根据内容类型获取图标
const getContentTypeIcon = (type: string) => {
  const icons = {
    pdf: { icon: FileText, iconColor: 'text-orange-500', bgColor: 'bg-orange-50' },
    video: { icon: Video, iconColor: 'text-blue-500', bgColor: 'bg-blue-50' },
    audio: { icon: BookOpen, iconColor: 'text-purple-500', bgColor: 'bg-purple-50' },
    quiz: { icon: CheckSquare, iconColor: 'text-green-500', bgColor: 'bg-green-50' }
  }
  return icons[type as keyof typeof icons] || icons.pdf
}

// 课程配置相关方法
const toggleContentEnabled = (contentId: string) => {
  const content = currentDayContent.value.find(c => c.id === contentId)
  if (content) {
    content.enabled = !content.enabled
    toastRef.value?.show(content.enabled ? '已启用课件' : '已禁用课件', 'success')
  }
}

const removeContent = (contentId: string) => {
  if (confirm('确定要删除这个课件吗？')) {
    const contents = courseContentData.value[activeDay.value]
    if (contents) {
      const index = contents.findIndex(c => c.id === contentId)
      if (index > -1) {
        contents.splice(index, 1)
        toastRef.value?.show('课件已删除', 'success')
      }
    }
  }
}

const addContentToDay = () => {
  toastRef.value?.show(`打开添加课件弹窗到 ${currentDayInfo.value?.label}`, 'info')
}

const addCustomContent = () => {
  toastRef.value?.show('打开添加自定义内容弹窗', 'info')
}

interface Habit {
  id: number
  name: string
  type: 'sleep' | 'sport' | 'diet' | 'health'
  active: boolean
}

interface TodoItem {
  id: number
  name: string
  time: string
}

interface ReportConfig {
  id: number
  title: string
  desc: string
  active: boolean
  time: string
}

const habits = ref<Habit[]>([
  { id: 1, name: '每日 23:00 前入睡', type: 'sleep', active: true },
  { id: 2, name: '餐后散步 15 分钟', type: 'sport', active: true },
  { id: 3, name: '饮水 2000ml', type: 'diet', active: true },
  { id: 4, name: '记录早起空腹体重', type: 'health', active: false }
])

const todoItems = ref<TodoItem[]>([
  { id: 1, name: '上传早餐照片', time: '08:00' },
  { id: 2, name: '上传午餐照片', time: '12:00' },
  { id: 3, name: '上传晚餐照片', time: '18:00' },
  { id: 4, name: '空腹血糖测量', time: '07:30' },
  { id: 5, name: '睡前体重测量', time: '22:00' }
])

const reportConfigs = ref<ReportConfig[]>([
  { id: 1, title: '每日小结 (Daily)', desc: '汇总今日饮食、运动及打卡完成情况，AI 自动生成评语。', active: true, time: '每晚 22:30' },
  { id: 2, title: '周度健康报告 (Weekly)', desc: '深度分析本周血糖趋势、体重变化及习惯养成进度。', active: true, time: '每周日 20:00' },
  { id: 3, title: '月度阶段总结 (Monthly)', desc: '全方位阶段性复盘，包含对比分析与下阶段建议。', active: false, time: '每月 1日 09:00' }
])

const navItems = [
  { id: 'learning', label: '课程模板', icon: BookOpen },
  { id: 'nutrient', label: '营养素配置', icon: Pill },
  { id: 'habits', label: '习惯管理', icon: CheckSquare },
  { id: 'todo', label: '每日待办', icon: Calendar },
  { id: 'reports', label: '报告配置', icon: FileText }
]

// Methods
const addContent = () => {
  toastRef.value?.show('打开添加内容弹窗', 'info')
}

const manageHabits = () => {
  toastRef.value?.show('打开习惯库管理', 'info')
}

const toggleHabit = (id: number) => {
  const habit = habits.value.find(h => h.id === id)
  if (habit) {
    habit.active = !habit.active
  }
}

const addTodo = () => {
  toastRef.value?.show('打开添加待办任务弹窗', 'info')
}

const toggleReport = (id: number) => {
  const report = reportConfigs.value.find(r => r.id === id)
  if (report) {
    report.active = !report.active
  }
}
</script>
