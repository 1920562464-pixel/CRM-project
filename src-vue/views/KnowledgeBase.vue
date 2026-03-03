<template>
  <div class="flex h-[calc(100vh-8rem)] rounded-xl overflow-hidden shadow-sm" :style="{
    background: 'var(--card)',
    border: '1px solid var(--border)'
  }">
    <!-- 左侧边栏 -->
    <div class="w-72 flex flex-col" :style="{
      background: 'var(--fill-light)',
      borderRight: '1px solid var(--border)'
    }">
      <!-- 快速上传 -->
      <div class="p-4" :style="{ borderBottom: '1px solid var(--border)' }">
        <button
          @click="openUploadModal"
          class="w-full px-4 py-2 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
          :style="{
            background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5'
          }"
        >
          <Upload :size="18" />
          上传文件
        </button>
      </div>

      <!-- 侧边栏标签页 -->
      <div class="flex" :style="{ borderBottom: '1px solid var(--border)' }">
        <button
          v-for="tab in sidebarTabs"
          :key="tab.id"
          @click="sidebarTab = tab.id"
          class="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors"
          :style="sidebarTab === tab.id ? {
            color: isBlackGold.value ? '#D4A84A' : '#4f46e5',
            borderBottom: '2px solid ' + (isBlackGold.value ? '#B8860B' : '#4f46e5'),
            background: isBlackGold.value ? 'rgba(184, 134, 11, 0.1)' : '#eef2ff'
          } : {
            color: 'var(--text-secondary)'
          }"
        >
          <component :is="tab.icon" :size="16" />
          {{ tab.label }}
        </button>
      </div>

      <!-- 侧边栏内容 -->
      <div class="flex-1 overflow-y-auto p-4">
        <!-- 文件夹标签页 -->
        <div v-if="sidebarTab === 'folders'" class="space-y-1">
          <button
            @click="navigateToFolder('root')"
            class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            :style="currentFolderId === 'root' && activeTab === 'all' ? {
              background: isBlackGold.value ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5',
              color: 'white'
            } : {}"
          >
            <Home :size="16" />
            <span>全部文件</span>
          </button>

          <!-- 文件夹树 -->
          <div class="ml-2 space-y-0.5">
            <FolderTreeItem
              v-for="folder in rootFolders"
              :key="folder.id"
              :folder="folder"
              :folders="folders"
              :current-folder-id="currentFolderId"
              @folder-click="navigateToFolder"
              @rename="handleRenameFolder"
              @delete="handleDeleteFolder"
              :level="0"
            />
          </div>

          <button
            @click="showNewFolderModal = true"
            class="w-full flex items-center justify-center gap-2 px-3 py-2 mt-2 text-sm rounded-lg transition-colors"
            :style="{ color: 'var(--text-secondary)' }"
          >
            <Plus :size="16" />
            新建文件夹
          </button>
        </div>

        <!-- 标签标签页 -->
        <div v-if="sidebarTab === 'tags'" class="space-y-1">
          <button
            v-for="[tag, count] in allTags"
            :key="tag"
            @click="searchQuery = tag"
            class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors group"
            :style="{
              background: 'transparent',
              color: 'var(--text-primary)'
            }"
          >
            <span>{{ tag }}</span>
            <span class="px-2 py-0.5 rounded text-xs" :style="{
              background: 'var(--fill)',
              color: 'var(--text-secondary)'
            }">{{ count }}</span>
          </button>
        </div>

        <!-- 收藏标签页 -->
        <div v-if="sidebarTab === 'starred'" class="space-y-2">
          <button
            v-for="file in starredFiles"
            :key="file.id"
            @click="navigateToFolder(file.folderId)"
            class="w-full text-left p-2 rounded-lg transition-colors"
            :style="{ color: 'var(--text-primary)' }"
          >
            <div class="flex items-center gap-2">
              <component :is="getFileIcon(file.type, 18)" />
              <span class="text-sm truncate">{{ file.name }}</span>
            </div>
          </button>
        </div>

        <!-- 最近标签页 -->
        <div v-if="sidebarTab === 'recent'" class="space-y-2">
          <button
            v-for="file in recentFiles"
            :key="file.id"
            @click="navigateToFolder(file.folderId)"
            class="w-full text-left p-2 rounded-lg transition-colors"
            :style="{ color: 'var(--text-primary)' }"
          >
            <div class="flex items-center gap-2">
              <component :is="getFileIcon(file.type, 18)" />
              <div class="flex-1 min-w-0">
                <p class="text-sm truncate">{{ file.name }}</p>
                <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">{{ file.updatedAt }}</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- 存储空间提示 -->
      <div class="p-4" :style="{
        borderTop: '1px solid var(--border)',
        background: 'var(--fill)'
      }">
        <div class="text-xs mb-2" :style="{ color: 'var(--text-secondary)' }">存储空间</div>
        <div class="w-full h-2 rounded-full overflow-hidden" :style="{ background: 'var(--border)' }">
          <div class="h-full w-1/3" :style="{ background: isBlackGold.value ? '#B8860B' : '#4f46e5' }"></div>
        </div>
        <div class="text-xs mt-1" :style="{ color: 'var(--text-secondary)' }">
          已用 3.2 GB / 10 GB
        </div>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="flex-1 flex flex-col overflow-hidden" :style="{ background: 'var(--card)' }">
      <!-- 顶部工具栏 -->
      <div class="border-b border-slate-200 px-6 py-4 space-y-4">
        <!-- 面包屑导航 -->
        <div class="flex items-center gap-2 text-sm">
          <button
            @click="navigateToFolder('root')"
            class="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <Home :size="16" />
          </button>
          <template v-for="(folder, idx) in currentPath" :key="folder.id">
            <ChevronRight :size="14" class="text-slate-400" />
            <button
              v-if="idx !== currentPath.length - 1"
              @click="navigateToFolder(folder.id)"
              class="text-slate-500 hover:text-slate-700 transition-colors"
            >
              {{ folder.name }}
            </button>
            <span v-else class="font-medium text-slate-900">{{ folder.name }}</span>
          </template>
        </div>

        <!-- 搜索和操作栏 -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索文件、标签..."
                class="pl-10 pr-4 py-2 w-80 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              />
            </div>

            <select
              v-model="sortBy"
              class="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
            >
              <option value="name">名称</option>
              <option value="date">日期</option>
              <option value="size">大小</option>
              <option value="views">浏览量</option>
            </select>

            <button class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50">
              <RefreshCw :size="18" class="text-slate-600" />
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="showNewFolderModal = true"
              class="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm"
            >
              <Plus :size="16" />
              新建文件夹
            </button>

            <button
              @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
              class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <component :is="viewMode === 'grid' ? Grid : ListIcon" :size="18" class="text-slate-600" />
            </button>

            <template v-if="selectedItems.size > 0">
              <button class="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm">
                <Download :size="16" />
                批量下载
              </button>
              <button
                @click="showMoveModal = true"
                class="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm"
              >
                <Move :size="16" />
                移动
              </button>
              <button class="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm">
                <Trash2 :size="16" />
                删除
              </button>
            </template>
          </div>
        </div>

        <!-- 快速筛选标签 -->
        <div class="flex items-center gap-2">
          <button
            @click="activeTab = 'all'"
            :class="`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeTab === 'all' ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`"
          >
            全部
          </button>
          <button
            @click="activeTab = 'starred'"
            :class="`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
              activeTab === 'starred' ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`"
          >
            <Star :size="14" />
            收藏
          </button>
          <button
            @click="activeTab = 'shared'"
            :class="`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${
              activeTab === 'shared' ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`"
          >
            <Share2 :size="14" />
            已分享
          </button>
        </div>
      </div>

      <!-- 文件列表 -->
      <div class="flex-1 overflow-y-auto p-6">
        <template v-if="subFolders.length > 0 || currentFiles.length > 0">
          <!-- 全选 -->
          <div class="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              :checked="selectedItems.size === subFolders.length + currentFiles.length && subFolders.length + currentFiles.length > 0"
              @change="handleSelectAll"
              class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-sm text-slate-500">
              {{ selectedItems.size > 0 ? `已选 ${selectedItems.size} 项` : `共 ${subFolders.length + currentFolderFiles.length} 项` }}
            </span>
          </div>

          <!-- 网格视图 -->
          <div v-if="viewMode === 'grid'" class="grid grid-cols-4 gap-3">
            <!-- 文件夹卡片 -->
            <FolderCard
              v-for="folder in subFolders"
              :key="folder.id"
              :folder="folder"
              :is-selected="selectedItems.has(folder.id)"
              @select="handleSelectItem(folder.id)"
              @open="navigateToFolder(folder.id)"
              @rename="(name) => handleRenameFolder(folder.id, name)"
              @delete="handleDeleteFolder(folder.id)"
            />

            <!-- 文件卡片 -->
            <FileCard
              v-for="file in currentFiles"
              :key="file.id"
              :file="file"
              :is-selected="selectedItems.has(file.id)"
              @select="handleSelectItem(file.id)"
              @toggle-star="handleToggleStar(file.id)"
              @share="openShareModal(file)"
              @delete="handleDeleteFile(file.id)"
              @move="(targetId) => handleMoveFile(file.id, targetId)"
              @duplicate="handleDuplicateFile(file.id)"
            />
          </div>

          <!-- 列表视图 -->
          <div v-else class="space-y-2">
            <div class="text-sm text-slate-500 mb-2">
              共 {{ subFolders.length + currentFolderFiles.length }} 项
            </div>
            <!-- 文件夹列表项 -->
            <FolderListItem
              v-for="folder in subFolders"
              :key="folder.id"
              :folder="folder"
              :is-selected="selectedItems.has(folder.id)"
              @select="handleSelectItem(folder.id)"
              @open="navigateToFolder(folder.id)"
              @rename="(name) => handleRenameFolder(folder.id, name)"
              @delete="handleDeleteFolder(folder.id)"
            />
            <!-- 文件列表项 -->
            <FileListItem
              v-for="file in currentFiles"
              :key="file.id"
              :file="file"
              :is-selected="selectedItems.has(file.id)"
              @select="handleSelectItem(file.id)"
              @toggle-star="handleToggleStar(file.id)"
              @share="openShareModal(file)"
              @delete="handleDeleteFile(file.id)"
            />
          </div>
        </template>

        <!-- 空状态 -->
        <div v-else class="flex flex-col items-center justify-center h-full text-center py-12">
          <Folder :size="64" class="text-slate-300 mb-4" />
          <h4 class="text-lg font-semibold text-slate-900 mb-2">文件夹为空</h4>
          <p class="text-sm text-slate-500 mb-4">
            在此目录上传文件或创建子文件夹
          </p>
          <div class="flex gap-2">
            <button
              @click="openUploadModal"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm"
            >
              <Upload :size="16" />
              上传文件
            </button>
            <button
              @click="showNewFolderModal = true"
              class="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm"
            >
              <Plus :size="16" />
              新建子文件夹
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传文件对话框 -->
    <Teleport to="body">
      <div v-if="showUploadModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showUploadModal = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
          <div class="px-6 py-4 border-b border-slate-200">
            <h3 class="text-lg font-semibold text-slate-900">上传文件</h3>
            <p class="text-sm text-slate-500 mt-1">支持上传 PDF、Word、PPT、视频、图片等文件格式</p>
          </div>

          <div class="p-6">
            <!-- 选择文件阶段 -->
            <div v-if="uploadStep === 'select'" class="space-y-4">
              <!-- 文件夹选择 -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">上传到文件夹</label>
                <div class="border border-slate-200 rounded-lg max-h-48 overflow-y-auto">
                  <FolderSelectItem
                    v-for="folder in folders"
                    :key="folder.id"
                    :folder="folder"
                    :folders="folders"
                    :selected-id="uploadFolderId || 'root'"
                    @select="uploadFolderId = $event"
                    :level="0"
                  />
                </div>
              </div>

              <div class="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <Upload :size="48" class="mx-auto text-slate-400 mb-4" />
                <p class="text-slate-700 font-medium mb-2">拖拽文件到此处</p>
                <p class="text-sm text-slate-500 mb-4">或者</p>
                <input
                  type="file"
                  multiple
                  @change="handleFileSelect"
                  class="hidden"
                  id="file-upload"
                />
                <label for="file-upload">
                  <span class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 inline-block cursor-pointer">选择文件</span>
                </label>
              </div>

              <div v-if="uploadFiles.length > 0" class="space-y-2">
                <p class="text-sm font-medium">已选择 {{ uploadFiles.length }} 个文件</p>
                <div v-for="(file, idx) in uploadFiles" :key="idx" class="flex items-center justify-between p-2 bg-slate-100 rounded">
                  <div class="flex items-center gap-2">
                    <component :is="getFileTypeIcon(getFileTypeFromName(file.name), 20)" />
                    <span class="text-sm truncate">{{ file.name }}</span>
                  </div>
                  <button
                    @click="uploadFiles = uploadFiles.filter((_, i) => i !== idx)"
                    class="p-1 hover:bg-slate-200 rounded"
                  >
                    <X :size="14" class="text-slate-500" />
                  </button>
                </div>
              </div>
            </div>

            <!-- 上传中阶段 -->
            <div v-if="uploadStep === 'uploading'" class="flex flex-col items-center justify-center py-8">
              <RefreshCw :size="48" class="text-indigo-600 animate-spin mb-4" />
              <p class="text-slate-700 font-medium mb-2">正在上传...</p>
              <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-600 transition-all" :style="{ width: `${uploadProgress}%` }"></div>
              </div>
              <p class="text-sm text-slate-500 mt-2">{{ uploadProgress }}%</p>
            </div>

            <!-- 上传成功阶段 -->
            <div v-if="uploadStep === 'success'" class="flex flex-col items-center justify-center py-8">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 :size="32" class="text-green-600" />
              </div>
              <p class="text-slate-700 font-medium mb-2">上传成功！</p>
              <p class="text-sm text-slate-500">
                已成功上传 {{ uploadFiles.length }} 个文件
              </p>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              @click="showUploadModal = false"
              class="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              v-if="uploadStep === 'select'"
              @click="handleFileUpload"
              :disabled="uploadFiles.length === 0"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              开始上传
            </button>
            <button
              v-if="uploadStep === 'success'"
              @click="showUploadModal = false"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 新建文件夹对话框 -->
    <Teleport to="body">
      <div v-if="showNewFolderModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showNewFolderModal = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
          <div class="px-6 py-4 border-b border-slate-200">
            <h3 class="text-lg font-semibold text-slate-900">新建文件夹</h3>
            <p class="text-sm text-slate-500 mt-1">在当前目录创建新文件夹</p>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">父级文件夹</label>
              <div class="flex items-center gap-2 p-2 bg-slate-100 rounded">
                <Folder :size="16" class="text-slate-500" />
                <span class="text-sm">{{ currentFolderName }}</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">文件夹名称</label>
              <input
                v-model="newFolderName"
                type="text"
                placeholder="输入文件夹名称"
                class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autofocus
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">图标颜色</label>
              <div class="flex gap-2">
                <button
                  v-for="color in folderColors"
                  :key="color"
                  @click="newFolderColor = color"
                  :class="`w-8 h-8 rounded-full transition-all ${newFolderColor === color ? 'ring-2 ring-offset-2 ring-indigo-600' : ''}`"
                  :style="{ backgroundColor: color }"
                />
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              @click="showNewFolderModal = false"
              class="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              @click="handleCreateFolder"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              创建
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 分享对话框 -->
    <Teleport to="body">
      <div v-if="showShareModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showShareModal = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
          <div class="px-6 py-4 border-b border-slate-200">
            <h3 class="text-lg font-semibold text-slate-900">分享文件</h3>
          </div>

          <div v-if="selectedFile" class="p-6 space-y-4">
            <div class="flex items-center gap-3 p-3 bg-slate-100 rounded-lg">
              <component :is="getFileTypeIcon(selectedFile.type, 32)" />
              <div class="flex-1 min-w-0">
                <p class="font-medium truncate">{{ selectedFile.name }}</p>
                <p class="text-xs text-slate-500">{{ selectedFile.size }}</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">分享链接</label>
              <div class="flex gap-2">
                <input
                  :value="`https://crm.example.com/share/${selectedFile.id}`"
                  readonly
                  class="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm"
                />
                <button class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <Copy :size="16" class="text-slate-600" />
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">权限设置</label>
              <select class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="view">仅查看</option>
                <option value="download">可下载</option>
                <option value="edit">可编辑</option>
              </select>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              @click="showShareModal = false"
              class="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              创建链接
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 删除确认对话框 -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showDeleteConfirm = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
          <div class="px-6 py-4 border-b border-slate-200">
            <h3 class="text-lg font-semibold text-slate-900">确认删除</h3>
          </div>
          <div class="p-6">
            <p class="text-sm text-slate-500">
              确定要删除"{{ selectedFile?.name }}"吗？此操作无法撤销。
            </p>
          </div>
          <div class="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              @click="showDeleteConfirm = false"
              class="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              取消
            </button>
            <button
              @click="confirmDelete"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme } from '../composables/useTheme'

// 主题相关
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')
import {
  Search, FileText, Video, Image as ImageIcon, Book, Tag, Folder, FolderOpen,
  Download, Eye, Clock, Grid, List as ListIcon, Plus, Upload, Edit, Trash2,
  Star, Share2, MoreVertical, X, ChevronRight, Home, RefreshCw, Filter,
  History, Lock, Unlock, Copy, Move, Users, File, Archive, Settings,
  CheckCircle2
} from 'lucide-vue-next'
import FolderTreeItem from '../components/knowledge/FolderTreeItem.vue'
import FolderCard from '../components/knowledge/FolderCard.vue'
import FolderListItem from '../components/knowledge/FolderListItem.vue'
import FileCard from '../components/knowledge/FileCard.vue'
import FileListItem from '../components/knowledge/FileListItem.vue'
import FolderSelectItem from '../components/knowledge/FolderSelectItem.vue'

// 类型定义
type ViewMode = 'grid' | 'list'
type FileType = 'folder' | 'pdf' | 'doc' | 'video' | 'image' | 'text' | 'other'
type SortBy = 'name' | 'date' | 'size' | 'views'

interface FolderNode {
  id: string
  name: string
  parentId: string | null
  children?: FolderNode[]
  icon?: string
  color?: string
  createdAt: string
}

interface KnowledgeFile {
  id: string
  name: string
  type: FileType
  folderId: string | null
  size?: string
  duration?: string
  views: number
  downloads: number
  createdAt: string
  updatedAt: string
  tags: string[]
  isStarred: boolean
  isShared: boolean
  isLocked: boolean
  author: string
  version: number
  description?: string
  thumbnail?: string
  comments?: Comment[]
  likes?: number
}

interface Comment {
  id: string
  author: string
  content: string
  createdAt: string
}

// Mock 数据
const MOCK_FOLDERS: FolderNode[] = [
  { id: 'root', name: '根目录', parentId: null, createdAt: '2024-01-01' },
  { id: 'f1', name: '糖尿病管理', parentId: 'root', createdAt: '2024-01-05', color: '#3b82f6' },
  { id: 'f2', name: '高血压干预', parentId: 'root', createdAt: '2024-01-06', color: '#ef4444' },
  { id: 'f3', name: '营养指导', parentId: 'root', createdAt: '2024-01-07', color: '#10b981' },
  { id: 'f4', name: '运动康复', parentId: 'root', createdAt: '2024-01-08', color: '#f59e0b' },
  { id: 'f5', name: '客户服务', parentId: 'root', createdAt: '2024-01-09', color: '#8b5cf6' },
  { id: 'f1-1', name: '初诊沟通', parentId: 'f1', createdAt: '2024-01-10', color: '#3b82f6' },
  { id: 'f1-2', name: '复诊跟进', parentId: 'f1', createdAt: '2024-01-11', color: '#3b82f6' },
]

const MOCK_FILES: KnowledgeFile[] = [
  {
    id: 'file1',
    name: '2型糖尿病患者初次沟通指南.pdf',
    type: 'pdf',
    folderId: 'f1-1',
    size: '2.4 MB',
    views: 1240,
    downloads: 856,
    createdAt: '2025-12-10',
    updatedAt: '2026-01-15',
    tags: ['糖尿病', '沟通技巧'],
    isStarred: true,
    isShared: false,
    isLocked: false,
    author: '张教练',
    version: 3,
    description: '针对2型糖尿病患者的首次沟通标准流程',
    likes: 45
  },
  {
    id: 'file2',
    name: '高血压干预标准流程 V3.0.pdf',
    type: 'pdf',
    folderId: 'f2',
    size: '1.8 MB',
    views: 890,
    downloads: 432,
    createdAt: '2026-01-15',
    updatedAt: '2026-01-15',
    tags: ['高血压', 'SOP'],
    isStarred: false,
    isShared: true,
    isLocked: false,
    author: '王专家',
    version: 1,
    likes: 32
  },
  {
    id: 'file3',
    name: '新入职健康管理师培训营.mp4',
    type: 'video',
    folderId: 'root',
    duration: '45:00',
    views: 340,
    downloads: 120,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    tags: ['新人', '培训'],
    isStarred: true,
    isShared: false,
    isLocked: false,
    author: '培训部',
    version: 1,
    likes: 67
  },
  {
    id: 'file4',
    name: '营养评估基础知识.pptx',
    type: 'doc',
    folderId: 'f3',
    size: '5.6 MB',
    views: 670,
    downloads: 234,
    createdAt: '2025-12-15',
    updatedAt: '2026-01-10',
    tags: ['营养', '基础'],
    isStarred: false,
    isShared: false,
    isLocked: false,
    author: '刘营养师',
    version: 2,
    likes: 28
  },
  {
    id: 'file5',
    name: '八段锦跟练视频（标准版）.mp4',
    type: 'video',
    folderId: 'f4',
    duration: '12:00',
    views: 5600,
    downloads: 2100,
    createdAt: '2025-08-01',
    updatedAt: '2025-08-01',
    tags: ['运动', '素材'],
    isStarred: true,
    isShared: true,
    isLocked: false,
    author: '运动康复组',
    version: 1,
    likes: 234
  },
]

// 状态管理
const currentFolderId = ref<string | null>('root')
const folders = ref<FolderNode[]>(MOCK_FOLDERS)
const files = ref<KnowledgeFile[]>(MOCK_FILES)
const viewMode = ref<ViewMode>('grid')
const searchQuery = ref('')
const sortBy = ref<SortBy>('name')
const selectedItems = ref<Set<string>>(new Set())
const showUploadModal = ref(false)
const showNewFolderModal = ref(false)
const showShareModal = ref(false)
const showMoveModal = ref(false)
const showDeleteConfirm = ref(false)
const selectedFile = ref<KnowledgeFile | null>(null)
const activeTab = ref<'all' | 'starred' | 'shared' | 'recent' | 'trash'>('all')
const sidebarTab = ref<'folders' | 'tags' | 'starred' | 'recent'>('folders')

// 新建文件夹状态
const newFolderName = ref('')
const newFolderColor = ref('#3b82f6')
const folderColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

// 上传文件状态
const uploadFiles = ref<File[]>([])
const uploadProgress = ref(0)
const uploadStep = ref<'select' | 'uploading' | 'success'>('select')
const uploadFolderId = ref<string | null>(currentFolderId.value)

// 侧边栏标签
const sidebarTabs = [
  { id: 'folders' as const, label: '文件夹', icon: Folder },
  { id: 'tags' as const, label: '标签', icon: Tag },
  { id: 'starred' as const, label: '收藏', icon: Star },
  { id: 'recent' as const, label: '最近', icon: History }
]

// 计算当前路径
const currentPath = computed(() => {
  const path: FolderNode[] = []
  let current = folders.value.find(f => f.id === currentFolderId.value)
  while (current) {
    path.unshift(current)
    current = folders.value.find(f => f.id === current.parentId)
  }
  return path
})

// 当前文件夹名称
const currentFolderName = computed(() => {
  return folders.value.find(f => f.id === currentFolderId.value)?.name || '根目录'
})

// 获取当前文件夹的子文件夹
const subFolders = computed(() => {
  return folders.value.filter(f => f.parentId === currentFolderId.value)
})

// 获取根文件夹（用于侧边栏树）
const rootFolders = computed(() => {
  return folders.value.filter(f => f.parentId === 'root')
})

// 获取当前文件夹的文件（用于选择计数）
const currentFolderFiles = computed(() => {
  return files.value.filter(f => f.folderId === currentFolderId.value)
})

// 获取当前文件夹的文件
const currentFiles = computed(() => {
  let filteredFiles = files.value.filter(f => {
    if (activeTab.value === 'starred') return f.isStarred
    if (activeTab.value === 'shared') return f.isShared
    if (activeTab.value === 'trash') return false
    return f.folderId === currentFolderId.value
  })

  // 搜索过滤
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    filteredFiles = filteredFiles.filter(f =>
      f.name.toLowerCase().includes(search) ||
      f.tags.some(t => t.toLowerCase().includes(search))
    )
  }

  // 排序
  filteredFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy.value === 'name') return a.name.localeCompare(b.name, 'zh')
    if (sortBy.value === 'date') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    if (sortBy.value === 'views') return b.views - a.views
    if (sortBy.value === 'size') {
      const sizeA = parseFloat(a.size || '0')
      const sizeB = parseFloat(b.size || '0')
      return sizeB - sizeA
    }
    return 0
  })

  return filteredFiles
})

// 获取所有标签
const allTags = computed(() => {
  const tags = new Map<string, number>()
  files.value.forEach(f => {
    f.tags.forEach(tag => {
      tags.set(tag, (tags.get(tag) || 0) + 1)
    })
  })
  return Array.from(tags.entries()).sort((a, b) => b[1] - a[1])
})

// 获取收藏文件
const starredFiles = computed(() => files.value.filter(f => f.isStarred))

// 获取最近访问文件
const recentFiles = computed(() => {
  return [...files.value]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10)
})

// 文件操作函数
const handleToggleStar = (fileId: string) => {
  files.value = files.value.map(f =>
    f.id === fileId ? { ...f, isStarred: !f.isStarred } : f
  )
}

const handleToggleLock = (fileId: string) => {
  files.value = files.value.map(f =>
    f.id === fileId ? { ...f, isLocked: !f.isLocked } : f
  )
}

const handleDeleteFile = (fileId: string) => {
  selectedFile.value = files.value.find(f => f.id === fileId) || null
  showDeleteConfirm.value = true
}

const confirmDelete = () => {
  if (selectedFile.value) {
    files.value = files.value.filter(f => f.id !== selectedFile.value!.id)
    selectedFile.value = null
    showDeleteConfirm.value = false
  }
}

const handleMoveFile = (fileId: string, targetFolderId: string) => {
  files.value = files.value.map(f =>
    f.id === fileId ? { ...f, folderId: targetFolderId } : f
  )
}

const handleDuplicateFile = (fileId: string) => {
  const file = files.value.find(f => f.id === fileId)
  if (file) {
    const newFile: KnowledgeFile = {
      ...file,
      id: `file-${Date.now()}`,
      name: `${file.name} (副本)`,
      views: 0,
      downloads: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      version: 1,
      isStarred: false
    }
    files.value = [...files.value, newFile]
  }
}

// 文件夹操作函数
const handleCreateFolder = () => {
  if (!newFolderName.value.trim()) return
  const newFolder: FolderNode = {
    id: `folder-${Date.now()}`,
    name: newFolderName.value,
    parentId: currentFolderId.value,
    color: newFolderColor.value,
    createdAt: new Date().toISOString().split('T')[0]
  }
  folders.value = [...folders.value, newFolder]
  newFolderName.value = ''
  showNewFolderModal.value = false
}

const handleRenameFolder = (folderId: string, newName: string) => {
  folders.value = folders.value.map(f =>
    f.id === folderId ? { ...f, name: newName } : f
  )
}

const handleDeleteFolder = (folderId: string) => {
  // 删除文件夹及其子文件夹
  const folderIds = [folderId]
  const findChildren = (parentId: string) => {
    const children = folders.value.filter(f => f.parentId === parentId)
    children.forEach(c => {
      folderIds.push(c.id)
      findChildren(c.id)
    })
  }
  findChildren(folderId)

  // 删除文件夹内的文件
  files.value = files.value.filter(f => !folderIds.includes(f.folderId || ''))
  // 删除文件夹
  folders.value = folders.value.filter(f => !folderIds.includes(f.id))
}

const navigateToFolder = (folderId: string) => {
  currentFolderId.value = folderId
  activeTab.value = 'all'
}

// 上传处理
const openUploadModal = () => {
  uploadFolderId.value = currentFolderId.value
  showUploadModal.value = true
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    uploadFiles.value = Array.from(target.files)
  }
}

const handleFileUpload = async () => {
  if (uploadFiles.value.length === 0) return

  uploadStep.value = 'uploading'
  for (let i = 0; i <= 100; i += 10) {
    await new Promise(resolve => setTimeout(resolve, 50))
    uploadProgress.value = i
  }

  // 模拟上传成功，添加到文件列表
  const newFiles: KnowledgeFile[] = uploadFiles.value.map((file, idx) => ({
    id: `file-${Date.now()}-${idx}`,
    name: file.name,
    type: getFileTypeFromName(file.name),
    folderId: uploadFolderId.value,
    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    views: 0,
    downloads: 0,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    tags: [],
    isStarred: false,
    isShared: false,
    isLocked: false,
    author: '当前用户',
    version: 1
  }))

  files.value = [...files.value, ...newFiles]
  uploadStep.value = 'success'
  setTimeout(() => {
    showUploadModal.value = false
    uploadFiles.value = []
    uploadProgress.value = 0
    uploadStep.value = 'select'
    uploadFolderId.value = currentFolderId.value
  }, 1500)
}

const getFileTypeFromName = (name: string): FileType => {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['doc', 'docx', 'ppt', 'pptx'].includes(ext || '')) return 'doc'
  if (['mp4', 'avi', 'mov'].includes(ext || '')) return 'video'
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image'
  if (ext === 'txt') return 'text'
  return 'other'
}

// 选择处理
const handleSelectItem = (itemId: string) => {
  if (selectedItems.value.has(itemId)) {
    selectedItems.value.delete(itemId)
  } else {
    selectedItems.value.add(itemId)
  }
}

const handleSelectAll = () => {
  const allItemIds = [...subFolders.value.map(f => f.id), ...currentFolderFiles.value.map(f => f.id)]
  if (selectedItems.value.size === allItemIds.length) {
    selectedItems.value.clear()
  } else {
    selectedItems.value = new Set(allItemIds)
  }
}

// 获取文件图标组件
const getFileTypeIcon = (type: FileType, size: number = 24) => {
  switch (type) {
    case 'pdf': return FileText
    case 'doc': return FileText
    case 'video': return Video
    case 'image': return ImageIcon
    case 'text': return FileText
    default: return File
  }
}

const getFileIcon = (type: FileType, size: number = 24) => {
  return getFileTypeIcon(type, size)
}

// 打开分享模态框
const openShareModal = (file: KnowledgeFile) => {
  selectedFile.value = file
  showShareModal.value = true
}
</script>
