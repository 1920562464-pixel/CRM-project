<template>
  <div class="flex flex-col h-full animate-in fade-in duration-500" :style="{ background: 'var(--background-page)' }">
    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Left Sidebar: User List (Single Selection) -->
      <aside class="w-64 flex flex-col flex-shrink-0" :style="{
        background: 'var(--card)',
        borderRight: '1px solid var(--border)'
      }">
        <!-- Search -->
        <div class="p-3" :style="{ borderBottom: '1px solid var(--border-light)' }">
          <div class="relative">
            <Search class="absolute left-2.5 top-1/2 -translate-y-1/2" :size="14" :style="{ color: 'var(--text-placeholder)' }" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索用户..."
              class="w-full pl-8 pr-3 py-2 text-xs rounded-lg focus:outline-none focus:ring-2"
              :style="{
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--text-primary)',
                '--tw-ring-color': isBlackGold.value ? 'rgba(184, 134, 11, 0.5)' : 'rgba(79, 70, 229, 0.5)'
              }"
            />
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="flex" :style="{ borderBottom: '1px solid var(--border-light)' }">
          <button
            v-for="tab in filterTabs"
            :key="tab.key"
            @click="activeFilter = tab.key"
            class="flex-1 py-2 text-xs font-medium transition-all"
            :style="activeFilter === tab.key ? {
              color: isBlackGold.value ? '#D4A84A' : '#4f46e5',
              borderBottom: '2px solid ' + (isBlackGold.value ? '#B8860B' : '#4f46e5'),
              background: isBlackGold.value ? 'rgba(184, 134, 11, 0.1)' : '#eef2ff'
            } : {
              color: 'var(--text-secondary)'
            }"
          >
            {{ tab.label }}
            <span v-if="tab.count > 0" class="ml-1 px-1 py-0.5 rounded-full text-[9px]" :style="{
              background: 'var(--fill)',
              color: 'var(--text-secondary)'
            }">
              {{ tab.count }}
            </span>
          </button>
        </div>

        <!-- User List -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-2 space-y-0.5">
            <!-- User Items -->
            <div
              v-for="user in filteredUsers"
              :key="user.id"
              @click="selectUser(user.id)"
              class="p-2.5 rounded-lg cursor-pointer transition-all"
              :style="selectedUser === user.id ? {
                background: isBlackGold.value ? 'rgba(184, 134, 11, 0.15)' : '#eef2ff',
                border: '1px solid ' + (isBlackGold.value ? '#B8860B' : '#c7d2fe')
              } : {
                border: '1px solid transparent'
              }"
            >
              <div class="flex items-center gap-2">
                <!-- Avatar -->
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  :style="selectedUser === user.id ? {
                    background: user.avatarColor,
                    color: 'white'
                  } : {
                    background: 'var(--fill)',
                    color: 'var(--text-secondary)'
                  }"
                >
                  {{ user.name.charAt(0) }}
                </div>

                <!-- User Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span
                      class="text-xs font-medium truncate"
                      :style="{ color: selectedUser === user.id ? 'var(--text-primary)' : 'var(--text-primary)' }"
                    >
                      {{ user.name }}
                    </span>
                    <span
                      v-if="user.alertCount > 0"
                      class="px-1 py-0.5 text-[9px] font-bold rounded-full flex-shrink-0"
                      :style="{
                        background: 'rgba(239, 68, 68, 0.15)',
                        color: '#ef4444'
                      }"
                    >
                      {{ user.alertCount }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1 mt-0.5">
                    <span
                      class="text-[10px]"
                      :style="{
                        color: user.taskStatus === 'completed'
                          ? '#16a34a'
                          : user.taskStatus === 'in-progress'
                          ? '#3b82f6'
                          : 'var(--text-disabled)'
                      }"
                    >
                      {{ user.taskStatus === 'completed' ? '已完成' : user.taskStatus === 'in-progress' ? '进程中' : '未处理' }}
                    </span>
                    <span class="text-[10px]" :style="{ color: 'var(--text-disabled)' }">
                      {{ user.todayCompleted }}/{{ user.todayTasks }}
                    </span>
                  </div>
                </div>

                <!-- 衰老指数 -->
                <div class="flex flex-col items-end flex-shrink-0 ml-2">
                  <div class="flex items-center gap-1">
                    <span
                      class="text-xs font-bold"
                      :style="{ color: getAgingIndexColor(calculateAgingIndex(user)) }"
                    >
                      {{ calculateAgingIndex(user).toFixed(1) }}
                    </span>
                    <span class="text-[9px]" :style="{ color: 'var(--text-secondary)' }">
                      岁/年
                    </span>
                  </div>
                  <span
                    class="text-[8px]"
                    :style="{ color: getAgingIndexColor(calculateAgingIndex(user)) }"
                  >
                    {{ getAgingIndexLabel(calculateAgingIndex(user)) }}
                  </span>
                </div>

                <!-- Selection Indicator -->
                <div v-if="selectedUser === user.id" class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: isBlackGold.value ? '#B8860B' : '#6366f1' }"></div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="filteredUsers.length === 0" class="text-center py-4">
              <Users :size="28" class="text-slate-300 mx-auto mb-2" />
              <p class="text-xs text-slate-500">未找到匹配的用户</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Right Workspace -->
      <div class="flex-1 flex flex-col overflow-hidden" :style="{ background: 'var(--background-page)' }">
        <!-- Empty State -->
        <div v-if="!selectedUser" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" :style="{ background: 'var(--fill)' }">
              <Users :size="32" :style="{ color: 'var(--text-disabled)' }" />
            </div>
            <h3 class="text-base font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">请选择用户</h3>
            <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">从左侧列表选择一位用户查看详情和任务</p>
          </div>
        </div>

        <!-- User Detail Workspace -->
        <div v-else class="flex-1 overflow-y-auto p-3">
          <div class="max-w-7xl mx-auto space-y-3">
            <!-- User Header Card -->
            <div class="rounded-xl shadow-sm p-4" :style="{
              background: 'var(--card)',
              border: '1px solid var(--border)'
            }">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg"
                    :style="currentUser?.avatarColor || { background: 'var(--fill)', color: 'var(--text-secondary)' }"
                  >
                    {{ currentUser?.name?.charAt(0) || '?' }}
                  </div>
                  <div>
                    <div class="flex items-center gap-3 mb-1">
                      <h2 class="text-lg font-bold" :style="{ color: 'var(--text-primary)' }">{{ currentUser?.name }}</h2>
                      <span class="px-2 py-0.5 text-xs font-bold rounded border" :style="{
                        background: isBlackGold.value ? 'rgba(184, 134, 11, 0.15)' : '#eef2ff',
                        color: isBlackGold.value ? '#D4A84A' : '#4f46e5',
                        borderColor: isBlackGold.value ? '#B8860B' : '#c7d2fe'
                      }">
                        {{ currentUser?.level }} 等级
                      </span>
                      <span
                        :class="`px-2 py-0.5 text-xs font-bold rounded-full border flex items-center gap-1 ${
                          currentUser?.status === 'active'
                            ? 'bg-green-50 text-green-600 border-green-100'
                            : 'bg-orange-50 text-orange-600 border-orange-100'
                        }`"
                      >
                        <span class="w-1.5 h-1.5 rounded-full" :class="currentUser?.status === 'active' ? 'bg-green-500' : 'bg-orange-500'"></span>
                        {{ currentUser?.statusText }}
                      </span>
                    </div>
                    <div class="flex items-center gap-3 text-sm text-slate-500">
                      <span>ID: {{ selectedUser }}</span>
                      <span>·</span>
                      <span>{{ currentUser?.tags?.join(' · ') || '' }}</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="goToProfile"
                    class="px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all"
                  >
                    查看档案
                  </button>
                  <button
                    @click="openAIModal"
                    class="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1.5 transition-all"
                  >
                    <BrainCircuit :size="16" />
                    AI处方
                  </button>
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="grid grid-cols-5 gap-3 mt-3 pt-3 border-t border-slate-100">
                <div class="text-center">
                  <p class="text-xl font-bold text-slate-800">{{ userData?.todayTasks || 0 }}</p>
                  <p class="text-xs text-slate-500 mt-1">今日任务</p>
                </div>
                <div class="text-center">
                  <p class="text-xl font-bold text-green-600">{{ userData?.todayCompleted || 0 }}</p>
                  <p class="text-xs text-slate-500 mt-1">已完成</p>
                </div>
                <div class="text-center">
                  <p class="text-xl font-bold text-orange-600">{{ userData?.pendingTasks || 0 }}</p>
                  <p class="text-xs text-slate-500 mt-1">待完成</p>
                </div>
                <div class="text-center">
                  <p class="text-xl font-bold text-indigo-600">{{ userData?.compliance || 0 }}%</p>
                  <p class="text-xs text-slate-500 mt-1">依从性</p>
                </div>
                <div class="text-center">
                  <p class="text-xl font-bold" :class="getRiskColorClass(userData?.metabolicRisk || 0)">
                    {{ getRiskLabel(userData?.metabolicRisk || 0) }}
                  </p>
                  <p class="text-xs text-slate-500 mt-1">代谢风险</p>
                </div>
              </div>
            </div>

            <!-- Alert Banner -->
            <div v-if="hasAlerts" class="bg-red-50 border border-red-100 rounded-xl p-2 flex items-start gap-3">
              <AlertTriangle class="text-red-600 mt-0.5 flex-shrink-0" :size="20" />
              <div class="flex-1">
                <h3 class="font-bold text-red-700 text-sm">{{ alerts[0]?.title }}</h3>
                <p class="text-red-600/80 text-xs mt-1">{{ alerts[0]?.description }}</p>
              </div>
              <button
                @click="handleAlert"
                class="bg-white border border-red-200 text-red-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-100 transition-colors flex-shrink-0"
              >
                去处理
              </button>
            </div>

            <!-- Main Content Grid -->
            <div class="grid grid-cols-12 gap-3">
              <!-- Left Column: Health Dashboard (3 cols) -->
              <div class="col-span-12 md:col-span-3">
                <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Activity :size="16" class="text-indigo-600" />
                      健康指标
                    </h3>
                  </div>

                  <!-- Health Metrics -->
                  <div class="space-y-2">
                    <div>
                      <div class="flex justify-between text-xs mb-1.5">
                        <span class="text-slate-600">代谢风险</span>
                        <span class="font-medium" :class="getRiskColorClass(userData?.metabolicRisk || 0)">
                          {{ getRiskLabel(userData?.metabolicRisk || 0) }}
                        </span>
                      </div>
                      <div class="w-full bg-slate-100 rounded-full h-2">
                        <div
                          class="h-2 rounded-full transition-all"
                          :class="getRiskBarColor(userData?.metabolicRisk || 0)"
                          :style="{ width: `${userData?.metabolicRisk || 0}%` }"
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div class="flex justify-between text-xs mb-1.5">
                        <span class="text-slate-600">依从性</span>
                        <span class="font-medium" :class="getRiskColorClass(userData?.compliance || 0)">
                          {{ userData?.compliance || 0 }}%
                        </span>
                      </div>
                      <div class="w-full bg-slate-100 rounded-full h-2">
                        <div
                          class="h-2 rounded-full transition-all bg-indigo-500"
                          :style="{ width: `${userData?.compliance || 0}%` }"
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div class="flex justify-between text-xs mb-1.5">
                        <span class="text-slate-600">本周完成率</span>
                        <span class="font-medium text-green-600">
                          {{ userData?.weeklyRate || 0 }}%
                        </span>
                      </div>
                      <div class="w-full bg-slate-100 rounded-full h-2">
                        <div
                          class="h-2 rounded-full transition-all bg-green-500"
                          :style="{ width: `${userData?.weeklyRate || 0}%` }"
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div class="flex justify-between text-xs mb-1.5">
                        <span class="text-slate-600">连续打卡</span>
                        <span class="font-medium text-orange-600">
                          {{ userData?.streak || 0 }} 天
                        </span>
                      </div>
                      <div class="w-full bg-slate-100 rounded-full h-2">
                        <div
                          class="h-2 rounded-full transition-all bg-orange-500"
                          :style="{ width: `${Math.min((userData?.streak || 0) * 5, 100)}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>

                  <!-- Recent Data -->
                  <div class="mt-3 pt-3 border-t border-slate-100">
                    <h4 class="text-xs font-semibold text-slate-700 mb-3">最近数据</h4>
                    <div class="space-y-2">
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-slate-500">空腹血糖</span>
                        <span class="font-medium" :class="getGlucoseColor(userData?.lastGlucose || 0)">
                          {{ userData?.lastGlucose || '--' }} mmol/L
                        </span>
                      </div>
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-slate-500">体重</span>
                        <span class="font-medium text-slate-700">
                          {{ userData?.lastWeight || '--' }} kg
                        </span>
                      </div>
                      <div class="flex items-center justify-between text-xs">
                        <span class="text-slate-500">血压</span>
                        <span class="font-medium text-slate-700">
                          {{ userData?.lastBP || '--' }} mmHg
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Center Column: Today's Tasks (6 cols) -->
              <div class="col-span-12 md:col-span-6">
                <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-bold text-slate-800 flex items-center gap-2">
                      <ListTodo :size="18" class="text-indigo-600" />
                      今日任务
                    </h3>
                    <button
                      @click="showAddTaskModal = true"
                      class="text-indigo-600 text-xs font-medium hover:bg-indigo-50 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                    >
                      <Plus :size="14" /> 添加任务
                    </button>
                  </div>

                  <div class="space-y-2">
                    <!-- Blockers Section -->
                    <div v-if="blockers.length > 0">
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                          <ShieldAlert :size="16" class="text-orange-600" />
                          <h4 class="font-bold text-slate-700 text-sm">当前阻塞点</h4>
                          <span class="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                            {{ blockers.length }}
                          </span>
                        </div>
                      </div>
                      <div class="space-y-2">
                        <div
                          v-for="blocker in blockers"
                          :key="blocker.id"
                          class="p-3 rounded-lg border"
                          :class="blocker.resolved ? 'bg-green-50 border-green-100 opacity-60' : 'bg-orange-50 border-orange-100'"
                        >
                          <div class="flex items-start gap-3">
                            <component
                              :is="blocker.source === 'AI' ? Bot : UserCheck"
                              :size="18"
                              :class="blocker.resolved ? 'text-green-600' : 'text-orange-600'"
                            />
                            <div class="flex-1">
                              <div class="flex items-center gap-2 mb-1">
                                <span class="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase"
                                  :class="blocker.source === 'AI' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'">
                                  {{ blocker.source === 'AI' ? 'AI识别' : '教练添加' }}
                                </span>
                                <h4 class="font-bold text-sm" :class="blocker.resolved ? 'text-green-800 line-through' : 'text-orange-800'">
                                  {{ blocker.title }}
                                </h4>
                              </div>
                              <p class="text-xs leading-relaxed" :class="blocker.resolved ? 'text-green-700/60' : 'text-orange-700/80'">
                                {{ blocker.description }}
                              </p>
                            </div>
                            <button
                              v-if="!blocker.resolved"
                              @click="resolveBlocker(blocker.id)"
                              class="px-3 py-1.5 text-xs font-bold rounded shadow-sm border transition-colors bg-white text-orange-600 border-orange-100 hover:bg-orange-50"
                            >
                              处理
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Coach Tasks Section -->
                    <div>
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                          <UserCheck :size="16" class="text-slate-700" />
                          <h4 class="font-bold text-slate-700 text-sm">教练待办</h4>
                          <span class="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                            {{ coachTasks.filter(t => !t.completed).length }}/{{ coachTasks.length }}
                          </span>
                        </div>
                      </div>
                      <div class="space-y-2">
                        <div
                          v-for="task in coachTasks"
                          :key="task.id"
                          @click="toggleCoachTask(task.id)"
                          class="p-3 rounded-lg border transition-all cursor-pointer"
                          :class="task.completed ? 'bg-green-50 border-green-100 opacity-60' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'"
                        >
                          <div class="flex items-start justify-between">
                            <div class="flex items-start gap-3">
                              <div class="mt-0.5">
                                <div
                                  :class="`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                    task.completed ? 'bg-green-500 border-green-500' : 'border-slate-300'
                                  }`"
                                >
                                  <Check v-if="task.completed" :size="10" class="text-white" />
                                </div>
                              </div>
                              <div>
                                <h4 class="text-sm font-bold" :class="task.completed ? 'text-green-700 line-through' : 'text-slate-800'">
                                  {{ task.title }}
                                </h4>
                                <p class="text-xs mt-1" :class="task.completed ? 'text-green-600/60' : 'text-slate-500'">
                                  {{ task.description }}
                                </p>
                                <div class="flex items-center gap-2 mt-2">
                                  <span
                                    :class="`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                      task.priority === 'high'
                                        ? 'bg-red-50 text-red-600'
                                        : task.priority === 'medium'
                                        ? 'bg-orange-50 text-orange-600'
                                        : 'bg-slate-100 text-slate-600'
                                    }`"
                                  >
                                    {{ task.priority === 'high' ? '高优先级' : task.priority === 'medium' ? '中优先级' : '低优先级' }}
                                  </span>
                                  <span class="text-[10px] text-slate-400 flex items-center gap-1">
                                    <Clock :size="10" />
                                    {{ task.deadline }}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div v-if="coachTasks.length === 0" class="text-center py-4 text-slate-400 text-sm">
                          暂无教练待办任务
                        </div>
                      </div>
                    </div>

                    <!-- User Tasks Section -->
                    <div class="pt-4 border-t border-slate-100">
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                          <Calendar :size="16" class="text-indigo-600" />
                          <h4 class="font-bold text-slate-700 text-sm">
                            {{ isRetroactiveMode ? '历史任务' : '用户今日任务' }}
                          </h4>
                          <span class="text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                            {{ userTasks.filter(t => !t.completed).length }}/{{ userTasks.length }}
                          </span>
                        </div>
                      </div>
                      <div class="space-y-2">
                        <div
                          v-for="task in userTasks"
                          :key="task.id"
                          @click="toggleUserTask(task.id)"
                          class="flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer"
                          :class="{
                            'bg-amber-50 border-amber-200': task.completed && task.isRetroactive,
                            'bg-slate-50 border-slate-100': task.completed && !task.isRetroactive,
                            'bg-white border-slate-200 hover:border-indigo-300': !task.completed
                          }"
                        >
                          <div class="w-4 h-4 rounded border flex items-center justify-center transition-all"
                            :class="{
                              'bg-amber-500 border-amber-500 text-white': task.completed && task.isRetroactive,
                              'bg-indigo-500 border-indigo-500 text-white': task.completed && !task.isRetroactive,
                              'border-slate-300 hover:border-indigo-500': !task.completed
                            }">
                            <Check v-if="task.completed" :size="10" />
                          </div>
                          <div class="flex-1">
                            <div class="flex items-center gap-2">
                              <div class="text-xs font-medium" :class="task.completed ? 'text-slate-500 line-through' : 'text-slate-800'">
                                {{ task.title }}
                              </div>
                              <span v-if="task.isRetroactive" class="px-1.5 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-medium rounded border border-amber-200">
                                补卡
                              </span>
                            </div>
                            <div v-if="task.completed && task.completedAt" class="text-[10px] text-slate-400">
                              完成于 {{ task.completedAt }}
                            </div>
                          </div>
                          <span class="text-[10px] text-slate-400 font-mono">{{ task.time }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Habits Section -->
                    <div class="pt-4 border-t border-slate-100">
                      <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                          <Zap :size="16" class="text-amber-500" />
                          <h4 class="font-bold text-slate-700 text-sm">习惯养成</h4>
                        </div>
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <div
                          v-for="habit in habits"
                          :key="habit.id"
                          @click="toggleHabit(habit.id)"
                          class="p-3 rounded-lg border transition-all cursor-pointer"
                          :class="habit.checkedToday ? 'bg-amber-50/50 border-amber-100' : 'bg-white border-slate-200 hover:border-amber-300'"
                        >
                          <div class="flex items-center gap-2 mb-1">
                            <div class="w-4 h-4 rounded-full border flex items-center justify-center transition-all"
                              :class="habit.checkedToday ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300'">
                              <Check v-if="habit.checkedToday" :size="10" />
                            </div>
                            <span class="text-xs font-medium" :class="habit.checkedToday ? 'text-amber-900' : 'text-slate-800'">
                              {{ habit.title }}
                            </span>
                          </div>
                          <div class="flex items-center gap-1 text-[10px] text-amber-600 font-bold">
                            <Zap :size="8" class="fill-amber-600" />
                            {{ habit.streak }}天
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Intervention Map (3 cols) -->
              <div class="col-span-12 md:col-span-3">
                <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Flag :size="16" class="text-indigo-600" />
                      干预地图
                    </h3>
                    <span class="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold border border-indigo-100">
                      {{ currentStage }}
                    </span>
                  </div>

                  <!-- Stage Timeline -->
                  <div class="relative py-2 pl-4 border-l-2 border-slate-100 ml-1 space-y-3">
                    <div
                      v-for="(stage, index) in interventionStages"
                      :key="stage.id"
                      class="relative"
                      :class="stage.completed ? 'opacity-50 grayscale' : stage.active ? '' : 'opacity-40'"
                    >
                      <div class="absolute"
                        :class="stage.completed ? '-left-[21px] top-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white' :
                          stage.active ? '-left-[23px] top-0 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white shadow-sm ring-2 ring-indigo-100' :
                          '-left-[21px] top-0 w-3 h-3 bg-slate-200 rounded-full border-2 border-white'">
                      </div>
                      <div class="text-xs font-bold mb-1" :class="stage.active ? 'text-indigo-700' : 'text-slate-500'">
                        {{ stage.name }}
                      </div>

                      <div v-if="stage.active" class="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 mb-2">
                        <div class="text-[10px] text-indigo-900 font-bold mb-1">{{ stage.goal }}</div>
                        <p class="text-[10px] text-slate-500 leading-tight">{{ stage.description }}</p>
                        <div class="mt-2 flex items-center gap-2">
                          <div class="flex-1 bg-slate-100 rounded-full h-1.5">
                            <div class="bg-indigo-500 h-1.5 rounded-full" :style="{ width: `${stage.progress}%` }"></div>
                          </div>
                          <span class="text-[10px] text-indigo-600 font-bold">{{ stage.progress }}%</span>
                        </div>
                      </div>

                      <div class="text-[10px]" :class="stage.active ? 'text-slate-500' : 'text-slate-400'">
                        {{ stage.completed ? '已完成' : stage.active ? `第 ${stage.currentWeek} 周` : '待解锁' }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Quick Actions -->
                <div class="mt-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <h3 class="font-bold text-slate-800 text-sm mb-3">快捷操作</h3>
                  <div class="space-y-2">
                    <button
                      @click="quickAction('call')"
                      class="w-full px-3 py-2.5 text-sm text-left rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center gap-2"
                    >
                      <Phone :size="16" class="text-indigo-600" />
                      <span class="text-slate-700">发起回访</span>
                    </button>
                    <button
                      @click="quickAction('message')"
                      class="w-full px-3 py-2.5 text-sm text-left rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center gap-2"
                    >
                      <MessageSquare :size="16" class="text-indigo-600" />
                      <span class="text-slate-700">发送消息</span>
                    </button>
                    <button
                      @click="quickAction('report')"
                      class="w-full px-3 py-2.5 text-sm text-left rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center gap-2"
                    >
                      <FileText :size="16" class="text-indigo-600" />
                      <span class="text-slate-700">生成报告</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Task Modal -->
    <Teleport to="body">
      <div v-if="showAddTaskModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" @click.self="showAddTaskModal = false"></div>
      <div v-if="showAddTaskModal" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white rounded-2xl shadow-2xl z-[60]">
        <div class="p-3 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-slate-800">添加教练待办</h3>
          <button @click="showAddTaskModal = false" class="text-slate-400 hover:text-slate-600">
            <X :size="20" />
          </button>
        </div>
        <div class="p-3 space-y-2">
          <input v-model="newTask.title" placeholder="任务标题" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <textarea v-model="newTask.description" placeholder="任务描述" rows="2" class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"></textarea>
          <div class="grid grid-cols-2 gap-2">
            <select v-model="newTask.priority" class="px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="high">高优先级</option>
              <option value="medium">中优先级</option>
              <option value="low">低优先级</option>
            </select>
            <input v-model="newTask.deadline" type="time" class="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <button @click="addCoachTask" :disabled="!newTask.title" class="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            添加任务
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'

// 主题相关
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')
import {
  Users,
  Search,
  Check,
  X,
  Plus,
  Activity,
  ListTodo,
  ShieldAlert,
  UserCheck,
  Calendar,
  Zap,
  Flag,
  Clock,
  Phone,
  MessageSquare,
  FileText,
  BrainCircuit,
  AlertTriangle,
  Bot
} from 'lucide-vue-next'
import DatePickerButton from '../components/shared/DatePickerButton.vue'
import Toast from '../components/shared/Toast.vue'

const router = useRouter()
const route = useRoute()
const toastRef = ref<InstanceType<typeof Toast>>()

// Inject calendar state from App.vue
const calendarState = inject<{
  selectedCalendarDate: ReturnType<typeof ref>
  dateDataMap: ReturnType<typeof ref>
}>('calendarState', null)

// Watch for calendar date changes from App.vue
if (calendarState) {
  watch(() => calendarState.selectedCalendarDate.value, (newDate) => {
    if (newDate) {
      selectedCalendarDate.value = newDate
      // Check if it's a retroactive date
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const threeDaysAgo = new Date(today)
      threeDaysAgo.setDate(today.getDate() - 3)
      const isRetroactive = newDate >= threeDaysAgo && newDate < today
      isRetroactiveMode.value = isRetroactive
      // Load tasks for selected date
      loadTasksForDate(newDate)
    }
  })
}

// Types
interface User {
  id: string
  name: string
  avatarColor: string
  level: string
  status: 'active' | 'warning' | 'inactive'
  statusText: string
  tags: string[]
  alertCount: number
  todayCompleted: number
  todayTasks: number
  taskStatus: 'pending' | 'in-progress' | 'completed'
  age: number
}

interface UserData {
  todayTasks: number
  todayCompleted: number
  pendingTasks: number
  compliance: number
  metabolicRisk: number
  weeklyRate: number
  streak: number
  lastGlucose: number
  lastWeight: number
  lastBP: string
}

interface Blocker {
  id: string
  title: string
  description: string
  source: 'AI' | 'Coach'
  resolved: boolean
}

interface CoachTask {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  deadline: string
  completed: boolean
}

interface UserTask {
  id: string
  title: string
  time: string
  completed: boolean
  isRetroactive?: boolean
  completedAt?: string
}

interface Habit {
  id: string
  title: string
  streak: number
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

// State
const selectedUser = ref<string | null>(null)
const searchQuery = ref('')
const activeFilter = ref<'all' | 'pending' | 'in-progress' | 'completed'>('all')
const showAddTaskModal = ref(false)
const newTask = ref({ title: '', description: '', priority: 'medium' as const, deadline: '09:00' })

// Calendar state
const selectedCalendarDate = ref(new Date())
const isRetroactiveMode = ref(false)

// Date data for calendar (show which days have data)
interface DateData {
  date: string
  hasData: boolean
  completed: boolean
}
const dateDataMap = ref<{ [key: string]: DateData }>({})

// Mock Users Data
const users = ref<User[]>([
  { id: '1', name: '王磊', avatarColor: 'bg-indigo-500', level: 'L1', status: 'active', statusText: '活跃中', tags: ['高风险', '减重'], alertCount: 2, todayCompleted: 5, todayTasks: 8, taskStatus: 'in-progress', age: 38 },
  { id: '2', name: '李淑芬', avatarColor: 'bg-pink-500', level: 'L2', status: 'active', statusText: '活跃中', tags: ['老年', '糖尿病'], alertCount: 0, todayCompleted: 7, todayTasks: 7, taskStatus: 'completed', age: 62 },
  { id: '3', name: '张建国', avatarColor: 'bg-blue-500', level: 'L1', status: 'warning', statusText: '需跟进', tags: ['逾期'], alertCount: 5, todayCompleted: 2, todayTasks: 10, taskStatus: 'in-progress', age: 55 },
  { id: '4', name: '陈静', avatarColor: 'bg-purple-500', level: 'L3', status: 'active', statusText: '活跃中', tags: ['VIP'], alertCount: 1, todayCompleted: 4, todayTasks: 7, taskStatus: 'in-progress', age: 42 },
  { id: '5', name: '刘伟', avatarColor: 'bg-green-500', level: 'L1', status: 'inactive', statusText: '不活跃', tags: ['新用户'], alertCount: 0, todayCompleted: 0, todayTasks: 5, taskStatus: 'pending', age: 35 },
  { id: '6', name: '赵敏', avatarColor: 'bg-orange-500', level: 'L2', status: 'active', statusText: '活跃中', tags: ['减脂'], alertCount: 0, todayCompleted: 6, todayTasks: 8, taskStatus: 'in-progress', age: 28 },
  { id: '7', name: '孙强', avatarColor: 'bg-teal-500', level: 'L1', status: 'warning', statusText: '打卡缺失', tags: ['逾期'], alertCount: 3, todayCompleted: 1, todayTasks: 9, taskStatus: 'in-progress', age: 48 },
  { id: '8', name: '周梅', avatarColor: 'bg-red-500', level: 'L3', status: 'active', statusText: '活跃中', tags: ['VIP'], alertCount: 0, todayCompleted: 8, todayTasks: 6, taskStatus: 'completed', age: 39 }
])

const filterTabs = computed(() => [
  { key: 'all' as const, label: '全部', count: users.value.length },
  { key: 'pending' as const, label: '未处理', count: users.value.filter(u => u.taskStatus === 'pending').length },
  { key: 'in-progress' as const, label: '进程中', count: users.value.filter(u => u.taskStatus === 'in-progress').length },
  { key: 'completed' as const, label: '已完成', count: users.value.filter(u => u.taskStatus === 'completed').length }
])

// Mock User Data Map
const userDataMap = ref<{ [key: string]: UserData }>({
  '1': { todayTasks: 8, todayCompleted: 5, pendingTasks: 3, compliance: 85, metabolicRisk: 75, weeklyRate: 82, streak: 12, lastGlucose: 7.2, lastWeight: 84.5, lastBP: '125/82' },
  '2': { todayTasks: 6, todayCompleted: 7, pendingTasks: 0, compliance: 92, metabolicRisk: 45, weeklyRate: 90, streak: 18, lastGlucose: 6.8, lastWeight: 68.2, lastBP: '118/75' },
  '3': { todayTasks: 10, todayCompleted: 2, pendingTasks: 8, compliance: 65, metabolicRisk: 85, weeklyRate: 55, streak: 3, lastGlucose: 9.5, lastWeight: 92.1, lastBP: '145/92' },
  '4': { todayTasks: 7, todayCompleted: 4, pendingTasks: 3, compliance: 88, metabolicRisk: 55, weeklyRate: 85, streak: 15, lastGlucose: 6.5, lastWeight: 58.3, lastBP: '112/70' },
  '5': { todayTasks: 5, todayCompleted: 0, pendingTasks: 5, compliance: 45, metabolicRisk: 60, weeklyRate: 40, streak: 0, lastGlucose: 0, lastWeight: 0, lastBP: '' },
  '6': { todayTasks: 8, todayCompleted: 6, pendingTasks: 2, compliance: 95, metabolicRisk: 35, weeklyRate: 92, streak: 22, lastGlucose: 5.8, lastWeight: 62.5, lastBP: '108/68' },
  '7': { todayTasks: 9, todayCompleted: 1, pendingTasks: 8, compliance: 58, metabolicRisk: 70, weeklyRate: 50, streak: 5, lastGlucose: 8.1, lastWeight: 88.7, lastBP: '135/88' },
  '8': { todayTasks: 6, todayCompleted: 8, pendingTasks: 0, compliance: 90, metabolicRisk: 40, weeklyRate: 88, streak: 20, lastGlucose: 6.2, lastWeight: 55.8, lastBP: '115/72' }
})

// Blockers Data
const blockersMap = ref<{ [key: string]: Blocker[] }>({
  '1': [
    { id: '1', title: '周末社交聚餐不可控', description: '过去3周周六摄入均超标50%', source: 'AI', resolved: false }
  ],
  '3': [
    { id: '1', title: '情绪性进食风险', description: '用户反馈最近工作压力大', source: 'Coach', resolved: false },
    { id: '2', title: '连续3天未打卡', description: '需要电话跟进', source: 'AI', resolved: false }
  ]
})

// Coach Tasks Map
const coachTasksMap = ref<{ [key: string]: CoachTask[] }>({
  '1': [
    { id: '1', title: '审核昨日晚餐记录', description: '用户备注"吃多了"，需确认', priority: 'high', deadline: '09:00', completed: false },
    { id: '2', title: '发送周末饮食提醒', description: '提前预警周末聚餐风险', priority: 'medium', deadline: '14:00', completed: false }
  ],
  '3': [
    { id: '1', title: '紧急跟进 - 未打卡', description: '连续3天未上传数据，需电话联系', priority: 'high', deadline: '立即', completed: false }
  ]
})

// User Tasks Map
const userTasksMap = ref<{ [key: string]: UserTask[] }>({
  '1': [
    { id: '1', title: '空腹血糖测量', time: '08:00', completed: true },
    { id: '2', title: '早餐打卡', time: '08:30', completed: true },
    { id: '3', title: '午餐打卡', time: '12:30', completed: true },
    { id: '4', title: '晚餐打卡', time: '19:00', completed: false },
    { id: '5', title: '运动30分钟', time: '21:00', completed: false }
  ]
})

// Habits Map
const habitsMap = ref<{ [key: string]: Habit[] }>({
  '1': [
    { id: '1', title: '23:00前入睡', streak: 12, checkedToday: false },
    { id: '2', title: '餐后散步15分钟', streak: 18, checkedToday: true },
    { id: '3', title: '饮水2000ml', streak: 8, checkedToday: false }
  ]
})

// Intervention Stages Map
const interventionStagesMap = ref<{ [key: string]: InterventionStage[] }>({
  '1': [
    { id: '1', name: '启动期 (W1-W2)', goal: '建立基础', description: '建立记录习惯', progress: 100, currentWeek: 0, completed: true, active: false },
    { id: '2', name: '稳定期 (W3-W6)', goal: '控糖饮食', description: '控制晚餐碳水', progress: 50, currentWeek: 3, completed: false, active: true },
    { id: '3', name: '调整期 (W7-W10)', goal: '优化方案', description: '根据反馈调整', progress: 0, currentWeek: 0, completed: false, active: false },
    { id: '4', name: '维持期 (W11+)', goal: '习惯固化', description: '长期生活方式', progress: 0, currentWeek: 0, completed: false, active: false }
  ]
})

// Alerts Map
const alertsMap = ref<{ [key: string]: Array<{title: string, description: string}> }>({
  '1': [{ title: '血糖异常预警', description: '昨日晚餐后血糖14.2，超出目标范围' }],
  '3': [{ title: '依从性下降', description: '连续3天未完成打卡，需要立即跟进' }]
})

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  // 根据任务状态筛选
  if (activeFilter.value === 'pending') {
    filtered = filtered.filter(u => u.taskStatus === 'pending')
  } else if (activeFilter.value === 'in-progress') {
    filtered = filtered.filter(u => u.taskStatus === 'in-progress')
  } else if (activeFilter.value === 'completed') {
    filtered = filtered.filter(u => u.taskStatus === 'completed')
  }

  // 搜索筛选
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.tags.some(t => t.toLowerCase().includes(query))
    )
  }

  return filtered
})

const currentUser = computed(() => users.value.find(u => u.id === selectedUser.value))
const userData = computed(() => {
  if (!selectedUser.value) return null
  return userDataMap.value[selectedUser.value] || {
    todayTasks: 0,
    todayCompleted: 0,
    pendingTasks: 0,
    compliance: 0,
    metabolicRisk: 0,
    weeklyRate: 0,
    streak: 0,
    lastGlucose: 0,
    lastWeight: 0,
    lastBP: ''
  }
})
const blockers = computed(() => selectedUser.value ? blockersMap.value[selectedUser.value] || [] : [])
const coachTasks = computed(() => selectedUser.value ? coachTasksMap.value[selectedUser.value] || [] : [])
const userTasks = computed(() => selectedUser.value ? userTasksMap.value[selectedUser.value] || [] : [])
const habits = computed(() => selectedUser.value ? habitsMap.value[selectedUser.value] || [] : [])
const interventionStages = computed(() => selectedUser.value ? interventionStagesMap.value[selectedUser.value] || [] : [])
const alerts = computed(() => selectedUser.value ? alertsMap.value[selectedUser.value] || [] : [])

const hasAlerts = computed(() => alerts.value.length > 0)
const currentStage = computed(() => interventionStages.value.find(s => s.active)?.name || '未开始')

const currentDate = computed(() => {
  const now = new Date()
  return `${now.getMonth() + 1}月${now.getDate()}日`
})

const currentWeekday = computed(() => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return days[new Date().getDay()]
})

// Calendar related computed
const formattedSelectedDate = computed(() => {
  const date = selectedCalendarDate.value
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = currentWeekday.value
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

// Methods
const selectUser = (userId: string) => {
  selectedUser.value = userId
}

// 计算衰老指数
// 衰老指数含义：年龄每增大一岁，身体年龄增加的数量
// 算法：与任务完成率成反比，完成率越高，衰老指数越低
const calculateAgingIndex = (user: User): number => {
  // 计算今日任务完成率
  const completionRate = user.todayTasks > 0 ? user.todayCompleted / user.todayTasks : 0

  // 算法参数
  const minAgingIndex = 0.2  // 最小衰老指数（即使超额完成，也会有基础衰老）
  const maxAgingIndex = 3.0  // 最大衰老指数（完全不完成时的衰老指数）

  // 将完成率限制在 0% - 120% 之间
  // 超额完成任务（>100%）可以稍微降低衰老指数，但不能低于最小值
  const adjustedRate = Math.max(0, Math.min(completionRate, 1.2))

  // 衰老指数计算公式
  // 完成率0% → 衰老指数3.0
  // 完成率100% → 衰老指数0.3
  // 完成率120% → 衰老指数0.2
  const agingIndex = maxAgingIndex - (adjustedRate * (maxAgingIndex - minAgingIndex) / 1.2)

  // 确保不低于最小值
  const finalAgingIndex = Math.max(minAgingIndex, agingIndex)

  // 保留两位小数
  return Math.round(finalAgingIndex * 100) / 100
}

// 获取衰老指数颜色
const getAgingIndexColor = (agingIndex: number): string => {
  if (agingIndex <= 0.5) return '#16a34a' // 绿色 - 优秀
  if (agingIndex <= 1.2) return '#3b82f6' // 蓝色 - 良好
  if (agingIndex <= 2.0) return '#f59e0b' // 橙色 - 需关注
  return '#ef4444' // 红色 - 危险
}

// 获取衰老指数文本
const getAgingIndexLabel = (agingIndex: number): string => {
  if (agingIndex <= 0.5) return '优秀'
  if (agingIndex <= 1.2) return '良好'
  if (agingIndex <= 2.0) return '需关注'
  return '危险'
}

const goToProfile = () => {
  if (selectedUser.value) {
    // 传递当前路径作为返回参数
    router.push({
      path: `/client-profile/${selectedUser.value}`,
      query: { from: route.fullPath }
    })
  }
}

const openAIModal = () => {
  toastRef.value?.show('AI处方生成功能开发中', 'info')
}

const handleAlert = () => {
  toastRef.value?.show('已创建跟进任务', 'success')
}

const getRiskColorClass = (value: number) => {
  if (value >= 70) return 'text-red-600'
  if (value >= 40) return 'text-orange-500'
  return 'text-emerald-500'
}

const getRiskBarColor = (value: number) => {
  if (value >= 70) return 'bg-red-500'
  if (value >= 40) return 'bg-orange-500'
  return 'bg-emerald-500'
}

const getRiskLabel = (value: number) => {
  if (value >= 70) return '高'
  if (value >= 40) return '中'
  return '良'
}

const getGlucoseColor = (value: number) => {
  if (!value) return 'text-slate-400'
  if (value > 7.0) return 'text-red-600'
  if (value > 6.1) return 'text-orange-500'
  return 'text-emerald-600'
}

const resolveBlocker = (id: string) => {
  if (!selectedUser.value) return
  const blockerList = blockersMap.value[selectedUser.value]
  const blocker = blockerList?.find(b => b.id === id)
  if (blocker) {
    blocker.resolved = true
    toastRef.value?.show('阻塞点已标记为已处理', 'success')
  }
}

const toggleCoachTask = (id: string) => {
  if (!selectedUser.value) return
  const taskList = coachTasksMap.value[selectedUser.value]
  const task = taskList?.find(t => t.id === id)
  if (task) {
    task.completed = !task.completed
  }
}

const toggleUserTask = (id: string) => {
  if (!selectedUser.value) return
  const taskList = userTasksMap.value[selectedUser.value]
  const task = taskList?.find(t => t.id === id)
  if (task) {
    task.completed = !task.completed

    // If completing a task and in retroactive mode, mark it
    if (task.completed && isRetroactiveMode.value) {
      task.isRetroactive = true
      task.completedAt = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      toastRef.value?.show('已补打卡', 'success')
    }

    // Update today completed count and task status
    const user = users.value.find(u => u.id === selectedUser.value)
    if (user) {
      if (task.completed) {
        user.todayCompleted++
      } else {
        user.todayCompleted = Math.max(0, user.todayCompleted - 1)
      }
      // Update task status based on completion
      updateUserTaskStatus(user)
    }
  }
}

// Helper function to update user task status
const updateUserTaskStatus = (user: User) => {
  if (user.todayTasks === 0) {
    user.taskStatus = 'pending'
  } else if (user.todayCompleted >= user.todayTasks) {
    user.taskStatus = 'completed'
  } else if (user.todayCompleted > 0) {
    user.taskStatus = 'in-progress'
  } else {
    user.taskStatus = 'pending'
  }
}

const toggleHabit = (id: string) => {
  if (!selectedUser.value) return
  const habitList = habitsMap.value[selectedUser.value]
  const habit = habitList?.find(h => h.id === id)
  if (habit) {
    habit.checkedToday = !habit.checkedToday
    if (habit.checkedToday) {
      habit.streak++
    } else {
      habit.streak = Math.max(0, habit.streak - 1)
    }
  }
}

const addCoachTask = () => {
  if (!selectedUser.value || !newTask.value.title) return

  if (!coachTasksMap.value[selectedUser.value]) {
    coachTasksMap.value[selectedUser.value] = []
  }

  coachTasksMap.value[selectedUser.value].push({
    id: Date.now().toString(),
    title: newTask.value.title,
    description: newTask.value.description,
    priority: newTask.value.priority,
    deadline: newTask.value.deadline,
    completed: false
  })

  toastRef.value?.show('教练待办已添加', 'success')
  newTask.value = { title: '', description: '', priority: 'medium', deadline: '09:00' }
  showAddTaskModal.value = false
}

const quickAction = (action: string) => {
  const actions = {
    call: '发起回访',
    message: '发送消息',
    report: '生成报告'
  }
  toastRef.value?.show(`${actions[action as keyof typeof actions]}功能开发中`, 'info')
}

// Calendar methods
const handleDateSelect = (date: Date, isRetroactive: boolean) => {
  isRetroactiveMode.value = isRetroactive
  // Load tasks for selected date
  loadTasksForDate(date)
}

const loadTasksForDate = (date: Date) => {
  const dateKey = formatDateKey(date)

  // If data exists for this date, load it
  if (historicalTasksMap.value[dateKey]) {
    loadHistoricalData(dateKey)
  } else {
    // Load current/empty state for this date
    loadCurrentTasks()
  }
}

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Historical data storage
const historicalTasksMap = ref<{ [key: string]: {
  userTasks: UserTask[]
  coachTasks: CoachTask[]
  habits: Habit[]
  userData: UserData
}}>({})

const saveCurrentData = (dateKey: string) => {
  if (!selectedUser.value) return
  historicalTasksMap.value[dateKey] = {
    userTasks: JSON.parse(JSON.stringify(userTasksMap.value[selectedUser.value] || [])),
    coachTasks: JSON.parse(JSON.stringify(coachTasksMap.value[selectedUser.value] || [])),
    habits: JSON.parse(JSON.stringify(habitsMap.value[selectedUser.value] || [])),
    userData: JSON.parse(JSON.stringify(userDataMap.value[selectedUser.value] || {}))
  }
}

const loadHistoricalData = (dateKey: string) => {
  if (!selectedUser.value) return
  const data = historicalTasksMap.value[dateKey]
  if (data) {
    userTasksMap.value[selectedUser.value] = data.userTasks
    coachTasksMap.value[selectedUser.value] = data.coachTasks
    habitsMap.value[selectedUser.value] = data.habits
    userDataMap.value[selectedUser.value] = data.userData
  }
}

const loadCurrentTasks = () => {
  if (!selectedUser.value) return
  // Reset to current tasks (in a real app, this would load today's tasks from API)
  userTasksMap.value[selectedUser.value] = defaultUserTasks.value[selectedUser.value] || []
}

// Default tasks for each user
const defaultUserTasks = ref<{ [key: string]: UserTask[] }>({
  '1': [
    { id: '1', title: '空腹血糖测量', time: '08:00', completed: true },
    { id: '2', title: '早餐打卡', time: '08:30', completed: true },
    { id: '3', title: '午餐打卡', time: '12:30', completed: true },
    { id: '4', title: '晚餐打卡', time: '19:00', completed: false },
    { id: '5', title: '运动30分钟', time: '21:00', completed: false }
  ]
})

const initializeDateDataMap = () => {
  const today = new Date()
  // Mark today as having data
  const todayKey = formatDateKey(today)
  dateDataMap.value[todayKey] = {
    date: todayKey,
    hasData: true,
    completed: false
  }
}

onMounted(() => {
  // Auto select first user (with safety check)
  if (users.value && users.value.length > 0) {
    selectedUser.value = users.value[0].id
  }
  // Initialize date data map
  initializeDateDataMap()
})
</script>
