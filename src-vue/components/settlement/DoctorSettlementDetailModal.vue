<template>
  <Teleport to="body">
    <div v-if="show && settlement" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <!-- 头部 -->
        <div class="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Stethoscope :size="24" class="text-white" />
            </div>
            <div class="text-white">
              <h3 class="text-lg font-bold">{{ settlement.employeeName }}的结算详情</h3>
              <p class="text-sm opacity-90">{{ settlement.period }} · {{ settlement.department || '康复医学科' }} · {{ settlement.specialty }}</p>
            </div>
          </div>
          <button @click="$emit('close')" class="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X :size="20" class="text-white" />
          </button>
        </div>

        <!-- 内容 -->
        <div class="p-6 space-y-6">
          <!-- 结算概览卡片 -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div class="text-sm text-slate-600 mb-1">结算总额</div>
              <div class="text-2xl font-bold text-indigo-600">¥{{ settlement.totalAmount.toLocaleString() }}</div>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div class="text-sm text-slate-600 mb-1">服务用户</div>
              <div class="text-2xl font-bold text-green-600">{{ settlement.totalUsers }}人</div>
            </div>
            <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
              <div class="text-sm text-slate-600 mb-1">上线服务</div>
              <div class="text-2xl font-bold text-amber-600">{{ settlement.onlineCount || 0 }}次</div>
            </div>
            <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div class="text-sm text-slate-600 mb-1">平均评分</div>
              <div class="text-2xl font-bold text-purple-600">{{ settlement.averageRating || 4.8 }}</div>
            </div>
          </div>

          <!-- 明细数据 -->
          <div class="bg-slate-50 rounded-xl p-5">
            <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 :size="18" class="text-emerald-600" />
              结算明细
            </h4>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- 新用户收入 -->
              <div class="bg-white rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-medium text-slate-700">新用户收入</span>
                  <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">¥{{ settlement.newUserRate || 500 }}/人</span>
                </div>
                <div class="flex items-end justify-between mb-2">
                  <div>
                    <div class="text-2xl font-bold text-green-600">¥{{ settlement.newUserAmount.toLocaleString() }}</div>
                    <div class="text-sm text-slate-500">{{ settlement.newUsers }} 位新用户</div>
                  </div>
                  <TrendingUp :size="20" class="text-green-500" />
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full" style="width: 70%"></div>
                </div>
              </div>

              <!-- 上线服务收入 -->
              <div class="bg-white rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-medium text-slate-700">上线服务收入</span>
                  <span class="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs font-medium">¥{{ settlement.onlineRate || 200 }}/次</span>
                </div>
                <div class="flex items-end justify-between mb-2">
                  <div>
                    <div class="text-2xl font-bold text-teal-600">¥{{ settlement.onlineAmount.toLocaleString() }}</div>
                    <div class="text-sm text-slate-500">{{ settlement.onlineCount }} 次服务</div>
                  </div>
                  <Activity :size="20" class="text-teal-500" />
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2">
                  <div class="bg-teal-500 h-2 rounded-full" style="width: 55%"></div>
                </div>
              </div>
            </div>

            <!-- 绩效奖金 -->
            <div class="bg-white rounded-lg p-4 mt-4">
              <div class="flex items-center justify-between mb-3">
                <span class="text-sm font-medium text-slate-700">服务补贴</span>
                <Target :size="18" class="text-amber-500" />
              </div>
              <div class="flex items-center justify-between">
                <div class="text-sm text-slate-500">基于服务质量和工作量综合计算</div>
                <div class="text-xs text-slate-400">已包含在总收入中</div>
              </div>
            </div>
          </div>

          <!-- 服务记录列表 -->
          <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div class="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h4 class="font-bold text-slate-900 flex items-center gap-2">
                <List :size="18" class="text-emerald-600" />
                上线服务明细
              </h4>
              <div class="flex items-center gap-2">
                <span class="text-sm text-slate-500">共 {{ serviceRecords.length }} 条服务</span>
                <button class="text-emerald-600 hover:text-emerald-800 text-sm font-medium">导出</button>
              </div>
            </div>
            <div class="max-h-64 overflow-y-auto">
              <table class="w-full">
                <thead class="bg-slate-50 sticky top-0">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-semibold text-slate-600">开始日期</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold text-slate-600">结束日期</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold text-slate-600">用户</th>
                    <th class="px-3 py-2 text-left text-xs font-semibold text-slate-600">服务类型</th>
                    <th class="px-3 py-2 text-center text-xs font-semibold text-slate-600">干预时长</th>
                    <th class="px-3 py-2 text-center text-xs font-semibold text-slate-600">评分</th>
                    <th class="px-3 py-2 text-right text-xs font-semibold text-slate-600">金额</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200">
                  <tr v-for="record in serviceRecords" :key="record.id" class="hover:bg-slate-50">
                    <td class="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">{{ record.startDate }}</td>
                    <td class="px-3 py-3 text-sm text-slate-600 whitespace-nowrap">{{ record.endDate }}</td>
                    <td class="px-3 py-3 text-sm font-medium text-slate-900 whitespace-nowrap">{{ record.userName }}</td>
                    <td class="px-3 py-3 text-sm text-slate-600">
                      <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs whitespace-nowrap">{{ record.serviceType }}</span>
                    </td>
                    <td class="px-3 py-3 text-sm text-center text-slate-600 whitespace-nowrap">{{ record.interventionDuration }}天</td>
                    <td class="px-3 py-3 text-center">
                      <div class="flex items-center justify-center gap-1">
                        <Star v-for="n in 5" :key="n" :size="12" :class="n <= record.rating ? 'text-amber-400 fill-current' : 'text-slate-300'" />
                      </div>
                    </td>
                    <td class="px-3 py-3 text-right text-sm font-medium text-slate-900 whitespace-nowrap">¥{{ record.amount }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 审批记录 -->
          <div v-if="settlement.status !== 'pending'" class="bg-slate-50 rounded-xl p-5">
            <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText :size="18" class="text-emerald-600" />
              审批记录
            </h4>
            <div class="space-y-3">
              <div class="flex items-center gap-3 text-sm">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <div class="flex-1">
                  <div class="font-medium text-slate-900">{{ settlement.status === 'paid' ? '审批通过' : '已发放' }}</div>
                  <div class="text-xs text-slate-500">{{ settlement.approvedAt || settlement.paidAt }}</div>
                </div>
              </div>
              <div v-if="settlement.status === 'paid'" class="flex items-center gap-3 text-sm">
                <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                <div class="flex-1">
                  <div class="font-medium text-slate-900">已发放</div>
                  <div class="text-xs text-slate-500">{{ settlement.paidAt }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            关闭
          </button>
          <button
            v-if="settlement.status === 'pending'"
            @click="$emit('approve', settlement.id)"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors"
          >
            <CheckCircle :size="18" />
            审批通过
          </button>
          <button
            v-if="settlement.status === 'approved'"
            @click="$emit('pay', settlement.id)"
            class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 font-medium transition-colors"
          >
            <CreditCard :size="18" />
            确认发放
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Stethoscope, X, BarChart3, TrendingUp, Activity, Target, List, Star, CheckCircle, FileText, CreditCard } from 'lucide-vue-next'

interface ServiceRecord {
  id: string
  startDate: string
  endDate: string
  userName: string
  userId: string
  serviceType: string
  interventionDuration: number
  rating: number
  amount: number
}

interface DoctorSettlementRecord {
  id: string
  employeeId: string
  employeeName: string
  period: string
  totalUsers: number
  newUsers: number
  oldUsers: number
  newUserAmount: number
  onlineCount: number
  onlineAmount: number
  totalAmount: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  department?: string
  specialty?: string
  newUserRate?: number
  onlineRate?: number
  serviceCount?: number
  averageRating?: number
  orderCount?: number
  createdAt: string
  approvedAt?: string
  paidAt?: string
  serviceRecords?: ServiceRecord[]
}

const props = defineProps<{
  show: boolean
  settlement: DoctorSettlementRecord | null
}>()

const emit = defineEmits<{
  'close': []
  'approve': [id: string]
  'pay': [id: string]
}>()

// 使用传入的真实服务记录数据，如果没有则生成模拟数据
const serviceRecords = computed<ServiceRecord[]>(() => {
  // 如果结算单已包含服务记录，直接使用
  if (props.settlement.serviceRecords && props.settlement.serviceRecords.length > 0) {
    return props.settlement.serviceRecords
  }

  // 否则生成模拟数据（向后兼容）
  const records: ServiceRecord[] = []
  const userNames = ['张女士', '李先生', '王女士', '赵先生', '刘女士', '陈先生']
  const serviceTypes = ['康复评估', '运动指导', '康复训练', '健康咨询', '神经康复', '心肺康复', '脊柱矫正', '产后康复']

  const count = props.settlement.onlineCount || props.settlement.totalUsers

  for (let i = 0; i < Math.min(count, 10); i++) {
    // 生成开始日期（当月1-25日）
    const startDay = Math.floor(Math.random() * 25) + 1
    const startDate = `${props.settlement.period}-${String(startDay).padStart(2, '0')}`

    // 生成干预时长（14-90天）
    const interventionDuration = Math.floor(Math.random() * 77) + 14

    // 计算结束日期
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(startDateObj)
    endDateObj.setDate(startDateObj.getDate() + interventionDuration)
    const endDate = endDateObj.toISOString().split('T')[0]

    records.push({
      id: `DSR${props.settlement.id}-${i}`,
      startDate,
      endDate,
      userName: userNames[i % userNames.length],
      userId: `DU${i + 1}`,
      serviceType: serviceTypes[i % serviceTypes.length],
      interventionDuration,
      rating: Math.floor(4 + Math.random() * 1.5),
      amount: 200
    })
  }

  return records
})
</script>
