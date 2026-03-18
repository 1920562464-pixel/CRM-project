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
          <span :style="{ color: 'var(--text-primary)', fontWeight: 500 }">供应商管理</span>
        </div>
      </div>
    </div>

    <!-- Header with Action Buttons -->
    <div class="rounded-2xl p-6 shadow-lg" :style="{
      background: isBlackGold.value ? 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)' : 'linear-gradient(to right, #1e293b, #0f172a)',
      color: 'white'
    }">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-lg backdrop-blur-sm" :style="{ background: 'rgba(255, 255, 255, 0.2)' }">
          <Building2 :size="24" />
        </div>
        <div>
          <h1 class="text-2xl font-bold">供应商管理</h1>
          <p class="text-sm" :style="{ color: 'rgba(255, 255, 255, 0.7)' }">
            管理供应商信息及采购记录
          </p>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="rounded-xl p-4 shadow-sm" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">供应商总数</p>
            <p class="text-2xl font-bold mt-1" :style="{ color: 'var(--text-primary)' }">{{ stats.total }}</p>
          </div>
          <div class="p-3 rounded-lg" :style="{ background: 'rgba(79, 70, 229, 0.1)' }">
            <Building2 :size="24" :style="{ color: isBlackGold.value ? '#D4A84A' : '#4f46e5' }" />
          </div>
        </div>
      </div>
      <div class="rounded-xl p-4 shadow-sm" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">合作中</p>
            <p class="text-2xl font-bold mt-1 text-green-600">{{ stats.active }}</p>
          </div>
          <div class="p-3 rounded-lg bg-green-50">
            <CheckCircle :size="24" class="text-green-600" />
          </div>
        </div>
      </div>
      <div class="rounded-xl p-4 shadow-sm" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">待付款</p>
            <p class="text-2xl font-bold mt-1 text-orange-600">¥{{ formatNumber(stats.unpaidAmount) }}</p>
          </div>
          <div class="p-3 rounded-lg bg-orange-50">
            <Clock :size="24" class="text-orange-600" />
          </div>
        </div>
      </div>
      <div class="rounded-xl p-4 shadow-sm" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">累计采购</p>
            <p class="text-2xl font-bold mt-1" :style="{ color: 'var(--text-primary)' }">¥{{ formatNumber(stats.totalAmount) }}</p>
          </div>
          <div class="p-3 rounded-lg bg-blue-50">
            <TrendingUp :size="24" class="text-blue-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters & Actions -->
    <div class="rounded-xl shadow-sm p-4" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2" :size="18" :style="{ color: 'var(--text-placeholder)' }" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索供应商名称、联系人..."
              class="pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 w-64 text-sm"
              :style="{
                border: '1px solid var(--border)',
                background: 'var(--background)',
                color: 'var(--text-primary)',
                '--tw-ring-color': isBlackGold.value ? 'rgba(184, 134, 11, 0.5)' : 'rgba(79, 70, 229, 0.5)'
              }"
            />
          </div>
          <select
            v-model="typeFilter"
            class="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 text-sm"
            :style="{
              border: '1px solid var(--border)',
              background: 'var(--background)',
              color: 'var(--text-primary)'
            }"
          >
            <option value="all">全部类型</option>
            <option value="goods">商品供应商</option>
            <option value="service">服务供应商</option>
            <option value="equipment">设备供应商</option>
          </select>
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
            <option value="active">合作中</option>
            <option value="suspended">暂停合作</option>
            <option value="terminated">终止合作</option>
          </select>
        </div>
        <button
          @click="openAddDialog"
          class="px-4 py-2 text-white rounded-lg flex items-center gap-2 text-sm"
          :style="{
            background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5'
          }"
        >
          <Plus :size="16" />
          新增供应商
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-xl shadow-sm overflow-hidden" :style="{ background: 'var(--card)', border: '1px solid var(--border)' }">
      <table class="w-full text-left">
        <thead :style="{
          background: 'var(--fill-light)',
          borderBottom: '1px solid var(--border)'
        }">
          <tr>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">供应商信息</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">类型</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">信用等级</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">累计采购</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">待付款</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase" :style="{ color: 'var(--text-secondary)' }">状态</th>
            <th class="px-6 py-3 text-xs font-semibold uppercase text-right" :style="{ color: 'var(--text-secondary)' }">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="supplier in filteredSuppliers" :key="supplier.id" :style="{ borderBottom: '1px solid var(--border-lighter)' }">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                  :style="{ background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5' }"
                >
                  {{ supplier.name.slice(0, 2) }}
                </div>
                <div>
                  <p class="font-medium" :style="{ color: 'var(--text-primary)' }">{{ supplier.name }}</p>
                  <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">{{ supplier.contact }} · {{ supplier.phone }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 rounded text-xs font-medium" :style="{
                background: supplier.type === 'goods' ? 'rgba(79, 70, 229, 0.1)' : supplier.type === 'service' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                color: supplier.type === 'goods' ? '#4f46e5' : supplier.type === 'service' ? '#16a34a' : '#ea580c'
              }">
                {{ SUPPLIER_TYPE_LABELS[supplier.type] }}
              </span>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 rounded text-xs font-medium" :style="{
                background: supplier.creditLevel === 'A' ? 'rgba(34, 197, 94, 0.1)' : supplier.creditLevel === 'B' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: supplier.creditLevel === 'A' ? '#16a34a' : supplier.creditLevel === 'B' ? '#ca8a04' : '#dc2626'
              }">
                {{ supplier.creditLevel }}级
              </span>
            </td>
            <td class="px-6 py-4 text-sm" :style="{ color: 'var(--text-primary)' }">¥{{ formatNumber(supplier.totalPurchaseAmount) }}</td>
            <td class="px-6 py-4">
              <span v-if="supplier.unpaidAmount > 0" class="text-sm font-medium text-orange-600">¥{{ formatNumber(supplier.unpaidAmount) }}</span>
              <span v-else class="text-sm" :style="{ color: 'var(--text-disabled)' }">-</span>
            </td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 rounded-full text-xs font-medium" :style="{
                background: supplier.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : supplier.status === 'suspended' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: supplier.status === 'active' ? '#16a34a' : supplier.status === 'suspended' ? '#ca8a04' : '#dc2626'
              }">
                {{ SUPPLIER_STATUS_LABELS[supplier.status].label }}
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-1">
                <button
                  @click="viewSupplier(supplier)"
                  class="p-2 rounded-lg transition-colors"
                  :style="{ color: 'var(--text-secondary)' }"
                  title="查看详情"
                >
                  <Eye :size="16" />
                </button>
                <button
                  @click="editSupplier(supplier)"
                  class="p-2 rounded-lg transition-colors"
                  :style="{ color: 'var(--text-secondary)' }"
                  title="编辑"
                >
                  <Edit :size="16" />
                </button>
                <button
                  @click="createOrder(supplier)"
                  class="p-2 rounded-lg transition-colors"
                  :style="{ color: isBlackGold.value ? '#D4A84A' : '#4f46e5' }"
                  title="创建采购订单"
                >
                  <FilePlus :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="filteredSuppliers.length === 0" class="py-12 text-center" :style="{ color: 'var(--text-disabled)' }">
        <Building2 :size="48" class="mx-auto mb-4 opacity-50" />
        <p>暂无供应商数据</p>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <Teleport to="body">
      <div v-if="showDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" :style="{ background: 'var(--card)' }">
          <div class="px-6 py-4 sticky top-0 z-10 flex items-center justify-between" :style="{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }">
            <h3 class="text-lg font-bold" :style="{ color: 'var(--text-primary)' }">
              {{ editingSupplier ? '编辑供应商' : '新增供应商' }}
            </h3>
            <button @click="showDialog = false" class="p-1 rounded-lg transition-colors" :style="{ color: 'var(--text-secondary)' }">
              <X :size="20" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- 基本信息 -->
            <div class="space-y-2">
              <h4 class="font-medium" :style="{ color: 'var(--text-primary)' }">基本信息</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">供应商名称 *</label>
                  <input v-model="form.name" type="text" placeholder="请输入供应商名称" class="w-full px-3 py-2 rounded-lg text-sm" :style="inputStyle" />
                </div>
                <div>
                  <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">供应商类型 *</label>
                  <select v-model="form.type" class="w-full px-3 py-2 rounded-lg text-sm" :style="inputStyle">
                    <option value="goods">商品供应商</option>
                    <option value="service">服务供应商</option>
                    <option value="equipment">设备供应商</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 联系信息 -->
            <div class="space-y-2">
              <h4 class="font-medium" :style="{ color: 'var(--text-primary)' }">联系信息</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">联系人 *</label>
                  <input v-model="form.contact" type="text" placeholder="请输入联系人姓名" class="w-full px-3 py-2 rounded-lg text-sm" :style="inputStyle" />
                </div>
                <div>
                  <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">联系电话 *</label>
                  <input v-model="form.phone" type="text" placeholder="请输入联系电话" class="w-full px-3 py-2 rounded-lg text-sm" :style="inputStyle" />
                </div>
                <div>
                  <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">电子邮箱</label>
                  <input v-model="form.email" type="email" placeholder="请输入电子邮箱" class="w-full px-3 py-2 rounded-lg text-sm" :style="inputStyle" />
                </div>
                <div>
                  <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">地址</label>
                  <input v-model="form.address" type="text" placeholder="请输入地址" class="w-full px-3 py-2 rounded-lg text-sm" :style="inputStyle" />
                </div>
              </div>
            </div>

            <!-- 财务信息 -->
            <div class="space-y-2">
              <h4 class="font-medium" :style="{ color: 'var(--text-primary)' }">财务信息</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">开户银行</label>
                  <input v-model="form.bankName" type="text" placeholder="请输入开户银行" class="w-full px-3 py-2 rounded-lg text-sm" :style="inputStyle" />
                </div>
                <div>
                  <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">银行账号</label>
                  <input v-model="form.bankAccount" type="text" placeholder="请输入银行账号" class="w-full px-3 py-2 rounded-lg text-sm" :style="inputStyle" />
                </div>
              </div>
            </div>

            <!-- 合作信息 -->
            <div class="space-y-2">
              <h4 class="font-medium" :style="{ color: 'var(--text-primary)' }">合作信息</h4>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">信用等级</label>
                  <select v-model="form.creditLevel" class="w-full px-3 py-2 rounded-lg text-sm" :style="inputStyle">
                    <option value="A">A级（优秀）</option>
                    <option value="B">B级（良好）</option>
                    <option value="C">C级（一般）</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">合作状态</label>
                  <select v-model="form.status" class="w-full px-3 py-2 rounded-lg text-sm" :style="inputStyle">
                    <option value="active">合作中</option>
                    <option value="suspended">暂停合作</option>
                    <option value="terminated">终止合作</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">合同到期日</label>
                  <input v-model="form.contractExpiry" type="date" class="w-full px-3 py-2 rounded-lg text-sm" :style="inputStyle" />
                </div>
              </div>
            </div>

            <!-- 备注 -->
            <div>
              <label class="block text-sm mb-1" :style="{ color: 'var(--text-secondary)' }">备注</label>
              <textarea v-model="form.remark" placeholder="请输入备注信息" rows="3" class="w-full px-3 py-2 rounded-lg text-sm resize-none" :style="inputStyle"></textarea>
            </div>
          </div>

          <div class="px-6 py-4 flex items-center justify-end gap-3" :style="{ borderTop: '1px solid var(--border)' }">
            <button @click="showDialog = false" class="px-4 py-2 rounded-lg text-sm" :style="{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }">取消</button>
            <button @click="saveSupplier" class="px-4 py-2 text-white rounded-lg text-sm" :style="{ background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5' }">保存</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Detail Dialog -->
    <Teleport to="body">
      <div v-if="showDetailDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" :style="{ background: 'var(--card)' }">
          <div class="px-6 py-4 sticky top-0 z-10 flex items-center justify-between" :style="{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }">
            <h3 class="text-lg font-bold" :style="{ color: 'var(--text-primary)' }">供应商详情</h3>
            <button @click="showDetailDialog = false" class="p-1 rounded-lg transition-colors" :style="{ color: 'var(--text-secondary)' }">
              <X :size="20" />
            </button>
          </div>

          <div v-if="viewingSupplier" class="p-6 space-y-6">
            <!-- 基本信息 -->
            <div class="flex items-start gap-4">
              <div
                class="w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl text-white"
                :style="{ background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5' }"
              >
                {{ viewingSupplier.name.slice(0, 2) }}
              </div>
              <div class="flex-1">
                <h2 class="text-xl font-bold" :style="{ color: 'var(--text-primary)' }">{{ viewingSupplier.name }}</h2>
                <div class="flex items-center gap-2 mt-2">
                  <span class="px-2 py-1 rounded text-xs font-medium" :style="{
                    background: viewingSupplier.type === 'goods' ? 'rgba(79, 70, 229, 0.1)' : viewingSupplier.type === 'service' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                    color: viewingSupplier.type === 'goods' ? '#4f46e5' : viewingSupplier.type === 'service' ? '#16a34a' : '#ea580c'
                  }">
                    {{ SUPPLIER_TYPE_LABELS[viewingSupplier.type] }}
                  </span>
                  <span class="px-2 py-1 rounded text-xs font-medium" :style="{
                    background: viewingSupplier.creditLevel === 'A' ? 'rgba(34, 197, 94, 0.1)' : viewingSupplier.creditLevel === 'B' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: viewingSupplier.creditLevel === 'A' ? '#16a34a' : viewingSupplier.creditLevel === 'B' ? '#ca8a04' : '#dc2626'
                  }">
                    {{ viewingSupplier.creditLevel }}级信用
                  </span>
                  <span class="px-2 py-1 rounded-full text-xs font-medium" :style="{
                    background: viewingSupplier.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : viewingSupplier.status === 'suspended' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: viewingSupplier.status === 'active' ? '#16a34a' : viewingSupplier.status === 'suspended' ? '#ca8a04' : '#dc2626'
                  }">
                    {{ SUPPLIER_STATUS_LABELS[viewingSupplier.status].label }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 统计信息 -->
            <div class="grid grid-cols-3 gap-4">
              <div class="rounded-xl p-4" :style="{ background: 'var(--fill-light)' }">
                <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">累计采购金额</p>
                <p class="text-xl font-bold mt-1" :style="{ color: 'var(--text-primary)' }">¥{{ formatNumber(viewingSupplier.totalPurchaseAmount) }}</p>
              </div>
              <div class="rounded-xl p-4" :style="{ background: 'var(--fill-light)' }">
                <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">待付款金额</p>
                <p class="text-xl font-bold mt-1 text-orange-600">¥{{ formatNumber(viewingSupplier.unpaidAmount) }}</p>
              </div>
              <div class="rounded-xl p-4" :style="{ background: 'var(--fill-light)' }">
                <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">合同到期日</p>
                <p class="text-xl font-bold mt-1" :style="{ color: 'var(--text-primary)' }">{{ viewingSupplier.contractExpiry || '-' }}</p>
              </div>
            </div>

            <!-- 详细信息 -->
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-3">
                <h4 class="font-medium" :style="{ color: 'var(--text-primary)' }">联系信息</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2">
                    <User :size="16" :style="{ color: 'var(--text-secondary)' }" />
                    <span :style="{ color: 'var(--text-secondary)' }">联系人：</span>
                    <span :style="{ color: 'var(--text-primary)' }">{{ viewingSupplier.contact }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Phone :size="16" :style="{ color: 'var(--text-secondary)' }" />
                    <span :style="{ color: 'var(--text-secondary)' }">电话：</span>
                    <span :style="{ color: 'var(--text-primary)' }">{{ viewingSupplier.phone }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Mail :size="16" :style="{ color: 'var(--text-secondary)' }" />
                    <span :style="{ color: 'var(--text-secondary)' }">邮箱：</span>
                    <span :style="{ color: 'var(--text-primary)' }">{{ viewingSupplier.email || '-' }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <MapPin :size="16" :style="{ color: 'var(--text-secondary)' }" />
                    <span :style="{ color: 'var(--text-secondary)' }">地址：</span>
                    <span :style="{ color: 'var(--text-primary)' }">{{ viewingSupplier.address || '-' }}</span>
                  </div>
                </div>
              </div>
              <div class="space-y-3">
                <h4 class="font-medium" :style="{ color: 'var(--text-primary)' }">财务信息</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center gap-2">
                    <Landmark :size="16" :style="{ color: 'var(--text-secondary)' }" />
                    <span :style="{ color: 'var(--text-secondary)' }">开户银行：</span>
                    <span :style="{ color: 'var(--text-primary)' }">{{ viewingSupplier.bankName || '-' }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <CreditCard :size="16" :style="{ color: 'var(--text-secondary)' }" />
                    <span :style="{ color: 'var(--text-secondary)' }">银行账号：</span>
                    <span :style="{ color: 'var(--text-primary)' }">{{ viewingSupplier.bankAccount || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 备注 -->
            <div v-if="viewingSupplier.remark">
              <h4 class="font-medium mb-2" :style="{ color: 'var(--text-primary)' }">备注</h4>
              <p class="text-sm rounded-lg p-3" :style="{ background: 'var(--fill-light)', color: 'var(--text-secondary)' }">{{ viewingSupplier.remark }}</p>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center gap-3 pt-4" :style="{ borderTop: '1px solid var(--border)' }">
              <button @click="editSupplier(viewingSupplier); showDetailDialog = false" class="px-4 py-2 rounded-lg text-sm flex items-center gap-2" :style="{ border: '1px solid var(--border)', color: 'var(--text-primary)' }">
                <Edit :size="16" />
                编辑信息
              </button>
              <button @click="createOrder(viewingSupplier); showDetailDialog = false" class="px-4 py-2 text-white rounded-lg text-sm flex items-center gap-2" :style="{ background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5' }">
                <FilePlus :size="16" />
                创建采购订单
              </button>
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
import {
  Building2,
  Search,
  Plus,
  Edit,
  Eye,
  X,
  CheckCircle,
  Clock,
  TrendingUp,
  FilePlus,
  FileText,
  ShoppingCart,
  User,
  Phone,
  Mail,
  MapPin,
  Landmark,
  CreditCard,
  ChevronRight,
  ArrowLeft
} from 'lucide-vue-next'
import type { Supplier, SupplierType, CreditLevel, SupplierStatus } from '../../types/procurement'
import { SUPPLIER_TYPE_LABELS, SUPPLIER_STATUS_LABELS } from '../../types/procurement'

const router = useRouter()

const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')
const toast = useToast()

// Filters
const searchQuery = ref('')
const typeFilter = ref<string>('all')
const statusFilter = ref<string>('all')

// Dialog states
const showDialog = ref(false)
const showDetailDialog = ref(false)
const editingSupplier = ref<Supplier | null>(null)
const viewingSupplier = ref<Supplier | null>(null)

// 组件卸载前清理
onBeforeUnmount(() => {
  showDialog.value = false
  showDetailDialog.value = false
  editingSupplier.value = null
  viewingSupplier.value = null
})

// Form
const form = ref({
  name: '',
  type: 'goods' as SupplierType,
  contact: '',
  phone: '',
  email: '',
  address: '',
  bankName: '',
  bankAccount: '',
  creditLevel: 'B' as CreditLevel,
  status: 'active' as SupplierStatus,
  contractExpiry: '',
  remark: ''
})

// Input style
const inputStyle = computed(() => ({
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--text-primary)'
}))

// Mock data
const suppliers = ref<Supplier[]>([
  {
    id: '1',
    name: '北京健康科技有限公司',
    type: 'goods',
    contact: '张经理',
    phone: '13800138001',
    email: 'zhang@health.com',
    address: '北京市朝阳区健康路100号',
    bankName: '中国工商银行',
    bankAccount: '6222021234567890123',
    creditLevel: 'A',
    status: 'active',
    contractExpiry: '2026-12-31',
    remark: '主要供应商，合作多年',
    createdAt: '2024-01-01',
    totalPurchaseAmount: 1250000,
    unpaidAmount: 85000
  },
  {
    id: '2',
    name: '上海医疗器械有限公司',
    type: 'equipment',
    contact: '李主管',
    phone: '13900139002',
    email: 'li@meddevice.com',
    address: '上海市浦东新区张江高科技园区',
    bankName: '中国建设银行',
    bankAccount: '6227001234567890456',
    creditLevel: 'A',
    status: 'active',
    contractExpiry: '2026-06-30',
    remark: '',
    createdAt: '2024-02-15',
    totalPurchaseAmount: 580000,
    unpaidAmount: 0
  },
  {
    id: '3',
    name: '广州营养食品有限公司',
    type: 'goods',
    contact: '王总监',
    phone: '13700137003',
    email: 'wang@nutrition.com',
    address: '广州市天河区体育西路',
    bankName: '中国农业银行',
    bankAccount: '6228481234567890789',
    creditLevel: 'B',
    status: 'active',
    contractExpiry: '2025-12-31',
    remark: '新产品供应商',
    createdAt: '2024-03-01',
    totalPurchaseAmount: 320000,
    unpaidAmount: 45000
  },
  {
    id: '4',
    name: '深圳IT服务有限公司',
    type: 'service',
    contact: '陈工程师',
    phone: '13600136004',
    email: 'chen@itservice.com',
    address: '深圳市南山区科技园',
    bankName: '招商银行',
    bankAccount: '621483123456789012',
    creditLevel: 'B',
    status: 'suspended',
    contractExpiry: '2025-03-31',
    remark: '服务质量不稳定，暂停合作',
    createdAt: '2024-01-15',
    totalPurchaseAmount: 150000,
    unpaidAmount: 0
  }
])

// Stats
const stats = computed(() => ({
  total: suppliers.value.length,
  active: suppliers.value.filter(s => s.status === 'active').length,
  unpaidAmount: suppliers.value.reduce((sum, s) => sum + s.unpaidAmount, 0),
  totalAmount: suppliers.value.reduce((sum, s) => sum + s.totalPurchaseAmount, 0)
}))

// Filtered suppliers
const filteredSuppliers = computed(() => {
  return suppliers.value.filter(s => {
    const matchesSearch = s.name.includes(searchQuery.value) || s.contact.includes(searchQuery.value)
    const matchesType = typeFilter.value === 'all' || s.type === typeFilter.value
    const matchesStatus = statusFilter.value === 'all' || s.status === statusFilter.value
    return matchesSearch && matchesType && matchesStatus
  })
})

// Methods
const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN')
}

const openAddDialog = () => {
  editingSupplier.value = null
  form.value = {
    name: '',
    type: 'goods',
    contact: '',
    phone: '',
    email: '',
    address: '',
    bankName: '',
    bankAccount: '',
    creditLevel: 'B',
    status: 'active',
    contractExpiry: '',
    remark: ''
  }
  showDialog.value = true
}

const editSupplier = (supplier: Supplier) => {
  editingSupplier.value = supplier
  form.value = {
    name: supplier.name,
    type: supplier.type,
    contact: supplier.contact,
    phone: supplier.phone,
    email: supplier.email,
    address: supplier.address,
    bankName: supplier.bankName,
    bankAccount: supplier.bankAccount,
    creditLevel: supplier.creditLevel,
    status: supplier.status,
    contractExpiry: supplier.contractExpiry,
    remark: supplier.remark
  }
  showDialog.value = true
}

const viewSupplier = (supplier: Supplier) => {
  viewingSupplier.value = supplier
  showDetailDialog.value = true
}

const saveSupplier = () => {
  if (!form.value.name || !form.value.contact || !form.value.phone) {
    toast.error('验证失败', '请填写必填项')
    return
  }

  if (editingSupplier.value) {
    // Update existing
    Object.assign(editingSupplier.value, form.value)
    toast.success('更新成功', `供应商 "${form.value.name}" 信息已更新`)
  } else {
    // Create new
    const newSupplier: Supplier = {
      id: `supplier-${Date.now()}`,
      ...form.value,
      createdAt: new Date().toISOString().split('T')[0],
      totalPurchaseAmount: 0,
      unpaidAmount: 0
    }
    suppliers.value.push(newSupplier)
    toast.success('添加成功', `供应商 "${form.value.name}" 已添加`)
  }

  showDialog.value = false
}

const createOrder = (supplier: Supplier) => {
  toast.info('提示', `即将为 "${supplier.name}" 创建采购订单（功能开发中）`)
}
</script>
