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
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
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
            <button
              @click="showAgingIndexInfo = true"
              class="p-2 rounded-lg transition-colors flex-shrink-0"
              style="color: var(--text-secondary);"
              @mouseenter="$event.currentTarget.style.backgroundColor = 'var(--fill-light)'"
              @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'"
              title="衰老指数说明"
            >
              <HelpCircle :size="16" />
            </button>
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

        <!-- Sort & View Options -->
        <div class="px-3 py-2" style="border-bottom: '1px solid var(--border-light)';">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[10px]" style="color: var(--text-secondary);">排序：</span>
            <button
              v-for="option in ['完成率', '衰老指数', '任务数']"
              :key="option"
              @click="toggleSort(option)"
              class="px-2 py-1 text-[10px] rounded transition-colors"
              :style="sortBy === option ? {
                color: isBlackGold.value ? '#D4A84A' : '#4f46e5',
                background: isBlackGold.value ? 'rgba(184, 134, 11, 0.1)' : '#eef2ff'
              } : {
                color: 'var(--text-secondary)'
              }"
            >
              {{ option }}
              <span v-if="sortBy === option" class="ml-1">{{ getSortIcon(option) }}</span>
            </button>
            <!-- 取消排序按钮 -->
            <button
              v-if="sortBy"
              @click="clearSort"
              class="px-2 py-1 text-[10px] rounded transition-colors"
              style="color: var(--text-secondary);"
              @mouseenter="$event.currentTarget.style.backgroundColor = 'var(--fill-light)'"
              @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'"
            >
              取消排序
              <X :size="10" class="inline ml-1" />
            </button>
          </div>
        </div>

        <!-- User List -->
        <div class="flex-1 overflow-y-auto">
          <!-- 返回群列表按钮 -->
          <div v-if="selectedGroup" class="p-2">
            <button
              @click="selectedGroup = null"
              class="w-full p-2 rounded-lg text-left text-xs flex items-center gap-2 transition-colors"
              :style="{
                background: 'var(--fill-light)',
                color: 'var(--text-regular)'
              }"
            >
              <ArrowLeft :size="14" />
              <span>返回群列表</span>
            </button>
          </div>

          <div class="p-2 space-y-0.5">
            <!-- 群组列表视图 -->
            <div v-if="!selectedGroup" class="space-y-0.5">
              <div
                v-for="group in groups"
                :key="group.id"
                @click="selectGroup(group)"
                class="p-2.5 rounded-lg cursor-pointer transition-all"
                :style="{
                  border: '1px solid transparent'
                }"
                @mouseenter="$event.currentTarget.style.background = 'var(--fill-light)'"
                @mouseleave="$event.currentTarget.style.background = 'transparent'"
              >
                <div class="flex items-center gap-2">
                  <!-- 群组头像 -->
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" :style="{ background: group.color, color: 'white' }">
                    {{ group.name.charAt(0) }}
                  </div>
                  <!-- 群组信息 -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs font-medium truncate">{{ group.name }}</span>
                      <span class="text-[10px]" :style="{ color: 'var(--text-secondary)' }">{{ group.memberCount }}人</span>
                    </div>
                    <div class="flex items-center gap-1 mt-0.5">
                      <span class="text-[10px]" :style="{ color: 'var(--text-secondary)' }">今日{{ group.todayCompleted }}人已打卡</span>
                    </div>
                  </div>
                  <!-- 完成率 -->
                  <div class="flex flex-col items-end flex-shrink-0 ml-2">
                    <span class="text-xs font-bold" :style="{
                      color: group.completionRate >= 80 ? '#10b981' : group.completionRate >= 60 ? '#f59e0b' : '#ef4444'
                    }">
                      {{ group.completionRate }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 群成员视图 -->
            <div v-else class="space-y-0.5">
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
                      <div class="relative">
                        <!-- 编辑模式 -->
                        <select
                          v-if="editingCompliance"
                          v-model="tempCompliance"
                          @blur="saveCompliance"
                          @keydown.enter="saveCompliance"
                          @keydown.esc="cancelEditCompliance"
                          class="px-2 py-0.5 text-xs font-bold rounded border focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none pr-6"
                          :style="{
                            background: getComplianceColor(tempCompliance).bg,
                            color: getComplianceColor(tempCompliance).text,
                            borderColor: getComplianceColor(tempCompliance).border
                          }"
                          ref="complianceSelect"
                        >
                          <option value="优秀">优秀</option>
                          <option value="良好">良好</option>
                          <option value="一般">一般</option>
                          <option value="较差">较差</option>
                          <option value="未知">未知</option>
                        </select>

                        <!-- 显示模式 -->
                        <span
                          v-else
                          @click="startEditCompliance"
                          class="px-2 py-0.5 text-xs font-bold rounded border cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1"
                          :style="{
                            background: getComplianceColor(userComplianceLevel).bg,
                            color: getComplianceColor(userComplianceLevel).text,
                            borderColor: getComplianceColor(userComplianceLevel).border
                          }"
                          title="点击调整依从度"
                        >
                          依从度 {{ userComplianceLevel }}
                        </span>

                        <!-- 编辑模式下的下拉箭头 -->
                        <svg
                          v-if="editingCompliance"
                          class="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          :style="{ color: getComplianceColor(tempCompliance).text }"
                        >
                          <path d="m6 9 6 6 6-6"></path>
                        </svg>
                      </div>
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
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <!-- 标签列表 - 支持编辑和删除 -->
                        <template v-for="(tag, i) in userTags" :key="i">
                          <!-- 编辑模式 -->
                          <input
                            v-if="editingTagIndex === i"
                            v-model="editingTagValue"
                            @blur="saveEditingTag"
                            @keydown.enter="saveEditingTag"
                            @keydown.esc="cancelEditingTag"
                            class="w-20 px-2 py-0.5 text-xs border border-indigo-300 rounded focus:outline-none"
                            ref="editTagInput"
                          />
                          <!-- 显示模式 -->
                          <div v-else class="group relative">
                            <span
                              @click="startEditingTag(i, tag)"
                              class="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-full text-xs text-slate-600 font-medium hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-pointer"
                            >
                              #{{ tag }}
                            </span>
                            <button
                              @click.stop="deleteTag(i)"
                              class="absolute -top-1.5 -right-1.5 bg-slate-400 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                            >
                              <X :size="8" />
                            </button>
                          </div>
                        </template>

                        <!-- 添加新标签 -->
                        <div v-if="showAddTag" class="flex items-center gap-1">
                          <input
                            v-model="newTag"
                            @keydown.enter="handleAddTag"
                            type="text"
                            class="w-20 px-2 py-0.5 text-xs border border-indigo-300 rounded focus:outline-none"
                            placeholder="输入标签..."
                            ref="addTagInput"
                          />
                          <button @click="handleAddTag" class="text-indigo-600 hover:text-indigo-700">
                            <CheckCircle :size="14" />
                          </button>
                          <button @click="showAddTag = false" class="text-slate-400 hover:text-slate-600">
                            <X :size="14" />
                          </button>
                        </div>

                        <button
                          v-if="!showAddTag"
                          @click="openAddTag"
                          class="px-2 py-0.5 border border-dashed border-slate-300 text-slate-400 rounded-full text-xs hover:text-indigo-600 hover:border-indigo-300 transition-colors flex items-center gap-1"
                        >
                          <Plus :size="12" /> 添加
                        </button>
                      </div>
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
                    @click="sendReminder"
                    :disabled="!selectedUser"
                    class="px-3 py-1.5 text-sm text-white rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    :style="{ background: isBlackGold.value ? 'linear-gradient(135deg, #D4A84A 0%, #B8860B 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }"
                    @mouseenter="!disabled && ($event.currentTarget.style.filter = 'brightness(1.1)')"
                    @mouseleave="!disabled && ($event.currentTarget.style.filter = 'brightness(1)')"
                  >
                    <MessageSquare :size="16" />
                    发送提醒
                  </button>
                  <button
                    @click="quickMarkAllComplete"
                    :disabled="!selectedUser || userData?.pendingTasks === 0"
                    class="px-3 py-1.5 text-sm text-white rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    :style="{ background: isBlackGold.value ? 'linear-gradient(135deg, #D4A84A 0%, #B8860B 100%)' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' }"
                    @mouseenter="!disabled && ($event.currentTarget.style.filter = 'brightness(1.1)')"
                    @mouseleave="!disabled && ($event.currentTarget.style.filter = 'brightness(1)')"
                  >
                    <Check :size="16" />
                    快速完成
                  </button>
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="grid grid-cols-6 gap-3 mt-3 pt-3 border-t border-slate-100">
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
                <div class="text-center">
                  <p class="text-xl font-bold" :style="{ color: getAgingIndexColor(getUserAgingIndex()) }">
                    {{ getUserAgingIndex().toFixed(1) }}
                  </p>
                  <p class="text-xs text-slate-500 mt-1">衰老指数</p>
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

                <!-- Health Data Preview -->
                <div class="mt-3">
                  <HealthDataPreview :user-id="selectedUser" />
                </div>
              </div>

              <!-- Center Column: Today's Tasks (6 cols) -->
              <div class="col-span-12 md:col-span-6">
                <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="font-bold text-slate-800 flex items-center gap-2">
                      <Activity :size="18" class="text-indigo-600" />
                      {{ isToday ? '今日打卡数据' : isRetroactiveMode ? '历史打卡数据（补卡）' : `${selectedCalendarMonth}月${selectedCalendarDay}日打卡数据` }}
                    </h3>
                    <div v-if="!isToday && isRetroactiveMode" class="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded border border-amber-200">
                      <Zap :size="12" />
                      补打卡模式
                    </div>
                  </div>

                  <div class="space-y-3">
                    <!-- 4 Core Data Cards Grid -->
                    <div class="grid grid-cols-2 gap-2">
                      <!-- 饮食拍照 -->
                      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                        <div class="flex items-center gap-2 mb-2">
                          <div class="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                            <Camera :size="16" class="text-white" />
                          </div>
                          <div>
                            <h4 class="text-xs font-bold text-blue-900">饮食拍照</h4>
                            <p class="text-[10px] text-blue-600">今日已上传 {{ mealUploadCount }}/{{ mealUploadTarget }}</p>
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <div class="flex-1 bg-blue-200 rounded-full h-1.5">
                            <div
                              class="bg-blue-500 h-1.5 rounded-full transition-all"
                              :style="{ width: `${(mealUploadCount / mealUploadTarget) * 100}%` }"
                            ></div>
                          </div>
                          <span class="text-xs font-bold text-blue-700">{{ Math.round((mealUploadCount / mealUploadTarget) * 100) }}%</span>
                        </div>
                      </div>

                      <!-- 打卡 -->
                      <div class="bg-gradient-to-br from-purple-50 to-violet-50 p-3 rounded-lg border border-purple-100">
                        <div class="flex items-center gap-2 mb-2">
                          <div class="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                            <CheckCircle2 :size="16" class="text-white" />
                          </div>
                          <div>
                            <h4 class="text-xs font-bold text-purple-900">打卡</h4>
                            <p class="text-[10px] text-purple-600">今日完成 {{ habitCompletedCount }}/{{ habitTotalCount }}</p>
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <div class="flex-1 bg-purple-200 rounded-full h-1.5">
                            <div
                              class="bg-purple-500 h-1.5 rounded-full transition-all"
                              :style="{ width: `${habitTotalCount > 0 ? (habitCompletedCount / habitTotalCount) * 100 : 0}%` }"
                            ></div>
                          </div>
                          <span class="text-xs font-bold text-purple-700">{{ habitTotalCount > 0 ? Math.round((habitCompletedCount / habitTotalCount) * 100) : 0 }}%</span>
                        </div>
                      </div>

                      <!-- 课程学习 -->
                      <div class="bg-gradient-to-br from-teal-50 to-cyan-50 p-3 rounded-lg border border-teal-100">
                        <div class="flex items-center gap-2 mb-2">
                          <div class="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                            <BookOpen :size="16" class="text-white" />
                          </div>
                          <div>
                            <h4 class="text-xs font-bold text-teal-900">课程学习</h4>
                            <p class="text-[10px] text-teal-600">已完成 {{ coursesCompleted }}/{{ coursesTotal }} 课时</p>
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <div class="flex-1 bg-teal-200 rounded-full h-1.5">
                            <div
                              class="bg-teal-500 h-1.5 rounded-full transition-all"
                              :style="{ width: `${(coursesCompleted / coursesTotal) * 100}%` }"
                            ></div>
                          </div>
                          <span class="text-xs font-bold text-teal-700">{{ Math.round((coursesCompleted / coursesTotal) * 100) }}%</span>
                        </div>
                      </div>

                      <!-- 阻碍反馈 -->
                      <div class="bg-gradient-to-br from-rose-50 to-pink-50 p-3 rounded-lg border border-rose-100">
                        <div class="flex items-center gap-2 mb-2">
                          <div class="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
                            <MessageSquare :size="16" class="text-white" />
                          </div>
                          <div>
                            <h4 class="text-xs font-bold text-rose-900">阻碍反馈</h4>
                            <p class="text-[10px] text-rose-600">今日提报 {{ obstacleCount }} 条</p>
                          </div>
                        </div>
                        <div class="flex items-center gap-2">
                          <div class="flex-1">
                            <div class="text-[10px] text-rose-600">{{ obstacleCount > 0 ? '有待处理' : '无阻碍' }}</div>
                          </div>
                          <span class="text-xs font-bold text-rose-700">{{ obstacleCount }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Blockers Section -->
                    <div v-if="blockers.length > 0" class="pt-3 border-t border-slate-100">
                      <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                          <ShieldAlert :size="14" class="text-orange-600" />
                          <h4 class="font-bold text-slate-700 text-xs">饮食打卡阻碍</h4>
                          <span class="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                            {{ blockers.length }}
                          </span>
                        </div>
                      </div>
                      <div class="space-y-1.5">
                        <div
                          v-for="blocker in blockers"
                          :key="blocker.id"
                          class="p-2 rounded-lg border"
                          :class="blocker.resolved ? 'bg-green-50 border-green-100 opacity-60' : 'bg-orange-50 border-orange-100'"
                        >
                          <div class="flex items-start gap-2">
                            <component
                              :is="blocker.source === 'AI' ? Bot : UserCheck"
                              :size="14"
                              :class="blocker.resolved ? 'text-green-600' : 'text-orange-600'"
                            />
                            <div class="flex-1 min-w-0">
                              <div class="flex items-center gap-1.5 mb-0.5">
                                <span class="text-[9px] px-1 py-0.5 rounded font-bold uppercase"
                                  :class="blocker.source === 'AI' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'">
                                  {{ blocker.source === 'AI' ? 'AI识别' : '教练添加' }}
                                </span>
                                <h4 class="text-[11px] font-bold truncate" :class="blocker.resolved ? 'text-green-800 line-through' : 'text-orange-800'">
                                  {{ blocker.title }}
                                </h4>
                              </div>
                              <p class="text-[10px] leading-snug" :class="blocker.resolved ? 'text-green-700/60' : 'text-orange-700/80'">
                                {{ blocker.description }}
                              </p>
                            </div>
                            <button
                              v-if="!blocker.resolved"
                              @click="resolveBlocker(blocker.id)"
                              class="px-2 py-1 text-[10px] font-bold rounded shadow-sm border transition-colors bg-white text-orange-600 border-orange-100 hover:bg-orange-50 flex-shrink-0"
                            >
                              处理
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Empty state when no blockers -->
                    <div v-else class="pt-3 border-t border-slate-100">
                      <div class="text-center py-3">
                        <CheckCircle :size="32" class="text-green-500 mx-auto mb-2" />
                        <p class="text-xs text-slate-500">暂无打卡阻碍</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Calendar and Actions (3 cols) -->
              <div class="col-span-12 md:col-span-3 space-y-3">
                <!-- Check-in Calendar -->
                <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <Calendar :size="16" class="text-indigo-600" />
                      打卡日历
                    </h3>
                    <button
                      @click="handleMonthClick"
                      class="flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors cursor-pointer group"
                      title="点击左侧上个月，点击右侧下个月"
                    >
                      <ChevronLeft
                        :size="12"
                        class="group-hover:-translate-x-0.5 transition-transform"
                        @click.stop="prevMonth"
                      />
                      <span class="min-w-[60px] text-center">{{ viewingMonthLabel }}</span>
                      <ChevronRight
                        :size="12"
                        class="group-hover:translate-x-0.5 transition-transform"
                        @click.stop="nextMonth"
                      />
                    </button>
                  </div>

                  <!-- Calendar Grid -->
                  <div class="space-y-2">
                    <!-- Weekday Headers -->
                    <div class="grid grid-cols-7 gap-1 text-center">
                      <div v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day" class="text-[10px] text-slate-500 font-medium">
                        {{ day }}
                      </div>
                    </div>

                    <!-- Calendar Days -->
                    <div class="grid grid-cols-7 gap-1">
                      <div
                        v-for="date in monthCalendarDays"
                        :key="formatDateKey(date.date)"
                        @click="date.inMonth && selectMonthDate(date.day)"
                        class="aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] cursor-pointer transition-all hover:scale-105"
                        :style="{
                          background: !date.inMonth ? 'transparent' :
                                   date.isSelected ? 'rgba(79, 70, 229, 0.2)' :
                                   date.isToday ? 'rgba(79, 70, 229, 0.1)' :
                                   date.hasData ? 'rgba(16, 185, 129, 0.1)' :
                                   date.canRetroactive ? 'rgba(251, 191, 36, 0.1)' :
                                   'bg-slate-50',
                          color: !date.inMonth ? 'var(--text-disabled)' :
                                 date.isSelected ? '#4f46e5' :
                                 date.isToday ? '#4f46e5' :
                                 date.hasData ? '#10b981' :
                                 date.canRetroactive ? '#d97706' :
                                 'var(--text-regular)',
                          border: !date.inMonth ? 'none' :
                                  date.isSelected ? '2px solid #4f46e5' :
                                  date.isToday ? '1px solid #4f46e5' :
                                  date.hasData ? '1px solid #10b981' :
                                  date.canRetroactive ? '1px solid #fbbf24' : 'none',
                          opacity: date.inMonth ? 1 : 0.3
                        }"
                      >
                        <span class="font-medium">{{ date.day }}</span>
                        <span v-if="date.hasData && date.inMonth" class="text-[8px] mt-0.5">✓</span>
                        <span v-else-if="!date.hasData && date.inMonth" class="text-[8px] mt-0.5" style="color: var(--text-disabled);">○</span>
                      </div>
                    </div>

                    <!-- Legend and Quick Actions -->
                    <div class="flex items-center justify-between pt-2 text-[9px]">
                      <div class="flex items-center gap-3">
                        <div class="flex items-center gap-1">
                          <div class="w-3 h-3 rounded" style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981;"></div>
                          <span class="text-slate-500">已完成</span>
                        </div>
                        <div class="flex items-center gap-1">
                          <div class="w-3 h-3 rounded" style="background: rgba(251, 191, 36, 0.1); border: 1px solid #fbbf24;"></div>
                          <span class="text-slate-500">可补卡</span>
                        </div>
                        <div class="flex items-center gap-1">
                          <div class="w-3 h-3 rounded" style="background: rgba(79, 70, 229, 0.1); border: 1px solid #4f46e5;"></div>
                          <span class="text-slate-500">今天</span>
                        </div>
                      </div>
                      <button
                        @click="goToToday"
                        class="text-[10px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        回到今天
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
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

    <!-- 衰老指数说明弹窗 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showAgingIndexInfo"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          style="background-color: rgba(0, 0, 0, 0.5);"
          @click.self="showAgingIndexInfo = false"
        >
          <div
            class="w-full max-w-lg rounded-xl shadow-2xl"
            style="background-color: var(--card);"
          >
            <!-- Header -->
            <div class="flex items-center justify-between p-4" style="border-bottom: 1px solid var(--border);">
              <div class="flex items-center gap-2">
                <Info :size="20" :style="{ color: '#3b82f6' }" />
                <h3 class="text-lg font-bold" style="color: var(--text-primary);">什么是衰老指数？</h3>
              </div>
              <button
                @click="showAgingIndexInfo = false"
                class="p-1 rounded-lg transition-colors"
                style="color: var(--text-secondary);"
                @mouseenter="$event.currentTarget.style.backgroundColor = 'var(--fill-light)'"
                @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'"
              >
                <X :size="18" />
              </button>
            </div>

            <!-- Content -->
            <div class="p-4 space-y-4" style="color: var(--text-primary);">
              <!-- 定义 -->
              <div class="p-3 rounded-lg" style="background-color: var(--fill-light);">
                <p class="text-sm font-medium mb-1" style="color: var(--text-primary);">
                  📖 定义
                </p>
                <p class="text-xs leading-relaxed" style="color: var(--text-secondary);">
                  衰老指数表示：<span class="font-bold" style="color: var(--text-primary);">年龄每增长1岁，身体年龄实际增加的岁数</span>
                </p>
              </div>

              <!-- 举例说明 -->
              <div class="p-3 rounded-lg" style="background-color: var(--fill-light);">
                <p class="text-sm font-medium mb-2" style="color: var(--text-primary);">
                  💡 举例说明
                </p>
                <ul class="text-xs space-y-2" style="color: var(--text-secondary);">
                  <li class="flex items-start gap-2">
                    <span class="font-bold" style="color: '#16a34a';">0.2 岁/年</span>
                    <span>：实际年龄长1岁，身体只长0.2岁（非常健康）</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="font-bold" style="color: '#3b82f6';">1.0 岁/年</span>
                    <span>：实际年龄长1岁，身体也长1岁（正常衰老）</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="font-bold" style="color: '#ef4444';">3.0 岁/年</span>
                    <span>：实际年龄长1岁，身体长3岁（快速衰老）</span>
                  </li>
                </ul>
              </div>

              <!-- 计算方式 -->
              <div class="p-3 rounded-lg" style="background-color: var(--fill-light);">
                <p class="text-sm font-medium mb-2" style="color: var(--text-primary);">
                  📊 计算方式
                </p>
                <p class="text-xs leading-relaxed" style="color: var(--text-secondary);">
                  衰老指数与<span class="font-medium" style="color: var(--text-primary);">每日任务完成率</span>相关：
                </p>
                <ul class="text-xs mt-2 space-y-1" style="color: var(--text-secondary);">
                  <li>✅ 完成率越高，衰老指数越低（身体越年轻）</li>
                  <li>❌ 完成率越低，衰老指数越高（身体衰老越快）</li>
                  <li>🎯 即使超额完成任务，衰老指数也不会低于0.2</li>
                </ul>
              </div>

              <!-- 评级标准 -->
              <div class="p-3 rounded-lg" style="background-color: var(--fill-light);">
                <p class="text-sm font-medium mb-2" style="color: var(--text-primary);">
                  🏆 评级标准
                </p>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div class="flex items-center gap-2 p-2 rounded" style="background-color: 'rgba(22, 163, 74, 0.1)';">
                    <span class="w-2 h-2 rounded-full" style="background-color: '#16a34a';"></span>
                    <span style="color: '#16a34a';">优秀</span>
                    <span style="color: var(--text-secondary);">≤0.5</span>
                  </div>
                  <div class="flex items-center gap-2 p-2 rounded" style="background-color: 'rgba(59, 130, 246, 0.1)';">
                    <span class="w-2 h-2 rounded-full" style="background-color: '#3b82f6';"></span>
                    <span style="color: '#3b82f6';">良好</span>
                    <span style="color: var(--text-secondary);">0.5-1.2</span>
                  </div>
                  <div class="flex items-center gap-2 p-2 rounded" style="background-color: 'rgba(245, 158, 11, 0.1)';">
                    <span class="w-2 h-2 rounded-full" style="background-color: '#f59e0b';"></span>
                    <span style="color: '#f59e0b';">需关注</span>
                    <span style="color: var(--text-secondary);">1.2-2.0</span>
                  </div>
                  <div class="flex items-center gap-2 p-2 rounded" style="background-color: 'rgba(239, 68, 68, 0.1)';">
                    <span class="w-2 h-2 rounded-full" style="background-color: '#ef4444';"></span>
                    <span style="color: '#ef4444';">危险</span>
                    <span style="color: var(--text-secondary);">>2.0</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-3 flex justify-end" style="border-top: 1px solid var(--border);">
              <button
                @click="showAgingIndexInfo = false"
                class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style="color: white; background-color: #3b82f6;"
                @mouseenter="$event.currentTarget.style.backgroundColor = '#2563eb'"
                @mouseleave="$event.currentTarget.style.backgroundColor = '#3b82f6'"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toast -->
    <Toast ref="toastRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useUserTags } from '../composables/useUserTags'
import { useUserCompliance } from '../composables/useUserCompliance'
import type { ComplianceLevel } from '../composables/useUserCompliance'

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
  Bot,
  HelpCircle,
  Info,
  ArrowLeft,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Camera,
  BookOpen
} from 'lucide-vue-next'
import DatePickerButton from '../components/shared/DatePickerButton.vue'
import Toast from '../components/shared/Toast.vue'
import HealthDataPreview from '../components/HealthDataPreview.vue'

const router = useRouter()
const route = useRoute()
const toastRef = ref<InstanceType<typeof Toast>>()

// User tags management
const {
  getUserTags,
  addUserTag,
  removeUserTag,
  updateUserTag,
  initUserTags
} = useUserTags()

// User compliance management
const {
  getUserCompliance,
  setUserCompliance,
  getComplianceColor,
  initUserCompliance
} = useUserCompliance()

// 标签编辑状态
const editingTagIndex = ref<number | null>(null)
const editingTagValue = ref('')
const showAddTag = ref(false)
const newTag = ref('')
const editTagInput = ref<HTMLInputElement>()
const addTagInput = ref<HTMLInputElement>()

// 依从度编辑状态
const editingCompliance = ref(false)
const tempCompliance = ref<ComplianceLevel>('未知')
const complianceSelect = ref<HTMLSelectElement>()

// 获取当前用户的标签
const userTags = computed(() => {
  if (!selectedUser.value) return []
  const tags = getUserTags(selectedUser.value)
  // 如果没有标签，初始化为用户的tags
  if (tags.length === 0) {
    const user = users.value.find(u => u.id === selectedUser.value)
    if (user && user.tags && user.tags.length > 0) {
      initUserTags(selectedUser.value, user.tags)
      return user.tags
    }
  }
  return tags
})

// 获取当前用户的依从度等级
const userComplianceLevel = computed(() => {
  if (!selectedUser.value) return '未知'
  return getUserCompliance(selectedUser.value)
})

// 标签编辑方法
const startEditingTag = (index: number, value: string) => {
  editingTagIndex.value = index
  editingTagValue.value = value
  nextTick(() => {
    editTagInput.value?.focus()
  })
}

const saveEditingTag = () => {
  if (editingTagIndex.value !== null && editingTagValue.value.trim() && selectedUser.value) {
    updateUserTag(selectedUser.value, editingTagIndex.value, editingTagValue.value.trim())
    editingTagIndex.value = null
    toastRef.value?.success('标签已更新')
  }
}

const cancelEditingTag = () => {
  editingTagIndex.value = null
  editingTagValue.value = ''
}

const deleteTag = (index: number) => {
  if (selectedUser.value) {
    removeUserTag(selectedUser.value, index)
    toastRef.value?.success('标签已删除')
  }
}

const openAddTag = () => {
  showAddTag.value = true
  nextTick(() => {
    addTagInput.value?.focus()
  })
}

const handleAddTag = () => {
  if (newTag.value.trim() && selectedUser.value) {
    addUserTag(selectedUser.value, newTag.value.trim())
    newTag.value = ''
    showAddTag.value = false
    toastRef.value?.success('标签已添加')
  }
}

// 依从度编辑方法
const startEditCompliance = () => {
  if (!selectedUser.value) return
  tempCompliance.value = userComplianceLevel.value
  editingCompliance.value = true
  nextTick(() => {
    complianceSelect.value?.focus()
  })
}

const saveCompliance = () => {
  if (selectedUser.value && tempCompliance.value !== userComplianceLevel.value) {
    setUserCompliance(selectedUser.value, tempCompliance.value)
    toastRef.value?.success(`依从度已更新为：${tempCompliance.value}`)
  }
  editingCompliance.value = false
}

const cancelEditCompliance = () => {
  tempCompliance.value = userComplianceLevel.value
  editingCompliance.value = false
}

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
  lastDeviceSync: Date
  mealUploadCount?: number
  calorieIntake?: number
  nutrientProtein?: number
  nutrientCarbs?: number
  nutrientFat?: number
  coursesCompleted?: number
  coursesTotal?: number
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
const sortBy = ref<'完成率' | '衰老指数' | '任务数' | null>(null)
const sortOrder = ref<'asc' | 'desc'>('desc')
const showAddTaskModal = ref(false)

// Initialize user tags when selected user changes
watch(selectedUser, (newUserId) => {
  if (newUserId) {
    const user = users.value.find(u => u.id === newUserId)

    // 初始化标签
    if (user && user.tags && user.tags.length > 0) {
      // 只在首次加载时初始化，避免覆盖用户编辑的标签
      if (getUserTags(newUserId).length === 0) {
        initUserTags(newUserId, user.tags)
      }
    }

    // 初始化依从度
    const userData = userDataMap.value[newUserId]
    if (userData && userData.compliance) {
      initUserCompliance(newUserId, userData.compliance)
    }
  }
}, { immediate: true })
const newTask = ref({ title: '', description: '', priority: 'medium' as const, deadline: '09:00' })
const showAgingIndexInfo = ref(false)

// 群组相关state
const selectedGroup = ref<Group | null>(null)

// 群组类型定义
interface Group {
  id: string
  name: string
  color: string
  memberCount: number
  completionRate: number
  todayCompleted: number
  memberIds: string[]
}

// 群组数据
const groups = ref<Group[]>([
  {
    id: '1',
    name: '糖尿病管理A组',
    color: '#4f46e5',
    memberCount: 3,
    completionRate: 75,
    todayCompleted: 2,
    memberIds: ['1', '2', '3']
  },
  {
    id: '2',
    name: '减脂塑形B组',
    color: '#10b981',
    memberCount: 3,
    completionRate: 82,
    todayCompleted: 3,
    memberIds: ['4', '6', '8']
  },
  {
    id: '3',
    name: '慢病康复C组',
    color: '#f97316',
    memberCount: 2,
    completionRate: 68,
    todayCompleted: 1,
    memberIds: ['5', '7']
  }
])

// Calendar state
const selectedCalendarDate = ref(new Date())
const isRetroactiveMode = ref(false)

// Month calendar view state
const viewingMonth = ref(new Date().getMonth())
const viewingYear = ref(new Date().getFullYear())

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
  '1': { todayTasks: 8, todayCompleted: 5, pendingTasks: 3, compliance: 85, metabolicRisk: 75, weeklyRate: 82, streak: 12, lastGlucose: 7.2, lastWeight: 84.5, lastBP: '125/82', lastDeviceSync: new Date(), mealUploadCount: 3, calorieIntake: 1450, nutrientProtein: 65, nutrientCarbs: 180, nutrientFat: 45, coursesCompleted: 5, coursesTotal: 12 },
  '2': { todayTasks: 6, todayCompleted: 7, pendingTasks: 0, compliance: 92, metabolicRisk: 45, weeklyRate: 90, streak: 18, lastGlucose: 6.8, lastWeight: 68.2, lastBP: '118/75', lastDeviceSync: new Date(Date.now() - 86400000), mealUploadCount: 4, calorieIntake: 1650, nutrientProtein: 72, nutrientCarbs: 195, nutrientFat: 50, coursesCompleted: 8, coursesTotal: 12 },
  '3': { todayTasks: 10, todayCompleted: 2, pendingTasks: 8, compliance: 65, metabolicRisk: 85, weeklyRate: 55, streak: 3, lastGlucose: 9.5, lastWeight: 92.1, lastBP: '145/92', lastDeviceSync: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), mealUploadCount: 1, calorieIntake: 2100, nutrientProtein: 55, nutrientCarbs: 280, nutrientFat: 70, coursesCompleted: 2, coursesTotal: 12 },
  '4': { todayTasks: 7, todayCompleted: 4, pendingTasks: 3, compliance: 88, metabolicRisk: 55, weeklyRate: 85, streak: 15, lastGlucose: 6.5, lastWeight: 58.3, lastBP: '112/70', lastDeviceSync: new Date(), mealUploadCount: 3, calorieIntake: 1380, nutrientProtein: 58, nutrientCarbs: 170, nutrientFat: 42, coursesCompleted: 6, coursesTotal: 12 },
  '5': { todayTasks: 5, todayCompleted: 0, pendingTasks: 5, compliance: 45, metabolicRisk: 60, weeklyRate: 40, streak: 0, lastGlucose: 0, lastWeight: 0, lastBP: '', lastDeviceSync: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), mealUploadCount: 0, calorieIntake: 0, nutrientProtein: 0, nutrientCarbs: 0, nutrientFat: 0, coursesCompleted: 1, coursesTotal: 12 },
  '6': { todayTasks: 8, todayCompleted: 6, pendingTasks: 2, compliance: 95, metabolicRisk: 35, weeklyRate: 92, streak: 22, lastGlucose: 5.8, lastWeight: 62.5, lastBP: '108/68', lastDeviceSync: new Date(), mealUploadCount: 4, calorieIntake: 1720, nutrientProtein: 78, nutrientCarbs: 205, nutrientFat: 52, coursesCompleted: 10, coursesTotal: 12 },
  '7': { todayTasks: 9, todayCompleted: 1, pendingTasks: 8, compliance: 58, metabolicRisk: 70, weeklyRate: 50, streak: 5, lastGlucose: 8.1, lastWeight: 88.7, lastBP: '135/88', lastDeviceSync: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), mealUploadCount: 2, calorieIntake: 1250, nutrientProtein: 45, nutrientCarbs: 150, nutrientFat: 38, coursesCompleted: 3, coursesTotal: 12 },
  '8': { todayTasks: 6, todayCompleted: 8, pendingTasks: 0, compliance: 90, metabolicRisk: 40, weeklyRate: 88, streak: 20, lastGlucose: 6.2, lastWeight: 55.8, lastBP: '115/72', lastDeviceSync: new Date(), mealUploadCount: 4, calorieIntake: 1550, nutrientProtein: 68, nutrientCarbs: 188, nutrientFat: 48, coursesCompleted: 9, coursesTotal: 12 }
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

  // 如果选择了群组，只显示该群组的成员
  if (selectedGroup.value) {
    filtered = filtered.filter(u => selectedGroup.value?.memberIds.includes(u.id))
  }

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

  // 排序
  if (sortBy.value) {
    filtered = filtered.slice().sort((a, b) => {
      let comparison = 0

      if (sortBy.value === '完成率') {
        const rateA = a.todayTasks > 0 ? a.todayCompleted / a.todayTasks : 0
        const rateB = b.todayTasks > 0 ? b.todayCompleted / b.todayTasks : 0
        comparison = rateA - rateB
      } else if (sortBy.value === '衰老指数') {
        comparison = calculateAgingIndex(a) - calculateAgingIndex(b)
      } else if (sortBy.value === '任务数') {
        comparison = a.todayTasks - b.todayTasks
      }

      // 根据排序方向返回结果
      return sortOrder.value === 'asc' ? comparison : -comparison
    })
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

// 4核心数据卡片计算属性
const mealUploadCount = computed(() => {
  if (!selectedUser.value) return 0
  const userData = userDataMap.value[selectedUser.value]
  return userData?.mealUploadCount || 3
})

const mealUploadTarget = computed(() => {
  if (!selectedUser.value) return 4
  return 4 // 早中晚+加餐
})

const calorieIntake = computed(() => {
  if (!selectedUser.value) return 0
  const userData = userDataMap.value[selectedUser.value]
  return userData?.calorieIntake || 1450
})

const calorieTarget = computed(() => {
  if (!selectedUser.value) return 1800
  return 1800
})

const nutrientProtein = computed(() => {
  if (!selectedUser.value) return 0
  const userData = userDataMap.value[selectedUser.value]
  return userData?.nutrientProtein || 65
})

const nutrientCarbs = computed(() => {
  if (!selectedUser.value) return 0
  const userData = userDataMap.value[selectedUser.value]
  return userData?.nutrientCarbs || 180
})

const nutrientFat = computed(() => {
  if (!selectedUser.value) return 0
  const userData = userDataMap.value[selectedUser.value]
  return userData?.nutrientFat || 45
})

const habitCompletedCount = computed(() => {
  if (!selectedUser.value) return 0
  const userHabits = habits.value
  return userHabits.filter(h => h.checkedToday).length
})

const habitTotalCount = computed(() => {
  if (!selectedUser.value) return 0
  return habits.value.length
})

// 课程学习数据
const coursesCompleted = computed(() => {
  if (!selectedUser.value) return 0
  const userData = userDataMap.value[selectedUser.value]
  return userData?.coursesCompleted || 5
})

const coursesTotal = computed(() => {
  if (!selectedUser.value) return 12
  return 12
})

// 阻碍反馈数据
const obstacleCount = computed(() => {
  return blockers.value.length
})

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

// 日历相关计算属性
const currentMonth = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月`
})

// 月历视图相关计算属性
const viewingMonthLabel = computed(() => {
  return `${viewingYear.value}年${viewingMonth.value + 1}月`
})

const monthCalendarDays = computed(() => {
  const firstDay = new Date(viewingYear.value, viewingMonth.value, 1)
  const lastDay = new Date(viewingYear.value, viewingMonth.value + 1, 0)
  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const days: Array<{
    day: number
    inMonth: boolean
    isToday: boolean
    isSelected: boolean
    hasData: boolean
    canRetroactive: boolean
    date: Date
  }> = []

  // 填充上个月的日期
  const prevMonthLastDay = new Date(viewingYear.value, viewingMonth.value, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = new Date(viewingYear.value, viewingMonth.value - 1, day)
    days.push({
      day,
      inMonth: false,
      isToday: false,
      isSelected: false,
      hasData: false,
      canRetroactive: false,
      date
    })
  }

  // 填充当月的日期
  const today = new Date()
  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(today.getDate() - 3)
  threeDaysAgo.setHours(0, 0, 0, 0)

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(viewingYear.value, viewingMonth.value, i)
    const dateKey = formatDateKey(date)

    // 获取该日期的数据完成状态
    const userData = userDataMap.value[selectedUser.value]
    const baseCompletionRate = userData ? userData.compliance : 50
    const isToday = isSameDay(date, today)
    const isSelected = isSameDay(date, selectedCalendarDate.value)

    // 判断是否完成（模拟数据）
    const completed = isToday
      ? (userData ? userData.todayCompleted === userData.todayTasks : false)
      : Math.random() * 100 < baseCompletionRate

    // 判断是否可补卡（3天内的历史日期）
    const canRetroactive = date >= threeDaysAgo && date < today && !isToday

    days.push({
      day: i,
      inMonth: true,
      isToday,
      isSelected,
      hasData: completed,
      canRetroactive,
      date
    })
  }

  return days
})

// 月历导航方法
const prevMonth = () => {
  if (viewingMonth.value === 0) {
    viewingMonth.value = 11
    viewingYear.value--
  } else {
    viewingMonth.value--
  }
}

const nextMonth = () => {
  if (viewingMonth.value === 11) {
    viewingMonth.value = 0
    viewingYear.value++
  } else {
    viewingMonth.value++
  }
}

const handleMonthClick = (event: MouseEvent) => {
  const button = event.currentTarget as HTMLElement
  const rect = button.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const centerX = rect.width / 2

  // 点击左半边上个月，右半边下个月
  if (clickX < centerX) {
    prevMonth()
  } else {
    nextMonth()
  }
}

const goToToday = () => {
  const today = new Date()
  viewingMonth.value = today.getMonth()
  viewingYear.value = today.getFullYear()
  selectedCalendarDate.value = today

  // 检查是否是补打卡日期
  today.setHours(0, 0, 0, 0)
  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(today.getDate() - 3)
  isRetroactiveMode.value = false

  // 同步到calendarState
  if (calendarState) {
    calendarState.selectedCalendarDate.value = today
  }

  // 加载今天的任务
  loadTasksForDate(today)
}

const selectMonthDate = (day: number) => {
  const date = new Date(viewingYear.value, viewingMonth.value, day)

  // 更新选中的日期
  selectedCalendarDate.value = date

  // 检查是否是补打卡日期
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(today.getDate() - 3)
  const isRetroactive = date >= threeDaysAgo && date < today
  isRetroactiveMode.value = isRetroactive

  // 同步到calendarState
  if (calendarState) {
    calendarState.selectedCalendarDate.value = date
  }

  // 加载选中日期的任务
  loadTasksForDate(date)
}

interface CalendarDay {
  day: number
  isToday: boolean
  inMonth: boolean
  completed: boolean
  date: Date
  fullDate: string
}

// 辅助函数：格式化日期为key
const formatDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 辅助函数：比较两个日期是否是同一天
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

// Calendar related computed
const formattedSelectedDate = computed(() => {
  const date = selectedCalendarDate.value
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekday = currentWeekday.value
  return `${year}年${month}月${day}日 ${weekday}`
})

const selectedCalendarMonth = computed(() => selectedCalendarDate.value.getMonth() + 1)
const selectedCalendarDay = computed(() => selectedCalendarDate.value.getDate())

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
const selectGroup = (group: Group) => {
  selectedGroup.value = group
  selectedUser.value = null // 清除选中的用户
}

const selectUser = (userId: string) => {
  selectedUser.value = userId
}

// 选择日历日期
const selectCalendarDate = (calendarDay: CalendarDay) => {
  if (!calendarDay.inMonth) return // 只允许选择当月日期

  const newDate = calendarDay.date
  selectedCalendarDate.value = newDate

  // 检查是否是补打卡日期
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const threeDaysAgo = new Date(today)
  threeDaysAgo.setDate(today.getDate() - 3)
  const isRetroactive = newDate >= threeDaysAgo && newDate < today
  isRetroactiveMode.value = isRetroactive

  // 同步到calendarState
  if (calendarState) {
    calendarState.selectedCalendarDate.value = newDate
  }

  // 加载选中日期的任务
  loadTasksForDate(newDate)
}

// 切换排序
const toggleSort = (field: '完成率' | '衰老指数' | '任务数') => {
  if (sortBy.value === field) {
    // 如果点击的是当前排序字段，切换排序方向
    if (sortOrder.value === 'desc') {
      sortOrder.value = 'asc'
    } else {
      // 如果是升序，取消排序
      sortBy.value = null
      sortOrder.value = 'desc'
    }
  } else {
    // 如果点击的是新字段，设置为倒序
    sortBy.value = field
    sortOrder.value = 'desc'
  }
}

// 取消排序
const clearSort = () => {
  sortBy.value = null
  sortOrder.value = 'desc'
}

// 获取排序图标
const getSortIcon = (field: '完成率' | '衰老指数' | '任务数') => {
  if (sortBy.value !== field) return ''
  return sortOrder.value === 'desc' ? '↓' : '↑'
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

// 获取当前用户的衰老指数
const getUserAgingIndex = (): number => {
  const user = users.value.find(u => u.id === selectedUser.value)
  return user ? calculateAgingIndex(user) : 0
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

// 快速完成所有待完成任务
const quickMarkAllComplete = () => {
  if (!selectedUser.value) return

  const userTasks = userTasksMap.value[selectedUser.value]
  if (userTasks) {
    // 标记所有未完成的任务为已完成
    userTasks.forEach(task => {
      if (!task.completed) {
        task.completed = true
        task.completedAt = new Date().toISOString()
      }
    })

    // 更新用户状态
    const user = users.value.find(u => u.id === selectedUser.value)
    if (user) {
      user.todayCompleted = user.todayTasks
      user.taskStatus = 'completed'
    }

    // 更新用户数据
    const userData = userDataMap.value[selectedUser.value]
    if (userData) {
      userData.todayCompleted = userData.todayTasks
      userData.pendingTasks = 0
    }

    toastRef.value?.success(`已将${currentUser.value?.name}的所有任务标记为完成`)
  }
}

// 发送打卡提醒
const sendReminder = () => {
  if (!selectedUser.value) return

  const user = users.value.find(u => u.id === selectedUser.value)
  if (user) {
    // 模拟发送提醒
    toastRef.value?.success(`已向${user.name}发送打卡提醒`)

    // 可以在这里添加实际的提醒发送逻辑
    // 例如调用API发送短信、推送通知等
  }
}

const handleAlert = () => {
  // 跳转到血糖详情页面
  if (selectedUser.value) {
    router.push({
      path: '/blood-glucose-detail',
      query: {
        clientId: selectedUser.value,
        from: 'batch-processor'
      }
    })
  } else {
    toastRef.value?.warning('请先选择一个用户')
  }
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
    toastRef.value?.success('阻塞点已标记为已处理')
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
      toastRef.value?.success('已补打卡')
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

  toastRef.value?.success('教练待办已添加')
  newTask.value = { title: '', description: '', priority: 'medium', deadline: '09:00' }
  showAddTaskModal.value = false
}

const quickAction = (action: string) => {
  const actions = {
    call: '发起回访',
    message: '发送消息',
    report: '生成报告'
  }
  toastRef.value?.info(`${actions[action as keyof typeof actions]}功能开发中`)
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
