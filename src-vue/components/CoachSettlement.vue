<template>
  <div class="flex gap-6">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- Confirm Dialog -->
    <ConfirmDialog
      v-model:show="confirm.show"
      :title="confirm.title"
      :message="confirm.message"
      :type="confirm.type"
      @confirm="confirm.onConfirm"
      @cancel="confirm.onCancel"
    />

    <!-- 左侧导航栏 -->
    <div class="w-56 flex-shrink-0">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-6">
        <nav class="space-y-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`"
          >
            <component :is="tab.icon" :size="18" />
            {{ tab.label }}
            <span v-if="tab.id === 'employees' && filteredEmployees.filter(e => e.status === 'active').length > 0" class="ml-auto text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              {{ filteredEmployees.filter(e => e.status === 'active').length }}
            </span>
          </button>
        </nav>
      </div>
    </div>

    <!-- 右侧内容区域 -->
    <div class="flex-1 space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">教练结算管理</h1>
          <p class="text-sm text-slate-500 mt-1">零工薪酬智能结算系统</p>
        </div>
        <div v-if="isCoach" class="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <span class="text-sm text-amber-700">仅显示我的结算数据</span>
        </div>
      </div>

      <!-- 当前规则提示 -->
      <div v-if="activeTab !== 'rules'" class="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <AlertCircle :size="18" class="text-blue-600" />
            <span class="font-semibold text-blue-900">当前结算规则：</span>
            <span class="text-sm text-blue-800">
              新用户 ¥{{ currentRule.newUserRate }}/人/月，老用户 ¥{{ currentRule.oldUserRate }}/人/月
            </span>
          </div>
          <button @click="activeTab = 'rules'" class="text-sm text-blue-700 hover:text-blue-900 underline">修改规则</button>
        </div>
      </div>

      <!-- Tab内容 -->
      <!-- 用户绑定 Tab -->
      <div v-if="activeTab === 'bindings'" class="space-y-6">
        <!-- 操作栏 -->
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div class="flex items-center gap-4">
            <div class="relative flex-1">
              <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                v-model="bindingSearchText"
                type="text"
                placeholder="搜索用户ID、姓名、服务人员..."
                class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <select v-model="bindingFilterType" class="px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="all">全部角色</option>
              <option value="coach">教练</option>
              <option value="doctor">医生</option>
              <option value="consultant">顾问</option>
            </select>
            <select v-model="bindingFilterStatus" class="px-3 py-2 border border-slate-200 rounded-lg text-sm">
              <option value="all">全部状态</option>
              <option value="active">服务中</option>
              <option value="paused">已暂停</option>
              <option value="ended">已结束</option>
            </select>
            <button
              v-if="bindingSearchText || bindingFilterType !== 'all' || bindingFilterStatus !== 'all'"
              @click="clearBindingFilters"
              class="px-3 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1 text-sm"
            >
              <X :size="14" /> 清除筛选
            </button>
            <button
              @click="openBindingDialog"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium"
            >
              <Plus :size="16" /> 新增绑定
            </button>
          </div>
        </div>

        <!-- 绑定关系列表 -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table class="w-full">
            <thead class="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">绑定方式</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">用户ID</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">姓名</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">服务类型</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">教练</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">医生</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">顾问</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">服务周期</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">状态</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr
                v-for="binding in filteredBindings"
                :key="binding.id"
                class="hover:bg-slate-50"
              >
                <td class="px-4 py-3">
                  <span
                    :class="`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                      binding.bindingType === 'auto'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`"
                  >
                    <Smartphone v-if="binding.bindingType === 'auto'" :size="12" />
                    <UserCog v-else :size="12" />
                    {{ binding.bindingType === 'auto' ? '小程序' : '运营分配' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm font-mono text-indigo-600">{{ binding.userId }}</td>
                <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ binding.userName }}</td>
                <td class="px-4 py-3">
                  <span
                    v-if="binding.serviceType === 'deep'"
                    class="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-800"
                  >
                    深度干预
                  </span>
                  <span
                    v-else
                    class="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800"
                  >
                    基础干预
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ binding.coachName || '-' }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ binding.doctorName || '-' }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ binding.consultantName || '-' }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ binding.serviceStartDate }} ~ {{ binding.serviceEndDate || '至今' }}</td>
                <td class="px-4 py-3 text-center">
                  <span
                    :class="{
                      'px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800': binding.status === 'active',
                      'px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800': binding.status === 'paused',
                      'px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-600': binding.status === 'ended'
                    }"
                  >
                    {{ binding.status === 'active' ? '服务中' : binding.status === 'paused' ? '已暂停' : '已结束' }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      @click="editBinding(binding)"
                      class="px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200"
                    >
                      编辑
                    </button>
                    <button
                      @click="confirmDeleteBinding(binding.id)"
                      class="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded border border-red-200"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <!-- 搜索统计提示 -->
          <div v-if="filteredBindings.length > 0" class="px-4 py-3 bg-slate-50 border-t border-slate-200">
            <div class="flex items-center justify-between text-xs text-slate-600">
              <span>
                显示 {{ filteredBindings.length }} 条记录，共 {{ userBindings.length }} 条绑定关系
              </span>
              <span v-if="bindingSearchText || bindingFilterType !== 'all' || bindingFilterStatus !== 'all'" class="text-blue-600">
                <Search :size="12" class="inline mr-1" />
                搜索/筛选模式 - 点击"清除筛选"可查看全部数据
              </span>
            </div>
          </div>
          <div v-if="filteredBindings.length === 0" class="p-12 text-center text-slate-400">
            <Users :size="48" class="mx-auto mb-4" />
            <p class="font-medium">暂无绑定数据</p>
            <p class="text-sm mt-1">请调整筛选条件或新增绑定关系</p>
          </div>
        </div>
      </div>

      <!-- 结算明细 Tab - 添加教练提报按钮 -->
      <div v-if="activeTab === 'settlements'" class="space-y-3">
        <!-- 教练提报操作栏 -->
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-3">
          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <AlertCircle :size="18" class="text-blue-600" />
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-blue-900">教练结算数据提报</span>
                <span class="text-xs text-blue-700">
                  提报期限：每日可提报 | 当前状态：
                  <span class="text-green-600 font-semibold">
                    开放中
                  </span>
                </span>
              </div>
            </div>
            <button
              @click="openCoachReportDialog"
              class="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 text-xs font-medium"
            >
              <Plus :size="14" /> 新增教练提报
            </button>
          </div>
        </div>

        <!-- 教练提报记录列表 - 紧凑布局 -->
        <div v-if="coachReports.length > 0" class="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2 flex items-center justify-between">
            <h3 class="text-white text-sm font-semibold">教练提报记录</h3>
            <span class="text-[10px] text-blue-100">{{ coachReports.length }} 条记录</span>
          </div>
          <div class="p-3">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                v-for="report in coachReports"
                :key="report.id"
                class="border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-slate-900">{{ report.coachName }}</span>
                    <span
                      :class="`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        report.status === 'submitted'
                          ? 'bg-yellow-100 text-yellow-800'
                          : report.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`"
                    >
                      {{ report.status === 'submitted' ? '待审核' : report.status === 'approved' ? '已通过' : '已驳回' }}
                    </span>
                  </div>
                  <span class="text-base font-bold text-blue-600">¥{{ report.totalAmount.toLocaleString() }}</span>
                </div>
                <div class="space-y-1 text-xs">
                  <div class="flex justify-between">
                    <span class="text-slate-600">新用户</span>
                    <span class="font-semibold">{{ report.newUserCount }}人 × ¥400</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-600">老用户</span>
                    <span class="font-semibold">{{ report.oldUserCount }}人 × ¥100</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-600">医生上线</span>
                    <span class="font-semibold">{{ report.doctorOnlineCount }}次 × ¥200</span>
                  </div>
                </div>
                <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span class="text-[10px] text-slate-500">
                    提交时间：{{ report.submittedAt }}
                  </span>
                  <!-- 审核操作按钮 -->
                  <div v-if="report.status === 'submitted'" class="flex items-center gap-1">
                    <button
                      @click="approveCoachReport(report.id)"
                      class="px-2 py-1 text-[10px] bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-0.5"
                    >
                      <CheckCircle :size="10" /> 通过
                    </button>
                    <button
                      @click="rejectCoachReport(report.id)"
                      class="px-2 py-1 text-[10px] bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-0.5"
                    >
                      <X :size="10" /> 驳回
                    </button>
                  </div>
                  <span v-else-if="report.status === 'approved'" class="text-[10px] text-green-600 font-semibold">
                    ✓ 已审核通过
                  </span>
                  <span v-else class="text-[10px] text-red-600 font-semibold">
                    ✗ 已驳回
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EmployeesTab
        v-if="activeTab === 'employees'"
        :employees="filteredEmployees"
        :expanded-employees="expandedEmployees"
        :search-text="employeeSearchText"
        @toggle-expand="toggleEmployeeExpand"
        @edit="handleEditEmployee"
        @delete="confirmDeleteEmployee"
        @add="openEmployeeDialog"
        @search="employeeSearchText = $event"
      />
      <CoachSettlementsTab
        v-if="activeTab === 'settlements'"
        :settlements="filteredSettlements"
        :selected-period="selectedPeriod"
        :employees="employees"
        :generation-status="currentPeriodGenerationStatus"
        @update:period="selectedPeriod = $event"
        @generate="handleGenerateSettlement"
        @approve="handleApproveSettlement"
        @reject="handleRejectSettlement"
        @pay="handleProcessPayment"
        @view="viewSettlementDetail"
        @viewHistory="viewHistory"
        @export="handleExportSettlements"
        @batchApprove="handleBatchApprove"
        @clearSelection="() => {}"
      />
      <PaymentsTab
        v-if="activeTab === 'payments'"
        :payments="payments"
        @export="handleExportPayments"
      />
      <ReportsTab
        v-if="activeTab === 'reports'"
        :stats="stats"
        :employees="employees"
      />
      <!-- 我的账单 Tab - 薪酬核算与账单展示 -->
      <div v-if="activeTab === 'mypayslips'" class="space-y-4">
        <!-- 月份选择和操作栏 -->
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <label class="text-sm font-medium text-slate-700">选择月份：</label>
              <select v-model="selectedPeriod" class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                <option value="2026-02">2026年2月</option>
                <option value="2026-01">2026年1月</option>
                <option value="2025-12">2025年12月</option>
                <option value="2025-11">2025年11月</option>
              </select>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="exportMyBill"
                class="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm"
              >
                <Download :size="14" /> 导出账单
              </button>
            </div>
          </div>
        </div>

        <!-- 月度结算单 -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <Receipt :size="20" />
              月度结算单 - {{ selectedPeriod }}
            </h3>
          </div>
          <div class="p-6">
            <!-- 结算汇总 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-blue-50 rounded-lg p-4">
                <div class="text-sm text-blue-600 mb-1">新用户费用</div>
                <div class="text-2xl font-bold text-blue-700">¥{{ myMonthlyBill.newUserAmount.toLocaleString() }}</div>
                <div class="text-xs text-blue-500 mt-1">{{ myMonthlyBill.newUserCount }} 人 × ¥400</div>
              </div>
              <div class="bg-green-50 rounded-lg p-4">
                <div class="text-sm text-green-600 mb-1">老用户费用</div>
                <div class="text-2xl font-bold text-green-700">¥{{ myMonthlyBill.oldUserAmount.toLocaleString() }}</div>
                <div class="text-xs text-green-500 mt-1">{{ myMonthlyBill.oldUserCount }} 人 × ¥100</div>
              </div>
              <div class="bg-purple-50 rounded-lg p-4">
                <div class="text-sm text-purple-600 mb-1">医生上线费</div>
                <div class="text-2xl font-bold text-purple-700">¥{{ myMonthlyBill.doctorOnlineAmount.toLocaleString() }}</div>
                <div class="text-xs text-purple-500 mt-1">{{ myMonthlyBill.doctorOnlineCount }} 次 × ¥200</div>
              </div>
              <div class="bg-slate-800 rounded-lg p-4">
                <div class="text-sm text-slate-400 mb-1">合计金额</div>
                <div class="text-2xl font-bold text-white">¥{{ myMonthlyBill.totalAmount.toLocaleString() }}</div>
                <div class="text-xs text-slate-400 mt-1">
                  状态：{{ myMonthlyBill.status === 'paid' ? '已打款' : myMonthlyBill.status === 'approved' ? '已审核' : '待审核' }}
                </div>
              </div>
            </div>

            <!-- 明细表格 -->
            <div class="border border-slate-200 rounded-lg overflow-hidden">
              <table class="w-full">
                <thead class="bg-slate-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">项目</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">数量</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">单价</th>
                    <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">小计</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-slate-900">新用户费用</td>
                    <td class="px-4 py-3 text-right text-sm text-slate-700">{{ myMonthlyBill.newUserCount }} 人</td>
                    <td class="px-4 py-3 text-right text-sm text-slate-700">¥400</td>
                    <td class="px-4 py-3 text-right text-sm font-bold text-blue-600">¥{{ myMonthlyBill.newUserAmount.toLocaleString() }}</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-slate-900">老用户费用</td>
                    <td class="px-4 py-3 text-right text-sm text-slate-700">{{ myMonthlyBill.oldUserCount }} 人</td>
                    <td class="px-4 py-3 text-right text-sm text-slate-700">¥100</td>
                    <td class="px-4 py-3 text-right text-sm font-bold text-green-600">¥{{ myMonthlyBill.oldUserAmount.toLocaleString() }}</td>
                  </tr>
                  <tr>
                    <td class="px-4 py-3 text-sm font-medium text-slate-900">医生上线费</td>
                    <td class="px-4 py-3 text-right text-sm text-slate-700">{{ myMonthlyBill.doctorOnlineCount }} 次</td>
                    <td class="px-4 py-3 text-right text-sm text-slate-700">¥200</td>
                    <td class="px-4 py-3 text-right text-sm font-bold text-purple-600">¥{{ myMonthlyBill.doctorOnlineAmount.toLocaleString() }}</td>
                  </tr>
                  <tr class="bg-slate-50">
                    <td class="px-4 py-3 text-sm font-bold text-slate-900">合计</td>
                    <td class="px-4 py-3 text-right text-sm text-slate-700" colspan="2">-</td>
                    <td class="px-4 py-3 text-right text-sm font-bold text-slate-900">¥{{ myMonthlyBill.totalAmount.toLocaleString() }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 历史账单列表 -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="bg-gradient-to-r from-slate-500 to-slate-600 px-4 py-3 flex items-center justify-between">
            <h3 class="text-white font-semibold">历史账单</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">月份</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">新用户</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">老用户</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">上线次数</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">合计</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">状态</th>
                  <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="bill in myBills" :key="bill.period" class="hover:bg-slate-50">
                  <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ bill.period }}</td>
                  <td class="px-4 py-3 text-right text-sm text-slate-700">{{ bill.newUserCount }}人</td>
                  <td class="px-4 py-3 text-right text-sm text-slate-700">{{ bill.oldUserCount }}人</td>
                  <td class="px-4 py-3 text-right text-sm text-slate-700">{{ bill.doctorOnlineCount }}次</td>
                  <td class="px-4 py-3 text-right text-sm font-bold text-slate-900">¥{{ bill.totalAmount.toLocaleString() }}</td>
                  <td class="px-4 py-3 text-center">
                    <span
                      :class="`px-2 py-1 rounded text-xs font-semibold ${
                        bill.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : bill.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`"
                    >
                      {{ bill.status === 'paid' ? '已打款' : bill.status === 'approved' ? '已审核' : '待审核' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <button
                      @click="viewBillDetail(bill.period)"
                      class="px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200"
                    >
                      查看
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <RulesTab
        v-if="activeTab === 'rules'"
        :rules="settlementRules"
        @save="handleSaveRule"
        @delete="handleDeleteRule"
      />
    </div>

    <!-- 共享组件：员工编辑弹窗 -->
    <Modal v-model:show="showEmployeeDialog" :title="editingEmployee ? '编辑教练' : '添加教练'" size="lg">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">姓名 *</label>
            <input v-model="employeeForm.name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">手机号 *</label>
            <input v-model="employeeForm.phone" type="tel" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">身份证号</label>
            <input v-model="employeeForm.idCard" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">部门</label>
            <select v-model="employeeForm.department" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="">选择部门</option>
              <option value="运动康复部">运动康复部</option>
              <option value="体能训练部">体能训练部</option>
              <option value="营养指导部">营养指导部</option>
            </select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">开户银行</label>
            <input v-model="employeeForm.bankName" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">银行账号</label>
            <input v-model="employeeForm.bankAccount" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">备注</label>
          <textarea v-model="employeeForm.remark" rows="2" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
      <template #footer>
        <button @click="showEmployeeDialog = false" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">取消</button>
        <button @click="saveEmployee" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{{ editingEmployee ? '保存' : '添加' }}</button>
      </template>
    </Modal>

    <!-- 用户绑定编辑弹窗 -->
    <Modal v-model:show="showBindingDialog" :title="editingBinding ? '编辑绑定关系' : '新增绑定关系'" size="lg">
      <div class="space-y-4">
        <!-- 绑定方式选择 (仅新增时显示) -->
        <div v-if="!editingBinding" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label class="block text-sm font-semibold text-blue-900 mb-2">选择绑定方式</label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              @click="bindingForm.bindingType = 'auto'"
              :class="`p-3 rounded-lg border-2 text-left transition-all ${
                bindingForm.bindingType === 'auto'
                  ? 'border-blue-500 bg-blue-100'
                  : 'border-blue-200 bg-white hover:bg-blue-50'
              }`"
            >
              <div class="flex items-center gap-2 mb-1">
                <Smartphone :size="18" :class="bindingForm.bindingType === 'auto' ? 'text-blue-600' : 'text-blue-400'" />
                <span class="font-medium text-sm" :class="bindingForm.bindingType === 'auto' ? 'text-blue-900' : 'text-blue-700'">
                  小程序自动绑定
                </span>
              </div>
              <p class="text-xs" :class="bindingForm.bindingType === 'auto' ? 'text-blue-700' : 'text-blue-500'">
                用户在小程序进入档案时系统自动绑定，可修改健康教练
              </p>
            </button>
            <button
              type="button"
              @click="bindingForm.bindingType = 'manual'"
              :class="`p-3 rounded-lg border-2 text-left transition-all ${
                bindingForm.bindingType === 'manual'
                  ? 'border-indigo-500 bg-indigo-100'
                  : 'border-indigo-200 bg-white hover:bg-indigo-50'
              }`"
            >
              <div class="flex items-center gap-2 mb-1">
                <UserCog :size="18" :class="bindingForm.bindingType === 'manual' ? 'text-indigo-600' : 'text-indigo-400'" />
                <span class="font-medium text-sm" :class="bindingForm.bindingType === 'manual' ? 'text-indigo-900' : 'text-indigo-700'">
                  运营手动分配
                </span>
              </div>
              <p class="text-xs" :class="bindingForm.bindingType === 'manual' ? 'text-indigo-700' : 'text-indigo-500'">
                由运营人员手动分配绑定关系，可修改健康教练
              </p>
            </button>
          </div>
        </div>

        <!-- 绑定方式显示 (编辑时显示) -->
        <div v-else class="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div class="flex items-center gap-2 text-sm">
            <Info :size="16" class="text-blue-600" />
            <span class="text-slate-600">
              绑定方式：
              <span class="font-semibold">
                {{ editingBinding?.bindingType === 'auto' ? '小程序自动绑定' : '运营手动分配' }}
              </span>
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">用户ID *</label>
            <input v-model="bindingForm.userId" type="text" placeholder="请输入用户ID" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">用户姓名 *</label>
            <input v-model="bindingForm.userName" type="text" placeholder="请输入用户姓名" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">服务类型</label>
            <select v-model="bindingForm.serviceType" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="basic">基础干预 (100元/月)</option>
              <option value="deep">深度干预 (200元/月)</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">首次服务日期</label>
            <input v-model="bindingForm.firstServiceDate" type="date" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>

        <!-- 健康教练绑定 -->
        <div class="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-semibold text-indigo-900">健康教练绑定 *</label>
            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="openCoachSelector"
                class="text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-1"
              >
                <Search :size="12" /> 选择教练
              </button>
              <button
                type="button"
                @click="bindingForm.coachId = ''; bindingForm.coachName = ''"
                class="text-xs px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1"
              >
                <X :size="12" /> 清除
              </button>
            </div>
          </div>

          <!-- 已选择的教练显示 -->
          <div v-if="bindingForm.coachId" class="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-200">
            <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User :size="20" class="text-indigo-600" />
            </div>
            <div class="flex-1">
              <div class="font-medium text-slate-900">{{ bindingForm.coachName }}</div>
              <div class="text-xs text-slate-500">教练ID: {{ bindingForm.coachId }}</div>
            </div>
            <button
              type="button"
              @click="bindingForm.coachId = ''; bindingForm.coachName = ''"
              class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              title="移除教练"
            >
              <X :size="14" />
            </button>
          </div>
          <div v-else class="text-center py-4 text-slate-400 text-sm">
            未选择教练，请点击"选择教练"按钮进行绑定
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">绑定医生</label>
            <input v-model="bindingForm.doctorId" type="text" placeholder="医生ID" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">绑定顾问</label>
            <input v-model="bindingForm.consultantId" type="text" placeholder="顾问ID" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">服务开始日期</label>
            <input v-model="bindingForm.serviceStartDate" type="date" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">服务结束日期</label>
            <input v-model="bindingForm.serviceEndDate" type="date" placeholder="留空表示至今" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">状态</label>
            <select v-model="bindingForm.status" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="active">服务中</option>
              <option value="paused">已暂停</option>
              <option value="ended">已结束</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">备注</label>
          <textarea v-model="bindingForm.remark" rows="2" placeholder="填写备注信息..." class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
      <template #footer>
        <button @click="showBindingDialog = false" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">取消</button>
        <button @click="saveBinding" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{{ editingBinding ? '保存' : '添加' }}</button>
      </template>
    </Modal>

    <!-- 教练选择器弹窗 -->
    <Modal v-model:show="showCoachSelector" title="选择健康教练" size="md">
      <div class="space-y-4">
        <div class="relative">
          <Search :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="coachSearchText"
            type="text"
            placeholder="搜索教练姓名或ID..."
            class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div class="max-h-64 overflow-y-auto space-y-2">
          <div
            v-for="coach in filteredCoachList"
            :key="coach.id"
            @click="selectCoach(coach)"
            :class="`p-3 rounded-lg border-2 cursor-pointer transition-all ${
              bindingForm.coachId === coach.id
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
            }`"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <User :size="20" class="text-indigo-600" />
              </div>
              <div class="flex-1">
                <div class="font-medium text-slate-900">{{ coach.name }}</div>
                <div class="text-xs text-slate-500">ID: {{ coach.id }}</div>
              </div>
              <Check v-if="bindingForm.coachId === coach.id" :size="18" class="text-indigo-600" />
            </div>
          </div>
          <div v-if="filteredCoachList.length === 0" class="text-center py-8 text-slate-400">
            <Search :size="32" class="mx-auto mb-2 opacity-50" />
            <p>未找到匹配的教练</p>
          </div>
        </div>
      </div>
      <template #footer>
        <button @click="showCoachSelector = false" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">取消</button>
        <button @click="confirmCoachSelection" :disabled="!bindingForm.coachId" class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">确认选择</button>
      </template>
    </Modal>

    <!-- 教练提报弹窗 -->
    <Modal v-model:show="showCoachReportDialog" title="教练结算数据提报" size="lg">
      <div class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          <div class="flex items-center gap-2 font-semibold mb-1">
            <AlertCircle :size="16" />
            提报规则说明
          </div>
          <ul class="text-xs space-y-1 ml-6">
            <li>• 新用户（满3个月内）：400元/人/月</li>
            <li>• 老用户（满3个月后）：100元/人/月</li>
            <li>• 医生上线服务：200元/次（仅老用户）</li>
          </ul>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">选择教练 *</label>
            <select v-model="coachReportForm.coachId" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option value="">请选择教练</option>
              <option v-for="emp in filteredEmployees.filter(e => e.status === 'active')" :key="emp.id" :value="emp.id">{{ emp.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">提报月份</label>
            <input v-model="coachReportForm.period" type="month" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">新用户数（3个月内）</label>
            <input v-model.number="coachReportForm.newUserCount" type="number" min="0" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <p class="text-xs text-slate-500 mt-1">¥400/人</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">老用户数（3个月后）</label>
            <input v-model.number="coachReportForm.oldUserCount" type="number" min="0" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <p class="text-xs text-slate-500 mt-1">¥100/人</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">医生上线次数</label>
            <input v-model.number="coachReportForm.doctorOnlineCount" type="number" min="0" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            <p class="text-xs text-slate-500 mt-1">¥200/次</p>
          </div>
        </div>
        <!-- 金额预览 -->
        <div class="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h4 class="text-sm font-semibold text-slate-900 mb-3">金额预览</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-600">新用户费用：{{ coachReportForm.newUserCount }}人 × ¥400</span>
              <span class="font-semibold text-green-600">¥{{ (coachReportForm.newUserCount * 400).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">老用户费用：{{ coachReportForm.oldUserCount }}人 × ¥100</span>
              <span class="font-semibold text-green-600">¥{{ (coachReportForm.oldUserCount * 100).toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-600">医生上线费：{{ coachReportForm.doctorOnlineCount }}次 × ¥200</span>
              <span class="font-semibold text-green-600">¥{{ (coachReportForm.doctorOnlineCount * 200).toLocaleString() }}</span>
            </div>
            <div class="border-t border-slate-300 pt-2 mt-2">
              <div class="flex justify-between">
                <span class="font-semibold text-slate-900">合计</span>
                <span class="font-bold text-lg text-indigo-600">¥{{ calculateCoachReportAmount().totalAmount.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">备注</label>
          <textarea v-model="coachReportForm.remark" rows="2" placeholder="填写备注信息..." class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
      <template #footer>
        <button @click="showCoachReportDialog = false" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">取消</button>
        <button @click="submitCoachReport" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">提交提报</button>
      </template>
    </Modal>

    <!-- 结算详情弹窗 - 使用新的零工结算详情组件 -->
    <SettlementDetailModal
      :show="showSettlementDetail"
      :settlement="currentSettlement"
      @close="showSettlementDetail = false"
      @approve="handleApproveSettlement"
      @pay="handleProcessPayment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle,
  Plus,
  Search,
  Receipt,
  Download,
  X,
  Smartphone,
  UserCog,
  Info,
  User,
  Check
} from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import { useToast } from '../composables/useToast'
import { useRole, type UserRole } from '../composables/useRole'
import Modal from './shared/Modal.vue'
import ConfirmDialog from './shared/ConfirmDialog.vue'
import Toast from './shared/Toast.vue'
import EmployeesTab from './settlement/EmployeesTab.vue'
import CoachSettlementsTab from './settlement/CoachSettlementsTab.vue'
import PaymentsTab from './settlement/PaymentsTab.vue'
import ReportsTab from './settlement/ReportsTab.vue'
import RulesTab from './settlement/RulesTab.vue'
import SettlementDetailModal from './settlement/SettlementDetailModal.vue'
import { MOCK_USERS, SERVICE_TYPES } from '../data/mockUsers'

// Props
interface Props {
  currentRole?: UserRole
}
const props = withDefaults(defineProps<Props>(), {
  currentRole: undefined
})

type TabType = 'bindings' | 'employees' | 'settlements' | 'mypayslips' | 'payments' | 'reports' | 'rules'

// 获取当前角色信息
const { currentRole: globalRole, currentRoleConfig } = useRole()
const effectiveRole = computed(() => props.currentRole || globalRole.value)

// 判断是否为管理员或财务（可以查看所有教练数据）
const canViewAll = computed(() => {
  return effectiveRole.value === 'admin' || effectiveRole.value === 'finance'
})

// 判断是否为教练角色（只能看自己的数据）
const isCoach = computed(() => {
  return effectiveRole.value === 'coach'
})

// 用户绑定相关接口
interface UserBinding {
  id: string
  userId: string
  userName: string
  serviceType: 'basic' | 'deep'  // 基础干预 / 深度干预
  bindingType?: 'auto' | 'manual'  // 绑定方式：auto=小程序自动绑定, manual=运营手动分配
  firstServiceDate: string
  currentServicePeriod: string
  coachId?: string
  coachName?: string
  doctorId?: string
  doctorName?: string
  consultantId?: string
  consultantName?: string
  serviceStartDate: string
  serviceEndDate?: string
  status: 'active' | 'paused' | 'ended'
  remark?: string
}

interface ServiceRecord {
  id: string
  userId: string
  userName: string
  startDate: string
  endDate: string | null  // null 表示至今
  isNewUser: boolean
  serviceHours: number
  sessionCount: number
  managementDuration: number  // 管理时长（天）
  amount: number
  avatar?: string
}

interface Employee {
  id: string
  name: string
  phone: string
  idCard: string
  bankName: string
  bankAccount: string
  status: 'active' | 'inactive' | 'suspended'
  hireDate: string
  department: string
  totalUsers: number
  newUsers: number
  oldUsers: number
  totalSettled: number
  lastSettleDate?: string
  avatar?: string
  remark?: string
  serviceRecords?: ServiceRecord[]
}

interface SettlementRule {
  id: string
  name: string
  newUserRate: number
  oldUserRate: number
  performanceBonus: number
  effectiveDate: string
  description: string
}

interface SettlementRecord {
  id: string
  employeeId: string
  employeeName: string
  period: string
  totalUsers: number
  newUsers: number
  oldUsers: number
  newUserAmount: number
  oldUserAmount: number
  performanceBonus: number
  totalAmount: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  createdAt: string
  approvedAt?: string
  paidAt?: string
  department?: string
  newUserRate?: number
  oldUserRate?: number
  serviceCount?: number // 服务次数 - 零工结算用
  averageRating?: number // 平均评分 - 零工结算用
  orderCount?: number // 订单数量 - 接派单系统用
  serviceRecords?: Array<{
    id: string
    startDate: string
    endDate: string
    userName: string
    userId: string
    serviceType: string
    interventionDuration: number
    rating: number
    amount: number
  }>
}

interface PaymentRecord {
  id: string
  settlementId: string
  settlementPeriod: string
  employeeId: string
  employeeName: string
  bankName: string
  bankAccount: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  transactionId?: string
  paidAt?: string
  operator: string
  createdAt: string
}

// Composables
const toast = useToast()

// State
const tabs = [
  { id: 'bindings' as TabType, label: '用户绑定', icon: Users },
  { id: 'employees' as TabType, label: '员工管理', icon: Users },
  { id: 'settlements' as TabType, label: '结算明细', icon: FileText },
  { id: 'mypayslips' as TabType, label: '我的账单', icon: Receipt },
  { id: 'payments' as TabType, label: '发放记录', icon: CreditCard },
  { id: 'reports' as TabType, label: '统计报表', icon: BarChart3 },
  { id: 'rules' as TabType, label: '规则配置', icon: Settings }
]

const activeTab = ref<TabType>('bindings')
const expandedEmployees = ref<Set<string>>(new Set())
const selectedPeriod = ref('2026-02')
const employeeSearchText = ref('')

// 根据角色过滤员工数据 - 教练只能看到自己，管理员和财务可以看到所有
const filteredEmployees = computed(() => {
  if (canViewAll.value) {
    return employees.value
  }
  // 教练角色：只显示当前登录教练的数据（模拟：假设当前教练是张教练，id='1'）
  // 实际应该从登录用户信息中获取
  return employees.value.filter(e => e.id === '1')
})

// 结算单生成记录 - 记录每个月是否已生成结算单及生成日期
const settlementGenerationRecords = ref<Map<string, { generated: boolean; generatedAt: string; managementFee: number }>>(new Map())

// Dialog states
const showEmployeeDialog = ref(false)
const showSettlementDetail = ref(false)
const editingEmployee = ref<Employee | null>(null)
const currentSettlement = ref<SettlementRecord | null>(null)

// 辅助函数：根据员工的服务记录生成结算的服务记录
function generateSettlementServiceRecords(
  employeeId: string,
  period: string,
  settlementId: string,
  employeeServiceRecords: ServiceRecord[]
) {
  return employeeServiceRecords.map((record, index) => {
    // 计算干预时长
    const startDateObj = new Date(record.startDate)
    const endDateObj = record.endDate ? new Date(record.endDate) : new Date()
    const interventionDuration = Math.floor((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24))

    // 获取用户信息
    const userInfo = MOCK_USERS.coach[record.userId as keyof typeof MOCK_USERS.coach]

    return {
      id: `SR${settlementId}-${index}`,
      startDate: record.startDate,
      endDate: record.endDate || new Date().toISOString().split('T')[0],
      userName: userInfo?.name || record.userName,
      userId: record.userId,
      serviceType: SERVICE_TYPES.coach[index % SERVICE_TYPES.coach.length],
      interventionDuration,
      rating: Math.floor(4 + Math.random() * 1.2), // 4-5星
      amount: record.amount
    }
  })
}

// Employee form
const employeeForm = ref({
  name: '',
  phone: '',
  idCard: '',
  bankName: '',
  bankAccount: '',
  department: '',
  remark: ''
})

// Confirm dialog state
const confirm = ref({
  show: false,
  title: '',
  message: '',
  type: 'warning' as 'warning' | 'danger' | 'info',
  onConfirm: () => {},
  onCancel: () => {}
})

// Settlement rules
const settlementRules = ref<SettlementRule[]>([{
  id: '1',
  name: '标准结算规则',
  newUserRate: 400,
  oldUserRate: 100,
  performanceBonus: 0,
  effectiveDate: '2023-01-01',
  description: '默认结算规则，新用户400元/人/月，老用户100元/人/月'
}])

const currentRule = computed(() => settlementRules.value[0])

// 用户绑定数据
const userBindings = ref<UserBinding[]>([
  {
    id: 'ub001',
    userId: 'U001',
    userName: '王小红',
    serviceType: 'basic',
    firstServiceDate: '2023-12-01',
    currentServicePeriod: '2024-02',
    bindingType: 'auto', // 小程序自动绑定
    coachId: '1',
    coachName: '张教练',
    serviceStartDate: '2023-12-01',
    status: 'active'
  },
  {
    id: 'ub002',
    userId: 'U002',
    userName: '李大明',
    serviceType: 'deep',
    firstServiceDate: '2023-06-15',
    currentServicePeriod: '2024-02',
    bindingType: 'manual', // 运营手动分配
    coachId: '1',
    coachName: '张教练',
    doctorId: 'doc001',
    doctorName: '刘医生',
    serviceStartDate: '2023-06-15',
    status: 'active'
  },
  {
    id: 'ub003',
    userId: 'U003',
    userName: '陈美丽',
    serviceType: 'basic',
    firstServiceDate: '2024-01-10',
    currentServicePeriod: '2024-02',
    bindingType: 'auto',
    coachId: '2',
    coachName: '李教练',
    serviceStartDate: '2024-01-10',
    status: 'active'
  }
])

// 用户绑定搜索和筛选状态
const bindingSearchText = ref('')
const bindingFilterType = ref<'all' | 'coach' | 'doctor' | 'consultant'>('all')
const bindingFilterStatus = ref<'all' | 'active' | 'paused' | 'ended'>('all')

// 用户绑定编辑弹窗状态
const showBindingDialog = ref(false)
const editingBinding = ref<UserBinding | null>(null)
const bindingForm = ref({
  userId: '',
  userName: '',
  serviceType: 'basic' as 'basic' | 'deep',
  firstServiceDate: '',
  currentServicePeriod: '',
  bindingType: 'manual' as 'auto' | 'manual', // 绑定方式：auto=小程序自动绑定, manual=运营手动分配
  coachId: '',
  coachName: '',
  doctorId: '',
  consultantId: '',
  serviceStartDate: '',
  serviceEndDate: '',
  status: 'active' as 'active' | 'paused' | 'ended',
  remark: ''
})

// 教练选择器相关状态
const showCoachSelector = ref(false)
const coachSearchText = ref('')

// 用户绑定筛选计算属性
const filteredBindings = computed(() => {
  let filtered = userBindings.value

  // 搜索筛选
  if (bindingSearchText.value) {
    const searchLower = bindingSearchText.value.toLowerCase()
    filtered = filtered.filter(b =>
      b.userId.toLowerCase().includes(searchLower) ||
      b.userName.toLowerCase().includes(searchLower) ||
      b.coachName?.toLowerCase().includes(searchLower) ||
      b.doctorName?.toLowerCase().includes(searchLower) ||
      b.consultantName?.toLowerCase().includes(searchLower)
    )
  }

  // 角色筛选
  if (bindingFilterType.value !== 'all') {
    filtered = filtered.filter(b => {
      switch (bindingFilterType.value) {
        case 'coach': return !!b.coachId
        case 'doctor': return !!b.doctorId
        case 'consultant': return !!b.consultantId
        default: return true
      }
    })
  }

  // 状态筛选
  if (bindingFilterStatus.value !== 'all') {
    filtered = filtered.filter(b => b.status === bindingFilterStatus.value)
  }

  return filtered
})

// 清除用户绑定筛选
const clearBindingFilters = () => {
  bindingSearchText.value = ''
  bindingFilterType.value = 'all'
  bindingFilterStatus.value = 'all'
  toast.info('筛选已清除', '显示全部绑定关系')
}

// 用户绑定相关方法
const openBindingDialog = () => {
  editingBinding.value = null
  bindingForm.value = {
    userId: '',
    userName: '',
    serviceType: 'basic',
    bindingType: 'manual', // 默认为运营手动分配
    firstServiceDate: new Date().toISOString().split('T')[0],
    currentServicePeriod: new Date().toISOString().slice(0, 7).replace('-', '-'),
    coachId: '',
    coachName: '',
    doctorId: '',
    consultantId: '',
    serviceStartDate: new Date().toISOString().split('T')[0],
    serviceEndDate: '',
    status: 'active',
    remark: ''
  }
  showBindingDialog.value = true
}

const editBinding = (binding: UserBinding) => {
  editingBinding.value = binding
  bindingForm.value = {
    userId: binding.userId,
    userName: binding.userName,
    serviceType: binding.serviceType,
    firstServiceDate: binding.firstServiceDate,
    currentServicePeriod: binding.currentServicePeriod,
    coachId: binding.coachId || '',
    doctorId: binding.doctorId || '',
    consultantId: binding.consultantId || '',
    serviceStartDate: binding.serviceStartDate,
    serviceEndDate: binding.serviceEndDate || '',
    status: binding.status,
    remark: binding.remark || ''
  }
  showBindingDialog.value = true
}

const saveBinding = () => {
  if (!bindingForm.value.userId || !bindingForm.value.userName) {
    toast.error('验证失败', '请输入用户ID和姓名')
    return
  }

  if (!bindingForm.value.coachId) {
    toast.error('验证失败', '请选择健康教练')
    return
  }

  if (editingBinding.value) {
    // 更新现有绑定
    const index = userBindings.value.findIndex(b => b.id === editingBinding.value!.id)
    if (index !== -1) {
      userBindings.value[index] = {
        ...userBindings.value[index],
        userId: bindingForm.value.userId,
        userName: bindingForm.value.userName,
        serviceType: bindingForm.value.serviceType,
        firstServiceDate: bindingForm.value.firstServiceDate,
        currentServicePeriod: bindingForm.value.currentServicePeriod,
        coachId: bindingForm.value.coachId,
        coachName: bindingForm.value.coachName,
        doctorId: bindingForm.value.doctorId,
        doctorName: bindingForm.value.doctorId || '',
        consultantId: bindingForm.value.consultantId,
        consultantName: bindingForm.value.consultantId || '',
        serviceStartDate: bindingForm.value.serviceStartDate,
        serviceEndDate: bindingForm.value.serviceEndDate || undefined,
        status: bindingForm.value.status,
        remark: bindingForm.value.remark
      }
    }
    toast.success('更新成功', `用户 "${bindingForm.value.userName}" 的绑定关系已更新`)
  } else {
    // 新增绑定
    const newBinding: UserBinding = {
      id: `ub${Date.now()}`,
      userId: bindingForm.value.userId,
      userName: bindingForm.value.userName,
      serviceType: bindingForm.value.serviceType,
      firstServiceDate: bindingForm.value.firstServiceDate,
      currentServicePeriod: bindingForm.value.currentServicePeriod,
      coachId: bindingForm.value.coachId,
      coachName: coach?.name,
      doctorId: bindingForm.value.doctorId,
      doctorName: bindingForm.value.doctorId || '',
      consultantId: bindingForm.value.consultantId,
      consultantName: bindingForm.value.consultantId || '',
      serviceStartDate: bindingForm.value.serviceStartDate,
      serviceEndDate: bindingForm.value.serviceEndDate || undefined,
      status: bindingForm.value.status,
      remark: bindingForm.value.remark
    }
    userBindings.value.push(newBinding)
    toast.success('添加成功', `用户 "${bindingForm.value.userName}" 的绑定关系已创建`)
  }

  showBindingDialog.value = false
}

const confirmDeleteBinding = (bindingId: string) => {
  const binding = userBindings.value.find(b => b.id === bindingId)
  if (!binding) return

  confirm.value = {
    show: true,
    title: '删除绑定关系',
    message: `确定要删除用户 "${binding.userName}" 的绑定关系吗？此操作不可恢复。`,
    type: 'danger',
    onConfirm: () => {
      userBindings.value = userBindings.value.filter(b => b.id !== bindingId)
      toast.success('删除成功', '绑定关系已删除')
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

// 教练选择相关方法
const filteredCoachList = computed(() => {
  if (!coachSearchText.value) {
    return employees.value.filter(e => e.status === 'active')
  }
  const searchLower = coachSearchText.value.toLowerCase()
  return employees.value.filter(e =>
    e.status === 'active' &&
    (e.name.toLowerCase().includes(searchLower) ||
     e.id.toLowerCase().includes(searchLower))
  )
})

const openCoachSelector = () => {
  coachSearchText.value = ''
  showCoachSelector.value = true
}

const selectCoach = (coach: any) => {
  bindingForm.value.coachId = coach.id
  bindingForm.value.coachName = coach.name
}

const confirmCoachSelection = () => {
  showCoachSelector.value = false
}

// 提报相关接口和状态
interface CoachReport {
  id: string
  coachId: string
  coachName: string
  period: string
  newUserCount: number  // 满3个月内用户数
  oldUserCount: number  // 满3个月后用户数
  doctorOnlineCount: number  // 医生上线次数（仅满3个月后用户）
  newUserAmount: number  // 400元/月
  oldUserAmount: number  // 100元/月
  doctorOnlineAmount: number  // 200元/次
  totalAmount: number
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  submittedAt?: string
  remark?: string
}

// 提报数据
const coachReports = ref<CoachReport[]>([
  {
    id: 'cr001',
    coachId: '1',
    coachName: '张教练',
    period: '2026-02',
    newUserCount: 18,
    oldUserCount: 34,
    doctorOnlineCount: 12,
    newUserAmount: 7200,
    oldUserAmount: 3400,
    doctorOnlineAmount: 2400,
    totalAmount: 13000,
    status: 'submitted',
    submittedAt: '2026-02-07 10:30'
  }
])

// 提报弹窗状态
const showCoachReportDialog = ref(false)
const editingCoachReport = ref<CoachReport | null>(null)

const coachReportForm = ref({
  coachId: '',
  period: new Date().toISOString().slice(0, 7).replace('-', '-'),
  newUserCount: 0,
  oldUserCount: 0,
  doctorOnlineCount: 0,
  remark: ''
})

const consultantReportForm = ref({
  consultantId: '',
  consultantName: '',
  period: new Date().toISOString().slice(0, 7).replace('-', '-'),
  basicServiceUsers: 0,
  deepServiceUsers: 0,
  remark: ''
})

// 我的账单数据
interface MonthlyBill {
  period: string
  newUserCount: number
  oldUserCount: number
  doctorOnlineCount: number
  newUserAmount: number
  oldUserAmount: number
  doctorOnlineAmount: number
  totalAmount: number
  status: 'pending' | 'approved' | 'paid'
  paidAt?: string
}

const myBills = ref<MonthlyBill[]>([
  {
    period: '2026-02',
    newUserCount: 18,
    oldUserCount: 34,
    doctorOnlineCount: 12,
    newUserAmount: 7200,
    oldUserAmount: 3400,
    doctorOnlineAmount: 2400,
    totalAmount: 13000,
    status: 'pending'
  },
  {
    period: '2026-01',
    newUserCount: 15,
    oldUserCount: 30,
    doctorOnlineCount: 10,
    newUserAmount: 6000,
    oldUserAmount: 3000,
    doctorOnlineAmount: 2000,
    totalAmount: 11000,
    status: 'approved'
  },
  {
    period: '2025-12',
    newUserCount: 20,
    oldUserCount: 28,
    doctorOnlineCount: 15,
    newUserAmount: 8000,
    oldUserAmount: 2800,
    doctorOnlineAmount: 3000,
    totalAmount: 13800,
    status: 'paid',
    paidAt: '2025-12-15'
  }
])

// 当前选中月份的账单
const myMonthlyBill = computed(() => {
  const bill = myBills.value.find(b => b.period === selectedPeriod.value)
  return bill || {
    period: selectedPeriod.value,
    newUserCount: 0,
    oldUserCount: 0,
    doctorOnlineCount: 0,
    newUserAmount: 0,
    oldUserAmount: 0,
    doctorOnlineAmount: 0,
    totalAmount: 0,
    status: 'pending'
  }
})

// 导出我的账单
const exportMyBill = () => {
  const bill = myMonthlyBill.value

  try {
    // 创建工作簿
    const wb = XLSX.utils.book_new()

    // 创建汇总数据
    const summaryData = [
      { '项目': '结算期间', '值': bill.period },
      { '项目': '新用户数量', '值': bill.newUserCount },
      { '项目': '新用户费用', '值': bill.newUserAmount },
      { '项目': '老用户数量', '值': bill.oldUserCount },
      { '项目': '老用户费用', '值': bill.oldUserAmount },
      { '项目': '医生上线次数', '值': bill.doctorOnlineCount },
      { '项目': '医生上线费用', '值': bill.doctorOnlineAmount },
      { '项目': '合计金额', '值': bill.totalAmount },
      { '项目': '账单状态', '值': bill.status === 'paid' ? '已打款' : bill.status === 'approved' ? '已审核' : '待审核' }
    ]

    // 创建汇总工作表
    const summaryWs = XLSX.utils.json_to_sheet(summaryData, { header: ['项目', '值'] })
    summaryWs['!cols'] = [{ wch: 20 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, summaryWs, '账单汇总')

    // 创建明细数据
    const currentSettlements = filteredSettlements.value
    const detailData = currentSettlements.map(s => ({
      '结算单号': s.id,
      '教练姓名': s.employeeName,
      '部门': s.department || '运动康复部',
      '服务用户数': s.totalUsers,
      '新用户数': s.newUsers,
      '新用户金额': s.newUserAmount,
      '老用户数': s.oldUsers,
      '老用户金额': s.oldUserAmount,
      '绩效奖金': s.performanceBonus,
      '结算金额': s.totalAmount,
      '状态': s.status === 'pending' ? '待审批' : s.status === 'approved' ? '已审批' : s.status === 'paid' ? '已发放' : '已驳回',
      '创建时间': s.createdAt
    }))

    // 创建明细工作表
    const detailWs = XLSX.utils.json_to_sheet(detailData)
    detailWs['!cols'] = [
      { wch: 15 }, // 结算单号
      { wch: 12 }, // 教练姓名
      { wch: 15 }, // 部门
      { wch: 12 }, // 服务用户数
      { wch: 10 }, // 新用户数
      { wch: 12 }, // 新用户金额
      { wch: 10 }, // 老用户数
      { wch: 12 }, // 老用户金额
      { wch: 12 }, // 绩效奖金
      { wch: 12 }, // 结算金额
      { wch: 10 }, // 状态
      { wch: 20 }  // 创建时间
    ]
    XLSX.utils.book_append_sheet(wb, detailWs, '结算明细')

    // 生成文件名
    const fileName = `月度结算账单_${bill.period}_${new Date().toISOString().split('T')[0]}.xlsx`

    // 导出文件
    XLSX.writeFile(wb, fileName)

    toast.success('导出成功', `已导出 ${bill.period} 账单，金额 ¥${bill.totalAmount.toLocaleString()}`)
  } catch (error) {
    console.error('导出失败:', error)
    toast.error('导出失败', '导出账单时发生错误，请重试')
  }
}

// 查看账单详情
const viewBillDetail = (period: string) => {
  selectedPeriod.value = period
  toast.info('账单详情', `已切换到 ${period} 的账单详情`)
}

// 检查提报时效（每日可提报）
const checkReportPeriod = () => {
  // 每日都可以提报
  return true
}

// 计算提报金额
const calculateCoachReportAmount = () => {
  return {
    newUserAmount: coachReportForm.value.newUserCount * 400,
    oldUserAmount: coachReportForm.value.oldUserCount * 100,
    doctorOnlineAmount: coachReportForm.value.doctorOnlineCount * 200,
    totalAmount:
      coachReportForm.value.newUserCount * 400 +
      coachReportForm.value.oldUserCount * 100 +
      coachReportForm.value.doctorOnlineCount * 200
  }
}

const calculateConsultantReportAmount = () => {
  return {
    basicAmount: consultantReportForm.value.basicServiceUsers * 100,
    deepAmount: consultantReportForm.value.deepServiceUsers * 200,
    totalAmount:
      consultantReportForm.value.basicServiceUsers * 100 +
      consultantReportForm.value.deepServiceUsers * 200
  }
}

// 打开教练提报弹窗
const openCoachReportDialog = () => {
  if (!checkReportPeriod()) return

  editingCoachReport.value = null
  coachReportForm.value = {
    coachId: '',
    period: new Date().toISOString().slice(0, 7).replace('-', '-'),
    newUserCount: 0,
    oldUserCount: 0,
    doctorOnlineCount: 0,
    remark: ''
  }
  showCoachReportDialog.value = true
}

// 提交教练提报
const submitCoachReport = () => {
  if (!coachReportForm.value.coachId) {
    toast.error('验证失败', '请选择教练')
    return
  }

  const coach = employees.value.find(e => e.id === coachReportForm.value.coachId)
  const amounts = calculateCoachReportAmount()

  const report: CoachReport = {
    id: `cr${Date.now()}`,
    coachId: coachReportForm.value.coachId,
    coachName: coach?.name || '',
    period: coachReportForm.value.period,
    newUserCount: coachReportForm.value.newUserCount,
    oldUserCount: coachReportForm.value.oldUserCount,
    doctorOnlineCount: coachReportForm.value.doctorOnlineCount,
    newUserAmount: amounts.newUserAmount,
    oldUserAmount: amounts.oldUserAmount,
    doctorOnlineAmount: amounts.doctorOnlineAmount,
    totalAmount: amounts.totalAmount,
    status: 'submitted',
    submittedAt: new Date().toLocaleString('zh-CN'),
    remark: coachReportForm.value.remark
  }

  coachReports.value.push(report)
  toast.success('提报成功', `已提交 ${coach?.name} 的结算提报，待审核`)
  showCoachReportDialog.value = false
}

// 审核教练提报
const approveCoachReport = (reportId: string) => {
  const report = coachReports.value.find(r => r.id === reportId)
  if (report) {
    report.status = 'approved'
    toast.success('审核通过', `${report.coachName} 的提报已审核通过，金额 ¥${report.totalAmount.toLocaleString()} 已锁定`)
  }
}

const rejectCoachReport = (reportId: string) => {
  const report = coachReports.value.find(r => r.id === reportId)
  if (report) {
    confirm.value = {
      show: true,
      title: '驳回提报',
      message: `确定要驳回 ${report.coachName} 的提报吗？驳回后需要重新提报。`,
      type: 'warning',
      onConfirm: () => {
        report.status = 'rejected'
        toast.success('已驳回', `${report.coachName} 的提报已被驳回`)
        confirm.value.show = false
      },
      onCancel: () => {
        confirm.value.show = false
      }
    }
  }
}

// 查看提报详情
const viewCoachReportDetail = (reportId: string) => {
  const report = coachReports.value.find(r => r.id === reportId)
  if (report) {
    // TODO: 打开详情弹窗
    toast.info('提报详情', `教练：${report.coachName}\n新用户：${report.newUserCount}人\n老用户：${report.oldUserCount}人\n医生上线：${report.doctorOnlineCount}次`)
  }
}

// 打开顾问提报弹窗
const openConsultantReportDialog = () => {
  if (!checkReportPeriod()) return

  editingConsultantReport.value = null
  consultantReportForm.value = {
    consultantId: '',
    consultantName: '',
    period: new Date().toISOString().slice(0, 7).replace('-', '-'),
    basicServiceUsers: 0,
    deepServiceUsers: 0,
    remark: ''
  }
  showConsultantReportDialog.value = true
}

// 提交顾问提报
const submitConsultantReport = () => {
  if (!consultantReportForm.value.consultantName) {
    toast.error('验证失败', '请输入顾问姓名')
    return
  }

  const amounts = calculateConsultantReportAmount()

  const report: ConsultantReport = {
    id: `conr${Date.now()}`,
    consultantId: consultantReportForm.value.consultantId,
    consultantName: consultantReportForm.value.consultantName,
    period: consultantReportForm.value.period,
    basicServiceUsers: consultantReportForm.value.basicServiceUsers,
    deepServiceUsers: consultantReportForm.value.deepServiceUsers,
    basicAmount: amounts.basicAmount,
    deepAmount: amounts.deepAmount,
    totalAmount: amounts.totalAmount,
    status: 'submitted',
    submittedAt: new Date().toLocaleString('zh-CN'),
    remark: consultantReportForm.value.remark
  }

  consultantReports.value.push(report)
  toast.success('提报成功', `已提交 ${consultantReportForm.value.consultantName} 的佣金提报，待审核`)
  showConsultantReportDialog.value = false
}

// Employees data
const employees = ref<Employee[]>([
  {
    id: '1',
    name: '张教练',
    phone: '13800138001',
    idCard: '310101199001011234',
    bankName: '中国工商银行',
    bankAccount: '6212260200001234567',
    status: 'active',
    hireDate: '2023-06-15',
    department: '运动康复部',
    totalUsers: 45,
    newUsers: 12,
    oldUsers: 33,
    totalSettled: 85600,
    lastSettleDate: '2024-01-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
    remark: '负责运动康复指导',
    serviceRecords: [
      {
        id: 's1',
        userId: 'u001',
        userName: '王小红',
        startDate: '2023-12-01',
        endDate: null, // null 表示至今仍在管理
        isNewUser: true,
        serviceHours: 12,
        sessionCount: 8,
        managementDuration: 85, // 管理天数（从开始到今天）
        amount: 400,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=WangXiaohong'
      },
      {
        id: 's2',
        userId: 'u002',
        userName: '李大明',
        startDate: '2023-06-15',
        endDate: '2024-01-20', // 已结束管理
        isNewUser: false,
        serviceHours: 10,
        sessionCount: 6,
        managementDuration: 219, // 管理天数
        amount: 100,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiDaming'
      },
      {
        id: 's3',
        userId: 'u003',
        userName: '陈美丽',
        startDate: '2024-01-05',
        endDate: null,
        isNewUser: true,
        serviceHours: 8,
        sessionCount: 5,
        managementDuration: 50,
        amount: 400,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChenMeili'
      }
    ]
  },
  {
    id: '2',
    name: '李教练',
    phone: '13800138002',
    idCard: '310101199002022345',
    bankName: '中国建设银行',
    bankAccount: '6217000030001234567',
    status: 'active',
    hireDate: '2023-08-20',
    department: '体能训练部',
    totalUsers: 38,
    newUsers: 8,
    oldUsers: 30,
    totalSettled: 62400,
    lastSettleDate: '2026-01-15',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li',
    remark: '擅长体能训练',
    serviceRecords: [
      {
        id: 's4',
        userId: 'u004',
        userName: '张伟',
        startDate: '2023-10-01',
        endDate: null,
        isNewUser: false,
        serviceHours: 15,
        sessionCount: 10,
        managementDuration: 146,
        amount: 100,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZhangWei'
      }
    ]
  }
])

// Settlement records - 包含历史月份数据，支持零工结算查看
const settlements = ref<SettlementRecord[]>([
  // 2026年2月 - 当前月份 - 张教练
  {
    id: '1',
    employeeId: '1',
    employeeName: '张教练',
    period: '2026-02',
    totalUsers: 52,
    newUsers: 18,
    oldUsers: 34,
    newUserAmount: 7200,
    oldUserAmount: 3400,
    performanceBonus: 800,
    totalAmount: 11400,
    status: 'pending',
    createdAt: '2026-02-24',
    department: '运动康复部',
    newUserRate: 400,
    oldUserRate: 100,
    serviceCount: 156,
    averageRating: 4.8,
    orderCount: 52,
    serviceRecords: [
      {
        id: 'SR1-0',
        startDate: '2023-12-01',
        endDate: '2026-02-24',
        userName: '王小红',
        userId: 'u001',
        serviceType: '体能训练',
        interventionDuration: 850,
        rating: 5,
        amount: 400
      },
      {
        id: 'SR1-1',
        startDate: '2024-01-05',
        endDate: '2026-02-24',
        userName: '陈美丽',
        userId: 'u003',
        serviceType: '康复指导',
        interventionDuration: 785,
        rating: 5,
        amount: 400
      },
      {
        id: 'SR1-2',
        startDate: '2024-02-10',
        endDate: '2026-02-24',
        userName: '刘洋',
        userId: 'u005',
        serviceType: '营养咨询',
        interventionDuration: 745,
        rating: 4,
        amount: 400
      },
      {
        id: 'SR1-3',
        startDate: '2024-03-15',
        endDate: '2026-02-24',
        userName: '孙芳',
        userId: 'u006',
        serviceType: '运动评估',
        interventionDuration: 711,
        rating: 5,
        amount: 100
      }
    ]
  },
  {
    id: '2',
    employeeId: '2',
    employeeName: '李教练',
    period: '2026-02',
    totalUsers: 41,
    newUsers: 12,
    oldUsers: 29,
    newUserAmount: 4800,
    oldUserAmount: 2900,
    performanceBonus: 600,
    totalAmount: 8300,
    status: 'approved',
    createdAt: '2026-02-20',
    approvedAt: '2026-02-22',
    department: '体能训练部',
    newUserRate: 400,
    oldUserRate: 100,
    serviceCount: 123,
    averageRating: 4.7,
    orderCount: 41,
    serviceRecords: [
      {
        id: 'SR2-0',
        startDate: '2023-10-01',
        endDate: '2026-02-24',
        userName: '张伟',
        userId: 'u004',
        serviceType: '体能训练',
        interventionDuration: 877,
        rating: 5,
        amount: 100
      },
      {
        id: 'SR2-1',
        startDate: '2024-05-20',
        endDate: '2026-02-24',
        userName: '周强',
        userId: 'u007',
        serviceType: '康复指导',
        interventionDuration: 645,
        rating: 4,
        amount: 400
      }
    ]
  },
  {
    id: '3',
    employeeId: '3',
    employeeName: '王教练',
    period: '2026-02',
    totalUsers: 35,
    newUsers: 8,
    oldUsers: 27,
    newUserAmount: 3200,
    oldUserAmount: 2700,
    performanceBonus: 500,
    totalAmount: 6400,
    status: 'pending',
    createdAt: '2026-02-20',
    department: '营养指导部',
    newUserRate: 400,
    oldUserRate: 100,
    serviceCount: 105,
    averageRating: 4.9,
    orderCount: 35
  },
  // 2026年1月 - 张教练
  {
    id: '4',
    employeeId: '1',
    employeeName: '张教练',
    period: '2026-01',
    totalUsers: 48,
    newUsers: 15,
    oldUsers: 33,
    newUserAmount: 6000,
    oldUserAmount: 3300,
    performanceBonus: 750,
    totalAmount: 10050,
    status: 'paid',
    createdAt: '2026-02-01',
    approvedAt: '2026-02-03',
    paidAt: '2026-02-08',
    department: '运动康复部',
    newUserRate: 400,
    oldUserRate: 100,
    serviceCount: 144,
    averageRating: 4.8,
    orderCount: 48,
    serviceRecords: [
      {
        id: 'SR4-0',
        startDate: '2023-12-01',
        endDate: '2026-01-31',
        userName: '王小红',
        userId: 'u001',
        serviceType: '体能训练',
        interventionDuration: 822,
        rating: 5,
        amount: 400
      },
      {
        id: 'SR4-1',
        startDate: '2024-01-05',
        endDate: '2026-01-31',
        userName: '陈美丽',
        userId: 'u003',
        serviceType: '康复指导',
        interventionDuration: 757,
        rating: 5,
        amount: 400
      },
      {
        id: 'SR4-2',
        startDate: '2024-02-10',
        endDate: '2026-01-31',
        userName: '刘洋',
        userId: 'u005',
        serviceType: '营养咨询',
        interventionDuration: 721,
        rating: 4,
        amount: 400
      },
      {
        id: 'SR4-3',
        startDate: '2024-03-15',
        endDate: '2026-01-31',
        userName: '孙芳',
        userId: 'u006',
        serviceType: '运动评估',
        interventionDuration: 687,
        rating: 5,
        amount: 100
      }
    ]
  },
  {
    id: '5',
    employeeId: '2',
    employeeName: '李教练',
    period: '2026-01',
    totalUsers: 39,
    newUsers: 10,
    oldUsers: 29,
    newUserAmount: 4000,
    oldUserAmount: 2900,
    performanceBonus: 550,
    totalAmount: 7450,
    status: 'paid',
    createdAt: '2026-02-01',
    approvedAt: '2026-02-03',
    paidAt: '2026-02-08',
    department: '体能训练部',
    newUserRate: 400,
    oldUserRate: 100,
    serviceCount: 117,
    averageRating: 4.7,
    orderCount: 39
  },
  {
    id: '6',
    employeeId: '3',
    employeeName: '王教练',
    period: '2026-01',
    totalUsers: 32,
    newUsers: 7,
    oldUsers: 25,
    newUserAmount: 2800,
    oldUserAmount: 2500,
    performanceBonus: 450,
    totalAmount: 5750,
    status: 'paid',
    createdAt: '2026-02-01',
    approvedAt: '2026-02-03',
    paidAt: '2026-02-08',
    department: '营养指导部',
    newUserRate: 400,
    oldUserRate: 100,
    serviceCount: 96,
    averageRating: 4.9,
    orderCount: 32
  },
  // 2025年12月
  {
    id: '7',
    employeeId: '1',
    employeeName: '张教练',
    period: '2025-12',
    totalUsers: 55,
    newUsers: 20,
    oldUsers: 35,
    newUserAmount: 8000,
    oldUserAmount: 3500,
    performanceBonus: 900,
    totalAmount: 12400,
    status: 'paid',
    createdAt: '2026-01-01',
    approvedAt: '2026-01-03',
    paidAt: '2026-01-10',
    department: '运动康复部',
    newUserRate: 400,
    oldUserRate: 100,
    serviceCount: 165,
    averageRating: 4.9,
    orderCount: 55
  },
  {
    id: '8',
    employeeId: '2',
    employeeName: '李教练',
    period: '2025-12',
    totalUsers: 43,
    newUsers: 13,
    oldUsers: 30,
    newUserAmount: 5200,
    oldUserAmount: 3000,
    performanceBonus: 650,
    totalAmount: 8850,
    status: 'paid',
    createdAt: '2026-01-01',
    approvedAt: '2026-01-03',
    paidAt: '2026-01-10',
    department: '体能训练部',
    newUserRate: 400,
    oldUserRate: 100,
    serviceCount: 129,
    averageRating: 4.8,
    orderCount: 43
  },
  // 2025年11月
  {
    id: '9',
    employeeId: '1',
    employeeName: '张教练',
    period: '2025-11',
    totalUsers: 50,
    newUsers: 16,
    oldUsers: 34,
    newUserAmount: 6400,
    oldUserAmount: 3400,
    performanceBonus: 800,
    totalAmount: 10600,
    status: 'paid',
    createdAt: '2025-12-01',
    approvedAt: '2025-12-03',
    paidAt: '2025-12-08',
    department: '运动康复部',
    newUserRate: 400,
    oldUserRate: 100,
    serviceCount: 150,
    averageRating: 4.8,
    orderCount: 50
  },
  // 2025年10月
  {
    id: '10',
    employeeId: '2',
    employeeName: '李教练',
    period: '2025-10',
    totalUsers: 38,
    newUsers: 11,
    oldUsers: 27,
    newUserAmount: 4400,
    oldUserAmount: 2700,
    performanceBonus: 550,
    totalAmount: 7650,
    status: 'paid',
    createdAt: '2025-11-01',
    approvedAt: '2025-11-03',
    paidAt: '2025-11-08',
    department: '体能训练部',
    newUserRate: 400,
    oldUserRate: 100,
    serviceCount: 114,
    averageRating: 4.7,
    orderCount: 38
  }
])

// Payments
const payments = ref<PaymentRecord[]>([
  {
    id: '1',
    settlementId: '1',
    settlementPeriod: '2024-01',
    employeeId: '1',
    employeeName: '张教练',
    bankName: '中国工商银行',
    bankAccount: '6212260200001234567',
    amount: 8100,
    status: 'success',
    transactionId: 'TXN2024020512345',
    paidAt: '2024-02-05 10:30:00',
    operator: '管理员',
    createdAt: '2024-02-05 10:28:00'
  }
])

// Computed
const stats = computed(() => {
  const activeEmployees = employees.value.filter(e => e.status === 'active').length
  const totalUsers = employees.value.reduce((sum, e) => sum + e.totalUsers, 0)
  const currentMonthSettlements = settlements.value.filter(s => s.period === selectedPeriod.value)
  const pendingAmount = currentMonthSettlements
    .filter(s => s.status === 'pending' || s.status === 'approved')
    .reduce((sum, s) => sum + s.totalAmount, 0)
  const paidAmount = currentMonthSettlements
    .filter(s => s.status === 'paid')
    .reduce((sum, s) => sum + s.totalAmount, 0)

  return { activeEmployees, totalUsers, pendingAmount, paidAmount }
})

// 检查当前月份是否已生成结算单
const currentPeriodGenerationStatus = computed(() => {
  return settlementGenerationRecords.value.get(selectedPeriod.value) || { generated: false, generatedAt: '', managementFee: 0 }
})

// 根据角色过滤结算数据 - 必须在 settlements 定义之后
const filteredSettlements = computed(() => {
  let result = settlements.value

  // 根据角色过滤
  if (!canViewAll.value) {
    // 教练角色：只显示当前教练的结算记录
    result = result.filter(s => s.employeeId === '1')
  }

  // 根据选定期间过滤
  if (selectedPeriod.value) {
    result = result.filter(s => s.period === selectedPeriod.value)
  }

  return result
})

// Methods
const toggleEmployeeExpand = (id: string) => {
  const newExpanded = new Set(expandedEmployees.value)
  if (newExpanded.has(id)) {
    newExpanded.delete(id)
  } else {
    newExpanded.add(id)
  }
  expandedEmployees.value = newExpanded
}

const openEmployeeDialog = () => {
  editingEmployee.value = null
  employeeForm.value = {
    name: '',
    phone: '',
    idCard: '',
    bankName: '',
    bankAccount: '',
    department: '',
    remark: ''
  }
  showEmployeeDialog.value = true
}

const handleEditEmployee = (employee: Employee) => {
  editingEmployee.value = employee
  employeeForm.value = {
    name: employee.name,
    phone: employee.phone,
    idCard: employee.idCard,
    bankName: employee.bankName,
    bankAccount: employee.bankAccount,
    department: employee.department,
    remark: employee.remark || ''
  }
  showEmployeeDialog.value = true
}

const saveEmployee = () => {
  if (!employeeForm.value.name || !employeeForm.value.phone) {
    toast.error('验证失败', '请填写姓名和手机号')
    return
  }

  if (editingEmployee.value) {
    Object.assign(editingEmployee.value, employeeForm.value)
    toast.success('更新成功', `教练 "${employeeForm.value.name}" 信息已更新`)
  } else {
    employees.value.push({
      id: `emp-${Date.now()}`,
      status: 'active',
      hireDate: new Date().toISOString().split('T')[0],
      totalUsers: 0,
      newUsers: 0,
      oldUsers: 0,
      totalSettled: 0,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${employeeForm.value.name}`,
      ...employeeForm.value
    } as Employee)
    toast.success('添加成功', `教练 "${employeeForm.value.name}" 已添加`)
  }

  showEmployeeDialog.value = false
}

const confirmDeleteEmployee = (id: string) => {
  const employee = employees.value.find(e => e.id === id)
  if (!employee) return

  confirm.value = {
    show: true,
    title: '删除教练',
    message: `确定要删除教练 "${employee.name}" 吗？此操作不可恢复。`,
    type: 'danger',
    onConfirm: () => {
      employees.value = employees.value.filter(e => e.id !== id)
      toast.success('删除成功', `教练 "${employee.name}" 已删除`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const handleGenerateSettlement = () => {
  // 检查当前月份是否已生成结算单
  const currentStatus = currentPeriodGenerationStatus.value
  if (currentStatus.generated) {
    toast.warning('无法生成', `本月结算单已于 ${currentStatus.generatedAt} 生成，每月只能生成一次`)
    return
  }

  toast.info('生成中', '正在生成本月结算单...')

  // 计算管理费用 - 基于生成日期计算当月的管理费用
  const now = new Date()
  const generatedAt = now.toISOString().split('T')[0]

  // 计算当月管理费用：假设为当月所有结算金额的5%（可根据实际需求调整）
  const monthSettlements = settlements.value.filter(s => s.period === selectedPeriod.value)
  const totalAmount = monthSettlements.reduce((sum, s) => sum + s.totalAmount, 0)
  const managementFee = Math.round(totalAmount * 0.05) // 5%管理费

  // 记录生成信息
  settlementGenerationRecords.value.set(selectedPeriod.value, {
    generated: true,
    generatedAt,
    managementFee
  })

  setTimeout(() => {
    toast.success('生成成功', `本月结算单已生成（生成日期：${generatedAt}，管理费用：¥${managementFee.toLocaleString()}）`)
  }, 1500)
}

const handleApproveSettlement = (id: string) => {
  const settlement = settlements.value.find(s => s.id === id)
  if (settlement) {
    settlement.status = 'approved'
    settlement.approvedAt = new Date().toISOString().split('T')[0]
    toast.success('审批成功', `已通过 "${settlement.employeeName}" 的结算单`)
  }
}

const handleRejectSettlement = (id: string) => {
  const settlement = settlements.value.find(s => s.id === id)
  if (settlement) {
    confirm.value = {
      show: true,
      title: '驳回结算单',
      message: `确定要驳回 "${settlement.employeeName}" 的结算单吗？`,
      type: 'warning',
      onConfirm: () => {
        settlement.status = 'rejected'
        toast.success('已驳回', `结算单已被驳回`)
        confirm.value.show = false
      },
      onCancel: () => {
        confirm.value.show = false
      }
    }
  }
}

const handleProcessPayment = (id: string) => {
  const settlement = settlements.value.find(s => s.id === id)
  if (!settlement) return

  confirm.value = {
    show: true,
    title: '发放结算',
    message: `确认发放 ¥${settlement.totalAmount} 给 "${settlement.employeeName}" 吗？`,
    type: 'warning',
    onConfirm: () => {
      toast.info('处理中', '正在处理银行转账...')

      setTimeout(() => {
        settlement.status = 'paid'
        settlement.paidAt = new Date().toLocaleString('zh-CN', { hour12: false })

        // Add payment record
        payments.value.unshift({
          id: `pay-${Date.now()}`,
          settlementId: settlement.id,
          settlementPeriod: settlement.period,
          employeeId: settlement.employeeId,
          employeeName: settlement.employeeName,
          bankName: employees.value.find(e => e.id === settlement.employeeId)?.bankName || '',
          bankAccount: employees.value.find(e => e.id === settlement.employeeId)?.bankAccount || '',
          amount: settlement.totalAmount,
          status: 'success',
          transactionId: `TXN${Date.now()}`,
          paidAt: new Date().toLocaleString('zh-CN', { hour12: false }),
          operator: '当前用户',
          createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
        })

        toast.success('发放成功', `已成功发放 ¥${settlement.totalAmount}`)
        confirm.value.show = false
      }, 2000)
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const viewSettlementDetail = (settlement: SettlementRecord) => {
  currentSettlement.value = settlement
  showSettlementDetail.value = true
  toast.success('查看详情', `正在查看 ${settlement.employeeName} 的结算详情`)
}

const viewHistory = (settlement: SettlementRecord) => {
  // 查看该教练的历史结算记录
  const historySettlements = settlements.value.filter(
    s => s.employeeId === settlement.employeeId && s.period <= settlement.period
  )
  toast.info('历史结算', `找到 ${historySettlements.length} 条历史结算记录`)
  // TODO: 可以打开历史结算弹窗
}

const handleExportSettlements = () => {
  toast.info('导出中', '正在导出结算数据...')

  try {
    // 获取当前选中期间的结算数据
    const currentSettlements = filteredSettlements.value

    // 准备导出数据
    const exportData = currentSettlements.map(s => ({
      '结算单号': s.id,
      '教练姓名': s.employeeName,
      '部门': s.department || '运动康复部',
      '结算期间': s.period,
      '服务用户数': s.totalUsers,
      '新用户数': s.newUsers,
      '新用户金额': s.newUserAmount,
      '老用户数': s.oldUsers,
      '老用户金额': s.oldUserAmount,
      '绩效奖金': s.performanceBonus,
      '结算金额': s.totalAmount,
      '状态': s.status === 'pending' ? '待审批' : s.status === 'approved' ? '已审批' : s.status === 'paid' ? '已发放' : '已驳回',
      '创建时间': s.createdAt,
      '审批时间': s.approvedAt || '-',
      '发放时间': s.paidAt || '-'
    }))

    // 创建工作簿
    const wb = XLSX.utils.book_new()

    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(exportData)

    // 设置列宽
    ws['!cols'] = [
      { wch: 15 }, // 结算单号
      { wch: 12 }, // 教练姓名
      { wch: 15 }, // 部门
      { wch: 12 }, // 结算期间
      { wch: 12 }, // 服务用户数
      { wch: 10 }, // 新用户数
      { wch: 12 }, // 新用户金额
      { wch: 10 }, // 老用户数
      { wch: 12 }, // 老用户金额
      { wch: 12 }, // 绩效奖金
      { wch: 12 }, // 结算金额
      { wch: 10 }, // 状态
      { wch: 20 }, // 创建时间
      { wch: 20 }, // 审批时间
      { wch: 20 }  // 发放时间
    ]

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '结算明细')

    // 生成文件名
    const fileName = `教练结算明细_${selectedPeriod.value}_${new Date().toISOString().split('T')[0]}.xlsx`

    // 导出文件
    XLSX.writeFile(wb, fileName)

    toast.success('导出成功', `结算数据已导出为 ${fileName}`)
  } catch (error) {
    console.error('导出失败:', error)
    toast.error('导出失败', '导出结算数据时发生错误，请重试')
  }
}

// 导出发放记录
const handleExportPayments = () => {
  toast.info('导出中', '正在导出发放记录...')

  try {
    // 准备导出数据
    const exportData = payments.value.map(p => ({
      '发放单号': p.id,
      '教练姓名': p.employeeName,
      '结算期间': p.settlementPeriod,
      '发放金额': p.amount,
      '银行名称': p.bankName,
      '银行账号': p.bankAccount,
      '支付状态': p.status === 'success' ? '成功' : p.status === 'processing' ? '处理中' : p.status === 'failed' ? '失败' : '待处理',
      '交易流水号': p.transactionId || '-',
      '发放时间': p.paidAt || '-',
      '操作人': p.operator,
      '创建时间': p.createdAt
    }))

    // 创建工作簿
    const wb = XLSX.utils.book_new()

    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(exportData)

    // 设置列宽
    ws['!cols'] = [
      { wch: 15 }, // 发放单号
      { wch: 12 }, // 教练姓名
      { wch: 12 }, // 结算期间
      { wch: 12 }, // 发放金额
      { wch: 15 }, // 银行名称
      { wch: 20 }, // 银行账号
      { wch: 10 }, // 支付状态
      { wch: 20 }, // 交易流水号
      { wch: 20 }, // 发放时间
      { wch: 12 }, // 操作人
      { wch: 20 }  // 创建时间
    ]

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '发放记录')

    // 生成文件名
    const fileName = `教练发放记录_${new Date().toISOString().split('T')[0]}.xlsx`

    // 导出文件
    XLSX.writeFile(wb, fileName)

    toast.success('导出成功', `发放记录已导出为 ${fileName}`)
  } catch (error) {
    console.error('导出失败:', error)
    toast.error('导出失败', '导出发放记录时发生错误，请重试')
  }
}

const handleBatchApprove = (ids: string[]) => {
  confirm.value = {
    show: true,
    title: '批量审批',
    message: `确认批量审批 ${ids.length} 条结算单吗？`,
    type: 'warning',
    onConfirm: () => {
      ids.forEach(id => {
        const settlement = settlements.value.find(s => s.id === id)
        if (settlement && settlement.status === 'pending') {
          settlement.status = 'approved'
          settlement.approvedAt = new Date().toISOString().split('T')[0]
        }
      })
      toast.success('批量审批成功', `已通过 ${ids.length} 条结算单`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const handleSaveRule = (rule: SettlementRule) => {
  toast.success('保存成功', '结算规则已更新')
}

const handleDeleteRule = (id: string) => {
  if (settlementRules.value.length > 1) {
    settlementRules.value = settlementRules.value.filter(r => r.id !== id)
    toast.success('删除成功', '规则已删除')
  } else {
    toast.error('无法删除', '至少需要保留一条结算规则')
  }
}
</script>
