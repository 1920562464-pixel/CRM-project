<template>
  <div class="min-h-screen bg-slate-50 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold"
                :class="roleConfig[currentRole].bgColor">
                {{ roleConfig[currentRole].icon }}
              </div>
              <div>
                <h1 class="text-2xl font-bold text-slate-900">{{ roleConfig[currentRole].title }}</h1>
                <p class="text-sm text-slate-500">{{ greetingText }}，{{ currentUserName }}</p>
              </div>
            </div>
          </div>

          <!-- 角色切换 -->
          <div class="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <button
              v-for="(config, role) in roleConfig"
              :key="role"
              @click="switchRole(role)"
              :class="`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                currentRole === role ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`"
            >
              {{ config.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <!-- 快捷操作（指标卡上方） -->
      <div class="flex items-center gap-2">
        <button
          v-for="action in quickActions"
          :key="action.id"
          @click="handleQuickAction(action.id)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
          :class="action.disabled ? 'border-slate-200 bg-slate-50 opacity-40 cursor-not-allowed' : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer'"
          :disabled="action.disabled"
        >
          <component :is="action.icon" :size="14" :class="action.iconColor" />
          <span :class="action.disabled ? 'text-slate-400' : 'text-slate-600'">{{ action.label }}</span>
        </button>
      </div>

      <!-- 核心指标卡片（教练管理员已在全宽区域展示KPI） -->
      <div v-if="currentRole !== 'coach-admin'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          v-for="stat in currentStats"
          :key="stat.id"
          :title="stat.title"
          :value="stat.value"
          :unit="stat.unit"
          :trend="stat.trend"
          :trendValue="stat.trendValue"
          :icon="stat.icon"
          :bgColor="stat.bgColor"
          :textColor="stat.textColor"
          :clickAction="stat.clickAction"
          @click="handleCardClick"
        />
      </div>

      <!-- 教练管理员全宽面板 -->
      <template v-if="currentRole === 'coach-admin'">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button v-for="tab in coachTimeTabs" :key="tab.value" @click="coachTimeFilter = tab.value"
              :class="`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${coachTimeFilter === tab.value ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`">
              {{ tab.label }}
            </button>
          </div>
          <div class="flex items-center gap-2">
            <div class="relative">
              <Search :size="14" class="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input v-model="coachSearchQuery" placeholder="搜索教练..." class="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg w-40 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <button class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
              <Download :size="12" /> 导出
            </button>
          </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <!-- 教练总数 -->
          <div @click="handleCardClick('view-coaches-list')" class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative overflow-hidden cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all">
            <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2 bg-indigo-500"></div>
            <div class="flex items-center justify-between mb-2"><span class="text-sm text-slate-600">教练总数</span><Users :size="16" class="text-indigo-500" /></div>
            <div class="text-3xl font-bold text-slate-900">{{ coachAdminStats.totalCoaches }}</div>
            <div class="flex items-center gap-2 text-xs text-slate-400 mt-1"><span>在职: {{ coachAdminStats.activeCoaches }}</span><span>试用: {{ coachAdminStats.probationCoaches }}</span></div>
            <div class="text-[10px] text-indigo-400 mt-2 flex items-center gap-0.5">查看详情 <ChevronRight :size="10" /></div>
          </div>
          <!-- 平均完成率 -->
          <div @click="handleCardClick('view-completion-detail')" class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative overflow-hidden cursor-pointer hover:shadow-md hover:border-green-300 transition-all">
            <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2 bg-green-500"></div>
            <div class="flex items-center justify-between mb-2"><span class="text-sm text-slate-600">平均完成率</span><TrendingUp :size="16" class="text-green-500" /></div>
            <div class="text-3xl font-bold text-slate-900">{{ coachAdminStats.avgCompletionRate }}%</div>
            <div class="flex items-center gap-1 text-xs mt-1" :class="coachAdminStats.completionTrend >= 0 ? 'text-green-600' : 'text-red-600'">
              <TrendingUp v-if="coachAdminStats.completionTrend >= 0" :size="14" /><TrendingDown v-else :size="14" />
              <span>{{ coachAdminStats.completionTrend >= 0 ? '+' : '' }}{{ coachAdminStats.completionTrend }}% 较上期</span>
            </div>
            <div class="text-[10px] text-green-400 mt-2 flex items-center gap-0.5">查看详情 <ChevronRight :size="10" /></div>
          </div>
          <!-- 优秀教练 -->
          <div @click="handleCardClick('view-top-performers')" class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative overflow-hidden cursor-pointer hover:shadow-md hover:border-amber-300 transition-all">
            <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2 bg-amber-500"></div>
            <div class="flex items-center justify-between mb-2"><span class="text-sm text-slate-600">优秀教练</span><Award :size="16" class="text-amber-500" /></div>
            <div class="text-3xl font-bold text-slate-900">{{ coachAdminStats.topPerformers }}</div>
            <div class="text-xs text-slate-400 mt-1">完成率 ≥ 85%</div>
            <div class="text-[10px] text-amber-400 mt-2 flex items-center gap-0.5">查看详情 <ChevronRight :size="10" /></div>
          </div>
          <!-- 服务用户 -->
          <div @click="handleCardClick('view-coach-users')" class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative overflow-hidden cursor-pointer hover:shadow-md hover:border-blue-300 transition-all">
            <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2 bg-blue-500"></div>
            <div class="flex items-center justify-between mb-2"><span class="text-sm text-slate-600">服务用户</span><UserCheck :size="16" class="text-blue-500" /></div>
            <div class="text-3xl font-bold text-slate-900">{{ coachAdminStats.totalUsers }}</div>
            <div class="text-xs text-slate-400 mt-1">活跃{{ coachAdminStats.todayActiveUsers }}</div>
            <div class="text-[10px] text-blue-400 mt-2 flex items-center gap-0.5">查看详情 <ChevronRight :size="10" /></div>
          </div>
          <!-- 待关注 -->
          <div @click="handleCardClick('view-attention-needed')" class="bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative overflow-hidden cursor-pointer hover:shadow-md hover:border-red-300 transition-all">
            <div class="absolute top-0 right-0 w-20 h-20 rounded-full opacity-5 -translate-y-1/2 translate-x-1/2 bg-red-500"></div>
            <div class="flex items-center justify-between mb-2"><span class="text-sm text-slate-600">待关注</span><AlertTriangle :size="16" class="text-red-500" /></div>
            <div class="text-3xl font-bold text-slate-900">{{ coachAdminStats.attentionNeeded }}</div>
            <div class="text-xs text-slate-400 mt-1">完成率 &lt; 60%</div>
            <div class="text-[10px] text-red-400 mt-2 flex items-center gap-0.5">查看详情 <ChevronRight :size="10" /></div>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 :size="18" class="text-indigo-600" />完成率趋势</h3>
            <div class="h-48 flex items-end justify-between gap-2 pt-4">
              <div v-for="(day, index) in coachTrendData" :key="index" class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full bg-indigo-100 rounded-t-sm relative" :style="{ height: Math.max(day.rate, 2) + '%' }">
                  <div class="absolute bottom-0 left-0 right-0 rounded-t-sm" :class="day.rate >= 85 ? 'bg-indigo-500' : day.rate >= 60 ? 'bg-amber-400' : 'bg-red-400'" :style="{ height: '100%' }"></div>
                </div>
                <span class="text-[10px] text-slate-400">{{ day.label }}</span>
              </div>
            </div>
          </div>
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2"><PieChart :size="18" class="text-indigo-600" />任务完成分布</h3>
            <div class="h-48 flex items-center justify-center gap-8">
              <div class="relative w-36 h-36">
                <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" stroke-width="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" stroke-width="3" stroke-dasharray="65 35" stroke-linecap="round" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" stroke-width="3" stroke-dasharray="20 80" stroke-dashoffset="-65" stroke-linecap="round" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="15 85" stroke-dashoffset="-85" stroke-linecap="round" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span class="text-2xl font-bold text-slate-900">{{ sortedCoachList.length }}</span>
                  <span class="text-[10px] text-slate-400">教练</span>
                </div>
              </div>
              <div class="space-y-2">
                <div v-for="task in taskDistribution" :key="task.name">
                  <div class="flex items-center gap-2"><div class="w-2.5 h-2.5 rounded-full" :class="task.color"></div><span class="text-xs text-slate-600">{{ task.name }}</span><span class="text-xs font-medium text-slate-900 ml-auto">{{ task.count }}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 教练干预看板 -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <!-- 头部 -->
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="font-bold text-slate-800 flex items-center gap-2">
              <Activity :size="18" class="text-indigo-600" />
              教练干预概览
            </h3>
            <div class="flex items-center gap-3 text-xs text-slate-400">
              <span>平均完成率 <strong class="text-slate-700">{{ coachAdminStats.avgCompletionRate }}%</strong></span>
              <span>·</span>
              <span>今日达标 <strong class="text-emerald-600">{{ sortedCoachList.reduce((s, c) => s + c.users.filter(u => u.todayCompleted).length, 0) }}/{{ sortedCoachList.reduce((s, c) => s + c.users.length, 0) }}</strong></span>
            </div>
          </div>

          <!-- 教练卡片列表（紧凑模式） -->
          <div class="divide-y divide-slate-100">
            <div v-for="(coach, idx) in sortedCoachList" :key="coach.id">
              <!-- 教练行（点击展开） -->
              <div class="px-4 py-3 hover:bg-slate-50/50 transition-colors cursor-pointer flex items-center gap-4" @click="toggleCoachExpand(coach.id)">
                <!-- 排名 -->
                <div class="w-6 text-center">
                  <span v-if="idx < 3" class="text-xs font-bold" :class="idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : 'text-amber-700'">{{ idx + 1 }}</span>
                  <span v-else class="text-xs text-slate-300">{{ idx + 1 }}</span>
                </div>
                <!-- 头像+信息 -->
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" :style="{ background: coach.avatarColor }">
                  {{ coach.name.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-sm font-semibold text-slate-800">{{ coach.name }}</p>
                    <div class="w-1.5 h-1.5 rounded-full" :class="coach.status === 'active' ? 'bg-emerald-400' : 'bg-slate-300'"></div>
                  </div>
                  <p class="text-[11px] text-slate-400">{{ coach.roleLabel }} · {{ coach.userCount }}个用户 · 负载 {{ coach.load }}/{{ coach.maxLoad }}</p>
                </div>
                <!-- 5个微型指标条 -->
                <div class="hidden md:flex items-center gap-3 flex-shrink-0">
                  <div class="text-center w-12">
                    <p class="text-xs font-bold" :class="coach.users.filter(u => u.tasks.mealUploaded).length / Math.max(coach.users.length, 1) >= 0.8 ? 'text-emerald-600' : 'text-slate-500'">
                      {{ coach.users.filter(u => u.tasks.mealUploaded).length }}/{{ coach.users.length }}
                    </p>
                    <p class="text-[9px] text-slate-400">餐食</p>
                  </div>
                  <div class="text-center w-12">
                    <p class="text-xs font-bold" :class="coach.users.filter(u => u.tasks.caloriesOnTarget).length / Math.max(coach.users.length, 1) >= 0.8 ? 'text-blue-600' : 'text-slate-500'">
                      {{ coach.users.filter(u => u.tasks.caloriesOnTarget).length }}/{{ coach.users.length }}
                    </p>
                    <p class="text-[9px] text-slate-400">热量</p>
                  </div>
                  <div class="text-center w-12">
                    <p class="text-xs font-bold text-amber-600">{{ Math.round(coach.users.reduce((a, u) => a + u.tasks.habitsCompleted, 0) / Math.max(coach.users.length, 1) * 100 / Math.max(coach.users[0]?.tasks.totalHabits || 4, 1)) }}%</p>
                    <p class="text-[9px] text-slate-400">习惯</p>
                  </div>
                </div>
                <!-- 完成率进度条 -->
                <div class="w-24 flex-shrink-0">
                  <div class="flex items-center justify-between mb-0.5">
                    <span class="text-[10px] text-slate-400">完成率</span>
                    <span class="text-xs font-bold" :class="coach.completionRate >= 85 ? 'text-emerald-600' : coach.completionRate >= 60 ? 'text-amber-600' : 'text-red-500'">{{ coach.completionRate }}%</span>
                  </div>
                  <div class="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all" :class="coach.completionRate >= 85 ? 'bg-emerald-500' : coach.completionRate >= 60 ? 'bg-amber-400' : 'bg-red-400'" :style="{ width: coach.completionRate + '%' }"></div>
                  </div>
                </div>
                <!-- 展开箭头 -->
                <ChevronDown :size="16" class="text-slate-300 flex-shrink-0 transition-transform" :class="expandedCoachId === coach.id ? 'rotate-180' : ''" />
              </div>

              <!-- 展开的用户列表 -->
              <div v-if="expandedCoachId === coach.id" class="bg-slate-50/50 border-t border-slate-100 px-4 py-3">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[11px] font-medium text-slate-500">用户完成情况</span>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600">{{ coach.users.filter(u => u.completionRate >= 85).length }} 优秀</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600">{{ coach.users.filter(u => u.completionRate >= 60 && u.completionRate < 85).length }} 良好</span>
                    <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-600">{{ coach.users.filter(u => u.completionRate < 60).length }} 落后</span>
                  </div>
                </div>
                <div class="max-h-[240px] overflow-y-auto space-y-1">
                  <div v-for="user in coach.users" :key="user.id" class="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white transition-colors">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" :style="{ background: user.avatarColor }">
                      {{ user.name.charAt(0) }}
                    </div>
                    <span class="text-[12px] font-medium text-slate-700 w-12 truncate">{{ user.name }}</span>
                    <span class="text-[10px] text-slate-400 w-8">第{{ user.daysInGroup }}天</span>
                    <!-- 微型任务状态 -->
                    <div class="flex items-center gap-0.5">
                      <div class="w-3.5 h-3.5 rounded flex items-center justify-center" :class="user.tasks.mealUploaded ? 'bg-emerald-100' : 'bg-slate-100'">
                        <Check v-if="user.tasks.mealUploaded" :size="8" class="text-emerald-500" />
                      </div>
                      <div class="w-3.5 h-3.5 rounded flex items-center justify-center" :class="user.tasks.caloriesOnTarget ? 'bg-emerald-100' : 'bg-slate-100'">
                        <Check v-if="user.tasks.caloriesOnTarget" :size="8" class="text-emerald-500" />
                      </div>
                      <span class="text-[9px] text-slate-400 ml-0.5">{{ user.tasks.habitsCompleted }}/{{ user.tasks.totalHabits }}</span>
                    </div>
                    <!-- 完成率条 -->
                    <div class="flex-1 min-w-0">
                      <div class="h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div class="h-full rounded-full" :class="user.completionRate >= 85 ? 'bg-emerald-400' : user.completionRate >= 60 ? 'bg-amber-400' : 'bg-red-400'" :style="{ width: user.completionRate + '%' }"></div>
                      </div>
                    </div>
                    <span class="text-[11px] font-semibold w-8 text-right" :class="user.completionRate >= 85 ? 'text-emerald-600' : user.completionRate >= 60 ? 'text-amber-600' : 'text-red-500'">{{ user.completionRate }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 主内容区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：任务列表 (2/3) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- 医生预约管理 -->
          <div v-if="currentRole === 'doctor'" class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CalendarPlus :size="18" class="text-indigo-600" />
              服务预约
              <span v-if="doctorAppointments.filter(a => a.status === 'pending').length > 0"
                class="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                {{ doctorAppointments.filter(a => a.status === 'pending').length }} 待处理
              </span>
            </h3>

            <div class="space-y-2 max-h-[300px] overflow-y-auto">
              <div
                v-for="appointment in doctorAppointments"
                :key="appointment.id"
                class="p-3 rounded-lg border transition-all"
                :class="{
                  'bg-amber-50 border-amber-200': appointment.status === 'pending',
                  'bg-green-50 border-green-200': appointment.status === 'accepted',
                  'bg-red-50 border-red-200': appointment.status === 'rejected',
                  'bg-blue-50 border-blue-200': appointment.status === 'completed'
                }"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <p class="text-sm font-medium text-slate-800">{{ appointment.clientName }}</p>
                      <span
                        class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        :class="statusMap[appointment.status].class"
                      >
                        {{ statusMap[appointment.status].text }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-600">{{ serviceTypeMap[appointment.serviceType] }}</p>
                    <div class="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span class="flex items-center gap-1">
                        <Calendar :size="10" />
                        {{ appointment.date }}
                      </span>
                      <span class="flex items-center gap-1">
                        <Clock :size="10" />
                        {{ appointment.time }}
                      </span>
                    </div>
                  </div>
                </div>

                <p v-if="appointment.description" class="text-xs text-slate-600 mb-2 line-clamp-2">
                  {{ appointment.description }}
                </p>

                <!-- 操作按钮 -->
                <div v-if="appointment.status === 'pending'" class="flex gap-2">
                  <button
                    @click="acceptAppointment(appointment.id)"
                    class="flex-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Check :size="12" />
                    接受
                  </button>
                  <button
                    @click="rejectAppointment(appointment.id)"
                    class="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <X :size="12" />
                    拒绝
                  </button>
                </div>

                <div v-else-if="appointment.status === 'accepted'" class="flex gap-2">
                  <button
                    @click="completeAppointment(appointment.id)"
                    class="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1"
                  >
                    <Check :size="12" />
                    完成服务
                  </button>
                </div>

                <!-- 费用提示 -->
                <div v-if="appointment.status === 'completed'" class="mt-2 p-2 bg-blue-50 rounded-lg">
                  <p class="text-[10px] text-blue-700 font-medium">
                    ✓ 已添加 200 元服务记录到财务中心
                  </p>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="doctorAppointments.length === 0" class="text-center py-4 text-slate-400">
                <CalendarPlus :size="30" class="mx-auto mb-1 opacity-50" />
                <p class="text-xs">暂无预约</p>
              </div>
            </div>
          </div>

          <!-- 教练预约记录 -->
          <div v-if="currentRole === 'coach'" class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CalendarPlus :size="18" class="text-indigo-600" />
              我的预约
              <span v-if="pendingAppointments.length > 0"
                class="ml-auto bg-amber-100 text-amber-600 text-xs px-2 py-0.5 rounded-full">
                {{ pendingAppointments.length }} 待确认
              </span>
            </h3>

            <div class="space-y-2 max-h-[250px] overflow-y-auto">
              <div
                v-for="appointment in appointments.slice().reverse().slice(0, 5)"
                :key="appointment.id"
                class="p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer"
                :class="{
                  'bg-amber-50 border-amber-200': appointment.status === 'pending',
                  'bg-green-50 border-green-200': appointment.status === 'accepted',
                  'bg-red-50 border-red-200': appointment.status === 'rejected',
                  'bg-blue-50 border-blue-200': appointment.status === 'completed'
                }"
              >
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <p class="text-sm font-medium text-slate-800">{{ appointment.clientName }}</p>
                      <span
                        class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        :class="statusMap[appointment.status].class"
                      >
                        {{ statusMap[appointment.status].text }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-600">{{ serviceTypeMap[appointment.serviceType] }} - {{ appointment.doctorName }}</p>
                    <div class="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span class="flex items-center gap-1">
                        <Calendar :size="10" />
                        {{ appointment.date }}
                      </span>
                      <span class="flex items-center gap-1">
                        <Clock :size="10" />
                        {{ appointment.time }}
                      </span>
                    </div>
                  </div>
                </div>

                <p v-if="appointment.description" class="text-xs text-slate-600 line-clamp-2">
                  {{ appointment.description }}
                </p>
              </div>

              <!-- 空状态 -->
              <div v-if="appointments.length === 0" class="text-center py-4 text-slate-400">
                <CalendarPlus :size="30" class="mx-auto mb-1 opacity-50" />
                <p class="text-xs">暂无预约记录</p>
                <p class="text-[10px] text-slate-400 mt-1">点击快捷操作中的"预约服务"开始</p>
              </div>
            </div>
          </div>

          <!-- 待办任务 -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div class="p-4 border-b border-slate-100">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-bold text-slate-800 flex items-center gap-2">
                  <CheckCircle :size="18" class="text-indigo-600" />
                  待办任务
                </h3>
                <button
                  @click="showTaskCreateModal = true"
                  class="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1"
                >
                  <Plus :size="14" />
                  新建任务
                </button>
              </div>

              <!-- 任务统计 -->
              <div class="grid grid-cols-4 gap-2 mb-3">
                <div class="text-center p-2 bg-slate-50 rounded-lg">
                  <div class="text-lg font-bold text-slate-900">{{ taskStats.total }}</div>
                  <div class="text-[10px] text-slate-500">总任务</div>
                </div>
                <div class="text-center p-2 bg-green-50 rounded-lg">
                  <div class="text-lg font-bold text-green-600">{{ taskStats.completed }}</div>
                  <div class="text-[10px] text-slate-500">已完成</div>
                </div>
                <div class="text-center p-2 bg-amber-50 rounded-lg">
                  <div class="text-lg font-bold text-amber-600">{{ taskStats.pending }}</div>
                  <div class="text-[10px] text-slate-500">进行中</div>
                </div>
                <div class="text-center p-2 bg-red-50 rounded-lg">
                  <div class="text-lg font-bold text-red-600">{{ taskStats.overdue }}</div>
                  <div class="text-[10px] text-slate-500">已逾期</div>
                </div>
              </div>

              <!-- 任务筛选和排序 -->
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <select
                    v-model="taskFilter"
                    class="text-xs px-2 py-1 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">全部任务</option>
                    <option value="pending">待办</option>
                    <option value="completed">已完成</option>
                    <option value="overdue">已逾期</option>
                  </select>
                  <select
                    v-model="taskSortBy"
                    class="text-xs px-2 py-1 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="priority">按优先级</option>
                    <option value="time">按时间</option>
                    <option value="client">按客户</option>
                  </select>
                </div>
                <button
                  @click="viewAllTasks"
                  class="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                >
                  全部 <ChevronRight :size="14" />
                </button>
              </div>
            </div>

            <div class="p-4 space-y-2 max-h-[450px] overflow-y-auto">
              <div
                v-for="task in priorityTasks"
                :key="task.id"
                @click="handleTaskClick(task)"
                class="flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md"
                :class="{
                  'bg-green-50 border-green-200': task.completed,
                  'bg-red-50 border-red-300': !task.completed && isTaskOverdue(task),
                  'bg-white border-slate-200': !task.completed && !isTaskOverdue(task)
                }"
              >
                <!-- 任务状态图标 -->
                <div class="flex flex-col items-center gap-1">
                  <button
                    @click.stop="toggleTask(task.id)"
                    class="flex-shrink-0"
                  >
                    <CheckCircle
                      :size="18"
                      :class="task.completed ? 'text-green-600' : 'text-slate-300 hover:text-green-500'"
                    />
                  </button>
                  <div
                    v-if="task.priority === 'high'"
                    class="w-2 h-2 rounded-full bg-red-500"
                  ></div>
                </div>

                <!-- 任务内容 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <p class="text-sm font-medium text-slate-800 truncate" :class="{ 'line-through text-slate-400': task.completed }">
                      {{ task.title }}
                    </p>
                    <!-- 优先级标签 -->
                    <span
                      v-if="task.priority === 'high' && !task.completed"
                      class="px-1.5 py-0.5 text-[10px] rounded bg-red-100 text-red-600 font-medium flex-shrink-0"
                    >
                      紧急
                    </span>
                    <!-- 类型图标 -->
                    <component
                      :is="getTaskIcon(task.type)"
                      :size="14"
                      :class="getTaskIconColor(task.type)"
                      class="flex-shrink-0"
                    />
                    <!-- 逾期标签 -->
                    <span
                      v-if="!task.completed && isTaskOverdue(task)"
                      class="px-1.5 py-0.5 text-[10px] rounded bg-red-100 text-red-600 font-medium flex-shrink-0"
                    >
                      已逾期
                    </span>
                  </div>

                  <div class="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <Clock :size="12" />
                    <span>{{ formatTaskTime(task) }}</span>
                    <span v-if="task.userName" class="text-slate-400">· {{ task.userName }}</span>
                  </div>

                  <!-- 任务描述 -->
                  <p v-if="task.description" class="text-xs text-slate-600 line-clamp-2 mb-1">
                    {{ task.description }}
                  </p>

                  <!-- 标签 -->
                  <div v-if="task.tags && task.tags.length > 0" class="flex flex-wrap gap-1">
                    <span
                      v-for="tag in task.tags.slice(0, 3)"
                      :key="tag"
                      class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>

                <!-- 快捷操作按钮 -->
                <div class="flex flex-col gap-1">
                  <button
                    v-if="task.type === 'call' && !task.completed"
                    @click.stop="makeCall(task)"
                    class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="拨打电话"
                  >
                    <Phone :size="14" />
                  </button>
                  <button
                    @click.stop="editTask(task)"
                    class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    title="编辑任务"
                  >
                    <FileText :size="14" />
                  </button>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="priorityTasks.length === 0" class="text-center py-8 text-slate-400">
                <CheckCircle :size="40" class="mx-auto mb-2 opacity-50" />
                <p class="text-sm">暂无待办任务</p>
                <button
                  @click="showTaskCreateModal = true"
                  class="mt-3 text-xs px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  创建新任务
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：动态 (1/3) -->
        <div class="space-y-6">
          <!-- 今日概况 -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar :size="18" class="text-indigo-600" />
              今日概况
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div class="flex items-center gap-2">
                  <UserCheck :size="16" class="text-blue-600" />
                  <span class="text-sm text-slate-700">今日打卡</span>
                </div>
                <span class="text-lg font-bold text-slate-900">{{ todayStats.checkedIn }}/{{ todayStats.total }}</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div class="flex items-center gap-2">
                  <Activity :size="16" class="text-green-600" />
                  <span class="text-sm text-slate-700">数据异常</span>
                </div>
                <span class="text-lg font-bold text-red-600">{{ todayStats.abnormal }}</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div class="flex items-center gap-2">
                  <AlertTriangle :size="16" class="text-amber-600" />
                  <span class="text-sm text-slate-700">待处理</span>
                </div>
                <span class="text-lg font-bold text-amber-600">{{ todayStats.pending }}</span>
              </div>
            </div>
          </div>

          <!-- 健康预警 -->
          <div class="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200 shadow-sm p-4">
            <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <AlertTriangle :size="18" class="text-red-600" />
              健康预警
            </h3>
            <div class="space-y-2">
              <div
                v-for="alert in healthAlerts"
                :key="alert.id"
                @click="handleAlertClick(alert)"
                class="flex items-start gap-2 p-2 rounded-lg bg-white/50 hover:bg-white transition-colors cursor-pointer"
              >
                <div class="flex-shrink-0">
                  <component :is="alert.severity === 'high' ? AlertTriangle : Activity" :size="14"
                    :class="alert.severity === 'high' ? 'text-red-600' : 'text-amber-600'" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-slate-800">{{ alert.title }}</p>
                  <p class="text-[10px] text-slate-500 truncate">{{ alert.desc }}</p>
                </div>
                <ChevronRight :size="14" class="text-slate-400 flex-shrink-0" />
              </div>

              <div v-if="healthAlerts.length === 0" class="text-center py-4 text-slate-400">
                <CheckCircle :size="30" class="mx-auto mb-1 opacity-50" />
                <p class="text-xs">暂无预警</p>
              </div>
            </div>
          </div>

          <!-- 最近活动 -->
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock :size="18" class="text-indigo-600" />
              最近活动
            </h3>
            <div class="space-y-3">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="flex items-start gap-2 text-sm"
              >
                <div class="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
                  :class="activity.type === 'success' ? 'bg-green-500' : activity.type === 'warning' ? 'bg-amber-500' : 'bg-slate-400'"></div>
                <div class="flex-1 min-w-0">
                  <p class="text-slate-700">{{ activity.desc }}</p>
                  <p class="text-[10px] text-slate-400">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 预约模态框 -->
    <AppointmentModal
      :showModal="showAppointmentModal"
      @close="showAppointmentModal = false"
      @submit="handleAppointmentSubmit"
    />

    <!-- 客户选择模态框 (用于回访、发消息等) -->
    <div v-if="showClientSelectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 class="font-bold text-lg text-slate-900">选择客户</h3>
          <button @click="showClientSelectModal = false" class="p-1 hover:bg-slate-100 rounded-lg">
            <X :size="20" class="text-slate-500" />
          </button>
        </div>
        <div class="p-4 overflow-y-auto max-h-[60vh]">
          <div class="space-y-2">
            <div
              v-for="client in recentClients"
              :key="client.id"
              @click="handleClientSelect(client)"
              class="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" :style="{ background: client.avatarColor }">
                {{ client.name.charAt(0) }}
              </div>
              <div class="flex-1">
                <div class="font-medium text-sm text-slate-800">{{ client.name }}</div>
                <div class="text-xs text-slate-500">{{ client.phone }}</div>
              </div>
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full" :class="client.online ? 'bg-green-500' : 'bg-slate-300'"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 border-t border-slate-200 bg-slate-50">
          <button
            @click="showClientSelectModal = false"
            class="w-full py-2 text-sm text-slate-600 hover:text-slate-800"
          >
            取消
          </button>
        </div>
      </div>
    </div>

    <!-- 添加教练模态框 -->
    <div v-if="showAddCoachModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 class="font-bold text-lg text-slate-900">添加教练</h3>
          <button @click="showAddCoachModal = false" class="p-1 hover:bg-slate-100 rounded-lg">
            <X :size="20" class="text-slate-500" />
          </button>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">教练姓名</label>
            <input
              v-model="newCoach.name"
              type="text"
              placeholder="请输入教练姓名"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">手机号</label>
            <input
              v-model="newCoach.phone"
              type="tel"
              placeholder="请输入手机号"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">角色类型</label>
              <select
                v-model="newCoach.role"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="coach">普通教练</option>
                <option value="mentor">总教练</option>
                <option value="apprentice">实习教练</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">聘用类型</label>
              <select
                v-model="newCoach.employmentType"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="full_time">全职</option>
                <option value="part_time">兼职</option>
                <option value="contract">合同工</option>
                <option value="intern">实习生</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">所属分组</label>
            <select
              v-model="newCoach.groupId"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">独立教练（不分组）</option>
              <option value="g1">冠军战队</option>
              <option value="g2">健康小分队</option>
              <option value="g3">减脂达人组</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">最大负载用户数</label>
            <input
              v-model.number="newCoach.maxLoad"
              type="number"
              min="5"
              max="50"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div class="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
          <button
            @click="showAddCoachModal = false"
            class="flex-1 py-2 text-sm text-slate-600 hover:text-slate-800"
          >
            取消
          </button>
          <button
            @click="handleAddCoach"
            class="flex-1 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            添加
          </button>
        </div>
      </div>
    </div>

    <!-- 团队设置模态框 -->
    <div v-if="showTeamSettingsModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 class="font-bold text-lg text-slate-900">团队设置</h3>
          <button @click="showTeamSettingsModal = false" class="p-1 hover:bg-slate-100 rounded-lg">
            <X :size="20" class="text-slate-500" />
          </button>
        </div>
        <div class="p-4 overflow-y-auto max-h-[70vh]">
          <div class="space-y-6">
            <!-- 分组管理 -->
            <div>
              <h4 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Users :size="18" class="text-indigo-600" />
                分组管理
              </h4>
              <div class="grid grid-cols-3 gap-3">
                <div
                  v-for="group in teamGroups"
                  :key="group.id"
                  class="p-3 rounded-lg border border-slate-200 hover:border-indigo-300 cursor-pointer transition-colors"
                >
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" :style="{ background: group.color }">
                      {{ group.name.charAt(0) }}
                    </div>
                    <span class="font-medium text-sm">{{ group.name }}</span>
                  </div>
                  <div class="text-xs text-slate-500">
                    {{ group.memberCount }} 位成员 · {{ group.mentor }}
                  </div>
                </div>
                <div
                  @click="createNewGroup"
                  class="p-3 rounded-lg border border-dashed border-slate-300 hover:border-indigo-400 cursor-pointer transition-colors flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-indigo-600"
                >
                  <Plus :size="24" />
                  <span class="text-sm">创建分组</span>
                </div>
              </div>
            </div>

            <!-- 师徒关系 -->
            <div>
              <h4 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <UserCheck :size="18" class="text-green-600" />
                师徒关系
              </h4>
              <div class="space-y-2">
                <div
                  v-for="rel in mentorRelations"
                  :key="rel.id"
                  class="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                >
                  <div class="flex items-center gap-3">
                    <div class="flex -space-x-2">
                      <div class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" :style="{ background: rel.mentorColor }">
                        {{ rel.mentorName.charAt(0) }}
                      </div>
                      <div class="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" :style="{ background: rel.apprenticeColor }">
                        {{ rel.apprenticeName.charAt(0) }}
                      </div>
                    </div>
                    <div>
                      <div class="text-sm font-medium">{{ rel.mentorName }} <span class="text-slate-500">→</span> {{ rel.apprenticeName }}</div>
                      <div class="text-xs text-slate-500">培训进度: {{ rel.progress }}%</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div class="h-full bg-green-500" :style="{ width: `${rel.progress}%` }"></div>
                    </div>
                    <button class="text-xs text-indigo-600 hover:text-indigo-700">管理</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 权限设置 -->
            <div>
              <h4 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Settings :size="18" class="text-purple-600" />
                权限设置
              </h4>
              <div class="space-y-2">
                <div class="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <div>
                    <div class="text-sm font-medium">允许实习教练独立服务客户</div>
                    <div class="text-xs text-slate-500">启用后实习教练可以单独分配客户</div>
                  </div>
                  <button
                    @click="teamSettings.allowApprenticeService = !teamSettings.allowApprenticeService"
                    class="w-12 h-6 rounded-full transition-colors"
                    :class="teamSettings.allowApprenticeService ? 'bg-indigo-600' : 'bg-slate-300'"
                  >
                    <div class="w-5 h-5 rounded-full bg-white shadow transition-transform"
                      :class="teamSettings.allowApprenticeService ? 'translate-x-6' : 'translate-x-0.5'"></div>
                  </button>
                </div>
                <div class="flex items-center justify-between p-3 rounded-lg border border-slate-200">
                  <div>
                    <div class="text-sm font-medium">自动分配新客户</div>
                    <div class="text-xs text-slate-500">新客户自动分配给负载较低的教练</div>
                  </div>
                  <button
                    @click="teamSettings.autoAssignClients = !teamSettings.autoAssignClients"
                    class="w-12 h-6 rounded-full transition-colors"
                    :class="teamSettings.autoAssignClients ? 'bg-indigo-600' : 'bg-slate-300'"
                  >
                    <div class="w-5 h-5 rounded-full bg-white shadow transition-transform"
                      :class="teamSettings.autoAssignClients ? 'translate-x-6' : 'translate-x-0.5'"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4 border-t border-slate-200 bg-slate-50">
          <button
            @click="saveTeamSettings"
            class="w-full py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>

    <!-- 新建问诊模态框 -->
    <div v-if="showNewConsultModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 class="font-bold text-lg text-slate-900">新建在线问诊</h3>
          <button @click="showNewConsultModal = false" class="p-1 hover:bg-slate-100 rounded-lg">
            <X :size="20" class="text-slate-500" />
          </button>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">选择客户</label>
            <select
              v-model="newConsult.clientId"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">请选择客户</option>
              <option v-for="client in recentClients" :key="client.id" :value="client.id">
                {{ client.name }} - {{ client.phone }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">问诊类型</label>
            <select
              v-model="newConsult.type"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="general">一般咨询</option>
              <option value="followup">随访</option>
              <option value="urgent">紧急咨询</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">主诉</label>
            <textarea
              v-model="newConsult.complaint"
              rows="3"
              placeholder="请输入患者主诉..."
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>
        </div>
        <div class="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
          <button
            @click="showNewConsultModal = false"
            class="flex-1 py-2 text-sm text-slate-600 hover:text-slate-800"
          >
            取消
          </button>
          <button
            @click="handleNewConsult"
            class="flex-1 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
          >
            开始问诊
          </button>
        </div>
      </div>
    </div>

    <!-- 添加任务模态框 -->
    <!-- Toast -->
    <Toast ref="toastRef" />

    <!-- 客户详情模态框 -->
    <div v-if="showClientsDetailModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-lg text-slate-900">服务客户列表</h3>
            <p class="text-sm text-slate-500">共 {{ clientDetailData.length }} 位客户</p>
          </div>
          <button @click="showClientsDetailModal = false" class="p-1 hover:bg-slate-100 rounded-lg">
            <X :size="20" class="text-slate-500" />
          </button>
        </div>

        <div class="p-4 border-b border-slate-100">
          <div class="flex items-center gap-4">
            <div class="relative flex-1">
              <Search :size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="clientSearchQuery"
                type="text"
                placeholder="搜索客户姓名或手机号..."
                class="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              v-model="clientStatusFilter"
              class="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">全部状态</option>
              <option value="active">活跃</option>
              <option value="inactive">不活跃</option>
            </select>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="client in filteredClients"
              :key="client.id"
              @click="viewClientProfile(client.id)"
              class="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all bg-white"
            >
              <div class="flex items-start gap-3">
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" :style="{ background: client.avatarColor }">
                  {{ client.name.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium text-slate-800">{{ client.name }}</span>
                    <span class="text-xs px-2 py-0.5 rounded" :class="client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'">
                      {{ client.status === 'active' ? '活跃' : '不活跃' }}
                    </span>
                  </div>
                  <div class="text-xs text-slate-500 mb-2">{{ client.phone }}</div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-500">服务天数</span>
                    <span class="font-medium text-slate-700">{{ client.days }}天</span>
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-500">打卡率</span>
                    <span class="font-medium" :class="client.checkinRate >= 80 ? 'text-green-600' : client.checkinRate >= 60 ? 'text-amber-600' : 'text-red-600'">
                      {{ client.checkinRate }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
          <span class="text-sm text-slate-500">显示 {{ filteredClients.length }} / {{ clientDetailData.length }} 条结果</span>
          <button
            @click="showClientsDetailModal = false"
            class="px-4 py-2 text-sm text-white bg-slate-600 rounded-lg hover:bg-slate-700"
          >
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 打卡率详情模态框 -->
    <div v-if="showCheckinDetailModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-lg text-slate-900">打卡率详情</h3>
            <p class="text-sm text-slate-500">今日打卡率 {{ todayCheckinRate }}%</p>
          </div>
          <button @click="showCheckinDetailModal = false" class="p-1 hover:bg-slate-100 rounded-lg">
            <X :size="20" class="text-slate-500" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <!-- 打卡率统计 -->
          <div class="p-4 border-b border-slate-100">
            <div class="grid grid-cols-4 gap-4 mb-4">
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{{ checkinStats.completed }}</div>
                <div class="text-xs text-slate-500">已打卡</div>
              </div>
              <div class="text-center p-3 bg-red-50 rounded-lg">
                <div class="text-2xl font-bold text-red-600">{{ checkinStats.pending }}</div>
                <div class="text-xs text-slate-500">未打卡</div>
              </div>
              <div class="text-center p-3 bg-amber-50 rounded-lg">
                <div class="text-2xl font-bold text-amber-600">{{ checkinStats.late }}</div>
                <div class="text-xs text-slate-500">迟到</div>
              </div>
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{{ checkinStats.rate }}%</div>
                <div class="text-xs text-slate-500">打卡率</div>
              </div>
            </div>

            <!-- 打卡时间分布 -->
            <div>
              <h4 class="font-semibold text-slate-800 mb-3">打卡时间分布</h4>
              <div class="flex items-end gap-1 h-20">
                <div
                  v-for="(item, index) in checkinTimeDistribution"
                  :key="index"
                  class="flex-1 bg-indigo-100 rounded-t flex flex-col items-center justify-end"
                  :style="{ height: `${item.percentage}%` }"
                >
                  <span class="text-xs text-indigo-700 font-medium">{{ item.count }}</span>
                  <span class="text-[10px] text-slate-500">{{ item.time }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 客户打卡列表 -->
          <div class="p-4">
            <h4 class="font-semibold text-slate-800 mb-3">客户打卡详情</h4>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-slate-50">
                  <tr class="text-xs text-slate-500">
                    <th class="px-4 py-2 text-left font-medium">客户</th>
                    <th class="px-4 py-2 text-center font-medium">打卡状态</th>
                    <th class="px-4 py-2 text-center font-medium">打卡时间</th>
                    <th class="px-4 py-2 text-center font-medium">本周打卡</th>
                    <th class="px-4 py-2 text-center font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in checkinClientList"
                    :key="item.id"
                    class="border-t border-slate-100"
                  >
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" :style="{ background: item.avatarColor }">
                          {{ item.name.charAt(0) }}
                        </div>
                        <span class="text-sm font-medium">{{ item.name }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span class="text-xs px-2 py-1 rounded" :class="item.checked ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                        {{ item.checked ? '已打卡' : '未打卡' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-center text-sm text-slate-600">{{ item.checkTime || '-' }}</td>
                    <td class="px-4 py-3 text-center">
                      <div class="flex items-center gap-0.5 justify-center">
                        <div
                          v-for="(day, idx) in item.weeklyCheckin"
                          :key="idx"
                          class="w-5 h-5 rounded flex items-center justify-center text-[10px]"
                          :class="day ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'"
                        >
                          {{ day ? '✓' : '' }}
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <button
                        @click="remindClient(item)"
                        class="text-xs px-3 py-1 rounded border border-slate-200 hover:bg-slate-50"
                        :class="item.checked ? 'border-slate-200 text-slate-500' : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'"
                      >
                        {{ item.checked ? '查看' : '提醒' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-200 bg-slate-50">
          <button
            @click="showCheckinDetailModal = false"
            class="w-full py-2 text-sm text-white bg-slate-600 rounded-lg hover:bg-slate-700"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
    <!-- 教练列表详情模态框 -->
    <div v-if="showCoachesListModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 class="font-bold text-lg text-slate-900">教练列表详情</h3>
            <p class="text-xs text-slate-500 mt-1">共 {{ coachList.length }} 位教练</p>
          </div>
          <button @click="showCoachesListModal = false" class="p-1 hover:bg-slate-200 rounded-lg">
            <X :size="20" class="text-slate-500" />
          </button>
        </div>

        <div class="p-4 overflow-y-auto max-h-[70vh]">
          <div class="grid grid-cols-2 gap-4">
            <div v-for="coach in coachList" :key="coach.id" class="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer" @click="viewCoachDetail(coach); showCoachesListModal = false">
              <div class="flex items-center gap-3 mb-3">
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" :style="{ background: coach.avatarColor }">
                  {{ coach.name.charAt(0) }}
                </div>
                <div class="flex-1">
                  <div class="font-medium text-slate-900">{{ coach.name }}</div>
                  <div class="text-xs text-slate-500">{{ coach.groupName || '独立教练' }}</div>
                </div>
                <span class="text-xs px-2 py-1 rounded" :class="coach.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">
                  {{ coach.status === 'active' ? '在线' : '离线' }}
                </span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-slate-50 rounded p-2">
                  <div class="text-sm font-bold text-slate-900">{{ coach.userCount }}</div>
                  <div class="text-[10px] text-slate-500">服务用户</div>
                </div>
                <div class="bg-slate-50 rounded p-2">
                  <div class="text-sm font-bold" :class="coach.completionRate >= 80 ? 'text-green-600' : coach.completionRate >= 60 ? 'text-amber-600' : 'text-red-600'">
                    {{ coach.completionRate }}%
                  </div>
                  <div class="text-[10px] text-slate-500">完成率</div>
                </div>
                <div class="bg-slate-50 rounded p-2">
                  <div class="text-sm font-bold text-slate-900">{{ coach.load }}/{{ coach.maxLoad }}</div>
                  <div class="text-[10px] text-slate-500">负载</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-200 bg-slate-50">
          <button @click="showCoachesListModal = false" class="w-full py-2 text-sm text-white bg-slate-600 rounded-lg hover:bg-slate-700">
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 完成率详情模态框 -->
    <div v-if="showCompletionDetailModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 class="font-bold text-lg text-slate-900">完成率分布详情</h3>
            <p class="text-xs text-slate-500 mt-1">平均完成率: {{ coachAdminStats.avgCompletionRate }}%</p>
          </div>
          <button @click="showCompletionDetailModal = false" class="p-1 hover:bg-slate-200 rounded-lg">
            <X :size="20" class="text-slate-500" />
          </button>
        </div>

        <div class="p-4 overflow-y-auto max-h-[70vh]">
          <div class="space-y-4">
            <!-- 完成率分段统计 -->
            <div class="grid grid-cols-4 gap-3">
              <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-green-600">{{ coachList.filter(c => c.completionRate >= 85).length }}</div>
                <div class="text-xs text-slate-600 mt-1">优秀 (≥85%)</div>
              </div>
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-blue-600">{{ coachList.filter(c => c.completionRate >= 70 && c.completionRate < 85).length }}</div>
                <div class="text-xs text-slate-600 mt-1">良好 (70-84%)</div>
              </div>
              <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-amber-600">{{ coachList.filter(c => c.completionRate >= 60 && c.completionRate < 70).length }}</div>
                <div class="text-xs text-slate-600 mt-1">及格 (60-69%)</div>
              </div>
              <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                <div class="text-2xl font-bold text-red-600">{{ coachList.filter(c => c.completionRate < 60).length }}</div>
                <div class="text-xs text-slate-600 mt-1">需改进 (<60%)</div>
              </div>
            </div>

            <!-- 教练完成率排行 -->
            <div>
              <h4 class="font-semibold text-slate-800 mb-3">完成率排行</h4>
              <div class="space-y-2">
                <div v-for="(coach, index) in [...coachList].sort((a, b) => b.completionRate - a.completionRate)" :key="coach.id" class="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer" @click="viewCoachDetail(coach); showCompletionDetailModal = false">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" :class="index === 0 ? 'bg-amber-400 text-white' : index === 1 ? 'bg-slate-400 text-white' : index === 2 ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'">
                    {{ index + 1 }}
                  </div>
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" :style="{ background: coach.avatarColor }">
                    {{ coach.name.charAt(0) }}
                  </div>
                  <div class="flex-1">
                    <div class="text-sm font-medium text-slate-900">{{ coach.name }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold" :class="coach.completionRate >= 80 ? 'text-green-600' : coach.completionRate >= 60 ? 'text-amber-600' : 'text-red-600'">
                      {{ coach.completionRate }}%
                    </div>
                    <div class="text-xs text-slate-500" :class="coach.completionTrend >= 0 ? 'text-green-600' : 'text-red-600'">
                      {{ coach.completionTrend >= 0 ? '+' : '' }}{{ coach.completionTrend }}% vs 上周
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-200 bg-slate-50">
          <button @click="showCompletionDetailModal = false" class="w-full py-2 text-sm text-white bg-slate-600 rounded-lg hover:bg-slate-700">
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 优秀教练列表模态框 -->
    <div v-if="showTopPerformersModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
          <div>
            <div class="flex items-center gap-2">
              <Trophy :size="20" class="text-amber-600" />
              <h3 class="font-bold text-lg text-slate-900">优秀教练</h3>
            </div>
            <p class="text-xs text-slate-500 mt-1">完成率 ≥ 85% 共 {{ coachList.filter(c => c.completionRate >= 85).length }} 位</p>
          </div>
          <button @click="showTopPerformersModal = false" class="p-1 hover:bg-amber-100 rounded-lg">
            <X :size="20" class="text-slate-500" />
          </button>
        </div>

        <div class="p-4 overflow-y-auto max-h-[70vh]">
          <div class="space-y-3">
            <div v-for="(coach, index) in coachList.filter(c => c.completionRate >= 85).sort((a, b) => b.completionRate - a.completionRate)" :key="coach.id" class="flex items-center gap-4 p-4 border-2 rounded-xl hover:shadow-lg cursor-pointer transition-all" :class="index === 0 ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-white hover:border-amber-200'" @click="viewCoachDetail(coach); showTopPerformersModal = false">
              <div class="relative">
                <div class="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold" :style="{ background: coach.avatarColor }">
                  {{ coach.name.charAt(0) }}
                </div>
                <div v-if="index < 3" class="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow" :class="index === 0 ? 'bg-amber-400' : index === 1 ? 'bg-slate-400' : 'bg-amber-600'">
                  {{ index + 1 }}
                </div>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="font-bold text-slate-900">{{ coach.name }}</h4>
                  <span class="text-xs px-2 py-0.5 rounded" :class="coach.role === 'mentor' ? 'bg-amber-100 text-amber-700' : coach.role === 'apprentice' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'">
                    {{ coach.roleLabel }}
                  </span>
                </div>
                <div class="text-xs text-slate-500">{{ coach.groupName || '独立教练' }} · 服务 {{ coach.userCount }} 位用户</div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-green-600">{{ coach.completionRate }}%</div>
                <div class="text-xs text-green-600 flex items-center justify-end gap-1">
                  <TrendingUp :size="12" />
                  {{ coach.completionTrend >= 0 ? '+' : '' }}{{ coach.completionTrend }}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-200 bg-slate-50">
          <button @click="showTopPerformersModal = false" class="w-full py-2 text-sm text-white bg-slate-600 rounded-lg hover:bg-slate-700">
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 服务用户详情模态框 -->
    <div v-if="showCoachUsersModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-purple-50">
          <div>
            <h3 class="font-bold text-lg text-slate-900">服务用户详情</h3>
            <p class="text-xs text-slate-500 mt-1">总用户 {{ coachAdminStats.totalUsers }} · 今日活跃 {{ coachAdminStats.todayActiveUsers }}</p>
          </div>
          <button @click="showCoachUsersModal = false" class="p-1 hover:bg-purple-100 rounded-lg">
            <X :size="20" class="text-slate-500" />
          </button>
        </div>

        <div class="p-4 overflow-y-auto max-h-[70vh]">
          <div class="space-y-4">
            <!-- 用户分布 -->
            <div class="grid grid-cols-3 gap-3">
              <div v-for="coach in coachList" :key="'user-dist-' + coach.id" class="p-3 border border-slate-200 rounded-lg">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" :style="{ background: coach.avatarColor }">
                    {{ coach.name.charAt(0) }}
                  </div>
                  <span class="text-sm font-medium text-slate-900">{{ coach.name }}</span>
                </div>
                <div class="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span>服务用户</span>
                  <span class="font-medium">{{ coach.userCount }} 人</span>
                </div>
                <div class="flex items-center justify-between text-xs text-slate-600">
                  <span>今日活跃</span>
                  <span class="font-medium text-green-600">{{ coach.todayActive }} 人</span>
                </div>
                <div class="w-full h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
                  <div class="h-full bg-green-500 rounded-full" :style="{ width: `${(coach.todayActive / coach.userCount) * 100}%` }"></div>
                </div>
              </div>
            </div>

            <!-- 所有用户列表 -->
            <div>
              <h4 class="font-semibold text-slate-800 mb-3">用户列表</h4>
              <div class="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                <div v-for="coach in coachList" :key="coach.id">
                  <div v-for="user in coach.users.slice(0, 5)" :key="user.id" class="flex items-center gap-2 p-2 border border-slate-100 rounded hover:bg-slate-50 cursor-pointer" @click="router.push('/client-profile/' + user.id)">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" :style="{ background: user.avatarColor }">
                      {{ user.name.charAt(0) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium text-slate-900 truncate">{{ user.name }}</div>
                      <div class="text-xs text-slate-500">{{ coach.name }}</div>
                    </div>
                    <div class="w-2 h-2 rounded-full flex-shrink-0" :class="user.todayCompleted ? 'bg-green-500' : 'bg-slate-300'"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-200 bg-slate-50">
          <button @click="showCoachUsersModal = false" class="w-full py-2 text-sm text-white bg-slate-600 rounded-lg hover:bg-slate-700">
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 待关注详情模态框 -->
    <div v-if="showAttentionNeededModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[85vh] overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between bg-red-50">
          <div>
            <div class="flex items-center gap-2">
              <AlertCircle :size="20" class="text-red-600" />
              <h3 class="font-bold text-lg text-slate-900">需关注详情</h3>
            </div>
            <p class="text-xs text-slate-500 mt-1">完成率 < 60% 的教练和用户</p>
          </div>
          <button @click="showAttentionNeededModal = false" class="p-1 hover:bg-red-100 rounded-lg">
            <X :size="20" class="text-slate-500" />
          </button>
        </div>

        <div class="p-4 overflow-y-auto max-h-[70vh]">
          <div class="space-y-4">
            <!-- 需关注的教练 -->
            <div>
              <h4 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <AlertTriangle :size="16" class="text-amber-600" />
                需关注的教练 ({{ coachList.filter(c => c.completionRate < 60).length }})
              </h4>
              <div class="space-y-2">
                <div v-for="coach in coachList.filter(c => c.completionRate < 60)" :key="coach.id" class="p-3 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 cursor-pointer" @click="viewCoachDetail(coach); showAttentionNeededModal = false">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" :style="{ background: coach.avatarColor }">
                      {{ coach.name.charAt(0) }}
                    </div>
                    <div class="flex-1">
                      <div class="font-medium text-slate-900">{{ coach.name }}</div>
                      <div class="text-xs text-slate-500">{{ coach.roleLabel }} · {{ coach.groupName || '独立教练' }}</div>
                    </div>
                    <div class="text-right">
                      <div class="text-lg font-bold text-red-600">{{ coach.completionRate }}%</div>
                      <div class="text-xs text-slate-500">{{ coach.userCount }} 位用户</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 需关注的用户 -->
            <div>
              <h4 class="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <AlertTriangle :size="16" class="text-red-600" />
                需关注的用户 ({{ coachList.reduce((sum, c) => sum + c.users.filter(u => u.completionRate < 60).length, 0) }})
              </h4>
              <div class="grid grid-cols-2 gap-2">
                <div v-for="coach in coachList" :key="'attention-' + coach.id">
                  <div v-for="user in coach.users.filter(u => u.completionRate < 60)" :key="user.id" class="flex items-center gap-2 p-2 border border-red-200 rounded hover:bg-red-50 cursor-pointer" @click="router.push('/client-profile/' + user.id)">
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" :style="{ background: user.avatarColor }">
                      {{ user.name.charAt(0) }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium text-slate-900 truncate">{{ user.name }}</div>
                      <div class="text-xs text-slate-500">{{ coach.name }}</div>
                    </div>
                    <div class="text-sm font-bold text-red-600">{{ user.completionRate }}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-200 bg-slate-50">
          <button @click="showAttentionNeededModal = false" class="w-full py-2 text-sm text-white bg-slate-600 rounded-lg hover:bg-slate-700">
            关闭
          </button>
        </div>
      </div>
    </div>

    <!-- 任务详情模态框 -->
    <div v-if="showTaskDetailModal && selectedTask" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="selectedTask.completed ? 'bg-green-100' : 'bg-indigo-100'">
              <component :is="getTaskIcon(selectedTask.type)" :size="20" :class="selectedTask.completed ? 'text-green-600' : 'text-indigo-600'" />
            </div>
            <div>
              <h3 class="font-bold text-lg text-slate-900">任务详情</h3>
              <p class="text-xs text-slate-500">创建于 {{ new Date(selectedTask.createdAt).toLocaleString() }}</p>
            </div>
          </div>
          <button @click="showTaskDetailModal = false" class="p-1 hover:bg-slate-100 rounded-lg">
            <X :size="20" class="text-slate-500" />
          </button>
        </div>

        <div class="p-6 overflow-y-auto max-h-[65vh]">
          <!-- 任务标题和状态 -->
          <div class="mb-4">
            <div class="flex items-start justify-between mb-2">
              <h2 class="text-xl font-bold text-slate-900" :class="{ 'line-through text-slate-400': selectedTask.completed }">
                {{ selectedTask.title }}
              </h2>
              <span class="px-2 py-1 text-xs rounded" :class="getPriorityClass(selectedTask.priority)">
                {{ selectedTask.priority === 'high' ? '紧急' : selectedTask.priority === 'medium' ? '中等' : '低优先' }}
              </span>
            </div>
            <p v-if="selectedTask.description" class="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              {{ selectedTask.description }}
            </p>
          </div>

          <!-- 任务信息 -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="p-3 bg-slate-50 rounded-lg">
              <div class="text-xs text-slate-500 mb-1">客户</div>
              <div class="text-sm font-medium text-slate-900 flex items-center gap-2">
                <div class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs bg-indigo-500">
                  {{ selectedTask.userName.charAt(0) }}
                </div>
                {{ selectedTask.userName }}
              </div>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg">
              <div class="text-xs text-slate-500 mb-1">截止时间</div>
              <div class="text-sm font-medium" :class="isTaskOverdue(selectedTask) && !selectedTask.completed ? 'text-red-600' : 'text-slate-900'">
                {{ selectedTask.dueDate }} {{ selectedTask.dueTime }}
              </div>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg">
              <div class="text-xs text-slate-500 mb-1">任务类型</div>
              <div class="text-sm font-medium text-slate-900">{{ getCategoryText(selectedTask.category) }}</div>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg">
              <div class="text-xs text-slate-500 mb-1">当前状态</div>
              <div class="text-sm font-medium" :class="selectedTask.completed ? 'text-green-600' : 'text-amber-600'">
                {{ getStatusText(selectedTask.status) }}
              </div>
            </div>
          </div>

          <!-- 相关数据 -->
          <div v-if="selectedTask.relatedData" class="p-3 bg-blue-50 rounded-lg mb-4">
            <div class="flex items-center gap-2 text-sm">
              <AlertCircle :size="16" class="text-blue-600" />
              <span class="font-medium text-blue-900">相关数据</span>
            </div>
            <div class="text-xs text-blue-700 mt-1">
              {{ selectedTask.relatedData.dataType === 'blood_sugar' ? '血糖异常' : selectedTask.relatedData.dataType === 'blood_pressure' ? '血压异常' : selectedTask.relatedData.dataType === 'weight' ? '体重异常' : '' }}
              <span v-if="selectedTask.relatedData.value">{{ selectedTask.relatedData.value }}</span>
            </div>
          </div>

          <!-- 标签 -->
          <div v-if="selectedTask.tags && selectedTask.tags.length > 0" class="mb-4">
            <div class="text-xs text-slate-500 mb-2">标签</div>
            <div class="flex flex-wrap gap-2">
              <span v-for="tag in selectedTask.tags" :key="tag" class="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- 备注 -->
          <div v-if="selectedTask.notes" class="mb-4">
            <div class="text-xs text-slate-500 mb-2">备注</div>
            <div class="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg whitespace-pre-line">
              {{ selectedTask.notes }}
            </div>
          </div>

          <!-- 完成时间 -->
          <div v-if="selectedTask.completedAt" class="p-3 bg-green-50 rounded-lg">
            <div class="text-xs text-green-600">
              ✓ 完成于 {{ new Date(selectedTask.completedAt).toLocaleString() }}
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-slate-200 bg-slate-50">
          <div class="flex gap-3">
            <button
              v-if="!selectedTask.completed"
              @click="toggleTask(selectedTask.id)"
              class="flex-1 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Check :size="16" />
              标记完成
            </button>
            <button
              v-if="selectedTask.type === 'call' && !selectedTask.completed"
              @click="makeCall(selectedTask)"
              class="flex-1 py-2 text-sm text-green-600 border border-green-200 rounded-lg hover:bg-green-50 flex items-center justify-center gap-2"
            >
              <Phone :size="16" />
              拨打电话
            </button>
            <button
              @click="router.push('/client-profile/' + selectedTask.userId)"
              class="flex-1 py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 flex items-center justify-center gap-2"
            >
              <UserCircle :size="16" />
              查看客户
            </button>
            <button
              @click="deleteTask(selectedTask.id)"
              class="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建任务模态框 -->
    <div v-if="showTaskCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden">
        <div class="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 class="font-bold text-lg text-slate-900">创建新任务</h3>
            <p class="text-xs text-slate-500 mt-1">为您的客户创建待办任务</p>
          </div>
          <button @click="showTaskCreateModal = false" class="p-1 hover:bg-slate-100 rounded-lg">
            <X :size="20" class="text-slate-500" />
          </button>
        </div>

        <div class="p-6 overflow-y-auto max-h-[65vh] space-y-4">
          <!-- 任务标题 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">任务标题 <span class="text-red-500">*</span></label>
            <input
              v-model="newTask.title"
              type="text"
              placeholder="例如：跟进客户血糖异常"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <!-- 任务描述 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">详细描述</label>
            <textarea
              v-model="newTask.description"
              rows="3"
              placeholder="添加任务的详细说明..."
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            ></textarea>
          </div>

          <!-- 客户选择 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">选择客户 <span class="text-red-500">*</span></label>
            <select
              v-model="newTask.userName"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">请选择客户</option>
              <option v-for="client in recentClients" :key="client.id" :value="client.name">
                {{ client.name }}
              </option>
            </select>
          </div>

          <!-- 任务类型和优先级 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">任务类型</label>
              <select
                v-model="newTask.type"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="call">电话回访</option>
                <option value="review">审核处方</option>
                <option value="reminder">提醒事项</option>
                <option value="view">查看数据</option>
                <option value="follow_up">定期随访</option>
                <option value="prescription">处方调整</option>
                <option value="education">健康宣教</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">优先级</label>
              <select
                v-model="newTask.priority"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="high">紧急</option>
                <option value="medium">中等</option>
                <option value="low">较低</option>
              </select>
            </div>
          </div>

          <!-- 截止日期和时间 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">截止日期</label>
              <input
                v-model="newTask.dueDate"
                type="date"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">截止时间</label>
              <input
                v-model="newTask.dueTime"
                type="time"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <!-- 任务分类 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">任务分类</label>
            <select
              v-model="newTask.category"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="health_monitoring">健康监测</option>
              <option value="prescription_review">处方审核</option>
              <option value="education">健康宣教</option>
              <option value="follow_up">随访管理</option>
              <option value="emergency">紧急处理</option>
            </select>
          </div>

          <!-- 标签 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">标签（可选）</label>
            <input
              v-model="newTask.tags"
              type="text"
              placeholder="用逗号分隔多个标签"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div class="p-4 border-t border-slate-200 bg-slate-50">
          <div class="flex gap-3">
            <button
              @click="showTaskCreateModal = false"
              class="flex-1 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              @click="createTask"
              class="flex-1 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              创建任务
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  Activity,
  UserCheck,
  Zap,
  ChevronRight,
  Phone,
  Users,
  FileText,
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarPlus,
  Check,
  X,
  Award,
  AlertCircle,
  Trophy,
  BarChart3,
  Settings,
  Download,
  Search,
  UserCircle,
  PieChart,
  ArrowLeft,
  MessageSquare,
  Plus,
  Eye,
  BookOpen,
  Video,
  Mail,
  Flag
} from 'lucide-vue-next'
import Toast from '../components/shared/Toast.vue'
import DashboardCard from '../components/DashboardCard.vue'
import AppointmentModal from '../components/AppointmentModal.vue'

// 角色配置
const roleConfig: Record<string, {
  label: string
  title: string
  icon: string
  bgColor: string
}> = {
  coach: {
    label: '教练',
    title: '教练工作台',
    icon: '🏋️',
    bgColor: 'bg-gradient-to-br from-indigo-500 to-purple-600'
  },
  doctor: {
    label: '医生',
    title: '医生工作台',
    icon: '⚕️',
    bgColor: 'bg-gradient-to-br from-emerald-500 to-teal-600'
  },
  'coach-admin': {
    label: '教练管理员',
    title: '教练管理员看板',
    icon: '👥',
    bgColor: 'bg-gradient-to-br from-amber-500 to-orange-600'
  }
}

const router = useRouter()
const toastRef = ref<InstanceType<typeof Toast>>()
const currentRole = ref<'coach' | 'doctor' | 'coach-admin'>('coach')
const currentUserName = ref('王教练')

// 预约相关状态
const showAppointmentModal = ref(false)
const showAddCoachModal = ref(false)
const showTeamSettingsModal = ref(false)
const showClientSelectModal = ref(false)
const showNewConsultModal = ref(false)
const clientSelectPurpose = ref<'call' | 'message' | 'task'>('call')

// 详情模态框状态
const showClientsDetailModal = ref(false)
const showCheckinDetailModal = ref(false)
// 教练管理员看板卡片详情模态框
const showCoachesListModal = ref(false)      // 教练总数详情
const showCompletionDetailModal = ref(false) // 平均完成率详情
const showTopPerformersModal = ref(false)    // 优秀教练列表
const showCoachUsersModal = ref(false)       // 服务用户详情
const showAttentionNeededModal = ref(false)  // 待关注详情
// 任务相关模态框状态
const showTaskDetailModal = ref(false)
const showTaskCreateModal = ref(false)
const selectedTask = ref<any>(null)
const taskFilter = ref<'all' | 'pending' | 'completed' | 'overdue'>('all')
const taskSortBy = ref<'time' | 'priority' | 'client'>('priority')

// 客户搜索和筛选
const clientSearchQuery = ref('')
const clientStatusFilter = ref<'all' | 'active' | 'inactive'>('all')

interface Appointment {
  id: string
  serviceType: string
  date: string
  time: string
  doctorId: string
  duration: number
  clientName: string
  description: string
  notes: string
  files: File[]
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  createdAt: string
  createdBy: string
  doctorName?: string
}

const appointments = ref<Appointment[]>([
  {
    id: '1',
    serviceType: 'consultation',
    date: '2026-03-12',
    time: '09:00',
    doctorId: 'doc1',
    duration: 30,
    clientName: '张建国',
    description: '客户咨询血糖控制方案',
    notes: '需要重点关注',
    files: [],
    status: 'pending',
    createdAt: new Date().toISOString(),
    createdBy: '教练',
    doctorName: '李医生'
  },
  {
    id: '2',
    serviceType: 'follow-up',
    date: '2026-03-12',
    time: '10:30',
    doctorId: 'doc2',
    duration: 45,
    clientName: '李淑芬',
    description: '随访指导',
    notes: '',
    files: [],
    status: 'accepted',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    createdBy: '顾问',
    doctorName: '王医生'
  }
])

// 问候语
const greetingText = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

// 角色专属统计
const stats = {
  coach: [
    {
      id: 'total-clients',
      title: '服务客户',
      value: '128',
      unit: '人',
      trend: 'up',
      trendValue: '+5',
      icon: Users,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      clickAction: 'view-clients-detail'
    },
    {
      id: 'completion-rate',
      title: '今日打卡率',
      value: '85.6',
      unit: '%',
      trend: 'up',
      trendValue: '+2.3%',
      icon: Activity,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      clickAction: 'view-checkin-detail'
    },
    {
      id: 'pending-tasks',
      title: '待处理任务',
      value: '12',
      unit: '项',
      trend: 'down',
      trendValue: '-3',
      icon: Clock,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600',
      clickAction: 'view-tasks'
    },
    {
      id: 'health-score',
      title: '健康评分',
      value: '78.5',
      unit: '分',
      trend: 'up',
      trendValue: '+1.2',
      icon: Heart,
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      clickAction: 'view-health-report'
    }
  ],
  doctor: [
    {
      id: 'total-patients',
      title: '服务患者',
      value: '45',
      unit: '人',
      trend: 'up',
      trendValue: '+2',
      icon: Users,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      clickAction: 'view-patients'
    },
    {
      id: 'consultations',
      title: '今日问诊',
      value: '8',
      unit: '次',
      trend: 'stable',
      trendValue: '0',
      icon: Activity,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      clickAction: null
    },
    {
      id: 'prescriptions',
      title: '处方审核',
      value: '3',
      unit: '份',
      trend: 'down',
      trendValue: '-2',
      icon: FileText,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      clickAction: 'view-prescriptions'
    },
    {
      id: 'critical-cases',
      title: '重点关注',
      value: '5',
      unit: '人',
      trend: 'stable',
      trendValue: '0',
      icon: AlertTriangle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      clickAction: 'view-critical'
    }
  ],
  'coach-admin': [
    {
      id: 'total-coaches',
      title: '教练总数',
      value: '12',
      unit: '人',
      trend: 'stable',
      trendValue: '0',
      icon: Users,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      clickAction: null
    },
    {
      id: 'avg-completion',
      title: '平均完成率',
      value: '82.5',
      unit: '%',
      trend: 'up',
      trendValue: '+3.2%',
      icon: Trophy,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      clickAction: null
    },
    {
      id: 'total-users',
      title: '服务用户总数',
      value: '186',
      unit: '人',
      trend: 'up',
      trendValue: '+12',
      icon: UserCheck,
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      clickAction: 'view-clients'
    },
    {
      id: 'attention-needed',
      title: '需关注',
      value: '8',
      unit: '人',
      trend: 'down',
      trendValue: '-2',
      icon: AlertCircle,
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      clickAction: null
    }
  ]
}

const currentStats = computed(() => {
  if (currentRole.value === 'coach-admin') {
    // Use dynamic stats from coachList
    return [
      {
        id: 'total-coaches',
        title: '教练总数',
        value: String(coachAdminStats.value.totalCoaches),
        unit: '人',
        trend: 'stable',
        trendValue: '0',
        icon: Users,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600',
        clickAction: 'view-coaches-list'
      },
      {
        id: 'avg-completion',
        title: '平均完成率',
        value: String(coachAdminStats.value.avgCompletionRate),
        unit: '%',
        trend: coachAdminStats.value.completionTrend >= 0 ? 'up' : 'down',
        trendValue: `${coachAdminStats.value.completionTrend >= 0 ? '+' : ''}${coachAdminStats.value.completionTrend}%`,
        icon: Trophy,
        bgColor: 'bg-green-100',
        textColor: 'text-green-600',
        clickAction: 'view-completion-detail'
      },
      {
        id: 'top-performers',
        title: '优秀教练',
        value: String(coachAdminStats.value.topPerformers),
        unit: '人',
        trend: 'stable',
        trendValue: '完成率≥85%',
        icon: Award,
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-600',
        clickAction: 'view-top-performers'
      },
      {
        id: 'total-users',
        title: '服务用户',
        value: String(coachAdminStats.value.totalUsers),
        unit: '人',
        trend: 'up',
        trendValue: `活跃${coachAdminStats.value.todayActiveUsers}`,
        icon: UserCheck,
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-600',
        clickAction: 'view-coach-users'
      },
      {
        id: 'attention-needed',
        title: '需关注',
        value: String(coachAdminStats.value.attentionNeeded),
        unit: '人',
        trend: 'down',
        trendValue: '-2',
        icon: AlertCircle,
        bgColor: 'bg-red-100',
        textColor: 'text-red-600',
        clickAction: 'view-attention-needed'
      }
    ]
  }
  return stats[currentRole.value]
})

// 快捷操作
const quickActions = computed(() => {
  if (currentRole.value === 'coach-admin') {
    return [
      { id: 'add-coach', label: '添加教练', icon: UserCheck, iconColor: 'text-emerald-600', disabled: false },
      { id: 'view-groups', label: '师徒分组', icon: Users, iconColor: 'text-indigo-600', disabled: false },
      { id: 'export-report', label: '导出报表', icon: FileText, iconColor: 'text-purple-600', disabled: false },
      { id: 'team-settings', label: '团队设置', icon: Settings, iconColor: 'text-slate-600', disabled: false }
    ]
  } else if (currentRole.value === 'coach') {
    return [
      { id: 'batch-task', label: '批量处理', icon: Zap, iconColor: 'text-indigo-600', disabled: false },
      { id: 'book-appointment', label: '预约服务', icon: CalendarPlus, iconColor: 'text-purple-600', disabled: false },
      { id: 'make-call', label: '发起回访', icon: Phone, iconColor: 'text-green-600', disabled: false },
      { id: 'view-report', label: '查看报告', icon: FileText, iconColor: 'text-blue-600', disabled: false }
    ]
  } else {
    return [
      { id: 'new-consult', label: '在线问诊', icon: Activity, iconColor: 'text-emerald-600', disabled: false },
      { id: 'review-rx', label: '审核处方', icon: FileText, iconColor: 'text-purple-600', disabled: false },
      { id: 'view-cases', label: '查看病例', icon: Users, iconColor: 'text-blue-600', disabled: false },
      { id: 'health-alert', label: '健康预警', icon: AlertTriangle, iconColor: 'text-red-600', disabled: false }
    ]
  }
})

// 教练管理员数据
interface CoachAdminCoach {
  id: string
  name: string
  avatarColor: string
  role: 'mentor' | 'apprentice' | 'coach'
  roleLabel: string
  groupName?: string
  userCount: number
  todayActive: number
  completionRate: number
  completionTrend: number
  load: number
  maxLoad: number
  loadRate: number
  status: 'active' | 'inactive'
  avgResponseTime: number
  users: CoachUser[]
}

interface CoachUser {
  id: string
  name: string
  avatarColor: string
  todayCompleted: boolean
  completionRate: number
  daysInGroup: number
  tasks: {
    mealUploaded: boolean
    caloriesOnTarget: boolean
    habitsCompleted: number
    totalHabits: number
  }
  weeklyTrend: number[]
}

const coachList = ref<CoachAdminCoach[]>([
  {
    id: 'c1',
    name: '张伟',
    avatarColor: '#4f46e5',
    role: 'mentor',
    roleLabel: '总教练',
    groupName: '冠军战队',
    userCount: 25,
    todayActive: 22,
    completionRate: 88,
    completionTrend: 5,
    load: 23,
    maxLoad: 25,
    loadRate: 0.92,
    status: 'active',
    avgResponseTime: 8,
    users: [
      { id: 'u1', name: '王芳', avatarColor: '#ec4899', todayCompleted: true, completionRate: 92, daysInGroup: 45, tasks: { mealUploaded: true, caloriesOnTarget: true, habitsCompleted: 4, totalHabits: 4 }, weeklyTrend: [100, 100, 100, 85, 100, 90, 100] },
      { id: 'u2', name: '李明', avatarColor: '#f59e0b', todayCompleted: true, completionRate: 85, daysInGroup: 30, tasks: { mealUploaded: true, caloriesOnTarget: false, habitsCompleted: 3, totalHabits: 4 }, weeklyTrend: [80, 90, 85, 100, 75, 80, 85] },
      { id: 'u3', name: '赵丽', avatarColor: '#10b981', todayCompleted: false, completionRate: 72, daysInGroup: 15, tasks: { mealUploaded: false, caloriesOnTarget: false, habitsCompleted: 1, totalHabits: 4 }, weeklyTrend: [60, 70, 65, 50, 0, 55, 0] },
      { id: 'u4', name: '孙强', avatarColor: '#8b5cf6', todayCompleted: true, completionRate: 95, daysInGroup: 60, tasks: { mealUploaded: true, caloriesOnTarget: true, habitsCompleted: 4, totalHabits: 4 }, weeklyTrend: [100, 100, 95, 100, 100, 100, 100] },
      { id: 'u5', name: '周杰', avatarColor: '#ef4444', todayCompleted: true, completionRate: 78, daysInGroup: 22, tasks: { mealUploaded: true, caloriesOnTarget: true, habitsCompleted: 3, totalHabits: 4 }, weeklyTrend: [75, 80, 70, 85, 90, 75, 80] }
    ]
  },
  {
    id: 'c2',
    name: '刘洋',
    avatarColor: '#10b981',
    role: 'apprentice',
    roleLabel: '实习教练',
    groupName: '冠军战队',
    userCount: 8,
    todayActive: 6,
    completionRate: 75,
    completionTrend: 8,
    load: 6,
    maxLoad: 10,
    loadRate: 0.6,
    status: 'active',
    avgResponseTime: 12,
    users: [
      { id: 'u6', name: '陈静', avatarColor: '#f472b6', todayCompleted: true, completionRate: 88, daysInGroup: 20, tasks: { mealUploaded: true, caloriesOnTarget: true, habitsCompleted: 4, totalHabits: 4 }, weeklyTrend: [85, 90, 88, 100, 92, 85, 90] },
      { id: 'u7', name: '吴磊', avatarColor: '#06b6d4', todayCompleted: false, completionRate: 65, daysInGroup: 10, tasks: { mealUploaded: false, caloriesOnTarget: false, habitsCompleted: 2, totalHabits: 4 }, weeklyTrend: [50, 60, 55, 70, 0, 65, 0] },
      { id: 'u8', name: '郑华', avatarColor: '#84cc16', todayCompleted: true, completionRate: 82, daysInGroup: 35, tasks: { mealUploaded: true, caloriesOnTarget: true, habitsCompleted: 3, totalHabits: 4 }, weeklyTrend: [80, 85, 82, 90, 75, 80, 85] }
    ]
  },
  {
    id: 'c3',
    name: '王芳',
    avatarColor: '#ec4899',
    role: 'coach',
    roleLabel: '教练',
    groupName: '健康小分队',
    userCount: 18,
    todayActive: 15,
    completionRate: 82,
    completionTrend: -2,
    load: 16,
    maxLoad: 20,
    loadRate: 0.8,
    status: 'active',
    avgResponseTime: 10,
    users: [
      { id: 'u9', name: '林峰', avatarColor: '#f59e0b', todayCompleted: true, completionRate: 90, daysInGroup: 50, tasks: { mealUploaded: true, caloriesOnTarget: true, habitsCompleted: 4, totalHabits: 4 }, weeklyTrend: [100, 95, 100, 100, 90, 100, 100] },
      { id: 'u10', name: '郭敏', avatarColor: '#8b5cf6', todayCompleted: true, completionRate: 78, daysInGroup: 25, tasks: { mealUploaded: true, caloriesOnTarget: false, habitsCompleted: 3, totalHabits: 4 }, weeklyTrend: [75, 80, 78, 85, 70, 75, 80] },
      { id: 'u11', name: '黄涛', avatarColor: '#ef4444', todayCompleted: false, completionRate: 55, daysInGroup: 8, tasks: { mealUploaded: false, caloriesOnTarget: false, habitsCompleted: 1, totalHabits: 4 }, weeklyTrend: [40, 50, 45, 30, 0, 35, 0] }
    ]
  },
  {
    id: 'c4',
    name: '李明',
    avatarColor: '#f59e0b',
    role: 'coach',
    roleLabel: '教练',
    groupName: '减脂达人组',
    userCount: 15,
    todayActive: 12,
    completionRate: 79,
    completionTrend: 3,
    load: 14,
    maxLoad: 20,
    loadRate: 0.7,
    status: 'active',
    avgResponseTime: 11,
    users: [
      { id: 'u12', name: '梁晨', avatarColor: '#06b6d4', todayCompleted: true, completionRate: 86, daysInGroup: 40, tasks: { mealUploaded: true, caloriesOnTarget: true, habitsCompleted: 4, totalHabits: 4 }, weeklyTrend: [85, 90, 86, 100, 80, 85, 90] },
      { id: 'u13', name: '谢琳', avatarColor: '#ec4899', todayCompleted: true, completionRate: 75, daysInGroup: 18, tasks: { mealUploaded: true, caloriesOnTarget: false, habitsCompleted: 3, totalHabits: 4 }, weeklyTrend: [70, 75, 72, 80, 65, 70, 75] }
    ]
  },
  {
    id: 'c5',
    name: '陈静',
    avatarColor: '#f472b6',
    role: 'apprentice',
    roleLabel: '实习教练',
    groupName: '冠军战队',
    userCount: 5,
    todayActive: 3,
    completionRate: 68,
    completionTrend: -5,
    load: 4,
    maxLoad: 10,
    loadRate: 0.4,
    status: 'inactive',
    avgResponseTime: 18,
    users: [
      { id: 'u14', name: '唐宇', avatarColor: '#10b981', todayCompleted: true, completionRate: 80, daysInGroup: 28, tasks: { mealUploaded: true, caloriesOnTarget: true, habitsCompleted: 3, totalHabits: 4 }, weeklyTrend: [75, 80, 78, 85, 70, 75, 80] },
      { id: 'u15', name: '邓超', avatarColor: '#f59e0b', todayCompleted: false, completionRate: 52, daysInGroup: 5, tasks: { mealUploaded: false, caloriesOnTarget: false, habitsCompleted: 0, totalHabits: 4 }, weeklyTrend: [30, 40, 35, 0, 0, 25, 0] }
    ]
  }
])

// 教练管理员状态
const coachTimeFilter = ref<'today' | 'week' | 'month' | 'quarter'>('today')
const coachSearchQuery = ref('')
const coachSortBy = ref<'completionRate' | 'userCount' | 'todayActive' | 'loadRate'>('completionRate')
const selectedCoachForDetail = ref<CoachAdminCoach | null>(null)
const expandedCoachId = ref<string | null>(null)
const toggleCoachExpand = (coachId: string) => {
  expandedCoachId.value = expandedCoachId.value === coachId ? null : coachId
}
const coachUserFilter = ref<'all' | 'completed' | 'pending' | 'behind'>('all')

// 时间筛选标签
const coachTimeTabs = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '本季', value: 'quarter' }
]

// 趋势数据
const coachTrendData = computed(() => {
  if (coachTimeFilter.value === 'today') {
    return [
      { label: '6:00', overall: 45, top: 80 },
      { label: '9:00', overall: 65, top: 90 },
      { label: '12:00', overall: 72, top: 95 },
      { label: '15:00', overall: 78, top: 92 },
      { label: '18:00', overall: 85, top: 100 },
      { label: '21:00', overall: 88, top: 100 }
    ]
  } else if (coachTimeFilter.value === 'week') {
    return [
      { label: '周一', overall: 75, top: 88 },
      { label: '周二', overall: 78, top: 90 },
      { label: '周三', overall: 72, top: 85 },
      { label: '周四', overall: 80, top: 92 },
      { label: '周五', overall: 85, top: 95 },
      { label: '周六', overall: 82, top: 90 },
      { label: '周日', overall: 88, top: 100 }
    ]
  } else {
    return [
      { label: '第1周', overall: 70, top: 85 },
      { label: '第2周', overall: 75, top: 88 },
      { label: '第3周', overall: 78, top: 90 },
      { label: '第4周', overall: 82, top: 95 }
    ]
  }
})

const sortedCoachList = computed(() => {
  let filtered = coachList.value

  // 应用搜索过滤
  if (coachSearchQuery.value) {
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(coachSearchQuery.value.toLowerCase())
    )
  }

  // 排序
  return [...filtered].sort((a, b) => {
    switch (coachSortBy.value) {
      case 'completionRate': return b.completionRate - a.completionRate
      case 'userCount': return b.userCount - a.userCount
      case 'todayActive': return b.todayActive - a.todayActive
      case 'loadRate': return b.loadRate - b.loadRate
      default: return 0
    }
  })
})

const coachAdminStats = computed(() => {
  const totalCoaches = coachList.value.length
  const activeCoaches = coachList.value.filter(c => c.status === 'active').length
  const probationCoaches = coachList.value.filter(c => c.role === 'apprentice').length
  const avgCompletionRate = Math.round(coachList.value.reduce((sum, c) => sum + c.completionRate, 0) / totalCoaches)
  const topPerformers = coachList.value.filter(c => c.completionRate >= 85).length
  const totalUsers = coachList.value.reduce((sum, c) => sum + c.userCount, 0)
  const todayActiveUsers = coachList.value.reduce((sum, c) => sum + c.todayActive, 0)
  const attentionNeeded = coachList.value.filter(c => c.completionRate < 60).length

  return {
    totalCoaches,
    activeCoaches,
    probationCoaches,
    avgCompletionRate,
    completionTrend: 5,
    topPerformers,
    totalUsers,
    todayActiveUsers,
    attentionNeeded
  }
})

// 筛选后的用户列表
const filteredCoachUsers = computed(() => {
  if (!selectedCoachForDetail.value) return []

  let users = selectedCoachForDetail.value.users

  switch (coachUserFilter.value) {
    case 'completed':
      return users.filter(u => u.todayCompleted)
    case 'pending':
      return users.filter(u => !u.todayCompleted)
    case 'behind':
      return users.filter(u => u.completionRate < 70)
    default:
      return users
  }
})

// 筛选后的客户列表
const filteredClients = computed(() => {
  let filtered = clientDetailData.value

  // 应用搜索过滤
  if (clientSearchQuery.value) {
    filtered = filtered.filter(c =>
      c.name.includes(clientSearchQuery.value) ||
      c.phone.includes(clientSearchQuery.value)
    )
  }

  // 应用状态过滤
  if (clientStatusFilter.value !== 'all') {
    filtered = filtered.filter(c => c.status === clientStatusFilter.value)
  }

  return filtered
})

const taskDistribution = [
  { name: '饮食上传', rate: 85, color: '#4f46e5' },
  { name: '热量达标', rate: 72, color: '#f59e0b' },
  { name: '营养均衡', rate: 68, color: '#10b981' },
  { name: '习惯打卡', rate: 80, color: '#8b5cf6' }
]

// 预约数据计算属性
const pendingAppointments = computed(() => {
  return appointments.value.filter(a => a.status === 'pending')
})

const acceptedAppointments = computed(() => {
  return appointments.value.filter(a => a.status === 'accepted')
})

const doctorAppointments = computed(() => {
  // 模拟当前医生ID为 doc1
  const currentDoctorId = 'doc1'
  return appointments.value.filter(a => a.doctorId === currentDoctorId)
})

const serviceTypeMap: Record<string, string> = {
  'consultation': '在线问诊',
  'prescription': '处方审核',
  'follow-up': '随访指导',
  'emergency': '紧急咨询'
}

const statusMap: Record<string, { text: string; class: string }> = {
  'pending': { text: '待接受', class: 'bg-amber-100 text-amber-700' },
  'accepted': { text: '已接受', class: 'bg-green-100 text-green-700' },
  'rejected': { text: '已拒绝', class: 'bg-red-100 text-red-700' },
  'completed': { text: '已完成', class: 'bg-blue-100 text-blue-700' }
}

// 任务数据
// 任务相关接口
interface Task {
  id: string
  title: string
  description?: string
  dueTime: string
  dueDate: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  completed: boolean
  type: 'call' | 'review' | 'reminder' | 'view' | 'follow_up' | 'prescription' | 'education'
  category: 'health_monitoring' | 'prescription_review' | 'education' | 'follow_up' | 'emergency'
  userName: string
  userId: string
  roleId: 'coach' | 'doctor' | 'coach-admin' | null
  createdBy: string
  createdAt: string
  completedAt?: string
  tags?: string[]
  relatedData?: {
    dataType: 'blood_sugar' | 'blood_pressure' | 'weight' | 'diet' | 'prescription' | 'appointment'
    dataId?: string
    value?: string
  }
  notes?: string
}

const tasks = ref<Task[]>([
  {
    id: '1',
    title: '跟进张建国血糖异常',
    description: '空腹血糖连续3天超过8.5 mmol/L，需要调整饮食方案并考虑就医',
    dueTime: '10:30',
    dueDate: '2026-05-18',
    priority: 'high',
    status: 'pending',
    completed: false,
    type: 'call',
    category: 'health_monitoring',
    userName: '张建国',
    userId: 'user1',
    roleId: 'coach',
    createdBy: '系统预警',
    createdAt: '2026-05-18 08:00',
    tags: ['血糖异常', '紧急跟进'],
    relatedData: {
      dataType: 'blood_sugar',
      value: '8.5 mmol/L'
    },
    notes: '已连续异常3天'
  },
  {
    id: '2',
    title: '审核李淑芬的生活方式处方',
    description: '新客户入组第7天，需要审核初期效果并调整方案',
    dueTime: '11:00',
    dueDate: '2026-05-18',
    priority: 'medium',
    status: 'in_progress',
    completed: false,
    type: 'review',
    category: 'prescription_review',
    userName: '李淑芬',
    userId: 'user2',
    roleId: 'doctor',
    createdBy: '系统',
    createdAt: '2026-05-17 14:00',
    tags: ['处方审核', '新客户'],
    relatedData: {
      dataType: 'prescription',
      dataId: 'rx001'
    }
  },
  {
    id: '3',
    title: '提醒王磊上传今日数据',
    description: '客户昨日未上传饮食记录，需要提醒按时上传',
    dueTime: '12:00',
    dueDate: '2026-05-18',
    priority: 'low',
    status: 'pending',
    completed: false,
    type: 'reminder',
    category: 'education',
    userName: '王磊',
    userId: 'user3',
    roleId: 'coach',
    createdBy: '系统',
    createdAt: '2026-05-18 09:00',
    tags: ['数据提醒']
  },
  {
    id: '4',
    title: '查看陈静的血压监测报告',
    description: '本周血压波动较大，需要查看详细报告并给出建议',
    dueTime: '14:00',
    dueDate: '2026-05-18',
    priority: 'high',
    status: 'pending',
    completed: false,
    type: 'view',
    category: 'health_monitoring',
    userName: '陈静',
    userId: 'user4',
    roleId: 'doctor',
    createdBy: '系统预警',
    createdAt: '2026-05-18 07:30',
    tags: ['血压监测', '需关注'],
    relatedData: {
      dataType: 'blood_pressure',
      value: '145/95 mmHg'
    }
  },
  {
    id: '5',
    title: '赵丽入组第14天随访',
    description: '两周效果评估，了解客户满意度并调整后续计划',
    dueTime: '15:30',
    dueDate: '2026-05-18',
    priority: 'medium',
    status: 'pending',
    completed: false,
    type: 'follow_up',
    category: 'follow_up',
    userName: '赵丽',
    userId: 'user5',
    roleId: 'coach',
    createdBy: '系统',
    createdAt: '2026-05-17 10:00',
    tags: ['定期随访', '效果评估']
  },
  {
    id: '6',
    title: '孙强复诊前准备',
    description: '客户明天复诊，需要整理健康数据和问题清单',
    dueTime: '16:00',
    dueDate: '2026-05-18',
    priority: 'high',
    status: 'pending',
    completed: false,
    type: 'review',
    category: 'health_monitoring',
    userName: '孙强',
    userId: 'user6',
    roleId: 'coach',
    createdBy: '系统',
    createdAt: '2026-05-17 16:00',
    tags: ['复诊准备', '紧急'],
    relatedData: {
      dataType: 'appointment',
      dataId: 'apt001'
    }
  },
  {
    id: '7',
    title: '周杰饮食教育指导',
    description: '客户对饮食控制理解不足，需要进行一对一指导',
    dueTime: '17:00',
    dueDate: '2026-05-18',
    priority: 'medium',
    status: 'pending',
    completed: false,
    type: 'education',
    category: 'education',
    userName: '周杰',
    userId: 'user7',
    roleId: 'coach',
    createdBy: '教练',
    createdAt: '2026-05-17 11:00',
    tags: ['饮食教育', '需要指导']
  },
  {
    id: '8',
    title: '吴磊处方调整审核',
    description: '客户体重下降过快，需要调整处方中的热量目标',
    dueTime: '09:00',
    dueDate: '2026-05-19',
    priority: 'high',
    status: 'pending',
    completed: false,
    type: 'prescription',
    category: 'prescription_review',
    userName: '吴磊',
    userId: 'user8',
    roleId: 'doctor',
    createdBy: '系统预警',
    createdAt: '2026-05-18 08:00',
    tags: ['处方调整', '体重异常'],
    relatedData: {
      dataType: 'weight',
      value: '下降2.5kg/周'
    }
  }
])

// 任务计算属性
const filteredTasks = computed(() => {
  let filtered = tasks.value.filter(t => t.roleId === currentRole.value || !t.roleId)

  // 应用状态过滤
  if (taskFilter.value === 'pending') {
    filtered = filtered.filter(t => !t.completed)
  } else if (taskFilter.value === 'completed') {
    filtered = filtered.filter(t => t.completed)
  } else if (taskFilter.value === 'overdue') {
    const now = new Date()
    filtered = filtered.filter(t => {
      const dueDateTime = new Date(`${t.dueDate}T${t.dueTime}`)
      return !t.completed && dueDateTime < now
    })
  }

  return filtered
})

const sortedTasks = computed(() => {
  const tasks = [...filteredTasks.value]

  // 排序逻辑
  if (taskSortBy.value === 'priority') {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return tasks.sort((a, b) => {
      // 未完成的排前面
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      // 按优先级排序
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  } else if (taskSortBy.value === 'time') {
    return tasks.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      const timeA = new Date(`${a.dueDate}T${a.dueTime}`)
      const timeB = new Date(`${b.dueDate}T${b.dueTime}`)
      return timeA.getTime() - timeB.getTime()
    })
  } else if (taskSortBy.value === 'client') {
    return tasks.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return a.userName.localeCompare(b.userName, 'zh-CN')
    })
  }

  return tasks
})

const priorityTasks = computed(() => {
  return sortedTasks.value.slice(0, 6) // 只显示前6个
})

const overdueTasks = computed(() => {
  const now = new Date()
  return tasks.value.filter(t => {
    const dueDateTime = new Date(`${t.dueDate}T${t.dueTime}`)
    return !t.completed && dueDateTime < now && (t.roleId === currentRole.value || !t.roleId)
  })
})

const todayTasks = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return tasks.value.filter(t => {
    return t.dueDate === today && (t.roleId === currentRole.value || !t.roleId)
  })
})

const completedCount = computed(() => {
  return tasks.value.filter(t => t.completed && (t.roleId === currentRole.value || !t.roleId)).length
})

const totalCount = computed(() => {
  return tasks.value.filter(t => t.roleId === currentRole.value || !t.roleId).length
})

// 任务统计
const taskStats = computed(() => {
  const roleTasks = tasks.value.filter(t => t.roleId === currentRole.value || !t.roleId)
  return {
    total: roleTasks.length,
    completed: roleTasks.filter(t => t.completed).length,
    pending: roleTasks.filter(t => !t.completed).length,
    overdue: overdueTasks.value.length,
    high: roleTasks.filter(t => t.priority === 'high' && !t.completed).length,
    medium: roleTasks.filter(t => t.priority === 'medium' && !t.completed).length,
    low: roleTasks.filter(t => t.priority === 'low' && !t.completed).length
  }
})

// 新建任务表单
const newTask = ref<Partial<Task>>({
  title: '',
  description: '',
  dueTime: '',
  dueDate: new Date().toISOString().split('T')[0],
  priority: 'medium',
  type: 'call',
  category: 'health_monitoring',
  userName: '',
  userId: '',
  roleId: currentRole.value,
  createdBy: currentUserName.value,
  createdAt: new Date().toISOString(),
  tags: []
})

// 今日统计
const todayStats = ref({
  checkedIn: 42,
  total: 50,
  abnormal: 5,
  pending: 12
})

// 健康预警
const healthAlerts = ref([
  {
    id: '1',
    title: '张建国血糖偏高',
    desc: '空腹血糖 8.5 mmol/L，建议关注',
    severity: 'high',
    userId: 'user1'
  },
  {
    id: '2',
    title: '李淑芬未按时上传',
    desc: '已超过48小时未上传数据',
    severity: 'medium',
    userId: 'user2'
  },
  {
    id: '3',
    title: '王磊血压波动',
    desc: '血压 145/95 mmHg',
    severity: 'medium',
    userId: 'user3'
  }
])

// 最近活动
const recentActivities = ref([
  { id: '1', desc: '张建国完成了今日打卡', time: '5分钟前', type: 'success' },
  { id: '2', desc: '李淑芬上传了新的血压数据', time: '15分钟前', type: 'success' },
  { id: '3', desc: '王磊血糖数据异常', time: '30分钟前', type: 'warning' },
  { id: '4', desc: '陈静完成了随访任务', time: '1小时前', type: 'success' }
])

// 方法
const switchRole = (role: 'coach' | 'doctor' | 'coach-admin') => {
  currentRole.value = role
  toastRef.value?.info(`已切换到${roleConfig[role].label}`)
}

const viewCoachDetail = (coach: CoachAdminCoach) => {
  selectedCoachForDetail.value = coach
}

const exportCoachData = () => {
  toastRef.value?.success('教练数据报表导出成功')
}

// 模拟客户数据
const recentClients = ref([
  { id: '1', name: '王芳', phone: '138****1234', avatarColor: '#ec4899', online: true },
  { id: '2', name: '李明', phone: '139****5678', avatarColor: '#f59e0b', online: true },
  { id: '3', name: '张伟', phone: '137****9012', avatarColor: '#10b981', online: false },
  { id: '4', name: '赵丽', phone: '136****3456', avatarColor: '#8b5cf6', online: true },
  { id: '5', name: '孙强', phone: '135****7890', avatarColor: '#ef4444', online: false }
])

// 客户详情数据
const clientDetailData = ref([
  { id: '1', name: '王芳', phone: '138****1234', avatarColor: '#ec4899', status: 'active', days: 45, checkinRate: 92 },
  { id: '2', name: '李明', phone: '139****5678', avatarColor: '#f59e0b', status: 'active', days: 30, checkinRate: 85 },
  { id: '3', name: '张伟', phone: '137****9012', avatarColor: '#10b981', status: 'inactive', days: 15, checkinRate: 68 },
  { id: '4', name: '赵丽', phone: '136****3456', avatarColor: '#8b5cf6', status: 'active', days: 60, checkinRate: 95 },
  { id: '5', name: '孙强', phone: '135****7890', avatarColor: '#ef4444', status: 'inactive', days: 8, checkinRate: 55 },
  { id: '6', name: '周杰', phone: '134****2345', avatarColor: '#06b6d4', status: 'active', days: 22, checkinRate: 78 },
  { id: '7', name: '吴磊', phone: '133****6789', avatarColor: '#84cc16', status: 'active', days: 35, checkinRate: 82 },
  { id: '8', name: '郑华', phone: '132****0123', avatarColor: '#f472b6', status: 'active', days: 28, checkinRate: 88 },
  { id: '9', name: '何静', phone: '131****4567', avatarColor: '#14b8a6', status: 'inactive', days: 5, checkinRate: 45 },
  { id: '10', name: '马超', phone: '130****8901', avatarColor: '#f97316', status: 'active', days: 50, checkinRate: 90 },
  { id: '11', name: '林峰', phone: '159****2345', avatarColor: '#8b5cf6', status: 'active', days: 40, checkinRate: 86 },
  { id: '12', name: '郭敏', phone: '158****6789', avatarColor: '#ec4899', status: 'active', days: 25, checkinRate: 75 }
])

// 打卡率相关数据
const todayCheckinRate = ref(85.6)
const checkinStats = ref({
  completed: 109,
  pending: 19,
  late: 8,
  rate: 85.6
})

const checkinTimeDistribution = ref([
  { time: '6:00-8:00', count: 25, percentage: 20 },
  { time: '8:00-10:00', count: 45, percentage: 36 },
  { time: '10:00-12:00', count: 20, percentage: 16 },
  { time: '12:00-14:00', count: 15, percentage: 12 },
  { time: '14:00-16:00', count: 10, percentage: 8 },
  { time: '16:00-18:00', count: 8, percentage: 6 },
  { time: '18:00-20:00', count: 2, percentage: 2 }
])

const checkinClientList = ref([
  { id: '1', name: '王芳', avatarColor: '#ec4899', checked: true, checkTime: '07:30', weeklyCheckin: [true, true, true, true, true, true, true] },
  { id: '2', name: '李明', avatarColor: '#f59e0b', checked: true, checkTime: '08:15', weeklyCheckin: [true, true, true, true, true, false, true] },
  { id: '3', name: '张伟', avatarColor: '#10b981', checked: false, checkTime: null, weeklyCheckin: [true, false, true, true, false, true, false] },
  { id: '4', name: '赵丽', avatarColor: '#8b5cf6', checked: true, checkTime: '06:45', weeklyCheckin: [true, true, true, true, true, true, true] },
  { id: '5', name: '孙强', avatarColor: '#ef4444', checked: false, checkTime: null, weeklyCheckin: [false, false, true, false, false, true, false] },
  { id: '6', name: '周杰', avatarColor: '#06b6d4', checked: true, checkTime: '09:20', weeklyCheckin: [true, true, true, false, true, true, true] },
  { id: '7', name: '吴磊', avatarColor: '#84cc16', checked: true, checkTime: '07:50', weeklyCheckin: [true, true, true, true, true, true, true] },
  { id: '8', name: '郑华', avatarColor: '#f472b6', checked: true, checkTime: '08:30', weeklyCheckin: [true, true, true, true, true, true, true] },
  { id: '9', name: '何静', avatarColor: '#14b8a6', checked: false, checkTime: null, weeklyCheckin: [false, true, false, false, false, false, true] },
  { id: '10', name: '马超', avatarColor: '#f97316', checked: true, checkTime: '07:00', weeklyCheckin: [true, true, true, true, true, true, true] }
])

// 新增教练表单数据
const newCoach = ref({
  name: '',
  phone: '',
  role: 'coach',
  employmentType: 'full_time',
  groupId: '',
  maxLoad: 20
})

// 团队设置数据
const teamGroups = ref([
  { id: 'g1', name: '冠军战队', color: '#4f46e5', memberCount: 12, mentor: '张伟' },
  { id: 'g2', name: '健康小分队', color: '#10b981', memberCount: 8, mentor: '王芳' },
  { id: 'g3', name: '减脂达人组', color: '#f59e0b', memberCount: 6, mentor: '李明' }
])

const mentorRelations = ref([
  { id: 'r1', mentorName: '张伟', apprenticeName: '刘洋', mentorColor: '#4f46e5', apprenticeColor: '#10b981', progress: 65 },
  { id: 'r2', mentorName: '张伟', apprenticeName: '陈静', mentorColor: '#4f46e5', apprenticeColor: '#f472b6', progress: 40 },
  { id: 'r3', mentorName: '王芳', apprenticeName: '赵磊', mentorColor: '#ec4899', apprenticeColor: '#8b5cf6', progress: 80 }
])

const teamSettings = ref({
  allowApprenticeService: false,
  autoAssignClients: true
})

// 新问诊数据
const newConsult = ref({
  clientId: '',
  type: 'general',
  complaint: ''
})

// 处理客户选择
const handleClientSelect = (client: any) => {
  showClientSelectModal.value = false

  if (clientSelectPurpose.value === 'call') {
    toastRef.value?.info(`正在呼叫 ${client.name}... (${client.phone})`)
  } else if (clientSelectPurpose.value === 'message') {
    toastRef.value?.info(`已打开与 ${client.name} 的对话窗口`)
  } else if (clientSelectPurpose.value === 'task') {
    newTask.value.userName = client.name
    newTask.value.userId = client.id
    showTaskCreateModal.value = true
  }
}

// 添加教练
const handleAddCoach = () => {
  if (!newCoach.value.name || !newCoach.value.phone) {
    toastRef.value?.error('请填写完整的教练信息')
    return
  }

  toastRef.value?.success(`教练 ${newCoach.value.name} 添加成功`)
  showAddCoachModal.value = false

  // 重置表单
  newCoach.value = {
    name: '',
    phone: '',
    role: 'coach',
    employmentType: 'full_time',
    groupId: '',
    maxLoad: 20
  }
}

// 保存团队设置
const saveTeamSettings = () => {
  toastRef.value?.success('团队设置保存成功')
  showTeamSettingsModal.value = false
}

// 创建新分组
const createNewGroup = () => {
  toastRef.value?.info('创建分组功能开发中')
}

// 新建问诊
const handleNewConsult = () => {
  if (!newConsult.value.clientId) {
    toastRef.value?.error('请选择客户')
    return
  }

  const client = recentClients.value.find(c => c.id === newConsult.value.clientId)
  toastRef.value?.success(`已开始与 ${client?.name} 的在线问诊`)
  showNewConsultModal.value = false

  // 跳转到客户详情
  router.push(`/client-profile/${newConsult.value.clientId}`)
}

// 添加任务
const handleAddTask = () => {
  if (!newTask.value.title) {
    toastRef.value?.error('请输入任务标题')
    return
  }

  const newTaskItem = {
    id: Date.now().toString(),
    title: newTask.value.title,
    time: newTask.value.dueTime ? new Date(newTask.value.dueTime).toLocaleString() : '无截止时间',
    priority: newTask.value.priority,
    completed: false
  }

  tasks.value.unshift(newTaskItem)
  toastRef.value?.success('任务添加成功')
  showAddTaskModal.value = false

  // 重置表单
  newTask.value = {
    title: '',
    priority: 'medium',
    dueTime: '',
    clientId: ''
  }
}

const handleQuickAction = (actionId: string) => {
  const actionMap: Record<string, () => void> = {
    // 教练快捷操作
    'batch-task': () => router.push('/batch-task-processor'),
    'book-appointment': () => { showAppointmentModal.value = true },
    'make-call': () => {
      // 打开客户列表选择对话框
      showClientSelectModal.value = true
      clientSelectPurpose.value = 'call'
    },
    'view-report': () => {
      // 跳转到销售监控页面查看报告
      router.push('/sales-monitor')
    },

    // 教练管理员快捷操作
    'add-coach': () => {
      showAddCoachModal.value = true
    },
    'view-groups': () => {
      // 跳转到师徒组管理
      router.push('/system-management')
    },
    'export-report': () => {
      exportCoachData()
    },
    'team-settings': () => {
      showTeamSettingsModal.value = true
    },

    // 医生快捷操作
    'new-consult': () => {
      // 打开新问诊对话框
      showNewConsultModal.value = true
    },
    'review-rx': () => {
      // 跳转到处方审核
      router.push('/client-list')
      toastRef.value?.info('请在客户列表中选择需要审核处方的客户')
    },
    'view-cases': () => router.push('/client-list'),
    'health-alert': () => router.push('/alert-center'),

    // 其他操作
    'add-task': () => {
      showAddTaskModal.value = true
    }
  }

  const handler = actionMap[actionId]
  if (handler) handler()
}

const handleCardClick = (action: string) => {
  if (!action) return

  const actionMap: Record<string, () => void> = {
    // Coach actions
    'view-clients-detail': () => {
      showClientsDetailModal.value = true
    },
    'view-clients': () => router.push('/client-list'),
    'view-checkin-detail': () => {
      showCheckinDetailModal.value = true
    },
    'view-tasks': () => {
      // 滚动到任务列表
      document.querySelector('.lg\\:col-span-2')?.scrollIntoView({ behavior: 'smooth' })
    },
    'view-health-report': () => router.push('/sales-monitor'),
    // Doctor actions
    'view-patients': () => router.push('/client-list'),
    'view-prescriptions': () => toastRef.value?.info('处方审核功能开发中'),
    'view-critical': () => router.push('/alert-center'),
    // Coach Admin actions
    'view-coaches-list': () => {
      showCoachesListModal.value = true
    },
    'view-completion-detail': () => {
      showCompletionDetailModal.value = true
    },
    'view-top-performers': () => {
      showTopPerformersModal.value = true
    },
    'view-coach-users': () => {
      showCoachUsersModal.value = true
    },
    'view-attention-needed': () => {
      showAttentionNeededModal.value = true
    }
  }

  const handler = actionMap[action]
  if (handler) handler()
}

// 查看客户详情
const viewClientProfile = (clientId: string) => {
  router.push(`/client-profile/${clientId}`)
}

// 提醒客户打卡
const remindClient = (client: any) => {
  toastRef.value?.success(`已向 ${client.name} 发送打卡提醒`)
}

// 任务相关方法
const handleTaskClick = (task: Task) => {
  selectedTask.value = task
  showTaskDetailModal.value = true
}

const toggleTask = (taskId: string) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.completed = !task.completed
    if (task.completed) {
      task.status = 'completed'
      task.completedAt = new Date().toISOString()
      toastRef.value?.success('任务已完成！')
    } else {
      task.status = 'pending'
      delete task.completedAt
      toastRef.value?.info('任务已恢复为待办')
    }
  }
}

const makeCall = (task: Task) => {
  // 跳转到客户详情页，并标记需要拨打电话
  router.push({
    path: `/client-profile/${task.userId}`,
    query: { action: 'call', taskId: task.id }
  })
  toastRef.value?.info(`正在呼叫 ${task.userName}...`)
}

const viewTaskDetail = (task: Task) => {
  selectedTask.value = task
  showTaskDetailModal.value = true
}

const editTask = (task: Task) => {
  selectedTask.value = task
  showTaskDetailModal.value = true
}

const deleteTask = (taskId: string) => {
  const index = tasks.value.findIndex(t => t.id === taskId)
  if (index !== -1) {
    tasks.value.splice(index, 1)
    toastRef.value?.success('任务已删除')
    if (selectedTask.value?.id === taskId) {
      showTaskDetailModal.value = false
    }
  }
}

const updateTaskStatus = (taskId: string, status: Task['status']) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.status = status
    task.completed = status === 'completed'
    if (status === 'completed') {
      task.completedAt = new Date().toISOString()
    } else {
      delete task.completedAt
    }
    toastRef.value?.success(`任务状态已更新为：${status === 'in_progress' ? '进行中' : status === 'completed' ? '已完成' : '待办'}`)
  }
}

const createTask = () => {
  if (!newTask.value.title || !newTask.value.userName) {
    toastRef.value?.error('请填写任务标题和客户姓名')
    return
  }

  const task: Task = {
    id: Date.now().toString(),
    title: newTask.value.title,
    description: newTask.value.description,
    dueTime: newTask.value.dueTime || '09:00',
    dueDate: newTask.value.dueDate || new Date().toISOString().split('T')[0],
    priority: newTask.value.priority || 'medium',
    status: 'pending',
    completed: false,
    type: newTask.value.type || 'call',
    category: newTask.value.category || 'health_monitoring',
    userName: newTask.value.userName,
    userId: newTask.value.userId || 'temp-' + Date.now(),
    roleId: newTask.value.roleId || null,
    createdBy: newTask.value.createdBy || currentUserName.value,
    createdAt: new Date().toISOString(),
    tags: newTask.value.tags,
    notes: newTask.value.notes
  }

  tasks.value.unshift(task)
  toastRef.value?.success('任务创建成功')
  showTaskCreateModal.value = false

  // 重置表单
  newTask.value = {
    title: '',
    description: '',
    dueTime: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'medium',
    type: 'call',
    category: 'health_monitoring',
    userName: '',
    userId: '',
    roleId: currentRole.value,
    createdBy: currentUserName.value,
    createdAt: new Date().toISOString(),
    tags: []
  }
}

const addTaskNote = (taskId: string, note: string) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    if (!task.notes) task.notes = ''
    task.notes += (task.notes ? '\n' : '') + `[${new Date().toLocaleString()}] ${note}`
    toastRef.value?.success('备注已添加')
  }
}

const handleAlertClick = (alert: any) => {
  router.push(`/client-profile/${alert.userId}?tab=health&focus=bloodSugar`)
}

const viewAllTasks = () => {
  // 可以在这里添加跳转到任务管理页面的逻辑
  toastRef.value?.info('全部任务视图即将开放')
}

// 任务辅助函数
const isTaskOverdue = (task: Task) => {
  const now = new Date()
  const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`)
  return !task.completed && dueDateTime < now
}

const formatTaskTime = (task: Task) => {
  const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (dueDateTime < today && !task.completed) {
    return `已逾期 ${Math.floor((now.getTime() - dueDateTime.getTime()) / (1000 * 60 * 60 * 24))} 天`
  } else if (dueDateTime.toDateString() === today.toDateString()) {
    return `今天 ${task.dueTime}`
  } else if (dueDateTime.toDateString() === tomorrow.toDateString()) {
    return `明天 ${task.dueTime}`
  } else {
    return `${task.dueDate.slice(5)} ${task.dueTime}`
  }
}

const getTaskIcon = (type: Task['type']) => {
  const iconMap = {
    call: Phone,
    review: FileText,
    reminder: Clock,
    view: Eye,
    follow_up: MessageSquare,
    prescription: FileText,
    education: BookOpen
  }
  return iconMap[type] || CheckCircle
}

const getTaskIconColor = (type: Task['type']) => {
  const colorMap = {
    call: 'text-green-600',
    review: 'text-purple-600',
    reminder: 'text-amber-600',
    view: 'text-blue-600',
    follow_up: 'text-indigo-600',
    prescription: 'text-pink-600',
    education: 'text-cyan-600'
  }
  return colorMap[type] || 'text-slate-600'
}

const getPriorityClass = (priority: Task['priority']) => {
  const classMap = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-slate-100 text-slate-700'
  }
  return classMap[priority]
}

const getStatusText = (status: Task['status']) => {
  const textMap = {
    pending: '待办',
    in_progress: '进行中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status]
}

const getCategoryText = (category: Task['category']) => {
  const textMap = {
    health_monitoring: '健康监测',
    prescription_review: '处方审核',
    education: '健康宣教',
    follow_up: '随访管理',
    emergency: '紧急处理'
  }
  return textMap[category]
}

// 预约相关方法
const handleAppointmentSubmit = (appointment: any) => {
  // 添加医生名称
  const doctorMap: Record<string, string> = {
    'doc1': '李医生',
    'doc2': '王医生',
    'doc3': '张医生',
    'doc4': '刘医生'
  }
  appointment.doctorName = doctorMap[appointment.doctorId] || '未知医生'

  appointments.value.push(appointment)
  toastRef.value?.success('预约提交成功！等待医生确认')
  showAppointmentModal.value = false
}

const acceptAppointment = (appointmentId: string) => {
  const appointment = appointments.value.find(a => a.id === appointmentId)
  if (appointment) {
    appointment.status = 'accepted'
    toastRef.value?.success('已接受预约，请在预约时间提供服务')
  }
}

const rejectAppointment = (appointmentId: string) => {
  const appointment = appointments.value.find(a => a.id === appointmentId)
  if (appointment) {
    appointment.status = 'rejected'
    toastRef.value?.info('已拒绝该预约')
  }
}

const completeAppointment = (appointmentId: string) => {
  const appointment = appointments.value.find(a => a.id === appointmentId)
  if (appointment) {
    appointment.status = 'completed'
    toastRef.value?.success('服务已完成！薪酬系统已更新')

    // 模拟添加到财务中心
    const salaryRecord = {
      id: Date.now().toString(),
      type: 'online-service',
      amount: 200,
      description: `上线服务 - ${appointment.clientName} - ${serviceTypeMap[appointment.serviceType]}`,
      date: new Date().toISOString(),
      appointmentId: appointment.id
    }

    // 保存到localStorage（模拟财务系统）
    const existingRecords = JSON.parse(localStorage.getItem('salary_records') || '[]')
    existingRecords.push(salaryRecord)
    localStorage.setItem('salary_records', JSON.stringify(existingRecords))

    console.log('财务记录已添加:', salaryRecord)
  }
}

onMounted(() => {
  // 加载初始数据
  console.log(`Dashboard initialized for role: ${currentRole.value}`)
})
</script>
