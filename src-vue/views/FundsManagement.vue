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

    <!-- 统计概览 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg shadow-indigo-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">账户总额</span>
          <Wallet :size="20" />
        </div>
        <div class="text-3xl font-bold">¥{{ statistics.totalBalance.toLocaleString() }}</div>
        <div class="text-xs opacity-75 mt-2">{{ statistics.accountCount }} 个账户</div>
      </div>

      <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg shadow-green-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">今日收入</span>
          <TrendingUp :size="20" />
        </div>
        <div class="text-3xl font-bold">¥{{ statistics.todayIncome.toLocaleString() }}</div>
        <div class="text-xs opacity-75 mt-2">资金流入</div>
      </div>

      <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-5 text-white shadow-lg shadow-red-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">今日支出</span>
          <CreditCard :size="20" />
        </div>
        <div class="text-3xl font-bold">¥{{ statistics.todayExpense.toLocaleString() }}</div>
        <div class="text-xs opacity-75 mt-2">资金流出</div>
      </div>

      <div class="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-5 text-white shadow-lg shadow-cyan-200">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium opacity-90">本月流水</span>
          <BarChart3 :size="20" />
        </div>
        <div class="text-3xl font-bold">{{ statistics.transactionCount }}</div>
        <div class="text-xs opacity-75 mt-2">笔交易</div>
      </div>
    </div>

    <!-- Tab 导航 -->
    <div class="flex items-center gap-2 border-b border-slate-200">
      <button
        @click="activeTab = 'accounts'"
        class="px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
        :class="activeTab === 'accounts'
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'"
      >
        <Building :size="16" />
        账户管理
      </button>
      <button
        @click="activeTab = 'transactions'"
        class="px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
        :class="activeTab === 'transactions'
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'"
      >
        <FileText :size="16" />
        资金流水
      </button>
      <button
        @click="activeTab = 'transfer'"
        class="px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2"
        :class="activeTab === 'transfer'
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'"
      >
        <ArrowUpDown :size="16" />
        资金调拨
      </button>
    </div>

    <!-- 内容区域 -->
    <div v-if="activeTab === 'accounts'" class="bg-white rounded-xl border border-slate-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold text-slate-900">银行账户</h3>
        <div class="flex items-center gap-3">
          <button
            @click="showTransferModal = true"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <ArrowUpDown :size="16" />
            资金调拨
          </button>
          <button
            @click="openAccountModal()"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <Plus :size="16" />
            添加账户
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="account in accounts" :key="account.id" class="p-5 border border-slate-200 rounded-xl hover:shadow-md transition-all relative group">
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="p-2 rounded-lg" :class="{
                'bg-indigo-100': account.type === 'bank',
                'bg-blue-100': account.type === 'alipay',
                'bg-green-100': account.type === 'wechat',
                'bg-slate-100': account.type === 'cash'
              }">
                <Building :size="20" :class="account.type === 'bank' ? 'text-indigo-600' : 'text-slate-600'" />
              </div>
              <div>
                <div class="font-bold text-slate-900">{{ account.name }}</div>
                <div class="text-xs text-slate-500 mt-0.5">{{ account.typeLabel }}</div>
              </div>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="openAccountModal(account)" class="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                <Edit :size="14" />
              </button>
              <button @click="deleteAccount(account.id)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 :size="14" />
              </button>
            </div>
            <span v-if="account.status === 'active'" class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">正常</span>
          </div>
          <div class="text-xs text-slate-500 mb-2">账号: {{ account.accountNo }}</div>
          <div class="flex items-end justify-between">
            <div>
              <div class="text-xs text-slate-600">账户余额</div>
              <div class="text-2xl font-bold text-indigo-600">¥{{ account.balance.toLocaleString() }}</div>
            </div>
            <div class="text-xs text-slate-500">{{ account.currency }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'transactions'" class="bg-white rounded-xl border border-slate-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-slate-900">资金流水</h3>
        <button @click="exportTransactions" class="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 text-sm hover:bg-indigo-700 transition-colors">
          <Download :size="16" />
          导出
        </button>
      </div>

      <!-- 筛选栏 -->
      <div class="mb-4 flex items-center gap-3">
        <select
          v-model="txnFilter.accountId"
          class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
        >
          <option value="all">所有账户</option>
          <option v-for="acc in accounts" :key="acc.id" :value="acc.id">{{ acc.name }}</option>
        </select>

        <select
          v-model="txnFilter.type"
          class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
        >
          <option value="all">所有类型</option>
          <option value="income">收入</option>
          <option value="expense">支出</option>
          <option value="transfer">转账</option>
        </select>
      </div>

      <table class="w-full">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">时间</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">账户</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">类型</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">关联业务</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">金额</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">余额</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">操作人</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="txn in filteredTransactions" :key="txn.id" class="hover:bg-slate-50">
            <td class="px-6 py-4 text-sm text-slate-600">{{ txn.createdAt }}</td>
            <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ txn.accountName }}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 rounded text-xs font-medium" :class="{
                'bg-green-100 text-green-800': txn.type === 'income',
                'bg-red-100 text-red-800': txn.type === 'expense',
                'bg-blue-100 text-blue-800': txn.type === 'transfer'
              }">
                {{ txn.typeLabel }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-slate-600">{{ txn.relatedDesc || '-' }}</td>
            <td class="px-6 py-4 text-right font-semibold text-slate-900">¥{{ txn.amount.toLocaleString() }}</td>
            <td class="px-6 py-4 text-right text-sm text-slate-600">¥{{ txn.balance.toLocaleString() }}</td>
            <td class="px-6 py-4 text-sm text-slate-600">{{ txn.operator }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="activeTab === 'transfer'" class="bg-white rounded-xl border border-slate-200 p-12 text-center">
      <button
        @click="showTransferModal = true"
        class="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium shadow-lg mx-auto"
      >
        <ArrowUpDown :size="20" />
        发起转账
      </button>
      <p class="text-slate-500 mt-4">在账户之间进行资金调拨</p>
    </div>

    <!-- 账户模态框 -->
    <Teleport to="body">
      <div v-if="showAccountModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">
              {{ selectedAccount ? '编辑账户' : '添加账户' }}
            </h3>
            <button @click="closeAccountModal" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" class="text-slate-500" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">账户名称 *</label>
              <input
                v-model="accountFormData.name"
                type="text"
                placeholder="请输入账户名称"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">账户类型</label>
              <select
                v-model="accountFormData.type"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="bank">银行账户</option>
                <option value="alipay">支付宝</option>
                <option value="wechat">微信支付</option>
                <option value="cash">现金</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">账号 *</label>
              <input
                v-model="accountFormData.accountNo"
                type="text"
                placeholder="请输入账号"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">初始余额 *</label>
              <input
                v-model="accountFormData.balance"
                type="number"
                placeholder="请输入初始余额"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="closeAccountModal" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="saveAccount" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
              保存
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 转账模态框 -->
    <Teleport to="body">
      <div v-if="showTransferModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">资金调拨</h3>
            <button @click="showTransferModal = false" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" class="text-slate-500" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">转出账户</label>
              <select
                v-model="transferFormData.fromAccountId"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                  {{ acc.name }} (余额: ¥{{ acc.balance.toLocaleString() }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">转入账户</label>
              <select
                v-model="transferFormData.toAccountId"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option v-for="acc in accounts.filter(a => a.id !== transferFormData.fromAccountId)" :key="acc.id" :value="acc.id">
                  {{ acc.name }} (余额: ¥{{ acc.balance.toLocaleString() }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">转账金额 *</label>
              <input
                v-model="transferFormData.amount"
                type="number"
                placeholder="请输入转账金额"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
              <textarea
                v-model="transferFormData.remark"
                placeholder="请输入备注信息"
                rows="2"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="showTransferModal = false" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="processTransfer" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
              确认转账
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Plus,
  Search,
  Download,
  Building,
  ArrowUpDown,
  TrendingUp,
  Calendar,
  CheckCircle,
  FileText,
  Wallet,
  CreditCard,
  RefreshCw,
  BarChart3,
  Filter,
  Edit,
  Trash2,
  Eye,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-vue-next'
import { useToast } from '../composables/useToast'
import ConfirmDialog from '../components/shared/ConfirmDialog.vue'

interface Account {
  id: string
  name: string
  type: 'bank' | 'alipay' | 'wechat' | 'cash'
  typeLabel: string
  accountNo: string
  balance: number
  currency: string
  status: 'active' | 'frozen'
}

interface Transaction {
  id: string
  accountId: string
  accountName: string
  type: 'income' | 'expense' | 'transfer'
  typeLabel: string
  amount: number
  balance: number
  relatedId?: string
  relatedDesc?: string
  createdAt: string
  operator: string
}

type TabType = 'accounts' | 'transactions' | 'transfer'

const activeTab = ref<TabType>('accounts')
const showAccountModal = ref(false)
const showTransferModal = ref(false)
const selectedAccount = ref<Account | null>(null)

// 资金流水筛选
const txnFilter = ref({
  accountId: 'all',
  type: 'all'
})

const { toast: toastFunc } = useToast()

const confirm = ref({
  show: false,
  title: '',
  message: '',
  type: 'warning' as 'warning' | 'danger',
  onConfirm: () => {},
  onCancel: () => {}
})

const accountFormData = ref({
  name: '',
  type: 'bank' as Account['type'],
  accountNo: '',
  balance: '',
  currency: 'CNY'
})

const transferFormData = ref({
  fromAccountId: '',
  toAccountId: '',
  amount: '',
  remark: ''
})

const accounts = ref<Account[]>([
  {
    id: 'ACC001',
    name: '工商银行主账户',
    type: 'bank',
    typeLabel: '银行账户',
    accountNo: '6212************456',
    balance: 423800,
    currency: 'CNY',
    status: 'active'
  },
  {
    id: 'ACC002',
    name: '建设银行',
    type: 'bank',
    typeLabel: '银行账户',
    accountNo: '6217************789',
    balance: 100000,
    currency: 'CNY',
    status: 'active'
  },
  {
    id: 'ACC003',
    name: '支付宝',
    type: 'alipay',
    typeLabel: '第三方支付',
    accountNo: '138****1234',
    balance: 25600,
    currency: 'CNY',
    status: 'active'
  }
])

const transactions = ref<Transaction[]>([
  {
    id: 'TXN001',
    accountId: 'ACC001',
    accountName: '工商银行主账户',
    type: 'income',
    typeLabel: '收入',
    amount: 5000,
    balance: 428800,
    relatedDesc: '会员充值',
    createdAt: '2024-02-15 14:30:00',
    operator: '系统'
  },
  {
    id: 'TXN002',
    accountId: 'ACC001',
    accountName: '工商银行主账户',
    type: 'expense',
    typeLabel: '支出',
    amount: 8100,
    balance: 423800,
    relatedId: 'AP001',
    relatedDesc: '教练结算-张教练',
    createdAt: '2024-02-15 11:20:00',
    operator: '管理员'
  },
  {
    id: 'TXN003',
    accountId: 'ACC002',
    accountName: '建设银行',
    type: 'expense',
    typeLabel: '支出',
    amount: 12500,
    balance: 100000,
    relatedId: 'AP003',
    relatedDesc: '库存采购-营养品供应商A',
    createdAt: '2024-02-14 16:50:00',
    operator: '采购部'
  }
])

const statistics = computed(() => {
  const totalBalance = accounts.value.reduce((sum, acc) => sum + acc.balance, 0)
  const todayIncome = transactions.value
    .filter(t => t.type === 'income' && t.createdAt.startsWith('2024-02-15'))
    .reduce((sum, t) => sum + t.amount, 0)
  const todayExpense = transactions.value
    .filter(t => t.type === 'expense' && t.createdAt.startsWith('2024-02-15'))
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    totalBalance,
    todayIncome,
    todayExpense,
    accountCount: accounts.value.length,
    transactionCount: transactions.value.length
  }
})

// 过滤后的资金流水
const filteredTransactions = computed(() => {
  return transactions.value.filter(txn => {
    const matchAccount = txnFilter.value.accountId === 'all' || txn.accountId === txnFilter.value.accountId
    const matchType = txnFilter.value.type === 'all' || txn.type === txnFilter.value.type
    return matchAccount && matchType
  })
})

const openAccountModal = (account?: Account) => {
  if (account) {
    selectedAccount.value = account
    accountFormData.value = {
      name: account.name,
      type: account.type,
      accountNo: account.accountNo,
      balance: String(account.balance),
      currency: account.currency
    }
  } else {
    selectedAccount.value = null
    accountFormData.value = {
      name: '',
      type: 'bank',
      accountNo: '',
      balance: '',
      currency: 'CNY'
    }
  }
  showAccountModal.value = true
}

const closeAccountModal = () => {
  showAccountModal.value = false
  selectedAccount.value = null
}

const saveAccount = () => {
  if (!accountFormData.value.name || !accountFormData.value.accountNo || !accountFormData.value.balance) {
    toastFunc.error('请填写必填项')
    return
  }

  if (selectedAccount.value) {
    accounts.value = accounts.value.map(acc =>
      acc.id === selectedAccount.value!.id
        ? {
            ...acc,
            name: accountFormData.value.name,
            type: accountFormData.value.type,
            typeLabel: accountFormData.value.type === 'bank' ? '银行账户' : accountFormData.value.type === 'alipay' ? '第三方支付' : accountFormData.value.type === 'wechat' ? '微信支付' : '现金',
            accountNo: accountFormData.value.accountNo,
            balance: parseFloat(accountFormData.value.balance),
            currency: accountFormData.value.currency
          }
        : acc
    )
    toastFunc.success('更新成功', `账户 "${accountFormData.value.name}" 已更新`)
  } else {
    const newAccount: Account = {
      id: `ACC${Date.now()}`,
      name: accountFormData.value.name,
      type: accountFormData.value.type,
      typeLabel: accountFormData.value.type === 'bank' ? '银行账户' : accountFormData.value.type === 'alipay' ? '第三方支付' : accountFormData.value.type === 'wechat' ? '微信支付' : '现金',
      accountNo: accountFormData.value.accountNo,
      balance: parseFloat(accountFormData.value.balance),
      currency: accountFormData.value.currency,
      status: 'active'
    }
    accounts.value.push(newAccount)
    toastFunc.success('添加成功', `账户 "${accountFormData.value.name}" 已添加`)
  }

  showAccountModal.value = false
  selectedAccount.value = null
}

const deleteAccount = (id: string) => {
  const account = accounts.value.find(acc => acc.id === id)
  if (!account) return

  confirm.value = {
    show: true,
    title: '删除账户',
    message: `确定要删除账户 "${account.name}" 吗？此操作不可恢复。`,
    type: 'danger',
    onConfirm: () => {
      accounts.value = accounts.value.filter(acc => acc.id !== id)
      toastFunc.success('删除成功', `账户 "${account.name}" 已删除`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const processTransfer = () => {
  if (!transferFormData.value.amount || parseFloat(transferFormData.value.amount) <= 0) {
    toastFunc.error('请输入有效的转账金额')
    return
  }

  if (transferFormData.value.fromAccountId === transferFormData.value.toAccountId) {
    toastFunc.error('转账失败', '不能转到同一账户')
    return
  }

  const amount = parseFloat(transferFormData.value.amount)
  const fromAccount = accounts.value.find(acc => acc.id === transferFormData.value.fromAccountId)
  const toAccount = accounts.value.find(acc => acc.id === transferFormData.value.toAccountId)

  if (!fromAccount || !toAccount) {
    toastFunc.error('账户不存在')
    return
  }

  if (fromAccount.balance < amount) {
    toastFunc.error('余额不足', `"${fromAccount.name}" 余额不足，当前余额 ¥${fromAccount.balance.toLocaleString()}`)
    return
  }

  confirm.value = {
    show: true,
    title: '确认转账',
    message: `从 "${fromAccount.name}" 转账 ¥${amount.toLocaleString()} 到 "${toAccount.name}" 吗？`,
    type: 'warning',
    onConfirm: () => {
      // 更新账户余额
      accounts.value = accounts.value.map(acc => {
        if (acc.id === transferFormData.value.fromAccountId) {
          return { ...acc, balance: acc.balance - amount }
        }
        if (acc.id === transferFormData.value.toAccountId) {
          return { ...acc, balance: acc.balance + amount }
        }
        return acc
      })

      // 添加转账记录
      const newTransaction: Transaction = {
        id: `TXN${Date.now()}`,
        accountId: fromAccount.id,
        accountName: fromAccount.name,
        type: 'transfer',
        typeLabel: '转账',
        amount,
        balance: fromAccount.balance - amount,
        relatedDesc: `转账到 ${toAccount.name}`,
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
        operator: '管理员'
      }
      transactions.value.unshift(newTransaction)

      showTransferModal.value = false
      toastFunc.success('转账成功', `已成功转账 ¥${amount.toLocaleString()} 到 "${toAccount.name}"`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

// 导出资金流水
const exportTransactions = () => {
  toastFunc.info('导出中', '正在导出资金流水...')

  try {
    const exportData = filteredTransactions.value.map(txn => ({
      '流水号': txn.id,
      '交易时间': txn.createdAt,
      '账户名称': txn.accountName,
      '交易类型': txn.typeLabel,
      '交易金额': txn.amount,
      '账户余额': txn.balance,
      '关联业务': txn.relatedDesc || '-',
      '关联单号': txn.relatedId || '-',
      '操作人': txn.operator
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)

    ws['!cols'] = [
      { wch: 15 }, // 流水号
      { wch: 20 }, // 交易时间
      { wch: 15 }, // 账户名称
      { wch: 10 }, // 交易类型
      { wch: 12 }, // 交易金额
      { wch: 12 }, // 账户余额
      { wch: 20 }, // 关联业务
      { wch: 15 }, // 关联单号
      { wch: 12 }  // 操作人
    ]

    XLSX.utils.book_append_sheet(wb, ws, '资金流水')

    const fileName = `资金流水_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)

    toastFunc.success('导出成功', `已导出 ${filteredTransactions.value.length} 条流水记录`)
  } catch (error) {
    console.error('导出失败:', error)
    toastFunc.error('导出失败', '导出资金流水时发生错误')
  }
}
</script>
