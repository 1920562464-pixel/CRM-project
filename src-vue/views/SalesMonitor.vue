<template>
  <div class="space-y-6 animate-in fade-in duration-700">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- Top Header Section -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-4 p-5 rounded-xl shadow-lg relative overflow-hidden" :style="{
      background: 'linear-gradient(135deg, var(--card) 0%, var(--fill-light) 100%)',
      border: '1px solid var(--border)'
    }">
      <!-- 装饰背景 -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-1/2 translate-x-1/2" :style="{ background: isBlackGold ? '#D4A84A' : '#facc15' }"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 rounded-full translate-y-1/2 -translate-x-1/2" :style="{ background: isBlackGold ? '#B8860B' : '#facc15' }"></div>
      </div>

      <div class="relative flex items-center gap-3">
        <div class="w-1.5 h-7 rounded-full shadow-lg" :style="{ background: isBlackGold ? 'linear-gradient(135deg, #D4A84A 0%, #B8860B 100%)' : 'linear-gradient(135deg, #facc15 0%, #eab308 100%)' }"></div>
        <div>
          <h2 class="text-xl font-bold" :style="{ color: 'var(--text-primary)' }">大屏监控中心</h2>
          <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">实时监控 · 智能预警</p>
        </div>
      </div>
      <div class="relative flex items-center gap-3">
        <div class="relative group">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2" :size="16" :style="{ color: 'var(--text-placeholder)' }" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索姓名/ID/地区/偏好..."
            class="pl-9 pr-10 py-2.5 rounded-lg text-sm focus:outline-none w-64 transition-all focus:ring-2 focus:ring-opacity-50"
            :style="{
              background: 'var(--fill-light)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }"
            :class="{ 'ring-2': isBlackGold ? 'ring-[#D4A84A]' : 'ring-[#facc15]' }"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 transition-colors"
            :style="{ color: 'var(--text-secondary)' }"
          >
            <X :size="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- Dashboard Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Card 1: Reservations -->
      <div
        @click="switchView('reservation')"
        class="cursor-pointer transition-all duration-300 p-4 rounded-xl border shadow-sm relative overflow-hidden group hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1"
        :style="activeView === 'reservation' ? {
          background: isBlackGold ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : 'linear-gradient(to bottom right, #4f46e5, #3730a3)',
          border: 'transparent',
          boxShadow: '0 0 0 2px ' + (isBlackGold ? '#B8860B' : '#4f46e5') + ', 0 0 0 4px ' + (isBlackGold ? '#1A1A1A' : 'white') + ', 0 10px 25px rgba(0,0,0,0.15)'
        } : {
          background: 'var(--card)',
          border: '1px solid var(--border)'
        }"
      >
        <!-- 背景装饰 -->
        <div v-if="activeView === 'reservation'" class="absolute inset-0 opacity-10">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div class="relative flex items-center justify-between mb-2">
          <span class="text-xs font-medium" :style="{ color: activeView === 'reservation' ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }">今日首通预约</span>
          <div class="p-1.5 rounded-lg" :style="activeView === 'reservation' ? {
            background: 'rgba(255,255,255,0.2)',
            color: 'white'
          } : {
            background: isBlackGold ? 'rgba(184, 134, 11, 0.15)' : '#eef2ff',
            color: isBlackGold ? '#D4A84A' : '#4f46e5'
          }">
            <PhoneCall :size="16" />
          </div>
        </div>
        <div class="relative text-2xl font-bold mb-1" :style="{ color: activeView === 'reservation' ? 'white' : 'var(--text-primary)' }">
          48 <span class="text-xs font-normal" :style="{ color: activeView === 'reservation' ? 'rgba(255,255,255,0.7)' : 'var(--text-disabled)' }">人</span>
        </div>
        <div class="relative text-xs px-2 py-0.5 rounded backdrop-blur-sm inline-block" :style="activeView === 'reservation' ? {
          background: 'rgba(255,255,255,0.2)',
          color: 'white'
        } : {
          background: '#dcfce7',
          color: '#16a34a'
        }">
          较昨日 +12%
        </div>
      </div>

      <!-- Card 2: Allocation -->
      <div
        @click="switchView('allocation')"
        class="cursor-pointer transition-all duration-300 p-4 rounded-xl border shadow-sm relative overflow-hidden group hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1"
        :style="activeView === 'allocation' ? {
          background: 'linear-gradient(to bottom right, #f97316, #ef4444)',
          border: 'transparent',
          boxShadow: '0 0 0 2px #f97316, 0 0 0 4px white, 0 10px 25px rgba(249, 115, 22, 0.25)'
        } : {
          background: 'var(--card)',
          border: '1px solid var(--border)'
        }"
      >
        <!-- 背景装饰 -->
        <div v-if="activeView === 'allocation'" class="absolute inset-0 opacity-10">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        </div>

        <div class="relative flex items-center justify-between mb-2">
          <span class="text-xs font-medium" :style="{ color: activeView === 'allocation' ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }">待分配用户</span>
          <div class="p-1.5 rounded-lg" :style="activeView === 'allocation' ? {
            background: 'rgba(255,255,255,0.2)',
            color: 'white'
          } : {
            background: '#ffedd5',
            color: '#f97316'
          }">
            <UserPlus :size="16" />
          </div>
        </div>
        <div class="relative text-2xl font-bold mb-1" :style="{ color: activeView === 'allocation' ? 'white' : 'var(--text-primary)' }">
          15 <span class="text-xs font-normal" :style="{ color: activeView === 'allocation' ? 'rgba(255,255,255,0.7)' : 'var(--text-disabled)' }">人</span>
        </div>
        <div class="relative flex items-center gap-2">
          <div class="text-xs px-2 py-0.5 rounded backdrop-blur-sm" :style="activeView === 'allocation' ? {
            background: 'rgba(255,255,255,0.2)',
            color: 'white'
          } : {
            background: '#fee2e2',
            color: '#ef4444'
          }">
            3人超时
          </div>
          <button
            @click.stop="openBatchAssignModal"
            class="text-[10px] px-2 py-0.5 rounded font-medium transition-all hover:scale-105"
            :style="activeView === 'allocation' ? {
              background: 'rgba(255,255,255,0.3)',
              color: 'white'
            } : {
              background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
              color: 'white'
            }"
          >
            批量分配
          </button>
        </div>
      </div>

      <!-- Card 3: Alert Center (Combined) -->
      <div
        @click="() => { switchView('alerts'); alertSubTab = 'current' }"
        class="cursor-pointer transition-all duration-300 p-4 rounded-xl border shadow-sm relative overflow-hidden group hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1"
        :style="activeView === 'alerts' ? {
          background: isBlackGold ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : 'linear-gradient(to bottom right, #6366f1, #4f46e5)',
          border: 'transparent',
          boxShadow: '0 0 0 2px ' + (isBlackGold ? '#B8860B' : '#6366f1') + ', 0 0 0 4px ' + (isBlackGold ? '#1A1A1A' : 'white') + ', 0 10px 25px rgba(0,0,0,0.15)'
        } : {
          background: 'var(--card)',
          border: '1px solid var(--border)'
        }"
      >
        <!-- 背景装饰 -->
        <div v-if="activeView === 'alerts'" class="absolute inset-0 opacity-10">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div class="relative flex items-center justify-between mb-2">
          <span class="text-xs font-medium" :style="{ color: activeView === 'alerts' ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }">预警中心</span>
          <div class="p-1.5 rounded-lg" :style="activeView === 'alerts' ? {
            background: 'rgba(255,255,255,0.2)',
            color: 'white'
          } : {
            background: isBlackGold ? 'rgba(184, 134, 11, 0.15)' : '#eef2ff',
            color: isBlackGold ? '#D4A84A' : '#6366f1'
          }">
            <ShieldAlert :size="16" />
          </div>
        </div>
        <div class="relative text-2xl font-bold mb-1" :style="{ color: activeView === 'alerts' ? 'white' : 'var(--text-primary)' }">
          {{ alertList.length + riskStats.total }}<span class="text-xs font-normal" :style="{ color: activeView === 'alerts' ? 'rgba(255,255,255,0.7)' : 'var(--text-disabled)' }">项</span>
        </div>
        <div class="relative space-y-1.5">
          <!-- 当前预警统计 -->
          <div>
            <div class="flex items-center gap-1 flex-wrap mb-1">
              <span class="text-[10px] px-1.5 py-0.5 rounded-full" :style="activeView === 'alerts' && alertSubTab === 'current' ? {
                background: 'rgba(239, 68, 68, 0.3)',
                color: 'white'
              } : {
                background: '#fee2e2',
                color: '#dc2626'
              }">
                紧急3
              </span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full" :style="activeView === 'alerts' && alertSubTab === 'current' ? {
                background: 'rgba(249, 115, 22, 0.3)',
                color: 'white'
              } : {
                background: '#ffedd5',
                color: '#ea580c'
              }">
                重要7
              </span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full" :style="activeView === 'alerts' && alertSubTab === 'current' ? {
                background: 'rgba(234, 179, 8, 0.3)',
                color: 'white'
              } : {
                background: '#fef3c7',
                color: '#ca8a04'
              }">
                一般5
              </span>
            </div>
          </div>
          <!-- 风险预测统计 -->
          <div>
            <div class="flex items-center gap-1 flex-wrap">
              <span class="text-[10px] px-1.5 py-0.5 rounded-full" :style="activeView === 'alerts' && alertSubTab === 'predictive' ? {
                background: 'rgba(220, 38, 38, 0.4)',
                color: 'white'
              } : {
                background: '#fecaca',
                color: '#dc2626'
              }">
                高{{ riskStats.high }}
              </span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full" :style="activeView === 'alerts' && alertSubTab === 'predictive' ? {
                background: 'rgba(234, 88, 12, 0.4)',
                color: 'white'
              } : {
                background: '#fed7aa',
                color: '#ea580c'
              }">
                中{{ riskStats.medium }}
              </span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full" :style="activeView === 'alerts' && alertSubTab === 'predictive' ? {
                background: 'rgba(22, 163, 74, 0.4)',
                color: 'white'
              } : {
                background: '#bbf7d0',
                color: '#16a34a'
              }">
                低{{ riskStats.low }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Card 4: Points Ranking -->
      <div
        @click="switchView('points')"
        class="cursor-pointer transition-all duration-300 p-4 rounded-xl border shadow-sm relative overflow-hidden group hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1"
        :style="activeView === 'points' ? {
          background: 'linear-gradient(to bottom right, #f59e0b, #d97706)',
          border: 'transparent',
          boxShadow: '0 0 0 2px #f59e0b, 0 0 0 4px white, 0 10px 25px rgba(245, 158, 11, 0.25)'
        } : {
          background: 'var(--card)',
          border: '1px solid var(--border)'
        }"
      >
        <!-- 背景装饰 -->
        <div v-if="activeView === 'points'" class="absolute inset-0 opacity-10">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div class="relative flex items-center justify-between mb-2">
          <span class="text-xs font-medium" :style="{ color: activeView === 'points' ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }">积分排行榜</span>
          <div class="p-1.5 rounded-lg" :style="activeView === 'points' ? {
            background: 'rgba(255,255,255,0.2)',
            color: 'white'
          } : {
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b'
          }">
            <Award :size="16" />
          </div>
        </div>
        <div class="relative text-2xl font-bold mb-1" :style="{ color: activeView === 'points' ? 'white' : 'var(--text-primary)' }">
          TOP 50<span class="text-xs font-normal" :style="{ color: activeView === 'points' ? 'rgba(255,255,255,0.7)' : 'var(--text-disabled)' }">名</span>
        </div>
        <div class="relative text-xs px-2 py-0.5 rounded backdrop-blur-sm inline-block" :style="activeView === 'points' ? {
          background: 'rgba(255,255,255,0.2)',
          color: 'white'
        } : {
          background: '#fef3c7',
          color: '#d97706'
        }">
          每周一结算
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Table List -->
      <div class="lg:col-span-3 rounded-xl shadow-lg flex flex-col min-h-[500px] transition-all duration-300 hover:shadow-xl" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <div class="p-4 flex justify-between items-center" :style="{ borderBottom: '1px solid var(--border-light)' }">
          <h3 class="font-bold flex items-center gap-2" :style="{ color: 'var(--text-primary)' }">
            <PhoneCall v-if="activeView === 'reservation'" :size="18" :style="{ color: isBlackGold ? '#D4A84A' : '#4f46e5' }" />
            <UserPlus v-if="activeView === 'allocation'" :size="18" style="color: #f97316;" />
            <Users v-if="activeView === 'coaches'" :size="18" style="color: #10b981;" />
            <AlertTriangle v-if="activeView === 'alerts'" :size="18" style="color: #ef4444;" />
            <Award v-if="activeView === 'points'" :size="18" style="color: #f59e0b;" />
            <span v-if="activeView === 'reservation'">首通电话预约列表</span>
            <span v-if="activeView === 'allocation'">待分配用户列表</span>
            <span v-if="activeView === 'coaches'">教练在线状态详情</span>
            <span v-if="activeView === 'alerts'">预警中心</span>
            <span v-if="activeView === 'points'">积分排行榜</span>
          </h3>
          <div class="flex items-center gap-3">
            <!-- 待分配用户视图的教练人工分配按钮 -->
            <button
              v-if="activeView === 'allocation'"
              @click="openBatchAssignModal"
              class="flex items-center gap-2 px-5 py-2.5 text-white font-bold rounded-lg shadow-md transition-all hover:shadow-lg hover:scale-105"
              :style="{
                background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)'
              }"
            >
              <UserPlus :size="18" />
              教练人工分配
            </button>

            <!-- 预警中心子标签 -->
            <div v-if="activeView === 'alerts'" class="flex p-1 rounded-lg" :style="{ background: 'var(--fill-light)' }">
              <button
                @click="alertSubTab = 'current'"
                class="px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5"
                :style="alertSubTab === 'current' ? {
                  background: 'var(--card)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  color: '#ef4444'
                } : {
                  color: 'var(--text-secondary)'
                }"
              >
                <AlertTriangle :size="12" />
                当前预警
              </button>
              <button
                @click="alertSubTab = 'predictive'"
                class="px-3 py-1 text-xs font-medium rounded transition-all flex items-center gap-1.5"
                :style="alertSubTab === 'predictive' ? {
                  background: 'var(--card)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  color: '#f97316'
                } : {
                  color: 'var(--text-secondary)'
                }"
              >
                <Activity :size="12" />
                事前预警
              </button>
            </div>

            <!-- 其他视图的操作按钮 -->
            <!-- 手动添加按钮已临时禁用 -->
            <!--
            <button
              v-if="activeView === 'reservation'"
              @click="showAddReservationModal = true"
              class="px-3 py-1.5 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              :style="{
                background: isBlackGold ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5'
              }"
            >
              <UserPlus :size="14" />
              手动添加
            </button>
            -->
          </div>
        </div>

        <div class="flex-1 overflow-auto">
          <!-- 首通电话预约视图 -->
          <div v-if="activeView === 'reservation'" class="p-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- 周日历排期组件 -->
              <div class="border rounded-xl overflow-hidden" :style="{ borderColor: 'var(--border)', background: 'var(--card)' }">
                <div class="p-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
                  <div class="flex items-center justify-between">
                    <h3 class="font-semibold flex items-center gap-2" :style="{ color: 'var(--text-primary)' }">
                      <Calendar :size="18" :style="{ color: isBlackGold ? '#D4A84A' : '#4f46e5' }" />
                      本周预约排期
                    </h3>
                    <div class="flex items-center gap-2 text-xs" :style="{ color: 'var(--text-secondary)' }">
                      <span>{{ getCurrentWeekRange() }}</span>
                    </div>
                  </div>
                </div>

                <!-- 周日历网格 -->
                <div class="p-4">
                  <div class="grid grid-cols-7 gap-2">
                    <div
                      v-for="(day, index) in weekDays"
                      :key="index"
                      class="text-center"
                    >
                      <!-- 日期标题 -->
                      <div class="mb-2">
                        <div class="text-xs font-medium mb-1" :style="{ color: 'var(--text-secondary)' }">{{ day.label }}</div>
                        <div class="text-sm font-bold" :style="{ color: 'var(--text-primary)' }">{{ day.date }}</div>
                      </div>

                      <!-- 时段预约卡片 -->
                      <div class="space-y-1">
                        <div
                          v-for="slot in day.slots"
                          :key="slot.time"
                          class="p-2 rounded-lg text-xs cursor-pointer transition-all hover:scale-105"
                          :class="getSlotClass(slot.status)"
                          @click="handleSlotClick(slot)"
                        >
                          <div class="flex items-center justify-between mb-1">
                            <span class="font-medium">{{ slot.time }}</span>
                            <span v-if="slot.count > 0" class="px-1.5 py-0.5 rounded-full text-[10px] font-bold" :class="getSlotCountClass(slot.status)">
                              {{ slot.count }}
                            </span>
                          </div>
                          <div v-if="slot.status === 'available'" class="text-[10px] opacity-75">可预约</div>
                          <div v-else-if="slot.status === 'booked'" class="text-[10px] opacity-75">已预约</div>
                          <div v-else class="text-[10px] opacity-75">已过期</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 预约完成状态统计 -->
              <div class="border rounded-xl overflow-hidden" :style="{ borderColor: 'var(--border)', background: 'var(--card)' }">
                <div class="p-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
                  <h3 class="font-semibold flex items-center gap-2" :style="{ color: 'var(--text-primary)' }">
                    <PhoneCall :size="18" :style="{ color: isBlackGold ? '#D4A84A' : '#4f46e5' }" />
                    预约完成状态
                  </h3>
                </div>

                <div class="p-4 space-y-4">
                  <!-- 总体统计卡片 -->
                  <div class="grid grid-cols-3 gap-3">
                    <div class="text-center p-3 rounded-lg" :style="{ background: 'var(--fill-light)' }">
                      <div class="text-2xl font-bold mb-1" :style="{ color: 'var(--text-primary)' }">{{ reservationStats.total }}</div>
                      <div class="text-xs" :style="{ color: 'var(--text-secondary)' }">总预约</div>
                    </div>
                    <div class="text-center p-3 rounded-lg bg-green-50">
                      <div class="text-2xl font-bold mb-1 text-green-600">{{ reservationStats.completed }}</div>
                      <div class="text-xs text-green-700">已完成</div>
                    </div>
                    <div class="text-center p-3 rounded-lg bg-orange-50">
                      <div class="text-2xl font-bold mb-1 text-orange-600">{{ reservationStats.pending }}</div>
                      <div class="text-xs text-orange-700">待处理</div>
                    </div>
                  </div>

                  <!-- 完成率进度条 -->
                  <div>
                    <div class="flex justify-between text-xs mb-2">
                      <span :style="{ color: 'var(--text-secondary)' }">本周完成率</span>
                      <span class="font-medium" :style="{ color: 'var(--text-primary)' }">{{ reservationStats.completionRate }}%</span>
                    </div>
                    <div class="w-full h-2 rounded-full overflow-hidden" :style="{ background: 'var(--fill-light)' }">
                      <div
                        class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all duration-500"
                        :style="{ width: `${reservationStats.completionRate}%` }"
                      ></div>
                    </div>
                  </div>

                  <!-- 状态分布 -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span class="text-sm" :style="{ color: 'var(--text-primary)' }">待通话</span>
                      </div>
                      <span class="text-sm font-medium text-indigo-600">{{ reservationStats.scheduled }}人</span>
                    </div>
                    <div class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-green-500"></div>
                        <span class="text-sm" :style="{ color: 'var(--text-primary)' }">已完成</span>
                      </div>
                      <span class="text-sm font-medium text-green-600">{{ reservationStats.completed }}人</span>
                    </div>
                    <div class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div class="flex items-center gap-2">
                        <div class="w-2 h-2 rounded-full bg-red-500"></div>
                        <span class="text-sm" :style="{ color: 'var(--text-primary)' }">未接听</span>
                      </div>
                      <span class="text-sm font-medium text-red-600">{{ reservationStats.missed }}人</span>
                    </div>
                  </div>

                  <!-- 今日预约列表 -->
                  <div>
                    <h4 class="text-sm font-medium mb-3" :style="{ color: 'var(--text-primary)' }">今日预约</h4>
                    <div class="space-y-2">
                      <div
                        v-for="reservation in todayReservations"
                        :key="reservation.id"
                        class="p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                        :style="{ borderColor: 'var(--border)' }"
                      >
                        <div class="flex items-center gap-3">
                          <img :src="reservation.avatar" class="w-10 h-10 rounded-full object-cover" alt="" />
                          <div class="flex-1">
                            <div class="flex items-center gap-2 mb-1">
                              <span class="font-medium text-sm" :style="{ color: 'var(--text-primary)' }">{{ reservation.name }}</span>
                              <span
                                class="px-2 py-0.5 text-[10px] font-medium rounded"
                                :class="getStatusBadgeClass(reservation.status)"
                              >
                                {{ reservation.statusText }}
                              </span>
                            </div>
                            <div class="flex items-center gap-3 text-xs" :style="{ color: 'var(--text-secondary)' }">
                              <span>{{ reservation.time }}</span>
                              <span>·</span>
                              <span>{{ reservation.coach }}</span>
                            </div>
                          </div>
                          <div class="flex items-center gap-1">
                            <button class="text-slate-400 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg transition-colors">
                              <Phone :size="14" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 预约用户列表表格 -->
              <div class="mt-6 border rounded-xl overflow-hidden" :style="{ borderColor: 'var(--border)', background: 'var(--card)' }">
                <div class="p-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
                  <div class="flex items-center justify-between">
                    <h4 class="font-semibold flex items-center gap-2" :style="{ color: 'var(--text-primary)' }">
                      <PhoneCall :size="18" :style="{ color: isBlackGold ? '#D4A84A' : '#4f46e5' }" />
                      预约用户列表
                    </h4>
                    <div class="flex items-center gap-3">
                      <div class="flex items-center gap-2 text-xs">
                        <span :style="{ color: 'var(--text-secondary)' }">共</span>
                        <span class="font-bold text-indigo-600">{{ reservationList.length }}</span>
                        <span :style="{ color: 'var(--text-secondary)' }">位预约用户</span>
                        <span v-if="activeTab !== '全部'" class="text-slate-400">
                          ，筛选结果 <span class="font-medium">{{ filteredReservationList.length }}</span> 位
                        </span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="px-2 py-1 bg-indigo-100 text-indigo-600 rounded text-xs">
                          待处理 {{ reservationList.filter(r => r.status === 'scheduled').length }}
                        </span>
                        <span class="px-2 py-1 bg-green-100 text-green-600 rounded text-xs">
                          已完成 {{ reservationList.filter(r => r.status === 'completed').length }}
                        </span>
                        <span class="px-2 py-1 bg-red-100 text-red-600 rounded text-xs">
                          未接听 {{ reservationList.filter(r => r.status === 'missed').length }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm">
                    <thead class="font-medium" :style="{
                      background: 'var(--fill-light)',
                      color: 'var(--text-secondary)'
                    }">
                      <tr>
                        <th class="px-6 py-3 w-72">用户资料</th>
                        <th class="px-6 py-3 w-24">预约时间</th>
                        <th class="px-6 py-3 w-28">跟进教练</th>
                        <th class="px-6 py-3 w-24">状态</th>
                        <th class="px-6 py-3 w-48">标签</th>
                        <th class="px-6 py-3 w-32">地区</th>
                        <th class="px-6 py-3 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y" :style="{ borderColor: 'var(--border-light)' }">
                      <tr
                        v-for="reservation in filteredReservationList"
                        :key="reservation.id"
                        class="hover:bg-slate-50 transition-colors"
                      >
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-3">
                            <img :src="reservation.avatar" class="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                            <div class="min-w-0 flex-1">
                              <div class="font-semibold text-slate-800 truncate">{{ reservation.name }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="font-medium" :style="{ color: 'var(--text-primary)' }">{{ reservation.time }}</div>
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-2">
                            <div :class="`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${reservation.coachAvatar}`">
                              {{ reservation.coach.charAt(0) }}
                            </div>
                            <span class="text-slate-600 truncate">{{ reservation.coach }}</span>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <span
                            class="px-2 py-1 text-xs font-medium rounded"
                            :class="getStatusBadgeClass(reservation.status)"
                          >
                            {{ reservation.statusText }}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <div class="flex gap-1 flex-wrap">
                            <span
                              v-for="(tag, index) in reservation.tags"
                              :key="index"
                              class="px-2 py-0.5 text-[10px] font-medium rounded whitespace-nowrap"
                              :class="tag === 'VIP' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-600'"
                            >
                              {{ tag }}
                            </span>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <span class="text-sm text-slate-600">{{ reservation.location }}</span>
                        </td>
                        <td class="px-6 py-4 text-right">
                          <div class="flex items-center justify-end gap-1">
                            <button
                              class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="拨打电话"
                            >
                              <Phone :size="16" />
                            </button>
                            <button
                              class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="查看详情"
                            >
                              <ChevronRight :size="16" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      <!-- 空状态 -->
                      <tr v-if="filteredReservationList.length === 0">
                        <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                          <PhoneCall :size="48" class="mx-auto mb-4 opacity-50" />
                          <p class="font-medium">暂无预约数据</p>
                          <p class="text-sm mt-1">{{ activeTab === '全部' ? '当前没有任何预约记录' : `当前没有${activeTab}的预约` }}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- 当前预警内容（财务预警） -->
          <div v-else-if="activeView === 'alerts' && alertSubTab === 'current'" class="p-4">
            <table class="w-full text-left text-sm">
              <thead class="font-medium sticky top-0 z-10" :style="{
                background: 'var(--fill-light)',
                color: 'var(--text-secondary)'
              }">
                <tr>
                  <th class="px-6 py-3">严重程度</th>
                  <th class="px-6 py-3">预警标题</th>
                  <th class="px-6 py-3">当前值</th>
                  <th class="px-6 py-3">阈值</th>
                  <th class="px-6 py-3">状态</th>
                  <th class="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="alert in alertList" :key="alert.id" class="hover:bg-slate-50 group">
                  <td class="px-6 py-4">
                    <span
                      class="px-2 py-1 text-xs font-medium rounded"
                      :class="alert.severity === 'critical' ? 'bg-red-100 text-red-800' : alert.severity === 'warning' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'"
                    >
                      {{ alert.severity === 'critical' ? '紧急' : alert.severity === 'warning' ? '重要' : '一般' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="font-bold text-slate-800">{{ alert.title }}</div>
                    <div class="text-xs text-slate-500 mt-1">{{ alert.description }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="font-bold" :class="alert.severity === 'critical' ? 'text-red-600' : alert.severity === 'warning' ? 'text-orange-600' : 'text-yellow-600'">
                      {{ alert.currentValue }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-slate-600">{{ alert.threshold }}</td>
                  <td class="px-6 py-4">
                    <span
                      class="px-2 py-1 text-xs font-medium rounded"
                      :class="alert.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'"
                    >
                      {{ alert.status === 'pending' ? '待处理' : '已处理' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button
                      v-if="alert.status === 'pending'"
                      @click="handleAlert(alert)"
                      class="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                    >
                      处理
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 事前预警内容（风险预测） -->
          <div v-else-if="activeView === 'alerts' && alertSubTab === 'predictive'" class="p-4">
            <div v-if="riskPredictions.length === 0" class="text-center py-12 text-slate-400">
              <ShieldAlert :size="48" class="mx-auto mb-4 opacity-50" />
              <p class="font-medium">暂无风险预测数据</p>
              <p class="text-sm mt-1">点击下方按钮刷新数据</p>
              <button
                @click="refreshRiskData"
                class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
              >
                刷新数据
              </button>
            </div>
            <div v-else>
              <!-- 风险趋势数据卡片 -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-3 text-white shadow-lg shadow-red-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-medium opacity-90">高风险用户</span>
                    <AlertOctagon :size="14" />
                  </div>
                  <div class="text-xl font-bold">{{ riskStats.high }}</div>
                  <div class="text-[10px] opacity-75">需立即干预</div>
                </div>
                <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-3 text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-medium opacity-90">中风险用户</span>
                    <AlertTriangle :size="14" />
                  </div>
                  <div class="text-xl font-bold">{{ riskStats.medium }}</div>
                  <div class="text-[10px] opacity-75">需关注跟进</div>
                </div>
                <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3 text-white shadow-lg shadow-green-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-medium opacity-90">低风险用户</span>
                    <ShieldCheck :size="14" />
                  </div>
                  <div class="text-xl font-bold">{{ riskStats.low }}</div>
                  <div class="text-[10px] opacity-75">状态良好</div>
                </div>
                <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg p-3 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-medium opacity-90">平均风险分</span>
                    <Activity :size="14" />
                  </div>
                  <div class="text-xl font-bold">{{ averageRiskScore }}</div>
                  <div class="text-[10px] opacity-75">综合评估</div>
                </div>
              </div>

              <!-- 风险分布图表 -->
              <div class="border rounded-lg p-4" :style="{ borderColor: 'var(--border)', background: 'var(--card)' }">
                <h4 class="text-sm font-semibold mb-3" :style="{ color: 'var(--text-primary)' }">风险等级分布</h4>
                  <div class="flex items-center justify-center">
                    <div class="relative w-32 h-32">
                      <svg class="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <!-- 背景圆 -->
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="transparent"
                          :style="{ stroke: 'var(--border)', strokeWidth: '3' }"
                        />
                        <!-- 高风险弧 -->
                        <circle
                          v-if="riskStats.high > 0"
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="transparent"
                          stroke="#ef4444"
                          stroke-width="3"
                          :stroke-dasharray="`${(riskStats.high / riskStats.total) * 100} 100`"
                          :stroke-dashoffset="0"
                        />
                        <!-- 中风险弧 -->
                        <circle
                          v-if="riskStats.medium > 0"
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="transparent"
                          stroke="#f97316"
                          stroke-width="3"
                          :stroke-dasharray="`${(riskStats.medium / riskStats.total) * 100} 100`"
                          :stroke-dashoffset="`${-(riskStats.high / riskStats.total) * 100}`"
                        />
                        <!-- 低风险弧 -->
                        <circle
                          v-if="riskStats.low > 0"
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="transparent"
                          stroke="#22c55e"
                          stroke-width="3"
                          :stroke-dasharray="`${(riskStats.low / riskStats.total) * 100} 100`"
                          :stroke-dashoffset="`${-((riskStats.high + riskStats.medium) / riskStats.total) * 100}`"
                        />
                      </svg>
                      <div class="absolute inset-0 flex items-center justify-center">
                        <div class="text-center">
                          <div class="text-2xl font-bold" :style="{ color: 'var(--text-primary)' }">{{ riskStats.total }}</div>
                          <div class="text-xs" :style="{ color: 'var(--text-secondary)' }">总人数</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="flex justify-center gap-4 mt-3">
                    <div class="flex items-center gap-1">
                      <div class="w-2 h-2 rounded-full bg-red-500"></div>
                      <span class="text-xs" :style="{ color: 'var(--text-secondary)' }">高风险 {{ riskPercentage.high }}%</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <div class="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span class="text-xs" :style="{ color: 'var(--text-secondary)' }">中风险 {{ riskPercentage.medium }}%</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <div class="w-2 h-2 rounded-full bg-green-500"></div>
                      <span class="text-xs" :style="{ color: 'var(--text-secondary)' }">低风险 {{ riskPercentage.low }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 历史对比数据 -->
              <div class="border rounded-lg p-4 mb-4 hover:shadow-md transition-all duration-300" :style="{ borderColor: 'var(--border)', background: 'var(--card)' }">
                <h4 class="text-sm font-semibold mb-3" :style="{ color: 'var(--text-primary)' }">风险趋势对比（本周 vs 上周）</h4>
                <div class="grid grid-cols-3 gap-3">
                  <div class="text-center p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div class="text-xs mb-2" :style="{ color: 'var(--text-secondary)' }">高风险</div>
                    <div class="flex items-center justify-center gap-2">
                      <span class="text-2xl font-bold text-red-600">{{ riskStats.high }}</span>
                      <div class="flex flex-col items-center">
                        <span class="text-xs text-green-600 flex items-center">
                          ↓2
                        </span>
                      </div>
                    </div>
                    <div class="text-[10px] mt-1" :style="{ color: 'var(--text-disabled)' }">上周: {{ riskStats.high + 2 }}</div>
                  </div>
                  <div class="text-center p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div class="text-xs mb-2" :style="{ color: 'var(--text-secondary)' }">中风险</div>
                    <div class="flex items-center justify-center gap-2">
                      <span class="text-2xl font-bold text-orange-600">{{ riskStats.medium }}</span>
                      <div class="flex flex-col items-center">
                        <span class="text-xs text-red-600 flex items-center">
                          ↑1
                        </span>
                      </div>
                    </div>
                    <div class="text-[10px] mt-1" :style="{ color: 'var(--text-disabled)' }">上周: {{ riskStats.medium - 1 }}</div>
                  </div>
                  <div class="text-center p-3 rounded-lg hover:bg-slate-50 transition-colors">
                    <div class="text-xs mb-2" :style="{ color: 'var(--text-secondary)' }">平均分</div>
                    <div class="flex items-center justify-center gap-2">
                      <span class="text-2xl font-bold" :style="{ color: 'var(--text-primary)' }">{{ averageRiskScore }}</span>
                      <div class="flex flex-col items-center">
                        <span class="text-xs text-green-600 flex items-center">
                          ↓3
                        </span>
                      </div>
                    </div>
                    <div class="text-[10px] mt-1" :style="{ color: 'var(--text-disabled)' }">上周: {{ averageRiskScore + 3 }}</div>
                  </div>
                </div>
              </div>

              <!-- 风险用户列表 -->
              <div class="border rounded-lg overflow-hidden hover:shadow-md transition-all duration-300" :style="{ borderColor: 'var(--border)', background: 'var(--card)' }">
                <div class="p-3 border-b" :style="{ borderColor: 'var(--border-light)' }">
                  <h4 class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">风险用户详情</h4>
                </div>
                <div class="divide-y" :style="{ borderColor: 'var(--border-light)' }">
                  <div
                    v-for="prediction in riskPredictions.slice(0, 5)"
                    :key="prediction.id"
                    class="p-3 hover:bg-slate-50 transition-all duration-200 cursor-pointer hover:shadow-sm hover:scale-[1.01]"
                    @click="viewRiskDetail(prediction)"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        :class="getRiskLevelBgClass(prediction.riskLevel)"
                      >
                        <component :is="getRiskLevelIcon(prediction.riskLevel)" :size="14" :class="getRiskLevelTextClass(prediction.riskLevel)" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <span
                            class="px-1.5 py-0.5 text-[10px] font-medium rounded"
                            :class="getRiskLevelBadgeClass(prediction.riskLevel)"
                          >
                            {{ getRiskLevelLabel(prediction.riskLevel) }}
                          </span>
                          <span class="text-sm font-medium truncate" :style="{ color: 'var(--text-primary)' }">
                            {{ prediction.userName }}
                          </span>
                          <span class="text-xs" :style="{ color: 'var(--text-secondary)' }">({{ prediction.userAge }}岁)</span>
                        </div>
                        <div class="flex items-center gap-3 text-xs">
                          <span :style="{ color: 'var(--text-secondary)' }">风险分: <span class="font-medium" :class="getRiskScoreColorClass(prediction.riskLevel)">{{ prediction.riskScore }}</span></span>
                          <span :style="{ color: 'var(--text-secondary)' }">触发: <span class="font-medium">{{ prediction.triggeredFactors.length }}项</span></span>
                        </div>
                      </div>
                      <div class="flex items-center gap-2 flex-shrink-0">
                        <button
                          v-if="prediction.riskLevel === 'high'"
                          @click.stop="handleEmergencyContact(prediction.userId)"
                          class="px-2 py-1 text-[10px] font-medium rounded bg-red-100 text-red-600 hover:bg-red-200 transition-all hover:scale-105"
                        >
                          紧急联系
                        </button>
                        <button class="text-slate-400 hover:text-indigo-600 transition-colors">
                          <ChevronRight :size="16" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          <!-- 积分排行榜内容 -->
          <div v-else-if="activeView === 'points'" class="p-4">
            <PointsRankingBoard />
          </div>

          <!-- 其他视图的表格内容 -->
          <div v-else class="p-4">
            <!-- 统计信息栏 -->
            <div v-if="activeView === 'allocation'" class="mb-4 flex items-center justify-between">
              <div class="flex items-center gap-2 text-sm">
                <span class="font-medium" :style="{ color: 'var(--text-primary)' }">
                  共 <span class="text-orange-500 font-bold">{{ allocationList.length }}</span> 位等待分配用户
                </span>
                <span v-if="searchQuery" class="text-slate-400">
                  ，筛选结果 <span class="font-medium">{{ filteredAllocationList.length }}</span> 位
                </span>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <span class="px-2 py-1 bg-red-100 text-red-600 rounded">
                  {{ allocationList.filter(u => u.isOverdue).length }} 超时
                </span>
                <span class="px-2 py-1 bg-blue-100 text-blue-600 rounded">
                  {{ allocationList.filter(u => u.tags.includes('vip')).length }} VIP
                </span>
                <span class="px-2 py-1 bg-green-100 text-green-600 rounded">
                  {{ allocationList.filter(u => u.tags.includes('老客户推荐')).length }} 转介绍
                </span>
              </div>
            </div>

            <table class="w-full text-left text-sm table-fixed">
            <thead class="font-medium sticky top-0 z-10" :style="{
              background: 'var(--fill-light)',
              color: 'var(--text-secondary)'
            }">
              <tr>
                <!-- Coach Table Header -->
                <template v-if="activeView === 'coaches'">
                  <th class="px-6 py-3 w-64">教练姓名</th>
                  <th class="px-6 py-3 w-36">专业类型</th>
                  <th class="px-6 py-3 w-32">管理用户</th>
                  <th class="px-6 py-3 w-32">待出报告</th>
                  <th class="px-6 py-3 w-48">负载状态</th>
                </template>

                <!-- User Tables Header -->
                <template v-else>
                  <th v-if="activeView === 'allocation'" class="px-4 py-3 w-14 text-center">
                    <input
                      type="checkbox"
                      :checked="isAllFilteredSelected"
                      :indeterminate="isSomeFilteredSelected && !isAllFilteredSelected"
                      @change="toggleSelectAll"
                      class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th class="px-6 py-3 w-64">用户资料</th>
                  <th v-if="activeView === 'reservation'" class="px-6 py-3 w-40">预约时间</th>
                  <th v-if="activeView === 'reservation'" class="px-6 py-3 w-32">跟进教练</th>
                  <th v-if="activeView === 'allocation'" class="px-6 py-3 w-28">等待时长</th>
                  <th v-if="activeView === 'allocation'" class="px-6 py-3 w-36">来源/偏好</th>
                  <th class="px-6 py-3 w-32 text-right">
                    <div v-if="activeView === 'allocation' && selectedUsersForBatch.length > 0" class="flex items-center justify-end gap-2">
                      <span class="text-xs text-slate-500">已选 {{ selectedUsersForBatch.length }} 人</span>
                      <button
                        @click="openBatchAssignModal"
                        class="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all hover:scale-105"
                      >
                        批量分配
                      </button>
                    </div>
                    <span v-else>操作</span>
                  </th>
                </template>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <!-- Coach Rows -->
              <template v-if="activeView === 'coaches'">
                <tr v-for="coach in coachList" :key="coach.id" class="hover:bg-slate-50 group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center font-bold text-indigo-700 shadow-sm border border-indigo-100 flex-shrink-0">
                        {{ coach.name.charAt(0) }}
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="font-bold text-slate-800 truncate">{{ coach.name }}</div>
                        <div class="text-xs text-slate-400">
                          在线 ·
                          <span :class="coach.load/coach.maxLoad > 0.8 ? 'text-red-500 font-medium' : 'text-emerald-500 font-medium'">
                            {{ coach.load/coach.maxLoad > 0.8 ? '高负载' : '正常' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span class="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200 whitespace-nowrap">
                      {{ coach.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <Users :size="14" class="text-slate-400" />
                      <span class="font-bold text-slate-700">{{ coach.activeUsers }}</span>
                      <span class="text-xs text-slate-400">人</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <span :class="`font-bold ${coach.reportUsers > 3 ? 'text-orange-600' : 'text-slate-600'}`">
                        {{ coach.reportUsers }}
                      </span>
                      <span class="text-xs text-slate-400">份</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="flex-1 min-w-0">
                        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            :class="`h-full rounded-full transition-all ${coach.load/coach.maxLoad > 0.8 ? 'bg-red-500' : 'bg-emerald-500'}`"
                            :style="{ width: `${(coach.load/coach.maxLoad)*100}%` }"
                          ></div>
                        </div>
                      </div>
                      <span :class="`text-xs font-bold whitespace-nowrap ${coach.load/coach.maxLoad > 0.8 ? 'text-red-600' : 'text-slate-600'}`">
                        {{ coach.load }}/{{ coach.maxLoad }}
                      </span>
                    </div>
                  </td>
                </tr>
              </template>

              <!-- Reservation Rows -->
              <template v-else-if="activeView === 'reservation'">
                <tr v-for="item in reservationList" :key="item.id" class="hover:bg-slate-50 group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <img :src="item.avatar" class="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                      <div class="min-w-0 flex-1">
                        <div class="font-bold text-slate-800 truncate">{{ item.name }}</div>
                        <div class="text-xs text-slate-400 truncate">{{ item.location }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="font-medium text-slate-700 whitespace-nowrap">{{ item.time }}</span>
                      <span :class="`text-xs ${item.status === 'scheduled' ? 'text-indigo-500' : 'text-slate-400'}`">{{ item.statusText }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <div :class="`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${item.coachAvatar}`">
                        {{ item.coach.charAt(0) }}
                      </div>
                      <span class="text-slate-600 truncate">{{ item.coach }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right whitespace-nowrap">
                    <button class="text-slate-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-full transition-colors">
                      <Phone :size="16" />
                    </button>
                    <button @click="$emit('navigate', 'client-profile', item.id)" class="text-slate-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-full transition-colors">
                      <ChevronRight :size="16" />
                    </button>
                  </td>
                </tr>
              </template>

              <!-- Allocation Rows -->
              <template v-else>
                <tr v-for="item in filteredAllocationList" :key="item.id" class="hover:bg-slate-50 group">
                  <td class="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      v-model="selectedUsersForBatch"
                      :value="item.id"
                      class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <img :src="item.avatar" class="w-10 h-10 rounded-full object-cover flex-shrink-0" alt="" />
                      <div class="min-w-0 flex-1">
                        <div class="font-bold text-slate-800 truncate">{{ item.name }}</div>
                        <div class="flex gap-1 mt-1 flex-wrap">
                          <span
                            v-for="(t, i) in item.tags"
                            :key="i"
                            class="text-[10px] bg-indigo-50 text-indigo-600 px-1 rounded whitespace-nowrap"
                          >
                            {{ t }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span :class="`font-bold ${item.isOverdue ? 'text-red-500' : 'text-orange-500'}`">{{ item.waitTime }}</span>
                    <span v-if="item.isOverdue" class="text-xs text-red-400 block">已超时</span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-slate-600">{{ item.prefer }}</div>
                    <div class="text-xs text-slate-400">{{ item.source }}</div>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button
                      @click="handleSingleAssign(item.id)"
                      class="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all hover:scale-105"
                    >
                      立即分配
                    </button>
                  </td>
                </tr>

                <!-- 空状态 -->
                <tr v-if="filteredAllocationList.length === 0">
                  <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                    <Users :size="48" class="mx-auto mb-4 opacity-50" />
                    <p class="font-medium">暂无等待分配的用户</p>
                    <p class="text-sm mt-1">{{ searchQuery ? '尝试其他搜索关键词' : '当前没有待分配的用户' }}</p>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 用户与教练分配弹窗 -->
    <Modal
      v-model:show="showAssignModal"
      :title="batchAssignMode ? '批量分配教练' : '分配教练'"
      size="lg"
    >
      <div class="space-y-4">
        <!-- 提示信息 -->
        <div v-if="batchAssignMode" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center gap-2 text-blue-800">
            <Users :size="20" />
            <span class="font-medium">已选择 {{ selectedUsersForBatch.length }} 位用户</span>
          </div>
        </div>

        <!-- 教练列表 -->
        <div class="space-y-3">
          <h4 class="text-sm font-semibold text-slate-700">选择教练</h4>
          <div
            v-for="coach in coachList"
            :key="coach.id"
            class="border rounded-lg p-4 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer"
            :class="{
              'border-red-300 bg-red-50': coach.load >= coach.maxLoad,
              'border-slate-200': coach.load < coach.maxLoad
            }"
            @click="confirmAssignCoach(coach.id)"
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="font-semibold text-slate-900">{{ coach.name }}</span>
                  <span
                    class="px-2 py-0.5 text-xs font-medium rounded"
                    :class="coach.color"
                  >
                    {{ coach.type }}
                  </span>
                </div>
                <div class="flex items-center gap-4 text-sm text-slate-600">
                  <span>当前负载: {{ coach.load }}/{{ coach.maxLoad }}</span>
                  <span>活跃用户: {{ coach.activeUsers }}</span>
                  <span>汇报用户: {{ coach.reportUsers }}</span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <!-- 负载指示器 -->
                <div class="flex items-center gap-1">
                  <div
                    v-for="i in coach.maxLoad"
                    :key="i"
                    class="w-2 h-6 rounded-sm"
                    :class="i <= coach.load ? 'bg-current' : 'bg-slate-200'"
                    :style="{ color: coach.load >= coach.maxLoad ? '#ef4444' : '#6366f1' }"
                  ></div>
                </div>
                <ChevronRight :size="20" class="text-slate-400" />
              </div>
            </div>
            <!-- 满载提示 -->
            <div v-if="coach.load >= coach.maxLoad" class="mt-3 text-sm text-red-600 font-medium">
              <AlertTriangle :size="16" class="inline mr-1" />
              教练已满载，暂时无法接收新用户
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <button
          @click="showAssignModal = false"
          class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
        >
          取消
        </button>
      </template>
    </Modal>

    <!-- 风险预测详情弹窗 -->
    <Modal
      v-model:show="showRiskDetailModal"
      title="风险预测详情"
      size="xl"
    >
      <RiskPredictionPanel
        v-if="selectedRiskPrediction"
        :prediction="selectedRiskPrediction"
        @emergency-contact="handleEmergencyContact"
        @schedule-check="handleScheduleCheck"
        @view-details="handleViewDetails"
      />
      <template #footer>
        <button
          @click="showRiskDetailModal = false"
          class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
        >
          关闭
        </button>
      </template>
    </Modal>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PointsRankingBoard from '../components/PointsRankingBoard.vue'
import {
  Users,
  PhoneCall,
  TrendingUp,
  UserPlus,
  Phone,
  Search,
  X,
  ChevronRight,
  BarChart,
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Activity,
  ShieldAlert,
  FileText,
  Calendar,
  Clock,
  Award
} from 'lucide-vue-next'
import Modal from '../components/shared/Modal.vue'
import { useTheme } from '../composables/useTheme'
import { useRiskPrediction } from '../composables/useRiskPrediction'
import { usePointsSystem } from '../composables/usePointsSystem'
import Toast from '../components/shared/Toast.vue'
import RiskPredictionPanel from '../components/RiskPredictionPanel.vue'
import { useToast } from '../composables/useToast'

// 主题相关
const { currentTheme } = useTheme()

// 主题样式计算属性
const isBlackGold = computed(() => currentTheme.value === 'black-gold')

// 风险预测
const { getRiskStats, refreshPredictions, riskPredictions } = useRiskPrediction()
const riskStats = computed(() => getRiskStats.value)

// 积分系统
const { initUserPoints, pointsData, getTotalPoints } = usePointsSystem()

// 计算平均风险分数
const averageRiskScore = computed(() => {
  if (riskPredictions.value.length === 0) return 0
  const total = riskPredictions.value.reduce((sum, p) => sum + p.riskScore, 0)
  return Math.round(total / riskPredictions.value.length)
})

// 计算风险百分比
const riskPercentage = computed(() => {
  const total = riskStats.value.total || 1
  return {
    high: Math.round((riskStats.value.high / total) * 100),
    medium: Math.round((riskStats.value.medium / total) * 100),
    low: Math.round((riskStats.value.low / total) * 100)
  }
})

// 初始化
onMounted(async () => {
  await refreshPredictions()

  // 初始化积分系统mock数据
  initMockPointsData()
})

// 初始化积分系统mock数据
const initMockPointsData = () => {
  // 为mock用户创建积分数据
  const mockUsers = [
    { id: '1', name: '王磊', avatarColor: 'bg-indigo-500', department: '市场部', community: '糖尿病管理A组' },
    { id: '2', name: '李淑芬', avatarColor: 'bg-pink-500', department: '客服部', community: '减脂塑形B组' },
    { id: '3', name: '张建国', avatarColor: 'bg-blue-500', department: '市场部', community: '慢病康复C组' },
    { id: '4', name: '陈静', avatarColor: 'bg-purple-500', department: '教练部', community: '糖尿病管理A组' },
    { id: '5', name: '刘伟', avatarColor: 'bg-green-500', department: '客服部', community: '减脂塑形B组' },
    { id: '6', name: '赵敏', avatarColor: 'bg-orange-500', department: '运营部', community: '减脂塑形B组' },
    { id: '7', name: '孙强', avatarColor: 'bg-teal-500', department: '教练部', community: '慢病康复C组' },
    { id: '8', name: '周梅', avatarColor: 'bg-red-500', department: '市场部', community: '糖尿病管理A组' },
  ]

  mockUsers.forEach(user => {
    initUserPoints(user.id, user.name, user.avatarColor)

    // 设置一些初始积分
    const userPoints = pointsData.value[user.id]
    if (userPoints) {
      // 模拟一些积分数据
      userPoints.pointDetails.courseReading = Math.floor(Math.random() * 5) * 10
      userPoints.pointDetails.mealUpload = Math.floor(Math.random() * 20) * 5
      userPoints.pointDetails.healthCheckin = Math.floor(Math.random() * 30) * 3
      userPoints.pointDetails.obstacleReport = Math.floor(Math.random() * 3) * 8
      userPoints.pointDetails.liveWatching = Math.floor(Math.random() * 3) * 15
      userPoints.pointDetails.weightLossResult = Math.floor(Math.random() * 3) * 30
      userPoints.totalPoints = getTotalPoints(userPoints.pointDetails)
      userPoints.weeklyPoints = Math.floor(userPoints.totalPoints * 0.3)

      // 设置部门和社群
      userPoints.department = user.department
      userPoints.community = user.community
    }
  })
}

// 风险预测相关函数
const refreshRiskData = async () => {
  await refreshPredictions()
  toast.success('刷新成功', '风险预测数据已更新')
}

const getRiskLevelIcon = (level: string) => {
  const icons = {
    high: AlertOctagon,
    medium: AlertTriangle,
    low: ShieldCheck
  }
  return icons[level as keyof typeof icons] || AlertTriangle
}

const getRiskLevelLabel = (level: string) => {
  const labels = {
    high: '高风险',
    medium: '中风险',
    low: '低风险'
  }
  return labels[level as keyof typeof labels] || '未知'
}

const getRiskLevelBgClass = (level: string) => {
  const classes = {
    high: 'bg-red-100',
    medium: 'bg-orange-100',
    low: 'bg-green-100'
  }
  return classes[level as keyof typeof classes] || 'bg-slate-100'
}

const getRiskLevelTextClass = (level: string) => {
  const classes = {
    high: 'text-red-600',
    medium: 'text-orange-600',
    low: 'text-green-600'
  }
  return classes[level as keyof typeof classes] || 'text-slate-600'
}

const getRiskLevelBadgeClass = (level: string) => {
  const classes = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-orange-100 text-orange-800',
    low: 'bg-green-100 text-green-800'
  }
  return classes[level as keyof typeof classes] || 'bg-slate-100 text-slate-800'
}

const getRiskScoreColorClass = (level: string) => {
  const classes = {
    high: 'text-red-600',
    medium: 'text-orange-600',
    low: 'text-green-600'
  }
  return classes[level as keyof typeof classes] || 'text-slate-600'
}

const getFactorBadgeClass = (severity: string) => {
  const classes = {
    critical: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-slate-100 text-slate-800'
  }
  return classes[severity as keyof typeof classes] || 'bg-slate-100 text-slate-800'
}

const formatTime = (isoString: string) => {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) {
    return `${diffMins}分钟前`
  } else if (diffHours < 24) {
    return `${diffHours}小时前`
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const viewRiskDetail = (prediction: any) => {
  selectedRiskPrediction.value = prediction
  showRiskDetailModal.value = true
}

const handleEmergencyContact = (userId: string) => {
  const prediction = riskPredictions.value.find(p => p.userId === userId)
  if (prediction) {
    toast.success('已发起紧急联系', `正在联系 ${prediction.userName} 的紧急联系人`)
  }
}

const handleScheduleCheck = (userId: string) => {
  const prediction = riskPredictions.value.find(p => p.userId === userId)
  if (prediction) {
    toast.success('已安排检查', `已为 ${prediction.userName} 创建健康检查任务`)
  }
}

const handleViewDetails = (userId: string) => {
  toast.info('查看详情', `跳转到用户 ${userId} 的详细档案`)
}

const handleAlert = (alert: any) => {
  alert.status = 'resolved'
  toast.success('处理成功', '预警已标记为已处理')
}

// 风险预测详情弹窗状态
const showRiskDetailModal = ref(false)
const selectedRiskPrediction = ref<any>(null)

// Props
interface SalesMonitorProps {
  onNavigate?: (view: string, clientId?: string) => void
}

defineProps<SalesMonitorProps>()

const emit = defineEmits<{
  navigate: [view: string, clientId?: string]
}>()

// State
const activeTab = ref('全部')
const activeView = ref<'reservation' | 'allocation' | 'coaches' | 'alerts' | 'points'>('reservation')
const alertSubTab = ref<'current' | 'predictive'>('current') // 预警中心子标签

// 路由
const route = useRoute()
const router = useRouter()

// 监听路由 query 参数来切换 tab
watch(() => route.query.tab, (newTab) => {
  if (newTab === 'alerts') {
    activeView.value = 'alerts'
  } else if (newTab === 'points') {
    activeView.value = 'points'
  } else if (newTab === 'reservation') {
    activeView.value = 'reservation'
  } else if (newTab === 'allocation') {
    activeView.value = 'allocation'
  } else if (newTab === 'coaches') {
    activeView.value = 'coaches'
  }
}, { immediate: true })

// 切换 tab 的方法
const switchView = (view: 'reservation' | 'allocation' | 'coaches' | 'alerts' | 'points') => {
  activeView.value = view
  // 更新路由 query 参数
  router.push({ path: '/sales-monitor', query: { tab: view } })
}
const showAssignModal = ref(false)
const showAddReservationModal = ref(false)
const selectedUserForAssign = ref<string | null>(null)
const searchQuery = ref('')

// 批量分配相关状态
const selectedUsersForBatch = ref<string[]>([])
const selectAllUsers = ref(false)
const batchAssignMode = ref(false)

// Toast
const toast = useToast()

// 预约统计数据
const reservationStats = computed(() => {
  const total = reservationList.value.length
  const completed = reservationList.value.filter(r => r.status === 'completed').length
  const missed = reservationList.value.filter(r => r.status === 'missed').length
  const scheduled = reservationList.value.filter(r => r.status === 'scheduled').length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    total,
    completed,
    missed,
    scheduled,
    pending: scheduled,
    missedCount: missed,
    completionRate
  }
})

// 今日预约列表
const todayReservations = computed(() => {
  // 显示待通话和已完成的预约，最多5个
  return reservationList.value
    .filter(r => r.status === 'scheduled' || r.status === 'completed')
    .slice(0, 5)
})

// 过滤后的等待分配用户列表
const filteredAllocationList = computed(() => {
  let list = allocationList.value

  // 根据搜索关键词过滤
  if (searchQuery.value.trim()) {
    const keyword = searchQuery.value.toLowerCase().trim()
    list = list.filter(item =>
      item.name.toLowerCase().includes(keyword) ||
      item.id.toLowerCase().includes(keyword) ||
      item.location.toLowerCase().includes(keyword) ||
      item.prefer.toLowerCase().includes(keyword) ||
      item.source.toLowerCase().includes(keyword) ||
      item.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }

  return list
})

// 判断是否所有过滤后的用户都被选中
const isAllFilteredSelected = computed(() => {
  if (filteredAllocationList.value.length === 0) return false
  return filteredAllocationList.value.every(item =>
    selectedUsersForBatch.value.includes(item.id)
  )
})

// 判断是否部分选中
const isSomeFilteredSelected = computed(() => {
  return filteredAllocationList.value.some(item =>
    selectedUsersForBatch.value.includes(item.id)
  )
})

// 根据标签页过滤预约列表
const filteredReservationList = computed(() => {
  let list = reservationList.value

  // 根据activeTab过滤
  if (activeTab.value === '待处理') {
    list = list.filter(item => item.status === 'scheduled')
  } else if (activeTab.value === '已逾期') {
    list = list.filter(item => item.status === 'missed')
  }
  // '全部'显示所有

  // 根据搜索关键词过滤
  if (searchQuery.value.trim()) {
    const keyword = searchQuery.value.toLowerCase().trim()
    list = list.filter(item =>
      item.name.toLowerCase().includes(keyword) ||
      item.id.toLowerCase().includes(keyword) ||
      item.location.toLowerCase().includes(keyword) ||
      item.coach.toLowerCase().includes(keyword) ||
      item.tags.some(tag => tag.toLowerCase().includes(keyword))
    )
  }

  return list
})

// 周日历数据
const weekDays = ref([
  {
    label: '周一',
    date: '3/4',
    slots: [
      { time: '09:00', status: 'booked', count: 1 },
      { time: '10:00', status: 'booked', count: 2 },
      { time: '11:00', status: 'available', count: 0 },
      { time: '14:00', status: 'available', count: 0 },
      { time: '15:00', status: 'expired', count: 0 }
    ]
  },
  {
    label: '周二',
    date: '3/5',
    slots: [
      { time: '09:00', status: 'available', count: 0 },
      { time: '10:00', status: 'booked', count: 1 },
      { time: '11:00', status: 'booked', count: 1 },
      { time: '14:00', status: 'available', count: 0 },
      { time: '15:00', status: 'available', count: 0 }
    ]
  },
  {
    label: '周三',
    date: '3/6',
    slots: [
      { time: '09:00', status: 'booked', count: 2 },
      { time: '10:00', status: 'available', count: 0 },
      { time: '11:00', status: 'available', count: 0 },
      { time: '14:00', status: 'booked', count: 1 },
      { time: '15:00', status: 'booked', count: 1 }
    ]
  },
  {
    label: '周四',
    date: '3/7',
    slots: [
      { time: '09:00', status: 'available', count: 0 },
      { time: '10:00', status: 'available', count: 0 },
      { time: '11:00', status: 'booked', count: 1 },
      { time: '14:00', status: 'available', count: 0 },
      { time: '15:00', status: 'available', count: 0 }
    ]
  },
  {
    label: '周五',
    date: '3/8',
    slots: [
      { time: '09:00', status: 'booked', count: 1 },
      { time: '10:00', status: 'available', count: 0 },
      { time: '11:00', status: 'available', count: 0 },
      { time: '14:00', status: 'booked', count: 2 },
      { time: '15:00', status: 'available', count: 0 }
    ]
  },
  {
    label: '周六',
    date: '3/9',
    slots: [
      { time: '09:00', status: 'available', count: 0 },
      { time: '10:00', status: 'booked', count: 2 },
      { time: '11:00', status: 'booked', count: 2 },
      { time: '14:00', status: 'booked', count: 1 },
      { time: '15:00', status: 'available', count: 0 }
    ]
  },
  {
    label: '周日',
    date: '3/10',
    slots: [
      { time: '09:00', status: 'available', count: 0 },
      { time: '10:00', status: 'available', count: 0 },
      { time: '11:00', status: 'booked', count: 1 },
      { time: '14:00', status: 'available', count: 0 },
      { time: '15:00', status: 'available', count: 0 }
    ]
  }
])

// Form data
const newReservation = reactive({
  name: '',
  phone: '',
  location: '',
  time: '',
  coachId: '',
  tags: [] as string[],
  notes: ''
})

// Data
const reservationList = ref([
  {
    id: 'r1',
    name: '王芳 (Wang Fang)',
    location: '上海',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'scheduled',
    statusText: '待通话',
    time: '14:00',
    coach: '李教练',
    coachAvatar: 'bg-indigo-100 text-indigo-600',
    tags: ['高意向', '减重']
  },
  {
    id: 'r2',
    name: '张伟 (Zhang Wei)',
    location: '北京',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'completed',
    statusText: '已完成',
    time: '10:30',
    coach: '张教练',
    coachAvatar: 'bg-emerald-100 text-emerald-600',
    tags: ['已支付']
  },
  {
    id: 'r3',
    name: '刘强 (Liu Qiang)',
    location: '广州',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'missed',
    statusText: '未接听',
    time: '09:15',
    coach: '王教练',
    coachAvatar: 'bg-emerald-100 text-emerald-600',
    tags: ['需回访']
  },
  {
    id: 'r4',
    name: '陈静 (Chen Jing)',
    location: '深圳',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'scheduled',
    statusText: '待通话',
    time: '15:30',
    coach: '李教练',
    coachAvatar: 'bg-indigo-100 text-indigo-600',
    tags: ['VIP', '产后修复']
  },
  {
    id: 'r5',
    name: '赵敏 (Zhao Min)',
    location: '杭州',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'completed',
    statusText: '已完成',
    time: '11:00',
    coach: '张教练',
    coachAvatar: 'bg-emerald-100 text-emerald-600',
    tags: ['增肌', '高意向']
  },
  {
    id: 'r6',
    name: '孙丽 (Sun Li)',
    location: '成都',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'missed',
    statusText: '未接听',
    time: '08:45',
    coach: '王教练',
    coachAvatar: 'bg-emerald-100 text-emerald-600',
    tags: ['需回访', '紧急']
  },
  {
    id: 'r7',
    name: '周杰 (Zhou Jie)',
    location: '上海',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'scheduled',
    statusText: '待通话',
    time: '16:00',
    coach: '李教练',
    coachAvatar: 'bg-indigo-100 text-indigo-600',
    tags: ['力量训练']
  },
  {
    id: 'r8',
    name: '吴婷 (Wu Ting)',
    location: '北京',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'completed',
    statusText: '已完成',
    time: '13:30',
    coach: '张教练',
    coachAvatar: 'bg-emerald-100 text-emerald-600',
    tags: ['瑜伽', '已支付']
  },
  {
    id: 'r9',
    name: '郑强 (Zheng Qiang)',
    location: '广州',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'scheduled',
    statusText: '待通话',
    time: '17:00',
    coach: '王教练',
    coachAvatar: 'bg-emerald-100 text-emerald-600',
    tags: ['VIP', '综合训练']
  },
  {
    id: 'r10',
    name: '黄娜 (Huang Na)',
    location: '深圳',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'missed',
    statusText: '未接听',
    time: '09:00',
    coach: '李教练',
    coachAvatar: 'bg-indigo-100 text-indigo-600',
    tags: ['需回访', '多次未接']
  },
  {
    id: 'r11',
    name: '林芳 (Lin Fang)',
    location: '杭州',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'completed',
    statusText: '已完成',
    time: '10:00',
    coach: '张教练',
    coachAvatar: 'bg-emerald-100 text-emerald-600',
    tags: ['普拉提', '高意向']
  },
  {
    id: 'r12',
    name: '徐强 (Xu Qiang)',
    location: '成都',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'scheduled',
    statusText: '待通话',
    time: '14:30',
    coach: '王教练',
    coachAvatar: 'bg-emerald-100 text-emerald-600',
    tags: ['增肌训练']
  },
  {
    id: 'r13',
    name: '马丽 (Ma Li)',
    location: '上海',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'completed',
    statusText: '已完成',
    time: '11:30',
    coach: '李教练',
    coachAvatar: 'bg-indigo-100 text-indigo-600',
    tags: ['产后修复', '已支付']
  },
  {
    id: 'r14',
    name: '郭敏 (Guo Min)',
    location: '北京',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'missed',
    statusText: '未接听',
    time: '08:30',
    coach: '张教练',
    coachAvatar: 'bg-emerald-100 text-emerald-600',
    tags: ['需回访', '紧急']
  },
  {
    id: 'r15',
    name: '梁芳 (Liang Fang)',
    location: '广州',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'scheduled',
    statusText: '待通话',
    time: '15:00',
    coach: '王教练',
    coachAvatar: 'bg-emerald-100 text-emerald-600',
    tags: ['VIP', '瑜伽拉伸']
  },
  {
    id: 'r16',
    name: '罗强 (Luo Qiang)',
    location: '深圳',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'completed',
    statusText: '已完成',
    time: '12:00',
    coach: '李教练',
    coachAvatar: 'bg-indigo-100 text-indigo-600',
    tags: ['力量训练', '已支付']
  },
  {
    id: 'r17',
    name: '高丽 (Gao Li)',
    location: '杭州',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'scheduled',
    statusText: '待通话',
    time: '16:30',
    coach: '张教练',
    coachAvatar: 'bg-emerald-100 text-emerald-600',
    tags: ['减脂塑形']
  },
  {
    id: 'r18',
    name: '谢强 (Xie Qiang)',
    location: '成都',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100&h=100',
    status: 'missed',
    statusText: '未接听',
    time: '09:30',
    coach: '王教练',
    coachAvatar: 'bg-emerald-100 text-emerald-600',
    tags: ['需回访', '多次未接']
  }
])

const allocationList = ref([
  {
    id: 'a1',
    name: '陈静 (Chen Jing)',
    location: '深圳',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100',
    waitTime: '35分钟',
    isOverdue: true,
    source: '小程序',
    prefer: '减重/塑形',
    tags: ['vip']
  },
  {
    id: 'a2',
    name: '赵强 (Zhao Qiang)',
    location: '成都',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100',
    waitTime: '12分钟',
    isOverdue: false,
    source: '活动页',
    prefer: '增肌',
    tags: []
  },
  {
    id: 'a3',
    name: '周梅 (Zhou Mei)',
    location: '杭州',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100',
    waitTime: '5分钟',
    isOverdue: false,
    source: '转介绍',
    prefer: '产后恢复',
    tags: ['老客户推荐']
  },
  {
    id: 'a4',
    name: '李娜 (Li Na)',
    location: '北京',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100',
    waitTime: '28分钟',
    isOverdue: false,
    source: '小程序',
    prefer: '瑜伽/塑形',
    tags: ['新客户']
  },
  {
    id: 'a5',
    name: '王伟 (Wang Wei)',
    location: '上海',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
    waitTime: '42分钟',
    isOverdue: true,
    source: '线下活动',
    prefer: '力量训练',
    tags: ['vip', '重点客户']
  },
  {
    id: 'a6',
    name: '刘芳 (Liu Fang)',
    location: '广州',
    avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&q=80&w=100&h=100',
    waitTime: '18分钟',
    isOverdue: false,
    source: '转介绍',
    prefer: '康复训练',
    tags: ['老客户推荐']
  },
  {
    id: 'a7',
    name: '张敏 (Zhang Min)',
    location: '深圳',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100&h=100',
    waitTime: '8分钟',
    isOverdue: false,
    source: '小程序',
    prefer: '减脂/塑形',
    tags: []
  },
  {
    id: 'a8',
    name: '孙丽 (Sun Li)',
    location: '杭州',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100',
    waitTime: '55分钟',
    isOverdue: true,
    source: '线上推广',
    prefer: '瑜伽/冥想',
    tags: ['vip']
  },
  {
    id: 'a9',
    name: '周杰 (Zhou Jie)',
    location: '成都',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100',
    waitTime: '3分钟',
    isOverdue: false,
    source: '转介绍',
    prefer: '增肌训练',
    tags: ['健身达人']
  },
  {
    id: 'a10',
    name: '吴婷 (Wu Ting)',
    location: '北京',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=100&h=100',
    waitTime: '22分钟',
    isOverdue: false,
    source: '小程序',
    prefer: '产后修复',
    tags: ['新客户']
  },
  {
    id: 'a11',
    name: '郑强 (Zheng Qiang)',
    location: '上海',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100&h=100',
    waitTime: '15分钟',
    isOverdue: false,
    source: '线下门店',
    prefer: '综合训练',
    tags: []
  },
  {
    id: 'a12',
    name: '黄敏 (Huang Min)',
    location: '广州',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&q=80&w=100&h=100',
    waitTime: '38分钟',
    isOverdue: true,
    source: '线上推广',
    prefer: '普拉提',
    tags: ['vip', '高意向']
  },
  {
    id: 'a13',
    name: '林娜 (Lin Na)',
    location: '深圳',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=100&h=100',
    waitTime: '10分钟',
    isOverdue: false,
    source: '转介绍',
    prefer: '减脂/塑形',
    tags: ['老客户推荐']
  },
  {
    id: 'a14',
    name: '徐芳 (Xu Fang)',
    location: '杭州',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=100&h=100',
    waitTime: '6分钟',
    isOverdue: false,
    source: '小程序',
    prefer: '瑜伽/拉伸',
    tags: []
  },
  {
    id: 'a15',
    name: '马强 (Ma Qiang)',
    location: '成都',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=100&h=100',
    waitTime: '45分钟',
    isOverdue: true,
    source: '线下活动',
    prefer: '力量训练',
    tags: ['重点客户']
  }
])

const coachList = ref([
  { id: 1, name: '李教练 (金牌)', type: '减重/塑形', load: 12, maxLoad: 15, color: 'bg-red-100 text-red-600', activeUsers: 8, reportUsers: 4 },
  { id: 2, name: '张教练 (资深)', type: '产后/瑜伽', load: 8, maxLoad: 15, color: 'bg-emerald-100 text-emerald-600', activeUsers: 5, reportUsers: 3 },
  { id: 3, name: '王教练', type: '康复训练', load: 5, maxLoad: 15, color: 'bg-emerald-100 text-emerald-600', activeUsers: 2, reportUsers: 3 },
  { id: 4, name: '赵教练', type: '增肌', load: 15, maxLoad: 15, color: 'bg-red-100 text-red-600', activeUsers: 10, reportUsers: 5 },
])

// 预警列表数据
const alertList = ref([
  {
    id: 1,
    severity: 'critical' as const,
    title: '应收账款逾期严重',
    description: '有5位会员应收账款逾期超过30天',
    currentValue: '¥45,000',
    threshold: '¥30,000',
    status: 'pending' as const
  },
  {
    id: 2,
    severity: 'critical' as const,
    title: '现金流预警',
    description: '本月现金流为负，资金缺口较大',
    currentValue: '-¥85,000',
    threshold: '-¥50,000',
    status: 'pending' as const
  },
  {
    id: 3,
    severity: 'critical' as const,
    title: '库存周转率过低',
    description: '部分产品库存积压严重',
    currentValue: '2.1次/年',
    threshold: '3.0次/年',
    status: 'pending' as const
  },
  {
    id: 4,
    severity: 'warning' as const,
    title: '教练结算延迟',
    description: '本月有3位教练的结算尚未完成',
    currentValue: '3人未结算',
    threshold: '全部完成',
    status: 'pending' as const
  },
  {
    id: 5,
    severity: 'warning' as const,
    title: '特殊项目支出增加',
    description: '本月特殊项目支出超出预算20%',
    currentValue: '¥12,000',
    threshold: '¥10,000',
    status: 'pending' as const
  },
  {
    id: 6,
    severity: 'warning' as const,
    title: '新用户转化率下降',
    description: '本周新用户转化率低于平均水平',
    currentValue: '35%',
    threshold: '45%',
    status: 'pending' as const
  },
  {
    id: 7,
    severity: 'warning' as const,
    title: '教练负载不均',
    description: '部分教练负载过高，部分教练空闲',
    currentValue: '负载差 > 80%',
    threshold: '负载差 < 50%',
    status: 'pending' as const
  },
  {
    id: 8,
    severity: 'info' as const,
    title: '餐补标准调整建议',
    description: '工作日餐补标准可适度调整',
    currentValue: '¥40/天',
    threshold: '市场均价¥45/天',
    status: 'resolved' as const
  },
  {
    id: 9,
    severity: 'info' as const,
    title: '会员续费提醒',
    description: '有12位会员本月需要续费',
    currentValue: '12人',
    threshold: '提前7天',
    status: 'pending' as const
  },
  {
    id: 10,
    severity: 'info' as const,
    title: '设备维护提醒',
    description: '部分健身设备需要定期维护',
    currentValue: '3台设备',
    threshold: '本周内',
    status: 'pending' as const
  }
])

// Methods
const handleAssignClick = (userId: string) => {
  selectedUserForAssign.value = userId
  batchAssignMode.value = false
  showAssignModal.value = true
}

// 单个用户分配
const handleSingleAssign = (userId: string) => {
  selectedUserForAssign.value = userId
  batchAssignMode.value = false
  showAssignModal.value = true
}

// 打开批量分配模态框
const openBatchAssignModal = () => {
  if (selectedUsersForBatch.value.length === 0) {
    toast.error('未选择用户', '请先选择要分配的用户')
    return
  }
  batchAssignMode.value = true
  showAssignModal.value = true
}

// 全选/取消全选
const toggleSelectAll = () => {
  // 切换全选状态
  if (isAllFilteredSelected.value) {
    // 如果已经全选，则取消选择所有过滤后的用户
    const filteredIds = filteredAllocationList.value.map(item => item.id)
    selectedUsersForBatch.value = selectedUsersForBatch.value.filter(id => !filteredIds.includes(id))
  } else {
    // 否则选择所有过滤后的用户
    const filteredIds = filteredAllocationList.value.map(item => item.id)
    // 合并已选的用户ID，避免重复
    const newSelection = [...new Set([...selectedUsersForBatch.value, ...filteredIds])]
    selectedUsersForBatch.value = newSelection
  }
}

// 分配教练
const assignCoach = (coachId: number) => {
  console.log('Assigning user to coach:', coachId)
  showAssignModal.value = false
}

// 确认分配教练（支持单个和批量）
const confirmAssignCoach = (coachId: number) => {
  const coach = coachList.value.find(c => c.id === coachId)

  if (batchAssignMode.value) {
    // 批量分配
    const count = selectedUsersForBatch.value.length
    const availableSpace = coach!.maxLoad - coach!.load

    if (count > availableSpace) {
      toast.error('负载不足', `${coach!.name} 剩余负载: ${availableSpace}人，无法分配 ${count} 位用户`)
      return
    }

    toast.success('批量分配成功', `已将 ${count} 位用户分配给 ${coach!.name}`)

    // 清空选择
    selectedUsersForBatch.value = []
    selectAllUsers.value = false

    // 更新教练负载
    coach!.load += count
  } else {
    // 单个分配
    if (coach!.load >= coach!.maxLoad) {
      toast.error('教练已满载', `${coach!.name} 当前负载已满，请选择其他教练`)
      return
    }

    toast.success('分配成功', `已将用户分配给 ${coach!.name}`)
    coach!.load += 1
  }

  showAssignModal.value = false
}

const toggleTag = (tag: string) => {
  const index = newReservation.tags.indexOf(tag)
  if (index > -1) {
    newReservation.tags.splice(index, 1)
  } else {
    newReservation.tags.push(tag)
  }
}

const handleAddReservation = () => {
  console.log('Adding reservation:', newReservation)
  showAddReservationModal.value = false
  // Reset form
  Object.assign(newReservation, {
    name: '',
    phone: '',
    location: '',
    time: '',
    coachId: '',
    tags: [],
    notes: ''
  })
}

// 获取当前周范围
const getCurrentWeekRange = () => {
  return '3月4日 - 3月10日'
}

// 获取时段卡片样式
const getSlotClass = (status: string) => {
  const classes = {
    available: 'bg-green-50 border border-green-200 hover:border-green-400',
    booked: 'bg-indigo-50 border border-indigo-200 hover:border-indigo-400',
    expired: 'bg-slate-100 border border-slate-200 opacity-60'
  }
  return classes[status as keyof typeof classes] || 'bg-slate-50'
}

// 获取时段计数样式
const getSlotCountClass = (status: string) => {
  const classes = {
    available: 'bg-green-100 text-green-700',
    booked: 'bg-indigo-100 text-indigo-700',
    expired: 'bg-slate-200 text-slate-600'
  }
  return classes[status as keyof typeof classes] || 'bg-slate-100'
}

// 获取状态徽章样式
const getStatusBadgeClass = (status: string) => {
  const classes = {
    scheduled: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    missed: 'bg-red-100 text-red-700'
  }
  return classes[status as keyof typeof classes] || 'bg-slate-100'
}

// 处理时段点击
const handleSlotClick = (slot: any) => {
  if (slot.status === 'available') {
    toast.info('预约时段', `点击了 ${slot.time} 时段（可预约）`)
  } else if (slot.status === 'booked') {
    toast.info('查看预约', `${slot.time} 时段已有 ${slot.count} 个预约`)
  }
}
</script>
