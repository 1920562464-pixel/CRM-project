<template>
  <div class="space-y-6">
    <!-- 医生费用计算器 -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <ShieldAlert :size="20" class="text-red-600" />
        医生上线服务费用计算
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 上线服务费 -->
        <div class="space-y-3">
          <label class="block text-sm font-medium text-slate-700">上线服务次数</label>
          <input
            v-model.number="doctorServiceCount"
            type="number"
            min="0"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="请输入服务次数"
          />
          <div class="text-sm text-slate-600">
            上线服务费：<span class="font-bold text-indigo-600">¥{{ doctorServiceFee }}</span>
          </div>
        </div>

        <!-- 销转提成 -->
        <div class="space-y-3">
          <label class="block text-sm font-medium text-slate-700">销转产品金额</label>
          <input
            v-model.number="doctorSalesAmount"
            type="number"
            min="0"
            step="100"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="请输入产品金额"
          />
          <div class="text-sm text-slate-600">
            销转提成：<span class="font-bold text-emerald-600">¥{{ doctorSalesCommission }}</span>
            <span v-if="doctorSalesAmount > 0 && doctorSalesAmount < 7000" class="text-xs text-slate-400">(仅7000元以上产品有提成)</span>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-slate-200">
        <div class="flex items-center justify-between">
          <span class="text-base font-bold text-slate-900">医生总费用：</span>
          <span class="text-xl font-bold text-indigo-600">¥{{ doctorTotalFee }}</span>
        </div>
      </div>
    </div>

    <!-- 教练/营养师费用计算器 -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Users :size="20" class="text-blue-600" />
        教练/营养师费用计算
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 服务天数 -->
        <div class="space-y-3">
          <label class="block text-sm font-medium text-slate-700">实际服务天数</label>
          <input
            v-model.number="coachServiceDays"
            type="number"
            min="1"
            max="30"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="请输入服务天数（按30天折算）"
          />
          <div class="text-xs text-slate-500">统一按30天折算，不按当月实际天数</div>
        </div>

        <!-- 服务阶段 -->
        <div class="space-y-3">
          <label class="block text-sm font-medium text-slate-700">服务阶段</label>
          <select
            v-model="coachServiceStage"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="first3months">前3个月（新用户）</option>
            <option value="after3months">3个月后（老用户）</option>
          </select>
          <div class="text-sm text-slate-600">
            月度标准：<span class="font-bold text-blue-600">¥{{ coachMonthlyRate }}</span>
          </div>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-slate-200">
        <div class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span class="text-slate-600">费用计算：</span>
            <span class="font-medium">{{ coachMonthlyRate }} × ({{ coachServiceDays }} ÷ 30)</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-base font-bold text-slate-900">教练总费用：</span>
            <span class="text-xl font-bold text-blue-600">¥{{ coachTotalFee }}</span>
          </div>
          <div class="text-xs text-slate-500 mt-2">
            * 费用四舍五入保留1位小数
          </div>
        </div>
      </div>
    </div>

    <!-- 佣金计算器 -->
    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 class="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
        <Target :size="20" class="text-green-600" />
        产品佣金计算
      </h3>

      <div class="space-y-3">
        <label class="block text-sm font-medium text-slate-700">产品价格</label>
        <div class="flex gap-4">
          <input
            v-model.number="productPrice"
            type="number"
            min="0"
            step="100"
            class="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="请输入产品价格"
          />
          <div class="flex gap-2">
            <button
              @click="setProductPrice(999)"
              class="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              999元
            </button>
            <button
              @click="setProductPrice(3188)"
              class="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              3188元
            </button>
            <button
              @click="setProductPrice(25800)"
              class="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              25800元
            </button>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-slate-200">
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-600">产品类型：</span>
              <span class="font-medium" :class="getProductTypeClass(productPrice)">
                {{ getProductTypeLabel(productPrice) }}
              </span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-slate-600">提成比例：</span>
              <span class="font-medium">{{ getCommissionRate(productPrice) }}%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-base font-bold text-slate-900">佣金金额：</span>
              <span class="text-xl font-bold text-green-600">¥{{ productCommission }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 结算条件说明 -->
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <h3 class="text-lg font-bold text-amber-900 mb-3 flex items-center gap-2">
        <AlertCircle :size="20" class="text-amber-600" />
        重要结算条件
      </h3>
      <ul class="space-y-2 text-sm text-amber-800">
        <li class="flex items-start gap-2">
          <div class="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></div>
          <span>所有结算需在<strong>3个月无退费期</strong>后才能进行</span>
        </li>
        <li class="flex items-start gap-2">
          <div class="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></div>
          <span><strong>免费赠送的服务</strong>仍需为医生/教练正常结算费用</span>
        </li>
        <li class="flex items-start gap-2">
          <div class="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></div>
          <span>中途换人按实际服务天数核算，<strong>统一按30天折算</strong></span>
        </li>
        <li class="flex items-start gap-2">
          <div class="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></div>
          <span>999元产品<strong>无佣金</strong>，仅收取管理费</span>
        </li>
        <li class="flex items-start gap-2">
          <div class="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0"></div>
          <span>医生销转提成仅限<strong>7000元以上</strong>高客单产品</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ShieldAlert, Users, Target, AlertCircle } from 'lucide-vue-next'

// 医生费用计算
const doctorServiceCount = ref(0)
const doctorSalesAmount = ref(0)

const doctorServiceFee = computed(() => {
  return doctorServiceCount.value * 200
})

const doctorSalesCommission = computed(() => {
  if (doctorSalesAmount.value >= 7000) {
    return doctorSalesAmount.value * 0.05
  }
  return 0
})

const doctorTotalFee = computed(() => {
  return doctorServiceFee.value + doctorSalesCommission.value
})

// 教练/营养师费用计算
const coachServiceDays = ref(30)
const coachServiceStage = ref<'first3months' | 'after3months'>('first3months')

const coachMonthlyRate = computed(() => {
  return coachServiceStage.value === 'first3months' ? 400 : 100
})

const coachTotalFee = computed(() => {
  const fee = coachMonthlyRate.value * (coachServiceDays.value / 30)
  return Math.round(fee * 10) / 10 // 四舍五入保留1位小数
})

// 佣金计算
const productPrice = ref(0)

const productCommission = computed(() => {
  if (productPrice.value >= 7000) {
    return productPrice.value * 0.05 // 5%
  } else if (productPrice.value >= 3000) {
    return productPrice.value * 0.02 // 2%
  }
  return 0 // 999元及以下无提成
})

const getProductTypeLabel = (price: number) => {
  if (price >= 7000) return '高端产品'
  if (price >= 3000) return '标准产品'
  return '基础产品'
}

const getProductTypeClass = (price: number) => {
  if (price >= 7000) return 'text-emerald-600'
  if (price >= 3000) return 'text-blue-600'
  return 'text-slate-600'
}

const getCommissionRate = (price: number) => {
  if (price >= 7000) return 5
  if (price >= 3000) return 2
  return 0
}

const setProductPrice = (price: number) => {
  productPrice.value = price
}
</script>
