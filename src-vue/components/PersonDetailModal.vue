<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div v-if="person" class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <!-- 头部 -->
          <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100">
            <div class="flex items-center gap-4">
              <img
                :src="person.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + person.name"
                :alt="person.name"
                class="w-14 h-14 rounded-full bg-slate-100 ring-2 ring-white shadow-md"
              />
              <div>
                <h2 class="text-xl font-bold text-slate-900">{{ person.name }}</h2>
                <div class="flex items-center gap-3 text-sm text-slate-500">
                  <span>{{ person.department }}</span>
                  <span v-if="person.position">· {{ person.position }}</span>
                </div>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="p-2 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X :size="20" class="text-slate-500" />
            </button>
          </div>

          <!-- 统计卡片 -->
          <div class="px-6 py-4 grid grid-cols-4 gap-3 border-b border-slate-200">
            <div class="bg-blue-50 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-blue-600">{{ person.totalCount }}</div>
              <div class="text-xs text-blue-500 mt-1">总报销数</div>
            </div>
            <div class="bg-indigo-50 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-indigo-600">¥{{ person.totalAmount.toLocaleString() }}</div>
              <div class="text-xs text-indigo-500 mt-1">总金额</div>
            </div>
            <div class="bg-amber-50 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-amber-600">{{ person.pendingCount }}</div>
              <div class="text-xs text-amber-500 mt-1">待审批</div>
            </div>
            <div class="bg-green-50 rounded-lg p-3 text-center">
              <div class="text-2xl font-bold text-green-600">{{ person.paidCount }}</div>
              <div class="text-xs text-green-500 mt-1">已支付</div>
            </div>
          </div>

          <!-- 筛选栏 -->
          <div class="px-6 py-3 border-b border-slate-200 bg-slate-50">
            <div class="flex items-center gap-3">
              <select
                v-model="statusFilter"
                class="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">全部状态</option>
                <option value="draft">草稿</option>
                <option value="submitted">已提交</option>
                <option value="approved">已审批</option>
                <option value="paid">已支付</option>
                <option value="rejected">已拒绝</option>
              </select>

              <select
                v-model="typeFilter"
                class="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
              >
                <option value="">全部类型</option>
                <option value="purchase">采购报销</option>
                <option value="transport">交通费</option>
                <option value="meal">餐费</option>
                <option value="training">培训费</option>
                <option value="other">其他</option>
              </select>
            </div>
          </div>

          <!-- 报销列表 -->
          <div class="flex-1 overflow-y-auto">
            <div v-if="filteredReimbursements.length > 0" class="divide-y divide-slate-100">
              <div
                v-for="item in filteredReimbursements"
                :key="item.id"
                class="px-6 py-4 hover:bg-slate-50 transition-colors"
              >
                <div class="flex items-start justify-between gap-4">
                  <!-- 左侧信息 -->
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-2">
                      <span
                        :class="`px-2 py-0.5 rounded text-xs font-semibold ${
                          item.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                          item.status === 'submitted' ? 'bg-amber-100 text-amber-700' :
                          item.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          item.status === 'paid' ? 'bg-green-100 text-green-700' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-600'
                        }`"
                      >
                        {{ getStatusName(item.status) }}
                      </span>
                      <span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                        {{ getTypeName(item.type) }}
                      </span>
                      <span class="text-xs text-slate-400">{{ item.code }}</span>
                    </div>

                    <h3 class="font-semibold text-slate-900 mb-1">{{ item.title }}</h3>
                    <p class="text-sm text-slate-500 mb-2">{{ item.description }}</p>

                    <div class="flex items-center gap-4 text-xs text-slate-400">
                      <div class="flex items-center gap-1">
                        <Calendar :size="12" />
                        {{ item.date }}
                      </div>
                      <div v-if="item.approver" class="flex items-center gap-1">
                        <User :size="12" />
                        审批人: {{ item.approver }}
                      </div>
                      <div v-if="item.approvalDate" class="flex items-center gap-1">
                        <Clock :size="12" />
                        {{ item.approvalDate }}
                      </div>
                    </div>
                  </div>

                  <!-- 右侧金额和操作 -->
                  <div class="flex flex-col items-end gap-2">
                    <div class="text-xl font-bold text-indigo-600">
                      ¥{{ item.amount.toLocaleString() }}
                    </div>

                    <div class="flex items-center gap-1">
                      <button
                        v-if="item.status === 'submitted' || item.status === 'draft'"
                        @click="$emit('approve', item.id)"
                        class="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="审批通过"
                      >
                        <CheckCircle :size="16" />
                      </button>
                      <button
                        v-if="item.status === 'submitted' || item.status === 'draft'"
                        @click="$emit('reject', item.id)"
                        class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="拒绝"
                      >
                        <XCircle :size="16" />
                      </button>
                      <button
                        v-if="item.status === 'approved'"
                        @click="$emit('pay', item.id)"
                        class="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1 text-xs font-medium transition-colors"
                      >
                        <CreditCard :size="12" />
                        支付
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 附件 -->
                <div v-if="item.attachments && item.attachments.length > 0" class="mt-3 pt-3 border-t border-slate-100">
                  <div class="flex items-center gap-2 text-xs text-slate-500">
                    <Paperclip :size="12" />
                    <span>附件: {{ item.attachments.length }} 个文件</span>
                  </div>
                </div>

                <!-- 备注 -->
                <div v-if="item.remark" class="mt-2 text-xs text-slate-500 bg-slate-50 rounded px-2 py-1">
                  备注: {{ item.remark }}
                </div>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="p-12 text-center">
              <Receipt :size="48" class="mx-auto mb-3 text-slate-300" />
              <h3 class="text-lg font-semibold text-slate-700 mb-2">暂无报销记录</h3>
              <p class="text-slate-500">当前筛选条件下没有找到报销记录</p>
            </div>
          </div>

          <!-- 底部操作栏 -->
          <div class="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <div class="text-sm text-slate-500">
              共 <strong>{{ filteredReimbursements.length }}</strong> 条记录
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="$emit('close')"
                class="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 text-sm font-medium transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>

        <!-- 无数据提示 -->
        <div v-else class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-12 text-center">
          <Receipt :size="48" class="mx-auto mb-3 text-slate-300" />
          <h3 class="text-lg font-semibold text-slate-700 mb-2">未找到数据</h3>
          <p class="text-slate-500">无法加载人员报销信息</p>
          <button
            @click="$emit('close')"
            class="mt-4 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm font-medium transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Calendar, User, Clock, CheckCircle, XCircle, CreditCard, Paperclip, Receipt } from 'lucide-vue-next'

interface ReimbursementItem {
  id: string
  code: string
  title: string
  description: string
  type: 'purchase' | 'transport' | 'meal' | 'training' | 'other'
  amount: number
  date: string
  status: 'draft' | 'submitted' | 'approved' | 'paid' | 'rejected'
  approver?: string
  approvalDate?: string
  remark?: string
  attachments?: string[]
  department: string
  personName: string
  personId: string
  avatar?: string
}

interface PersonSummary {
  id: string
  name: string
  department: string
  avatar?: string
  position?: string
  reimbursements: ReimbursementItem[]
  totalAmount: number
  pendingCount: number
  paidCount: number
  totalCount: number
}

const props = defineProps<{
  show: boolean
  person: PersonSummary | null
}>()

defineEmits<{
  'close': []
  'approve': [id: string]
  'reject': [id: string]
  'pay': [id: string]
}>()

const statusFilter = ref('')
const typeFilter = ref('')

const filteredReimbursements = computed(() => {
  let items = props.person?.reimbursements || []

  if (statusFilter.value) {
    items = items.filter(r => r.status === statusFilter.value)
  }

  if (typeFilter.value) {
    items = items.filter(r => r.type === typeFilter.value)
  }

  return items
})

const getStatusName = (status: string) => {
  const statuses: Record<string, string> = {
    draft: '草稿',
    submitted: '已提交',
    approved: '已审批',
    paid: '已支付',
    rejected: '已拒绝'
  }
  return statuses[status] || status
}

const getTypeName = (type: string) => {
  const types: Record<string, string> = {
    purchase: '采购报销',
    transport: '交通费',
    meal: '餐费',
    training: '培训费',
    other: '其他'
  }
  return types[type] || type
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
