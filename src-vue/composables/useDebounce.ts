/**
 * 搜索防抖 Composable
 */

import { ref, watch, onUnmounted } from 'vue'

export function useDebounce() {
  const timeoutId = ref<number | null>(null)

  /**
   * 防抖函数
   * @param fn 要执行的函数
   * @param delay 延迟时间（毫秒）
   */
  const debounce = <T extends (...args: any[]) => any>(
    fn: T,
    delay: number = 300
  ): ((...args: Parameters<T>) => void) => {
    return (...args: Parameters<T>) => {
      if (timeoutId.value !== null) {
        clearTimeout(timeoutId.value)
      }

      timeoutId.value = window.setTimeout(() => {
        fn(...args)
        timeoutId.value = null
      }, delay) as unknown as number
    }
  }

  /**
   * 立即执行并清除待执行的防抖函数
   */
  const flush = () => {
    if (timeoutId.value !== null) {
      clearTimeout(timeoutId.value)
      timeoutId.value = null
    }
  }

  /**
   * 取消防抖
   */
  const cancel = () => {
    flush()
  }

  // 组件卸载时清除定时器
  onUnmounted(() => {
    cancel()
  })

  return {
    debounce,
    flush,
    cancel
  }
}

/**
 * 使用搜索防抖的 Hook
 * @param searchFn 搜索函数
 * @param delay 防抖延迟（毫秒）
 */
export function useSearchDebounce(
  searchFn: (query: string) => void,
  delay: number = 300
) {
  const { debounce } = useDebounce()

  const debouncedSearch = debounce((query: string) => {
    searchFn(query)
  }, delay)

  return {
    debouncedSearch
  }
}
