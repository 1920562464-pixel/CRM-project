<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold flex items-center gap-2" :style="{ color: 'var(--text-primary)' }">
        <PieChart :size="28" style="color: #ec4899;" />
        财务报表
      </h1>
      <p class="mt-1" :style="{ color: 'var(--text-secondary)' }">资产负债表、损益表、现金流量表（与业务数据实时关联）</p>
    </div>

    <!-- 报表类型选择 -->
    <div class="flex items-center gap-2" :style="{ borderBottom: '1px solid var(--border)' }">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
        :style="activeTab === tab.id
          ? { borderBottomColor: '#ec4899', color: '#ec4899' }
          : { borderBottomColor: 'transparent', color: 'var(--text-secondary)' }"
      >
        <component :is="tab.icon" :size="16" />
        {{ tab.name }}
      </button>
    </div>

    <!-- 业务线收入分析（新增） -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in businessLineFinancialStats" :key="stat.name"
           class="rounded-xl border-2 p-4 transition-all hover:shadow-lg"
           :style="{ borderColor: stat.color, backgroundColor: stat.bgColor }">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium" :style="{ color: stat.textColor }">{{ stat.name }}收入</span>
          <component :is="stat.icon" :size="20" :style="{ color: stat.color }" />
        </div>
        <div class="text-2xl font-bold" :style="{ color: stat.color }">¥{{ stat.revenue.toLocaleString() }}</div>
        <div class="text-xs mt-1" :style="{ color: stat.textColor }">
          {{ stat.orders }} 笔 | 占总收入 {{ stat.percentage }}%
        </div>
        <div class="mt-2 pt-2 border-t" :style="{ borderColor: stat.color + '33' }">
          <div class="flex items-center justify-between text-xs">
            <span :style="{ color: stat.textColor }">毛利率</span>
            <span class="font-semibold" :style="{ color: stat.color }">{{ stat.profitMargin }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 资产负债表 -->
    <div v-if="activeTab === 'balance'" class="space-y-4">
      <!-- 日期选择器 -->
      <div class="rounded-xl p-4 shadow-sm" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <label class="text-sm font-medium" :style="{ color: 'var(--text-primary)' }">报表日期</label>
            <input
              v-model="reportDate"
              type="month"
              class="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
              :style="{
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--text-primary)',
                '--tw-ring-color': 'rgba(236, 72, 153, 0.5)'
              }"
            />
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" :style="{
              background: 'rgba(59, 130, 246, 0.1)',
              color: '#1d4ed8'
            }">
              <Link2 :size="14" />
              数据来自: 收入管理、应收账款、资金管理
            </div>
            <button class="px-4 py-2 text-white rounded-lg flex items-center gap-2 text-sm font-medium shadow-sm transition-colors" style="background: #ec4899;">
              <Download :size="16" />
              导出报表
            </button>
          </div>
        </div>
      </div>

      <!-- 数据勾稽说明 -->
      <div class="rounded-xl p-4" :style="{
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }">
        <div class="flex items-center gap-2 mb-2">
          <Link2 :size="16" style="color: #2563eb;" />
          <span class="text-sm font-semibold" style="color: #1e3a8a;">数据勾稽关系</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs" style="color: #1e3a8a;">
          <div class="flex items-center gap-2">
            <CheckCircle :size="14" />
            <span>应收账款 = 应收账款模块余额</span>
          </div>
          <div class="flex items-center gap-2">
            <CheckCircle :size="14" />
            <span>货币资金 = 银行账户余额汇总</span>
          </div>
          <div class="flex items-center gap-2">
            <CheckCircle :size="14" />
            <span>未分配利润 = 累计净利润</span>
          </div>
        </div>
      </div>

      <!-- 资产负债表内容 -->
      <div class="rounded-xl overflow-hidden shadow-sm" :style="{
        background: 'var(--card)',
        border: '1px solid var(--border)'
      }">
        <div class="px-6 py-4" :style="{
          background: 'linear-gradient(to right, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))',
          borderBottom: '1px solid var(--border)'
        }">
          <h3 class="text-lg font-bold" :style="{ color: 'var(--text-primary)' }">资产负债表</h3>
          <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">单位：人民币元</p>
        </div>

        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 资产 -->
            <div>
              <h4 class="text-base font-bold mb-4 pb-2" :style="{
                color: 'var(--text-primary)',
                borderBottom: '2px solid #ec4899'
              }">资产</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between py-2">
                  <span class="text-slate-600 font-medium">流动资产</span>
                  <span class="font-semibold text-slate-900">¥{{ (balanceSheet.assets.current.cash + balanceSheet.assets.current.receivables + balanceSheet.assets.current.inventory).toLocaleString() }}</span>
                </div>
                <div class="pl-4 space-y-1.5 text-xs">
                  <div class="flex justify-between text-slate-600">
                    <span>货币资金</span>
                    <span>¥{{ balanceSheet.assets.current.cash.toLocaleString() }}</span>
                  </div>
                  <div class="flex justify-between text-slate-600">
                    <span>应收账款</span>
                    <span>¥{{ balanceSheet.assets.current.receivables.toLocaleString() }}</span>
                  </div>
                  <div class="flex justify-between text-slate-600">
                    <span>存货</span>
                    <span>¥{{ balanceSheet.assets.current.inventory.toLocaleString() }}</span>
                  </div>
                </div>
                <div class="flex justify-between py-2 border-t border-slate-100">
                  <span class="text-slate-600 font-medium">非流动资产</span>
                  <span class="font-semibold text-slate-900">¥{{ (balanceSheet.assets.nonCurrent.fixedAssets + balanceSheet.assets.nonCurrent.accumulatedDepreciation).toLocaleString() }}</span>
                </div>
                <div class="pl-4 space-y-1.5 text-xs">
                  <div class="flex justify-between text-slate-600">
                    <span>固定资产原值</span>
                    <span>¥{{ balanceSheet.assets.nonCurrent.fixedAssets.toLocaleString() }}</span>
                  </div>
                  <div class="flex justify-between text-slate-600">
                    <span>累计折旧</span>
                    <span>¥{{ balanceSheet.assets.nonCurrent.accumulatedDepreciation.toLocaleString() }}</span>
                  </div>
                </div>
                <div class="flex justify-between py-3 border-t-2 border-slate-200 bg-gradient-to-r from-pink-50 to-transparent -mx-2 px-2 rounded">
                  <span class="font-bold text-slate-900">资产总计</span>
                  <span class="text-lg font-bold text-pink-600">¥{{ totalAssets.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- 负债和所有者权益 -->
            <div>
              <h4 class="text-base font-bold text-slate-900 mb-4 pb-2 border-b-2 border-purple-500">负债和所有者权益</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between py-2">
                  <span class="text-slate-600 font-medium">流动负债</span>
                  <span class="font-semibold text-slate-900">¥{{ (balanceSheet.liabilities.current.payables + balanceSheet.liabilities.current.salaries + balanceSheet.liabilities.current.other).toLocaleString() }}</span>
                </div>
                <div class="pl-4 space-y-1.5 text-xs">
                  <div class="flex justify-between text-slate-600">
                    <span>应付账款</span>
                    <span>¥{{ balanceSheet.liabilities.current.payables.toLocaleString() }}</span>
                  </div>
                  <div class="flex justify-between text-slate-600">
                    <span>应付职工薪酬</span>
                    <span>¥{{ balanceSheet.liabilities.current.salaries.toLocaleString() }}</span>
                  </div>
                  <div class="flex justify-between text-slate-600">
                    <span>其他应付款</span>
                    <span>¥{{ balanceSheet.liabilities.current.other.toLocaleString() }}</span>
                  </div>
                </div>
                <div class="flex justify-between py-2 border-t border-slate-100">
                  <span class="text-slate-600 font-medium">非流动负债</span>
                  <span class="font-semibold text-slate-900">¥{{ balanceSheet.liabilities.nonCurrent.total.toLocaleString() }}</span>
                </div>
                <div class="flex justify-between py-2 border-t border-slate-100">
                  <span class="text-slate-600 font-medium">所有者权益</span>
                  <span class="font-semibold text-slate-900">¥{{ (balanceSheet.equity.paidInCapital + balanceSheet.equity.retainedEarnings).toLocaleString() }}</span>
                </div>
                <div class="pl-4 space-y-1.5 text-xs">
                  <div class="flex justify-between text-slate-600">
                    <span>实收资本</span>
                    <span>¥{{ balanceSheet.equity.paidInCapital.toLocaleString() }}</span>
                  </div>
                  <div class="flex justify-between text-slate-600">
                    <span>未分配利润</span>
                    <span>¥{{ balanceSheet.equity.retainedEarnings.toLocaleString() }}</span>
                  </div>
                </div>
                <div class="flex justify-between py-3 border-t-2 border-slate-200 bg-gradient-to-r from-purple-50 to-transparent -mx-2 px-2 rounded">
                  <span class="font-bold text-slate-900">负债和权益总计</span>
                  <span class="text-lg font-bold text-purple-600">¥{{ totalEquity.toLocaleString() }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 损益表 -->
    <div v-else-if="activeTab === 'income'" class="space-y-4">
      <!-- 报表控制栏 -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <label class="text-sm font-medium text-slate-700">报表月份</label>
            <input
              v-model="reportDate"
              type="month"
              class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
            <span class="text-sm text-slate-500">对比</span>
            <select class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm bg-white">
              <option>上月</option>
              <option>去年同月</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs">
              <Link2 :size="14" />
              数据来自: 收入管理模块
            </div>
            <button class="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors">
              <Download :size="16" />
              导出报表
            </button>
          </div>
        </div>
      </div>

      <!-- 业务线收入明细（新增） -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
          <h3 class="text-lg font-bold text-slate-900">业务线收入明细</h3>
          <p class="text-sm text-slate-600">按业务线分类的收入统计</p>
        </div>
        <div class="p-6">
          <div class="space-y-3">
            <div v-for="line in businessLineIncomeDetailsDisplay" :key="line.name" class="border rounded-lg overflow-hidden" :style="{ borderColor: line.color }">
              <div class="flex items-center justify-between px-4 py-3" :style="{ backgroundColor: line.bgColor }">
                <div class="flex items-center gap-3">
                  <component :is="line.icon" :size="20" :style="{ color: line.color }" />
                  <span class="font-bold text-slate-900">{{ line.name }}</span>
                </div>
                <div class="text-right">
                  <div class="text-xl font-bold" :style="{ color: line.color }">¥{{ line.total.toLocaleString() }}</div>
                  <div class="text-xs text-slate-600">{{ line.percentage }}% 营业收入</div>
                </div>
              </div>
              <div class="px-4 py-2 bg-white">
                <div class="grid grid-cols-4 gap-3 text-xs">
                  <div v-for="product in line.products" :key="product.name">
                    <div class="text-slate-600">{{ product.name }}</div>
                    <div class="font-semibold" :style="{ color: line.color }">¥{{ product.amount.toLocaleString() }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-4 border-b border-slate-200">
          <h3 class="text-lg font-bold text-slate-900">损益表</h3>
          <p class="text-sm text-slate-600">单位：人民币元</p>
        </div>

        <div class="p-6">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-3 font-semibold text-slate-700">项目</th>
                <th class="text-right py-3 font-semibold text-slate-700">本期</th>
                <th class="text-right py-3 font-semibold text-slate-700">上期</th>
                <th class="text-right py-3 font-semibold text-slate-700">变动</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr class="bg-gradient-to-r from-green-50 to-transparent">
                <td class="py-3 font-bold text-slate-900">一、营业收入</td>
                <td class="text-right font-semibold text-slate-900">¥{{ totalIncome.toLocaleString() }}</td>
                <td class="text-right text-slate-600">¥114,200</td>
                <td class="text-right text-green-600 font-medium">+12.5%</td>
              </tr>
              <tr>
                <td class="py-2 pl-4 text-slate-600">会员收入</td>
                <td class="text-right text-slate-700">¥68,400</td>
                <td class="text-right text-slate-500">¥62,800</td>
                <td class="text-right text-green-600 text-xs">+8.9%</td>
              </tr>
              <tr>
                <td class="py-2 pl-4 text-slate-600">课程收入</td>
                <td class="text-right text-slate-700">¥42,600</td>
                <td class="text-right text-slate-500">¥36,200</td>
                <td class="text-right text-green-600 text-xs">+17.7%</td>
              </tr>
              <tr>
                <td class="py-2 pl-4 text-slate-600">产品收入</td>
                <td class="text-right text-slate-700">¥17,500</td>
                <td class="text-right text-slate-500">¥15,200</td>
                <td class="text-right text-green-600 text-xs">+15.1%</td>
              </tr>
              <tr class="bg-gradient-to-r from-red-50 to-transparent">
                <td class="py-3 font-bold text-slate-900">二、营业成本</td>
                <td class="text-right font-semibold text-slate-900">¥42,300</td>
                <td class="text-right text-slate-600">¥39,800</td>
                <td class="text-right text-red-600 font-medium">+6.3%</td>
              </tr>
              <tr>
                <td class="py-2 pl-4 text-slate-600">人力成本</td>
                <td class="text-right text-slate-700">¥28,500</td>
                <td class="text-right text-slate-500">¥26,400</td>
                <td class="text-right text-red-600 text-xs">+7.9%</td>
              </tr>
              <tr>
                <td class="py-2 pl-4 text-slate-600">产品成本</td>
                <td class="text-right text-slate-700">¥13,800</td>
                <td class="text-right text-slate-500">¥13,400</td>
                <td class="text-right text-red-600 text-xs">+3.0%</td>
              </tr>
              <tr class="bg-slate-50">
                <td class="py-3 font-bold text-slate-900">三、毛利</td>
                <td class="text-right font-bold text-slate-900">¥{{ grossProfit.toLocaleString() }}</td>
                <td class="text-right text-slate-600">¥74,400</td>
                <td class="text-right text-green-600 font-medium">+15.9%</td>
              </tr>
              <tr class="bg-gradient-to-r from-red-50 to-transparent">
                <td class="py-3 font-bold text-slate-900">四、营业费用</td>
                <td class="text-right font-semibold text-slate-900">¥38,600</td>
                <td class="text-right text-slate-600">¥35,200</td>
                <td class="text-right text-red-600 font-medium">+9.7%</td>
              </tr>
              <tr>
                <td class="py-2 pl-4 text-slate-600">销售费用</td>
                <td class="text-right text-slate-700">¥18,400</td>
                <td class="text-right text-slate-500">¥16,800</td>
                <td class="text-right text-red-600 text-xs">+9.5%</td>
              </tr>
              <tr>
                <td class="py-2 pl-4 text-slate-600">管理费用</td>
                <td class="text-right text-slate-700">¥15,600</td>
                <td class="text-right text-slate-500">¥14,200</td>
                <td class="text-right text-red-600 text-xs">+9.9%</td>
              </tr>
              <tr>
                <td class="py-2 pl-4 text-slate-600">财务费用</td>
                <td class="text-right text-slate-700">¥4,600</td>
                <td class="text-right text-slate-500">¥4,200</td>
                <td class="text-right text-red-600 text-xs">+9.5%</td>
              </tr>
              <tr class="bg-gradient-to-r from-green-50 to-transparent">
                <td class="py-3 font-bold text-slate-900">五、营业利润</td>
                <td class="text-right font-bold text-green-600">¥47,600</td>
                <td class="text-right text-slate-600">¥39,200</td>
                <td class="text-right text-green-600 font-medium">+21.4%</td>
              </tr>
              <tr>
                <td class="py-3 font-bold text-slate-900">六、利润总额</td>
                <td class="text-right font-bold text-slate-900">¥47,600</td>
                <td class="text-right text-slate-600">¥39,200</td>
                <td class="text-right text-green-600 font-medium">+21.4%</td>
              </tr>
              <tr>
                <td class="py-3 font-bold text-slate-900">减：所得税</td>
                <td class="text-right text-slate-700">¥11,900</td>
                <td class="text-right text-slate-500">¥9,800</td>
                <td class="text-right text-red-600 text-xs">+21.4%</td>
              </tr>
              <tr class="bg-gradient-to-r from-pink-100 to-purple-100">
                <td class="py-4 text-lg font-bold text-slate-900">七、净利润</td>
                <td class="text-right text-lg font-bold text-pink-600">¥{{ netProfit.toLocaleString() }}</td>
                <td class="text-right text-slate-600">¥29,400</td>
                <td class="text-right text-green-600 font-medium">+21.4%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 利润率分析 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div class="text-sm text-slate-600 mb-1">毛利率</div>
          <div class="text-2xl font-bold text-green-600">{{ grossMargin }}%</div>
          <div class="text-xs text-green-600 mt-1">↑ 2.1%</div>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div class="text-sm text-slate-600 mb-1">净利率</div>
          <div class="text-2xl font-bold text-pink-600">{{ netMargin }}%</div>
          <div class="text-xs text-green-600 mt-1">↑ 2.1%</div>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div class="text-sm text-slate-600 mb-1">费用率</div>
          <div class="text-2xl font-bold text-amber-600">{{ expenseRate }}%</div>
          <div class="text-xs text-red-600 mt-1">↑ 0.7%</div>
        </div>
      </div>
    </div>

    <!-- 现金流量表 -->
    <div v-else-if="activeTab === 'cashflow'" class="space-y-4">
      <!-- 报表控制栏 -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <label class="text-sm font-medium text-slate-700">报表月份</label>
            <input
              v-model="reportDate"
              type="month"
              class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
            />
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs">
              <Link2 :size="14" />
              数据来自: 收入管理、应付账款、资金管理
            </div>
            <button class="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors">
              <Download :size="16" />
              导出报表
            </button>
          </div>
        </div>
      </div>

      <!-- 现金流量分析（新增） -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h4 class="text-sm font-semibold text-slate-900 mb-3">收入现金构成</h4>
          <div class="space-y-2">
            <div v-for="item in cashFlowFromIncome" :key="item.name" class="flex items-center justify-between p-2 rounded-lg" :style="{ backgroundColor: item.bgColor }">
              <span class="text-sm font-medium" :style="{ color: item.color }">{{ item.name }}</span>
              <span class="text-sm font-bold" :style="{ color: item.color }">¥{{ item.amount.toLocaleString() }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h4 class="text-sm font-semibold text-slate-900 mb-3">支出现金构成</h4>
          <div class="space-y-2">
            <div v-for="item in cashFlowFromExpense" :key="item.name" class="flex items-center justify-between p-2 rounded-lg" :style="{ backgroundColor: item.bgColor }">
              <span class="text-sm font-medium" :style="{ color: item.color }">{{ item.name }}</span>
              <span class="text-sm font-bold" :style="{ color: item.color }">¥{{ item.amount.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div class="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-4 border-b border-slate-200">
          <h3 class="text-lg font-bold text-slate-900">现金流量表</h3>
          <p class="text-sm text-slate-600">单位：人民币元</p>
        </div>

        <div class="p-6">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-3 font-semibold text-slate-700">项目</th>
                <th class="text-right py-3 font-semibold text-slate-700">金额</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr class="bg-gradient-to-r from-green-50 to-transparent">
                <td class="py-3 font-bold text-slate-900">一、经营活动现金流量</td>
                <td class="text-right"></td>
              </tr>
              <tr>
                <td class="py-2 pl-4 text-slate-600">销售商品、提供服务收到的现金</td>
                <td class="text-right text-green-600 font-medium">¥{{ cashFlowComposition.operating.inflow.toLocaleString() }}</td>
              </tr>
              <tr>
                <td class="py-2 pl-4 text-slate-600">购买商品、服务支付的现金</td>
                <td class="text-right text-red-600 font-medium">-¥{{ (cashFlowComposition.operating.outflow * 0.45).toFixed(0).toLocaleString() }}</td>
              </tr>
              <tr>
                <td class="py-2 pl-4 text-slate-600">支付给职工的现金</td>
                <td class="text-right text-red-600 font-medium">-¥{{ (cashFlowComposition.operating.outflow * 0.40).toFixed(0).toLocaleString() }}</td>
              </tr>
              <tr>
                <td class="py-2 pl-4 text-slate-600">支付各项税费</td>
                <td class="text-right text-red-600 font-medium">-¥{{ (cashFlowComposition.operating.outflow * 0.15).toFixed(0).toLocaleString() }}</td>
              </tr>
              <tr class="bg-green-50">
                <td class="py-3 pl-4 font-bold text-slate-900">经营活动现金净流量</td>
                <td class="text-right font-bold text-green-600">¥{{ cashFlowComposition.operating.net.toLocaleString() }}</td>
              </tr>

              <tr class="bg-gradient-to-r from-blue-50 to-transparent">
                <td class="py-3 font-bold text-slate-900">二、投资活动现金流量</td>
                <td class="text-right"></td>
              </tr>
              <tr>
                <td class="py-2 pl-4 text-slate-600">购建固定资产支付的现金</td>
                <td class="text-right text-red-600 font-medium">¥{{ cashFlowComposition.investing.outflow.toLocaleString() }}</td>
              </tr>
              <tr class="bg-blue-50">
                <td class="py-3 pl-4 font-bold text-slate-900">投资活动现金净流量</td>
                <td class="text-right font-bold text-blue-600">¥{{ cashFlowComposition.investing.net.toLocaleString() }}</td>
              </tr>

              <tr class="bg-gradient-to-r from-purple-50 to-transparent">
                <td class="py-3 font-bold text-slate-900">三、筹资活动现金流量</td>
                <td class="text-right"></td>
              </tr>
              <tr>
                <td class="py-2 pl-4 text-slate-600">吸收投资收到的现金</td>
                <td class="text-right text-green-600 font-medium">¥{{ cashFlowComposition.financing.inflow.toLocaleString() }}</td>
              </tr>
              <tr class="bg-purple-50">
                <td class="py-3 pl-4 font-bold text-slate-900">筹资活动现金净流量</td>
                <td class="text-right font-bold text-purple-600">¥{{ cashFlowComposition.financing.net.toLocaleString() }}</td>
              </tr>

              <tr class="bg-gradient-to-r from-pink-100 to-purple-100">
                <td class="py-4 text-lg font-bold text-slate-900">四、现金及等价物净增加额</td>
                <td class="text-right text-lg font-bold text-pink-600">¥{{ (cashFlowComposition.operating.net + cashFlowComposition.investing.net + cashFlowComposition.financing.net).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 现金流分析 -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div class="text-sm text-slate-600 mb-1">期初现金余额</div>
          <div class="text-xl font-bold text-slate-900">¥{{ (cashFunds - (cashFlowComposition.operating.net + cashFlowComposition.investing.net + cashFlowComposition.financing.net)).toLocaleString() }}</div>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div class="text-sm text-slate-600 mb-1">经营活动现金流</div>
          <div class="text-xl font-bold" :class="cashFlowComposition.operating.net >= 0 ? 'text-green-600' : 'text-red-600'">¥{{ cashFlowComposition.operating.net >= 0 ? '+' : '' }}{{ cashFlowComposition.operating.net.toLocaleString() }}</div>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div class="text-sm text-slate-600 mb-1">投资活动现金流</div>
          <div class="text-xl font-bold" :class="cashFlowComposition.investing.net >= 0 ? 'text-green-600' : 'text-red-600'">¥{{ cashFlowComposition.investing.net >= 0 ? '+' : '' }}{{ cashFlowComposition.investing.net.toLocaleString() }}</div>
        </div>
        <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div class="text-sm text-slate-600 mb-1">期末现金余额</div>
          <div class="text-xl font-bold text-pink-600">¥{{ cashFunds.toLocaleString() }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'

// 主题相关
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')
import {
  PieChart,
  Scale,
  TrendingUp,
  Activity,
  Download,
  CheckCircle,
  Link2,
  Heart,
  Shield,
  Award,
  Activity as ActivityIcon
} from 'lucide-vue-next'
import { useFinancialData } from '@/composables/useFinancialData'

interface ReportTab {
  id: string
  name: string
  icon: any
}

const tabs: ReportTab[] = [
  { id: 'balance', name: '资产负债表', icon: Scale },
  { id: 'income', name: '损益表', icon: TrendingUp },
  { id: 'cashflow', name: '现金流量表', icon: Activity }
]

const activeTab = ref('balance')
const reportDate = ref('2024-02')

// 使用统一的财务数据 composable（与收入管理模块数据勾稽）
const {
  incomeByBusinessLine,
  totalIncome,
  totalExpense,
  cashFunds,
  totalReceivables,
  netProfit,
  grossProfit,
  businessLineIncomeDetails,
  cashFlowComposition,
  balanceSheet,
  expenseRecords,
  incomeRecords
} = useFinancialData()

// 业务线映射配置
const businessLineConfig = {
  '减重': {
    name: '减重管理',
    icon: ActivityIcon,
    color: '#3B82F6',
    bgColor: '#EFF6FF',
    textColor: '#1D4ED8',
    profitMargin: 65.2
  },
  '斑块逆转': {
    name: '斑块逆转',
    icon: Heart,
    color: '#8B5CF6',
    bgColor: '#F5F3FF',
    textColor: '#7C3AED',
    profitMargin: 68.5
  },
  '慢病管理': {
    name: '慢病管理',
    icon: Shield,
    color: '#10B981',
    bgColor: '#ECFDF5',
    textColor: '#059669',
    profitMargin: 63.8
  },
  '超越百岁': {
    name: '超越百岁',
    icon: Award,
    color: '#F59E0B',
    bgColor: '#FFFBEB',
    textColor: '#D97706',
    profitMargin: 85.0
  }
} as const

// 业务线财务统计卡片（数据来自 useFinancialData）
const businessLineFinancialStats = computed(() => {
  return Object.entries(incomeByBusinessLine.value)
    .filter(([_, stats]) => stats.revenue > 0)
    .map(([line, stats]) => ({
      name: businessLineConfig[line as keyof typeof businessLineConfig].name,
      icon: businessLineConfig[line as keyof typeof businessLineConfig].icon,
      revenue: stats.revenue,
      orders: stats.orders,
      percentage: stats.percentage.toFixed(1),
      profitMargin: businessLineConfig[line as keyof typeof businessLineConfig].profitMargin,
      color: businessLineConfig[line as keyof typeof businessLineConfig].color,
      bgColor: businessLineConfig[line as keyof typeof businessLineConfig].bgColor,
      textColor: businessLineConfig[line as keyof typeof businessLineConfig].textColor
    }))
})

// 业务线收入明细（用于损益表展示，数据来自 useFinancialData）
const businessLineIncomeDetailsDisplay = computed(() => {
  return Object.entries(businessLineIncomeDetails.value)
    .filter(([_, details]) => details.total > 0)
    .map(([line, details]) => {
      const config = businessLineConfig[line as keyof typeof businessLineConfig]
      const percentage = totalIncome.value > 0 ? (details.total / totalIncome.value * 100).toFixed(1) : '0'
      return {
        name: config.name,
        icon: config.icon,
        total: details.total,
        percentage: parseFloat(percentage),
        color: config.color,
        bgColor: config.bgColor,
        products: Object.entries(details.products)
          .filter(([_, amount]) => amount > 0)
          .map(([name, amount]) => ({ name, amount: amount as number }))
      }
    })
})

// 现金流量收入构成（数据来自 useFinancialData）
const cashFlowFromIncome = computed(() => {
  return Object.entries(incomeByBusinessLine.value)
    .filter(([_, stats]) => stats.revenue > 0)
    .map(([line, stats]) => {
      const config = businessLineConfig[line as keyof typeof businessLineConfig]
      return {
        name: `${config.name}收入`,
        amount: stats.revenue,
        color: config.color,
        bgColor: config.bgColor
      }
    })
})

// 现金流量支出构成（数据来自 useFinancialData）
const cashFlowFromExpense = computed(() => {
  const expenseCategories: Record<string, { color: string; bgColor: string }> = {
    'settlement': { color: '#EF4444', bgColor: '#FEE2E2' },
    'purchase': { color: '#F59E0B', bgColor: '#FEF3C7' },
    'operating': { color: '#8B5CF6', bgColor: '#F5F3FF' },
    'tax': { color: '#64748B', bgColor: '#F1F5F9' }
  }

  const categoryNames: Record<string, string> = {
    'settlement': '教练结算',
    'purchase': '产品采购',
    'operating': '运营费用',
    'tax': '税费支出'
  }

  return expenseRecords.value.map(expense => ({
    name: categoryNames[expense.category] || expense.description,
    amount: expense.amount,
    color: expenseCategories[expense.category]?.color || '#64748B',
    bgColor: expenseCategories[expense.category]?.bgColor || '#F1F5F9'
  }))
})

// 计算总资产
const totalAssets = computed(() => {
  const currentAssets = balanceSheet.value.assets.current.cash +
                        balanceSheet.value.assets.current.receivables +
                        balanceSheet.value.assets.current.inventory
  const nonCurrentAssets = balanceSheet.value.assets.nonCurrent.fixedAssets +
                           balanceSheet.value.assets.nonCurrent.accumulatedDepreciation
  return currentAssets + nonCurrentAssets
})

// 计算总负债
const totalLiabilities = computed(() => {
  return balanceSheet.value.liabilities.current.payables +
         balanceSheet.value.liabilities.current.salaries +
         balanceSheet.value.liabilities.current.other +
         balanceSheet.value.liabilities.nonCurrent.total
})

// 计算所有者权益
const totalEquity = computed(() => {
  return balanceSheet.value.equity.paidInCapital + balanceSheet.value.equity.retainedEarnings
})

// 毛利率
const grossMargin = computed(() => {
  return totalIncome.value > 0 ? (grossProfit.value / totalIncome.value * 100).toFixed(1) : '0'
})

// 净利率
const netMargin = computed(() => {
  return totalIncome.value > 0 ? (netProfit.value / totalIncome.value * 100).toFixed(1) : '0'
})

// 费用率
const expenseRate = computed(() => {
  return totalIncome.value > 0 ? (totalExpense.value / totalIncome.value * 100).toFixed(1) : '0'
})
</script>
