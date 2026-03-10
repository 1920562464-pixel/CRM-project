<template>
  <div class="flex h-screen" style="background-color: var(--background-page);">
    <!-- Sidebar -->
    <aside
      ref="sidebarRef"
      class="relative flex flex-col transition-all duration-200"
      :style="{
        width: sidebarWidth + 'px',
        background: sidebarGradient,
        color: 'var(--sidebar-foreground)',
        borderRight: '1px solid var(--sidebar-border)',
        zIndex: 10
      }"
    >
      <!-- Logo -->
      <div class="p-6" style="border-bottom: 1px solid var(--sidebar-border);">
        <div class="flex items-center" :class="isSidebarCollapsed ? 'justify-center' : 'gap-3'">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" :style="{
            background: logoGradient,
            boxShadow: '0 4px 12px ' + (currentTheme === 'black-gold' ? 'rgba(184, 134, 11, 0.4)' : 'rgba(184, 134, 11, 0.25)')
          }">
            <Activity :size="24" :style="{ color: logoIconColor }" />
          </div>
          <div v-if="sidebarWidth > 180" class="flex-1 min-w-0">
            <h1 class="text-xl font-bold truncate" :style="{ color: logoTextColor }">惯能健康 CRM</h1>
            <p v-if="sidebarWidth > 200" class="text-xs truncate" :style="{ color: logoSubtitleColor }">健康管理系统</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 overflow-y-auto scrollbar-hide">
        <div v-for="(section, sectionIndex) in menuItems" :key="sectionIndex" class="mb-6">
          <h3 v-if="sidebarWidth > 180" class="text-xs uppercase font-semibold mb-2 px-3 tracking-wider truncate" style="color: var(--sidebar-accent-foreground);">
            {{ section.title }}
          </h3>
          <div class="space-y-1">
            <div
              v-for="item in section.items"
              :key="item.id"
              @click="navigateTo(item.path)"
              class="flex items-center rounded-lg cursor-pointer transition-all duration-200 whitespace-nowrap overflow-hidden"
              :class="isSidebarCollapsed ? 'justify-center px-0 py-3' : 'gap-3 px-3 py-2.5'"
              :style="isActiveRoute(item.path) ? {
                background: activeItemGradient,
                color: activeItemTextColor,
                boxShadow: '0 4px 12px ' + (currentTheme === 'black-gold' ? 'rgba(184, 134, 11, 0.4)' : currentTheme === 'warm-yellow' ? 'rgba(184, 134, 11, 0.25)' : 'rgba(77, 112, 255, 0.3)')
              } : {
                color: 'var(--sidebar-foreground)',
                backgroundColor: 'transparent'
              }"
              @mouseenter="!isActiveRoute(item.path) && (item.hovered = true)"
              @mouseleave="!isActiveRoute(item.path) && (item.hovered = false)"
              :title="isSidebarCollapsed ? item.label : ''"
            >
              <component :is="item.icon" :size="18" class="flex-shrink-0" />
              <span v-if="sidebarWidth > 180" class="font-medium text-sm truncate">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </nav>

      <!-- Footer -->
      <div class="p-4" style="border-top: 1px solid var(--sidebar-border);">
        <!-- 用户信息 -->
        <div class="flex items-center text-sm" :class="isSidebarCollapsed ? 'justify-center' : 'gap-3'" style="color: var(--sidebar-accent-foreground);">
          <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background: var(--sidebar-accent);">
            <User :size="16" />
          </div>
          <div v-if="sidebarWidth > 180" class="flex-1 min-w-0">
            <p class="font-medium truncate" style="color: var(--sidebar-foreground);">{{ currentRoleConfig?.name }}</p>
            <p v-if="sidebarWidth > 200" class="text-xs truncate" style="color: var(--sidebar-accent-foreground);">{{ currentRoleConfig?.description }}</p>
          </div>
        </div>
        <!-- 收起/展开按钮 -->
        <button
          @click="toggleSidebar"
          class="mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 w-full"
          style="color: var(--sidebar-foreground); background: var(--sidebar-accent); opacity: 0.9;"
          @mouseenter="$event.currentTarget.style.opacity = '1'"
          @mouseleave="$event.currentTarget.style.opacity = '0.9'"
          :title="isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
        >
          <ChevronDown
            :size="18"
            :style="{
              transition: 'transform 0.2s ease',
              transform: isSidebarCollapsed ? 'rotate(0deg)' : 'rotate(-90deg)'
            }"
          />
          <span v-if="sidebarWidth > 180" class="text-xs font-medium">
            {{ isSidebarCollapsed ? '展开' : '收起' }}
          </span>
        </button>
      </div>

      <!-- Resizer -->
      <div
        v-show="!isSidebarCollapsed"
        ref="resizerRef"
        @mousedown="startResize"
        class="absolute top-0 right-0 w-1 h-full cursor-col-resize transition-colors"
        style="background: transparent;"
        @mouseenter="$event.target.style.background = 'rgba(184, 134, 11, 0.3)'"
        @mouseleave="$event.target.style.background = 'transparent'"
      ></div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 
    flex flex-col overflow-hidden relative" style="z-index: 20;">
      <!-- Header -->
      <header class="px-6 py-3 flex items-center justify-between" style="background-color: var(--card); border-bottom: 1px solid var(--border);">
        <!-- Left: Breadcrumb -->
        <div class="flex items-center gap-2 text-sm" style="color: var(--text-regular);">
          <span class="font-medium" style="color: var(--text-primary);">{{ currentPageTitle }}</span>
        </div>

        <!-- Right: Actions -->
        <div class="flex items-center gap-3">
          <!-- 预警中心横条 -->
          <div class="relative">
            <div
              @click="goToAlertList"
              class="flex items-center gap-3 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
              style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2);"
              @mouseenter="$event.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'"
              @mouseleave="$event.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'"
            >
              <!-- 左侧：预警中心标题 -->
              <div class="flex items-center gap-1.5">
                <ShieldAlert :size="14" style="color: #ef4444;" />
                <span class="text-xs font-bold" style="color: #ef4444;">预警中心</span>
                <span v-if="alertCount > 0" class="px-1.5 py-0.5 text-[9px] font-semibold rounded-full" style="background-color: rgba(239, 68, 68, 0.2); color: #ef4444;">
                  {{ alertCount }}项异常
                </span>
              </div>

              <!-- 分隔线 -->
              <div class="w-px h-4" style="background: rgba(239, 68, 68, 0.3);"></div>

              <!-- 中间：最新预警信息 -->
              <div v-if="alertList.length > 0" class="flex items-center gap-2 flex-1 min-w-0">
                <div class="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0" :style="{ background: alertList[0].userColor, color: 'white' }">
                  {{ alertList[0].userName.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-[10px] font-medium truncate" style="color: var(--text-primary);">
                    {{ alertList[0].userName }}
                  </span>
                  <span class="text-[9px] truncate ml-1" style="color: var(--text-secondary);">
                    {{ alertList[0].message }}
                  </span>
                </div>
              </div>
              <div v-else class="flex-1">
                <span class="text-[10px]" style="color: var(--text-secondary);">暂无异常</span>
              </div>

              <!-- 右侧：展开按钮 -->
              <ChevronDown
                :size="14"
                style="color: var(--text-secondary); transition: transform 0.2s ease;"
                :style="{ transform: showAlertCenter ? 'rotate(180deg)' : 'rotate(0deg)' }"
              />
            </div>

            <!-- 预警中心下拉面板 -->
            <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
              <div v-if="showAlertCenter" class="absolute right-0 mt-2 w-96 max-h-[500px z-50 rounded-xl overflow-hidden flex flex-col" style="background-color: var(--popover); border: 1px solid var(--border); box-shadow: var(--shadow-base);">
                <!-- 头部 -->
                <div class="flex items-center justify-between p-4" style="border-bottom: 1px solid var(--border);">
                  <div class="flex items-center gap-2">
                    <ShieldAlert :size="18" :style="{ color: '#ef4444' }" />
                    <h3 class="font-semibold" style="color: var(--text-primary);">预警中心</h3>
                    <span v-if="alertCount > 0" class="px-2 py-0.5 text-xs font-semibold rounded-full" style="background-color: rgba(239, 68, 68, 0.15); color: #ef4444;">
                      {{ alertCount }}条预警
                    </span>
                  </div>
                  <button
                    @click="showAlertCenter = false"
                    class="p-1 hover:bg-slate-100 rounded"
                  >
                    <X :size="16" />
                  </button>
                </div>

                <!-- 预警列表 -->
                <div class="flex-1 overflow-y-auto p-2">
                  <!-- 空状态 -->
                  <div
                    v-if="alertList.length === 0"
                    class="flex flex-col items-center justify-center py-12"
                  >
                    <CheckCircle :size="48" class="mb-3" style="color: '#16a34a', opacity: 0.5;" />
                    <p class="text-sm" style="color: var(--text-secondary);">暂无预警</p>
                    <p class="text-xs mt-1" style="color: var(--text-disabled);">所有用户数据正常</p>
                  </div>

                  <!-- 预警列表 -->
                  <div v-else class="space-y-1">
                    <div
                      v-for="alert in alertList"
                      :key="alert.id"
                      @click="handleAlertClick(alert)"
                      class="p-3 rounded-lg cursor-pointer transition-colors"
                      style="border: 1px solid var(--border);"
                      @mouseenter="$event.currentTarget.style.backgroundColor = 'var(--fill-light)'"
                      @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'"
                    >
                      <div class="flex items-center gap-3">
                        <!-- 用户头像 -->
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" :style="{ background: alert.userColor, color: 'white' }">
                          {{ alert.userName.charAt(0) }}
                        </div>

                        <!-- 内容 -->
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="text-sm font-medium" style="color: var(--text-primary);">
                              {{ alert.userName }}
                            </span>
                            <span :class="`text-[10px] px-1.5 py-0.5 rounded font-medium ${alert.typeBg} ${alert.typeColor}`">
                              {{ alert.type }}
                            </span>
                          </div>
                          <p class="text-xs truncate" style="color: var(--text-secondary);">
                            {{ alert.message }}
                          </p>
                        </div>

                        <!-- 图标 -->
                        <div :class="`p-1.5 rounded-lg ${alert.iconBg}`">
                          <component :is="alert.icon" :size="14" :class="alert.iconColor" />
                        </div>
                      </div>

                      <!-- 时间 -->
                      <div class="flex items-center gap-1 mt-2 text-xs" style="color: var(--text-disabled);">
                        <Clock :size="10" />
                        {{ alert.timeAgo }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 底部 -->
                <div class="p-3 rounded-b-xl" style="border-top: 1px solid var(--border); background-color: var(--fill-light);">
                  <button
                    @click="goToAlertList"
                    class="w-full py-2 text-sm font-medium"
                    :style="{ color: '#B8860B' }"
                  >
                    查看全部预警
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- 角色切换 -->
          <div class="relative">
            <button
              @click="showRoleSelector = !showRoleSelector"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors"
              style="color: var(--text-primary);"
              @mouseenter="$event.currentTarget.style.backgroundColor = 'var(--fill-light)'"
              @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'"
            >
              <span class="text-lg">{{ currentRoleConfig?.icon }}</span>
              <span class="text-sm font-medium" style="color: var(--text-primary);">{{ currentRoleConfig?.name }}</span>
              <ChevronDown :size="16" style="color: var(--text-secondary);" />
            </button>

            <!-- 角色下拉菜单 -->
            <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
              <div v-if="showRoleSelector" class="absolute right-0 mt-2 w-48 py-2 z-50 rounded-xl" style="background-color: var(--popover); border: 1px solid var(--border); box-shadow: var(--shadow-base);">
                <div class="px-3 py-2 text-xs font-semibold uppercase" style="color: var(--text-secondary); border-bottom: 1px solid var(--border-light);">
                  切换角色
                </div>
                <button
                  v-for="role in getAvailableRoles()"
                  :key="role.id"
                  @click="switchRole(role.id)"
                  class="w-full px-3 py-2 flex items-center gap-3 transition-colors"
                  :style="currentRole === role.id ? {
                    background: 'linear-gradient(90deg, rgba(184, 134, 11, 0.15) 0%, transparent 100%)'
                  } : {}"
                  @mouseenter="$event.currentTarget.style.backgroundColor = currentRole === role.id ? 'rgba(184, 134, 11, 0.15)' : 'var(--fill-light)'"
                  @mouseleave="$event.currentTarget.style.backgroundColor = currentRole === role.id ? 'rgba(184, 134, 11, 0.15)' : 'transparent'"
                >
                  <span class="text-lg">{{ role.icon }}</span>
                  <div class="flex-1 text-left">
                    <div class="text-sm font-medium" style="color: var(--text-primary);">{{ role.name }}</div>
                    <div class="text-xs" style="color: var(--text-secondary);">{{ role.description }}</div>
                  </div>
                  <Check v-if="currentRole === role.id" :size="16" style="color: #B8860B;" />
                </button>
              </div>
            </Transition>
          </div>

          <!-- 皮肤切换按钮 -->
          <div class="relative">
            <button
              @click="cycleTheme"
              class="p-2 rounded-lg transition-colors relative"
              style="color: var(--text-regular);"
              @mouseenter="$event.currentTarget.style.backgroundColor = 'var(--fill-light)'"
              @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'"
              :title="`当前主题: ${getThemeName(currentTheme)}`"
            >
              <span class="text-xl">{{ getThemeIcon(currentTheme) }}</span>
            </button>

            <!-- 皮肤选择面板 -->
            <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
              <div v-if="showThemePanel" class="absolute right-0 mt-2 w-56 py-3 z-50 rounded-xl" style="background-color: var(--popover); border: 1px solid var(--border); box-shadow: var(--shadow-base);">
                <div class="px-3 pb-2 text-xs font-semibold uppercase" style="color: var(--text-secondary); border-bottom: 1px solid var(--border-light);">
                  皮肤主题
                </div>
                <div class="space-y-1 px-2 pt-2">
                  <button
                    v-for="theme in ['default', 'black-gold', 'warm-yellow'] as const"
                    :key="theme"
                    @click="setTheme(theme); showThemePanel = false"
                    class="w-full px-3 py-2.5 flex items-center gap-3 rounded-lg transition-all duration-200"
                    :style="currentTheme === theme ? {
                      background: theme === 'black-gold'
                        ? 'linear-gradient(90deg, rgba(184, 134, 11, 0.2) 0%, transparent 100%)'
                        : 'linear-gradient(90deg, rgba(77, 112, 255, 0.1) 0%, transparent 100%)',
                      border: '1px solid ' + (theme === 'black-gold' ? '#B8860B' : '#4D70FF')
                    } : {
                      background: 'transparent',
                      border: '1px solid transparent'
                    }"
                    @mouseenter="currentTheme !== theme && ($event.currentTarget.style.backgroundColor = 'var(--fill-light)')"
                    @mouseleave="currentTheme !== theme && ($event.currentTarget.style.backgroundColor = 'transparent')"
                  >
                    <span class="text-2xl">{{ getThemeIcon(theme) }}</span>
                    <div class="flex-1 text-left">
                      <div class="text-sm font-medium" :style="{ color: currentTheme === theme ? 'var(--primary)' : 'var(--text-primary)' }">
                        {{ getThemeName(theme) }}
                      </div>
                      <div class="text-xs" style="color: var(--text-secondary);">
                        {{ theme === 'default' ? '经典蓝白配色' : theme === 'black-gold' ? '尊贵黑金风格' : '温暖金黄色调' }}
                      </div>
                    </div>
                    <Check v-if="currentTheme === theme" :size="16" :style="{ color: theme === 'black-gold' ? '#B8860B' : '#4D70FF' }" />
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- BatchTaskProcessor 专用组件 -->
          <template v-if="isBatchTaskProcessor">
            <!-- 日历选择器 -->
            <DatePickerButton
              v-model="selectedCalendarDate"
              :date-data="dateDataMap"
            />
          </template>

          <!-- 通知中心 -->
          <div class="relative">
            <button
              @click="showNotificationCenter = !showNotificationCenter"
              class="p-2 rounded-lg transition-colors relative"
              style="color: var(--text-regular);"
              @mouseenter="$event.currentTarget.style.backgroundColor = 'var(--fill-light)'"
              @mouseleave="$event.currentTarget.style.backgroundColor = 'transparent'"
              title="通知中心"
            >
              <Bell :size="20" />
              <span v-if="unreadCount > 0" class="absolute top-1 right-1 w-2 h-2 rounded-full" style="background-color: var(--danger);"></span>
            </button>

            <!-- 通知中心下拉面板 -->
            <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
              <div v-if="showNotificationCenter" class="absolute right-0 mt-2 w-80 rounded-xl z-50 max-h-[500px] flex flex-col" style="background-color: var(--popover); border: 1px solid var(--border); box-shadow: var(--shadow-base);">
                <!-- 头部 -->
                <div class="flex items-center justify-between p-4" style="border-bottom: 1px solid var(--border);">
                  <div class="flex items-center gap-2">
                    <Bell :size="18" style="color: #B8860B;" />
                    <h3 class="font-semibold" style="color: var(--text-primary);">通知中心</h3>
                    <span v-if="unreadCount > 0" class="px-2 py-0.5 text-xs font-semibold rounded-full" style="background-color: rgba(184, 134, 11, 0.15); color: #B8860B;">
                      {{ unreadCount }}条未读
                    </span>
                  </div>
                  <button
                    @click="showNotificationCenter = false"
                    class="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                  >
                    <X :size="16" />
                  </button>
                </div>

                <!-- 通知列表 -->
                <div class="flex-1 overflow-y-auto">
                  <div v-if="notifications.length === 0" class="flex flex-col items-center justify-center py-12 text-slate-400">
                    <CheckCircle :size="48" class="mb-3 opacity-50" />
                    <p class="text-sm">暂无通知</p>
                  </div>
                  <div v-else class="divide-y divide-slate-100">
                    <div
                      v-for="notification in notifications"
                      :key="notification.id"
                      @click="markAsRead(notification.id)"
                      :class="`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''}`"
                    >
                      <div class="flex items-start gap-3">
                        <!-- 图标 -->
                        <div :class="`p-2 rounded-lg ${getNotificationStyle(notification.type)}`">
                          <component :is="getNotificationIcon(notification.type)" :size="16" />
                        </div>

                        <!-- 内容 -->
                        <div class="flex-1 min-w-0">
                          <div class="flex items-start justify-between mb-1">
                            <h4 :class="`font-medium text-sm ${!notification.read ? 'text-slate-900' : 'text-slate-600'}`">
                              {{ notification.title }}
                            </h4>
                            <span class="text-xs text-slate-500 flex items-center gap-1">
                              <Clock :size="10" />
                              {{ notification.time }}
                            </span>
                          </div>
                          <p :class="`text-sm ${!notification.read ? 'text-slate-700' : 'text-slate-500'}`">
                            {{ notification.message }}
                          </p>
                        </div>

                        <!-- 删除按钮 -->
                        <button
                          @click.stop="deleteNotification(notification.id)"
                          class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="删除"
                        >
                          <X :size="14" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 底部 -->
                <div class="p-3 rounded-b-xl" style="border-top: 1px solid var(--border); background-color: var(--fill-light);">
                  <button
                    @click="markAllAsRead"
                    v-if="unreadCount > 0"
                    class="w-full py-2 text-sm font-medium"
                    style="color: #B8860B;"
                    @mouseenter="$event.currentTarget.style.color = '#D4A84A'"
                    @mouseleave="$event.currentTarget.style.color = '#B8860B'"
                  >
                    全部标记为已读
                  </button>
                  <button
                    @click="showNotificationCenter = false"
                    class="w-full py-2 text-sm font-medium"
                    style="color: var(--text-secondary);"
                    @mouseenter="$event.currentTarget.style.color = 'var(--text-primary)'"
                    @mouseleave="$event.currentTarget.style.color = 'var(--text-secondary)'"
                  >
                    关闭
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <!-- 主内容 -->
      <main class="flex-1 overflow-y-auto p-3 md:p-4 relative" style="background-color: var(--background-page);">
        <router-view />
      </main>
    </div>

    <!-- 全局 Toast -->
    <Teleport to="body">
      <TransitionGroup name="toast" tag="div" class="fixed top-4 right-4 z-50 flex flex-col gap-2">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-md"
          :style="{
            backgroundColor: toast.type === 'success' ? 'var(--success)' :
                            toast.type === 'error' ? 'var(--danger)' :
                            toast.type === 'warning' ? 'var(--warning)' :
                            '#2A2A2A',
            color: '#FAF3E3',
            border: toast.type === 'success' ? '1px solid var(--success)' :
                   toast.type === 'error' ? '1px solid var(--danger)' :
                   toast.type === 'warning' ? '1px solid var(--warning)' :
                   '1px solid var(--border)',
            boxShadow: 'var(--shadow-base)'
          }"
        >
          <CheckCircle v-if="toast.type === 'success'" :size="20" />
          <XCircle v-else-if="toast.type === 'error'" :size="20" />
          <AlertCircle v-else-if="toast.type === 'warning'" :size="20" />
          <Info v-else :size="20" />
          <div class="flex-1">
            <p v-if="toast.title" class="font-semibold text-sm">{{ toast.title }}</p>
            <p class="text-sm">{{ toast.message }}</p>
          </div>
          <button @click="removeToast(toast.id)" class="p-1 rounded transition-colors hover:bg-white/20">
            <X :size="16" />
          </button>
        </div>
      </TransitionGroup>
    </Teleport>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 隐藏滚动条但保持滚动功能 */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Chrome, Safari and Opera */
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

<script setup lang="ts">
import { ref, computed, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CheckCircle, XCircle, AlertCircle, Info, X, ChevronDown, Check, Clock, AlertTriangle, Inbox, ChevronUp, ChevronLeft, ArrowLeft, ShieldAlert } from 'lucide-vue-next'
import { Activity, User, LayoutDashboard, Users, Monitor, Wallet, Box, Briefcase, ShoppingCart, Lock, Bell, BrainCircuit, BookOpen, ShoppingBag, Database, FileText, DollarSign, Receipt, Award, Link2, ListTodo } from 'lucide-vue-next'
import { useToast } from './composables/useToast'
import { useRole } from './composables/useRole'
import { useTheme } from './composables/useTheme'
import DatePickerButton from './components/shared/DatePickerButton.vue'

// 初始化全局 Toast
const { toasts, removeToast } = useToast()

// 初始化角色管理
const { currentRole, currentRoleConfig, switchRole, getAvailableRoles, hasPermission } = useRole()
const showRoleSelector = ref(false)

// 初始化主题管理
const { currentTheme, setTheme, cycleTheme, getThemeIcon, getThemeName } = useTheme()
const showThemePanel = ref(false)

// 通知中心状态
const showNotificationCenter = ref(false)

// 预警中心状态
const showAlertCenter = ref(false)

// 预警数据类型
interface AlertItem {
  id: string
  userName: string
  userId: string
  type: string
  typeBg: string
  typeColor: string
  icon: any
  iconBg: string
  iconColor: string
  message: string
  timeAgo: string
  priority: 'high' | 'medium' | 'low'
  userColor: string
}

// 模拟预警数据
const alertList = ref<AlertItem[]>([
  {
    id: '1',
    userName: '王磊',
    userId: '1',
    type: '设备',
    typeBg: 'bg-orange-100',
    typeColor: 'text-orange-700',
    icon: Clock,
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    message: '超过3天未同步穿戴设备数据',
    timeAgo: '今日',
    priority: 'high',
    userColor: 'rgb(79, 70, 229)'
  },
  {
    id: '2',
    userName: '张建国',
    userId: '3',
    type: '血糖',
    typeBg: 'bg-red-100',
    typeColor: 'text-red-700',
    icon: Activity,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    message: '血糖9.5 mmol/L，超出目标范围',
    timeAgo: '2小时前',
    priority: 'high',
    userColor: 'rgb(249, 115, 22)'
  },
  {
    id: '3',
    userName: '孙强',
    userId: '5',
    type: '任务',
    typeBg: 'bg-amber-100',
    typeColor: 'text-amber-700',
    icon: AlertTriangle,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    message: '完成率11%，需重点关注',
    timeAgo: '昨日',
    priority: 'medium',
    userColor: 'rgb(34, 197, 94)'
  }
])

// 预警总数
const alertCount = computed(() => alertList.value.length)

// BatchTaskProcessor 专用状态
const selectedCalendarDate = ref(new Date())
const dateDataMap = ref<Record<string, any>>({})

// Provide calendar state to child components
provide('calendarState', {
  selectedCalendarDate,
  dateDataMap
})

// 判断是否是 BatchTaskProcessor 页面
const isBatchTaskProcessor = computed(() => route.name === 'BatchTaskProcessor')

// 模拟通知数据
interface Notification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  time: string
  read: boolean
}

const notifications = ref<Notification[]>([
  // 默认没有通知，避免页面加载时显示不必要的提示
])

// 未读通知数量
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

// 获取通知样式
const getNotificationStyle = (type: string) => {
  const styles = {
    info: 'bg-blue-50 text-blue-600',
    warning: 'bg-yellow-50 text-yellow-600',
    error: 'bg-red-50 text-red-600',
    success: 'bg-green-50 text-green-600'
  }
  return styles[type as keyof typeof styles] || styles.info
}

// 获取通知图标
const getNotificationIcon = (type: string) => {
  const icons = {
    info: Inbox,
    warning: AlertTriangle,
    error: XCircle,
    success: CheckCircle
  }
  return icons[type as keyof typeof icons] || icons.info
}

// 标记为已读
const markAsRead = (id: string) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

// 全部标记为已读
const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

// 删除通知
const deleteNotification = (id: string) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

// 预警中心方法
const handleAlertClick = (alert: AlertItem) => {
  // 跳转到工作台内容并选中该用户
  router.push({
    path: '/batch-task-processor',
    query: { userId: alert.userId }
  })
  showAlertCenter.value = false
}

const goToAlertList = () => {
  // 可以跳转到完整的预警列表页面
  router.push('/alert-center')
  showAlertCenter.value = false
}

// 路由
const route = useRoute()
const router = useRouter()

// Sidebar resize states
const sidebarRef = ref<HTMLElement | null>(null)
const resizerRef = ref<HTMLElement | null>(null)
const sidebarWidth = ref(256)
const isResizing = ref(false)

// Sidebar collapse state
const isSidebarCollapsed = ref(false)
const collapsedWidth = 80 // 收起时的宽度
const expandedWidth = 256 // 展开时的宽度

// 切换侧边栏收起/展开
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  sidebarWidth.value = isSidebarCollapsed.value ? collapsedWidth : expandedWidth
}

// 主题相关的计算属性
const sidebarGradient = computed(() => {
  switch (currentTheme.value) {
    case 'default':
      return 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' // 深蓝灰色渐变
    case 'black-gold':
      return 'linear-gradient(180deg, #1A1A1A 0%, #0D0D0D 100%)'
    case 'warm-yellow':
      return 'linear-gradient(180deg, #FFFEF8 0%, #FAF3E3 100%)'
    default:
      return 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
  }
})

const logoGradient = computed(() => {
  switch (currentTheme.value) {
    case 'default':
      return 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' // 靛蓝色渐变
    case 'black-gold':
      return 'linear-gradient(135deg, #D4A84A 0%, #B8860B 100%)'
    case 'warm-yellow':
      return 'linear-gradient(135deg, #D4A84A 0%, #B8860B 100%)'
    default:
      return 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
  }
})

const logoIconColor = computed(() => {
  return '#FFFFFF' // 所有主题都是白色图标
})

const logoTextColor = computed(() => {
  return currentTheme.value === 'warm-yellow' ? '#2C2416' : '#FFFFFF'
})

const logoSubtitleColor = computed(() => {
  return currentTheme.value === 'warm-yellow' ? 'rgba(44, 36, 22, 0.7)' : 'rgba(255, 255, 255, 0.7)'
})

const activeItemGradient = computed(() => {
  switch (currentTheme.value) {
    case 'default':
      return 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' // 靛蓝色激活
    case 'black-gold':
      return 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)'
    case 'warm-yellow':
      return 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)'
    default:
      return 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'
  }
})

const activeItemTextColor = computed(() => {
  return '#FFFFFF' // 所有主题的激活项都是白色文字
})
const startX = ref(0)
const startWidth = ref(0)

// 当前页面标题
const currentPageTitle = computed(() => {
  const titles: { [key: string]: string } = {
    'dashboard': '仪表盘',
    'batch-task-processor': '工作台内容',
    'client-list': '客户列表',
    'client-profile': '客户详情',
    'sales-monitor': '大屏监控',
    'lead-management': '客情概览',
    'ai-chat': 'AI 对话',
    'knowledge-base': '知识库',
    'inventory-management': '商品与库存',
    'asset-management': '资产管理',
    'settlement-management': '人力结算',
    'coach-settlement': '教练结算',
    'doctor-settlement': '医生结算',
    'commission-settlement': '顾问结算',
    'finance-center': '财务中心',
    'commission-management': '佣金管理',
    'rich-biscuit-management': '富贵饼管理',
    'online-service-management': '上线服务管理',
    'service-binding-management': '用户绑定管理',
    'salary-slip-management': '工资条管理',
    'coach-reimbursement': '报销管理',
    'reimbursement': '报销管理',
    'account-payable': '应付账款管理',
    'system-management': '系统管理'
  }
  const path = route.path.split('/')[1] || 'dashboard'
  return titles[path] || '惯能健康 CRM'
})

// 导航菜单 - 按分组组织
const menuItems = computed(() => {
  const sections = [
    {
      title: '工作台',
      items: [
        { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'batch-task-processor', label: '工作台内容', icon: ListTodo, path: '/batch-task-processor' }
      ]
    },
    {
      title: '客户管理',
      items: [
        { id: 'client-list', label: '客户列表', icon: Users, path: '/client-list' }
      ]
    },
    {
      title: '客情管理',
      items: [
        { id: 'sales-monitor', label: '大屏监控', icon: Monitor, path: '/sales-monitor' },
        { id: 'lead-management', label: '客情概览', icon: Briefcase, path: '/lead-management' }
      ]
    },
    {
      title: 'ERP中心',
      items: [
        { id: 'inventory-management', label: '商品与库存', icon: Box, path: '/inventory-management' },
        { id: 'asset-management', label: '资产管理', icon: Database, path: '/asset-management' }
      ]
    }
  ]

  // 财务中心 - 仅财务和管理员可见
  if (hasPermission('showIncomeManagement')) {
    sections.push({
      title: '财务中心',
      items: [
        { id: 'finance-center', label: '财务中心', icon: Wallet, path: '/finance-center' }
      ]
    })
  }

  // 智能辅助
  sections.push({
    title: '智能辅助',
    items: [
      { id: 'ai-chat', label: 'AI 对话', icon: Bell, path: '/ai-chat' },
      { id: 'knowledge-base', label: '知识库', icon: Monitor, path: '/knowledge-base' }
    ]
  })

  // 我的报销 - 所有人可见
  sections.push({
    title: '我的报销',
    items: [
      { id: 'coach-reimbursement', label: '报销管理', icon: Receipt, path: '/coach-reimbursement' }
    ]
  })

  // 系统管理 - 始终在最后
  if (hasPermission('showSystemManagement')) {
    sections.push({
      title: '系统管理',
      items: [
        { id: 'system-management', label: '系统管理', icon: Lock, path: '/system-management' }
      ]
    })
  }

  return sections
})

// 判断当前路由
const isActiveRoute = (path: string) => {
  if (!route || !route.path) return false
  return route.path.startsWith(path)
}

// 导航方法
const navigateTo = (path: string) => {
  if (path && path !== route.path) {
    router.push(path).catch(err => {
      console.warn('Navigation error:', err)
    })
  }
}

// Sidebar resize methods
const startResize = (e: MouseEvent) => {
  isResizing.value = true
  startX.value = e.clientX
  startWidth.value = sidebarWidth.value

  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)

  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
}

const onResize = (e: MouseEvent) => {
  if (!isResizing.value) return

  const deltaX = e.clientX - startX.value
  const newWidth = startWidth.value + deltaX

  sidebarWidth.value = Math.max(180, Math.min(400, newWidth))
}

const stopResize = () => {
  isResizing.value = false

  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)

  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}
</script>
