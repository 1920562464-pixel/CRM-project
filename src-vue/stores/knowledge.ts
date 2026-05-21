/**
 * 知识库 Pinia Store
 * 全局状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  ViewMode,
  SortBy,
  ActiveTab,
  SidebarTab,
  KnowledgeFile,
  FolderNode,
  FileType
} from '../types/knowledge'
import { knowledgeApi } from '../api/knowledge'

export const useKnowledgeStore = defineStore('knowledge', () => {
  // ===== 状态 =====
  const folders = ref<FolderNode[]>([])
  const files = ref<KnowledgeFile[]>([])

  // UI 状态
  const currentFolderId = ref<string>('root')
  const viewMode = ref<ViewMode>('grid')
  const searchQuery = ref('')
  const sortBy = ref<SortBy>('name')
  const selectedItems = ref<Set<string>>(new Set())
  const activeTab = ref<ActiveTab>('all')
  const sidebarTab = ref<SidebarTab>('folders')

  // 对话框状态
  const showNewFolderModal = ref(false)
  const showShareModal = ref(false)
  const showMoveModal = ref(false)
  const showDeleteConfirm = ref(false)
  const selectedFile = ref<KnowledgeFile | null>(null)

  // 新建文件夹表单
  const newFolderName = ref('')
  const newFolderColor = ref('#3b82f6')

  // 上传状态
  const uploadState = ref({
    files: [] as File[],
    progress: 0,
    step: 'select' as 'select' | 'uploading' | 'success',
    folderId: null as string | null
  })

  // 加载状态
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ===== 计算属性 =====

  /**
   * 当前文件夹名称
   */
  const currentFolderName = computed(() => {
    const folder = folders.value.find(f => f.id === currentFolderId.value)
    return folder?.name || '根目录'
  })

  /**
   * 当前路径
   */
  const currentPath = computed(() => {
    const path: FolderNode[] = []
    let current = folders.value.find(f => f.id === currentFolderId.value)
    while (current) {
      path.unshift(current)
      current = folders.value.find(f => f.id === current.parentId)
    }
    return path
  })

  /**
   * 当前文件夹的子文件夹
   */
  const subFolders = computed(() => {
    return folders.value.filter(f => f.parentId === currentFolderId.value)
  })

  /**
   * 当前文件夹的文件（用于计数）
   */
  const currentFolderFiles = computed(() => {
    return files.value.filter(f => f.folderId === currentFolderId.value)
  })

  /**
   * 当前显示的文件（经过筛选和排序）
   */
  const currentFiles = computed(() => {
    let filteredFiles = files.value.filter(f => {
      // 按 activeTab 筛选
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

  /**
   * 所有标签统计
   */
  const allTags = computed(() => {
    const tags = new Map<string, number>()
    files.value.forEach(f => {
      f.tags.forEach(tag => {
        tags.set(tag, (tags.get(tag) || 0) + 1)
      })
    })
    return Array.from(tags.entries()).sort((a, b) => b[1] - a[1])
  })

  /**
   * 收藏的文件
   */
  const starredFiles = computed(() => files.value.filter(f => f.isStarred))

  /**
   * 最近访问的文件
   */
  const recentFiles = computed(() => {
    return [...files.value]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
  })

  /**
   * 根文件夹（用于侧边栏）
   */
  const rootFolders = computed(() => folders.value.filter(f => f.parentId === 'root'))

  /**
   * 存储空间使用情况
   */
  const storageUsed = computed(() => {
    const totalSize = files.value.reduce((sum, f) => {
      const size = parseFloat(f.size || '0')
      return sum + size
    }, 0)
    return {
      used: totalSize,
      total: 10240, // 10 GB
      percentage: (totalSize / 10240) * 100
    }
  })

  // ===== Actions =====

  /**
   * 初始化知识库数据
   */
  const initialize = async () => {
    try {
      loading.value = true
      error.value = null

      // 并行加载文件夹和文件
      const [foldersRes, filesRes] = await Promise.all([
        knowledgeApi.getFolders(),
        knowledgeApi.getFiles({ folderId: 'root' })
      ])

      folders.value = foldersRes.data
      files.value = filesRes.data.list
    } catch (err: any) {
      error.value = err.message || '初始化知识库失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载文件夹列表
   */
  const loadFolders = async () => {
    try {
      loading.value = true
      const response = await knowledgeApi.getFolders()
      folders.value = response.data
    } catch (err: any) {
      error.value = err.message || '加载文件夹失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载文件列表
   */
  const loadFiles = async () => {
    try {
      loading.value = true
      const response = await knowledgeApi.getFiles({
        folderId: currentFolderId.value,
        tab: activeTab.value,
        sortBy: sortBy.value
      })
      files.value = response.data.list
    } catch (err: any) {
      error.value = err.message || '加载文件失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建文件夹
   */
  const createFolder = async (name: string, parentId: string | null, color?: string) => {
    try {
      loading.value = true
      const response = await knowledgeApi.createFolder({ name, parentId, color })
      folders.value.push(response.data)
      return response.data
    } catch (err: any) {
      error.value = err.message || '创建文件夹失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 重命名文件夹
   */
  const renameFolder = async (folderId: string, newName: string) => {
    try {
      loading.value = true
      await knowledgeApi.renameFolder(folderId, newName)

      // 更新本地状态
      folders.value = folders.value.map(f =>
        f.id === folderId ? { ...f, name: newName } : f
      )
    } catch (err: any) {
      error.value = err.message || '重命名文件夹失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除文件夹
   */
  const deleteFolder = async (folderId: string) => {
    try {
      loading.value = true

      // 递归查找所有子文件夹
      const folderIds = [folderId]
      const findChildren = (parentId: string) => {
        const children = folders.value.filter(f => f.parentId === parentId)
        children.forEach(c => {
          folderIds.push(c.id)
          findChildren(c.id)
        })
      }
      findChildren(folderId)

      await knowledgeApi.deleteFolder(folderId)

      // 删除文件夹内的文件
      files.value = files.value.filter(f => !folderIds.includes(f.folderId || ''))

      // 删除文件夹
      folders.value = folders.value.filter(f => !folderIds.includes(f.id))

      return folderIds
    } catch (err: any) {
      error.value = err.message || '删除文件夹失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 上传文件
   */
  const uploadFiles = async (files: File[], folderId: string | null) => {
    try {
      loading.value = true
      uploadState.value.step = 'uploading'

      const response = await knowledgeApi.uploadFiles(files, folderId, (progress) => {
        uploadState.value.progress = progress
      })

      // 添加到文件列表
      files.value.push(...response.data)

      uploadState.value.step = 'success'
      return response.data
    } catch (err: any) {
      error.value = err.message || '上传文件失败'
      uploadState.value.step = 'select'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 切换收藏
   */
  const toggleStar = async (fileId: string) => {
    try {
      await knowledgeApi.toggleStar(fileId)

      // 更新本地状态
      files.value = files.value.map(f =>
        f.id === fileId ? { ...f, isStarred: !f.isStarred } : f
      )
    } catch (err: any) {
      error.value = err.message || '切换收藏失败'
      throw err
    }
  }

  /**
   * 删除文件
   */
  const deleteFile = async (fileId: string) => {
    try {
      loading.value = true
      await knowledgeApi.deleteFile(fileId)

      // 从列表中移除
      files.value = files.value.filter(f => f.id !== fileId)
    } catch (err: any) {
      error.value = err.message || '删除文件失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 移动文件
   */
  const moveFile = async (fileId: string, targetFolderId: string) => {
    try {
      loading.value = true
      await knowledgeApi.moveFile(fileId, targetFolderId)

      // 更新本地状态
      files.value = files.value.map(f =>
        f.id === fileId ? { ...f, folderId: targetFolderId } : f
      )
    } catch (err: any) {
      error.value = err.message || '移动文件失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 搜索文件
   */
  const searchFiles = async (query: string) => {
    if (!query.trim()) {
      // 清空搜索时重新加载
      await loadFiles()
      return
    }

    try {
      loading.value = true
      const response = await knowledgeApi.searchFiles(query)
      files.value = response.data
    } catch (err: any) {
      error.value = err.message || '搜索文件失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 导航到文件夹
   */
  const navigateToFolder = (folderId: string) => {
    currentFolderId.value = folderId
    activeTab.value = 'all'
    selectedItems.value.clear()

    // 自动加载文件
    loadFiles()
  }

  /**
   * 选择/取消选择项目
   */
  const selectItem = (itemId: string) => {
    if (selectedItems.value.has(itemId)) {
      selectedItems.value.delete(itemId)
    } else {
      selectedItems.value.add(itemId)
    }
  }

  /**
   * 全选/取消全选
   */
  const toggleSelectAll = () => {
    const allItemIds = [
      ...subFolders.value.map(f => f.id),
      ...currentFolderFiles.value.map(f => f.id)
    ]

    if (selectedItems.value.size === allItemIds.length) {
      selectedItems.value.clear()
    } else {
      selectedItems.value = new Set(allItemIds)
    }
  }

  /**
   * 重置错误
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // 状态
    folders,
    files,
    currentFolderId,
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
    selectedFile,
    newFolderName,
    newFolderColor,
    uploadState,
    loading,
    error,

    // 计算属性
    currentFolderName,
    currentPath,
    subFolders,
    currentFolderFiles,
    currentFiles,
    allTags,
    starredFiles,
    recentFiles,
    rootFolders,
    storageUsed,

    // Actions
    initialize,
    loadFolders,
    loadFiles,
    createFolder,
    renameFolder,
    deleteFolder,
    uploadFiles,
    toggleStar,
    deleteFile,
    moveFile,
    searchFiles,
    navigateToFolder,
    selectItem,
    toggleSelectAll,
    clearError
  }
})
