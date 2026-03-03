<template>
  <div class="space-y-6">
    <!-- Toast Container -->
    <Toast ref="toastRef" />

    <!-- Confirm Dialog -->
    <ConfirmDialog
      v-model:show="confirm.show"
      :title="confirm.title"
      :message="confirm.message"
      :type="confirm.type"
      @confirm="confirm.onConfirm"
      @cancel="confirm.onCancel"
    />

    <div>
      <h1 class="text-3xl font-bold text-slate-900 flex items-center gap-3">
        <div class="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
          <Box :size="28" class="text-white" />
        </div>
        资产管理
      </h1>
      <p class="text-slate-500 mt-2 ml-12">固定资产 · 商品库存 · 设备管理</p>
    </div>

    <!-- Tab 导航 -->
    <div class="flex bg-slate-100 p-1 rounded-lg w-fit">
      <button
        @click="currentView = 'fixed'"
        :class="`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
          currentView === 'fixed'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-800'
        }`"
      >
        <Box :size="16" />
        资产列表
      </button>
      <button
        @click="currentView = 'department'"
        :class="`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
          currentView === 'department'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-800'
        }`"
      >
        <Building :size="16" />
        部门视图
      </button>
      <button
        @click="currentView = 'category'"
        :class="`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
          currentView === 'category'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-800'
        }`"
      >
        <FolderTree :size="16" />
        分类管理
      </button>
      <button
        @click="currentView = 'check'"
        :class="`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
          currentView === 'check'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-800'
        }`"
      >
        <ClipboardCheck :size="16" />
        盘点记录
      </button>
    </div>

    <!-- 固定资产 -->
    <div v-if="currentView === 'fixed'" class="space-y-4">
      <!-- 统计概览 -->
      <div class="grid grid-cols-5 gap-2">
        <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg py-3 px-2 text-white">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-medium opacity-90">资产总数</span>
            <Box :size="12" />
          </div>
          <div class="text-xl font-bold leading-tight">{{ statistics.totalAssets }}</div>
          <div class="text-[9px] opacity-75 mt-0.5">件资产</div>
        </div>

        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg py-3 px-2 text-white">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-medium opacity-90">资产总值</span>
            <DollarSign :size="12" />
          </div>
          <div class="text-xl font-bold leading-tight">¥{{ statistics.totalValue.toLocaleString() }}</div>
          <div class="text-[9px] opacity-75 mt-0.5">账面价值</div>
        </div>

        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg py-3 px-2 text-white">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-medium opacity-90">在用资产</span>
            <CheckCircle :size="12" />
          </div>
          <div class="text-xl font-bold leading-tight">{{ statistics.inUseCount }}</div>
          <div class="text-[9px] opacity-75 mt-0.5">{{ ((statistics.inUseCount / statistics.totalAssets) * 100).toFixed(0) }}% 使用率</div>
        </div>

        <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg py-3 px-2 text-white">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-medium opacity-90">待盘点</span>
            <Clock :size="12" />
          </div>
          <div class="text-xl font-bold leading-tight">{{ statistics.pendingCheck }}</div>
          <div class="text-[9px] opacity-75 mt-0.5">超30天未盘点</div>
        </div>

        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg py-3 px-2 text-white">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-medium opacity-90">商品库存</span>
            <Package :size="12" />
          </div>
          <div class="text-xl font-bold leading-tight">{{ statistics.productCount }}</div>
          <div class="text-[9px] opacity-75 mt-0.5">库存商品</div>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div class="flex items-center gap-3 flex-wrap">
          <button
            @click="openAssetModal"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          >
            <Plus :size="16" />
            新增资产
          </button>

          <button
            @click="openProductModal"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          >
            <Package :size="16" />
            新增商品
          </button>

          <button
            v-if="selectedAssets.length > 0"
            @click="batchTransfer"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          >
            <ArrowRight :size="16" />
            批量调拨 ({{ selectedAssets.length }})
          </button>

          <button
            v-if="selectedAssets.length > 0"
            @click="startBatchCheck"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          >
            <ClipboardCheck :size="16" />
            批量盘点
          </button>

          <button
            v-if="selectedAssets.length > 0"
            @click="clearSelection"
            class="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm transition-colors"
          >
            取消选择
          </button>

          <div class="relative flex-1 min-w-[200px]">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" :size="16" />
            <input
              v-model="searchText"
              type="text"
              placeholder="搜索资产编号、名称、商品SKU..."
              class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <select
            v-model="typeFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="">全部类型</option>
            <option value="电子设备">电子设备</option>
            <option value="办公家具">办公家具</option>
            <option value="医疗器械">医疗器械</option>
            <option value="运动器材">运动器材</option>
            <option value="营养补充剂">营养补充剂</option>
            <option value="药品">药品</option>
            <option value="其他">其他</option>
          </select>

          <select
            v-model="assetClassFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="">全部类别</option>
            <option value="fixed">固定资产</option>
            <option value="product">库存商品</option>
          </select>

          <select
            v-model="statusFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="">全部状态</option>
            <option value="in_use">在用</option>
            <option value="idle">闲置</option>
            <option value="maintenance">维修中</option>
            <option value="scrapped">已报废</option>
            <option value="low_stock">库存不足</option>
            <option value="out_of_stock">缺货</option>
          </select>

          <select
            v-model="departmentFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="">全部部门</option>
            <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
          </select>

          <button
            @click="openQRScanner"
            class="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm transition-colors"
            title="扫码盘点"
          >
            <QrCode :size="16" />
          </button>

          <button
            @click="exportAssets"
            class="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm transition-colors"
          >
            <Download :size="16" />
            导出
          </button>
        </div>
      </div>

      <!-- 资产列表 -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <tr>
              <th class="px-4 py-4 text-center">
                <input
                  type="checkbox"
                  :checked="selectedAssets.length === filteredAssets.length && filteredAssets.length > 0"
                  @change="toggleSelectAll"
                  class="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase">编号</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase">名称</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase">类型</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase">购买日期</th>
              <th class="px-4 py-4 text-right text-xs font-semibold text-slate-700 uppercase">价值</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase">使用人</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase">部门</th>
              <th class="px-4 py-4 text-center text-xs font-semibold text-slate-700 uppercase">状态</th>
              <th class="px-4 py-4 text-left text-xs font-semibold text-slate-700 uppercase">存放位置</th>
              <th class="px-4 py-4 text-center text-xs font-semibold text-slate-700 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="asset in filteredAssets"
              :key="asset.id"
              class="hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50/50 transition-colors"
              :class="{ 'bg-indigo-50/50': selectedAssets.includes(asset.id) }"
            >
              <td class="px-4 py-4 text-center">
                <input
                  type="checkbox"
                  :checked="selectedAssets.includes(asset.id)"
                  @change="toggleAssetSelection(asset.id)"
                  class="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </td>
              <td class="px-4 py-4">
                <span class="font-mono text-sm text-indigo-600 font-medium">{{ asset.assetCode }}</span>
                <span v-if="asset.sku" class="block text-xs text-slate-400">{{ asset.sku }}</span>
              </td>
              <td class="px-4 py-4">
                <div class="flex items-center gap-2">
                  <div v-if="asset.assetClass === 'product'" class="p-1 bg-purple-100 rounded">
                    <Package :size="14" class="text-purple-600" />
                  </div>
                  <div class="font-medium text-slate-900">{{ asset.assetName }}</div>
                </div>
              </td>
              <td class="px-4 py-4 text-sm text-slate-600">{{ asset.assetType }}</td>
              <td class="px-4 py-4 text-sm text-slate-600">{{ asset.purchaseDate }}</td>
              <td class="px-4 py-4 text-right">
                <div class="text-sm text-slate-900 font-medium">¥{{ asset.purchasePrice.toLocaleString() }}</div>
                <div v-if="asset.stock !== undefined" class="text-xs text-slate-500">库存: {{ asset.stock }}</div>
              </td>
              <td class="px-4 py-4 text-sm text-slate-600">{{ asset.user || '-' }}</td>
              <td class="px-4 py-4">
                <span
                  class="px-2 py-1 rounded-full text-xs font-semibold"
                  :class="getDepartmentBadgeClass(asset.department)"
                >
                  {{ asset.department }}
                </span>
              </td>
              <td class="px-4 py-4 text-center">
                <span
                  class="px-2 py-1 rounded-full text-xs font-semibold border"
                  :class="getStatusBadgeClass(asset.status, asset.stock, asset.minStock)"
                >
                  {{ asset.statusLabel }}
                </span>
              </td>
              <td class="px-4 py-4 text-sm text-slate-600">{{ asset.location }}</td>
              <td class="px-4 py-4">
                <div class="flex items-center justify-center gap-1">
                  <button
                    @click="viewAssetDetail(asset)"
                    class="px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    详情
                  </button>
                  <button
                    @click="openCheckModal(asset)"
                    class="px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    盘点
                  </button>
                  <button
                    @click="editAsset(asset)"
                    class="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    @click="deleteAsset(asset.id)"
                    class="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="删除"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredAssets.length === 0" class="text-center py-16 text-slate-400">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-3">
            <Search :size="32" />
          </div>
          <p class="text-sm font-medium">暂无符合条件的资产</p>
        </div>
      </div>
    </div>

    <!-- 盘点记录 -->
    <div v-else-if="currentView === 'check'" class="space-y-4">
      <!-- 筛选区 -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <Calendar :size="16" class="text-slate-400" />
            <label class="text-sm font-medium text-slate-700">盘点日期</label>
            <input
              v-model="checkDateFilter"
              type="date"
              class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <select
            v-model="checkStatusFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="">全部状态</option>
            <option value="normal">正常</option>
            <option value="abnormal">异常</option>
          </select>

          <button
            @click="openQuickCheckModal"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          >
            <Plus :size="16" />
            快速盘点
          </button>
        </div>
      </div>

      <!-- 盘点记录表格 -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">盘点日期</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">资产编号</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">资产名称</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">盘点人</th>
              <th class="px-6 py-4 text-center text-xs font-semibold text-slate-700 uppercase">盘点状态</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">资产状况</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">备注</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">记录时间</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="record in filteredCheckRecords"
              :key="record.id"
              class="hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50/50 transition-colors"
            >
              <td class="px-6 py-4 text-sm text-slate-600">{{ record.checkDate }}</td>
              <td class="px-6 py-4 font-mono text-sm text-indigo-600">{{ record.assetCode }}</td>
              <td class="px-6 py-4 font-medium text-slate-900">{{ record.assetName }}</td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ record.checker }}</td>
              <td class="px-6 py-4 text-center">
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold border"
                  :class="record.status === 'normal' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-amber-100 text-amber-800 border-amber-200'"
                >
                  {{ record.statusLabel }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-slate-600">{{ record.condition }}</td>
              <td class="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{{ record.remark }}</td>
              <td class="px-6 py-4 text-sm text-slate-500">{{ record.createdAt }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="filteredCheckRecords.length === 0" class="text-center py-16 text-slate-400">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-3">
            <ClipboardCheck :size="32" />
          </div>
          <p class="text-sm font-medium">暂无盘点记录</p>
        </div>
      </div>
    </div>

    <!-- 部门视图 -->
    <div v-else-if="currentView === 'department'" class="space-y-6">
      <!-- 部门选择 -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-slate-900">部门资产分布</h3>
          <div class="flex items-center gap-2">
            <Building :size="18" class="text-slate-400" />
            <select
              v-model="selectedDepartment"
              class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            >
              <option value="">全部部门</option>
              <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
            </select>
          </div>
        </div>

        <!-- 部门统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="deptStat in departmentStatistics"
            :key="deptStat.department"
            @click="selectedDepartment = (selectedDepartment === deptStat.department ? '' : deptStat.department)"
            class="p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg"
            :class="selectedDepartment === deptStat.department ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-300'"
          >
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-semibold text-slate-700">{{ deptStat.department }}</span>
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" :style="{ backgroundColor: deptStat.color }">
                {{ deptStat.assetCount }}
              </div>
            </div>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500">资产总值</span>
                <span class="font-semibold text-slate-900">¥{{ deptStat.totalValue.toLocaleString() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">在用/闲置</span>
                <span class="text-slate-700">{{ deptStat.inUse }}/{{ deptStat.idle }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 选中部门详细信息 -->
      <div v-if="selectedDepartment" class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <!-- 头部 -->
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div class="flex items-center gap-3">
            <Building :size="24" class="text-white" style="color: white !important;" />
            <div>
              <h3 class="text-lg font-bold text-white" style="color: white !important; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">{{ selectedDepartment }}</h3>
              <p class="text-sm text-indigo-100 mt-0.5">部门资产详情</p>
            </div>
          </div>
          <button @click="selectedDepartment = ''" class="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X :size="20" class="text-white" style="color: white !important;" />
          </button>
        </div>

        <!-- 筛选和操作栏 -->
        <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="16" />
              <input v-model="deptSearchText" type="text" placeholder="搜索资产..."
                     class="pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-64" />
            </div>
            <select v-model="deptStatusFilter" class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
              <option value="">全部状态</option>
              <option value="in_use">在用</option>
              <option value="idle">闲置</option>
              <option value="maintenance">维护中</option>
              <option value="scrapped">已报废</option>
            </select>
            <select v-model="deptTypeFilter" class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white">
              <option value="">全部类型</option>
              <option v-for="type in assetTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <button @click="batchTransfer" :disabled="selectedDeptAssets.length === 0"
                    class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1">
              <ArrowRightLeft :size="14" />
              批量调拨 ({{ selectedDeptAssets.length }})
            </button>
            <button @click="exportDepartmentAssets"
                    class="px-3 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm flex items-center gap-1">
              <Download :size="14" />
              导出
            </button>
          </div>
        </div>

        <!-- 资产列表 -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="px-4 py-3 w-10">
                  <input type="checkbox" :checked="isAllDeptAssetsSelected" @change="toggleAllDeptAssets"
                         class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                </th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">资产编号</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">资产名称</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">类型</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase">价值</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">使用人</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">状态</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">位置</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-for="asset in filteredDeptAssets" :key="asset.id"
                  class="hover:bg-slate-50 transition-colors"
                  :class="{ 'bg-indigo-50': selectedDeptAssets.includes(asset.id) }">
                <td class="px-4 py-3">
                  <input type="checkbox" :checked="selectedDeptAssets.includes(asset.id)" @change="toggleDeptAssetSelection(asset.id)"
                         class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                </td>
                <td class="px-4 py-3 font-mono text-sm text-indigo-600">{{ asset.assetCode }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div v-if="asset.assetClass === 'product'" class="p-1 bg-purple-100 rounded">
                      <Package :size="12" class="text-purple-600" />
                    </div>
                    <span class="font-medium text-slate-900">{{ asset.assetName }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ asset.assetType }}</td>
                <td class="px-4 py-3 text-right text-sm font-medium text-slate-900">¥{{ asset.purchasePrice.toLocaleString() }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ asset.user || '-' }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2 py-1 rounded-full text-xs font-semibold border"
                        :class="getStatusBadgeClass(asset.status, asset.stock, asset.minStock)">
                    {{ asset.statusLabel }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ asset.location }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center justify-center gap-2">
                    <button @click.stop="viewAssetDetail(asset)"
                            class="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                            title="查看详情">
                      <Eye :size="12" />
                      <span>详情</span>
                    </button>
                    <button @click.stop="editAsset(asset)"
                            class="px-2.5 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                            title="编辑资产">
                      <Edit3 :size="12" />
                      <span>编辑</span>
                    </button>
                    <button @click.stop="transferSingleAsset(asset)"
                            class="px-2.5 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                            title="调拨资产">
                      <ArrowRightLeft :size="12" />
                      <span>调拨</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 空状态 -->
          <div v-if="filteredDeptAssets.length === 0" class="text-center py-16">
            <Building :size="48" class="mx-auto mb-3 text-slate-300" />
            <p class="text-sm font-medium text-slate-500">该部门暂无资产</p>
          </div>
        </div>
      </div>

      <!-- 未选择部门时的提示 -->
      <div v-else class="bg-white rounded-xl border border-slate-200 p-16 text-center">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-4">
          <Building :size="40" class="text-slate-300" />
        </div>
        <h3 class="text-lg font-semibold text-slate-900 mb-2">选择一个部门</h3>
        <p class="text-slate-500">点击上方部门卡片查看详细资产信息</p>
      </div>
    </div>

    <!-- 分类管理 -->
    <div v-else-if="currentView === 'category'" class="space-y-4">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：分类树 -->
        <div class="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-slate-900">分类目录</h3>
            <button
              @click="addRootCategory"
              class="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 flex items-center gap-1 transition-colors"
            >
              <Plus :size="14" />
              新增根目录
            </button>
          </div>

          <div class="space-y-1">
            <div
              v-for="category in categoryTree"
              :key="category.id"
              class="category-item"
            >
              <div
                @click="selectCategory(category.id)"
                class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                :class="selectedCategoryId === category.id ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'"
              >
                <button
                  @click.stop="toggleCategoryExpand(category.id)"
                  class="p-0.5 hover:bg-slate-200 rounded transition-colors"
                  v-if="category.children?.length > 0"
                >
                  <ChevronDown
                    :size="14"
                    :class="{ 'rotate-[-90deg]': !expandedCategories.has(category.id) }"
                    class="transition-transform"
                  />
                </button>
                <div v-else class="w-4"></div>
                <div
                  class="w-5 h-5 rounded flex items-center justify-center"
                  :style="{ backgroundColor: category.color }"
                >
                  <component :is="getCategoryIcon(category.icon)" :size="12" class="text-white" />
                </div>
                <span class="flex-1 text-sm font-medium truncate">{{ category.name }}</span>
                <span class="text-xs text-slate-500">{{ category.count }}</span>
                <div class="flex gap-1">
                  <button
                    @click.stop="addSubCategory(category.id)"
                    class="p-1 hover:bg-slate-200 rounded transition-colors"
                    title="添加子分类"
                  >
                    <Plus :size="12" />
                  </button>
                  <button
                    @click.stop="editCategoryItem(category)"
                    class="p-1 hover:bg-slate-200 rounded transition-colors"
                    title="编辑"
                  >
                    <Edit :size="12" />
                  </button>
                  <button
                    @click.stop="deleteCategoryItem(category)"
                    class="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 :size="12" />
                  </button>
                </div>
              </div>

              <!-- 子分类 -->
              <div v-if="expandedCategories.has(category.id) || selectedCategoryId?.startsWith(category.id + '-')">
                <div
                  v-for="child in category.children"
                  :key="child.id"
                  class="ml-6"
                >
                  <div
                    @click="selectCategory(child.id)"
                    class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                    :class="selectedCategoryId === child.id ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'"
                  >
                    <div class="w-4"></div>
                    <div
                      class="w-4 h-4 rounded flex items-center justify-center"
                      :style="{ backgroundColor: child.color }"
                    >
                      <component :is="getCategoryIcon(child.icon)" :size="10" class="text-white" />
                    </div>
                    <span class="flex-1 text-sm truncate">{{ child.name }}</span>
                    <span class="text-xs text-slate-500">{{ child.count }}</span>
                    <div class="flex gap-1">
                      <button
                        @click.stop="editCategoryItem(child)"
                        class="p-1 hover:bg-slate-200 rounded transition-colors"
                        title="编辑"
                      >
                        <Edit :size="12" />
                      </button>
                      <button
                        @click.stop="deleteCategoryItem(child)"
                        class="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 :size="12" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：分类资产列表 -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div class="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 class="font-bold text-slate-900">
              {{ getSelectedCategoryName() }}
              <span class="text-sm font-normal text-slate-500 ml-2">({{ categoryAssets.length }} 件)</span>
            </h3>
            <div class="flex items-center gap-2">
              <button @click="editSelectedCategory" class="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors" :disabled="!selectedCategoryId">
                编辑分类
              </button>
              <button @click="deleteSelectedCategory" class="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors" :disabled="!selectedCategoryId">
                删除分类
              </button>
            </div>
          </div>
          <table class="w-full" v-if="selectedCategoryId">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">资产编号</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">资产名称</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">购买日期</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">价值</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">部门</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">使用人</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">状态</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-for="asset in categoryAssets" :key="asset.id" class="hover:bg-slate-50">
                <td class="px-6 py-4 font-mono text-sm text-indigo-600">{{ asset.assetCode }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div v-if="asset.assetClass === 'product'" class="p-1 bg-purple-100 rounded">
                      <Package :size="12" class="text-purple-600" />
                    </div>
                    <span class="font-medium text-slate-900">{{ asset.assetName }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600">{{ asset.purchaseDate }}</td>
                <td class="px-6 py-4 text-right text-sm font-medium text-slate-900">¥{{ asset.purchasePrice.toLocaleString() }}</td>
                <td class="px-6 py-4 text-sm text-slate-600">{{ asset.department }}</td>
                <td class="px-6 py-4 text-sm text-slate-600">{{ asset.user || '-' }}</td>
                <td class="px-6 py-4 text-center">
                  <span class="px-3 py-1 rounded-full text-xs font-semibold border" :class="getStatusBadgeClass(asset.status, asset.stock, asset.minStock)">
                    {{ asset.statusLabel }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-2">
                    <button @click="editAsset(asset)" class="text-indigo-600 hover:text-indigo-800 text-sm">编辑</button>
                    <button @click="deleteAsset(asset.id)" class="text-red-600 hover:text-red-800 text-sm">删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="text-center py-16 text-slate-400">
            <FolderTree :size="48" class="mx-auto mb-3 opacity-50" />
            <p class="text-sm font-medium">请选择左侧分类查看资产</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 资产编辑/新增模态框 -->
    <Teleport to="body">
      <div v-if="showAssetModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">{{ isEditMode ? '编辑资产' : '新增资产' }}</h3>
            <button @click="closeAssetModal" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" class="text-slate-500" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">资产编号 *</label>
                <input
                  v-model="assetForm.assetCode"
                  type="text"
                  placeholder="如：FA-001"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">资产名称 *</label>
                <input
                  v-model="assetForm.assetName"
                  type="text"
                  placeholder="请输入资产名称"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">资产类型</label>
                <select
                  v-model="assetForm.assetType"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="电子设备">电子设备</option>
                  <option value="办公家具">办公家具</option>
                  <option value="医疗器械">医疗器械</option>
                  <option value="运动器材">运动器材</option>
                  <option value="营养补充剂">营养补充剂</option>
                  <option value="药品">药品</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">购买日期 *</label>
                <input
                  v-model="assetForm.purchaseDate"
                  type="date"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">购买价格 *</label>
                <input
                  v-model="assetForm.purchasePrice"
                  type="number"
                  placeholder="请输入购买价格"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">使用人</label>
                <input
                  v-model="assetForm.user"
                  type="text"
                  placeholder="请输入使用人"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">所属部门</label>
                <select
                  v-model="assetForm.department"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">请选择部门</option>
                  <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">资产状态</label>
                <select
                  v-model="assetForm.status"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="in_use">在用</option>
                  <option value="idle">闲置</option>
                  <option value="maintenance">维修中</option>
                  <option value="scrapped">已报废</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">存放位置 *</label>
              <input
                v-model="assetForm.location"
                type="text"
                placeholder="请输入存放位置"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
              <textarea
                v-model="assetForm.remark"
                placeholder="请输入备注信息"
                rows="3"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="closeAssetModal" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="saveAsset" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
              保存
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 商品新增模态框 -->
    <Teleport to="body">
      <div v-if="showProductModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h3 class="text-lg font-bold text-white" style="color: white !important; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">新增商品（作为资产入库）</h3>
            <button @click="showProductModal = false" class="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X :size="20" class="text-white" style="color: white !important;" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">商品名称 *</label>
                <input
                  v-model="productForm.name"
                  type="text"
                  placeholder="请输入商品名称"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">品牌</label>
                <input
                  v-model="productForm.brand"
                  type="text"
                  placeholder="请输入品牌"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">SKU编码</label>
                <input
                  v-model="productForm.sku"
                  type="text"
                  placeholder="如：NUT-001"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">商品类型</label>
                <select
                  v-model="productForm.type"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="营养补充剂">营养补充剂</option>
                  <option value="药品">药品</option>
                  <option value="医疗器械">医疗器械</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">销售价格 *</label>
                <input
                  v-model="productForm.price"
                  type="number"
                  placeholder="0.00"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">成本价格</label>
                <input
                  v-model="productForm.costPrice"
                  type="number"
                  placeholder="0.00"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">单位</label>
                <input
                  v-model="productForm.unit"
                  type="text"
                  placeholder="件"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">库存数量 *</label>
                <input
                  v-model="productForm.stock"
                  type="number"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">库存预警线 *</label>
                <input
                  v-model="productForm.minStock"
                  type="number"
                  placeholder="10"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">规格</label>
              <input
                v-model="productForm.spec"
                type="text"
                placeholder="如：500mg * 30片"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">存放部门</label>
              <select
                v-model="productForm.department"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="">请选择部门</option>
                <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
              </select>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="showProductModal = false" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="saveProduct" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors">
              保存
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 盘点模态框 -->
    <Teleport to="body">
      <div v-if="showCheckModal && selectedAsset" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div class="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h3 class="text-lg font-bold text-black" style="color: black !important; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">
              {{ isBatchCheck ? `批量盘点 (${batchCheckIndex + 1}/${batchCheckAssets.length})` : '资产盘点' }}
            </h3>
            <button @click="closeCheckModal" class="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X :size="20" class="text-black" style="color: black!important;" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div class="bg-slate-50 rounded-lg p-4">
              <div class="flex justify-between mb-2">
                <span class="text-sm text-slate-600">资产名称</span>
                <span class="font-semibold text-slate-900">{{ selectedAsset.assetName }}</span>
              </div>
              <div class="flex justify-between mb-2">
                <span class="text-sm text-slate-600">资产编号</span>
                <span class="font-mono text-sm text-indigo-600">{{ selectedAsset.assetCode }}</span>
              </div>
              <div v-if="selectedAsset.sku" class="flex justify-between">
                <span class="text-sm text-slate-600">SKU</span>
                <span class="text-sm text-slate-700">{{ selectedAsset.sku }}</span>
              </div>
              <div class="flex justify-between mt-2">
                <span class="text-sm text-slate-600">上次盘点</span>
                <span class="text-sm text-slate-500">{{ selectedAsset.lastCheckDate }}</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">盘点日期 *</label>
              <input
                v-model="checkForm.checkDate"
                type="date"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">盘点人 *</label>
              <input
                v-model="checkForm.checker"
                type="text"
                placeholder="请输入盘点人"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <!-- 库存盘点（仅商品） -->
            <div v-if="selectedAsset.stock !== undefined">
              <label class="block text-sm font-medium text-slate-700 mb-1.5">实际库存</label>
              <input
                v-model="checkForm.actualStock"
                type="number"
                :placeholder="`当前库存: ${selectedAsset.stock}`"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p v-if="checkForm.actualStock && checkForm.actualStock !== selectedAsset.stock" class="text-xs text-amber-600 mt-1">
                库存差异: {{ checkForm.actualStock - selectedAsset.stock }} 件
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">盘点状态</label>
              <select
                v-model="checkForm.status"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="normal">正常</option>
                <option value="abnormal">异常</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">资产状况</label>
              <input
                v-model="checkForm.condition"
                type="text"
                placeholder="如：良好、需维修、需更换等"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
              <textarea
                v-model="checkForm.remark"
                placeholder="请输入备注信息"
                rows="3"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button v-if="isBatchCheck && batchCheckIndex > 0" @click="prevBatchCheck" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              上一个
            </button>
            <button @click="closeCheckModal" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="saveCheck" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
              {{ isBatchCheck ? (batchCheckIndex < batchCheckAssets.length - 1 ? '保存并下一个' : '完成盘点') : '提交盘点' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 批量盘点进度模态框 -->
    <Teleport to="body">
      <div v-if="showBatchCheckProgress" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md text-center p-8">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardCheck :size="32" class="text-green-600" />
          </div>
          <h3 class="text-xl font-bold text-slate-900 mb-2">批量盘点完成</h3>
          <p class="text-slate-600 mb-6">
            已完成 {{ batchCheckCompleted }} 个资产的盘点
          </p>
          <button
            @click="showBatchCheckProgress = false"
            class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </Teleport>

    <!-- 分类编辑模态框 -->
    <Teleport to="body">
      <div v-if="showCategoryEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h3 class="text-lg font-bold text-white" style="color: white !important; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">{{ editingCategory?.id ? '编辑分类' : '新增分类' }}</h3>
            <button @click="showCategoryEditModal = false" class="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X :size="20" class="text-white" style="color: white !important;" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">分类名称 *</label>
              <input
                v-model="categoryEditForm.name"
                type="text"
                placeholder="请输入分类名称"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">图标</label>
              <div class="grid grid-cols-6 gap-2">
                <button
                  v-for="icon in iconOptions"
                  :key="icon.value"
                  @click="categoryEditForm.icon = icon.value"
                  class="p-2 rounded-lg border-2 flex items-center justify-center transition-all"
                  :class="categoryEditForm.icon === icon.value ? 'border-purple-500 bg-purple-50' : 'border-slate-200 hover:border-slate-300'"
                >
                  <component :is="icon.component" :size="18" />
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">颜色</label>
              <div class="flex gap-2">
                <button
                  v-for="color in colorOptions"
                  :key="color"
                  @click="categoryEditForm.color = color"
                  class="w-8 h-8 rounded-full border-2 transition-all"
                  :class="categoryEditForm.color === color ? 'border-slate-800 scale-110' : 'border-slate-200'"
                  :style="{ backgroundColor: color }"
                />
              </div>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="showCategoryEditModal = false" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="saveCategoryEdit" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors">
              保存
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 资产调拨模态框 -->
    <Teleport to="body">
      <div v-if="showTransferModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg">
          <div class="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h3 class="text-lg font-bold text-white" style="color: white !important; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">资产调拨</h3>
            <button @click="showTransferModal = false" class="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X :size="20" class="text-white" style="color: white !important;" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <!-- 已选择资产列表 -->
            <div class="bg-slate-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              <div class="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                <Package :size="16" class="text-green-600" />
                已选择 {{ selectedAssets.length }} 个资产
              </div>
              <div class="space-y-2">
                <div v-for="id in selectedAssets" :key="id" class="flex items-center justify-between text-sm bg-white px-3 py-2 rounded border border-slate-200">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-indigo-600">{{ assets?.value?.find(a => a.id === id)?.assetCode }}</span>
                    <span class="text-slate-700">{{ assets?.value?.find(a => a.id === id)?.assetName }}</span>
                  </div>
                  <span class="text-xs text-slate-500">{{ assets?.value?.find(a => a.id === id)?.department }}</span>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">目标部门 *</label>
              <select
                v-model="transferForm.targetDepartment"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">请选择目标部门</option>
                <option v-for="dept in departments" :key="dept" :value="dept">{{ dept }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">目标使用人</label>
              <input
                v-model="transferForm.targetUser"
                type="text"
                placeholder="请输入目标使用人（可选）"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">调拨日期</label>
              <input
                v-model="transferForm.transferDate"
                type="date"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
              <textarea
                v-model="transferForm.remark"
                placeholder="请输入备注信息"
                rows="3"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            <!-- 提示信息 -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
              <Info :size="16" class="text-blue-600 flex-shrink-0 mt-0.5" />
              <p class="text-xs text-blue-700">
                调拨后，资产的所属部门和使用人将被更新。操作将记录在资产历史中。
              </p>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="showTransferModal = false" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="saveTransfer" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
              确认调拨
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 资产详情模态框 -->
    <Teleport to="body">
      <div v-if="showDetailModal && detailAsset" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <h3 class="text-lg font-bold text-white" style="color: white !important; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">资产详情</h3>
            <button @click="showDetailModal = false" class="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X :size="20" class="text-white" style="color: white !important;" />
            </button>
          </div>

          <div class="p-6 space-y-6">
            <!-- 基本信息 -->
            <div class="bg-slate-50 rounded-xl p-4">
              <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Box :size="18" class="text-indigo-600" />
                基本信息
              </h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-slate-500">资产编号</span>
                  <div class="font-mono font-semibold text-indigo-600">{{ detailAsset.assetCode }}</div>
                </div>
                <div>
                  <span class="text-slate-500">SKU</span>
                  <div class="font-mono text-sm text-slate-700">{{ detailAsset.sku || '-' }}</div>
                </div>
                <div>
                  <span class="text-slate-500">资产名称</span>
                  <div class="font-semibold text-slate-900">{{ detailAsset.assetName }}</div>
                </div>
                <div>
                  <span class="text-slate-500">资产类型</span>
                  <div class="font-medium text-slate-900">{{ detailAsset.assetType }}</div>
                </div>
                <div>
                  <span class="text-slate-500">资产类别</span>
                  <div>
                    <span v-if="detailAsset.assetClass === 'product'" class="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                      库存商品
                    </span>
                    <span v-else class="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      固定资产
                    </span>
                  </div>
                </div>
                <div>
                  <span class="text-slate-500">资产状态</span>
                  <div>
                    <span class="px-2 py-1 rounded-full text-xs font-semibold border" :class="getStatusBadgeClass(detailAsset.status, detailAsset.stock, detailAsset.minStock)">
                      {{ detailAsset.statusLabel }}
                    </span>
                  </div>
                </div>
                <div>
                  <span class="text-slate-500">购买日期</span>
                  <div class="font-medium text-slate-900">{{ detailAsset.purchaseDate }}</div>
                </div>
                <div>
                  <span class="text-slate-500">购买价格</span>
                  <div class="font-bold text-lg text-green-600">¥{{ detailAsset.purchasePrice.toLocaleString() }}</div>
                </div>
                <div v-if="detailAsset.stock !== undefined">
                  <span class="text-slate-500">当前库存</span>
                  <div class="font-medium text-slate-900">{{ detailAsset.stock }} 件</div>
                </div>
                <div v-if="detailAsset.spec">
                  <span class="text-slate-500">规格</span>
                  <div class="font-medium text-slate-900">{{ detailAsset.spec }}</div>
                </div>
              </div>
            </div>

            <!-- 使用信息 -->
            <div class="bg-blue-50 rounded-xl p-4">
              <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Building :size="18" class="text-blue-600" />
                使用信息
              </h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-slate-500">所属部门</span>
                  <div>
                    <span class="px-2 py-1 rounded-full text-xs font-semibold" :class="getDepartmentBadgeClass(detailAsset.department)">
                      {{ detailAsset.department }}
                    </span>
                  </div>
                </div>
                <div>
                  <span class="text-slate-500">使用人</span>
                  <div class="font-medium text-slate-900">{{ detailAsset.user || '暂无' }}</div>
                </div>
                <div class="col-span-2">
                  <span class="text-slate-500">存放位置</span>
                  <div class="font-medium text-slate-900">{{ detailAsset.location }}</div>
                </div>
              </div>
            </div>

            <!-- 维护信息 -->
            <div class="bg-amber-50 rounded-xl p-4">
              <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock :size="18" class="text-amber-600" />
                维护信息
              </h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-slate-500">上次盘点</span>
                  <div class="font-medium text-slate-900">{{ detailAsset.lastCheckDate }}</div>
                </div>
                <div>
                  <span class="text-slate-500">盘点记录</span>
                  <div class="font-medium text-indigo-600">
                    {{ (checkRecords.value || []).filter(r => r.assetCode === detailAsset.assetCode).length }} 次
                  </div>
                </div>
              </div>
            </div>

            <!-- 备注 -->
            <div v-if="detailAsset.remark" class="bg-slate-50 rounded-xl p-4">
              <h4 class="font-bold text-slate-900 mb-2">备注</h4>
              <p class="text-sm text-slate-600">{{ detailAsset.remark }}</p>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm text-slate-500">
              <Clock :size="14" />
              <span>最后更新: {{ detailAsset.lastCheckDate }}</span>
            </div>
            <div class="flex items-center gap-3">
              <button @click="showDetailModal = false" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                关闭
              </button>
              <button @click="printAssetDetail(detailAsset)" class="px-3 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5" title="打印资产详情">
                <Package :size="14" />
                <span>打印</span>
              </button>
              <button @click="handleQuickTransfer(detailAsset)" class="px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1.5">
                <ArrowRightLeft :size="14" />
                <span>调拨</span>
              </button>
              <button @click="showDetailModal = false; openCheckModal(detailAsset)" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
                盘点
              </button>
              <button @click="showDetailModal = false; editAsset(detailAsset)" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-1.5">
                <Edit3 :size="14" />
                <span>编辑</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Box,
  ClipboardCheck,
  Plus,
  Search,
  DollarSign,
  CheckCircle,
  Clock,
  Calendar,
  Edit,
  Edit3,
  Trash2,
  X,
  Building,
  FolderTree,
  Laptop,
  Armchair,
  Activity,
  Dumbbell,
  Package,
  Download,
  ArrowRight,
  ArrowRightLeft,
  QrCode,
  Pill,
  ChevronDown,
  AlertTriangle,
  Eye,
  Info
} from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import ConfirmDialog from '@/components/shared/ConfirmDialog.vue'
import Toast from '@/components/shared/Toast.vue'
import { DEPARTMENTS, getDepartmentBadgeClass } from '@/data'
import * as XLSX from 'xlsx'

interface FixedAsset {
  id: string
  assetCode: string
  assetName: string
  assetType: string
  purchaseDate: string
  purchasePrice: number
  user: string
  department: string
  status: 'in_use' | 'idle' | 'maintenance' | 'scrapped' | 'low_stock' | 'out_of_stock'
  statusLabel: string
  location: string
  lastCheckDate: string
  remark?: string
  assetClass: 'fixed' | 'product'
  sku?: string
  stock?: number
  minStock?: number
  spec?: string
  barcode?: string
  categoryId?: string
}

interface CheckRecord {
  id: string
  checkDate: string
  assetCode: string
  assetName: string
  checker: string
  status: 'normal' | 'abnormal'
  statusLabel: string
  condition: string
  remark: string
  createdAt: string
}

interface CategoryNode {
  id: string
  name: string
  icon: string
  color: string
  count: number
  totalValue: number
  children?: CategoryNode[]
  parentId?: string
}

type AssetView = 'fixed' | 'department' | 'category' | 'check'
type AssetStatus = 'in_use' | 'idle' | 'maintenance' | 'scrapped' | 'low_stock' | 'out_of_stock'

const currentView = ref<AssetView>('fixed')
const searchText = ref('')
const typeFilter = ref('')
const assetClassFilter = ref('')
const statusFilter = ref('')
const departmentFilter = ref('')
const checkDateFilter = ref('')
const checkStatusFilter = ref('')
const selectedDepartment = ref('')
const selectedCategory = ref('')
const selectedCategoryId = ref<string | null>(null)

// 部门视图相关状态
const deptSearchText = ref('')
const deptStatusFilter = ref('')
const deptTypeFilter = ref('')
const selectedDeptAssets = ref<string[]>([])

const showAssetModal = ref(false)
const showProductModal = ref(false)
const showCheckModal = ref(false)
const showDetailModal = ref(false)
const showTransferModal = ref(false)
const showCategoryEditModal = ref(false)
const showBatchCheckProgress = ref(false)
const isEditMode = ref(false)
const isBatchCheck = ref(false)
const batchCheckIndex = ref(0)
const batchCheckAssets = ref<FixedAsset[]>([])
const batchCheckCompleted = ref(0)
const selectedAsset = ref<FixedAsset | null>(null)
const detailAsset = ref<FixedAsset | null>(null)
const selectedAssets = ref<string[]>([])
const expandedCategories = ref<Set<string>>(new Set())

const { toast: toastFunc } = useToast()

const confirm = ref({
  show: false,
  title: '',
  message: '',
  type: 'warning' as 'warning' | 'danger',
  onConfirm: () => {},
  onCancel: () => {}
})

const assetForm = ref({
  assetCode: '',
  assetName: '',
  assetType: '电子设备',
  purchaseDate: '',
  purchasePrice: '',
  user: '',
  department: '',
  status: 'in_use' as AssetStatus,
  location: '',
  remark: ''
})

const productForm = ref({
  name: '',
  brand: '',
  sku: '',
  type: '营养补充剂',
  price: '',
  costPrice: '',
  unit: '件',
  stock: '',
  minStock: '',
  spec: '',
  department: ''
})

const checkForm = ref({
  checkDate: new Date().toISOString().split('T')[0],
  checker: '',
  status: 'normal' as 'normal' | 'abnormal',
  condition: '',
  remark: '',
  actualStock: undefined as number | undefined
})

const transferForm = ref({
  targetDepartment: '',
  targetUser: '',
  transferDate: new Date().toISOString().split('T')[0],
  remark: ''
})

const editingCategory = ref<CategoryNode | null>(null)
const categoryEditForm = ref({
  name: '',
  icon: 'Package',
  color: '#64748b'
})

// 图标选项
const iconOptions = [
  { value: 'Package', component: Package },
  { value: 'Laptop', component: Laptop },
  { value: 'Pill', component: Pill },
  { value: 'Activity', component: Activity },
  { value: 'Dumbbell', component: Dumbbell },
  { value: 'Armchair', component: Armchair }
]

const colorOptions = ['#8b5cf6', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#64748b']

// 分类树数据
const categoryTree = ref<CategoryNode[]>([
  {
    id: 'electronics',
    name: '电子设备',
    icon: 'Laptop',
    color: '#6366f1',
    count: 0,
    totalValue: 0,
    children: [
      { id: 'electronics-computer', name: '电脑设备', icon: 'Laptop', color: '#6366f1', count: 0, totalValue: 0, parentId: 'electronics' },
      { id: 'electronics-printer', name: '打印设备', icon: 'Package', color: '#6366f1', count: 0, totalValue: 0, parentId: 'electronics' }
    ]
  },
  {
    id: 'furniture',
    name: '办公家具',
    icon: 'Armchair',
    color: '#8b5cf6',
    count: 0,
    totalValue: 0,
    children: [
      { id: 'furniture-chair', name: '椅子', icon: 'Armchair', color: '#8b5cf6', count: 0, totalValue: 0, parentId: 'furniture' },
      { id: 'furniture-desk', name: '桌子', icon: 'Package', color: '#8b5cf6', count: 0, totalValue: 0, parentId: 'furniture' }
    ]
  },
  {
    id: 'medical',
    name: '医疗器械',
    icon: 'Activity',
    color: '#06b6d4',
    count: 0,
    totalValue: 0,
    children: []
  },
  {
    id: 'sports',
    name: '运动器材',
    icon: 'Dumbbell',
    color: '#10b981',
    count: 0,
    totalValue: 0,
    children: []
  },
  {
    id: 'nutrition',
    name: '营养补充剂',
    icon: 'Pill',
    color: '#f59e0b',
    count: 0,
    totalValue: 0,
    children: [
      { id: 'nutrition-protein', name: '蛋白粉', icon: 'Package', color: '#f59e0b', count: 0, totalValue: 0, parentId: 'nutrition' },
      { id: 'nutrition-vitamin', name: '维生素', icon: 'Pill', color: '#f59e0b', count: 0, totalValue: 0, parentId: 'nutrition' }
    ]
  },
  {
    id: 'medicine',
    name: '药品',
    icon: 'Pill',
    color: '#ef4444',
    count: 0,
    totalValue: 0,
    children: []
  },
  {
    id: 'other',
    name: '其他',
    icon: 'Package',
    color: '#6b7280',
    count: 0,
    totalValue: 0,
    children: []
  }
])

// 默认展开有子分类的根分类
expandedCategories.value = new Set(
  categoryTree.value.filter(cat => cat.children && cat.children.length > 0).map(cat => cat.id)
)

const assets = ref<FixedAsset[]>([
  // 固定资产
  {
    id: '1',
    assetCode: 'FA-001',
    assetName: 'MacBook Pro 16"',
    assetType: '电子设备',
    purchaseDate: '2025-03-15',
    purchasePrice: 18999,
    user: '张教练',
    department: '教练',
    status: 'in_use',
    statusLabel: '在用',
    location: '总部A座302',
    lastCheckDate: '2026-01-15',
    assetClass: 'fixed',
    categoryId: 'electronics-computer'
  },
  {
    id: '2',
    assetCode: 'FA-003',
    assetName: '办公椅 Herman Miller',
    assetType: '办公家具',
    purchaseDate: '2025-02-10',
    purchasePrice: 3500,
    user: '王财务',
    department: '财务',
    status: 'in_use',
    statusLabel: '在用',
    location: '总部B座201',
    lastCheckDate: '2025-12-20',
    assetClass: 'fixed',
    categoryId: 'furniture-chair'
  },
  {
    id: '4',
    assetCode: 'FA-004',
    assetName: '跑步机',
    assetType: '运动器材',
    purchaseDate: '2024-11-05',
    purchasePrice: 8800,
    user: '',
    department: '教练',
    status: 'maintenance',
    statusLabel: '维修中',
    location: '健身房',
    lastCheckDate: '2026-01-05',
    assetClass: 'fixed',
    categoryId: 'sports'
  },
  {
    id: '5',
    assetCode: 'FA-005',
    assetName: '打印机 HP LaserJet',
    assetType: '电子设备',
    purchaseDate: '2024-08-15',
    purchasePrice: 2800,
    user: '赵技术',
    department: '技术',
    status: 'in_use',
    statusLabel: '在用',
    location: '技术办公室',
    lastCheckDate: '2025-11-20',
    assetClass: 'fixed',
    categoryId: 'electronics-printer'
  },
  {
    id: '7',
    assetCode: 'FA-007',
    assetName: '办公桌',
    assetType: '办公家具',
    purchaseDate: '2024-06-15',
    purchasePrice: 1200,
    user: '钱财务',
    department: '财务',
    status: 'in_use',
    statusLabel: '在用',
    location: '财务办公室',
    lastCheckDate: '2025-12-15',
    assetClass: 'fixed',
    categoryId: 'furniture-desk'
  },
  {
    id: '8',
    assetCode: 'FA-008',
    assetName: '椭圆机',
    assetType: '运动器材',
    purchaseDate: '2024-09-20',
    purchasePrice: 6500,
    user: '',
    department: '教练',
    status: 'idle',
    statusLabel: '闲置',
    location: '健身房',
    lastCheckDate: '2025-11-30',
    assetClass: 'fixed',
    categoryId: 'sports'
  },
  // 库存商品
  {
    id: 'prod-001',
    assetCode: 'PRD-001',
    assetName: '乳清蛋白粉',
    assetType: '营养补充剂',
    purchaseDate: '2025-01-10',
    purchasePrice: 320,
    user: '',
    department: '运营',
    status: 'in_use',
    statusLabel: '库存充足',
    location: '仓库A区',
    lastCheckDate: '2026-01-20',
    assetClass: 'product',
    sku: 'NUT-001',
    stock: 120,
    minStock: 20,
    spec: '5lbs/桶',
    barcode: '6901234567890',
    categoryId: 'nutrition-protein'
  },
  {
    id: 'prod-002',
    assetCode: 'PRD-002',
    assetName: '深海鱼油软胶囊',
    assetType: '营养补充剂',
    purchaseDate: '2025-02-15',
    purchasePrice: 120,
    user: '',
    department: '运营',
    status: 'low_stock',
    statusLabel: '库存不足',
    location: '仓库A区',
    lastCheckDate: '2026-01-10',
    assetClass: 'product',
    sku: 'NUT-002',
    stock: 15,
    minStock: 30,
    spec: '400粒/瓶',
    barcode: '6901234567891',
    categoryId: 'nutrition-vitamin'
  },
  {
    id: 'prod-003',
    assetCode: 'PRD-003',
    assetName: '二甲双胍片',
    assetType: '药品',
    purchaseDate: '2025-03-01',
    purchasePrice: 15,
    user: '',
    department: '运营',
    status: 'in_use',
    statusLabel: '库存充足',
    location: '药品柜',
    lastCheckDate: '2026-01-18',
    assetClass: 'product',
    sku: 'MED-001',
    stock: 500,
    minStock: 100,
    spec: '0.5g*20片',
    barcode: '6901234567892',
    categoryId: 'medicine'
  },
  {
    id: 'prod-004',
    assetCode: 'PRD-004',
    assetName: '雅培瞬感传感器',
    assetType: '医疗器械',
    purchaseDate: '2025-01-20',
    purchasePrice: 320,
    user: '',
    department: '运营',
    status: 'low_stock',
    statusLabel: '库存不足',
    location: '仓库B区',
    lastCheckDate: '2026-01-12',
    assetClass: 'product',
    sku: 'EQP-001',
    stock: 8,
    minStock: 10,
    spec: '1枚装(14天)',
    barcode: '6901234567893',
    categoryId: 'medical'
  },
  {
    id: 'prod-005',
    assetCode: 'PRD-005',
    assetName: '复合维生素B族',
    assetType: '营养补充剂',
    purchaseDate: '2025-04-01',
    purchasePrice: 75,
    user: '',
    department: '运营',
    status: 'out_of_stock',
    statusLabel: '缺货',
    location: '仓库A区',
    lastCheckDate: '2026-01-05',
    assetClass: 'product',
    sku: 'NUT-003',
    stock: 0,
    minStock: 50,
    spec: '120片/瓶',
    barcode: '6901234567894',
    categoryId: 'nutrition-vitamin'
  },
  {
    id: 'prod-006',
    assetCode: 'PRD-006',
    assetName: '电子血压计',
    assetType: '医疗器械',
    purchaseDate: '2025-02-20',
    purchasePrice: 200,
    user: '',
    department: '运营',
    status: 'in_use',
    statusLabel: '库存充足',
    location: '设备柜',
    lastCheckDate: '2026-01-19',
    assetClass: 'product',
    sku: 'EQP-002',
    stock: 67,
    minStock: 15,
    spec: 'HEM-7121',
    barcode: '6901234567896',
    categoryId: 'medical'
  },
  {
    id: 'prod-007',
    assetCode: 'PRD-007',
    assetName: '左旋肉碱',
    assetType: '营养补充剂',
    purchaseDate: '2025-05-10',
    purchasePrice: 110,
    user: '',
    department: '运营',
    status: 'low_stock',
    statusLabel: '库存不足',
    location: '仓库A区',
    lastCheckDate: '2026-01-08',
    assetClass: 'product',
    sku: 'NUT-004',
    stock: 15,
    minStock: 20,
    spec: '60片/瓶',
    barcode: '6901234567897',
    categoryId: 'nutrition-protein'
  }
])

const checkRecords = ref<CheckRecord[]>([
  {
    id: '1',
    checkDate: '2026-01-15',
    assetCode: 'FA-001',
    assetName: 'MacBook Pro 16"',
    checker: '王行政',
    status: 'normal',
    statusLabel: '正常',
    condition: '良好',
    remark: '设备运行正常，无损耗',
    createdAt: '2026-01-15 14:30'
  },
  {
    id: '2',
    checkDate: '2026-01-10',
    assetCode: 'PRD-002',
    assetName: '深海鱼油软胶囊',
    checker: '李行政',
    status: 'abnormal',
    statusLabel: '异常',
    condition: '库存差异',
    remark: '盘点库存15，系统显示20，差异-5',
    createdAt: '2026-01-10 10:15'
  },
  {
    id: '3',
    checkDate: '2025-12-20',
    assetCode: 'FA-003',
    assetName: '办公椅 Herman Miller',
    checker: '张行政',
    status: 'normal',
    statusLabel: '正常',
    condition: '良好',
    remark: '无异常',
    createdAt: '2025-12-20 16:00'
  }
])

// 部门列表 - 使用系统管理中的部门
const departments = ref<string[]>(DEPARTMENTS)

const statistics = computed(() => {
  const assetsList = assets.value || []
  const totalAssets = assetsList.length
  const totalValue = assetsList.reduce((sum, asset) => sum + asset.purchasePrice, 0)
  const inUseCount = assetsList.filter(asset => asset.status === 'in_use').length
  const productCount = assetsList.filter(asset => asset.assetClass === 'product').length

  // 计算待盘点资产（超过30天未盘点）
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const pendingCheck = assetsList.filter(asset => {
    const lastCheck = new Date(asset.lastCheckDate)
    return lastCheck < thirtyDaysAgo
  }).length

  return {
    totalAssets,
    totalValue,
    inUseCount,
    productCount,
    pendingCheck
  }
})

const filteredAssets = computed(() => {
  const assetsList = assets.value || []
  return assetsList.filter(asset => {
    const matchSearch = !searchText.value ||
      asset.assetCode.toLowerCase().includes(searchText.value.toLowerCase()) ||
      asset.assetName.includes(searchText.value) ||
      asset.sku?.toLowerCase().includes(searchText.value.toLowerCase())
    const matchType = !typeFilter.value || asset.assetType === typeFilter.value
    const matchStatus = !statusFilter.value || asset.status === statusFilter.value
    const matchDepartment = !departmentFilter.value || asset.department === departmentFilter.value
    const matchClass = !assetClassFilter.value || asset.assetClass === assetClassFilter.value
    return matchSearch && matchType && matchStatus && matchDepartment && matchClass
  })
})

// 部门统计
const departmentStatistics = computed(() => {
  const deptColors: Record<string, string> = {
    '教练': '#6366f1',
    '运营': '#f59e0b',
    '财务': '#3b82f6',
    '技术': '#64748b'
  }

  return departments.value.map(dept => {
    const deptAssets = (assets.value || []).filter(a => a.department === dept)
    return {
      department: dept,
      color: deptColors[dept] || '#64748b',
      assetCount: deptAssets.length,
      totalValue: deptAssets.reduce((sum, a) => sum + a.purchasePrice, 0),
      inUse: deptAssets.filter(a => a.status === 'in_use').length,
      idle: deptAssets.filter(a => a.status === 'idle').length
    }
  }).filter(stat => stat.assetCount > 0)
})

// 部门资产列表
const departmentAssets = computed(() => {
  if (!selectedDepartment.value) return assets.value || []
  return (assets.value || []).filter(asset => asset.department === selectedDepartment.value)
})

// 部门视图筛选后的资产列表
const filteredDeptAssets = computed(() => {
  let result = departmentAssets.value || []

  if (deptSearchText.value) {
    const search = deptSearchText.value.toLowerCase()
    result = result.filter(asset =>
      asset.assetCode.toLowerCase().includes(search) ||
      asset.assetName.toLowerCase().includes(search) ||
      asset.assetType?.toLowerCase().includes(search)
    )
  }

  if (deptStatusFilter.value) {
    result = result.filter(asset => asset.status === deptStatusFilter.value)
  }

  if (deptTypeFilter.value) {
    result = result.filter(asset => asset.assetType === deptTypeFilter.value)
  }

  return result
})

// 部门视图是否全选
const isAllDeptAssetsSelected = computed(() => {
  return filteredDeptAssets.value.length > 0 &&
    filteredDeptAssets.value.every(asset => selectedDeptAssets.value.includes(asset.id))
})

// 获取所有资产类型
const assetTypes = computed(() => {
  const types = new Set((assets.value || []).map(a => a.assetType).filter(Boolean))
  return Array.from(types).sort()
})

// 分类资产列表
const categoryAssets = computed(() => {
  if (!selectedCategoryId.value) return []
  return (assets.value || []).filter(asset => asset.categoryId === selectedCategoryId.value)
})

const filteredCheckRecords = computed(() => {
  return (checkRecords.value || []).filter(record => {
    const matchDate = !checkDateFilter.value || record.checkDate === checkDateFilter.value
    const matchStatus = !checkStatusFilter.value || record.status === checkStatusFilter.value
    return matchDate && matchStatus
  })
})

const getStatusBadgeClass = (status: string, stock?: number, minStock?: number) => {
  if (stock !== undefined) {
    if (stock === 0) return 'bg-red-100 text-red-800 border-red-200'
    if (minStock !== undefined && stock <= minStock) return 'bg-orange-100 text-orange-800 border-orange-200'
    return 'bg-green-100 text-green-800 border-green-200'
  }
  const classes: Record<string, string> = {
    in_use: 'bg-green-100 text-green-800 border-green-200',
    idle: 'bg-slate-100 text-slate-800 border-slate-200',
    maintenance: 'bg-amber-100 text-amber-800 border-amber-200',
    scrapped: 'bg-red-100 text-red-800 border-red-200'
  }
  return classes[status] || classes.idle
}

const getCategoryIcon = (iconName: string) => {
  const icon = iconOptions.find(i => i.value === iconName)
  return icon?.component || Package
}

const getSelectedCategoryName = () => {
  if (!selectedCategoryId.value) return '请选择分类'
  const findCategory = (nodes: CategoryNode[]): string | null => {
    for (const node of nodes) {
      if (node.id === selectedCategoryId.value) return node.name
      if (node.children) {
        const found = findCategory(node.children)
        if (found) return found
      }
    }
    return null
  }
  return findCategory(categoryTree.value) || '未知分类'
}

const selectCategory = (id: string) => {
  selectedCategoryId.value = id
}

const toggleCategoryExpand = (id: string) => {
  if (expandedCategories.value.has(id)) {
    expandedCategories.value.delete(id)
  } else {
    expandedCategories.value.add(id)
  }
}

const addRootCategory = () => {
  editingCategory.value = null
  categoryEditForm.value = { name: '', icon: 'Package', color: '#64748b' }
  showCategoryEditModal.value = true
}

const addSubCategory = (parentId: string) => {
  editingCategory.value = { id: '', name: '', icon: 'Package', color: '#64748b', count: 0, totalValue: 0, parentId }
  categoryEditForm.value = { name: '', icon: 'Package', color: '#64748b' }
  showCategoryEditModal.value = true
}

const editCategoryItem = (category: CategoryNode) => {
  editingCategory.value = category
  categoryEditForm.value = { name: category.name, icon: category.icon, color: category.color }
  showCategoryEditModal.value = true
}

const editSelectedCategory = () => {
  if (!selectedCategoryId.value) return
  const findCategory = (nodes: CategoryNode[]): CategoryNode | null => {
    for (const node of nodes) {
      if (node.id === selectedCategoryId.value) return node
      if (node.children) {
        const found = findCategory(node.children)
        if (found) return found
      }
    }
    return null
  }
  const category = findCategory(categoryTree.value)
  if (category) editCategoryItem(category)
}

const deleteCategoryItem = (category: CategoryNode) => {
  const hasAssets = assets.value.some(a => a.categoryId === category.id)
  if (hasAssets) {
    toast.error('无法删除', '该分类下还有资产，请先移动或删除资产')
    return
  }

  confirm.value = {
    show: true,
    title: '删除分类',
    message: `确定要删除分类 "${category.name}" 吗？`,
    type: 'danger',
    onConfirm: () => {
      const removeCategory = (nodes: CategoryNode[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === category.id) {
            nodes.splice(i, 1)
            return true
          }
          if (nodes[i].children) {
            if (removeCategory(nodes[i].children!)) return true
          }
        }
        return false
      }
      removeCategory(categoryTree.value)
      if (selectedCategoryId.value === category.id) selectedCategoryId.value = null
      toast.success('删除成功', `分类 "${category.name}" 已删除`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const deleteSelectedCategory = () => {
  if (!selectedCategoryId.value) return
  const findCategory = (nodes: CategoryNode[]): CategoryNode | null => {
    for (const node of nodes) {
      if (node.id === selectedCategoryId.value) return node
      if (node.children) {
        const found = findCategory(node.children)
        if (found) return found
      }
    }
    return null
  }
  const category = findCategory(categoryTree.value)
  if (category) deleteCategoryItem(category)
}

const saveCategoryEdit = () => {
  if (!categoryEditForm.value.name.trim()) {
    toast.error('请输入分类名称')
    return
  }

  if (editingCategory.value?.id) {
    // 编辑现有分类
    const updateCategory = (nodes: CategoryNode[]): boolean => {
      for (const node of nodes) {
        if (node.id === editingCategory.value!.id) {
          node.name = categoryEditForm.value.name
          node.icon = categoryEditForm.value.icon
          node.color = categoryEditForm.value.color
          return true
        }
        if (node.children) {
          if (updateCategory(node.children)) return true
        }
      }
      return false
    }
    updateCategory(categoryTree.value)
    toast.success('编辑成功', `分类 "${categoryEditForm.value.name}" 已更新`)
  } else {
    // 新增分类
    const newCategory: CategoryNode = {
      id: `cat-${Date.now()}`,
      name: categoryEditForm.value.name,
      icon: categoryEditForm.value.icon,
      color: categoryEditForm.value.color,
      count: 0,
      totalValue: 0,
      parentId: editingCategory.value?.parentId
    }

    if (editingCategory.value?.parentId) {
      // 添加子分类
      const addToParent = (nodes: CategoryNode[]): boolean => {
        for (const node of nodes) {
          if (node.id === editingCategory.value!.parentId) {
            if (!node.children) node.children = []
            node.children.push(newCategory)
            return true
          }
          if (node.children) {
            if (addToParent(node.children)) return true
          }
        }
        return false
      }
      addToParent(categoryTree.value)
    } else {
      // 添加根分类
      categoryTree.value.push(newCategory)
    }
    toast.success('添加成功', `分类 "${categoryEditForm.value.name}" 已添加`)
  }

  showCategoryEditModal.value = false
  editingCategory.value = null
}

const openAssetModal = () => {
  isEditMode.value = false
  assetForm.value = {
    assetCode: `FA-${String((assets.value || []).filter(a => a.assetClass === 'fixed').length + 1).padStart(3, '0')}`,
    assetName: '',
    assetType: '电子设备',
    purchaseDate: '',
    purchasePrice: '',
    user: '',
    department: '',
    status: 'in_use',
    location: '',
    remark: ''
  }
  showAssetModal.value = true
}

const openProductModal = () => {
  productForm.value = {
    name: '',
    brand: '',
    sku: '',
    type: '营养补充剂',
    price: '',
    costPrice: '',
    unit: '件',
    stock: '',
    minStock: '',
    spec: '',
    department: ''
  }
  showProductModal.value = true
}

const closeAssetModal = () => {
  showAssetModal.value = false
  selectedAsset.value = null
}

const editAsset = (asset: FixedAsset) => {
  isEditMode.value = true
  selectedAsset.value = asset
  if (asset.assetClass === 'product') {
    // 编辑商品
    productForm.value = {
      name: asset.assetName,
      brand: asset.assetName.split(' ')[0] || '',
      sku: asset.sku || '',
      type: asset.assetType,
      price: String(asset.purchasePrice),
      costPrice: '',
      unit: '件',
      stock: String(asset.stock || 0),
      minStock: String(asset.minStock || 0),
      spec: asset.spec || '',
      department: asset.department
    }
    showProductModal.value = true
  } else {
    // 编辑固定资产
    assetForm.value = {
      assetCode: asset.assetCode,
      assetName: asset.assetName,
      assetType: asset.assetType,
      purchaseDate: asset.purchaseDate,
      purchasePrice: String(asset.purchasePrice),
      user: asset.user,
      department: asset.department,
      status: asset.status,
      location: asset.location,
      remark: asset.remark || ''
    }
    showAssetModal.value = true
  }
}

const saveAsset = () => {
  if (!assetForm.value.assetName || !assetForm.value.purchaseDate || !assetForm.value.purchasePrice || !assetForm.value.location) {
    toast.error('请填写必填项')
    return
  }

  const action = isEditMode.value ? '更新' : '添加'
  const assetName = assetForm.value.assetName

  if (isEditMode.value && selectedAsset.value) {
    // 编辑模式 - 显示确认对话框
    confirm.value = {
      show: true,
      title: '确认更新',
      message: `确定要更新资产「${assetName}」的信息吗？`,
      type: 'warning',
      onConfirm: () => {
        assets.value = (assets.value || []).map(asset =>
          asset.id === selectedAsset.value!.id && asset.assetClass === 'fixed'
            ? {
                ...asset,
                assetCode: assetForm.value.assetCode,
                assetName: assetForm.value.assetName,
                assetType: assetForm.value.assetType,
                purchaseDate: assetForm.value.purchaseDate,
                purchasePrice: parseFloat(assetForm.value.purchasePrice),
                user: assetForm.value.user,
                department: assetForm.value.department,
                status: assetForm.value.status,
                statusLabel: {
                  in_use: '在用',
                  idle: '闲置',
                  maintenance: '维修中',
                  scrapped: '已报废'
                }[assetForm.value.status],
                location: assetForm.value.location,
                remark: assetForm.value.remark
              }
            : asset
        )
        toast.success('更新成功', `资产 "${assetName}" 已更新`)
        showAssetModal.value = false
        selectedAsset.value = null
      },
      onCancel: () => {}
    }
  } else {
    // 新增模式
    const newAsset: FixedAsset = {
      id: Date.now().toString(),
      assetCode: assetForm.value.assetCode,
      assetName: assetForm.value.assetName,
      assetType: assetForm.value.assetType,
      purchaseDate: assetForm.value.purchaseDate,
      purchasePrice: parseFloat(assetForm.value.purchasePrice),
      user: assetForm.value.user,
      department: assetForm.value.department,
      status: assetForm.value.status,
      statusLabel: {
        in_use: '在用',
        idle: '闲置',
        maintenance: '维修中',
        scrapped: '已报废'
      }[assetForm.value.status],
      location: assetForm.value.location,
      lastCheckDate: new Date().toISOString().split('T')[0],
      remark: assetForm.value.remark,
      assetClass: 'fixed'
    }
    if (!assets.value) assets.value = []
    assets.value.unshift(newAsset)
    toast.success('添加成功', `资产 "${assetName}" 已添加`)
    showAssetModal.value = false
    selectedAsset.value = null
  }
}

const saveProduct = () => {
  if (!productForm.value.name || !productForm.value.price || !productForm.value.stock) {
    toast.error('请填写必填项')
    return
  }

  const stock = parseFloat(productForm.value.stock)
  const minStock = parseFloat(productForm.value.minStock || '10')
  const price = parseFloat(productForm.value.price)

  let status: AssetStatus = 'in_use'
  let statusLabel = '库存充足'
  if (stock === 0) {
    status = 'out_of_stock'
    statusLabel = '缺货'
  } else if (stock <= minStock) {
    status = 'low_stock'
    statusLabel = '库存不足'
  }

  const newAsset: FixedAsset = {
    id: `prod-${Date.now()}`,
    assetCode: `PRD-${String((assets.value || []).filter(a => a.assetClass === 'product').length + 1).padStart(3, '0')}`,
    assetName: productForm.value.name,
    assetType: productForm.value.type,
    purchaseDate: new Date().toISOString().split('T')[0],
    purchasePrice: price,
    user: '',
    department: productForm.value.department || '运营',
    status,
    statusLabel,
    location: '仓库',
    lastCheckDate: new Date().toISOString().split('T')[0],
    assetClass: 'product',
    sku: productForm.value.sku,
    stock,
    minStock,
    spec: productForm.value.spec
  }

  if (!assets.value) assets.value = []
  assets.value.unshift(newAsset)
  toast.success('添加成功', `商品 "${productForm.value.name}" 已入库`)
  showProductModal.value = false
}

const deleteAsset = (id: string) => {
  const asset = (assets.value || []).find(a => a.id === id)
  if (!asset) return

  confirm.value = {
    show: true,
    title: '删除资产',
    message: `确定要删除${asset.assetClass === 'product' ? '商品' : '资产'} "${asset.assetName}" 吗？此操作不可恢复。`,
    type: 'danger',
    onConfirm: () => {
      assets.value = (assets.value || []).filter(a => a.id !== id)
      toast.success('删除成功', `${asset.assetClass === 'product' ? '商品' : '资产'} "${asset.assetName}" 已删除`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const openCheckModal = (asset: FixedAsset) => {
  selectedAsset.value = asset
  checkForm.value = {
    checkDate: new Date().toISOString().split('T')[0],
    checker: '',
    status: 'normal',
    condition: '',
    remark: '',
    actualStock: asset.stock
  }
  showCheckModal.value = true
}

const closeCheckModal = () => {
  showCheckModal.value = false
  isBatchCheck.value = false
  selectedAsset.value = null
}

const openQuickCheckModal = () => {
  // Check if there are any assets
  if (filteredAssets.value.length === 0) {
    toast.error('暂无资产', '当前没有可盘点的资产')
    return
  }

  // Switch to check view
  currentView.value = 'check'

  // Show helpful message
  toast.info('快速盘点', '请从资产列表中点击"盘点"按钮进行盘点，或勾选多个资产后使用"批量盘点"功能')
}

const startBatchCheck = () => {
  if (selectedAssets.value.length === 0) return
  batchCheckAssets.value = selectedAssets.value.map(id => (assets.value || []).find(a => a.id === id)!).filter(Boolean)
  batchCheckIndex.value = 0
  batchCheckCompleted.value = 0
  isBatchCheck.value = true

  // Open first asset
  openCheckModal(batchCheckAssets.value[0])
}

const prevBatchCheck = () => {
  if (batchCheckIndex.value > 0) {
    batchCheckIndex.value--
    openCheckModal(batchCheckAssets.value[batchCheckIndex.value])
  }
}

const saveCheck = () => {
  if (!selectedAsset.value || !checkForm.value.checker || !checkForm.value.condition) {
    toast.error('请填写必填项')
    return
  }

  // 更新库存（如果是商品）
  if (selectedAsset.value.assetClass === 'product' && checkForm.value.actualStock !== undefined) {
    assets.value = (assets.value || []).map(asset =>
      asset.id === selectedAsset.value!.id
        ? {
            ...asset,
            stock: checkForm.value.actualStock,
            status: checkForm.value.actualStock === 0 ? 'out_of_stock' : (
              checkForm.value.actualStock <= (asset.minStock || 0) ? 'low_stock' : 'in_use'
            ),
            statusLabel: checkForm.value.actualStock === 0 ? '缺货' : (
              checkForm.value.actualStock <= (asset.minStock || 0) ? '库存不足' : '库存充足'
            )
          }
        : asset
    )
  }

  // 更新最后盘点日期
  assets.value = (assets.value || []).map(asset =>
    asset.id === selectedAsset.value!.id
      ? { ...asset, lastCheckDate: checkForm.value.checkDate }
      : asset
  )

  const newRecord: CheckRecord = {
    id: Date.now().toString(),
    checkDate: checkForm.value.checkDate,
    assetCode: selectedAsset.value.assetCode,
    assetName: selectedAsset.value.assetName,
    checker: checkForm.value.checker,
    status: checkForm.value.status,
    statusLabel: checkForm.value.status === 'normal' ? '正常' : '异常',
    condition: checkForm.value.condition,
    remark: checkForm.value.remark + (selectedAsset.value.assetClass === 'product' && checkForm.value.actualStock !== undefined
      ? ` | 库存盘点: ${checkForm.value.actualStock} 件`
      : ''),
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
  }

  if (!checkRecords.value) checkRecords.value = []
  checkRecords.value.unshift(newRecord)

  // 批量盘点逻辑
  if (isBatchCheck.value) {
    batchCheckCompleted.value++
    const remaining = batchCheckAssets.value.length - batchCheckIndex.value - 1

    if (remaining > 0) {
      // 继续下一个
      batchCheckIndex.value++
      openCheckModal(batchCheckAssets.value[batchCheckIndex.value])
      toast.success('盘点成功', `已完成 ${batchCheckCompleted.value}/${batchCheckAssets.value.length}，继续下一个...`)
    } else {
      // 全部完成
      showCheckModal.value = false
      isBatchCheck.value = false
      showBatchCheckProgress.value = true
      selectedAssets.value = []
    }
  } else {
    toast.success('盘点成功', `已完成 "${selectedAsset.value.assetName}" 的盘点`)
    showCheckModal.value = false
  }

  selectedAsset.value = null
}

const viewAssetDetail = (asset: FixedAsset) => {
  detailAsset.value = asset
  showDetailModal.value = true
}

const handleQuickTransfer = (asset: FixedAsset) => {
  showDetailModal.value = false
  selectedAssets.value = [asset.id]
  selectedDeptAssets.value = []
  showTransferModal.value = true
}

const printAssetDetail = (asset: FixedAsset) => {
  // 打印资产详情
  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`
    <html>
      <head>
        <title>资产详情 - ${asset.assetName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          .row { display: flex; margin-bottom: 8px; }
          .label { width: 120px; font-weight: bold; color: #666; }
          .value { flex: 1; }
          .footer { margin-top: 30px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>资产详情</h1>
          <h2>${asset.assetName}</h2>
        </div>
        <div class="section">
          <div class="section-title">基本信息</div>
          <div class="row"><span class="label">资产编号:</span><span class="value">${asset.assetCode}</span></div>
          <div class="row"><span class="label">SKU:</span><span class="value">${asset.sku || '-'}</span></div>
          <div class="row"><span class="label">资产类型:</span><span class="value">${asset.assetType}</span></div>
          <div class="row"><span class="label">购买日期:</span><span class="value">${asset.purchaseDate}</span></div>
          <div class="row"><span class="label">购买价格:</span><span class="value">¥${asset.purchasePrice.toLocaleString()}</span></div>
        </div>
        <div class="section">
          <div class="section-title">使用信息</div>
          <div class="row"><span class="label">所属部门:</span><span class="value">${asset.department}</span></div>
          <div class="row"><span class="label">使用人:</span><span class="value">${asset.user || '暂无'}</span></div>
          <div class="row"><span class="label">存放位置:</span><span class="value">${asset.location}</span></div>
          <div class="row"><span class="label">状态:</span><span class="value">${asset.statusLabel}</span></div>
        </div>
        <div class="footer">
          打印时间: ${new Date().toLocaleString('zh-CN')}
        </div>
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
  toast.success('打印', '资产详情已发送到打印机')
}

const transferAsset = (asset: FixedAsset) => {
  selectedAssets.value = [asset.id]
  showTransferModal.value = true
}

// 部门视图相关方法
const toggleDeptAssetSelection = (id: string) => {
  if (selectedDeptAssets.value.includes(id)) {
    selectedDeptAssets.value = selectedDeptAssets.value.filter(sid => sid !== id)
  } else {
    selectedDeptAssets.value.push(id)
  }
}

const toggleAllDeptAssets = () => {
  if (isAllDeptAssetsSelected.value) {
    selectedDeptAssets.value = []
  } else {
    selectedDeptAssets.value = filteredDeptAssets.value.map(a => a.id)
  }
}

const transferSingleAsset = (asset: FixedAsset) => {
  selectedAssets.value = [asset.id]
  selectedDeptAssets.value = []
  showTransferModal.value = true
}

const batchTransfer = () => {
  if (selectedDeptAssets.value.length === 0) {
    toast.error('请先选择要调拨的资产')
    return
  }
  selectedAssets.value = [...selectedDeptAssets.value]
  showTransferModal.value = true
}

const exportDepartmentAssets = () => {
  const data = filteredDeptAssets.value.map(asset => ({
    '资产编号': asset.assetCode,
    '资产名称': asset.assetName,
    '类型': asset.assetType,
    '价值': asset.purchasePrice,
    '使用人': asset.user || '-',
    '状态': asset.statusLabel,
    '位置': asset.location
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '部门资产')
  XLSX.writeFile(wb, `${selectedDepartment.value}_资产_${new Date().toISOString().split('T')[0]}.xlsx`)

  toast.success('导出成功', `已导出 ${filteredDeptAssets.value.length} 条资产记录`)
}

const saveTransfer = () => {
  if (!transferForm.value.targetDepartment) {
    toast.error('请选择目标部门')
    return
  }

  const assetCodes = selectedAssets.value.map(id => {
    const asset = (assets.value || []).find(a => a.id === id)
    return asset?.assetCode
  }).filter(Boolean)

  const assetDetails = selectedAssets.value.map(id => {
    const asset = (assets.value || []).find(a => a.id === id)
    return asset ? `${asset.assetCode} - ${asset.assetName}` : ''
  }).filter(Boolean)

  // 显示确认对话框
  confirm.value = {
    show: true,
    title: '确认调拨',
    message: `确定要将以下 ${assetCodes.length} 个资产调拨至「${transferForm.value.targetDepartment}」吗？\n\n${assetDetails.join('\n')}`,
    type: 'warning',
    onConfirm: () => {
      // 执行调拨
      const transferDate = transferForm.value.transferDate || new Date().toISOString().split('T')[0]

      assets.value = (assets.value || []).map(asset =>
        selectedAssets.value.includes(asset.id)
          ? {
              ...asset,
              department: transferForm.value.targetDepartment,
              user: transferForm.value.targetUser || asset.user,
              lastTransferDate: transferDate
            }
          : asset
      )

      // 清空选择
      selectedAssets.value = []
      selectedDeptAssets.value = []

      toast.success('调拨成功', `已将 ${assetCodes.length} 个资产调拨至 ${transferForm.value.targetDepartment}`)

      // 关闭弹窗并重置表单
      showTransferModal.value = false
      transferForm.value = {
        targetDepartment: '',
        targetUser: '',
        transferDate: new Date().toISOString().split('T')[0],
        remark: ''
      }
    },
    onCancel: () => {
      // 用户取消，不执行任何操作
    }
  }
}

const openQRScanner = () => {
  // Focus on search input with a hint
  toast.info('扫码盘点', '请在下方搜索框中输入资产编号或名称进行查找')
  // Note: Actual QR code scanning would require additional camera/library integration
}

const exportAssets = () => {
  const data = filteredAssets.value.map(asset => ({
    '资产编号': asset.assetCode,
    '资产名称': asset.assetName,
    '资产类型': asset.assetType,
    '资产分类': asset.assetClass === 'fixed' ? '固定资产' : '库存商品',
    '价值': asset.purchasePrice,
    '使用人': asset.user || '-',
    '所属部门': asset.department,
    '状态': asset.statusLabel,
    '位置': asset.location,
    '购入日期': asset.purchaseDate,
    '最后盘点': asset.lastCheckDate || '-',
    '备注': asset.remark || '-'
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '资产清单')
  XLSX.writeFile(wb, `资产清单_${new Date().toISOString().split('T')[0]}.xlsx`)

  toast.success('导出成功', `已导出 ${filteredAssets.value.length} 条资产记录`)
}

const toggleSelectAll = () => {
  if (selectedAssets.value.length === filteredAssets.value.length) {
    selectedAssets.value = []
  } else {
    selectedAssets.value = filteredAssets.value.map(a => a.id)
  }
}

const toggleAssetSelection = (id: string) => {
  const index = selectedAssets.value.indexOf(id)
  if (index > -1) {
    selectedAssets.value.splice(index, 1)
  } else {
    selectedAssets.value.push(id)
  }
}

const clearSelection = () => {
  selectedAssets.value = []
}
</script>
