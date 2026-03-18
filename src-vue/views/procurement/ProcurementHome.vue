<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="rounded-2xl p-6 shadow-lg" :style="{
      background: isBlackGold.value ? 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)' : 'linear-gradient(to right, #1e293b, #0f172a)',
      color: 'white'
    }">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg backdrop-blur-sm" :style="{ background: 'rgba(255, 255, 255, 0.2)' }">
          <ShoppingCart :size="28" />
        </div>
        <div>
          <h1 class="text-2xl font-bold">采购管理</h1>
          <p class="text-sm" :style="{ color: 'rgba(255, 255, 255, 0.7)' }">
            供应商管理 · 采购申请 · 采购订单 · 入库验收
          </p>
        </div>
      </div>
    </div>

    <!-- Overview Stats -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
      <div class="rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }" @click="router.push('/procurement/suppliers')">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">供应商总数</p>
          <Building2 :size="18" :style="{ color: isBlackGold.value ? '#D4A84A' : '#4f46e5' }" />
        </div>
        <p class="text-3xl font-bold" :style="{ color: 'var(--text-primary)' }">{{ stats.suppliers }}</p>
        <p class="text-xs mt-1" :style="{ color: 'var(--text-disabled)' }">点击查看 →</p>
      </div>

      <div class="rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }" @click="router.push('/procurement/purchase-request')">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">待审批申请</p>
          <FileText :size="18" class="text-yellow-600" />
        </div>
        <p class="text-3xl font-bold text-yellow-600">{{ stats.pendingRequests }}</p>
        <p class="text-xs mt-1" :style="{ color: 'var(--text-disabled)' }">点击查看 →</p>
      </div>

      <div class="rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }" @click="router.push('/procurement/purchase-orders')">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">执行中订单</p>
          <Package :size="18" class="text-blue-600" />
        </div>
        <p class="text-3xl font-bold text-blue-600">{{ stats.activeOrders }}</p>
        <p class="text-xs mt-1" :style="{ color: 'var(--text-disabled)' }">点击查看 →</p>
      </div>

      <div class="rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }" @click="router.push('/procurement/purchase-orders')">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">待入库</p>
          <Download :size="18" class="text-orange-600" />
        </div>
        <p class="text-3xl font-bold text-orange-600">{{ stats.toReceive }}</p>
        <p class="text-xs mt-1" :style="{ color: 'var(--text-disabled)' }">点击查看 →</p>
      </div>

      <div class="rounded-xl p-4 shadow-sm cursor-pointer transition-all hover:shadow-md" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
        <div class="flex items-center justify-between mb-2">
          <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">本月采购额</p>
          <DollarSign :size="18" class="text-green-600" />
        </div>
        <p class="text-3xl font-bold text-green-600">¥{{ formatNumber(stats.monthlyAmount) }}</p>
        <p class="text-xs mt-1" :style="{ color: 'var(--text-disabled)' }">本月统计</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="rounded-xl shadow-sm p-6" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
      <h2 class="text-lg font-bold mb-4" :style="{ color: 'var(--text-primary)' }">快捷操作</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          @click="router.push('/procurement/purchase-request')"
          class="p-4 rounded-xl text-left transition-all hover:shadow-md"
          :style="{
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(79, 70, 229, 0.02) 100%)',
            border: '1px solid rgba(79, 70, 229, 0.15)'
          }"
        >
          <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-3" :style="{ background: 'rgba(79, 70, 229, 0.15)' }">
            <FilePlus :size="20" :style="{ color: '#4f46e5' }" />
          </div>
          <p class="font-medium mb-1" :style="{ color: 'var(--text-primary)' }">新建采购申请</p>
          <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">创建新的采购申请单</p>
        </button>

        <button
          @click="router.push('/procurement/purchase-orders')"
          class="p-4 rounded-xl text-left transition-all hover:shadow-md"
          :style="{
            background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.02) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.15)'
          }"
        >
          <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-3" :style="{ background: 'rgba(34, 197, 94, 0.15)' }">
            <ShoppingCart :size="20" class="text-green-600" />
          </div>
          <p class="font-medium mb-1" :style="{ color: 'var(--text-primary)' }">查看采购订单</p>
          <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">管理和跟踪采购订单</p>
        </button>

        <button
          @click="router.push('/procurement/suppliers')"
          class="p-4 rounded-xl text-left transition-all hover:shadow-md"
          :style="{
            background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 100%)',
            border: '1px solid rgba(249, 115, 22, 0.15)'
          }"
        >
          <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-3" :style="{ background: 'rgba(249, 115, 22, 0.15)' }">
            <Building2 :size="20" class="text-orange-600" />
          </div>
          <p class="font-medium mb-1" :style="{ color: 'var(--text-primary)' }">管理供应商</p>
          <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">供应商信息与合作记录</p>
        </button>

        <button
          @click="router.push('/inventory-management')"
          class="p-4 rounded-xl text-left transition-all hover:shadow-md"
          :style="{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.15)'
          }"
        >
          <div class="w-10 h-10 rounded-lg flex items-center justify-center mb-3" :style="{ background: 'rgba(59, 130, 246, 0.15)' }">
            <Package :size="20" class="text-blue-600" />
          </div>
          <p class="font-medium mb-1" :style="{ color: 'var(--text-primary)' }">查看库存</p>
          <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">商品库存与流水记录</p>
        </button>
      </div>
    </div>

    <!-- Recent Activities & Pending Tasks -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Recent Orders -->
      <div class="rounded-xl shadow-sm" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
        <div class="p-4 flex items-center justify-between" :style="{ borderBottom: '1px solid var(--border)' }">
          <h3 class="font-semibold" :style="{ color: 'var(--text-primary)' }">最新采购订单</h3>
          <button @click="router.push('/procurement/purchase-orders')" class="text-sm" :style="{ color: isBlackGold.value ? '#D4A84A' : '#4f46e5' }">查看全部</button>
        </div>
        <div class="p-4 space-y-3">
          <div v-for="order in recentOrders" :key="order.id" class="flex items-center gap-3 p-3 rounded-lg" :style="{ background: 'var(--fill-light)' }">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold" :style="{ background: 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' }">
              {{ order.supplierName.slice(0, 2) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm truncate" :style="{ color: 'var(--text-primary)' }">{{ order.supplierName }}</p>
              <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">{{ order.orderNo }}</p>
            </div>
            <div class="text-right">
              <p class="font-medium text-sm" :style="{ color: 'var(--text-primary)' }">¥{{ formatNumber(order.totalAmount) }}</p>
              <span class="text-xs px-2 py-0.5 rounded" :style="getStatusStyle(order.status)">{{ getStatusLabel(order.status) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Requests -->
      <div class="rounded-xl shadow-sm" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
        <div class="p-4 flex items-center justify-between" :style="{ borderBottom: '1px solid var(--border)' }">
          <h3 class="font-semibold" :style="{ color: 'var(--text-primary)' }">待审批申请</h3>
          <button @click="router.push('/procurement/purchase-request')" class="text-sm" :style="{ color: isBlackGold.value ? '#D4A84A' : '#4f46e5' }">查看全部</button>
        </div>
        <div class="p-4 space-y-3">
          <div v-for="request in pendingRequests" :key="request.id" class="flex items-center gap-3 p-3 rounded-lg" :style="{ background: 'var(--fill-light)' }">
            <div class="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold" :style="{ background: 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' }">
              {{ request.requester.slice(0, 1) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-sm truncate" :style="{ color: 'var(--text-primary)' }">{{ request.requester }} · {{ request.department }}</p>
              <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">{{ request.requestNo }}</p>
            </div>
            <div class="text-right">
              <p class="font-medium text-sm" :style="{ color: 'var(--text-primary)' }">¥{{ formatNumber(request.totalBudget) }}</p>
              <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">{{ request.requestDate }}</p>
            </div>
          </div>
          <div v-if="pendingRequests.length === 0" class="text-center py-8" :style="{ color: 'var(--text-disabled)' }">
            <CheckCircle :size="32" class="mx-auto mb-2 opacity-50" />
            <p class="text-sm">暂无待审批申请</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../../composables/useTheme'
import {
  ShoppingCart,
  FileText,
  FilePlus,
  Building2,
  Package,
  Download,
  DollarSign,
  CheckCircle
} from 'lucide-vue-next'
import type { PurchaseOrder, OrderStatus } from '../../types/procurement'
import { ORDER_STATUS_LABELS } from '../../types/procurement'

const router = useRouter()
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')

// Mock stats
const stats = ref({
  suppliers: 4,
  pendingRequests: 2,
  activeOrders: 3,
  toReceive: 15,
  monthlyAmount: 85000
})

// Mock recent orders
const recentOrders = ref<PurchaseOrder[]>([
  {
    id: '1',
    orderNo: 'PO20260318001',
    supplierId: '1',
    supplierName: '北京健康科技有限公司',
    orderDate: '2026-03-18',
    deliveryDate: '2026-03-25',
    deliveryAddress: '北京市朝阳区健康路100号',
    items: [],
    totalAmount: 3000,
    paymentTerms: 'on_delivery',
    status: 'confirmed',
    remark: '',
    attachments: [],
    createdBy: '张三',
    createdAt: '2026-03-18'
  },
  {
    id: '2',
    orderNo: 'PO20260317001',
    supplierId: '2',
    supplierName: '上海医疗器械有限公司',
    orderDate: '2026-03-17',
    deliveryDate: '2026-03-22',
    deliveryAddress: '上海市浦东新区张江高科技园区',
    items: [],
    totalAmount: 1200,
    paymentTerms: 'monthly',
    status: 'partial',
    remark: '',
    attachments: [],
    createdBy: '李四',
    createdAt: '2026-03-17'
  },
  {
    id: '3',
    orderNo: 'PO20260316001',
    supplierId: '3',
    supplierName: '广州营养食品有限公司',
    orderDate: '2026-03-16',
    deliveryDate: '2026-03-20',
    deliveryAddress: '广州市天河区体育西路',
    items: [],
    totalAmount: 5600,
    paymentTerms: 'prepaid',
    status: 'pending',
    remark: '',
    attachments: [],
    createdBy: '王五',
    createdAt: '2026-03-16'
  }
])

// Mock pending requests
const pendingRequests = ref([
  {
    id: '1',
    requestNo: 'PR20260318001',
    requester: '张三',
    requesterId: 'U001',
    department: '运营部',
    requestDate: '2026-03-18',
    type: 'normal',
    items: [],
    totalBudget: 1500,
    purpose: '门店销售使用',
    status: 'pending',
    createdAt: '2026-03-18'
  },
  {
    id: '2',
    requestNo: 'PR20260317002',
    requester: '李四',
    requesterId: 'U002',
    department: '市场部',
    requestDate: '2026-03-17',
    type: 'urgent',
    items: [],
    totalBudget: 2800,
    purpose: '活动促销急需',
    status: 'pending',
    createdAt: '2026-03-17'
  }
])

const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN')
}

const getStatusStyle = (status: OrderStatus) => {
  const style = ORDER_STATUS_LABELS[status]
  return {
    background: style.color === 'green' ? 'rgba(34, 197, 94, 0.15)' :
               style.color === 'blue' ? 'rgba(59, 130, 246, 0.15)' :
               style.color === 'yellow' ? 'rgba(234, 179, 8, 0.15)' :
               'rgba(107, 114, 128, 0.15)',
    color: style.color === 'green' ? '#16a34a' :
           style.color === 'blue' ? '#3b82f6' :
           style.color === 'yellow' ? '#ca8a04' :
           '#6b7280'
  }
}

const getStatusLabel = (status: OrderStatus) => {
  return ORDER_STATUS_LABELS[status].label
}
</script>
