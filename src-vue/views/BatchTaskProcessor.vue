<template>
  <div class="flex flex-col h-full animate-in fade-in duration-500" :style="{ background: 'var(--background-page)' }">

    <!-- 全局 Toast 提示组件 -->
    <div v-if="toast" class="fixed top-8 right-1/2 translate-x-1/2 bg-slate-800/95 backdrop-blur-sm text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-top-10 duration-300">
      <CheckCircle2 :size="20" class="text-green-400" />
      <span class="font-medium">{{ toast }}</span>
    </div>
    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Left Sidebar: User List (Single Selection) -->
      <aside
        class="flex flex-col flex-shrink-0 transition-all duration-300"
        :class="isSidebarCollapsed ? 'w-16' : 'w-64'"
        :style="{
          background: 'var(--card)',
          borderRight: '1px solid var(--border)'
        }"
      >
        <!-- Sidebar Header -->
        <div class="flex items-center gap-2" :class="isSidebarCollapsed ? 'p-3 justify-center' : 'p-3'" :style="{ borderBottom: '1px solid var(--border-light)' }">
          <!-- Collapse Button -->
          <button
            @click="isSidebarCollapsed = !isSidebarCollapsed"
            class="p-2 rounded-lg transition-colors flex-shrink-0"
            style="color: var(--text-secondary);"
            @mouseenter="$event.currentTarget.style.backgroundColor = 'var(--fill-light)'"
            @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'"
            :title="isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
          >
            <ChevronLeft v-if="!isSidebarCollapsed" :size="16" />
            <ChevronRight v-else :size="16" />
          </button>
          <!-- Search Bar -->
          <div v-if="!isSidebarCollapsed" class="relative flex-1">
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
          <!-- Aging Index Info Button -->
          <button
            v-if="!isSidebarCollapsed"
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

        <!-- Filter Tabs -->
        <div v-if="!isSidebarCollapsed" class="flex" :style="{ borderBottom: '1px solid var(--border-light)' }">
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
        <div v-if="!isSidebarCollapsed" class="px-3 py-2" style="border-bottom: '1px solid var(--border-light)';">
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
        <div class="flex-1 overflow-y-auto" :class="{ 'p-2': isSidebarCollapsed }">
          <!-- 返回群列表按钮 -->
          <div v-if="selectedGroup && !isSidebarCollapsed" class="p-2">
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

          <div class="p-2 space-y-0.5" :class="{ 'space-y-2': isSidebarCollapsed }">
            <!-- 群组列表视图 -->
            <div v-if="!selectedGroup" class="space-y-0.5">
              <div
                v-for="group in groups"
                :key="group.id"
                @click="selectGroup(group)"
                class="rounded-lg cursor-pointer transition-all relative"
                :class="isSidebarCollapsed ? 'p-2' : 'p-2.5'"
                :style="{
                  border: '1px solid transparent'
                }"
                @mouseenter="$event.currentTarget.style.background = 'var(--fill-light)'"
                @mouseleave="$event.currentTarget.style.background = 'transparent'"
              >
                <div class="flex items-center gap-2" :class="{ 'justify-center': isSidebarCollapsed }">
                  <!-- 群组头像 -->
                  <div
                    v-if="isSidebarCollapsed"
                    class="relative"
                    @mouseenter="hoveredTooltip = { text: group.name, x: $event.clientX, y: $event.clientY }"
                    @mouseleave="hoveredTooltip = null"
                  >
                    <div class="rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 w-10 h-10" :style="{ background: group.color, color: 'white' }">
                      <template v-if="group.type === 'vip' && group.icon">
                        {{ group.icon }}
                      </template>
                      <template v-else>
                        {{ group.name.charAt(0) }}
                      </template>
                    </div>
                  </div>

                  <!-- 非折叠状态的头像 -->
                  <div
                    v-else
                    class="rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 w-8 h-8"
                    :style="{ background: group.color, color: 'white' }"
                  >
                    <template v-if="group.type === 'vip' && group.icon">
                      {{ group.icon }}
                    </template>
                    <template v-else>
                      {{ group.name.charAt(0) }}
                    </template>
                  </div>

                  <!-- 群组信息 -->
                  <div v-if="!isSidebarCollapsed" class="flex-1 min-w-0">
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs font-medium truncate">{{ group.name }}</span>
                      <span class="text-[10px]" :style="{ color: 'var(--text-secondary)' }">{{ group.memberCount }}人</span>
                    </div>
                    <div class="flex items-center gap-1 mt-0.5">
                      <span class="text-[10px]" :style="{ color: 'var(--text-secondary)' }">今日{{ group.todayCompleted }}人已打卡</span>
                    </div>
                  </div>
                  <!-- 完成率 -->
                  <div v-if="!isSidebarCollapsed" class="flex flex-col items-end flex-shrink-0 ml-2">
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
              class="rounded-lg cursor-pointer transition-all relative"
              :class="isSidebarCollapsed ? 'p-2' : 'p-2.5'"
              :style="selectedUser === user.id ? {
                background: isBlackGold.value ? 'rgba(184, 134, 11, 0.15)' : '#eef2ff',
                border: '1px solid ' + (isBlackGold.value ? '#B8860B' : '#c7d2fe')
              } : {
                border: '1px solid transparent'
              }"
            >
              <div class="flex items-center gap-2" :class="{ 'justify-center': isSidebarCollapsed }">
                <!-- Avatar -->
                <div
                  class="relative"
                  v-if="isSidebarCollapsed"
                  @mouseenter="hoveredTooltip = { text: user.name, x: $event.clientX, y: $event.clientY }"
                  @mouseleave="hoveredTooltip = null"
                >
                  <div
                    class="rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 w-10 h-10"
                    :style="selectedUser === user.id ? {
                      background: user.avatarColor,
                      color: 'white'
                    } : isBlackGold.value ? {
                      background: 'linear-gradient(135deg, #B8860B 0%, #D4A84A 100%)',
                      color: 'white'
                    } : {
                      background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
                      color: 'white'
                    }"
                  >
                    {{ user.name.charAt(0) }}
                  </div>
                  <!-- 选中状态外环（仅折叠时显示） -->
                  <div
                    v-if="selectedUser === user.id"
                    class="absolute -inset-1 rounded-full"
                    :style="{
                      border: '2px solid ' + (isBlackGold.value ? '#B8860B' : '#6366f1')
                    }"
                  ></div>
                </div>

                <!-- Avatar (非折叠状态) -->
                <div
                  v-else
                  class="rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 w-8 h-8"
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
                <div v-if="!isSidebarCollapsed" class="flex-1 min-w-0">
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
                <div v-if="!isSidebarCollapsed" class="flex flex-col items-end flex-shrink-0 ml-2">
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

                <!-- Selection Indicator (only show when not collapsed) -->
                <div v-if="!isSidebarCollapsed && selectedUser === user.id" class="w-2 h-2 rounded-full flex-shrink-0" :style="{ background: isBlackGold.value ? '#B8860B' : '#6366f1' }"></div>
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

        <!-- Tooltip (折叠状态下悬停显示) -->
        <Teleport to="body">
          <div
            v-if="hoveredTooltip && isSidebarCollapsed"
            class="fixed z-50 px-2 py-1 text-xs text-white bg-slate-800 rounded shadow-lg pointer-events-none"
            :style="{
              left: hoveredTooltip.x + 20 + 'px',
              top: hoveredTooltip.y - 10 + 'px',
              transform: 'translateY(-50%)'
            }"
          >
            {{ hoveredTooltip.text }}
          </div>
        </Teleport>
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
        <div v-else class="flex-1 overflow-y-auto p-1">
          <div class="max-w-7xl mx-auto space-y-3">
            <!-- User Header Card -->
            <div class="rounded-xl shadow-sm p-2" :style="{
              background: 'var(--card)',
              border: '1px solid var(--border)'
            }">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div>
                    <div class="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 class="text-3xl font-bold" :style="{ color: 'var(--text-primary)' }">{{ currentUser?.name }}</h2>
                      <div class="flex items-center gap-2 flex-wrap">
                        <!-- 标签列表 - 支持编辑和删除 -->
                        <template v-for="(tag, i) in userTags" :key="i">
                          <!-- 编辑模式 -->
                          <input
                            v-if="editingTagIndex === i"
                            v-model="editingTagValue"
                            @blur="saveEditingTag"
                            @keydown.enter="saveEditingTag"
                            @keydown.esc="cancelEditingTag"
                            class="w-24 px-3 py-1 text-sm border border-indigo-300 rounded-full focus:outline-none"
                            ref="editTagInput"
                          />
                          <!-- 显示模式 -->
                          <div v-else class="group relative">
                            <span
                              @click="startEditingTag(i, tag)"
                              class="px-4 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-sm text-slate-600 font-medium hover:bg-white hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-pointer whitespace-nowrap"
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
                        <div v-if="showAddTag" class="flex items-center gap-2">
                          <input
                            v-model="newTag"
                            @keydown.enter="handleAddTag"
                            type="text"
                            class="w-24 px-3 py-1 text-sm border border-indigo-300 rounded-full focus:outline-none"
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
                          class="px-3 py-1.5 border border-dashed border-slate-300 text-slate-400 rounded-full text-sm hover:text-indigo-600 hover:border-indigo-300 transition-colors flex items-center gap-1"
                        >
                          <Plus :size="12" /> 添加
                        </button>
                      </div>
                    </div>

                    <!-- 基础信息：性别、年龄、依从度、ID、来源渠道、付费金额、用户目标、干预日期 -->
                    <div class="mt-2 w-full bg-slate-50/50 p-4 rounded-lg border border-slate-100 group">
                      <div class="flex items-center justify-between mb-4">
                        <span class="text-sm font-bold text-slate-500">客情基础信息</span>
                        <button
                          @click="openBasicInfoEditModal"
                          class="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                          title="编辑基础信息"
                        >
                          <Edit3 :size="12" />
                        </button>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[auto_auto_auto_auto_auto] gap-y-4 gap-x-6 w-fit">
                        <!-- 性别 -->
                        <div class="flex items-center">
                          <div class="flex items-center gap-1.5 text-slate-400 w-16 flex-shrink-0">
                            <User :size="14" />
                            <span class="text-sm">性别</span>
                          </div>
                          <span class="text-base font-medium text-slate-800">{{ currentUser?.gender || '未设置' }}</span>
                        </div>

                        <!-- 年龄 -->
                        <div class="flex items-center">
                          <div class="flex items-center gap-1.5 text-slate-400 w-16 flex-shrink-0">
                            <Calendar :size="14" />
                            <span class="text-sm">年龄</span>
                          </div>
                          <span class="text-base font-medium text-slate-800">{{ currentUser?.age ? `${currentUser.age}岁` : '未设置' }}</span>
                        </div>

                        <!-- 依从度 -->
                        <div class="flex items-center">
                          <div class="flex items-center gap-1.5 text-slate-400 w-16 flex-shrink-0">
                            <Activity :size="14" />
                            <span class="text-sm">依从度</span>
                          </div>
                          <div class="flex items-center gap-2">
                            <span class="text-base font-medium text-slate-800">{{ userComplianceLevel }}分</span>
                            <span
                              class="px-2 py-0.5 text-xs font-medium rounded-md border"
                              :style="{
                                background: getComplianceColor(userComplianceLevel).bg,
                                color: getComplianceColor(userComplianceLevel).text,
                                borderColor: getComplianceColor(userComplianceLevel).border
                              }"
                            >
                              {{ userComplianceLevel <= 2 ? '很差' : userComplianceLevel <= 4 ? '较差' : userComplianceLevel <= 6 ? '一般' : userComplianceLevel <= 8 ? '良好' : '优秀' }}
                            </span>
                          </div>
                        </div>

                        <!-- 用户ID -->
                        <div class="flex items-center">
                          <div class="flex items-center gap-1.5 text-slate-400 w-16 flex-shrink-0">
                            <Hash :size="14" />
                            <span class="text-sm">ID</span>
                          </div>
                          <span class="text-base font-medium text-slate-800">{{ selectedUser }}</span>
                        </div>

                        <!-- 来源渠道 -->
                        <div class="flex items-center">
                          <div class="flex items-center gap-1.5 text-slate-400 w-16 flex-shrink-0">
                            <Share2 :size="14" />
                            <span class="text-sm">渠道</span>
                          </div>
                          <span class="text-base font-medium text-slate-800">{{ userData?.sourceChannel || '未设置' }}</span>
                        </div>

                        <!-- 付费金额 -->
                        <div class="flex items-center">
                          <div class="flex items-center gap-1.5 text-slate-400 w-16 flex-shrink-0">
                            <span class="text-sm">💰</span>
                            <span class="text-sm">付费</span>
                          </div>
                          <span class="text-base font-medium text-slate-800">
                            {{ userData?.paymentAmount ? `¥${userData.paymentAmount.toLocaleString()}` : '未设置' }}
                          </span>
                        </div>

                        <!-- 用户目标 -->
                        <div class="flex items-center">
                          <div class="flex items-center gap-1.5 text-slate-400 w-16 flex-shrink-0">
                            <Target :size="14" />
                            <span class="text-sm">目标</span>
                          </div>
                          <span class="text-base font-medium text-slate-800">{{ userData?.userGoal || '未设定' }}</span>
                        </div>

                        <!-- 干预日期 -->
                        <div class="flex items-center">
                          <div class="flex items-center gap-1.5 text-slate-400 w-16 flex-shrink-0">
                            <Clock :size="14" />
                            <span class="text-sm">干预</span>
                          </div>
                          <span class="text-base font-medium text-slate-800">
                            {{ interventionStartDate }} - {{ interventionEndDate }} · {{ interventionDays }}天
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col items-end gap-1.5">
                  <div class="flex items-center gap-1.5">
                    <!-- 查看备注按钮 -->
                    <button
                      @click="showNotesSidebar = true"
                      class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all"
                      title="查看备注"
                    >
                      <FileText :size="14" />
                      <span>查看备注</span>
                    </button>

                    <!-- 查看档案按钮 -->
                    <button
                      @click="goToProfile"
                      class="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg border border-slate-200 hover:border-indigo-200 transition-all"
                    >
                      查看档案
                    </button>
                  </div>

                  <!-- 教练和医生分配按钮 - 垂直排列 -->
                  <div class="flex flex-col gap-1.5 w-32">
                    <!-- 教练管理按钮 -->
                    <button
                      @click="showCoachManagementModal = true"
                      class="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg text-xs hover:from-emerald-100 hover:to-green-100 transition-all font-medium text-emerald-700"
                      title="管理教练分配"
                    >
                      <span class="text-base">👨‍⚕️</span>
                      <div class="flex-1 text-left">
                        <div class="text-[10px] opacity-70">教练</div>
                        <div class="text-xs font-semibold truncate">
                          {{ userAssignment?.coaches && userAssignment.coaches.length > 0 ? userAssignment.coaches.map(c => c.coachName).join(', ') : '未分配' }}
                        </div>
                      </div>
                      <Edit3 :size="11" />
                    </button>

                    <!-- 医生管理按钮 -->
                    <button
                      @click="showDoctorManagementModal = true"
                      class="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg text-xs hover:from-blue-100 hover:to-indigo-100 transition-all font-medium text-blue-700"
                      title="管理医生分配"
                    >
                      <span class="text-base">🩺</span>
                      <div class="flex-1 text-left">
                        <div class="text-[10px] opacity-70">医生</div>
                        <div class="text-xs font-semibold truncate">
                          {{ userAssignment?.doctorId ? userAssignment?.doctorName : '未分配' }}
                        </div>
                      </div>
                      <Edit3 :size="11" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Quick Stats -->
              <div class="mt-2 pt-2 border-t border-slate-200/60">
                <!-- 第一行：统计卡片 + 快捷按钮 -->
                <div class="flex w-full items-center justify-between gap-4 py-2">
                  <!-- 左侧卡片组 -->
                  <div class="flex flex-shrink-0 items-center gap-2">
                    <!-- 今日任务 -->
                    <div
                      @click="showTaskDetailModal = true"
                      class="w-fit bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 rounded border border-indigo-100/50 p-2 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105"
                    >
                      <div class="flex items-center justify-center gap-1.5">
                        <div class="relative w-6 h-6 flex-shrink-0">
                          <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e2e8f0"
                              stroke-width="3"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              :stroke="userData?.todayTasks > 0 && (userData?.todayCompleted || 0) >= userData?.todayTasks ? '#22c55e' : '#6366f1'"
                              stroke-width="3"
                              :stroke-dasharray="`${userData?.todayTasks > 0 ? ((userData?.todayCompleted || 0) / userData?.todayTasks * 100) : 0}, 100`"
                              class="transition-all duration-500"
                            />
                          </svg>
                          <div class="absolute inset-0 flex flex-col items-center justify-center">
                            <span class="text-[10px] font-bold text-slate-700 leading-none">{{ userData?.todayCompleted || 0 }}</span>
                            <span class="text-[8px] text-slate-400 leading-none">/ {{ userData?.todayTasks || 0 }}</span>
                          </div>
                        </div>
                        <div>
                          <p class="text-sm font-semibold text-slate-700 leading-none">今日任务</p>
                          <p class="text-[10px] text-slate-500 leading-none">
                            {{ userData?.todayTasks > 0 && (userData?.todayCompleted || 0) >= userData?.todayTasks ? '已完成' : '进行中' }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <!-- 课程学习 -->
                    <div
                      @click="showCourseLearningModal = true"
                      class="w-fit bg-gradient-to-br from-cyan-50/50 via-white to-sky-50/50 rounded border border-cyan-100/50 p-2 shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105"
                    >
                      <div class="flex items-center justify-center gap-1.5">
                        <div class="relative w-6 h-6 flex-shrink-0">
                          <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e2e8f0"
                              stroke-width="3"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              :stroke="courseLearningData.completedCount >= courseLearningData.totalCount ? '#22c55e' : '#14b8a6'"
                              stroke-width="3"
                              :stroke-dasharray="`${courseLearningData.totalCount > 0 ? (courseLearningData.completedCount / courseLearningData.totalCount * 100) : 0}, 100`"
                              class="transition-all duration-500"
                            />
                          </svg>
                          <div class="absolute inset-0 flex flex-col items-center justify-center">
                            <span class="text-[10px] font-bold text-slate-700 leading-none">{{ courseLearningData.completedCount }}</span>
                            <span class="text-[8px] text-slate-400 leading-none">/ {{ courseLearningData.totalCount }}</span>
                          </div>
                        </div>
                        <div>
                          <p class="text-sm font-semibold text-cyan-700 leading-none">课程学习</p>
                          <p class="text-[10px] text-cyan-500 leading-none">
                            {{ courseLearningData.completedCount >= courseLearningData.totalCount ? '已完成' : '学习中' }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 右侧快捷操作按钮 -->
                  <div class="flex flex-1 items-center justify-end gap-2 overflow-x-auto no-scrollbar flex-nowrap py-1">
                    <!-- AI处方 -->
                    <button
                      @click="openAIPrescription"
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded whitespace-nowrap hover:bg-purple-100 transition-all shadow-sm hover:shadow flex-shrink-0"
                      title="AI生成处方"
                    >
                      <BrainCircuit :size="14" class="text-purple-600" />
                      <span class="text-xs font-medium">AI处方</span>
                    </button>

                    <!-- 健康指标 -->
                    <button
                      @click="goToHealthTab"
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded whitespace-nowrap hover:bg-green-100 transition-all shadow-sm hover:shadow flex-shrink-0"
                      title="查看健康指标"
                    >
                      <Activity :size="14" class="text-green-600" />
                      <span class="text-xs font-medium">健康</span>
                    </button>

                    <!-- 数据中心 -->
                    <button
                      @click="goToDataCenter"
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded whitespace-nowrap hover:bg-blue-100 transition-all shadow-sm hover:shadow flex-shrink-0"
                      title="数据中心"
                    >
                      <Database :size="14" class="text-blue-600" />
                      <span class="text-xs font-medium">数据</span>
                    </button>

                    <!-- 干预管理 -->
                    <button
                      @click="goToIntervention"
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded whitespace-nowrap hover:bg-red-100 transition-all shadow-sm hover:shadow flex-shrink-0"
                      title="干预管理"
                    >
                      <Target :size="14" class="text-red-600" />
                      <span class="text-xs font-medium">干预</span>
                    </button>

                    <!-- 对话标注 -->
                    <button
                      @click="goToLabeling"
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded whitespace-nowrap hover:bg-amber-100 transition-all shadow-sm hover:shadow flex-shrink-0"
                      title="对话标注"
                    >
                      <MessageSquare :size="14" class="text-amber-600" />
                      <span class="text-xs font-medium">标注</span>
                    </button>

                    <!-- 内容配置 -->
                    <button
                      @click="goToConfig"
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded whitespace-nowrap hover:bg-slate-100 transition-all shadow-sm hover:shadow flex-shrink-0"
                      title="内容配置"
                    >
                      <Settings :size="14" class="text-slate-600" />
                      <span class="text-xs font-medium">配置</span>
                    </button>

                    <!-- 硬件设备 -->
                    <button
                      @click="goToDevicesTab"
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-600 rounded whitespace-nowrap hover:bg-teal-100 transition-all shadow-sm hover:shadow flex-shrink-0"
                      title="硬件设备"
                    >
                      <Watch :size="14" class="text-teal-600" />
                      <span class="text-xs font-medium">设备</span>
                    </button>

                    <!-- 预约服务 -->
                    <button
                      @click="openBookingModal"
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-600 rounded whitespace-nowrap hover:bg-cyan-100 transition-all shadow-sm hover:shadow flex-shrink-0"
                      title="预约服务"
                    >
                      <CalendarCheck :size="14" class="text-cyan-600" />
                      <span class="text-xs font-medium">预约</span>
                    </button>

                    <!-- 查看报告 -->
                    <button
                      @click="openReportModal"
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded whitespace-nowrap hover:bg-rose-100 transition-all shadow-sm hover:shadow flex-shrink-0"
                      title="查看体检报告"
                    >
                      <FileText :size="14" class="text-rose-600" />
                      <span class="text-xs font-medium">报告</span>
                    </button>

                    <!-- 全部阻碍 -->
                    <button
                      @click="openObstacleLibrary"
                      class="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded whitespace-nowrap hover:bg-orange-100 transition-all shadow-sm hover:shadow flex-shrink-0"
                      title="查看全部阻碍"
                    >
                      <AlertTriangle :size="14" class="text-orange-600" />
                      <span class="text-xs font-medium">阻碍</span>
                      <span class="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{{ obstacleLibrary.length }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 阻碍记录横幅 -->
            <div v-if="obstacles.length > 0" class="space-y-3">
              <div v-for="obs in obstacles" :key="obs.id" class="bg-amber-50 border border-amber-100 rounded-xl p-2.5 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
                    <AlertTriangle :size="16" />
                  </div>
                  <div>
                    <h4 class="font-bold text-amber-700 flex items-center gap-2 text-xs">
                      {{ obs.type }}
                      <span class="text-[9px] font-normal text-amber-600 bg-amber-100/50 px-1 py-0.5 rounded border border-amber-200/50">{{ obs.time }}</span>
                    </h4>
                    <p class="text-xs text-amber-600 mt-0.5">患者反馈：{{ obs.desc }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="handleResolveObstacle(obs.id)"
                    class="px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 shadow-sm active:scale-95 transition-all"
                  >
                    跟进处理
                  </button>
                </div>
              </div>
            </div>

            <!-- 网格布局：核心内容区 -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-2 pb-5">

              <!-- 左侧栏：生理数据与趋势看板 -->
              <div class="col-span-12 md:col-span-3">
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow h-full flex flex-col">

                  <!-- 1. 实时生理数据块 -->
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-slate-800 flex items-center gap-2">
                      <Heart :size="18" class="text-rose-500" /> 生理体征数据
                    </h3>
                    <span class="text-xs text-indigo-500 cursor-pointer hover:text-indigo-700 font-medium bg-indigo-50 px-2 py-1 rounded-md" @click="showToastMessage('正在获取最新体征设备数据...')">
                      同步 ↻
                    </span>
                  </div>

                  <div class="grid grid-cols-2 gap-3 mb-5">
                    <div v-for="(block, idx) in dataBlocks" :key="idx"
                         @click="openVitalDataModal(block)"
                         class="bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 hover:shadow-sm transition-all cursor-pointer active:scale-95 flex flex-col justify-between">
                      <div>
                        <div class="flex items-center justify-between mb-2">
                          <div class="flex items-center gap-1.5 text-slate-500">
                            <component :is="block.icon" :size="16" />
                            <span class="text-xs font-medium">{{ block.label }}</span>
                          </div>
                          <div :class="['text-[10px] font-semibold bg-white px-1.5 py-0.5 rounded shadow-sm border border-slate-100', block.statusColor]">
                            {{ block.status }}
                          </div>
                        </div>
                        <div class="flex items-baseline gap-1 mb-1">
                          <span class="text-lg font-bold text-slate-800">{{ block.value }}</span>
                          <span class="text-xs text-slate-400">{{ block.unit }}</span>
                        </div>
                      </div>
                      <div v-if="block.device" class="text-[10px] text-slate-400 mt-2 flex items-center gap-1 border-t border-slate-200/60 pt-2 line-clamp-1">
                        <Smartphone :size="10" class="shrink-0" /> <span class="truncate">{{ block.device }}</span>
                      </div>
                      <div v-if="block.target" class="text-[10px] text-indigo-500 mt-1 flex items-center gap-1">
                        <Target :size="10" class="shrink-0" /> <span class="truncate">目标 {{ block.target }}</span>
                      </div>
                    </div>
                  </div>

                  <hr class="border-slate-100 mb-5" />

                  <!-- 2. 趋势图表区 -->
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-slate-800 flex items-center gap-2">
                      <Activity :size="18" class="text-indigo-500" /> 趋势分析
                    </h3>
                  </div>

                  <div class="space-y-5 flex-1">
                    <!-- 折线趋势图循环 -->
                    <div v-for="(chart, idx) in trendCharts" :key="idx" class="group cursor-pointer bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all" @click="openTrendDetail(chart)">
                      <div class="flex justify-between items-start mb-2">
                        <div>
                          <span class="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1">
                            <component :is="chart.icon" :size="14" :class="chart.iconColor"/> {{ chart.label }}
                          </span>
                          <div class="flex items-baseline gap-1">
                            <span class="text-lg font-bold text-slate-800">{{ chart.value }}</span>
                            <span class="text-[10px] text-slate-400">{{ chart.unit }}</span>
                          </div>
                        </div>
                        <span :class="['text-[10px] font-semibold px-1.5 py-0.5 rounded border', chart.statusColor]">{{ chart.status }}</span>
                      </div>
                      <div class="mt-2">
                        <svg viewBox="0 -5 100 40" class="w-full h-12 overflow-visible">
                           <polygon :points="getChartData(chart.data).areaPoints" :class="chart.fillClass" />
                           <polyline :points="getChartData(chart.data).points" fill="none" :class="chart.strokeClass" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                           <circle v-for="(pt, i) in getChartData(chart.data).dataNodes" :key="i" :cx="pt.x" :cy="pt.y" r="2.5" :class="['fill-white', chart.dotClass]" stroke-width="1.5" />
                        </svg>
                      </div>
                    </div>

                    <!-- 睡眠质量分析柱状图 -->
                    <div class="group cursor-pointer bg-slate-50 rounded-xl p-3 border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all" @click="openTrendDetail({ label: '睡眠时长评估', icon: Moon, iconColor: 'text-indigo-500', value: '7.0', unit: '小时 (平均)', status: '良好', statusColor: 'bg-indigo-100 text-indigo-700 border-indigo-200', type: 'sleep' })">
                      <div class="flex justify-between items-start mb-2">
                        <div>
                          <span class="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-1"><Moon :size="14" class="text-indigo-500"/> 睡眠时长评估</span>
                          <div class="flex items-baseline gap-1">
                            <span class="text-lg font-bold text-slate-800">7.0</span>
                            <span class="text-[10px] text-slate-400">小时 (平均)</span>
                          </div>
                        </div>
                        <span class="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">良好</span>
                      </div>
                      <div class="mt-2 flex items-end justify-between h-12 gap-1.5 pt-2">
                        <div v-for="(bar, i) in getSleepChartData([6.5, 7.2, 5.8, 8.0, 7.5, 6.8, 7.0])" :key="i" class="w-full flex flex-col justify-end group/bar relative h-full">
                          <div class="opacity-0 group-hover/bar:opacity-100 absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-600 bg-white shadow-sm px-1 py-0.5 rounded transition-opacity">
                            {{ bar.val }}h
                          </div>
                          <div :class="['w-full rounded-t-sm transition-all duration-500', bar.isLow ? 'bg-amber-400' : 'bg-indigo-400']" :style="{ height: `${bar.heightPercent}%` }"></div>
                          <div :class="['w-full h-1 mt-0.5 rounded-full', bar.isLow ? 'bg-amber-100' : 'bg-indigo-100']"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 中间栏：餐食管理 & 营养素分析 -->
              <div class="col-span-12 md:col-span-6 space-y-6">

                <!-- 餐食记录与上传 -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-slate-800 flex items-center gap-2">
                      <Utensils :size="18" class="text-amber-500" /> 今日餐食记录
                    </h3>
                    <div class="flex items-center gap-2">
                      <!-- 早、中、晚按钮 -->
                      <div class="flex items-center gap-1.5 mr-2">
                        <button
                          @click="filterMeals('早餐')"
                          class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                          :class="hasMealRecord('早餐') ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                        >
                          早
                        </button>
                        <button
                          @click="filterMeals('午餐')"
                          class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                          :class="hasMealRecord('午餐') ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                        >
                          中
                        </button>
                        <button
                          @click="filterMeals('晚餐')"
                          class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                          :class="hasMealRecord('晚餐') ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'"
                        >
                          晚
                        </button>
                      </div>
                      <button
                        @click="calculateAINutrition"
                        class="text-sm text-indigo-600 hover:text-indigo-800 flex items-center px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
                      >
                        <BrainCircuit :size="14" class="mr-1" />
                        AI一键测算热量、营养素
                      </button>
                      <button
                        @click="isDietLogOpen = true"
                        class="text-sm text-slate-500 hover:text-slate-700 flex items-center px-2 py-1 rounded-md hover:bg-slate-50 transition-colors"
                      >
                        饮食日志 <ChevronRight :size="16" />
                      </button>
                    </div>
                  </div>

                  <div class="flex flex-col gap-3">
                    <div class="flex flex-col gap-3 max-h-[260px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full">
                      <div v-for="meal in filteredMeals" :key="meal.id" @click="showToastMessage(`查看 ${meal.time} 的营养成分详情`)" class="flex gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-100 hover:shadow-sm transition-all cursor-pointer group">
                        <div class="relative overflow-hidden rounded-lg shrink-0">
                          <img :src="meal.img" :alt="meal.time" class="w-20 h-20 object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <div class="flex-1 flex flex-col justify-center">
                          <div class="flex justify-between items-start mb-1.5">
                            <span class="font-bold text-slate-800 text-sm">{{ meal.time }}</span>
                            <span class="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-0.5 rounded border border-orange-200">{{ meal.cal }} kcal</span>
                          </div>
                          <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">{{ meal.desc }}</p>
                        </div>
                      </div>
                    </div>

                    <div
                      @click="isAddMealOpen = true"
                      class="mt-2 w-full py-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 flex justify-center items-center gap-2 hover:bg-indigo-50 hover:border-indigo-300 transition-all cursor-pointer text-slate-500 hover:text-indigo-600 active:scale-[0.99]"
                    >
                      <Plus :size="18" />
                      <span class="text-sm font-medium">补充餐食记录</span>
                    </div>
                  </div>
                </div>

                <!-- 每日营养素摄入详情 (分段进度条) -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                   <div class="flex justify-between items-center mb-5">
                     <h3 class="font-bold text-slate-800 flex items-center gap-2">
                      <Flame :size="18" class="text-orange-500" /> 营养素摄入监控
                     </h3>
                     <div class="flex items-center gap-2">
                       <button
                         @click="showNutrientSettings = true"
                         class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                         title="设置营养素"
                       >
                         <Settings :size="16" />
                       </button>
                       <div class="flex gap-2.5 text-[10px] font-medium text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                         <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-sky-400"></span>早餐</span>
                         <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-indigo-500"></span>午餐</span>
                         <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-violet-500"></span>晚餐</span>
                         <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-fuchsia-400"></span>加餐</span>
                       </div>
                     </div>
                   </div>

                  <div class="space-y-6">
                    <div v-for="(bar, idx) in nutrientBars" :key="idx" class="group cursor-default">
                      <div class="flex justify-between items-end mb-2">
                        <span class="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">{{ bar.label }}</span>
                        <div class="text-xs">
                          <span class="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{{ bar.total }}</span>
                          <span class="text-slate-400"> / {{ bar.target }} {{ bar.unit }}</span>
                        </div>
                      </div>
                      <div class="w-full bg-slate-100 rounded-full h-2.5 flex overflow-hidden ring-1 ring-slate-900/5">
                        <template v-for="(seg, i) in bar.segments" :key="i">
                          <div v-if="seg.value > 0"
                            :class="['h-full border-r border-white/40 last:border-r-0 transition-all duration-1000 ease-out relative flex items-center justify-center hover:brightness-110 cursor-pointer', seg.color]"
                            :style="{ width: `${seg.percent}%` }"
                            :title="`${seg.label}: ${seg.value}${bar.unit}`"
                          >
                            <div class="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              <!-- 右侧栏：日历 & 快捷操作 -->
              <div class="col-span-12 md:col-span-3 space-y-6">

                <!-- 打卡日历 -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                  <div class="flex justify-between items-center mb-4">
                    <h3 class="font-bold text-slate-800 flex items-center gap-2">
                      <CalendarIcon :size="18" class="text-indigo-500" /> 日历 & 日程
                    </h3>
                    <div class="flex gap-1 items-center">
                      <button @click="changeMonth(-1)" class="p-1 rounded hover:bg-slate-100 transition-colors"><ChevronLeft :size="16" /></button>
                      <span class="text-sm font-medium select-none w-20 text-center">{{ viewingYear }}年{{ viewingMonth + 1 }}月</span>
                      <button @click="changeMonth(1)" class="p-1 rounded hover:bg-slate-100 transition-colors"><ChevronRight :size="16" /></button>
                    </div>
                  </div>

                  <div class="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-slate-400 select-none">
                    <div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div><div>日</div>
                  </div>
                  <div class="grid grid-cols-7 gap-1 text-center text-sm">
                    <div v-for="day in 31" :key="day"
                         @click="toggleSchedule(day)"
                         :class="['aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 relative', getDayClass(day)]">
                      {{ day }}
                      <!-- 有日程的日期显示小圆点 -->
                      <div v-if="hasSchedule(day)" class="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500"></div>
                    </div>
                  </div>
                  <div class="flex justify-between items-center mt-5 text-xs text-slate-500">
                    <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-green-200 border border-green-300"></span> 全达标</div>
                    <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-red-100 border border-red-200"></span> 有遗漏</div>
                    <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-slate-100 border border-slate-200"></span> 未开始</div>
                    <div class="flex items-center gap-1.5"><span class="w-1 h-1 rounded-full bg-indigo-500"></span> 有日程</div>
                  </div>

                  <!-- 展开的日程列表 -->
                  <div v-if="showScheduleList && selectedDate" class="mt-4 pt-4 border-t border-slate-100 space-y-2.5 animate-in slide-in-from-top-2 duration-300">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-semibold text-slate-700">{{ viewingMonth + 1 }}月{{ selectedDate }}日 日程</span>
                      <button @click="showScheduleList = false" class="text-xs text-slate-400 hover:text-slate-600">
                        <X :size="14" />
                      </button>
                    </div>

                    <!-- 营养素处方 -->
                    <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-100">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <div class="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                            <Apple :size="14" class="text-white" />
                          </div>
                          <div>
                            <p class="text-xs font-bold text-emerald-800">营养素处方</p>
                            <p class="text-[10px] text-emerald-600">每28天 · 提前7天提醒</p>
                          </div>
                        </div>
                        <span class="text-sm font-bold text-emerald-700">第3周</span>
                      </div>
                    </div>

                    <!-- 替尔泊肽 -->
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <div class="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
                            <Pill :size="14" class="text-white" />
                          </div>
                          <div>
                            <p class="text-xs font-bold text-blue-800">替尔泊肽</p>
                            <p class="text-[10px] text-blue-600">每周一次 · 固定剂量</p>
                          </div>
                        </div>
                        <span class="text-sm font-bold text-blue-700">周三</span>
                      </div>
                    </div>

                    <!-- 降压药 -->
                    <div class="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-3 border border-purple-100">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                          <div class="w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center">
                            <Package :size="14" class="text-white" />
                          </div>
                          <div>
                            <p class="text-xs font-bold text-purple-800">降压药</p>
                            <p class="text-[10px] text-purple-600">每日1次 · 早餐后</p>
                          </div>
                        </div>
                        <span class="text-sm font-bold text-purple-700">8:00</span>
                      </div>
                    </div>

                    <!-- 饮食打卡 -->
                    <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-100">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
                          <CheckCircle :size="14" class="text-white" />
                        </div>
                        <div>
                          <p class="text-xs font-bold text-amber-800">饮食打卡</p>
                          <p class="text-[10px] text-amber-600">早餐 · 午餐 · 晚餐</p>
                        </div>
                      </div>
                    </div>

                    <!-- 运动打卡 -->
                    <div class="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-3 border border-rose-100">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center">
                          <Activity :size="14" class="text-white" />
                        </div>
                        <div>
                          <p class="text-xs font-bold text-rose-800">运动打卡</p>
                          <p class="text-[10px] text-rose-600">建议30分钟有氧运动</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 营养素配置 -->
                <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
                  <h3 class="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <Apple :size="18" class="text-green-500" /> 营养素配置
                  </h3>

                  <!-- 订购记录列表 -->
                  <div class="space-y-3 max-h-[320px] overflow-y-auto mb-4 pr-1">
                    <div v-if="currentUserNutrientOrders.length === 0" class="text-center py-6">
                      <Package :size="32" class="mx-auto mb-2 text-slate-300" />
                      <p class="text-xs text-slate-500">暂无订购记录</p>
                    </div>

                    <div
                      v-for="order in currentUserNutrientOrders"
                      :key="order.orderNumber"
                      class="p-3 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50"
                    >
                      <!-- 订购信息头部 -->
                      <div class="flex items-center justify-between mb-2 pb-2 border-b border-green-200">
                        <div class="flex items-center gap-2">
                          <span class="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                            第{{ order.orderNumber }}次
                          </span>
                          <span class="text-[10px] text-slate-600">{{ order.orderDate }}</span>
                        </div>
                        <div class="flex items-center gap-1">
                          <Calendar :size="12" class="text-slate-400" />
                          <span class="text-[10px] text-slate-500">订购</span>
                        </div>
                      </div>

                      <!-- 营养素配置清单 -->
                      <div class="space-y-1.5 mb-2">
                        <p class="text-[10px] font-semibold text-slate-700">配置清单：</p>
                        <div class="space-y-1">
                          <div
                            v-for="product in getOrderProducts(order)"
                            :key="product.id"
                            class="flex items-center gap-2 bg-white/80 rounded-lg p-1.5"
                          >
                            <span class="text-sm">{{ product.image }}</span>
                            <div class="flex-1 min-w-0">
                              <p class="text-[10px] font-medium text-slate-800 truncate">{{ product.name }}</p>
                              <p class="text-[8px] text-slate-500">{{ product.specifications }}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- 提醒信息 -->
                      <div class="grid grid-cols-2 gap-2">
                        <div class="flex items-center gap-1.5 bg-blue-50 rounded-lg p-1.5">
                          <BrainCircuit :size="12" class="text-blue-500" />
                          <div class="flex-1 min-w-0">
                            <p class="text-[8px] text-slate-500">处方提醒</p>
                            <p class="text-[10px] font-semibold text-blue-700 truncate">{{ order.prescriptionReminder }}</p>
                          </div>
                        </div>
                        <div class="flex items-center gap-1.5 bg-orange-50 rounded-lg p-1.5">
                          <Bell :size="12" class="text-orange-500" />
                          <div class="flex-1 min-w-0">
                            <p class="text-[8px] text-slate-500">复购提醒</p>
                            <p class="text-[10px] font-semibold text-orange-700 truncate">{{ order.repurchaseReminder }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 配置按钮 -->
                  <button
                    @click="openNutrientLibrary"
                    class="w-full px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all shadow-sm hover:shadow text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Package :size="16" />
                    {{ currentUserNutrientOrders.length > 0 ? '新增订购记录' : '创建首次订购' }}
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 弹窗：补充餐食记录 -->
    <Teleport to="body">
      <div v-if="isAddMealOpen" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
          <div class="flex justify-between items-center p-5 border-b border-slate-100">
            <h3 class="font-bold text-lg text-slate-800">补充加餐记录</h3>
            <button @click="isAddMealOpen = false" class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
              <X :size="20" />
            </button>
          </div>

          <div class="p-6 space-y-5">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-2">餐食照片 <span class="text-red-500">*</span></label>
              <input type="file" ref="addMealFileInputRef" class="hidden" accept="image/*" @change="handleModalFileUpload" />
              <div
                @click="$refs.addMealFileInputRef.click()"
                :class="['w-full h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors', newMealForm.img ? 'border-transparent' : 'border-slate-300 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300']"
              >
                <img v-if="newMealForm.img" :src="newMealForm.img" alt="Preview" class="w-full h-full object-cover" />
                <template v-else>
                  <div class="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-indigo-400 mb-2">
                    <ImageIcon :size="20" />
                  </div>
                  <span class="text-sm text-slate-500 font-medium">点击上传照片</span>
                </template>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">内容描述 <span class="text-red-500">*</span></label>
                <textarea
                  v-model="newMealForm.desc"
                  placeholder="例：无糖酸奶一杯，每日坚果一包..."
                  class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-20"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">预估热量 (kcal)</label>
                <input
                  type="number"
                  v-model="newMealForm.cal"
                  placeholder="选填，默认150"
                  class="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div class="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button @click="isAddMealOpen = false" class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
              取消
            </button>
            <button @click="handleSaveNewMeal" class="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-colors">
              保存记录
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 弹窗：饮食日志历史 -->
    <Teleport to="body">
      <div v-if="isDietLogOpen" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4 md:p-10">
        <div class="bg-[#F4F7FE] rounded-2xl shadow-2xl w-full max-w-2xl h-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          <div class="flex justify-between items-center p-6 bg-white border-b border-slate-100 shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <Utensils :size="20" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-slate-800">王磊的饮食日志</h3>
                <p class="text-xs text-slate-500">记录了所有历史餐食照片与营养数据</p>
              </div>
            </div>
            <button @click="isDietLogOpen = false" class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors">
              <X :size="24" />
            </button>
          </div>

          <div class="p-6 overflow-y-auto flex-1 space-y-8">
            <div v-for="(day, idx) in historicalDietData" :key="idx" class="relative">
              <div class="flex justify-between items-center mb-4 sticky top-0 bg-[#F4F7FE]/90 backdrop-blur-sm py-2 z-10">
                <h4 class="font-bold text-slate-700 flex items-center gap-2">
                  <CalendarIcon :size="16" class="text-indigo-500" /> {{ day.date }}
                </h4>
                <span class="text-xs font-semibold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-md border border-orange-200">
                  总热量: {{ day.totalCal }} kcal
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="(meal, mIdx) in day.meals" :key="mIdx" class="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex gap-3 hover:border-indigo-200 transition-colors cursor-pointer group">
                  <img :src="meal.img" :alt="meal.time" class="w-16 h-16 rounded-lg object-cover border border-slate-100 group-hover:opacity-90 transition-opacity shrink-0" />
                  <div class="flex flex-col justify-center">
                    <div class="flex justify-between items-center mb-1">
                      <span class="text-sm font-bold text-slate-800">{{ meal.time }}</span>
                      <span class="text-[10px] font-semibold text-slate-500">{{ meal.cal }} kcal</span>
                    </div>
                    <p class="text-xs text-slate-500 line-clamp-2 leading-relaxed">{{ meal.desc }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="text-center pt-4 pb-2">
              <span class="text-xs text-slate-400">仅展示近30天内的核心记录</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 营养素设置弹窗 -->
    <Teleport to="body">
      <div v-if="showNutrientSettings" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
          <div class="flex justify-between items-center p-5 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Settings :size="20" class="text-orange-600" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-slate-800">营养素设置</h3>
                <p class="text-xs text-slate-500">自定义监控营养素种类和目标量</p>
              </div>
            </div>
            <button @click="showNutrientSettings = false" class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition-colors">
              <X :size="20" />
            </button>
          </div>

          <div class="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
            <!-- 添加新营养素 -->
            <div class="flex gap-2">
              <input
                v-model="newNutrient.name"
                type="text"
                placeholder="营养素名称"
                class="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                v-model.number="newNutrient.target"
                type="number"
                placeholder="目标量"
                class="w-24 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <select
                v-model="newNutrient.unit"
                class="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="g">g</option>
                <option value="mg">mg</option>
                <option value="kcal">kcal</option>
              </select>
              <button
                @click="addNutrient"
                class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus :size="16" />
              </button>
            </div>

            <!-- 营养素列表 -->
            <div class="space-y-2">
              <div
                v-for="(nutrient, index) in nutrientConfigs"
                :key="index"
                class="flex items-center gap-2 p-3 bg-slate-50 rounded-lg group"
              >
                <div class="flex-1">
                  <input
                    v-model="nutrient.name"
                    class="w-full text-sm font-medium text-slate-800 bg-transparent border-none focus:outline-none"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <input
                    v-model.number="nutrient.target"
                    type="number"
                    class="w-20 px-2 py-1 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <span class="text-sm text-slate-600">{{ nutrient.unit }}</span>
                </div>
                <button
                  @click="removeNutrient(index)"
                  class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>

            <div class="pt-2">
              <p class="text-xs text-slate-500">
                💡 提示：营养素数据将从餐食记录中自动汇总计算
              </p>
            </div>
          </div>

          <div class="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button
              @click="showNutrientSettings = false"
              class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              @click="saveNutrientSettings"
              class="px-5 py-2.5 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm shadow-orange-200 transition-colors"
            >
              保存设置
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 今日任务详情弹窗 -->
    <Teleport to="body">
      <div v-if="showTaskDetailModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
          <!-- 弹窗头部 -->
          <div class="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                <CheckCircle2 :size="20" class="text-white" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-slate-800">今日任务详情</h3>
                <p class="text-xs text-slate-500">{{ userData?.todayCompleted || 0 }}/{{ userData?.todayTasks || 0 }} 已完成</p>
              </div>
            </div>
            <button @click="showTaskDetailModal = false" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" />
            </button>
          </div>

          <!-- 弹窗内容 -->
          <div class="p-5 max-h-[60vh] overflow-y-auto">
            <div class="space-y-3">
              <div
                v-for="task in dailyTasks"
                :key="task.id"
                class="flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md"
                :class="task.completed ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'"
              >
                <!-- 任务图标 -->
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0" :class="task.completed ? 'bg-green-500' : 'bg-slate-300'">
                  <template v-if="task.completed">
                    ✓
                  </template>
                  <template v-else>
                    {{ task.icon }}
                  </template>
                </div>

                <!-- 任务信息 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-sm font-semibold" :class="task.completed ? 'text-green-800 line-through' : 'text-slate-800'">
                      {{ task.title }}
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full" :class="task.completed ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'">
                      {{ task.time }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 line-clamp-1">{{ task.description }}</p>
                </div>

                <!-- 完成状态 -->
                <div class="flex-shrink-0">
                  <div
                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                    :class="task.completed ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-indigo-400'"
                  >
                    <Check v-if="task.completed" :size="14" class="text-white" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 进度总结 -->
            <div class="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-semibold text-slate-800">完成进度</span>
                <span class="text-lg font-bold" :style="{ color: (userData?.todayCompleted || 0) >= (userData?.todayTasks || 0) ? '#22c55e' : '#6366f1' }">
                  {{ userData?.todayTasks > 0 ? Math.round(((userData?.todayCompleted || 0) / (userData?.todayTasks || 1)) * 100) : 0 }}%
                </span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{
                    width: `${userData?.todayTasks > 0 ? ((userData?.todayCompleted || 0) / userData?.todayTasks * 100) : 0}%`,
                    background: (userData?.todayCompleted || 0) >= (userData?.todayTasks || 0) ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)'
                  }"
                ></div>
              </div>
            </div>
          </div>

          <!-- 弹窗底部 -->
          <div class="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
              @click="showTaskDetailModal = false"
              class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 课程学习详情弹窗 -->
    <Teleport to="body">
      <div v-if="showCourseLearningModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
          <!-- 标题栏 -->
          <div class="flex items-center justify-between p-5 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                <BookOpen :size="20" class="text-white" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-slate-800">今日课程学习</h3>
                <p class="text-xs text-slate-500">{{ courseLearningData.completedCount }}/{{ courseLearningData.totalCount }} 已完成</p>
              </div>
            </div>
            <button @click="showCourseLearningModal = false" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" />
            </button>
          </div>

          <!-- 弹窗内容 -->
          <div class="p-5 max-h-[60vh] overflow-y-auto">
            <div class="space-y-3">
              <div
                v-for="course in courseLearningData.courses"
                :key="course.id"
                class="flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md"
                :class="course.completed ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'"
              >
                <!-- 课程图标 -->
                <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0" :class="course.completed ? 'bg-green-500' : 'bg-teal-500'">
                  <template v-if="course.completed">
                    ✓
                  </template>
                  <template v-else>
                    📚
                  </template>
                </div>

                <!-- 课程信息 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-sm font-semibold" :class="course.completed ? 'text-green-800' : 'text-slate-800'">
                      {{ course.title }}
                    </span>
                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-700">
                      {{ course.duration }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500">
                    <template v-if="course.completed">
                      完成时间：{{ course.completedAt }}
                    </template>
                    <template v-else>
                      未完成
                    </template>
                  </p>
                </div>

                <!-- 完成状态 -->
                <div class="flex-shrink-0">
                  <div
                    class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                    :class="course.completed ? 'bg-green-500 border-green-500' : 'border-slate-300 hover:border-teal-400'"
                  >
                    <Check v-if="course.completed" :size="14" class="text-white" />
                  </div>
                </div>
              </div>
            </div>

            <!-- 进度总结 -->
            <div class="mt-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-semibold text-slate-800">学习进度</span>
                <span class="text-lg font-bold" :style="{ color: courseLearningData.completedCount >= courseLearningData.totalCount ? '#22c55e' : '#14b8a6' }">
                  {{ courseLearningData.totalCount > 0 ? Math.round((courseLearningData.completedCount / courseLearningData.totalCount) * 100) : 0 }}%
                </span>
              </div>
              <div class="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{
                    width: `${courseLearningData.totalCount > 0 ? (courseLearningData.completedCount / courseLearningData.totalCount * 100) : 0}%`,
                    background: courseLearningData.completedCount >= courseLearningData.totalCount ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(90deg, #14b8a6 0%, #0d9488 100%)'
                  }"
                ></div>
              </div>
            </div>
          </div>

          <!-- 弹窗底部 -->
          <div class="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
            <button
              @click="goToConfig"
              class="px-4 py-2.5 text-sm font-medium text-teal-600 bg-white border border-teal-200 hover:bg-teal-50 rounded-xl transition-colors flex items-center gap-2"
            >
              <Settings :size="16" />
              课程配置
            </button>
            <button
              @click="showCourseLearningModal = false"
              class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 预约服务弹窗 -->
    <Teleport to="body">
      <div v-if="showBookingModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
          <!-- 弹窗头部 -->
          <div class="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-cyan-50 to-blue-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
                <CalendarCheck :size="20" class="text-white" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-slate-800">预约服务</h3>
                <p class="text-xs text-slate-500">为 {{ currentUser?.name }} 预约服务</p>
              </div>
            </div>
            <button @click="showBookingModal = false" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" />
            </button>
          </div>

          <!-- 弹窗内容 -->
          <div class="p-5 space-y-4">
            <!-- 服务类型 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">服务类型</label>
              <select v-model="bookingForm.serviceType" class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                <option value="">请选择服务类型</option>
                <option value="health-check">健康体检</option>
                <option value="consultation">专家咨询</option>
                <option value="follow-up">随访服务</option>
                <option value="rehabilitation">康复训练</option>
              </select>
            </div>

            <!-- 选择医生 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">选择医生</label>
              <select v-model="bookingForm.doctorId" class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                <option value="">请选择医生</option>
                <option v-for="doctor in availableDoctors" :key="doctor.id" :value="doctor.id">
                  {{ doctor.name }} - {{ doctor.specialty }} | 可预约: {{ doctor.availableSlots }}
                </option>
              </select>
            </div>

            <!-- 预约日期 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">预约日期</label>
              <input
                v-model="bookingForm.preferredDate"
                type="date"
                class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <!-- 预约时间 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">预约时间</label>
              <select v-model="bookingForm.preferredTime" class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                <option value="">请选择时间段</option>
                <option value="09:00-10:00">09:00 - 10:00</option>
                <option value="10:00-11:00">10:00 - 11:00</option>
                <option value="14:00-15:00">14:00 - 15:00</option>
                <option value="15:00-16:00">15:00 - 16:00</option>
                <option value="16:00-17:00">16:00 - 17:00</option>
              </select>
            </div>

            <!-- 备注 -->
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">备注信息</label>
              <textarea
                v-model="bookingForm.notes"
                rows="3"
                placeholder="请输入特殊需求或备注信息..."
                class="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              ></textarea>
            </div>
          </div>

          <!-- 弹窗底部 -->
          <div class="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
            <button
              @click="showBookingModal = false"
              class="flex-1 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              @click="submitBooking"
              class="flex-1 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl transition-all shadow-sm"
            >
              确认预约
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 查看报告弹窗 -->
    <Teleport to="body">
      <div v-if="showReportModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200 flex">
          <!-- 左侧：报告列表 -->
          <div class="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
            <!-- 头部 -->
            <div class="p-4 border-b border-slate-200 bg-gradient-to-r from-rose-50 to-pink-50">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm">
                  <FileText :size="16" class="text-white" />
                </div>
                <div>
                  <h3 class="font-bold text-slate-800">体检报告</h3>
                  <p class="text-[10px] text-slate-500">{{ currentUser?.name }}</p>
                </div>
              </div>
            </div>

            <!-- 上传按钮 -->
            <div class="p-3 border-b border-slate-200">
              <label class="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-lg cursor-pointer transition-all shadow-sm hover:shadow text-sm font-medium">
                <UploadCloud :size="16" />
                <span>上传新报告</span>
                <input type="file" accept=".pdf" class="hidden" @change="handleReportUpload" multiple />
              </label>
            </div>

            <!-- 报告列表 -->
            <div class="flex-1 overflow-y-auto p-3 space-y-2">
              <div
                v-for="report in medicalReports"
                :key="report.id"
                @click="selectedReportId = report.id"
                class="p-3 rounded-lg cursor-pointer transition-all border"
                :class="selectedReportId === report.id ? 'bg-rose-50 border-rose-300 shadow-sm' : 'bg-white border-slate-200 hover:border-rose-200 hover:bg-rose-50/50'"
              >
                <div class="flex items-start gap-2">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" :class="getReportIconBg(report.type)">
                    <component :is="getReportIcon(report.type)" :size="16" class="text-white" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-800 truncate">{{ report.name }}</p>
                    <p class="text-[10px] text-slate-500">{{ report.date }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：PDF预览 -->
          <div class="flex-1 flex flex-col">
            <!-- 预览头部 -->
            <div class="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
              <div class="flex items-center gap-3">
                <h3 class="font-semibold text-slate-800">{{ selectedReport?.name || '选择报告查看详情' }}</h3>
                <span v-if="selectedReport" class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {{ selectedReport.date }}
                </span>
              </div>
              <div class="flex items-center gap-2">
                <button
                  v-if="selectedReport"
                  @click="downloadReport"
                  class="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Download :size="14" />
                  下载
                </button>
                <button
                  v-if="selectedReport"
                  @click="deleteReport"
                  class="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 :size="14" />
                  删除
                </button>
                <button
                  @click="showReportModal = false"
                  class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X :size="20" />
                </button>
              </div>
            </div>

            <!-- PDF预览区域 -->
            <div class="flex-1 overflow-y-auto bg-slate-100 p-4">
              <div v-if="selectedReport" class="bg-white rounded-lg shadow-sm h-full flex flex-col">
                <div class="flex-1 flex items-center justify-center">
                  <div class="text-center">
                    <div class="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-3">
                      <FileText :size="32" class="text-rose-600" />
                    </div>
                    <h4 class="font-semibold text-slate-800 mb-1">{{ selectedReport.name }}</h4>
                    <p class="text-sm text-slate-500 mb-3">上传于 {{ selectedReport.uploadDate }}</p>
                    <div class="flex items-center justify-center gap-2 text-xs text-slate-400">
                      <FileText :size="12" />
                      <span>PDF 文档</span>
                      <span>•</span>
                      <span>{{ selectedReport.fileSize }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="h-full flex items-center justify-center">
                <div class="text-center">
                  <div class="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3">
                    <FileText :size="32" class="text-slate-400" />
                  </div>
                  <p class="text-sm text-slate-500">请从左侧选择一份报告查看详情</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 教练管理弹窗 -->
    <Teleport to="body">
      <div v-if="showCoachManagementModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" @click.self="showCoachManagementModal = false"></div>
      <div v-if="showCoachManagementModal" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white rounded-2xl shadow-2xl z-[60]">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
              <span class="text-emerald-600 text-sm">👨‍⚕️</span>
            </div>
            <h3 class="font-bold text-lg text-slate-800">教练管理</h3>
          </div>
          <button @click="showCoachManagementModal = false" class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors">
            <X :size="20" />
          </button>
        </div>

        <div class="p-5">
          <!-- 当前已分配的教练列表 -->
          <div class="mb-4">
            <h4 class="text-sm font-semibold text-slate-700 mb-3">已分配教练 ({{ userAssignment?.coaches?.length || 0 }})</h4>
            <div v-if="userAssignment?.coaches && userAssignment.coaches.length > 0" class="space-y-2">
              <div
                v-for="coachAssignment in userAssignment.coaches"
                :key="coachAssignment.coachId"
                class="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                    {{ coachAssignment.coachName.charAt(0) }}
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-slate-800">{{ coachAssignment.coachName }}</div>
                    <div class="text-xs text-slate-500 mt-1">
                      <div>负载: {{ getCoachLoad(coachAssignment.coachId) }}/{{ getCoachMaxLoad(coachAssignment.coachId) }}</div>
                      <div class="mt-0.5">{{ formatDateRange(coachAssignment.startDate, coachAssignment.endDate) }}</div>
                      <div class="font-semibold text-emerald-600 mt-0.5">已干预 {{ calculateInterventionDays(coachAssignment.startDate, coachAssignment.endDate) }} 天</div>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="handleChangeCoach(coachAssignment.coachId)"
                    class="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    更换
                  </button>
                  <button
                    @click="handleRemoveCoach(coachAssignment.coachId)"
                    class="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    移除
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-6 bg-slate-50 rounded-xl">
              <p class="text-sm text-slate-500">暂未分配教练</p>
            </div>
          </div>

          <!-- 添加新教练按钮 -->
          <button
            @click="handleAddCoach"
            class="w-full py-3 border-2 border-dashed border-emerald-300 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus :size="16" />
            添加新教练
          </button>
        </div>
      </div>
    </Teleport>

    <!-- 医生管理弹窗 -->
    <Teleport to="body">
      <div v-if="showDoctorManagementModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" @click.self="showDoctorManagementModal = false"></div>
      <div v-if="showDoctorManagementModal" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-white rounded-2xl shadow-2xl z-[60]">
        <div class="p-5 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span class="text-blue-600 text-sm">🩺</span>
            </div>
            <h3 class="font-bold text-lg text-slate-800">医生管理</h3>
          </div>
          <button @click="showDoctorManagementModal = false" class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg transition-colors">
            <X :size="20" />
          </button>
        </div>

        <div class="p-5">
          <!-- 当前已分配的医生 -->
          <div class="mb-4">
            <h4 class="text-sm font-semibold text-slate-700 mb-3">已分配医生</h4>
            <div v-if="userAssignment?.doctorId" class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 flex-1">
                  <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {{ userAssignment.doctorName?.charAt(0) || '?' }}
                  </div>
                  <div class="flex-1">
                    <div class="font-medium text-slate-800">{{ userAssignment.doctorName }}</div>
                    <div class="text-xs text-slate-500 mt-1">
                      <div>主治医生</div>
                      <div v-if="userAssignment.doctorStartDate" class="mt-0.5">{{ formatDateRange(userAssignment.doctorStartDate, userAssignment.doctorEndDate) }}</div>
                      <div v-if="userAssignment.doctorStartDate" class="font-semibold text-blue-600 mt-0.5">已干预 {{ calculateInterventionDays(userAssignment.doctorStartDate, userAssignment.doctorEndDate) }} 天</div>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    @click="handleChangeDoctor"
                    class="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    更换
                  </button>
                  <button
                    @click="handleRemoveDoctor"
                    class="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    移除
                  </button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-6 bg-slate-50 rounded-xl">
              <p class="text-sm text-slate-500">暂未分配医生</p>
            </div>
          </div>

          <!-- 添加/分配医生按钮 -->
          <button
            v-if="!userAssignment?.doctorId"
            @click="handleAddDoctor"
            class="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus :size="16" />
            分配医生
          </button>
        </div>
      </div>
    </Teleport>

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

    <!-- Employee Assign Modals -->
    <EmployeeAssignModal
      v-model:show="showCoachModal"
      position="coach"
      :client-id="selectedUser || ''"
      :client-name="currentUser?.name || ''"
      :current-employee-id="isChangeCoachMode ? (currentChangingCoachId || '') : ''"
      @confirm="handleCoachAssignment"
    />

    <EmployeeAssignModal
      v-model:show="showDoctorModal"
      position="doctor"
      :client-id="selectedUser || ''"
      :client-name="currentUser?.name || ''"
      :current-employee-id="isChangeDoctorMode ? userAssignment?.doctorId : ''"
      @confirm="handleDoctorAssignment"
    />

    <!-- 备注侧边栏 -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <div
          v-if="showNotesSidebar"
          class="fixed top-0 right-0 h-full w-96 shadow-2xl z-50 flex flex-col"
          style="background: var(--card);"
        >
          <!-- 备注侧边栏头部 -->
          <div class="flex items-center justify-between p-4 border-b" style="border-color: var(--border);">
            <div class="flex items-center gap-2">
              <FileText :size="20" :style="{ color: '#6366f1' }" />
              <h3 class="text-lg font-bold" style="color: var(--text-primary);">用户备注</h3>
            </div>
            <button
              @click="showNotesSidebar = false"
              class="p-2 rounded-lg transition-colors"
              style="color: var(--text-secondary);"
              @mouseenter="$event.currentTarget.style.backgroundColor = 'var(--fill-light)'"
              @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'"
            >
              <X :size="20" />
            </button>
          </div>

          <!-- 备注内容区域 -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4" style="color: var(--text-primary);">
            <!-- 添加备注 -->
            <div class="p-3 rounded-lg" style="background: var(--fill-light);">
              <textarea
                v-model="newNote"
                placeholder="添加新备注..."
                rows="3"
                class="w-full px-3 py-2 text-sm rounded-lg border resize-none focus:outline-none focus:ring-2"
                style="border-color: var(--border); background: var(--background); color: var(--text-primary);"
              ></textarea>
              <div class="flex justify-end mt-2">
                <button
                  @click="addNote"
                  class="px-3 py-1.5 text-sm font-medium text-white rounded-lg"
                  style="background: #6366f1;"
                  @mouseenter="$event.currentTarget.style.backgroundColor = '#4f46e5'"
                  @mouseleave="$event.currentTarget.style.backgroundColor = '#6366f1'"
                >
                  添加备注
                </button>
              </div>
            </div>

            <!-- 备注列表 -->
            <div class="space-y-3">
              <div
                v-for="note in userNotes"
                :key="note.id"
                class="p-3 rounded-lg border relative"
                style="background: var(--background); border-color: var(--border);"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" :style="{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }">
                      {{ note.author.charAt(0) }}
                    </div>
                    <span class="text-xs font-medium" style="color: var(--text-primary);">{{ note.author }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px]" style="color: var(--text-secondary);">{{ note.time }}</span>
                    <button
                      @click="editingNoteId === note.id ? cancelEditNote() : startEditNote(note)"
                      class="p-1 rounded hover:bg-slate-100 transition-colors"
                      style="color: var(--text-secondary);"
                    >
                      <Edit3 v-if="editingNoteId !== note.id" :size="14" />
                      <X v-else :size="14" />
                    </button>
                  </div>
                </div>

                <!-- 编辑模式 -->
                <div v-if="editingNoteId === note.id">
                  <textarea
                    v-model="editingNoteContent"
                    rows="3"
                    class="w-full px-3 py-2 text-sm rounded-lg border resize-none focus:outline-none focus:ring-2"
                    style="border-color: var(--border); background: var(--fill-light); color: var(--text-primary);"
                  ></textarea>
                  <div class="flex justify-end gap-2 mt-2">
                    <button
                      @click="cancelEditNote"
                      class="px-3 py-1 text-xs font-medium rounded-lg transition-colors"
                      style="background: var(--fill-tertiary); color: var(--text-secondary);"
                    >
                      取消
                    </button>
                    <button
                      @click="saveEditNote"
                      class="px-3 py-1 text-xs font-medium text-white rounded-lg"
                      style="background: #6366f1;"
                    >
                      保存
                    </button>
                  </div>
                </div>

                <!-- 查看模式 -->
                <p v-else class="text-sm leading-relaxed" style="color: var(--text-regular);">
                  {{ note.content }}
                </p>
              </div>

              <!-- 空状态 -->
              <div v-if="userNotes.length === 0" class="text-center py-8">
                <FileText :size="40" class="mx-auto mb-2 opacity-50" style="color: var(--text-disabled);" />
                <p class="text-sm" style="color: var(--text-secondary);">暂无备注记录</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
      <!-- 遮罩层 -->
      <div
        v-if="showNotesSidebar"
        class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        @click="showNotesSidebar = false"
      ></div>
    </Teleport>

    <!-- 生理数据编辑模态框（原版） -->
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
          v-if="showVitalDataModal"
          class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          @click.self="showVitalDataModal = false"
        >
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <!-- 头部 -->
            <div class="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <component :is="editingVitalData?.icon" :size="20" class="text-indigo-600" />
                </div>
                <div>
                  <h3 class="font-bold text-lg text-slate-800">{{ editingVitalData?.label }}数据设置</h3>
                  <p class="text-xs text-slate-500">绑定设备和设置目标值</p>
                </div>
              </div>
              <button
                @click="showVitalDataModal = false"
                class="text-slate-400 hover:text-slate-600 hover:bg-white p-1.5 rounded-lg transition-all"
              >
                <X :size="20" />
              </button>
            </div>

            <!-- 表单内容 -->
            <div class="p-5 space-y-4">
              <!-- 当前值 -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  当前值
                </label>
                <div class="flex items-center gap-2">
                  <input
                    v-model="vitalDataForm.currentValue"
                    type="text"
                    class="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    :placeholder="`输入${editingVitalData?.label}当前值`"
                  />
                  <span class="text-sm text-slate-500 font-medium min-w-[60px]">{{ vitalDataForm.unit }}</span>
                </div>
              </div>

              <!-- 目标值 -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  目标值
                </label>
                <div class="flex items-center gap-2">
                  <input
                    v-model="vitalDataForm.target"
                    type="text"
                    class="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="输入目标值（如：65.0 或 60-100）"
                  />
                  <span class="text-sm text-slate-500 font-medium min-w-[60px]">{{ vitalDataForm.unit }}</span>
                </div>
                <p class="text-xs text-slate-400 mt-1">支持范围值（如：60-100）或单一目标值（如：65.0）</p>
              </div>

              <!-- 设备绑定 -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  绑定设备
                </label>
                <div class="relative">
                  <Smartphone :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    v-model="vitalDataForm.device"
                    type="text"
                    class="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="输入设备名称（如：Apple Watch）"
                  />
                </div>
                <p class="text-xs text-slate-400 mt-1">留空则不显示设备信息</p>
              </div>

              <!-- 常用设备快捷选择 -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  常用设备
                </label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="device in ['Apple Watch', '华为体脂秤', '欧姆龙血压计', '三诺血糖仪', '小米手环']"
                    :key="device"
                    @click="vitalDataForm.device = device"
                    class="px-3 py-1.5 text-xs rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    {{ device }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 底部按钮 -->
            <div class="flex flex-col gap-3 p-5 border-t border-slate-100 bg-slate-50">
              <!-- 快捷操作 -->
              <button
                @click="goToDevicesFromVitalModal"
                class="w-full px-4 py-2.5 rounded-lg border-2 border-teal-200 text-teal-700 font-medium hover:bg-teal-50 transition-all text-sm flex items-center justify-center gap-2"
              >
                <Watch :size="16" />
                硬件设备配置
              </button>

              <!-- 主操作按钮 -->
              <div class="flex gap-3">
                <button
                  @click="showVitalDataModal = false"
                  class="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-white transition-all text-sm"
                >
                  取消
                </button>
                <button
                  @click="saveVitalData"
                  class="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium hover:from-indigo-600 hover:to-purple-600 transition-all text-sm shadow-md hover:shadow-lg"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 阻碍库弹窗 -->
    <Teleport to="body">
      <div v-if="showObstacleLibraryModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <!-- 弹窗头部 -->
          <div class="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
                <Database :size="20" class="text-white" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-slate-800">阻碍库</h3>
                <p class="text-xs text-slate-500">查看和管理所有阻碍记录</p>
              </div>
            </div>
            <button @click="showObstacleLibraryModal = false" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" />
            </button>
          </div>

          <!-- 弹窗内容 -->
          <div class="p-5 max-h-[60vh] overflow-y-auto">
            <!-- 新增阻碍按钮 -->
            <div class="mb-4">
              <button
                @click="showAddObstacleForm = !showAddObstacleForm"
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl transition-all shadow-sm hover:shadow text-sm font-medium"
              >
                <Plus :size="16" />
                {{ showAddObstacleForm ? '收起' : '新增阻碍' }}
              </button>
            </div>

            <!-- 新增阻碍表单 -->
            <div v-if="showAddObstacleForm" class="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">阻碍类型</label>
                  <select v-model="newObstacle.type" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm">
                    <option value="">请选择类型</option>
                    <option value="饮食打卡阻碍">饮食打卡阻碍</option>
                    <option value="运动打卡阻碍">运动打卡阻碍</option>
                    <option value="服药依从性阻碍">服药依从性阻碍</option>
                    <option value="数据监测阻碍">数据监测阻碍</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1.5">详细描述</label>
                  <textarea
                    v-model="newObstacle.desc"
                    rows="3"
                    placeholder="请详细描述阻碍的具体情况..."
                    class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none text-sm"
                  ></textarea>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="addObstacle"
                    class="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg transition-all text-sm font-medium"
                  >
                    确认添加
                  </button>
                  <button
                    @click="cancelAddObstacle"
                    class="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-all text-sm font-medium"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>

            <!-- 阻碍列表 -->
            <div class="space-y-3">
              <div
                v-for="obs in obstacleLibrary"
                :key="obs.id"
                class="p-4 rounded-xl border transition-all"
                :class="obs.resolved ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-start gap-3 flex-1">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="obs.resolved ? 'bg-green-500' : 'bg-amber-500'">
                      <Check v-if="obs.resolved" :size="16" class="text-white" />
                      <AlertTriangle v-else :size="16" class="text-white" />
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <h4 class="font-bold text-sm" :class="obs.resolved ? 'text-green-800' : 'text-amber-800'">{{ obs.type }}</h4>
                        <span class="text-[10px] px-2 py-0.5 rounded-full" :class="obs.resolved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">
                          {{ obs.resolved ? '已解决' : '待处理' }}
                        </span>
                      </div>
                      <p class="text-xs text-slate-600 mb-2">{{ obs.desc }}</p>
                      <div class="flex items-center gap-3 text-[10px] text-slate-500">
                        <span class="flex items-center gap-1">
                          <Calendar :size="12" />
                          {{ obs.date }}
                        </span>
                        <span class="flex items-center gap-1">
                          <Clock :size="12" />
                          {{ obs.time }}
                        </span>
                        <span v-if="obs.resolved" class="text-green-600">解决于: {{ obs.resolvedAt }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col gap-2">
                    <button
                      v-if="!obs.resolved"
                      @click="resolveObstacle(obs.id)"
                      class="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-lg hover:bg-green-600 shadow-sm active:scale-95 transition-all"
                    >
                      标记解决
                    </button>
                    <button
                      @click="deleteObstacle(obs.id)"
                      class="px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-lg hover:bg-red-600 shadow-sm active:scale-95 transition-all"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="obstacleLibrary.length === 0" class="text-center py-8">
                <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Database :size="32" class="text-slate-400" />
                </div>
                <p class="text-sm text-slate-500">暂无阻碍记录</p>
                <p class="text-xs text-slate-400 mt-1">点击上方按钮添加新阻碍</p>
              </div>
            </div>
          </div>

          <!-- 弹窗底部 -->
          <div class="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
              @click="showObstacleLibraryModal = false"
              class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 营养素库弹窗 -->
    <Teleport to="body">
      <div v-if="showNutrientLibraryModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-200">
          <!-- 弹窗头部 -->
          <div class="flex justify-between items-center p-5 border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                <Package :size="20" class="text-white" />
              </div>
              <div>
                <h3 class="font-bold text-lg text-slate-800">药品/保健品商品库</h3>
                <p class="text-xs text-slate-500">为 {{ currentUser?.name }} 选择营养素配置商品</p>
              </div>
            </div>
            <button @click="showNutrientLibraryModal = false" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" />
            </button>
          </div>

          <!-- 弹窗内容 -->
          <div class="p-5 max-h-[60vh] overflow-y-auto">
            <!-- 筛选标签 -->
            <div class="flex items-center gap-2 mb-4">
              <button
                @click="selectedProductType = 'all'"
                class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                :class="selectedProductType === 'all' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              >
                全部
              </button>
              <button
                @click="selectedProductType = 'medication'"
                class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                :class="selectedProductType === 'medication' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              >
                药品
              </button>
              <button
                @click="selectedProductType = 'supplement'"
                class="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                :class="selectedProductType === 'supplement' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              >
                保健品
              </button>
            </div>

            <!-- 商品列表 -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="product in filteredProducts"
                :key="product.id"
                @click="toggleProductSelection(product.id)"
                class="p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg group relative"
                :class="isProductSelected(product.id) ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white hover:border-green-300'"
              >
                <!-- 选中标记 -->
                <div v-if="isProductSelected(product.id)" class="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Check :size="14" class="text-white" />
                </div>

                <!-- 商品图标 -->
                <div class="flex items-center gap-3 mb-3">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-slate-50">
                    {{ product.image }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-bold text-sm text-slate-800 truncate">{{ product.name }}</h4>
                    <p class="text-[10px] text-slate-500">{{ product.manufacturer }}</p>
                  </div>
                </div>

                <!-- 商品描述 -->
                <p class="text-xs text-slate-600 mb-2">{{ product.description }}</p>

                <!-- 规格和价格 -->
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[10px] text-slate-500">{{ product.specifications }}</span>
                  <span class="text-sm font-bold text-green-600">¥{{ product.price }}</span>
                </div>

                <!-- 类型标签 -->
                <div class="flex flex-wrap gap-1 mb-3">
                  <span
                    class="text-[9px] px-2 py-0.5 rounded-full"
                    :class="getProductTypeColor(product.type)"
                  >
                    {{ getProductTypeLabel(product.type) }}
                  </span>
                  <span v-for="tag in product.tags" :key="tag" class="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                    {{ tag }}
                  </span>
                </div>

                <!-- 营养成分 -->
                <div v-if="product.type === 'supplement'" class="grid grid-cols-4 gap-1 p-2 bg-slate-50 rounded-lg">
                  <div class="text-center">
                    <div class="text-[8px] text-slate-500">热量</div>
                    <div class="text-[10px] font-bold text-slate-700">{{ product.nutrients.calories }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-[8px] text-slate-500">蛋白</div>
                    <div class="text-[10px] font-bold text-blue-600">{{ product.nutrients.protein }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-[8px] text-slate-500">碳水</div>
                    <div class="text-[10px] font-bold text-amber-600">{{ product.nutrients.carbs }}</div>
                  </div>
                  <div class="text-center">
                    <div class="text-[8px] text-slate-500">脂肪</div>
                    <div class="text-[10px] font-bold text-rose-600">{{ product.nutrients.fat }}</div>
                  </div>
                </div>

                <!-- 库存 -->
                <div class="flex items-center justify-between mt-2">
                  <span class="text-[10px]" :class="product.stock > 20 ? 'text-green-600' : 'text-orange-600'">
                    库存: {{ product.stock }}
                  </span>
                  <span class="text-[10px] text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {{ isProductSelected(product.id) ? '点击取消' : '点击选择' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 弹窗底部 -->
          <div class="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
            <!-- 提醒日期设置 -->
            <div v-if="currentUserProducts.length > 0" class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1.5">
                  <BrainCircuit :size="12" class="inline mr-1 text-blue-500" />
                  处方提醒日期
                </label>
                <input
                  v-model="prescriptionReminderDate"
                  type="date"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1.5">
                  <Bell :size="12" class="inline mr-1 text-orange-500" />
                  复购提醒日期
                </label>
                <input
                  v-model="repurchaseReminderDate"
                  type="date"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-xs"
                />
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex justify-between items-center gap-3">
              <span class="text-xs text-slate-500">
                已选择 {{ currentUserProducts.length }} 件商品
              </span>
              <div class="flex gap-2">
                <button
                  @click="showNutrientLibraryModal = false"
                  class="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
                >
                  取消
                </button>
                <button
                  v-if="currentUserProducts.length > 0"
                  @click="handleCreateNutrientOrder"
                  class="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-xl transition-colors"
                >
                  创建订购记录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 基础信息编辑弹窗 -->
    <Teleport to="body">
      <div v-if="showBasicInfoEditModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          <!-- 标题栏 -->
          <div class="flex items-center justify-between p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex-shrink-0">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm">
                <Edit3 :size="16" class="text-white" />
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-800">编辑客情基础信息</h3>
                <p class="text-[10px] text-slate-500">更新性别、年龄、依从度等基础信息</p>
              </div>
            </div>
            <button
              @click="showBasicInfoEditModal = false"
              class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all"
            >
              <X :size="18" />
            </button>
          </div>

          <!-- 表单内容 - 可滚动 -->
          <div class="p-4 space-y-3 overflow-y-auto">
            <!-- 性别和年龄 -->
            <div class="grid grid-cols-2 gap-3">
              <!-- 性别 -->
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1.5">性别</label>
                <select
                  v-model="basicInfoForm.gender"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs"
                >
                  <option value="">请选择性别</option>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>

              <!-- 年 龄2 -->
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1.5">年龄</label>
                <input
                  v-model.number="basicInfoForm.age"
                  type="number"
                  min="0"
                  max="120"
                  placeholder="请输入年龄"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs"
                />
              </div>
            </div>

            <!-- 依从度 -->
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1.5">依从度评分（0-10分）</label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="basicInfoForm.compliance"
                  type="number"
                  min="0"
                  max="10"
                  class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs"
                />
                <div class="flex items-center gap-1">
                  <span
                    class="px-2.5 py-1.5 text-xs font-bold rounded-lg border"
                    :style="{
                      background: getComplianceColor(basicInfoForm.compliance).bg,
                      color: getComplianceColor(basicInfoForm.compliance).text,
                      borderColor: getComplianceColor(basicInfoForm.compliance).border
                    }"
                  >
                    {{ basicInfoForm.compliance }}分
                  </span>
                </div>
              </div>
              <p class="text-[10px] text-slate-500 mt-1">0-2分：很差 | 3-4分：较差 | 5-6分：一般 | 7-8分：良好 | 9-10分：优秀</p>
            </div>

            <!-- 来源渠道 -->
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1.5">来源渠道</label>
              <select
                v-model="basicInfoForm.sourceChannel"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs"
              >
                <option value="">请选择来源渠道</option>
                <option value="瑞承">瑞承</option>
                <option value="养老院">养老院</option>
                <option value="五六华旅">五六华旅</option>
                <option value="线上广告">线上广告</option>
                <option value="线下讲座">线下讲座</option>
                <option value="线下转介绍">线下转介绍</option>
                <option value="朋友推荐">朋友推荐</option>
                <option value="知乎">知乎</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <!-- 付费金额 -->
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1.5">付费金额（元）</label>
              <input
                v-model.number="basicInfoForm.paymentAmount"
                type="number"
                min="0"
                step="100"
                placeholder="请输入付费金额"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs"
              />
            </div>

            <!-- 用户目标 -->
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1.5">用户目标</label>
              <textarea
                v-model="basicInfoForm.userGoal"
                rows="2"
                placeholder="请输入用户的健康目标（如：控制血糖、减轻体重、改善睡眠等）"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs resize-none"
              ></textarea>
            </div>

            <!-- 常用目标快捷选择 -->
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1.5">常用目标</label>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="goal in ['控制血糖', '减轻体重', '改善睡眠', '预防并发症', '优化代谢', '建立习惯', '长期管理', '维持健康']"
                  :key="goal"
                  @click="basicInfoForm.userGoal = goal"
                  class="px-2 py-1 text-[10px] rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  {{ goal }}
                </button>
              </div>
            </div>

            <!-- 干预日期 -->
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1.5">干预开始日期</label>
              <input
                v-model="basicInfoForm.interventionStartDate"
                type="date"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs"
              />
              <p class="text-[10px] text-slate-500 mt-1">该日期用于计算干预时长，建议设置为首次分配教练或医生的日期</p>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 flex-shrink-0">
            <button
              @click="showBasicInfoEditModal = false"
              class="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              @click="saveBasicInfo"
              class="px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors shadow-md hover:shadow-lg"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 趋势图详情模态框 -->
    <Teleport to="body">
      <div v-if="showTrendDetailModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
          <!-- 标题栏 -->
          <div class="flex items-center justify-between p-5 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <component :is="selectedTrendChart?.icon" :size="20" :class="selectedTrendChart?.iconColor" />
              <h3 class="text-lg font-bold text-slate-800">{{ selectedTrendChart?.label }}趋势</h3>
            </div>
            <div class="flex items-center gap-3">
              <!-- 时间范围切换 -->
              <div class="flex items-center bg-slate-100 rounded-lg p-1">
                <button
                  @click="trendTimeRange = '7days'"
                  :class="['px-3 py-1.5 text-xs font-medium rounded-md transition-all', trendTimeRange === '7days' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']"
                >
                  近7天
                </button>
                <button
                  @click="trendTimeRange = '30days'"
                  :class="['px-3 py-1.5 text-xs font-medium rounded-md transition-all', trendTimeRange === '30days' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700']"
                >
                  近30天
                </button>
              </div>
              <button
                @click="showTrendDetailModal = false"
                class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X :size="20" />
              </button>
            </div>
          </div>

          <!-- 趋势图内容 -->
          <div class="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div v-if="selectedTrendChart">
              <!-- 计算当前时间范围的天数 -->
              <template v-if="trendTimeRange === '7days'">
                <!-- 7天数据 -->
                <div v-if="selectedTrendChart.type === 'sleep'" class="space-y-6">
                  <!-- 睡眠柱状图 -->
                  <div>
                    <h4 class="text-sm font-semibold text-slate-700 mb-4">每日睡眠时长（近7天）</h4>
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="flex items-end justify-between h-48 gap-2">
                        <div
                          v-for="(val, i) in generateTrendData('sleep', 7).data"
                          :key="i"
                          class="flex-1 flex flex-col items-center relative"
                        >
                          <span class="text-[9px] font-bold text-slate-700 mb-1">{{ val }}h</span>
                          <div
                            :class="['w-full rounded-t-sm transition-all duration-300', val < 6 ? 'bg-amber-400' : val >= 7 ? 'bg-indigo-400' : 'bg-slate-300']"
                            :style="{ height: `${((val - 4) / 6) * 100}%`, minHeight: '4px' }"
                          ></div>
                          <span class="text-[8px] text-slate-400 mt-1">{{ generateTrendData('sleep', 7).labels[i] }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 统计摘要 -->
                  <div class="grid grid-cols-4 gap-4">
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="text-[10px] text-slate-500 mb-1">平均睡眠</div>
                      <div class="text-xl font-bold text-slate-800">{{ (generateTrendData('sleep', 7).data.reduce((a, b) => a + b, 0) / 7).toFixed(1) }}h</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="text-[10px] text-slate-500 mb-1">最高时长</div>
                      <div class="text-xl font-bold text-green-600">{{ Math.max(...generateTrendData('sleep', 7).data) }}h</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="text-[10px] text-slate-500 mb-1">最低时长</div>
                      <div class="text-xl font-bold text-amber-600">{{ Math.min(...generateTrendData('sleep', 7).data) }}h</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="text-[10px] text-slate-500 mb-1">达标天数</div>
                      <div class="text-xl font-bold text-indigo-600">{{ generateTrendData('sleep', 7).data.filter(v => v >= 7).length }}天</div>
                    </div>
                  </div>
                </div>

                <!-- 其他趋势的折线图 -->
                <div v-else class="space-y-6">
                  <div>
                    <h4 class="text-sm font-semibold text-slate-700 mb-4">每日{{ selectedTrendChart.label }}趋势（近7天）</h4>
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 relative">
                      <svg viewBox="0 0 1000 220" class="w-full h-52 overflow-visible">
                        <line v-for="i in 5" :key="i" :x1="0" :y1="i * 40" :x2="1000" :y2="i * 40" stroke="#e2e8f0" stroke-width="1" />
                        <line v-for="i in 10" :key="`v${i}`" :x1="i * 100" :y1="0" :x2="i * 100" :y2="200" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4" />

                        <g v-if="selectedTrendChart">
                          <polygon :points="getTrendChartData(selectedTrendChart.type, 7).areaPoints" :class="selectedTrendChart.fillClass" />
                          <polyline :points="getTrendChartData(selectedTrendChart.type, 7).points" fill="none" :class="selectedTrendChart.strokeClass" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                          <g v-for="(pt, i) in getTrendChartData(selectedTrendChart.type, 7).dataNodes" :key="i">
                            <circle :cx="pt.x" :cy="pt.y" r="4" :class="['fill-white', selectedTrendChart.dotClass]" stroke-width="2" />
                            <text :x="pt.x" :y="pt.y - 12" text-anchor="middle" class="text-[9px] font-semibold fill-slate-700">
                              {{ generateTrendData(selectedTrendChart.type, 7).data[i] }}
                            </text>
                          </g>
                        </g>
                      </svg>
                    </div>
                  </div>

                  <div class="flex justify-between px-4 text-[10px] text-slate-400">
                    <span v-for="(label, i) in generateTrendData(selectedTrendChart.type, 7).labels" :key="i">{{ label }}</span>
                  </div>

                  <div class="grid grid-cols-4 gap-4">
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="text-[10px] text-slate-500 mb-1">平均值</div>
                      <div class="text-xl font-bold text-slate-800">{{ (generateTrendData(selectedTrendChart.type, 7).data.reduce((a, b) => a + b, 0) / 7).toFixed(1) }}</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="text-[10px] text-slate-500 mb-1">最高值</div>
                      <div class="text-xl font-bold text-rose-600">{{ Math.max(...generateTrendData(selectedTrendChart.type, 7).data) }}</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="text-[10px] text-slate-500 mb-1">最低值</div>
                      <div class="text-xl font-bold text-green-600">{{ Math.min(...generateTrendData(selectedTrendChart.type, 7).data) }}</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="text-[10px] text-slate-500 mb-1">趋势</div>
                      <div class="text-xl font-bold" :class="getTrendDirection(selectedTrendChart.type) === 'up' ? 'text-rose-600' : 'text-green-600'">
                        {{ getTrendDirection(selectedTrendChart.type) === 'up' ? '↑ 上升' : '↓ 下降' }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <template v-else>
                <!-- 30天数据 -->
                <div v-if="selectedTrendChart.type === 'sleep'" class="space-y-6">
                  <!-- 睡眠柱状图 -->
                  <div>
                    <h4 class="text-sm font-semibold text-slate-700 mb-4">每日睡眠时长（近30天）</h4>
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="flex items-end justify-between h-48 gap-1">
                        <div v-for="(val, i) in generateTrendData('sleep', 30).data" :key="i" class="flex-1 flex flex-col items-center relative">
                          <span class="text-[9px] font-bold text-slate-700 mb-1">{{ val }}h</span>
                          <div :class="['w-full rounded-t-sm transition-all duration-300', val < 6 ? 'bg-amber-400' : val >= 7 ? 'bg-indigo-400' : 'bg-slate-300']" :style="{ height: `${((val - 4) / 6) * 100}%`, minHeight: '4px' }"></div>
                          <span class="text-[8px] text-slate-400 mt-1">{{ generateTrendData('sleep', 30).labels[i] }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 统计摘要 -->
                  <div class="grid grid-cols-4 gap-4">
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="text-[10px] text-slate-500 mb-1">平均睡眠</div>
                      <div class="text-xl font-bold text-slate-800">{{ (generateTrendData('sleep', 30).data.reduce((a, b) => a + b, 0) / 30).toFixed(1) }}h</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="text-[10px] text-slate-500 mb-1">最高时长</div>
                      <div class="text-xl font-bold text-green-600">{{ Math.max(...generateTrendData('sleep', 30).data) }}h</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="text-[10px] text-slate-500 mb-1">最低时长</div>
                      <div class="text-xl font-bold text-amber-600">{{ Math.min(...generateTrendData('sleep', 30).data) }}h</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="text-[10px] text-slate-500 mb-1">达标天数</div>
                      <div class="text-xl font-bold text-indigo-600">{{ generateTrendData('sleep', 30).data.filter(v => v >= 7).length }}天</div>
                    </div>
                  </div>
                </div>

                <!-- 其他趋势的折线图 -->
                <div v-else class="space-y-6">
                  <div>
                    <h4 class="text-sm font-semibold text-slate-700 mb-4">每日{{ selectedTrendChart.label }}趋势（近30天）</h4>
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 relative">
                      <svg viewBox="0 0 1000 220" class="w-full h-52 overflow-visible">
                        <line v-for="i in 5" :key="i" :x1="0" :y1="i * 40" :x2="1000" :y2="i * 40" stroke="#e2e8f0" stroke-width="1" />
                        <line v-for="i in 10" :key="`v${i}`" :x1="i * 100" :y1="0" :x2="i * 100" :y2="200" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4" />

                        <g v-if="selectedTrendChart">
                          <polygon :points="getTrendChartData(selectedTrendChart.type, 30).areaPoints" :class="selectedTrendChart.fillClass" />
                          <polyline :points="getTrendChartData(selectedTrendChart.type, 30).points" fill="none" :class="selectedTrendChart.strokeClass" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                          <g v-for="(pt, i) in getTrendChartData(selectedTrendChart.type, 30).dataNodes" :key="i">
                            <circle :cx="pt.x" :cy="pt.y" r="4" :class="['fill-white', selectedTrendChart.dotClass]" stroke-width="2" />
                            <text :x="pt.x" :y="pt.y - 12" text-anchor="middle" class="text-[9px] font-semibold fill-slate-700">
                              {{ generateTrendData(selectedTrendChart.type, 30).data[i] }}
                            </text>
                          </g>
                        </g>
                      </svg>
                    </div>
                  </div>

                  <div class="flex justify-between px-4 text-[10px] text-slate-400">
                    <span v-for="(label, i) in generateTrendData(selectedTrendChart.type, 30).labels" :key="i" v-show="i % 5 === 0">{{ label }}</span>
                  </div>

                  <div class="grid grid-cols-4 gap-4">
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="text-[10px] text-slate-500 mb-1">平均值</div>
                      <div class="text-xl font-bold text-slate-800">{{ (generateTrendData(selectedTrendChart.type, 30).data.reduce((a, b) => a + b, 0) / 30).toFixed(1) }}</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="text-[10px] text-slate-500 mb-1">最高值</div>
                      <div class="text-xl font-bold text-rose-600">{{ Math.max(...generateTrendData(selectedTrendChart.type, 30).data) }}</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="text-[10px] text-slate-500 mb-1">最低值</div>
                      <div class="text-xl font-bold text-green-600">{{ Math.min(...generateTrendData(selectedTrendChart.type, 30).data) }}</div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div class="text-[10px] text-slate-500 mb-1">趋势</div>
                      <div class="text-xl font-bold" :class="getTrendDirection(selectedTrendChart.type) === 'up' ? 'text-rose-600' : 'text-green-600'">
                        {{ getTrendDirection(selectedTrendChart.type) === 'up' ? '↑ 上升' : '↓ 下降' }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, watch, nextTick, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useUserTags } from '../composables/useUserTags'
import { useUserCompliance } from '../composables/useUserCompliance'
import { useEmployeeData, type ClientAssignment } from '../composables/useEmployeeData'
import { useSystemLog } from '../composables/useSystemLog'
import type { ComplianceScore } from '../composables/useUserCompliance'
import EmployeeAssignModal from '../components/EmployeeAssignModal.vue'

// 主题相关
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')

// Employee data
const {
  getEmployeeById,
  getClientAssignment,
  assignCoach,
  changeCoach,
  removeCoach,
  assignDoctor,
  changeDoctor,
  removeDoctor
} = useEmployeeData()

// System log
const {
  logAssignCoach,
  logChangeCoach,
  logRemoveCoach,
  logAssignDoctor,
  logChangeDoctor,
  logRemoveDoctor
} = useSystemLog()
import {
  Users,
  User,
  Search,
  Check,
  X,
  Plus,
  Activity,
  ListTodo,
  ShieldAlert,
  UserCheck,
  Calendar,
  Calendar as CalendarIcon,
  CalendarCheck,
  Zap,
  Flag,
  Clock,
  Phone,
  Video,
  MessageSquare,
  FileText,
  FileSpreadsheet,
  UploadCloud,
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
  BookOpen,
  Database,
  Target,
  Settings,
  Heart,
  Droplet,
  Flame,
  Utensils,
  Moon,
  Smartphone,
  ChevronDown,
  Image as ImageIcon,
  Bell,
  Apple,
  Pill,
  Package,
  ShoppingCart,
  Trash2,
  Edit,
  Watch,
  Hash,
  Share2,
  Edit3
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
  if (!selectedUser.value) return 5
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
  gender?: string
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
  interventionStartDate?: Date
  sourceChannel?: string // 来源渠道
  paymentAmount?: number // 付费金额
  userGoal?: string // 用户目标
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
const isSidebarCollapsed = ref(false)
const showTrendDetailModal = ref(false)
const selectedTrendChart = ref<any>(null)
const trendTimeRange = ref<'7days' | '30days'>('30days')
const hoveredTooltip = ref<{ x: number, y: number, text: string } | null>(null)
const showCourseLearningModal = ref(false)
const showBasicInfoEditModal = ref(false)
const basicInfoForm = ref({
  gender: '',
  age: 0,
  compliance: 5,
  sourceChannel: '',
  paymentAmount: 0,
  userGoal: '',
  interventionStartDate: ''
})

// 课程学习数据
const courseLearningData = ref({
  totalCount: 5,
  completedCount: 3,
  courses: [
    { id: 1, title: '糖尿病基础知识', duration: '15分钟', completed: true, completedAt: '09:30' },
    { id: 2, title: '血糖监测方法', duration: '20分钟', completed: true, completedAt: '10:15' },
    { id: 3, title: '饮食管理指南', duration: '25分钟', completed: true, completedAt: '14:20' },
    { id: 4, title: '运动康复训练', duration: '18分钟', completed: false },
    { id: 5, title: '药物治疗说明', duration: '22分钟', completed: false }
  ]
})

// 30天趋势数据缓存
const trendDataCache = ref<Record<string, { data: number[], labels: string[] }>>({})

// 初始化趋势数据缓存
const initTrendDataCache = () => {
  const types = ['glucose', 'heartRate', 'weight', 'sleep']
  const daysOptions: (7 | 30)[] = [7, 30]

  types.forEach(type => {
    daysOptions.forEach(days => {
      const cacheKey = `${type}_${days}days`
      if (!trendDataCache.value[cacheKey]) {
        trendDataCache.value[cacheKey] = generateTrendDataUncached(type, days)
      }
    })
  })
}

// 生成趋势数据（未缓存版本，支持7天和30天）
const generateTrendDataUncached = (type: string, days: 7 | 30 = 30) => {
  const data: number[] = []
  const labels: string[] = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    labels.push(`${date.getMonth() + 1}/${date.getDate()}`)

    // 根据类型生成模拟数据
    if (type === 'glucose') {
      // 血糖：5.5-7.5 mmol/L，随机波动
      data.push(+(5.5 + Math.random() * 2).toFixed(1))
    } else if (type === 'heartRate') {
      // 心率：70-85 bpm
      data.push(Math.round(70 + Math.random() * 15))
    } else if (type === 'weight') {
      // 体重：缓慢下降趋势
      const baseWeight = days === 7 ? 68.8 : 69.5
      const step = days === 7 ? 0.02 : 0.05
      const baseValue = baseWeight - ((days - 1 - i) * step)
      data.push(+(baseValue + (Math.random() * 0.4 - 0.2)).toFixed(1))
    } else if (type === 'sleep') {
      // 睡眠：6-9小时
      data.push(+(6 + Math.random() * 3).toFixed(1))
    }
  }

  return { data, labels }
}

// 初始化缓存
onMounted(() => {
  initTrendDataCache()
})

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

// 备注侧边栏状态
const showNotesSidebar = ref(false)

// 日程列表展开状态
const showScheduleList = ref(false)

// 任务详情模态框状态
const showTaskDetailModal = ref(false)

// 今日任务数据
const dailyTasks = computed(() => {
  const completed = userData?.todayCompleted || 0
  const allTasks = [
    { id: 1, title: '早餐打卡', completed: completed >= 1, time: '08:00', type: 'meal', icon: '🍳', description: '上传早餐照片并记录饮食' },
    { id: 2, title: '晨起体重测量', completed: completed >= 2, time: '07:30', type: 'health', icon: '⚖️', description: '测量并记录空腹体重' },
    { id: 3, title: '血压测量', completed: completed >= 3, time: '08:30', type: 'health', icon: '💓', description: '测量早血压并记录' },
    { id: 4, title: '午餐打卡', completed: completed >= 4, time: '12:00', type: 'meal', icon: '🍱', description: '上传午餐照片并记录饮食' },
    { id: 5, title: '血糖监测', completed: completed >= 5, time: '14:00', type: 'health', icon: '🩸', description: '测量餐后2小时血糖' },
    { id: 6, title: '运动打卡', completed: completed >= 6, time: '17:00', type: 'exercise', icon: '🏃', description: '完成30分钟有氧运动' },
    { id: 7, title: '晚餐打卡', completed: completed >= 7, time: '18:00', type: 'meal', icon: '🍲', description: '上传晚餐照片并记录饮食' },
    { id: 8, title: '服药提醒', completed: completed >= 8, time: '20:00', type: 'medication', icon: '💊', description: '服用降压药和替尔泊肽' }
  ]
  // 只显示总任务数的部分
  return allTasks.slice(0, userData?.todayTasks || 8)
})

// 用户教练/医生分配数据
const userAssignment = computed(() => {
  if (!selectedUser.value) return null
  return getClientAssignment(selectedUser.value)
})

// 模态框状态
const showCoachModal = ref(false)
const showDoctorModal = ref(false)
const isChangeCoachMode = ref(false)
const isChangeDoctorMode = ref(false)
const currentChangingCoachId = ref<string | null>(null)

// 管理弹窗状态
const showCoachManagementModal = ref(false)
const showDoctorManagementModal = ref(false)

// 营养素设置状态
const showNutrientSettings = ref(false)
const nutrientConfigs = ref([
  { name: '卡路里', unit: 'kcal', target: 1800, key: 'cal', isMacro: false },
  { name: '碳水化合物', unit: 'g', target: 220, key: 'carbs', isMacro: true },
  { name: '蛋白质', unit: 'g', target: 80, key: 'protein', isMacro: true },
  { name: '脂肪', unit: 'g', target: 50, key: 'fat', isMacro: true },
  { name: '膳食纤维', unit: 'g', target: 25, key: 'fiber', isMacro: true },
])

const newNutrient = ref({ name: '', target: '', unit: 'g' })

// 药品/保健品商品库数据
const productLibrary = ref([
  {
    id: 'prod001',
    name: '替尔泊肽注射液',
    type: 'medication',
    description: 'GLP-1受体激动剂，用于降糖减重',
    manufacturer: '礼来公司',
    specifications: '2.4mg/支',
    price: 1200,
    nutrients: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    image: '💉',
    tags: ['处方药', '糖尿病', '减重'],
    stock: 50
  },
  {
    id: 'prod002',
    name: '二甲双胍缓释片',
    type: 'medication',
    description: '双胍类口服降糖药',
    manufacturer: '中美施贵宝',
    specifications: '500mg×30片',
    price: 45,
    nutrients: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    image: '💊',
    tags: ['处方药', '糖尿病', '一线用药'],
    stock: 200
  },
  {
    id: 'prod003',
    name: '乳清蛋白粉',
    type: 'supplement',
    description: '高品质乳清蛋白，支持肌肉健康',
    manufacturer: '汤臣倍健',
    specifications: '500g/罐',
    price: 298,
    nutrients: { calories: 380, protein: 80, carbs: 10, fat: 5 },
    image: '🥛',
    tags: ['保健品', '高蛋白', '运动'],
    stock: 80
  },
  {
    id: 'prod004',
    name: '深海鱼油软胶囊',
    type: 'supplement',
    description: '富含Omega-3，心血管健康',
    manufacturer: 'Swisse',
    specifications: '400粒',
    price: 168,
    nutrients: { calories: 90, protein: 0, carbs: 0, fat: 10 },
    image: '🐟',
    tags: ['保健品', '心血管', 'Omega-3'],
    stock: 120
  },
  {
    id: 'prod005',
    name: '复合维生素B族',
    type: 'supplement',
    description: '全面B族维生素，提升代谢',
    manufacturer: '益生康健',
    specifications: '100片',
    price: 89,
    nutrients: { calories: 20, protein: 0, carbs: 2, fat: 0 },
    image: '💊',
    tags: ['保健品', '维生素', '代谢'],
    stock: 150
  },
  {
    id: 'prod006',
    name: '钙加维生素D软胶囊',
    type: 'supplement',
    description: '补充钙质，强健骨骼',
    manufacturer: '安利纽崔莱',
    specifications: '200粒',
    price: 195,
    nutrients: { calories: 50, protein: 5, carbs: 3, fat: 2 },
    image: '🦴',
    tags: ['保健品', '补钙', '骨骼健康'],
    stock: 90
  },
  {
    id: 'prod007',
    name: '氨氯地平片',
    type: 'medication',
    description: '钙通道阻滞剂，降压药',
    manufacturer: '辉瑞制药',
    specifications: '5mg×30片',
    price: 35,
    nutrients: { calories: 0, protein: 0, carbs: 0, fat: 0 },
    image: '💊',
    tags: ['处方药', '高血压', '心血管'],
    stock: 180
  },
  {
    id: 'prod008',
    name: '益生菌粉',
    type: 'supplement',
    description: '调节肠道菌群，改善消化',
    manufacturer: 'Culturelle',
    specifications: '30袋',
    price: 225,
    nutrients: { calories: 30, protein: 2, carbs: 5, fat: 0 },
    image: '🦠',
    tags: ['保健品', '益生菌', '肠道健康'],
    stock: 70
  }
])

// 用户已选择的商品
const userSelectedProducts = ref<Record<string, string[]>>({})

// 用户营养素订购记录
interface NutrientOrder {
  orderNumber: number // 第几次订购
  orderDate: string // 订购时间
  products: string[] // 营养素配置清单（产品ID列表）
  prescriptionReminder: string // 处方提醒时间
  repurchaseReminder: string // 复购提醒时间
}

const userNutrientOrders = ref<Record<string, NutrientOrder[]>>({})

// 初始化一些模拟订购记录
onMounted(() => {
  // 为用户2创建订购记录
  userNutrientOrders.value['2'] = [
    {
      orderNumber: 1,
      orderDate: '2026-03-15 10:30',
      products: ['prod001', 'prod003'],
      prescriptionReminder: '2026-03-20',
      repurchaseReminder: '2026-06-15'
    }
  ]
})

// 当前用户选择的商品列表
const currentUserProducts = computed(() => {
  if (!selectedUser.value) return []
  const productIds = userSelectedProducts.value[selectedUser.value] || []
  return productLibrary.value.filter(p => productIds.includes(p.id))
})

// 当前用户的订购记录列表
const currentUserNutrientOrders = computed(() => {
  if (!selectedUser.value) return []
  return userNutrientOrders.value[selectedUser.value] || []
})

// 计算配置商品总价格
const getSelectedProductsTotal = () => {
  return currentUserProducts.value.reduce((total, product) => total + product.price, 0)
}

// 创建新的订购记录
const createNutrientOrder = (prescriptionDate: string, repurchaseDate: string) => {
  if (!selectedUser.value) return

  const productIds = userSelectedProducts.value[selectedUser.value] || []
  if (productIds.length === 0) {
    toastRef.value?.warning('请先选择营养素配置')
    return
  }

  if (!userNutrientOrders.value[selectedUser.value]) {
    userNutrientOrders.value[selectedUser.value] = []
  }

  const orders = userNutrientOrders.value[selectedUser.value]
  const nextOrderNumber = orders.length + 1

  orders.push({
    orderNumber: nextOrderNumber,
    orderDate: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    products: [...productIds],
    prescriptionReminder: prescriptionDate,
    repurchaseReminder: repurchaseDate
  })

  // 清空已选择的商品
  userSelectedProducts.value[selectedUser.value] = []

  toastRef.value?.success(`第 ${nextOrderNumber} 次营养素订购记录已创建`)
}

// 获取订购记录的产品详情
const getOrderProducts = (order: NutrientOrder) => {
  return productLibrary.value.filter(p => order.products.includes(p.id))
}

// 营养素库模态框状态
const showNutrientLibraryModal = ref(false)
const selectedProductType = ref<'all' | 'medication' | 'supplement'>('all')
const prescriptionReminderDate = ref('')
const repurchaseReminderDate = ref('')

// 筛选后的商品列表
const filteredProducts = computed(() => {
  if (selectedProductType.value === 'all') {
    return productLibrary.value
  }
  return productLibrary.value.filter(p => p.type === selectedProductType.value)
})

// 打开营养素库
const openNutrientLibrary = () => {
  if (!selectedUser.value) {
    toastRef.value?.warning('请先选择一个用户')
    return
  }
  selectedProductType.value = 'all'
  // 设置默认提醒日期（处方提醒3天后，复购提醒3个月后）
  const today = new Date()
  const prescriptionDate = new Date(today)
  prescriptionDate.setDate(today.getDate() + 3)
  const repurchaseDate = new Date(today)
  repurchaseDate.setMonth(today.getMonth() + 3)

  prescriptionReminderDate.value = prescriptionDate.toISOString().split('T')[0]
  repurchaseReminderDate.value = repurchaseDate.toISOString().split('T')[0]

  showNutrientLibraryModal.value = true
}

// 处理创建订购记录
const handleCreateNutrientOrder = () => {
  if (!selectedUser.value) return

  const productIds = userSelectedProducts.value[selectedUser.value] || []
  if (productIds.length === 0) {
    toastRef.value?.warning('请先选择营养素配置')
    return
  }

  if (!prescriptionReminderDate.value || !repurchaseReminderDate.value) {
    toastRef.value?.warning('请设置处方提醒和复购提醒日期')
    return
  }

  createNutrientOrder(prescriptionReminderDate.value, repurchaseReminderDate.value)
  showNutrientLibraryModal.value = false
}

// 切换商品选择状态
const toggleProductSelection = (productId: string) => {
  if (!selectedUser.value) return

  if (!userSelectedProducts.value[selectedUser.value]) {
    userSelectedProducts.value[selectedUser.value] = []
  }

  const products = userSelectedProducts.value[selectedUser.value]
  const index = products.indexOf(productId)

  if (index > -1) {
    // 取消选择
    products.splice(index, 1)
    toastRef.value?.show('已取消选择')
  } else {
    // 添加选择
    products.push(productId)
    const product = productLibrary.value.find(p => p.id === productId)
    toastRef.value?.success(`已添加 "${product?.name}"`)
  }
}

// 检查商品是否被选中
const isProductSelected = (productId: string) => {
  if (!selectedUser.value) return false
  const products = userSelectedProducts.value[selectedUser.value] || []
  return products.includes(productId)
}

// 获取商品类型标签颜色
const getProductTypeColor = (type: string) => {
  return type === 'medication' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
}

const getProductTypeLabel = (type: string) => {
  return type === 'medication' ? '药品' : '保健品'
}

// 添加营养素
const addNutrient = () => {
  if (!newNutrient.value.name || !newNutrient.value.target) {
    showToastMessage('请填写营养素名称和目标量')
    return
  }

  nutrientConfigs.value.push({
    name: newNutrient.value.name,
    unit: newNutrient.value.unit,
    target: Number(newNutrient.value.target),
    key: newNutrient.value.name.toLowerCase(),
    isMacro: true
  })

  newNutrient.value = { name: '', target: '', unit: 'g' }
  showToastMessage('营养素已添加')
}

// 删除营养素
const removeNutrient = (index: number) => {
  if (nutrientConfigs.value.length <= 1) {
    showToastMessage('至少保留一个营养素')
    return
  }
  nutrientConfigs.value.splice(index, 1)
  showToastMessage('营养素已删除')
}

// 保存营养素设置
const saveNutrientSettings = () => {
  showNutrientSettings.value = false
  showToastMessage('营养素设置已保存')
}

// Get coach load info
const getCoachLoad = (coachId?: string) => {
  if (!coachId) return 0
  const coach = getEmployeeById(coachId)
  return coach?.load || 0
}

const getCoachMaxLoad = (coachId?: string) => {
  if (!coachId) return 0
  const coach = getEmployeeById(coachId)
  return coach?.maxLoad || 0
}

// 计算干预天数
const calculateInterventionDays = (startDate: string, endDate?: string): number => {
  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : new Date() // 如果未结束，使用今天
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// 格式化日期显示
const formatDateRange = (startDate: string, endDate?: string): string => {
  const start = new Date(startDate).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  if (endDate) {
    const end = new Date(endDate).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
    return `${start} - ${end}`
  }
  return `${start} - 至今`
}

// 群组类型定义
interface Group {
  id: string
  name: string
  color: string
  memberCount: number
  completionRate: number
  todayCompleted: number
  memberIds: string[]
  type?: 'group' | 'vip'
  icon?: string
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
    memberIds: ['1', '2', '3'],
    type: 'group'
  },
  {
    id: '2',
    name: '减脂塑形B组',
    color: '#10b981',
    memberCount: 3,
    completionRate: 82,
    todayCompleted: 3,
    memberIds: ['4', '6', '8'],
    type: 'group'
  },
  {
    id: '3',
    name: '慢病康复C组',
    color: '#f97316',
    memberCount: 2,
    completionRate: 68,
    todayCompleted: 1,
    memberIds: ['5', '7'],
    type: 'group'
  },
  {
    id: 'trial',
    name: '14天体验',
    color: '#8b5cf6',
    memberCount: 2,
    completionRate: 85,
    todayCompleted: 2,
    memberIds: ['10', '11'],
    type: 'vip',
    icon: '⏱️'
  },
  {
    id: 'paid',
    name: '已付费VIP',
    color: '#fbbf24',
    memberCount: 1,
    completionRate: 100,
    todayCompleted: 1,
    memberIds: ['9'],
    type: 'vip',
    icon: '💎'
  }
])

// Calendar state
const selectedCalendarDate = ref(new Date())
const isRetroactiveMode = ref(false)

// 新增：餐食和日历相关状态
const toast = ref<string | null>(null)
const selectedDate = ref(19)
const isAddMealOpen = ref(false)
const isDietLogOpen = ref(false)
const newMealForm = reactive({ img: null as string | null, desc: '', cal: '' })
const addMealFileInputRef = ref<HTMLInputElement>()

// 阻碍记录数据
const obstacles = ref([
  { id: 1, type: '饮食打卡阻碍', desc: '昨日公司聚餐，饮酒且饮食超标，未能按计划执行。', time: '今天 09:15' }
])

// 阻碍库数据（包含历史记录）
const obstacleLibrary = ref([
  { id: 1, type: '饮食打卡阻碍', desc: '昨日公司聚餐，饮酒且饮食超标，未能按计划执行。', date: '2026-03-20', time: '09:15', resolved: false },
  { id: 2, type: '运动打卡阻碍', desc: '因为天气原因，无法进行户外跑步，家中没有运动设备。', date: '2026-03-18', time: '14:30', resolved: true, resolvedAt: '2026-03-19 10:00' },
  { id: 3, type: '服药依从性阻碍', desc: '忘记携带降压药物，外出期间无法按时服药。', date: '2026-03-15', time: '08:00', resolved: true, resolvedAt: '2026-03-16 09:30' },
  { id: 4, type: '数据监测阻碍', desc: '血压计损坏，暂无法测量血压数据。', date: '2026-03-12', time: '16:45', resolved: false },
  { id: 5, type: '饮食打卡阻碍', desc: '出差期间无法按时记录饮食，餐厅饮食难以控制。', date: '2026-03-10', time: '12:00', resolved: true, resolvedAt: '2026-03-11 15:20' }
])

// 阻碍库模态框状态
const showObstacleLibraryModal = ref(false)
const showAddObstacleForm = ref(false)

// 新增阻碍表单
const newObstacle = ref({
  type: '',
  desc: ''
})

// 打开阻碍库
const openObstacleLibrary = () => {
  showObstacleLibraryModal.value = true
  showAddObstacleForm.value = false
}

// 添加阻碍
const addObstacle = () => {
  if (!newObstacle.value.type || !newObstacle.value.desc) {
    toastRef.value?.warning('请填写阻碍类型和详细描述')
    return
  }

  const now = new Date()
  const obstacle = {
    id: Date.now(),
    type: newObstacle.value.type,
    desc: newObstacle.value.desc,
    date: now.toISOString().split('T')[0],
    time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    resolved: false
  }

  obstacleLibrary.value.unshift(obstacle)
  obstacles.value.unshift(obstacle)

  newObstacle.value = { type: '', desc: '' }
  showAddObstacleForm.value = false
  toastRef.value?.success('阻碍已添加到库中')
}

// 取消添加阻碍
const cancelAddObstacle = () => {
  newObstacle.value = { type: '', desc: '' }
  showAddObstacleForm.value = false
}

// 解决阻碍
const resolveObstacle = (id: number) => {
  const obs = obstacleLibrary.value.find(o => o.id === id)
  if (obs) {
    obs.resolved = true
    obs.resolvedAt = new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })

    // 如果在当前阻碍列表中，也移除
    obstacles.value = obstacles.value.filter(o => o.id !== id)

    toastRef.value?.success('阻碍已标记为已解决')
  }
}

// 删除阻碍
const deleteObstacle = (id: number) => {
  if (!confirm('确定要删除这条阻碍记录吗？')) return

  const index = obstacleLibrary.value.findIndex(o => o.id === id)
  if (index > -1) {
    obstacleLibrary.value.splice(index, 1)
    obstacles.value = obstacles.value.filter(o => o.id !== id)
    toastRef.value?.success('阻碍已删除')
  }
}

// 餐食数据
const meals = ref([
  { id: 1, time: "早餐", cal: 350, desc: "燕麦片一碗，水煮蛋一个，脱脂牛奶250ml", img: "https://images.unsplash.com/photo-1494390248081-4e521a5940db?auto=format&fit=crop&w=100&q=80", macros: { carbs: 45, protein: 15, fat: 12, fiber: 4 } },
  { id: 2, time: "午餐", cal: 680, desc: "糙米饭一碗，香煎鸡胸肉，蒜蓉西兰花，少油少盐", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80", macros: { carbs: 75, protein: 35, fat: 18, fiber: 8 } },
  { id: 3, time: "晚餐", cal: 420, desc: "清蒸鲈鱼一条，清炒时蔬，半个水煮玉米", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=100&q=80", macros: { carbs: 40, protein: 25, fat: 8, fiber: 5 } }
])

// 餐食筛选状态
const selectedMealFilter = ref<string | null>(null)

// 检查是否有某个餐食记录
const hasMealRecord = (mealTime: string): boolean => {
  return meals.value.some(meal => meal.time === mealTime)
}

// 筛选餐食
const filterMeals = (mealTime: string) => {
  // 如果点击的是当前选中的，则取消筛选
  if (selectedMealFilter.value === mealTime) {
    selectedMealFilter.value = null
  } else {
    selectedMealFilter.value = mealTime
  }
}

// 筛选后的餐食列表
const filteredMeals = computed(() => {
  if (!selectedMealFilter.value) {
    return meals.value
  }
  return meals.value.filter(meal => meal.time === selectedMealFilter.value)
})

// 历史饮食日志模拟数据
const historicalDietData = [
  {
    date: "2026年3月18日 (昨日)", totalCal: 1650,
    meals: [
      { time: "早餐", cal: 400, desc: "全麦面包两片，无糖豆浆，煎蛋", img: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=100&q=80" },
      { time: "午餐", cal: 750, desc: "牛肉荞麦面，清炒菠菜，少油", img: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=100&q=80" },
      { time: "晚餐", cal: 500, desc: "鸡胸肉沙拉，油醋汁，半个红薯", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=100&q=80" }
    ]
  },
  {
    date: "2026年3月17日", totalCal: 1820,
    meals: [
      { time: "早餐", cal: 450, desc: "鲜肉包子两个，小米粥", img: "https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&w=100&q=80" },
      { time: "午餐", cal: 820, desc: "排骨焖饭，紫菜蛋花汤", img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=100&q=80" },
      { time: "晚餐", cal: 550, desc: "番茄炒蛋，小半碗米饭", img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=100&q=80" }
    ]
  }
]

// 健康指标类型定义（已注释，使用简化版本）
/*
interface HealthMetric {
  id: string
  type: 'heart_rate' | 'blood_pressure' | 'blood_sugar' | 'weight'
  label: string
  icon: any
  unit: string
  target: string
  device?: string
  currentData: HealthDataPoint
  history: HealthDataPoint[]
}

interface HealthDataPoint {
  id: string
  value: string
  timestamp: Date
  source: 'device' | 'manual' // 设备自动同步 或 手动录入
  deviceId?: string
  notes?: string
}

// 生成模拟历史数据
const generateMockHistory = (type: string, days: number = 30): HealthDataPoint[] => {
  const history: HealthDataPoint[] = []
  const now = new Date()

  for (let i = 0; i < days; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(Math.floor(Math.random() * 12) + 6, Math.floor(Math.random() * 60))

    let value = ''
    const source = Math.random() > 0.3 ? 'device' : 'manual'

    switch (type) {
      case 'heart_rate':
        value = String(Math.floor(Math.random() * 40) + 60) // 60-100
        break
      case 'blood_pressure':
        value = `${Math.floor(Math.random() * 30) + 110}/${Math.floor(Math.random() * 20) + 70}`
        break
      case 'blood_sugar':
        value = (Math.random() * 4 + 4).toFixed(1) // 4.0-8.0
        break
      case 'weight':
        value = (Math.random() * 5 + 65).toFixed(1) // 65-70
        break
    }

    history.push({
      id: `${type}-${i}`,
      value,
      timestamp: date,
      source,
      deviceId: source === 'device' ? 'device-001' : undefined
    })
  }

  return history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// 健康指标配置
const healthMetrics = ref<HealthMetric[]>([
  {
    id: 'heart_rate',
    type: 'heart_rate',
    label: '心率',
    icon: Activity,
    unit: 'bpm',
    target: '60-100',
    device: 'Apple Watch',
    currentData: {
      id: 'hr-current',
      value: '78',
      timestamp: new Date(),
      source: 'device',
      deviceId: 'apple-watch-001'
    },
    history: generateMockHistory('heart_rate', 30)
  },
  {
    id: 'blood_pressure',
    type: 'blood_pressure',
    label: '血压',
    icon: Heart,
    unit: 'mmHg',
    target: '120/80',
    device: '欧姆龙',
    currentData: {
      id: 'bp-current',
      value: '125/82',
      timestamp: new Date(),
      source: 'device',
      deviceId: 'omron-001'
    },
    history: generateMockHistory('blood_pressure', 30)
  },
  {
    id: 'blood_sugar',
    type: 'blood_sugar',
    label: '空腹血糖',
    icon: Droplet,
    unit: 'mmol/L',
    target: '3.9-6.1',
    device: '三诺血糖仪',
    currentData: {
      id: 'bs-current',
      value: '6.2',
      timestamp: new Date(),
      source: 'manual'
    },
    history: generateMockHistory('blood_sugar', 30)
  },
  {
    id: 'weight',
    type: 'weight',
    label: '体重',
    icon: Users,
    unit: 'kg',
    target: '65.0',
    device: '华为体脂秤',
    currentData: {
      id: 'weight-current',
      value: '68.5',
      timestamp: new Date(),
      source: 'device',
      deviceId: 'huawei-scale-001'
    },
    history: generateMockHistory('weight', 30)
  }
])

// 从 healthMetrics 计算 dataBlocks（用于现有卡片显示）
const dataBlocks = computed(() => {
  return healthMetrics.value.map(metric => {
    const value = metric.currentData.value
    let status = '正常'
    let statusColor = 'text-green-500'

    // 简单的状态判断
    if (metric.type === 'blood_sugar' && parseFloat(value) > 6.1) {
      status = '偏高'
      statusColor = 'text-orange-500'
    } else if (metric.type === 'blood_pressure') {
      const [systolic] = value.split('/').map(Number)
      if (systolic > 140) {
        status = '偏高'
        statusColor = 'text-orange-500'
      }
    }

    return {
      icon: metric.icon,
      label: metric.label,
      value,
      unit: metric.unit,
      status,
      statusColor,
      device: metric.device,
      target: metric.target,
      msg: `查看详细${metric.label}`,
      metricId: metric.id
    }
  })
})

// 健康指标详情模态框
const showHealthMetricModal = ref(false)
const selectedMetric = ref<HealthMetric | null>(null)
const queryDateRange = ref<'7d' | '30d' | '90d' | 'custom'>('30d')
const customStartDate = ref('')
const customEndDate = ref('')

// 手动录入模态框
const showManualEntryModal = ref(false)
const manualEntryForm = ref({
  value: '',
  timestamp: '',
  notes: ''
})

// 设备同步状态
const isSyncing = ref(false)

// 打开健康指标详情
const openHealthMetricModal = (block: any) => {
  const metric = healthMetrics.value.find(m => m.id === block.metricId)
  if (metric) {
    selectedMetric.value = metric
    showHealthMetricModal.value = true
  }
}

// 打开手动录入
const openManualEntry = () => {
  const now = new Date()
  manualEntryForm.value = {
    value: '',
    timestamp: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
    notes: ''
  }
  showManualEntryModal.value = true
}

// 提交手动录入
const submitManualEntry = () => {
  if (!selectedMetric.value || !manualEntryForm.value.value) return

  const newDataPoint: HealthDataPoint = {
    id: `manual-${Date.now()}`,
    value: manualEntryForm.value.value,
    timestamp: new Date(manualEntryForm.value.timestamp),
    source: 'manual',
    notes: manualEntryForm.value.notes
  }

  // 更新当前数据
  selectedMetric.value.currentData = newDataPoint

  // 添加到历史记录
  selectedMetric.value.history.unshift(newDataPoint)

  showManualEntryModal.value = false
  showToastMessage(`${selectedMetric.value.label}数据已录入`)
}

// 设备同步
const syncFromDevice = async () => {
  if (!selectedMetric.value || !selectedMetric.value.device) {
    showToastMessage('未绑定设备，请先绑定设备')
    return
  }

  isSyncing.value = true

  // 模拟设备同步
  setTimeout(() => {
    const metric = selectedMetric.value!

    // 生成新的设备数据
    let newValue = ''
    switch (metric.type) {
      case 'heart_rate':
        newValue = String(Math.floor(Math.random() * 40) + 60)
        break
      case 'blood_pressure':
        newValue = `${Math.floor(Math.random() * 30) + 110}/${Math.floor(Math.random() * 20) + 70}`
        break
      case 'blood_sugar':
        newValue = (Math.random() * 4 + 4).toFixed(1)
        break
      case 'weight':
        newValue = (Math.random() * 5 + 65).toFixed(1)
        break
    }

    const newDataPoint: HealthDataPoint = {
      id: `device-${Date.now()}`,
      value: newValue,
      timestamp: new Date(),
      source: 'device',
      deviceId: metric.device
    }

    metric.currentData = newDataPoint
    metric.history.unshift(newDataPoint)

    isSyncing.value = false
    showToastMessage(`${metric.label}数据同步成功`)
  }, 1500)
}

// 获取筛选后的历史数据
const getFilteredHistory = computed(() => {
  if (!selectedMetric.value) return []

  const history = selectedMetric.value.history
  const now = new Date()

  switch (queryDateRange.value) {
    case '7d':
      return history.filter(d => {
        const daysDiff = Math.floor((now.getTime() - d.timestamp.getTime()) / (1000 * 60 * 60 * 24))
        return daysDiff <= 7
      })
    case '30d':
      return history.filter(d => {
        const daysDiff = Math.floor((now.getTime() - d.timestamp.getTime()) / (1000 * 60 * 60 * 24))
        return daysDiff <= 30
      })
    case '90d':
      return history.filter(d => {
        const daysDiff = Math.floor((now.getTime() - d.timestamp.getTime()) / (1000 * 60 * 60 * 24))
        return daysDiff <= 90
      })
    case 'custom':
      if (!customStartDate.value || !customEndDate.value) return history
      const start = new Date(customStartDate.value)
      const end = new Date(customEndDate.value)
      return history.filter(d => d.timestamp >= start && d.timestamp <= end)
    default:
      return history
  }
})

// 生成趋势图数据
const getTrendChartData = computed(() => {
  const filtered = getFilteredHistory.value.slice(0, 30).reverse() // 取最近30条并按时间排序

  return filtered.map(d => ({
    date: d.timestamp.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
    value: parseFloat(d.value.split('/')[0]) || parseFloat(d.value),
    fullValue: d.value,
    source: d.source
  }))
})

// 获取数据源统计
const dataSourceStats = computed(() => {
  if (!selectedMetric.value) return null

  const history = getFilteredHistory.value
  const deviceCount = history.filter(d => d.source === 'device').length
  const manualCount = history.filter(d => d.source === 'manual').length

  return {
    total: history.length,
    device: deviceCount,
    manual: manualCount,
    deviceRate: history.length > 0 ? Math.round((deviceCount / history.length) * 100) : 0
  }
})
*/

// 生理数据配置（简化版）
const dataBlocks = [
  { icon: Activity, label: '心率', value: '78', unit: 'bpm', status: '正常', statusColor: 'text-green-500', device: 'Apple Watch', target: '60-100', msg: '查看详细心率' },
  { icon: Heart, label: '血压', value: '125/82', unit: 'mmHg', status: '偏高', statusColor: 'text-orange-500', device: '欧姆龙', target: '120/80', msg: '查看详细血压' },
  { icon: Droplet, label: '空腹血糖', value: '6.2', unit: 'mmol/L', status: '偏高', statusColor: 'text-orange-500', device: '三诺血糖仪', target: '3.9-6.1', msg: '查看血糖记录' },
  { icon: Users, label: '体重', value: '68.5', unit: 'kg', status: '达标', statusColor: 'text-green-500', device: '华为体脂秤', target: '65.0', msg: '查看体重曲线' }
]

// 生理数据编辑模态框
const showVitalDataModal = ref(false)
const editingVitalData = ref<any>(null)
const vitalDataForm = ref({
  device: '',
  target: '',
  currentValue: '',
  unit: ''
})

// 打开生理数据编辑
const openVitalDataModal = (block: any) => {
  editingVitalData.value = block
  vitalDataForm.value = {
    device: block.device || '',
    target: block.target || '',
    currentValue: block.value || '',
    unit: block.unit || ''
  }
  showVitalDataModal.value = true
}

// 保存生理数据设置（设备、目标）
const saveVitalData = () => {
  if (editingVitalData.value) {
    editingVitalData.value.device = vitalDataForm.value.device
    editingVitalData.value.target = vitalDataForm.value.target
    editingVitalData.value.value = vitalDataForm.value.currentValue
  }
  showVitalDataModal.value = false
  showToastMessage('生理数据已更新')
}

// 格式化时间
const formatDateTime = (date: Date) => {
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化完整日期时间
const formatFullDateTime = (date: Date) => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 趋势图表数据
const trendCharts = [
  { label: '空腹血糖变化', icon: Droplet, iconColor: 'text-orange-500', value: '6.4', unit: 'mmol/L (平均)', status: '偏高', statusColor: 'bg-orange-100 text-orange-700 border-orange-200', data: [5.8, 6.0, 7.5, 6.2, 5.9, 7.2, 6.2], strokeClass: 'stroke-orange-500', fillClass: 'fill-orange-500/10', dotClass: 'stroke-orange-500', msg: '展开血糖详细分析大图', type: 'glucose' },
  { label: '静息心率波动', icon: Activity, iconColor: 'text-rose-500', value: '75.7', unit: 'bpm (平均)', status: '正常', statusColor: 'bg-green-100 text-green-700 border-green-200', data: [72, 75, 71, 78, 82, 74, 78], strokeClass: 'stroke-rose-500', fillClass: 'fill-rose-500/10', dotClass: 'stroke-rose-500', msg: '展开静息心率详情', type: 'heartRate' },
  { label: '体重变化趋势', icon: Target, iconColor: 'text-teal-500', value: '68.5', unit: 'kg (平均)', status: '正常', statusColor: 'bg-green-100 text-green-700 border-green-200', data: [69.2, 69.0, 68.8, 68.5, 68.3, 68.6, 68.5], strokeClass: 'stroke-teal-500', fillClass: 'fill-teal-500/10', dotClass: 'stroke-teal-500', msg: '展开体重详细分析大图', type: 'weight' }
]

// 生成趋势数据（从缓存读取，支持7天和30天）
const generateTrendData = (type: string, days: 7 | 30 = 30) => {
  const cacheKey = `${type}_${days}days`
  if (!trendDataCache.value[cacheKey]) {
    trendDataCache.value[cacheKey] = generateTrendDataUncached(type, days)
  }
  return trendDataCache.value[cacheKey]
}

// 兼容性函数：generate30DayData映射到generateTrendData
const generate30DayData = (type: string) => generateTrendData(type, 30)

// 打开趋势图详情模态框
const openTrendDetail = (chart: any) => {
  selectedTrendChart.value = chart
  trendTimeRange.value = '30days' // 重置为30天
  showTrendDetailModal.value = true
}

// 获取睡眠30天数据（用于睡眠卡片）
const getSleep30DayData = () => {
  return generate30DayData('sleep')
}

// 快捷操作配置
const quickActions = [
  { icon: Phone, label: '发起图文', colorClass: 'text-blue-500', msg: '正在拉起 IM 沟通窗口...' },
  { icon: Video, label: '视频问诊', colorClass: 'text-indigo-500', msg: '准备呼叫患者视频连线...' },
  { icon: CalendarIcon, label: '安排面诊', colorClass: 'text-emerald-500', msg: '打开排班日历表' },
  { icon: FileText, label: '发送方案', colorClass: 'text-amber-500', msg: '正在打开健康方案编辑器...' },
  { icon: Activity, label: '开立处方', colorClass: 'text-rose-500', msg: '跳转至处方开具页面' },
  { icon: FileSpreadsheet, label: '生成报告', colorClass: 'text-teal-500', msg: '正在为您生成本周期健康报告...' },
  { icon: Heart, label: '推送课程', colorClass: 'text-pink-500', msg: '打开知识库选择课程' },
  { icon: UploadCloud, label: '数据导出', colorClass: 'text-slate-500', msg: '后台正在打包导出 Excel 数据...' }
]

// 计算营养素进度条
const nutrientBars = computed(() => {
  return nutrientConfigs.value.map(config => {
    const segs = meals.value.map(m => ({
      value: config.isMacro ? (m.macros[config.key] || 0) : (m[config.key] || 0),
      label: m.time,
      color: getMealColor(m.time)
    }))
    const total = segs.reduce((sum, seg) => sum + seg.value, 0)
    return {
      label: config.name,
      unit: config.unit,
      target: config.target,
      total,
      segments: segs.map(s => ({ ...s, percent: (s.value / config.target) * 100 }))
    }
  })
})

// 新增方法
const showToastMessage = (msg: string) => {
  toast.value = msg
  setTimeout(() => toast.value = null, 3000)
}

// AI一键测算热量和营养素
const calculateAINutrition = () => {
  showToastMessage("AI正在分析餐食图片，测算热量和营养素...")

  // 模拟AI测算过程
  setTimeout(() => {
    // 为每餐更新更准确的热量和营养素数值
    meals.value = meals.value.map(meal => {
      // 根据不同餐食类型生成略有不同的数值
      const baseMultiplier = meal.time === '早餐' ? 1.1 : meal.time === '午餐' ? 1.2 : 1.05

      return {
        ...meal,
        cal: Math.round(meal.cal * baseMultiplier),
        macros: {
          carbs: Math.round(meal.macros.carbs * baseMultiplier),
          protein: Math.round(meal.macros.protein * (baseMultiplier + 0.1)),
          fat: Math.round(meal.macros.fat * baseMultiplier),
          fiber: Math.round(meal.macros.fiber * baseMultiplier)
        }
      }
    })

    showToastMessage("AI测算完成！热量和营养素已更新")
  }, 1500)
}

const handleSaveNewMeal = () => {
  if (!newMealForm.img || !newMealForm.desc) {
    showToastMessage("请上传照片并填写描述哦")
    return
  }
  const newMeal = {
    id: Date.now(),
    time: "加餐",
    cal: Number(newMealForm.cal) || 150,
    desc: newMealForm.desc,
    img: newMealForm.img,
    macros: { carbs: 15, protein: 8, fat: 10, fiber: 2 }
  }
  meals.value.push(newMeal)
  Object.assign(newMealForm, { img: null, desc: '', cal: '' })
  isAddMealOpen.value = false
  showToastMessage("餐食记录补充成功！")
}

const handleModalFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    newMealForm.img = URL.createObjectURL(target.files[0])
  }
}

const handleResolveObstacle = (id: number) => {
  showToastMessage("已记录跟进情况，阻碍已标记为处理完成")
  // 同时更新阻碍库
  resolveObstacle(id)
  // 从当前显示列表中移除
  obstacles.value = obstacles.value.filter(o => o.id !== id)
}

const changeMonth = (dir: number) => {
  const newMonth = viewingMonth.value + dir
  if (newMonth >= 0 && newMonth <= 11) {
    viewingMonth.value = newMonth
    if (newMonth === 0 && dir === -1) {
      viewingYear.value--
    } else if (newMonth === 11 && dir === 1) {
      // Don't increment year automatically, let user navigate
    }
    showToastMessage(`正在加载 ${viewingYear.value}年${newMonth + 1}月 数据...`)
  }
}

const setSelectedDate = (day: number) => {
  selectedDate.value = day
}

// 工具方法：获取折线图绘制数据
const getChartData = (data: number[]) => {
  const max = Math.max(...data) * 1.05
  const min = Math.min(...data) * 0.95
  const range = max - min || 1
  const width = 100
  const height = 30

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((val - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,${height} ${points} ${width},${height}`
  const dataNodes = data.map((val, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((val - min) / range) * height
  }))

  return { points, areaPoints, dataNodes }
}

// 工具方法：获取折线图绘制数据（支持7天和30天）
const getTrendChartData = (type: string, days: 7 | 30 = 30) => {
  const data = generateTrendData(type, days).data
  const max = Math.max(...data) * 1.05
  const min = Math.min(...data) * 0.95
  const range = max - min || 1
  const width = 1000
  const height = 180

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((val - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,${height} ${points} ${width},${height}`
  const dataNodes = data.map((val, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((val - min) / range) * height
  }))

  return { points, areaPoints, dataNodes }
}

// 兼容性函数：get30DayChartData映射到getTrendChartData
const get30DayChartData = (type: string) => getTrendChartData(type, 30)

// 工具方法：获取趋势方向
const getTrendDirection = (type: string) => {
  const data = generate30DayData(type).data
  const firstHalf = data.slice(0, 15).reduce((a, b) => a + b, 0) / 15
  const secondHalf = data.slice(15).reduce((a, b) => a + b, 0) / 15

  if (type === 'weight') {
    // 体重下降是好的
    return secondHalf < firstHalf ? 'down' : 'up'
  } else {
    // 其他指标上升需要注意
    return secondHalf > firstHalf ? 'up' : 'down'
  }
}

// 工具方法：获取柱状图睡眠数据
const getSleepChartData = (data: number[]) => {
  const max = Math.max(...data) > 8 ? Math.max(...data) : 8
  return data.map(val => ({
    val,
    heightPercent: (val / max) * 100,
    isLow: val < 6.5
  }))
}

// 工具方法：颜色与日历样式
const getMealColor = (time: string) => {
  const colors: Record<string, string> = { "早餐": "bg-sky-400", "午餐": "bg-indigo-500", "晚餐": "bg-violet-500", "加餐": "bg-fuchsia-400" }
  return colors[time] || "bg-slate-400"
}

const getDayClass = (day: number) => {
  let bg = "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent"
  if (day === selectedDate.value) bg = "bg-indigo-500 text-white font-bold shadow-md shadow-indigo-200 border-indigo-600 scale-105"
  else if (day < 19 && day % 4 !== 0) bg = "bg-green-50 text-green-700 hover:bg-green-100 border-green-100"
  else if (day < 19 && day % 4 === 0) bg = "bg-red-50 text-red-600 hover:bg-red-100 border-red-100"
  return bg
}

// 切换日程列表展开/收起
const toggleSchedule = (day: number) => {
  selectedDate.value = day
  // 如果点击的是已选中的日期，则收起；否则展开
  if (showScheduleList.value && selectedDate.value === day) {
    showScheduleList.value = false
  } else {
    showScheduleList.value = true
  }
}

// 检查某天是否有日程
const hasSchedule = (day: number) => {
  // 模拟：每周三、每周日、每月的5号、15号、25号有日程
  const dayOfWeek = ((day - 1) % 7) + 1
  return dayOfWeek === 3 || dayOfWeek === 7 || day % 5 === 0
}

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
  { id: '1', name: '王磊', avatarColor: 'bg-indigo-500', level: 'L1', status: 'active', statusText: '活跃中', tags: ['高风险', '减重'], alertCount: 2, todayCompleted: 5, todayTasks: 8, taskStatus: 'in-progress', age: 38, gender: '男' },
  { id: '2', name: '李淑芬', avatarColor: 'bg-pink-500', level: 'L2', status: 'active', statusText: '活跃中', tags: ['老年', '糖尿病'], alertCount: 0, todayCompleted: 7, todayTasks: 7, taskStatus: 'completed', age: 62, gender: '女' },
  { id: '3', name: '张建国', avatarColor: 'bg-blue-500', level: 'L1', status: 'warning', statusText: '需跟进', tags: ['逾期'], alertCount: 5, todayCompleted: 2, todayTasks: 10, taskStatus: 'in-progress', age: 55, gender: '男' },
  { id: '4', name: '陈静', avatarColor: 'bg-purple-500', level: 'L3', status: 'active', statusText: '活跃中', tags: ['VIP'], alertCount: 1, todayCompleted: 4, todayTasks: 7, taskStatus: 'in-progress', age: 42, gender: '女' },
  { id: '5', name: '刘伟', avatarColor: 'bg-green-500', level: 'L1', status: 'inactive', statusText: '不活跃', tags: ['新用户'], alertCount: 0, todayCompleted: 0, todayTasks: 5, taskStatus: 'pending', age: 35, gender: '男' },
  { id: '6', name: '赵敏', avatarColor: 'bg-orange-500', level: 'L2', status: 'active', statusText: '活跃中', tags: ['减脂'], alertCount: 0, todayCompleted: 6, todayTasks: 8, taskStatus: 'in-progress', age: 28, gender: '女' },
  { id: '7', name: '孙强', avatarColor: 'bg-teal-500', level: 'L1', status: 'warning', statusText: '打卡缺失', tags: ['逾期'], alertCount: 3, todayCompleted: 1, todayTasks: 9, taskStatus: 'in-progress', age: 48, gender: '男' },
  { id: '8', name: '周梅', avatarColor: 'bg-red-500', level: 'L3', status: 'active', statusText: '活跃中', tags: ['VIP'], alertCount: 0, todayCompleted: 8, todayTasks: 6, taskStatus: 'completed', age: 39, gender: '女' },
  { id: '9', name: '马云龙', avatarColor: 'bg-amber-500', level: 'VIP', status: 'active', statusText: '已付费VIP', tags: ['VIP', '高净值', '已付费'], alertCount: 0, todayCompleted: 6, todayTasks: 6, taskStatus: 'completed', age: 45, gender: '男' },
  { id: '10', name: '王美丽', avatarColor: 'bg-violet-400', level: '体验', status: 'active', statusText: '14天体验', tags: ['VIP', '体验期'], alertCount: 0, todayCompleted: 8, todayTasks: 8, taskStatus: 'completed', age: 36, gender: '女' },
  { id: '11', name: '李明哲', avatarColor: 'bg-violet-500', level: '体验', status: 'active', statusText: '14天体验', tags: ['VIP', '体验期'], alertCount: 0, todayCompleted: 7, todayTasks: 8, taskStatus: 'in-progress', age: 52, gender: '男' }
])

const filterTabs = computed(() => [
  { key: 'all' as const, label: '全部', count: users.value.length },
  { key: 'pending' as const, label: '未处理', count: users.value.filter(u => u.taskStatus === 'pending').length },
  { key: 'in-progress' as const, label: '进程中', count: users.value.filter(u => u.taskStatus === 'in-progress').length },
  { key: 'completed' as const, label: '已完成', count: users.value.filter(u => u.taskStatus === 'completed').length }
])

// Mock User Data Map
const userDataMap = ref<{ [key: string]: UserData }>({
  '1': { todayTasks: 8, todayCompleted: 5, pendingTasks: 3, compliance: 8.5, metabolicRisk: 75, weeklyRate: 82, streak: 12, lastGlucose: 7.2, lastWeight: 84.5, lastBP: '125/82', lastDeviceSync: new Date(), mealUploadCount: 3, calorieIntake: 1450, nutrientProtein: 65, nutrientCarbs: 180, nutrientFat: 45, coursesCompleted: 5, coursesTotal: 12, interventionStartDate: new Date('2026-02-15'), sourceChannel: '抖音推广', paymentAmount: 2980, userGoal: '控制血糖，减轻体重' },
  '2': { todayTasks: 6, todayCompleted: 7, pendingTasks: 0, compliance: 9.2, metabolicRisk: 45, weeklyRate: 90, streak: 18, lastGlucose: 6.8, lastWeight: 68.2, lastBP: '118/75', lastDeviceSync: new Date(Date.now() - 86400000), mealUploadCount: 4, calorieIntake: 1650, nutrientProtein: 72, nutrientCarbs: 195, nutrientFat: 50, coursesCompleted: 8, coursesTotal: 12, interventionStartDate: new Date('2026-01-20'), sourceChannel: '微信公众号', paymentAmount: 4980, userGoal: '改善睡眠质量' },
  '3': { todayTasks: 10, todayCompleted: 2, pendingTasks: 8, compliance: 6.5, metabolicRisk: 85, weeklyRate: 55, streak: 3, lastGlucose: 9.5, lastWeight: 92.1, lastBP: '145/92', lastDeviceSync: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), mealUploadCount: 1, calorieIntake: 2100, nutrientProtein: 55, nutrientCarbs: 280, nutrientFat: 70, coursesCompleted: 2, coursesTotal: 12, interventionStartDate: new Date('2026-03-01'), sourceChannel: '线下讲座', paymentAmount: 1980, userGoal: '全面健康管理' },
  '4': { todayTasks: 7, todayCompleted: 4, pendingTasks: 3, compliance: 8.8, metabolicRisk: 55, weeklyRate: 85, streak: 15, lastGlucose: 6.5, lastWeight: 58.3, lastBP: '112/70', lastDeviceSync: new Date(), mealUploadCount: 3, calorieIntake: 1380, nutrientProtein: 58, nutrientCarbs: 170, nutrientFat: 42, coursesCompleted: 6, coursesTotal: 12, interventionStartDate: new Date('2026-02-01'), sourceChannel: '朋友推荐', paymentAmount: 3980, userGoal: '预防糖尿病并发症' },
  '5': { todayTasks: 5, todayCompleted: 0, pendingTasks: 5, compliance: 4.5, metabolicRisk: 60, weeklyRate: 40, streak: 0, lastGlucose: 0, lastWeight: 0, lastBP: '', lastDeviceSync: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), mealUploadCount: 0, calorieIntake: 0, nutrientProtein: 0, nutrientCarbs: 0, nutrientFat: 0, coursesCompleted: 1, coursesTotal: 12, interventionStartDate: new Date('2026-03-10'), sourceChannel: '小红书', paymentAmount: 0, userGoal: '待设定' },
  '6': { todayTasks: 8, todayCompleted: 6, pendingTasks: 2, compliance: 9.5, metabolicRisk: 35, weeklyRate: 92, streak: 22, lastGlucose: 5.8, lastWeight: 62.5, lastBP: '108/68', lastDeviceSync: new Date(), mealUploadCount: 4, calorieIntake: 1720, nutrientProtein: 78, nutrientCarbs: 205, nutrientFat: 52, coursesCompleted: 10, coursesTotal: 12, interventionStartDate: new Date('2025-12-01'), sourceChannel: '知乎', paymentAmount: 5980, userGoal: '优化代谢指标' },
  '7': { todayTasks: 9, todayCompleted: 1, pendingTasks: 8, compliance: 5.8, metabolicRisk: 70, weeklyRate: 50, streak: 5, lastGlucose: 8.1, lastWeight: 88.7, lastBP: '135/88', lastDeviceSync: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), mealUploadCount: 2, calorieIntake: 1250, nutrientProtein: 45, nutrientCarbs: 150, nutrientFat: 38, coursesCompleted: 3, coursesTotal: 12, interventionStartDate: new Date('2026-02-20'), sourceChannel: '抖音推广', paymentAmount: 2980, userGoal: '建立健康生活习惯' },
  '8': { todayTasks: 6, todayCompleted: 8, pendingTasks: 0, compliance: 9.0, metabolicRisk: 40, weeklyRate: 88, streak: 20, lastGlucose: 6.2, lastWeight: 55.8, lastBP: '115/72', lastDeviceSync: new Date(), mealUploadCount: 4, calorieIntake: 1550, nutrientProtein: 68, nutrientCarbs: 188, nutrientFat: 48, coursesCompleted: 9, coursesTotal: 12, interventionStartDate: new Date('2026-01-10'), sourceChannel: '线上广告', paymentAmount: 4980, userGoal: '长期血糖管理' },
  '9': { todayTasks: 6, todayCompleted: 6, pendingTasks: 0, compliance: 9.8, metabolicRisk: 25, weeklyRate: 95, streak: 30, lastGlucose: 5.5, lastWeight: 72.0, lastBP: '115/75', lastDeviceSync: new Date(), mealUploadCount: 5, calorieIntake: 1680, nutrientProtein: 85, nutrientCarbs: 195, nutrientFat: 55, coursesCompleted: 12, coursesTotal: 12, interventionStartDate: new Date('2025-10-01'), sourceChannel: '线下转介绍', paymentAmount: 6980, userGoal: '减重10公斤' },
  '10': { todayTasks: 8, todayCompleted: 8, pendingTasks: 0, compliance: 9.9, metabolicRisk: 20, weeklyRate: 98, streak: 45, lastGlucose: 5.2, lastWeight: 52.3, lastBP: '110/68', lastDeviceSync: new Date(), mealUploadCount: 5, calorieIntake: 1420, nutrientProtein: 82, nutrientCarbs: 175, nutrientFat: 40, coursesCompleted: 12, coursesTotal: 12, interventionStartDate: new Date('2025-09-15'), sourceChannel: '朋友推荐', paymentAmount: 3980, userGoal: '维持理想体重' },
  '11': { todayTasks: 8, todayCompleted: 7, pendingTasks: 1, compliance: 9.3, metabolicRisk: 30, weeklyRate: 93, streak: 28, lastGlucose: 5.9, lastWeight: 78.5, lastBP: '118/72', lastDeviceSync: new Date(Date.now() - 86400000), mealUploadCount: 4, calorieIntake: 1750, nutrientProtein: 80, nutrientCarbs: 210, nutrientFat: 58, coursesCompleted: 11, coursesTotal: 12, interventionStartDate: new Date('2025-11-20'), sourceChannel: '微信公众号', paymentAmount: 4980, userGoal: '降低血糖波动' }
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
    compliance: 5,
    metabolicRisk: 0,
    weeklyRate: 0,
    streak: 0,
    lastGlucose: 0,
    lastWeight: 0,
    lastBP: ''
  }
})

// 计算干预开始日期（优先使用用户设置的日期，否则取最早的教练或医生分配日期）
const interventionStartDate = computed(() => {
  // 优先使用用户手动设置的干预开始日期
  if (userData.value?.interventionStartDate) {
    const date = new Date(userData.value.interventionStartDate)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  // 如果没有手动设置，从教练和医生分配信息中计算
  if (!userAssignment.value) return '未设置'

  // 收集所有教练的开始日期
  const coachDates = userAssignment.value.coaches
    ?.filter(c => c.startDate)
    .map(c => new Date(c.startDate).getTime()) || []

  // 收集医生开始日期
  const doctorDate = userAssignment.value.doctorStartDate
    ? new Date(userAssignment.value.doctorStartDate).getTime()
    : null

  // 合并所有日期
  const allDates = [...coachDates]
  if (doctorDate !== null) allDates.push(doctorDate)

  if (allDates.length === 0) return '未设置'

  // 取最早的日期
  const earliestDate = new Date(Math.min(...allDates))
  return `${earliestDate.getFullYear()}年${earliestDate.getMonth() + 1}月${earliestDate.getDate()}日`
})

// 计算干预结束日期（如果所有教练和医生都已结束，使用最晚的结束日期；否则使用今天）
const interventionEndDate = computed(() => {
  const today = new Date()

  if (!userAssignment.value) {
    return `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
  }

  // 收集所有教练的结束日期（已结束的）
  const coachEndDates = userAssignment.value.coaches
    ?.filter(c => c.endDate)
    .map(c => new Date(c.endDate).getTime()) || []

  // 收集医生结束日期
  const doctorEndDate = userAssignment.value.doctorEndDate
    ? new Date(userAssignment.value.doctorEndDate).getTime()
    : null

  // 合并所有结束日期
  const allEndDates = [...coachEndDates]
  if (doctorEndDate !== null) allEndDates.push(doctorEndDate)

  // 检查是否还有未结束的教练或医生
  const hasActiveCoach = userAssignment.value.coaches?.some(c => !c.endDate)
  const hasActiveDoctor = userAssignment.value.doctorId && !userAssignment.value.doctorEndDate

  // 如果还有未结束的，返回今天
  if (hasActiveCoach || hasActiveDoctor || allEndDates.length === 0) {
    return `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
  }

  // 如果都已结束，返回最晚的结束日期
  const latestEndDate = new Date(Math.max(...allEndDates))
  return `${latestEndDate.getFullYear()}年${latestEndDate.getMonth() + 1}月${latestEndDate.getDate()}日`
})

// 计算已干预天数
const interventionDays = computed(() => {
  // 优先使用用户手动设置的干预开始日期
  let startDate: Date | null = null
  if (userData.value?.interventionStartDate) {
    startDate = new Date(userData.value.interventionStartDate)
  } else {
    // 如果没有手动设置，从教练和医生分配信息中计算
    if (!userAssignment.value) return 0

    // 收集所有教练的开始日期
    const coachDates = userAssignment.value.coaches
      ?.filter(c => c.startDate)
      .map(c => new Date(c.startDate).getTime()) || []

    // 收集医生开始日期
    const doctorDate = userAssignment.value.doctorStartDate
      ? new Date(userAssignment.value.doctorStartDate).getTime()
      : null

    // 合并所有日期
    const allDates = [...coachDates]
    if (doctorDate !== null) allDates.push(doctorDate)

    if (allDates.length === 0) return 0

    // 取最早的日期作为开始
    startDate = new Date(Math.min(...allDates))
  }

  // 确定结束日期（如果用户设置了干预开始日期，则默认使用今天）
  let endDate: Date
  if (userData.value?.interventionStartDate) {
    // 如果用户手动设置了开始日期，默认结束日期为今天
    endDate = new Date()
  } else {
    // 否则从教练和医生分配信息中确定
    const coachEndDates = userAssignment.value?.coaches
      ?.filter(c => c.endDate)
      .map(c => new Date(c.endDate).getTime()) || []

    const doctorEndDate = userAssignment.value?.doctorEndDate
      ? new Date(userAssignment.value.doctorEndDate).getTime()
      : null

    const allEndDates = [...coachEndDates]
    if (doctorEndDate !== null) allEndDates.push(doctorEndDate)

    const hasActiveCoach = userAssignment.value?.coaches?.some(c => !c.endDate)
    const hasActiveDoctor = userAssignment.value?.doctorId && !userAssignment.value?.doctorEndDate

    if (hasActiveCoach || hasActiveDoctor || allEndDates.length === 0) {
      endDate = new Date()
    } else {
      endDate = new Date(Math.max(...allEndDates))
    }
  }

  if (!startDate) return 0

  // 计算天数差
  const diffTime = endDate.getTime() - startDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
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
    const baseCompletionRate = userData ? userData.compliance * 10 : 50 // 将评分转换为百分比
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

// 快捷功能方法
const openAIPrescription = () => {
  if (!selectedUser.value) {
    toastRef.value?.warning('请先选择一个用户')
    return
  }
  // 跳转到用户档案页并打开AI处方
  router.push({
    path: `/client-profile/${selectedUser.value}`,
    query: {
      from: route.fullPath,
      tab: 'overview',
      action: 'ai-prescription'
    }
  })
}

const goToHealthTab = () => {
  if (!selectedUser.value) {
    toastRef.value?.warning('请先选择一个用户')
    return
  }
  router.push({
    path: `/client-profile/${selectedUser.value}`,
    query: {
      from: route.fullPath,
      tab: 'health',
      action: 'view-health-data'
    }
  })
}

const goToDataCenter = () => {
  if (!selectedUser.value) {
    toastRef.value?.warning('请先选择一个用户')
    return
  }
  router.push({
    path: `/client-profile/${selectedUser.value}`,
    query: {
      from: route.fullPath,
      tab: 'datacenter',
      action: 'open-data-export'
    }
  })
}

const goToIntervention = () => {
  if (!selectedUser.value) {
    toastRef.value?.warning('请先选择一个用户')
    return
  }
  router.push({
    path: `/client-profile/${selectedUser.value}`,
    query: {
      from: route.fullPath,
      tab: 'intervention',
      action: 'create-intervention'
    }
  })
}

const goToLabeling = () => {
  if (!selectedUser.value) {
    toastRef.value?.warning('请先选择一个用户')
    return
  }
  router.push({
    path: `/client-profile/${selectedUser.value}`,
    query: {
      from: route.fullPath,
      tab: 'labeling',
      action: 'start-labeling'
    }
  })
}

const goToConfig = () => {
  if (!selectedUser.value) {
    toastRef.value?.warning('请先选择一个用户')
    return
  }
  router.push({
    path: `/client-profile/${selectedUser.value}`,
    query: {
      from: route.fullPath,
      tab: 'config',
      action: 'open-learning-config'
    }
  })
}

const goToDevicesTab = () => {
  if (!selectedUser.value) {
    toastRef.value?.warning('请先选择一个用户')
    return
  }
  router.push({
    path: `/client-profile/${selectedUser.value}`,
    query: {
      from: route.fullPath,
      tab: 'devices',
      action: 'open-device-config'
    }
  })
}

// 从生理特征数据弹窗跳转到硬件设备
const goToDevicesFromVitalModal = () => {
  if (!selectedUser.value) {
    toastRef.value?.warning('请先选择一个用户')
    return
  }
  // 关闭生理特征数据弹窗
  showVitalDataModal.value = false
  // 跳转到硬件设备页面
  router.push({
    path: `/client-profile/${selectedUser.value}`,
    query: {
      from: route.fullPath,
      tab: 'devices',
      action: 'open-device-config'
    }
  })
}

// 基础信息编辑功能
const openBasicInfoEditModal = () => {
  if (!selectedUser.value) return
  const userData = userDataMap.value[selectedUser.value]
  const currentUserData = users.value.find(u => u.id === selectedUser.value)
  if (userData || currentUserData) {
    basicInfoForm.value = {
      gender: currentUserData?.gender || '',
      age: currentUserData?.age || 0,
      compliance: getUserCompliance(selectedUser.value),
      sourceChannel: userData?.sourceChannel || '',
      paymentAmount: userData?.paymentAmount || 0,
      userGoal: userData?.userGoal || '',
      interventionStartDate: userData?.interventionStartDate
        ? new Date(userData.interventionStartDate).toISOString().split('T')[0]
        : ''
    }
  }
  showBasicInfoEditModal.value = true
}

const saveBasicInfo = () => {
  if (!selectedUser.value) {
    toastRef.value?.warning('请先选择一个用户')
    return
  }

  // 更新 userDataMap
  if (userDataMap.value[selectedUser.value]) {
    userDataMap.value[selectedUser.value] = {
      ...userDataMap.value[selectedUser.value],
      sourceChannel: basicInfoForm.value.sourceChannel || undefined,
      paymentAmount: basicInfoForm.value.paymentAmount || undefined,
      userGoal: basicInfoForm.value.userGoal || undefined,
      interventionStartDate: basicInfoForm.value.interventionStartDate
        ? new Date(basicInfoForm.value.interventionStartDate)
        : undefined
    }
  }

  // 更新用户性别和年龄
  const userIndex = users.value.findIndex(u => u.id === selectedUser.value)
  if (userIndex !== -1) {
    users.value[userIndex] = {
      ...users.value[userIndex],
      gender: basicInfoForm.value.gender || undefined,
      age: basicInfoForm.value.age || undefined
    }
  }

  // 更新依从度
  setUserCompliance(selectedUser.value, basicInfoForm.value.compliance)

  showBasicInfoEditModal.value = false
  toastRef.value?.success('基础信息已更新')
}

// 预约服务模态框
const showBookingModal = ref(false)
const bookingForm = ref({
  serviceType: '',
  doctorId: '',
  preferredDate: '',
  preferredTime: '',
  notes: ''
})

// 可用医生列表
const availableDoctors = ref([
  { id: 'doc001', name: '张医生', specialty: '心内科', availableSlots: 5 },
  { id: 'doc002', name: '李医生', specialty: '内分泌科', availableSlots: 3 },
  { id: 'doc003', name: '王医生', specialty: '神经内科', availableSlots: 4 },
  { id: 'doc004', name: '赵医生', specialty: '康复科', availableSlots: 6 },
  { id: 'doc005', name: '刘医生', specialty: '全科', availableSlots: 8 }
])

const openBookingModal = () => {
  if (!selectedUser.value) {
    toastRef.value?.warning('请先选择一个用户')
    return
  }
  bookingForm.value = {
    serviceType: '',
    doctorId: '',
    preferredDate: '',
    preferredTime: '',
    notes: ''
  }
  showBookingModal.value = true
}

const submitBooking = () => {
  if (!bookingForm.value.serviceType || !bookingForm.value.doctorId || !bookingForm.value.preferredDate || !bookingForm.value.preferredTime) {
    toastRef.value?.warning('请填写完整的预约信息')
    return
  }

  const doctor = availableDoctors.value.find(d => d.id === bookingForm.value.doctorId)
  // TODO: 实际应该调用API保存预约信息
  toastRef.value?.success(`预约成功！已预约 ${doctor?.name} - ${bookingForm.value.preferredDate} ${bookingForm.value.preferredTime}`)
  showBookingModal.value = false
}

// 查看报告模态框
const showReportModal = ref(false)
const selectedReportId = ref<string | null>(null)

// 体检报告数据
const medicalReports = ref([
  {
    id: 'report001',
    name: '血常规报告',
    type: 'blood',
    date: '2026-03-15',
    uploadDate: '2026-03-15 14:30',
    fileSize: '2.3 MB'
  },
  {
    id: 'report002',
    name: '生化指标报告',
    type: 'biochemistry',
    date: '2026-03-10',
    uploadDate: '2026-03-10 10:15',
    fileSize: '1.8 MB'
  },
  {
    id: 'report003',
    name: '心电图报告',
    type: 'ecg',
    date: '2026-03-08',
    uploadDate: '2026-03-08 16:45',
    fileSize: '956 KB'
  },
  {
    id: 'report004',
    name: '影像检查报告',
    type: 'imaging',
    date: '2026-03-01',
    uploadDate: '2026-03-01 09:20',
    fileSize: '15.2 MB'
  },
  {
    id: 'report005',
    name: '体成分分析报告',
    type: 'body',
    date: '2026-02-28',
    uploadDate: '2026-02-28 11:00',
    fileSize: '1.2 MB'
  }
])

const selectedReport = computed(() => {
  return medicalReports.value.find(r => r.id === selectedReportId.value) || null
})

const getReportIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    blood: Droplet,
    biochemistry: Activity,
    ecg: Heart,
    imaging: FileSpreadsheet,
    body: Users
  }
  return iconMap[type] || FileText
}

const getReportIconBg = (type: string) => {
  const bgMap: Record<string, string> = {
    blood: 'bg-gradient-to-br from-rose-500 to-pink-600',
    biochemistry: 'bg-gradient-to-br from-amber-500 to-orange-600',
    ecg: 'bg-gradient-to-br from-red-500 to-rose-600',
    imaging: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    body: 'bg-gradient-to-br from-emerald-500 to-teal-600'
  }
  return bgMap[type] || 'bg-gradient-to-br from-slate-500 to-slate-600'
}

const openReportModal = () => {
  if (!selectedUser.value) {
    toastRef.value?.warning('请先选择一个用户')
    return
  }
  selectedReportId.value = medicalReports.value[0]?.id || null
  showReportModal.value = true
}

const handleReportUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (!files || files.length === 0) return

  // TODO: 实际应该上传到服务器
  Array.from(files).forEach((file, index) => {
    const newReport = {
      id: `report${Date.now()}-${index}`,
      name: file.name.replace('.pdf', ''),
      type: 'other',
      date: new Date().toISOString().split('T')[0],
      uploadDate: new Date().toLocaleString('zh-CN'),
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    }
    medicalReports.value.unshift(newReport)
  })

  toastRef.value?.success(`成功上传 ${files.length} 份报告`)
  selectedReportId.value = medicalReports.value[0].id
  target.value = ''
}

const downloadReport = () => {
  if (!selectedReport.value) return
  // TODO: 实际应该下载PDF文件
  toastRef.value?.info(`正在下载 ${selectedReport.value.name}...`)
}

const deleteReport = () => {
  if (!selectedReport.value) return
  if (!confirm(`确定要删除 "${selectedReport.value.name}" 吗？`)) return

  const index = medicalReports.value.findIndex(r => r.id === selectedReport.value!.id)
  if (index > -1) {
    medicalReports.value.splice(index, 1)
    selectedReportId.value = medicalReports.value[0]?.id || null
    toastRef.value?.success('报告已删除')
  }
}

// 分配教练/医生相关方法
const openAssignCoachModal = () => {
  isChangeCoachMode.value = false
  currentChangingCoachId.value = null
  showCoachModal.value = true
}

const openChangeCoachModal = (coachId: string) => {
  isChangeCoachMode.value = true
  currentChangingCoachId.value = coachId
  showCoachModal.value = true
}

const confirmRemoveCoach = (coachId: string) => {
  if (!userAssignment.value?.coaches) return

  const coachDetail = userAssignment.value.coaches.find(c => c.coachId === coachId)
  if (!coachDetail) return

  if (confirm(`确定要移除 ${coachDetail.coachName} 教练吗？`)) {
    if (!selectedUser.value) return

    const result = removeCoach(selectedUser.value, coachId)

    if (result.success) {
      logRemoveCoach(
        selectedUser.value,
        currentUser.value?.name || '',
        coachId,
        result.coachName || ''
      )
      toastRef.value?.success('教练已移除')
    } else {
      toastRef.value?.error(result.message || '移除失败')
    }
  }
}

const handleCoachAssignment = (employeeId: string, data: {
  serviceType?: 'basic' | 'deep'
  firstServiceDate?: string
}) => {
  if (!selectedUser.value || !currentUser.value) return

  if (isChangeCoachMode.value) {
    // Change coach
    const oldCoachId = currentChangingCoachId.value || ''
    const result = changeCoach(selectedUser.value, oldCoachId, employeeId)

    if (result.success) {
      const newCoach = getEmployeeById(employeeId)
      logChangeCoach(
        selectedUser.value,
        currentUser.value.name,
        oldCoachId,
        userAssignment.value?.coaches?.find(c => c.coachId === oldCoachId)?.coachName || '',
        employeeId,
        newCoach?.name || ''
      )
      toastRef.value?.success('教练更换成功')
    } else {
      toastRef.value?.error(result.message || '更换失败')
    }
  } else {
    // Assign new coach
    if (!data.serviceType || !data.firstServiceDate) {
      toastRef.value?.error('请选择服务类型和首次服务日期')
      return
    }

    const result = assignCoach(
      selectedUser.value,
      currentUser.value.name,
      employeeId,
      data.serviceType,
      data.firstServiceDate
    )

    if (result.success) {
      const coach = getEmployeeById(employeeId)
      logAssignCoach(
        selectedUser.value,
        currentUser.value.name,
        employeeId,
        coach?.name || '',
        result.isNewClient || false
      )
      toastRef.value?.success('教练分配成功')
    } else {
      toastRef.value?.error(result.message || '分配失败')
    }
  }
}

const openAssignDoctorModal = () => {
  isChangeDoctorMode.value = false
  showDoctorModal.value = true
}

const openChangeDoctorModal = () => {
  isChangeDoctorMode.value = true
  showDoctorModal.value = true
}

const confirmRemoveDoctor = () => {
  if (!userAssignment.value?.doctorId || !selectedUser.value) return

  if (confirm(`确定要移除 ${userAssignment.value.doctorName} 医生吗？`)) {
    const result = removeDoctor(selectedUser.value)

    if (result.success) {
      logRemoveDoctor(
        selectedUser.value,
        currentUser.value?.name || '',
        userAssignment.value.doctorId,
        result.doctorName || ''
      )
      toastRef.value?.success('医生已移除')
    } else {
      toastRef.value?.error(result.message || '移除失败')
    }
  }
}

// 菜单处理方法 - 教练
const handleAddCoach = () => {
  showCoachManagementModal.value = false
  openAssignCoachModal()
}

const handleChangeCoach = (coachId: string) => {
  showCoachManagementModal.value = false
  openChangeCoachModal(coachId)
}

const handleRemoveCoach = (coachId: string) => {
  showCoachManagementModal.value = false
  confirmRemoveCoach(coachId)
}

// 菜单处理方法 - 医生
const handleAddDoctor = () => {
  showDoctorManagementModal.value = false
  openAssignDoctorModal()
}

const handleChangeDoctor = () => {
  showDoctorManagementModal.value = false
  openChangeDoctorModal()
}

const handleRemoveDoctor = () => {
  showDoctorManagementModal.value = false
  confirmRemoveDoctor()
}

const handleDoctorAssignment = (employeeId: string) => {
  if (!selectedUser.value || !currentUser.value) return

  if (isChangeDoctorMode.value) {
    // Change doctor
    const oldDoctorId = userAssignment.value?.doctorId || ''
    const result = changeDoctor(selectedUser.value, oldDoctorId, employeeId)

    if (result.success) {
      const newDoctor = getEmployeeById(employeeId)
      logChangeDoctor(
        selectedUser.value,
        currentUser.value.name,
        oldDoctorId,
        userAssignment.value?.doctorName || '',
        employeeId,
        newDoctor?.name || ''
      )
      toastRef.value?.success('医生更换成功')
    } else {
      toastRef.value?.error(result.message || '更换失败')
    }
  } else {
    // Assign new doctor
    const result = assignDoctor(selectedUser.value, currentUser.value.name, employeeId)

    if (result.success) {
      const doctor = getEmployeeById(employeeId)
      logAssignDoctor(
        selectedUser.value,
        currentUser.value.name,
        employeeId,
        doctor?.name || ''
      )
      toastRef.value?.success('医生分配成功')
    } else {
      toastRef.value?.error(result.message || '分配失败')
    }
  }
}

// 备注相关数据
interface Note {
  id: string
  author: string
  content: string
  time: string
}

const userNotesMap = ref<{ [key: string]: Note[] }>({
  '1': [
    {
      id: '1',
      author: '李教练',
      content: '客户今日血糖控制良好，建议继续保持当前饮食方案',
      time: '2026-03-19 10:30'
    },
    {
      id: '2',
      author: '王教练',
      content: '周末聚餐需注意控制碳水摄入，建议提前沟通',
      time: '2026-03-18 15:45'
    }
  ]
})

const userNotes = computed(() => {
  if (!selectedUser.value) return []
  return userNotesMap.value[selectedUser.value] || []
})

const newNote = ref('')
const editingNoteId = ref<string | null>(null)
const editingNoteContent = ref('')

const addNote = () => {
  if (!selectedUser.value || !newNote.value.trim()) return

  if (!userNotesMap.value[selectedUser.value]) {
    userNotesMap.value[selectedUser.value] = []
  }

  userNotesMap.value[selectedUser.value].unshift({
    id: Date.now().toString(),
    author: '当前教练',
    content: newNote.value.trim(),
    time: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  })

  newNote.value = ''
  toastRef.value?.success('备注已添加')
}

const startEditNote = (note: Note) => {
  editingNoteId.value = note.id
  editingNoteContent.value = note.content
}

const saveEditNote = () => {
  if (!selectedUser.value || !editingNoteId.value || !editingNoteContent.value.trim()) return

  const notes = userNotesMap.value[selectedUser.value]
  const noteIndex = notes.findIndex(n => n.id === editingNoteId.value)

  if (noteIndex !== -1) {
    notes[noteIndex].content = editingNoteContent.value.trim()
    toastRef.value?.success('备注已修改')
  }

  cancelEditNote()
}

const cancelEditNote = () => {
  editingNoteId.value = null
  editingNoteContent.value = ''
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
