/**
 * 文件上传 Composable
 */

import { ref } from 'vue'
import type { UploadState, UploadProgressCallback } from '../types/knowledge'
import { knowledgeApi } from '../api/knowledge'

export function useFileUpload() {
  const uploadState = ref<UploadState>({
    files: [],
    progress: 0,
    step: 'select',
    folderId: null
  })

  const error = ref<string | null>(null)
  const loading = ref(false)

  /**
   * 打开上传模态框
   */
  const openUploadModal = (folderId: string | null = null) => {
    uploadState.value.folderId = folderId
    uploadState.value.step = 'select'
    uploadState.value.files = []
    uploadState.value.progress = 0
    error.value = null
  }

  /**
   * 选择文件
   */
  const selectFiles = (files: FileList | File[]) => {
    uploadState.value.files = Array.from(files)
    error.value = null
  }

  /**
   * 移除文件
   */
  const removeFile = (index: number) => {
    uploadState.value.files = uploadState.value.files.filter((_, i) => i !== index)
  }

  /**
   * 上传单个文件
   */
  const uploadSingleFile = async (
    file: File,
    folderId: string | null,
    onProgress?: UploadProgressCallback
  ) => {
    try {
      loading.value = true
      error.value = null

      const response = await knowledgeApi.uploadFile(file, folderId, onProgress)

      return response.data
    } catch (err: any) {
      error.value = err.message || '上传失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 批量上传文件
   */
  const uploadFiles = async (folderId: string | null) => {
    if (uploadState.value.files.length === 0) {
      error.value = '请选择要上传的文件'
      return
    }

    try {
      loading.value = true
      uploadState.value.step = 'uploading'
      error.value = null

      // 模拟进度（如果 API 不支持实时进度，可以用定时器模拟）
      let progress = 0
      const progressInterval = setInterval(() => {
        if (progress < 90) {
          progress += 10
          uploadState.value.progress = progress
        }
      }, 200)

      const response = await knowledgeApi.uploadFiles(
        uploadState.value.files,
        folderId,
        (percent) => {
          uploadState.value.progress = percent
        }
      )

      clearInterval(progressInterval)
      uploadState.value.progress = 100

      // 模拟成功状态显示
      await new Promise(resolve => setTimeout(resolve, 500))
      uploadState.value.step = 'success'

      return response.data
    } catch (err: any) {
      error.value = err.message || '上传失败'
      uploadState.value.step = 'select'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置上传状态
   */
  const resetUpload = () => {
    uploadState.value = {
      files: [],
      progress: 0,
      step: 'select',
      folderId: uploadState.value.folderId
    }
    error.value = null
  }

  /**
   * 关闭上传模态框
   */
  const closeUploadModal = () => {
    setTimeout(() => {
      resetUpload()
    }, 1500) // 等待成功动画完成
  }

  return {
    uploadState: uploadState.value,
    error: error.value,
    loading: loading.value,
    openUploadModal,
    selectFiles,
    removeFile,
    uploadSingleFile,
    uploadFiles,
    resetUpload,
    closeUploadModal
  }
}
