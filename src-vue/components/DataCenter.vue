<template>
  <div class="h-[calc(100vh-140px)] flex gap-6">
    <!-- Left: Folders & Files List -->
    <div class="w-96 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
      <div class="p-4 border-b border-slate-100">
        <h3 class="font-bold text-slate-800 flex items-center gap-2 mb-3">
          <Folder :size="18" class="text-indigo-600" />
          数据中心
        </h3>

        <!-- Folder Tabs -->
        <div class="flex gap-2 mb-3">
          <button
            v-for="folder in folders"
            :key="folder.id"
            @click="activeFolder = folder.id"
            :class="`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeFolder === folder.id
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100'
            }`"
          >
            {{ folder.label }}
            <span class="ml-1 px-1.5 py-0.5 rounded-full text-[10px]"
              :class="activeFolder === folder.id ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-600'">
              {{ folder.count }}
            </span>
          </button>
        </div>

        <button
          @click="openUploadModal"
          class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <UploadCloud :size="16" />
          上传文件
        </button>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div
          v-for="file in filteredFiles"
          :key="file.id"
          @click="selectedFile = file.id"
          :class="`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${
            selectedFile === file.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
          }`"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="getFileIconBg(file.category)"
            >
              <component :is="getFileIcon(file.category)" :size="18" :class="getFileIconColor(file.category)" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-slate-800 text-sm truncate">{{ file.fileName }}</p>
              <div class="flex items-center gap-3 mt-1">
                <span class="text-[10px] text-slate-400">{{ file.date }}</span>
                <span class="text-[10px] text-slate-400">{{ file.size }}</span>
              </div>
              <div class="flex items-center gap-2 mt-2">
                <span class="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded border border-slate-200">
                  {{ getCategoryLabel(file.category) }}
                </span>
              </div>
            </div>
            <button
              @click.stop="deleteFile(file.id)"
              class="p-1 text-slate-400 hover:text-red-600"
              title="删除"
            >
              <Trash2 :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Middle: File Preview -->
    <div class="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
      <div v-if="selectedFileData" class="flex-1 flex flex-col overflow-hidden">
        <!-- File Header -->
        <div class="p-4 border-b border-slate-200">
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-3">
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center"
                :class="getFileIconBg(selectedFileData.category)"
              >
                <component :is="getFileIcon(selectedFileData.category)" :size="24" :class="getFileIconColor(selectedFileData.category)" />
              </div>
              <div>
                <h3 class="font-bold text-slate-800">{{ selectedFileData.fileName }}</h3>
                <p class="text-xs text-slate-500 mt-1">
                  {{ selectedFileData.date }} · {{ selectedFileData.size }} · {{ getCategoryLabel(selectedFileData.category) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="downloadFile(selectedFileData)"
                class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="下载"
              >
                <Download :size="18" />
              </button>
              <button
                @click="shareFile(selectedFileData)"
                class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="分享"
              >
                <Share2 :size="18" />
              </button>
            </div>
          </div>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Audio Link Preview -->
          <div v-if="selectedFileData.category === 'audio'">
            <div class="bg-slate-50 rounded-lg p-6 text-center">
              <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic :size="32" class="text-indigo-600" />
              </div>
              <h4 class="font-semibold text-slate-800 mb-2">{{ selectedFileData.fileName }}</h4>
              <p class="text-sm text-slate-600 mb-4">{{ selectedFileData.description || '暂无描述' }}</p>
              <a
                v-if="selectedFileData.audioUrl"
                :href="selectedFileData.audioUrl"
                target="_blank"
                class="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
              >
                <Play :size="16" />
                播放录音
              </a>
              <div v-else class="text-sm text-slate-500">
                <p>暂无音频链接</p>
                <button
                  @click="editAudioLink"
                  class="mt-3 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
                >
                  添加链接
                </button>
              </div>
            </div>

            <!-- Audio Link Edit Form -->
            <div v-if="showAudioForm" class="mt-4 p-4 bg-white border border-slate-200 rounded-lg">
              <h5 class="font-semibold text-slate-800 mb-3">添加音频链接</h5>
              <div class="space-y-3">
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">音频链接</label>
                  <input
                    v-model="audioForm.url"
                    type="url"
                    placeholder="https://example.com/audio.mp3"
                    class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-700 mb-1">描述</label>
                  <input
                    v-model="audioForm.description"
                    type="text"
                    placeholder="录音描述"
                    class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                </div>
                <div class="flex gap-2">
                  <button
                    @click="saveAudioLink"
                    class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                  >
                    保存
                  </button>
                  <button
                    @click="showAudioForm = false"
                    class="px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Health Report Preview -->
          <div v-else-if="selectedFileData.category === 'health-report'">
            <div class="space-y-4">
              <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FileCheck :size="24" class="text-green-600" />
                  </div>
                  <div>
                    <h4 class="font-semibold text-green-900">体检报告</h4>
                    <p class="text-sm text-green-700">{{ selectedFileData.description || '客户体检报告文件' }}</p>
                  </div>
                </div>

                <!-- Health Metrics Summary -->
                <div class="bg-white rounded-lg p-4 border border-green-200">
                  <h5 class="font-medium text-slate-800 mb-3">健康指标摘要</h5>
                  <div class="grid grid-cols-2 gap-3">
                    <div class="p-3 bg-slate-50 rounded">
                      <p class="text-xs text-slate-500 uppercase">检查日期</p>
                      <p class="text-sm font-medium text-slate-800">{{ selectedFileData.date || '-' }}</p>
                    </div>
                    <div class="p-3 bg-slate-50 rounded">
                      <p class="text-xs text-slate-500 uppercase">文件大小</p>
                      <p class="text-sm font-medium text-slate-800">{{ selectedFileData.size }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Preview/Download -->
              <div class="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h5 class="font-medium text-blue-900 mb-1">报告预览</h5>
                    <p class="text-sm text-blue-700">点击下方按钮查看或下载完整报告</p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="previewFile(selectedFileData)"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Eye :size="16" />
                      预览
                    </button>
                    <button
                      @click="downloadFile(selectedFileData)"
                      class="px-4 py-2 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 flex items-center gap-2"
                    >
                      <Download :size="16" />
                      下载
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Data Report Preview -->
          <div v-else-if="selectedFileData.category === 'data-report'">
            <div class="space-y-4">
              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 :size="24" class="text-blue-600" />
                  </div>
                  <div>
                    <h4 class="font-semibold text-blue-900">数据报表</h4>
                    <p class="text-sm text-blue-700">{{ selectedFileData.description || '客户数据统计报表' }}</p>
                  </div>
                </div>

                <div v-if="selectedFileData.summary" class="bg-white rounded-lg p-4 border border-blue-200 mt-4">
                  <h5 class="font-medium text-slate-800 mb-3">报表摘要</h5>
                  <p class="text-sm text-slate-600">{{ selectedFileData.summary }}</p>
                </div>
              </div>

              <div class="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <h5 class="font-medium text-slate-800 mb-3">报表数据</h5>
                <div class="space-y-2">
                  <div class="flex justify-between p-3 bg-white rounded border border-slate-200">
                    <span class="text-sm text-slate-600">生成日期</span>
                    <span class="text-sm font-medium text-slate-800">{{ selectedFileData.date }}</span>
                  </div>
                  <div class="flex justify-between p-3 bg-white rounded border border-slate-200">
                    <span class="text-sm text-slate-600">文件大小</span>
                    <span class="text-sm font-medium text-slate-800">{{ selectedFileData.size }}</span>
                  </div>
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  @click="downloadFile(selectedFileData)"
                  class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <Download :size="16" />
                  下载报表
                </button>
                <button
                  @click="shareFile(selectedFileData)"
                  class="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  <Share2 :size="16" />
                  分享
                </button>
              </div>
            </div>
          </div>

          <!-- Prescription Report Preview -->
          <div v-else-if="selectedFileData.category === 'prescription'">
            <div class="space-y-4">
              <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText :size="24" class="text-purple-600" />
                  </div>
                  <div>
                    <h4 class="font-semibold text-purple-900">处方报告</h4>
                    <p class="text-sm text-purple-700">{{ selectedFileData.description || '医生处方报告文件' }}</p>
                  </div>
                </div>

                <!-- Prescription Details -->
                <div v-if="selectedFileData.prescriptionDetails" class="bg-white rounded-lg p-4 border border-purple-200">
                  <h5 class="font-medium text-slate-800 mb-3">处方详情</h5>
                  <div class="space-y-3">
                    <div class="flex justify-between">
                      <span class="text-sm text-slate-600">开具医生</span>
                      <span class="text-sm font-medium text-slate-800">{{ selectedFileData.prescriptionDetails.doctor || '-' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm text-slate-600">开具日期</span>
                      <span class="text-sm font-medium text-slate-800">{{ selectedFileData.prescriptionDetails.date || selectedFileData.date }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-sm text-slate-600">处方类型</span>
                      <span class="text-sm font-medium text-slate-800">{{ selectedFileData.prescriptionDetails.type || '-' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <div class="flex items-center justify-between">
                  <div>
                    <h5 class="font-medium text-purple-900 mb-1">报告查看</h5>
                    <p class="text-sm text-purple-700">查看完整的处方报告内容</p>
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="previewFile(selectedFileData)"
                      class="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2"
                    >
                      <Eye :size="16" />
                      预览
                    </button>
                    <button
                      @click="downloadFile(selectedFileData)"
                      class="px-4 py-2 border border-purple-200 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-50 flex items-center gap-2"
                    >
                      <Download :size="16" />
                      下载
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Other Files Preview -->
          <div v-else>
            <div class="space-y-4">
              <div class="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-6 border border-slate-200">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                    <FileText :size="24" class="text-slate-600" />
                  </div>
                  <div>
                    <h4 class="font-semibold text-slate-900">{{ getCategoryLabel(selectedFileData.category) }}</h4>
                    <p class="text-sm text-slate-600">{{ selectedFileData.description || '其他资料文件' }}</p>
                  </div>
                </div>
              </div>

              <div class="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <h5 class="font-medium text-slate-800 mb-3">文件信息</h5>
                <div class="space-y-2">
                  <div class="flex justify-between p-3 bg-white rounded border border-slate-200">
                    <span class="text-sm text-slate-600">上传日期</span>
                    <span class="text-sm font-medium text-slate-800">{{ selectedFileData.date }}</span>
                  </div>
                  <div class="flex justify-between p-3 bg-white rounded border border-slate-200">
                    <span class="text-sm text-slate-600">文件大小</span>
                    <span class="text-sm font-medium text-slate-800">{{ selectedFileData.size }}</span>
                  </div>
                  <div class="flex justify-between p-3 bg-white rounded border border-slate-200">
                    <span class="text-sm text-slate-600">文件类型</span>
                    <span class="text-sm font-medium text-slate-800">{{ getFileExtension(selectedFileData.fileName) }}</span>
                  </div>
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  @click="downloadFile(selectedFileData)"
                  class="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700 flex items-center justify-center gap-2"
                >
                  <Download :size="16" />
                  下载文件
                </button>
                <button
                  @click="shareFile(selectedFileData)"
                  class="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  <Share2 :size="16" />
                  分享
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex-1 flex items-center justify-center text-slate-400">
        <div class="text-center">
          <FolderOpen :size="32" class="mx-auto mb-2" />
          <p>选择一个文件<br>查看详情</p>
        </div>
      </div>
    </div>

    <!-- Right: Actions -->
    <div class="w-64 bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex flex-col gap-3">
      <h4 class="font-semibold text-slate-800 text-sm">快捷操作</h4>

      <button
        v-if="selectedFileData"
        @click="downloadFile(selectedFileData)"
        class="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        <Download :size="16" />
        下载文件
      </button>

      <button
        v-if="selectedFileData"
        @click="shareFile(selectedFileData)"
        class="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
      >
        <Share2 :size="16" />
        分享
      </button>

      <div class="border-t border-slate-200 my-2"></div>

      <h4 class="font-semibold text-slate-800 text-sm">存储统计</h4>
      <div class="space-y-2 text-xs text-slate-600">
        <div class="flex justify-between">
          <span>已用存储</span>
          <span class="font-medium">{{ usedStorage }}</span>
        </div>
        <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div class="h-full bg-indigo-500" :style="{ width: storagePercent + '%' }"></div>
        </div>
        <div class="flex justify-between">
          <span>总存储</span>
          <span class="font-medium">2 GB</span>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <Teleport to="body">
      <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
        <div v-if="showUploadModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeUploadModal">
          <div class="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
            <!-- Header -->
            <div class="p-6 border-b border-slate-200">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-bold text-slate-800">上传文件</h3>
                  <p class="text-sm text-slate-500 mt-1">支持体检报告、数据报表等多种格式</p>
                </div>
                <button @click="closeUploadModal" class="p-1 hover:bg-slate-100 rounded">
                  <X :size="20" class="text-slate-500" />
                </button>
              </div>
            </div>

            <!-- Category Tabs -->
            <div class="px-6 pt-4 border-b border-slate-200">
              <div class="flex gap-2">
                <button
                  v-for="cat in uploadCategories"
                  :key="cat.id"
                  @click="uploadCategory = cat.id"
                  :class="`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                    uploadCategory === cat.id
                      ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`"
                >
                  <component :is="cat.icon" :size="16" />
                  {{ cat.label }}
                </button>
              </div>
            </div>

            <!-- Upload Area -->
            <div class="flex-1 overflow-y-auto p-6">
              <div
                @click="triggerFileInput"
                @dragover.prevent="handleDragOver"
                @dragleave.prevent="handleDragLeave"
                @drop.prevent="handleDrop"
                :class="`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                  isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'
                }`"
              >
                <UploadCloud :size="48" :class="isDragging ? 'text-indigo-600' : 'text-slate-400'" class="mx-auto mb-3" />
                <p class="text-sm font-medium text-slate-700">{{ getCategoryUploadLabel() }}</p>
                <p class="text-xs text-slate-500 mt-2">{{ getCategoryAcceptInfo() }}</p>
              </div>

              <!-- Description Input -->
              <div class="mt-4">
                <label class="block text-sm font-medium text-slate-700 mb-2">文件描述（可选）</label>
                <input
                  v-model="fileDescription"
                  type="text"
                  placeholder="请输入文件描述..."
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
              </div>

              <!-- Audio Link Input (for audio category) -->
              <div v-if="uploadCategory === 'audio'" class="mt-4">
                <label class="block text-sm font-medium text-slate-700 mb-2">音频链接（可选）</label>
                <input
                  v-model="audioUrl"
                  type="url"
                  placeholder="https://example.com/audio.mp3"
                  class="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
              </div>

              <!-- File List -->
              <div v-if="pendingUploadFiles.length > 0" class="mt-4 space-y-2">
                <h5 class="text-sm font-medium text-slate-700">待上传文件（{{ pendingUploadFiles.length }}）</h5>
                <div v-for="(file, idx) in pendingUploadFiles" :key="idx" class="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <component :is="getFileIcon(uploadCategory)" :size="18" :class="getFileIconColor(uploadCategory)" />
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-slate-800 truncate">{{ file.name }}</p>
                    <p class="text-xs text-slate-500">{{ formatFileSize(file.size) }}</p>
                  </div>
                  <button @click="removeUploadFile(idx)" class="p-1 text-slate-400 hover:text-red-600">
                    <X :size="16" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <button @click="closeUploadModal" class="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium">
                取消
              </button>
              <button
                @click="uploadFiles"
                :disabled="pendingUploadFiles.length === 0 || isUploading"
                class="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Loader2 v-if="isUploading" :size="16" class="animate-spin" />
                {{ isUploading ? '上传中...' : '开始上传' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Hidden File Input -->
    <input
      ref="fileInputRef"
      type="file"
      @change="handleFileSelect"
      class="hidden"
      :accept="getAcceptedTypes()"
      multiple
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, markRaw } from 'vue'
import {
  Folder,
  UploadCloud,
  Mic,
  FileText,
  Download,
  Share2,
  X,
  Play,
  FileCheck,
  Eye,
  BarChart3,
  Trash2,
  FolderOpen,
  Loader2
} from 'lucide-vue-next'
import { useToast } from '../composables/useToast'

const toast = useToast()

// Types
interface ClientFile {
  id: string
  fileName: string
  category: 'health-report' | 'data-report' | 'other' | 'audio' | 'prescription'
  date: string
  size: string
  description?: string
  audioUrl?: string
  summary?: string
  prescriptionDetails?: {
    doctor?: string
    date?: string
    type?: string
  }
}

// State
const activeFolder = ref('all')
const selectedFile = ref<string | null>(null)
const showUploadModal = ref(false)
const uploadCategory = ref<'health-report' | 'data-report' | 'other' | 'audio' | 'prescription'>('health-report')
const pendingUploadFiles = ref<File[]>([])
const isDragging = ref(false)
const isUploading = ref(false)
const fileDescription = ref('')
const audioUrl = ref('')
const fileInputRef = ref<HTMLInputElement>()

// Upload categories
const uploadCategories = [
  { id: 'health-report', label: '体检报告', icon: markRaw(FileCheck) },
  { id: 'data-report', label: '数据报表', icon: markRaw(BarChart3) },
  { id: 'other', label: '其他资料', icon: markRaw(FileText) },
  { id: 'audio', label: '音频链接', icon: markRaw(Mic) },
  { id: 'prescription', label: '处方报告', icon: markRaw(FileText) }
]

// Folders
const folders = computed(() => [
  { id: 'all', label: '全部', count: files.value.length },
  { id: 'health-report', label: '体检报告', count: files.value.filter(f => f.category === 'health-report').length },
  { id: 'data-report', label: '数据报表', count: files.value.filter(f => f.category === 'data-report').length },
  { id: 'prescription', label: '处方报告', count: files.value.filter(f => f.category === 'prescription').length },
  { id: 'other', label: '其他资料', count: files.value.filter(f => f === 'other' || f.category === 'audio').length },
  { id: 'audio', label: '音频链接', count: files.value.filter(f => f.category === 'audio').length }
])

// Files data
const files = ref<ClientFile[]>([
  {
    id: '1',
    fileName: '2023年度体检报告_王磊.pdf',
    category: 'health-report',
    date: '2023-10-20',
    size: '2.3 MB',
    description: '年度健康体检报告，包含血压、血糖、血脂等指标'
  },
  {
    id: '2',
    fileName: '健康数据周报_第42期.xlsx',
    category: 'data-report',
    date: '2023-10-25',
    size: '1.8 MB',
    description: '本周健康数据统计报表，包含运动、饮食、睡眠数据'
  },
  {
    id: '3',
    fileName: '首通电话录音_王磊.mp3',
    category: 'audio',
    date: '2023-10-20 14:30',
    size: '8.5 MB',
    description: '首次电话沟通录音',
    audioUrl: 'https://example.com/audio/first-call-wanglei.mp3'
  },
  {
    id: '4',
    fileName: '处方报告_王磊_20231020.pdf',
    category: 'prescription',
    date: '2023-10-20',
    size: '0.8 MB',
    description: '医生开具的处方报告',
    prescriptionDetails: {
      doctor: '陶医生',
      date: '2023-10-20',
      type: '生活方式处方'
    }
  },
  {
    id: '5',
    fileName: '身份证复印件.jpg',
    category: 'other',
    date: '2023-10-18',
    size: '1.2 MB',
    description: '客户身份证复印件'
  }
])

const filteredFiles = computed(() => {
  if (activeFolder.value === 'all') return files.value
  return files.value.filter(f => f.category === activeFolder.value)
})

const selectedFileData = computed(() => files.value.find(f => f.id === selectedFile.value))

// Storage stats
const usedStorage = computed(() => {
  const totalBytes = files.value.reduce((sum, f) => {
    const sizeMatch = f.size.match(/[\d.]+/)
    const unitMatch = f.size.match(/(MB|GB|KB)/i)
    if (sizeMatch && unitMatch) {
      const size = parseFloat(sizeMatch[0])
      const unit = unitMatch[1].toUpperCase()
      if (unit === 'GB') return sum + size * 1024
      if (unit === 'MB') return sum + size
      if (unit === 'KB') return sum + size / 1024
    }
    return sum
  }, 0)
  return `${totalBytes.toFixed(1)} MB`
})

const storagePercent = computed(() => {
  const totalBytes = files.value.reduce((sum, f) => {
    const sizeMatch = f.size.match(/[\d.]+/)
    const unitMatch = f.size.match(/(MB|GB|KB)/i)
    if (sizeMatch && unitMatch) {
      const size = parseFloat(sizeMatch[0])
      const unit = unitMatch[1].toUpperCase()
      if (unit === 'GB') return sum + size * 1024
      if (unit === 'MB') return sum + size
      if (unit === 'KB') return sum + size / 1024
    }
    return sum
  }, 0)
  return Math.min((totalBytes / 2048) * 100, 100)
})

// Methods
const getFileIcon = (category: string) => {
  const icons = {
    'health-report': markRaw(FileCheck),
    'data-report': markRaw(BarChart3),
    'audio': markRaw(Mic),
    'prescription': markRaw(FileText),
    'other': markRaw(FileText)
  }
  return icons[category] || markRaw(FileText)
}

const getFileIconBg = (category: string) => {
  const bgs = {
    'health-report': 'bg-green-100',
    'data-report': 'bg-blue-100',
    'audio': 'bg-indigo-100',
    'prescription': 'bg-purple-100',
    'other': 'bg-slate-100'
  }
  return bgs[category] || 'bg-slate-100'
}

const getFileIconColor = (category: string) => {
  const colors = {
    'health-report': 'text-green-600',
    'data-report': 'text-blue-600',
    'audio': 'text-indigo-600',
    'prescription': 'text-purple-600',
    'other': 'text-slate-600'
  }
  return colors[category] || 'text-slate-600'
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    'health-report': '体检报告',
    'data-report': '数据报表',
    'audio': '音频链接',
    'prescription': '处方报告',
    'other': '其他资料'
  }
  return labels[category] || category
}

const getFileExtension = (fileName: string) => {
  const ext = fileName.split('.').pop()?.toUpperCase()
  return ext || '未知'
}

const getCategoryUploadLabel = () => {
  const labels: Record<string, string> = {
    'health-report': '点击或拖拽体检报告文件到此处',
    'data-report': '点击或拖拽数据报表文件到此处',
    'audio': '点击或拖拽音频文件到此处',
    'prescription': '点击或拖拽处方报告文件到此处',
    'other': '点击或拖拽其他资料文件到此处'
  }
  return labels[uploadCategory.value]
}

const getCategoryAcceptInfo = () => {
  const infos: Record<string, string> = {
    'health-report': '支持 PDF, JPG, PNG 格式，最大 50MB',
    'data-report': '支持 XLSX, XLS, PDF 格式，最大 20MB',
    'audio': '支持 MP3, WAV, M4A 格式，或添加音频链接',
    'prescription': '支持 PDF, DOC, DOCX 格式，最大 10MB',
    'other': '支持 PDF, DOC, JPG, PNG 等格式，最大 30MB'
  }
  return infos[uploadCategory.value]
}

const getAcceptedTypes = () => {
  const types: Record<string, string> = {
    'health-report': '.pdf,application/pdf,image/*',
    'data-report': '.xlsx,.xls,.pdf,application/*',
    'audio': 'audio/mp3,audio/wav,audio/m4a,audio/*',
    'prescription': '.pdf,.doc,.docx,application/msword,application/*',
    'other': '.pdf,.doc,.docx,.jpg,.jpeg,.png,image/*,application/*'
  }
  return types[uploadCategory.value]
}

// Upload methods
const openUploadModal = () => {
  showUploadModal.value = true
  uploadCategory.value = 'health-report'
  pendingUploadFiles.value = []
  fileDescription.value = ''
  audioUrl.value = ''
}

const closeUploadModal = () => {
  showUploadModal.value = false
  pendingUploadFiles.value = []
  fileDescription.value = ''
  audioUrl.value = ''
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  if (e.dataTransfer.files) {
    addFiles(Array.from(e.dataTransfer.files))
  }
}

const addFiles = (newFiles: File[]) => {
  const maxSize = uploadCategory.value === 'health-report' ? 50 * 1024 * 1024 :
                   uploadCategory.value === 'data-report' ? 20 * 1024 * 1024 :
                   uploadCategory.value === 'audio' ? 100 * 1024 * 1024 :
                   uploadCategory.value === 'prescription' ? 10 * 1024 * 1024 :
                   30 * 1024 * 1024 // 30MB for other

  const validFiles = newFiles.filter(file => file.size <= maxSize)

  if (validFiles.length !== newFiles.length) {
    toast.warning('文件过大', '部分文件超过大小限制，已自动过滤')
  }

  pendingUploadFiles.value = [...pendingUploadFiles.value, ...validFiles]
}

const removeUploadFile = (index: number) => {
  pendingUploadFiles.value.splice(index, 1)
}

const uploadFiles = async () => {
  if (pendingUploadFiles.value.length === 0) return

  isUploading.value = true

  try {
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Add new files to the list
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '-')
    const timeStr = now.toTimeString().slice(0, 5)

    pendingUploadFiles.value.forEach((file, idx) => {
      const newFile: ClientFile = {
        id: `${Date.now()}-${idx}`,
        fileName: file.name,
        category: uploadCategory.value,
        date: `${dateStr} ${timeStr}`,
        size: formatFileSize(file.size),
        description: fileDescription.value || undefined
      }

      // Add audio URL if provided
      if (uploadCategory.value === 'audio' && audioUrl.value) {
        newFile.audioUrl = audioUrl.value
      }

      files.value.unshift(newFile)
    })

    toast.success('上传成功', `已成功上传 ${pendingUploadFiles.value.length} 个文件`)
    closeUploadModal()
  } catch (error) {
    toast.error('上传失败', '文件上传过程中出现错误')
  } finally {
    isUploading.value = false
  }
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} MB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} GB`
}

const deleteFile = (id: string) => {
  const index = files.value.findIndex(f => f.id === id)
  if (index !== -1) {
    files.value.splice(index, 1)
    if (selectedFile.value === id) {
      selectedFile.value = null
    }
    toast.success('删除成功', '文件已删除')
  }
}

const downloadFile = (file: ClientFile) => {
  toast.info('下载中', `正在下载 ${file.fileName}`)
  // Implement actual download logic
}

const shareFile = (file: ClientFile) => {
  navigator.clipboard.writeText(window.location.href + '#' + file.id)
  toast.success('链接已复制', '文件链接已复制到剪贴板')
}

const previewFile = (file: ClientFile) => {
  toast.info('预览', `正在预览 ${file.fileName}`)
  // Implement file preview logic
}

const editAudioLink = () => {
  showAudioForm.value = true
}

const saveAudioLink = () => {
  if (selectedFileData.value) {
    selectedFileData.value.audioUrl = audioUrl.value
    selectedFileData.value.description = fileDescription.value
    toast.success('保存成功', '音频链接已更新')
  }
  showAudioForm.value = false
}

// Audio form state
const showAudioForm = ref(false)
const audioForm = ref({
  url: '',
  description: ''
})
</script>
