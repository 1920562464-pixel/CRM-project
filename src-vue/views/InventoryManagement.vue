<template>
  <div class="flex h-full" :style="{ background: 'var(--background-page)' }">
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

    <!-- 左侧分类树 -->
    <div
      ref="sidebarRef"
      class="flex flex-col"
      :style="{
        width: sidebarWidth + 'px',
        minWidth: '200px',
        maxWidth: '500px',
        background: 'var(--card)',
        borderRight: '1px solid var(--border)'
      }"
    >
      <div class="p-4 flex items-center justify-between" :style="{ borderBottom: '1px solid var(--border)' }">
        <h2 class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">商品分类</h2>
        <button
          @click="addRootCategory"
          class="p-1 rounded"
          :style="{ color: 'var(--text-secondary)' }"
          title="添加根分类"
        >
          <Plus :size="14" />
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-2">
        <button
          @click="selectedCategoryId = null"
          class="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors mb-1"
          :style="!selectedCategoryId ? {
            background: isBlackGold.value ? 'rgba(184, 134, 11, 0.15)' : '#eef2ff',
            color: isBlackGold.value ? '#D4A84A' : '#4338ca'
          } : {
            color: 'var(--text-regular)'
          }"
        >
          <Package :size="16" />
          <span>全部商品</span>
          <span class="ml-auto text-xs" :style="{ color: 'var(--text-disabled)' }">{{ products.length }}</span>
        </button>
        <div
          v-for="category in categoryTree"
          :key="category.id"
          class="category-item"
        >
          <div
            @click="selectCategory(category.id)"
            class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group"
            :style="selectedCategoryId === category.id ? {
              background: isBlackGold.value ? 'rgba(184, 134, 11, 0.15)' : '#eef2ff',
              color: isBlackGold.value ? '#D4A84A' : '#4338ca'
            } : {
              color: 'var(--text-regular)'
            }"
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
                class="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors group"
                :class="selectedCategoryId === child.id ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100'"
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

    <!-- 拖拽手柄 -->
    <div
      ref="resizerRef"
      @mousedown="startResize"
      class="w-1 cursor-col-resize transition-colors relative group"
      :style="{
        background: 'var(--border)',
        color: 'var(--text-secondary)'
      }"
      @mouseenter="$event.currentTarget.style.background = isBlackGold.value ? 'rgba(184, 134, 11, 0.3)' : 'rgba(79, 70, 229, 0.3)'"
      @mouseleave="$event.currentTarget.style.background = 'var(--border)'"
    >
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded opacity-0 group-hover:opacity-100 transition-opacity" :style="{ background: 'var(--text-disabled)' }"></div>
    </div>

    <!-- 右侧内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden" :style="{ background: 'var(--background-page)' }">
      <!-- 顶部统计卡片 -->
      <div class="p-4" :style="{
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)'
      }">
        <div class="grid grid-cols-4 gap-4 mb-4">
          <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-blue-600 mb-1">商品总数</p>
                <p class="text-2xl font-bold text-blue-700">{{ stats.totalProducts }}</p>
              </div>
              <Package :size="24" class="text-blue-400" />
            </div>
          </div>
          <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-green-600 mb-1">库存总数</p>
                <p class="text-2xl font-bold text-green-700">{{ stats.totalStock }}</p>
              </div>
              <TrendingUp :size="24" class="text-green-400" />
            </div>
          </div>
          <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-purple-600 mb-1">库存总值</p>
                <p class="text-lg font-bold text-purple-700">¥{{ stats.totalValue.toLocaleString() }}</p>
              </div>
              <Barcode :size="24" class="text-purple-400" />
            </div>
          </div>
          <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs text-orange-600 mb-1">预警商品</p>
                <p class="text-2xl font-bold text-orange-700">{{ stats.warningCount }}</p>
              </div>
              <AlertCircle :size="24" class="text-orange-400" />
            </div>
          </div>
        </div>

        <!-- 操作栏 -->
        <div class="flex items-center gap-3">
          <div class="flex-1 relative">
            <Search :size="18" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              v-model="searchText"
              @input="handleSearch"
              type="text"
              placeholder="搜索商品名称、SKU或品牌..."
              class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <button
            @click="showAdvancedFilter = !showAdvancedFilter"
            :class="`px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${showAdvancedFilter ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`"
          >
            <Filter :size="16" />
            筛选
          </button>
          <button
            @click="showBatchActions = !showBatchActions"
            :class="`px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${selectedProducts.length > 0 ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`"
            :disabled="selectedProducts.length === 0"
          >
            <Layers :size="16" />
            批量操作 ({{ selectedProducts.length }})
          </button>
          <button
            @click="openProductDialog()"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium"
          >
            <Plus :size="16" /> 新增商品
          </button>
        </div>

        <!-- 高级筛选面板 -->
        <div v-if="showAdvancedFilter" class="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div class="grid grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">库存状态</label>
              <select v-model="filterStatus" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="">全部</option>
                <option value="充足">充足</option>
                <option value="预警">预警</option>
                <option value="缺货">缺货</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">库存数量范围</label>
              <div class="flex gap-2 items-center">
                <input v-model.number="filterStockMin" type="number" placeholder="最小" class="flex-1 px-2 py-2 border border-slate-300 rounded text-sm">
                <span class="text-slate-400">-</span>
                <input v-model.number="filterStockMax" type="number" placeholder="最大" class="flex-1 px-2 py-2 border border-slate-300 rounded text-sm">
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1">价格范围</label>
              <div class="flex gap-2 items-center">
                <input v-model.number="filterPriceMin" type="number" placeholder="最小" class="flex-1 px-2 py-2 border border-slate-300 rounded text-sm">
                <span class="text-slate-400">-</span>
                <input v-model.number="filterPriceMax" type="number" placeholder="最大" class="flex-1 px-2 py-2 border border-slate-300 rounded text-sm">
              </div>
            </div>
            <div class="flex items-end gap-2">
              <button @click="applyAdvancedFilter" class="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">应用筛选</button>
              <button @click="resetFilter" class="px-3 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">重置</button>
            </div>
          </div>
        </div>

        <!-- 批量操作面板 -->
        <div v-if="showBatchActions && selectedProducts.length > 0" class="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div class="flex items-center justify-between">
            <span class="text-sm text-indigo-900">已选择 {{ selectedProducts.length }} 个商品</span>
            <div class="flex gap-2">
              <button @click="batchDelete" class="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700">批量删除</button>
              <button @click="batchExport" class="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700">批量导出</button>
              <button @click="selectedProducts = []" class="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-slate-50">取消选择</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab切换 -->
      <div class="bg-white border-b border-slate-200 px-4">
        <div class="flex gap-6">
          <button
            @click="activeTab = 'products'"
            :class="`px-1 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'products' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`"
          >
            商品列表
          </button>
          <button
            @click="activeTab = 'categories'"
            :class="`px-1 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'categories' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`"
          >
            分类管理
          </button>
          <button
            @click="activeTab = 'records'"
            :class="`px-1 py-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'records' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`"
          >
            出入库记录
            <span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">{{ records.length }}</span>
          </button>
          <button
            @click="activeTab = 'alert'"
            :class="`px-1 py-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              activeTab === 'alert' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`"
          >
            库存预警
            <span class="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs">{{ stats.warningCount }}</span>
          </button>
          <button
            @click="activeTab = 'import'"
            :class="`px-1 py-3 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'import' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-600 hover:text-slate-900'
            }`"
          >
            导入/导出
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-auto p-4">
        <!-- 商品列表 -->
        <div v-if="activeTab === 'products'" class="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <!-- 全选 -->
          <div v-if="filteredProducts.length > 0" class="px-4 py-2 bg-slate-50 border-b border-slate-200">
            <label class="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                :checked="selectedProducts.length === filteredProducts.length && filteredProducts.length > 0"
                :indeterminate="selectedProducts.length > 0 && selectedProducts.length < filteredProducts.length"
                @change="toggleSelectAll"
                class="rounded border-slate-300"
              />
              <span class="text-slate-600">{{ selectedProducts.length > 0 ? `已选择 ${selectedProducts.length} 项` : '全选当前页' }}</span>
            </label>
          </div>

          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedProducts.length === filteredProducts.length && filteredProducts.length > 0"
                    @change="toggleSelectAll"
                    class="rounded border-slate-300"
                  />
                </th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">商品名称</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">分类</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">成本价</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">销售价</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">库存</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">状态</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-for="product in filteredProducts" :key="product.id" :class="`hover:bg-slate-50 ${selectedProducts.includes(product.id) ? 'bg-indigo-50' : ''}`">
                <td class="px-4 py-4">
                  <input
                    type="checkbox"
                    :checked="selectedProducts.includes(product.id)"
                    @change="toggleSelectProduct(product.id)"
                    class="rounded border-slate-300"
                  />
                </td>
                <td class="px-6 py-4">
                  <div class="font-medium text-slate-900 text-sm">{{ product.name }}</div>
                  <div class="text-xs text-slate-500">{{ product.brand }} | {{ product.sku }}</div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="px-2 py-1 rounded text-xs font-medium"
                    :style="{ backgroundColor: getCategoryColor(product.category) + '20', color: getCategoryColor(product.category) }"
                  >
                    {{ getCategoryName(product.category) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-sm text-slate-600">¥{{ product.costPrice }}</td>
                <td class="px-6 py-4 text-right text-sm text-slate-600">¥{{ product.salePrice }}</td>
                <td class="px-6 py-4 text-right">
                  <span class="font-medium text-slate-900">{{ product.stock }}</span>
                  <span class="text-xs text-slate-400">/ {{ product.warningValue }}</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <span :class="`px-2 py-0.5 rounded text-xs font-semibold ${getStatusStyle(product.status)}`">
                    {{ product.status }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-center gap-1">
                    <button
                      @click="openStockModal(product.id, 'inbound')"
                      class="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="入库"
                    >
                      <ArrowBigLeft :size="12" />
                    </button>
                    <button
                      @click="openStockModal(product.id, 'outbound')"
                      class="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="出库"
                    >
                      <ArrowBigRight :size="12" />
                    </button>
                    <button
                      @click="openProductDialog(product)"
                      class="px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200 flex items-center gap-1"
                      title="编辑商品"
                    >
                      <Edit :size="12" />
                      <span>编辑</span>
                    </button>
                    <button
                      @click="confirmDeleteProduct(product.id)"
                      class="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="删除"
                    >
                      <Trash2 :size="12" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 空状态 -->
          <div v-if="filteredProducts.length === 0" class="p-12 text-center text-slate-400">
            <Package :size="48" class="mx-auto mb-4" />
            <p class="font-medium">暂无商品数据</p>
            <p class="text-sm mt-1">请调整筛选条件或添加新商品</p>
          </div>
        </div>

        <!-- 分类管理 -->
        <div v-if="activeTab === 'categories'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          <!-- 右侧：分类商品列表 -->
          <div class="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div class="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 class="font-bold text-slate-900">
                {{ getSelectedCategoryName() }}
                <span class="text-sm font-normal text-slate-500 ml-2">({{ categoryProducts.length }} 个商品)</span>
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
            <div class="p-6" v-if="selectedCategoryId">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="product in categoryProducts"
                  :key="product.id"
                  class="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <h4 class="font-semibold text-slate-900">{{ product.name }}</h4>
                      <p class="text-xs text-slate-500">{{ product.brand }} | {{ product.sku }}</p>
                    </div>
                    <span :class="`px-2 py-0.5 rounded text-xs font-semibold ${getStatusStyle(product.status)}`">
                      {{ product.status }}
                    </span>
                  </div>
                  <div class="grid grid-cols-3 gap-2 text-sm">
                    <div class="bg-slate-50 rounded p-2">
                      <p class="text-xs text-slate-500">库存</p>
                      <p class="font-semibold text-slate-900">{{ product.stock }}</p>
                    </div>
                    <div class="bg-slate-50 rounded p-2">
                      <p class="text-xs text-slate-500">成本价</p>
                      <p class="font-semibold text-slate-900">¥{{ product.costPrice }}</p>
                    </div>
                    <div class="bg-slate-50 rounded p-2">
                      <p class="text-xs text-slate-500">销售价</p>
                      <p class="font-semibold text-slate-900">¥{{ product.salePrice }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-16 text-slate-400">
              <Package :size="48" class="mx-auto mb-3 opacity-50" />
              <p class="text-sm font-medium">请选择左侧分类查看商品</p>
            </div>
          </div>
        </div>

        <!-- 出入库记录 -->
        <div v-if="activeTab === 'records'" class="bg-white rounded-lg border border-slate-200">
          <div class="p-4 border-b border-slate-200 flex justify-between items-center">
            <span class="text-sm text-slate-600">共 {{ records.length }} 条记录</span>
            <div class="flex gap-2">
              <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">入库: {{ records.filter(r => r.type === 'inbound').length }}</span>
              <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">出库: {{ records.filter(r => r.type === 'outbound').length }}</span>
            </div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-semibold text-slate-600">时间</th>
                  <th class="px-4 py-2 text-center text-xs font-semibold text-slate-600">类型</th>
                  <th class="px-4 py-2 text-left text-xs font-semibold text-slate-600">商品</th>
                  <th class="px-4 py-2 text-left text-xs font-semibold text-slate-600">SKU</th>
                  <th class="px-4 py-2 text-right text-xs font-semibold text-slate-600">数量</th>
                  <th class="px-4 py-2 text-right text-xs font-semibold text-slate-600">单价</th>
                  <th class="px-4 py-2 text-right text-xs font-semibold text-slate-600">总金额</th>
                  <th class="px-4 py-2 text-left text-xs font-semibold text-slate-600">操作人</th>
                  <th class="px-4 py-2 text-left text-xs font-semibold text-slate-600">备注</th>
                  <th class="px-4 py-2 text-center text-xs font-semibold text-slate-600">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <tr v-for="record in records" :key="record.id" class="hover:bg-slate-50">
                  <td class="px-4 py-3 text-sm text-slate-600">{{ record.createdAt }}</td>
                  <td class="px-4 py-3 text-center">
                    <span :class="`px-2 py-1 rounded text-xs font-semibold ${getRecordTypeStyle(record.type)}`">
                      {{ record.typeLabel }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ record.productName }}</td>
                  <td class="px-4 py-3 text-sm text-slate-600 font-mono">{{ record.sku }}</td>
                  <td class="px-4 py-3 text-right text-sm">
                    <span :class="record.type === 'inbound' ? 'text-green-600' : 'text-blue-600'">
                      {{ record.type === 'inbound' ? '+' : '-' }}{{ record.quantity }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right text-sm text-slate-600">¥{{ record.price }}</td>
                  <td class="px-4 py-3 text-right text-sm font-semibold">¥{{ record.totalAmount }}</td>
                  <td class="px-4 py-3 text-sm text-slate-600">{{ record.operator }}</td>
                  <td class="px-4 py-3 text-sm text-slate-600">{{ record.remark || '-' }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        @click.stop="editRecord(record)"
                        class="px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded text-xs font-medium flex items-center gap-1 shadow-sm hover:shadow transition-all"
                        title="编辑记录"
                      >
                        <Edit :size="12" />
                        <span>编辑</span>
                      </button>
                      <button
                        @click.stop="confirmDeleteRecord(record.id)"
                        class="px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded text-xs font-medium flex items-center gap-1 shadow-sm hover:shadow transition-all"
                        title="删除记录"
                      >
                        <Trash2 :size="12" />
                        <span>删除</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 库存预警 -->
        <div v-if="activeTab === 'alert'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="product in products.filter(p => p.status === '预警' || p.status === '缺货')"
            :key="product.id"
            class="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
          >
            <div class="flex items-start gap-3 mb-3">
              <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <component :is="getCategoryIcon(getCategoryIconName(product.category))" :size="18" class="text-slate-500" />
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-slate-900">{{ product.name }}</h3>
                <p class="text-xs text-slate-500">{{ product.brand }} | {{ product.sku }}</p>
              </div>
              <span :class="`px-2 py-1 rounded text-xs font-semibold ${getStatusStyle(product.status)}`">
                {{ product.status }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="bg-slate-50 rounded p-2">
                <p class="text-xs text-slate-500">当前库存</p>
                <p class="font-semibold text-slate-900">{{ product.stock }} {{ product.unit }}</p>
              </div>
              <div class="bg-slate-50 rounded p-2">
                <p class="text-xs text-slate-500">预警值</p>
                <p class="font-semibold text-slate-900">{{ product.warningValue }} {{ product.unit }}</p>
              </div>
            </div>
            <div class="mt-3 flex gap-2">
              <button
                @click="openStockModal(product.id, 'inbound')"
                class="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                入库
              </button>
              <button
                @click="openProductDialog(product)"
                class="flex-1 px-3 py-1.5 border border-slate-300 text-slate-700 rounded text-sm hover:bg-slate-50"
              >
                编辑
              </button>
            </div>
          </div>

          <div v-if="products.filter(p => p.status === '预警' || p.status === '缺货').length === 0" class="col-span-full py-12 text-center text-slate-400">
            <CheckCircle :size="48" class="mx-auto mb-4 text-green-400" />
            <p class="font-medium">库存状态良好</p>
            <p class="text-sm mt-1">暂无预警或缺货商品</p>
          </div>
        </div>

        <!-- 导入/导出 -->
        <div v-if="activeTab === 'import'" class="bg-white rounded-lg border border-slate-200 p-6">
          <div class="grid grid-cols-2 gap-8">
            <div>
              <h3 class="text-lg font-semibold text-slate-900 mb-4">导入数据</h3>
              <div class="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer">
                <UploadCloud :size="48" class="mx-auto mb-4 text-slate-400" />
                <p class="text-sm text-slate-600 mb-2">拖拽文件到此处或点击上传</p>
                <p class="text-xs text-slate-400 mb-4">支持 .xlsx, .xls, .csv 格式</p>
                <input type="file" @change="handleFileImport" accept=".xlsx,.xls,.csv" class="hidden" id="fileInput">
                <label for="fileInput" class="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 cursor-pointer">
                  选择文件
                </label>
              </div>
              <div class="mt-6">
                <button @click="downloadTemplate" class="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">
                  <Download :size="16" />
                  下载导入模板
                </button>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-900 mb-4">导出数据</h3>
              <div class="space-y-4">
                <div class="border border-slate-200 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-slate-900">导出全部商品</p>
                      <p class="text-sm text-slate-500">导出所有商品数据为Excel文件</p>
                    </div>
                    <button @click="exportAllProducts" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-2">
                      <Download :size="16" />
                      导出
                    </button>
                  </div>
                </div>
                <div class="border border-slate-200 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-slate-900">导出选中商品</p>
                      <p class="text-sm text-slate-500">导出已选中的 {{ selectedProducts.length }} 个商品</p>
                    </div>
                    <button
                      @click="exportSelectedProducts"
                      :disabled="selectedProducts.length === 0"
                      class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download :size="16" />
                      导出 ({{ selectedProducts.length }})
                    </button>
                  </div>
                </div>
                <div class="border border-slate-200 rounded-lg p-4">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="font-medium text-slate-900">导出出入库记录</p>
                      <p class="text-sm text-slate-500">导出所有库存变动记录</p>
                    </div>
                    <button @click="exportRecords" class="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 flex items-center gap-2">
                      <Download :size="16" />
                      导出
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 共享组件：出库入库弹窗 -->
    <Modal v-model:show="showStockModal" :title="stockOperation.type === 'inbound' ? '商品入库' : '商品出库'" size="md">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">商品 *</label>
          <select
            v-model="stockOperation.productId"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">请选择商品</option>
            <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }} (库存: {{ p.stock }})</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">数量 *</label>
            <input
              v-model.number="stockOperation.quantity"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">单价</label>
            <input
              v-model.number="stockOperation.price"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">备注</label>
          <input
            v-model="stockOperation.remark"
            type="text"
            placeholder="选填"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div class="bg-slate-50 rounded-lg p-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-slate-600">总金额：</span>
            <span class="text-lg font-bold text-indigo-600">¥{{ (stockOperation.quantity * stockOperation.price).toFixed(2) }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <button
          @click="showStockModal = false"
          class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
        >
          取消
        </button>
        <button
          @click="executeStockOperation"
          :disabled="!stockOperation.productId"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          确认
        </button>
      </template>
    </Modal>

    <!-- 商品编辑弹窗 -->
    <Modal v-model:show="showProductDialog" :title="editingProduct ? '编辑商品' : '新增商品'" size="lg">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">商品名称 *</label>
            <input v-model="editingProductData.name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">品牌</label>
            <input v-model="editingProductData.brand" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">规格</label>
            <input v-model="editingProductData.spec" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">单位</label>
            <input v-model="editingProductData.unit" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">分类 *</label>
            <select v-model="editingProductData.category" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">SKU *</label>
            <input v-model="editingProductData.sku" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">条码</label>
          <input v-model="editingProductData.barcode" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">成本价</label>
            <input v-model.number="editingProductData.costPrice" type="number" min="0" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">销售价</label>
            <input v-model.number="editingProductData.salePrice" type="number" min="0" step="0.01" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">初始库存</label>
            <input v-model.number="editingProductData.stock" type="number" min="0" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">预警值</label>
            <input v-model.number="editingProductData.warningValue" type="number" min="0" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">标签</label>
            <input v-model="editingProductData.tagsStr" type="text" placeholder="用逗号分隔" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">商品描述</label>
          <textarea v-model="editingProductData.description" rows="3" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
      <template #footer>
        <button
          @click="closeProductDialog"
          class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
        >
          取消
        </button>
        <button
          @click="saveProduct"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {{ editingProduct ? '保存' : '添加' }}
        </button>
      </template>
    </Modal>

    <!-- 分类编辑弹窗 -->
    <Modal v-model:show="showCategoryDialog" :title="editingCategory ? '编辑分类' : '新增分类'" size="md">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">分类名称 *</label>
          <input v-model="editingCategoryData.name" type="text" placeholder="如：蛋白质粉" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">图标</label>
          <select v-model="editingCategoryData.icon" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option value="Package">包裹 (Package)</option>
            <option value="Pill">药片 (Pill)</option>
            <option value="Activity">活动 (Activity)</option>
            <option value="ShoppingBag">购物袋 (ShoppingBag)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">颜色</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="color in ['#8b5cf6', '#ef4444', '#3b82f6', '#6b7280', '#10b981', '#f59e0b', '#ec4899', '#06b6d4']"
              :key="color"
              type="button"
              @click="editingCategoryData.color = color"
              :class="`w-8 h-8 rounded-lg border-2 ${editingCategoryData.color === color ? 'border-slate-900' : 'border-transparent'}`"
              :style="{ backgroundColor: color }"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">描述</label>
          <input v-model="editingCategoryData.description" type="text" placeholder="选填" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>
      <template #footer>
        <button
          @click="closeCategoryDialog"
          class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
        >
          取消
        </button>
        <button
          @click="saveCategory"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {{ editingCategory ? '保存' : '添加' }}
        </button>
      </template>
    </Modal>

    <!-- 分类树编辑弹窗 (新增/编辑根子目录) -->
    <Teleport to="body">
      <div v-if="showCategoryEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-white">{{ editingCategoryNode?.id ? '编辑分类' : '新增分类' }}</h3>
            <button @click="showCategoryEditModal = false" class="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X :size="20" class="text-white" />
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

    <!-- 记录编辑弹窗 -->
    <Modal v-model:show="showRecordEditModal" title="编辑出入库记录" size="md">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">商品 *</label>
          <select
            v-model="editingRecordData.productId"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            disabled
          >
            <option value="">请选择商品</option>
            <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
          <p class="text-xs text-slate-500 mt-1">商品信息不可修改</p>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">类型 *</label>
            <select
              v-model="editingRecordData.type"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="inbound">入库</option>
              <option value="outbound">出库</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">数量 *</label>
            <input
              v-model.number="editingRecordData.quantity"
              type="number"
              min="1"
              class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">单价 *</label>
          <input
            v-model.number="editingRecordData.price"
            type="number"
            min="0"
            step="0.01"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div class="bg-slate-50 rounded-lg p-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-slate-600">总金额：</span>
            <span class="text-lg font-bold text-indigo-600">
              ¥{{ (editingRecordData.quantity * editingRecordData.price).toFixed(2) }}
            </span>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">操作人</label>
          <input
            v-model="editingRecordData.operator"
            type="text"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">备注</label>
          <textarea
            v-model="editingRecordData.remark"
            rows="2"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div class="flex gap-2">
            <AlertCircle :size="16" class="text-amber-600 flex-shrink-0 mt-0.5" />
            <p class="text-sm text-amber-800">
              编辑记录将影响商品库存数量，请谨慎操作
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <button
          @click="showRecordEditModal = false"
          class="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
        >
          取消
        </button>
        <button
          @click="saveRecordEdit"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          保存
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'

// 主题相关
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')
import {
  Search,
  Plus,
  ArrowDown,
  ArrowUp,
  Edit,
  Trash2,
  ArrowBigRight,
  ArrowBigLeft,
  Pill,
  ShoppingBag,
  Activity,
  Package,
  Filter,
  TrendingUp,
  AlertCircle,
  Barcode,
  X,
  Layers,
  UploadCloud,
  Download,
  CheckCircle,
  Laptop,
  Dumbbell,
  Armchair,
  ChevronDown
} from 'lucide-vue-next'
import Modal from '../components/shared/Modal.vue'
import ConfirmDialog from '../components/shared/ConfirmDialog.vue'
import Toast from '../components/shared/Toast.vue'
import { useToast } from '../composables/useToast'

// Types
type Category = 'nutrient' | 'medicine' | 'equipment' | 'other'

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

interface ProductCategory {
  id: string
  name: string
  type: Category
  icon: string
  description: string
  parentId: string | null
  productCount: number
  color: string
}

interface Product {
  id: string
  name: string
  brand: string
  spec: string
  type: string
  category: Category
  sku: string
  barcode?: string
  unit?: string
  costPrice: number
  salePrice: number
  price: string
  stock: number
  warningValue: number
  minStock: number
  status: string
  tags: string[]
  description?: string
}

interface InventoryRecord {
  id: string
  productName: string
  sku: string
  type: 'inbound' | 'outbound'
  typeLabel: string
  quantity: number
  price: number
  totalAmount: number
  operator: string
  createdAt: string
  remark?: string
}

type TabType = 'products' | 'records' | 'alert' | 'categories' | 'import'

// Composables
const toast = useToast()

// State
const activeTab = ref<TabType>('products')
const activeCategory = ref<string | null>(null)
const selectedCategoryId = ref<string | null>(null)
const searchText = ref('')
const selectedProducts = ref<string[]>([])
const expandedCategories = ref<Set<string>>(new Set())

// Sidebar resize states
const sidebarRef = ref<HTMLElement | null>(null)
const resizerRef = ref<HTMLElement | null>(null)
const sidebarWidth = ref(224) // 14rem = 224px
const isResizing = ref(false)
const startX = ref(0)
const startWidth = ref(0)

// Filter states
const showAdvancedFilter = ref(false)
const showBatchActions = ref(false)
const filterStatus = ref('')
const filterStockMin = ref<number | null>(null)
const filterStockMax = ref<number | null>(null)
const filterPriceMin = ref<number | null>(null)
const filterPriceMax = ref<number | null>(null)

// Dialog states
const showStockModal = ref(false)
const showProductDialog = ref(false)
const showCategoryDialog = ref(false)
const showCategoryEditModal = ref(false)
const editingCategoryNode = ref<CategoryNode | null>(null)

// Confirm dialog state
const confirm = ref({
  show: false,
  title: '',
  message: '',
  type: 'warning' as 'warning' | 'danger' | 'info',
  onConfirm: () => {},
  onCancel: () => {}
})

const stockOperation = ref({
  type: 'inbound' as 'inbound' | 'outbound',
  productId: '',
  quantity: 1,
  price: 0,
  remark: ''
})

const editingProduct = ref<Product | null>(null)
const editingCategory = ref<ProductCategory | null>(null)

const editingProductData = ref({
  name: '',
  brand: '',
  spec: '',
  unit: '件',
  category: 'other' as Category,
  sku: '',
  barcode: '',
  costPrice: 0,
  salePrice: 0,
  stock: 0,
  warningValue: 10,
  minStock: 10,
  tagsStr: '',
  description: ''
})

const editingCategoryData = ref({
  name: '',
  icon: 'Package',
  color: '#6b7280',
  description: ''
})

// Record editing state
const showRecordEditModal = ref(false)
const editingRecordId = ref<string | null>(null)
const editingRecordData = ref({
  productId: '',
  type: 'inbound' as 'inbound' | 'outbound',
  quantity: 1,
  price: 0,
  operator: '',
  remark: ''
})

const categoryEditForm = ref({
  name: '',
  icon: 'Package',
  color: '#6b7280'
})

// 图标选项
const iconOptions = [
  { value: 'Package', component: Package },
  { value: 'Laptop', component: Laptop },
  { value: 'Pill', component: Pill },
  { value: 'Activity', component: Activity },
  { value: 'Dumbbell', component: Dumbbell },
  { value: 'ShoppingBag', component: ShoppingBag },
  { value: 'Armchair', component: Armchair }
]

const colorOptions = ['#8b5cf6', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#6b7280']

// Data
const products = ref<Product[]>([
  {
    id: '1',
    name: '乳清蛋白粉',
    brand: 'Optimum Nutrition',
    spec: '5lbs / 桶',
    type: '营养素',
    category: 'nutrient',
    sku: 'NUT-001',
    barcode: '6901234567890',
    unit: '桶',
    costPrice: 320,
    salePrice: 458,
    price: '¥458.00',
    stock: 120,
    warningValue: 20,
    minStock: 20,
    status: '充足',
    tags: ['增肌', '蛋白质']
  },
  {
    id: '2',
    name: '深海鱼油软胶囊',
    brand: 'Blackmores',
    spec: '400粒 / 瓶',
    type: '营养素',
    category: 'nutrient',
    sku: 'NUT-002',
    barcode: '6901234567891',
    unit: '瓶',
    costPrice: 120,
    salePrice: 189,
    price: '¥189.00',
    stock: 25,
    warningValue: 30,
    minStock: 30,
    status: '预警',
    tags: ['心血管', 'Omega-3']
  },
  {
    id: '3',
    name: '二甲双胍片',
    brand: '格华止',
    spec: '0.5g * 20片',
    type: '药品',
    category: 'medicine',
    sku: 'MED-001',
    barcode: '6901234567892',
    unit: '盒',
    costPrice: 15,
    salePrice: 24.5,
    price: '¥24.50',
    stock: 500,
    warningValue: 100,
    minStock: 100,
    status: '充足',
    tags: ['处方药', '降糖']
  },
  {
    id: '4',
    name: '雅培瞬感传感器',
    brand: 'Abbott',
    spec: '1枚装 (14天)',
    type: '设备',
    category: 'equipment',
    sku: 'EQP-001',
    barcode: '6901234567893',
    unit: '枚',
    costPrice: 320,
    salePrice: 450,
    price: '¥450.00',
    stock: 0,
    warningValue: 10,
    minStock: 10,
    status: '缺货',
    tags: ['CGM', '血糖监测']
  },
  {
    id: '5',
    name: '电子血压计',
    brand: '欧姆龙',
    spec: 'HEM-7121',
    type: '设备',
    category: 'equipment',
    sku: 'EQP-002',
    barcode: '6901234567896',
    unit: '台',
    costPrice: 200,
    salePrice: 299,
    price: '¥299.00',
    stock: 12,
    warningValue: 15,
    minStock: 15,
    status: '预警',
    tags: ['监测', '血压']
  }
])

const categories = ref<ProductCategory[]>([
  {
    id: 'nutrient',
    name: '营养补充剂',
    type: 'nutrient',
    icon: 'Pill',
    description: '蛋白质、维生素等补充剂',
    parentId: null,
    productCount: 2,
    color: '#8b5cf6'
  },
  {
    id: 'medicine',
    name: '药品',
    type: 'medicine',
    icon: 'Activity',
    description: '处方药及非处方药',
    parentId: null,
    productCount: 1,
    color: '#ef4444'
  },
  {
    id: 'equipment',
    name: '医疗器械',
    type: 'equipment',
    icon: 'ShoppingBag',
    description: '监测、治疗设备',
    parentId: null,
    productCount: 2,
    color: '#3b82f6'
  },
  {
    id: 'other',
    name: '其他',
    type: 'other',
    icon: 'Package',
    description: '其他相关产品',
    parentId: null,
    productCount: 0,
    color: '#6b7280'
  }
])

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

const records = ref<InventoryRecord[]>([
  {
    id: '1',
    productName: '乳清蛋白粉',
    sku: 'NUT-001',
    type: 'inbound',
    typeLabel: '入库',
    quantity: 100,
    price: 320,
    totalAmount: 32000,
    operator: '张采购',
    createdAt: '2026-02-14 10:30',
    remark: '采购入库'
  },
  {
    id: '2',
    productName: '乳清蛋白粉',
    sku: 'NUT-001',
    type: 'outbound',
    typeLabel: '出库',
    quantity: 5,
    price: 320,
    totalAmount: 1600,
    operator: '王教练',
    createdAt: '2026-02-14 14:20',
    remark: '教练领取'
  }
])

// Computed
const filteredProducts = computed(() => {
  let filtered = products.value.filter(product => {
    // When a tree category is selected, show all products (for now - categories are separate from products)
    // Support both old category system and new tree system
    const matchesOldCategory = !activeCategory.value || product.category === activeCategory.value
    const matchesTreeCategory = !selectedCategoryId.value || true // Tree categories don't filter products yet
    const matchesCategory = matchesOldCategory && matchesTreeCategory
    const matchesSearch = !searchText.value ||
      product.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchText.value.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchText.value.toLowerCase())

    let matchesFilter = true
    if (filterStatus.value) {
      matchesFilter = matchesFilter && product.status === filterStatus.value
    }
    if (filterStockMin.value !== null) {
      matchesFilter = matchesFilter && product.stock >= filterStockMin.value
    }
    if (filterStockMax.value !== null) {
      matchesFilter = matchesFilter && product.stock <= filterStockMax.value
    }
    if (filterPriceMin.value !== null) {
      matchesFilter = matchesFilter && product.salePrice >= filterPriceMin.value
    }
    if (filterPriceMax.value !== null) {
      matchesFilter = matchesFilter && product.salePrice <= filterPriceMax.value
    }

    return matchesCategory && matchesSearch && matchesFilter
  })
  return filtered
})

const stats = computed(() => ({
  totalProducts: products.value.length,
  totalStock: products.value.reduce((sum, p) => sum + p.stock, 0),
  totalValue: products.value.reduce((sum, p) => sum + p.costPrice * p.stock, 0),
  warningCount: products.value.filter(p => p.status === '预警' || p.status === '缺货').length
}))

// Category products computed
const categoryProducts = computed(() => {
  if (!selectedCategoryId.value) return []
  // For now, return all products since the tree categories are separate from product categories
  return products.value
})

// Methods
const getStatusStyle = (status: string) => {
  const map: Record<string, string> = {
    '充足': 'bg-green-100 text-green-800',
    '预警': 'bg-yellow-100 text-yellow-800',
    '缺货': 'bg-red-100 text-red-800'
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

const getRecordTypeStyle = (type: string) =>
  type === 'inbound' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'

const getCategoryIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    'Pill': Pill,
    'Activity': Activity,
    'ShoppingBag': ShoppingBag,
    'Package': Package,
    'Laptop': Laptop,
    'Dumbbell': Dumbbell,
    'Armchair': Armchair
  }
  return icons[iconName] || Package
}

const getCategoryIconName = (categoryId: string) => {
  const cat = categories.value.find(c => c.id === categoryId)
  return cat?.icon || 'Package'
}

const getCategoryColor = (categoryId: string) => {
  const cat = categories.value.find(c => c.id === categoryId)
  return cat?.color || '#6b7280'
}

const getCategoryName = (categoryId: string) => {
  const cat = categories.value.find(c => c.id === categoryId)
  return cat?.name || '其他'
}

// Search
const handleSearch = () => {
  // Search is reactive through computed
}

// Selection
const toggleSelectAll = () => {
  if (selectedProducts.value.length === filteredProducts.value.length) {
    selectedProducts.value = []
  } else {
    selectedProducts.value = filteredProducts.value.map(p => p.id)
  }
}

const toggleSelectProduct = (id: string) => {
  const index = selectedProducts.value.indexOf(id)
  if (index > -1) {
    selectedProducts.value.splice(index, 1)
  } else {
    selectedProducts.value.push(id)
  }
}

// Advanced filter
const applyAdvancedFilter = () => {
  toast.success('筛选已应用', `找到 ${filteredProducts.value.length} 个商品`)
}

const resetFilter = () => {
  filterStatus.value = ''
  filterStockMin.value = null
  filterStockMax.value = null
  filterPriceMin.value = null
  filterPriceMax.value = null
  showAdvancedFilter.value = false
  toast.success('筛选已重置')
}

// Batch operations
const batchDelete = () => {
  confirm.value = {
    show: true,
    title: '批量删除商品',
    message: `确定要删除选中的 ${selectedProducts.value.length} 个商品吗？此操作不可恢复。`,
    type: 'danger',
    onConfirm: () => {
      products.value = products.value.filter(p => !selectedProducts.value.includes(p.id))
      toast.success('删除成功', `已删除 ${selectedProducts.value.length} 个商品`)
      selectedProducts.value = []
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const batchExport = () => {
  toast.success('导出成功', `已导出 ${selectedProducts.value.length} 个商品`)
}

// Confirm dialogs
const confirmDeleteProduct = (id: string) => {
  const product = products.value.find(p => p.id === id)
  if (!product) return

  confirm.value = {
    show: true,
    title: '删除商品',
    message: `确定要删除商品 "${product.name}" 吗？此操作不可恢复。`,
    type: 'danger',
    onConfirm: () => {
      products.value = products.value.filter(p => p.id !== id)
      toast.success('删除成功', `商品 "${product.name}" 已删除`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const confirmDeleteCategory = (categoryId: string) => {
  const productCount = products.value.filter(p => p.category === categoryId).length
  if (productCount > 0) {
    toast.error('无法删除', `该分类下还有 ${productCount} 个商品`)
    return
  }

  const cat = categories.value.find(c => c.id === categoryId)
  if (!cat) return

  confirm.value = {
    show: true,
    title: '删除分类',
    message: `确定要删除分类 "${cat.name}" 吗？`,
    type: 'danger',
    onConfirm: () => {
      categories.value = categories.value.filter(c => c.id !== categoryId)
      toast.success('删除成功', `分类 "${cat.name}" 已删除`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

// Stock operations
const updateStock = (id: string, change: number) => {
  const product = products.value.find(p => p.id === id)
  if (!product) return

  const newStock = Math.max(0, product.stock + change)
  const newStatus = newStock === 0 ? '缺货' : newStock < product.warningValue ? '预警' : '充足'

  product.stock = newStock
  product.status = newStatus

  toast.success('库存更新', `${product.name} 库存: ${product.stock} → ${newStock}`)
}

const openStockModal = (productId: string, type: 'inbound' | 'outbound') => {
  const product = products.value.find(p => p.id === productId)
  if (!product) return

  stockOperation.value = {
    type,
    productId,
    quantity: 1,
    price: product.costPrice,
    remark: ''
  }
  showStockModal.value = true
}

const executeStockOperation = () => {
  const product = products.value.find(p => p.id === stockOperation.value.productId)
  if (!product) return

  const quantity = stockOperation.value.quantity
  const totalAmount = quantity * stockOperation.value.price

  if (stockOperation.value.type === 'inbound') {
    const newStock = product.stock + quantity
    const newStatus = newStock === 0 ? '缺货' : newStock < product.warningValue ? '预警' : '充足'
    product.stock = newStock
    product.status = newStatus
    toast.success('入库成功', `${product.name} +${quantity}`)
  } else {
    if (quantity > product.stock) {
      toast.error('库存不足', `${product.name} 当前库存: ${product.stock}`)
      return
    }
    const newStock = Math.max(0, product.stock - quantity)
    const newStatus = newStock === 0 ? '缺货' : newStock < product.warningValue ? '预警' : '充足'
    product.stock = newStock
    product.status = newStatus
    toast.success('出库成功', `${product.name} -${quantity}`)
  }

  const newRecord: InventoryRecord = {
    id: Date.now().toString(),
    productName: product.name,
    sku: product.sku,
    type: stockOperation.value.type,
    typeLabel: stockOperation.value.type === 'inbound' ? '入库' : '出库',
    quantity,
    price: stockOperation.value.price,
    totalAmount,
    operator: '当前用户',
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    remark: stockOperation.value.remark || (stockOperation.value.type === 'inbound' ? '手动入库' : '手动出库')
  }
  records.value.unshift(newRecord)

  showStockModal.value = false
}

// Product operations
const openProductDialog = (product?: Product) => {
  if (product) {
    editingProduct.value = product
    editingProductData.value = {
      name: product.name,
      brand: product.brand,
      spec: product.spec,
      unit: product.unit || '件',
      category: product.category,
      sku: product.sku,
      barcode: product.barcode || '',
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      stock: product.stock,
      warningValue: product.warningValue,
      minStock: product.minStock,
      tagsStr: product.tags.join(','),
      description: product.description || ''
    }
  } else {
    editingProduct.value = null
    editingProductData.value = {
      name: '',
      brand: '',
      spec: '',
      unit: '件',
      category: 'other',
      sku: '',
      barcode: '',
      costPrice: 0,
      salePrice: 0,
      stock: 0,
      warningValue: 10,
      minStock: 10,
      tagsStr: '',
      description: ''
    }
  }
  showProductDialog.value = true
}

const closeProductDialog = () => {
  showProductDialog.value = false
  editingProduct.value = null
}

const saveProduct = () => {
  if (!editingProductData.value.name || !editingProductData.value.sku) {
    toast.error('验证失败', '请填写商品名称和SKU')
    return
  }

  const productData: Partial<Product> = {
    name: editingProductData.value.name,
    brand: editingProductData.value.brand,
    spec: editingProductData.value.spec,
    unit: editingProductData.value.unit || '件',
    category: editingProductData.value.category,
    type: '营养素',
    sku: editingProductData.value.sku,
    barcode: editingProductData.value.barcode,
    costPrice: editingProductData.value.costPrice || 0,
    salePrice: editingProductData.value.salePrice || 0,
    price: `¥${(editingProductData.value.salePrice || 0).toFixed(2)}`,
    stock: editingProductData.value.stock || 0,
    warningValue: editingProductData.value.warningValue || 10,
    minStock: editingProductData.value.warningValue || 10,
    status: (editingProductData.value.stock || 0) === 0 ? '缺货' : (editingProductData.value.stock || 0) < (editingProductData.value.warningValue || 10) ? '预警' : '充足',
    tags: editingProductData.value.tagsStr.split(',').map(t => t.trim()).filter(t => t),
    description: editingProductData.value.description
  }

  if (editingProduct.value) {
    Object.assign(editingProduct.value, productData)
    toast.success('更新成功', `商品 "${editingProductData.value.name}" 已更新`)
  } else {
    products.value.push({
      id: `prod-${Date.now()}`,
      ...productData
    } as Product)
    toast.success('添加成功', `商品 "${editingProductData.value.name}" 已添加`)
  }

  showProductDialog.value = false
  editingProduct.value = null
}

// Category operations
const openCategoryDialog = (category?: ProductCategory) => {
  if (category) {
    editingCategory.value = category
    editingCategoryData.value = {
      name: category.name,
      icon: category.icon,
      color: category.color,
      description: category.description
    }
  } else {
    editingCategory.value = null
    editingCategoryData.value = {
      name: '',
      icon: 'Package',
      color: '#6b7280',
      description: ''
    }
  }
  showCategoryDialog.value = true
}

const closeCategoryDialog = () => {
  showCategoryDialog.value = false
  editingCategory.value = null
}

const saveCategory = () => {
  if (!editingCategoryData.value.name) {
    toast.error('验证失败', '请输入分类名称')
    return
  }

  const categoryData: Partial<ProductCategory> = {
    name: editingCategoryData.value.name,
    icon: editingCategoryData.value.icon,
    color: editingCategoryData.value.color,
    description: editingCategoryData.value.description
  }

  if (editingCategory.value) {
    Object.assign(editingCategory.value, categoryData)
    toast.success('更新成功', `分类 "${editingCategoryData.value.name}" 已更新`)
  } else {
    categories.value.push({
      id: `cat-${Date.now()}`,
      type: 'other',
      parentId: null,
      productCount: 0,
      ...categoryData
    } as ProductCategory)
    toast.success('添加成功', `分类 "${editingCategoryData.value.name}" 已添加`)
  }

  showCategoryDialog.value = false
  editingCategory.value = null
}

// Import/Export operations
const handleFileImport = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  toast.info('导入功能', `正在导入文件: ${file.name}`)
  // TODO: Implement actual file import logic
}

const downloadTemplate = () => {
  toast.success('下载模板', '导入模板已下载')
  // TODO: Implement actual template download
}

const exportAllProducts = () => {
  toast.success('导出成功', `已导出 ${products.value.length} 个商品`)
  // TODO: Implement actual export
}

const exportSelectedProducts = () => {
  const selectedCount = selectedProducts.value.length
  toast.success('导出成功', `已导出 ${selectedCount} 个商品`)
  // TODO: Implement actual export
}

const exportRecords = () => {
  toast.success('导出成功', `已导出 ${records.value.length} 条记录`)
  // TODO: Implement actual export
}

// Record Operations
const editRecord = (record: InventoryRecord) => {
  console.log('editRecord called:', record)
  editingRecordId.value = record.id
  // Find product ID by name and SKU
  const product = products.value.find(p => p.name === record.productName && p.sku === record.sku)
  editingRecordData.value = {
    productId: product?.id || '',
    type: record.type,
    quantity: record.quantity,
    price: record.price,
    operator: record.operator,
    remark: record.remark || ''
  }
  showRecordEditModal.value = true
  console.log('Modal should open:', showRecordEditModal.value)
}

const saveRecordEdit = () => {
  if (!editingRecordId.value || !editingRecordData.value.productId) {
    toast.error('错误', '请选择商品')
    return
  }

  const recordIndex = records.value.findIndex(r => r.id === editingRecordId.value)
  if (recordIndex === -1) {
    toast.error('错误', '记录不存在')
    return
  }

  const oldRecord = records.value[recordIndex]
  const product = products.value.find(p => p.id === editingRecordData.value.productId)
  if (!product) {
    toast.error('错误', '商品不存在')
    return
  }

  // Calculate stock difference
  const oldQuantity = oldRecord.type === 'inbound' ? oldRecord.quantity : -oldRecord.quantity
  const newQuantity = editingRecordData.value.type === 'inbound' ? editingRecordData.value.quantity : -editingRecordData.value.quantity
  const stockDiff = newQuantity - oldQuantity

  // Update product stock
  const newStock = product.stock + stockDiff
  if (newStock < 0) {
    toast.error('错误', '库存不足，无法修改记录')
    return
  }
  product.stock = newStock

  // Update product status based on new stock
  if (product.stock === 0) {
    product.status = '缺货'
  } else if (product.stock <= product.warningValue) {
    product.status = '预警'
  } else {
    product.status = '充足'
  }

  // Update record
  records.value[recordIndex] = {
    ...oldRecord,
    type: editingRecordData.value.type,
    typeLabel: editingRecordData.value.type === 'inbound' ? '入库' : '出库',
    quantity: editingRecordData.value.quantity,
    price: editingRecordData.value.price,
    totalAmount: editingRecordData.value.quantity * editingRecordData.value.price,
    operator: editingRecordData.value.operator,
    remark: editingRecordData.value.remark
  }

  toast.success('修改成功', '出入库记录已更新')
  showRecordEditModal.value = false
  editingRecordId.value = null
}

const confirmDeleteRecord = (id: string) => {
  console.log('confirmDeleteRecord called:', id)
  const record = records.value.find(r => r.id === id)
  if (!record) {
    console.log('Record not found')
    return
  }

  confirm.value = {
    show: true,
    title: '确认删除',
    message: `确定要删除这条${record.typeLabel}记录吗？删除后将恢复商品库存。`,
    type: 'danger',
    onConfirm: () => deleteRecord(id),
    onCancel: () => {}
  }
  console.log('Confirm dialog should show:', confirm.value.show)
}

const deleteRecord = (id: string) => {
  const recordIndex = records.value.findIndex(r => r.id === id)
  if (recordIndex === -1) return

  const record = records.value[recordIndex]
  const product = products.value.find(p => p.name === record.productName && p.sku === record.sku)

  if (product) {
    // Reverse the stock change
    if (record.type === 'inbound') {
      product.stock -= record.quantity
    } else {
      product.stock += record.quantity
    }

    // Ensure stock doesn't go negative
    if (product.stock < 0) {
      product.stock = 0
    }

    // Update product status
    if (product.stock === 0) {
      product.status = '缺货'
    } else if (product.stock <= product.warningValue) {
      product.status = '预警'
    } else {
      product.status = '充足'
    }
  }

  // Remove record
  records.value.splice(recordIndex, 1)
  toast.success('删除成功', '出入库记录已删除')
}

// Category Tree Operations
const selectCategory = (categoryId: string) => {
  selectedCategoryId.value = categoryId
}

const toggleCategoryExpand = (categoryId: string) => {
  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId)
  } else {
    expandedCategories.value.add(categoryId)
  }
}

const addRootCategory = () => {
  editingCategoryNode.value = null
  categoryEditForm.value = {
    name: '',
    icon: 'Package',
    color: '#6b7280'
  }
  showCategoryEditModal.value = true
}

const addSubCategory = (parentId: string) => {
  editingCategoryNode.value = null
  categoryEditForm.value = {
    name: '',
    icon: 'Package',
    color: '#6b7280'
  }
  // Store parentId for creating sub category
  editingCategoryNode.value = { id: '', name: '', icon: '', color: '', count: 0, totalValue: 0, parentId } as CategoryNode
  showCategoryEditModal.value = true
}

const editCategoryItem = (category: CategoryNode) => {
  editingCategoryNode.value = category
  categoryEditForm.value = {
    name: category.name,
    icon: category.icon,
    color: category.color
  }
  showCategoryEditModal.value = true
}

const deleteCategoryItem = (category: CategoryNode) => {
  if (category.children && category.children.length > 0) {
    toast.error('无法删除', '该分类下还有子分类，请先删除子分类')
    return
  }

  confirm.value = {
    show: true,
    title: '删除分类',
    message: `确定要删除分类 "${category.name}" 吗？`,
    type: 'danger',
    onConfirm: () => {
      if (category.parentId) {
        // Delete sub category
        const parent = findCategoryById(categoryTree.value, category.parentId)
        if (parent && parent.children) {
          parent.children = parent.children.filter(c => c.id !== category.id)
        }
      } else {
        // Delete root category
        categoryTree.value = categoryTree.value.filter(c => c.id !== category.id)
      }
      toast.success('删除成功', `分类 "${category.name}" 已删除`)
      if (selectedCategoryId.value === category.id) {
        selectedCategoryId.value = null
      }
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const saveCategoryEdit = () => {
  if (!categoryEditForm.value.name) {
    toast.error('验证失败', '请输入分类名称')
    return
  }

  if (editingCategoryNode.value?.id) {
    // Edit existing category
    const category = findCategoryById(categoryTree.value, editingCategoryNode.value.id)
    if (category) {
      category.name = categoryEditForm.value.name
      category.icon = categoryEditForm.value.icon
      category.color = categoryEditForm.value.color
      toast.success('更新成功', `分类 "${categoryEditForm.value.name}" 已更新`)
    }
  } else {
    // Add new category
    const newCategory: CategoryNode = {
      id: `cat-${Date.now()}`,
      name: categoryEditForm.value.name,
      icon: categoryEditForm.value.icon,
      color: categoryEditForm.value.color,
      count: 0,
      totalValue: 0
    }

    if (editingCategoryNode.value?.parentId) {
      // Add as sub category
      const parent = findCategoryById(categoryTree.value, editingCategoryNode.value.parentId)
      if (parent) {
        if (!parent.children) parent.children = []
        newCategory.parentId = editingCategoryNode.value.parentId
        parent.children.push(newCategory)
        // Auto-expand parent
        expandedCategories.value.add(editingCategoryNode.value.parentId)
        toast.success('添加成功', `子分类 "${categoryEditForm.value.name}" 已添加`)
      }
    } else {
      // Add as root category
      newCategory.children = []
      categoryTree.value.push(newCategory)
      toast.success('添加成功', `根分类 "${categoryEditForm.value.name}" 已添加`)
    }
  }

  showCategoryEditModal.value = false
  editingCategoryNode.value = null
}

const findCategoryById = (tree: CategoryNode[], id: string): CategoryNode | null => {
  for (const node of tree) {
    if (node.id === id) return node
    if (node.children) {
      const found = findCategoryById(node.children, id)
      if (found) return found
    }
  }
  return null
}

const getSelectedCategoryName = () => {
  if (!selectedCategoryId.value) return '全部商品'
  const category = findCategoryById(categoryTree.value, selectedCategoryId.value)
  return category?.name || '未知分类'
}

const editSelectedCategory = () => {
  if (!selectedCategoryId.value) return
  const category = findCategoryById(categoryTree.value, selectedCategoryId.value)
  if (category) {
    editCategoryItem(category)
  }
}

const deleteSelectedCategory = () => {
  if (!selectedCategoryId.value) return
  const category = findCategoryById(categoryTree.value, selectedCategoryId.value)
  if (category) {
    deleteCategoryItem(category)
  }
}

// Sidebar resize methods
const startResize = (e: MouseEvent) => {
  isResizing.value = true
  startX.value = e.clientX
  startWidth.value = sidebarWidth.value

  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)

  // Prevent text selection during resize
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
}

const onResize = (e: MouseEvent) => {
  if (!isResizing.value) return

  const deltaX = e.clientX - startX.value
  const newWidth = startWidth.value + deltaX

  // Constrain width between 200px and 500px
  sidebarWidth.value = Math.max(200, Math.min(500, newWidth))
}

const stopResize = () => {
  isResizing.value = false

  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)

  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}
</script>
