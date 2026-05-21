/**
 * 知识库 API 接口（使用 Mock 数据）
 */

import type {
  FolderNode,
  KnowledgeFile,
  KnowledgeLink,
  LinkType,
  PaginatedResponse,
  UploadProgressCallback,
  ActiveTab,
  SortBy
} from '../types/knowledge'
import { MOCK_FOLDERS, MOCK_FILES, MOCK_LINKS } from '../mock/knowledgeData'

// API 响应类型
interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/**
 * 知识库 API（使用 Mock 数据）
 */
export const knowledgeApi = {
  // ========== 文件夹管理 ==========

  /**
   * 获取所有文件夹
   */
  getFolders: async (): Promise<ApiResponse<FolderNode[]>> => {
    return {
      code: 200,
      message: 'success',
      data: MOCK_FOLDERS
    }
  },

  /**
   * 创建文件夹
   */
  createFolder: async (data: {
    name: string
    parentId: string | null
    color?: string
  }): Promise<ApiResponse<FolderNode>> => {
    const newFolder: FolderNode = {
      id: `folder-${Date.now()}`,
      name: data.name,
      parentId: data.parentId || null,
      createdAt: new Date().toISOString(),
      color: data.color
    }
    return {
      code: 200,
      message: '创建成功',
      data: newFolder
    }
  },

  /**
   * 重命名文件夹
   */
  renameFolder: async (folderId: string, name: string): Promise<ApiResponse<void>> => {
    return {
      code: 200,
      message: '重命名成功',
      data: undefined
    }
  },

  /**
   * 删除文件夹
   */
  deleteFolder: async (folderId: string): Promise<ApiResponse<void>> => {
    return {
      code: 200,
      message: '删除成功',
      data: undefined
    }
  },

  // ========== 文件管理 ==========

  /**
   * 获取文件列表
   */
  getFiles: async (params: {
    folderId?: string | null
    tab?: ActiveTab
    search?: string
    sortBy?: SortBy
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<PaginatedResponse<KnowledgeFile>>> => {
    let filteredFiles = [...MOCK_FILES]

    // 按文件夹筛选
    if (params.folderId && params.folderId !== 'root') {
      filteredFiles = filteredFiles.filter(f => f.folderId === params.folderId)
    } else if (!params.folderId || params.folderId === 'root') {
      // root 文件夹显示所有文件（或者是没有 folderId 的文件）
      filteredFiles = filteredFiles.filter(f => !f.folderId || f.folderId === 'root' || MOCK_FOLDERS.some(folder => folder.id === f.folderId))
    }

    // 按 tab 筛选
    if (params.tab === 'starred') {
      filteredFiles = filteredFiles.filter(f => f.isStarred)
    } else if (params.tab === 'shared') {
      filteredFiles = filteredFiles.filter(f => f.isShared)
    } else if (params.tab === 'trash') {
      filteredFiles = []
    }

    // 搜索筛选
    if (params.search) {
      const search = params.search.toLowerCase()
      filteredFiles = filteredFiles.filter(f =>
        f.name.toLowerCase().includes(search) ||
        f.tags.some(t => t.toLowerCase().includes(search))
      )
    }

    // 排序
    filteredFiles.sort((a, b) => {
      switch (params.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'zh')
        case 'date':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'views':
          return b.views - a.views
        case 'size':
          const sizeA = parseFloat(a.size || '0')
          const sizeB = parseFloat(b.size || '0')
          return sizeB - sizeA
        default:
          return 0
      }
    })

    return {
      code: 200,
      message: 'success',
      data: {
        list: filteredFiles,
        total: filteredFiles.length,
        page: params.page || 1,
        pageSize: params.pageSize || 20
      }
    }
  },

  /**
   * 上传文件
   */
  uploadFile: async (
    file: File,
    folderId: string | null,
    onProgress?: UploadProgressCallback
  ): Promise<ApiResponse<KnowledgeFile>> => {
    // 模拟上传进度
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 50))
        onProgress(i)
      }
    }

    const newFile: KnowledgeFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      type: file.name.split('.').pop() as any || 'other',
      folderId: folderId || 'root',
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      views: 0,
      downloads: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      isStarred: false,
      isShared: false,
      isLocked: false,
      author: '当前用户',
      version: 1
    }

    return {
      code: 200,
      message: '上传成功',
      data: newFile
    }
  },

  /**
   * 批量上传文件
   */
  uploadFiles: async (
    files: File[],
    folderId: string | null,
    onProgress?: UploadProgressCallback
  ): Promise<ApiResponse<KnowledgeFile[]>> => {
    const uploadedFiles: KnowledgeFile[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const result = await knowledgeApi.uploadFile(file, folderId, (progress) => {
        if (onProgress) {
          // 计算总体进度
          const overallProgress = Math.round(((i * 100 + progress) / files.length))
          onProgress(overallProgress)
        }
      })
      uploadedFiles.push(result.data)
    }

    return {
      code: 200,
      message: '上传成功',
      data: uploadedFiles
    }
  },

  /**
   * 删除文件
   */
  deleteFile: async (fileId: string): Promise<ApiResponse<void>> => {
    return {
      code: 200,
      message: '删除成功',
      data: undefined
    }
  },

  /**
   * 批量删除文件
   */
  batchDeleteFiles: async (fileIds: string[]): Promise<ApiResponse<void>> => {
    return {
      code: 200,
      message: `成功删除 ${fileIds.length} 个文件`,
      data: undefined
    }
  },

  /**
   * 移动文件
   */
  moveFile: async (fileId: string, targetFolderId: string): Promise<ApiResponse<void>> => {
    return {
      code: 200,
      message: '移动成功',
      data: undefined
    }
  },

  /**
   * 批量移动文件
   */
  batchMoveFiles: async (
    fileIds: string[],
    targetFolderId: string
  ): Promise<ApiResponse<void>> => {
    return {
      code: 200,
      message: `成功移动 ${fileIds.length} 个文件`,
      data: undefined
    }
  },

  /**
   * 复制文件
   */
  duplicateFile: async (fileId: string): Promise<ApiResponse<KnowledgeFile>> => {
    const originalFile = MOCK_FILES.find(f => f.id === fileId)
    if (!originalFile) {
      throw new Error('文件不存在')
    }

    const duplicatedFile: KnowledgeFile = {
      ...originalFile,
      id: `file-${Date.now()}`,
      name: `${originalFile.name} (副本)`,
      views: 0,
      createdAt: new Date().toISOString()
    }

    return {
      code: 200,
      message: '复制成功',
      data: duplicatedFile
    }
  },

  /**
   * 切换收藏状态
   */
  toggleStar: async (fileId: string): Promise<ApiResponse<void>> => {
    return {
      code: 200,
      message: '操作成功',
      data: undefined
    }
  },

  /**
   * 切换锁定状态
   */
  toggleLock: async (fileId: string): Promise<ApiResponse<void>> => {
    return {
      code: 200,
      message: '操作成功',
      data: undefined
    }
  },

  /**
   * 搜索文件
   */
  searchFiles: async (query: string): Promise<ApiResponse<KnowledgeFile[]>> => {
    const search = query.toLowerCase()
    const results = MOCK_FILES.filter(file =>
      file.name.toLowerCase().includes(search) ||
      file.tags.some(tag => tag.toLowerCase().includes(search))
    )

    return {
      code: 200,
      message: '搜索成功',
      data: results
    }
  },

  /**
   * 获取所有标签
   */
  getTags: async (): Promise<ApiResponse<Array<{ tag: string; count: number }>>> => {
    const tagMap = new Map<string, number>()
    MOCK_FILES.forEach(file => {
      file.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
      })
    })

    const results = Array.from(tagMap.entries()).map(([tag, count]) => ({ tag, count }))
    results.sort((a, b) => b.count - a.count)

    return {
      code: 200,
      message: 'success',
      data: results
    }
  },

  /**
   * 获取收藏文件
   */
  getStarredFiles: async (): Promise<ApiResponse<KnowledgeFile[]>> => {
    return {
      code: 200,
      message: 'success',
      data: MOCK_FILES.filter(f => f.isStarred)
    }
  },

  /**
   * 获取最近访问文件
   */
  getRecentFiles: async (limit = 10): Promise<ApiResponse<KnowledgeFile[]>> => {
    const recent = [...MOCK_FILES]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit)

    return {
      code: 200,
      message: 'success',
      data: recent
    }
  },

  // ========== 链接管理 ==========

  /**
   * 创建链接
   */
  createLink: async (
    data: {
      name: string
      url: string
      type: LinkType
      folderId?: string | null
      description?: string
      tags?: string[]
    }
  ): Promise<ApiResponse<KnowledgeLink>> => {
    const newLink: KnowledgeLink = {
      id: `link-${Date.now()}`,
      name: data.name,
      url: data.url,
      type: data.type,
      folderId: data.folderId || 'root',
      description: data.description,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: data.tags || [],
      isStarred: false,
      isShared: false,
      isLocked: false,
      author: '当前用户'
    }

    return {
      code: 200,
      message: '创建成功',
      data: newLink
    }
  },

  /**
   * 获取链接列表
   */
  getLinks: async (params?: {
    folderId?: string
    tab?: ActiveTab
    sortBy?: SortBy
  }): Promise<ApiResponse<PaginatedResponse<KnowledgeLink>>> => {
    let filteredLinks = [...MOCK_LINKS]

    // 按文件夹筛选
    if (params?.folderId && params.folderId !== 'root') {
      filteredLinks = filteredLinks.filter(l => l.folderId === params.folderId)
    }

    // 按 tab 筛选
    if (params?.tab === 'starred') {
      filteredLinks = filteredLinks.filter(l => l.isStarred)
    } else if (params?.tab === 'shared') {
      filteredLinks = filteredLinks.filter(l => l.isShared)
    }

    // 排序
    if (params?.sortBy) {
      filteredLinks.sort((a, b) => {
        switch (params.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name, 'zh')
          case 'date':
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          case 'views':
            return b.views - a.views
          default:
            return 0
        }
      })
    }

    return {
      code: 200,
      message: 'success',
      data: {
        list: filteredLinks,
        total: filteredLinks.length,
        page: 1,
        pageSize: 20
      }
    }
  },

  /**
   * 获取单个链接
   */
  getLink: async (linkId: string): Promise<ApiResponse<KnowledgeLink>> => {
    const link = MOCK_LINKS.find(l => l.id === linkId)
    if (!link) {
      throw new Error('链接不存在')
    }

    return {
      code: 200,
      message: 'success',
      data: link
    }
  },

  /**
   * 更新链接
   */
  updateLink: async (
    linkId: string,
    data: Partial<KnowledgeLink>
  ): Promise<ApiResponse<void>> => {
    return {
      code: 200,
      message: '更新成功',
      data: undefined
    }
  },

  /**
   * 删除链接
   */
  deleteLink: async (linkId: string): Promise<ApiResponse<void>> => {
    return {
      code: 200,
      message: '删除成功',
      data: undefined
    }
  },

  /**
   * 批量删除链接
   */
  batchDeleteLinks: async (linkIds: string[]): Promise<ApiResponse<void>> => {
    return {
      code: 200,
      message: `成功删除 ${linkIds.length} 个链接`,
      data: undefined
    }
  },

  /**
   * 移动链接
   */
  moveLink: async (
    linkId: string,
    targetFolderId: string
  ): Promise<ApiResponse<void>> => {
    return {
      code: 200,
      message: '移动成功',
      data: undefined
    }
  },

  /**
   * 批量移动链接
   */
  batchMoveLinks: async (
    linkIds: string[],
    targetFolderId: string
  ): Promise<ApiResponse<void>> => {
    return {
      code: 200,
      message: `成功移动 ${linkIds.length} 个链接`,
      data: undefined
    }
  },

  /**
   * 切换链接收藏状态
   */
  toggleLinkStar: async (linkId: string): Promise<ApiResponse<void>> => {
    return {
      code: 200,
      message: '操作成功',
      data: undefined
    }
  },

  /**
   * 搜索链接
   */
  searchLinks: async (query: string): Promise<ApiResponse<KnowledgeLink[]>> => {
    const search = query.toLowerCase()
    const results = MOCK_LINKS.filter(link =>
      link.name.toLowerCase().includes(search) ||
      link.url.toLowerCase().includes(search) ||
      link.tags.some(tag => tag.toLowerCase().includes(search))
    )

    return {
      code: 200,
      message: '搜索成功',
      data: results
    }
  },

  /**
   * 访问链接（增加浏览量）
   */
  visitLink: async (linkId: string): Promise<ApiResponse<void>> => {
    return {
      code: 200,
      message: '访问成功',
      data: undefined
    }
  },

  /**
   * 复制链接
   */
  duplicateLink: async (linkId: string): Promise<ApiResponse<KnowledgeLink>> => {
    const originalLink = MOCK_LINKS.find(l => l.id === linkId)
    if (!originalLink) {
      throw new Error('链接不存在')
    }

    const duplicatedLink: KnowledgeLink = {
      ...originalLink,
      id: `link-${Date.now()}`,
      name: `${originalLink.name} (副本)`,
      views: 0,
      createdAt: new Date().toISOString()
    }

    return {
      code: 200,
      message: '复制成功',
      data: duplicatedLink
    }
  }
}
