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
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white shadow-lg shadow-orange-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">应付总额</span>
            <Receipt :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ statistics.totalPayable.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">{{ statistics.totalCount }} 笔</div>
        </div>

        <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg shadow-emerald-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">工资条应付</span>
            <FileText :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ statistics.salaryPayable.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">{{ statistics.salaryCount }} 人</div>
        </div>

        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">已付金额</span>
            <CheckCircle :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ statistics.totalPaid.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">已结算</div>
        </div>

        <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg shadow-red-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">应付余额</span>
            <AlertCircle :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ statistics.totalBalance.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">待支付</div>
        </div>

        <div class="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-5 text-white shadow-lg shadow-pink-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium opacity-90">逾期金额</span>
            <Clock :size="20" />
          </div>
          <div class="text-3xl font-bold">¥{{ statistics.overdueAmount.toLocaleString() }}</div>
          <div class="text-xs opacity-75 mt-2">{{ statistics.overdueCount }} 笔逾期</div>
        </div>
      </div>

      <!-- 同步按钮区域 -->
      <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-indigo-600 rounded-lg">
              <RefreshCw :size="20" class="text-white" />
            </div>
            <div>
              <div class="font-semibold text-indigo-900">数据同步</div>
              <div class="text-sm text-indigo-600">从薪酬管理模块同步已审核的工资条</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button @click="syncFromSalary" class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors">
              <FileText :size="16" />
              同步工资条
            </button>
          </div>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
        <div class="flex items-center gap-3 flex-wrap">
          <button @click="openAddModal" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors">
            <Plus :size="16" />
            添加应付
          </button>

          <button @click="batchPay" :disabled="!hasSelectedItems" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <CreditCard :size="16" />
            批量支付 ({{ selectedItems.length }})
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
              placeholder="搜索供应商、单号..."
              class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <select
            v-model="sourceTypeFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="all">所有来源</option>
            <option value="salary">工资条</option>
            <option value="procurement">采购订单</option>
            <option value="service">服务费用</option>
            <option value="other">其他</option>
          </select>

          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="all">所有状态</option>
            <option value="pending">待支付</option>
            <option value="partial">部分支付</option>
            <option value="paid">已付清</option>
            <option value="overdue">已逾期</option>
          </select>
        </div>
      </div>

      <!-- 应付账款列表 -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-center w-10">
                <input
                  type="checkbox"
                  v-model="selectAllItems"
                  @change="toggleSelectAll"
                  class="rounded"
                />
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase w-24">来源</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">供应商/员工</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">总金额</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">已付金额</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">应付余额</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">状态</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">到期日</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase w-40">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="item in filteredItems"
              :key="item.id"
              class="hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50/50 transition-colors"
              :class="{ 'bg-red-50/30': item.status === 'overdue', 'bg-indigo-50/30': selectedItems.includes(item.id) }"
            >
              <td class="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  v-model="selectedItems"
                  :value="item.id"
                  class="rounded"
                />
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-2">
                  <component :is="getSourceTypeIcon(item.sourceType)" :size="16" />
                  <span class="font-medium text-slate-900 text-sm">{{ item.sourceLabel }}</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div>
                  <div class="font-medium text-slate-900 text-sm">{{ item.supplierName }}</div>
                  <div class="text-xs text-slate-500">{{ getSupplierTypeLabel(item.supplierType) }}</div>
                </div>
              </td>
              <td class="px-4 py-3 text-right text-sm text-slate-900">
                ¥{{ item.amount.toLocaleString() }}
              </td>
              <td class="px-4 py-3 text-right text-sm text-green-600 font-medium">
                ¥{{ item.paidAmount.toLocaleString() }}
              </td>
              <td class="px-4 py-3 text-right">
                <div class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-base font-bold"
                     :class="item.balance > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'">
                  ¥{{ item.balance.toLocaleString() }}
                </div>
              </td>
              <td class="px-4 py-3 text-center">
                <span class="px-3 py-1 rounded-full text-xs font-medium border" :class="getStatusBadgeClass(item.status)">
                  {{ getStatusLabel(item.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600">
                {{ item.dueDate }}
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <button
                    v-if="item.status === 'pending' || item.status === 'partial' || item.status === 'overdue'"
                    @click="openPaymentModal(item)"
                    class="px-2 py-1 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <CreditCard :size="12" />
                    支付
                  </button>
                  <button
                    @click="viewItem(item)"
                    class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="查看详情"
                  >
                    <Eye :size="14" />
                  </button>
                  <button
                    @click="editItem(item)"
                    class="p-1.5 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit :size="14" />
                  </button>
                  <button @click="deleteItem(item.id)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="删除">
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
          <p class="text-xs mt-1">点击"同步工资条"从薪酬管理导入数据</p>
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
        </div>
      </div>
    </div>

    <!-- 添加应付账款模态框 -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">添加应付账款</h3>
            <button @click="showAddModal = false" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" class="text-slate-500" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">应付金额 *</label>
                <input v-model="formData.amount" type="number" placeholder="请输入金额" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">到期日 *</label>
                <input v-model="formData.dueDate" type="date" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">供应商名称 *</label>
              <input v-model="formData.supplierName" type="text" placeholder="请输入供应商名称" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
              <textarea v-model="formData.remark" placeholder="请输入备注信息" rows="3" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"></textarea>
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

    <!-- 支付模态框 -->
    <Teleport to="body">
      <div v-if="showPaymentModal && selectedItem" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">支付应付账款</h3>
            <button @click="showPaymentModal = false" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" class="text-slate-500" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div class="bg-slate-50 rounded-lg p-4">
              <div class="flex justify-between mb-2">
                <span class="text-sm text-slate-600">供应商</span>
                <span class="font-semibold text-slate-900">{{ selectedItem.supplierName }}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span class="text-sm text-slate-600">应付金额</span>
                <span class="font-semibold text-slate-900">¥{{ selectedItem.amount.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-slate-600">应付余额</span>
                <span class="font-bold text-red-600">¥{{ selectedItem.balance.toLocaleString() }}</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">支付金额 *</label>
              <input
                v-model="paymentFormData.amount"
                type="number"
                placeholder="请输入支付金额"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">支付方式</label>
              <select
                v-model="paymentFormData.paymentMethod"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="bank">银行转账</option>
                <option value="alipay">支付宝</option>
                <option value="wechat">微信支付</option>
                <option value="cash">现金</option>
              </select>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="showPaymentModal = false" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="processPayment" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
              确认支付
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
  Package,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  FileText,
  RefreshCw,
  BarChart3,
  Building,
  Truck,
  Receipt,
  Trash2,
  X,
  Target,
  Download,
  Calculator,
  Award,
  Link2,
  Stethoscope,
  Shield,
  Briefcase,
  Eye,
  Edit
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

interface PayableItem {
  id: string
  type: 'settlement' | 'purchase' | 'service' | 'other'
  typeLabel: string
  sourceType: 'coach' | 'doctor' | 'commission' | 'inventory'
  sourceLabel: string
  sourceId: string
  amount: number
  paidAmount: number
  balance: number
  supplierId: string
  supplierName: string
  supplierType: 'employee' | 'vendor' | 'consultant'
  dueDate: string
  status: 'pending' | 'partial' | 'paid' | 'overdue'
  statusLabel: string
  createdAt: string
  remark?: string
}

type TabType = 'list' | 'salary-management'
type StatusFilter = 'all' | 'pending' | 'partial' | 'paid' | 'overdue'
type SourceFilter = 'all' | 'salary' | 'procurement' | 'service' | 'other'
type SalarySubTab = 'overview' | 'base-salary' | 'management-fee' | 'commission' | 'rich-biscuit' | 'online-service' | 'social-insurance' | 'salary-slip'

const { currentRole } = useRole()
const activeTab = ref<TabType>('list')
const salarySubTab = ref<SalarySubTab>('salary-slip')
const selectedMonth = ref('2025-02')
const searchText = ref('')
const statusFilter = ref<StatusFilter>('all')
const sourceTypeFilter = ref<SourceFilter>('all')
const showAddModal = ref(false)
const showPaymentModal = ref(false)
const selectedItem = ref<PayableItem | null>(null)
const selectedItems = ref<string[]>([])
const selectAllItems = ref(false)

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
  type: 'settlement' as PayableItem['type'],
  amount: '',
  supplierName: '',
  supplierType: 'vendor' as Supplier['type'],
  dueDate: '',
  remark: ''
})

const paymentFormData = ref({
  amount: '',
  paymentMethod: 'bank',
  remark: ''
})

const payableItems = ref<PayableItem[]>([
  {
    id: 'AP001',
    type: 'settlement',
    typeLabel: '教练结算',
    sourceType: 'coach',
    sourceLabel: '教练结算',
    sourceId: 'S001',
    amount: 8100,
    paidAmount: 8100,
    balance: 0,
    supplierId: 'E001',
    supplierName: '张教练',
    supplierType: 'employee',
    dueDate: '2024-02-10',
    status: 'paid',
    statusLabel: '已付清',
    createdAt: '2024-02-01'
  },
  {
    id: 'AP002',
    type: 'settlement',
    typeLabel: '医生结算',
    sourceType: 'doctor',
    sourceLabel: '医生结算',
    sourceId: 'S002',
    amount: 5600,
    paidAmount: 0,
    balance: 5600,
    supplierId: 'E002',
    supplierName: '李医生',
    supplierType: 'employee',
    dueDate: '2024-02-20',
    status: 'pending',
    statusLabel: '待支付',
    createdAt: '2024-02-05'
  },
  {
    id: 'AP003',
    type: 'purchase',
    typeLabel: '库存采购',
    sourceType: 'inventory',
    sourceLabel: '库存采购',
    sourceId: 'PO001',
    amount: 12500,
    paidAmount: 5000,
    balance: 7500,
    supplierId: 'V001',
    supplierName: '营养品供应商A',
    supplierType: 'vendor',
    dueDate: '2024-02-25',
    status: 'partial',
    statusLabel: '部分支付',
    createdAt: '2024-02-10'
  }
])

const statistics = computed(() => {
  const totalCount = payableItems.value.length
  const totalPayable = payableItems.value.reduce((sum, item) => sum + item.amount, 0)
  const totalPaid = payableItems.value.reduce((sum, item) => sum + item.paidAmount, 0)
  const totalBalance = payableItems.value.reduce((sum, item) => sum + item.balance, 0)

  // 工资条相关统计
  const salaryItems = payableItems.value.filter(item => item.sourceType === 'salary')
  const salaryPayable = salaryItems.reduce((sum, item) => sum + item.balance, 0)
  const salaryCount = salaryItems.length

  const overdueItems = payableItems.value.filter(item => item.status === 'overdue')
  const overdueAmount = overdueItems.reduce((sum, item) => sum + item.balance, 0)

  return {
    totalCount,
    totalPayable,
    totalPaid,
    totalBalance,
    salaryPayable,
    salaryCount,
    overdueAmount,
    overdueCount: overdueItems.length
  }
})

const hasSelectedItems = computed(() => selectedItems.value.length > 0)

const filteredItems = computed(() => {
  return payableItems.value.filter(item => {
    const matchSearch = !searchText.value ||
      item.supplierName.includes(searchText.value) ||
      item.id.toLowerCase().includes(searchText.value.toLowerCase())

    const matchStatus = statusFilter.value === 'all' || item.status === statusFilter.value

    const matchSource = sourceTypeFilter.value === 'all' ||
      (sourceTypeFilter.value === 'salary' && item.sourceType === 'salary') ||
      (sourceTypeFilter.value === 'procurement' && item.sourceType === 'inventory') ||
      (sourceTypeFilter.value === 'service' && item.type === 'service') ||
      (sourceTypeFilter.value === 'other' && !['salary', 'inventory', 'service'].includes(item.sourceType))

    return matchSearch && matchStatus && matchSource
  })
})

const getSourceTypeIcon = (sourceType: string) => {
  switch (sourceType) {
    case 'salary':
      return FileText
    case 'coach':
    case 'doctor':
      return Users
    case 'commission':
      return DollarSign
    case 'inventory':
      return Package
    default:
      return FileText
  }
}

const getStatusBadgeClass = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-800 border-blue-200',
    partial: 'bg-amber-100 text-amber-800 border-amber-200',
    paid: 'bg-green-100 text-green-800 border-green-200',
    overdue: 'bg-red-100 text-red-800 border-red-200'
  }
  return statusMap[status] || statusMap.pending
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '待支付',
    partial: '部分支付',
    paid: '已付清',
    overdue: '已逾期'
  }
  return labels[status] || '待支付'
}

const getSupplierTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    employee: '员工',
    vendor: '供应商',
    consultant: '顾问'
  }
  return labels[type] || type
}

const openAddModal = () => {
  formData.value = {
    type: 'settlement',
    amount: '',
    supplierName: '',
    supplierType: 'vendor',
    dueDate: '',
    remark: ''
  }
  showAddModal.value = true
}

const saveAdd = () => {
  if (!formData.value.supplierName || !formData.value.amount || !formData.value.dueDate) {
    toastFunc.error('请填写必填项')
    return
  }

  const newItem: PayableItem = {
    id: `AP${Date.now()}`,
    type: formData.value.type,
    typeLabel: {
      settlement: '结算支付',
      purchase: '库存采购',
      service: '服务费用',
      other: '其他应付'
    }[formData.value.type],
    sourceType: formData.value.type === 'settlement' ? 'coach' : 'inventory',
    sourceLabel: formData.value.type === 'settlement' ? '结算支付' : '库存采购',
    sourceId: `SRC${Date.now()}`,
    amount: parseFloat(formData.value.amount),
    paidAmount: 0,
    balance: parseFloat(formData.value.amount),
    supplierId: `S${Date.now()}`,
    supplierName: formData.value.supplierName,
    supplierType: formData.value.supplierType,
    dueDate: formData.value.dueDate,
    status: 'pending',
    statusLabel: '待支付',
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
    remark: formData.value.remark
  }

  payableItems.value.unshift(newItem)
  showAddModal.value = false
  toastFunc.success('添加成功', `已添加应付账款 ¥${formData.value.amount}`)
}

const openPaymentModal = (item: PayableItem) => {
  selectedItem.value = item
  paymentFormData.value = {
    amount: String(item.balance),
    paymentMethod: 'bank',
    remark: ''
  }
  showPaymentModal.value = true
}

const processPayment = () => {
  if (!selectedItem.value || !paymentFormData.value.amount) {
    toastFunc.error('请填写支付金额')
    return
  }

  const paymentAmount = parseFloat(paymentFormData.value.amount)
  const newPaidAmount = selectedItem.value.paidAmount + paymentAmount
  const newBalance = selectedItem.value.amount - newPaidAmount

  confirm.value = {
    show: true,
    title: '确认支付',
    message: `确认支付 ¥${paymentAmount.toLocaleString()} 给 "${selectedItem.value.supplierName}" 吗？`,
    type: 'warning',
    onConfirm: () => {
      payableItems.value = payableItems.value.map(item =>
        item.id === selectedItem.value!.id
          ? {
              ...item,
              paidAmount: newPaidAmount,
              balance: newBalance,
              status: newBalance === 0 ? 'paid' as const : newBalance < item.amount ? 'partial' as const : item.status,
              statusLabel: newBalance === 0 ? '已付清' : newBalance < item.amount ? '部分支付' : item.statusLabel
            }
          : item
      )

      showPaymentModal.value = false
      const supplierName = selectedItem.value.supplierName
      selectedItem.value = null
      toastFunc.success('支付成功', `已支付 ¥${paymentAmount.toLocaleString()} 给 ${supplierName}`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
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

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectAllItems.value) {
    selectedItems.value = filteredItems.value.map(item => item.id)
  } else {
    selectedItems.value = []
  }
}

// 批量支付
const batchPay = () => {
  if (selectedItems.value.length === 0) {
    toastFunc.error('请先选择要支付的款项')
    return
  }

  confirm.value = {
    show: true,
    title: '批量支付',
    message: `确定要批量支付选中的 ${selectedItems.value.length} 笔款项吗？`,
    type: 'warning',
    onConfirm: () => {
      let count = 0
      payableItems.value = payableItems.value.map(item => {
        if (selectedItems.value.includes(item.id) && item.balance > 0) {
          count++
          return {
            ...item,
            paidAmount: item.amount,
            balance: 0,
            status: 'paid' as const,
            statusLabel: '已付清'
          }
        }
        return item
      })

      selectedItems.value = []
      selectAllItems.value = false
      toastFunc.success('支付成功', `已批量支付${count}笔款项`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

// 查看详情
const viewItem = (item: PayableItem) => {
  toastFunc.info('查看详情', `${item.supplierName} - ¥${item.amount.toLocaleString()}`)
}

// 编辑项
const editItem = (item: PayableItem) => {
  toastFunc.info('编辑功能', '编辑功能开发中...')
}

const syncFromSettlement = () => {
  toastFunc.warning('已废弃', '请使用"同步工资条"功能')
}

// 导出数据
const exportData = () => {
  toastFunc.info('导出中', '正在导出应付账款数据...')

  try {
    const exportData = filteredItems.value.map(item => ({
      '应付单号': item.id,
      '来源类型': item.sourceLabel,
      '应付类型': item.typeLabel,
      '供应商': item.supplierName,
      '供应商类型': getSupplierTypeLabel(item.supplierType),
      '应付金额': item.amount,
      '已付金额': item.paidAmount,
      '应付余额': item.balance,
      '到期日': item.dueDate,
      '状态': getStatusLabel(item.status),
      '创建时间': item.createdAt,
      '备注': item.remark || '-'
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    ws['!cols'] = [
      { wch: 15 }, // 应付单号
      { wch: 12 }, // 来源类型
      { wch: 12 }, // 应付类型
      { wch: 15 }, // 供应商
      { wch: 12 }, // 供应商类型
      { wch: 12 }, // 应付金额
      { wch: 12 }, // 已付金额
      { wch: 12 }, // 应付余额
      { wch: 12 }, // 到期日
      { wch: 10 }, // 状态
      { wch: 20 }, // 创建时间
      { wch: 20 }  // 备注
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
