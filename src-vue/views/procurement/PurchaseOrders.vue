<template>
  <div class="space-y-6">
    <!-- Breadcrumb with Back Button -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button
          @click="router.push('/procurement')"
          class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm"
          :style="{
            border: '1px solid var(--border)',
            background: 'var(--card)',
            color: 'var(--text-secondary)'
          }"
          @mouseenter="$event.currentTarget.style.backgroundColor = 'var(--fill-light)'"
          @mouseleave="$event.currentTarget.style.backgroundColor = 'var(--card)'"
        >
          <ArrowLeft :size="16" />
          返回
        </button>
        <div class="flex items-center gap-2 text-sm" :style="{ color: 'var(--text-secondary)' }">
          <span>采购管理</span>
          <ChevronRight :size="14" />
          <span :style="{ color: 'var(--text-primary)', fontWeight: 500 }">采购订单</span>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="rounded-2xl p-6 shadow-lg" :style="{
      background: isBlackGold.value ? 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)' : 'linear-gradient(to right, #1e293b, #0f172a)',
      color: 'white'
    }">
      <div class="flex items-center gap-3 mb-2">
        <div class="p-2 rounded-lg backdrop-blur-sm" :style="{ background: 'rgba(255, 255, 255, 0.2)' }">
          <ShoppingCart :size="24" />
        </div>
        <div>
          <h1 class="text-2xl font-bold">采购订单</h1>
          <p class="text-sm" :style="{ color: 'rgba(255, 255, 255, 0.7)' }">
            管理采购订单及入库验收
          </p>
        </div>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="rounded-xl p-4 shadow-sm" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">待确认</p>
            <p class="text-2xl font-bold mt-1 text-yellow-600">{{ stats.pending }}</p>
          </div>
          <div class="p-3 rounded-lg bg-yellow-50">
            <Clock :size="24" class="text-yellow-600" />
          </div>
        </div>
      </div>
      <div class="rounded-xl p-4 shadow-sm" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">执行中</p>
            <p class="text-2xl font-bold mt-1 text-blue-600">{{ stats.inProgress }}</p>
          </div>
          <div class="p-3 rounded-lg bg-blue-50">
            <Package :size="24" class="text-blue-600" />
          </div>
        </div>
      </div>
      <div class="rounded-xl p-4 shadow-sm" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">待入库</p>
            <p class="text-2xl font-bold mt-1 text-orange-600">{{ stats.toReceive }}</p>
          </div>
          <div class="p-3 rounded-lg bg-orange-50">
            <Download :size="24" class="text-orange-600" />
          </div>
        </div>
      </div>
      <div class="rounded-xl p-4 shadow-sm" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">本月完成</p>
            <p class="text-2xl font-bold mt-1 text-green-600">{{ stats.completed }}</p>
          </div>
          <div class="p-3 rounded-lg bg-green-50">
            <CheckCircle :size="24" class="text-green-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="rounded-xl shadow-sm p-4" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2" :size="18" :style="{ color: 'var(--text-placeholder)' }" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索订单号、供应商..."
              class="pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 w-64 text-sm"
              :style="{
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--text-primary)'
              }"
            />
          </div>
          <select
            v-model="statusFilter"
            class="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
            :style="{
              border: '1px solid var(--border)',
              background: 'var(--background)',
              color: 'var(--text-primary)'
            }"
          >
            <option value="all">全部状态</option>
            <option value="pending">待确认</option>
            <option value="confirmed">已确认</option>
            <option value="partial">部分到货</option>
            <option value="completed">已完成</option>
          </select>
        </div>
        <button
          @click="openCreateDialog"
          class="px-4 py-2 text-white rounded-lg flex items-center gap-2 text-sm"
          :style="{
            background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5'
          }"
        >
          <Plus :size="16" />
          新建订单
        </button>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="rounded-xl shadow-sm overflow-hidden" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
      <table class="w-full text-left">
        <thead :style="{
          background: 'var(--fill-light)',
          borderBottom: '1px solid var(--border)'
        }">
          <tr>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">订单号</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">供应商</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">订单金额</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">订单日期</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">交货日期</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">状态</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase text-right" :style="{ color: 'var(--text-secondary)' }">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id" :style="{ borderBottom: '1px solid var(--border-lighter)' }">
            <td class="px-6 py-4">
              <span class="font-mono text-sm font-medium" :style="{ color: 'var(--text-primary)' }">{{ order.orderNo }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" :style="{ background: 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' }">
                  {{ order.supplierName.slice(0, 2) }}
                </div>
                <span class="text-sm" :style="{ color: 'var(--text-primary)' }">{{ order.supplierName }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-sm font-medium" :style="{ color: 'var(--text-primary)' }">¥{{ formatNumber(order.totalAmount) }}</td>
            <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-secondary)' }">{{ order.orderDate }}</td>
            <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-secondary)' }">{{ order.deliveryDate }}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 rounded-full text-xs font-medium" :style="getStatusStyle(order.status)">
                {{ ORDER_STATUS_LABELS[order.status].label }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-1">
                <button
                  @click="viewOrder(order)"
                  class="p-2 rounded-lg transition-colors"
                  :style="{ color: 'var(--text-secondary)' }"
                  title="查看"
                >
                  <Eye :size="16" />
                </button>
                <button
                  v-if="order.status === 'confirmed' || order.status === 'partial'"
                  @click="openReceiptDialog(order)"
                  class="p-2 rounded-lg transition-colors"
                  :style="{ color: '#16a34a' }"
                  title="入库验收"
                >
                  <Download :size="16" />
                </button>
                <button
                  v-if="order.status === 'pending'"
                  @click="confirmOrder(order)"
                  class="p-2 rounded-lg transition-colors"
                  :style="{ color: '#4f46e5' }"
                  title="确认订单"
                >
                  <Check :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredOrders.length === 0" class="py-12 text-center" :style="{ color: 'var(--text-disabled)' }">
        <ShoppingCart :size="48" class="mx-auto mb-4 opacity-50" />
        <p>暂无采购订单</p>
      </div>
    </div>

    <!-- Receipt Dialog (入库验收) -->
    <Teleport to="body">
      <div v-if="showReceiptDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" :style="{ background: 'var(--card)' }">
          <div class="px-6 py-4 sticky top-0 z-10 flex items-center justify-between" :style="{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }">
            <div>
              <h3 class="text-lg font-bold" :style="{ color: 'var(--text-primary)' }">入库验收</h3>
              <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">{{ receivingOrder?.orderNo }}</p>
            </div>
            <button @click="showReceiptDialog = false" class="p-1 rounded-lg transition-colors" :style="{ color: 'var(--text-secondary)' }">
              <X :size="20" />
            </button>
          </div>

          <div v-if="receivingOrder" class="p-6 space-y-4">
            <!-- 供应商信息 -->
            <div class="flex items-center gap-3 p-3 rounded-lg" :style="{ background: 'var(--fill-light)' }">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white" :style="{ background: 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' }">
                {{ receivingOrder.supplierName.slice(0, 2) }}
              </div>
              <div>
                <p class="font-medium" :style="{ color: 'var(--text-primary)' }">{{ receivingOrder.supplierName }}</p>
                <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">交货日期: {{ receivingOrder.deliveryDate }}</p>
              </div>
            </div>

            <!-- 验收明细 -->
            <div>
              <p class="text-sm font-medium mb-3" :style="{ color: 'var(--text-primary)' }">验收明细</p>
              <div class="space-y-3">
                <div v-for="item in receiptItems" :key="item.productId" class="p-4 rounded-lg" :style="{ border: '1px solid var(--border)' }">
                  <div class="flex items-center justify-between mb-3">
                    <div>
                      <p class="font-medium" :style="{ color: 'var(--text-primary)' }">{{ item.productName }}</p>
                      <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">规格: {{ item.specification }} | 订单数量: {{ item.orderQuantity }}</p>
                    </div>
                    <span class="px-2 py-1 rounded text-xs font-medium" :style="{
                      background: item.receivedQuantity > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                      color: item.receivedQuantity > 0 ? '#16a34a' : '#ca8a04'
                    }">
                      已收: {{ item.receivedQuantity }}
                    </span>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="flex-1">
                      <label class="block text-xs mb-1" :style="{ color: 'var(--text-secondary)' }">本次验收数量</label>
                      <input
                        v-model.number="item.toReceive"
                        type="number"
                        :max="item.orderQuantity - item.receivedQuantity"
                        class="w-full px-3 py-2 rounded-lg text-sm"
                        :style="inputStyle"
                      />
                    </div>
                    <div class="flex-1">
                      <label class="block text-xs mb-1" :style="{ color: 'var(--text-secondary)' }">验收状态</label>
                      <select v-model="item.qualityStatus" class="w-full px-3 py-2 rounded-lg text-sm" :style="inputStyle">
                        <option value="qualified">合格</option>
                        <option value="partial">部分合格</option>
                        <option value="unqualified">不合格</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 验收备注 -->
            <div>
              <label class="block text-sm mb-2" :style="{ color: 'var(--text-secondary)' }">验收备注</label>
              <textarea v-model="receiptRemark" placeholder="如有问题请说明..." rows="3" class="w-full px-3 py-2 rounded-lg text-sm resize-none" :style="inputStyle"></textarea>
            </div>

            <!-- 库存更新提示 -->
            <div class="flex items-start gap-2 p-3 rounded-lg" :style="{ background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)' }">
              <Info :size="16" class="flex-shrink-0 mt-0.5" style="color: #16a34a" />
              <div class="text-sm">
                <p class="font-medium" style="color: #16a34a">库存自动更新</p>
                <p style="color: var(--text-secondary)">验收完成后，系统将自动增加相应商品的库存数量。</p>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 flex items-center justify-end gap-3" :style="{ borderTop: '1px solid var(--border)' }">
            <button @click="showReceiptDialog = false" class="px-4 py-2 rounded-lg text-sm" :style="{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }">取消</button>
            <button @click="confirmReceipt" class="px-4 py-2 text-white rounded-lg text-sm" :style="{ background: '#16a34a' }">确认入库</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Order Detail Dialog -->
    <Teleport to="body">
      <div v-if="showDetailDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" :style="{ background: 'var(--card)' }">
          <div class="px-6 py-4 sticky top-0 z-10 flex items-center justify-between" :style="{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }">
            <h3 class="text-lg font-bold" :style="{ color: 'var(--text-primary)' }">订单详情</h3>
            <button @click="showDetailDialog = false" class="p-1 rounded-lg transition-colors" :style="{ color: 'var(--text-secondary)' }">
              <X :size="20" />
            </button>
          </div>

          <div v-if="viewingOrder" class="p-6 space-y-6">
            <!-- 基本信息 -->
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="mb-1" :style="{ color: 'var(--text-secondary)' }">订单号</p>
                <p class="font-mono font-medium" :style="{ color: 'var(--text-primary)' }">{{ viewingOrder.orderNo }}</p>
              </div>
              <div>
                <p class="mb-1" :style="{ color: 'var(--text-secondary)' }">供应商</p>
                <p :style="{ color: 'var(--text-primary)' }">{{ viewingOrder.supplierName }}</p>
              </div>
              <div>
                <p class="mb-1" :style="{ color: 'var(--text-secondary)' }">订单日期</p>
                <p :style="{ color: 'var(--text-primary)' }">{{ viewingOrder.orderDate }}</p>
              </div>
              <div>
                <p class="mb-1" :style="{ color: 'var(--text-secondary)' }">交货日期</p>
                <p :style="{ color: 'var(--text-primary)' }">{{ viewingOrder.deliveryDate }}</p>
              </div>
              <div>
                <p class="mb-1" :style="{ color: 'var(--text-secondary)' }">付款方式</p>
                <p :style="{ color: 'var(--text-primary)' }">{{ viewingOrder.paymentTerms === 'prepaid' ? '预付款' : viewingOrder.paymentTerms === 'on_delivery' ? '到货付款' : '月结' }}</p>
              </div>
              <div>
                <p class="mb-1" :style="{ color: 'var(--text-secondary)' }">订单金额</p>
                <p class="font-bold text-lg" :style="{ color: isBlackGold.value ? '#D4A84A' : '#4f46e5' }">¥{{ formatNumber(viewingOrder.totalAmount) }}</p>
              </div>
            </div>

            <!-- 订单明细 -->
            <div>
              <p class="text-sm font-medium mb-3" :style="{ color: 'var(--text-primary)' }">订单明细</p>
              <div class="rounded-lg overflow-hidden" :style="{ border: '1px solid var(--border)' }">
                <table class="w-full text-sm text-left">
                  <thead :style="{ background: 'var(--fill-light)' }">
                    <tr>
                      <th class="px-4 py-2" :style="{ color: 'var(--text-secondary)' }">商品名称</th>
                      <th class="px-4 py-2" :style="{ color: 'var(--text-secondary)' }">规格</th>
                      <th class="px-4 py-2 text-right" :style="{ color: 'var(--text-secondary)' }">数量</th>
                      <th class="px-4 py-2 text-right" :style="{ color: 'var(--text-secondary)' }">单价</th>
                      <th class="px-4 py-2 text-right" :style="{ color: 'var(--text-secondary)' }">已收数量</th>
                      <th class="px-4 py-2 text-right" :style="{ color: 'var(--text-secondary)' }">金额</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in viewingOrder.items" :key="item.id" :style="{ borderBottom: '1px solid var(--border-lighter)' }">
                      <td class="px-4 py-2" :style="{ color: 'var(--text-primary)' }">{{ item.productName }}</td>
                      <td class="px-4 py-2" :style="{ color: 'var(--text-secondary)' }">{{ item.specification }}</td>
                      <td class="px-4 py-2 text-right" :style="{ color: 'var(--text-primary)' }">{{ item.quantity }}</td>
                      <td class="px-4 py-2 text-right" :style="{ color: 'var(--text-primary)' }">¥{{ item.unitPrice }}</td>
                      <td class="px-4 py-2 text-right" :style="{ color: 'var(--text-primary)' }">{{ item.receivedQuantity }}</td>
                      <td class="px-4 py-2 text-right font-medium" :style="{ color: 'var(--text-primary)' }">¥{{ (item.quantity * item.unitPrice).toLocaleString() }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 备注 -->
            <div v-if="viewingOrder.remark">
              <p class="text-sm font-medium mb-2" :style="{ color: 'var(--text-primary)' }">备注</p>
              <p class="text-sm rounded-lg p-3" :style="{ background: 'var(--fill-light)', color: 'var(--text-secondary)' }">{{ viewingOrder.remark }}</p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../../composables/useTheme'
import { useToast } from '../../composables/useToast'
import { useInventoryStore } from '../../composables/useInventory'
import {
  ShoppingCart,
  Search,
  Plus,
  Eye,
  X,
  CheckCircle,
  Clock,
  Check,
  Package,
  Download,
  Info,
  ChevronRight,
  ArrowLeft
} from 'lucide-vue-next'
import type { PurchaseOrder, OrderStatus } from '../../types/procurement'
import { ORDER_STATUS_LABELS } from '../../types/procurement'

const router = useRouter()
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')
const toast = useToast()
const inventoryStore = useInventoryStore()

// Filters
const searchQuery = ref('')
const statusFilter = ref<string>('all')

// Dialog states
const showReceiptDialog = ref(false)
const showDetailDialog = ref(false)
const receivingOrder = ref<PurchaseOrder | null>(null)
const viewingOrder = ref<PurchaseOrder | null>(null)

// Receipt form
const receiptItems = ref<any[]>([])
const receiptRemark = ref('')

// 组件卸载前清理
onBeforeUnmount(() => {
  // 关闭所有对话框
  showReceiptDialog.value = false
  showDetailDialog.value = false
  receivingOrder.value = null
  viewingOrder.value = null
  receiptItems.value = []
})

// Mock data
const orders = ref<PurchaseOrder[]>([
  {
    id: '1',
    orderNo: 'PO20260318001',
    supplierId: '1',
    supplierName: '北京健康科技有限公司',
    orderDate: '2026-03-18',
    deliveryDate: '2026-03-25',
    deliveryAddress: '北京市朝阳区健康路100号',
    items: [
      {
        id: '1',
        productId: 'P001',
        productName: '血糖仪',
        specification: '家用型',
        unit: '台',
        quantity: 20,
        unitPrice: 150,
        amount: 3000,
        receivedQuantity: 0,
        remark: ''
      }
    ],
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
    items: [
      {
        id: '1',
        productId: 'P002',
        productName: '血压计',
        specification: '电子上臂式',
        unit: '台',
        quantity: 10,
        unitPrice: 120,
        amount: 1200,
        receivedQuantity: 5,
        remark: ''
      }
    ],
    totalAmount: 1200,
    paymentTerms: 'monthly',
    status: 'partial',
    remark: '',
    attachments: [],
    createdBy: '李四',
    createdAt: '2026-03-17'
  }
])

// Stats
const stats = computed(() => ({
  pending: orders.value.filter(o => o.status === 'pending').length,
  inProgress: orders.value.filter(o => o.status === 'confirmed' || o.status === 'partial').length,
  toReceive: orders.value.filter(o => o.status === 'confirmed' || o.status === 'partial').reduce((sum, o) => sum + o.items.reduce((s, i) => s + (i.quantity - i.receivedQuantity), 0), 0),
  completed: orders.value.filter(o => o.status === 'completed').length
}))

// Filtered orders
const filteredOrders = computed(() => {
  return orders.value.filter(o => {
    const matchesSearch = o.orderNo.includes(searchQuery.value) || o.supplierName.includes(searchQuery.value)
    const matchesStatus = statusFilter.value === 'all' || o.status === statusFilter.value
    return matchesSearch && matchesStatus
  })
})

// Input style
const inputStyle = computed(() => ({
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--text-primary)'
}))

// Methods
const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN')
}

const getStatusStyle = (status: OrderStatus) => {
  const style = ORDER_STATUS_LABELS[status]
  return {
    background: style.color === 'green' ? 'rgba(34, 197, 94, 0.1)' :
               style.color === 'blue' ? 'rgba(59, 130, 246, 0.1)' :
               style.color === 'yellow' ? 'rgba(234, 179, 8, 0.1)' :
               style.color === 'orange' ? 'rgba(249, 115, 22, 0.1)' :
               'rgba(107, 114, 128, 0.1)',
    color: style.color === 'green' ? '#16a34a' :
           style.color === 'blue' ? '#3b82f6' :
           style.color === 'yellow' ? '#ca8a04' :
           style.color === 'orange' ? '#f97316' :
           '#6b7280'
  }
}

const openCreateDialog = () => {
  toast.info('提示', '新建订单功能开发中')
}

const viewOrder = (order: PurchaseOrder) => {
  viewingOrder.value = order
  showDetailDialog.value = true
}

const confirmOrder = (order: PurchaseOrder) => {
  order.status = 'confirmed'
  toast.success('确认成功', '订单已确认')
}

const openReceiptDialog = (order: PurchaseOrder) => {
  receivingOrder.value = order
  receiptItems.value = order.items.map(item => ({
    productId: item.productId,
    productName: item.productName,
    specification: item.specification,
    orderQuantity: item.quantity,
    receivedQuantity: item.receivedQuantity,
    toReceive: item.quantity - item.receivedQuantity,
    qualityStatus: 'qualified' as 'qualified' | 'partial' | 'unqualified'
  }))
  receiptRemark.value = ''
  showReceiptDialog.value = true
}

const confirmReceipt = () => {
  if (!receivingOrder.value) return

  const order = receivingOrder.value

  // 更新订单收货数量
  receiptItems.value.forEach(item => {
    if (item.toReceive > 0) {
      const orderItem = order.items.find(i => i.productId === item.productId)
      if (orderItem) {
        orderItem.receivedQuantity += item.toReceive

        // 更新库存 - 关键：与库存关联
        try {
          const result = inventoryStore.purchaseIn(
            item.productId,
            item.toReceive,
            order.id,
            order.orderNo,
            '当前用户',
            'U001'
          )

          if (result.success) {
            console.log(`库存已更新: ${item.productName} +${item.toReceive}`)
          } else {
            toast.error('库存更新失败', result.message || '未知错误')
          }
        } catch (error) {
          console.error('库存更新错误:', error)
        }
      }
    }
  })

  // 更新订单状态
  const allReceived = order.items.every(i => i.receivedQuantity >= i.quantity)
  const partiallyReceived = order.items.some(i => i.receivedQuantity > 0)
  order.status = allReceived ? 'completed' : partiallyReceived ? 'partial' : order.status

  toast.success('入库成功', `已完成入库，库存已自动更新`)
  showReceiptDialog.value = false
}
</script>
