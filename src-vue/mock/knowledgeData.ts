/**
 * 知识库 Mock 数据
 */

import type { FolderNode, KnowledgeFile, KnowledgeLink } from '../types/knowledge'

/**
 * Mock 文件夹数据
 */
export const MOCK_FOLDERS: FolderNode[] = [
  { id: 'root', name: '根目录', parentId: null, createdAt: '2024-01-01' },
  { id: 'f1', name: '糖尿病管理', parentId: 'root', createdAt: '2024-01-05', color: '#3b82f6' },
  { id: 'f2', name: '高血压干预', parentId: 'root', createdAt: '2024-01-06', color: '#ef4444' },
  { id: 'f3', name: '营养指导', parentId: 'root', createdAt: '2024-01-07', color: '#10b981' },
  { id: 'f4', name: '运动康复', parentId: 'root', createdAt: '2024-01-08', color: '#f59e0b' },
  { id: 'f5', name: '客户服务', parentId: 'root', createdAt: '2024-01-09', color: '#8b5cf6' },
  { id: 'f1-1', name: '初诊沟通', parentId: 'f1', createdAt: '2024-01-10', color: '#3b82f6' },
  { id: 'f1-2', name: '复诊跟进', parentId: 'f1', createdAt: '2024-01-11', color: '#3b82f6' },
]

/**
 * Mock 文件数据
 */
export const MOCK_FILES: KnowledgeFile[] = [
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

/**
 * 文件夹颜色选项
 */
export const FOLDER_COLORS = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899'
]

/**
 * Mock 链接数据
 */
export const MOCK_LINKS: KnowledgeLink[] = [
  {
    id: 'link1',
    name: '中华医学会糖尿病学分会',
    url: 'https://www.diab.net.cn/',
    type: 'website',
    folderId: 'f1',
    description: '中华医学会糖尿病学分会官方网站，包含最新的糖尿病诊疗指南和学术资源',
    views: 2340,
    createdAt: '2024-01-05',
    updatedAt: '2026-01-20',
    tags: ['官方', '指南', '学术'],
    isStarred: true,
    isShared: true,
    isLocked: false,
    author: '系统管理员',
    favicon: 'https://www.diab.net.cn/favicon.ico'
  },
  {
    id: 'link2',
    name: '国家体育总局 - 科学健身指导',
    url: 'https://www.sport.gov.cn/',
    type: 'website',
    folderId: 'f4',
    description: '国家体育总局官网，提供权威的运动健身指导和建议',
    views: 1890,
    createdAt: '2024-01-08',
    updatedAt: '2026-01-18',
    tags: ['官方', '运动', '指导'],
    isStarred: false,
    isShared: false,
    isLocked: false,
    author: '王教练'
  },
  {
    id: 'link3',
    name: '中国营养学会 - 膳食指南',
    url: 'https://www.cnsoc.org/',
    type: 'document',
    folderId: 'f3',
    description: '中国营养学会官方发布的膳食指南和营养建议',
    views: 3120,
    createdAt: '2024-01-07',
    updatedAt: '2026-01-19',
    tags: ['营养', '官方', '膳食'],
    isStarred: true,
    isShared: true,
    isLocked: false,
    author: '刘营养师'
  },
  {
    id: 'link4',
    name: 'B站 - 运动康复教程合集',
    url: 'https://www.bilibili.com/video/BV1xx411c7mD/',
    type: 'video',
    folderId: 'f4',
    description: 'B站上优质运动康复教程视频合集',
    views: 890,
    createdAt: '2024-02-01',
    updatedAt: '2026-01-15',
    tags: ['视频', '康复', '素材'],
    isStarred: false,
    isShared: false,
    isLocked: false,
    author: '运动康复组'
  },
  {
    id: 'link5',
    name: '健康管理师在线学习平台',
    url: 'https://www.jkglp.org.cn/',
    type: 'other',
    folderId: 'root',
    description: '健康管理师在线学习和考试平台',
    views: 1450,
    createdAt: '2024-01-15',
    updatedAt: '2026-01-10',
    tags: ['学习', '考试', '平台'],
    isStarred: false,
    isShared: true,
    isLocked: false,
    author: '培训部'
  }
]
