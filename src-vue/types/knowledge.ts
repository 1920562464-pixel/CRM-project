/**
 * 知识库类型定义
 */

export type ViewMode = 'grid' | 'list'
export type FileType = 'folder' | 'pdf' | 'doc' | 'video' | 'image' | 'text' | 'link' | 'other'
export type SortBy = 'name' | 'date' | 'size' | 'views'
export type ActiveTab = 'all' | 'starred' | 'shared' | 'recent' | 'trash'
export type SidebarTab = 'folders' | 'tags' | 'starred' | 'recent'
export type UploadStep = 'select' | 'uploading' | 'success'
export type LinkType = 'website' | 'document' | 'video' | 'image' | 'other'

/**
 * 文件夹节点
 */
export interface FolderNode {
  id: string
  name: string
  parentId: string | null
  children?: FolderNode[]
  icon?: string
  color?: string
  createdAt: string
}

/**
 * 知识链接
 */
export interface KnowledgeLink {
  id: string
  name: string
  url: string
  type: LinkType
  folderId: string | null
  description?: string
  favicon?: string
  views: number
  createdAt: string
  updatedAt: string
  tags: string[]
  isStarred: boolean
  isShared: boolean
  isLocked: boolean
  author: string
  thumbnail?: string
}

/**
 * 知识文件或链接（联合类型）
 */
export type KnowledgeItem = KnowledgeFile | KnowledgeLink

/**
 * 知识文件
 */
export interface KnowledgeFile {
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

/**
 * 评论
 */
export interface Comment {
  id: string
  author: string
  content: string
  createdAt: string
}

/**
 * 上传文件状态
 */
export interface UploadState {
  files: File[]
  progress: number
  step: UploadStep
  folderId: string | null
}

/**
 * API 响应
 */
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * 文件上传进度回调
 */
export type UploadProgressCallback = (progress: number) => void

/**
 * 侧边栏标签
 */
export interface SidebarTabItem {
  id: SidebarTab
  label: string
  icon: any
}
