<template>
  <div class="h-screen flex gap-4 p-4" :style="{ background: 'var(--background)', color: 'var(--text-primary)' }">
    <!-- 左侧：群和用户列表 -->
    <div class="w-80 flex flex-col gap-4">
      <!-- 群列表 -->
      <div class="rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <div class="p-4" style="border-bottom: 1px solid var(--border-light);">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold flex items-center gap-2">
              <Users :size="18" :style="{ color: isBlackGold ? '#B8860B' : '#4f46e5' }" />
              群组列表
            </h3>
            <button class="text-xs px-2 py-1 rounded" :style="{
              background: isBlackGold ? 'rgba(184, 134, 11, 0.1)' : 'rgba(79, 70, 229, 0.1)',
              color: isBlackGold ? '#B8860B' : '#4f46e5'
            }">
              管理群组
            </button>
          </div>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2" :size="14" :style="{ color: 'var(--text-placeholder)' }" />
            <input
              v-model="groupSearch"
              type="text"
              placeholder="搜索群组..."
              class="w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
              :style="{
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--text-primary)'
              }"
            />
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-2">
          <!-- 返回群列表按钮（当在成员视图时显示） -->
          <button
            v-if="selectedGroup"
            @click="selectedGroup = null"
            class="w-full mb-2 p-2 rounded-lg text-left text-sm flex items-center gap-2 transition-colors"
            :style="{
              background: 'var(--fill-light)',
              color: 'var(--text-regular)'
            }"
          >
            <ArrowLeft :size="16" />
            <span>返回群列表</span>
          </button>

          <!-- 群列表视图 -->
          <div v-if="!selectedGroup" class="space-y-1">
            <div
              v-for="group in filteredGroups"
              :key="group.id"
              @click="selectGroup(group)"
              class="p-3 rounded-lg cursor-pointer transition-all hover:shadow-md"
              :style="{
                background: 'var(--fill-light)',
                border: '1px solid var(--border)',
                cursor: 'pointer'
              }"
              @mouseenter="$event.currentTarget.style.background = 'var(--fill)'"
              @mouseleave="$event.currentTarget.style.background = 'var(--fill-light)'"
            >
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    :style="{ background: group.color }">
                    {{ group.name.charAt(0) }}
                  </div>
                  <div>
                    <div class="font-semibold text-sm">{{ group.name }}</div>
                    <div class="text-xs" :style="{ color: 'var(--text-secondary)' }">
                      {{ group.memberCount }} 位成员
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs px-2 py-1 rounded"
                    :style="{
                      background: group.completionRate >= 80 ? 'rgba(16, 185, 129, 0.1)' :
                              group.completionRate >= 60 ? 'rgba(245, 158, 11, 0.1)' :
                              'rgba(239, 68, 68, 0.1)',
                      color: group.completionRate >= 80 ? '#10b981' :
                             group.completionRate >= 60 ? '#f59e0b' :
                             '#ef4444'
                    }">
                    {{ group.completionRate }}%
                  </span>
                  <ChevronRight :size="16" :style="{ color: 'var(--text-disabled)' }" />
                </div>
              </div>
              <div class="flex items-center gap-2 text-xs" :style="{ color: 'var(--text-secondary)' }">
                <Calendar :size="12" />
                <span>今日 {{ group.todayCompleted }}/{{ group.memberCount }} 人已打卡</span>
              </div>
            </div>
          </div>

          <!-- 群成员视图 -->
          <div v-else class="space-y-1">
            <div
              v-for="member in selectedGroup.members"
              :key="member.id"
              @click="selectUser(member)"
              class="p-3 rounded-lg cursor-pointer transition-all hover:shadow-md"
              :style="{
                background: selectedUser?.id === member.id ? 'var(--fill)' : 'var(--fill-light)',
                border: selectedUser?.id === member.id ? `2px solid ${isBlackGold ? '#B8860B' : '#4f46e5'}` : '1px solid var(--border)',
                cursor: 'pointer'
              }"
            >
              <div class="flex items-center gap-3">
                <div class="relative">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    :style="{ background: member.avatarColor }">
                    {{ member.name.charAt(0) }}
                  </div>
                  <div
                    class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                    :style="{
                      background: member.todayCompleted ? '#10b981' : '#ef4444',
                      borderColor: 'var(--card)'
                    }"
                  ></div>
                </div>
                <div class="flex-1">
                  <div class="font-semibold text-sm">{{ member.name }}</div>
                  <div class="text-xs" :style="{ color: 'var(--text-secondary)' }">
                    {{ member.todayCompleted ? '今日已完成打卡' : '今日未打卡' }}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xs px-2 py-1 rounded"
                    :style="{
                      background: member.completionRate >= 80 ? 'rgba(16, 185, 129, 0.1)' :
                              member.completionRate >= 60 ? 'rgba(245, 158, 11, 0.1)' :
                              'rgba(239, 68, 68, 0.1)',
                      color: member.completionRate >= 80 ? '#10b981' :
                             member.completionRate >= 60 ? '#f59e0b' :
                             '#ef4444'
                    }">
                    {{ member.completionRate }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：用户详情 -->
    <div class="flex-1 flex flex-col gap-4 overflow-hidden">
      <div v-if="!selectedUser" class="flex-1 flex items-center justify-center rounded-xl" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <div class="text-center">
          <Users :size="64" :style="{ color: 'var(--text-disabled)', opacity: 0.5 }" />
          <p class="mt-4" :style="{ color: 'var(--text-secondary)' }">
            请从左侧选择群组和用户查看详情
          </p>
        </div>
      </div>

      <div v-else class="flex-1 flex flex-col gap-4 overflow-y-auto">
        <!-- 用户基本信息 -->
        <div class="rounded-xl shadow-sm p-4" :style="{
          background: 'var(--card)',
          border: '1px solid var(--border)'
        }">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                :style="{ background: selectedUser.avatarColor }">
                {{ selectedUser.name.charAt(0) }}
              </div>
              <div>
                <h2 class="text-xl font-bold">{{ selectedUser.name }}</h2>
                <div class="flex items-center gap-3 mt-1 text-sm" :style="{ color: 'var(--text-secondary)' }">
                  <span>ID: {{ selectedUser.id }}</span>
                  <span>•</span>
                  <span>{{ selectedGroup?.name }}</span>
                  <span>•</span>
                  <span :style="{
                    color: selectedUser.todayCompleted ? '#10b981' : '#ef4444'
                  }">
                    {{ selectedUser.todayCompleted ? '今日已打卡' : '今日未打卡' }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button class="px-4 py-2 text-sm rounded-lg flex items-center gap-2" :style="{
                border: '1px solid var(--border)',
                background: 'var(--fill-light)',
                color: 'var(--text-regular)'
              }">
                <Phone :size="16" />
                联系用户
              </button>
              <button class="px-4 py-2 text-sm rounded-lg text-white flex items-center gap-2" :style="{
                background: isBlackGold ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'
              }">
                <FileText :size="16" />
                查看档案
              </button>
            </div>
          </div>
        </div>

        <!-- 核心数据卡片 -->
        <div class="grid grid-cols-4 gap-4">
          <!-- 饮食上传 -->
          <div class="rounded-xl shadow-sm p-4" :style="{
            background: 'var(--card)',
            border: '1px solid var(--border)'
          }">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="{
                  background: isBlackGold ? 'rgba(184, 134, 11, 0.1)' : 'rgba(79, 70, 229, 0.1)'
                }">
                  <Utensils :size="20" :style="{ color: isBlackGold ? '#B8860B' : '#4f46e5' }" />
                </div>
                <span class="font-semibold text-sm">饮食上传</span>
              </div>
              <span class="text-xs px-2 py-1 rounded"
                :style="{
                  background: selectedUser.todayTasks.mealUploaded ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  color: selectedUser.todayTasks.mealUploaded ? '#10b981' : '#ef4444'
                }">
                {{ selectedUser.todayTasks.mealUploaded ? '已完成' : '未完成' }}
              </span>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span :style="{ color: 'var(--text-secondary)' }">早餐</span>
                <span :style="{ color: selectedUser.todayTasks.meals.breakfast ? '#10b981' : 'var(--text-disabled)' }">
                  {{ selectedUser.todayTasks.meals.breakfast ? '✓' : '○' }}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span :style="{ color: 'var(--text-secondary)' }">午餐</span>
                <span :style="{ color: selectedUser.todayTasks.meals.lunch ? '#10b981' : 'var(--text-disabled)' }">
                  {{ selectedUser.todayTasks.meals.lunch ? '✓' : '○' }}
                </span>
              </div>
              <div class="flex justify-between text-sm">
                <span :style="{ color: 'var(--text-secondary)' }">晚餐</span>
                <span :style="{ color: selectedUser.todayTasks.meals.dinner ? '#10b981' : 'var(--text-disabled)' }">
                  {{ selectedUser.todayTasks.meals.dinner ? '✓' : '○' }}
                </span>
              </div>
            </div>
          </div>

          <!-- 热量核算 -->
          <div class="rounded-xl shadow-sm p-4" :style="{
            background: 'var(--card)',
            border: '1px solid var(--border)'
          }">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="{
                  background: 'rgba(249, 115, 22, 0.1)'
                }">
                  <Flame :size="20" style="color: #f97316;" />
                </div>
                <span class="font-semibold text-sm">热量核算</span>
              </div>
              <span class="text-xs px-2 py-1 rounded"
                :style="{
                  background: selectedUser.todayTasks.caloriesOnTarget ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: selectedUser.todayTasks.caloriesOnTarget ? '#10b981' : '#f59e0b'
                }">
                {{ selectedUser.todayTasks.caloriesOnTarget ? '达标' : '未达标' }}
              </span>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span :style="{ color: 'var(--text-secondary)' }">目标</span>
                <span class="font-semibold">{{ selectedUser.todayTasks.targetCalories }} kcal</span>
              </div>
              <div class="flex justify-between text-sm">
                <span :style="{ color: 'var(--text-secondary)' }">实际</span>
                <span :style="{
                  color: selectedUser.todayTasks.actualCalories <= selectedUser.todayTasks.targetCalories ? '#10b981' : '#ef4444'
                }">
                  {{ selectedUser.todayTasks.actualCalories }} kcal
                </span>
              </div>
              <div class="w-full h-2 rounded-full overflow-hidden" :style="{ background: 'var(--border)' }">
                <div class="h-full transition-all"
                  :style="{
                    width: `${Math.min((selectedUser.todayTasks.actualCalories / selectedUser.todayTasks.targetCalories) * 100, 100)}%`,
                    background: selectedUser.todayTasks.actualCalories <= selectedUser.todayTasks.targetCalories ? '#10b981' : '#ef4444'
                  }">
                </div>
              </div>
            </div>
          </div>

          <!-- 营养素平衡 -->
          <div class="rounded-xl shadow-sm p-4" :style="{
            background: 'var(--card)',
            border: '1px solid var(--border)'
          }">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="{
                  background: 'rgba(16, 185, 129, 0.1)'
                }">
                  <Apple :size="20" style="color: #10b981;" />
                </div>
                <span class="font-semibold text-sm">营养素平衡</span>
              </div>
              <span class="text-xs px-2 py-1 rounded"
                :style="{
                  background: selectedUser.todayTasks.nutrientsBalanced ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: selectedUser.todayTasks.nutrientsBalanced ? '#10b981' : '#f59e0b'
                }">
                {{ selectedUser.todayTasks.nutrientsBalanced ? '平衡' : '需调整' }}
              </span>
            </div>
            <div class="space-y-2 text-xs">
              <div>
                <div class="flex justify-between mb-1">
                  <span :style="{ color: 'var(--text-secondary)' }">蛋白质</span>
                  <span>{{ selectedUser.todayTasks.nutrients.protein }}g</span>
                </div>
                <div class="w-full h-1.5 rounded-full overflow-hidden" :style="{ background: 'var(--border)' }">
                  <div class="h-full" style="width: 85%; background: #4f46e5;"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between mb-1">
                  <span :style="{ color: 'var(--text-secondary)' }">碳水化合物</span>
                  <span>{{ selectedUser.todayTasks.nutrients.carbs }}g</span>
                </div>
                <div class="w-full h-1.5 rounded-full overflow-hidden" :style="{ background: 'var(--border)' }">
                  <div class="h-full" style="width: 70%; background: #f59e0b;"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between mb-1">
                  <span :style="{ color: 'var(--text-secondary)' }">脂肪</span>
                  <span>{{ selectedUser.todayTasks.nutrients.fat }}g</span>
                </div>
                <div class="w-full h-1.5 rounded-full overflow-hidden" :style="{ background: 'var(--border)' }">
                  <div class="h-full" style="width: 60%; background: #10b981;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 习惯打卡 -->
          <div class="rounded-xl shadow-sm p-4" :style="{
            background: 'var(--card)',
            border: '1px solid var(--border)'
          }">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-10 h-10 rounded-lg flex items-center justify-center" :style="{
                  background: 'rgba(139, 92, 246, 0.1)'
                }">
                  <CheckCircle2 :size="20" style="color: #8b5cf6;" />
                </div>
                <span class="font-semibold text-sm">习惯打卡</span>
              </div>
              <span class="text-xs px-2 py-1 rounded"
                :style="{
                  background: selectedUser.todayTasks.habitsCompleted === selectedUser.todayTasks.totalHabits ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: selectedUser.todayTasks.habitsCompleted === selectedUser.todayTasks.totalHabits ? '#10b981' : '#f59e0b'
                }">
                {{ selectedUser.todayTasks.habitsCompleted }}/{{ selectedUser.todayTasks.totalHabits }}
              </span>
            </div>
            <div class="space-y-1.5 text-xs">
              <div v-for="habit in selectedUser.todayTasks.habits" :key="habit.name" class="flex items-center justify-between">
                <span :style="{ color: 'var(--text-secondary)' }">{{ habit.name }}</span>
                <span :style="{ color: habit.completed ? '#10b981' : 'var(--text-disabled)' }">
                  {{ habit.completed ? '✓' : '○' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 日历视图 -->
        <div class="rounded-xl shadow-sm p-4" :style="{
          background: 'var(--card)',
          border: '1px solid var(--border)'
        }">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold flex items-center gap-2">
              <Calendar :size="18" :style="{ color: isBlackGold ? '#B8860B' : '#4f46e5' }" />
              本月打卡日历
            </h3>
            <span class="text-sm" :style="{ color: 'var(--text-secondary)' }">
              {{ currentMonth }}
            </span>
          </div>
          <div class="grid grid-cols-7 gap-2">
            <!-- 星期标题 -->
            <div v-for="day in ['日', '一', '二', '三', '四', '五', '六']" :key="day"
              class="text-center text-xs font-medium py-2"
              :style="{ color: 'var(--text-secondary)' }">
              {{ day }}
            </div>
            <!-- 日期格子 -->
            <div
              v-for="date in calendarDays"
              :key="date.day"
              class="aspect-square rounded-lg flex flex-col items-center justify-center text-sm cursor-pointer transition-all hover:scale-105"
              :style="{
                background: date.isToday ? (isBlackGold ? 'rgba(184, 134, 11, 0.1)' : 'rgba(79, 70, 229, 0.1)') :
                         date.completed ? 'rgba(16, 185, 129, 0.1)' :
                         date.inMonth ? 'var(--fill-light)' : 'transparent',
                color: date.isToday ? (isBlackGold ? '#B8860B' : '#4f46e5') :
                       date.completed ? '#10b981' :
                       date.inMonth ? 'var(--text-regular)' : 'var(--text-disabled)',
                border: date.isToday ? `1px solid ${isBlackGold ? '#B8860B' : '#4f46e5'}` : 'none',
                opacity: date.inMonth ? 1 : 0.3
              }"
            >
              <span class="font-medium">{{ date.day }}</span>
              <span v-if="date.completed && date.inMonth" class="text-xs mt-1">✓</span>
              <span v-else-if="!date.completed && date.inMonth" class="text-xs mt-1" :style="{ color: 'var(--text-disabled)' }">○</span>
            </div>
          </div>
          <div class="flex items-center justify-center gap-6 mt-4 text-xs">
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded" :style="{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981' }"></div>
              <span :style="{ color: 'var(--text-secondary)' }">已完成</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded" :style="{ background: 'var(--fill-light)', border: '1px solid var(--border)' }"></div>
              <span :style="{ color: 'var(--text-secondary)' }">未完成</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded" :style="{ background: isBlackGold ? 'rgba(184, 134, 11, 0.1)' : 'rgba(79, 70, 229, 0.1)', border: `1px solid ${isBlackGold ? '#B8860B' : '#4f46e5'}` }"></div>
              <span :style="{ color: 'var(--text-secondary)' }">今天</span>
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
  Users,
  Search,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Phone,
  FileText,
  Utensils,
  Flame,
  Apple,
  CheckCircle2
} from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'

const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')

// 类型定义
interface Group {
  id: string
  name: string
  color: string
  memberCount: number
  completionRate: number
  todayCompleted: number
  members: GroupMember[]
}

interface GroupMember {
  id: string
  name: string
  avatarColor: string
  todayCompleted: boolean
  completionRate: number
  todayTasks: TodayTasks
}

interface TodayTasks {
  mealUploaded: boolean
  meals: {
    breakfast: boolean
    lunch: boolean
    dinner: boolean
  }
  caloriesOnTarget: boolean
  targetCalories: number
  actualCalories: number
  nutrientsBalanced: boolean
  nutrients: {
    protein: number
    carbs: number
    fat: number
  }
  habitsCompleted: number
  totalHabits: number
  habits: {
    name: string
    completed: boolean
  }[]
}

interface CalendarDay {
  day: number
  isToday: boolean
  inMonth: boolean
  completed: boolean
}

// 状态
const groupSearch = ref('')
const selectedGroup = ref<Group | null>(null)
const selectedUser = ref<GroupMember | null>(null)

// 模拟群数据
const groups = ref<Group[]>([
  {
    id: '1',
    name: '糖尿病管理A组',
    color: '#4f46e5',
    memberCount: 8,
    completionRate: 75,
    todayCompleted: 6,
    members: [
      {
        id: '1',
        name: '王芳',
        avatarColor: '#4f46e5',
        todayCompleted: true,
        completionRate: 85,
        todayTasks: {
          mealUploaded: true,
          meals: { breakfast: true, lunch: true, dinner: false },
          caloriesOnTarget: true,
          targetCalories: 1800,
          actualCalories: 1650,
          nutrientsBalanced: true,
          nutrients: { protein: 85, carbs: 180, fat: 55 },
          habitsCompleted: 3,
          totalHabits: 4,
          habits: [
            { name: '测量血糖', completed: true },
            { name: '服药', completed: true },
            { name: '运动30分钟', completed: true },
            { name: '喝水8杯', completed: false }
          ]
        }
      },
      {
        id: '2',
        name: '李明',
        avatarColor: '#f59e0b',
        todayCompleted: true,
        completionRate: 72,
        todayTasks: {
          mealUploaded: true,
          meals: { breakfast: true, lunch: false, dinner: false },
          caloriesOnTarget: false,
          targetCalories: 2000,
          actualCalories: 2200,
          nutrientsBalanced: false,
          nutrients: { protein: 75, carbs: 250, fat: 70 },
          habitsCompleted: 2,
          totalHabits: 4,
          habits: [
            { name: '测量血糖', completed: true },
            { name: '服药', completed: true },
            { name: '运动30分钟', completed: false },
            { name: '喝水8杯', completed: false }
          ]
        }
      },
      {
        id: '3',
        name: '张建国',
        avatarColor: '#10b981',
        todayCompleted: false,
        completionRate: 65,
        todayTasks: {
          mealUploaded: false,
          meals: { breakfast: false, lunch: false, dinner: false },
          caloriesOnTarget: false,
          targetCalories: 1900,
          actualCalories: 0,
          nutrientsBalanced: false,
          nutrients: { protein: 0, carbs: 0, fat: 0 },
          habitsCompleted: 0,
          totalHabits: 4,
          habits: [
            { name: '测量血糖', completed: false },
            { name: '服药', completed: false },
            { name: '运动30分钟', completed: false },
            { name: '喝水8杯', completed: false }
          ]
        }
      }
    ]
  },
  {
    id: '2',
    name: '减脂塑形B组',
    color: '#10b981',
    memberCount: 10,
    completionRate: 82,
    todayCompleted: 9,
    members: [
      {
        id: '4',
        name: '赵丽',
        avatarColor: '#ec4899',
        todayCompleted: true,
        completionRate: 90,
        todayTasks: {
          mealUploaded: true,
          meals: { breakfast: true, lunch: true, dinner: true },
          caloriesOnTarget: true,
          targetCalories: 1500,
          actualCalories: 1420,
          nutrientsBalanced: true,
          nutrients: { protein: 95, carbs: 120, fat: 45 },
          habitsCompleted: 4,
          totalHabits: 4,
          habits: [
            { name: '测量体重', completed: true },
            { name: '有氧运动', completed: true },
            { name: '力量训练', completed: true },
            { name: '喝水10杯', completed: true }
          ]
        }
      },
      {
        id: '5',
        name: '孙强',
        avatarColor: '#8b5cf6',
        todayCompleted: true,
        completionRate: 78,
        todayTasks: {
          mealUploaded: true,
          meals: { breakfast: true, lunch: true, dinner: false },
          caloriesOnTarget: true,
          targetCalories: 1800,
          actualCalories: 1750,
          nutrientsBalanced: true,
          nutrients: { protein: 110, carbs: 150, fat: 55 },
          habitsCompleted: 3,
          totalHabits: 4,
          habits: [
            { name: '测量体重', completed: true },
            { name: '有氧运动', completed: true },
            { name: '力量训练', completed: true },
            { name: '喝水10杯', completed: false }
          ]
        }
      }
    ]
  },
  {
    id: '3',
    name: '慢病康复C组',
    color: '#f97316',
    memberCount: 6,
    completionRate: 68,
    todayCompleted: 4,
    members: []
  }
])

// 计算属性
const filteredGroups = computed(() => {
  if (!groupSearch.value) return groups.value
  return groups.value.filter(g =>
    g.name.toLowerCase().includes(groupSearch.value.toLowerCase())
  )
})

const currentMonth = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${now.getMonth() + 1}月`
})

// 生成本月日历数据
const calendarDays = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.getDate()

  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // 获取第一天是星期几（0-6，0是周日）
  const firstDayOfWeek = firstDay.getDay()

  const days: CalendarDay[] = []

  // 填充上个月的日期
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      isToday: false,
      inMonth: false,
      completed: false
    })
  }

  // 填充当月的日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    // 模拟完成状态：随机生成，但今天的日期根据selectedUser的状态
    const completed = i === today
      ? selectedUser.value?.todayCompleted || false
      : Math.random() > 0.3

    days.push({
      day: i,
      isToday: i === today,
      inMonth: true,
      completed
    })
  }

  // 填充下个月的日期，补齐到35或42个格子
  const remainingDays = days.length % 7 === 0 ? 0 : 7 - (days.length % 7)
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      isToday: false,
      inMonth: false,
      completed: false
    })
  }

  return days
})

// 方法
const selectGroup = (group: Group) => {
  selectedGroup.value = group
  selectedUser.value = null
}

const selectUser = (user: GroupMember) => {
  selectedUser.value = user
}
</script>
