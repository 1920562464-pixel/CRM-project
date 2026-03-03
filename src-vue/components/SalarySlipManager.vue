<template>
  <div class="space-y-6">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- 页面标题和状态提示 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText :size="28" class="text-emerald-600" />
          工资条生成与管理
        </h1>
        <p class="text-sm text-slate-500 mt-2">整合所有已确认模块数据生成工资条</p>
      </div>
    </div>

    <!-- 模块确认状态检查 -->
    <div v-if="!allModulesConfirmed" class="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
      <div class="flex items-start gap-4">
        <AlertCircle :size="32" class="text-yellow-600 mt-1" />
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-yellow-900 mb-3">⚠️ 无法生成工资条</h3>
          <p class="text-sm text-yellow-800 mb-4">以下模块尚未确认，请先确认所有模块后才能生成工资条：</p>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div
              v-for="(module, key) in moduleConfirmationStatus"
              :key="key"
              class="flex items-center gap-2 p-3 rounded-lg"
              :class="module.confirmed ? 'bg-green-100' : 'bg-red-100'"
            >
              <CheckCircle v-if="module.confirmed" :size="20" class="text-green-600" />
              <Clock v-else :size="20" class="text-red-600" />
              <span class="text-sm font-medium" :class="module.confirmed ? 'text-green-800' : 'text-red-800'">
                {{ module.name }}
              </span>
            </div>
          </div>
          <button
            @click="goToOverview"
            class="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 text-sm"
          >
            <Settings :size="16" />
            返回概览确认
          </button>
        </div>
      </div>
    </div>

    <!-- 月份选择和操作 -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">选择月份</label>
            <select
              v-model="selectedMonth"
              @change="loadData"
              class="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="2025-02">2025年2月</option>
              <option value="2025-01">2025年1月</option>
              <option value="2024-12">2024年12月</option>
            </select>
          </div>

          <div v-if="allModulesConfirmed" class="flex gap-2">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">生成工资条</label>
              <button
                @click="showGenerateDialog = true"
                class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 text-sm font-medium"
              >
                <Calculator :size="16" />
                批量生成
              </button>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">&nbsp;</label>
              <button
                @click="showSingleGenerateDialog = true"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
              >
                <Plus :size="16" />
                单个生成
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="!allModulesConfirmed"
            @click="simulateConfirmAll"
            class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 text-sm"
            title="测试功能：模拟确认所有模块"
          >
            <CheckCircle :size="16" />
            测试：确认所有模块
          </button>
          <button
            v-if="hasSelectedItems"
            @click="batchApprove"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
          >
            <CheckCircle :size="16" />
            批量审核 ({{ selectedItems.length }})
          </button>
          <button
            v-if="hasSelectedItems"
            @click="batchPay"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
          >
            <DollarSign :size="16" />
            批量发放 ({{ selectedItems.length }})
          </button>
          <button
            @click="refreshData"
            class="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm"
          >
            <RefreshCw :size="16" />
            刷新
          </button>
          <button
            @click="showExportMenu = !showExportMenu"
            class="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm relative"
          >
            <Download :size="16" />
            导出
            <div v-if="showExportMenu" class="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg py-2 z-10 min-w-[150px]">
              <button @click="exportToExcel" class="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2">
                <FileSpreadsheet :size="14" />
                导出Excel
              </button>
              <button @click="exportToPDF" class="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2">
                <FileText :size="14" />
                导出PDF
              </button>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- 本月数据汇总（仅所有模块确认后显示） -->
    <div v-if="allModulesConfirmed" class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 class="text-lg font-semibold mb-4">📊 本月薪酬数据汇总</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="text-sm text-blue-700 mb-1">底薪</div>
          <div class="text-2xl font-bold text-blue-900">¥{{ monthlyData.baseSalary.toLocaleString() }}</div>
          <div class="text-xs text-blue-600">{{ monthlyData.baseSalaryCount }} 人</div>
        </div>
        <div class="bg-purple-50 rounded-lg p-4">
          <div class="text-sm text-purple-700 mb-1">管理费</div>
          <div class="text-2xl font-bold text-purple-900">¥{{ monthlyData.managementFee.toLocaleString() }}</div>
          <div class="text-xs text-purple-600">{{ monthlyData.managementFeeCount }} 笔</div>
        </div>
        <div class="bg-green-50 rounded-lg p-4">
          <div class="text-sm text-green-700 mb-1">佣金</div>
          <div class="text-2xl font-bold text-green-900">¥{{ monthlyData.commission.toLocaleString() }}</div>
          <div class="text-xs text-green-600">{{ monthlyData.commissionCount }} 笔</div>
        </div>
        <div class="bg-orange-50 rounded-lg p-4">
          <div class="text-sm text-orange-700 mb-1">富贵饼</div>
          <div class="text-2xl font-bold text-orange-900">¥{{ monthlyData.richBiscuit.toLocaleString() }}</div>
          <div class="text-xs text-orange-600">{{ monthlyData.richBiscuitCount }} 饼</div>
        </div>
        <div class="bg-cyan-50 rounded-lg p-4">
          <div class="text-sm text-cyan-700 mb-1">上线服务</div>
          <div class="text-2xl font-bold text-cyan-900">¥{{ monthlyData.onlineService.toLocaleString() }}</div>
          <div class="text-xs text-cyan-600">{{ monthlyData.onlineServiceCount }} 次</div>
        </div>
        <div class="bg-red-50 rounded-lg p-4">
          <div class="text-sm text-red-700 mb-1">五险一金</div>
          <div class="text-2xl font-bold text-red-900">-¥{{ monthlyData.socialInsurance.toLocaleString() }}</div>
          <div class="text-xs text-red-600">{{ monthlyData.socialInsuranceCount }} 人</div>
        </div>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div class="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl p-5 text-white shadow-lg">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm opacity-90">工资条总数</span>
          <FileText :size="20" />
        </div>
        <div class="text-3xl font-bold">{{ stats.total }}</div>
        <div class="text-xs opacity-75">本月</div>
      </div>

      <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
        <div class="text-sm text-yellow-700 mb-1">草稿</div>
        <div class="text-2xl font-bold text-yellow-600">{{ stats.draft }}</div>
      </div>

      <div class="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div class="text-sm text-blue-700 mb-1">待审核</div>
        <div class="text-2xl font-bold text-blue-600">{{ stats.pending }}</div>
      </div>

      <div class="bg-green-50 border border-green-200 rounded-xl p-5">
        <div class="text-sm text-green-700 mb-1">已审核</div>
        <div class="text-2xl font-bold text-green-600">{{ stats.approved }}</div>
      </div>

      <div class="bg-purple-50 border border-purple-200 rounded-xl p-5">
        <div class="text-sm text-purple-700 mb-1">已发放</div>
        <div class="text-2xl font-bold text-purple-600">{{ stats.paid }}</div>
      </div>
    </div>

    <!-- 工资条列表 -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 class="text-lg font-semibold">工资条列表</h3>
      </div>

      <div v-if="salarySlipList.length === 0" class="p-12 text-center text-slate-400">
        <FileText :size="48" class="mx-auto mb-4 opacity-50" />
        <p class="font-medium">暂无工资条</p>
        <p v-if="!allModulesConfirmed" class="text-sm mt-1">请先在薪酬概览确认所有模块</p>
        <p v-else class="text-sm mt-1">请点击"批量生成工资条"按钮开始生成</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-4 py-3 text-center w-10">
                <input
                  type="checkbox"
                  v-model="selectAll"
                  @change="toggleSelectAllItems"
                  class="rounded"
                />
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">员工</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">部门</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">应发工资</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">实发工资</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">状态</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="slip in salarySlipList"
              :key="slip.id"
              class="hover:bg-slate-50"
              :class="selectedItems.includes(slip.id) ? 'bg-indigo-50' : ''"
            >
              <td class="px-4 py-3 text-center">
                <input
                  type="checkbox"
                  v-model="selectedItems"
                  :value="slip.id"
                  class="rounded"
                />
              </td>
              <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ slip.employeeName }}</td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ slip.department }}</td>
              <td class="px-4 py-3 text-sm font-semibold text-green-600">
                ¥{{ slip.summary.grossSalary.toLocaleString() }}
              </td>
              <td class="px-4 py-3 text-sm font-semibold text-slate-900">
                ¥{{ slip.summary.netSalary.toLocaleString() }}
              </td>
              <td class="px-4 py-3">
                <span
                  :class="`px-2 py-1 text-xs rounded ${
                    slip.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    slip.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                    slip.status === 'approved' ? 'bg-green-100 text-green-800' :
                    slip.status === 'paid' ? 'bg-purple-100 text-purple-800' :
                    'bg-slate-100 text-slate-800'
                  }`"
                >
                  {{ getStatusLabel(slip.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1 flex-wrap">
                  <button
                    @click="viewSalarySlip(slip)"
                    class="text-xs text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded border border-indigo-200"
                    title="查看"
                  >
                    <Eye :size="12" />
                  </button>
                  <button
                    v-if="slip.status === 'draft' || slip.status === 'pending'"
                    @click="editSalarySlip(slip)"
                    class="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200"
                    title="编辑"
                  >
                    <Edit :size="12" />
                  </button>
                  <button
                    v-if="slip.status === 'draft' || slip.status === 'pending'"
                    @click="copySalarySlip(slip)"
                    class="text-xs text-cyan-600 hover:bg-cyan-50 px-2 py-1 rounded border border-cyan-200"
                    title="复制"
                  >
                    <Copy :size="12" />
                  </button>
                  <button
                    v-if="slip.status === 'draft' || slip.status === 'pending'"
                    @click="approveButton(slip.id)"
                    class="text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200"
                    title="审核"
                  >
                    <CheckCircle :size="12" />
                  </button>
                  <button
                    v-if="slip.status === 'approved'"
                    @click="payButton(slip.id)"
                    class="text-xs text-green-600 hover:bg-green-50 px-2 py-1 rounded border border-green-200"
                    title="发放"
                  >
                    <DollarSign :size="12" />
                  </button>
                  <button
                    @click="printSalarySlip(slip)"
                    class="text-xs text-slate-600 hover:bg-slate-50 px-2 py-1 rounded border border-slate-200"
                    title="打印"
                  >
                    <Printer :size="12" />
                  </button>
                  <button
                    @click="sendSalarySlip(slip)"
                    class="text-xs text-orange-600 hover:bg-orange-50 px-2 py-1 rounded border border-orange-200"
                    title="发送邮件"
                  >
                    <Mail :size="12" />
                  </button>
                  <button
                    v-if="slip.status === 'draft'"
                    @click="deleteSalarySlip(slip)"
                    class="text-xs text-red-600 hover:bg-red-50 px-1 py-1 rounded"
                    title="删除"
                  >
                    <Trash2 :size="12" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 工资条详情弹窗 -->
    <Modal v-model:show="showDetailModal" title="工资条详情" size="xl">
      <div v-if="selectedSlip" class="space-y-6">
        <!-- 员工信息 -->
        <div class="bg-slate-50 rounded-lg p-4">
          <h3 class="font-semibold text-slate-900 mb-3">👤 员工信息</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-slate-600">姓名：</span>
              <span class="font-medium text-slate-900">{{ selectedSlip.employeeName }}</span>
            </div>
            <div>
              <span class="text-slate-600">部门：</span>
              <span class="font-medium text-slate-900">{{ selectedSlip.department }}</span>
            </div>
            <div>
              <span class="text-slate-600">职位：</span>
              <span class="font-medium text-slate-900">{{ selectedSlip.position }}</span>
            </div>
            <div>
              <span class="text-slate-600">月份：</span>
              <span class="font-medium text-slate-900">{{ selectedSlip.month }}</span>
            </div>
          </div>
        </div>

        <!-- 收入明细 -->
        <div>
          <h3 class="font-semibold text-slate-900 mb-3">💰 收入明细</h3>
          <div class="space-y-2">
            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-sm text-slate-600">底薪</span>
              <span class="text-sm font-medium text-blue-900">¥{{ selectedSlip.income.baseSalary.toLocaleString() }}</span>
            </div>

            <div class="flex justify-between py-2 border-b border-slate-100 bg-blue-50 px-3 rounded">
              <span class="text-sm font-medium text-purple-900">管理费</span>
              <span class="text-sm font-bold text-purple-900">¥{{ selectedSlip.income.performanceSalary.toLocaleString() }}</span>
            </div>

            <div class="bg-green-50 rounded-lg p-3 mt-3">
              <h4 class="text-sm font-semibold text-green-900 mb-2">💎 佣金与激励</h4>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-slate-600">佣金</span>
                  <span class="font-medium">¥{{ selectedSlip.income.commission?.totalAmount?.toLocaleString() || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">富贵饼</span>
                  <span class="font-medium">¥{{ selectedSlip.income.commission?.richBiscuits?.value?.toLocaleString() || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-slate-600">上线服务</span>
                  <span class="font-medium">¥{{ selectedSlip.income.commission?.onlineServices?.totalAmount?.toLocaleString() || 0 }}</span>
                </div>
              </div>
            </div>

            <div class="flex justify-between py-2 border-b border-slate-100">
              <span class="text-sm text-slate-600">津贴补贴</span>
              <span class="text-sm font-medium text-slate-900">¥{{ (
                (selectedSlip.income.allowances?.traffic || 0) +
                (selectedSlip.income.allowances?.communication || 0) +
                (selectedSlip.income.allowances?.meal || 0) +
                (selectedSlip.income.allowances?.housing || 0)
              ).toLocaleString() }}</span>
            </div>

            <div class="flex justify-between py-2">
              <span class="text-sm text-slate-600">奖金</span>
              <span class="text-sm font-medium text-slate-900">¥{{ (
                (selectedSlip.income.bonus?.monthly || 0) +
                (selectedSlip.income.bonus?.quarterly || 0) +
                (selectedSlip.income.bonus?.yearly || 0) +
                (selectedSlip.income.bonus?.special || 0)
              ).toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <!-- 扣款明细 -->
        <div>
          <h3 class="font-semibold text-slate-900 mb-3">📉 扣款明细</h3>
          <div class="bg-red-50 rounded-lg p-4">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-slate-600">养老保险 (8%)</span>
                <span class="text-sm font-medium text-red-900">¥{{ selectedSlip.deductions.socialInsurance.pension.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-slate-600">医疗保险 (2%)</span>
                <span class="text-sm font-medium text-red-900">¥{{ selectedSlip.deductions.socialInsurance.medical.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-slate-600">失业保险 (0.5%)</span>
                <span class="text-sm font-medium text-red-900">¥{{ selectedSlip.deductions.socialInsurance.unemployment.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between pt-2 border-t border-red-200">
                <span class="text-sm font-semibold text-red-900">住房公积金 (12%)</span>
                <span class="text-sm font-bold text-red-900">¥{{ selectedSlip.deductions.socialInsurance.housingFund.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between pt-2 border-t border-red-300">
                <span class="text-sm font-semibold text-red-900">五险一金小计</span>
                <span class="text-lg font-bold text-red-900">¥{{
                  (selectedSlip.deductions.socialInsurance.pension +
                   selectedSlip.deductions.socialInsurance.medical +
                   selectedSlip.deductions.socialInsurance.unemployment +
                   selectedSlip.deductions.socialInsurance.housingFund).toLocaleString()
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 汇总 -->
        <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4">
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2">
              <span class="text-lg font-semibold text-indigo-900">应发工资</span>
              <span class="text-2xl font-bold text-green-600">¥{{ selectedSlip.summary.grossSalary.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-lg font-semibold text-indigo-900">扣款合计</span>
              <span class="text-2xl font-bold text-red-600">-¥{{ selectedSlip.summary.totalDeductions.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-t-2 border-indigo-200">
              <span class="text-xl font-bold text-indigo-900">实发工资</span>
              <span class="text-3xl font-bold text-indigo-600">¥{{ selectedSlip.summary.netSalary.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button @click="showDetailModal = false" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
          关闭
        </button>
        <button
          v-if="selectedSlip && (selectedSlip.status === 'draft' || selectedSlip.status === 'pending')"
          @click="approveAndClose"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          审核通过
        </button>
      </template>
    </Modal>

    <!-- 生成工资条弹窗 -->
    <Modal v-model:show="showGenerateDialog" title="批量生成工资条" size="lg">
      <form @submit.prevent="handleGenerate" class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <div class="font-semibold mb-2">💡 说明</div>
          <p class="mb-2">系统将自动整合以下已确认模块的数据生成工资条：</p>
          <ul class="list-disc list-inside space-y-1 text-xs ml-4">
            <li>✅ 底薪 - 从底薪模块获取</li>
            <li>✅ 管理费 - 从管理费模块获取</li>
            <li>✅ 佣金 - 从佣金模块获取</li>
            <li>✅ 富贵饼 - 从富贵饼模块获取</li>
            <li>✅ 上线服务 - 从上线服务模块获取</li>
            <li>✅ 五险一金 - 从五险一金模块获取并扣除</li>
          </ul>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">选择员工 *</label>
          <div class="space-y-2">
            <label class="flex items-center gap-2">
              <input type="checkbox" v-model="selectAllEmployees" @change="toggleSelectAll" class="rounded" />
              <span class="text-sm text-slate-700">全选所有员工</span>
            </label>
            <div class="grid grid-cols-2 gap-2 ml-6">
              <label v-for="emp in employeeList" :key="emp.id" class="flex items-center gap-2">
                <input type="checkbox" v-model="selectedEmployees" :value="emp.id" class="rounded" />
                <span class="text-sm text-slate-700">{{ emp.name }} - {{ emp.position }}</span>
              </label>
            </div>
          </div>
        </div>

        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-green-800">预计生成工资条数量：</span>
            <span class="text-2xl font-bold text-green-900">{{ selectedEmployees.length }} 条</span>
          </div>
        </div>
      </form>

      <template #footer>
        <button @click="showGenerateDialog = false" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
          取消
        </button>
        <button
          @click="handleGenerate"
          :disabled="selectedEmployees.length === 0"
          class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          立即生成
        </button>
      </template>
    </Modal>

    <!-- 单个生成工资条弹窗 -->
    <Modal v-model:show="showSingleGenerateDialog" title="单个生成工资条" size="lg">
      <form @submit.prevent="handleSingleGenerate" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">选择员工 *</label>
          <select v-model="singleGenerateEmployeeId" required class="w-full px-3 py-2 border border-slate-300 rounded-lg">
            <option value="">请选择员工</option>
            <option v-for="emp in employeeList" :key="emp.id" :value="emp.id">
              {{ emp.name }} - {{ emp.position }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">工资条模板</label>
          <select v-model="selectedTemplate" class="w-full px-3 py-2 border border-slate-300 rounded-lg">
            <option value="default">默认模板</option>
            <option value="detailed">详细模板</option>
            <option value="simple">简洁模板</option>
          </select>
        </div>

        <div class="bg-slate-50 rounded-lg p-4">
          <div class="text-sm font-medium text-slate-900 mb-2">预览数据</div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>底薪：¥{{ getEmployeeSalaryPreview(singleGenerateEmployeeId).baseSalary.toLocaleString() }}</div>
            <div>管理费：¥{{ getEmployeeSalaryPreview(singleGenerateEmployeeId).managementFee.toLocaleString() }}</div>
            <div>佣金：¥{{ getEmployeeSalaryPreview(singleGenerateEmployeeId).commission.toLocaleString() }}</div>
            <div>富贵饼：¥{{ getEmployeeSalaryPreview(singleGenerateEmployeeId).richBiscuit.toLocaleString() }}</div>
            <div>上线服务：¥{{ getEmployeeSalaryPreview(singleGenerateEmployeeId).onlineService.toLocaleString() }}</div>
            <div>五险一金：-¥{{ getEmployeeSalaryPreview(singleGenerateEmployeeId).socialInsurance.toLocaleString() }}</div>
          </div>
          <div class="mt-2 pt-2 border-t border-slate-200 font-semibold">
            预计实发：¥{{ getEmployeeSalaryPreview(singleGenerateEmployeeId).netSalary.toLocaleString() }}
          </div>
        </div>
      </form>

      <template #footer>
        <button @click="showSingleGenerateDialog = false" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
          取消
        </button>
        <button
          @click="handleSingleGenerate"
          :disabled="!singleGenerateEmployeeId"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          立即生成
        </button>
      </template>
    </Modal>

    <!-- 编辑工资条弹窗 -->
    <Modal v-model:show="showEditDialog" title="编辑工资条" size="xl">
      <form v-if="editingSlip" @submit.prevent="handleSaveEdit" class="space-y-4">
        <div class="bg-slate-50 rounded-lg p-4">
          <h3 class="font-semibold text-slate-900 mb-3">员工信息</h3>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-slate-600">姓名：</span>
              <span class="font-medium">{{ editingSlip.employeeName }}</span>
            </div>
            <div>
              <span class="text-slate-600">部门：</span>
              <span class="font-medium">{{ editingSlip.department }}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 class="font-semibold text-slate-900 mb-3">收入明细</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm text-slate-700 mb-1">底薪</label>
              <input v-model.number="editingSlip.income.baseSalary" type="number" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm text-slate-700 mb-1">管理费</label>
              <input v-model.number="editingSlip.income.performanceSalary" type="number" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm text-slate-700 mb-1">佣金</label>
              <input v-model.number="editForm.commission" type="number" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm text-slate-700 mb-1">富贵饼</label>
              <input v-model.number="editForm.richBiscuit" type="number" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm text-slate-700 mb-1">上线服务</label>
              <input v-model.number="editForm.onlineService" type="number" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm text-slate-700 mb-1">津贴补贴</label>
              <input v-model.number="editForm.allowances" type="number" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          </div>
        </div>

        <div>
          <h3 class="font-semibold text-slate-900 mb-3">扣款明细</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm text-slate-700 mb-1">养老保险</label>
              <input v-model.number="editingSlip.deductions.socialInsurance.pension" type="number" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm text-slate-700 mb-1">医疗保险</label>
              <input v-model.number="editingSlip.deductions.socialInsurance.medical" type="number" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm text-slate-700 mb-1">失业保险</label>
              <input v-model.number="editingSlip.deductions.socialInsurance.unemployment" type="number" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm text-slate-700 mb-1">住房公积金</label>
              <input v-model.number="editingSlip.deductions.socialInsurance.housingFund" type="number" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
            <div>
              <label class="block text-sm text-slate-700 mb-1">其他扣款</label>
              <input v-model.number="editForm.otherDeductions" type="number" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded-lg" />
            </div>
          </div>
        </div>

        <div class="bg-blue-50 rounded-lg p-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-blue-800">预计实发工资：</span>
            <span class="text-2xl font-bold text-blue-900">¥{{ calculateEditNetSalary().toLocaleString() }}</span>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">备注</label>
          <textarea v-model="editForm.note" rows="3" class="w-full px-3 py-2 border border-slate-300 rounded-lg" placeholder="填写修改原因..." />
        </div>
      </form>

      <template #footer>
        <button @click="showEditDialog = false" class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
          取消
        </button>
        <button
          @click="handleSaveEdit"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          保存修改
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  FileText, Calculator, CheckCircle, Download, DollarSign, AlertCircle,
  Clock, Settings, Edit, Trash2, Printer, Mail, RefreshCw, Eye,
  Copy, FileSpreadsheet, Plus
} from 'lucide-vue-next'
import Toast from './shared/Toast.vue'
import Modal from './shared/Modal.vue'
import { useToast } from '../composables/useToast'
import { useSalary } from '../composables/useSalary'

const props = defineProps<{
  selectedMonth: string
}>()

const emit = defineEmits<{
  goToOverview: []
}>()

const toast = useToast()
const { generateSalarySlip, getMonthSalarySlips, approveSalarySlip, paySalarySlip, getSalaryStats } = useSalary()

const selectedMonth = ref(props.selectedMonth)
const showDetailModal = ref(false)
const showGenerateDialog = ref(false)
const showSingleGenerateDialog = ref(false)
const showEditDialog = ref(false)
const showExportMenu = ref(false)
const selectedSlip = ref<any>(null)
const editingSlip = ref<any>(null)
const selectAllEmployees = ref(false)
const selectedEmployees = ref<string[]>([])
const selectAll = ref(false)
const selectedItems = ref<string[]>([])
const singleGenerateEmployeeId = ref('')
const selectedTemplate = ref('default')

// 编辑表单
const editForm = ref({
  commission: 0,
  richBiscuit: 0,
  onlineService: 0,
  allowances: 0,
  otherDeductions: 0,
  note: ''
})

// 模拟模块确认状态
const moduleConfirmationStatus = ref({
  baseSalary: { confirmed: false, name: '底薪' },
  managementFee: { confirmed: false, name: '管理费' },
  commission: { confirmed: false, name: '佣金' },
  richBiscuit: { confirmed: false, name: '富贵饼' },
  onlineService: { confirmed: false, name: '上线服务' },
  socialInsurance: { confirmed: false, name: '五险一金' }
})

// 模拟本月数据汇总
const monthlyData = ref({
  baseSalary: 0,
  baseSalaryCount: 0,
  managementFee: 0,
  managementFeeCount: 0,
  commission: 0,
  commissionCount: 0,
  richBiscuit: 0,
  richBiscuitCount: 0,
  onlineService: 0,
  onlineServiceCount: 0,
  socialInsurance: 0,
  socialInsuranceCount: 0
})

// 统计数据
const stats = ref({
  total: 0,
  draft: 0,
  pending: 0,
  approved: 0,
  paid: 0
})

// 计算所有模块是否已确认
const allModulesConfirmed = computed(() => {
  return Object.values(moduleConfirmationStatus.value).every(m => m.confirmed)
})

// 是否有选中项
const hasSelectedItems = computed(() => selectedItems.value.length > 0)

// 工资条列表
const salarySlipList = computed(() => getMonthSalarySlips(selectedMonth.value))

// 员工列表（模拟）
const employeeList = ref([
  { id: 'E001', name: '张教练', position: '高级教练' },
  { id: 'E002', name: '李教练', position: '中级教练' },
  { id: 'E003', name: '王医生', position: '主治医师' },
  { id: 'E004', name: '赵医生', position: '医师' },
  { id: 'E005', name: '孙顾问', position: '高级顾问' }
])

// 全选员工
const toggleSelectAll = () => {
  if (selectAllEmployees.value) {
    selectedEmployees.value = employeeList.value.map(e => e.id)
  } else {
    selectedEmployees.value = []
  }
}

// 加载数据
const loadData = () => {
  // 模拟加载模块确认状态
  // 实际应该从各模块获取确认状态
  updateStats()
}

// 更新统计
const updateStats = () => {
  stats.value = getSalaryStats(selectedMonth.value)
  // 模拟从各模块获取数据汇总
  monthlyData.value = {
    baseSalary: 15000,
    baseSalaryCount: 5,
    managementFee: 3000,
    managementFeeCount: 3,
    commission: 8500,
    commissionCount: 12,
    richBiscuit: 1500,
    richBiscuitCount: 15,
    onlineService: 5800,
    onlineServiceCount: 25,
    socialInsurance: 4500,
    socialInsuranceCount: 5
  }
}

// 测试功能：模拟确认所有模块
const simulateConfirmAll = () => {
  Object.keys(moduleConfirmationStatus.value).forEach(key => {
    moduleConfirmationStatus.value[key as keyof typeof moduleConfirmationStatus.value].confirmed = true
  })
  toast.success('测试模式', '已模拟确认所有模块，可以生成工资条了')
}

// 查看工资条详情
const viewSalarySlip = (slip: any) => {
  selectedSlip.value = slip
  showDetailModal.value = true
}

// 审核工资条
const handleApproveSalarySlip = (id: string) => {
  approveSalarySlip(id, 'admin')
  toast.success('审核成功', '工资条已审核通过')
  updateStats()
}

// 审核并关闭弹窗
const approveAndClose = () => {
  if (selectedSlip.value) {
    handleApproveSalarySlip(selectedSlip.value.id)
    showDetailModal.value = false
  }
}

// 支付工资条
const handlePaySalarySlip = (id: string) => {
  paySalarySlip(id, 'finance')
  toast.success('发放成功', '工资已发放')
  updateStats()
}

// 审核工资条（表格中的按钮）
const approveButton = (id: string) => {
  handleApproveSalarySlip(id)
}

// 支付工资条（表格中的按钮）
const payButton = (id: string) => {
  handlePaySalarySlip(id)
}

// 生成工资条
const handleGenerate = () => {
  if (selectedEmployees.value.length === 0) {
    toast.error('生成失败', '请至少选择一个员工')
    return
  }

  try {
    // 为每个选中的员工生成工资条
    selectedEmployees.value.forEach(empId => {
      const emp = employeeList.value.find(e => e.id === empId)
      if (emp) {
        // 根据职位选择薪资方案
        const schemeId = emp.position.includes('教练') ? 'coach-a' :
                        emp.position.includes('医生') ? 'doctor-a' : 'coach-a'

        generateSalarySlip(empId, selectedMonth.value, schemeId)

        // 更新生成的工资条员工信息
        const slips = getMonthSalarySlips(selectedMonth.value)
        const newSlip = slips[slips.length - 1]
        if (newSlip) {
          newSlip.employeeName = emp.name
          newSlip.position = emp.position
          newSlip.department = emp.position.includes('教练') ? '健康服务部' :
                             emp.position.includes('医生') ? '医疗部' : '咨询部'
        }
      }
    })

    toast.success('生成成功', `已为 ${selectedEmployees.value.length} 位员工生成工资条`)
    showGenerateDialog.value = false
    selectedEmployees.value = []
    selectAllEmployees.value = false
    updateStats()
  } catch (error: any) {
    toast.error('生成失败', error?.message || '未知错误')
  }
}

// 导出工资条
const exportSalarySlips = () => {
  showExportMenu.value = false
  toast.success('导出成功', '工资条已导出为Excel文件')
}

// 导出Excel
const exportToExcel = () => {
  showExportMenu.value = false
  toast.success('导出成功', '工资条已导出为Excel文件')
}

// 导出PDF
const exportToPDF = () => {
  showExportMenu.value = false
  toast.success('导出成功', '工资条已导出为PDF文件')
}

// 跳转到概览
const goToOverview = () => {
  emit('goToOverview')
}

// 获取状态标签
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    draft: '草稿',
    pending: '待审核',
    approved: '已审核',
    paid: '已发放',
    cancelled: '已取消'
  }
  return labels[status] || status
}

// 切换全选工资条
const toggleSelectAllItems = () => {
  if (selectAll.value) {
    selectedItems.value = salarySlipList.value.map((s: any) => s.id)
  } else {
    selectedItems.value = []
  }
}

// 批量审核
const batchApprove = () => {
  if (selectedItems.value.length === 0) return

  let count = 0
  selectedItems.value.forEach(id => {
    const slip = salarySlipList.value.find((s: any) => s.id === id)
    if (slip && (slip.status === 'draft' || slip.status === 'pending')) {
      approveSalarySlip(id, 'admin')
      count++
    }
  })

  toast.success('批量审核成功', `已审核 ${count} 条工资条`)
  selectedItems.value = []
  selectAll.value = false
  updateStats()
}

// 批量发放
const batchPay = () => {
  if (selectedItems.value.length === 0) return

  let count = 0
  selectedItems.value.forEach(id => {
    const slip = salarySlipList.value.find((s: any) => s.id === id)
    if (slip && slip.status === 'approved') {
      paySalarySlip(id, 'finance')
      count++
    }
  })

  toast.success('批量发放成功', `已发放 ${count} 条工资条`)
  selectedItems.value = []
  selectAll.value = false
  updateStats()
}

// 刷新数据
const refreshData = () => {
  loadData()
  toast.success('刷新成功', '数据已更新')
}

// 单个生成工资条
const handleSingleGenerate = () => {
  if (!singleGenerateEmployeeId.value) {
    toast.error('生成失败', '请选择员工')
    return
  }

  try {
    const emp = employeeList.value.find(e => e.id === singleGenerateEmployeeId.value)
    if (!emp) {
      toast.error('生成失败', '员工信息不存在')
      return
    }

    // 根据职位选择薪资方案
    const schemeId = emp.position.includes('教练') ? 'coach-a' :
                    emp.position.includes('医生') ? 'doctor-a' : 'coach-a'

    generateSalarySlip(singleGenerateEmployeeId.value, selectedMonth.value, schemeId)

    // 更新生成的工资条员工信息
    const slips = getMonthSalarySlips(selectedMonth.value)
    const newSlip = slips[slips.length - 1]
    if (newSlip) {
      newSlip.employeeName = emp.name
      newSlip.position = emp.position
      newSlip.department = emp.position.includes('教练') ? '健康服务部' :
                         emp.position.includes('医生') ? '医疗部' : '咨询部'
    }

    toast.success('生成成功', `已为 ${getEmployeeName(singleGenerateEmployeeId.value)} 生成工资条`)
    showSingleGenerateDialog.value = false
    singleGenerateEmployeeId.value = ''
    updateStats()
  } catch (error: any) {
    toast.error('生成失败', error?.message || '未知错误')
  }
}

// 获取员工姓名
const getEmployeeName = (empId: string): string => {
  const emp = employeeList.value.find(e => e.id === empId)
  return emp?.name || '未知'
}

// 获取员工薪酬预览
const getEmployeeSalaryPreview = (empId: string) => {
  // 模拟数据，实际应从各模块获取
  return {
    baseSalary: 5000,
    managementFee: 1000,
    commission: 2000,
    richBiscuit: 500,
    onlineService: 800,
    socialInsurance: 1125,
    netSalary: 5000 + 1000 + 2000 + 500 + 800 - 1125
  }
}

// 编辑工资条
const editSalarySlip = (slip: any) => {
  editingSlip.value = JSON.parse(JSON.stringify(slip)) // 深拷贝
  editForm.value = {
    commission: slip.income.commission?.totalAmount || 0,
    richBiscuit: slip.income.commission?.richBiscuits?.value || 0,
    onlineService: slip.income.commission?.onlineServices?.totalAmount || 0,
    allowances: (slip.income.allowances?.traffic || 0) + (slip.income.allowances?.communication || 0) + (slip.income.allowances?.meal || 0) + (slip.income.allowances?.housing || 0),
    otherDeductions: 0,
    note: ''
  }
  showEditDialog.value = true
}

// 计算编辑后的实发工资
const calculateEditNetSalary = () => {
  if (!editingSlip.value) return 0

  const income = editingSlip.value.income.baseSalary +
                 editingSlip.value.income.performanceSalary +
                 editForm.value.commission +
                 editForm.value.richBiscuit +
                 editForm.value.onlineService +
                 editForm.value.allowances

  const deductions = editingSlip.value.deductions.socialInsurance.pension +
                     editingSlip.value.deductions.socialInsurance.medical +
                     editingSlip.value.deductions.socialInsurance.unemployment +
                     editingSlip.value.deductions.socialInsurance.housingFund +
                     editForm.value.otherDeductions

  return income - deductions
}

// 保存编辑
const handleSaveEdit = () => {
  if (!editingSlip.value) return

  // 更新工资条数据
  editingSlip.value.income.commission = {
    totalAmount: editForm.value.commission,
    richBiscuits: { value: editForm.value.richBiscuit },
    onlineServices: { totalAmount: editForm.value.onlineService }
  }

  // 更新津贴
  const allowancePerItem = editForm.value.allowances / 4
  editingSlip.value.income.allowances = {
    traffic: allowancePerItem,
    communication: allowancePerItem,
    meal: allowancePerItem,
    housing: allowancePerItem
  }

  // 更新汇总
  const income = editingSlip.value.income.baseSalary +
                 editingSlip.value.income.performanceSalary +
                 editForm.value.commission +
                 editForm.value.richBiscuit +
                 editForm.value.onlineService +
                 editForm.value.allowances

  const deductions = editingSlip.value.deductions.socialInsurance.pension +
                     editingSlip.value.deductions.socialInsurance.medical +
                     editingSlip.value.deductions.socialInsurance.unemployment +
                     editingSlip.value.deductions.socialInsurance.housingFund +
                     editForm.value.otherDeductions

  editingSlip.value.summary.grossSalary = income
  editingSlip.value.summary.totalDeductions = deductions
  editingSlip.value.summary.netSalary = income - deductions

  toast.success('保存成功', '工资条已更新')
  showEditDialog.value = false
  updateStats()
}

// 复制工资条
const copySalarySlip = (slip: any) => {
  const newSlip = JSON.parse(JSON.stringify(slip))
  newSlip.id = Date.now().toString()
  newSlip.status = 'draft'
  newSlip.employeeName += ' (副本)'
  toast.success('复制成功', `已复制 ${slip.employeeName} 的工资条`)
  updateStats()
}

// 删除工资条
const deleteSalarySlip = (slip: any) => {
  if (confirm(`确定要删除 ${slip.employeeName} 的工资条吗？`)) {
    const index = salarySlipList.value.findIndex((s: any) => s.id === slip.id)
    if (index !== -1) {
      salarySlipList.value.splice(index, 1)
      toast.success('删除成功', '工资条已删除')
      updateStats()
    }
  }
}

// 打印工资条
const printSalarySlip = (slip: any) => {
  selectedSlip.value = slip
  showDetailModal.value = true

  // 等待弹窗打开后打印
  setTimeout(() => {
    const printContent = document.querySelector('.modal-content')
    if (printContent) {
      const originalTitle = document.title
      document.title = `工资条-${slip.employeeName}-${slip.month}`

      window.print()

      document.title = originalTitle
      toast.success('打印成功', `已准备 ${slip.employeeName} 的工资条`)
    }
  }, 100)
}

// 发送工资条邮件
const sendSalarySlip = (slip: any) => {
  toast.success('发送成功', `已将 ${slip.employeeName} 的工资条发送至邮箱`)
}
</script>
