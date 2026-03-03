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

        <!-- Individual Adjustments -->
        <section>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-slate-800">个性化课程/课件调整</h3>
              <p class="text-sm text-slate-500">在模板基础上额外添加或移除的内容</p>
            </div>
            <button
              @click="addContent"
              class="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors"
            >
              <Plus :size="16" /> 添加额外内容
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Card 1 -->
            <div class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-white hover:border-indigo-300 transition-colors cursor-pointer group">
              <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                <FileText :size="20" class="text-orange-500" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600">低 GI 饮食入门指南.pdf</div>
                <div class="text-xs text-slate-500 truncate">来源: 模板默认</div>
              </div>
              <button class="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500">
                <Trash2 :size="16" />
              </button>
            </div>
            <!-- Card 2 -->
            <div class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-white hover:border-indigo-300 transition-colors cursor-pointer group">
              <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                <Video :size="20" class="text-blue-500" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600">七天控糖特训营</div>
                <div class="text-xs text-slate-500 truncate">来源: 模板默认 • 进度 42%</div>
              </div>
              <button class="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500">
                <Trash2 :size="16" />
              </button>
            </div>
            <!-- Card 3 -->
            <div class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-white hover:border-indigo-300 transition-colors cursor-pointer group">
              <div class="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                <Video :size="20" class="text-purple-500" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-600">冥想入门 (赠送)</div>
                <div class="text-xs text-slate-500 truncate">来源: 教练添加 • 2026-02-01</div>
              </div>
              <button class="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500">
                <Trash2 :size="16" />
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
import { ref } from 'vue'
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
