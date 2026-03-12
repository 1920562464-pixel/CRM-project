<template>
  <div class="space-y-6 animate-in fade-in duration-500">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="p-4 rounded-xl shadow-sm flex items-center justify-between" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border-light)'
      }">
        <div>
          <div class="text-sm font-medium" :style="{ color: 'var(--text-secondary)' }">需要关注 (高风险)</div>
          <div class="text-2xl font-bold mt-1" style="color: #ef4444;">
            {{ stats.highRisk }} <span class="text-xs font-normal" style="color: #f87171;">人</span>
          </div>
        </div>
        <div class="w-10 h-10 rounded-full flex items-center justify-center" :style="{
          background: isBlackGold.value ? 'rgba(239, 68, 68, 0.2)' : '#fef2f2',
          color: '#ef4444'
        }">
          <AlertTriangle :size="20" />
        </div>
      </div>
      <div class="p-4 rounded-xl shadow-sm flex items-center justify-between" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border-light)'
      }">
        <div>
          <div class="text-sm font-medium" :style="{ color: 'var(--text-secondary)' }">任务未达标</div>
          <div class="text-2xl font-bold mt-1" style="color: #f97316;">
            {{ stats.nonCompliant }} <span class="text-xs font-normal" style="color: #fb923c;">人</span>
          </div>
        </div>
        <div class="w-10 h-10 rounded-full flex items-center justify-center" :style="{
          background: isBlackGold.value ? 'rgba(249, 115, 22, 0.2)' : '#fff7ed',
          color: '#f97316'
        }">
          <Activity :size="20" />
        </div>
      </div>
      <div class="p-4 rounded-xl shadow-sm flex items-center justify-between" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border-light)'
      }">
        <div>
          <div class="text-sm font-medium" :style="{ color: 'var(--text-secondary)' }">异常数据标记</div>
          <div class="text-2xl font-bold mt-1" :style="{ color: isBlackGold.value ? '#D4A84A' : '#4f46e5' }">
            {{ stats.abnormal }} <span class="text-xs font-normal" :style="{ color: isBlackGold.value ? '#E6C87D' : '#818cf8' }">条</span>
          </div>
        </div>
        <div class="w-10 h-10 rounded-full flex items-center justify-center" :style="{
          background: isBlackGold.value ? 'rgba(184, 134, 11, 0.2)' : '#eef2ff',
          color: isBlackGold.value ? '#D4A84A' : '#4f46e5'
        }">
          <BrainCircuit :size="20" />
        </div>
      </div>
      <div class="p-4 rounded-xl shadow-sm flex items-center justify-between" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border-light)'
      }">
        <div>
          <div class="text-sm font-medium" :style="{ color: 'var(--text-secondary)' }">总活跃用户</div>
          <div class="text-2xl font-bold mt-1" :style="{ color: 'var(--text-primary)' }">{{ stats.total }}</div>
        </div>
        <div class="w-10 h-10 rounded-full flex items-center justify-center" :style="{
          background: 'var(--fill-light)',
          color: 'var(--text-secondary)'
        }">
          <Users :size="20" />
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="flex flex-col md:flex-row gap-4 items-center justify-between p-4 rounded-xl shadow-sm" :style="{
      background: 'var(--card)',
      border: '1px solid var(--border)'
    }">
      <div class="relative w-full md:w-96">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2" :size="18" :style="{ color: 'var(--text-placeholder)' }" />
        <input
          v-model="searchQuery"
          @input="currentPage = 1"
          type="text"
          placeholder="搜索客户姓名、ID或手机号..."
          class="w-full pl-10 pr-8 px-4 py-2 rounded-lg focus:outline-none focus:ring-2"
          :style="{
            border: '1px solid var(--border)',
            background: 'var(--background)',
            color: 'var(--text-primary)',
            '--tw-ring-color': isBlackGold.value ? 'rgba(184, 134, 11, 0.5)' : 'rgba(79, 70, 229, 0.5)'
          }"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="absolute right-3 top-1/2 -translate-y-1/2"
          :style="{ color: 'var(--text-placeholder)' }"
        >
          <X :size="16" />
        </button>
      </div>
      <div class="flex items-center gap-3 w-full md:w-auto">
        <select
          v-model="statusFilter"
          class="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm w-[140px]"
          :style="{
            border: '1px solid var(--border)',
            background: 'var(--background)',
            color: 'var(--text-primary)',
            '--tw-ring-color': isBlackGold.value ? 'rgba(184, 134, 11, 0.5)' : 'rgba(79, 70, 229, 0.5)'
          }"
        >
          <option value="all">全部状态</option>
          <option value="通话">通话中</option>
          <option value="潜客">潜客</option>
        </select>
        <select
          v-model="consultationFilter"
          class="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm w-[140px]"
          :style="{
            border: '1px solid var(--border)',
            background: 'var(--background)',
            color: 'var(--text-primary)',
            '--tw-ring-color': isBlackGold.value ? 'rgba(184, 134, 11, 0.5)' : 'rgba(79, 70, 229, 0.5)'
          }"
        >
          <option value="all">全部问诊</option>
          <option value="需问诊">需问诊</option>
          <option value="不需问诊">不需问诊</option>
        </select>
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          class="px-3 py-2 rounded-lg text-sm flex items-center gap-1 transition-colors"
          :style="{
            color: 'var(--text-regular)'
          }"
        >
          <X :size="16" />
          清除
        </button>
        <button
          @click="openAddClientModal"
          class="px-4 py-2 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
          :style="{
            background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5'
          }"
        >
          <Plus :size="16" />
          添加客户
        </button>
      </div>
    </div>

    <!-- 结果统计 -->
    <div v-if="filteredClients.length !== MOCK_CLIENTS.length" class="flex items-center gap-2 text-sm text-slate-600">
      <span>找到 {{ filteredClients.length }} 条结果</span>
      <button @click="clearFilters" class="text-indigo-600 hover:underline text-sm">
        显示全部
      </button>
    </div>

    <!-- 客户列表 -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm min-w-[1200px]">
          <thead class="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th class="px-4 py-3">客户信息</th>
              <th class="px-4 py-3">性别</th>
              <th class="px-4 py-3">年龄</th>
              <th class="px-4 py-3">状态</th>
              <th class="px-4 py-3">渠道</th>
              <th class="px-4 py-3">城市</th>
              <th class="px-4 py-3">支持团队</th>
              <th class="px-4 py-3">CGM信息</th>
              <th class="px-4 py-3">问诊</th>
              <th class="px-4 py-3">小程序</th>
              <th class="px-4 py-3">依从度</th>
              <th class="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <template v-if="currentClients.length > 0">
              <tr
                v-for="client in currentClients"
                :key="client.id"
                class="hover:bg-slate-50/80 transition-colors group"
              >
                <td class="px-4 py-4">
                  <button
                    @click="navigateToProfile(client.id)"
                    class="flex items-center gap-3 text-left group-hover:text-indigo-600 transition-colors"
                  >
                    <img
                      :src="client.avatar"
                      :alt="client.name"
                      class="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <div class="font-semibold text-slate-900">{{ client.name }}</div>
                      <div class="text-xs text-slate-500">ID: {{ client.id.padStart(4, '0') }}</div>
                    </div>
                  </button>
                </td>
                <td class="px-4 py-4">
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 rounded text-xs font-medium border"
                    :class="client.gender === '男'
                      ? 'bg-blue-50 text-blue-600 border-blue-100'
                      : 'bg-pink-50 text-pink-600 border-pink-100'"
                  >
                    {{ client.gender }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium border border-slate-200">
                    {{ client.age }}岁
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="client.status === '通话'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-slate-100 text-slate-600'"
                  >
                    {{ client.status }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span class="text-slate-600 text-xs">{{ client.channel }}</span>
                </td>
                <td class="px-4 py-4">
                  <span class="text-slate-600 text-xs">{{ client.city }}</span>
                </td>
                <td class="px-4 py-4">
                  <span
                    class="text-xs"
                    :class="client.supportTeam === '—' ? 'text-slate-400' : 'text-slate-700 font-medium'"
                  >
                    {{ client.supportTeam }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 text-slate-500">
                    {{ client.cgmInfo }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="client.consultation === '需问诊'
                      ? 'bg-orange-50 text-orange-600'
                      : 'bg-slate-100 text-slate-600'"
                  >
                    {{ client.consultation }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="client.miniProgram === '已注册'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-slate-100 text-slate-600'"
                  >
                    {{ client.miniProgram }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <select
                    :value="client.compliance"
                    @change="updateCompliance(client.id, $event)"
                    class="px-2 py-1 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-[100px]"
                  >
                    <option value="优秀">优秀</option>
                    <option value="良好">良好</option>
                    <option value="一般">一般</option>
                    <option value="较差">较差</option>
                    <option value="未知">未知</option>
                  </select>
                </td>
                <td class="px-4 py-4">
                  <button
                    @click="navigateToProfile(client.id)"
                    class="px-3 py-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg text-sm transition-colors"
                  >
                    查看详情
                  </button>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="12" class="px-4 py-12 text-center text-slate-500">
                <div class="flex flex-col items-center gap-3">
                  <Search :size="48" class="text-slate-300" />
                  <div class="text-lg font-medium">未找到匹配的客户</div>
                  <div class="text-sm">请尝试调整搜索条件或筛选器</div>
                  <button
                    @click="clearFilters"
                    class="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm transition-colors"
                  >
                    清除所有筛选
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分页 -->
      <div v-if="filteredClients.length > 0" class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm">
        <span class="text-slate-600">
          显示 {{ startIndex + 1 }}-{{ Math.min(endIndex, filteredClients.length) }} 共
          {{ filteredClients.length }} 条
        </span>
        <div class="flex items-center gap-2">
          <button
            @click="currentPage = Math.max(1, currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
          >
            <ChevronLeft :size="16" />
            上一页
          </button>
          <div class="flex items-center gap-1">
            <button
              v-for="pageNum in pageNumbers"
              :key="pageNum"
              @click="currentPage = pageNum"
              class="w-9 h-9 rounded text-sm transition-colors"
              :class="currentPage === pageNum
                ? 'bg-indigo-600 text-white'
                : 'border border-slate-200 hover:bg-white'"
            >
              {{ pageNum }}
            </button>
          </div>
          <button
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
          >
            下一页
            <ChevronRight :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- 添加客户弹窗 -->
    <Teleport to="body">
      <div
        v-if="showAddModal"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200"
        @click.self="closeAddModal"
      >
        <div
          class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200"
          @click.stop
        >
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg shadow-sm">
                <UserPlus :size="20" class="text-white" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-800">添加新客户</h3>
                <p class="text-xs text-slate-500">填写客户基本信息创建档案</p>
              </div>
            </div>
            <button
              @click="closeAddModal"
              class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X :size="20" />
            </button>
          </div>

          <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <form @submit.prevent="saveNewClient" class="space-y-6">
              <!-- 基础信息 -->
              <div>
                <h4 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
                  基础信息
                </h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      姓名 <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="newClient.name"
                      type="text"
                      required
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="请输入客户姓名"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      性别 <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="newClient.gender"
                      required
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">请选择</option>
                      <option value="男">男</option>
                      <option value="女">女</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      年龄 <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model.number="newClient.age"
                      type="number"
                      required
                      min="1"
                      max="120"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="请输入年龄"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">
                      手机号 <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="newClient.phone"
                      type="tel"
                      required
                      pattern="[0-9]{11}"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="请输入11位手机号"
                    />
                  </div>
                </div>
              </div>

              <!-- 来源信息 -->
              <div>
                <h4 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  来源信息
                </h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">渠道来源</label>
                    <select
                      v-model="newClient.channel"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">请选择</option>
                      <option value="线上">线上</option>
                      <option value="线下">线下</option>
                      <option value="渠道">渠道</option>
                      <option value="转介绍">转介绍</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">所在城市</label>
                    <input
                      v-model="newClient.city"
                      type="text"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="请输入城市"
                    />
                  </div>
                </div>
              </div>

              <!-- 健康信息 -->
              <div>
                <h4 class="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                  健康信息
                </h4>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">身高 (cm)</label>
                    <input
                      v-model.number="newClient.height"
                      type="number"
                      min="100"
                      max="250"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="请输入身高"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">体重 (kg)</label>
                    <input
                      v-model.number="newClient.weight"
                      type="number"
                      min="30"
                      max="200"
                      class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="请输入体重"
                    />
                  </div>
                </div>
              </div>

              <!-- 额外备注 -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">备注信息</label>
                <textarea
                  v-model="newClient.notes"
                  rows="3"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="请输入备注信息（可选）"
                ></textarea>
              </div>
            </form>
          </div>

          <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
            <button
              @click="closeAddModal"
              type="button"
              class="px-4 py-2 text-slate-600 font-medium hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
            >
              取消
            </button>
            <button
              @click="saveNewClient"
              type="button"
              class="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2"
            >
              <Plus :size="16" />
              创建客户
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'
import { useUserCompliance } from '../composables/useUserCompliance'

// 主题相关
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')

// 依从度管理
const { getUserCompliance, setUserCompliance, initUserCompliance } = useUserCompliance()
import {
  Search,
  Plus,
  AlertTriangle,
  Activity,
  BrainCircuit,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  UserPlus
} from 'lucide-vue-next'
import Toast from '../components/shared/Toast.vue'

interface Client {
  id: string
  name: string
  gender: '男' | '女'
  age: number
  avatar: string
  status: string
  channel: string
  city: string
  supportTeam: string
  cgmInfo: string
  consultation: string
  miniProgram: string
  todayMeal: string
  compliance: string
  riskLevel: 'high' | 'medium' | 'low'
  phone?: string
  height?: string
  weight?: string
}

const router = useRouter()
const toastRef = ref<InstanceType<typeof Toast>>()

const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: '王磊',
    gender: '男',
    age: 38,
    avatar: 'https://images.unsplash.com/photo-1656313826909-1f89d1702a81?w=100',
    status: '通话',
    channel: '渠道',
    city: '北京',
    supportTeam: '医生-胡医森',
    cgmInfo: '未佩戴',
    consultation: '需问诊',
    miniProgram: '已注册',
    todayMeal: '早',
    compliance: '优秀',
    riskLevel: 'high',
    phone: '13800138001'
  },
  {
    id: '2',
    name: '李淑芬',
    gender: '女',
    age: 58,
    avatar: 'https://images.unsplash.com/photo-1581065178026-390bc4e78dad?w=100',
    status: '潜客',
    channel: '线上',
    city: '上海',
    supportTeam: '—',
    cgmInfo: '未佩戴',
    consultation: '不需问诊',
    miniProgram: '未注册',
    todayMeal: '早',
    compliance: '良好',
    riskLevel: 'low',
    phone: '13800138002'
  },
  {
    id: '3',
    name: '张建国',
    gender: '男',
    age: 65,
    avatar: 'https://images.unsplash.com/photo-1763570647902-49440de7732f?w=100',
    status: '通话',
    channel: '线下',
    city: '深圳',
    supportTeam: '教练-李明',
    cgmInfo: '佩戴中',
    consultation: '已问诊',
    miniProgram: '已注册',
    todayMeal: '早 午 晚',
    compliance: '一般',
    riskLevel: 'medium',
    phone: '13800138003'
  },
  {
    id: '4',
    name: '刘芳',
    gender: '女',
    age: 42,
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=100',
    status: '通话',
    channel: '线上',
    city: '广州',
    supportTeam: '医生-王医师',
    cgmInfo: '佩戴中',
    consultation: '需问诊',
    miniProgram: '已注册',
    todayMeal: '早 午',
    compliance: '优秀',
    riskLevel: 'high',
    phone: '13800138004'
  },
  {
    id: '5',
    name: '陈伟',
    gender: '男',
    age: 55,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    status: '潜客',
    channel: '渠道',
    city: '杭州',
    supportTeam: '—',
    cgmInfo: '未佩戴',
    consultation: '不需问诊',
    miniProgram: '未注册',
    todayMeal: '早',
    compliance: '未知',
    riskLevel: 'low',
    phone: '13800138005'
  }
]

const searchQuery = ref('')
const statusFilter = ref<string>('all')
const consultationFilter = ref<string>('all')
const currentPage = ref(1)
const itemsPerPage = 10
const showAddModal = ref(false)

// 新客户表单
const newClient = reactive({
  name: '',
  gender: '',
  age: '',
  phone: '',
  channel: '',
  city: '',
  height: '',
  weight: '',
  notes: ''
})

// 过滤和搜索逻辑
const filteredClients = computed(() => {
  return MOCK_CLIENTS.filter((client) => {
    const matchesSearch =
      searchQuery.value === '' ||
      client.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      client.id.includes(searchQuery.value) ||
      client.phone?.includes(searchQuery.value)

    const matchesStatus = statusFilter.value === 'all' || client.status === statusFilter.value
    const matchesConsultation =
      consultationFilter.value === 'all' ||
      (consultationFilter.value === '需问诊' && client.consultation === '需问诊') ||
      (consultationFilter.value === '不需问诊' && client.consultation === '不需问诊')

    return matchesSearch && matchesStatus && matchesConsultation
  })
})

// 分页逻辑
const totalPages = computed(() => Math.ceil(filteredClients.value.length / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => startIndex.value + itemsPerPage)
const currentClients = computed(() => filteredClients.value.slice(startIndex.value, endIndex.value))

// 页码显示
const pageNumbers = computed(() => {
  const pages: number[] = []
  const maxPages = Math.min(5, totalPages.value)

  if (totalPages.value <= 5) {
    for (let i = 0; i < totalPages.value; i++) {
      pages.push(i + 1)
    }
  } else if (currentPage.value <= 3) {
    for (let i = 0; i < 5; i++) {
      pages.push(i + 1)
    }
  } else if (currentPage.value >= totalPages.value - 2) {
    for (let i = 0; i < 5; i++) {
      pages.push(totalPages.value - 4 + i)
    }
  } else {
    for (let i = 0; i < 5; i++) {
      pages.push(currentPage.value - 2 + i)
    }
  }

  return pages
})

// 统计数据
const stats = computed(() => {
  return {
    highRisk: MOCK_CLIENTS.filter((c) => c.riskLevel === 'high').length,
    nonCompliant: MOCK_CLIENTS.filter((c) =>
      ['一般', '较差', '未知'].includes(c.compliance)
    ).length,
    abnormal: MOCK_CLIENTS.filter((c) => c.consultation === '需问诊').length,
    total: MOCK_CLIENTS.length
  }
})

// 是否有激活的筛选器
const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' ||
    statusFilter.value !== 'all' ||
    consultationFilter.value !== 'all'
})

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const clearFilters = () => {
  searchQuery.value = ''
  statusFilter.value = 'all'
  consultationFilter.value = 'all'
  currentPage.value = 1
}

const navigateToProfile = (clientId: string) => {
  router.push(`/client-profile/${clientId}`)
}

const updateCompliance = (clientId: string, event: Event) => {
  const target = event.target as HTMLSelectElement
  const newValue = target.value as '优秀' | '良好' | '一般' | '较差' | '未知'
  setUserCompliance(clientId, newValue)

  // 更新MOCK_CLIENTS中的数据
  const client = MOCK_CLIENTS.find(c => c.id === clientId)
  if (client) {
    client.compliance = newValue
  }

  toastRef.value?.show(`已更新依从度为: ${newValue}`, 'success')
}

// 初始化依从度数据
MOCK_CLIENTS.forEach(client => {
  initUserCompliance(client.id)
  // 如果localStorage中有值，使用localStorage的值更新MOCK_CLIENTS
  const storedCompliance = getUserCompliance(client.id)
  if (storedCompliance !== '未知') {
    client.compliance = storedCompliance
  }
})

// 添加客户相关方法
const openAddClientModal = () => {
  // 重置表单
  Object.assign(newClient, {
    name: '',
    gender: '',
    age: '',
    phone: '',
    channel: '',
    city: '',
    height: '',
    weight: '',
    notes: ''
  })
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
}

const validatePhone = (phone: string): boolean => {
  return /^1[3-9]\d{9}$/.test(phone)
}

const saveNewClient = () => {
  // 验证必填字段
  if (!newClient.name.trim()) {
    toastRef.value?.show('请输入客户姓名', 'error')
    return
  }
  if (!newClient.gender) {
    toastRef.value?.show('请选择性别', 'error')
    return
  }
  if (!newClient.age) {
    toastRef.value?.show('请输入年龄', 'error')
    return
  }
  if (!newClient.phone) {
    toastRef.value?.show('请输入手机号', 'error')
    return
  }
  if (!validatePhone(newClient.phone)) {
    toastRef.value?.show('请输入正确的11位手机号', 'error')
    return
  }

  // 创建新客户对象
  const newId = String(MOCK_CLIENTS.length + 1)
  const client: Client = {
    id: newId,
    name: newClient.name,
    gender: newClient.gender as '男' | '女',
    age: Number(newClient.age),
    avatar: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100`,
    status: '潜客',
    channel: newClient.channel || '线上',
    city: newClient.city || '未知',
    supportTeam: '—',
    cgmInfo: '未佩戴',
    consultation: '不需问诊',
    miniProgram: '未注册',
    todayMeal: '早',
    compliance: '未知',
    riskLevel: 'low',
    phone: newClient.phone
  }

  // 添加到列表
  MOCK_CLIENTS.unshift(client)

  // 关闭弹窗并显示提示
  showAddModal.value = false
  toastRef.value?.show(`客户 ${newClient.name} 已成功创建`, 'success')

  // 重置表单
  Object.assign(newClient, {
    name: '',
    gender: '',
    age: '',
    phone: '',
    channel: '',
    city: '',
    height: '',
    weight: '',
    notes: ''
  })
}
</script>
