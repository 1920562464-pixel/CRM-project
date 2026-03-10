<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <Calculator :size="28" class="text-amber-600" />
        成本核算
      </h1>
      <p class="text-slate-500 mt-1">人力成本、库存成本、服务成本分析</p>
    </div>

    <!-- Tab 导航 -->
    <div class="flex items-center gap-2 border-b border-slate-200">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
        :class="activeTab === tab.id
          ? 'border-amber-600 text-amber-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'"
      >
        <component :is="tab.icon" :size="16" />
        {{ tab.name }}
      </button>
    </div>

    <!-- 人力成本 -->
    <div v-if="activeTab === 'labor'" class="space-y-4">
      <!-- 同计操作栏 -->
      <div class="flex items-center justify-between">
        <div class="text-sm text-slate-600">
          <span class="font-medium">数据来源：</span>
          <span class="text-slate-500">薪酬管理模块</span>
        </div>
        <button
          @click="syncFromSalary"
          class="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 flex items-center gap-2 text-sm font-medium shadow-lg shadow-amber-200 transition-all"
        >
          <RefreshCw :size="16" />
          同步薪酬数据
        </button>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg shadow-amber-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">人力总成本</span>
            <Users :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ laborCost.totalCost.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">本月累计</div>
        </div>

        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">教练成本</span>
            <Dumbbell :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ laborCost.coachCost.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">占比 {{ ((laborCost.coachCost / laborCost.totalCost) * 100).toFixed(1) }}%</div>
        </div>

        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg shadow-green-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">医生成本</span>
            <Stethoscope :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ laborCost.doctorCost.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">占比 {{ ((laborCost.doctorCost / laborCost.totalCost) * 100).toFixed(1) }}%</div>
        </div>

        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg shadow-purple-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">顾问成本</span>
            <UserCheck :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ laborCost.consultantCost.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">占比 {{ ((laborCost.consultantCost / laborCost.totalCost) * 100).toFixed(1) }}%</div>
        </div>
      </div>

      <!-- 人力成本明细 -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-4 border-b border-slate-200">
          <h3 class="text-lg font-bold text-slate-900">人力成本明细</h3>
        </div>

        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">员工姓名</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">岗位</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">基本工资</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">绩效提成</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">社保公积金</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">总成本</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="item in laborDetails"
              :key="item.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                    {{ item.name.charAt(0) }}
                  </div>
                  <span class="font-medium text-slate-900">{{ item.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="getRoleBadgeClass(item.role)"
                >
                  {{ item.role }}
                </span>
              </td>
              <td class="px-6 py-4 text-right text-sm text-slate-900">¥{{ item.baseSalary.toLocaleString() }}</td>
              <td class="px-6 py-4 text-right text-sm text-green-600 font-medium">+¥{{ item.commission.toLocaleString() }}</td>
              <td class="px-6 py-4 text-right text-sm text-slate-600">¥{{ item.socialSecurity.toLocaleString() }}</td>
              <td class="px-6 py-4 text-right">
                <div class="text-lg font-bold text-amber-600">¥{{ item.totalCost.toLocaleString() }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 成本趋势 -->
      <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-900">人力成本趋势（近6个月）</h3>
          <div class="flex items-center gap-4 text-sm">
            <div class="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg">
              <div class="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500"></div>
              <span class="text-slate-700 font-medium">人力成本</span>
            </div>
            <div class="flex items-center gap-2 text-slate-500">
              <TrendingUp :size="16" />
              <span>平均: ¥{{ (costTrend.reduce((sum, m) => sum + m.amount, 0) / costTrend.length / 1000).toFixed(1) }}k</span>
            </div>
          </div>
        </div>

        <!-- 折线图容器 -->
        <div class="relative">
          <!-- Y轴和网格线区域 -->
          <div class="absolute left-14 right-4 top-0 bottom-10 pointer-events-none">
            <!-- 网格线 -->
            <div class="h-full flex flex-col justify-between">
              <div v-for="i in 5" :key="i" class="relative border-t border-slate-100">
                <span class="absolute -left-14 -top-2.5 text-xs text-slate-400 w-10 text-right pr-2">
                  ¥{{ ((maxCostTrend / 4) * (5 - i) / 1000).toFixed(0) }}k
                </span>
              </div>
            </div>
          </div>

          <!-- SVG 折线图 -->
          <svg class="w-full h-52 pl-14 pr-4" viewBox="0 0 800 200" preserveAspectRatio="none">
            <defs>
              <!-- 渐变填充 -->
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:rgb(251, 191, 36);stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:rgb(251, 191, 36);stop-opacity:0" />
              </linearGradient>
              <!-- 阴影滤镜 -->
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgb(251, 191, 36)" flood-opacity="0.3"/>
              </filter>
            </defs>

            <!-- 区域填充 -->
            <path
              :d="getAreaPath()"
              fill="url(#areaGradient)"
              class="transition-all duration-500"
            />

            <!-- 折线 -->
            <path
              :d="getLinePath()"
              fill="none"
              stroke="rgb(251, 146, 60)"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
              filter="url(#shadow)"
              class="transition-all duration-500"
            />

            <!-- 数据点和交互区域 -->
            <g v-for="(month, index) in costTrend" :key="index">
              <!-- 数据点圆圈 -->
              <circle
                :cx="getPointX(index)"
                :cy="getPointY(month.amount)"
                :r="hoveredMonthIndex === index ? 8 : 5"
                :fill="hoveredMonthIndex === index ? 'rgb(251, 146, 60)' : 'white'"
                :stroke="hoveredMonthIndex === index ? 'rgb(251, 146, 60)' : 'rgb(251, 146, 60)'"
                :stroke-width="hoveredMonthIndex === index ? 3 : 2"
                class="transition-all duration-200 cursor-pointer"
                @mouseenter="handlePointMouseEnter($event, index)"
                @mouseleave="handleMonthMouseLeave"
              />

              <!-- 数值标签 -->
              <text
                :x="getPointX(index)"
                :y="getPointY(month.amount) - 15"
                text-anchor="middle"
                class="text-xs font-bold fill-slate-700 transition-all duration-200"
                :class="{ 'fill-amber-600': hoveredMonthIndex === index }"
              >
                ¥{{ (month.amount / 1000).toFixed(1) }}k
              </text>

              <!-- 月份标签 -->
              <text
                :x="getPointX(index)"
                y="195"
                text-anchor="middle"
                class="text-xs font-semibold fill-slate-600"
              >
                {{ month.month }}
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>

    <!-- 库存成本 -->
    <div v-else-if="activeTab === 'inventory'" class="space-y-4">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-5 text-white shadow-lg shadow-cyan-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">库存总值</span>
            <Package :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ inventoryCost.totalValue.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">当前库存</div>
        </div>

        <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg shadow-indigo-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">本月采购</span>
            <ShoppingCart :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ inventoryCost.purchaseCost.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">采购成本</div>
        </div>

        <div class="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-5 text-white shadow-lg shadow-pink-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">本月消耗</span>
            <TrendingDown :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ inventoryCost.consumeCost.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">消耗成本</div>
        </div>

        <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg shadow-amber-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">周转天数</span>
            <Clock :size="20" />
          </div>
          <div class="text-3xl font-bold">{{ inventoryCost.turnoverDays }}</div>
          <div class="text-xs opacity-75 mt-2">天</div>
        </div>
      </div>

      <!-- 库存成本明细 -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-slate-200">
          <h3 class="text-lg font-bold text-slate-900">库存成本明细</h3>
        </div>

        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">产品名称</th>
              <th class="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">分类</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">期初库存</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">本期入库</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">本期消耗</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">期末库存</th>
              <th class="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">库存金额</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="item in inventoryDetails"
              :key="item.id"
              class="hover:bg-slate-50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="font-medium text-slate-900">{{ item.name }}</div>
                <div class="text-xs text-slate-500">SKU: {{ item.sku }}</div>
              </td>
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                  :class="getCategoryBadgeClass(item.category)"
                >
                  {{ item.category }}
                </span>
              </td>
              <td class="px-6 py-4 text-right text-sm text-slate-600">{{ item.beginStock }}</td>
              <td class="px-6 py-4 text-right text-sm text-green-600 font-medium">+{{ item.inStock }}</td>
              <td class="px-6 py-4 text-right text-sm text-red-600 font-medium">-{{ item.outStock }}</td>
              <td class="px-6 py-4 text-right text-sm text-slate-900 font-medium">{{ item.endStock }}</td>
              <td class="px-6 py-4 text-right">
                <div class="text-lg font-bold text-cyan-600">¥{{ item.value.toLocaleString() }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 服务成本 -->
    <div v-else-if="activeTab === 'service'" class="space-y-4">
      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl p-5 text-white shadow-lg shadow-violet-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">服务总成本</span>
            <Target :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ serviceCost.totalCost.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">本月累计</div>
        </div>

        <div class="bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl p-5 text-white shadow-lg shadow-rose-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">私教成本</span>
            <User :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ serviceCost.personalCost.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">{{ serviceCost.personalSessions }} 节课</div>
        </div>

        <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg shadow-emerald-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">团课成本</span>
            <Users :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ serviceCost.groupCost.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">{{ serviceCost.groupSessions }} 节课</div>
        </div>

        <div class="bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl p-5 text-white shadow-lg shadow-sky-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">咨询成本</span>
            <MessageSquare :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ serviceCost.consultCost.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">{{ serviceCost.consultSessions }} 次</div>
        </div>
      </div>

      <!-- 服务成本明细 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 私教成本 -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User :size="18" class="text-rose-600" />
            私教成本分析
          </h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-rose-50 rounded-lg">
              <span class="text-sm text-slate-700">教练课时费</span>
              <span class="font-semibold text-slate-900">¥8,500</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-rose-50 rounded-lg">
              <span class="text-sm text-slate-700">场地占用成本</span>
              <span class="font-semibold text-slate-900">¥2,100</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-rose-50 rounded-lg">
              <span class="text-sm text-slate-700">设备折旧</span>
              <span class="font-semibold text-slate-900">¥800</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gradient-to-r from-rose-100 to-pink-100 rounded-lg">
              <span class="text-sm font-bold text-slate-900">小计</span>
              <span class="text-lg font-bold text-rose-600">¥11,400</span>
            </div>
          </div>
        </div>

        <!-- 团课成本 -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users :size="18" class="text-emerald-600" />
            团课成本分析
          </h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
              <span class="text-sm text-slate-700">教练课时费</span>
              <span class="font-semibold text-slate-900">¥4,200</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
              <span class="text-sm text-slate-700">场地占用成本</span>
              <span class="font-semibold text-slate-900">¥1,800</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
              <span class="text-sm text-slate-700">设备折旧</span>
              <span class="font-semibold text-slate-900">¥600</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg">
              <span class="text-sm font-bold text-slate-900">小计</span>
              <span class="text-lg font-bold text-emerald-600">¥6,600</span>
            </div>
          </div>
        </div>

        <!-- 咨询成本 -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MessageSquare :size="18" class="text-sky-600" />
            咨询成本分析
          </h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-sky-50 rounded-lg">
              <span class="text-sm text-slate-700">医生咨询费</span>
              <span class="font-semibold text-slate-900">¥3,200</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-sky-50 rounded-lg">
              <span class="text-sm text-slate-700">健康顾问费</span>
              <span class="font-semibold text-slate-900">¥2,400</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-sky-50 rounded-lg">
              <span class="text-sm text-slate-700">其他支出</span>
              <span class="font-semibold text-slate-900">¥400</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gradient-to-r from-sky-100 to-blue-100 rounded-lg">
              <span class="text-sm font-bold text-slate-900">小计</span>
              <span class="text-lg font-bold text-sky-600">¥6,000</span>
            </div>
          </div>
        </div>

        <!-- 单位成本 -->
        <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 :size="18" class="text-amber-600" />
            单位服务成本
          </h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
              <span class="text-sm text-slate-700">私教单节成本</span>
              <span class="text-lg font-bold text-amber-600">¥190</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
              <span class="text-sm text-slate-700">团课单节成本</span>
              <span class="text-lg font-bold text-amber-600">¥330</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
              <span class="text-sm text-slate-700">咨询单次成本</span>
              <span class="text-lg font-bold text-amber-600">¥120</span>
            </div>
            <div class="flex justify-between items-center p-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg">
              <span class="text-sm font-bold text-slate-900">平均单位成本</span>
              <span class="text-lg font-bold text-amber-600">¥213</span>
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
  Calculator,
  Users,
  Dumbbell,
  Stethoscope,
  UserCheck,
  Package,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Clock,
  Target,
  User,
  MessageSquare,
  BarChart3,
  RefreshCw,
  Calendar
} from 'lucide-vue-next'
import { useSalary } from '../composables/useSalary'
import { useToast } from '../composables/useToast'

const toast = useToast()

interface CostTab {
  id: string
  name: string
  icon: any
}

interface LaborDetail {
  id: string
  name: string
  role: string
  baseSalary: number
  commission: number
  socialSecurity: number
  totalCost: number
}

interface InventoryDetail {
  id: string
  name: string
  sku: string
  category: string
  beginStock: number
  inStock: number
  outStock: number
  endStock: number
  value: number
}

const tabs: CostTab[] = [
  { id: 'labor', name: '人力成本', icon: Users },
  { id: 'inventory', name: '库存成本', icon: Package },
  { id: 'service', name: '服务成本', icon: Target }
]

const activeTab = ref('labor')

// Tooltip state
const hoveredMonthIndex = ref(-1)
const tooltipPosition = ref({ x: 0, y: 0 })

// SVG图表配置
const svgWidth = 800
const svgHeight = 200
const chartPadding = { top: 20, right: 20, bottom: 30, left: 0 }
const chartWidth = svgWidth - chartPadding.left - chartPadding.right
const chartHeight = svgHeight - chartPadding.top - chartPadding.bottom

// 计算点的X坐标
const getPointX = (index: number) => {
  return chartPadding.left + (chartWidth / (costTrend.value.length - 1)) * index
}

// 计算点的Y坐标
const getPointY = (amount: number) => {
  const ratio = amount / maxCostTrend.value
  return chartPadding.top + chartHeight * (1 - ratio)
}

// 生成折线路径
const getLinePath = () => {
  const points = costTrend.value.map((month, index) => {
    const x = getPointX(index)
    const y = getPointY(month.amount)
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  })
  return points.join(' ')
}

// 生成区域填充路径
const getAreaPath = () => {
  const linePoints = costTrend.value.map((month, index) => {
    const x = getPointX(index)
    const y = getPointY(month.amount)
    return `${x} ${y}`
  })

  return [
    `M ${linePoints[0]}`,
    ...linePoints.slice(1).map(p => `L ${p}`),
    `L ${getPointX(costTrend.value.length - 1)} ${chartPadding.top + chartHeight}`,
    `L ${getPointX(0)} ${chartPadding.top + chartHeight}`,
    'Z'
  ].join(' ')
}

const handlePointMouseEnter = (event: MouseEvent, index: number) => {
  hoveredMonthIndex.value = index
  const svg = (event.target as SVGElement).closest('svg')
  if (svg) {
    const rect = svg.getBoundingClientRect()
    const x = rect.left + getPointX(index)
    const y = rect.top + getPointY(costTrend.value[index].amount)
    tooltipPosition.value = {
      x: x,
      y: y - 10
    }
  }
}

const handleMonthMouseLeave = () => {
  hoveredMonthIndex.value = -1
}

const laborCost = ref({
  totalCost: 28500,
  coachCost: 15200,
  doctorCost: 8600,
  consultantCost: 4700
})

const laborDetails = ref<LaborDetail[]>([
  {
    id: '1',
    name: '王教练',
    role: '教练',
    baseSalary: 6000,
    commission: 3200,
    socialSecurity: 1500,
    totalCost: 10700
  },
  {
    id: '2',
    name: '李教练',
    role: '教练',
    baseSalary: 5500,
    commission: 2800,
    socialSecurity: 1400,
    totalCost: 9700
  },
  {
    id: '3',
    name: '张医生',
    role: '医生',
    baseSalary: 7000,
    commission: 1800,
    socialSecurity: 1800,
    totalCost: 10600
  },
  {
    id: '4',
    name: '陈顾问',
    role: '顾问',
    baseSalary: 4500,
    commission: 1500,
    socialSecurity: 1200,
    totalCost: 7200
  }
])

const costTrend = ref([
  { month: '9月', amount: 26500 },
  { month: '10月', amount: 27200 },
  { month: '11月', amount: 28100 },
  { month: '12月', amount: 29800 },
  { month: '1月', amount: 27600 },
  { month: '2月', amount: 28500 }
])

const inventoryCost = ref({
  totalValue: 76400,
  purchaseCost: 18500,
  consumeCost: 13800,
  turnoverDays: 45
})

const inventoryDetails = ref<InventoryDetail[]>([
  {
    id: '1',
    name: '乳清蛋白粉',
    sku: 'PROT-001',
    category: '营养补剂',
    beginStock: 120,
    inStock: 50,
    outStock: 35,
    endStock: 135,
    value: 27000
  },
  {
    id: '2',
    name: '维生素复合片',
    sku: 'VITM-002',
    category: '营养补剂',
    beginStock: 200,
    inStock: 100,
    outStock: 80,
    endStock: 220,
    value: 17600
  },
  {
    id: '3',
    name: '运动饮料',
    sku: 'BEV-003',
    category: '运动饮料',
    beginStock: 300,
    inStock: 200,
    outStock: 150,
    endStock: 350,
    value: 10500
  },
  {
    id: '4',
    name: '瑜伽垫',
    sku: 'EQP-004',
    category: '运动器材',
    beginStock: 50,
    inStock: 20,
    outStock: 10,
    endStock: 60,
    value: 12000
  },
  {
    id: '5',
    name: '弹力带套装',
    sku: 'EQP-005',
    category: '运动器材',
    beginStock: 80,
    inStock: 30,
    outStock: 25,
    endStock: 85,
    value: 9300
  }
])

const serviceCost = ref({
  totalCost: 24000,
  personalCost: 11400,
  personalSessions: 60,
  groupCost: 6600,
  groupSessions: 20,
  consultCost: 6000,
  consultSessions: 50
})

// 从薪酬管理同步人力成本数据
const syncFromSalary = () => {
  toast.info('同步中', '正在从薪酬管理模块同步工资条数据...')

  try {
    const { getMonthSalarySlips, generateSalarySlip, approveSalarySlip } = useSalary()
    const currentMonth = '2025-02'

    // 获取当前月份的工资条
    let salarySlips = getMonthSalarySlips(currentMonth)

    // 如果没有数据，生成测试数据
    if (salarySlips.length === 0) {
      generateSalarySlip('E001', currentMonth, 'coach-a')
      generateSalarySlip('E002', currentMonth, 'coach-a')
      generateSalarySlip('E003', currentMonth, 'doctor-a')
      generateSalarySlip('E004', currentMonth, 'doctor-a')
      generateSalarySlip('E005', currentMonth, 'consultant-a')

      salarySlips = getMonthSalarySlips(currentMonth)

      // 自动审核所有工资条
      salarySlips.forEach((slip: any) => {
        if (slip.status === 'draft') {
          approveSalarySlip(slip.id, 'admin')
        }
      })

      salarySlips = getMonthSalarySlips(currentMonth)
    }

    // 转换工资条数据为人力成本明细
    const newLaborDetails: LaborDetail[] = salarySlips.map((slip: any) => {
      const baseSalary = slip.income?.baseSalary || 0
      const commission = slip.income?.commission?.totalAmount || 0
      const richBiscuits = slip.income?.richBiscuits?.value || 0
      const onlineServices = slip.income?.onlineServices?.totalAmount || 0
      const socialInsurance = slip.deductions?.socialInsurance?.total || 0
      const totalCost = slip.summary?.netSalary || 0

      // 根据薪资方案确定岗位
      let role = '顾问'
      if (slip.schemeId?.includes('coach')) role = '教练'
      else if (slip.schemeId?.includes('doctor')) role = '医生'

      return {
        id: slip.id,
        name: slip.employeeName,
        role,
        baseSalary,
        commission: commission + richBiscuits + onlineServices,
        socialSecurity: socialInsurance,
        totalCost
      }
    })

    // 更新明细数据
    laborDetails.value = newLaborDetails

    // 重新计算统计数据
    const totalCost = newLaborDetails.reduce((sum, item) => sum + item.totalCost, 0)
    const coachCost = newLaborDetails
      .filter(item => item.role === '教练')
      .reduce((sum, item) => sum + item.totalCost, 0)
    const doctorCost = newLaborDetails
      .filter(item => item.role === '医生')
      .reduce((sum, item) => sum + item.totalCost, 0)
    const consultantCost = newLaborDetails
      .filter(item => item.role === '顾问')
      .reduce((sum, item) => sum + item.totalCost, 0)

    laborCost.value = {
      totalCost,
      coachCost,
      doctorCost,
      consultantCost
    }

    toast.success(
      '同步成功',
      `已同步 ${newLaborDetails.length} 条薪酬数据，总人力成本 ¥${totalCost.toLocaleString()}`
    )
  } catch (error) {
    console.error('同步薪酬数据失败:', error)
    toast.error('同步失败', '无法从薪酬管理模块获取数据')
  }
}

const getRoleBadgeClass = (role: string) => {
  const classes: Record<string, string> = {
    '教练': 'bg-blue-100 text-blue-800',
    '医生': 'bg-green-100 text-green-800',
    '顾问': 'bg-purple-100 text-purple-800'
  }
  return classes[role] || 'bg-slate-100 text-slate-800'
}

const getCategoryBadgeClass = (category: string) => {
  const classes: Record<string, string> = {
    '营养补剂': 'bg-amber-100 text-amber-800',
    '运动饮料': 'bg-blue-100 text-blue-800',
    '运动器材': 'bg-green-100 text-green-800'
  }
  return classes[category] || 'bg-slate-100 text-slate-800'
}

// 计算最大成本趋势值（用于图表缩放）
const maxCostTrend = computed(() => {
  const max = Math.max(...costTrend.value.map(m => m.amount))
  // 向上取整到最近的5000
  return Math.ceil(max / 5000) * 5000
})

// 获取趋势标签颜色（保留给其他地方使用）
const getTrendLabelClass = (amount: number, max: number) => {
  const ratio = amount / max
  if (ratio >= 0.8) return 'text-amber-600'
  if (ratio >= 0.6) return 'text-amber-500'
  return 'text-slate-600'
}
</script>
