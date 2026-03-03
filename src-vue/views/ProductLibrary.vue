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
          <ShoppingBag :size="28" class="text-white" />
        </div>
        商品库
      </h1>
      <p class="text-slate-500 mt-2 ml-12">商品管理 · 库存控制</p>
    </div>

    <!-- Tab 导航 -->
    <div class="flex bg-slate-100 p-1 rounded-lg w-fit">
      <button
        @click="currentView = 'products'"
        :class="`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
          currentView === 'products'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-800'
        }`"
      >
        <Package :size="16" />
        商品列表
      </button>
      <button
        @click="currentView = 'categories'"
        :class="`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
          currentView === 'categories'
            ? 'bg-white text-indigo-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-800'
        }`"
      >
        <FolderTree :size="16" />
        分类管理
      </button>
    </div>

    <!-- 商品列表 -->
    <div v-if="currentView === 'products'" class="space-y-4">
      <!-- 统计概览 -->
      <div class="grid grid-cols-5 gap-2">
        <div class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg py-3 px-2 text-white">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium opacity-90">商品总数</span>
            <Package :size="14" />
          </div>
          <div class="text-2xl font-bold leading-tight">{{ statistics.totalProducts }}</div>
          <div class="text-[10px] opacity-75 mt-0.5">个商品</div>
        </div>

        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-lg py-3 px-2 text-white">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium opacity-90">库存总值</span>
            <DollarSign :size="14" />
          </div>
          <div class="text-2xl font-bold leading-tight">¥{{ statistics.totalValue.toLocaleString() }}</div>
          <div class="text-[10px] opacity-75 mt-0.5">库存价值</div>
        </div>

        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg py-3 px-2 text-white">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium opacity-90">库存充足</span>
            <CheckCircle :size="14" />
          </div>
          <div class="text-2xl font-bold leading-tight">{{ statistics.inStockCount }}</div>
          <div class="text-[10px] opacity-75 mt-0.5">正常库存</div>
        </div>

        <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg py-3 px-2 text-white">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium opacity-90">库存不足</span>
            <AlertTriangle :size="14" />
          </div>
          <div class="text-2xl font-bold leading-tight">{{ statistics.lowStockCount }}</div>
          <div class="text-[10px] opacity-75 mt-0.5">需补货</div>
        </div>

        <div class="bg-gradient-to-br from-red-500 to-red-600 rounded-lg py-3 px-2 text-white">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-medium opacity-90">缺货</span>
            <XCircle :size="14" />
          </div>
          <div class="text-2xl font-bold leading-tight">{{ statistics.outOfStockCount }}</div>
          <div class="text-[10px] opacity-75 mt-0.5">已缺货</div>
        </div>
      </div>

      <!-- 操作栏 -->
      <div class="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div class="flex items-center gap-3 flex-wrap">
          <button
            @click="openProductModal"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium shadow-sm transition-colors"
          >
            <Plus :size="16" />
            新增商品
          </button>

          <div class="relative flex-1 min-w-[200px]">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" :size="16" />
            <input
              v-model="searchText"
              type="text"
              placeholder="搜索商品名称、品牌、SKU..."
              class="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <select
            v-model="typeFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="">全部类型</option>
            <option value="营养补充剂">营养补充剂</option>
            <option value="药品">药品</option>
            <option value="医疗器械">医疗器械</option>
            <option value="其他">其他</option>
          </select>

          <select
            v-model="stockFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="">全部库存</option>
            <option value="in_stock">库存充足</option>
            <option value="low_stock">库存不足</option>
            <option value="out_of_stock">缺货</option>
          </select>

          <select
            v-model="categoryFilter"
            class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="">全部分类</option>
            <option v-for="cat in flatCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>

          <button
            @click="exportProducts"
            class="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm transition-colors"
          >
            <Download :size="16" />
            导出
          </button>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table class="w-full">
          <thead class="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">SKU</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">商品名称</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">品牌</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">类型</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase">规格</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">销售价</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">成本价</th>
              <th class="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase">库存</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">状态</th>
              <th class="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
              class="hover:bg-gradient-to-r hover:from-slate-50 hover:to-indigo-50/50 transition-colors"
            >
              <td class="px-4 py-3 font-mono text-sm text-indigo-600">{{ product.sku }}</td>
              <td class="px-4 py-3">
                <div class="font-medium text-slate-900">{{ product.name }}</div>
              </td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ product.brand }}</td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ product.type }}</td>
              <td class="px-4 py-3 text-sm text-slate-600">{{ product.spec }}</td>
              <td class="px-4 py-3 text-right text-sm text-slate-900 font-medium">¥{{ product.price }}</td>
              <td class="px-4 py-3 text-right text-sm text-slate-500">¥{{ product.costPrice }}</td>
              <td class="px-4 py-3 text-right">
                <div class="text-sm text-slate-900">{{ product.stock }}</div>
                <div class="text-xs text-slate-400">预警: {{ product.minStock }}</div>
              </td>
              <td class="px-4 py-3 text-center">
                <span
                  class="px-2 py-1 rounded-full text-xs font-semibold border"
                  :class="getStockStatusClass(product.stock, product.minStock)"
                >
                  {{ getStockStatusLabel(product.stock, product.minStock) }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-1">
                  <button
                    @click="viewProductDetail(product)"
                    class="px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    详情
                  </button>
                  <button
                    @click="editProduct(product)"
                    class="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    @click="deleteProduct(product.id)"
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

        <div v-if="filteredProducts.length === 0" class="text-center py-16 text-slate-400">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-3">
            <Search :size="32" />
          </div>
          <p class="text-sm font-medium">暂无符合条件的商品</p>
        </div>
      </div>
    </div>

    <!-- 分类管理 -->
    <div v-else-if="currentView === 'categories'" class="space-y-4">
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
          <table class="w-full" v-if="selectedCategoryId">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">SKU</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">商品名称</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">品牌</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">销售价</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase">库存</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">状态</th>
                <th class="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase">操作</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-for="product in categoryProducts" :key="product.id" class="hover:bg-slate-50">
                <td class="px-6 py-3 font-mono text-sm text-indigo-600">{{ product.sku }}</td>
                <td class="px-6 py-3 font-medium text-slate-900">{{ product.name }}</td>
                <td class="px-6 py-3 text-sm text-slate-600">{{ product.brand }}</td>
                <td class="px-6 py-3 text-right text-sm font-medium text-slate-900">¥{{ product.price }}</td>
                <td class="px-6 py-3 text-right text-sm text-slate-900">{{ product.stock }}</td>
                <td class="px-6 py-3 text-center">
                  <span class="px-2 py-1 rounded-full text-xs font-semibold border" :class="getStockStatusClass(product.stock, product.minStock)">
                    {{ getStockStatusLabel(product.stock, product.minStock) }}
                  </span>
                </td>
                <td class="px-6 py-3">
                  <div class="flex items-center justify-center gap-2">
                    <button @click="editProduct(product)" class="text-indigo-600 hover:text-indigo-800 text-sm">编辑</button>
                    <button @click="deleteProduct(product.id)" class="text-red-600 hover:text-red-800 text-sm">删除</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="text-center py-16 text-slate-400">
            <FolderTree :size="48" class="mx-auto mb-3 opacity-50" />
            <p class="text-sm font-medium">请选择左侧分类查看商品</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品编辑/新增模态框 -->
    <Teleport to="body">
      <div v-if="showProductModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-slate-900">{{ isEditMode ? '编辑商品' : '新增商品' }}</h3>
            <button @click="closeProductModal" class="p-1 hover:bg-slate-100 rounded-lg transition-colors">
              <X :size="20" class="text-slate-500" />
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
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">品牌</label>
                <input
                  v-model="productForm.brand"
                  type="text"
                  placeholder="请输入品牌"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">SKU编码 *</label>
                <input
                  v-model="productForm.sku"
                  type="text"
                  placeholder="如：NUT-001"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">商品类型 *</label>
                <select
                  v-model="productForm.type"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="营养补充剂">营养补充剂</option>
                  <option value="药品">药品</option>
                  <option value="医疗器械">医疗器械</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">商品分类</label>
                <select
                  v-model="productForm.categoryId"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">请选择分类</option>
                  <option v-for="cat in flatCategories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">规格</label>
                <input
                  v-model="productForm.spec"
                  type="text"
                  placeholder="如：500mg * 30片"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">销售价格 *</label>
                <input
                  v-model="productForm.price"
                  type="number"
                  placeholder="0.00"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">成本价格</label>
                <input
                  v-model="productForm.costPrice"
                  type="number"
                  placeholder="0.00"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">单位</label>
                <input
                  v-model="productForm.unit"
                  type="text"
                  placeholder="件"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">库存预警线 *</label>
                <input
                  v-model="productForm.minStock"
                  type="number"
                  placeholder="10"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">条形码</label>
              <input
                v-model="productForm.barcode"
                type="text"
                placeholder="输入条形码"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">商品标签</label>
              <input
                v-model="productForm.tags"
                type="text"
                placeholder="用逗号分隔，如: 增肌,蛋白质"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1.5">商品描述</label>
              <textarea
                v-model="productForm.description"
                placeholder="请输入商品描述信息"
                rows="3"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="closeProductModal" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              取消
            </button>
            <button @click="saveProduct" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
              保存
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 分类编辑模态框 -->
    <Teleport to="body">
      <div v-if="showCategoryEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div class="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-white">{{ editingCategory?.id ? '编辑分类' : '新增分类' }}</h3>
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

    <!-- 商品详情模态框 -->
    <Teleport to="body">
      <div v-if="showDetailModal && detailProduct" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
            <h3 class="text-lg font-bold text-white">商品详情</h3>
            <button @click="showDetailModal = false" class="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X :size="20" class="text-white" />
            </button>
          </div>

          <div class="p-6 space-y-6">
            <!-- 基本信息 -->
            <div class="bg-slate-50 rounded-xl p-4">
              <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Package :size="18" class="text-indigo-600" />
                基本信息
              </h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-slate-500">SKU</span>
                  <div class="font-mono font-semibold text-indigo-600">{{ detailProduct.sku }}</div>
                </div>
                <div>
                  <span class="text-slate-500">商品名称</span>
                  <div class="font-semibold text-slate-900">{{ detailProduct.name }}</div>
                </div>
                <div>
                  <span class="text-slate-500">品牌</span>
                  <div class="font-medium text-slate-900">{{ detailProduct.brand }}</div>
                </div>
                <div>
                  <span class="text-slate-500">商品类型</span>
                  <div class="font-medium text-slate-900">{{ detailProduct.type }}</div>
                </div>
                <div>
                  <span class="text-slate-500">规格</span>
                  <div class="font-medium text-slate-900">{{ detailProduct.spec }}</div>
                </div>
                <div>
                  <span class="text-slate-500">单位</span>
                  <div class="font-medium text-slate-900">{{ detailProduct.unit }}</div>
                </div>
              </div>
            </div>

            <!-- 价格信息 -->
            <div class="bg-green-50 rounded-xl p-4">
              <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <DollarSign :size="18" class="text-green-600" />
                价格信息
              </h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-slate-500">销售价格</span>
                  <div class="font-bold text-lg text-green-600">¥{{ detailProduct.price }}</div>
                </div>
                <div>
                  <span class="text-slate-500">成本价格</span>
                  <div class="font-medium text-slate-900">¥{{ detailProduct.costPrice }}</div>
                </div>
              </div>
            </div>

            <!-- 库存信息 -->
            <div class="bg-blue-50 rounded-xl p-4">
              <h4 class="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Package :size="18" class="text-blue-600" />
                库存信息
              </h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-slate-500">当前库存</span>
                  <div class="font-bold text-lg text-slate-900">{{ detailProduct.stock }} 件</div>
                </div>
                <div>
                  <span class="text-slate-500">库存预警线</span>
                  <div class="font-medium text-slate-900">{{ detailProduct.minStock }} 件</div>
                </div>
                <div class="col-span-2">
                  <span class="text-slate-500">库存状态</span>
                  <div>
                    <span class="px-2 py-1 rounded-full text-xs font-semibold border" :class="getStockStatusClass(detailProduct.stock, detailProduct.minStock)">
                      {{ getStockStatusLabel(detailProduct.stock, detailProduct.minStock) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 其他信息 -->
            <div v-if="detailProduct.barcode || detailProduct.tags || detailProduct.description" class="bg-slate-50 rounded-xl p-4">
              <h4 class="font-bold text-slate-900 mb-4">其他信息</h4>
              <div class="space-y-2 text-sm">
                <div v-if="detailProduct.barcode">
                  <span class="text-slate-500">条形码</span>
                  <div class="font-mono text-slate-900">{{ detailProduct.barcode }}</div>
                </div>
                <div v-if="detailProduct.tags">
                  <span class="text-slate-500">标签</span>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <span v-for="tag in detailProduct.tags.split(',')" :key="tag" class="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs">
                      {{ tag.trim() }}
                    </span>
                  </div>
                </div>
                <div v-if="detailProduct.description">
                  <span class="text-slate-500">描述</span>
                  <p class="text-slate-600 mt-1">{{ detailProduct.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3">
            <button @click="showDetailModal = false" class="px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              关闭
            </button>
            <button @click="showDetailModal = false; editProduct(detailProduct)" class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
              编辑商品
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
  ShoppingBag,
  Package,
  FolderTree,
  Plus,
  Search,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit,
  Trash2,
  X,
  Download,
  ChevronDown,
  Laptop,
  Pill,
  Activity,
  Dumbbell,
  Armchair
} from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import ConfirmDialog from '../components/shared/ConfirmDialog.vue'
import Toast from '../components/shared/Toast.vue'

interface Product {
  id: string
  name: string
  brand: string
  sku: string
  type: string
  spec: string
  price: string
  costPrice: string
  unit: string
  stock: number
  minStock: number
  barcode?: string
  tags?: string
  description?: string
  categoryId?: string
}

interface CategoryNode {
  id: string
  name: string
  icon: string
  color: string
  count: number
  children?: CategoryNode[]
  parentId?: string
}

// 共享分类树数据（与资产管理保持一致）
const categoryTree = ref<CategoryNode[]>([
  {
    id: 'electronics',
    name: '电子设备',
    icon: 'Laptop',
    color: '#6366f1',
    count: 0,
    children: [
      { id: 'electronics-computer', name: '电脑设备', icon: 'Laptop', color: '#6366f1', count: 0, parentId: 'electronics' },
      { id: 'electronics-printer', name: '打印设备', icon: 'Package', color: '#6366f1', count: 0, parentId: 'electronics' }
    ]
  },
  {
    id: 'furniture',
    name: '办公家具',
    icon: 'Armchair',
    color: '#8b5cf6',
    count: 0,
    children: [
      { id: 'furniture-chair', name: '椅子', icon: 'Armchair', color: '#8b5cf6', count: 0, parentId: 'furniture' },
      { id: 'furniture-desk', name: '桌子', icon: 'Package', color: '#8b5cf6', count: 0, parentId: 'furniture' }
    ]
  },
  {
    id: 'medical',
    name: '医疗器械',
    icon: 'Activity',
    color: '#06b6d4',
    count: 0,
    children: []
  },
  {
    id: 'sports',
    name: '运动器材',
    icon: 'Dumbbell',
    color: '#10b981',
    count: 0,
    children: []
  },
  {
    id: 'nutrition',
    name: '营养补充剂',
    icon: 'Pill',
    color: '#f59e0b',
    count: 0,
    children: [
      { id: 'nutrition-protein', name: '蛋白粉', icon: 'Package', color: '#f59e0b', count: 0, parentId: 'nutrition' },
      { id: 'nutrition-vitamin', name: '维生素', icon: 'Pill', color: '#f59e0b', count: 0, parentId: 'nutrition' }
    ]
  },
  {
    id: 'medicine',
    name: '药品',
    icon: 'Pill',
    color: '#ef4444',
    count: 0,
    children: []
  },
  {
    id: 'other',
    name: '其他',
    icon: 'Package',
    color: '#6b7280',
    count: 0,
    children: []
  }
])

// 默认展开有子分类的根分类
expandedCategories.value = new Set(
  categoryTree.value.filter(cat => cat.children && cat.children.length > 0).map(cat => cat.id)
)

const iconOptions = [
  { value: 'Package', component: Package },
  { value: 'Laptop', component: Laptop },
  { value: 'Pill', component: Pill },
  { value: 'Activity', component: Activity },
  { value: 'Dumbbell', component: Dumbbell },
  { value: 'Armchair', component: Armchair }
]

const colorOptions = ['#8b5cf6', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#6b7280']

const currentView = ref<'products' | 'categories'>('products')
const searchText = ref('')
const typeFilter = ref('')
const stockFilter = ref('')
const categoryFilter = ref('')
const selectedCategoryId = ref<string | null>(null)
const expandedCategories = ref<Set<string>>(new Set())

const showProductModal = ref(false)
const showCategoryEditModal = ref(false)
const showDetailModal = ref(false)
const isEditMode = ref(false)
const detailProduct = ref<Product | null>(null)
const editingCategory = ref<CategoryNode | null>(null)

const { toast: toastFunc } = useToast()

const confirm = ref({
  show: false,
  title: '',
  message: '',
  type: 'warning' as 'warning' | 'danger',
  onConfirm: () => {},
  onCancel: () => {}
})

const productForm = ref({
  name: '',
  brand: '',
  sku: '',
  type: '营养补充剂',
  categoryId: '',
  spec: '',
  price: '',
  costPrice: '',
  unit: '件',
  stock: '',
  minStock: '',
  barcode: '',
  tags: '',
  description: ''
})

const categoryEditForm = ref({
  name: '',
  icon: 'Package',
  color: '#64748b'
})

const products = ref<Product[]>([
  {
    id: '1',
    name: '乳清蛋白粉',
    brand: 'Optimum Nutrition',
    sku: 'NUT-001',
    type: '营养补充剂',
    categoryId: 'nutrition-protein',
    spec: '5lbs/桶',
    price: '458.00',
    costPrice: '320.00',
    unit: '桶',
    stock: 120,
    minStock: 20,
    barcode: '6901234567890',
    tags: '增肌,蛋白质'
  },
  {
    id: '2',
    name: '深海鱼油软胶囊',
    brand: 'Blackmores',
    sku: 'NUT-002',
    type: '营养补充剂',
    categoryId: 'nutrition-vitamin',
    spec: '400粒/瓶',
    price: '189.00',
    costPrice: '120.00',
    unit: '瓶',
    stock: 15,
    minStock: 30,
    barcode: '6901234567891',
    tags: '心血管,Omega-3'
  },
  {
    id: '3',
    name: '二甲双胍片',
    brand: '格华止',
    sku: 'MED-001',
    type: '药品',
    categoryId: 'medicine',
    spec: '0.5g*20片',
    price: '24.50',
    costPrice: '15.00',
    unit: '盒',
    stock: 500,
    minStock: 100,
    barcode: '6901234567892',
    tags: '处方药,降糖'
  },
  {
    id: '4',
    name: '雅培瞬感传感器',
    brand: 'Abbott',
    sku: 'EQP-001',
    type: '医疗器械',
    categoryId: 'medical',
    spec: '1枚装(14天)',
    price: '450.00',
    costPrice: '320.00',
    unit: '枚',
    stock: 8,
    minStock: 10,
    barcode: '6901234567893',
    tags: 'CGM,血糖监测'
  },
  {
    id: '5',
    name: '复合维生素B族',
    brand: 'Swisse',
    sku: 'NUT-003',
    type: '营养补充剂',
    categoryId: 'nutrition-vitamin',
    spec: '120片/瓶',
    price: '118.00',
    costPrice: '75.00',
    unit: '瓶',
    stock: 0,
    minStock: 50,
    barcode: '6901234567894',
    tags: '代谢,维生素'
  },
  {
    id: '6',
    name: '阿卡波糖片',
    brand: '拜唐苹',
    sku: 'MED-002',
    type: '药品',
    categoryId: 'medicine',
    spec: '50mg*30片',
    price: '35.00',
    costPrice: '22.00',
    unit: '盒',
    stock: 320,
    minStock: 80,
    barcode: '6901234567895',
    tags: '处方药,降糖'
  },
  {
    id: '7',
    name: '电子血压计',
    brand: '欧姆龙',
    sku: 'EQP-002',
    type: '医疗器械',
    categoryId: 'medical',
    spec: 'HEM-7121',
    price: '299.00',
    costPrice: '200.00',
    unit: '台',
    stock: 67,
    minStock: 15,
    barcode: '6901234567896',
    tags: '监测,血压'
  },
  {
    id: '8',
    name: '左旋肉碱',
    brand: 'MuscleTech',
    sku: 'NUT-004',
    type: '营养补充剂',
    categoryId: 'nutrition-protein',
    spec: '60片/瓶',
    price: '168.00',
    costPrice: '110.00',
    unit: '瓶',
    stock: 15,
    minStock: 20,
    barcode: '6901234567897',
    tags: '减脂,运动'
  }
])

// 统计数据
const statistics = computed(() => {
  const totalProducts = products.value.length
  const totalValue = products.value.reduce((sum, p) => sum + parseFloat(p.price) * p.stock, 0)
  const inStockCount = products.value.filter(p => p.stock > p.minStock).length
  const lowStockCount = products.value.filter(p => p.stock > 0 && p.stock <= p.minStock).length
  const outOfStockCount = products.value.filter(p => p.stock === 0).length

  return { totalProducts, totalValue, inStockCount, lowStockCount, outOfStockCount }
})

// 扁平化分类列表（用于下拉选择）
const flatCategories = computed(() => {
  const result: Array<{ id: string; name: string }> = []
  const flatten = (nodes: CategoryNode[]) => {
    for (const node of nodes) {
      result.push({ id: node.id, name: node.name })
      if (node.children) flatten(node.children)
    }
  }
  flatten(categoryTree.value)
  return result
})

// 更新分类计数
const updateCategoryCounts = () => {
  const resetCounts = (nodes: CategoryNode[]) => {
    for (const node of nodes) {
      node.count = 0
      if (node.children) resetCounts(node.children)
    }
  }
  resetCounts(categoryTree.value)

  for (const product of products.value) {
    if (product.categoryId) {
      const incrementCount = (nodes: CategoryNode[]): boolean => {
        for (const node of nodes) {
          if (node.id === product.categoryId) {
            node.count++
            return true
          }
          if (node.children && incrementCount(node.children)) return true
        }
        return false
      }
      incrementCount(categoryTree.value)
    }
  }
}

// 初始化时更新分类计数
updateCategoryCounts()

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchSearch = !searchText.value ||
      product.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchText.value.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchText.value.toLowerCase())
    const matchType = !typeFilter.value || product.type === typeFilter.value
    const matchCategory = !categoryFilter.value || product.categoryId === categoryFilter.value

    let matchStock = true
    if (stockFilter.value === 'in_stock') matchStock = product.stock > product.minStock
    else if (stockFilter.value === 'low_stock') matchStock = product.stock > 0 && product.stock <= product.minStock
    else if (stockFilter.value === 'out_of_stock') matchStock = product.stock === 0

    return matchSearch && matchType && matchCategory && matchStock
  })
})

const categoryProducts = computed(() => {
  if (!selectedCategoryId.value) return []
  return products.value.filter(p => p.categoryId === selectedCategoryId.value)
})

const getStockStatusLabel = (stock: number, minStock: number) => {
  if (stock === 0) return '缺货'
  if (stock <= minStock) return '库存不足'
  return '库存充足'
}

const getStockStatusClass = (stock: number, minStock: number) => {
  if (stock === 0) return 'bg-red-100 text-red-800 border-red-200'
  if (stock <= minStock) return 'bg-orange-100 text-orange-800 border-orange-200'
  return 'bg-green-100 text-green-800 border-green-200'
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
  editingCategory.value = { id: '', name: '', icon: 'Package', color: '#64748b', count: 0, parentId }
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
  const hasProducts = products.value.some(p => p.categoryId === category.id)
  if (hasProducts) {
    toast.error('无法删除', '该分类下还有商品，请先移动或删除商品')
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

const openProductModal = () => {
  isEditMode.value = false
  productForm.value = {
    name: '',
    brand: '',
    sku: `PRD-${String(products.value.length + 1).padStart(3, '0')}`,
    type: '营养补充剂',
    categoryId: '',
    spec: '',
    price: '',
    costPrice: '',
    unit: '件',
    stock: '',
    minStock: '',
    barcode: '',
    tags: '',
    description: ''
  }
  showProductModal.value = true
}

const closeProductModal = () => {
  showProductModal.value = false
}

const editProduct = (product: Product) => {
  isEditMode.value = true
  productForm.value = {
    name: product.name,
    brand: product.brand,
    sku: product.sku,
    type: product.type,
    categoryId: product.categoryId || '',
    spec: product.spec,
    price: product.price,
    costPrice: product.costPrice,
    unit: product.unit,
    stock: String(product.stock),
    minStock: String(product.minStock),
    barcode: product.barcode || '',
    tags: product.tags || '',
    description: product.description || ''
  }
  showProductModal.value = true
}

const saveProduct = () => {
  if (!productForm.value.name || !productForm.value.sku || !productForm.value.price || !productForm.value.stock) {
    toast.error('请填写必填项')
    return
  }

  const stock = parseInt(productForm.value.stock)
  const minStock = parseInt(productForm.value.minStock || '10')

  if (isEditMode.value) {
    const index = products.value.findIndex(p => p.sku === productForm.value.sku)
    if (index > -1) {
      products.value[index] = {
        ...products.value[index],
        name: productForm.value.name,
        brand: productForm.value.brand,
        type: productForm.value.type,
        categoryId: productForm.value.categoryId,
        spec: productForm.value.spec,
        price: productForm.value.price,
        costPrice: productForm.value.costPrice,
        unit: productForm.value.unit,
        stock,
        minStock,
        barcode: productForm.value.barcode,
        tags: productForm.value.tags,
        description: productForm.value.description
      }
      toast.success('更新成功', `商品 "${productForm.value.name}" 已更新`)
    }
  } else {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: productForm.value.name,
      brand: productForm.value.brand,
      sku: productForm.value.sku,
      type: productForm.value.type,
      categoryId: productForm.value.categoryId,
      spec: productForm.value.spec,
      price: productForm.value.price,
      costPrice: productForm.value.costPrice,
      unit: productForm.value.unit,
      stock,
      minStock,
      barcode: productForm.value.barcode,
      tags: productForm.value.tags,
      description: productForm.value.description
    }
    products.value.unshift(newProduct)
    toast.success('添加成功', `商品 "${productForm.value.name}" 已添加`)
  }

  updateCategoryCounts()
  showProductModal.value = false
}

const deleteProduct = (id: string) => {
  const product = products.value.find(p => p.id === id)
  if (!product) return

  confirm.value = {
    show: true,
    title: '删除商品',
    message: `确定要删除商品 "${product.name}" 吗？此操作不可恢复。`,
    type: 'danger',
    onConfirm: () => {
      products.value = products.value.filter(p => p.id !== id)
      updateCategoryCounts()
      toast.success('删除成功', `商品 "${product.name}" 已删除`)
      confirm.value.show = false
    },
    onCancel: () => {
      confirm.value.show = false
    }
  }
}

const viewProductDetail = (product: Product) => {
  detailProduct.value = product
  showDetailModal.value = true
}

const exportProducts = () => {
  toast.success('导出成功', `已导出 ${filteredProducts.value.length} 条商品记录`)
}
</script>
