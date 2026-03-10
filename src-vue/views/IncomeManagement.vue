<template>
  <div class="space-y-5">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <TrendingUp :size="26" class="text-green-600" />
        收入管理
      </h1>
      <p class="text-slate-500 mt-1">减重管理、斑块逆转、慢病管理、超越百岁会员等收入管理</p>
    </div>

    <!-- Tab 导航 -->
    <div class="flex items-center gap-2 border-b border-slate-200">
      <button
        @click="activeTab = 'list'"
        class="px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
        :class="activeTab === 'list'
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'"
      >
        <FileText :size="16" />
        收入列表
      </button>
      <button
        @click="activeTab = 'statistics'"
        class="px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
        :class="activeTab === 'statistics'
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'"
      >
        <BarChart3 :size="16" />
        统计分析
      </button>
      <button
        @click="activeTab = 'categories'"
        class="px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
        :class="activeTab === 'categories'
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'"
      >
        <Target :size="16" />
        分类管理
      </button>
    </div>

    <!-- 收入列表 -->
    <div v-if="activeTab === 'list'" class="space-y-4">
      <!-- 统计概览 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg shadow-green-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium opacity-90">今日订单</span>
            <TrendingUp :size="18" />
          </div>
          <div class="text-2xl font-bold">{{ statistics.todayCount }}</div>
          <div class="text-xs opacity-75 mt-1">新增收入记录</div>
        </div>

        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg shadow-blue-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium opacity-90">本月订单</span>
            <Calendar :size="18" />
          </div>
          <div class="text-2xl font-bold">{{ statistics.monthCount }}</div>
          <div class="text-xs opacity-75 mt-1">累计订单数</div>
        </div>

        <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white shadow-lg shadow-amber-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium opacity-90">特殊项目</span>
            <AlertCircle :size="18" />
          </div>
          <div class="text-2xl font-bold">{{ statistics.specialCount }}</div>
          <div class="text-xs opacity-75 mt-1">需关注记录</div>
        </div>

        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg shadow-purple-200">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium opacity-90">本年订单</span>
            <BarChart3 :size="18" />
          </div>
          <div class="text-2xl font-bold">{{ statistics.yearCount }}</div>
          <div class="text-xs opacity-75 mt-1">累计订单数</div>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div class="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
        <div class="flex items-center gap-3 flex-wrap">
          <button
            @click="openAddModal"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          >
            <Plus :size="16" />
            添加收入
          </button>

          <button
            @click="openBatchAddModal"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          >
            <Plus :size="16" />
            批量添加
          </button>

          <button
            @click="exportData"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          >
            <Download :size="16" />
            导出数据
          </button>

          <div class="relative flex-1 min-w-[200px]">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" :size="16" />
            <input
              v-model="searchText"
              type="text"
              placeholder="搜索会员姓名、手机号、单号..."
              class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="all">所有状态</option>
            <option value="pending">待确认</option>
            <option value="confirmed">已确认</option>
            <option value="refunded">已退款</option>
          </select>

          <select
            v-model="typeFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="all">所有类型</option>
            <option value="recharge">会员充值</option>
            <option value="course">课程购买</option>
            <option value="service">服务收入</option>
            <option value="product">商品销售</option>
          </select>
        </div>
      </div>

      <!-- 收入列表 -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <tr>
              <th class="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase">业务线</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase">产品周期</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">会员信息</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase">收入类型</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase">订单号</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">销售人员</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase">特殊备注</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50/50 transition-colors">
              <td class="px-4 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium border" :class="getBusinessLineBadgeClass(item.businessLine)">
                  {{ item.businessLine || '-' }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span v-if="item.productType" class="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  {{ item.productType }}
                </span>
                <span v-else class="text-sm text-slate-400">-</span>
              </td>
              <td class="px-6 py-4">
                <div>
                  <div class="font-medium text-slate-900">{{ item.memberName }}</div>
                  <div class="text-xs text-slate-500 mt-0.5">{{ item.memberPhone }}</div>
                  <div class="text-xs text-slate-400 mt-0.5">ID: {{ item.memberId }}</div>
                </div>
              </td>
              <td class="px-4 py-4">
                <span class="px-2 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {{ item.incomeType || '-' }}
                </span>
              </td>
              <td class="px-4 py-4">
                <span class="text-sm text-slate-700 font-mono">{{ item.orderId || '-' }}</span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">
                {{ item.salesman || '-' }}
              </td>
              <td class="px-4 py-4">
                <div class="max-w-xs">
                  <div v-if="item.specialRemark" class="text-sm text-slate-700 truncate" :title="item.specialRemark">
                    {{ item.specialRemark }}
                  </div>
                  <span v-else class="text-sm text-slate-400">-</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-center gap-1">
                  <button @click="editItem(item)" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="编辑">
                    <FileText :size="14" />
                  </button>
                  <button @click="deleteItem(item.id)" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="删除">
                    <Trash2 :size="14" />
                  </button>
                  <button @click="addSpecialRecord(item)" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="特殊项目记录">
                    <AlertCircle :size="14" />
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
          <p class="text-sm font-medium">暂无符合条件的收入记录</p>
          <p class="text-xs mt-1">请调整筛选条件后重试</p>
        </div>
      </div>
    </div>

    <!-- 统计分析 -->
    <!-- 统计分析 -->
    <div v-else-if="activeTab === 'statistics'" class="space-y-6">
      <!-- 业务线收入统计 -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <h3 class="text-lg font-bold text-slate-900 mb-4">业务线收入统计</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="stat in businessLineStats" :key="stat.name"
               class="p-4 rounded-xl border-2 transition-all hover:shadow-lg"
               :style="{ borderColor: stat.color, backgroundColor: stat.bgColor }">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium" :style="{ color: stat.textColor }">{{ stat.name }}</span>
              <div class="p-2 rounded-lg" :style="{ backgroundColor: stat.iconBg }">
                <component :is="stat.icon" :size="20" :style="{ color: stat.color }" />
              </div>
            </div>
            <div class="text-2xl font-bold" :style="{ color: stat.color }">¥{{ stat.total.toLocaleString() }}</div>
            <div class="text-xs mt-1" :style="{ color: stat.textColor }">
              {{ stat.count }} 笔 | 占比 {{ stat.percentage }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 产品周期收入分布 -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <h3 class="text-lg font-bold text-slate-900 mb-4">产品周期收入分布</h3>
        <div class="space-y-4">
          <div v-for="product in productTypeStats" :key="product.name" class="flex items-center">
            <div class="w-32 text-sm font-medium text-slate-700">{{ product.name }}</div>
            <div class="flex-1 mx-4">
              <div class="h-8 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-500"
                     :style="{ width: product.percentage + '%', backgroundColor: product.color }">
                </div>
              </div>
            </div>
            <div class="w-32 text-right">
              <div class="text-lg font-bold" :style="{ color: product.color }">¥{{ product.total.toLocaleString() }}</div>
              <div class="text-xs text-slate-500">{{ product.count }} 笔 ({{ product.percentage.toFixed(1) }}%)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 月度收入趋势 -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <h3 class="text-lg font-bold text-slate-900 mb-4">月度收入趋势</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="text-sm font-semibold text-slate-700 mb-3">近6个月收入</h4>
            <div class="space-y-2">
              <div v-for="month in monthlyStats" :key="month.name" class="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                <span class="text-sm text-slate-600 w-20">{{ month.name }}</span>
                <div class="flex-1 mx-3">
                  <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                         :style="{ width: (month.amount / maxMonthlyAmount * 100) + '%' }">
                    </div>
                  </div>
                </div>
                <span class="text-sm font-semibold text-slate-900 w-24 text-right">¥{{ month.amount.toLocaleString() }}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 class="text-sm font-semibold text-slate-700 mb-3">收入概览</h4>
            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span class="text-sm text-green-700">总收入</span>
                <span class="text-lg font-bold text-green-700">¥{{ totalIncome.toLocaleString() }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span class="text-sm text-blue-700">月均收入</span>
                <span class="text-lg font-bold text-blue-700">¥{{ averageIncome.toLocaleString() }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span class="text-sm text-purple-700">最高月份</span>
                <span class="text-lg font-bold text-purple-700">{{ bestMonth.name }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <span class="text-sm text-amber-700">总收入额</span>
                <span class="text-lg font-bold text-amber-700">¥{{ bestMonth.amount.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 销售人员业绩 -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <h3 class="text-lg font-bold text-slate-900 mb-4">销售人员业绩排行</h3>
        <div class="space-y-2">
          <div v-for="(salesperson, index) in salesStats" :key="salesperson.name"
               class="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3"
                 :class="index === 0 ? 'bg-yellow-400 text-yellow-900' :
                         index === 1 ? 'bg-gray-300 text-gray-700' :
                         index === 2 ? 'bg-amber-200 text-amber-700' :
                         'bg-slate-200 text-slate-600'">
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <div class="font-medium text-slate-900">{{ salesperson.name }}</div>
              <div class="text-xs text-slate-500">{{ salesperson.count }} 笔交易</div>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold text-green-600">¥{{ salesperson.total.toLocaleString() }}</div>
              <div class="text-xs text-slate-500">占比 {{ salesperson.percentage }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类管理 -->
    <div v-else-if="activeTab === 'categories'" class="space-y-6">
      <!-- 业务线说明 -->
      <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6">
        <h3 class="text-lg font-bold text-indigo-900 mb-3">业务线体系</h3>
        <p class="text-sm text-indigo-700 mb-4">我们主要提供以下四大业务线的健康管理服务：</p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="category in categories.filter(c => c.businessLine !== '其他')" :key="category.id"
               class="bg-white rounded-xl p-4 border-2 hover:shadow-lg transition-all"
               :style="{ borderColor: getBusinessLineColor(category.businessLine) }">
            <div class="flex items-center gap-3 mb-3">
              <div class="p-3 rounded-xl" :style="{ backgroundColor: getBusinessLineBgColor(category.businessLine) }">
                <component :is="getBusinessLineIcon(category.businessLine)" :size="24"
                           :style="{ color: getBusinessLineColor(category.businessLine) }" />
              </div>
              <div>
                <div class="font-bold text-slate-900">{{ category.name }}</div>
                <div class="text-xs text-slate-500">{{ category.code }}</div>
              </div>
            </div>
            <p class="text-sm text-slate-600 mb-3">{{ category.description }}</p>
            <div class="space-y-1">
              <div class="text-xs font-semibold text-slate-700">产品周期:</div>
              <div class="flex flex-wrap gap-1">
                <span v-for="product in category.productTypes" :key="product"
                     class="px-2 py-0.5 text-xs rounded-full border"
                     :style="{
                       backgroundColor: getBusinessLineBgColor(category.businessLine),
                       color: getBusinessLineColor(category.businessLine),
                       borderColor: getBusinessLineColor(category.businessLine)
                     }">
                  {{ product }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 收入分类列表 -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <h3 class="text-lg font-bold text-slate-900 mb-4">收入分类配置</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="category in categories" :key="category.id"
               class="p-4 border rounded-xl hover:shadow-lg transition-all relative group"
               :style="{
                 borderColor: category.businessLine === '其他' ? '#e2e8f0' : getBusinessLineColor(category.businessLine),
                 backgroundColor: category.businessLine === '其他' ? '#ffffff' : getBusinessLineBgColor(category.businessLine, 0.05)
               }">
            <div class="flex items-start justify-between mb-2">
              <div>
                <div class="font-bold text-slate-900">{{ category.name }}</div>
                <div class="text-xs text-slate-500 mt-1">编码: {{ category.code }}</div>
              </div>
              <div class="p-2 rounded-lg" :style="{ backgroundColor: getBusinessLineBgColor(category.businessLine) }">
                <component :is="getBusinessLineIcon(category.businessLine)" :size="16"
                           :style="{ color: getBusinessLineColor(category.businessLine) }" />
              </div>
            </div>
            <div class="text-sm text-slate-600 mb-2">{{ category.description }}</div>
            <div class="text-xs text-slate-500">业务线: <span class="font-medium">{{ category.businessLine }}</span></div>

            <!-- 统计信息 -->
            <div class="mt-3 pt-3 border-t border-slate-200">
              <div class="flex items-center justify-between text-xs">
                <span class="text-slate-500">该分类收入:</span>
                <span class="font-semibold" :style="{ color: getBusinessLineColor(category.businessLine) }">
                  ¥{{ getCategoryTotal(category.name).toLocaleString() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 批量添加收入模态框 -->
    <Teleport to="body">
      <div v-if="showBatchAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-white">批量添加收入</h3>
              <p class="text-sm text-purple-100 mt-0.5">一次性添加多条收入记录</p>
            </div>
            <button @click="closeBatchAddModal" class="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X :size="20" class="text-white" />
            </button>
          </div>

          <div class="flex-1 overflow-auto p-6">
            <!-- 工具栏 -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <button @click="addBatchRow" class="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-medium hover:bg-indigo-100 flex items-center gap-1">
                  <Plus :size="14" />
                  添加行
                </button>
                <button @click="clearBatchRows" class="px-3 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm hover:bg-slate-100">
                  清空
                </button>
                <span class="text-sm text-slate-500">共 {{ batchItems.length }} 条记录</span>
              </div>
              <div class="flex items-center gap-2">
                <label class="text-sm text-slate-600">快速填充:</label>
                <select v-model="quickFillType" @change="quickFillBatchItems" class="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">选择类型</option>
                  <option value="recharge">会员充值</option>
                  <option value="course">课程购买</option>
                  <option value="service">服务收入</option>
                  <option value="product">商品销售</option>
                </select>
                <select v-model="quickFillPayment" @change="quickFillBatchItems" class="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">支付方式</option>
                  <option value="wechat">微信支付</option>
                  <option value="alipay">支付宝</option>
                  <option value="cash">现金</option>
                </select>
              </div>
            </div>

            <!-- 批量输入表格 -->
            <div class="border border-slate-200 rounded-lg overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th class="px-3 py-2 text-left text-xs font-semibold text-slate-700 w-10">#</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold text-slate-700">业务线 *</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold text-slate-700">产品周期</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold text-slate-700">会员姓名 *</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold text-slate-700">手机号</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold text-slate-700">收入类型</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold text-slate-700">订单号</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold text-slate-700">销售人员</th>
                      <th class="px-3 py-2 text-left text-xs font-semibold text-slate-700">特殊备注</th>
                      <th class="px-3 py-2 text-center text-xs font-semibold text-slate-700 w-16">操作</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200">
                    <tr v-for="(item, index) in batchItems" :key="index" class="hover:bg-slate-50">
                      <td class="px-3 py-2 text-sm text-slate-500 font-medium">{{ index + 1 }}</td>
                      <td class="px-3 py-2">
                        <select v-model="item.businessLine" class="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="">请选择</option>
                          <option value="减重">减重管理</option>
                          <option value="斑块逆转">斑块逆转</option>
                          <option value="慢病管理">慢病管理</option>
                          <option value="超越百岁">超越百岁</option>
                        </select>
                      </td>
                      <td class="px-3 py-2">
                        <input v-model="item.productType" type="text" placeholder="产品周期" class="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </td>
                      <td class="px-3 py-2">
                        <input v-model="item.memberName" type="text" placeholder="姓名" class="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </td>
                      <td class="px-3 py-2">
                        <input v-model="item.memberPhone" type="text" placeholder="手机号" class="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </td>
                      <td class="px-3 py-2">
                        <select v-model="item.incomeType" class="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="">请选择</option>
                          <option value="会员充值">会员充值</option>
                          <option value="课程收入">课程收入</option>
                          <option value="服务收入">服务收入</option>
                          <option value="产品销售">产品销售</option>
                        </select>
                      </td>
                      <td class="px-3 py-2">
                        <input v-model="item.orderId" type="text" placeholder="订单号" class="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </td>
                      <td class="px-3 py-2">
                        <input v-model="item.salesman" type="text" placeholder="销售人员" class="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </td>
                      <td class="px-3 py-2">
                        <input v-model="item.specialRemark" type="text" placeholder="特殊备注" class="w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-300" />
                      </td>
                      <td class="px-3 py-2 text-center">
                        <button @click="removeBatchRow(index)" class="p-1 text-red-600 hover:bg-red-50 rounded" title="删除此行">
                          <Trash2 :size="14" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 空状态 -->
              <div v-if="batchItems.length === 0" class="text-center py-12 text-slate-400">
                <FileText :size="48" class="mx-auto mb-3 opacity-50" />
                <p class="text-sm font-medium">暂无数据</p>
                <p class="text-xs mt-1">点击"添加行"开始添加收入记录</p>
              </div>
            </div>

            <!-- 统计信息 -->
            <div v-if="batchItems.length > 0" class="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-6">
                  <div class="text-sm">
                    <span class="text-slate-600">记录数:</span>
                    <span class="font-bold text-indigo-700 ml-2">{{ batchItems.length }} 条</span>
                  </div>
                  <div class="text-sm">
                    <span class="text-slate-600">已完成:</span>
                    <span class="font-bold text-green-600 ml-2">{{ completedBatchItems }} 条</span>
                  </div>
                </div>
                <div class="text-xs text-slate-500">
                  <CheckCircle :size="14" class="inline mr-1" />
                  业务线、会员、销售信息完整
                </div>
              </div>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <div class="text-sm text-slate-500">
              <span class="text-amber-600">*</span> 为必填项
            </div>
            <div class="flex items-center gap-3">
              <button @click="closeBatchAddModal" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                取消
              </button>
              <button @click="saveBatchItems" :disabled="batchItems.length === 0 || completedBatchItems === 0" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <CheckCircle :size="16" />
                批量保存 ({{ batchItems.length }})
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 添加收入模态框 -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">添加收入记录</h3>
            <button @click="showAddModal = false" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" class="text-slate-500" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">业务线 *</label>
                <select v-model="formData.businessLine" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">请选择业务线</option>
                  <option value="减重">减重管理</option>
                  <option value="斑块逆转">斑块逆转</option>
                  <option value="慢病管理">慢病管理</option>
                  <option value="超越百岁">超越百岁</option>
                  <option value="其他">其他收入</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">产品周期</label>
                <select v-model="formData.productType" :disabled="!formData.businessLine || formData.businessLine === '其他'" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:cursor-not-allowed">
                  <option value="">请选择产品周期</option>
                  <option v-if="formData.businessLine === '超越百岁'" value="999会员">999会员</option>
                  <option v-if="formData.businessLine !== '超越百岁' && formData.businessLine !== '其他'" value="14天体验">14天体验</option>
                  <option v-if="formData.businessLine !== '超越百岁' && formData.businessLine !== '其他'" value="三个月">三个月</option>
                  <option v-if="formData.businessLine !== '超越百岁' && formData.businessLine !== '其他'" value="六个月">六个月</option>
                  <option v-if="formData.businessLine !== '超越百岁' && formData.businessLine !== '其他'" value="一年期">一年期</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">收入类型 *</label>
                <select v-model="formData.incomeType" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="">请选择收入类型</option>
                  <option value="会员充值">会员充值</option>
                  <option value="课程收入">课程收入</option>
                  <option value="服务收入">服务收入</option>
                  <option value="产品销售">产品销售</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">订单号</label>
                <input v-model="formData.orderId" type="text" placeholder="请输入订单号" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">会员姓名 *</label>
                <input v-model="formData.memberName" type="text" placeholder="请输入会员姓名" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">手机号</label>
                <input v-model="formData.memberPhone" type="text" placeholder="请输入手机号" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">销售人员</label>
              <input v-model="formData.salesman" type="text" placeholder="请输入销售人员" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">特殊备注</label>
              <textarea v-model="formData.specialRemark" placeholder="特殊项目记录（如：折扣优惠、额外服务、特殊安排等）" rows="3" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-300 resize-none"></textarea>
              <p class="text-xs text-slate-500 mt-1">用于记录特殊项目、优惠、异常情况等</p>
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
          <div class="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle :size="20" />
                特殊项目记录
              </h3>
              <p class="text-sm text-amber-100 mt-0.5">记录异常、优惠、特殊安排等</p>
            </div>
            <button @click="showSpecialRecordModal = false" class="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X :size="20" class="text-white" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div v-if="currentSpecialItem" class="p-3 bg-slate-50 rounded-lg mb-4">
              <div class="text-xs text-slate-600 mb-2">关联收入记录</div>
              <div class="flex items-center justify-between">
                <div class="text-sm">
                  <span class="font-medium text-slate-900">{{ currentSpecialItem.memberName }}</span>
                  <span class="text-slate-500 mx-2">|</span>
                  <span class="text-slate-600">{{ currentSpecialItem.businessLine }}</span>
                </div>
                <div class="text-xs text-slate-500">{{ currentSpecialItem.id }}</div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">特殊项目类型 *</label>
              <select v-model="specialRecordForm.type" class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="">请选择类型</option>
                <option value="特殊优惠">特殊优惠</option>
                <option value="额外服务">额外服务</option>
                <option value="特殊安排">特殊安排</option>
                <option value="异常处理">异常处理</option>
                <option value="折扣返利">折扣返利</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">特殊说明 *</label>
              <textarea
                v-model="specialRecordForm.description"
                placeholder="详细描述特殊项目的内容、原因、金额等"
                rows="4"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              ></textarea>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="showSpecialRecordModal = false" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="saveSpecialRecord" class="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium transition-colors">
              保存记录
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 确认对话框 -->
    <ConfirmDialog
      :show="confirm.show"
      :title="confirm.title"
      :message="confirm.message"
      :type="confirm.type"
      @confirm="confirm.onConfirm"
      @cancel="confirm.onCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Plus,
  Search,
  Download,
  TrendingUp,
  Calendar,
  DollarSign,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  BarChart3,
  Users,
  Target,
  Package,
  X,
  Trash2,
  Activity,
  Heart,
  Shield,
  Award
} from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import { useToast } from '../composables/useToast'
import ConfirmDialog from '../components/shared/ConfirmDialog.vue'

interface IncomeItem {
  id: string
  businessLine?: string // 业务线：减重、斑块逆转、慢病管理、超越百岁
  productType?: string // 产品周期：14天体验、三个月、六个月、一年期
  memberId: string
  memberName: string
  memberPhone: string
  incomeType?: string // 收入类型：会员充值、课程收入、服务收入、产品销售
  orderId?: string // 订单号
  salesman?: string // 销售人员
  specialRemark?: string // 特殊备注（特殊项目记录）
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

interface IncomeCategory {
  id: string
  name: string
  code: string
  description: string
  businessLine: string // 业务线
  productTypes: string[] // 产品周期选项
}

type TabType = 'list' | 'statistics' | 'categories'
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'refunded'
type TypeFilter = 'all' | 'recharge' | 'course' | 'service' | 'product'

const activeTab = ref<TabType>('list')
const searchText = ref('')
const statusFilter = ref<StatusFilter>('all')
const typeFilter = ref<TypeFilter>('all')
const showAddModal = ref(false)
const showBatchAddModal = ref(false)
const { toast: toastFunc } = useToast()

// 批量添加相关状态
const batchItems = ref<BatchIncomeItem[]>([])
const quickFillType = ref('')
const quickFillPayment = ref('')

interface BatchIncomeItem {
  type: IncomeItem['type']
  category: string // 业务线
  memberName: string
  memberPhone: string
  amount: number | null
  paymentMethod: IncomeItem['paymentMethod']
  salesman: string
  remark: string // 用备注字段存储产品周期
}

const confirm = ref({
  show: false,
  title: '',
  message: '',
  type: 'warning' as 'warning' | 'danger',
  onConfirm: () => {},
  onCancel: () => {}
})

const formData = ref({
  businessLine: '',
  productType: '',
  memberId: '',
  memberName: '',
  memberPhone: '',
  incomeType: '',
  orderId: '',
  salesman: '',
  specialRemark: ''
})

const incomeItems = ref<IncomeItem[]>([
  {
    id: 'INC001',
    businessLine: '减重',
    productType: '六个月',
    memberId: 'M001',
    memberName: '王芳',
    memberPhone: '138****1234',
    incomeType: '课程收入',
    orderId: 'ORD202402150001',
    salesman: '张顾问',
    createdAt: '2024-02-15 14:30:00'
  },
  {
    id: 'INC002',
    businessLine: '斑块逆转',
    productType: '一年期',
    memberId: 'M002',
    memberName: '李明',
    memberPhone: '139****5678',
    incomeType: '课程收入',
    orderId: 'ORD202402150002',
    salesman: '李教练',
    createdAt: '2024-02-15 13:20:00'
  },
  {
    id: 'INC003',
    businessLine: '慢病管理',
    productType: '一年期',
    memberId: 'M003',
    memberName: '赵丽',
    memberPhone: '137****9012',
    incomeType: '服务收入',
    orderId: 'ORD202402150003',
    salesman: '王医生',
    specialRemark: '高血压管理套餐',
    createdAt: '2024-02-15 11:15:00',
    specialRecords: [
      {
        id: 'SR001',
        type: '特殊优惠',
        description: '年度套餐9折优惠',
        operator: '系统管理员',
        createdAt: '2024-02-15 11:15:00'
      }
    ]
  },
  {
    id: 'INC004',
    businessLine: '超越百岁',
    productType: '999会员',
    memberId: 'M004',
    memberName: '孙伟',
    memberPhone: '136****3456',
    incomeType: '会员充值',
    orderId: 'ORD202402150004',
    salesman: '陈顾问',
    createdAt: '2024-02-15 10:45:00'
  },
  {
    id: 'INC005',
    businessLine: '减重',
    productType: '14天体验',
    memberId: 'M005',
    memberName: '周涛',
    memberPhone: '135****7890',
    incomeType: '课程收入',
    orderId: 'ORD202402140001',
    salesman: '张顾问',
    createdAt: '2024-02-14 16:50:00'
  },
  {
    id: 'INC006',
    businessLine: '慢病管理',
    productType: '三个月',
    memberId: 'M006',
    memberName: '吴秀兰',
    memberPhone: '133****2233',
    incomeType: '服务收入',
    orderId: 'ORD202402140002',
    salesman: '李医生',
    createdAt: '2024-02-14 15:30:00'
  },
  {
    id: 'INC007',
    businessLine: '斑块逆转',
    productType: '三个月',
    memberId: 'M007',
    memberName: '郑国强',
    memberPhone: '132****4455',
    incomeType: '课程收入',
    orderId: 'ORD202402140003',
    salesman: '王医生',
    createdAt: '2024-02-14 14:20:00'
  }
])

const categories = ref<IncomeCategory[]>([
  {
    id: 'C001',
    name: '减重管理',
    code: 'WL',
    description: '减重管理服务收入',
    businessLine: '减重',
    productTypes: ['14天体验', '三个月', '六个月', '一年期']
  },
  {
    id: 'C002',
    name: '斑块逆转',
    code: 'PR',
    description: '斑块逆转管理服务收入',
    businessLine: '斑块逆转',
    productTypes: ['14天体验', '三个月', '六个月', '一年期']
  },
  {
    id: 'C003',
    name: '慢病管理',
    code: 'CD',
    description: '慢病管理服务收入',
    businessLine: '慢病管理',
    productTypes: ['14天体验', '三个月', '六个月', '一年期']
  },
  {
    id: 'C004',
    name: '超越百岁',
    code: 'CENT',
    description: '超越百岁999会员',
    businessLine: '超越百岁',
    productTypes: ['999会员']
  },
  {
    id: 'C005',
    name: '会员充值',
    code: 'RC',
    description: '会员账户充值收入',
    businessLine: '其他',
    productTypes: []
  },
  {
    id: 'C006',
    name: '商品销售',
    code: 'PR',
    description: '营养品、运动器材等',
    businessLine: '其他',
    productTypes: []
  }
])

const statistics = computed(() => {
  const todayItems = incomeItems.value.filter(item => {
    const itemDate = new Date(item.createdAt)
    const today = new Date()
    return itemDate.toDateString() === today.toDateString()
  })

  const specialCount = incomeItems.value.filter(item =>
    item.specialRemark || (item.specialRecords && item.specialRecords.length > 0)
  ).length

  return {
    todayCount: todayItems.length,
    monthCount: incomeItems.value.length,
    yearCount: incomeItems.value.length * 12,
    specialCount
  }
})

const filteredItems = computed(() => {
  return incomeItems.value.filter(item => {
    const matchSearch = !searchText.value ||
      item.memberName.includes(searchText.value) ||
      item.memberPhone.includes(searchText.value) ||
      item.id.toLowerCase().includes(searchText.value.toLowerCase())
    return matchSearch
  })
})

// 业务线统计
const businessLineStats = computed(() => {
  const totalCount = incomeItems.value.length
  const stats = [
    { name: '减重', icon: Activity, color: '#3B82F6', bgColor: '#EFF6FF', textColor: '#1D4ED8', iconBg: '#DBEAFE' },
    { name: '斑块逆转', icon: Heart, color: '#8B5CF6', bgColor: '#F5F3FF', textColor: '#7C3AED', iconBg: '#EDE9FE' },
    { name: '慢病管理', icon: Shield, color: '#10B981', bgColor: '#ECFDF5', textColor: '#059669', iconBg: '#D1FAE5' },
    { name: '超越百岁', icon: Award, color: '#F59E0B', bgColor: '#FFFBEB', textColor: '#D97706', iconBg: '#FEF3C7' }
  ]

  return stats.map(stat => {
    const items = incomeItems.value.filter(item => item.businessLine === stat.name)
    return {
      ...stat,
      count: items.length,
      percentage: totalCount > 0 ? ((items.length / totalCount) * 100).toFixed(1) : '0.0'
    }
  })
})

// 产品周期统计
const productTypeStats = computed(() => {
  const productTypes = ['14天体验', '三个月', '六个月', '一年期', '999会员']
  const totalCount = incomeItems.value.length
  const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']

  return productTypes.map((type, index) => {
    const items = incomeItems.value.filter(item => item.productType === type)
    return {
      name: type,
      count: items.length,
      percentage: totalCount > 0 ? ((items.length / totalCount) * 100).toFixed(1) : '0.0',
      color: colors[index]
    }
  })
})

// 月度统计
const monthlyStats = computed(() => {
  const months = [
    { name: '9月', amount: 45000 },
    { name: '10月', amount: 52000 },
    { name: '11月', amount: 48000 },
    { name: '12月', amount: 65000 },
    { name: '1月', amount: 58000 },
    { name: '2月', amount: 72000 }
  ]
  return months
})

const maxMonthlyAmount = computed(() => {
  return Math.max(...monthlyStats.value.map(m => m.amount))
})

const totalIncome = computed(() => {
  return incomeItems.value.reduce((sum, item) => sum + item.amount, 0)
})

const averageIncome = computed(() => {
  return Math.round(totalIncome.value / 6)
})

const bestMonth = computed(() => {
  return monthlyStats.value.reduce((best, month) =>
    month.amount > best.amount ? month : best
  )
})

// 销售人员业绩
const salesStats = computed(() => {
  const salesMap = new Map<string, { total: number; count: number }>()

  incomeItems.value.forEach(item => {
    if (item.salesman) {
      const current = salesMap.get(item.salesman) || { total: 0, count: 0 }
      salesMap.set(item.salesman, {
        total: current.total + item.amount,
        count: current.count + 1
      })
    }
  })

  const totalAmount = incomeItems.value.reduce((sum, item) => sum + item.amount, 0)
  return Array.from(salesMap.entries())
    .map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
      percentage: ((data.total / totalAmount) * 100).toFixed(1)
    }))
    .sort((a, b) => b.total - a.total)
})

// 业务线相关方法
const getBusinessLineColor = (businessLine: string) => {
  const colors: Record<string, string> = {
    '减重': '#3B82F6',
    '斑块逆转': '#8B5CF6',
    '慢病管理': '#10B981',
    '超越百岁': '#F59E0B',
    '其他': '#94A3B8'
  }
  return colors[businessLine] || colors['其他']
}

const getBusinessLineBgColor = (businessLine: string, alpha: number = 1) => {
  const colors: Record<string, string> = {
    '减重': alpha === 1 ? '#EFF6FF' : 'rgba(59, 130, 246, 0.1)',
    '斑块逆转': alpha === 1 ? '#F5F3FF' : 'rgba(139, 92, 246, 0.1)',
    '慢病管理': alpha === 1 ? '#ECFDF5' : 'rgba(16, 185, 129, 0.1)',
    '超越百岁': alpha === 1 ? '#FFFBEB' : 'rgba(245, 158, 11, 0.1)',
    '其他': '#F1F5F9'
  }
  return colors[businessLine] || colors['其他']
}

const getBusinessLineIcon = (businessLine: string) => {
  const icons: Record<string, any> = {
    '减重': Activity,
    '斑块逆转': Heart,
    '慢病管理': Shield,
    '超越百岁': Award,
    '其他': Target
  }
  return icons[businessLine] || icons['其他']
}

const getCategoryTotal = (categoryName: string) => {
  return incomeItems.value
    .filter(item => item.category === categoryName || item.businessLine === categoryName)
    .reduce((sum, item) => sum + item.amount, 0)
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'recharge':
      return CreditCard
    case 'course':
      return Users
    case 'service':
      return Target
    case 'product':
      return Package
    default:
      return FileText
  }
}

const getStatusBadgeClass = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    refunded: 'bg-red-100 text-red-800 border-red-200'
  }
  return statusMap[status] || statusMap.pending
}

const getPaymentMethodBadgeClass = (method: string) => {
  const methodMap: Record<string, string> = {
    wechat: 'bg-green-50 text-green-700 border-green-200',
    alipay: 'bg-blue-50 text-blue-700 border-blue-200',
    bank: 'bg-purple-50 text-purple-700 border-purple-200',
    cash: 'bg-amber-50 text-amber-700 border-amber-200',
    pos: 'bg-cyan-50 text-cyan-700 border-cyan-200'
  }
  return methodMap[method] || methodMap.cash
}

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    wechat: '微信',
    alipay: '支付宝',
    bank: '银行',
    cash: '现金',
    pos: 'POS机'
  }
  return labels[method] || '现金'
}

const getBusinessLineBadgeClass = (businessLine?: string) => {
  const lineMap: Record<string, string> = {
    '减重': 'bg-blue-50 text-blue-700 border-blue-200',
    '斑块逆转': 'bg-purple-50 text-purple-700 border-purple-200',
    '慢病管理': 'bg-green-50 text-green-700 border-green-200',
    '超越百岁': 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-300',
    '其他': 'bg-slate-50 text-slate-700 border-slate-200'
  }
  return lineMap[businessLine || ''] || lineMap['其他']
}

// 批量添加计算属性
const batchTotalAmount = computed(() => {
  return batchItems.value.reduce((sum, item) => sum + (item.amount || 0), 0)
})

const completedBatchItems = computed(() => {
  return batchItems.value.filter(item => item.type && item.category && item.memberName && item.amount).length
})

// 批量添加方法
const openBatchAddModal = () => {
  batchItems.value = []
  quickFillType.value = ''
  quickFillPayment.value = ''
  // 默认添加5行
  for (let i = 0; i < 5; i++) {
    addBatchRow()
  }
  showBatchAddModal.value = true
}

const closeBatchAddModal = () => {
  const hasData = batchItems.value.some(item => item.memberName || item.amount)
  if (hasData) {
    confirm.value = {
      show: true,
      title: '确认关闭',
      message: '您有未保存的数据，确定要关闭吗？',
      type: 'warning',
      onConfirm: () => {
        showBatchAddModal.value = false
        confirm.value.show = false
      },
      onCancel: () => {
        confirm.value.show = false
      }
    }
  } else {
    showBatchAddModal.value = false
  }
}

const addBatchRow = () => {
  batchItems.value.push({
    type: 'recharge',
    category: '',
    memberName: '',
    memberPhone: '',
    amount: null,
    paymentMethod: 'wechat',
    salesman: '',
    remark: ''
  })
}

const removeBatchRow = (index: number) => {
  batchItems.value.splice(index, 1)
  if (batchItems.value.length === 0) {
    addBatchRow()
  }
}

const clearBatchRows = () => {
  confirm.value = {
    show: true,
    title: '确认清空',
    message: '确定要清空所有数据吗？',
    type: 'warning',
    onConfirm: () => {
      batchItems.value = []
      addBatchRow()
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const quickFillBatchItems = () => {
  if (quickFillType.value) {
    batchItems.value.forEach(item => {
      item.type = quickFillType.value as IncomeItem['type']
    })
  }
  if (quickFillPayment.value) {
    batchItems.value.forEach(item => {
      item.paymentMethod = quickFillPayment.value as IncomeItem['paymentMethod']
    })
  }
}

const saveBatchItems = () => {
  // 验证必填项
  const validItems = batchItems.value.filter(item => item.type && item.category && item.memberName && item.amount)

  if (validItems.length === 0) {
    toastFunc.error('请至少填写一条完整的记录')
    return
  }

  confirm.value = {
    show: true,
    title: '确认批量添加',
    message: `确定要添加 ${validItems.length} 条收入记录吗？总金额 ¥${batchTotalAmount.value.toLocaleString()}`,
    type: 'warning',
    onConfirm: () => {
      // 保存每条记录
      validItems.forEach((item, index) => {
        const newItem: IncomeItem = {
          id: `INC${String(incomeItems.value.length + index + 1).padStart(3, '0')}`,
          type: item.type,
          typeLabel: {
            recharge: '会员充值',
            course: '课程购买',
            service: '服务收入',
            product: '商品销售',
            card: '次卡销售',
            other: '其他收入'
          }[item.type],
          amount: item.amount!,
          memberId: `M${String(incomeItems.value.length + index + 1).padStart(3, '0')}`,
          memberName: item.memberName,
          memberPhone: item.memberPhone || '138****0000',
          paymentMethod: item.paymentMethod,
          paymentMethodLabel: {
            wechat: '微信支付',
            alipay: '支付宝',
            bank: '银行转账',
            cash: '现金',
            pos: 'POS机'
          }[item.paymentMethod],
          status: 'pending',
          statusLabel: '待确认',
          category: item.category,
          salesman: item.salesman,
          remark: item.remark,
          createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
        }
        incomeItems.value.unshift(newItem)
      })

      showBatchAddModal.value = false
      toastFunc.success('批量添加成功', `已添加 ${validItems.length} 条收入记录，总金额 ¥${batchTotalAmount.value.toLocaleString()}`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const openAddModal = () => {
  formData.value = {
    type: 'service',
    amount: '',
    memberId: '',
    memberName: '',
    memberPhone: '',
    paymentMethod: 'wechat',
    category: '',
    businessLine: '',
    productType: '',
    salesman: '',
    remark: ''
  }
  showAddModal.value = true
}

const saveAdd = () => {
  if (!formData.value.memberName || !formData.value.amount || !formData.value.businessLine) {
    toastFunc.error('请填写必填项')
    return
  }

  // 根据业务线确定分类
  let category = formData.value.businessLine
  if (formData.value.productType) {
    category = `${formData.value.businessLine} - ${formData.value.productType}`
  }

  const newItem: IncomeItem = {
    id: `INC${String(incomeItems.value.length + 1).padStart(3, '0')}`,
    type: 'service',
    typeLabel: '服务收入',
    amount: parseFloat(formData.value.amount),
    memberId: formData.value.memberId || `M${String(incomeItems.value.length + 1).padStart(3, '0')}`,
    memberName: formData.value.memberName,
    memberPhone: formData.value.memberPhone || '138****0000',
    paymentMethod: formData.value.paymentMethod,
    paymentMethodLabel: {
      wechat: '微信支付',
      alipay: '支付宝',
      bank: '银行转账',
      cash: '现金',
      pos: 'POS机'
    }[formData.value.paymentMethod],
    status: 'pending',
    statusLabel: '待确认',
    category: category,
    businessLine: formData.value.businessLine,
    productType: formData.value.productType,
    salesman: formData.value.salesman,
    remark: formData.value.remark,
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
  }

  incomeItems.value.unshift(newItem)
  showAddModal.value = false
  toastFunc.success('收入记录已添加')
}

// 业务线变更处理
const onBusinessLineChange = () => {
  // 清空产品周期选择
  formData.value.productType = ''
}

const confirmIncome = (id: string) => {
  const item = incomeItems.value.find(i => i.id === id)
  if (!item) return

  incomeItems.value = incomeItems.value.map(i =>
    i.id === id
      ? {
          ...i,
          status: 'confirmed' as const,
          statusLabel: '已确认',
          confirmedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
        }
      : i
  )
  toastFunc.success('收入已确认', `¥${item.amount.toLocaleString()} 的收入已确认`)
}

const deleteItem = (id: string) => {
  const item = incomeItems.value.find(i => i.id === id)
  if (!item) return

  confirm.value = {
    show: true,
    title: '删除收入记录',
    message: `确定要删除来自 "${item.memberName}" 的收入记录吗？`,
    type: 'danger',
    onConfirm: () => {
      incomeItems.value = incomeItems.value.filter(i => i.id !== id)
      toastFunc.success('删除成功', '收入记录已删除')
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

// 编辑收入项目
const editItem = (item: IncomeItem) => {
  Object.assign(formData.value, {
    businessLine: item.businessLine || '',
    productType: item.productType || '',
    memberId: item.memberId,
    memberName: item.memberName,
    memberPhone: item.memberPhone,
    incomeType: item.incomeType || '',
    orderId: item.orderId || '',
    salesman: item.salesman || '',
    specialRemark: item.specialRemark || ''
  })
  showAddModal.value = true
}

// 添加特殊项目记录
const showSpecialRecordModal = ref(false)
const currentSpecialItem = ref<IncomeItem | null>(null)

const specialRecordForm = ref({
  type: '',
  description: ''
})

const addSpecialRecord = (item: IncomeItem) => {
  currentSpecialItem.value = item
  specialRecordForm.value = {
    type: '',
    description: ''
  }
  showSpecialRecordModal.value = true
}

const saveSpecialRecord = () => {
  if (!currentSpecialItem.value || !specialRecordForm.value.type) {
    toastFunc.warning('警告', '请填写特殊项目类型')
    return
  }

  if (!currentSpecialItem.value.specialRecords) {
    currentSpecialItem.value.specialRecords = []
  }

  currentSpecialItem.value.specialRecords.push({
    id: `SR${Date.now()}`,
    type: specialRecordForm.value.type,
    description: specialRecordForm.value.description,
    operator: '当前用户',
    createdAt: new Date().toISOString()
  })

  toastFunc.success('成功', '特殊项目记录已添加')
  showSpecialRecordModal.value = false
  specialRecordForm.value = { type: '', description: '' }
}

// 导出数据
const exportData = () => {
  toastFunc.info('导出中', '正在导出收入数据...')

  try {
    const exportData = filteredItems.value.map(item => ({
      '收入单号': item.id,
      '业务线': item.businessLine || '-',
      '产品周期': item.productType || '-',
      '会员姓名': item.memberName,
      '会员手机': item.memberPhone,
      '会员ID': item.memberId,
      '收入类型': item.incomeType || '-',
      '订单号': item.orderId || '-',
      '销售人员': item.salesman || '-',
      '特殊备注': item.specialRemark || '-',
      '创建时间': item.createdAt,
      '特殊项目数': item.specialRecords?.length || 0
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    ws['!cols'] = [
      { wch: 15 }, // 收入单号
      { wch: 12 }, // 业务线
      { wch: 12 }, // 产品周期
      { wch: 12 }, // 会员姓名
      { wch: 15 }, // 会员手机
      { wch: 12 }, // 会员ID
      { wch: 12 }, // 收入类型
      { wch: 15 }, // 订单号
      { wch: 10 }, // 销售人员
      { wch: 30 }, // 特殊备注
      { wch: 18 }, // 创建时间
      { wch: 12 }  // 特殊项目数
    ]

    XLSX.utils.book_append_sheet(wb, ws, '收入明细')

    const fileName = `收入明细_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    toastFunc.success('导出成功', `已导出 ${filteredItems.value.length} 条收入记录`)
  } catch (error) {
    console.error('导出失败:', error)
    toastFunc.error('导出失败', '导出收入数据时发生错误')
  }
}
</script>
