<template>
  <div class="p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">硬件设备管理</h2>
        <p class="text-sm text-slate-500 mt-1">管理用户绑定的健康监测设备</p>
      </div>
      <button
        @click="showAddDeviceModal = true"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
      >
        <Plus :size="18" />
        添加设备
      </button>
    </div>

    <!-- 设备分类统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div v-for="category in deviceCategories" :key="category.id" class="bg-white rounded-xl p-4 border border-slate-200">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center" :style="{ background: category.color }">
            <component :is="category.icon" :size="24" class="text-white" />
          </div>
          <div class="flex-1">
            <p class="text-sm text-slate-500">{{ category.name }}</p>
            <p class="text-2xl font-bold text-slate-800">{{ category.count }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 设备列表 -->
    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <h3 class="text-lg font-semibold text-slate-800">设备列表</h3>
      </div>

      <div class="divide-y divide-slate-100">
        <div
          v-for="device in devices"
          :key="device.id"
          class="p-4 hover:bg-slate-50 transition-colors"
        >
          <div class="flex items-start gap-4">
            <!-- 设备图标 -->
            <div class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" :style="{ background: getDeviceColor(device.type) }">
              <component :is="getDeviceIcon(device.type)" :size="24" class="text-white" />
            </div>

            <!-- 设备信息 -->
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h4 class="text-lg font-semibold text-slate-800">{{ device.name }}</h4>
                <span
                  v-if="device.isDamaged"
                  class="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full flex items-center gap-1"
                >
                  <AlertTriangle :size="12" />
                  已损坏
                </span>
                <span
                  v-else
                  class="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full"
                >
                  正常
                </span>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p class="text-slate-500">设备类型</p>
                  <p class="font-medium text-slate-800">{{ device.type }}</p>
                </div>
                <div>
                  <p class="text-slate-500">购买序号</p>
                  <p class="font-medium text-slate-800">第 {{ device.purchaseNumber }} 个</p>
                </div>
                <div>
                  <p class="text-slate-500">绑定时间</p>
                  <p class="font-medium text-slate-800">{{ device.bindDate }}</p>
                </div>
                <div>
                  <p class="text-slate-500">最后同步</p>
                  <p class="font-medium text-slate-800">{{ device.lastSync }}</p>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center gap-2">
              <button
                @click="editDevice(device)"
                class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="编辑设备"
              >
                <Edit3 :size="18" />
              </button>
              <button
                @click="deleteDevice(device.id)"
                class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="删除设备"
              >
                <Trash2 :size="18" />
              </button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="devices.length === 0" class="p-12 text-center">
          <Package :size="48" class="text-slate-300 mx-auto mb-4" />
          <p class="text-slate-500">暂无绑定的设备</p>
          <button
            @click="showAddDeviceModal = true"
            class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            添加设备
          </button>
        </div>
      </div>
    </div>

    <!-- 添加/编辑设备弹窗 -->
    <Teleport to="body">
      <div v-if="showAddDeviceModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300">
        <div class="bg-white rounded-2xl w-[600px] max-h-[90vh] overflow-hidden shadow-2xl">
          <div class="p-6 border-b border-slate-100">
            <h3 class="text-xl font-bold text-slate-800">
              {{ editingDevice ? '编辑设备' : '添加设备' }}
            </h3>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">设备类型</label>
              <select
                v-model="deviceForm.type"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">请选择设备类型</option>
                <optgroup label="手环/戒指">
                  <option value="华米手环">华米手环</option>
                  <option value="智能戒指">智能戒指</option>
                </optgroup>
                <optgroup label="血糖仪">
                  <option value="欧态血糖仪">欧态血糖仪</option>
                  <option value="雅培一代血糖仪">雅培一代血糖仪</option>
                  <option value="雅培二代血糖仪">雅培二代血糖仪</option>
                  <option value="三诺血糖仪">三诺血糖仪</option>
                </optgroup>
                <optgroup label="血压计">
                  <option value="百洋血压计">百洋血压计</option>
                  <option value="智能血压计">智能血压计</option>
                </optgroup>
                <optgroup label="体脂秤">
                  <option value="乐福体脂秤">乐福体脂秤</option>
                  <option value="百洋体脂秤">百洋体脂秤</option>
                </optgroup>
                <optgroup label="其他设备">
                  <option value="三合一设备">三合一设备</option>
                  <option value="心电图设备">心电图设备</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">购买序号</label>
              <input
                v-model.number="deviceForm.purchaseNumber"
                type="number"
                min="1"
                placeholder="请输入购买序号"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">绑定时间</label>
              <input
                v-model="deviceForm.bindDate"
                type="date"
                class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div class="flex items-center gap-3">
              <input
                v-model="deviceForm.isDamaged"
                type="checkbox"
                id="isDamaged"
                class="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label for="isDamaged" class="text-sm font-medium text-slate-700">设备已损坏</label>
            </div>
          </div>

          <div class="p-6 border-t border-slate-100 flex justify-end gap-3">
            <button
              @click="closeDeviceModal"
              class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              @click="saveDevice"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              保存
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
  Edit3,
  Trash2,
  Package,
  AlertTriangle,
  Watch,
  Activity,
  HeartPulse,
  Droplet,
  Scale,
  Stethoscope,
  Monitor
} from 'lucide-vue-next'

interface Device {
  id: string
  type: string
  name: string
  purchaseNumber: number
  bindDate: string
  lastSync: string
  isDamaged: boolean
}

// Props
const props = defineProps<{
  clientId: string
}>()

// State
const showAddDeviceModal = ref(false)
const editingDevice = ref<Device | null>(null)
const deviceForm = ref({
  type: '',
  purchaseNumber: 1,
  bindDate: new Date().toISOString().split('T')[0],
  isDamaged: false
})

// 模拟设备数据
const devices = ref<Device[]>([
  {
    id: '1',
    type: '华米手环',
    name: '华米手环',
    purchaseNumber: 1,
    bindDate: '2024-01-15',
    lastSync: '2025-03-21 10:30',
    isDamaged: false
  },
  {
    id: '2',
    type: '雅培二代血糖仪',
    name: '雅培二代血糖仪',
    purchaseNumber: 1,
    bindDate: '2024-02-20',
    lastSync: '2025-03-21 08:15',
    isDamaged: false
  },
  {
    id: '3',
    type: '百洋体脂秤',
    name: '百洋体脂秤',
    purchaseNumber: 2,
    bindDate: '2024-03-10',
    lastSync: '2025-03-20 22:00',
    isDamaged: true
  }
])

// 设备分类统计
const deviceCategories = computed(() => [
  {
    id: 'wearable',
    name: '可穿戴设备',
    icon: Watch,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    count: devices.value.filter(d => ['华米手环', '智能戒指'].includes(d.type)).length
  },
  {
    id: 'blood_glucose',
    name: '血糖仪',
    icon: Droplet,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    count: devices.value.filter(d => d.type.includes('血糖仪')).length
  },
  {
    id: 'bp_monitor',
    name: '血压计',
    icon: Stethoscope,
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    count: devices.value.filter(d => d.type.includes('血压计')).length
  },
  {
    id: 'other',
    name: '其他设备',
    icon: Activity,
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    count: devices.value.filter(d => !['华米手环', '智能戒指', '血压计'].some(t => d.type.includes(t)) && !d.type.includes('血糖仪')).length
  }
])

// Methods
const getDeviceIcon = (type: string) => {
  if (type.includes('手环') || type.includes('戒指')) return Watch
  if (type.includes('血糖仪')) return Droplet
  if (type.includes('血压计')) return Stethoscope
  if (type.includes('体脂秤')) return Scale
  if (type.includes('心电图')) return HeartPulse
  return Activity
}

const getDeviceColor = (type: string) => {
  if (type.includes('手环') || type.includes('戒指')) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  if (type.includes('血糖仪')) return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  if (type.includes('血压计')) return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  if (type.includes('体脂秤')) return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  return 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
}

const editDevice = (device: Device) => {
  editingDevice.value = device
  deviceForm.value = {
    type: device.type,
    purchaseNumber: device.purchaseNumber,
    bindDate: device.bindDate,
    isDamaged: device.isDamaged
  }
  showAddDeviceModal.value = true
}

const deleteDevice = (id: string) => {
  if (confirm('确定要删除这个设备吗？')) {
    devices.value = devices.value.filter(d => d.id !== id)
  }
}

const closeDeviceModal = () => {
  showAddDeviceModal.value = false
  editingDevice.value = null
  deviceForm.value = {
    type: '',
    purchaseNumber: 1,
    bindDate: new Date().toISOString().split('T')[0],
    isDamaged: false
  }
}

const saveDevice = () => {
  if (!deviceForm.value.type) {
    alert('请选择设备类型')
    return
  }

  if (editingDevice.value) {
    // 编辑
    const index = devices.value.findIndex(d => d.id === editingDevice.value!.id)
    if (index !== -1) {
      devices.value[index] = {
        ...devices.value[index],
        type: deviceForm.value.type,
        name: deviceForm.value.type,
        purchaseNumber: deviceForm.value.purchaseNumber,
        bindDate: deviceForm.value.bindDate,
        isDamaged: deviceForm.value.isDamaged
      }
    }
  } else {
    // 新增
    devices.value.push({
      id: Date.now().toString(),
      type: deviceForm.value.type,
      name: deviceForm.value.type,
      purchaseNumber: deviceForm.value.purchaseNumber,
      bindDate: deviceForm.value.bindDate,
      lastSync: '刚刚',
      isDamaged: deviceForm.value.isDamaged
    })
  }

  closeDeviceModal()
}
</script>
