<template>
  <div class="flex h-[calc(100vh-8rem)] rounded-xl overflow-hidden shadow-sm" :style="{
    background: 'var(--card)',
    border: '1px solid var(--border)'
  }">
    <!-- 移动端导航按钮 -->
    <button
      v-if="isMobile"
      @click="mobileNav.toggle()"
      class="md:hidden fixed top-4 left-4 z-40 p-2 rounded-lg shadow-lg"
      :style="{ background: 'var(--card)', border: '1px solid var(--border)' }"
    >
      <Menu :size="24" :style="{ color: 'var(--text-primary)' }" />
    </button>

    <!-- 移动端侧边栏遮罩 -->
    <div
      v-if="isMobile && mobileNav.isOpen"
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
      @click="mobileNav.close()"
    ></div>

    <!-- 左侧边栏 -->
    <div
      class="flex flex-col z-50 transition-transform duration-300 md:translate-x-0"
      :class="[
        isMobile ? 'fixed left-0 top-0 h-full w-72' : 'w-72',
        isMobile && !mobileNav.isOpen ? '-translate-x-full' : ''
      ]"
      :style="{
        background: 'var(--fill-light)',
        borderRight: '1px solid var(--border)'
      }"
    >
      <!-- 移动端关闭按钮 -->
      <div v-if="isMobile" class="flex items-center justify-between p-4 border-b">
        <span class="font-semibold text-sm" :style="{ color: 'var(--text-primary)' }">导航</span>
        <button @click="mobileNav.close()" class="p-1">
          <X :size="20" :style="{ color: 'var(--text-secondary)' }" />
        </button>
      </div>
      <!-- 快速上传 -->
      <div class="p-4" :style="{ borderBottom: '1px solid var(--border)' }">
        <button
          @click="openUploadModal(currentFolderId)"
          class="w-full px-4 py-2 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
          :style="{
            background: isBlackGold ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5'
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
            color: isBlackGold ? '#D4A84A' : '#4f46e5',
            borderBottom: '2px solid ' + (isBlackGold ? '#B8860B' : '#4f46e5'),
            background: isBlackGold ? 'rgba(184, 134, 11, 0.1)' : '#eef2ff'
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
              background: isBlackGold ? 'linear-gradient(135deg, #B8860B 0%, #9A6F09 100%)' : '#4f46e5',
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
              @rename="renameFolder"
              @delete="deleteFolder"
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
            @click="navigateToFolder(file.folderId!)"
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
            @click="navigateToFolder(file.folderId!)"
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
          <div class="h-full w-1/3" :style="{ background: isBlackGold ? '#B8860B' : '#4f46e5' }"></div>
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
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div class="flex items-center gap-2 w-full md:w-auto">
            <div class="relative flex-1 md:flex-none">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
              <input
                ref="searchInputRef"
                v-model="searchQuery"
                type="text"
                placeholder="搜索文件、链接、标签..."
                class="w-full md:w-80 pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
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

            <button class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 hidden md:block">
              <RefreshCw :size="18" class="text-slate-600" />
            </button>
            <button
              @click="showShortcutsHelp = true"
              class="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 hidden md:block"
              title="键盘快捷键 (?)"
            >
              <Keyboard :size="18" class="text-slate-600" />
            </button>
          </div>

          <div class="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <button
              @click="showNewFolderModal = true"
              class="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm"
            >
              <Plus :size="16" />
              新建文件夹
            </button>

            <button
              @click="showAddLinkModal = true"
              class="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm"
            >
              <Link2 :size="16" />
              添加链接
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
        <div class="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 -mx-2 px-2 md:mx-0 md:px-0">
          <button
            @click="activeTab = 'all'"
            :class="`px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'all' ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`"
          >
            全部
          </button>
          <button
            @click="activeTab = 'starred'"
            :class="`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
              activeTab === 'starred' ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`"
          >
            <Star :size="14" />
            收藏
          </button>
          <button
            @click="activeTab = 'shared'"
            :class="`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
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
              @change="toggleSelectAll"
              class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span class="text-sm text-slate-500">
              {{ selectedItems.size > 0 ? `已选 ${selectedItems.size} 项` : `共 ${subFolders.length + currentFolderFiles.length} 项` }}
            </span>
          </div>

          <!-- 网格视图 -->
          <div v-if="viewMode === 'grid'" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <!-- 文件夹卡片 -->
            <FolderCard
              v-for="folder in subFolders"
              :key="folder.id"
              :folder="folder"
              :is-selected="selectedItems.has(folder.id)"
              @select="selectItem(folder.id)"
              @open="navigateToFolder(folder.id)"
              @rename="(name) => renameFolder(folder.id, name)"
              @delete="deleteFolder(folder.id)"
            />

            <!-- 文件卡片 -->
            <FileCard
              v-for="file in currentFiles"
              :key="file.id"
              :file="file"
              :is-selected="selectedItems.has(file.id)"
              @select="selectItem(file.id)"
              @toggle-star="toggleStar(file.id)"
              @share="openShareModal(file)"
              @delete="deleteFile(file.id)"
              @move="(targetId) => moveFile(file.id, targetId)"
              @duplicate="duplicateFile(file.id)"
              @preview="openPreviewModal(file)"
            />

            <!-- 链接卡片 -->
            <LinkCard
              v-for="link in currentLinks"
              :key="link.id"
              :link="link"
              :is-selected="selectedItems.has(link.id)"
              @select="selectItem(link.id)"
              @toggle-star="toggleLinkStar(link.id)"
              @delete="deleteLink(link.id)"
              @move="(targetId) => moveLink(link.id, targetId)"
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
              @select="selectItem(folder.id)"
              @open="navigateToFolder(folder.id)"
              @rename="(name) => renameFolder(folder.id, name)"
              @delete="deleteFolder(folder.id)"
            />
            <!-- 文件列表项 -->
            <FileListItem
              v-for="file in currentFiles"
              :key="file.id"
              :file="file"
              :is-selected="selectedItems.has(file.id)"
              @select="selectItem(file.id)"
              @toggle-star="toggleStar(file.id)"
              @share="openShareModal(file)"
              @delete="deleteFile(file.id)"
              @preview="openPreviewModal(file)"
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
              @click="openUploadModal(currentFolderId)"
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
      <div v-if="uploadState.step !== 'select'" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeUploadModal">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
          <div class="px-6 py-4 border-b border-slate-200">
            <h3 class="text-lg font-semibold text-slate-900">上传文件</h3>
            <p class="text-sm text-slate-500 mt-1">支持上传 PDF、Word、PPT、视频、图片等文件格式</p>
          </div>

          <div class="p-6">
            <!-- 上传中阶段 -->
            <div v-if="uploadState.step === 'uploading'" class="flex flex-col items-center justify-center py-8">
              <RefreshCw :size="48" class="text-indigo-600 animate-spin mb-4" />
              <p class="text-slate-700 font-medium mb-2">正在上传...</p>
              <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full bg-indigo-600 transition-all" :style="{ width: `${uploadState.progress}%` }"></div>
              </div>
              <p class="text-sm text-slate-500 mt-2">{{ uploadState.progress }}%</p>
            </div>

            <!-- 上传成功阶段 -->
            <div v-if="uploadState.step === 'success'" class="flex flex-col items-center justify-center py-8">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 :size="32" class="text-green-600" />
              </div>
              <p class="text-slate-700 font-medium mb-2">上传成功！</p>
              <p class="text-sm text-slate-500">
                已成功上传 {{ uploadState.files.length }} 个文件
              </p>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              v-if="uploadState.step === 'success'"
              @click="closeUploadModal"
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
      <div v-if="showNewFolderModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showNewFolderModal = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
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
              @click="createNewFolder"
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
      <div v-if="showShareModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showShareModal = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
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
      <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showDeleteConfirm = false">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md">
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
              @click="confirmDeleteFile"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 文件预览对话框 -->
    <FilePreviewModal
      :show="showPreviewModal"
      :file="previewFile || ({} as any)"
      @close="showPreviewModal = false"
    />

    <!-- 添加链接对话框 -->
    <AddLinkModal
      :show="showAddLinkModal"
      :folder-id="currentFolderId"
      :folder-name="currentFolderName"
      @close="showAddLinkModal = false"
      @success="loadLinks"
    />

    <!-- 键盘快捷键帮助 -->
    <KeyboardShortcutsHelp
      :show="showShortcutsHelp"
      @close="showShortcutsHelp = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useKnowledgeBase } from '../composables/useKnowledgeBase'
import { useKnowledgeShortcuts } from '../composables/useKeyboardShortcuts'
import { useResponsive, useMobileNavigation } from '../composables/useResponsive'
import { MOCK_FOLDERS, MOCK_FILES, MOCK_LINKS } from '../mock/knowledgeData'

// 组件导入
import FolderTreeItem from '../components/knowledge/FolderTreeItem.vue'
import FolderCard from '../components/knowledge/FolderCard.vue'
import FolderListItem from '../components/knowledge/FolderListItem.vue'
import FileCard from '../components/knowledge/FileCard.vue'
import FileListItem from '../components/knowledge/FileListItem.vue'
import FilePreviewModal from '../components/knowledge/FilePreviewModal.vue'
import KeyboardShortcutsHelp from '../components/knowledge/KeyboardShortcutsHelp.vue'
import LinkCard from '../components/knowledge/LinkCard.vue'
import AddLinkModal from '../components/knowledge/AddLinkModal.vue'

// 图标导入
import {
  Search, FileText, Video, Image as ImageIcon, Book, Tag, Folder, FolderOpen,
  Download, Eye, Clock, Grid, List as ListIcon, Plus, Upload, Edit, Trash2,
  Star, Share2, MoreVertical, X, ChevronRight, Home, RefreshCw, Filter,
  History, Lock, Unlock, Copy, Move, Users, File, Archive, Settings,
  CheckCircle2, Keyboard, Menu, Link2
} from 'lucide-vue-next'

// 主题
const { currentTheme } = useTheme()
const isBlackGold = computed(() => currentTheme.value === 'black-gold')

// 使用知识库 composable
const kb = useKnowledgeBase()

// 初始化链接数据
kb.links = MOCK_LINKS

// 侧边栏标签
const sidebarTabs = [
  { id: 'folders' as const, label: '文件夹', icon: Folder },
  { id: 'tags' as const, label: '标签', icon: Tag },
  { id: 'starred' as const, label: '收藏', icon: Star },
  { id: 'recent' as const, label: '最近', icon: History }
]

// 初始化数据（使用 Mock）
kb.folders = MOCK_FOLDERS
kb.files = MOCK_FILES
kb.links = MOCK_LINKS

// 生命周期
onMounted(() => {
  kb.initialize()
})

// 为了兼容模板，解构所有需要的属性
const {
  currentFolderId,
  files,
  links,
  folders,
  viewMode,
  searchQuery,
  sortBy,
  selectedItems,
  activeTab,
  sidebarTab,
  showNewFolderModal,
  showShareModal,
  showMoveModal,
  showDeleteConfirm,
  showAddLinkModal,
  selectedFile,
  selectedLink,
  newFolderName,
  newFolderColor,
  folderColors,
  uploadState,
  currentFolderName,
  currentPath,
  subFolders,
  currentFolderFiles,
  currentFiles,
  allTags,
  starredFiles,
  recentFiles,
  rootFolders,
  openUploadModal,
  closeUploadModal,
  selectItem,
  toggleSelectAll,
  navigateToFolder,
  openShareModal,
  deleteFile,
  confirmDeleteFile,
  moveFile,
  duplicateFile,
  toggleStar,
  renameFolder,
  deleteFolder,
  createNewFolder,
  getFileIcon,
  loadLinks,
  createLink,
  deleteLink,
  toggleLinkStar,
  moveLink
} = kb

// 文件预览状态
const showPreviewModal = ref(false)
const previewFile = ref<any>(null)

// 当前文件夹的链接（计算属性）
const currentLinks = computed(() => {
  if (!links) return []
  return links.filter(l => l.folderId === currentFolderId.value)
})

// 快捷键帮助
const showShortcutsHelp = ref(false)

// 移动端响应式
const { isMobile, isSmallScreen } = useResponsive()
const mobileNav = useMobileNavigation()

// 打开预览模态框
const openPreviewModal = (file: any) => {
  previewFile.value = file
  showPreviewModal.value = true
}

// 键盘快捷键
const searchInputRef = ref<HTMLInputElement | null>(null)

// 获取父文件夹ID
const getParentFolderId = () => {
  const currentFolder = folders.value.find(f => f.id === currentFolderId.value)
  return currentFolder?.parentId || 'root'
}

// 使用键盘快捷键
useKnowledgeShortcuts({
  onNewFolder: () => {
    showNewFolderModal.value = true
  },
  onUpload: () => {
    openUploadModal(currentFolderId.value)
  },
  onSearch: () => {
    searchInputRef.value?.focus()
  },
  onSelectAll: () => {
    toggleSelectAll()
  },
  onDelete: () => {
    if (selectedItems.value.size > 0) {
      // 如果选中了文件，显示删除确认
      const firstFileId = Array.from(selectedItems.value)[0]
      const file = files.value.find(f => f.id === firstFileId)
      if (file) {
        deleteFile(firstFileId)
      }
    }
  },
  onCloseModal: () => {
    // 关闭所有模态框
    showNewFolderModal.value = false
    showShareModal.value = false
    showMoveModal.value = false
    showDeleteConfirm.value = false
    showPreviewModal.value = false
  },
  onRefresh: () => {
    // 刷新当前文件夹
    navigateToFolder(currentFolderId.value)
  },
  onToggleView: () => {
    viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
  },
  onNavigateUp: () => {
    if (currentFolderId.value !== 'root') {
      navigateToFolder(getParentFolderId())
    }
  },
  onHelp: () => {
    showShortcutsHelp.value = true
  }
})

// 辅助函数
const getFileTypeIcon = (type: string, size: number = 24) => {
  switch (type) {
    case 'pdf': return FileText
    case 'doc': return FileText
    case 'video': return Video
    case 'image': return ImageIcon
    case 'text': return FileText
    default: return File
  }
}
</script>
