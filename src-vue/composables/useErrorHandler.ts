/**
 * 统一错误处理 Composable
 */

import { ref } from 'vue'

export function useErrorHandler() {
  const error = ref<string | null>(null)
  const loading = ref(false)

  /**
   * 处理错误
   */
  const handleError = (err: any, defaultMessage = '操作失败') => {
    console.error(err)
    error.value = err?.message || err?.response?.data?.message || defaultMessage
  }

  /**
   * 清除错误
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * 包装异步函数，自动处理错误
   */
  const withErrorHandling = async <T>(
    fn: () => Promise<T>,
    errorMessage = '操作失败'
  ): Promise<T | null> => {
    try {
      loading.value = true
      error.value = null
      return await fn()
    } catch (err: any) {
      handleError(err, errorMessage)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    error: error.value,
    loading: loading.value,
    handleError,
    clearError,
    withErrorHandling
  }
}
