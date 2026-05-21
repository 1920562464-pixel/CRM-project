/**
 * 文件夹管理 Composable
 */

import { ref } from 'vue'
import type { FolderNode } from '../types/knowledge'
import { knowledgeApi } from '../api/knowledge'

export function useFolderManagement() {
  const folders = ref<FolderNode[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 加载所有文件夹
   */
  const loadFolders = async () => {
    try {
      loading.value = true
      error.value = null

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
   * 创建文件夹
   */
  const createFolder = async (
    name: string,
    parentId: string | null,
    color?: string
  ) => {
    try {
      loading.value = true
      error.value = null

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
      error.value = null

      await knowledgeApi.renameFolder(folderId, newName)

      // 更新本地数据
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
      error.value = null

      await knowledgeApi.deleteFolder(folderId)

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

      // 从本地数据中删除
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
   * 获取根文件夹列表
   */
  const getRootFolders = () => {
    return folders.value.filter(f => f.parentId === 'root')
  }

  /**
   * 获取子文件夹列表
   */
  const getSubFolders = (parentId: string) => {
    return folders.value.filter(f => f.parentId === parentId)
  }

  /**
   * 获取文件夹路径
   */
  const getFolderPath = (folderId: string) => {
    const path: FolderNode[] = []
    let current = folders.value.find(f => f.id === folderId)

    while (current) {
      path.unshift(current)
      current = folders.value.find(f => f.id === current.parentId)
    }

    return path
  }

  /**
   * 根据ID获取文件夹
   */
  const getFolderById = (folderId: string) => {
    return folders.value.find(f => f.id === folderId)
  }

  return {
    folders: folders.value,
    loading: loading.value,
    error: error.value,
    loadFolders,
    createFolder,
    renameFolder,
    deleteFolder,
    getRootFolders,
    getSubFolders,
    getFolderPath,
    getFolderById
  }
}
