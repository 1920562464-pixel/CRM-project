<template>
  <div class="space-y-6 animate-in fade-in duration-500 relative">
    <!-- Toast -->
    <Toast ref="toastRef" />

    <!-- Top Bar with Tabs and Calendar -->
    <div class="flex items-center justify-between">
      <!-- Tabs -->
      <div class="flex items-center gap-4 border-b border-slate-200 pb-1 flex-1">
        <button
          @click="activeTab = 'overview'"
          :class="`flex items-center gap-2 pb-3 px-2 text-sm font-medium transition-all relative ${
            activeTab === 'overview' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`"
        >
          <LayoutDashboard :size="16" />
          干预总览
          <span v-if="activeTab === 'overview'" class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
        </button>
        <button
          @click="activeTab = 'nutrient'"
          :class="`flex items-center gap-2 pb-3 px-2 text-sm font-medium transition-all relative ${
            activeTab === 'nutrient' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`"
        >
          <Pill :size="16" />
          营养素干预
          <span v-if="activeTab === 'nutrient'" class="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
        </button>
      </div>

      <!-- Date Picker Button -->
      <DatePickerButton
        v-model="selectedCalendarDate"
        :date-data="dateDataMap"
        @date-select="handleDateSelect"
      />
    </div>

    <!-- 营养素干预 Tab -->
    <div v-if="activeTab === 'nutrient'">
      <NutrientIntervention />
    </div>

    <!-- 干预总览 Tab -->
    <div v-else>
      <!-- Top Warning Banner -->
      <div v-if="alertBlockers.length > 0" class="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3 mb-6">
        <AlertTriangle class="text-red-600 mt-0.5" :size="20" />
        <div class="flex-1">
          <h3 class="font-bold text-red-700 text-sm">Agent 风险预警：{{ alertBlockers.length }} 个高优先级阻塞点</h3>
          <p class="text-red-600/80 text-xs mt-1">{{ alertBlockers[0]?.description }}</p>
        </div>
        <button
          @click="handleWarning"
          class="bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-100 transition-colors"
        >
          去处理
        </button>
      </div>

      <div class="grid grid-cols-12 gap-6">
        <!-- Left Column: Agent Attribution (3 cols) -->
        <div class="col-span-12 md:col-span-3 flex flex-col gap-4">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-slate-800 flex items-center gap-2">
                <BrainCircuit :size="16" class="text-indigo-600" />
                归因仪表盘
              </h3>
              <span class="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                刚刚更新
              </span>
            </div>

            <!-- 雷达图占位 -->
            <div class="h-48 flex items-center justify-center bg-slate-50 rounded-lg mb-4 -ml-6">
              <div class="text-center text-slate-400 text-sm">
                <Activity :size="32" class="mx-auto mb-2" />
                雷达图组件
              </div>
            </div>

            <div class="space-y-3 mt-2 flex-1 overflow-y-auto">
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-slate-500">代谢风险</span>
                  <span class="font-medium" :class="getRiskColor(healthData.metabolicRisk)">{{ getRiskLabel(healthData.metabolicRisk) }}</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-1.5">
                  <div class="h-1.5 rounded-full transition-all" :class="getRiskBarColor(healthData.metabolicRisk)" :style="{ width: `${healthData.metabolicRisk}%` }"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-slate-500">依从性</span>
                  <span class="font-medium" :class="getRiskColor(healthData.compliance)">{{ getRiskLabel(healthData.compliance) }}</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-1.5">
                  <div class="h-1.5 rounded-full transition-all" :class="getRiskBarColor(healthData.compliance)" :style="{ width: `${healthData.compliance}%` }"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-slate-500">行为习惯</span>
                  <span class="font-medium" :class="getRiskColor(100 - healthData.behaviorRisk)">{{ getRiskLabel(100 - healthData.behaviorRisk) }}</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-1.5">
                  <div class="h-1.5 rounded-full transition-all" :class="getRiskBarColor(100 - healthData.behaviorRisk)" :style="{ width: `${100 - healthData.behaviorRisk}%` }"></div>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-100">
              <h4 class="text-xs font-semibold text-slate-700 mb-2">主要触发因子</h4>
              <div class="flex flex-wrap gap-2">
                <span v-for="trigger in healthData.triggers" :key="trigger"
                  class="px-2 py-1 bg-red-50 text-red-600 text-[10px] rounded border border-red-100">
                  {{ trigger }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Center Column: Today's Tasks (6 cols) -->
        <div class="col-span-12 md:col-span-6 flex flex-col gap-4">
          <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-bold text-slate-800 text-lg flex items-center gap-2">
                <ListTodo :size="20" class="text-indigo-600" />
                今日任务看板
              </h3>
            </div>

            <div class="flex-1 overflow-y-auto pr-2 space-y-6">
              <!-- 1. Blockers / Alerts -->
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <ShieldAlert :size="16" class="text-orange-600" />
                  <h4 class="font-bold text-slate-700 text-sm">当前阻塞点</h4>
                  <span class="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{{ blockers.length }}</span>
                </div>
                <button
                  @click="showBlockerModal = true"
                  class="text-indigo-600 text-xs font-medium hover:bg-indigo-50 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                >
                  <Plus :size="14" /> 添加
                </button>
              </div>

              <div class="space-y-3">
                <!-- Blocker Items -->
                <div v-for="blocker in blockers" :key="blocker.id"
                  class="relative overflow-hidden rounded-lg p-4 transition-all group"
                  :class="blocker.resolved ? 'bg-green-50 border border-green-100 opacity-60' :
                    blocker.source === 'AI' ? 'bg-orange-50 border border-orange-100' : 'bg-white border border-slate-200 hover:border-slate-300'">
                  <div v-if="blocker.source === 'AI' && !blocker.resolved" class="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full -mr-4 -mt-4"></div>
                  <div class="flex items-start gap-3 relative z-10">
                    <div class="mt-1">
                      <component :is="getBlockerIcon(blocker.source)"
                        :size="20"
                        :class="blocker.resolved ? 'text-green-600' : blocker.source === 'AI' ? 'text-orange-600' : 'text-slate-400'" />
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase"
                          :class="blocker.source === 'AI' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'">
                          {{ blocker.source === 'AI' ? 'AI识别' : '教练添加' }}
                        </span>
                        <h4 class="font-bold text-sm"
                          :class="blocker.resolved ? 'text-green-800 line-through' :
                            blocker.source === 'AI' ? 'text-orange-800' : 'text-slate-800'">
                          {{ blocker.title }}
                        </h4>
                      </div>
                      <p class="text-xs leading-relaxed"
                        :class="blocker.resolved ? 'text-green-700/60' :
                          blocker.source === 'AI' ? 'text-orange-700/80' : 'text-slate-500'">
                        {{ blocker.description }}
                      </p>
                      <div v-if="blocker.solution" class="mt-2 p-2 bg-white rounded text-xs text-slate-600">
                        <span class="font-medium">解决方案：</span>{{ blocker.solution }}
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <button
                        v-if="!blocker.resolved"
                        @click="resolveBlocker(blocker.id)"
                        class="px-3 py-1.5 text-xs font-bold rounded shadow-sm border transition-colors"
                        :class="blocker.source === 'AI' ? 'bg-white text-orange-600 border-orange-100 hover:bg-orange-50' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
                      >
                        {{ blocker.source === 'AI' ? '处理' : '跟进' }}
                      </button>
                      <button
                        @click="deleteBlocker(blocker.id)"
                        class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 :size="14" />
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="blockers.length === 0" class="text-center py-4 text-slate-400 text-sm">
                  暂无阻塞点，点击"添加"创建
                </div>
              </div>

              <!-- 2. Coach's Todo -->
              <div class="pt-4 border-t border-slate-100">
                <div class="flex items-center gap-2 mb-3">
                  <UserCheck :size="16" class="text-slate-700" />
                  <h4 class="font-bold text-slate-700 text-sm">教练待办</h4>
                  <span class="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                    {{ coachTasks.filter(t => !t.completed).length }}/{{ coachTasks.length }}
                  </span>
                  <button @click="showCoachTaskModal = true" class="ml-auto text-indigo-600 text-xs hover:bg-indigo-50 px-2 py-1 rounded flex items-center gap-1">
                    <Plus :size="12" /> 添加
                  </button>
                </div>
                <div class="space-y-2">
                  <div v-for="task in coachTasks" :key="task.id"
                    @click="toggleCoachTask(task.id)"
                    class="p-3 rounded-lg transition-all cursor-pointer"
                    :class="task.completed ? 'bg-green-50 border border-green-100 opacity-60' : 'bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm'">
                    <div class="flex items-start justify-between mb-1">
                      <span class="text-sm font-bold" :class="task.completed ? 'text-green-700 line-through' : 'text-slate-800'">
                        {{ task.title }}
                      </span>
                      <span class="text-[10px] font-medium px-1.5 py-0.5 rounded"
                        :class="{
                          'bg-red-50 text-red-600': task.priority === 'high',
                          'bg-slate-100 text-slate-500': task.priority === 'normal',
                          'bg-blue-50 text-blue-600': task.priority === 'low'
                        }">
                        {{ task.priority === 'high' ? '高优' : task.priority === 'normal' ? '普通' : '低优' }}
                      </span>
                    </div>
                    <div class="text-xs" :class="task.completed ? 'text-green-600/60' : 'text-slate-500'">
                      {{ task.description }}
                    </div>
                    <div class="flex items-center gap-2 mt-2 text-[10px]" :class="task.completed ? 'text-green-500' : 'text-slate-400'">
                      <Clock :size="10" />
                      {{ task.deadline }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 3. User's Todo & Habits -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <!-- User Daily Tasks -->
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <Calendar :size="16" class="text-indigo-600" />
                      <h4 class="font-bold text-slate-700 text-sm">用户今日任务</h4>
                    </div>
                    <button @click="showUserTaskModal = true" class="text-slate-400 hover:text-indigo-600">
                      <Plus :size="14"/>
                    </button>
                  </div>
                  <div class="space-y-2">
                    <div v-for="task in userTasks" :key="task.id"
                      class="flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer"
                      :class="task.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 hover:border-indigo-300'"
                      @click="toggleUserTask(task.id)">
                      <div class="w-4 h-4 rounded border flex items-center justify-center transition-all"
                        :class="task.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 hover:border-indigo-500'">
                        <CheckCircle2 v-if="task.completed" :size="12" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-medium truncate"
                          :class="task.completed ? 'text-slate-500 line-through' : 'text-slate-800'">
                          {{ task.title }}
                        </div>
                      </div>
                      <span class="text-[10px] text-slate-400 font-mono">{{ task.time }}</span>
                    </div>
                  </div>
                </div>

                <!-- User Habits -->
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                      <Zap :size="16" class="text-amber-500" />
                      <h4 class="font-bold text-slate-700 text-sm">习惯养成</h4>
                    </div>
                    <button @click="showHabitModal = true" class="text-slate-400 hover:text-amber-600">
                      <Plus :size="14"/>
                    </button>
                  </div>
                  <div class="space-y-2">
                    <div v-for="habit in habits" :key="habit.id"
                      @click="toggleHabitCheck(habit.id)"
                      class="flex items-center gap-3 p-2.5 rounded-lg border transition-all cursor-pointer"
                      :class="habit.checkedToday ? 'bg-amber-50/50 border-amber-100' : 'bg-white border-slate-200 hover:border-amber-300'">
                      <div class="w-4 h-4 rounded-full border flex items-center justify-center transition-all"
                        :class="habit.checkedToday ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 hover:border-amber-500'">
                        <CheckCircle2 v-if="habit.checkedToday" :size="12" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-medium truncate"
                          :class="habit.checkedToday ? 'text-slate-600' : 'text-slate-800'">
                          {{ habit.title }}
                        </div>
                      </div>
                      <div class="flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded-full">
                        <Zap :size="8" class="fill-amber-600" />
                        {{ habit.streak }}天
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Intervention Map (3 cols) -->
        <div class="col-span-12 md:col-span-3 flex flex-col gap-4">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-slate-800 flex items-center gap-2">
                <Flag :size="16" class="text-indigo-600" />
                干预地图
              </h3>
              <span class="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold border border-indigo-100">
                {{ interventionStages.find(s => s.active)?.name || '未开始' }}
              </span>
            </div>

            <div class="relative flex-1 py-2 pl-4 border-l-2 border-slate-100 ml-3 space-y-8">
              <div v-for="(stage, index) in interventionStages" :key="stage.id"
                class="relative"
                :class="stage.completed ? 'opacity-50 grayscale' : stage.active ? '' : 'opacity-40'">
                <div class="absolute"
                  :class="stage.completed ? '-left-[21px] top-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white' :
                    stage.active ? '-left-[23px] top-0 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow-sm ring-2 ring-indigo-100' :
                    '-left-[21px] top-0 w-3 h-3 bg-slate-200 rounded-full border-2 border-white'">
                </div>
                <div class="text-xs font-bold mb-1"
                  :class="stage.active ? 'text-indigo-700' : 'text-slate-500'">
                  {{ stage.name }}
                </div>

                <div v-if="stage.active" class="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 mb-2">
                  <div class="text-[10px] text-indigo-900 font-bold mb-1">核心目标: {{ stage.goal }}</div>
                  <p class="text-[10px] text-slate-500 leading-tight">{{ stage.description }}</p>
                  <div class="mt-2 flex items-center gap-2">
                    <div class="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div class="bg-indigo-500 h-1.5 rounded-full" :style="{ width: `${stage.progress}%` }"></div>
                    </div>
                    <span class="text-[10px] text-indigo-600 font-bold">{{ stage.progress }}%</span>
                  </div>
                </div>

                <div class="text-[10px]"
                  :class="stage.active ? 'text-slate-500' : 'text-slate-400'">
                  {{ stage.completed ? `完成度 100%` : stage.active ? `当前进度: 第 ${stage.currentWeek} 周` : '待解锁' }}
                </div>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100">
              <button
                @click="viewFullMap"
                class="w-full py-2 flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
              >
                查看完整路径 <ArrowRight :size="12" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Blocker Modal -->
    <Teleport to="body">
      <div v-if="showBlockerModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity" @click="showBlockerModal = false"></div>
      <div v-if="showBlockerModal" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white rounded-2xl shadow-2xl z-[70] overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800 flex items-center gap-2">
            <Library :size="20" class="text-indigo-600" />
            阻塞点知识库
          </h3>
          <button @click="showBlockerModal = false" class="text-slate-400 hover:text-slate-600">
            <X :size="24" class="rotate-45" />
          </button>
        </div>

        <div class="p-2 bg-slate-50 border-b border-slate-100">
          <input
            v-model="blockerSearch"
            type="text"
            placeholder="搜索阻塞点 (e.g. 睡眠, 饮食, 情绪)..."
            class="w-full px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div class="max-h-[400px] overflow-y-auto p-4 space-y-3">
          <div class="text-xs font-bold text-slate-500 mb-2">推荐阻塞点</div>
          <div class="grid grid-cols-1 gap-2">
            <div
              v-for="option in filteredBlockerOptions"
              :key="option.title"
              @click="selectBlocker(option)"
              class="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer group transition-all"
            >
              <div>
                <div class="font-bold text-slate-800 text-sm group-hover:text-indigo-700">{{ option.title }}</div>
                <div class="text-xs text-slate-500">{{ option.desc }}</div>
              </div>
              <div class="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded">
                {{ option.category }}
              </div>
            </div>
          </div>

          <div class="text-xs font-bold text-slate-500 mt-4 mb-2">自定义</div>
          <div class="space-y-2">
            <input
              v-model="customBlockerTitle"
              type="text"
              placeholder="阻塞点标题"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <textarea
              v-model="customBlockerDesc"
              placeholder="阻塞点描述"
              rows="2"
              class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 resize-none"
            ></textarea>
            <button
              @click="createCustomBlocker"
              :disabled="!customBlockerTitle"
              class="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Plus :size="16" /> 创建阻塞点
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Coach Task Modal -->
    <Teleport to="body">
      <div v-if="showCoachTaskModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" @click="showCoachTaskModal = false"></div>
      <div v-if="showCoachTaskModal" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white rounded-2xl shadow-2xl z-[70]">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800">添加教练待办</h3>
          <button @click="showCoachTaskModal = false" class="text-slate-400 hover:text-slate-600">
            <X :size="20" />
          </button>
        </div>
        <div class="p-4 space-y-3">
          <input v-model="newCoachTask.title" placeholder="任务标题" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <textarea v-model="newCoachTask.description" placeholder="任务描述" rows="2" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"></textarea>
          <div class="grid grid-cols-2 gap-2">
            <select v-model="newCoachTask.priority" class="px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="high">高优先级</option>
              <option value="normal">普通</option>
              <option value="low">低优先级</option>
            </select>
            <input v-model="newCoachTask.deadline" type="time" class="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <button @click="addCoachTask" :disabled="!newCoachTask.title"
            class="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            添加
          </button>
        </div>
      </div>
    </Teleport>

    <!-- User Task Modal -->
    <Teleport to="body">
      <div v-if="showUserTaskModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" @click="showUserTaskModal = false"></div>
      <div v-if="showUserTaskModal" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white rounded-2xl shadow-2xl z-[70]">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800">添加用户任务</h3>
          <button @click="showUserTaskModal = false" class="text-slate-400 hover:text-slate-600">
            <X :size="20" />
          </button>
        </div>
        <div class="p-4 space-y-3">
          <input v-model="newUserTask.title" placeholder="任务标题" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <input v-model="newUserTask.time" type="time" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <button @click="addUserTask" :disabled="!newUserTask.title"
            class="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            添加
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Habit Modal -->
    <Teleport to="body">
      <div v-if="showHabitModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" @click="showHabitModal = false"></div>
      <div v-if="showHabitModal" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white rounded-2xl shadow-2xl z-[70]">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800">添加习惯</h3>
          <button @click="showHabitModal = false" class="text-slate-400 hover:text-slate-600">
            <X :size="20" />
          </button>
        </div>
        <div class="p-4 space-y-3">
          <input v-model="newHabit.title" placeholder="习惯描述" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <input v-model="newHabit.targetStreak" type="number" placeholder="目标连续天数" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <button @click="addHabit" :disabled="!newHabit.title"
            class="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            添加
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  BrainCircuit,
  Zap,
  ListTodo,
  UserCheck,
  ShieldAlert,
  Calendar,
  Flag,
  Library,
  Bot,
  Pill,
  LayoutDashboard,
  Activity,
  X,
  Trash2
} from 'lucide-vue-next'
import DatePickerButton from './shared/DatePickerButton.vue'
import NutrientIntervention from './NutrientIntervention.vue'
import Toast from './shared/Toast.vue'

// Types
interface Blocker {
  id: string
  title: string
  description: string
  source: 'AI' | 'Coach'
  resolved: boolean
  solution?: string
}

interface CoachTask {
  id: string
  title: string
  description: string
  priority: 'high' | 'normal' | 'low'
  deadline: string
  completed: boolean
}

interface UserTask {
  id: string
  title: string
  time: string
  completed: boolean
}

interface Habit {
  id: string
  title: string
  streak: number
  targetStreak: number
  checkedToday: boolean
}

interface InterventionStage {
  id: string
  name: string
  goal: string
  description: string
  progress: number
  currentWeek: number
  completed: boolean
  active: boolean
}

const toastRef = ref<InstanceType<typeof Toast>>()
const activeTab = ref<'overview' | 'nutrient'>('overview')
const showBlockerModal = ref(false)
const showCoachTaskModal = ref(false)
const showUserTaskModal = ref(false)
const showHabitModal = ref(false)
const blockerSearch = ref('')

// Calendar state
const selectedCalendarDate = ref(new Date())
const isRetroactiveMode = ref(false)

interface DateData {
  date: string
  hasData: boolean
  completed: boolean
}
const dateDataMap = ref<{ [key: string]: DateData }>({})

// Health data
const healthData = ref({
  metabolicRisk: 80,
  compliance: 45,
  behaviorRisk: 20,
  triggers: ['空腹血糖 > 7.0', '打卡缺失 3天']
})

// Blockers data
const blockers = ref<Blocker[]>([
  {
    id: '1',
    title: '周末社交聚餐不可控',
    description: '过去 3 周周六摄入均超标 50%。需要教练介入规划"欺骗餐"策略。',
    source: 'AI',
    resolved: false
  },
  {
    id: '2',
    title: '情绪性进食风险',
    description: '用户反馈最近工作压力大，有深夜吃零食的倾向。',
    source: 'Coach',
    resolved: false
  }
])

// Coach tasks
const coachTasks = ref<CoachTask[]>([
  { id: '1', title: '审核昨日晚餐记录', description: '用户备注"吃多了"，需确认是否超标', priority: 'high', deadline: '09:00', completed: false },
  { id: '2', title: '发送周末饮食提醒', description: '提前预警周末聚餐风险', priority: 'normal', deadline: '16:00', completed: false }
])

// User tasks
const userTasks = ref<UserTask[]>([
  { id: '1', title: '上传早餐照片', time: '08:00', completed: true },
  { id: '2', title: '空腹血糖测量', time: '08:30', completed: true },
  { id: '3', title: '阅读：低GI饮食指南', time: '12:00', completed: false }
])

// Habits
const habits = ref<Habit[]>([
  { id: '1', title: '每日 23:00 前入睡', streak: 5, targetStreak: 21, checkedToday: false },
  { id: '2', title: '餐后散步 15 分钟', streak: 12, targetStreak: 30, checkedToday: true },
  { id: '3', title: '饮水 2000ml', streak: 3, targetStreak: 7, checkedToday: false }
])

// Intervention stages
const interventionStages = ref<InterventionStage[]>([
  { id: '1', name: '启动期 (W1-W2)', goal: '建立基础', description: '建立记录习惯，了解基本饮食原则', progress: 100, currentWeek: 0, completed: true, active: false },
  { id: '2', name: '稳定期 (W3-W6)', goal: '控糖饮食', description: '重点控制晚餐碳水，增加绿叶蔬菜', progress: 50, currentWeek: 3, completed: false, active: true },
  { id: '3', name: '调整期 (W7-W10)', goal: '优化方案', description: '根据身体反馈调整饮食结构', progress: 0, currentWeek: 0, completed: false, active: false },
  { id: '4', name: '维持期 (W11+)', goal: '习惯固化', description: '将健康饮食转化为长期生活方式', progress: 0, currentWeek: 0, completed: false, active: false }
])

// New item forms
const newCoachTask = ref({ title: '', description: '', priority: 'normal' as const, deadline: '09:00' })
const newUserTask = ref({ title: '', time: '09:00' })
const newHabit = ref({ title: '', targetStreak: 21 })
const customBlockerTitle = ref('')
const customBlockerDesc = ref('')

// Blocker options
const blockerOptions = [
  { title: '睡眠不足', desc: '长期每日睡眠时间 < 6小时', category: '生活方式' },
  { title: '高频外卖', desc: '每周点外卖次数 > 5次', category: '饮食习惯' },
  { title: '久坐不动', desc: '工作日每日步数 < 3000', category: '运动' },
  { title: '家庭支持弱', desc: '家人不支持减重计划', category: '环境' },
  { title: '情绪波动大', desc: '压力性进食频繁', category: '心理' },
  { title: '社交应酬多', desc: '每周聚餐 > 2次', category: '社交' }
]

// Computed
const alertBlockers = computed(() => blockers.value.filter(b => !b.resolved && b.source === 'AI'))

const filteredBlockerOptions = computed(() => {
  if (!blockerSearch.value) return blockerOptions
  return blockerOptions.filter(opt =>
    opt.title.includes(blockerSearch.value) ||
    opt.category.includes(blockerSearch.value)
  )
})

const now = new Date()
const currentDate = computed(() => {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
})

// Calendar related computed
const formattedSelectedDate = computed(() => {
  const date = selectedCalendarDate.value
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  return `${year}年${month}月${day}日 ${weekday}`
})

const isToday = computed(() => {
  const today = new Date()
  const selected = selectedCalendarDate.value
  return (
    selected.getDate() === today.getDate() &&
    selected.getMonth() === today.getMonth() &&
    selected.getFullYear() === today.getFullYear()
  )
})

const currentDay = computed(() => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[now.getDay()]
})

// Methods
const getRiskColor = (value: number) => {
  if (value >= 70) return 'text-red-600'
  if (value >= 40) return 'text-orange-500'
  return 'text-emerald-500'
}

const getRiskLabel = (value: number) => {
  if (value >= 70) return '高'
  if (value >= 40) return '中'
  return '良'
}

const getRiskBarColor = (value: number) => {
  if (value >= 70) return 'bg-red-500'
  if (value >= 40) return 'bg-orange-500'
  return 'bg-emerald-500'
}

const getBlockerIcon = (source: string) => {
  return source === 'AI' ? markRaw(Bot) : markRaw(UserCheck)
}

const handleWarning = () => {
  toastRef.value?.show('已创建人工干预任务', 'success')
}

const resolveBlocker = (id: string) => {
  const blocker = blockers.value.find(b => b.id === id)
  if (blocker) {
    blocker.resolved = true
    blocker.solution = '已与用户沟通，制定针对性解决方案'
    toastRef.value?.show('阻塞点已标记为已处理', 'success')
    saveData()
  }
}

const deleteBlocker = (id: string) => {
  blockers.value = blockers.value.filter(b => b.id !== id)
  toastRef.value?.show('阻塞点已删除', 'success')
  saveData()
}

const selectBlocker = (option: { title: string; desc: string }) => {
  blockers.value.push({
    id: Date.now().toString(),
    title: option.title,
    description: option.desc,
    source: 'Coach',
    resolved: false
  })
  toastRef.value?.show(`已添加阻塞点: ${option.title}`, 'success')
  showBlockerModal.value = false
  saveData()
}

const createCustomBlocker = () => {
  if (!customBlockerTitle.value) return
  blockers.value.push({
    id: Date.now().toString(),
    title: customBlockerTitle.value,
    description: customBlockerDesc.value || '自定义阻塞点',
    source: 'Coach',
    resolved: false
  })
  toastRef.value?.show('自定义阻塞点已创建', 'success')
  customBlockerTitle.value = ''
  customBlockerDesc.value = ''
  showBlockerModal.value = false
  saveData()
}

const toggleCoachTask = (id: string) => {
  const task = coachTasks.value.find(t => t.id === id)
  if (task) {
    task.completed = !task.completed
    saveData()
  }
}

const addCoachTask = () => {
  if (!newCoachTask.value.title) return
  coachTasks.value.push({
    id: Date.now().toString(),
    ...newCoachTask.value,
    completed: false
  })
  toastRef.value?.show('教练待办已添加', 'success')
  newCoachTask.value = { title: '', description: '', priority: 'normal', deadline: '09:00' }
  showCoachTaskModal.value = false
  saveData()
}

const toggleUserTask = (id: string) => {
  const task = userTasks.value.find(t => t.id === id)
  if (task) {
    task.completed = !task.completed
    saveData()
  }
}

const addUserTask = () => {
  if (!newUserTask.value.title) return
  userTasks.value.push({
    id: Date.now().toString(),
    ...newUserTask.value,
    completed: false
  })
  toastRef.value?.show('用户任务已添加', 'success')
  newUserTask.value = { title: '', time: '09:00' }
  showUserTaskModal.value = false
  saveData()
}

const toggleHabitCheck = (id: string) => {
  const habit = habits.value.find(h => h.id === id)
  if (habit) {
    habit.checkedToday = !habit.checkedToday
    if (habit.checkedToday) {
      habit.streak++
    } else {
      habit.streak = Math.max(0, habit.streak - 1)
    }
    saveData()
  }
}

const addHabit = () => {
  if (!newHabit.value.title) return
  habits.value.push({
    id: Date.now().toString(),
    title: newHabit.value.title,
    streak: 0,
    targetStreak: newHabit.value.targetStreak || 21,
    checkedToday: false
  })
  toastRef.value?.show('习惯已添加', 'success')
  newHabit.value = { title: '', targetStreak: 21 }
  showHabitModal.value = false
  saveData()
}

const viewFullMap = () => {
  toastRef.value?.show('查看完整干预路径', 'info')
}

// Local Storage
const STORAGE_KEY = 'intervention_manager_data'

const saveData = () => {
  const data = {
    blockers: blockers.value,
    coachTasks: coachTasks.value,
    userTasks: userTasks.value,
    habits: habits.value,
    interventionStages: interventionStages.value,
    healthData: healthData.value
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const loadData = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const data = JSON.parse(saved)
      blockers.value = data.blockers || []
      coachTasks.value = data.coachTasks || []
      userTasks.value = data.userTasks || []
      habits.value = data.habits || []
      interventionStages.value = data.interventionStages || interventionStages.value
      healthData.value = data.healthData || healthData.value
    } catch (e) {
      console.error('Failed to load intervention data:', e)
    }
  }
}

// Calendar methods
const handleDateSelect = (date: Date, isRetroactive: boolean) => {
  isRetroactiveMode.value = isRetroactive
  // Load data for selected date
  loadInterventionsForDate(date)
  toastRef.value?.show(isRetroactive ? '已进入补打卡模式' : '已切换到选中日期', 'info')
}

const loadInterventionsForDate = (date: Date) => {
  const dateKey = formatDateKey(date)
  // In a real app, this would fetch historical data from API
  console.log('Loading data for:', dateKey)
}

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const initializeDateDataMap = () => {
  const today = new Date()
  const todayKey = formatDateKey(today)
  dateDataMap.value[todayKey] = {
    date: todayKey,
    hasData: true,
    completed: false
  }
}

onMounted(() => {
  loadData()
  initializeDateDataMap()
})
</script>
