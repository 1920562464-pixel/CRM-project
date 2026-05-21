/**
 * 知识库主 Composable
 * 整合所有知识库业务逻辑
 */

import { ref, computed, watch } from 'vue'
import type {
  ViewMode,
  SortBy,
  ActiveTab,
  SidebarTab,
  KnowledgeFile,
  KnowledgeLink,
  KnowledgeItem,
  FolderNode,
  FileType
} from '../types/knowledge'
import { knowledgeApi } from '../api/knowledge'
import { useFolderManagement } from './useFolderManagement'
import { useFileUpload } from './useFileUpload'
import { useSearchDebounce } from './useDebounce'

export function useKnowledgeBase() {
  // 使用子功能
  const folderManager = useFolderManagement()
  const fileUploader = useFileUpload()

  // ===== 状态 =====
  const currentFolderId = ref<string>('root')
  const files = ref<KnowledgeFile[]>([])
  const links = ref<KnowledgeLink[]>([])
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
  const showAddLinkModal = ref(false)
  const selectedFile = ref<KnowledgeFile | null>(null)
  const selectedLink = ref<KnowledgeLink | null>(null)

  // 新建文件夹表单
  const newFolderName = ref('')
  const newFolderColor = ref('#3b82f6')
  const folderColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

  // ===== 计算属性 =====

  /**
   * 当前文件夹的所有项目（文件+链接）
   */
  const currentItems = computed<KnowledgeItem[]>(() => {
    const folderFiles = files.value.filter(f => f.folderId === currentFolderId.value)
    const folderLinks = links.value.filter(l => l.folderId === currentFolderId.value)
    return [...folderFiles, ...folderLinks]
  })

  /**
   * 当前文件夹名称
   */
  const currentFolderName = computed(() => {
    const folder = folderManager.getFolderById(currentFolderId.value)
    return folder?.name || '根目录'
  })

  /**
   * 当前路径
   */
  const currentPath = computed(() => {
    return folderManager.getFolderPath(currentFolderId.value)
  })

  /**
   * 当前文件夹的子文件夹
   */
  const subFolders = computed(() => {
    return folderManager.getSubFolders(currentFolderId.value)
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
  const rootFolders = computed(() => folderManager.getRootFolders())

  // ===== 文件操作 =====

  /**
   * 加载文件列表
   */
  const loadFiles = async () => {
    try {
      const response = await knowledgeApi.getFiles({
        folderId: currentFolderId.value,
        tab: activeTab.value,
        sortBy: sortBy.value
      })
      files.value = response.data.list
    } catch (err: any) {
      console.error('加载文件失败:', err)
      throw err
    }
  }

  /**
   * 切换收藏状态
   */
  const toggleStar = async (fileId: string) => {
    try {
      await knowledgeApi.toggleStar(fileId)

      // 更新本地状态
      files.value = files.value.map(f =>
        f.id === fileId ? { ...f, isStarred: !f.isStarred } : f
      )
    } catch (err: any) {
      console.error('切换收藏失败:', err)
      throw err
    }
  }

  /**
   * 切换锁定状态
   */
  const toggleLock = async (fileId: string) => {
    try {
      await knowledgeApi.toggleLock(fileId)

      // 更新本地状态
      files.value = files.value.map(f =>
        f.id === fileId ? { ...f, isLocked: !f.isLocked } : f
      )
    } catch (err: any) {
      console.error('切换锁定失败:', err)
      throw err
    }
  }

  /**
   * 删除文件
   */
  const deleteFile = (fileId: string) => {
    selectedFile.value = files.value.find(f => f.id === fileId) || null
    showDeleteConfirm.value = true
  }

  /**
   * 确认删除
   */
  const confirmDeleteFile = async () => {
    if (!selectedFile.value) return

    try {
      await knowledgeApi.deleteFile(selectedFile.value.id)

      // 从列表中移除
      files.value = files.value.filter(f => f.id !== selectedFile.value!.id)

      selectedFile.value = null
      showDeleteConfirm.value = false
    } catch (err: any) {
      console.error('删除文件失败:', err)
      throw err
    }
  }

  /**
   * 移动文件
   */
  const moveFile = async (fileId: string, targetFolderId: string) => {
    try {
      await knowledgeApi.moveFile(fileId, targetFolderId)

      // 更新本地状态
      files.value = files.value.map(f =>
        f.id === fileId ? { ...f, folderId: targetFolderId } : f
      )
    } catch (err: any) {
      console.error('移动文件失败:', err)
      throw err
    }
  }

  /**
   * 复制文件
   */
  const duplicateFile = async (fileId: string) => {
    try {
      const response = await knowledgeApi.duplicateFile(fileId)

      // 添加到列表
      files.value.push(response.data)
    } catch (err: any) {
      console.error('复制文件失败:', err)
      throw err
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
      const response = await knowledgeApi.searchFiles(query)
      files.value = response.data
    } catch (err: any) {
      console.error('搜索文件失败:', err)
      throw err
    }
  }

  // 使用防抖优化搜索（延迟300ms）
  const { debouncedSearch } = useSearchDebounce(async (query: string) => {
    await searchFiles(query)
  }, 300)

  // 监听搜索查询变化，自动触发防抖搜索
  watch(searchQuery, (newQuery) => {
    debouncedSearch(newQuery)
  })

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
   * 导航到文件夹
   */
  const navigateToFolder = (folderId: string) => {
    currentFolderId.value = folderId
    activeTab.value = 'all'
    selectedItems.value.clear()
  }

  /**
   * 打开分享模态框
   */
  const openShareModal = (file: KnowledgeFile) => {
    selectedFile.value = file
    showShareModal.value = true
  }

  /**
   * 获取文件类型图标
   */
  const getFileIcon = (type: FileType) => {
    // 这里应该返回图标组件
    // 具体实现在使用的地方
    return type
  }

  /**
   * 根据文件名获取文件类型
   */
  const getFileTypeFromName = (name: string): FileType => {
    const ext = name.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') return 'pdf'
    if (['doc', 'docx', 'ppt', 'pptx'].includes(ext || '')) return 'doc'
    if (['mp4', 'avi', 'mov'].includes(ext || '')) return 'video'
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return 'image'
    if (ext === 'txt') return 'text'
    return 'other'
  }

  // ===== 新建文件夹 =====

  /**
   * 创建新文件夹
   */
  const createNewFolder = async () => {
    if (!newFolderName.value.trim()) return

    try {
      await folderManager.createFolder(
        newFolderName.value,
        currentFolderId.value,
        newFolderColor.value
      )

      // 重置表单
      newFolderName.value = ''
      newFolderColor.value = '#3b82f6'
      showNewFolderModal.value = false
    } catch (err: any) {
      console.error('创建文件夹失败:', err)
      throw err
    }
  }

  /**
   * 重命名文件夹
   */
  const renameFolder = async (folderId: string, newName: string) => {
    try {
      await folderManager.renameFolder(folderId, newName)
    } catch (err: any) {
      console.error('重命名文件夹失败:', err)
      throw err
    }
  }

  /**
   * 删除文件夹
   */
  const deleteFolder = async (folderId: string) => {
    try {
      await folderManager.deleteFolder(folderId)

      // 同时删除文件夹内的文件和链接
      files.value = files.value.filter(f => f.folderId !== folderId)
      links.value = links.value.filter(l => l.folderId !== folderId)
    } catch (err: any) {
      console.error('删除文件夹失败:', err)
      throw err
    }
  }

  // ===== 链接管理 =====

  /**
   * 加载链接列表
   */
  const loadLinks = async () => {
    try {
      const response = await knowledgeApi.getLinks({
        folderId: currentFolderId.value,
        tab: activeTab.value,
        sortBy: sortBy.value
      })
      links.value = response.data.list
    } catch (err: any) {
      console.error('加载链接失败:', err)
      throw err
    }
  }

  /**
   * 创建链接
   */
  const createLink = async (data: {
    name: string
    url: string
    type: string
    description?: string
    tags?: string[]
  }) => {
    try {
      const response = await knowledgeApi.createLink({
        ...data,
        folderId: currentFolderId.value
      })
      links.value.push(response.data)
      return response.data
    } catch (err: any) {
      console.error('创建链接失败:', err)
      throw err
    }
  }

  /**
   * 更新链接
   */
  const updateLink = async (linkId: string, data: Partial<KnowledgeLink>) => {
    try {
      await knowledgeApi.updateLink(linkId, data)
      links.value = links.value.map(l =>
        l.id === linkId ? { ...l, ...data } : l
      )
    } catch (err: any) {
      console.error('更新链接失败:', err)
      throw err
    }
  }

  /**
   * 删除链接
   */
  const deleteLink = async (linkId: string) => {
    try {
      await knowledgeApi.deleteLink(linkId)
      links.value = links.value.filter(l => l.id !== linkId)
    } catch (err: any) {
      console.error('删除链接失败:', err)
      throw err
    }
  }

  /**
   * 切换链接收藏
   */
  const toggleLinkStar = async (linkId: string) => {
    try {
      await knowledgeApi.toggleLinkStar(linkId)
      links.value = links.value.map(l =>
        l.id === linkId ? { ...l, isStarred: !l.isStarred } : l
      )
    } catch (err: any) {
      console.error('切换链接收藏失败:', err)
      throw err
    }
  }

  /**
   * 移动链接
   */
  const moveLink = async (linkId: string, targetFolderId: string) => {
    try {
      await knowledgeApi.moveLink(linkId, targetFolderId)
      links.value = links.value.map(l =>
        l.id === linkId ? { ...l, folderId: targetFolderId } : l
      )
    } catch (err: any) {
      console.error('移动链接失败:', err)
      throw err
    }
  }

  /**
   * 访问链接（增加浏览量）
   */
  const visitLink = async (linkId: string) => {
    try {
      await knowledgeApi.visitLink(linkId)
      links.value = links.value.map(l =>
        l.id === linkId ? { ...l, views: l.views + 1 } : l
      )
    } catch (err: any) {
      console.error('访问链接失败:', err)
    }
  }

  // ===== 初始化 =====

  /**
   * 初始化数据
   */
  const initialize = async () => {
    try {
      await folderManager.loadFolders()
      await loadFiles()
    } catch (err) {
      console.error('初始化知识库失败:', err)
      throw err
    }
  }

  return {
    // 状态
    currentFolderId: currentFolderId.value,
    files: files.value,
    links: links.value,
    viewMode: viewMode.value,
    searchQuery: searchQuery.value,
    sortBy: sortBy.value,
    selectedItems: selectedItems.value,
    activeTab: activeTab.value,
    sidebarTab: sidebarTab.value,
    showNewFolderModal: showNewFolderModal.value,
    showShareModal: showShareModal.value,
    showMoveModal: showMoveModal.value,
    showDeleteConfirm: showDeleteConfirm.value,
    showAddLinkModal: showAddLinkModal.value,
    selectedFile: selectedFile.value,
    selectedLink: selectedLink.value,
    newFolderName: newFolderName.value,
    newFolderColor: newFolderColor.value,
    folderColors,

    // 计算属性
    currentFolderName,
    currentPath,
    subFolders,
    currentFolderFiles,
    currentFiles,
    currentItems,
    allTags,
    starredFiles,
    recentFiles,
    rootFolders,

    // 文件夹管理
    loadFolders: folderManager.loadFolders,
    createFolder: folderManager.createFolder,
    renameFolder: folderManager.renameFolder,
    deleteFolder: folderManager.deleteFolder,
    getFolderById: folderManager.getFolderById,

    // 文件上传
    uploadState: fileUploader.uploadState,
    uploadError: fileUploader.error,
    uploadLoading: fileUploader.loading,
    openUploadModal: fileUploader.openUploadModal,
    selectFiles: fileUploader.selectFiles,
    removeFile: fileUploader.removeFile,
    uploadFiles: fileUploader.uploadFiles,
    closeUploadModal: fileUploader.closeUploadModal,

    // 文件操作
    loadFiles,
    toggleStar,
    toggleLock,
    deleteFile,
    confirmDeleteFile,
    moveFile,
    duplicateFile,
    searchFiles,
    selectItem,
    toggleSelectAll,

    // 链接操作
    loadLinks,
    createLink,
    updateLink,
    deleteLink,
    toggleLinkStar,
    moveLink,
    visitLink,
    navigateToFolder,
    openShareModal,
    getFileIcon,
    getFileTypeFromName,

    // 新建文件夹
    createNewFolder,

    // 初始化
    initialize
  }
}
