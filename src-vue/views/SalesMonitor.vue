<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Top Header Section -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl shadow-sm" :style="{
      background: 'var(--card)',
      border: '1px solid var(--border)'
    }">
      <div class="flex items-center gap-2">
        <div class="w-1.5 h-6 rounded-full" :style="{ background: isBlackGold.value ? '#D4A84A' : '#facc15' }"></div>
        <h2 class="text-xl font-bold" :style="{ color: 'var(--text-primary)' }">大屏监控中心</h2>
      </div>
      <div class="flex items-center gap-3">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2" :size="16" :style="{ color: 'var(--text-placeholder)' }" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索姓名/ID..."
            class="pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none w-64"
            :style="{
              background: 'var(--fill-light)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)'
            }"
          />
        </div>
        <button class="flex items-center gap-2 px-4 py-2 text-white font-bold rounded-lg shadow-sm transition-colors" :style="{
          background: isBlackGold.value ? 'linear-gradient(135deg, #D4A84A 0%, #B8860B 100%)' : '#facc15'
        }">
          <UserPlus :size="18" />
          教练人工分配
        </button>
      </div>
    </div>

    <!-- Dashboard Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Card 1: Reservations -->
      <div
        @click="activeView = 'reservation'"
        class="cursor-pointer transition-all duration-200 p-5 rounded-xl border shadow-sm relative overflow-hidden group"
        :style="activeView === 'reservation' ? {
          background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : 'linear-gradient(to bottom right, #4f46e5, #3730a3)',
          border: 'transparent',
          boxShadow: '0 0 0 2px ' + (isBlackGold.value ? '#B8860B' : '#4f46e5') + ', 0 0 0 4px ' + (isBlackGold.value ? '#1A1A1A' : 'white')
        } : {
          background: 'var(--card)',
          border: '1px solid var(--border)'
        }"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium" :style="{ color: activeView === 'reservation' ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }">今日首通预约池</span>
          <div class="p-2 rounded-lg" :style="activeView === 'reservation' ? {
            background: 'rgba(255,255,255,0.2)',
            color: 'white'
          } : {
            background: isBlackGold.value ? 'rgba(184, 134, 11, 0.15)' : '#eef2ff',
            color: isBlackGold.value ? '#D4A84A' : '#4f46e5'
          }">
            <PhoneCall :size="20" />
          </div>
        </div>
        <div class="text-3xl font-bold mb-1" :style="{ color: activeView === 'reservation' ? 'white' : 'var(--text-primary)' }">
          48 <span class="text-sm font-normal" :style="{ color: activeView === 'reservation' ? 'rgba(255,255,255,0.7)' : 'var(--text-disabled)' }">人</span>
        </div>
        <div class="text-xs px-2 py-0.5 rounded backdrop-blur-sm inline-block" :style="activeView === 'reservation' ? {
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
        @click="activeView = 'allocation'"
        class="cursor-pointer transition-all duration-200 p-5 rounded-xl border shadow-sm relative overflow-hidden group"
        :style="activeView === 'allocation' ? {
          background: 'linear-gradient(to bottom right, #f97316, #ef4444)',
          border: 'transparent',
          boxShadow: '0 0 0 2px #f97316, 0 0 0 4px white'
        } : {
          background: 'var(--card)',
          border: '1px solid var(--border)'
        }"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium" :style="{ color: activeView === 'allocation' ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }">等待分配用户</span>
          <div class="p-2 rounded-lg" :style="activeView === 'allocation' ? {
            background: 'rgba(255,255,255,0.2)',
            color: 'white'
          } : {
            background: '#ffedd5',
            color: '#f97316'
          }">
            <UserPlus :size="20" />
          </div>
        </div>
        <div class="text-3xl font-bold mb-1" :style="{ color: activeView === 'allocation' ? 'white' : 'var(--text-primary)' }">
          15 <span class="text-sm font-normal" :style="{ color: activeView === 'allocation' ? 'rgba(255,255,255,0.7)' : 'var(--text-disabled)' }">人</span>
        </div>
        <div class="text-xs px-2 py-0.5 rounded backdrop-blur-sm inline-block" :style="activeView === 'allocation' ? {
          background: 'rgba(255,255,255,0.2)',
          color: 'white'
        } : {
          background: '#fee2e2',
          color: '#ef4444'
        }">
          3 人等待 > 30min
        </div>
      </div>

      <!-- Card 3: Coach Stats -->
      <div
        @click="activeView = 'coaches'"
        class="cursor-pointer transition-all duration-200 p-5 rounded-xl border shadow-sm relative overflow-hidden group"
        :style="activeView === 'coaches' ? {
          background: 'linear-gradient(to bottom right, #10b981, #0d9488)',
          border: 'transparent',
          boxShadow: '0 0 0 2px #10b981, 0 0 0 4px white'
        } : {
          background: 'var(--card)',
          border: '1px solid var(--border)'
        }"
      >
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-medium" :style="{ color: activeView === 'coaches' ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }">教练在线状态</span>
          <div class="p-2 rounded-lg" :style="activeView === 'coaches' ? {
            background: 'rgba(255,255,255,0.2)',
            color: 'white'
          } : {
            background: '#d1fae5',
            color: '#10b981'
          }">
            <Users :size="18" />
          </div>
        </div>
        <div class="text-3xl font-bold mb-4" :style="{ color: activeView === 'coaches' ? 'white' : 'var(--text-primary)' }">
          8<span class="text-lg font-normal" :style="{ color: activeView === 'coaches' ? 'rgba(255,255,255,0.7)' : 'var(--text-disabled)' }">/12</span>
        </div>
        <div class="flex gap-1.5 flex-wrap">
          <div
            v-for="i in 8"
            :key="i"
            class="w-8 h-8 rounded-full shadow-sm flex items-center justify-center"
            :style="{ background: 'var(--fill-light)', border: '1px solid var(--border-light)' }"
          >
            <div class="w-2.5 h-2.5 rounded-full" :style="{ background: i < 5 ? '#10b981' : '#f97316' }"></div>
          </div>
          <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" :style="{
            background: 'var(--fill-lighter)',
            border: '1px solid var(--border-lighter)',
            color: 'var(--text-disabled)'
          }">+4</div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Table List -->
      <div class="lg:col-span-2 rounded-xl shadow-sm flex flex-col min-h-[500px]" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <div class="p-4 flex justify-between items-center" :style="{ borderBottom: '1px solid var(--border-light)' }">
          <h3 class="font-bold flex items-center gap-2" :style="{ color: 'var(--text-primary)' }">
            <PhoneCall v-if="activeView === 'reservation'" :size="18" :style="{ color: isBlackGold.value ? '#D4A84A' : '#4f46e5' }" />
            <UserPlus v-if="activeView === 'allocation'" :size="18" style="color: #f97316;" />
            <Users v-if="activeView === 'coaches'" :size="18" style="color: #10b981;" />
            <span v-if="activeView === 'reservation'">首通电话预约列表</span>
            <span v-if="activeView === 'allocation'">待分配用户列表</span>
            <span v-if="activeView === 'coaches'">教练在线状态详情</span>
          </h3>
          <div class="flex items-center gap-3">
            <button
              v-if="activeView === 'reservation'"
              @click="showAddReservationModal = true"
              class="px-3 py-1.5 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              :style="{
                background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5'
              }"
            >
              <UserPlus :size="14" />
              手动添加
            </button>
            <div class="flex p-1 rounded-lg" :style="{ background: 'var(--fill-light)' }">
              <button
                v-for="tab in ['全部', '待处理', '已逾期']"
                :key="tab"
                @click="activeTab = tab"
                class="px-3 py-1 text-xs font-medium rounded transition-all"
                :style="activeTab === tab ? {
                  background: 'var(--card)',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  color: isBlackGold.value ? '#D4A84A' : '#4f46e5'
                } : {
                  color: 'var(--text-secondary)'
                }"
              >
                {{ tab }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-auto">
          <table class="w-full text-left text-sm">
            <thead class="font-medium sticky top-0 z-10" :style="{
              background: 'var(--fill-light)',
              color: 'var(--text-secondary)'
            }">
              <tr>
                <!-- Coach Table Header -->
                <template v-if="activeView === 'coaches'">
                  <th class="px-6 py-3">教练姓名</th>
                  <th class="px-6 py-3">专业类型</th>
                  <th class="px-6 py-3">管理用户</th>
                  <th class="px-6 py-3">待出报告</th>
                  <th class="px-6 py-3">负载状态</th>
                </template>

                <!-- User Tables Header -->
                <template v-else>
                  <th class="px-6 py-3">用户资料</th>
                  <th v-if="activeView === 'reservation'" class="px-6 py-3">预约时间</th>
                  <th v-if="activeView === 'reservation'" class="px-6 py-3">跟进教练</th>
                  <th v-if="activeView === 'allocation'" class="px-6 py-3">等待时长</th>
                  <th v-if="activeView === 'allocation'" class="px-6 py-3">来源/偏好</th>
                  <th class="px-6 py-3 text-right">操作</th>
                </template>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <!-- Coach Rows -->
              <template v-if="activeView === 'coaches'">
                <tr v-for="coach in coachList" :key="coach.id" class="hover:bg-slate-50 group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center font-bold text-indigo-700 shadow-sm border border-indigo-100">
                        {{ coach.name.charAt(0) }}
                      </div>
                      <div>
                        <div class="font-bold text-slate-800">{{ coach.name }}</div>
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
                    <span class="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200">
                      {{ coach.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <Users :size="14" class="text-slate-400" />
                      <span class="font-bold text-slate-700">{{ coach.activeUsers }}</span>
                      <span class="text-xs text-slate-400">人</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <span :class="`font-bold ${coach.reportUsers > 3 ? 'text-orange-600' : 'text-slate-600'}`">
                        {{ coach.reportUsers }}
                      </span>
                      <span class="text-xs text-slate-400">份</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="flex-1 max-w-[120px]">
                        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            :class="`h-full rounded-full transition-all ${coach.load/coach.maxLoad > 0.8 ? 'bg-red-500' : 'bg-emerald-500'}`"
                            :style="{ width: `${(coach.load/coach.maxLoad)*100}%` }"
                          ></div>
                        </div>
                      </div>
                      <span :class="`text-xs font-bold ${coach.load/coach.maxLoad > 0.8 ? 'text-red-600' : 'text-slate-600'}`">
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
                      <img :src="item.avatar" class="w-10 h-10 rounded-full object-cover" alt="" />
                      <div>
                        <div class="font-bold text-slate-800">{{ item.name }}</div>
                        <div class="text-xs text-slate-400">{{ item.location }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex flex-col">
                      <span class="font-medium text-slate-700">{{ item.time }}</span>
                      <span :class="`text-xs ${item.status === 'scheduled' ? 'text-indigo-500' : 'text-slate-400'}`">{{ item.statusText }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                      <div :class="`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${item.coachAvatar}`">
                        {{ item.coach.charAt(0) }}
                      </div>
                      <span class="text-slate-600">{{ item.coach }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right">
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
                <tr v-for="item in allocationList" :key="item.id" class="hover:bg-slate-50 group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <img :src="item.avatar" class="w-10 h-10 rounded-full object-cover" alt="" />
                      <div>
                        <div class="font-bold text-slate-800">{{ item.name }}</div>
                        <div class="flex gap-1 mt-1">
                          <span
                            v-for="(t, i) in item.tags"
                            :key="i"
                            class="text-[10px] bg-indigo-50 text-indigo-600 px-1 rounded"
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
                      @click="handleAssignClick(item.id)"
                      class="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                    >
                      立即分配
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Right Column: Charts -->
      <div class="p-6 rounded-xl shadow-sm flex flex-col h-[500px]" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold flex items-center gap-2" :style="{ color: 'var(--text-primary)' }">
            <TrendingUp :size="20" :style="{ color: isBlackGold.value ? '#D4A84A' : '#4f46e5' }" />
            销售转化漏斗
          </h3>
          <span class="text-xs" :style="{ color: 'var(--text-disabled)' }">实时更新</span>
        </div>

        <!-- Placeholder for chart - will use vue-echarts -->
        <div class="flex-1 flex items-center justify-center rounded-lg" :style="{ background: 'var(--fill-light)' }">
          <div class="text-center">
            <BarChart :size="64" class="mx-auto mb-4" :style="{ color: 'var(--text-disabled)' }" />
            <p :style="{ color: 'var(--text-secondary)' }">图表区域</p>
            <p class="text-xs mt-1" :style="{ color: 'var(--text-disabled)' }">需集成 vue-echarts</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Assign Coach Modal -->
    <Modal
      v-if="showAssignModal"
      @close="showAssignModal = false"
      title="分配教练"
    >
      <div class="p-6 max-h-[500px] overflow-y-auto space-y-3">
        <div
          v-for="coach in coachList"
          :key="coach.id"
          @click="assignCoach(coach.id)"
          class="group flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-indigo-500 hover:shadow-md hover:bg-indigo-50/30 cursor-pointer transition-all"
        >
          <div>
            <div class="font-bold text-slate-800 text-base mb-1">{{ coach.name }}</div>
            <div class="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded w-fit">{{ coach.type }}</div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <span :class="`px-2 py-1 text-xs font-bold rounded-full ${coach.color}`">
              负载: {{ coach.load }}/{{ coach.maxLoad }}
            </span>
            <button
              @click.stop="showAssignModal = false"
              class="opacity-0 group-hover:opacity-100 px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-all shadow-sm"
            >
              确认分配
            </button>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Add Reservation Modal -->
    <Modal
      v-if="showAddReservationModal"
      @close="showAddReservationModal = false"
      title="手动添加首通电话预约"
      width="w-[500px]"
    >
      <div class="p-6">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">客户姓名</label>
            <input
              v-model="newReservation.name"
              type="text"
              placeholder="请输入客户姓名"
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">手机号码</label>
              <input
                v-model="newReservation.phone"
                type="tel"
                placeholder="请输入手机号"
                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">所在城市</label>
              <input
                v-model="newReservation.location"
                type="text"
                placeholder="请输入城市"
                class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">预约时间</label>
            <input
              v-model="newReservation.time"
              type="datetime-local"
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">分配教练</label>
            <select
              v-model="newReservation.coachId"
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option>请选择教练</option>
              <option v-for="coach in coachList" :key="coach.id" :value="coach.id">
                {{ coach.name }} - {{ coach.type }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">备注标签</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <button
                v-for="tag in ['高意向', '减重', '增肌', '康复', '产后', 'VIP']"
                :key="tag"
                @click="toggleTag(tag)"
                :class="`px-3 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  newReservation.tags.includes(tag)
                    ? 'bg-indigo-100 text-indigo-600 border-indigo-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-indigo-100 hover:text-indigo-600 hover:border-indigo-300'
                }`"
              >
                {{ tag }}
              </button>
            </div>
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">备注信息</label>
            <textarea
              v-model="newReservation.notes"
              placeholder="请输入备注信息（选填）"
              rows="3"
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            @click="showAddReservationModal = false"
            class="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            @click="handleAddReservation"
            class="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all"
          >
            确认添加
          </button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import {
  Users,
  PhoneCall,
  TrendingUp,
  UserPlus,
  Phone,
  Search,
  ChevronRight,
  BarChart
} from 'lucide-vue-next'
import Modal from '../components/Modal.vue'
import { useTheme } from '../composables/useTheme'

// 主题相关
const { currentTheme } = useTheme()

// 主题样式计算属性
const isBlackGold = computed(() => currentTheme.value === 'black-gold')

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
const activeView = ref<'reservation' | 'allocation' | 'coaches'>('reservation')
const showAssignModal = ref(false)
const showAddReservationModal = ref(false)
const selectedUserForAssign = ref<string | null>(null)
const searchQuery = ref('')

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
    time: '2026-02-04 14:00',
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
    time: '2026-02-04 10:30',
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
    time: '2026-02-04 09:15',
    coach: '王教练',
    coachAvatar: 'bg-emerald-100 text-emerald-600',
    tags: ['需回访']
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
  }
])

const coachList = ref([
  { id: 1, name: '李教练 (金牌)', type: '减重/塑形', load: 12, maxLoad: 15, color: 'bg-red-100 text-red-600', activeUsers: 8, reportUsers: 4 },
  { id: 2, name: '张教练 (资深)', type: '产后/瑜伽', load: 8, maxLoad: 15, color: 'bg-emerald-100 text-emerald-600', activeUsers: 5, reportUsers: 3 },
  { id: 3, name: '王教练', type: '康复训练', load: 5, maxLoad: 15, color: 'bg-emerald-100 text-emerald-600', activeUsers: 2, reportUsers: 3 },
  { id: 4, name: '赵教练', type: '增肌', load: 15, maxLoad: 15, color: 'bg-red-100 text-red-600', activeUsers: 10, reportUsers: 5 },
])

// Methods
const handleAssignClick = (userId: string) => {
  selectedUserForAssign.value = userId
  showAssignModal.value = true
}

const assignCoach = (coachId: number) => {
  console.log('Assigning user to coach:', coachId)
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
</script>
