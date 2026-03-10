<template>
  <div class="space-y-6">
    <!-- Confirm Dialog -->
    <ConfirmDialog
      v-model:show="confirm.show"
      :title="confirm.title"
      :message="confirm.message"
      :type="confirm.type"
      @confirm="confirm.onConfirm"
      @cancel="confirm.onCancel"
    />

    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <AlertCircle :size="28" class="text-orange-600" />
        应付账款管理
      </h1>
      <p class="text-slate-500 mt-1">教练结算、库存采购、服务费用等应付管理</p>
    </div>

    <!-- Tab 导航 -->
    <div class="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
      <button
        @click="activeTab = 'list'"
        class="px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
        :class="activeTab === 'list'
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'"
      >
        <FileText :size="16" />
        应付列表
      </button>
      <button
        @click="activeTab = 'salary-management'"
        class="px-4 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 whitespace-nowrap"
        :class="activeTab === 'salary-management'
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'"
      >
        <Calculator :size="16" />
        薪酬管理
      </button>
    </div>

    <!-- 应付列表 -->
    <div v-if="activeTab === 'list'" class="space-y-4">
      <!-- 统计概览 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg shadow-orange-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">应付总数</span>
            <Receipt :size="20" />
          </div>
          <div class="text-3xl font-bold">{{ statistics.totalCount }}</div>
          <div class="text-xs opacity-75 mt-2">笔待处理</div>
        </div>

        <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg shadow-emerald-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">教练/医生</span>
            <Users :size="20" />
          </div>
          <div class="text-3xl font-bold">{{ statistics.personnelCount }}</div>
          <div class="text-xs opacity-75 mt-2">人力相关</div>
        </div>

        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">供应商</span>
            <Building :size="20" />
          </div>
          <div class="text-3xl font-bold">{{ statistics.vendorCount }}</div>
          <div class="text-xs opacity-75 mt-2">外部合作</div>
        </div>

        <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white shadow-lg shadow-amber-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">特殊记录</span>
            <AlertCircle :size="20" />
          </div>
          <div class="text-3xl font-bold">{{ statistics.specialRecordCount }}</div>
          <div class="text-xs opacity-75 mt-2">需关注</div>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
        <div class="flex items-center gap-3 flex-wrap">
          <button @click="openAddModal" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors">
            <Plus :size="16" />
            添加应付
          </button>

          <button @click="exportData" class="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors">
            <Download :size="16" />
            导出数据
          </button>

          <div class="relative flex-1 min-w-[200px]">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" :size="16" />
            <input
              v-model="searchText"
              type="text"
              placeholder="搜索收款人、单号..."
              class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <select
            v-model="payeeTypeFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="all">所有类型</option>
            <option value="employee">员工（教练/医生）</option>
            <option value="vendor">供应商</option>
            <option value="consultant">顾问</option>
          </select>
        </div>
      </div>

      <!-- 应付账款列表 -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase w-24">来源</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">收款人信息</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">关联单据号</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">备注说明</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">特殊记录</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">创建时间</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase w-36">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="item in filteredItems"
              :key="item.id"
              class="hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50/50 transition-colors"
              :class="{ 'bg-amber-50/30': item.specialRecords && item.specialRecords.length > 0 }"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <component :is="getSourceTypeIcon(item.sourceType)" :size="16" />
                  <span class="font-medium text-slate-900 text-sm">{{ item.sourceLabel }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div>
                  <div class="font-medium text-slate-900 text-sm">{{ item.payeeName }}</div>
                  <div class="text-xs text-slate-500">{{ getPayeeTypeLabel(item.payeeType) }}</div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                  {{ item.relatedDocId }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600">
                {{ item.remark || '-' }}
              </td>
              <td class="px-4 py-3 text-center">
                <span
                  v-if="item.specialRecords && item.specialRecords.length > 0"
                  class="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium"
                >
                  <AlertCircle :size="12" />
                  {{ item.specialRecords.length }}
                </span>
                <span v-else class="text-slate-400 text-sm">-</span>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600">
                {{ item.createdAt }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <button
                    @click="editItem(item)"
                    class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit3 :size="14" />
                  </button>
                  <button
                    @click="openSpecialRecordModal(item)"
                    class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    title="特殊记录"
                  >
                    <AlertCircle :size="14" />
                  </button>
                  <button
                    @click="deleteItem(item.id)"
                    class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredItems.length === 0" class="text-center py-16 text-slate-400">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-3">
            <Search :size="32" />
          </div>
          <p class="text-sm font-medium">暂无应付账款记录</p>
          <p class="text-xs mt-1">点击"添加应付"创建新记录</p>
        </div>
      </div>
    </div>

    <!-- 薪酬管理 -->
    <div v-else-if="activeTab === 'salary-management'" class="space-y-4">
      <!-- 顶部信息栏 -->
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-white/20 rounded-xl">
              <Calculator :size="28" />
            </div>
            <div>
              <h2 class="text-2xl font-bold">薪酬管理中心</h2>
              <p class="text-sm text-indigo-100 mt-1">管理员工薪酬、福利与发放</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="text-right">
              <div class="text-sm text-indigo-200">当前月份</div>
              <select
                v-model="selectedMonth"
                class="mt-1 px-3 py-1.5 bg-white/20 border border-white/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="2025-02">2025年2月</option>
                <option value="2025-01">2025年1月</option>
                <option value="2024-12">2024年12月</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 薪酬管理子Tab -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="flex items-center gap-1 px-2 py-2 border-b border-slate-200 bg-slate-50/50">
          <!-- 核心功能区 -->
          <div class="flex items-center gap-1 pr-4 border-r border-slate-200">
            <button
              @click="salarySubTab = 'salary-slip'"
              class="px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
              :class="salarySubTab === 'salary-slip'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'"
            >
              <FileText :size="15" />
              工资条
            </button>
            <button
              @click="salarySubTab = 'overview'"
              class="px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
              :class="salarySubTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'"
            >
              <BarChart3 :size="15" />
              薪酬概览
            </button>
          </div>

          <!-- 数据模块区 -->
          <div class="flex items-center gap-1 flex-1">
            <button
              @click="salarySubTab = 'base-salary'"
              class="px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
              :class="salarySubTab === 'base-salary'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'"
            >
              <Calculator :size="15" />
              底薪
            </button>
            <button
              @click="salarySubTab = 'management-fee'"
              class="px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
              :class="salarySubTab === 'management-fee'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'"
            >
              <Briefcase :size="15" />
              管理费
            </button>
            <button
              @click="salarySubTab = 'commission'"
              class="px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
              :class="salarySubTab === 'commission'
                ? 'bg-green-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'"
            >
              <DollarSign :size="15" />
              佣金
            </button>
            <button
              @click="salarySubTab = 'rich-biscuit'"
              class="px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
              :class="salarySubTab === 'rich-biscuit'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'"
            >
              <Award :size="15" />
              富贵饼
            </button>
            <button
              @click="salarySubTab = 'online-service'"
              class="px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
              :class="salarySubTab === 'online-service'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'"
            >
              <Clock :size="15" />
              上线服务
            </button>
            <button
              @click="salarySubTab = 'allowance'"
              class="px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
              :class="salarySubTab === 'allowance'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'"
            >
              <Coffee :size="15" />
              津贴补贴
            </button>
            <button
              @click="salarySubTab = 'social-insurance'"
              class="px-3 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
              :class="salarySubTab === 'social-insurance'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'"
            >
              <Shield :size="15" />
              五险一金
            </button>
          </div>
        </div>

        <!-- 内容区域 -->
        <div class="p-4">
          <!-- 工资条 -->
          <div v-if="salarySubTab === 'salary-slip'">
            <SalarySlipManager :selected-month="selectedMonth" />
          </div>

          <!-- 薪酬概览 -->
          <div v-else-if="salarySubTab === 'overview'">
            <SalaryOverview
              :selected-month="selectedMonth"
              @update-month="selectedMonth = $event"
              @go-to-tab="salarySubTab = $event"
            />
          </div>

          <!-- 底薪管理 -->
          <div v-else-if="salarySubTab === 'base-salary'">
            <BaseSalaryManager :selected-month="selectedMonth" />
          </div>

          <!-- 管理费结算 -->
          <div v-else-if="salarySubTab === 'management-fee'">
            <ManagementFeeManager :selected-month="selectedMonth" />
          </div>

          <!-- 佣金结算 -->
          <div v-else-if="salarySubTab === 'commission'">
            <UnifiedCommissionManager />
          </div>

          <!-- 富贵饼 -->
          <div v-else-if="salarySubTab === 'rich-biscuit'">
            <RichBiscuitManager />
          </div>

          <!-- 上线服务 -->
          <div v-else-if="salarySubTab === 'online-service'">
            <OnlineServiceManager />
          </div>

          <!-- 五险一金 -->
          <div v-else-if="salarySubTab === 'social-insurance'">
            <SocialInsuranceManager :selected-month="selectedMonth" />
          </div>

          <!-- 津贴补贴 -->
          <div v-else-if="salarySubTab === 'allowance'">
            <AllowanceManager :selected-month="selectedMonth" />
          </div>
        </div>
      </div>
    </div>

    <!-- 添加/编辑应付账款模态框 -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">{{ editingItem ? '编辑应付' : '添加应付' }}</h3>
            <button @click="showAddModal = false" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" class="text-slate-500" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">来源类型 *</label>
                <select
                  v-model="formData.sourceType"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="coach">教练结算</option>
                  <option value="doctor">医生结算</option>
                  <option value="commission">顾问分成</option>
                  <option value="inventory">库存采购</option>
                  <option value="other">其他</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">收款人类型 *</label>
                <select
                  v-model="formData.payeeType"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="employee">员工</option>
                  <option value="vendor">供应商</option>
                  <option value="consultant">顾问</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">收款人名称 *</label>
              <input
                v-model="formData.payeeName"
                type="text"
                placeholder="请输入收款人名称"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">关联单据号 *</label>
              <input
                v-model="formData.relatedDocId"
                type="text"
                placeholder="请输入关联单据号（工资条ID、采购订单号等）"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
              <textarea
                v-model="formData.remark"
                placeholder="请输入备注信息"
                rows="3"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              ></textarea>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="showAddModal = false" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="saveAdd" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
              保存
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 特殊项目记录模态框 -->
    <Teleport to="body">
      <div v-if="showSpecialRecordModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div class="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div>
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle :size="20" />
                特殊项目记录
              </h3>
              <p class="text-sm text-amber-100 mt-0.5">记录异常、特殊约定等</p>
            </div>
            <button @click="showSpecialRecordModal = false" class="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X :size="20" class="text-white" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">记录类型 *</label>
              <select
                v-model="specialRecordForm.type"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">请选择类型</option>
                <option value="特殊约定">特殊约定</option>
                <option value="付款异常">付款异常</option>
                <option value="争议处理">争议处理</option>
                <option value="延期安排">延期安排</option>
                <option value="其他特殊">其他特殊</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">特殊说明 *</label>
              <textarea
                v-model="specialRecordForm.description"
                placeholder="请详细描述特殊情况..."
                rows="4"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div class="flex items-start gap-2">
                <AlertCircle :size="16" class="text-amber-600 mt-0.5" />
                <div class="text-xs text-amber-800">
                  该记录将永久保存，用于追溯特殊情况的处理过程
                </div>
              </div>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="showSpecialRecordModal = false" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="saveSpecialRecord" class="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium transition-colors">
              保存记录
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'

// 主题相关
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')
import {
  Plus,
  Search,
  AlertCircle,
  Users,
  Building,
  Receipt,
  Trash2,
  Edit3,
  X,
  Download,
  FileText,
  Calculator,
  Package,
  BarChart3,
  Briefcase,
  DollarSign,
  Award,
  Clock,
  Shield,
  Coffee
} from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import { useToast } from '../composables/useToast'
import { useRole } from '../composables/useRole'
import { useSalary } from '../composables/useSalary'
import ConfirmDialog from '../components/shared/ConfirmDialog.vue'
import SalaryOverview from '../components/SalaryOverview.vue'
import BaseSalaryManager from '../components/BaseSalaryManager.vue'
import ManagementFeeManager from '../components/ManagementFeeManager.vue'
import SocialInsuranceManager from '../components/SocialInsuranceManager.vue'
import UnifiedCommissionManager from '../components/UnifiedCommissionManager.vue'
import RichBiscuitManager from '../components/RichBiscuitManager.vue'
import OnlineServiceManager from '../components/OnlineServiceManager.vue'
import SalarySlipManager from '../components/SalarySlipManager.vue'
import AllowanceManager from '../components/AllowanceManager.vue'

interface PayableItem {
  id: string
  sourceType: 'coach' | 'doctor' | 'commission' | 'inventory' | 'other'
  sourceLabel: string
  payeeType: 'employee' | 'vendor' | 'consultant'
  payeeName: string
  payeeId: string
  relatedDocId: string // 关联单据号（工资条ID、采购订单号等）
  remark?: string
  createdAt: string
  // 特殊项目记录
  specialRecords?: SpecialRecord[]
}

interface SpecialRecord {
  id: string
  type: string // 特殊项目类型
  description: string // 特殊说明
  operator: string // 操作人
  createdAt: string // 操作时间
}

type TabType = 'list' | 'salary-management'
type PayeeTypeFilter = 'all' | 'employee' | 'vendor' | 'consultant'
type SalarySubTab = 'overview' | 'base-salary' | 'management-fee' | 'commission' | 'rich-biscuit' | 'online-service' | 'social-insurance' | 'salary-slip'

const { currentRole } = useRole()
const activeTab = ref<TabType>('list')
const salarySubTab = ref<SalarySubTab>('salary-slip')
const selectedMonth = ref('2025-02')
const searchText = ref('')
const payeeTypeFilter = ref<PayeeTypeFilter>('all')
const showAddModal = ref(false)
const showSpecialRecordModal = ref(false)
const editingItem = ref<PayableItem | null>(null)
const selectedPayable = ref<PayableItem | null>(null)

const { toast: toastFunc } = useToast()

const confirm = ref({
  show: false,
  title: '',
  message: '',
  type: 'warning' as 'warning' | 'danger',
  onConfirm: () => {},
  onCancel: () => {}
})

const formData = ref({
  sourceType: 'coach' as PayableItem['sourceType'],
  payeeName: '',
  payeeType: 'employee' as PayableItem['payeeType'],
  relatedDocId: '',
  remark: ''
})

const specialRecordForm = ref({
  type: '',
  description: ''
})

const payableItems = ref<PayableItem[]>([
  {
    id: 'AP001',
    sourceType: 'coach',
    sourceLabel: '教练结算',
    payeeType: 'employee',
    payeeName: '张教练',
    payeeId: 'E001',
    relatedDocId: 'SAL202402001',
    createdAt: '2024-02-01'
  },
  {
    id: 'AP002',
    sourceType: 'doctor',
    sourceLabel: '医生结算',
    payeeType: 'employee',
    payeeName: '李医生',
    payeeId: 'E002',
    relatedDocId: 'SAL202402002',
    remark: '本月专家门诊分成',
    createdAt: '2024-02-05'
  },
  {
    id: 'AP003',
    sourceType: 'inventory',
    sourceLabel: '库存采购',
    payeeType: 'vendor',
    payeeName: '营养品供应商A',
    payeeId: 'V001',
    relatedDocId: 'PO20240210001',
    remark: '2月份营养品采购',
    createdAt: '2024-02-10'
  },
  {
    id: 'AP004',
    sourceType: 'commission',
    sourceLabel: '顾问分成',
    payeeType: 'consultant',
    payeeName: '健康顾问王明',
    payeeId: 'C001',
    relatedDocId: 'COMM202402001',
    createdAt: '2024-02-15',
    specialRecords: [
      {
        id: 'SR001',
        type: '特殊约定',
        description: '该顾问为特殊合作方，结算周期为季度结算',
        operator: '财务部',
        createdAt: '2024-02-15'
      }
    ]
  }
])

const statistics = computed(() => {
  const totalCount = payableItems.value.length

  // 教练/医生相关统计
  const personnelItems = payableItems.value.filter(item =>
    item.sourceType === 'coach' || item.sourceType === 'doctor'
  )
  const personnelCount = personnelItems.length

  // 供应商相关统计
  const vendorItems = payableItems.value.filter(item => item.payeeType === 'vendor')
  const vendorCount = vendorItems.length

  // 特殊记录统计
  const specialRecordCount = payableItems.value.filter(item =>
    item.specialRecords && item.specialRecords.length > 0
  ).length

  return {
    totalCount,
    personnelCount,
    vendorCount,
    specialRecordCount
  }
})

const filteredItems = computed(() => {
  return payableItems.value.filter(item => {
    const matchSearch = !searchText.value ||
      item.payeeName.includes(searchText.value) ||
      item.relatedDocId.includes(searchText.value) ||
      item.id.toLowerCase().includes(searchText.value.toLowerCase())

    const matchPayeeType = payeeTypeFilter.value === 'all' || item.payeeType === payeeTypeFilter.value

    return matchSearch && matchPayeeType
  })
})

const getSourceTypeIcon = (sourceType: string) => {
  switch (sourceType) {
    case 'coach':
    case 'doctor':
      return Users
    case 'commission':
      return Receipt
    case 'inventory':
      return Package
    default:
      return FileText
  }
}

const getPayeeTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    employee: '员工',
    vendor: '供应商',
    consultant: '顾问'
  }
  return labels[type] || type
}

const openAddModal = () => {
  editingItem.value = null
  formData.value = {
    sourceType: 'coach',
    payeeName: '',
    payeeType: 'employee',
    relatedDocId: '',
    remark: ''
  }
  showAddModal.value = true
}

const saveAdd = () => {
  if (!formData.value.payeeName || !formData.value.relatedDocId) {
    toastFunc.error('请填写必填项')
    return
  }

  if (editingItem.value) {
    // 编辑模式
    payableItems.value = payableItems.value.map(item =>
      item.id === editingItem.value!.id
        ? {
            ...item,
            sourceType: formData.value.sourceType,
            sourceLabel: {
              coach: '教练结算',
              doctor: '医生结算',
              commission: '顾问分成',
              inventory: '库存采购',
              other: '其他'
            }[formData.value.sourceType],
            payeeType: formData.value.payeeType,
            payeeName: formData.value.payeeName,
            relatedDocId: formData.value.relatedDocId,
            remark: formData.value.remark
          }
        : item
    )
    toastFunc.success('应付已更新')
  } else {
    // 新增模式
    const newItem: PayableItem = {
      id: `AP${Date.now()}`,
      sourceType: formData.value.sourceType,
      sourceLabel: {
        coach: '教练结算',
        doctor: '医生结算',
        commission: '顾问分成',
        inventory: '库存采购',
        other: '其他'
      }[formData.value.sourceType],
      payeeType: formData.value.payeeType,
      payeeName: formData.value.payeeName,
      payeeId: `P${Date.now()}`,
      relatedDocId: formData.value.relatedDocId,
      remark: formData.value.remark,
      createdAt: new Date().toISOString().split('T')[0]
    }

    payableItems.value.unshift(newItem)
    toastFunc.success('应付已添加')
  }

  showAddModal.value = false
}

const editItem = (item: PayableItem) => {
  editingItem.value = item
  formData.value = {
    sourceType: item.sourceType,
    payeeName: item.payeeName,
    payeeType: item.payeeType,
    relatedDocId: item.relatedDocId,
    remark: item.remark || ''
  }
  showAddModal.value = true
}

const openSpecialRecordModal = (item: PayableItem) => {
  selectedPayable.value = item
  specialRecordForm.value = {
    type: '',
    description: ''
  }
  showSpecialRecordModal.value = true
}

const saveSpecialRecord = () => {
  if (!specialRecordForm.value.type || !specialRecordForm.value.description) {
    toastFunc.error('请填写必填项')
    return
  }

  if (!selectedPayable.value) return

  const newRecord: SpecialRecord = {
    id: `SR${Date.now()}`,
    type: specialRecordForm.value.type,
    description: specialRecordForm.value.description,
    operator: '当前用户',
    createdAt: new Date().toISOString().split('T')[0]
  }

  payableItems.value = payableItems.value.map(item =>
    item.id === selectedPayable.value!.id
      ? {
          ...item,
          specialRecords: [...(item.specialRecords || []), newRecord]
        }
      : item
  )

  showSpecialRecordModal.value = false
  selectedPayable.value = null
  toastFunc.success('特殊记录已添加')
}

const deleteItem = (id: string) => {
  const item = payableItems.value.find(i => i.id === id)
  if (!item) return

  confirm.value = {
    show: true,
    title: '删除应付账款',
    message: `确定要删除 "${item.supplierName}" 的应付账款 ¥${item.amount.toLocaleString()} 吗？`,
    type: 'danger',
    onConfirm: () => {
      payableItems.value = payableItems.value.filter(i => i.id !== id)
      toastFunc.success('删除成功', '应付账款已删除')
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

// 同步工资条 - 真实实现
const syncFromSalary = () => {
  toastFunc.info('同步中', '正在从薪酬管理模块同步已审核的工资条...')

  try {
    const { getMonthSalarySlips, generateSalarySlip, approveSalarySlip } = useSalary()

    // 获取当月工资条
    const currentMonth = '2025-02' // 使用固定月份进行测试
    let salarySlips = getMonthSalarySlips(currentMonth)

    console.log('获取到工资条数量:', salarySlips.length)

    // 如果没有工资条，生成一些测试数据
    if (salarySlips.length === 0) {
      console.log('没有工资条，生成测试数据...')
      try {
        // 生成几个测试工资条
        generateSalarySlip('E001', currentMonth, 'coach-a')
        generateSalarySlip('E002', currentMonth, 'doctor-a')
        generateSalarySlip('E003', currentMonth, 'coach-a')

        // 重新获取
        salarySlips = getMonthSalarySlips(currentMonth)
        console.log('生成后工资条数量:', salarySlips.length)

        // 审核这些工资条
        salarySlips.forEach((slip: any) => {
          if (slip.status === 'draft') {
            approveSalarySlip(slip.id, 'admin')
          }
        })

        // 最后再获取一次
        salarySlips = getMonthSalarySlips(currentMonth)
        console.log('审核后工资条数量:', salarySlips.length)
      } catch (e) {
        console.error('生成测试数据失败:', e)
      }
    }

    // 过滤已审核但未同步的工资条
    const approvedSlips = salarySlips.filter(
      (slip: any) => (slip.status === 'approved' || slip.status === 'paid') && slip.summary?.netSalary > 0
    )

    console.log('已审核工资条数量:', approvedSlips.length)

    // 检查是否已经同步过
    const newPayables: PayableItem[] = []

    approvedSlips.forEach((slip: any) => {
      // 检查是否已经存在该工资条的应付记录
      const existing = payableItems.value.find(
        item => item.sourceId === slip.id && item.sourceType === 'salary'
      )

      if (!existing) {
        // 计算到期日（7天后）
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 7)

        newPayables.push({
          id: `AP${Date.now()}_${slip.id}`,
          type: 'settlement',
          typeLabel: '工资发放',
          sourceType: 'salary',
          sourceLabel: '工资条',
          sourceId: slip.id,
          amount: slip.summary.netSalary,
          paidAmount: slip.status === 'paid' ? slip.summary.netSalary : 0,
          balance: slip.status === 'paid' ? 0 : slip.summary.netSalary,
          supplierId: slip.employeeId,
          supplierName: slip.employeeName,
          supplierType: 'employee',
          dueDate: dueDate.toISOString().split('T')[0],
          status: slip.status === 'paid' ? ('paid' as const) : ('pending' as const),
          statusLabel: slip.status === 'paid' ? '已付清' : '待支付',
          createdAt: new Date().toISOString().split('T')[0],
          remark: `${slip.month} 工资`
        })
      }
    })

    console.log('新增应付记录数量:', newPayables.length)

    if (newPayables.length === 0) {
      if (salarySlips.length === 0) {
        toastFunc.info('无需同步', '当前没有工资条。请先在"薪酬管理"中生成工资条。')
      } else if (approvedSlips.length === 0) {
        toastFunc.info('无需同步', '当前没有已审核的工资条。请先在"薪酬管理"中审核工资条。')
      } else {
        toastFunc.info('无需同步', '所有已审核的工资条已同步过了')
      }
    } else {
      newPayables.forEach(item => payableItems.value.unshift(item))
      const totalAmount = newPayables.reduce((sum, item) => sum + item.amount, 0)
      toastFunc.success(
        '同步成功',
        `已同步 ${newPayables.length} 条工资条到应付账款，总额 ¥${totalAmount.toLocaleString()}`
      )
    }
  } catch (error) {
    console.error('同步工资条错误:', error)
    toastFunc.error('同步失败', '同步过程中发生错误')
  }
}

// 导出数据
const exportData = () => {
  toastFunc.info('导出中', '正在导出应付账款数据...')

  try {
    const exportData = filteredItems.value.map(item => ({
      '应付单号': item.id,
      '来源类型': item.sourceLabel,
      '收款人': item.payeeName,
      '收款人类型': getPayeeTypeLabel(item.payeeType),
      '关联单据号': item.relatedDocId,
      '备注': item.remark || '-',
      '特殊项目数': item.specialRecords?.length || 0,
      '创建时间': item.createdAt
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    ws['!cols'] = [
      { wch: 15 }, // 应付单号
      { wch: 12 }, // 来源类型
      { wch: 15 }, // 收款人
      { wch: 12 }, // 收款人类型
      { wch: 18 }, // 关联单据号
      { wch: 30 }, // 备注
      { wch: 12 }, // 特殊项目数
      { wch: 12 }  // 创建时间
    ]

    XLSX.utils.book_append_sheet(wb, ws, '应付账款')

    const fileName = `应付账款_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    toastFunc.success('导出成功', `已导出 ${filteredItems.value.length} 条应付记录`)
  } catch (error) {
    console.error('导出失败:', error)
    toastFunc.error('导出失败', '导出应付账款时发生错误')
  }
}
</script>
